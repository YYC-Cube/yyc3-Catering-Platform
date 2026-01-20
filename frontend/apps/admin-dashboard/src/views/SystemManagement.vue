<!--
 YYC³餐饮管理系统 - 系统管理组件
 依托: YYC³系统色设计令牌
-->
<template>
  <div class="system-management">
    <div class="management-header">
      <div class="header-left">
        <h2 class="management-title">系统管理</h2>
        <div class="management-info">
          <el-tag type="success" size="small">
            <el-icon><User /></el-icon>
            用户: {{ statistics?.users.total || 0 }}
          </el-tag>
          <el-tag type="primary" size="small">
            <el-icon><UserFilled /></el-icon>
            角色: {{ statistics?.roles.total || 0 }}
          </el-tag>
          <el-tag type="warning" size="small">
            <el-icon><OfficeBuilding /></el-icon>
            部门: {{ statistics?.departments.total || 0 }}
          </el-tag>
        </div>
      </div>
      <div class="header-right">
        <el-button-group>
          <el-button 
            :type="activeTab === 'users' ? 'primary' : 'default'" 
            @click="activeTab = 'users'"
          >
            <el-icon><User /></el-icon>
            用户管理
          </el-button>
          <el-button 
            :type="activeTab === 'roles' ? 'primary' : 'default'" 
            @click="activeTab = 'roles'"
          >
            <el-icon><UserFilled /></el-icon>
            角色管理
          </el-button>
          <el-button 
            :type="activeTab === 'departments' ? 'primary' : 'default'" 
            @click="activeTab = 'departments'"
          >
            <el-icon><OfficeBuilding /></el-icon>
            部门管理
          </el-button>
          <el-button 
            :type="activeTab === 'settings' ? 'primary' : 'default'" 
            @click="activeTab = 'settings'"
          >
            <el-icon><Tools /></el-icon>
            系统设置
          </el-button>
          <el-button 
            :type="activeTab === 'audit-logs' ? 'primary' : 'default'" 
            @click="activeTab = 'audit-logs'"
          >
            <el-icon><Document /></el-icon>
            审计日志
          </el-button>
        </el-button-group>
      </div>
    </div>

    <div v-if="activeTab === 'users'" class="users-view">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>用户管理</span>
            <el-button type="primary" @click="handleAddUser">
              <el-icon><Plus /></el-icon>
              新增用户
            </el-button>
          </div>
        </template>
        
        <div class="toolbar">
          <div class="toolbar-left">
            <el-input
              v-model="filters.keyword"
              placeholder="搜索用户名/姓名/邮箱..."
              clearable
              style="width: 300px;"
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            
            <el-select
              v-model="filters.status"
              placeholder="用户状态"
              clearable
              style="width: 150px; margin-left: 10px;"
              @change="handleSearch"
            >
              <el-option label="活跃" value="active" />
              <el-option label="未激活" value="inactive" />
              <el-option label="锁定" value="locked" />
            </el-select>
            
            <el-select
              v-model="filters.roleId"
              placeholder="角色"
              clearable
              style="width: 150px; margin-left: 10px;"
              @change="handleSearch"
            >
              <el-option 
                v-for="role in roles" 
                :key="role.id" 
                :label="role.name" 
                :value="role.id" 
              />
            </el-select>
            
            <el-select
              v-model="filters.departmentId"
              placeholder="部门"
              clearable
              style="width: 150px; margin-left: 10px;"
              @change="handleSearch"
            >
              <el-option 
                v-for="department in departments" 
                :key="department.id" 
                :label="department.name" 
                :value="department.id" 
              />
            </el-select>
          </div>
          
          <div class="toolbar-right">
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </div>
        </div>
        
        <el-table :data="users" :loading="loading" border>
          <el-table-column prop="username" label="用户名" />
          <el-table-column prop="realName" label="真实姓名" />
          <el-table-column prop="email" label="邮箱" />
          <el-table-column prop="phone" label="手机号" />
          <el-table-column prop="departmentId" label="部门">
            <template #default="{ row }">
              {{ getDepartmentName(row.departmentId) }}
            </template>
          </el-table-column>
          <el-table-column prop="roleIds" label="角色">
            <template #default="{ row }">
              <el-tag 
                v-for="roleId in row.roleIds" 
                :key="roleId" 
                size="small" 
                style="margin-right: 5px;"
              >
                {{ getRoleName(roleId) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag :type="getUserStatusType(row.status)" size="small">
                {{ getUserStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="lastLoginAt" label="最后登录">
            <template #default="{ row }">
              {{ formatDate(row.lastLoginAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleEditUser(row)">
                编辑
              </el-button>
              <el-button 
                v-if="row.status !== 'locked'" 
                type="warning" 
                size="small" 
                @click="handleLockUser(row)"
              >
                锁定
              </el-button>
              <el-button 
                v-if="row.status === 'locked'" 
                type="success" 
                size="small" 
                @click="handleUnlockUser(row)"
              >
                解锁
              </el-button>
              <el-button type="info" size="small" @click="handleResetPassword(row)">
                重置密码
              </el-button>
              <el-button type="danger" size="small" @click="handleDeleteUser(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handlePageSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
    </div>

    <div v-if="activeTab === 'roles'" class="roles-view">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>角色管理</span>
            <el-button type="primary" @click="handleAddRole">
              <el-icon><Plus /></el-icon>
              新增角色
            </el-button>
          </div>
        </template>
        
        <div class="toolbar">
          <div class="toolbar-left">
            <el-input
              v-model="filters.keyword"
              placeholder="搜索角色名/编码..."
              clearable
              style="width: 300px;"
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            
            <el-select
              v-model="filters.status"
              placeholder="角色状态"
              clearable
              style="width: 150px; margin-left: 10px;"
              @change="handleSearch"
            >
              <el-option label="活跃" value="active" />
              <el-option label="未激活" value="inactive" />
            </el-select>
          </div>
          
          <div class="toolbar-right">
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </div>
        </div>
        
        <el-table :data="roles" :loading="loading" border>
          <el-table-column prop="name" label="角色名称" />
          <el-table-column prop="code" label="角色编码" />
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag :type="getRoleStatusType(row.status)" size="small">
                {{ getRoleStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleEditRole(row)">
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDeleteRole(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handlePageSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
    </div>

    <div v-if="activeTab === 'departments'" class="departments-view">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>部门管理</span>
            <el-button type="primary" @click="handleAddDepartment">
              <el-icon><Plus /></el-icon>
              新增部门
            </el-button>
          </div>
        </template>
        
        <div class="toolbar">
          <div class="toolbar-left">
            <el-input
              v-model="filters.keyword"
              placeholder="搜索部门名/编码..."
              clearable
              style="width: 300px;"
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            
            <el-select
              v-model="filters.status"
              placeholder="部门状态"
              clearable
              style="width: 150px; margin-left: 10px;"
              @change="handleSearch"
            >
              <el-option label="活跃" value="active" />
              <el-option label="未激活" value="inactive" />
            </el-select>
          </div>
          
          <div class="toolbar-right">
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </div>
        </div>
        
        <el-table :data="departments" :loading="loading" border>
          <el-table-column prop="name" label="部门名称" />
          <el-table-column prop="code" label="部门编码" />
          <el-table-column prop="parentId" label="上级部门">
            <template #default="{ row }">
              {{ getDepartmentName(row.parentId) }}
            </template>
          </el-table-column>
          <el-table-column prop="leaderId" label="部门负责人">
            <template #default="{ row }">
              {{ getUserName(row.leaderId) }}
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag :type="getDepartmentStatusType(row.status)" size="small">
                {{ getDepartmentStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleEditDepartment(row)">
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDeleteDepartment(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <div v-if="activeTab === 'settings'" class="settings-view">
      <el-card>
        <template #header>
          <span>系统设置</span>
        </template>
        
        <el-table :data="settings" :loading="loading" border>
          <el-table-column prop="key" label="设置项" />
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="value" label="值">
            <template #default="{ row }">
              <el-input
                v-if="row.type === 'string'"
                v-model="row.value"
                @change="handleUpdateSetting(row, row.value)"
              />
              <el-input-number
                v-else-if="row.type === 'number'"
                v-model="row.value"
                @change="handleUpdateSetting(row, row.value.toString())"
              />
              <el-switch
                v-else-if="row.type === 'boolean'"
                v-model="row.value"
                @change="handleUpdateSetting(row, row.value.toString())"
              />
              <el-input
                v-else-if="row.type === 'json'"
                v-model="row.value"
                type="textarea"
                :rows="3"
                @change="handleUpdateSetting(row, row.value)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="category" label="分类" />
          <el-table-column prop="updatedAt" label="更新时间">
            <template #default="{ row }">
              {{ formatDate(row.updatedAt) }}
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <div v-if="activeTab === 'audit-logs'" class="audit-logs-view">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>审计日志</span>
            <el-button type="primary" @click="exportAuditLogs">
              <el-icon><Download /></el-icon>
              导出日志
            </el-button>
          </div>
        </template>
        
        <div class="toolbar">
          <div class="toolbar-left">
            <el-input
              v-model="filters.keyword"
              placeholder="搜索用户名..."
              clearable
              style="width: 300px;"
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            
            <el-select
              v-model="filters.status"
              placeholder="操作状态"
              clearable
              style="width: 150px; margin-left: 10px;"
              @change="handleSearch"
            >
              <el-option label="成功" value="success" />
              <el-option label="失败" value="failure" />
            </el-select>
            
            <el-date-picker
              v-model="dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              style="margin-left: 10px;"
              @change="handleDateRangeChange"
            />
          </div>
          
          <div class="toolbar-right">
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </div>
        </div>
        
        <el-table :data="auditLogs" :loading="loading" border>
          <el-table-column prop="username" label="用户名" />
          <el-table-column prop="action" label="操作" />
          <el-table-column prop="module" label="模块" />
          <el-table-column prop="resource" label="资源" />
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag :type="getAuditLogStatusType(row.status)" size="small">
                {{ getAuditLogStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="ip" label="IP地址" />
          <el-table-column prop="createdAt" label="操作时间">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handlePageSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 用户对话框 -->
    <el-dialog
      v-model="showUserDialog"
      :title="userDialogType === 'create' ? '新增用户' : '编辑用户'"
      width="600px"
    >
      <el-form :model="userForm" label-width="100px">
        <el-form-item label="用户名" required>
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="真实姓名" required>
          <el-input v-model="userForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="邮箱" required>
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" required>
          <el-input v-model="userForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="密码" :required="userDialogType === 'create'">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="userForm.departmentId" placeholder="请选择部门">
            <el-option 
              v-for="department in departments" 
              :key="department.id" 
              :label="department.name" 
              :value="department.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" required>
          <el-select v-model="userForm.roleIds" multiple placeholder="请选择角色">
            <el-option 
              v-for="role in roles" 
              :key="role.id" 
              :label="role.name" 
              :value="role.id" 
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUserDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmUser">确认</el-button>
      </template>
    </el-dialog>

    <!-- 角色对话框 -->
    <el-dialog
      v-model="showRoleDialog"
      :title="roleDialogType === 'create' ? '新增角色' : '编辑角色'"
      width="600px"
    >
      <el-form :model="roleForm" label-width="100px">
        <el-form-item label="角色名称" required>
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" required>
          <el-input v-model="roleForm.code" placeholder="请输入角色编码" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="roleForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="权限">
          <el-tree
            :data="permissionTree"
            :props="{ children: 'children', label: 'name' }"
            show-checkbox
            node-key="id"
            v-model="roleForm.permissions"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRoleDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmRole">确认</el-button>
      </template>
    </el-dialog>

    <!-- 部门对话框 -->
    <el-dialog
      v-model="showDepartmentDialog"
      :title="departmentDialogType === 'create' ? '新增部门' : '编辑部门'"
      width="600px"
    >
      <el-form :model="departmentForm" label-width="100px">
        <el-form-item label="部门名称" required>
          <el-input v-model="departmentForm.name" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="部门编码" required>
          <el-input v-model="departmentForm.code" placeholder="请输入部门编码" />
        </el-form-item>
        <el-form-item label="上级部门">
          <el-select v-model="departmentForm.parentId" placeholder="请选择上级部门">
            <el-option 
              v-for="department in departments" 
              :key="department.id" 
              :label="department.name" 
              :value="department.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="部门负责人">
          <el-select v-model="departmentForm.leaderId" placeholder="请选择部门负责人">
            <el-option 
              v-for="user in users" 
              :key="user.id" 
              :label="user.realName" 
              :value="user.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="departmentForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="departmentForm.sort" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDepartmentDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmDepartment">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  User, 
  UserFilled, 
  OfficeBuilding, 
  Tools, 
  Document, 
  Plus, 
  Search, 
  Refresh, 
  Download 
} from '@element-plus/icons-vue'
import { useSystemManagement } from '@/composables/useSystemManagement'
import { systemManagementApi } from '@/api/system-management'

const {
  loading,
  activeTab,
  users,
  roles,
  departments,
  settings,
  auditLogs,
  showUserDialog,
  showRoleDialog,
  showDepartmentDialog,
  userDialogType,
  roleDialogType,
  departmentDialogType,
  userForm,
  roleForm,
  departmentForm,
  pagination,
  filters,
  statistics,
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
} = useSystemManagement()

const dateRange = ref<[Date, Date] | null>(null)
const permissionTree = ref<any[]>([])

const getDepartmentName = (departmentId?: string): string => {
  if (!departmentId) return '-'
  const department = departments.value.find(d => d.id === departmentId)
  return department ? department.name : '-'
}

const getRoleName = (roleId: string): string => {
  const role = roles.value.find(r => r.id === roleId)
  return role ? role.name : '-'
}

const getUserName = (userId?: string): string => {
  if (!userId) return '-'
  const user = users.value.find(u => u.id === userId)
  return user ? user.realName : '-'
}

const getUserStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    active: '活跃',
    inactive: '未激活',
    locked: '锁定'
  }
  return labels[status] || status
}

const getRoleStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    active: '活跃',
    inactive: '未激活'
  }
  return labels[status] || status
}

const getDepartmentStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    active: '活跃',
    inactive: '未激活'
  }
  return labels[status] || status
}

const getAuditLogStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    success: '成功',
    failure: '失败'
  }
  return labels[status] || status
}

const handleDateRangeChange = () => {
  if (dateRange.value) {
    filters.startTime = dateRange.value[0].toISOString()
    filters.endTime = dateRange.value[1].toISOString()
  } else {
    filters.startTime = ''
    filters.endTime = ''
  }
  handleSearch()
}

const loadPermissionTree = async () => {
  try {
    const response = await systemManagementApi.getPermissionTree()
    permissionTree.value = response.data
  } catch (error) {
    console.error('加载权限树失败:', error)
  }
}

onMounted(() => {
  loadUsers()
  loadRoles()
  loadDepartments()
  loadSettings()
  loadAuditLogs()
  loadStatistics()
  loadPermissionTree()
})
</script>

<style scoped lang="scss">
.system-management {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;

    .management-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }

    .management-info {
      display: flex;
      gap: 10px;
    }
  }

  .header-right {
    display: flex;
    gap: 10px;
  }
}

.users-view,
.roles-view,
.departments-view,
.settings-view,
.audit-logs-view {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px 0;

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .toolbar-right {
    display: flex;
    gap: 10px;
  }
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

@media (max-width: 768px) {
  .management-header {
    flex-direction: column;
    align-items: flex-start;

    .header-left,
    .header-right {
      width: 100%;
      justify-content: center;
    }

    .management-info {
      flex-wrap: wrap;
    }
  }

  .toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;

    .toolbar-left,
    .toolbar-right {
      width: 100%;
      justify-content: center;
    }
  }
}
</style>
