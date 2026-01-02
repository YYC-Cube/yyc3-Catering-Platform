/**
 * @file 知识图谱API路由
 * @description 提供知识图谱相关的API接口
 * @module api/knowledge-graph-api
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { KnowledgeGraphService } from './knowledge-graph.service';
import { Logger } from './logger';

const app = new Hono();
const knowledgeGraphService = new KnowledgeGraphService();
const logger = new Logger('KnowledgeGraphAPI');

/**
 * 构建知识图谱
 * @route POST /api/knowledge-graph/build
 * @access 需要管理员权限
 * @returns {Promise<Response>} 操作结果
 */
app.post('/build', async (c) => {
  try {
    logger.info('Build knowledge graph requested');

    const graph = await knowledgeGraphService.buildGraphFromDocuments();

    return c.json({
      success: true,
      message: '知识图谱构建完成',
      data: {
        nodeCount: graph.documentNodes.length + graph.conceptNodes.length,
        edgeCount: graph.edges.length,
        version: graph.version,
      },
    });
  } catch (error) {
    logger.error('Build knowledge graph failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '构建知识图谱失败',
    }, 500);
  }
});

/**
 * 获取知识图谱
 * @route GET /api/knowledge-graph
 * @access 公开
 * @returns {Promise<Response>} 知识图谱
 */
app.get('/', async (c) => {
  try {
    const version = c.req.query('version');
    const includeEdges = c.req.query('includeEdges') !== 'false';

    logger.info('Get knowledge graph requested', { version, includeEdges });

    const graph = await knowledgeGraphService.getGraph(version);

    if (!graph) {
      return c.json({
        success: false,
        error: '知识图谱不存在',
      }, 404);
    }

    return c.json({
      success: true,
      data: includeEdges ? graph : { ...graph, edges: [] },
    });
  } catch (error) {
    logger.error('Get knowledge graph failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取知识图谱失败',
    }, 500);
  }
});

/**
 * 获取图谱节点
 * @route GET /api/knowledge-graph/nodes/:nodeId
 * @access 公开
 * @returns {Promise<Response>} 节点信息
 */
app.get('/nodes/:nodeId', async (c) => {
  try {
    const nodeId = c.req.param('nodeId');
    const version = c.req.query('version');

    logger.info('Get graph node requested', { nodeId, version });

    const node = await knowledgeGraphService.getNode(nodeId, version);

    if (!node) {
      return c.json({
        success: false,
        error: '节点不存在',
      }, 404);
    }

    return c.json({
      success: true,
      data: node,
    });
  } catch (error) {
    logger.error('Get graph node failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取节点失败',
    }, 500);
  }
});

/**
 * 获取节点邻居
 * @route GET /api/knowledge-graph/nodes/:nodeId/neighbors
 * @access 公开
 * @returns {Promise<Response>} 邻居节点列表
 */
app.get('/nodes/:nodeId/neighbors', async (c) => {
  try {
    const nodeId = c.req.param('nodeId');
    const depth = parseInt(c.req.query('depth') || '1');
    const version = c.req.query('version');

    logger.info('Get node neighbors requested', { nodeId, depth, version });

    const neighbors = await knowledgeGraphService.getNodeNeighbors(nodeId, depth, version);

    return c.json({
      success: true,
      data: {
        nodeId,
        depth,
        neighbors,
      },
    });
  } catch (error) {
    logger.error('Get node neighbors failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取邻居节点失败',
    }, 500);
  }
});

/**
 * 查找节点路径
 * @route GET /api/knowledge-graph/paths
 * @access 公开
 * @returns {Promise<Response>} 路径结果
 */
app.get('/paths', async (c) => {
  try {
    const from = c.req.query('from');
    const to = c.req.query('to');
    const version = c.req.query('version');

    if (!from || !to) {
      return c.json({
        success: false,
        error: '必须指定起始节点和目标节点',
      }, 400);
    }

    logger.info('Find path requested', { from, to, version });

    const paths = await knowledgeGraphService.findPath(from, to, version);

    return c.json({
      success: true,
      data: {
        from,
        to,
        paths,
      },
    });
  } catch (error) {
    logger.error('Find path failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '查找路径失败',
    }, 500);
  }
});

/**
 * 搜索概念
 * @route GET /api/knowledge-graph/concepts/search
 * @access 公开
 * @returns {Promise<Response>} 概念列表
 */
app.get('/concepts/search', async (c) => {
  try {
    const query = c.req.query('q');
    const category = c.req.query('category');
    const limit = parseInt(c.req.query('limit') || '20');

    if (!query) {
      return c.json({
        success: false,
        error: '必须指定搜索查询',
      }, 400);
    }

    logger.info('Search concepts requested', { query, category, limit });

    const concepts = await knowledgeGraphService.searchConcepts(query, category, limit);

    return c.json({
      success: true,
      data: {
        query,
        concepts,
        total: concepts.length,
      },
    });
  } catch (error) {
    logger.error('Search concepts failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '搜索概念失败',
    }, 500);
  }
});

/**
 * 获取概念详情
 * @route GET /api/knowledge-graph/concepts/:conceptId
 * @access 公开
 * @returns {Promise<Response>} 概念详情
 */
