import type { AxiosResponse } from 'axios'

// API 基础URL配置
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:3006/api/v1'

// HTTP 请求工具函数
class HttpClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    })
  }
}

// 创建HTTP客户端实例
const httpClient = new HttpClient(API_BASE_URL)

// 智能体类型
export enum AgentType {
  HUMAN = 'human',         // 人类智能体
  AI = 'ai',               // AI智能体
  ROBOT = 'robot',         // 机器人智能体
  ENVIRONMENT = 'environment', // 环境智能体
  VIRTUAL = 'virtual'      // 虚拟智能体
}

// 智能体状态
export enum AgentStatus {
  ACTIVE = 'active',       // 活跃
  IDLE = 'idle',          // 空闲
  BUSY = 'busy',          // 忙碌
  OFFLINE = 'offline',    // 离线
  ERROR = 'error'        // 错误
}

// 任务状态
export enum TaskStatus {
  PENDING = 'pending',     // 待分配
  ASSIGNED = 'assigned',   // 已分配
  IN_PROGRESS = 'in_progress', // 进行中
  COMPLETED = 'completed', // 已完成
  FAILED = 'failed',      // 失败
  CANCELLED = 'cancelled' // 已取消
}

// 任务优先级
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

// 通信协议
export enum CommunicationProtocol {
  HTTP = 'http',
  WEBSOCKET = 'websocket',
  MQTT = 'mqtt',
  AMQP = 'amqp',
  GRPC = 'grpc'
}

// 智能体信息
export interface Agent {
  id: string
  name: string
  type: AgentType
  status: AgentStatus
  capabilities: string[]
  specializations: string[]
  currentLoad: number
  maxLoad: number
  location?: {
    x: number
    y: number
    zone: string
  }
  endpoints: Array<{
    type: CommunicationProtocol
    address: string
    status: 'connected' | 'disconnected'
  }>
  metadata: Record<string, any>
  performance: {
    tasksCompleted: number
    successRate: number
    averageResponseTime: number
    reliability: number
  }
  lastSeen: string
  createdAt: string
  updatedAt: string
}

// 协作任务
export interface CollaborationTask {
  id: string
  title: string
  description: string
  type: string
  priority: TaskPriority
  status: TaskStatus
  requiredSkills: string[]
  estimatedDuration: number
  actualDuration?: number
  deadline?: string
  assignedAgents: string[]
  primaryAgent?: string
  subtasks: Array<{
    id: string
    title: string
    assignedAgent?: string
    status: TaskStatus
    progress: number
  }>
  dependencies: string[]
  context: {
    data: Record<string, any>
    environment: string
    constraints: string[]
    objectives: string[]
  }
  collaboration: {
    mode: 'sequential' | 'parallel' | 'hierarchical'
    coordination: 'centralized' | 'decentralized'
    communication: 'synchronous' | 'asynchronous'
  }
  progress: {
    completed: number
    total: number
    percentage: number
  }
  results: {
    outcome?: string
    deliverables: Array<{
      type: string
      content: any
      metadata: Record<string, any>
    }>
    metrics: Record<string, number>
  }
  createdAt: string
  updatedAt: string
}

// 智能体集群
export interface AgentCluster {
  id: string
  name: string
  type: 'homogeneous' | 'heterogeneous'
  agents: string[]
  leader?: string
  configuration: {
    coordination: 'centralized' | 'decentralized' | 'hybrid'
    communication: string
    loadBalancing: 'round_robin' | 'least_loaded' | 'capability_based'
    failover: boolean
  }
  capabilities: {
    combined: string[]
    redundancy: Record<string, number>
    performance: {
      throughput: number
      latency: number
      availability: number
    }
  }
  status: 'active' | 'inactive' | 'degraded'
  statistics: {
    tasksCompleted: number
    activeTasks: number
    averageLoad: number
    efficiency: number
  }
  createdAt: string
  updatedAt: string
}

// 通信消息
export interface AgentMessage {
  id: string
  from: string
  to: string[]
  type: 'command' | 'data' | 'query' | 'response' | 'notification' | 'coordination'
  priority: TaskPriority
  content: {
    action?: string
    data?: any
    query?: string
    response?: any
    notification?: string
    coordination?: {
      task: string
      step: string
      status: string
    }
  }
  protocol: CommunicationProtocol
  timestamp: string
  expiresAt?: string
  status: 'pending' | 'delivered' | 'processed' | 'failed'
  retryCount: number
  metadata: Record<string, any>
}

