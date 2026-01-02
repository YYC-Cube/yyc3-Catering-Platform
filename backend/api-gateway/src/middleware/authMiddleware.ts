/**
 * @file 认证中间件
 * @description 处理API请求的JWT认证
 * @module middleware/authMiddleware
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Request, Response, NextFunction } from 'express';
import { expressjwt, GetVerificationKey } from 'express-jwt';
import jsonwebtoken from 'jsonwebtoken';
import logger from '../config/logger';

// 公共路由白名单
const publicRoutes = [
  '/api/auth/',
  '/api/health',
  '/api/docs',
];

/**
 * 认证中间件
 */
export const authMiddleware = expressjwt({
  secret: process.env.JWT_SECRET as string,
  algorithms: ['HS256'],
  credentialsRequired: true,
  getToken: (req: Request) => {
    const token = req.headers.authorization?.split(' ')[1];
    return token;
  },
  isRevoked: async (req, token) => {
    // 这里可以添加token撤销逻辑，例如检查token是否在黑名单中
    // 暂时简单实现
    return false;
  },
});

/**
 * 检查是否是公共路由
 * @param req 请求对象
 * @returns 是否是公共路由
 */
export const isPublicRoute = (req: Request): boolean => {
  return publicRoutes.some(route => req.path.startsWith(route));
};

/**
 * 认证错误处理中间件
 */
export const authErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.name === 'UnauthorizedError') {
    logger.warn('认证失败: %s', err.message);
    return res.status(401).json({
      success: false,
      error: '无效的令牌',
    });
  }
  next(err);
};

/**
 * 认证中间件包装器，用于处理公共路由
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  if (isPublicRoute(req)) {
    return next();
  }
  return authMiddleware(req, res, next);
};