// HTTP Client Configuration
const API_BASE_URL = '/api/ai-service'

// Simple fetch-based HTTP Client
class HttpClient {
  private buildUrl(path: string, params?: Record<string, any>): string {
    const url = new URL(`${API_BASE_URL}${path}`)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }
    
    return url.toString()
  }

  private async getHeaders(includeAuth: boolean = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }
    
    if (includeAuth) {
      const token = localStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }
    
    return headers
  }

  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    const response = await fetch(this.buildUrl(path, params), {
      method: 'GET',
      headers: await this.getHeaders()
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async post<T>(path: string, data?: any): Promise<T> {
    const response = await fetch(this.buildUrl(path), {
      method: 'POST',
      headers: await this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async put<T>(path: string, data?: any): Promise<T> {
    const response = await fetch(this.buildUrl(path), {
      method: 'PUT',
      headers: await this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async delete<T>(path: string): Promise<T> {
    const response = await fetch(this.buildUrl(path), {
      method: 'DELETE',
      headers: await this.getHeaders()
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }
}

// Create HTTP client instance
const httpClient = new HttpClient()

// AI服务类型枚举
export enum AIServiceType {
  RECOMMENDATION = 'recommendation',     // 推荐
  PREDICTION = 'prediction',             // 预测
  OPTIMIZATION = 'optimization',         // 优化
  ANALYSIS = 'analysis',                 // 分析
  CHATBOT = 'chatbot',                   // 聊天机器人
  IMAGE_RECOGNITION = 'image_recognition', // 图像识别
  VOICE_ASSISTANT = 'voice_assistant',   // 语音助手
  AUTOMATION = 'automation'              // 自动化
}

// AI模型类型枚举
export enum AIModelType {
  GPT_4 = 'gpt-4',
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  CLAUDE_3 = 'claude-3',
  GEMINI_PRO = 'gemini-pro',
  CUSTOM = 'custom'
}

// 推荐类型枚举
export enum RecommendationType {
  MENU = 'menu',                         // 菜品推荐
  INVENTORY = 'inventory',               // 库存推荐
  PRICING = 'pricing',                   // 定价推荐
  MARKETING = 'marketing',               // 营销推荐
  STAFFING = 'staffing',                 // 人员配置推荐
  EQUIPMENT = 'equipment'                // 设备推荐
}

// 预测类型枚举
export enum PredictionType {
  SALES = 'sales',                       // 销售预测
  DEMAND = 'demand',                     // 需求预测
  TRAFFIC = 'traffic',                   // 客流量预测
  INVENTORY = 'inventory',               // 库存预测
  REVENUE = 'revenue',                   // 收入预测
  STAFFING = 'staffing'                  // 人员需求预测
}

// 基础接口
export interface AIRecommendation {
  id: string
  type: RecommendationType
  title: string
  description: string
  confidence: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  impact: {
    revenue?: number
    cost_savings?: number
    efficiency?: number
    customer_satisfaction?: number
  }
  action_items: Array<{
    title: string
    description: string
    estimated_time?: string
    resources?: string[]
  }>
  data_source: string[]
  generated_at: string
  expires_at?: string
  status: 'active' | 'implemented' | 'rejected' | 'expired'
}

export interface AIPrediction {
  id: string
  type: PredictionType
  title: string
  description: string
  model: AIModelType
  accuracy: number
  time_horizon: string
  predictions: Array<{
    date: string
    value: number
    confidence_interval: {
      lower: number
      upper: number
    }
    factors?: Record<string, number>
  }>
  key_factors: Array<{
    factor: string
    importance: number
    trend: 'increasing' | 'decreasing' | 'stable'
  }>
  recommendations: string[]
  generated_at: string
  last_updated: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata?: {
    intent?: string
    entities?: Record<string, any>
    confidence?: number
  }
}

export interface AIChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  context: {
    user_id?: string
    department?: string
    session_type: 'general' | 'support' | 'analysis' | 'planning'
  }
  created_at: string
  last_activity: string
  status: 'active' | 'archived'
}

export interface AIAnalysis {
  id: string
  type: 'business' | 'operational' | 'customer' | 'market'
  title: string
  description: string
  data_source: string[]
  methodology: string
  findings: Array<{
    category: string
    insight: string
    evidence: any[]
    significance: 'low' | 'medium' | 'high'
  }>
  recommendations: AIRecommendation[]
  visualizations: Array<{
    type: 'chart' | 'graph' | 'heatmap' | 'table'
    title: string
    data: any
    description?: string
  }>
  generated_at: string
  confidence_score: number
}

export interface AIInsight {
  id: string
  category: 'operational' | 'financial' | 'customer' | 'market' | 'strategic'
  title: string
  description: string
  significance: number
  urgency: number
  actionability: number
  data_points: Array<{
    label: string
    value: number
    change: number
    period: string
  }>
  recommended_actions: string[]
  business_impact: {
    short_term: string
    long_term: string
    kpi_impact: Record<string, number>
  }
  generated_at: string
  expires_at: string
}

// AI请求参数接口
export interface AIRequest {
  service: AIServiceType
  model?: AIModelType
  prompt?: string
  data?: any
  context?: Record<string, any>
  options?: {
    temperature?: number
    max_tokens?: number
    top_p?: number
    frequency_penalty?: number
    presence_penalty?: number
  }
}

// AI服务API
class AIServiceAPI {
  /**
   * 生成推荐
   */
  async generateRecommendation(params: {
    type: RecommendationType
    time_period?: string
    filters?: Record<string, any>
    limit?: number
  }): Promise<{ success: boolean; data?: AIRecommendation[]; message?: string }> {
    try {
      const response: AxiosResponse = await httpClient.post('/ai/recommendations', params)
      return response.data
    } catch (error) {
      console.error('Generate recommendations failed:', error)
      throw error
    }
  }

  /**
   * 生成预测
   */
  async generatePrediction(params: {
    type: PredictionType
    target: string
    time_horizon: string
    historical_data?: any
    model?: AIModelType
  }): Promise<{ success: boolean; data?: AIPrediction; message?: string }> {
    try {
      const response: AxiosResponse = await httpClient.post('/ai/predictions', params)
      return response.data
    } catch (error) {
      console.error('Generate prediction failed:', error)
      throw error
    }
  }

  /**
   * AI聊天对话
   */
  async chat(params: {
    message: string
    session_id?: string
    context?: Record<string, any>
    model?: AIModelType
  }): Promise<{ success: boolean; data?: { response: string; session_id: string }; message?: string }> {
    try {
      const response: AxiosResponse = await httpClient.post('/ai/chat', params)
      return response.data
    } catch (error) {
      console.error('AI chat failed:', error)
      throw error
    }
  }

  /**
   * 获取聊天会话历史
   */
  async getChatSession(sessionId: string): Promise<{ success: boolean; data?: AIChatSession; message?: string }> {
    try {
      const response: AxiosResponse = await httpClient.get(`/ai/chat/sessions/${sessionId}`)
      return response.data
    } catch (error) {
      console.error('Get chat session failed:', error)
      throw error
    }
  }

  /**
   * 获取聊天会话列表
   */
  async getChatSessions(): Promise<{ success: boolean; data?: AIChatSession[]; message?: string }> {
    try {
      const response: AxiosResponse = await httpClient.get('/ai/chat/sessions')
      return response.data
    } catch (error) {
      console.error('Get chat sessions failed:', error)
      throw error
    }
  }

  /**
   * 生成商业分析
   */
  async generateAnalysis(params: {
    type: 'business' | 'operational' | 'customer' | 'market'
    data_source: string[]
    time_period: string
    focus_areas?: string[]
  }): Promise<{ success: boolean; data?: AIAnalysis; message?: string }> {
    try {
      const response: AxiosResponse = await httpClient.post('/ai/analysis', params)
      return response.data
    } catch (error) {
      console.error('Generate analysis failed:', error)
      throw error
    }
  }

  /**
   * 获取AI洞察
   */
  async getInsights(params?: {
    category?: string
    time_period?: string
    limit?: number
  }): Promise<{ success: boolean; data?: AIInsight[]; message?: string }> {
    try {
      const response: AxiosResponse = await httpClient.get('/ai/insights', { params })
      return response.data
    } catch (error) {
      console.error('Get insights failed:', error)
      throw error
    }
  }

  /**
   * 优化运营
   */
  async optimizeOperations(params: {
    area: 'staffing' | 'inventory' | 'menu' | 'pricing' | 'marketing'
    constraints?: Record<string, any>
    objectives: string[]
    time_horizon?: string
  }): Promise<{
    success: boolean
    data?: {
      optimizations: Array<{
        area: string
        recommendation: string
        expected_impact: Record<string, number>
        implementation_cost: number
        roi: number
        timeline: string
      }>
      overall_score: number
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/ai/optimization', params)
      return response.data
    } catch (error) {
      console.error('Optimize operations failed:', error)
      throw error
    }
  }

  /**
   * 图像识别
   */
  async recognizeImage(params: {
    image: File | string
    type: 'food' | 'document' | 'inventory' | 'customer'
    options?: Record<string, any>
  }): Promise<{
    success: boolean
    data?: {
      labels: Array<{
        name: string
        confidence: number
        bounding_box?: {
          x: number
          y: number
          width: number
          height: number
        }
      }>
      text?: string
      analysis?: string
    }
    message?: string
  }> {
    try {
      const formData = new FormData()
      if (typeof params.image === 'string') {
        formData.append('image_url', params.image)
      } else {
        formData.append('image', params.image)
      }
      formData.append('type', params.type)
      if (params.options) {
        formData.append('options', JSON.stringify(params.options))
      }

      const response: AxiosResponse = await httpClient.post('/ai/vision/recognize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Image recognition failed:', error)
      throw error
    }
  }

  /**
   * 语音转文本
   */
  async speechToText(params: {
    audio: File
    language?: string
    model?: string
  }): Promise<{ success: boolean; data?: { text: string; confidence: number }; message?: string }> {
    try {
      const formData = new FormData()
      formData.append('audio', params.audio)
      if (params.language) {
        formData.append('language', params.language)
      }
      if (params.model) {
        formData.append('model', params.model)
      }

      const response: AxiosResponse = await httpClient.post('/ai/speech/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Speech to text failed:', error)
      throw error
    }
  }

  /**
   * 文本转语音
   */
  async textToSpeech(params: {
    text: string
    voice?: string
    language?: string
    speed?: number
  }): Promise<{ success: boolean; data?: Blob; message?: string }> {
    try {
      const response: AxiosResponse = await httpClient.post('/ai/speech/synthesize', params, {
        responseType: 'blob'
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Text to speech failed:', error)
      throw error
    }
  }

  /**
   * 获取AI模型状态
   */
  async getModelStatus(): Promise<{
    success: boolean
    data?: Array<{
      model: string
      status: 'available' | 'unavailable' | 'degraded'
      response_time: number
      accuracy: number
      usage: {
        requests: number
        tokens: number
        cost: number
      }
    }>
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/ai/models/status')
      return response.data
    } catch (error) {
      console.error('Get model status failed:', error)
      throw error
    }
  }

  /**
   * 获取AI使用统计
   */
  async getUsageStats(period?: 'day' | 'week' | 'month' | 'quarter'): Promise<{
    success: boolean
    data?: {
      total_requests: number
      total_tokens: number
      total_cost: number
      usage_by_service: Record<string, number>
      usage_by_model: Record<string, number>
      success_rate: number
      average_response_time: number
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/ai/usage/stats', {
        params: { period }
      })
      return response.data
    } catch (error) {
      console.error('Get usage stats failed:', error)
      throw error
    }
  }

  /**
   * 通用AI请求
   */
  async request(request: AIRequest): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response: AxiosResponse = await httpClient.post('/ai/request', request)
      return response.data
    } catch (error) {
      console.error('AI request failed:', error)
      throw error
    }
  }

  /**
   * 流式AI请求
   */
  async streamRequest(request: AIRequest, onChunk: (chunk: string) => void): Promise<void> {
    try {
      const response = await httpClient.post('/ai/request/stream', request, {
        responseType: 'stream'
      })

      const reader = response.data.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim())

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              onChunk(data.content || '')
            } catch (e) {
              console.error('Error parsing chunk:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('AI stream request failed:', error)
      throw error
    }
  }
}

export const aiServiceAPI = new AIServiceAPI()
export default aiServiceAPI