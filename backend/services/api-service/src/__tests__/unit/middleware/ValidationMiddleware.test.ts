/**
 * @fileoverview YYC³验证中间件单元测试
 * @description 测试请求验证中间件的所有功能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-07
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ValidationMiddleware, validationMiddleware } from '../../../middleware/validation';

describe('ValidationMiddleware', () => {
  let validation: ValidationMiddleware;

  beforeEach(() => {
    vi.clearAllMocks();
    validation = new ValidationMiddleware();
  });

  describe('validateBody', () => {
    it('应该成功验证有效的JSON请求体', async () => {
      const schema = {
        safeParse: vi.fn().mockReturnValue({
          success: true,
          data: { name: '测试', email: 'test@example.com' }
        })
      };

      const request = new Request('http://example.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '测试', email: 'test@example.com' })
      });

      const result = await validation.validateBody(schema)(request);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('应该拒绝无效的请求体', async () => {
      const schema = {
        safeParse: vi.fn().mockReturnValue({
          success: false,
          error: {
            errors: [
              { path: ['email'], message: '邮箱格式无效' }
            ]
          }
        })
      };

      const request = new Request('http://example.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'invalid' })
      });

      const result = await validation.validateBody(schema)(request);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });

    it('应该拒绝缺少Content-Type头的请求', async () => {
      const schema = { safeParse: vi.fn() };

      const request = new Request('http://example.com', {
        method: 'POST'
      });

      const result = await validation.validateBody(schema)(request);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('缺少Content-Type头');
    });

    it('应该支持application/x-www-form-urlencoded', async () => {
      const schema = {
        safeParse: vi.fn().mockReturnValue({
          success: true,
          data: { name: '测试' }
        })
      };

      const formData = new URLSearchParams();
      formData.append('name', '测试');

      const request = new Request('http://example.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      const result = await validation.validateBody(schema)(request);
      expect(result.success).toBe(true);
    });

    it('应该支持multipart/form-data', async () => {
      const schema = {
        safeParse: vi.fn().mockReturnValue({
          success: true,
          data: { name: '测试' }
        })
      };

      const formData = new FormData();
      formData.append('name', '测试');

      const request = new Request('http://example.com', {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData
      });

      const result = await validation.validateBody(schema)(request);
      expect(result.success).toBe(true);
    });
  });

  describe('validateQuery', () => {
    it('应该成功验证有效的查询参数', async () => {
      const schema = {
        safeParse: vi.fn().mockReturnValue({
          success: true,
          data: { page: 1, limit: 20 }
        })
      };

      const request = new Request('http://example.com?page=1&limit=20');
      const result = await validation.validateQuery(schema)(request);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('应该拒绝无效的查询参数', async () => {
      const schema = {
        safeParse: vi.fn().mockReturnValue({
          success: false,
          error: {
            errors: [
              { path: ['page'], message: '必须是数字' }
            ]
          }
        })
      };

      const request = new Request('http://example.com?page=invalid');
      const result = await validation.validateQuery(schema)(request);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('应该处理空查询参数', async () => {
      const schema = {
        safeParse: vi.fn().mockReturnValue({
          success: true,
          data: {}
        })
      };

      const request = new Request('http://example.com');
      const result = await validation.validateQuery(schema)(request);

      expect(result.success).toBe(true);
    });
  });

  describe('validateParams', () => {
    it('应该成功验证有效的路径参数', async () => {
      const schema = {
        safeParse: vi.fn().mockReturnValue({
          success: true,
          data: { id: '123' }
        })
      };

      const request = new Request('http://example.com');
      const params = { id: '123' };

      const result = await validation.validateParams(schema)(request, params);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('应该拒绝无效的路径参数', async () => {
      const schema = {
        safeParse: vi.fn().mockReturnValue({
          success: false,
          error: {
            errors: [
              { path: ['id'], message: '必须是UUID' }
            ]
          }
        })
      };

      const request = new Request('http://example.com');
      const params = { id: 'invalid' };

      const result = await validation.validateParams(schema)(request, params);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('应该拒绝缺少路径参数', async () => {
      const schema = { safeParse: vi.fn() };
      const request = new Request('http://example.com');

      const result = await validation.validateParams(schema)(request);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('缺少路径参数');
    });
  });

  describe('validateHeaders', () => {
    it('应该成功验证有效的请求头', async () => {
      const schema = {
        safeParse: vi.fn().mockReturnValue({
          success: true,
          data: { 'x-api-key': 'test-key' }
        })
      };

      const request = new Request('http://example.com', {
        headers: { 'x-api-key': 'test-key' }
      });

      const result = await validation.validateHeaders(schema)(request);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('应该拒绝无效的请求头', async () => {
      const schema = {
        safeParse: vi.fn().mockReturnValue({
          success: false,
          error: {
            errors: [
              { path: ['x-api-key'], message: '格式无效' }
            ]
          }
        })
      };

      const request = new Request('http://example.com', {
        headers: { 'x-api-key': 'invalid' }
      });

      const result = await validation.validateHeaders(schema)(request);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validate', () => {
    it('应该成功验证所有部分', async () => {
      const schema = {
        body: {
          safeParse: vi.fn().mockReturnValue({
            success: true,
            data: { name: '测试' }
          })
        },
        query: {
          safeParse: vi.fn().mockReturnValue({
            success: true,
            data: { page: 1 }
          })
        },
        params: {
          safeParse: vi.fn().mockReturnValue({
            success: true,
            data: { id: '123' }
          })
        }
      };

      const request = new Request('http://example.com?page=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '测试' })
      });
      const params = { id: '123' };

      const result = await validation.validate(schema)(request, params);
      expect(result.success).toBe(true);
      expect(result.data?.body).toBeDefined();
      expect(result.data?.query).toBeDefined();
      expect(result.data?.params).toBeDefined();
    });

    it('应该收集所有验证错误', async () => {
      const schema = {
        body: {
          safeParse: vi.fn().mockReturnValue({
            success: false,
            error: {
              errors: [{ path: ['name'], message: '必填' }]
            }
          })
        },
        query: {
          safeParse: vi.fn().mockReturnValue({
            success: false,
            error: {
              errors: [{ path: ['page'], message: '必填' }]
            }
          })
        }
      };

      const request = new Request('http://example.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const result = await validation.validate(schema)(request);
      expect(result.success).toBe(false);
      expect(result.errors?.length).toBeGreaterThan(0);
    });
  });

  describe('sanitize', () => {
    it('应该清理字符串中的恶意脚本', () => {
      const input = '<script>alert("xss")</script>正常文本';
      const result = validation.sanitize(input);

      expect(result.success).toBe(true);
      expect(result.data).not.toContain('<script>');
    });

    it('应该清理对象中的所有字符串', () => {
      const input = {
        name: '<script>alert("xss")</script>',
        description: '正常描述',
        nested: {
          value: '<iframe>恶意内容</iframe>'
        }
      };

      const result = validation.sanitize(input);

      expect(result.success).toBe(true);
      expect(result.data.name).not.toContain('<script>');
      expect(result.data.nested.value).not.toContain('<iframe>');
    });

    it('应该清理数组中的所有元素', () => {
      const input = [
        '<script>alert("xss")</script>',
        '正常文本',
        { value: '<iframe>恶意内容</iframe>' }
      ];

      const result = validation.sanitize(input);

      expect(result.success).toBe(true);
      expect(result.data[0]).not.toContain('<script>');
    });

    it('应该保留非字符串值', () => {
      const input = {
        number: 123,
        boolean: true,
        null: null
      };

      const result = validation.sanitize(input);

      expect(result.success).toBe(true);
      expect(result.data.number).toBe(123);
      expect(result.data.boolean).toBe(true);
      expect(result.data.null).toBeNull();
    });
  });

  describe('validateFile', () => {
    it('应该验证有效的文件', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const options = {
        maxSize: 10 * 1024 * 1024,
        allowedTypes: ['image/jpeg'],
        allowedExtensions: ['jpg', 'jpeg']
      };

      const result = validation.validateFile(file, options);
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该拒绝过大的文件', () => {
      const largeContent = 'a'.repeat(200);
      const file = new File([largeContent], 'test.jpg', { type: 'image/jpeg' });
      const options = {
        maxSize: 100,
        allowedTypes: ['image/jpeg'],
        allowedExtensions: ['jpg']
      };

      const result = validation.validateFile(file, options);
      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('文件大小超过限制'))).toBe(true);
    });

    it('应该拒绝不允许的文件类型', () => {
      const file = new File(['content'], 'test.exe', { type: 'application/x-msdownload' });
      const options = {
        maxSize: 10 * 1024 * 1024,
        allowedTypes: ['image/jpeg'],
        allowedExtensions: ['jpg']
      };

      const result = validation.validateFile(file, options);
      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('文件类型'))).toBe(true);
    });

    it('应该拒绝不允许的文件扩展名', () => {
      const file = new File(['content'], 'test.exe', { type: 'application/octet-stream' });
      const options = {
        maxSize: 10 * 1024 * 1024,
        allowedTypes: [],
        allowedExtensions: ['jpg', 'png']
      };

      const result = validation.validateFile(file, options);
      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('扩展名'))).toBe(true);
    });
  });

  describe('isValidUUID', () => {
    it('应该验证有效的UUID', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      expect(validation.isValidUUID(uuid)).toBe(true);
    });

    it('应该拒绝无效的UUID', () => {
      expect(validation.isValidUUID('invalid')).toBe(false);
      expect(validation.isValidUUID('1234567890')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('应该验证有效的邮箱', () => {
      expect(validation.isValidEmail('test@example.com')).toBe(true);
      expect(validation.isValidEmail('user.name+tag@example.co.uk')).toBe(true);
    });

    it('应该拒绝无效的邮箱', () => {
      expect(validation.isValidEmail('invalid')).toBe(false);
      expect(validation.isValidEmail('invalid@')).toBe(false);
      expect(validation.isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('isValidPhoneNumber', () => {
    it('应该验证有效的中国大陆手机号', () => {
      expect(validation.isValidPhoneNumber('13800138000')).toBe(true);
      expect(validation.isValidPhoneNumber('15912345678')).toBe(true);
    });

    it('应该拒绝无效的手机号', () => {
      expect(validation.isValidPhoneNumber('12345678901')).toBe(false);
      expect(validation.isValidPhoneNumber('1380013800')).toBe(false);
      expect(validation.isValidPhoneNumber('138001380001')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('应该验证强密码', () => {
      const result = validation.isValidPassword('StrongP@ss123');
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(4);
    });

    it('应该拒绝弱密码', () => {
      const result = validation.isValidPassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('应该提供密码强度反馈', () => {
      const result = validation.isValidPassword('password');
      expect(result.feedback).toBeDefined();
      expect(result.feedback.length).toBeGreaterThan(0);
    });
  });

  describe('createErrorResponse', () => {
    it('应该创建验证错误响应', () => {
      const result = {
        success: false,
        errors: ['字段1: 必填', '字段2: 格式无效']
      };

      const response = validation.createErrorResponse(result);
      expect(response.status).toBe(400);
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });
  });

  describe('单例实例', () => {
    it('应该导出单例实例', () => {
      expect(validationMiddleware).toBeInstanceOf(ValidationMiddleware);
    });

    it('应该导出便捷方法', () => {
      expect(typeof validationMiddleware.validateBody).toBe('function');
      expect(typeof validationMiddleware.validateQuery).toBe('function');
      expect(typeof validationMiddleware.validateParams).toBe('function');
      expect(typeof validationMiddleware.validateHeaders).toBe('function');
      expect(typeof validationMiddleware.validate).toBe('function');
      expect(typeof validationMiddleware.sanitize).toBe('function');
      expect(typeof validationMiddleware.validateFile).toBe('function');
    });
  });
});
