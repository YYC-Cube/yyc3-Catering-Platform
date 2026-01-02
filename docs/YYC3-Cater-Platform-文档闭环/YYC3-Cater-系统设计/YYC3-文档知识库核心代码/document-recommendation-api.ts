/**
 * @file 文档智能推荐API路由
 * @description 提供文档推荐、用户行为记录、偏好查询等API接口
 * @module api/document-recommendation
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import {
  documentRecommendationService,
  RecommendationStrategy,
  UserActionType,
  RecommendationRequest,
  UserAction,
} from './document-recommendation-service';
import { documentRepository } from './document.repository';
import { logger } from './logger';

const app = new Hono();

/**
 * 获取推荐文档
 * @route POST /api/document-recommendation/recommendations
 * @access 私有
 * @returns {Promise<Response>} 推荐文档列表
 */
app.post(
  '/recommendations',
  zValidator(
    'json',
    z.object({
      userId: z.string().optional(),
      documentId: z.string().optional(),
      strategy: z.nativeEnum(RecommendationStrategy).optional(),
      limit: z.number().min(1).max(50).optional().default(10),
      filters: z
        .object({
          category: z.string().optional(),
          tags: z.array(z.string()).optional(),
          dateRange: z
            .object({
              start: z.string().datetime(),
              end: z.string().datetime(),
            })
            .optional(),
        })
        .optional(),
    })
  ),
  async (c) => {
    try {
      const body = c.req.valid('json');

      // 转换请求
      const request: RecommendationRequest = {
        userId: body.userId,
        documentId: body.documentId,
        strategy: body.strategy,
        limit: body.limit,
        filters: body.filters
          ? {
              ...body.filters,
              dateRange: body.filters.dateRange
                ? {
                    start: new Date(body.filters.dateRange.start),
                    end: new Date(body.filters.dateRange.end),
                  }
                : undefined,
            }
          : undefined,
      };

      // 获取推荐
      const recommendations = await documentRecommendationService.getRecommendations(request);

      logger.info(`Generated ${recommendations.length} recommendations`);

      return c.json({
        success: true,
        data: recommendations,
      });
    } catch (error) {
      logger.error('Error generating recommendations:', { error });
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : '生成推荐失败',
        },
        500
      );
    }
  }
);

/**
 * 记录用户行为
 * @route POST /api/document-recommendation/actions
 * @access 私有
 * @returns {Promise<Response>} 操作结果
 */
app.post(
  '/actions',
  zValidator(
    'json',
    z.object({
      userId: z.string().min(1, '用户ID不能为空'),
      documentId: z.string().min(1, '文档ID不能为空'),
      actionType: z.nativeEnum(UserActionType),
      rating: z.number().min(1).max(5).optional(),
    })
  ),
  async (c) => {
    try {
      const { userId, documentId, actionType, rating } = c.req.valid('json');

      // 验证文档是否存在
      const doc = await documentRepository.findById(documentId);
      if (!doc) {
        return c.json({ success: false, error: `文档 ${documentId} 不存在` }, 404);
      }

      // 创建用户行为
      const action: UserAction = {
        userId,
        documentId,
        actionType,
        timestamp: new Date(),
        rating,
      };

      // 记录行为
      await documentRecommendationService.recordUserAction(action);

      logger.info(`Recorded user action: ${userId} - ${actionType} - ${documentId}`);

      return c.json({
        success: true,
        message: '用户行为记录成功',
      });
    } catch (error) {
      logger.error('Error recording user action:', { error });
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : '记录用户行为失败',
        },
        500
      );
    }
  }
);

/**
 * 获取用户偏好
 * @route GET /api/document-recommendation/preferences/:userId
 * @access 私有
 * @returns {Promise<Response>} 用户偏好信息
 */
app.get('/preferences/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    // 获取用户偏好
    const preference = await documentRecommendationService.getUserPreference(userId);

    logger.info(`Retrieved preferences for user ${userId}`);

    return c.json({
      success: true,
      data: preference,
    });
  } catch (error) {
      logger.error('Error retrieving user preferences:', { error });
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : '获取用户偏好失败',
        },
        500
      );
    }
});

/**
 * 获取推荐统计
 * @route GET /api/document-recommendation/stats/:userId
 * @access 私有
 * @returns {Promise<Response>} 推荐统计信息
 */
