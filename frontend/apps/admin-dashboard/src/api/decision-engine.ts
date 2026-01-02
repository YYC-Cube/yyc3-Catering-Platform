import type { AxiosResponse } from 'axios'

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// 基于fetch的HTTP客户端实现
class HttpClient {
  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const fullUrl = this.buildUrl(url, params)
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: this.getHeaders()
    })
    return this.handleResponse(response)
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    })
    return this.handleResponse(response)
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    })
    return this.handleResponse(response)
  }

  async delete<T>(url: string, params?: Record<string, any>): Promise<T> {
    const fullUrl = this.buildUrl(url, params)
    const response = await fetch(fullUrl, {
      method: 'DELETE',
      headers: this.getHeaders()
    })
    return this.handleResponse(response)
  }

  private buildUrl(url: string, params?: Record<string, any>): string {
    const fullUrl = `${API_BASE_URL}${url}`
    if (!params) return fullUrl

    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    }
    return `${fullUrl}?${searchParams.toString()}`
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // 添加认证token
    const token = this.getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  private getToken(): string | null {
    return localStorage.getItem('token') || null
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    return response.json() as Promise<T>
  }
}

// 创建HttpClient实例
const httpClient = new HttpClient()

// 决策类型
export enum DecisionType {
  STRATEGIC = 'strategic',     // 战略决策
  TACTICAL = 'tactical',       // 战术决策
  OPERATIONAL = 'operational', // 操作决策
  EMERGENCY = 'emergency'      // 应急决策
}

// 决策层级
export enum DecisionLevel {
  EXECUTIVE = 'executive',     // 高层决策
  MANAGEMENT = 'management',   // 管理决策
  SUPERVISOR = 'supervisor',   // 主管决策
  STAFF = 'staff'             // 员工决策
}

// 决策状态
export enum DecisionStatus {
  PENDING = 'pending',         // 待处理
  ANALYZING = 'analyzing',     // 分析中
  RECOMMENDATION = 'recommendation', // 建议阶段
  APPROVED = 'approved',       // 已批准
  REJECTED = 'rejected',       // 已拒绝
  IMPLEMENTED = 'implemented', // 已实施
  COMPLETED = 'completed',     // 已完成
  FAILED = 'failed'           // 失败
}

// 决策优先级
export enum DecisionPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  URGENT = 'urgent'
}

// 决策参与者类型
export enum ParticipantType {
  HUMAN_EXPERT = 'human_expert',   // 人类专家
  AI_AGENT = 'ai_agent',           // AI智能体
  COLLECTIVE = 'collective',       // 集体智慧
  AUTOMATED = 'automated',         // 自动决策
  HYBRID = 'hybrid'               // 人机协同
}

// 决策因素
export interface DecisionFactor {
  id: string
  name: string
  type: 'quantitative' | 'qualitative'
  value: number | string
  weight: number
  source: 'data' | 'expert' | 'prediction' | 'historical'
  confidence: number
  impact: 'positive' | 'negative' | 'neutral'
  category: 'financial' | 'operational' | 'customer' | 'market' | 'risk'
}

// 决策选项
export interface DecisionOption {
  id: string
  title: string
  description: string
  pros: string[]
  cons: string[]
  estimatedOutcomes: Array<{
    metric: string
    value: number
    unit: string
    probability: number
  }>
  risks: Array<{
    type: 'financial' | 'operational' | 'reputational' | 'technical'
    level: 'low' | 'medium' | 'high'
    probability: number
    impact: string
    mitigation: string
  }>
  resources: {
    time: number
    cost: number
    personnel: string[]
    equipment: string[]
  }
  feasibility: {
    technical: number
    financial: number
    operational: number
  }
}

// 决策请求
export interface DecisionRequest {
  id: string
  title: string
  description: string
  type: DecisionType
  level: DecisionLevel
  priority: DecisionPriority
  context: {
    situation: string
    background: string
    constraints: string[]
    objectives: string[]
    stakeholders: string[]
  }
  factors: DecisionFactor[]
  options: DecisionOption[]
  requestedBy: string
  requestedAt: string
  deadline?: string
  requiredParticipants: ParticipantType[]
  collaborationMode: 'sequential' | 'parallel' | 'consensus' | 'majority'
}

// 决策分析结果
export interface DecisionAnalysis {
  id: string
  requestId: string
  participant: {
    type: ParticipantType
    id: string
    name: string
    role: string
  }
  analysis: {
    recommendedOption: string
    confidence: number
    reasoning: string
    supportingEvidence: Array<{
      factor: string
      evidence: string
      strength: number
    }>
    concerns: Array<{
      issue: string
      severity: 'low' | 'medium' | 'high'
      recommendation: string
    }>
  }
  alternativeOptions: Array<{
    optionId: string
    score: number
    rationale: string
  }>
  createdAt: string
}

