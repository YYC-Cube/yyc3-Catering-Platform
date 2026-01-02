/**
 * @fileoverview 认证中间件
 * @description 处理用户身份验证和权限检查
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-15
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Request, Response, NextFunction } from 'express';
import authService from '../services/AuthService';
import logger from '../config/logger';

/**
 * 验证Token
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未授权：缺少访问令牌',
      });
    }

    const decoded = await authService.verifyToken(token);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        code: 401,
        message: '未授权：无效的访问令牌',
      });
    }

    // 将用户信息添加到请求对象
    (req as any).user = {
      id: decoded.userId,
      type: decoded.userType,
      role: decoded.role,
    };

    next();
  } catch (error: any) {
    logger.error('Token验证失败:', error);
    return res.status(401).json({
      code: 401,
      message: error.message || '未授权：访问令牌已过期或无效',
    });
  }
}

/**
 * 检查用户角色权限
 * @param roles 允许的角色列表
 */
function checkRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;

      if (!user || !user.role) {
        return res.status(403).json({
          code: 403,
          message: '禁止访问：用户角色未定义',
        });
      }

      if (!roles.includes(user.role.name)) {
        return res.status(403).json({
          code: 403,
          message: `禁止访问：需要以下角色之一: ${roles.join(', ')}`,
        });
      }

      next();
    } catch (error: any) {
      logger.error('角色权限检查失败:', error);
      return res.status(403).json({
        code: 403,
        message: '禁止访问：权限检查失败',
      });
    }
  };
}

/**
 * 检查用户类型
 * @param userTypes 允许的用户类型列表
 */
function checkUserType(userTypes: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;

      if (!user || !user.type) {
        return res.status(403).json({
          code: 403,
          message: '禁止访问：用户类型未定义',
        });
      }

      if (!userTypes.includes(user.type)) {
        return res.status(403).json({
          code: 403,
          message: `禁止访问：需要以下用户类型之一: ${userTypes.join(', ')}`,
        });
      }

      next();
    } catch (error: any) {
      logger.error('用户类型检查失败:', error);
      return res.status(403).json({
        code: 403,
        message: '禁止访问：用户类型不匹配',
      });
    }
  };
}

export {
  authenticateToken,
  checkRole,
  checkUserType,
};
