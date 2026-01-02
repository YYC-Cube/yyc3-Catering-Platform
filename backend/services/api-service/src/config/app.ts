/**
 * @fileoverview YYC³ API服务应用配置
 * @description 应用程序配置和环境变量管理
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-09
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { z } from 'zod';

/**
 * 环境变量配置验证模式
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  HOST: z.string().default('0.0.0.0'),
  APP_NAME: z.string().default('yyc3-api-service'),
  APP_VERSION: z.string().default('1.0.0'),

  // 数据库配置
  DATABASE_URL: z.string().optional(),
  DATABASE_HOST: z.string().default('localhost'),
  DATABASE_PORT: z.string().transform(Number).default('5432'),
  DATABASE_NAME: z.string().default('yyc3_catering'),
  DATABASE_USER: z.string().default('yyc3_user'),
  DATABASE_PASSWORD: z.string().default('yyc3_password'),
  DATABASE_SSL: z.string().transform(val => val === 'true').default('false'),

  // Redis配置
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().transform(Number).default('0'),

  // JWT配置
  JWT_SECRET: z.string().min(32, 'JWT密钥长度至少32字符'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // 限流配置
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('60000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // 文件上传配置
  UPLOAD_MAX_SIZE: z.string().transform(Number).default('10485760'),
  UPLOAD_ALLOWED_TYPES: z.string().default('image/jpeg,image/png,image/gif,image/webp'),

  // 邮件配置
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).default('587'),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().optional(),

  // 外部服务配置
  WECHAT_APP_ID: z.string().optional(),
  WECHAT_APP_SECRET: z.string().optional(),
  ALIYUN_ACCESS_KEY: z.string().optional(),
  ALIYUN_SECRET_KEY: z.string().optional(),

  // 监控配置
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  ENABLE_METRICS: z.string().transform(val => val === 'true').default('true'),
  METRICS_PORT: z.string().transform(Number).default('9090'),

  // 安全配置
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  ENABLE_CSP: z.string().transform(val => val === 'true').default('true'),
  ENABLE_HSTS: z.string().transform(val => val === 'true').default('true'),
});

/**
 * 验证并解析环境变量
 */
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ 环境变量验证失败:', error);
    process.exit(1);
  }
}

/**
 * 应用配置接口
 */
export interface AppConfig {
  env: string;
  port: number;
  host: string;
  name: string;
  version: string;
  isDev: boolean;
  isProd: boolean;
  isTest: boolean;
  database: {
    url?: string;
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    ssl: boolean;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  upload: {
    maxSize: number;
    allowedTypes: string[];
  };
  email?: {
    host: string;
    port: number;
    user?: string;
    password?: string;
    from?: string;
  };
  externalServices: {
    wechat?: {
      appId: string;
      appSecret: string;
    };
    aliyun?: {
      accessKey: string;
      secretKey: string;
    };
  };
  monitoring: {
    logLevel: string;
    enableMetrics: boolean;
    metricsPort: number;
  };
  security: {
    corsOrigins: string[];
    enableCSP: boolean;
    enableHSTS: boolean;
  };
}

/**
 * 创建应用配置
 */
export function createAppConfig(): AppConfig {
  const env = validateEnv();

  const corsOrigins = env.CORS_ORIGINS.split(',').map(origin => origin.trim());

  const config: AppConfig = {
    env: env.NODE_ENV,
    port: env.PORT,
    host: env.HOST,
    name: env.APP_NAME,
    version: env.APP_VERSION,
    isDev: env.NODE_ENV === 'development',
    isProd: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',

    database: {
      url: env.DATABASE_URL,
      host: env.DATABASE_HOST,
      port: env.DATABASE_PORT,
      name: env.DATABASE_NAME,
      user: env.DATABASE_USER,
      password: env.DATABASE_PASSWORD,
      ssl: env.DATABASE_SSL,
    },

    redis: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD,
      db: env.REDIS_DB,
    },

    jwt: {
      secret: env.JWT_SECRET,
      expiresIn: env.JWT_EXPIRES_IN,
      refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    },

    rateLimit: {
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    },

    upload: {
      maxSize: env.UPLOAD_MAX_SIZE,
      allowedTypes: env.UPLOAD_ALLOWED_TYPES.split(','),
    },

    email: env.SMTP_HOST ? {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      user: env.SMTP_USER,
      password: env.SMTP_PASSWORD,
      from: env.SMTP_FROM,
    } : undefined,

    externalServices: {
      wechat: env.WECHAT_APP_ID && env.WECHAT_APP_SECRET ? {
        appId: env.WECHAT_APP_ID,
        appSecret: env.WECHAT_APP_SECRET,
      } : undefined,
      aliyun: env.ALIYUN_ACCESS_KEY && env.ALIYUN_SECRET_KEY ? {
        accessKey: env.ALIYUN_ACCESS_KEY,
        secretKey: env.ALIYUN_SECRET_KEY,
      } : undefined,
    },

    monitoring: {
      logLevel: env.LOG_LEVEL,
      enableMetrics: env.ENABLE_METRICS,
      metricsPort: env.METRICS_PORT,
    },

    security: {
      corsOrigins,
      enableCSP: env.ENABLE_CSP,
      enableHSTS: env.ENABLE_HSTS,
    },
  };

  return config;
}

// 导出默认配置实例
export const appConfig = createAppConfig();