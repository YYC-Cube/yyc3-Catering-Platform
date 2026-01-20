/**
 * @fileoverview YYC³中间件入口文件单元测试
 * @description 测试中间件入口文件的所有功能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createErrorMiddleware,
  createRequestIdMiddleware,
  createLoggingMiddleware,
  createResponseTimeMiddleware,
  createHealthMiddleware
} from '../../../middleware/index';

vi.mock('../../../config/database', () => ({
  dbManager: {
    healthCheck: vi.fn()
  }
}));

describe('中间件入口文件测试', () => {
  describe('createErrorMiddleware', () => {
    it('应该创建错误处理中间件', () => {
      const errorMiddleware = createErrorMiddleware();
      expect(typeof errorMiddleware).toBe('function');
    });

    it('应该正确处理Error对象', () => {
      const errorMiddleware = createErrorMiddleware();
      const error = new Error('测试错误');
      const request = new Request('http://example.com');

      const response = errorMiddleware(error, request);

      expect(response.status).toBe(500);
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('应该正确处理非Error对象', () => {
      const errorMiddleware = createErrorMiddleware();
      const error = '字符串错误';
      const request = new Request('http://example.com');

      const response = errorMiddleware(error, request);

      expect(response.status).toBe(500);
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('应该返回包含错误信息的JSON响应', async () => {
      const errorMiddleware = createErrorMiddleware();
      const error = new Error('测试错误');
      const request = new Request('http://example.com');

      const response = errorMiddleware(error, request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toBe('测试错误');
      expect(data.code).toBe('MIDDLEWARE_ERROR');
      expect(data.timestamp).toBeDefined();
    });

    it('应该记录错误日志', () => {
      const consoleSpy = vi.spyOn(console, 'error');
      const errorMiddleware = createErrorMiddleware();
      const error = new Error('测试错误');
      const request = new Request('http://example.com');

      errorMiddleware(error, request);

      expect(consoleSpy).toHaveBeenCalledWith('中间件错误:', expect.objectContaining({
        error: '测试错误',
        url: 'http://example.com/'
      }));
    });
  });

  describe('createRequestIdMiddleware', () => {
    it('应该创建请求ID中间件', () => {
      const requestIdMiddleware = createRequestIdMiddleware();
      expect(typeof requestIdMiddleware).toBe('function');
    });

    it('应该使用请求头中的x-request-id', () => {
      const requestIdMiddleware = createRequestIdMiddleware();
      const request = new Request('http://example.com', {
        headers: { 'x-request-id': 'custom-request-id' }
      });

      const result = requestIdMiddleware(request);

      expect(result.requestId).toBe('custom-request-id');
    });

    it('应该生成新的请求ID当请求头中不存在时', () => {
      const requestIdMiddleware = createRequestIdMiddleware();
      const request = new Request('http://example.com');

      const result = requestIdMiddleware(request);

      expect(result.requestId).toBeDefined();
      expect(result.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
    });

    it('应该为每个请求生成唯一的ID', () => {
      const requestIdMiddleware = createRequestIdMiddleware();
      const request1 = new Request('http://example.com');
      const request2 = new Request('http://example.com');

      const result1 = requestIdMiddleware(request1);
      const result2 = requestIdMiddleware(request2);

      expect(result1.requestId).not.toBe(result2.requestId);
    });
  });

  describe('createLoggingMiddleware', () => {
    it('应该创建日志中间件', () => {
      const loggingMiddleware = createLoggingMiddleware();
      expect(typeof loggingMiddleware).toBe('function');
    });

    it('应该记录请求日志', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const loggingMiddleware = createLoggingMiddleware();
      const request = new Request('http://example.com/api/test', {
        method: 'POST',
        headers: { 'user-agent': 'TestAgent/1.0' }
      });

      loggingMiddleware(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('POST /api/test')
      );
    });

    it('应该包含请求ID在日志中', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const loggingMiddleware = createLoggingMiddleware();
      const request = new Request('http://example.com/api/test');
      const requestId = 'test-request-id';

      loggingMiddleware(request, requestId);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(requestId)
      );
    });

    it('应该从x-forwarded-for头获取IP', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const loggingMiddleware = createLoggingMiddleware();
      const request = new Request('http://example.com/api/test', {
        headers: { 'x-forwarded-for': '192.168.1.1' }
      });

      loggingMiddleware(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('192.168.1.1')
      );
    });

    it('应该从x-real-ip头获取IP', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const loggingMiddleware = createLoggingMiddleware();
      const request = new Request('http://example.com/api/test', {
        headers: { 'x-real-ip': '192.168.1.2' }
      });

      loggingMiddleware(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('192.168.1.2')
      );
    });

    it('应该使用默认IP当没有IP头时', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const loggingMiddleware = createLoggingMiddleware();
      const request = new Request('http://example.com/api/test');

      loggingMiddleware(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('127.0.0.1')
      );
    });

    it('应该使用Unknown当没有user-agent时', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const loggingMiddleware = createLoggingMiddleware();
      const request = new Request('http://example.com/api/test');

      loggingMiddleware(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown')
      );
    });
  });

  describe('createResponseTimeMiddleware', () => {
    it('应该创建响应时间中间件', () => {
      const responseTimeMiddleware = createResponseTimeMiddleware();
      expect(typeof responseTimeMiddleware).toBe('function');
    });

    it('应该返回开始时间', () => {
      const responseTimeMiddleware = createResponseTimeMiddleware();
      const result = responseTimeMiddleware();

      expect(result).toBeDefined();
      expect(result.startTime).toBeDefined();
      expect(typeof result.startTime).toBe('number');
    });

    it('应该返回当前时间戳', () => {
      const responseTimeMiddleware = createResponseTimeMiddleware();
      const beforeTime = Date.now();
      const result = responseTimeMiddleware();
      const afterTime = Date.now();

      expect(result.startTime).toBeGreaterThanOrEqual(beforeTime);
      expect(result.startTime).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('createHealthMiddleware', () => {
    let mockDbManager: any;

    beforeEach(() => {
      vi.clearAllMocks();
      mockDbManager = {
        healthCheck: vi.fn()
      };
    });

    it('应该创建健康检查中间件', () => {
      const healthMiddleware = createHealthMiddleware(mockDbManager);
      expect(typeof healthMiddleware).toBe('function');
    });

    it('应该返回健康状态对象', async () => {
      mockDbManager.healthCheck.mockResolvedValue(true);

      const healthMiddleware = createHealthMiddleware(mockDbManager);
      const health = await healthMiddleware();

      expect(health).toBeDefined();
      expect(health.status).toBe('healthy');
      expect(health.timestamp).toBeDefined();
      expect(health.responseTime).toBeDefined();
      expect(health.services).toBeDefined();
      expect(health.memory).toBeDefined();
    });

    it('应该检查数据库健康状态', async () => {
      mockDbManager.healthCheck.mockResolvedValue(true);

      const healthMiddleware = createHealthMiddleware(mockDbManager);
      const health = await healthMiddleware();

      expect(mockDbManager.healthCheck).toHaveBeenCalled();
      expect(health.services.database.status).toBe('healthy');
    });

    it('应该处理数据库健康检查失败', async () => {
      mockDbManager.healthCheck.mockRejectedValue(new Error('数据库连接失败'));

      const healthMiddleware = createHealthMiddleware(mockDbManager);
      const health = await healthMiddleware();

      expect(health.services.database.status).toBe('unhealthy');
      expect(health.services.database.error).toBe('数据库连接失败');
    });

    it('应该返回内存使用情况', async () => {
      mockDbManager.healthCheck.mockResolvedValue(true);

      const healthMiddleware = createHealthMiddleware(mockDbManager);
      const health = await healthMiddleware();

      expect(health.memory).toBeDefined();
      expect(health.memory.used).toBeDefined();
      expect(health.memory.total).toBeDefined();
      expect(health.memory.external).toBeDefined();
      expect(typeof health.memory.used).toBe('number');
      expect(typeof health.memory.total).toBe('number');
      expect(typeof health.memory.external).toBe('number');
    });

    it('应该返回数据库响应时间', async () => {
      mockDbManager.healthCheck.mockResolvedValue(true);

      const healthMiddleware = createHealthMiddleware(mockDbManager);
      const health = await healthMiddleware();

      expect(health.services.database.responseTime).toBeDefined();
      expect(typeof health.services.database.responseTime).toBe('string');
      expect(health.services.database.responseTime).toMatch(/\d+ms/);
    });

    it('应该返回ISO格式的时间戳', async () => {
      mockDbManager.healthCheck.mockResolvedValue(true);

      const healthMiddleware = createHealthMiddleware(mockDbManager);
      const health = await healthMiddleware();

      expect(health.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('应该处理数据库健康检查返回false', async () => {
      mockDbManager.healthCheck.mockResolvedValue(false);

      const healthMiddleware = createHealthMiddleware(mockDbManager);
      const health = await healthMiddleware();

      expect(health.services.database.status).toBe('unhealthy');
    });

    it('应该处理数据库健康检查抛出非Error对象', async () => {
      mockDbManager.healthCheck.mockRejectedValue('字符串错误');

      const healthMiddleware = createHealthMiddleware(mockDbManager);
      const health = await healthMiddleware();

      expect(health.services.database.status).toBe('unhealthy');
      expect(health.services.database.error).toBe('未知错误');
    });
  });

  describe('中间件组合使用', () => {
    it('应该能够组合使用多个中间件', () => {
      const requestIdMiddleware = createRequestIdMiddleware();
      const loggingMiddleware = createLoggingMiddleware();
      const responseTimeMiddleware = createResponseTimeMiddleware();

      const request = new Request('http://example.com/api/test', {
        method: 'GET',
        headers: { 'user-agent': 'TestAgent/1.0' }
      });

      const requestId = requestIdMiddleware(request);
      loggingMiddleware(request, requestId.requestId);
      const responseTime = responseTimeMiddleware();

      expect(requestId.requestId).toBeDefined();
      expect(responseTime.startTime).toBeDefined();
    });

    it('应该能够处理完整的请求流程', async () => {
      const localMockDbManager = {
        healthCheck: vi.fn().mockResolvedValue(true)
      };

      const requestIdMiddleware = createRequestIdMiddleware();
      const loggingMiddleware = createLoggingMiddleware();
      const healthMiddleware = createHealthMiddleware(localMockDbManager);

      const request = new Request('http://example.com/api/test', {
        method: 'GET',
        headers: { 'user-agent': 'TestAgent/1.0' }
      });

      const requestId = requestIdMiddleware(request);
      loggingMiddleware(request, requestId.requestId);
      const health = await healthMiddleware();

      expect(requestId.requestId).toBeDefined();
      expect(health.status).toBe('healthy');
    });
  });
});
