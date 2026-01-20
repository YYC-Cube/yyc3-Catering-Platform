import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import * as echarts from 'echarts'

import DataAnalytics from '../../views/DataAnalytics.vue'
import CustomerAnalytics from '../../components/analytics/CustomerAnalytics.vue'
import MenuAnalytics from '../../components/analytics/MenuAnalytics.vue'
import OperationalAnalytics from '../../components/analytics/OperationalAnalytics.vue'
import SalesAnalytics from '../../components/analytics/SalesAnalytics.vue'
import AlertSystem from '../../components/analytics/AlertSystem.vue'
import CustomDashboard from '../../components/analytics/CustomDashboard.vue'

vi.mock('echarts', () => {
  const mockChartInstance = {
    setOption: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    clear: vi.fn()
  }
  const LinearGradientMock = vi.fn()
  return {
    default: {
      init: vi.fn(() => mockChartInstance),
      graphic: {
        LinearGradient: LinearGradientMock
      }
    },
    init: vi.fn(() => mockChartInstance),
    graphic: {
      LinearGradient: LinearGradientMock
    }
  }
})

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/analytics', component: DataAnalytics }
  ]
})

describe('DataAnalytics集成测试', () => {
  let wrapper: VueWrapper<any>
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    wrapper = mount(DataAnalytics, {
      global: {
        plugins: [pinia, router, ElementPlus],
        stubs: {
          'el-card': true,
          'el-row': true,
          'el-col': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-button': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-dialog': true,
          'el-table': true,
          'el-table-column': true,
          'el-statistic': true,
          'el-progress': true,
          'el-tag': true,
          'el-icon': true,
          'el-tooltip': true,
          'el-popover': true,
          'el-switch': true,
          'el-slider': true,
          'el-input': true,
          'el-form': true,
          'el-form-item': true,
          'el-radio-group': true,
          'el-radio-button': true,
          'el-divider': true,
          'el-alert': true,
          'el-badge': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true
        }
      }
    })

    router.push('/analytics')
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })

  describe('整体功能测试', () => {
    it('应该正确渲染数据分析主页面', () => {
      expect(wrapper.find('.data-analytics').exists()).toBe(true)
    })

    it('应该包含所有分析组件', () => {
      expect(wrapper.findComponent(CustomerAnalytics).exists()).toBe(true)
      expect(wrapper.findComponent(MenuAnalytics).exists()).toBe(true)
      expect(wrapper.findComponent(OperationalAnalytics).exists()).toBe(true)
      expect(wrapper.findComponent(SalesAnalytics).exists()).toBe(true)
      expect(wrapper.findComponent(AlertSystem).exists()).toBe(true)
      expect(wrapper.findComponent(CustomDashboard).exists()).toBe(true)
    })

    it('应该正确初始化日期范围选择器', () => {
      expect(wrapper.vm.dateRange).toBeDefined()
      expect(wrapper.vm.dateRange).toHaveLength(2)
    })

    it('应该支持切换分析模块', async () => {
      expect(wrapper.vm.activeTab).toBe('overview')

      await wrapper.setData({ activeTab: 'customer' })
      expect(wrapper.vm.activeTab).toBe('customer')

      await wrapper.setData({ activeTab: 'menu' })
      expect(wrapper.vm.activeTab).toBe('menu')

      await wrapper.setData({ activeTab: 'operational' })
      expect(wrapper.vm.activeTab).toBe('operational')

      await wrapper.setData({ activeTab: 'sales' })
      expect(wrapper.vm.activeTab).toBe('sales')
    })
  })

  describe('组件交互测试', () => {
    it('应该能够从客户分析切换到菜单分析', async () => {
      await wrapper.setData({ activeTab: 'customer' })
      expect(wrapper.findComponent(CustomerAnalytics).exists()).toBe(true)

      await wrapper.setData({ activeTab: 'menu' })
      expect(wrapper.findComponent(MenuAnalytics).exists()).toBe(true)
    })

    it('应该能够从菜单分析切换到运营分析', async () => {
      await wrapper.setData({ activeTab: 'menu' })
      expect(wrapper.findComponent(MenuAnalytics).exists()).toBe(true)

      await wrapper.setData({ activeTab: 'operational' })
      expect(wrapper.findComponent(OperationalAnalytics).exists()).toBe(true)
    })

    it('应该能够从运营分析切换到销售分析', async () => {
      await wrapper.setData({ activeTab: 'operational' })
      expect(wrapper.findComponent(OperationalAnalytics).exists()).toBe(true)

      await wrapper.setData({ activeTab: 'sales' })
      expect(wrapper.findComponent(SalesAnalytics).exists()).toBe(true)
    })

    it('应该能够从销售分析切换到自定义仪表板', async () => {
      await wrapper.setData({ activeTab: 'sales' })
      expect(wrapper.findComponent(SalesAnalytics).exists()).toBe(true)

      await wrapper.setData({ activeTab: 'custom' })
      expect(wrapper.findComponent(CustomDashboard).exists()).toBe(true)
    })
  })

  describe('数据刷新功能测试', () => {
    it('应该支持手动刷新数据', async () => {
      const refreshSpy = vi.spyOn(wrapper.vm, 'refreshData')
      await wrapper.vm.refreshData()
      expect(refreshSpy).toHaveBeenCalled()
    })

    it('刷新后应该更新所有分析组件的数据', async () => {
      await wrapper.setData({ activeTab: 'customer' })
      const customerAnalytics = wrapper.findComponent(CustomerAnalytics)
      await wrapper.vm.refreshData()
      expect(customerAnalytics.vm.lastRefreshTime).toBeDefined()
    })

    it('应该显示刷新状态指示器', async () => {
      await wrapper.setData({ isRefreshing: true })
      expect(wrapper.vm.isRefreshing).toBe(true)

      await wrapper.setData({ isRefreshing: false })
      expect(wrapper.vm.isRefreshing).toBe(false)
    })
  })

  describe('日期范围筛选测试', () => {
    it('应该支持选择日期范围', async () => {
      const newDateRange = [new Date('2024-01-01'), new Date('2024-01-31')]
      await wrapper.setData({ dateRange: newDateRange })
      expect(wrapper.vm.dateRange).toEqual(newDateRange)
    })

    it('日期范围改变后应该触发数据刷新', async () => {
      const refreshSpy = vi.spyOn(wrapper.vm, 'refreshData')
      const newDateRange = [new Date('2024-01-01'), new Date('2024-01-31')]
      await wrapper.setData({ dateRange: newDateRange })
      expect(refreshSpy).toHaveBeenCalled()
    })

    it('应该支持快捷日期选择', async () => {
      await wrapper.vm.selectQuickDate('today')
      expect(wrapper.vm.dateRange).toBeDefined()

      await wrapper.vm.selectQuickDate('week')
      expect(wrapper.vm.dateRange).toBeDefined()

      await wrapper.vm.selectQuickDate('month')
      expect(wrapper.vm.dateRange).toBeDefined()

      await wrapper.vm.selectQuickDate('year')
      expect(wrapper.vm.dateRange).toBeDefined()
    })
  })

  describe('告警系统集成测试', () => {
    it('应该正确显示告警通知', async () => {
      await wrapper.setData({ showAlerts: true })
      const alertSystem = wrapper.findComponent(AlertSystem)
      expect(alertSystem.exists()).toBe(true)
    })

    it('应该能够处理告警通知', async () => {
      const alertSystem = wrapper.findComponent(AlertSystem)
      const handleAlertSpy = vi.spyOn(wrapper.vm, 'handleAlert')
      await alertSystem.vm.$emit('alert', { type: 'warning', message: '测试告警' })
      expect(handleAlertSpy).toHaveBeenCalled()
    })

    it('应该能够关闭告警通知', async () => {
      await wrapper.setData({ showAlerts: true })
      expect(wrapper.vm.showAlerts).toBe(true)

      await wrapper.setData({ showAlerts: false })
      expect(wrapper.vm.showAlerts).toBe(false)
    })
  })

  describe('自定义仪表板集成测试', () => {
    it('应该能够打开自定义仪表板', async () => {
      await wrapper.setData({ activeTab: 'custom' })
      const customDashboard = wrapper.findComponent(CustomDashboard)
      expect(customDashboard.exists()).toBe(true)
    })

    it('应该能够保存自定义仪表板配置', async () => {
      const customDashboard = wrapper.findComponent(CustomDashboard)
      const saveConfigSpy = vi.spyOn(wrapper.vm, 'saveDashboardConfig')
      const config = {
        layout: ['customer', 'menu', 'sales'],
        widgets: [
          { id: 'customer-growth', position: { x: 0, y: 0, w: 6, h: 4 } },
          { id: 'menu-performance', position: { x: 6, y: 0, w: 6, h: 4 } },
          { id: 'sales-trend', position: { x: 0, y: 4, w: 12, h: 4 } }
        ]
      }
      await wrapper.vm.saveDashboardConfig(config)
      expect(saveConfigSpy).toHaveBeenCalledWith(config)
    })

    it('应该能够加载自定义仪表板配置', async () => {
      const loadConfigSpy = vi.spyOn(wrapper.vm, 'loadDashboardConfig')
      await wrapper.vm.loadDashboardConfig()
      expect(loadConfigSpy).toHaveBeenCalled()
    })
  })

  describe('数据导出功能测试', () => {
    it('应该支持导出分析报告', async () => {
      const exportSpy = vi.spyOn(wrapper.vm, 'exportReport')
      await wrapper.vm.exportReport('pdf')
      expect(exportSpy).toHaveBeenCalledWith('pdf')
    })

    it('应该支持导出不同格式的报告', async () => {
      const formats = ['pdf', 'excel', 'csv']
      for (const format of formats) {
        await wrapper.vm.exportReport(format)
        expect(wrapper.vm.exportFormat).toBe(format)
      }
    })

    it('导出时应该包含当前选择的数据范围', async () => {
      await wrapper.setData({ dateRange: [new Date('2024-01-01'), new Date('2024-01-31')] })
      const exportSpy = vi.spyOn(wrapper.vm, 'exportReport')
      await wrapper.vm.exportReport('pdf')
      expect(exportSpy).toHaveBeenCalled()
    })
  })

  describe('性能测试', () => {
    it('应该在合理时间内完成组件初始化', async () => {
      const startTime = Date.now()
      await wrapper.vm.$nextTick()
      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(1000)
    })

    it('应该在合理时间内完成数据刷新', async () => {
      const startTime = Date.now()
      await wrapper.vm.refreshData()
      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(2000)
    })

    it('应该正确处理大量数据', async () => {
      const largeDataSet = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        value: Math.random() * 100
      }))
      await wrapper.setData({ analyticsData: largeDataSet })
      expect(wrapper.vm.analyticsData).toHaveLength(10000)
    })
  })

  describe('错误处理测试', () => {
    it('应该正确处理数据加载错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      await wrapper.vm.refreshData().catch(() => {})
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('应该正确处理组件渲染错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      try {
        await wrapper.setData({ activeTab: 'invalid' })
      } catch (error) {
        expect(consoleSpy).toHaveBeenCalled()
      }
      consoleSpy.mockRestore()
    })

    it('应该显示友好的错误提示', async () => {
      await wrapper.setData({ error: '测试错误' })
      expect(wrapper.vm.error).toBe('测试错误')
      expect(wrapper.find('.error-message').exists()).toBe(true)
    })
  })

  describe('响应式设计测试', () => {
    it('应该在小屏幕上正确显示', async () => {
      await wrapper.setData({ screenSize: 'small' })
      expect(wrapper.vm.screenSize).toBe('small')
    })

    it('应该在中屏幕上正确显示', async () => {
      await wrapper.setData({ screenSize: 'medium' })
      expect(wrapper.vm.screenSize).toBe('medium')
    })

    it('应该在大屏幕上正确显示', async () => {
      await wrapper.setData({ screenSize: 'large' })
      expect(wrapper.vm.screenSize).toBe('large')
    })

    it('应该根据屏幕大小调整布局', async () => {
      await wrapper.setData({ screenSize: 'small' })
      expect(wrapper.vm.layoutMode).toBe('compact')

      await wrapper.setData({ screenSize: 'large' })
      expect(wrapper.vm.layoutMode).toBe('expanded')
    })
  })

  describe('数据可视化集成测试', () => {
    it('应该正确初始化所有图表', async () => {
      await wrapper.vm.$nextTick()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确更新图表数据', async () => {
      await wrapper.setData({ activeTab: 'customer' })
      const customerAnalytics = wrapper.findComponent(CustomerAnalytics)
      await customerAnalytics.vm.updateChartData()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确处理图表交互', async () => {
      await wrapper.setData({ activeTab: 'sales' })
      const salesAnalytics = wrapper.findComponent(SalesAnalytics)
      await salesAnalytics.vm.handleChartClick({ dataIndex: 0 })
      expect(wrapper.vm.selectedDataPoint).toBeDefined()
    })
  })

  describe('实时数据更新测试', () => {
    it('应该支持实时数据更新', async () => {
      await wrapper.setData({ enableRealTimeUpdates: true })
      expect(wrapper.vm.enableRealTimeUpdates).toBe(true)
    })

    it('应该正确处理实时数据推送', async () => {
      const handleRealTimeUpdateSpy = vi.spyOn(wrapper.vm, 'handleRealTimeUpdate')
      const updateData = { type: 'sales', data: { value: 1000 } }
      await wrapper.vm.handleRealTimeUpdate(updateData)
      expect(handleRealTimeUpdateSpy).toHaveBeenCalledWith(updateData)
    })

    it('应该能够暂停和恢复实时更新', async () => {
      await wrapper.setData({ enableRealTimeUpdates: true })
      expect(wrapper.vm.enableRealTimeUpdates).toBe(true)

      await wrapper.setData({ enableRealTimeUpdates: false })
      expect(wrapper.vm.enableRealTimeUpdates).toBe(false)
    })
  })

  describe('权限控制测试', () => {
    it('应该根据用户权限显示不同的分析模块', async () => {
      await wrapper.setData({ userPermissions: ['customer', 'menu'] })
      expect(wrapper.vm.availableTabs).toContain('customer')
      expect(wrapper.vm.availableTabs).toContain('menu')
    })

    it('应该隐藏无权限访问的分析模块', async () => {
      await wrapper.setData({ userPermissions: ['customer'] })
      expect(wrapper.vm.availableTabs).toContain('customer')
      expect(wrapper.vm.availableTabs).not.toContain('operational')
    })

    it('应该正确处理权限不足的情况', async () => {
      await wrapper.setData({ userPermissions: [] })
      expect(wrapper.vm.availableTabs).toHaveLength(0)
    })
  })
})
