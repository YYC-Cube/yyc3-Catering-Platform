<template>
  <div class="task-management">
    <!-- 任务概览 -->
    <div class="task-overview">
      <el-card class="overview-card">
        <div class="overview-grid">
          <div class="overview-item">
            <div class="item-icon total">
              <el-icon><List /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-value">{{ taskStats.total }}</div>
              <div class="item-label">总任务数</div>
            </div>
          </div>

          <div class="overview-item">
            <div class="item-icon progress">
              <el-icon><Loading /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-value">{{ taskStats.inProgress }}</div>
              <div class="item-label">进行中</div>
            </div>
          </div>

          <div class="overview-item">
            <div class="item-icon completed">
              <el-icon><SuccessFilled /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-value">{{ taskStats.completed }}</div>
              <div class="item-label">已完成</div>
            </div>
          </div>

          <div class="overview-item">
            <div class="item-icon efficiency">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-value">{{ taskStats.successRate }}%</div>
              <div class="item-label">成功率</div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 任务列表 -->
    <el-card class="task-list-card">
      <div class="list-header">
        <div class="header-left">
          <h3>协作任务</h3>
          <span class="total-count">共 {{ totalTasks }} 个任务</span>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            创建任务
          </el-button>
          <el-button @click="optimizeTasks">
            <el-icon><Magic /></el-icon>
            优化分配
          </el-button>
          <el-button @click="loadTasks">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>

      <!-- 过滤器 -->
      <div class="filter-section">
        <el-row :gutter="16">
          <el-col :span="6">
            <el-select
              v-model="filters.status"
              placeholder="任务状态"
              clearable
              @change="loadTasks"
            >
              <el-option label="全部" value="" />
              <el-option label="待分配" :value="TaskStatus.PENDING" />
              <el-option label="已分配" :value="TaskStatus.ASSIGNED" />
              <el-option label="进行中" :value="TaskStatus.IN_PROGRESS" />
              <el-option label="已完成" :value="TaskStatus.COMPLETED" />
              <el-option label="失败" :value="TaskStatus.FAILED" />
              <el-option label="已取消" :value="TaskStatus.CANCELLED" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="filters.priority"
              placeholder="优先级"
              clearable
              @change="loadTasks"
            >
              <el-option label="全部" value="" />
              <el-option label="低" :value="TaskPriority.LOW" />
              <el-option label="中" :value="TaskPriority.MEDIUM" />
              <el-option label="高" :value="TaskPriority.HIGH" />
              <el-option label="紧急" :value="TaskPriority.URGENT" />
              <el-option label="关键" :value="TaskPriority.CRITICAL" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-input
              v-model="filters.search"
              placeholder="搜索任务标题"
              clearable
              @input="debounceSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="6">
            <el-date-picker
              v-model="filters.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="loadTasks"
            />
          </el-col>
        </el-row>
      </div>

      <!-- 任务卡片列表 -->
      <div class="task-grid">
        <div
          v-for="task in tasks"
          :key="task.id"
          class="task-card"
          :class="{ 'high-priority': [TaskPriority.URGENT, TaskPriority.CRITICAL].includes(task.priority) }"
        >
          <div class="task-header">
            <div class="task-info">
              <h4 class="task-title">{{ task.title }}</h4>
              <div class="task-meta">
                <el-tag :type="getPriorityType(task.priority)" size="small">
                  {{ getPriorityText(task.priority) }}
                </el-tag>
                <el-tag :type="getStatusType(task.status)" size="small">
                  {{ getStatusText(task.status) }}
                </el-tag>
                <span class="task-type">{{ task.type }}</span>
              </div>
            </div>
            <div class="task-actions">
              <el-dropdown @command="(command) => handleTaskAction(command, task)">
                <el-button type="text" :icon="MoreFilled" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="view">查看详情</el-dropdown-item>
                    <el-dropdown-item command="edit">编辑任务</el-dropdown-item>
                    <el-dropdown-item command="assign">重新分配</el-dropdown-item>
                    <el-dropdown-item command="monitor">实时监控</el-dropdown-item>
                    <el-dropdown-item command="cancel" divided>取消任务</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>

          <div class="task-description">
            {{ task.description }}
          </div>

          <!-- 任务进度 -->
          <div class="task-progress">
            <div class="progress-header">
              <span>任务进度</span>
              <span class="progress-percentage">{{ task.progress.percentage }}%</span>
            </div>
            <el-progress
              :percentage="task.progress.percentage"
              :status="getProgressStatus(task.status)"
              :show-text="false"
            />
            <div class="progress-detail">
              {{ task.progress.completed }} / {{ task.progress.total }} 已完成
            </div>
          </div>

          <!-- 分配的智能体 -->
          <div class="task-agents">
            <div class="agents-label">分配智能体:</div>
            <div class="agents-list">
              <el-tooltip
                v-for="agentId in task.assignedAgents"
                :key="agentId"
                :content="getAgentName(agentId)"
                placement="top"
              >
                <el-avatar :size="32" class="agent-avatar">
                  <el-icon><User /></el-icon>
                </el-avatar>
              </el-tooltip>
              <el-button
                v-if="task.assignedAgents.length === 0"
                size="small"
                type="primary"
                plain
                @click="assignAgents(task)"
              >
                分配智能体
              </el-button>
            </div>
          </div>

          <!-- 子任务 -->
          <div v-if="task.subtasks && task.subtasks.length > 0" class="subtasks">
            <div class="subtasks-header">
              <span>子任务 ({{ getCompletedSubtasks(task) }}/{{ task.subtasks.length }})</span>
            </div>
            <div class="subtasks-list">
              <div
                v-for="subtask in task.subtasks.slice(0, 3)"
                :key="subtask.id"
                class="subtask-item"
              >
                <div class="subtask-name">{{ subtask.title }}</div>
                <el-tag
                  :type="getStatusType(subtask.status)"
                  size="small"
                  effect="plain"
                >
                  {{ getStatusText(subtask.status) }}
                </el-tag>
              </div>
              <div
                v-if="task.subtasks.length > 3"
                class="subtask-more"
              >
                +{{ task.subtasks.length - 3 }} 个子任务
              </div>
            </div>
          </div>

          <!-- 时间信息 -->
          <div class="task-time">
            <div class="time-item">
              <el-icon><Clock /></el-icon>
              <span>创建: {{ formatTime(task.createdAt) }}</span>
            </div>
            <div v-if="task.deadline" class="time-item deadline">
              <el-icon><Warning /></el-icon>
              <span>截止: {{ formatTime(task.deadline) }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="task-footer">
            <el-button
              v-if="task.status === TaskStatus.PENDING"
              type="primary"
              size="small"
              @click="assignAgents(task)"
            >
              分配智能体
            </el-button>
            <el-button
              v-if="task.status === TaskStatus.IN_PROGRESS"
              type="success"
              size="small"
              @click="monitorTask(task)"
            >
              实时监控
            </el-button>
            <el-button
              v-if="task.status === TaskStatus.COMPLETED"
              type="info"
              size="small"
              @click="viewResults(task)"
            >
              查看结果
            </el-button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="totalTasks"
          :page-sizes="[12, 24, 48, 96]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadTasks"
          @current-change="loadTasks"
        />
      </div>
    </el-card>

    <!-- 创建任务对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建协作任务"
      width="80%"
      destroy-on-close
    >
      <CreateCollaborationTask
        v-if="showCreateDialog"
        @success="handleTaskCreated"
        @cancel="showCreateDialog = false"
      />
    </el-dialog>

    <!-- 任务详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      :title="`任务详情 - ${currentTask?.title}`"
      width="90%"
      destroy-on-close
    >
      <TaskDetail
        v-if="showDetailDialog"
        :task="currentTask"
        @refresh="loadTasks"
      />
    </el-dialog>

    <!-- 任务分配对话框 -->
    <el-dialog
      v-model="showAssignDialog"
      title="分配智能体"
      width="60%"
      destroy-on-close
    >
      <TaskAssignment
        v-if="showAssignDialog"
        :task="assigningTask"
        @success="handleTaskAssigned"
        @cancel="showAssignDialog = false"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Refresh, List, Loading, SuccessFilled,
  Search, MoreFilled, User, Clock, Warning
} from '@element-plus/icons-vue'
import { multiAgentAPI } from '@/api/multi-agent'
import type { CollaborationTask, TaskStatus, TaskPriority } from '@/api/multi-agent'
import CreateCollaborationTask from './CreateCollaborationTask.vue'
import TaskDetail from './TaskDetail.vue'
import TaskAssignment from './TaskAssignment.vue'

