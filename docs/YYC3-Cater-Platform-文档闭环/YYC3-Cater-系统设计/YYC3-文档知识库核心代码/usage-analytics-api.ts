/**
 * @file 使用分析API路由
 * @description 提供文档使用分析相关的API接口
 * @module api/usage-analytics-api
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { UsageAnalyticsService, DocumentAccessEvent } from './usage-analytics-service';
import { Logger } from './logger';

const app = new Hono();
const usageAnalyticsService = new UsageAnalyticsService();
const logger = new Logger('UsageAnalyticsAPI');

// 访问事件验证模式
const accessEventSchema = z.object({
  documentId: z.string(),
  userId: z.string().optional(),
  action: z.enum(['view', 'edit', 'download', 'share', 'comment', 'search_hit']),
  metadata: z
    .object({
      duration: z.number().optional(),
      searchQuery: z.string().optional(),
      referrer: z.string().optional(),
      device: z.string().optional(),
      location: z.string().optional(),
    })
    .optional(),
});

/**
 * 记录访问事件
 * @route POST /api/analytics/events
 * @access 公开
 * @returns {Promise<Response>} 操作结果
 */
app.post('/events', zValidator('json', accessEventSchema), async (c) => {
  try {
    const event = c.req.valid('json');
    logger.info('Record access event requested', { event });

    await usageAnalyticsService.recordAccessEvent(event);

    return c.json({
      success: true,
      message: '访问事件已记录',
    });
  } catch (error) {
    logger.error('Record access event failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '记录访问事件失败',
    }, 500);
  }
});

/**
 * 批量记录访问事件
 * @route POST /api/analytics/events/batch
 * @access 公开
 * @returns {Promise<Response>} 操作结果
 */
app.post('/events/batch', async (c) => {
  try {
    const body = await c.req.json();
    const { events } = body;

    if (!Array.isArray(events) || events.length === 0) {
      return c.json({
        success: false,
        error: '事件列表不能为空',
      }, 400);
    }

    logger.info('Batch record access events requested', { count: events.length });

    // 验证每个事件
    const validEvents = events.map((event: any) => {
      const result = accessEventSchema.safeParse(event);
      if (!result.success) {
        throw new Error(`Invalid event: ${result.error.message}`);
      }
      return result.data;
    });

    // 批量记录
    for (const event of validEvents) {
      await usageAnalyticsService.recordAccessEvent(event);
    }

    return c.json({
      success: true,
      message: `已记录 ${events.length} 个访问事件`,
    });
  } catch (error) {
    logger.error('Batch record access events failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '批量记录访问事件失败',
    }, 500);
  }
});

/**
 * 获取文档使用统计
 * @route GET /api/analytics/documents/:documentId/stats
 * @access 需要管理员权限
 * @returns {Promise<Response>} 文档使用统计
 */
app.get('/documents/:documentId/stats', async (c) => {
  try {
    const documentId = c.req.param('documentId');
    logger.info('Get document usage stats requested', { documentId });

    const stats = await usageAnalyticsService.getDocumentUsageStats(documentId);

    if (!stats) {
      return c.json({
        success: false,
        error: '文档不存在或暂无统计数据',
      }, 404);
    }

    return c.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Get document usage stats failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取文档使用统计失败',
    }, 500);
  }
});

/**
 * 获取文档访问历史
 * @route GET /api/analytics/documents/:documentId/history
 * @access 需要管理员权限
 * @returns {Promise<Response>} 访问历史
 */
app.get('/documents/:documentId/history', async (c) => {
  try {
    const documentId = c.req.param('documentId');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');

    logger.info('Get document access history requested', { documentId, limit, offset });

    const history = await usageAnalyticsService.getDocumentAccessHistory(documentId, limit, offset);

    return c.json({
      success: true,
      data: {
        documentId,
        history,
        total: history.length,
      },
    });
  } catch (error) {
    logger.error('Get document access history failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取文档访问历史失败',
    }, 500);
  }
});

/**
 * 获取用户使用统计
 * @route GET /api/analytics/users/:userId/stats
 * @access 需要管理员权限
 * @returns {Promise<Response>} 用户使用统计
 */
app.get('/users/:userId/stats', async (c) => {
  try {
    const userId = c.req.param('userId');
    logger.info('Get user usage stats requested', { userId });

    const stats = await usageAnalyticsService.getUserUsageStats(userId);

    if (!stats) {
      return c.json({
        success: false,
        error: '用户不存在或暂无统计数据',
      }, 404);
    }

    return c.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Get user usage stats failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取用户使用统计失败',
    }, 500);
  }
});

