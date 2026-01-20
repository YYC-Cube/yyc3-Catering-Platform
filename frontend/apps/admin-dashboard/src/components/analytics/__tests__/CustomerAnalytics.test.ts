import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import CustomerAnalytics from '@/components/analytics/CustomerAnalytics.vue'

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

describe('CustomerAnalytics组件', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(CustomerAnalytics, {
      global: {
        stubs: {
          'el-card': true,
          'el-row': true,
          'el-col': true,
          'el-button': true,
          'el-button-group': true,
          'el-icon': true,
          'el-alert': true,
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
      expect(wrapper.find('.customer-analytics').exists()).toBe(true)
    })

    it('应该正确渲染分析头部', () => {
      expect(wrapper.find('.analytics-header').exists()).toBe(true)
      expect(wrapper.find('.header-title h3').text()).toBe('客户分析')
      expect(wrapper.find('.header-title p').text()).toBe('了解客户行为和价值贡献')
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
    it('默认应该显示增长视图', () => {
      expect(wrapper.vm.viewMode).toBe('growth')
    })

    it('应该能够切换到分段视图', async () => {
      await wrapper.setData({ viewMode: 'segments' })
      expect(wrapper.vm.viewMode).toBe('segments')
    })

    it('应该能够切换到行为视图', async () => {
      await wrapper.setData({ viewMode: 'behavior' })
      expect(wrapper.vm.viewMode).toBe('behavior')
    })

    it('应该能够切换到价值视图', async () => {
      await wrapper.setData({ viewMode: 'value' })
      expect(wrapper.vm.viewMode).toBe('value')
    })

    it('应该能够切换到地理视图', async () => {
      await wrapper.setData({ viewMode: 'geo' })
      expect(wrapper.vm.viewMode).toBe('geo')
    })
  })

  describe('增长视图', () => {
    it('应该正确渲染增长视图', async () => {
      await wrapper.setData({ viewMode: 'growth' })
      expect(wrapper.find('.growth-view').exists()).toBe(true)
    })

    it('应该显示客户增长趋势图表', async () => {
      await wrapper.setData({ viewMode: 'growth' })
      expect(wrapper.vm.growthChart).toBeDefined()
    })

    it('应该显示客户来源分析图表', async () => {
      await wrapper.setData({ viewMode: 'growth' })
      expect(wrapper.vm.sourceChart).toBeDefined()
    })

    it('应该显示客户留存率图表', async () => {
      await wrapper.setData({ viewMode: 'growth' })
      expect(wrapper.vm.retentionChart).toBeDefined()
    })

    it('应该显示客户流失分析图表', async () => {
      await wrapper.setData({ viewMode: 'growth' })
      expect(wrapper.vm.churnChart).toBeDefined()
    })

    it('应该能够切换增长粒度', async () => {
      await wrapper.setData({ viewMode: 'growth', growthGranularity: 'week' })
      expect(wrapper.vm.growthGranularity).toBe('week')
    })

    it('应该能够加载增长数据', async () => {
      await wrapper.vm.loadGrowthData()
      expect(ElMessage.info).toHaveBeenCalledWith('加载增长数据...')
    })
  })

  describe('分段视图', () => {
    it('应该正确渲染分段视图', async () => {
      await wrapper.setData({ viewMode: 'segments' })
      expect(wrapper.find('.segments-view').exists()).toBe(true)
    })

    it('应该显示客户分段概览', async () => {
      await wrapper.setData({ viewMode: 'segments' })
      expect(wrapper.find('.segment-overview').exists()).toBe(true)
    })

    it('应该正确显示客户分段数据', async () => {
      await wrapper.setData({ viewMode: 'segments' })
      const segments = wrapper.vm.customerSegments
      expect(segments).toHaveLength(4)
      expect(segments[0].name).toBe('核心客户')
      expect(segments[0].count).toBe(125)
      expect(segments[0].percentage).toBe(25)
    })

    it('应该显示分段特征分析图表', async () => {
      await wrapper.setData({ viewMode: 'segments' })
      expect(wrapper.vm.segmentRadarChart).toBeDefined()
    })

    it('应该显示RFM客户价值矩阵图表', async () => {
      await wrapper.setData({ viewMode: 'segments' })
      expect(wrapper.vm.rfmMatrixChart).toBeDefined()
    })

    it('应该正确显示核心客户分段', async () => {
      await wrapper.setData({ viewMode: 'segments' })
      const coreSegment = wrapper.vm.customerSegments.find((s: any) => s.name === '核心客户')
      expect(coreSegment).toBeDefined()
      expect(coreSegment.tagType).toBe('danger')
      expect(coreSegment.color).toBe('#F56C6C')
    })

    it('应该正确显示重要客户分段', async () => {
      await wrapper.setData({ viewMode: 'segments' })
      const importantSegment = wrapper.vm.customerSegments.find((s: any) => s.name === '重要客户')
      expect(importantSegment).toBeDefined()
      expect(importantSegment.tagType).toBe('warning')
      expect(importantSegment.color).toBe('#E6A23C')
    })

    it('应该正确显示普通客户分段', async () => {
      await wrapper.setData({ viewMode: 'segments' })
      const normalSegment = wrapper.vm.customerSegments.find((s: any) => s.name === '普通客户')
      expect(normalSegment).toBeDefined()
      expect(normalSegment.tagType).toBe('primary')
      expect(normalSegment.color).toBe('#409EFF')
    })

    it('应该正确显示潜在客户分段', async () => {
      await wrapper.setData({ viewMode: 'segments' })
      const potentialSegment = wrapper.vm.customerSegments.find((s: any) => s.name === '潜在客户')
      expect(potentialSegment).toBeDefined()
      expect(potentialSegment.tagType).toBe('info')
      expect(potentialSegment.color).toBe('#909399')
    })
  })

  describe('行为视图', () => {
    it('应该正确渲染行为视图', async () => {
      await wrapper.setData({ viewMode: 'behavior' })
      expect(wrapper.find('.behavior-view').exists()).toBe(true)
    })

    it('应该显示消费频次分布图表', async () => {
      await wrapper.setData({ viewMode: 'behavior' })
      expect(wrapper.vm.frequencyChart).toBeDefined()
    })

    it('应该显示消费金额分布图表', async () => {
      await wrapper.setData({ viewMode: 'behavior' })
      expect(wrapper.vm.amountChart).toBeDefined()
    })

    it('应该显示消费时间偏好图表', async () => {
      await wrapper.setData({ viewMode: 'behavior' })
      expect(wrapper.vm.timePreferenceChart).toBeDefined()
    })

    it('应该显示菜品偏好分析图表', async () => {
      await wrapper.setData({ viewMode: 'behavior' })
      expect(wrapper.vm.dishPreferenceChart).toBeDefined()
    })

    it('应该显示客户行为路径图表', async () => {
      await wrapper.setData({ viewMode: 'behavior' })
      expect(wrapper.vm.behaviorPathChart).toBeDefined()
    })
  })

  describe('价值视图', () => {
    it('应该正确渲染价值视图', async () => {
      await wrapper.setData({ viewMode: 'value' })
      expect(wrapper.find('.value-view').exists()).toBe(true)
    })

    it('应该正确显示价值指标卡片', async () => {
      await wrapper.setData({ viewMode: 'value' })
      const metrics = wrapper.vm.valueMetrics
      expect(metrics).toHaveLength(4)
    })

    it('应该正确显示客户总数指标', async () => {
      await wrapper.setData({ viewMode: 'value' })
      const totalCustomers = wrapper.vm.valueMetrics.find((m: any) => m.key === 'totalCustomers')
      expect(totalCustomers).toBeDefined()
      expect(totalCustomers.label).toBe('客户总数')
      expect(totalCustomers.value).toBe(500)
      expect(totalCustomers.change).toBe(12.5)
    })

    it('应该正确显示平均终身价值指标', async () => {
      await wrapper.setData({ viewMode: 'value' })
      const avgLTV = wrapper.vm.valueMetrics.find((m: any) => m.key === 'avgLTV')
      expect(avgLTV).toBeDefined()
      expect(avgLTV.label).toBe('平均终身价值')
      expect(avgLTV.value).toBe('¥3,250')
      expect(avgLTV.change).toBe(8.3)
    })

    it('应该正确显示客户保留率指标', async () => {
      await wrapper.setData({ viewMode: 'value' })
      const retentionRate = wrapper.vm.valueMetrics.find((m: any) => m.key === 'retentionRate')
      expect(retentionRate).toBeDefined()
      expect(retentionRate.label).toBe('客户保留率')
      expect(retentionRate.value).toBe('85.2%')
      expect(retentionRate.change).toBe(2.1)
    })

    it('应该正确显示客户满意度指标', async () => {
      await wrapper.setData({ viewMode: 'value' })
      const satisfaction = wrapper.vm.valueMetrics.find((m: any) => m.key === 'satisfaction')
      expect(satisfaction).toBeDefined()
      expect(satisfaction.label).toBe('客户满意度')
      expect(satisfaction.value).toBe('4.6/5.0')
      expect(satisfaction.change).toBe(5.5)
    })

    it('应该显示客户价值趋势图表', async () => {
      await wrapper.setData({ viewMode: 'value' })
      expect(wrapper.vm.valueTrendChart).toBeDefined()
    })

    it('应该显示高价值客户TOP10表格', async () => {
      await wrapper.setData({ viewMode: 'value' })
      const topCustomers = wrapper.vm.topValueCustomers
      expect(topCustomers).toHaveLength(10)
      expect(topCustomers[0].name).toBe('张三')
      expect(topCustomers[0].ltv).toBe(15800)
    })

    it('应该显示客户生命周期价值分析图表', async () => {
      await wrapper.setData({ viewMode: 'value' })
      expect(wrapper.vm.ltvChart).toBeDefined()
    })
  })

  describe('地理视图', () => {
    it('应该正确渲染地理视图', async () => {
      await wrapper.setData({ viewMode: 'geo' })
      expect(wrapper.find('.geo-view').exists()).toBe(true)
    })

    it('应该显示客户地理分布图表', async () => {
      await wrapper.setData({ viewMode: 'geo' })
      expect(wrapper.vm.geoChart).toBeDefined()
    })

    it('应该显示区域销售排行表格', async () => {
      await wrapper.setData({ viewMode: 'geo' })
      const regionSales = wrapper.vm.regionSales
      expect(regionSales).toHaveLength(4)
      expect(regionSales[0].region).toBe('朝阳区')
      expect(regionSales[0].customers).toBe(180)
      expect(regionSales[0].revenue).toBe(285000)
    })

    it('应该显示配送区域分析图表', async () => {
      await wrapper.setData({ viewMode: 'geo' })
      expect(wrapper.vm.deliveryChart).toBeDefined()
    })

    it('应该显示区域对比分析图表', async () => {
      await wrapper.setData({ viewMode: 'geo' })
      expect(wrapper.vm.regionCompareChart).toBeDefined()
    })
  })

  describe('图表初始化', () => {
    it('应该正确初始化增长趋势图表', () => {
      wrapper.vm.initGrowthChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化客户来源图表', () => {
      wrapper.vm.initSourceChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化客户留存率图表', () => {
      wrapper.vm.initRetentionChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化客户流失图表', () => {
      wrapper.vm.initChurnChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化分段雷达图表', () => {
      wrapper.vm.initSegmentRadarChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化RFM矩阵图表', () => {
      wrapper.vm.initRfmMatrixChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化消费频次图表', () => {
      wrapper.vm.initFrequencyChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化消费金额图表', () => {
      wrapper.vm.initAmountChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化时间偏好图表', () => {
      wrapper.vm.initTimePreferenceChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化菜品偏好图表', () => {
      wrapper.vm.initDishPreferenceChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化行为路径图表', () => {
      wrapper.vm.initBehaviorPathChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化价值趋势图表', () => {
      wrapper.vm.initValueTrendChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化生命周期价值图表', () => {
      wrapper.vm.initLtvChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化地理分布图表', () => {
      wrapper.vm.initGeoChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化配送区域图表', () => {
      wrapper.vm.initDeliveryChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化区域对比图表', () => {
      wrapper.vm.initRegionCompareChart()
      expect(echarts.init).toHaveBeenCalled()
    })
  })

  describe('响应式行为', () => {
    it('应该在视图模式变化时重新初始化图表', async () => {
      await wrapper.setData({ viewMode: 'segments' })
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确处理增长粒度变化', async () => {
      await wrapper.setData({ viewMode: 'growth', growthGranularity: 'week' })
      expect(wrapper.vm.growthGranularity).toBe('week')
    })
  })

  describe('数据验证', () => {
    it('客户分段数据应该包含所有必需字段', async () => {
      await wrapper.setData({ viewMode: 'segments' })
      const segment = wrapper.vm.customerSegments[0]
      expect(segment).toHaveProperty('name')
      expect(segment).toHaveProperty('count')
      expect(segment).toHaveProperty('percentage')
      expect(segment).toHaveProperty('avgSpent')
      expect(segment).toHaveProperty('frequency')
      expect(segment).toHaveProperty('tagType')
      expect(segment).toHaveProperty('color')
    })

    it('价值指标数据应该包含所有必需字段', async () => {
      await wrapper.setData({ viewMode: 'value' })
      const metric = wrapper.vm.valueMetrics[0]
      expect(metric).toHaveProperty('key')
      expect(metric).toHaveProperty('label')
      expect(metric).toHaveProperty('value')
      expect(metric).toHaveProperty('change')
      expect(metric).toHaveProperty('icon')
      expect(metric).toHaveProperty('color')
    })

    it('高价值客户数据应该包含所有必需字段', async () => {
      await wrapper.setData({ viewMode: 'value' })
      const customer = wrapper.vm.topValueCustomers[0]
      expect(customer).toHaveProperty('name')
      expect(customer).toHaveProperty('ltv')
    })

    it('区域销售数据应该包含所有必需字段', async () => {
      await wrapper.setData({ viewMode: 'geo' })
      const region = wrapper.vm.regionSales[0]
      expect(region).toHaveProperty('region')
      expect(region).toHaveProperty('customers')
      expect(region).toHaveProperty('revenue')
    })
  })

  describe('边界情况', () => {
    it('应该处理空图表引用', () => {
      wrapper.vm.growthChart.value = null
      expect(() => wrapper.vm.initGrowthChart()).not.toThrow()
    })

    it('应该处理无效的视图模式', async () => {
      await wrapper.setData({ viewMode: 'invalid' })
      expect(wrapper.vm.viewMode).toBe('invalid')
    })
  })
})
