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

// AI助手类型
export enum AssistantType {
  GENERAL = 'general',           // 通用助手
  SPECIALIZED = 'specialized',   // 专业助手
  CONTEXTUAL = 'contextual',     // 上下文助手
  COLLABORATIVE = 'collaborative', // 协作助手
  ANALYTICAL = 'analytical',     // 分析助手
  CREATIVE = 'creative'         // 创意助手
}

// 助手状态
export enum AssistantStatus {
  ACTIVE = 'active',
  IDLE = 'idle',
  BUSY = 'busy',
  TRAINING = 'training',
  OFFLINE = 'offline',
  ERROR = 'error'
}

// 对话类型
export enum ConversationType {
  CHAT = 'chat',                    // 日常对话
  TASK = 'task',                    // 任务导向
  ANALYSIS = 'analysis',            // 分析讨论
  DECISION = 'decision',            // 决策支持
  LEARNING = 'learning',            // 学习辅导
  COLLABORATION = 'collaboration'  // 协作工作
}

// 消息类型
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  FILE = 'file',
  CODE = 'code',
  DIAGRAM = 'diagram',
  TABLE = 'table'
}

// AI能力
export interface AICapability {
  id: string
  name: string
  description: string
  category: 'nlp' | 'cv' | 'analytics' | 'reasoning' | 'creativity' | 'domain'
  proficiency: number // 0-100
  enabled: boolean
  configuration: Record<string, any>
}

// AI助手配置
export interface AIAssistant {
  id: string
  name: string
  type: AssistantType
  status: AssistantStatus
  avatar: string
  personality: {
    tone: 'professional' | 'friendly' | 'casual' | 'formal' | 'enthusiastic'
    responseStyle: 'concise' | 'detailed' | 'structured' | 'conversational'
    language: string
    cultural: string
  }
  capabilities: AICapability[]
  specializations: string[]
  knowledgeDomains: string[]
  preferences: {
    responseLength: 'short' | 'medium' | 'long'
    includeExamples: boolean
    provideSources: boolean
    askClarifications: boolean
    proactiveAssistance: boolean
  }
  performance: {
    accuracy: number
    responseTime: number
    satisfaction: number
    tasksCompleted: number
    errorRate: number
  }
  integrations: {
    connectedSystems: string[]
    apis: string[]
    databases: string[]
    tools: string[]
  }
  learning: {
    adaptationRate: number
    feedbackIncorporated: number
    knowledgeUpdated: string
    modelVersion: string
  }
  createdAt: string
  updatedAt: string
  lastActive: string
}

// 对话消息
export interface ConversationMessage {
  id: string
  conversationId: string
  sender: 'user' | 'assistant' | 'system'
  content: string
  type: MessageType
  metadata: {
    timestamp: string
    confidence?: number
    processingTime?: number
    tokensUsed?: number
    modelUsed?: string
    contextReferences?: string[]
    attachments?: Array<{
      type: string
      url: string
      name: string
      size: number
    }>
  }
  reactions: Array<{
    userId: string
    type: 'like' | 'dislike' | 'helpful' | 'confusing'
    timestamp: string
  }>
  corrections?: Array<{
    originalText: string
    correctedText: string
    reason: string
    timestamp: string
  }>
}

// 对话会话
export interface Conversation {
  id: string
  title: string
  type: ConversationType
  participant: {
    userId: string
    assistantId: string
    userName: string
    assistantName: string
  }
  context: {
    domain: string
    purpose: string
    background: string
    constraints: string[]
    objectives: string[]
  }
  messages: ConversationMessage[]
  status: 'active' | 'paused' | 'completed' | 'archived'
  metrics: {
    messageCount: number
    duration: number
    satisfactionScore?: number
    taskCompletion?: boolean
    resolutionTime?: number
  }
  summary?: {
    keyPoints: string[]
    decisions: string[]
    actionItems: string[]
    followUpRequired: boolean
  }
  createdAt: string
  updatedAt: string
}

// 智能建议
export interface IntelligentSuggestion {
  id: string
  type: 'proactive' | 'reactive' | 'predictive'
  category: 'efficiency' | 'accuracy' | 'learning' | 'collaboration'
  title: string
  description: string
  rationale: string
  confidence: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  actions: Array<{
    type: 'configure' | 'learn' | 'integrate' | 'optimize'
    description: string
    automated: boolean
    estimatedImpact: string
  }>
  expiresAt?: string
  dismissed: boolean
  applied: boolean
  createdAt: string
}

// 协作增强功能
export interface CollaborationEnhancement {
  id: string
  name: string
  type: 'real_time_translation' | 'context_sharing' | 'joint_decision' | 'workflow_automation'
  description: string
  participants: Array<{
    type: 'human' | 'ai' | 'agent'
    id: string
    name: string
    role: string
  }>
  workflow: Array<{
    step: number
    action: string
    responsible: string
    dependencies: string[]
    automated: boolean
  }>
  tools: Array<{
    name: string
    type: string
    configuration: Record<string, any>
  }>
  metrics: {
    efficiency: number
    accuracy: number
    satisfaction: number
    timeReduction: number
  }
  active: boolean
  createdAt: string
}

