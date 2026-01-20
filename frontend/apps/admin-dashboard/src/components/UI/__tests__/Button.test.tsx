/**
 * @fileoverview Button组件单元测试
 * @description 测试Button组件的功能
 * @module Button.test
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { Button } from '@/components/UI/Button'

describe('Button组件', () => {
  it('应该正确渲染默认按钮', () => {
    const wrapper = mount(Button, {
      slots: {
        default: '点击我'
      }
    })

    expect(wrapper.text()).toBe('点击我')
    expect(wrapper.classes()).toContain('bg-neutral-600')
  })

  it('应该正确渲染主要按钮', () => {
    const wrapper = mount(Button, {
      props: {
        type: 'primary'
      },
      slots: {
        default: '主要按钮'
      }
    })

    expect(wrapper.text()).toBe('主要按钮')
    expect(wrapper.classes()).toContain('bg-primary-600')
  })

  it('应该正确渲染成功按钮', () => {
    const wrapper = mount(Button, {
      props: {
        type: 'success'
      },
      slots: {
        default: '成功按钮'
      }
    })

    expect(wrapper.classes()).toContain('bg-success-600')
  })

  it('应该正确渲染警告按钮', () => {
    const wrapper = mount(Button, {
      props: {
        type: 'warning'
      },
      slots: {
        default: '警告按钮'
      }
    })

    expect(wrapper.classes()).toContain('bg-warning-600')
  })

  it('应该正确渲染危险按钮', () => {
    const wrapper = mount(Button, {
      props: {
        type: 'danger'
      },
      slots: {
        default: '危险按钮'
      }
    })

    expect(wrapper.classes()).toContain('bg-danger-600')
  })

  it('应该正确渲染小型按钮', () => {
    const wrapper = mount(Button, {
      props: {
        size: 'sm'
      },
      slots: {
        default: '小型按钮'
      }
    })

    expect(wrapper.classes()).toContain('h-8')
    expect(wrapper.classes()).toContain('px-3')
    expect(wrapper.classes()).toContain('text-sm')
  })

  it('应该正确渲染大型按钮', () => {
    const wrapper = mount(Button, {
      props: {
        size: 'lg'
      },
      slots: {
        default: '大型按钮'
      }
    })

    expect(wrapper.classes()).toContain('h-12')
    expect(wrapper.classes()).toContain('px-6')
    expect(wrapper.classes()).toContain('text-lg')
  })

  it('应该正确渲染禁用状态', () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true
      },
      slots: {
        default: '禁用按钮'
      }
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('opacity-50')
    expect(wrapper.classes()).toContain('cursor-not-allowed')
  })

  it('应该正确渲染加载状态', () => {
    const wrapper = mount(Button, {
      props: {
        loading: true
      },
      slots: {
        default: '加载中'
      }
    })

    expect(wrapper.classes()).toContain('opacity-75')
    expect(wrapper.classes()).toContain('cursor-wait')
  })

  it('应该正确渲染圆形按钮', () => {
    const wrapper = mount(Button, {
      props: {
        circle: true
      },
      slots: {
        default: '圆形'
      }
    })

    expect(wrapper.classes()).toContain('rounded-full')
  })

  it('应该正确渲染圆角按钮', () => {
    const wrapper = mount(Button, {
      props: {
        round: true
      },
      slots: {
        default: '圆角'
      }
    })

    expect(wrapper.classes()).toContain('rounded-full')
  })

  it('应该正确渲染块级按钮', () => {
    const wrapper = mount(Button, {
      props: {
        block: true
      },
      slots: {
        default: '块级按钮'
      }
    })

    expect(wrapper.classes()).toContain('w-full')
  })

  it('应该正确触发点击事件', async () => {
    const onClick = vi.fn()
    const wrapper = mount(Button, {
      props: {
        onClick
      },
      slots: {
        default: '点击我'
      }
    })

    await wrapper.trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('禁用状态下不应该触发点击事件', async () => {
    const onClick = vi.fn()
    const wrapper = mount(Button, {
      props: {
        disabled: true,
        onClick
      },
      slots: {
        default: '禁用按钮'
      }
    })

    await wrapper.trigger('click')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('应该正确渲染图标', () => {
    const IconComponent = {
      template: '<span>icon</span>'
    }
    const wrapper = mount(Button, {
      props: {
        icon: IconComponent
      },
      slots: {
        default: '带图标'
      }
    })

    expect(wrapper.text()).toContain('icon')
    expect(wrapper.text()).toContain('带图标')
  })

  it('应该正确应用自定义类名', () => {
    const wrapper = mount(Button, {
      props: {
        className: 'custom-class'
      },
      slots: {
        default: '自定义'
      }
    })

    expect(wrapper.classes()).toContain('custom-class')
  })
})
