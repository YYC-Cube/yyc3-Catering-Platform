/**
 * YYC³餐饮行业智能化平台 - 错误处理中间件
 * @description 统一的错误处理、日志记录和响应格式化
 * @author YYC³
 * @version 1.0.0
 */

import { Context } from 'hono'
import { logger } from '../utils/logger'
import { HTTPStatus } from '../utils/httpStatus'

/**
 * 自定义错误类
 */
export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean
  public code?: string
  public details?: any

  constructor(
    message: string,
    statusCode: number = HTTPStatus.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
    code?: string,
    details?: any
  ) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.code = code
    this.details = details

    // 确保错误堆栈正确
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * 验证错误类
 */
export class ValidationError extends AppError {
  public field: string
  public value: any

  constructor(
    message: string,
    field: string,
    value?: any,
    statusCode: number = HTTPStatus.BAD_REQUEST
  ) {
    super(message, statusCode, true, 'VALIDATION_ERROR')
    this.field = field
    this.value = value
    this.name = 'ValidationError'
  }
}

/**
 * 认证错误类
 */
export class AuthenticationError extends AppError {
  constructor(message: string = '认证失败') {
    super(message, HTTPStatus.UNAUTHORIZED, true, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

/**
 * 授权错误类
 */
export class AuthorizationError extends AppError {
  constructor(message: string = '权限不足') {
    super(message, HTTPStatus.FORBIDDEN, true, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

/**
 * 资源未找到错误类
 */
export class NotFoundError extends AppError {
  constructor(resource: string = '资源') {
    super(`${resource}未找到`, HTTPStatus.NOT_FOUND, true, 'NOT_FOUND_ERROR')
    this.name = 'NotFoundError'
  }
}

/**
 * 冲突错误类
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, HTTPStatus.CONFLICT, true, 'CONFLICT_ERROR')
    this.name = 'ConflictError'
  }
}

/**
 * 业务逻辑错误类
 */
export class BusinessError extends AppError {
  constructor(message: string, details?: any) {
    super(message, HTTPStatus.BAD_REQUEST, true, 'BUSINESS_ERROR', details)
    this.name = 'BusinessError'
  }
}

/**
 * 外部服务错误类
 */
export class ExternalServiceError extends AppError {
  public serviceName: string

  constructor(serviceName: string, message: string = '外部服务错误') {
    super(message, HTTPStatus.BAD_GATEWAY, true, 'EXTERNAL_SERVICE_ERROR', { serviceName })
    this.serviceName = serviceName
    this.name = 'ExternalServiceError'
  }
}

/**
 * 数据库错误类
 */
export class DatabaseError extends AppError {
  public query?: string

  constructor(message: string, query?: string) {
    super(message, HTTPStatus.INTERNAL_SERVER_ERROR, true, 'DATABASE_ERROR', { query })
    this.query = query
    this.name = 'DatabaseError'
  }
}

/**
 * 限流错误类
 */
export class RateLimitError extends AppError {
  public retryAfter?: number

  constructor(message: string = '请求过于频繁', retryAfter?: number) {
    super(message, HTTPStatus.TOO_MANY_REQUESTS, true, 'RATE_LIMIT_ERROR', { retryAfter })
    this.retryAfter = retryAfter
    this.name = 'RateLimitError'
  }
}

/**
 * 错误响应接口
 */
export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    statusCode: number
    details?: any
    field?: string
    value?: any
    timestamp: string
    requestId?: string
  }
  stack?: string // 仅开发环境
}

/**
 * 生产环境错误信息清理
 */
function sanitizeError(error: AppError, isDevelopment: boolean = false): Partial<AppError> {
  if (isDevelopment) {
    return error
  }

  // 生产环境不暴露敏感信息
  const sanitized: Partial<AppError> = {
    message: error.message,
    statusCode: error.statusCode,
    code: error.code,
    isOperational: error.isOperational
  }

  // 保留业务错误详情
  if (error.isOperational && error.details) {
    sanitized.details = error.details
  }

  return sanitized
}

/**
 * 格式化错误响应
 */
function formatErrorResponse(
  error: AppError,
  requestId?: string,
  isDevelopment: boolean = false
): ErrorResponse {
  const sanitized = sanitizeError(error, isDevelopment)

  const response: ErrorResponse = {
    success: false,
    error: {
      code: sanitized.code || 'INTERNAL_ERROR',
      message: sanitized.message || '服务器内部错误',
      statusCode: sanitized.statusCode || HTTPStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      requestId
    }
  }

  // 添加额外信息
  if (sanitized.details) {
    response.error.details = sanitized.details
  }

  // 验证错误特殊处理
  if (error instanceof ValidationError) {
    response.error.field = error.field
    response.error.value = error.value
  }

  // 开发环境添加堆栈信息
  if (isDevelopment && error.stack) {
    response.stack = error.stack
  }

  return response
}

/**
 * 获取请求上下文信息
 */
function getRequestContext(c: Context): {
  requestId: string
  method: string
  url: string
  userAgent?: string
  ip?: string
  userId?: string
} {
  return {
    requestId: c.get('requestId') || 'unknown',
    method: c.req.method,
    url: c.req.url,
    userAgent: c.req.header('user-agent'),
    ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || c.req.header('cf-connecting-ip') || 'unknown',
    userId: c.get('userId')
  }
}

/**
 * 主错误处理中间件
 */
export function errorHandler(error: Error, c: Context) {
  const context = getRequestContext(c)
  const isDevelopment = process.env.NODE_ENV === 'development'

  // 如果已经是AppError实例，直接使用
  if (error instanceof AppError) {
    // 记录错误日志
    logger.error('Application error occurred', {
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        stack: error.stack,
        details: error.details
      },
      request: context,
      isOperational: error.isOperational
    })

    // 非操作性错误需要额外关注
    if (!error.isOperational) {
      logger.error('Non-operational error detected - potential bug', {
        error: error.stack,
        request: context
      })
    }

    const response = formatErrorResponse(error, context.requestId, isDevelopment)

    // 设置响应头
    c.header('Content-Type', 'application/json')
    c.header('X-Request-ID', context.requestId)

    // 限流错误设置Retry-After头
    if (error instanceof RateLimitError && error.retryAfter) {
      c.header('Retry-After', error.retryAfter.toString())
    }

    return c.json(response, error.statusCode)
  }

  // 处理非AppError（如语法错误、类型错误等）
  logger.error('Unexpected error occurred', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    request: context
  })

  // 创建通用错误响应
  const genericError = new AppError(
    isDevelopment ? error.message : '服务器内部错误',
    HTTPStatus.INTERNAL_SERVER_ERROR,
    true,
    'INTERNAL_ERROR'
  )

  const response = formatErrorResponse(genericError, context.requestId, isDevelopment)

  c.header('Content-Type', 'application/json')
  c.header('X-Request-ID', context.requestId)

  return c.json(response, HTTPStatus.INTERNAL_SERVER_ERROR)
}

/**
 * 异步错误包装器
 */
export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return (...args: T) => {
    const Promise = args[0] instanceof Function ? Promise : globalThis.Promise
    return fn(...args).catch((error: Error) => {
      throw error instanceof AppError ? error : new AppError(error.message)
    })
  }
}

/**
 * 错误边界装饰器
 */
export function catchError(
  errorMessage: string = '操作失败',
  statusCode: number = HTTPStatus.INTERNAL_SERVER_ERROR,
  code?: string
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      try {
        return await method.apply(this, args)
      } catch (error) {
        if (error instanceof AppError) {
          throw error
        }
        throw new AppError(errorMessage, statusCode, true, code)
      }
    }

