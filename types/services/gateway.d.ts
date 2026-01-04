/**
 * @file 网关服务类型定义
 * @description API 网关相关类型
 * @author YYC
 * @version 1.0.0
 * @created 2026-01-03
 */

/**
 * 路由配置接口
 */
export interface RouteConfig {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  target: string;
  authRequired?: boolean;
  rateLimit?: {
    windowMs: number;
    max: number;
  };
  cache?: {
    enabled: boolean;
    ttl?: number;
  };
  timeout?: number;
  retry?: {
    maxAttempts: number;
    backoffMs: number;
  };
  tags?: string[];
}

/**
 * 网关配置接口
 */
export interface GatewayConfig {
  port: number;
  host?: string;
  routes: RouteConfig[];
  cors: {
    enabled: boolean;
    origin?: string[];
    credentials?: boolean;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  authentication: {
    enabled: boolean;
    jwtSecret?: string;
    jwtExpiresIn?: string;
  };
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
    format: 'json' | 'text';
  };
  metrics: {
    enabled: boolean;
    port?: number;
  };
}

/**
 * 中间件配置
 */
export interface MiddlewareConfig {
  name: string;
  enabled: boolean;
  options?: Record<string, unknown>;
  priority?: number;
}

/**
 * 服务注册信息
 */
export interface ServiceRegistration {
  name: string;
  url: string;
  healthCheck: {
    enabled: boolean;
    path: string;
    interval: number;
    timeout: number;
  };
  metadata?: Record<string, string>;
}
