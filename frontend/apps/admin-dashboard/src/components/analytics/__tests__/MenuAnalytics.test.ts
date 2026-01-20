import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import MenuAnalytics from '@/components/analytics/MenuAnalytics.vue'

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

describe('MenuAnalytics组件', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(MenuAnalytics, {
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
      expect(wrapper.find('.menu-analytics').exists()).toBe(true)
    })

    it('应该正确渲染分析头部', () => {
      expect(wrapper.find('.analytics-header').exists()).toBe(true)
      expect(wrapper.find('.header-title h3').text()).toBe('菜单分析')
      expect(wrapper.find('.header-title p').text()).toBe('优化菜单结构和定价策略')
    })

    it('应该正确渲染视图模式切换按钮', () => {
      const buttons = wrapper.findAll('.el-button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('应该正确渲染优化建议按钮', () => {
      const optimizeButton = wrapper.findAll('.el-button').find(btn => btn.text().includes('优化建议'))
      expect(optimizeButton).toBeDefined()
    })

    it('应该正确渲染分析内容区域', () => {
      expect(wrapper.find('.analytics-content').exists()).toBe(true)
    })
  })

  describe('视图模式切换', () => {
    it('默认应该显示表现视图', () => {
      expect(wrapper.vm.viewMode).toBe('performance')
    })

    it('应该能够切换到盈利视图', async () => {
      await wrapper.setData({ viewMode: 'profitability' })
      expect(wrapper.vm.viewMode).toBe('profitability')
    })

    it('应该能够切换到优化视图', async () => {
      await wrapper.setData({ viewMode: 'optimization' })
      expect(wrapper.vm.viewMode).toBe('optimization')
    })

    it('应该能够切换到矩阵视图', async () => {
      await wrapper.setData({ viewMode: 'matrix' })
      expect(wrapper.vm.viewMode).toBe('matrix')
    })
  })

  describe('表现视图', () => {
    it('应该正确渲染表现视图', async () => {
      await wrapper.setData({ viewMode: 'performance' })
      expect(wrapper.find('.performance-view').exists()).toBe(true)
    })

    it('应该显示菜品销量排行表格', async () => {
      await wrapper.setData({ viewMode: 'performance' })
      expect(wrapper.vm.topDishes).toBeDefined()
      expect(wrapper.vm.topDishes.length).toBeGreaterThan(0)
    })

    it('应该正确显示热销菜品数据', async () => {
      await wrapper.setData({ viewMode: 'performance' })
      const topDish = wrapper.vm.topDishes[0]
      expect(topDish.dishName).toBe('红烧肉')
      expect(topDish.sales).toBe(580)
      expect(topDish.revenue).toBe(29000)
      expect(topDish.rating).toBe(4.8)
    })

    it('应该显示类别销售对比图表', async () => {
      await wrapper.setData({ viewMode: 'performance' })
      expect(wrapper.vm.categorySalesChart).toBeDefined()
    })

    it('应该显示菜品评价分析图表', async () => {
      await wrapper.setData({ viewMode: 'performance' })
      expect(wrapper.vm.ratingChart).toBeDefined()
    })

    it('应该显示菜品复购率图表', async () => {
      await wrapper.setData({ viewMode: 'performance' })
      expect(wrapper.vm.repurchaseChart).toBeDefined()
    })
  })

  describe('盈利视图', () => {
    it('应该正确渲染盈利视图', async () => {
      await wrapper.setData({ viewMode: 'profitability' })
      expect(wrapper.find('.profitability-view').exists()).toBe(true)
    })

    it('应该正确显示盈利指标卡片', async () => {
      await wrapper.setData({ viewMode: 'profitability' })
      const metrics = wrapper.vm.profitMetrics
      expect(metrics).toHaveLength(4)
    })

    it('应该正确显示整体毛利率指标', async () => {
      await wrapper.setData({ viewMode: 'profitability' })
      const overallMargin = wrapper.vm.profitMetrics.find((m: any) => m.key === 'overallMargin')
      expect(overallMargin).toBeDefined()
      expect(overallMargin.label).toBe('整体毛利率')
      expect(overallMargin.value).toBe('52.3%')
      expect(overallMargin.change).toBe(2.1)
    })

    it('应该正确显示平均菜品毛利率指标', async () => {
      await wrapper.setData({ viewMode: 'profitability' })
      const avgDishMargin = wrapper.vm.profitMetrics.find((m: any) => m.key === 'avgDishMargin')
      expect(avgDishMargin).toBeDefined()
      expect(avgDishMargin.label).toBe('平均菜品毛利率')
      expect(avgDishMargin.value).toBe('48.5%')
      expect(avgDishMargin.change).toBe(1.8)
    })

    it('应该正确显示成本占比指标', async () => {
      await wrapper.setData({ viewMode: 'profitability' })
      const costRatio = wrapper.vm.profitMetrics.find((m: any) => m.key === 'costRatio')
      expect(costRatio).toBeDefined()
      expect(costRatio.label).toBe('成本占比')
      expect(costRatio.value).toBe('47.7%')
      expect(costRatio.change).toBe(-1.5)
    })

    it('应该正确显示利润增长率指标', async () => {
      await wrapper.setData({ viewMode: 'profitability' })
      const profitGrowth = wrapper.vm.profitMetrics.find((m: any) => m.key === 'profitGrowth')
      expect(profitGrowth).toBeDefined()
      expect(profitGrowth.label).toBe('利润增长率')
      expect(profitGrowth.value).toBe('15.2%')
      expect(profitGrowth.change).toBe(8.5)
    })

    it('应该显示类别毛利率分析图表', async () => {
      await wrapper.setData({ viewMode: 'profitability' })
      expect(wrapper.vm.categoryMarginChart).toBeDefined()
    })

    it('应该显示菜品毛利率排行表格', async () => {
      await wrapper.setData({ viewMode: 'profitability' })
      const highMarginDishes = wrapper.vm.highMarginDishes
      expect(highMarginDishes).toHaveLength(5)
      expect(highMarginDishes[0].dishName).toBe('清蒸鱼')
      expect(highMarginDishes[0].margin).toBe(72)
    })

    it('应该显示成本结构分析图表', async () => {
      await wrapper.setData({ viewMode: 'profitability' })
      expect(wrapper.vm.costStructureChart).toBeDefined()
    })
  })

  describe('优化视图', () => {
    it('应该正确渲染优化视图', async () => {
      await wrapper.setData({ viewMode: 'optimization' })
      expect(wrapper.find('.optimization-view').exists()).toBe(true)
    })

    it('应该显示滞销菜品识别表格', async () => {
      await wrapper.setData({ viewMode: 'optimization' })
      const slowMovingDishes = wrapper.vm.slowMovingDishes
      expect(slowMovingDishes).toHaveLength(5)
      expect(slowMovingDishes[0].dishName).toBe('凉拌黄瓜')
      expect(slowMovingDishes[0].sales).toBe(15)
    })

    it('应该显示新菜品表现表格', async () => {
      await wrapper.setData({ viewMode: 'optimization' })
      const newDishes = wrapper.vm.newDishes
      expect(newDishes).toHaveLength(5)
      expect(newDishes[0].dishName).toBe('香辣蟹')
      expect(newDishes[0].status).toBe('hot')
    })

    it('应该显示价格弹性分析图表', async () => {
      await wrapper.setData({ viewMode: 'optimization' })
      expect(wrapper.vm.priceElasticityChart).toBeDefined()
    })

    it('应该显示菜单结构优化建议', async () => {
      await wrapper.setData({ viewMode: 'optimization' })
      const suggestions = wrapper.vm.menuOptimizationSuggestions
      expect(suggestions).toHaveLength(4)
      expect(suggestions[0].title).toBe('下架滞销菜品')
    })
  })

  describe('矩阵视图', () => {
    it('应该正确渲染矩阵视图', async () => {
      await wrapper.setData({ viewMode: 'matrix' })
      expect(wrapper.find('.matrix-view').exists()).toBe(true)
    })

    it('应该显示BCG矩阵分析图表', async () => {
      await wrapper.setData({ viewMode: 'matrix' })
      expect(wrapper.vm.bcgMatrixChart).toBeDefined()
    })

    it('应该显示明星菜品表格', async () => {
      await wrapper.setData({ viewMode: 'matrix' })
      const starDishes = wrapper.vm.starDishes
      expect(starDishes).toHaveLength(4)
      expect(starDishes[0].dishName).toBe('红烧肉')
      expect(starDishes[0].marketShare).toBe(12.5)
      expect(starDishes[0].growthRate).toBe(8.5)
    })

    it('应该显示问题菜品表格', async () => {
      await wrapper.setData({ viewMode: 'matrix' })
      const problemDishes = wrapper.vm.problemDishes
      expect(problemDishes).toHaveLength(4)
      expect(problemDishes[0].dishName).toBe('凉拌黄瓜')
      expect(problemDishes[0].marketShare).toBe(0.8)
      expect(problemDishes[0].growthRate).toBe(-15.2)
    })
  })

  describe('优化建议对话框', () => {
    it('应该能够打开优化建议对话框', async () => {
      await wrapper.setData({ showOptimizationDialog: true })
      expect(wrapper.vm.showOptimizationDialog).toBe(true)
    })

    it('应该显示优化建议列表', async () => {
      await wrapper.setData({ showOptimizationDialog: true })
      const recommendations = wrapper.vm.optimizationRecommendations
      expect(recommendations).toHaveLength(5)
      expect(recommendations[0].type).toBe('remove')
      expect(recommendations[0].dishName).toBe('凉拌黄瓜')
    })

    it('应该能够获取建议类型文本', () => {
      expect(wrapper.vm.getRecommendationTypeText('remove')).toBe('下架')
      expect(wrapper.vm.getRecommendationTypeText('price_up')).toBe('提价')
      expect(wrapper.vm.getRecommendationTypeText('promote')).toBe('推广')
      expect(wrapper.vm.getRecommendationTypeText('bundle')).toBe('套餐')
      expect(wrapper.vm.getRecommendationTypeText('new')).toBe('上新')
    })

    it('应该能够获取建议类型颜色', () => {
      expect(wrapper.vm.getRecommendationTypeColor('remove')).toBe('danger')
      expect(wrapper.vm.getRecommendationTypeColor('price_up')).toBe('warning')
      expect(wrapper.vm.getRecommendationTypeColor('promote')).toBe('success')
      expect(wrapper.vm.getRecommendationTypeColor('bundle')).toBe('primary')
      expect(wrapper.vm.getRecommendationTypeColor('new')).toBe('info')
    })
  })

  describe('菜品操作', () => {
    it('应该能够处理下架菜品操作', async () => {
      ElMessageBox.confirm = vi.fn().mockResolvedValue('confirm')
      const dish = { dishName: '凉拌黄瓜', sales: 15, daysSinceLastSale: 30, inventory: 50 }
      await wrapper.vm.handleRemoveDish(dish)
      expect(ElMessageBox.confirm).toHaveBeenCalled()
      expect(ElMessage.success).toHaveBeenCalledWith('菜品已下架')
    })

    it('应该能够处理促销菜品操作', async () => {
      const dish = { dishName: '凉拌黄瓜', sales: 15, daysSinceLastSale: 30, inventory: 50 }
      await wrapper.vm.handlePromoteDish(dish)
      expect(ElMessage.success).toHaveBeenCalledWith('已将"凉拌黄瓜"加入促销计划')
    })

    it('应该能够应用优化建议', async () => {
      const recommendation = {
        type: 'remove',
        dishName: '凉拌黄瓜',
        reason: '近30天仅售15份，库存积压严重',
        potentialImpact: 2.5,
        confidence: 85
      }
      await wrapper.vm.handleApplyRecommendation(recommendation)
      expect(ElMessage.success).toHaveBeenCalledWith('已应用建议：凉拌黄瓜')
    })

    it('应该能够忽略优化建议', async () => {
      const recommendation = {
        type: 'remove',
        dishName: '凉拌黄瓜',
        reason: '近30天仅售15份，库存积压严重',
        potentialImpact: 2.5,
        confidence: 85
      }
      await wrapper.vm.handleIgnoreRecommendation(recommendation)
      expect(ElMessage.info).toHaveBeenCalledWith('已忽略建议：凉拌黄瓜')
    })

    it('应该能够应用全部优化建议', async () => {
      ElMessageBox.confirm = vi.fn().mockResolvedValue('confirm')
      await wrapper.vm.handleApplyAllRecommendations()
      expect(ElMessageBox.confirm).toHaveBeenCalled()
      expect(ElMessage.success).toHaveBeenCalledWith('已应用全部建议')
      expect(wrapper.vm.showOptimizationDialog).toBe(false)
    })
  })

  describe('图表初始化', () => {
    it('应该正确初始化类别销售图表', () => {
      wrapper.vm.initCategorySalesChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化评分图表', () => {
      wrapper.vm.initRatingChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化复购率图表', () => {
      wrapper.vm.initRepurchaseChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化类别毛利率图表', () => {
      wrapper.vm.initCategoryMarginChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化成本结构图表', () => {
      wrapper.vm.initCostStructureChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化价格弹性图表', () => {
      wrapper.vm.initPriceElasticityChart()
      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该正确初始化BCG矩阵图表', () => {
      wrapper.vm.initBcgMatrixChart()
      expect(echarts.init).toHaveBeenCalled()
    })
  })

  describe('响应式行为', () => {
    it('应该在视图模式变化时重新初始化图表', async () => {
      await wrapper.setData({ viewMode: 'profitability' })
      await nextTick()
      expect(echarts.init).toHaveBeenCalled()
    })
  })

  describe('数据验证', () => {
    it('热销菜品数据应该包含所有必需字段', async () => {
      await wrapper.setData({ viewMode: 'performance' })
      const dish = wrapper.vm.topDishes[0]
      expect(dish).toHaveProperty('rank')
      expect(dish).toHaveProperty('dishName')
      expect(dish).toHaveProperty('categoryName')
      expect(dish).toHaveProperty('sales')
      expect(dish).toHaveProperty('revenue')
      expect(dish).toHaveProperty('rating')
    })

    it('盈利指标数据应该包含所有必需字段', async () => {
      await wrapper.setData({ viewMode: 'profitability' })
      const metric = wrapper.vm.profitMetrics[0]
      expect(metric).toHaveProperty('key')
      expect(metric).toHaveProperty('label')
      expect(metric).toHaveProperty('value')
      expect(metric).toHaveProperty('change')
      expect(metric).toHaveProperty('icon')
      expect(metric).toHaveProperty('color')
    })

    it('高毛利率菜品数据应该包含所有必需字段', async () => {
      await wrapper.setData({ viewMode: 'profitability' })
      const dish = wrapper.vm.highMarginDishes[0]
      expect(dish).toHaveProperty('dishName')
      expect(dish).toHaveProperty('margin')
      expect(dish).toHaveProperty('profit')
    })

    it('滞销菜品数据应该包含所有必需字段', async () => {
      await wrapper.setData({ viewMode: 'optimization' })
      const dish = wrapper.vm.slowMovingDishes[0]
      expect(dish).toHaveProperty('dishName')
      expect(dish).toHaveProperty('sales')
      expect(dish).toHaveProperty('daysSinceLastSale')
      expect(dish).toHaveProperty('inventory')
    })

    it('新菜品数据应该包含所有必需字段', async () => {
      await wrapper.setData({ viewMode: 'optimization' })
      const dish = wrapper.vm.newDishes[0]
      expect(dish).toHaveProperty('dishName')
      expect(dish).toHaveProperty('launchDate')
      expect(dish).toHaveProperty('sales')
      expect(dish).toHaveProperty('rating')
      expect(dish).toHaveProperty('status')
    })

    it('优化建议数据应该包含所有必需字段', async () => {
      await wrapper.setData({ viewMode: 'optimization' })
      const suggestion = wrapper.vm.menuOptimizationSuggestions[0]
      expect(suggestion).toHaveProperty('title')
      expect(suggestion).toHaveProperty('type')
      expect(suggestion).toHaveProperty('description')
      expect(suggestion).toHaveProperty('impact')
    })

    it('优化推荐数据应该包含所有必需字段', async () => {
      await wrapper.setData({ showOptimizationDialog: true })
      const recommendation = wrapper.vm.optimizationRecommendations[0]
      expect(recommendation).toHaveProperty('type')
      expect(recommendation).toHaveProperty('dishName')
      expect(recommendation).toHaveProperty('reason')
      expect(recommendation).toHaveProperty('potentialImpact')
      expect(recommendation).toHaveProperty('confidence')
    })

    it('明星菜品数据应该包含所有必需字段', async () => {
      await wrapper.setData({ viewMode: 'matrix' })
      const dish = wrapper.vm.starDishes[0]
      expect(dish).toHaveProperty('dishName')
      expect(dish).toHaveProperty('marketShare')
      expect(dish).toHaveProperty('growthRate')
    })
  })

  describe('边界情况', () => {
    it('应该处理空图表引用', () => {
      wrapper.vm.categorySalesChart.value = null
      expect(() => wrapper.vm.initCategorySalesChart()).not.toThrow()
    })

    it('应该处理无效的视图模式', async () => {
      await wrapper.setData({ viewMode: 'invalid' })
      expect(wrapper.vm.viewMode).toBe('invalid')
    })

    it('应该处理取消下架操作', async () => {
      ElMessageBox.confirm = vi.fn().mockRejectedValue('cancel')
      const dish = { dishName: '凉拌黄瓜', sales: 15, daysSinceLastSale: 30, inventory: 50 }
      await wrapper.vm.handleRemoveDish(dish)
      expect(ElMessageBox.confirm).toHaveBeenCalled()
      expect(ElMessage.success).not.toHaveBeenCalled()
    })

    it('应该处理取消应用全部建议操作', async () => {
      ElMessageBox.confirm = vi.fn().mockRejectedValue('cancel')
      await wrapper.vm.handleApplyAllRecommendations()
      expect(ElMessageBox.confirm).toHaveBeenCalled()
      expect(ElMessage.success).not.toHaveBeenCalled()
    })
  })
})
