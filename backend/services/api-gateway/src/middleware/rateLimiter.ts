/**
 * @file 限流中间件
 * @description 实现API请求限流，防止滥用
 * @module middleware/rateLimiter
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import rateLimit, { ValueDeterminingMiddleware } from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '../config/logger';

/**
 * API请求限流中间件
 * @returns 限流中间件函数
 */
export const rateLimiterMiddleware = rateLimit({
  // 窗口时间（毫秒）
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '60000'), // 默认1分钟
  // 每个IP在窗口时间内允许的请求数
  max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'), // 默认100次请求
  // 允许的请求头（用于代理环境）
  keyGenerator: ((req: Request) => {
    // 如果使用代理，从X-Forwarded-For头获取真实IP
    const clientIp = req.headers['x-forwarded-for'] as string || req.ip;
    return clientIp || 'unknown';
  }) as ValueDeterminingMiddleware<string>,
  // 自定义响应
  handler: (req: Request, res: Response) => {
    logger.warn(`API限流触发: IP ${req.ip}, 路径 ${req.path}`);
    res.status(429).json({
      success: false,
      error: '请求过于频繁，请稍后再试',
      code: 'TOO_MANY_REQUESTS'
    });
  },
  // 跳过特定路径（如健康检查）
  skip: (req: Request) => {
    return req.path === '/health' || req.path === '/version';
  },
  // 包含X-RateLimit-*响应头
  standardHeaders: true,
  // 禁用Legacy响应头
  legacyHeaders: false
});
