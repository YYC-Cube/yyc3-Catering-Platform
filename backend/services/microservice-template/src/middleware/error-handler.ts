/**
 * @fileoverview 全局错误处理器
 * @description 统一处理应用中的所有错误
 * @module middleware/error-handler
 * @author YYC³ Development Team <dev@yyc3.red>
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { CustomException } from '../exceptions/CustomException';
import { ErrorCode, ErrorMessage } from '../types/error';
import { ApiResponse } from '../types/response';
import logger from '../config/logger';

/**
 * 全局错误处理器
 * @param err 错误对象
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  // 记录错误信息
  logger.error('Error occurred:', {
    error: err,
    url: req.url,
    method: req.method,
    params: req.params,
    query: req.query,
    body: req.body,
    user: req.user,
    headers: {
      'user-agent': req.headers['user-agent'],
      'x-request-id': req.headers['x-request-id'],
    },
  });
  
  // 获取跟踪ID
  const traceId = req.headers['x-request-id'] as string;
  
  // 初始化响应对象
  let response: ApiResponse = {
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    message: ErrorMessage[ErrorCode.INTERNAL_SERVER_ERROR],
    timestamp: new Date().toISOString(),
    traceId,
  };
  
  // 处理自定义异常
  if (err instanceof CustomException) {
    response.code = err.code;
    response.message = err.message;
    
    // 开发环境下返回详细信息
    if (process.env.NODE_ENV === 'development') {
      response.data = err.details;
    }
  }
  // 处理Zod验证错误
  else if (err.name === 'ZodError') {
    response.code = ErrorCode.VALIDATION_ERROR;
    response.message = '参数验证失败';
    response.data = err.errors;
  }
  // 处理Sequelize验证错误
  else if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    response.code = ErrorCode.VALIDATION_ERROR;
    response.message = '数据验证失败';
    response.data = err.errors.map((error: any) => ({
      field: error.path,
      message: error.message,
    }));
  }
  // 处理404错误
  else if (err.name === 'NotFoundError') {
    response.code = ErrorCode.NOT_FOUND;
    response.message = ErrorMessage[ErrorCode.NOT_FOUND];
  }
  // 处理其他错误
  else {
    // 开发环境下返回详细错误信息
    if (process.env.NODE_ENV === 'development') {
      response.message = err.message;
      response.data = {
        name: err.name,
        stack: err.stack,
        details: err,
      };
    }
  }
  
  // 设置HTTP状态码
  let statusCode: number;
  if (response.code >= 100 && response.code < 600) {
    statusCode = response.code;
  } else {
    // 业务错误码映射到合适的HTTP状态码
    switch (Math.floor(response.code / 1000)) {
      case 1: // 业务错误
        statusCode = 400;
        break;
      case 2: // 认证授权错误
        statusCode = 401;
        break;
      case 3: // 数据库错误
        statusCode = 500;
        break;
      case 4: // 文件错误
        statusCode = 400;
        break;
      default:
        statusCode = 500;
    }
  }
  
  // 发送响应
  res.status(statusCode).json(response);
};

/**
 * 404错误处理器
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new CustomException(ErrorCode.NOT_FOUND, `Route not found: ${req.method} ${req.url}`);
  next(error);
};

export {
  errorHandler,
  notFoundHandler,
};