// 响应式数据
const loading = ref(false)
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const showAssignDialog = ref(false)
const tasks = ref<CollaborationTask[]>([])
const currentTask = ref<CollaborationTask>()
const assigningTask = ref<CollaborationTask>()
const agents = ref<any[]>([])

// 过滤器
const filters = reactive({
  status: '' as TaskStatus | '',
  priority: '' as TaskPriority | '',
  search: '',
  dateRange: null as [string, string] | null
})

// 分页
const pagination = reactive({
  page: 1,
  size: 24
})

// 任务统计
const taskStats = ref({
  total: 0,
  pending: 0,
  assigned: 0,
  inProgress: 0,
  completed: 0,
  failed: 0,
  successRate: 0
})

// 计算属性
const totalTasks = computed(() => tasks.value.length)

// 生命周期
onMounted(() => {
  loadTasks()
  loadAgents()
})

// 方法
const loadTasks = async () => {
  try {
    loading.value = true
    const response = await multiAgentAPI.getTasks({
      status: filters.status || undefined,
      priority: filters.priority || undefined,
      dateRange: filters.dateRange || undefined,
      limit: pagination.size,
      offset: (pagination.page - 1) * pagination.size
    })

    if (response.success && response.data) {
      tasks.value = response.data.tasks
      calculateTaskStats()
    }
  } catch (error) {
    console.error('Load tasks failed:', error)
    ElMessage.error('加载任务列表失败')
  } finally {
    loading.value = false
  }
}