// 协同决策结果
export interface CollaborativeDecision {
  id: string
  requestId: string
  finalDecision: {
    selectedOption: string
    confidence: number
    consensus: number
    votingResults: Array<{
      participantId: string
      optionId: string
      vote: number
      comment: string
    }>
    rationale: string
  }
  implementation: {
    plan: Array<{
      step: number
      action: string
      responsible: string
      deadline: string
      dependencies: string[]
    }>
    timeline: string
    successMetrics: string[]
    riskMitigation: string[]
  }
  collaboration: {
    participants: Array<{
      type: ParticipantType
      id: string
      contribution: string
      satisfaction: number
    }>
    process: string
    conflicts: Array<{
      issue: string
      participants: string[]
      resolution: string
    }>
  }
  status: DecisionStatus
  createdBy: string
  createdAt: string
  updatedAt: string
}

// 决策执行监控
export interface DecisionExecution {
  id: string
  decisionId: string
  status: 'planned' | 'in_progress' | 'completed' | 'failed' | 'paused'
  progress: {
    completed: number
    total: number
    percentage: number
  }
  metrics: {
    expected: Array<{
      metric: string
      target: number
      unit: string
      deadline: string
    }>
    actual: Array<{
      metric: string
      value: number
      unit: string
      timestamp: string
    }>
    variance: Array<{
      metric: string
      difference: number
      percentage: number
      status: 'on_track' | 'ahead' | 'behind'
    }>
  }
  issues: Array<{
    type: 'delay' | 'budget' | 'quality' | 'resource'
    severity: 'low' | 'medium' | 'high'
    description: string
    impact: string
    resolution: string
    status: 'open' | 'resolved'
  }>
  nextSteps: Array<{
    action: string
    responsible: string
      deadline: string
      status: 'pending' | 'in_progress' | 'completed'
  }>
  lastUpdated: string
}

