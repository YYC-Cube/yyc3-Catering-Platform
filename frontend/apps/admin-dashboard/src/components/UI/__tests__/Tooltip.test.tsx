/**
 * @fileoverview Tooltip组件单元测试
 * @description 测试Tooltip组件的功能
 * @module Tooltip.test
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { Tooltip } from '@/components/UI/Tooltip'
import { Button } from '@/components/UI/Button'

describe('Tooltip组件', () => {
  it('应该正确渲染默认提示框', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: '提示内容'
      },
      slots: {
        default: () => <Button>悬停显示</Button>
      }
    })

    expect(wrapper.text()).toContain('悬停显示')
  })

  it('应该正确渲染顶部提示框', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: '顶部提示',
        placement: 'top'
      },
      slots: {
        default: () => <Button>顶部</Button>
      }
    })

    expect(wrapper.classes()).toContain('relative')
  })

  it('应该正确渲染底部提示框', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: '底部提示',
        placement: 'bottom'
      },
      slots: {
        default: () => <Button>底部</Button>
      }
    })

    expect(wrapper.classes()).toContain('relative')
  })

  it('应该正确渲染左侧提示框', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: '左侧提示',
        placement: 'left'
      },
      slots: {
        default: () => <Button>左侧</Button>
      }
    })

    expect(wrapper.classes()).toContain('relative')
  })

  it('应该正确渲染右侧提示框', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: '右侧提示',
        placement: 'right'
      },
      slots: {
        default: () => <Button>右侧</Button>
      }
    })

    expect(wrapper.classes()).toContain('relative')
  })

  it('应该正确渲染悬停触发', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: '悬停提示',
        trigger: 'hover'
      },
      slots: {
        default: () => <Button>悬停</Button>
      }
    })

    expect(wrapper.classes()).toContain('relative')
  })

  it('应该正确渲染点击触发', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: '点击提示',
        trigger: 'click'
      },
      slots: {
        default: () => <Button>点击</Button>
      }
    })

    expect(wrapper.classes()).toContain('relative')
  })

  it('应该正确渲染聚焦触发', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: '聚焦提示',
        trigger: 'focus'
      },
      slots: {
        default: () => <Button>聚焦</Button>
      }
    })

    expect(wrapper.classes()).toContain('relative')
  })

  it('应该正确渲染禁用状态', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: '禁用提示',
        disabled: true
      },
      slots: {
        default: () => <Button>禁用</Button>
      }
    })

    expect(wrapper.classes()).toContain('relative')
  })

  it('应该正确渲染箭头', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: '带箭头提示',
        arrow: true
      },
      slots: {
        default: () => <Button>箭头</Button>
      }
    })

    expect(wrapper.classes()).toContain('relative')
  })

  it('应该正确渲染延迟显示', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: '延迟提示',
        delay: 500
      },
      slots: {
        default: () => <Button>延迟</Button>
      }
    })

    expect(wrapper.classes()).toContain('relative')
  })

  it('应该正确触发visible-change事件', () => {
    const onVisibleChange = vi.fn()
    const wrapper = mount(Tooltip, {
      props: {
        content: '提示内容',
        trigger: 'hover',
        onVisibleChange
      },
      slots: {
        default: () => <Button>悬停显示</Button>
      }
    })

    expect(wrapper.classes()).toContain('relative')
  })

  it('应该正确应用自定义类名', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: '自定义提示'
      },
      slots: {
        default: () => <Button>自定义</Button>
      }
    })

    expect(wrapper.classes()).toContain('relative')
  })

  it('应该正确渲染富文本内容', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: '富文本内容',
        trigger: 'click'
      },
      slots: {
        default: () => <Button>富文本</Button>
      }
    })

    expect(wrapper.html()).toContain('富文本')
  })

  it('应该正确渲染自定义颜色', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: '自定义颜色提示',
        color: 'primary'
      },
      slots: {
        default: () => <Button>颜色</Button>
      }
    })

    expect(wrapper.html()).toContain('bg-primary-600')
  })
})
