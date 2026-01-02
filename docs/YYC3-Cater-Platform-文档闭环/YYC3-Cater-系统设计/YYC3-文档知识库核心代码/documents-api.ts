/**
 * @file 文档API路由
 * @description 提供文档相关的RESTful API接口
 * @module api/documents
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { DocumentService } from './document-service';
import { SearchService } from './search-service';
import { QualityMonitorService } from './quality-monitor-service';
import { Logger } from './logger';

const app = new Hono();
const logger = new Logger('DocumentAPI');

// 初始化服务
const documentService = new DocumentService();
const searchService = new SearchService();
const qualityMonitorService = new QualityMonitorService();

// 初始化服务
documentService.initialize().catch((error) => {
  logger.error('Failed to initialize document service', { error });
});

// 创建文档请求验证模式
const createDocumentSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  description: z.string().optional(),
  content: z.string().min(1, '内容不能为空'),
  category: z.string().min(1, '分类不能为空'),
  subcategory: z.string().optional(),
  tags: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  author: z.string().min(1, '作者不能为空'),
});

// 更新文档请求验证模式
const updateDocumentSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  tags: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
});

/**
 * 创建新文档
 * @route POST /api/documents
 * @access 私有
 * @returns {Promise<Response>} 文档创建结果
 */
app.post('/', zValidator('json', createDocumentSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    const document = await documentService.createDocument(data);

    logger.info('Document created successfully', { documentId: document.id });
    return c.json({ success: true, data: document }, 201);
  } catch (error) {
    logger.error('Failed to create document', { error });
    return c.json({ success: false, error: error instanceof Error ? error.message : String(error) }, 400);
  }
});

/**
 * 获取文档列表
 * @route GET /api/documents
 * @access 公开
 * @returns {Promise<Response>} 文档列表
 */
