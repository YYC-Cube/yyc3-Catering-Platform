/**
 * @file API网关路由配置
 * @description 配置所有服务的代理路由
 * @module routes/index
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { Router } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { servicesConfig } from '../config/services';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import { logger } from '../config/logger';

/**
 * 创建API网关路由
 * @returns Router
 */
export function createRoutes(): Router {
  const router = Router();

  /**
   * 健康检查路由
   */
  router.get('/health', (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'API网关运行正常',
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * 版本信息路由
   */
  router.get('/version', (_req, res) => {
    res.status(200).json({
      success: true,
      version: '1.0.0',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * 创建代理路由
   * @param path 路径
   * @param serviceName 服务名称
   * @param secure 是否需要认证
   * @returns void
   */
  const createProxyRoute = (path: string, serviceName: string, secure: boolean = true): void => {
    const serviceConfig = servicesConfig[serviceName];
    
    if (!serviceConfig) {
      logger.error('服务配置不存在', { serviceName });
      return;
    }
    
    const proxyOptions: Options = {
      target: serviceConfig.url,
      changeOrigin: true,
      pathRewrite: { [`^${path}`]: '' },
      timeout: serviceConfig.timeout,
      logLevel: 'info',
      onError: (err, req, res) => {
        logger.error('代理错误', { serviceName, error: err, url: req.url, method: req.method });
        res.status(500).json({
          success: false,
          message: `服务 ${serviceName} 暂时不可用`,
        });
      },
      onProxyReq: (proxyReq, req, _res) => {
        logger.info('代理请求', { serviceName, url: req.url, method: req.method });
        
        // 转发认证信息
        if ((req as any).user) {
          proxyReq.setHeader('X-User-ID', (req as any).user.userId);
          proxyReq.setHeader('X-User-Email', (req as any).user.email);
        }
      },
      onProxyRes: (proxyRes, req, _res) => {
        logger.info('代理响应', { serviceName, statusCode: proxyRes.statusCode, url: req.url, method: req.method });
      },
    };

    const proxy = createProxyMiddleware(proxyOptions);
    
    // 根据是否需要认证选择中间件
    if (secure) {
      router.use(path, authMiddleware, proxy);
    } else {
      router.use(path, optionalAuthMiddleware, proxy);
    }
  };

  // 用户服务路由
  createProxyRoute('/api/users', 'userService', true);

  // 餐厅服务路由
  createProxyRoute('/api/restaurants', 'restaurantService', false);
  createProxyRoute('/api/menu-items', 'restaurantService', false);

  // 订单服务路由
  createProxyRoute('/api/orders', 'orderService', true);
  createProxyRoute('/api/cart', 'orderService', true);

  // 支付服务路由
  createProxyRoute('/api/payments', 'paymentService', true);

  // 通知服务路由
  createProxyRoute('/api/notifications', 'notificationService', true);

  // 数据分析服务路由
  createProxyRoute('/api/analytics', 'analyticsService', false);

  return router;
}
