/**
 * @fileoverview YYC³ API网关认证中间件
 * @description JWT令牌认证和权限验证
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-08
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AuthenticationConfig } from '../types/gateway';
import { logger } from '../utils/logger';
import { KeyManagerFactory } from '@yyc3/key-management';
import path from 'path';

// 初始化密钥管理器（异步）
let keyManager: any;

// 异步初始化密钥管理器
(async () => {
  try {
    keyManager = KeyManagerFactory.createKeyManager({
      keyStore: {
        type: 'local',
        path: path.join(__dirname, '../../keys'),
        encryptionKey: process.env.KEY_STORE_ENCRYPTION_KEY || 'yyc3-key-store-encryption-key',
      },
      defaultExpirationDays: 90,
      autoRotationEnabled: true,
      rotationIntervalDays: 30,
      backupStrategy: {
        enabled: true,
        path: path.join(__dirname, '../../backups'),
        intervalDays: 7,
        encrypted: true,
      },
      highAvailability: {
        enabled: true,
        healthCheckInterval: 60000,
        failoverEnabled: false,
      },
    });
    await keyManager.initialize();
    logger.info('Key Manager initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Key Manager:', error);
    // 如果初始化失败，使用默认密钥作为备份
    logger.warn('Falling back to default JWT secret');
  }
})();

// 获取JWT密钥的辅助函数
async function getJwtSecret(config: AuthenticationConfig): Promise<string> {
  try {
    if (keyManager) {
      const key = await keyManager.getKey('jwt-secret');
      if (key) {
        return key;
      }
    }
  } catch (error) {
    logger.error('Error getting JWT secret from Key Manager:', error);
  }
  // 如果密钥管理器不可用或失败，使用配置中的默认密钥
  return config.jwt.secret;
}

export class AuthenticationMiddleware {
  private config: AuthenticationConfig;

  constructor(config: AuthenticationConfig) {
    this.config = config;
  }

  /**
   * JWT认证中间件
   */
  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 检查认证是否启用
    if (!this.config.enabled) {
      return next();
    }

    // 检查是否在排除路径中
    if (this.isExcludedPath(req.path)) {
      return next();
    }

    // 获取Authorization头
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return this.unauthorized(res, 'Missing authorization header');
    }

    // 检查Bearer token格式
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return this.unauthorized(res, 'Invalid authorization header format');
    }

    const token = parts[1];

    try {
      // 验证JWT令牌
      const secret = await getJwtSecret(this.config);
      const decoded = jwt.verify(token, secret, {
        algorithms: this.config.jwt.algorithms as jwt.Algorithm[]
      }) as any;

      // 验证签发者和受众
      if (decoded.iss !== this.config.jwt.issuer) {
        return this.unauthorized(res, 'Invalid token issuer');
      }

      if (!decoded.aud || !decoded.aud.includes(this.config.jwt.audience)) {
        return this.unauthorized(res, 'Invalid token audience');
      }

      // 检查令牌是否过期
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        return this.unauthorized(res, 'Token has expired');
      }

      // 将用户信息添加到请求对象
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        roles: decoded.roles || [],
        permissions: decoded.permissions || [],
        iat: decoded.iat,
        exp: decoded.exp
      };

      // 添加请求上下文
      req.context = {
        userId: decoded.sub,
        authenticated: true,
        authTime: Date.now()
      };

      // 记录认证成功
      const ip = req.ip || req.socket.remoteAddress || '';
      logger.info('Authentication successful', {
        ip,
        userId: decoded.sub,
        email: decoded.email,
        roles: decoded.roles || [],
        path: req.path,
        method: req.method
      });

      next();
    } catch (error) {
      const ip = req.ip || req.socket.remoteAddress || '';
      
      if (error instanceof jwt.TokenExpiredError) {
        logger.warn('Authentication failed: Token expired', {
          ip,
          path: req.path,
          method: req.method,
          error: error.message
        });
        return this.unauthorized(res, 'Token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        logger.warn('Authentication failed: Invalid token', {
          ip,
          path: req.path,
          method: req.method,
          error: error.message
        });
        return this.unauthorized(res, 'Invalid token');
      } else {
        logger.error('Authentication error', {
          ip,
          path: req.path,
          method: req.method,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        return this.unauthorized(res, 'Authentication failed');
      }
    }
  };

  /**
   * 权限检查中间件
   */
  requirePermissions = (permissions: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        const ip = req.ip || req.socket.remoteAddress || '';
        logger.warn('Permission check failed: Not authenticated', {
          ip,
          path: req.path,
          method: req.method,
          requiredPermissions: permissions
        });
        return this.unauthorized(res, 'Authentication required');
      }

      const userPermissions = req.user.permissions || [];
      const hasPermission = permissions.every(permission =>
        userPermissions.includes(permission) || userPermissions.includes('*')
      );

      if (!hasPermission) {
        const ip = req.ip || req.socket.remoteAddress || '';
        logger.warn('Permission check failed: Insufficient permissions', {
          ip,
          userId: req.user.id,
          email: req.user.email,
          path: req.path,
          method: req.method,
          requiredPermissions: permissions,
          userPermissions
        });
        return this.forbidden(res, 'Insufficient permissions');
      }

      // 记录权限检查成功
      const ip = req.ip || req.socket.remoteAddress || '';
      logger.info('Permission check successful', {
        ip,
        userId: req.user.id,
        email: req.user.email,
        path: req.path,
        method: req.method,
        checkedPermissions: permissions
      });

      next();
    };
  };

  /**
   * 角色检查中间件
   */
  requireRoles = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        const ip = req.ip || req.socket.remoteAddress || '';
        logger.warn('Role check failed: Not authenticated', {
          ip,
          path: req.path,
          method: req.method,
          requiredRoles: roles
        });
        return this.unauthorized(res, 'Authentication required');
      }

      const userRoles = req.user.roles || [];
      const hasRole = roles.some(role =>
        userRoles.includes(role) || userRoles.includes('admin')
      );

      if (!hasRole) {
        const ip = req.ip || req.socket.remoteAddress || '';
        logger.warn('Role check failed: Insufficient role privileges', {
          ip,
          userId: req.user.id,
          email: req.user.email,
          path: req.path,
          method: req.method,
          requiredRoles: roles,
          userRoles
        });
        return this.forbidden(res, 'Insufficient role privileges');
      }

      // 记录角色检查成功
      const ip = req.ip || req.socket.remoteAddress || '';
      logger.info('Role check successful', {
        ip,
        userId: req.user.id,
        email: req.user.email,
        path: req.path,
        method: req.method,
        checkedRoles: roles
      });

      next();
    };
  };

  /**
   * 可选认证中间件（不强制要求认证）
   */
  optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 检查认证是否启用
    if (!this.config.enabled) {
      return next();
    }

    // 获取Authorization头
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next(); // 没有认证头，继续执行
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next(); // 格式错误，继续执行
    }

    const token = parts[1];

    try {
      const secret = await getJwtSecret(this.config);
      const decoded = jwt.verify(token, secret, {
        algorithms: this.config.jwt.algorithms as jwt.Algorithm[]
      }) as any;

      // 验证令牌
      if (decoded.iss !== this.config.jwt.issuer) {
        return next();
      }

      if (!decoded.aud || !decoded.aud.includes(this.config.jwt.audience)) {
        return next();
      }

      // 添加用户信息
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        roles: decoded.roles || [],
        permissions: decoded.permissions || []
      };

      req.context = {
        userId: decoded.sub,
        authenticated: true,
        authTime: Date.now()
      };

      next();
    } catch (error) {
      // 认证失败，但不阻止请求继续
      next();
    }
  };

  /**
   * 刷新令牌中间件
   */
  public async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 从请求中提取刷新令牌
      const refreshToken = req.body.refreshToken;

      if (!refreshToken) {
        return this.unauthorized(res, 'No refresh token provided');
      }

      try {
        // 创建JWTUtils实例
        const jwtUtils = new JWTUtils(this.config.jwt);
        
        // 验证刷新令牌
        const decoded = await jwtUtils.verifyRefreshToken(refreshToken);

        // 生成新的访问令牌
        const accessToken = await jwtUtils.generateToken({
          sub: decoded.sub,
          email: decoded.email,
          roles: decoded.roles,
          permissions: decoded.permissions,
        });

        // 生成新的刷新令牌
        const newRefreshToken = await jwtUtils.generateRefreshToken({
          sub: decoded.sub,
          type: 'refresh',
        });

        // 返回新的访问令牌和刷新令牌
        return res.status(200).json({
          accessToken,
          refreshToken: newRefreshToken,
        });
      } catch (error: any) {
        logger.error('Refresh token verification failed:', error);
        return this.unauthorized(res, 'Invalid refresh token');
      }
    } catch (error: any) {
      logger.error('Refresh token error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * 检查路径是否需要认证
   */
  private isExcludedPath(path: string): boolean {
    return this.config.excludePaths.some(excludedPath => {
      // 支持通配符匹配
      if (excludedPath.includes('*')) {
        const regex = new RegExp(excludedPath.replace(/\*/g, '.*'));
        return regex.test(path);
      }
      return path.startsWith(excludedPath);
    });
  }

  /**
   * 返回401未授权错误
   */
  private unauthorized(res: Response, message: string): void {
    res.status(401).json({
      success: false,
      error: message,
      code: 'UNAUTHORIZED',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 返回403禁止访问错误
   */
  private forbidden(res: Response, message: string): void {
    res.status(403).json({
      success: false,
      error: message,
      code: 'FORBIDDEN',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * JWT工具类
 */
export class JWTUtils {
  private config: AuthenticationConfig['jwt'];

  constructor(config: AuthenticationConfig['jwt']) {
    this.config = config;
  }

  /**
   * 生成JWT令牌
   */
  async generateToken(payload: {
    sub: string;
    email: string;
    roles?: string[];
    permissions?: string[];
    [key: string]: any;
  }): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    // 创建临时配置对象以符合getJwtSecret的参数要求
    const tempConfig = {
      jwt: this.config,
    } as AuthenticationConfig;

    const secret = await getJwtSecret(tempConfig);
    return jwt.sign(payload, secret, {
      algorithm: this.config.algorithms[0] as jwt.Algorithm,
      issuer: this.config.issuer,
      audience: this.config.audience,
      expiresIn: '2h',
      iat: now,
      jwtid: this.generateJTI()
    });
  }

  /**
   * 生成刷新令牌
   */
  async generateRefreshToken(payload: {
    sub: string;
    type: 'refresh';
  }): Promise<string> {
    // 创建临时配置对象以符合getJwtSecret的参数要求
    const tempConfig = {
      jwt: this.config,
    } as AuthenticationConfig;

    const secret = await getJwtSecret(tempConfig);
    return jwt.sign(payload, secret, {
      algorithm: this.config.algorithms[0] as jwt.Algorithm,
      issuer: this.config.issuer,
      audience: this.config.audience,
      expiresIn: '7d'
    });
  }

  /**
   * 验证刷新令牌
   */
  async verifyRefreshToken(token: string): Promise<any> {
    try {
      // 创建临时配置对象以符合getJwtSecret的参数要求
      const tempConfig = {
        jwt: this.config,
      } as AuthenticationConfig;

      const secret = await getJwtSecret(tempConfig);
      return jwt.verify(token, secret, {
        algorithms: this.config.algorithms as jwt.Algorithm[],
        issuer: this.config.issuer,
        audience: this.config.audience
      });
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * 从令牌中提取用户ID
   */
  extractUserId(token: string): string {
    try {
      const decoded = jwt.decode(token) as any;
      return decoded.sub;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * 生成JWT ID
   */
  private generateJTI(): string {
    return `jti_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 扩展Request接口
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        roles: string[];
        permissions: string[];
        iat?: number;
        exp?: number;
      };
      context?: {
        userId?: string;
        authenticated?: boolean;
        authTime?: number;
      };
    }
  }
}