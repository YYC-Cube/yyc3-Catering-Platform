import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import OperationalAnalytics from '@/components/analytics/OperationalAnalytics.vue'

vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn()
    }
  }
})

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

describe('OperationalAnalytics组件', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(OperationalAnalytics, {
      global: {
        stubs: {
          'el-card': true,
          'el-row': true,
          'el-col': true,
          'el-button': true,
          'el-button-group': true,
          'el-icon': true,
          'el-alert': true,
          'el-rate': true,
          'el-table': true,
          'el-table-column': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-dialog': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-progress': true,
          'el-statistic': true,
          'el-tag': true,
          'el-tooltip': true,
          'el-popover': true,
          'el-switch': true,
          'el-slider': true,
          'el-divider': true,
          'el-radio-group': true,
          'el-radio-button': true
        }
      }
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('组件渲染', () => {
    it('应该正确渲染组件', () => {
      expect(wrapper.find('.operational-analytics').exists()).toBe(true)
    })

    it('应该正确渲染分析头部', () => {
      expect(wrapper.find('.analytics-header').exists()).toBe(true)
      expect(wrapper.find('.header-title h3').text()).toBe('运营分析')
      expect(wrapper.find('.header-title p').text()).toBe('监控运营效率和服务质量')
    })

    it('应该正确渲染视图模式切换按钮', () => {
      const buttons = wrapper.findAll('.el-button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('应该正确渲染分析内容区域', () => {
      expect(wrapper.find('.analytics-content').exists()).toBe(true)
    })
  })

  describe('视图模式切换', () => {
    it('默认应该显示效率视图', () => {
      expect(wrapper.vm.viewMode).toBe('efficiency')
    })

    it('应该能够切换到成本视图', async () => {
      await wrapper.setData({ viewMode: 'cost' })
      expect(wrapper.vm.viewMode).toBe('cost')
    })

    it('应该能够切换到质量视图', async () => {
      await wrapper.setData({ viewMode: 'quality' })
      expect(wrapper.vm.viewMode).toBe('quality')
    })

    it('应该能够切换到员工视图', async () => {
      await wrapper.setData({ viewMode: 'staff' })
      expect(wrapper.vm.viewMode).toBe('staff')
    })
  })

  describe('效率视图', () => {
    it('应该正确渲染效率视图', async () => {
      await wrapper.setData({ viewMode: 'efficiency' })
      expect(wrapper.find('.efficiency-view').exists()).toBe(true)
    })

    it('应该正确显示效率指标卡片', async () => {
      await wrapper.setData({ viewMode: 'efficiency' })
      const metrics = wrapper.vm.efficiencyMetrics
      expect(metrics).toHaveLength(4)
    })

    it('应该正确显示桌位利用率指标', async () => {
      await wrapper.setData({ viewMode: 'efficiency' })
      const tableUtilization = wrapper.vm.efficiencyMetrics.find((m: any) => m.key === 'tableUtilization')
      expect(tableUtilization).toBeDefined()
      expect(tableUtilization.label).toBe('桌位利用率')
      expect(tableUtilization.value).toBe('78.5%')
      expect(tableUtilization.change).toBe(5.2)
    })

    it('应该正确显示订单处理效率指标', async () => {
      await wrapper.setData({ viewMode: 'efficiency' })
      const orderProcessing = wrapper.vm.efficiencyMetrics.find((m: any) => m.key === 'orderProcessing')
      expect(orderProcessing).toBeDefined()
      expect(orderProcessing.label).toBe('订单处理效率')
      expect(orderProcessing.value).toBe('92.3%')
      expect(orderProcessing.change).toBe(3.8)
    })

    it('应该正确显示厨房效率指标', async () => {
      await wrapper.setData({ viewMode: 'efficiency' })
      const kitchenEfficiency = wrapper.vm.efficiencyMetrics.find((m: any) => m.key === 'kitchenEfficiency')
      expect(kitchenEfficiency).toBeDefined()
      expect(kitchenEfficiency.label).toBe('厨房效率')
      expect(kitchenEfficiency.value).toBe('85.6%')
      expect(kitchenEfficiency.change).toBe(4.5)
    })

    it('应该正确显示员工效率指标', async () => {
      await wrapper.setData({ viewMode: 'efficiency' })
      const staffEfficiency = wrapper.vm.efficiencyMetrics.find((m: any) => m.key === 'staffEfficiency')
      expect(staffEfficiency).toBeDefined()
      expect(staffEfficiency.label).toBe('员工效率')
      expect(staffEfficiency.value).toBe('88.2%')
      expect(staffEfficiency.change).toBe(2.9)
    })

    it('应该显示桌位利用率图表', async () => {
      await wrapper.setData({ viewMode: 'efficiency' })
      expect(wrapper.vm.tableUtilizationChart).toBeDefined()
    })

    it('应该显示高峰时段分析图表', async () => {
      await wrapper.setData({ viewMode: 'efficiency' })
      expect(wrapper.vm.peakHoursChart).toBeDefined()
    })

    it('应该显示订单处理时间图表', async () => {
      await wrapper.setData({ viewMode: 'efficiency' })
      expect(wrapper.vm.orderProcessingChart).toBeDefined()
    })

    it('应该显示出餐速度分析图表', async () => {
      await wrapper.setData({ viewMode: 'efficiency' })
      expect(wrapper.vm.cookingSpeedChart).toBeDefined()
    })

    it('应该显示运营效率趋势图表', async () => {
      await wrapper.setData({ viewMode: 'efficiency' })
      expect(wrapper.vm.efficiencyTrendChart).toBeDefined()
    })
  })

  describe('成本视图', () => {
    it('应该正确渲染成本视图', async () => {
      await wrapper.setData({ viewMode: 'cost' })
      expect(wrapper.find('.cost-view').exists()).toBe(true)
    })

    it('应该正确显示成本指标卡片', async () => {
      await wrapper.setData({ viewMode: 'cost' })
      const metrics = wrapper.vm.costMetrics
      expect(metrics).toHaveLength(4)
    })

    it('应该正确显示总成本指标', async () => {
      await wrapper.setData({ viewMode: 'cost' })
      const totalCost = wrapper.vm.costMetrics.find((m: any) => m.key === 'totalCost')
      expect(totalCost).toBeDefined()
      expect(totalCost.label).toBe('总成本')
      expect(totalCost.value).toBe('¥88,000')
      expect(totalCost.change).toBe(-2.5)
    })

    it('应该正确显示人工成本指标', async () => {
      await wrapper.setData({ viewMode: 'cost' })
      const laborCost = wrapper.vm.costMetrics.find((m: any) => m.key === 'laborCost')
      expect(laborCost).toBeDefined()
      expect(laborCost.label).toBe('人工成本')
      expect(laborCost.value).toBe('¥18,000')
      expect(laborCost.change).toBe(-1.8)
    })

    it('应该正确显示食材成本指标', async () => {
      await wrapper.setData({ viewMode: 'cost' })
      const materialCost = wrapper.vm.costMetrics.find((m: any) => m.key === 'materialCost')
      expect(materialCost).toBeDefined()
      expect(materialCost.label).toBe('食材成本')
      expect(materialCost.value).toBe('¥45,000')
      expect(materialCost.change).toBe(-3.2)
    })

    it('应该正确显示成本占比指标', async () => {
      await wrapper.setData({ viewMode: 'cost' })
      const costRatio = wrapper.vm.costMetrics.find((m: any) => m.key === 'costRatio')
      expect(costRatio).toBeDefined()
      expect(costRatio.label).toBe('成本占比')
      expect(costRatio.value).toBe('47.7%')
      expect(costRatio.change).toBe(-1.5)
    })

    it('应该显示成本构成分析图表', async () => {
      await wrapper.setData({ viewMode: 'cost' })
      expect(wrapper.vm.costCompositionChart).toBeDefined()
    })

    it('应该显示成本趋势图表', async () => {
      await wrapper.setData({ viewMode: 'cost' })
      expect(wrapper.vm.costTrendChart).toBeDefined()
    })

    it('应该显示单位成本分析图表', async () => {
      await wrapper.setData({ viewMode: 'cost' })
      expect(wrapper.vm.unitCostChart).toBeDefined()
    })

    it('应该显示成本控制建议', async () => {
      await wrapper.setData({ viewMode: 'cost' })
      const suggestions = wrapper.vm.costControlSuggestions
      expect(suggestions).toHaveLength(3)
      expect(suggestions[0].title).toBe('优化食材采购')
    })

    it('应该显示成本效益分析图表', async () => {
      await wrapper.setData({ viewMode: 'cost' })
      expect(wrapper.vm.costBenefitChart).toBeDefined()
    })
  })

  describe('质量视图', () => {
    it('应该正确渲染质量视图', async () => {
      await wrapper.setData({ viewMode: 'quality' })
      expect(wrapper.find('.quality-view').exists()).toBe(true)
    })

    it('应该正确显示质量指标卡片', async () => {
      await wrapper.setData({ viewMode: 'quality' })
      const metrics = wrapper.vm.qualityMetrics
      expect(metrics).toHaveLength(4)
    })

    it('应该正确显示客户满意度指标', async () => {
      await wrapper.setData({ viewMode: 'quality' })
      const satisfaction = wrapper.vm.qualityMetrics.find((m: any) => m.key === 'satisfaction')
      expect(satisfaction).toBeDefined()
      expect(satisfaction.label).toBe('客户满意度')
      expect(satisfaction.value).toBe('4.6/5.0')
      expect(satisfaction.change).toBe(5.5)
    })

    it('应该正确显示投诉率指标', async () => {
      await wrapper.setData({ viewMode: 'quality' })
      const complaintRate = wrapper.vm.qualityMetrics.find((m: any) => m.key === 'complaintRate')
      expect(complaintRate).toBeDefined()
      expect(complaintRate.label).toBe('投诉率')
      expect(complaintRate.value).toBe('1.2%')
      expect(complaintRate.change).toBe(-15.8)
    })

    it('应该正确显示平均响应时间指标', async () => {
      await wrapper.setData({ viewMode: 'quality' })
      const responseTime = wrapper.vm.qualityMetrics.find((m: any) => m.key === 'responseTime')
      expect(responseTime).toBeDefined()
      expect(responseTime.label).toBe('平均响应时间')
      expect(responseTime.value).toBe('3.2分钟')
      expect(responseTime.change).toBe(-8.5)
    })

    it('应该正确显示问题解决率指标', async () => {
      await wrapper.setData({ viewMode: 'quality' })
      const resolutionRate = wrapper.vm.qualityMetrics.find((m: any) => m.key === 'resolutionRate')
      expect(resolutionRate).toBeDefined()
      expect(resolutionRate.label).toBe('问题解决率')
      expect(resolutionRate.value).toBe('96.5%')
      expect(resolutionRate.change).toBe(2.3)
    })

    it('应该显示客户满意度趋势图表', async () => {
      await wrapper.setData({ viewMode: 'quality' })
      expect(wrapper.vm.satisfactionTrendChart).toBeDefined()
    })

    it('应该显示投诉率分析图表', async () => {
      await wrapper.setData({ viewMode: 'quality' })
      expect(wrapper.vm.complaintRateChart).toBeDefined()
    })

    it('应该显示处理时效分析图表', async () => {
      await wrapper.setData({ viewMode: 'quality' })
      expect(wrapper.vm.responseTimeChart).toBeDefined()
    })

    it('应该显示服务质量评分', async () => {
      await wrapper.setData({ viewMode: 'quality' })
      const scores = wrapper.vm.qualityScores
      expect(scores).toHaveLength(5)
      expect(scores[0].label).toBe('服务态度')
      expect(scores[0].value).toBe(4.7)
    })

    it('应该显示客户反馈分析图表', async () => {
      await wrapper.setData({ viewMode: 'quality' })
      expect(wrapper.vm.feedbackChart).toBeDefined()
    })
  })

  describe('员工视图', () => {
    it('应该正确渲染员工视图', async () => {
      await wrapper.setData({ viewMode: 'staff' })
      expect(wrapper.find('.staff-view').exists()).toBe(true)
    })

    it('应该正确显示员工指标卡片', async () => {
      await wrapper.setData({ viewMode: 'staff' })
      const metrics = wrapper.vm.staffMetrics
      expect(metrics).toHaveLength(4)
    })

    it('应该正确显示员工总数指标', async () => {
      await wrapper.setData({ viewMode: 'staff' })
      const totalStaff = wrapper.vm.staffMetrics.find((m: any) => m.key === 'totalStaff')
      expect(totalStaff).toBeDefined()
      expect(totalStaff.label).toBe('员工总数')
      expect(totalStaff.value).toBe(45)
      expect(totalStaff.change).toBe(5.0)
    })

    it('应该正确显示人均订单指标', async () => {
      await wrapper.setData({ viewMode: 'staff' })
      const avgOrders = wrapper.vm.staffMetrics.find((m: any) => m.key === 'avgOrders')
      expect(avgOrders).toBeDefined()
      expect(avgOrders.label).toBe('人均订单')
      expect(avgOrders.value).toBe(41.2)
      expect(avgOrders.change).toBe(8.3)
    })

    it('应该正确显示平均处理时间指标', async () => {
      await wrapper.setData({ viewMode: 'staff' })
      const avgTime = wrapper.vm.staffMetrics.find((m: any) => m.key === 'avgTime')
      expect(avgTime).toBeDefined()
      expect(avgTime.label).toBe('平均处理时间')
      expect(avgTime.value).toBe('4.8分钟')
      expect(avgTime.change).toBe(-5.2)
    })

    it('应该正确显示员工满意度指标', async () => {
      await wrapper.setData({ viewMode: 'staff' })
      const satisfaction = wrapper.vm.staffMetrics.find((m: any) => m.key === 'satisfaction')
      expect(satisfaction).toBeDefined()
      expect(satisfaction.label).toBe('员工满意度')
      expect(satisfaction.value).toBe('4.2/5.0')
      expect(satisfaction.change).toBe(3.5)
    })

    it('应该显示员工效率排行表格', async () => {
      await wrapper.setData({ viewMode: 'staff' })
      const efficiency = wrapper.vm.staffEfficiency
      expect(efficiency).toHaveLength(5)
      expect(efficiency[0].name).toBe('张三')
      expect(efficiency[0].role).toBe('服务员')
      expect(efficiency[0].ordersProcessed).toBe(185)
    })

    it('应该显示员工工作量分布图表', async () => {
      await wrapper.setData({ viewMode: 'staff' })
      expect(wrapper.vm.workloadChart).toBeDefined()
    })

    it('应该显示员工绩效趋势图表', async () => {
      await wrapper.setData({ viewMode: 'staff' })
      expect(wrapper.vm.performanceTrendChart).toBeDefined()
    })

    it('应该显示排班优化建议', async () => {
      await wrapper.setData({ viewMode: 'staff' })
      const suggestions = wrapper.vm.schedulingSuggestions
      expect(suggestions).toHaveLength(3)
      expect(suggestions[0].title).toBe('增加高峰期人手')
    })

    it('应该显示员工培训与发展图表', async () => {
      await wrapper.setData({ viewMode: 'staff' })
      expect(wrapper.vm.trainingChart).toBeDefined()
    })
  })

  describe('图表初始化', () => {
    it('应该正确初始化桌位利用率图表', () => {
      wrapper.vm.initTableUtilizationChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化高峰时段分析图表', () => {
      wrapper.vm.initPeakHoursChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化订单处理时间图表', () => {
      wrapper.vm.initOrderProcessingChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化出餐速度分析图表', () => {
      wrapper.vm.initCookingSpeedChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化运营效率趋势图表', () => {
      wrapper.vm.initEfficiencyTrendChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化成本构成分析图表', () => {
      wrapper.vm.initCostCompositionChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化成本趋势图表', () => {
      wrapper.vm.initCostTrendChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化单位成本分析图表', () => {
      wrapper.vm.initUnitCostChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化成本效益分析图表', () => {
      wrapper.vm.initCostBenefitChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化客户满意度趋势图表', () => {
      wrapper.vm.initSatisfactionTrendChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化投诉率分析图表', () => {
      wrapper.vm.initComplaintRateChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化处理时效分析图表', () => {
      wrapper.vm.initResponseTimeChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化员工工作量分布图表', () => {
      wrapper.vm.initWorkloadChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化员工绩效趋势图表', () => {
      wrapper.vm.initPerformanceTrendChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化员工培训与发展图表', () => {
      wrapper.vm.initTrainingChart()
      expect(echarts.init).toHaveBeenCalled()
    })
  })

  describe('响应式行为', () => {
    it('应该在视图模式变化时重新初始化图表', async () => {
      await wrapper.setData({ viewMode: 'cost' })
      await nextTick()
      expect(echarts.init).toHaveBeenCalled()
    })
  })

  describe('数据验证', () => {
    it('效率指标数据应该包含所有必需字段', async () => {
      await wrapper.setData({ viewMode: 'efficiency' })
      const metric = wrapper.vm.efficiencyMetrics[0]
      expect(metric).toHaveProperty('key')
      expect(metric).toHaveProperty('label')
      expect(metric).toHaveProperty('value')
      expect(metric).toHaveProperty('change')
      expect(metric).toHaveProperty('icon')
      expect(metric).toHaveProperty('color')
    })

    it('成本指标数据应该包含所有必需字段', async () => {
      await wrapper.setData({ viewMode: 'cost' })
      const metric = wrapper.vm.costMetrics[0]
      expect(metric).toHaveProperty('key')
      expect(metric).toHaveProperty('label')
      expect(metric).toHaveProperty('value')
      expect(metric).toHaveProperty('change')
      expect(metric).toHaveProperty('icon')
      expect(metric).toHaveProperty('color')
    })

    it('质量指标数据应该包含所有必需字段', async () => {
      await wrapper.setData({ viewMode: 'quality' })
      const metric = wrapper.vm.qualityMetrics[0]
      expect(metric).toHaveProperty('key')
      expect(metric).toHaveProperty('label')
      expect(metric).toHaveProperty('value')
      expect(metric).toHaveProperty('change')
      expect(metric).toHaveProperty('icon')
      expect(metric).toHaveProperty('color')
    })

    it('员工指标数据应该包含所有必需字段', async () => {
      await wrapper.setData({ viewMode: 'staff' })
      const metric = wrapper.vm.staffMetrics[0]
      expect(metric).toHaveProperty('key')
      expect(metric).toHaveProperty('label')
      expect(metric).toHaveProperty('value')
      expect(metric).toHaveProperty('change')
      expect(metric).toHaveProperty('icon')
      expect(metric).toHaveProperty('color')
    })

    it('员工效率数据应该包含所有必需字段', async () => {
      await wrapper.setData({ viewMode: 'staff' })
      const staff = wrapper.vm.staffEfficiency[0]
      expect(staff).toHaveProperty('name')
      expect(staff).toHaveProperty('role')
      expect(staff).toHaveProperty('ordersProcessed')
      expect(staff).toHaveProperty('avgTime')
      expect(staff).toHaveProperty('satisfaction')
    })

    it('质量评分数据应该包含所有必需字段', async () => {
      await wrapper.setData({ viewMode: 'quality' })
      const score = wrapper.vm.qualityScores[0]
      expect(score).toHaveProperty('label')
      expect(score).toHaveProperty('value')
    })
  })

  describe('边界情况', () => {
    it('应该处理空图表引用', () => {
      wrapper.vm.tableUtilizationChart.value = null
      expect(() => wrapper.vm.initTableUtilizationChart()).not.toThrow()
    })

    it('应该处理无效的视图模式', async () => {
      await wrapper.setData({ viewMode: 'invalid' })
      expect(wrapper.vm.viewMode).toBe('invalid')
    })
  })
})
