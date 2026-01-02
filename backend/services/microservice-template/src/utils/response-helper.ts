/**
 * @fileoverview 响应工具函数
 * @description 提供统一的API响应格式
 * @module utils/response-helper
 * @author YYC³ Development Team <dev@yyc3.red>
 * @version 1.0.0
 */

import { Response } from 'express';
import { ApiResponse, PaginationResponse } from '../types/response';
import { ErrorCode, ErrorMessage } from '../types/error';

/**
 * 生成成功响应
 * @param res 响应对象
 * @param data 响应数据
 * @param message 响应消息
 * @param statusCode HTTP状态码
 */
export const successResponse = <T = any>(
  res: Response,
  data?: T,
  message: string = ErrorMessage[ErrorCode.SUCCESS],
  statusCode: number = ErrorCode.SUCCESS,
): Response => {
  const response: ApiResponse<T> = {
    code: statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
    traceId: res.getHeader('x-request-id') as string,
  };
  
  return res.status(statusCode).json(response);
};

/**
 * 生成分页响应
 * @param res 响应对象
 * @param items 数据列表
 * @param page 当前页码
 * @param limit 每页大小
 * @param total 总记录数
 * @param message 响应消息
 * @param statusCode HTTP状态码
 */
export const paginationResponse = <T = any>(
  res: Response,
  items: T[],
  page: number,
  limit: number,
  total: number,
  message: string = ErrorMessage[ErrorCode.SUCCESS],
  statusCode: number = ErrorCode.SUCCESS,
): Response => {
  // 计算总页数
  const totalPages = Math.ceil(total / limit);
  
  // 计算是否有下一页和上一页
  const hasNext = page < totalPages;
  const hasPrevious = page > 1;
  
  // 构造分页数据
  const paginationData: PaginationResponse<T> = {
    items,
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrevious,
  };
  
  // 构造响应对象
  const response: ApiResponse<PaginationResponse<T>> = {
    code: statusCode,
    message,
    data: paginationData,
    timestamp: new Date().toISOString(),
    traceId: res.getHeader('x-request-id') as string,
  };
  
  return res.status(statusCode).json(response);
};

/**
 * 生成错误响应
 * @param res 响应对象
 * @param code 错误码
 * @param message 错误消息
 * @param statusCode HTTP状态码
 * @param details 详细信息
 */
export const errorResponse = (
  res: Response,
  code: ErrorCode,
  message?: string,
  statusCode?: number,
  details?: any,
): Response => {
  // 初始化响应对象
  const response: ApiResponse = {
    code,
    message: message || ErrorMessage[code],
    timestamp: new Date().toISOString(),
    traceId: res.getHeader('x-request-id') as string,
  };
  
  // 添加详细信息
  if (details && process.env.NODE_ENV === 'development') {
    response.data = details;
  }
  
  // 设置HTTP状态码
  const finalStatusCode = statusCode || (code >= 100 && code < 600 ? code : 500);
  
  return res.status(finalStatusCode).json(response);
};

/**
 * 生成404响应
 * @param res 响应对象
 * @param message 错误消息
 */
export const notFoundResponse = (
  res: Response,
  message: string = ErrorMessage[ErrorCode.NOT_FOUND],
): Response => {
  return errorResponse(res, ErrorCode.NOT_FOUND, message, 404);
};

/**
 * 生成401响应
 * @param res 响应对象
 * @param message 错误消息
 */
export const unauthorizedResponse = (
  res: Response,
  message: string = ErrorMessage[ErrorCode.UNAUTHORIZED],
): Response => {
  return errorResponse(res, ErrorCode.UNAUTHORIZED, message, 401);
};

/**
 * 生成403响应
 * @param res 响应对象
 * @param message 错误消息
 */
export const forbiddenResponse = (
  res: Response,
  message: string = ErrorMessage[ErrorCode.FORBIDDEN],
): Response => {
  return errorResponse(res, ErrorCode.FORBIDDEN, message, 403);
};

/**
 * 生成400响应
 * @param res 响应对象
 * @param message 错误消息
 * @param details 详细信息
 */
export const badRequestResponse = (
  res: Response,
  message: string = ErrorMessage[ErrorCode.BAD_REQUEST],
  details?: any,
): Response => {
  return errorResponse(res, ErrorCode.BAD_REQUEST, message, 400, details);
};

/**
 * 生成500响应
 * @param res 响应对象
 * @param message 错误消息
 * @param details 详细信息
 */
export const internalServerErrorResponse = (
  res: Response,
  message: string = ErrorMessage[ErrorCode.INTERNAL_SERVER_ERROR],
  details?: any,
): Response => {
  return errorResponse(res, ErrorCode.INTERNAL_SERVER_ERROR, message, 500, details);
};
