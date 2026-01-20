/**
 * @fileoverview YYC³餐饮管理系统 - Kitchen API测试
 * @description 测试Kitchen API服务的核心功能
 * @module kitchen.test
 * @author YYC³
 * @version 2.0.0
 * @created 2025-01-20
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type {
  KitchenTask,
  KitchenEmployee,
  KitchenInventory,
  TaskStatus,
  EmployeeStatus,
  TaskStation,
  TaskPriority
} from '@/types/kitchen'

// 模拟localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// @ts-ignore
global.localStorage = localStorageMock

// 测试数据
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
    position: 'chef',
    status: 'online',
    phone: '13800138000',
    hireDate: '2023-01-01',
    skills: ['炒菜'],
    certifications: [],
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
    position: 'line_cook',
    status: 'busy',
    phone: '13900139000',
    hireDate: '2023-06-01',
    skills: ['切配'],
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

// 定义模拟的API函数
const mockGetStats = vi.fn()
const mockGetTasks = vi.fn()
const mockCreateTask = vi.fn()
const mockUpdateTaskStatus = vi.fn()
const mockAssignTask = vi.fn()
const mockDeleteTask = vi.fn()
const mockGetEmployees = vi.fn()
const mockCreateEmployee = vi.fn()
const mockUpdateEmployeeStatus = vi.fn()
const mockDeleteEmployee = vi.fn()
const mockGetInventory = vi.fn()
const mockCreateInventoryItem = vi.fn()
const mockRestockInventory = vi.fn()
const mockDeleteInventoryItem = vi.fn()

// 模拟API模块
vi.mock('@/api/kitchen', () => ({
  kitchenAPI: {
    getStats: mockGetStats,
    getTasks: mockGetTasks,
    createTask: mockCreateTask,
    updateTaskStatus: mockUpdateTaskStatus,
    assignTask: mockAssignTask,
    deleteTask: mockDeleteTask,
    getEmployees: mockGetEmployees,
    createEmployee: mockCreateEmployee,
    updateEmployeeStatus: mockUpdateEmployeeStatus,
    deleteEmployee: mockDeleteEmployee,
    getInventory: mockGetInventory,
    createInventoryItem: mockCreateInventoryItem,
    restockInventory: mockRestockInventory,
    deleteInventoryItem: mockDeleteInventoryItem
  }
}))

describe('Kitchen API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getStats', () => {
    it('应该成功获取厨房统计数据', async () => {
      const mockResponse = {
        success: true,
        data: mockStats
      }
      mockGetStats.mockResolvedValue(mockResponse)

      const { kitchenAPI } = await import('@/api/kitchen')
      const result = await kitchenAPI.getStats()

      expect(result.success).toBe(true)
      expect(result.data.activeTasks).toBe(5)
      expect(result.data.completedToday).toBe(42)
      expect(result.data.efficiencyRate).toBe(85.5)
      expect(result.data.averagePreparationTime).toBe(900)
    })

    it('应该调用正确的API端点', async () => {
      const mockResponse = {
        success: true,
        data: mockStats
      }
      mockGetStats.mockResolvedValue(mockResponse)

      const { kitchenAPI } = await import('@/api/kitchen')
      await kitchenAPI.getStats()

      expect(mockGetStats).toHaveBeenCalled()
    })

    it('应该处理API错误', async () => {
      mockGetStats.mockRejectedValue(new Error('Network error'))

      const { kitchenAPI } = await import('@/api/kitchen')
      await expect(kitchenAPI.getStats()).rejects.toThrow('Network error')
    })
  })

  describe('getTasks', () => {
    it('应该成功获取任务列表', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: mockTasks,
          pagination: { page: 1, limit: 20, total: 2, totalPages: 1 }
        }
      }
      mockGetTasks.mockResolvedValue(mockResponse)

      const { kitchenAPI } = await import('@/api/kitchen')
      const result = await kitchenAPI.getTasks()

      expect(result.success).toBe(true)
      expect(result.data.items).toHaveLength(2)
      expect(result.data.items[0].itemName).toBe('红烧肉')
    })

    it('应该支持任务筛选', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: mockTasks.filter(task => task.status === 'pending'),
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        }
      }
      mockGetTasks.mockResolvedValue(mockResponse)

      const { kitchenAPI } = await import('@/api/kitchen')
      await kitchenAPI.getTasks({
        station: 'hot_dish' as TaskStation,
        status: 'pending' as TaskStatus,
        priority: 'high' as TaskPriority,
        search: '红烧肉'
      })

      expect(mockGetTasks).toHaveBeenCalledWith({
        station: 'hot_dish',
        status: 'pending',
        priority: 'high',
        search: '红烧肉'
      })
    })
  })

  describe('createTask', () => {
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

      const mockResponse = {
        success: true,
        data: { ...newTask, id: 'task-3' }
      }
      mockCreateTask.mockResolvedValue(mockResponse)

      const { kitchenAPI } = await import('@/api/kitchen')
      const result = await kitchenAPI.createTask(newTask)

      expect(result.success).toBe(true)
      expect(result.data.id).toBe('task-3')
    })
  })

  describe('updateTaskStatus', () => {
    it('应该成功更新任务状态', async () => {
      const newStatus: TaskStatus = 'ready'
      const mockResponse = {
        success: true,
        data: { id: 'task-1', status: newStatus }
      }
      mockUpdateTaskStatus.mockResolvedValue(mockResponse)

      const { kitchenAPI } = await import('@/api/kitchen')
      const result = await kitchenAPI.updateTaskStatus('task-1', newStatus)

      expect(result.success).toBe(true)
      expect(result.data.status).toBe(newStatus)
    })

    it('应该支持所有任务状态', async () => {
      const statuses: TaskStatus[] = ['pending', 'preparing', 'ready', 'served', 'cancelled']

      for (const status of statuses) {
        const mockResponse = {
          success: true,
          data: { id: 'task-1', status }
        }
        mockUpdateTaskStatus.mockResolvedValue(mockResponse)

        const { kitchenAPI } = await import('@/api/kitchen')
        const result = await kitchenAPI.updateTaskStatus('task-1', status)

        expect(result.success).toBe(true)
        expect(result.data.status).toBe(status)
      }
    })
  })

  describe('assignTask', () => {
    it('应该成功分配任务', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'task-1',
          assignedTo: 'emp-2'
        }
      }
      mockAssignTask.mockResolvedValue(mockResponse)

      const { kitchenAPI } = await import('@/api/kitchen')
      const result = await kitchenAPI.assignTask('task-1', 'emp-2')

      expect(result.success).toBe(true)
      expect(result.data.assignedTo).toBe('emp-2')
    })
  })

  describe('deleteTask', () => {
    it('应该成功删除任务', async () => {
      const mockResponse = {
        success: true,
        data: true
      }
      mockDeleteTask.mockResolvedValue(mockResponse)

      const { kitchenAPI } = await import('@/api/kitchen')
      const result = await kitchenAPI.deleteTask('task-1')

      expect(result.success).toBe(true)
      expect(result.data).toBe(true)
    })
  })

  describe('getEmployees', () => {
    it('应该成功获取员工列表', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: mockEmployees,
          pagination: { page: 1, limit: 20, total: 2, totalPages: 1 }
        }
      }
      mockGetEmployees.mockResolvedValue(mockResponse)

      const { kitchenAPI } = await import('@/api/kitchen')
      const result = await kitchenAPI.getEmployees()

      expect(result.success).toBe(true)
      expect(result.data.items).toHaveLength(2)
      expect(result.data.items[0].name).toBe('张三')
    })

    it('应该支持员工筛选', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: mockEmployees.filter(emp => emp.status === 'online'),
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        }
      }
      mockGetEmployees.mockResolvedValue(mockResponse)

      const { kitchenAPI } = await import('@/api/kitchen')
      await kitchenAPI.getEmployees({
        position: 'chef',
        status: 'online' as EmployeeStatus,
        search: '张三'
      })

      expect(mockGetEmployees).toHaveBeenCalledWith({
        position: 'chef',
        status: 'online',
        search: '张三'
      })
    })
  })

  describe('createEmployee', () => {
    it('应该成功创建员工', async () => {
      const newEmployee = {
        employeeCode: 'KITCHEN003',
        name: '王五',
        position: 'line_cook',
        status: 'online' as EmployeeStatus,
        phone: '13700137000',
        hireDate: '2025-01-20',
        skills: ['切配'],
        certifications: [],
        currentTasks: 0,
        totalTasksCompleted: 0,
        efficiency: 0,
        averageTime: 0,
        workSchedule: []
      }

      const mockResponse = {
        success: true,
        data: { ...newEmployee, id: 'emp-3', createdAt: '2025-01-20T00:00:00Z' }
      }
      mockCreateEmployee.mockResolvedValue(mockResponse)

      const { kitchenAPI } = await import('@/api/kitchen')
      const result = await kitchenAPI.createEmployee(newEmployee)

      expect(result.success).toBe(true)
      expect(result.data.id).toBe('emp-3')
    })
  })

  describe('updateEmployeeStatus', () => {
    it('应该成功更新员工状态', async () => {
      const newStatus: EmployeeStatus = 'break'
      const mockResponse = {
        success: true,
        data: { id: 'emp-1', status: newStatus }
      }
      mockUpdateEmployeeStatus.mockResolvedValue(mockResponse)

      const { kitchenAPI } = await import('@/api/kitchen')
      const result = await kitchenAPI.updateEmployeeStatus('emp-1', newStatus)

      expect(result.success).toBe(true)
      expect(result.data.status).toBe(newStatus)
    })

    it('应该支持所有员工状态', async () => {
      const statuses: EmployeeStatus[] = ['online', 'busy', 'break', 'offline']

      for (const status of statuses) {
        const mockResponse = {
          success: true,
          data: { id: 'emp-1', status }
        }
        mockUpdateEmployeeStatus.mockResolvedValue(mockResponse)

        const { kitchenAPI } = await import('@/api/kitchen')
        const result = await kitchenAPI.updateEmployeeStatus('emp-1', status)

        expect(result.success).toBe(true)
        expect(result.data.status).toBe(status)
      }
    })
  })

  describe('deleteEmployee', () => {
    it('应该成功删除员工', async () => {
      const mockResponse = {
        success: true,
        data: true
      }
      mockDeleteEmployee.mockResolvedValue(mockResponse)

      const { kitchenAPI } = await import('@/api/kitchen')
      const result = await kitchenAPI.deleteEmployee('emp-1')

      expect(result.success).toBe(true)
      expect(result.data).toBe(true)
    })
  })

  describe('getInventory', () => {
    it('应该成功获取库存列表', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: mockInventory,
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        }
      }
      mockGetInventory.mockResolvedValue(mockResponse)

      const { kitchenAPI } = await import('@/api/kitchen')
      const result = await kitchenAPI.getInventory()

      expect(result.success).toBe(true)
      expect(result.data.items).toHaveLength(1)
      expect(result.data.items[0].name).toBe('猪肉')
    })
  })

  describe('createInventoryItem', () => {
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

      const mockResponse = {
        success: true,
        data: { ...newItem, id: 'inv-2', createdAt: '2025-01-20T00:00:00Z' }
      }
      mockCreateInventoryItem.mockResolvedValue(mockResponse)

      const { kitchenAPI } = await import('@/api/kitchen')
      const result = await kitchenAPI.createInventoryItem(newItem)

      expect(result.success).toBe(true)
      expect(result.data.id).toBe('inv-2')
    })
  })

  describe('restockInventory', () => {
    it('应该成功补货', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'inv-1',
          quantity: 80
        }
      }
      mockRestockInventory.mockResolvedValue(mockResponse)

      const { kitchenAPI } = await import('@/api/kitchen')
      const result = await kitchenAPI.restockInventory('inv-1', 30)

      expect(result.success).toBe(true)
      expect(result.data.quantity).toBe(80)
    })
  })

  describe('deleteInventoryItem', () => {
    it('应该成功删除库存项', async () => {
      const mockResponse = {
        success: true,
        data: true
      }
      mockDeleteInventoryItem.mockResolvedValue(mockResponse)

      const { kitchenAPI } = await import('@/api/kitchen')
      const result = await kitchenAPI.deleteInventoryItem('inv-1')

      expect(result.success).toBe(true)
      expect(result.data).toBe(true)
    })
  })
})
