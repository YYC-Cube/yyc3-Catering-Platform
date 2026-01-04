/**
 * @file 通知服务主应用
 * @description 整合所有组件并启动通知服务
 * @module app
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { logger } from './config/logger';
import { testConnection, syncModels, sequelize } from './config/database';
import { connectRabbitMQ, closeRabbitMQ } from './config/rabbitmq';
import { connectRedis, closeRedis } from './config/redis';
import notificationRoutes from './routes/notificationRoutes';
import { notificationService } from './services/NotificationService';

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 配置中间件
app.use(helmet()); // 安全中间件
app.use(cors()); // 跨域支持
app.use(express.json()); // JSON解析
app.use(express.urlencoded({ extended: true })); // URL编码数据解析

// 限流中间件
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP在15分钟内最多100个请求
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 健康检查端点
app.get('/health', (req: express.Request, res: express.Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString(), service: 'Notification Service' });
});

// API路由
app.use('/api/notifications', notificationRoutes);

// 错误处理中间件
app.use((err: Error | unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const error = err instanceof Error ? err : new Error(String(err));
  logger.error('全局错误处理:', error);
  res.status((error as any).status || 500).json({
    error: {
      message: error.message || '内部服务器错误',
      code: (error as any).code || 'INTERNAL_ERROR',
    },
  });
});

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  logger.error('未捕获的异常:', err);
  process.exit(1);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', { reason, promise });
  process.exit(1);
});

// 处理进程终止信号
process.on('SIGTERM', () => {
  logger.info('收到SIGTERM信号，正在关闭服务...');
  shutdown();
});

process.on('SIGINT', () => {
  logger.info('收到SIGINT信号，正在关闭服务...');
  shutdown();
});

/**
 * 关闭服务
 */
async function shutdown() {
  try {
    // 关闭数据库连接
    await sequelize.close();
    
    // 关闭RabbitMQ连接
    await closeRabbitMQ();
    
    // 关闭Redis连接
    await closeRedis();
    
    logger.info('所有连接已关闭');
    process.exit(0);
  } catch (error) {
    logger.error('关闭服务时出错:', error);
    process.exit(1);
  }
}

/**
 * 初始化服务
 */
async function initializeService() {
  try {
    // 连接数据库
    await testConnection();
    await syncModels();
    
    // 连接RabbitMQ
    await connectRabbitMQ();
    
    // 连接Redis
    connectRedis();
    
    // 启动服务器
    const PORT = process.env.PORT || 3206;
    app.listen(PORT, () => {
      logger.info(`通知服务已启动，监听端口 ${PORT}`);
    });
  } catch (error: any) {
    logger.error('初始化服务失败:', error);
    process.exit(1);
  }
}

// 启动服务
initializeService();