const loadAgents = async () => {
  try {
    const response = await multiAgentAPI.getAgents()
    if (response.success && response.data) {
      agents.value = response.data.agents
    }
  } catch (error) {
    console.error('Load agents failed:', error)
  }
}

const calculateTaskStats = () => {
  const stats = {
    total: tasks.value.length,
    pending: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
    failed: 0,
    successRate: 0
  }

  tasks.value.forEach(task => {
    switch (task.status) {
      case TaskStatus.PENDING:
        stats.pending++
        break
      case TaskStatus.ASSIGNED:
        stats.assigned++
        break
      case TaskStatus.IN_PROGRESS:
        stats.inProgress++
        break
      case TaskStatus.COMPLETED:
        stats.completed++
        break
      case TaskStatus.FAILED:
        stats.failed++
        break
    }
  })

  const totalCompletedOrFailed = stats.completed + stats.failed
  stats.successRate = totalCompletedOrFailed > 0
    ? Math.round((stats.completed / totalCompletedOrFailed) * 100)
    : 0

  taskStats.value = stats
}

const debounceSearch = (() => {
  let timeoutId: number
  return () => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      loadTasks()
    }, 300)
  }
})()

const optimizeTasks = async () => {
  try {
    const response = await multiAgentAPI.optimizeTaskAllocation()
    if (response.success) {
      ElMessage.success('任务分配优化成功')
      loadTasks()
    }
  } catch (error) {
    console.error('Optimize tasks failed:', error)
    ElMessage.error('任务分配优化失败')
  }
}

const handleTaskAction = async (command: string, task: CollaborationTask) => {
  switch (command) {
    case 'view':
      currentTask.value = task
      showDetailDialog.value = true
      break
    case 'edit':
      // 编辑任务
      break
    case 'assign':
      assignAgents(task)
      break
    case 'monitor':
      monitorTask(task)
      break
    case 'cancel':
      await cancelTask(task)
      break
  }
}

const assignAgents = (task: CollaborationTask) => {
  assigningTask.value = task
  showAssignDialog.value = true
}

const monitorTask = (task: CollaborationTask) => {
  ElMessage.info('实时监控功能开发中')
}

const viewResults = (task: CollaborationTask) => {
  currentTask.value = task
  showDetailDialog.value = true
}

