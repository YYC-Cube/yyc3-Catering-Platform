/**
 * YYC³餐饮行业智能化平台 - 生命周期规则引擎单元测试
 * @fileoverview 测试生命周期规则引擎的各种功能
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-20
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useLifecycleRuleEngine } from '@/composables/useLifecycleRuleEngine'

// 模拟客户服务
const mockCustomerService = {
  getCustomer: vi.fn(),
  getAllCustomers: vi.fn()
}

// 模拟生命周期服务
const mockLifecycleService = {
  getLifecycle: vi.fn(),
  updateLifecycleStage: vi.fn()
}

// 模拟RFM服务
const mockRFMService = {
  getLatestRFMScore: vi.fn()
}

// 模拟事件总线
const mockEventBus = {
  on: vi.fn(),
  emit: vi.fn()
}

// 模拟工具函数
const mockGetDaysSince = vi.fn((date) => {
  if (!date) return 999
  const now = new Date()
  const target = new Date(date)
  const diffTime = Math.abs(now.getTime() - target.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

const mockGenerateId = vi.fn(() => 'test-id')

// 模拟生命周期阶段
const LIFECYCLE_STAGES = {
  POTENTIAL: 'potential',
  NEW: 'new',
  ACTIVE: 'active',
  LOYAL: 'loyal',
  DORMANT: 'dormant',
  CHURNED: 'churned'
}

describe('useLifecycleRuleEngine', () => {
  let ruleEngine: ReturnType<typeof useLifecycleRuleEngine>

  beforeEach(() => {
    vi.clearAllMocks()
    
    ruleEngine = useLifecycleRuleEngine({
      customerService: mockCustomerService,
      lifecycleService: mockLifecycleService,
      rfmService: mockRFMService,
      eventBus: mockEventBus,
      getDaysSince: mockGetDaysSince,
      generateId: mockGenerateId
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('初始化', () => {
    it('应该正确初始化规则引擎', () => {
      expect(ruleEngine).toBeDefined()
      expect(ruleEngine.rules).toBeDefined()
      expect(Array.isArray(ruleEngine.rules)).toBe(true)
    })

    it('应该初始化默认规则', () => {
      expect(ruleEngine.rules.length).toBeGreaterThan(0)
      
      const firstOrderRule = ruleEngine.rules.find(r => r.id === 'rule-001')
      expect(firstOrderRule).toBeDefined()
      expect(firstOrderRule?.name).toBe('首次下单转化')
      expect(firstOrderRule?.fromStages).toContain(LIFECYCLE_STAGES.POTENTIAL)
      expect(firstOrderRule?.toStage).toBe(LIFECYCLE_STAGES.NEW)
    })

    it('应该设置事件监听器', () => {
      expect(mockEventBus.on).toHaveBeenCalledWith('order.created', expect.any(Function))
      expect(mockEventBus.on).toHaveBeenCalledWith('customer.registered', expect.any(Function))
      expect(mockEventBus.on).toHaveBeenCalledWith('time.check', expect.any(Function))
    })
  })

  describe('订单事件处理', () => {
    it('应该正确处理首次下单事件', async () => {
      const customer = {
        id: '1',
        name: '张三',
        totalOrders: 1,
        firstOrderAt: new Date('2026-01-20'),
        lastOrderAt: new Date('2026-01-20')
      }

      const lifecycle = {
        id: '1',
        customerId: '1',
        currentStage: LIFECYCLE_STAGES.POTENTIAL,
        previousStage: null,
        stageChangedAt: new Date('2026-01-01'),
        daysInCurrentStage: 20,
        totalDaysInLifecycle: 20
      }

      mockCustomerService.getCustomer.mockResolvedValue(customer)
      mockLifecycleService.getLifecycle.mockResolvedValue(lifecycle)
      mockLifecycleService.updateLifecycleStage.mockResolvedValue({
        ...lifecycle,
        currentStage: LIFECYCLE_STAGES.NEW,
        previousStage: LIFECYCLE_STAGES.POTENTIAL
      })

      const event = {
        type: 'order.created',
        customerId: '1',
        isFirstOrder: true
      }

      await ruleEngine.handleOrderCreated(event)

      expect(mockCustomerService.getCustomer).toHaveBeenCalledWith('1')
      expect(mockLifecycleService.getLifecycle).toHaveBeenCalledWith('1')
      expect(mockLifecycleService.updateLifecycleStage).toHaveBeenCalledWith(
        '1',
        LIFECYCLE_STAGES.NEW,
        '首次下单转化'
      )
      expect(mockEventBus.emit).toHaveBeenCalledWith('lifecycle.transition', expect.any(Object))
    })

    it('应该正确处理活跃客户转化事件', async () => {
      const customer = {
        id: '2',
        name: '李四',
        totalOrders: 3,
        firstOrderAt: new Date('2026-01-01'),
        lastOrderAt: new Date('2026-01-20')
      }

      const lifecycle = {
        id: '2',
        customerId: '2',
        currentStage: LIFECYCLE_STAGES.NEW,
        previousStage: LIFECYCLE_STAGES.POTENTIAL,
        stageChangedAt: new Date('2026-01-01'),
        daysInCurrentStage: 20,
        totalDaysInLifecycle: 20
      }

      mockCustomerService.getCustomer.mockResolvedValue(customer)
      mockLifecycleService.getLifecycle.mockResolvedValue(lifecycle)
      mockLifecycleService.updateLifecycleStage.mockResolvedValue({
        ...lifecycle,
        currentStage: LIFECYCLE_STAGES.ACTIVE,
        previousStage: LIFECYCLE_STAGES.NEW
      })

      const event = {
        type: 'order.created',
        customerId: '2',
        isFirstOrder: false
      }

      await ruleEngine.handleOrderCreated(event)

      expect(mockLifecycleService.updateLifecycleStage).toHaveBeenCalledWith(
        '2',
        LIFECYCLE_STAGES.ACTIVE,
        '活跃客户转化'
      )
    })

    it('应该正确处理忠诚客户转化事件', async () => {
      const customer = {
        id: '3',
        name: '王五',
        totalOrders: 15,
        firstOrderAt: new Date('2025-01-01'),
        lastOrderAt: new Date('2026-01-20')
      }

      const lifecycle = {
        id: '3',
        customerId: '3',
        currentStage: LIFECYCLE_STAGES.ACTIVE,
        previousStage: LIFECYCLE_STAGES.NEW,
        stageChangedAt: new Date('2025-06-01'),
        daysInCurrentStage: 200,
        totalDaysInLifecycle: 400
      }

      const rfmScore = {
        customerId: '3',
        recencyScore: 5,
        frequencyScore: 5,
        monetaryScore: 5,
        rfmScore: 15,
        customerLevel: '超级VIP'
      }

      mockCustomerService.getCustomer.mockResolvedValue(customer)
      mockLifecycleService.getLifecycle.mockResolvedValue(lifecycle)
      mockRFMService.getLatestRFMScore.mockResolvedValue(rfmScore)
      mockLifecycleService.updateLifecycleStage.mockResolvedValue({
        ...lifecycle,
        currentStage: LIFECYCLE_STAGES.LOYAL,
        previousStage: LIFECYCLE_STAGES.ACTIVE
      })

      const event = {
        type: 'order.created',
        customerId: '3',
        isFirstOrder: false
      }

      await ruleEngine.handleOrderCreated(event)

      expect(mockRFMService.getLatestRFMScore).toHaveBeenCalledWith('3')
      expect(mockLifecycleService.updateLifecycleStage).toHaveBeenCalledWith(
        '3',
        LIFECYCLE_STAGES.LOYAL,
        '忠诚客户转化'
      )
    })
  })

  describe('时间检查', () => {
    it('应该正确处理休眠客户转化', async () => {
      const customers = [
        {
          id: '4',
          name: '赵六',
          totalOrders: 10,
          lastOrderAt: new Date('2025-11-20')
        }
      ]

      const lifecycle = {
        id: '4',
        customerId: '4',
        currentStage: LIFECYCLE_STAGES.ACTIVE,
        previousStage: LIFECYCLE_STAGES.NEW,
        stageChangedAt: new Date('2025-11-20'),
        daysInCurrentStage: 60,
        totalDaysInLifecycle: 300
      }

      mockCustomerService.getAllCustomers.mockResolvedValue(customers)
      mockLifecycleService.getLifecycle.mockResolvedValue(lifecycle)
      mockLifecycleService.updateLifecycleStage.mockResolvedValue({
        ...lifecycle,
        currentStage: LIFECYCLE_STAGES.DORMANT,
        previousStage: LIFECYCLE_STAGES.ACTIVE
      })

      await ruleEngine.handleTimeCheck()

      expect(mockCustomerService.getAllCustomers).toHaveBeenCalled()
      expect(mockLifecycleService.updateLifecycleStage).toHaveBeenCalledWith(
        '4',
        LIFECYCLE_STAGES.DORMANT,
        '休眠客户转化'
      )
    })

    it('应该正确处理流失客户转化', async () => {
      const customers = [
        {
          id: '5',
          name: '钱七',
          totalOrders: 5,
          lastOrderAt: new Date('2025-10-20')
        }
      ]

      const lifecycle = {
        id: '5',
        customerId: '5',
        currentStage: LIFECYCLE_STAGES.DORMANT,
        previousStage: LIFECYCLE_STAGES.ACTIVE,
        stageChangedAt: new Date('2025-10-20'),
        daysInCurrentStage: 90,
        totalDaysInLifecycle: 400
      }

      mockCustomerService.getAllCustomers.mockResolvedValue(customers)
      mockLifecycleService.getLifecycle.mockResolvedValue(lifecycle)
      mockLifecycleService.updateLifecycleStage.mockResolvedValue({
        ...lifecycle,
        currentStage: LIFECYCLE_STAGES.CHURNED,
        previousStage: LIFECYCLE_STAGES.DORMANT
      })

      await ruleEngine.handleTimeCheck()

      expect(mockLifecycleService.updateLifecycleStage).toHaveBeenCalledWith(
        '5',
        LIFECYCLE_STAGES.CHURNED,
        '流失客户转化'
      )
    })

    it('应该正确处理休眠客户激活', async () => {
      const customers = [
        {
          id: '6',
          name: '孙八',
          totalOrders: 3,
          lastOrderAt: new Date('2026-01-19')
        }
      ]

      const lifecycle = {
        id: '6',
        customerId: '6',
        currentStage: LIFECYCLE_STAGES.DORMANT,
        previousStage: LIFECYCLE_STAGES.ACTIVE,
        stageChangedAt: new Date('2025-12-01'),
        daysInCurrentStage: 50,
        totalDaysInLifecycle: 200
      }

      mockCustomerService.getAllCustomers.mockResolvedValue(customers)
      mockLifecycleService.getLifecycle.mockResolvedValue(lifecycle)
      mockLifecycleService.updateLifecycleStage.mockResolvedValue({
        ...lifecycle,
        currentStage: LIFECYCLE_STAGES.ACTIVE,
        previousStage: LIFECYCLE_STAGES.DORMANT
      })

      await ruleEngine.handleTimeCheck()

      expect(mockLifecycleService.updateLifecycleStage).toHaveBeenCalledWith(
        '6',
        LIFECYCLE_STAGES.ACTIVE,
        '休眠客户激活'
      )
    })
  })

  describe('手动转换', () => {
    it('应该正确执行手动转换', async () => {
      const customer = {
        id: '7',
        name: '周九',
        totalOrders: 5,
        lastOrderAt: new Date('2026-01-20')
      }

      const lifecycle = {
        id: '7',
        customerId: '7',
        currentStage: LIFECYCLE_STAGES.ACTIVE,
        previousStage: LIFECYCLE_STAGES.NEW,
        stageChangedAt: new Date('2026-01-01'),
        daysInCurrentStage: 20,
        totalDaysInLifecycle: 100
      }

      mockCustomerService.getCustomer.mockResolvedValue(customer)
      mockLifecycleService.getLifecycle.mockResolvedValue(lifecycle)
      mockLifecycleService.updateLifecycleStage.mockResolvedValue({
        ...lifecycle,
        currentStage: LIFECYCLE_STAGES.LOYAL,
        previousStage: LIFECYCLE_STAGES.ACTIVE
      })

      await ruleEngine.manualTransition('7', LIFECYCLE_STAGES.LOYAL, '手动提升为忠诚客户')

      expect(mockCustomerService.getCustomer).toHaveBeenCalledWith('7')
      expect(mockLifecycleService.getLifecycle).toHaveBeenCalledWith('7')
      expect(mockLifecycleService.updateLifecycleStage).toHaveBeenCalledWith(
        '7',
        LIFECYCLE_STAGES.LOYAL,
        '手动提升为忠诚客户'
      )
      expect(mockEventBus.emit).toHaveBeenCalledWith('lifecycle.transition', expect.objectContaining({
        customerId: '7',
        fromStage: LIFECYCLE_STAGES.ACTIVE,
        toStage: LIFECYCLE_STAGES.LOYAL,
        triggeredBy: 'manual'
      }))
    })
  })

  describe('规则管理', () => {
    it('应该正确添加新规则', () => {
      const newRule = {
        id: 'rule-007',
        name: '测试规则',
        description: '测试规则描述',
        triggerType: 'event' as const,
        triggerCondition: { eventType: 'test.event' },
        fromStages: [LIFECYCLE_STAGES.ACTIVE],
        toStage: LIFECYCLE_STAGES.LOYAL,
        priority: 7,
        enabled: true
      }

      ruleEngine.addRule(newRule)

      expect(ruleEngine.rules).toContainEqual(newRule)
    })

    it('应该正确更新规则', () => {
      const updatedRule = {
        id: 'rule-001',
        name: '更新后的首次下单转化',
        description: '更新后的描述',
        triggerType: 'event' as const,
        triggerCondition: { eventType: 'order.created', isFirstOrder: true },
        fromStages: [LIFECYCLE_STAGES.POTENTIAL],
        toStage: LIFECYCLE_STAGES.NEW,
        priority: 1,
        enabled: false
      }

      ruleEngine.updateRule('rule-001', updatedRule)

      const rule = ruleEngine.rules.find(r => r.id === 'rule-001')
      expect(rule).toEqual(updatedRule)
    })

    it('应该正确删除规则', () => {
      const initialLength = ruleEngine.rules.length
      ruleEngine.removeRule('rule-001')

      expect(ruleEngine.rules.length).toBe(initialLength - 1)
      expect(ruleEngine.rules.find(r => r.id === 'rule-001')).toBeUndefined()
    })

    it('应该正确启用/禁用规则', () => {
      ruleEngine.toggleRule('rule-001', false)

      const rule = ruleEngine.rules.find(r => r.id === 'rule-001')
      expect(rule?.enabled).toBe(false)

      ruleEngine.toggleRule('rule-001', true)

      expect(rule?.enabled).toBe(true)
    })
  })

  describe('规则匹配', () => {
    it('应该正确匹配适用的规则', async () => {
      const customer = {
        id: '1',
        name: '张三',
        totalOrders: 1,
        firstOrderAt: new Date('2026-01-20'),
        lastOrderAt: new Date('2026-01-20')
      }

      const lifecycle = {
        id: '1',
        customerId: '1',
        currentStage: LIFECYCLE_STAGES.POTENTIAL,
        previousStage: null,
        stageChangedAt: new Date('2026-01-01'),
        daysInCurrentStage: 20,
        totalDaysInLifecycle: 20
      }

      const event = {
        type: 'order.created',
        customerId: '1',
        isFirstOrder: true
      }

      const applicableRules = await ruleEngine.findApplicableRules(event, customer, lifecycle)

      expect(applicableRules.length).toBeGreaterThan(0)
      expect(applicableRules[0].id).toBe('rule-001')
    })

    it('应该按优先级排序规则', async () => {
      const customer = {
        id: '2',
        name: '李四',
        totalOrders: 20,
        firstOrderAt: new Date('2025-01-01'),
        lastOrderAt: new Date('2026-01-20')
      }

      const lifecycle = {
        id: '2',
        customerId: '2',
        currentStage: LIFECYCLE_STAGES.ACTIVE,
        previousStage: LIFECYCLE_STAGES.NEW,
        stageChangedAt: new Date('2025-06-01'),
        daysInCurrentStage: 200,
        totalDaysInLifecycle: 400
      }

      const rfmScore = {
        customerId: '2',
        recencyScore: 5,
        frequencyScore: 5,
        monetaryScore: 5,
        rfmScore: 15,
        customerLevel: '超级VIP'
      }

      const event = {
        type: 'order.created',
        customerId: '2',
        isFirstOrder: false
      }

      mockRFMService.getLatestRFMScore.mockResolvedValue(rfmScore)

      const applicableRules = await ruleEngine.findApplicableRules(event, customer, lifecycle)

      if (applicableRules.length > 1) {
        for (let i = 0; i < applicableRules.length - 1; i++) {
          expect(applicableRules[i].priority).toBeLessThanOrEqual(applicableRules[i + 1].priority)
        }
      }
    })
  })
})
