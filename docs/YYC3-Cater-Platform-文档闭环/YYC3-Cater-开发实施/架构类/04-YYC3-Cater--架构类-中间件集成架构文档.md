---

**@file**：YYC³-中间件集成架构文档
**@description**：YYC³餐饮行业智能化平台的中间件集成架构文档
**@author**：YYC³
**@version**：v1.0.0
**@created**：2025-01-30
**@updated**：2025-01-30
**@status**：published
**@tags**：YYC³,文档

---
# 中间件集成架构文档

> ***YanYuCloudCube***
> **标语**：言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> **标语**：万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

## 文档信息
- 文档类型：架构类
- 所属阶段：YYC3-Cater--开发实施
- 遵循规范：五高五标五化要求
- 版本号：V1.0
- 创建时间：2025-01-30
- 更新时间：2025-01-30

## 目录

1. [中间件概述](#1-中间件概述)
2. [认证中间件](#2-认证中间件)
3. [授权中间件](#3-授权中间件)
4. [日志中间件](#4-日志中间件)
5. [错误处理中间件](#5-错误处理中间件)
6. [限流中间件](#6-限流中间件)
7. [缓存中间件](#7-缓存中间件)
8. [CORS中间件](#8-cors中间件)
9. [请求验证中间件](#9-请求验证中间件)
10. [性能监控中间件](#10-性能监控中间件)

---

## 1. 中间件概述

### 1.1 中间件架构

```typescript
/**
 * @file 中间件核心定义
 * @description 定义中间件的核心架构和接口
 * @module middleware-core
 * @author YYC³
 * @version 1.0.0
 */

/**
 * 中间件上下文
 */
export interface MiddlewareContext {
  request: Request;
  response: Response;
  state: Map<string, any>;
}

/**
 * 中间件函数
 */
export type MiddlewareFunction = (
  context: MiddlewareContext,
  next: () => Promise<void>
) => Promise<void>;

/**
 * 中间件配置
 */
export interface MiddlewareConfig {
  name: string;
  priority: number;
  enabled: boolean;
  options?: any;
}

/**
 * 中间件基类
 */
export abstract class BaseMiddleware {
  protected config: MiddlewareConfig;

  constructor(config: MiddlewareConfig) {
    this.config = config;
  }

  /**
   * 执行中间件
   */
  abstract execute(context: MiddlewareContext, next: () => Promise<void>): Promise<void>;

  /**
   * 获取配置
   */
  getConfig(): MiddlewareConfig {
    return this.config;
  }

  /**
   * 是否启用
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * 获取优先级
   */
  getPriority(): number {
    return this.config.priority;
  }
}
```

### 1.2 中间件管道

```typescript
/**
 * 中间件管道
 */
export class MiddlewarePipeline {
  private middlewares: BaseMiddleware[] = [];

  /**
   * 添加中间件
   */
  use(middleware: BaseMiddleware): this {
    this.middlewares.push(middleware);
    // 按优先级排序
    this.middlewares.sort((a, b) => b.getPriority() - a.getPriority());
    return this;
  }

  /**
   * 移除中间件
   */
  remove(middlewareName: string): this {
    this.middlewares = this.middlewares.filter(
      m => m.getConfig().name !== middlewareName
    );
    return this;
  }

  /**
   * 执行管道
   */
  async execute(context: MiddlewareContext): Promise<void> {
    let index = 0;

    const next = async (): Promise<void> => {
      if (index >= this.middlewares.length) {
        return;
      }

      const middleware = this.middlewares[index++];

      if (!middleware.isEnabled()) {
        await next();
        return;
      }

      await middleware.execute(context, next);
    };

    await next();
  }

  /**
   * 获取中间件列表
   */
  getMiddlewares(): BaseMiddleware[] {
    return [...this.middlewares];
  }
}
```

---

## 2. 认证中间件

### 2.1 JWT认证

```typescript
/**
 * @file 认证中间件
 * @description 实现用户认证中间件
 * @module auth-middleware
 * @author YYC³
 * @version 1.0.0
 */

import jwt from 'jsonwebtoken';

/**
 * JWT配置
 */
export interface JWTConfig {
  secret: string;
  expiresIn: string;
  issuer?: string;
  audience?: string;
}

/**
 * 用户载荷
 */
export interface UserPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

/**
 * JWT认证中间件
 */
export class JWTAuthMiddleware extends BaseMiddleware {
  constructor(private jwtConfig: JWTConfig) {
    super({
      name: 'JWT_AUTH',
      priority: 100,
      enabled: true
    });
  }

  /**
   * 执行认证
   */
  async execute(context: MiddlewareContext, next: () => Promise<void>): Promise<void> {
    const token = this.extractToken(context.request);

    if (!token) {
      this.sendUnauthorized(context.response, 'No token provided');
      return;
    }

    try {
      const payload = await this.verifyToken(token);
      context.state.set('user', payload);
      await next();
    } catch (error) {
      this.sendUnauthorized(context.response, 'Invalid or expired token');
    }
  }

  /**
   * 提取令牌
   */
  private extractToken(request: Request): string | null {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * 验证令牌
   */
  private async verifyToken(token: string): Promise<UserPayload> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        this.jwtConfig.secret,
        {
          issuer: this.jwtConfig.issuer,
          audience: this.jwtConfig.audience
        },
        (error, decoded) => {
          if (error) {
            reject(error);
          } else {
            resolve(decoded as UserPayload);
          }
        }
      );
    });
  }

  /**
   * 发送未授权响应
   */
  private sendUnauthorized(response: Response, message: string): void {
    response.status = 401;
    response.headers.set('Content-Type', 'application/json');
    response.body = JSON.stringify({
      error: 'Unauthorized',
      message
    });
  }

  /**
   * 生成令牌
   */
  static generateToken(payload: UserPayload, config: JWTConfig): string {
    return jwt.sign(payload, config.secret, {
      expiresIn: config.expiresIn,
      issuer: config.issuer,
      audience: config.audience
    });
  }
}
```

### 2.2 API Key认证

```typescript
/**
 * API Key配置
 */
export interface APIKeyConfig {
  validKeys: Set<string>;
  headerName: string;
  queryParamName?: string;
}

/**
 * API Key认证中间件
 */
export class APIKeyAuthMiddleware extends BaseMiddleware {
  constructor(private config: APIKeyConfig) {
    super({
      name: 'API_KEY_AUTH',
      priority: 95,
      enabled: true
    });
  }

  /**
   * 执行认证
   */
  async execute(context: MiddlewareContext, next: () => Promise<void>): Promise<void> {
    const apiKey = this.extractAPIKey(context.request);

    if (!apiKey) {
      this.sendUnauthorized(context.response, 'API Key required');
      return;
    }

    if (!this.config.validKeys.has(apiKey)) {
      this.sendUnauthorized(context.response, 'Invalid API Key');
      return;
    }

    context.state.set('apiKey', apiKey);
    await next();
  }

  /**
   * 提取API Key
   */
  private extractAPIKey(request: Request): string | null {
    // 从请求头提取
    const headerKey = request.headers.get(this.config.headerName);
    if (headerKey) {
      return headerKey;
    }

    // 从查询参数提取
    if (this.config.queryParamName) {
      const url = new URL(request.url);
      const queryKey = url.searchParams.get(this.config.queryParamName);
      if (queryKey) {
        return queryKey;
      }
    }

    return null;
  }

  /**
   * 发送未授权响应
   */
  private sendUnauthorized(response: Response, message: string): void {
    response.status = 401;
    response.headers.set('Content-Type', 'application/json');
    response.body = JSON.stringify({
      error: 'Unauthorized',
      message
    });
  }
}
```

---

## 3. 授权中间件

### 3.1 基于角色的授权

```typescript
/**
 * @file 授权中间件
 * @description 实现用户授权中间件
 * @module authz-middleware
 * @author YYC³
 * @version 1.0.0
 */

/**
 * 角色配置
 */
export interface RoleConfig {
  requiredRoles: string[];
  requireAll?: boolean; // true: 需要所有角色, false: 需要任一角色
}

/**
 * 基于角色的授权中间件
 */
export class RoleBasedAuthzMiddleware extends BaseMiddleware {
  constructor(private config: RoleConfig) {
    super({
      name: 'ROLE_BASED_AUTHZ',
      priority: 90,
      enabled: true
    });
  }

  /**
   * 执行授权
   */
  async execute(context: MiddlewareContext, next: () => Promise<void>): Promise<void> {
    const user = context.state.get('user') as UserPayload;

    if (!user) {
      this.sendForbidden(context.response, 'User not authenticated');
      return;
    }

    const hasPermission = this.checkPermission(user.role);

    if (!hasPermission) {
      this.sendForbidden(context.response, 'Insufficient permissions');
      return;
    }

    await next();
  }

  /**
   * 检查权限
   */
  private checkPermission(userRole: string): boolean {
    if (this.config.requireAll) {
      // 需要所有角色
      return this.config.requiredRoles.every(role => userRole === role);
    } else {
      // 需要任一角色
      return this.config.requiredRoles.includes(userRole);
    }
  }

  /**
   * 发送禁止访问响应
   */
  private sendForbidden(response: Response, message: string): void {
    response.status = 403;
    response.headers.set('Content-Type', 'application/json');
    response.body = JSON.stringify({
      error: 'Forbidden',
      message
    });
  }
}
```

### 3.2 基于权限的授权

```typescript
/**
 * 权限配置
 */
export interface PermissionConfig {
  requiredPermissions: string[];
  requireAll?: boolean;
}

/**
 * 基于权限的授权中间件
 */
export class PermissionBasedAuthzMiddleware extends BaseMiddleware {
  constructor(private config: PermissionConfig) {
    super({
      name: 'PERMISSION_BASED_AUTHZ',
      priority: 85,
      enabled: true
    });
  }

  /**
   * 执行授权
   */
  async execute(context: MiddlewareContext, next: () => Promise<void>): Promise<void> {
    const user = context.state.get('user') as UserPayload;

    if (!user) {
      this.sendForbidden(context.response, 'User not authenticated');
      return;
    }

    const hasPermission = this.checkPermission(user.permissions);

    if (!hasPermission) {
      this.sendForbidden(context.response, 'Insufficient permissions');
      return;
    }

    await next();
  }

  /**
   * 检查权限
   */
  private checkPermission(userPermissions: string[]): boolean {
    if (this.config.requireAll) {
      // 需要所有权限
      return this.config.requiredPermissions.every(permission =>
        userPermissions.includes(permission)
      );
    } else {
      // 需要任一权限
      return this.config.requiredPermissions.some(permission =>
        userPermissions.includes(permission)
      );
    }
  }

  /**
   * 发送禁止访问响应
   */
  private sendForbidden(response: Response, message: string): void {
    response.status = 403;
    response.headers.set('Content-Type', 'application/json');
    response.body = JSON.stringify({
      error: 'Forbidden',
      message
    });
  }
}
```

---

## 4. 日志中间件

### 4.1 请求日志

```typescript
/**
 * @file 日志中间件
 * @description 实现请求日志记录中间件
 * @module logging-middleware
 * @author YYC³
 * @version 1.0.0
 */

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

/**
 * 日志配置
 */
export interface LoggingConfig {
  level: LogLevel;
  format: 'JSON' | 'TEXT';
  includeHeaders?: boolean;
  includeBody?: boolean;
  maxBodySize?: number;
}

/**
 * 日志条目
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  ip?: string;
  userAgent?: string;
  headers?: Record<string, string>;
  body?: any;
  error?: string;
}

/**
 * 日志中间件
 */
export class LoggingMiddleware extends BaseMiddleware {
  constructor(private config: LoggingConfig) {
    super({
      name: 'LOGGING',
      priority: 50,
      enabled: true
    });
  }

  /**
   * 执行日志记录
   */
  async execute(context: MiddlewareContext, next: () => Promise<void>): Promise<void> {
    const startTime = Date.now();

    try {
      await next();

      const duration = Date.now() - startTime;
      const logEntry = this.createLogEntry(context, duration);

      this.log(logEntry);
    } catch (error) {
      const duration = Date.now() - startTime;
      const logEntry = this.createLogEntry(context, duration, error);

      this.log(logEntry);
      throw error;
    }
  }

  /**
   * 创建日志条目
   */
  private createLogEntry(
    context: MiddlewareContext,
    duration: number,
    error?: any
  ): LogEntry {
    const request = context.request;
    const response = context.response;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: error ? LogLevel.ERROR : this.getLogLevel(response.status),
      method: request.method,
      url: request.url,
      statusCode: response.status,
      duration
    };

    // 添加IP地址
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') ||
               'unknown';
    entry.ip = ip;

    // 添加User-Agent
    entry.userAgent = request.headers.get('user-agent') || undefined;

    // 添加请求头
    if (this.config.includeHeaders) {
      entry.headers = Object.fromEntries(request.headers.entries());
    }

    // 添加请求体
    if (this.config.includeBody && request.body) {
      const bodySize = this.config.maxBodySize || 1024;
      const bodyStr = JSON.stringify(request.body);
      entry.body = bodyStr.length > bodySize 
        ? bodyStr.substring(0, bodySize) + '...' 
        : request.body;
    }

    // 添加错误信息
    if (error) {
      entry.error = error.message || String(error);
    }

    return entry;
  }

  /**
   * 获取日志级别
   */
  private getLogLevel(statusCode: number): LogLevel {
    if (statusCode >= 500) {
      return LogLevel.ERROR;
    } else if (statusCode >= 400) {
      return LogLevel.WARN;
    } else {
      return LogLevel.INFO;
    }
  }

  /**
   * 记录日志
   */
  private log(entry: LogEntry): void {
    if (this.config.format === 'JSON') {
      console.log(JSON.stringify(entry));
    } else {
      const message = `[${entry.timestamp}] ${entry.level} ${entry.method} ${entry.url} ${entry.statusCode} ${entry.duration}ms`;
      console.log(message);
      
      if (entry.error) {
        console.error(entry.error);
      }
    }
  }
}
```

---

## 5. 错误处理中间件

### 5.1 全局错误处理

```typescript
/**
 * @file 错误处理中间件
 * @description 实现全局错误处理中间件
 * @module error-handling-middleware
 * @author YYC³
 * @version 1.0.0
 */

/**
 * 错误类型
 */
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

/**
 * 应用错误
 */
export class AppError extends Error {
  constructor(
    public type: ErrorType,
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * 错误响应
 */
export interface ErrorResponse {
  error: {
    type: ErrorType;
    message: string;
    statusCode: number;
    details?: any;
    timestamp: string;
    path: string;
  };
}

/**
 * 错误处理中间件
 */
export class ErrorHandlingMiddleware extends BaseMiddleware {
  constructor() {
    super({
      name: 'ERROR_HANDLING',
      priority: 10,
      enabled: true
    });
  }

  /**
   * 执行错误处理
   */
  async execute(context: MiddlewareContext, next: () => Promise<void>): Promise<void> {
    try {
      await next();
    } catch (error) {
      await this.handleError(error, context);
    }
  }

  /**
   * 处理错误
   */
  private async handleError(error: any, context: MiddlewareContext): Promise<void> {
    const response = context.response;
    const request = context.request;

    let appError: AppError;

    if (error instanceof AppError) {
      appError = error;
    } else {
      appError = new AppError(
        ErrorType.INTERNAL_ERROR,
        'An unexpected error occurred',
        500
      );
    }

    const errorResponse: ErrorResponse = {
      error: {
        type: appError.type,
        message: appError.message,
        statusCode: appError.statusCode,
        details: appError.details,
        timestamp: new Date().toISOString(),
        path: request.url
      }
    };

    // 在开发环境包含堆栈跟踪
    if (process.env.NODE_ENV === 'development') {
      errorResponse.error.details = {
        ...errorResponse.error.details,
        stack: error.stack
      };
    }

    response.status = appError.statusCode;
    response.headers.set('Content-Type', 'application/json');
    response.body = JSON.stringify(errorResponse);

    // 记录错误
    console.error('Error:', {
      type: appError.type,
      message: appError.message,
      stack: error.stack
    });
  }

  /**
   * 创建验证错误
   */
  static createValidationError(message: string, details?: any): AppError {
    return new AppError(
      ErrorType.VALIDATION_ERROR,
      message,
      400,
      details
    );
  }

  /**
   * 创建认证错误
   */
  static createAuthenticationError(message: string = 'Authentication failed'): AppError {
    return new AppError(
      ErrorType.AUTHENTICATION_ERROR,
      message,
      401
    );
  }

  /**
   * 创建授权错误
   */
  static createAuthorizationError(message: string = 'Authorization failed'): AppError {
    return new AppError(
      ErrorType.AUTHORIZATION_ERROR,
      message,
      403
    );
  }

  /**
   * 创建未找到错误
   */
  static createNotFoundError(message: string = 'Resource not found'): AppError {
    return new AppError(
      ErrorType.NOT_FOUND_ERROR,
      message,
      404
    );
  }
}
```

---

## 6. 限流中间件

### 6.1 请求限流

```typescript
/**
 * @file 限流中间件
 * @description 实现请求限流中间件
 * @module rate-limit-middleware
 * @author YYC³
 * @version 1.0.0
 */

/**
 * 限流配置
 */
export interface RateLimitConfig {
  windowMs: number; // 时间窗口(毫秒)
  maxRequests: number; // 最大请求数
  keyGenerator?: (request: Request) => string; // 自定义key生成器
  skipSuccessfulRequests?: boolean; // 跳过成功请求
  skipFailedRequests?: boolean; // 跳过失败请求
}

/**
 * 限流存储
 */
export interface RateLimitStorage {
  increment(key: string, windowMs: number): Promise<number>;
  reset(key: string): Promise<void>;
}

/**
 * 内存限流存储
 */
export class MemoryRateLimitStorage implements RateLimitStorage {
  private counters: Map<string, { count: number; resetTime: number }> = new Map();

  async increment(key: string, windowMs: number): Promise<number> {
    const now = Date.now();
    const entry = this.counters.get(key);

    if (!entry || now > entry.resetTime) {
      const newEntry = {
        count: 1,
        resetTime: now + windowMs
      };
      this.counters.set(key, newEntry);
      return 1;
    }

    entry.count++;
    return entry.count;
  }

  async reset(key: string): Promise<void> {
    this.counters.delete(key);
  }
}

/**
 * 限流中间件
 */
export class RateLimitMiddleware extends BaseMiddleware {
  constructor(
    private config: RateLimitConfig,
    private storage: RateLimitStorage = new MemoryRateLimitStorage()
  ) {
    super({
      name: 'RATE_LIMIT',
      priority: 80,
      enabled: true
    });
  }

  /**
   * 执行限流
   */
  async execute(context: MiddlewareContext, next: () => Promise<void>): Promise<void> {
    const key = this.generateKey(context.request);
    const currentCount = await this.storage.increment(key, this.config.windowMs);

    // 添加限流信息到响应头
    context.response.headers.set('X-RateLimit-Limit', this.config.maxRequests.toString());
    context.response.headers.set('X-RateLimit-Remaining', Math.max(0, this.config.maxRequests - currentCount).toString());

    if (currentCount > this.config.maxRequests) {
      this.sendTooManyRequests(context.response);
      return;
    }

    try {
      await next();

      // 根据配置决定是否重置计数
      if (this.config.skipSuccessfulRequests && context.response.status < 400) {
        await this.storage.reset(key);
      }
    } catch (error) {
      if (this.config.skipFailedRequests) {
        await this.storage.reset(key);
      }
      throw error;
    }
  }

  /**
   * 生成限流key
   */
  private generateKey(request: Request): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(request);
    }

    // 默认使用IP地址
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') ||
               'unknown';
    return `rate-limit:${ip}`;
  }

  /**
   * 发送请求过多响应
   */
  private sendTooManyRequests(response: Response): void {
    response.status = 429;
    response.headers.set('Content-Type', 'application/json');
    response.headers.set('Retry-After', Math.ceil(this.config.windowMs / 1000).toString());
    response.body = JSON.stringify({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Please try again later.`,
      retryAfter: Math.ceil(this.config.windowMs / 1000)
    });
  }
}
```

---

## 7. 缓存中间件

### 7.1 响应缓存

```typescript
/**
 * @file 缓存中间件
 * @description 实现响应缓存中间件
 * @module cache-middleware
 * @author YYC³
 * @version 1.0.0
 */

/**
 * 缓存配置
 */
export interface CacheConfig {
  ttl: number; // 缓存时间(秒)
  keyGenerator?: (request: Request) => string; // 自定义key生成器
  skipCache?: (request: Request) => boolean; // 跳过缓存的条件
  cacheControl?: boolean; // 添加Cache-Control头
}

/**
 * 缓存存储
 */
export interface CacheStorage {
  get(key: string): Promise<any | null>;
  set(key: string, value: any, ttl: number): Promise<void>;
  delete(key: string): Promise<void>;
}

/**
 * 内存缓存存储
 */
export class MemoryCacheStorage implements CacheStorage {
  private cache: Map<string, { value: any; expiry: number }> = new Map();

  async get(key: string): Promise<any | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl * 1000
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }
}

/**
 * 缓存中间件
 */
export class CacheMiddleware extends BaseMiddleware {
  constructor(
    private config: CacheConfig,
    private storage: CacheStorage = new MemoryCacheStorage()
  ) {
    super({
      name: 'CACHE',
      priority: 70,
      enabled: true
    });
  }

  /**
   * 执行缓存
   */
  async execute(context: MiddlewareContext, next: () => Promise<void>): Promise<void> {
    const request = context.request;
    const response = context.response;

    // 检查是否跳过缓存
    if (this.config.skipCache && this.config.skipCache(request)) {
      await next();
      return;
    }

    // 只缓存GET请求
    if (request.method !== 'GET') {
      await next();
      return;
    }

    const key = this.generateKey(request);

    // 尝试从缓存获取
    const cached = await this.storage.get(key);
    if (cached) {
      response.status = cached.status;
      response.headers = new Headers(cached.headers);
      response.body = cached.body;
      response.headers.set('X-Cache', 'HIT');
      return;
    }

    // 执行请求
    await next();

    // 缓存成功的GET请求
    if (response.status === 200) {
      await this.storage.set(key, {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: response.body
      }, this.config.ttl);

      response.headers.set('X-Cache', 'MISS');

      // 添加Cache-Control头
      if (this.config.cacheControl) {
        response.headers.set('Cache-Control', `public, max-age=${this.config.ttl}`);
      }
    }
  }

  /**
   * 生成缓存key
   */
  private generateKey(request: Request): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(request);
    }

    // 默认使用URL和查询参数
    return `cache:${request.method}:${request.url}`;
  }
}
```

---

## 8. CORS中间件

### 8.1 跨域资源共享

```typescript
/**
 * @file CORS中间件
 * @description 实现跨域资源共享中间件
 * @module cors-middleware
 * @author YYC³
 * @version 1.0.0
 */

/**
 * CORS配置
 */
export interface CORSConfig {
  origin: string | string[] | ((origin: string) => boolean);
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * CORS中间件
 */
export class CORSMiddleware extends BaseMiddleware {
  constructor(private config: CORSConfig) {
    super({
      name: 'CORS',
      priority: 60,
      enabled: true
    });
  }

  /**
   * 执行CORS
   */
  async execute(context: MiddlewareContext, next: () => Promise<void>): Promise<void> {
    const request = context.request;
    const response = context.response;

    const origin = request.headers.get('Origin');

    if (!origin) {
      await next();
      return;
    }

    // 检查origin是否允许
    const allowedOrigin = this.isOriginAllowed(origin);
    if (!allowedOrigin) {
      await next();
      return;
    }

    // 设置CORS头
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);

    // 设置允许的方法
    const methods = this.config.methods || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
    response.headers.set('Access-Control-Allow-Methods', methods.join(', '));

    // 设置允许的请求头
    const allowedHeaders = this.config.allowedHeaders || request.headers.get('Access-Control-Request-Headers') || '*';
    response.headers.set('Access-Control-Allow-Headers', allowedHeaders);

    // 设置暴露的响应头
    if (this.config.exposedHeaders) {
      response.headers.set('Access-Control-Expose-Headers', this.config.exposedHeaders.join(', '));
    }

    // 设置凭证
    if (this.config.credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    // 设置预检请求缓存时间
    if (this.config.maxAge) {
      response.headers.set('Access-Control-Max-Age', this.config.maxAge.toString());
    }

    // 处理预检请求
    if (request.method === 'OPTIONS') {
      response.status = 204;
      return;
    }

    await next();
  }

  /**
   * 检查origin是否允许
   */
  private isOriginAllowed(origin: string): string | boolean {
    if (typeof this.config.origin === 'function') {
      return this.config.origin(origin);
    }

    if (Array.isArray(this.config.origin)) {
      return this.config.origin.includes(origin) ? origin : false;
    }

    if (this.config.origin === '*') {
      return '*';
    }

    return this.config.origin === origin ? origin : false;
  }
}
```

---

## 9. 请求验证中间件

### 9.1 数据验证

```typescript
/**
 * @file 请求验证中间件
 * @description 实现请求数据验证中间件
 * @module validation-middleware
 * @author YYC³
 * @version 1.0.0
 */

import { z } from 'zod';

/**
 * 验证配置
 */
export interface ValidationConfig {
  body?: z.ZodSchema<any>;
  query?: z.ZodSchema<any>;
  params?: z.ZodSchema<any>;
}

/**
 * 验证中间件
 */
export class ValidationMiddleware extends BaseMiddleware {
  constructor(private config: ValidationConfig) {
    super({
      name: 'VALIDATION',
      priority: 75,
      enabled: true
    });
  }

  /**
   * 执行验证
   */
  async execute(context: MiddlewareContext, next: () => Promise<void>): Promise<void> {
    const request = context.request;
    const errors: any[] = [];

    // 验证请求体
    if (this.config.body) {
      try {
        const body = await this.parseBody(request);
        const validated = this.config.body.parse(body);
        context.state.set('validatedBody', validated);
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push({
            location: 'body',
            errors: error.errors
          });
        }
      }
    }

    // 验证查询参数
    if (this.config.query) {
      try {
        const url = new URL(request.url);
        const query = Object.fromEntries(url.searchParams.entries());
        const validated = this.config.query.parse(query);
        context.state.set('validatedQuery', validated);
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push({
            location: 'query',
            errors: error.errors
          });
        }
      }
    }

    // 验证路径参数
    if (this.config.params) {
      try {
        const params = this.extractParams(request.url);
        const validated = this.config.params.parse(params);
        context.state.set('validatedParams', validated);
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push({
            location: 'params',
            errors: error.errors
          });
        }
      }
    }

    // 如果有验证错误，返回错误响应
    if (errors.length > 0) {
      this.sendValidationError(context.response, errors);
      return;
    }

    await next();
  }

  /**
   * 解析请求体
   */
  private async parseBody(request: Request): Promise<any> {
    const contentType = request.headers.get('Content-Type') || '';

    if (contentType.includes('application/json')) {
      return await request.json();
    }

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      return Object.fromEntries(formData.entries());
    }

    return {};
  }

  /**
   * 提取路径参数
   */
  private extractParams(url: string): any {
    // 简化实现，实际应该从路由中提取
    const parts = url.split('/').filter(Boolean);
    return { parts };
  }

  /**
   * 发送验证错误响应
   */
  private sendValidationError(response: Response, errors: any[]): void {
    response.status = 400;
    response.headers.set('Content-Type', 'application/json');
    response.body = JSON.stringify({
      error: 'Validation Error',
      message: 'Request validation failed',
      details: errors
    });
  }
}
```

---

## 10. 性能监控中间件

### 10.1 性能指标收集

```typescript
/**
 * @file 性能监控中间件
 * @description 实现性能监控中间件
 * @module performance-middleware
 * @author YYC³
 * @version 1.0.0
 */

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  timestamp: string;
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  memoryUsage?: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  cpuUsage?: {
    user: number;
    system: number;
  };
}

