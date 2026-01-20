/**
 * @fileoverview YYC³餐饮管理系统 - 智能客户关怀提醒功能
 * @description 实现智能客户关怀提醒引擎
 * @module care-reminder-engine
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 */

import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

export interface CareReminderRule {
  id: string
  name: string
  description: string
  triggerType: 'event' | 'schedule' | 'condition'
  triggerCondition: any
  careType: string
  contentTemplate: string
  channels: string[]
  priority: number
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CareReminder {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  customerEmail: string
  ruleId: string
  careType: string
  content: string
  channels: string[]
  scheduledAt: Date
  sentAt: Date | null
  status: 'pending' | 'sent' | 'failed'
  response: string | null
  effectivenessScore: number | null
  createdAt: Date
  updatedAt: Date
}

export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  birthday: Date | null
  lifecycleStage: string
  lastOrderDate: Date | null
  orderCount: number
  totalSpent: number
  satisfactionScore: number
  registeredAt: Date
}

class CareReminderEngine {
  private rules: CareReminderRule[]
  private reminders: CareReminder[]

  constructor() {
    this.rules = []
    this.reminders = []
    this.initializeDefaultRules()
  }

  private initializeDefaultRules(): void {
    this.rules = [
      {
        id: 'CARE_001',
        name: '新客户关怀',
        description: '客户首次消费后24小时内发送欢迎消息',
        triggerType: 'event',
        triggerCondition: {
          eventType: 'first_order',
          hoursAfter: 24
        },
        careType: 'welcome',
        contentTemplate: '亲爱的{name}，感谢您首次光临YYC³！我们为您准备了新客专属优惠券，期待您的再次光临！',
        channels: ['sms', 'push'],
        priority: 1,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'CARE_002',
        name: '生日关怀',
        description: '客户生日当天发送生日祝福和专属优惠',
        triggerType: 'schedule',
        triggerCondition: {
          schedule: 'birthday',
          time: '09:00'
        },
        careType: 'birthday',
        contentTemplate: '亲爱的{name}，生日快乐！YYC³祝您生日快乐，特为您准备生日专属优惠券和免费小礼品！',
        channels: ['sms', 'push', 'email'],
        priority: 2,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'CARE_003',
        name: '节日关怀',
        description: '重要节日发送节日祝福和优惠',
        triggerType: 'schedule',
        triggerCondition: {
          schedule: 'holiday',
          holidays: ['spring_festival', 'mid_autumn', 'national_day']
        },
        careType: 'holiday',
        contentTemplate: '亲爱的{name}，{holiday}快乐！YYC³祝您节日愉快，特推出节日特色菜品和优惠活动！',
        channels: ['sms', 'push'],
        priority: 3,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'CARE_004',
        name: '消费频次下降提醒',
        description: '客户消费频次下降超过50%时发送关怀',
        triggerType: 'condition',
        triggerCondition: {
          field: 'orderFrequencyChange',
          operator: 'lt',
          value: -0.5
        },
        careType: 'frequency_drop',
        contentTemplate: '亲爱的{name}，最近很少见到您，是有什么不满意的地方吗？我们为您准备了专属优惠券，期待您的光临！',
        channels: ['sms', 'push'],
        priority: 4,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'CARE_005',
        name: '长期未消费提醒',
        description: '客户30天未消费时发送唤醒消息',
        triggerType: 'condition',
        triggerCondition: {
          field: 'daysSinceLastOrder',
          operator: 'gte',
          value: 30
        },
        careType: 'inactive',
        contentTemplate: '亲爱的{name}，好久不见！我们很想念您，特准备了唤醒优惠券，期待您的回归！',
        channels: ['sms', 'push', 'email'],
        priority: 5,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'CARE_006',
        name: 'VIP客户专属关怀',
        description: 'VIP客户每月定期关怀',
        triggerType: 'schedule',
        triggerCondition: {
          schedule: 'monthly',
          day: 1,
          customerLevel: ['vip', 'super_vip']
        },
        careType: 'vip_care',
        contentTemplate: '尊敬的VIP客户{name}，感谢您一直以来的支持！本月为您准备了专属权益和新品优先体验机会！',
        channels: ['sms', 'push', 'email'],
        priority: 6,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'CARE_007',
        name: '满意度跟进',
        description: '客户消费后3天发送满意度调研',
        triggerType: 'event',
        triggerCondition: {
          eventType: 'order_completed',
          daysAfter: 3
        },
        careType: 'satisfaction',
        contentTemplate: '亲爱的{name}，感谢您最近的光临！我们非常重视您的用餐体验，期待您的反馈！',
        channels: ['sms', 'push'],
        priority: 7,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'CARE_008',
        name: '会员升级提醒',
        description: '客户达到会员升级标准时发送恭喜消息',
        triggerType: 'condition',
        triggerCondition: {
          field: 'canUpgrade',
          operator: 'eq',
          value: true
        },
        careType: 'upgrade',
        contentTemplate: '恭喜{name}！您已达到{newLevel}会员标准，升级后将享受更多专属权益！',
        channels: ['sms', 'push', 'email'],
        priority: 8,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  }

  async processCustomerEvent(customer: Customer, event: any): Promise<CareReminder[]> {
    const triggeredReminders: CareReminder[] = []

    for (const rule of this.rules) {
      if (!rule.enabled) continue

      const shouldTrigger = await this.evaluateTrigger(rule, customer, event)
      if (shouldTrigger) {
        const reminder = await this.createReminder(customer, rule)
        triggeredReminders.push(reminder)
        this.reminders.push(reminder)
      }
    }

    return triggeredReminders
  }

  private async evaluateTrigger(
    rule: CareReminderRule,
    customer: Customer,
    event: any
  ): Promise<boolean> {
    switch (rule.triggerType) {
      case 'event':
        return this.evaluateEventTrigger(rule.triggerCondition, event)
      case 'schedule':
        return this.evaluateScheduleTrigger(rule.triggerCondition, customer)
      case 'condition':
        return this.evaluateConditionTrigger(rule.triggerCondition, customer)
      default:
        return false
    }
  }

  private evaluateEventTrigger(condition: any, event: any): boolean {
    if (!event) return false

    if (condition.eventType === 'first_order' && event.type === 'first_order') {
      const hoursSinceOrder = this.getHoursSince(event.timestamp)
      return hoursSinceOrder <= condition.hoursAfter
    }

    if (condition.eventType === 'order_completed' && event.type === 'order_completed') {
      const daysSinceOrder = this.getDaysSince(event.timestamp)
      return daysSinceOrder <= condition.daysAfter
    }

    return false
  }

  private evaluateScheduleTrigger(condition: any, customer: Customer): boolean {
    const now = new Date()

    if (condition.schedule === 'birthday' && customer.birthday) {
      const birthday = new Date(customer.birthday)
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const birthdayThisYear = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate())
      return today.getTime() === birthdayThisYear.getTime()
    }

    if (condition.schedule === 'monthly' && condition.day) {
      return now.getDate() === condition.day && condition.customerLevel?.includes(customer.lifecycleStage)
    }

    if (condition.schedule === 'holiday') {
      const today = now.getMonth() + 1 + '-' + now.getDate()
      const holidays: Record<string, string> = {
        '1-1': 'spring_festival',
        '9-15': 'mid_autumn',
        '10-1': 'national_day'
      }
      return condition.holidays?.includes(holidays[today])
    }

    return false
  }

  private evaluateConditionTrigger(condition: any, customer: Customer): boolean {
    if (condition.field === 'daysSinceLastOrder') {
      const daysSinceLastOrder = this.getDaysSince(customer.lastOrderDate)
      return this.compareValue(daysSinceLastOrder, condition.operator, condition.value)
    }

    if (condition.field === 'orderFrequencyChange') {
      const currentFrequency = this.calculateMonthlyFrequency(customer, 30)
      const previousFrequency = this.calculateMonthlyFrequency(customer, 90)
      const change = (currentFrequency - previousFrequency) / previousFrequency
      return this.compareValue(change, condition.operator, condition.value)
    }

    if (condition.field === 'canUpgrade') {
      return this.canUpgradeCustomer(customer)
    }

    return false
  }

  private compareValue(
    actual: number,
    operator: string,
    expected: number
  ): boolean {
    switch (operator) {
      case 'eq':
        return actual === expected
      case 'ne':
        return actual !== expected
      case 'gt':
        return actual > expected
      case 'lt':
        return actual < expected
      case 'gte':
        return actual >= expected
      case 'lte':
        return actual <= expected
      default:
        return false
    }
  }

  private getHoursSince(date: Date | null): number {
    if (!date) return Infinity
    return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60))
  }

  private getDaysSince(date: Date | null): number {
    if (!date) return Infinity
    return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
  }

  private calculateMonthlyFrequency(customer: Customer, days: number): number {
    if (days <= 0) return 0
    return (customer.orderCount / days) * 30
  }

  private canUpgradeCustomer(customer: Customer): boolean {
    if (customer.lifecycleStage === 'regular' && customer.orderCount >= 3 && customer.totalSpent >= 500) {
      return true
    }
    if (customer.lifecycleStage === 'member' && customer.orderCount >= 10 && customer.totalSpent >= 2000) {
      return true
    }
    return false
  }

  private async createReminder(
    customer: Customer,
    rule: CareReminderRule
  ): Promise<CareReminder> {
    const content = this.generateContent(rule.contentTemplate, customer, rule)

    return {
      id: this.generateId(),
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      ruleId: rule.id,
      careType: rule.careType,
      content,
      channels: rule.channels,
      scheduledAt: this.calculateScheduledTime(rule),
      sentAt: null,
      status: 'pending',
      response: null,
      effectivenessScore: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  private generateContent(
    template: string,
    customer: Customer,
    rule: CareReminderRule
  ): string {
    let content = template
      .replace('{name}', customer.name)
      .replace('{level}', this.getLevelLabel(customer.lifecycleStage))
      .replace('{lastOrderDate}', this.formatDate(customer.lastOrderDate))

    if (rule.careType === 'upgrade') {
      const newLevel = this.getNextLevel(customer.lifecycleStage)
      content = content.replace('{newLevel}', newLevel)
    }

    if (rule.careType === 'holiday') {
      const holiday = this.getCurrentHoliday()
      content = content.replace('{holiday}', holiday)
    }

    return content
  }

  private calculateScheduledTime(rule: CareReminderRule): Date {
    const now = new Date()

    if (rule.triggerType === 'event') {
      return new Date(now.getTime() + 60 * 1000)
    }

    if (rule.triggerType === 'schedule') {
      if (rule.triggerCondition.schedule === 'birthday') {
        return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0)
      }
      if (rule.triggerCondition.schedule === 'monthly') {
        const nextMonth = now.getMonth() + 1
        return new Date(now.getFullYear(), nextMonth, rule.triggerCondition.day, 9, 0, 0)
      }
    }

    return new Date(now.getTime() + 60 * 1000)
  }

  private getLevelLabel(stage: string): string {
    const labels: Record<string, string> = {
      potential: '潜在客户',
      new_customer: '新客户',
      active: '活跃客户',
      loyal: '忠诚客户',
      dormant: '休眠客户',
      churned: '流失客户'
    }
    return labels[stage] || '客户'
  }

  private getNextLevel(currentStage: string): string {
    const levels = ['regular', 'member', 'vip', 'super_vip']
    const currentIndex = levels.indexOf(currentStage)
    if (currentIndex < levels.length - 1) {
      return this.getLevelLabel(levels[currentIndex + 1])
    }
    return this.getLevelLabel(currentStage)
  }

  private getCurrentHoliday(): string {
    const now = new Date()
    const date = now.getMonth() + 1 + '-' + now.getDate()
    const holidays: Record<string, string> = {
      '1-1': '春节',
      '9-15': '中秋节',
      '10-1': '国庆节'
    }
    return holidays[date] || ''
  }

  private formatDate(date: Date | null): string {
    if (!date) return '从未'
    return new Date(date).toLocaleDateString('zh-CN')
  }

  private generateId(): string {
    return 'REM_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  async sendReminder(reminder: CareReminder): Promise<boolean> {
    try {
      for (const channel of reminder.channels) {
        await this.sendToChannel(reminder, channel)
      }

      reminder.sentAt = new Date()
      reminder.status = 'sent'
      reminder.updatedAt = new Date()

      return true
    } catch (error) {
      console.error('Send reminder failed:', error)
      reminder.status = 'failed'
      reminder.updatedAt = new Date()
      return false
    }
  }

  private async sendToChannel(reminder: CareReminder, channel: string): Promise<void> {
    switch (channel) {
      case 'sms':
        await this.sendSMS(reminder)
        break
      case 'email':
        await this.sendEmail(reminder)
        break
      case 'push':
        await this.sendPush(reminder)
        break
    }
  }

  private async sendSMS(reminder: CareReminder): Promise<void> {
    console.log(`Sending SMS to ${reminder.customerPhone}: ${reminder.content}`)
  }

  private async sendEmail(reminder: CareReminder): Promise<void> {
    console.log(`Sending Email to ${reminder.customerEmail}: ${reminder.content}`)
  }

  private async sendPush(reminder: CareReminder): Promise<void> {
    console.log(`Sending Push to ${reminder.customerId}: ${reminder.content}`)
  }

  markAsSent(reminderId: string, response: string, effectivenessScore: number): void {
    const reminder = this.reminders.find(r => r.id === reminderId)
    if (reminder) {
      reminder.sentAt = new Date()
      reminder.status = 'sent'
      reminder.response = response
      reminder.effectivenessScore = effectivenessScore
      reminder.updatedAt = new Date()
    }
  }

  getPendingReminders(): CareReminder[] {
    return this.reminders.filter(r => r.status === 'pending')
  }

  getSentReminders(): CareReminder[] {
    return this.reminders.filter(r => r.status === 'sent')
  }

  getRemindersByCustomer(customerId: string): CareReminder[] {
    return this.reminders.filter(r => r.customerId === customerId)
  }

  getRemindersByType(careType: string): CareReminder[] {
    return this.reminders.filter(r => r.careType === careType)
  }

  getEffectivenessStatistics(): any {
    const sentReminders = this.reminders.filter(r => r.status === 'sent' && r.effectivenessScore !== null)
    
    if (sentReminders.length === 0) {
      return {
        totalSent: 0,
        avgEffectiveness: 0,
        byType: {}
      }
    }

    const avgEffectiveness = sentReminders.reduce((sum, r) => sum + (r.effectivenessScore || 0), 0) / sentReminders.length

    const byType: Record<string, any> = {}
    sentReminders.forEach(r => {
      if (!byType[r.careType]) {
        byType[r.careType] = { count: 0, totalScore: 0, avgScore: 0 }
      }
      byType[r.careType].count++
      byType[r.careType].totalScore += r.effectivenessScore || 0
      byType[r.careType].avgScore = byType[r.careType].totalScore / byType[r.careType].count
    })

    return {
      totalSent: sentReminders.length,
      avgEffectiveness: Math.round(avgEffectiveness * 10) / 10,
      byType
    }
  }
}

