/**
 * @file 支付服务主应用文件
 * @description 初始化Express应用，配置中间件和路由
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
import logger from './config/logger';
import { connectDB, syncModels } from './config/database';

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 配置端口
const PORT = process.env.PORT || 3204;

// 配置中间件
app.use(helmet()); // 安全头部
app.use(cors()); // 跨域支持
app.use(morgan('combined')); // 请求日志
app.use(express.json({ limit: '10mb' })); // JSON解析
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // URL编码解析

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: process.env.SERVICE_NAME || 'payment-service',
    timestamp: new Date().toISOString()
  });
});

// API路由
const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api', paymentRoutes);

// 404错误处理
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'API端点不存在'
  });
});

// 全局错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('全局错误', { error: err.message, stack: err.stack });
  res.status(500).json({ 
    success: false, 
    error: process.env.NODE_ENV === 'production' ? '内部服务器错误' : err.message
  });
});

// 启动服务器
const startServer = async () => {
  try {
    // 连接数据库
    await connectDB();
    logger.info('数据库连接成功');

    // 同步数据库模型
    await syncModels();
    logger.info('数据库模型同步成功');

    // 启动HTTP服务器
    app.listen(PORT, () => {
      logger.info(`支付服务启动成功`, { 
        service: process.env.SERVICE_NAME || 'payment-service',
        port: PORT,
        environment: process.env.NODE_ENV || 'development'
      });
    });
  } catch (error) {
    logger.error('支付服务启动失败', { error: (error as Error).message });
    process.exit(1);
  }
};

// 启动服务器
startServer();

// 导出应用（用于测试）
export default app;