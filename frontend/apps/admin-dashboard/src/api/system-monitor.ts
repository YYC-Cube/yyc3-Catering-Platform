/**
 * YYC³餐饮行业智能化平台 - 系统监控API
 */

export interface SystemMetric {
  id: string
  name: string
  value: number
  unit: string
  threshold: {
    warning: number
    critical: number
  }
  status: 'normal' | 'warning' | 'critical'
  timestamp: string
  category: 'cpu' | 'memory' | 'disk' | 'network' | 'database' | 'application'
  trend: 'up' | 'down' | 'stable'
  history: Array<{
    timestamp: string
    value: number
  }>
}

export interface SystemAlert {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'acknowledged' | 'resolved'
  category: 'system' | 'performance' | 'security' | 'application'
  source: string
  timestamp: string
  acknowledgedAt?: string
  resolvedAt?: string
  acknowledgedBy?: string
  resolvedBy?: string
  metadata?: Record<string, any>
}

export interface SystemLog {
  id: string
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  message: string
  category: string
  source: string
  timestamp: string
  metadata?: Record<string, any>
  userId?: string
  sessionId?: string
  requestId?: string
  ip?: string
  userAgent?: string
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  score: number
  checks: Array<{
    name: string
    status: 'pass' | 'warn' | 'fail'
    message?: string
    duration: number
    timestamp: string
  }>
  uptime: number
  version: string
  environment: string
  timestamp: string
}

export interface PerformanceReport {
  id: string
  title: string
  period: {
    start: string
    end: string
  }
  metrics: {
    responseTime: {
      avg: number
      min: number
      max: number
      p50: number
      p95: number
      p99: number
    }
    throughput: {
      requests: number
      errors: number
      errorRate: number
    }
    resources: {
      cpu: number
      memory: number
      disk: number
      network: number
    }
  }
  endpoints: Array<{
    path: string
    method: string
    requests: number
    avgResponseTime: number
    errorRate: number
  }>
  errors: Array<{
    type: string
    count: number
    message: string
  }>
  generatedAt: string
}

export interface SystemStatus {
  overview: {
    status: 'operational' | 'degraded' | 'down'
    uptime: number
    responseTime: number
    activeUsers: number
    totalRequests: number
    errorRate: number
  }
  services: Array<{
    name: string
    status: 'running' | 'stopped' | 'error'
    cpu: number
    memory: number
    uptime: number
    lastCheck: string
  }>
  databases: Array<{
    name: string
    status: 'connected' | 'disconnected' | 'error'
    connections: number
    maxConnections: number
    responseTime: number
  }>
  external: Array<{
    name: string
    status: 'available' | 'unavailable' | 'degraded'
    responseTime: number
    lastCheck: string
  }>
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum MetricCategory {
  CPU = 'cpu',
  MEMORY = 'memory',
  DISK = 'disk',
  NETWORK = 'network',
  DATABASE = 'database',
  APPLICATION = 'application'
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

/**
 * 系统监控API类
 */
export class SystemMonitorAPI {
  private baseURL: string
  private wsConnection: WebSocket | null = null

  constructor(baseURL: string = '/api/v1/system') {
    this.baseURL = baseURL
  }

  /**
   * 获取系统指标
   */
  async getSystemMetrics(params?: {
    categories?: MetricCategory[]
    timeRange?: string
    limit?: number
  }): Promise<{ success: boolean; data: SystemMetric[] }> {
    try {
      const queryParams = new URLSearchParams()
      if (params?.categories) {
        queryParams.append('categories', params.categories.join(','))
      }
      if (params?.timeRange) {
        queryParams.append('timeRange', params.timeRange)
      }
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString())
      }

      const response = await fetch(
        `${this.baseURL}/metrics?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Get system metrics failed:', error)
      throw error
    }
  }

  /**
   * 获取系统告警
   */
  async getSystemAlerts(params?: {
    page?: number
    limit?: number
    severity?: AlertSeverity[]
    status?: string[]
    category?: string[]
    search?: string
  }): Promise<{ success: boolean; data: { items: SystemAlert[]; pagination: any } }> {
    try {
      const queryParams = new URLSearchParams()
      if (params?.page) {
        queryParams.append('page', params.page.toString())
      }
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString())
      }
      if (params?.severity) {
        queryParams.append('severity', params.severity.join(','))
      }
      if (params?.status) {
        queryParams.append('status', params.status.join(','))
      }
      if (params?.category) {
        queryParams.append('category', params.category.join(','))
      }
      if (params?.search) {
        queryParams.append('search', params.search)
      }

      const response = await fetch(
        `${this.baseURL}/alerts?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Get system alerts failed:', error)
      throw error
    }
  }

  /**
   * 获取系统日志
   */
  async getSystemLogs(params?: {
    page?: number
    limit?: number
    level?: LogLevel[]
    category?: string[]
    source?: string[]
    search?: string
    startTime?: string
    endTime?: string
  }): Promise<{ success: boolean; data: { items: SystemLog[]; pagination: any } }> {
    try {
      const queryParams = new URLSearchParams()
      if (params?.page) {
        queryParams.append('page', params.page.toString())
      }
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString())
      }
      if (params?.level) {
        queryParams.append('level', params.level.join(','))
      }
      if (params?.category) {
        queryParams.append('category', params.category.join(','))
      }
      if (params?.source) {
        queryParams.append('source', params.source.join(','))
      }
      if (params?.search) {
        queryParams.append('search', params.search)
      }
      if (params?.startTime) {
        queryParams.append('startTime', params.startTime)
      }
      if (params?.endTime) {
        queryParams.append('endTime', params.endTime)
      }

      const response = await fetch(
        `${this.baseURL}/logs?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Get system logs failed:', error)
      throw error
    }
  }

  /**
   * 获取系统健康状态
   */
  async getSystemHealth(): Promise<{ success: boolean; data: SystemHealth }> {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Get system health failed:', error)
      throw error
    }
  }

  /**
   * 获取性能报告
   */
  async getPerformanceReport(params?: {
    period?: string
    startTime?: string
    endTime?: string
    format?: 'json' | 'csv' | 'pdf'
  }): Promise<{ success: boolean; data: PerformanceReport }> {
    try {
      const queryParams = new URLSearchParams()
      if (params?.period) {
        queryParams.append('period', params.period)
      }
      if (params?.startTime) {
        queryParams.append('startTime', params.startTime)
      }
      if (params?.endTime) {
        queryParams.append('endTime', params.endTime)
      }
      if (params?.format) {
        queryParams.append('format', params.format)
      }

      const response = await fetch(
        `${this.baseURL}/performance/report?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Get performance report failed:', error)
      throw error
    }
  }

