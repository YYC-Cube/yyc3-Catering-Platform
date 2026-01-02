/**
 * YYC³餐饮行业智能化平台 - 会员管理API
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

// 会员等级枚举
export enum MemberLevel {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond'
}

// 会员状态枚举
export enum MemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BLACKLISTED = 'blacklisted'
}

// 会员接口
export interface Member {
  id: number
  memberId: string
  name: string
  phone: string
  email?: string
  avatar?: string
  gender?: 'male' | 'female' | 'other'
  birthday?: string
  level: MemberLevel
  status: MemberStatus
  points: number
  totalSpent: number
  orderCount: number
  lastOrderAt?: string
  registeredAt: string
  updatedAt?: string
}

// 创建会员请求
export interface CreateMemberRequest {
  name: string
  phone: string
  email?: string
  avatar?: string
  gender?: 'male' | 'female' | 'other'
  birthday?: string
  initialLevel?: MemberLevel
  initialPoints?: number
}

// 更新会员请求
export interface UpdateMemberRequest {
  name?: string
  phone?: string
  email?: string
  avatar?: string
  gender?: 'male' | 'female' | 'other'
  birthday?: string
  level?: MemberLevel
  status?: MemberStatus
}

// 积分调整请求
export interface PointsAdjustmentRequest {
  memberId: number
  points: number
  type: 'earn' | 'spend' | 'adjust'
  reason: string
  orderId?: number
}

// 分页响应
export interface PaginatedResponse<T> {
  success: boolean
  data: {
    members: T[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  timestamp?: string
}

// 会员查询参数
export interface MemberQueryParams {
  page?: number
  limit?: number
  search?: string
  level?: MemberLevel
  status?: MemberStatus
  minPoints?: number
  maxPoints?: number
  startDate?: string
  endDate?: string
  sortBy?: 'registeredAt' | 'totalSpent' | 'orderCount' | 'points'
  sortOrder?: 'asc' | 'desc'
}

// 会员统计
export interface MemberStats {
  totalMembers: number
  activeMembers: number
  newMembersThisMonth: number
  totalPointsIssued: number
  totalPointsRedeemed: number
  memberLevels: {
    [key in MemberLevel]: number
  }
  averageSpent: number
  averageOrderValue: number
}

// 积分记录
export interface PointsRecord {
  id: number
  memberId: number
  points: number
  type: 'earn' | 'spend' | 'adjust'
  reason: string
  orderId?: number
  balance: number
  createdAt: string
}

// 会员API类
export class MemberAPI {
  /**
   * 获取会员列表
   */
  async getMembers(params?: MemberQueryParams): Promise<PaginatedResponse<Member>> {
    try {
      const queryString = new URLSearchParams()
      if (params?.page) queryString.set('page', params.page.toString())
      if (params?.limit) queryString.set('limit', params.limit.toString())
      if (params?.search) queryString.set('search', params.search)
      if (params?.level) queryString.set('level', params.level)
      if (params?.status) queryString.set('status', params.status)
      if (params?.minPoints) queryString.set('minPoints', params.minPoints.toString())
      if (params?.maxPoints) queryString.set('maxPoints', params.maxPoints.toString())
      if (params?.startDate) queryString.set('startDate', params.startDate)
      if (params?.endDate) queryString.set('endDate', params.endDate)
      if (params?.sortBy) queryString.set('sortBy', params.sortBy)
      if (params?.sortOrder) queryString.set('sortOrder', params.sortOrder)

      const endpoint = queryString.toString() ? `/members?${queryString}` : '/members'
      const response = await httpClient.get<PaginatedResponse<Member>>(endpoint)
      return response
    } catch (error) {
      console.error('Get members failed:', error)
      return {
        success: false,
        data: {
          members: [],
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
   * 获取会员详情
   */
  async getMember(id: number): Promise<{ success: boolean; data?: Member; message?: string }> {
    try {
      const response = await httpClient.get<{ success: boolean; data?: Member; message?: string }>(`/members/${id}`)
      return response
    } catch (error) {
      console.error('Get member failed:', error)
      return {
        success: false,
        message: '获取会员详情失败'
      }
    }
  }

  /**
   * 根据手机号获取会员
   */
  async getMemberByPhone(phone: string): Promise<{ success: boolean; data?: Member; message?: string }> {
    try {
      const response = await httpClient.get<{ success: boolean; data?: Member; message?: string }>(`/members/phone/${phone}`)
      return response
    } catch (error) {
      console.error('Get member by phone failed:', error)
      return {
        success: false,
        message: '获取会员信息失败'
      }
    }
  }

  /**
   * 创建会员
   */
  async createMember(memberData: CreateMemberRequest): Promise<{ success: boolean; data?: Member; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; data?: Member; message?: string }>('/members', memberData)
      return response
    } catch (error) {
      console.error('Create member failed:', error)
      return {
        success: false,
        message: '创建会员失败'
      }
    }
  }

  /**
   * 更新会员
   */
  async updateMember(id: number, memberData: UpdateMemberRequest): Promise<{ success: boolean; data?: Member; message?: string }> {
    try {
      const response = await httpClient.put<{ success: boolean; data?: Member; message?: string }>(`/members/${id}`, memberData)
      return response
    } catch (error) {
      console.error('Update member failed:', error)
      return {
        success: false,
        message: '更新会员信息失败'
      }
    }
  }

  /**
   * 删除会员
   */
  async deleteMember(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.delete<{ success: boolean; message?: string }>(`/members/${id}`)
      return response
    } catch (error) {
      console.error('Delete member failed:', error)
      return {
        success: false,
        message: '删除会员失败'
      }
    }
  }

  /**
   * 调整会员积分
   */
  async adjustPoints(adjustmentData: PointsAdjustmentRequest): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; message?: string }>('/members/points/adjust', adjustmentData)
      return response
    } catch (error) {
      console.error('Adjust points failed:', error)
      return {
        success: false,
        message: '积分调整失败'
      }
    }
  }

  /**
   * 获取会员积分记录
   */
  async getPointsHistory(memberId: number, page: number = 1, limit: number = 20): Promise<{
    success: boolean
    data?: PointsRecord[]
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    message?: string
  }> {
    try {
      const queryString = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      const response = await httpClient.get<{
        success: boolean
        data?: PointsRecord[]
        pagination: {
          page: number
          limit: number
          total: number
          totalPages: number
        }
        message?: string
      }>(`/members/${memberId}/points/history?${queryString}`)
      return response
    } catch (error) {
      console.error('Get points history failed:', error)
      return {
        success: false,
        message: '获取积分记录失败'
      }
    }
  }

  /**
   * 获取会员统计数据
   */
  async getMemberStats(params?: {
    startDate?: string
    endDate?: string
  }): Promise<{ success: boolean; data?: MemberStats; message?: string }> {
    try {
      const queryString = new URLSearchParams()
      if (params?.startDate) queryString.set('startDate', params.startDate)
      if (params?.endDate) queryString.set('endDate', params.endDate)

      const endpoint = queryString.toString() ? `/members/stats?${queryString}` : '/members/stats'
      const response = await httpClient.get<{ success: boolean; data?: MemberStats; message?: string }>(endpoint)
      return response
    } catch (error) {
      console.error('Get member stats failed:', error)
      return {
        success: false,
        message: '获取会员统计失败'
      }
    }
  }

  /**
   * 升级会员等级
   */
  async upgradeMemberLevel(memberId: number, newLevel: MemberLevel): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.patch<{ success: boolean; message?: string }>(`/members/${memberId}/level`, { level: newLevel })
      return response
    } catch (error) {
      console.error('Upgrade member level failed:', error)
      return {
        success: false,
        message: '升级会员等级失败'
      }
    }
  }

  /**
   * 批量导入会员
   */
  async batchImportMembers(members: CreateMemberRequest[]): Promise<{
    success: boolean
    imported?: number
    failed?: number
    errors?: Array<{ index: number; error: string }>
    message?: string
  }> {
    try {
      const response = await httpClient.post<{
        success: boolean
        imported?: number
        failed?: number
        errors?: Array<{ index: number; error: string }>
        message?: string
      }>('/members/batch-import', { members })
      return response
    } catch (error) {
      console.error('Batch import members failed:', error)
      return {
        success: false,
        message: '批量导入会员失败'
      }
    }
  }

  /**
   * 导出会员数据
   */
  async exportMembers(format: 'csv' | 'excel' = 'excel', filters?: MemberQueryParams): Promise<{
    success: boolean
    downloadUrl?: string
    message?: string
  }> {
    try {
      const requestData = { format, filters }
      const response = await httpClient.post<{
        success: boolean
        downloadUrl?: string
        message?: string
      }>('/members/export', requestData)
      return response
    } catch (error) {
      console.error('Export members failed:', error)
      return {
        success: false,
        message: '导出会员数据失败'
      }
    }
  }

  /**
   * 发送会员通知
   */
  async sendNotification(memberIds: number[], message: string, type: 'sms' | 'email' | 'system'): Promise<{
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
      }>('/members/notify', { memberIds, message, type })
      return response
    } catch (error) {
      console.error('Send notification failed:', error)
      return {
        success: false,
        message: '发送通知失败'
      }
    }
  }
}

