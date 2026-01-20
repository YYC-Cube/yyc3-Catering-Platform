/**
 * @file 导航状态管理工具
 * @description 提供导航加载状态、错误处理和重试机制
 * @module navigationState
 * @author YYC³
 * @version 1.0.0
 * @created 2024-01-19
 */

import { ref, reactive } from 'vue'

export interface NavigationState {
  isLoading: boolean
  error: string | null
  currentPath: string
  retryCount: number
}

export interface NavigationError {
  message: string
  code?: string
  path?: string
  timestamp: number
}

const MAX_RETRY_COUNT = 3

const navigationState = reactive<NavigationState>({
  isLoading: false,
  error: null,
  currentPath: '',
  retryCount: 0
})

const errorHistory: NavigationError[] = []

export function useNavigationState() {
  const startNavigation = (path: string) => {
    navigationState.isLoading = true
    navigationState.error = null
    navigationState.currentPath = path
  }

  const completeNavigation = () => {
    navigationState.isLoading = false
    navigationState.retryCount = 0
  }

  const failNavigation = (error: Error | string, path?: string) => {
    const errorMessage = typeof error === 'string' ? error : error.message
    navigationState.isLoading = false
    navigationState.error = errorMessage
    
    const navError: NavigationError = {
      message: errorMessage,
      path,
      timestamp: Date.now()
    }
    
    errorHistory.push(navError)
    
    if (errorHistory.length > 10) {
      errorHistory.shift()
    }
    
    return navError
  }

  const retryNavigation = async (navigationFn: () => Promise<void>) => {
    if (navigationState.retryCount >= MAX_RETRY_COUNT) {
      throw new Error(`导航重试次数已达上限 (${MAX_RETRY_COUNT}次)`)
    }
    
    navigationState.retryCount++
    return await navigationFn()
  }

  const clearError = () => {
    navigationState.error = null
  }

  const getRecentErrors = (limit = 5) => {
    return errorHistory.slice(-limit)
  }

  const isNavigating = () => {
    return navigationState.isLoading
  }

  const hasError = () => {
    return navigationState.error !== null
  }

  const getCurrentPath = () => {
    return navigationState.currentPath
  }

  return {
    state: navigationState,
    startNavigation,
    completeNavigation,
    failNavigation,
    retryNavigation,
    clearError,
    getRecentErrors,
    isNavigating,
    hasError,
    getCurrentPath
  }
}

export default useNavigationState
