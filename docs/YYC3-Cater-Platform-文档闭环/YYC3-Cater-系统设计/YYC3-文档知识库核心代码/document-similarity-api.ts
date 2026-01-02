/**
 * @file 文档相似度分析API路由
 * @description 提供文档相似度计算、批量分析、统计查询等API接口
 * @module api/document-similarity
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { documentSimilarityService, SimilarityMethod } from './document-similarity-service';
import { documentRepository } from './document.repository';
import { logger } from './logger';

const app = new Hono();

/**
 * 计算两个文档的相似度
 * @route POST /api/document-similarity/calculate
 * @access 私有
 * @returns {Promise<Response>} 相似度计算结果
 */
app.post(
  '/calculate',
  zValidator(
    'json',
    z.object({
      documentId1: z.string().min(1, '文档1 ID不能为空'),
      documentId2: z.string().min(1, '文档2 ID不能为空'),
      method: z.nativeEnum(SimilarityMethod).optional().default(SimilarityMethod.COSINE),
    })
  ),
  async (c) => {
    try {
      const { documentId1, documentId2, method } = c.req.valid('json');

      // 验证文档是否存在
      const doc1 = await documentRepository.findById(documentId1);
      const doc2 = await documentRepository.findById(documentId2);

      if (!doc1) {
        return c.json({ success: false, error: `文档 ${documentId1} 不存在` }, 404);
      }

      if (!doc2) {
        return c.json({ success: false, error: `文档 ${documentId2} 不存在` }, 404);
      }

      // 计算相似度
      const result = await documentSimilarityService.calculateSimilarity(
        documentId1,
        documentId2,
        method
      );

      logger.info(`Calculated similarity between ${documentId1} and ${documentId2}`);

      return c.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error calculating similarity:', { error });
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : '计算相似度失败',
        },
        500
      );
    }
  }
);

/**
 * 批量计算相似度
 * @route POST /api/document-similarity/batch
 * @access 私有
 * @returns {Promise<Response>} 批量相似度计算结果
 */
app.post(
  '/batch',
  zValidator(
    'json',
    z.object({
      targetDocumentId: z.string().min(1, '目标文档ID不能为空'),
      documentIds: z.array(z.string()).min(1, '文档ID列表不能为空').max(100, '最多支持100个文档'),
      method: z.nativeEnum(SimilarityMethod).optional().default(SimilarityMethod.COSINE),
    })
  ),
  async (c) => {
    try {
      const { targetDocumentId, documentIds, method } = c.req.valid('json');

      // 验证目标文档是否存在
      const targetDoc = await documentRepository.findById(targetDocumentId);
      if (!targetDoc) {
        return c.json({ success: false, error: `目标文档 ${targetDocumentId} 不存在` }, 404);
      }

      // 批量计算相似度
      const result = await documentSimilarityService.calculateBatchSimilarity(
        targetDocumentId,
        documentIds,
        method
      );

      logger.info(`Batch similarity analysis completed for ${targetDocumentId}`);

      return c.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error calculating batch similarity:', { error });
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : '批量计算相似度失败',
        },
        500
      );
    }
  }
);

/**
 * 查找相似文档
 * @route GET /api/document-similarity/find-similar/:documentId
 * @access 私有
 * @returns {Promise<Response>} 相似文档列表
 */
app.get(
  '/find-similar/:documentId',
  zValidator(
    'query',
    z.object({
      threshold: z.string().optional().default('0.5').transform((val) => parseFloat(val)),
      limit: z.string().optional().default('10').transform((val) => parseInt(val)),
      method: z.nativeEnum(SimilarityMethod).optional().default(SimilarityMethod.COSINE),
    })
  ),
  async (c) => {
    try {
      const documentId = c.req.param('documentId');
      const { threshold, limit, method } = c.req.valid('query');

      // 验证文档是否存在
      const doc = await documentRepository.findById(documentId);
      if (!doc) {
        return c.json({ success: false, error: `文档 ${documentId} 不存在` }, 404);
      }

      // 查找相似文档
      const similarDocuments = await documentSimilarityService.findSimilarDocuments(
        documentId,
        threshold,
        limit,
        method
      );

      logger.info(`Found ${similarDocuments.length} similar documents for ${documentId}`);

      return c.json({
        success: true,
        data: similarDocuments,
      });
    } catch (error) {
      logger.error('Error finding similar documents:', { error });
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : '查找相似文档失败',
        },
        500
      );
    }
  }
);

