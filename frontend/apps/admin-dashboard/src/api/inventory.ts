/**
 * YYC³餐饮行业智能化平台 - 库存管理API
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

  async get<T>(endpoint: string, options: { params?: any } = {}): Promise<T> {
    let fullEndpoint = endpoint
    if (options.params) {
      const params = new URLSearchParams()
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
      const paramsString = params.toString()
      if (paramsString) {
        fullEndpoint += `?${paramsString}`
      }
    }

    return this.request<T>(fullEndpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any, options: { headers?: HeadersInit } = {}): Promise<T> {
    const requestOptions: RequestInit = {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers: options.headers,
    }

    if (data instanceof FormData) {
      delete requestOptions.body
      requestOptions.body = data
      if (requestOptions.headers && requestOptions.headers['Content-Type']) {
        delete requestOptions.headers['Content-Type']
      }
    }

    return this.request<T>(endpoint, requestOptions)
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

  async delete<T>(endpoint: string, options: { data?: any } = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      body: options.data ? JSON.stringify(options.data) : undefined,
    })
  }
}

// 创建HTTP客户端实例
const httpClient = new HttpClient(API_BASE_URL)

// 枚举定义
export enum InventoryStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued'
}

export enum InventoryUnit {
  PIECE = 'piece',
  KILOGRAM = 'kilogram',
  GRAM = 'gram',
  LITER = 'liter',
  MILLILITER = 'milliliter',
  PACKAGE = 'package',
  BOX = 'box',
  CASE = 'case'
}

export enum AlertLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum MovementType {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  ADJUSTMENT = 'adjustment',
  TRANSFER = 'transfer'
}

// 类型定义
export interface InventoryItem {
  id: string;
  name: string;
  code: string;
  category: string;
  description?: string;
  stock: number;
  safeStock: number;
  unit: InventoryUnit;
  costPrice: number;
  sellingPrice: number;
  status: InventoryStatus;
  alertLevel?: AlertLevel;
  supplier?: string;
  supplierContact?: string;
  avatar?: string;
  batchNumber?: string;
  expiryDate?: string;
  location?: string;
  lastUpdated: string;
  createdAt: string;
}

export interface InventoryAlert {
  id: string;
  inventoryId: string;
  productName: string;
  currentStock: number;
  safeStock: number;
  alertLevel: AlertLevel;
  message: string;
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

export interface InventoryFilters {
  category?: string;
  status?: InventoryStatus[];
  alertLevel?: AlertLevel;
  searchTerm?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface InventoryStats {
  totalItems: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
  totalAlerts: number;
  resolvedAlerts: number;
  avgTurnoverRate: number;
}

// API 函数
export const getInventoryItems = (params: InventoryFilters) => {
  return httpClient.get('/api/inventory', { params })
}

export const getInventoryItem = (id: string) => {
  return httpClient.get(`/api/inventory/${id}`)
}

export const createInventoryItem = (data: Partial<InventoryItem>) => {
  return httpClient.post('/api/inventory', data)
}

export const updateInventoryItem = (id: string, data: Partial<InventoryItem>) => {
  return httpClient.put(`/api/inventory/${id}`, data)
}

export const deleteInventoryItem = (id: string) => {
  return httpClient.delete(`/api/inventory/${id}`)
}

export const adjustInventory = (id: string, data: { quantity: number; reason: string; type: MovementType }) => {
  return httpClient.post(`/api/inventory/${id}/adjust`, data)
}

export const getInventoryAlerts = (params?: { resolved?: boolean }) => {
  return httpClient.get('/api/inventory/alerts', { params })
}

export const resolveAlert = (id: string) => {
  return httpClient.patch(`/api/inventory/alerts/${id}/resolve`)
}

export const getInventoryStats = () => {
  return httpClient.get('/api/inventory/stats')
}

export const batchAdjustInventory = (data: { items: Array<{ id: string; quantity: number; reason: string }> }) => {
  return httpClient.post('/api/inventory/batch-adjust', data)
}

// 导出API对象
export default {
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  adjustInventory,
  getInventoryAlerts,
  resolveAlert,
  getInventoryStats,
  batchAdjustInventory
}
