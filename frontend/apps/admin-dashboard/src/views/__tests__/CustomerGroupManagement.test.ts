/**
 * YYC³餐饮行业智能化平台 - 客户分群管理组件单元测试
 * @fileoverview 测试客户分群管理组件的各种功能
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-20
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import CustomerGroupManagement from '../CustomerGroupManagement.vue'
import * as customerAPI from '@/api/customer'

// 模拟ElementPlus组件
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn()
  },
  ElCard: {
    name: 'ElCard',
    template: '<div><slot /></div>'
  },
  ElForm: {
    name: 'ElForm',
    template: '<div><slot /></div>'
  },
  ElFormItem: {
    name: 'ElFormItem',
    template: '<div><slot /></div>'
  },
  ElInput: {
    name: 'ElInput',
    template: '<input />'
  },
  ElSelect: {
    name: 'ElSelect',
    template: '<select><slot /></select>'
  },
  ElOption: {
    name: 'ElOption',
    template: '<option><slot /></option>'
  },
  ElButton: {
    name: 'ElButton',
    template: '<button><slot /></button>'
  },
  ElTable: {
    name: 'ElTable',
    template: '<table><slot /></table>'
  },
  ElTableColumn: {
    name: 'ElTableColumn',
    template: '<td><slot /></td>'
  },
  ElDialog: {
    name: 'ElDialog',
    template: '<div v-if="modelValue"><slot /></div>',
    props: ['modelValue']
  },
  ElTag: {
    name: 'ElTag',
    template: '<span><slot /></span>'
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<i><slot /></i>'
  }
}))

// 模拟API
vi.mock('@/api/customer', () => ({
  getCustomerGroups: vi.fn(),
  getCustomerGroupDetail: vi.fn(),
  createCustomerGroup: vi.fn(),
  updateCustomerGroup: vi.fn(),
  deleteCustomerGroup: vi.fn(),
  getCustomerGroupMembers: vi.fn(),
  addCustomerToGroup: vi.fn(),
  removeCustomerFromGroup: vi.fn(),
  getCustomerGroupStatistics: vi.fn()
}))

const mockGroups = [
  {
    id: '1',
    name: '高价值客户',
    description: 'RFM评分大于等于13的客户',
    groupType: 'rfm',
    conditions: { rfmScore: 13 },
    color: '#409EFF',
    icon: 'el-icon-star',
    priority: 1,
    memberCount: 100,
    enabled: true,
    createdBy: 'admin',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z'
  },
  {
    id: '2',
    name: '新客户',
    description: '注册30天内的客户',
    groupType: 'manual',
    conditions: { daysSinceRegister: 30 },
    color: '#67C23A',
    icon: 'el-icon-user',
    priority: 2,
    memberCount: 50,
    enabled: true,
    createdBy: 'admin',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z'
  }
]

const mockStatistics = {
  totalGroups: 10,
  manualGroups: 5,
  autoGroups: 5,
  totalMembers: 500
}

const mockMembers = [
  {
    id: '1',
    customerId: '1',
    groupId: '1',
    customerName: '张三',
    customerPhone: '13800138001',
    addedAt: '2026-01-20T00:00:00Z'
  },
  {
    id: '2',
    customerId: '2',
    groupId: '1',
    customerName: '李四',
    customerPhone: '13800138002',
    addedAt: '2026-01-19T00:00:00Z'
  }
]

const mockAvailableCustomers = [
  {
    id: '3',
    name: '王五',
    phone: '13800138003',
    email: 'wangwu@example.com',
    status: 'active'
  },
  {
    id: '4',
    name: '赵六',
    phone: '13800138004',
    email: 'zhaoliu@example.com',
    status: 'active'
  }
]

describe('CustomerGroupManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm')
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('初始化', () => {
    it('应该正确渲染组件', () => {
      const wrapper = mount(CustomerGroupManagement, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true,
            ElIcon: true
          }
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('应该在挂载时加载统计数据', async () => {
      vi.mocked(customerAPI.getCustomerGroupStatistics).mockResolvedValue(mockStatistics)

      const wrapper = mount(CustomerGroupManagement, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true,
            ElIcon: true
          }
        }
      })

      await wrapper.vm.loadStatistics()

      expect(customerAPI.getCustomerGroupStatistics).toHaveBeenCalledTimes(1)
      expect(wrapper.vm.statistics).toEqual(mockStatistics)
    })

    it('应该在挂载时加载分群列表', async () => {
      vi.mocked(customerAPI.getCustomerGroups).mockResolvedValue({
        data: mockGroups,
        total: mockGroups.length
      })

      const wrapper = mount(CustomerGroupManagement, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true,
            ElIcon: true
          }
        }
      })

      await wrapper.vm.loadGroupList()

      expect(customerAPI.getCustomerGroups).toHaveBeenCalledTimes(1)
      expect(wrapper.vm.groupList).toEqual(mockGroups)
    })
  })

  describe('统计数据', () => {
    it('应该正确显示分群统计数据', async () => {
      vi.mocked(customerAPI.getCustomerGroupStatistics).mockResolvedValue(mockStatistics)

      const wrapper = mount(CustomerGroupManagement, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true,
            ElIcon: true
          }
        }
      })

      await wrapper.vm.loadStatistics()

      expect(wrapper.vm.statistics.totalGroups).toBe(10)
      expect(wrapper.vm.statistics.manualGroups).toBe(5)
      expect(wrapper.vm.statistics.autoGroups).toBe(5)
      expect(wrapper.vm.statistics.totalMembers).toBe(500)
    })
  })

  describe('分群列表', () => {
    it('应该正确加载分群列表', async () => {
      vi.mocked(customerAPI.getCustomerGroups).mockResolvedValue({
        data: mockGroups,
        total: mockGroups.length
      })

      const wrapper = mount(CustomerGroupManagement, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true,
            ElIcon: true
          }
        }
      })

      await wrapper.vm.loadGroupList()

      expect(wrapper.vm.groupList).toHaveLength(2)
      expect(wrapper.vm.groupList[0].name).toBe('高价值客户')
      expect(wrapper.vm.groupList[1].name).toBe('新客户')
    })

    it('应该支持分群名称搜索', async () => {
      vi.mocked(customerAPI.getCustomerGroups).mockResolvedValue({
        data: mockGroups.slice(0, 1),
        total: 1
      })

      const wrapper = mount(CustomerGroupManagement, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true,
            ElIcon: true
          }
        }
      })

      wrapper.vm.filters.name = '高价值'
      await wrapper.vm.loadGroupList()

      expect(customerAPI.getCustomerGroups).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '高价值'
        })
      )
    })

    it('应该支持分群类型筛选', async () => {
      vi.mocked(customerAPI.getCustomerGroups).mockResolvedValue({
        data: mockGroups.slice(0, 1),
        total: 1
      })

      const wrapper = mount(CustomerGroupManagement, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true,
            ElIcon: true
          }
        }
      })

      wrapper.vm.filters.groupType = 'rfm'
      await wrapper.vm.loadGroupList()

      expect(customerAPI.getCustomerGroups).toHaveBeenCalledWith(
        expect.objectContaining({
          groupType: 'rfm'
        })
      )
    })

    it('应该支持状态筛选', async () => {
      vi.mocked(customerAPI.getCustomerGroups).mockResolvedValue({
        data: mockGroups,
        total: mockGroups.length
      })

      const wrapper = mount(CustomerGroupManagement, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true,
            ElIcon: true
          }
        }
      })

      wrapper.vm.filters.enabled = 'true'
      await wrapper.vm.loadGroupList()

      expect(customerAPI.getCustomerGroups).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: true
        })
      )
    })
  })

  describe('创建分群', () => {
    it('应该正确打开创建分群对话框', () => {
      const wrapper = mount(CustomerGroupManagement, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true,
            ElIcon: true
          }
        }
      })

      wrapper.vm.handleCreate()

      expect(wrapper.vm.groupDialogVisible).toBe(true)
      expect(wrapper.vm.groupForm.id).toBe('')
      expect(wrapper.vm.dialogMode).toBe('create')
    })

    it('应该正确创建分群', async () => {
      vi.mocked(customerAPI.createCustomerGroup).mockResolvedValue({
        id: '3',
        name: '测试分群',
        description: '测试描述',
        groupType: 'manual',
        color: '#409EFF',
        icon: 'el-icon-star',
        priority: 3,
        memberCount: 0,
        enabled: true,
        createdBy: 'admin',
        createdAt: '2026-01-20T00:00:00Z',
        updatedAt: '2026-01-20T00:00:00Z'
      })

      const wrapper = mount(CustomerGroupManagement, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true,
            ElIcon: true
          }
        }
      })

      wrapper.vm.groupForm.name = '测试分群'
      wrapper.vm.groupForm.description = '测试描述'
      wrapper.vm.groupForm.groupType = 'manual'
      wrapper.vm.groupForm.color = '#409EFF'
      wrapper.vm.groupForm.icon = 'el-icon-star'
      wrapper.vm.groupForm.priority = 3
      wrapper.vm.groupForm.enabled = true

      await wrapper.vm.handleGroupSubmit()

      expect(customerAPI.createCustomerGroup).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '测试分群',
          description: '测试描述',
          groupType: 'manual'
        })
      )
      expect(ElMessage.success).toHaveBeenCalledWith('创建成功')
      expect(wrapper.vm.groupDialogVisible).toBe(false)
    })
  })

  describe('编辑分群', () => {
    it('应该正确打开编辑分群对话框', async () => {
      vi.mocked(customerAPI.getCustomerGroupDetail).mockResolvedValue(mockGroups[0])

      const wrapper = mount(CustomerGroupManagement, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true,
            ElIcon: true
          }
        }
      })

      await wrapper.vm.handleEdit(mockGroups[0])

      expect(wrapper.vm.groupDialogVisible).toBe(true)
      expect(wrapper.vm.groupForm.id).toBe('1')
      expect(wrapper.vm.dialogMode).toBe('edit')
      expect(wrapper.vm.groupForm.name).toBe('高价值客户')
    })

    it('应该正确更新分群', async () => {
      vi.mocked(customerAPI.updateCustomerGroup).mockResolvedValue({
        ...mockGroups[0],
        name: '更新后的分群名称'
      })

      const wrapper = mount(CustomerGroupManagement, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true,
            ElIcon: true
          }
        }
      })

      wrapper.vm.groupForm.id = '1'
      wrapper.vm.groupForm.name = '更新后的分群名称'
      wrapper.vm.groupForm.description = '更新后的描述'
      wrapper.vm.groupForm.groupType = 'rfm'
      wrapper.vm.groupForm.color = '#409EFF'
      wrapper.vm.groupForm.icon = 'el-icon-star'
      wrapper.vm.groupForm.priority = 1
      wrapper.vm.groupForm.enabled = true

      await wrapper.vm.handleGroupSubmit()

      expect(customerAPI.updateCustomerGroup).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          name: '更新后的分群名称'
        })
      )
      expect(ElMessage.success).toHaveBeenCalledWith('更新成功')
      expect(wrapper.vm.groupDialogVisible).toBe(false)
    })
  })

  describe('删除分群', () => {
    it('应该正确删除分群', async () => {
      vi.mocked(customerAPI.deleteCustomerGroup).mockResolvedValue(null)

      const wrapper = mount(CustomerGroupManagement, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true,
            ElIcon: true
          }
        }
      })

      await wrapper.vm.handleDelete(mockGroups[0])

      expect(ElMessageBox.confirm).toHaveBeenCalled()
      expect(customerAPI.deleteCustomerGroup).toHaveBeenCalledWith('1')
      expect(ElMessage.success).toHaveBeenCalledWith('删除成功')
    })

    it('应该在用户取消删除时不执行删除操作', async () => {
      vi.mocked(ElMessageBox.confirm).mockRejectedValue('cancel')
      vi.mocked(customerAPI.deleteCustomerGroup).mockResolvedValue(null)

      const wrapper = mount(CustomerGroupManagement, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true,
            ElIcon: true
          }
        }
      })

      await wrapper.vm.handleDelete(mockGroups[0])

      expect(customerAPI.deleteCustomerGroup).not.toHaveBeenCalled()
    })
  })

  describe('分群成员管理', () => {
    it('应该正确打开成员管理对话框', async () => {
      vi.mocked(customerAPI.getCustomerGroupMembers).mockResolvedValue({
        data: mockMembers,
        total: mockMembers.length
      })

      const wrapper = mount(CustomerGroupManagement, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true,
            ElIcon: true
          }
        }
      })

      await wrapper.vm.handleManageMembers(mockGroups[0])

      expect(wrapper.vm.membersDialogVisible).toBe(true)
      expect(wrapper.vm.currentGroupId).toBe('1')
      expect(wrapper.vm.currentGroupName).toBe('高价值客户')
      expect(customerAPI.getCustomerGroupMembers).toHaveBeenCalledWith('1', expect.any(Object))
    })

    it('应该正确加载成员列表', async () => {
      vi.mocked(customerAPI.getCustomerGroupMembers).mockResolvedValue({
        data: mockMembers,
        total: mockMembers.length
      })

      const wrapper = mount(CustomerGroupManagement, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true,
            ElIcon: true
          }
        }
      })

      wrapper.vm.currentGroupId = '1'
      await wrapper.vm.loadMembers()

      expect(customerAPI.getCustomerGroupMembers).toHaveBeenCalledWith('1', expect.any(Object))
      expect(wrapper.vm.memberList).toHaveLength(2)
    })

    it('应该正确打开添加成员对话框', async () => {
      const wrapper = mount(CustomerGroupManagement, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true,
            ElIcon: true
          }
        }
      })

      wrapper.vm.currentGroupId = '1'
      wrapper.vm.handleAddMembers()

      expect(wrapper.vm.addMembersDialogVisible).toBe(true)
    })

    it('应该正确添加成员', async () => {
      vi.mocked(customerAPI.addCustomerToGroup).mockResolvedValue(null)

      const wrapper = mount(CustomerGroupManagement, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true,
            ElIcon: true
          }
        }
      })

      wrapper.vm.currentGroupId = '1'
      wrapper.vm.selectedCustomerIds = ['3', '4']

      await wrapper.vm.handleAddMembersSubmit()

      expect(customerAPI.addCustomerToGroup).toHaveBeenCalledWith('1', ['3', '4'])
      expect(ElMessage.success).toHaveBeenCalledWith('添加成功')
      expect(wrapper.vm.addMembersDialogVisible).toBe(false)
    })

    it('应该正确移除成员', async () => {
      vi.mocked(customerAPI.removeCustomerFromGroup).mockResolvedValue(null)

      const wrapper = mount(CustomerGroupManagement, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true,
            ElIcon: true
          }
        }
      })

      await wrapper.vm.handleRemoveMember(mockMembers[0])

      expect(customerAPI.removeCustomerFromGroup).toHaveBeenCalledWith('1', '1')
      expect(ElMessage.success).toHaveBeenCalledWith('移除成功')
    })
  })

  describe('重置筛选', () => {
    it('应该正确重置筛选条件', () => {
      const wrapper = mount(CustomerGroupManagement, {
        global: {
          stubs: {
            ElCard: true,
            ElForm: true,
            ElFormItem: true,
            ElInput: true,
            ElSelect: true,
            ElOption: true,
            ElButton: true,
            ElTable: true,
            ElTableColumn: true,
            ElDialog: true,
            ElTag: true,
            ElIcon: true
          }
        }
      })

      wrapper.vm.filters.name = '高价值'
      wrapper.vm.filters.groupType = 'rfm'
      wrapper.vm.filters.enabled = 'true'

      wrapper.vm.handleReset()

      expect(wrapper.vm.filters.name).toBe('')
      expect(wrapper.vm.filters.groupType).toBe('')
      expect(wrapper.vm.filters.enabled).toBe('')
    })
  })
})
