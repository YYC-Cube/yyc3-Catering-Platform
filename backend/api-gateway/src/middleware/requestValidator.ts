/**
 * @fileoverview 请求验证中间件
 * @description 验证HTTP请求的参数、查询参数和请求体
 * @module middleware/requestValidator
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

/**
 * 验证规则接口
 */
export interface ValidationRule {
  /** 字段名 */
  field: string;
  /** 是否必填 */
  required?: boolean;
  /** 字段类型 */
  type?: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'uuid';
  /** 最小值/最小长度 */
  min?: number;
  /** 最大值/最大长度 */
  max?: number;
  /** 正则表达式 */
  pattern?: RegExp;
  /** 枚举值 */
  enum?: any[];
  /** 自定义验证函数 */
  custom?: (value: any) => boolean | string;
}

/**
 * 验证选项接口
 */
export interface ValidationOptions {
  /** 验证位置 */
  location: 'body' | 'query' | 'params' | 'headers';
  /** 验证规则 */
  rules: ValidationRule[];
  /** 是否在验证失败时停止 */
  stopOnFirstError?: boolean;
}

/**
 * 验证请求参数
 * @param options 验证选项
 * @returns Express中间件函数
 */
export const validateRequest = (options: ValidationOptions) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { location, rules, stopOnFirstError = false } = options;
    const data = req[location] as Record<string, any>;
    const errors: string[] = [];

    for (const rule of rules) {
      const { field, required = false, type, min, max, pattern, enum: enumValues, custom } = rule;
      const value = data[field];

      // 检查必填字段
      if (required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} 是必填字段`);
        if (stopOnFirstError) break;
        continue;
      }

      // 如果字段不存在且非必填，跳过验证
      if (value === undefined || value === null || value === '') {
        continue;
      }

      // 类型验证
      if (type) {
        const typeError = validateType(field, value, type);
        if (typeError) {
          errors.push(typeError);
          if (stopOnFirstError) break;
          continue;
        }
      }

      // 最小值/最小长度验证
      if (min !== undefined) {
        const minError = validateMin(field, value, min, type);
        if (minError) {
          errors.push(minError);
          if (stopOnFirstError) break;
          continue;
        }
      }

      // 最大值/最大长度验证
      if (max !== undefined) {
        const maxError = validateMax(field, value, max, type);
        if (maxError) {
          errors.push(maxError);
          if (stopOnFirstError) break;
          continue;
        }
      }

      // 正则表达式验证
      if (pattern && !pattern.test(String(value))) {
        errors.push(`${field} 格式不正确`);
        if (stopOnFirstError) break;
        continue;
      }

      // 枚举值验证
      if (enumValues && !enumValues.includes(value)) {
        errors.push(`${field} 必须是以下值之一: ${enumValues.join(', ')}`);
        if (stopOnFirstError) break;
        continue;
      }

      // 自定义验证
      if (custom) {
        const customResult = custom(value);
        if (customResult !== true) {
          errors.push(typeof customResult === 'string' ? customResult : `${field} 验证失败`);
          if (stopOnFirstError) break;
          continue;
        }
      }
    }

    // 如果有验证错误，返回错误响应
    if (errors.length > 0) {
      logger.warn('请求验证失败', {
        location,
        errors,
        data,
      });

      res.status(400).json({
        success: false,
        error: '请求参数验证失败',
        details: errors,
      });
      return;
    }

    next();
  };
};

/**
 * 验证类型
 */
function validateType(field: string, value: any, type: string): string | null {
  switch (type) {
    case 'string':
      if (typeof value !== 'string') {
        return `${field} 必须是字符串`;
      }
      break;
    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        return `${field} 必须是数字`;
      }
      break;
    case 'boolean':
      if (typeof value !== 'boolean') {
        return `${field} 必须是布尔值`;
      }
      break;
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return `${field} 必须是有效的邮箱地址`;
      }
      break;
    case 'url':
      try {
        new URL(value);
      } catch {
        return `${field} 必须是有效的URL`;
      }
      break;
    case 'uuid':
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(value)) {
        return `${field} 必须是有效的UUID`;
      }
      break;
  }
  return null;
}

/**
 * 验证最小值/最小长度
 */
function validateMin(field: string, value: any, min: number, type?: string): string | null {
  if (type === 'number') {
    if (value < min) {
      return `${field} 必须大于或等于 ${min}`;
    }
  } else {
    if (String(value).length < min) {
      return `${field} 长度必须至少为 ${min}`;
    }
  }
  return null;
}

/**
 * 验证最大值/最大长度
 */
function validateMax(field: string, value: any, max: number, type?: string): string | null {
  if (type === 'number') {
    if (value > max) {
      return `${field} 必须小于或等于 ${max}`;
    }
  } else {
    if (String(value).length > max) {
      return `${field} 长度不能超过 ${max}`;
    }
  }
  return null;
}

/**
 * 验证分页参数
 */
export const validatePagination = validateRequest({
  location: 'query',
  rules: [
    {
      field: 'page',
      type: 'number',
      min: 1,
      required: false,
    },
    {
      field: 'pageSize',
      type: 'number',
      min: 1,
      max: 100,
      required: false,
    },
    {
      field: 'sortBy',
      type: 'string',
      required: false,
    },
    {
      field: 'sortOrder',
      type: 'string',
      enum: ['asc', 'desc'],
      required: false,
    },
  ],
});

/**
 * 验证ID参数
 */
export const validateId = validateRequest({
  location: 'params',
  rules: [
    {
      field: 'id',
      type: 'uuid',
      required: true,
    },
  ],
});
