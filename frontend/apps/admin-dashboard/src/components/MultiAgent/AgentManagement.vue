<template>
  <div class="agent-management">
    <!-- 智能体概览 -->
    <div class="agent-overview">
      <el-card class="overview-card">
        <div class="overview-grid">
          <div class="overview-item">
            <div class="item-icon total">
              <el-icon><User /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-value">{{ agentStats.total }}</div>
              <div class="item-label">智能体总数</div>
            </div>
          </div>

          <div class="overview-item">
            <div class="item-icon active">
              <el-icon><SuccessFilled /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-value">{{ agentStats.active }}</div>
              <div class="item-label">活跃智能体</div>
            </div>
          </div>

          <div class="overview-item">
            <div class="item-icon busy">
              <el-icon><Loading /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-value">{{ agentStats.busy }}</div>
              <div class="item-label">忙碌智能体</div>
            </div>
          </div>

          <div class="overview-item">
            <div class="item-icon efficiency">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-value">{{ agentStats.avgEfficiency }}%</div>
              <div class="item-label">平均效率</div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 智能体列表 -->
    <el-card class="agent-list-card">
      <div class="list-header">
        <div class="header-left">
          <h3>智能体列表</h3>
          <span class="total-count">共 {{ totalAgents }} 个智能体</span>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            注册智能体
          </el-button>
          <el-button @click="loadAgents">
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
              v-model="filters.type"
              placeholder="智能体类型"
              clearable
              @change="loadAgents"
            >
              <el-option label="全部" value="" />
              <el-option label="人类智能体" :value="AgentType.HUMAN" />
              <el-option label="AI智能体" :value="AgentType.AI" />
              <el-option label="机器人智能体" :value="AgentType.ROBOT" />
              <el-option label="环境智能体" :value="AgentType.ENVIRONMENT" />
              <el-option label="虚拟智能体" :value="AgentType.VIRTUAL" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="filters.status"
              placeholder="状态"
              clearable
              @change="loadAgents"
            >
              <el-option label="全部" value="" />
              <el-option label="活跃" :value="AgentStatus.ACTIVE" />
              <el-option label="空闲" :value="AgentStatus.IDLE" />
              <el-option label="忙碌" :value="AgentStatus.BUSY" />
              <el-option label="离线" :value="AgentStatus.OFFLINE" />
              <el-option label="错误" :value="AgentStatus.ERROR" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-input
              v-model="filters.search"
              placeholder="搜索智能体名称"
              clearable
              @input="debounceSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="6">
            <el-button @click="showAdvancedFilters = !showAdvancedFilters">
              <el-icon><Setting /></el-icon>
              高级筛选
            </el-button>
          </el-col>
        </el-row>

        <!-- 高级过滤器 -->
        <div v-if="showAdvancedFilters" class="advanced-filters">
          <el-row :gutter="16">
            <el-col :span="8">
              <el-select
                v-model="filters.capability"
                placeholder="能力要求"
                clearable
                @change="loadAgents"
              >
                <el-option label="全部" value="" />
                <el-option label="自然语言处理" value="nlp" />
                <el-option label="计算机视觉" value="computer_vision" />
                <el-option label="数据分析" value="data_analysis" />
                <el-option label="决策支持" value="decision_support" />
                <el-option label="任务执行" value="task_execution" />
              </el-select>
            </el-col>
            <el-col :span="8">
              <el-select
                v-model="filters.location"
                placeholder="位置区域"
                clearable
                @change="loadAgents"
              >
                <el-option label="全部" value="" />
                <el-option label="厨房" value="kitchen" />
                <el-option label="用餐区" value="dining" />
                <el-option label="仓储" value="storage" />
                <el-option label="前台" value="reception" />
                <el-option label="管理" value="management" />
              </el-select>
            </el-col>
            <el-col :span="8">
              <el-slider
                v-model="filters.loadRange"
                range
                :min="0"
                :max="100"
                :step="5"
                show-stops
                show-input
                @change="loadAgents"
              />
            </el-col>
          </el-row>
        </div>
      </div>

      <!-- 智能体表格 -->
      <el-table
        v-loading="loading"
        :data="agents"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column label="智能体信息" min-width="200">
          <template #default="{ row }">
            <div class="agent-info">
              <div class="agent-avatar">
                <el-avatar :size="40" :src="row.avatar">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <div class="status-dot" :class="row.status"></div>
              </div>
              <div class="agent-details">
                <div class="agent-name">{{ row.name }}</div>
                <div class="agent-type">{{ getAgentTypeText(row.type) }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="负载" width="120">
          <template #default="{ row }">
            <div class="load-info">
              <el-progress
                :percentage="row.currentLoad"
                :status="getLoadStatus(row.currentLoad)"
                :show-text="false"
                :stroke-width="8"
              />
              <span class="load-text">{{ row.currentLoad }}%</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="能力" min-width="200">
          <template #default="{ row }">
            <div class="capabilities">
              <el-tag
                v-for="capability in row.capabilities.slice(0, 3)"
                :key="capability"
                size="small"
                class="capability-tag"
              >
                {{ getCapabilityText(capability) }}
              </el-tag>
              <el-tag
                v-if="row.capabilities.length > 3"
                size="small"
                type="info"
              >
                +{{ row.capabilities.length - 3 }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="性能指标" width="150">
          <template #default="{ row }">
            <div class="performance-metrics">
              <div class="metric-item">
                <span class="metric-label">成功率:</span>
                <span class="metric-value">{{ row.performance.successRate }}%</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">响应:</span>
                <span class="metric-value">{{ row.performance.averageResponseTime }}ms</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="位置" width="120">
          <template #default="{ row }">
            <div v-if="row.location" class="location-info">
              <el-icon><Location /></el-icon>
              <span>{{ row.location.zone }}</span>
            </div>
            <span v-else class="text-placeholder">-</span>
          </template>
        </el-table-column>

        <el-table-column label="最后活跃" width="150">
          <template #default="{ row }">
            <div class="last-active">
              {{ formatTime(row.lastSeen) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                type="primary"
                size="small"
                link
                @click="viewAgent(row)"
              >
                详情
              </el-button>
              <el-button
                type="success"
                size="small"
                link
                @click="editAgent(row)"
              >
                编辑
              </el-button>
              <el-dropdown @command="(command) => handleAction(command, row)">
                <el-button type="info" size="small" link>
                  更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="performance">性能分析</el-dropdown-item>
                    <el-dropdown-item command="assign">分配任务</el-dropdown-item>
                    <el-dropdown-item command="cluster">集群管理</el-dropdown-item>
                    <el-dropdown-item command="logs">查看日志</el-dropdown-item>
                    <el-dropdown-item command="restart" divided>重启</el-dropdown-item>
                    <el-dropdown-item command="unregister">注销</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="totalAgents"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadAgents"
          @current-change="loadAgents"
        />
      </div>

      <!-- 批量操作 -->
      <div v-if="selectedAgents.length > 0" class="batch-actions">
        <div class="batch-info">
          已选择 {{ selectedAgents.length }} 个智能体
        </div>
        <div class="batch-buttons">
          <el-button type="primary" @click="batchAssign">批量分配任务</el-button>
          <el-button type="success" @click="batchCluster">加入集群</el-button>
          <el-button type="warning" @click="batchRestart">批量重启</el-button>
          <el-button type="danger" @click="batchUnregister">批量注销</el-button>
        </div>
      </div>
    </el-card>

    <!-- 智能体详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      :title="`智能体详情 - ${currentAgent?.name}`"
      width="80%"
      destroy-on-close
    >
      <AgentDetail
        v-if="showDetailDialog"
        :agent="currentAgent"
        @refresh="loadAgents"
      />
    </el-dialog>

    <!-- 注册智能体对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="注册智能体"
      width="60%"
      destroy-on-close
    >
      <RegisterAgent
        v-if="showCreateDialog"
        @success="handleAgentRegistered"
        @cancel="showCreateDialog = false"
      />
    </el-dialog>

    <!-- 编辑智能体对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑智能体"
      width="60%"
      destroy-on-close
    >
      <EditAgent
        v-if="showEditDialog"
        :agent="editingAgent"
        @success="handleAgentUpdated"
        @cancel="showEditDialog = false"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Refresh, User, SuccessFilled, Loading, TrendCharts,
  Search, Setting, ArrowDown, Location
} from '@element-plus/icons-vue'
import { multiAgentAPI } from '@/api/multi-agent'
import type { Agent, AgentType, AgentStatus } from '@/api/multi-agent'
import AgentDetail from './AgentDetail.vue'
import RegisterAgent from './RegisterAgent.vue'
import EditAgent from './EditAgent.vue'

// 响应式数据
const loading = ref(false)
const showDetailDialog = ref(false)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showAdvancedFilters = ref(false)
const agents = ref<Agent[]>([])
const selectedAgents = ref<Agent[]>([])
const currentAgent = ref<Agent>()
const editingAgent = ref<Agent>()

// 过滤器
const filters = reactive({
  type: '' as AgentType | '',
  status: '' as AgentStatus | '',
  search: '',
  capability: '',
  location: '',
  loadRange: [0, 100] as [number, number]
})

// 分页
const pagination = reactive({
  page: 1,
  size: 20
})

// 智能体统计
const agentStats = ref({
  total: 0,
  active: 0,
  busy: 0,
  idle: 0,
  offline: 0,
  avgEfficiency: 0
})

// 计算属性
const totalAgents = computed(() => agents.value.length)

// 生命周期
onMounted(() => {
  loadAgents()
})

// 方法
const loadAgents = async () => {
  try {
    loading.value = true
    const response = await multiAgentAPI.getAgents({
      type: filters.type || undefined,
      status: filters.status || undefined,
      capability: filters.capability || undefined,
      location: filters.location || undefined,
      limit: pagination.size,
      offset: (pagination.page - 1) * pagination.size
    })

    if (response.success && response.data) {
      agents.value = response.data.agents
      calculateStats()
    }
  } catch (error) {
    console.error('Load agents failed:', error)
    ElMessage.error('加载智能体列表失败')
  } finally {
    loading.value = false
  }
}

const calculateStats = () => {
  const stats = {
    total: agents.value.length,
    active: 0,
    busy: 0,
    idle: 0,
    offline: 0,
    avgEfficiency: 0
  }

  let totalEfficiency = 0

  agents.value.forEach(agent => {
    switch (agent.status) {
      case AgentStatus.ACTIVE:
        stats.active++
        break
      case AgentStatus.BUSY:
        stats.busy++
        break
      case AgentStatus.IDLE:
        stats.idle++
        break
      case AgentStatus.OFFLINE:
        stats.offline++
        break
    }
    totalEfficiency += agent.performance.successRate
  })

  stats.avgEfficiency = agents.value.length > 0
    ? Math.round(totalEfficiency / agents.value.length)
    : 0

  agentStats.value = stats
}

const debounceSearch = (() => {
  let timeoutId: number
  return () => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      loadAgents()
    }, 300)
  }
})()

