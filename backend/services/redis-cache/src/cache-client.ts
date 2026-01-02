/**
 * @fileoverview Redis缓存客户端
 * @description 提供Redis连接和基础缓存操作
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import Redis from 'ioredis';
import { logger } from './utils/logger';

/**
 * Redis配置接口
 */
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
  enableReadyCheck?: boolean;
  enableOfflineQueue?: boolean;
  connectTimeout?: number;
  lazyConnect?: boolean;
}

/**
 * 缓存选项接口
 */
export interface CacheOptions {
  ttl?: number; // 过期时间（秒）
  compress?: boolean; // 是否压缩
  tags?: string[]; // 缓存标签
}

/**
 * Redis缓存客户端类
 */
export class RedisCacheClient {
  private client: Redis;
  private config: RedisConfig;
  private isConnected: boolean = false;

  constructor(config: RedisConfig) {
    this.config = {
      keyPrefix: 'yyc3:',
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: true,
      connectTimeout: 10000,
      lazyConnect: false,
      ...config,
    };

    this.client = new Redis({
      host: this.config.host,
      port: this.config.port,
      password: this.config.password,
      db: this.config.db || 0,
      retryDelayOnFailover: this.config.retryDelayOnFailover,
      maxRetriesPerRequest: this.config.maxRetriesPerRequest,
      enableReadyCheck: this.config.enableReadyCheck,
      enableOfflineQueue: this.config.enableOfflineQueue,
      connectTimeout: this.config.connectTimeout,
      lazyConnect: this.config.lazyConnect,
    });

    this.setupEventHandlers();
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      this.isConnected = true;
      logger.info('Redis connected', {
        host: this.config.host,
        port: this.config.port,
        db: this.config.db,
      });
    });

    this.client.on('ready', () => {
      logger.info('Redis ready');
    });

    this.client.on('error', (error) => {
      logger.error('Redis error', { error: error.message });
    });

    this.client.on('close', () => {
      this.isConnected = false;
      logger.warn('Redis connection closed');
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis reconnecting...');
    });
  }

  /**
   * 获取键名（添加前缀）
   */
  private getKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }

  /**
   * 设置缓存
   * @param key 键
   * @param value 值
   * @param options 缓存选项
   */
  async set(key: string, value: any, options?: CacheOptions): Promise<void> {
    try {
      const fullKey = this.getKey(key);
      const serializedValue = JSON.stringify(value);

      if (options?.ttl) {
        await this.client.setex(fullKey, options.ttl, serializedValue);
      } else {
        await this.client.set(fullKey, serializedValue);
      }

      // 设置标签
      if (options?.tags && options.tags.length > 0) {
        await this.setTags(key, options.tags);
      }

      logger.debug('Cache set', { key, ttl: options?.ttl });
    } catch (error) {
      logger.error('Failed to set cache', { key, error: error.message });
      throw error;
    }
  }

  /**
   * 获取缓存
   * @param key 键
   * @returns 缓存值
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.getKey(key);
      const value = await this.client.get(fullKey);

      if (value === null) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Failed to get cache', { key, error: error.message });
      return null;
    }
  }

  /**
   * 删除缓存
   * @param key 键
   */
  async delete(key: string): Promise<void> {
    try {
      const fullKey = this.getKey(key);
      await this.client.del(fullKey);

      // 删除标签关联
      await this.deleteTags(key);

      logger.debug('Cache deleted', { key });
    } catch (error) {
      logger.error('Failed to delete cache', { key, error: error.message });
      throw error;
    }
  }

  /**
   * 批量删除缓存
   * @param keys 键数组
   */
  async deleteMultiple(keys: string[]): Promise<void> {
    try {
      const fullKeys = keys.map((key) => this.getKey(key));
      await this.client.del(...fullKeys);

      logger.debug('Multiple caches deleted', { count: keys.length });
    } catch (error) {
      logger.error('Failed to delete multiple caches', { error: error.message });
      throw error;
    }
  }

  /**
   * 检查缓存是否存在
   * @param key 键
   * @returns 是否存在
   */
  async exists(key: string): Promise<boolean> {
    try {
      const fullKey = this.getKey(key);
      const result = await this.client.exists(fullKey);
      return result === 1;
    } catch (error) {
      logger.error('Failed to check cache existence', { key, error: error.message });
      return false;
    }
  }

  /**
   * 设置缓存过期时间
   * @param key 键
   * @param ttl 过期时间（秒）
   */
  async expire(key: string, ttl: number): Promise<void> {
    try {
      const fullKey = this.getKey(key);
      await this.client.expire(fullKey, ttl);

      logger.debug('Cache expiry set', { key, ttl });
    } catch (error) {
      logger.error('Failed to set cache expiry', { key, ttl, error: error.message });
      throw error;
    }
  }

  /**
   * 获取缓存剩余过期时间
   * @param key 键
   * @returns 剩余秒数
   */
  async ttl(key: string): Promise<number> {
    try {
      const fullKey = this.getKey(key);
      return await this.client.ttl(fullKey);
    } catch (error) {
      logger.error('Failed to get cache TTL', { key, error: error.message });
      return -1;
    }
  }

  /**
   * 原子递增
   * @param key 键
   * @param increment 递增量
   * @returns 递增后的值
   */
  async incr(key: string, increment: number = 1): Promise<number> {
    try {
      const fullKey = this.getKey(key);
      return await this.client.incrby(fullKey, increment);
    } catch (error) {
      logger.error('Failed to increment cache', { key, increment, error: error.message });
      throw error;
    }
  }

  /**
   * 原子递减
   * @param key 键
   * @param decrement 递减量
   * @returns 递减后的值
   */
  async decr(key: string, decrement: number = 1): Promise<number> {
    try {
      const fullKey = this.getKey(key);
      return await this.client.decrby(fullKey, decrement);
    } catch (error) {
      logger.error('Failed to decrement cache', { key, decrement, error: error.message });
      throw error;
    }
  }

  /**
   * 设置标签
   * @param key 键
   * @param tags 标签数组
   */
  private async setTags(key: string, tags: string[]): Promise<void> {
    const tagKey = this.getKey(`tags:${key}`);
    await this.client.sadd(tagKey, ...tags);

    // 将键添加到每个标签的集合中
    for (const tag of tags) {
      const tagSetKey = this.getKey(`tag:${tag}`);
      await this.client.sadd(tagSetKey, key);
    }
  }

  /**
   * 删除标签
   * @param key 键
   */
  private async deleteTags(key: string): Promise<void> {
    const tagKey = this.getKey(`tags:${key}`);
    const tags = await this.client.smembers(tagKey);

    // 从每个标签的集合中移除键
    for (const tag of tags) {
      const tagSetKey = this.getKey(`tag:${tag}`);
      await this.client.srem(tagSetKey, key);
    }

    // 删除标签键
    await this.client.del(tagKey);
  }

  /**
   * 根据标签删除缓存
   * @param tag 标签
   */
  async deleteByTag(tag: string): Promise<void> {
    try {
      const tagSetKey = this.getKey(`tag:${tag}`);
      const keys = await this.client.smembers(tagSetKey);

      if (keys.length > 0) {
        await this.deleteMultiple(keys);
      }

      // 删除标签集合
      await this.client.del(tagSetKey);

      logger.debug('Caches deleted by tag', { tag, count: keys.length });
    } catch (error) {
      logger.error('Failed to delete caches by tag', { tag, error: error.message });
      throw error;
    }
  }

  /**
   * 清空所有缓存
   */
  async flushAll(): Promise<void> {
    try {
      await this.client.flushdb();
      logger.info('All caches flushed');
    } catch (error) {
      logger.error('Failed to flush all caches', { error: error.message });
      throw error;
    }
  }

  /**
   * 获取缓存统计信息
   */
  async getStats(): Promise<{
    keyCount: number;
    memoryUsage: string;
    hitRate: number;
  }> {
    try {
      const keyCount = await this.client.dbsize();
      const memoryUsage = await this.client.info('memory');
      const info = await this.client.info('stats');

      // 解析命中率
      const keyspaceHits = parseInt(info.match(/keyspace_hits:(\d+)/)?.[1] || '0');
      const keyspaceMisses = parseInt(info.match(/keyspace_misses:(\d+)/)?.[1] || '0');
      const hitRate = keyspaceHits + keyspaceMisses > 0
        ? keyspaceHits / (keyspaceHits + keyspaceMisses)
        : 0;

      return {
        keyCount,
        memoryUsage: memoryUsage.match(/used_memory_human:(.+)/)?.[1] || 'unknown',
        hitRate,
      };
    } catch (error) {
      logger.error('Failed to get cache stats', { error: error.message });
      return {
        keyCount: 0,
        memoryUsage: 'unknown',
        hitRate: 0,
      };
    }
  }

  /**
   * 连接Redis
   */
  async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.isConnected = true;
    } catch (error) {
      logger.error('Failed to connect to Redis', { error: error.message });
      throw error;
    }
  }

  /**
   * 断开Redis连接
   */
  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Redis disconnected');
    } catch (error) {
      logger.error('Failed to disconnect from Redis', { error: error.message });
      throw error;
    }
  }

  /**
   * 获取Redis客户端实例
   */
  getClient(): Redis {
    return this.client;
  }

  /**
   * 检查是否已连接
   */
  isReady(): boolean {
    return this.isConnected;
  }
}

/**
 * Redis缓存客户端工厂类
 */
export class RedisCacheClientFactory {
  private static instance: RedisCacheClient | null = null;

  /**
   * 获取单例实例
   * @param config Redis配置
   * @returns Redis缓存客户端实例
   */
  static getInstance(config?: RedisConfig): RedisCacheClient {
    if (!this.instance) {
      if (!config) {
        throw new Error('Redis config is required for first initialization');
      }
      this.instance = new RedisCacheClient(config);
    }
    return this.instance;
  }

  /**
   * 重置实例
   */
  static reset(): void {
    this.instance = null;
  }
}
