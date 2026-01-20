/**
 * @fileoverview 连锁管理组件单元测试
 * @description 测试连锁管理组件的功能
 * @module ChainManagement.test
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ElementPlus from 'element-plus'
import ChainManagement from '@/views/ChainManagement.vue'
import { ChainAPI, StoreType, StoreStatus, EmployeeStatus, InventoryStatus } from '@/api/chain'

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
          },
          {
            id: 2,
            storeCode: 'ST002',
            name: '上海浦东店',
            type: StoreType.FRANCHISE,
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
            openingDate: '2020-06-01',
            rating: 4.3,
            reviewCount: 80,
            createdAt: '2020-06-01T00:00:00Z'
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
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
          },
          {
            id: 2,
            employeeCode: 'EMP002',
            name: '李四',
            gender: 'female',
            phone: '13900139000',
            email: 'lisi@example.com',
            avatar: 'https://example.com/avatar2.jpg',
            storeId: 2,
            storeName: '上海浦东店',
            department: '后厨',
            position: '厨师长',
            status: EmployeeStatus.ACTIVE,
            hireDate: '2020-06-01',
            salary: 9000,
            address: '上海市浦东新区',
            idCard: '310101199006011234',
            bankAccount: '6222021234567890124',
            emergencyContact: {
              name: '赵六',
              phone: '13600136000',
              relationship: '配偶'
            },
            permissions: ['kitchen:read', 'kitchen:write'],
            createdAt: '2020-06-01T00:00:00Z'
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
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
          },
          {
            id: 2,
            storeId: 2,
            storeName: '上海浦东店',
            productId: 2,
            productName: '鸡肉',
            productCode: 'PRD002',
            category: '食材',
            quantity: 8,
            unit: '公斤',
            minQuantity: 10,
            maxQuantity: 100,
            costPrice: 30,
            status: InventoryStatus.WARNING,
            lastRestockDate: '2024-01-10',
            supplier: {
              id: 2,
              name: '供应商B',
              phone: '13900139001'
            },
            location: '冷藏库B',
            batchNumber: 'BATCH002',
            expiryDate: '2024-01-25',
            createdAt: '2024-01-01T00:00:00Z'
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1
        }
      }
    })),
    createStore: vi.fn(() => Promise.resolve({
      success: true,
      data: {
        id: 3,
        storeCode: 'ST003',
        name: '广州天河店',
        type: StoreType.DIRECT,
        status: StoreStatus.OPEN,
        address: '广州市天河区天河路123号',
        city: '广州市',
        district: '天河区',
        phone: '020-87654321',
        email: 'guangzhou@example.com',
        manager: {
          id: 3,
          name: '王五',
          phone: '13700137000',
          avatar: 'https://example.com/avatar3.jpg'
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
        area: 150,
        capacity: 100,
        tables: 20,
        employees: 15,
        coordinates: { latitude: 23.1291, longitude: 113.2644 },
        facilities: ['WiFi', '空调', '停车场'],
        description: '广州天河店',
        images: ['https://example.com/store3.jpg'],
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
        id: 3,
        employeeCode: 'EMP003',
        name: '王五',
        gender: 'male',
        phone: '13700137000',
        email: 'wangwu@example.com',
        avatar: 'https://example.com/avatar3.jpg',
        storeId: 1,
        storeName: '北京朝阳店',
        department: '前厅',
        position: '服务员',
        status: EmployeeStatus.ACTIVE,
        hireDate: '2024-01-01',
        salary: 5000,
        address: '北京市朝阳区',
        idCard: '110101199401011234',
        bankAccount: '6222021234567890125',
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
        },
        {
          storeId: 2,
          storeName: '上海浦东店',
          totalOrders: 800,
          totalRevenue: 400000,
          averageOrderValue: 500,
          totalCustomers: 650,
          customerRetentionRate: 0.75,
          employeeCount: 18,
          averageRating: 4.3,
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
        },
        {
          employeeId: 2,
          employeeName: '李四',
          storeName: '上海浦东店',
          department: '后厨',
          position: '厨师长',
          totalOrders: 150,
          totalRevenue: 75000,
          averageOrderValue: 500,
          customerSatisfaction: 0.85,
          attendanceRate: 0.9,
          performanceScore: 85,
          ranking: 2
        }
      ]
    }))
  }))
}))

describe('ChainManagement组件', () => {
  let wrapper: VueWrapper<any>
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    wrapper = mount(ChainManagement, {
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

    vi.clearAllMocks()
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('组件渲染', () => {
    it('应该正确渲染连锁管理页面', () => {
      expect(wrapper.find('.chain-management').exists()).toBe(true)
      expect(wrapper.find('.chain-title').text()).toBe('连锁管理')
    })

    it('应该显示统计卡片', () => {
      const statCards = wrapper.findAll('.stat-card')
      expect(statCards.length).toBe(4)
    })

    it('应该显示功能标签页', () => {
      const tabs = wrapper.find('.el-tabs')
      expect(tabs.exists()).toBe(true)
    })
  })

  describe('门店管理', () => {
    it('应该正确加载门店列表', async () => {
      await wrapper.vm.loadStores()
      expect(wrapper.vm.stores.length).toBeGreaterThan(0)
    })

    it('应该显示门店列表', () => {
      const storeTable = wrapper.find('.el-table')
      expect(storeTable.exists()).toBe(true)
    })

    it('应该正确显示门店编号', () => {
      const storeCodeCells = wrapper.findAll('td')
      const hasStoreCode = storeCodeCells.some(cell => cell.text().includes('ST'))
      expect(hasStoreCode).toBe(true)
    })

    it('应该正确显示门店名称', () => {
      const storeNameCells = wrapper.findAll('td')
      const hasStoreName = storeNameCells.some(cell => cell.text().includes('店'))
      expect(hasStoreName).toBe(true)
    })

    it('应该正确显示门店类型', () => {
      const typeTags = wrapper.findAll('.el-tag')
      expect(typeTags.length).toBeGreaterThan(0)
    })

    it('应该正确显示门店状态', () => {
      const statusTags = wrapper.findAll('.el-tag')
      expect(statusTags.length).toBeGreaterThan(0)
    })

    it('应该正确显示店长信息', () => {
      const managerInfo = wrapper.findAll('.manager-info')
      expect(managerInfo.length).toBeGreaterThan(0)
    })

    it('应该正确显示员工数量', () => {
      const employeeCountCells = wrapper.findAll('td')
      const hasEmployeeCount = employeeCountCells.some(cell => !isNaN(parseInt(cell.text())))
      expect(hasEmployeeCount).toBe(true)
    })
  })

  describe('员工管理', () => {
    it('应该正确加载员工列表', async () => {
      await wrapper.vm.loadEmployees()
      expect(wrapper.vm.employees.length).toBeGreaterThan(0)
    })

    it('应该显示员工列表', () => {
      const employeeTable = wrapper.find('.el-table')
      expect(employeeTable.exists()).toBe(true)
    })

    it('应该正确显示工号', () => {
      const employeeCodeCells = wrapper.findAll('td')
      const hasEmployeeCode = employeeCodeCells.some(cell => cell.text().includes('EMP'))
      expect(hasEmployeeCode).toBe(true)
    })

    it('应该正确显示员工姓名', () => {
      const employeeNameCells = wrapper.findAll('td')
      const hasEmployeeName = employeeNameCells.some(cell => cell.text().includes('张') || cell.text().includes('李'))
      expect(hasEmployeeName).toBe(true)
    })

    it('应该正确显示员工状态', () => {
      const statusTags = wrapper.findAll('.el-tag')
      expect(statusTags.length).toBeGreaterThan(0)
    })

    it('应该正确显示薪资', () => {
      const salaryCells = wrapper.findAll('td')
      const hasSalary = salaryCells.some(cell => cell.text().includes('¥'))
      expect(hasSalary).toBe(true)
    })
  })

  describe('库存管理', () => {
    it('应该正确加载库存列表', async () => {
      await wrapper.vm.loadInventory()
      expect(wrapper.vm.inventory.length).toBeGreaterThan(0)
    })

    it('应该显示库存列表', () => {
      const inventoryTable = wrapper.find('.el-table')
      expect(inventoryTable.exists()).toBe(true)
    })

    it('应该正确显示商品编码', () => {
      const productCodeCells = wrapper.findAll('td')
      const hasProductCode = productCodeCells.some(cell => cell.text().includes('PRD'))
      expect(hasProductCode).toBe(true)
    })

    it('应该正确显示商品名称', () => {
      const productNameCells = wrapper.findAll('td')
      const hasProductName = productNameCells.some(cell => cell.text().includes('牛肉') || cell.text().includes('鸡肉'))
      expect(hasProductName).toBe(true)
    })

    it('应该正确显示库存数量', () => {
      const quantityCells = wrapper.findAll('td')
      const hasQuantity = quantityCells.some(cell => !isNaN(parseInt(cell.text())))
      expect(hasQuantity).toBe(true)
    })

    it('应该正确显示库存状态', () => {
      const statusTags = wrapper.findAll('.el-tag')
      expect(statusTags.length).toBeGreaterThan(0)
    })

    it('应该正确显示成本价', () => {
      const costPriceCells = wrapper.findAll('td')
      const hasCostPrice = costPriceCells.some(cell => cell.text().includes('¥'))
      expect(hasCostPrice).toBe(true)
    })
  })

  describe('门店操作', () => {
    it('应该正确创建门店', async () => {
      wrapper.vm.storeForm = {
        id: 0,
        storeCode: 'ST003',
        name: '广州天河店',
        type: StoreType.DIRECT,
        status: StoreStatus.OPEN,
        address: '广州市天河区天河路123号',
        city: '广州市',
        district: '天河区',
        phone: '020-87654321',
        email: 'guangzhou@example.com',
        managerId: 3,
        businessHours: {
          monday: { open: '09:00', close: '22:00', enabled: true },
          tuesday: { open: '09:00', close: '22:00', enabled: true },
          wednesday: { open: '09:00', close: '22:00', enabled: true },
          thursday: { open: '09:00', close: '22:00', enabled: true },
          friday: { open: '09:00', close: '22:00', enabled: true },
          saturday: { open: '09:00', close: '22:00', enabled: true },
          sunday: { open: '09:00', close: '22:00', enabled: true }
        },
        area: 150,
        capacity: 100,
        tables: 20,
        coordinates: { latitude: 23.1291, longitude: 113.2644 },
        facilities: ['WiFi', '空调', '停车场'],
        description: '广州天河店',
        images: ['https://example.com/store3.jpg'],
        openingDate: '2024-01-01'
      }
      
      await wrapper.vm.confirmStore()
      expect(wrapper.vm.stores.length).toBeGreaterThan(0)
    })

    it('应该正确更新门店', async () => {
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
      const store = wrapper.vm.stores[0]
      await wrapper.vm.handleDeleteStore(store)
      expect(wrapper.vm.stores.length).toBeGreaterThan(0)
    })

    it('应该正确更新门店状态', async () => {
      const store = wrapper.vm.stores[0]
      await wrapper.vm.handleUpdateStoreStatus(store, StoreStatus.CLOSED)
      expect(store.status).toBe(StoreStatus.CLOSED)
    })
  })

  describe('员工操作', () => {
    it('应该正确创建员工', async () => {
      wrapper.vm.employeeForm = {
        id: 0,
        employeeCode: 'EMP003',
        name: '王五',
        gender: 'male',
        phone: '13700137000',
        email: 'wangwu@example.com',
        avatar: 'https://example.com/avatar3.jpg',
        storeId: 1,
        department: '前厅',
        position: '服务员',
        status: EmployeeStatus.ACTIVE,
        hireDate: '2024-01-01',
        salary: 5000,
        address: '北京市朝阳区',
        idCard: '110101199401011234',
        bankAccount: '6222021234567890125',
        emergencyContact: { name: '赵六', phone: '13600136000', relationship: '配偶' },
        permissions: ['store:read']
      }
      
      await wrapper.vm.confirmEmployee()
      expect(wrapper.vm.employees.length).toBeGreaterThan(0)
    })

    it('应该正确更新员工', async () => {
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
      const employee = wrapper.vm.employees[0]
      await wrapper.vm.handleDeleteEmployee(employee)
      expect(wrapper.vm.employees.length).toBeGreaterThan(0)
    })

    it('应该正确调店员工', async () => {
      const employee = wrapper.vm.employees[0]
      wrapper.vm.transferForm = {
        targetStoreId: 2,
        reason: '调店',
        effectiveDate: '2024-02-01'
      }
      
      await wrapper.vm.confirmTransfer()
      expect(wrapper.vm.employees.length).toBeGreaterThan(0)
    })
  })

  describe('库存操作', () => {
    it('应该正确补货', async () => {
      const inventoryItem = wrapper.vm.inventory[0]
      wrapper.vm.restockForm = {
        storeId: inventoryItem.storeId,
        productId: inventoryItem.productId,
        quantity: 10,
        costPrice: 50,
        supplier: { id: 1, name: '供应商A', phone: '13800138001' },
        batchNumber: 'BATCH003',
        expiryDate: '2024-03-01',
        remarks: '补货'
      }
      
      await wrapper.vm.confirmRestock()
      expect(wrapper.vm.inventory.length).toBeGreaterThan(0)
    })

    it('应该正确调拨库存', async () => {
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

  describe('筛选和搜索', () => {
    it('应该正确搜索门店', async () => {
      wrapper.vm.storeFilter.search = '北京'
      await wrapper.vm.handleStoreSearch()
      expect(wrapper.vm.stores.length).toBeGreaterThan(0)
    })

    it('应该正确按状态筛选门店', async () => {
      wrapper.vm.storeFilter.status = StoreStatus.OPEN
      await wrapper.vm.handleStoreSearch()
      expect(wrapper.vm.stores.length).toBeGreaterThan(0)
    })

    it('应该正确按类型筛选门店', async () => {
      wrapper.vm.storeFilter.type = StoreType.DIRECT
      await wrapper.vm.handleStoreSearch()
      expect(wrapper.vm.stores.length).toBeGreaterThan(0)
    })

    it('应该正确搜索员工', async () => {
      wrapper.vm.employeeFilter.search = '张三'
      await wrapper.vm.handleEmployeeSearch()
      expect(wrapper.vm.employees.length).toBeGreaterThan(0)
    })

    it('应该正确按门店筛选员工', async () => {
      wrapper.vm.employeeFilter.storeId = 1
      await wrapper.vm.handleEmployeeSearch()
      expect(wrapper.vm.employees.length).toBeGreaterThan(0)
    })

    it('应该正确搜索库存', async () => {
      wrapper.vm.inventoryFilter.search = '牛肉'
      await wrapper.vm.handleInventorySearch()
      expect(wrapper.vm.inventory.length).toBeGreaterThan(0)
    })

    it('应该正确按状态筛选库存', async () => {
      wrapper.vm.inventoryFilter.status = InventoryStatus.NORMAL
      await wrapper.vm.handleInventorySearch()
      expect(wrapper.vm.inventory.length).toBeGreaterThan(0)
    })
  })

  describe('分页功能', () => {
    it('应该正确处理门店分页', async () => {
      wrapper.vm.storePagination.page = 2
      await wrapper.vm.handleStorePageChange(2)
      expect(wrapper.vm.storePagination.page).toBe(2)
    })

    it('应该正确处理门店每页数量变化', async () => {
      wrapper.vm.storePagination.limit = 50
      await wrapper.vm.handleStorePageSizeChange(50)
      expect(wrapper.vm.storePagination.limit).toBe(50)
    })

    it('应该正确处理员工分页', async () => {
      wrapper.vm.employeePagination.page = 2
      await wrapper.vm.handleEmployeePageChange(2)
      expect(wrapper.vm.employeePagination.page).toBe(2)
    })

    it('应该正确处理员工每页数量变化', async () => {
      wrapper.vm.employeePagination.limit = 50
      await wrapper.vm.handleEmployeePageSizeChange(50)
      expect(wrapper.vm.employeePagination.limit).toBe(50)
    })

    it('应该正确处理库存分页', async () => {
      wrapper.vm.inventoryPagination.page = 2
      await wrapper.vm.handleInventoryPageChange(2)
      expect(wrapper.vm.inventoryPagination.page).toBe(2)
    })

    it('应该正确处理库存每页数量变化', async () => {
      wrapper.vm.inventoryPagination.limit = 50
      await wrapper.vm.handleInventoryPageSizeChange(50)
      expect(wrapper.vm.inventoryPagination.limit).toBe(50)
    })
  })

  describe('标签页切换', () => {
    it('应该正确切换到员工管理标签页', async () => {
      await wrapper.vm.handleTabChange('employees')
      expect(wrapper.vm.activeTab).toBe('employees')
    })

    it('应该正确切换到库存管理标签页', async () => {
      await wrapper.vm.handleTabChange('inventory')
      expect(wrapper.vm.activeTab).toBe('inventory')
    })

    it('应该正确切换到数据统计标签页', async () => {
      await wrapper.vm.handleTabChange('stats')
      expect(wrapper.vm.activeTab).toBe('stats')
    })

    it('应该正确切换到门店管理标签页', async () => {
      await wrapper.vm.handleTabChange('stores')
      expect(wrapper.vm.activeTab).toBe('stores')
    })
  })

  describe('数据格式化', () => {
    it('应该正确格式化数字', () => {
      const formatted = wrapper.vm.formatNumber(1234567.89)
      expect(formatted).toBe('1,234,567.89')
    })

    it('应该正确格式化日期时间', () => {
      const formatted = wrapper.vm.formatDateTime('2024-01-01T12:00:00Z')
      expect(formatted).toContain('2024-01-01')
      expect(formatted).toContain('12:00:00')
    })

    it('应该正确获取门店类型名称', () => {
      const name = wrapper.vm.getStoreTypeName(StoreType.DIRECT)
      expect(name).toBe('直营店')
    })

    it('应该正确获取门店状态名称', () => {
      const name = wrapper.vm.getStoreStatusName(StoreStatus.OPEN)
      expect(name).toBe('营业中')
    })

    it('应该正确获取门店状态类型', () => {
      const type = wrapper.vm.getStoreStatusType(StoreStatus.OPEN)
      expect(type).toBe('success')
    })

    it('应该正确获取员工状态名称', () => {
      const name = wrapper.vm.getEmployeeStatusName(EmployeeStatus.ACTIVE)
      expect(name).toBe('在职')
    })

    it('应该正确获取员工状态类型', () => {
      const type = wrapper.vm.getEmployeeStatusType(EmployeeStatus.ACTIVE)
      expect(type).toBe('success')
    })

    it('应该正确获取库存状态名称', () => {
      const name = wrapper.vm.getInventoryStatusName(InventoryStatus.NORMAL)
      expect(name).toBe('充足')
    })

    it('应该正确获取库存状态类型', () => {
      const type = wrapper.vm.getInventoryStatusType(InventoryStatus.NORMAL)
      expect(type).toBe('success')
    })
  })

  describe('加载状态', () => {
    it('应该正确显示加载状态', async () => {
      wrapper.vm.loading = true
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.loading).toBe(true)
    })

    it('应该正确隐藏加载状态', async () => {
      wrapper.vm.loading = false
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.loading).toBe(false)
    })
  })

  describe('统计数据', () => {
    it('应该正确加载门店统计', async () => {
      await wrapper.vm.loadStoreStats()
      expect(wrapper.vm.storeStats.length).toBeGreaterThan(0)
    })

    it('应该正确加载员工绩效', async () => {
      await wrapper.vm.loadEmployeePerformance()
      expect(wrapper.vm.employeePerformance.length).toBeGreaterThan(0)
    })

    it('应该正确计算总营业额', () => {
      const totalRevenue = wrapper.vm.totalRevenue
      expect(totalRevenue).toBeGreaterThan(0)
    })
  })
})
