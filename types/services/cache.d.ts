/**
 * @file 缓存服务类型定义
 * @description Redis 缓存相关类型
 * @author YYC
 * @version 1.0.0
 * @created 2026-01-03
 */

/**
 * 缓存策略枚举
 */
export enum CacheStrategy {
  LRU = 'lru',
  LFU = 'lfu',
  TTL = 'ttl',
  NO_CACHE = 'no_cache',
  WRITE_THROUGH = 'write_through',
  WRITE_BEHIND = 'write_behind'
}

/**
 * 缓存配置接口
 */
export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  defaultTTL?: number;
  maxRetries?: number;
  enableOfflineQueue?: boolean;
}

/**
 * 缓存选项
 */
export interface CacheOptions {
  ttl?: number;
  strategy?: CacheStrategy;
  tags?: string[];
  version?: number;
}

/**
 * 缓存客户端接口
 */
export interface ICacheClient {
  get<T = unknown>(key: string): Promise<T | null>;
  set<T = unknown>(key: string, value: T, options?: CacheOptions): Promise<boolean>;
  del(key: string | string[]): Promise<number>;
  exists(key: string): Promise<boolean>;
  expire(key: string, ttl: number): Promise<boolean>;
  ttl(key: string): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  flush(): Promise<boolean>;
  invalidateByTags(tags: string[]): Promise<number>;
}
