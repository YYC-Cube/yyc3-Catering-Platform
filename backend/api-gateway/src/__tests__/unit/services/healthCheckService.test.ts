/**
 * @fileoverview HealthCheckService 单元测试
 * @description 测试健康检查服务功能
 * @module services/healthCheckService.test
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-07
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HealthCheckService, HealthCheckResult } from '../../../services/healthCheckService';
import axios from 'axios';

vi.mock('axios');
vi.mock('../../../config/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../../config/serviceRegistry', () => ({
  serviceRegistry: {
    getAllServices: vi.fn(),
    getAllInstances: vi.fn(),
    getInstance: vi.fn(),
  },
}));

import { serviceRegistry } from '../../../config/serviceRegistry';
import { logger } from '../../../config/logger';

describe('HealthCheckService', () => {
  let healthCheckService: HealthCheckService;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(global, 'setInterval').mockImplementation((fn: Function, delay: number) => {
      return setTimeout(fn, delay) as unknown as NodeJS.Timeout;
    });
    vi.spyOn(global, 'clearInterval').mockImplementation((id: NodeJS.Timeout) => {
      clearTimeout(id);
    });
    healthCheckService = new HealthCheckService({
      interval: 1000,
      timeout: 5000,
      enabled: true,
      failureThreshold: 3,
    });
  });

  afterEach(() => {
    healthCheckService.stop();
    vi.clearAllTimers();
    vi.restoreAllMocks();
  });

  describe('start', () => {
    it('应该启动健康检查服务', () => {
      // serviceRegistry already imported
      vi.mocked(serviceRegistry.getAllServices).mockReturnValue([]);

      healthCheckService.start();

      expect(setInterval).toHaveBeenCalled();
    });

    it('应该在已启动时跳过重复启动', () => {
      // serviceRegistry already imported
      vi.mocked(serviceRegistry.getAllServices).mockReturnValue([]);

      healthCheckService.start();
      healthCheckService.start();

      expect(setInterval).toHaveBeenCalledTimes(1);
    });

    it('应该在未启用时不启动', () => {
      const disabledService = new HealthCheckService({ enabled: false });
      // serviceRegistry already imported
      vi.mocked(serviceRegistry.getAllServices).mockReturnValue([]);

      disabledService.start();

      expect(setInterval).not.toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    it('应该停止健康检查服务', () => {
      // serviceRegistry already imported
      vi.mocked(serviceRegistry.getAllServices).mockReturnValue([]);

      healthCheckService.start();
      healthCheckService.stop();

      expect(clearInterval).toHaveBeenCalled();
    });

    it('应该在未启动时不报错', () => {
      expect(() => healthCheckService.stop()).not.toThrow();
    });
  });

  describe('checkService', () => {
    it('应该检查服务实例的健康状态', async () => {
      // serviceRegistry already imported
      vi.mocked(serviceRegistry.getAllServices).mockReturnValue(['test-service']);
      vi.mocked(serviceRegistry.getAllInstances).mockReturnValue([
        {
          name: 'test-service',
          id: 'instance-1',
          url: 'http://localhost:3001',
        },
      ]);

      vi.mocked(axios.get).mockResolvedValue({
        status: 200,
        data: { status: 'ok' },
      });

      healthCheckService.start();
      await vi.runAllTimersAsync();

      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:3001/health',
        { timeout: 5000 }
      );
    });

    it('应该记录健康检查成功', async () => {
      // serviceRegistry already imported
      healthCheckService.clearResults();
      vi.mocked(serviceRegistry.getAllServices).mockReturnValue(['test-service']);
      vi.mocked(serviceRegistry.getAllInstances).mockReturnValue([
        {
          name: 'test-service',
          id: 'instance-1',
          url: 'http://localhost:3001',
        },
      ]);

      vi.mocked(axios.get).mockResolvedValue({
        status: 200,
        data: { status: 'ok' },
      });

      healthCheckService.start();
      await vi.runAllTimersAsync();

      const results = healthCheckService.getResults('test-service');
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].status).toBe('healthy');
    });

    it('应该记录健康检查失败', async () => {
      // serviceRegistry already imported
      healthCheckService.clearResults();
      vi.mocked(serviceRegistry.getAllServices).mockReturnValue(['test-service']);
      vi.mocked(serviceRegistry.getAllInstances).mockReturnValue([
        {
          name: 'test-service',
          id: 'instance-1',
          url: 'http://localhost:3001',
        },
      ]);

      vi.mocked(axios.get).mockResolvedValue({
        status: 500,
        data: { error: 'Internal Server Error' },
      });

      healthCheckService.start();
      await vi.runAllTimersAsync();

      const results = healthCheckService.getResults('test-service');
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].status).toBe('unhealthy');
    });

    it('应该处理健康检查异常', async () => {
      // serviceRegistry already imported
      healthCheckService.clearResults();
      vi.mocked(serviceRegistry.getAllServices).mockReturnValue(['test-service']);
      vi.mocked(serviceRegistry.getAllInstances).mockReturnValue([
        {
          name: 'test-service',
          id: 'instance-1',
          url: 'http://localhost:3001',
        },
      ]);

      vi.mocked(axios.get).mockRejectedValue(new Error('Connection refused'));

      healthCheckService.start();
      await vi.runAllTimersAsync();

      const results = healthCheckService.getResults('test-service');
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].status).toBe('unhealthy');
      expect(results[0].error).toBe('Connection refused');
    });

    it('应该记录响应时间', async () => {
      // serviceRegistry already imported
      healthCheckService.clearResults();
      vi.mocked(serviceRegistry.getAllServices).mockReturnValue(['test-service']);
      vi.mocked(serviceRegistry.getAllInstances).mockReturnValue([
        {
          name: 'test-service',
          id: 'instance-1',
          url: 'http://localhost:3001',
        },
      ]);

      vi.mocked(axios.get).mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
          status: 200,
          data: { status: 'ok' },
        };
      });

      healthCheckService.start();
      await vi.runAllTimersAsync();

      const results = healthCheckService.getResults('test-service');
      expect(results[0].responseTime).toBeGreaterThan(0);
    });
  });

  describe('getResults', () => {
    it('应该获取指定服务的检查结果', async () => {
      // serviceRegistry already imported
      healthCheckService.clearResults();
      vi.mocked(serviceRegistry.getAllServices).mockReturnValue(['test-service']);
      vi.mocked(serviceRegistry.getAllInstances).mockReturnValue([
        {
          name: 'test-service',
          id: 'instance-1',
          url: 'http://localhost:3001',
        },
      ]);

      vi.mocked(axios.get).mockResolvedValue({
        status: 200,
        data: { status: 'ok' },
      });

      healthCheckService.start();
      await vi.runAllTimersAsync();

      const results = healthCheckService.getResults('test-service');
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].serviceName).toBe('test-service');
    });

    it('应该获取所有服务的检查结果', async () => {
      // serviceRegistry already imported
      vi.mocked(serviceRegistry.getAllServices).mockReturnValue(['service-1', 'service-2']);
      vi.mocked(serviceRegistry.getAllInstances)
        .mockReturnValueOnce([{ name: 'service-1', id: 'instance-1', url: 'http://localhost:3001' }])
        .mockReturnValueOnce([{ name: 'service-2', id: 'instance-2', url: 'http://localhost:3002' }]);

      vi.mocked(axios.get).mockResolvedValue({
        status: 200,
        data: { status: 'ok' },
      });

      healthCheckService.start();
      await vi.runAllTimersAsync();

      const results = healthCheckService.getResults();
      expect(results).toHaveLength(2);
    });

    it('应该在服务不存在时返回空数组', () => {
      const results = healthCheckService.getResults('non-existent-service');
      expect(results).toEqual([]);
    });
  });

  describe('getHealthStats', () => {
    it('应该计算健康统计信息', async () => {
      // serviceRegistry already imported
      healthCheckService.clearResults();
      vi.mocked(serviceRegistry.getAllServices).mockReturnValue(['test-service']);
      vi.mocked(serviceRegistry.getAllInstances).mockReturnValue([
        {
          name: 'test-service',
          id: 'instance-1',
          url: 'http://localhost:3001',
        },
      ]);

      vi.mocked(axios.get)
        .mockImplementation(async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return { status: 200, data: { status: 'ok' } };
        });

      healthCheckService.start();
      await vi.runAllTimersAsync();

      const stats = healthCheckService.getHealthStats('test-service');
      expect(stats.total).toBeGreaterThanOrEqual(1);
      expect(stats.healthy).toBeGreaterThanOrEqual(1);
      expect(stats.averageResponseTime).toBeGreaterThan(0);
    });

    it('应该在无结果时返回零值', () => {
      const stats = healthCheckService.getHealthStats('non-existent-service');
      expect(stats).toEqual({
        total: 0,
        healthy: 0,
        unhealthy: 0,
        averageResponseTime: 0,
      });
    });
  });

  describe('clearResults', () => {
    it('应该清除指定服务的检查结果', async () => {
      // serviceRegistry already imported
      vi.mocked(serviceRegistry.getAllServices).mockReturnValue(['test-service']);
      vi.mocked(serviceRegistry.getAllInstances).mockReturnValue([
        {
          name: 'test-service',
          id: 'instance-1',
          url: 'http://localhost:3001',
        },
      ]);

      vi.mocked(axios.get).mockResolvedValue({
        status: 200,
        data: { status: 'ok' },
      });

      healthCheckService.start();
      await vi.runAllTimersAsync();

      healthCheckService.clearResults('test-service');
      const results = healthCheckService.getResults('test-service');
      expect(results).toHaveLength(0);
    });

    it('应该清除所有服务的检查结果', async () => {
      // serviceRegistry already imported
      vi.mocked(serviceRegistry.getAllServices).mockReturnValue(['service-1', 'service-2']);
      vi.mocked(serviceRegistry.getAllInstances)
        .mockReturnValueOnce([{ name: 'service-1', id: 'instance-1', url: 'http://localhost:3001' }])
        .mockReturnValueOnce([{ name: 'service-2', id: 'instance-2', url: 'http://localhost:3002' }]);

      vi.mocked(axios.get).mockResolvedValue({
        status: 200,
        data: { status: 'ok' },
      });

      healthCheckService.start();
      await vi.runAllTimersAsync();

      healthCheckService.clearResults();
      const results = healthCheckService.getResults();
      expect(results).toHaveLength(0);
    });
  });

  describe('updateConfig', () => {
    it('应该更新配置', () => {
      healthCheckService.updateConfig({
        interval: 5000,
        timeout: 10000,
      });

      const results = healthCheckService.getResults();
      expect(results).toBeDefined();
    });

    it('应该在运行时重启服务以应用新配置', async () => {
      // serviceRegistry already imported
      vi.mocked(serviceRegistry.getAllServices).mockReturnValue(['test-service']);
      vi.mocked(serviceRegistry.getAllInstances).mockReturnValue([
        {
          name: 'test-service',
          id: 'instance-1',
          url: 'http://localhost:3001',
        },
      ]);

      vi.mocked(axios.get).mockResolvedValue({
        status: 200,
        data: { status: 'ok' },
      });

      healthCheckService.start();
      await vi.runAllTimersAsync();

      healthCheckService.updateConfig({ interval: 2000 });

      expect(clearInterval).toHaveBeenCalled();
    });
  });

  describe('failureThreshold', () => {
    it('应该在达到失败阈值时记录警告', async () => {
      // serviceRegistry already imported
      vi.mocked(serviceRegistry.getAllServices).mockReturnValue(['test-service']);
      vi.mocked(serviceRegistry.getAllInstances).mockReturnValue([
        {
          name: 'test-service',
          id: 'instance-1',
          url: 'http://localhost:3001',
        },
      ]);

      vi.mocked(axios.get).mockRejectedValue(new Error('Connection failed'));

      // 直接调用健康检查方法来模拟多次检查
      healthCheckService['checkAllServices']();
      await vi.runAllTimersAsync();
      
      healthCheckService['checkAllServices']();
      await vi.runAllTimersAsync();
      
      healthCheckService['checkAllServices']();
      await vi.runAllTimersAsync();

      // logger already imported
      expect(logger.warn).toHaveBeenCalledWith(
        '服务健康检查连续失败',
        expect.objectContaining({
          serviceName: 'test-service',
          failures: 3,
        })
      );
    });
  });
});
