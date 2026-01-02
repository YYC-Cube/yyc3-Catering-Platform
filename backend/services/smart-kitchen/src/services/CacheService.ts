/**
 * @file 缓存服务
 * @description 提供基于Redis的缓存服务实现
 * @module CacheService
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

import { createClient, RedisClientType } from 'redis';
import { config } from '../config/config';

/**
 * 缓存服务接口
 */
export interface ICacheService {
  /**
   * 获取缓存数据
   * @param key 缓存键
   * @returns 缓存值或null
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * 设置缓存数据
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间（秒），默认1小时
   * @returns 设置是否成功
   */
  set<T>(key: string, value: T, ttl?: number): Promise<boolean>;

  /**
   * 删除缓存数据
   * @param key 缓存键
   * @returns 删除是否成功
   */
  delete(key: string): Promise<boolean>;

  /**
   * 根据模式删除缓存数据
   * @param pattern 缓存键模式（支持通配符）
   * @returns 删除的键数量
   */
  deletePattern(pattern: string): Promise<number>;

  /**
   * 清除所有缓存数据
   * @returns 清除是否成功
   */
  clear(): Promise<boolean>;

  /**
   * 使用缓存获取数据（如果缓存不存在则从数据源获取并缓存）
   * @param key 缓存键
   * @param fetcher 数据源获取函数
   * @param ttl 过期时间（秒），默认1小时
   * @returns 数据
   */
  getWithCache<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T>;
}

/**
 * 缓存服务实现
 */
export class CacheService implements ICacheService {
  private redisClient: RedisClientType;
  private readonly DEFAULT_TTL = 3600; // 默认1小时

  constructor() {
    this.redisClient = createClient({
      socket: {
        host: config.REDIS_HOST,
        port: parseInt(config.REDIS_PORT),
      },
      password: config.REDIS_PASSWORD,
    });

    this.initializeRedis();
  }

  /**
   * 初始化Redis连接
   */
  private async initializeRedis(): Promise<void> {
    try {
      await this.redisClient.connect();
      console.log('✅ Redis连接成功');
    } catch (error) {
      console.error('❌ Redis连接失败:', error);
      // Redis连接失败不影响服务启动，但会影响缓存功能
    }
  }

  /**
   * 获取缓存数据
   * @param key 缓存键
   * @returns 缓存值或null
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('❌ 获取缓存失败:', error);
      return null;
    }
  }

  /**
   * 设置缓存数据
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间（秒），默认1小时
   * @returns 设置是否成功
   */
  async set<T>(key: string, value: T, ttl: number = this.DEFAULT_TTL): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(value);
      await this.redisClient.set(key, jsonValue, { EX: ttl });
      return true;
    } catch (error) {
      console.error('❌ 设置缓存失败:', error);
      return false;
    }
  }

  /**
   * 删除缓存数据
   * @param key 缓存键
   * @returns 删除是否成功
   */
  async delete(key: string): Promise<boolean> {
    try {
      const result = await this.redisClient.del(key);
      return result > 0;
    } catch (error) {
      console.error('❌ 删除缓存失败:', error);
      return false;
    }
  }

  /**
   * 根据模式删除缓存数据
   * @param pattern 缓存键模式（支持通配符）
   * @returns 删除的键数量
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redisClient.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }
      
      const result = await this.redisClient.del(keys);
      return result;
    } catch (error) {
      console.error('❌ 根据模式删除缓存失败:', error);
      return 0;
    }
  }

  /**
   * 清除所有缓存数据
   * @returns 清除是否成功
   */
  async clear(): Promise<boolean> {
    try {
      await this.redisClient.flushAll();
      return true;
    } catch (error) {
      console.error('❌ 清除缓存失败:', error);
      return false;
    }
  }

  /**
   * 使用缓存获取数据（如果缓存不存在则从数据源获取并缓存）
   * @param key 缓存键
   * @param fetcher 数据源获取函数
   * @param ttl 过期时间（秒），默认1小时
   * @returns 数据
   */
  async getWithCache<T>(key: string, fetcher: () => Promise<T>, ttl: number = this.DEFAULT_TTL): Promise<T> {
    // 尝试从缓存获取
    const cachedValue = await this.get<T>(key);
    if (cachedValue !== null) {
      return cachedValue;
    }

    // 从数据源获取
    const value = await fetcher();
    
    // 缓存数据
    await this.set(key, value, ttl);
    
    return value;
  }
}

/**
 * 缓存服务单例实例
 */
export const cacheService = new CacheService();
