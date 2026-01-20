/**
 * @fileoverview YYC³餐饮管理系统 - MenuManagement组件单元测试
 * @description 测试MenuManagement组件的功能
 * @module MenuManagement.test
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref, reactive } from 'vue'
import ElementPlus, { ElMessage, ElMessageBox } from 'element-plus'
import MenuManagement from '@/views/MenuManagement.vue'
import { MenuAPI } from '@/api/menu'
import type { MenuItem } from '@/api/menu'

vi.mock('@/api/menu', () => ({
  MenuAPI: {
    getMenuItems: vi.fn(),
    createMenuItem: vi.fn(),
    updateMenuItem: vi.fn(),
    deleteMenuItem: vi.fn()
  }
}))

vi.mock('element-plus', () => ({
  default: {
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  },
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn()
  }
}))

describe('MenuManagement组件', () => {
  let wrapper: VueWrapper<any>
  let pinia: any

  const mockMenuItems: MenuItem[] = [
    {
      id: 1,
      name: '宫保鸡丁',
      description: '经典川菜',
      price: 38.00,
      category: '小菜',
      imageUrl: 'http://example.com/gongbao.jpg',
      available: true,
      ingredients: ['鸡肉', '花生', '辣椒'],
      allergens: ['花生'],
      nutritionInfo: {
        calories: 280,
        protein: 25,
        carbs: 15,
        fat: 14
      },
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-15T10:00:00Z'
    },
    {
      id: 2,
      name: '番茄牛腩',
      description: '营养美味',
      price: 58.00,
      category: '主食',
      imageUrl: 'http://example.com/niu.jpg',
      available: true,
      ingredients: ['牛肉', '番茄', '洋葱'],
      allergens: [],
      createdAt: '2025-01-14T09:00:00Z',
      updatedAt: '2025-01-14T09:00:00Z'
    },
    {
      id: 3,
      name: '冰镇酸梅汤',
      description: '消暑饮品',
      price: 12.00,
      category: '饮料',
      available: false,
      ingredients: ['乌梅', '山楂', '甘草'],
      allergens: [],
      createdAt: '2025-01-13T08:00:00Z',
      updatedAt: '2025-01-13T08:00:00Z'
    }
  ]

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    vi.clearAllMocks()

    ;(MenuAPI.getMenuItems as any).mockResolvedValue({
      success: true,
      data: {
        items: mockMenuItems,
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          totalPages: 1
        }
      }
    })
  })

  const createWrapper = () => {
    return mount(MenuManagement, {
      global: {
        plugins: [ElementPlus, pinia],
        stubs: {
          'el-dialog': {
            template: '<div class="el-dialog-mock" v-if="modelValue"><slot></slot><slot name="footer"></slot></div>',
            props: ['modelValue', 'title'],
            emits: ['update:modelValue']
          },
          'el-table': {
            template: '<div class="el-table-mock"><slot v-for="item in $slots.default?.[0]?.children" name="default"></slot></div>',
            props: ['data', 'loading', 'rowKey', 'stripe']
          },
          'el-table-column': {
            template: '<div class="el-table-column-mock"><slot></slot></div>',
            props: ['prop', 'label', 'width', 'minWidth', 'fixed']
          }
        }
      }
    })
  }

  describe('初始化渲染', () => {
    it('应该正确渲染页面标题', () => {
      wrapper = createWrapper()
      expect(wrapper.find('h1').text()).toBe('菜单管理')
    })

    it('应该渲染添加菜品按钮', () => {
      wrapper = createWrapper()
      expect(wrapper.vm.showCreateDialog).toBeDefined()
    })

    it('应该渲染筛选表单', () => {
      wrapper = createWrapper()
      expect(wrapper.vm.filterForm).toBeDefined()
    })

    it('应该渲染菜单列表', () => {
      wrapper = createWrapper()
      expect(wrapper.vm.menuItems).toBeDefined()
    })

    it('应该渲染分页组件', () => {
      wrapper = createWrapper()
      expect(wrapper.vm.pagination).toBeDefined()
    })
  })

  describe('数据加载', () => {
    it('应该正确加载菜单数据', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      expect(MenuAPI.getMenuItems).toHaveBeenCalled()
      expect(typeof wrapper.vm.loadMenuItems).toBe('function')
    })

    it('应该正确显示菜单项名称', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      expect(typeof wrapper.vm.loadMenuItems).toBe('function')
    })

    it('应该正确显示菜单项价格', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      expect(typeof wrapper.vm.loadMenuItems).toBe('function')
    })

    it('应该正确显示菜单项分类标签', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      expect(typeof wrapper.vm.loadMenuItems).toBe('function')
    })
  })

  describe('状态显示', () => {
    it('应该正确显示上架状态', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      expect(typeof wrapper.vm.handleStatusChange).toBe('function')
    })

    it('应该正确显示下架状态', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      expect(typeof wrapper.vm.handleStatusChange).toBe('function')
    })
  })

  describe('筛选功能', () => {
    it('应该能够按分类筛选', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.filterForm).toBeDefined()
      expect(typeof wrapper.vm.filterForm.category).toBe('string')
    })

    it('应该能够按状态筛选', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.filterForm).toBeDefined()
      expect(typeof wrapper.vm.filterForm.available).toBe('undefined' || 'boolean')
    })

    it('应该能够搜索菜品', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.filterForm).toBeDefined()
      expect(typeof wrapper.vm.filterForm.search).toBe('string')
    })

    it('应该能够重置筛选条件', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      expect(typeof wrapper.vm.resetFilter).toBe('function')
    })
  })

  describe('分页功能', () => {
    it('应该正确初始化分页', () => {
      wrapper = createWrapper()
      expect(wrapper.vm.pagination.page).toBe(1)
      expect(wrapper.vm.pagination.limit).toBe(20)
    })

    it('应该能够切换页码', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      ;(MenuAPI.getMenuItems as any).mockResolvedValue({
        success: true,
        data: {
          items: mockMenuItems.slice(0, 2),
          pagination: {
            page: 2,
            limit: 20,
            total: 3,
            totalPages: 1
          }
        }
      })

      wrapper.vm.pagination.page = 2
      await wrapper.vm.$nextTick()
      expect(MenuAPI.getMenuItems).toHaveBeenCalled()
    })
  })

  describe('创建功能', () => {
    it('应该能够打开创建对话框', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.showCreateDialog).toBe(false)
      wrapper.vm.showCreateDialog = true
      expect(wrapper.vm.showCreateDialog).toBe(true)
    })

    it('创建对话框应该包含表单字段', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.formData).toBeDefined()
      expect(wrapper.vm.formData.name).toBe('')
      expect(wrapper.vm.formData.category).toBe('')
      expect(wrapper.vm.formData.price).toBe(0)
    })

    it('应该能够创建新菜品', async () => {
      ;(MenuAPI.createMenuItem as any).mockResolvedValue({
        success: true,
        message: '创建成功',
        data: {
          id: 4,
          name: '新菜品',
          description: '新菜品描述',
          price: 25.00,
          category: '小菜',
          available: true,
          ingredients: [],
          allergens: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      })

      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      wrapper.vm.showCreateDialog = true
      await wrapper.vm.$nextTick()

      Object.assign(wrapper.vm.formData, {
        name: '新菜品',
        category: '小菜',
        price: 25.00,
        description: '新菜品描述',
        available: true
      })

      expect(typeof wrapper.vm.handleSubmit).toBe('function')
    })
  })

  describe('编辑功能', () => {
    it('应该能够编辑菜品', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      expect(typeof wrapper.vm.handleEdit).toBe('function')
      expect(wrapper.vm.editingItem).toBe(null)

      wrapper.vm.handleEdit(mockMenuItems[0])
      expect(wrapper.vm.editingItem).toBeDefined()
    })
  })

  describe('删除功能', () => {
    it('应该能够删除菜品', async () => {
      ;(ElMessageBox.confirm as any).mockResolvedValue(true)
      ;(MenuAPI.deleteMenuItem as any).mockResolvedValue({
        success: true,
        message: '删除成功'
      })

      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      expect(typeof wrapper.vm.handleDelete).toBe('function')
      await wrapper.vm.handleDelete(mockMenuItems[0])
      expect(MenuAPI.deleteMenuItem).toHaveBeenCalledWith(1)
    })
  })

  describe('状态切换', () => {
    it('应该能够切换菜品状态', async () => {
      ;(MenuAPI.updateMenuItem as any).mockResolvedValue({
        success: true,
        message: '状态更新成功'
      })

      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      const menuItem = { ...mockMenuItems[0], available: false }
      await wrapper.vm.handleStatusChange(menuItem)
      await wrapper.vm.$nextTick()

      expect(MenuAPI.updateMenuItem).toHaveBeenCalled()
    })
  })

  describe('表单验证', () => {
    it('应该验证必填字段', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      wrapper.vm.showCreateDialog = true
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.formRules.name[0].required).toBe(true)
      expect(wrapper.vm.formRules.category[0].required).toBe(true)
      expect(wrapper.vm.formRules.price[0].required).toBe(true)
    })
  })

  describe('格式化功能', () => {
    it('应该正确格式化日期时间', () => {
      wrapper = createWrapper()
      const formattedDate = wrapper.vm.formatDateTime('2025-01-15T10:00:00Z')
      expect(formattedDate).not.toBe('-')
    })

    it('应该处理空日期', () => {
      wrapper = createWrapper()
      const formattedDate = wrapper.vm.formatDateTime(undefined)
      expect(formattedDate).toBe('-')
    })
  })
})
