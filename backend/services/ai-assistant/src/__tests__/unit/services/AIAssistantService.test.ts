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

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AIAssistantService } from '../../../services/AIAssistantService';

describe('AIAssistantService', () => {
  let aiAssistantService: AIAssistantService;

  beforeEach(() => {
    const config = {
      defaultProvider: 'local' as const,
      enableVoiceInteraction: false,
      enableImageAnalysis: false,
      enableRealTimeTranslation: false,
      knowledgeBaseEnabled: false,
      maxConversationHistory: 10,
      responseTimeout: 30000,
      languageSupport: ['zh-CN', 'en-US']
    };
    aiAssistantService = new AIAssistantService(config);
  });

  afterEach(() => {
    // 在每个测试后清理资源
    // 如果有需要清理的资源，可以在这里添加
  });

  describe('getSalesForecast', () => {
    it('should return a valid sales forecast response with correct structure', async () => {
      const sessionId = 'test-session-123';
      const context = {
        restaurantId: 'test-restaurant-456',
        timeRange: {
          startDate: '2025-01-08',
          endDate: '2025-01-14'
        },
        historicalData: [
          { date: '2025-01-01', sales: 1500, orders: 30, customers: 85 },
          { date: '2025-01-02', sales: 1800, orders: 35, customers: 92 },
          { date: '2025-01-03', sales: 2200, orders: 45, customers: 110 },
          { date: '2025-01-04', sales: 1900, orders: 38, customers: 95 },
          { date: '2025-01-05', sales: 2400, orders: 50, customers: 120 },
          { date: '2025-01-06', sales: 2800, orders: 60, customers: 150 },
          { date: '2025-01-07', sales: 3000, orders: 65, customers: 160 }
        ],
        factors: {
          promotions: true,
          holidays: false,
          weather: true,
          events: true
        }
      };

      const result = await aiAssistantService.getSalesForecast(sessionId, context);

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
      expect(result.data?.trends).toBeDefined();
      expect(Array.isArray(result.data?.trends)).toBe(true);
    });

    it('should handle empty historical data gracefully', async () => {
      const sessionId = 'test-session-789';
      const context = {
        restaurantId: 'test-restaurant-012',
        timeRange: {
          startDate: '2025-01-08',
          endDate: '2025-01-14'
        },
        historicalData: [],
        factors: {}
      };

      const result = await aiAssistantService.getSalesForecast(sessionId, context);

      expect(result).toBeDefined();
      expect(result.sessionId).toBe(sessionId);
      expect(result.confidence).toBeDefined();
      expect(result.data?.forecast).toBeDefined();
      expect(Array.isArray(result.data?.forecast)).toBe(true);
    });

    it('should handle different time ranges correctly', async () => {
      const testCases = [
        { startDate: '2025-01-08', endDate: '2025-01-10' },
        { startDate: '2025-01-08', endDate: '2025-01-14' },
        { startDate: '2025-01-08', endDate: '2025-01-21' },
        { startDate: '2025-01-08', endDate: '2025-02-07' }
      ];
      const sessionId = 'test-session-321';
      const baseContext = {
        restaurantId: 'test-restaurant-654',
        historicalData: [
          { date: '2025-01-01', sales: 1500, orders: 30, customers: 85 },
          { date: '2025-01-02', sales: 1800, orders: 35, customers: 92 }
        ],
        factors: {}
      };

      for (const timeRange of testCases) {
        const context = { ...baseContext, timeRange };
        const result = await aiAssistantService.getSalesForecast(sessionId, context);

        expect(result.data?.forecast).toBeDefined();
        expect(Array.isArray(result.data?.forecast)).toBe(true);
      }
    });

    it('should factor in promotions and events in the forecast', async () => {
      const sessionId = 'test-session-654';
      const context = {
        restaurantId: 'test-restaurant-987',
        timeRange: {
          startDate: '2025-01-08',
          endDate: '2025-01-14'
        },
        historicalData: [
          { date: '2025-01-01', sales: 1500, orders: 30, customers: 85 },
          { date: '2025-01-02', sales: 1800, orders: 35, customers: 92 },
          { date: '2025-01-03', sales: 2200, orders: 45, customers: 110 }
        ],
        factors: {
          promotions: true,
          holidays: false,
          weather: true,
          events: true
        }
      };

      const result = await aiAssistantService.getSalesForecast(sessionId, context);

      expect(result).toBeDefined();
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions.length).toBeGreaterThan(0);
    });
  });
});
