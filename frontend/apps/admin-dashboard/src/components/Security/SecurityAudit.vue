<template>
  <div class="security-audit">
    <div class="audit-toolbar">
      <div class="toolbar-left">
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          style="margin-right: 10px;"
          @change="handleDateChange"
        />

        <el-select
          v-model="selectedAction"
          placeholder="选择操作类型"
          clearable
          style="width: 150px; margin-right: 10px;"
          @change="loadAuditLogs"
        >
          <el-option
            v-for="action in actionTypes"
            :key="action.value"
            :label="action.label"
            :value="action.value"
          />
        </el-select>

        <el-input
          v-model="searchQuery"
          placeholder="搜索用户或资源..."
          clearable
          style="width: 200px;"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <div class="toolbar-right">
        <el-button @click="refreshLogs">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="primary" @click="exportLogs">
          导出日志
        </el-button>
        <el-button type="danger" @click="clearLogs">
          清除日志
        </el-button>
      </div>
    </div>

    <div class="audit-stats">
      <el-row :gutter="20">
        <el-col :span="6" v-for="stat in auditStats" :key="stat.key">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" :class="stat.type">
                <el-icon :size="24">
                  <component :is="stat.icon" />
                </el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="audit-table">
      <el-table
        :data="auditLogs"
        :loading="loading"
        stripe
        @row-click="viewLogDetails"
      >
        <el-table-column label="时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.timestamp) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-tag :type="getActionTagType(row.action)" size="small">
              {{ getActionLabel(row.action) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="资源" prop="resource" width="150" />

        <el-table-column label="用户" width="120">
          <template #default="{ row }">
            <span v-if="row.userId">{{ row.userId }}</span>
            <span v-else class="text-muted">系统</span>
          </template>
        </el-table-column>

        <el-table-column label="IP地址" width="130">
          <template #default="{ row }">
            <span v-if="row.details?.ip">{{ row.details.ip }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column label="用户代理" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="user-agent">{{ row.userAgent }}</span>
          </template>
        </el-table-column>

        <el-table-column label="详情" width="100">
          <template #default="{ row }">
            <el-button
              type="info"
              size="small"
              text
              @click.stop="viewLogDetails(row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[20, 50, 100, 200]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 日志详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="审计日志详情"
      width="600px"
    >
      <div v-if="selectedLog" class="log-details">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="时间">
            {{ formatDateTime(selectedLog.timestamp) }}
          </el-descriptions-item>
          <el-descriptions-item label="操作">
            <el-tag :type="getActionTagType(selectedLog.action)" size="small">
              {{ getActionLabel(selectedLog.action) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="资源">
            {{ selectedLog.resource }}
          </el-descriptions-item>
          <el-descriptions-item label="用户">
            {{ selectedLog.userId || '系统' }}
          </el-descriptions-item>
          <el-descriptions-item label="URL">
            {{ selectedLog.url }}
          </el-descriptions-item>
          <el-descriptions-item label="用户代理">
            <div class="user-agent">{{ selectedLog.userAgent }}</div>
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="selectedLog.details" class="log-metadata">
          <h4>详细信息</h4>
          <el-scrollbar max-height="300px">
            <pre class="metadata-content">{{ JSON.stringify(selectedLog.details, null, 2) }}</pre>
          </el-scrollbar>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Warning,
  InfoFilled,
  SuccessFilled,
  User,
  Lock,
  View,
  Edit,
  Delete
} from '@element-plus/icons-vue'
import { AuditLogger, type AuditLog } from '@/utils/security'

// 响应式数据
const loading = ref(false)
const auditLogs = ref<AuditLog[]>([])
const selectedLog = ref<AuditLog | null>(null)
const showDetailDialog = ref(false)

const dateRange = ref<[Date, Date] | null>(null)
const selectedAction = ref('')
const searchQuery = ref('')

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 操作类型
const actionTypes = [
  { value: 'login', label: '登录' },
  { value: 'logout', label: '登出' },
  { value: 'create', label: '创建' },
  { value: 'update', label: '更新' },
  { value: 'delete', label: '删除' },
  { value: 'view', label: '查看' },
  { value: 'permission_denied', label: '权限拒绝' },
  { value: 'permission_denied_contact', label: '权限联系' }
]

// 计算属性
const auditStats = computed(() => {
  const logs = auditLogs.value
  return [
    {
      key: 'total',
      label: '总日志数',
      value: logs.length,
      icon: InfoFilled,
      type: 'info'
    },
    {
      key: 'today',
      label: '今日日志',
      value: logs.filter(log => {
        const logDate = new Date(log.timestamp)
        const today = new Date()
        return logDate.toDateString() === today.toDateString()
      }).length,
      icon: SuccessFilled,
      type: 'success'
    },
    {
      key: 'denied',
      label: '权限拒绝',
      value: logs.filter(log => log.action.includes('permission_denied')).length,
      icon: Lock,
      type: 'warning'
    },
    {
      key: 'users',
      label: '活跃用户',
      value: new Set(logs.map(log => log.userId).filter(Boolean)).size,
      icon: User,
      type: 'primary'
    }
  ]
})

// 方法
const loadAuditLogs = () => {
  loading.value = true

  try {
    const filter: any = {}

    if (dateRange.value) {
      filter.startTime = dateRange.value[0].getTime()
      filter.endTime = dateRange.value[1].getTime()
    }

    if (selectedAction.value) {
      filter.action = selectedAction.value
    }

    const logs = AuditLogger.getLogs(filter)

    // 搜索过滤
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      const filtered = logs.filter(log =>
        (log.userId && log.userId.toLowerCase().includes(query)) ||
        (log.resource && log.resource.toLowerCase().includes(query)) ||
        (log.action && log.action.toLowerCase().includes(query))
      )
      auditLogs.value = filtered
    } else {
      auditLogs.value = logs
    }

    pagination.total = auditLogs.value.length

    // 分页
    const start = (pagination.page - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    auditLogs.value = auditLogs.value.slice(start, end)

  } catch (error) {
    console.error('Load audit logs failed:', error)
    ElMessage.error('加载审计日志失败')
  } finally {
    loading.value = false
  }
}

const refreshLogs = () => {
  pagination.page = 1
  loadAuditLogs()
}

const handleDateChange = () => {
  pagination.page = 1
  loadAuditLogs()
}

const handleSearch = () => {
  pagination.page = 1
  loadAuditLogs()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  loadAuditLogs()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadAuditLogs()
}

const viewLogDetails = (log: AuditLog) => {
  selectedLog.value = log
  showDetailDialog.value = true
}

const exportLogs = () => {
  try {
    const logs = AuditLogger.getLogs()
    const dataStr = JSON.stringify(logs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    ElMessage.success('审计日志已导出')
  } catch (error) {
    ElMessage.error('导出审计日志失败')
  }
}

const clearLogs = async () => {
  try {
    await ElMessageBox.confirm('确定要清除所有审计日志吗？此操作不可恢复。', '确认清除', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })

    AuditLogger.clearLogs()
    auditLogs.value = []
    pagination.total = 0
    ElMessage.success('审计日志已清除')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('清除审计日志失败')
    }
  }
}

const formatDateTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

const getActionTagType = (action: string) => {
  const typeMap: Record<string, string> = {
    login: 'success',
    logout: 'info',
    create: 'success',
    update: 'warning',
    delete: 'danger',
    view: 'info',
    permission_denied: 'danger',
    permission_denied_contact: 'warning'
  }
  return typeMap[action] || 'info'
}

const getActionLabel = (action: string) => {
  const labelMap: Record<string, string> = {
    login: '登录',
    logout: '登出',
    create: '创建',
    update: '更新',
    delete: '删除',
    view: '查看',
    permission_denied: '权限拒绝',
    permission_denied_contact: '权限联系'
  }
  return labelMap[action] || action
}

// 生命周期
onMounted(() => {
  loadAuditLogs()
})
</script>

<style scoped lang="scss">
@use '@/styles/theme.scss';

.security-audit {
  .audit-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-6;
    padding: $spacing-4;
    background: $white;
    border-radius: $border-radius-base;
    box-shadow: $shadow-sm;

    .toolbar-left,
    .toolbar-right {
      display: flex;
      align-items: center;
      gap: $spacing-2;
    }
  }

  .audit-stats {
    margin-bottom: $spacing-6;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: $spacing-4;

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          border-radius: $border-radius-lg;

          &.info {
            background: $info-light;
            color: $info-color;
          }

          &.success {
            background: $success-light;
            color: $success-color;
          }

          &.warning {
            background: $warning-light;
            color: $warning-color;
          }

          &.primary {
            background: $primary-light;
            color: $primary-color;
          }
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: $font-size-xl;
            font-weight: $font-weight-bold;
            color: $text-primary;
            margin-bottom: $spacing-1;
          }

          .stat-label {
            font-size: $font-size-sm;
            color: $text-secondary;
          }
        }
      }
    }
  }

  .audit-table {
    background: $white;
    border-radius: $border-radius-base;
    box-shadow: $shadow-sm;
    overflow: hidden;

    .user-agent {
      font-size: $font-size-sm;
      color: $text-secondary;
      font-family: $font-family-mono;
    }

    .pagination {
      padding: $spacing-4;
      text-align: right;
      border-top: 1px solid $border-primary;
    }
  }

  .log-details {
    .user-agent {
      font-size: $font-size-sm;
      color: $text-secondary;
      word-break: break-word;
    }

    .log-metadata {
      margin-top: $spacing-6;

      h4 {
        margin-bottom: $spacing-4;
        color: $text-primary;
      }

      .metadata-content {
        background: $gray-50;
        padding: $spacing-4;
        border-radius: $border-radius-base;
        font-family: $font-family-mono;
        font-size: $font-size-xs;
        line-height: 1.4;
        color: $text-secondary;
        margin: 0;
      }
    }
  }
}

// 响应式设计
@media (max-width: $breakpoint-md) {
  .security-audit {
    .audit-toolbar {
      flex-direction: column;
      gap: $spacing-4;
      align-items: stretch;

      .toolbar-left,
      .toolbar-right {
        justify-content: center;
      }
    }

    .audit-stats {
      .el-row {
        .el-col {
          margin-bottom: $spacing-4;
        }
      }
    }
  }
}

// 深色主题支持
@media (prefers-color-scheme: dark) {
  .security-audit {
    .audit-toolbar,
    .audit-table {
      background: $dark-bg-secondary;
      border-color: $dark-border-primary;
    }

    .log-metadata {
      .metadata-content {
        background: $dark-bg-tertiary;
        color: $dark-text-secondary;
      }
    }
  }
}
</style>