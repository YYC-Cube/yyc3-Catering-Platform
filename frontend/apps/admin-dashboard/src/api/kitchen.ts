/**
 * YYC³餐饮行业智能化平台 - 厨房管理API
 */

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

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// 创建HTTP客户端实例
const httpClient = new HttpClient(API_BASE_URL)

// 厨房任务状态枚举
export enum KitchenTaskStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served',
  CANCELLED = 'cancelled'
}

// 任务优先级枚举
export enum TaskPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

// 厨房岗位枚举
export enum KitchenStation {
  HOT_DISH = 'hot_dish',
  COLD_DISH = 'cold_dish',
  SOUP = 'soup',
  BAR = 'bar',
  DESSERT = 'dessert',
  GENERAL = 'general'
}

// 厨房任务接口
export interface KitchenTask {
  id: number
  taskId: string
  orderId: string
  orderNo: string
  orderItemId: number
  itemName: string
  quantity: number
  specifications?: string
  specialRequests?: string
  station: KitchenStation
  status: KitchenTaskStatus
  priority: TaskPriority
  estimatedTime?: number
  actualTime?: number
  startedAt?: string
  completedAt?: string
  assignedTo?: number
  tableNumber?: string
  orderType: string
  tags?: string[]
  createdAt: string
  updatedAt?: string
}

// 厨房员工接口
export interface KitchenStaff {
  id: number
  userId: number
  name: string
  avatar?: string
  stations: KitchenStation[]
  currentTasks: number
  maxCapacity: number
  status: 'active' | 'break' | 'offline'
  efficiency: number
  totalTasksCompleted: number
  averageTime: number
  isAvailable: boolean
  lastActivity?: string
  createdAt: string
  updatedAt?: string
}

// 厨房统计接口
export interface KitchenStats {
  activeTasks: number
  completedToday: number
  averagePreparationTime: number
  efficiencyRate: number
  tasksByStation: {
    [key in KitchenStation]: {
      pending: number
      preparing: number
      ready: number
      averageTime: number
    }
  }
  tasksByStatus: {
    [key in KitchenTaskStatus]: number
  }
  staffPerformance: Array<{
    staffId: number
    name: string
    tasksCompleted: number
    averageTime: number
    efficiency: number
  }>
  peakHours: Array<{
    hour: number
    taskCount: number
  }>
}

// 厨房显示配置
export interface KitchenDisplay {
  id: number
  storeId: number
  displayName: string
  station?: KitchenStation
  layout: 'grid' | 'list' | 'kanban'
  maxItems: number
  refreshInterval: number
  showTableNumber: boolean
  showOrderTime: boolean
  showSpecialRequests: boolean
  enableSoundAlert: boolean
  enableAutoRefresh: boolean
  theme: 'light' | 'dark'
  customSettings: Record<string, any>
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

// 创建厨房任务请求
export interface CreateKitchenTaskRequest {
  orderItemId: number
  station: KitchenStation
  priority?: TaskPriority
  estimatedTime?: number
  assignedTo?: number
  specialInstructions?: string
}

// 更新厨房任务请求
export interface UpdateKitchenTaskRequest {
  status?: KitchenTaskStatus
  priority?: TaskPriority
  assignedTo?: number
  estimatedTime?: number
  actualTime?: number
  specialInstructions?: string
}

// 批量操作请求
export interface BulkOperationRequest {
  taskIds: number[]
  operation: 'assign' | 'update_status' | 'priority'
  data: {
    status?: KitchenTaskStatus
    priority?: TaskPriority
    assignedTo?: number
    station?: KitchenStation
  }
}

// 厨房API类
export class KitchenAPI {
  /**
   * 获取厨房任务列表
   */
  async getKitchenTasks(params?: {
    page?: number
    limit?: number
    station?: KitchenStation
    status?: KitchenTaskStatus
    priority?: TaskPriority
    assignedTo?: number
    startDate?: string
    endDate?: string
    search?: string
  }): Promise<{ success: boolean; data: { items: KitchenTask[]; pagination: any } }> {
    try {
      const queryString = new URLSearchParams()
      if (params?.page) queryString.set('page', params.page.toString())
      if (params?.limit) queryString.set('limit', params.limit.toString())
      if (params?.station) queryString.set('station', params.station)
      if (params?.status) queryString.set('status', params.status)
      if (params?.priority) queryString.set('priority', params.priority)
      if (params?.assignedTo) queryString.set('assignedTo', params.assignedTo.toString())
      if (params?.startDate) queryString.set('startDate', params.startDate)
      if (params?.endDate) queryString.set('endDate', params.endDate)
      if (params?.search) queryString.set('search', params.search)

      const endpoint = queryString.toString() ? `/kitchen/tasks?${queryString}` : '/kitchen/tasks'
      const response = await httpClient.get<{ success: boolean; data: { items: KitchenTask[]; pagination: any } }>(endpoint)
      return response
    } catch (error) {
      console.error('Get kitchen tasks failed:', error)
      return {
        success: false,
        data: {
          items: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0
          }
        }
      }
    }
  }

