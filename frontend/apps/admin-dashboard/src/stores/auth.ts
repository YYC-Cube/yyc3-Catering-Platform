/**
 * YYC³餐饮行业智能化平台 - 认证状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { User, LoginCredentials } from '@/types/auth'
import { authApi } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const user = ref<User | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  )
  const loading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const hasPermission = (permission: string) => {
    // 管理员有所有权限
    if (isAdmin.value) return true

    // 根据用户角色定义权限
    const rolePermissions: Record<string, string[]> = {
      admin: ['*'],
      restaurant_admin: [
        'dashboard:read',
        'order:read',
        'order:write',
        'menu:read',
        'menu:write',
        'customer:read'
      ],
      customer: [
        'dashboard:read',
        'order:read',
        'order:write',
        'menu:read'
      ]
    }

    const userPermissions = rolePermissions[user.value?.role || ''] || []
    return userPermissions.includes('*') || userPermissions.includes(permission)
  }

  // 方法
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      loading.value = true

      // 调用登录API
      const response = await authApi.login({
        email: credentials.email,
        password: credentials.password
      })

      if (response.success && response.data) {
        const { user: userData, token: authToken, expiresIn } = response.data

        // 保存到状态和本地存储
        token.value = authToken
        user.value = userData

        localStorage.setItem('auth_token', authToken)
        localStorage.setItem('user', JSON.stringify(userData))

        // 设置token过期时间（可选）
        if (expiresIn) {
          const expiryTime = Date.now() + (expiresIn * 1000)
          localStorage.setItem('token_expiry', expiryTime.toString())
        }
      } else {
        throw new Error(response.message || '登录失败')
      }
    } catch (error: any) {
      console.error('Login failed:', error)
      throw new Error(error.message || '登录失败')
    } finally {
      loading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      // 调用API登出（如果需要）
      try {
        await authApi.logout()
      } catch (apiError) {
        console.warn('Logout API call failed:', apiError)
      }

      // 清除状态和本地存储
      token.value = null
      user.value = null

      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      localStorage.removeItem('token_expiry')
    } catch (error) {
      console.error('Logout failed:', error)
      throw error
    }
  }

  const refreshUserInfo = async (): Promise<void> => {
    try {
      if (!token.value) {
        throw new Error('No token found')
      }

      // 调用API获取用户信息
      const response = await authApi.getUserInfo()

      if (response.success && response.data) {
        user.value = response.data.user
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
    } catch (error) {
      console.error('Refresh user info failed:', error)
      throw error
    }
  }

  const updateProfile = async (profileData: Partial<User>): Promise<void> => {
    try {
      // 模拟API调用
      // await authApi.updateProfile(profileData)

      if (user.value) {
        user.value = { ...user.value, ...profileData }
        localStorage.setItem('user', JSON.stringify(user.value))
      }
    } catch (error) {
      console.error('Update profile failed:', error)
      throw error
    }
  }

  const changePassword = async (_oldPassword: string, _newPassword: string): Promise<void> => {
    try {
      // 模拟API调用
      // await authApi.changePassword({ oldPassword, newPassword })

      // 密码修改成功后，可能需要重新登录
      console.log('Password changed successfully')
    } catch (error) {
      console.error('Change password failed:', error)
      throw error
    }
  }

  const checkPermission = (requiredPermissions: string | string[]): boolean => {
    if (isAdmin.value) {
      return true
    }

    if (typeof requiredPermissions === 'string') {
      return hasPermission(requiredPermissions)
    }

    return requiredPermissions.every(permission => hasPermission(permission))
  }

  const refreshToken = async (): Promise<void> => {
    try {
      // 调用API刷新token
      const response = await authApi.refreshToken()

      if (response.success && response.data?.token) {
        token.value = response.data.token
        localStorage.setItem('auth_token', response.data.token)

        // 更新过期时间
        if (response.data.expiresIn) {
          const expiryTime = Date.now() + (response.data.expiresIn * 1000)
          localStorage.setItem('token_expiry', expiryTime.toString())
        }
      }
    } catch (error) {
      console.error('Refresh token failed:', error)
      throw error
    }
  }

  return {
    // 状态
    token,
    user,
    loading,

    // 计算属性
    isAuthenticated,
    isAdmin,

    // 方法
    login,
    logout,
    refreshUserInfo,
    updateProfile,
    changePassword,
    hasPermission,
    checkPermission,
    refreshToken
  }
})