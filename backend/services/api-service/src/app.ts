/**
 * @fileoverview YYC³餐饮平台核心API服务
 * @description 基于Bun.serve构建的企业级RESTful API服务，提供完整的餐饮管理功能
 * @project YYC³-Catering-Platform
 * @module yyc3-catering-api-service
 * @version 1.0.0
 * @author YYC³ Development Team <dev@yyc3.red>
 * @created 2025-01-09
 * @updated 2025-01-09
 * @copyright Copyright (c) 2025 YYC³团队. All rights reserved.
 * @license MIT <https://opensource.org/licenses/MIT>
 * @see https://github.com/YYC-Cube/yyc3-catering-platform
 * @since 1.0.0
 */

import { appConfig } from './config/app';
import { dbManager } from './config/database';
import { menuRoutes } from './routes/menu-routes';
import { orderRoutes } from './routes/order-routes';
import { authRoutes } from './routes/auth-routes';
import {
  authenticate,
  authorize,
  rateLimitByIp,
  createRequestIdMiddleware,
  createLoggingMiddleware,
  createResponseTimeMiddleware
} from './middleware';

/**
 * YYC³ API服务主类
 */
export class ApiService {
  private server: any;
  private dbConnected = false;

  constructor() {
    this.server = null;
  }

  /**
   * 初始化数据库连接
   */
  private async initializeDatabase(): Promise<void> {
    try {
      await dbManager.createPool();
      this.dbConnected = true;
      console.log('✅ 数据库连接已建立');
    } catch (error) {
      console.warn('⚠️ 数据库连接失败，服务将以无数据库模式运行:', (error instanceof Error ? error.message : "未知错误"));
      // 不抛出错误，允许服务继续启动
      this.dbConnected = false;
    }
  }

  /**
   * 中间件：请求日志
   */
  private logRequest(request: Request): void {
    const timestamp = new Date().toISOString();
    const method = request.method;
    const url = new URL(request.url);
    const path = url.pathname;
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    console.log(`[${timestamp}] ${method} ${path} - ${userAgent}`);
  }

