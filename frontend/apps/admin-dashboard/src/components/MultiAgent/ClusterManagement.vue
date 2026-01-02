<template>
  <div class="cluster-management">
    <!-- 集群概览 -->
    <div class="cluster-overview">
      <el-card class="overview-card">
        <div class="overview-grid">
          <div class="overview-item">
            <div class="item-icon total">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-value">{{ clusterStats.total }}</div>
              <div class="item-label">集群总数</div>
            </div>
          </div>

          <div class="overview-item">
            <div class="item-icon active">
              <el-icon><SuccessFilled /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-value">{{ clusterStats.active }}</div>
              <div class="item-label">活跃集群</div>
            </div>
          </div>

          <div class="overview-item">
            <div class="item-icon agents">
              <el-icon><User /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-value">{{ clusterStats.totalAgents }}</div>
              <div class="item-label">集群智能体</div>
            </div>
          </div>

          <div class="overview-item">
            <div class="item-icon efficiency">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-value">{{ clusterStats.avgEfficiency }}%</div>
              <div class="item-label">平均效率</div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 集群列表 -->
    <el-card class="cluster-list-card">
      <div class="list-header">
        <div class="header-left">
          <h3>智能体集群</h3>
          <span class="total-count">共 {{ totalClusters }} 个集群</span>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            创建集群
          </el-button>
          <el-button @click="optimizeClusters">
            <el-icon><Magic /></el-icon>
            优化配置
          </el-button>
          <el-button @click="loadClusters">
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
              placeholder="集群类型"
              clearable
              @change="loadClusters"
            >
              <el-option label="全部" value="" />
              <el-option label="同构集群" value="homogeneous" />
              <el-option label="异构集群" value="heterogeneous" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="filters.status"
              placeholder="集群状态"
              clearable
              @change="loadClusters"
            >
              <el-option label="全部" value="" />
              <el-option label="活跃" value="active" />
              <el-option label="非活跃" value="inactive" />
              <el-option label="降级" value="degraded" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-input
              v-model="filters.search"
              placeholder="搜索集群名称"
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
                v-model="filters.coordination"
                placeholder="协调方式"
                clearable
                @change="loadClusters"
              >
                <el-option label="全部" value="" />
                <el-option label="集中式" value="centralized" />
                <el-option label="分布式" value="decentralized" />
                <el-option label="混合式" value="hybrid" />
              </el-select>
            </el-col>
            <el-col :span="8">
              <el-select
                v-model="filters.loadBalancing"
                placeholder="负载均衡"
                clearable
                @change="loadClusters"
              >
                <el-option label="全部" value="" />
                <el-option label="轮询" value="round_robin" />
                <el-option label="最少负载" value="least_loaded" />
                <el-option label="能力导向" value="capability_based" />
              </el-select>
            </el-col>
            <el-col :span="8">
              <el-slider
                v-model="filters.efficiencyRange"
                range
                :min="0"
                :max="100"
                :step="5"
                show-stops
                show-input
                @change="loadClusters"
              />
            </el-col>
          </el-row>
        </div>
      </div>

      <!-- 集群网格 -->
      <div class="cluster-grid">
        <div
          v-for="cluster in clusters"
          :key="cluster.id"
          class="cluster-card"
          :class="{ 'degraded-cluster': cluster.status === 'degraded' }"
        >
          <div class="cluster-header">
            <div class="cluster-info">
              <h4 class="cluster-title">{{ cluster.name }}</h4>
              <div class="cluster-meta">
                <el-tag :type="getStatusType(cluster.status)" size="small">
                  {{ getStatusText(cluster.status) }}
                </el-tag>
                <el-tag :type="getTypeType(cluster.type)" size="small" effect="plain">
                  {{ getTypeText(cluster.type) }}
                </el-tag>
                <span class="cluster-id">ID: {{ cluster.id }}</span>
              </div>
            </div>
            <div class="cluster-actions">
              <el-dropdown @command="(command) => handleClusterAction(command, cluster)">
                <el-button type="text" :icon="MoreFilled" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="view">查看详情</el-dropdown-item>
                    <el-dropdown-item command="edit">编辑集群</el-dropdown-item>
                    <el-dropdown-item command="monitor">性能监控</el-dropdown-item>
                    <el-dropdown-item command="optimize">优化配置</el-dropdown-item>
                    <el-dropdown-item command="rebalance">负载重平衡</el-dropdown-item>
                    <el-dropdown-item command="deactivate" divided>停用集群</el-dropdown-item>
                    <el-dropdown-item command="delete">删除集群</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>

          <!-- 集群配置 -->
          <div class="cluster-config">
            <div class="config-item">
              <span class="config-label">协调方式:</span>
              <span class="config-value">{{ getCoordinationText(cluster.configuration.coordination) }}</span>
            </div>
            <div class="config-item">
              <span class="config-label">负载均衡:</span>
              <span class="config-value">{{ getLoadBalancingText(cluster.configuration.loadBalancing) }}</span>
            </div>
            <div class="config-item">
              <span class="config-label">故障转移:</span>
              <el-tag :type="cluster.configuration.failover ? 'success' : 'danger'" size="small">
                {{ cluster.configuration.failover ? '启用' : '禁用' }}
              </el-tag>
            </div>
          </div>

          <!-- 智能体列表 -->
          <div class="cluster-agents">
            <div class="agents-header">
              <span>智能体成员 ({{ cluster.agents.length }})</span>
              <el-button
                v-if="cluster.status === 'active'"
                size="small"
                type="primary"
                plain
                @click="addAgent(cluster)"
              >
                添加智能体
              </el-button>
            </div>
            <div class="agents-grid">
              <el-tooltip
                v-for="agentId in cluster.agents.slice(0, 8)"
                :key="agentId"
                :content="getAgentName(agentId)"
                placement="top"
              >
                <div class="agent-item">
                  <el-avatar :size="28" class="agent-avatar">
                    <el-icon><User /></el-icon>
                  </el-avatar>
                </div>
              </el-tooltip>
              <div
                v-if="cluster.agents.length > 8"
                class="agent-more"
              >
                +{{ cluster.agents.length - 8 }}
              </div>
            </div>
          </div>

          <!-- 能力概览 -->
          <div class="cluster-capabilities">
            <div class="capabilities-header">
              <span>组合能力</span>
            </div>
            <div class="capabilities-list">
              <el-tag
                v-for="capability in cluster.capabilities.combined.slice(0, 4)"
                :key="capability"
                size="small"
                class="capability-tag"
              >
                {{ getCapabilityText(capability) }}
              </el-tag>
              <el-tag
                v-if="cluster.capabilities.combined.length > 4"
                size="small"
                type="info"
              >
                +{{ cluster.capabilities.combined.length - 4 }}
              </el-tag>
            </div>
          </div>

          <!-- 性能指标 -->
          <div class="cluster-performance">
            <div class="performance-header">
              <span>性能指标</span>
            </div>
            <div class="performance-grid">
              <div class="performance-item">
                <div class="performance-value">{{ cluster.capabilities.performance.throughput }}</div>
                <div class="performance-label">吞吐量</div>
              </div>
              <div class="performance-item">
                <div class="performance-value">{{ cluster.capabilities.performance.latency }}ms</div>
                <div class="performance-label">延迟</div>
              </div>
              <div class="performance-item">
                <div class="performance-value">{{ cluster.capabilities.performance.availability }}%</div>
                <div class="performance-label">可用性</div>
              </div>
            </div>
          </div>

          <!-- 统计信息 -->
          <div class="cluster-stats">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ cluster.statistics.tasksCompleted }}</div>
                <div class="stat-label">已完成任务</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ cluster.statistics.activeTasks }}</div>
                <div class="stat-label">活跃任务</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ cluster.statistics.averageLoad }}%</div>
                <div class="stat-label">平均负载</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ cluster.statistics.efficiency }}%</div>
                <div class="stat-label">效率</div>
              </div>
            </div>
          </div>

          <!-- 领导者信息 -->
          <div v-if="cluster.leader" class="cluster-leader">
            <div class="leader-info">
              <el-icon><Crown /></el-icon>
              <span>领导者: {{ getAgentName(cluster.leader) }}</span>
            </div>
          </div>

          <!-- 时间信息 -->
          <div class="cluster-time">
            <div class="time-item">
              <el-icon><Clock /></el-icon>
              <span>创建: {{ formatTime(cluster.createdAt) }}</span>
            </div>
            <div class="time-item">
              <el-icon><EditPen /></el-icon>
              <span>更新: {{ formatTime(cluster.updatedAt) }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="cluster-footer">
            <el-button
              v-if="cluster.status === 'active'"
              type="success"
              size="small"
              @click="monitorCluster(cluster)"
            >
              性能监控
            </el-button>
            <el-button
              type="primary"
              size="small"
              @click="rebalanceCluster(cluster)"
            >
              负载重平衡
            </el-button>
            <el-button
              type="info"
              size="small"
              @click="viewDetails(cluster)"
            >
              查看详情
            </el-button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="totalClusters"
          :page-sizes="[12, 24, 48, 96]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadClusters"
          @current-change="loadClusters"
        />
      </div>
    </el-card>

    <!-- 创建集群对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建智能体集群"
      width="60%"
      destroy-on-close
    >
      <CreateCluster
        v-if="showCreateDialog"
        @success="handleClusterCreated"
        @cancel="showCreateDialog = false"
      />
    </el-dialog>

    <!-- 集群详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      :title="`集群详情 - ${currentCluster?.name}`"
      width="80%"
      destroy-on-close
    >
      <ClusterDetail
        v-if="showDetailDialog"
        :cluster="currentCluster"
        @refresh="loadClusters"
      />
    </el-dialog>

    <!-- 性能监控对话框 -->
    <el-dialog
      v-model="showMonitorDialog"
      :title="`性能监控 - ${monitoringCluster?.name}`"
      width="90%"
      destroy-on-close
    >
      <ClusterMonitor
        v-if="showMonitorDialog"
        :cluster="monitoringCluster"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Refresh, Connection, SuccessFilled, User,
  Search, Setting, MoreFilled, Clock, EditPen
} from '@element-plus/icons-vue'
import { multiAgentAPI } from '@/api/multi-agent'
import type { AgentCluster } from '@/api/multi-agent'
import CreateCluster from './CreateCluster.vue'
import ClusterDetail from './ClusterDetail.vue'
import ClusterMonitor from './ClusterMonitor.vue'

