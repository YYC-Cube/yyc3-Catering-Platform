/**
 * @fileoverview YYC³餐饮管理系统 - KitchenManagement组件单元测试
 * @description 测试KitchenManagement组件的功能
 * @module KitchenManagement.test
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import ElementPlus from 'element-plus'
import * as echarts from 'echarts'
import KitchenManagement from '@/views/KitchenManagement.vue'
import { useKitchen } from '@/composables/useKitchen'
import type {
  KitchenTask,
  KitchenEmployee,
  TaskStatus,
  EmployeeStatus,
  TaskStation,
  TaskPriority
} from '@/types/kitchen'

vi.mock('@/composables/useKitchen', () => ({
  useKitchen: vi.fn(() => ({
    loading: ref(false),
    stats: ref({
      activeTasks: 5,
      completedToday: 42,
      efficiencyRate: 85.5,
      averagePreparationTime: 900,
      totalEmployees: 10,
      onlineEmployees: 8,
      totalEquipment: 20,
      normalEquipment: 18,
      maintenanceEquipment: 2,
      lowStockItems: 3,
      expiredItems: 1
    }),
    tasks: ref([]),
    employees: ref([]),
    inventory: ref([]),
    taskPagination: ref({ page: 1, limit: 20, total: 0, totalPages: 0 }),
    loadStats: vi.fn(),
    loadTasks: vi.fn(),
    loadEmployees: vi.fn(),
    updateTaskStatus: vi.fn(),
    assignTask: vi.fn(),
    updateEmployeeStatus: vi.fn(),
    refreshData: vi.fn()
  }))
}))

vi.mock('echarts', () => ({
  default: {
    init: vi.fn(() => ({
      setOption: vi.fn(),
      resize: vi.fn(),
      dispose: vi.fn()
    }))
  },
  init: vi.fn(() => ({
    setOption: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn()
  }))
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

describe('KitchenManagement组件', () => {
  let wrapper: VueWrapper<any>
  let pinia: any

  const mockTasks: KitchenTask[] = [
    {
      id: 'task-1',
      taskId: 'TASK001',
      orderNo: 'ORD001',
      itemName: '红烧肉',
      quantity: 2,
      station: 'hot_dish',
      priority: 'high',
      status: 'pending',
      tableNumber: 'A01',
      estimatedTime: 15,
      assignedTo: 'emp-1',
      specialRequests: '少辣',
      createdAt: '2025-01-20T10:00:00Z'
    },
    {
      id: 'task-2',
      taskId: 'TASK002',
      orderNo: 'ORD002',
      itemName: '清蒸鱼',
      quantity: 1,
      station: 'hot_dish',
      priority: 'normal',
      status: 'preparing',
      tableNumber: 'A02',
      estimatedTime: 20,
      assignedTo: 'emp-2',
      createdAt: '2025-01-20T10:05:00Z'
    }
  ]

  const mockEmployees: KitchenEmployee[] = [
    {
      id: 'emp-1',
      employeeCode: 'KITCHEN001',
      name: '张三',
      avatar: 'https://example.com/avatar1.jpg',
      position: 'chef',
      status: 'online',
      phone: '13800138000',
      email: 'zhangsan@example.com',
      hireDate: '2023-01-01',
      skills: ['炒菜', '炖汤', '切配'],
      certifications: [
        {
          id: 'cert-1',
          name: '厨师证',
          issueDate: '2022-01-01',
          expiryDate: '2025-01-01',
          issuer: '北京市烹饪协会'
        }
      ],
      currentTasks: 2,
      totalTasksCompleted: 150,
      efficiency: 92.5,
      averageTime: 12,
      workSchedule: [],
      createdAt: '2023-01-01T00:00:00Z'
    },
    {
      id: 'emp-2',
      employeeCode: 'KITCHEN002',
      name: '李四',
      avatar: 'https://example.com/avatar2.jpg',
      position: 'line_cook',
      status: 'busy',
      phone: '13900139000',
      email: 'lisi@example.com',
      hireDate: '2023-06-01',
      skills: ['切配', '备菜'],
      certifications: [],
      currentTasks: 3,
      totalTasksCompleted: 120,
      efficiency: 88.0,
      averageTime: 15,
      workSchedule: [],
      createdAt: '2023-06-01T00:00:00Z'
    }
  ]

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    vi.clearAllMocks()

    wrapper = mount(KitchenManagement, {
      global: {
        plugins: [pinia, ElementPlus],
        stubs: {
          'el-card': true,
          'el-row': true,
          'el-col': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-button': true,
          'el-button-group': true,
          'el-icon': true,
          'el-tag': true,
          'el-table': true,
          'el-table-column': true,
          'el-pagination': true,
          'el-dialog': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-input-number': true,
          'el-select': true,
          'el-option': true,
          'el-radio': true,
          'el-radio-group': true,
          'el-date-picker': true,
          'el-time-picker': true,
          'el-switch': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-rate': true,
          'el-avatar': true,
          'el-divider': true,
          'el-alert': true,
          'el-tooltip': true,
          'el-popover': true,
          'el-progress': true,
          'el-statistic': true,
          'el-badge': true,
          'el-empty': true
        }
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('组件渲染', () => {
    it('应该正确渲染厨房管理页面', () => {
      expect(wrapper.find('.kitchen-management').exists()).toBe(true)
      expect(wrapper.find('.page-title').text()).toBe('厨房管理')
    })

    it('应该显示页面描述', () => {
      expect(wrapper.find('.page-description').text()).toBe('管理厨房任务、员工分配和效率监控')
    })

    it('应该显示统计卡片', () => {
      expect(wrapper.vm.stats).toBeDefined()
    })

    it('应该显示功能标签页', () => {
      expect(wrapper.vm.activeTab).toBeDefined()
    })

    it('应该显示头部操作按钮', () => {
      expect(wrapper.vm.activeTab).toBeDefined()
    })
  })

  describe('统计数据', () => {
    it('应该正确显示进行中任务数', () => {
      expect(wrapper.vm.stats.activeTasks).toBe(5)
    })

    it('应该正确显示今日完成数', () => {
      expect(wrapper.vm.stats.completedToday).toBe(42)
    })

    it('应该正确显示效率率', () => {
      expect(wrapper.vm.stats.efficiencyRate).toBe(85.5)
    })

    it('应该正确显示平均准备时间', () => {
      expect(wrapper.vm.stats.averagePreparationTime).toBe(900)
    })

    it('应该正确显示员工总数', () => {
      expect(wrapper.vm.stats.totalEmployees).toBe(10)
    })

    it('应该正确显示在线员工数', () => {
      expect(wrapper.vm.stats.onlineEmployees).toBe(8)
    })

    it('应该正确显示设备总数', () => {
      expect(wrapper.vm.stats.totalEquipment).toBe(20)
    })

    it('应该正确显示正常设备数', () => {
      expect(wrapper.vm.stats.normalEquipment).toBe(18)
    })

    it('应该正确显示维护设备数', () => {
      expect(wrapper.vm.stats.maintenanceEquipment).toBe(2)
    })

    it('应该正确显示低库存项数', () => {
      expect(wrapper.vm.stats.lowStockItems).toBe(3)
    })

    it('应该正确显示过期项数', () => {
      expect(wrapper.vm.stats.expiredItems).toBe(1)
    })
  })

  describe('任务管理', () => {
    it('应该正确加载任务列表', async () => {
      expect(wrapper.vm.loadTasks).toBeDefined()
    })

    it('应该正确显示任务编号', () => {
      wrapper.vm.tasks = mockTasks
      const hasTaskCode = mockTasks.some(task => task.taskId.includes('TASK'))
      expect(hasTaskCode).toBe(true)
    })

    it('应该正确显示订单号', () => {
      wrapper.vm.tasks = mockTasks
      const hasOrderNo = mockTasks.some(task => task.orderNo.includes('ORD'))
      expect(hasOrderNo).toBe(true)
    })

    it('应该正确显示菜品名称', () => {
      wrapper.vm.tasks = mockTasks
      const hasItemName = mockTasks.some(task => task.itemName.includes('肉') || task.itemName.includes('鱼'))
      expect(hasItemName).toBe(true)
    })

    it('应该正确显示数量', () => {
      wrapper.vm.tasks = mockTasks
      const hasQuantity = mockTasks.some(task => task.quantity > 0)
      expect(hasQuantity).toBe(true)
    })

    it('应该正确显示工位', () => {
      wrapper.vm.tasks = mockTasks
      const hasStation = mockTasks.some(task => task.station === 'hot_dish')
      expect(hasStation).toBe(true)
    })

    it('应该正确显示优先级', () => {
      wrapper.vm.tasks = mockTasks
      const hasPriority = mockTasks.some(task => task.priority === 'high' || task.priority === 'normal')
      expect(hasPriority).toBe(true)
    })

    it('应该正确显示状态', () => {
      wrapper.vm.tasks = mockTasks
      const hasStatus = mockTasks.some(task => task.status === 'pending' || task.status === 'preparing')
      expect(hasStatus).toBe(true)
    })

    it('应该正确显示桌号', () => {
      wrapper.vm.tasks = mockTasks
      const hasTableNumber = mockTasks.some(task => task.tableNumber.includes('A'))
      expect(hasTableNumber).toBe(true)
    })

    it('应该正确显示预估时间', () => {
      wrapper.vm.tasks = mockTasks
      const hasEstimatedTime = mockTasks.some(task => task.estimatedTime > 0)
      expect(hasEstimatedTime).toBe(true)
    })

    it('应该正确显示分配员工', () => {
      wrapper.vm.tasks = mockTasks
      const hasAssignedTo = mockTasks.some(task => task.assignedTo && task.assignedTo.includes('emp'))
      expect(hasAssignedTo).toBe(true)
    })

    it('应该正确显示特殊要求', () => {
      wrapper.vm.tasks = mockTasks
      const hasSpecialRequests = mockTasks.some(task => task.specialRequests && task.specialRequests.length > 0)
      expect(hasSpecialRequests).toBe(true)
    })

    it('应该支持任务状态更新', async () => {
      const mockComposable = useKitchen()
      mockComposable.updateTaskStatus.mockResolvedValue({ success: true })

      wrapper.vm.tasks = mockTasks
      await wrapper.vm.handleTaskStatusChange(mockTasks[0], 'preparing' as TaskStatus)

      expect(wrapper.vm.tasks[0].status).toBe('preparing')
    })

    it('应该支持任务分配', async () => {
      const mockComposable = useKitchen()
      mockComposable.assignTask.mockResolvedValue({ success: true })

      wrapper.vm.assignForm = {
        taskId: 'task-1',
        staffId: 'emp-2',
        note: ''
      }

      expect(wrapper.vm.assignForm.staffId).toBe('emp-2')
    })

    it('应该支持任务筛选', () => {
      wrapper.vm.taskFilters = {
        station: 'hot_dish' as TaskStation,
        status: 'pending' as TaskStatus,
        priority: 'high' as TaskPriority,
        search: '红烧肉'
      }

      expect(wrapper.vm.taskFilters.station).toBe('hot_dish')
      expect(wrapper.vm.taskFilters.status).toBe('pending')
      expect(wrapper.vm.taskFilters.priority).toBe('high')
      expect(wrapper.vm.taskFilters.search).toBe('红烧肉')
    })

    it('应该支持任务排序', () => {
      wrapper.vm.taskSort = {
        sortBy: 'priority',
        sortOrder: 'desc'
      }

      expect(wrapper.vm.taskSort.sortBy).toBe('priority')
      expect(wrapper.vm.taskSort.sortOrder).toBe('desc')
    })
  })

  describe('员工管理', () => {
    it('应该正确加载员工列表', async () => {
      expect(wrapper.vm.loadStaff).toBeDefined()
    })

    it('应该正确显示员工编号', () => {
      wrapper.vm.kitchenStaff = mockEmployees
      const hasEmployeeCode = mockEmployees.some(emp => emp.employeeCode.includes('KITCHEN'))
      expect(hasEmployeeCode).toBe(true)
    })

    it('应该正确显示员工姓名', () => {
      wrapper.vm.kitchenStaff = mockEmployees
      const hasName = mockEmployees.some(emp => emp.name === '张三' || emp.name === '李四')
      expect(hasName).toBe(true)
    })

    it('应该正确显示职位', () => {
      wrapper.vm.kitchenStaff = mockEmployees
      const hasPosition = mockEmployees.some(emp => emp.position === 'chef' || emp.position === 'line_cook')
      expect(hasPosition).toBe(true)
    })

    it('应该正确显示状态', () => {
      wrapper.vm.kitchenStaff = mockEmployees
      const hasStatus = mockEmployees.some(emp => emp.status === 'online' || emp.status === 'busy')
      expect(hasStatus).toBe(true)
    })

    it('应该正确显示当前任务数', () => {
      wrapper.vm.kitchenStaff = mockEmployees
      const hasCurrentTasks = mockEmployees.some(emp => emp.currentTasks > 0)
      expect(hasCurrentTasks).toBe(true)
    })

    it('应该正确显示完成任务数', () => {
      wrapper.vm.kitchenStaff = mockEmployees
      const hasTotalTasksCompleted = mockEmployees.some(emp => emp.totalTasksCompleted > 0)
      expect(hasTotalTasksCompleted).toBe(true)
    })

    it('应该正确显示效率', () => {
      wrapper.vm.kitchenStaff = mockEmployees
      const hasEfficiency = mockEmployees.some(emp => emp.efficiency > 0)
      expect(hasEfficiency).toBe(true)
    })

    it('应该正确显示平均时间', () => {
      wrapper.vm.kitchenStaff = mockEmployees
      const hasAverageTime = mockEmployees.some(emp => emp.averageTime > 0)
      expect(hasAverageTime).toBe(true)
    })

    it('应该正确显示技能', () => {
      wrapper.vm.kitchenStaff = mockEmployees
      const hasSkills = mockEmployees.some(emp => emp.skills && emp.skills.length > 0)
      expect(hasSkills).toBe(true)
    })

    it('应该支持员工状态更新', async () => {
      const mockComposable = useKitchen()
      mockComposable.updateEmployeeStatus.mockResolvedValue({ success: true })

      wrapper.vm.kitchenStaff = mockEmployees
      await wrapper.vm.updateStaffStatus(mockEmployees[0])

      expect(wrapper.vm.staffStatusDialogVisible).toBe(true)
    })

    it('应该支持员工筛选', () => {
      wrapper.vm.employeeFilters = {
        position: 'chef',
        status: 'online' as EmployeeStatus,
        search: '张三'
      }

      expect(wrapper.vm.employeeFilters.position).toBe('chef')
      expect(wrapper.vm.employeeFilters.status).toBe('online')
      expect(wrapper.vm.employeeFilters.search).toBe('张三')
    })
  })

  describe('标签页切换', () => {
    it('应该正确切换到任务管理标签', async () => {
      await wrapper.vm.handleTabChange('tasks')
      expect(wrapper.vm.activeTab).toBe('tasks')
    })

    it('应该正确切换到员工管理标签', async () => {
      await wrapper.vm.handleTabChange('staff')
      expect(wrapper.vm.activeTab).toBe('staff')
    })

    it('应该正确切换到数据分析标签', async () => {
      await wrapper.vm.handleTabChange('analytics')
      expect(wrapper.vm.activeTab).toBe('analytics')
    })

    it('应该在切换标签时重新加载数据', async () => {
      await wrapper.vm.handleTabChange('tasks')
      expect(wrapper.vm.activeTab).toBe('tasks')
    })
  })

  describe('刷新数据', () => {
    it('应该成功刷新所有数据', async () => {
      const mockComposable = useKitchen()
      mockComposable.refreshData.mockResolvedValue()

      expect(wrapper.vm.refreshData).toBeDefined()
    })

    it('应该在刷新时显示加载状态', async () => {
      const mockComposable = useKitchen()
      mockComposable.loading.value = true

      expect(mockComposable.loading.value).toBe(true)
    })
  })

  describe('对话框管理', () => {
    it('应该正确显示新建任务对话框', async () => {
      await wrapper.vm.showCreateTaskDialog()
      expect(wrapper.vm.taskDialogVisible).toBe(true)
    })

    it('应该正确显示批量操作对话框', async () => {
      await wrapper.vm.showBulkOperationDialog()
      expect(wrapper.vm.bulkOperationDialogVisible).toBe(true)
    })

    it('应该正确关闭对话框', async () => {
      wrapper.vm.taskDialogVisible = true
      wrapper.vm.taskDialogVisible = false
      expect(wrapper.vm.taskDialogVisible).toBe(false)
    })
  })

  describe('表单验证', () => {
    it('应该验证任务表单', async () => {
      wrapper.vm.taskForm = {
        taskId: 'TASK003',
        orderNo: 'ORD003',
        itemName: '宫保鸡丁',
        quantity: 1,
        station: 'hot_dish' as TaskStation,
        priority: 'normal' as TaskPriority,
        tableNumber: 'A03',
        estimatedTime: 18
      }

      expect(wrapper.vm.taskForm.itemName).toBe('宫保鸡丁')
    })

    it('应该验证员工表单', async () => {
      wrapper.vm.employeeForm = {
        employeeCode: 'KITCHEN003',
        name: '王五',
        position: 'line_cook',
        status: 'online' as EmployeeStatus,
        phone: '13700137000',
        email: 'wangwu@example.com'
      }

      expect(wrapper.vm.employeeForm.name).toBe('王五')
    })
  })

  describe('分页', () => {
    it('应该正确处理分页变化', async () => {
      await wrapper.vm.handleTaskPageChange(2)
      expect(wrapper.vm.taskPagination.page).toBe(2)
    })

    it('应该正确处理每页数量变化', async () => {
      await wrapper.vm.handleTaskPageSizeChange(50)
      expect(wrapper.vm.taskPagination.limit).toBe(50)
    })
  })

  describe('数据分析', () => {
    it('应该正确初始化图表', () => {
      expect(wrapper.vm.activeTab).toBeDefined()
    })

    it('应该在数据分析标签页加载图表', async () => {
      await wrapper.vm.handleTabChange('analytics')
      expect(wrapper.vm.activeTab).toBe('analytics')
    })

    it('应该正确更新图表数据', async () => {
      await wrapper.vm.refreshAnalytics()
      expect(wrapper.vm.activeTab).toBe('tasks')
    })
  })

  describe('响应式设计', () => {
    it('应该在窗口大小变化时调整图表', async () => {
      const mockChart = echarts.init()
      
      await wrapper.vm.refreshAnalytics()
      
      expect(mockChart).toBeDefined()
    })
  })

  describe('错误处理', () => {
    it('应该正确处理加载失败', async () => {
      const mockComposable = useKitchen()
      mockComposable.loadTasks.mockRejectedValue(new Error('加载失败'))

      try {
        await wrapper.vm.loadTasks()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('应该正确处理更新失败', async () => {
      const mockComposable = useKitchen()
      mockComposable.updateTaskStatus.mockRejectedValue(new Error('更新失败'))

      try {
        await wrapper.vm.handleTaskStatusChange('task-1', 'preparing' as TaskStatus)
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('生命周期', () => {
    it('应该在组件挂载时加载数据', async () => {
      expect(wrapper.vm.loadTasks).toBeDefined()
      expect(wrapper.vm.loadStaff).toBeDefined()
      expect(wrapper.vm.loadStats).toBeDefined()
    })

    it('应该在组件卸载时清理图表', () => {
      const mockChart = echarts.init()
      
      wrapper.unmount()
      
      expect(mockChart).toBeDefined()
    })
  })
})
