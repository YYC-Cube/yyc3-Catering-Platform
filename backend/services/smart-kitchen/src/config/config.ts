/**
 * @file 配置管理模块
 * @description 集中管理应用的配置参数
 * @module config/config
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

import { z } from 'zod';

// 定义配置验证模式
const configSchema = z.object({
  // 服务器配置
  PORT: z.string().default('3645'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  
  // 数据库配置
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('5432'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('password'),
  DB_NAME: z.string().default('smart_kitchen'),
  
  // Redis配置
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  
  // JWT配置
  // SECURITY: JWT_SECRET must be provided via environment variable
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  
  // 安全配置
  RATE_LIMIT_MAX: z.string().default('100'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'), // 15分钟
  
  // MQTT配置
  MQTT_BROKER: z.string().default('mqtt://localhost:1883'),
  MQTT_USER: z.string().optional(),
  MQTT_PASSWORD: z.string().optional(),
  
  // 日志配置
  LOG_LEVEL: z.string().default('info'),
  LOG_FILE_PATH: z.string().default('./logs/app.log'),
  
  // 邮件配置
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  
  // 订单配置
  MAX_QUEUE_SIZE: z.string().default('100'),
  DEFAULT_COOKING_TIME: z.string().default('300'), // 5分钟
  
  // 监控配置
  METRICS_ENABLED: z.string().default('true'),
  HEALTH_CHECK_ENABLED: z.string().default('true'),
});

// 解析并验证环境变量
export const config = configSchema.parse(process.env);

// 导出类型
export type Config = z.infer<typeof configSchema>;
