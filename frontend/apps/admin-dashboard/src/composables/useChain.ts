/**
 * @fileoverview 连锁管理Composable
 * @description 管理连锁管理功能的状态和逻辑
 * @module useChain
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 */

import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { 
  chainAPI, 
  StoreType, 
  StoreStatus, 
  EmployeeStatus, 
  InventoryStatus,
  type Store, 
  type Employee, 
  type Inventory, 
  type StoreStats,
  type EmployeePerformance,
  type RevenueComparison,
  type TrendData,
  type CreateStoreRequest,
  type UpdateStoreRequest,
  type CreateEmployeeRequest,
  type UpdateEmployeeRequest,
  type TransferEmployeeRequest,
  type RestockInventoryRequest,
  type TransferInventoryRequest,
  type CheckInventoryRequest,
  type StoreQueryParams,
  type EmployeeQueryParams,
  type InventoryQueryParams
} from '@/api/chain'

export function useChain() {
  const loading = ref(false)
  const activeTab = ref<'stores' | 'employees' | 'inventory' | 'stats'>('stores')

  const stores = ref<Store[]>([])
  const employees = ref<Employee[]>([])
  const inventory = ref<Inventory[]>([])
  const storeStats = ref<StoreStats[]>([])
  const employeePerformance = ref<EmployeePerformance[]>([])
  const revenueComparison = ref<RevenueComparison[]>([])
  const trendData = ref<TrendData[]>([])

  const selectedStore = ref<Store | null>(null)
  const selectedEmployee = ref<Employee | null>(null)
  const selectedInventory = ref<Inventory | null>(null)

  const showStoreDialog = ref(false)
  const showEmployeeDialog = ref(false)
  const showInventoryDialog = ref(false)
  const showTransferDialog = ref(false)
  const showRestockDialog = ref(false)
  const showTransferInventoryDialog = ref(false)
  const showCheckDialog = ref(false)

  const storeDialogType = ref<'create' | 'edit'>('create')
  const employeeDialogType = ref<'create' | 'edit'>('create')

  const storeForm = reactive({
    id: 0,
    storeCode: '',
    name: '',
    type: StoreType.DIRECT,
    status: StoreStatus.OPEN,
    address: '',
    city: '',
    district: '',
    phone: '',
    email: '',
    managerId: 0,
    businessHours: {
      monday: { open: '09:00', close: '22:00', enabled: true },
      tuesday: { open: '09:00', close: '22:00', enabled: true },
      wednesday: { open: '09:00', close: '22:00', enabled: true },
      thursday: { open: '09:00', close: '22:00', enabled: true },
      friday: { open: '09:00', close: '22:00', enabled: true },
      saturday: { open: '09:00', close: '22:00', enabled: true },
      sunday: { open: '09:00', close: '22:00', enabled: true }
    },
    area: 100,
    capacity: 100,
    tables: 20,
    coordinates: { latitude: 0, longitude: 0 },
    facilities: [] as string[],
    description: '',
    images: [] as string[],
    openingDate: ''
  })

  const employeeForm = reactive({
    id: 0,
    employeeCode: '',
    name: '',
    gender: 'male' as 'male' | 'female' | 'other',
    phone: '',
    email: '',
    avatar: '',
    storeId: 0,
    department: '',
    position: '',
    status: EmployeeStatus.ACTIVE,
    hireDate: '',
    salary: 0,
    address: '',
    idCard: '',
    bankAccount: '',
    emergencyContact: { name: '', phone: '', relationship: '' },
    permissions: [] as string[]
  })

  const transferForm = reactive({
    targetStoreId: 0,
    reason: '',
    effectiveDate: ''
  })

  const restockForm = reactive({
    storeId: 0,
    productId: 0,
    quantity: 0,
    costPrice: 0,
    supplier: { id: 0, name: '', phone: '' },
    batchNumber: '',
    expiryDate: '',
    remarks: ''
  })

  const transferInventoryForm = reactive({
    sourceStoreId: 0,
    targetStoreId: 0,
    productId: 0,
    quantity: 0,
    reason: '',
    effectiveDate: ''
  })

  const checkForm = reactive({
    storeId: 0,
    checkDate: '',
    details: [] as { productId: number; actualQuantity: number; difference: number; reason?: string }[]
  })

  const storePagination = reactive({
    page: 1,
    limit: 20,
    total: 0
  })

  const employeePagination = reactive({
    page: 1,
    limit: 20,
    total: 0
  })

  const inventoryPagination = reactive({
    page: 1,
    limit: 20,
    total: 0
  })

  const storeFilter = reactive({
    search: '',
    status: '' as StoreStatus | '',
    type: '' as StoreType | '',
    city: '',
    district: ''
  })

  const employeeFilter = reactive({
    search: '',
    storeId: 0,
    department: '',
    position: '',
    status: '' as EmployeeStatus | ''
  })

  const inventoryFilter = reactive({
    search: '',
    storeId: 0,
    category: '',
    status: '' as InventoryStatus | ''
  })

  const storesLoading = computed(() => loading.value && activeTab.value === 'stores')
  const employeesLoading = computed(() => loading.value && activeTab.value === 'employees')
  const inventoryLoading = computed(() => loading.value && activeTab.value === 'inventory')
  const statsLoading = computed(() => loading.value && activeTab.value === 'stats')

  const loadStores = async () => {
    try {
      loading.value = true
      const params: StoreQueryParams = {
        page: storePagination.page,
        limit: storePagination.limit,
        search: storeFilter.search || undefined,
        status: storeFilter.status || undefined,
        type: storeFilter.type || undefined,
        city: storeFilter.city || undefined,
        district: storeFilter.district || undefined
      }
      
      const response = await chainAPI.getStores(params)
      if (response.success && response.data) {
        stores.value = response.data.items
        storePagination.total = response.data.pagination.total
      } else {
        ElMessage.error(response.message || '加载门店列表失败')
      }
    } catch (error) {
      ElMessage.error('加载门店列表失败')
      console.error('加载门店列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  const loadEmployees = async () => {
    try {
      loading.value = true
      const params: EmployeeQueryParams = {
        page: employeePagination.page,
        limit: employeePagination.limit,
        search: employeeFilter.search || undefined,
        storeId: employeeFilter.storeId || undefined,
        department: employeeFilter.department || undefined,
        position: employeeFilter.position || undefined,
        status: employeeFilter.status || undefined
      }
      
      const response = await chainAPI.getEmployees(params)
      if (response.success && response.data) {
        employees.value = response.data.items
        employeePagination.total = response.data.pagination.total
      } else {
        ElMessage.error(response.message || '加载员工列表失败')
      }
    } catch (error) {
      ElMessage.error('加载员工列表失败')
      console.error('加载员工列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  const loadInventory = async () => {
    try {
      loading.value = true
      const params: InventoryQueryParams = {
        page: inventoryPagination.page,
        limit: inventoryPagination.limit,
        search: inventoryFilter.search || undefined,
        storeId: inventoryFilter.storeId || undefined,
        category: inventoryFilter.category || undefined,
        status: inventoryFilter.status || undefined
      }
      
      const response = await chainAPI.getInventory(params)
      if (response.success && response.data) {
        inventory.value = response.data.items
        inventoryPagination.total = response.data.pagination.total
      } else {
        ElMessage.error(response.message || '加载库存列表失败')
      }
    } catch (error) {
      ElMessage.error('加载库存列表失败')
      console.error('加载库存列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  const loadStoreStats = async () => {
    try {
      const response = await chainAPI.getStoreStatsOverview()
      if (response.success && response.data) {
        storeStats.value = response.data
      } else {
        ElMessage.error(response.message || '加载门店统计失败')
      }
    } catch (error) {
      ElMessage.error('加载门店统计失败')
      console.error('加载门店统计失败:', error)
    }
  }

  const loadEmployeePerformance = async () => {
    try {
      const response = await chainAPI.getEmployeePerformanceOverview()
      if (response.success && response.data) {
        employeePerformance.value = response.data
      } else {
        ElMessage.error(response.message || '加载员工绩效失败')
      }
    } catch (error) {
      ElMessage.error('加载员工绩效失败')
      console.error('加载员工绩效失败:', error)
    }
  }

  const handleAddStore = () => {
    storeDialogType.value = 'create'
    Object.assign(storeForm, {
      id: 0,
      storeCode: '',
      name: '',
      type: StoreType.DIRECT,
      status: StoreStatus.OPEN,
      address: '',
      city: '',
      district: '',
      phone: '',
      email: '',
      managerId: 0,
      businessHours: {
        monday: { open: '09:00', close: '22:00', enabled: true },
        tuesday: { open: '09:00', close: '22:00', enabled: true },
        wednesday: { open: '09:00', close: '22:00', enabled: true },
        thursday: { open: '09:00', close: '22:00', enabled: true },
        friday: { open: '09:00', close: '22:00', enabled: true },
        saturday: { open: '09:00', close: '22:00', enabled: true },
        sunday: { open: '09:00', close: '22:00', enabled: true }
      },
      area: 100,
      capacity: 100,
      tables: 20,
      coordinates: { latitude: 0, longitude: 0 },
      facilities: [] as string[],
      description: '',
      images: [] as string[],
      openingDate: ''
    })
    showStoreDialog.value = true
  }

  const handleEditStore = (store: Store) => {
    storeDialogType.value = 'edit'
    Object.assign(storeForm, {
      id: store.id,
      storeCode: store.storeCode,
      name: store.name,
      type: store.type,
      status: store.status,
      address: store.address,
      city: store.city,
      district: store.district,
      phone: store.phone,
      email: store.email || '',
      managerId: store.manager.id,
      businessHours: { ...store.businessHours },
      area: store.area,
      capacity: store.capacity,
      tables: store.tables,
      coordinates: store.coordinates || { latitude: 0, longitude: 0 },
      facilities: store.facilities || [],
      description: store.description || '',
      images: store.images || [],
      openingDate: store.openingDate
    })
    selectedStore.value = store
    showStoreDialog.value = true
  }

  const handleDeleteStore = async (store: Store) => {
    try {
      await ElMessageBox.confirm(`确定要删除门店 "${store.name}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      const response = await chainAPI.deleteStore(store.id)
      if (response.success) {
        ElMessage.success('删除成功')
        await loadStores()
      } else {
        ElMessage.error(response.message || '删除失败')
      }
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
        console.error('删除失败:', error)
      }
    }
  }

  const handleUpdateStoreStatus = async (store: Store, status: StoreStatus) => {
    try {
      const response = await chainAPI.updateStoreStatus(store.id, status)
      if (response.success) {
        store.status = status
        ElMessage.success('状态更新成功')
      } else {
        ElMessage.error(response.message || '状态更新失败')
      }
    } catch (error) {
      ElMessage.error('状态更新失败')
      console.error('状态更新失败:', error)
    }
  }

  const confirmStore = async () => {
    try {
      if (storeDialogType.value === 'create') {
        const request: CreateStoreRequest = {
          storeCode: storeForm.storeCode,
          name: storeForm.name,
          type: storeForm.type,
          status: storeForm.status,
          address: storeForm.address,
          city: storeForm.city,
          district: storeForm.district,
          phone: storeForm.phone,
          email: storeForm.email,
          managerId: storeForm.managerId,
          businessHours: storeForm.businessHours,
          area: storeForm.area,
          capacity: storeForm.capacity,
          tables: storeForm.tables,
          coordinates: storeForm.coordinates,
          facilities: storeForm.facilities,
          description: storeForm.description,
          images: storeForm.images,
          openingDate: storeForm.openingDate
        }
        
        const response = await chainAPI.createStore(request)
        if (response.success) {
          ElMessage.success('创建成功')
          showStoreDialog.value = false
          await loadStores()
        } else {
          ElMessage.error(response.message || '创建失败')
        }
      } else {
        const request: UpdateStoreRequest = {
          name: storeForm.name,
          type: storeForm.type,
          status: storeForm.status,
          address: storeForm.address,
          city: storeForm.city,
          district: storeForm.district,
          phone: storeForm.phone,
          email: storeForm.email,
          managerId: storeForm.managerId,
          businessHours: storeForm.businessHours,
          area: storeForm.area,
          capacity: storeForm.capacity,
          tables: storeForm.tables,
          coordinates: storeForm.coordinates,
          facilities: storeForm.facilities,
          description: storeForm.description,
          images: storeForm.images
        }
        
        const response = await chainAPI.updateStore(storeForm.id, request)
        if (response.success) {
          ElMessage.success('更新成功')
          showStoreDialog.value = false
          await loadStores()
        } else {
          ElMessage.error(response.message || '更新失败')
        }
      }
    } catch (error) {
      ElMessage.error('操作失败')
      console.error('操作失败:', error)
    }
  }

  const handleAddEmployee = () => {
    employeeDialogType.value = 'create'
    Object.assign(employeeForm, {
      id: 0,
      employeeCode: '',
      name: '',
      gender: 'male',
      phone: '',
      email: '',
      avatar: '',
      storeId: 0,
      department: '',
      position: '',
      status: EmployeeStatus.ACTIVE,
      hireDate: '',
      salary: 0,
      address: '',
      idCard: '',
      bankAccount: '',
      emergencyContact: { name: '', phone: '', relationship: '' },
      permissions: [] as string[]
    })
    showEmployeeDialog.value = true
  }

  const handleEditEmployee = (employee: Employee) => {
    employeeDialogType.value = 'edit'
    Object.assign(employeeForm, {
      id: employee.id,
      employeeCode: employee.employeeCode,
      name: employee.name,
      gender: employee.gender,
      phone: employee.phone,
      email: employee.email || '',
      avatar: employee.avatar || '',
      storeId: employee.storeId,
      department: employee.department,
      position: employee.position,
      status: employee.status,
      hireDate: employee.hireDate,
      salary: employee.salary,
      address: employee.address || '',
      idCard: employee.idCard || '',
      bankAccount: employee.bankAccount || '',
      emergencyContact: employee.emergencyContact || { name: '', phone: '', relationship: '' },
      permissions: employee.permissions
    })
    selectedEmployee.value = employee
    showEmployeeDialog.value = true
  }

  const handleDeleteEmployee = async (employee: Employee) => {
    try {
      await ElMessageBox.confirm(`确定要删除员工 "${employee.name}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      const response = await chainAPI.deleteEmployee(employee.id)
      if (response.success) {
        ElMessage.success('删除成功')
        await loadEmployees()
      } else {
        ElMessage.error(response.message || '删除失败')
      }
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
        console.error('删除失败:', error)
      }
    }
  }

  const handleTransferEmployee = (employee: Employee) => {
    transferForm.targetStoreId = 0
    transferForm.reason = ''
    transferForm.effectiveDate = ''
    selectedEmployee.value = employee
    showTransferDialog.value = true
  }

  const confirmTransfer = async () => {
    try {
      if (!selectedEmployee.value) return
      
      const request: TransferEmployeeRequest = {
        targetStoreId: transferForm.targetStoreId,
        reason: transferForm.reason,
        effectiveDate: transferForm.effectiveDate
      }
      
      const response = await chainAPI.transferEmployee(selectedEmployee.value.id, request)
      if (response.success) {
        ElMessage.success('调店成功')
        showTransferDialog.value = false
        await loadEmployees()
      } else {
        ElMessage.error(response.message || '调店失败')
      }
    } catch (error) {
      ElMessage.error('调店失败')
      console.error('调店失败:', error)
    }
  }

  const confirmEmployee = async () => {
    try {
      if (employeeDialogType.value === 'create') {
        const request: CreateEmployeeRequest = {
          employeeCode: employeeForm.employeeCode,
          name: employeeForm.name,
          gender: employeeForm.gender,
          phone: employeeForm.phone,
          email: employeeForm.email,
          avatar: employeeForm.avatar,
          storeId: employeeForm.storeId,
          department: employeeForm.department,
          position: employeeForm.position,
          status: employeeForm.status,
          hireDate: employeeForm.hireDate,
          salary: employeeForm.salary,
          address: employeeForm.address,
          idCard: employeeForm.idCard,
          bankAccount: employeeForm.bankAccount,
          emergencyContact: employeeForm.emergencyContact,
          permissions: employeeForm.permissions
        }
        
        const response = await chainAPI.createEmployee(request)
        if (response.success) {
          ElMessage.success('创建成功')
          showEmployeeDialog.value = false
          await loadEmployees()
        } else {
          ElMessage.error(response.message || '创建失败')
        }
      } else {
        const request: UpdateEmployeeRequest = {
          name: employeeForm.name,
          gender: employeeForm.gender,
          phone: employeeForm.phone,
          email: employeeForm.email,
          avatar: employeeForm.avatar,
          storeId: employeeForm.storeId,
          department: employeeForm.department,
          position: employeeForm.position,
          status: employeeForm.status,
          salary: employeeForm.salary,
          address: employeeForm.address,
          idCard: employeeForm.idCard,
          bankAccount: employeeForm.bankAccount,
          emergencyContact: employeeForm.emergencyContact,
          permissions: employeeForm.permissions
        }
        
        const response = await chainAPI.updateEmployee(employeeForm.id, request)
        if (response.success) {
          ElMessage.success('更新成功')
          showEmployeeDialog.value = false
          await loadEmployees()
        } else {
          ElMessage.error(response.message || '更新失败')
        }
      }
    } catch (error) {
      ElMessage.error('操作失败')
      console.error('操作失败:', error)
    }
  }

  const handleRestock = (inventoryItem: Inventory) => {
    restockForm.storeId = inventoryItem.storeId
    restockForm.productId = inventoryItem.productId
    restockForm.quantity = 0
    restockForm.costPrice = 0
    restockForm.supplier = { id: 0, name: '', phone: '' }
    restockForm.batchNumber = ''
    restockForm.expiryDate = ''
    restockForm.remarks = ''
    selectedInventory.value = inventoryItem
    showRestockDialog.value = true
  }

  const confirmRestock = async () => {
    try {
      const request: RestockInventoryRequest = {
        storeId: restockForm.storeId,
        productId: restockForm.productId,
        quantity: restockForm.quantity,
        costPrice: restockForm.costPrice,
        supplier: restockForm.supplier,
        batchNumber: restockForm.batchNumber,
        expiryDate: restockForm.expiryDate,
        remarks: restockForm.remarks
      }
      
      const response = await chainAPI.restockInventory(request)
      if (response.success) {
        ElMessage.success('补货成功')
        showRestockDialog.value = false
        await loadInventory()
      } else {
        ElMessage.error(response.message || '补货失败')
      }
    } catch (error) {
      ElMessage.error('补货失败')
      console.error('补货失败:', error)
    }
  }

  const handleTransferInventory = (inventoryItem: Inventory) => {
    transferInventoryForm.sourceStoreId = inventoryItem.storeId
    transferInventoryForm.targetStoreId = 0
    transferInventoryForm.productId = inventoryItem.productId
    transferInventoryForm.quantity = 0
    transferInventoryForm.reason = ''
    transferInventoryForm.effectiveDate = ''
    selectedInventory.value = inventoryItem
    showTransferInventoryDialog.value = true
  }

  const confirmTransferInventory = async () => {
    try {
      const request: TransferInventoryRequest = {
        sourceStoreId: transferInventoryForm.sourceStoreId,
        targetStoreId: transferInventoryForm.targetStoreId,
        productId: transferInventoryForm.productId,
        quantity: transferInventoryForm.quantity,
        reason: transferInventoryForm.reason,
        effectiveDate: transferInventoryForm.effectiveDate
      }
      
      const response = await chainAPI.transferInventory(request)
      if (response.success) {
        ElMessage.success('调拨成功')
        showTransferInventoryDialog.value = false
        await loadInventory()
      } else {
        ElMessage.error(response.message || '调拨失败')
      }
    } catch (error) {
      ElMessage.error('调拨失败')
      console.error('调拨失败:', error)
    }
  }

  const handleCheckInventory = (storeId: number) => {
    checkForm.storeId = storeId
    checkForm.checkDate = dayjs().format('YYYY-MM-DD')
    checkForm.details = []
    showCheckDialog.value = true
  }

  const confirmCheck = async () => {
    try {
      const request: CheckInventoryRequest = {
        storeId: checkForm.storeId,
        checkDate: checkForm.checkDate,
        details: checkForm.details
      }
      
      const response = await chainAPI.checkInventory(request)
      if (response.success) {
        ElMessage.success('盘点成功')
        showCheckDialog.value = false
        await loadInventory()
      } else {
        ElMessage.error(response.message || '盘点失败')
      }
    } catch (error) {
      ElMessage.error('盘点失败')
      console.error('盘点失败:', error)
    }
  }

  const handleStoreSearch = () => {
    storePagination.page = 1
    loadStores()
  }

  const resetStoreFilter = () => {
    Object.assign(storeFilter, {
      search: '',
      status: '' as StoreStatus | '',
      type: '' as StoreType | '',
      city: '',
      district: ''
    })
    storePagination.page = 1
    loadStores()
  }

  const handleEmployeeSearch = () => {
    employeePagination.page = 1
    loadEmployees()
  }

  const resetEmployeeFilter = () => {
    Object.assign(employeeFilter, {
      search: '',
      storeId: 0,
      department: '',
      position: '',
      status: '' as EmployeeStatus | ''
    })
    employeePagination.page = 1
    loadEmployees()
  }

  const handleInventorySearch = () => {
    inventoryPagination.page = 1
    loadInventory()
  }

  const resetInventoryFilter = () => {
    Object.assign(inventoryFilter, {
      search: '',
      storeId: 0,
      category: '',
      status: '' as InventoryStatus | ''
    })
    inventoryPagination.page = 1
    loadInventory()
  }

  const handleStorePageChange = (page: number) => {
    storePagination.page = page
    loadStores()
  }

  const handleStorePageSizeChange = (pageSize: number) => {
    storePagination.limit = pageSize
    storePagination.page = 1
    loadStores()
  }

  const handleEmployeePageChange = (page: number) => {
    employeePagination.page = page
    loadEmployees()
  }

  const handleEmployeePageSizeChange = (pageSize: number) => {
    employeePagination.limit = pageSize
    employeePagination.page = 1
    loadEmployees()
  }

  const handleInventoryPageChange = (page: number) => {
    inventoryPagination.page = page
    loadInventory()
  }

  const handleInventoryPageSizeChange = (pageSize: number) => {
    inventoryPagination.limit = pageSize
    inventoryPagination.page = 1
    loadInventory()
  }

  const handleTabChange = (tabName: string) => {
    activeTab.value = tabName as any
    if (tabName === 'stores') {
      loadStores()
    } else if (tabName === 'employees') {
      loadEmployees()
    } else if (tabName === 'inventory') {
      loadInventory()
    } else if (tabName === 'stats') {
      loadStoreStats()
      loadEmployeePerformance()
    }
  }

  const formatNumber = (num: number): string => {
    return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const formatDateTime = (date: string): string => {
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
  }

  const getStoreTypeName = (type: StoreType): string => {
    const names: Record<StoreType, string> = {
      [StoreType.DIRECT]: '直营店',
      [StoreType.FRANCHISE]: '加盟店'
    }
    return names[type] || type
  }

  const getStoreStatusName = (status: StoreStatus): string => {
    const names: Record<StoreStatus, string> = {
      [StoreStatus.OPEN]: '营业中',
      [StoreStatus.CLOSED]: '休息中',
      [StoreStatus.MAINTENANCE]: '已关闭'
    }
    return names[status] || status
  }

  const getStoreStatusType = (status: StoreStatus): string => {
    const types: Record<StoreStatus, string> = {
      [StoreStatus.OPEN]: 'success',
      [StoreStatus.CLOSED]: 'warning',
      [StoreStatus.MAINTENANCE]: 'danger'
    }
    return types[status] || 'info'
  }

  const getEmployeeStatusName = (status: EmployeeStatus): string => {
    const names: Record<EmployeeStatus, string> = {
      [EmployeeStatus.ACTIVE]: '在职',
      [EmployeeStatus.RESIGNED]: '离职',
      [EmployeeStatus.LEAVE]: '请假'
    }
    return names[status] || status
  }

  const getEmployeeStatusType = (status: EmployeeStatus): string => {
    const types: Record<EmployeeStatus, string> = {
      [EmployeeStatus.ACTIVE]: 'success',
      [EmployeeStatus.RESIGNED]: 'danger',
      [EmployeeStatus.LEAVE]: 'warning'
    }
    return types[status] || 'info'
  }

  const getInventoryStatusName = (status: InventoryStatus): string => {
    const names: Record<InventoryStatus, string> = {
      [InventoryStatus.NORMAL]: '充足',
      [InventoryStatus.WARNING]: '预警',
      [InventoryStatus.OUT_OF_STOCK]: '缺货'
    }
    return names[status] || status
  }

  const getInventoryStatusType = (status: InventoryStatus): string => {
    const types: Record<InventoryStatus, string> = {
      [InventoryStatus.NORMAL]: 'success',
      [InventoryStatus.WARNING]: 'warning',
      [InventoryStatus.OUT_OF_STOCK]: 'danger'
    }
    return types[status] || 'info'
  }

  return {
    loading,
    activeTab,
    stores,
    employees,
    inventory,
    storeStats,
    employeePerformance,
    revenueComparison,
    trendData,
    selectedStore,
    selectedEmployee,
    selectedInventory,
    showStoreDialog,
    showEmployeeDialog,
    showInventoryDialog,
    showTransferDialog,
    showRestockDialog,
    showTransferInventoryDialog,
    showCheckDialog,
    storeDialogType,
    employeeDialogType,
    storeForm,
    employeeForm,
    transferForm,
    restockForm,
    transferInventoryForm,
    checkForm,
    storePagination,
    employeePagination,
    inventoryPagination,
    storeFilter,
    employeeFilter,
    inventoryFilter,
    storesLoading,
    employeesLoading,
    inventoryLoading,
    statsLoading,
    loadStores,
    loadEmployees,
    loadInventory,
    loadStoreStats,
    loadEmployeePerformance,
    handleAddStore,
    handleEditStore,
    handleDeleteStore,
    handleUpdateStoreStatus,
    confirmStore,
    handleAddEmployee,
    handleEditEmployee,
    handleDeleteEmployee,
    handleTransferEmployee,
    confirmTransfer,
    confirmEmployee,
    handleRestock,
    confirmRestock,
    handleTransferInventory,
    confirmTransferInventory,
    handleCheckInventory,
    confirmCheck,
    handleStoreSearch,
    resetStoreFilter,
    handleEmployeeSearch,
    resetEmployeeFilter,
    handleInventorySearch,
    resetInventoryFilter,
    handleStorePageChange,
    handleStorePageSizeChange,
    handleEmployeePageChange,
    handleEmployeePageSizeChange,
    handleInventoryPageChange,
    handleInventoryPageSizeChange,
    handleTabChange,
    formatNumber,
    formatDateTime,
    getStoreTypeName,
    getStoreStatusName,
    getStoreStatusType,
    getEmployeeStatusName,
    getEmployeeStatusType,
    getInventoryStatusName,
    getInventoryStatusType
  }
}
