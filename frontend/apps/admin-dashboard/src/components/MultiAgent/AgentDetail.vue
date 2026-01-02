<template>
  <div class="agent-detail">
    <div class="detail-header">
      <div class="agent-basic-info">
        <div class="agent-icon">
          <el-icon :size="48"><UserFilled /></el-icon>
        </div>
        <div class="agent-meta">
          <h3>{{ agent?.name }}</h3>
          <div class="agent-description">{{ agent?.description || '无描述信息' }}</div>
          <div class="agent-tags">
            <el-tag :type="getAgentTypeColor(agent?.type)">
              {{ agent?.type }}
            </el-tag>
            <el-tag :type="agent?.status === 'online' ? 'success' : 'danger'">
              {{ agent?.status }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <div class="detail-content">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="智能体ID">{{ agent?.id }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDateTime(agent?.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatDateTime(agent?.updatedAt) }}</el-descriptions-item>
            <el-descriptions-item label="版本">{{ agent?.version || '1.0.0' }}</el-descriptions-item>
            <el-descriptions-item label="负责人">{{ agent?.owner || '系统' }}</el-descriptions-item>
            <el-descriptions-item label="所属集群">{{ agent?.cluster || '默认集群' }}</el-descriptions-item>
            <el-descriptions-item label="内存限制">{{ agent?.memoryLimit || '无限制' }}</el-descriptions-item>
            <el-descriptions-item label="CPU限制">{{ agent?.cpuLimit || '无限制' }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 配置信息 -->
        <el-tab-pane label="配置信息" name="config">
          <div class="config-section">
            <h4>核心配置</h4>
            <pre>{{ JSON.stringify(agent?.config, null, 2) }}</pre>
          </div>
        </el-tab-pane>

        <!-- 性能监控 -->
        <el-tab-pane label="性能监控" name="performance">
          <div class="performance-section">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-card shadow="hover">
                  <template #header>
                    <span>CPU使用率</span>
                  </template>
                  <div class="performance-value">{{ agent?.performance?.cpuUsage || 0 }}%</div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card shadow="hover">
                  <template #header>
                    <span>内存使用率</span>
                  </template>
                  <div class="performance-value">{{ agent?.performance?.memoryUsage || 0 }}%</div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card shadow="hover">
                  <template #header>
                    <span>响应时间</span>
                  </template>
                  <div class="performance-value">{{ agent?.performance?.responseTime || 0 }}ms</div>
                </el-card>
              </el-col>
            </el-row>
            
            <div class="chart-section" style="margin-top: 20px;">
              <el-card shadow="hover">
                <template #header>
                  <span>性能趋势</span>
                </template>
                <div class="chart-placeholder">
                  <el-empty description="性能图表展示区域" />
                </div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>

        <!-- 任务历史 -->
        <el-tab-pane label="任务历史" name="tasks">
          <div class="tasks-section">
            <el-table :data="agent?.tasks || []" stripe>
              <el-table-column label="任务ID" prop="id" width="200" />
              <el-table-column label="任务名称" prop="name" width="300" />
              <el-table-column label="状态" prop="status" width="120">
                <template #default="{ row }">
                  <el-tag :type="getTaskStatusColor(row.status)">
                    {{ row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="开始时间" prop="startTime">
                <template #default="{ row }">
                  {{ formatDateTime(row.startTime) }}
                </template>
              </el-table-column>
              <el-table-column label="结束时间" prop="endTime">
                <template #default="{ row }">
                  {{ formatDateTime(row.endTime) }}
                </template>
              </el-table-column>
              <el-table-column label="执行结果" prop="result" width="150">
                <template #default="{ row }">
                  <el-tag :type="row.result === 'success' ? 'success' : 'danger'">
                    {{ row.result }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="empty-tasks" v-if="!agent?.tasks || agent.tasks.length === 0">
              <el-empty description="暂无任务记录" />
            </div>
          </div>
        </el-tab-pane>

        <!-- 日志记录 -->
        <el-tab-pane label="日志记录" name="logs">
          <div class="logs-section">
            <div class="log-container">
              <div class="log-item" v-for="(log, index) in agent?.logs" :key="index">
                <div class="log-time">{{ formatDateTime(log.timestamp) }}</div>
                <div class="log-content">{{ log.content }}</div>
              </div>
              <div class="empty-logs" v-if="!agent?.logs || agent.logs.length === 0">
                <el-empty description="暂无日志记录" />
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="detail-footer">
      <el-button @click="handleClose">关闭</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { UserFilled } from '@element-plus/icons-vue'
import type { Agent } from '@/api/multi-agent'

const props = defineProps<{
  agent: Agent | undefined
}>()

const emit = defineEmits<{
  refresh: []
  close: []
}>()

// 响应式数据
const activeTab = ref('basic')

// 格式化日期时间
const formatDateTime = (dateTime?: string) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 获取智能体类型颜色
const getAgentTypeColor = (type?: string) => {
  if (!type) return 'default'
  
  const typeMap: Record<string, string> = {
    'customer_service': 'primary',
    'marketing': 'success',
    'operation': 'info',
    'technical': 'warning',
    'decision': 'danger'
  }
  
  return typeMap[type.toLowerCase()] || 'default'
}

// 获取任务状态颜色
const getTaskStatusColor = (status?: string) => {
  if (!status) return 'default'
  
  const statusMap: Record<string, string> = {
    'pending': 'warning',
    'in_progress': 'info',
    'completed': 'success',
    'failed': 'danger',
    'cancelled': 'info'
  }
  
  return statusMap[status.toLowerCase()] || 'default'
}

// 关闭详情
const handleClose = () => {
  emit('close')
}

// 监听智能体变化
watch(() => props.agent, (newAgent) => {
  if (newAgent) {
    activeTab.value = 'basic'
  }
}, { deep: true })
</script>

<style scoped>
.agent-detail {
  width: 100%;
}

.detail-header {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.agent-basic-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.agent-icon {
  padding: 15px;
  background-color: #f0f9ff;
  border-radius: 50%;
  color: #409eff;
}

.agent-meta {
  flex: 1;
}

.agent-meta h3 {
  margin: 0 0 5px 0;
  font-size: 24px;
  font-weight: 600;
}

.agent-description {
  color: #606266;
  margin-bottom: 10px;
}

.agent-tags {
  display: flex;
  gap: 10px;
}

.detail-content {
  margin-bottom: 20px;
}

.detail-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

/* 性能监控样式 */
.performance-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  text-align: center;
  margin-top: 10px;
}

.chart-section {
  margin-top: 20px;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  border-radius: 4px;
}

/* 任务历史样式 */
.tasks-section {
  padding: 10px 0;
}

.empty-tasks {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
}

/* 日志记录样式 */
.logs-section {
  padding: 10px 0;
}

.log-container {
  max-height: 500px;
  overflow-y: auto;
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 10px;
}

.log-item {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.log-time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.log-content {
  font-size: 14px;
  color: #303133;
  line-height: 1.5;
}

.empty-logs {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
  background-color: #fff;
  border-radius: 4px;
}
</style>