/**
 * @file 通用验证类型定义
 * @description 数据验证相关类型
 * @author YYC
 * @version 1.0.0
 * @created 2026-01-03
 */

/**
 * 验证规则类型
 */
export type ValidationRule =
  | 'required'
  | 'email'
  | 'phone'
  | 'url'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'number'
  | 'integer'
  | 'positive'
  | 'date'
  | 'min'
  | 'max'
  | 'in'
  | 'custom';

/**
 * 验证错误接口
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

/**
 * 基础验证配置
 */
export interface ValidationConfig {
  required?: boolean;
  message?: string;
}

/**
 * 长度验证配置
 */
export interface LengthValidation extends ValidationConfig {
  minLength?: number;
  maxLength?: number;
}

/**
 * 数字验证配置
 */
export interface NumberValidation extends ValidationConfig {
  min?: number;
  max?: number;
  integer?: boolean;
  positive?: boolean;
}

/**
 * 日期验证配置
 */
export interface DateValidation extends ValidationConfig {
  minDate?: Date | string;
  maxDate?: Date | string;
  futureOnly?: boolean;
  pastOnly?: boolean;
}

/**
 * 模式验证配置
 */
export interface PatternValidation extends ValidationConfig {
  pattern: RegExp | string;
}

/**
 * 字段验证配置
 */
export interface FieldValidation {
  [key: string]: ValidationConfig | LengthValidation | NumberValidation | DateValidation | PatternValidation | ValidationConfig[];
}
