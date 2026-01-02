/**
 * @fileoverview YYC³ API网关配置
 * @description 统一的API网关配置，包含路由、认证、限流等
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-08
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { GatewayConfig } from '../types/gateway';

export const gatewayConfig: GatewayConfig = {
  // 基础配置
  server: {
    host: process.env.GATEWAY_HOST || '0.0.0.0',
    port: parseInt(process.env.GATEWAY_PORT || '8080'),
    env: process.env.NODE_ENV || 'development'
  },

  // 服务注册配置
  serviceRegistry: {
    enabled: true,
    type: 'consul',
    consul: {
      host: process.env.CONSUL_HOST || 'localhost',
      port: parseInt(process.env.CONSUL_PORT || '8500'),
      serviceName: 'yyc3-gateway',
      healthCheckInterval: 10000,
      healthCheckTimeout: 5000
    }
  },

  // 认证配置
  authentication: {
    enabled: true,
    jwt: {
      secret: process.env.JWT_SECRET || 'yyc3-jwt-secret-key',
      algorithms: ['HS256'],
      issuer: 'yyc3-catering-platform',
      audience: 'yyc3-users'
    },
    excludePaths: [
      '/api/v1/auth/login',
      '/api/v1/auth/register',
      '/api/v1/health',
      '/api/v1/docs',
      '/api/v1/menus/public'
    ]
  },

  // 限流配置
  rateLimit: {
    enabled: true,
    windowMs: 60000, // 1分钟
    maxRequests: 100,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req) => {
      // 根据用户ID或IP进行限流
      return req.user?.id || req.ip;
    },
    // 限流策略：固定窗口
    strategy: 'fixed',
    // IP白名单
    whitelist: [
      '127.0.0.1',
      '::1'
    ],
    // 限流响应配置
    response: {
      statusCode: 429,
      message: '请求过于频繁，请稍后重试'
    },
    // 路由级别的限流配置
    routeSpecific: {
      '/api/v1/auth': { maxRequests: 200, windowMs: 60000 },
      '/api/v1/users': { maxRequests: 50, windowMs: 60000 },
      '/api/v1/orders': { maxRequests: 200, windowMs: 60000 },
      '/api/v1/ai': { maxRequests: 30, windowMs: 60000 },
      '/api/v1/menus': { maxRequests: 150, windowMs: 60000 }
    }
  },

  // 数据传输加密配置
  encryption: {
    enabled: false, // 默认禁用，可根据需要启用
    keyStorePath: './encryption-keys.json',
    keyExpiration: 90 * 24 * 60 * 60 * 1000, // 90天
    autoRotate: true,
    rotationInterval: 30 * 24 * 60 * 60 * 1000, // 30天
    backupStrategy: 'keep_last_7_days',
    excludedPaths: ['/health', '/metrics', '/docs']
  },

  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    requestIdHeader: 'x-request-id',
    requestLogging: {
      enabled: true,
      includeHeaders: ['user-agent', 'authorization'],
      includeBody: false
    },
    responseLogging: {
      enabled: true,
      includeHeaders: ['content-type'],
      includeBody: false
    }
  },

  // CORS配置
  cors: {
    enabled: true,
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
    credentials: true
  },

  // 路由配置
  routes: [
    {
      path: '/api/v1/auth',
      target: 'http://localhost:3001',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      timeout: 30000,
      retries: 3,
      circuitBreaker: {
        enabled: true,
        threshold: 5,
        timeout: 60000
      }
    },
    {
      path: '/api/v1/users',
      target: 'http://localhost:3001',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      timeout: 30000,
      retries: 3,
      authentication: true,
      rateLimit: {
        maxRequests: 50,
        windowMs: 60000
      }
    },
    {
      path: '/api/v1/menus',
      target: 'http://localhost:3002',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      timeout: 30000,
      retries: 3,
      cache: {
        enabled: true,
        ttl: 300000 // 5分钟
      }
    },
    {
      path: '/api/v1/orders',
      target: 'http://localhost:3003',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      timeout: 30000,
      retries: 3,
      authentication: true,
      rateLimit: {
        maxRequests: 200,
        windowMs: 60000
      }
    },
    {
      path: '/api/v1/ai',
      target: 'http://localhost:3004',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      timeout: 60000,
      retries: 2,
      authentication: true,
      rateLimit: {
        maxRequests: 30,
        windowMs: 60000
      }
    }
  ],

  // 缓存配置
  cache: {
    enabled: true,
    type: 'redis',
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '1'),
      keyPrefix: 'yyc3-gateway:',
      ttl: 300000 // 默认5分钟
    }
  },

  // 监控配置
  monitoring: {
    enabled: true,
    metrics: {
      enabled: true,
      path: '/metrics',
      labels: {
        service: 'yyc3-gateway',
        version: process.env.APP_VERSION || '1.0.0'
      },
      collectionInterval: 60000, // 1分钟收集一次指标
      retentionDays: 7 // 指标数据保留7天
    },
    healthCheck: {
      enabled: true,
      path: '/health',
      interval: 30000, // 30秒检查一次健康状态
      timeout: 5000, // 健康检查超时时间5秒
      retryCount: 3 // 健康检查失败重试次数
    },
    alerts: {
      enabled: true,
      rules: [
        {
          id: 'high-error-rate',
          name: '高错误率告警',
          description: '当服务错误率超过5%时触发告警',
          metric: 'error_rate',
          condition: 'gt',
          threshold: 0.05,
          duration: 60000, // 持续1分钟
          severity: 'critical',
          enabled: true,
          actions: [
            {
              type: 'log',
              target: 'error'
            }
          ]
        },
        {
          id: 'high-response-time',
          name: '高响应时间告警',
          description: '当平均响应时间超过500ms时触发告警',
          metric: 'average_response_time',
          condition: 'gt',
          threshold: 500,
          duration: 60000,
          severity: 'warning',
          enabled: true,
          actions: [
            {
              type: 'log',
              target: 'warning'
            }
          ]
        },
        {
          id: 'high-memory-usage',
          name: '高内存使用率告警',
          description: '当内存使用率超过80%时触发告警',
          metric: 'memory_usage',
          condition: 'gt',
          threshold: 80,
          duration: 300000, // 持续5分钟
          severity: 'warning',
          enabled: true,
          actions: [
            {
              type: 'log',
              target: 'warning'
            }
          ]
        }
      ],
      notifications: {},
      muteIntervals: []
    },
    rootCauseAnalysis: {
      enabled: true,
      correlationInterval: 300000, // 5分钟内的相关事件
      maxCandidates: 10, // 最多10个根因候选
      autoRemediation: false, // 关闭自动修复
      remediationRules: []
    }
  },

  // 安全配置
  security: {
    helmet: {
      enabled: true,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"]
        }
      }
    },
    compression: {
      enabled: true,
      threshold: 1024,
      level: 6
    }
  },

  // 错误处理配置
  errorHandling: {
    enabled: true,
    logging: true,
    includeStackTrace: process.env.NODE_ENV === 'development',
    defaultResponse: {
      success: false,
      error: 'Internal Server Error',
      code: 'INTERNAL_ERROR',
      timestamp: true
    }
  }
};