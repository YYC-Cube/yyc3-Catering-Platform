/**
 * @file 通用错误类型定义
 * @description 应用错误处理类型
 * @author YYC
 * @version 1.0.0
 * @created 2026-01-03
 */

/**
 * 应用错误接口
 */
export interface AppError extends Error {
  code: string;
  statusCode: number;
  details?: unknown;
  isOperational: boolean;
  timestamp: Date;
}

/**
 * 错误代码枚举
 */
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  PAYLOAD_TOO_LARGE = 'PAYLOAD_TOO_LARGE',
  BAD_REQUEST = 'BAD_REQUEST'
}

/**
 * HTTP 错误处理器类型
 */
export type HttpErrorHandler = (
  err: AppError | Error | unknown,
  req: unknown,
  res: unknown,
  next: unknown
) => void;

/**
 * 错误响应接口
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: number;
  requestId: string;
}
