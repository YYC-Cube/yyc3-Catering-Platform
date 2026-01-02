<template>
  <div class="system-health-check">
    <div class="health-overview">
      <div class="health-score">
        <div class="score-circle" :class="getHealthStatusClass()">
          <div class="score-value">{{ health.score }}%</div>
          <div class="score-label">{{ getHealthStatusLabel() }}</div>
        </div>
      </div>
      <div class="health-info">
        <h3>系统健康状态: {{ getHealthStatusLabel() }}</h3>
        <div class="system-info">
          <div class="info-item">
            <span class="label">运行时间:</span>
            <span class="value">{{ formatUptime(health.uptime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">版本:</span>
            <span class="value">{{ health.version }}</span>
          </div>
          <div class="info-item">
            <span class="label">环境:</span>
            <span class="value">{{ health.environment }}</span>
          </div>
          <div class="info-item">
            <span class="label">检查时间:</span>
            <span class="value">{{ formatDateTime(health.timestamp) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="health-checks">
      <h4>健康检查详情</h4>
      <div class="checks-list">
        <div
          v-for="check in health.checks"
          :key="check.name"
          class="check-item"
          :class="getCheckStatusClass(check.status)"
        >
          <div class="check-header">
            <div class="check-icon">
              <el-icon :size="20">
                <component :is="getCheckIcon(check.status)" />
              </el-icon>
            </div>
            <div class="check-title">{{ check.name }}</div>
            <div class="check-status">
              <el-tag :type="getCheckTagType(check.status)" size="small">
                {{ getCheckStatusLabel(check.status) }}
              </el-tag>
            </div>
            <div class="check-duration">{{ check.duration }}ms</div>
          </div>
          <div v-if="check.message" class="check-message">
            {{ check.message }}
          </div>
          <div class="check-time">
            检查时间: {{ formatDateTime(check.timestamp) }}
          </div>
        </div>
      </div>
    </div>

    <div class="health-recommendations">
      <h4>建议</h4>
      <div class="recommendations">
        <el-alert
          v-for="(recommendation, index) in getRecommendations()"
          :key="index"
          :title="recommendation.title"
          :type="recommendation.type"
          :description="recommendation.description"
          show-icon
          :closable="false"
          style="margin-bottom: 10px;"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  SuccessFilled,
  Warning,
  CircleCloseFilled,
  InfoFilled
} from '@element-plus/icons-vue'
import type { SystemHealth } from '@/api/system-monitor'

interface Props {
  health: SystemHealth
}

const props = defineProps<Props>()

const getHealthStatusClass = () => {
  switch (props.health.status) {
    case 'healthy':
      return 'healthy'
    case 'degraded':
      return 'degraded'
    case 'unhealthy':
      return 'unhealthy'
    default:
      return 'unknown'
  }
}

const getHealthStatusLabel = () => {
  switch (props.health.status) {
    case 'healthy':
      return '健康'
    case 'degraded':
      return '降级'
    case 'unhealthy':
      return '不健康'
    default:
      return '未知'
  }
}

const getCheckStatusClass = (status: string) => {
  switch (status) {
    case 'pass':
      return 'check-pass'
    case 'warn':
      return 'check-warn'
    case 'fail':
      return 'check-fail'
    default:
      return 'check-unknown'
  }
}

const getCheckIcon = (status: string) => {
  switch (status) {
    case 'pass':
      return SuccessFilled
    case 'warn':
      return Warning
    case 'fail':
      return CircleCloseFilled
    default:
      return InfoFilled
  }
}

const getCheckTagType = (status: string) => {
  switch (status) {
    case 'pass':
      return 'success'
    case 'warn':
      return 'warning'
    case 'fail':
      return 'danger'
    default:
      return 'info'
  }
}

const getCheckStatusLabel = (status: string) => {
  switch (status) {
    case 'pass':
      return '通过'
    case 'warn':
      return '警告'
    case 'fail':
      return '失败'
    default:
      return '未知'
  }
}

const formatUptime = (seconds: number) => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) {
    return `${days}天 ${hours}小时 ${minutes}分钟`
  } else if (hours > 0) {
    return `${hours}小时 ${minutes}分钟`
  } else {
    return `${minutes}分钟`
  }
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const getRecommendations = () => {
  const recommendations = []

  const failedChecks = props.health.checks.filter(check => check.status === 'fail')
  const warningChecks = props.health.checks.filter(check => check.status === 'warn')

  if (failedChecks.length > 0) {
    recommendations.push({
      title: '系统存在问题需要立即处理',
      description: `有 ${failedChecks.length} 个检查失败，请及时检查系统状态并修复问题。`,
      type: 'error'
    })
  }

  if (warningChecks.length > 0) {
    recommendations.push({
      title: '系统存在潜在风险',
      description: `有 ${warningChecks.length} 个检查出现警告，建议关注并采取预防措施。`,
      type: 'warning'
    })
  }

  if (props.health.score < 80) {
    recommendations.push({
      title: '系统性能需要优化',
      description: '系统健康评分较低，建议优化系统配置或增加资源。',
      type: 'warning'
    })
  }

  if (failedChecks.length === 0 && warningChecks.length === 0 && props.health.score >= 90) {
    recommendations.push({
      title: '系统运行良好',
      description: '所有检查都通过，系统运行状态良好。',
      type: 'success'
    })
  }

  return recommendations
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.system-health-check {
  .health-overview {
    display: flex;
    align-items: center;
    gap: $spacing-8;
    margin-bottom: $spacing-8;
    padding: $spacing-6;
    background: $white;
    border-radius: $border-radius-base;
    box-shadow: $shadow-sm;

    .health-score {
      .score-circle {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        border: 4px solid;

        &.healthy {
          border-color: $success-color;
          background: $success-light;
          color: $success-color;
        }

        &.degraded {
          border-color: $warning-color;
          background: $warning-light;
          color: $warning-color;
        }

        &.unhealthy {
          border-color: $danger-color;
          background: $danger-light;
          color: $danger-color;
        }

        .score-value {
          font-size: $font-size-2xl;
          font-weight: $font-weight-bold;
          line-height: 1;
        }

        .score-label {
          font-size: $font-size-sm;
          margin-top: $spacing-1;
        }
      }
    }

    .health-info {
      flex: 1;

      h3 {
        margin: 0 0 $spacing-4 0;
        color: $text-primary;
      }

      .system-info {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: $spacing-4;

        .info-item {
          display: flex;
          align-items: center;

          .label {
            font-size: $font-size-sm;
            color: $text-secondary;
            margin-right: $spacing-2;
          }

          .value {
            font-weight: $font-weight-medium;
            color: $text-primary;
          }
        }
      }
    }
  }

  .health-checks,
  .health-recommendations {
    margin-bottom: $spacing-6;

    h4 {
      margin: 0 0 $spacing-4 0;
      color: $text-primary;
    }

    .checks-list {
      .check-item {
        padding: $spacing-4;
        background: $white;
        border-radius: $border-radius-base;
        box-shadow: $shadow-sm;
        margin-bottom: $spacing-3;
        border-left: 4px solid;

        &.check-pass {
          border-left-color: $success-color;
        }

        &.check-warn {
          border-left-color: $warning-color;
        }

        &.check-fail {
          border-left-color: $danger-color;
        }

        .check-header {
          display: flex;
          align-items: center;
          gap: $spacing-3;

          .check-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: $gray-50;
          }

          .check-title {
            flex: 1;
            font-weight: $font-weight-medium;
            color: $text-primary;
          }

          .check-duration {
            font-size: $font-size-sm;
            color: $text-secondary;
          }
        }

        .check-message {
          margin-top: $spacing-2;
          font-size: $font-size-sm;
          color: $text-secondary;
        }

        .check-time {
          margin-top: $spacing-2;
          font-size: $font-size-xs;
          color: $text-placeholder;
        }
      }
    }

    .recommendations {
      // Empty for now, using el-alert components directly
    }
  }
}

// 响应式设计
@media (max-width: $breakpoint-md) {
  .system-health-check {
    .health-overview {
      flex-direction: column;
      text-align: center;

      .health-info {
        .system-info {
          grid-template-columns: 1fr;
        }
      }
    }
  }
}

// 深色主题支持
@media (prefers-color-scheme: dark) {
  .system-health-check {
    .health-overview,
    .check-item {
      background: $dark-bg-secondary;
      border-color: $dark-border-primary;
    }

    .check-icon {
      background: $dark-bg-tertiary;
    }
  }
}
</style>