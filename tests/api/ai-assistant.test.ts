/**
 * YYC³餐饮行业智能化平台 - AI助手API测试
 * @author YYC³
 * @version 1.0.0
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { Database } from 'sqlite3'

// 测试配置
const API_BASE_URL = process.env['API_BASE_URL'] || 'http://localhost:3006/api/v1'
const DB_PATH = process.env['DB_PATH'] || './database/data/test_yyc3_catering.db'

// 测试数据
const testUser = {
  username: 'testaiuser_' + Date.now(),
  email: `testai${Date.now()}@yyc3.com`,
  password: 'password123',
  fullName: 'AI测试用户',
  role: 'staff'
}

// 响应类型定义
interface LoginResponse {
  success: boolean
  data?: {
    token: string
    refreshToken: string
    user: {
      id: number
      username: string
      email: string
      fullName: string
      role: string
    }
    expiresIn: number
  }
  error?: {
    code: string
    message: string
    statusCode: number
  }
}

interface ErrorResponse {
  success: boolean
  error: {
    code: string
    message: string
    statusCode: number
    timestamp: string
  }
}

interface AIAssistantResponse {
  success: boolean
  data?: any
  error?: {
    code: string
    message: string
    statusCode: number
  }
}

// 测试工具函数
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${data.error?.message || response.statusText}`)
  }

  return data
}

// 测试数据库操作
class TestDatabase {
  private db: Database

  constructor() {
    this.db = new Database(DB_PATH)
    this.db.exec('PRAGMA foreign_keys = ON')
  }

  async createUser(userData: typeof testUser): Promise<number> {
    // 生成密码哈希（简化版，实际应使用bcrypt等）
    const passwordHash = 'hashed_' + userData.password

    const stmt = this.db.prepare(`
      INSERT INTO users (username, email, password_hash, salt, full_name, role, status)
      VALUES (?, ?, ?, ?, ?, ?, 'active')
    `)

    const result = stmt.run(
      userData.username,
      userData.email,
      passwordHash,
      'salt',
      userData.fullName,
      userData.role
    )

    return result.lastInsertRowid as number
  }

  async deleteUser(username: string): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM users WHERE username = ?')
    stmt.run(username)
  }

  async cleanup(): Promise<void> {
    this.db.close()
  }
}

// 测试套件
describe('AI助手API', () => {
  let testDb: TestDatabase
  let authToken: string
  let testUserId: number
  let testSessionId: string

  beforeAll(async () => {
    testDb = new TestDatabase()

    // 创建测试用户
    testUserId = await testDb.createUser(testUser)

    // 等待数据库操作完成
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  afterAll(async () => {
    await testDb.deleteUser(testUser.username)
    await testDb.cleanup()
  })

  beforeEach(async () => {
    // 获取认证token
    const loginResponse = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: testUser.username,
        password: testUser.password,
      }),
    })
    authToken = loginResponse.data!.token
    
    // 生成测试会话ID
    testSessionId = 'test_session_' + Date.now()
  })

  describe('GET /ai/status', () => {
    it('应该返回AI助手服务状态', async () => {
      const response = await apiRequest<AIAssistantResponse>('/ai/status')

      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(typeof response.data.status).toBe('string')
      expect(response.data.serviceAvailable).toBe(true)
    })
  })

  describe('POST /ai/message', () => {
    it('应该成功处理文本消息', async () => {
      const testMessage = {
        sessionId: testSessionId,
        message: '推荐一些热门菜品',
        context: {
          userId: testUserId,
          restaurantId: 1,
          currentOrder: []
        }
      }

      const response = await apiRequest<AIAssistantResponse>('/ai/message', {
        method: 'POST',
        body: JSON.stringify(testMessage),
      }, authToken)

      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.data.response).toBeDefined()
      expect(typeof response.data.response).toBe('string')
      expect(response.data.messageId).toBeDefined()
      expect(response.data.sessionId).toBe(testSessionId)
    })

    it('应该验证必填字段', async () => {
      const invalidMessage = {
        sessionId: testSessionId,
        // 缺少message字段
        context: {
          userId: testUserId
        }
      }

      try {
        await apiRequest<AIAssistantResponse>('/ai/message', {
          method: 'POST',
          body: JSON.stringify(invalidMessage),
        }, authToken)
        expect(true).toBe(false) // 应该抛出错误
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('VALIDATION_ERROR')
      }
    })

    it('应该拒绝未认证用户', async () => {
      const testMessage = {
        sessionId: testSessionId,
        message: '推荐一些热门菜品',
        context: {
          userId: testUserId
        }
      }

      try {
        await apiRequest<AIAssistantResponse>('/ai/message', {
          method: 'POST',
          body: JSON.stringify(testMessage),
        })
        expect(true).toBe(false) // 应该抛出错误
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('AUTHENTICATION_ERROR')
      }
    })
  })

  describe('POST /ai/recommendations', () => {
    it('应该成功获取菜品推荐', async () => {
      const recommendationRequest = {
        sessionId: testSessionId,
        userId: testUserId,
        context: {
          restaurantId: 1,
          dietaryPreferences: ['vegetarian', 'spicy'],
          priceRange: 'medium',
          occasion: 'lunch'
        },
        limit: 5
      }

      const response = await apiRequest<AIAssistantResponse>('/ai/recommendations', {
        method: 'POST',
        body: JSON.stringify(recommendationRequest),
      }, authToken)

      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(Array.isArray(response.data.recommendations)).toBe(true)
      expect(response.data.recommendations.length).toBeLessThanOrEqual(5)
      if (response.data.recommendations.length > 0) {
        expect(response.data.recommendations[0]).toHaveProperty('id')
        expect(response.data.recommendations[0]).toHaveProperty('name')
        expect(response.data.recommendations[0]).toHaveProperty('score')
      }
    })

    it('应该使用默认参数获取推荐', async () => {
      const recommendationRequest = {
        sessionId: testSessionId,
        userId: testUserId
      }

      const response = await apiRequest<AIAssistantResponse>('/ai/recommendations', {
        method: 'POST',
        body: JSON.stringify(recommendationRequest),
      }, authToken)

      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(Array.isArray(response.data.recommendations)).toBe(true)
    })

    it('应该验证用户ID', async () => {
      const invalidRequest = {
        sessionId: testSessionId,
        // 缺少userId字段
        context: {
          restaurantId: 1
        }
      }

      try {
        await apiRequest<AIAssistantResponse>('/ai/recommendations', {
          method: 'POST',
          body: JSON.stringify(invalidRequest),
        }, authToken)
        expect(true).toBe(false) // 应该抛出错误
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('VALIDATION_ERROR')
      }
    })
  })

  describe('会话管理', () => {
    it('应该获取会话历史记录', async () => {
      // 首先发送一条消息
      const testMessage = {
        sessionId: testSessionId,
        message: '测试消息',
        context: {
          userId: testUserId
        }
      }

      await apiRequest<AIAssistantResponse>('/ai/message', {
        method: 'POST',
        body: JSON.stringify(testMessage),
      }, authToken)

      // 获取历史记录
      const response = await apiRequest<AIAssistantResponse>(`/ai/conversation/${testSessionId}/history`, {
        method: 'GET',
      }, authToken)

      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(Array.isArray(response.data.messages)).toBe(true)
      expect(response.data.sessionId).toBe(testSessionId)
    })

    it('应该清除会话历史记录', async () => {
      // 首先发送一条消息
      const testMessage = {
        sessionId: testSessionId,
        message: '测试消息',
        context: {
          userId: testUserId
        }
      }

      await apiRequest<AIAssistantResponse>('/ai/message', {
        method: 'POST',
        body: JSON.stringify(testMessage),
      }, authToken)

      // 清除历史记录
      const response = await apiRequest<AIAssistantResponse>(`/ai/conversation/${testSessionId}/history`, {
        method: 'DELETE',
      }, authToken)

      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.data.cleared).toBe(true)
      expect(response.data.sessionId).toBe(testSessionId)

      // 验证历史记录已清除
      const historyResponse = await apiRequest<AIAssistantResponse>(`/ai/conversation/${testSessionId}/history`, {
        method: 'GET',
      }, authToken)

      expect(historyResponse.data.messages.length).toBe(0)
    })

    it('应该获取会话统计信息', async () => {
      // 首先发送一条消息
      const testMessage = {
        sessionId: testSessionId,
        message: '测试消息',
        context: {
          userId: testUserId
        }
      }

      await apiRequest<AIAssistantResponse>('/ai/message', {
        method: 'POST',
        body: JSON.stringify(testMessage),
      }, authToken)

      // 获取会话统计
      const response = await apiRequest<AIAssistantResponse>(`/ai/conversation/${testSessionId}/stats`, {
        method: 'GET',
      }, authToken)

      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.data.sessionId).toBe(testSessionId)
      expect(response.data.messageCount).toBeGreaterThanOrEqual(1)
      expect(typeof response.data.sessionDuration).toBe('number')
      expect(response.data.sessionDuration).toBeGreaterThanOrEqual(0)
    })
  })

  describe('PUT /ai/config', () => {
    it('应该更新AI助手配置', async () => {
      const configUpdate = {
        responseTimeout: 30000,
        maxHistoryLength: 50,
        defaultLanguage: 'zh-CN'
      }

      const response = await apiRequest<AIAssistantResponse>('/ai/config', {
        method: 'PUT',
        body: JSON.stringify(configUpdate),
      }, authToken)

      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.data.updated).toBe(true)
      expect(response.data.config).toBeDefined()
    })

    it('应该验证配置参数', async () => {
      const invalidConfig = {
        responseTimeout: 'invalid_timeout', // 应该是数字
        maxHistoryLength: 'invalid_length' // 应该是数字
      }

      try {
        await apiRequest<AIAssistantResponse>('/ai/config', {
          method: 'PUT',
          body: JSON.stringify(invalidConfig),
        }, authToken)
        expect(true).toBe(false) // 应该抛出错误
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('VALIDATION_ERROR')
      }
    })
  })

  describe('安全测试', () => {
    it('应该限制未认证用户访问受保护端点', async () => {
      const endpoints = ['/ai/message', '/ai/recommendations', '/ai/config']
      
      for (const endpoint of endpoints) {
        try {
          await apiRequest<AIAssistantResponse>(endpoint, {
            method: 'POST',
            body: JSON.stringify({}),
          })
          expect(true).toBe(false) // 应该抛出错误
        } catch (error) {
          expect(error).toBeInstanceOf(Error)
          expect((error as Error).message).toContain('AUTHENTICATION_ERROR')
        }
      }
    })

    it('应该验证请求频率限制', async () => {
      // 测试限流 - 快速发送多个请求
      const testMessage = {
        sessionId: testSessionId,
        message: '测试消息',
        context: {
          userId: testUserId
        }
      }

      // 发送11个请求（超过每分钟100个的限制，但在短时间内）
      const promises = Array.from({ length: 11 }, () =>
        apiRequest<AIAssistantResponse>('/ai/message', {
          method: 'POST',
          body: JSON.stringify(testMessage),
        }, authToken)
      )

      const results = await Promise.allSettled(promises)
      const successfulRequests = results.filter(r => r.status === 'fulfilled').length
      
      // 至少应该有一些请求成功
      expect(successfulRequests).toBeGreaterThan(0)
    })
  })
})