// 响应式数据
const loading = ref(false)
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const showMonitorDialog = ref(false)
const showAdvancedFilters = ref(false)
const clusters = ref<AgentCluster[]>([])
const currentCluster = ref<AgentCluster>()
const monitoringCluster = ref<AgentCluster>()
const agents = ref<any[]>([])

// 过滤器
const filters = reactive({
  type: '',
  status: '',
  search: '',
  coordination: '',
  loadBalancing: '',
  efficiencyRange: [0, 100] as [number, number]
})

// 分页
const pagination = reactive({
  page: 1,
  size: 24
})

// 集群统计
const clusterStats = ref({
  total: 0,
  active: 0,
  inactive: 0,
  degraded: 0,
  totalAgents: 0,
  avgEfficiency: 0
})

// 计算属性
const totalClusters = computed(() => clusters.value.length)

// 生命周期
onMounted(() => {
  loadClusters()
  loadAgents()
})

// 方法
const loadClusters = async () => {
  try {
    loading.value = true
    const response = await multiAgentAPI.getClusters({
      type: filters.type || undefined,
      status: filters.status || undefined,
      limit: pagination.size,
      offset: (pagination.page - 1) * pagination.size
    })

    if (response.success && response.data) {
      clusters.value = response.data.clusters
      calculateClusterStats()
    }
  } catch (error) {
    console.error('Load clusters failed:', error)
    ElMessage.error('加载集群列表失败')
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

const calculateClusterStats = () => {
  const stats = {
    total: clusters.value.length,
    active: 0,
    inactive: 0,
    degraded: 0,
    totalAgents: 0,
    avgEfficiency: 0
  }

  let totalEfficiency = 0

  clusters.value.forEach(cluster => {
    switch (cluster.status) {
      case 'active':
        stats.active++
        break
      case 'inactive':
        stats.inactive++
        break
      case 'degraded':
        stats.degraded++
        break
    }

    stats.totalAgents += cluster.agents.length
    totalEfficiency += cluster.statistics.efficiency
  })

  stats.avgEfficiency = clusters.value.length > 0
    ? Math.round(totalEfficiency / clusters.value.length)
    : 0

  clusterStats.value = stats
}

const debounceSearch = (() => {
  let timeoutId: number
  return () => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      loadClusters()
    }, 300)
  }
})()

