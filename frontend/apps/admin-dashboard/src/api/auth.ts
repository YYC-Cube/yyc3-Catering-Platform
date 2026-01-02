/**
 * YYC³餐饮行业智能化平台 - 认证API
 */

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  success: boolean
  data?: {
    token: string
    refreshToken: string
    user: UserInfo
    permissions: string[]
  }
  message?: string
  code?: number
}

export interface UserInfo {
  id: number
  email: string
  name: string
  role: 'admin' | 'restaurant_admin' | 'customer'
  lastLoginAt?: string
  createdAt?: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  success: boolean
  data?: {
    token: string
    refreshToken: string
  }
  message?: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UpdateProfileRequest {
  realName?: string
  email?: string
  phone?: string
  avatar?: string
}

// API 基础URL配置
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:3006/api/v1'

// HTTP 请求工具函数
class HttpClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    // 获取认证token
    const token = this.getToken()

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`
    }

    const config: RequestInit = {
      headers: defaultHeaders,
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  private getToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }
}

// 创建HTTP客户端实例
const httpClient = new HttpClient(API_BASE_URL)

// 认证API类
export class AuthAPI {
  /**
   * 用户登录
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await httpClient.post<LoginResponse>('/auth/login', credentials)

      if (response.success && response.data) {
        // 存储认证信息
        this.setAuthData(response.data)
      }

      return response
    } catch (error) {
      console.error('Login failed:', error)
      return {
        success: false,
        message: '登录失败，请检查网络连接',
        code: 500
      }
    }
  }

  /**
   * 用户登出
   */
  async logout(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; message?: string }>('/auth/logout')

      // 清除本地存储的认证信息
      this.clearAuthData()

      return response
    } catch (error) {
      console.error('Logout failed:', error)
      // 即使API调用失败，也要清除本地数据
      this.clearAuthData()
      return {
        success: false,
        message: '登出失败'
      }
    }
  }

  /**
   * 刷新token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      const response = await httpClient.post<RefreshTokenResponse>('/auth/refresh-token', {
        refreshToken
      })

      if (response.success && response.data) {
        // 更新token
        this.setToken(response.data.token)
        if (response.data.refreshToken) {
          this.setRefreshToken(response.data.refreshToken)
        }
      }

      return response
    } catch (error) {
      console.error('Token refresh failed:', error)
      // 刷新失败，清除认证数据
      this.clearAuthData()
      return {
        success: false,
        message: 'Token刷新失败'
      }
    }
  }

  /**
   * 验证token
   */
  async verifyToken(token: string): Promise<{ success: boolean; data?: { user: UserInfo }; message?: string }> {
    try {
      const response = await httpClient.get<{ success: boolean; data?: { user: UserInfo }; message?: string }>('/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response
    } catch (error) {
      console.error('Token verification failed:', error)
      return {
        success: false,
        message: 'Token验证失败'
      }
    }
  }

  /**
   * 修改密码
   */
  async changePassword(passwordData: ChangePasswordRequest): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; message?: string }>('/auth/change-password', passwordData)
      return response
    } catch (error) {
      console.error('Change password failed:', error)
      return {
        success: false,
        message: '修改密码失败'
      }
    }
  }

  /**
   * 更新用户资料
   */
  async updateProfile(profileData: UpdateProfileRequest): Promise<{ success: boolean; data?: UserInfo; message?: string }> {
    try {
      const response = await httpClient.put<{ success: boolean; data?: UserInfo; message?: string }>('/auth/profile', profileData)
      return response
    } catch (error) {
      console.error('Update profile failed:', error)
      return {
        success: false,
        message: '更新资料失败'
      }
    }
  }

  /**
   * 检查用户权限
   */
  async checkPermission(permission: string): Promise<boolean> {
    try {
      const response = await httpClient.get<{ success: boolean; data?: { hasPermission: boolean } }>(`/auth/check-permission/${permission}`)
      return response.success && (response.data?.hasPermission ?? false)
    } catch (error) {
      console.error('Check permission failed:', error)
      return false
    }
  }

  /**
   * 从服务器获取用户权限列表
   */
  async fetchPermissions(): Promise<string[]> {
    try {
      const response = await httpClient.get<{ success: boolean; data?: { permissions: string[] } }>('/auth/permissions')
      return response.success && response.data ? response.data.permissions : []
    } catch (error) {
      console.error('Get permissions failed:', error)
      return []
    }
  }

  /**
   * 验证token有效性
   */
  async validateToken(): Promise<boolean> {
    try {
      const response = await httpClient.get<{ success: boolean }>('/auth/validate')
      return response.success
    } catch (error) {
      console.error('Token validation failed:', error)
      return false
    }
  }

  /**
   * 存储认证数据
   */
  private setAuthData(authData: LoginResponse['data']): void {
    if (!authData) return

    this.setToken(authData.token)
    this.setRefreshToken(authData.refreshToken)
    this.setUserInfo(authData.user)
    this.setPermissions(authData.permissions)
  }

  /**
   * 存储token
   */
  private setToken(token: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  /**
   * 存储刷新token
   */
  private setRefreshToken(refreshToken: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('refresh_token', refreshToken)
    }
  }

  /**
   * 存储用户信息
   */
  private setUserInfo(user: UserInfo): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('user_info', JSON.stringify(user))
    }
  }

  /**
   * 存储权限列表
   */
  private setPermissions(permissions: string[]): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('user_permissions', JSON.stringify(permissions))
    }
  }

  /**
   * 获取token
   */
  getToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  /**
   * 获取刷新token
   */
  getRefreshToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('refresh_token')
    }
    return null
  }

  /**
   * 获取用户信息
   */
  getUserInfo(): UserInfo | null {
    if (typeof localStorage !== 'undefined') {
      const userInfo = localStorage.getItem('user_info')
      return userInfo ? JSON.parse(userInfo) : null
    }
    return null
  }

  /**
   * 获取权限列表
   */
  getPermissions(): string[] {
    if (typeof localStorage !== 'undefined') {
      const permissions = localStorage.getItem('user_permissions')
      return permissions ? JSON.parse(permissions) : []
    }
    return []
  }

  /**
   * 清除所有认证数据
   */
  private clearAuthData(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_info')
      localStorage.removeItem('user_permissions')
    }
  }

  /**
   * 检查是否已登录
   */
  isAuthenticated(): boolean {
    const token = this.getToken()
    return !!token
  }

  /**
   * 检查用户是否有指定权限
   */
  hasPermission(permission: string): boolean {
    const permissions = this.getPermissions()
    return permissions.includes(permission)
  }

  /**
   * 检查用户是否有任一权限
   */
  hasAnyPermission(permissions: string[]): boolean {
    const userPermissions = this.getPermissions()
    return permissions.some(permission => userPermissions.includes(permission))
  }

  /**
   * 检查用户是否有所有权限
   */
  hasAllPermissions(permissions: string[]): boolean {
    const userPermissions = this.getPermissions()
    return permissions.every(permission => userPermissions.includes(permission))
  }
}

// 创建认证API实例
export const authApi = new AuthAPI()

// 导出便捷函数
export const login = (credentials: LoginRequest) => authApi.login(credentials)
export const logout = () => authApi.logout()
export const refreshToken = (refreshToken: string) => authApi.refreshToken(refreshToken)
export const getCurrentUser = () => authApi.getCurrentUser()
export const changePassword = (passwordData: ChangePasswordRequest) => authApi.changePassword(passwordData)
export const updateProfile = (profileData: UpdateProfileRequest) => authApi.updateProfile(profileData)
export const checkPermission = (permission: string) => authApi.checkPermission(permission)
export const fetchPermissions = () => authApi.fetchPermissions()
export const validateToken = () => authApi.validateToken()

export default authApi