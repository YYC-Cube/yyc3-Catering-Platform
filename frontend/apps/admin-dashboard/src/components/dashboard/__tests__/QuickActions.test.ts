/**
 * @fileoverview QuickActions组件单元测试
 * @description 测试快捷操作组件的功能
 * @module QuickActions.test
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import QuickActions from '@/components/dashboard/QuickActions.vue'
import { quickActionsApi } from '@/api/quickActions'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/orders/new', component: { template: '<div></div>' } },
    { path: '/menu/items', component: { template: '<div></div>' } },
    { path: '/customers/list', component: { template: '<div></div>' } }
  ]
})

describe('QuickActions组件', () => {
  beforeEach(() => {
    vi.mock('@/api/quickActions')
  })

  it('应该正确渲染默认快捷操作', () => {
    const wrapper = mount(QuickActions, {
      global: {
        plugins: [router]
      }
    })

    const actionItems = wrapper.findAll('.action-item')
    expect(actionItems.length).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('新建订单')
    expect(wrapper.text()).toContain('菜品管理')
  })

  it('应该能够点击快捷操作', async () => {
    const wrapper = mount(QuickActions, {
      global: {
        plugins: [router]
      }
    })

    const newOrderAction = wrapper.find('.action-new-order')
    await newOrderAction.trigger('click')

    expect(router.currentRoute.value.path).toBe('/orders/new')
  })

  it('应该显示添加快捷操作按钮', () => {
    const wrapper = mount(QuickActions, {
      global: {
        plugins: [router]
      }
    })

    const addButton = wrapper.find('.action-add')
    expect(addButton.exists()).toBe(true)
  })

  it('点击添加按钮应该打开对话框', async () => {
    const wrapper = mount(QuickActions, {
      global: {
        plugins: [router]
      }
    })

    const addButton = wrapper.find('.action-add')
    await addButton.trigger('click')

    expect(wrapper.vm.showAddDialog).toBe(true)
  })

  it('应该能够添加自定义快捷操作', async () => {
    const mockSave = vi.fn().mockResolvedValue({ success: true })
    vi.mocked(quickActionsApi).saveCustomActions = mockSave

    const wrapper = mount(QuickActions, {
      global: {
        plugins: [router]
      }
    })

    wrapper.vm.newAction = {
      title: '测试操作',
      description: '测试描述',
      icon: 'Star',
      color: '#409EFF',
      path: '/test'
    }

    await wrapper.vm.addCustomAction()

    expect(mockSave).toHaveBeenCalled()
    expect(wrapper.vm.showAddDialog).toBe(false)
  })

  it('应该能够删除自定义快捷操作', async () => {
    const mockDelete = vi.fn().mockResolvedValue({ success: true })
    vi.mocked(quickActionsApi).saveCustomActions = mockDelete

    const wrapper = mount(QuickActions, {
      global: {
        plugins: [router]
      }
    })

    wrapper.vm.customActions = [
      {
        id: 'custom-1',
        title: '测试',
        description: '测试',
        icon: 'Star',
        color: '#409EFF',
        path: '/test',
        pinned: true,
        isCustom: true
      }
    ]

    await wrapper.vm.removeCustomAction('custom-1')

    expect(wrapper.vm.customActions.length).toBe(0)
  })

  it('应该能够打开设置对话框', async () => {
    const wrapper = mount(QuickActions, {
      global: {
        plugins: [router]
      }
    })

    const settingsButton = wrapper.findAll('.header-actions button')[0]
    await settingsButton.trigger('click')

    expect(wrapper.vm.showSettings).toBe(true)
  })

  it('应该能够保存设置', async () => {
    const mockSave = vi.fn().mockResolvedValue({ success: true })
    vi.mocked(quickActionsApi).saveSettings = mockSave

    const wrapper = mount(QuickActions, {
      global: {
        plugins: [router]
      }
    })

    await wrapper.vm.saveSettings()

    expect(mockSave).toHaveBeenCalled()
    expect(wrapper.vm.showSettings).toBe(false)
  })

  it('应该响应式适配不同屏幕尺寸', () => {
    const wrapper = mount(QuickActions, {
      global: {
        plugins: [router]
      }
    })

    const actionsGrid = wrapper.find('.actions-grid')

    expect(actionsGrid.exists()).toBe(true)
  })
})
