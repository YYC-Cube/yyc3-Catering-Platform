/**
 * @file 限流中间件
 * @description 实现API请求的限流功能
 * @module middleware/rateLimitMiddleware
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import rateLimit from 'express-rate-limit';
import logger from '../config/logger';

/**
 * 限流配置
 */
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15分钟
  max: parseInt(process.env.RATE_LIMIT_MAX || '1000'), // 每个窗口内的最大请求数
  standardHeaders: true, // 返回RateLimit-*头
  legacyHeaders: false, // 禁用X-RateLimit-*头
  message: {
    success: false,
    error: '请求过于频繁，请稍后再试',
  },
  skip: (req, res) => {
    // 健康检查接口不限流
    if (req.path === '/api/health') {
      return true;
    }
    return false;
  },
  onLimitReached: (req, res, options) => {
    logger.warn('请求限流触发: IP=%s, 路径=%s', req.ip, req.path);
  },
});

export default limiter;