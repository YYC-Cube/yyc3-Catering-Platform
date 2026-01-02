/**
 * @file 文档质量持续改进API路由
 * @description 提供文档质量评估、改进建议、质量报告等API接口
 * @module api/document-quality-improvement
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { documentQualityImprovementService } from './document-quality-improvement-service';
import { logger } from './logger';

const app = new Hono();

// ==================== 请求验证模式 ====================

/**
 * 评估文档质量请求模式
 */
const assessQualitySchema = z.object({
  documentId: z.string().min(1, '文档ID不能为空'),
  assessor: z.string().optional(),
});

/**
 * 批量评估请求模式
 */
const batchAssessSchema = z.object({
  documentIds: z.array(z.string().min(1)).min(1, '至少需要一个文档ID'),
  assessor: z.string().optional(),
});

/**
 * 更新建议状态请求模式
 */
const updateSuggestionStatusSchema = z.object({
  suggestionId: z.string().min(1, '建议ID不能为空'),
  status: z.enum(['pending', 'in_progress', 'completed', 'dismissed']),
});

/**
 * 质量趋势请求模式
 */
const qualityTrendSchema = z.object({
  startDate: z.string().datetime('开始日期格式不正确'),
  endDate: z.string().datetime('结束日期格式不正确'),
});

/**
 * 生成质量报告请求模式
 */
const generateReportSchema = z.object({
  type: z.enum(['daily', 'weekly', 'monthly']),
  startDate: z.string().datetime('开始日期格式不正确'),
  endDate: z.string().datetime('结束日期格式不正确'),
});

// ==================== API路由 ====================

/**
 * 评估单个文档质量
 * @route POST /api/document-quality/assess
 * @access 私有
 * @returns {Promise<Response>} 质量评估结果
 */
app.post('/assess', zValidator('json', assessQualitySchema), async (c) => {
  try {
    const { documentId, assessor } = c.req.valid('json');

    const assessment = await documentQualityImprovementService.assessDocumentQuality(
      documentId,
      assessor
    );

    return c.json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    logger.error('Error assessing document quality:', { error });
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '评估文档质量失败',
      },
      400
    );
  }
});

/**
 * 批量评估文档质量
 * @route POST /api/document-quality/assess/batch
 * @access 私有
 * @returns {Promise<Response>} 质量评估结果列表
 */
app.post('/assess/batch', zValidator('json', batchAssessSchema), async (c) => {
  try {
    const { documentIds, assessor } = c.req.valid('json');

    const assessments =
      await documentQualityImprovementService.assessBatchDocumentQuality(documentIds, assessor);

    return c.json({
      success: true,
      data: assessments,
      count: assessments.length,
    });
  } catch (error) {
    logger.error('Error batch assessing document quality:', { error });
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '批量评估文档质量失败',
      },
      400
    );
  }
});

/**
 * 获取文档改进建议
 * @route GET /api/document-quality/suggestions/:documentId
 * @access 私有
 * @returns {Promise<Response>} 改进建议列表
 */
app.get('/suggestions/:documentId', async (c) => {
  try {
    const documentId = c.req.param('documentId');

    const suggestions =
      await documentQualityImprovementService.getImprovementSuggestions(documentId);

    return c.json({
      success: true,
      data: suggestions,
      count: suggestions.length,
    });
  } catch (error) {
    logger.error('Error getting improvement suggestions:', { error });
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取改进建议失败',
      },
      400
    );
  }
});

/**
 * 更新改进建议状态
 * @route PUT /api/document-quality/suggestions/status
 * @access 私有
 * @returns {Promise<Response>} 更新后的建议
 */
app.put('/suggestions/status', zValidator('json', updateSuggestionStatusSchema), async (c) => {
  try {
    const { suggestionId, status } = c.req.valid('json');

    const suggestion =
      await documentQualityImprovementService.updateSuggestionStatus(suggestionId, status);

    if (!suggestion) {
      return c.json(
        {
          success: false,
          error: '未找到指定的改进建议',
        },
        404
      );
    }

    return c.json({
      success: true,
      data: suggestion,
    });
  } catch (error) {
    logger.error('Error updating suggestion status:', { error });
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '更新建议状态失败',
      },
      400
    );
  }
});

