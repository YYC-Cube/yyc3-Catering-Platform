/**
 * @fileoverview 连锁管理API服务
 * @description 提供连锁管理相关的API接口
 * @module chain
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 */

import { httpClient } from '@/utils/http'

export enum StoreType {
  DIRECT = 'direct',
  FRANCHISE = 'franchise'
}

export enum StoreStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  MAINTENANCE = 'maintenance'
}

export enum EmployeeStatus {
  ACTIVE = 'active',
  RESIGNED = 'resigned',
  LEAVE = 'leave'
}

export enum InventoryStatus {
  NORMAL = 'normal',
  WARNING = 'warning',
  OUT_OF_STOCK = 'out_of_stock'
}

export interface BusinessHours {
  open: string
  close: string
  enabled: boolean
}

export interface WeeklyBusinessHours {
  monday: BusinessHours
  tuesday: BusinessHours
  wednesday: BusinessHours
  thursday: BusinessHours
  friday: BusinessHours
  saturday: BusinessHours
  sunday: BusinessHours
}

export interface Manager {
  id: number
  name: string
  phone: string
  avatar?: string
}

export interface Store {
  id: number
  storeCode: string
  name: string
  type: StoreType
  status: StoreStatus
  address: string
  city: string
  district: string
  phone: string
  email?: string
  manager: Manager
  businessHours: WeeklyBusinessHours
  area: number
  capacity: number
  tables: number
  employees: number
  coordinates?: {
    latitude: number
    longitude: number
  }
  facilities?: string[]
  description?: string
  images?: string[]
  openingDate: string
  rating?: number
  reviewCount?: number
  createdAt: string
  updatedAt?: string
}

export interface EmergencyContact {
  name: string
  phone: string
  relationship: string
}

export interface Employee {
  id: number
  employeeCode: string
  name: string
  gender: 'male' | 'female' | 'other'
  phone: string
  email?: string
  avatar?: string
  storeId: number
  storeName: string
  department: string
  position: string
  status: EmployeeStatus
  hireDate: string
  resignDate?: string
  salary: number
  address?: string
  idCard?: string
  bankAccount?: string
  emergencyContact?: EmergencyContact
  permissions: string[]
  createdAt: string
  updatedAt?: string
}

export interface Supplier {
  id: number
  name: string
  phone: string
}

export interface Inventory {
  id: number
  storeId: number
  storeName: string
  productId: number
  productName: string
  productCode: string
  category: string
  quantity: number
  unit: string
  minQuantity: number
  maxQuantity: number
  costPrice: number
  status: InventoryStatus
  lastRestockDate?: string
  supplier?: Supplier
  location?: string
  batchNumber?: string
  expiryDate?: string
  createdAt: string
  updatedAt?: string
}

export interface StoreStats {
  storeId: number
  storeName: string
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  totalCustomers: number
  customerRetentionRate: number
  employeeCount: number
  averageRating: number
  dailyStats: DailyStats[]
  monthlyStats: MonthlyStats[]
}

export interface DailyStats {
  date: string
  orders: number
  revenue: number
  customers: number
}

export interface MonthlyStats {
  month: string
  orders: number
  revenue: number
  customers: number
}

export interface EmployeePerformance {
  employeeId: number
  employeeName: string
  storeName: string
  department: string
  position: string
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  customerSatisfaction: number
  attendanceRate: number
  performanceScore: number
  ranking: number
}

export interface RevenueComparison {
  storeId: number
  storeName: string
  revenue: number
  orders: number
  growth: number
}

export interface TrendData {
  date: string
  value: number
  predicted?: number
}

export interface StoreQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: StoreStatus
  type?: StoreType
  city?: string
  district?: string
}

export interface EmployeeQueryParams {
  page?: number
  limit?: number
  search?: string
  storeId?: number
  department?: string
  position?: string
  status?: EmployeeStatus
}

export interface InventoryQueryParams {
  page?: number
  limit?: number
  search?: string
  storeId?: number
  category?: string
  status?: InventoryStatus
}

