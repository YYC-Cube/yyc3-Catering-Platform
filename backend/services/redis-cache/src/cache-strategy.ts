/**
 * @fileoverview 缓存策略管理器
 * @description 提供多种缓存策略和高级缓存功能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { RedisCacheClient, CacheOptions } from './cache-client';
import { logger } from './utils/logger';

/**
 * 缓存策略类型
 */
export type CacheStrategy = 'lru' | 'lfu' | 'ttl' | 'tag-based' | 'hierarchical';

/**
 * 缓存策略配置
 */
export interface CacheStrategyConfig {
  strategy: CacheStrategy;
  maxSize?: number; // 最大缓存数量
  maxMemory?: number; // 最大内存使用（MB）
  defaultTTL?: number; // 默认过期时间（秒）
  refreshThreshold?: number; // 刷新阈值（TTL的百分比）
}

/**
 * 分层缓存配置
 */
export interface HierarchicalCacheConfig {
  levels: Array<{
    name: string;
    ttl: number;
    maxSize?: number;
  }>;
}

/**
 * 缓存预热配置
 */
export interface CacheWarmupConfig {
  keys: string[];
  loader: (key: string) => Promise<any>;
  concurrency?: number;
}

/**
 * 缓存统计信息
 */
export interface CacheStatistics {
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
  size: number;
  memoryUsage: string;
}

/**
 * 缓存策略管理器类
 */
