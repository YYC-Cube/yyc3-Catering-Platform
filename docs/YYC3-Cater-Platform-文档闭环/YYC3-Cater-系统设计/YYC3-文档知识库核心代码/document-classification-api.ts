/**
 * @file 文档智能分类API
 * @description 提供文档分类的RESTful API接口，包括单文档分类、批量分类、规则管理等功能
 * @module api/document-classification
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { documentClassificationService } from './document-classification-service';
import { logger } from './logger';

const app = new Hono();

// ==================== 请求验证模式 ====================

/**
 * 分类文档请求验证模式
 */
const classifyDocumentSchema = z.object({
  documentId: z.string().min(1, '文档ID不能为空'),
  method: z.enum(['rule-based', 'ml-based', 'hybrid']).optional(),
});

/**
 * 批量分类文档请求验证模式
 */
const batchClassifySchema = z.object({
  documentIds: z.array(z.string()).min(1, '文档ID列表不能为空').max(50, '最多处理50个文档'),
  method: z.enum(['rule-based', 'ml-based', 'hybrid']).optional(),
});

/**
 * 添加分类规则请求验证模式
 */
const addRuleSchema = z.object({
  name: z.string().min(1, '规则名称不能为空').max(100, '规则名称不能超过100字符'),
  category: z.string().min(1, '分类名称不能为空').max(50, '分类名称不能超过50字符'),
  keywords: z.array(z.string()).min(1, '关键词列表不能为空').max(20, '最多20个关键词'),
  weight: z.number().min(0).max(1).optional(),
  enabled: z.boolean().optional(),
});

/**
 * 更新分类规则请求验证模式
 */
const updateRuleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z.string().min(1).max(50).optional(),
  keywords: z.array(z.string()).min(1).max(20).optional(),
  weight: z.number().min(0).max(1).optional(),
  enabled: z.boolean().optional(),
});

// ==================== API路由 ====================

/**
 * 分类文档
 * @route POST /api/document-classification/classify
 * @access 公开
 * @returns {Promise<Response>} 分类结果
 */
app.post('/classify', zValidator('json', classifyDocumentSchema), async (c) => {
  try {
    const { documentId, method = 'hybrid' } = c.req.valid('json');

    // 分类文档
    const result = await documentClassificationService.classifyDocument(documentId, method);

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error classifying document:', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '分类文档失败',
    }, 500);
  }
});

/**
 * 批量分类文档
 * @route POST /api/document-classification/batch
 * @access 公开
 * @returns {Promise<Response>} 分类结果列表
 */
app.post('/batch', zValidator('json', batchClassifySchema), async (c) => {
  try {
    const { documentIds, method = 'hybrid' } = c.req.valid('json');

    // 批量分类文档
    const results = await documentClassificationService.classifyBatchDocuments(documentIds, method);

    return c.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    logger.error('Error batch classifying documents:', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '批量分类文档失败',
    }, 500);
  }
});

/**
 * 获取分类建议
 * @route GET /api/document-classification/suggestions/:documentId
 * @access 公开
 * @returns {Promise<Response>} 分类建议
 */
app.get('/suggestions/:documentId', async (c) => {
  try {
    const documentId = c.req.param('documentId');

    // 获取分类建议
    const suggestions = await documentClassificationService.getClassificationSuggestions(documentId);

    return c.json({
      success: true,
      data: suggestions,
      count: suggestions.length,
    });
  } catch (error) {
    logger.error('Error getting classification suggestions:', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取分类建议失败',
    }, 500);
  }
});

/**
 * 获取分类统计
 * @route GET /api/document-classification/stats
 * @access 公开
 * @returns {Promise<Response>} 分类统计
 */
app.get('/stats', async (c) => {
  try {
    // 获取分类统计
    const stats = await documentClassificationService.getClassificationStats();

    return c.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error getting classification stats:', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取分类统计失败',
    }, 500);
  }
});

// ==================== 分类规则管理 ====================

/**
 * 获取所有分类规则
 * @route GET /api/document-classification/rules
 * @access 公开
 * @returns {Promise<Response>} 分类规则列表
 */
app.get('/rules', async (c) => {
  try {
    // 获取所有规则
    const rules = documentClassificationService.getAllRules();

    return c.json({
      success: true,
      data: rules,
      count: rules.length,
    });
  } catch (error) {
    logger.error('Error getting rules:', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取分类规则失败',
    }, 500);
  }
});

/**
 * 获取单个分类规则
 * @route GET /api/document-classification/rules/:ruleId
 * @access 公开
 * @returns {Promise<Response>} 分类规则
 */
app.get('/rules/:ruleId', async (c) => {
  try {
    const ruleId = c.req.param('ruleId');

    // 获取规则
    const rule = documentClassificationService.getRule(ruleId);

    if (!rule) {
      return c.json({
        success: false,
        error: '规则不存在',
      }, 404);
    }

    return c.json({
      success: true,
      data: rule,
    });
  } catch (error) {
    logger.error('Error getting rule:', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取分类规则失败',
    }, 500);
  }
});

/**
 * 添加分类规则
 * @route POST /api/document-classification/rules
 * @access 私有
 * @returns {Promise<Response>} 创建的规则
 */
app.post('/rules', zValidator('json', addRuleSchema), async (c) => {
  try {
    const body = c.req.valid('json');

    // 添加规则
    const ruleId = documentClassificationService.addRule({
      name: body.name,
      category: body.category,
      keywords: body.keywords,
      weight: body.weight ?? 0.9,
      enabled: body.enabled ?? true,
    });

    // 获取创建的规则
    const rule = documentClassificationService.getRule(ruleId);

    return c.json({
      success: true,
      data: rule,
    }, 201);
  } catch (error) {
    logger.error('Error adding rule:', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '添加分类规则失败',
    }, 500);
  }
});

/**
 * 更新分类规则
 * @route PUT /api/document-classification/rules/:ruleId
 * @access 私有
 * @returns {Promise<Response>} 更新的规则
 */
app.put('/rules/:ruleId', zValidator('json', updateRuleSchema), async (c) => {
  try {
    const ruleId = c.req.param('ruleId');
    const updates = c.req.valid('json');

    // 更新规则
    documentClassificationService.updateRule(ruleId, updates);

    // 获取更新的规则
    const rule = documentClassificationService.getRule(ruleId);

    if (!rule) {
      return c.json({
        success: false,
        error: '规则不存在',
      }, 404);
    }

    return c.json({
      success: true,
      data: rule,
    });
  } catch (error) {
    logger.error('Error updating rule:', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '更新分类规则失败',
    }, 500);
  }
});

/**
 * 删除分类规则
 * @route DELETE /api/document-classification/rules/:ruleId
 * @access 私有
 * @returns {Promise<Response>} 删除结果
 */
app.delete('/rules/:ruleId', async (c) => {
  try {
    const ruleId = c.req.param('ruleId');

    // 删除规则
    documentClassificationService.deleteRule(ruleId);

    return c.json({
      success: true,
      message: '规则已删除',
    });
  } catch (error) {
    logger.error('Error deleting rule:', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '删除分类规则失败',
    }, 500);
  }
});

/**
 * 健康检查
 * @route GET /api/document-classification/health
 * @access 公开
 * @returns {Promise<Response>} 健康状态
 */
app.get('/health', async (c) => {
  return c.json({
    status: 'healthy',
    service: 'Document Classification Service',
    timestamp: new Date().toISOString(),
  });
});

export default app;
