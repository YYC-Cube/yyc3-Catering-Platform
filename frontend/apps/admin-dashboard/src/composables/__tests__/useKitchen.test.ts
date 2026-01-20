/**
 * @fileoverview YYC³餐饮管理系统 - useKitchen Composable测试
 * @description 测试useKitchen composable的功能
 * @module useKitchen.test
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { ref } from 'vue'
import { useKitchen } from '@/composables/useKitchen'
import { kitchenAPI } from '@/api/kitchen'
import type {
  KitchenEquipment,
  KitchenEmployee,
  KitchenTask,
  KitchenInventory,
  HygieneRecord,
  SafetyRecord,
  TaskStatus,
  EmployeeStatus
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

vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}))

describe('useKitchen Composable', () => {
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

  const mockEquipment: KitchenEquipment[] = [
    {
      id: 'eq-1',
      equipmentCode: 'EQ001',
      name: '商用蒸柜',
      type: 'cooking',
      brand: '美的',
      model: 'MZ-2000',
      status: 'normal',
      location: '后厨A区',
      purchaseDate: '2023-01-01',
      warrantyDate: '2025-01-01',
      lastMaintenanceDate: '2024-12-01',
      nextMaintenanceDate: '2025-01-01',
      maintenanceInterval: 30,
      power: 5000,
      specifications: { capacity: '200L', temperature: '100°C' },
      images: [],
      responsiblePersonId: 'emp-1',
      createdAt: '2023-01-01T00:00:00Z'
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
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('状态管理', () => {
    it('应该初始化正确的状态', () => {
      const { loading, stats, equipment, employees, tasks, inventory } = useKitchen()

      expect(loading.value).toBe(false)
      expect(stats.value).toBeDefined()
      expect(equipment.value).toEqual([])
      expect(employees.value).toEqual([])
      expect(tasks.value).toEqual([])
      expect(inventory.value).toEqual([])
    })

    it('应该正确计算设备利用率', () => {
      const { equipmentUtilization } = useKitchen()
      expect(equipmentUtilization.value).toBe(0)
    })

    it('应该正确计算员工在线率', () => {
      const { employeeOnlineRate } = useKitchen()
      expect(employeeOnlineRate.value).toBe(0)
    })
  })

  describe('统计数据加载', () => {
    it('应该成功加载统计数据', async () => {
      const mockResponse = {
        success: true,
        data: mockStats
      }
      vi.mocked(kitchenAPI.getStats).mockResolvedValue(mockResponse)

      const { loadStats, stats } = useKitchen()
      await loadStats()

      expect(kitchenAPI.getStats).toHaveBeenCalled()
      expect(stats.value).toEqual(mockStats)
    })

    it('应该处理加载统计数据失败', async () => {
      vi.mocked(kitchenAPI.getStats).mockRejectedValue(new Error('加载失败'))

      const { loadStats } = useKitchen()
      await expect(loadStats()).resolves.toBeUndefined()
    })
  })

  describe('设备管理', () => {
    it('应该成功加载设备列表', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: mockEquipment,
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        }
      }
      vi.mocked(kitchenAPI.getEquipment).mockResolvedValue(mockResponse)

      const { loadEquipment, equipment } = useKitchen()
      await loadEquipment()

      expect(kitchenAPI.getEquipment).toHaveBeenCalled()
      expect(equipment.value).toEqual(mockEquipment)
    })

    it('应该成功创建设备', async () => {
      const newEquipment = {
        equipmentCode: 'EQ002',
        name: '商用烤箱',
        type: 'cooking' as const,
        brand: '西门子',
        model: 'SI-3000',
        status: 'normal' as const,
        location: '后厨B区',
        purchaseDate: '2025-01-20',
        warrantyDate: '2027-01-20',
        lastMaintenanceDate: '2025-01-20',
        nextMaintenanceDate: '2025-02-20',
        maintenanceInterval: 30,
        power: 3000,
        specifications: { capacity: '100L', temperature: '250°C' },
        images: [],
        responsiblePersonId: 'emp-1'
      }

      const createdEquipment = { ...newEquipment, id: 'eq-2', createdAt: '2025-01-20T00:00:00Z' }
      const updatedEquipmentList = [...mockEquipment, createdEquipment]

      const createResponse = {
        success: true,
        data: createdEquipment
      }
      const getResponse = {
        success: true,
        data: {
          items: updatedEquipmentList,
          pagination: { page: 1, limit: 20, total: 2, totalPages: 1 }
        }
      }
      vi.mocked(kitchenAPI.createEquipment).mockResolvedValue(createResponse)
      vi.mocked(kitchenAPI.getEquipment).mockResolvedValue(getResponse)

      const { createEquipment, equipment } = useKitchen()
      await createEquipment(newEquipment)

      expect(kitchenAPI.createEquipment).toHaveBeenCalledWith(newEquipment)
      expect(equipment.value.length).toBeGreaterThan(0)
    })

    it('应该成功更新设备', async () => {
      const updatedEquipment = {
        ...mockEquipment[0],
        name: '商用蒸柜（更新）'
      }

      const mockResponse = {
        success: true,
        data: updatedEquipment
      }
      vi.mocked(kitchenAPI.updateEquipment).mockResolvedValue(mockResponse)

      const { updateEquipment } = useKitchen()
      await updateEquipment('eq-1', updatedEquipment)

      expect(kitchenAPI.updateEquipment).toHaveBeenCalledWith('eq-1', updatedEquipment)
    })

    it('应该成功删除设备', async () => {
      const mockResponse = {
        success: true,
        data: true
      }
      vi.mocked(kitchenAPI.deleteEquipment).mockResolvedValue(mockResponse)

      const { deleteEquipment } = useKitchen()
      await deleteEquipment('eq-1')

      expect(kitchenAPI.deleteEquipment).toHaveBeenCalledWith('eq-1')
    })
  })

  describe('员工管理', () => {
    it('应该成功加载员工列表', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: mockEmployees,
          pagination: { page: 1, limit: 20, total: 2, totalPages: 1 }
        }
      }
      vi.mocked(kitchenAPI.getEmployees).mockResolvedValue(mockResponse)

      const { loadEmployees, employees } = useKitchen()
      await loadEmployees()

      expect(kitchenAPI.getEmployees).toHaveBeenCalled()
      expect(employees.value).toEqual(mockEmployees)
    })

    it('应该成功创建员工', async () => {
      const newEmployee = {
        employeeCode: 'KITCHEN003',
        name: '王五',
        position: 'line_cook' as const,
        status: 'online' as const,
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

      const mockResponse = {
        success: true,
        data: { ...newEmployee, id: 'emp-3', createdAt: '2025-01-20T00:00:00Z' }
      }
      vi.mocked(kitchenAPI.createEmployee).mockResolvedValue(mockResponse)

      const { createEmployee } = useKitchen()
      await createEmployee(newEmployee)

      expect(kitchenAPI.createEmployee).toHaveBeenCalledWith(newEmployee)
    })

    it('应该成功更新员工', async () => {
      const updatedEmployee = {
        ...mockEmployees[0],
        name: '张三（更新）'
      }

      const mockResponse = {
        success: true,
        data: updatedEmployee
      }
      vi.mocked(kitchenAPI.updateEmployee).mockResolvedValue(mockResponse)

      const { updateEmployee } = useKitchen()
      await updateEmployee('emp-1', updatedEmployee)

      expect(kitchenAPI.updateEmployee).toHaveBeenCalledWith('emp-1', updatedEmployee)
    })

    it('应该成功删除员工', async () => {
      const mockResponse = {
        success: true,
        data: true
      }
      vi.mocked(kitchenAPI.deleteEmployee).mockResolvedValue(mockResponse)

      const { deleteEmployee } = useKitchen()
      await deleteEmployee('emp-1')

      expect(kitchenAPI.deleteEmployee).toHaveBeenCalledWith('emp-1')
    })

    it('应该成功更新员工状态', async () => {
      const newStatus: EmployeeStatus = 'break'
      const updatedEmployee = {
        ...mockEmployees[0],
        status: newStatus
      }

      const mockResponse = {
        success: true,
        data: updatedEmployee
      }
      vi.mocked(kitchenAPI.updateEmployeeStatus).mockResolvedValue(mockResponse)

      const { updateEmployeeStatus } = useKitchen()
      await updateEmployeeStatus('emp-1', newStatus)

      expect(kitchenAPI.updateEmployeeStatus).toHaveBeenCalledWith('emp-1', newStatus)
    })
  })

  describe('任务管理', () => {
    it('应该成功加载任务列表', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: mockTasks,
          pagination: { page: 1, limit: 20, total: 2, totalPages: 1 }
        }
      }
      vi.mocked(kitchenAPI.getTasks).mockResolvedValue(mockResponse)

      const { loadTasks, tasks } = useKitchen()
      await loadTasks()

      expect(kitchenAPI.getTasks).toHaveBeenCalled()
      expect(tasks.value).toEqual(mockTasks)
    })

    it('应该成功创建任务', async () => {
      const newTask = {
        taskId: 'TASK003',
        orderNo: 'ORD003',
        itemName: '宫保鸡丁',
        quantity: 1,
        station: 'hot_dish' as const,
        priority: 'normal' as const,
        status: 'pending' as const,
        tableNumber: 'A03',
        estimatedTime: 18,
        createdAt: '2025-01-20T10:10:00Z'
      }

      const mockResponse = {
        success: true,
        data: { ...newTask, id: 'task-3' }
      }
      vi.mocked(kitchenAPI.createTask).mockResolvedValue(mockResponse)

      const { createTask } = useKitchen()
      await createTask(newTask)

      expect(kitchenAPI.createTask).toHaveBeenCalledWith(newTask)
    })

    it('应该成功更新任务', async () => {
      const updatedTask = {
        ...mockTasks[0],
        status: 'preparing' as TaskStatus
      }

      const mockResponse = {
        success: true,
        data: updatedTask
      }
      vi.mocked(kitchenAPI.updateTask).mockResolvedValue(mockResponse)

      const { updateTask } = useKitchen()
      await updateTask('task-1', updatedTask)

      expect(kitchenAPI.updateTask).toHaveBeenCalledWith('task-1', updatedTask)
    })

    it('应该成功删除任务', async () => {
      const mockResponse = {
        success: true,
        data: true
      }
      vi.mocked(kitchenAPI.deleteTask).mockResolvedValue(mockResponse)

      const { deleteTask } = useKitchen()
      await deleteTask('task-1')

      expect(kitchenAPI.deleteTask).toHaveBeenCalledWith('task-1')
    })

    it('应该成功更新任务状态', async () => {
      const newStatus: TaskStatus = 'ready'
      const updatedTask = {
        ...mockTasks[0],
        status: newStatus
      }

      const mockResponse = {
        success: true,
        data: updatedTask
      }
      vi.mocked(kitchenAPI.updateTaskStatus).mockResolvedValue(mockResponse)

      const { updateTaskStatus } = useKitchen()
      await updateTaskStatus('task-1', newStatus)

      expect(kitchenAPI.updateTaskStatus).toHaveBeenCalledWith('task-1', newStatus)
    })

    it('应该成功分配任务', async () => {
      const assignedTask = {
        ...mockTasks[0],
        assignedTo: 'emp-2'
      }

      const mockResponse = {
        success: true,
        data: assignedTask
      }
      vi.mocked(kitchenAPI.assignTask).mockResolvedValue(mockResponse)

      const { assignTask } = useKitchen()
      await assignTask('task-1', 'emp-2')

      expect(kitchenAPI.assignTask).toHaveBeenCalledWith('task-1', 'emp-2')
    })
  })

  describe('库存管理', () => {
    it('应该成功加载库存列表', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: mockInventory,
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        }
      }
      vi.mocked(kitchenAPI.getInventory).mockResolvedValue(mockResponse)

      const { loadInventory, inventory } = useKitchen()
      await loadInventory()

      expect(kitchenAPI.getInventory).toHaveBeenCalled()
      expect(inventory.value).toEqual(mockInventory)
    })

    it('应该成功创建库存项', async () => {
      const newItem = {
        itemCode: 'ING002',
        name: '鸡肉',
        category: 'meat' as const,
        unit: '公斤',
        quantity: 30,
        minQuantity: 10,
        maxQuantity: 100,
        unitPrice: 30,
        supplier: '供应商B',
        lastRestockDate: '2025-01-20',
        status: 'normal' as const,
        location: '冷藏库B'
      }

      const mockResponse = {
        success: true,
        data: { ...newItem, id: 'inv-2', createdAt: '2025-01-20T00:00:00Z' }
      }
      vi.mocked(kitchenAPI.createInventoryItem).mockResolvedValue(mockResponse)

      const { createInventoryItem } = useKitchen()
      await createInventoryItem(newItem)

      expect(kitchenAPI.createInventoryItem).toHaveBeenCalledWith(newItem)
    })

    it('应该成功更新库存项', async () => {
      const updatedItem = {
        ...mockInventory[0],
        quantity: 60
      }

      const mockResponse = {
        success: true,
        data: updatedItem
      }
      vi.mocked(kitchenAPI.updateInventoryItem).mockResolvedValue(mockResponse)

      const { updateInventoryItem } = useKitchen()
      await updateInventoryItem('inv-1', updatedItem)

      expect(kitchenAPI.updateInventoryItem).toHaveBeenCalledWith('inv-1', updatedItem)
    })

    it('应该成功删除库存项', async () => {
      const mockResponse = {
        success: true,
        data: true
      }
      vi.mocked(kitchenAPI.deleteInventoryItem).mockResolvedValue(mockResponse)

      const { deleteInventoryItem } = useKitchen()
      await deleteInventoryItem('inv-1')

      expect(kitchenAPI.deleteInventoryItem).toHaveBeenCalledWith('inv-1')
    })

    it('应该成功补货', async () => {
      const restockedItem = {
        ...mockInventory[0],
        quantity: 80
      }

      const mockResponse = {
        success: true,
        data: restockedItem
      }
      vi.mocked(kitchenAPI.restockInventory).mockResolvedValue(mockResponse)

      const { restockInventory } = useKitchen()
      await restockInventory('inv-1', 30)

      expect(kitchenAPI.restockInventory).toHaveBeenCalledWith('inv-1', 30)
    })
  })

  describe('卫生记录管理', () => {
    it('应该成功加载卫生记录', async () => {
      const mockRecords: HygieneRecord[] = [
        {
          id: 'hyg-1',
          recordCode: 'HYG001',
          type: 'daily',
          area: '后厨A区',
          inspectorId: 'emp-1',
          inspectorName: '张三',
          checkDate: '2025-01-20',
          checkTime: '08:00',
          items: [
            {
              id: 'item-1',
              item: '地面清洁',
              standard: '无油污、无积水',
              result: 'pass'
            }
          ],
          result: 'pass',
          score: 100,
          issues: [],
          photos: [],
          createdAt: '2025-01-20T08:00:00Z'
        }
      ]

      const mockResponse = {
        success: true,
        data: {
          items: mockRecords,
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        }
      }
      vi.mocked(kitchenAPI.getHygieneRecords).mockResolvedValue(mockResponse)

      const { loadHygieneRecords, hygieneRecords } = useKitchen()
      await loadHygieneRecords()

      expect(kitchenAPI.getHygieneRecords).toHaveBeenCalled()
      expect(hygieneRecords.value).toEqual(mockRecords)
    })

    it('应该成功创建卫生记录', async () => {
      const newRecord = {
        recordCode: 'HYG002',
        type: 'daily' as const,
        area: '后厨B区',
        inspectorId: 'emp-2',
        inspectorName: '李四',
        checkDate: '2025-01-20',
        checkTime: '09:00',
        items: [
          {
            id: 'item-2',
            item: '设备清洁',
            standard: '无油污、无残留',
            result: 'pass'
          }
        ],
        result: 'pass' as const,
        score: 100,
        issues: [],
        photos: []
      }

      const mockResponse = {
        success: true,
        data: { ...newRecord, id: 'hyg-2', createdAt: '2025-01-20T09:00:00Z' }
      }
      vi.mocked(kitchenAPI.createHygieneRecord).mockResolvedValue(mockResponse)

      const { createHygieneRecord } = useKitchen()
      await createHygieneRecord(newRecord)

      expect(kitchenAPI.createHygieneRecord).toHaveBeenCalledWith(newRecord)
    })
  })

  describe('安全记录管理', () => {
    it('应该成功加载安全记录', async () => {
      const mockRecords: SafetyRecord[] = [
        {
          id: 'safe-1',
          recordCode: 'SAFE001',
          type: 'injury',
          location: '后厨A区',
          reporterId: 'emp-1',
          reporterName: '张三',
          incidentDate: '2025-01-20',
          incidentTime: '10:00',
          description: '轻微烫伤',
          severity: 'minor',
          status: 'resolved',
          photos: [],
          witnesses: [],
          actions: [],
          createdAt: '2025-01-20T10:00:00Z'
        }
      ]

      const mockResponse = {
        success: true,
        data: {
          items: mockRecords,
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        }
      }
      vi.mocked(kitchenAPI.getSafetyRecords).mockResolvedValue(mockResponse)

      const { loadSafetyRecords, safetyRecords } = useKitchen()
      await loadSafetyRecords()

      expect(kitchenAPI.getSafetyRecords).toHaveBeenCalled()
      expect(safetyRecords.value).toEqual(mockRecords)
    })

    it('应该成功创建安全记录', async () => {
      const newRecord = {
        recordCode: 'SAFE002',
        type: 'equipment' as const,
        location: '后厨B区',
        reporterId: 'emp-2',
        reporterName: '李四',
        incidentDate: '2025-01-20',
        incidentTime: '11:00',
        description: '设备故障',
        severity: 'moderate' as const,
        status: 'reported' as const,
        photos: [],
        witnesses: [],
        actions: []
      }

      const mockResponse = {
        success: true,
        data: { ...newRecord, id: 'safe-2', createdAt: '2025-01-20T11:00:00Z' }
      }
      vi.mocked(kitchenAPI.createSafetyRecord).mockResolvedValue(mockResponse)

      const { createSafetyRecord } = useKitchen()
      await createSafetyRecord(newRecord)

      expect(kitchenAPI.createSafetyRecord).toHaveBeenCalledWith(newRecord)
    })
  })

  describe('数据刷新', () => {
    it('应该成功刷新所有数据', async () => {
      const mockStatsResponse = {
        success: true,
        data: mockStats
      }
      const mockTasksResponse = {
        success: true,
        data: {
          items: mockTasks,
          pagination: { page: 1, limit: 20, total: 2, totalPages: 1 }
        }
      }
      const mockEmployeesResponse = {
        success: true,
        data: {
          items: mockEmployees,
          pagination: { page: 1, limit: 20, total: 2, totalPages: 1 }
        }
      }

      vi.mocked(kitchenAPI.getStats).mockResolvedValue(mockStatsResponse)
      vi.mocked(kitchenAPI.getTasks).mockResolvedValue(mockTasksResponse)
      vi.mocked(kitchenAPI.getEmployees).mockResolvedValue(mockEmployeesResponse)

      const { refreshData } = useKitchen()
      await refreshData()

      expect(kitchenAPI.getStats).toHaveBeenCalled()
      expect(kitchenAPI.getTasks).toHaveBeenCalled()
      expect(kitchenAPI.getEmployees).toHaveBeenCalled()
    })
  })

  describe('自动刷新', () => {
    it('应该启动自动刷新', () => {
      const { startAutoRefresh, stopAutoRefresh } = useKitchen()

      startAutoRefresh(5000)

      vi.advanceTimersByTime(5000)

      stopAutoRefresh()
    })

    it('应该停止自动刷新', () => {
      const { startAutoRefresh, stopAutoRefresh } = useKitchen()

      startAutoRefresh(5000)
      stopAutoRefresh()

      vi.advanceTimersByTime(10000)
    })
  })
})