// 创建会员API实例
export const memberApi = new MemberAPI()

// 导出便捷函数
export const getMembers = (params?: MemberQueryParams) => memberApi.getMembers(params)
export const getMember = (id: number) => memberApi.getMember(id)
export const getMemberByPhone = (phone: string) => memberApi.getMemberByPhone(phone)
export const createMember = (memberData: CreateMemberRequest) => memberApi.createMember(memberData)
export const updateMember = (id: number, memberData: UpdateMemberRequest) => memberApi.updateMember(id, memberData)
export const deleteMember = (id: number) => memberApi.deleteMember(id)
export const adjustPoints = (adjustmentData: PointsAdjustmentRequest) => memberApi.adjustPoints(adjustmentData)
export const getPointsHistory = (memberId: number, page?: number, limit?: number) => memberApi.getPointsHistory(memberId, page, limit)
export const getMemberStats = (params?: { startDate?: string; endDate?: string }) => memberApi.getMemberStats(params)
export const upgradeMemberLevel = (memberId: number, newLevel: MemberLevel) => memberApi.upgradeMemberLevel(memberId, newLevel)
export const batchImportMembers = (members: CreateMemberRequest[]) => memberApi.batchImportMembers(members)
export const exportMembers = (format?: 'csv' | 'excel', filters?: MemberQueryParams) => memberApi.exportMembers(format, filters)
export const sendNotification = (memberIds: number[], message: string, type: 'sms' | 'email' | 'system') => memberApi.sendNotification(memberIds, message, type)

export default memberApi