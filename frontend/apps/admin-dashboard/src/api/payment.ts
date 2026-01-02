/**
 * YYC³餐饮行业智能化平台 - 支付管理API
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

// 支付方式枚举
export enum PaymentMethod {
  ALIPAY = 'alipay',
  WECHAT = 'wechat',
  UNIONPAY = 'unionpay',
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  DIGITAL_WALLET = 'digital_wallet',
  MEMBER_BALANCE = 'member_balance'
}

// 支付状态枚举
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

// 退款状态枚举
export enum RefundStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// 支付配置接口
export interface PaymentConfig {
  id: number
  method: PaymentMethod
  name: string
  displayName: string
  description?: string
  enabled: boolean
  config: {
    appId?: string
    merchantId?: string
    apiKey?: string
    apiSecret?: string
    publicKey?: string
    privateKey?: string
    notifyUrl?: string
    returnUrl?: string
    supportedCurrencies?: string[]
    minAmount?: number
    maxAmount?: number
    feeRate?: number
    fixedFee?: number
  }
  createdAt: string
  updatedAt?: string
}

// 交易记录接口
export interface PaymentTransaction {
  id: number
  transactionId: string
  orderId: string
  paymentMethod: PaymentMethod
  amount: number
  currency: string
  status: PaymentStatus
  paymentTime?: string
  failureReason?: string
  externalTransactionId?: string
  gatewayResponse?: any
  refundAmount?: number
  refundedAt?: string
  createdAt: string
  updatedAt?: string
}

// 退款记录接口
export interface RefundRecord {
  id: number
  refundId: string
  transactionId: string
  orderId: string
  amount: number
  reason: string
  status: RefundStatus
  processedAt?: string
  failureReason?: string
  externalRefundId?: string
  gatewayResponse?: any
  createdAt: string
  updatedAt?: string
}

// 支付统计接口
export interface PaymentStats {
  totalTransactions: number
  totalRevenue: {
    [currency: string]: number
  }
  totalRefunds: {
    [currency: string]: number
  }
  netRevenue: {
    [currency: string]: number
  }
  successRate: number
  averageOrderValue: {
    [currency: string]: number
  }
  transactionsByMethod: {
    [key in PaymentMethod]: {
      count: number
      amount: number
      successRate: number
    }
  }
  dailyStats: {
    date: string
    revenue: number
    transactions: number
    refunds: number
  }[]
  monthlyStats: {
    month: string
    revenue: number
    transactions: number
    refunds: number
  }[]
}

// 创建支付配置请求
export interface CreatePaymentConfigRequest {
  method: PaymentMethod
  name: string
  displayName: string
  description?: string
  enabled: boolean
  config: {
    appId?: string
    merchantId?: string
    apiKey?: string
    apiSecret?: string
    publicKey?: string
    privateKey?: string
    notifyUrl?: string
    returnUrl?: string
    supportedCurrencies?: string[]
    minAmount?: number
    maxAmount?: number
    feeRate?: number
    fixedFee?: number
  }
}

// 更新支付配置请求
export interface UpdatePaymentConfigRequest {
  name?: string
  displayName?: string
  description?: string
  enabled?: boolean
  config?: {
    appId?: string
    merchantId?: string
    apiKey?: string
    apiSecret?: string
    publicKey?: string
    privateKey?: string
    notifyUrl?: string
    returnUrl?: string
    supportedCurrencies?: string[]
    minAmount?: number
    maxAmount?: number
    feeRate?: number
    fixedFee?: number
  }
}

// 创建退款请求
export interface CreateRefundRequest {
  transactionId: string
  amount: number
  reason: string
}

// 查询参数
export interface PaymentQueryParams {
  page?: number
  limit?: number
  search?: string
  paymentMethod?: PaymentMethod
  status?: PaymentStatus
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  orderId?: string
  transactionId?: string
  sortBy?: 'createdAt' | 'amount' | 'paymentTime'
  sortOrder?: 'asc' | 'desc'
}

// 支付API类
export class PaymentAPI {
  /**
   * 获取支付配置列表
   */
  async getPaymentConfigs(): Promise<{ success: boolean; data?: PaymentConfig[]; message?: string }> {
    try {
      const response = await httpClient.get<{ success: boolean; data?: PaymentConfig[]; message?: string }>('/payment/configs')
      return response
    } catch (error) {
      console.error('Get payment configs failed:', error)
      return {
        success: false,
        message: '获取支付配置失败'
      }
    }
  }

  /**
   * 获取支付配置详情
   */
  async getPaymentConfig(id: number): Promise<{ success: boolean; data?: PaymentConfig; message?: string }> {
    try {
      const response = await httpClient.get<{ success: boolean; data?: PaymentConfig; message?: string }>(`/payment/configs/${id}`)
      return response
    } catch (error) {
      console.error('Get payment config failed:', error)
      return {
        success: false,
        message: '获取支付配置详情失败'
      }
    }
  }

  /**
   * 创建支付配置
   */
  async createPaymentConfig(configData: CreatePaymentConfigRequest): Promise<{ success: boolean; data?: PaymentConfig; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; data?: PaymentConfig; message?: string }>('/payment/configs', configData)
      return response
    } catch (error) {
      console.error('Create payment config failed:', error)
      return {
        success: false,
        message: '创建支付配置失败'
      }
    }
  }

  /**
   * 更新支付配置
   */
  async updatePaymentConfig(id: number, configData: UpdatePaymentConfigRequest): Promise<{ success: boolean; data?: PaymentConfig; message?: string }> {
    try {
      const response = await httpClient.put<{ success: boolean; data?: PaymentConfig; message?: string }>(`/payment/configs/${id}`, configData)
      return response
    } catch (error) {
      console.error('Update payment config failed:', error)
      return {
        success: false,
        message: '更新支付配置失败'
      }
    }
  }

  /**
   * 删除支付配置
   */
  async deletePaymentConfig(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.delete<{ success: boolean; message?: string }>(`/payment/configs/${id}`)
      return response
    } catch (error) {
      console.error('Delete payment config failed:', error)
      return {
        success: false,
        message: '删除支付配置失败'
      }
    }
  }

  /**
   * 启用/禁用支付配置
   */
  async togglePaymentConfig(id: number, enabled: boolean): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.patch<{ success: boolean; message?: string }>(`/payment/configs/${id}/toggle`, { enabled })
      return response
    } catch (error) {
      console.error('Toggle payment config failed:', error)
      return {
        success: false,
        message: enabled ? '启用支付配置失败' : '禁用支付配置失败'
      }
    }
  }

  /**
   * 获取交易记录列表
   */
  async getPaymentTransactions(params?: PaymentQueryParams): Promise<{ success: boolean; data: { items: PaymentTransaction[]; pagination: any }; message?: string }> {
    try {
      const queryString = new URLSearchParams()
      if (params?.page) queryString.set('page', params.page.toString())
      if (params?.limit) queryString.set('limit', params.limit.toString())
      if (params?.search) queryString.set('search', params.search)
      if (params?.paymentMethod) queryString.set('paymentMethod', params.paymentMethod)
      if (params?.status) queryString.set('status', params.status)
      if (params?.startDate) queryString.set('startDate', params.startDate)
      if (params?.endDate) queryString.set('endDate', params.endDate)
      if (params?.minAmount) queryString.set('minAmount', params.minAmount.toString())
      if (params?.maxAmount) queryString.set('maxAmount', params.maxAmount.toString())
      if (params?.orderId) queryString.set('orderId', params.orderId)
      if (params?.transactionId) queryString.set('transactionId', params.transactionId)
      if (params?.sortBy) queryString.set('sortBy', params.sortBy)
      if (params?.sortOrder) queryString.set('sortOrder', params.sortOrder)

      const endpoint = queryString.toString() ? `/payment/transactions?${queryString}` : '/payment/transactions'
      const response = await httpClient.get<{ success: boolean; data: { items: PaymentTransaction[]; pagination: any }; message?: string }>(endpoint)
      return response
    } catch (error) {
      console.error('Get payment transactions failed:', error)
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
        message: '获取交易记录失败'
      }
    }
  }

  /**
   * 获取交易详情
   */
  async getPaymentTransaction(id: number): Promise<{ success: boolean; data?: PaymentTransaction; message?: string }> {
    try {
      const response = await httpClient.get<{ success: boolean; data?: PaymentTransaction; message?: string }>(`/payment/transactions/${id}`)
      return response
    } catch (error) {
      console.error('Get payment transaction failed:', error)
      return {
        success: false,
        message: '获取交易详情失败'
      }
    }
  }

  /**
   * 获取退款记录列表
   */
  async getRefundRecords(params?: PaymentQueryParams): Promise<{ success: boolean; data: { items: RefundRecord[]; pagination: any }; message?: string }> {
    try {
      const queryString = new URLSearchParams()
      if (params?.page) queryString.set('page', params.page.toString())
      if (params?.limit) queryString.set('limit', params.limit.toString())
      if (params?.search) queryString.set('search', params.search)
      if (params?.startDate) queryString.set('startDate', params.startDate)
      if (params?.endDate) queryString.set('endDate', params.endDate)

      const endpoint = queryString.toString() ? `/payment/refunds?${queryString}` : '/payment/refunds'
      const response = await httpClient.get<{ success: boolean; data: { items: RefundRecord[]; pagination: any }; message?: string }>(endpoint)
      return response
    } catch (error) {
      console.error('Get refund records failed:', error)
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
        message: '获取退款记录失败'
      }
    }
  }

  /**
   * 创建退款
   */
  async createRefund(refundData: CreateRefundRequest): Promise<{ success: boolean; data?: RefundRecord; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; data?: RefundRecord; message?: string }>('/payment/refunds', refundData)
      return response
    } catch (error) {
      console.error('Create refund failed:', error)
      return {
        success: false,
        message: '创建退款失败'
      }
    }
  }

  /**
   * 获取支付统计数据
   */
  async getPaymentStats(params?: {
    startDate?: string
    endDate?: string
    groupBy?: 'day' | 'week' | 'month'
  }): Promise<{ success: boolean; data?: PaymentStats; message?: string }> {
    try {
      const queryString = new URLSearchParams()
      if (params?.startDate) queryString.set('startDate', params.startDate)
      if (params?.endDate) queryString.set('endDate', params.endDate)
      if (params?.groupBy) queryString.set('groupBy', params.groupBy)

      const endpoint = queryString.toString() ? `/payment/stats?${queryString}` : '/payment/stats'
      const response = await httpClient.get<{ success: boolean; data?: PaymentStats; message?: string }>(endpoint)
      return response
    } catch (error) {
      console.error('Get payment stats failed:', error)
      return {
        success: false,
        message: '获取支付统计失败'
      }
    }
  }

  /**
   * 测试支付配置
   */
  async testPaymentConfig(id: number, testData?: { amount?: number }): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; data?: any; message?: string }>(`/payment/configs/${id}/test`, testData || { amount: 1 })
      return response
    } catch (error) {
      console.error('Test payment config failed:', error)
      return {
        success: false,
        message: '测试支付配置失败'
      }
    }
  }

  /**
   * 导出交易记录
   */
  async exportTransactions(params?: PaymentQueryParams): Promise<{ success: boolean; data?: { downloadUrl: string }; message?: string }> {
    try {
      const queryString = new URLSearchParams()
      if (params?.startDate) queryString.set('startDate', params.startDate)
      if (params?.endDate) queryString.set('endDate', params.endDate)
      if (params?.paymentMethod) queryString.set('paymentMethod', params.paymentMethod)
      if (params?.status) queryString.set('status', params.status)

      const endpoint = queryString.toString() ? `/payment/transactions/export?${queryString}` : '/payment/transactions/export'
      const response = await httpClient.get<{ success: boolean; data?: { downloadUrl: string }; message?: string }>(endpoint)
      return response
    } catch (error) {
      console.error('Export transactions failed:', error)
      return {
        success: false,
        message: '导出交易记录失败'
      }
    }
  }

  /**
   * 导出退款记录
   */
  async exportRefunds(params?: PaymentQueryParams): Promise<{ success: boolean; data?: { downloadUrl: string }; message?: string }> {
    try {
      const queryString = new URLSearchParams()
      if (params?.startDate) queryString.set('startDate', params.startDate)
      if (params?.endDate) queryString.set('endDate', params.endDate)

      const endpoint = queryString.toString() ? `/payment/refunds/export?${queryString}` : '/payment/refunds/export'
      const response = await httpClient.get<{ success: boolean; data?: { downloadUrl: string }; message?: string }>(endpoint)
      return response
    } catch (error) {
      console.error('Export refunds failed:', error)
      return {
        success: false,
        message: '导出退款记录失败'
      }
    }
  }
}

