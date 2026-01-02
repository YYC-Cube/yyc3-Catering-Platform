/**
 * YYC³餐饮行业智能化平台 - 营销活动管理API
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

// 营销活动类型枚举
export enum MarketingActivityType {
  COUPON = 'coupon',
  DISCOUNT = 'discount',
  POINTS_EXCHANGE = 'points_exchange',
  FLASH_SALE = 'flash_sale',
  GROUP_BUY = 'group_buy',
  LUCKY_DRAW = 'lucky_draw',
  RECOMMEND_REWARD = 'recommend_reward'
}

// 营销活动状态枚举
export enum MarketingActivityStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

// 优惠券类型枚举
export enum CouponType {
  FIXED_AMOUNT = 'fixed_amount',
  PERCENTAGE = 'percentage',
  FREE_SHIPPING = 'free_shipping',
  GIFT = 'gift'
}

// 营销活动接口
export interface MarketingActivity {
  id: number
  activityId: string
  name: string
  description?: string
  type: MarketingActivityType
  status: MarketingActivityStatus
  banner?: string
  startTime: string
  endTime: string
  maxParticipants?: number
  currentParticipants?: number
  targetAudience: string[] // 目标人群（会员等级等）
  conditions: {
    minOrderAmount?: number
    maxOrderAmount?: number
    minPoints?: number
    requiredItems?: string[]
    excludedItems?: string[]
  }
  rewards: {
    discountAmount?: number
    discountPercentage?: number
    pointsAwarded?: number
    freeItem?: string
    coupon?: any
  }
  statistics?: {
    totalSavings?: number
    totalOrders?: number
    totalRevenue?: number
    conversionRate?: number
    roi?: number
  }
  createdBy: string
  createdAt: string
  updatedAt?: string
}

// 优惠券接口
export interface Coupon {
  id: number
  couponId: string
  code: string
  name: string
  description?: string
  type: CouponType
  value: number
  minOrderAmount?: number
  maxDiscountAmount?: number
  usageLimit?: number
  usageCount: number
  userLimit?: number
  validFrom: string
  validUntil: string
  status: 'active' | 'used' | 'expired'
  targetAudience: string[]
  applicableItems?: string[]
  excludedItems?: string[]
  createdAt: string
  updatedAt?: string
}

// 创建营销活动请求
export interface CreateMarketingActivityRequest {
  name: string
  description?: string
  type: MarketingActivityType
  startTime: string
  endTime: string
  banner?: string
  maxParticipants?: number
  targetAudience: string[]
  conditions: {
    minOrderAmount?: number
    maxOrderAmount?: number
    minPoints?: number
    requiredItems?: string[]
    excludedItems?: string[]
  }
  rewards: {
    discountAmount?: number
    discountPercentage?: number
    pointsAwarded?: number
    freeItem?: string
    coupon?: {
      type: CouponType
      value: number
      minOrderAmount?: number
      maxDiscountAmount?: number
      validDays?: number
    }
  }
}

// 更新营销活动请求
export interface UpdateMarketingActivityRequest {
  name?: string
  description?: string
  status?: MarketingActivityStatus
  startTime?: string
  endTime?: string
  banner?: string
  maxParticipants?: number
  targetAudience?: string[]
  conditions?: {
    minOrderAmount?: number
    maxOrderAmount?: number
    minPoints?: number
    requiredItems?: string[]
    excludedItems?: string[]
  }
  rewards?: {
    discountAmount?: number
    discountPercentage?: number
    pointsAwarded?: number
    freeItem?: string
    coupon?: {
      type: CouponType
      value: number
      minOrderAmount?: number
      maxDiscountAmount?: number
      validDays?: number
    }
  }
}

// 创建优惠券请求
export interface CreateCouponRequest {
  name: string
  description?: string
  type: CouponType
  value: number
  minOrderAmount?: number
  maxDiscountAmount?: number
  usageLimit?: number
  userLimit?: number
  validDays: number
  targetAudience: string[]
  applicableItems?: string[]
  excludedItems?: string[]
  quantity?: number // 批量生成数量
}

// 分页响应
export interface PaginatedResponse<T> {
  success: boolean
  data: {
    items: T[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  timestamp?: string
}

// 查询参数
export interface MarketingQueryParams {
  page?: number
  limit?: number
  search?: string
  type?: MarketingActivityType
  status?: MarketingActivityStatus
  startDate?: string
  endDate?: string
  sortBy?: 'createdAt' | 'startTime' | 'participants' | 'conversionRate'
  sortOrder?: 'asc' | 'desc'
}

// 营销统计
export interface MarketingStats {
  totalActivities: number
  activeActivities: number
  totalParticipants: number
  totalSavings: number
  totalRevenue: number
  averageConversionRate: number
  activitiesByType: {
    [key in MarketingActivityType]: number
  }
  topPerformingActivities: {
    activityId: string
    name: string
    type: MarketingActivityType
    participants: number
    conversionRate: number
    roi: number
  }[]
}

// 营销活动API类
export class MarketingAPI {
  /**
   * 获取营销活动列表
   */
  async getMarketingActivities(params?: MarketingQueryParams): Promise<PaginatedResponse<MarketingActivity>> {
    try {
      const queryString = new URLSearchParams()
      if (params?.page) queryString.set('page', params.page.toString())
      if (params?.limit) queryString.set('limit', params.limit.toString())
      if (params?.search) queryString.set('search', params.search)
      if (params?.type) queryString.set('type', params.type)
      if (params?.status) queryString.set('status', params.status)
      if (params?.startDate) queryString.set('startDate', params.startDate)
      if (params?.endDate) queryString.set('endDate', params.endDate)
      if (params?.sortBy) queryString.set('sortBy', params.sortBy)
      if (params?.sortOrder) queryString.set('sortOrder', params.sortOrder)

      const endpoint = queryString.toString() ? `/marketing/activities?${queryString}` : '/marketing/activities'
      const response = await httpClient.get<PaginatedResponse<MarketingActivity>>(endpoint)
      return response
    } catch (error) {
      console.error('Get marketing activities failed:', error)
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
   * 获取营销活动详情
   */
  async getMarketingActivity(id: number): Promise<{ success: boolean; data?: MarketingActivity; message?: string }> {
    try {
      const response = await httpClient.get<{ success: boolean; data?: MarketingActivity; message?: string }>(`/marketing/activities/${id}`)
      return response
    } catch (error) {
      console.error('Get marketing activity failed:', error)
      return {
        success: false,
        message: '获取营销活动详情失败'
      }
    }
  }

  /**
   * 创建营销活动
   */
  async createMarketingActivity(activityData: CreateMarketingActivityRequest): Promise<{ success: boolean; data?: MarketingActivity; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; data?: MarketingActivity; message?: string }>('/marketing/activities', activityData)
      return response
    } catch (error) {
      console.error('Create marketing activity failed:', error)
      return {
        success: false,
        message: '创建营销活动失败'
      }
    }
  }

  /**
   * 更新营销活动
   */
  async updateMarketingActivity(id: number, activityData: UpdateMarketingActivityRequest): Promise<{ success: boolean; data?: MarketingActivity; message?: string }> {
    try {
      const response = await httpClient.put<{ success: boolean; data?: MarketingActivity; message?: string }>(`/marketing/activities/${id}`, activityData)
      return response
    } catch (error) {
      console.error('Update marketing activity failed:', error)
      return {
        success: false,
        message: '更新营销活动失败'
      }
    }
  }

  /**
   * 删除营销活动
   */
  async deleteMarketingActivity(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.delete<{ success: boolean; message?: string }>(`/marketing/activities/${id}`)
      return response
    } catch (error) {
      console.error('Delete marketing activity failed:', error)
      return {
        success: false,
        message: '删除营销活动失败'
      }
    }
  }

  /**
   * 发布营销活动
   */
  async publishMarketingActivity(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.patch<{ success: boolean; message?: string }>(`/marketing/activities/${id}/publish`)
      return response
    } catch (error) {
      console.error('Publish marketing activity failed:', error)
      return {
        success: false,
        message: '发布营销活动失败'
      }
    }
  }

  /**
   * 暂停营销活动
   */
  async pauseMarketingActivity(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.patch<{ success: boolean; message?: string }>(`/marketing/activities/${id}/pause`)
      return response
    } catch (error) {
      console.error('Pause marketing activity failed:', error)
      return {
        success: false,
        message: '暂停营销活动失败'
      }
    }
  }

  /**
   * 获取优惠券列表
   */
  async getCoupons(params?: MarketingQueryParams): Promise<PaginatedResponse<Coupon>> {
    try {
      const queryString = new URLSearchParams()
      if (params?.page) queryString.set('page', params.page.toString())
      if (params?.limit) queryString.set('limit', params.limit.toString())
      if (params?.search) queryString.set('search', params.search)

      const endpoint = queryString.toString() ? `/marketing/coupons?${queryString}` : '/marketing/coupons'
      const response = await httpClient.get<PaginatedResponse<Coupon>>(endpoint)
      return response
    } catch (error) {
      console.error('Get coupons failed:', error)
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
   * 创建优惠券
   */
  async createCoupon(couponData: CreateCouponRequest): Promise<{
    success: boolean
    data?: Coupon[]
    message?: string
  }> {
    try {
      const response = await httpClient.post<{
        success: boolean
        data?: Coupon[]
        message?: string
      }>('/marketing/coupons', couponData)
      return response
    } catch (error) {
      console.error('Create coupon failed:', error)
      return {
        success: false,
        message: '创建优惠券失败'
      }
    }
  }

  /**
   * 删除优惠券
   */
  async deleteCoupon(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.delete<{ success: boolean; message?: string }>(`/marketing/coupons/${id}`)
      return response
    } catch (error) {
      console.error('Delete coupon failed:', error)
      return {
        success: false,
        message: '删除优惠券失败'
      }
    }
  }

  /**
   * 获取营销统计数据
   */
  async getMarketingStats(params?: {
    startDate?: string
    endDate?: string
  }): Promise<{ success: boolean; data?: MarketingStats; message?: string }> {
    try {
      const queryString = new URLSearchParams()
      if (params?.startDate) queryString.set('startDate', params.startDate)
      if (params?.endDate) queryString.set('endDate', params.endDate)

      const endpoint = queryString.toString() ? `/marketing/stats?${queryString}` : '/marketing/stats'
      const response = await httpClient.get<{ success: boolean; data?: MarketingStats; message?: string }>(endpoint)
      return response
    } catch (error) {
      console.error('Get marketing stats failed:', error)
      return {
        success: false,
        message: '获取营销统计失败'
      }
    }
  }

  /**
   * 发送营销活动通知
   */
  async sendMarketingNotification(activityId: number, channels: string[]): Promise<{
    success: boolean
    sent?: number
    failed?: number
    message?: string
  }> {
    try {
      const response = await httpClient.post<{
        success: boolean
        sent?: number
        failed?: number
        message?: string
      }>(`/marketing/activities/${activityId}/notify`, { channels })
      return response
    } catch (error) {
      console.error('Send marketing notification failed:', error)
      return {
        success: false,
        message: '发送营销通知失败'
      }
    }
  }

  /**
   * 复制营销活动
   */
  async duplicateMarketingActivity(id: number, newName: string): Promise<{ success: boolean; data?: MarketingActivity; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; data?: MarketingActivity; message?: string }>(`/marketing/activities/${id}/duplicate`, { newName })
      return response
    } catch (error) {
      console.error('Duplicate marketing activity failed:', error)
      return {
        success: false,
        message: '复制营销活动失败'
      }
    }
  }
}

