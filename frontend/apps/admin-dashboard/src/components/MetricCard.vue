<!--
 * @fileoverview YYC³餐饮行业智能化平台 - 指标卡片组件
 * @description 用于展示关键业务指标的卡片组件，包含指标标题、数值、图标和趋势信息
 * @module MetricCard
 * @author YYC³
 * @version 1.0.0
 * @created 2024-01-01
 * @updated 2024-01-01
 -->
<template>
  <div class="metric-card">
    <el-skeleton v-if="loading" animated :rows="3" :throttle="500" />
    <template v-else>
      <div class="metric-icon">
        <el-icon :size="24" :style="{ color: iconColor }">
          <component :is="icon" />
        </el-icon>
      </div>
      <div class="metric-content">
        <div class="metric-title">{{ title }}</div>
        <div class="metric-value">{{ value }}</div>
        <div v-if="displayTrend" class="metric-trend" :class="trendClass">
          <el-icon><TrendCharts /></el-icon>
          <span>{{ displayTrend }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: string | number
  icon: string
  color?: string
  trend?: string
  trendType?: 'up' | 'down' | 'stable'
  // 兼容Dashboard.vue中使用的属性名
  change?: string | number
  'change-type'?: 'increase' | 'decrease' | 'neutral'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  color: '#409eff',
  trendType: 'stable',
  loading: false
})

const iconColor = computed(() => props.color)

// 处理趋势显示，兼容新旧属性名
const displayTrend = computed(() => {
  return props.trend || props.change
})

// 处理趋势类型，兼容新旧属性名
const trendClass = computed(() => {
  const trendType = props.trendType || 
    (props['change-type'] === 'increase' ? 'up' : 
     props['change-type'] === 'decrease' ? 'down' : 'stable')
  return `trend-${trendType}`
})
</script>

<style lang="scss" scoped>
.metric-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid var(--el-color-primary);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
}

.metric-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-color-primary-light-9);
  border-radius: 8px;
}

.metric-content {
  flex: 1;
}

.metric-title {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.metric-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;

  &.trend-up {
    color: var(--el-color-success);
  }

  &.trend-down {
    color: var(--el-color-danger);
  }

  &.trend-stable {
    color: var(--el-text-color-secondary);
  }
}
</style>