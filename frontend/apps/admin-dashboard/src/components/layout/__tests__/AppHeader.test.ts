/**
 * @fileoverview YYC³餐饮行业智能化平台 - AppHeader组件单元测试
 * @description 测试AppHeader组件的主要功能和行为
 * @module AppHeader.test
 * @author YYC³
 * @version 1.0.0
 * @created 2024-10-16
 * @updated 2024-10-16
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AppHeader from '../AppHeader.vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

// Mock依赖
vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))
}))

vi.mock('element-plus', () => ({
  ElMessage: {
    info: vi.fn(),
    success: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn()
  }
}))

// 创建共享的stubs配置
const commonStubs = {
  'el-button': { template: '<button><slot></slot></button>' },
  'el-icon': { template: '<i><slot></slot></i>' },
  'el-breadcrumb': { template: '<div><slot></slot></div>' },
  'el-breadcrumb-item': { template: '<div><slot></slot></div>' },
  'el-input': { template: '<input v-bind:value="value" v-on:input="$emit(\'update:modelValue\', $event.target.value)" />', data() { return { value: '' } } },
  'el-badge': { template: '<div><slot></slot></div>' },
  'el-dropdown': { template: '<div><slot></slot><slot name="dropdown"></slot></div>' },
  'el-dropdown-menu': { template: '<div><slot></slot></div>' },
  'el-dropdown-item': { template: '<div><slot></slot></div>' },
  'el-avatar': { template: '<div><slot></slot></div>' },
  Fold: { template: '<i class="el-icon-fold"></i>' },
  Search: { template: '<i class="el-icon-search"></i>' },
  Bell: { template: '<i class="el-icon-bell"></i>' },
  Aim: { template: '<i class="el-icon-aim"></i>' },
  FullScreen: { template: '<i class="el-icon-full-screen"></i>' },
  ArrowDown: { template: '<i class="el-icon-arrow-down"></i>' },
  User: { template: '<i class="el-icon-user"></i>' },
  Setting: { template: '<i class="el-icon-setting"></i>' },
  SwitchButton: { template: '<i class="el-icon-switch-button"></i>' }
}

describe('AppHeader', () => {
  let wrapper: any
  let mockRoute: any
  let mockRouter: any

  beforeEach(() => {
    // 设置模拟路由
    mockRoute = {
      matched: [
        { path: '/dashboard', meta: { title: '工作台' } },
        { path: '/dashboard/settings', meta: { title: '设置' } }
      ]
    }
    ;(useRoute as vi.Mock).mockReturnValue(mockRoute)

    // 设置localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    })

    // 创建包装器
    wrapper = mount(AppHeader, {
      global: {
        stubs: commonStubs
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
    vi.clearAllMocks()
  })

  describe('基础渲染', () => {
    it('应该正确渲染组件', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.classes()).toContain('app-header')
    })

    it('应该显示侧边栏切换按钮', () => {
      const toggleBtn = wrapper.find('.sidebar-toggle-btn')
      expect(toggleBtn.exists()).toBe(true)
    })

    it('应该显示面包屑导航', () => {
      const breadcrumb = wrapper.find('.breadcrumb')
      expect(breadcrumb.exists()).toBe(true)
    })

    it('应该显示搜索框', () => {
      const searchInput = wrapper.find('.search-input')
      expect(searchInput.exists()).toBe(true)
    })

    it('应该显示通知中心', () => {
      const notification = wrapper.find('.notification-badge')
      expect(notification.exists()).toBe(true)
    })

    it('应该显示全屏切换按钮', () => {
      const fullscreenBtn = wrapper.find('.fullscreen-btn')
      expect(fullscreenBtn.exists()).toBe(true)
    })

    it('应该显示用户信息', () => {
      const userInfo = wrapper.find('.user-info')
      expect(userInfo.exists()).toBe(true)
      expect(wrapper.text()).toContain('管理员')
    })
  })

  describe('功能测试', () => {
    it('点击侧边栏切换按钮应该触发事件', () => {
      // 模拟document.dispatchEvent
      const mockDispatchEvent = vi.spyOn(document, 'dispatchEvent')
      
      const toggleBtn = wrapper.find('.sidebar-toggle-btn')
      toggleBtn.trigger('click')
      
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.any(CustomEvent)
      )
      expect((mockDispatchEvent.mock.calls[0][0] as CustomEvent).type).toBe('toggle-sidebar')
      
      mockDispatchEvent.mockRestore()
    })

    it('搜索功能应该正常工作', async () => {
      // 直接设置搜索关键词并调用搜索方法
      wrapper.vm.searchKeyword = '测试搜索'
      await wrapper.vm.handleSearch()
      
      expect(ElMessage.info).toHaveBeenCalledWith('搜索: 测试搜索')
    })

    it('点击通知中心应该显示提示', async () => {
      // 直接调用通知中心方法
      await wrapper.vm.handleNotification()
      
      expect(ElMessage.info).toHaveBeenCalledWith('打开通知中心')
    })

    it('全屏切换功能应该正常工作', () => {
      // 模拟全屏API
      const mockRequestFullscreen = vi.fn()
      const mockExitFullscreen = vi.fn()
      
      Object.defineProperty(document.documentElement, 'requestFullscreen', {
        value: mockRequestFullscreen
      })
      
      Object.defineProperty(document, 'exitFullscreen', {
        value: mockExitFullscreen
      })
      
      Object.defineProperty(document, 'fullscreenElement', {
        value: null,
        writable: true
      })
      
      // 点击全屏按钮
      const fullscreenBtn = wrapper.find('.fullscreen-btn')
      fullscreenBtn.trigger('click')
      
      expect(mockRequestFullscreen).toHaveBeenCalled()
      
      // 模拟全屏状态
      document.fullscreenElement = document.documentElement
      
      // 再次点击全屏按钮
      fullscreenBtn.trigger('click')
      
      expect(mockExitFullscreen).toHaveBeenCalled()
    })

    it('用户下拉菜单应该正常工作', async () => {
      mockRouter = { push: vi.fn() }
      ;(useRouter as vi.Mock).mockReturnValue(mockRouter)
      
      // 重新挂载组件以应用新的mock
      wrapper = mount(AppHeader, {
        global: {
          stubs: commonStubs
        }
      })
      
      // 触发个人中心命令
      wrapper.vm.handleCommand('profile')
      expect(mockRouter.push).toHaveBeenCalledWith('/profile')
      
      // 触发系统设置命令
      wrapper.vm.handleCommand('settings')
      expect(mockRouter.push).toHaveBeenCalledWith('/system/settings')
    })

    it('退出登录功能应该正常工作', async () => {
      // 创建新的localStorage mock
      const mockRemoveItem = vi.fn()
      const mockSetItem = vi.fn()
      const mockGetItem = vi.fn()
      
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: mockGetItem,
          setItem: mockSetItem,
          removeItem: mockRemoveItem,
          clear: vi.fn()
        },
        writable: true
      })
      
      // 模拟路由跳转 - 通过useRouter钩子
      const mockRouter = { push: vi.fn() }
      ;(useRouter as vi.Mock).mockReturnValue(mockRouter)
      
      // 重新挂载组件以应用新的mock
      wrapper = mount(AppHeader, {
        global: {
          stubs: commonStubs
        }
      })
      
      // 模拟确认对话框
      ;(ElMessageBox.confirm as vi.Mock).mockImplementation(() => Promise.resolve(true))
      
      // 直接调用handleLogout方法
      await wrapper.vm.handleLogout()
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要退出登录吗？',
        '提示',
        expect.any(Object)
      )
      
      expect(mockRemoveItem).toHaveBeenCalledWith('token')
      expect(mockRemoveItem).toHaveBeenCalledWith('user')
      expect(ElMessage.success).toHaveBeenCalledWith('退出成功')
      expect(mockRouter.push).toHaveBeenCalledWith('/login')
    })

    it('取消退出登录应该不执行任何操作', async () => {
      // 模拟取消对话框
      ;(ElMessageBox.confirm as vi.Mock).mockImplementation(() => Promise.reject(false))
      
      // 重置localStorage removeItem调用计数
      window.localStorage.removeItem = vi.fn()
      
      // 直接调用handleLogout方法
      await wrapper.vm.handleLogout()
      
      // 验证localStorage.removeItem没有被调用
      expect(window.localStorage.removeItem).not.toHaveBeenCalled()
    })
  })

  describe('计算属性', () => {
    it('面包屑列表应该正确计算', () => {
      const breadcrumbList = wrapper.vm.breadcrumbList
      
      expect(breadcrumbList).toEqual([
        { title: '工作台', path: '/dashboard' },
        { title: '设置', path: '/dashboard/settings' }
      ])
    })
  })

  describe('生命周期', () => {
    it('应该正确添加和移除事件监听器', () => {
      const mockAddEventListener = vi.spyOn(document, 'addEventListener')
      const mockRemoveEventListener = vi.spyOn(document, 'removeEventListener')
      
      // 重新挂载组件
      wrapper.unmount()
      wrapper = mount(AppHeader, {
        global: {
          stubs: commonStubs
        }
      })
      
      expect(mockAddEventListener).toHaveBeenCalledWith('fullscreenchange', expect.any(Function))
      
      // 卸载组件
      wrapper.unmount()
      
      expect(mockRemoveEventListener).toHaveBeenCalledWith('fullscreenchange', expect.any(Function))
      
      mockAddEventListener.mockRestore()
      mockRemoveEventListener.mockRestore()
    })
  })
})
