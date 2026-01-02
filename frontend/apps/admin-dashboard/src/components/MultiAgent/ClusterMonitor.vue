<template>
  <div class="cluster-monitor">
    <div class="monitor-header">
      <h3>集群监控 - {{ cluster.name }}</h3>
      <div class="monitor-actions">
        <el-button size="small" type="primary" @click="refreshData">
          <el-icon><Refresh /></el-icon> 刷新数据
        </el-button>
        <el-button size="small" @click="exportReport">
          <el-icon><Download /></el-icon> 导出报告
        </el-button>
      </div>
    </div>

    <div class="monitor-summary">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>CPU使用率</span>
              </div>
            </template>
            <div class="stat-value">
              <span class="value">{{ cluster.cpuUsage.toFixed(1) }}%</span>
              <el-progress
                type="circle"
                :percentage="cluster.cpuUsage"
                :stroke-width="10"
                :color="getProgressColor(cluster.cpuUsage)"
                style="width: 80px; height: 80px"
              />
            </div>
            <div class="stat-detail">
              总核心数: {{ cluster.totalCpuCores }}
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>内存使用率</span>
              </div>
            </template>
            <div class="stat-value">
              <span class="value">{{ cluster.memoryUsage.toFixed(1) }}%</span>
              <el-progress
                type="circle"
                :percentage="cluster.memoryUsage"
                :stroke-width="10"
                :color="getProgressColor(cluster.memoryUsage)"
                style="width: 80px; height: 80px"
              />
            </div>
            <div class="stat-detail">
              总内存: {{ formatMemory(cluster.totalMemory) }}
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>GPU使用率</span>
              </div>
            </template>
            <div class="stat-value">
              <span class="value">{{ cluster.gpuUsage.toFixed(1) }}%</span>
              <el-progress
                type="circle"
                :percentage="cluster.gpuUsage"
                :stroke-width="10"
                :color="getProgressColor(cluster.gpuUsage)"
                style="width: 80px; height: 80px"
              />
            </div>
            <div class="stat-detail">
              总GPU数: {{ cluster.totalGpus }}
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>存储使用率</span>
              </div>
            </template>
            <div class="stat-value">
              <span class="value">{{ cluster.storageUsage.toFixed(1) }}%</span>
              <el-progress
                type="circle"
                :percentage="cluster.storageUsage"
                :stroke-width="10"
                :color="getProgressColor(cluster.storageUsage)"
                style="width: 80px; height: 80px"
              />
            </div>
            <div class="stat-detail">
              总存储: {{ cluster.totalStorage }}GB
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="monitor-charts">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>资源使用率趋势</span>
              </div>
            </template>
            <div class="chart-container">
              <!-- 资源使用率趋势图表 -->
              <el-chart :data="usageTrendData">
                <el-line-series
                  :x-field="'time'"
                  :y-field="'cpu'"
                  name="CPU使用率"
                  :smooth="true"
                />
                <el-line-series
                  :x-field="'time'"
                  :y-field="'memory'"
                  name="内存使用率"
                  :smooth="true"
                />
                <el-line-series
                  :x-field="'time'"
                  :y-field="'gpu'"
                  name="GPU使用率"
                  :smooth="true"
                />
                <el-tooltip
                  :show-markers="true"
                  :show-crosshairs="true"
                  trigger="axis"
                />
                <el-legend position="top" />
                <el-x-axis grid />
                <el-y-axis />
              </el-chart>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>网络流量监控</span>
              </div>
            </template>
            <div class="chart-container">
              <!-- 网络流量监控图表 -->
              <el-chart :data="networkTrafficData">
                <el-bar-series
                  :x-field="'time'"
                  :y-field="'inbound'"
                  name="入站流量"
                />
                <el-bar-series
                  :x-field="'time'"
                  :y-field="'outbound'"
                  name="出站流量"
                />
                <el-tooltip :show-markers="true" />
                <el-legend position="top" />
                <el-x-axis grid />
                <el-y-axis />
              </el-chart>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="monitor-nodes">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <span>节点状态</span>
            <el-button size="small" @click="toggleNodeView">
              {{ showNodeDetails ? '收起详情' : '展开详情' }}
            </el-button>
          </div>
        </template>
        <el-table :data="cluster.nodes" stripe style="width: 100%">
          <el-table-column prop="id" label="节点ID" width="150" />
          <el-table-column prop="name" label="节点名称" width="120" />
          <el-table-column prop="status" label="状态" width="80">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'online' ? 'success' : 'danger'">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="cpuUsage" label="CPU使用率" width="120">
            <template #default="scope">
              <div class="progress-cell">
                <span>{{ scope.row.cpuUsage.toFixed(1) }}%</span>
                <el-progress :percentage="scope.row.cpuUsage" :stroke-width="6" />
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="memoryUsage" label="内存使用率" width="120">
            <template #default="scope">
              <div class="progress-cell">
                <span>{{ scope.row.memoryUsage.toFixed(1) }}%</span>
                <el-progress :percentage="scope.row.memoryUsage" :stroke-width="6" />
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="gpuUsage" label="GPU使用率" width="120">
            <template #default="scope">
              <div class="progress-cell">
                <span>{{ scope.row.gpuUsage.toFixed(1) }}%</span>
                <el-progress :percentage="scope.row.gpuUsage" :stroke-width="6" />
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="temperature" label="温度" width="80">
            <template #default="scope">
              <el-tag :type="scope.row.temperature > 70 ? 'danger' : 'warning'">
                {{ scope.row.temperature }}°C
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="diskUsage" label="磁盘使用率" width="120">
            <template #default="scope">
              <div class="progress-cell">
                <span>{{ scope.row.diskUsage.toFixed(1) }}%</span>
                <el-progress :percentage="scope.row.diskUsage" :stroke-width="6" />
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="agentCount" label="智能体数" width="80" />
        </el-table>
      </el-card>
    </div>

    <div class="monitor-agents">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <span>智能体运行状态</span>
            <span class="agent-count">共 {{ cluster.agentCount }} 个智能体</span>
          </div>
        </template>
        <div class="agent-status-grid">
          <div v-for="agent in cluster.agents" :key="agent.id" class="agent-status-item">
            <el-card size="small" :shadow="agent.status === 'running' ? 'hover' : 'always'">
              <div class="agent-header">
                <span class="agent-name">{{ agent.name }}</span>
                <el-tag :type="agent.status === 'running' ? 'success' : 'info'" size="small">
                  {{ agent.status }}
                </el-tag>
              </div>
              <div class="agent-stats">
                <div class="agent-stat">
                  <span class="stat-label">CPU:</span>
                  <span class="stat-value">{{ agent.cpuUsage.toFixed(1) }}%</span>
                </div>
                <div class="agent-stat">
                  <span class="stat-label">内存:</span>
                  <span class="stat-value">{{ agent.memoryUsage.toFixed(1) }}%</span>
                </div>
              </div>
              <div class="agent-task-count">
                运行任务: {{ agent.taskCount }}
              </div>
            </el-card>
          </div>
        </div>
      </el-card>
    </div>

    <div class="monitor-footer">
      <el-button @click="closeMonitor">关闭监控</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Download } from '@element-plus/icons-vue'