/**
 * 性能监控配置
 */
export interface PerformanceMonitoringConfig {
  collectMemoryUsage?: boolean;
  collectCPUUsage?: boolean;
  slowRequestThreshold?: number; // 慢请求阈值(毫秒)
  metricsCollector?: (metrics: PerformanceMetrics) => void;
}

/**
 * 性能监控中间件
 */
export class PerformanceMonitoringMiddleware extends BaseMiddleware {
  constructor(private config: PerformanceMonitoringConfig) {
    super({
      name: 'PERFORMANCE_MONITORING',
      priority: 40,
      enabled: true
    });
  }

  /**
   * 执行性能监控
   */
  async execute(context: MiddlewareContext, next: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    const startCpuUsage = this.config.collectCPUUsage ? process.cpuUsage() : undefined;

    try {
      await next();

      const duration = Date.now() - startTime;
      const metrics = this.createMetrics(context, duration, startCpuUsage);

      // 检查是否为慢请求
      if (this.config.slowRequestThreshold && duration > this.config.slowRequestThreshold) {
        console.warn(`Slow request detected: ${metrics.method} ${metrics.url} took ${duration}ms`);
      }

      // 收集指标
      if (this.config.metricsCollector) {
        this.config.metricsCollector(metrics);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const metrics = this.createMetrics(context, duration, startCpuUsage, error);

      if (this.config.metricsCollector) {
        this.config.metricsCollector(metrics);
      }

      throw error;
    }
  }

  /**
   * 创建性能指标
   */
  private createMetrics(
    context: MiddlewareContext,
    duration: number,
    startCpuUsage?: NodeJS.CpuUsage,
    error?: any
  ): PerformanceMetrics {
    const request = context.request;
    const response = context.response;

    const metrics: PerformanceMetrics = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      statusCode: response.status,
      duration
    };

    // 收集内存使用
    if (this.config.collectMemoryUsage) {
      const memoryUsage = process.memoryUsage();
      metrics.memoryUsage = {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external
      };
    }

    // 收集CPU使用
    if (this.config.collectCPUUsage && startCpuUsage) {
      const cpuUsage = process.cpuUsage(startCpuUsage);
      metrics.cpuUsage = {
        user: cpuUsage.user,
        system: cpuUsage.system
      };
    }

    return metrics;
  }

