/**
 * @fileoverview 缓存工具类
 * @description 提供实用的缓存辅助功能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { RedisCacheClient } from './cache-client';
import { CacheStrategyManager } from './cache-strategy';
import { logger } from './utils/logger';

/**
 * 缓存键生成器配置
 */
export interface CacheKeyGeneratorConfig {
  prefix?: string;
  separator?: string;
  version?: string;
}

/**
 * 缓存键生成器类
 */
export class CacheKeyGenerator {
  private config: Required<CacheKeyGeneratorConfig>;

  constructor(config: CacheKeyGeneratorConfig = {}) {
    this.config = {
      prefix: '',
      separator: ':',
      version: 'v1',
      ...config,
    };
  }

  /**
   * 生成缓存键
   * @param parts 键的各个部分
   * @returns 完整的缓存键
   */
  generate(...parts: string[]): string {
    const key = parts.join(this.config.separator);
    const partsWithPrefix = this.config.prefix ? [this.config.prefix, key] : [key];
    const partsWithVersion = this.config.version
      ? [...partsWithPrefix, this.config.version]
      : partsWithPrefix;
    return partsWithVersion.join(this.config.separator);
  }

  /**
   * 生成用户相关缓存键
   * @param userId 用户ID
   * @param resource 资源名称
   * @param identifier 资源标识符
   * @returns 缓存键
   */
  user(userId: string, resource: string, identifier?: string): string {
    return identifier
      ? this.generate('user', userId, resource, identifier)
      : this.generate('user', userId, resource);
  }

  /**
   * 生成订单相关缓存键
   * @param orderId 订单ID
   * @param field 字段名称
   * @returns 缓存键
   */
  order(orderId: string, field?: string): string {
    return field ? this.generate('order', orderId, field) : this.generate('order', orderId);
  }

  /**
   * 生成菜品相关缓存键
   * @param dishId 菜品ID
   * @param field 字段名称
   * @returns 缓存键
   */
  dish(dishId: string, field?: string): string {
    return field ? this.generate('dish', dishId, field) : this.generate('dish', dishId);
  }

  /**
   * 生成分类相关缓存键
   * @param categoryId 分类ID
   * @param field 字段名称
   * @returns 缓存键
   */
  category(categoryId: string, field?: string): string {
    return field
      ? this.generate('category', categoryId, field)
      : this.generate('category', categoryId);
  }

  /**
   * 生成列表缓存键
   * @param resource 资源名称
   * @param params 查询参数
   * @returns 缓存键
   */
  list(resource: string, params: Record<string, any>): string {
    const paramString = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    return this.generate('list', resource, this.hash(paramString));
  }

  /**
   * 生成聚合缓存键
   * @param resource 资源名称
   * @param type 聚合类型
   * @param params 查询参数
   * @returns 缓存键
   */
  aggregate(resource: string, type: string, params: Record<string, any>): string {
    const paramString = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    return this.generate('aggregate', resource, type, this.hash(paramString));
  }

  /**
   * 简单的哈希函数
   * @param str 字符串
   * @returns 哈希值
   */
  private hash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 解析缓存键
   * @param key 缓存键
   * @returns 解析后的部分
   */
  parse(key: string): string[] {
    return key.split(this.config.separator);
  }

  /**
   * 获取配置
   */
  getConfig(): Required<CacheKeyGeneratorConfig> {
    return { ...this.config };
  }
}

/**
 * 缓存装饰器工厂
 */
export function Cacheable(
  cacheClient: RedisCacheClient,
  keyGenerator: CacheKeyGenerator,
  options: {
    ttl?: number;
    keyPrefix?: string;
    condition?: (...args: any[]) => boolean;
  } = {}
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // 检查条件
      if (options.condition && !options.condition.call(this, ...args)) {
        return originalMethod.apply(this, args);
      }

      // 生成缓存键
      const key = options.keyPrefix
        ? keyGenerator.generate(options.keyPrefix, propertyKey, ...args.map(String))
        : keyGenerator.generate('method', propertyKey, ...args.map(String));

      try {
        // 尝试从缓存获取
        const cached = await cacheClient.get(key);
        if (cached !== null) {
          logger.debug('Cache hit', { key, method: propertyKey });
          return cached;
        }

        // 执行原方法
        const result = await originalMethod.apply(this, args);

        // 缓存结果
        await cacheClient.set(key, result, { ttl: options.ttl });
        logger.debug('Cache set', { key, method: propertyKey });

        return result;
      } catch (error) {
        logger.error('Cache decorator error', { key, error: error.message });
        // 缓存失败时，仍然执行原方法
        return originalMethod.apply(this, args);
      }
    };

    return descriptor;
  };
}

