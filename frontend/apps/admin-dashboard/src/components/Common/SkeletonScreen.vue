<!--
 * @fileoverview YYC³餐饮行业智能化平台 - 骨架屏组件
 * @description 提供多种类型的骨架屏加载效果
 * @module SkeletonScreen
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 * @updated 2025-01-19
 -->
<template>
  <div class="skeleton-screen" :class="skeletonClasses">
    <!-- 文本骨架 -->
    <div v-if="type === 'text'" class="skeleton-text">
      <div
        v-for="i in lines"
        :key="i"
        class="skeleton-line"
        :style="{ width: getLineWidth(i) }"
      ></div>
    </div>

    <!-- 卡片骨架 -->
    <div v-else-if="type === 'card'" class="skeleton-card">
      <div class="skeleton-card-header">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-title"></div>
      </div>
      <div class="skeleton-card-body">
        <div
          v-for="i in cardLines"
          :key="i"
          class="skeleton-line"
        ></div>
      </div>
    </div>

    <!-- 列表骨架 -->
    <div v-else-if="type === 'list'" class="skeleton-list">
      <div
        v-for="i in listItems"
        :key="i"
        class="skeleton-list-item"
      >
        <div class="skeleton-avatar"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-line"></div>
        </div>
      </div>
    </div>

    <!-- 表格骨架 -->
    <div v-else-if="type === 'table'" class="skeleton-table">
      <div class="skeleton-table-header">
        <div
          v-for="i in columns"
          :key="i"
          class="skeleton-th"
        ></div>
      </div>
      <div
        v-for="row in rows"
        :key="row"
        class="skeleton-table-row"
      >
        <div
          v-for="col in columns"
          :key="col"
          class="skeleton-td"
        ></div>
      </div>
    </div>

    <!-- 图表骨架 -->
    <div v-else-if="type === 'chart'" class="skeleton-chart">
      <div class="skeleton-chart-header">
        <div class="skeleton-title"></div>
        <div class="skeleton-actions">
          <div class="skeleton-button"></div>
          <div class="skeleton-button"></div>
        </div>
      </div>
      <div class="skeleton-chart-body">
        <div class="skeleton-chart-area">
          <div
            v-for="i in chartBars"
            :key="i"
            class="skeleton-chart-bar"
            :style="{ height: getBarHeight(i) }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 自定义骨架 -->
    <div v-else class="skeleton-custom">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'text' | 'card' | 'list' | 'table' | 'chart' | 'custom'
  lines?: number
  cardLines?: number
  listItems?: number
  columns?: number
  rows?: number
  chartBars?: number
  animated?: boolean
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  lines: 3,
  cardLines: 4,
  listItems: 5,
  columns: 5,
  rows: 5,
  chartBars: 8,
  animated: true,
  color: 'var(--color-neutral-200)'
})

const skeletonClasses = computed(() => ({
  'is-animated': props.animated
}))

function getLineWidth(index: number) {
  const widths = ['100%', '90%', '80%', '70%', '60%']
  return widths[(index - 1) % widths.length]
}

function getBarHeight(index: number) {
  const heights = ['60%', '80%', '45%', '90%', '55%', '70%', '40%', '85%']
  return heights[(index - 1) % heights.length]
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';

.skeleton-screen {
  width: 100%;
  padding: var(--spacing-lg);
  background: var(--color-bg-primary);
  
  .skeleton-text,
  .skeleton-line,
  .skeleton-title,
  .skeleton-avatar,
  .skeleton-button,
  .skeleton-th,
  .skeleton-td,
  .skeleton-chart-bar {
    background: var(--color-neutral-200);
    border-radius: var(--border-radius-sm);
  }
  
  &.is-animated {
    .skeleton-text,
    .skeleton-line,
    .skeleton-title,
    .skeleton-avatar,
    .skeleton-button,
    .skeleton-th,
    .skeleton-td,
    .skeleton-chart-bar {
      animation: skeleton-loading 1.5s ease-in-out infinite;
      background: linear-gradient(
        90deg,
        var(--color-neutral-200) 0%,
        var(--color-neutral-100) 50%,
        var(--color-neutral-200) 100%
      );
      background-size: 200% 100%;
    }
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

.skeleton-text {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.skeleton-line {
  height: 16px;
  margin-bottom: var(--spacing-sm);
}

.skeleton-card {
  background: var(--color-bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.skeleton-card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-full);
  flex-shrink: 0;
}

.skeleton-title {
  height: 24px;
  width: 200px;
}

.skeleton-card-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.skeleton-list-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--border-radius-md);
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.skeleton-table {
  background: var(--color-bg-secondary);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
}

.skeleton-table-header {
  display: flex;
  border-bottom: 1px solid var(--color-border-primary);
  padding: var(--spacing-md);
}

.skeleton-th {
  flex: 1;
  height: 20px;
  margin-right: var(--spacing-md);
  
  &:last-child {
    margin-right: 0;
  }
}

.skeleton-table-row {
  display: flex;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border-light);
  
  &:last-child {
    border-bottom: none;
  }
}

.skeleton-td {
  flex: 1;
  height: 16px;
  margin-right: var(--spacing-md);
  
  &:last-child {
    margin-right: 0;
  }
}

.skeleton-chart {
  background: var(--color-bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
}

.skeleton-chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
}

.skeleton-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.skeleton-button {
  width: 80px;
  height: 32px;
  border-radius: var(--border-radius-sm);
}

.skeleton-chart-body {
  height: 300px;
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--color-bg-tertiary);
  border-radius: var(--border-radius-md);
}

.skeleton-chart-area {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  width: 100%;
  height: 100%;
}

.skeleton-chart-bar {
  width: 40px;
  border-radius: var(--border-radius-sm) var(--border-radius-sm) 0 0;
  min-height: 20%;
}

.skeleton-custom {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

@media (max-width: $breakpoint-md) {
  .skeleton-screen {
    padding: var(--spacing-md);
  }
  
  .skeleton-card,
  .skeleton-list-item,
  .skeleton-chart {
    padding: var(--spacing-md);
  }
  
  .skeleton-chart-body {
    height: 200px;
  }
  
  .skeleton-chart-bar {
    width: 30px;
  }
}

@media (max-width: $breakpoint-sm) {
  .skeleton-screen {
    padding: var(--spacing-sm);
  }
  
  .skeleton-card,
  .skeleton-list-item,
  .skeleton-chart {
    padding: var(--spacing-sm);
  }
  
  .skeleton-avatar {
    width: 40px;
    height: 40px;
  }
  
  .skeleton-title {
    width: 150px;
  }
  
  .skeleton-chart-body {
    height: 150px;
  }
  
  .skeleton-chart-bar {
    width: 20px;
  }
}
</style>
