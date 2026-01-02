/**
 * YYC³餐饮行业智能化平台 - 系统警告状态管理
 */

import { defineStore } from 'pinia'
import { ref, readonly } from 'vue'

export interface SystemAlert {
  id: string
  level: 'info' | 'warning' | 'error' | 'success'
  title?: string
  message: string
  timestamp?: number
  closable?: boolean
  autoClose?: boolean
  duration?: number
  actions?: Array<{
    key: string
    label: string
    type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
    size?: 'large' | 'default' | 'small'
    autoClose?: boolean
    action: (alert: SystemAlert) => void | Promise<void>
  }>
}

export const useSystemAlertStore = defineStore('systemAlert', () => {
  const alerts = ref<SystemAlert[]>([])

  const generateId = (): string => {
    const timestamp = new Date().getTime()
    const random = Math.random().toString(36).substr(2, 9)
    return `alert_${timestamp}_${random}`
  }

  const addAlert = (alert: Omit<SystemAlert, 'id' | 'timestamp'>): string => {
    const id = generateId()
    const newAlert: SystemAlert = {
      ...alert,
      id,
      timestamp: new Date().getTime(),
      closable: alert.closable !== false,
      autoClose: alert.autoClose !== false
    }

    alerts.value.push(newAlert)

    // 自动关闭
    if (newAlert.autoClose) {
      const duration = alert.duration || 8000
      setTimeout(() => {
        removeAlert(id)
      }, duration)
    }

    return id
  }

  const removeAlert = (id: string): boolean => {
    const index = alerts.value.findIndex(alert => alert.id === id)
    if (index > -1) {
      alerts.value.splice(index, 1)
      return true
    }
    return false
  }

  const clearAll = () => {
    alerts.value = []
  }

  const getAlert = (id: string): SystemAlert | undefined => {
    return alerts.value.find(alert => alert.id === id)
  }

  return {
    alerts: readonly(alerts),
    addAlert,
    removeAlert,
    clearAll,
    getAlert
  }
})