import { multiAgentAPI } from '@/api/multi-agent'
import type { Cluster, Agent } from '@/api/multi-agent'

const props = defineProps<{
  cluster: Cluster
}>()

const emit = defineEmits<{
  close: []
}>()

// 响应式数据
const loading = ref(false)
const showNodeDetails = ref(false)
const refreshTimer = ref<number | null>(null)

// 图表数据
const usageTrendData = ref([
  { time: '00:00', cpu: 35, memory: 45, gpu: 20 },
  { time: '01:00', cpu: 32, memory: 43, gpu: 18 },
  { time: '02:00', cpu: 30, memory: 41, gpu: 15 },
  { time: '03:00', cpu: 28, memory: 39, gpu: 12 },
  { time: '04:00', cpu: 25, memory: 37, gpu: 10 },
  { time: '05:00', cpu: 26, memory: 38, gpu: 11 },
  { time: '06:00', cpu: 29, memory: 40, gpu: 14 },
  { time: '07:00', cpu: 33, memory: 44, gpu: 17 },
  { time: '08:00', cpu: 40, memory: 50, gpu: 25 },
  { time: '09:00', cpu: 45, memory: 55, gpu: 30 },
  { time: '10:00', cpu: 42, memory: 52, gpu: 28 },
  { time: '11:00', cpu: 48, memory: 58, gpu: 35 },
])