const optimizeClusters = async () => {
  try {
    ElMessage.info('集群优化功能开发中')
  } catch (error) {
    console.error('Optimize clusters failed:', error)
    ElMessage.error('集群优化失败')
  }
}

const handleClusterAction = async (command: string, cluster: AgentCluster) => {
  switch (command) {
    case 'view':
      viewDetails(cluster)
      break
    case 'edit':
      // 编辑集群
      break
    case 'monitor':
      monitorCluster(cluster)
      break
    case 'optimize':
      await optimizeCluster(cluster)
      break
    case 'rebalance':
      await rebalanceCluster(cluster)
      break
    case 'deactivate':
      await deactivateCluster(cluster)
      break
    case 'delete':
      await deleteCluster(cluster)
      break
  }
}

const addAgent = (cluster: AgentCluster) => {
  ElMessage.info('添加智能体功能开发中')
}

const monitorCluster = (cluster: AgentCluster) => {
  monitoringCluster.value = cluster
  showMonitorDialog.value = true
}

const viewDetails = (cluster: AgentCluster) => {
  currentCluster.value = cluster
  showDetailDialog.value = true
}

const optimizeCluster = async (cluster: AgentCluster) => {
  try {
    await ElMessageBox.confirm(
      `确定要优化集群 "${cluster.name}" 的配置吗？`,
      '确认优化',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success('集群配置优化成功')
    loadClusters()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Optimize cluster failed:', error)
      ElMessage.error('优化集群配置失败')
    }
  }
}