/**
 * 获取质量趋势
 * @route GET /api/document-quality/trends
 * @access 私有
 * @returns {Promise<Response>} 质量趋势数据
 */
app.get('/trends', zValidator('query', qualityTrendSchema), async (c) => {
  try {
    const { startDate, endDate } = c.req.valid('query');

    const trends = await documentQualityImprovementService.getQualityTrends(
      new Date(startDate),
      new Date(endDate)
    );

    return c.json({
      success: true,
      data: trends,
      count: trends.length,
    });
  } catch (error) {
    logger.error('Error getting quality trends:', { error });
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取质量趋势失败',
      },
      400
    );
  }
});

/**
 * 生成质量报告
 * @route POST /api/document-quality/reports
 * @access 私有
 * @returns {Promise<Response>} 质量报告
 */
app.post('/reports', zValidator('json', generateReportSchema), async (c) => {
  try {
    const { type, startDate, endDate } = c.req.valid('json');

    const report = await documentQualityImprovementService.generateQualityReport(type, {
      start: new Date(startDate),
      end: new Date(endDate),
    });

    return c.json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error('Error generating quality report:', { error });
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '生成质量报告失败',
      },
      400
    );
  }
});

/**
 * 获取质量统计
 * @route GET /api/document-quality/stats
 * @access 私有
 * @returns {Promise<Response>} 质量统计信息
 */
app.get('/stats', async (c) => {
  try {
    const stats = await documentQualityImprovementService.getQualityStats();

    return c.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error getting quality stats:', { error });
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取质量统计失败',
      },
      400
    );
  }
});

/**
 * 获取支持的评估维度
 * @route GET /api/document-quality/dimensions
 * @access 公开
 * @returns {Promise<Response>} 评估维度列表
 */
app.get('/dimensions', (c) => {
  const dimensions = [
    {
      name: 'content_completeness',
      label: '内容完整性',
      description: '评估文档内容的完整性和充分性',
      weight: 0.2,
    },
    {
      name: 'structure_clarity',
      label: '结构清晰度',
      description: '评估文档结构的清晰度和组织性',
      weight: 0.15,
    },
    {
      name: 'language_accuracy',
      label: '语言准确性',
      description: '评估文档语言的准确性和规范性',
      weight: 0.15,
    },
    {
      name: 'format_consistency',
      label: '格式规范性',
      description: '评估文档格式的规范性和一致性',
      weight: 0.1,
    },
    {
      name: 'readability',
      label: '可读性',
      description: '评估文档的可读性和易理解性',
      weight: 0.1,
    },
    {
      name: 'maintainability',
      label: '可维护性',
      description: '评估文档的可维护性和可更新性',
      weight: 0.1,
    },
    {
      name: 'timeliness',
      label: '时效性',
      description: '评估文档内容的时效性和更新频率',
      weight: 0.1,
    },
    {
      name: 'relevance',
      label: '相关性',
      description: '评估文档内容与分类的相关性',
      weight: 0.1,
    },
  ];

  return c.json({
    success: true,
    data: dimensions,
  });
});

/**
 * 获取质量等级说明
 * @route GET /api/document-quality/grades
 * @access 公开
 * @returns {Promise<Response>} 质量等级列表
 */
app.get('/grades', (c) => {
  const grades = [
    {
      name: 'excellent',
      label: '优秀',
      scoreRange: '90-100',
      description: '文档质量优秀，各方面表现突出',
      color: '#10b981',
    },
    {
      name: 'good',
      label: '良好',
      scoreRange: '75-89',
      description: '文档质量良好，大部分指标达标',
      color: '#3b82f6',
    },
    {
      name: 'fair',
      label: '一般',
      scoreRange: '60-74',
      description: '文档质量一般，部分指标需要改进',
      color: '#f59e0b',
    },
    {
      name: 'needs_improvement',
      label: '需要改进',
      scoreRange: '40-59',
      description: '文档质量较差，需要重点改进',
      color: '#ef4444',
    },
    {
      name: 'poor',
      label: '不合格',
      scoreRange: '0-39',
      description: '文档质量不合格，需要全面改进',
      color: '#7f1d1d',
    },
  ];

  return c.json({
    success: true,
    data: grades,
  });
});

export default app;
