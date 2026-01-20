/**
 * @file API路由配置
 * @description 定义所有API路由，包括健康检查和微服务路由
 * @module routes/apiRoutes
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Router } from 'express';
import { proxyService } from '../services/proxyService';
import { createCacheMiddleware } from '../middleware/cacheMiddleware';

const router = Router();

// 创建缓存中间件实例
const cacheMiddleware = createCacheMiddleware({
  redisConfig: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_CACHE_DB || '0'),
  },
  defaultTTL: 300, // 5分钟
  keyPrefix: 'yyc3-gateway',
  enabled: process.env.CACHE_ENABLED !== 'false',
});

// 健康检查路由（不缓存）
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API网关运行正常',
    timestamp: new Date().toISOString(),
  });
});

// 用户服务路由
// GET请求使用缓存
router.get('/auth/*', cacheMiddleware.middleware({ ttl: 600 }), proxyService.forwardRequest);
router.get('/users/*', cacheMiddleware.middleware({ ttl: 300 }), proxyService.forwardRequest);
// POST/PUT/DELETE请求不缓存
router.post('/auth/*', proxyService.forwardRequest);
router.post('/users/*', proxyService.forwardRequest);
router.put('/users/*', proxyService.forwardRequest);
router.delete('/users/*', proxyService.forwardRequest);

// 餐厅服务路由
// GET请求使用缓存（餐厅列表和菜单列表缓存时间较长）
router.get('/restaurants', cacheMiddleware.middleware({ ttl: 600 }), proxyService.forwardRequest);
router.get('/restaurants/*', cacheMiddleware.middleware({ ttl: 300 }), proxyService.forwardRequest);
router.get('/menus', cacheMiddleware.middleware({ ttl: 600 }), proxyService.forwardRequest);
router.get('/menus/*', cacheMiddleware.middleware({ ttl: 300 }), proxyService.forwardRequest);
// POST/PUT/DELETE请求不缓存
router.post('/restaurants/*', proxyService.forwardRequest);
router.put('/restaurants/*', proxyService.forwardRequest);
router.delete('/restaurants/*', proxyService.forwardRequest);
router.post('/menus/*', proxyService.forwardRequest);
router.put('/menus/*', proxyService.forwardRequest);
router.delete('/menus/*', proxyService.forwardRequest);

// 订单服务路由
// GET请求使用缓存（订单历史等）
router.get('/orders', cacheMiddleware.middleware({ ttl: 60 }), proxyService.forwardRequest);
router.get('/orders/*', cacheMiddleware.middleware({ ttl: 60 }), proxyService.forwardRequest);
// POST/PUT/DELETE请求不缓存
router.post('/orders/*', proxyService.forwardRequest);
router.put('/orders/*', proxyService.forwardRequest);
router.delete('/orders/*', proxyService.forwardRequest);

// 支付服务路由
// GET请求使用缓存（支付状态等）
router.get('/payments/*', cacheMiddleware.middleware({ ttl: 30 }), proxyService.forwardRequest);
// POST/PUT/DELETE请求不缓存
router.post('/payments/*', proxyService.forwardRequest);
router.put('/payments/*', proxyService.forwardRequest);

// 配送服务路由
// GET请求使用缓存（配送状态等）
router.get('/deliveries', cacheMiddleware.middleware({ ttl: 60 }), proxyService.forwardRequest);
router.get('/deliveries/*', cacheMiddleware.middleware({ ttl: 30 }), proxyService.forwardRequest);
// POST/PUT/DELETE请求不缓存
router.post('/deliveries/*', proxyService.forwardRequest);
router.put('/deliveries/*', proxyService.forwardRequest);

// 通知服务路由
// GET请求使用缓存（通知历史等）
router.get('/notifications', cacheMiddleware.middleware({ ttl: 120 }), proxyService.forwardRequest);
router.get('/notifications/*', cacheMiddleware.middleware({ ttl: 120 }), proxyService.forwardRequest);
// POST/PUT/DELETE请求不缓存
router.post('/notifications/*', proxyService.forwardRequest);
router.put('/notifications/*', proxyService.forwardRequest);
router.delete('/notifications/*', proxyService.forwardRequest);

// 数据分析服务路由
// GET请求使用缓存（统计数据等）
router.get('/analytics', cacheMiddleware.middleware({ ttl: 300 }), proxyService.forwardRequest);
router.get('/analytics/*', cacheMiddleware.middleware({ ttl: 300 }), proxyService.forwardRequest);
// POST/PUT/DELETE请求不缓存
router.post('/analytics/*', proxyService.forwardRequest);
router.put('/analytics/*', proxyService.forwardRequest);

// 厨房服务路由
// GET请求使用缓存（厨房状态等）
router.get('/kitchen', cacheMiddleware.middleware({ ttl: 30 }), proxyService.forwardRequest);
router.get('/kitchen/*', cacheMiddleware.middleware({ ttl: 30 }), proxyService.forwardRequest);
// POST/PUT/DELETE请求不缓存
router.post('/kitchen/*', proxyService.forwardRequest);
router.put('/kitchen/*', proxyService.forwardRequest);
router.patch('/kitchen/*', proxyService.forwardRequest);

export default router;