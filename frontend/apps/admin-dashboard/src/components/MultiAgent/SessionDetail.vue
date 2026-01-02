<template>
  <div class="session-detail">
    <div class="detail-header">
      <div class="session-basic-info">
        <h3>{{ session?.title }}</h3>
        <div class="session-meta">
          <span class="meta-item">
            <Clock /> {{ formatDateTime(session?.createdAt) }}
          </span>
          <span class="meta-item">
            <User /> {{ session?.creatorName }}
          </span>
          <span class="meta-item">
            <Connection /> {{ session?.status }}
          </span>
        </div>
      </div>
    </div>

    <div class="detail-content">
      <div class="content-row">
        <!-- 会话描述 -->
        <el-card class="content-card">
          <template #header>
            <span>会话描述</span>
          </template>
          <div class="session-description">
            {{ session?.description || '无描述信息' }}
          </div>
        </el-card>

        <!-- 会话成员 -->
        <el-card class="content-card">
          <template #header>
            <span>会话成员</span>
          </template>
          <div class="session-members">
            <div class="member-item" v-for="(member, index) in session?.members" :key="index">
              <div class="member-info">
                <div class="member-name">{{ member.name }}</div>
                <div class="member-role">{{ member.role }}</div>
              </div>
            </div>
            <div class="empty-members" v-if="!session?.members || session.members.length === 0">
              暂无成员
            </div>
          </div>
        </el-card>
      </div>

      <!-- 会话任务 -->
      <el-card class="content-card">
        <template #header>
          <span>会话任务</span>
        </template>
        <div class="session-tasks">
          <el-table :data="session?.tasks || []" stripe>
            <el-table-column label="任务名称" prop="name" width="300" />
            <el-table-column label="状态" prop="status" width="120">
              <template #default="{ row }">
                <el-tag :type="getTaskStatusType(row.status)">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="负责人" prop="assignee" width="150" />
            <el-table-column label="创建时间" prop="createdAt">
              <template #default="{ row }">
                {{ formatDateTime(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
          <div class="empty-tasks" v-if="!session?.tasks || session.tasks.length === 0">
            <el-empty description="暂无任务" />
          </div>
        </div>
      </el-card>

      <!-- 会话日志 -->
      <el-card class="content-card">
        <template #header>
          <span>会话日志</span>
        </template>
        <div class="session-logs">
          <div class="log-item" v-for="(log, index) in session?.logs" :key="index">
            <div class="log-time">{{ formatDateTime(log.timestamp) }}</div>
            <div class="log-content">{{ log.content }}</div>
          </div>
          <div class="empty-logs" v-if="!session?.logs || session.logs.length === 0">
            暂无日志记录
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Clock, User, Connection } from '@element-plus/icons-vue'
import type { CollaborationSession } from '@/api/multi-agent'

const props = defineProps<{
  session: CollaborationSession | undefined
}>()

const emit = defineEmits<{
  refresh: []
}>()

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

// 获取任务状态标签类型
const getTaskStatusType = (status?: string) => {
  if (!status) return 'default'
  
  const statusMap: Record<string, string> = {
    'pending': 'warning',
    'in_progress': 'info',
    'completed': 'success',
    'failed': 'danger'
  }
  
  return statusMap[status.toLowerCase()] || 'default'
}

// 监听会话变化
watch(() => props.session, (newSession) => {
  if (newSession) {
    // 可以在这里添加会话变化的处理逻辑
  }
}, { deep: true })
</script>

<style scoped>
.session-detail {
  width: 100%;
}

.detail-header {
  margin-bottom: 20px;
}

.session-basic-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.session-basic-info h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.session-meta {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: #606266;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.content-card {
  flex: 1;
  min-width: 300px;
}

.session-description {
  line-height: 1.6;
  color: #303133;
}

.session-members {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.member-item {
  padding: 10px;
  border-radius: 4px;
  background-color: #f5f7fa;
  transition: background-color 0.3s;
}

.member-item:hover {
  background-color: #ecf5ff;
}

.member-info {
  display: flex;
  flex-direction: column;
}

.member-name {
  font-weight: 500;
  color: #303133;
}

.member-role {
  font-size: 12px;
  color: #909399;
}

.empty-members {
  text-align: center;
  padding: 20px;
  color: #909399;
}

.session-tasks {
  min-height: 200px;
}

.empty-tasks {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
}

.session-logs {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.log-item {
  padding: 10px;
  border-radius: 4px;
  background-color: #f5f7fa;
  border-left: 4px solid #409eff;
}

.log-time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.log-content {
  line-height: 1.5;
  color: #303133;
  font-size: 14px;
}

.empty-logs {
  text-align: center;
  padding: 20px;
  color: #909399;
}
</style>