const cancelTask = async (task: CollaborationTask) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消任务 "${task.title}" 吗？`,
      '确认取消',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await multiAgentAPI.updateTaskStatus(task.id, TaskStatus.CANCELLED)
    if (response.success) {
      ElMessage.success('任务取消成功')
      loadTasks()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Cancel task failed:', error)
      ElMessage.error('取消任务失败')
    }
  }
}

const handleTaskCreated = () => {
  showCreateDialog.value = false
  ElMessage.success('任务创建成功')
  loadTasks()
}

const handleTaskAssigned = () => {
  showAssignDialog.value = false
  ElMessage.success('智能体分配成功')
  loadTasks()
}

// 辅助方法
const getPriorityType = (priority: TaskPriority) => {
  const typeMap = {
    [TaskPriority.LOW]: 'info',
    [TaskPriority.MEDIUM]: 'primary',
    [TaskPriority.HIGH]: 'warning',
    [TaskPriority.URGENT]: 'danger',
    [TaskPriority.CRITICAL]: 'danger'
  }
  return typeMap[priority] || 'info'
}

const getPriorityText = (priority: TaskPriority) => {
  const textMap = {
    [TaskPriority.LOW]: '低',
    [TaskPriority.MEDIUM]: '中',
    [TaskPriority.HIGH]: '高',
    [TaskPriority.URGENT]: '紧急',
    [TaskPriority.CRITICAL]: '关键'
  }
  return textMap[priority] || priority
}

const getStatusType = (status: TaskStatus) => {
  const typeMap = {
    [TaskStatus.PENDING]: 'info',
    [TaskStatus.ASSIGNED]: 'primary',
    [TaskStatus.IN_PROGRESS]: 'warning',
    [TaskStatus.COMPLETED]: 'success',
    [TaskStatus.FAILED]: 'danger',
    [TaskStatus.CANCELLED]: 'info'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: TaskStatus) => {
  const textMap = {
    [TaskStatus.PENDING]: '待分配',
    [TaskStatus.ASSIGNED]: '已分配',
    [TaskStatus.IN_PROGRESS]: '进行中',
    [TaskStatus.COMPLETED]: '已完成',
    [TaskStatus.FAILED]: '失败',
    [TaskStatus.CANCELLED]: '已取消'
  }
  return textMap[status] || status
}

const getProgressStatus = (status: TaskStatus) => {
  if (status === TaskStatus.COMPLETED) return 'success'
  if (status === TaskStatus.FAILED) return 'exception'
  return undefined
}

const getAgentName = (agentId: string) => {
  const agent = agents.value.find(a => a.id === agentId)
  return agent ? agent.name : `智能体 ${agentId}`
}

const getCompletedSubtasks = (task: CollaborationTask) => {
  if (!task.subtasks) return 0
  return task.subtasks.filter(subtask => subtask.status === TaskStatus.COMPLETED).length
}

const formatTime = (time: string) => {
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 暴露方法给父组件
defineExpose({
  loadTasks,
  refresh: loadTasks
})
</script>

<style lang="scss" scoped>
.task-management {
  .task-overview {
    margin-bottom: 24px;

    .overview-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;

      .overview-item {
        display: flex;
        align-items: center;
        gap: 16px;

        .item-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;

          &.total {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          &.progress {
            background: linear-gradient(135deg, #ffa726 0%, #ff7043 100%);
            color: white;
          }

          &.completed {
            background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
            color: white;
          }

          &.efficiency {
            background: linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%);
            color: white;
          }
        }

        .item-info {
          .item-value {
            font-size: 24px;
            font-weight: 700;
            color: #303133;
            line-height: 1.2;
          }

          .item-label {
            font-size: 13px;
            color: #909399;
          }
        }
      }
    }
  }

  .task-list-card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .header-left {
        h3 {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 600;
          color: #303133;
        }

        .total-count {
          font-size: 14px;
          color: #909399;
        }
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }

    .filter-section {
      margin-bottom: 20px;
    }

    .task-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 20px;
      margin-bottom: 20px;

      .task-card {
        background: white;
        border: 1px solid #e4e7ed;
        border-radius: 12px;
        padding: 20px;
        transition: all 0.3s ease;
        position: relative;

        &:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        &.high-priority {
          border-left: 4px solid #f56c6c;
        }

        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;

          .task-info {
            flex: 1;

            .task-title {
              margin: 0 0 8px 0;
              font-size: 16px;
              font-weight: 600;
              color: #303133;
              line-height: 1.4;
            }

            .task-meta {
              display: flex;
              align-items: center;
              gap: 8px;
              flex-wrap: wrap;

              .task-type {
                font-size: 12px;
                color: #909399;
                background: #f4f4f5;
                padding: 2px 6px;
                border-radius: 4px;
              }
            }
          }
        }

        .task-description {
          color: #606266;
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .task-progress {
          margin-bottom: 16px;

          .progress-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            font-size: 13px;

            .progress-percentage {
              font-weight: 600;
              color: #303133;
            }
          }

          .progress-detail {
            font-size: 12px;
            color: #909399;
            margin-top: 4px;
          }
        }

        .task-agents {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;

          .agents-label {
            font-size: 13px;
            color: #606266;
            min-width: 80px;
          }

          .agents-list {
            display: flex;
            align-items: center;
            gap: 8px;

            .agent-avatar {
              cursor: pointer;
              border: 2px solid #fff;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
          }
        }

        .subtasks {
          margin-bottom: 16px;

          .subtasks-header {
            font-size: 13px;
            color: #606266;
            margin-bottom: 8px;
          }

          .subtasks-list {
            .subtask-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 6px 8px;
              background: #f8f9fa;
              border-radius: 6px;
              margin-bottom: 6px;

              .subtask-name {
                font-size: 12px;
                color: #303133;
                flex: 1;
                margin-right: 8px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
            }

            .subtask-more {
              font-size: 12px;
              color: #909399;
              text-align: center;
              padding: 4px;
            }
          }
        }

        .task-time {
          border-top: 1px solid #f0f0f0;
          padding-top: 12px;
          margin-bottom: 16px;

          .time-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: #909399;
            margin-bottom: 4px;

            &.deadline {
              color: #e6a23c;
            }
          }
        }

        .task-footer {
          display: flex;
          gap: 8px;
        }
      }
    }

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }
}

@media (max-width: 768px) {
  .task-management {
    .overview-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 16px;
    }

    .list-header {
      flex-direction: column !important;
      gap: 16px;
      align-items: stretch !important;
    }

    .filter-section {
      .el-row {
        .el-col {
          margin-bottom: 12px;
        }
      }
    }

    .task-grid {
      grid-template-columns: 1fr !important;
      gap: 16px;
    }
  }
}
</style>