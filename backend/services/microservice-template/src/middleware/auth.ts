/**
 * @fileoverview 身份验证中间件
 * @description 实现JWT身份验证和权限控制
 * @module middleware/auth
 * @author YYC³ Development Team <dev@yyc3.red>
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedException, ForbiddenException } from '../exceptions/CustomException';
import config from '../config/config';
import logger from '../config/logger';

/**
 * JWT负载接口
 */
interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Express请求扩展接口
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * 身份验证中间件
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件函数
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // 从请求头获取令牌
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Missing or invalid Authorization header');
      throw new UnauthorizedException('未提供有效的身份验证令牌');
    }
    
    // 提取令牌
    const token = authHeader.replace('Bearer ', '');
    
    try {
      // 验证令牌
      const decoded = jwt.verify(token, config.auth.jwtSecret, { algorithms: ['HS256'] }) as JwtPayload;
      
      // 将用户信息添加到请求对象
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
      
      next();
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        logger.warn('Token expired');
        throw new UnauthorizedException('身份验证令牌已过期');
      } else if (error.name === 'JsonWebTokenError') {
        logger.warn('Invalid token');
        throw new UnauthorizedException('无效的身份验证令牌');
      } else {
        logger.error('Token verification error:', error);
        throw new UnauthorizedException('身份验证失败');
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 角色授权中间件
 * @param roles 允许的角色列表
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedException('未通过身份验证');
      }
      
      // 检查用户角色是否在允许的角色列表中
      if (!roles.includes(req.user.role)) {
        logger.warn(`User ${req.user.userId} with role ${req.user.role} tried to access a resource that requires one of: ${roles.join(', ')}`);
        throw new ForbiddenException('没有权限访问此资源');
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * 生成JWT令牌
 * @param userId 用户ID
 * @param email 用户邮箱
 * @param role 用户角色
 */
export const generateToken = (userId: string, email: string, role: string): string => {
  const payload = {
    userId,
    email,
    role,
  };
  
  return jwt.sign(payload, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtExpiresIn,
    algorithm: 'HS256',
  });
};
