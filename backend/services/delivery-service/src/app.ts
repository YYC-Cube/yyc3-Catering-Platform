/**
 * @file 配送服务主应用文件
 * @description 配送服务的入口文件，初始化Express应用和配置
 * @module app
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initDatabase, syncModels } from './config/database';
import deliveryRoutes from './routes/deliveryRoutes';
import logger from './config/logger';

// 加载环境变量
dotenv.config();

// 初始化Express应用
const app = express();

// 配置中间件
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '配送服务健康检查通过',
    timestamp: new Date().toISOString(),
    service: process.env.SERVICE_NAME,
    version: '1.0.0',
  });
});

// API路由
app.use('/api/deliveries', deliveryRoutes);

// 404错误处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在',
  });
});

// 全局错误处理
app.use((err: Error | unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const error = err instanceof Error ? err : new Error(String(err));
  logger.error('全局错误', { error: error.message, stack: error.stack });
  res.status((error as any).status || 500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'production' ? '系统错误' : error.message,
  });
});

// 启动服务器
const PORT = process.env.PORT || 3204;

async function startServer() {
  try {
    // 初始化数据库连接
    await initDatabase();
    logger.info('数据库连接成功');

    // 同步数据库模型
    await syncModels();
    logger.info('数据库模型同步成功');

    // 启动服务器
    app.listen(PORT, () => {
      logger.info(`配送服务启动成功，监听端口 ${PORT}`);
      logger.info(`健康检查地址: http://localhost:${PORT}/health`);
      logger.info(`API基础地址: http://localhost:${PORT}/api/deliveries`);
    });
  } catch (error) {
    logger.error('启动配送服务失败', { error: (error as Error).message });
    process.exit(1);
  }
}

// 启动服务器
startServer();

export default app;