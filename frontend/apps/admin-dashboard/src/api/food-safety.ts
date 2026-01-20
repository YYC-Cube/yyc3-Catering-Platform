/**
 * @fileoverview 食品安全管理API服务
 * @description 处理食品安全管理相关的API请求
 * @module food-safety
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 */

import { request } from '@/utils/request'

export interface Ingredient {
  id: string
  name: string
  category: 'vegetable' | 'meat' | 'seafood' | 'fruit' | 'seasoning' | 'other'
  quantity: number
  unit: string
  expiryDate: string
  storageCondition: 'room' | 'refrigerated' | 'frozen'
  status: 'safe' | 'expiring' | 'expired'
  supplier?: string
  batchNumber?: string
  purchaseDate?: string
  remarks?: string
}

export interface Storage {
  id: string
  name: string
  temperature: number
  humidity: number
  usedCapacity: number
  totalCapacity: number
  ingredientCount: number
  status: 'normal' | 'warning' | 'error'
  location?: string
  type: 'refrigerator' | 'freezer' | 'room' | 'pantry'
}

export interface Inspection {
  id: string
  inspectionDate: string
  inspector: string
  inspectorId?: string
  inspectionType: 'daily' | 'periodic' | 'special'
  result: 'pass' | 'fail' | 'improve'
  issues: number
  remarks: string
  attachments?: string[]
  checkedItems?: string[]
}

export interface Alert {
  id: string
  alertTime: string
  alertType: 'expiry' | 'temperature' | 'quality' | 'other'
  level: 'low' | 'medium' | 'high'
  description: string
  status: 'pending' | 'handled'
  relatedItemId?: string
  relatedItemType?: 'ingredient' | 'storage' | 'other'
  handler?: string
  handleTime?: string
  handleRemarks?: string
}

export interface SafetySummary {
  safetyLevel: 'A' | 'B' | 'C'
  totalRecords: number
  safeIngredients: number
  expiringSoon: number
  expiredCount: number
  inspectionRate: number
  alertCount: number
  trendData: Array<{
    date: string
    safe: number
    expired: number
    inspections: number
  }>
  categoryData: Array<{
    name: string
    value: number
  }>
  storageData: Array<{
    name: string
    value: number
  }>
}

export interface IngredientCreateRequest {
  name: string
  category: 'vegetable' | 'meat' | 'seafood' | 'fruit' | 'seasoning' | 'other'
  quantity: number
  unit: string
  expiryDate: string
  storageCondition: 'room' | 'refrigerated' | 'frozen'
  supplier?: string
  batchNumber?: string
  remarks?: string
}

export interface IngredientUpdateRequest {
  id: string
  name?: string
  category?: 'vegetable' | 'meat' | 'seafood' | 'fruit' | 'seasoning' | 'other'
  quantity?: number
  unit?: string
  expiryDate?: string
  storageCondition?: 'room' | 'refrigerated' | 'frozen'
  status?: 'safe' | 'expiring' | 'expired'
  supplier?: string
  batchNumber?: string
  remarks?: string
}

export interface InspectionCreateRequest {
  inspectionDate: string
  inspector: string
  inspectorId?: string
  inspectionType: 'daily' | 'periodic' | 'special'
  result: 'pass' | 'fail' | 'improve'
  issues: number
  remarks: string
  checkedItems?: string[]
  attachments?: string[]
}

export interface StorageUpdateRequest {
  id: string
  temperature?: number
  humidity?: number
  status?: 'normal' | 'warning' | 'error'
}