  /**
   * 获取系统状态
   */
  async getSystemStatus(): Promise<{ success: boolean; data: SystemStatus }> {
    try {
      const response = await fetch(`${this.baseURL}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Get system status failed:', error)
      throw error
    }
  }

  /**
   * 确认告警
   */
  async acknowledgeAlert(alertId: string, note?: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${this.baseURL}/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Acknowledge alert failed:', error)
      throw error
    }
  }

  /**
   * 解决告警
   */
  async resolveAlert(alertId: string, note?: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${this.baseURL}/alerts/${alertId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Resolve alert failed:', error)
      throw error
    }
  }

  /**
   * 创建告警规则
   */
  async createAlertRule(rule: {
    name: string
    description: string
    metric: string
    condition: string
    threshold: number
    severity: AlertSeverity
    enabled: boolean
    notifications?: string[]
  }): Promise<{ success: boolean; data: any }> {
    try {
      const response = await fetch(`${this.baseURL}/alerts/rules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rule),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Create alert rule failed:', error)
      throw error
    }
  }

  /**
   * 导出日志
   */
  async exportLogs(params: {
    startTime: string
    endTime: string
    level?: LogLevel[]
    format: 'json' | 'csv' | 'txt'
  }): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('startTime', params.startTime)
      queryParams.append('endTime', params.endTime)
      queryParams.append('format', params.format)
      if (params.level) {
        queryParams.append('level', params.level.join(','))
      }

      const response = await fetch(
        `${this.baseURL}/logs/export?${queryParams.toString()}`,
        {
          method: 'GET',
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.blob()
    } catch (error) {
      console.error('Export logs failed:', error)
      throw error
    }
  }

  /**
   * 建立WebSocket连接用于实时监控
   */
  connectWebSocket(): WebSocket {
    if (this.wsConnection) {
      this.wsConnection.close()
    }

    const wsURL = this.baseURL.replace('http', 'ws') + '/ws'
    this.wsConnection = new WebSocket(wsURL)

    return this.wsConnection
  }

  /**
   * 断开WebSocket连接
   */
  disconnectWebSocket(): void {
    if (this.wsConnection) {
      this.wsConnection.close()
      this.wsConnection = null
    }
  }

  /**
   * 获取WebSocket连接
   */
  getWebSocket(): WebSocket | null {
    return this.wsConnection
  }
}

// 创建API实例
export const systemMonitorAPI = new SystemMonitorAPI()

// 类型和枚举已在定义时导出