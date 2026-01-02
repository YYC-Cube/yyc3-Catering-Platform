/**
 * YYC³餐饮行业智能化平台 - 订单管理API
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

// 订单状态枚举
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// 订单项接口
export interface OrderItem {
  menuItemId: number
  quantity: number
  price: number
  customizations?: Record<string, any>
}

// 订单接口
export interface Order {
  id: number
  orderNumber: string
  userId: number
  restaurantId?: number
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  deliveryAddress: string
  contactPhone: string
  specialInstructions?: string
  createdAt: string
  estimatedDeliveryTime?: string
  actualDeliveryTime?: string
  updatedAt?: string
}

// 创建订单请求
export interface CreateOrderRequest {
  items: OrderItem[]
  deliveryAddress: string
  contactPhone: string
  specialInstructions?: string
}

// 更新订单请求
export interface UpdateOrderRequest {
  status?: OrderStatus
  deliveryAddress?: string
  contactPhone?: string
  specialInstructions?: string
}

// 分页响应
export interface PaginatedResponse<T> {
  success: boolean
  data: {
    orders: T[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  timestamp?: string
}

// 订单查询参数
export interface OrderQueryParams {
  page?: number
  limit?: number
  status?: OrderStatus
  userId?: number
  startDate?: string
  endDate?: string
  search?: string
}

// 订单统计
export interface OrderStats {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  completedOrders: number
  cancelledOrders: number
  averageOrderValue: number
}

// 订单API类
export class OrderAPI {
  /**
   * 获取订单列表
   */
  static async getOrders(params?: OrderQueryParams): Promise<PaginatedResponse<Order>> {
    try {
      const queryString = new URLSearchParams()
      if (params?.page) queryString.set('page', params.page.toString())
      if (params?.limit) queryString.set('limit', params.limit.toString())
      if (params?.status) queryString.set('status', params.status)
      if (params?.userId) queryString.set('userId', params.userId.toString())
      if (params?.startDate) queryString.set('startDate', params.startDate)
      if (params?.endDate) queryString.set('endDate', params.endDate)
      if (params?.search) queryString.set('search', params.search)

      const endpoint = queryString.toString() ? `/orders?${queryString}` : '/orders'
      const response = await httpClient.get<PaginatedResponse<Order>>(endpoint)
      return response
    } catch (error) {
      console.error('Get orders failed:', error)
      return {
        success: false,
        data: {
          orders: [],
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
   * 获取订单详情
   */
  static async getOrder(id: number): Promise<{ success: boolean; data?: Order; message?: string }> {
    try {
      const response = await httpClient.get<{ success: boolean; data?: Order; message?: string }>(`/orders/${id}`)
      return response
    } catch (error) {
      console.error('Get order failed:', error)
      return {
        success: false,
        message: '获取订单详情失败'
      }
    }
  }

  /**
   * 根据订单号获取订单
   */
  static async getOrderByNumber(orderNumber: string): Promise<{ success: boolean; data?: Order; message?: string }> {
    try {
      const response = await httpClient.get<{ success: boolean; data?: Order; message?: string }>(`/orders/number/${orderNumber}`)
      return response
    } catch (error) {
      console.error('Get order by number failed:', error)
      return {
        success: false,
        message: '获取订单详情失败'
      }
    }
  }

  /**
   * 创建订单
   */
  static async createOrder(orderData: CreateOrderRequest): Promise<{ success: boolean; data?: Order; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; data?: Order; message?: string }>('/orders', orderData)
      return response
    } catch (error) {
      console.error('Create order failed:', error)
      return {
        success: false,
        message: '创建订单失败'
      }
    }
  }

  /**
   * 更新订单
   */
  static async updateOrder(id: number, orderData: UpdateOrderRequest): Promise<{ success: boolean; data?: Order; message?: string }> {
    try {
      const response = await httpClient.put<{ success: boolean; data?: Order; message?: string }>(`/orders/${id}`, orderData)
      return response
    } catch (error) {
      console.error('Update order failed:', error)
      return {
        success: false,
        message: '更新订单失败'
      }
    }
  }

  /**
   * 更新订单状态
   */
  static async updateOrderStatus(id: number, status: OrderStatus): Promise<{ success: boolean; data?: Order; message?: string }> {
    try {
      const response = await httpClient.patch<{ success: boolean; data?: Order; message?: string }>(`/orders/${id}/status`, { status })
      return response
    } catch (error) {
      console.error('Update order status failed:', error)
      return {
        success: false,
        message: '更新订单状态失败'
      }
    }
  }

  /**
   * 取消订单
   */
  static async cancelOrder(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; message?: string }>(`/orders/${id}/cancel`)
      return response
    } catch (error) {
      console.error('Cancel order failed:', error)
      return {
        success: false,
        message: '取消订单失败'
      }
    }
  }

  /**
   * 删除订单
   */
  static async deleteOrder(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.delete<{ success: boolean; message?: string }>(`/orders/${id}`)
      return response
    } catch (error) {
      console.error('Delete order failed:', error)
      return {
        success: false,
        message: '删除订单失败'
      }
    }
  }

  /**
   * 搜索订单
   */
  static async searchOrders(query: string, params?: OrderQueryParams): Promise<PaginatedResponse<Order>> {
    return this.getOrders({ ...params, search: query })
  }

  /**
   * 获取订单统计
   */
  static async getOrderStats(params?: {
    startDate?: string
    endDate?: string
  }): Promise<{ success: boolean; data?: OrderStats; message?: string }> {
    try {
      const queryString = new URLSearchParams()
      if (params?.startDate) queryString.set('startDate', params.startDate)
      if (params?.endDate) queryString.set('endDate', params.endDate)

      const endpoint = queryString.toString() ? `/orders/stats?${queryString}` : '/orders/stats'
      const response = await httpClient.get<{ success: boolean; data?: OrderStats; message?: string }>(endpoint)
      return response
    } catch (error) {
      console.error('Get order stats failed:', error)
      return {
        success: false,
        message: '获取订单统计失败'
      }
    }
  }

  /**
   * 获取销售报告
   */
  static async getSalesReport(params?: {
    startDate?: string
    endDate?: string
    groupBy?: 'day' | 'week' | 'month'
  }): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const queryString = new URLSearchParams()
      if (params?.startDate) queryString.set('startDate', params.startDate)
      if (params?.endDate) queryString.set('endDate', params.endDate)
      if (params?.groupBy) queryString.set('groupBy', params.groupBy)

      const endpoint = queryString.toString() ? `/orders/reports/sales?${queryString}` : '/orders/reports/sales'
      const response = await httpClient.get<{ success: boolean; data?: any; message?: string }>(endpoint)
      return response
    } catch (error) {
      console.error('Get sales report failed:', error)
      return {
        success: false,
        message: '获取销售报告失败'
      }
    }
  }

  /**
   * 批量更新订单状态
   */
  static async batchUpdateOrderStatus(orderIds: number[], status: OrderStatus): Promise<{ success: boolean; message?: string; failed?: number[] }> {
    try {
      const response = await httpClient.patch<{ success: boolean; message?: string; failed?: number[] }>('/orders/batch/status', {
        orderIds,
        status
      })
      return response
    } catch (error) {
      console.error('Batch update order status failed:', error)
      return {
        success: false,
        message: '批量更新订单状态失败'
      }
    }
  }
}

