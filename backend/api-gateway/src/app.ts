/**
 * @file API网关主应用
 * @description 整合所有中间件和路由，启动API网关服务
 * @module app
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import logger from './config/logger';
import apiRoutes from './routes/apiRoutes';
import serviceDiscoveryRoutes from './routes/serviceDiscoveryRoutes';
import serviceRegistrationRoutes from './routes/serviceRegistrationRoutes';
import healthCheckRoutes from './routes/healthCheckRoutes';
import kafkaRoutes from './routes/kafkaRoutes';
import { authenticate, authErrorHandler } from './middleware/authMiddleware';
import rateLimitMiddleware from './middleware/rateLimitMiddleware';
import { createCacheMiddleware } from './middleware/cacheMiddleware';
import { requestLogger, errorLogger } from './middleware/requestLogger';
import { serviceRegistry, registerDefaultServices } from './config/serviceRegistry';
import { healthCheckService } from './services/healthCheckService';
import { cacheService } from './services/cacheService';
import { kafkaService } from './services/kafkaService';

// 加载环境变量
dotenv.config();

// 初始化缓存中间件
const cacheMiddleware = createCacheMiddleware({
  redisConfig: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_CACHE_DB || '0'),
  },
  defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '300'),
  keyPrefix: 'yyc3-gateway',
  enabled: process.env.CACHE_ENABLED !== 'false',
});

// 初始化缓存客户端
cacheMiddleware.initialize().catch((error) => {
  logger.error('缓存中间件初始化失败', { error });
});

// 注册默认服务
registerDefaultServices();

// 创建Express应用
const app = express();

// 配置端口
const PORT = parseInt(process.env.PORT || '3200');
const SERVICE_NAME = process.env.SERVICE_NAME || 'api-gateway';

// 配置中间件
app.use(helmet()); // 安全中间件

// 请求日志中间件
app.use(requestLogger);

// CORS配置
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
}));

// 解析请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 限流中间件
app.use(rateLimitMiddleware);

// 认证中间件
app.use(authenticate);

// API路由
app.use('/api', apiRoutes);

// 服务发现路由
app.use('/api/services', serviceDiscoveryRoutes);

// 服务注册路由
app.use('/api/services', serviceRegistrationRoutes);

// 健康检查路由
app.use('/api/health-check', healthCheckRoutes);

// Kafka管理路由
app.use('/api/kafka', kafkaRoutes);

// 认证错误处理
app.use(authErrorHandler);

// 错误日志中间件
app.use(errorLogger);

// 404错误处理
app.use('*', (req, res) => {
  logger.warn('未找到路由: %s %s', req.method, req.path);
  res.status(404).json({
    success: false,
    error: '路由不存在',
  });
});

// 全局错误处理
app.use((err: Error | unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const error = err instanceof Error ? err : new Error(String(err));
  logger.error('全局错误: %s', error.message);
  logger.error('错误堆栈: %s', error.stack);
  
  res.status(500).json({
    success: false,
    error: '内部服务器错误',
  });
});

// 启动服务器
const server = app.listen(PORT, async () => {
  logger.info(`API网关服务已启动`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
  });

  // 启动健康检查服务
  healthCheckService.start();

  // 初始化缓存服务
  try {
    await cacheService.initialize();
    logger.info('缓存服务已启动');
  } catch (error) {
    logger.error('缓存服务启动失败', { error });
  }

  // 初始化Kafka服务
  try {
    await kafkaService.initialize();
    logger.info('Kafka服务已启动');
  } catch (error) {
    logger.error('Kafka服务启动失败', { error });
  }
});

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  logger.error('未捕获的异常: %s', err.message);
  logger.error('异常堆栈: %s', err.stack);
  process.exit(1);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝: %s', reason);
  logger.error('Promise: %o', promise);
  process.exit(1);
});

// 优雅关闭
const gracefulShutdown = async (signal: string) => {
  logger.info(`收到 ${signal} 信号，开始优雅关闭...`);

  // 停止健康检查服务
  healthCheckService.stop();

  // 关闭缓存服务
  await cacheService.close();

  // 关闭Kafka服务
  await kafkaService.close();

  // 关闭服务器
  server.close(() => {
    logger.info('服务器已关闭');
    process.exit(0);
  });

  // 强制退出超时
  setTimeout(() => {
    logger.error('强制退出服务器');
    process.exit(1);
  }, 10000);
};

// 处理进程终止信号
process.on('SIGINT', () => {
  gracefulShutdown('SIGINT');
});

process.on('SIGTERM', () => {
  gracefulShutdown('SIGTERM');
});