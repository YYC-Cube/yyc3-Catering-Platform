/**
 * @file 认证中间件
 * @description 验证JWT令牌，确保请求的安全性
 * @module middleware/auth
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../config/logger';

/**
 * 认证中间件
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 * @returns void
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // 从请求头获取令牌
    const token = req.headers.authorization?.split(' ')[1];

    // 如果没有令牌，返回401错误
    if (!token) {
      res.status(401).json({
        success: false,
        message: '未提供认证令牌',
      });
      return;
    }

    // 验证令牌
    const decoded = jwt.verify(token, process.env['JWT_SECRET'] || 'your-secret-key-change-in-production');
    
    // 将解码后的用户信息存储在请求对象中
    (req as any).user = decoded;

    logger.info('认证成功', { userId: (decoded as any).userId, url: req.url, method: req.method });
    next();
  } catch (error) {
    logger.error('认证失败', { error, url: req.url, method: req.method });
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: '无效的认证令牌',
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: '认证令牌已过期',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: '认证服务器内部错误',
    });
  }
};

/**
 * 可选认证中间件
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 * @returns void
 */
export const optionalAuthMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env['JWT_SECRET'] || 'your-secret-key-change-in-production');
      (req as any).user = decoded;
      logger.info('认证成功', { userId: (decoded as any).userId, url: req.url, method: req.method });
    }

    next();
  } catch (error) {
    // 如果认证失败，不阻止请求继续
    logger.warn('认证失败但允许继续请求', { error, url: req.url, method: req.method });
    next();
  }
};
