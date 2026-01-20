/**
 * @fileoverview YYC³身份验证路由单元测试
 * @description 测试身份验证路由的所有功能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as authRoutes from '../../../routes/auth-routes';
import { dbManager } from '../../../config/database';
import * as authMiddleware from '../../../middleware/auth';
import * as middleware from '../../../middleware';

vi.mock('../../../config/database');
vi.mock('../../../middleware/auth');
vi.mock('bcrypt', () => ({
  compare: vi.fn(),
  hash: vi.fn()
}));
vi.mock('../../../middleware');

describe('Auth Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authMiddleware.generateToken).mockReturnValue('mock-jwt-token');
    vi.mocked(authMiddleware.verifyToken).mockResolvedValue({ success: true, user: { id: 'user123', email: 'test@example.com', role: 'user' } });
    vi.mocked(middleware.loginRateLimit).mockReturnValue(() => Promise.resolve({ success: true }));
    vi.mocked(middleware.registerRateLimit).mockReturnValue(() => Promise.resolve({ success: true }));
    vi.mocked(middleware.sanitize).mockImplementation((input: any) => ({ success: true, data: input }));
    vi.mocked(middleware.rateLimiter.createResponse).mockReturnValue(new Response(JSON.stringify({ success: false, error: 'Rate limit exceeded' }), { status: 429 }));
  });

  describe('login', () => {
    it('应该成功处理有效的登录请求', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        password_hash: 'hashed-password',
        name: 'Test User',
        role: 'user',
        status: 'active',
        last_login_at: new Date()
      };

      vi.mocked(dbManager.query).mockResolvedValue({
        rows: [mockUser],
        rowCount: 1
      });

      const bcrypt = await import('bcrypt');
      vi.mocked(bcrypt.compare).mockResolvedValue(true);

      const request = new Request('http://example.com/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
      });

      const response = await authRoutes.login(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.user.email).toBe('test@example.com');
    });

    it('应该处理无效的JSON请求体', async () => {
      const request = new Request('http://example.com/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      });

      const response = await authRoutes.login(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('请求体解析失败');
    });

    it('应该处理不存在的用户', async () => {
      vi.mocked(dbManager.query).mockResolvedValue({
        rows: [],
        rowCount: 0
      });

      const request = new Request('http://example.com/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nonexistent@example.com', password: 'password123' })
      });

      const response = await authRoutes.login(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('邮箱或密码错误');
    });

    it('应该处理被禁用的账户', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        password_hash: 'hashed-password',
        name: 'Test User',
        role: 'user',
        status: 'disabled',
        last_login_at: new Date()
      };

      vi.mocked(dbManager.query).mockResolvedValue({
        rows: [mockUser],
        rowCount: 1
      });

      const request = new Request('http://example.com/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
      });

      const response = await authRoutes.login(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toBe('账户已被禁用，请联系管理员');
    });

    it('应该处理限流检查失败', async () => {
      vi.mocked(middleware.loginRateLimit).mockReturnValue(() => Promise.resolve({ success: false, error: '请求过于频繁' }));

      const request = new Request('http://example.com/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
      });

      const response = await authRoutes.login(request);

      expect(response.status).toBe(429);
      expect(middleware.rateLimiter.createResponse).toHaveBeenCalled();
    });

    it('应该处理密码验证失败', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        password_hash: 'hashed-password',
        name: 'Test User',
        role: 'user',
        status: 'active',
        last_login_at: new Date()
      };

      vi.mocked(dbManager.query).mockResolvedValue({
        rows: [mockUser],
        rowCount: 1
      });

      const bcrypt = await import('bcrypt');
      vi.mocked(bcrypt.compare).mockResolvedValue(false);

      const request = new Request('http://example.com/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' })
      });

      const response = await authRoutes.login(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('邮箱或密码错误');
    });

    it('应该处理数据库连接失败并使用模拟模式', async () => {
      vi.mocked(dbManager.query).mockRejectedValue(new Error('ECONNREFUSED'));

      const request = new Request('http://example.com/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
      });

      const response = await authRoutes.login(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('模拟模式');
    });
  });

  describe('register', () => {
    it('应该成功处理有效的注册请求', async () => {
      vi.mocked(dbManager.query)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 })
        .mockResolvedValueOnce({
          rows: [{ id: 'user123', created_at: new Date() }],
          rowCount: 1
        });

      const request = new Request('http://example.com/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'new@example.com',
          password: 'password123',
          name: 'Test User'
        })
      });

      const response = await authRoutes.register(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.user.email).toBe('new@example.com');
    });

    it('应该处理无效的邮箱格式', async () => {
      const request = new Request('http://example.com/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User'
        })
      });

      const response = await authRoutes.register(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.errors).toContain('邮箱格式不正确');
    });

    it('应该处理过短的密码', async () => {
      const request = new Request('http://example.com/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: '123',
          name: 'Test User'
        })
      });

      const response = await authRoutes.register(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.errors).toContain('密码长度至少6位');
    });

    it('应该处理缺少用户名的情况', async () => {
      const request = new Request('http://example.com/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });

      const response = await authRoutes.register(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.errors).toContain('用户名是必填项');
    });

    it('应该处理无效的JSON请求体', async () => {
      const request = new Request('http://example.com/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      });

      const response = await authRoutes.register(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('请求体解析失败');
    });

    it('应该处理限流检查失败', async () => {
      vi.mocked(middleware.registerRateLimit).mockReturnValue(() => Promise.resolve({ success: false, error: '请求过于频繁' }));

      const request = new Request('http://example.com/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        })
      });

      const response = await authRoutes.register(request);

      expect(response.status).toBe(429);
      expect(middleware.rateLimiter.createResponse).toHaveBeenCalled();
    });

    it('应该处理数据库连接失败并使用模拟模式', async () => {
      vi.mocked(dbManager.query).mockRejectedValue(new Error('ECONNREFUSED'));

      const request = new Request('http://example.com/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        })
      });

      const response = await authRoutes.register(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.message).toContain('模拟模式');
      expect(data.data.user.email).toBe('test@example.com');
    });
  });

  describe('refreshToken', () => {
    it('应该成功刷新有效的令牌', async () => {
      const request = new Request('http://example.com/api/v1/auth/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: 'valid-refresh-token' })
      });

      const response = await authRoutes.refreshToken(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.token).toBe('mock-jwt-token');
    });

    it('应该处理无效的JSON请求体', async () => {
      const request = new Request('http://example.com/api/v1/auth/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      });

      const response = await authRoutes.refreshToken(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('请求体解析失败');
    });

    it('应该处理缺少刷新令牌的情况', async () => {
      const request = new Request('http://example.com/api/v1/auth/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const response = await authRoutes.refreshToken(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.errors).toContain('刷新令牌是必填项');
    });

    it('应该处理无效的刷新令牌', async () => {
      vi.mocked(authMiddleware.verifyToken).mockResolvedValue({ success: false, error: '无效的令牌' });

      const request = new Request('http://example.com/api/v1/auth/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: 'invalid-token' })
      });

      const response = await authRoutes.refreshToken(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('无效的刷新令牌');
    });

    it('应该处理刷新令牌过程中的错误', async () => {
      vi.mocked(authMiddleware.verifyToken).mockRejectedValue(new Error('Token verification failed'));

      const request = new Request('http://example.com/api/v1/auth/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: 'valid-token' })
      });

      const response = await authRoutes.refreshToken(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('刷新令牌过程中发生错误');
    });
  });

  describe('verifyTokenEndpoint', () => {
    it('应该成功验证有效的令牌', async () => {
      const request = new Request('http://example.com/api/v1/auth/verify', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer valid-token' }
      });

      const response = await authRoutes.verifyTokenEndpoint(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.user.id).toBe('user123');
    });

    it('应该处理缺少Authorization头的情况', async () => {
      const request = new Request('http://example.com/api/v1/auth/verify', {
        method: 'GET'
      });

      const response = await authRoutes.verifyTokenEndpoint(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('缺少Authorization头');
    });

    it('应该处理无效的令牌', async () => {
      vi.mocked(authMiddleware.verifyToken).mockResolvedValue({ success: false, error: '无效的令牌', code: 'INVALID_TOKEN' });

      const request = new Request('http://example.com/api/v1/auth/verify', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer invalid-token' }
      });

      const response = await authRoutes.verifyTokenEndpoint(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('无效的令牌');
    });

    it('应该处理验证令牌过程中的错误', async () => {
      vi.mocked(authMiddleware.verifyToken).mockRejectedValue(new Error('Token verification failed'));

      const request = new Request('http://example.com/api/v1/auth/verify', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer valid-token' }
      });

      const response = await authRoutes.verifyTokenEndpoint(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('验证令牌过程中发生错误');
    });
  });

  describe('logout', () => {
    it('应该成功登出用户', async () => {
      const request = new Request('http://example.com/api/v1/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await authRoutes.logout(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('登出成功');
    });
  });
});
