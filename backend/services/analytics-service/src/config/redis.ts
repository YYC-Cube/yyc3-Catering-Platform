/**
 * @file Redis配置
 * @description 配置Redis客户端连接和操作
 * @module config/redis
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';

/**
 * Redis客户端实例
 */
let redisClient: RedisClientType;

/**
 * 创建Redis客户端
 */
function createRedisClient() {
  try {
    const client = createClient({
      url: `redis://${process.env.REDIS_PASSWORD ? `${process.env.REDIS_PASSWORD}@` : ''}${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}/${process.env.REDIS_DB || 2}`,
      socket: {
        reconnectStrategy: (retries) => {
          const maxRetries = Number(process.env.REDIS_MAX_RECONNECT_ATTEMPTS) || 5;
          const delay = Number(process.env.REDIS_RECONNECT_DELAY) || 3000;
          
          if (retries > maxRetries) {
            logger.error('Redis最大重连尝试次数已达上限，停止重连');
            return new Error('Redis连接失败');
          }
          
          logger.info(`Redis重连尝试 ${retries}，${delay}ms 后重试...`);
          return delay;
        },
      },
    });

    // 连接事件
    client.on('connect', () => {
      logger.info('Redis连接成功');
    });

    // 错误事件
    client.on('error', (error) => {
      logger.error('Redis连接错误:', error);
    });

    // 断开连接事件
    client.on('end', () => {
      logger.info('Redis连接已断开');
    });

    return client;
  } catch (error) {
    logger.error('创建Redis客户端失败:', error);
    throw error;
  }
}

/**
 * 获取Redis客户端
 */
async function getClient(): Promise<RedisClientType> {
  if (!redisClient) {
    redisClient = createRedisClient();
    await redisClient.connect();
  } else if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  return redisClient;
}

/**
 * 设置键值对
 * @param key 键
 * @param value 值
 * @param ttl 过期时间（秒）
 */
async function set(key: string, value: any, ttl?: number): Promise<void> {
  const client = await getClient();
  if (ttl) {
    await client.set(key, JSON.stringify(value), { EX: ttl });
  } else {
    await client.set(key, JSON.stringify(value));
  }
}

/**
 * 获取键值
 * @param key 键
 */
async function get<T>(key: string): Promise<T | null> {
  const client = await getClient();
  const value = await client.get(key);
  return value ? JSON.parse(value) : null;
}

/**
 * 删除键
 * @param key 键
 */
async function del(key: string): Promise<void> {
  const client = await getClient();
  await client.del(key);
}

/**
 * 关闭Redis连接
 */
async function close(): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null as any;
  }
}

/**
 * Redis客户端对象
 */
export const redisClient = {
  getClient,
  set,
  get,
  del,
  close,
};