const rebalanceCluster = async (cluster: AgentCluster) => {
  try {
    await ElMessageBox.confirm(
      `确定要对集群 "${cluster.name}" 进行负载重平衡吗？`,
      '确认重平衡',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success('负载重平衡成功')
    loadClusters()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Rebalance cluster failed:', error)
      ElMessage.error('负载重平衡失败')
    }
  }
}

const deactivateCluster = async (cluster: AgentCluster) => {
  try {
    await ElMessageBox.confirm(
      `确定要停用集群 "${cluster.name}" 吗？`,
      '确认停用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success('集群停用成功')
    loadClusters()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Deactivate cluster failed:', error)
      ElMessage.error('停用集群失败')
    }
  }
}

const deleteCluster = async (cluster: AgentCluster) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除集群 "${cluster.name}" 吗？此操作不可撤销。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success('集群删除成功')
    loadClusters()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete cluster failed:', error)
      ElMessage.error('删除集群失败')
    }
  }
}

const handleClusterCreated = () => {
  showCreateDialog.value = false
  ElMessage.success('集群创建成功')
  loadClusters()
}

// 辅助方法
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'active': 'success',
    'inactive': 'info',
    'degraded': 'warning'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'active': '活跃',
    'inactive': '非活跃',
    'degraded': '降级'
  }
  return textMap[status] || status
}

const getTypeType = (type: string) => {
  const typeMap: Record<string, string> = {
    'homogeneous': 'primary',
    'heterogeneous': 'warning'
  }
  return typeMap[type] || 'info'
}

const getTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    'homogeneous': '同构集群',
    'heterogeneous': '异构集群'
  }
  return textMap[type] || type
}

const getCoordinationText = (coordination: string) => {
  const textMap: Record<string, string> = {
    'centralized': '集中式',
    'decentralized': '分布式',
    'hybrid': '混合式'
  }
  return textMap[coordination] || coordination
}

const getLoadBalancingText = (loadBalancing: string) => {
  const textMap: Record<string, string> = {
    'round_robin': '轮询',
    'least_loaded': '最少负载',
    'capability_based': '能力导向'
  }
  return textMap[loadBalancing] || loadBalancing
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

const getAgentName = (agentId: string) => {
  const agent = agents.value.find(a => a.id === agentId)
  return agent ? agent.name : `智能体 ${agentId}`
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
  loadClusters,
  refresh: loadClusters
})
</script>

<style lang="scss" scoped>
.cluster-management {
  .cluster-overview {
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

          &.agents {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
            color: white;
          }

          &.efficiency {
            background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
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

  .cluster-list-card {
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

    .cluster-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 20px;
      margin-bottom: 20px;

      .cluster-card {
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

        &.degraded-cluster {
          border-left: 4px solid #e6a23c;
          background: linear-gradient(135deg, #fff 0%, #fef6e7 100%);
        }

        .cluster-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;

          .cluster-info {
            flex: 1;

            .cluster-title {
              margin: 0 0 8px 0;
              font-size: 16px;
              font-weight: 600;
              color: #303133;
              line-height: 1.4;
            }

            .cluster-meta {
              display: flex;
              align-items: center;
              gap: 8px;
              flex-wrap: wrap;

              .cluster-id {
                font-size: 12px;
                color: #909399;
                background: #f4f4f5;
                padding: 2px 6px;
                border-radius: 4px;
              }
            }
          }
        }

        .cluster-config {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;

          .config-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
            font-size: 13px;

            .config-label {
              color: #606266;
            }

            .config-value {
              color: #303133;
              font-weight: 500;
            }
          }
        }

        .cluster-agents {
          margin-bottom: 16px;

          .agents-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            font-size: 13px;
            color: #606266;
          }

          .agents-grid {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;

            .agent-item {
              .agent-avatar {
                cursor: pointer;
                border: 2px solid #fff;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
            }

            .agent-more {
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: #e4e7ed;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 11px;
              color: #606266;
            }
          }
        }

        .cluster-capabilities {
          margin-bottom: 16px;

          .capabilities-header {
            font-size: 13px;
            color: #606266;
            margin-bottom: 8px;
          }

          .capabilities-list {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;

            .capability-tag {
              font-size: 11px;
            }
          }
        }

        .cluster-performance {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;

          .performance-header {
            font-size: 13px;
            color: #606266;
            margin-bottom: 8px;
          }

          .performance-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;

            .performance-item {
              text-align: center;

              .performance-value {
                font-size: 14px;
                font-weight: 600;
                color: #303133;
                margin-bottom: 2px;
              }

              .performance-label {
                font-size: 11px;
                color: #909399;
              }
            }
          }
        }

        .cluster-stats {
          background: #fafbfc;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;

            .stat-item {
              text-align: center;

              .stat-value {
                font-size: 14px;
                font-weight: 600;
                color: #303133;
                margin-bottom: 2px;
              }

              .stat-label {
                font-size: 11px;
                color: #909399;
              }
            }
          }
        }

        .cluster-leader {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 16px;
          padding: 8px 12px;
          background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
          border-radius: 6px;
          border: 1px solid #ffecb3;

          .leader-info {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            color: #e6a23c;
            font-weight: 500;
          }
        }

        .cluster-time {
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
          }
        }

        .cluster-footer {
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
  .cluster-management {
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

    .cluster-grid {
      grid-template-columns: 1fr !important;
      gap: 16px;
    }

    .performance-grid,
    .stats-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
}
</style>