app.get('/concepts/:conceptId', async (c) => {
  try {
    const conceptId = c.req.param('conceptId');

    logger.info('Get concept details requested', { conceptId });

    const concept = await knowledgeGraphService.getConcept(conceptId);

    if (!concept) {
      return c.json({
        success: false,
        error: '概念不存在',
      }, 404);
    }

    return c.json({
      success: true,
      data: concept,
    });
  } catch (error) {
    logger.error('Get concept details failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取概念详情失败',
    }, 500);
  }
});

/**
 * 获取相关概念
 * @route GET /api/knowledge-graph/concepts/:conceptId/related
 * @access 公开
 * @returns {Promise<Response>} 相关概念列表
 */
app.get('/concepts/:conceptId/related', async (c) => {
  try {
    const conceptId = c.req.param('conceptId');
    const limit = parseInt(c.req.query('limit') || '10');

    logger.info('Get related concepts requested', { conceptId, limit });

    const related = await knowledgeGraphService.getRelatedConcepts(conceptId, limit);

    return c.json({
      success: true,
      data: {
        conceptId,
        related,
      },
    });
  } catch (error) {
    logger.error('Get related concepts failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取相关概念失败',
    }, 500);
  }
});

/**
 * 获取图谱统计信息
 * @route GET /api/knowledge-graph/statistics
 * @access 公开
 * @returns {Promise<Response>} 统计信息
 */
app.get('/statistics', async (c) => {
  try {
    const version = c.req.query('version');

    logger.info('Get graph statistics requested', { version });

    const statistics = await knowledgeGraphService.getStatistics(version);

    return c.json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    logger.error('Get graph statistics failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取统计信息失败',
    }, 500);
  }
});

/**
 * 获取图谱版本列表
 * @route GET /api/knowledge-graph/versions
 * @access 公开
 * @returns {Promise<Response>} 版本列表
 */
app.get('/versions', async (c) => {
  try {
    logger.info('Get graph versions requested');

    const versions = await knowledgeGraphService.getVersions();

    return c.json({
      success: true,
      data: {
        versions,
        total: versions.length,
      },
    });
  } catch (error) {
    logger.error('Get graph versions failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取版本列表失败',
    }, 500);
  }
});

/**
 * 删除知识图谱
 * @route DELETE /api/knowledge-graph
 * @access 需要管理员权限
 * @returns {Promise<Response>} 操作结果
 */
app.delete('/', async (c) => {
  try {
    const version = c.req.query('version');

    logger.info('Delete knowledge graph requested', { version });

    // 如果没有指定版本，删除当前图谱
    if (!version) {
      const currentGraph = await knowledgeGraphService.getCurrentGraph();
      if (currentGraph) {
        await knowledgeGraphService.deleteGraph(currentGraph.id);
      } else {
        return c.json({
          success: false,
          error: '没有可删除的图谱',
        }, 404);
      }
    } else {
      await knowledgeGraphService.deleteGraph(version);
    }

    return c.json({
      success: true,
      message: version ? `版本 ${version} 已删除` : '知识图谱已删除',
    });
  } catch (error) {
    logger.error('Delete knowledge graph failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '删除知识图谱失败',
    }, 500);
  }
});

/**
 * 导出知识图谱
 * @route GET /api/knowledge-graph/export
 * @access 需要管理员权限
 * @returns {Promise<Response>} 导出文件
 */
app.get('/export', async (c) => {
  try {
    const format = c.req.query('format') || 'json';
    const version = c.req.query('version');

    logger.info('Export knowledge graph requested', { format, version });

    const exportResult = await knowledgeGraphService.exportGraph({
      format: format as 'json' | 'gexf' | 'graphml',
      version,
    });

    if (format === 'json') {
      return c.json({
        success: true,
        data: exportResult.data,
      });
    } else {
      return c.text(exportResult.data, 200, {
        'Content-Type': format === 'gexf' ? 'application/gexf+xml' : 'application/graphml+xml',
        'Content-Disposition': `attachment; filename="${exportResult.filename}"`,
      });
    }
  } catch (error) {
    logger.error('Export knowledge graph failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '导出知识图谱失败',
    }, 500);
  }
});

/**
 * 获取图谱可视化数据
 * @route GET /api/knowledge-graph/visualize
 * @access 公开
 * @returns {Promise<Response>} 可视化数据
 */
app.get('/visualize', async (c) => {
  try {
    const version = c.req.query('version');
    const layoutParam = c.req.query('layout') || 'force';
    const maxNodes = parseInt(c.req.query('maxNodes') || '100');

    // 验证layout参数
    const validLayouts = ['force', 'circular', 'hierarchical'];
    const layout = validLayouts.includes(layoutParam) 
      ? layoutParam as 'force' | 'circular' | 'hierarchical'
      : 'force';

    logger.info('Get visualization data requested', { version, layout, maxNodes });

    const vizData = await knowledgeGraphService.getVisualizationData({
      version,
      layout,
      maxNodes,
    });

    return c.json({
      success: true,
      data: vizData,
    });
  } catch (error) {
    logger.error('Get visualization data failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取可视化数据失败',
    }, 500);
  }
});

export default app;
