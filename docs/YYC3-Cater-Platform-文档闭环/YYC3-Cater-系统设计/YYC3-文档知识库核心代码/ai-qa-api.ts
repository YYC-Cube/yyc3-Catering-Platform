/**
 * @file AI智能问答API
 * @description 提供AI问答系统的RESTful API接口，包括会话管理、问题处理、答案获取等功能
 * @module api/ai-qa
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { aiQAService } from './ai-qa-service';
import { logger } from './logger';

const app = new Hono();

// ==================== 请求验证模式 ====================

/**
 * 创建会话请求验证模式
 */
const createSessionSchema = z.object({
  userId: z.string().min(1, '用户ID不能为空'),
});

/**
 * 处理问题请求验证模式
 */
const processQuestionSchema = z.object({
  question: z.string().min(1, '问题不能为空').max(1000, '问题长度不能超过1000字符'),
  sessionId: z.string().min(1, '会话ID不能为空'),
});

/**
 * 获取会话请求验证模式
 */
const getSessionSchema = z.object({
  sessionId: z.string().min(1, '会话ID不能为空'),
});

/**
 * 删除会话请求验证模式
 */
const deleteSessionSchema = z.object({
  sessionId: z.string().min(1, '会话ID不能为空'),
});

/**
 * 获取用户会话请求验证模式
 */
const getUserSessionsSchema = z.object({
  userId: z.string().min(1, '用户ID不能为空'),
});

// ==================== API路由 ====================

/**
 * 创建新的对话会话
 * @route POST /api/ai-qa/sessions
 * @access 公开
 * @returns {Promise<Response>} 会话创建结果
 */
app.post('/sessions', zValidator('json', createSessionSchema), async (c) => {
  try {
    const { userId } = c.req.valid('json');

    // 创建会话
    const sessionId = await aiQAService.createSession(userId);

    // 获取会话详情
    const session = aiQAService.getSession(sessionId);

    return c.json({
      success: true,
      data: {
        sessionId,
        userId: session?.userId,
        createdAt: session?.createdAt,
        updatedAt: session?.updatedAt,
      },
    }, 201);
  } catch (error) {
    logger.error('Error creating session:', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '创建会话失败',
    }, 500);
  }
});

/**
 * 处理用户问题
 * @route POST /api/ai-qa/questions
 * @access 公开
 * @returns {Promise<Response>} 答案结果
 */
app.post('/questions', zValidator('json', processQuestionSchema), async (c) => {
  try {
    const { question, sessionId } = c.req.valid('json');

    // 处理问题
    const result = await aiQAService.processQuestion(sessionId, question);

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error processing question:', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '处理问题失败',
    }, 500);
  }
});

/**
 * 获取对话会话详情
 * @route GET /api/ai-qa/sessions/:sessionId
 * @access 公开
 * @returns {Promise<Response>} 会话详情
 */
app.get('/sessions/:sessionId', zValidator('param', getSessionSchema), async (c) => {
  try {
    const { sessionId } = c.req.valid('param');

    // 获取会话
    const session = aiQAService.getSession(sessionId);

    if (!session) {
      return c.json({
        success: false,
        error: '会话不存在',
      }, 404);
    }

    return c.json({
      success: true,
      data: session,
    });
  } catch (error) {
    logger.error('Error getting session:', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取会话失败',
    }, 500);
  }
});

/**
 * 删除对话会话
 * @route DELETE /api/ai-qa/sessions/:sessionId
 * @access 公开
 * @returns {Promise<Response>} 删除结果
 */
app.delete('/sessions/:sessionId', zValidator('param', deleteSessionSchema), async (c) => {
  try {
    const { sessionId } = c.req.valid('param');

    // 删除会话
    aiQAService.deleteSession(sessionId);

    return c.json({
      success: true,
      message: '会话已删除',
    });
  } catch (error) {
    logger.error('Error deleting session:', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '删除会话失败',
    }, 500);
  }
});

/**
 * 获取用户的所有会话
 * @route GET /api/ai-qa/users/:userId/sessions
 * @access 公开
 * @returns {Promise<Response>} 会话列表
 */
app.get('/users/:userId/sessions', zValidator('param', getUserSessionsSchema), async (c) => {
  try {
    const { userId } = c.req.valid('param');

    // 获取用户会话
    const sessions = aiQAService.getUserSessions(userId);

    return c.json({
      success: true,
      data: sessions,
      count: sessions.length,
    });
  } catch (error) {
    logger.error('Error getting user sessions:', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取用户会话失败',
    }, 500);
  }
});

/**
 * 清理过期会话
 * @route POST /api/ai-qa/cleanup
 * @access 私有
 * @returns {Promise<Response>} 清理结果
 */
app.post('/cleanup', async (c) => {
  try {
    // 获取最大会话年龄参数（可选）
    const maxAge = c.req.query('maxAge')
      ? parseInt(c.req.query('maxAge')!)
      : 7 * 24 * 60 * 60 * 1000; // 默认7天

    // 清理过期会话
    aiQAService.cleanupExpiredSessions(maxAge);

    return c.json({
      success: true,
      message: '过期会话已清理',
    });
  } catch (error) {
    logger.error('Error cleaning up sessions:', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '清理会话失败',
    }, 500);
  }
});

