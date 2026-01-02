/**
 * @fileoverview 订单管理API模块
 * @description 处理订单相关的API请求，包括订单创建、查询、更新等功能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @modified 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

// 基础HTTP客户端实现
class HttpClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  // 构建完整URL
  private buildUrl(path: string, params?: Record<string, any>): string {
    const url = new URL(`${this.baseURL}${path}`)
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          if (Array.isArray(params[key])) {
            params[key].forEach((value: any) => {
              url.searchParams.append(`${key}[]`, String(value))
            })
          } else {
            url.searchParams.append(key, String(params[key]))
          }
        }
      })
    }
    
    return url.toString()
  }

  // 获取认证令牌
  private getAuthToken(): string | null {
    return localStorage.getItem('token')
  }

  // 构建请求头
  private buildHeaders(headers?: Record<string, string>): HeadersInit {
    const authToken = this.getAuthToken()
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json'
    }

    if (authToken) {
      defaultHeaders['Authorization'] = `Bearer ${authToken}`
    }

    return { ...defaultHeaders, ...headers }
  }

  // 处理响应
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP Error: ${response.status}`)
    }

    return response.json()
  }

  // GET请求
  async get<T>(path: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(path, params)
    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(headers)
    })

    return this.handleResponse<T>(response)
  }

  // POST请求
  async post<T>(path: string, data?: any, params?: Record<string, any>, headers?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(path, params)
    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(headers),
      body: data ? JSON.stringify(data) : undefined
    })

    return this.handleResponse<T>(response)
  }

  // PUT请求
  async put<T>(path: string, data?: any, params?: Record<string, any>, headers?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(path, params)
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(headers),
      body: data ? JSON.stringify(data) : undefined
    })

    return this.handleResponse<T>(response)
  }

  // PATCH请求
  async patch<T>(path: string, data?: any, params?: Record<string, any>, headers?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(path, params)
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(headers),
      body: data ? JSON.stringify(data) : undefined
    })

    return this.handleResponse<T>(response)
  }

  // DELETE请求
  async delete<T>(path: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(path, params)
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.buildHeaders(headers)
    })

    return this.handleResponse<T>(response)
  }
}

// 创建httpClient实例
const httpClient = new HttpClient(API_BASE_URL)

// 订单状态枚举
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

// 订单类型枚举
export enum OrderType {
  DINE_IN = 'dine_in',
  TAKEAWAY = 'takeaway',
  DELIVERY = 'delivery'
}

// 支付状态枚举
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
  FAILED = 'failed'
}

// 基础接口
export interface OrderItem {
  id: number
  orderId: number
  menuItemId: number
  name: string
  price: number
  quantity: number
  variations?: Record<string, any>
  additions?: Array<{
    name: string
    price: number
  }>
  notes?: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served'
}

export interface Order {
  id: number
  orderNumber: string
  customerId?: number
  customerName?: string
  customerPhone?: string
  type: OrderType
  status: OrderStatus
  paymentStatus: PaymentStatus
  totalAmount: number
  discountAmount: number
  taxAmount: number
  finalAmount: number
  items: OrderItem[]
  notes?: string
  tableNumber?: string
  deliveryAddress?: {
    address: string
    latitude?: number
    longitude?: number
    estimatedTime?: string
  }
  timestamps: {
    createdAt: string
    confirmedAt?: string
    preparedAt?: string
    readyAt?: string
    servedAt?: string
    completedAt?: string
    cancelledAt?: string
  }
  staff: {
    createdBy: string
    confirmedBy?: string
    preparedBy?: string
    servedBy?: string
  }
  source: 'pos' | 'web' | 'mobile' | 'third_party'
  channel?: string
  tags?: string[]
  rating?: {
    score: number
    comment?: string
    createdAt: string
  }
  metadata?: Record<string, any>
}

// 订单创建接口
export interface CreateOrderRequest {
  customerId?: number
  type: OrderType
  items: Array<{
    menuItemId: number
    quantity: number
    variations?: Record<string, any>
    additions?: number[]
    notes?: string
  }>
  tableNumber?: string
  deliveryAddress?: {
    address: string
    latitude?: number
    longitude?: number
  }
  notes?: string
  discountCode?: string
  tags?: string[]
}

// 订单更新接口
export interface UpdateOrderRequest {
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  notes?: string
  items?: Array<{
    id: number
    quantity: number
    status: OrderItem['status']
  }>
  tags?: string[]
}

// 订单统计接口
export interface OrderStats {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  ordersByStatus: Record<OrderStatus, number>
  ordersByType: Record<OrderType, number>
  revenueByHour: Array<{
    hour: number
    revenue: number
    orders: number
  }>
  topItems: Array<{
    name: string
    quantity: number
    revenue: number
  }>
  averagePreparationTime: number
  cancellationRate: number
  customerSatisfaction: number
}

// 订单流接口
export interface OrderFlow {
  id: number
  orderId: number
  currentStatus: OrderStatus
  nextStatuses: OrderStatus[]
  estimatedTimes: Array<{
    status: OrderStatus
    estimatedMinutes: number
  }>
  actualTimes: Array<{
    status: OrderStatus
    actualMinutes: number
  }>
  blocked: boolean
  blockReason?: string
}

// 厨房显示系统接口
export interface KitchenDisplay {
  id: number
  name: string
  station: string
  active: boolean
  orders: Array<{
    id: number
    orderNumber: string
    items: OrderItem[]
    status: OrderStatus
    priority: number
    timeElapsed: number
    estimatedTime: number
  }>
}

// 订单筛选接口
export interface OrderFilters {
  status?: OrderStatus[]
  type?: OrderType[]
  paymentStatus?: PaymentStatus[]
  customerId?: number
  dateRange?: {
    start: string
    end: string
  }
  tableNumber?: string
  staffId?: number
  minAmount?: number
  maxAmount?: number
  tags?: string[]
  search?: string
}

// 高级订单管理API
class OrderAPI {
  /**
   * 获取订单列表
   */
  async getOrders(filters?: OrderFilters): Promise<{
    success: boolean
    data?: {
      orders: Order[]
      total: number
      page: number
      pageSize: number
      stats: OrderStats
    }
    message?: string
  }> {
    try {
      const response = await httpClient.get('/orders', {
        params: filters
      })
      return response
    } catch (error) {
      console.error('Get orders failed:', error)
      throw error
    }
  }

  /**
   * 获取订单详情
   */
  async getOrder(id: number): Promise<{ success: boolean; data?: Order; message?: string }> {
    try {
      const response = await httpClient.get(`/orders/${id}`)
      return response
    } catch (error) {
      console.error('Get order failed:', error)
      throw error
    }
  }

  /**
   * 创建订单
   */
  async createOrder(order: CreateOrderRequest): Promise<{ success: boolean; data?: Order; message?: string }> {
    try {
      const response = await httpClient.post('/orders', order)
      return response
    } catch (error) {
      console.error('Create order failed:', error)
      throw error
    }
  }

  /**
   * 更新订单
   */
  async updateOrder(id: number, update: UpdateOrderRequest): Promise<{ success: boolean; data?: Order; message?: string }> {
    try {
      const response = await httpClient.put(`/orders/${id}`, update)
      return response
    } catch (error) {
      console.error('Update order failed:', error)
      throw error
    }
  }

  /**
   * 取消订单
   */
  async cancelOrder(id: number, reason?: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.post(`/orders/${id}/cancel`, { reason })
      return response
    } catch (error) {
      console.error('Cancel order failed:', error)
      throw error
    }
  }

  /**
   * 退款订单
   */
  async refundOrder(id: number, amount?: number, reason?: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.post(`/orders/${id}/refund`, { amount, reason })
      return response
    } catch (error) {
      console.error('Refund order failed:', error)
      throw error
    }
  }

  /**
   * 更新订单状态
   */
  async updateOrderStatus(id: number, status: OrderStatus, notes?: string): Promise<{ success: boolean; data?: Order; message?: string }> {
    try {
      const response = await httpClient.patch(`/orders/${id}/status`, { status, notes })
      return response
    } catch (error) {
      console.error('Update order status failed:', error)
      throw error
    }
  }

  /**
   * 分配订单到厨房
   */
  async assignToKitchen(id: number, station: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.post(`/orders/${id}/assign`, { station })
      return response
    } catch (error) {
      console.error('Assign to kitchen failed:', error)
      throw error
    }
  }

  /**
   * 获取订单流
   */
  async getOrderFlow(id: number): Promise<{ success: boolean; data?: OrderFlow; message?: string }> {
    try {
      const response = await httpClient.get(`/orders/${id}/flow`)
      return response
    } catch (error) {
      console.error('Get order flow failed:', error)
      throw error
    }
  }

  /**
   * 更新订单流状态
   */
  async updateOrderFlow(id: number, status: OrderStatus): Promise<{ success: boolean; data?: OrderFlow; message?: string }> {
    try {
      const response = await httpClient.patch(`/orders/${id}/flow`, { status })
      return response
    } catch (error) {
      console.error('Update order flow failed:', error)
      throw error
    }
  }

  /**
   * 获取厨房显示系统数据
   */
  async getKitchenDisplays(station?: string): Promise<{ success: boolean; data?: KitchenDisplay[]; message?: string }> {
    try {
      const response = await httpClient.get('/orders/kitchen-displays', {
        params: { station }
      })
      return response
    } catch (error) {
      console.error('Get kitchen displays failed:', error)
      throw error
    }
  }

  /**
   * 更新厨房显示系统
   */
  async updateKitchenDisplay(id: number, display: Partial<KitchenDisplay>): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.put(`/orders/kitchen-displays/${id}`, display)
      return response
    } catch (error) {
      console.error('Update kitchen display failed:', error)
      throw error
    }
  }

  /**
   * 获取订单统计
   */
  async getOrderStats(period?: 'today' | 'week' | 'month' | 'quarter' | 'year'): Promise<{ success: boolean; data?: OrderStats; message?: string }> {
    try {
      const response = await httpClient.get('/orders/stats', {
        params: { period }
      })
      return response
    } catch (error) {
      console.error('Get order stats failed:', error)
      throw error
    }
  }

  /**
   * 获取实时订单监控
   */
  async getLiveOrders(): Promise<{ success: boolean; data?: Order[]; message?: string }> {
    try {
      const response = await httpClient.get('/orders/live')
      return response
    } catch (error) {
      console.error('Get live orders failed:', error)
      throw error
    }
  }

  /**
   * 批量操作订单
   */
  async batchUpdateOrders(orderIds: number[], update: UpdateOrderRequest): Promise<{ success: boolean; updated: number; failed: number; message?: string }> {
    try {
      const response = await httpClient.post('/orders/batch', {
        orderIds,
        update
      })
      return response
    } catch (error) {
      console.error('Batch update orders failed:', error)
      throw error
    }
  }

  /**
   * 导出订单
   */
  async exportOrders(filters?: OrderFilters, format?: 'excel' | 'csv' | 'pdf'): Promise<Blob> {
    try {
      const url = new URL(`${API_BASE_URL}/orders/export`)
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key] !== undefined && filters[key] !== null) {
            url.searchParams.append(key, String(filters[key]))
          }
        })
      }
      if (format) {
        url.searchParams.append('format', format)
      }

      const authToken = localStorage.getItem('token')
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': authToken ? `Bearer ${authToken}` : ''
        }
      })

      if (!response.ok) {
        throw new Error(`Export orders failed: ${response.status}`)
      }

      return response.blob()
    } catch (error) {
      console.error('Export orders failed:', error)
      throw error
    }
  }

  /**
   * 打印订单
   */
  async printOrder(id: number, printer?: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.post(`/orders/${id}/print`, { printer })
      return response
    } catch (error) {
      console.error('Print order failed:', error)
      throw error
    }
  }

  /**
   * 发送订单通知
   */
  async sendOrderNotification(id: number, type: 'sms' | 'email' | 'push', message?: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.post(`/orders/${id}/notify`, {
        type,
        message
      })
      return response
    } catch (error) {
      console.error('Send order notification failed:', error)
      throw error
    }
  }

  /**
   * 获取订单时间线
   */
  async getOrderTimeline(id: number): Promise<{ success: boolean; data?: Array<{
    timestamp: string
    status: OrderStatus
    staff: string
    notes?: string
  }>; message?: string }> {
    try {
      const response = await httpClient.get(`/orders/${id}/timeline`)
      return response
    } catch (error) {
      console.error('Get order timeline failed:', error)
      throw error
    }
  }

  /**
   * 重新计算订单金额
   */
  async recalculateOrder(id: number): Promise<{ success: boolean; data?: { totalAmount: number; finalAmount: number }; message?: string }> {
    try {
      const response = await httpClient.post(`/orders/${id}/recalculate`)
      return response
    } catch (error) {
      console.error('Recalculate order failed:', error)
      throw error
    }
  }

  /**
   * 获取推荐商品
   */
  async getRecommendations(customerId?: number, orderId?: number): Promise<{ success: boolean; data?: Array<{
    id: number
    name: string
    price: number
    reason: string
  }>; message?: string }> {
    try {
      const response = await httpClient.get('/orders/recommendations', {
        params: { customerId, orderId }
      })
      return response
    } catch (error) {
      console.error('Get recommendations failed:', error)
      throw error
    }
  }
}

export const orderAPI = new OrderAPI()
export default orderAPI