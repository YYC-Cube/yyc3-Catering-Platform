/**
 * @file 文档自动摘要生成API
 * @description 提供文档摘要生成的RESTful API接口，包括单文档摘要、批量摘要、配置管理等功能
 * @module api/document-summary
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { documentSummaryService, SummaryType, SummaryStrategy } from './document-summary-service';
import { logger } from './logger';

const app = new Hono();

// ==================== 请求验证模式 ====================

/**
 * 生成摘要请求验证模式
 */
const generateSummarySchema = z.object({
  documentId: z.string().min(1, '文档ID不能为空'),
  type: z.nativeEnum(SummaryType).optional(),
  strategy: z.nativeEnum(SummaryStrategy).optional(),
  maxLength: z.number().min(50).max(5000).optional(),
  includeKeywords: z.boolean().optional(),
  includeKeyPoints: z.boolean().optional(),
  customPrompt: z.string().max(500).optional(),
});

/**
 * 批量生成摘要请求验证模式
 */
const batchSummarySchema = z.object({
  documentIds: z.array(z.string()).min(1, '文档ID列表不能为空').max(50, '最多处理50个文档'),
  type: z.nativeEnum(SummaryType).optional(),
  strategy: z.nativeEnum(SummaryStrategy).optional(),
  maxLength: z.number().min(50).max(5000).optional(),
  includeKeywords: z.boolean().optional(),
  includeKeyPoints: z.boolean().optional(),
});

/**
 * 获取摘要请求验证模式
 */
const getSummarySchema = z.object({
  documentId: z.string().min(1, '文档ID不能为空'),
});

// ==================== API路由 ====================

/**
 * 生成文档摘要
 * @route POST /api/document-summary/generate
 * @access 公开
 * @returns {Promise<Response>} 摘要结果
 */
app.post('/generate', zValidator('json', generateSummarySchema), async (c) => {
  try {
    const body = c.req.valid('json');

    // 构建配置
    const config: any = {};
    if (body.type) config.type = body.type;
    if (body.strategy) config.strategy = body.strategy;
    if (body.maxLength) config.maxLength = body.maxLength;
    if (body.includeKeywords !== undefined) config.includeKeywords = body.includeKeywords;
    if (body.includeKeyPoints !== undefined) config.includeKeyPoints = body.includeKeyPoints;
    if (body.customPrompt) config.customPrompt = body.customPrompt;

    // 生成摘要
    const result = await documentSummaryService.generateSummary(body.documentId, config);

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error generating summary:', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '生成摘要失败',
    }, 500);
  }
});

/**
 * 批量生成摘要
 * @route POST /api/document-summary/batch
 * @access 公开
 * @returns {Promise<Response>} 摘要结果列表
 */
app.post('/batch', zValidator('json', batchSummarySchema), async (c) => {
  try {
    const body = c.req.valid('json');

    // 构建配置
    const config: any = {};
    if (body.type) config.type = body.type;
    if (body.strategy) config.strategy = body.strategy;
    if (body.maxLength) config.maxLength = body.maxLength;
    if (body.includeKeywords !== undefined) config.includeKeywords = body.includeKeywords;
    if (body.includeKeyPoints !== undefined) config.includeKeyPoints = body.includeKeyPoints;

    // 批量生成摘要
    const results = await documentSummaryService.generateBatchSummary(body.documentIds, config);

    return c.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    logger.error('Error generating batch summary:', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '批量生成摘要失败',
    }, 500);
  }
});

/**
 * 获取摘要配置模板
 * @route GET /api/document-summary/templates/:type
 * @access 公开
 * @returns {Promise<Response>} 配置模板
 */
app.get('/templates/:type', async (c) => {
  try {
    const type = c.req.param('type') as SummaryType;

    // 验证摘要类型
    if (!Object.values(SummaryType).includes(type)) {
      return c.json({
        success: false,
        error: '无效的摘要类型',
      }, 400);
    }

    // 获取配置模板
    const template = documentSummaryService.getConfigTemplate(type);

    return c.json({
      success: true,
      data: template,
    });
  } catch (error) {
    logger.error('Error getting template:', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取配置模板失败',
    }, 500);
  }
});

/**
 * 获取所有摘要类型
 * @route GET /api/document-summary/types
 * @access 公开
 * @returns {Promise<Response>} 摘要类型列表
 */
app.get('/types', async (c) => {
  try {
    const types = Object.values(SummaryType).map((type) => ({
      value: type,
      label: {
        [SummaryType.SHORT]: '简短摘要',
        [SummaryType.MEDIUM]: '中等摘要',
        [SummaryType.DETAILED]: '详细摘要',
        [SummaryType.KEY_POINTS]: '关键点摘要',
        [SummaryType.EXECUTIVE]: '执行摘要',
      }[type],
      description: {
        [SummaryType.SHORT]: '1-2句话的简短摘要，适合快速浏览',
        [SummaryType.MEDIUM]: '3-5句话的中等长度摘要，适合一般阅读',
        [SummaryType.DETAILED]: '6-10句话的详细摘要，适合深入了解',
        [SummaryType.KEY_POINTS]: '要点列表形式的摘要，适合快速获取关键信息',
        [SummaryType.EXECUTIVE]: '包含关键信息、主要发现和行动项的执行摘要',
      }[type],
    }));

    return c.json({
      success: true,
      data: types,
    });
  } catch (error) {
    logger.error('Error getting types:', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取摘要类型失败',
    }, 500);
  }
});

/**
 * 获取所有摘要策略
 * @route GET /api/document-summary/strategies
 * @access 公开
 * @returns {Promise<Response>} 摘要策略列表
 */
app.get('/strategies', async (c) => {
  try {
    const strategies = Object.values(SummaryStrategy).map((strategy) => ({
      value: strategy,
      label: {
        [SummaryStrategy.EXTRACTIVE]: '抽取式摘要',
        [SummaryStrategy.ABSTRACTIVE]: '生成式摘要',
        [SummaryStrategy.HYBRID]: '混合式摘要',
      }[strategy],
      description: {
        [SummaryStrategy.EXTRACTIVE]: '从原文中提取关键句子组成摘要，保持原文准确性',
        [SummaryStrategy.ABSTRACTIVE]: '使用大语言模型生成新的摘要文本，更加流畅自然',
        [SummaryStrategy.HYBRID]: '结合抽取和生成的优势，既准确又流畅',
      }[strategy],
    }));

    return c.json({
      success: true,
      data: strategies,
    });
  } catch (error) {
    logger.error('Error getting strategies:', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取摘要策略失败',
    }, 500);
  }
});

/**
 * 健康检查
 * @route GET /api/document-summary/health
 * @access 公开
 * @returns {Promise<Response>} 健康状态
 */
app.get('/health', async (c) => {
  return c.json({
    status: 'healthy',
    service: 'Document Summary Service',
    timestamp: new Date().toISOString(),
  });
});

export default app;