    return descriptor
  }
}

/**
 * 重试机制装饰器
 */
export function retry(
  maxRetries: number = 3,
  delay: number = 1000,
  backoff: number = 2
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      let lastError: Error

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await method.apply(this, args)
        } catch (error) {
          lastError = error as Error

          // 不重试操作性错误
          if (error instanceof AppError && !error.isOperational) {
            throw error
          }

          // 最后一次尝试不再延迟
          if (attempt === maxRetries) {
            break
          }

          // 计算延迟时间
          const currentDelay = delay * Math.pow(backoff, attempt)
          await new Promise(resolve => setTimeout(resolve, currentDelay))
        }
      }

      throw lastError
    }

    return descriptor
  }
}

/**
 * 404错误处理
 */
export function notFoundHandler(c: Context) {
  const context = getRequestContext(c)
  const isDevelopment = process.env.NODE_ENV === 'development'

  const error = new NotFoundError('API端点')

  logger.warn('404 Not Found', {
    error: error.message,
    request: context
  })

  const response = formatErrorResponse(error, context.requestId, isDevelopment)

  c.header('Content-Type', 'application/json')
  c.header('X-Request-ID', context.requestId)

  return c.json(response, HTTPStatus.NOT_FOUND)
}

/**
 * 验证中间件
 */
export function validateBody(schema: any) {
  return async (c: Context, next: () => Promise<void>) => {
    try {
      const body = await c.req.json()
      const { error, value } = schema.validate(body)

      if (error) {
        const details = error.details.map((detail: any) => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }))

        throw new ValidationError(
          '请求参数验证失败',
          'validation',
          details,
          HTTPStatus.BAD_REQUEST
        )
      }

      // 将验证后的数据附加到上下文
      c.set('validatedBody', value)
      await next()
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new ValidationError('请求体格式错误', 'body', error)
    }
  }
}

/**
 * 异常统计
 */
export class ErrorStats {
  private static instance: ErrorStats
  private errors: Map<string, { count: number; lastOccurred: Date }> = new Map()

  static getInstance(): ErrorStats {
    if (!ErrorStats.instance) {
      ErrorStats.instance = new ErrorStats()
    }
    return ErrorStats.instance
  }

  recordError(error: AppError): void {
    const key = `${error.code || error.name}:${error.message}`
    const existing = this.errors.get(key)

    if (existing) {
      existing.count++
      existing.lastOccurred = new Date()
    } else {
      this.errors.set(key, {
        count: 1,
        lastOccurred: new Date()
      })
    }

    // 如果错误频率过高，记录警告
    if (existing && existing.count >= 10) {
      logger.warn('High frequency error detected', {
        errorKey: key,
        count: existing.count,
        lastOccurred: existing.lastOccurred
      })
    }
  }

  getStats(): Array<{ errorKey: string; count: number; lastOccurred: Date }> {
    return Array.from(this.errors.entries()).map(([errorKey, stats]) => ({
      errorKey,
      ...stats
    }))
  }

  clear(): void {
    this.errors.clear()
  }
}