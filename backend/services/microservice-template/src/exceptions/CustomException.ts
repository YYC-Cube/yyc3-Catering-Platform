/**
 * @fileoverview 自定义异常类
 * @description 实现统一的异常处理机制
 * @module exceptions/CustomException
 * @author YYC³ Development Team <dev@yyc3.red>
 * @version 1.0.0
 */

import { CustomError, ErrorCode, ErrorMessage } from '../types/error';

/**
 * 自定义异常类
 * 继承自Error类，实现CustomError接口
 */
export class CustomException extends Error implements CustomError {
  /**
   * 错误码
   */
  public code: ErrorCode;
  
  /**
   * 详细信息
   */
  public details?: any;
  
  /**
   * 时间戳
   */
  public timestamp: string;
  
  /**
   * 构造函数
   * @param code 错误码
   * @param message 错误消息
   * @param details 详细信息
   */
  constructor(code: ErrorCode, message?: string, details?: any) {
    super(message || ErrorMessage[code]);
    this.name = 'CustomException';
    this.code = code;
    this.message = message || ErrorMessage[code];
    this.details = details;
    this.timestamp = new Date().toISOString();
    
    // 捕获堆栈信息
    Error.captureStackTrace(this, this.constructor);
  }
  
  /**
   * 转换为JSON对象
   */
  public toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      name: this.name,
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined,
    };
  }
}

/**
 * 参数验证异常
 */
export class ValidationException extends CustomException {
  constructor(message?: string, details?: any) {
    super(ErrorCode.VALIDATION_ERROR, message, details);
    this.name = 'ValidationException';
  }
}

/**
 * 资源不存在异常
 */
export class ResourceNotFoundException extends CustomException {
  constructor(message?: string, details?: any) {
    super(ErrorCode.RESOURCE_NOT_FOUND, message, details);
    this.name = 'ResourceNotFoundException';
  }
}

/**
 * 资源已存在异常
 */
export class ResourceAlreadyExistsException extends CustomException {
  constructor(message?: string, details?: any) {
    super(ErrorCode.RESOURCE_ALREADY_EXISTS, message, details);
    this.name = 'ResourceAlreadyExistsException';
  }
}

/**
 * 未授权异常
 */
export class UnauthorizedException extends CustomException {
  constructor(message?: string, details?: any) {
    super(ErrorCode.UNAUTHORIZED, message, details);
    this.name = 'UnauthorizedException';
  }
}

/**
 * 禁止访问异常
 */
export class ForbiddenException extends CustomException {
  constructor(message?: string, details?: any) {
    super(ErrorCode.FORBIDDEN, message, details);
    this.name = 'ForbiddenException';
  }
}

/**
 * 业务规则违反异常
 */
export class BusinessRuleViolationException extends CustomException {
  constructor(message?: string, details?: any) {
    super(ErrorCode.BUSINESS_RULE_VIOLATION, message, details);
    this.name = 'BusinessRuleViolationException';
  }
}

/**
 * 数据库异常
 */
export class DatabaseException extends CustomException {
  constructor(message?: string, details?: any) {
    super(ErrorCode.DATABASE_ERROR, message, details);
    this.name = 'DatabaseException';
  }
}

/**
 * 文件上传异常
 */
export class FileUploadException extends CustomException {
  constructor(message?: string, details?: any) {
    super(ErrorCode.FILE_UPLOAD_ERROR, message, details);
    this.name = 'FileUploadException';
  }
}