/**
 * 缓存失效装饰器工厂
 */
export function CacheEvict(
  cacheClient: RedisCacheClient,
  keyGenerator: CacheKeyGenerator,
  options: {
    keyPrefix?: string;
    pattern?: string;
    condition?: (...args: any[]) => boolean;
  } = {}
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // 检查条件
      if (options.condition && !options.condition.call(this, ...args)) {
        return originalMethod.apply(this, args);
      }

      try {
        // 执行原方法
        const result = await originalMethod.apply(this, args);

        // 删除缓存
        if (options.pattern) {
          await cacheClient.deletePattern(options.pattern);
          logger.debug('Cache evicted by pattern', { pattern: options.pattern });
        } else {
          const key = options.keyPrefix
            ? keyGenerator.generate(options.keyPrefix, propertyKey, ...args.map(String))
            : keyGenerator.generate('method', propertyKey, ...args.map(String));
          await cacheClient.delete(key);
          logger.debug('Cache evicted', { key });
        }

        return result;
      } catch (error) {
        logger.error('Cache evict decorator error', { error: error.message });
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * 缓存更新装饰器工厂
 */
export function CachePut(
  cacheClient: RedisCacheClient,
  keyGenerator: CacheKeyGenerator,
  options: {
    ttl?: number;
    keyPrefix?: string;
    condition?: (...args: any[]) => boolean;
  } = {}
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // 检查条件
      if (options.condition && !options.condition.call(this, ...args)) {
        return originalMethod.apply(this, args);
      }

      // 执行原方法
      const result = await originalMethod.apply(this, args);

      // 更新缓存
      const key = options.keyPrefix
        ? keyGenerator.generate(options.keyPrefix, propertyKey, ...args.map(String))
        : keyGenerator.generate('method', propertyKey, ...args.map(String));

      try {
        await cacheClient.set(key, result, { ttl: options.ttl });
        logger.debug('Cache updated', { key, method: propertyKey });
      } catch (error) {
        logger.error('Cache put decorator error', { key, error: error.message });
      }

      return result;
    };

    return descriptor;
  };
}

/**
 * 缓存锁类
 */
export class CacheLock {
  private cacheClient: RedisCacheClient;
  private keyGenerator: CacheKeyGenerator;

  constructor(cacheClient: RedisCacheClient, keyGenerator: CacheKeyGenerator) {
    this.cacheClient = cacheClient;
    this.keyGenerator = keyGenerator;
  }

  /**
   * 获取锁
   * @param name 锁名称
   * @param ttl 锁过期时间（秒）
   * @returns 是否获取成功
   */
  async acquire(name: string, ttl: number = 30): Promise<boolean> {
    const key = this.keyGenerator.generate('lock', name);
    const client = this.cacheClient.getClient();

    try {
      // 使用SET NX EX命令实现分布式锁
      const result = await client.set(key, '1', {
        NX: true,
        EX: ttl,
      });

      const acquired = result === 'OK';
      if (acquired) {
        logger.debug('Lock acquired', { name, ttl });
      } else {
        logger.debug('Lock not acquired', { name });
      }

      return acquired;
    } catch (error) {
      logger.error('Failed to acquire lock', { name, error: error.message });
      return false;
    }
  }

  /**
   * 释放锁
   * @param name 锁名称
   */
  async release(name: string): Promise<void> {
    const key = this.keyGenerator.generate('lock', name);
    const client = this.cacheClient.getClient();

    try {
      await client.del(key);
      logger.debug('Lock released', { name });
    } catch (error) {
      logger.error('Failed to release lock', { name, error: error.message });
    }
  }

