/**
 * @fileoverview YYC³餐饮平台 - 厨房管理API服务
 * @description 提供厨房管理模块的完整API接口
 * @author YYC³
 * @version 2.0.0
 * @created 2025-01-20
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import axios from 'axios';
import type {
  KitchenEquipment,
  KitchenEmployee,
  KitchenTask,
  KitchenInventory,
  HygieneRecord,
  SafetyRecord,
  KitchenStats,
  KitchenAnalytics,
  KitchenDisplay,
  EquipmentType,
  EquipmentStatus,
  EmployeePosition,
  EmployeeStatus,
  TaskStation,
  TaskPriority,
  TaskStatus,
  InventoryCategory,
  InventoryStatus,
  HygieneType,
  SafetyType,
  SafetySeverity,
  SafetyStatus
} from '@/types/kitchen';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface KitchenResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EquipmentQueryParams extends PaginationParams {
  type?: EquipmentType;
  status?: EquipmentStatus;
  search?: string;
}

export interface EmployeeQueryParams extends PaginationParams {
  position?: EmployeePosition;
  status?: EmployeeStatus;
  search?: string;
}

export interface TaskQueryParams extends PaginationParams {
  station?: TaskStation;
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
}

export interface InventoryQueryParams extends PaginationParams {
  category?: InventoryCategory;
  status?: InventoryStatus;
  search?: string;
}

export class KitchenAPI {
  private baseUrl = '/kitchen';

  async getStats(): Promise<KitchenResponse<KitchenStats>> {
    try {
      const response = await apiClient.get<KitchenResponse<KitchenStats>>(`${this.baseUrl}/stats`);
      return response.data;
    } catch (error: any) {
      console.error('获取厨房统计数据失败:', error);
      throw error;
    }
  }

  async getAnalytics(params: { startDate: string; endDate: string }): Promise<KitchenResponse<KitchenAnalytics>> {
    try {
      const response = await apiClient.get<KitchenResponse<KitchenAnalytics>>(`${this.baseUrl}/analytics`, { params });
      return response.data;
    } catch (error: any) {
      console.error('获取厨房分析数据失败:', error);
      throw error;
    }
  }

  async getEquipment(params?: EquipmentQueryParams): Promise<KitchenResponse<{ items: KitchenEquipment[]; pagination: any }>> {
    try {
      const queryString = new URLSearchParams();
      if (params?.page) queryString.set('page', params.page.toString());
      if (params?.limit) queryString.set('limit', params.limit.toString());
      if (params?.type) queryString.set('type', params.type);
      if (params?.status) queryString.set('status', params.status);
      if (params?.search) queryString.set('search', params.search);
      if (params?.sortBy) queryString.set('sortBy', params.sortBy);
      if (params?.sortOrder) queryString.set('sortOrder', params.sortOrder);

      const endpoint = queryString.toString() ? `${this.baseUrl}/equipment?${queryString}` : `${this.baseUrl}/equipment`;
      const response = await apiClient.get<KitchenResponse<{ items: KitchenEquipment[]; pagination: any }>>(endpoint);
      return response.data;
    } catch (error: any) {
      console.error('获取设备列表失败:', error);
      return {
        success: false,
        data: { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
        message: '获取设备列表失败'
      };
    }
  }

  async createEquipment(equipment: Partial<KitchenEquipment>): Promise<KitchenResponse<KitchenEquipment>> {
    try {
      const response = await apiClient.post<KitchenResponse<KitchenEquipment>>(`${this.baseUrl}/equipment`, equipment);
      return response.data;
    } catch (error: any) {
      console.error('创建设备失败:', error);
      throw error;
    }
  }

  async updateEquipment(id: string, equipment: Partial<KitchenEquipment>): Promise<KitchenResponse<KitchenEquipment>> {
    try {
      const response = await apiClient.put<KitchenResponse<KitchenEquipment>>(`${this.baseUrl}/equipment/${id}`, equipment);
      return response.data;
    } catch (error: any) {
      console.error('更新设备失败:', error);
      throw error;
    }
  }

  async deleteEquipment(id: string): Promise<KitchenResponse<boolean>> {
    try {
      const response = await apiClient.delete<KitchenResponse<boolean>>(`${this.baseUrl}/equipment/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('删除设备失败:', error);
      throw error;
    }
  }

  async getEmployees(params?: EmployeeQueryParams): Promise<KitchenResponse<{ items: KitchenEmployee[]; pagination: any }>> {
    try {
      const queryString = new URLSearchParams();
      if (params?.page) queryString.set('page', params.page.toString());
      if (params?.limit) queryString.set('limit', params.limit.toString());
      if (params?.position) queryString.set('position', params.position);
      if (params?.status) queryString.set('status', params.status);
      if (params?.search) queryString.set('search', params.search);
      if (params?.sortBy) queryString.set('sortBy', params.sortBy);
      if (params?.sortOrder) queryString.set('sortOrder', params.sortOrder);

      const endpoint = queryString.toString() ? `${this.baseUrl}/employees?${queryString}` : `${this.baseUrl}/employees`;
      const response = await apiClient.get<KitchenResponse<{ items: KitchenEmployee[]; pagination: any }>>(endpoint);
      return response.data;
    } catch (error: any) {
      console.error('获取员工列表失败:', error);
      return {
        success: false,
        data: { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
        message: '获取员工列表失败'
      };
    }
  }

  async createEmployee(employee: Partial<KitchenEmployee>): Promise<KitchenResponse<KitchenEmployee>> {
    try {
      const response = await apiClient.post<KitchenResponse<KitchenEmployee>>(`${this.baseUrl}/employees`, employee);
      return response.data;
    } catch (error: any) {
      console.error('创建员工失败:', error);
      throw error;
    }
  }

  async updateEmployee(id: string, employee: Partial<KitchenEmployee>): Promise<KitchenResponse<KitchenEmployee>> {
    try {
      const response = await apiClient.put<KitchenResponse<KitchenEmployee>>(`${this.baseUrl}/employees/${id}`, employee);
      return response.data;
    } catch (error: any) {
      console.error('更新员工失败:', error);
      throw error;
    }
  }

  async deleteEmployee(id: string): Promise<KitchenResponse<boolean>> {
    try {
      const response = await apiClient.delete<KitchenResponse<boolean>>(`${this.baseUrl}/employees/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('删除员工失败:', error);
      throw error;
    }
  }

  async updateEmployeeStatus(id: string, status: EmployeeStatus): Promise<KitchenResponse<KitchenEmployee>> {
    try {
      const response = await apiClient.patch<KitchenResponse<KitchenEmployee>>(`${this.baseUrl}/employees/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      console.error('更新员工状态失败:', error);
      throw error;
    }
  }

  async getTasks(params?: TaskQueryParams): Promise<KitchenResponse<{ items: KitchenTask[]; pagination: any }>> {
    try {
      const queryString = new URLSearchParams();
      if (params?.page) queryString.set('page', params.page.toString());
      if (params?.limit) queryString.set('limit', params.limit.toString());
      if (params?.station) queryString.set('station', params.station);
      if (params?.status) queryString.set('status', params.status);
      if (params?.priority) queryString.set('priority', params.priority);
      if (params?.search) queryString.set('search', params.search);
      if (params?.sortBy) queryString.set('sortBy', params.sortBy);
      if (params?.sortOrder) queryString.set('sortOrder', params.sortOrder);

      const endpoint = queryString.toString() ? `${this.baseUrl}/tasks?${queryString}` : `${this.baseUrl}/tasks`;
      const response = await apiClient.get<KitchenResponse<{ items: KitchenTask[]; pagination: any }>>(endpoint);
      return response.data;
    } catch (error: any) {
      console.error('获取任务列表失败:', error);
      return {
        success: false,
        data: { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
        message: '获取任务列表失败'
      };
    }
  }

  async createTask(task: Partial<KitchenTask>): Promise<KitchenResponse<KitchenTask>> {
    try {
      const response = await apiClient.post<KitchenResponse<KitchenTask>>(`${this.baseUrl}/tasks`, task);
      return response.data;
    } catch (error: any) {
      console.error('创建任务失败:', error);
      throw error;
    }
  }

  async updateTask(id: string, task: Partial<KitchenTask>): Promise<KitchenResponse<KitchenTask>> {
    try {
      const response = await apiClient.put<KitchenResponse<KitchenTask>>(`${this.baseUrl}/tasks/${id}`, task);
      return response.data;
    } catch (error: any) {
      console.error('更新任务失败:', error);
      throw error;
    }
  }

  async deleteTask(id: string): Promise<KitchenResponse<boolean>> {
    try {
      const response = await apiClient.delete<KitchenResponse<boolean>>(`${this.baseUrl}/tasks/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('删除任务失败:', error);
      throw error;
    }
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<KitchenResponse<KitchenTask>> {
    try {
      const response = await apiClient.patch<KitchenResponse<KitchenTask>>(`${this.baseUrl}/tasks/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      console.error('更新任务状态失败:', error);
      throw error;
    }
  }

  async assignTask(taskId: string, employeeId: string): Promise<KitchenResponse<KitchenTask>> {
    try {
      const response = await apiClient.patch<KitchenResponse<KitchenTask>>(`${this.baseUrl}/tasks/${taskId}/assign`, { employeeId });
      return response.data;
    } catch (error: any) {
      console.error('分配任务失败:', error);
      throw error;
    }
  }

  async getInventory(params?: InventoryQueryParams): Promise<KitchenResponse<{ items: KitchenInventory[]; pagination: any }>> {
    try {
      const queryString = new URLSearchParams();
      if (params?.page) queryString.set('page', params.page.toString());
      if (params?.limit) queryString.set('limit', params.limit.toString());
      if (params?.category) queryString.set('category', params.category);
      if (params?.status) queryString.set('status', params.status);
      if (params?.search) queryString.set('search', params.search);
      if (params?.sortBy) queryString.set('sortBy', params.sortBy);
      if (params?.sortOrder) queryString.set('sortOrder', params.sortOrder);

      const endpoint = queryString.toString() ? `${this.baseUrl}/inventory?${queryString}` : `${this.baseUrl}/inventory`;
      const response = await apiClient.get<KitchenResponse<{ items: KitchenInventory[]; pagination: any }>>(endpoint);
      return response.data;
    } catch (error: any) {
      console.error('获取库存列表失败:', error);
      return {
        success: false,
        data: { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
        message: '获取库存列表失败'
      };
    }
  }

  async createInventoryItem(item: Partial<KitchenInventory>): Promise<KitchenResponse<KitchenInventory>> {
    try {
      const response = await apiClient.post<KitchenResponse<KitchenInventory>>(`${this.baseUrl}/inventory`, item);
      return response.data;
    } catch (error: any) {
      console.error('创建库存项失败:', error);
      throw error;
    }
  }

  async updateInventoryItem(id: string, item: Partial<KitchenInventory>): Promise<KitchenResponse<KitchenInventory>> {
    try {
      const response = await apiClient.put<KitchenResponse<KitchenInventory>>(`${this.baseUrl}/inventory/${id}`, item);
      return response.data;
    } catch (error: any) {
      console.error('更新库存项失败:', error);
      throw error;
    }
  }

  async deleteInventoryItem(id: string): Promise<KitchenResponse<boolean>> {
    try {
      const response = await apiClient.delete<KitchenResponse<boolean>>(`${this.baseUrl}/inventory/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('删除库存项失败:', error);
      throw error;
    }
  }

  async restockInventory(id: string, quantity: number): Promise<KitchenResponse<KitchenInventory>> {
    try {
      const response = await apiClient.post<KitchenResponse<KitchenInventory>>(`${this.baseUrl}/inventory/${id}/restock`, { quantity });
      return response.data;
    } catch (error: any) {
      console.error('补货失败:', error);
      throw error;
    }
  }

  async getHygieneRecords(params?: PaginationParams & { type?: HygieneType }): Promise<KitchenResponse<{ items: HygieneRecord[]; pagination: any }>> {
    try {
      const queryString = new URLSearchParams();
      if (params?.page) queryString.set('page', params.page.toString());
      if (params?.limit) queryString.set('limit', params.limit.toString());
      if (params?.type) queryString.set('type', params.type);

      const endpoint = queryString.toString() ? `${this.baseUrl}/hygiene?${queryString}` : `${this.baseUrl}/hygiene`;
      const response = await apiClient.get<KitchenResponse<{ items: HygieneRecord[]; pagination: any }>>(endpoint);
      return response.data;
    } catch (error: any) {
      console.error('获取卫生记录失败:', error);
      return {
        success: false,
        data: { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
        message: '获取卫生记录失败'
      };
    }
  }

  async createHygieneRecord(record: Partial<HygieneRecord>): Promise<KitchenResponse<HygieneRecord>> {
    try {
      const response = await apiClient.post<KitchenResponse<HygieneRecord>>(`${this.baseUrl}/hygiene`, record);
      return response.data;
    } catch (error: any) {
      console.error('创建卫生记录失败:', error);
      throw error;
    }
  }

  async updateHygieneRecord(id: string, record: Partial<HygieneRecord>): Promise<KitchenResponse<HygieneRecord>> {
    try {
      const response = await apiClient.put<KitchenResponse<HygieneRecord>>(`${this.baseUrl}/hygiene/${id}`, record);
      return response.data;
    } catch (error: any) {
      console.error('更新卫生记录失败:', error);
      throw error;
    }
  }

  async getSafetyRecords(params?: PaginationParams & { type?: SafetyType; severity?: SafetySeverity; status?: SafetyStatus }): Promise<KitchenResponse<{ items: SafetyRecord[]; pagination: any }>> {
    try {
      const queryString = new URLSearchParams();
      if (params?.page) queryString.set('page', params.page.toString());
      if (params?.limit) queryString.set('limit', params.limit.toString());
      if (params?.type) queryString.set('type', params.type);
      if (params?.severity) queryString.set('severity', params.severity);
      if (params?.status) queryString.set('status', params.status);

      const endpoint = queryString.toString() ? `${this.baseUrl}/safety?${queryString}` : `${this.baseUrl}/safety`;
      const response = await apiClient.get<KitchenResponse<{ items: SafetyRecord[]; pagination: any }>>(endpoint);
      return response.data;
    } catch (error: any) {
      console.error('获取安全记录失败:', error);
      return {
        success: false,
        data: { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
        message: '获取安全记录失败'
      };
    }
  }

  async createSafetyRecord(record: Partial<SafetyRecord>): Promise<KitchenResponse<SafetyRecord>> {
    try {
      const response = await apiClient.post<KitchenResponse<SafetyRecord>>(`${this.baseUrl}/safety`, record);
      return response.data;
    } catch (error: any) {
      console.error('创建安全记录失败:', error);
      throw error;
    }
  }

  async updateSafetyRecord(id: string, record: Partial<SafetyRecord>): Promise<KitchenResponse<SafetyRecord>> {
    try {
      const response = await apiClient.put<KitchenResponse<SafetyRecord>>(`${this.baseUrl}/safety/${id}`, record);
      return response.data;
    } catch (error: any) {
      console.error('更新安全记录失败:', error);
      throw error;
    }
  }

  async updateSafetyRecordStatus(id: string, status: SafetyStatus): Promise<KitchenResponse<SafetyRecord>> {
    try {
      const response = await apiClient.patch<KitchenResponse<SafetyRecord>>(`${this.baseUrl}/safety/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      console.error('更新安全记录状态失败:', error);
      throw error;
    }
  }

  async getDisplays(): Promise<KitchenResponse<KitchenDisplay[]>> {
    try {
      const response = await apiClient.get<KitchenResponse<KitchenDisplay[]>>(`${this.baseUrl}/displays`);
      return response.data;
    } catch (error: any) {
      console.error('获取显示配置失败:', error);
      return {
        success: false,
        data: [],
        message: '获取显示配置失败'
      };
    }
  }

  async createDisplay(display: Partial<KitchenDisplay>): Promise<KitchenResponse<KitchenDisplay>> {
    try {
      const response = await apiClient.post<KitchenResponse<KitchenDisplay>>(`${this.baseUrl}/displays`, display);
      return response.data;
    } catch (error: any) {
      console.error('创建显示配置失败:', error);
      throw error;
    }
  }

  async updateDisplay(id: string, display: Partial<KitchenDisplay>): Promise<KitchenResponse<KitchenDisplay>> {
    try {
      const response = await apiClient.put<KitchenResponse<KitchenDisplay>>(`${this.baseUrl}/displays/${id}`, display);
      return response.data;
    } catch (error: any) {
      console.error('更新显示配置失败:', error);
      throw error;
    }
  }

  async deleteDisplay(id: string): Promise<KitchenResponse<boolean>> {
    try {
      const response = await apiClient.delete<KitchenResponse<boolean>>(`${this.baseUrl}/displays/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('删除显示配置失败:', error);
      throw error;
    }
  }
}

export const kitchenAPI = new KitchenAPI();
export default kitchenAPI;
