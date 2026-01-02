<template>
  <div class="performance-report">
    <div class="report-header">
      <h3>{{ report.title }}</h3>
      <div class="report-period">
        {{ formatDateTime(report.period.start) }} - {{ formatDateTime(report.period.end) }}
      </div>
    </div>

    <el-row :gutter="20">
      <!-- 响应时间统计 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>响应时间统计</span>
            </div>
          </template>
          <div class="response-time-stats">
            <div class="stat-item">
              <div class="stat-label">平均响应时间</div>
              <div class="stat-value">{{ report.metrics.responseTime.avg }}ms</div>
            </div>
            <div class="stat-grid">
              <div class="stat-item small">
                <div class="stat-label">最小值</div>
                <div class="stat-value">{{ report.metrics.responseTime.min }}ms</div>
              </div>
              <div class="stat-item small">
                <div class="stat-label">最大值</div>
                <div class="stat-value">{{ report.metrics.responseTime.max }}ms</div>
              </div>
              <div class="stat-item small">
                <div class="stat-label">P50</div>
                <div class="stat-value">{{ report.metrics.responseTime.p50 }}ms</div>
              </div>
              <div class="stat-item small">
                <div class="stat-label">P95</div>
                <div class="stat-value">{{ report.metrics.responseTime.p95 }}ms</div>
              </div>
              <div class="stat-item small">
                <div class="stat-label">P99</div>
                <div class="stat-value">{{ report.metrics.responseTime.p99 }}ms</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 吞吐量统计 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>吞吐量统计</span>
            </div>
          </template>
          <div class="throughput-stats">
            <div class="stat-item">
              <div class="stat-label">总请求数</div>
              <div class="stat-value">{{ formatNumber(report.metrics.throughput.requests) }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">错误数</div>
              <div class="stat-value">{{ formatNumber(report.metrics.throughput.errors) }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">错误率</div>
              <div class="stat-value" :class="getErrorRateClass(report.metrics.throughput.errorRate)">
                {{ (report.metrics.throughput.errorRate * 100).toFixed(2) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 资源使用情况 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>资源使用情况</span>
            </div>
          </template>
          <div class="resource-stats">
            <div class="resource-item">
              <div class="resource-label">CPU使用率</div>
              <el-progress
                :percentage="report.metrics.resources.cpu"
                :color="getResourceColor(report.metrics.resources.cpu)"
              />
            </div>
            <div class="resource-item">
              <div class="resource-label">内存使用率</div>
              <el-progress
                :percentage="report.metrics.resources.memory"
                :color="getResourceColor(report.metrics.resources.memory)"
              />
            </div>
            <div class="resource-item">
              <div class="resource-label">磁盘使用率</div>
              <el-progress
                :percentage="report.metrics.resources.disk"
                :color="getResourceColor(report.metrics.resources.disk)"
              />
            </div>
            <div class="resource-item">
              <div class="resource-label">网络使用率</div>
              <el-progress
                :percentage="report.metrics.resources.network"
                :color="getResourceColor(report.metrics.resources.network)"
              />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 端点性能 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>端点性能分析</span>
            </div>
          </template>
          <el-table :data="report.endpoints" stripe>
            <el-table-column label="端点" min-width="200">
              <template #default="{ row }">
                <div class="endpoint-path">
                  <span class="method" :class="getMethodClass(row.method)">{{ row.method }}</span>
                  {{ row.path }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="请求数" width="120" align="right">
              <template #default="{ row }">
                {{ formatNumber(row.requests) }}
              </template>
            </el-table-column>
            <el-table-column label="平均响应时间" width="140" align="right">
              <template #default="{ row }">
                <span :class="getResponseTimeClass(row.avgResponseTime)">
                  {{ row.avgResponseTime }}ms
                </span>
              </template>
            </el-table-column>
            <el-table-column label="错误率" width="100" align="right">
              <template #default="{ row }">
                <span :class="getErrorRateClass(row.errorRate)">
                  {{ (row.errorRate * 100).toFixed(1) }}%
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 错误分析 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>错误分析</span>
            </div>
          </template>
          <el-table :data="report.errors" stripe>
            <el-table-column label="错误类型" prop="type" width="200" />
            <el-table-column label="发生次数" width="120" align="right">
              <template #default="{ row }">
                {{ formatNumber(row.count) }}
              </template>
            </el-table-column>
            <el-table-column label="错误消息" min-width="300" show-overflow-tooltip>
              <template #default="{ row }">
                <div class="error-message">{{ row.message }}</div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 报告生成时间 -->
    <div class="report-footer">
      <small>报告生成时间: {{ formatDateTime(report.generatedAt) }}</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PerformanceReport } from '@/api/system-monitor'

interface Props {
  report: PerformanceReport
}

const props = defineProps<Props>()

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('zh-CN').format(num)
}

const getResourceColor = (percentage: number) => {
  if (percentage < 50) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
}

const getErrorRateClass = (rate: number) => {
  if (rate < 0.01) return 'good'
  if (rate < 0.05) return 'warning'
  return 'danger'
}

const getResponseTimeClass = (time: number) => {
  if (time < 100) return 'good'
  if (time < 500) return 'warning'
  return 'danger'
}

const getMethodClass = (method: string) => {
  const classMap = {
    GET: 'method-get',
    POST: 'method-post',
    PUT: 'method-put',
    DELETE: 'method-delete',
    PATCH: 'method-patch'
  }
  return classMap[method as keyof typeof classMap] || 'method-default'
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.performance-report {
  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-6;

    h3 {
      margin: 0;
      color: $text-primary;
    }

    .report-period {
      font-size: $font-size-sm;
      color: $text-secondary;
    }
  }

  .card-header {
    font-weight: $font-weight-medium;
    color: $text-primary;
  }

  .response-time-stats,
  .throughput-stats {
    .stat-item {
      margin-bottom: $spacing-4;

      .stat-label {
        font-size: $font-size-sm;
        color: $text-secondary;
        margin-bottom: $spacing-1;
      }

      .stat-value {
        font-size: $font-size-xl;
        font-weight: $font-weight-bold;
        color: $text-primary;

        &.good {
          color: $success-color;
        }

        &.warning {
          color: $warning-color;
        }

        &.danger {
          color: $danger-color;
        }
      }

      &.small {
        display: inline-block;
        width: calc(50% - 10px);
        margin-right: $spacing-3;
        margin-bottom: $spacing-3;

        .stat-value {
          font-size: $font-size-large;
        }
      }
    }

    .stat-grid {
      display: flex;
      flex-wrap: wrap;
      margin-top: $spacing-4;
    }
  }

  .resource-stats {
    .resource-item {
      margin-bottom: $spacing-6;

      &:last-child {
        margin-bottom: 0;
      }

      .resource-label {
        font-size: $font-size-sm;
        color: $text-secondary;
        margin-bottom: $spacing-2;
      }
    }
  }

  .endpoint-path {
    font-family: $font-family-mono;
    font-size: $font-size-sm;

    .method {
      display: inline-block;
      padding: 2px 6px;
      border-radius: $border-radius-sm;
      font-weight: $font-weight-medium;
      margin-right: $spacing-2;
      font-size: $font-size-xs;

      &.method-get {
        background: $success-light;
        color: $success-color;
      }

      &.method-post {
        background: $primary-light;
        color: $primary-color;
      }

      &.method-put {
        background: $warning-light;
        color: $warning-color;
      }

      &.method-delete {
        background: $danger-light;
        color: $danger-color;
      }

      &.method-patch {
        background: $info-light;
        color: $info-color;
      }

      &.method-default {
        background: $gray-100;
        color: $gray-600;
      }
    }
  }

  .error-message {
    font-family: $font-family-mono;
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  .report-footer {
    margin-top: $spacing-6;
    text-align: right;
    color: $text-placeholder;
  }

  .good {
    color: $success-color;
  }

  .warning {
    color: $warning-color;
  }

  .danger {
    color: $danger-color;
  }
}

// 响应式设计
@media (max-width: $breakpoint-md) {
  .performance-report {
    .report-header {
      flex-direction: column;
      align-items: flex-start;
      gap: $spacing-2;
    }

    .stat-grid {
      .stat-item.small {
        width: 100%;
        margin-right: 0;
      }
    }
  }
}

// 深色主题支持
@media (prefers-color-scheme: dark) {
  .performance-report {
    .endpoint-path {
      .method {
        &.method-default {
          background: $dark-bg-tertiary;
          color: $dark-text-secondary;
        }
      }
    }
  }
}
</style>