app.get('/', async (c) => {
  try {
    const category = c.req.query('category');
    const status = c.req.query('status');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');

    let documents;

    if (category) {
      documents = await documentService.getDocumentsByCategory(category);
    } else if (status) {
      documents = await documentService.getDocumentsByStatus(status as any);
    } else {
      documents = await documentService.getAllDocuments();
    }

    // 分页
    const paginatedDocuments = documents.slice(offset, offset + limit);

    logger.info('Documents retrieved successfully', { count: paginatedDocuments.length });
    return c.json({
      success: true,
      data: paginatedDocuments,
      total: documents.length,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('Failed to get documents', { error });
    return c.json({ success: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

/**
 * 获取文档详情
 * @route GET /api/documents/:id
 * @access 公开
 * @returns {Promise<Response>} 文档详情
 */
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const document = await documentService.getDocument(id);

    if (!document) {
      return c.json({ success: false, error: '文档不存在' }, 404);
    }

    logger.info('Document retrieved successfully', { documentId: id });
    return c.json({ success: true, data: document });
  } catch (error) {
    logger.error('Failed to get document', { error });
    return c.json({ success: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

/**
 * 更新文档
 * @route PUT /api/documents/:id
 * @access 私有
 * @returns {Promise<Response>} 更新结果
 */
app.put('/:id', zValidator('json', updateDocumentSchema), async (c) => {
  try {
    const id = c.req.param('id');
    const data = c.req.valid('json');
    const document = await documentService.updateDocument(id, data);

    if (!document) {
      return c.json({ success: false, error: '文档不存在' }, 404);
    }

    logger.info('Document updated successfully', { documentId: id });
    return c.json({ success: true, data: document });
  } catch (error) {
    logger.error('Failed to update document', { error });
    return c.json({ success: false, error: error instanceof Error ? error.message : String(error) }, 400);
  }
});

/**
 * 删除文档
 * @route DELETE /api/documents/:id
 * @access 私有
 * @returns {Promise<Response>} 删除结果
 */
app.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const success = await documentService.deleteDocument(id);

    if (!success) {
      return c.json({ success: false, error: '文档不存在' }, 404);
    }

    logger.info('Document deleted successfully', { documentId: id });
    return c.json({ success: true, message: '文档删除成功' });
  } catch (error) {
    logger.error('Failed to delete document', { error });
    return c.json({ success: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

/**
 * 搜索文档
 * @route GET /api/documents/search
 * @access 公开
 * @returns {Promise<Response>} 搜索结果
 */
app.get('/search', async (c) => {
  try {
    const query = c.req.query('q');
    const type = c.req.query('type') || 'keyword';
    const limit = parseInt(c.req.query('limit') || '20');

    if (!query) {
      return c.json({ success: false, error: '搜索查询不能为空' }, 400);
    }

    let results;

    switch (type) {
      case 'keyword':
        results = await searchService.keywordSearch({ query, limit });
        break;
      case 'semantic':
        results = await searchService.semanticSearch({ query, limit });
        break;
      case 'hybrid':
        results = await searchService.hybridSearch({ query, limit });
        break;
      default:
        return c.json({ success: false, error: '不支持的搜索类型' }, 400);
    }

    logger.info('Documents searched successfully', { query, count: results.length });
    return c.json({ success: true, data: results, query, type });
  } catch (error) {
    logger.error('Failed to search documents', { error });
    return c.json({ success: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

/**
 * 获取文档统计
 * @route GET /api/documents/statistics
 * @access 公开
 * @returns {Promise<Response>} 统计数据
 */
app.get('/statistics', async (c) => {
  try {
    const statistics = await documentService.getStatistics();

    logger.info('Document statistics retrieved successfully');
    return c.json({ success: true, data: statistics });
  } catch (error) {
    logger.error('Failed to get document statistics', { error });
    return c.json({ success: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

/**
 * 获取文档质量报告
 * @route GET /api/documents/:id/quality
 * @access 公开
 * @returns {Promise<Response>} 质量报告
 */
app.get('/:id/quality', async (c) => {
  try {
    const id = c.req.param('id');
    const document = await documentService.getDocument(id);

    if (!document) {
      return c.json({ success: false, error: '文档不存在' }, 404);
    }

    const qualityReport = await qualityMonitorService.checkDocumentQuality(document);

    logger.info('Document quality report retrieved successfully', { documentId: id });
    return c.json({ success: true, data: qualityReport });
  } catch (error) {
    logger.error('Failed to get document quality report', { error });
    return c.json({ success: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

/**
 * 获取文档版本历史
 * @route GET /api/documents/:id/versions
 * @access 公开
 * @returns {Promise<Response>} 版本历史
 */
app.get('/:id/versions', async (c) => {
  try {
    const id = c.req.param('id');
    const document = await documentService.getDocument(id);

    if (!document) {
      return c.json({ success: false, error: '文档不存在' }, 404);
    }

    logger.info('Document versions retrieved successfully', { documentId: id });
    return c.json({ success: true, data: document.versions });
  } catch (error) {
    logger.error('Failed to get document versions', { error });
    return c.json({ success: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

/**
 * 恢复文档到指定版本
 * @route POST /api/documents/:id/versions/:version/restore
 * @access 私有
 * @returns {Promise<Response>} 恢复结果
 */
app.post('/:id/versions/:version/restore', async (c) => {
  try {
    const id = c.req.param('id');
    const version = c.req.param('version');
    const { author } = await c.req.json();

    if (!author) {
      return c.json({ success: false, error: '作者信息不能为空' }, 400);
    }

    const document = await documentService.restoreVersion(id, version, author);

    if (!document) {
      return c.json({ success: false, error: '文档不存在' }, 404);
    }

    logger.info('Document version restored successfully', { documentId: id, version });
    return c.json({ success: true, data: document });
  } catch (error) {
    logger.error('Failed to restore document version', { error });
    return c.json({ success: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

/**
 * 获取相关文档
 * @route GET /api/documents/:id/related
 * @access 公开
 * @returns {Promise<Response>} 相关文档
 */
app.get('/:id/related', async (c) => {
  try {
    const id = c.req.param('id');
    const limit = parseInt(c.req.query('limit') || '10');
    const document = await documentService.getDocument(id);

    if (!document) {
      return c.json({ success: false, error: '文档不存在' }, 404);
    }

    // 获取相关文档
    const relatedDocuments = await searchService.getRelatedDocuments(id, limit);

    logger.info('Related documents retrieved successfully', { documentId: id });
    return c.json({ success: true, data: relatedDocuments });
  } catch (error) {
    logger.error('Failed to get related documents', { error });
    return c.json({ success: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

export default app;
