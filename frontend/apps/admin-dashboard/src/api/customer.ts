/**
 * YYC³餐饮行业智能化平台 - 客户管理API
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

  async get<T>(endpoint: string, options: { params?: any; responseType?: string } = {}): Promise<T> {
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

    // 如果是FormData，不需要JSON.stringify
    if (data instanceof FormData) {
      delete requestOptions.body
      requestOptions.body = data
      // FormData会自动设置正确的Content-Type
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

// 客户数据类型定义
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  address?: string;
  avatar?: string;
  memberLevelId?: string;
  points?: number;
  totalSpent?: number;
  lastVisit?: string;
  createTime?: string;
  updateTime?: string;
  status: 'active' | 'inactive';
}

// 客户查询参数
export interface CustomerQueryParams {
  keyword?: string;
  status?: 'active' | 'inactive';
  memberLevelId?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 客户统计数据
export interface CustomerStatistics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  avgSpent: number;
  avgOrderCount: number;
}

// 获取客户列表
export const getCustomers = (params: CustomerQueryParams) => {
  return httpClient.get('/api/customers', { params });
};

// 获取客户详情
export const getCustomerDetail = (id: string) => {
  return httpClient.get(`/api/customers/${id}`);
};

// 创建客户
export const createCustomer = (data: Partial<Customer>) => {
  return httpClient.post('/api/customers', data);
};

// 更新客户信息
export const updateCustomer = (id: string, data: Partial<Customer>) => {
  return httpClient.put(`/api/customers/${id}`, data);
};

// 删除客户
export const deleteCustomer = (id: string) => {
  return httpClient.delete(`/api/customers/${id}`);
};

// 批量删除客户
export const batchDeleteCustomers = (ids: string[]) => {
  return httpClient.delete('/api/customers', { data: { ids } });
};

// 更新客户状态
export const updateCustomerStatus = (id: string, status: 'active' | 'inactive') => {
  return httpClient.patch(`/api/customers/${id}/status`, { status });
};

// 获取客户统计数据
export const getCustomerStatistics = () => {
  return httpClient.get('/api/customers/statistics');
};

// 获取客户消费记录
export const getCustomerOrderHistory = (id: string, params?: { page?: number; size?: number }) => {
  return httpClient.get(`/api/customers/${id}/orders`, { params });
};

// 获取客户积分记录
export const getCustomerPointsHistory = (id: string, params?: { page?: number; size?: number }) => {
  return httpClient.get(`/api/customers/${id}/points`, { params });
};

// 导出客户列表
export const exportCustomers = (params: CustomerQueryParams) => {
  return httpClient.get('/api/customers/export', { params });
};

// 导入客户列表
export const importCustomers = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return httpClient.post('/api/customers/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
