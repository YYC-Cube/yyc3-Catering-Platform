/**
 * @fileoverview HTTP请求工具
 * @description 封装HTTP请求
 * @module request
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 */

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: any
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  code?: number
}

export const request = async <T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  const { method = 'GET', headers = {}, body } = options

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Request failed:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '请求失败'
    }
  }
}

export default request
