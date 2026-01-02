import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import Dashboard from '../Dashboard.vue'

// 模拟所有依赖
vi.mock('@/stores/dashboard', () => ({
  useDashboardStore: vi.fn(() => ({
    dashboardData: {
      metrics: {
        totalRevenue: 1000,
        dailyOrders: 50,
        monthlyUsers: 1000
      }
    },
    coreMetrics: {
      totalRevenue: 1000,
      revenueChange: 10,
      totalOrders: 50,
      orderChange: 5,
      averageOrderValue: 20,
      customerCount: 100
    },
    revenueData: Array.from({ length: 7 }, (_, i) => ({
      date: `2023-01-${i + 10}`,
      amount: 1000 + i * 100
    })),
    recentOrders: Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      orderNumber: `ORD-${1000 + i}`,
      customerName: `Customer ${i + 1}`,
      status: ['pending', 'confirmed', 'completed'][i % 3],
      amount: 100 + i * 50,
      createdAt: new Date(Date.now() - i * 3600000).toISOString()
    })),
    loadDashboardData: vi.fn().mockResolvedValue(undefined),
    refreshData: vi.fn(),
    loadCoreMetrics: vi.fn().mockResolvedValue(undefined)
  }))
}))

vi.mock('@/stores/table', () => ({
  useTableStore: vi.fn(() => ({
    tableStatus: [],
    loadTableStatus: vi.fn().mockResolvedValue(undefined),
    refreshTableStatus: vi.fn().mockResolvedValue(undefined),
    updateTableStatus: vi.fn()
  }))
}))

// 模拟组件
const commonStubs = {
  // Element Plus 组件
  'el-card': { template: '<div class="el-card"><div class="el-card__body"><slot></slot></div></div>' },
  'el-row': { template: '<div class="el-row"><slot></slot></div>' },
  'el-col': { template: '<div class="el-col"><slot></slot></div>' },
  'el-radio-group': { template: '<div class="el-radio-group"><slot></slot></div>' },
  'el-radio-button': { template: '<div class="el-radio-button"><slot></slot></div>' },
  'el-switch': { template: '<div class="el-switch"></div>' },
  'el-select': { template: '<div class="el-select"><slot></slot></div>' },
  'el-option': { template: '<div class="el-option"><slot></slot></div>' },
  'ElMessage': { template: '<div></div>' },
  
  // 图表组件 - 所有使用 ECharts 的组件都需要存根
  'RevenueChart': { template: '<div class="revenue-chart"></div>' },
  'OrderStatusChart': { template: '<div class="order-status-chart"></div>' },
  'TopDishesChart': { template: '<div class="top-dishes-chart"></div>' },
  'CustomerFlowChart': { template: '<div class="customer-flow-chart"></div>' },
  'TableStatusChart': { template: '<div class="table-status-chart"></div>' },
  
  // 其他自定义组件
  'YTDashboardCards': { template: '<div class="dashboard-cards"></div>' },
  'YTRecentOrders': { template: '<div class="recent-orders"></div>' },
  'YTTableStatus': { template: '<div class="table-status"></div>' },
  'YTOrderChart': { template: '<div class="order-chart"></div>' },
  'YTRevenueChart': { template: '<div class="revenue-chart"></div>' },
  'YTTopProductsChart': { template: '<div class="top-products-chart"></div>' },
  'YTOrderStatusChart': { template: '<div class="order-status-chart"></div>' },
  'YTRevenueRankChart': { template: '<div class="revenue-rank-chart"></div>' },
  
  // 基础组件
  'MetricCard': { template: '<div class="metric-card"></div>' },
  'RecentOrdersList': { template: '<div class="recent-orders-list"></div>' }
}

describe('Dashboard简单测试', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(Dashboard, {
      global: {
        stubs: commonStubs,
        plugins: [createPinia()]
      }
    })
  })

  it('应该能挂载', () => {
    expect(wrapper.exists()).toBe(true)
  })
})
