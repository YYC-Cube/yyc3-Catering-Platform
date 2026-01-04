/**
 * @file 服务配置类型定义
 * @description 微服务相关配置
 * @author YYC
 * @version 1.0.0
 * @created 2026-01-03
 */

/**
 * 服务健康检查配置
 */
export interface HealthCheckConfig {
  enabled: boolean;
  path: string;
  interval: number;
  timeout: number;
  unhealthyThreshold: number;
  healthyThreshold: number;
}

/**
 * 服务配置
 */
export interface ServiceConfig {
  name: string;
  version: string;
  port: number;
  host?: string;
  environment: 'development' | 'staging' | 'production';
  healthCheck?: HealthCheckConfig;
  logging?: {
    level: 'error' | 'warn' | 'info' | 'debug';
    format: 'json' | 'text';
  };
  metrics?: {
    enabled: boolean;
    port?: number;
  };
  cors?: {
    enabled: boolean;
    origin?: string[];
    credentials?: boolean;
  };
}

/**
 * 超时配置
 */
export interface TimeoutConfig {
  request?: number;
  response?: number;
  database?: number;
  cache?: number;
  externalService?: number;
}

/**
 * 重试配置
 */
export interface RetryConfig {
  maxAttempts: number;
  backoffMs: number;
  maxBackoffMs?: number;
  retryableErrors?: string[];
}
