/**
 * @file 订单服务主应用
 * @description 启动订单服务的Express应用
 * @author YYC³
 * @version 1.0.0
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import logger from './config/logger';
import database from './config/database';
import orderRoutes from './routes/orderRoutes';

// 加载环境变量
dotenv.config();

// 初始化Express应用
const app = express();

// 配置中间件
app.use(helmet()); // 安全头
app.use(cors()); // CORS支持
app.use(express.json()); // JSON解析
app.use(express.urlencoded({ extended: true })); // URL编码解析

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'order-service' });
});

// 订单API路由
app.use('/api/orders', orderRoutes);

// 错误处理中间件
app.use((err: Error | unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const error = err instanceof Error ? err : new Error(String(err));
  logger.error('Unexpected error:', error);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

// 404处理
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({ success: false, error: 'Not Found' });
});

// 启动服务器
const PORT = process.env.PORT || 3202;

const startServer = async () => {
  try {
    // 连接数据库
    await database.connect();
    logger.info('Database connected successfully');

    // 同步模型
    await database.sync();
    logger.info('Database models synced successfully');

    // 启动HTTP服务器
    app.listen(PORT, () => {
      logger.info(`Order service is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;