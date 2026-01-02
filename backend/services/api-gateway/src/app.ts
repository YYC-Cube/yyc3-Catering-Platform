/**
 * @file API网关应用入口
 * @description 实现API网关的初始化和启动逻辑
 * @module app
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { logger } from './config/logger';
import { rateLimiterMiddleware } from './middleware/rateLimiter';

import { createRoutes } from './routes';

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 配置中间件
app.use(helmet());
app.use(compression());
app.use(express.json({
  limit: process.env['REQUEST_BODY_LIMIT'] || '1mb'
}));
app.use(express.urlencoded({ 
  extended: true,
  limit: process.env['REQUEST_BODY_LIMIT'] || '1mb'
}));

// 配置CORS
const corsOptions = {
  origin: (process.env['CORS_ORIGIN'] || '*').split(','),
  methods: (process.env['CORS_METHODS'] || 'GET, POST, PUT, DELETE, OPTIONS').split(','),
  allowedHeaders: (process.env['CORS_ALLOWED_HEADERS'] || 'Origin, X-Requested-With, Content-Type, Accept, Authorization').split(','),
  credentials: true,
  maxAge: parseInt(process.env['CORS_MAX_AGE'] || '86400')
};
app.use(cors(corsOptions));

// 应用限流中间件
app.use(rateLimiterMiddleware);

// 健康检查端点
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: process.env['SERVICE_NAME'] || 'api-gateway'
  });
});

// 版本信息端点
app.get('/version', (_req: Request, res: Response) => {
  res.json({
    success: true,
    version: process.env['npm_package_version'] || '1.0.0',
    service: process.env['SERVICE_NAME'] || 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

// 创建路由
const router = createRoutes();
app.use(router);

// 全局错误处理中间件
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(`全局错误处理: ${err.message}`, { stack: err.stack });
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
    code: 'INTERNAL_SERVER_ERROR'
  });
});

// 404处理
app.use('*', (req: Request, res: Response) => {
  logger.warn(`404 Not Found: ${req.path}`);
  res.status(404).json({
    success: false,
    error: '接口不存在',
    code: 'NOT_FOUND'
  });
});

// 启动服务器
const PORT = process.env['PORT'] || 3200;
app.listen(PORT, () => {
  logger.info(`API网关已启动，监听端口 ${PORT}`);
  logger.info(`服务名称: ${process.env['SERVICE_NAME'] || 'api-gateway'}`);
  logger.info(`环境: ${process.env['NODE_ENV'] || 'development'}`);
});

// 处理进程信号
process.on('SIGINT', () => {
  logger.info('收到SIGINT信号，正在关闭服务...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('收到SIGTERM信号，正在关闭服务...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', { error });
  process.exit(1);
});