/**
 * 获取相似度统计
 * @route POST /api/document-similarity/stats
 * @access 私有
 * @returns {Promise<Response>} 相似度统计信息
 */
app.post(
  '/stats',
  zValidator(
    'json',
    z.object({
      documentIds: z.array(z.string()).min(2, '至少需要2个文档').max(50, '最多支持50个文档'),
      method: z.nativeEnum(SimilarityMethod).optional().default(SimilarityMethod.COSINE),
    })
  ),
  async (c) => {
    try {
      const { documentIds, method } = c.req.valid('json');

      // 验证所有文档是否存在
      for (const documentId of documentIds) {
        const doc = await documentRepository.findById(documentId);
        if (!doc) {
          return c.json({ success: false, error: `文档 ${documentId} 不存在` }, 404);
        }
      }

      // 获取相似度统计
      const stats = await documentSimilarityService.getSimilarityStats(documentIds, method);

      logger.info(`Generated similarity statistics for ${documentIds.length} documents`);

      return c.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Error generating similarity statistics:', { error });
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : '生成相似度统计失败',
        },
        500
      );
    }
  }
);

/**
 * 获取支持的相似度计算方法
 * @route GET /api/document-similarity/methods
 * @access 公开
 * @returns {Promise<Response>} 支持的计算方法列表
 */
app.get('/methods', (c) => {
  const methods = Object.values(SimilarityMethod).map((method) => ({
    value: method,
    label: method.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
    description: getMethodDescription(method),
  }));

  return c.json({
    success: true,
    data: methods,
  });
});

/**
 * 获取相似度阈值配置
 * @route GET /api/document-similarity/thresholds
 * @access 公开
 * @returns {Promise<Response>} 相似度阈值配置
 */
app.get('/thresholds', (c) => {
  const thresholds = {
    very_high: { min: 0.8, max: 1.0, label: '极高相似度', color: '#ef4444' },
    high: { min: 0.6, max: 0.8, label: '高相似度', color: '#f97316' },
    medium: { min: 0.4, max: 0.6, label: '中等相似度', color: '#eab308' },
    low: { min: 0.2, max: 0.4, label: '低相似度', color: '#22c55e' },
    very_low: { min: 0.0, max: 0.2, label: '极低相似度', color: '#3b82f6' },
  };

  return c.json({
    success: true,
    data: thresholds,
  });
});

/**
 * 获取方法描述
 * @param method 相似度计算方法
 * @returns 方法描述
 */
function getMethodDescription(method: SimilarityMethod): string {
  const descriptions: Record<SimilarityMethod, string> = {
    [SimilarityMethod.COSINE]: '基于词向量的余弦相似度，适用于文本语义相似度计算',
    [SimilarityMethod.JACCARD]: '基于集合的Jaccard相似度，适用于关键词重叠度计算',
    [SimilarityMethod.EDIT_DISTANCE]: '基于编辑距离的相似度，适用于文本结构相似度计算',
    [SimilarityMethod.EUCLIDEAN]: '基于欧氏距离的相似度，适用于词频向量相似度计算',
    [SimilarityMethod.TF_IDF]: '基于TF-IDF的相似度，考虑词频和逆文档频率',
    [SimilarityMethod.WORD_EMBEDDING]: '基于词嵌入的相似度，使用深度学习模型计算语义相似度',
  };

  return descriptions[method] || '未知方法';
}

export default app;
