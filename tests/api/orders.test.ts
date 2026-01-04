/**
 * YYC³餐饮行业智能化平台 - 订单API测试
 * @author YYC³
 * @version 1.0.0
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test'
import { Database } from 'bun:sqlite'

// 测试配置
const API_BASE_URL = process.env['API_BASE_URL'] || 'http://localhost:3006/api/v1'
const DB_PATH = process.env['DB_PATH'] || './database/data/test_yyc3_catering.db'

// 响应类型定义
interface OrderResponse {
  success: boolean
  data?: {
    id: number
    orderNo: string
    storeId: number
    memberId?: number
    tableNumber?: string
    orderType: string
    subtotal: number
    totalAmount: number
    status: string
    paymentStatus: string
    items: OrderItem[]
    createdAt: string
  }
  error?: {
    code: string
    message: string
    statusCode: number
  }
}

interface OrderItem {
  id: number
  itemId: number
  itemName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  specialRequests?: string
}

interface PaginatedOrdersResponse {
  success: boolean
  data: {
    items: OrderResponse['data'][]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

interface CreateOrderRequest {
  storeId: number
  memberId?: number
  tableNumber?: string
  orderType?: string
  peopleCount?: number
  items: {
    itemId: number
    quantity: number
    specId?: number
    options?: Array<{
      optionId: number
      quantity: number
    }>
    specialRequests?: string
  }[]
  specialRequests?: string
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
    const error = await response.json()
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

  async createTestData(): Promise<{
    testStore: { id: number; code: string }
    testUser: { id: number; token: string }
    testMember: { id: number; memberNo: string }
    testMenuItem: { id: number; name: string; price: number }
  }> {
    // 创建测试门店
    const storeStmt = this.db.prepare(`
      INSERT INTO stores (store_code, name, address, phone, status)
      VALUES (?, ?, ?, ?, 'active')
    `)
    const storeResult = storeStmt.run(
      `STORE_${Date.now()}`,
      '测试门店',
      '测试地址',
      '1234567890'
    )
    const testStore = {
      id: storeResult.lastInsertRowid as number,
      code: `STORE_${Date.now()}`
    }

    // 创建测试用户
    const userStmt = this.db.prepare(`
      INSERT INTO users (username, email, password_hash, salt, full_name, role, status)
      VALUES (?, ?, ?, ?, ?, ?, 'active')
    `)
    const userResult = userStmt.run(
      `testuser_${Date.now()}`,
      `test${Date.now()}@yyc3.com`,
      'hashed_password',
      'salt',
      '测试用户',
      'staff'
    )
    const testUser = {
      id: userResult.lastInsertRowid as number,
      token: `mock_token_${Date.now()}`
    }

    // 创建测试会员
    const memberStmt = this.db.prepare(`
      INSERT INTO members (member_no, phone, level_id, points, balance, status)
      VALUES (?, ?, 1, 0, 0, 'active')
    `)
    const memberResult = memberStmt.run(
      `M${Date.now()}`,
      '13800138000'
    )
    const testMember = {
      id: memberResult.lastInsertRowid as number,
      memberNo: `M${Date.now()}`
    }

    // 创建测试分类
    const categoryStmt = this.db.prepare(`
      INSERT INTO menu_categories (name, description, sort_order, is_active)
      VALUES (?, ?, ?, 1)
    `)
    const categoryResult = categoryStmt.run(
      '测试分类',
      '测试分类描述',
      1
    )
    const categoryId = categoryResult.lastInsertRowid as number

    // 创建测试菜品
    const itemStmt = this.db.prepare(`
      INSERT INTO menu_items (item_code, name, description, category_id, price, is_available, created_by)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `)
    const itemResult = itemStmt.run(
      `ITEM_${Date.now()}`,
      '测试菜品',
      '测试菜品描述',
      categoryId,
      28.00,
      testUser.id
    )
    const testMenuItem = {
      id: itemResult.lastInsertRowid as number,
      name: '测试菜品',
      price: 28.00
    }

    return { testStore, testUser, testMember, testMenuItem }
  }

  async cleanupTestData(storeId: number, userId: number, memberId: number): Promise<void> {
    // 清理订单（按外键依赖顺序）
    const deleteOrderItems = this.db.prepare('DELETE FROM order_items')
    deleteOrderItems.run()

    const deleteOrders = this.db.prepare('DELETE FROM orders')
    deleteOrders.run()

    // 清理菜单项
    const deleteMenuItems = this.db.prepare('DELETE FROM menu_items WHERE created_by = ?')
    deleteMenuItems.run(userId)

    // 清理分类
    const deleteCategories = this.db.prepare('DELETE FROM menu_categories')
    deleteCategories.run()

    // 清理其他数据
    const deleteMembers = this.db.prepare('DELETE FROM members WHERE id = ?')
    deleteMembers.run(memberId)

    const deleteStores = this.db.prepare('DELETE FROM stores WHERE id = ?')
    deleteStores.run(storeId)

    const deleteUsers = this.db.prepare('DELETE FROM users WHERE id = ?')
    deleteUsers.run(userId)
  }

  async cleanup(): Promise<void> {
    this.db.close()
  }
}

// 测试套件
describe('订单API', () => {
  let testDb: TestDatabase
  let testData: {
    testStore: { id: number; code: string }
    testUser: { id: number; token: string }
    testMember: { id: number; memberNo: string }
    testMenuItem: { id: number; name: string; price: number }
  }
  let authToken: string

  beforeAll(async () => {
    testDb = new TestDatabase()
    testData = await testDb.createTestData()
    authToken = testData.testUser.token
  })

  afterAll(async () => {
    await testDb.cleanupTestData(
      testData.testStore.id,
      testData.testUser.id,
      testData.testMember.id
    )
    await testDb.cleanup()
  })

  describe('POST /orders', () => {
    it('应该成功创建新订单', async () => {
      const orderData: CreateOrderRequest = {
        storeId: testData.testStore.id,
        tableNumber: 'A01',
        orderType: 'dine_in',
        peopleCount: 2,
        items: [
          {
            itemId: testData.testMenuItem.id,
            quantity: 2,
            specialRequests: '不要辣'
          }
        ],
        specialRequests: '尽快上菜'
      }

      const response = await apiRequest<OrderResponse>('/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(orderData),
      })

      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.data!.orderNo).toMatch(/^ORD\d{12}$/)
      expect(response.data!.storeId).toBe(testData.testStore.id)
      expect(response.data!.tableNumber).toBe('A01')
      expect(response.data!.orderType).toBe('dine_in')
      expect(response.data!.subtotal).toBe(56.00) // 28.00 * 2
      expect(response.data!.totalAmount).toBe(56.00)
      expect(response.data!.status).toBe('pending')
      expect(response.data!.paymentStatus).toBe('unpaid')
      expect(response.data!.items).toHaveLength(1)
      expect(response.data!.items[0]!.itemName).toBe(testData.testMenuItem.name)
      expect(response.data!.items[0]!.quantity).toBe(2)
      expect(response.data!.items[0]!.unitPrice).toBe(28.00)
      expect(response.data!.items[0]!.totalPrice).toBe(56.00)
      expect(response.data!.items[0]!.specialRequests).toBe('不要辣')
    })

    it('应该创建带会员的订单', async () => {
      const orderData: CreateOrderRequest = {
        storeId: testData.testStore.id,
        memberId: testData.testMember.id,
        tableNumber: 'B02',
        orderType: 'dine_in',
        items: [
          {
            itemId: testData.testMenuItem.id,
            quantity: 1
          }
        ]
      }

      const response = await apiRequest<OrderResponse>('/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(orderData),
      })

      expect(response.success).toBe(true)
      expect(response.data!.memberId).toBe(testData.testMember.id)
    })

    it('应该创建外卖订单', async () => {
      const orderData: CreateOrderRequest = {
        storeId: testData.testStore.id,
        orderType: 'takeaway',
        items: [
          {
            itemId: testData.testMenuItem.id,
            quantity: 1
          }
        ]
      }

      const response = await apiRequest<OrderResponse>('/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(orderData),
      })

      expect(response.success).toBe(true)
      expect(response.data!.orderType).toBe('takeaway')
    })

    it('应该验证必填字段', async () => {
      const invalidOrderData = {
        tableNumber: 'A01',
        // 缺少storeId和items
      }

      const response = await apiRequest('/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(invalidOrderData),
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('VALIDATION_ERROR')
    })

    it('应该验证订单项不为空', async () => {
      const orderData = {
        storeId: testData.testStore.id,
        items: []
      }

      const response = await apiRequest('/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(orderData),
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('VALIDATION_ERROR')
    })

    it('应该验证门店ID有效性', async () => {
      const orderData: CreateOrderRequest = {
        storeId: 99999, // 不存在的门店ID
        items: [
          {
            itemId: testData.testMenuItem.id,
            quantity: 1
          }
        ]
      }

      const response = await apiRequest('/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(orderData),
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('NOT_FOUND_ERROR')
    })

    it('应该拒绝未认证的订单创建请求', async () => {
      const orderData: CreateOrderRequest = {
        storeId: testData.testStore.id,
        items: [
          {
            itemId: testData.testMenuItem.id,
            quantity: 1
          }
        ]
      }

      const response = await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('AUTHENTICATION_ERROR')
      expect(response.error.statusCode).toBe(401)
    })
  })

  describe('GET /orders', () => {
    beforeEach(async () => {
      // 创建一些测试订单
      await apiRequest('/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          storeId: testData.testStore.id,
          items: [{ itemId: testData.testMenuItem.id, quantity: 1 }]
        }),
      })
    })

    it('应该获取订单列表', async () => {
      const response = await apiRequest<PaginatedOrdersResponse>('/orders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(response.success).toBe(true)
      expect(response.data.items).toBeInstanceOf(Array)
      expect(response.data.pagination).toBeDefined()
      expect(response.data.pagination.page).toBe(1)
      expect(response.data.pagination.limit).toBe(20)
      expect(response.data.pagination.total).toBeGreaterThanOrEqual(0)
      expect(response.data.pagination.totalPages).toBeGreaterThanOrEqual(0)
    })

    it('应该支持分页', async () => {
      const response = await apiRequest<PaginatedOrdersResponse>('/orders?page=1&limit=5', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(response.success).toBe(true)
      expect(response.data.pagination.limit).toBe(5)
      expect(response.data.items.length).toBeLessThanOrEqual(5)
    })

    it('应该支持按状态筛选', async () => {
      const response = await apiRequest<PaginatedOrdersResponse>('/orders?status=pending', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(response.success).toBe(true)
      if (response.data.items.length > 0) {
        response.data.items.forEach(order => {
          expect(order!.status).toBe('pending')
        })
      }
    })

    it('应该支持按门店筛选', async () => {
      const response = await apiRequest<PaginatedOrdersResponse>(
        `/orders?storeId=${testData.testStore.id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      )

      expect(response.success).toBe(true)
      if (response.data.items.length > 0) {
        response.data.items.forEach(order => {
          expect(order!.storeId).toBe(testData.testStore.id)
        })
      }
    })

    it('应该支持日期范围筛选', async () => {
      const today = new Date().toISOString().split('T')[0]
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const response = await apiRequest<PaginatedOrdersResponse>(
        `/orders?startDate=${today}T00:00:00Z&endDate=${tomorrow}T23:59:59Z`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      )

      expect(response.success).toBe(true)
    })
  })

  describe('GET /orders/{id}', () => {
    let testOrderId: number

    beforeEach(async () => {
      // 创建测试订单
      const orderResponse = await apiRequest<OrderResponse>('/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          storeId: testData.testStore.id,
          tableNumber: 'C03',
          items: [{ itemId: testData.testMenuItem.id, quantity: 3 }]
        }),
      })
      testOrderId = orderResponse.data!.id
    })

    it('应该获取订单详情', async () => {
      const response = await apiRequest<OrderResponse>(`/orders/${testOrderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(response.success).toBe(true)
      expect(response.data!.id).toBe(testOrderId)
      expect(response.data!.tableNumber).toBe('C03')
      expect(response.data!.subtotal).toBe(84.00) // 28.00 * 3
      expect(response.data!.totalAmount).toBe(84.00)
      expect(response.data!.items).toHaveLength(1)
      expect(response.data!.items[0]!.quantity).toBe(3)
    })

    it('应该返回404对于不存在的订单', async () => {
      const response = await apiRequest('/orders/99999', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('NOT_FOUND_ERROR')
      expect(response.error.statusCode).toBe(404)
    })

    it('应该拒绝未认证的订单详情请求', async () => {
      const response = await apiRequest(`/orders/${testOrderId}`, {
        method: 'GET',
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('AUTHENTICATION_ERROR')
      expect(response.error.statusCode).toBe(401)
    })
  })

  describe('PATCH /orders/{id}', () => {
    let testOrderId: number

    beforeEach(async () => {
      // 创建测试订单
      const orderResponse = await apiRequest<OrderResponse>('/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          storeId: testData.testStore.id,
          items: [{ itemId: testData.testMenuItem.id, quantity: 1 }]
        }),
      })
      testOrderId = orderResponse.data!.id
    })

    it('应该成功更新订单状态', async () => {
      const response = await apiRequest<OrderResponse>(`/orders/${testOrderId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          status: 'confirmed'
        }),
      })

      expect(response.success).toBe(true)
      expect(response.data!.status).toBe('confirmed')
    })

    it('应该支持取消订单', async () => {
      const response = await apiRequest<OrderResponse>(`/orders/${testOrderId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          status: 'cancelled',
          reason: '顾客要求取消'
        }),
      })

      expect(response.success).toBe(true)
      expect(response.data!.status).toBe('cancelled')
    })

    it('应该验证状态转换的有效性', async () => {
      // 尝试从pending直接跳到completed（可能不被允许）
      const response = await apiRequest(`/orders/${testOrderId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          status: 'completed'
        }),
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('BUSINESS_ERROR')
    })

    it('应该拒绝未认证的状态更新请求', async () => {
      const response = await apiRequest(`/orders/${testOrderId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'confirmed'
        }),
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('AUTHENTICATION_ERROR')
    })
  })

  describe('订单业务逻辑测试', () => {
    it('应该正确计算订单总价', async () => {
      const orderData: CreateOrderRequest = {
        storeId: testData.testStore.id,
        items: [
          {
            itemId: testData.testMenuItem.id,
            quantity: 2
          },
          {
            itemId: testData.testMenuItem.id,
            quantity: 1
          }
        ]
      }

      const response = await apiRequest<OrderResponse>('/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(orderData),
      })

      expect(response.success).toBe(true)
      expect(response.data!.subtotal).toBe(84.00) // 28.00 * 3
      expect(response.data!.totalAmount).toBe(84.00)
    })

    it('应该生成唯一的订单号', async () => {
      const orderData1: CreateOrderRequest = {
        storeId: testData.testStore.id,
        items: [{ itemId: testData.testMenuItem.id, quantity: 1 }]
      }

      const orderData2: CreateOrderRequest = {
        storeId: testData.testStore.id,
        items: [{ itemId: testData.testMenuItem.id, quantity: 1 }]
      }

      const response1 = await apiRequest<OrderResponse>('/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(orderData1),
      })

      const response2 = await apiRequest<OrderResponse>('/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(orderData2),
      })

      expect(response1.data!.orderNo).not.toBe(response2.data!.orderNo)
      expect(response1.data!.orderNo).toMatch(/^ORD\d{12}$/)
      expect(response2.data!.orderNo).toMatch(/^ORD\d{12}$/)
    })

    it('应该记录订单创建时间', async () => {
      const beforeCreation = new Date()

      const response = await apiRequest<OrderResponse>('/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          storeId: testData.testStore.id,
          items: [{ itemId: testData.testMenuItem.id, quantity: 1 }]
        }),
      })

      const afterCreation = new Date()
      const createdAt = new Date(response.data!.createdAt)

      expect(createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime())
      expect(createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime())
    })
  })
})