/**
 * @file 协作编辑API路由
 * @description 提供文档协作编辑相关的API接口
 * @module api/collaboration-api
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { CollaborationService, CollaborationSession, DocumentEditOperation } from './collaboration-service';
import { Logger } from './logger';

const app = new Hono();
const collaborationService = new CollaborationService();
const logger = new Logger('CollaborationAPI');

// 加入会话验证模式
const joinSessionSchema = z.object({
  userId: z.string(),
  userName: z.string().min(1),
});

// 光标更新验证模式
const cursorSchema = z.object({
  position: z.number().min(0),
  selectionStart: z.number().min(0),
  selectionEnd: z.number().min(0),
});

// 编辑操作验证模式
const editOperationSchema = z.object({
  documentId: z.string(),
  userId: z.string(),
  type: z.enum(['insert', 'delete', 'replace', 'format']),
  position: z.number().min(0),
  length: z.number().min(0).optional(),
  content: z.string().optional(),
  format: z
    .object({
      bold: z.boolean().optional(),
      italic: z.boolean().optional(),
      underline: z.boolean().optional(),
      color: z.string().optional(),
    })
    .optional(),
});

// 添加评论验证模式
const addCommentSchema = z.object({
  userId: z.string(),
  userName: z.string().min(1),
  position: z.number().min(0),
  content: z.string().min(1),
});

// 回复评论验证模式
const replyCommentSchema = z.object({
  userId: z.string(),
  userName: z.string().min(1),
  content: z.string().min(1),
});

/**
 * 加入协作会话
 * @route POST /api/collaboration/sessions/:documentId/join
 * @access 需要用户认证
 * @returns {Promise<Response>} 会话信息
 */
app.post('/sessions/:documentId/join', zValidator('json', joinSessionSchema), async (c) => {
  try {
    const documentId = c.req.param('documentId');
    const { userId, userName } = c.req.valid('json');

    logger.info('Join collaboration session requested', { documentId, userId, userName });

    const session = await collaborationService.joinSession(documentId, userId, userName);

    return c.json({
      success: true,
      data: session,
    });
  } catch (error) {
    logger.error('Join collaboration session failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '加入协作会话失败',
    }, 500);
  }
});

/**
 * 离开协作会话
 * @route POST /api/collaboration/sessions/:documentId/leave
 * @access 需要用户认证
 * @returns {Promise<Response>} 操作结果
 */
app.post('/sessions/:documentId/leave', async (c) => {
  try {
    const documentId = c.req.param('documentId');
    const body = await c.req.json();
    const { userId } = body;

    if (!userId) {
      return c.json({
        success: false,
        error: '必须提供用户ID',
      }, 400);
    }

    logger.info('Leave collaboration session requested', { documentId, userId });

    await collaborationService.leaveSession(documentId, userId);

    return c.json({
      success: true,
      message: '已离开协作会话',
    });
  } catch (error) {
    logger.error('Leave collaboration session failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '离开协作会话失败',
    }, 500);
  }
});

/**
 * 获取活跃会话
 * @route GET /api/collaboration/sessions/:documentId/active
 * @access 需要用户认证
 * @returns {Promise<Response>} 活跃会话列表
 */
app.get('/sessions/:documentId/active', async (c) => {
  try {
    const documentId = c.req.param('documentId');

    logger.info('Get active sessions requested', { documentId });

    const sessions = await collaborationService.getActiveSessions(documentId);

    return c.json({
      success: true,
      data: {
        documentId,
        sessions,
        total: sessions.length,
      },
    });
  } catch (error) {
    logger.error('Get active sessions failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取活跃会话失败',
    }, 500);
  }
});

/**
 * 更新光标位置
 * @route PUT /api/collaboration/sessions/:documentId/cursor
 * @access 需要用户认证
 * @returns {Promise<Response>} 操作结果
 */
app.put('/sessions/:documentId/cursor', zValidator('json', cursorSchema), async (c) => {
  try {
    const documentId = c.req.param('documentId');
    const cursor = c.req.valid('json');
    const body = await c.req.json();
    const { userId } = body;

    if (!userId) {
      return c.json({
        success: false,
        error: '必须提供用户ID',
      }, 400);
    }

    logger.info('Update cursor requested', { documentId, userId, cursor });

    await collaborationService.updateCursor(documentId, userId, cursor);

    return c.json({
      success: true,
      message: '光标位置已更新',
    });
  } catch (error) {
    logger.error('Update cursor failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '更新光标位置失败',
    }, 500);
  }
});

/**
 * 应用编辑操作
 * @route POST /api/collaboration/operations
 * @access 需要用户认证
 * @returns {Promise<Response>} 操作结果
 */
app.post('/operations', zValidator('json', editOperationSchema), async (c) => {
  try {
    const operation = c.req.valid('json');

    logger.info('Apply edit operation requested', {
      documentId: operation.documentId,
      userId: operation.userId,
      type: operation.type,
    });

    const result = await collaborationService.applyEditOperation(operation);

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Apply edit operation failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '应用编辑操作失败',
    }, 500);
  }
});