const handleSelectionChange = (selection: Agent[]) => {
  selectedAgents.value = selection
}

const viewAgent = (agent: Agent) => {
  currentAgent.value = agent
  showDetailDialog.value = true
}

const editAgent = (agent: Agent) => {
  editingAgent.value = agent
  showEditDialog.value = true
}

const handleAction = async (command: string, agent: Agent) => {
  switch (command) {
    case 'performance':
      viewAgent(agent)
      break
    case 'assign':
      // 跳转到任务分配
      break
    case 'cluster':
      // 跳转到集群管理
      break
    case 'logs':
      // 查看日志
      break
    case 'restart':
      await restartAgent(agent)
      break
    case 'unregister':
      await unregisterAgent(agent)
      break
  }
}

const restartAgent = async (agent: Agent) => {
  try {
    await ElMessageBox.confirm(
      `确定要重启智能体 "${agent.name}" 吗？`,
      '确认重启',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 调用重启API
    ElMessage.success('智能体重启成功')
    loadAgents()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Restart agent failed:', error)
      ElMessage.error('重启智能体失败')
    }
  }
}

const unregisterAgent = async (agent: Agent) => {
  try {
    await ElMessageBox.confirm(
      `确定要注销智能体 "${agent.name}" 吗？此操作不可撤销。`,
      '确认注销',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await multiAgentAPI.unregisterAgent(agent.id)
    if (response.success) {
      ElMessage.success('智能体注销成功')
      loadAgents()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Unregister agent failed:', error)
      ElMessage.error('注销智能体失败')
    }
  }
}

const batchAssign = () => {
  // 批量分配任务
  ElMessage.info('批量分配任务功能开发中')
}

const batchCluster = () => {
  // 批量加入集群
  ElMessage.info('批量集群管理功能开发中')
}

const batchRestart = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要重启选中的 ${selectedAgents.value.length} 个智能体吗？`,
      '确认批量重启',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success('批量重启成功')
    loadAgents()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Batch restart failed:', error)
      ElMessage.error('批量重启失败')
    }
  }
}

const batchUnregister = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要注销选中的 ${selectedAgents.value.length} 个智能体吗？此操作不可撤销。`,
      '确认批量注销',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success('批量注销成功')
    loadAgents()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Batch unregister failed:', error)
      ElMessage.error('批量注销失败')
    }
  }
}

