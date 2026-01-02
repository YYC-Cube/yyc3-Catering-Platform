/**
 * @fileoverview 微服务应用入口
 * @description 微服务的主入口文件，负责初始化应用、配置中间件、连接数据库和启动服务器
 * @module app
 * @author YYC³ Development Team <dev@yyc3.red>
 * @version 1.0.0
 * @created 2025-01-01
 * @copyright Copyright (c) 2025 YYC³团队. All rights reserved.
 * @license MIT <https://opensource.org/licenses/MIT>
 */

import { Application, Request, Response, NextFunction } from 'express';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import config from './config/config';
import logger from './config/logger';
import { sequelize, testDatabaseConnection, syncDatabase } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import sampleRoutes from './routes/sample-routes';

// 加载环境变量
dotenv.config();

/**
 * 创建Express应用实例
 */
const createApp = (): Application => {
  const app = express();

  // 基础中间件配置
  app.use(cors(config.cors));
  app.use(helmet(config.helmet));
  app.use(compression());

  // 请求体解析
  app.use(express.json({ limit: config.request.limit }));
  app.use(express.urlencoded({ extended: true }));

  // 日志中间件
  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    }));
  }

  // 健康检查路由
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'UP',
      service: config.service.name,
      version: config.service.version,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // 注册路由
  app.use(config.api.basePath, sampleRoutes);

  // 404错误处理
  app.use(notFoundHandler);

  // 全局错误处理
  app.use(errorHandler);

  return app;
};

/**
 * 启动应用
 */
const startApp = async () => {
  try {
    const app = createApp();

    // 测试数据库连接
    await testDatabaseConnection();

    // 同步数据库模型
    await syncDatabase();

    // 启动服务器
    const server = app.listen(config.server.port, config.server.host, () => {
      logger.info(`${config.service.name} 已启动，监听 ${config.server.host}:${config.server.port}`);
      logger.info(`Environment: ${config.service.environment}`);
      logger.info(`Service name: ${config.service.name}`);
      logger.info(`Service version: ${config.service.version}`);
      logger.info(`API基础路径: http://${config.server.host}:${config.server.port}${config.api.basePath}`);
      logger.info(`健康检查: http://${config.server.host}:${config.server.port}/health`);
    });

    // 优雅关闭处理
    const gracefulShutdown = async () => {
      logger.info('正在关闭服务器...');
      await sequelize.close();
      server.close(() => {
        logger.info('服务器已关闭');
        process.exit(0);
      });
    };

    // 监听终止信号
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
  } catch (error) {
    logger.error('启动服务器失败:', error);
    process.exit(1);
  }
};

// 启动应用
if (require.main === module) {
  startApp();
}

export default createApp;