/**
 * 获取编辑历史
 * @route GET /api/collaboration/documents/:documentId/operations
 * @access 需要用户认证
 * @returns {Promise<Response>} 编辑历史
 */
app.get('/documents/:documentId/operations', async (c) => {
  try {
    const documentId = c.req.param('documentId');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');

    logger.info('Get edit history requested', { documentId, limit, offset });

    const operations = await collaborationService.getEditHistory(documentId, limit, offset);

    return c.json({
      success: true,
      data: {
        documentId,
        operations,
        total: operations.length,
      },
    });
  } catch (error) {
    logger.error('Get edit history failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取编辑历史失败',
    }, 500);
  }
});

/**
 * 添加评论
 * @route POST /api/collaboration/documents/:documentId/comments
 * @access 需要用户认证
 * @returns {Promise<Response>} 评论信息
 */
app.post('/documents/:documentId/comments', zValidator('json', addCommentSchema), async (c) => {
  try {
    const documentId = c.req.param('documentId');
    const { userId, userName, position, content } = c.req.valid('json');

    logger.info('Add comment requested', { documentId, userId, position });

    const comment = await collaborationService.addComment(documentId, userId, userName, position, content);

    return c.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    logger.error('Add comment failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '添加评论失败',
    }, 500);
  }
});

/**
 * 回复评论
 * @route POST /api/collaboration/documents/:documentId/comments/:commentId/replies
 * @access 需要用户认证
 * @returns {Promise<Response>} 回复信息
 */
app.post('/documents/:documentId/comments/:commentId/replies', zValidator('json', replyCommentSchema), async (c) => {
  try {
    const documentId = c.req.param('documentId');
    const commentId = c.req.param('commentId');
    const { userId, userName, content } = c.req.valid('json');

    logger.info('Reply comment requested', { documentId, commentId, userId });

    const reply = await collaborationService.replyComment(documentId, commentId, userId, userName, content);

    return c.json({
      success: true,
      data: reply,
    });
  } catch (error) {
    logger.error('Reply comment failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '回复评论失败',
    }, 500);
  }
});

/**
 * 解决评论
 * @route PUT /api/collaboration/documents/:documentId/comments/:commentId/resolve
 * @access 需要用户认证
 * @returns {Promise<Response>} 操作结果
 */
app.put('/documents/:documentId/comments/:commentId/resolve', async (c) => {
  try {
    const documentId = c.req.param('documentId');
    const commentId = c.req.param('commentId');
    const body = await c.req.json();
    const { resolved } = body;

    if (typeof resolved !== 'boolean') {
      return c.json({
        success: false,
        error: '必须提供resolved参数',
      }, 400);
    }

    logger.info('Resolve comment requested', { documentId, commentId, resolved });

    await collaborationService.resolveComment(documentId, commentId, resolved);

    return c.json({
      success: true,
      message: resolved ? '评论已解决' : '评论已重新打开',
    });
  } catch (error) {
    logger.error('Resolve comment failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '解决评论失败',
    }, 500);
  }
});

/**
 * 获取文档评论
 * @route GET /api/collaboration/documents/:documentId/comments
 * @access 需要用户认证
 * @returns {Promise<Response>} 评论列表
 */
app.get('/documents/:documentId/comments', async (c) => {
  try {
    const documentId = c.req.param('documentId');
    const includeResolved = c.req.query('includeResolved') === 'true';

    logger.info('Get comments requested', { documentId, includeResolved });

    const comments = await collaborationService.getComments(documentId, includeResolved);

    return c.json({
      success: true,
      data: {
        documentId,
        comments,
        total: comments.length,
      },
    });
  } catch (error) {
    logger.error('Get comments failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取评论失败',
    }, 500);
  }
});

/**
 * 删除评论
 * @route DELETE /api/collaboration/documents/:documentId/comments/:commentId
 * @access 需要用户认证
 * @returns {Promise<Response>} 操作结果
 */
app.delete('/documents/:documentId/comments/:commentId', async (c) => {
  try {
    const documentId = c.req.param('documentId');
    const commentId = c.req.param('commentId');

    logger.info('Delete comment requested', { documentId, commentId });

    await collaborationService.deleteComment(documentId, commentId);

    return c.json({
      success: true,
      message: '评论已删除',
    });
  } catch (error) {
    logger.error('Delete comment failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '删除评论失败',
    }, 500);
  }
});

/**
 * 清理不活跃会话
 * @route POST /api/collaboration/cleanup
 * @access 需要管理员权限
 * @returns {Promise<Response>} 操作结果
 */
app.post('/cleanup', async (c) => {
  try {
    const body = await c.req.json();
    const { timeoutMinutes = 30 } = body;

    logger.info('Cleanup inactive sessions requested', { timeoutMinutes });

    await collaborationService.cleanupInactiveSessions(timeoutMinutes);

    return c.json({
      success: true,
      message: `已清理 ${timeoutMinutes} 分钟前的不活跃会话`,
    });
  } catch (error) {
    logger.error('Cleanup inactive sessions failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '清理不活跃会话失败',
    }, 500);
  }
});

export default app;
