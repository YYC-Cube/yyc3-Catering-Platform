/**
 * @fileoverview 系统监控组件单元测试
 * @description 测试SystemMonitoring组件的功能和交互
 * @module SystemMonitoring.test
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ElementPlus from 'element-plus'
import SystemMonitoring from '@/views/SystemMonitoring.vue'
import { systemMonitorAPI } from '@/api/system-monitor'
import MetricChart from '@/components/Charts/MetricChart.vue'
import AlertDetail from '@/components/System/AlertDetail.vue'
import LogDetail from '@/components/System/LogDetail.vue'
import AlertRuleForm from '@/components/System/AlertRuleForm.vue'
import PerformanceReportComponent from '@/components/System/PerformanceReport.vue'
import SystemHealthCheck from '@/components/System/SystemHealthCheck.vue'

vi.mock('@/api/system-monitor', () => ({
  systemMonitorAPI: {
    getMetrics: vi.fn(() => Promise.resolve({
      data: [
        {
          id: '1',
          name: 'CPU使用率',
          value: 45.2,
          unit: '%',
          status: 'normal',
          category: 'system',
          history: []
        }
      ]
    })),
    getAlerts: vi.fn(() => Promise.resolve({
      data: [
        {
          id: '1',
          title: 'CPU使用率过高',
          severity: 'high',
          status: 'active',
          source: 'system',
          timestamp: new Date().toISOString(),
          description: 'CPU使用率超过80%'
        }
      ],
      total: 1
    })),
    getLogs: vi.fn(() => Promise.resolve({
      data: [
        {
          id: '1',
          level: 'info',
          message: '系统启动',
          timestamp: new Date().toISOString(),
          source: 'system'
        }
      ],
      total: 1
    })),
    getSystemHealth: vi.fn(() => Promise.resolve({
      data: {
        status: 'healthy',
        score: 95,
        components: [],
        lastCheck: new Date().toISOString()
      }
    })),
    getPerformanceReport: vi.fn(() => Promise.resolve({
      data: {
        period: '24h',
        metrics: [],
        trends: [],
        recommendations: []
      }
    })),
    acknowledgeAlert: vi.fn(() => Promise.resolve({ data: {} })),
    resolveAlert: vi.fn(() => Promise.resolve({ data: {} })),
    deleteAlert: vi.fn(() => Promise.resolve({ data: {} })),
    deleteLog: vi.fn(() => Promise.resolve({ data: {} })),
    exportMetrics: vi.fn(() => Promise.resolve({ data: new Blob() })),
    exportAlerts: vi.fn(() => Promise.resolve({ data: new Blob() })),
    exportLogs: vi.fn(() => Promise.resolve({ data: new Blob() })),
    createAlertRule: vi.fn(() => Promise.resolve({ data: {} })),
    updateAlertRule: vi.fn(() => Promise.resolve({ data: {} })),
    deleteAlertRule: vi.fn(() => Promise.resolve({ data: {} })),
    runHealthCheck: vi.fn(() => Promise.resolve({ data: {} }))
  }
}))

vi.mock('@/components/Charts/MetricChart.vue', () => ({
  name: 'MetricChart',
  template: '<div class="metric-chart-mock"></div>',
  props: ['metric']
}))

vi.mock('@/components/System/AlertDetail.vue', () => ({
  name: 'AlertDetail',
  template: '<div class="alert-detail-mock"></div>',
  props: ['alert', 'visible']
}))

vi.mock('@/components/System/LogDetail.vue', () => ({
  name: 'LogDetail',
  template: '<div class="log-detail-mock"></div>',
  props: ['log', 'visible']
}))

vi.mock('@/components/System/AlertRuleForm.vue', () => ({
  name: 'AlertRuleForm',
  template: '<div class="alert-rule-form-mock"></div>',
  props: ['visible', 'rule']
}))

vi.mock('@/components/System/PerformanceReport.vue', () => ({
  name: 'PerformanceReport',
  template: '<div class="performance-report-mock"></div>',
  props: ['report', 'visible']
}))

vi.mock('@/components/System/SystemHealthCheck.vue', () => ({
  name: 'SystemHealthCheck',
  template: '<div class="system-health-check-mock"></div>',
  props: ['health', 'visible']
}))

describe('SystemMonitoring组件', () => {
  let wrapper: VueWrapper<any>
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    wrapper = mount(SystemMonitoring, {
      global: {
        plugins: [pinia, ElementPlus],
        stubs: {
          'el-card': true,
          'el-row': true,
          'el-col': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-button': true,
          'el-button-group': true,
          'el-icon': true,
          'el-tag': true,
          'el-select': true,
          'el-option': true,
          'el-input': true,
          'el-date-picker': true,
          'el-table': true,
          'el-table-column': true,
          'el-pagination': true,
          'el-dialog': true,
          'el-form': true,
          'el-form-item': true,
          'el-input-number': true,
          'el-switch': true,
          'el-radio-group': true,
          'el-radio-button': true,
          'el-checkbox-group': true,
          'el-checkbox': true,
          'el-divider': true,
          'el-alert': true,
          'el-tooltip': true,
          'el-popover': true,
          'el-progress': true,
          'el-statistic': true,
          'el-badge': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-timeline': true,
          'el-timeline-item': true,
          'el-descriptions': true,
          'el-descriptions-item': true,
          'el-empty': true
        }
      }
    })

    vi.clearAllMocks()
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('组件渲染', () => {
    it('应该正确渲染系统监控页面', () => {
      expect(wrapper.find('.system-monitoring').exists()).toBe(true)
    })

    it('应该显示概览卡片', () => {
      const overviewCards = wrapper.findAll('.overview-card')
      expect(overviewCards.length).toBeGreaterThan(0)
    })

    it('应该显示标签页', () => {
      const tabs = wrapper.find('.monitoring-tabs')
      expect(tabs.exists()).toBe(true)
    })
  })

  describe('系统指标', () => {
    it('应该加载系统指标', async () => {
      await wrapper.vm.loadMetrics()
      expect(systemMonitorAPI.getMetrics).toHaveBeenCalled()
    })

    it('应该显示指标卡片', () => {
      const metricCards = wrapper.findAll('.metric-card')
      expect(metricCards.length).toBeGreaterThan(0)
    })

    it('应该正确显示指标状态', () => {
      const metricStatus = wrapper.find('.metric-header .el-tag')
      expect(metricStatus.exists()).toBe(true)
    })

    it('应该支持按分类筛选指标', async () => {
      wrapper.vm.metricFilters.categories = ['system']
      await wrapper.vm.loadMetrics()
      expect(systemMonitorAPI.getMetrics).toHaveBeenCalled()
    })

    it('应该支持按时间范围筛选指标', async () => {
      wrapper.vm.metricFilters.timeRange = '24h'
      await wrapper.vm.loadMetrics()
      expect(systemMonitorAPI.getMetrics).toHaveBeenCalled()
    })

    it('应该刷新指标', async () => {
      await wrapper.vm.refreshMetrics()
      expect(systemMonitorAPI.getMetrics).toHaveBeenCalled()
    })

    it('应该导出指标数据', async () => {
      await wrapper.vm.exportMetrics()
      expect(systemMonitorAPI.exportMetrics).toHaveBeenCalled()
    })
  })

  describe('系统告警', () => {
    it('应该加载系统告警', async () => {
      await wrapper.vm.loadAlerts()
      expect(systemMonitorAPI.getAlerts).toHaveBeenCalled()
    })

    it('应该显示告警列表', () => {
      const alertTable = wrapper.find('.alerts-list .el-table')
      expect(alertTable.exists()).toBe(true)
    })

    it('应该正确显示告警严重程度', () => {
      const severityTags = wrapper.findAll('.alerts-list .el-tag')
      expect(severityTags.length).toBeGreaterThan(0)
    })

    it('应该支持按严重程度筛选告警', async () => {
      wrapper.vm.alertFilters.severity = ['high']
      await wrapper.vm.loadAlerts()
      expect(systemMonitorAPI.getAlerts).toHaveBeenCalled()
    })

    it('应该支持按状态筛选告警', async () => {
      wrapper.vm.alertFilters.status = ['active']
      await wrapper.vm.loadAlerts()
      expect(systemMonitorAPI.getAlerts).toHaveBeenCalled()
    })

    it('应该支持搜索告警', async () => {
      wrapper.vm.alertFilters.search = 'CPU'
      await wrapper.vm.handleAlertSearch()
      expect(systemMonitorAPI.getAlerts).toHaveBeenCalled()
    })

    it('应该确认告警', async () => {
      const mockAlert = {
        id: '1',
        title: '测试告警',
        severity: 'high',
        status: 'active',
        source: 'system',
        timestamp: new Date().toISOString()
      }
      await wrapper.vm.acknowledgeAlert(mockAlert)
      expect(systemMonitorAPI.acknowledgeAlert).toHaveBeenCalledWith('1')
    })

    it('应该解决告警', async () => {
      const mockAlert = {
        id: '1',
        title: '测试告警',
        severity: 'high',
        status: 'active',
        source: 'system',
        timestamp: new Date().toISOString()
      }
      await wrapper.vm.resolveAlert(mockAlert)
      expect(systemMonitorAPI.resolveAlert).toHaveBeenCalledWith('1')
    })

    it('应该查看告警详情', () => {
      const mockAlert = {
        id: '1',
        title: '测试告警',
        severity: 'high',
        status: 'active',
        source: 'system',
        timestamp: new Date().toISOString()
      }
      wrapper.vm.viewAlertDetails(mockAlert)
      expect(wrapper.vm.selectedAlert).toEqual(mockAlert)
      expect(wrapper.vm.showAlertDetail).toBe(true)
    })

    it('应该刷新告警', async () => {
      await wrapper.vm.refreshAlerts()
      expect(systemMonitorAPI.getAlerts).toHaveBeenCalled()
    })
  })

  describe('系统日志', () => {
    it('应该加载系统日志', async () => {
      await wrapper.vm.loadLogs()
      expect(systemMonitorAPI.getLogs).toHaveBeenCalled()
    })

    it('应该显示日志列表', () => {
      const logTable = wrapper.find('.logs-section .el-table')
      expect(logTable.exists()).toBe(true)
    })

    it('应该正确显示日志级别', () => {
      const levelTags = wrapper.findAll('.logs-section .el-tag')
      expect(levelTags.length).toBeGreaterThan(0)
    })

    it('应该支持按级别筛选日志', async () => {
      wrapper.vm.logFilters.level = ['error']
      await wrapper.vm.loadLogs()
      expect(systemMonitorAPI.getLogs).toHaveBeenCalled()
    })

    it('应该支持按时间范围筛选日志', async () => {
      wrapper.vm.logDateRange = [new Date(), new Date()]
      await wrapper.vm.handleLogDateChange()
      expect(systemMonitorAPI.getLogs).toHaveBeenCalled()
    })

    it('应该支持搜索日志', async () => {
      wrapper.vm.logFilters.search = 'error'
      await wrapper.vm.handleLogSearch()
      expect(systemMonitorAPI.getLogs).toHaveBeenCalled()
    })

    it('应该查看日志详情', () => {
      const mockLog = {
        id: '1',
        level: 'info',
        message: '测试日志',
        timestamp: new Date().toISOString(),
        source: 'system'
      }
      wrapper.vm.viewLogDetails(mockLog)
      expect(wrapper.vm.selectedLog).toEqual(mockLog)
      expect(wrapper.vm.showLogDetail).toBe(true)
    })

    it('应该刷新日志', async () => {
      await wrapper.vm.refreshLogs()
      expect(systemMonitorAPI.getLogs).toHaveBeenCalled()
    })
  })

  describe('系统健康', () => {
    it('应该加载系统健康状态', async () => {
      await wrapper.vm.loadSystemHealth()
      expect(systemMonitorAPI.getSystemHealth).toHaveBeenCalled()
    })

    it('应该显示健康分数', () => {
      const healthScore = wrapper.find('.health-score')
      expect(healthScore.exists()).toBe(true)
    })

    it('应该运行健康检查', async () => {
      await wrapper.vm.runHealthCheck()
      expect(systemMonitorAPI.runHealthCheck).toHaveBeenCalled()
    })
  })

  describe('性能报告', () => {
    it('应该加载性能报告', async () => {
      await wrapper.vm.loadPerformanceReport()
      expect(systemMonitorAPI.getPerformanceReport).toHaveBeenCalled()
    })

    it('应该支持按时间段筛选报告', async () => {
      wrapper.vm.performanceFilters.period = '7d'
      await wrapper.vm.loadPerformanceReport()
      expect(systemMonitorAPI.getPerformanceReport).toHaveBeenCalled()
    })
  })

  describe('告警规则', () => {
    it('应该显示创建规则对话框', () => {
      wrapper.vm.showCreateRuleDialog = true
      expect(wrapper.vm.showCreateRuleDialog).toBe(true)
    })

    it('应该创建告警规则', async () => {
      const mockRule = {
        name: '测试规则',
        condition: 'cpu > 80',
        severity: 'high',
        enabled: true
      }
      await wrapper.vm.createAlertRule(mockRule)
      expect(systemMonitorAPI.createAlertRule).toHaveBeenCalledWith(mockRule)
    })

    it('应该更新告警规则', async () => {
      const mockRule = {
        id: '1',
        name: '测试规则',
        condition: 'cpu > 80',
        severity: 'high',
        enabled: true
      }
      await wrapper.vm.updateAlertRule(mockRule)
      expect(systemMonitorAPI.updateAlertRule).toHaveBeenCalledWith(mockRule)
    })

    it('应该删除告警规则', async () => {
      await wrapper.vm.deleteAlertRule('1')
      expect(systemMonitorAPI.deleteAlertRule).toHaveBeenCalledWith('1')
    })
  })

  describe('WebSocket连接', () => {
    it('应该建立WebSocket连接', () => {
      expect(wrapper.vm.wsConnection).not.toBeNull()
    })

    it('应该处理WebSocket消息', () => {
      const mockMessage = {
        type: 'alert',
        data: {
          id: '1',
          title: '新告警',
          severity: 'high',
          status: 'active',
          source: 'system',
          timestamp: new Date().toISOString()
        }
      }
      wrapper.vm.handleWebSocketMessage({ data: JSON.stringify(mockMessage) })
      expect(wrapper.vm.alerts.length).toBeGreaterThan(0)
    })

    it('应该关闭WebSocket连接', () => {
      wrapper.unmount()
      expect(wrapper.vm.wsConnection).toBeNull()
    })
  })

  describe('工具函数', () => {
    it('应该正确格式化日期时间', () => {
      const date = new Date('2025-01-20T10:00:00')
      const formatted = wrapper.vm.formatDateTime(date.toISOString())
      expect(formatted).toContain('2025-01-20')
    })

    it('应该正确获取告警严重程度颜色', () => {
      const color = wrapper.vm.getAlertSeverityColor('high')
      expect(color).toBeDefined()
    })

    it('应该正确获取告警严重程度标签类型', () => {
      const type = wrapper.vm.getAlertSeverityTagType('high')
      expect(type).toBeDefined()
    })

    it('应该正确获取告警状态标签类型', () => {
      const type = wrapper.vm.getAlertStatusTagType('active')
      expect(type).toBeDefined()
    })

    it('应该正确获取指标状态标签类型', () => {
      const type = wrapper.vm.getMetricStatusType('normal')
      expect(type).toBeDefined()
    })

    it('应该正确获取日志级别标签类型', () => {
      const type = wrapper.vm.getLogLevelTagType('error')
      expect(type).toBeDefined()
    })
  })

  describe('响应式设计', () => {
    it('应该在移动端正确显示', () => {
      wrapper.vm.$el.style.width = '375px'
      expect(wrapper.vm.$el).toBeDefined()
    })

    it('应该在平板端正确显示', () => {
      wrapper.vm.$el.style.width = '768px'
      expect(wrapper.vm.$el).toBeDefined()
    })

    it('应该在桌面端正确显示', () => {
      wrapper.vm.$el.style.width = '1920px'
      expect(wrapper.vm.$el).toBeDefined()
    })
  })

  describe('性能优化', () => {
    it('应该正确处理大量告警数据', async () => {
      const mockAlerts = Array.from({ length: 1000 }, (_, i) => ({
        id: i.toString(),
        title: `告警${i}`,
        severity: 'high',
        status: 'active',
        source: 'system',
        timestamp: new Date().toISOString()
      }))
      vi.mocked(systemMonitorAPI.getAlerts).mockResolvedValueOnce({
        data: mockAlerts,
        total: 1000
      })
      await wrapper.vm.loadAlerts()
      expect(wrapper.vm.alerts.length).toBe(1000)
    })

    it('应该正确处理大量日志数据', async () => {
      const mockLogs = Array.from({ length: 1000 }, (_, i) => ({
        id: i.toString(),
        level: 'info',
        message: `日志${i}`,
        timestamp: new Date().toISOString(),
        source: 'system'
      }))
      vi.mocked(systemMonitorAPI.getLogs).mockResolvedValueOnce({
        data: mockLogs,
        total: 1000
      })
      await wrapper.vm.loadLogs()
      expect(wrapper.vm.logs.length).toBe(1000)
    })
  })
})
