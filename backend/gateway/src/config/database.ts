/**
 * YYC³餐饮行业智能化平台 - 数据库配置
 * 支持多租户、读写分离、连接池管理
 */

import { Pool, PoolConfig } from 'pg';
import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  pool?: {
    min: number;
    max: number;
    idleTimeoutMillis: number;
    acquireTimeoutMillis: number;
  };
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  database?: number;
  keyPrefix?: string;
}

export interface MultiTenantConfig {
  enabled: boolean;
  tenantIdHeader?: string;
  defaultDatabase?: string;
}

class DatabaseManager {
  private masterPool: Pool | null = null;
  private replicaPools: Pool[] = [];
  private redisClient: RedisClientType | null = null;
  private logger;
  private config: {
    master: DatabaseConfig;
    replicas?: DatabaseConfig[];
    redis: RedisConfig;
    multiTenant: MultiTenantConfig;
  };

  constructor(config: {
    master: DatabaseConfig;
    replicas?: DatabaseConfig[];
    redis: RedisConfig;
    multiTenant: MultiTenantConfig;
  }) {
    this.config = config;
    this.logger = logger;
  }

  /**
   * 初始化数据库连接
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing database connections...');

      // 初始化主数据库连接池
      await this.initializeMasterPool();

      // 初始化从数据库连接池
      if (this.config.replicas && this.config.replicas.length > 0) {
        await this.initializeReplicaPools();
      }

      // 初始化Redis连接
      await this.initializeRedis();

      this.logger.info('Database connections initialized successfully');

    } catch (error) {
      this.logger.error('Failed to initialize database connections:', error);
      throw error;
    }
  }

  /**
   * 获取主数据库连接（用于写操作）
   */
  async getMasterConnection(): Promise<Pool> {
    if (!this.masterPool) {
      throw new Error('Master database pool not initialized');
    }

    try {
      // 测试连接
      const client = await this.masterPool.connect();
      await client.query('SELECT 1');
      client.release();
      return this.masterPool;
    } catch (error) {
      this.logger.error('Failed to get master database connection:', error);
      throw error;
    }
  }

  /**
   * 获取从数据库连接（用于读操作）
   */
  async getReplicaConnection(): Promise<Pool> {
    if (this.replicaPools.length === 0) {
      // 如果没有从库，返回主库
      return this.getMasterConnection();
    }

    // 简单的负载均衡：随机选择一个可用的从库
    const availablePools = this.replicaPools.filter(pool => pool.totalCount < pool.options.max);

    if (availablePools.length === 0) {
      this.logger.warn('All replica pools are at capacity, falling back to master');
      return this.getMasterConnection();
    }

    const randomIndex = Math.floor(Math.random() * availablePools.length);
    const selectedPool = availablePools[randomIndex];

    try {
      const client = await selectedPool.connect();
      await client.query('SELECT 1');
      client.release();
      return selectedPool;
    } catch (error) {
      this.logger.error('Failed to get replica database connection:', error);
      // 降级到主库
      return this.getMasterConnection();
    }
  }

  /**
   * 获取Redis客户端
   */
  async getRedisClient(): Promise<RedisClientType> {
    if (!this.redisClient) {
      throw new Error('Redis client not initialized');
    }

    try {
      // 测试连接
      await this.redisClient.ping();
      return this.redisClient;
    } catch (error) {
      this.logger.error('Failed to get Redis connection:', error);
      throw error;
    }
  }

