/**
 * @file 数据库配置类型定义
 * @description 数据库相关配置类型
 * @author YYC
 * @version 1.0.0
 * @created 2026-01-03
 */

/**
 * 数据库类型枚举
 */
export enum DatabaseType {
  POSTGRESQL = 'postgresql',
  MYSQL = 'mysql',
  MONGODB = 'mongodb',
  SQLITE = 'sqlite'
}

/**
 * 连接池配置
 */
export interface PoolConfig {
  min: number;
  max: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  acquireTimeoutMillis?: number;
}

/**
 * 数据库配置
 */
export interface DatabaseConfig {
  type: DatabaseType;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  pool?: PoolConfig;
  logging?: boolean;
  synchronize?: boolean;
  migrations?: {
    enabled: boolean;
    table?: string;
    dir?: string;
  };
}

/**
 * Redis 配置
 */
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  defaultTTL?: number;
  maxRetries?: number;
  enableOfflineQueue?: boolean;
}
