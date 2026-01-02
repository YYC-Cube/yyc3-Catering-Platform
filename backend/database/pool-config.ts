/**
 * @file 数据库连接池配置
 * @description 优化的数据库连接池配置，支持连接池管理、健康检查和自动重连
 * @module database
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-22
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Pool, PoolConfig, QueryResult } from 'pg';
import { logger } from '../libs/logger';

/**
 * 数据库连接池配置接口
 */
export interface DatabaseConfig {
  /** 数据库主机 */
  host: string;
  /** 数据库端口 */
  port: number;
  /** 数据库名称 */
  database: string;
  /** 用户名 */
  user: string;
  /** 密码 */
  password: string;
  /** 最大连接数 */
  max?: number;
  /** 最小连接数 */
  min?: number;
  /** 连接空闲超时（毫秒） */
  idleTimeoutMillis?: number;
  /** 连接超时（毫秒） */
  connectionTimeoutMillis?: number;
  /** SSL配置 */
  ssl?: boolean | object;
  /** 应用名称 */
  application_name?: string;
}

/**
 * 数据库连接池管理类
 */
export class DatabasePool {
  private pool: Pool;
  private isHealthy: boolean = true;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor(config: DatabaseConfig) {
    const poolConfig: PoolConfig = {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      max: config.max || 20,
      min: config.min || 2,
      idleTimeoutMillis: config.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: config.connectionTimeoutMillis || 10000,
      ssl: config.ssl || false,
      application_name: config.application_name || 'yyc3-catering-platform',
    };

    this.pool = new Pool(poolConfig);

    // 连接池事件监听
    this.setupEventListeners();

    // 启动健康检查
    this.startHealthCheck();

    logger.info('Database pool initialized', {
      host: config.host,
      port: config.port,
      database: config.database,
      maxConnections: poolConfig.max,
      minConnections: poolConfig.min,
    });
  }

  /**
   * 设置连接池事件监听
   */
  private setupEventListeners(): void {
    // 连接错误
    this.pool.on('error', (err) => {
      logger.error('Unexpected error on idle client', err);
      this.isHealthy = false;
    });

    // 连接获取
    this.pool.on('connect', () => {
      // logger.debug('New client connected');
    });

    // 连接移除
    this.pool.on('remove', () => {
      // logger.debug('Client removed from pool');
    });

    // 连接获取超时
    this.pool.on('acquire', () => {
      // logger.debug('Client acquired from pool');
    });

    // 连接释放
    this.pool.on('release', () => {
      // logger.debug('Client released to pool');
    });
  }

  /**
   * 启动健康检查
   */
  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.checkHealth();
      } catch (error) {
        logger.error('Health check failed', error);
        this.isHealthy = false;
      }
    }, 30000); // 每30秒检查一次
  }

  /**
   * 停止健康检查
   */
  private stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }
  }

  /**
   * 检查数据库健康状态
   */
  public async checkHealth(): Promise<boolean> {
    try {
      const result = await this.pool.query('SELECT 1 as health_check');
      this.isHealthy = true;
      return true;
    } catch (error) {
      logger.error('Database health check failed', error);
      this.isHealthy = false;
      return false;
    }
  }

  /**
   * 执行查询
   */
  public async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();

    try {
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;

      logger.debug('Executed query', {
        duration,
        rows: result.rowCount,
        text: text.substring(0, 100),
      });

      return result;
    } catch (error) {
      logger.error('Query execution failed', {
        error: error.message,
        text: text.substring(0, 100),
      });
      throw error;
    }
  }

  /**
   * 执行事务
   */
  public async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    let result: T;

    try {
      await client.query('BEGIN');
      result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Transaction failed, rolled back', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 获取连接
   */
  public async getClient() {
    return await this.pool.connect();
  }

  /**
   * 获取连接池统计信息
   */
  public getPoolStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
      isHealthy: this.isHealthy,
    };
  }

  /**
   * 关闭连接池
   */
  public async close(): Promise<void> {
    this.stopHealthCheck();
    await this.pool.end();
    logger.info('Database pool closed');
  }

  /**
   * 重启连接池
   */
  public async restart(): Promise<void> {
    logger.info('Restarting database pool');
    await this.close();

    // 重新初始化连接池
    const config = this.pool.options;
    this.pool = new Pool(config);
    this.setupEventListeners();
    this.startHealthCheck();

    logger.info('Database pool restarted');
  }
}

/**
 * 数据库配置工厂
 */
export class DatabaseConfigFactory {
  /**
   * 从环境变量创建配置
   */
  static fromEnv(): DatabaseConfig {
    return {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'yyc3_catering',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: parseInt(process.env.DB_POOL_MAX || '20', 10),
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000', 10),
      ssl: process.env.DB_SSL === 'true',
      application_name: process.env.DB_APP_NAME || 'yyc3-catering-platform',
    };
  }

  /**
   * 创建开发环境配置
   */
  static development(): DatabaseConfig {
    return {
      host: 'localhost',
      port: 5432,
      database: 'yyc3_catering_dev',
      user: 'postgres',
      password: 'postgres',
      max: 10,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      application_name: 'yyc3-catering-dev',
    };
  }

  /**
   * 创建生产环境配置
   */
  static production(): DatabaseConfig {
    return {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'yyc3_catering',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      max: 50,
      min: 5,
      idleTimeoutMillis: 60000,
      connectionTimeoutMillis: 5000,
      ssl: true,
      application_name: 'yyc3-catering-prod',
    };
  }

  /**
   * 创建测试环境配置
   */
  static test(): DatabaseConfig {
    return {
      host: 'localhost',
      port: 5432,
      database: 'yyc3_catering_test',
      user: 'postgres',
      password: 'postgres',
      max: 5,
      min: 1,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
      application_name: 'yyc3-catering-test',
    };
  }
}

/**
 * 全局数据库连接池实例
 */
let globalPool: DatabasePool | null = null;

/**
 * 获取数据库连接池实例
 */
export const getDatabasePool = (): DatabasePool => {
  if (!globalPool) {
    const config = DatabaseConfigFactory.fromEnv();
    globalPool = new DatabasePool(config);
  }
  return globalPool;
};

/**
 * 初始化数据库连接池
 */
export const initDatabasePool = async (config?: DatabaseConfig): Promise<DatabasePool> => {
  if (globalPool) {
    logger.warn('Database pool already initialized');
    return globalPool;
  }

  const dbConfig = config || DatabaseConfigFactory.fromEnv();
  globalPool = new DatabasePool(dbConfig);

  // 等待连接池就绪
  await globalPool.checkHealth();

  return globalPool;
};

/**
 * 关闭数据库连接池
 */
export const closeDatabasePool = async (): Promise<void> => {
  if (globalPool) {
    await globalPool.close();
    globalPool = null;
  }
};

/**
 * 数据库健康检查中间件
 */
export const databaseHealthCheck = async (req: any, res: any, next: any) => {
  try {
    const pool = getDatabasePool();
    const isHealthy = await pool.checkHealth();

    if (isHealthy) {
      next();
    } else {
      res.status(503).json({
        success: false,
        error: 'Database connection is unhealthy',
      });
    }
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Database health check failed',
    });
  }
};