export class CacheStrategyManager {
  private cacheClient: RedisCacheClient;
  private config: CacheStrategyConfig;
  private stats: CacheStatistics = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    evictions: 0,
    size: 0,
    memoryUsage: '0B',
  };

  constructor(cacheClient: RedisCacheClient, config: CacheStrategyConfig) {
    this.cacheClient = cacheClient;
    this.config = {
      defaultTTL: 3600, // 默认1小时
      refreshThreshold: 0.2, // 20%时刷新
      ...config,
    };
  }

  /**
   * 获取缓存（带策略）
   * @param key 键
   * @param loader 加载函数
   * @param options 缓存选项
   * @returns 缓存值
   */
  async get<T>(
    key: string,
    loader?: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T | null> {
    try {
      // 尝试从缓存获取
      const cached = await this.cacheClient.get<T>(key);

      if (cached !== null) {
        this.stats.hits++;
        this.updateHitRate();

        // 检查是否需要刷新（TTL策略）
        if (this.config.strategy === 'ttl' && this.config.refreshThreshold) {
          const ttl = await this.cacheClient.ttl(key);
          const defaultTTL = options?.ttl || this.config.defaultTTL || 3600;

          if (ttl > 0 && ttl < defaultTTL * this.config.refreshThreshold) {
            // 异步刷新缓存
            this.refreshCache(key, loader, options).catch((error) => {
              logger.error('Failed to refresh cache', { key, error: error.message });
            });
          }
        }

        return cached;
      }

      // 缓存未命中
      this.stats.misses++;
      this.updateHitRate();

      // 如果提供了加载函数，则加载数据并缓存
      if (loader) {
        const data = await loader();
        await this.set(key, data, options);
        return data;
      }

      return null;
    } catch (error) {
      logger.error('Failed to get cache with strategy', { key, error: error.message });
      return null;
    }
  }

  /**
   * 设置缓存（带策略）
   * @param key 键
   * @param value 值
   * @param options 缓存选项
   */
  async set(key: string, value: any, options?: CacheOptions): Promise<void> {
    try {
      const ttl = options?.ttl || this.config.defaultTTL;
      await this.cacheClient.set(key, value, { ...options, ttl });

      // LRU策略：记录访问时间
      if (this.config.strategy === 'lru') {
        await this.recordAccess(key);
      }

      // LFU策略：记录访问频率
      if (this.config.strategy === 'lfu') {
        await this.incrementAccess(key);
      }

      // 检查缓存大小限制
      if (this.config.maxSize || this.config.maxMemory) {
        await this.evictIfNeeded();
      }
    } catch (error) {
      logger.error('Failed to set cache with strategy', { key, error: error.message });
      throw error;
    }
  }

  /**
   * 删除缓存
   * @param key 键
   */
  async delete(key: string): Promise<void> {
    await this.cacheClient.delete(key);
  }

  /**
   * 批量删除缓存
   * @param pattern 键模式
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      const client = this.cacheClient.getClient();
      const keys = await client.keys(pattern);

      if (keys.length > 0) {
        await this.cacheClient.deleteMultiple(keys);
        logger.debug('Caches deleted by pattern', { pattern, count: keys.length });
      }
    } catch (error) {
      logger.error('Failed to delete caches by pattern', { pattern, error: error.message });
      throw error;
    }
  }

  /**
   * 刷新缓存
   * @param key 键
   * @param loader 加载函数
   * @param options 缓存选项
   */
  private async refreshCache<T>(
    key: string,
    loader?: () => Promise<T>,
    options?: CacheOptions
  ): Promise<void> {
    if (!loader) {
      return;
    }

    try {
      const data = await loader();
      await this.set(key, data, options);
      logger.debug('Cache refreshed', { key });
    } catch (error) {
      logger.error('Failed to refresh cache', { key, error: error.message });
    }
  }

  /**
   * 记录访问时间（LRU策略）
   * @param key 键
   */
  private async recordAccess(key: string): Promise<void> {
    try {
      const client = this.cacheClient.getClient();
      const accessKey = `access:${key}`;
      await client.set(accessKey, Date.now());
    } catch (error) {
      logger.error('Failed to record access', { key, error: error.message });
    }
  }

  /**
   * 增加访问计数（LFU策略）
   * @param key 键
   */
  private async incrementAccess(key: string): Promise<void> {
    try {
      const client = this.cacheClient.getClient();
      const accessKey = `access:${key}`;
      await client.incr(accessKey);
    } catch (error) {
      logger.error('Failed to increment access', { key, error: error.message });
    }
  }

  /**
   * 检查并执行缓存淘汰
   */
  private async evictIfNeeded(): Promise<void> {
    try {
      const stats = await this.cacheClient.getStats();

      // 检查大小限制
      if (this.config.maxSize && stats.keyCount > this.config.maxSize) {
        await this.evictByLRU();
      }

      // 检查内存限制（简化处理）
      if (this.config.maxMemory) {
        // 这里需要更复杂的内存监控逻辑
        logger.warn('Memory limit checking not fully implemented');
      }
    } catch (error) {
      logger.error('Failed to check eviction', { error: error.message });
    }
  }

  /**
   * 按LRU策略淘汰缓存
   */
  private async evictByLRU(): Promise<void> {
    try {
      const client = this.cacheClient.getClient();
      const keys = await client.keys('access:*');

      // 获取所有访问时间
      const accessTimes: Array<{ key: string; time: number }> = [];
      for (const accessKey of keys) {
        const time = await client.get(accessKey);
        if (time) {
          const cacheKey = accessKey.replace('access:', '');
          accessTimes.push({ key: cacheKey, time: parseInt(time) });
        }
      }

      // 按访问时间排序（最旧的在前）
      accessTimes.sort((a, b) => a.time - b.time);

      // 淘汰最旧的10%
      const evictCount = Math.ceil(accessTimes.length * 0.1);
      const keysToEvict = accessTimes.slice(0, evictCount).map((item) => item.key);

      await this.cacheClient.deleteMultiple(keysToEvict);

      // 清理访问记录
      await client.del(...keysToEvict.map((key) => `access:${key}`));

      this.stats.evictions += evictCount;
      logger.info('Cache evicted by LRU', { count: evictCount });
    } catch (error) {
      logger.error('Failed to evict by LRU', { error: error.message });
    }
  }

  /**
   * 缓存预热
   * @param config 预热配置
   */
  async warmup(config: CacheWarmupConfig): Promise<void> {
    const { keys, loader, concurrency = 5 } = config;

    logger.info('Starting cache warmup', { count: keys.length });

    const chunks = this.chunkArray(keys, concurrency);

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(async (key) => {
          try {
            const data = await loader(key);
            await this.set(key, data);
            logger.debug('Cache warmed up', { key });
          } catch (error) {
            logger.error('Failed to warm up cache', { key, error: error.message });
          }
        })
      );
    }

    logger.info('Cache warmup completed');
  }

  /**
   * 获取缓存统计信息
   */
  async getStatistics(): Promise<CacheStatistics> {
    const redisStats = await this.cacheClient.getStats();

    return {
      ...this.stats,
      size: redisStats.keyCount,
      memoryUsage: redisStats.memoryUsage,
    };
  }

  /**
   * 重置统计信息
   */
  resetStatistics(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      evictions: 0,
      size: 0,
      memoryUsage: '0B',
    };
  }

  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * 分块数组
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * 获取配置
   */
  getConfig(): CacheStrategyConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   * @param config 新配置
   */
  updateConfig(config: Partial<CacheStrategyConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('Cache strategy config updated', { config: this.config });
  }
}

