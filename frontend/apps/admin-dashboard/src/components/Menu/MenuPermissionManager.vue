<template>
  <div class="menu-permission-manager">
    <el-card class="permission-card">
      <template #header>
        <div class="card-header">
          <span>菜单权限管理</span>
          <el-button type="primary" size="small" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            添加权限规则
          </el-button>
        </div>
      </template>

      <div class="permission-content">
        <div class="role-section">
          <h3>角色列表</h3>
          <el-radio-group v-model="selectedRole" direction="vertical" @change="handleRoleChange">
            <el-radio
              v-for="role in roles"
              :key="role.id"
              :label="role.id"
              border
              class="role-radio"
            >
              <div class="role-info">
                <span class="role-name">{{ role.name }}</span>
                <el-tag size="small" :type="role.type === 'admin' ? 'danger' : 'primary'">
                  {{ role.type === 'admin' ? '管理员' : '普通' }}
                </el-tag>
              </div>
            </el-radio>
          </el-radio-group>
        </div>

        <div class="permission-section">
          <h3>权限配置</h3>
          <div v-if="selectedRole" class="permission-config">
            <el-alert
              :title="`配置角色: ${getRoleName(selectedRole)} 的菜单访问权限`"
              type="info"
              :closable="false"
              style="margin-bottom: $spacing-4"
            />

            <div class="permission-groups">
              <div v-for="group in permissionGroups" :key="group.key" class="permission-group">
                <div class="group-header">
                  <el-checkbox
                    v-model="group.checked"
                    :indeterminate="group.indeterminate"
                    @change="handleGroupCheck(group)"
                  >
                    {{ group.label }}
                  </el-checkbox>
                  <el-button
                    size="small"
                    link
                    type="primary"
                    @click="expandGroup(group)"
                  >
                    {{ group.expanded ? '收起' : '展开' }}
                  </el-button>
                </div>
                <div v-show="group.expanded" class="group-permissions">
                  <el-checkbox-group v-model="selectedPermissions" @change="handlePermissionChange">
                    <el-checkbox
                      v-for="permission in group.permissions"
                      :key="permission.key"
                      :label="permission.key"
                    >
                      <div class="permission-item">
                        <span class="permission-label">{{ permission.label }}</span>
                        <el-tag size="small" :type="permission.level === 'read' ? 'info' : 'warning'">
                          {{ permission.level === 'read' ? '只读' : '读写' }}
                        </el-tag>
                      </div>
                    </el-checkbox>
                  </el-checkbox-group>
                </div>
              </div>
            </div>

            <div class="permission-actions">
              <el-button type="primary" @click="savePermissions" :loading="saving">
                <el-icon><Check /></el-icon>
                保存配置
              </el-button>
              <el-button @click="resetPermissions">
                <el-icon><RefreshLeft /></el-icon>
                重置
              </el-button>
            </div>
          </div>
          <div v-else class="empty-permission">
            <el-empty description="请选择角色查看权限配置" />
          </div>
        </div>
      </div>
    </el-card>

    <el-dialog
      v-model="showCreateDialog"
      title="添加权限规则"
      width="600px"
      @closed="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="formData.roleId" placeholder="请选择角色">
            <el-option
              v-for="role in roles"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="菜单分类" prop="categoryId">
          <el-tree-select
            v-model="formData.categoryId"
            :data="categoryTree"
            :props="{ label: 'name', value: 'id' }"
            placeholder="请选择菜单分类"
            check-strictly
            clearable
          />
        </el-form-item>
        <el-form-item label="权限级别" prop="permissionLevel">
          <el-radio-group v-model="formData.permissionLevel">
            <el-radio label="read">只读</el-radio>
            <el-radio label="write">读写</el-radio>
            <el-radio label="full">完全控制</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="操作权限">
          <el-checkbox-group v-model="formData.actions">
            <el-checkbox label="view">查看</el-checkbox>
            <el-checkbox label="create">创建</el-checkbox>
            <el-checkbox label="edit">编辑</el-checkbox>
            <el-checkbox label="delete">删除</el-checkbox>
            <el-checkbox label="export">导出</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          创建
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Plus,
  Check,
  RefreshLeft
} from '@element-plus/icons-vue'

