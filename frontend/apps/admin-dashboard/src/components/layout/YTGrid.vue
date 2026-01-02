<!--
 YYC³餐饮管理系统 - 响应式网格容器组件
 基于节点2的响应式设计框架
 依托: YYC³系统色设计令牌 + YTLayout布局组件
-->
<template>
  <div
    class="yt-grid"
    :class="gridClasses"
    :style="gridStyles"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import YTGridItem from './YTGridItem.vue'

interface Props {
  // 网格列数
  cols?: number | Record<string, number>
  rows?: number | Record<string, number>

  // 间距配置
  gap?: string | Record<string, string>
  rowGap?: string
  columnGap?: string

  // 对齐方式
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'
  align?: 'start' | 'center' | 'end' | 'stretch'

  // 自动布局
  autoFit?: boolean
  minColumnWidth?: number

  // 响应式配置
  responsive?: Record<string, {
    cols?: number
    rows?: number
    gap?: string
  }>
  
  // 网格类型
  type?: 'cards' | 'stats' | 'form' | 'images' | 'list'
  // 间距变体
  spacing?: 'compact' | 'normal' | 'spacious' | 'no-gap'
  // 对齐变体
  alignment?: 'center' | 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  cols: 12,
  rows: 'auto',
  gap: 'var(--spacing-md)',
  justify: 'start',
  align: 'stretch',
  autoFit: false,
  minColumnWidth: 200,
  responsive: () => ({}),
  type: undefined,
  spacing: 'normal',
  alignment: undefined
})

// 导出YTGridItem组件，方便使用
const GridItem = YTGridItem

defineExpose({
  GridItem
})

// 响应式状态
const windowWidth = ref(0)
const currentBreakpoint = computed(() => {
  if (windowWidth.value < 640) return 'sm'
  if (windowWidth.value < 768) return 'md'
  if (windowWidth.value < 1024) return 'lg'
  if (windowWidth.value < 1280) return 'xl'
  return '2xl'
})

// 计算网格配置
const gridConfig = computed(() => {
  // 获取当前断点的配置
  const breakpointConfig = props.responsive[currentBreakpoint.value] || {}

  return {
    cols: breakpointConfig.cols || (typeof props.cols === 'number' ? props.cols : props.cols?.default || 12),
    rows: breakpointConfig.rows || (typeof props.rows === 'number' ? props.rows : props.rows?.default || 'auto'),
    gap: breakpointConfig.gap || (typeof props.gap === 'string' ? props.gap : props.gap?.default || 'var(--spacing-md)')
  }
})

// 计算属性
const gridClasses = computed(() => [
  `yt-grid--${currentBreakpoint.value}`,
  `yt-grid--justify-${props.justify}`,
  `yt-grid--align-${props.align}`,
  {[`yt-grid--${props.type}`]: props.type},
  {[`yt-grid--${props.spacing}`]: props.spacing !== 'normal'},
  {[`yt-grid--${props.alignment}`]: props.alignment},
  {
    'yt-grid--auto-fit': props.autoFit,
    'yt-grid--masonry': props.type === 'images',
    'yt-grid--dense': props.type === 'list'
  }
])

const gridStyles = computed(() => {
  const baseStyles = {
    '--grid-cols': Array.isArray(props.cols) ? props.cols.length : gridConfig.value.cols,
    '--grid-rows': typeof gridConfig.value.rows === 'number' ? gridConfig.value.rows : 'auto',
    '--grid-gap': gridConfig.value.gap,
    '--grid-row-gap': props.rowGap || 'auto',
    '--grid-column-gap': props.columnGap || 'auto',
    '--grid-min-column-width': `${props.minColumnWidth}px`
  }

  // 处理响应式列数
  if (typeof props.cols === 'object' && !Array.isArray(props.cols)) {
    Object.entries(props.cols).forEach(([breakpoint, cols]) => {
      if (currentBreakpoint.value === breakpoint) {
        baseStyles['--grid-cols'] = cols
      }
    })
  }

  // 处理响应式行数
  if (typeof props.rows === 'object' && !Array.isArray(props.rows)) {
    Object.entries(props.rows).forEach(([breakpoint, rows]) => {
      if (currentBreakpoint.value === breakpoint) {
        baseStyles['--grid-rows'] = rows
      }
    })
  }

  // 处理响应式间距
  if (typeof props.gap === 'object' && !Array.isArray(props.gap)) {
    Object.entries(props.gap).forEach(([breakpoint, gap]) => {
      if (currentBreakpoint.value === breakpoint) {
        baseStyles['--grid-gap'] = gap
      }
    })
  }

  return baseStyles
})

