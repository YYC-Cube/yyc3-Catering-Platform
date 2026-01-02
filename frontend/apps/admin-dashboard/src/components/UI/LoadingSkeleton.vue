<template>
  <div class="loading-skeleton" :class="skeletonClass">
    <!-- 文本骨架屏 -->
    <template v-if="type === 'text'">
      <div class="skeleton-line" v-for="i in lines" :key="i" :style="lineStyle"></div>
    </template>

    <!-- 头像骨架屏 -->
    <div v-else-if="type === 'avatar'" class="skeleton-avatar" :style="{ width: size, height: size }"></div>

    <!-- 卡片骨架屏 -->
    <div v-else-if="type === 'card'" class="skeleton-card">
      <div v-if="showHeader" class="skeleton-card-header">
        <div class="skeleton-avatar" style="width: 40px; height: 40px;"></div>
        <div class="skeleton-card-header-content">
          <div class="skeleton-line" style="width: 120px; height: 16px; margin-bottom: 8px;"></div>
          <div class="skeleton-line" style="width: 80px; height: 12px;"></div>
        </div>
      </div>
      <div class="skeleton-card-content">
        <div class="skeleton-line" v-for="i in 3" :key="i" :style="i === 3 ? 'width: 60%;' : 'width: 100%;'"></div>
      </div>
    </div>

    <!-- 表格骨架屏 -->
    <div v-else-if="type === 'table'" class="skeleton-table">
      <div class="skeleton-table-header">
        <div class="skeleton-line" v-for="i in columns" :key="i" style="height: 16px;"></div>
      </div>
      <div class="skeleton-table-body">
        <div class="skeleton-table-row" v-for="row in rows" :key="row">
          <div class="skeleton-line" v-for="i in columns" :key="i" style="height: 14px;"></div>
        </div>
      </div>
    </div>

    <!-- 图表骨架屏 -->
    <div v-else-if="type === 'chart'" class="skeleton-chart">
      <div class="skeleton-chart-header">
        <div class="skeleton-line" style="width: 150px; height: 20px;"></div>
      </div>
      <div class="skeleton-chart-content">
        <div class="skeleton-chart-bars">
          <div class="skeleton-bar" v-for="i in 8" :key="i" :style="{ height: `${Math.random() * 60 + 20}%` }"></div>
        </div>
      </div>
    </div>

    <!-- 列表骨架屏 -->
    <div v-else-if="type === 'list'" class="skeleton-list">
      <div class="skeleton-list-item" v-for="i in items" :key="i">
        <div v-if="showAvatar" class="skeleton-avatar" style="width: 40px; height: 40px;"></div>
        <div class="skeleton-list-content">
          <div class="skeleton-line" style="width: 100px; height: 16px; margin-bottom: 8px;"></div>
          <div class="skeleton-line" style="width: 200px; height: 12px;"></div>
        </div>
      </div>
    </div>

    <!-- 自定义骨架屏 -->
    <div v-else class="skeleton-custom">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'text' | 'avatar' | 'card' | 'table' | 'chart' | 'list' | 'custom'
  lines?: number
  width?: string
  height?: string
  size?: string
  rows?: number
  columns?: number
  items?: number
  animated?: boolean
  showHeader?: boolean
  showAvatar?: boolean
  theme?: 'light' | 'dark'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  lines: 3,
  width: '100%',
  height: 'auto',
  size: '40px',
  rows: 5,
  columns: 4,
  items: 5,
  animated: true,
  showHeader: true,
  showAvatar: true,
  theme: 'light'
})

const skeletonClass = computed(() => [
  `skeleton-${props.theme}`,
  { 'skeleton-animated': props.animated }
])

const lineStyle = computed(() => ({
  width: props.width,
  height: props.height
}))
</script>

<style scoped lang="scss">
@use '@/styles/theme.scss';

.loading-skeleton {
  width: 100%;
}

