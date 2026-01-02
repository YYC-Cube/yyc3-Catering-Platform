/**
 * @file 搜索API路由
 * @description 提供文档搜索相关的API接口
 * @module api/search-api
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { SearchService, SearchParams, SemanticSearchParams } from './search-service';
import { Logger } from './logger';

const app = new Hono();
const searchService = new SearchService();
const logger = new Logger('SearchAPI');

// 搜索请求验证模式
const searchSchema = z.object({
  query: z.string().min(1).max(500),
  type: z.enum(['keyword', 'semantic', 'hybrid']).default('hybrid'),
  category: z.string().optional(),
  minQualityScore: z.number().min(0).max(100).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  includeMetadata: z.boolean().default(false),
  threshold: z.number().min(0).max(1).optional(),
  useKnowledgeGraph: z.boolean().default(true),
});

/**
 * 执行文档搜索
 * @route POST /api/search
 * @access 公开
 * @returns {Promise<Response>} 搜索结果
 */
app.post('/', zValidator('json', searchSchema), async (c) => {
  try {
    const params = c.req.valid('json');
    logger.info('Search request received', { query: params.query, type: params.type });

    let results;
    switch (params.type) {
      case 'keyword':
        results = await searchService.keywordSearch(params);
        break;
      case 'semantic':
        results = await searchService.semanticSearch(params);
        break;
      case 'hybrid':
      default:
        results = await searchService.hybridSearch(params);
        break;
    }

    return c.json({
      success: true,
      data: {
        results,
        total: results.length,
        query: params.query,
        type: params.type,
      },
    });
  } catch (error) {
    logger.error('Search request failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '搜索失败',
    }, 500);
  }
});

/**
 * 获取搜索建议
 * @route GET /api/search/suggestions
 * @access 公开
 * @returns {Promise<Response>} 搜索建议
 */
app.get('/suggestions', async (c) => {
  try {
    const query = c.req.query('q');
    if (!query) {
      return c.json({
        success: false,
        error: '查询参数不能为空',
      }, 400);
    }

    logger.info('Search suggestions requested', { query });

    const suggestions = await searchService.getSearchSuggestions(query);

    return c.json({
      success: true,
      data: {
        suggestions,
        query,
      },
    });
  } catch (error) {
    logger.error('Search suggestions failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取搜索建议失败',
    }, 500);
  }
});

/**
 * 获取搜索历史
 * @route GET /api/search/history
 * @access 需要认证
 * @returns {Promise<Response>} 搜索历史
 */
app.get('/history', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10');
    logger.info('Search history requested', { limit });

    const history = await searchService.getSearchHistory(limit);

    return c.json({
      success: true,
      data: {
        history,
        total: history.length,
      },
    });
  } catch (error) {
    logger.error('Search history failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取搜索历史失败',
    }, 500);
  }
});

/**
 * 清除搜索历史
 * @route DELETE /api/search/history
 * @access 需要认证
 * @returns {Promise<Response>} 操作结果
 */
app.delete('/history', async (c) => {
  try {
    logger.info('Clear search history requested');

    await searchService.clearSearchHistory();

    return c.json({
      success: true,
      message: '搜索历史已清除',
    });
  } catch (error) {
    logger.error('Clear search history failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '清除搜索历史失败',
    }, 500);
  }
});

/**
 * 获取热门搜索词
 * @route GET /api/search/trending
 * @access 公开
 * @returns {Promise<Response>} 热门搜索词
 */
app.get('/trending', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10');
    logger.info('Trending searches requested', { limit });

    const trending = await searchService.getTrendingSearches(limit);

    return c.json({
      success: true,
      data: {
        trending,
        total: trending.length,
      },
    });
  } catch (error) {
    logger.error('Trending searches failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取热门搜索词失败',
    }, 500);
  }
});

/**
 * 获取相关文档
 * @route GET /api/search/related/:documentId
 * @access 公开
 * @returns {Promise<Response>} 相关文档
 */
app.get('/related/:documentId', async (c) => {
  try {
    const documentId = c.req.param('documentId');
    const limit = parseInt(c.req.query('limit') || '5');

    logger.info('Related documents requested', { documentId, limit });

    const related = await searchService.getRelatedDocuments(documentId, limit);

    return c.json({
      success: true,
      data: {
        related,
        total: related.length,
      },
    });
  } catch (error) {
    logger.error('Related documents failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取相关文档失败',
    }, 500);
  }
});

/**
 * 获取搜索统计信息
 * @route GET /api/search/statistics
 * @access 需要认证
 * @returns {Promise<Response>} 搜索统计
 */
app.get('/statistics', async (c) => {
  try {
    const query = c.req.query('query') || '';
    logger.info('Search statistics requested', { query });

    const statistics = await searchService.getSearchStatistics(query);

    return c.json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    logger.error('Search statistics failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取搜索统计失败',
    }, 500);
  }
});

/**
 * 导出搜索结果
 * @route POST /api/search/export
 * @access 需要认证
 * @returns {Promise<Response>} 导出文件
 */
app.post('/export', zValidator('json', searchSchema), async (c) => {
  try {
    const params = c.req.valid('json');
    const format = c.req.query('format') || 'json';

    logger.info('Export search results', { query: params.query, format });

    let results;
    switch (params.type) {
      case 'keyword':
        results = await searchService.keywordSearch(params);
        break;
      case 'semantic':
        results = await searchService.semanticSearch(params);
        break;
      case 'hybrid':
      default:
        results = await searchService.hybridSearch(params);
        break;
    }

    const exportData = await searchService.exportSearchResults(results, format as 'json' | 'csv' | 'excel');

    if (format === 'json') {
      return c.json({
        success: true,
        data: exportData,
      });
    } else {
      // 对于CSV和Excel，返回文件下载
      return c.text(exportData, 200, {
        'Content-Type': format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="search-results-${Date.now()}.${format}"`,
      });
    }
  } catch (error) {
    logger.error('Export search results failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '导出搜索结果失败',
    }, 500);
  }
});

export default app;
