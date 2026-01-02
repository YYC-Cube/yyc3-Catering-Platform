<template>
  <div class="task-detail">
    <div class="detail-header">
      <div class="task-basic-info">
        <div class="task-icon">
          <el-icon :size="48"><Document /></el-icon>
        </div>
        <div class="task-meta">
          <h3>{{ task?.title }}</h3>
          <div class="task-description">{{ task?.description || '无描述信息' }}</div>
          <div class="task-tags">
            <el-tag :type="getTaskTypeColor(task?.type)">
              {{ task?.type }}
            </el-tag>
            <el-tag :type="getTaskStatusColor(task?.status)">
              {{ task?.status }}
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
            <el-descriptions-item label="任务ID">{{ task?.id }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDateTime(task?.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatDateTime(task?.updatedAt) }}</el-descriptions-item>
            <el-descriptions-item label="开始时间">{{ formatDateTime(task?.startTime) }}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{ formatDateTime(task?.endTime) }}</el-descriptions-item>
            <el-descriptions-item label="优先级">{{ task?.priority }}</el-descriptions-item>
            <el-descriptions-item label="类型">{{ task?.type }}</el-descriptions-item>
            <el-descriptions-item label="状态">{{ task?.status }}</el-descriptions-item>
            <el-descriptions-item label="发起人">{{ task?.creator }}</el-descriptions-item>
            <el-descriptions-item label="负责人">{{ task?.assignee }}</el-descriptions-item>
            <el-descriptions-item label="分配智能体">{{ task?.agentId }}</el-descriptions-item>
            <el-descriptions-item label="预计耗时">{{ task?.estimatedDuration || '无' }}</el-descriptions-item>
            <el-descriptions-item label="实际耗时">{{ task?.actualDuration || '无' }}</el-descriptions-item>
            <el-descriptions-item label="完成进度">{{ task?.progress || 0 }}%</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 任务内容 -->
        <el-tab-pane label="任务内容" name="content">
          <div class="task-content-section">
            <h4>任务参数</h4>
            <div class="task-parameters">
              <el-table :data="getTaskParameters" stripe>
                <el-table-column label="参数名" prop="name" width="200" />
                <el-table-column label="类型" prop="type" width="100" />
                <el-table-column label="值" prop="value" />
              </el-table>
            </div>
            
            <h4 style="margin-top: 20px;">执行结果</h4>
            <div class="task-result">
              <pre>{{ task?.result || '无结果数据' }}</pre>
            </div>
          </div>
        </el-tab-pane>

        <!-- 执行日志 -->
        <el-tab-pane label="执行日志" name="logs">
          <div class="logs-section">
            <div class="log-container">
              <div class="log-item" v-for="(log, index) in task?.logs" :key="index">
                <div class="log-time">{{ formatDateTime(log.timestamp) }}</div>
                <div class="log-content">{{ log.content }}</div>
                <div class="log-level" :class="`log-level-${log.level.toLowerCase()}`">
                  {{ log.level }}
                </div>
              </div>
              <div class="empty-logs" v-if="!task?.logs || task.logs.length === 0">
                <el-empty description="暂无执行日志" />
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 性能指标 -->
        <el-tab-pane label="性能指标" name="performance">
          <div class="performance-section">
            <el-card shadow="hover">
              <template #header>
                <span>执行性能</span>
              </template>
              <el-descriptions :column="3" border>
                <el-descriptions-item label="CPU使用率">{{ task?.performance?.cpuUsage || 0 }}%</el-descriptions-item>
                <el-descriptions-item label="内存使用率">{{ task?.performance?.memoryUsage || 0 }}%</el-descriptions-item>
                <el-descriptions-item label="网络流量">{{ task?.performance?.networkTraffic || 0 }}MB</el-descriptions-item>
                <el-descriptions-item label="执行时间">{{ task?.performance?.executionTime || 0 }}ms</el-descriptions-item>
                <el-descriptions-item label="成功率">{{ task?.performance?.successRate || 0 }}%</el-descriptions-item>
                <el-descriptions-item label="错误数">{{ task?.performance?.errorCount || 0 }}</el-descriptions-item>
              </el-descriptions>
            </el-card>
            
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

        <!-- 资源使用 -->
        <el-tab-pane label="资源使用" name="resources">
          <div class="resources-section">
            <el-card shadow="hover">
              <template #header>
                <span>资源消耗统计</span>
              </template>
              <el-table :data="getResourceUsage" stripe>
                <el-table-column label="资源类型" prop="type" width="150" />
                <el-table-column label="使用量" prop="usage" width="150" />
                <el-table-column label="单位" prop="unit" width="100" />
                <el-table-column label="峰值" prop="peak" width="150" />
                <el-table-column label="平均" prop="average" width="150" />
              </el-table>
            </el-card>
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
import { ref, computed } from 'vue'
import { Document } from '@element-plus/icons-vue'
import type { Task } from '@/api/multi-agent'

const props = defineProps<{
  task: Task | undefined
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

// 获取任务类型颜色
const getTaskTypeColor = (type?: string) => {
  if (!type) return 'default'
  
  const typeMap: Record<string, string> = {
    'data_processing': 'primary',
    'analysis': 'success',
    'report': 'info',
    'alert': 'warning',
    'maintenance': 'danger'
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

// 计算属性：任务参数
const getTaskParameters = computed(() => {
  if (!task?.parameters) return []
  
  return Object.entries(task.parameters).map(([key, value]) => ({
    name: key,
    type: typeof value,
    value: JSON.stringify(value)
  }))
})

// 计算属性：资源使用情况
const getResourceUsage = computed(() => {
  if (!task?.resources) return []
  
  return Object.entries(task.resources).map(([type, data]) => ({
    type,
    usage: data.usage || 0,
    unit: data.unit || 'KB',
    peak: data.peak || 0,
    average: data.average || 0
  }))
})

// 关闭详情
const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.task-detail {
  width: 100%;
}

.detail-header {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.task-basic-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.task-icon {
  padding: 15px;
  background-color: #f0f9ff;
  border-radius: 50%;
  color: #409eff;
}

.task-meta {
  flex: 1;
}

.task-meta h3 {
  margin: 0 0 5px 0;
  font-size: 24px;
  font-weight: 600;
}

.task-description {
  color: #606266;
  margin-bottom: 10px;
}

.task-tags {
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

/* 任务内容样式 */
.task-content-section {
  padding: 10px 0;
}

.task-parameters {
  margin-bottom: 20px;
}

.task-result {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 10px;
  max-height: 400px;
  overflow-y: auto;
}

/* 执行日志样式 */
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
  position: relative;
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
  margin-bottom: 5px;
}

.log-level {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: bold;
}

.log-level-info {
  background-color: #ecf5ff;
  color: #409eff;
}

.log-level-warning {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.log-level-error {
  background-color: #fef0f0;
  color: #f56c6c;
}

.log-level-success {
  background-color: #f0f9eb;
  color: #67c23a;
}

.empty-logs {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
  background-color: #fff;
  border-radius: 4px;
}

/* 性能指标样式 */
.performance-section {
  padding: 10px 0;
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
</style>