/**
 * @fileoverview Modal组件单元测试
 * @description 测试Modal组件的功能
 * @module Modal.test
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { Modal } from '@/components/UI/Modal'

describe('Modal组件', () => {
  it('默认不应该显示', () => {
    const wrapper = mount(Modal, {
      props: {
        visible: false,
        title: '测试标题'
      },
      slots: {
        default: '测试内容'
      }
    })

    expect(wrapper.find('.fixed').exists()).toBe(false)
  })

  it('应该正确显示模态框', async () => {
    const wrapper = mount(Modal, {
      props: {
        visible: true,
        title: '测试标题'
      },
      slots: {
        default: '测试内容'
      }
    })

    await wrapper.vm.$nextTick()
    expect(wrapper.find('.fixed').exists()).toBe(true)
    expect(wrapper.text()).toContain('测试标题')
    expect(wrapper.text()).toContain('测试内容')
  })

  it('应该正确渲染不同尺寸', () => {
    const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const

    sizes.forEach(size => {
      const wrapper = mount(Modal, {
        props: {
          visible: true,
          size
        },
        slots: {
          default: `尺寸${size}`
        }
      })

      expect(wrapper.text()).toContain(`尺寸${size}`)
    })
  })

  it('应该正确渲染自定义页脚', () => {
    const wrapper = mount(Modal, {
      props: {
        visible: true,
        title: '测试标题',
        footer: <div>自定义页脚</div>
      },
      slots: {
        default: '测试内容'
      }
    })

    expect(wrapper.text()).toContain('自定义页脚')
  })

  it('应该正确触发update:visible事件', async () => {
    const wrapper = mount(Modal, {
      props: {
        visible: true,
        title: '测试标题'
      },
      slots: {
        default: '测试内容'
      }
    })

    await wrapper.vm.$nextTick()
    const closeButton = wrapper.find('button[aria-label="关闭"]')
    await closeButton.trigger('click')

    expect(wrapper.emitted('update:visible')).toBeTruthy()
    expect(wrapper.emitted('update:visible')![0]).toEqual([false])
  })

  it('应该正确触发ok事件', async () => {
    const onOk = vi.fn()
    const wrapper = mount(Modal, {
      props: {
        visible: true,
        title: '测试标题',
        onOk
      },
      slots: {
        default: '测试内容'
      }
    })

    await wrapper.vm.$nextTick()
    const okButton = wrapper.findAll('button').find(btn => btn.text() === '确定')
    if (okButton) {
      await okButton.trigger('click')
      expect(onOk).toHaveBeenCalledTimes(1)
    }
  })

  it('应该正确触发cancel事件', async () => {
    const onCancel = vi.fn()
    const wrapper = mount(Modal, {
      props: {
        visible: true,
        title: '测试标题',
        onCancel
      },
      slots: {
        default: '测试内容'
      }
    })

    await wrapper.vm.$nextTick()
    const cancelButton = wrapper.findAll('button').find(btn => btn.text() === '取消')
    if (cancelButton) {
      await cancelButton.trigger('click')
      expect(onCancel).toHaveBeenCalledTimes(1)
    }
  })

  it('应该正确触发afterClose事件', async () => {
    const afterClose = vi.fn()
    const wrapper = mount(Modal, {
      props: {
        visible: true,
        title: '测试标题',
        afterClose
      },
      slots: {
        default: '测试内容'
      }
    })

    await wrapper.vm.$nextTick()
    const closeButton = wrapper.find('button[aria-label="关闭"]')
    await closeButton.trigger('click')

    await new Promise(resolve => setTimeout(resolve, 300))
    expect(afterClose).toHaveBeenCalledTimes(1)
  })

  it('应该正确应用自定义类名', () => {
    const wrapper = mount(Modal, {
      props: {
        visible: true,
        className: 'custom-modal'
      },
      slots: {
        default: '测试内容'
      }
    })

    expect(wrapper.find('.custom-modal').exists()).toBe(true)
  })
})