export const foodSafetyApi = {
  getIngredients: async (params?: {
    status?: string
    category?: string
    storageCondition?: string
    expiryDateStart?: string
    expiryDateEnd?: string
    keyword?: string
  }) => {
    return request<Ingredient[]>({
      url: '/api/food-safety/ingredients',
      method: 'GET',
      params
    })
  },

  getIngredientById: async (ingredientId: string) => {
    return request<Ingredient>({
      url: `/api/food-safety/ingredients/${ingredientId}`,
      method: 'GET'
    })
  },

  createIngredient: async (data: IngredientCreateRequest) => {
    return request<Ingredient>({
      url: '/api/food-safety/ingredients',
      method: 'POST',
      data
    })
  },

  updateIngredient: async (data: IngredientUpdateRequest) => {
    return request<Ingredient>({
      url: `/api/food-safety/ingredients/${data.id}`,
      method: 'PUT',
      data
    })
  },

  deleteIngredient: async (ingredientId: string) => {
    return request({
      url: `/api/food-safety/ingredients/${ingredientId}`,
      method: 'DELETE'
    })
  },

  getExpiringIngredients: async (days: number = 3) => {
    return request<Ingredient[]>({
      url: '/api/food-safety/ingredients/expiring',
      method: 'GET',
      params: { days }
    })
  },

  getExpiredIngredients: async () => {
    return request<Ingredient[]>({
      url: '/api/food-safety/ingredients/expired',
      method: 'GET'
    })
  },

  getStorages: async () => {
    return request<Storage[]>({
      url: '/api/food-safety/storages',
      method: 'GET'
    })
  },

  getStorageById: async (storageId: string) => {
    return request<Storage>({
      url: `/api/food-safety/storages/${storageId}`,
      method: 'GET'
    })
  },

  updateStorage: async (data: StorageUpdateRequest) => {
    return request<Storage>({
      url: `/api/food-safety/storages/${data.id}`,
      method: 'PUT',
      data
    })
  },

  getStorageIngredients: async (storageId: string) => {
    return request<Ingredient[]>({
      url: `/api/food-safety/storages/${storageId}/ingredients`,
      method: 'GET'
    })
  },

  getInspections: async (params?: {
    inspectionType?: string
    result?: string
    startDate?: string
    endDate?: string
    inspector?: string
  }) => {
    return request<Inspection[]>({
      url: '/api/food-safety/inspections',
      method: 'GET',
      params
    })
  },

  getInspectionById: async (inspectionId: string) => {
    return request<Inspection>({
      url: `/api/food-safety/inspections/${inspectionId}`,
      method: 'GET'
    })
  },

  createInspection: async (data: InspectionCreateRequest) => {
    return request<Inspection>({
      url: '/api/food-safety/inspections',
      method: 'POST',
      data
    })
  },

  deleteInspection: async (inspectionId: string) => {
    return request({
      url: `/api/food-safety/inspections/${inspectionId}`,
      method: 'DELETE'
    })
  },

  getAlerts: async (params?: {
    alertType?: string
    level?: string
    status?: string
    startDate?: string
    endDate?: string
  }) => {
    return request<Alert[]>({
      url: '/api/food-safety/alerts',
      method: 'GET',
      params
    })
  },

  getAlertById: async (alertId: string) => {
    return request<Alert>({
      url: `/api/food-safety/alerts/${alertId}`,
      method: 'GET'
    })
  },

  handleAlert: async (alertId: string, handleRemarks?: string) => {
    return request<Alert>({
      url: `/api/food-safety/alerts/${alertId}/handle`,
      method: 'POST',
      data: { handleRemarks }
    })
  },

  clearHandledAlerts: async () => {
    return request({
      url: '/api/food-safety/alerts/clear',
      method: 'POST'
    })
  },

  getSafetySummary: async (params?: {
    startDate?: string
    endDate?: string
  }) => {
    return request<SafetySummary>({
      url: '/api/food-safety/summary',
      method: 'GET',
      params
    })
  },

  getCategoryStatistics: async () => {
    return request<Array<{ name: string; value: number }>>({
      url: '/api/food-safety/statistics/category',
      method: 'GET'
    })
  },

  getStorageStatistics: async () => {
    return request<Array<{ name: string; value: number }>>({
      url: '/api/food-safety/statistics/storage',
      method: 'GET'
    })
  },

  getTrendData: async (days: number = 7) => {
    return request<Array<{
      date: string
      safe: number
      expired: number
      inspections: number
    }>>({
      url: '/api/food-safety/statistics/trend',
      method: 'GET',
      params: { days }
    })
  },

  exportIngredients: async (params?: {
    status?: string
    category?: string
    startDate?: string
    endDate?: string
  }) => {
    return request<Blob>({
      url: '/api/food-safety/ingredients/export',
      method: 'GET',
      params,
      responseType: 'blob'
    })
  },

  exportInspections: async (params?: {
    startDate?: string
    endDate?: string
    inspector?: string
  }) => {
    return request<Blob>({
      url: '/api/food-safety/inspections/export',
      method: 'GET',
      params,
      responseType: 'blob'
    })
  },

  importIngredients: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request({
      url: '/api/food-safety/ingredients/import',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  checkIngredientSafety: async (ingredientId: string) => {
    return request<{
      isSafe: boolean
      issues: string[]
      recommendations: string[]
    }>({
      url: `/api/food-safety/ingredients/${ingredientId}/check`,
      method: 'GET'
    })
  },

  generateInspectionReport: async (params?: {
    startDate?: string
    endDate?: string
    inspectionType?: string
  }) => {
    return request<Blob>({
      url: '/api/food-safety/inspections/report',
      method: 'GET',
      params,
      responseType: 'blob'
    })
  }
}
