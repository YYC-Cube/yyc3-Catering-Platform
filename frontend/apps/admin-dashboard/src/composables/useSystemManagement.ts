/**
 * @fileoverview 系统管理Composable
 * @description 管理系统管理功能的状态和逻辑
 * @module useSystemManagement
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 */

import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { systemManagementApi, type User, type Role, type Department, type AuditLog, type SystemSetting } from '@/api/system-management'

export function useSystemManagement() {
  const loading = ref(false)
  const activeTab = ref<'users' | 'roles' | 'departments' | 'settings' | 'audit-logs'>('users')

  const users = ref<User[]>([])
  const roles = ref<Role[]>([])
  const departments = ref<Department[]>([])
  const settings = ref<SystemSetting[]>([])
  const auditLogs = ref<AuditLog[]>([])

  const selectedUser = ref<User | null>(null)
  const selectedRole = ref<Role | null>(null)
  const selectedDepartment = ref<Department | null>(null)

  const showUserDialog = ref(false)
  const showRoleDialog = ref(false)
  const showDepartmentDialog = ref(false)
  const showSettingDialog = ref(false)

  const userDialogType = ref<'create' | 'edit'>('create')
  const roleDialogType = ref<'create' | 'edit'>('create')
  const departmentDialogType = ref<'create' | 'edit'>('create')

  const userForm = reactive({
    id: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    realName: '',
    roleIds: [] as string[],
    departmentId: ''
  })

  const roleForm = reactive({
    id: '',
    name: '',
    code: '',
    description: '',
    permissions: [] as string[]
  })

  const departmentForm = reactive({
    id: '',
    name: '',
    code: '',
    parentId: '',
    leaderId: '',
    description: '',
    sort: 0
  })

  const pagination = reactive({
    page: 1,
    pageSize: 20,
    total: 0
  })

  const filters = reactive({
    keyword: '',
    status: '',
    roleId: '',
    departmentId: '',
    startTime: '',
    endTime: ''
  })

  const statistics = ref<{
    users: { total: number; active: number; inactive: number; locked: number }
    roles: { total: number; active: number; inactive: number }
    departments: { total: number; active: number; inactive: number }
    permissions: { total: number; active: number; inactive: number }
  } | null>(null)

  const activeUsers = computed(() => users.value.filter(u => u.status === 'active'))
  const inactiveUsers = computed(() => users.value.filter(u => u.status === 'inactive'))
  const lockedUsers = computed(() => users.value.filter(u => u.status === 'locked'))

  const activeRoles = computed(() => roles.value.filter(r => r.status === 'active'))
  const inactiveRoles = computed(() => roles.value.filter(r => r.status === 'inactive'))

  const activeDepartments = computed(() => departments.value.filter(d => d.status === 'active'))
  const inactiveDepartments = computed(() => departments.value.filter(d => d.status === 'inactive'))

  const loadUsers = async () => {
    try {
      loading.value = true
      const response = await systemManagementApi.getUsers({
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: filters.keyword,
        status: filters.status,
        roleId: filters.roleId,
        departmentId: filters.departmentId
      })
      users.value = response.data.data
      pagination.total = response.data.total
    } catch (error) {
      ElMessage.error('加载用户列表失败')
      console.error('加载用户列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  const loadRoles = async () => {
    try {
      loading.value = true
      const response = await systemManagementApi.getRoles({
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: filters.keyword,
        status: filters.status
      })
      roles.value = response.data.data
      pagination.total = response.data.total
    } catch (error) {
      ElMessage.error('加载角色列表失败')
      console.error('加载角色列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  const loadDepartments = async () => {
    try {
      loading.value = true
      const response = await systemManagementApi.getDepartments({
        keyword: filters.keyword,
        status: filters.status
      })
      departments.value = response.data
    } catch (error) {
      ElMessage.error('加载部门列表失败')
      console.error('加载部门列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  const loadSettings = async () => {
    try {
      loading.value = true
      const response = await systemManagementApi.getSettings()
      settings.value = response.data
    } catch (error) {
      ElMessage.error('加载系统设置失败')
      console.error('加载系统设置失败:', error)
    } finally {
      loading.value = false
    }
  }

  const loadAuditLogs = async () => {
    try {
      loading.value = true
      const response = await systemManagementApi.getAuditLogs({
        page: pagination.page,
        pageSize: pagination.pageSize,
        userId: filters.keyword,
        action: filters.status,
        startTime: filters.startTime,
        endTime: filters.endTime
      })
      auditLogs.value = response.data.data
      pagination.total = response.data.total
    } catch (error) {
      ElMessage.error('加载审计日志失败')
      console.error('加载审计日志失败:', error)
    } finally {
      loading.value = false
    }
  }

  const loadStatistics = async () => {
    try {
      const response = await systemManagementApi.getSystemStatistics()
      statistics.value = response.data
    } catch (error) {
      ElMessage.error('加载统计数据失败')
      console.error('加载统计数据失败:', error)
    }
  }

  const handleAddUser = () => {
    userDialogType.value = 'create'
    Object.assign(userForm, {
      id: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      realName: '',
      roleIds: [],
      departmentId: ''
    })
    showUserDialog.value = true
  }

  const handleEditUser = (user: User) => {
    userDialogType.value = 'edit'
    Object.assign(userForm, {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      password: '',
      realName: user.realName,
      roleIds: user.roleIds,
      departmentId: user.departmentId || ''
    })
    selectedUser.value = user
    showUserDialog.value = true
  }

  const handleDeleteUser = async (user: User) => {
    try {
      await ElMessageBox.confirm(`确定要删除用户 ${user.realName} 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      await systemManagementApi.deleteUser(user.id)
      ElMessage.success('删除成功')
      await loadUsers()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
        console.error('删除失败:', error)
      }
    }
  }

  const handleResetPassword = async (user: User) => {
    try {
      const { value: newPassword } = await ElMessageBox.prompt('请输入新密码', '重置密码', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^.{6,20}$/,
        inputErrorMessage: '密码长度应为6-20位'
      })
      
      await systemManagementApi.resetPassword(user.id, newPassword)
      ElMessage.success('密码重置成功')
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('密码重置失败')
        console.error('密码重置失败:', error)
      }
    }
  }

  const handleLockUser = async (user: User) => {
    try {
      await systemManagementApi.lockUser(user.id)
      user.status = 'locked'
      ElMessage.success('用户已锁定')
    } catch (error) {
      ElMessage.error('锁定失败')
      console.error('锁定失败:', error)
    }
  }

  const handleUnlockUser = async (user: User) => {
    try {
      await systemManagementApi.unlockUser(user.id)
      user.status = 'active'
      ElMessage.success('用户已解锁')
    } catch (error) {
      ElMessage.error('解锁失败')
      console.error('解锁失败:', error)
    }
  }

  const confirmUser = async () => {
    try {
      if (userDialogType.value === 'create') {
        await systemManagementApi.createUser({
          username: userForm.username,
          email: userForm.email,
          phone: userForm.phone,
          password: userForm.password,
          realName: userForm.realName,
          roleIds: userForm.roleIds,
          departmentId: userForm.departmentId || undefined
        })
        ElMessage.success('创建成功')
      } else {
        await systemManagementApi.updateUser({
          id: userForm.id,
          username: userForm.username,
          email: userForm.email,
          phone: userForm.phone,
          password: userForm.password || undefined,
          realName: userForm.realName,
          roleIds: userForm.roleIds,
          departmentId: userForm.departmentId || undefined
        })
        ElMessage.success('更新成功')
      }
      
      showUserDialog.value = false
      await loadUsers()
    } catch (error) {
      ElMessage.error('操作失败')
      console.error('操作失败:', error)
    }
  }

  const handleAddRole = () => {
    roleDialogType.value = 'create'
    Object.assign(roleForm, {
      id: '',
      name: '',
      code: '',
      description: '',
      permissions: []
    })
    showRoleDialog.value = true
  }

  const handleEditRole = (role: Role) => {
    roleDialogType.value = 'edit'
    Object.assign(roleForm, {
      id: role.id,
      name: role.name,
      code: role.code,
      description: role.description || '',
      permissions: role.permissions
    })
    selectedRole.value = role
    showRoleDialog.value = true
  }

  const handleDeleteRole = async (role: Role) => {
    try {
      await ElMessageBox.confirm(`确定要删除角色 ${role.name} 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      await systemManagementApi.deleteRole(role.id)
      ElMessage.success('删除成功')
      await loadRoles()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
        console.error('删除失败:', error)
      }
    }
  }

  const confirmRole = async () => {
    try {
      if (roleDialogType.value === 'create') {
        await systemManagementApi.createRole({
          name: roleForm.name,
          code: roleForm.code,
          description: roleForm.description,
          permissions: roleForm.permissions
        })
        ElMessage.success('创建成功')
      } else {
        await systemManagementApi.updateRole({
          id: roleForm.id,
          name: roleForm.name,
          code: roleForm.code,
          description: roleForm.description,
          permissions: roleForm.permissions
        })
        ElMessage.success('更新成功')
      }
      
      showRoleDialog.value = false
      await loadRoles()
    } catch (error) {
      ElMessage.error('操作失败')
      console.error('操作失败:', error)
    }
  }

  const handleAddDepartment = () => {
    departmentDialogType.value = 'create'
    Object.assign(departmentForm, {
      id: '',
      name: '',
      code: '',
      parentId: '',
      leaderId: '',
      description: '',
      sort: 0
    })
    showDepartmentDialog.value = true
  }

  const handleEditDepartment = (department: Department) => {
    departmentDialogType.value = 'edit'
    Object.assign(departmentForm, {
      id: department.id,
      name: department.name,
      code: department.code,
      parentId: department.parentId || '',
      leaderId: department.leaderId || '',
      description: department.description || '',
      sort: department.sort
    })
    selectedDepartment.value = department
    showDepartmentDialog.value = true
  }

  const handleDeleteDepartment = async (department: Department) => {
    try {
      await ElMessageBox.confirm(`确定要删除部门 ${department.name} 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      await systemManagementApi.deleteDepartment(department.id)
      ElMessage.success('删除成功')
      await loadDepartments()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
        console.error('删除失败:', error)
      }
    }
  }

  const confirmDepartment = async () => {
    try {
      if (departmentDialogType.value === 'create') {
        await systemManagementApi.createDepartment({
          name: departmentForm.name,
          code: departmentForm.code,
          parentId: departmentForm.parentId || undefined,
          leaderId: departmentForm.leaderId || undefined,
          description: departmentForm.description,
          sort: departmentForm.sort
        })
        ElMessage.success('创建成功')
      } else {
        await systemManagementApi.updateDepartment({
          id: departmentForm.id,
          name: departmentForm.name,
          code: departmentForm.code,
          parentId: departmentForm.parentId || undefined,
          leaderId: departmentForm.leaderId || undefined,
          description: departmentForm.description,
          sort: departmentForm.sort
        })
        ElMessage.success('更新成功')
      }
      
      showDepartmentDialog.value = false
      await loadDepartments()
    } catch (error) {
      ElMessage.error('操作失败')
      console.error('操作失败:', error)
    }
  }

  const handleUpdateSetting = async (setting: SystemSetting, value: string) => {
    try {
      await systemManagementApi.updateSetting({
        key: setting.key,
        value
      })
      setting.value = value
      ElMessage.success('更新成功')
    } catch (error) {
      ElMessage.error('更新失败')
      console.error('更新失败:', error)
    }
  }

  const exportAuditLogs = async () => {
    try {
      const response = await systemManagementApi.exportAuditLogs({
        startTime: filters.startTime,
        endTime: filters.endTime
      })
      const blob = new Blob([response.data], { type: 'application/vnd.ms-excel' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `审计日志_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`
      link.click()
      ElMessage.success('导出成功')
    } catch (error) {
      ElMessage.error('导出失败')
      console.error('导出失败:', error)
    }
  }

  const handlePageChange = (page: number) => {
    pagination.page = page
    if (activeTab.value === 'users') loadUsers()
    else if (activeTab.value === 'roles') loadRoles()
    else if (activeTab.value === 'audit-logs') loadAuditLogs()
  }

  const handlePageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
    if (activeTab.value === 'users') loadUsers()
    else if (activeTab.value === 'roles') loadRoles()
    else if (activeTab.value === 'audit-logs') loadAuditLogs()
  }

  const handleSearch = () => {
    pagination.page = 1
    if (activeTab.value === 'users') loadUsers()
    else if (activeTab.value === 'roles') loadRoles()
    else if (activeTab.value === 'departments') loadDepartments()
    else if (activeTab.value === 'audit-logs') loadAuditLogs()
  }

  const handleReset = () => {
    Object.assign(filters, {
      keyword: '',
      status: '',
      roleId: '',
      departmentId: '',
      startTime: '',
      endTime: ''
    })
    pagination.page = 1
    if (activeTab.value === 'users') loadUsers()
    else if (activeTab.value === 'roles') loadRoles()
    else if (activeTab.value === 'departments') loadDepartments()
    else if (activeTab.value === 'audit-logs') loadAuditLogs()
  }

  const formatDate = (date: string): string => {
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
  }

  const getUserStatusType = (status: string): string => {
    const types: Record<string, string> = {
      active: 'success',
      inactive: 'info',
      locked: 'danger'
    }
    return types[status] || 'info'
  }

  const getRoleStatusType = (status: string): string => {
    const types: Record<string, string> = {
      active: 'success',
      inactive: 'info'
    }
    return types[status] || 'info'
  }

  const getDepartmentStatusType = (status: string): string => {
    const types: Record<string, string> = {
      active: 'success',
      inactive: 'info'
    }
    return types[status] || 'info'
  }

  const getAuditLogStatusType = (status: string): string => {
    const types: Record<string, string> = {
      success: 'success',
      failure: 'danger'
    }
    return types[status] || 'info'
  }

  return {
    loading,
    activeTab,
    users,
    roles,
    departments,
    settings,
    auditLogs,
    selectedUser,
    selectedRole,
    selectedDepartment,
    showUserDialog,
    showRoleDialog,
    showDepartmentDialog,
    showSettingDialog,
    userDialogType,
    roleDialogType,
    departmentDialogType,
    userForm,
    roleForm,
    departmentForm,
    pagination,
    filters,
    statistics,
    activeUsers,
    inactiveUsers,
    lockedUsers,
    activeRoles,
    inactiveRoles,
    activeDepartments,
    inactiveDepartments,
    loadUsers,
    loadRoles,
    loadDepartments,
    loadSettings,
    loadAuditLogs,
    loadStatistics,
    handleAddUser,
    handleEditUser,
    handleDeleteUser,
    handleResetPassword,
    handleLockUser,
    handleUnlockUser,
    confirmUser,
    handleAddRole,
    handleEditRole,
    handleDeleteRole,
    confirmRole,
    handleAddDepartment,
    handleEditDepartment,
    handleDeleteDepartment,
    confirmDepartment,
    handleUpdateSetting,
    exportAuditLogs,
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
    handleReset,
    formatDate,
    getUserStatusType,
    getRoleStatusType,
    getDepartmentStatusType,
    getAuditLogStatusType
  }
}