const handleAgentRegistered = () => {
  showCreateDialog.value = false
  ElMessage.success('智能体注册成功')
  loadAgents()
}

const handleAgentUpdated = () => {
  showEditDialog.value = false
  ElMessage.success('智能体更新成功')
  loadAgents()
}

// 辅助方法
const getAgentTypeText = (type: AgentType) => {
  const typeMap = {
    [AgentType.HUMAN]: '人类智能体',
    [AgentType.AI]: 'AI智能体',
    [AgentType.ROBOT]: '机器人智能体',
    [AgentType.ENVIRONMENT]: '环境智能体',
    [AgentType.VIRTUAL]: '虚拟智能体'
  }
  return typeMap[type] || type
}

const getStatusText = (status: AgentStatus) => {
  const statusMap = {
    [AgentStatus.ACTIVE]: '活跃',
    [AgentStatus.IDLE]: '空闲',
    [AgentStatus.BUSY]: '忙碌',
    [AgentStatus.OFFLINE]: '离线',
    [AgentStatus.ERROR]: '错误'
  }
  return statusMap[status] || status
}

const getStatusType = (status: AgentStatus) => {
  const typeMap = {
    [AgentStatus.ACTIVE]: 'success',
    [AgentStatus.IDLE]: 'info',
    [AgentStatus.BUSY]: 'warning',
    [AgentStatus.OFFLINE]: 'info',
    [AgentStatus.ERROR]: 'danger'
  }
  return typeMap[status] || 'info'
}

