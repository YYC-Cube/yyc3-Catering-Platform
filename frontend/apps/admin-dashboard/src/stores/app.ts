/**
 * YYC³餐饮行业智能化平台 - 应用状态管理
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

interface SystemAlert {
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  duration?: number
}

export const useAppStore = defineStore('app', () => {
  // 状态
  const sidebarCollapsed = ref(false)
  const systemAlert = ref<SystemAlert | null>(null)
  const loading = ref(false)
  const theme = ref<'light' | 'dark'>('light')
  const language = ref('zh-CN')
  const appConfig = ref({
    title: 'YYC³餐饮管理后台',
    version: '1.0.0',
    logo: '/assets/logo.svg',
    favicon: '/assets/favicon.ico'
  })

  // 方法
  const setSidebarCollapsed = (collapsed: boolean) => {
    sidebarCollapsed.value = collapsed
    localStorage.setItem('sidebar-collapsed', collapsed.toString())
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed.value)
  }

  const setSystemAlert = (alert: SystemAlert) => {
    systemAlert.value = alert
  }

  const clearSystemAlert = () => {
    systemAlert.value = null
  }

  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }

  const setTheme = (themeMode: 'light' | 'dark') => {
    theme.value = themeMode
    localStorage.setItem('theme', themeMode)

    // 应用主题到document
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const setLanguage = (lang: string) => {
    language.value = lang
    localStorage.setItem('language', lang)
  }

  const loadAppConfig = async () => {
    try {
      // 模拟API调用
      // const config = await appApi.getConfig()

      // 使用默认配置
      console.log('App config loaded')
    } catch (error) {
      console.error('Failed to load app config:', error)
    }
  }

  // 初始化应用配置
  const initializeApp = () => {
    // 从本地存储恢复设置
    const savedSidebarCollapsed = localStorage.getItem('sidebar-collapsed')
    if (savedSidebarCollapsed !== null) {
      sidebarCollapsed.value = savedSidebarCollapsed === 'true'
    }

    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
    }

    const savedLanguage = localStorage.getItem('language')
    if (savedLanguage) {
      language.value = savedLanguage
    }
  }

  return {
    // 状态
    sidebarCollapsed,
    systemAlert,
    loading,
    theme,
    language,
    appConfig,

    // 方法
    setSidebarCollapsed,
    toggleSidebar,
    setSystemAlert,
    clearSystemAlert,
    setLoading,
    setTheme,
    setLanguage,
    loadAppConfig,
    initializeApp
  }
})