// 智能决策引擎API
class DecisionEngineAPI {
  /**
   * 创建决策请求
   */
  async createDecisionRequest(request: Partial<DecisionRequest>): Promise<{
    success: boolean
    data?: DecisionRequest
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/decision-engine/requests', request)
      return response.data
    } catch (error) {
      console.error('Create decision request failed:', error)
      throw error
    }
  }

  /**
   * 获取决策请求列表
   */
  async getDecisionRequests(params?: {
    type?: DecisionType
    level?: DecisionLevel
    status?: DecisionStatus
    priority?: DecisionPriority
    requestedBy?: string
    dateRange?: [string, string]
    limit?: number
    offset?: number
  }): Promise<{
    success: boolean
    data?: {
      requests: DecisionRequest[]
      total: number
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/decision-engine/requests', {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get decision requests failed:', error)
      throw error
    }
  }

  /**
   * 获取决策请求详情
   */
  async getDecisionRequest(requestId: string): Promise<{
    success: boolean
    data?: DecisionRequest
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get(`/decision-engine/requests/${requestId}`)
      return response.data
    } catch (error) {
      console.error('Get decision request failed:', error)
      throw error
    }
  }

  /**
   * 提交决策分析
   */
  async submitAnalysis(requestId: string, analysis: Partial<DecisionAnalysis>): Promise<{
    success: boolean
    data?: DecisionAnalysis
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post(
        `/decision-engine/requests/${requestId}/analysis`,
        analysis
      )
      return response.data
    } catch (error) {
      console.error('Submit analysis failed:', error)
      throw error
    }
  }

  /**
   * 获取决策分析结果
   */
  async getDecisionAnalyses(requestId: string): Promise<{
    success: boolean
    data?: DecisionAnalysis[]
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get(
        `/decision-engine/requests/${requestId}/analyses`
      )
      return response.data
    } catch (error) {
      console.error('Get decision analyses failed:', error)
      throw error
    }
  }

  /**
   * 创建协同决策
   */
  async createCollaborativeDecision(requestId: string, decision: Partial<CollaborativeDecision>): Promise<{
    success: boolean
    data?: CollaborativeDecision
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post(
        `/decision-engine/requests/${requestId}/collaborative`,
        decision
      )
      return response.data
    } catch (error) {
      console.error('Create collaborative decision failed:', error)
      throw error
    }
  }

  /**
   * 获取协同决策
   */
  async getCollaborativeDecision(decisionId: string): Promise<{
    success: boolean
    data?: CollaborativeDecision
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get(
        `/decision-engine/decisions/${decisionId}`
      )
      return response.data
    } catch (error) {
      console.error('Get collaborative decision failed:', error)
      throw error
    }
  }

  /**
   * 更新决策状态
   */
  async updateDecisionStatus(decisionId: string, status: DecisionStatus, comment?: string): Promise<{
    success: boolean
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.put(
        `/decision-engine/decisions/${decisionId}/status`,
        { status, comment }
      )
      return response.data
    } catch (error) {
      console.error('Update decision status failed:', error)
      throw error
    }
  }

  /**
   * 开始决策执行
   */
  async startExecution(decisionId: string): Promise<{
    success: boolean
    data?: DecisionExecution
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post(
        `/decision-engine/decisions/${decisionId}/execution`
      )
      return response.data
    } catch (error) {
      console.error('Start execution failed:', error)
      throw error
    }
  }

  /**
   * 获取决策执行状态
   */
  async getExecutionStatus(decisionId: string): Promise<{
    success: boolean
    data?: DecisionExecution
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get(
        `/decision-engine/decisions/${decisionId}/execution`
      )
      return response.data
    } catch (error) {
      console.error('Get execution status failed:', error)
      throw error
    }
  }

  /**
   * 更新执行进度
   */
  async updateExecutionProgress(decisionId: string, updates: {
    completed?: number
    metrics?: Array<{
      metric: string
      value: number
      unit: string
    }>
    issues?: Array<{
      type: string
      severity: string
      description: string
      impact: string
    }>
    nextSteps?: Array<{
      action: string
      responsible: string
      deadline: string
      status: string
    }>
  }): Promise<{
    success: boolean
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.put(
        `/decision-engine/decisions/${decisionId}/execution`,
        updates
      )
      return response.data
    } catch (error) {
      console.error('Update execution progress failed:', error)
      throw error
    }
  }

  /**
   * AI智能分析
   */
  async getAIAnalysis(requestId: string): Promise<{
    success: boolean
    data?: {
      recommendation: {
        optionId: string
        confidence: number
        reasoning: string
      }
      riskAssessment: Array<{
        type: string
        probability: number
        impact: string
        mitigation: string
      }>
      scenarioAnalysis: Array<{
        scenario: string
        probability: number
        outcomes: Array<{
          metric: string
          value: number
          unit: string
        }>
      }>
      confidence: number
      modelUsed: string
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get(
        `/decision-engine/requests/${requestId}/ai-analysis`
      )
      return response.data
    } catch (error) {
      console.error('Get AI analysis failed:', error)
      throw error
    }
  }

  /**
   * 获取决策模板
   */
  async getDecisionTemplates(params?: {
    type?: DecisionType
    level?: DecisionLevel
    category?: string
  }): Promise<{
    success: boolean
    data?: Array<{
      id: string
      name: string
      type: DecisionType
      level: DecisionLevel
      description: string
      factors: DecisionFactor[]
      options: DecisionOption[]
      process: string[]
      bestPractices: string[]
    }>
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/decision-engine/templates', {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get decision templates failed:', error)
      throw error
    }
  }

  /**
   * 获取决策洞察
   */
  async getDecisionInsights(params?: {
    type?: DecisionType
    level?: DecisionLevel
    period?: string
    limit?: number
  }): Promise<{
    success: boolean
    data?: Array<{
      id: string
      type: string
      title: string
      insight: string
      impact: string
      actionItems: string[]
      relatedDecisions: string[]
      confidence: number
      createdAt: string
    }>
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/decision-engine/insights', {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get decision insights failed:', error)
      throw error
    }
  }

  /**
   * 获取决策统计
   */
  async getDecisionStats(period?: 'day' | 'week' | 'month' | 'quarter' | 'year'): Promise<{
    success: boolean
    data?: {
      totalDecisions: number
      byType: Record<DecisionType, number>
      byLevel: Record<DecisionLevel, number>
      byStatus: Record<DecisionStatus, number>
      averageDecisionTime: number
      successRate: number
      participantEngagement: number
      topDecisionFactors: Array<{
        factor: string
        frequency: number
        impact: number
      }>
      trends: Array<{
        period: string
        decisions: number
        successRate: number
        averageTime: number
      }>
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/decision-engine/stats', {
        params: { period }
      })
      return response.data
    } catch (error) {
      console.error('Get decision stats failed:', error)
      throw error
    }
  }
}

export const decisionEngineAPI = new DecisionEngineAPI()
export default decisionEngineAPI