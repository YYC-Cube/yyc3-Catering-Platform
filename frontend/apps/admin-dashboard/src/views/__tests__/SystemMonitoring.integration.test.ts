/**
 * @fileoverview 系统监控集成测试
 * @description 测试系统监控模块的组件交互和数据流
 * @module SystemMonitoring.integration.test
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import SystemMonitoring from '@/views/SystemMonitoring.vue'
import { systemMonitorAPI } from '@/api/system-monitor'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/system-monitoring', component: SystemMonitoring }
  ]
})

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
        },
        {
          id: '2',
          name: '内存使用率',
          value: 62.5,
          unit: '%',
          status: 'normal',
          category: 'system',
          history: []
        },
        {
          id: '3',
          name: '磁盘使用率',
          value: 78.3,
          unit: '%',
          status: 'warning',
          category: 'storage',
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
        },
        {
          id: '2',
          title: '磁盘空间不足',
          severity: 'medium',
          status: 'active',
          source: 'storage',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          description: '磁盘使用率超过75%'
        }
      ],
      total: 2
    })),
    getLogs: vi.fn(() => Promise.resolve({
      data: [
        {
          id: '1',
          level: 'info',
          message: '系统启动',
          timestamp: new Date().toISOString(),
          source: 'system'
        },
        {
          id: '2',
          level: 'warn',
          message: 'CPU使用率偏高',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          source: 'system'
        },
        {
          id: '3',
          level: 'error',
          message: '磁盘空间不足',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          source: 'storage'
        }
      ],
      total: 3
    })),
    getSystemHealth: vi.fn(() => Promise.resolve({
      data: {
        status: 'healthy',
        score: 95,
        components: [
          {
            name: 'CPU',
            status: 'healthy',
            score: 90
          },
          {
            name: '内存',
            status: 'healthy',
            score: 85
          },
          {
            name: '磁盘',
            status: 'warning',
            score: 75
          }
        ],
        lastCheck: new Date().toISOString()
      }
    })),
    getPerformanceReport: vi.fn(() => Promise.resolve({
      data: {
        period: '24h',
        metrics: [
          {
            name: 'CPU使用率',
            average: 45.2,
            max: 78.5,
            min: 12.3
          },
          {
            name: '内存使用率',
            average: 62.5,
            max: 85.2,
            min: 45.1
          }
        ],
        trends: [],
        recommendations: [
          '建议优化内存使用',
          '建议清理磁盘空间'
        ]
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

describe('SystemMonitoring集成测试', () => {
  let wrapper: VueWrapper<any>
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    wrapper = mount(SystemMonitoring, {
      global: {
        plugins: [pinia, router, ElementPlus],
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
          'el-empty': true,
          'MetricChart': true,
          'AlertDetail': true,
          'LogDetail': true,
          'AlertRuleForm': true,
          'PerformanceReport': true,
          'SystemHealthCheck': true
        }
      }
    })

    router.push('/system-monitoring')
    vi.clearAllMocks()
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('组件集成', () => {
    it('应该正确加载所有数据', async () => {
      await wrapper.vm.loadMetrics()
      await wrapper.vm.loadAlerts()
      await wrapper.vm.loadLogs()
      await wrapper.vm.loadSystemHealth()
      await wrapper.vm.loadPerformanceReport()

      expect(systemMonitorAPI.getMetrics).toHaveBeenCalled()
      expect(systemMonitorAPI.getAlerts).toHaveBeenCalled()
      expect(systemMonitorAPI.getLogs).toHaveBeenCalled()
      expect(systemMonitorAPI.getSystemHealth).toHaveBeenCalled()
      expect(systemMonitorAPI.getPerformanceReport).toHaveBeenCalled()
    })

    it('应该正确显示系统概览', () => {
      const overviewCards = wrapper.findAll('.overview-card')
      expect(overviewCards.length).toBeGreaterThan(0)
    })

    it('应该正确切换标签页', async () => {
      const tabs = wrapper.find('.monitoring-tabs')
      expect(tabs.exists()).toBe(true)

      wrapper.vm.activeTab = 'alerts'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.activeTab).toBe('alerts')

      wrapper.vm.activeTab = 'logs'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.activeTab).toBe('logs')

      wrapper.vm.activeTab = 'health'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.activeTab).toBe('health')

      wrapper.vm.activeTab = 'performance'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.activeTab).toBe('performance')
    })
  })

  describe('告警流程集成', () => {
    it('应该完整处理告警生命周期', async () => {
      await wrapper.vm.loadAlerts()

      const activeAlert = wrapper.vm.alerts.find((a: any) => a.status === 'active')
      expect(activeAlert).toBeDefined()

      await wrapper.vm.acknowledgeAlert(activeAlert)
      expect(systemMonitorAPI.acknowledgeAlert).toHaveBeenCalledWith(activeAlert.id)

      await wrapper.vm.resolveAlert(activeAlert)
      expect(systemMonitorAPI.resolveAlert).toHaveBeenCalledWith(activeAlert.id)
    })

    it('应该正确筛选告警', async () => {
      await wrapper.vm.loadAlerts()

      wrapper.vm.alertFilters.severity = ['high']
      await wrapper.vm.loadAlerts()
      expect(systemMonitorAPI.getAlerts).toHaveBeenCalled()

      wrapper.vm.alertFilters.status = ['active']
      await wrapper.vm.loadAlerts()
      expect(systemMonitorAPI.getAlerts).toHaveBeenCalled()
    })

    it('应该正确搜索告警', async () => {
      await wrapper.vm.loadAlerts()

      wrapper.vm.alertFilters.search = 'CPU'
      await wrapper.vm.handleAlertSearch()
      expect(systemMonitorAPI.getAlerts).toHaveBeenCalled()
    })
  })

  describe('日志流程集成', () => {
    it('应该正确加载和显示日志', async () => {
      await wrapper.vm.loadLogs()

      expect(wrapper.vm.logs.length).toBeGreaterThan(0)
      expect(systemMonitorAPI.getLogs).toHaveBeenCalled()
    })

    it('应该正确筛选日志', async () => {
      await wrapper.vm.loadLogs()

      wrapper.vm.logFilters.level = ['error']
      await wrapper.vm.loadLogs()
      expect(systemMonitorAPI.getLogs).toHaveBeenCalled()

      wrapper.vm.logDateRange = [new Date(), new Date()]
      await wrapper.vm.handleLogDateChange()
      expect(systemMonitorAPI.getLogs).toHaveBeenCalled()
    })

    it('应该正确搜索日志', async () => {
      await wrapper.vm.loadLogs()

      wrapper.vm.logFilters.search = 'error'
      await wrapper.vm.handleLogSearch()
      expect(systemMonitorAPI.getLogs).toHaveBeenCalled()
    })
  })

  describe('系统健康集成', () => {
    it('应该正确显示系统健康状态', async () => {
      await wrapper.vm.loadSystemHealth()

      expect(wrapper.vm.systemHealth).toBeDefined()
      expect(wrapper.vm.systemHealth.status).toBe('healthy')
      expect(wrapper.vm.systemHealth.score).toBe(95)
    })

    it('应该正确运行健康检查', async () => {
      await wrapper.vm.runHealthCheck()
      expect(systemMonitorAPI.runHealthCheck).toHaveBeenCalled()
    })
  })

  describe('性能报告集成', () => {
    it('应该正确加载性能报告', async () => {
      await wrapper.vm.loadPerformanceReport()

      expect(wrapper.vm.performanceReport).toBeDefined()
      expect(systemMonitorAPI.getPerformanceReport).toHaveBeenCalled()
    })

    it('应该正确筛选性能报告', async () => {
      wrapper.vm.performanceFilters.period = '7d'
      await wrapper.vm.loadPerformanceReport()
      expect(systemMonitorAPI.getPerformanceReport).toHaveBeenCalled()
    })
  })

  describe('告警规则集成', () => {
    it('应该正确创建告警规则', async () => {
      const mockRule = {
        name: '测试规则',
        condition: 'cpu > 80',
        severity: 'high',
        enabled: true
      }

      await wrapper.vm.createAlertRule(mockRule)
      expect(systemMonitorAPI.createAlertRule).toHaveBeenCalledWith(mockRule)
    })

    it('应该正确更新告警规则', async () => {
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

    it('应该正确删除告警规则', async () => {
      await wrapper.vm.deleteAlertRule('1')
      expect(systemMonitorAPI.deleteAlertRule).toHaveBeenCalledWith('1')
    })
  })

  describe('数据导出集成', () => {
    it('应该正确导出指标数据', async () => {
      await wrapper.vm.exportMetrics()
      expect(systemMonitorAPI.exportMetrics).toHaveBeenCalled()
    })

    it('应该正确导出告警数据', async () => {
      await wrapper.vm.exportAlerts()
      expect(systemMonitorAPI.exportAlerts).toHaveBeenCalled()
    })

    it('应该正确导出日志数据', async () => {
      await wrapper.vm.exportLogs()
      expect(systemMonitorAPI.exportLogs).toHaveBeenCalled()
    })
  })

  describe('实时更新集成', () => {
    it('应该正确处理WebSocket消息', () => {
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

    it('应该正确建立WebSocket连接', () => {
      expect(wrapper.vm.wsConnection).not.toBeNull()
    })

    it('应该正确关闭WebSocket连接', () => {
      wrapper.unmount()
      expect(wrapper.vm.wsConnection).toBeNull()
    })
  })

  describe('分页集成', () => {
    it('应该正确处理告警分页', async () => {
      await wrapper.vm.loadAlerts()

      wrapper.vm.alertPagination.page = 2
      await wrapper.vm.handleAlertPageChange(2)
      expect(systemMonitorAPI.getAlerts).toHaveBeenCalled()

      wrapper.vm.alertPagination.pageSize = 50
      await wrapper.vm.handleAlertSizeChange(50)
      expect(systemMonitorAPI.getAlerts).toHaveBeenCalled()
    })

    it('应该正确处理日志分页', async () => {
      await wrapper.vm.loadLogs()

      wrapper.vm.logPagination.page = 2
      await wrapper.vm.handleLogPageChange(2)
      expect(systemMonitorAPI.getLogs).toHaveBeenCalled()

      wrapper.vm.logPagination.pageSize = 100
      await wrapper.vm.handleLogSizeChange(100)
      expect(systemMonitorAPI.getLogs).toHaveBeenCalled()
    })
  })

  describe('错误处理集成', () => {
    it('应该正确处理API错误', async () => {
      vi.mocked(systemMonitorAPI.getMetrics).mockRejectedValueOnce(new Error('API错误'))
      
      try {
        await wrapper.vm.loadMetrics()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('应该正确处理WebSocket错误', () => {
      const mockError = new Error('WebSocket错误')
      wrapper.vm.handleWebSocketError(mockError)
      expect(wrapper.vm.wsConnection).toBeNull()
    })

    it('应该正确处理WebSocket关闭', () => {
      wrapper.vm.handleWebSocketClose()
      expect(wrapper.vm.wsConnection).toBeNull()
    })
  })

  describe('性能集成', () => {
    it('应该正确处理大量数据', async () => {
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

    it('应该正确处理实时数据更新', async () => {
      await wrapper.vm.loadMetrics()
      await wrapper.vm.loadAlerts()
      await wrapper.vm.loadLogs()

      await wrapper.vm.refreshMetrics()
      await wrapper.vm.refreshAlerts()
      await wrapper.vm.refreshLogs()

      expect(systemMonitorAPI.getMetrics).toHaveBeenCalled()
      expect(systemMonitorAPI.getAlerts).toHaveBeenCalled()
      expect(systemMonitorAPI.getLogs).toHaveBeenCalled()
    })
  })

  describe('用户体验集成', () => {
    it('应该正确显示加载状态', async () => {
      wrapper.vm.loading = true
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.loading).toBe(true)

      wrapper.vm.loading = false
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.loading).toBe(false)
    })

    it('应该正确显示空状态', async () => {
      vi.mocked(systemMonitorAPI.getAlerts).mockResolvedValueOnce({
        data: [],
        total: 0
      })

      await wrapper.vm.loadAlerts()
      expect(wrapper.vm.alerts.length).toBe(0)
    })

    it('应该正确显示错误状态', async () => {
      vi.mocked(systemMonitorAPI.getMetrics).mockRejectedValueOnce(new Error('API错误'))

      try {
        await wrapper.vm.loadMetrics()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })
})
