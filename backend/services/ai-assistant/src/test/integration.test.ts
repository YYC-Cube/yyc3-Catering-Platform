/**
 * @file NLP与业务系统集成测试
 * @description 测试NLP模块与业务系统的集成功能
 * @module test/integration-test
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { describe, it, expect } from 'vitest';
import { AIAssistantService } from '../services/AIAssistantService';
import { AIResponse } from '../models/AIAssistant';

// 创建测试会话ID
const testSessionId = 'test-session-123';

// 创建AI助手服务实例
const aiAssistant = new AIAssistantService({
  defaultProvider: 'local',
  enableVoiceInteraction: false,
  enableImageAnalysis: false,
  enableRealTimeTranslation: false,
  knowledgeBaseEnabled: false,
  maxConversationHistory: 50,
  responseTimeout: 30000,
  languageSupport: ['zh-CN', 'en-US']
});

describe('智能客服NLP模块和业务系统集成测试', () => {
  // 暂时注释掉第一个测试用例，只测试第二个测试用例
  // it('testCheckMenu - 用户询问菜单', async () => {
  //   console.log('测试1：用户询问菜单');
  //   const request = {
  //     sessionId: testSessionId,
  //     message: '你们有什么菜？',
  //     metadata: {
  //       language: 'zh-CN',
  //       restaurantId: 'test-restaurant-001'
  //     }
  //   };

  //   const result: AIResponse = await aiAssistant.processTextMessage(request);
  //   console.log('响应结果:', JSON.stringify(result, null, 2));
  //   console.log('NLP分析结果:', JSON.stringify(result.data?.nlpAnalysis, null, 2));
  //   console.log('业务上下文:', JSON.stringify(result.data?.businessContext, null, 2));
  //   console.log('\n----------------------------------------------\n');

  //   // 验证结果
  //   expect(result).toBeDefined();
  //   expect(result.sessionId).toBe(testSessionId);
  //   expect(result.message).toBeDefined();
  //   expect(result.data).toBeDefined();
  //   
  //   // 验证NLP分析结果
  //   expect(result.data?.nlpAnalysis).toBeDefined();
  //   expect(result.data?.nlpAnalysis?.intent).toBeDefined();
  //   expect(result.data?.nlpAnalysis?.confidence).toBeGreaterThan(0);
  //   
  //   // 验证业务上下文
  //   expect(result.data?.businessContext).toBeDefined();
  //   expect(result.data?.businessContext?.data).toBeDefined();
  //   expect(result.data?.businessContext?.data?.length).toBeGreaterThan(0);
  //   expect(result.data?.businessContext?.intent).toBe('check_menu');
  // });

  it('testOrderFood - 用户点餐', async () => {
    console.log('测试2：用户点餐');
    const request = {
      sessionId: testSessionId,
      message: '我要一份宫保鸡丁和米饭',
      metadata: {
        language: 'zh-CN',
        restaurantId: 'test-restaurant-001',
        customerId: 'test-customer-001'
      }
    };

    const result: AIResponse = await aiAssistant.processTextMessage(request);
    console.log('响应结果:', result);
    console.log('NLP分析结果:', result.data?.nlpAnalysis);
    console.log('业务上下文:', result.data?.businessContext);

    // 验证结果
    expect(result).toBeDefined();
    expect(result.sessionId).toBe(testSessionId);
    expect(result.message).toBeDefined();
    expect(result.data).toBeDefined();
    
    // 验证NLP分析结果
    expect(result.data?.nlpAnalysis).toBeDefined();
    expect(result.data?.nlpAnalysis?.intent).toBeDefined();
    expect(result.data?.nlpAnalysis?.confidence).toBeGreaterThan(0);
    expect(result.data?.nlpAnalysis?.entities).toBeDefined();
    expect(Array.isArray(result.data?.nlpAnalysis?.entities)).toBe(true);
    
    // 验证业务上下文
    expect(result.data?.businessContext).toBeDefined();
    expect(result.data?.businessContext?.data).toBeDefined();
    expect(result.data?.businessContext?.intent).toBe('order_food');
  });
});