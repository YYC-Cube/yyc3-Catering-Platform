/**
 * YYC³餐饮行业智能化平台 - 认证相关类型定义
 */

export interface User {
  id: number
  email: string
  name: string
  role: 'admin' | 'restaurant_admin' | 'customer'
  avatar?: string
  phone?: string
  status: 'active' | 'inactive' | 'suspended'
  restaurantId?: number
  lastLoginAt?: string
  createdAt: string
  updatedAt?: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
  captcha?: string
}

export interface RegisterData {
  username: string
  password: string
  confirmPassword: string
  email: string
  phone?: string
  name: string
  captcha?: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  expiresIn: number
  user: User
}

export interface PasswordResetData {
  email: string
  newPassword: string
  confirmPassword: string
  verificationCode: string
}

export interface UserProfile {
  id: string
  username: string
  name: string
  email: string
  phone?: string
  avatar?: string
  bio?: string
  preferences: {
    language: string
    theme: 'light' | 'dark'
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
    }
  }
}

export interface Permission {
  id: string
  name: string
  code: string
  description: string
  module: string
}

export interface Role {
  id: string
  name: string
  code: string
  description: string
  permissions: Permission[]
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  permissions: string[]
  roles: string[]
  loading: boolean
  error: string | null
}