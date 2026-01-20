/**
 * @fileoverview 厨房显示API服务
 * @description 处理厨房显示相关的API请求
 * @module kitchen-display
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 */

import { request } from '@/utils/request'

export interface OrderItem {
  id: string
  name: string
  quantity: number
  status: 'pending' | 'in_progress' | 'completed'
}

export interface Order {
  id: string
  orderNumber: string
  customerName: string
  phone: string
  orderTime: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed' | 'paused'
  items: OrderItem[]
  specialRequests?: string
}

export interface KitchenStation {
  id: string
  name: string
  status: 'idle' | 'busy' | 'maintenance'
  currentOrder?: Order
  todayCompleted: number
  avgTime: number
}

export interface KitchenSummary {
  totalOrders: number
  completedOrders: number
  avgOrderTime: number
  timeoutOrders: number
  completionRate: number
  activeStations: number
  totalStations: number
}

export interface OrderUpdateRequest {
  orderId: string
  status: 'pending' | 'in_progress' | 'completed' | 'paused'
  itemStatuses?: Array<{
    itemId: string
    status: 'pending' | 'in_progress' | 'completed'
  }>
}

export interface StationAssignmentRequest {
  stationId: string
  orderId: string
}

export interface StationUpdateRequest {
  stationId: string
  status: 'idle' | 'busy' | 'maintenance'
}

export const kitchenDisplayApi = {
  getOrders: async (params?: {
    status?: string
    priority?: string
    startTime?: string
    endTime?: string
  }) => {
    return request<Order[]>({
      url: '/api/kitchen/orders',
      method: 'GET',
      params
    })
  },

  getOrderById: async (orderId: string) => {
    return request<Order>({
      url: `/api/kitchen/orders/${orderId}`,
      method: 'GET'
    })
  },

  updateOrderStatus: async (data: OrderUpdateRequest) => {
    return request<Order>({
      url: `/api/kitchen/orders/${data.orderId}/status`,
      method: 'PUT',
      data
    })
  },

  startOrder: async (orderId: string) => {
    return request<Order>({
      url: `/api/kitchen/orders/${orderId}/start`,
      method: 'POST'
    })
  },

  completeOrder: async (orderId: string) => {
    return request<Order>({
      url: `/api/kitchen/orders/${orderId}/complete`,
      method: 'POST'
    })
  },

  pauseOrder: async (orderId: string) => {
    return request<Order>({
      url: `/api/kitchen/orders/${orderId}/pause`,
      method: 'POST'
    })
  },

  getKitchenStations: async () => {
    return request<KitchenStation[]>({
      url: '/api/kitchen/stations',
      method: 'GET'
    })
  },

  getStationById: async (stationId: string) => {
    return request<KitchenStation>({
      url: `/api/kitchen/stations/${stationId}`,
      method: 'GET'
    })
  },

  assignOrderToStation: async (data: StationAssignmentRequest) => {
    return request<KitchenStation>({
      url: `/api/kitchen/stations/${data.stationId}/assign`,
      method: 'POST',
      data: { orderId: data.orderId }
    })
  },

  completeStationOrder: async (stationId: string) => {
    return request<KitchenStation>({
      url: `/api/kitchen/stations/${stationId}/complete`,
      method: 'POST'
    })
  },

  updateStationStatus: async (data: StationUpdateRequest) => {
    return request<KitchenStation>({
      url: `/api/kitchen/stations/${data.stationId}/status`,
      method: 'PUT',
      data: { status: data.status }
    })
  },

  getKitchenSummary: async (params?: {
    startTime?: string
    endTime?: string
  }) => {
    return request<KitchenSummary>({
      url: '/api/kitchen/summary',
      method: 'GET',
      params
    })
  },

  refreshOrders: async () => {
    return request<Order[]>({
      url: '/api/kitchen/orders/refresh',
      method: 'POST'
    })
  },

  getAvailableStations: async () => {
    return request<KitchenStation[]>({
      url: '/api/kitchen/stations/available',
      method: 'GET'
    })
  },

  getPendingOrders: async () => {
    return request<Order[]>({
      url: '/api/kitchen/orders/pending',
      method: 'GET'
    })
  },

  getInProgressOrders: async () => {
    return request<Order[]>({
      url: '/api/kitchen/orders/in-progress',
      method: 'GET'
    })
  },

  getTimeoutOrders: async (threshold?: number) => {
    return request<Order[]>({
      url: '/api/kitchen/orders/timeout',
      method: 'GET',
      params: { threshold }
    })
  }
}