interface Role {
  id: number
  name: string
  type: 'admin' | 'normal'
  description?: string
}

interface PermissionGroup {
  key: string
  label: string
  checked: boolean
  indeterminate: boolean
  expanded: boolean
  permissions: Permission[]
}

interface Permission {
  key: string
  label: string
  level: 'read' | 'write'
  description?: string
}

interface CategoryTree {
  id: number
  name: string
  children?: CategoryTree[]
}

const formRef = ref()
const showCreateDialog = ref(false)
const submitting = ref(false)
const saving = ref(false)
const selectedRole = ref<number | null>(null)
const selectedPermissions = ref<string[]>([])

const roles = ref<Role[]>([
  {
    id: 1,
    name: '超级管理员',
    type: 'admin',
    description: '拥有所有权限'
  },
  {
    id: 2,
    name: '店长',
    type: 'admin',
    description: '管理店铺日常运营'
  },
  {
    id: 3,
    name: '厨师长',
    type: 'normal',
    description: '管理厨房菜品'
  },
  {
    id: 4,
    name: '服务员',
    type: 'normal',
    description: '处理订单和客户服务'
  },
  {
    id: 5,
    name: '收银员',
    type: 'normal',
    description: '处理收款和账单'
  }
])

const categoryTree = ref<CategoryTree[]>([
  {
    id: 1,
    name: '主食',
    children: [
      { id: 11, name: '米饭类' },
      { id: 12, name: '面食类' }
    ]
  },
  {
    id: 2,
    name: '汤品',
    children: [
      { id: 21, name: '清汤' },
      { id: 22, name: '浓汤' }
    ]
  },
  {
    id: 3,
    name: '小菜' },
  {
    id: 4,
    name: '饮料' },
  {
    id: 5,
    name: '甜点' }
])

const permissionGroups = ref<PermissionGroup[]>([
  {
    key: 'menu',
    label: '菜单管理',
    checked: false,
    indeterminate: false,
    expanded: true,
    permissions: [
      { key: 'menu.view', label: '查看菜单', level: 'read' },
      { key: 'menu.create', label: '创建菜品', level: 'write' },
      { key: 'menu.edit', label: '编辑菜品', level: 'write' },
      { key: 'menu.delete', label: '删除菜品', level: 'write' },
      { key: 'menu.export', label: '导出菜单', level: 'read' }
    ]
  },
  {
    key: 'category',
    label: '分类管理',
    checked: false,
    indeterminate: false,
    expanded: true,
    permissions: [
      { key: 'category.view', label: '查看分类', level: 'read' },
      { key: 'category.create', label: '创建分类', level: 'write' },
      { key: 'category.edit', label: '编辑分类', level: 'write' },
      { key: 'category.delete', label: '删除分类', level: 'write' }
    ]
  },
  {
    key: 'price',
    label: '价格管理',
    checked: false,
    indeterminate: false,
    expanded: true,
    permissions: [
      { key: 'price.view', label: '查看价格', level: 'read' },
      { key: 'price.edit', label: '修改价格', level: 'write' },
      { key: 'price.approve', label: '审批价格', level: 'write' }
    ]
  },
  {
    key: 'stock',
    label: '库存管理',
    checked: false,
    indeterminate: false,
    expanded: true,
    permissions: [
      { key: 'stock.view', label: '查看库存', level: 'read' },
      { key: 'stock.update', label: '更新库存', level: 'write' },
      { key: 'stock.alert', label: '库存预警', level: 'read' }
    ]
  }
])

const formData = reactive({
  roleId: null as number | null,
  categoryId: null as number | null,
  permissionLevel: 'read',
  actions: [] as string[],
  description: ''
})

const formRules = {
  roleId: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  categoryId: [
    { required: true, message: '请选择菜单分类', trigger: 'change' }
  ],
  permissionLevel: [
    { required: true, message: '请选择权限级别', trigger: 'change' }
  ]
}

const getRoleName = (roleId: number) => {
  const role = roles.value.find(r => r.id === roleId)
  return role ? role.name : '未知'
}

const handleRoleChange = (roleId: number) => {
  selectedRole.value = roleId
  loadRolePermissions(roleId)
}