// 创建支付API实例
export const paymentApi = new PaymentAPI()

// 导出便捷函数
export const getPaymentConfigs = () => paymentApi.getPaymentConfigs()
export const getPaymentConfig = (id: number) => paymentApi.getPaymentConfig(id)
export const createPaymentConfig = (configData: CreatePaymentConfigRequest) => paymentApi.createPaymentConfig(configData)
export const updatePaymentConfig = (id: number, configData: UpdatePaymentConfigRequest) => paymentApi.updatePaymentConfig(id, configData)
export const deletePaymentConfig = (id: number) => paymentApi.deletePaymentConfig(id)
export const togglePaymentConfig = (id: number, enabled: boolean) => paymentApi.togglePaymentConfig(id, enabled)
export const getPaymentTransactions = (params?: PaymentQueryParams) => paymentApi.getPaymentTransactions(params)
export const getPaymentTransaction = (id: number) => paymentApi.getPaymentTransaction(id)
export const getRefundRecords = (params?: PaymentQueryParams) => paymentApi.getRefundRecords(params)
export const createRefund = (refundData: CreateRefundRequest) => paymentApi.createRefund(refundData)
export const getPaymentStats = (params?: { startDate?: string; endDate?: string; groupBy?: 'day' | 'week' | 'month' }) => paymentApi.getPaymentStats(params)
export const testPaymentConfig = (id: number, testData?: { amount?: number }) => paymentApi.testPaymentConfig(id, testData)
export const exportTransactions = (params?: PaymentQueryParams) => paymentApi.exportTransactions(params)
export const exportRefunds = (params?: PaymentQueryParams) => paymentApi.exportRefunds(params)

export default paymentApi