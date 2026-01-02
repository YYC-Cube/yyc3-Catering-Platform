<template>
  <div class="notification-templates">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchQuery"
          placeholder="搜索模板..."
          clearable
          style="width: 300px;"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
          v-model="filterType"
          placeholder="类型筛选"
          clearable
          style="width: 150px; margin-left: 10px;"
          @change="handleFilter"
        >
          <el-option
            v-for="type in notificationTypes"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
      </div>

      <div class="toolbar-right">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新建模板
        </el-button>

        <el-button @click="refreshTemplates">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 模板列表 -->
    <div class="template-list">
      <el-table
        :data="filteredTemplates"
        :loading="loading"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column label="名称" prop="name" min-width="150">
          <template #default="{ row }">
            <div class="template-name">
              <span>{{ row.name }}</span>
              <el-tag v-if="!row.isActive" type="danger" size="small">禁用</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getNotificationTagType(row.type)" size="small">
              {{ getNotificationTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="优先级" width="100">
          <template #default="{ row }">
            <el-tag
              :type="getPriorityTagType(row.priority)"
              size="small"
              v-if="row.priority !== 'normal'"
            >
              {{ getPriorityLabel(row.priority) }}
            </el-tag>
            <span v-else class="text-muted">普通</span>
          </template>
        </el-table-column>

        <el-table-column label="标题" prop="title" min-width="200" show-overflow-tooltip />

        <el-table-column label="分类" prop="category" width="120">
          <template #default="{ row }">
            <span v-if="row.category">{{ row.category }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-switch
              v-model="row.isActive"
              @change="handleToggleActive(row)"
              :loading="row.toggling"
            />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              text
              @click="editTemplate(row)"
            >
              编辑
            </el-button>

            <el-button
              type="success"
              size="small"
              text
              @click="previewTemplate(row)"
            >
              预览
            </el-button>

            <el-dropdown @command="(command) => handleCommand(command, row)">
              <el-button size="small" text>
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="copy">复制</el-dropdown-item>
                  <el-dropdown-item command="export">导出</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 创建/编辑模板对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingTemplate ? '编辑模板' : '新建模板'"
      width="800px"
      :close-on-click-modal="false"
    >
      <TemplateForm
        v-if="showCreateDialog"
        :template="editingTemplate"
        @save="handleSaveTemplate"
        @cancel="showCreateDialog = false"
      />
    </el-dialog>

    <!-- 预览模板对话框 -->
    <el-dialog
      v-model="showPreviewDialog"
      title="模板预览"
      width="600px"
    >
      <TemplatePreview
        v-if="showPreviewDialog && previewingTemplate"
        :template="previewingTemplate"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Plus,
  Refresh,
  MoreFilled,
  InfoFilled,
  SuccessFilled,
  WarningFilled,
  CircleCloseFilled
} from '@element-plus/icons-vue'
import {
  getNotificationTemplates,
  NotificationTemplate,
  NotificationType,
  NotificationPriority
} from '@/api/notification'
import TemplateForm from './TemplateForm.vue'
import TemplatePreview from './TemplatePreview.vue'

const emit = defineEmits<{
  close: []
}>()

// 响应式数据
const loading = ref(false)
const templates = ref<NotificationTemplate[]>([])
const selectedTemplates = ref<NotificationTemplate[]>([])
const searchQuery = ref('')
const filterType = ref<NotificationType | ''>('')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const showCreateDialog = ref(false)
const showPreviewDialog = ref(false)
const editingTemplate = ref<NotificationTemplate | null>(null)
const previewingTemplate = ref<NotificationTemplate | null>(null)

// 通知类型列表
const notificationTypes = [
  { value: NotificationType.INFO, label: '信息' },
  { value: NotificationType.SUCCESS, label: '成功' },
  { value: NotificationType.WARNING, label: '警告' },
  { value: NotificationType.ERROR, label: '错误' },
  { value: NotificationType.ORDER, label: '订单' },
  { value: NotificationType.KITCHEN, label: '厨房' },
  { value: NotificationType.PAYMENT, label: '支付' },
  { value: NotificationType.SYSTEM, label: '系统' },
  { value: NotificationType.MARKETING, label: '营销' }
]

// 计算属性
const filteredTemplates = computed(() => {
  let result = templates.value

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(template =>
      template.name.toLowerCase().includes(query) ||
      template.title.toLowerCase().includes(query) ||
      template.message.toLowerCase().includes(query)
    )
  }

  // 类型过滤
  if (filterType.value) {
    result = result.filter(template => template.type === filterType.value)
  }

  return result
})

// 方法
const loadTemplates = async () => {
  loading.value = true
  try {
    const response = await getNotificationTemplates()
    if (response.success && response.data) {
      templates.value = response.data.map(template => ({
        ...template,
        toggling: false
      }))
      total.value = templates.value.length
    }
  } catch (error) {
    console.error('Load templates failed:', error)
    ElMessage.error('加载模板失败')
  } finally {
    loading.value = false
  }
}

const refreshTemplates = () => {
  loadTemplates()
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleFilter = () => {
  currentPage.value = 1
}

const handleSelectionChange = (selection: NotificationTemplate[]) => {
  selectedTemplates.value = selection
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const editTemplate = (template: NotificationTemplate) => {
  editingTemplate.value = { ...template }
  showCreateDialog.value = true
}

const previewTemplate = (template: NotificationTemplate) => {
  previewingTemplate.value = template
  showPreviewDialog.value = true
}

const handleToggleActive = async (template: NotificationTemplate) => {
  template.toggling = true
  try {
    // 这里应该调用更新API
    // await updateNotificationTemplate(template.id, { isActive: template.isActive })
    ElMessage.success(template.isActive ? '模板已启用' : '模板已禁用')
  } catch (error) {
    console.error('Toggle template active failed:', error)
    ElMessage.error('操作失败')
    // 回滚状态
    template.isActive = !template.isActive
  } finally {
    template.toggling = false
  }
}

const handleSaveTemplate = async (template: NotificationTemplate) => {
  try {
    // 这里应该调用创建或更新API
    // if (editingTemplate.value) {
    //   await updateNotificationTemplate(editingTemplate.value.id, template)
    // } else {
    //   await createNotificationTemplate(template)
    // }

    showCreateDialog.value = false
    editingTemplate.value = null
    loadTemplates()
    ElMessage.success('模板保存成功')
  } catch (error) {
    console.error('Save template failed:', error)
    ElMessage.error('保存模板失败')
  }
}

const handleCommand = async (command: string, template: NotificationTemplate) => {
  switch (command) {
    case 'copy':
      const copyTemplate = {
        ...template,
        name: `${template.name} (副本)`,
        id: undefined
      }
      editingTemplate.value = copyTemplate
      showCreateDialog.value = true
      break

    case 'export':
      exportTemplate(template)
      break

    case 'delete':
      await deleteTemplate(template)
      break
  }
}

const exportTemplate = (template: NotificationTemplate) => {
  const dataStr = JSON.stringify(template, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${template.name}.json`
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success('模板已导出')
}

const deleteTemplate = async (template: NotificationTemplate) => {
  try {
    await ElMessageBox.confirm('确定要删除这个模板吗？', '确认删除', {
      type: 'warning'
    })

    // 这里应该调用删除API
    // await deleteNotificationTemplate(template.id)

    templates.value = templates.value.filter(t => t.id !== template.id)
    ElMessage.success('模板已删除')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete template failed:', error)
      ElMessage.error('删除模板失败')
    }
  }
}

const getNotificationTagType = (type: NotificationType) => {
  const typeMap = {
    [NotificationType.INFO]: 'info',
    [NotificationType.SUCCESS]: 'success',
    [NotificationType.WARNING]: 'warning',
    [NotificationType.ERROR]: 'danger',
    [NotificationType.ORDER]: 'info',
    [NotificationType.KITCHEN]: 'warning',
    [NotificationType.PAYMENT]: 'success',
    [NotificationType.SYSTEM]: 'info',
    [NotificationType.MARKETING]: 'warning'
  }
  return typeMap[type] || 'info'
}

const getNotificationTypeLabel = (type: NotificationType) => {
  const labelMap = {
    [NotificationType.INFO]: '信息',
    [NotificationType.SUCCESS]: '成功',
    [NotificationType.WARNING]: '警告',
    [NotificationType.ERROR]: '错误',
    [NotificationType.ORDER]: '订单',
    [NotificationType.KITCHEN]: '厨房',
    [NotificationType.PAYMENT]: '支付',
    [NotificationType.SYSTEM]: '系统',
    [NotificationType.MARKETING]: '营销'
  }
  return labelMap[type] || '未知'
}

const getPriorityTagType = (priority: NotificationPriority) => {
  const typeMap = {
    [NotificationPriority.LOW]: 'info',
    [NotificationPriority.NORMAL]: 'info',
    [NotificationPriority.HIGH]: 'warning',
    [NotificationPriority.URGENT]: 'danger'
  }
  return typeMap[priority] || 'info'
}

const getPriorityLabel = (priority: NotificationPriority) => {
  const labelMap = {
    [NotificationPriority.LOW]: '低',
    [NotificationPriority.NORMAL]: '普通',
    [NotificationPriority.HIGH]: '高',
    [NotificationPriority.URGENT]: '紧急'
  }
  return labelMap[priority] || '普通'
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadTemplates()
})
</script>

<style scoped lang="scss">
@use '@/styles/theme.scss';

.notification-templates {
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-6;
    padding: $spacing-4;
    background: $white;
    border-radius: $border-radius-base;
    box-shadow: $shadow-sm;

    .toolbar-left {
      display: flex;
      align-items: center;
    }

    .toolbar-right {
      display: flex;
      gap: $spacing-2;
    }
  }

  .template-list {
    background: $white;
    border-radius: $border-radius-base;
    box-shadow: $shadow-sm;
    overflow: hidden;

    .template-name {
      display: flex;
      align-items: center;
      gap: $spacing-2;
    }

    .pagination {
      padding: $spacing-4;
      text-align: right;
      border-top: 1px solid $border-primary;
    }

    :deep(.el-table) {
      .text-muted {
        color: $text-placeholder;
        font-style: italic;
      }
    }
  }
}

// 响应式设计
@media (max-width: $breakpoint-md) {
  .notification-templates {
    .toolbar {
      flex-direction: column;
      gap: $spacing-4;
      align-items: stretch;

      .toolbar-left,
      .toolbar-right {
        justify-content: center;
      }
    }

    .template-list {
      :deep(.el-table) {
        .el-table__fixed-right {
          right: 0 !important;
        }
      }
    }
  }
}

// 深色主题支持
@media (prefers-color-scheme: dark) {
  .notification-templates {
    .toolbar,
    .template-list {
      background: $dark-bg-secondary;
      border-color: $dark-border-primary;
    }

    .template-list {
      .pagination {
        border-top-color: $dark-border-primary;
      }
    }
  }
}
</style>