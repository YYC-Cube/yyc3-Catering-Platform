/**
 * @file 认证中间件
 * @description 处理用户身份验证、授权和令牌管理
 * @module middleware/auth
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// 定义JWT有效载荷类型
export interface JWTPayload {
  userId: string;
  role: string;
  restaurantId?: string;
  exp: number;
  iat: number;
}

// 定义用户信息类型
export interface UserInfo {
  userId: string;
  role: string;
  restaurantId?: string;
}

// JWT配置
// SECURITY FIX: Require JWT_SECRET to be set in environment
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET environment variable must be set with at least 32 characters');
}
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h';

/**
 * 认证中间件类
 */
export class AuthenticationMiddleware {
  /**
   * 生成JWT令牌
   * SECURITY FIX: Use jsonwebtoken library instead of custom implementation
   */
  public async generateToken(payload: Omit<JWTPayload, 'exp' | 'iat'>): Promise<string> {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION,
      issuer: 'yyc3-catering-platform',
      audience: 'yyc3-api'
    });
  }

  /**
   * 验证JWT令牌
   * SECURITY FIX: Use jsonwebtoken library for secure verification
   */
  public async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'yyc3-catering-platform',
        audience: 'yyc3-api'
      }) as JWTPayload;
      return decoded;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('令牌已过期');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('无效的令牌签名');
      }
      throw new Error('无效的令牌');
    }
  }

  /**
   * 认证中间件
   */
  public authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        res.status(401).json({ 
          success: false, 
          error: '未提供认证令牌',
          code: 'UNAUTHORIZED' 
        });
        return;
      }

      const [bearer, token] = authHeader.split(' ');
      
      if (bearer !== 'Bearer' || !token) {
        res.status(401).json({ 
          success: false, 
          error: '认证格式无效',
          code: 'INVALID_AUTH_FORMAT' 
        });
        return;
      }

      const payload = await this.verifyToken(token);
      
      // 将用户信息添加到请求对象
      (req as any).user = {
        userId: payload.userId,
        role: payload.role,
        restaurantId: payload.restaurantId
      };

      next();
    } catch (error) {
      res.status(401).json({ 
        success: false, 
        error: error instanceof Error ? error.message : '认证失败',
        code: 'AUTHENTICATION_FAILED' 
      });
      return;
    }
  };

  /**
   * 角色授权中间件
   */
  public authorizeRoles = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const user = (req as any).user;
        
        if (!user) {
          res.status(401).json({ 
            success: false, 
            error: '未认证',
            code: 'UNAUTHORIZED' 
          });
          return;
        }

        if (!allowedRoles.includes(user.role)) {
          res.status(403).json({ 
            success: false, 
            error: '权限不足',
            code: 'FORBIDDEN' 
          });
          return;
        }

        next();
      } catch (error) {
        res.status(500).json({ 
          success: false, 
          error: '授权过程中发生错误',
          code: 'AUTHORIZATION_ERROR' 
        });
        return;
      }
    };
  };

  /**
   * 餐厅权限验证中间件
   */
  public authorizeRestaurant = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = (req as any).user;
      const restaurantId = req.params.restaurantId || (req.body as any)?.restaurantId;
      
      if (!user) {
        res.status(401).json({ 
          success: false, 
          error: '未认证',
          code: 'UNAUTHORIZED' 
        });
        return;
      }

      // 管理员可以访问所有餐厅
      if (user.role === 'admin') {
        next();
        return;
      }

      // 餐厅员工只能访问自己的餐厅
      if (user.restaurantId !== restaurantId) {
        res.status(403).json({ 
          success: false, 
          error: '无权访问此餐厅',
          code: 'FORBIDDEN_RESTAURANT_ACCESS' 
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: '餐厅权限验证过程中发生错误',
        code: 'RESTAURANT_AUTH_ERROR' 
      });
      return;
    }
  };

  /**
   * 验证用户ID中间件
   */
  public validateUserId = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const userId = req.params.userId;
      const user = (req as any).user;
      
      if (!user) {
        res.status(401).json({ 
          success: false, 
          error: '未认证',
          code: 'UNAUTHORIZED' 
        });
        return;
      }

      // 管理员可以访问所有用户
      if (user.role === 'admin') {
        next();
        return;
      }

      // 普通用户只能访问自己的信息
      if (user.userId !== userId) {
        res.status(403).json({ 
          success: false, 
          error: '无权访问此用户信息',
          code: 'FORBIDDEN_USER_ACCESS' 
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: '用户ID验证过程中发生错误',
        code: 'USER_ID_AUTH_ERROR' 
      });
      return;
    }
  };

  /**
   * 可选认证中间件（用于部分端点）
   */
  public optionalAuthenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (authHeader) {
        const [bearer, token] = authHeader.split(' ');
        
        if (bearer === 'Bearer' && token) {
          try {
            const payload = await this.verifyToken(token);
            (req as any).user = {
              userId: payload.userId,
              role: payload.role,
              restaurantId: payload.restaurantId
            };
          } catch (error) {
            // 可选认证，令牌无效不影响请求
          }
        }
      }

      next();
    } catch (error) {
      next();
    }
  };

  /**
   * 生成刷新令牌 (简化版，使用Node.js内置crypto模块)
   */
  public async generateRefreshToken(userId: string): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const refreshExpiration = 7 * 24 * 3600; // 7天
    
    const payload = {
      userId,
      type: 'refresh',
      iat: now,
      exp: now + refreshExpiration
    };

    // 使用Node.js内置crypto模块生成JWT
    const header = Buffer.from(JSON.stringify({ alg: JWT_ALGORITHM, typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    return `${header}.${body}.${signature}`;
  }

  /**
   * 验证刷新令牌 (简化版，使用Node.js内置crypto模块)
   */
  public async verifyRefreshToken(token: string): Promise<{ userId: string }> {
    try {
      const [header, body, signature] = token.split('.');
      if (!header || !body || !signature) {
        throw new Error('无效的令牌格式');
      }

      // 验证签名
      const expectedSignature = createHmac('sha256', JWT_SECRET)
        .update(`${header}.${body}`)
        .digest('base64url');

      if (signature !== expectedSignature) {
        throw new Error('无效的令牌签名');
      }

      // 解析有效载荷
      const payload = JSON.parse(Buffer.from(body, 'base64url').toString());

      // 检查令牌类型和过期时间
      if (payload.type !== 'refresh') {
        throw new Error('不是刷新令牌');
      }

      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        throw new Error('令牌已过期');
      }

      return {
        userId: payload.userId
      };
    } catch (error) {
      throw new Error('无效的刷新令牌');
    }
  }

  /**
   * 检查令牌是否即将过期
   */
  public isTokenExpiringSoon(token: string, thresholdSeconds: number = 300): boolean {
    try {
      const decoded = this.decodeToken(token);
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp - now < thresholdSeconds;
    } catch (error) {
      return true;
    }
  }

  /**
   * 解码令牌（不验证签名）
   */
  public decodeToken(token: string): JWTPayload {
    const [, payloadBase64] = token.split('.');
    const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    return JSON.parse(payloadJson) as JWTPayload;
  }

  /**
   * 生成临时访问令牌（用于特定操作）(简化版，使用Node.js内置crypto模块)
   */
  public async generateTemporaryToken(data: any, expiresIn: string = '5m'): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    let expirationSeconds: number;

    const timeUnit = expiresIn.slice(-1);
    const timeValue = parseInt(expiresIn.slice(0, -1), 10);

    switch (timeUnit) {
      case 's':
        expirationSeconds = timeValue;
        break;
      case 'm':
        expirationSeconds = timeValue * 60;
        break;
      case 'h':
        expirationSeconds = timeValue * 3600;
        break;
      case 'd':
        expirationSeconds = timeValue * 86400;
        break;
      default:
        expirationSeconds = 300; // 默认5分钟
    }

    const payload = {
      ...data,
      type: 'temporary',
      iat: now,
      exp: now + expirationSeconds
    };

    // 使用Node.js内置crypto模块生成JWT
    const header = Buffer.from(JSON.stringify({ alg: JWT_ALGORITHM, typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    return `${header}.${body}.${signature}`;
  }

  /**
   * 验证临时令牌 (简化版，使用Node.js内置crypto模块)
   */
  public async verifyTemporaryToken(token: string): Promise<any> {
    try {
      const [header, body, signature] = token.split('.');
      if (!header || !body || !signature) {
        throw new Error('无效的令牌格式');
      }

      // 验证签名
      const expectedSignature = createHmac('sha256', JWT_SECRET)
        .update(`${header}.${body}`)
        .digest('base64url');

      if (signature !== expectedSignature) {
        throw new Error('无效的令牌签名');
      }

      // 解析有效载荷
      const payload = JSON.parse(Buffer.from(body, 'base64url').toString());

      // 检查令牌类型和过期时间
      if (payload.type !== 'temporary') {
        throw new Error('不是临时令牌');
      }

      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        throw new Error('令牌已过期');
      }

      return payload;
    } catch (error) {
      throw new Error('无效的临时令牌');
    }
  }
}

// 导出单例实例
export const authenticationMiddleware = new AuthenticationMiddleware();

// 导出便捷方法
export const authenticateToken = authenticationMiddleware.authenticate;
export const authorizeRoles = authenticationMiddleware.authorizeRoles;
export const authorizeRestaurant = authenticationMiddleware.authorizeRestaurant;
export const validateUserId = authenticationMiddleware.validateUserId;
export const optionalAuthenticate = authenticationMiddleware.optionalAuthenticate;
export const generateToken = authenticationMiddleware.generateToken;
export const verifyToken = authenticationMiddleware.verifyToken;
export const generateRefreshToken = authenticationMiddleware.generateRefreshToken;
export const verifyRefreshToken = authenticationMiddleware.verifyRefreshToken;
export const generateTemporaryToken = authenticationMiddleware.generateTemporaryToken;
export const verifyTemporaryToken = authenticationMiddleware.verifyTemporaryToken;