/**
 * 获取系统统计信息
 * @route GET /api/ai-qa/stats
 * @access 公开
 * @returns {Promise<Response>} 统计信息
 */
app.get('/stats', async (c) => {
  try {
    // 获取所有会话
    const sessions = Array.from(
      aiQAService['sessions'].values()
    );

    // 计算统计信息
    const stats = {
      totalSessions: sessions.length,
      totalMessages: sessions.reduce((sum, s) => sum + s.messages.length, 0),
      activeSessions: sessions.filter(s => Date.now() - s.updatedAt < 24 * 60 * 60 * 1000).length,
      avgMessagesPerSession: sessions.length > 0
        ? sessions.reduce((sum, s) => sum + s.messages.length, 0) / sessions.length
        : 0,
    };

    return c.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error getting stats:', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取统计信息失败',
    }, 500);
  }
});

/**
 * 获取会话消息历史
 * @route GET /api/ai-qa/sessions/:sessionId/messages
 * @access 公开
 * @returns {Promise<Response>} 消息列表
 */
app.get('/sessions/:sessionId/messages', zValidator('param', getSessionSchema), async (c) => {
  try {
    const { sessionId } = c.req.valid('param');

    // 获取会话消息
    const messages = aiQAService.getSessionMessages(sessionId);

    return c.json({
      success: true,
      data: messages,
      count: messages.length,
    });
  } catch (error) {
    logger.error('Error getting session messages:', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取会话消息失败',
    }, 500);
  }
});

/**
 * 获取会话历史（包含元数据）
 * @route GET /api/ai-qa/sessions/:sessionId/history
 * @access 公开
 * @returns {Promise<Response>} 会话历史
 */
app.get('/sessions/:sessionId/history', zValidator('param', getSessionSchema), async (c) => {
  try {
    const { sessionId } = c.req.valid('param');

    // 获取会话历史
    const history = aiQAService.getHistory(sessionId);

    if (!history) {
      return c.json({
        success: false,
        error: '会话不存在',
      }, 404);
    }

    return c.json({
      success: true,
      data: history,
    });
  } catch (error) {
    logger.error('Error getting session history:', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取会话历史失败',
    }, 500);
  }
});

/**
 * 更新会话元数据
 * @route PUT /api/ai-qa/sessions/:sessionId/metadata
 * @access 公开
 * @returns {Promise<Response>} 更新结果
 */
app.put('/sessions/:sessionId/metadata', zValidator('param', getSessionSchema), async (c) => {
  try {
    const { sessionId } = c.req.valid('param');
    const metadata = await c.req.json();

    // 更新会话元数据
    aiQAService.updateSessionMetadata(sessionId, metadata);

    return c.json({
      success: true,
      message: '会话元数据已更新',
    });
  } catch (error) {
    logger.error('Error updating session metadata:', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '更新会话元数据失败',
    }, 500);
  }
});

/**
 * 清空会话消息
 * @route DELETE /api/ai-qa/sessions/:sessionId/messages
 * @access 公开
 * @returns {Promise<Response>} 清空结果
 */
app.delete('/sessions/:sessionId/messages', zValidator('param', getSessionSchema), async (c) => {
  try {
    const { sessionId } = c.req.valid('param');

    // 清空会话消息
    aiQAService.clearSessionMessages(sessionId);

    return c.json({
      success: true,
      message: '会话消息已清空',
    });
  } catch (error) {
    logger.error('Error clearing session messages:', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '清空会话消息失败',
    }, 500);
  }
});

/**
 * 获取所有会话（管理员功能）
 * @route GET /api/ai-qa/admin/sessions
 * @access 需要管理员权限
 * @returns {Promise<Response>} 所有会话列表
 */
app.get('/admin/sessions', async (c) => {
  try {
    // 获取所有会话
    const sessions = aiQAService.getAllSessions();

    return c.json({
      success: true,
      data: sessions,
      count: sessions.length,
    });
  } catch (error) {
    logger.error('Error getting all sessions:', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取所有会话失败',
    }, 500);
  }
});

/**
 * 获取会话统计信息
 * @route GET /api/ai-qa/sessions/:sessionId/stats
 * @access 公开
 * @returns {Promise<Response>} 统计信息
 */
app.get('/sessions/:sessionId/stats', zValidator('param', getSessionSchema), async (c) => {
  try {
    const { sessionId } = c.req.valid('param');

    // 获取会话统计信息
    const stats = aiQAService.getSessionStats(sessionId);

    if (!stats) {
      return c.json({
        success: false,
        error: '会话不存在',
      }, 404);
    }

    return c.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error getting session stats:', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取会话统计信息失败',
    }, 500);
  }
});

/**
 * 健康检查
 * @route GET /api/ai-qa/health
 * @access 公开
 * @returns {Promise<Response>} 健康状态
 */
app.get('/health', async (c) => {
  return c.json({
    status: 'healthy',
    service: 'AI QA Service',
    timestamp: new Date().toISOString(),
  });
});

export default app;