// AI助手API
class AIAssistantAPI {
  /**
   * 获取所有AI助手
   */
  async getAssistants(params?: {
    type?: AssistantType
    status?: AssistantStatus
    capability?: string
    limit?: number
    offset?: number
  }): Promise<{
    success: boolean
    data?: {
      assistants: AIAssistant[]
      total: number
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/ai-assistant/assistants', {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get assistants failed:', error)
      throw error
    }
  }

  /**
   * 获取助手详情
   */
  async getAssistant(assistantId: string): Promise<{
    success: boolean
    data?: AIAssistant
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get(`/ai-assistant/assistants/${assistantId}`)
      return response.data
    } catch (error) {
      console.error('Get assistant failed:', error)
      throw error
    }
  }

  /**
   * 创建AI助手
   */
  async createAssistant(assistant: Partial<AIAssistant>): Promise<{
    success: boolean
    data?: AIAssistant
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/ai-assistant/assistants', assistant)
      return response.data
    } catch (error) {
      console.error('Create assistant failed:', error)
      throw error
    }
  }

  /**
   * 更新AI助手
   */
  async updateAssistant(assistantId: string, updates: Partial<AIAssistant>): Promise<{
    success: boolean
    data?: AIAssistant
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.put(`/ai-assistant/assistants/${assistantId}`, updates)
      return response.data
    } catch (error) {
      console.error('Update assistant failed:', error)
      throw error
    }
  }

  /**
   * 删除AI助手
   */
  async deleteAssistant(assistantId: string): Promise<{
    success: boolean
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.delete(`/ai-assistant/assistants/${assistantId}`)
      return response.data
    } catch (error) {
      console.error('Delete assistant failed:', error)
      throw error
    }
  }

  /**
   * 开始对话
   */
  async startConversation(conversation: Partial<Conversation>): Promise<{
    success: boolean
    data?: Conversation
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/ai-assistant/conversations', conversation)
      return response.data
    } catch (error) {
      console.error('Start conversation failed:', error)
      throw error
    }
  }

  /**
   * 发送消息
   */
  async sendMessage(conversationId: string, message: {
    content: string
    type: MessageType
    attachments?: any[]
  }): Promise<{
    success: boolean
    data?: ConversationMessage
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post(`/ai-assistant/conversations/${conversationId}/messages`, message)
      return response.data
    } catch (error) {
      console.error('Send message failed:', error)
      throw error
    }
  }

  /**
   * 获取对话历史
   */
  async getConversations(params?: {
    type?: ConversationType
    status?: string
    userId?: string
    assistantId?: string
    limit?: number
    offset?: number
  }): Promise<{
    success: boolean
    data?: {
      conversations: Conversation[]
      total: number
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/ai-assistant/conversations', {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get conversations failed:', error)
      throw error
    }
  }

  /**
   * 获取对话详情
   */
  async getConversation(conversationId: string): Promise<{
    success: boolean
    data?: Conversation
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get(`/ai-assistant/conversations/${conversationId}`)
      return response.data
    } catch (error) {
      console.error('Get conversation failed:', error)
      throw error
    }
  }

  /**
   * 获取智能建议
   */
  async getIntelligentSuggestions(assistantId: string): Promise<{
    success: boolean
    data?: IntelligentSuggestion[]
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get(`/ai-assistant/assistants/${assistantId}/suggestions`)
      return response.data
    } catch (error) {
      console.error('Get suggestions failed:', error)
      throw error
    }
  }

  /**
   * 应用建议
   */
  async applySuggestion(suggestionId: string, actions: string[]): Promise<{
    success: boolean
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post(`/ai-assistant/suggestions/${suggestionId}/apply`, {
        actions
      })
      return response.data
    } catch (error) {
      console.error('Apply suggestion failed:', error)
      throw error
    }
  }

  /**
   * 训练助手
   */
  async trainAssistant(assistantId: string, training: {
    data: any[]
    objectives: string[]
    method: 'supervised' | 'reinforcement' | 'transfer'
    duration: number
  }): Promise<{
    success: boolean
    data?: {
      trainingId: string
      estimatedTime: number
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post(`/ai-assistant/assistants/${assistantId}/train`, training)
      return response.data
    } catch (error) {
      console.error('Train assistant failed:', error)
      throw error
    }
  }

  /**
   * 获取协作增强功能
   */
  async getCollaborationEnhancements(): Promise<{
    success: boolean
    data?: CollaborationEnhancement[]
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/ai-assistant/collaboration-enhancements')
      return response.data
    } catch (error) {
      console.error('Get collaboration enhancements failed:', error)
      throw error
    }
  }

  /**
   * 启用协作增强
   */
  async enableCollaborationEnhancement(enhancementId: string, config: any): Promise<{
    success: boolean
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post(`/ai-assistant/collaboration-enhancements/${enhancementId}/enable`, config)
      return response.data
    } catch (error) {
      console.error('Enable collaboration enhancement failed:', error)
      throw error
    }
  }

  /**
   * 分析对话性能
   */
  async analyzeConversationPerformance(conversationId: string): Promise<{
    success: boolean
    data?: {
      effectiveness: number
      efficiency: number
      satisfaction: number
      keyMetrics: Record<string, number>
      recommendations: string[]
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get(`/ai-assistant/conversations/${conversationId}/analysis`)
      return response.data
    } catch (error) {
      console.error('Analyze conversation failed:', error)
      throw error
    }
  }

  /**
   * 获取能力分析
   */
  async getCapabilityAnalysis(assistantId: string): Promise<{
    success: boolean
    data?: {
      capabilities: Array<{
        name: string
        proficiency: number
        usage: number
        improvement: number
      }>
      gaps: string[]
      recommendations: string[]
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get(`/ai-assistant/assistants/${assistantId}/capability-analysis`)
      return response.data
    } catch (error) {
      console.error('Get capability analysis failed:', error)
      throw error
    }
  }
}

export const aiAssistantAPI = new AIAssistantAPI()
export default aiAssistantAPI