  /**
   * 尝试获取锁（带重试）
   * @param name 锁名称
   * @param ttl 锁过期时间（秒）
   * @param timeout 超时时间（毫秒）
   * @param retryInterval 重试间隔（毫秒）
   * @returns 是否获取成功
   */
  async tryAcquire(
    name: string,
    ttl: number = 30,
    timeout: number = 5000,
    retryInterval: number = 100
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (await this.acquire(name, ttl)) {
        return true;
      }

      await this.sleep(retryInterval);
    }

    logger.warn('Lock acquisition timeout', { name, timeout });
    return false;
  }

  /**
   * 执行带锁的操作
   * @param name 锁名称
   * @param operation 操作函数
   * @param ttl 锁过期时间（秒）
   * @returns 操作结果
   */
  async withLock<T>(
    name: string,
    operation: () => Promise<T>,
    ttl: number = 30
  ): Promise<T> {
    const acquired = await this.acquire(name, ttl);

    if (!acquired) {
      throw new Error(`Failed to acquire lock: ${name}`);
    }

    try {
      return await operation();
    } finally {
      await this.release(name);
    }
  }

  /**
   * 延迟函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * 缓存序列化工具
 */
export class CacheSerializer {
  /**
   * 序列化对象
   * @param obj 对象
   * @returns 序列化后的字符串
   */
  static serialize(obj: any): string {
    return JSON.stringify(obj);
  }

  /**
   * 反序列化字符串
   * @param str 字符串
   * @returns 对象
   */
  static deserialize<T>(str: string): T | null {
    try {
      return JSON.parse(str);
    } catch (error) {
      logger.error('Failed to deserialize', { error: error.message });
      return null;
    }
  }

  /**
   * 压缩数据
   * @param data 数据
   * @returns 压缩后的字符串
   */
  static compress(data: string): string {
    // 简单实现：可以使用更高效的压缩算法
    return Buffer.from(data).toString('base64');
  }

  /**
   * 解压数据
   * @param compressed 压缩后的字符串
   * @returns 原始数据
   */
  static decompress(compressed: string): string {
    try {
      return Buffer.from(compressed, 'base64').toString('utf-8');
    } catch (error) {
      logger.error('Failed to decompress', { error: error.message });
      return '';
    }
  }
}

/**
 * 缓存时间工具
 */
export class CacheTime {
  /**
   * 将秒转换为毫秒
   * @param seconds 秒
   * @returns 毫秒
   */
  static seconds(seconds: number): number {
    return seconds * 1000;
  }

  /**
   * 将分钟转换为毫秒
   * @param minutes 分钟
   * @returns 毫秒
   */
  static minutes(minutes: number): number {
    return minutes * 60 * 1000;
  }

  /**
   * 将小时转换为毫秒
   * @param hours 小时
   * @returns 毫秒
   */
  static hours(hours: number): number {
    return hours * 60 * 60 * 1000;
  }

  /**
   * 将天转换为毫秒
   * @param days 天
   * @returns 毫秒
   */
  static days(days: number): number {
    return days * 24 * 60 * 60 * 1000;
  }

  /**
   * 获取到午夜的秒数
   * @returns 秒数
   */
  static toMidnight(): number {
    const now = new Date();
    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0
    );
    return Math.floor((midnight.getTime() - now.getTime()) / 1000);
  }

  /**
   * 获取到下周一的秒数
   * @returns 秒数
   */
  static toNextMonday(): number {
    const now = new Date();
    const day = now.getDay();
    const daysUntilMonday = day === 0 ? 1 : 8 - day;
    const nextMonday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + daysUntilMonday,
      0,
      0,
      0
    );
    return Math.floor((nextMonday.getTime() - now.getTime()) / 1000);
  }

  /**
   * 获取到下个月1号的秒数
   * @returns 秒数
   */
  static toNextMonth(): number {
    const now = new Date();
    const nextMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
      0,
      0,
      0
    );
    return Math.floor((nextMonth.getTime() - now.getTime()) / 1000);
  }
}
