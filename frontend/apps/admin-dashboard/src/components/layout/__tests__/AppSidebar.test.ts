/**
 * @fileoverview YYC³餐饮行业智能化平台 - AppSidebar组件单元测试
 * @description 测试AppSidebar组件的主要功能和行为
 * @module AppSidebar.test
 * @author YYC³
 * @version 1.0.0
 * @created 2024-10-16
 * @updated 2024-10-16
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import AppSidebar from '../AppSidebar.vue'
import { useRoute } from 'vue-router'

// Mock依赖
vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    path: '/dashboard'
  }))
}))

// 创建共享的stubs配置
const commonStubs = {
  'el-menu': { template: '<div><slot></slot></div>' },
  'el-sub-menu': { template: '<div><slot name="title"></slot><slot></slot></div>' },
  'el-menu-item': { template: '<div><slot></slot><slot name="title"></slot></div>' },
  'el-icon': { template: '<i><slot></slot></i>' },
  'el-scrollbar': { template: '<div><slot></slot></div>' },
  House: { template: '<i class="el-icon-house"></i>' },
  List: { template: '<i class="el-icon-list"></i>' },
  Document: { template: '<i class="el-icon-document"></i>' },
  TrendCharts: { template: '<i class="el-icon-trend-charts"></i>' },
  Menu: { template: '<i class="el-icon-menu"></i>' },
  Food: { template: '<i class="el-icon-food"></i>' },
  Collection: { template: '<i class="el-icon-collection"></i>' },
  Star: { template: '<i class="el-icon-star"></i>' },
  Kitchen: { template: '<i class="el-icon-kitchen"></i>' },
  User: { template: '<i class="el-icon-user"></i>' },
  UserFilled: { template: '<i class="el-icon-user-filled"></i>' },
  DataAnalysis: { template: '<i class="el-icon-data-analysis"></i>' },
  KnifeAndSpoon: { template: '<i class="el-icon-knife-and-spoon"></i>' },
  Monitor: { template: '<i class="el-icon-monitor"></i>' },
  Odometer: { template: '<i class="el-icon-odometer"></i>' },
  Shop: { template: '<i class="el-icon-shop"></i>' },
  Store: { template: '<i class="el-icon-store"></i>' },
  Operation: { template: '<i class="el-icon-operation"></i>' },
  Trophy: { template: '<i class="el-icon-trophy"></i>' },
  Shield: { template: '<i class="el-icon-shield"></i>' },
  Search: { template: '<i class="el-icon-search"></i>' },
  CircleCheck: { template: '<i class="el-icon-circle-check"></i>' },
  Money: { template: '<i class="el-icon-money"></i>' },
  Wallet: { template: '<i class="el-icon-wallet"></i>' },
  DataLine: { template: '<i class="el-icon-data-line"></i>' },
  CreditCard: { template: '<i class="el-icon-credit-card"></i>' },
  Setting: { template: '<i class="el-icon-setting"></i>' },
  RefreshLeft: { template: '<i class="el-icon-refresh-left"></i>' },
  Key: { template: '<i class="el-icon-key"></i>' },
  Tools: { template: '<i class="el-icon-tools"></i>' },
  Expand: { template: '<i class="el-icon-expand"></i>' },
  Fold: { template: '<i class="el-icon-fold"></i>' }
}

describe('AppSidebar', () => {
  let wrapper: any

  beforeEach(() => {
    // 创建包装器
    wrapper = mount(AppSidebar, {
      global: {
        mocks: {
          $route: { path: '/dashboard' }
        },
        stubs: commonStubs
      }
    })
  })

  describe('基础渲染', () => {
    it('应该正确渲染组件', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.classes()).toContain('app-sidebar')
    })

    it('应该显示Logo区域', () => {
      const logoArea = wrapper.find('.sidebar-logo')
      expect(logoArea.exists()).toBe(true)
    })

    it('应该显示菜单列表', () => {
      const menuList = wrapper.find('.sidebar-menu')
      expect(menuList.exists()).toBe(true)
    })

    it('应该显示折叠按钮', () => {
      const toggleBtn = wrapper.find('.sidebar-toggle')
      expect(toggleBtn.exists()).toBe(true)
    })

    it('应该渲染所有主要菜单', () => {
      expect(wrapper.text()).toContain('工作台')
      expect(wrapper.text()).toContain('订单管理')
      expect(wrapper.text()).toContain('菜单管理')
      expect(wrapper.text()).toContain('厨房管理')
      expect(wrapper.text()).toContain('数据分析')
      expect(wrapper.text()).toContain('客户管理')
      expect(wrapper.text()).toContain('连锁管理')
      expect(wrapper.text()).toContain('食品安全')
      expect(wrapper.text()).toContain('报表分析')
      expect(wrapper.text()).toContain('支付管理')
      expect(wrapper.text()).toContain('系统管理')
    })
  })

  describe('属性测试', () => {
    it('应该根据collapsed属性显示不同的Logo', async () => {
      // 默认状态（未折叠）
      expect(wrapper.find('.logo-img').exists()).toBe(true)
      expect(wrapper.find('.logo-mini').exists()).toBe(false)
      expect(wrapper.find('.logo-title').exists()).toBe(true)

      // 折叠状态
      await wrapper.setProps({ collapsed: true })
      expect(wrapper.element.classList.contains('collapsed')).toBe(true)
      expect(wrapper.find('.logo-img').exists()).toBe(false)
      expect(wrapper.find('.logo-mini').exists()).toBe(true)
      expect(wrapper.find('.logo-title').exists()).toBe(false)
    })

    it('应该根据mobileOpen属性控制移动端显示', async () => {
      await wrapper.setProps({ mobileOpen: true })
      expect(wrapper.element.classList.contains('mobile-open')).toBe(true)

      await wrapper.setProps({ mobileOpen: false })
      expect(wrapper.element.classList.contains('mobile-open')).toBe(false)
    })
  })

  describe('功能测试', () => {
    it('点击折叠按钮应该触发toggle事件', () => {
      const toggleBtn = wrapper.find('.sidebar-toggle')
      toggleBtn.trigger('click')
      
      expect(wrapper.emitted()).toHaveProperty('toggle')
    })

    it('应该正确计算isMobile属性', () => {
      // 模拟窗口宽度大于768px
      const mockInnerWidth = 1024
      Object.defineProperty(window, 'innerWidth', {
        value: mockInnerWidth,
        writable: true
      })
      
      // 重新挂载组件以应用新的窗口宽度
      wrapper = mount(AppSidebar, {
        global: {
          mocks: {
            $route: { path: '/dashboard' }
          },
          stubs: commonStubs
        }
      })
      
      expect(wrapper.vm.isMobile).toBe(false)
      
      // 模拟窗口宽度小于等于768px
      Object.defineProperty(window, 'innerWidth', {
        value: 767, // 使用767px确保小于768
        writable: true
      })
      
      // 重新挂载组件以应用新的窗口宽度
      wrapper = mount(AppSidebar, {
        global: {
          mocks: {
            $route: { path: '/dashboard' }
          },
          stubs: commonStubs
        }
      })
      
      expect(wrapper.vm.isMobile).toBe(true)
    })
  })

  describe('样式测试', () => {
    it('折叠状态下应该有正确的样式类', async () => {
      expect(wrapper.element.classList.contains('collapsed')).toBe(false)
      
      await wrapper.setProps({ collapsed: true })
      expect(wrapper.element.classList.contains('collapsed')).toBe(true)
    })

    it('移动端打开状态下应该有正确的样式类', async () => {
      expect(wrapper.element.classList.contains('mobile-open')).toBe(false)
      
      await wrapper.setProps({ mobileOpen: true })
      expect(wrapper.element.classList.contains('mobile-open')).toBe(true)
    })
  })
})