export interface CreateStoreRequest {
  storeCode: string
  name: string
  type: StoreType
  status: StoreStatus
  address: string
  city: string
  district: string
  phone: string
  email?: string
  managerId: number
  businessHours: WeeklyBusinessHours
  area: number
  capacity: number
  tables: number
  coordinates?: {
    latitude: number
    longitude: number
  }
  facilities?: string[]
  description?: string
  images?: string[]
  openingDate: string
}

export interface UpdateStoreRequest {
  name?: string
  type?: StoreType
  status?: StoreStatus
  address?: string
  city?: string
  district?: string
  phone?: string
  email?: string
  managerId?: number
  businessHours?: WeeklyBusinessHours
  area?: number
  capacity?: number
  tables?: number
  coordinates?: {
    latitude: number
    longitude: number
  }
  facilities?: string[]
  description?: string
  images?: string[]
}

export interface CreateEmployeeRequest {
  employeeCode: string
  name: string
  gender: 'male' | 'female' | 'other'
  phone: string
  email?: string
  avatar?: string
  storeId: number
  department: string
  position: string
  status: EmployeeStatus
  hireDate: string
  salary: number
  address?: string
  idCard?: string
  bankAccount?: string
  emergencyContact?: EmergencyContact
  permissions: string[]
}

export interface UpdateEmployeeRequest {
  name?: string
  gender?: 'male' | 'female' | 'other'
  phone?: string
  email?: string
  avatar?: string
  storeId?: number
  department?: string
  position?: string
  status?: EmployeeStatus
  salary?: number
  address?: string
  idCard?: string
  bankAccount?: string
  emergencyContact?: EmergencyContact
  permissions?: string[]
}

export interface TransferEmployeeRequest {
  targetStoreId: number
  reason: string
  effectiveDate: string
}

export interface RestockInventoryRequest {
  storeId: number
  productId: number
  quantity: number
  costPrice: number
  supplier?: Supplier
  batchNumber?: string
  expiryDate?: string
  remarks?: string
}

export interface TransferInventoryRequest {
  sourceStoreId: number
  targetStoreId: number
  productId: number
  quantity: number
  reason: string
  effectiveDate: string
}

export interface CheckInventoryRequest {
  storeId: number
  checkDate: string
  details: {
    productId: number
    actualQuantity: number
    difference: number
    reason?: string
  }[]
}

export class ChainAPI {
  private baseUrl = '/api/chain'

