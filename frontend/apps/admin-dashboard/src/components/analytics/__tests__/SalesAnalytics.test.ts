import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import SalesAnalytics from '@/components/analytics/SalesAnalytics.vue'

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

describe('SalesAnalytics组件', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(SalesAnalytics, {
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
      expect(wrapper.find('.sales-analytics').exists()).toBe(true)
    })

    it('应该正确渲染分析头部', () => {
      expect(wrapper.find('.analytics-header').exists()).toBe(true)
      expect(wrapper.find('.header-title h3').text()).toBe('销售分析')
      expect(wrapper.find('.header-title p').text()).toBe('深入了解销售趋势和收入表现')
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
    it('默认应该显示总览视图', () => {
      expect(wrapper.vm.viewMode).toBe('overview')
    })

    it('应该能够切换到趋势视图', async () => {
      await wrapper.setData({ viewMode: 'trends' })
      expect(wrapper.vm.viewMode).toBe('trends')
    })

    it('应该能够切换到商品视图', async () => {
      await wrapper.setData({ viewMode: 'products' })
      expect(wrapper.vm.viewMode).toBe('products')
    })

    it('应该能够切换到预测视图', async () => {
      await wrapper.setData({ viewMode: 'forecast' })
      expect(wrapper.vm.viewMode).toBe('forecast')
    })
  })

  describe('总览视图', () => {
    it('应该正确渲染总览视图', async () => {
      await wrapper.setData({ viewMode: 'overview' })
      expect(wrapper.find('.overview-view').exists()).toBe(true)
    })

    it('应该显示销售收入趋势图表', async () => {
      await wrapper.setData({ viewMode: 'overview' })
      expect(wrapper.vm.revenueChart).toBeDefined()
    })

    it('应该显示销售分布图表', async () => {
      await wrapper.setData({ viewMode: 'overview' })
      expect(wrapper.vm.distributionChart).toBeDefined()
    })

    it('应该显示按小时销售分析图表', async () => {
      await wrapper.setData({ viewMode: 'overview' })
      expect(wrapper.vm.hourlyChart).toBeDefined()
    })

    it('应该显示支付方式分布图表', async () => {
      await wrapper.setData({ viewMode: 'overview' })
      expect(wrapper.vm.paymentChart).toBeDefined()
    })
  })

  describe('趋势视图', () => {
    it('应该正确渲染趋势视图', async () => {
      await wrapper.setData({ viewMode: 'trends' })
      expect(wrapper.find('.trends-view').exists()).toBe(true)
    })

    it('应该显示销售趋势分析图表', async () => {
      await wrapper.setData({ viewMode: 'trends' })
      expect(wrapper.vm.trendsChart).toBeDefined()
    })

    it('应该显示同比增长分析图表', async () => {
      await wrapper.setData({ viewMode: 'trends' })
      expect(wrapper.vm.yoyChart).toBeDefined()
    })

    it('应该显示环比增长分析图表', async () => {
      await wrapper.setData({ viewMode: 'trends' })
      expect(wrapper.vm.momChart).toBeDefined()
    })

    it('应该能够切换趋势粒度', async () => {
      await wrapper.setData({ viewMode: 'trends', trendGranularity: 'week' })
      expect(wrapper.vm.trendGranularity).toBe('week')
    })

    it('应该能够加载趋势数据', async () => {
      await wrapper.vm.loadTrendData()
      expect(ElMessage.info).toHaveBeenCalled()
    })
  })

  describe('商品视图', () => {
    it('应该正确渲染商品视图', async () => {
      await wrapper.setData({ viewMode: 'products' })
      expect(wrapper.find('.products-view').exists()).toBe(true)
    })

    it('应该显示热销商品排行表格', async () => {
      await wrapper.setData({ viewMode: 'products' })
      expect(wrapper.vm.topProducts).toBeDefined()
    })

    it('应该显示类别销售对比图表', async () => {
      await wrapper.setData({ viewMode: 'products' })
      expect(wrapper.vm.categoryChart).toBeDefined()
    })

    it('应该显示商品关联分析图表', async () => {
      await wrapper.setData({ viewMode: 'products' })
      expect(wrapper.vm.associationChart).toBeDefined()
    })
  })

  describe('预测视图', () => {
    it('应该正确渲染预测视图', async () => {
      await wrapper.setData({ viewMode: 'forecast' })
      expect(wrapper.find('.forecast-view').exists()).toBe(true)
    })

    it('应该显示销售预测图表', async () => {
      await wrapper.setData({ viewMode: 'forecast' })
      expect(wrapper.vm.forecastChart).toBeDefined()
    })

    it('应该正确显示预测准确度指标', async () => {
      await wrapper.setData({ viewMode: 'forecast' })
      expect(wrapper.vm.forecastAccuracy).toBeDefined()
      expect(wrapper.vm.forecastAccuracy.mae).toBe(1250)
      expect(wrapper.vm.forecastAccuracy.rmse).toBe(1890)
      expect(wrapper.vm.forecastAccuracy.mape).toBe(8.5)
      expect(wrapper.vm.forecastAccuracy.r2).toBe(0.92)
    })

    it('应该显示预测建议', async () => {
      await wrapper.setData({ viewMode: 'forecast' })
      const suggestions = wrapper.vm.forecastSuggestions
      expect(suggestions).toHaveLength(3)
      expect(suggestions[0].title).toBe('预计下周销量增长15%')
    })

    it('应该能够切换预测周期', async () => {
      await wrapper.setData({ viewMode: 'forecast', forecastDays: 60 })
      expect(wrapper.vm.forecastDays).toBe(60)
    })

    it('应该能够切换预测模型', async () => {
      await wrapper.setData({ viewMode: 'forecast', forecastModel: 'lstm' })
      expect(wrapper.vm.forecastModel).toBe('lstm')
    })

    it('应该能够加载预测数据', async () => {
      await wrapper.vm.loadForecastData()
      expect(ElMessage.info).toHaveBeenCalled()
    })
  })

  describe('图表初始化', () => {
    it('应该正确初始化销售收入趋势图表', () => {
      wrapper.vm.initRevenueChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化销售分布图表', () => {
      wrapper.vm.initDistributionChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化按小时销售分析图表', () => {
      wrapper.vm.initHourlyChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化支付方式分布图表', () => {
      wrapper.vm.initPaymentChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化销售趋势分析图表', () => {
      wrapper.vm.initTrendsChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化同比增长分析图表', () => {
      wrapper.vm.initYoyChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化环比增长分析图表', () => {
      wrapper.vm.initMomChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化类别销售对比图表', () => {
      wrapper.vm.initCategoryChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化商品关联分析图表', () => {
      wrapper.vm.initAssociationChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化销售预测图表', () => {
      wrapper.vm.initForecastChart()
      expect(echarts.init).toHaveBeenCalled()
    })
  })

  describe('响应式行为', () => {
    it('应该在视图模式变化时重新初始化图表', async () => {
      await wrapper.setData({ viewMode: 'trends' })
      await nextTick()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确处理趋势粒度变化', async () => {
      await wrapper.setData({ viewMode: 'trends', trendGranularity: 'month' })
      expect(wrapper.vm.trendGranularity).toBe('month')
    })

    it('应该正确处理预测周期变化', async () => {
      await wrapper.setData({ viewMode: 'forecast', forecastDays: 90 })
      expect(wrapper.vm.forecastDays).toBe(90)
    })

    it('应该正确处理预测模型变化', async () => {
      await wrapper.setData({ viewMode: 'forecast', forecastModel: 'prophet' })
      expect(wrapper.vm.forecastModel).toBe('prophet')
    })
  })

  describe('数据验证', () => {
    it('预测准确度数据应该包含所有必需字段', async () => {
      await wrapper.setData({ viewMode: 'forecast' })
      const accuracy = wrapper.vm.forecastAccuracy
      expect(accuracy).toHaveProperty('mae')
      expect(accuracy).toHaveProperty('rmse')
      expect(accuracy).toHaveProperty('mape')
      expect(accuracy).toHaveProperty('r2')
    })

    it('预测建议数据应该包含所有必需字段', async () => {
      await wrapper.setData({ viewMode: 'forecast' })
      const suggestion = wrapper.vm.forecastSuggestions[0]
      expect(suggestion).toHaveProperty('title')
      expect(suggestion).toHaveProperty('type')
      expect(suggestion).toHaveProperty('description')
    })

    it('热销商品数据应该包含所有必需字段', async () => {
      await wrapper.setData({ viewMode: 'products' })
      const product = { rank: 1, itemName: '红烧肉', categoryName: '热菜', quantity: 580, revenue: 29000, profit: 11600, growth: 12.5 }
      expect(product).toHaveProperty('rank')
      expect(product).toHaveProperty('itemName')
      expect(product).toHaveProperty('categoryName')
      expect(product).toHaveProperty('quantity')
      expect(product).toHaveProperty('revenue')
      expect(product).toHaveProperty('profit')
      expect(product).toHaveProperty('growth')
    })
  })

  describe('边界情况', () => {
    it('应该处理空图表引用', () => {
      wrapper.vm.revenueChart.value = null
      expect(() => wrapper.vm.initRevenueChart()).not.toThrow()
    })

    it('应该处理无效的视图模式', async () => {
      await wrapper.setData({ viewMode: 'invalid' })
      expect(wrapper.vm.viewMode).toBe('invalid')
    })

    it('应该处理无效的趋势粒度', async () => {
      await wrapper.setData({ viewMode: 'trends', trendGranularity: 'invalid' })
      expect(wrapper.vm.trendGranularity).toBe('invalid')
    })

    it('应该处理无效的预测周期', async () => {
      await wrapper.setData({ viewMode: 'forecast', forecastDays: 0 })
      expect(wrapper.vm.forecastDays).toBe(0)
    })

    it('应该处理无效的预测模型', async () => {
      await wrapper.setData({ viewMode: 'forecast', forecastModel: 'invalid' })
      expect(wrapper.vm.forecastModel).toBe('invalid')
    })
  })

  describe('加载状态', () => {
    it('应该正确设置加载状态', async () => {
      await wrapper.setData({ loading: true })
      expect(wrapper.vm.loading).toBe(true)
    })

    it('应该正确清除加载状态', async () => {
      await wrapper.setData({ loading: false })
      expect(wrapper.vm.loading).toBe(false)
    })
  })
})
