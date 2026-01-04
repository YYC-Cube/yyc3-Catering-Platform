/**
 * @file AIAssistant.ts
 * @description YYC³餐饮行业智能化平台 - AI助手数据模型
 * @module models/AIAssistant
 * @author YYC³团队
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

// AI请求接口
export interface AIRequest {
  sessionId: string;
  message: string;
  metadata?: {
    language?: string;
    originalFormat?: 'text' | 'voice' | 'image';
    confidence?: number;
    [key: string]: unknown;
  };
}

// AI响应接口
export interface AIResponse {
  sessionId: string;
  message: string;
  confidence?: number;
  suggestions?: string[];
  data?: any;
  metadata?: {
    timestamp: Date;
    provider?: 'openai' | 'claude' | 'local';
    processingTime?: number;
    hasKnowledgeBaseData?: boolean;
    [key: string]: any;
  };
}

// 消息接口
export interface AIMessage {
  id: string;
  sessionId: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
}

// 会话接口
export interface AISession {
  sessionId: string;
  context: {
    restaurantId?: string;
    customerId?: string;
    currentOrder?: any[];
    [key: string]: any;
  };
  startTime: Date;
  lastActivity: Date;
  messageCount: number;
  language: string;
}

// 对话上下文接口
export interface ConversationContext {
  sessionId: string;
  conversationHistory: AIMessage[];
  currentMessage: string;
  sessionContext: {
    restaurantId?: string;
    customerId?: string;
    currentOrder?: any[];
    [key: string]: any;
  };
  metadata?: {
    language?: string;
    originalFormat?: 'text' | 'voice' | 'image';
    confidence?: number;
    [key: string]: any;
  };
  timestamp: Date;
  // NLP分析结果
  nlpAnalysis?: {
    intent: string;
    confidence: number;
    entities: Array<{
      type: string;
      value: string;
      confidence: number;
      startIndex: number;
      endIndex: number;
    }>;
    sentiment: {
      polarity: 'positive' | 'neutral' | 'negative';
      score: number;
    };
  };

  // 业务系统集成结果
  businessContext?: any;
}