// 基础骨架屏样式
.skeleton-line,
.skeleton-avatar,
.skeleton-bar {
  background: linear-gradient(
    90deg,
    $gray-200 25%,
    $gray-100 50%,
    $gray-200 75%
  );
  background-size: 200% 100%;
  border-radius: $border-radius-sm;
}

// 暗色主题
.skeleton-dark {
  .skeleton-line,
  .skeleton-avatar,
  .skeleton-bar {
    background: linear-gradient(
      90deg,
      $gray-700 25%,
      $gray-600 50%,
      $gray-700 75%
    );
    background-size: 200% 100%;
  }
}

// 动画效果
.skeleton-animated {
  .skeleton-line,
  .skeleton-avatar,
  .skeleton-bar {
    animation: skeleton-loading 1.5s ease-in-out infinite;
  }
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

// 文本骨架屏
.skeleton-line {
  margin-bottom: $spacing-2;

  &:last-child {
    margin-bottom: 0;
  }
}

// 头像骨架屏
.skeleton-avatar {
  border-radius: 50%;
  flex-shrink: 0;
}

// 卡片骨架屏
.skeleton-card {
  background: $white;
  border: 1px solid $border-primary;
  border-radius: $border-radius-base;
  padding: $spacing-6;
  margin-bottom: $spacing-4;

  .skeleton-card-header {
    display: flex;
    align-items: center;
    margin-bottom: $spacing-6;

    .skeleton-card-header-content {
      flex: 1;
      margin-left: $spacing-4;
    }
  }

  .skeleton-card-content {
    .skeleton-line {
      margin-bottom: $spacing-3;
    }
  }
}

// 表格骨架屏
.skeleton-table {
  width: 100%;
  background: $white;
  border: 1px solid $border-primary;
  border-radius: $border-radius-base;
  overflow: hidden;

  .skeleton-table-header {
    display: flex;
    padding: $spacing-4 $spacing-6;
    background: $gray-50;
    border-bottom: 1px solid $border-primary;

    .skeleton-line {
      flex: 1;
      margin-right: $spacing-4;

      &:last-child {
        margin-right: 0;
      }
    }
  }

  .skeleton-table-body {
    .skeleton-table-row {
      display: flex;
      padding: $spacing-4 $spacing-6;
      border-bottom: 1px solid $border-primary;

      &:last-child {
        border-bottom: none;
      }

      .skeleton-line {
        flex: 1;
        margin-right: $spacing-4;

        &:last-child {
          margin-right: 0;
        }
      }
    }
  }
}

// 图表骨架屏
.skeleton-chart {
  background: $white;
  border: 1px solid $border-primary;
  border-radius: $border-radius-base;
  padding: $spacing-6;

  .skeleton-chart-header {
    margin-bottom: $spacing-6;
  }

  .skeleton-chart-content {
    height: 300px;

    .skeleton-chart-bars {
      display: flex;
      align-items: flex-end;
      height: 100%;
      gap: $spacing-2;

      .skeleton-bar {
        flex: 1;
        border-radius: $border-radius-sm $border-radius-sm 0 0;
        min-height: 20px;
      }
    }
  }
}

// 列表骨架屏
.skeleton-list {
  .skeleton-list-item {
    display: flex;
    align-items: center;
    padding: $spacing-4;
    background: $white;
    border: 1px solid $border-primary;
    border-radius: $border-radius-base;
    margin-bottom: $spacing-3;

    .skeleton-list-content {
      flex: 1;
      margin-left: $spacing-4;
    }
  }
}

// 响应式设计
@media (max-width: $breakpoint-md) {
  .skeleton-table {
    .skeleton-table-header,
    .skeleton-table-row {
      padding: $spacing-3;
    }
  }

  .skeleton-card {
    padding: $spacing-4;
  }

  .skeleton-chart {
    padding: $spacing-4;
  }
}

// 特殊效果
.skeleton-shimmer {
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    animation: shimmer 2s infinite;
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

// 脉冲效果
.skeleton-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>