/**
 * @file 认证中间件
 * @description YYC³餐饮行业智能化平台 - JWT认证中间件
 * @module middleware/auth
 * @author YYC³
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

import { Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { config } from '../config/app';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from './tenantMiddleware';
import { AppError } from './errorHandler';

/**
 * JWT认证中间件
 */
export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    // 从请求头获取Authorization
    const authHeader = req.headers.authorization;

    // 检查Authorization头
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authorization header is required', 'AUTHORIZATION_REQUIRED', 401);
    }

    // 提取token
    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError('Token is required', 'TOKEN_REQUIRED', 401);
    }

    // 验证token
    const decoded = jwt.verify(token, config.jwt.secret) as any;

    // 检查token是否包含必要信息
    if (!decoded || !decoded.id || !decoded.email) {
      throw new AppError('Invalid token format', 'INVALID_TOKEN_FORMAT', 401);
    }

    // 将用户信息添加到请求对象
    req.user = {
      id: decoded.id,
      email: decoded.email,
      roles: decoded.roles || ['user'],
      permissions: decoded.permissions || []
    };

    // 记录认证成功
    logger.debug('User authenticated successfully', {
      userId: req.user.id,
      email: req.user.email,
      roles: req.user.roles
    });

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Token has expired', 'TOKEN_EXPIRED', 401);
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Invalid token', 'INVALID_TOKEN', 401);
    } else {
      next(error);
    }
  }
};

/**
 * 权限验证中间件
 */
export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      // 检查用户是否已认证
      if (!req.user) {
        throw new AppError('User not authenticated', 'USER_NOT_AUTHENTICATED', 401);
      }

      // 检查用户是否有管理员角色或所需权限
      if (req.user.roles.includes('admin') || req.user.permissions.includes(permission)) {
        next();
      } else {
        throw new AppError('Insufficient permissions', 'INSUFFICIENT_PERMISSIONS', 403);
      }
    } catch (error) {
      next(error);
    }
  };
};

/**
 * 角色验证中间件
 */
export const requireRole = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      // 检查用户是否已认证
      if (!req.user) {
        throw new AppError('User not authenticated', 'USER_NOT_AUTHENTICATED', 401);
      }

      // 检查用户角色
      if (req.user.roles.includes(role) || req.user.roles.includes('admin')) {
        next();
      } else {
        throw new AppError('Insufficient role', 'INSUFFICIENT_ROLE', 403);
      }
    } catch (error) {
      next(error);
    }
  };
};

/**
 * JWT工具函数
 */
export const jwtUtils = {
  /**
   * 生成JWT token
   */
  generateToken(payload: any, options?: jwt.SignOptions): string {
    const signOptions: jwt.SignOptions = {
      expiresIn: config.jwt.expiresIn as StringValue,
      ...options
    };
    return jwt.sign(payload, config.jwt.secret, signOptions);
  },

  /**
   * 验证JWT token
   */
  verifyToken(token: string): any {
    return jwt.verify(token, config.jwt.secret);
  },

  /**
   * 解码JWT token（不验证）
   */
  decodeToken(token: string): any {
    return jwt.decode(token);
  }
};