  /**
   * 获取厨房任务详情
   */
  async getKitchenTask(id: number): Promise<{ success: boolean; data?: KitchenTask; message?: string }> {
    try {
      const response = await httpClient.get<{ success: boolean; data?: KitchenTask; message?: string }>(`/kitchen/tasks/${id}`)
      return response
    } catch (error) {
      console.error('Get kitchen task failed:', error)
      return {
        success: false,
        message: '获取厨房任务详情失败'
      }
    }
  }

  /**
   * 创建厨房任务
   */
  async createKitchenTask(taskData: CreateKitchenTaskRequest): Promise<{ success: boolean; data?: KitchenTask; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; data?: KitchenTask; message?: string }>('/kitchen/tasks', taskData)
      return response
    } catch (error) {
      console.error('Create kitchen task failed:', error)
      return {
        success: false,
        message: '创建厨房任务失败'
      }
    }
  }

  /**
   * 更新厨房任务
   */
  async updateKitchenTask(id: number, taskData: UpdateKitchenTaskRequest): Promise<{ success: boolean; data?: KitchenTask; message?: string }> {
    try {
      const response = await httpClient.put<{ success: boolean; data?: KitchenTask; message?: string }>(`/kitchen/tasks/${id}`, taskData)
      return response
    } catch (error) {
      console.error('Update kitchen task failed:', error)
      return {
        success: false,
        message: '更新厨房任务失败'
      }
    }
  }

  /**
   * 删除厨房任务
   */
  async deleteKitchenTask(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.delete<{ success: boolean; message?: string }>(`/kitchen/tasks/${id}`)
      return response
    } catch (error) {
      console.error('Delete kitchen task failed:', error)
      return {
        success: false,
        message: '删除厨房任务失败'
      }
    }
  }

  /**
   * 批量操作厨房任务
   */
  async bulkOperationTasks(bulkData: BulkOperationRequest): Promise<{ success: boolean; data?: { updated: number; failed: number[] }; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; data?: { updated: number; failed: number[] }; message?: string }>('/kitchen/tasks/bulk', bulkData)
      return response
    } catch (error) {
      console.error('Bulk operation failed:', error)
      return {
        success: false,
        message: '批量操作失败'
      }
    }
  }

  /**
   * 分配任务给员工
   */
  async assignTask(taskId: number, staffId: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.patch<{ success: boolean; message?: string }>(`/kitchen/tasks/${taskId}/assign`, { staffId })
      return response
    } catch (error) {
      console.error('Assign task failed:', error)
      return {
        success: false,
        message: '分配任务失败'
      }
    }
  }

  /**
   * 获取厨房员工列表
   */
  async getKitchenStaff(params?: {
    station?: KitchenStation
    status?: 'active' | 'break' | 'offline'
  }): Promise<{ success: boolean; data?: KitchenStaff[]; message?: string }> {
    try {
      const queryString = new URLSearchParams()
      if (params?.station) queryString.set('station', params.station)
      if (params?.status) queryString.set('status', params.status)

      const endpoint = queryString.toString() ? `/kitchen/staff?${queryString}` : '/kitchen/staff'
      const response = await httpClient.get<{ success: boolean; data?: KitchenStaff[]; message?: string }>(endpoint)
      return response
    } catch (error) {
      console.error('Get kitchen staff failed:', error)
      return {
        success: false,
        message: '获取厨房员工列表失败'
      }
    }
  }

  /**
   * 更新厨房员工状态
   */
  async updateStaffStatus(staffId: number, status: 'active' | 'break' | 'offline'): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.patch<{ success: boolean; message?: string }>(`/kitchen/staff/${staffId}/status`, { status })
      return response
    } catch (error) {
      console.error('Update staff status failed:', error)
      return {
        success: false,
        message: '更新员工状态失败'
      }
    }
  }

  /**
   * 获取厨房统计数据
   */
  async getKitchenStats(params?: {
    startDate?: string
    endDate?: string
    station?: KitchenStation
  }): Promise<{ success: boolean; data?: KitchenStats; message?: string }> {
    try {
      const queryString = new URLSearchParams()
      if (params?.startDate) queryString.set('startDate', params.startDate)
      if (params?.endDate) queryString.set('endDate', params.endDate)
      if (params?.station) queryString.set('station', params.station)

      const endpoint = queryString.toString() ? `/kitchen/stats?${queryString}` : '/kitchen/stats'
      const response = await httpClient.get<{ success: boolean; data?: KitchenStats; message?: string }>(endpoint)
      return response
    } catch (error) {
      console.error('Get kitchen stats failed:', error)
      return {
        success: false,
        message: '获取厨房统计失败'
      }
    }
  }

  /**
   * 获取厨房显示配置
   */
  async getKitchenDisplays(): Promise<{ success: boolean; data?: KitchenDisplay[]; message?: string }> {
    try {
      const response = await httpClient.get<{ success: boolean; data?: KitchenDisplay[]; message?: string }>('/kitchen/displays')
      return response
    } catch (error) {
      console.error('Get kitchen displays failed:', error)
      return {
        success: false,
        message: '获取厨房显示配置失败'
      }
    }
  }

  /**
   * 更新厨房显示配置
   */
  async updateKitchenDisplay(id: number, displayData: Partial<KitchenDisplay>): Promise<{ success: boolean; data?: KitchenDisplay; message?: string }> {
    try {
      const response = await httpClient.put<{ success: boolean; data?: KitchenDisplay; message?: string }>(`/kitchen/displays/${id}`, displayData)
      return response
    } catch (error) {
      console.error('Update kitchen display failed:', error)
      return {
        success: false,
        message: '更新厨房显示配置失败'
      }
    }
  }

  /**
   * 发送厨房通知
   */
  async sendKitchenNotification(message: string, recipients?: number[], type: 'info' | 'warning' | 'error' | 'success' = 'info'): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; message?: string }>('/kitchen/notifications', {
        message,
        recipients,
        type
      })
      return response
    } catch (error) {
      console.error('Send kitchen notification failed:', error)
      return {
        success: false,
        message: '发送厨房通知失败'
      }
    }
  }

  /**
   * 获取任务历史记录
   */
  async getTaskHistory(params?: {
    taskId?: number
    staffId?: number
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }): Promise<{ success: boolean; data: { items: any[]; pagination: any }; message?: string }> {
    try {
      const queryString = new URLSearchParams()
      if (params?.taskId) queryString.set('taskId', params.taskId.toString())
      if (params?.staffId) queryString.set('staffId', params.staffId.toString())
      if (params?.startDate) queryString.set('startDate', params.startDate)
      if (params?.endDate) queryString.set('endDate', params.endDate)
      if (params?.page) queryString.set('page', params.page.toString())
      if (params?.limit) queryString.set('limit', params.limit.toString())

      const endpoint = queryString.toString() ? `/kitchen/history?${queryString}` : '/kitchen/history'
      const response = await httpClient.get<{ success: boolean; data: { items: any[]; pagination: any }; message?: string }>(endpoint)
      return response
    } catch (error) {
      console.error('Get task history failed:', error)
      return {
        success: false,
        data: {
          items: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0
          }
        },
        message: '获取任务历史失败'
      }
    }
  }
}

