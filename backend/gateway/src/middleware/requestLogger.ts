/**
 * @file 请求日志中间件
 * @description YYC³餐饮行业智能化平台 - 请求日志记录中间件
 * @module middleware/requestLogger
 * @author YYC³
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from './tenantMiddleware';

/**
 * 请求日志中间件
 */
export const requestLogger = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  // 生成请求ID
  const requestId = req.headers['x-request-id'] || uuidv4();
  req.headers['x-request-id'] = requestId;

  // 记录请求开始时间
  const startTime = Date.now();

  // 记录原始IP地址
  const ip = req.ip || req.socket.remoteAddress || '';

  // 记录请求信息
  logger.http('Request received', {
    requestId,
    method: req.method,
    path: req.path,
    ip,
    userAgent: req.headers['user-agent'],
    tenantId: req.headers['x-tenant-id'],
    userId: req.user?.id
  });

  // 监听响应完成事件
  res.on('finish', () => {
    // 计算响应时间
    const responseTime = Date.now() - startTime;

    // 记录响应信息
    logger.http('Request completed', {
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      tenantId: req.headers['x-tenant-id'],
      userId: req.user?.id,
      contentLength: res.get('Content-Length')
    });
  });

  // 监听响应错误事件
  res.on('error', (err) => {
    const responseTime = Date.now() - startTime;

    logger.error('Response error', {
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      error: err.message,
      tenantId: req.headers['x-tenant-id'],
      userId: req.user?.id
    });
  });

  next();
};
