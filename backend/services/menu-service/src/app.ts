/**
 * @file 菜单服务主应用文件
 * @description 菜单服务的入口点，配置Express应用和路由
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
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

// 配置环境变量
dotenv.config({ path: path.join(__dirname, '../../.env') });

// 导入数据库配置
import { sequelize, testDatabaseConnection, syncDatabase } from './config/database';

// 导入路由
import categoryRoutes from './routes/categoryRoutes';
import menuItemRoutes from './routes/menuItemRoutes';
import tagRoutes from './routes/tagRoutes';
import knowledgeGraphRoutes from './routes/knowledgeGraphRoutes';
import dataCollectionRoutes from './routes/dataCollectionRoutes';
import dynamicPriceRoutes from './routes/dynamicPriceRoutes';

// 导入日志配置
import logger from './config/logger';

// 创建Express应用
const app = express();

// 中间件配置
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// API路由配置
app.use('/api/categories', categoryRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/knowledge-graph', knowledgeGraphRoutes);
app.use('/api/v1/data-collection', dataCollectionRoutes);
app.use('/api/dynamic-pricing', dynamicPriceRoutes);

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Menu Service is healthy',
    timestamp: new Date().toISOString()
  });
});

// 404错误处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// 全局错误处理中间件
app.use((err: Error | unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const error = err instanceof Error ? err : new Error(String(err));
  logger.error('Global error handler:', error);
  res.status((error as any).status || 500).json({
    success: false,
    message: error.message || 'Internal Server Error'
  });
});

// 服务器配置
const PORT = Number(process.env.SERVICE_PORT) || 3201;
const HOST = process.env.SERVICE_HOST || '0.0.0.0';

/**
 * 启动服务器
 */
async function startServer() {
  try {
    // 测试数据库连接
    await testDatabaseConnection();
    logger.info('数据库连接成功');

    // 同步数据库模型
    await syncDatabase();
    logger.info('数据库模型同步成功');

    // 启动服务器
    const server = app.listen(PORT, HOST, () => {
      logger.info(`菜单服务已启动，监听地址: http://${HOST}:${PORT}`);
      logger.info(`健康检查地址: http://${HOST}:${PORT}/health`);
    });

    // 处理服务器关闭事件
    process.on('SIGINT', () => {
      logger.info('正在关闭服务器...');
      server.close(() => {
        logger.info('服务器已关闭');
        process.exit(0);
      });
    });

    process.on('SIGTERM', () => {
      logger.info('收到终止信号，正在关闭服务器...');
      server.close(() => {
        logger.info('服务器已关闭');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('启动服务器失败:', error);
    process.exit(1);
  }
}

// 启动服务器
startServer();

export default app;
