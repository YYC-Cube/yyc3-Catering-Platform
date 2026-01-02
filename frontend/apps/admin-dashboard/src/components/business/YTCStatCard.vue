<!--
 YYC³餐饮管理系统 - 统计数据卡片组件
 专为餐饮管理场景设计的关键指标展示
-->
<template>
  <div
    :class="cardClasses"
    @click="handleClick"
  >
    <!-- 卡片顶部色条 -->
    <div class="ytc-stat-card__color-bar" :style="colorBarStyle"></div>

    <!-- 卡片内容 -->
    <div class="ytc-stat-card__content">
      <!-- 图标区域 -->
      <div v-if="icon || $slots.icon" class="ytc-stat-card__icon">
        <slot name="icon">
          <div class="ytc-stat-card__icon-default" :style="iconStyle">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
        </slot>
      </div>

      <!-- 数据区域 -->
      <div class="ytc-stat-card__data">
        <!-- 标签 -->
        <div class="ytc-stat-card__label">
          {{ label }}
        </div>

        <!-- 数值 -->
        <div class="ytc-stat-card__value">
          <span class="value-text">{{ formattedValue }}</span>
          <span v-if="unit" class="value-unit">{{ unit }}</span>
        </div>

        <!-- 趋势指示器 -->
        <div v-if="trend" class="ytc-stat-card__trend">
          <div :class="trendClasses">
            <svg class="trend-icon" viewBox="0 0 24 24" fill="currentColor">
              <path v-if="trend === 'up'" d="M7 14l5-5 5 5z"/>
              <path v-else-if="trend === 'down'" d="M7 10l5 5 5-5z"/>
              <path v-else d="M12 8l4 4-4 4-4-4z"/>
            </svg>
            <span class="trend-text">{{ formattedTrendValue }}</span>
          </div>
          <span class="trend-label">{{ trendLabel }}</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div v-if="$slots.actions" class="ytc-stat-card__actions">
        <slot name="actions" />
      </div>
    </div>

    <!-- 悬浮效果遮罩 -->
    <div v-if="hoverable" class="ytc-stat-card__hover-overlay"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatNumber } from '@/utils/format'

interface Props {
  label: string
  value: number | string
  unit?: string
  color?: 'primary' | 'success' | 'danger' | 'warning' | 'neutral'
  trend?: 'up' | 'down' | 'stable'
  trendValue?: number
  trendLabel?: string
  icon?: string
  hoverable?: boolean
  clickable?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  unit: '',
  color: 'primary',
  trend: undefined,
  trendValue: undefined,
  trendLabel: '',
  icon: '',
  hoverable: true,
  clickable: false,
  loading: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const cardClasses = computed(() => [
  'ytc-stat-card',
  `ytc-stat-card--${props.color}`,
  {
    'ytc-stat-card--clickable': props.clickable,
    'ytc-stat-card--loading': props.loading,
    'ytc-stat-card--hoverable': props.hoverable
  }
])

const colorBarStyle = computed(() => ({
  background: getGradientForColor(props.color)
}))

const iconStyle = computed(() => ({
  color: `var(--color-${props.color})`
}))

const trendClasses = computed(() => [
  'ytc-stat-card__trend-indicator',
  `ytc-stat-card__trend--${props.trend}`
])

const formattedValue = computed(() => {
  if (typeof props.value === 'string') return props.value
  return formatNumber(props.value)
})

const formattedTrendValue = computed(() => {
  if (props.trendValue === undefined) return ''
  const sign = props.trend === 'up' ? '+' : props.trend === 'down' ? '-' : ''
  return `${sign}${Math.abs(props.trendValue)}%`
})

const getGradientForColor = (color: string) => {
  const gradients = {
    primary: 'var(--gradient-primary)',
    success: 'var(--gradient-success)',
    danger: 'var(--gradient-danger)',
    warning: 'var(--gradient-warning)',
    neutral: 'linear-gradient(135deg, var(--color-neutral) 0%, #4B5563 100%)'
  }
  return gradients[color as keyof typeof gradients] || gradients.primary
}

const handleClick = (event: MouseEvent) => {
  if (props.clickable && !props.loading) {
    emit('click', event)
  }
}
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss';

.ytc-stat-card {
  position: relative;
  background: var(--color-darker);
  border-radius: $card-border-radius;
  box-shadow: $card-shadow;
  overflow: hidden;
  transition: $transition-all;
  -webkit-user-select: none;
  user-select: none;

  &--hoverable:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-xl;
  }

  &--clickable {
    cursor: pointer;
  }

  &--clickable:hover {
    .ytc-stat-card__hover-overlay {
      opacity: 1;
    }
  }

  &--loading {
    pointer-events: none;
    opacity: 0.7;
  }

  &__color-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    z-index: 1;
  }

  &__content {
    display: flex;
    align-items: flex-start;
    padding: $card-padding;
    gap: $spacing-lg;
    position: relative;
    z-index: 2;
  }

  &__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: $border-radius-lg;
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
  }

  &__icon-default {
    width: 28px;
    height: 28px;
  }

  .icon-svg {
    width: 100%;
    height: 100%;
  }

  &__data {
    flex: 1;
    min-width: 0;
  }

  &__label {
    font-size: $font-size-body-small;
    font-weight: $font-weight-body-normal;
    color: var(--color-text-secondary);
    margin-bottom: $spacing-xs;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &__value {
    display: flex;
    align-items: baseline;
    gap: $spacing-xs;
    margin-bottom: $spacing-sm;
  }

  .value-text {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    line-height: $line-height-tight;
  }

  .value-unit {
    font-size: $font-size-body-normal;
    font-weight: $font-weight-body-normal;
    color: var(--color-text-secondary);
  }

  &__trend {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  &__trend-indicator {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-size: $font-size-body-small;
    font-weight: $font-weight-medium;
    padding: $spacing-xs $spacing-sm;
    border-radius: $border-radius-full;

    &--up {
      color: var(--color-success);
      background: rgba(16, 185, 129, 0.1);
    }

    &--down {
      color: var(--color-danger);
      background: rgba(239, 68, 68, 0.1);
    }

    &--stable {
      color: var(--color-neutral);
      background: rgba(107, 114, 128, 0.1);
    }
  }

  .trend-icon {
    width: 14px;
    height: 14px;
  }

  .trend-text {
    font-weight: $font-weight-semibold;
  }

  .trend-label {
    font-size: $font-size-body-small;
    color: var(--color-text-secondary);
  }

  &__actions {
    flex-shrink: 0;
    display: flex;
    gap: $spacing-xs;
  }

  &__hover-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(79, 70, 229, 0.05);
    opacity: 0;
    transition: $transition-opacity;
    border-radius: $card-border-radius;
    z-index: 1;
  }
}

// 响应式适配
@include respond-to(md) {
  .ytc-stat-card {
    &__content {
      padding: $spacing-xl;
    }

    &__icon {
      width: 64px;
      height: 64px;
    }

    .value-text {
      font-size: 36px; // 比 2xl 稍大
    }
  }
}

// 动画效果
.ytc-stat-card {
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>