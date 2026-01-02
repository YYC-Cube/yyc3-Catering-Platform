// HTTP Client Configuration
const API_BASE_URL = '/api/usage-billing'

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

// 计费类型
export enum BillingType {
  PER_USER = 'per_user',           // 按用户计费
  PER_ORDER = 'per_order',         // 按订单计费
  PER_TRANSACTION = 'per_transaction', // 按交易计费
  PER_API_CALL = 'per_api_call',   // 按API调用计费
  PER_STORAGE = 'per_storage',     // 按存储计费
  TIERED = 'tiered',               // 阶梯计费
  PACKAGE = 'package'              // 套餐计费
}

// 计费单位
export enum BillingUnit {
  USER = 'user',
  ORDER = 'order',
  TRANSACTION = 'transaction',
  API_CALL = 'api_call',
  GB = 'gb',
  MB = 'mb',
  REQUEST = 'request',
  MINUTE = 'minute',
  HOUR = 'hour'
}

// 使用量定价配置
export interface UsagePricing {
  id: string
  name: string
  description: string
  type: BillingType
  unit: BillingUnit
  basePrice: number
  currency: string
  tiers: Array<{
    from: number
    to?: number
    price: number
    unit: string
  }>
  included?: {
    quantity: number
    period: string
  }
  active: boolean
  createdAt: string
  updatedAt: string
}

// 使用量记录
export interface UsageRecord {
  id: string
  userId: string
  tenantId: string
  metricType: string
  quantity: number
  unit: BillingUnit
  unitPrice: number
  totalPrice: number
  currency: string
  period: string
  timestamp: string
  metadata?: Record<string, any>
  tags?: string[]
}

// 使用量账单项目
export interface UsageBillItem {
  id: string
  billId: string
  pricingId: string
  pricing: UsagePricing
  quantity: number
  unitPrice: number
  baseAmount: number
  discount: number
  taxAmount: number
  totalAmount: number
  period: {
    start: string
    end: string
  }
  description: string
  breakdown?: Array<{
    tier: string
    quantity: number
    unitPrice: number
    amount: number
  }>
}

// 使用量账单
export interface UsageBill {
  id: string
  userId: string
  tenantId: string
  number: string
  status: 'draft' | 'pending' | 'paid' | 'cancelled' | 'refunded'
  period: {
    start: string
    end: string
  }
  items: UsageBillItem[]
  summary: {
    baseTotal: number
    discountTotal: number
    taxTotal: number
    grandTotal: number
    currency: string
  }
  payment?: {
    method: string
    transactionId: string
    paidAt: string
  }
  createdAt: string
  updatedAt: string
  dueDate: string
  paidAt?: string
}

// 使用量预算和警报
export interface UsageBudget {
  id: string
  userId: string
  tenantId: string
  name: string
  metricType: string
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  limit: number
  alertThresholds: Array<{
    percentage: number
    action: 'email' | 'sms' | 'webhook' | 'throttle'
    enabled: boolean
  }>
  actions: {
    throttleRate?: number
    blockWhenExceeded?: boolean
    autoUpgrade?: boolean
  }
  active: boolean
  createdAt: string
  updatedAt: string
}

// 使用量分析
export interface UsageAnalytics {
  period: string
  metrics: Array<{
    type: string
    total: number
    breakdown: Record<string, number>
    trend: {
      current: number
      previous: number
      change: number
      changePercent: number
    }
    forecast?: {
      nextPeriod: number
      confidence: number
    }
  }>
  costs: {
    total: number
    breakdown: Record<string, number>
    averagePerUnit: number
  }
  efficiency: {
    costEfficiency: number
    utilizationRate: number
  }
}

