/**
 * @fileoverview 错误类型定义
 * @description 定义应用的错误类型、错误码和异常接口
 * @module types/error
 * @author YYC³ Development Team <dev@yyc3.red>
 * @version 1.0.0
 */

/**
 * 错误码枚举
 */
export enum ErrorCode {
  // 通用错误码
  SUCCESS = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
  
  // 业务错误码
  INVALID_PARAMETER = 1001,
  VALIDATION_ERROR = 1002,
  RESOURCE_NOT_FOUND = 1003,
  RESOURCE_ALREADY_EXISTS = 1004,
  OPERATION_FAILED = 1005,
  BUSINESS_RULE_VIOLATION = 1006,
  
  // 认证授权错误码
  INVALID_CREDENTIALS = 2001,
  EXPIRED_TOKEN = 2002,
  INVALID_TOKEN = 2003,
  INSUFFICIENT_PERMISSIONS = 2004,
  ACCOUNT_LOCKED = 2005,
  ACCOUNT_DISABLED = 2006,
  
  // 数据库错误码
  DATABASE_ERROR = 3001,
  DATABASE_CONNECTION_ERROR = 3002,
  DATABASE_OPERATION_FAILED = 3003,
  DUPLICATE_KEY_ERROR = 3004,
  
  // 文件错误码
  FILE_UPLOAD_ERROR = 4001,
  FILE_SIZE_EXCEEDED = 4002,
  FILE_TYPE_NOT_ALLOWED = 4003,
  FILE_NOT_FOUND = 4004,
}

/**
 * 错误消息映射
 */
export const ErrorMessage: Record<ErrorCode, string> = {
  // 通用错误码
  [ErrorCode.SUCCESS]: '操作成功',
  [ErrorCode.BAD_REQUEST]: '请求参数错误',
  [ErrorCode.UNAUTHORIZED]: '未授权访问',
  [ErrorCode.FORBIDDEN]: '禁止访问',
  [ErrorCode.NOT_FOUND]: '请求资源不存在',
  [ErrorCode.METHOD_NOT_ALLOWED]: '请求方法不允许',
  [ErrorCode.CONFLICT]: '资源冲突',
  [ErrorCode.INTERNAL_SERVER_ERROR]: '服务器内部错误',
  [ErrorCode.SERVICE_UNAVAILABLE]: '服务暂时不可用',
  
  // 业务错误码
  [ErrorCode.INVALID_PARAMETER]: '无效的参数',
  [ErrorCode.VALIDATION_ERROR]: '参数验证失败',
  [ErrorCode.RESOURCE_NOT_FOUND]: '资源不存在',
  [ErrorCode.RESOURCE_ALREADY_EXISTS]: '资源已存在',
  [ErrorCode.OPERATION_FAILED]: '操作失败',
  [ErrorCode.BUSINESS_RULE_VIOLATION]: '违反业务规则',
  
  // 认证授权错误码
  [ErrorCode.INVALID_CREDENTIALS]: '无效的凭证',
  [ErrorCode.EXPIRED_TOKEN]: '令牌已过期',
  [ErrorCode.INVALID_TOKEN]: '无效的令牌',
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: '权限不足',
  [ErrorCode.ACCOUNT_LOCKED]: '账户已锁定',
  [ErrorCode.ACCOUNT_DISABLED]: '账户已禁用',
  
  // 数据库错误码
  [ErrorCode.DATABASE_ERROR]: '数据库错误',
  [ErrorCode.DATABASE_CONNECTION_ERROR]: '数据库连接错误',
  [ErrorCode.DATABASE_OPERATION_FAILED]: '数据库操作失败',
  [ErrorCode.DUPLICATE_KEY_ERROR]: '唯一键冲突',
  
  // 文件错误码
  [ErrorCode.FILE_UPLOAD_ERROR]: '文件上传失败',
  [ErrorCode.FILE_SIZE_EXCEEDED]: '文件大小超出限制',
  [ErrorCode.FILE_TYPE_NOT_ALLOWED]: '文件类型不允许',
  [ErrorCode.FILE_NOT_FOUND]: '文件不存在',
};

/**
 * 自定义异常接口
 */
export interface CustomError extends Error {
  /**
   * 错误码
   */
  code: ErrorCode;
  
  /**
   * 错误消息
   */
  message: string;
  
  /**
   * 详细信息
   */
  details?: any;
  
  /**
   * 时间戳
   */
  timestamp: string;
}
