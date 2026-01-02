/**
 * @fileoverview 请求日志中间件
 * @description 记录所有HTTP请求的详细信息，包括请求方法、路径、响应时间等
 * @module middleware/requestLogger
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

/**
 * 请求日志中间件
 * 记录请求方法、路径、响应时间、状态码等信息
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // 记录请求开始时间
  const startTime = Date.now();

  // 记录请求信息
  const { method, url, ip, headers } = req;
  const userAgent = headers['user-agent'] || 'Unknown';
  const requestId = headers['x-request-id'] || generateRequestId();

  // 添加请求ID到请求对象
  req.headers['x-request-id'] = requestId as string;

  // 记录请求开始
  logger.info('请求开始', {
    requestId,
    method,
    url,
    ip,
    userAgent,
  });

  // 监听响应完成事件
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;
    const contentLength = res.get('content-length') || 0;

    // 根据状态码选择日志级别
    const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    logger.log(logLevel, '请求完成', {
      requestId,
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      contentLength: `${contentLength} bytes`,
    });

    // 记录慢请求（超过1秒）
    if (duration > 1000) {
      logger.warn('慢请求警告', {
        requestId,
        method,
        url,
        duration: `${duration}ms`,
      });
    }
  });

  next();
};

/**
 * 生成请求ID
 * @returns 请求ID
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * 错误日志中间件
 * 记录应用程序错误
 */
export const errorLogger = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = req.headers['x-request-id'] || 'unknown';

  logger.error('应用程序错误', {
    requestId,
    method: req.method,
    url: req.url,
    error: err.message,
    stack: err.stack,
  });

  next(err);
};
