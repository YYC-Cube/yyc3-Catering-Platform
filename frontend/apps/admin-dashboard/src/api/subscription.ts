// HTTP Client Configuration
const API_BASE_URL = '/api/subscription'

// Simple fetch-based HTTP Client
class HttpClient {
  private buildUrl(path: string, params?: Record<string, any>): string {
    const url = new URL(`${API_BASE_URL}${path}`)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }
    
    return url.toString()
  }

  private async getHeaders(includeAuth: boolean = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }
    
    if (includeAuth) {
      const token = localStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }
    
    return headers
  }

  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    const response = await fetch(this.buildUrl(path, params), {
      method: 'GET',
      headers: await this.getHeaders()
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async post<T>(path: string, data?: any): Promise<T> {
    const response = await fetch(this.buildUrl(path), {
      method: 'POST',
      headers: await this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async put<T>(path: string, data?: any): Promise<T> {
    const response = await fetch(this.buildUrl(path), {
      method: 'PUT',
      headers: await this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async delete<T>(path: string): Promise<T> {
    const response = await fetch(this.buildUrl(path), {
      method: 'DELETE',
      headers: await this.getHeaders()
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }
}

// Create HTTP client instance
const httpClient = new HttpClient()

// 订阅套餐类型
export enum SubscriptionType {
  BASIC = 'basic',           // 基础版
  PROFESSIONAL = 'professional', // 专业版
  ENTERPRISE = 'enterprise',     // 企业版
  CUSTOM = 'custom'             // 定制版
}

// 计费周期
export enum BillingCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

// 订阅状态
export enum SubscriptionStatus {
  ACTIVE = 'active',
  TRIAL = 'trial',
  PAST_DUE = 'past_due',
  CANCELLED = 'cancelled',
  PAUSED = 'paused'
}

// 套餐配置接口
export interface SubscriptionPlan {
  id: string
  name: string
  type: SubscriptionType
  description: string
  price: {
    monthly: number
    quarterly: number
    yearly: number
  }
  features: {
    // 基础功能
    maxUsers: number
    maxOrders: number
    maxProducts: number
    maxStorage: number // GB

    // 高级功能
    aiAnalysis: boolean
    advancedReporting: boolean
    apiAccess: boolean
    prioritySupport: boolean
    customBranding: boolean
    dataExport: boolean

    // 企业功能
    ssoIntegration: boolean
    auditLog: boolean
    customTraining: boolean
    dedicatedSupport: boolean
    slaGuarantee: boolean
  }
  limits: {
    apiCallsPerMonth: number
    dataRetentionDays: number
    concurrentConnections: number
  }
  popular?: boolean
  recommended?: boolean
}

// 用户订阅信息
export interface UserSubscription {
  id: string
  userId: string
  planId: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  currentPeriod: {
    start: string
    end: string
  }
  billingCycle: BillingCycle
  price: number
  nextBillingDate: string
  canceledAt?: string
  trialEndsAt?: string
  usage: {
    currentOrders: number
    currentUsers: number
    currentProducts: number
    currentStorage: number
    apiCalls: number
  }
  paymentMethod: {
    type: 'card' | 'bank_account' | 'alipay' | 'wechat'
    last4?: string
    brand?: string
    expiryMonth?: number
    expiryYear?: number
  }
  discounts: Array<{
    id: string
    type: 'percentage' | 'fixed_amount'
    value: number
    description: string
    expiresAt?: string
  }>
}

// 使用记录
export interface UsageRecord {
  id: string
  subscriptionId: string
  period: string
  metrics: {
    orders: number
    users: number
    products: number
    storage: number
    apiCalls: number
    aiRequests: number
    dataExports: number
  }
  costs: {
    baseCost: number
    usageCost: number
    discount: number
    totalCost: number
  }
  recordedAt: string
}

// 发票信息
export interface Invoice {
  id: string
  subscriptionId: string
  number: string
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  total: number
  subtotal: number
  tax: number
  discount: number
  currency: string
  dueDate: string
  paidAt?: string
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    amount: number
  }>
  pdfUrl?: string
  createdAt: string
}

// 支付方式
export interface PaymentMethod {
  id: string
  type: 'card' | 'bank_account' | 'alipay' | 'wechat'
  card?: {
    brand: string
    last4: string
    expiryMonth: number
    expiryYear: number
    fingerprint: string
  }
  billing?: {
    name: string
    email: string
    phone: string
    address: {
      line1: string
      city: string
      state: string
      postalCode: string
      country: string
    }
  }
  isDefault: boolean
  createdAt: string
}

// 订阅管理API
class SubscriptionAPI {
  /**
   * 获取所有可用套餐
   */
  async getPlans(): Promise<{
    success: boolean
    data?: SubscriptionPlan[]
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/subscription/plans')
      return response.data
    } catch (error) {
      console.error('Get subscription plans failed:', error)
      throw error
    }
  }

  /**
   * 获取当前用户订阅信息
   */
  async getCurrentSubscription(): Promise<{
    success: boolean
    data?: UserSubscription
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/subscription/current')
      return response.data
    } catch (error) {
      console.error('Get current subscription failed:', error)
      throw error
    }
  }

  /**
   * 创建订阅
   */
  async createSubscription(params: {
    planId: string
    billingCycle: BillingCycle
    paymentMethodId?: string
    trialDays?: number
    promotionCode?: string
  }): Promise<{
    success: boolean
    data?: {
      subscription: UserSubscription
      clientSecret?: string // 用于支付确认
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/subscription/create', params)
      return response.data
    } catch (error) {
      console.error('Create subscription failed:', error)
      throw error
    }
  }

  /**
   * 更新订阅
   */
  async updateSubscription(params: {
    planId?: string
    billingCycle?: BillingCycle
    quantity?: number
    promotionCode?: string
  }): Promise<{
    success: boolean
    data?: UserSubscription
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.put('/subscription/update', params)
      return response.data
    } catch (error) {
      console.error('Update subscription failed:', error)
      throw error
    }
  }

  /**
   * 取消订阅
   */
  async cancelSubscription(params: {
    reason?: string
    feedback?: string
    immediate?: boolean
  }): Promise<{
    success: boolean
    data?: {
      canceledAt: string
      accessUntil: string
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/subscription/cancel', params)
      return response.data
    } catch (error) {
      console.error('Cancel subscription failed:', error)
      throw error
    }
  }

  /**
   * 恢复订阅
   */
  async resumeSubscription(): Promise<{
    success: boolean
    data?: UserSubscription
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/subscription/resume')
      return response.data
    } catch (error) {
      console.error('Resume subscription failed:', error)
      throw error
    }
  }

  /**
   * 暂停订阅
   */
  async pauseSubscription(params: {
    pauseBehavior: 'void_invoices' | 'keep_invoice_draft'
    resumesAt?: string
  }): Promise<{
    success: boolean
    data?: {
      pausedAt: string
      resumesAt?: string
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/subscription/pause', params)
      return response.data
    } catch (error) {
      console.error('Pause subscription failed:', error)
      throw error
    }
  }

  /**
   * 获取使用记录
   */
  async getUsageRecords(params?: {
    period?: string
    limit?: number
    offset?: number
  }): Promise<{
    success: boolean
    data?: {
      records: UsageRecord[]
      total: number
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/subscription/usage', {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get usage records failed:', error)
      throw error
    }
  }

  /**
   * 获取当前使用情况
   */
  async getCurrentUsage(): Promise<{
    success: boolean
    data?: {
      currentPeriod: {
        start: string
        end: string
      }
      usage: {
        orders: { current: number; limit: number; percentage: number }
        users: { current: number; limit: number; percentage: number }
        products: { current: number; limit: number; percentage: number }
        storage: { current: number; limit: number; percentage: number }
        apiCalls: { current: number; limit: number; percentage: number }
      }
      alerts: Array<{
        type: 'warning' | 'critical'
        metric: string
        message: string
        current: number
        limit: number
        percentage: number
      }>
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/subscription/usage/current')
      return response.data
    } catch (error) {
      console.error('Get current usage failed:', error)
      throw error
    }
  }

  /**
   * 获取发票列表
   */
  async getInvoices(params?: {
    status?: string
    limit?: number
    offset?: number
    dateRange?: [string, string]
  }): Promise<{
    success: boolean
    data?: {
      invoices: Invoice[]
      total: number
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/subscription/invoices', {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get invoices failed:', error)
      throw error
    }
  }

  /**
   * 获取发票详情
   */
  async getInvoice(invoiceId: string): Promise<{
    success: boolean
    data?: Invoice
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get(`/subscription/invoices/${invoiceId}`)
      return response.data
    } catch (error) {
      console.error('Get invoice failed:', error)
      throw error
    }
  }

  /**
   * 下载发票PDF
   */
  async downloadInvoice(invoiceId: string): Promise<Blob> {
    try {
      const response: AxiosResponse = await httpClient.get(
        `/subscription/invoices/${invoiceId}/download`,
        {
          responseType: 'blob'
        }
      )
      return response.data
    } catch (error) {
      console.error('Download invoice failed:', error)
      throw error
    }
  }

  /**
   * 获取支付方式
   */
  async getPaymentMethods(): Promise<{
    success: boolean
    data?: PaymentMethod[]
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/subscription/payment-methods')
      return response.data
    } catch (error) {
      console.error('Get payment methods failed:', error)
      throw error
    }
  }

  /**
   * 添加支付方式
   */
  async addPaymentMethod(params: {
    type: 'card' | 'bank_account' | 'alipay' | 'wechat'
    paymentMethodId?: string // 来自支付提供商的支付方式ID
    isDefault?: boolean
    billing?: {
      name: string
      email: string
      phone: string
      address: {
        line1: string
        city: string
        state: string
        postalCode: string
        country: string
      }
    }
  }): Promise<{
    success: boolean
    data?: PaymentMethod
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/subscription/payment-methods', params)
      return response.data
    } catch (error) {
      console.error('Add payment method failed:', error)
      throw error
    }
  }

  /**
   * 删除支付方式
   */
  async removePaymentMethod(paymentMethodId: string): Promise<{
    success: boolean
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.delete(
        `/subscription/payment-methods/${paymentMethodId}`
      )
      return response.data
    } catch (error) {
      console.error('Remove payment method failed:', error)
      throw error
    }
  }

  /**
   * 设置默认支付方式
   */
  async setDefaultPaymentMethod(paymentMethodId: string): Promise<{
    success: boolean
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post(
        `/subscription/payment-methods/${paymentMethodId}/set-default`
      )
      return response.data
    } catch (error) {
      console.error('Set default payment method failed:', error)
      throw error
    }
  }

  /**
   * 验证优惠码
   */
  async validatePromotionCode(code: string): Promise<{
    success: boolean
    data?: {
      id: string
      code: string
      type: 'percentage' | 'fixed_amount'
      value: number
      description: string
      appliesTo: string[]
      maxRedemptions?: number
      expiresAt?: string
      isValid: boolean
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get(`/subscription/promotion-codes/${code}/validate`)
      return response.data
    } catch (error) {
      console.error('Validate promotion code failed:', error)
      throw error
    }
  }

  /**
   * 获取计费预测
   */
  async getBillingPreview(params: {
    planId: string
    billingCycle: BillingCycle
    quantity?: number
    promotionCode?: string
  }): Promise<{
    success: boolean
    data?: {
      subtotal: number
      discount: number
      tax: number
      total: number
      currency: string
      nextBillingDate: string
      items: Array<{
        description: string
        amount: number
        period: string
      }>
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/subscription/billing-preview', params)
      return response.data
    } catch (error) {
      console.error('Get billing preview failed:', error)
      throw error
    }
  }
}

export const subscriptionAPI = new SubscriptionAPI()
export default subscriptionAPI