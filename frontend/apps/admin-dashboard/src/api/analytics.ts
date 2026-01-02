/**
 * YYC³餐饮行业智能化平台 - 数据分析API
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

// 时间范围枚举
export enum DateRange {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  THIS_WEEK = 'this_week',
  LAST_WEEK = 'last_week',
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
  THIS_QUARTER = 'this_quarter',
  LAST_QUARTER = 'last_quarter',
  THIS_YEAR = 'this_year',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom'
}

// 分析类型枚举
export enum AnalysisType {
  SALES = 'sales',
  REVENUE = 'revenue',
  CUSTOMER = 'customer',
  MENU = 'menu',
  STAFF = 'staff',
  INVENTORY = 'inventory',
  OPERATIONAL = 'operational',
  MARKETING = 'marketing'
}

// 报告类型枚举
export enum ReportType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom'
}

// 基础统计指标接口
export interface BaseMetrics {
  total: number
  growth: number
  growthRate: number
  periodComparison: number
}

// 销售数据分析接口
export interface SalesAnalytics {
  totalRevenue: BaseMetrics
  totalOrders: BaseMetrics
  averageOrderValue: BaseMetrics
  salesByCategory: Array<{
    category: string
    amount: number
    percentage: number
    growth: number
  }>
  salesByHour: Array<{
    hour: number
    revenue: number
    orders: number
  }>
  salesByDay: Array<{
    date: string
    revenue: number
    orders: number
    customers: number
  }>
  salesByPaymentMethod: Array<{
    method: string
    amount: number
    percentage: number
    count: number
  }>
  topSellingItems: Array<{
    itemId: number
    itemName: string
    quantity: number
    revenue: number
    growth: number
  }>
  salesForecast: Array<{
    date: string
    predicted: number
    confidence: number
    actual?: number
  }>
}

// 客户分析接口
export interface CustomerAnalytics {
  totalCustomers: BaseMetrics
  newCustomers: BaseMetrics
  returningCustomers: BaseMetrics
  customerRetention: number
  averageFrequency: number
  customerLifetimeValue: number
  demographics: Array<{
    segment: string
    count: number
    percentage: number
    averageSpent: number
  }>
  customerSegments: Array<{
    segment: string
    count: number
    revenue: number
    averageOrderValue: number
    frequency: number
  }>
  geographicDistribution: Array<{
    region: string
    customers: number
    revenue: number
    averageOrderValue: number
  }>
  behaviorPattern: {
    peakHours: number[]
    peakDays: string[]
    preferredPaymentMethods: Array<{ method: string; percentage: number }>
    averageDiningDuration: number
    groupSizeDistribution: Array<{ size: number; percentage: number }>
  }
}

// 菜单分析接口
export interface MenuAnalytics {
  menuPerformance: {
    totalItems: number
    activeItems: number
    averagePrice: number
    averageRating: number
    itemViews: number
    conversionRate: number
  }
  categoryPerformance: Array<{
    categoryId: number
    categoryName: string
    items: number
    revenue: number
    orders: number
    averagePrice: number
    profit: number
    popularity: number
  }>
  itemPerformance: Array<{
    itemId: number
    itemName: string
    categoryId: number
    categoryName: string
    price: number
    cost: number
    profit: number
    profitMargin: number
    orders: number
    quantity: number
    revenue: number
    rating: number
    reviews: number
    views: number
    conversionRate: number
    trend: 'up' | 'down' | 'stable'
  }>
  recommendations: Array<{
    type: 'promote' | 'improve' | 'remove' | 'price_adjust'
    itemId: number
    itemName: string
    reason: string
    potentialImpact: number
    confidence: number
  }>
  menuOptimization: {
    underperforming: number
    overperforming: number
    profitable: number
    unprofitable: number
    recommendedActions: Array<{
      action: string
      itemIds: number[]
      expectedRevenue: number
      complexity: 'low' | 'medium' | 'high'
    }>
  }
}

// 运营分析接口
export interface OperationalAnalytics {
  tableMetrics: {
    totalTables: number
    available: number
    occupied: number
    reserved: number
    maintenance: number
    utilizationRate: number
    averageTurnoverTime: number
    peakUtilization: number
  }
  staffMetrics: {
    totalStaff: number
    activeStaff: number
    averageEfficiency: number
    laborCost: number
    laborCostPercentage: number
    serviceQuality: {
      averageRating: number
      totalReviews: number
      complaintRate: number
      resolutionTime: number
    }
  }
  kitchenMetrics: {
    averagePreparationTime: number
    orderFulfillmentTime: number
    kitchenEfficiency: number
    foodCostPercentage: number
    wastePercentage: number
    inventoryTurnover: number
  }
  orderMetrics: {
    totalOrders: number
    dineInOrders: number
    takeawayOrders: number
    deliveryOrders: number
    averageOrderValue: number
    orderCancellationRate: number
    orderAccuracy: number
  }
  operationalCosts: Array<{
    category: string
    amount: number
    percentage: number
    trend: 'up' | 'down' | 'stable'
    benchmark: number
  }>
}

// 营销分析接口
export interface MarketingAnalytics {
  campaignPerformance: Array<{
    campaignId: number
    name: string
    type: string
    budget: number
    spent: number
    reach: number
    engagement: number
    conversions: number
    revenue: number
    roi: number
    status: 'active' | 'paused' | 'completed'
  }>
  promotionEffectiveness: Array<{
    promotionId: number
    name: string
    type: 'discount' | 'bogo' | 'combo' | 'loyalty'
    usageCount: number
    revenueImpact: number
    customerAcquisition: number
    cost: number
    roi: number
    duration: string
  }>
  customerAcquisition: {
    acquisitionCost: number
    acquisitionChannels: Array<{
      channel: string
      customers: number
      cost: number
      percentage: number
    }>
    conversionRates: Array<{
      source: string
      visitors: number
      conversions: number
      rate: number
    }>
  }
  brandMetrics: {
    brandAwareness: number
    customerSatisfaction: number
    netPromoterScore: number
    socialMediaEngagement: number
    onlineReviews: {
      averageRating: number
      totalReviews: number
      sentiment: 'positive' | 'neutral' | 'negative'
    }
  }
}

// 预测分析接口
export interface PredictiveAnalytics {
  salesForecast: Array<{
    period: string
    predicted: number
    confidence: number
    factors: string[]
    accuracy: number
  }>
  demandForecast: Array<{
    itemId: number
    itemName: string
    predictedDemand: number
    seasonalityFactor: number
    confidence: number
    recommendedStock: number
  }>
  customerForecast: {
    predictedCustomers: number
    confidence: number
    peakPeriods: Array<{
      date: string
      predictedCustomers: number
      factors: string[]
    }>
    factors: Array<{
      factor: string
      impact: number
      correlation: number
    }>
  }
  revenueForecast: Array<{
    period: string
    predictedRevenue: number
    confidence: number
    breakdown: {
      dineIn: number
      takeaway: number
      delivery: number
    }
  }>
  riskAnalysis: Array<{
    type: string
    probability: number
    impact: 'low' | 'medium' | 'high'
    mitigation: string[]
    historicalOccurrence: number
  }>
}

// 数据分析请求参数
export interface AnalyticsRequest {
  type: AnalysisType
  dateRange: DateRange
  startDate?: string
  endDate?: string
  storeIds?: number[]
  compareWith?: DateRange
  filters?: Record<string, any>
  metrics?: string[]
  dimensions?: string[]
}

// 报告生成请求
export interface ReportRequest {
  type: ReportType
  analytics: AnalysisType[]
  dateRange: DateRange
  startDate?: string
  endDate?: string
  format: 'pdf' | 'excel' | 'csv' | 'json'
  includeCharts: boolean
  includeRawData: boolean
  emailRecipients?: string[]
  customFields?: string[]
}

// 自定义仪表板配置
export interface DashboardConfig {
  id: number
  name: string
  description: string
  widgets: Array<{
    id: string
    type: 'chart' | 'metric' | 'table' | 'gauge' | 'progress'
    title: string
    analytics: AnalysisType
    metrics: string[]
    dimensions: string[]
    filters: Record<string, any>
    visualization: {
      chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap'
      colorScheme: string[]
      showLegend: boolean
      showGrid: boolean
      showLabels: boolean
    }
    layout: {
      x: number
      y: number
      width: number
      height: number
    }
    refreshInterval: number
  }>
  layout: {
    columns: number
    gap: number
  }
  sharing: {
    isPublic: boolean
    allowedUsers: number[]
    permissions: ('view' | 'edit')[]
  }
  createdAt: string
  updatedAt?: string
}

// 数据分析API类
export class AnalyticsAPI {
  /**
   * 获取销售数据分析
   */
  async getSalesAnalytics(params: AnalyticsRequest): Promise<{ success: boolean; data?: SalesAnalytics; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; data?: SalesAnalytics; message?: string }>('/analytics/sales', params)
      return response
    } catch (error) {
      console.error('Get sales analytics failed:', error)
      return {
        success: false,
        message: '获取销售数据分析失败'
      }
    }
  }

  /**
   * 获取客户数据分析
   */
  async getCustomerAnalytics(params: AnalyticsRequest): Promise<{ success: boolean; data?: CustomerAnalytics; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; data?: CustomerAnalytics; message?: string }>('/analytics/customer', params)
      return response
    } catch (error) {
      console.error('Get customer analytics failed:', error)
      return {
        success: false,
        message: '获取客户数据分析失败'
      }
    }
  }

  /**
   * 获取菜单数据分析
   */
  async getMenuAnalytics(params: AnalyticsRequest): Promise<{ success: boolean; data?: MenuAnalytics; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; data?: MenuAnalytics; message?: string }>('/analytics/menu', params)
      return response
    } catch (error) {
      console.error('Get menu analytics failed:', error)
      return {
        success: false,
        message: '获取菜单数据分析失败'
      }
    }
  }

  /**
   * 获取运营数据分析
   */
  async getOperationalAnalytics(params: AnalyticsRequest): Promise<{ success: boolean; data?: OperationalAnalytics; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; data?: OperationalAnalytics; message?: string }>('/analytics/operational', params)
      return response
    } catch (error) {
      console.error('Get operational analytics failed:', error)
      return {
        success: false,
        message: '获取运营数据分析失败'
      }
    }
  }

  /**
   * 获取营销数据分析
   */
  async getMarketingAnalytics(params: AnalyticsRequest): Promise<{ success: boolean; data?: MarketingAnalytics; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; data?: MarketingAnalytics; message?: string }>('/analytics/marketing', params)
      return response
    } catch (error) {
      console.error('Get marketing analytics failed:', error)
      return {
        success: false,
        message: '获取营销数据分析失败'
      }
    }
  }

  /**
   * 获取预测分析数据
   */
  async getPredictiveAnalytics(params: AnalyticsRequest): Promise<{ success: boolean; data?: PredictiveAnalytics; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; data?: PredictiveAnalytics; message?: string }>('/analytics/predictive', params)
      return response
    } catch (error) {
      console.error('Get predictive analytics failed:', error)
      return {
        success: false,
        message: '获取预测分析数据失败'
      }
    }
  }

  /**
   * 获取综合仪表板数据
   */
  async getDashboardData(params: {
    dateRange: DateRange
    startDate?: string
    endDate?: string
    storeIds?: number[]
  }): Promise<{ success: boolean; data?: Record<string, any>; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; data?: Record<string, any>; message?: string }>('/analytics/dashboard', params)
      return response
    } catch (error) {
      console.error('Get dashboard data failed:', error)
      return {
        success: false,
        message: '获取仪表板数据失败'
      }
    }
  }

  /**
   * 生成分析报告
   */
  async generateReport(request: ReportRequest): Promise<{ success: boolean; data?: { reportId: string; downloadUrl: string }; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; data?: { reportId: string; downloadUrl: string }; message?: string }>('/analytics/reports', request)
      return response
    } catch (error) {
      console.error('Generate report failed:', error)
      return {
        success: false,
        message: '生成报告失败'
      }
    }
  }

  /**
   * 获取报告列表
   */
  async getReports(params?: {
    page?: number
    limit?: number
    type?: ReportType
    status?: 'pending' | 'processing' | 'completed' | 'failed'
  }): Promise<{ success: boolean; data: { items: any[]; pagination: any }; message?: string }> {
    try {
      const queryString = new URLSearchParams()
      if (params?.page) queryString.set('page', params.page.toString())
      if (params?.limit) queryString.set('limit', params.limit.toString())
      if (params?.type) queryString.set('type', params.type)
      if (params?.status) queryString.set('status', params.status)

      const endpoint = queryString.toString() ? `/analytics/reports?${queryString}` : '/analytics/reports'
      const response = await httpClient.get<{ success: boolean; data: { items: any[]; pagination: any }; message?: string }>(endpoint)
      return response
    } catch (error) {
      console.error('Get reports failed:', error)
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
        message: '获取报告列表失败'
      }
    }
  }

  /**
   * 获取仪表板配置
   */
  async getDashboardConfigs(): Promise<{ success: boolean; data?: DashboardConfig[]; message?: string }> {
    try {
      const response = await httpClient.get<{ success: boolean; data?: DashboardConfig[]; message?: string }>('/analytics/dashboards')
      return response
    } catch (error) {
      console.error('Get dashboard configs failed:', error)
      return {
        success: false,
        message: '获取仪表板配置失败'
      }
    }
  }

  /**
   * 创建自定义仪表板
   */
  async createDashboard(config: Omit<DashboardConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data?: DashboardConfig; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; data?: DashboardConfig; message?: string }>('/analytics/dashboards', config)
      return response
    } catch (error) {
      console.error('Create dashboard failed:', error)
      return {
        success: false,
        message: '创建仪表板失败'
      }
    }
  }

  /**
   * 更新仪表板配置
   */
  async updateDashboard(id: number, config: Partial<DashboardConfig>): Promise<{ success: boolean; data?: DashboardConfig; message?: string }> {
    try {
      const response = await httpClient.put<{ success: boolean; data?: DashboardConfig; message?: string }>(`/analytics/dashboards/${id}`, config)
      return response
    } catch (error) {
      console.error('Update dashboard failed:', error)
      return {
        success: false,
        message: '更新仪表板失败'
      }
    }
  }

  /**
   * 删除仪表板
   */
  async deleteDashboard(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.delete<{ success: boolean; message?: string }>(`/analytics/dashboards/${id}`)
      return response
    } catch (error) {
      console.error('Delete dashboard failed:', error)
      return {
        success: false,
        message: '删除仪表板失败'
      }
    }
  }

  /**
   * 导出数据
   */
  async exportData(params: {
    type: AnalysisType
    format: 'csv' | 'excel' | 'json'
    dateRange: DateRange
    startDate?: string
    endDate?: string
    filters?: Record<string, any>
  }): Promise<{ success: boolean; data?: { downloadUrl: string }; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; data?: { downloadUrl: string }; message?: string }>('/analytics/export', params)
      return response
    } catch (error) {
      console.error('Export data failed:', error)
      return {
        success: false,
        message: '导出数据失败'
      }
    }
  }

  /**
   * 获取实时数据
   */
  async getRealTimeData(params?: {
    metrics?: string[]
    refreshInterval?: number
  }): Promise<{ success: boolean; data?: Record<string, any>; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; data?: Record<string, any>; message?: string }>('/analytics/realtime', params || {})
      return response
    } catch (error) {
      console.error('Get real-time data failed:', error)
      return {
        success: false,
        message: '获取实时数据失败'
      }
    }
  }
}

