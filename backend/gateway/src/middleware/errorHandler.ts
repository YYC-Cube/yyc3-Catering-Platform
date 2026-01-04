/**
 * @file 错误处理中间件
 * @description YYC³餐饮行业智能化平台 - 全局错误处理中间件
 * @module middleware/errorHandler
 * @author YYC³
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// 定义错误响应接口
interface ErrorResponse {
  success: boolean;
  message: string;
  code: string;
  status?: number;
  stack?: string;
  timestamp: string;
}

// 定义应用错误类
export class AppError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = 'AppError';
  }
}

/**
 * 全局错误处理中间件
 */
export const errorHandler = (err: Error | unknown, req: Request, res: Response, next: NextFunction): void => {
  // 默认错误配置
  let errorResponse: ErrorResponse = {
    success: false,
    message: 'Internal Server Error',
    code: 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString()
  };

  let statusCode = 500;
  let error = err instanceof Error ? err : new Error(String(err));

  // 处理应用错误
  if (error instanceof AppError) {
    statusCode = error.status;
    errorResponse = {
      ...errorResponse,
      message: error.message,
      code: error.code
    };
  } else if (error instanceof Error) {
    // 处理原生错误
    statusCode = 500;
    errorResponse = {
      ...errorResponse,
      message: error.message || 'Internal Server Error',
      code: 'INTERNAL_SERVER_ERROR'
    };
  } else {
    // 处理其他类型错误
    statusCode = 500;
    errorResponse = {
      ...errorResponse,
      message: String(err) || 'Internal Server Error',
      code: 'INTERNAL_SERVER_ERROR'
    };
  }

  // 开发环境显示堆栈信息
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
  }

  // 记录错误日志
  logger.error('Error occurred', {
    error: error.message,
    code: errorResponse.code,
    status: statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
    email: req.user?.email,
    roles: req.user?.roles,
    context: req.context,
    stack: error.stack
  });

  // 发送错误响应
  res.status(statusCode).json(errorResponse);
};

/**
 * 异步错误包装器
 */
export const asyncHandler = <T extends (...args: any[]) => Promise<any>>(
  fn: T
): ((...args: Parameters<T>) => void) => {
  return (...args: Parameters<T>) => {
    fn(...args).catch(args[2]); // args[2] 是 next 函数
  };
};
