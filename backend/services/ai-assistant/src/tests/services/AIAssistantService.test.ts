/**
 * @file AIAssistantService测试文件
 * @description 测试AI助手服务的核心功能
 * @module tests/services/AIAssistantService
 * @author YYC³团队
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { AIAssistantService } from '../../services/AIAssistantService';

describe('AIAssistantService', () => {
  let aiAssistantService: AIAssistantService;

  beforeEach(() => {
    // 在每个测试前创建新的服务实例
    aiAssistantService = new AIAssistantService();
  });

  afterEach(() => {
    // 在每个测试后清理资源
    // 如果有需要清理的资源，可以在这里添加
  });

  describe('getSalesForecast', () => {
    it('should return a valid sales forecast response with correct structure', async () => {
      // 准备测试数据
      const sessionId = 'test-session-123';
      const context = {
        restaurantId: 'test-restaurant-456',
        timeRange: 7,
        historicalData: [
          { date: '2025-01-01', sales: 1500, orders: 30, customerCount: 85 },
          { date: '2025-01-02', sales: 1800, orders: 35, customerCount: 92 },
          { date: '2025-01-03', sales: 2200, orders: 45, customerCount: 110 },
          { date: '2025-01-04', sales: 1900, orders: 38, customerCount: 95 },
          { date: '2025-01-05', sales: 2400, orders: 50, customerCount: 120 },
          { date: '2025-01-06', sales: 2800, orders: 60, customerCount: 150 },
          { date: '2025-01-07', sales: 3000, orders: 65, customerCount: 160 }
        ],
        factors: {
          weekend: true,
          promotions: ['新年促销'],
          holidays: [],
          weather: 'sunny',
          events: ['附近商场开业']
        }
      };

      // 执行测试
      const result = await aiAssistantService.getSalesForecast(sessionId, context);

      // 验证结果
      expect(result).toBeDefined();
      expect(result.sessionId).toBe(sessionId);
      expect(result.message).toBeDefined();
      expect(result.confidence).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.suggestions).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.forecast).toBeDefined();
      expect(Array.isArray(result.data?.forecast)).toBe(true);
      expect(result.data?.forecast.length).toBe(context.timeRange);
      expect(result.data?.trends).toBeDefined();
      expect(Array.isArray(result.data?.trends)).toBe(true);
    });

    it('should handle empty historical data gracefully', async () => {
      // 准备测试数据 - 空的历史数据
      const sessionId = 'test-session-789';
      const context = {
        restaurantId: 'test-restaurant-012',
        timeRange: 7,
        historicalData: [],
        factors: {}
      };

      // 执行测试
      const result = await aiAssistantService.getSalesForecast(sessionId, context);

      // 验证结果
      expect(result).toBeDefined();
      expect(result.sessionId).toBe(sessionId);
      expect(result.confidence).toBeDefined();
      expect(result.data?.forecast).toBeDefined();
      expect(Array.isArray(result.data?.forecast)).toBe(true);
      expect(result.data?.forecast.length).toBe(context.timeRange);
    });

    it('should handle different time ranges correctly', async () => {
      // 测试不同的时间范围
      const testCases = [3, 7, 14, 30];
      const sessionId = 'test-session-321';
      const baseContext = {
        restaurantId: 'test-restaurant-654',
        historicalData: [
          { date: '2025-01-01', sales: 1500, orders: 30, customerCount: 85 },
          { date: '2025-01-02', sales: 1800, orders: 35, customerCount: 92 }
        ],
        factors: {}
      };

      for (const timeRange of testCases) {
        const context = { ...baseContext, timeRange };
        const result = await aiAssistantService.getSalesForecast(sessionId, context);

        expect(result.data?.forecast.length).toBe(timeRange);
      }
    });

    it('should factor in promotions and events in the forecast', async () => {
      // 测试促销和事件对预测的影响
      const sessionId = 'test-session-654';
      const context = {
        restaurantId: 'test-restaurant-987',
        timeRange: 7,
        historicalData: [
          { date: '2025-01-01', sales: 1500, orders: 30, customerCount: 85 },
          { date: '2025-01-02', sales: 1800, orders: 35, customerCount: 92 },
          { date: '2025-01-03', sales: 2200, orders: 45, customerCount: 110 }
        ],
        factors: {
          promotions: ['情人节促销', '会员日折扣'],
          events: ['附近演唱会', '社区活动'],
          weekend: true
        }
      };

      const result = await aiAssistantService.getSalesForecast(sessionId, context);

      // 验证结果
      expect(result).toBeDefined();
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions.length).toBeGreaterThan(0);
      // 验证预测数据是否合理
      result.data?.forecast.forEach(day => {
        expect(day.sales).toBeDefined();
        expect(day.sales).toBeGreaterThan(0);
        expect(day.orders).toBeDefined();
        expect(day.orders).toBeGreaterThan(0);
        expect(day.customerCount).toBeDefined();
        expect(day.customerCount).toBeGreaterThan(0);
      });
    });
  });
});