// 创建数据分析API实例
export const analyticsApi = new AnalyticsAPI()

// 导出便捷函数
export const getSalesAnalytics = (params: AnalyticsRequest) => analyticsApi.getSalesAnalytics(params)
export const getCustomerAnalytics = (params: AnalyticsRequest) => analyticsApi.getCustomerAnalytics(params)
export const getMenuAnalytics = (params: AnalyticsRequest) => analyticsApi.getMenuAnalytics(params)
export const getOperationalAnalytics = (params: AnalyticsRequest) => analyticsApi.getOperationalAnalytics(params)
export const getMarketingAnalytics = (params: AnalyticsRequest) => analyticsApi.getMarketingAnalytics(params)
export const getPredictiveAnalytics = (params: AnalyticsRequest) => analyticsApi.getPredictiveAnalytics(params)
export const getDashboardData = (params: {
  dateRange: DateRange
  startDate?: string
  endDate?: string
  storeIds?: number[]
}) => analyticsApi.getDashboardData(params)
export const generateReport = (request: ReportRequest) => analyticsApi.generateReport(request)
export const getReports = (params?: {
  page?: number
  limit?: number
  type?: ReportType
  status?: 'pending' | 'processing' | 'completed' | 'failed'
}) => analyticsApi.getReports(params)
export const getDashboardConfigs = () => analyticsApi.getDashboardConfigs()
export const createDashboard = (config: Omit<DashboardConfig, 'id' | 'createdAt' | 'updatedAt'>) => analyticsApi.createDashboard(config)
export const updateDashboard = (id: number, config: Partial<DashboardConfig>) => analyticsApi.updateDashboard(id, config)
export const deleteDashboard = (id: number) => analyticsApi.deleteDashboard(id)
export const exportData = (params: {
  type: AnalysisType
  format: 'csv' | 'excel' | 'json'
  dateRange: DateRange
  startDate?: string
  endDate?: string
  filters?: Record<string, any>
}) => analyticsApi.exportData(params)
export const getRealTimeData = (params?: {
  metrics?: string[]
  refreshInterval?: number
}) => analyticsApi.getRealTimeData(params)

export default analyticsApi