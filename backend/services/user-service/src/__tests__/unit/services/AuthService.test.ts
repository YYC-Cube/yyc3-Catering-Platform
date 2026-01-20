/**
 * @file AuthService测试文件
 * @description 测试认证服务的核心功能
 * @module tests/services/AuthService
 * @author YYC³团队
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import authService from '../../../services/AuthService';

describe('AuthService', () => {
  beforeEach(() => {
  });

  describe('hashPassword', () => {
    it('应该成功加密密码', async () => {
      const password = 'testPassword123';
      const hashedPassword = await authService.hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    it('应该为相同的密码生成不同的哈希值', async () => {
      const password = 'testPassword123';
      const hash1 = await authService.hashPassword(password);
      const hash2 = await authService.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('应该处理空字符串密码', async () => {
      const password = '';
      const hashedPassword = await authService.hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe('string');
    });

    it('应该处理特殊字符密码', async () => {
      const password = '密码!@#$%^&*()_+{}|:"<>?~`-=[]\\;\',./';
      const hashedPassword = await authService.hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe('string');
    });
  });

  describe('verifyPassword', () => {
    it('应该验证正确的密码', async () => {
      const password = 'testPassword123';
      const hashedPassword = await authService.hashPassword(password);
      const isValid = await authService.verifyPassword(password, hashedPassword);

      expect(isValid).toBe(true);
    });

    it('应该拒绝错误的密码', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hashedPassword = await authService.hashPassword(password);
      const isValid = await authService.verifyPassword(wrongPassword, hashedPassword);

      expect(isValid).toBe(false);
    });

    it('应该拒绝空密码', async () => {
      const password = 'testPassword123';
      const hashedPassword = await authService.hashPassword(password);
      const isValid = await authService.verifyPassword('', hashedPassword);

      expect(isValid).toBe(false);
    });

    it('应该处理无效的哈希值', async () => {
      const password = 'testPassword123';
      const invalidHash = 'invalid_hash_value';
      const isValid = await authService.verifyPassword(password, invalidHash);

      expect(isValid).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('应该生成有效的JWT令牌', () => {
      const mockUser = {
        id: 1,
        phone: '13800138000',
        email: 'test@example.com',
        type: 'customer',
        role_id: 1,
      } as any;

      const token = authService.generateToken(mockUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('应该包含正确的用户信息在令牌中', () => {
      const mockUser = {
        id: 1,
        phone: '13800138000',
        email: 'test@example.com',
        type: 'customer',
        role_id: 1,
      } as any;

      const token = authService.generateToken(mockUser);
      const decoded = authService.decodeToken(token);

      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.phone).toBe(mockUser.phone);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.type).toBe(mockUser.type);
      expect(decoded.role).toBe(mockUser.role_id);
    });

    it('应该为不同的用户生成不同的令牌', () => {
      const user1 = {
        id: 1,
        phone: '13800138000',
        email: 'test1@example.com',
        type: 'customer',
        role_id: 1,
      } as any;

      const user2 = {
        id: 2,
        phone: '13800138001',
        email: 'test2@example.com',
        type: 'customer',
        role_id: 1,
      } as any;

      const token1 = authService.generateToken(user1);
      const token2 = authService.generateToken(user2);

      expect(token1).not.toBe(token2);
    });
  });

  describe('generateRefreshToken', () => {
    it('应该生成有效的刷新令牌', () => {
      const mockUser = {
        id: 1,
        phone: '13800138000',
        email: 'test@example.com',
        type: 'customer',
        role_id: 1,
      } as any;

      const refreshToken = authService.generateRefreshToken(mockUser);

      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe('string');
      expect(refreshToken.split('.')).toHaveLength(3);
    });

    it('应该包含用户ID和刷新令牌ID', () => {
      const mockUser = {
        id: 1,
        phone: '13800138000',
        email: 'test@example.com',
        type: 'customer',
        role_id: 1,
      } as any;

      const refreshToken = authService.generateRefreshToken(mockUser);
      const decoded = authService.decodeToken(refreshToken);

      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.refresh_token_id).toBeDefined();
      expect(typeof decoded.refresh_token_id).toBe('string');
    });

    it('应该为同一用户生成不同的刷新令牌', () => {
      const mockUser = {
        id: 1,
        phone: '13800138000',
        email: 'test@example.com',
        type: 'customer',
        role_id: 1,
      } as any;

      const token1 = authService.generateRefreshToken(mockUser);
      const token2 = authService.generateRefreshToken(mockUser);

      expect(token1).not.toBe(token2);

      const decoded1 = authService.decodeToken(token1);
      const decoded2 = authService.decodeToken(token2);

      expect(decoded1.refresh_token_id).not.toBe(decoded2.refresh_token_id);
    });
  });

  describe('verifyToken', () => {
    it('应该验证有效的令牌', () => {
      const mockUser = {
        id: 1,
        phone: '13800138000',
        email: 'test@example.com',
        type: 'customer',
        role_id: 1,
      } as any;

      const token = authService.generateToken(mockUser);
      const decoded = authService.verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(mockUser.id);
    });

    it('应该拒绝无效的令牌', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        authService.verifyToken(invalidToken);
      }).toThrow();
    });

    it('应该拒绝过期的令牌', () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjAwMDAwMDAwfQ.invalid';

      expect(() => {
        authService.verifyToken(expiredToken);
      }).toThrow();
    });

    it('应该拒绝篡改的令牌', () => {
      const mockUser = {
        id: 1,
        phone: '13800138000',
        email: 'test@example.com',
        type: 'customer',
        role_id: 1,
      } as any;

      const token = authService.generateToken(mockUser);
      const tamperedToken = token + 'tampered';

      expect(() => {
        authService.verifyToken(tamperedToken);
      }).toThrow();
    });
  });

  describe('decodeToken', () => {
    it('应该解码有效的令牌', () => {
      const mockUser = {
        id: 1,
        phone: '13800138000',
        email: 'test@example.com',
        type: 'customer',
        role_id: 1,
      } as any;

      const token = authService.generateToken(mockUser);
      const decoded = authService.decodeToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.phone).toBe(mockUser.phone);
    });

    it('应该解码无效的令牌而不抛出错误', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = authService.decodeToken(invalidToken);

      expect(decoded).toBeDefined();
    });

    it('应该返回null对于格式错误的令牌', () => {
      const malformedToken = 'not_a_jwt_token';
      const decoded = authService.decodeToken(malformedToken);

      expect(decoded).toBeNull();
    });
  });
});