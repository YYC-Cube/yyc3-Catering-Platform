/**
 * @file AIAssistantController.ts
 * @description YYC³餐饮行业智能化平台 - AI助手控制器
 * @module controllers/AIAssistantController
 * @author YYC³团队
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Request, Response } from 'express';
import multer from 'multer';
import { AIAssistantService } from '../services/AIAssistantService';
import { ApiResponse } from '../../../shared/types/ApiResponse';
import { AuthenticatedRequest } from '../../../shared/types/Auth';
import { logger } from '../config/logger';

// 配置文件上传
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    // 允许的文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  }
});

export class AIAssistantController {
  constructor(private aiService: AIAssistantService) {}

  /**
   * 发送文本消息给AI助手
   */
  async sendMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const { message, sessionId } = req.body;
      const userId = req.user?.id;

      if (!message) {
        return res.status(400).json({
          code: 400,
          message: 'Message is required',
          timestamp: Date.now(),
          success: false
        });
      }

      const aiRequest = {
        sessionId: sessionId || this.generateSessionId(),
        message,
        metadata: {
          userId,
          platform: 'web',
          timestamp: new Date()
        }
      };

      const response = await this.aiService.processTextMessage(aiRequest);

      const apiResponse: ApiResponse = {
        code: 200,
        message: 'Success',
        data: response,
        timestamp: Date.now(),
        requestId: req.id,
        success: true
      };

      res.json(apiResponse);

    } catch (error) {
      logger.error('Send message error:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
        timestamp: Date.now(),
        requestId: req.id,
        success: false
      });
    }
  }

  /**
   * 语音输入处理
   */
  async processVoice(req: AuthenticatedRequest, res: Response) {
    try {
      const { sessionId, language = 'zh-CN' } = req.body;
      const audioFile = req.file;

      if (!audioFile) {
        return res.status(400).json({
          code: 400,
          message: 'Audio file is required',
          timestamp: Date.now(),
          success: false
        });
      }

      const response = await this.aiService.processVoiceInput(
        audioFile.buffer,
        sessionId || this.generateSessionId(),
        language
      );

      const apiResponse: ApiResponse = {
        code: 200,
        message: 'Voice processing completed',
        data: response,
        timestamp: Date.now(),
        requestId: req.id,
        success: true
      };

      res.json(apiResponse);

    } catch (error) {
      logger.error('Process voice error:', error);
      res.status(500).json({
        code: 500,
        message: 'Voice processing failed',
        timestamp: Date.now(),
        requestId: req.id,
        success: false
      });
    }
  }

  /**
   * 生成语音回复
   */
  async generateVoice(req: AuthenticatedRequest, res: Response) {
    try {
      const { text, sessionId, language = 'zh-CN', voice = 'female' } = req.body;

      if (!text) {
        return res.status(400).json({
          code: 400,
          message: 'Text is required for voice generation',
          timestamp: Date.now(),
          success: false
        });
      }

      const audioBuffer = await this.aiService.generateVoiceResponse(
        text,
        sessionId || this.generateSessionId(),
        language,
        voice
      );

      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length
      });

      res.send(audioBuffer);

    } catch (error) {
      logger.error('Generate voice error:', error);
      res.status(500).json({
        code: 500,
        message: 'Voice generation failed',
        timestamp: Date.now(),
        requestId: req.id,
        success: false
      });
    }
  }

  /**
   * 图像分析处理
   */
  async analyzeImage(req: AuthenticatedRequest, res: Response) {
    try {
      const { sessionId, analysisType = 'food' } = req.body;
      const imageFile = req.file;

      if (!imageFile) {
        return res.status(400).json({
          code: 400,
          message: 'Image file is required',
          timestamp: Date.now(),
          success: false
        });
      }

      const response = await this.aiService.processImageAnalysis(
        imageFile.buffer,
        sessionId || this.generateSessionId(),
        analysisType
      );

      const apiResponse: ApiResponse = {
        code: 200,
        message: 'Image analysis completed',
        data: response,
        timestamp: Date.now(),
        requestId: req.id,
        success: true
      };

      res.json(apiResponse);

    } catch (error) {
      logger.error('Analyze image error:', error);
      res.status(500).json({
        code: 500,
        message: 'Image analysis failed',
        timestamp: Date.now(),
        requestId: req.id,
        success: false
      });
    }
  }

  /**
   * 获取智能推荐
   */
  async getRecommendations(req: AuthenticatedRequest, res: Response) {
    try {
      const { sessionId, context } = req.body;

      const response = await this.aiService.getRecommendations(
        sessionId || this.generateSessionId(),
        {
          ...context,
          customerProfile: req.user,
          restaurantContext: req.tenant
        }
      );

      const apiResponse: ApiResponse = {
        code: 200,
        message: 'Recommendations generated',
        data: response,
        timestamp: Date.now(),
        requestId: req.id,
        success: true
      };

      res.json(apiResponse);

    } catch (error) {
      logger.error('Get recommendations error:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to generate recommendations',
        timestamp: Date.now(),
        requestId: req.id,
        success: false
      });
    }
  }

  /**
   * 获取会话历史
   */
  async getConversationHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          code: 400,
          message: 'Session ID is required',
          timestamp: Date.now(),
          success: false
        });
      }

      const history = await this.aiService.getSessionHistory(sessionId);

      const apiResponse: ApiResponse = {
        code: 200,
        message: 'Conversation history retrieved',
        data: { history },
        timestamp: Date.now(),
        requestId: req.id,
        success: true
      };

      res.json(apiResponse);

    } catch (error) {
      logger.error('Get conversation history error:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to retrieve conversation history',
        timestamp: Date.now(),
        requestId: req.id,
        success: false
      });
    }
  }

  /**
   * 清除会话历史
   */
  async clearConversationHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          code: 400,
          message: 'Session ID is required',
          timestamp: Date.now(),
          success: false
        });
      }

      await this.aiService.clearSessionHistory(sessionId);

      const apiResponse: ApiResponse = {
        code: 200,
        message: 'Conversation history cleared',
        data: null,
        timestamp: Date.now(),
        requestId: req.id,
        success: true
      };

      res.json(apiResponse);

    } catch (error) {
      logger.error('Clear conversation history error:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to clear conversation history',
        timestamp: Date.now(),
        requestId: req.id,
        success: false
      });
    }
  }

  /**
   * 获取会话统计信息
   */
  async getSessionStats(req: AuthenticatedRequest, res: Response) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          code: 400,
          message: 'Session ID is required',
          timestamp: Date.now(),
          success: false
        });
      }

      const stats = this.aiService.getSessionStats(sessionId);

      const apiResponse: ApiResponse = {
        code: 200,
        message: 'Session statistics retrieved',
        data: stats,
        timestamp: Date.now(),
        requestId: req.id,
        success: true
      };

      res.json(apiResponse);

    } catch (error) {
      logger.error('Get session stats error:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to retrieve session statistics',
        timestamp: Date.now(),
        requestId: req.id,
        success: false
      });
    }
  }

  /**
   * 获取AI助手状态
   */
  async getStatus(req: Request, res: Response) {
    try {
      const status = this.aiService.getStatus();

      const apiResponse: ApiResponse = {
        code: 200,
        message: 'AI assistant status retrieved',
        data: status,
        timestamp: Date.now(),
        requestId: req.id,
        success: true
      };

      res.json(apiResponse);

    } catch (error) {
      logger.error('Get AI assistant status error:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to retrieve AI assistant status',
        timestamp: Date.now(),
        requestId: req.id,
        success: false
      });
    }
  }

  /**
   * 更新AI助手配置
   */
  async updateConfig(req: AuthenticatedRequest, res: Response) {
    try {
      // 只有管理员才能更新配置
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          code: 403,
          message: 'Insufficient permissions',
          timestamp: Date.now(),
          success: false
        });
      }

      const configUpdates = req.body;
      this.aiService.updateConfig(configUpdates);

      const apiResponse: ApiResponse = {
        code: 200,
        message: 'AI assistant configuration updated',
        data: null,
        timestamp: Date.now(),
        requestId: req.id,
        success: true
      };

      res.json(apiResponse);

    } catch (error) {
      logger.error('Update AI assistant config error:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to update AI assistant configuration',
        timestamp: Date.now(),
        requestId: req.id,
        success: false
      });
    }
  }

  /**
   * 获取销售预测
   */
  async getSalesForecast(req: AuthenticatedRequest, res: Response) {
    try {
      const { context } = req.body;
      const userId = req.user?.id;
      const restaurantId = context?.restaurantId;

      if (!restaurantId) {
        return res.status(400).json({
          code: 400,
          message: 'Restaurant ID is required',
          timestamp: Date.now(),
          success: false
        });
      }

      // 从context中提取参数，或者使用默认值
      const timeRange = context?.timeRange || 'weekly';
      const dateRange = context?.dateRange || {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      };
      const includePromotions = context?.factors?.promotions !== false;
      const historicalData = context?.historicalData;
      const factors = context?.factors;

      const sessionId = req.params.sessionId || this.generateSessionId();
      const forecast = await this.aiService.getSalesForecast(sessionId, {
        restaurantId,
        timeRange,
        dateRange,
        includePromotions,
        historicalData,
        factors
      });

      const apiResponse: ApiResponse = {
        code: 200,
        message: 'Sales forecast retrieved',
        data: forecast,
        timestamp: Date.now(),
        requestId: req.id,
        success: true
      };

      res.json(apiResponse);

    } catch (error) {
      logger.error('Get sales forecast error:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to retrieve sales forecast',
        timestamp: Date.now(),
        requestId: req.id,
        success: false
      });
    }
  }

  /**
   * 获取库存优化建议
   */
  async getInventoryOptimization(req: AuthenticatedRequest, res: Response) {
    try {
      const { context } = req.body;
      const restaurantId = context?.restaurantId;

      if (!restaurantId) {
        return res.status(400).json({
          code: 400,
          message: 'Restaurant ID is required',
          timestamp: Date.now(),
          success: false
        });
      }

      // 从context中提取参数
      const currentInventory = context?.currentInventory;
      const salesData = context?.salesData;
      const supplierInfo = context?.supplierInfo;

      const sessionId = req.params.sessionId || this.generateSessionId();
      const optimization = await this.aiService.getInventoryOptimization(sessionId, {
        restaurantId,
        currentInventory,
        salesData,
        supplierInfo
      });

      const apiResponse: ApiResponse = {
        code: 200,
        message: 'Inventory optimization retrieved',
        data: optimization,
        timestamp: Date.now(),
        requestId: req.id,
        success: true
      };

      res.json(apiResponse);

    } catch (error) {
      logger.error('Get inventory optimization error:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to retrieve inventory optimization',
        timestamp: Date.now(),
        requestId: req.id,
        success: false
      });
    }
  }

  /**
   * 获取客户行为分析
   */
  async getCustomerBehaviorAnalysis(req: AuthenticatedRequest, res: Response) {
    try {
      const { context } = req.body;
      const restaurantId = context?.restaurantId;

      if (!restaurantId) {
        return res.status(400).json({
          code: 400,
          message: 'Restaurant ID is required',
          timestamp: Date.now(),
          success: false
        });
      }

      // 从context中提取参数
      const customerData = context?.customerData;
      const timeRange = context?.timeRange;

      const sessionId = req.params.sessionId || this.generateSessionId();
      const analysis = await this.aiService.getCustomerBehaviorAnalysis(sessionId, {
        restaurantId,
        customerData,
        timeRange
      });

      const apiResponse: ApiResponse = {
        code: 200,
        message: 'Customer behavior analysis retrieved',
        data: analysis,
        timestamp: Date.now(),
        requestId: req.id,
        success: true
      };

      res.json(apiResponse);

    } catch (error) {
      logger.error('Get customer behavior analysis error:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to retrieve customer behavior analysis',
        timestamp: Date.now(),
        requestId: req.id,
        success: false
      });
    }
  }

  /**
   * 获取菜单优化建议
   */
  async getMenuOptimization(req: AuthenticatedRequest, res: Response) {
    try {
      const { context } = req.body;
      const restaurantId = context?.restaurantId;

      if (!restaurantId) {
        return res.status(400).json({
          code: 400,
          message: 'Restaurant ID is required',
          timestamp: Date.now(),
          success: false
        });
      }

      // 从context中提取参数
      const menuItems = context?.menuItems;
      const salesData = context?.salesData;
      const season = context?.season;
      const dietaryTrends = context?.dietaryTrends;

      const sessionId = req.params.sessionId || this.generateSessionId();
      const optimization = await this.aiService.getMenuOptimization(sessionId, {
        restaurantId,
        menuItems,
        salesData,
        season,
        dietaryTrends
      });

      const apiResponse: ApiResponse = {
        code: 200,
        message: 'Menu optimization retrieved',
        data: optimization,
        timestamp: Date.now(),
        requestId: req.id,
        success: true
      };

      res.json(apiResponse);

    } catch (error) {
      logger.error('Get menu optimization error:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to retrieve menu optimization',
        timestamp: Date.now(),
        requestId: req.id,
        success: false
      });
    }
  }

  /**
   * 获取运营效率分析
   */
  async getOperationalEfficiency(req: AuthenticatedRequest, res: Response) {
    try {
      const { context } = req.body;
      const restaurantId = context?.restaurantId;

      if (!restaurantId) {
        return res.status(400).json({
          code: 400,
          message: 'Restaurant ID is required',
          timestamp: Date.now(),
          success: false
        });
      }

      // 从context中提取参数
      const operationalData = context?.operationalData;
      const goals = context?.goals;

      const sessionId = req.params.sessionId || this.generateSessionId();
      const efficiency = await this.aiService.getOperationalEfficiency(sessionId, {
        restaurantId,
        operationalData,
        goals
      });

      const apiResponse: ApiResponse = {
        code: 200,
        message: 'Operational efficiency retrieved',
        data: efficiency,
        timestamp: Date.now(),
        requestId: req.id,
        success: true
      };

      res.json(apiResponse);

    } catch (error) {
      logger.error('Get operational efficiency error:', error);
      res.status(500).json({
        code: 500,
        message: 'Failed to retrieve operational efficiency',
        timestamp: Date.now(),
        requestId: req.id,
        success: false
      });
    }
  }

  /**
   * 文件上传中间件包装器
   */
  static getUploadMiddleware() {
    return [
      upload.single('audio'), // 语音文件上传
      upload.single('image')  // 图像文件上传
    ];
  }

  /**
   * 私有方法
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 导出路由处理器
export const aiAssistantRoutes = {
  // 对话接口
  'POST /ai/message': 'sendMessage',

  // 语音接口
  'POST /ai/voice': 'processVoice',
  'POST /ai/voice/generate': 'generateVoice',

  // 图像接口
  'POST /ai/image/analyze': 'analyzeImage',

  // 推荐接口
  'POST /ai/recommendations': 'getRecommendations',

  // 会话管理接口
  'GET /ai/conversation/:sessionId/history': 'getConversationHistory',
  'DELETE /ai/conversation/:sessionId/history': 'clearConversationHistory',
  'GET /ai/conversation/:sessionId/stats': 'getSessionStats',

  // 系统接口
  'GET /ai/status': 'getStatus',
  'PUT /ai/config': 'updateConfig',
  
  // 经营决策支持接口
  'POST /ai/analytics/sales-forecast': 'getSalesForecast',
  'POST /ai/analytics/inventory-optimization': 'getInventoryOptimization',
  'POST /ai/analytics/customer-behavior': 'getCustomerBehaviorAnalysis',
  'POST /ai/analytics/menu-optimization': 'getMenuOptimization',
  'POST /ai/analytics/operational-efficiency': 'getOperationalEfficiency'
};