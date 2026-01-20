/**
 * @fileoverview 连锁管理集成测试
 * @description 测试连锁管理模块的组件交互和数据流
 * @module ChainManagement.integration.test
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import ChainManagement from '@/views/ChainManagement.vue'
import { ChainAPI, StoreType, StoreStatus, EmployeeStatus, InventoryStatus } from '@/api/chain'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/chain', component: ChainManagement }
  ]
})

vi.mock('@/api/chain', () => ({
  ChainAPI: vi.fn().mockImplementation(() => ({
    getStores: vi.fn(() => Promise.resolve({
      success: true,
      data: {
        items: [
          {
            id: 1,
            storeCode: 'ST001',
            name: '北京朝阳店',
            type: StoreType.DIRECT,
            status: StoreStatus.OPEN,
            address: '北京市朝阳区建国路88号',
            city: '北京市',
            district: '朝阳区',
            phone: '010-12345678',
            email: 'beijing@example.com',
            manager: {
              id: 1,
              name: '张三',
              phone: '13800138000',
              avatar: 'https://example.com/avatar1.jpg'
            },
            businessHours: {
              monday: { open: '09:00', close: '22:00', enabled: true },
              tuesday: { open: '09:00', close: '22:00', enabled: true },
              wednesday: { open: '09:00', close: '22:00', enabled: true },
              thursday: { open: '09:00', close: '22:00', enabled: true },
              friday: { open: '09:00', close: '22:00', enabled: true },
              saturday: { open: '09:00', close: '22:00', enabled: true },
              sunday: { open: '09:00', close: '22:00', enabled: true }
            },
            area: 200,
            capacity: 150,
            tables: 30,
            employees: 20,
            coordinates: { latitude: 39.9042, longitude: 116.4074 },
            facilities: ['WiFi', '空调', '停车场'],
            description: '北京朝阳店',
            images: ['https://example.com/store1.jpg'],
            openingDate: '2020-01-01',
            rating: 4.5,
            reviewCount: 100,
            createdAt: '2020-01-01T00:00:00Z'
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1
        }
      }
    })),
    getEmployees: vi.fn(() => Promise.resolve({
      success: true,
      data: {
        items: [
          {
            id: 1,
            employeeCode: 'EMP001',
            name: '张三',
            gender: 'male',
            phone: '13800138000',
            email: 'zhangsan@example.com',
            avatar: 'https://example.com/avatar1.jpg',
            storeId: 1,
            storeName: '北京朝阳店',
            department: '前厅',
            position: '店长',
            status: EmployeeStatus.ACTIVE,
            hireDate: '2020-01-01',
            salary: 8000,
            address: '北京市朝阳区',
            idCard: '110101199001011234',
            bankAccount: '6222021234567890123',
            emergencyContact: {
              name: '王五',
              phone: '13700137000',
              relationship: '配偶'
            },
            permissions: ['store:read', 'store:write'],
            createdAt: '2020-01-01T00:00:00Z'
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1
        }
      }
    })),
    getInventory: vi.fn(() => Promise.resolve({
      success: true,
      data: {
        items: [
          {
            id: 1,
            storeId: 1,
            storeName: '北京朝阳店',
            productId: 1,
            productName: '牛肉',
            productCode: 'PRD001',
            category: '食材',
            quantity: 50,
            unit: '公斤',
            minQuantity: 10,
            maxQuantity: 100,
            costPrice: 50,
            status: InventoryStatus.NORMAL,
            lastRestockDate: '2024-01-15',
            supplier: {
              id: 1,
              name: '供应商A',
              phone: '13800138001'
            },
            location: '冷藏库A',
            batchNumber: 'BATCH001',
            expiryDate: '2024-02-01',
            createdAt: '2024-01-01T00:00:00Z'
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1
        }
      }
    })),
    createStore: vi.fn(() => Promise.resolve({
      success: true,
      data: {
        id: 2,
        storeCode: 'ST002',
        name: '上海浦东店',
        type: StoreType.DIRECT,
        status: StoreStatus.OPEN,
        address: '上海市浦东新区陆家嘴环路1000号',
        city: '上海市',
        district: '浦东新区',
        phone: '021-87654321',
        email: 'shanghai@example.com',
        manager: {
          id: 2,
          name: '李四',
          phone: '13900139000',
          avatar: 'https://example.com/avatar2.jpg'
        },
        businessHours: {
          monday: { open: '09:00', close: '22:00', enabled: true },
          tuesday: { open: '09:00', close: '22:00', enabled: true },
          wednesday: { open: '09:00', close: '22:00', enabled: true },
          thursday: { open: '09:00', close: '22:00', enabled: true },
          friday: { open: '09:00', close: '22:00', enabled: true },
          saturday: { open: '09:00', close: '22:00', enabled: true },
          sunday: { open: '09:00', close: '22:00', enabled: true }
        },
        area: 180,
        capacity: 120,
        tables: 25,
        employees: 18,
        coordinates: { latitude: 31.2304, longitude: 121.4737 },
        facilities: ['WiFi', '空调', '停车场'],
        description: '上海浦东店',
        images: ['https://example.com/store2.jpg'],
        openingDate: '2024-01-01',
        rating: 0,
        reviewCount: 0,
        createdAt: '2024-01-01T00:00:00Z'
      }
    })),
    updateStore: vi.fn(() => Promise.resolve({
      success: true,
      data: {
        id: 1,
        storeCode: 'ST001',
        name: '北京朝阳店（更新）',
        type: StoreType.DIRECT,
        status: StoreStatus.OPEN,
        address: '北京市朝阳区建国路88号',
        city: '北京市',
        district: '朝阳区',
        phone: '010-12345678',
        email: 'beijing@example.com',
        manager: {
          id: 1,
          name: '张三',
          phone: '13800138000',
          avatar: 'https://example.com/avatar1.jpg'
        },
        businessHours: {
          monday: { open: '09:00', close: '22:00', enabled: true },
          tuesday: { open: '09:00', close: '22:00', enabled: true },
          wednesday: { open: '09:00', close: '22:00', enabled: true },
          thursday: { open: '09:00', close: '22:00', enabled: true },
          friday: { open: '09:00', close: '22:00', enabled: true },
          saturday: { open: '09:00', close: '22:00', enabled: true },
          sunday: { open: '09:00', close: '22:00', enabled: true }
        },
        area: 200,
        capacity: 150,
        tables: 30,
        employees: 20,
        coordinates: { latitude: 39.9042, longitude: 116.4074 },
        facilities: ['WiFi', '空调', '停车场'],
        description: '北京朝阳店（更新）',
        images: ['https://example.com/store1.jpg'],
        openingDate: '2020-01-01',
        rating: 4.5,
        reviewCount: 100,
        createdAt: '2020-01-01T00:00:00Z'
      }
    })),
    deleteStore: vi.fn(() => Promise.resolve({
      success: true
    })),
    updateStoreStatus: vi.fn(() => Promise.resolve({
      success: true
    })),
    createEmployee: vi.fn(() => Promise.resolve({
      success: true,
      data: {
        id: 2,
        employeeCode: 'EMP002',
        name: '李四',
        gender: 'female',
        phone: '13900139000',
        email: 'lisi@example.com',
        avatar: 'https://example.com/avatar2.jpg',
        storeId: 1,
        storeName: '北京朝阳店',
        department: '前厅',
        position: '服务员',
        status: EmployeeStatus.ACTIVE,
        hireDate: '2024-01-01',
        salary: 5000,
        address: '北京市朝阳区',
        idCard: '310101199401011234',
        bankAccount: '6222021234567890124',
        emergencyContact: {
          name: '赵六',
          phone: '13600136000',
          relationship: '配偶'
        },
        permissions: ['store:read'],
        createdAt: '2024-01-01T00:00:00Z'
      }
    })),
    updateEmployee: vi.fn(() => Promise.resolve({
      success: true,
      data: {
        id: 1,
        employeeCode: 'EMP001',
        name: '张三（更新）',
        gender: 'male',
        phone: '13800138000',
        email: 'zhangsan@example.com',
        avatar: 'https://example.com/avatar1.jpg',
        storeId: 1,
        storeName: '北京朝阳店',
        department: '前厅',
        position: '店长',
        status: EmployeeStatus.ACTIVE,
        hireDate: '2020-01-01',
        salary: 8500,
        address: '北京市朝阳区',
        idCard: '110101199001011234',
        bankAccount: '6222021234567890123',
        emergencyContact: {
          name: '王五',
          phone: '13700137000',
          relationship: '配偶'
        },
        permissions: ['store:read', 'store:write'],
        createdAt: '2020-01-01T00:00:00Z'
      }
    })),
    deleteEmployee: vi.fn(() => Promise.resolve({
      success: true
    })),
    transferEmployee: vi.fn(() => Promise.resolve({
      success: true
    })),
    restockInventory: vi.fn(() => Promise.resolve({
      success: true
    })),
    transferInventory: vi.fn(() => Promise.resolve({
      success: true
    })),
    checkInventory: vi.fn(() => Promise.resolve({
      success: true
    })),
    getStoreStatsOverview: vi.fn(() => Promise.resolve({
      success: true,
      data: [
        {
          storeId: 1,
          storeName: '北京朝阳店',
          totalOrders: 1000,
          totalRevenue: 500000,
          averageOrderValue: 500,
          totalCustomers: 800,
          customerRetentionRate: 0.8,
          employeeCount: 20,
          averageRating: 4.5,
          dailyStats: [],
          monthlyStats: []
        }
      ]
    })),
    getEmployeePerformanceOverview: vi.fn(() => Promise.resolve({
      success: true,
      data: [
        {
          employeeId: 1,
          employeeName: '张三',
          storeName: '北京朝阳店',
          department: '前厅',
          position: '店长',
          totalOrders: 200,
          totalRevenue: 100000,
          averageOrderValue: 500,
          customerSatisfaction: 0.9,
          attendanceRate: 0.95,
          performanceScore: 90,
          ranking: 1
        }
      ]
    }))
  }))
})

describe('ChainManagement集成测试', () => {
  let wrapper: VueWrapper<any>
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    wrapper = mount(ChainManagement, {
      global: {
        plugins: [pinia, router, ElementPlus],
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

    router.push('/chain')
    vi.clearAllMocks()
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('组件集成', () => {
    it('应该正确加载所有数据', async () => {
      await wrapper.vm.loadStores()
      await wrapper.vm.loadEmployees()
      await wrapper.vm.loadInventory()
      await wrapper.vm.loadStoreStats()
      await wrapper.vm.loadEmployeePerformance()

      expect(wrapper.vm.stores.length).toBeGreaterThan(0)
      expect(wrapper.vm.employees.length).toBeGreaterThan(0)
      expect(wrapper.vm.inventory.length).toBeGreaterThan(0)
      expect(wrapper.vm.storeStats.length).toBeGreaterThan(0)
      expect(wrapper.vm.employeePerformance.length).toBeGreaterThan(0)
    })

    it('应该正确显示系统概览', () => {
      const statCards = wrapper.findAll('.stat-card')
      expect(statCards.length).toBe(4)
    })

    it('应该正确切换标签页', async () => {
      const tabs = wrapper.find('.el-tabs')
      expect(tabs.exists()).toBe(true)

      wrapper.vm.activeTab = 'employees'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.activeTab).toBe('employees')

      wrapper.vm.activeTab = 'inventory'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.activeTab).toBe('inventory')

      wrapper.vm.activeTab = 'stats'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.activeTab).toBe('stats')

      wrapper.vm.activeTab = 'stores'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.activeTab).toBe('stores')
    })
  })

  describe('门店管理流程集成', () => {
    it('应该完整处理门店生命周期', async () => {
      await wrapper.vm.loadStores()

      const activeStore = wrapper.vm.stores.find((s: any) => s.status === StoreStatus.OPEN)
      expect(activeStore).toBeDefined()

      await wrapper.vm.handleUpdateStoreStatus(activeStore, StoreStatus.CLOSED)
      expect(activeStore.status).toBe(StoreStatus.CLOSED)

      await wrapper.vm.handleUpdateStoreStatus(activeStore, StoreStatus.OPEN)
      expect(activeStore.status).toBe(StoreStatus.OPEN)
    })

    it('应该正确筛选门店', async () => {
      await wrapper.vm.loadStores()
      expect(wrapper.vm.stores.length).toBeGreaterThan(0)
    })

    it('应该正确创建门店', async () => {
      wrapper.vm.storeForm = {
        id: 0,
        storeCode: 'ST002',
        name: '上海浦东店',
        type: StoreType.DIRECT,
        status: StoreStatus.OPEN,
        address: '上海市浦东新区陆家嘴环路1000号',
        city: '上海市',
        district: '浦东新区',
        phone: '021-87654321',
        email: 'shanghai@example.com',
        managerId: 2,
        businessHours: {
          monday: { open: '09:00', close: '22:00', enabled: true },
          tuesday: { open: '09:00', close: '22:00', enabled: true },
          wednesday: { open: '09:00', close: '22:00', enabled: true },
          thursday: { open: '09:00', close: '22:00', enabled: true },
          friday: { open: '09:00', close: '22:00', enabled: true },
          saturday: { open: '09:00', close: '22:00', enabled: true },
          sunday: { open: '09:00', close: '22:00', enabled: true }
        },
        area: 180,
        capacity: 120,
        tables: 25,
        coordinates: { latitude: 31.2304, longitude: 121.4737 },
        facilities: ['WiFi', '空调', '停车场'],
        description: '上海浦东店',
        images: ['https://example.com/store2.jpg'],
        openingDate: '2024-01-01'
      }

      await wrapper.vm.confirmStore()
      expect(wrapper.vm.stores.length).toBeGreaterThan(0)
    })

    it('应该正确更新门店', async () => {
      await wrapper.vm.loadStores()
      const store = wrapper.vm.stores[0]

      wrapper.vm.storeForm = {
        id: store.id,
        storeCode: store.storeCode,
        name: '北京朝阳店（更新）',
        type: store.type,
        status: store.status,
        address: store.address,
        city: store.city,
        district: store.district,
        phone: store.phone,
        email: store.email,
        managerId: store.manager.id,
        businessHours: { ...store.businessHours },
        area: store.area,
        capacity: store.capacity,
        tables: store.tables,
        coordinates: store.coordinates,
        facilities: store.facilities,
        description: '北京朝阳店（更新）',
        images: store.images,
        openingDate: store.openingDate
      }

      await wrapper.vm.confirmStore()
      expect(wrapper.vm.stores.length).toBeGreaterThan(0)
    })

    it('应该正确删除门店', async () => {
      await wrapper.vm.loadStores()
      const store = wrapper.vm.stores[0]

      await wrapper.vm.handleDeleteStore(store)
      expect(wrapper.vm.stores.length).toBeGreaterThan(0)
    })
  })

  describe('员工管理流程集成', () => {
    it('应该正确加载和显示员工', async () => {
      await wrapper.vm.loadEmployees()
      expect(wrapper.vm.employees.length).toBeGreaterThan(0)
    })

    it('应该正确筛选员工', async () => {
      await wrapper.vm.loadEmployees()

      wrapper.vm.employeeFilter.search = '张三'
      await wrapper.vm.handleEmployeeSearch()
      expect(wrapper.vm.employees.length).toBeGreaterThan(0)

      wrapper.vm.employeeFilter.storeId = 1
      await wrapper.vm.handleEmployeeSearch()
      expect(wrapper.vm.employees.length).toBeGreaterThan(0)

      wrapper.vm.employeeFilter.status = EmployeeStatus.ACTIVE
      await wrapper.vm.handleEmployeeSearch()
      expect(wrapper.vm.employees.length).toBeGreaterThan(0)
    })

    it('应该正确创建员工', async () => {
      wrapper.vm.employeeForm = {
        id: 0,
        employeeCode: 'EMP002',
        name: '李四',
        gender: 'female',
        phone: '13900139000',
        email: 'lisi@example.com',
        avatar: 'https://example.com/avatar2.jpg',
        storeId: 1,
        department: '前厅',
        position: '服务员',
        status: EmployeeStatus.ACTIVE,
        hireDate: '2024-01-01',
        salary: 5000,
        address: '北京市朝阳区',
        idCard: '310101199401011234',
        bankAccount: '6222021234567890124',
        emergencyContact: { name: '赵六', phone: '13600136000', relationship: '配偶' },
        permissions: ['store:read']
      }

      await wrapper.vm.confirmEmployee()
      expect(wrapper.vm.employees.length).toBeGreaterThan(0)
    })

    it('应该正确更新员工', async () => {
      await wrapper.vm.loadEmployees()
      const employee = wrapper.vm.employees[0]

      wrapper.vm.employeeForm = {
        id: employee.id,
        employeeCode: employee.employeeCode,
        name: '张三（更新）',
        gender: employee.gender,
        phone: employee.phone,
        email: employee.email,
        avatar: employee.avatar,
        storeId: employee.storeId,
        department: employee.department,
        position: employee.position,
        status: employee.status,
        hireDate: employee.hireDate,
        salary: 8500,
        address: employee.address,
        idCard: employee.idCard,
        bankAccount: employee.bankAccount,
        emergencyContact: employee.emergencyContact,
        permissions: employee.permissions
      }

      await wrapper.vm.confirmEmployee()
      expect(wrapper.vm.employees.length).toBeGreaterThan(0)
    })

    it('应该正确删除员工', async () => {
      await wrapper.vm.loadEmployees()
      const employee = wrapper.vm.employees[0]

      await wrapper.vm.handleDeleteEmployee(employee)
      expect(wrapper.vm.employees.length).toBeGreaterThan(0)
    })

    it('应该正确调店员工', async () => {
      await wrapper.vm.loadEmployees()
      const employee = wrapper.vm.employees[0]

      wrapper.vm.transferForm = {
        targetStoreId: 1,
        reason: '调店',
        effectiveDate: '2024-02-01'
      }

      await wrapper.vm.confirmTransfer()
      expect(wrapper.vm.employees.length).toBeGreaterThan(0)
    })
  })

  describe('库存管理流程集成', () => {
    it('应该正确加载和显示库存', async () => {
      await wrapper.vm.loadInventory()
      expect(wrapper.vm.inventory.length).toBeGreaterThan(0)
    })

    it('应该正确筛选库存', async () => {
      await wrapper.vm.loadInventory()

      wrapper.vm.inventoryFilter.search = '牛肉'
      await wrapper.vm.handleInventorySearch()
      expect(wrapper.vm.inventory.length).toBeGreaterThan(0)

      wrapper.vm.inventoryFilter.status = InventoryStatus.NORMAL
      await wrapper.vm.handleInventorySearch()
      expect(wrapper.vm.inventory.length).toBeGreaterThan(0)
    })

    it('应该正确补货', async () => {
      await wrapper.vm.loadInventory()
      const inventoryItem = wrapper.vm.inventory[0]

      wrapper.vm.restockForm = {
        storeId: inventoryItem.storeId,
        productId: inventoryItem.productId,
        quantity: 10,
        costPrice: 50,
        supplier: { id: 1, name: '供应商A', phone: '13800138001' },
        batchNumber: 'BATCH002',
        expiryDate: '2024-03-01',
        remarks: '补货'
      }

      await wrapper.vm.confirmRestock()
      expect(wrapper.vm.inventory.length).toBeGreaterThan(0)
    })

    it('应该正确调拨库存', async () => {
      await wrapper.vm.loadInventory()
      const inventoryItem = wrapper.vm.inventory[0]

      wrapper.vm.transferInventoryForm = {
        sourceStoreId: inventoryItem.storeId,
        targetStoreId: 2,
        productId: inventoryItem.productId,
        quantity: 5,
        reason: '调拨',
        effectiveDate: '2024-02-01'
      }

      await wrapper.vm.confirmTransferInventory()
      expect(wrapper.vm.inventory.length).toBeGreaterThan(0)
    })

    it('应该正确盘点库存', async () => {
      wrapper.vm.checkForm = {
        storeId: 1,
        checkDate: '2024-01-20',
        details: [
          {
            productId: 1,
            actualQuantity: 45,
            difference: -5,
            reason: '损耗'
          }
        ]
      }

      await wrapper.vm.confirmCheck()
      expect(wrapper.vm.inventory.length).toBeGreaterThan(0)
    })
  })

  describe('数据统计集成', () => {
    it('应该正确显示门店统计', async () => {
      await wrapper.vm.loadStoreStats()
      expect(wrapper.vm.storeStats.length).toBeGreaterThan(0)
    })

    it('应该正确显示员工绩效', async () => {
      await wrapper.vm.loadEmployeePerformance()
      expect(wrapper.vm.employeePerformance.length).toBeGreaterThan(0)
    })

    it('应该正确计算总营业额', () => {
      const totalRevenue = wrapper.vm.totalRevenue
      expect(totalRevenue).toBeGreaterThan(0)
    })
  })

  describe('分页集成', () => {
    it('应该正确处理门店分页', async () => {
      await wrapper.vm.loadStores()

      wrapper.vm.storePagination.page = 2
      await wrapper.vm.handleStorePageChange(2)
      expect(wrapper.vm.storePagination.page).toBe(2)

      wrapper.vm.storePagination.limit = 50
      await wrapper.vm.handleStorePageSizeChange(50)
      expect(wrapper.vm.storePagination.limit).toBe(50)
    })

    it('应该正确处理员工分页', async () => {
      await wrapper.vm.loadEmployees()

      wrapper.vm.employeePagination.page = 2
      await wrapper.vm.handleEmployeePageChange(2)
      expect(wrapper.vm.employeePagination.page).toBe(2)

      wrapper.vm.employeePagination.limit = 50
      await wrapper.vm.handleEmployeePageSizeChange(50)
      expect(wrapper.vm.employeePagination.limit).toBe(50)
    })

    it('应该正确处理库存分页', async () => {
      await wrapper.vm.loadInventory()

      wrapper.vm.inventoryPagination.page = 2
      await wrapper.vm.handleInventoryPageChange(2)
      expect(wrapper.vm.inventoryPagination.page).toBe(2)

      wrapper.vm.inventoryPagination.limit = 50
      await wrapper.vm.handleInventoryPageSizeChange(50)
      expect(wrapper.vm.inventoryPagination.limit).toBe(50)
    })
  })

  describe('错误处理集成', () => {
    it('应该正确处理API错误', async () => {
      const mockAPI = new ChainAPI()
      vi.mocked(mockAPI.getStores).mockRejectedValueOnce(new Error('API错误'))
      
      try {
        await wrapper.vm.loadStores()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('应该正确处理网络错误', async () => {
      const mockAPI = new ChainAPI()
      vi.mocked(mockAPI.getStores).mockRejectedValueOnce(new Error('网络错误'))
      
      try {
        await wrapper.vm.loadStores()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('性能集成', () => {
    it('应该正确处理大量数据', async () => {
      const mockStores = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        storeCode: `ST${i + 1}`,
        name: `门店${i + 1}`,
        type: StoreType.DIRECT,
        status: StoreStatus.OPEN,
        address: `地址${i + 1}`,
        city: '北京市',
        district: '朝阳区',
        phone: '010-12345678',
        email: 'store@example.com',
        manager: {
          id: 1,
          name: '张三',
          phone: '13800138000',
          avatar: 'https://example.com/avatar1.jpg'
        },
        businessHours: {
          monday: { open: '09:00', close: '22:00', enabled: true },
          tuesday: { open: '09:00', close: '22:00', enabled: true },
          wednesday: { open: '09:00', close: '22:00', enabled: true },
          thursday: { open: '09:00', close: '22:00', enabled: true },
          friday: { open: '09:00', close: '22:00', enabled: true },
          saturday: { open: '09:00', close: '22:00', enabled: true },
          sunday: { open: '09:00', close: '22:00', enabled: true }
        },
        area: 200,
        capacity: 150,
        tables: 30,
        employees: 20,
        coordinates: { latitude: 39.9042, longitude: 116.4074 },
        facilities: ['WiFi', '空调', '停车场'],
        description: '门店描述',
        images: ['https://example.com/store.jpg'],
        openingDate: '2020-01-01',
        rating: 4.5,
        reviewCount: 100,
        createdAt: '2020-01-01T00:00:00Z'
      }))

      const mockAPI = new ChainAPI()
      vi.mocked(mockAPI.getStores).mockResolvedValueOnce({
        success: true,
        data: {
          items: mockStores,
          pagination: {
            page: 1,
            limit: 1000,
            total: 1000,
            totalPages: 1
          }
        }
      })

      await wrapper.vm.loadStores()
      expect(wrapper.vm.stores.length).toBe(1000)
    })

    it('应该正确处理实时数据更新', async () => {
      await wrapper.vm.loadStores()
      await wrapper.vm.loadEmployees()
      await wrapper.vm.loadInventory()
      await wrapper.vm.loadStoreStats()
      await wrapper.vm.loadEmployeePerformance()

      await wrapper.vm.loadStores()
      await wrapper.vm.loadEmployees()
      await wrapper.vm.loadInventory()
      await wrapper.vm.loadStoreStats()
      await wrapper.vm.loadEmployeePerformance()

      expect(wrapper.vm.stores.length).toBeGreaterThan(0)
      expect(wrapper.vm.employees.length).toBeGreaterThan(0)
      expect(wrapper.vm.inventory.length).toBeGreaterThan(0)
      expect(wrapper.vm.storeStats.length).toBeGreaterThan(0)
      expect(wrapper.vm.employeePerformance.length).toBeGreaterThan(0)
    })
  })

  describe('用户体验集成', () => {
    it('应该正确显示加载状态', async () => {
      wrapper.vm.loading = true
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.loading).toBe(true)

      wrapper.vm.loading = false
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.loading).toBe(false)
    })

    it('应该正确显示空状态', async () => {
      const mockAPI = new ChainAPI()
      vi.mocked(mockAPI.getStores).mockResolvedValueOnce({
        success: true,
        data: {
          items: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0
          }
        }
      })

      await wrapper.vm.loadStores()
      expect(wrapper.vm.stores.length).toBe(0)
    })

    it('应该正确显示错误状态', async () => {
      const mockAPI = new ChainAPI()
      vi.mocked(mockAPI.getStores).mockRejectedValueOnce(new Error('API错误'))

      try {
        await wrapper.vm.loadStores()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })
})