const networkTrafficData = ref([
  { time: '00:00', inbound: 120, outbound: 80 },
  { time: '01:00', inbound: 110, outbound: 75 },
  { time: '02:00', inbound: 90, outbound: 60 },
  { time: '03:00', inbound: 80, outbound: 50 },
  { time: '04:00', inbound: 70, outbound: 40 },
  { time: '05:00', inbound: 85, outbound: 55 },
  { time: '06:00', inbound: 100, outbound: 70 },
  { time: '07:00', inbound: 130, outbound: 90 },
  { time: '08:00', inbound: 180, outbound: 140 },
  { time: '09:00', inbound: 220, outbound: 180 },
  { time: '10:00', inbound: 200, outbound: 160 },
  { time: '11:00', inbound: 240, outbound: 200 },
])

// 计算属性
const cluster = computed(() => {
  return props.cluster
})

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage < 60) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
}

// 格式化内存大小
const formatMemory = (memory: number) => {
  if (memory >= 1024) {
    return `${(memory / 1024).toFixed(1)} GB`
  }
  return `${memory} MB`
}

// 刷新数据
const refreshData = async () => {
  loading.value = true
  try {
    const updatedCluster = await multiAgentAPI.getCluster(cluster.value.id)
    // 更新集群数据
    Object.assign(cluster.value, updatedCluster)
    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('数据刷新失败')
    console.error('Refresh cluster data failed:', error)
  } finally {
    loading.value = false
  }
}

// 导出报告
const exportReport = () => {
  ElMessage.info('导出功能开发中...')
}

// 切换节点详情
const toggleNodeView = () => {
  showNodeDetails.value = !showNodeDetails.value
}

// 关闭监控
const closeMonitor = () => {
  emit('close')
}

// 自动刷新数据
const startAutoRefresh = () => {
  if (refreshTimer.value) clearInterval(refreshTimer.value)
  refreshTimer.value = window.setInterval(() => {
    refreshData()
  }, 30000) // 每30秒刷新一次
}

// 组件挂载时开始自动刷新
onMounted(() => {
  startAutoRefresh()
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
    refreshTimer.value = null
  }
})
</script>

<style scoped>
.cluster-monitor {
  padding: 20px 0;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.monitor-actions {
  display: flex;
  gap: 10px;
}

.monitor-summary {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-value {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: 20px 0;
}

.stat-value .value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-detail {
  text-align: center;
  color: #606266;
  font-size: 14px;
}

.monitor-charts {
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
  padding: 10px 0;
}

.monitor-nodes {
  margin-bottom: 20px;
}

.progress-cell {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.progress-cell .el-progress {
  margin-top: 5px;
}

.monitor-agents {
  margin-bottom: 20px;
}

.agent-status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.agent-status-item {
  width: 100%;
}

.agent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.agent-name {
  font-weight: bold;
  font-size: 14px;
}

.agent-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.agent-stat {
  font-size: 13px;
}

.stat-label {
  color: #606266;
  margin-right: 5px;
}

.stat-value {
  font-weight: bold;
}

.agent-task-count {
  font-size: 12px;
  color: #909399;
  text-align: right;
}

.monitor-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>