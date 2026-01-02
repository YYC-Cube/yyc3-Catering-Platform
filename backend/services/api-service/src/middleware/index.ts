/**
 * @fileoverview 中间件入口文件
 * @description 导出所有中间件模块
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-09
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

// 身份验证中间件
export {
  AuthenticationMiddleware,
  authMiddleware,
  generateToken,
  verifyToken,
  authenticate,
  authorize,
  authorizeRestaurant,
  optionalAuth,
  type AuthenticatedRequest,
  type AuthenticationResult,
  type JWTPayload
} from './auth';

// 限流中间件
export {
  RateLimitMiddleware,
  rateLimiter,
  createRateLimit,
  rateLimitByIp,
  rateLimitByUser,
  strictRateLimit,
  loginRateLimit,
  registerRateLimit,
  type RateLimitConfig,
  type RateLimitResult
} from './rate-limiter';

// 验证中间件
export {
  ValidationMiddleware,
  validationMiddleware,
  validateBody,
  validateQuery,
  validateParams,
  validateHeaders,
  validate,
  sanitize,
  validateFile,
  type ValidationSchema,
  type ValidationResult,
  type SanitizationResult
} from './validation';

// 通用中间件工具
export const createErrorMiddleware = () => {
  return (error: Error, request: Request): Response => {
    console.error('中间件错误:', {
      error: error instanceof Error ? error.message : "未知错误",
      stack: error.stack,
      url: request.url,
      method: request.method,
    });

    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
      code: 'MIDDLEWARE_ERROR',
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  };
};

// 请求ID中间件
export const createRequestIdMiddleware = () => {
  return (request: Request): { requestId: string } => {
    const requestId = request.headers.get('x-request-id') ||
                     `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return { requestId };
  };
};

// 请求日志中间件
export const createLoggingMiddleware = () => {
  return (request: Request, requestId?: string): void => {
    const timestamp = new Date().toISOString();
    const method = request.method;
    const url = new URL(request.url);
    const path = url.pathname;
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               '127.0.0.1';

    console.log(`[${timestamp}] ${requestId || ''} ${method} ${path} - ${userAgent} (${ip})`);
  };
};

// 响应时间中间件
export const createResponseTimeMiddleware = () => {
  return (): { startTime: number } => {
    return {
      startTime: Date.now()
    };
  };
};

// 健康检查中间件
export const createHealthMiddleware = (dbManager: any) => {
  return async (): Promise<any> => {
    const startTime = Date.now();
    const responseTime = Date.now() - startTime;

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      services: {
        database: {
          status: 'unknown',
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
        error: error instanceof Error ? error.message : "未知错误",
      };
    }

    return health;
  };
};