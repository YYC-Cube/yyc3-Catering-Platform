/**
 * @fileoverview YYC³ API网关限流中间件
 * @description 基于Redis的分布式限流实现
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-08
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { RateLimitConfig } from '../types/gateway';
import logger from '../utils/logger';

export class RateLimiterMiddleware {
  private redis: Redis;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig, redisClient: Redis) {
    this.config = config;
    this.redis = redisClient;
  }

  /**
   * 限流中间件
   */
  rateLimit = (options?: Partial<RateLimitConfig>) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      // 合并配置
      const mergedConfig = { ...this.config, ...options };

      // 检查限流是否启用
      if (!mergedConfig.enabled) {
        return next();
      }

      try {
        // IP白名单检查
        if (this.isIpWhitelisted(req.ip || '', mergedConfig)) {
          return next();
        }

        // 获取路由级别的限流配置
        const routeConfig = this.getRouteSpecificConfig(req.path, mergedConfig);
        const effectiveConfig = routeConfig || mergedConfig;

        // 根据限流策略选择实现
        switch (effectiveConfig.strategy) {
          case 'sliding':
            return this.slidingWindowRateLimit(effectiveConfig)(req, res, next);
          case 'adaptive':
            return this.adaptiveRateLimit(effectiveConfig)(req, res, next);
          case 'token-bucket':
            return this.tokenBucketRateLimit(effectiveConfig)(req, res, next);
          case 'fixed':
          default:
            return this.fixedWindowRateLimit(effectiveConfig)(req, res, next);
        }
      } catch (error) {
        logger.error('Rate limiter error:', error);
        // 如果出现问题，允许请求通过
        next();
      }
    };
  };

  /**
   * 固定窗口限流实现
   */
  private fixedWindowRateLimit = (config: RateLimitConfig) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      // 生成限流键
      const key = this.generateKey(req, config);

      // 获取当前计数
      const current = await this.redis.incr(key);

      // 如果是第一次请求，设置过期时间
      if (current === 1) {
        await this.redis.expire(key, Math.ceil(config.windowMs / 1000));
      }

      // 获取剩余时间和请求次数
      const ttl = await this.redis.ttl(key);
      const remaining = Math.max(0, config.maxRequests - current);

      // 设置响应头
      res.set({
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': Math.floor(Date.now() / 1000 + ttl).toString()
      });

      // 检查是否超过限制
      if (current > config.maxRequests) {
        const retryAfter = Math.ceil(ttl);
        res.set('Retry-After', retryAfter.toString());

        return this.rateLimitExceeded(res, {
          limit: config.maxRequests,
          remaining: 0,
          resetTime: Date.now() + ttl * 1000,
          retryAfter
        });
      }

      next();
    };
  };

  /**
   * 令牌桶限流实现
   */
  private tokenBucketRateLimit = (config: RateLimitConfig) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const key = this.generateKey(req, config);
      const now = Date.now();
      const refillRate = config.maxRequests / (config.windowMs / 1000); // 每秒补充的令牌数

      const pipeline = this.redis.pipeline();

      // 获取当前令牌数和最后更新时间
      pipeline.hmget(key, 'tokens', 'lastRefill');

      const results = await pipeline.exec();
      const currentData = results[0][1] as [string | null, string | null];

      let tokens = config.maxRequests;
      let lastRefill = 0;

      if (currentData[0] && currentData[1]) {
        tokens = parseFloat(currentData[0]);
        lastRefill = parseInt(currentData[1]);
      }

      // 计算应该补充的令牌数
      const timePassed = (now - lastRefill) / 1000;
      const tokensToAdd = Math.min(timePassed * refillRate, config.maxRequests - tokens);
      tokens += tokensToAdd;

      if (tokens >= 1) {
        // 有令牌可用，消耗一个令牌
        tokens--;

        // 更新状态
        await this.redis.hmset(key, {
          tokens: tokens.toString(),
          lastRefill: now.toString()
        });
        await this.redis.expire(key, Math.ceil(config.windowMs / 1000) * 2);

        // 设置响应头
        res.set({
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': Math.floor(tokens).toString(),
          'X-RateLimit-Reset': Math.floor(now / 1000 + (config.maxRequests - tokens) / refillRate).toString()
        });

        next();
      } else {
        // 没有令牌可用
        const retryAfter = Math.ceil((1 - tokens) / refillRate);
        res.set('Retry-After', retryAfter.toString());

        return this.rateLimitExceeded(res, {
          limit: config.maxRequests,
          remaining: 0,
          resetTime: now + retryAfter * 1000,
          retryAfter
        });
      }
    };
  };

  /**
   * 高级限流中间件（支持不同限流策略）
   */
  advancedRateLimit = (strategies: RateLimitStrategy[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const promises = strategies.map(async strategy => {
        return this.checkStrategy(req, strategy);
      });

      try {
        const results = await Promise.all(promises);

        // 检查是否有策略触发限流
        const blockedStrategy = results.find(result => result.blocked);

        if (blockedStrategy) {
          return this.rateLimitExceeded(res, blockedStrategy.info!);
        }

        // 设置最严格的限制信息
        const strictestLimit = results.reduce((min, current) =>
          current.info ? (current.info.remaining < min.info.remaining ? current : min) : min
        );

        if (strictestLimit.info) {
          res.set({
            'X-RateLimit-Limit': strictestLimit.info.limit.toString(),
            'X-RateLimit-Remaining': strictestLimit.info.remaining.toString(),
            'X-RateLimit-Reset': Math.floor(Date.now() / 1000 + strictestLimit.info.retryAfter).toString()
          });
        }

        next();
      } catch (error) {
        console.error('Advanced rate limiter error:', error);
        next();
      }
    };
  };

  /**
   * 滑动窗口限流
   */
  slidingWindowRateLimit = (config: RateLimitConfig) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (!config.enabled) {
        return next();
      }

      try {
        const key = this.generateKey(req, config);
        const now = Date.now();
        const windowStart = now - config.windowMs;

        // 使用有序集合实现滑动窗口
        const pipeline = this.redis.pipeline();

        // 移除过期的请求记录
        pipeline.zremrangebyscore(key, 0, windowStart);

        // 添加当前请求
        pipeline.zadd(key, now, `${now}-${Math.random()}`);

        // 获取当前窗口内的请求数
        pipeline.zcard(key);

        // 设置过期时间
        pipeline.expire(key, Math.ceil(config.windowMs / 1000) + 1);

        const results = await pipeline.exec();
        const currentCount = results[2][1] as number;

        if (currentCount >= config.maxRequests) {
          // 计算最早请求的时间以确定重试时间
          const earliestResult = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
          const retryAfter = earliestResult.length > 0
            ? Math.ceil((parseInt(earliestResult[0][1]) + config.windowMs - now) / 1000)
            : Math.ceil(config.windowMs / 1000);

          res.set('Retry-After', retryAfter.toString());

          return this.rateLimitExceeded(res, {
            limit: config.maxRequests,
            windowMs: config.windowMs,
            retryAfter
          });
        }

        const remaining = config.maxRequests - currentCount;
        res.set({
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': Math.floor(now / 1000 + config.windowMs / 1000).toString()
        });

        next();
      } catch (error) {
        console.error('Sliding window rate limiter error:', error);
        next();
      }
    };
  };

  /**
   * 自适应限流（基于系统负载动态调整限制）
   */
  adaptiveRateLimit = (baseConfig: RateLimitConfig) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (!baseConfig.enabled) {
        return next();
      }

      try {
        // 获取系统负载指标
        const systemLoad = await this.getSystemLoad();

        // 根据系统负载调整限制
        const adjustedConfig = this.adjustConfigByLoad(baseConfig, systemLoad);

        // 使用调整后的配置进行限流
        const limiter = this.rateLimit(adjustedConfig);
        return limiter(req, res, next);
      } catch (error) {
        console.error('Adaptive rate limiter error:', error);
        // 发生错误时使用基础配置
        const limiter = this.rateLimit(baseConfig);
        return limiter(req, res, next);
      }
    };
  };

  /**
   * 检查单个限流策略
   */
  private async checkStrategy(req: Request, strategy: RateLimitStrategy): Promise<RateLimitResult> {
    const key = this.generateKey(req, strategy.config);
    const now = Date.now();

    try {
      if (strategy.type === 'fixed-window') {
        return this.checkFixedWindow(key, strategy.config);
      } else if (strategy.type === 'sliding-window') {
        return this.checkSlidingWindow(key, strategy.config);
      } else if (strategy.type === 'token-bucket') {
        return this.checkTokenBucket(key, strategy.config);
      } else {
        return { blocked: false };
      }
    } catch (error) {
      console.error(`Strategy check error for ${strategy.type}:`, error);
      return { blocked: false };
    }
  }

  /**
   * 检查固定窗口限流
   */
  private async checkFixedWindow(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, Math.ceil(config.windowMs / 1000));
    }

    const ttl = await this.redis.ttl(key);
    const remaining = Math.max(0, config.maxRequests - current);

    if (current > config.maxRequests) {
      return {
        blocked: true,
        info: {
          limit: config.maxRequests,
          remaining: 0,
          resetTime: Date.now() + ttl * 1000,
          retryAfter: ttl
        }
      };
    }

    return {
      blocked: false,
      info: {
        limit: config.maxRequests,
        remaining,
        resetTime: Date.now() + ttl * 1000,
        retryAfter: 0
      }
    };
  }

  /**
   * 检查滑动窗口限流
   */
  private async checkSlidingWindow(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    const pipeline = this.redis.pipeline();
    pipeline.zremrangebyscore(key, 0, windowStart);
    pipeline.zadd(key, now, `${now}-${Math.random()}`);
    pipeline.zcard(key);
    pipeline.expire(key, Math.ceil(config.windowMs / 1000) + 1);

    const results = await pipeline.exec();
    const currentCount = results[2][1] as number;

    if (currentCount >= config.maxRequests) {
      const earliestResult = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
      const retryAfter = earliestResult.length > 0
        ? Math.ceil((parseInt(earliestResult[0][1]) + config.windowMs - now) / 1000)
        : Math.ceil(config.windowMs / 1000);

      return {
        blocked: true,
        info: {
          limit: config.maxRequests,
          remaining: 0,
          resetTime: now + retryAfter * 1000,
          retryAfter
        }
      };
    }

    return {
      blocked: false,
      info: {
        limit: config.maxRequests,
        remaining: config.maxRequests - currentCount,
        resetTime: now + config.windowMs,
        retryAfter: 0
      }
    };
  }

  /**
   * 检查令牌桶限流
   */
  private async checkTokenBucket(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const now = Date.now();
    const refillRate = config.maxRequests / (config.windowMs / 1000); // 每秒补充的令牌数

    const pipeline = this.redis.pipeline();

    // 获取当前令牌数和最后更新时间
    pipeline.hmget(key, 'tokens', 'lastRefill');

    const results = await pipeline.exec();
    const currentData = results[0][1] as [string | null, string | null];

    let tokens = config.maxRequests;
    let lastRefill = 0;

    if (currentData[0] && currentData[1]) {
      tokens = parseFloat(currentData[0]);
      lastRefill = parseInt(currentData[1]);
    }

    // 计算应该补充的令牌数
    const timePassed = (now - lastRefill) / 1000;
    const tokensToAdd = Math.min(timePassed * refillRate, config.maxRequests - tokens);
    tokens += tokensToAdd;

    if (tokens >= 1) {
      // 有令牌可用，消耗一个令牌
      tokens--;

      // 更新状态
      await this.redis.hmset(key, {
        tokens: tokens.toString(),
        lastRefill: now.toString()
      });
      await this.redis.expire(key, Math.ceil(config.windowMs / 1000) * 2);

      return {
        blocked: false,
        info: {
          limit: config.maxRequests,
          remaining: Math.floor(tokens),
          resetTime: now + (config.maxRequests - tokens) / refillRate * 1000,
          retryAfter: 0
        }
      };
    } else {
      // 没有令牌可用
      const retryAfter = Math.ceil((1 - tokens) / refillRate);

      return {
        blocked: true,
        info: {
          limit: config.maxRequests,
          remaining: 0,
          resetTime: now + retryAfter * 1000,
          retryAfter
        }
      };
    }
  }

  /**
   * 生成限流键
   */
  private generateKey(req: Request, config: RateLimitConfig): string {
    let key: string;

    if (config.keyGenerator) {
      key = config.keyGenerator(req);
    } else {
      // 默认使用用户ID或IP
      key = req.user?.id || req.ip || 'anonymous';
    }

    // 路由级别的限流键
    const path = req.path;
    if (this.getRouteSpecificConfig(path, config)) {
      return `rate_limit:${path}:${key}`;
    }

    return `rate_limit:${key}`;
  }

  /**
   * 检查IP是否在白名单中
   */
  private isIpWhitelisted(ip: string, config: RateLimitConfig): boolean {
    if (!config.whitelist || config.whitelist.length === 0) {
      return false;
    }

    // 解析IP（处理IPv6映射的IPv4）
    const parsedIp = ip.includes(':') && ip.startsWith('::ffff:') ? ip.substring(7) : ip;
    return config.whitelist.includes(parsedIp) || config.whitelist.includes(ip);
  }

  /**
   * 获取路由级别的限流配置
   */
  private getRouteSpecificConfig(path: string, config: RateLimitConfig): RateLimitConfig | undefined {
    if (!config.routeSpecific) {
      return undefined;
    }

    // 匹配最具体的路由
    for (const routePath of Object.keys(config.routeSpecific)) {
      if (path.startsWith(routePath)) {
        return {
          ...config,
          ...config.routeSpecific[routePath]
        };
      }
    }

    return undefined;
  }

  /**
   * 获取系统负载
   */
  private async getSystemLoad(): Promise<SystemLoad> {
    try {
      // 获取Redis连接数作为负载指标
      const info = await this.redis.info('clients');
      const connectedClients = parseInt(info.split('\r\n')[0].split(':')[1]);

      // 获取内存使用情况
      const memoryInfo = await this.redis.info('memory');
      const usedMemory = parseInt(memoryInfo.split('\r\n')[1].split(':')[1]);

      return {
        connectedClients,
        usedMemory,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Failed to get system load:', error);
      return {
        connectedClients: 0,
        usedMemory: 0,
        timestamp: Date.now()
      };
    }
  }

  /**
   * 根据系统负载调整配置
   */
  private adjustConfigByLoad(baseConfig: RateLimitConfig, load: SystemLoad): RateLimitConfig {
    const adjustedConfig = { ...baseConfig };

    // 根据连接数调整限制
    if (load.connectedClients > 100) {
      adjustedConfig.maxRequests = Math.max(10, baseConfig.maxRequests * 0.5);
    } else if (load.connectedClients > 50) {
      adjustedConfig.maxRequests = Math.max(20, baseConfig.maxRequests * 0.7);
    }

    return adjustedConfig;
  }

  /**
   * 返回限流超过错误
   */
  private rateLimitExceeded(res: Response, info: RateLimitInfo): void {
    // 获取请求信息
    const req = res.req as Request;
    const ip = req.ip || req.socket.remoteAddress || '';
    const userId = req.user?.id || 'anonymous';
    const email = req.user?.email || 'anonymous';

    // 记录限流事件
    logger.warn('Rate limit exceeded', {
      ip,
      userId,
      email,
      path: req.path,
      method: req.method,
      limit: info.limit,
      remaining: info.remaining,
      retryAfter: info.retryAfter,
      timestamp: Date.now()
    });

    // 使用自定义响应配置（如果有）
    const responseConfig = this.config.response || {
      statusCode: 429,
      message: `Rate limit exceeded. Try again in ${info.retryAfter} seconds.`
    };

    res.status(responseConfig.statusCode).json({
      success: false,
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      message: responseConfig.message,
      data: {
        limit: info.limit,
        remaining: info.remaining,
        resetTime: info.resetTime,
        retryAfter: info.retryAfter
      },
      timestamp: new Date().toISOString()
    });
  }
}

export interface RateLimitStrategy {
  type: 'fixed-window' | 'sliding-window' | 'token-bucket';
  config: RateLimitConfig;
  priority?: number;
}

export interface RateLimitResult {
  blocked: boolean;
  info?: RateLimitInfo;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter: number;
}

interface SystemLoad {
  connectedClients: number;
  usedMemory: number;
  timestamp: number;
}