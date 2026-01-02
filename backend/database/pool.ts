/**
 * @file 数据库连接池配置
 * @description 提供PostgreSQL数据库连接池配置和管理
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
interface DatabaseConfig extends PoolConfig {
  /** 数据库主机地址 */
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
  /** 连接空闲超时时间（毫秒） */
  idleTimeoutMillis?: number;
  /** 连接超时时间（毫秒） */
  connectionTimeoutMillis?: number;
}

/**
 * 数据库连接池管理类
 */
export class DatabasePool {
  private static instance: DatabasePool;
  private pool: Pool;
  private isInitialized: boolean = false;

  private constructor() {
    this.pool = this.createPool();
  }

  /**
   * 获取数据库连接池单例
   */
  public static getInstance(): DatabasePool {
    if (!DatabasePool.instance) {
      DatabasePool.instance = new DatabasePool();
    }
    return DatabasePool.instance;
  }

  /**
   * 创建数据库连接池
   */
  private createPool(): Pool {
    const config: DatabaseConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'yyc3_catering',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: parseInt(process.env.DB_POOL_MAX || '20'),
      min: parseInt(process.env.DB_POOL_MIN || '5'),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000'),
    };

    logger.info('Creating database connection pool', {
      host: config.host,
      port: config.port,
      database: config.database,
      max: config.max,
      min: config.min,
    });

    const pool = new Pool(config);

    // 监听连接池事件
    pool.on('connect', (client) => {
      logger.debug('New client connected to database pool');
    });

    pool.on('remove', (client) => {
      logger.debug('Client removed from database pool');
    });

    pool.on('error', (err) => {
      logger.error('Unexpected error on idle client', err);
    });

    return pool;
  }

  /**
   * 初始化数据库连接池
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('Database pool already initialized');
      return;
    }

    try {
      // 测试连接
      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();

      logger.info('Database connection pool initialized successfully', {
        currentTime: result.rows[0].now,
        poolSize: this.pool.totalCount,
      });

      this.isInitialized = true;
    } catch (error) {
      logger.error('Failed to initialize database connection pool', error);
      throw error;
    }
  }

  /**
   * 执行查询
   */
  public async query<T = any>(
    text: string,
    params?: any[]
  ): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;

      logger.debug('Executed query', {
        duration: `${duration}ms`,
        rows: result.rowCount,
      });

      return result;
    } catch (error) {
      logger.error('Query execution failed', {
        query: text,
        params,
        error,
      });
      throw error;
    }
  }

  /**
   * 获取客户端连接
   */
  public async getClient() {
    return await this.pool.connect();
  }

  /**
   * 执行事务
   */
  public async transaction<T>(
    callback: (client: any) => Promise<T>
  ): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 获取连接池统计信息
   */
  public getStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }

  /**
   * 关闭连接池
   */
  public async close(): Promise<void> {
    try {
      await this.pool.end();
      this.isInitialized = false;
      logger.info('Database connection pool closed');
    } catch (error) {
      logger.error('Failed to close database connection pool', error);
      throw error;
    }
  }

  /**
   * 检查连接池健康状态
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      return true;
    } catch (error) {
      logger.error('Database health check failed', error);
      return false;
    }
  }
}

// 导出单例实例
export const dbPool = DatabasePool.getInstance();

/**
 * 数据库连接池中间件
 */
export const dbMiddleware = async (req: any, res: any, next: any) => {
  try {
    req.db = dbPool;
    next();
  } catch (error) {
    logger.error('Database middleware error', error);
    res.status(500).json({
      success: false,
      error: 'Database connection error',
    });
  }
};