// 创建订单API实例
export const orderApi = new OrderAPI()

// 导出便捷函数
export const getOrders = (params?: OrderQueryParams) => orderApi.getOrders(params)
export const getOrder = (id: number) => orderApi.getOrder(id)
export const getOrderByNumber = (orderNumber: string) => orderApi.getOrderByNumber(orderNumber)
export const createOrder = (orderData: CreateOrderRequest) => orderApi.createOrder(orderData)
export const updateOrder = (id: number, orderData: UpdateOrderRequest) => orderApi.updateOrder(id, orderData)
export const updateOrderStatus = (id: number, status: OrderStatus) => orderApi.updateOrderStatus(id, status)
export const cancelOrder = (id: number) => orderApi.cancelOrder(id)
export const deleteOrder = (id: number) => orderApi.deleteOrder(id)
export const searchOrders = (query: string, params?: OrderQueryParams) => orderApi.searchOrders(query, params)
export const getOrderStats = (params?: { startDate?: string; endDate?: string }) => orderApi.getOrderStats(params)
export const getSalesReport = (params?: { startDate?: string; endDate?: string; groupBy?: 'day' | 'week' | 'month' }) => orderApi.getSalesReport(params)
export const batchUpdateOrderStatus = (orderIds: number[], status: OrderStatus) => orderApi.batchUpdateOrderStatus(orderIds, status)

export default orderApi