  /**
   * 中间件：CORS
   */
  private addCORSHeaders(response: Response): Response {
    const headers = new Headers(response.headers);

    // 设置CORS头
    headers.set('Access-Control-Allow-Origin', appConfig.security.corsOrigins.join(', '));
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
    headers.set('Access-Control-Allow-Credentials', 'true');

    // 设置安全头
    if (appConfig.security.enableCSP) {
      headers.set('Content-Security-Policy', "default-src 'self'");
    }

    if (appConfig.security.enableHSTS) {
      headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    // 设置API信息头
    headers.set('X-API-Version', appConfig.version);
    headers.set('X-Powered-By', 'YYC³ API Service');
    headers.set('X-Response-Time', `${Date.now()}ms`);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  /**
   * 中间件：错误处理
   */
  private handleError(error: Error, request: Request): Response {
    console.error('❌ API错误:', {
      error: (error instanceof Error ? error.message : "未知错误"),
      stack: error.stack,
      url: request.url,
      method: request.method,
    });

    const errorResponse = {
      success: false,
      error: (error instanceof Error ? error.message : "未知错误"),
      code: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * 健康检查端点
   */
  private async healthCheck(): Promise<any> {
    const startTime = Date.now();
    const responseTime = Date.now() - startTime;

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: appConfig.version,
      environment: appConfig.env,
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      services: {
        database: {
          status: this.dbConnected ? 'healthy' : 'unhealthy',
          responseTime: '0ms',
        },
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
    };

    // 检查数据库健康状态
    if (this.dbConnected) {
      try {
        const dbStartTime = Date.now();
        const dbHealthy = await dbManager.healthCheck();
        const dbResponseTime = Date.now() - dbStartTime;

        health.services.database = {
          status: dbHealthy ? 'healthy' : 'unhealthy',
          responseTime: `${dbResponseTime}ms`,
        };
      } catch (error) {
        health.services.database = {
          status: 'unhealthy',
          responseTime: '0ms',
          error: (error instanceof Error ? error.message : "未知错误"),
        } as any;
      }
    }

    return health;
  }

  /**
   * 路由匹配器
   */
  private matchRoute(method: string, path: string): any {
    // 移除查询参数
    const cleanPath = path.split('?')[0];

    // 身份验证路由匹配
    if (cleanPath.startsWith('/api/v1/auth')) {
      // 登录路由
      if (cleanPath === '/api/v1/auth/login') {
        switch (method) {
          case 'POST':
            return { handler: authRoutes['POST /api/v1/auth/login'] };
        }
      }

      // 注册路由
      if (cleanPath === '/api/v1/auth/register') {
        switch (method) {
          case 'POST':
            return { handler: authRoutes['POST /api/v1/auth/register'] };
        }
      }

      // 刷新令牌路由
      if (cleanPath === '/api/v1/auth/refresh-token') {
        switch (method) {
          case 'POST':
            return { handler: authRoutes['POST /api/v1/auth/refresh-token'] };
        }
      }

      // 验证令牌路由
      if (cleanPath === '/api/v1/auth/verify') {
        switch (method) {
          case 'GET':
            return { handler: authRoutes['GET /api/v1/auth/verify'] };
        }
      }

      // 登出路由
      if (cleanPath === '/api/v1/auth/logout') {
        switch (method) {
          case 'POST':
            return { handler: authRoutes['POST /api/v1/auth/logout'] };
        }
      }
    }

    // 菜单路由匹配
    if (cleanPath.startsWith('/api/v1/menu')) {
      // 菜单项路由
      const itemMatch = cleanPath.match(/^\/api\/v1\/menu\/items\/([^\/]+)$/);
      if (itemMatch) {
        const id = itemMatch[1];

        switch (method) {
          case 'GET':
            return { handler: menuRoutes['GET /api/v1/menu/items/:id'], params: { id } };
          case 'PUT':
            return { handler: menuRoutes['PUT /api/v1/menu/items/:id'], params: { id } };
          case 'DELETE':
            return { handler: menuRoutes['DELETE /api/v1/menu/items/:id'], params: { id } };
        }
      }

      // 菜单集合路由
      if (cleanPath === '/api/v1/menu/items') {
        switch (method) {
          case 'GET':
            return { handler: menuRoutes['GET /api/v1/menu/items'] };
          case 'POST':
            return { handler: menuRoutes['POST /api/v1/menu/items'] };
        }
      }

      // 批量操作路由
      if (cleanPath === '/api/v1/menu/items/batch/status') {
        return { handler: menuRoutes['PATCH /api/v1/menu/items/batch/status'] };
      }

      // 搜索路由
      if (cleanPath === '/api/v1/menu/search') {
        return { handler: menuRoutes['GET /api/v1/menu/search'] };
      }

      // 推荐路由
      if (cleanPath === '/api/v1/menu/recommended') {
        return { handler: menuRoutes['GET /api/v1/menu/recommended'] };
      }

      // 热门路由
      if (cleanPath === '/api/v1/menu/popular') {
        return { handler: menuRoutes['GET /api/v1/menu/popular'] };
      }

      // 新品路由
      if (cleanPath === '/api/v1/menu/new') {
        return { handler: menuRoutes['GET /api/v1/menu/new'] };
      }

      // 分类统计路由
      if (cleanPath === '/api/v1/menu/stats/categories') {
        return { handler: menuRoutes['GET /api/v1/menu/stats/categories'] };
      }

      // 销量统计路由
      if (cleanPath === '/api/v1/menu/stats/sales') {
        return { handler: menuRoutes['GET /api/v1/menu/stats/sales'] };
      }
    }

    // 订单路由匹配
    if (cleanPath.startsWith('/api/v1/orders')) {
      // 订单项路由
      const itemMatch = cleanPath.match(/^\/api\/v1\/orders\/([^\/]+)$/);
      if (itemMatch) {
        const id = itemMatch[1];

        switch (method) {
          case 'GET':
            return { handler: orderRoutes['GET /api/v1/orders/:id'], params: { id } };
          case 'PUT':
            return { handler: orderRoutes['PUT /api/v1/orders/:id'], params: { id } };
          case 'DELETE':
            return { handler: orderRoutes['DELETE /api/v1/orders/:id'], params: { id } };
        }
      }

      // 订单集合路由
      if (cleanPath === '/api/v1/orders') {
        switch (method) {
          case 'GET':
            return { handler: orderRoutes['GET /api/v1/orders'] };
          case 'POST':
            return { handler: orderRoutes['POST /api/v1/orders'] };
        }
      }

      // 订单号路由
      const numberMatch = cleanPath.match(/^\/api\/v1\/orders\/number\/([^\/]+)$/);
      if (numberMatch) {
        const orderNumber = numberMatch[1];
        switch (method) {
          case 'GET':
            return { handler: orderRoutes['GET /api/v1/orders/number/:orderNumber'], params: { orderNumber } };
        }
      }

      // 订单状态路由
      const statusMatch = cleanPath.match(/^\/api\/v1\/orders\/([^\/]+)\/status$/);
      if (statusMatch) {
        const id = statusMatch[1];
        switch (method) {
          case 'PATCH':
            return { handler: orderRoutes['PATCH /api/v1/orders/:id/status'], params: { id } };
        }
      }

      // 订单取消路由
      const cancelMatch = cleanPath.match(/^\/api\/v1\/orders\/([^\/]+)\/cancel$/);
      if (cancelMatch) {
        const id = cancelMatch[1];
        switch (method) {
          case 'POST':
            return { handler: orderRoutes['POST /api/v1/orders/:id/cancel'], params: { id } };
        }
      }

      // 订单支付路由
      const paymentMatch = cleanPath.match(/^\/api\/v1\/orders\/([^\/]+)\/payment$/);
      if (paymentMatch) {
        const id = paymentMatch[1];
        switch (method) {
          case 'POST':
            return { handler: orderRoutes['POST /api/v1/orders/:id/payment'], params: { id } };
        }
      }

      // 配送分配路由
      const deliveryMatch = cleanPath.match(/^\/api\/v1\/orders\/([^\/]+)\/assign-delivery$/);
      if (deliveryMatch) {
        const id = deliveryMatch[1];
        switch (method) {
          case 'POST':
            return { handler: orderRoutes['POST /api/v1/orders/:id/assign-delivery'], params: { id } };
        }
      }

      // 配送人员路由
      if (cleanPath === '/api/v1/orders/delivery/personnel/available') {
        return { handler: orderRoutes['GET /api/v1/orders/delivery/personnel/available'] };
      }

      // 搜索路由
      if (cleanPath === '/api/v1/orders/search') {
        return { handler: orderRoutes['GET /api/v1/orders/search'] };
      }

      // 统计路由
      if (cleanPath === '/api/v1/orders/stats') {
        return { handler: orderRoutes['GET /api/v1/orders/stats'] };
      }

      // 销售报告路由
      if (cleanPath === '/api/v1/orders/reports/sales') {
        return { handler: orderRoutes['GET /api/v1/orders/reports/sales'] };
      }

      // 批量操作路由
      if (cleanPath === '/api/v1/orders/batch/status') {
        return { handler: orderRoutes['PATCH /api/v1/orders/batch/status'] };
      }
    }

    return null;
  }

  /**
   * 启动API服务
   */
  public async start(): Promise<void> {
    try {
      // 初始化数据库
      await this.initializeDatabase();

      // 创建Bun服务器
      const self = this;
      this.server = Bun.serve({
        hostname: appConfig.host,
        port: appConfig.port,
        development: appConfig.isDev,

        // 路由处理
        fetch: async (request: Request, server: any) => {
          const startTime = Date.now();

          try {
            // 记录请求日志
            self.logRequest(request);

            const method = request.method;
            const path = new URL(request.url).pathname;

            // 处理OPTIONS请求（CORS预检）
            if (method === 'OPTIONS') {
              return self.addCORSHeaders(new Response(null, { status: 200 }));
            }

            // 健康检查路由 - 直接处理避免this上下文问题
            if (path === '/health' || path === '/api/v1/health') {
              try {
                const health = await self.healthCheck();
                return self.addCORSHeaders(new Response(JSON.stringify(health), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' },
                }));
              } catch (error) {
                console.error('健康检查错误:', error);
                const errorResponse = {
                  success: false,
                  error: error instanceof Error ? error.message : "健康检查失败",
                  code: 'HEALTH_CHECK_ERROR',
                  timestamp: new Date().toISOString()
                };
                return self.addCORSHeaders(new Response(JSON.stringify(errorResponse), {
                  status: 500,
                  headers: { 'Content-Type': 'application/json' }
                }));
              }
            }

            // API信息路由 - 直接处理避免this上下文问题
            if (path === '/' || path === '/api/v1') {
              try {
                const info = {
                  name: appConfig.name,
                  version: appConfig.version,
                  description: 'YYC³餐饮平台核心API服务',
                  environment: appConfig.env,
                  timestamp: new Date().toISOString(),
                  endpoints: {
                    auth: '/api/v1/auth/*',
                    menu: '/api/v1/menu/*',
                    orders: '/api/v1/orders/*',
                    health: '/health',
                    docs: '/api/v1/docs',
                    openapi: '/api/v1/openapi.yaml',
                  },
                };

                return self.addCORSHeaders(new Response(JSON.stringify(info, null, 2), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' },
                }));
              } catch (error) {
                console.error('API信息错误:', error);
                const errorResponse = {
                  success: false,
                  error: error instanceof Error ? error.message : "获取API信息失败",
                  code: 'API_INFO_ERROR',
                  timestamp: new Date().toISOString()
                };
                return self.addCORSHeaders(new Response(JSON.stringify(errorResponse), {
                  status: 500,
                  headers: { 'Content-Type': 'application/json' }
                }));
              }
            }

            // API文档路由
            if (path === '/api/v1/docs') {
              try {
                const html = self.generateDocsHTML();
                return self.addCORSHeaders(new Response(html, {
                  status: 200,
                  headers: { 'Content-Type': 'text/html' },
                }));
              } catch (error) {
                console.error('文档页面错误:', error);
                const errorResponse = {
                  success: false,
                  error: error instanceof Error ? error.message : "生成文档页面失败",
                  code: 'DOCS_ERROR',
                  timestamp: new Date().toISOString()
                };
                return self.addCORSHeaders(new Response(JSON.stringify(errorResponse), {
                  status: 500,
                  headers: { 'Content-Type': 'application/json' }
                }));
              }
            }

            // OpenAPI规范路由
            if (path === '/api/v1/openapi.yaml') {
              try {
                const fs = await import('fs');
                const path = await import('path');
                const openapiPath = path.join(process.cwd(), 'src', 'config', 'openapi.yaml');
                const openapiSpec = fs.readFileSync(openapiPath, 'utf8');

                return self.addCORSHeaders(new Response(openapiSpec, {
                  status: 200,
                  headers: { 'Content-Type': 'application/x-yaml' },
                }));
              } catch (error) {
                console.error('OpenAPI规范错误:', error);
                const errorResponse = {
                  success: false,
                  error: error instanceof Error ? error.message : "读取OpenAPI规范失败",
                  code: 'OPENAPI_ERROR',
                  timestamp: new Date().toISOString()
                };
                return self.addCORSHeaders(new Response(JSON.stringify(errorResponse), {
                  status: 500,
                  headers: { 'Content-Type': 'application/json' }
                }));
              }
            }

            // 路由匹配
            const route = self.matchRoute(method, path);

            if (route) {
              let response;

              if (route.params) {
                response = await route.handler(request, route.params);
              } else {
                response = await route.handler(request);
              }

              // 添加CORS头
              return self.addCORSHeaders(response);
            }

            // 404 - 路由不存在
            const notFoundResponse = {
              success: false,
              error: 'API端点不存在',
              code: 'NOT_FOUND',
              path: path,
              method: method,
              timestamp: new Date().toISOString(),
            };

            return self.addCORSHeaders(new Response(JSON.stringify(notFoundResponse), {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            }));

          } catch (error) {
            // 错误处理
            return self.addCORSHeaders(self.handleError(error, request));
          }
        },

        // 错误处理
        error(error: Error) {
          console.error('❌ 服务器错误:', error);
        },

        // 监听事件
        listen() {
          console.log(`\n🚀 YYC³ API服务启动成功！`);
          console.log(`📍 服务地址: http://${appConfig.host}:${appConfig.port}`);
          console.log(`🏥 健康检查: http://${appConfig.host}:${appConfig.port}/health`);
          console.log(`📚 API文档: http://${appConfig.host}:${appConfig.port}/api/v1/docs`);
          console.log(`🌍 环境: ${appConfig.env}`);
          console.log(`⏰ 启动时间: ${new Date().toISOString()}\n`);
        },
      });

      // 优雅关闭处理
      this.setupGracefulShutdown();

    } catch (error) {
      console.error('❌ 启动API服务失败:', error);
      throw error;
    }
  }

  /**
   * 生成API文档HTML页面
   */
  private generateDocsHTML(): string {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YYC³餐饮平台 API 文档</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            color: white;
            margin-bottom: 40px;
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }

        .card {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            animation: slideUp 0.5s ease-out;
        }

        .card h2 {
            color: #667eea;
            margin-bottom: 20px;
            font-size: 1.8rem;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
        }

        .endpoint-list {
            display: grid;
            gap: 20px;
        }

        .endpoint {
            border: 1px solid #e1e5e9;
            border-radius: 8px;
            padding: 20px;
            background: #f8f9fa;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .endpoint:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .method {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 0.9rem;
            margin-right: 10px;
            text-transform: uppercase;
        }

        .method.get { background: #28a745; color: white; }
        .method.post { background: #007bff; color: white; }
        .method.put { background: #ffc107; color: #212529; }
        .method.delete { background: #dc3545; color: white; }

        .endpoint h4 {
            color: #333;
            margin: 10px 0;
            font-size: 1.1rem;
        }

        .endpoint p {
            color: #666;
            font-size: 0.95rem;
            margin: 5px 0;
        }

        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            transition: transform 0.2s ease;
            margin: 10px 5px;
        }

        .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }

        .btn-secondary {
            background: #6c757d;
        }

        .links {
            text-align: center;
            margin-top: 30px;
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .footer {
            text-align: center;
            color: white;
            margin-top: 40px;
            opacity: 0.8;
        }

        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }

            .header h1 {
                font-size: 2rem;
            }

            .card {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🍽️ YYC³餐饮平台</h1>
            <p>企业级RESTful API服务文档</p>
        </div>

        <div class="card">
            <h2>📚 API文档</h2>
            <p>欢迎使用YYC³餐饮平台API服务！我们的API提供完整的餐饮管理功能，包括用户认证、菜单管理、订单处理等。</p>

            <div class="links">
                <a href="/api/v1/openapi.yaml" class="btn">📄 下载OpenAPI规范</a>
                <a href="/health" class="btn btn-secondary">🏥 健康检查</a>
                <a href="/api/v1" class="btn btn-secondary">ℹ️ API信息</a>
            </div>
        </div>

        <div class="card">
            <h2>🔗 核心端点</h2>
            <div class="endpoint-list">
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <h4>/api/v1/auth/register</h4>
                    <p>用户注册 - 创建新的用户账户</p>
                </div>

                <div class="endpoint">
                    <span class="method post">POST</span>
                    <h4>/api/v1/auth/login</h4>
                    <p>用户登录 - 身份验证并获取访问令牌</p>
                </div>

                <div class="endpoint">
                    <span class="method get">GET</span>
                    <h4>/api/v1/auth/verify</h4>
                    <p>令牌验证 - 验证JWT令牌的有效性</p>
                </div>

                <div class="endpoint">
                    <span class="method get">GET</span>
                    <h4>/api/v1/menu/items</h4>
                    <p>获取菜单列表 - 查询餐厅菜单项目</p>
                </div>

                <div class="endpoint">
                    <span class="method post">POST</span>
                    <h4>/api/v1/menu/items</h4>
                    <p>创建菜单项 - 添加新的菜品到菜单</p>
                </div>

                <div class="endpoint">
                    <span class="method get">GET</span>
                    <h4>/api/v1/orders</h4>
                    <p>获取订单列表 - 查询用户订单信息</p>
                </div>

                <div class="endpoint">
                    <span class="method post">POST</span>
                    <h4>/api/v1/orders</h4>
                    <p>创建订单 - 提交新的餐饮订单</p>
                </div>
            </div>
        </div>

        <div class="card">
            <h2>🔐 认证方式</h2>
            <p>API使用JWT（JSON Web Token）进行身份验证。获取令牌后，在请求头中添加：</p>
            <pre style="background: #f4f4f4; padding: 15px; border-radius: 6px; overflow-x: auto;">
Authorization: Bearer &lt;your-jwt-token&gt;
            </pre>
        </div>

        <div class="card">
            <h2>📖 使用指南</h2>
            <ol style="margin-left: 20px; line-height: 1.8;">
                <li>注册账户或使用已有账户登录获取访问令牌</li>
                <li>在API请求的Authorization头中包含JWT令牌</li>
                <li>按照各端点的要求发送请求和处理响应</li>
                <li>定期刷新令牌以保持会话有效性</li>
            </ol>
        </div>

        <div class="card">
            <h2>🛡️ 安全说明</h2>
            <ul style="margin-left: 20px; line-height: 1.8;">
                <li>所有敏感数据传输均使用HTTPS加密</li>
                <li>API具有多维度限流保护</li>
                <li>输入数据经过严格验证和清理</li>
                <li>遵循OWASP安全最佳实践</li>
            </ul>
        </div>

        <div class="footer">
            <p>© 2025 YYC³团队. 基于 MIT 许可证开源.</p>
            <p>技术栈: Bun + TypeScript + PostgreSQL + Redis</p>
        </div>
    </div>

    <script>
        // 添加交互效果
        document.querySelectorAll('.endpoint').forEach(endpoint => {
            endpoint.addEventListener('click', function() {
                const method = this.querySelector('.method').textContent;
                const path = this.querySelector('h4').textContent;
                console.log(\`API调用: \${method} \${path}\`);
            });
        });
    </script>
</body>
</html>`;
  }

  /**
   * 设置优雅关闭
   */
  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      console.log(`\n🛑 收到${signal}信号，开始优雅关闭...`);

      try {
        // 停止接受新连接
        if (this.server) {
          this.server.stop(true);
          console.log('✅ HTTP服务器已停止');
        }

        // 关闭数据库连接
        if (this.dbConnected) {
          await dbManager.close();
          console.log('✅ 数据库连接已关闭');
        }

        console.log('✅ 优雅关闭完成');
        process.exit(0);
      } catch (error) {
        console.error('❌ 优雅关闭失败:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  /**
   * 停止服务
   */
  public async stop(): Promise<void> {
    if (this.server) {
      this.server.stop(true);
      console.log('✅ API服务已停止');
    }
  }
}

// 启动服务
// @ts-ignore
if (import.meta.main) {
  const apiService = new ApiService();
  apiService.start().catch(error => {
    console.error('❌ 启动失败:', error);
    process.exit(1);
  });
}

// 导出服务实例
export default new ApiService();