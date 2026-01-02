/**
 * YYC³餐饮行业智能化平台 - 告警状态管理
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Alert } from '@/types/dashboard'

export const useAlertStore = defineStore('alert', () => {
  // 状态
  const alerts = ref<Alert[]>([])

  // 方法
  const addAlert = (alert: Alert) => {
    alerts.value.unshift(alert)
    // 限制最大告警数量
    if (alerts.value.length > 20) {
      alerts.value.pop()
    }
  }

  const dismissAlert = (alertId: string) => {
    const index = alerts.value.findIndex(a => a.id === alertId)
    if (index !== -1) {
      alerts.value.splice(index, 1)
    }
  }

  const clearAllAlerts = () => {
    alerts.value = []
  }

  return {
    // 状态
    alerts,
    
    // 方法
    addAlert,
    dismissAlert,
    clearAllAlerts
  }
})