  /**
   * 获取性能统计
   */
  static getStatistics(metrics: PerformanceMetrics[]): {
    totalRequests: number;
    averageDuration: number;
    maxDuration: number;
    minDuration: number;
    successRate: number;
    errorRate: number;
  } {
    if (metrics.length === 0) {
      return {
        totalRequests: 0,
        averageDuration: 0,
        maxDuration: 0,
        minDuration: 0,
        successRate: 0,
        errorRate: 0
      };
    }

    const durations = metrics.map(m => m.duration);
    const successCount = metrics.filter(m => m.statusCode < 400).length;
    const errorCount = metrics.length - successCount;

    return {
      totalRequests: metrics.length,
      averageDuration: durations.reduce((a, b) => a + b, 0) / metrics.length,
      maxDuration: Math.max(...durations),
      minDuration: Math.min(...durations),
      successRate: (successCount / metrics.length) * 100,
      errorRate: (errorCount / metrics.length) * 100
    };
  }
}
```

---

## 📄 文档标尾 (Footer)

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」




## 概述

### 架构概述

本架构文档详细描述了系统的整体架构设计，包括架构目标、设计原则、技术选型等关键信息。

#### 架构目标

- **高可用性**：确保系统稳定运行，故障自动恢复
- **高性能**：响应迅速，资源利用高效
- **高安全性**：数据加密，权限严格控制
- **高扩展性**：模块化设计，易于功能扩展
- **高可维护性**：代码清晰，文档完善

#### 设计原则

- **单一职责**：每个组件只负责一个功能
- **开闭原则**：对扩展开放，对修改关闭
- **依赖倒置**：依赖抽象而非具体实现
- **接口隔离**：使用细粒度的接口
- **迪米特法则**：最少知识原则



## 架构设计

### 架构设计

#### 整体架构

系统采用分层架构设计，包括：

- **表现层**：负责用户界面和交互
- **应用层**：处理业务逻辑
- **业务层**：实现核心业务功能
- **数据层**：管理数据存储和访问
- **基础设施层**：提供基础服务支持

#### 模块划分

系统划分为多个独立模块，每个模块负责特定功能：

- **用户模块**：用户管理和认证
- **订单模块**：订单处理和管理
- **支付模块**：支付集成和处理
- **通知模块**：消息通知和推送
- **报表模块**：数据统计和分析

#### 技术选型

- **前端框架**：React / Vue
- **后端框架**：Node.js / Express / Fastify
- **数据库**：PostgreSQL / MongoDB
- **缓存**：Redis
- **消息队列**：RabbitMQ / Kafka



## 技术实现

### 技术实现

#### 核心技术栈

```typescript
// 核心依赖
{
  "dependencies": {
    "react": "^18.0.0",
    "typescript": "^5.0.0",
    "express": "^4.18.0",
    "prisma": "^5.0.0",
    "redis": "^4.6.0"
  }
}
```

#### 关键实现

1. **服务层实现**
```typescript
class UserService {
  async createUser(data: CreateUserDto): Promise<User> {
    // 验证输入
    this.validateUserData(data);
    
    // 加密密码
    const hashedPassword = await this.hashPassword(data.password);
    
    // 创建用户
    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword
    });
    
    return user;
  }
}
```

2. **中间件实现**
```typescript
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: '未授权访问' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: '令牌无效' });
  }
};
```



## 部署方案

### 部署方案

#### 部署架构

采用容器化部署方案，使用Docker和Kubernetes进行编排。

#### 部署步骤

1. **环境准备**
```bash
# 安装Docker
curl -fsSL https://get.docker.com | sh

