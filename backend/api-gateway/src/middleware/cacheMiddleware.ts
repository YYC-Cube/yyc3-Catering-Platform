/**
 * @fileoverview 缓存中间件
 * @description 提供基于Redis的缓存中间件，用于缓存API响应
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Request, Response, NextFunction } from 'express';
import { createCacheClient, createCacheKeyGenerator, CacheKeyGenerator } from '@yyc3/redis-cache';
import { logger } from '../config/logger';
import type { ICacheClient } from '../../../../types/services/cache';

/**
 * 缓存配置接口
 */
export interface CacheMiddlewareConfig {
  /** Redis配置 */
  redisConfig: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  /** 默认缓存时间（秒） */
  defaultTTL?: number;
  /** 缓存键前缀 */
  keyPrefix?: string;
  /** 是否启用缓存 */
  enabled?: boolean;
  /** 缓存键生成器 */
  keyGenerator?: CacheKeyGenerator;
}

/**
 * 缓存选项接口
 */
export interface CacheOptions {
  /** 缓存时间（秒） */
  ttl?: number;
  /** 自定义缓存键 */
  key?: string;
  /** 是否跳过缓存 */
  skipCache?: boolean;
  /** 缓存键生成参数 */
  keyParams?: string[];
}

/**
 * 缓存中间件类
 */
export class CacheMiddleware {
  private cacheClient: ICacheClient;
  private keyGenerator: CacheKeyGenerator;
  private config: Required<CacheMiddlewareConfig>;

  constructor(config: CacheMiddlewareConfig) {
    this.config = {
      redisConfig: config.redisConfig,
      defaultTTL: config.defaultTTL || 300,
      keyPrefix: config.keyPrefix || 'api-cache',
      enabled: config.enabled !== false,
      keyGenerator: config.keyGenerator || createCacheKeyGenerator({ prefix: config.keyPrefix || 'api-cache' }),
    };

    this.keyGenerator = this.config.keyGenerator;
  }

  /**
   * 初始化缓存客户端
   */
  async initialize(): Promise<void> {
    try {
      this.cacheClient = await createCacheClient(this.config.redisConfig);
      logger.info('缓存中间件初始化成功');
    } catch (error) {
      logger.error('缓存中间件初始化失败', { error });
      throw error;
    }
  }

  /**
   * 生成缓存键
   * @param req 请求对象
   * @param options 缓存选项
   * @returns 缓存键
   */
  private generateCacheKey(req: Request, options?: CacheOptions): string {
    if (options?.key) {
      return options.key;
    }

    const method = req.method.toLowerCase();
    const path = req.path;
    const queryParams = req.query;

    // 对于GET请求，使用查询参数生成键
    if (method === 'get' && Object.keys(queryParams).length > 0) {
      return this.keyGenerator.list(path, queryParams);
    }

    // 对于其他请求，使用路径和方法
    return this.keyGenerator.generate(method, path);
  }

  /**
   * 检查是否应该跳过缓存
   * @param req 请求对象
   * @param options 缓存选项
   * @returns 是否跳过缓存
   */
  private shouldSkipCache(req: Request, options?: CacheOptions): boolean {
    // 如果缓存未启用
    if (!this.config.enabled) {
      return true;
    }

    // 如果选项中指定跳过缓存
    if (options?.skipCache) {
      return true;
    }

    // 跳过非GET请求
    if (req.method !== 'GET') {
      return true;
    }

    // 跳过包含特定头的请求
    const skipCacheHeader = req.headers['x-skip-cache'];
    if (skipCacheHeader === 'true' || skipCacheHeader === '1') {
      return true;
    }

    return false;
  }

  /**
   * 缓存中间件
   * @param options 缓存选项
   * @returns Express中间件函数
   */
  middleware(options?: CacheOptions) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      // 检查是否应该跳过缓存
      if (this.shouldSkipCache(req, options)) {
        return next();
      }

      const cacheKey = this.generateCacheKey(req, options);

      try {
        // 尝试从缓存获取
        const cachedData = await this.cacheClient.get(cacheKey);

        if (cachedData !== null) {
          logger.debug('缓存命中', { key: cacheKey, path: req.path });
          
          // 设置缓存头
          res.setHeader('X-Cache', 'HIT');
          res.setHeader('X-Cache-Key', cacheKey);

          // 返回缓存数据
          return res.json(cachedData);
        }

        logger.debug('缓存未命中', { key: cacheKey, path: req.path });

        // 缓存未命中，继续处理请求
        const originalJson = res.json.bind(res);

        // 拦截响应
        res.json = function (data: any): Response {
          // 设置缓存未命中头
          res.setHeader('X-Cache', 'MISS');
          res.setHeader('X-Cache-Key', cacheKey);

          // 缓存响应数据
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const ttl = options?.ttl || this.config.defaultTTL;
            this.cacheClient
              .set(cacheKey, data, { ttl })
              .catch((error: Error) => {
                logger.error('缓存写入失败', { key: cacheKey, error });
              });
          }

          return originalJson(data);
        }.bind(this);

        next();
      } catch (error) {
        logger.error('缓存中间件错误', { key: cacheKey, error });
        // 出错时继续处理请求
        next();
      }
    };
  }

  /**
   * 清除缓存中间件
   * @param pattern 缓存键模式
   * @returns Express中间件函数
   */
  invalidate(pattern: string) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        // 在响应后清除缓存
        res.on('finish', async () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              await this.cacheClient.delete(pattern);
              logger.info('缓存已清除', { pattern });
            } catch (error) {
              logger.error('缓存清除失败', { pattern, error });
            }
          }
        });

        next();
      } catch (error) {
        logger.error('缓存清除中间件错误', { pattern, error });
        next();
      }
    };
  }

  /**
   * 清除特定路径的缓存
   * @param path 路径
   */
  async clearPathCache(path: string): Promise<void> {
    try {
      const pattern = this.keyGenerator.generate('*', path, '*');
      await this.cacheClient.delete(pattern);
      logger.info('路径缓存已清除', { path });
    } catch (error) {
      logger.error('路径缓存清除失败', { path, error });
      throw error;
    }
  }

  /**
   * 清除所有缓存
   */
  async clearAllCache(): Promise<void> {
    try {
      const pattern = this.keyGenerator.generate('*');
      await this.cacheClient.delete(pattern);
      logger.info('所有缓存已清除');
    } catch (error) {
      logger.error('所有缓存清除失败', { error });
      throw error;
    }
  }

  /**
   * 获取缓存统计信息
   */
  async getCacheStats(): Promise<any> {
    try {
      const stats = await this.cacheClient.getStats();
      return stats;
    } catch (error) {
      logger.error('获取缓存统计失败', { error });
      throw error;
    }
  }

  /**
   * 关闭缓存客户端
   */
  async close(): Promise<void> {
    if (this.cacheClient) {
      await this.cacheClient.disconnect();
      logger.info('缓存中间件已关闭');
    }
  }
}

/**
 * 创建缓存中间件实例
 * @param config 缓存配置
 * @returns 缓存中间件实例
 */
export function createCacheMiddleware(config: CacheMiddlewareConfig): CacheMiddleware {
  return new CacheMiddleware(config);
}
