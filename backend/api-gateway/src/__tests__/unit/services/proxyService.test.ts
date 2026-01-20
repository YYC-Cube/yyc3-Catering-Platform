/**
 * @fileoverview ProxyService 单元测试
 * @description 测试API请求代理转发功能
 * @module services/proxyService.test
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-07
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ProxyService } from '../../../services/proxyService';
import axios from 'axios';
import type { Request, Response } from 'express';

vi.mock('axios');
vi.mock('../../../config/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../../config/serviceRegistry', () => ({
  serviceRegistry: {
    getInstance: vi.fn(),
  },
}));

describe('ProxyService', () => {
  let proxyService: ProxyService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockStatus: ReturnType<typeof vi.fn>;
  let mockSetHeader: ReturnType<typeof vi.fn>;
  let mockSend: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    proxyService = new ProxyService();
    
    mockJson = vi.fn();
    mockStatus = vi.fn().mockReturnThis();
    mockSetHeader = vi.fn().mockReturnThis();
    mockSend = vi.fn().mockReturnThis();
    
    mockRequest = {
      method: 'GET',
      path: '/api/test',
      ip: '127.0.0.1',
      protocol: 'http',
      headers: {
        'content-type': 'application/json',
      },
      body: {},
      query: {},
    };
    
    mockResponse = {
      status: mockStatus,
      setHeader: mockSetHeader,
      send: mockSend,
      json: mockJson,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('forwardRequest', () => {
    it('应该成功转发GET请求', async () => {
      const { serviceRegistry } = await import('../../../config/serviceRegistry');
      vi.mocked(serviceRegistry.getInstance).mockReturnValue({
        url: 'http://localhost:3001',
      });
      
      const mockAxiosResponse = {
        status: 200,
        data: { success: true, data: 'test' },
        headers: {
          'content-type': 'application/json',
        },
      };
      vi.mocked(axios).mockResolvedValue(mockAxiosResponse);
      
      await proxyService.forwardRequest('test-service', '/api/test', mockRequest as Request, mockResponse as Response);
      
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockSend).toHaveBeenCalledWith(mockAxiosResponse.data);
    });

    it('应该成功转发POST请求', async () => {
      const { serviceRegistry } = await import('../../../config/serviceRegistry');
      vi.mocked(serviceRegistry.getInstance).mockReturnValue({
        url: 'http://localhost:3001',
      });
      
      mockRequest.method = 'POST';
      mockRequest.body = { name: 'test' };
      
      const mockAxiosResponse = {
        status: 201,
        data: { success: true, id: 1 },
        headers: {
          'content-type': 'application/json',
        },
      };
      vi.mocked(axios).mockResolvedValue(mockAxiosResponse);
      
      await proxyService.forwardRequest('test-service', '/api/test', mockRequest as Request, mockResponse as Response);
      
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockSend).toHaveBeenCalledWith(mockAxiosResponse.data);
    });

    it('应该正确设置转发头', async () => {
      const { serviceRegistry } = await import('../../../config/serviceRegistry');
      vi.mocked(serviceRegistry.getInstance).mockReturnValue({
        url: 'http://localhost:3001',
      });
      
      const mockAxiosResponse = {
        status: 200,
        data: { success: true },
        headers: {
          'content-type': 'application/json',
          'x-custom-header': 'custom-value',
        },
      };
      vi.mocked(axios).mockResolvedValue(mockAxiosResponse);
      
      await proxyService.forwardRequest('test-service', '/api/test', mockRequest as Request, mockResponse as Response);
      
      expect(mockSetHeader).toHaveBeenCalledWith('content-type', 'application/json');
      expect(mockSetHeader).toHaveBeenCalledWith('x-custom-header', 'custom-value');
    });

    it('应该在服务实例不可用时返回503', async () => {
      const { serviceRegistry } = await import('../../../config/serviceRegistry');
      vi.mocked(serviceRegistry.getInstance).mockReturnValue(null);
      
      await proxyService.forwardRequest('test-service', '/api/test', mockRequest as Request, mockResponse as Response);
      
      expect(mockStatus).toHaveBeenCalledWith(503);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: '服务暂时不可用',
      });
    });

    it('应该处理目标服务返回的错误状态码', async () => {
      const { serviceRegistry } = await import('../../../config/serviceRegistry');
      vi.mocked(serviceRegistry.getInstance).mockReturnValue({
        url: 'http://localhost:3001',
      });
      
      const error = {
        response: {
          status: 400,
          data: { error: 'Bad Request' },
        },
      };
      vi.mocked(axios).mockRejectedValue(error);
      
      await proxyService.forwardRequest('test-service', '/api/test', mockRequest as Request, mockResponse as Response);
      
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Bad Request',
      });
    });

    it('应该处理服务超时错误', async () => {
      const { serviceRegistry } = await import('../../../config/serviceRegistry');
      vi.mocked(serviceRegistry.getInstance).mockReturnValue({
        url: 'http://localhost:3001',
      });
      
      const error = {
        request: {},
      };
      vi.mocked(axios).mockRejectedValue(error);
      
      await proxyService.forwardRequest('test-service', '/api/test', mockRequest as Request, mockResponse as Response);
      
      expect(mockStatus).toHaveBeenCalledWith(504);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: '服务超时，请稍后再试',
      });
    });

    it('应该处理请求配置错误', async () => {
      const { serviceRegistry } = await import('../../../config/serviceRegistry');
      vi.mocked(serviceRegistry.getInstance).mockReturnValue({
        url: 'http://localhost:3001',
      });
      
      const error = {
        message: 'Invalid configuration',
      };
      vi.mocked(axios).mockRejectedValue(error);
      
      await proxyService.forwardRequest('test-service', '/api/test', mockRequest as Request, mockResponse as Response);
      
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: '内部服务器错误',
      });
    });

    it('应该正确传递查询参数', async () => {
      const { serviceRegistry } = await import('../../../config/serviceRegistry');
      vi.mocked(serviceRegistry.getInstance).mockReturnValue({
        url: 'http://localhost:3001',
      });
      
      mockRequest.query = { page: '1', limit: '10' };
      
      const mockAxiosResponse = {
        status: 200,
        data: { success: true },
        headers: {},
      };
      vi.mocked(axios).mockResolvedValue(mockAxiosResponse);
      
      await proxyService.forwardRequest('test-service', '/api/test', mockRequest as Request, mockResponse as Response);
      
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { page: '1', limit: '10' },
        })
      );
    });

    it('应该正确传递请求体', async () => {
      const { serviceRegistry } = await import('../../../config/serviceRegistry');
      vi.mocked(serviceRegistry.getInstance).mockReturnValue({
        url: 'http://localhost:3001',
      });
      
      mockRequest.method = 'POST';
      mockRequest.body = { name: 'test', value: 123 };
      
      const mockAxiosResponse = {
        status: 201,
        data: { success: true },
        headers: {},
      };
      vi.mocked(axios).mockResolvedValue(mockAxiosResponse);
      
      await proxyService.forwardRequest('test-service', '/api/test', mockRequest as Request, mockResponse as Response);
      
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { name: 'test', value: 123 },
        })
      );
    });

    it('应该设置60秒超时', async () => {
      const { serviceRegistry } = await import('../../../config/serviceRegistry');
      vi.mocked(serviceRegistry.getInstance).mockReturnValue({
        url: 'http://localhost:3001',
      });
      
      const mockAxiosResponse = {
        status: 200,
        data: { success: true },
        headers: {},
      };
      vi.mocked(axios).mockResolvedValue(mockAxiosResponse);
      
      await proxyService.forwardRequest('test-service', '/api/test', mockRequest as Request, mockResponse as Response);
      
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 60000,
        })
      );
    });
  });
});