# 安装Kubernetes
# 根据操作系统选择相应的安装方式
```

2. **构建镜像**
```bash
# 构建应用镜像
docker build -t yyc3-app:latest .

# 推送到镜像仓库
docker push registry.example.com/yyc3-app:latest
```

3. **部署到Kubernetes**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: yyc3-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: yyc3-app
  template:
    metadata:
      labels:
        app: yyc3-app
    spec:
      containers:
      - name: app
        image: registry.example.com/yyc3-app:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
```

4. **配置服务**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: yyc3-app-service
spec:
  selector:
    app: yyc3-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```



## 性能优化

### 性能优化

#### 前端优化

1. **代码分割**
```typescript
// 路由级别代码分割
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Suspense>
  );
}
```

2. **缓存策略**
```typescript
// React.memo 避免不必要的重渲染
const MemoizedComponent = React.memo(({ data }) => {
  return <div>{data.value}</div>;
});

// useMemo 缓存计算结果
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

#### 后端优化

1. **数据库优化**
```typescript
// 使用索引
CREATE INDEX idx_user_email ON users(email);

// 查询优化
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true
  },
  where: {
    active: true
  },
  take: 100
});
```

2. **缓存策略**
```typescript
// Redis缓存
async function getUser(id: string): Promise<User> {
  const cacheKey = `user:${id}`;
  
  // 尝试从缓存获取
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // 从数据库获取
  const user = await prisma.user.findUnique({ where: { id } });
  
  // 写入缓存
  await redis.setex(cacheKey, 3600, JSON.stringify(user));
  
  return user;
}
```



