/**
 * @fileoverview YYC³身份验证中间件单元测试
 * @description 测试身份验证中间件的所有功能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-07
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthenticationMiddleware, authMiddleware, JWTPayload } from '../../../middleware/auth';

vi.mock('../../../config/database', () => ({
  dbManager: {
    query: vi.fn().mockImplementation((sql: string, params: any[]) => {
      const normalizedSql = sql.replace(/\s+/g, ' ').trim();
      if (normalizedSql.includes('SELECT id, email, role, status FROM users')) {
        return Promise.resolve({
          rows: [{
            id: params[0],
            email: 'test@example.com',
            role: 'user',
            status: 'active'
          }]
        });
      }
      return Promise.resolve({ rows: [] });
    })
  }
}));

describe('AuthenticationMiddleware', () => {
  let auth: AuthenticationMiddleware;

  beforeEach(() => {
    vi.clearAllMocks();
    auth = new AuthenticationMiddleware();
  });

  describe('generateToken', () => {
    it('应该成功生成JWT令牌', () => {
      const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'admin',
        restaurantId: 'restaurant1'
      };

      const token = auth.generateToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('应该生成包含用户信息的令牌', () => {
      const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'user'
      };

      const token = auth.generateToken(payload);
      expect(token).toBeDefined();
    });

    it('应该为不同用户生成不同的令牌', () => {
      const payload1: Omit<JWTPayload, 'iat' | 'exp'> = {
        userId: 'user1',
        email: 'user1@example.com',
        role: 'user'
      };

      const payload2: Omit<JWTPayload, 'iat' | 'exp'> = {
        userId: 'user2',
        email: 'user2@example.com',
        role: 'user'
      };

      const token1 = auth.generateToken(payload1);
      const token2 = auth.generateToken(payload2);

      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('应该成功验证有效的令牌', async () => {
      const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'user'
      };

      const token = auth.generateToken(payload);
      const result = await auth.verifyToken(token);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.id).toBe(payload.userId);
    });

    it('应该拒绝空的令牌', async () => {
      const result = await auth.verifyToken('');
      expect(result.success).toBe(false);
      expect(result.error).toBe('缺少身份验证令牌');
      expect(result.code).toBe('MISSING_TOKEN');
    });

    it('应该拒绝无效的令牌格式', async () => {
      const result = await auth.verifyToken('invalid.token');
      expect(result.success).toBe(false);
      expect(result.error).toContain('无效');
    });

    it('应该拒绝过期的令牌', async () => {
      const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'user'
      };

      // 创建一个过期的令牌（通过直接构造payload）
      const header = {
        alg: 'HS256',
        typ: 'JWT'
      };

      const now = Math.floor(Date.now() / 1000);
      const expiredPayload = {
        ...payload,
        iat: now,
        exp: now - 3600 // 1小时前过期
      };

      const crypto = require('crypto');
      const jwtSecret = process.env.JWT_SECRET || 'yyc3-super-secret-jwt-key-for-api-service-2025';

      const encodedHeader = Buffer.from(JSON.stringify(header))
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const encodedPayload = Buffer.from(JSON.stringify(expiredPayload))
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const signature = crypto.createHmac('sha256', jwtSecret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('hex');

      const encodedSignature = Buffer.from(signature)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const expiredToken = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;

      const result = await auth.verifyToken(expiredToken);
      expect(result.success).toBe(false);
      expect(result.error).toContain('过期');
    });

    it('应该拒绝无效的签名', async () => {
      const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'user'
      };

      const token = auth.generateToken(payload);
      const parts = token.split('.');
      const tamperedToken = `${parts[0]}.${parts[1]}.invalidsignature`;

      const result = await auth.verifyToken(tamperedToken);
      expect(result.success).toBe(false);
      expect(result.error).toContain('签名');
    });

    it('应该支持Bearer前缀', async () => {
      const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'user'
      };

      const token = auth.generateToken(payload);
      const result = await auth.verifyToken(`Bearer ${token}`);

      expect(result.success).toBe(true);
    });
  });

  describe('authenticate', () => {
    it('应该成功验证包含有效令牌的请求', async () => {
      const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'user'
      };

      const token = auth.generateToken(payload);
      const request = new Request('http://example.com', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await auth.authenticate()(request);
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
    });

    it('应该拒绝缺少Authorization头的请求', async () => {
      const request = new Request('http://example.com');
      const result = await auth.authenticate()(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Authorization');
    });

    it('应该拒绝包含无效令牌的请求', async () => {
      const request = new Request('http://example.com', {
        headers: {
          'Authorization': 'Bearer invalid.token'
        }
      });

      const result = await auth.authenticate()(request);
      expect(result.success).toBe(false);
    });
  });

  describe('authorize', () => {
    it('应该允许有权限的用户访问', async () => {
      const user = { id: 'user123', role: 'admin' };
      const request = new Request('http://example.com');
      const allowedRoles = ['admin', 'super_admin'];

      const result = await auth.authorize(allowedRoles)(request, user);
      expect(result.success).toBe(true);
    });

    it('应该拒绝无权限的用户访问', async () => {
      const user = { id: 'user123', role: 'user' };
      const request = new Request('http://example.com');
      const allowedRoles = ['admin', 'super_admin'];

      const result = await auth.authorize(allowedRoles)(request, user);
      expect(result.success).toBe(false);
      expect(result.error).toContain('权限不足');
    });

    it('应该拒绝缺少用户信息的请求', async () => {
      const request = new Request('http://example.com');
      const allowedRoles = ['admin'];

      const result = await auth.authorize(allowedRoles)(request);
      expect(result.success).toBe(false);
      expect(result.error).toContain('用户身份信息缺失');
    });
  });

  describe('authorizeRestaurantAccess', () => {
    it('应该允许管理员访问所有餐厅', async () => {
      const user = { id: 'user123', role: 'admin' };
      const request = new Request('http://example.com');

      const result = await auth.authorizeRestaurantAccess()(request, user);
      expect(result.success).toBe(true);
    });

    it('应该允许超级管理员访问所有餐厅', async () => {
      const user = { id: 'user123', role: 'super_admin' };
      const request = new Request('http://example.com');

      const result = await auth.authorizeRestaurantAccess()(request, user);
      expect(result.success).toBe(true);
    });

    it('应该允许餐厅管理员访问自己的餐厅', async () => {
      const user = { id: 'user123', role: 'restaurant_admin', restaurantId: 'restaurant1' };
      const request = new Request('http://example.com');

      const result = await auth.authorizeRestaurantAccess()(request, user);
      expect(result.success).toBe(true);
    });

    it('应该拒绝缺少餐厅ID的餐厅管理员', async () => {
      const user = { id: 'user123', role: 'restaurant_admin' };
      const request = new Request('http://example.com');

      const result = await auth.authorizeRestaurantAccess()(request, user);
      expect(result.success).toBe(false);
      expect(result.error).toContain('餐厅关联');
    });

    it('应该拒绝普通用户访问餐厅', async () => {
      const user = { id: 'user123', role: 'user' };
      const request = new Request('http://example.com');

      const result = await auth.authorizeRestaurantAccess()(request, user);
      expect(result.success).toBe(false);
      expect(result.error).toContain('权限不足');
    });
  });

  describe('optionalAuthenticate', () => {
    it('应该成功验证包含令牌的请求', async () => {
      const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'user'
      };

      const token = auth.generateToken(payload);
      const request = new Request('http://example.com', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await auth.optionalAuthenticate()(request);
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
    });

    it('应该允许没有令牌的请求通过', async () => {
      const request = new Request('http://example.com');
      const result = await auth.optionalAuthenticate()(request);

      expect(result.success).toBe(true);
      expect(result.user).toBeUndefined();
    });

    it('应该在令牌验证失败时不返回错误', async () => {
      const request = new Request('http://example.com', {
        headers: {
          'Authorization': 'Bearer invalid.token'
        }
      });

      const result = await auth.optionalAuthenticate()(request);
      expect(result.success).toBe(true);
      expect(result.user).toBeUndefined();
    });
  });

  describe('createAuthResponse', () => {
    it('应该为成功的验证创建成功响应', () => {
      const result = {
        success: true,
        user: { id: 'user123', role: 'admin' }
      };

      const response = auth.createAuthResponse(result);
      expect(response.status).toBe(200);
    });

    it('应该为失败的验证创建401响应', () => {
      const result = {
        success: false,
        error: '无效的令牌',
        code: 'INVALID_TOKEN'
      };

      const response = auth.createAuthResponse(result);
      expect(response.status).toBe(401);
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });
  });

  describe('createAuthzResponse', () => {
    it('应该为成功的授权创建成功响应', () => {
      const result = { success: true };
      const response = auth.createAuthzResponse(result);

      expect(response.status).toBe(200);
    });

    it('应该为失败的授权创建403响应', () => {
      const result = {
        success: false,
        error: '权限不足',
        code: 'INSUFFICIENT_PERMISSIONS'
      };

      const response = auth.createAuthzResponse(result);
      expect(response.status).toBe(403);
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });
  });

  describe('单例实例', () => {
    it('应该导出单例实例', () => {
      expect(authMiddleware).toBeInstanceOf(AuthenticationMiddleware);
    });

    it('应该导出便捷方法', () => {
      expect(typeof authMiddleware.generateToken).toBe('function');
      expect(typeof authMiddleware.verifyToken).toBe('function');
      expect(typeof authMiddleware.authenticate).toBe('function');
      expect(typeof authMiddleware.authorize).toBe('function');
    });
  });
});
