/**
 * @fileoverview Input组件单元测试
 * @description 测试Input组件的功能
 * @module Input.test
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { Input } from '@/components/UI/Input'

describe('Input组件', () => {
  it('应该正确渲染默认输入框', () => {
    const wrapper = mount(Input, {
      props: {
        placeholder: '请输入内容'
      }
    })

    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
    expect(input.attributes('placeholder')).toBe('请输入内容')
  })

  it('应该正确绑定v-model', async () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: '初始值'
      }
    })

    const input = wrapper.find('input')
    expect(input.element.value).toBe('初始值')

    await input.setValue('新值')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['新值'])
  })

  it('应该正确渲染密码类型', () => {
    const wrapper = mount(Input, {
      props: {
        type: 'password'
      }
    })

    const input = wrapper.find('input')
    expect(input.attributes('type')).toBe('password')
  })

  it('应该正确渲染禁用状态', () => {
    const wrapper = mount(Input, {
      props: {
        disabled: true
      }
    })

    const input = wrapper.find('input')
    expect(input.attributes('disabled')).toBeDefined()
  })

  it('应该正确渲染只读状态', () => {
    const wrapper = mount(Input, {
      props: {
        readonly: true
      }
    })

    const input = wrapper.find('input')
    expect(input.attributes('readonly')).toBeDefined()
  })

  it('应该正确渲染必填状态', () => {
    const wrapper = mount(Input, {
      props: {
        required: true
      }
    })

    const input = wrapper.find('input')
    expect(input.attributes('required')).toBeDefined()
  })

  it('应该正确渲染错误状态', () => {
    const wrapper = mount(Input, {
      props: {
        error: true,
        errorMessage: '请输入有效的内容'
      }
    })

    expect(wrapper.classes()).toContain('border-danger-500')
    expect(wrapper.text()).toContain('请输入有效的内容')
  })

  it('应该正确渲染小型输入框', () => {
    const wrapper = mount(Input, {
      props: {
        size: 'sm'
      }
    })

    expect(wrapper.classes()).toContain('h-8')
  })

  it('应该正确渲染大型输入框', () => {
    const wrapper = mount(Input, {
      props: {
        size: 'lg'
      }
    })

    expect(wrapper.classes()).toContain('h-12')
  })

  it('应该正确渲染前缀图标', () => {
    const IconComponent = {
      template: '<span>icon</span>'
    }
    const wrapper = mount(Input, {
      props: {
        prefix: IconComponent
      }
    })

    expect(wrapper.text()).toContain('icon')
  })

  it('应该正确渲染后缀图标', () => {
    const IconComponent = {
      template: '<span>icon</span>'
    }
    const wrapper = mount(Input, {
      props: {
        suffix: IconComponent
      }
    })

    expect(wrapper.text()).toContain('icon')
  })

  it('应该正确触发focus事件', async () => {
    const onFocus = vi.fn()
    const wrapper = mount(Input, {
      props: {
        onFocus
      }
    })

    const input = wrapper.find('input')
    await input.trigger('focus')
    expect(onFocus).toHaveBeenCalledTimes(1)
  })

  it('应该正确触发blur事件', async () => {
    const onBlur = vi.fn()
    const wrapper = mount(Input, {
      props: {
        onBlur
      }
    })

    const input = wrapper.find('input')
    await input.trigger('blur')
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('应该正确触发change事件', async () => {
    const onChange = vi.fn()
    const wrapper = mount(Input, {
      props: {
        onChange
      }
    })

    const input = wrapper.find('input')
    await input.setValue('新值')
    await input.trigger('blur')
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('应该正确触发keydown事件', async () => {
    const onKeydown = vi.fn()
    const wrapper = mount(Input, {
      props: {
        onKeydown
      }
    })

    const input = wrapper.find('input')
    await input.trigger('keydown', { key: 'Enter' })
    expect(onKeydown).toHaveBeenCalledTimes(1)
  })

  it('应该正确触发enter事件', async () => {
    const onEnter = vi.fn()
    const wrapper = mount(Input, {
      props: {
        onEnter
      }
    })

    const input = wrapper.find('input')
    await input.trigger('keydown', { key: 'Enter' })
    expect(onEnter).toHaveBeenCalledTimes(1)
  })

  it('应该正确应用自定义类名', () => {
    const wrapper = mount(Input, {
      props: {
        className: 'custom-class'
      }
    })

    expect(wrapper.classes()).toContain('custom-class')
  })

  it('应该正确显示字数统计', () => {
    const wrapper = mount(Input, {
      props: {
        showWordLimit: true,
        maxLength: 10,
        modelValue: '测试'
      }
    })

    expect(wrapper.text()).toContain('4/10')
  })
})