// 性能监控
export interface AgentPerformance {
  agentId: string
  timestamp: string
  metrics: {
    cpu: number
    memory: number
    network: number
    disk: number
    responseTime: number
    throughput: number
    errorRate: number
  }
  tasks: {
    total: number
    completed: number
    failed: number
    inProgress: number
  }
  health: {
    status: 'healthy' | 'warning' | 'critical'
    score: number
    issues: Array<{
      type: string
      severity: 'low' | 'medium' | 'high'
      description: string
      timestamp: string
    }>
  }
}

// 协作会话
export interface CollaborationSession {
  id: string
  title: string
  participants: string[]
  initiator: string
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  type: 'task_coordination' | 'problem_solving' | 'information_sharing' | 'decision_making'
  context: {
    objective: string
    scope: string
    constraints: string[]
  }
  messages: AgentMessage[]
  outcomes: {
    decisions: Array<{
      id: string
      content: string
      consensus: number
      participants: string[]
    }>
    solutions: Array<{
      id: string
      description: string
      implementer: string
      status: string
    }>
    knowledge: Array<{
      topic: string
      content: any
      contributor: string
    }>
  }
  metrics: {
    duration: number
    messagesExchanged: number
    participantsEngaged: number
    effectiveness: number
    satisfaction: number
  }
  startedAt: string
  endedAt?: string
}

