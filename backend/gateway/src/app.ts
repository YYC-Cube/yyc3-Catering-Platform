/**
 * @fileoverview YYC³ API网关主应用
 * @description 统一的API网关入口，集成所有中间件和路由
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-08
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createProxyMiddleware } from 'http-proxy-middleware';
import Redis from 'ioredis';
import { rateLimit } from 'express-rate-limit';

import { gatewayConfig } from './config/gateway.config';
import { AuthenticationMiddleware, JWTUtils } from './middleware/authentication';
import { RateLimiterMiddleware } from './middleware/rate-limiter';
import { LoggingMiddleware } from './middleware/logging';
import { CircuitBreakerMiddleware } from './middleware/circuit-breaker';
import { CacheMiddleware } from './middleware/cache';
import { MetricsMiddleware } from './middleware/metrics';
import { ErrorHandlerMiddleware } from './middleware/error-handler';
import { EncryptionMiddleware } from './middleware/encryption';
import { createRoutes, getRouteInfo, validateRoutes } from './routes/api-routes';

export class GatewayApp {
  private app: express.Application;
  private redis: Redis;
  private authenticationMiddleware: AuthenticationMiddleware;
  private rateLimiterMiddleware: RateLimiterMiddleware;
  private loggingMiddleware: LoggingMiddleware;
  private circuitBreakerMiddleware: CircuitBreakerMiddleware;
  private cacheMiddleware: CacheMiddleware;
  private metricsMiddleware: MetricsMiddleware;
  private errorHandlerMiddleware: ErrorHandlerMiddleware;
  private encryptionMiddleware: EncryptionMiddleware;

  constructor() {
    this.app = express();
    this.initializeServices();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * 初始化服务
   */
  private initializeServices(): void {
    // 初始化Redis连接
    this.redis = new Redis({
      host: gatewayConfig.cache.redis?.host || 'localhost',
      port: gatewayConfig.cache.redis?.port || 6379,
      password: gatewayConfig.cache.redis?.password,
      db: gatewayConfig.cache.redis?.db || 1,
      keyPrefix: gatewayConfig.cache.redis?.keyPrefix || 'gateway:',
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    });

    // Redis连接事件监听
    this.redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    this.redis.on('error', (error) => {
      console.error('❌ Redis connection error:', error);
    });

    // 初始化中间件
    this.authenticationMiddleware = new AuthenticationMiddleware(gatewayConfig.authentication);
    this.rateLimiterMiddleware = new RateLimiterMiddleware(gatewayConfig.rateLimit, this.redis);
    this.loggingMiddleware = new LoggingMiddleware(gatewayConfig.logging);
    this.circuitBreakerMiddleware = new CircuitBreakerMiddleware();
    this.cacheMiddleware = new CacheMiddleware(gatewayConfig.cache, this.redis);
    this.metricsMiddleware = new MetricsMiddleware(gatewayConfig.monitoring);
    this.errorHandlerMiddleware = new ErrorHandlerMiddleware(gatewayConfig.errorHandling);
    this.encryptionMiddleware = new EncryptionMiddleware(gatewayConfig.encryption);
  }

  /**
   * 设置中间件
   */
  private setupMiddleware(): void {
    // 安全中间件
    if (gatewayConfig.security.helmet.enabled) {
      this.app.use(helmet(gatewayConfig.security.helmet));
    }

    // 压缩中间件
    if (gatewayConfig.security.compression.enabled) {
      this.app.use(compression({
        threshold: gatewayConfig.security.compression.threshold,
        level: gatewayConfig.security.compression.level
      }));
    }

    // 解析请求体
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // CORS中间件
    if (gatewayConfig.cors.enabled) {
      this.app.use(cors({
        origin: gatewayConfig.cors.origins,
        methods: gatewayConfig.cors.methods,
        allowedHeaders: gatewayConfig.cors.allowedHeaders,
        credentials: gatewayConfig.cors.credentials
      }));
    }

    // 请求ID中间件
    this.app.use((req, res, next) => {
      const requestId = req.headers[gatewayConfig.logging.requestIdHeader] as string ||
                       `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      req.headers[gatewayConfig.logging.requestIdHeader] = requestId;
      res.setHeader(gatewayConfig.logging.requestIdHeader, requestId);

      next();
    });

    // 日志中间件
    this.app.use(this.loggingMiddleware.requestLogger);

    // 限流中间件
    if (gatewayConfig.rateLimit.enabled) {
      this.app.use(this.rateLimiterMiddleware.rateLimit());
    }

    // 监控中间件
    if (gatewayConfig.monitoring.enabled) {
      this.app.use(this.metricsMiddleware.requestMetrics);
    }

    // 缓存中间件
    if (gatewayConfig.cache.enabled) {
      this.app.use(this.cacheMiddleware.cacheMiddleware);
    }

    // 认证中间件
    this.app.use(this.authenticationMiddleware.authenticate);

    // 响应日志中间件
    this.app.use(this.loggingMiddleware.responseLogger);
  }

  /**
   * 设置路由
   */
  private setupRoutes(): void {
    // 健康检查路由
    this.app.get(gatewayConfig.monitoring.healthCheck.path, (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.APP_VERSION || '1.0.0',
        service: 'yyc3-gateway',
        uptime: process.uptime()
      });
    });

    // 指标路由
    if (gatewayConfig.monitoring.metrics.enabled) {
      this.app.get(gatewayConfig.monitoring.metrics.path, async (req, res) => {
        try {
          const metrics = await this.metricsMiddleware.getMetrics();
          res.set('Content-Type', 'text/plain');
          res.send(metrics);
        } catch (error) {
          res.status(500).json({
            error: 'Failed to get metrics',
            message: error.message
          });
        }
      });
    }

    // 服务发现路由
    this.app.get('/api/v1/services', async (req, res) => {
      try {
        const services = await this.circuitBreakerMiddleware.getServicesStatus();
        res.json({
          success: true,
          data: services
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // 动态路由代理
    this.setupProxyRoutes();
  }

  /**
   * 设置代理路由
   */
  private setupProxyRoutes(): void {
    // 验证路由配置
    const validation = validateRoutes();
    if (!validation.valid) {
      console.error('❌ Route configuration errors:', validation.errors);
      throw new Error('Invalid route configuration');
    }

    // 使用新的路由配置
    const routes = createRoutes();
    this.app.use('/api', routes);

    // 添加路由信息端点
    this.app.get('/api/v1/routes', (req, res) => {
      res.json({
        success: true,
        data: getRouteInfo(),
      });
    });

    // 记录路由信息
    const routeInfo = getRouteInfo();
    console.log(`📋 Configured ${routeInfo.length} routes:`);
    routeInfo.forEach(route => {
      console.log(`  - ${route.methods.join(', ')} ${route.path} -> ${route.target}`);
    });
  }

  /**
   * 设置错误处理
   */
  private setupErrorHandling(): void {
    // 404处理
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Route not found',
        code: 'NOT_FOUND',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
      });
    });

    // 全局错误处理
    this.app.use(this.errorHandlerMiddleware.globalHandler);
  }

  /**
   * 启动应用
   */
  public async start(): Promise<void> {
    try {
      const port = gatewayConfig.server.port;
      const host = gatewayConfig.server.host;

      // 注册到服务发现
      if (gatewayConfig.serviceRegistry.enabled) {
        await this.registerService();
      }

      // 启动HTTP服务器
      this.app.listen(port, host, () => {
        console.log(`🚀 YYC³ API Gateway started successfully!`);
        console.log(`📍 Server: http://${host}:${port}`);
        console.log(`🏥 Health Check: http://${host}:${port}${gatewayConfig.monitoring.healthCheck.path}`);
        console.log(`📊 Metrics: http://${host}:${port}${gatewayConfig.monitoring.metrics.path}`);
        console.log(`🌍 Environment: ${gatewayConfig.server.env}`);
      });

      // 优雅关闭处理
      this.setupGracefulShutdown();

    } catch (error) {
      console.error('❌ Failed to start gateway:', error);
      process.exit(1);
    }
  }

  /**
   * 注册到服务发现
   */
  private async registerService(): Promise<void> {
    // 这里可以集成Consul、etcd等服务注册中心
    console.log('📝 Service registry integration placeholder');
  }

  /**
   * 设置优雅关闭
   */
  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}, starting graceful shutdown...`);

      try {
        // 停止接受新连接
        // 关闭Redis连接
        await this.redis.quit();

        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  /**
   * 获取Express应用实例（用于测试）
   */
  public getApp(): express.Application {
    return this.app;
  }

  /**
   * 获取Redis客户端实例
   */
  public getRedis(): Redis {
    return this.redis;
  }
}

// 启动应用
if (require.main === module) {
  const gateway = new GatewayApp();
  gateway.start().catch(error => {
    console.error('Failed to start gateway:', error);
    process.exit(1);
  });
}