const careReminderEngine = new CareReminderEngine()

export function useCareReminder() {
  const loading = ref(false)
  const pendingReminders = ref<CareReminder[]>([])
  const sentReminders = ref<CareReminder[]>([])
  const effectivenessStats = ref<any>(null)

  const loadPendingReminders = async () => {
    loading.value = true
    try {
      pendingReminders.value = careReminderEngine.getPendingReminders()
    } catch (error) {
      console.error('Load pending reminders failed:', error)
      ElMessage.error('加载待处理提醒失败')
    } finally {
      loading.value = false
    }
  }

  const loadSentReminders = async () => {
    loading.value = true
    try {
      sentReminders.value = careReminderEngine.getSentReminders()
    } catch (error) {
      console.error('Load sent reminders failed:', error)
      ElMessage.error('加载已发送提醒失败')
    } finally {
      loading.value = false
    }
  }

  const loadEffectivenessStats = async () => {
    loading.value = true
    try {
      effectivenessStats.value = careReminderEngine.getEffectivenessStatistics()
    } catch (error) {
      console.error('Load effectiveness stats failed:', error)
      ElMessage.error('加载效果统计失败')
    } finally {
      loading.value = false
    }
  }

  const processCustomerEvent = async (customer: Customer, event: any) => {
    loading.value = true
    try {
      const reminders = await careReminderEngine.processCustomerEvent(customer, event)
      if (reminders.length > 0) {
        ElMessage.success(`已生成 ${reminders.length} 条关怀提醒`)
      }
      return reminders
    } catch (error) {
      console.error('Process customer event failed:', error)
      ElMessage.error('处理客户事件失败')
      return []
    } finally {
      loading.value = false
    }
  }

  const sendReminder = async (reminder: CareReminder) => {
    loading.value = true
    try {
      const success = await careReminderEngine.sendReminder(reminder)
      if (success) {
        ElMessage.success('关怀提醒发送成功')
        await loadPendingReminders()
        await loadSentReminders()
      } else {
        ElMessage.error('关怀提醒发送失败')
      }
      return success
    } catch (error) {
      console.error('Send reminder failed:', error)
      ElMessage.error('发送提醒失败')
      return false
    } finally {
      loading.value = false
    }
  }

  const markAsSent = async (reminderId: string, response: string, effectivenessScore: number) => {
    try {
      careReminderEngine.markAsSent(reminderId, response, effectivenessScore)
      ElMessage.success('标记成功')
      await loadSentReminders()
    } catch (error) {
      console.error('Mark as sent failed:', error)
      ElMessage.error('标记失败')
    }
  }

  const getCareTypeLabel = (careType: string): string => {
    const labels: Record<string, string> = {
      welcome: '新客户关怀',
      birthday: '生日关怀',
      holiday: '节日关怀',
      frequency_drop: '消费频次下降',
      inactive: '长期未消费',
      vip_care: 'VIP专属关怀',
      satisfaction: '满意度跟进',
      upgrade: '会员升级'
    }
    return labels[careType] || '未知'
  }

  const getChannelLabel = (channel: string): string => {
    const labels: Record<string, string> = {
      sms: '短信',
      email: '邮件',
      push: '推送'
    }
    return labels[channel] || '未知'
  }

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: '#E6A23C',
      sent: '#67C23A',
      failed: '#F56C6C'
    }
    return colors[status] || '#909399'
  }

  const getEffectivenessColor = (score: number): string => {
    if (score >= 4) return '#67C23A'
    if (score >= 3) return '#409EFF'
    if (score >= 2) return '#E6A23C'
    return '#F56C6C'
  }

  return {
    loading,
    pendingReminders,
    sentReminders,
    effectivenessStats,
    loadPendingReminders,
    loadSentReminders,
    loadEffectivenessStats,
    processCustomerEvent,
    sendReminder,
    markAsSent,
    getCareTypeLabel,
    getChannelLabel,
    getStatusColor,
    getEffectivenessColor
  }
}
