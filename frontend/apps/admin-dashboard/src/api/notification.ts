/**
 * YYC³餐饮行业智能化平台 - 通知API
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

// 通知类型枚举
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  ORDER = 'order',
  KITCHEN = 'kitchen',
  PAYMENT = 'payment',
  SYSTEM = 'system',
  MARKETING = 'marketing'
}

// 通知优先级枚举
export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

// 通知状态枚举
export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived'
}

// 通知接口
export interface Notification {
  id: number
  type: NotificationType
  priority: NotificationPriority
  status: NotificationStatus
  title: string
  message: string
  data?: Record<string, any>
  actions?: NotificationAction[]
  createdAt: string
  updatedAt?: string
  expiresAt?: string
  readAt?: string
  userId?: number
  storeId?: number
  category?: string
  tags?: string[]
  isSilent?: boolean
  isPersistent?: boolean
}

// 通知动作接口
export interface NotificationAction {
  id: string
  label: string
  type: 'button' | 'link'
  url?: string
  action?: string
  style?: 'primary' | 'secondary' | 'danger' | 'warning'
  icon?: string
}

// 通知模板接口
export interface NotificationTemplate {
  id: number
  name: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  message: string
  variables?: string[]
  actions?: NotificationAction[]
  isActive: boolean
  category?: string
  description?: string
}

// 通知统计接口
export interface NotificationStats {
  total: number
  unread: number
  today: number
  thisWeek: number
  thisMonth: number
  byType: Record<NotificationType, number>
  byPriority: Record<NotificationPriority, number>
}

// 通知设置接口
export interface NotificationSettings {
  id: number
  userId: number
  emailEnabled: boolean
  smsEnabled: boolean
  pushEnabled: boolean
  soundEnabled: boolean
  desktopEnabled: boolean
  quietHours: {
    enabled: boolean
    startTime: string
    endTime: string
  }
  preferences: {
    [key in NotificationType]: {
      enabled: boolean
      sound?: boolean
      desktop?: boolean
      email?: boolean
      sms?: boolean
    }
  }
  frequencyLimits: {
    maxPerHour: number
    maxPerDay: number
    maxPerWeek: number
  }
}

// 创建通知请求
export interface CreateNotificationRequest {
  type: NotificationType
  priority: NotificationPriority
  title: string
  message: string
  data?: Record<string, any>
  actions?: NotificationAction[]
  recipients?: number[]
  roles?: string[]
  stores?: number[]
  expiresAt?: string
  isSilent?: boolean
  isPersistent?: boolean
  scheduledAt?: string
  category?: string
  tags?: string[]
}

// 通知查询参数
export interface NotificationQuery {
  page?: number
  limit?: number
  type?: NotificationType
  priority?: NotificationPriority
  status?: NotificationStatus
  category?: string
  tags?: string[]
  startDate?: string
  endDate?: string
  search?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'priority'
  sortOrder?: 'asc' | 'desc'
}

// 批量操作请求
export interface BulkNotificationRequest {
  notificationIds: number[]
  action: 'mark_read' | 'mark_unread' | 'archive' | 'delete'
}

// WebSocket 连接管理
class WebSocketManager {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: NodeJS.Timeout | null = null
  private messageHandlers: Map<string, Function[]> = new Map()

  connect(url: string) {
    try {
      this.ws = new WebSocket(url)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        this.startHeartbeat()
      }

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data)
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.stopHeartbeat()
        this.reconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
    }
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)
        this.connect(this.ws!.url)
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1))
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000)
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private handleMessage(data: string) {
    try {
      const message = JSON.parse(data)

      if (message.type === 'pong') {
        return
      }

      const handlers = this.messageHandlers.get(message.type) || []
      handlers.forEach(handler => {
        try {
          handler(message)
        } catch (error) {
          console.error('Error in message handler:', error)
        }
      })

      // 发送到全局事件监听器
      if (message.type === 'notification') {
        window.dispatchEvent(new CustomEvent('notification', { detail: message }))
      }

    } catch (error) {
      console.error('Error parsing WebSocket message:', error)
    }
  }

  subscribe(type: string, handler: Function) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, [])
    }
    this.messageHandlers.get(type)!.push(handler)
  }

  unsubscribe(type: string, handler?: Function) {
    if (!this.messageHandlers.has(type)) return

    const handlers = this.messageHandlers.get(type)!
    if (handler) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    } else {
      handlers.length = 0
    }

    if (handlers.length === 0) {
      this.messageHandlers.delete(type)
    }
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  disconnect() {
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  getConnectionState() {
    return this.ws?.readyState ?? WebSocket.CLOSED
  }
}

// 通知API类
export class NotificationAPI {
  private wsManager: WebSocketManager

  constructor() {
    this.wsManager = new WebSocketManager()
  }

  /**
   * 获取通知列表
   */
  async getNotifications(params?: NotificationQuery): Promise<{ success: boolean; data: { items: Notification[]; pagination: any }; message?: string }> {
    try {
      const queryString = new URLSearchParams()
      if (params?.page) queryString.set('page', params.page.toString())
      if (params?.limit) queryString.set('limit', params.limit.toString())
      if (params?.type) queryString.set('type', params.type)
      if (params?.priority) queryString.set('priority', params.priority)
      if (params?.status) queryString.set('status', params.status)
      if (params?.category) queryString.set('category', params.category)
      if (params?.tags) queryString.set('tags', params.tags.join(','))
      if (params?.startDate) queryString.set('startDate', params.startDate)
      if (params?.endDate) queryString.set('endDate', params.endDate)
      if (params?.search) queryString.set('search', params.search)
      if (params?.sortBy) queryString.set('sortBy', params.sortBy)
      if (params?.sortOrder) queryString.set('sortOrder', params.sortOrder)

      const endpoint = queryString.toString() ? `/notifications?${queryString}` : '/notifications'
      const response = await httpClient.get<{ success: boolean; data: { items: Notification[]; pagination: any }; message?: string }>(endpoint)
      return response
    } catch (error) {
      console.error('Get notifications failed:', error)
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
        message: '获取通知列表失败'
      }
    }
  }

  /**
   * 获取通知详情
   */
  async getNotification(id: number): Promise<{ success: boolean; data?: Notification; message?: string }> {
    try {
      const response = await httpClient.get<{ success: boolean; data?: Notification; message?: string }>(`/notifications/${id}`)
      return response
    } catch (error) {
      console.error('Get notification failed:', error)
      return {
        success: false,
        message: '获取通知详情失败'
      }
    }
  }

  /**
   * 创建通知
   */
  async createNotification(data: CreateNotificationRequest): Promise<{ success: boolean; data?: Notification; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; data?: Notification; message?: string }>('/notifications', data)
      return response
    } catch (error) {
      console.error('Create notification failed:', error)
      return {
        success: false,
        message: '创建通知失败'
      }
    }
  }

  /**
   * 标记通知为已读
   */
  async markAsRead(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.patch<{ success: boolean; message?: string }>(`/notifications/${id}/read`)
      return response
    } catch (error) {
      console.error('Mark notification as read failed:', error)
      return {
        success: false,
        message: '标记通知为已读失败'
      }
    }
  }

  /**
   * 标记通知为未读
   */
  async markAsUnread(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.patch<{ success: boolean; message?: string }>(`/notifications/${id}/unread`)
      return response
    } catch (error) {
      console.error('Mark notification as unread failed:', error)
      return {
        success: false,
        message: '标记通知为未读失败'
      }
    }
  }

  /**
   * 批量操作通知
   */
  async bulkOperation(data: BulkNotificationRequest): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; message?: string }>('/notifications/bulk', data)
      return response
    } catch (error) {
      console.error('Bulk notification operation failed:', error)
      return {
        success: false,
        message: '批量操作通知失败'
      }
    }
  }

  /**
   * 删除通知
   */
  async deleteNotification(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.delete<{ success: boolean; message?: string }>(`/notifications/${id}`)
      return response
    } catch (error) {
      console.error('Delete notification failed:', error)
      return {
        success: false,
        message: '删除通知失败'
      }
    }
  }

  /**
   * 获取通知统计
   */
  async getNotificationStats(): Promise<{ success: boolean; data?: NotificationStats; message?: string }> {
    try {
      const response = await httpClient.get<{ success: boolean; data?: NotificationStats; message?: string }>('/notifications/stats')
      return response
    } catch (error) {
      console.error('Get notification stats failed:', error)
      return {
        success: false,
        message: '获取通知统计失败'
      }
    }
  }

  /**
   * 获取通知设置
   */
  async getNotificationSettings(): Promise<{ success: boolean; data?: NotificationSettings; message?: string }> {
    try {
      const response = await httpClient.get<{ success: boolean; data?: NotificationSettings; message?: string }>('/notifications/settings')
      return response
    } catch (error) {
      console.error('Get notification settings failed:', error)
      return {
        success: false,
        message: '获取通知设置失败'
      }
    }
  }

  /**
   * 更新通知设置
   */
  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<{ success: boolean; data?: NotificationSettings; message?: string }> {
    try {
      const response = await httpClient.put<{ success: boolean; data?: NotificationSettings; message?: string }>('/notifications/settings', settings)
      return response
    } catch (error) {
      console.error('Update notification settings failed:', error)
      return {
        success: false,
        message: '更新通知设置失败'
      }
    }
  }

  /**
   * 获取通知模板
   */
  async getNotificationTemplates(): Promise<{ success: boolean; data?: NotificationTemplate[]; message?: string }> {
    try {
      const response = await httpClient.get<{ success: boolean; data?: NotificationTemplate[]; message?: string }>('/notifications/templates')
      return response
    } catch (error) {
      console.error('Get notification templates failed:', error)
      return {
        success: false,
        message: '获取通知模板失败'
      }
    }
  }

  /**
   * 连接WebSocket
   */
  connectWebSocket(userId: number) {
    const wsUrl = `${API_BASE_URL.replace('http', 'ws')}/notifications/ws?userId=${userId}`
    this.wsManager.connect(wsUrl)
  }

  /**
   * 断开WebSocket
   */
  disconnectWebSocket() {
    this.wsManager.disconnect()
  }

  /**
   * 订阅通知事件
   */
  subscribe(eventType: string, handler: Function) {
    this.wsManager.subscribe(eventType, handler)
  }

  /**
   * 取消订阅通知事件
   */
  unsubscribe(eventType: string, handler?: Function) {
    this.wsManager.unsubscribe(eventType, handler)
  }

  /**
   * 获取WebSocket连接状态
   */
  getWebSocketState() {
    return this.wsManager.getConnectionState()
  }
}

// 创建通知API实例
export const notificationApi = new NotificationAPI()

// 导出便捷函数
export const getNotifications = (params?: NotificationQuery) => notificationApi.getNotifications(params)
export const getNotification = (id: number) => notificationApi.getNotification(id)
export const createNotification = (data: CreateNotificationRequest) => notificationApi.createNotification(data)
export const markAsRead = (id: number) => notificationApi.markAsRead(id)
export const markAsUnread = (id: number) => notificationApi.markAsUnread(id)
export const bulkOperationNotifications = (data: BulkNotificationRequest) => notificationApi.bulkOperation(data)
export const deleteNotification = (id: number) => notificationApi.deleteNotification(id)
export const getNotificationStats = () => notificationApi.getNotificationStats()
export const getNotificationSettings = () => notificationApi.getNotificationSettings()
export const updateNotificationSettings = (settings: Partial<NotificationSettings>) => notificationApi.updateNotificationSettings(settings)
export const getNotificationTemplates = () => notificationApi.getNotificationTemplates()

export default notificationApi