## 安全考虑

### 安全考虑

#### 认证与授权

1. **JWT认证**
```typescript
// 生成JWT令牌
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// 验证JWT令牌
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

2. **RBAC授权**
```typescript
// 角色权限检查
function checkPermission(user: User, resource: string, action: string): boolean {
  const permissions = rolePermissions[user.role];
  return permissions.some(p => 
    p.resource === resource && p.actions.includes(action)
  );
}
```

#### 数据保护

1. **输入验证**
```typescript
// 使用Zod进行输入验证
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/),
  name: z.string().min(2)
});

const validated = createUserSchema.parse(input);
```

2. **数据加密**
```typescript
// 使用bcrypt加密密码
const hashedPassword = await bcrypt.hash(password, 10);

// 验证密码
const isValid = await bcrypt.compare(password, hashedPassword);
```

#### 安全头配置

```typescript
// Express安全头配置
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true
}));
```



## 监控告警

### 监控告警

#### 监控指标

1. **系统指标**
- CPU使用率
- 内存使用率
- 磁盘使用率
- 网络I/O

2. **应用指标**
- 请求量(RPS)
- 响应时间
- 错误率
- 并发用户数

3. **业务指标**
- 用户注册数
- 订单创建数
- 支付成功率
- 用户活跃度

#### 监控工具

```typescript
// Prometheus指标收集
import { Counter, Histogram, Gauge } from 'prom-client';

const requestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const responseTime = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route']
});

// 使用中间件记录指标
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    requestCounter.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode
    });
    responseTime.observe({
      method: req.method,
      route: req.route?.path || req.path
    }, duration);
  });
  
  next();
});
```

#### 告警规则

```yaml
groups:
- name: api_alerts
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "API错误率过高"
      description: "5分钟内错误率超过5%"
  
  - alert: HighResponseTime
    expr: histogram_quantile(0.95, http_request_duration_seconds) > 1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "API响应时间过长"
      description: "95%分位响应时间超过1秒"
```



## 最佳实践

### 最佳实践

#### 代码规范

1. **命名规范**
```typescript
// 变量：camelCase
const userName = 'John';

// 常量：UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;

// 类：PascalCase
class UserService { }

// 接口：PascalCase，前缀I（可选）
interface IUserService { }
```

2. **注释规范**
```typescript
/**
 * 创建用户
 * @param email - 用户邮箱
 * @param password - 用户密码
 * @returns 创建的用户对象
 * @throws {Error} 当邮箱已存在时抛出错误
 */
async function createUser(
  email: string, 
  password: string
): Promise<User> {
  // 实现
}
```

#### 错误处理

```typescript
// 统一错误处理
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 使用错误处理中间件
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }
  
  // 记录未预期的错误
  logger.error('Unexpected error:', err);
  
  return res.status(500).json({
    success: false,
    error: '服务器内部错误'
  });
});
```

#### 日志记录

```typescript
// 结构化日志
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// 使用日志
logger.info('User created', { userId: user.id, email: user.email });
logger.error('Database connection failed', { error: error.message });
```



## 最佳实践

### 最佳实践

#### 代码规范

1. **命名规范**
```typescript
// 变量：camelCase
const userName = 'John';

