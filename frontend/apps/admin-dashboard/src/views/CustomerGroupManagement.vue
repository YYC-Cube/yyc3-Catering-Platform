<template>
  <div class="customer-group-management">
    <el-card class="statistics-card">
      <div class="statistics-overview">
        <div class="stat-item">
          <div class="stat-value">{{ statistics.totalGroups || 0 }}</div>
          <div class="stat-label">总分群数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ statistics.manualGroups || 0 }}</div>
          <div class="stat-label">手动分群</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ statistics.autoGroups || 0 }}</div>
          <div class="stat-label">自动分群</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ statistics.totalMembers || 0 }}</div>
          <div class="stat-label">总成员数</div>
        </div>
      </div>
    </el-card>

    <el-card class="filter-card">
      <el-form :model="filters" inline>
        <el-form-item label="分群名称">
          <el-input v-model="filters.name" placeholder="请输入分群名称" clearable />
        </el-form-item>
        <el-form-item label="分群类型">
          <el-select v-model="filters.groupType" placeholder="请选择分群类型" clearable>
            <el-option label="全部" value="" />
            <el-option label="手动分群" value="manual" />
            <el-option label="自动分群" value="auto" />
            <el-option label="RFM分群" value="rfm" />
            <el-option label="生命周期分群" value="lifecycle" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.enabled" placeholder="请选择状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="启用" value="true" />
            <el-option label="禁用" value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新建分群
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="groupList" stripe v-loading="loading" border>
        <el-table-column prop="name" label="分群名称" width="180" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column label="分群类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getGroupTypeTag(row.groupType)" size="small">
              {{ getGroupTypeText(row.groupType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="memberCount" label="成员数量" width="100" />
        <el-table-column prop="priority" label="优先级" width="80" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'" size="small">
              {{ row.enabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleViewMembers(row)">
              查看成员
            </el-button>
            <el-button type="warning" link size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="success" link size="small" @click="handleToggleStatus(row)">
              {{ row.enabled ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="groupDialogVisible" :title="isEdit ? '编辑分群' : '新建分群'" width="600px">
      <el-form :model="groupForm" :rules="groupRules" ref="groupFormRef" label-width="100px">
        <el-form-item label="分群名称" prop="name">
          <el-input v-model="groupForm.name" placeholder="请输入分群名称" />
        </el-form-item>
        <el-form-item label="分群类型" prop="groupType">
          <el-select v-model="groupForm.groupType" placeholder="请选择分群类型" :disabled="isEdit">
            <el-option label="手动分群" value="manual" />
            <el-option label="自动分群" value="auto" />
            <el-option label="RFM分群" value="rfm" />
            <el-option label="生命周期分群" value="lifecycle" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="groupForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分群描述"
          />
        </el-form-item>
        <el-form-item label="显示颜色" prop="color">
          <el-color-picker v-model="groupForm.color" />
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-input-number v-model="groupForm.priority" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-switch v-model="groupForm.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="groupDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleGroupSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="membersDialogVisible" title="分群成员管理" width="900px">
      <div class="members-header">
        <div class="group-info">
          <span class="group-name">{{ currentGroup.name }}</span>
          <el-tag :type="getGroupTypeTag(currentGroup.groupType)" size="small">
            {{ getGroupTypeText(currentGroup.groupType) }}
          </el-tag>
          <span class="member-count">成员数：{{ membersPagination.total }}</span>
        </div>
        <div class="members-actions">
          <el-button type="primary" @click="handleAddMembers">
            <el-icon><Plus /></el-icon>
            添加成员
          </el-button>
          <el-button type="danger" @click="handleRemoveMembers" :disabled="selectedMembers.length === 0">
            <el-icon><Delete /></el-icon>
            批量移除
          </el-button>
        </div>
      </div>

      <el-table
        :data="membersList"
        stripe
        v-loading="membersLoading"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="customerName" label="客户姓名" width="120" />
        <el-table-column prop="customerPhone" label="手机号" width="130" />
        <el-table-column prop="addedBy" label="添加人" width="100" />
        <el-table-column prop="addedAt" label="添加时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.addedAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="添加原因" show-overflow-tooltip />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="danger" link size="small" @click="handleRemoveMember(row)">
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="membersPagination.page"
          v-model:page-size="membersPagination.size"
          :total="membersPagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleMembersSizeChange"
          @current-change="handleMembersPageChange"
        />
      </div>
    </el-dialog>

    <el-dialog v-model="addMembersDialogVisible" title="添加客户到分群" width="800px">
      <div class="add-members-search">
        <el-input
          v-model="memberSearchKeyword"
          placeholder="请输入客户姓名或手机号"
          clearable
          @input="handleMemberSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <el-table
        :data="availableCustomers"
        stripe
        v-loading="availableCustomersLoading"
        border
        max-height="400"
        @selection-change="handleAvailableSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="客户姓名" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="totalSpent" label="累计消费" width="120">
          <template #default="{ row }">
            ¥{{ row.totalSpent?.toFixed(2) || '0.00' }}
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <el-button @click="addMembersDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="handleAddMembersSubmit"
          :loading="addMembersSubmitting"
          :disabled="selectedAvailableCustomers.length === 0"
        >
          确定（已选择{{ selectedAvailableCustomers.length }}人）
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Search } from '@element-plus/icons-vue'
import {
  getCustomerGroups,
  getCustomerGroupDetail,
  createCustomerGroup,
  updateCustomerGroup,
  deleteCustomerGroup,
  getCustomerGroupMembers,
  addCustomerToGroup,
  removeCustomerFromGroup,
  getCustomerGroupStatistics
} from '@/api/customer'
import type { CustomerGroup, CustomerGroupMember } from '@/api/customer'

const loading = ref(false)
const membersLoading = ref(false)
const availableCustomersLoading = ref(false)
const submitting = ref(false)
const addMembersSubmitting = ref(false)

const groupDialogVisible = ref(false)
const membersDialogVisible = ref(false)
const addMembersDialogVisible = ref(false)

const isEdit = ref(false)
const groupFormRef = ref()

const statistics = reactive({
  totalGroups: 0,
  manualGroups: 0,
  autoGroups: 0,
  rfmGroups: 0,
  lifecycleGroups: 0,
  totalMembers: 0,
  avgMembersPerGroup: 0
})

const filters = reactive({
  name: '',
  groupType: '',
  enabled: ''
})

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const membersPagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const groupList = ref<CustomerGroup[]>([])
const membersList = ref<CustomerGroupMember[]>([])
const selectedMembers = ref<CustomerGroupMember[]>([])
const availableCustomers = ref<any[]>([])
const selectedAvailableCustomers = ref<any[]>([])
const currentGroup = reactive({
  id: '',
  name: '',
  groupType: ''
})

const memberSearchKeyword = ref('')

const groupForm = reactive({
  id: '',
  name: '',
  description: '',
  groupType: '',
  color: '#409EFF',
  priority: 0,
  enabled: true
})

const groupRules = {
  name: [
    { required: true, message: '请输入分群名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  groupType: [
    { required: true, message: '请选择分群类型', trigger: 'change' }
  ],
  description: [
    { max: 200, message: '描述最多200个字符', trigger: 'blur' }
  ]
}

const getGroupTypeTag = (type: string) => {
  const typeMap: Record<string, any> = {
    manual: 'primary',
    auto: 'success',
    rfm: 'warning',
    lifecycle: 'info'
  }
  return typeMap[type] || ''
}

const getGroupTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    manual: '手动分群',
    auto: '自动分群',
    rfm: 'RFM分群',
    lifecycle: '生命周期分群'
  }
  return textMap[type] || type
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const loadStatistics = async () => {
  try {
    const data = await getCustomerGroupStatistics()
    Object.assign(statistics, data)
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const loadGroupList = async () => {
  loading.value = true
  try {
    const params = {
      name: filters.name,
      groupType: filters.groupType,
      enabled: filters.enabled === '' ? undefined : filters.enabled === 'true',
      page: pagination.page,
      size: pagination.size
    }

    const result = await getCustomerGroups(params)
    groupList.value = result.data || []
    pagination.total = result.total || 0
  } catch (error) {
    ElMessage.error('加载分群列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const loadMembersList = async () => {
  membersLoading.value = true
  try {
    const result = await getCustomerGroupMembers(currentGroup.id, {
      page: membersPagination.page,
      size: membersPagination.size
    })
    membersList.value = result.data || []
    membersPagination.total = result.total || 0
  } catch (error) {
    ElMessage.error('加载成员列表失败')
    console.error(error)
  } finally {
    membersLoading.value = false
  }
}

const refreshData = () => {
  loadStatistics()
  loadGroupList()
}

const handleSearch = () => {
  pagination.page = 1
  loadGroupList()
}

const handleReset = () => {
  filters.name = ''
  filters.groupType = ''
  filters.enabled = ''
  pagination.page = 1
  loadGroupList()
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  loadGroupList()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadGroupList()
}

const handleCreate = () => {
  isEdit.value = false
  Object.assign(groupForm, {
    id: '',
    name: '',
    description: '',
    groupType: '',
    color: '#409EFF',
    priority: 0,
    enabled: true
  })
  groupDialogVisible.value = true
}

const handleEdit = async (row: CustomerGroup) => {
  isEdit.value = true
  try {
    const data = await getCustomerGroupDetail(row.id)
    Object.assign(groupForm, data)
    groupDialogVisible.value = true
  } catch (error) {
    ElMessage.error('加载分群详情失败')
    console.error(error)
  }
}

const handleGroupSubmit = async () => {
  if (!groupFormRef.value) return

  try {
    await groupFormRef.value.validate()
    submitting.value = true

    if (isEdit.value) {
      await updateCustomerGroup(groupForm.id, groupForm)
      ElMessage.success('分群更新成功')
    } else {
      await createCustomerGroup(groupForm)
      ElMessage.success('分群创建成功')
    }

    groupDialogVisible.value = false
    refreshData()
  } catch (error: any) {
    if (error !== false) {
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    submitting.value = false
  }
}

const handleToggleStatus = async (row: CustomerGroup) => {
  try {
    await ElMessageBox.confirm(
      `确定要${row.enabled ? '禁用' : '启用'}该分群吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await updateCustomerGroup(row.id, { enabled: !row.enabled })
    ElMessage.success('状态更新成功')
    refreshData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('状态更新失败')
      console.error(error)
    }
  }
}

const handleDelete = async (row: CustomerGroup) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除分群"${row.name}"吗？删除后无法恢复！`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteCustomerGroup(row.id)
    ElMessage.success('分群删除成功')
    refreshData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('分群删除失败')
      console.error(error)
    }
  }
}

const handleViewMembers = async (row: CustomerGroup) => {
  currentGroup.id = row.id
  currentGroup.name = row.name
  currentGroup.groupType = row.groupType
  membersPagination.page = 1
  await loadMembersList()
  membersDialogVisible.value = true
}

const handleSelectionChange = (selection: CustomerGroupMember[]) => {
  selectedMembers.value = selection
}

const handleMembersSizeChange = (size: number) => {
  membersPagination.size = size
  membersPagination.page = 1
  loadMembersList()
}

const handleMembersPageChange = (page: number) => {
  membersPagination.page = page
  loadMembersList()
}

const handleRemoveMember = async (row: CustomerGroupMember) => {
  try {
    await ElMessageBox.confirm(
      '确定要移除该客户吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await removeCustomerFromGroup(currentGroup.id, row.customerId)
    ElMessage.success('移除成功')
    loadMembersList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('移除失败')
      console.error(error)
    }
  }
}

const handleRemoveMembers = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要移除选中的${selectedMembers.value.length}个客户吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const customerIds = selectedMembers.value.map(m => m.customerId)
    await removeCustomerFromGroup(currentGroup.id, customerIds[0])
    ElMessage.success('批量移除成功')
    loadMembersList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量移除失败')
      console.error(error)
    }
  }
}

const handleAddMembers = () => {
  memberSearchKeyword.value = ''
  selectedAvailableCustomers.value = []
  availableCustomers.value = []
  addMembersDialogVisible.value = true
}

const handleMemberSearch = async () => {
  if (!memberSearchKeyword.value) {
    availableCustomers.value = []
    return
  }

  availableCustomersLoading.value = true
  try {
    availableCustomers.value = []
  } catch (error) {
    console.error(error)
  } finally {
    availableCustomersLoading.value = false
  }
}

const handleAvailableSelectionChange = (selection: any[]) => {
  selectedAvailableCustomers.value = selection
}

const handleAddMembersSubmit = async () => {
  if (selectedAvailableCustomers.value.length === 0) {
    ElMessage.warning('请选择要添加的客户')
    return
  }

  addMembersSubmitting.value = true
  try {
    const customerIds = selectedAvailableCustomers.value.map(c => c.id)
    await addCustomerToGroup(currentGroup.id, customerIds)
    ElMessage.success('添加成功')
    addMembersDialogVisible.value = false
    loadMembersList()
  } catch (error) {
    ElMessage.error('添加失败')
    console.error(error)
  } finally {
    addMembersSubmitting.value = false
  }
}

onMounted(() => {
  loadStatistics()
  loadGroupList()
})
</script>

<style scoped lang="scss">
.customer-group-management {
  padding: 20px;

  .statistics-card,
  .filter-card,
  .table-card {
    margin-bottom: 20px;
  }

  .statistics-overview {
    display: flex;
    justify-content: space-around;
    padding: 20px 0;

    .stat-item {
      text-align: center;

      .stat-value {
        font-size: 32px;
        font-weight: 600;
        color: #409eff;
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }

  .members-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #ebeef5;

    .group-info {
      display: flex;
      align-items: center;
      gap: 15px;

      .group-name {
        font-size: 16px;
        font-weight: 600;
      }

      .member-count {
        color: #909399;
        font-size: 14px;
      }
    }

    .members-actions {
      display: flex;
      gap: 10px;
    }
  }

  .add-members-search {
    margin-bottom: 20px;
  }
}
</style>
