/**
 * @file 用户实体类型定义
 * @description 统一的用户类型定义，用于前后端共享
 * @author YYC
 * @version 1.0.0
 * @created 2026-01-03
 */

/**
 * 用户状态枚举
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DELETED = 'deleted'
}

/**
 * 用户角色枚举
 */
export enum UserRole {
  ADMIN = 'admin',
  RESTAURANT_ADMIN = 'restaurant_admin',
  STAFF = 'staff',
  CUSTOMER = 'customer',
  DELIVERY = 'delivery'
}

/**
 * 基础用户接口 - 后端使用
 * 统一使用 string 类型的 id（UUID）
 */
export interface BaseUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  phone?: string;
  status: UserStatus;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

/**
 * 认证用户接口 - 包含权限信息
 */
export interface AuthUser extends BaseUser {
  roles: UserRole[];
  permissions: string[];
  restaurantId?: string;
  lastLoginAt?: Date | string;
}

/**
 * 前端用户接口 - 统一使用 string 类型的 ID (UUID)
 * 与后端保持一致，避免类型转换问题
 */
export interface FrontendUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  status: UserStatus;
  createdAt: string;
  lastLoginAt?: string;
}

/**
 * 用户登录凭证
 */
export interface LoginCredentials {
  email: string;
  password: string;
  restaurantId?: string;
  rememberMe?: boolean;
}

/**
 * 用户注册信息
 */
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  restaurantId?: string;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  user: AuthUser;
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

/**
 * JWT 载荷
 */
export interface JwtPayload {
  sub: string;
  email: string;
  roles: UserRole[];
  restaurantId?: string;
  iat?: number;
  exp?: number;
}

/**
 * 用户偏好设置
 */
export interface UserPreferences {
  language?: string;
  theme?: 'light' | 'dark' | 'auto';
  timezone?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
}

/**
 * 用户详情（完整）
 */
export interface UserDetail extends AuthUser {
  preferences: UserPreferences;
  profile?: {
    firstName?: string;
    lastName?: string;
    gender?: 'male' | 'female' | 'other';
    dateOfBirth?: Date | string;
    address?: string;
  };
  metadata?: Record<string, unknown>;
}
