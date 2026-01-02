/**
 * YYC³餐饮行业智能化平台 - 认证相关类型定义
 * 包含认证请求、用户信息等共享类型
 */

import { Request } from 'express';

export interface User {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
  iat?: number;
  exp?: number;
}

export interface TenantContext {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive' | 'suspended';
  settings: Record<string, any>;
  limits: {
    maxUsers: number;
    maxOrders: number;
    maxStorage: number;
  };
  subscription: {
    plan: string;
    expiresAt: Date;
    features: string[];
  };
  createdAt?: Date;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
  tenant?: TenantContext;
  context?: {
    userId?: string;
    authenticated?: boolean;
    authTime?: number;
  };
}

export interface JwtPayload {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  user?: User;
  expiresAt?: number;
  error?: string;
  code?: string;
}

export interface TokenData {
  token: string;
  refreshToken: string;
  expiresIn: number;
}
