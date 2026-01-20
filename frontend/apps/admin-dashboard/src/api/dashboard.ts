/**
 * @fileoverview YYC³餐饮平台 - Dashboard API服务
 * @description 提供Dashboard数据获取的API接口封装
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import axios from 'axios';
import type { CoreMetrics, RevenueData, OrderDistribution, TopDish, CustomerFlow, Order } from '@/types/dashboard';

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

export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  period?: 'day' | 'week' | 'month';
}

export interface DashboardResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const dashboardApi = {
  async getCoreMetrics(filters?: DashboardFilters): Promise<DashboardResponse<CoreMetrics>> {
    try {
      const response = await apiClient.get<DashboardResponse<CoreMetrics>>('/dashboard/metrics', {
        params: filters,
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch core metrics:', error);
      throw error;
    }
  },

  async getRevenueData(filters?: DashboardFilters): Promise<DashboardResponse<RevenueData[]>> {
    try {
      const response = await apiClient.get<DashboardResponse<RevenueData[]>>('/dashboard/revenue', {
        params: filters,
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch revenue data:', error);
      throw error;
    }
  },

  async getOrderDistribution(filters?: DashboardFilters): Promise<DashboardResponse<OrderDistribution[]>> {
    try {
      const response = await apiClient.get<DashboardResponse<OrderDistribution[]>>('/dashboard/orders/distribution', {
        params: filters,
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch order distribution:', error);
      throw error;
    }
  },

  async getRecentOrders(limit: number = 10): Promise<DashboardResponse<Order[]>> {
    try {
      const response = await apiClient.get<DashboardResponse<Order[]>>('/dashboard/orders/recent', {
        params: { limit },
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch recent orders:', error);
      throw error;
    }
  },

  async getTopDishes(filters?: DashboardFilters): Promise<DashboardResponse<TopDish[]>> {
    try {
      const response = await apiClient.get<DashboardResponse<TopDish[]>>('/dashboard/menu/top', {
        params: filters,
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch top dishes:', error);
      throw error;
    }
  },

  async getCustomerFlow(filters?: DashboardFilters): Promise<DashboardResponse<CustomerFlow[]>> {
    try {
      const response = await apiClient.get<DashboardResponse<CustomerFlow[]>>('/dashboard/customer/flow', {
        params: filters,
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch customer flow:', error);
      throw error;
    }
  },

  async exportReport(format: 'excel' | 'pdf' | 'csv', filters?: DashboardFilters): Promise<Blob> {
    try {
      const response = await apiClient.post('/dashboard/export', {
        format,
        filters
      }, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to export report:', error);
      throw error;
    }
  },
};

export default dashboardApi;
