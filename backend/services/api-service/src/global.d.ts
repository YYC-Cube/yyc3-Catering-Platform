/**
 * @fileoverview 全局类型定义
 * @description 扩展全局类型以支持YYC³餐饮平台需求
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

declare global {
  interface Request {
    bytes?: number;
    user?: {
      id: string;
      email: string;
      role: string;
    };
  }
}

export {};