// 响应式处理
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

// 生命周期
onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss';

.yt-grid {
  display: grid;
  width: 100%;

  // 网格配置
  grid-template-columns: repeat(var(--grid-cols), 1fr);
  grid-template-rows: repeat(var(--grid-rows), minmax(0, 1fr));
  gap: var(--grid-gap);
  row-gap: var(--grid-row-gap);
  column-gap: var(--grid-column-gap);

  // 自动适配模式
  &--auto-fit {
    grid-template-columns: repeat(auto-fit, minmax(var(--grid-min-column-width), 1fr));
  }

  // 对齐方式
  &--justify-start {
    justify-items: start;
  }

  &--justify-center {
    justify-items: center;
  }

  &--justify-end {
    justify-items: end;
  }

  &--justify-space-between {
    justify-items: space-between;
  }

  &--justify-space-around {
    justify-items: space-around;
  }

  &--justify-space-evenly {
    justify-items: space-evenly;
  }

  &--align-start {
    align-items: start;
  }

  &--align-center {
    align-items: center;
  }

  &--align-end {
    align-items: end;
  }

  &--align-stretch {
    align-items: stretch;
  }

  // 响应式断点样式
  &--sm {
    // 移动端默认12列网格
    --grid-cols: 12;
    --grid-gap: var(--spacing-sm);
  }

  &--md {
    // 平板端默认12列网格
    --grid-cols: 12;
    --grid-gap: var(--spacing-md);
  }

  &--lg {
    // 桌面端默认12列网格
    --grid-cols: 12;
    --grid-gap: var(--spacing-lg);
  }

  &--xl {
    // 大屏幕默认12列网格
    --grid-cols: 12;
    --grid-gap: var(--spacing-xl);
  }

  &--2xl {
    // 超大屏幕网格
    --grid-cols: 16;
    --grid-gap: var(--spacing-2xl);
  }

  // 特殊网格模式
  &--masonry {
    display: grid;
    grid-template-rows: masonry;
  }

  &--dense {
    grid-auto-flow: dense;
  }

  // 卡片网格样式
  &--cards {
    .yt-grid-item {
      background: var(--color-darker);
      border-radius: $border-radius-lg;
      padding: var(--spacing-lg);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: $transition-all;

      &:hover {
        box-shadow: $shadow-lg;
        transform: translateY(-2px);
      }
    }
  }

  // 统计卡片网格
  &--stats {
    .yt-grid-item {
      background: var(--color-darker);
      border-radius: $border-radius-lg;
      padding: var(--spacing-lg);
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      min-height: 120px;
    }
  }

  // 表单网格
  &--form {
    .yt-grid-item {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);

      &--label {
        font-weight: $font-weight-medium;
        color: var(--color-text-secondary);
        font-size: $font-size-body-small;
      }

      &--field {
        flex: 1;
      }

      &--required::after {
        content: '*';
        color: var(--color-danger);
        margin-left: $spacing-xs;
      }
    }
  }

  // 图片网格
  &--images {
    .yt-grid-item {
      aspect-ratio: 1;
      overflow: hidden;
      border-radius: $border-radius-lg;
      background: var(--color-darker);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: $transition-transform;

        &:hover {
          transform: scale(1.05);
        }
      }
    }
  }

  // 列表网格
  &--list {
    .yt-grid-item {
      background: var(--color-darker);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: $border-radius-base;
      padding: var(--spacing-md);
      transition: $transition-colors;

      &:hover {
        background: rgba(255, 255, 255, 0.02);
        border-color: var(--color-primary);
      }

      &--header {
        font-weight: $font-weight-semibold;
        background: rgba(79, 70, 229, 0.1);
        border-color: var(--color-primary);
      }
    }
  }

  // 网格间距变体
  &--compact {
    --grid-gap: var(--spacing-sm);
  }

  &--spacious {
    --grid-gap: var(--spacing-xl);
  }

  &--no-gap {
    --grid-gap: 0;
  }

  // 网格对齐变体
  &--center {
    justify-items: center;
    align-items: center;
  }

  &--left {
    justify-items: start;
    align-items: center;
  }

  &--right {
    justify-items: end;
    align-items: center;
  }
}

// 确保网格项目正确显示
.yt-grid > * {
  min-width: 0;
}
</style>