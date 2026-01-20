/**
 * @fileoverview YYC³餐饮管理系统 - KitchenManagement集成测试
 * @description 测试KitchenManagement组件与API、composable的集成
 * @module KitchenManagement.integration.test
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as echarts from 'echarts'
import KitchenManagement from '@/views/KitchenManagement.vue'
import { useKitchen } from '@/composables/useKitchen'
import { kitchenAPI } from '@/api/kitchen'
import type {
  KitchenTask,
  KitchenEmployee,
  KitchenInventory,
  TaskStatus,
  EmployeeStatus,
  TaskStation,
  TaskPriority
} from '@/types/kitchen'

vi.mock('@/api/kitchen', () => ({
  kitchenAPI: {
    getStats: vi.fn(),
    getAnalytics: vi.fn(),
    getEquipment: vi.fn(),
    createEquipment: vi.fn(),
    updateEquipment: vi.fn(),
    deleteEquipment: vi.fn(),
    getEmployees: vi.fn(),
    createEmployee: vi.fn(),
    updateEmployee: vi.fn(),
    deleteEmployee: vi.fn(),
    updateEmployeeStatus: vi.fn(),
    getTasks: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    updateTaskStatus: vi.fn(),
    assignTask: vi.fn(),
    getInventory: vi.fn(),
    createInventoryItem: vi.fn(),
    updateInventoryItem: vi.fn(),
    deleteInventoryItem: vi.fn(),
    restockInventory: vi.fn(),
    getHygieneRecords: vi.fn(),
    createHygieneRecord: vi.fn(),
    updateHygieneRecord: vi.fn(),
    getSafetyRecords: vi.fn(),
    createSafetyRecord: vi.fn(),
    updateSafetyRecord: vi.fn(),
    getDisplays: vi.fn(),
    createDisplay: vi.fn(),
    updateDisplay: vi.fn(),
    deleteDisplay: vi.fn()
  }
}))

vi.mock('echarts', () => ({
  default: {
    init: vi.fn(() => ({
      setOption: vi.fn(),
      resize: vi.fn(),
      dispose: vi.fn()
    }))
  }
}))

vi.mock('element-plus', () => ({
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

describe('KitchenManagement集成测试', () => {
  let wrapper: VueWrapper<any>
  let pinia: any

  const mockStats = {
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
  }

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

  const mockInventory: KitchenInventory[] = [
    {
      id: 'inv-1',
      itemCode: 'ING001',
      name: '猪肉',
      category: 'meat',
      unit: '公斤',
      quantity: 50,
      minQuantity: 10,
      maxQuantity: 100,
      unitPrice: 50,
      supplier: '供应商A',
      lastRestockDate: '2025-01-15',
      status: 'normal',
      location: '冷藏库A',
      createdAt: '2025-01-01T00:00:00Z'
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
    wrapper.unmount()
  })

  describe('组件与API集成', () => {
    it('应该成功加载统计数据', async () => {
      vi.mocked(kitchenAPI.getStats).mockResolvedValue({
        success: true,
        data: mockStats
      })

      const { loadStats } = useKitchen()
      await loadStats()

      expect(kitchenAPI.getStats).toHaveBeenCalled()
      expect(wrapper.vm.stats).toEqual(mockStats)
    })

    it('应该成功加载任务列表', async () => {
      vi.mocked(kitchenAPI.getTasks).mockResolvedValue({
        success: true,
        data: {
          items: mockTasks,
          pagination: { page: 1, limit: 20, total: 2, totalPages: 1 }
        }
      })

      const { loadTasks } = useKitchen()
      await loadTasks()

      expect(kitchenAPI.getTasks).toHaveBeenCalled()
      expect(wrapper.vm.tasks).toEqual(mockTasks)
    })

    it('应该成功加载员工列表', async () => {
      vi.mocked(kitchenAPI.getEmployees).mockResolvedValue({
        success: true,
        data: {
          items: mockEmployees,
          pagination: { page: 1, limit: 20, total: 2, totalPages: 1 }
        }
      })

      const { loadEmployees } = useKitchen()
      await loadEmployees()

      expect(kitchenAPI.getEmployees).toHaveBeenCalled()
      expect(wrapper.vm.employees).toEqual(mockEmployees)
    })

    it('应该成功加载库存列表', async () => {
      vi.mocked(kitchenAPI.getInventory).mockResolvedValue({
        success: true,
        data: {
          items: mockInventory,
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        }
      })

      const { loadInventory } = useKitchen()
      await loadInventory()

      expect(kitchenAPI.getInventory).toHaveBeenCalled()
      expect(wrapper.vm.inventory).toEqual(mockInventory)
    })
  })

  describe('任务管理集成', () => {
    it('应该成功创建任务', async () => {
      const newTask = {
        taskId: 'TASK003',
        orderNo: 'ORD003',
        itemName: '宫保鸡丁',
        quantity: 1,
        station: 'hot_dish' as TaskStation,
        priority: 'normal' as TaskPriority,
        status: 'pending' as TaskStatus,
        tableNumber: 'A03',
        estimatedTime: 18,
        createdAt: '2025-01-20T10:10:00Z'
      }

      vi.mocked(kitchenAPI.createTask).mockResolvedValue({
        success: true,
        data: { ...newTask, id: 'task-3' }
      })

      const { createTask } = useKitchen()
      await createTask(newTask)

      expect(kitchenAPI.createTask).toHaveBeenCalledWith(newTask)
    })

    it('应该成功更新任务状态', async () => {
      const newStatus: TaskStatus = 'ready'
      const updatedTask = {
        ...mockTasks[0],
        status: newStatus
      }

      vi.mocked(kitchenAPI.updateTaskStatus).mockResolvedValue({
        success: true,
        data: updatedTask
      })

      const { updateTaskStatus } = useKitchen()
      await updateTaskStatus('task-1', newStatus)

      expect(kitchenAPI.updateTaskStatus).toHaveBeenCalledWith('task-1', newStatus)
    })

    it('应该成功分配任务', async () => {
      const assignedTask = {
        ...mockTasks[0],
        assignedTo: 'emp-2'
      }

      vi.mocked(kitchenAPI.assignTask).mockResolvedValue({
        success: true,
        data: assignedTask
      })

      const { assignTask } = useKitchen()
      await assignTask('task-1', 'emp-2')

      expect(kitchenAPI.assignTask).toHaveBeenCalledWith('task-1', 'emp-2')
    })

    it('应该成功删除任务', async () => {
      vi.mocked(kitchenAPI.deleteTask).mockResolvedValue({
        success: true,
        data: true
      })

      const { deleteTask } = useKitchen()
      await deleteTask('task-1')

      expect(kitchenAPI.deleteTask).toHaveBeenCalledWith('task-1')
    })

    it('应该支持任务筛选', async () => {
      vi.mocked(kitchenAPI.getTasks).mockResolvedValue({
        success: true,
        data: {
          items: mockTasks.filter(task => task.status === 'pending'),
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        }
      })

      const { loadTasks } = useKitchen()
      await loadTasks({ status: 'pending' as TaskStatus })

      expect(kitchenAPI.getTasks).toHaveBeenCalledWith({ status: 'pending' })
    })
  })

  describe('员工管理集成', () => {
    it('应该成功创建员工', async () => {
      const newEmployee = {
        employeeCode: 'KITCHEN003',
        name: '王五',
        position: 'line_cook',
        status: 'online' as EmployeeStatus,
        phone: '13700137000',
        email: 'wangwu@example.com',
        hireDate: '2025-01-20',
        skills: ['切配'],
        certifications: [],
        currentTasks: 0,
        totalTasksCompleted: 0,
        efficiency: 0,
        averageTime: 0,
        workSchedule: []
      }

      vi.mocked(kitchenAPI.createEmployee).mockResolvedValue({
        success: true,
        data: { ...newEmployee, id: 'emp-3', createdAt: '2025-01-20T00:00:00Z' }
      })

      const { createEmployee } = useKitchen()
      await createEmployee(newEmployee)

      expect(kitchenAPI.createEmployee).toHaveBeenCalledWith(newEmployee)
    })

    it('应该成功更新员工状态', async () => {
      const newStatus: EmployeeStatus = 'break'
      const updatedEmployee = {
        ...mockEmployees[0],
        status: newStatus
      }

      vi.mocked(kitchenAPI.updateEmployeeStatus).mockResolvedValue({
        success: true,
        data: updatedEmployee
      })

      const { updateEmployeeStatus } = useKitchen()
      await updateEmployeeStatus('emp-1', newStatus)

      expect(kitchenAPI.updateEmployeeStatus).toHaveBeenCalledWith('emp-1', newStatus)
    })

    it('应该成功删除员工', async () => {
      vi.mocked(kitchenAPI.deleteEmployee).mockResolvedValue({
        success: true,
        data: true
      })

      const { deleteEmployee } = useKitchen()
      await deleteEmployee('emp-1')

      expect(kitchenAPI.deleteEmployee).toHaveBeenCalledWith('emp-1')
    })

    it('应该支持员工筛选', async () => {
      vi.mocked(kitchenAPI.getEmployees).mockResolvedValue({
        success: true,
        data: {
          items: mockEmployees.filter(emp => emp.status === 'online'),
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        }
      })

      const { loadEmployees } = useKitchen()
      await loadEmployees({ status: 'online' as EmployeeStatus })

      expect(kitchenAPI.getEmployees).toHaveBeenCalledWith({ status: 'online' })
    })
  })

  describe('库存管理集成', () => {
    it('应该成功创建库存项', async () => {
      const newItem = {
        itemCode: 'ING002',
        name: '鸡肉',
        category: 'meat',
        unit: '公斤',
        quantity: 30,
        minQuantity: 10,
        maxQuantity: 100,
        unitPrice: 30,
        supplier: '供应商B',
        lastRestockDate: '2025-01-20',
        status: 'normal',
        location: '冷藏库B'
      }

      vi.mocked(kitchenAPI.createInventoryItem).mockResolvedValue({
        success: true,
        data: { ...newItem, id: 'inv-2', createdAt: '2025-01-20T00:00:00Z' }
      })

      const { createInventoryItem } = useKitchen()
      await createInventoryItem(newItem)

      expect(kitchenAPI.createInventoryItem).toHaveBeenCalledWith(newItem)
    })

    it('应该成功更新库存项', async () => {
      const updatedItem = {
        ...mockInventory[0],
        quantity: 60
      }

      vi.mocked(kitchenAPI.updateInventoryItem).mockResolvedValue({
        success: true,
        data: updatedItem
      })

      const { updateInventoryItem } = useKitchen()
      await updateInventoryItem('inv-1', updatedItem)

      expect(kitchenAPI.updateInventoryItem).toHaveBeenCalledWith('inv-1', updatedItem)
    })

    it('应该成功删除库存项', async () => {
      vi.mocked(kitchenAPI.deleteInventoryItem).mockResolvedValue({
        success: true,
        data: true
      })

      const { deleteInventoryItem } = useKitchen()
      await deleteInventoryItem('inv-1')

      expect(kitchenAPI.deleteInventoryItem).toHaveBeenCalledWith('inv-1')
    })

    it('应该成功补货', async () => {
      const restockedItem = {
        ...mockInventory[0],
        quantity: 80
      }

      vi.mocked(kitchenAPI.restockInventory).mockResolvedValue({
        success: true,
        data: restockedItem
      })

      const { restockInventory } = useKitchen()
      await restockInventory('inv-1', 30)

      expect(kitchenAPI.restockInventory).toHaveBeenCalledWith('inv-1', 30)
    })

    it('应该支持库存筛选', async () => {
      vi.mocked(kitchenAPI.getInventory).mockResolvedValue({
        success: true,
        data: {
          items: mockInventory.filter(item => item.category === 'meat'),
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        }
      })

      const { loadInventory } = useKitchen()
      await loadInventory({ category: 'meat' })

      expect(kitchenAPI.getInventory).toHaveBeenCalledWith({ category: 'meat' })
    })
  })

  describe('数据分析集成', () => {
    it('应该成功加载分析数据', async () => {
      const mockAnalytics = {
        taskDistribution: [
          { status: 'pending', count: 5, percentage: 25 },
          { status: 'preparing', count: 3, percentage: 15 }
        ],
        stationDistribution: [
          { station: 'hot_dish', count: 10, percentage: 50 }
        ],
        staffEfficiency: [
          { employeeId: 'emp-1', employeeName: '张三', tasksCompleted: 50, averageTime: 12, efficiency: 92.5 }
        ],
        peakHours: [
          { hour: 12, taskCount: 20, orderCount: 15 }
        ],
        equipmentUtilization: [
          { equipmentId: 'eq-1', equipmentName: '蒸柜', usageHours: 8, utilizationRate: 80 }
        ],
        inventoryTrends: [
          { date: '2025-01-20', itemCount: 100, value: 50000 }
        ]
      }

      vi.mocked(kitchenAPI.getAnalytics).mockResolvedValue({
        success: true,
        data: mockAnalytics
      })

      const { loadAnalytics } = useKitchen()
      await loadAnalytics({ startDate: '2025-01-01', endDate: '2025-01-20' })

      expect(kitchenAPI.getAnalytics).toHaveBeenCalledWith({
        startDate: '2025-01-01',
        endDate: '2025-01-20'
      })
    })
  })

  describe('数据刷新集成', () => {
    it('应该成功刷新所有数据', async () => {
      vi.mocked(kitchenAPI.getStats).mockResolvedValue({
        success: true,
        data: mockStats
      })
      vi.mocked(kitchenAPI.getTasks).mockResolvedValue({
        success: true,
        data: {
          items: mockTasks,
          pagination: { page: 1, limit: 20, total: 2, totalPages: 1 }
        }
      })
      vi.mocked(kitchenAPI.getEmployees).mockResolvedValue({
        success: true,
        data: {
          items: mockEmployees,
          pagination: { page: 1, limit: 20, total: 2, totalPages: 1 }
        }
      })

      const { refreshData } = useKitchen()
      await refreshData()

      expect(kitchenAPI.getStats).toHaveBeenCalled()
      expect(kitchenAPI.getTasks).toHaveBeenCalled()
      expect(kitchenAPI.getEmployees).toHaveBeenCalled()
    })
  })

  describe('错误处理集成', () => {
    it('应该正确处理API错误', async () => {
      vi.mocked(kitchenAPI.getTasks).mockRejectedValue(new Error('网络错误'))

      const { loadTasks } = useKitchen()
      await loadTasks()

      expect(kitchenAPI.getTasks).toHaveBeenCalled()
    })

    it('应该在加载失败时显示错误消息', async () => {
      vi.mocked(kitchenAPI.getTasks).mockRejectedValue(new Error('加载失败'))

      const { loadTasks } = useKitchen()
      await loadTasks()

      expect(wrapper.vm.loading).toBe(false)
    })
  })

  describe('状态管理集成', () => {
    it('应该正确管理加载状态', async () => {
      const { loading } = useKitchen()
      expect(loading.value).toBe(false)
    })

    it('应该在加载时更新状态', async () => {
      vi.mocked(kitchenAPI.getTasks).mockImplementation(() => {
        const { loading } = useKitchen()
        loading.value = true
        return Promise.resolve({
          success: true,
          data: {
            items: mockTasks,
            pagination: { page: 1, limit: 20, total: 2, totalPages: 1 }
          }
        })
      })

      const { loadTasks, loading } = useKitchen()
      await loadTasks()

      expect(loading.value).toBe(false)
    })
  })

  describe('分页集成', () => {
    it('应该正确处理分页', async () => {
      vi.mocked(kitchenAPI.getTasks).mockResolvedValue({
        success: true,
        data: {
          items: mockTasks,
          pagination: { page: 2, limit: 20, total: 2, totalPages: 1 }
        }
      })

      const { loadTasks } = useKitchen()
      await loadTasks({ page: 2, limit: 20 })

      expect(kitchenAPI.getTasks).toHaveBeenCalledWith({ page: 2, limit: 20 })
    })
  })

  describe('图表集成', () => {
    it('应该正确初始化图表', async () => {
      await wrapper.vm.handleTabChange('analytics')

      expect(echarts.init).toHaveBeenCalled()
    })

    it('应该在数据更新时刷新图表', async () => {
      vi.mocked(kitchenAPI.getAnalytics).mockResolvedValue({
        success: true,
        data: {
          taskDistribution: [],
          stationDistribution: [],
          staffEfficiency: [],
          peakHours: [],
          equipmentUtilization: [],
          inventoryTrends: []
        }
      })

      await wrapper.vm.handleTabChange('analytics')

      expect(echarts.init).toHaveBeenCalled()
    })
  })

  describe('业务流程集成', () => {
    it('应该完整执行任务创建流程', async () => {
      const newTask = {
        taskId: 'TASK003',
        orderNo: 'ORD003',
        itemName: '宫保鸡丁',
        quantity: 1,
        station: 'hot_dish' as TaskStation,
        priority: 'normal' as TaskPriority,
        status: 'pending' as TaskStatus,
        tableNumber: 'A03',
        estimatedTime: 18,
        createdAt: '2025-01-20T10:10:00Z'
      }

      vi.mocked(kitchenAPI.createTask).mockResolvedValue({
        success: true,
        data: { ...newTask, id: 'task-3' }
      })

      const { createTask, loadTasks } = useKitchen()
      await createTask(newTask)
      await loadTasks()

      expect(kitchenAPI.createTask).toHaveBeenCalledWith(newTask)
      expect(kitchenAPI.getTasks).toHaveBeenCalled()
    })

    it('应该完整执行任务分配流程', async () => {
      vi.mocked(kitchenAPI.assignTask).mockResolvedValue({
        success: true,
        data: { ...mockTasks[0], assignedTo: 'emp-2' }
      })

      const { assignTask, updateEmployeeStatus } = useKitchen()
      await assignTask('task-1', 'emp-2')
      await updateEmployeeStatus('emp-2', 'busy' as EmployeeStatus)

      expect(kitchenAPI.assignTask).toHaveBeenCalledWith('task-1', 'emp-2')
      expect(kitchenAPI.updateEmployeeStatus).toHaveBeenCalledWith('emp-2', 'busy')
    })

    it('应该完整执行任务状态更新流程', async () => {
      const statuses: TaskStatus[] = ['pending', 'preparing', 'ready', 'served']

      for (const status of statuses) {
        vi.mocked(kitchenAPI.updateTaskStatus).mockResolvedValue({
          success: true,
          data: { ...mockTasks[0], status }
        })

        const { updateTaskStatus } = useKitchen()
        await updateTaskStatus('task-1', status)

        expect(kitchenAPI.updateTaskStatus).toHaveBeenCalledWith('task-1', status)
      }
    })
  })
})
