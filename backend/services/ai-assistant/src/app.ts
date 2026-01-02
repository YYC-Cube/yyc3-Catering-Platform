/**
 * @file AI助手服务主应用文件
 * @description 初始化Express服务器，配置中间件和路由
 * @module app
 * @author YYC³团队
 * @version 1.0.0
 * @created 2024-12-15
 * @updated 2024-12-15
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import winston from 'winston';
import routes from './routes/index.js';

// 创建Winston日志记录器
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'ai-assistant' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// 开发环境下输出到控制台
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// 创建Express应用
const app = express();

// 配置中间件
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'ai-assistant',
    timestamp: new Date().toISOString()
  });
});

// 注册路由
app.use('/api/v1', routes);

// 错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Error occurred:', { error: err.message, stack: err.stack });
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  });
});

// 404路由
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// 启动服务器
const PORT = process.env.PORT || 3201;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  logger.info(`🚀 YYC³ AI助手服务已启动`, {
    service: 'ai-assistant',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    host: HOST,
    port: PORT,
    nodeVersion: process.version,
    platform: process.platform
  });
});

export default app;