const loadRolePermissions = async (roleId: number) => {
  try {
    ElMessage.loading('加载权限配置...')
    const response = await fetch(`/api/menu/permissions/role/${roleId}`).then(res => res.json())
    if (response.success) {
      selectedPermissions.value = response.data.permissions || []
      updateGroupStates()
      ElMessage.success('加载成功')
    }
  } catch (error) {
    console.error('Load permissions failed:', error)
    ElMessage.error('加载失败')
  }
}

const handleGroupCheck = (group: PermissionGroup) => {
  group.permissions.forEach(permission => {
    const index = selectedPermissions.value.indexOf(permission.key)
    if (group.checked && index === -1) {
      selectedPermissions.value.push(permission.key)
    } else if (!group.checked && index !== -1) {
      selectedPermissions.value.splice(index, 1)
    }
  })
  updateGroupStates()
}

const handlePermissionChange = () => {
  updateGroupStates()
}

const updateGroupStates = () => {
  permissionGroups.value.forEach(group => {
    const groupPermissionKeys = group.permissions.map(p => p.key)
    const selectedInGroup = groupPermissionKeys.filter(key => selectedPermissions.value.includes(key))
    
    group.checked = selectedInGroup.length === groupPermissionKeys.length
    group.indeterminate = selectedInGroup.length > 0 && selectedInGroup.length < groupPermissionKeys.length
  })
}

const expandGroup = (group: PermissionGroup) => {
  group.expanded = !group.expanded
}

const savePermissions = async () => {
  if (!selectedRole.value) {
    ElMessage.warning('请先选择角色')
    return
  }

  try {
    saving.value = true
    const response = await fetch(`/api/menu/permissions/role/${selectedRole.value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        permissions: selectedPermissions.value
      })
    }).then(res => res.json())

    if (response.success) {
      ElMessage.success('保存成功')
    }
  } catch (error) {
    console.error('Save permissions failed:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const resetPermissions = () => {
  if (selectedRole.value) {
    loadRolePermissions(selectedRole.value)
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    const response = await fetch('/api/menu/permissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    }).then(res => res.json())

    if (response.success) {
      ElMessage.success('创建成功')
      showCreateDialog.value = false
      if (selectedRole.value) {
        loadRolePermissions(selectedRole.value)
      }
    }
  } catch (error) {
    console.error('Submit failed:', error)
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  formData.roleId = null
  formData.categoryId = null
  formData.permissionLevel = 'read'
  formData.actions = []
  formData.description = ''
  formRef.value?.resetFields()
}

onMounted(() => {
  if (roles.value.length > 0) {
    selectedRole.value = roles.value[0].id
    loadRolePermissions(roles.value[0].id)
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.menu-permission-manager {
  .permission-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .permission-content {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: $spacing-4;
      min-height: 600px;

      .role-section {
        border-right: 1px solid $border-color;
        padding-right: $spacing-4;

        h3 {
          margin: 0 0 $spacing-4 0;
          font-size: $font-size-base;
          font-weight: 600;
          color: $text-primary;
        }

        .role-radio {
          width: 100%;
          margin-bottom: $spacing-2;

          .role-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;

            .role-name {
              font-weight: 500;
              color: $text-primary;
            }
          }
        }
      }

      .permission-section {
        h3 {
          margin: 0 0 $spacing-4 0;
          font-size: $font-size-base;
          font-weight: 600;
          color: $text-primary;
        }

        .permission-config {
          .permission-groups {
            .permission-group {
              margin-bottom: $spacing-4;
              padding: $spacing-3;
              background: $background-light;
              border-radius: $border-radius-md;

              .group-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: $spacing-2;
                font-weight: 600;
                color: $text-primary;
              }

              .group-permissions {
                padding-left: $spacing-4;

                :deep(.el-checkbox-group) {
                  display: flex;
                  flex-direction: column;
                  gap: $spacing-2;

                  .el-checkbox {
                    width: 100%;

                    .permission-item {
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      width: 100%;

                      .permission-label {
                        color: $text-primary;
                      }
                    }
                  }
                }
              }
            }
          }

          .permission-actions {
            display: flex;
            gap: $spacing-2;
            margin-top: $spacing-6;
          }
        }

        .empty-permission {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }
      }
    }
  }
}
</style>
