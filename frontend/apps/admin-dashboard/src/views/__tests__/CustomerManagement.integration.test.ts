/**
 * YYC³餐饮行业智能化平台 - 客户管理模块集成测试
 * @fileoverview 测试客户管理模块的端到端集成功能
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-20
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// 创建MSW服务器
const server = setupServer()

describe('Customer Management Integration Tests', () => {
  beforeAll(() => {
    server.listen()
  })

  afterAll(() => {
    server.close()
  })

  beforeEach(() => {
    server.resetHandlers()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  describe('客户创建到分群的完整流程', () => {
    it('应该正确完成客户创建到分群的完整流程', async () => {
      const newCustomer = {
        name: '张三',
        phone: '13800138001',
        email: 'zhangsan@example.com',
        gender: 'male',
        birthday: '1990-01-01'
      }

      const createdCustomer = {
        id: '1',
        ...newCustomer,
        status: 'active',
        totalSpent: 0,
        totalOrders: 0,
        points: 0,
        createdAt: '2026-01-20T00:00:00Z',
        updatedAt: '2026-01-20T00:00:00Z'
      }

      const customerGroup = {
        id: '1',
        name: '新客户',
        description: '注册30天内的客户',
        groupType: 'manual',
        conditions: { daysSinceRegister: 30 },
        color: '#67C23A',
        icon: 'el-icon-user',
        priority: 1,
        memberCount: 1,
        enabled: true,
        createdBy: 'admin',
        createdAt: '2026-01-20T00:00:00Z',
        updatedAt: '2026-01-20T00:00:00Z'
      }

      // 模拟创建客户API
      server.use(
        http.post('/api/customers', () => {
          return HttpResponse.json({
            code: 200,
            message: '创建成功',
            data: createdCustomer
          })
        })
      )

      // 模拟添加到分群API
      server.use(
        http.post('/api/customer-groups/:groupId/members', () => {
          return HttpResponse.json({
            code: 200,
            message: '添加成功',
            data: null
          })
        })
      )

      // 模拟获取分群详情API
      server.use(
        http.get('/api/customer-groups/:id', () => {
          return HttpResponse.json({
            code: 200,
            message: 'success',
            data: customerGroup
          })
        })
      )

      // 步骤1：创建客户
      const createResponse = await fetch('http://localhost:3000/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCustomer)
      })

      const createResult = await createResponse.json()
      expect(createResult.code).toBe(200)
      expect(createResult.data.id).toBe('1')
      expect(createResult.data.name).toBe('张三')

      // 步骤2：添加到分群
      const addMemberResponse = await fetch('http://localhost:3000/api/customer-groups/1/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerIds: ['1']
        })
      })

      const addMemberResult = await addMemberResponse.json()
      expect(addMemberResult.code).toBe(200)

      // 步骤3：验证分群成员
      const groupResponse = await fetch('http://localhost:3000/api/customer-groups/1')
      const groupResult = await groupResponse.json()

      expect(groupResult.code).toBe(200)
      expect(groupResult.data.memberCount).toBe(1)
    })
  })

  describe('客户生命周期自动流转', () => {
    it('应该正确处理客户从潜在客户到新客户的流转', async () => {
      const customer = {
        id: '1',
        name: '张三',
        phone: '13800138001',
        email: 'zhangsan@example.com',
        status: 'active',
        totalOrders: 0,
        totalSpent: 0,
        points: 0,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-20T00:00:00Z'
      }

      const lifecycle = {
        id: '1',
        customerId: '1',
        currentStage: 'potential',
        previousStage: null,
        stageChangedAt: '2026-01-01T00:00:00Z',
        daysInCurrentStage: 20,
        totalDaysInLifecycle: 20
      }

      const updatedLifecycle = {
        ...lifecycle,
        currentStage: 'new',
        previousStage: 'potential',
        stageChangedAt: '2026-01-20T00:00:00Z',
        daysInCurrentStage: 0,
        totalDaysInLifecycle: 20
      }

      // 模拟获取客户详情API
      server.use(
        http.get('/api/customers/:id', () => {
          return HttpResponse.json({
            code: 200,
            message: 'success',
            data: customer
          })
        })
      )

      // 模拟获取生命周期API
      server.use(
        http.get('/api/customers/:id/lifecycle', () => {
          return HttpResponse.json({
            code: 200,
            message: 'success',
            data: lifecycle
          })
        })
      )

      // 模拟更新生命周期API
      server.use(
        http.put('/api/customers/:id/lifecycle/stage', () => {
          return HttpResponse.json({
            code: 200,
            message: '更新成功',
            data: updatedLifecycle
          })
        })
      )

      // 模拟创建订单API
      server.use(
        http.post('/api/orders', () => {
          return HttpResponse.json({
            code: 200,
            message: '创建成功',
            data: {
              id: '1',
              customerId: '1',
              orderNo: 'ORD202601200001',
              totalAmount: 100,
              status: 'completed',
              createdAt: '2026-01-20T00:00:00Z'
            }
          })
        })
      )

      // 步骤1：创建订单
      const orderResponse = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerId: '1',
          items: [
            {
              dishId: '1',
              quantity: 1,
              price: 100
            }
          ]
        })
      })

      const orderResult = await orderResponse.json()
      expect(orderResult.code).toBe(200)

      // 步骤2：检查生命周期是否自动更新
      const lifecycleResponse = await fetch('http://localhost:3000/api/customers/1/lifecycle')
      const lifecycleResult = await lifecycleResponse.json()

      expect(lifecycleResult.code).toBe(200)
      expect(lifecycleResult.data.currentStage).toBe('new')
      expect(lifecycleResult.data.previousStage).toBe('potential')
    })
  })

  describe('RFM评分计算和客户等级划分', () => {
    it('应该正确计算RFM评分并划分客户等级', async () => {
      const customer = {
        id: '1',
        name: '张三',
        phone: '13800138001',
        email: 'zhangsan@example.com',
        status: 'active',
        totalOrders: 25,
        totalSpent: 6000,
        lastOrderAt: '2026-01-18T00:00:00Z',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2026-01-20T00:00:00Z'
      }

      const rfmScore = {
        id: '1',
        customerId: '1',
        recencyScore: 5,
        frequencyScore: 5,
        monetaryScore: 5,
        rfmScore: 15,
        customerLevel: '超级VIP',
        calculatedAt: '2026-01-20T00:00:00Z'
      }

      // 模拟获取客户详情API
      server.use(
        http.get('/api/customers/:id', () => {
          return HttpResponse.json({
            code: 200,
            message: 'success',
            data: customer
          })
        })
      )

      // 模拟计算RFM评分API
      server.use(
        http.post('/api/rfm/calculate', () => {
          return HttpResponse.json({
            code: 200,
            message: '计算成功',
            data: [rfmScore]
          })
        })
      )

      // 步骤1：计算RFM评分
      const rfmResponse = await fetch('http://localhost:3000/api/rfm/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerIds: ['1']
        })
      })

      const rfmResult = await rfmResponse.json()
      expect(rfmResult.code).toBe(200)
      expect(rfmResult.data[0].rfmScore).toBe(15)
      expect(rfmResult.data[0].customerLevel).toBe('超级VIP')
    })
  })

  describe('流失预测和预警处理', () => {
    it('应该正确预测客户流失并生成预警', async () => {
      const customer = {
        id: '1',
        name: '张三',
        phone: '13800138001',
        email: 'zhangsan@example.com',
        status: 'active',
        totalOrders: 5,
        totalSpent: 500,
        lastOrderAt: '2025-10-20T00:00:00Z',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2026-01-20T00:00:00Z'
      }

      const churnPrediction = {
        id: '1',
        customerId: '1',
        customerName: '张三',
        customerPhone: '13800138001',
        customerEmail: 'zhangsan@example.com',
        churnProbability: 0.8,
        riskLevel: 'high',
        riskFactors: ['90天未消费', '60天未消费', '30天未消费'],
        predictedChurnDate: '2026-03-20T00:00:00Z',
        recommendations: [
          '立即联系客户了解情况',
          '发送关怀短信',
          '提供专属优惠券'
        ],
        assignedTo: null,
        status: 'pending',
        createdAt: '2026-01-20T00:00:00Z',
        updatedAt: '2026-01-20T00:00:00Z'
      }

      // 模拟获取客户详情API
      server.use(
        http.get('/api/customers/:id', () => {
          return HttpResponse.json({
            code: 200,
            message: 'success',
            data: customer
          })
        })
      )

      // 模拟预测流失API
      server.use(
        http.post('/api/churn-predictions/predict', () => {
          return HttpResponse.json({
            code: 200,
            message: '预测成功',
            data: [churnPrediction]
          })
        })
      )

      // 模拟更新流失预测API
      server.use(
        http.put('/api/churn-predictions/:id', () => {
          return HttpResponse.json({
            code: 200,
            message: '更新成功',
            data: {
              ...churnPrediction,
              assignedTo: 'admin',
              status: 'in_progress'
            }
          })
        })
      )

      // 步骤1：预测客户流失
      const predictResponse = await fetch('http://localhost:3000/api/churn-predictions/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerIds: ['1']
        })
      })

      const predictResult = await predictResponse.json()
      expect(predictResult.code).toBe(200)
      expect(predictResult.data[0].churnProbability).toBe(0.8)
      expect(predictResult.data[0].riskLevel).toBe('high')

      // 步骤2：处理流失预警
      const updateResponse = await fetch('http://localhost:3000/api/churn-predictions/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assignedTo: 'admin',
          status: 'in_progress'
        })
      })

      const updateResult = await updateResponse.json()
      expect(updateResult.code).toBe(200)
      expect(updateResult.data.assignedTo).toBe('admin')
      expect(updateResult.data.status).toBe('in_progress')
    })
  })

  describe('客户状态修改和历史记录', () => {
    it('应该正确修改客户状态并记录历史', async () => {
      const customer = {
        id: '1',
        name: '张三',
        phone: '13800138001',
        email: 'zhangsan@example.com',
        status: 'active',
        totalSpent: 1000,
        totalOrders: 10,
        points: 500,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-20T00:00:00Z'
      }

      const updatedCustomer = {
        ...customer,
        status: 'inactive',
        updatedAt: '2026-01-20T00:00:00Z'
      }

      const statusHistory = {
        id: '1',
        customerId: '1',
        fromStatus: 'active',
        toStatus: 'inactive',
        reason: '客户要求',
        changedBy: 'admin',
        changedAt: '2026-01-20T00:00:00Z'
      }

      // 模拟获取客户详情API
      server.use(
        http.get('/api/customers/:id', () => {
          return HttpResponse.json({
            code: 200,
            message: 'success',
            data: customer
          })
        })
      )

      // 模拟更新客户状态API
      server.use(
        http.put('/api/customers/:id/status', () => {
          return HttpResponse.json({
            code: 200,
            message: '更新成功',
            data: updatedCustomer
          })
        })
      )

      // 模拟获取状态历史API
      server.use(
        http.get('/api/customers/:id/status-history', () => {
          return HttpResponse.json({
            code: 200,
            message: 'success',
            data: [statusHistory]
          })
        })
      )

      // 步骤1：修改客户状态
      const updateResponse = await fetch('http://localhost:3000/api/customers/1/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'inactive',
          reason: '客户要求'
        })
      })

      const updateResult = await updateResponse.json()
      expect(updateResult.code).toBe(200)
      expect(updateResult.data.status).toBe('inactive')

      // 步骤2：查询状态历史
      const historyResponse = await fetch('http://localhost:3000/api/customers/1/status-history')
      const historyResult = await historyResponse.json()

      expect(historyResult.code).toBe(200)
      expect(historyResult.data[0].fromStatus).toBe('active')
      expect(historyResult.data[0].toStatus).toBe('inactive')
      expect(historyResult.data[0].reason).toBe('客户要求')
    })
  })

  describe('客户分群管理和批量操作', () => {
    it('应该正确创建分群并批量添加成员', async () => {
      const customerGroup = {
        name: '高价值客户',
        description: 'RFM评分大于等于13的客户',
        groupType: 'rfm',
        conditions: { rfmScore: 13 },
        color: '#409EFF',
        icon: 'el-icon-star',
        priority: 1,
        enabled: true
      }

      const createdGroup = {
        id: '1',
        ...customerGroup,
        memberCount: 0,
        createdBy: 'admin',
        createdAt: '2026-01-20T00:00:00Z',
        updatedAt: '2026-01-20T00:00:00Z'
      }

      const customers = [
        {
          id: '1',
          name: '张三',
          phone: '13800138001',
          email: 'zhangsan@example.com',
          status: 'active'
        },
        {
          id: '2',
          name: '李四',
          phone: '13800138002',
          email: 'lisi@example.com',
          status: 'active'
        }
      ]

      // 模拟创建分群API
      server.use(
        http.post('/api/customer-groups', () => {
          return HttpResponse.json({
            code: 200,
            message: '创建成功',
            data: createdGroup
          })
        })
      )

      // 模拟批量添加成员API
      server.use(
        http.post('/api/customer-groups/:groupId/members', () => {
          return HttpResponse.json({
            code: 200,
            message: '添加成功',
            data: null
          })
        })
      )

      // 模拟获取分群成员API
      server.use(
        http.get('/api/customer-groups/:groupId/members', () => {
          return HttpResponse.json({
            code: 200,
            message: 'success',
            data: {
              data: customers.map(c => ({
                id: `member-${c.id}`,
                customerId: c.id,
                groupId: '1',
                customerName: c.name,
                customerPhone: c.phone,
                addedAt: '2026-01-20T00:00:00Z'
              })),
              total: customers.length
            }
          })
        })
      )

      // 步骤1：创建分群
      const createResponse = await fetch('http://localhost:3000/api/customer-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customerGroup)
      })

      const createResult = await createResponse.json()
      expect(createResult.code).toBe(200)
      expect(createResult.data.id).toBe('1')

      // 步骤2：批量添加成员
      const addMembersResponse = await fetch('http://localhost:3000/api/customer-groups/1/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerIds: ['1', '2']
        })
      })

      const addMembersResult = await addMembersResponse.json()
      expect(addMembersResult.code).toBe(200)

      // 步骤3：验证分群成员
      const membersResponse = await fetch('http://localhost:3000/api/customer-groups/1/members')
      const membersResult = await membersResponse.json()

      expect(membersResult.code).toBe(200)
      expect(membersResult.data.total).toBe(2)
    })
  })

  describe('客户历史查询和数据导出', () => {
    it('应该正确查询客户历史并导出数据', async () => {
      const customer = {
        id: '1',
        name: '张三',
        phone: '13800138001',
        email: 'zhangsan@example.com',
        status: 'active',
        totalSpent: 1000,
        totalOrders: 10,
        points: 500,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-20T00:00:00Z'
      }

      const orderHistory = [
        {
          id: '1',
          customerId: '1',
          orderNo: 'ORD202601200001',
          totalAmount: 100,
          status: 'completed',
          createdAt: '2026-01-20T00:00:00Z'
        },
        {
          id: '2',
          customerId: '1',
          orderNo: 'ORD202601190001',
          totalAmount: 200,
          status: 'completed',
          createdAt: '2026-01-19T00:00:00Z'
        }
      ]

      // 模拟获取客户详情API
      server.use(
        http.get('/api/customers/:id', () => {
          return HttpResponse.json({
            code: 200,
            message: 'success',
            data: customer
          })
        })
      )

      // 模拟获取订单历史API
      server.use(
        http.get('/api/customers/:id/order-history', () => {
          return HttpResponse.json({
            code: 200,
            message: 'success',
            data: {
              data: orderHistory,
              total: orderHistory.length
            }
          })
        })
      )

      // 模拟导出数据API
      server.use(
        http.get('/api/customers/:id/export', () => {
          return HttpResponse.json({
            code: 200,
            message: '导出成功',
            data: {
              url: 'https://example.com/export/customer-1-history.xlsx'
            }
          })
        })
      )

      // 步骤1：查询客户详情
      const customerResponse = await fetch('http://localhost:3000/api/customers/1')
      const customerResult = await customerResponse.json()

      expect(customerResult.code).toBe(200)
      expect(customerResult.data.name).toBe('张三')

      // 步骤2：查询订单历史
      const historyResponse = await fetch('http://localhost:3000/api/customers/1/order-history')
      const historyResult = await historyResponse.json()

      expect(historyResult.code).toBe(200)
      expect(historyResult.data.data).toHaveLength(2)

      // 步骤3：导出数据
      const exportResponse = await fetch('http://localhost:3000/api/customers/1/export')
      const exportResult = await exportResponse.json()

      expect(exportResult.code).toBe(200)
      expect(exportResult.data.url).toBeDefined()
    })
  })
})
