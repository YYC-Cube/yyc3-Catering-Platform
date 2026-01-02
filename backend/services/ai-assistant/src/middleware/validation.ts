/**
 * @file 请求验证中间件
 * @description 提请求数据验证和清理功能
 * @module middleware/validation
 * @author YYC
 * @version 1.0.0
 * @created 2025-01-09
 * @updated 2025-01-09
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

interface ValidationSchema {
  body?: any;
  query?: any;
  params?: any;
  headers?: any;
}

interface ValidationResult {
  success: boolean;
  errors?: string[];
  data?: any;
}

interface SanitizationResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * 请求验证中间件类
 */
export class ValidationMiddleware {
  /**
   * 验证请求体
   */
  public validateBody(schema: any) {
    return async (req: Request): Promise<ValidationResult> => {
      try {
        const contentType = req.headers['content-type'];

        if (!contentType) {
          return {
            success: false,
            errors: ['缺少Content-Type头']
          };
        }

        let body: any;

        if ((contentType as string).includes('application/json')) {
          body = req.body;
        } else if ((contentType as string).includes('application/x-www-form-urlencoded')) {
          body = req.body;
        } else if ((contentType as string).includes('multipart/form-data')) {
          body = req.body;
        } else {
          body = req.body;
        }

        if (body === undefined || body === null) {
          return {
            success: false,
            errors: ['请求体解析失败']
          };
        }

        // 使用Zod模式验证
        const result = schema.safeParse(body);

        if (!result.success) {
          const errors = result.error.errors.map((err: any) =>
            `${err.path.join('.')}: ${err.message}`
          );

          return {
            success: false,
            errors
          };
        }

        return {
          success: true,
          data: result.data
        };

      } catch (error) {
        console.error('请求体验证错误:', error);
        return {
          success: false,
          errors: ['请求体验证过程中发生错误']
        };
      }
    };
  }

  /**
   * 验证查询参数
   */
  public validateQuery(schema: any) {
    return async (req: Request): Promise<ValidationResult> => {
      try {
        const query: Record<string, string> = req.query as Record<string, string>;

        const result = schema.safeParse(query);

        if (!result.success) {
          const errors = result.error.errors.map((err: any) =>
            `query.${err.path.join('.')}: ${err.message}`
          );

          return {
            success: false,
            errors
          };
        }

        return {
          success: true,
          data: result.data
        };

      } catch (error) {
        console.error('查询参数验证错误:', error);
        return {
          success: false,
          errors: ['查询参数验证过程中发生错误']
        };
      }
    };
  }

  /**
   * 验证路径参数
   */
  public validateParams(schema: any) {
    return async (req: Request): Promise<ValidationResult> => {
      try {
        const params: Record<string, string> = req.params;

        if (!params) {
          return {
            success: false,
            errors: ['缺少路径参数']
          };
        }

        const result = schema.safeParse(params);

        if (!result.success) {
          const errors = result.error.errors.map((err: any) =>
            `params.${err.path.join('.')}: ${err.message}`
          );

          return {
            success: false,
            errors
          };
        }

        return {
          success: true,
          data: result.data
        };

      } catch (error) {
        console.error('路径参数验证错误:', error);
        return {
          success: false,
          errors: ['路径参数验证过程中发生错误']
        };
      }
    };
  }

  /**
   * 验证请求头
   */
  public validateHeaders(schema: any) {
    return async (req: Request): Promise<ValidationResult> => {
      try {
        const headers: Record<string, string> = {};

        Object.entries(req.headers).forEach(([key, value]) => {
          headers[key] = Array.isArray(value) ? value.join(', ') : String(value);
        });

        const result = schema.safeParse(headers);

        if (!result.success) {
          const errors = result.error.errors.map((err: any) =>
            `headers.${err.path.join('.')}: ${err.message}`
          );

          return {
            success: false,
            errors
          };
        }

        return {
          success: true,
          data: result.data
        };

      } catch (error) {
        console.error('请求头验证错误:', error);
        return {
          success: false,
          errors: ['请求头验证过程中发生错误']
        };
      }
    };
  }

