/**
 * @fileoverview Card组件单元测试
 * @description 测试Card组件的功能
 * @module Card.test
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/UI/Card'

describe('Card组件', () => {
  it('应该正确渲染默认卡片', () => {
    const wrapper = mount(Card, {
      slots: {
        default: '卡片内容'
      }
    })

    expect(wrapper.text()).toBe('卡片内容')
    expect(wrapper.classes()).toContain('bg-white')
    expect(wrapper.classes()).toContain('bordered')
  })

  it('应该正确渲染可悬停卡片', () => {
    const wrapper = mount(Card, {
      props: {
        hoverable: true
      },
      slots: {
        default: '可悬停卡片'
      }
    })

    expect(wrapper.classes()).toContain('hover:shadow-lg')
    expect(wrapper.classes()).toContain('transition-shadow')
  })

  it('应该正确渲染无边框卡片', () => {
    const wrapper = mount(Card, {
      props: {
        bordered: false
      },
      slots: {
        default: '无边框卡片'
      }
    })

    expect(wrapper.classes()).not.toContain('bordered')
  })

  it('应该正确渲染加载状态', () => {
    const wrapper = mount(Card, {
      props: {
        loading: true
      },
      slots: {
        default: '加载中'
      }
    })

    expect(wrapper.find('.animate-pulse').exists()).toBe(true)
  })

  it('应该正确渲染不同阴影等级', () => {
    const sizes = ['none', 'sm', 'md', 'lg', 'xl'] as const

    sizes.forEach(size => {
      const wrapper = mount(Card, {
        props: {
          shadow: size
        },
        slots: {
          default: `阴影${size}`
        }
      })

      const shadowClass = `shadow-${size === 'none' ? 'none' : size}`
      expect(wrapper.classes()).toContain(shadowClass)
    })
  })

  it('应该正确渲染不同内边距', () => {
    const paddings = ['none', 'sm', 'md', 'lg'] as const

    paddings.forEach(padding => {
      const wrapper = mount(Card, {
        props: {
          padding
        },
        slots: {
          default: `内边距${padding}`
        }
      })

      const paddingClass = `p-${padding === 'none' ? '0' : padding === 'sm' ? '4' : padding === 'md' ? '6' : '8'}`
      expect(wrapper.classes()).toContain(paddingClass)
    })
  })

  it('应该正确应用自定义类名', () => {
    const wrapper = mount(Card, {
      props: {
        className: 'custom-card'
      },
      slots: {
        default: '自定义卡片'
      }
    })

    expect(wrapper.classes()).toContain('custom-card')
  })
})

describe('CardHeader组件', () => {
  it('应该正确渲染卡片头部', () => {
    const wrapper = mount(CardHeader, {
      slots: {
        default: '头部内容'
      }
    })

    expect(wrapper.text()).toBe('头部内容')
    expect(wrapper.classes()).toContain('mb-4')
  })

  it('应该正确渲染带分隔线的头部', () => {
    const wrapper = mount(CardHeader, {
      props: {
        divider: true
      },
      slots: {
        default: '带分隔线'
      }
    })

    expect(wrapper.classes()).toContain('border-b')
    expect(wrapper.classes()).toContain('border-neutral-200')
  })
})

describe('CardTitle组件', () => {
  it('应该正确渲染卡片标题', () => {
    const wrapper = mount(CardTitle, {
      slots: {
        default: '卡片标题'
      }
    })

    expect(wrapper.text()).toBe('卡片标题')
    expect(wrapper.classes()).toContain('text-lg')
    expect(wrapper.classes()).toContain('font-semibold')
  })

  it('应该正确渲染不同级别的标题', () => {
    const levels = [1, 2, 3, 4, 5, 6] as const

    levels.forEach(level => {
      const wrapper = mount(CardTitle, {
        props: {
          level
        },
        slots: {
          default: `标题${level}`
        }
      })

      expect(wrapper.find(`h${level}`).exists()).toBe(true)
    })
  })
})

describe('CardContent组件', () => {
  it('应该正确渲染卡片内容', () => {
    const wrapper = mount(CardContent, {
      slots: {
        default: '内容区域'
      }
    })

    expect(wrapper.text()).toBe('内容区域')
  })
})

describe('CardFooter组件', () => {
  it('应该正确渲染卡片底部', () => {
    const wrapper = mount(CardFooter, {
      slots: {
        default: '底部内容'
      }
    })

    expect(wrapper.text()).toBe('底部内容')
    expect(wrapper.classes()).toContain('flex')
    expect(wrapper.classes()).toContain('justify-end')
  })
})

describe('Card组合使用', () => {
  it('应该正确组合使用Card子组件', () => {
    const wrapper = mount(Card, {
      slots: {
        default: (
          <>
            <CardHeader>
              <CardTitle>组合标题</CardTitle>
            </CardHeader>
            <CardContent>组合内容</CardContent>
            <CardFooter>组合底部</CardFooter>
          </>
        )
      }
    })

    expect(wrapper.text()).toContain('组合标题')
    expect(wrapper.text()).toContain('组合内容')
    expect(wrapper.text()).toContain('组合底部')
  })
})
