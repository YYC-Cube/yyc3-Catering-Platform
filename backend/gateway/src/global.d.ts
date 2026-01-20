/**
 * @file 全局类型定义
 * @description YYC³餐饮行业智能化平台 - 全局类型定义
 * @module global
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 * @updated 2025-01-19
 */

import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        roles: string[];
        name?: string;
      };
      context?: {
        requestId?: string;
        traceId?: string;
        [key: string]: any;
      };
    }
  }
}
