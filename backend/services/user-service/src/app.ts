/**
 * @fileoverview 用户服务主应用文件
 * @description 用户服务的入口点，负责初始化Express应用、配置中间件、连接数据库和启动服务器
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-15
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes';
import config from './config/config';
import logger from './config/logger';
import { sequelize, testDatabaseConnection, syncModels } from './config/database';

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 配置中间件
app.use(cors({
  origin: config.api.corsOrigin,
  credentials: true,
}));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 配置日志中间件
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}));

// 注册路由
app.use('/api/v1/user-service', routes);

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'user-service',
    timestamp: new Date().toISOString(),
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    code: 404,
    message: '资源不存在',
  });
});

// 全局错误处理
app.use((err: Error | unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const error = err instanceof Error ? err : new Error(String(err));
  logger.error('全局错误:', error);
  res.status((error as any).status || 500).json({
    code: (error as any).status || 500,
    message: error.message || '内部服务器错误',
  });
});

/**
 * 启动服务器
 */
async function startServer() {
  try {
    // 测试数据库连接
    await testDatabaseConnection();
    logger.info('数据库连接成功');

    // 同步数据库模型
    await syncModels();
    logger.info('数据库模型同步完成');

    // 启动服务器
    const server = app.listen(config.api.port, () => {
      logger.info(`用户服务已启动，监听端口 ${config.api.port}`);
      logger.info(`API基础路径: http://localhost:${config.api.port}/api/v1/user-service`);
      logger.info(`健康检查: http://localhost:${config.api.port}/health`);
    });

    // 处理服务器关闭事件
    process.on('SIGINT', async () => {
      logger.info('正在关闭服务器...');
      await sequelize.close();
      server.close(() => {
        logger.info('服务器已关闭');
        process.exit(0);
      });
    });

    process.on('SIGTERM', async () => {
      logger.info('正在关闭服务器...');
      await sequelize.close();
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
if (require.main === module) {
  startServer();
}

export default app;