// 创建营销API实例
export const marketingApi = new MarketingAPI()

// 导出便捷函数
export const getMarketingActivities = (params?: MarketingQueryParams) => marketingApi.getMarketingActivities(params)
export const getMarketingActivity = (id: number) => marketingApi.getMarketingActivity(id)
export const createMarketingActivity = (activityData: CreateMarketingActivityRequest) => marketingApi.createMarketingActivity(activityData)
export const updateMarketingActivity = (id: number, activityData: UpdateMarketingActivityRequest) => marketingApi.updateMarketingActivity(id, activityData)
export const deleteMarketingActivity = (id: number) => marketingApi.deleteMarketingActivity(id)
export const publishMarketingActivity = (id: number) => marketingApi.publishMarketingActivity(id)
export const pauseMarketingActivity = (id: number) => marketingApi.pauseMarketingActivity(id)
export const getCoupons = (params?: MarketingQueryParams) => marketingApi.getCoupons(params)
export const createCoupon = (couponData: CreateCouponRequest) => marketingApi.createCoupon(couponData)
export const deleteCoupon = (id: number) => marketingApi.deleteCoupon(id)
export const getMarketingStats = (params?: { startDate?: string; endDate?: string }) => marketingApi.getMarketingStats(params)
export const sendMarketingNotification = (activityId: number, channels: string[]) => marketingApi.sendMarketingNotification(activityId, channels)
export const duplicateMarketingActivity = (id: number, newName: string) => marketingApi.duplicateMarketingActivity(id, newName)

export default marketingApi