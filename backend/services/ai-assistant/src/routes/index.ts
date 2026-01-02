/**
 * @file index.ts
 * @description YYC³餐饮行业智能化平台 - AI助手路由配置
 * @module routes
 * @author YYC³团队
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Router } from 'express';
import { AIAssistantController } from '../controllers/AIAssistantController';
import { AIAssistantService } from '../services/AIAssistantService';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { rateLimit } from 'express-rate-limit';
import { aiAssistantSchemas } from '../schemas/validation';

const router = Router();

// 初始化AI助手服务配置
const aiAssistantConfig = {
  defaultProvider: 'openai',
  enableVoiceInteraction: true,
  enableImageAnalysis: true,
  enableRealTimeTranslation: true,
  knowledgeBaseEnabled: true,
  maxConversationHistory: 100,
  responseTimeout: 30000,
  languageSupport: ['zh-CN', 'en-US']
};

// 初始化服务和控制器
const aiService = new AIAssistantService(aiAssistantConfig);
const controller = new AIAssistantController(aiService);

// 限流配置 - AI助手接口每分钟最多100个请求
const aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 100,
  message: {
    code: 429,
    message: 'Too many requests to AI assistant',
    timestamp: Date.now(),
    success: false
  }
});

// 应用限流到所有AI助手路由
router.use(aiRateLimit);

// 对话相关路由
router.post('/message',
  authenticateToken,
  controller.sendMessage.bind(controller)
);

// 语音相关路由
router.post('/voice',
  authenticateToken,
  AIAssistantController.getUploadMiddleware()[0], // 音频文件上传
  controller.processVoice.bind(controller)
);

router.post('/voice/generate',
  authenticateToken,
  controller.generateVoice.bind(controller)
);

// 图像分析相关路由
router.post('/image/analyze',
  authenticateToken,
  AIAssistantController.getUploadMiddleware()[1], // 图像文件上传
  controller.analyzeImage.bind(controller)
);

// 推荐相关路由
router.post('/recommendations',
  authenticateToken,
  controller.getRecommendations.bind(controller)
);

// 会话管理相关路由
router.get('/conversation/:sessionId/history',
  authenticateToken,
  controller.getConversationHistory.bind(controller)
);

router.delete('/conversation/:sessionId/history',
  authenticateToken,
  controller.clearConversationHistory.bind(controller)
);

router.get('/conversation/:sessionId/stats',
  authenticateToken,
  controller.getSessionStats.bind(controller)
);

// 系统状态相关路由
router.get('/status',
  controller.getStatus.bind(controller)
);

router.put('/config',
  authenticateToken,
  controller.updateConfig.bind(controller)
);

// 决策支持相关路由
router.post('/analytics/sales-forecast',
  authenticateToken,
  validateRequest(aiAssistantSchemas.salesForecast),
  controller.getSalesForecast.bind(controller)
);

router.post('/analytics/inventory-optimization',
  authenticateToken,
  validateRequest(aiAssistantSchemas.inventoryOptimization),
  controller.getInventoryOptimization.bind(controller)
);

router.post('/analytics/customer-behavior',
  authenticateToken,
  validateRequest(aiAssistantSchemas.customerBehaviorAnalysis),
  controller.getCustomerBehaviorAnalysis.bind(controller)
);

router.post('/analytics/menu-optimization',
  authenticateToken,
  validateRequest(aiAssistantSchemas.menuOptimization),
  controller.getMenuOptimization.bind(controller)
);

router.post('/analytics/operational-efficiency',
  authenticateToken,
  validateRequest(aiAssistantSchemas.operationalEfficiency),
  controller.getOperationalEfficiency.bind(controller)
);

export default router;