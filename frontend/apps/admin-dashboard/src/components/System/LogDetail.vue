<template>
  <div class="log-detail">
    <div class="log-header">
      <div class="log-level">
        <el-tag :type="getLogLevelTagType()" size="large">
          {{ log.level.toUpperCase() }}
        </el-tag>
      </div>
      <div class="log-time">
        {{ formatDateTime(log.timestamp) }}
      </div>
    </div>

    <el-descriptions :column="1" border>
      <el-descriptions-item label="消息内容">
        <div class="log-message" :class="`log-${log.level}`">
          {{ log.message }}
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="分类">
        {{ log.category }}
      </el-descriptions-item>
      <el-descriptions-item label="来源">
        {{ log.source }}
      </el-descriptions-item>
      <el-descriptions-item v-if="log.userId" label="用户ID">
        {{ log.userId }}
      </el-descriptions-item>
      <el-descriptions-item v-if="log.sessionId" label="会话ID">
        {{ log.sessionId }}
      </el-descriptions-item>
      <el-descriptions-item v-if="log.requestId" label="请求ID">
        {{ log.requestId }}
      </el-descriptions-item>
      <el-descriptions-item v-if="log.ip" label="IP地址">
        {{ log.ip }}
      </el-descriptions-item>
      <el-descriptions-item v-if="log.userAgent" label="用户代理">
        <div class="user-agent">{{ log.userAgent }}</div>
      </el-descriptions-item>
    </el-descriptions>

    <div v-if="log.metadata" class="log-metadata">
      <h4>元数据</h4>
      <el-scrollbar max-height="300px">
        <pre class="metadata-content">{{ JSON.stringify(log.metadata, null, 2) }}</pre>
      </el-scrollbar>
    </div>

    <div class="log-actions">
      <el-button @click="copyLogContent">
        复制内容
      </el-button>
      <el-button @click="copyLogJson">
        复制JSON
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import type { SystemLog } from '@/api/system-monitor'

interface Props {
  log: SystemLog
}

const props = defineProps<Props>()

const getLogLevelTagType = () => {
  const typeMap = {
    debug: 'info',
    info: 'info',
    warn: 'warning',
    error: 'danger',
    fatal: 'danger'
  }
  return typeMap[props.log.level] || 'info'
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const copyLogContent = async () => {
  const content = `[${props.log.timestamp}] ${props.log.level.toUpperCase()} [${props.log.category}] ${props.log.message}`

  try {
    await navigator.clipboard.writeText(content)
    ElMessage.success('日志内容已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const copyLogJson = async () => {
  try {
    await navigator.clipboard.writeText(JSON.stringify(props.log, null, 2))
    ElMessage.success('日志JSON已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.log-detail {
  .log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-6;

    .log-time {
      font-size: $font-size-sm;
      color: $text-secondary;
    }
  }

  .log-message {
    font-family: $font-family-mono;
    font-size: $font-size-sm;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;

    &.log-error,
    &.log-fatal {
      color: $danger-color;
    }

    &.log-warn {
      color: $warning-color;
    }

    &.log-debug {
      color: $text-placeholder;
    }

    &.log-info {
      color: $text-primary;
    }
  }

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

  .log-actions {
    margin-top: $spacing-6;
    display: flex;
    gap: $spacing-3;
  }
}

// 深色主题支持
@media (prefers-color-scheme: dark) {
  .log-detail {
    .metadata-content {
      background: $dark-bg-tertiary;
      color: $dark-text-secondary;
    }
  }
}
</style>