/**
 * 获取用户访问历史
 * @route GET /api/analytics/users/:userId/history
 * @access 需要管理员权限
 * @returns {Promise<Response>} 访问历史
 */
app.get('/users/:userId/history', async (c) => {
  try {
    const userId = c.req.param('userId');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');

    logger.info('Get user access history requested', { userId, limit, offset });

    const history = await usageAnalyticsService.getUserAccessHistory(userId, limit, offset);

    return c.json({
      success: true,
      data: {
        userId,
        history,
        total: history.length,
      },
    });
  } catch (error) {
    logger.error('Get user access history failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取用户访问历史失败',
    }, 500);
  }
});

/**
 * 获取系统使用统计
 * @route GET /api/analytics/system/stats
 * @access 需要管理员权限
 * @returns {Promise<Response>} 系统使用统计
 */
app.get('/system/stats', async (c) => {
  try {
    logger.info('Get system usage stats requested');

    const stats = await usageAnalyticsService.getSystemUsageStats();

    return c.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Get system usage stats failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取系统使用统计失败',
    }, 500);
  }
});

/**
 * 获取使用趋势
 * @route GET /api/analytics/system/trends
 * @access 需要管理员权限
 * @returns {Promise<Response>} 使用趋势
 */
app.get('/system/trends', async (c) => {
  try {
    const days = parseInt(c.req.query('days') || '30');

    logger.info('Get usage trends requested', { days });

    const trends = await usageAnalyticsService.getUsageTrends(days);

    return c.json({
      success: true,
      data: {
        trends,
        period: `${days} days`,
      },
    });
  } catch (error) {
    logger.error('Get usage trends failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取使用趋势失败',
    }, 500);
  }
});

/**
 * 导出使用报告
 * @route GET /api/analytics/export
 * @access 需要管理员权限
 * @returns {Promise<Response>} 导出文件
 */
app.get('/export', async (c) => {
  try {
    const format = c.req.query('format') || 'json';
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');

    logger.info('Export usage report requested', { format, startDate, endDate });

    const report = await usageAnalyticsService.exportUsageReport({
      format: format as 'json' | 'csv',
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    if (format === 'json') {
      return c.json({
        success: true,
        data: JSON.parse(report),
      });
    } else {
      return c.text(report, 200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="usage-report-${Date.now()}.csv"`,
      });
    }
  } catch (error) {
    logger.error('Export usage report failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '导出使用报告失败',
    }, 500);
  }
});

/**
 * 清理旧数据
 * @route POST /api/analytics/cleanup
 * @access 需要管理员权限
 * @returns {Promise<Response>} 操作结果
 */
app.post('/cleanup', async (c) => {
  try {
    const body = await c.req.json();
    const { retentionDays = 90 } = body;

    logger.info('Cleanup old data requested', { retentionDays });

    await usageAnalyticsService.cleanupOldData(retentionDays);

    return c.json({
      success: true,
      message: `已清理 ${retentionDays} 天前的旧数据`,
    });
  } catch (error) {
    logger.error('Cleanup old data failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '清理旧数据失败',
    }, 500);
  }
});

/**
 * 获取仪表板数据
 * @route GET /api/analytics/dashboard
 * @access 需要管理员权限
 * @returns {Promise<Response>} 仪表板数据
 */
app.get('/dashboard', async (c) => {
  try {
    logger.info('Get dashboard data requested');

    const [stats, trends] = await Promise.all([
      usageAnalyticsService.getSystemUsageStats(),
      usageAnalyticsService.getUsageTrends(7),
    ]);

    return c.json({
      success: true,
      data: {
        overview: {
          totalDocuments: stats.totalDocuments,
          totalUsers: stats.totalUsers,
          totalViews: stats.totalViews,
          totalEdits: stats.totalEdits,
        },
        recentActivity: trends.slice(-7),
        topDocuments: stats.mostViewedDocuments.slice(0, 5),
        topUsers: stats.mostActiveUsers.slice(0, 5),
        topSearches: stats.popularSearchQueries.slice(0, 5),
      },
    });
  } catch (error) {
    logger.error('Get dashboard data failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取仪表板数据失败',
    }, 500);
  }
});

export default app;
