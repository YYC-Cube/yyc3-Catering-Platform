/**
 * @fileoverview 系统管理API服务
 * @description 处理系统管理相关的API请求
 * @module system-management
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 */

import { request } from '@/utils/request'

export interface User {
  id: string
  username: string
  email: string
  phone: string
  realName: string
  avatar?: string
  status: 'active' | 'inactive' | 'locked'
  roleIds: string[]
  departmentId?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  name: string
  code: string
  description?: string
  permissions: string[]
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface Permission {
  id: string
  name: string
  code: string
  module: string
  type: 'menu' | 'button' | 'api'
  parentId?: string
  children?: Permission[]
  sort: number
  status: 'active' | 'inactive'
}

export interface Department {
  id: string
  name: string
  code: string
  parentId?: string
  leaderId?: string
  description?: string
  sort: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface SystemSetting {
  id: string
  key: string
  value: string
  type: 'string' | 'number' | 'boolean' | 'json'
  category: string
  description?: string
  isPublic: boolean
  updatedAt: string
}

export interface AuditLog {
  id: string
  userId: string
  username: string
  action: string
  module: string
  resource: string
  resourceId?: string
  ip: string
  userAgent: string
  status: 'success' | 'failure'
  errorMessage?: string
  createdAt: string
}

export interface UserCreateRequest {
  username: string
  email: string
  phone: string
  password: string
  realName: string
  roleIds: string[]
  departmentId?: string
}

export interface UserUpdateRequest {
  id: string
  username?: string
  email?: string
  phone?: string
  password?: string
  realName?: string
  roleIds?: string[]
  departmentId?: string
  status?: 'active' | 'inactive' | 'locked'
}

export interface RoleCreateRequest {
  name: string
  code: string
  description?: string
  permissions: string[]
}

export interface RoleUpdateRequest {
  id: string
  name?: string
  code?: string
  description?: string
  permissions?: string[]
  status?: 'active' | 'inactive'
}

export const systemManagementApi = {
  getUsers: async (params?: {
    page?: number
    pageSize?: number
    keyword?: string
    status?: string
    roleId?: string
    departmentId?: string
  }) => {
    return request<{ data: User[]; total: number }>({
      url: '/api/system/users',
      method: 'GET',
      params
    })
  },

  getUserById: async (userId: string) => {
    return request<User>({
      url: `/api/system/users/${userId}`,
      method: 'GET'
    })
  },

  createUser: async (data: UserCreateRequest) => {
    return request<User>({
      url: '/api/system/users',
      method: 'POST',
      data
    })
  },

  updateUser: async (data: UserUpdateRequest) => {
    return request<User>({
      url: `/api/system/users/${data.id}`,
      method: 'PUT',
      data
    })
  },

  deleteUser: async (userId: string) => {
    return request({
      url: `/api/system/users/${userId}`,
      method: 'DELETE'
    })
  },

  resetPassword: async (userId: string, newPassword: string) => {
    return request({
      url: `/api/system/users/${userId}/reset-password`,
      method: 'POST',
      data: { newPassword }
    })
  },

  lockUser: async (userId: string) => {
    return request({
      url: `/api/system/users/${userId}/lock`,
      method: 'POST'
    })
  },

  unlockUser: async (userId: string) => {
    return request({
      url: `/api/system/users/${userId}/unlock`,
      method: 'POST'
    })
  },

  getRoles: async (params?: {
    page?: number
    pageSize?: number
    keyword?: string
    status?: string
  }) => {
    return request<{ data: Role[]; total: number }>({
      url: '/api/system/roles',
      method: 'GET',
      params
    })
  },

  getRoleById: async (roleId: string) => {
    return request<Role>({
      url: `/api/system/roles/${roleId}`,
      method: 'GET'
    })
  },

  createRole: async (data: RoleCreateRequest) => {
    return request<Role>({
      url: '/api/system/roles',
      method: 'POST',
      data
    })
  },

  updateRole: async (data: RoleUpdateRequest) => {
    return request<Role>({
      url: `/api/system/roles/${data.id}`,
      method: 'PUT',
      data
    })
  },

  deleteRole: async (roleId: string) => {
    return request({
      url: `/api/system/roles/${roleId}`,
      method: 'DELETE'
    })
  },

  getPermissions: async (params?: {
    module?: string
    type?: string
    status?: string
  }) => {
    return request<Permission[]>({
      url: '/api/system/permissions',
      method: 'GET',
      params
    })
  },

  getPermissionTree: async () => {
    return request<Permission[]>({
      url: '/api/system/permissions/tree',
      method: 'GET'
    })
  },

  getDepartments: async (params?: {
    keyword?: string
    status?: string
  }) => {
    return request<Department[]>({
      url: '/api/system/departments',
      method: 'GET',
      params
    })
  },

  getDepartmentTree: async () => {
    return request<Department[]>({
      url: '/api/system/departments/tree',
      method: 'GET'
    })
  },

  getDepartmentById: async (departmentId: string) => {
    return request<Department>({
      url: `/api/system/departments/${departmentId}`,
      method: 'GET'
    })
  },

  createDepartment: async (data: {
    name: string
    code: string
    parentId?: string
    leaderId?: string
    description?: string
    sort: number
  }) => {
    return request<Department>({
      url: '/api/system/departments',
      method: 'POST',
      data
    })
  },

  updateDepartment: async (data: {
    id: string
    name?: string
    code?: string
    parentId?: string
    leaderId?: string
    description?: string
    sort?: number
    status?: 'active' | 'inactive'
  }) => {
    return request<Department>({
      url: `/api/system/departments/${data.id}`,
      method: 'PUT',
      data
    })
  },

  deleteDepartment: async (departmentId: string) => {
    return request({
      url: `/api/system/departments/${departmentId}`,
      method: 'DELETE'
    })
  },

  getSettings: async (params?: {
    category?: string
    isPublic?: boolean
  }) => {
    return request<SystemSetting[]>({
      url: '/api/system/settings',
      method: 'GET',
      params
    })
  },

  getSettingByKey: async (key: string) => {
    return request<SystemSetting>({
      url: `/api/system/settings/${key}`,
      method: 'GET'
    })
  },

  updateSetting: async (data: {
    key: string
    value: string
  }) => {
    return request<SystemSetting>({
      url: `/api/system/settings/${data.key}`,
      method: 'PUT',
      data
    })
  },

  batchUpdateSettings: async (data: Array<{ key: string; value: string }>) => {
    return request({
      url: '/api/system/settings/batch',
      method: 'PUT',
      data
    })
  },

  getAuditLogs: async (params?: {
    page?: number
    pageSize?: number
    userId?: string
    action?: string
    module?: string
    status?: string
    startTime?: string
    endTime?: string
  }) => {
    return request<{ data: AuditLog[]; total: number }>({
      url: '/api/system/audit-logs',
      method: 'GET',
      params
    })
  },

  getAuditLogById: async (logId: string) => {
    return request<AuditLog>({
      url: `/api/system/audit-logs/${logId}`,
      method: 'GET'
    })
  },

  exportAuditLogs: async (params?: {
    startTime?: string
    endTime?: string
    userId?: string
    action?: string
    module?: string
  }) => {
    return request<Blob>({
      url: '/api/system/audit-logs/export',
      method: 'GET',
      params,
      responseType: 'blob'
    })
  },

  getSystemInfo: async () => {
    return request<{
      version: string
      environment: string
      uptime: number
      serverTime: string
      timezone: string
    }>({
      url: '/api/system/info',
      method: 'GET'
    })
  },

  getSystemStatistics: async () => {
    return request<{
      users: {
        total: number
        active: number
        inactive: number
        locked: number
      }
      roles: {
        total: number
        active: number
        inactive: number
      }
      departments: {
        total: number
        active: number
        inactive: number
      }
      permissions: {
        total: number
        active: number
        inactive: number
      }
    }>({
      url: '/api/system/statistics',
      method: 'GET'
    })
  }
}
