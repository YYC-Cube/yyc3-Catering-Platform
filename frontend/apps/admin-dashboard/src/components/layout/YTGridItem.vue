<!--
 YYC³餐饮管理系统 - 网格项目组件
 基于节点2的响应式设计框架
 依托: YYC³系统色设计令牌 + YTGrid布局组件
-->
<template>
  <div
    class="yt-grid-item"
    :class="itemClasses"
    :style="itemStyles"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  // 网格列跨度
  span?: number
  // 网格行跨度
  rowSpan?: number
  // 起始列位置
  colStart?: number
  // 结束列位置
  colEnd?: number
  // 起始行位置
  rowStart?: number
  // 结束行位置
  rowEnd?: number
  // 对齐方式
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'
  align?: 'start' | 'center' | 'end' | 'stretch'
  // 特殊样式类型
  type?: 'primary' | 'success' | 'warning' | 'danger'
  // 响应式显示控制
  hideMobile?: boolean
  hideTablet?: boolean
  hideDesktop?: boolean
  // 状态
  loading?: boolean
  error?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  span: 1,
  rowSpan: 1,
  colStart: 0,
  colEnd: 0,
  rowStart: 0,
  rowEnd: 0,
  justify: 'stretch',
  align: 'stretch',
  hideMobile: false,
  hideTablet: false,
  hideDesktop: false,
  loading: false,
  error: false
})

// 计算网格项目的类名
const itemClasses = computed(() => [
  {[`yt-grid-item--${props.type}`]: props.type},
  {[`yt-grid-item--hide-mobile`]: props.hideMobile},
  {[`yt-grid-item--hide-tablet`]: props.hideTablet},
  {[`yt-grid-item--hide-desktop`]: props.hideDesktop},
  {[`yt-grid-item--loading`]: props.loading},
  {[`yt-grid-item--error`]: props.error},
  {
    [`yt-grid-item--justify-${props.justify}`]: props.justify !== 'stretch',
    [`yt-grid-item--align-${props.align}`]: props.align !== 'stretch'
  }
])

// 计算网格项目的样式
const itemStyles = computed(() => {
  const styles: Record<string, string> = {}
  
  if (props.span > 1) {
    styles['grid-column'] = `span ${props.span}`
  } else if (props.colStart > 0 && props.colEnd > 0) {
    styles['grid-column'] = `${props.colStart} / ${props.colEnd}`
  } else if (props.colStart > 0) {
    styles['grid-column-start'] = `${props.colStart}`
  } else if (props.colEnd > 0) {
    styles['grid-column-end'] = `${props.colEnd}`
  }
  
  if (props.rowSpan > 1) {
    styles['grid-row'] = `span ${props.rowSpan}`
  } else if (props.rowStart > 0 && props.rowEnd > 0) {
    styles['grid-row'] = `${props.rowStart} / ${props.rowEnd}`
  } else if (props.rowStart > 0) {
    styles['grid-row-start'] = `${props.rowStart}`
  } else if (props.rowEnd > 0) {
    styles['grid-row-end'] = `${props.rowEnd}`
  }
  
  return styles
})
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss';

.yt-grid-item {
  // 确保网格项目正确显示
  min-width: 0;
  min-height: 0;
  
  // 基础对齐方式
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
  
  // 对齐方式变体
  &--justify-start { justify-content: flex-start; }
  &--justify-center { justify-content: center; }
  &--justify-end { justify-content: flex-end; }
  &--justify-space-between { justify-content: space-between; }
  &--justify-space-around { justify-content: space-around; }
  &--justify-space-evenly { justify-content: space-evenly; }
  
  &--align-start { align-items: flex-start; }
  &--align-center { align-items: center; }
  &--align-end { align-items: flex-end; }
  
  // 状态样式
  &--primary { border-top: 4px solid var(--color-primary); }
  &--success { border-top: 4px solid var(--color-success); }
  &--warning { border-top: 4px solid var(--color-warning); }
  &--danger { border-top: 4px solid var(--color-danger); }
  
  // 响应式显示控制
  &--hide-mobile { display: none; }
  &--show-mobile { display: block; }
  &--hide-tablet { display: none; }
  &--show-tablet { display: block; }
  &--hide-desktop { display: none; }
  &--show-desktop { display: block; }
  
  // 动画效果
  animation: fadeInUp 0.3s ease-out;
  
  // 错误状态
  &--error {
    background: rgba(239, 68, 68, 0.1);
    border-color: var(--color-danger);
    animation: shake 0.5s ease-in-out;
  }
  
  // 加载状态
  &--loading {
    position: relative;
    pointer-events: none;
    opacity: 0.7;
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 20px;
      height: 20px;
      margin: -10px 0 0 -10px;
      border: 2px solid transparent;
      border-top: 2px solid var(--color-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }
}

// 动画定义
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 响应式显示控制
@media (min-width: 640px) {
  .yt-grid-item {
    &--hide-mobile {
      display: block;
    }
    
    &--show-mobile {
      display: none;
    }
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .yt-grid-item {
    &--hide-tablet {
      display: none;
    }
    
    &--show-tablet {
      display: block;
    }
  }
}

@media (min-width: 1024px) {
  .yt-grid-item {
    &--hide-desktop {
      display: none;
    }
    
    &--show-desktop {
      display: block;
    }
  }
}
</style>