<template>
  <el-dialog
    v-model="visible"
    title="创建知识图谱"
    width="800px"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="create-graph-form">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        @submit.prevent="handleSubmit"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="图谱名称" prop="name">
                <el-input
                  v-model="form.name"
                  placeholder="请输入知识图谱名称"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="所属领域" prop="domain">
                <el-select v-model="form.domain" placeholder="选择知识领域">
                  <el-option label="餐饮管理" value="catering" />
                  <el-option label="客户关系" value="customer" />
                  <el-option label="供应链" value="supply_chain" />
                  <el-option label="财务分析" value="finance" />
                  <el-option label="运营管理" value="operations" />
                  <el-option label="人力资源" value="hr" />
                  <el-option label="市场营销" value="marketing" />
                  <el-option label="法律合规" value="legal" />
                  <el-option label="技术架构" value="technology" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="描述" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="3"
              placeholder="请描述知识图谱的用途和范围"
            />
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="版本号" prop="version">
                <el-input v-model="form.version" placeholder="v1.0.0" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="创建模式">
                <el-radio-group v-model="createMode">
                  <el-radio label="empty">创建空图谱</el-radio>
                  <el-radio label="template">使用模板</el-radio>
                  <el-radio label="import">导入数据</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 配置信息 -->
        <div class="form-section">
          <h3 class="section-title">配置信息</h3>

          <!-- 节点类型配置 -->
          <el-form-item label="节点类型">
            <el-checkbox-group v-model="form.configuration.nodeTypes">
              <el-checkbox
                v-for="(label, value) in nodeTypeLabels"
                :key="value"
                :label="value"
              >
                {{ label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <!-- 关系类型配置 -->
          <el-form-item label="关系类型">
            <el-checkbox-group v-model="form.configuration.relationshipTypes">
              <el-checkbox
                v-for="(label, value) in relationshipTypeLabels"
                :key="value"
                :label="value"
              >
                {{ label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </div>

        <!-- 权限设置 -->
        <div class="form-section">
          <h3 class="section-title">权限设置</h3>

          <el-form-item label="公开访问">
            <el-switch
              v-model="form.permissions.public"
              active-text="公开"
              inactive-text="私有"
            />
          </el-form-item>

          <el-form-item label="用户权限">
            <div class="permission-manager">
              <el-select
                v-model="newPermissionUser"
                placeholder="选择用户"
                filterable
                style="width: 200px; margin-right: 12px;"
              >
                <el-option
                  v-for="user in availableUsers"
                  :key="user.id"
                  :label="user.name"
                  :value="user.id"
                />
              </el-select>

              <el-select v-model="newPermissionLevel" style="width: 120px; margin-right: 12px;">
                <el-option label="可读" value="read" />
                <el-option label="可编辑" value="write" />
                <el-option label="管理员" value="admin" />
              </el-select>

              <el-button @click="addPermission">添加权限</el-button>
            </div>

            <div class="permission-list">
              <div
                v-for="permission in permissionsList"
                :key="permission.userId"
                class="permission-item"
              >
                <span class="user-name">{{ permission.userName }}</span>
                <el-tag :type="getPermissionTagType(permission.level)" size="small">
                  {{ getPermissionLabel(permission.level) }}
                </el-tag>
                <el-button
                  @click="removePermission(permission.userId)"
                  text
                  type="danger"
                  size="small"
                >
                  删除
                </el-button>
              </div>
            </div>
          </el-form-item>
        </div>

        <!-- 验证规则 -->
        <div class="form-section">
          <h3 class="section-title">验证规则</h3>

          <div class="validation-rules">
            <div
              v-for="(rule, index) in form.configuration.validationRules"
              :key="index"
              class="rule-item"
            >
              <el-row :gutter="12">
                <el-col :span="8">
                  <el-input
                    v-model="rule.condition"
                    placeholder="验证条件"
                  />
                </el-col>
                <el-col :span="8">
                  <el-select v-model="rule.action" placeholder="处理动作">
                    <el-option label="警告" value="warn" />
                    <el-option label="阻止" value="prevent" />
                    <el-option label="需要审批" value="require_approval" />
                  </el-select>
                </el-col>
                <el-col :span="8">
                  <el-button @click="removeRule(index)" text type="danger">
                    删除规则
                  </el-button>
                </el-col>
              </el-row>
            </div>

            <el-button @click="addRule" text type="primary">
              <el-icon><Plus /></el-icon>
              添加验证规则
            </el-button>
          </div>
        </div>

        <!-- 自定义属性 -->
        <div class="form-section">
          <h3 class="section-title">自定义属性</h3>

          <div class="custom-properties">
            <div
              v-for="(prop, index) in customProperties"
              :key="index"
              class="property-item"
            >
              <el-row :gutter="12">
                <el-col :span="6">
                  <el-input
                    v-model="prop.name"
                    placeholder="属性名称"
                  />
                </el-col>
                <el-col :span="6">
                  <el-select v-model="prop.type" placeholder="数据类型">
                    <el-option label="文本" value="string" />
                    <el-option label="数字" value="number" />
                    <el-option label="布尔值" value="boolean" />
                    <el-option label="日期" value="date" />
                    <el-option label="数组" value="array" />
                  </el-select>
                </el-col>
                <el-col :span="6">
                  <el-checkbox v-model="prop.required">必填</el-checkbox>
                </el-col>
                <el-col :span="6">
                  <el-button @click="removeProperty(index)" text type="danger">
                    删除属性
                  </el-button>
                </el-col>
              </el-row>
              <el-input
                v-if="prop.type !== 'boolean'"
                v-model="prop.default"
                placeholder="默认值（可选）"
                style="margin-top: 8px;"
              />
            </div>

            <el-button @click="addProperty" text type="primary">
              <el-icon><Plus /></el-icon>
              添加自定义属性
            </el-button>
          </div>
        </div>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        创建图谱
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { knowledgeGraphAPI } from '@/api/knowledge-graph'

// Props & Emits
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'success': []
}>()

// 响应式数据
const visible = ref(false)
const formRef = ref<FormInstance>()
const submitting = ref(false)
const createMode = ref('empty')
const newPermissionUser = ref('')
const newPermissionLevel = ref('read')
const customProperties = ref<Array<{
  name: string
  type: 'string' | 'number' | 'boolean' | 'date' | 'array'
  required: boolean
  default?: any
}>>([])

// 表单数据
const form = ref({
  name: '',
  description: '',
  domain: '',
  version: '1.0.0',
  configuration: {
    nodeTypes: ['concept', 'entity', 'relationship'],
    relationshipTypes: ['related_to', 'part_of', 'is_a'],
    customProperties: {} as Record<string, any>,
    validationRules: Array<{
      condition: string
      action: 'warn' | 'prevent' | 'require_approval'
    }>()
  },
  permissions: {
    public: false,
    read: [] as string[],
    write: [] as string[],
    admin: [] as string[]
  }
})

// 模拟用户数据
const availableUsers = ref([
  { id: '1', name: '张三' },
  { id: '2', name: '李四' },
  { id: '3', name: '王五' },
  { id: '4', name: '赵六' }
])

// 权限列表
const permissionsList = computed(() => {
  const permissions = []

  form.value.permissions.read.forEach(userId => {
    const user = availableUsers.value.find(u => u.id === userId)
    if (user) {
      permissions.push({ userId, userName: user.name, level: 'read' })
    }
  })

  form.value.permissions.write.forEach(userId => {
    if (!permissions.find(p => p.userId === userId)) {
      const user = availableUsers.value.find(u => u.id === userId)
      if (user) {
        permissions.push({ userId, userName: user.name, level: 'write' })
      }
    }
  })

  form.value.permissions.admin.forEach(userId => {
    if (!permissions.find(p => p.userId === userId)) {
      const user = availableUsers.value.find(u => u.id === userId)
      if (user) {
        permissions.push({ userId, userName: user.name, level: 'admin' })
      }
    }
  })

  return permissions
})

// 节点类型标签
const nodeTypeLabels = {
  concept: '概念',
  entity: '实体',
  relationship: '关系',
  rule: '规则',
  procedure: '流程',
  document: '文档',
  event: '事件',
  location: '位置',
  person: '人物',
  organization: '组织'
}

// 关系类型标签
const relationshipTypeLabels = {
  is_a: '是一种',
  part_of: '是一部分',
  related_to: '相关',
  causes: '导致',
  enables: '使能',
  requires: '需要',
  similar_to: '相似',
  opposite_of: '相反',
  instance_of: '实例',
  subclass_of: '子类',
  located_in: '位于',
  works_for: '工作于',
  knows: '认识',
  collaborates_with: '协作',
  depends_on: '依赖'
}

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入图谱名称', trigger: 'blur' },
    { min: 2, max: 50, message: '图谱名称长度应为2-50个字符', trigger: 'blur' }
  ],
  domain: [
    { required: true, message: '请选择所属领域', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入图谱描述', trigger: 'blur' },
    { min: 10, max: 500, message: '描述长度应为10-500个字符', trigger: 'blur' }
  ],
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' }
  ]
}

// 方法
const handleClose = () => {
  visible.value = false
  resetForm()
}

const resetForm = () => {
  form.value = {
    name: '',
    description: '',
    domain: '',
    version: '1.0.0',
    configuration: {
      nodeTypes: ['concept', 'entity', 'relationship'],
      relationshipTypes: ['related_to', 'part_of', 'is_a'],
      customProperties: {},
      validationRules: []
    },
    permissions: {
      public: false,
      read: [],
      write: [],
      admin: []
    }
  }
  customProperties.value = []
  createMode.value = 'empty'
  newPermissionUser.value = ''
  newPermissionLevel.value = 'read'
}

const addPermission = () => {
  if (!newPermissionUser.value) {
    ElMessage.warning('请选择用户')
    return
  }

  const userId = newPermissionUser.value
  const level = newPermissionLevel.value

  // 检查是否已存在
  if (form.value.permissions[level as keyof typeof form.value.permissions].includes(userId)) {
    ElMessage.warning('该用户已拥有此权限')
    return
  }

  // 添加权限
  form.value.permissions[level as keyof typeof form.value.permissions].push(userId)

  // 清空选择
  newPermissionUser.value = ''
  newPermissionLevel.value = 'read'

  ElMessage.success('权限添加成功')
}

const removePermission = (userId: string) => {
  // 从所有权限级别中移除用户
  Object.keys(form.value.permissions).forEach(level => {
    if (level !== 'public') {
      const permissions = form.value.permissions[level as keyof typeof form.value.permissions] as string[]
      const index = permissions.indexOf(userId)
      if (index > -1) {
        permissions.splice(index, 1)
      }
    }
  })

  ElMessage.success('权限移除成功')
}

const getPermissionTagType = (level: string) => {
  const types: Record<string, string> = {
    read: 'info',
    write: 'warning',
    admin: 'danger'
  }
  return types[level] || ''
}

const getPermissionLabel = (level: string) => {
  const labels: Record<string, string> = {
    read: '可读',
    write: '可编辑',
    admin: '管理员'
  }
  return labels[level] || level
}

const addRule = () => {
  form.value.configuration.validationRules.push({
    condition: '',
    action: 'warn'
  })
}

const removeRule = (index: number) => {
  form.value.configuration.validationRules.splice(index, 1)
}

const addProperty = () => {
  customProperties.value.push({
    name: '',
    type: 'string',
    required: false,
    default: ''
  })
}

const removeProperty = (index: number) => {
  customProperties.value.splice(index, 1)
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    // 构建自定义属性配置
    form.value.configuration.customProperties = {}
    customProperties.value.forEach(prop => {
      if (prop.name) {
        form.value.configuration.customProperties[prop.name] = {
          type: prop.type,
          required: prop.required,
          ...(prop.default && { default: prop.default })
        }
      }
    })

    // 过滤空的验证规则
    form.value.configuration.validationRules = form.value.configuration.validationRules.filter(
      rule => rule.condition && rule.action
    )

    submitting.value = true

    const { data, success } = await knowledgeGraphAPI.createKnowledgeGraph(form.value)

    if (success && data) {
      ElMessage.success('知识图谱创建成功')
      emit('success')
      handleClose()
    }
  } catch (error) {
    console.error('Create knowledge graph failed:', error)
    ElMessage.error('创建知识图谱失败')
  } finally {
    submitting.value = false
  }
}

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
})

watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})
</script>

<style scoped lang="scss">
.create-graph-form {
  .form-section {
    margin-bottom: 32px;

    .section-title {
      margin: 0 0 20px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #e4e7ed;
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  .permission-manager {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
  }

  .permission-list {
    .permission-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
      padding: 8px 12px;
      background: #f8f9fa;
      border-radius: 4px;

      .user-name {
        flex: 1;
        color: #2c3e50;
      }
    }
  }

  .validation-rules {
    .rule-item {
      margin-bottom: 12px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 4px;
    }
  }

  .custom-properties {
    .property-item {
      margin-bottom: 16px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 4px;
    }
  }
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  .el-checkbox {
    margin-right: 0;
    margin-bottom: 8px;
  }
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-dialog__body) {
  max-height: 70vh;
  overflow-y: auto;
}
</style>