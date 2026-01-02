/**
 * @file 主应用入口
 * @description 文档知识库系统主应用入口
 * @module app
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import documentsApi from './documents-api';
import qualityMonitorApi from './quality-monitor-api';
import knowledgeGraphApi from './knowledge-graph-api';
import usageAnalyticsApi from './usage-analytics-api';
import collaborationApi from './collaboration-api';
import auditWorkflowApi from './audit-workflow-api';
import aiQaApi from './ai-qa-api';
import documentSummaryApi from './document-summary-api';
import documentClassificationApi from './document-classification-api';
import documentSimilarityApi from './document-similarity-api';
import documentRecommendationApi from './document-recommendation-api';
import documentQualityImprovementApi from './document-quality-improvement-api';
import { Logger } from './logger';

const app = new Hono();
const log = new Logger('App');

// 中间件配置
app.use('*', logger());
app.use('*', prettyJSON());
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// 健康检查
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'YYC³ 文档知识库系统',
    version: '1.0.0',
  });
});

// API路由
app.route('/api/documents', documentsApi);
app.route('/api/quality-monitor', qualityMonitorApi);
app.route('/api/knowledge-graph', knowledgeGraphApi);
app.route('/api/analytics', usageAnalyticsApi);
app.route('/api/collaboration', collaborationApi);
app.route('/api/audit-workflow', auditWorkflowApi);
app.route('/api/ai-qa', aiQaApi);
app.route('/api/document-summary', documentSummaryApi);
app.route('/api/document-classification', documentClassificationApi);
app.route('/api/document-similarity', documentSimilarityApi);
app.route('/api/document-recommendation', documentRecommendationApi);
app.route('/api/document-quality', documentQualityImprovementApi);

// 404处理
app.notFound((c) => {
  return c.json({
    success: false,
    error: '请求的资源不存在',
  }, 404);
});

// 错误处理
app.onError((err, c) => {
  log.error('Unhandled error', { error: err.message, stack: err.stack });
  return c.json({
    success: false,
    error: err.message || '服务器内部错误',
  }, 500);
});

// 启动服务器
const port = parseInt(process.env.PORT || '3280');

log.info('Starting YYC³ Document Knowledge Base System');
log.info(`Server will run on port ${port}`);

Bun.serve({
  fetch: app.fetch,
  port,
});

log.info(`Server is running on http://localhost:${port}`);
log.info(`Health check: http://localhost:${port}/health`);
log.info(`API base: http://localhost:${port}/api`);

export default app;
