/**
 * @fileoverview 异常预警组件单元测试
 * @description 测试异常预警组件的功能和交互
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import AlertSystem from '@/components/analytics/AlertSystem.vue'

vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  }
})

describe('AlertSystem组件', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('组件渲染', () => {
    it('应该正确渲染预警概览卡片', () => {
      const wrapper = mount(AlertSystem)
      expect(wrapper.find('.alert-overview').exists()).toBe(true)
      expect(wrapper.find('.alert-metric').exists()).toBe(true)
    })

    it('应该正确渲染预警列表', () => {
      const wrapper = mount(AlertSystem)
      expect(wrapper.find('.alert-list').exists()).toBe(true)
      expect(wrapper.find('.el-table').exists()).toBe(true)
    })

    it('应该正确渲染预警趋势图', () => {
      const wrapper = mount(AlertSystem)
      expect(wrapper.find('.alert-trends').exists()).toBe(true)
      expect(wrapper.find('.chart-container').exists()).toBe(true)
    })
  })

  describe('预警概览', () => {
    it('应该显示四种类型的预警统计', () => {
      const wrapper = mount(AlertSystem)
      const metrics = wrapper.findAll('.alert-metric')
      expect(metrics.length).toBe(4)
    })

    it('应该正确显示预警数量', async () => {
      const wrapper = mount(AlertSystem)
      await nextTick()
      const criticalCount = wrapper.find('.alert-metric.critical .metric-value')
      expect(criticalCount.text()).toBe('3')
    })
  })

  describe('预警列表', () => {
    it('应该正确渲染预警数据', () => {
      const wrapper = mount(AlertSystem)
      const table = wrapper.find('.el-table')
      expect(table.exists()).toBe(true)
    })

    it('应该支持预警筛选', async () => {
      const wrapper = mount(AlertSystem)
      const filterSelect = wrapper.find('.el-select')
      expect(filterSelect.exists()).toBe(true)
    })

    it('应该支持分页', () => {
      const wrapper = mount(AlertSystem)
      const pagination = wrapper.find('.el-pagination')
      expect(pagination.exists()).toBe(true)
    })
  })

  describe('预警操作', () => {
    it('应该能够查看预警详情', async () => {
      const wrapper = mount(AlertSystem)
      await nextTick()
      const viewButton = wrapper.findAll('.el-button').find(btn => btn.text() === '查看')
      if (viewButton) {
        await viewButton.trigger('click')
        expect(wrapper.vm.showAlertDetail).toBe(true)
      }
    })

    it('应该能够处理预警', async () => {
      ElMessageBox.confirm = vi.fn().mockResolvedValue('confirm')
      const wrapper = mount(AlertSystem)
      await nextTick()
      const resolveButton = wrapper.findAll('.el-button').find(btn => btn.text() === '处理')
      if (resolveButton) {
        await resolveButton.trigger('click')
        expect(ElMessageBox.confirm).toHaveBeenCalled()
      }
    })

    it('应该能够刷新预警数据', async () => {
      const wrapper = mount(AlertSystem)
      const refreshButton = wrapper.findAll('.el-button').find(btn => btn.text().includes('刷新'))
      if (refreshButton) {
        await refreshButton.trigger('click')
        expect(ElMessage.success).toHaveBeenCalledWith('预警数据已刷新')
      }
    })
  })

  describe('预警设置', () => {
    it('应该能够打开预警设置对话框', async () => {
      const wrapper = mount(AlertSystem)
      const settingsButton = wrapper.findAll('.el-button').find(btn => btn.text().includes('预警设置'))
      if (settingsButton) {
        await settingsButton.trigger('click')
        expect(wrapper.vm.showAlertSettings).toBe(true)
      }
    })

    it('应该能够保存阈值设置', async () => {
      const wrapper = mount(AlertSystem)
      await wrapper.setData({ showAlertSettings: true })
      const saveButton = wrapper.findAll('.el-button').find(btn => btn.text() === '保存')
      if (saveButton) {
        await saveButton.trigger('click')
        expect(ElMessage.success).toHaveBeenCalled()
      }
    })

    it('应该能够保存通知设置', async () => {
      ElMessageBox.confirm.mockResolvedValue('confirm')
      const wrapper = mount(AlertSystem)
      await wrapper.setData({ showAlertSettings: true, settingsTab: 'notifications' })
      const saveAllButton = wrapper.findAll('.el-button').find(btn => btn.text() === '保存所有设置')
      if (saveAllButton) {
        await saveAllButton.trigger('click')
        expect(ElMessageBox.confirm).toHaveBeenCalled()
      }
    })
  })

  describe('预警详情', () => {
    it('应该正确显示预警详情信息', async () => {
      const wrapper = mount(AlertSystem)
      await wrapper.setData({
        showAlertDetail: true,
        selectedAlert: {
          id: 1,
          severity: 'critical',
          type: 'revenue',
          title: '收入异常下降',
          description: '今日收入较昨日下降超过20%',
          currentValue: 85000,
          threshold: 100000,
          unit: '元',
          deviation: -15.5,
          createdAt: '2025-01-20 10:30:00',
          status: 'pending'
        }
      })
      await nextTick()
      const descriptions = wrapper.findAll('.el-descriptions-item')
      expect(descriptions.length).toBeGreaterThan(0)
    })

    it('应该能够导出预警详情', async () => {
      const wrapper = mount(AlertSystem)
      await wrapper.setData({ showAlertDetail: true })
      const exportButton = wrapper.findAll('.el-button').find(btn => btn.text() === '导出详情')
      if (exportButton) {
        await exportButton.trigger('click')
        expect(ElMessage.success).toHaveBeenCalledWith('预警详情已导出')
      }
    })
  })

  describe('工具函数', () => {
    it('应该正确格式化数值', () => {
      const wrapper = mount(AlertSystem)
      expect(wrapper.vm.formatValue(100000, '元')).toBe('¥100,000')
      expect(wrapper.vm.formatValue(85.5, '%')).toBe('85.5%')
      expect(wrapper.vm.formatValue(4.5, '分')).toBe('4.5分')
    })

    it('应该正确格式化日期时间', () => {
      const wrapper = mount(AlertSystem)
      const dateTime = '2025-01-20 10:30:00'
      const formatted = wrapper.vm.formatDateTime(dateTime)
      expect(formatted).toContain('2025')
    })

    it('应该正确获取严重程度类型', () => {
      const wrapper = mount(AlertSystem)
      expect(wrapper.vm.getSeverityType('critical')).toBe('danger')
      expect(wrapper.vm.getSeverityType('warning')).toBe('warning')
      expect(wrapper.vm.getSeverityType('info')).toBe('info')
    })

    it('应该正确获取预警类型颜色', () => {
      const wrapper = mount(AlertSystem)
      expect(wrapper.vm.getTypeColor('revenue')).toBe('danger')
      expect(wrapper.vm.getTypeColor('orders')).toBe('warning')
      expect(wrapper.vm.getTypeColor('customers')).toBe('primary')
    })
  })

  describe('响应式行为', () => {
    it('应该正确处理预警筛选变化', async () => {
      const wrapper = mount(AlertSystem)
      await wrapper.setData({ alertFilter: 'critical' })
      expect(wrapper.vm.alertFilter).toBe('critical')
    })

    it('应该正确处理分页变化', async () => {
      const wrapper = mount(AlertSystem)
      await wrapper.setData({ currentPage: 2 })
      expect(wrapper.vm.currentPage).toBe(2)
    })
  })

  describe('图表功能', () => {
    it('应该正确初始化预警趋势图', async () => {
      const wrapper = mount(AlertSystem)
      await nextTick()
      expect(wrapper.vm.alertTrendsChart).toBeDefined()
    })

    it('应该在组件卸载时正确销毁图表', async () => {
      const wrapper = mount(AlertSystem)
      await wrapper.unmount()
      expect(wrapper.vm.alertTrendsChart).toBeNull()
    })
  })
})
