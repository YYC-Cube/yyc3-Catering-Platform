/**
 * YYC³餐饮行业智能化平台 - 智能客户关怀单元测试
 * @fileoverview 测试智能客户关怀系统的各种功能
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-20
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useCareReminder } from '@/composables/useCareReminder'

// 模拟客户服务
const mockCustomerService = {
  getCustomer: vi.fn(),
  getAllCustomers: vi.fn()
}

// 模拟提醒仓库
const mockReminderRepository = {
  save: vi.fn(),
  findById: vi.fn(),
  findByDateRange: vi.fn()
}

// 模拟短信服务
const mockSMSService = {
  send: vi.fn()
}

// 模拟邮件服务
const mockEmailService = {
  send: vi.fn()
}

// 模拟推送服务
const mockPushService = {
  send: vi.fn()
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

describe('useCareReminder', () => {
  let careReminder: ReturnType<typeof useCareReminder>

  beforeEach(() => {
    vi.clearAllMocks()
    
    careReminder = useCareReminder({
      customerService: mockCustomerService,
      reminderRepository: mockReminderRepository,
      smsService: mockSMSService,
      emailService: mockEmailService,
      pushService: mockPushService,
      eventBus: mockEventBus,
      getDaysSince: mockGetDaysSince,
      generateId: mockGenerateId
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('初始化', () => {
    it('应该正确初始化关怀提醒系统', () => {
      expect(careReminder).toBeDefined()
      expect(careReminder.rules).toBeDefined()
      expect(Array.isArray(careReminder.rules)).toBe(true)
    })

    it('应该初始化默认规则', () => {
      expect(careReminder.rules.length).toBeGreaterThan(0)
      
      const revisitRule = careReminder.rules.find(r => r.id === 'rule-001')
      expect(revisitRule).toBeDefined()
      expect(revisitRule?.name).toBe('7天未消费关怀')
      expect(revisitRule?.reminderType).toBe('revisit')
    })

    it('应该设置事件监听器', () => {
      expect(mockEventBus.on).toHaveBeenCalledWith('order.completed', expect.any(Function))
      expect(mockEventBus.on).toHaveBeenCalledWith('level.upgraded', expect.any(Function))
      expect(mockEventBus.on).toHaveBeenCalledWith('time.check', expect.any(Function))
    })
  })

  describe('订单完成事件处理', () => {
    it('应该正确处理订单完成事件', async () => {
      const customer = {
        id: '1',
        name: '张三',
        phone: '13800138001',
        email: 'zhangsan@example.com',
        lastOrderAt: new Date('2026-01-20')
      }

      mockCustomerService.getCustomer.mockResolvedValue(customer)
      mockReminderRepository.save.mockResolvedValue(customer)

      const event = {
        type: 'order.completed',
        customerId: '1',
        orderId: '1'
      }

      await careReminder.handleOrderCompleted(event)

      expect(mockCustomerService.getCustomer).toHaveBeenCalledWith('1')
      expect(mockReminderRepository.save).toHaveBeenCalled()
    })

    it('应该为订单完成创建感谢提醒', async () => {
      const customer = {
        id: '1',
        name: '张三',
        phone: '13800138001',
        email: 'zhangsan@example.com',
        lastOrderAt: new Date('2026-01-20')
      }

      mockCustomerService.getCustomer.mockResolvedValue(customer)
      mockReminderRepository.save.mockResolvedValue(customer)

      const event = {
        type: 'order.completed',
        customerId: '1',
        orderId: '1'
      }

      await careReminder.handleOrderCompleted(event)

      expect(mockReminderRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: '1',
          reminderType: 'thankyou',
          title: '消费后关怀'
        })
      )
    })
  })

  describe('会员升级事件处理', () => {
    it('应该正确处理会员升级事件', async () => {
      const customer = {
        id: '2',
        name: '李四',
        phone: '13800138002',
        email: 'lisi@example.com',
        lastOrderAt: new Date('2026-01-20')
      }

      mockCustomerService.getCustomer.mockResolvedValue(customer)
      mockReminderRepository.save.mockResolvedValue(customer)

      const event = {
        type: 'level.upgraded',
        customerId: '2',
        oldLevel: '会员',
        newLevel: 'VIP'
      }

      await careReminder.handleLevelUpgraded(event)

      expect(mockCustomerService.getCustomer).toHaveBeenCalledWith('2')
      expect(mockReminderRepository.save).toHaveBeenCalled()
    })

    it('应该为会员升级创建祝贺提醒', async () => {
      const customer = {
        id: '2',
        name: '李四',
        phone: '13800138002',
        email: 'lisi@example.com',
        lastOrderAt: new Date('2026-01-20')
      }

      mockCustomerService.getCustomer.mockResolvedValue(customer)
      mockReminderRepository.save.mockResolvedValue(customer)

      const event = {
        type: 'level.upgraded',
        customerId: '2',
        oldLevel: '会员',
        newLevel: 'VIP'
      }

      await careReminder.handleLevelUpgraded(event)

      expect(mockReminderRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: '2',
          reminderType: 'upgrade',
          title: '会员升级关怀',
          content: expect.stringContaining('VIP')
        })
      )
    })
  })

  describe('时间检查', () => {
    it('应该正确处理7天未消费提醒', async () => {
      const customers = [
        {
          id: '3',
          name: '王五',
          phone: '13800138003',
          email: 'wangwu@example.com',
          lastOrderAt: new Date('2026-01-13')
        }
      ]

      mockCustomerService.getAllCustomers.mockResolvedValue(customers)
      mockReminderRepository.save.mockResolvedValue(customers[0])

      await careReminder.handleTimeCheck()

      expect(mockCustomerService.getAllCustomers).toHaveBeenCalled()
      expect(mockReminderRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: '3',
          reminderType: 'revisit',
          title: '7天未消费关怀'
        })
      )
    })

    it('应该正确处理30天未消费提醒', async () => {
      const customers = [
        {
          id: '4',
          name: '赵六',
          phone: '13800138004',
          email: 'zhaoliu@example.com',
          lastOrderAt: new Date('2025-12-21')
        }
      ]

      mockCustomerService.getAllCustomers.mockResolvedValue(customers)
      mockReminderRepository.save.mockResolvedValue(customers[0])

      await careReminder.handleTimeCheck()

      expect(mockReminderRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: '4',
          reminderType: 'reactivation',
          title: '30天未消费关怀'
        })
      )
    })

    it('应该正确处理生日提醒', async () => {
      const today = new Date()
      const birthday = new Date(today.getFullYear(), today.getMonth(), today.getDate())

      const customers = [
        {
          id: '5',
          name: '钱七',
          phone: '13800138005',
          email: 'qianqi@example.com',
          birthday: birthday.toISOString(),
          lastOrderAt: new Date('2026-01-20')
        }
      ]

      mockCustomerService.getAllCustomers.mockResolvedValue(customers)
      mockReminderRepository.save.mockResolvedValue(customers[0])

      await careReminder.handleTimeCheck()

      expect(mockReminderRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: '5',
          reminderType: 'birthday',
          title: '生日关怀'
        })
      )
    })
  })

  describe('提醒创建', () => {
    it('应该正确创建提醒', async () => {
      const customer = {
        id: '6',
        name: '孙八',
        phone: '13800138006',
        email: 'sunba@example.com',
        lastOrderAt: new Date('2026-01-13')
      }

      const rule = {
        id: 'rule-001',
        name: '7天未消费关怀',
        description: '客户7天未消费时发送关怀短信',
        triggerType: 'time' as const,
        triggerCondition: { daysSinceLastOrder: 7 },
        reminderType: 'revisit',
        channel: 'sms' as const,
        template: '亲爱的{name}，您已经{days}天没有光顾了，我们想念您！',
        priority: 'medium' as const,
        enabled: true
      }

      mockReminderRepository.save.mockResolvedValue(customer)

      const reminder = await careReminder.createReminder(customer, rule)

      expect(reminder.customerId).toBe('6')
      expect(reminder.reminderType).toBe('revisit')
      expect(reminder.title).toBe('7天未消费关怀')
      expect(reminder.channel).toBe('sms')
      expect(reminder.priority).toBe('medium')
      expect(reminder.status).toBe('pending')
      expect(mockReminderRepository.save).toHaveBeenCalledWith(reminder)
    })

    it('应该正确替换模板变量', async () => {
      const customer = {
        id: '7',
        name: '周九',
        phone: '13800138007',
        email: 'zhoujiu@example.com',
        lastOrderAt: new Date('2026-01-13')
      }

      const rule = {
        id: 'rule-001',
        name: '7天未消费关怀',
        description: '客户7天未消费时发送关怀短信',
        triggerType: 'time' as const,
        triggerCondition: { daysSinceLastOrder: 7 },
        reminderType: 'revisit',
        channel: 'sms' as const,
        template: '亲爱的{name}，您已经{days}天没有光顾了，我们想念您！',
        priority: 'medium' as const,
        enabled: true
      }

      mockReminderRepository.save.mockResolvedValue(customer)

      const reminder = await careReminder.createReminder(customer, rule)

      expect(reminder.content).toContain('周九')
      expect(reminder.content).toContain('7')
    })
  })

  describe('提醒发送', () => {
    it('应该正确发送短信提醒', async () => {
      const reminder = {
        id: '1',
        customerId: '1',
        customerName: '张三',
        customerPhone: '13800138001',
        reminderType: 'revisit',
        title: '7天未消费关怀',
        content: '亲爱的张三，您已经7天没有光顾了，我们想念您！',
        channel: 'sms' as const,
        priority: 'medium' as const,
        scheduledAt: new Date('2026-01-20'),
        sentAt: null,
        status: 'pending',
        result: null,
        createdAt: new Date('2026-01-20')
      }

      mockReminderRepository.findById.mockResolvedValue(reminder)
      mockSMSService.send.mockResolvedValue({ success: true })
      mockReminderRepository.save.mockResolvedValue(reminder)

      const result = await careReminder.sendReminder('1')

      expect(mockSMSService.send).toHaveBeenCalledWith('13800138001', reminder.content)
      expect(result.status).toBe('sent')
      expect(result.sentAt).toBeDefined()
      expect(mockReminderRepository.save).toHaveBeenCalledWith(result)
    })

    it('应该正确发送邮件提醒', async () => {
      const reminder = {
        id: '2',
        customerId: '2',
        customerName: '李四',
        customerPhone: 'lisi@example.com',
        reminderType: 'reactivation',
        title: '30天未消费关怀',
        content: '亲爱的李四，您已经30天没有光顾了，特为您准备了一份专属优惠券！',
        channel: 'email' as const,
        priority: 'high' as const,
        scheduledAt: new Date('2026-01-20'),
        sentAt: null,
        status: 'pending',
        result: null,
        createdAt: new Date('2026-01-20')
      }

      mockReminderRepository.findById.mockResolvedValue(reminder)
      mockEmailService.send.mockResolvedValue({ success: true })
      mockReminderRepository.save.mockResolvedValue(reminder)

      const result = await careReminder.sendReminder('2')

      expect(mockEmailService.send).toHaveBeenCalledWith('lisi@example.com', reminder.title, reminder.content)
      expect(result.status).toBe('sent')
    })

    it('应该正确发送推送提醒', async () => {
      const reminder = {
        id: '3',
        customerId: '3',
        customerName: '王五',
        customerPhone: '13800138003',
        reminderType: 'birthday',
        title: '生日关怀',
        content: '亲爱的王五，祝您生日快乐！特为您准备了生日专属优惠！',
        channel: 'push' as const,
        priority: 'high' as const,
        scheduledAt: new Date('2026-01-20'),
        sentAt: null,
        status: 'pending',
        result: null,
        createdAt: new Date('2026-01-20')
      }

      mockReminderRepository.findById.mockResolvedValue(reminder)
      mockPushService.send.mockResolvedValue({ success: true })
      mockReminderRepository.save.mockResolvedValue(reminder)

      const result = await careReminder.sendReminder('3')

      expect(mockPushService.send).toHaveBeenCalledWith('3', reminder.title, reminder.content)
      expect(result.status).toBe('sent')
    })

    it('应该正确处理不存在的提醒', async () => {
      mockReminderRepository.findById.mockResolvedValue(null)

      await expect(careReminder.sendReminder('999')).rejects.toThrow('提醒不存在')
    })

    it('应该正确处理不支持的发送渠道', async () => {
      const reminder = {
        id: '4',
        customerId: '4',
        customerName: '赵六',
        customerPhone: '13800138004',
        reminderType: 'test',
        title: '测试提醒',
        content: '测试内容',
        channel: 'invalid' as any,
        priority: 'low' as const,
        scheduledAt: new Date('2026-01-20'),
        sentAt: null,
        status: 'pending',
        result: null,
        createdAt: new Date('2026-01-20')
      }

      mockReminderRepository.findById.mockResolvedValue(reminder)

      await expect(careReminder.sendReminder('4')).rejects.toThrow('不支持的发送渠道')
    })
  })

  describe('提醒统计', () => {
    it('应该正确计算提醒统计信息', async () => {
      const reminders = [
        {
          id: '1',
          customerId: '1',
          customerName: '张三',
          customerPhone: '13800138001',
          reminderType: 'revisit',
          title: '7天未消费关怀',
          content: '亲爱的张三，您已经7天没有光顾了，我们想念您！',
          channel: 'sms' as const,
          priority: 'medium' as const,
          scheduledAt: new Date('2026-01-20'),
          sentAt: new Date('2026-01-20'),
          status: 'sent',
          result: { success: true },
          createdAt: new Date('2026-01-20')
        },
        {
          id: '2',
          customerId: '2',
          customerName: '李四',
          customerPhone: '13800138002',
          reminderType: 'reactivation',
          title: '30天未消费关怀',
          content: '亲爱的李四，您已经30天没有光顾了，特为您准备了一份专属优惠券！',
          channel: 'sms' as const,
          priority: 'high' as const,
          scheduledAt: new Date('2026-01-20'),
          sentAt: null,
          status: 'pending',
          result: null,
          createdAt: new Date('2026-01-20')
        },
        {
          id: '3',
          customerId: '3',
          customerName: '王五',
          customerPhone: '13800138003',
          reminderType: 'birthday',
          title: '生日关怀',
          content: '亲爱的王五，祝您生日快乐！特为您准备了生日专属优惠！',
          channel: 'email' as const,
          priority: 'low' as const,
          scheduledAt: new Date('2026-01-20'),
          sentAt: new Date('2026-01-20'),
          status: 'failed',
          result: { success: false, error: '发送失败' },
          createdAt: new Date('2026-01-20')
        }
      ]

      mockReminderRepository.findByDateRange.mockResolvedValue(reminders)

      const statistics = await careReminder.getReminderStatistics()

      expect(statistics.totalReminders).toBe(3)
      expect(statistics.pendingCount).toBe(1)
      expect(statistics.sentCount).toBe(1)
      expect(statistics.failedCount).toBe(1)
      expect(statistics.highPriorityCount).toBe(1)
      expect(statistics.mediumPriorityCount).toBe(1)
      expect(statistics.lowPriorityCount).toBe(1)
    })

    it('应该正确计算最常用的提醒类型', async () => {
      const reminders = [
        {
          id: '1',
          customerId: '1',
          customerName: '张三',
          customerPhone: '13800138001',
          reminderType: 'revisit',
          title: '7天未消费关怀',
          content: '亲爱的张三，您已经7天没有光顾了，我们想念您！',
          channel: 'sms' as const,
          priority: 'medium' as const,
          scheduledAt: new Date('2026-01-20'),
          sentAt: new Date('2026-01-20'),
          status: 'sent',
          result: { success: true },
          createdAt: new Date('2026-01-20')
        },
        {
          id: '2',
          customerId: '2',
          customerName: '李四',
          customerPhone: '13800138002',
          reminderType: 'revisit',
          title: '7天未消费关怀',
          content: '亲爱的李四，您已经7天没有光顾了，我们想念您！',
          channel: 'sms' as const,
          priority: 'medium' as const,
          scheduledAt: new Date('2026-01-20'),
          sentAt: new Date('2026-01-20'),
          status: 'sent',
          result: { success: true },
          createdAt: new Date('2026-01-20')
        },
        {
          id: '3',
          customerId: '3',
          customerName: '王五',
          customerPhone: '13800138003',
          reminderType: 'reactivation',
          title: '30天未消费关怀',
          content: '亲爱的王五，您已经30天没有光顾了，特为您准备了一份专属优惠券！',
          channel: 'sms' as const,
          priority: 'high' as const,
          scheduledAt: new Date('2026-01-20'),
          sentAt: new Date('2026-01-20'),
          status: 'sent',
          result: { success: true },
          createdAt: new Date('2026-01-20')
        }
      ]

      mockReminderRepository.findByDateRange.mockResolvedValue(reminders)

      const statistics = await careReminder.getReminderStatistics()

      expect(statistics.topUsedTypes).toBeDefined()
      expect(Array.isArray(statistics.topUsedTypes)).toBe(true)
      expect(statistics.topUsedTypes[0].type).toBe('revisit')
      expect(statistics.topUsedTypes[0].count).toBe(2)
    })
  })

  describe('规则管理', () => {
    it('应该正确添加新规则', () => {
      const newRule = {
        id: 'rule-006',
        name: '测试规则',
        description: '测试规则描述',
        triggerType: 'time' as const,
        triggerCondition: { daysSinceLastOrder: 14 },
        reminderType: 'test',
        channel: 'sms' as const,
        template: '测试模板',
        priority: 'medium' as const,
        enabled: true
      }

      careReminder.addRule(newRule)

      expect(careReminder.rules).toContainEqual(newRule)
    })

    it('应该正确更新规则', () => {
      const updatedRule = {
        id: 'rule-001',
        name: '更新后的7天未消费关怀',
        description: '更新后的描述',
        triggerType: 'time' as const,
        triggerCondition: { daysSinceLastOrder: 7 },
        reminderType: 'revisit',
        channel: 'sms' as const,
        template: '更新后的模板',
        priority: 'medium' as const,
        enabled: false
      }

      careReminder.updateRule('rule-001', updatedRule)

      const rule = careReminder.rules.find(r => r.id === 'rule-001')
      expect(rule).toEqual(updatedRule)
    })

    it('应该正确删除规则', () => {
      const initialLength = careReminder.rules.length
      careReminder.removeRule('rule-001')

      expect(careReminder.rules.length).toBe(initialLength - 1)
      expect(careReminder.rules.find(r => r.id === 'rule-001')).toBeUndefined()
    })

    it('应该正确启用/禁用规则', () => {
      careReminder.toggleRule('rule-001', false)

      const rule = careReminder.rules.find(r => r.id === 'rule-001')
      expect(rule?.enabled).toBe(false)

      careReminder.toggleRule('rule-001', true)

      expect(rule?.enabled).toBe(true)
    })
  })

  describe('时间条件检查', () => {
    it('应该正确检查天数条件', () => {
      const customer = {
        id: '1',
        name: '张三',
        phone: '13800138001',
        email: 'zhangsan@example.com',
        lastOrderAt: new Date('2026-01-13')
      }

      const rule = {
        id: 'rule-001',
        name: '7天未消费关怀',
        description: '客户7天未消费时发送关怀短信',
        triggerType: 'time' as const,
        triggerCondition: { daysSinceLastOrder: 7 },
        reminderType: 'revisit',
        channel: 'sms' as const,
        template: '亲爱的{name}，您已经{days}天没有光顾了，我们想念您！',
        priority: 'medium' as const,
        enabled: true
      }

      const result = careReminder.checkTimeCondition(rule, customer)

      expect(result).toBe(true)
    })

    it('应该正确检查生日条件', () => {
      const today = new Date()
      const birthday = new Date(today.getFullYear(), today.getMonth(), today.getDate())

      const customer = {
        id: '2',
        name: '李四',
        phone: '13800138002',
        email: 'lisi@example.com',
        birthday: birthday.toISOString(),
        lastOrderAt: new Date('2026-01-20')
      }

      const rule = {
        id: 'rule-003',
        name: '生日关怀',
        description: '客户生日当天发送祝福',
        triggerType: 'time' as const,
        triggerCondition: { isBirthday: true },
        reminderType: 'birthday',
        channel: 'sms' as const,
        template: '亲爱的{name}，祝您生日快乐！特为您准备了生日专属优惠！',
        priority: 'high' as const,
        enabled: true
      }

      const result = careReminder.checkTimeCondition(rule, customer)

      expect(result).toBe(true)
    })
  })
})
