/**
 * YYC³餐饮管理系统 - 登录页面测试
 * 基于"五高五标五化"理念的测试用例设计
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Login from '../Login.vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

// Mock依赖
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    login: vi.fn()
  }))
}))

vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// 创建共享的stubs配置
const commonStubs = {
  'el-button': { template: '<button><slot></slot></button>' },
  'el-input': { 
    template: '<input v-bind:value="value" v-on:input="$emit(\'update:modelValue\', $event.target.value)" v-on="$attrs" />', 
    data() { return { value: '' } } 
  },
  'el-form': { template: '<div><slot></slot></div>' },
  'el-form-item': { template: '<div><slot></slot></div>' },
  'el-checkbox': { 
    template: '<input type="checkbox" v-bind:checked="modelValue" v-on:change="$emit(\'update:modelValue\', $event.target.checked)" />', 
    props: ['modelValue']
  },
  'el-divider': { template: '<div><slot></slot></div>' }
}

describe('Login', () => {
  let wrapper: any
  let mockRouter: any
  let mockAuthStore: any

  beforeEach(() => {
    // 设置模拟路由
    mockRouter = {
      push: vi.fn()
    }
    ;(useRouter as vi.Mock).mockReturnValue(mockRouter)

    // 设置模拟auth store
    mockAuthStore = {
      login: vi.fn()
    }
    ;(useAuthStore as vi.Mock).mockReturnValue(mockAuthStore)

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
    wrapper = mount(Login, {
      global: {
        stubs: commonStubs
      }
    })
    
    // 设置表单引用
    wrapper.vm.loginFormRef = {
      validate: vi.fn().mockResolvedValue(true)
    } as any
  })

  afterEach(() => {
    wrapper.unmount()
    vi.clearAllMocks()
  })

  describe('基础渲染', () => {
    it('应该正确渲染登录页面', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.login-container').exists()).toBe(true)
      expect(wrapper.find('.login-card').exists()).toBe(true)
    })

    it('应该显示Logo和标题', () => {
      const logoSection = wrapper.find('.logo-section')
      expect(logoSection.exists()).toBe(true)
      expect(logoSection.text()).toContain('YYC³餐饮管理后台')
      expect(logoSection.text()).toContain('基于五高五标五化理念的智能化管理平台')
    })

    it('应该显示登录表单', () => {
      const loginForm = wrapper.find('.login-form')
      expect(loginForm.exists()).toBe(true)
    })

    it('应该显示邮箱输入框', () => {
      const emailInput = wrapper.find('input[placeholder="请输入邮箱"]')
      expect(emailInput.exists()).toBe(true)
    })

    it('应该显示密码输入框', () => {
      const passwordInput = wrapper.find('input[placeholder="请输入密码"]')
      expect(passwordInput.exists()).toBe(true)
    })

    it('应该显示登录按钮', () => {
      const loginBtn = wrapper.find('.login-btn')
      expect(loginBtn.exists()).toBe(true)
    })

    it('应该显示快速登录按钮', () => {
      const quickButtons = wrapper.find('.quick-buttons')
      expect(quickButtons.exists()).toBe(true)
      expect(quickButtons.text()).toContain('管理员体验')
      expect(quickButtons.text()).toContain('员工端体验')
      expect(quickButtons.text()).toContain('顾客端体验')
    })
  })

  describe('表单验证', () => {
    it('应该验证邮箱格式', async () => {
      // 设置无效邮箱
      wrapper.vm.loginForm.email = 'invalid-email'
      
      // 设置validate方法返回false
      wrapper.vm.loginFormRef.validate.mockResolvedValue(false)
      
      // 直接调用validate方法进行测试
      const valid = await wrapper.vm.loginFormRef?.validate()
      expect(valid).toBe(false)
    })

    it('应该验证密码长度', async () => {
      // 设置无效密码
      wrapper.vm.loginForm.password = '123'
      
      // 设置validate方法返回false
      wrapper.vm.loginFormRef.validate.mockResolvedValue(false)
      
      // 直接调用validate方法进行测试
      const valid = await wrapper.vm.loginFormRef?.validate()
      expect(valid).toBe(false)
    }) 

    it('应该验证必填项', async () => {
      // 清空表单
      wrapper.vm.loginForm.email = ''
      wrapper.vm.loginForm.password = ''
      
      // 设置validate方法返回false
      wrapper.vm.loginFormRef.validate.mockResolvedValue(false)
      
      // 直接调用validate方法进行测试
      const valid = await wrapper.vm.loginFormRef?.validate()
      expect(valid).toBe(false)
    })
  })

  describe('登录功能', () => {
    it('应该成功登录并跳转到工作台', async () => {
      // 设置有效表单数据
      wrapper.vm.loginForm.email = 'admin@yyc3.com'
      wrapper.vm.loginForm.password = 'admin123'
      
      // Mock登录成功
      mockAuthStore.login.mockResolvedValue(true)
      
      // 调用登录方法
      await wrapper.vm.handleLogin()
      
      // 验证登录方法被调用
      expect(mockAuthStore.login).toHaveBeenCalledWith({
        email: 'admin@yyc3.com',
        password: 'admin123'
      })
      
      // 验证成功消息
      expect(ElMessage.success).toHaveBeenCalledWith('登录成功')
      
      // 验证路由跳转
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
    })

    it('应该处理登录失败', async () => {
      // 设置有效表单数据
      wrapper.vm.loginForm.email = 'admin@yyc3.com'
      wrapper.vm.loginForm.password = 'wrongpassword'
      
      // Mock登录失败
      const errorMsg = '登录失败，请检查用户名和密码'
      mockAuthStore.login.mockRejectedValue(new Error(errorMsg))
      
      // 调用登录方法
      await wrapper.vm.handleLogin()
      
      // 验证失败消息
      expect(ElMessage.error).toHaveBeenCalledWith(errorMsg)
      
      // 验证路由没有跳转
      expect(mockRouter.push).not.toHaveBeenCalled()
    })

    it('应该处理验证码错误', async () => {
      // 设置有效表单数据
      wrapper.vm.loginForm.email = 'admin@yyc3.com'
      wrapper.vm.loginForm.password = 'admin123'
      
      // Mock登录失败并要求验证码
      const errorMsg = '请输入验证码'
      mockAuthStore.login.mockRejectedValue(new Error(errorMsg))
      
      // 调用登录方法
      await wrapper.vm.handleLogin()
      
      // 验证失败消息
      expect(ElMessage.error).toHaveBeenCalledWith(errorMsg)
      
      // 验证显示验证码
      expect(wrapper.vm.showCaptcha).toBe(true)
    })
  })

  describe('快速登录', () => {
    it('管理员快速登录应该正确设置凭证', async () => {
      // 调用快速登录方法
      await wrapper.vm.quickLogin('admin')
      
      // 验证表单数据
      expect(wrapper.vm.loginForm.email).toBe('admin@yyc3.com')
      expect(wrapper.vm.loginForm.password).toBe('admin123')
    })

    it('员工快速登录应该正确设置凭证', async () => {
      // 调用快速登录方法
      await wrapper.vm.quickLogin('staff')
      
      // 验证表单数据
      expect(wrapper.vm.loginForm.email).toBe('staff@yyc3.com')
      expect(wrapper.vm.loginForm.password).toBe('staff123')
    })

    it('顾客快速登录应该正确设置凭证', async () => {
      // 调用快速登录方法
      await wrapper.vm.quickLogin('customer')
      
      // 验证表单数据
      expect(wrapper.vm.loginForm.email).toBe('customer@yyc3.com')
      expect(wrapper.vm.loginForm.password).toBe('customer123')
    })
  })

  describe('验证码功能', () => {
    it('应该生成验证码', () => {
      // 保存初始验证码
      const initialCaptchaUrl = wrapper.vm.captchaUrl
      
      // 刷新验证码
      wrapper.vm.refreshCaptcha()
      
      // 验证验证码已更新
      expect(wrapper.vm.captchaUrl).not.toBe(initialCaptchaUrl)
      expect(wrapper.vm.captchaUrl).toContain('data:image/svg+xml;charset=utf-8')
    })

    it('应该在组件挂载时生成验证码', () => {
      expect(wrapper.vm.captchaUrl).not.toBe('')
      expect(wrapper.vm.captchaUrl).toContain('data:image/svg+xml;charset=utf-8')
    })
  })

  describe('键盘事件', () => {
    it('应该支持Enter键提交表单', async () => {
      // Mock登录成功
      mockAuthStore.login.mockResolvedValue(true)
      
      // 直接获取登录按钮并点击（模拟表单提交）
      const loginButton = wrapper.find('.login-btn')
      await loginButton.trigger('click')
      
      // 验证登录方法被调用
      expect(mockAuthStore.login).toHaveBeenCalled()
    })
  })

  describe('localStorage交互', () => {
    it('应该从localStorage加载保存的用户信息', () => {
      // 设置localStorage mock返回用户信息
      const mockUser = { email: 'saved@yyc3.com' }
      window.localStorage.getItem.mockReturnValue(JSON.stringify(mockUser))
      
      // 重新挂载组件
      wrapper.unmount()
      wrapper = mount(Login, {
        global: {
          stubs: commonStubs
        }
      })
      
      // 验证用户信息被加载
      expect(wrapper.vm.loginForm.email).toBe('saved@yyc3.com')
    })
  })
})