  /**
   * 执行查询（自动选择读/写库）
   */
  async query(
    sql: string,
    params?: any[],
    options?: {
      useMaster?: boolean;
      tenantId?: string;
    }
  ): Promise<any> {
    const pool = options?.useMaster
      ? await this.getMasterConnection()
      : await this.getReplicaConnection();

    let finalSql = sql;

    // 处理多租户
    if (this.config.multiTenant.enabled && options?.tenantId) {
      finalSql = this.applyTenantFilter(sql, options.tenantId);
    }

    try {
      const result = await pool.query(finalSql, params);
      return result;
    } catch (error) {
      this.logger.error('Database query error:', {
        sql: finalSql,
        params,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 执行事务
   */
  async transaction<T>(
    callback: (client: any) => Promise<T>,
    options?: {
      tenantId?: string;
    }
  ): Promise<T> {
    const pool = await this.getMasterConnection();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 设置租户上下文
      if (this.config.multiTenant.enabled && options?.tenantId) {
        await client.query('SET app.current_tenant_id = $1', [options.tenantId]);
      }

      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Transaction error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{
    master: boolean;
    replicas: boolean[];
    redis: boolean;
  }> {
    const health = {
      master: false,
      replicas: [] as boolean[],
      redis: false
    };

    // 检查主库
    try {
      await this.getMasterConnection();
      health.master = true;
    } catch (error) {
      health.master = false;
    }

    // 检查从库
    for (let i = 0; i < this.replicaPools.length; i++) {
      try {
        const client = await this.replicaPools[i].connect();
        await client.query('SELECT 1');
        client.release();
        health.replicas.push(true);
      } catch (error) {
        health.replicas.push(false);
      }
    }

    // 检查Redis
    try {
      await this.getRedisClient();
      health.redis = true;
    } catch (error) {
      health.redis = false;
    }

    return health;
  }

  /**
   * 获取连接池统计信息
   */
  getPoolStats(): {
    master: any;
    replicas: any[];
  } {
    return {
      master: this.masterPool ? {
        totalCount: this.masterPool.totalCount,
        idleCount: this.masterPool.idleCount,
        waitingCount: this.masterPool.waitingCount
      } : null,
      replicas: this.replicaPools.map(pool => ({
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount
      }))
    };
  }

  /**
   * 关闭所有连接
   */
  async close(): Promise<void> {
    try {
      this.logger.info('Closing database connections...');

      // 关闭主库连接池
      if (this.masterPool) {
        await this.masterPool.end();
        this.masterPool = null;
      }

      // 关闭从库连接池
      for (const pool of this.replicaPools) {
        await pool.end();
      }
      this.replicaPools = [];

      // 关闭Redis连接
      if (this.redisClient) {
        await this.redisClient.quit();
        this.redisClient = null;
      }

      this.logger.info('Database connections closed successfully');

    } catch (error) {
      this.logger.error('Error closing database connections:', error);
      throw error;
    }
  }

  /**
   * 私有方法
   */
  private async initializeMasterPool(): Promise<void> {
    const poolConfig: PoolConfig = {
      host: this.config.master.host,
      port: this.config.master.port,
      database: this.config.master.database,
      user: this.config.master.username,
      password: this.config.master.password,
      ssl: this.config.master.ssl ? { rejectUnauthorized: false } : false,
      max: this.config.master.pool?.max || 20,
      min: this.config.master.pool?.min || 5,
      idleTimeoutMillis: this.config.master.pool?.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: 2000,
      statement_timeout: 30000,
      query_timeout: 30000
    };

    this.masterPool = new Pool(poolConfig);

    // 监听连接池事件
    this.masterPool.on('connect', () => {
      this.logger.debug('Master database connected');
    });

    this.masterPool.on('error', (error) => {
      this.logger.error('Master database pool error:', error);
    });

    // 测试连接
    const client = await this.masterPool.connect();
    await client.query('SELECT 1');
    client.release();

    this.logger.info('Master database pool initialized');
  }

  private async initializeReplicaPools(): Promise<void> {
    for (const replicaConfig of this.config.replicas!) {
      const poolConfig: PoolConfig = {
        host: replicaConfig.host,
        port: replicaConfig.port,
        database: replicaConfig.database,
        user: replicaConfig.username,
        password: replicaConfig.password,
        ssl: replicaConfig.ssl ? { rejectUnauthorized: false } : false,
        max: replicaConfig.pool?.max || 15,
        min: replicaConfig.pool?.min || 3,
        idleTimeoutMillis: replicaConfig.pool?.idleTimeoutMillis || 30000,
        connectionTimeoutMillis: 2000,
        statement_timeout: 30000,
        query_timeout: 30000
      };

      const pool = new Pool(poolConfig);

      // 监听连接池事件
      pool.on('connect', () => {
        this.logger.debug(`Replica database connected (${replicaConfig.host}:${replicaConfig.port})`);
      });

      pool.on('error', (error) => {
        this.logger.error(`Replica database pool error (${replicaConfig.host}:${replicaConfig.port}):`, error);
      });

      // 测试连接
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();

      this.replicaPools.push(pool);
    }

    this.logger.info(`Initialized ${this.replicaPools.length} replica database pools`);
  }

  private async initializeRedis(): Promise<void> {
    this.redisClient = createClient({
      socket: {
        host: this.config.redis.host,
        port: this.config.redis.port
      },
      password: this.config.redis.password,
      database: this.config.redis.database || 0
    });

    // 键前缀已在创建客户端时设置

    // 监听Redis事件
    this.redisClient.on('connect', () => {
      this.logger.debug('Redis connected');
    });

    this.redisClient.on('error', (error) => {
      this.logger.error('Redis client error:', error);
    });

    this.redisClient.on('ready', () => {
      this.logger.info('Redis client ready');
    });

    // 连接Redis
    await this.redisClient.connect();
  }

  private applyTenantFilter(sql: string, tenantId: string): string {
    // 简单的租户过滤逻辑
    // 实际实现应该更复杂，支持不同的租户隔离策略

    // 如果SQL已经包含租户过滤，直接返回
    if (sql.includes('tenant_id') || sql.includes('tenantId')) {
      return sql;
    }

    // 添加租户过滤条件
    const lowerSql = sql.toLowerCase();

    // SELECT查询
    if (lowerSql.includes('select') && !lowerSql.includes('where')) {
      return `${sql} WHERE tenant_id = '${tenantId}'`;
    }

    if (lowerSql.includes('select') && lowerSql.includes('where')) {
      return `${sql} AND tenant_id = '${tenantId}'`;
    }

    // INSERT查询
    if (lowerSql.includes('insert')) {
      // 找到VALUES子句并在其中添加tenant_id
      const valuesIndex = lowerSql.indexOf('values');
      if (valuesIndex !== -1) {
        const beforeValues = sql.substring(0, valuesIndex);
        const afterValues = sql.substring(valuesIndex);

        // 添加tenant_id到列列表
        const columnsMatch = sql.match(/\(([^)]+)\)/);
        if (columnsMatch) {
          const columns = columnsMatch[1];
          const newColumns = `${columns}, tenant_id`;
          const newSql = sql.replace(columnsMatch[0], `(${newColumns})`);

          // 添加tenant_id到值列表
          return `${newSql.substring(0, valuesIndex)} VALUES (${afterValues.substring(8)}, '${tenantId}')`;
        }
      }
    }

    return sql;
  }
}

// 创建单例实例
let databaseManager: DatabaseManager | null = null;

export function createDatabaseManager(config: {
  master: DatabaseConfig;
  replicas?: DatabaseConfig[];
  redis: RedisConfig;
  multiTenant: MultiTenantConfig;
}): DatabaseManager {
  if (!databaseManager) {
    databaseManager = new DatabaseManager(config);
  }
  return databaseManager;
}

export function getDatabaseManager(): DatabaseManager {
  if (!databaseManager) {
    throw new Error('Database manager not initialized. Call createDatabaseManager first.');
  }
  return databaseManager;
}

// 导出类型
export { DatabaseManager };