/**
 * @fileoverview API响应类型定义
 * @description 定义了统一的API响应格式和结构
 * @author YYC³
 * @version 1.0.0
 * @created 2024-01-01
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: number;
  requestId?: string;
  success: boolean;
}