  /**
   * 综合验证
   */
  public validate(schema: ValidationSchema) {
    return async (req: Request): Promise<ValidationResult> => {
      const allErrors: string[] = [];
      const validatedData: any = {};

      try {
        // 验证请求体
        if (schema.body) {
          const bodyResult = await this.validateBody(schema.body)(req);
          if (!bodyResult.success && bodyResult.errors) {
            allErrors.push(...bodyResult.errors);
          } else if (bodyResult.data) {
            validatedData.body = bodyResult.data;
          }
        }

        // 验证查询参数
        if (schema.query) {
          const queryResult = await this.validateQuery(schema.query)(req);
          if (!queryResult.success && queryResult.errors) {
            allErrors.push(...queryResult.errors);
          } else if (queryResult.data) {
            validatedData.query = queryResult.data;
          }
        }

        // 验证路径参数
        if (schema.params) {
          const paramsResult = await this.validateParams(schema.params)(req);
          if (!paramsResult.success && paramsResult.errors) {
            allErrors.push(...paramsResult.errors);
          } else if (paramsResult.data) {
            validatedData.params = paramsResult.data;
          }
        }

        // 验证请求头
        if (schema.headers) {
          const headersResult = await this.validateHeaders(schema.headers)(req);
          if (!headersResult.success && headersResult.errors) {
            allErrors.push(...headersResult.errors);
          } else if (headersResult.data) {
            validatedData.headers = headersResult.data;
          }
        }

        if (allErrors.length > 0) {
          return {
            success: false,
            errors: allErrors
          };
        }

        return {
          success: true,
          data: validatedData
        };

      } catch (error) {
        console.error('综合验证错误:', error);
        return {
          success: false,
          errors: ['请求验证过程中发生错误']
        };
      }
    };
  }

  /**
   * 验证请求的中间件
   */
  public validateRequest = (schema: ValidationSchema) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const validationResult = await this.validate(schema)(req);
        
        if (!validationResult.success) {
          res.status(400).json({
            success: false,
            error: '请求验证失败',
            code: 'VALIDATION_ERROR',
            errors: validationResult.errors,
            timestamp: new Date().toISOString()
          });
          return;
        }

        // 将验证后的数据添加到请求对象
        (req as any).validatedData = validationResult.data;
        next();
      } catch (error) {
        res.status(400).json({
          success: false,
          error: '请求验证失败',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        });
        return;
      }
    };
  };

  /**
   * 数据清理
   */
  public sanitize(data: any): SanitizationResult {
    try {
      if (typeof data !== 'object' || data === null) {
        return {
          success: true,
          data: this.sanitizeString(data)
        };
      }

      if (Array.isArray(data)) {
        const sanitizedArray = data.map(item => this.sanitize(item).data);
        return {
          success: true,
          data: sanitizedArray
        };
      }

      const sanitizedObject: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
          sanitizedObject[key] = this.sanitizeString(value);
        } else if (typeof value === 'object' && value !== null) {
          sanitizedObject[key] = this.sanitize(value).data;
        } else {
          sanitizedObject[key] = value;
        }
      }

      return {
        success: true,
        data: sanitizedObject
      };

    } catch (error) {
      console.error('数据清理错误:', error);
      return {
        success: false,
        error: '数据清理过程中发生错误'
      };
    }
  }

  /**
   * 字符串清理
   */
  private sanitizeString(str: string): string {
    if (typeof str !== 'string') {
      return str;
    }

    return str
      .trim()
      // 移除潜在的恶意字符
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      // 防止SQL注入（虽然参数化查询是更好的解决方案）
      .replace(/['"\\]/g, char => '\\' + char);
  }

  /**
   * 文件上传验证
   */
  public validateFile(file: any, options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB
      allowedTypes = [],
      allowedExtensions = []
    } = options;

    const errors: string[] = [];

    // 检查文件大小
    if (file.size > maxSize) {
      errors.push(`文件大小超过限制 (${maxSize / 1024 / 1024}MB)`);
    }

    // 检查文件类型
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
      errors.push(`不允许的文件类型: ${file.mimetype}`);
    }

    // 检查文件扩展名
    if (allowedExtensions.length > 0) {
      const extension = file.originalname.split('.').pop()?.toLowerCase();
      if (!extension || !allowedExtensions.includes(extension)) {
        errors.push(`不允许的文件扩展名: ${extension}`);
      }
    }

    return {
      success: errors.length === 0,
      errors,
      file
    };
  }

  /**
   * UUID验证
   */
  public isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * 邮箱验证
   */
  public isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 手机号验证（中国大陆）
   */
  public isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }

  /**
   * 密码强度验证
   */
  public isValidPassword(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score++;
    else feedback.push('密码长度至少8位');

    if (/[a-z]/.test(password)) score++;
    else feedback.push('密码应包含小写字母');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('密码应包含大写字母');

    if (/\d/.test(password)) score++;
    else feedback.push('密码应包含数字');

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
    else feedback.push('密码应包含特殊字符');

    return {
      isValid: score >= 4,
      score,
      feedback
    };
  }
}

// 导出单例实例
export const validationMiddleware = new ValidationMiddleware();

// 导出便捷方法
export const validateRequest = validationMiddleware.validateRequest;
export const validateBody = validationMiddleware.validateBody;
export const validateQuery = validationMiddleware.validateQuery;
export const validateParams = validationMiddleware.validateParams;
export const validateHeaders = validationMiddleware.validateHeaders;
export const sanitize = validationMiddleware.sanitize;
export const validateFile = validationMiddleware.validateFile;
export const isValidUUID = validationMiddleware.isValidUUID;
export const isValidEmail = validationMiddleware.isValidEmail;
export const isValidPhoneNumber = validationMiddleware.isValidPhoneNumber;
export const isValidPassword = validationMiddleware.isValidPassword;