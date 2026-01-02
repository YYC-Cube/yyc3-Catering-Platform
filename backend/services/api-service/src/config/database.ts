/**
 * @fileoverview YYC³数据库配置
 * @description PostgreSQL数据库连接和配置管理
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-09
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */


export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
  maxConnections: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

/**
 * 数据库配置类
 */
export class DatabaseManager {
  private config: DatabaseConfig;
  private pool: any = null;

  constructor() {
    this.config = {
      host: process.env.DATABASE_HOST || '192.168.3.45',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      database: process.env.DATABASE_NAME || 'yyc3_email',
      user: process.env.DATABASE_USER || 'yyc3_email',
      password: process.env.DATABASE_PASSWORD || 'yyc3_admin',
      ssl: process.env.DATABASE_SSL === 'true',
      maxConnections: parseInt(process.env.DB_CONNECTION_LIMIT || '20'),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
      connectionTimeoutMillis: 10000,
    };
  }

  /**
   * 获取数据库连接字符串
   */
  getConnectionString(): string {
    const { host, port, database, user, password, ssl } = this.config;
    const sslParam = ssl ? '?sslmode=require' : '?sslmode=disable';
    return `postgresql://${user}:${password}@${host}:${port}/${database}${sslParam}`;
  }

  /**
   * 创建数据库连接池
   */
  async createPool(): Promise<any> {
    try {
      // 使用Bun的PostgreSQL支持
      const { Pool } = await import('pg');

      this.pool = new Pool({
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.user,
        password: this.config.password,
        ssl: this.config.ssl ? { rejectUnauthorized: false } : false,
        max: this.config.maxConnections,
        idleTimeoutMillis: this.config.idleTimeoutMillis,
        connectionTimeoutMillis: this.config.connectionTimeoutMillis,
      });

      // 测试连接
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      console.log('✅ PostgreSQL连接池创建成功');
      return this.pool;
    } catch (error) {
      console.error('❌ PostgreSQL连接池创建失败:', error);
      throw error;
    }
  }

  /**
   * 获取连接池实例
   */
  getPool(): any {
    if (!this.pool) {
      throw new Error('数据库连接池未初始化，请先调用createPool()');
    }
    return this.pool;
  }

  /**
   * 执行查询
   */
  async query(sql: string, params: any[] = []): Promise<any> {
    const pool = this.getPool();
    const client = await pool.connect();

    try {
      const result = await client.query(sql, params);
      return result;
    } finally {
      client.release();
    }
  }

  /**
   * 执行事务
   */
  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const pool = this.getPool();
    const client = await pool.connect();

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
   * 关闭连接池
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('✅ 数据库连接池已关闭');
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('❌ 数据库健康检查失败:', error);
      return false;
    }
  }

  /**
   * 获取数据库统计信息
   */
  async getStats(): Promise<any> {
    try {
      const pool = this.getPool();
      return {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount,
      };
    } catch (error) {
      console.error('❌ 获取数据库统计信息失败:', error);
      return null;
    }
  }
}

// 导出单例实例
export const dbManager = new DatabaseManager();
export { dbManager as database };