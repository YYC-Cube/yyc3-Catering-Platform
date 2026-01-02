<template>
  <div class="alert-detail">
    <div class="alert-header">
      <div class="alert-title">
        <el-icon :size="20" :color="getAlertSeverityColor()">
          <component :is="getAlertSeverityIcon()" />
        </el-icon>
        <span>{{ alert.title }}</span>
        <el-tag :type="getAlertSeverityTagType()" size="small">
          {{ getAlertSeverityLabel() }}
        </el-tag>
        <el-tag :type="getAlertStatusTagType()" size="small">
          {{ getAlertStatusLabel() }}
        </el-tag>
      </div>
    </div>

    <el-descriptions :column="1" border>
      <el-descriptions-item label="告警描述">
        {{ alert.description }}
      </el-descriptions-item>
      <el-descriptions-item label="来源">
        {{ alert.source }}
      </el-descriptions-item>
      <el-descriptions-item label="分类">
        {{ alert.category }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ formatDateTime(alert.timestamp) }}
      </el-descriptions-item>
      <el-descriptions-item v-if="alert.acknowledgedAt" label="确认时间">
        {{ formatDateTime(alert.acknowledgedAt) }}
      </el-descriptions-item>
      <el-descriptions-item v-if="alert.acknowledgedBy" label="确认人">
        {{ alert.acknowledgedBy }}
      </el-descriptions-item>
      <el-descriptions-item v-if="alert.resolvedAt" label="解决时间">
        {{ formatDateTime(alert.resolvedAt) }}
      </el-descriptions-item>
      <el-descriptions-item v-if="alert.resolvedBy" label="解决人">
        {{ alert.resolvedBy }}
      </el-descriptions-item>
    </el-descriptions>

    <div v-if="alert.metadata" class="alert-metadata">
      <h4>元数据</h4>
      <el-descriptions :column="2" border>
        <el-descriptions-item
          v-for="(value, key) in alert.metadata"
          :key="key"
          :label="key"
        >
          {{ formatMetadataValue(value) }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="alert-actions" v-if="alert.status === 'active'">
      <el-button type="warning" @click="handleAcknowledge">
        确认告警
      </el-button>
      <el-button type="success" @click="handleResolve">
        解决告警
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import {
  InfoFilled,
  Warning,
  CircleCloseFilled
} from '@element-plus/icons-vue'
import { systemMonitorAPI } from '@/api/system-monitor'
import type { SystemAlert } from '@/api/system-monitor'

interface Props {
  alert: SystemAlert
}

const props = defineProps<Props>()

const emit = defineEmits<{
  acknowledged: []
  resolved: []
}>()

const getAlertSeverityColor = () => {
  const colorMap = {
    low: '#909399',
    medium: '#e6a23c',
    high: '#f56c6c',
    critical: '#ff4757'
  }
  return colorMap[props.alert.severity] || '#909399'
}

const getAlertSeverityIcon = () => {
  const iconMap = {
    low: InfoFilled,
    medium: Warning,
    high: CircleCloseFilled,
    critical: CircleCloseFilled
  }
  return iconMap[props.alert.severity] || InfoFilled
}

const getAlertSeverityTagType = () => {
  const typeMap = {
    low: 'info',
    medium: 'warning',
    high: 'danger',
    critical: 'danger'
  }
  return typeMap[props.alert.severity] || 'info'
}

const getAlertSeverityLabel = () => {
  const labelMap = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '严重'
  }
  return labelMap[props.alert.severity] || '未知'
}

const getAlertStatusTagType = () => {
  const typeMap = {
    active: 'danger',
    acknowledged: 'warning',
    resolved: 'success'
  }
  return typeMap[props.alert.status] || 'info'
}

const getAlertStatusLabel = () => {
  const labelMap = {
    active: '活跃',
    acknowledged: '已确认',
    resolved: '已解决'
  }
  return labelMap[props.alert.status] || '未知'
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const formatMetadataValue = (value: any) => {
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}

const handleAcknowledge = async () => {
  try {
    await systemMonitorAPI.acknowledgeAlert(props.alert.id)
    ElMessage.success('告警已确认')
    emit('acknowledged')
  } catch (error) {
    ElMessage.error('确认告警失败')
  }
}

const handleResolve = async () => {
  try {
    await systemMonitorAPI.resolveAlert(props.alert.id)
    ElMessage.success('告警已解决')
    emit('resolved')
  } catch (error) {
    ElMessage.error('解决告警失败')
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.alert-detail {
  .alert-header {
    margin-bottom: $spacing-6;

    .alert-title {
      display: flex;
      align-items: center;
      gap: $spacing-2;
      font-size: $font-size-large;
      font-weight: $font-weight-medium;
      color: $text-primary;
    }
  }

  .alert-metadata {
    margin-top: $spacing-6;

    h4 {
      margin-bottom: $spacing-4;
      color: $text-primary;
    }
  }

  .alert-actions {
    margin-top: $spacing-6;
    display: flex;
    gap: $spacing-3;
  }
}
</style>