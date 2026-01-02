<template>
  <div class="cluster-detail">
    <div class="detail-header">
      <h3>{{ cluster.name }}</h3>
      <el-tag :type="cluster.status === 'active' ? 'success' : 'warning'" size="large">
        {{ cluster.status === 'active' ? '运行中' : '已停止' }}
      </el-tag>
    </div>

    <div class="detail-content">
      <!-- 基本信息 -->
      <el-card shadow="hover" class="detail-card">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
          </div>
        </template>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">集群ID:</span>
            <span class="info-value">{{ cluster.id }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">集群类型:</span>
            <span class="info-value">{{ cluster.type }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">节点数量:</span>
            <span class="info-value">{{ cluster.totalNodes }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">智能体数量:</span>
            <span class="info-value">{{ cluster.agentCount }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">创建时间:</span>
            <span class="info-value">{{ formatDate(cluster.createdAt) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">最后更新:</span>
            <span class="info-value">{{ formatDate(cluster.updatedAt) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">描述:</span>
            <span class="info-value">{{ cluster.description || '暂无描述' }}</span>
          </div>
        </div>
      </el-card>

      <!-- 资源配置 -->
      <el-card shadow="hover" class="detail-card">
        <template #header>
          <div class="card-header">
            <span>资源配置</span>
          </div>
        </template>
        <div class="resources-grid">
          <div class="resource-item">
            <div class="resource-icon">
              <el-icon><Cpu /></el-icon>
            </div>
            <div class="resource-info">
              <div class="resource-name">CPU</div>
              <div class="resource-value">{{ cluster.totalCpuCores }} 核心</div>
              <div class="resource-usage">
                <el-progress
                  :percentage="cluster.cpuUsage"
                  :color="getProgressColor(cluster.cpuUsage)"
                  :stroke-width="10"
                  show-text
                />
              </div>
            </div>
          </div>

          <div class="resource-item">
            <div class="resource-icon">
              <el-icon><Memory /></el-icon>
            </div>
            <div class="resource-info">
              <div class="resource-name">内存</div>
              <div class="resource-value">{{ formatMemory(cluster.totalMemory) }}</div>
              <div class="resource-usage">
                <el-progress
                  :percentage="cluster.memoryUsage"
                  :color="getProgressColor(cluster.memoryUsage)"
                  :stroke-width="10"
                  show-text
                />
              </div>
            </div>
          </div>

          <div class="resource-item">
            <div class="resource-icon">
              <el-icon><Server /></el-icon>
            </div>
            <div class="resource-info">
              <div class="resource-name">存储</div>
              <div class="resource-value">{{ cluster.totalStorage }} GB</div>
              <div class="resource-usage">
                <el-progress
                  :percentage="cluster.storageUsage"
                  :color="getProgressColor(cluster.storageUsage)"
                  :stroke-width="10"
                  show-text
                />
              </div>
            </div>
          </div>

          <div class="resource-item">
            <div class="resource-icon">
              <el-icon><Chip /></el-icon>
            </div>
            <div class="resource-info">
              <div class="resource-name">GPU</div>
              <div class="resource-value">{{ cluster.totalGpus }} 张</div>
              <div class="resource-usage">
                <el-progress
                  :percentage="cluster.gpuUsage"
                  :color="getProgressColor(cluster.gpuUsage)"
                  :stroke-width="10"
                  show-text
                />
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 节点列表 -->
      <el-card shadow="hover" class="detail-card">
        <template #header>
          <div class="card-header">
            <span>节点列表</span>
            <span class="node-count">{{ cluster.nodes.length }} 个节点</span>
          </div>
        </template>
        <el-table :data="cluster.nodes" stripe style="width: 100%" size="small">
          <el-table-column prop="id" label="节点ID" width="150" />
          <el-table-column prop="name" label="节点名称" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'online' ? 'success' : 'danger'" size="small">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="ipAddress" label="IP地址" width="150" />
          <el-table-column prop="cpuCores" label="CPU核心" width="100" />
          <el-table-column prop="memory" label="内存" width="120">
            <template #default="scope">
              {{ formatMemory(scope.row.memory) }}
            </template>
          </el-table-column>
          <el-table-column prop="diskSpace" label="存储空间" width="120">
            <template #default="scope">
              {{ scope.row.diskSpace }} GB
            </template>
          </el-table-column>
          <el-table-column prop="agentCount" label="智能体数" width="100" />
        </el-table>
      </el-card>

      <!-- 智能体列表 -->
      <el-card shadow="hover" class="detail-card">
        <template #header>
          <div class="card-header">
            <span>智能体列表</span>
            <span class="agent-count">{{ cluster.agents.length }} 个智能体</span>
          </div>
        </template>
        <el-table :data="cluster.agents" stripe style="width: 100%" size="small">
          <el-table-column prop="id" label="智能体ID" width="150" />
          <el-table-column prop="name" label="智能体名称" width="150" />
          <el-table-column prop="type" label="类型" width="120">
            <template #default="scope">
              <el-tag :type="getAgentTypeColor(scope.row.type)" size="small">
                {{ scope.row.type }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'running' ? 'success' : 'info'" size="small">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="cpuUsage" label="CPU使用率" width="120">
            <template #default="scope">
              {{ scope.row.cpuUsage.toFixed(1) }}%
            </template>
          </el-table-column>
          <el-table-column prop="memoryUsage" label="内存使用率" width="120">
            <template #default="scope">
              {{ scope.row.memoryUsage.toFixed(1) }}%
            </template>
          </el-table-column>
          <el-table-column prop="taskCount" label="运行任务" width="100" />
        </el-table>
      </el-card>

      <!-- 集群操作 -->
      <div class="cluster-actions">
        <el-button
          type="primary"
          size="large"
          :disabled="cluster.status === 'active'"
          @click="startCluster"
        >
          <el-icon><VideoPlay /></el-icon> 启动集群
        </el-button>
        <el-button
          type="warning"
          size="large"
          :disabled="cluster.status !== 'active'"
          @click="stopCluster"
        >
          <el-icon><VideoPause /></el-icon> 停止集群
        </el-button>
        <el-button
          type="danger"
          size="large"
          @click="deleteCluster"
        >
          <el-icon><Delete /></el-icon> 删除集群
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import { multiAgentAPI } from '@/api/multi-agent'
import type { Cluster, Agent, ClusterNode } from '@/api/multi-agent'

const props = defineProps<{
  cluster: Cluster
}>()

const emit = defineEmits<{
  refresh: []
}>()

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

// 获取智能体类型颜色
const getAgentTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'task': 'primary',
    'monitor': 'success',
    'analyzer': 'warning',
    'executor': 'info',
    'default': 'info'
  }
  return colorMap[type] || colorMap.default
}

// 格式化内存大小
const formatMemory = (memory: number) => {
  if (memory >= 1024) {
    return `${(memory / 1024).toFixed(1)} GB`
  }
  return `${memory} MB`
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 启动集群
const startCluster = async () => {
  try {
    await multiAgentAPI.startCluster(cluster.value.id)
    ElMessage.success('集群启动成功')
    emit('refresh')
  } catch (error) {
    ElMessage.error('集群启动失败')
    console.error('Start cluster failed:', error)
  }
}

// 停止集群
const stopCluster = async () => {
  try {
    await multiAgentAPI.stopCluster(cluster.value.id)
    ElMessage.success('集群停止成功')
    emit('refresh')
  } catch (error) {
    ElMessage.error('集群停止失败')
    console.error('Stop cluster failed:', error)
  }
}

// 删除集群
const deleteCluster = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除集群 "${cluster.value.name}" 吗？此操作无法撤销。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await multiAgentAPI.deleteCluster(cluster.value.id)
    ElMessage.success('集群删除成功')
    emit('refresh')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('集群删除失败')
      console.error('Delete cluster failed:', error)
    }
  }
}
</script>

<style scoped>
.cluster-detail {
  padding: 20px 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #ebeef5;
}

.detail-header h3 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.detail-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-label {
  color: #606266;
  font-size: 14px;
}

.info-value {
  color: #303133;
  font-size: 16px;
  font-weight: bold;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background-color: #fafafa;
}

.resource-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #ecf5ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #409eff;
}

.resource-info {
  flex: 1;
}

.resource-name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.resource-value {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.resource-usage {
  width: 100%;
}

.cluster-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #ebeef5;
}
</style>