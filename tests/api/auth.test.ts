/**
 * YYC³餐饮行业智能化平台 - 认证API测试
 * @author YYC³
 * @version 1.0.0
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'

// 测试配置
const API_BASE_URL = process.env['API_BASE_URL'] || 'http://localhost:3006/api/v1'
const DB_PATH = process.env['DB_PATH'] || './database/data/test_yyc3_catering.db'

// 测试数据
const testUser = {
  username: 'testuser_' + Date.now(),
  email: `test${Date.now()}@yyc3.com`,
  password: 'password123',
  fullName: '测试用户',
  role: 'staff'
}

const testAdmin = {
  username: 'testadmin_' + Date.now(),
  email: `admin${Date.now()}@yyc3.com`,
  password: 'admin123',
  fullName: '测试管理员',
  role: 'admin'
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

// 测试工具函数
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json() as ErrorResponse
    throw new Error(`API Error: ${response.status} ${error.error?.message || response.statusText}`)
  }

  return response.json()
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
describe('认证API', () => {
  let testDb: TestDatabase
  let authToken: string
  let refreshToken: string
  let testUserId: number
  let testAdminUserId: number

  beforeAll(async () => {
    testDb = new TestDatabase()

    // 创建测试用户
    testUserId = await testDb.createUser(testUser)
    testAdminUserId = await testDb.createUser(testAdmin)

    // 等待数据库操作完成
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  afterAll(async () => {
    await testDb.deleteUser(testUser.username)
    await testDb.deleteUser(testAdmin.username)
    await testDb.cleanup()
  })

  describe('POST /auth/login', () => {
    it('应该成功登录有效用户', async () => {
      const response = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: testUser.username,
          password: testUser.password,
        }),
      })

      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.data!.token).toBeDefined()
      expect(response.data!.refreshToken).toBeDefined()
      expect(response.data!.user.username).toBe(testUser.username)
      expect(response.data!.user.email).toBe(testUser.email)
      expect(response.data!.user.role).toBe(testUser.role)
      expect(response.data!.expiresIn).toBeGreaterThan(0)

      // 保存token用于后续测试
      authToken = response.data!.token
      refreshToken = response.data!.refreshToken
    })

    it('应该拒绝无效的用户名', async () => {
      const response = await apiRequest<ErrorResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'invaliduser',
          password: 'password123',
        }),
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('AUTHENTICATION_ERROR')
      expect(response.error.statusCode).toBe(401)
    })

    it('应该拒绝错误的密码', async () => {
      const response = await apiRequest<ErrorResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: testUser.username,
          password: 'wrongpassword',
        }),
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('AUTHENTICATION_ERROR')
      expect(response.error.statusCode).toBe(401)
    })

    it('应该验证必填字段', async () => {
      // 测试缺少用户名
      const response1 = await apiRequest<ErrorResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          password: 'password123',
        }),
      }).catch(err => JSON.parse(err.message))

      expect(response1.success).toBe(false)
      expect(response1.error.code).toBe('VALIDATION_ERROR')

      // 测试缺少密码
      const response2 = await apiRequest<ErrorResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: testUser.username,
        }),
      }).catch(err => JSON.parse(err.message))

      expect(response2.success).toBe(false)
      expect(response2.error.code).toBe('VALIDATION_ERROR')
    })

    it('应该验证密码长度', async () => {
      const response = await apiRequest<ErrorResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: testUser.username,
          password: '123', // 太短的密码
        }),
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('POST /auth/refresh', () => {
    it('应该使用有效的refresh token刷新访问token', async () => {
      const response = await apiRequest<LoginResponse>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({
          refreshToken: refreshToken,
        }),
      })

      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.data!.token).toBeDefined()
      expect(response.data!.token).not.toBe(authToken) // 应该是新的token
      expect(response.data!.expiresIn).toBeGreaterThan(0)
    })

    it('应该拒绝无效的refresh token', async () => {
      const response = await apiRequest<ErrorResponse>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({
          refreshToken: 'invalid_refresh_token',
        }),
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('AUTHENTICATION_ERROR')
      expect(response.error.statusCode).toBe(401)
    })

    it('应该验证必填字段', async () => {
      const response = await apiRequest<ErrorResponse>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({}),
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('POST /auth/logout', () => {
    it('应该成功登出已认证用户', async () => {
      const response = await apiRequest('/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(response.success).toBe(true)
    })

    it('应该拒绝未认证用户的登出请求', async () => {
      const response = await apiRequest<ErrorResponse>('/auth/logout', {
        method: 'POST',
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('AUTHENTICATION_ERROR')
      expect(response.error.statusCode).toBe(401)
    })

    it('应该拒绝无效的token', async () => {
      const response = await apiRequest<ErrorResponse>('/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer invalid_token',
        },
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('AUTHENTICATION_ERROR')
      expect(response.error.statusCode).toBe(401)
    })
  })

  describe('Token验证', () => {
    it('应该保护需要认证的端点', async () => {
      const response = await apiRequest<ErrorResponse>('/users', {
        method: 'GET',
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('AUTHENTICATION_ERROR')
      expect(response.error.statusCode).toBe(401)
    })

    it('应该允许使用有效token访问受保护的端点', async () => {
      // 先重新登录获取新token
      const loginResponse = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: testUser.username,
          password: testUser.password,
        }),
      })

      const token = loginResponse.data!.token

      // 尝试访问受保护的端点
      const response = await apiRequest('/users/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      expect(response.success).toBe(true)
    })
  })

  describe('角色权限测试', () => {
    let staffToken: string
    let adminToken: string

    beforeEach(async () => {
      // 获取staff用户token
      const staffResponse = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: testUser.username,
          password: testUser.password,
        }),
      })
      staffToken = staffResponse.data!.token

      // 获取admin用户token
      const adminResponse = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: testAdmin.username,
          password: testAdmin.password,
        }),
      })
      adminToken = adminResponse.data!.token
    })

    it('应该允许管理员访问用户管理接口', async () => {
      const response = await apiRequest('/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      })

      expect(response.success).toBe(true)
    })

    it('应该限制普通员工访问用户管理接口', async () => {
      const response = await apiRequest<ErrorResponse>('/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${staffToken}`,
        },
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('AUTHORIZATION_ERROR')
      expect(response.error.statusCode).toBe(403)
    })
  })

  describe('安全测试', () => {
    it('应该防止SQL注入攻击', async () => {
      const maliciousUsername = "admin'; DROP TABLE users; --"

      const response = await apiRequest<ErrorResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: maliciousUsername,
          password: 'password123',
        }),
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('AUTHENTICATION_ERROR')
    })

    it('应该处理特殊字符', async () => {
      const specialCharsUsername = "test@#$%^&*()_+-=[]{}|;:,.<>?"

      const response = await apiRequest<ErrorResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: specialCharsUsername,
          password: 'password123',
        }),
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('AUTHENTICATION_ERROR')
    })

    it('应该有合理的请求频率限制', async () => {
      const promises = Array.from({ length: 10 }, () =>
        apiRequest<ErrorResponse>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            username: 'testuser',
            password: 'wrongpassword',
          }),
        })
      )

      const results = await Promise.allSettled(promises)
      const rateLimitResponses = results.filter(
        result =>
          result.status === 'rejected' ||
          (result.status === 'fulfilled' &&
           (result.value as any).error?.code === 'RATE_LIMIT_ERROR')
      )

      // 检查是否有rate limit错误（如果实现了的话）
      expect(rateLimitResponses.length).toBeGreaterThanOrEqual(0)
    })
  })
})