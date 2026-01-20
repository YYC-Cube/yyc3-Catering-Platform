/**
 * @fileoverview YYC³限流中间件单元测试
 * @description 测试API限流中间件的所有功能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { RateLimitMiddleware, rateLimiter, createRateLimit, rateLimitByIp, rateLimitByUser, strictRateLimit, loginRateLimit, registerRateLimit } from '../../../middleware/rate-limiter';

describe('RateLimitMiddleware', () => {
  let rateLimit: RateLimitMiddleware;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    rateLimit = new RateLimitMiddleware();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('构造函数和默认配置', () => {
    it('应该使用默认配置创建实例', () => {
      expect(rateLimit).toBeDefined();
    });

    it('应该从环境变量读取配置', () => {
      const originalWindowMs = process.env.RATE_LIMIT_WINDOW_MS;
      const originalMaxRequests = process.env.RATE_LIMIT_MAX_REQUESTS;

      process.env.RATE_LIMIT_WINDOW_MS = '30000';
      process.env.RATE_LIMIT_MAX_REQUESTS = '50';

      const customRateLimit = new RateLimitMiddleware();

      process.env.RATE_LIMIT_WINDOW_MS = originalWindowMs;
      process.env.RATE_LIMIT_MAX_REQUESTS = originalMaxRequests;

      expect(customRateLimit).toBeDefined();
    });
  });

  describe('MemoryStore', () => {
    it('应该正确存储和检索数据', () => {
      const store = (rateLimit as any).memoryStore;
      const testData = { count: 5, resetTime: Date.now() + 60000 };

      store.set('test-key', testData, 60000);
      const retrieved = store.get('test-key');

      expect(retrieved).toEqual(testData);
    });

    it('应该返回undefined对于不存在的键', () => {
      const store = (rateLimit as any).memoryStore;
      const retrieved = store.get('non-existent-key');

      expect(retrieved).toBeUndefined();
    });

    it('应该正确递增计数器', () => {
      const store = (rateLimit as any).memoryStore;
      const result1 = store.increment('increment-key', 60000);
      const result2 = store.increment('increment-key', 60000);

      expect(result1.count).toBe(1);
      expect(result2.count).toBe(2);
    });

    it('应该删除过期的记录', () => {
      const store = (rateLimit as any).memoryStore;
      const expiredData = { count: 5, resetTime: Date.now() - 1000 };

      store.set('expired-key', expiredData, 60000);
      const retrieved = store.get('expired-key');

      expect(retrieved).toBeUndefined();
    });

    it('应该正确删除记录', () => {
      const store = (rateLimit as any).memoryStore;
      store.set('delete-key', { count: 5, resetTime: Date.now() + 60000 }, 60000);

      store.delete('delete-key');
      const retrieved = store.get('delete-key');

      expect(retrieved).toBeUndefined();
    });

    it('应该清空所有记录', () => {
      const store = (rateLimit as any).memoryStore;
      store.set('key1', { count: 1, resetTime: Date.now() + 60000 }, 60000);
      store.set('key2', { count: 2, resetTime: Date.now() + 60000 }, 60000);

      expect(store.size()).toBe(2);

      store.clear();
      expect(store.size()).toBe(0);
    });
  });

  describe('create - 基本限流功能', () => {
    it('应该允许在限制内的请求', async () => {
      const middleware = rateLimit.create({
        windowMs: 60000,
        maxRequests: 10
      });

      const request = new Request('http://example.com');
      const result = await middleware(request);

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(9);
      expect(result.limit).toBe(10);
    });

    it('应该拒绝超过限制的请求', async () => {
      const middleware = rateLimit.create({
        windowMs: 60000,
        maxRequests: 2
      });

      const request = new Request('http://example.com');

      await middleware(request);
      await middleware(request);
      const result = await middleware(request);

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.error).toBe('请求过于频繁，请稍后再试');
      expect(result.code).toBe('TOO_MANY_REQUESTS');
    });

    it('应该使用自定义键生成器', async () => {
      const customKeyGenerator = vi.fn((request: Request) => 'custom-key');
      const middleware = rateLimit.create({
        windowMs: 60000,
        maxRequests: 5,
        keyGenerator: customKeyGenerator
      });

      const request = new Request('http://example.com');
      await middleware(request);

      expect(customKeyGenerator).toHaveBeenCalledWith(request);
    });

    it('应该在出错时允许请求通过', async () => {
      const errorKeyGenerator = vi.fn(() => {
        throw new Error('测试错误');
      });

      const middleware = rateLimit.create({
        windowMs: 60000,
        maxRequests: 5,
        keyGenerator: errorKeyGenerator
      });

      const request = new Request('http://example.com');
      const result = await middleware(request);

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(5);
    });

    it('应该正确计算剩余请求数', async () => {
      const middleware = rateLimit.create({
        windowMs: 60000,
        maxRequests: 10
      });

      const request = new Request('http://example.com');

      const result1 = await middleware(request);
      const result2 = await middleware(request);
      const result3 = await middleware(request);

      expect(result1.remaining).toBe(9);
      expect(result2.remaining).toBe(8);
      expect(result3.remaining).toBe(7);
    });
  });

  describe('byIp - 基于IP的限流', () => {
    it('应该基于IP地址进行限流', async () => {
      const middleware = rateLimit.byIp(60000, 5);

      const request1 = new Request('http://example.com', {
        headers: { 'x-forwarded-for': '192.168.1.1' }
      });

      const request2 = new Request('http://example.com', {
        headers: { 'x-forwarded-for': '192.168.1.2' }
      });

      const result1 = await middleware(request1);
      const result2 = await middleware(request2);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });

    it('应该从x-forwarded-for头获取IP', async () => {
      const middleware = rateLimit.byIp(60000, 5);

      const request = new Request('http://example.com', {
        headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' }
      });

      await middleware(request);

      const store = (rateLimit as any).memoryStore;
      const keys = Array.from((store as any).store.keys());

      expect(keys).toContain('ip:192.168.1.1');
    });

    it('应该从x-real-ip头获取IP', async () => {
      const middleware = rateLimit.byIp(60000, 5);

      const request = new Request('http://example.com', {
        headers: { 'x-real-ip': '192.168.1.1' }
      });

      await middleware(request);

      const store = (rateLimit as any).memoryStore;
      const keys = Array.from((store as any).store.keys());

      expect(keys).toContain('ip:192.168.1.1');
    });

    it('应该从cf-connecting-ip头获取IP', async () => {
      const middleware = rateLimit.byIp(60000, 5);

      const request = new Request('http://example.com', {
        headers: { 'cf-connecting-ip': '192.168.1.1' }
      });

      await middleware(request);

      const store = (rateLimit as any).memoryStore;
      const keys = Array.from((store as any).store.keys());

      expect(keys).toContain('ip:192.168.1.1');
    });

    it('应该在没有IP头时使用默认IP', async () => {
      const middleware = rateLimit.byIp(60000, 5);

      const request = new Request('http://example.com');

      await middleware(request);

      const store = (rateLimit as any).memoryStore;
      const keys = Array.from((store as any).store.keys());

      expect(keys).toContain('ip:127.0.0.1');
    });
  });

  describe('byUser - 基于用户的限流', () => {
    it('应该基于用户ID进行限流', async () => {
      const middleware = rateLimit.byUser(60000, 5);

      const requestWithUser = new Request('http://example.com') as any;
      requestWithUser.user = { id: 'user123' };

      const result = await middleware(requestWithUser);

      expect(result.success).toBe(true);
    });

    it('应该在没有用户时回退到IP限流', async () => {
      const middleware = rateLimit.byUser(60000, 5);

      const requestWithoutUser = new Request('http://example.com', {
        headers: { 'x-forwarded-for': '192.168.1.1' }
      });

      const result = await middleware(requestWithoutUser);

      expect(result.success).toBe(true);
    });
  });

  describe('strict - 严格限流', () => {
    it('应该基于用户、方法和路径进行严格限流', async () => {
      const middleware = rateLimit.strict(60000, 5);

      const requestWithUser = new Request('http://example.com/api/test', {
        method: 'POST'
      }) as any;
      requestWithUser.user = { id: 'user123' };

      const result = await middleware(requestWithUser);

      expect(result.success).toBe(true);
    });

    it('应该在没有用户时使用IP进行严格限流', async () => {
      const middleware = rateLimit.strict(60000, 5);

      const requestWithoutUser = new Request('http://example.com/api/test', {
        method: 'POST',
        headers: { 'x-forwarded-for': '192.168.1.1' }
      });

      const result = await middleware(requestWithoutUser);

      expect(result.success).toBe(true);
    });

    it('应该使用默认参数', () => {
      const middleware = rateLimit.strict();
      expect(middleware).toBeDefined();
    });
  });

  describe('login - 登录限流', () => {
    it('应该基于IP和邮箱进行登录限流', async () => {
      const middleware = rateLimit.login();

      const request = new Request('http://example.com/login?email=test@example.com', {
        headers: { 'x-forwarded-for': '192.168.1.1' }
      });

      const result = await middleware(request);

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('应该限制登录尝试次数为5次', async () => {
      const middleware = rateLimit.login();

      const request = new Request('http://example.com/login?email=test@example.com', {
        headers: { 'x-forwarded-for': '192.168.1.1' }
      });

      for (let i = 0; i < 5; i++) {
        await middleware(request);
      }

      const result = await middleware(request);

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('应该在没有邮箱参数时使用unknown', async () => {
      const middleware = rateLimit.login();

      const request = new Request('http://example.com/login', {
        headers: { 'x-forwarded-for': '192.168.1.1' }
      });

      await middleware(request);

      const store = (rateLimit as any).memoryStore;
      const keys = Array.from((store as any).store.keys()) as string[];

      expect(keys.some(key => key.includes('unknown'))).toBe(true);
    });
  });

  describe('register - 注册限流', () => {
    it('应该基于IP进行注册限流', async () => {
      const middleware = rateLimit.register();

      const request = new Request('http://example.com/register', {
        headers: { 'x-forwarded-for': '192.168.1.1' }
      });

      const result = await middleware(request);

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it('应该限制注册尝试次数为3次', async () => {
      const middleware = rateLimit.register();

      const request = new Request('http://example.com/register', {
        headers: { 'x-forwarded-for': '192.168.1.1' }
      });

      for (let i = 0; i < 3; i++) {
        await middleware(request);
      }

      const result = await middleware(request);

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });
  });

  describe('createHeaders - 创建响应头', () => {
    it('应该创建成功的响应头', () => {
      const result = {
        success: true,
        limit: 10,
        remaining: 5,
        resetTime: Date.now() + 60000
      };

      const headers = rateLimit.createHeaders(result);

      expect(headers.get('X-RateLimit-Limit')).toBe('10');
      expect(headers.get('X-RateLimit-Remaining')).toBe('5');
      expect(headers.get('X-RateLimit-Reset')).toBeDefined();
    });

    it('应该为失败的请求添加Retry-After头', () => {
      const result = {
        success: false,
        limit: 10,
        remaining: 0,
        resetTime: Date.now() + 30000
      };

      const headers = rateLimit.createHeaders(result);

      expect(headers.get('Retry-After')).toBeDefined();
    });
  });

  describe('createResponse - 创建响应', () => {
    it('应该为成功的请求创建200响应', () => {
      const result = {
        success: true,
        limit: 10,
        remaining: 5,
        resetTime: Date.now() + 60000
      };

      const response = rateLimit.createResponse(result);

      expect(response.status).toBe(200);
      expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
    });

    it('应该为失败的请求创建429响应', () => {
      const result = {
        success: false,
        limit: 10,
        remaining: 0,
        resetTime: Date.now() + 30000,
        error: '请求过于频繁',
        code: 'TOO_MANY_REQUESTS'
      };

      const response = rateLimit.createResponse(result);

      expect(response.status).toBe(429);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(response.headers.get('Retry-After')).toBeDefined();
    });

    it('应该在失败响应中包含错误信息', async () => {
      const result = {
        success: false,
        limit: 10,
        remaining: 0,
        resetTime: Date.now() + 30000,
        error: '请求过于频繁',
        code: 'TOO_MANY_REQUESTS'
      };

      const response = rateLimit.createResponse(result);
      const data = await response.json() as any;

      expect(data.success).toBe(false);
      expect(data.error).toBe('请求过于频繁');
      expect(data.code).toBe('TOO_MANY_REQUESTS');
      expect(data.limit).toBe(10);
      expect(data.remaining).toBe(0);
    });
  });

  describe('cleanup - 清理过期数据', () => {
    it('应该清理过期数据', () => {
      const consoleSpy = vi.spyOn(console, 'log');

      rateLimit.cleanup();

      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('当前限流记录数'));
    });
  });

  describe('getStats - 获取统计信息', () => {
    it('应该返回存储统计信息', () => {
      const stats = rateLimit.getStats();

      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('memoryUsage');
      expect(typeof stats.size).toBe('number');
      expect(typeof stats.memoryUsage).toBe('number');
    });
  });

  describe('导出的便捷方法', () => {
    it('应该导出createRateLimit方法', () => {
      expect(createRateLimit).toBeDefined();
      expect(typeof createRateLimit).toBe('function');
    });

    it('应该导出rateLimitByIp方法', () => {
      expect(rateLimitByIp).toBeDefined();
      expect(typeof rateLimitByIp).toBe('function');
    });

    it('应该导出rateLimitByUser方法', () => {
      expect(rateLimitByUser).toBeDefined();
      expect(typeof rateLimitByUser).toBe('function');
    });

    it('应该导出strictRateLimit方法', () => {
      expect(strictRateLimit).toBeDefined();
      expect(typeof strictRateLimit).toBe('function');
    });

    it('应该导出loginRateLimit方法', () => {
      expect(loginRateLimit).toBeDefined();
      expect(typeof loginRateLimit).toBe('function');
    });

    it('应该导出registerRateLimit方法', () => {
      expect(registerRateLimit).toBeDefined();
      expect(typeof registerRateLimit).toBe('function');
    });

    it('应该导出rateLimiter单例', () => {
      expect(rateLimiter).toBeDefined();
      expect(rateLimiter instanceof RateLimitMiddleware).toBe(true);
    });
  });

  describe('边界情况和错误处理', () => {
    it('应该处理空请求', async () => {
      const middleware = rateLimit.create({
        windowMs: 60000,
        maxRequests: 10
      });

      const request = new Request('http://example.com');
      const result = await middleware(request);

      expect(result.success).toBe(true);
    });

    it('应该处理无效的请求头', async () => {
      const middleware = rateLimit.byIp(60000, 5);

      const request = new Request('http://example.com', {
        headers: { 'x-forwarded-for': 'invalid-ip' }
      });

      const result = await middleware(request);

      expect(result.success).toBe(true);
    });

    it('应该处理maxRequests为0的情况', async () => {
      const middleware = rateLimit.create({
        windowMs: 60000,
        maxRequests: 0
      });

      const request = new Request('http://example.com');
      const result = await middleware(request);

      expect(result.success).toBe(false);
    });

    it('应该处理windowMs为0的情况', async () => {
      const middleware = rateLimit.create({
        windowMs: 0,
        maxRequests: 10
      });

      const request = new Request('http://example.com');
      const result = await middleware(request);

      expect(result.success).toBe(true);
    });

    it('应该处理负数的配置', async () => {
      const middleware = rateLimit.create({
        windowMs: -1,
        maxRequests: -1
      });

      const request = new Request('http://example.com');
      const result = await middleware(request);

      expect(result).toBeDefined();
    });
  });

  describe('并发请求处理', () => {
    it('应该正确处理并发请求', async () => {
      const middleware = rateLimit.create({
        windowMs: 60000,
        maxRequests: 10
      });

      const request = new Request('http://example.com');

      const promises = Array(5).fill(null).map(() => middleware(request));
      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('应该在并发请求超过限制时拒绝', async () => {
      const middleware = rateLimit.create({
        windowMs: 60000,
        maxRequests: 5
      });

      const request = new Request('http://example.com');

      const promises = Array(10).fill(null).map(() => middleware(request));
      const results = await Promise.all(promises);

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      expect(successCount).toBe(5);
      expect(failCount).toBe(5);
    });
  });

  describe('时间窗口重置', () => {
    it('应该在时间窗口过期后重置计数器', async () => {
      const middleware = rateLimit.create({
        windowMs: 100,
        maxRequests: 2
      });

      const request = new Request('http://example.com');

      await middleware(request);
      await middleware(request);

      const result1 = await middleware(request);
      expect(result1.success).toBe(false);

      await new Promise(resolve => setTimeout(resolve, 150));

      const result2 = await middleware(request);
      expect(result2.success).toBe(true);
    }, 1000);
  });

  describe('不同键的独立限流', () => {
    it('应该对不同IP进行独立限流', async () => {
      const middleware = rateLimit.byIp(60000, 2);

      const request1 = new Request('http://example.com', {
        headers: { 'x-forwarded-for': '192.168.1.1' }
      });

      const request2 = new Request('http://example.com', {
        headers: { 'x-forwarded-for': '192.168.1.2' }
      });

      await middleware(request1);
      await middleware(request1);

      const result1 = await middleware(request1);
      const result2 = await middleware(request2);

      expect(result1.success).toBe(false);
      expect(result2.success).toBe(true);
    });

    it('应该对不同用户进行独立限流', async () => {
      const middleware = rateLimit.byUser(60000, 2);

      const request1 = new Request('http://example.com') as any;
      request1.user = { id: 'user1' };

      const request2 = new Request('http://example.com') as any;
      request2.user = { id: 'user2' };

      await middleware(request1);
      await middleware(request1);

      const result1 = await middleware(request1);
      const result2 = await middleware(request2);

      expect(result1.success).toBe(false);
      expect(result2.success).toBe(true);
    });
  });
});