// 常量：UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;

// 类：PascalCase
class UserService { }

// 接口：PascalCase，前缀I（可选）
interface IUserService { }
```

2. **注释规范**
```typescript
/**
 * 创建用户
 * @param email - 用户邮箱
 * @param password - 用户密码
 * @returns 创建的用户对象
 * @throws {Error} 当邮箱已存在时抛出错误
 */
async function createUser(
  email: string, 
  password: string
): Promise<User> {
  // 实现
}
```

#### 错误处理

```typescript
// 统一错误处理
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 使用错误处理中间件
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }
  
  // 记录未预期的错误
  logger.error('Unexpected error:', err);
  
  return res.status(500).json({
    success: false,
    error: '服务器内部错误'
  });
});
```

#### 日志记录

```typescript
// 结构化日志
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// 使用日志
logger.info('User created', { userId: user.id, email: user.email });
logger.error('Database connection failed', { error: error.message });
```


## 相关文档

- [数据访问层架构实现文档](YYC3-Cater-开发实施/架构类/03-YYC3-Cater--架构类-数据访问层架构实现文档.md) - YYC3-Cater-开发实施/架构类
- [AI模型开发与集成文档](YYC3-Cater-开发实施/架构类/05-YYC3-Cater--架构类-AI模型开发与集成文档.md) - YYC3-Cater-开发实施/架构类
- [API接口实现文档](YYC3-Cater-开发实施/架构类/02-YYC3-Cater--架构类-API接口实现文档.md) - YYC3-Cater-开发实施/架构类
- [代码架构实现说明书](YYC3-Cater-开发实施/架构类/01-YYC3-Cater--架构类-代码架构实现说明书.md) - YYC3-Cater-开发实施/架构类
- [YYC3 智枢服务化平台 - 自动迭代实施计划资源准备清单](YYC3-Cater-开发实施/架构类/11-YYC3-Cater--架构类-自动迭代实施计划资源准备清单.md) - YYC3-Cater-开发实施/架构类
