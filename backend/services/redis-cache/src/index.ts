/**
 * @fileoverview Redis缓存服务入口
 * @description 导出所有缓存相关的类和工具函数
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

// 核心缓存客户端
export { RedisCacheClient, RedisCacheClientFactory } from './cache-client';
export type { RedisConfig, CacheOptions, CacheStats, TaggedCacheItem } from './cache-client';

// 缓存策略管理
export {
  CacheStrategyManager,
  HierarchicalCacheManager,
} from './cache-strategy';
export type {
  CacheStrategy,
  CacheStrategyConfig,
  HierarchicalCacheConfig,
  CacheWarmupConfig,
  CacheStatistics,
} from './cache-strategy';

// 缓存工具
export {
  CacheKeyGenerator,
  Cacheable,
  CacheEvict,
  CachePut,
  CacheLock,
  CacheSerializer,
  CacheTime,
} from './cache-utils';
export type { CacheKeyGeneratorConfig } from './cache-utils';

// 日志工具
export { logger } from './utils/logger';

/**
 * 快速初始化Redis缓存客户端
 * @param config Redis配置
 * @returns 缓存客户端实例
 */
export async function createCacheClient(config: RedisConfig): Promise<RedisCacheClient> {
  const client = RedisCacheClientFactory.getInstance(config);
  await client.connect();
  return client;
}

/**
 * 创建缓存策略管理器
 * @param cacheClient 缓存客户端
 * @param strategy 缓存策略
 * @returns 缓存策略管理器实例
 */
export function createCacheStrategyManager(
  cacheClient: RedisCacheClient,
  strategy: CacheStrategy = 'ttl'
): CacheStrategyManager {
  const { CacheStrategyManager } = require('./cache-strategy');
  return new CacheStrategyManager(cacheClient, { strategy });
}

/**
 * 创建分层缓存管理器
 * @returns 分层缓存管理器实例
 */
export function createHierarchicalCacheManager(): HierarchicalCacheManager {
  const { HierarchicalCacheManager } = require('./cache-strategy');
  return new HierarchicalCacheManager();
}

/**
 * 创建缓存键生成器
 * @param config 键生成器配置
 * @returns 缓存键生成器实例
 */
export function createCacheKeyGenerator(
  config?: CacheKeyGeneratorConfig
): CacheKeyGenerator {
  const { CacheKeyGenerator } = require('./cache-utils');
  return new CacheKeyGenerator(config);
}

/**
 * 创建缓存锁
 * @param cacheClient 缓存客户端
 * @param keyGenerator 键生成器
 * @returns 缓存锁实例
 */
export function createCacheLock(
  cacheClient: RedisCacheClient,
  keyGenerator: CacheKeyGenerator
): CacheLock {
  const { CacheLock } = require('./cache-utils');
  return new CacheLock(cacheClient, keyGenerator);
}