// 创建厨房API实例
export const kitchenApi = new KitchenAPI()

// 导出便捷函数
export const getKitchenTasks = (params?: {
  page?: number
  limit?: number
  station?: KitchenStation
  status?: KitchenTaskStatus
  priority?: TaskPriority
  assignedTo?: number
  startDate?: string
  endDate?: string
  search?: string
}) => kitchenApi.getKitchenTasks(params)

export const getKitchenTask = (id: number) => kitchenApi.getKitchenTask(id)
export const createKitchenTask = (taskData: CreateKitchenTaskRequest) => kitchenApi.createKitchenTask(taskData)
export const updateKitchenTask = (id: number, taskData: UpdateKitchenTaskRequest) => kitchenApi.updateKitchenTask(id, taskData)
export const deleteKitchenTask = (id: number) => kitchenApi.deleteKitchenTask(id)
export const bulkOperationTasks = (bulkData: BulkOperationRequest) => kitchenApi.bulkOperationTasks(bulkData)
export const assignTask = (taskId: number, staffId: number) => kitchenApi.assignTask(taskId, staffId)
export const getKitchenStaff = (params?: {
  station?: KitchenStation
  status?: 'active' | 'break' | 'offline'
}) => kitchenApi.getKitchenStaff(params)
export const updateStaffStatus = (staffId: number, status: 'active' | 'break' | 'offline') => kitchenApi.updateStaffStatus(staffId, status)
export const getKitchenStats = (params?: {
  startDate?: string
  endDate?: string
  station?: KitchenStation
}) => kitchenApi.getKitchenStats(params)
export const getKitchenDisplays = () => kitchenApi.getKitchenDisplays()
export const updateKitchenDisplay = (id: number, displayData: Partial<KitchenDisplay>) => kitchenApi.updateKitchenDisplay(id, displayData)
export const sendKitchenNotification = (message: string, recipients?: number[], type: 'info' | 'warning' | 'error' | 'success' = 'info') => kitchenApi.sendKitchenNotification(message, recipients, type)
export const getTaskHistory = (params?: {
  taskId?: number
  staffId?: number
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}) => kitchenApi.getTaskHistory(params)

export default kitchenApi