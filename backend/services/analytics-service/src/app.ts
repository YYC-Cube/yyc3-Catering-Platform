/**
 * @file 数据分析服务应用入口
 * @description 配置Express应用、中间件和路由
 * @module app
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { Sequelize } from 'sequelize-typescript';
import { AnalyticsData } from './models/AnalyticsData';
import { UserAnalytics } from './models/UserAnalytics';
import { OrderAnalytics } from './models/OrderAnalytics';
import analyticsRouter from './routes/analyticsRoutes';
import { dbConfig } from './config/database';
import logger from './config/logger';

// 创建Express应用
const app = express();

// 配置中间件
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// 配置请求限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000, // 每个IP最多1000个请求
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试',
  },
});
app.use(limiter);

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '数据分析服务运行正常',
    timestamp: new Date().toISOString(),
  });
});

// API版本信息端点
app.get('/version', (req, res) => {
  res.status(200).json({
    success: true,
    version: '1.0.0',
    service: 'analytics-service',
    timestamp: new Date().toISOString(),
  });
});

// 挂载API路由
app.use('/api/analytics', analyticsRouter);

// 全局错误处理
app.use((err: Error | unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const error = err instanceof Error ? err : new Error(String(err));
  logger.error('全局错误处理', { error, url: req.url, method: req.method });

  res.status((error as any).status || 500).json({
    success: false,
    message: error.message || '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在',
  });
});

/**
 * 启动应用
 * @param port 端口号
 * @returns Promise<void>
 */
async function startApp(port: number): Promise<void> {
  try {
    logger.info('启动数据分析服务...');
    
    // 初始化数据库连接
    const sequelize = new Sequelize(dbConfig);
    sequelize.addModels([AnalyticsData, UserAnalytics, OrderAnalytics]);
    
    // 测试数据库连接
    await sequelize.authenticate();
    logger.info('数据库连接成功');
    
    // 同步数据库模型
    await sequelize.sync({ alter: true });
    logger.info('数据库模型同步成功');
    
    // 启动服务器
    app.listen(port, () => {
      logger.info(`数据分析服务已启动，监听端口 ${port}`);
    });
    
    // 处理进程信号
    process.on('SIGTERM', async () => {
      logger.info('接收到SIGTERM信号，正在关闭服务...');
      await sequelize.close();
      logger.info('数据库连接已关闭');
      process.exit(0);
    });
    
    process.on('SIGINT', async () => {
      logger.info('接收到SIGINT信号，正在关闭服务...');
      await sequelize.close();
      logger.info('数据库连接已关闭');
      process.exit(0);
    });
  } catch (error) {
    logger.error('启动数据分析服务失败', { error });
    process.exit(1);
  }
}

// 导出应用
if (require.main === module) {
  const port = parseInt(process.env.PORT || '3303', 10);
  startApp(port);
}

export default app;
export { startApp };
