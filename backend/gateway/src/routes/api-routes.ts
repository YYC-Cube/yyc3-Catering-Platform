/**
 * @fileoverview API网关路由配置
 * @description 定义所有后端服务的路由规则和代理配置
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import express, { Router, Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, RequestHandler } from 'http-proxy-middleware';
import { gatewayConfig } from '../config/gateway.config';
import { authenticateToken } from '../middleware/auth';
import { rateLimiter } from '../middleware/rate-limiter';
import { circuitBreaker } from '../middleware/circuit-breaker';
import { logger } from '../utils/logger';

/**
 * 路由配置接口
 */
export interface RouteConfig {
  path: string;
  target: string;
  methods: string[];
  timeout?: number;
  retries?: number;
  authentication?: boolean;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  cache?: {
    enabled: boolean;
    ttl: number;
  };
  circuitBreaker?: {
    enabled: boolean;
    threshold: number;
    timeout: number;
  };
}

/**
 * 创建代理中间件
 * @param target - 目标服务地址
 * @param routeConfig - 路由配置
 * @returns 代理中间件
 */
const createProxy = (target: string, routeConfig: RouteConfig): RequestHandler => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    timeout: routeConfig.timeout || 30000,
    pathRewrite: {
      [`^${routeConfig.path}`]: '',
    },
    onProxyReq: (proxyReq, req, res) => {
      // 添加请求ID
      const requestId = req.headers['x-request-id'];
      if (requestId) {
        proxyReq.setHeader('x-request-id', requestId);
      }

      // 添加用户信息（如果已认证）
      if (req.user) {
        proxyReq.setHeader('x-user-id', req.user.id);
        proxyReq.setHeader('x-user-email', req.user.email);
        proxyReq.setHeader('x-user-role', req.user.role);
      }

      // 记录代理请求
      logger.info('Proxying request', {
        method: req.method,
        path: req.path,
        target: `${target}${req.path}`,
        requestId,
      });
    },
    onProxyRes: (proxyRes, req, res) => {
      // 记录代理响应
      logger.info('Proxy response received', {
        method: req.method,
        path: req.path,
        statusCode: proxyRes.statusCode,
        requestId: req.headers['x-request-id'],
      });
    },
    onError: (err, req, res) => {
      logger.error('Proxy error', {
        error: err.message,
        method: req.method,
        path: req.path,
        target,
      });

      res.status(502).json({
        success: false,
        error: '服务暂时不可用，请稍后重试',
        code: 'SERVICE_UNAVAILABLE',
      });
    },
  });
};

/**
 * 创建路由限流中间件
 * @param routeConfig - 路由配置
 * @returns 限流中间件
 */
const createRouteRateLimiter = (routeConfig: RouteConfig) => {
  if (!routeConfig.rateLimit) {
    return (req: Request, res: Response, next: NextFunction) => next();
  }

  return rateLimiter({
    windowMs: routeConfig.rateLimit.windowMs,
    maxRequests: routeConfig.rateLimit.maxRequests,
  });
};

/**
 * 创建路由熔断中间件
 * @param routeConfig - 路由配置
 * @returns 熔断中间件
 */
const createRouteCircuitBreaker = (routeConfig: RouteConfig) => {
  if (!routeConfig.circuitBreaker || !routeConfig.circuitBreaker.enabled) {
    return (req: Request, res: Response, next: NextFunction) => next();
  }

  return circuitBreaker({
    threshold: routeConfig.circuitBreaker.threshold,
    timeout: routeConfig.circuitBreaker.timeout,
  });
};

/**
 * 创建路由处理器
 * @param routeConfig - 路由配置
 * @returns 路由处理器
 */
const createRouteHandler = (routeConfig: RouteConfig) => {
  const router = Router();
  const proxy = createProxy(routeConfig.target, routeConfig);

  // 应用中间件
  const middlewares = [];

  // 认证中间件
  if (routeConfig.authentication) {
    middlewares.push(authenticateToken);
  }

  // 限流中间件
  middlewares.push(createRouteRateLimiter(routeConfig));

  // 熔断中间件
  middlewares.push(createRouteCircuitBreaker(routeConfig));

  // 应用所有中间件
  router.use(...middlewares);

  // 应用代理
  router.all('*', proxy);

  return router;
};

/**
 * 创建所有路由
 * @returns Express Router
 */
export const createRoutes = (): Router => {
  const router = Router();

  // 遍历所有路由配置
  gatewayConfig.routes.forEach((routeConfig: RouteConfig) => {
    const routeHandler = createRouteHandler(routeConfig);

    // 为每个方法创建路由
    routeConfig.methods.forEach((method) => {
      const methodLower = method.toLowerCase();
      if (router[methodLower as keyof Router]) {
        (router as any)[methodLower](routeConfig.path, routeHandler);
      }
    });

    logger.info('Route configured', {
      path: routeConfig.path,
      target: routeConfig.target,
      methods: routeConfig.methods,
      authentication: routeConfig.authentication,
    });
  });

  return router;
};

/**
 * 获取所有路由信息
 * @returns 路由信息列表
 */
export const getRouteInfo = () => {
  return gatewayConfig.routes.map((route) => ({
    path: route.path,
    target: route.target,
    methods: route.methods,
    authentication: route.authentication || false,
    rateLimit: route.rateLimit,
    cache: route.cache,
  }));
};

/**
 * 根据路径查找路由配置
 * @param path - 请求路径
 * @returns 路由配置或undefined
 */
export const findRouteByPath = (path: string): RouteConfig | undefined => {
  return gatewayConfig.routes.find((route) => path.startsWith(route.path));
};

/**
 * 验证路由配置
 * @returns 验证结果
 */
export const validateRoutes = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  gatewayConfig.routes.forEach((route, index) => {
    // 检查必填字段
    if (!route.path) {
      errors.push(`Route ${index}: path is required`);
    }
    if (!route.target) {
      errors.push(`Route ${index}: target is required`);
    }
    if (!route.methods || route.methods.length === 0) {
      errors.push(`Route ${index}: methods is required`);
    }

    // 检查路径格式
    if (route.path && !route.path.startsWith('/')) {
      errors.push(`Route ${index}: path must start with /`);
    }

    // 检查目标URL格式
    if (route.target && !route.target.startsWith('http')) {
      errors.push(`Route ${index}: target must be a valid URL`);
    }

    // 检查方法是否有效
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
    route.methods?.forEach((method) => {
      if (!validMethods.includes(method)) {
        errors.push(`Route ${index}: invalid method ${method}`);
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};