/**
 * 分层缓存管理器类
 */
export class HierarchicalCacheManager {
  private levels: Map<string, CacheStrategyManager> = new Map();

  /**
   * 添加缓存层级
   * @param name 层级名称
   * @param config 缓存配置
   * @param cacheClient 缓存客户端
   */
  addLevel(
    name: string,
    config: CacheStrategyConfig,
    cacheClient: RedisCacheClient
  ): void {
    const manager = new CacheStrategyManager(cacheClient, config);
    this.levels.set(name, manager);
    logger.info('Cache level added', { name, strategy: config.strategy });
  }

  /**
   * 获取缓存（从所有层级查找）
   * @param key 键
   * @param loader 加载函数
   * @returns 缓存值
   */
  async get<T>(key: string, loader?: () => Promise<T>): Promise<T | null> {
    // 按层级顺序查找
    for (const [levelName, manager] of this.levels.entries()) {
      const value = await manager.get(key);
      if (value !== null) {
        // 将数据提升到更高层级
        await this.promoteToHigherLevels(key, value, levelName);
        return value;
      }
    }

    // 所有层级都未命中
    if (loader) {
      const data = await loader();
      // 将数据存储到所有层级
      await this.set(key, data);
      return data;
    }

    return null;
  }

  /**
   * 设置缓存（存储到所有层级）
   * @param key 键
   * @param value 值
   */
  async set(key: string, value: any): Promise<void> {
    const promises = Array.from(this.levels.values()).map((manager) =>
      manager.set(key, value)
    );
    await Promise.all(promises);
  }

  /**
   * 删除缓存（从所有层级删除）
   * @param key 键
   */
  async delete(key: string): Promise<void> {
    const promises = Array.from(this.levels.values()).map((manager) =>
      manager.delete(key)
    );
    await Promise.all(promises);
  }

  /**
   * 将数据提升到更高层级
   * @param key 键
   * @param value 值
   * @param currentLevel 当前层级
   */
  private async promoteToHigherLevels(
    key: string,
    value: any,
    currentLevel: string
  ): Promise<void> {
    const levelNames = Array.from(this.levels.keys());
    const currentIndex = levelNames.indexOf(currentLevel);

    if (currentIndex <= 0) {
      return; // 已经是最高层级
    }

    // 提升到更高层级
    for (let i = 0; i < currentIndex; i++) {
      const levelName = levelNames[i];
      const manager = this.levels.get(levelName);
      if (manager) {
        await manager.set(key, value);
      }
    }
  }

  /**
   * 获取所有层级的统计信息
   */
  async getAllStatistics(): Promise<Map<string, CacheStatistics>> {
    const stats = new Map<string, CacheStatistics>();

    for (const [name, manager] of this.levels.entries()) {
      stats.set(name, await manager.getStatistics());
    }

    return stats;
  }

  /**
   * 清空所有层级
   */
  async flushAll(): Promise<void> {
    const promises = Array.from(this.levels.values()).map(async (manager) => {
      const client = manager['cacheClient'];
      await client.flushAll();
    });
    await Promise.all(promises);
  }
}