app.get('/stats/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    // 获取推荐统计
    const stats = await documentRecommendationService.getRecommendationStats(userId);

    logger.info(`Retrieved recommendation stats for user ${userId}`);

    return c.json({
      success: true,
      data: stats,
    });
  } catch (error) {
      logger.error('Error retrieving recommendation stats:', { error });
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : '获取推荐统计失败',
        },
        500
      );
    }
});

/**
 * 获取支持的推荐策略
 * @route GET /api/document-recommendation/strategies
 * @access 公开
 * @returns {Promise<Response>} 推荐策略列表
 */
app.get('/strategies', (c) => {
  const strategies = Object.values(RecommendationStrategy).map((strategy) => ({
    value: strategy,
    label: strategy.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
    description: getStrategyDescription(strategy),
  }));

  return c.json({
    success: true,
    data: strategies,
  });
});

/**
 * 获取支持的用户行为类型
 * @route GET /api/document-recommendation/action-types
 * @access 公开
 * @returns {Promise<Response>} 用户行为类型列表
 */
app.get('/action-types', (c) => {
  const actionTypes = Object.values(UserActionType).map((type) => ({
    value: type,
    label: type.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
    description: getActionTypeDescription(type),
  }));

  return c.json({
    success: true,
    data: actionTypes,
  });
});

/**
 * 批量记录用户行为
 * @route POST /api/document-recommendation/actions/batch
 * @access 私有
 * @returns {Promise<Response>} 操作结果
 */
app.post(
  '/actions/batch',
  zValidator(
    'json',
    z.object({
      actions: z.array(
        z.object({
          userId: z.string().min(1, '用户ID不能为空'),
          documentId: z.string().min(1, '文档ID不能为空'),
          actionType: z.nativeEnum(UserActionType),
          rating: z.number().min(1).max(5).optional(),
          timestamp: z.string().datetime().optional(),
        })
      ),
    })
  ),
  async (c) => {
    try {
      const { actions } = c.req.valid('json');

      if (actions.length > 100) {
        return c.json({ success: false, error: '最多支持批量记录100个行为' }, 400);
      }

      // 验证所有文档是否存在
      const documentIds = [...new Set(actions.map((a) => a.documentId))];
      for (const documentId of documentIds) {
        const doc = await documentRepository.findById(documentId);
        if (!doc) {
          return c.json({ success: false, error: `文档 ${documentId} 不存在` }, 404);
        }
      }

      // 批量记录行为
      for (const actionData of actions) {
        const action: UserAction = {
          userId: actionData.userId,
          documentId: actionData.documentId,
          actionType: actionData.actionType,
          timestamp: actionData.timestamp ? new Date(actionData.timestamp) : new Date(),
          rating: actionData.rating,
        };

        await documentRecommendationService.recordUserAction(action);
      }

      logger.info(`Batch recorded ${actions.length} user actions`);

      return c.json({
        success: true,
        message: `成功记录${actions.length}个用户行为`,
      });
    } catch (error) {
      logger.error('Error batch recording user actions:', { error });
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : '批量记录用户行为失败',
        },
        500
      );
    }
  }
);

/**
 * 获取策略描述
 * @param strategy 推荐策略
 * @returns 策略描述
 */
function getStrategyDescription(strategy: RecommendationStrategy): string {
  const descriptions: Record<RecommendationStrategy, string> = {
    [RecommendationStrategy.CONTENT_BASED]: '基于文档内容和用户偏好的推荐',
    [RecommendationStrategy.COLLABORATIVE_FILTERING]: '基于相似用户行为的协同过滤推荐',
    [RecommendationStrategy.HYBRID]: '结合内容和协同过滤的混合推荐策略',
    [RecommendationStrategy.POPULAR]: '基于用户行为统计的热门文档推荐',
    [RecommendationStrategy.LATEST]: '基于上传时间的最新文档推荐',
    [RecommendationStrategy.SIMILAR]: '基于文档相似度的相关文档推荐',
  };

  return descriptions[strategy] || '未知策略';
}

/**
 * 获取行为类型描述
 * @param actionType 用户行为类型
 * @returns 行为类型描述
 */
function getActionTypeDescription(actionType: UserActionType): string {
  const descriptions: Record<UserActionType, string> = {
    [UserActionType.VIEW]: '查看文档',
    [UserActionType.DOWNLOAD]: '下载文档',
    [UserActionType.FAVORITE]: '收藏文档',
    [UserActionType.SHARE]: '分享文档',
    [UserActionType.COMMENT]: '评论文档',
    [UserActionType.LIKE]: '点赞文档',
  };

  return descriptions[actionType] || '未知行为';
}

export default app;