// 多智能体协作系统API
class MultiAgentAPI {
  /**
   * 获取所有智能体
   */
  async getAgents(params?: {
    type?: AgentType
    status?: AgentStatus
    capability?: string
    location?: string
    limit?: number
    offset?: number
  }): Promise<{
    success: boolean
    data?: {
      agents: Agent[]
      total: number
    }
    message?: string
  }> {
    try {
      const searchParams = new URLSearchParams()
      if (params?.type) searchParams.append('type', params.type)
      if (params?.status) searchParams.append('status', params.status)
      if (params?.capability) searchParams.append('capability', params.capability)
      if (params?.location) searchParams.append('location', params.location)
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      if (params?.offset) searchParams.append('offset', params.offset.toString())
      
      const endpoint = `/multi-agent/agents${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
      return await httpClient.get(endpoint)
    } catch (error) {
      console.error('Get agents failed:', error)
      throw error
    }
  }

  /**
   * 获取智能体详情
   */
  async getAgent(agentId: string): Promise<{
    success: boolean
    data?: Agent
    message?: string
  }> {
    try {
      return await httpClient.get(`/multi-agent/agents/${agentId}`)
    } catch (error) {
      console.error('Get agent failed:', error)
      throw error
    }
  }

  /**
   * 注册智能体
   */
  async registerAgent(agent: Partial<Agent>): Promise<{
    success: boolean
    data?: Agent
    message?: string
  }> {
    try {
      return await httpClient.post('/multi-agent/agents', agent)
    } catch (error) {
      console.error('Register agent failed:', error)
      throw error
    }
  }

  /**
   * 更新智能体信息
   */
  async updateAgent(agentId: string, updates: Partial<Agent>): Promise<{
    success: boolean
    data?: Agent
    message?: string
  }> {
    try {
      return await httpClient.put(`/multi-agent/agents/${agentId}`, updates)
    } catch (error) {
      console.error('Update agent failed:', error)
      throw error
    }
  }

  /**
   * 注销智能体
   */
  async unregisterAgent(agentId: string): Promise<{
    success: boolean
    message?: string
  }> {
    try {
      return await httpClient.delete(`/multi-agent/agents/${agentId}`)
    } catch (error) {
      console.error('Unregister agent failed:', error)
      throw error
    }
  }

  /**
   * 创建协作任务
   */
  async createTask(task: Partial<CollaborationTask>): Promise<{
    success: boolean
    data?: CollaborationTask
    message?: string
  }> {
    try {
      return await httpClient.post('/multi-agent/tasks', task)
    } catch (error) {
      console.error('Create task failed:', error)
      throw error
    }
  }

  /**
   * 获取任务列表
   */
  async getTasks(params?: {
    status?: TaskStatus
    priority?: TaskPriority
    assignedAgent?: string
    dateRange?: [string, string]
    limit?: number
    offset?: number
  }): Promise<{
    success: boolean
    data?: {
      tasks: CollaborationTask[]
      total: number
    }
    message?: string
  }> {
    try {
      const searchParams = new URLSearchParams()
      if (params?.status) searchParams.append('status', params.status)
      if (params?.priority) searchParams.append('priority', params.priority)
      if (params?.assignedAgent) searchParams.append('assignedAgent', params.assignedAgent)
      if (params?.dateRange) {
        searchParams.append('dateRange[0]', params.dateRange[0])
        searchParams.append('dateRange[1]', params.dateRange[1])
      }
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      if (params?.offset) searchParams.append('offset', params.offset.toString())
      
      const endpoint = `/multi-agent/tasks${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
      return await httpClient.get(endpoint)
    } catch (error) {
      console.error('Get tasks failed:', error)
      throw error
    }
  }

  /**
   * 获取任务详情
   */
  async getTask(taskId: string): Promise<{
    success: boolean
    data?: CollaborationTask
    message?: string
  }> {
    try {
      return await httpClient.get(`/multi-agent/tasks/${taskId}`)
    } catch (error) {
      console.error('Get task failed:', error)
      throw error
    }
  }

  /**
   * 分配任务给智能体
   */
  async assignTask(taskId: string, agentIds: string[]): Promise<{
    success: boolean
    message?: string
  }> {
    try {
      return await httpClient.post(`/multi-agent/tasks/${taskId}/assign`, {
        agentIds
      })
    } catch (error) {
      console.error('Assign task failed:', error)
      throw error
    }
  }

  /**
   * 更新任务状态
   */
  async updateTaskStatus(taskId: string, status: TaskStatus, progress?: number, result?: any): Promise<{
    success: boolean
    message?: string
  }> {
    try {
      return await httpClient.put(`/multi-agent/tasks/${taskId}/status`, {
        status,
        progress,
        result
      })
    } catch (error) {
      console.error('Update task status failed:', error)
      throw error
    }
  }

  /**
   * 创建智能体集群
   */
  async createCluster(cluster: Partial<AgentCluster>): Promise<{
    success: boolean
    data?: AgentCluster
    message?: string
  }> {
    try {
      return await httpClient.post('/multi-agent/clusters', cluster)
    } catch (error) {
      console.error('Create cluster failed:', error)
      throw error
    }
  }

  /**
   * 获取集群列表
   */
  async getClusters(params?: {
    type?: string
    status?: string
    limit?: number
    offset?: number
  }): Promise<{
    success: boolean
    data?: {
      clusters: AgentCluster[]
      total: number
    }
    message?: string
  }> {
    try {
      const searchParams = new URLSearchParams()
      if (params?.type) searchParams.append('type', params.type)
      if (params?.status) searchParams.append('status', params.status)
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      if (params?.offset) searchParams.append('offset', params.offset.toString())
      
      const endpoint = `/multi-agent/clusters${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
      return await httpClient.get(endpoint)
    } catch (error) {
      console.error('Get clusters failed:', error)
      throw error
    }
  }

  /**
   * 发送消息到智能体
   */
  async sendMessage(message: Partial<AgentMessage>): Promise<{
    success: boolean
    data?: AgentMessage
    message?: string
  }> {
    try {
      return await httpClient.post('/multi-agent/messages', message)
    } catch (error) {
      console.error('Send message failed:', error)
      throw error
    }
  }

  /**
   * 获取消息历史
   */
  async getMessages(params?: {
    from?: string
    to?: string
    type?: string
    dateRange?: [string, string]
    limit?: number
    offset?: number
  }): Promise<{
    success: boolean
    data?: {
      messages: AgentMessage[]
      total: number
    }
    message?: string
  }> {
    try {
      const searchParams = new URLSearchParams()
      if (params?.from) searchParams.append('from', params.from)
      if (params?.to) searchParams.append('to', params.to)
      if (params?.type) searchParams.append('type', params.type)
      if (params?.dateRange) {
        searchParams.append('dateRange[0]', params.dateRange[0])
        searchParams.append('dateRange[1]', params.dateRange[1])
      }
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      if (params?.offset) searchParams.append('offset', params.offset.toString())
      
      const endpoint = `/multi-agent/messages${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
      return await httpClient.get(endpoint)
    } catch (error) {
      console.error('Get messages failed:', error)
      throw error
    }
  }

  /**
   * 创建协作会话
   */
  async createSession(session: Partial<CollaborationSession>): Promise<{
    success: boolean
    data?: CollaborationSession
    message?: string
  }> {
    try {
      return await httpClient.post('/multi-agent/sessions', session)
    } catch (error) {
      console.error('Create session failed:', error)
      throw error
    }
  }

  /**
   * 获取协作会话
   */
  async getSessions(params?: {
    type?: string
    status?: string
    participant?: string
    limit?: number
    offset?: number
  }): Promise<{
    success: boolean
    data?: {
      sessions: CollaborationSession[]
      total: number
    }
    message?: string
  }> {
    try {
      const searchParams = new URLSearchParams()
      if (params?.type) searchParams.append('type', params.type)
      if (params?.status) searchParams.append('status', params.status)
      if (params?.participant) searchParams.append('participant', params.participant)
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      if (params?.offset) searchParams.append('offset', params.offset.toString())
      
      const endpoint = `/multi-agent/sessions${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
      return await httpClient.get(endpoint)
    } catch (error) {
      console.error('Get sessions failed:', error)
      throw error
    }
  }

  /**
   * 获取智能体性能数据
   */
  async getAgentPerformance(agentId: string, params?: {
    period?: string
    metrics?: string[]
  }): Promise<{
    success: boolean
    data?: AgentPerformance[]
    message?: string
  }> {
    try {
      const searchParams = new URLSearchParams()
      if (params?.period) searchParams.append('period', params.period)
      if (params?.metrics) {
        params.metrics.forEach(metric => searchParams.append('metrics', metric))
      }
      
      const endpoint = `/multi-agent/agents/${agentId}/performance${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
      return await httpClient.get(endpoint)
    } catch (error) {
      console.error('Get agent performance failed:', error)
      throw error
    }
  }

  /**
   * 优化任务分配
   */
  async optimizeTaskAllocation(): Promise<{
    success: boolean
    data?: {
      optimization: Array<{
        taskId: string
        currentAssignment: string[]
        recommendedAssignment: string[]
        improvement: {
          efficiency: number
          reliability: number
          cost: number
        }
      }>
      overall: {
        efficiency: number
        loadBalance: number
        successRate: number
      }
    }
    message?: string
  }> {
    try {
      return await httpClient.post('/multi-agent/optimization/task-allocation')
    } catch (error) {
      console.error('Optimize task allocation failed:', error)
      throw error
    }
  }

  /**
   * 获取协作统计
   */
  async getCollaborationStats(period?: 'hour' | 'day' | 'week' | 'month'): Promise<{
    success: boolean
    data?: {
      totalAgents: number
      activeAgents: number
      totalTasks: number
      completedTasks: number
      activeTasks: number
      averageResponseTime: number
      collaborationEfficiency: number
      crossAgentCollaboration: number
      agentTypes: Record<AgentType, number>
      performanceByType: Record<AgentType, {
        successRate: number
        averageLoad: number
        reliability: number
      }>
      trends: Array<{
        timestamp: string
        activeAgents: number
        completedTasks: number
        efficiency: number
      }>
    }
    message?: string
  }> {
    try {
      const searchParams = new URLSearchParams()
      if (period) searchParams.append('period', period)
      
      const endpoint = `/multi-agent/stats/collaboration${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
      return await httpClient.get(endpoint)
    } catch (error) {
      console.error('Get collaboration stats failed:', error)
      throw error
    }
  }

  /**
   * 获取智能体地图
   */
  async getAgentMap(): Promise<{
    success: boolean
    data?: {
      agents: Array<{
        id: string
        name: string
        type: AgentType
        status: AgentStatus
        location: {
          x: number
          y: number
          zone: string
        }
        connections: Array<{
          to: string
          strength: number
          type: string
        }>
        load: number
        capabilities: string[]
      }>
      clusters: Array<{
        id: string
        name: string
        location: {
          center: { x: number; y: number }
          radius: number
        }
        agents: string[]
      }>
      environment: {
        zones: Array<{
          id: string
          name: string
          bounds: {
            x: number
            y: number
            width: number
            height: number
          }
          type: string
        }>
      }
    }
    message?: string
  }> {
    try {
      return await httpClient.get('/multi-agent/map')
    } catch (error) {
      console.error('Get agent map failed:', error)
      throw error
    }
  }
}

export const multiAgentAPI = new MultiAgentAPI()
export default multiAgentAPI