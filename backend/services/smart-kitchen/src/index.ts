/**
 * @file 智能厨房服务主入口
 * @description YYC³餐饮行业智能化平台 - 智慧后厨服务
 * @module index
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { OrderController } from './controllers/OrderController';
import { KitchenController } from './controllers/KitchenController';
import { ExportController } from './controllers/ExportController';
import { DashboardController } from './controllers/DashboardController';
import { OrderService } from './services/OrderService';
import { DishRepository } from './repositories/DishRepository';
import { KitchenResourceRepository } from './repositories/KitchenResourceRepository';
import { ChefRepository } from './repositories/ChefRepository';
import { prometheusMiddleware, metricsHandler } from './middleware/prometheus.middleware';
import { healthCheckHandler, readinessCheckHandler } from './middleware/health-check.middleware';
import { config } from './config/config';

// 创建Express应用
const app = express();

// 安全中间件
app.use(helmet());

// CORS中间件
app.use(cors({
  origin: '*', // 在生产环境中应该限制具体的域名
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 压缩中间件
app.use(compression());

// 解析JSON请求体
app.use(express.json({ limit: '1mb' }));

// 解析URL编码请求体
app.use(express.urlencoded({ extended: true }));

// 速率限制中间件
const limiter = rateLimit({
  windowMs: parseInt(config.RATE_LIMIT_WINDOW_MS),
  max: parseInt(config.RATE_LIMIT_MAX),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: '请求过于频繁，请稍后再试' },
  skip: (req: express.Request) => {
    // 跳过Dashboard和Kitchen路径的限流
    return req.path.startsWith('/api/dashboard') || req.path.startsWith('/api/kitchen')
  }
});
app.use(limiter);

// 监控中间件
app.use(prometheusMiddleware);

// 健康检查路由
app.get('/health', healthCheckHandler);
app.get('/ready', readinessCheckHandler);

// Prometheus指标路由
app.get('/metrics', metricsHandler);

// 初始化存储库
const dishRepository = new DishRepository();
const kitchenResourceRepository = new KitchenResourceRepository();
const chefRepository = new ChefRepository();

// 初始化订单服务
const orderService = new OrderService(dishRepository, kitchenResourceRepository, chefRepository);

// 订单控制器路由
const orderController = new OrderController(orderService);
app.use('/api/orders', orderController.router);

// 厨房控制器路由
const kitchenController = new KitchenController(orderService);
app.use('/api/kitchen', kitchenController.router);

// Dashboard控制器路由
const dashboardController = new DashboardController(orderService, dishRepository);
app.use('/api/dashboard', dashboardController.router);

// 根路径欢迎页面
app.get('/', (req, res) => {
  res.status(200).json({
    message: '欢迎使用智能厨房服务API',
    version: '1.0.0',
    service: '智能厨房服务',
    endpoints: {
      health: 'GET /health',
      ready: 'GET /ready',
      metrics: 'GET /metrics',
      api_docs: 'GET /api-docs',
      orders: 'GET/POST/PUT /api/orders'
    },
    description: 'YYC³餐饮行业智能化平台 - 智慧后厨服务'
  });
});

// API文档路由
app.get('/api-docs', (req, res) => {
  res.status(200).json({
    title: '智能厨房服务API文档',
    version: '1.0.0',
    baseUrl: `/`,
    endpoints: [
      {
        path: '/health',
        method: 'GET',
        description: '健康检查端点',
        response: {
          status: 200,
          body: {
            status: 'OK',
            timestamp: '2024-10-15T10:00:00.000Z',
            uptime: 3600,
            environment: 'development'
          }
        }
      },
      {
        path: '/ready',
        method: 'GET',
        description: '就绪检查端点',
        response: {
          status: 200,
          body: {
            status: 'READY',
            timestamp: '2024-10-15T10:00:00.000Z',
            checks: {
              database: true,
              redis: true,
              mqtt: true,
              queues: true
            }
          }
        }
      },
      {
        path: '/metrics',
        method: 'GET',
        description: 'Prometheus监控指标端点',
        response: {
          status: 200,
          contentType: 'text/plain',
          description: 'Prometheus格式的监控指标'
        }
      },
      {
        path: '/api/orders/queue',
        method: 'GET',
        description: '获取订单队列',
        response: {
          status: 200,
          body: {
            orders: [],
            totalCount: 0,
            currentStatus: 'all',
            processingTime: 0
          }
        }
      },
      {
        path: '/api/orders',
        method: 'POST',
        description: '创建新订单',
        requestBody: {
          type: 'application/json',
          properties: {
            restaurantId: 'string',
            customerId: 'string',
            dishes: [
              {
                dishId: 'string',
                quantity: 1,
                specialInstructions: 'string'
              }
            ],
            priority: 'number',
            estimatedDeliveryTime: 'string'
          }
        },
        response: {
          status: 201,
          body: {
            id: 'string',
            status: 'string',
            createdAt: 'string'
          }
        }
      }
    ],
    documentation: '详细的API文档正在开发中'
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: '请求的资源不存在' });
});

// 错误处理中间件
app.use((err: Error | unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const error = err instanceof Error ? err : new Error(String(err));
  console.error('服务器错误:', error);
  res.status((error as any).status || 500).json({
    error: process.env['NODE_ENV'] === 'production' ? '服务器内部错误' : error.message,
  });
});

// 启动服务器
const PORT = parseInt(config.PORT);
const server = app.listen(PORT, config.HOST, () => {
  console.log(`🚀 智能厨房服务已启动，运行在 ${config.HOST}:${PORT}`);
  console.log(`📝 环境: ${config.NODE_ENV}`);
  console.log(`✅ 健康检查: http://${config.HOST}:${PORT}/health`);
  console.log(`📊 监控指标: http://${config.HOST}:${PORT}/metrics`);
  console.log(`📋 API文档: http://${config.HOST}:${PORT}/api-docs`);
});

// 处理优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});