const getLoadStatus = (load: number) => {
  if (load >= 90) return 'exception'
  if (load >= 70) return 'warning'
  return 'success'
}

const getCapabilityText = (capability: string) => {
  const capabilityMap: Record<string, string> = {
    'nlp': '自然语言处理',
    'computer_vision': '计算机视觉',
    'data_analysis': '数据分析',
    'decision_support': '决策支持',
    'task_execution': '任务执行',
    'coordination': '协调能力',
    'monitoring': '监控能力',
    'prediction': '预测分析'
  }
  return capabilityMap[capability] || capability
}

const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return date.toLocaleDateString()
  }
}

// 暴露方法给父组件
defineExpose({
  loadAgents,
  refresh: loadAgents
})
</script>

<style lang="scss" scoped>
.agent-management {
  .agent-overview {
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

          &.active {
            background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
            color: white;
          }

          &.busy {
            background: linear-gradient(135deg, #e6a23c 0%, #f7ba2a 100%);
            color: white;
          }

          &.efficiency {
            background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
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

  .agent-list-card {
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

      .advanced-filters {
        margin-top: 16px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;
      }
    }

    .agent-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .agent-avatar {
        position: relative;

        .status-dot {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;

          &.active {
            background-color: #67c23a;
          }

          &.idle {
            background-color: #909399;
          }

          &.busy {
            background-color: #e6a23c;
          }

          &.offline {
            background-color: #c0c4cc;
          }

          &.error {
            background-color: #f56c6c;
          }
        }
      }

      .agent-details {
        .agent-name {
          font-weight: 600;
          color: #303133;
          margin-bottom: 4px;
        }

        .agent-type {
          font-size: 12px;
          color: #909399;
        }
      }
    }

    .load-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .load-text {
        font-size: 12px;
        color: #606266;
        min-width: 35px;
      }
    }

    .capabilities {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;

      .capability-tag {
        font-size: 11px;
      }
    }

    .performance-metrics {
      .metric-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
        font-size: 12px;

        .metric-label {
          color: #909399;
        }

        .metric-value {
          color: #303133;
          font-weight: 500;
        }
      }
    }

    .location-info {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #606266;
    }

    .text-placeholder {
      color: #c0c4cc;
      font-size: 13px;
    }

    .last-active {
      font-size: 12px;
      color: #909399;
    }

    .action-buttons {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }

    .batch-actions {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      padding: 16px 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      z-index: 1000;

      .batch-info {
        font-size: 14px;
        color: #303133;
        font-weight: 500;
      }

      .batch-buttons {
        display: flex;
        gap: 8px;
      }
    }
  }
}

@media (max-width: 768px) {
  .agent-management {
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

    .batch-actions {
      width: calc(100vw - 40px);
      flex-direction: column;
      gap: 12px;
    }
  }
}
</style>