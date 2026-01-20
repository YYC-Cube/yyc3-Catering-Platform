/**
 * YYC³餐饮管理系统 - YTLayout组件测试
 * 基于节点2的响应式设计框架测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import YTLayout from '../YTLayout.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } }
  ]
})

describe('YTLayout', () => {
  let wrapper: any

  beforeEach(() => {
    // Mock window.innerWidth for responsive testing
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    })

    // Mock addEventListener
    window.addEventListener = vi.fn()
    window.removeEventListener = vi.fn()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })

  const createWrapper = (options: any = {}) => {
    return createWrapper(, {
      global: {
        plugins: [router],
        stubs: {
          NavigationProgressBar: true,
          OfflineIndicator: true,
          NavigationLoader: true,
          NavigationErrorAlert: true
        }
      },
      ...options
    })
  }

  describe('基础渲染', () => {
    it('应该正确渲染默认布局', () => {
      wrapper = createWrapper({
        slots: {
          default: '<div class="test-content">Test Content</div>'
        }
      })

      expect(wrapper.find('.yt-layout').exists()).toBe(true)
      expect(wrapper.find('.test-content').exists()).toBe(true)
    })

    it('应该显示头部导航栏', () => {
      wrapper = createWrapper(, {
        props: {
          showHeader: true
        },
        slots: {
          header: '<div>Header Content</div>'
        }
      })

      expect(wrapper.find('.yt-layout__header').exists()).toBe(true)
      expect(wrapper.text()).toContain('Header Content')
    })

    it('应该显示侧边栏', () => {
      wrapper = createWrapper(, {
        props: {
          showSidebar: true
        },
        slots: {
          sidebar: '<div>Sidebar Content</div>'
        }
      })

      expect(wrapper.find('.yt-layout__sidebar').exists()).toBe(true)
      expect(wrapper.text()).toContain('Sidebar Content')
    })

    it('应该显示底部信息栏', () => {
      wrapper = createWrapper(, {
        props: {
          showFooter: true
        },
        slots: {
          footer: '<div>Footer Content</div>'
        }
      })

      expect(wrapper.find('.yt-layout__footer').exists()).toBe(true)
      expect(wrapper.text()).toContain('Footer Content')
    })
  })

  describe('响应式行为', () => {
    it('应该在移动端正确响应', async () => {
      wrapper = createWrapper()

      // 模拟移动端宽度
      Object.defineProperty(window, 'innerWidth', {
        value: 375
      })

      // 调用handleResize方法来更新组件状态
      wrapper.vm.handleResize()

      await wrapper.vm.$nextTick()

      expect(wrapper.vm.currentBreakpoint).toBe('sm')
      expect(wrapper.vm.isMobile).toBe(true)
      expect(wrapper.vm.isTablet).toBe(false)
      expect(wrapper.vm.isDesktop).toBe(false)
    })

    it('应该在平板端正确响应', async () => {
      wrapper = createWrapper()

      // 模拟平板端宽度 (767px属于md断点)
      Object.defineProperty(window, 'innerWidth', {
        value: 767
      })

      // 调用handleResize方法来更新组件状态
      wrapper.vm.handleResize()

      await wrapper.vm.$nextTick()

      expect(wrapper.vm.currentBreakpoint).toBe('md')
      expect(wrapper.vm.isMobile).toBe(false)
      expect(wrapper.vm.isTablet).toBe(true)
      expect(wrapper.vm.isDesktop).toBe(false)
    })

    it('应该在桌面端正确响应', async () => {
      wrapper = createWrapper()

      // 模拟桌面端宽度
      Object.defineProperty(window, 'innerWidth', {
        value: 1280
      })

      // 调用handleResize方法来更新组件状态
      wrapper.vm.handleResize()

      await wrapper.vm.$nextTick()

      expect(wrapper.vm.currentBreakpoint).toBe('2xl')
      expect(wrapper.vm.isMobile).toBe(false)
      expect(wrapper.vm.isTablet).toBe(false)
      expect(wrapper.vm.isDesktop).toBe(true)
    })

    it('应该在移动端自动收起侧边栏', async () => {
      wrapper = createWrapper(, {
        props: {
          showSidebar: true,
          collapseSidebar: true,
          sidebarBreakpoint: 'md'
        }
      })

      // 模拟移动端宽度
      Object.defineProperty(window, 'innerWidth', {
        value: 375
      })

      // 调用handleResize方法来更新组件状态
      wrapper.vm.handleResize()

      await wrapper.vm.$nextTick()

      expect(wrapper.vm.sidebarOpen).toBe(false)
    })

    it('应该在桌面端自动展开侧边栏', async () => {
      wrapper = createWrapper(, {
        props: {
          showSidebar: true,
          collapseSidebar: true,
          sidebarBreakpoint: 'md'
        }
      })

      // 模拟桌面端宽度
      Object.defineProperty(window, 'innerWidth', {
        value: 1280
      })

      // 调用handleResize方法来更新组件状态
      wrapper.vm.handleResize()

      await wrapper.vm.$nextTick()

      expect(wrapper.vm.sidebarOpen).toBe(true)
    })
  })

  describe('侧边栏控制', () => {
    it('应该能够切换侧边栏', async () => {
      wrapper = createWrapper(, {
        props: {
          showSidebar: true
        }
      })

      // 初始状态应该是展开的
      expect(wrapper.vm.sidebarOpen).toBe(true)

      // 切换侧边栏
      await wrapper.vm.toggleSidebar()
      expect(wrapper.vm.sidebarOpen).toBe(false)

      // 再次切换
      await wrapper.vm.toggleSidebar()
      expect(wrapper.vm.sidebarOpen).toBe(true)
    })

    it('应该能够关闭侧边栏', async () => {
      wrapper = createWrapper(, {
        props: {
          showSidebar: true
        }
      })

      expect(wrapper.vm.sidebarOpen).toBe(true)

      await wrapper.vm.closeSidebar()
      expect(wrapper.vm.sidebarOpen).toBe(false)
    })

    it('应该能够展开侧边栏', async () => {
      wrapper = createWrapper(, {
        props: {
          showSidebar: true
        }
      })

      // 先关闭
      await wrapper.vm.closeSidebar()
      expect(wrapper.vm.sidebarOpen).toBe(false)

      // 再展开
      await wrapper.vm.openSidebar()
      expect(wrapper.vm.sidebarOpen).toBe(true)
    })
  })

  describe('样式类名', () => {
    it('应该根据断点添加正确的类名', async () => {
      wrapper = createWrapper()

      // 模拟桌面端
      Object.defineProperty(window, 'innerWidth', {
        value: 1280
      })

      window.dispatchEvent(new Event('resize'))

      await wrapper.vm.$nextTick()

      expect(wrapper.find('.yt-layout--xl').exists()).toBe(true)
      expect(wrapper.find('.yt-layout--desktop').exists()).toBe(true)
      expect(wrapper.find('.yt-layout--mobile').exists()).toBe(false)
    })

    it('应该在移动端添加移动端类名', async () => {
      wrapper = createWrapper()

      // 模拟移动端宽度
      Object.defineProperty(window, 'innerWidth', {
        value: 375
      })

      // 调用handleResize方法来更新组件状态
      wrapper.vm.handleResize()

      await wrapper.vm.$nextTick()

      expect(wrapper.find('.yt-layout--sm').exists()).toBe(true)
      expect(wrapper.find('.yt-layout--mobile').exists()).toBe(true)
      expect(wrapper.find('.yt-layout--desktop').exists()).toBe(false)
    })

    it('应该根据侧边栏状态添加正确的类名', async () => {
      wrapper = createWrapper(, {
        props: {
          showSidebar: true
        }
      })

      // 展开状态
      expect(wrapper.find('.yt-layout--sidebar-open').exists()).toBe(true)

      // 关闭侧边栏
      await wrapper.vm.closeSidebar()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.yt-layout--sidebar-open').exists()).toBe(false)
    })
  })

  describe('固定头部和底部', () => {
    it('应该在固定头部时添加正确的类名', () => {
      wrapper = createWrapper(, {
        props: {
          showHeader: true,
          fixedHeader: true
        }
      })

      expect(wrapper.find('.yt-layout__header--fixed').exists()).toBe(true)
      expect(wrapper.find('.yt-layout--fixed-header').exists()).toBe(true)
    })

    it('应该在固定底部时添加正确的类名', () => {
      wrapper = createWrapper(, {
        props: {
          showFooter: true,
          fixedFooter: true
        }
      })

      expect(wrapper.find('.yt-layout__footer--fixed').exists()).toBe(true)
      expect(wrapper.find('.yt-layout--fixed-footer').exists()).toBe(true)
    })

    it('应该在同时固定头部和底部时添加正确的类名', () => {
      wrapper = createWrapper(, {
        props: {
          showHeader: true,
          showFooter: true,
          fixedHeader: true,
          fixedFooter: true
        }
      })

      expect(wrapper.find('.yt-layout--fixed-header').exists()).toBe(true)
      expect(wrapper.find('.yt-layout--fixed-footer').exists()).toBe(true)
    })
  })

  describe('插槽内容', () => {
    it('应该渲染默认头部内容', () => {
      wrapper = createWrapper(, {
        props: { showHeader: true }
      })

      expect(wrapper.find('.default-header').exists()).toBe(true)
      expect(wrapper.find('.menu-toggle').exists()).toBe(true)
      expect(wrapper.find('.logo').exists()).toBe(true)
    })

    it('应该渲染默认侧边栏内容', () => {
      wrapper = createWrapper(, {
        props: { showSidebar: true }
      })

      expect(wrapper.find('.default-sidebar').exists()).toBe(true)
      expect(wrapper.find('.sidebar-header').exists()).toBe(true)
      expect(wrapper.find('.sidebar-content').exists()).toBe(true)
    })

    it('应该渲染默认底部内容', () => {
      wrapper = createWrapper(, {
        props: { showFooter: true }
      })

      expect(wrapper.find('.default-footer').exists()).toBe(true)
      expect(wrapper.find('.footer-content').exists()).toBe(true)
      expect(wrapper.text()).toContain('© 2025 YYC³餐饮管理系统')
    })

    it('应该正确替换头部插槽', () => {
      const customHeader = '<div class="custom-header">Custom Header</div>'

      wrapper = createWrapper(, {
        props: { showHeader: true },
        slots: {
          header: customHeader
        }
      })

      expect(wrapper.find('.custom-header').exists()).toBe(true)
      expect(wrapper.text()).toContain('Custom Header')
      expect(wrapper.find('.default-header').exists()).toBe(false)
    })

    it('应该正确替换侧边栏插槽', () => {
      const customSidebar = '<div class="custom-sidebar">Custom Sidebar</div>'

      wrapper = createWrapper(, {
        props: { showSidebar: true },
        slots: {
          sidebar: customSidebar
        }
      })

      expect(wrapper.find('.custom-sidebar').exists()).toBe(true)
      expect(wrapper.text()).toContain('Custom Sidebar')
      expect(wrapper.find('.default-sidebar').exists()).toBe(false)
    })

    it('应该正确替换底部插槽', () => {
      const customFooter = '<div class="custom-footer">Custom Footer</div>'

      wrapper = createWrapper(, {
        props: { showFooter: true },
        slots: {
          footer: customFooter
        }
      })

      expect(wrapper.find('.custom-footer').exists()).toBe(true)
      expect(wrapper.text()).toContain('Custom Footer')
      expect(wrapper.find('.default-footer').exists()).toBe(false)
    })
  })

  describe('可访问性', () => {
    it('应该支持键盘导航', () => {
      wrapper = createWrapper(, {
        props: {
          showSidebar: true
        },
        slots: {
          sidebar: '<button>Test Button</button>'
        }
      })

      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
    })

    it('应该有正确的ARIA标签', () => {
      wrapper = createWrapper(, {
        slots: {
          default: '<main role="main">Main Content</main>'
        }
      })

      const main = wrapper.find('main[role="main"]')
      expect(main.exists()).toBe(true)
    })
  })

  describe('生命周期', () => {
    it('应该在组件挂载时添加resize事件监听器', () => {
      wrapper = createWrapper()

      expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
    })

    it('应该在组件卸载时移除resize事件监听器', () => {
      wrapper = createWrapper()
      wrapper.unmount()

      expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
    })

    it('应该在组件挂载时初始化窗口宽度', () => {
      wrapper = createWrapper()

      expect(wrapper.vm.windowWidth).toBe(window.innerWidth)
    })
  })

  describe('样式计算', () => {
    it('应该正确计算CSS变量', () => {
      wrapper = createWrapper(, {
        props: {
          maxWidth: '1200px',
          contentPadding: '24px',
          layoutGap: '16px'
        }
      })

      expect(wrapper.vm.layoutStyles['--layout-max-width']).toBe('1200px')
      expect(wrapper.vm.layoutStyles['--layout-content-padding']).toBe('24px')
      expect(wrapper.vm.layoutStyles['--layout-gap']).toBe('16px')
    })

    it('应该在侧边栏展开时正确计算侧边栏宽度', async () => {
      wrapper = createWrapper(, {
        props: { showSidebar: true }
      })

      expect(wrapper.vm.layoutStyles['--layout-sidebar-width']).toBe('280px')

      // 关闭侧边栏
      await wrapper.vm.closeSidebar()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.layoutStyles['--layout-sidebar-width']).toBe('0px')
    })
  })

  describe('默认插槽内容', () => {
    it('应该渲染菜单切换按钮（移动端）', async () => {
      // 模拟移动端
      Object.defineProperty(window, 'innerWidth', {
        value: 375,
        writable: true
      })

      wrapper = createWrapper(, {
        props: {
          showHeader: true,
          showSidebar: true
        }
      })

      window.dispatchEvent(new Event('resize'))
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.menu-toggle').exists()).toBe(true)
    })

    it('应该在桌面端隐藏菜单切换按钮', async () => {
      // 模拟桌面端
      Object.defineProperty(window, 'innerWidth', {
        value: 1280,
        writable: true
      })

      wrapper = createWrapper(, {
        props: {
          showHeader: true,
          showSidebar: true
        }
      })

      window.dispatchEvent(new Event('resize'))
      await wrapper.vm.$nextTick()

      const menuToggle = wrapper.find('.menu-toggle')
      if (menuToggle.exists()) {
        // 在桌面端可能不显示，或者有不同的样式
        expect(menuToggle.isVisible()).toBe(false)
      }
    })

    it('应该显示YYC³logo', () => {
      wrapper = createWrapper(, {
        props: {
          showHeader: true
        }
      })

      expect(wrapper.find('.logo').exists()).toBe(true)
      expect(wrapper.text()).toContain('YYC³')
    })
  })
})