  async getStores(params?: StoreQueryParams): Promise<{ success: boolean; data: { items: Store[]; pagination: any }; message?: string }> {
    try {
      const queryString = new URLSearchParams()
      if (params?.page) queryString.set('page', params.page.toString())
      if (params?.limit) queryString.set('limit', params.limit.toString())
      if (params?.search) queryString.set('search', params.search)
      if (params?.status) queryString.set('status', params.status)
      if (params?.type) queryString.set('type', params.type)
      if (params?.city) queryString.set('city', params.city)
      if (params?.district) queryString.set('district', params.district)

      const endpoint = queryString.toString() ? `${this.baseUrl}/stores?${queryString}` : `${this.baseUrl}/stores`
      const response = await httpClient.get<{ success: boolean; data: { items: Store[]; pagination: any }; message?: string }>(endpoint)
      return response
    } catch (error) {
      console.error('Get stores failed:', error)
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
        message: '获取门店列表失败'
      }
    }
  }

  async getStore(id: number): Promise<{ success: boolean; data?: Store; message?: string }> {
    try {
      const response = await httpClient.get<{ success: boolean; data?: Store; message?: string }>(`${this.baseUrl}/stores/${id}`)
      return response
    } catch (error) {
      console.error('Get store failed:', error)
      return {
        success: false,
        message: '获取门店详情失败'
      }
    }
  }

  async createStore(storeData: CreateStoreRequest): Promise<{ success: boolean; data?: Store; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; data?: Store; message?: string }>(`${this.baseUrl}/stores`, storeData)
      return response
    } catch (error) {
      console.error('Create store failed:', error)
      return {
        success: false,
        message: '创建门店失败'
      }
    }
  }

  async updateStore(id: number, storeData: UpdateStoreRequest): Promise<{ success: boolean; data?: Store; message?: string }> {
    try {
      const response = await httpClient.put<{ success: boolean; data?: Store; message?: string }>(`${this.baseUrl}/stores/${id}`, storeData)
      return response
    } catch (error) {
      console.error('Update store failed:', error)
      return {
        success: false,
        message: '更新门店失败'
      }
    }
  }

  async deleteStore(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.delete<{ success: boolean; message?: string }>(`${this.baseUrl}/stores/${id}`)
      return response
    } catch (error) {
      console.error('Delete store failed:', error)
      return {
        success: false,
        message: '删除门店失败'
      }
    }
  }

  async updateStoreStatus(id: number, status: StoreStatus): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.patch<{ success: boolean; message?: string }>(`${this.baseUrl}/stores/${id}/status`, { status })
      return response
    } catch (error) {
      console.error('Update store status failed:', error)
      return {
        success: false,
        message: '更新门店状态失败'
      }
    }
  }

  async getStoreStats(id: number, startDate?: string, endDate?: string): Promise<{ success: boolean; data?: StoreStats; message?: string }> {
    try {
      const queryString = new URLSearchParams()
      if (startDate) queryString.set('startDate', startDate)
      if (endDate) queryString.set('endDate', endDate)

      const endpoint = queryString.toString() ? `${this.baseUrl}/stores/${id}/stats?${queryString}` : `${this.baseUrl}/stores/${id}/stats`
      const response = await httpClient.get<{ success: boolean; data?: StoreStats; message?: string }>(endpoint)
      return response
    } catch (error) {
      console.error('Get store stats failed:', error)
      return {
        success: false,
        message: '获取门店统计失败'
      }
    }
  }

  async getEmployees(params?: EmployeeQueryParams): Promise<{ success: boolean; data: { items: Employee[]; pagination: any }; message?: string }> {
    try {
      const queryString = new URLSearchParams()
      if (params?.page) queryString.set('page', params.page.toString())
      if (params?.limit) queryString.set('limit', params.limit.toString())
      if (params?.search) queryString.set('search', params.search)
      if (params?.storeId) queryString.set('storeId', params.storeId.toString())
      if (params?.department) queryString.set('department', params.department)
      if (params?.position) queryString.set('position', params.position)
      if (params?.status) queryString.set('status', params.status)

      const endpoint = queryString.toString() ? `${this.baseUrl}/employees?${queryString}` : `${this.baseUrl}/employees`
      const response = await httpClient.get<{ success: boolean; data: { items: Employee[]; pagination: any }; message?: string }>(endpoint)
      return response
    } catch (error) {
      console.error('Get employees failed:', error)
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
        message: '获取员工列表失败'
      }
    }
  }

  async getEmployee(id: number): Promise<{ success: boolean; data?: Employee; message?: string }> {
    try {
      const response = await httpClient.get<{ success: boolean; data?: Employee; message?: string }>(`${this.baseUrl}/employees/${id}`)
      return response
    } catch (error) {
      console.error('Get employee failed:', error)
      return {
        success: false,
        message: '获取员工详情失败'
      }
    }
  }

  async createEmployee(employeeData: CreateEmployeeRequest): Promise<{ success: boolean; data?: Employee; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; data?: Employee; message?: string }>(`${this.baseUrl}/employees`, employeeData)
      return response
    } catch (error) {
      console.error('Create employee failed:', error)
      return {
        success: false,
        message: '创建员工失败'
      }
    }
  }

  async updateEmployee(id: number, employeeData: UpdateEmployeeRequest): Promise<{ success: boolean; data?: Employee; message?: string }> {
    try {
      const response = await httpClient.put<{ success: boolean; data?: Employee; message?: string }>(`${this.baseUrl}/employees/${id}`, employeeData)
      return response
    } catch (error) {
      console.error('Update employee failed:', error)
      return {
        success: false,
        message: '更新员工失败'
      }
    }
  }

  async deleteEmployee(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.delete<{ success: boolean; message?: string }>(`${this.baseUrl}/employees/${id}`)
      return response
    } catch (error) {
      console.error('Delete employee failed:', error)
      return {
        success: false,
        message: '删除员工失败'
      }
    }
  }

  async transferEmployee(id: number, transferData: TransferEmployeeRequest): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; message?: string }>(`${this.baseUrl}/employees/${id}/transfer`, transferData)
      return response
    } catch (error) {
      console.error('Transfer employee failed:', error)
      return {
        success: false,
        message: '员工调店失败'
      }
    }
  }

  async updateEmployeePermissions(id: number, permissions: string[]): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.put<{ success: boolean; message?: string }>(`${this.baseUrl}/employees/${id}/permissions`, { permissions })
      return response
    } catch (error) {
      console.error('Update employee permissions failed:', error)
      return {
        success: false,
        message: '更新员工权限失败'
      }
    }
  }

  async getEmployeePerformance(id: number, startDate?: string, endDate?: string): Promise<{ success: boolean; data?: EmployeePerformance; message?: string }> {
    try {
      const queryString = new URLSearchParams()
      if (startDate) queryString.set('startDate', startDate)
      if (endDate) queryString.set('endDate', endDate)

      const endpoint = queryString.toString() ? `${this.baseUrl}/employees/${id}/performance?${queryString}` : `${this.baseUrl}/employees/${id}/performance`
      const response = await httpClient.get<{ success: boolean; data?: EmployeePerformance; message?: string }>(endpoint)
      return response
    } catch (error) {
      console.error('Get employee performance failed:', error)
      return {
        success: false,
        message: '获取员工绩效失败'
      }
    }
  }

  async getInventory(params?: InventoryQueryParams): Promise<{ success: boolean; data: { items: Inventory[]; pagination: any }; message?: string }> {
    try {
      const queryString = new URLSearchParams()
      if (params?.page) queryString.set('page', params.page.toString())
      if (params?.limit) queryString.set('limit', params.limit.toString())
      if (params?.search) queryString.set('search', params.search)
      if (params?.storeId) queryString.set('storeId', params.storeId.toString())
      if (params?.category) queryString.set('category', params.category)
      if (params?.status) queryString.set('status', params.status)

      const endpoint = queryString.toString() ? `${this.baseUrl}/inventory?${queryString}` : `${this.baseUrl}/inventory`
      const response = await httpClient.get<{ success: boolean; data: { items: Inventory[]; pagination: any }; message?: string }>(endpoint)
      return response
    } catch (error) {
      console.error('Get inventory failed:', error)
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
        message: '获取库存列表失败'
      }
    }
  }

  async getInventoryItem(id: number): Promise<{ success: boolean; data?: Inventory; message?: string }> {
    try {
      const response = await httpClient.get<{ success: boolean; data?: Inventory; message?: string }>(`${this.baseUrl}/inventory/${id}`)
      return response
    } catch (error) {
      console.error('Get inventory item failed:', error)
      return {
        success: false,
        message: '获取库存详情失败'
      }
    }
  }

  async restockInventory(restockData: RestockInventoryRequest): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; message?: string }>(`${this.baseUrl}/inventory/restock`, restockData)
      return response
    } catch (error) {
      console.error('Restock inventory failed:', error)
      return {
        success: false,
        message: '库存补货失败'
      }
    }
  }

  async transferInventory(transferData: TransferInventoryRequest): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; message?: string }>(`${this.baseUrl}/inventory/transfer`, transferData)
      return response
    } catch (error) {
      console.error('Transfer inventory failed:', error)
      return {
        success: false,
        message: '库存调拨失败'
      }
    }
  }

  async checkInventory(checkData: CheckInventoryRequest): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; message?: string }>(`${this.baseUrl}/inventory/check`, checkData)
      return response
    } catch (error) {
      console.error('Check inventory failed:', error)
      return {
        success: false,
        message: '库存盘点失败'
      }
    }
  }

  async getInventoryWarnings(storeId?: number): Promise<{ success: boolean; data: Inventory[]; message?: string }> {
    try {
      const queryString = new URLSearchParams()
      if (storeId) queryString.set('storeId', storeId.toString())

      const endpoint = queryString.toString() ? `${this.baseUrl}/inventory/warnings?${queryString}` : `${this.baseUrl}/inventory/warnings`
      const response = await httpClient.get<{ success: boolean; data: Inventory[]; message?: string }>(endpoint)
      return response
    } catch (error) {
      console.error('Get inventory warnings failed:', error)
      return {
        success: false,
        data: [],
        message: '获取库存预警失败'
      }
    }
  }

  async getStoreStatsOverview(startDate?: string, endDate?: string): Promise<{ success: boolean; data: StoreStats[]; message?: string }> {
    try {
      const queryString = new URLSearchParams()
      if (startDate) queryString.set('startDate', startDate)
      if (endDate) queryString.set('endDate', endDate)

      const endpoint = queryString.toString() ? `${this.baseUrl}/stats/stores?${queryString}` : `${this.baseUrl}/stats/stores`
      const response = await httpClient.get<{ success: boolean; data: StoreStats[]; message?: string }>(endpoint)
      return response
    } catch (error) {
      console.error('Get store stats overview failed:', error)
      return {
        success: false,
        data: [],
        message: '获取门店统计失败'
      }
    }
  }

  async getEmployeePerformanceOverview(storeId?: number, startDate?: string, endDate?: string): Promise<{ success: boolean; data: EmployeePerformance[]; message?: string }> {
    try {
      const queryString = new URLSearchParams()
      if (storeId) queryString.set('storeId', storeId.toString())
      if (startDate) queryString.set('startDate', startDate)
      if (endDate) queryString.set('endDate', endDate)

      const endpoint = queryString.toString() ? `${this.baseUrl}/stats/employees?${queryString}` : `${this.baseUrl}/stats/employees`
      const response = await httpClient.get<{ success: boolean; data: EmployeePerformance[]; message?: string }>(endpoint)
      return response
    } catch (error) {
      console.error('Get employee performance overview failed:', error)
      return {
        success: false,
        data: [],
        message: '获取员工绩效失败'
      }
    }
  }

  async getRevenueComparison(storeIds: number[], startDate?: string, endDate?: string, dimension?: 'day' | 'week' | 'month' | 'year'): Promise<{ success: boolean; data: RevenueComparison[]; message?: string }> {
    try {
      const queryString = new URLSearchParams()
      storeIds.forEach(id => queryString.append('storeIds', id.toString()))
      if (startDate) queryString.set('startDate', startDate)
      if (endDate) queryString.set('endDate', endDate)
      if (dimension) queryString.set('dimension', dimension)

      const endpoint = queryString.toString() ? `${this.baseUrl}/stats/revenue?${queryString}` : `${this.baseUrl}/stats/revenue`
      const response = await httpClient.get<{ success: boolean; data: RevenueComparison[]; message?: string }>(endpoint)
      return response
    } catch (error) {
      console.error('Get revenue comparison failed:', error)
      return {
        success: false,
        data: [],
        message: '获取营收对比失败'
      }
    }
  }

  async getTrendAnalysis(storeId: number, dimension: 'orders' | 'revenue' | 'customers' | 'employees', startDate?: string, endDate?: string): Promise<{ success: boolean; data: TrendData[]; message?: string }> {
    try {
      const queryString = new URLSearchParams()
      queryString.set('dimension', dimension)
      if (startDate) queryString.set('startDate', startDate)
      if (endDate) queryString.set('endDate', endDate)

      const endpoint = queryString.toString() ? `${this.baseUrl}/stats/trends?${queryString}` : `${this.baseUrl}/stats/trends`
      const response = await httpClient.get<{ success: boolean; data: TrendData[]; message?: string }>(endpoint)
      return response
    } catch (error) {
      console.error('Get trend analysis failed:', error)
      return {
        success: false,
        data: [],
        message: '获取趋势分析失败'
      }
    }
  }
}

export const chainAPI = new ChainAPI()
