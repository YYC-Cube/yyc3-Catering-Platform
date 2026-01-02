/**
 * YYC³餐饮行业智能化平台 - 菜单管理API (修复版)
 */

// 类型定义
interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  available: boolean
  ingredients: string[]
  allergens: string[]
  nutritionInfo?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  createdAt: string
  updatedAt: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

interface PaginatedResponse<T> {
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
}

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
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// 创建HTTP客户端实例
const httpClient = new HttpClient(API_BASE_URL)

// 菜单管理API类
export class MenuAPI {
  /**
   * 获取所有菜单项
   */
  static async getMenuItems(params?: { page?: number; limit?: number; category?: string }): Promise<PaginatedResponse<MenuItem>> {
    const page = params?.page || 1
    const limit = params?.limit || 20
    const category = params?.category

    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    if (category) {
      searchParams.append('category', category)
    }

    try {
      const response = await httpClient.get<PaginatedResponse<MenuItem>>(`/menu/items?${searchParams}`)
      return response
    } catch (error) {
      console.error('Get menu items failed:', error)
      return {
        success: false,
        message: '获取菜单项失败'
      }
    }
  }

  /**
   * 获取菜单项详情
   */
  static async getMenuItem(id: number): Promise<ApiResponse<MenuItem>> {
    try {
      const response = await httpClient.get<ApiResponse<MenuItem>>(`/menu/items/${id}`)
      return response
    } catch (error) {
      console.error('Get menu item failed:', error)
      return {
        success: false,
        message: '获取菜单项失败'
      }
    }
  }

  /**
   * 创建菜单项
   */
  static async createMenuItem(menuData: Partial<MenuItem>): Promise<ApiResponse<MenuItem>> {
    try {
      const response = await httpClient.post<ApiResponse<MenuItem>>('/menu/items', menuData)
      return response
    } catch (error) {
      console.error('Create menu item failed:', error)
      return {
        success: false,
        message: '创建菜单项失败'
      }
    }
  }

  /**
   * 更新菜单项
   */
  static async updateMenuItem(id: number, menuData: Partial<MenuItem>): Promise<ApiResponse<MenuItem>> {
    try {
      const response = await httpClient.put<ApiResponse<MenuItem>>(`/menu/items/${id}`, menuData)
      return response
    } catch (error) {
      console.error('Update menu item failed:', error)
      return {
        success: false,
        message: '更新菜单项失败'
      }
    }
  }

  /**
   * 删除菜单项
   */
  static async deleteMenuItem(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await httpClient.delete<ApiResponse<void>>(`/menu/items/${id}`)
      return response
    } catch (error) {
      console.error('Delete menu item failed:', error)
      return {
        success: false,
        message: '删除菜单项失败'
      }
    }
  }

  /**
   * 搜索菜单项
   */
  static async searchMenuItems(query: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<MenuItem>> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString()
    })

    try {
      const response = await httpClient.get<PaginatedResponse<MenuItem>>(`/menu/search?${params}`)
      return response
    } catch (error) {
      console.error('Search menu items failed:', error)
      return {
        success: false,
        message: '搜索菜单项失败'
      }
    }
  }

  /**
   * 获取菜单分类
   */
  static async getCategories(): Promise<ApiResponse<string[]>> {
    try {
      const response = await httpClient.get<ApiResponse<string[]>>('/menu/categories')
      return response
    } catch (error) {
      console.error('Get categories failed:', error)
      return {
        success: false,
        message: '获取菜单分类失败'
      }
    }
  }

  /**
   * 批量更新价格
   */
  static async batchUpdatePrices(priceUpdates: Array<{id: number; price: number}>): Promise<ApiResponse<void>> {
    try {
      const response = await httpClient.post<ApiResponse<void>>('/menu/items/batch-update-prices', { priceUpdates })
      return response
    } catch (error) {
      console.error('Batch update prices failed:', error)
      return {
        success: false,
        message: '批量更新价格失败'
      }
    }
  }

  /**
   * 更新可用状态
   */
  static async updateAvailability(id: number, available: boolean): Promise<ApiResponse<void>> {
    try {
      const response = await httpClient.patch<ApiResponse<void>>(`/menu/items/${id}/availability`, { available })
      return response
    } catch (error) {
      console.error('Update availability failed:', error)
      return {
        success: false,
        message: '更新可用状态失败'
      }
    }
  }
}

// 导出类型定义
export type { MenuItem, ApiResponse, PaginatedResponse }

// 导出默认实例
export default MenuAPI