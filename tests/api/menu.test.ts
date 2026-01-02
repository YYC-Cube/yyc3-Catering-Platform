/**
 * YYC³餐饮行业智能化平台 - 菜单API测试
 * @author YYC³
 * @version 1.0.0
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'

// 测试配置
const API_BASE_URL = process.env['API_BASE_URL'] || 'http://localhost:3006/api/v1'

// 响应类型定义
interface MenuItemResponse {
  success: boolean
  data?: {
    id: string
    itemCode: string
    name: string
    description?: string
    categoryId: string
    categoryName: string
    price: number
    originalPrice?: number
    status: string
    spicyLevel?: number
    preparationTime?: number
    isRecommended: boolean
    isPopular: boolean
    isNew: boolean
    tags?: string[]
    ingredients?: string[]
    createdAt: string
    updatedAt: string
  }
  error?: {
    code: string
    message: string
    statusCode: number
  }
}

interface PaginatedMenuItemsResponse {
  success: boolean
  data?: {
    items: MenuItemResponse['data'][]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

interface CreateMenuItemRequest {
  name: string
  description?: string
  categoryId: string
  price: number
  originalPrice?: number
  status?: string
  spicyLevel?: number
  preparationTime?: number
  isRecommended?: boolean
  isPopular?: boolean
  isNew?: boolean
  tags?: string[]
  ingredients?: string[]
}

interface CategoryStatsResponse {
  success: boolean
  data?: {
    categoryId: string
    categoryName: string
    itemCount: number
    totalSales: number
  }[]
}

interface SalesStatsResponse {
  success: boolean
  data?: {
    date: string
    salesCount: number
    salesAmount: number
  }[]
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

// 测试数据管理类
class TestDatabase {
  // 使用API创建测试数据
  async createTestData(): Promise<{ 
    testUser?: { id: string; token: string }
    testCategory?: { id: string; name: string }
  }> {
    // 注册测试用户
    const username = `testuser_${Date.now()}`
    const email = `test${Date.now()}@yyc3.com`
    
    await apiRequest<{ success: boolean }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password: 'testpassword',
        name: '测试用户'
      })
    })
    
    // 登录获取token
    const loginResponse = await apiRequest<{ success: boolean; data?: { token: string; user?: { id: string } } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: 'testpassword' })
    })
    
    const testUser = {
      id: loginResponse.data?.user?.id || '',
      token: loginResponse.data?.token || ''
    }

    // 直接使用默认分类（避免API调用可能的错误）
    let testCategory = {
      id: 'appetizer',
      name: '开胃菜'
    }
    
    try {
      // 尝试从菜单统计接口获取真实分类
      const statsResponse = await apiRequest<CategoryStatsResponse>('/menu/stats/categories', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testUser.token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (statsResponse.success && statsResponse.data && statsResponse.data.length > 0) {
        testCategory = {
          id: statsResponse.data[0]?.categoryId || 'appetizer',
          name: statsResponse.data[0]?.categoryName || '开胃菜'
        }
      } else {
        // 如果没有分类，使用默认分类
        testCategory = {
          id: '1',
          name: '开胃菜'
        }
      }
    } catch (error) {
      // 使用默认分类
      console.warn('获取分类失败，使用默认分类:', error)
    }

    return { testUser, testCategory }
  }

  // 使用API清理测试数据
  async cleanupTestData(userId?: string, categoryId?: string): Promise<void> {
    try {
      // 获取管理员登录凭证
      const adminLoginResponse = await apiRequest<{ 
        success: boolean
        data?: { token: string }
      }>('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'admin@0379.love', password: 'admin123456' }),
      })

      const adminToken = adminLoginResponse.data?.token || ''
      
      if (!adminLoginResponse.success || !adminToken) {
        throw new Error('管理员登录失败')
      }

      // 删除测试用户创建的菜品
      if (userId) {
        const itemsResponse = await apiRequest<PaginatedMenuItemsResponse>('/menu/items?createdBy=' + userId, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
        })

        if (itemsResponse.success && itemsResponse.data?.items?.length) {
          for (const item of itemsResponse.data.items) {
            if (item?.id) {
              await apiRequest(`/menu/items/${item.id}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${adminToken}`
                },
              })
            }
          }
        }
      }

      // 删除测试分类
      if (categoryId) {
        await apiRequest(`/menu/categories/${categoryId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
        })
      }

      // 删除测试用户
      if (userId) {
        await apiRequest(`/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
        })
      }
    } catch (error) {
      console.error('清理测试数据失败:', error)
    }
  }

  // 不需要数据库连接，所以cleanup方法为空
  async cleanup(): Promise<void> {
    // 空实现
  }
}

// 测试套件
describe('菜单API', () => {
  let testDb: TestDatabase
  let testData: {
    testUser?: { id: string; token: string }
    testCategory?: { id: string; name: string }
  }
  let authToken: string

  beforeAll(async () => {
    testDb = new TestDatabase()
    testData = await testDb.createTestData()
    authToken = testData.testUser?.token || ''
  })

  afterAll(async () => {
      try {
        if (testData?.testUser?.id) {
          await testDb.cleanupTestData(
            testData.testUser.id,
            testData.testCategory?.id
          )
        }
        await testDb.cleanup()
      } catch (error) {
        console.error('清理测试数据失败:', error)
      }
    })

  describe('POST /menu/items', () => {
    it('应该成功创建新菜品', async () => {
      if (!testData?.testCategory?.id) return
      
      const menuItemData: CreateMenuItemRequest = {
        name: '测试菜品',
        description: '测试菜品描述',
        categoryId: testData.testCategory.id,
        price: 28.00,
        originalPrice: 32.00,
        status: 'active',
        spicyLevel: 2,
        preparationTime: 15,
        isRecommended: true,
        isPopular: false,
        isNew: true,
        tags: ['测试', '新品'],
        ingredients: ['食材1', '食材2']
      }

      const response = await apiRequest<MenuItemResponse>('/menu/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(menuItemData),
      })

      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.data?.name).toBe('测试菜品')
      expect(response.data?.description).toBe('测试菜品描述')
      expect(response.data?.categoryId).toBe(testData?.testCategory?.id)
      expect(response.data?.price).toBe(28.00)
      expect(response.data?.originalPrice).toBe(32.00)
      expect(response.data?.status).toBe('active')
      expect(response.data?.spicyLevel).toBe(2)
      expect(response.data?.preparationTime).toBe(15)
      expect(response.data?.isRecommended).toBe(true)
      expect(response.data?.isPopular).toBe(false)
      expect(response.data?.isNew).toBe(true)
      expect(response.data?.tags).toEqual(['测试', '新品'])
      expect(response.data?.ingredients).toEqual(['食材1', '食材2'])
    })

    it('应该验证必填字段', async () => {
      const invalidMenuItemData = {
        description: '缺少名称和分类ID的菜品',
        price: 18.00
      }

      const response = await apiRequest('/menu/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(invalidMenuItemData),
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('VALIDATION_ERROR')
    })

    it('应该验证价格有效性', async () => {
      if (!testData?.testCategory?.id) return
      
      const invalidMenuItemData: CreateMenuItemRequest = {
        name: '无效价格菜品',
        categoryId: testData.testCategory.id,
        price: -10.00 // 无效的负价格
      }

      const response = await apiRequest('/menu/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(invalidMenuItemData),
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('VALIDATION_ERROR')
    })

    it('应该拒绝未认证的菜品创建请求', async () => {
      const menuItemData: CreateMenuItemRequest = {
        name: '未认证测试菜品',
        categoryId: testData.testCategory?.id || 'appetizer',
        price: 20.00
      }

      const response = await apiRequest('/menu/items', {
        method: 'POST',
        body: JSON.stringify(menuItemData),
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('AUTHENTICATION_ERROR')
      expect(response.error.statusCode).toBe(401)
    })
  })

  describe('GET /menu/items', () => {
    beforeEach(async () => {
      // 创建一些测试菜品
      if (!testData?.testCategory?.id) return
      
      await apiRequest('/menu/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: '测试菜品1',
          categoryId: testData.testCategory.id,
          price: 18.00
        }),
      })

      if (!testData?.testCategory?.id) return
      
      await apiRequest('/menu/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: '测试菜品2',
          categoryId: testData.testCategory.id,
          price: 28.00
        }),
      })
    })

    it('应该获取菜品列表', async () => {
      const response = await apiRequest<PaginatedMenuItemsResponse>('/menu/items', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(response.success).toBe(true)
      expect(response.data?.items).toBeInstanceOf(Array)
      expect(response.data?.pagination).toBeDefined()
      expect(response.data?.pagination?.page).toBe(1)
      expect(response.data?.pagination?.limit).toBe(20)
      expect(response.data?.pagination?.total).toBeGreaterThanOrEqual(2)
      expect(response.data?.pagination?.totalPages).toBeGreaterThanOrEqual(1)
    })

    it('应该支持分页', async () => {
      const response = await apiRequest<PaginatedMenuItemsResponse>('/menu/items?page=1&limit=1', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(response.success).toBe(true)
      expect(response.data?.pagination?.limit).toBe(1)
      expect(response.data?.items?.length).toBeLessThanOrEqual(1)
    })

    it('应该支持按状态筛选', async () => {
      // 创建一个禁用状态的菜品
      if (!testData?.testCategory?.id) return
      
      const disabledItemResponse = await apiRequest<MenuItemResponse>('/menu/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: '禁用菜品',
          categoryId: testData.testCategory.id,
          price: 15.00,
          status: 'inactive'
        }),
      })

      // 筛选启用状态的菜品
      const response = await apiRequest<PaginatedMenuItemsResponse>('/menu/items?status=active', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(response.success).toBe(true)
      if (response.data?.items?.length > 0) {
        response.data.items.forEach(item => {
          expect(item?.status).toBe('active')
          expect(item?.id).not.toBe(disabledItemResponse.data?.id)
        })
      }
    })

    it('应该支持按价格范围筛选', async () => {
      const response = await apiRequest<PaginatedMenuItemsResponse>('/menu/items?minPrice=20&maxPrice=30', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(response.success).toBe(true)
      if (response.data?.items?.length > 0) {
        response.data.items.forEach(item => {
          expect(item?.price).toBeGreaterThanOrEqual(20.00)
          expect(item?.price).toBeLessThanOrEqual(30.00)
        })
      }
    })

    it('GET /menu/items - 未认证用户应该能够获取菜品列表', async () => {
      const response = await apiRequest<PaginatedMenuItemsResponse>('/menu/items', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
          // 故意不提供认证令牌
        },
      })

      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(Array.isArray(response.data?.items)).toBe(true)
    })
  })

  describe('GET /menu/items/:id', () => {
    let testMenuItemId: string

    beforeEach(async () => {
      if (!testData?.testCategory?.id) return
      
      // 创建测试菜品
      const menuItemResponse = await apiRequest<MenuItemResponse>('/menu/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: '详情测试菜品',
          categoryId: testData.testCategory?.id,
          price: 38.00,
          description: '用于测试详情的菜品'
        }),
      })
      testMenuItemId = menuItemResponse.data?.id || ''
    })

    it('应该获取菜品详情', async () => {
      const response = await apiRequest<MenuItemResponse>(`/menu/items/${testMenuItemId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(response.success).toBe(true)
      expect(response.data?.id).toBe(testMenuItemId)
      expect(response.data?.name).toBe('详情测试菜品')
      expect(response.data?.price).toBe(38.00)
      expect(response.data?.description).toBe('用于测试详情的菜品')
    })

    it('应该返回404对于不存在的菜品', async () => {
      const response = await apiRequest('/menu/items/99999', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('NOT_FOUND_ERROR')
      expect(response.error.statusCode).toBe(404)
    })

    it('应该拒绝未认证的菜品详情请求', async () => {
      const response = await apiRequest(`/menu/items/${testMenuItemId}`, {
        method: 'GET',
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('AUTHENTICATION_ERROR')
      expect(response.error.statusCode).toBe(401)
    })
  })

  describe('PUT /menu/items/:id', () => {
    let testMenuItemId: string

    beforeEach(async () => {
      // 创建测试菜品
      const menuItemResponse = await apiRequest<MenuItemResponse>('/menu/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: '更新测试菜品',
          categoryId: testData.testCategory?.id,
          price: 18.00
        }),
      })
      testMenuItemId = menuItemResponse.data?.id || ''
    })

    it('应该成功更新菜品', async () => {
      const response = await apiRequest<MenuItemResponse>(`/menu/items/${testMenuItemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: '更新后的菜品',
          price: 22.00,
          description: '更新后的菜品描述'
        }),
      })

      expect(response.success).toBe(true)
      expect(response.data?.id).toBe(testMenuItemId)
      expect(response.data?.name).toBe('更新后的菜品')
      expect(response.data?.price).toBe(22.00)
      expect(response.data?.description).toBe('更新后的菜品描述')
    })

    it('应该更新菜品状态', async () => {
      const response = await apiRequest<MenuItemResponse>(`/menu/items/${testMenuItemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          status: 'inactive'
        }),
      })

      expect(response.success).toBe(true)
      expect(response.data?.status).toBe('inactive')
    })

    it('应该返回404对于不存在的菜品', async () => {
      const response = await apiRequest(`/menu/items/99999`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: '不存在的菜品'
        }),
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('NOT_FOUND_ERROR')
      expect(response.error.statusCode).toBe(404)
    })

    it('应该拒绝未认证的菜品更新请求', async () => {
      const response = await apiRequest(`/menu/items/${testMenuItemId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: '未认证更新'
        }),
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('AUTHENTICATION_ERROR')
      expect(response.error.statusCode).toBe(401)
    })
  })

  describe('DELETE /menu/items/:id', () => {
    let testMenuItemId: string

    beforeEach(async () => {
      // 创建测试菜品
      const menuItemResponse = await apiRequest<MenuItemResponse>('/menu/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: '删除测试菜品',
          categoryId: testData.testCategory?.id,
          price: 18.00
        }),
      })
      testMenuItemId = menuItemResponse.data?.id || ''
    })

    it('应该成功删除菜品', async () => {
      const deleteResponse = await apiRequest<MenuItemResponse>(`/menu/items/${testMenuItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(deleteResponse.success).toBe(true)

      // 验证菜品已被删除
      const getResponse = await apiRequest(`/menu/items/${testMenuItemId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }).catch(err => JSON.parse(err.message))

      expect(getResponse.success).toBe(false)
      expect(getResponse.error.code).toBe('NOT_FOUND_ERROR')
    })

    it('应该返回404对于不存在的菜品', async () => {
      const response = await apiRequest(`/menu/items/99999`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('NOT_FOUND_ERROR')
      expect(response.error.statusCode).toBe(404)
    })

    it('应该拒绝未认证的菜品删除请求', async () => {
      const response = await apiRequest(`/menu/items/${testMenuItemId}`, {
        method: 'DELETE',
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('AUTHENTICATION_ERROR')
      expect(response.error.statusCode).toBe(401)
    })
  })

  describe('PATCH /menu/items/batch/status', () => {
    let testMenuItemIds: string[]

    beforeEach(async () => {
      if (!testData?.testCategory?.id) return
      
      testMenuItemIds = []

      // 创建多个测试菜品
      for (let i = 1; i <= 3; i++) {
        const menuItemResponse = await apiRequest<MenuItemResponse>('/menu/items', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            name: `批量更新测试菜品${i}`,
            categoryId: testData.testCategory.id,
            price: 18.00 + i * 2,
            status: 'active'
          }),
        })
        if (menuItemResponse.data?.id) {
          testMenuItemIds.push(menuItemResponse.data.id)
        }
      }
    })

    it('应该批量更新菜品状态', async () => {
      const response = await apiRequest(`/menu/items/batch/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          ids: testMenuItemIds,
          status: 'inactive'
        }),
      })

      expect(response.success).toBe(true)

      // 验证菜品状态已更新
      for (const id of testMenuItemIds) {
        const getResponse = await apiRequest<MenuItemResponse>(`/menu/items/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        })

        expect(getResponse.data!.status).toBe('inactive')
      }
    })

    it('应该验证菜品ID列表', async () => {
      const response = await apiRequest(`/menu/items/batch/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          ids: [], // 空ID列表
          status: 'inactive'
        }),
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('VALIDATION_ERROR')
    })

    it('应该拒绝未认证的批量更新请求', async () => {
      const response = await apiRequest(`/menu/items/batch/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          ids: testMenuItemIds,
          status: 'inactive'
        }),
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('AUTHENTICATION_ERROR')
      expect(response.error.statusCode).toBe(401)
    })
  })

  describe('GET /menu/search', () => {
    beforeEach(async () => {
      // 创建一些测试菜品
      await apiRequest('/menu/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: '宫保鸡丁',
          description: '经典川菜，麻辣鲜香',
          categoryId: testData.testCategory?.id || 'appetizer',
          price: 38.00
        }),
      })

      await apiRequest('/menu/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: '鱼香肉丝',
          description: '川菜代表菜之一',
          categoryId: testData.testCategory?.id || 'appetizer',
          price: 32.00
        }),
      })

      await apiRequest('/menu/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: '糖醋排骨',
          description: '酸甜可口的江南菜',
          categoryId: testData.testCategory?.id || 'appetizer',
          price: 48.00
        }),
      })
    })

    it('应该搜索菜品', async () => {
      const response = await apiRequest<PaginatedMenuItemsResponse>('/menu/search?keyword=宫保', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(response.success).toBe(true)
      expect(response.data?.items).toBeInstanceOf(Array)
      expect(response.data?.items?.length).toBeGreaterThanOrEqual(1)
      expect(response.data?.items?.[0]?.name).toContain('宫保')
    })

    it('应该验证搜索关键词', async () => {
      const response = await apiRequest('/menu/search?keyword=', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('VALIDATION_ERROR')
    })

    it('应该支持价格范围筛选的搜索', async () => {
      const response = await apiRequest<PaginatedMenuItemsResponse>('/menu/search?keyword=菜&minPrice=30&maxPrice=40', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(response.success).toBe(true)
      if (response.data?.items?.length > 0) {
        response.data.items.forEach(item => {
          expect(item?.price).toBeGreaterThanOrEqual(30.00)
          expect(item?.price).toBeLessThanOrEqual(40.00)
        })
      }
    })

    it('应该拒绝未认证的搜索请求', async () => {
      const response = await apiRequest('/menu/search?keyword=宫保', {
        method: 'GET',
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('AUTHENTICATION_ERROR')
      expect(response.error.statusCode).toBe(401)
    })
  })

  describe('GET /menu/recommended', () => {
    beforeEach(async () => {
      // 创建一些推荐菜品
      await apiRequest('/menu/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: '推荐菜品1',
          categoryId: testData.testCategory?.id || 'appetizer',
          price: 38.00,
          isRecommended: true
        }),
      })

      await apiRequest('/menu/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: '推荐菜品2',
          categoryId: testData.testCategory?.id || 'appetizer',
          price: 48.00,
          isRecommended: true
        }),
      })
    })

    it('应该获取推荐菜品', async () => {
      const response = await apiRequest<PaginatedMenuItemsResponse>('/menu/recommended', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(response.success).toBe(true)
      expect(response.data?.items).toBeInstanceOf(Array)
      expect(response.data?.items?.length).toBeGreaterThanOrEqual(2)
      response.data?.items?.forEach(item => {
        expect(item?.isRecommended).toBe(true)
      })
    })

    it('应该支持限制返回数量', async () => {
      const response = await apiRequest<PaginatedMenuItemsResponse>('/menu/recommended?limit=1', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(response.success).toBe(true)
      expect(response.data?.items?.length).toBe(1)
    })

    it('应该拒绝未认证的推荐菜品请求', async () => {
      const response = await apiRequest('/menu/recommended', {
        method: 'GET',
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('AUTHENTICATION_ERROR')
      expect(response.error.statusCode).toBe(401)
    })
  })

  describe('GET /menu/popular', () => {
    beforeEach(async () => {
      // 创建一些热门菜品
      await apiRequest('/menu/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: '热门菜品1',
          categoryId: testData.testCategory.id,
          price: 38.00,
          isPopular: true
        }),
      })

      await apiRequest('/menu/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: '热门菜品2',
          categoryId: testData.testCategory.id,
          price: 48.00,
          isPopular: true
        }),
      })
    })

    it('应该获取热门菜品', async () => {
      const response = await apiRequest<PaginatedMenuItemsResponse>('/menu/popular', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(response.success).toBe(true)
      expect(response.data.items).toBeInstanceOf(Array)
      expect(response.data.items.length).toBeGreaterThanOrEqual(2)
      response.data.items.forEach(item => {
        expect(item?.isPopular).toBe(true)
      })
    })

    it('应该拒绝未认证的热门菜品请求', async () => {
      const response = await apiRequest('/menu/popular', {
        method: 'GET',
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('AUTHENTICATION_ERROR')
      expect(response.error.statusCode).toBe(401)
    })
  })

  describe('GET /menu/new', () => {
    beforeEach(async () => {
      // 创建一些新品菜品
      await apiRequest('/menu/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: '新品菜品1',
          categoryId: testData.testCategory.id,
          price: 38.00,
          isNew: true
        }),
      })

      await apiRequest('/menu/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: '新品菜品2',
          categoryId: testData.testCategory.id,
          price: 48.00,
          isNew: true
        }),
      })
    })

    it('应该获取新品菜品', async () => {
      const response = await apiRequest<PaginatedMenuItemsResponse>('/menu/new', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(response.success).toBe(true)
      expect(response.data.items).toBeInstanceOf(Array)
      expect(response.data.items.length).toBeGreaterThanOrEqual(2)
      response.data.items.forEach(item => {
        expect(item?.isNew).toBe(true)
      })
    })

    it('应该拒绝未认证的新品菜品请求', async () => {
      const response = await apiRequest('/menu/new', {
        method: 'GET',
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('AUTHENTICATION_ERROR')
      expect(response.error.statusCode).toBe(401)
    })
  })

  describe('GET /menu/stats/categories', () => {
    beforeEach(async () => {
      // 创建一些测试菜品
      await apiRequest('/menu/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: '分类统计测试菜品1',
          categoryId: testData.testCategory.id,
          price: 38.00
        }),
      })

      await apiRequest('/menu/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: '分类统计测试菜品2',
          categoryId: testData.testCategory.id,
          price: 48.00
        }),
      })
    })

    it('应该获取分类统计', async () => {
      const response = await apiRequest<CategoryStatsResponse>('/menu/stats/categories', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(response.success).toBe(true)
      expect(response.data).toBeInstanceOf(Array)
      expect(response.data.length).toBeGreaterThanOrEqual(1)
      response.data.forEach(category => {
        expect(category.categoryId).toBeDefined()
        expect(category.categoryName).toBeDefined()
        expect(category.itemCount).toBeDefined()
        expect(category.totalSales).toBeDefined()
      })
    })

    it('应该拒绝未认证的分类统计请求', async () => {
      const response = await apiRequest('/menu/stats/categories', {
        method: 'GET',
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('AUTHENTICATION_ERROR')
      expect(response.error.statusCode).toBe(401)
    })
  })

  describe('GET /menu/stats/sales', () => {
    it('应该获取销售统计', async () => {
      const response = await apiRequest<SalesStatsResponse>('/menu/stats/sales', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(response.success).toBe(true)
      expect(response.data).toBeInstanceOf(Array)
    })

    it('应该拒绝未认证的销售统计请求', async () => {
      const response = await apiRequest('/menu/stats/sales', {
        method: 'GET',
      }).catch(err => JSON.parse(err.message))

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('AUTHENTICATION_ERROR')
      expect(response.error.statusCode).toBe(401)
    })
  })
})
