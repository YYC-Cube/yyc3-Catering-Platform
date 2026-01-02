/**
 * YYC³餐饮行业智能化平台 - 通知状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'

export interface Notification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title?: string
  message: string
  duration?: number
  persistent?: boolean
  timestamp: number
  read?: boolean
  actions?: Array<{
    key: string
    label: string
    type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
    action: (notification: Notification) => void
  }>
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])
  const maxNotifications = ref(50)
  const defaultDuration = ref(5000)

  const unreadCount = computed(() =>
    notifications.value.filter(n => !n.read).length
  )

  const notificationsByType = computed(() => {
    const grouped = {
      success: [] as Notification[],
      warning: [] as Notification[],
      error: [] as Notification[],
      info: [] as Notification[]
    }

    notifications.value.forEach(notification => {
      grouped[notification.type].push(notification)
    })

    return grouped
  })

  const generateId = (): string => {
    const timestamp = new Date().getTime()
    const random = Math.random().toString(36).substr(2, 9)
    return `notification_${timestamp}_${random}`
  }

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>): string => {
    const id = generateId()
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date().getTime(),
      read: false
    }

    if (notifications.value.length >= maxNotifications.value) {
      const oldestNonPersistent = notifications.value.find(n => !n.persistent)
      if (oldestNonPersistent) {
        removeNotification(oldestNonPersistent.id)
      } else {
        notifications.value.shift()
      }
    }

    notifications.value.push(newNotification)

    if (notification.duration !== 0) {
      const duration = notification.duration || defaultDuration.value
      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id)
        }, duration)
      }
    }

    if (notification.persistent) {
      saveToLocalStorage()
    }

    return id
  }

  const success = (message: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'message' | 'timestamp'>>) => {
    return addNotification({
      type: 'success',
      message,
      ...options
    })
  }

  const warning = (message: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'message' | 'timestamp'>>) => {
    return addNotification({
      type: 'warning',
      message,
      ...options
    })
  }

  const error = (message: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'message' | 'timestamp'>>) => {
    return addNotification({
      type: 'error',
      message,
      duration: 0,
      ...options
    })
  }

  const info = (message: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'message' | 'timestamp'>>) => {
    return addNotification({
      type: 'info',
      message,
      ...options
    })
  }

  const removeNotification = (id: string): boolean => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      const notification = notifications.value[index]
      notifications.value.splice(index, 1)

      if (notification.persistent) {
        saveToLocalStorage()
      }

      return true
    }
    return false
  }

  const markAsRead = (id: string): boolean => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
      if (notification.persistent) {
        saveToLocalStorage()
      }
      return true
    }
    return false
  }

  const markAllAsRead = () => {
    notifications.value.forEach(notification => {
      notification.read = true
    })
    saveToLocalStorage()
  }

  const clearAll = () => {
    notifications.value = []
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('yyc3_notifications')
    }
  }

  const clearByType = (type: Notification['type']) => {
    const filtered = notifications.value.filter(n => n.type !== type)
    notifications.value = filtered
    saveToLocalStorage()
  }

  const clearRead = () => {
    const filtered = notifications.value.filter(n => !n.read)
    notifications.value = filtered
    saveToLocalStorage()
  }

  const saveToLocalStorage = () => {
    if (typeof localStorage === 'undefined') return

    const persistent = notifications.value.filter(n => n.persistent)
    try {
      localStorage.setItem('yyc3_notifications', JSON.stringify(persistent))
    } catch (error) {
      console.warn('Failed to save notifications to localStorage:', error)
    }
  }

  const loadFromLocalStorage = () => {
    if (typeof localStorage === 'undefined') return

    try {
      const saved = localStorage.getItem('yyc3_notifications')
      if (saved) {
        const persistent: Notification[] = JSON.parse(saved)
        notifications.value.unshift(...persistent)
      }
    } catch (error) {
      console.warn('Failed to load notifications from localStorage:', error)
    }
  }

  const getNotification = (id: string): Notification | undefined => {
    return notifications.value.find(n => n.id === id)
  }

  const updateNotification = (id: string, updates: Partial<Notification>): boolean => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      Object.assign(notification, updates)
      if (notification.persistent) {
        saveToLocalStorage()
      }
      return true
    }
    return false
  }

  const setMaxNotifications = (max: number) => {
    maxNotifications.value = max

    while (notifications.value.length > max) {
      const oldestNonPersistent = notifications.value.find(n => !n.persistent)
      if (oldestNonPersistent) {
        removeNotification(oldestNonPersistent.id)
      } else {
        notifications.value.shift()
      }
    }
  }

  const setDefaultDuration = (duration: number) => {
    defaultDuration.value = duration
  }

  const init = () => {
    loadFromLocalStorage()

    const thirtyDaysAgo = new Date().getTime() - (30 * 24 * 60 * 60 * 1000)
    const validNotifications = notifications.value.filter(n =>
      !n.persistent || n.timestamp > thirtyDaysAgo
    )

    if (validNotifications.length !== notifications.value.length) {
      notifications.value = validNotifications
      saveToLocalStorage()
    }
  }

  return {
    notifications: readonly(notifications),
    maxNotifications: readonly(maxNotifications),
    defaultDuration: readonly(defaultDuration),
    unreadCount,
    notificationsByType,
    addNotification,
    success,
    warning,
    error,
    info,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    clearByType,
    clearRead,
    getNotification,
    updateNotification,
    setMaxNotifications,
    setDefaultDuration,
    init
  }
})

// 延迟初始化，在组件中使用时再初始化
export const initNotificationStore = () => {
  if (typeof window !== 'undefined') {
    const store = useNotificationStore()
    store.init()
  }
}