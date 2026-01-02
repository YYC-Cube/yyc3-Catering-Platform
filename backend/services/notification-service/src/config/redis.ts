/**
 * @file Redis配置
 * @description 配置和管理Redis连接
 * @module config/redis
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import Redis from 'ioredis';
import { logger } from './logger';

let redisClient: Redis | null = null;

/**
 * 连接到Redis
 */
export const connectRedis = (): void => {
  try {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: 0,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          // 当Redis是只读模式时，尝试重新连接
          return true;
        }
        return false;
      },
    });

    redisClient.on('connect', () => {
      logger.info('Redis连接成功');
    });

    redisClient.on('error', (error) => {
      logger.error('Redis连接错误: %s', error.message);
    });

    redisClient.on('close', () => {
      logger.info('Redis连接已关闭');
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis正在重新连接...');
    });
  } catch (error) {
    logger.error('初始化Redis客户端失败: %s', (error as Error).message);
    process.exit(1);
  }
};

/**
 * 获取Redis客户端
 * @returns Redis客户端实例
 */
export const getRedisClient = (): Redis => {
  if (!redisClient) {
    throw new Error('Redis客户端未初始化');
  }
  return redisClient;
};

/**
 * 关闭Redis连接
 */
export const closeRedis = async (): Promise<void> => {
  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info('Redis连接已关闭');
    }
  } catch (error) {
    logger.error('关闭Redis连接失败: %s', (error as Error).message);
  }
};

/**
 * 设置Redis键值对
 * @param key 键
 * @param value 值
 * @param ttl 过期时间（秒）
 */
export const setRedisKey = async (key: string, value: any, ttl?: number): Promise<void> => {
  try {
    const client = getRedisClient();
    const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttl) {
      await client.set(key, valueStr, 'EX', ttl);
    } else {
      await client.set(key, valueStr);
    }
  } catch (error) {
    logger.error('设置Redis键失败: %s', (error as Error).message);
    throw error;
  }
};

/**
 * 获取Redis键值
 * @param key 键
 * @returns 值
 */
export const getRedisKey = async (key: string): Promise<any> => {
  try {
    const client = getRedisClient();
    const value = await client.get(key);
    if (value) {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return null;
  } catch (error) {
    logger.error('获取Redis键失败: %s', (error as Error).message);
    throw error;
  }
};

/**
 * 删除Redis键
 * @param key 键
 */
export const deleteRedisKey = async (key: string): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (error) {
    logger.error('删除Redis键失败: %s', (error as Error).message);
    throw error;
  }
};