// 使用量计费API
class UsageBillingAPI {
  /**
   * 获取使用量定价配置列表
   */
  async getPricingConfigs(params?: {
    type?: BillingType
    active?: boolean
    limit?: number
    offset?: number
  }): Promise<{
    success: boolean
    data?: {
      pricings: UsagePricing[]
      total: number
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/usage-billing/pricing', {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get pricing configs failed:', error)
      throw error
    }
  }

  /**
   * 创建使用量定价配置
   */
  async createPricing(pricing: Partial<UsagePricing>): Promise<{
    success: boolean
    data?: UsagePricing
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/usage-billing/pricing', pricing)
      return response.data
    } catch (error) {
      console.error('Create pricing failed:', error)
      throw error
    }
  }

  /**
   * 更新使用量定价配置
   */
  async updatePricing(id: string, pricing: Partial<UsagePricing>): Promise<{
    success: boolean
    data?: UsagePricing
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.put(`/usage-billing/pricing/${id}`, pricing)
      return response.data
    } catch (error) {
      console.error('Update pricing failed:', error)
      throw error
    }
  }

  /**
   * 删除使用量定价配置
   */
  async deletePricing(id: string): Promise<{
    success: boolean
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.delete(`/usage-billing/pricing/${id}`)
      return response.data
    } catch (error) {
      console.error('Delete pricing failed:', error)
      throw error
    }
  }

  /**
   * 记录使用量
   */
  async recordUsage(usage: {
    metricType: string
    quantity: number
    unit: BillingUnit
    metadata?: Record<string, any>
    tags?: string[]
  }): Promise<{
    success: boolean
    data?: UsageRecord
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/usage-billing/usage', usage)
      return response.data
    } catch (error) {
      console.error('Record usage failed:', error)
      throw error
    }
  }

  /**
   * 批量记录使用量
   */
  async batchRecordUsage(records: Array<{
    metricType: string
    quantity: number
    unit: BillingUnit
    metadata?: Record<string, any>
    tags?: string[]
  }>): Promise<{
    success: boolean
    data?: {
      recorded: number
      failed: number
      errors: string[]
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/usage-billing/usage/batch', { records })
      return response.data
    } catch (error) {
      console.error('Batch record usage failed:', error)
      throw error
    }
  }

  /**
   * 获取使用量记录
   */
  async getUsageRecords(params?: {
    metricType?: string
    period?: string
    dateRange?: [string, string]
    limit?: number
    offset?: number
    tags?: string[]
  }): Promise<{
    success: boolean
    data?: {
      records: UsageRecord[]
      total: number
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/usage-billing/usage', {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get usage records failed:', error)
      throw error
    }
  }

  /**
   * 获取使用量统计
   */
  async getUsageStats(params?: {
    metricType?: string
    period?: string
    groupBy?: 'day' | 'week' | 'month' | 'year'
    dateRange?: [string, string]
  }): Promise<{
    success: boolean
    data?: UsageAnalytics
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/usage-billing/usage/stats', {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get usage stats failed:', error)
      throw error
    }
  }

  /**
   * 生成使用量账单
   */
  async generateBill(params: {
    userId?: string
    tenantId?: string
    period: {
      start: string
      end: string
    }
    dryRun?: boolean
  }): Promise<{
    success: boolean
    data?: UsageBill
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/usage-billing/bills/generate', params)
      return response.data
    } catch (error) {
      console.error('Generate bill failed:', error)
      throw error
    }
  }

  /**
   * 获取使用量账单列表
   */
  async getBills(params?: {
    userId?: string
    tenantId?: string
    status?: string
    period?: string
    dateRange?: [string, string]
    limit?: number
    offset?: number
  }): Promise<{
    success: boolean
    data?: {
      bills: UsageBill[]
      total: number
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/usage-billing/bills', {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get bills failed:', error)
      throw error
    }
  }

  /**
   * 获取账单详情
   */
  async getBill(billId: string): Promise<{
    success: boolean
    data?: UsageBill
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get(`/usage-billing/bills/${billId}`)
      return response.data
    } catch (error) {
      console.error('Get bill failed:', error)
      throw error
    }
  }

  /**
   * 支付账单
   */
  async payBill(billId: string, payment: {
    method: string
    transactionId?: string
  }): Promise<{
    success: boolean
    data?: UsageBill
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post(`/usage-billing/bills/${billId}/pay`, payment)
      return response.data
    } catch (error) {
      console.error('Pay bill failed:', error)
      throw error
    }
  }

  /**
   * 创建使用量预算
   */
  async createBudget(budget: Partial<UsageBudget>): Promise<{
    success: boolean
    data?: UsageBudget
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/usage-billing/budgets', budget)
      return response.data
    } catch (error) {
      console.error('Create budget failed:', error)
      throw error
    }
  }

  /**
   * 获取使用量预算列表
   */
  async getBudgets(params?: {
    metricType?: string
    active?: boolean
    limit?: number
    offset?: number
  }): Promise<{
    success: boolean
    data?: {
      budgets: UsageBudget[]
      total: number
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/usage-billing/budgets', {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get budgets failed:', error)
      throw error
    }
  }

  /**
   * 更新使用量预算
   */
  async updateBudget(id: string, budget: Partial<UsageBudget>): Promise<{
    success: boolean
    data?: UsageBudget
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.put(`/usage-billing/budgets/${id}`, budget)
      return response.data
    } catch (error) {
      console.error('Update budget failed:', error)
      throw error
    }
  }

  /**
   * 删除使用量预算
   */
  async deleteBudget(id: string): Promise<{
    success: boolean
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.delete(`/usage-billing/budgets/${id}`)
      return response.data
    } catch (error) {
      console.error('Delete budget failed:', error)
      throw error
    }
  }

  /**
   * 获取预算状态
   */
  async getBudgetStatus(budgetId: string): Promise<{
    success: boolean
    data?: {
      current: number
      limit: number
      percentage: number
      periodProgress: number
      alerts: Array<{
        threshold: number
        triggered: boolean
        lastTriggered?: string
      }>
      forecast: {
        expectedEnd: number
        riskLevel: 'low' | 'medium' | 'high'
      }
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get(`/usage-billing/budgets/${budgetId}/status`)
      return response.data
    } catch (error) {
      console.error('Get budget status failed:', error)
      throw error
    }
  }

  /**
   * 获取成本预测
   */
  async getCostForecast(params: {
    metricType?: string
    period: string
    forecastPeriods?: number
    confidence?: number
  }): Promise<{
    success: boolean
    data?: {
      forecast: Array<{
        period: string
        predictedUsage: number
        predictedCost: number
        confidence: number
        factors: Array<{
          factor: string
          impact: number
          description: string
        }>
      }>
      modelAccuracy: number
      recommendations: string[]
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/usage-billing/forecast', {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get cost forecast failed:', error)
      throw error
    }
  }

  /**
   * 获取成本优化建议
   */
  async getOptimizationSuggestions(params?: {
    metricType?: string
    period?: string
    savingsThreshold?: number
  }): Promise<{
    success: boolean
    data?: {
      suggestions: Array<{
        type: 'pricing' | 'usage' | 'budget' | 'schedule'
        title: string
        description: string
        potentialSavings: number
        implementation: {
          effort: 'low' | 'medium' | 'high'
          timeFrame: string
          steps: string[]
        }
        impact: {
          costReduction: number
          riskLevel: 'low' | 'medium' | 'high'
        }
      }>
      totalPotentialSavings: number
      prioritySuggestions: string[]
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/usage-billing/optimization', {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get optimization suggestions failed:', error)
      throw error
    }
  }
}

export const usageBillingAPI = new UsageBillingAPI()
export default usageBillingAPI