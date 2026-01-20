/**
 * @fileoverview 快捷操作API接口
 * @description 提供快捷操作相关的API接口
 * @module quickActions
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { request } from '@/utils/request'

export interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  color: string
  path: string
  pinned?: boolean
  badge?: number
}

export interface QuickActionSettings {
  showBadge: boolean
  showDescription: boolean
  layout: 'grid' | 'list'
}

/**
 * 获取自定义快捷操作
 */
export const getCustomActions = async () => {
  return request.get<QuickAction[]>('/api/v1/quick-actions/custom')
}

/**
 * 保存自定义快捷操作
 */
export const saveCustomActions = async (actions: QuickAction[]) => {
  return request.post('/api/v1/quick-actions/custom', { actions })
}

/**
 * 删除自定义快捷操作
 */
export const deleteCustomAction = async (actionId: string) => {
  return request.delete(`/api/v1/quick-actions/custom/${actionId}`)
}

/**
 * 获取快捷操作设置
 */
export const getSettings = async () => {
  return request.get<QuickActionSettings>('/api/v1/quick-actions/settings')
}

/**
 * 保存快捷操作设置
 */
export const saveSettings = async (settings: QuickActionSettings) => {
  return request.post('/api/v1/quick-actions/settings', settings)
}

/**
 * 记录快捷操作使用统计
 */
export const recordUsage = async (actionId: string) => {
  return request.post(`/api/v1/quick-actions/${actionId}/usage`)
}

/**
 * 获取快捷操作使用统计
 */
export const getUsageStats = async (actionId: string) => {
  return request.get(`/api/v1/quick-actions/${actionId}/stats`)
}

export const quickActionsApi = {
  getCustomActions,
  saveCustomActions,
  deleteCustomAction,
  getSettings,
  saveSettings,
  recordUsage,
  getUsageStats
}
