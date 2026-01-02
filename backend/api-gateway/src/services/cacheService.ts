/**
 * @fileoverview Redis缓存服务
 * @description 提供统一的Redis缓存服务，支持多种缓存策略
 * @module services/cacheService
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { createCacheClient, createCacheStrategyManager, createCacheKeyGenerator } from '@yyc3/redis-cache';
import { logger } from '../config/logger';

/**
 * 缓存配置接口
 */
export interface CacheConfig {
  /** Redis配置 */
  redis: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  /** 默认TTL（秒） */
  defaultTTL?: number;
  /** 键前缀 */
  keyPrefix?: string;
  /** 是否启用缓存 */
  enabled?: boolean;
}

/**
 * 缓存选项接口
 */
export interface CacheOptions {
  /** TTL（秒） */
  ttl?: number;
  /** 自定义键 */
  key?: string;
  /** 标签 */
  tags?: string[];
  /** 是否跳过缓存 */
  skipCache?: boolean;
}

/**
 * 缓存统计接口
 */
export interface CacheStats {
  /** 命中次数 */
  hits: number;
  /** 未命中次数 */
  misses: number;
  /** 命中率 */
  hitRate: number;
  /** 总请求数 */
  total: number;
}

/**
 * Redis缓存服务类
 */
export class CacheService {
  private cacheClient: any;
  private strategyManager: any;
  private keyGenerator: any;
  private config: Required<CacheConfig>;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    total: 0,
  };

  constructor(config: CacheConfig) {
    this.config = {
      redis: config.redis,
      defaultTTL: config.defaultTTL || 300,
      keyPrefix: config.keyPrefix || 'yyc3',
      enabled: config.enabled !== false,
    };
  }

  /**
   * 初始化缓存服务
   */
  async initialize(): Promise<void> {
    try {
      // 创建Redis客户端
      this.cacheClient = await createCacheClient(this.config.redis);

      // 创建策略管理器
      this.strategyManager = createCacheStrategyManager(this.cacheClient, {
        defaultStrategy: 'lru',
      });

      // 创建键生成器
      this.keyGenerator = createCacheKeyGenerator({
        prefix: this.config.keyPrefix,
      });

      logger.info('Redis缓存服务初始化成功', {
        host: this.config.redis.host,
        port: this.config.redis.port,
        db: this.config.redis.db,
      });
    } catch (error) {
      logger.error('Redis缓存服务初始化失败', { error });
      throw error;
    }
  }

  /**
   * 生成缓存键
   * @param key 键
   * @param options 选项
   * @returns 缓存键
   */
  private generateKey(key: string, options?: CacheOptions): string {
    if (options?.key) {
      return options.key;
    }
    return this.keyGenerator.generate(key);
  }

  /**
   * 获取缓存
   * @param key 键
   * @param options 选项
   * @returns 缓存值
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    if (!this.config.enabled || options?.skipCache) {
      return null;
    }

    try {
      const cacheKey = this.generateKey(key, options);
      const value = await this.cacheClient.get(cacheKey);

      if (value !== null) {
        this.stats.hits++;
        logger.debug('缓存命中', { key: cacheKey });
        return value as T;
      }

      this.stats.misses++;
      logger.debug('缓存未命中', { key: cacheKey });
      return null;
    } catch (error) {
      logger.error('获取缓存失败', { key, error });
      return null;
    } finally {
      this.updateStats();
    }
  }

  /**
   * 设置缓存
   * @param key 键
   * @param value 值
   * @param options 选项
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    if (!this.config.enabled || options?.skipCache) {
      return;
    }

    try {
      const cacheKey = this.generateKey(key, options);
      const ttl = options?.ttl || this.config.defaultTTL;

      await this.cacheClient.set(cacheKey, value, { ttl });

      // 如果有标签，添加标签关联
      if (options?.tags && options.tags.length > 0) {
        await this.addTags(cacheKey, options.tags);
      }

      logger.debug('缓存已设置', { key: cacheKey, ttl });
    } catch (error) {
      logger.error('设置缓存失败', { key, error });
    }
  }

  /**
   * 删除缓存
   * @param key 键
   * @param options 选项
   */
  async delete(key: string, options?: CacheOptions): Promise<void> {
    try {
      const cacheKey = this.generateKey(key, options);
      await this.cacheClient.delete(cacheKey);
      logger.debug('缓存已删除', { key: cacheKey });
    } catch (error) {
      logger.error('删除缓存失败', { key, error });
    }
  }

  /**
   * 批量删除缓存
   * @param pattern 模式
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      await this.cacheClient.delete(pattern);
      logger.debug('批量删除缓存', { pattern });
    } catch (error) {
      logger.error('批量删除缓存失败', { pattern, error });
    }
  }

  /**
   * 清除所有缓存
   */
  async clear(): Promise<void> {
    try {
      const pattern = this.keyGenerator.generate('*');
      await this.cacheClient.delete(pattern);
      logger.info('所有缓存已清除');
    } catch (error) {
      logger.error('清除所有缓存失败', { error });
    }
  }

  /**
   * 添加标签
   * @param key 键
   * @param tags 标签列表
   */
  private async addTags(key: string, tags: string[]): Promise<void> {
    try {
      for (const tag of tags) {
        const tagKey = this.keyGenerator.generate('tag', tag);
        await this.cacheClient.sadd(tagKey, key);
      }
    } catch (error) {
      logger.error('添加标签失败', { key, tags, error });
    }
  }

  /**
   * 按标签删除缓存
   * @param tag 标签
   */
  async deleteByTag(tag: string): Promise<void> {
    try {
      const tagKey = this.keyGenerator.generate('tag', tag);
      const keys = await this.cacheClient.smembers(tagKey);

      for (const key of keys) {
        await this.cacheClient.delete(key);
      }

      // 删除标签键
      await this.cacheClient.delete(tagKey);

      logger.info('按标签删除缓存', { tag, count: keys.length });
    } catch (error) {
      logger.error('按标签删除缓存失败', { tag, error });
    }
  }

  /**
   * 获取或设置缓存（缓存穿透保护）
   * @param key 键
   * @param factory 值工厂函数
   * @param options 选项
   * @returns 缓存值
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    // 尝试从缓存获取
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // 调用工厂函数获取值
    const value = await factory();

    // 设置缓存
    await this.set(key, value, options);

    return value;
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    this.stats.total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = this.stats.total > 0
      ? (this.stats.hits / this.stats.total) * 100
      : 0;
  }

  /**
   * 获取统计信息
   * @returns 统计信息
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      total: 0,
    };
    logger.info('缓存统计已重置');
  }

  /**
   * 检查缓存是否启用
   * @returns 是否启用
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * 启用缓存
   */
  enable(): void {
    this.config.enabled = true;
    logger.info('缓存已启用');
  }

  /**
   * 禁用缓存
   */
  disable(): void {
    this.config.enabled = false;
    logger.info('缓存已禁用');
  }

  /**
   * 关闭缓存服务
   */
  async close(): Promise<void> {
    if (this.cacheClient) {
      await this.cacheClient.disconnect();
      logger.info('Redis缓存服务已关闭');
    }
  }
}

// 创建缓存服务单例
export const cacheService = new CacheService({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_CACHE_DB || '0'),
  },
  defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '300'),
  keyPrefix: process.env.CACHE_KEY_PREFIX || 'yyc3',
  enabled: process.env.CACHE_ENABLED !== 'false',
});
