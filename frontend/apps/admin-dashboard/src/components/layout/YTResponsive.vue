<!--
 YYC³餐饮管理系统 - 响应式工具组件
 基于节点2的响应式设计框架
 依托: YYC³系统色设计令牌 + YTLayout + YTGrid
-->
<template>
  <div
    class="yt-responsive"
    :class="responsiveClasses"
    :style="responsiveStyles"
  >
    <!-- 响应式内容包装器 -->
    <div
      v-if="as === 'div'"
      class="yt-responsive__content"
      :class="contentClasses"
    >
      <slot />
    </div>

    <!-- 响应式图片 -->
    <img
      v-else-if="as === 'img'"
      :src="src"
      :alt="alt"
      :class="contentClasses"
      :style="imageStyles"
      @load="handleImageLoad"
      @error="handleImageError"
    />

    <!-- 响应式文本 -->
    <span
      v-else-if="as === 'span'"
      class="yt-responsive__content"
      :class="contentClasses"
    >
      <slot />
    </span>

    <!-- 其他标签 -->
    <component
      v-else
      :is="as"
      :class="contentClasses"
      v-bind="$attrs"
    >
      <slot />
    </component>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

interface Props {
  // 标签类型
  as?: 'div' | 'span' | 'img' | 'section' | 'article' | 'main' | 'aside' | 'header' | 'footer' | 'nav'

  // 响应式配置
  breakpoints?: Record<string, {
    hidden?: boolean
    className?: string
    styles?: Record<string, string>
  }>

  // 图片专用属性
  src?: string
  alt?: string
  lazy?: boolean

  // 响应式尺寸
  aspectRatio?: string | Record<string, string>
  maxWidth?: string | Record<string, string>
  minHeight?: string | Record<string, string>

  // 显示控制
  showOnBreakpoints?: string[]
  hideOnBreakpoints?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  as: 'div',
  breakpoints: () => ({}),
  lazy: false,
  aspectRatio: 'auto',
  maxWidth: '100%',
  minHeight: 'auto',
  showOnBreakpoints: () => [],
  hideOnBreakpoints: () => []
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

const imageLoaded = ref(false)
const imageError = ref(false)

// 计算属性
const responsiveClasses = computed(() => {
  const classes = [
    'yt-responsive',
    `yt-responsive--${currentBreakpoint.value}`
  ]

  // 添加当前断点的特定类名
  const breakpointConfig = props.breakpoints[currentBreakpoint.value]
  if (breakpointConfig?.className) {
    classes.push(breakpointConfig.className)
  }

  // 检查是否应该显示
  const shouldShow = shouldShowOnCurrentBreakpoint()
  const shouldHide = shouldHideOnCurrentBreakpoint()

  if (shouldHide || !shouldShow) {
    classes.push('yt-responsive--hidden')
  }

  return classes
})

const contentClasses = computed(() => {
  const classes = []

  // 添加自定义类名
  if (props.breakpoints[currentBreakpoint.value]?.className) {
    classes.push(props.breakpoints[currentBreakpoint.value].className!)
  }

  // 图片状态类
  if (props.as === 'img') {
    if (imageLoaded.value) {
      classes.push('yt-responsive__img--loaded')
    }
    if (imageError.value) {
      classes.push('yt-responsive__img--error')
    }
    if (props.lazy && !imageLoaded.value) {
      classes.push('yt-responsive__img--lazy')
    }
  }

  return classes
})

const responsiveStyles = computed(() => {
  const styles: Record<string, string> = {}

  // 获取当前断点的配置
  const breakpointConfig = props.breakpoints[currentBreakpoint.value]
  if (breakpointConfig?.styles) {
    Object.assign(styles, breakpointConfig.styles)
  }

  return styles
})

const imageStyles = computed(() => {
  const styles: Record<string, string> = {}

  // 处理响应式宽高比
  if (typeof props.aspectRatio === 'string') {
    styles.aspectRatio = props.aspectRatio
  } else if (typeof props.aspectRatio === 'object') {
    const ratio = props.aspectRatio[currentBreakpoint.value]
    if (ratio) {
      styles.aspectRatio = ratio
    }
  }

  // 处理响应式最大宽度
  if (typeof props.maxWidth === 'string') {
    styles.maxWidth = props.maxWidth
  } else if (typeof props.maxWidth === 'object') {
    const width = props.maxWidth[currentBreakpoint.value]
    if (width) {
      styles.maxWidth = width
    }
  }

  // 处理响应式最小高度
  if (typeof props.minHeight === 'string') {
    styles.minHeight = props.minHeight
  } else if (typeof props.minHeight === 'object') {
    const height = props.minHeight[currentBreakpoint.value]
    if (height) {
      styles.minHeight = height
    }
  }

  return styles
})

// 方法
const shouldShowOnCurrentBreakpoint = (): boolean => {
  if (props.showOnBreakpoints.length === 0) return true
  return props.showOnBreakpoints.includes(currentBreakpoint.value)
}

const shouldHideOnCurrentBreakpoint = (): boolean => {
  return props.hideOnBreakpoints.includes(currentBreakpoint.value)
}

const handleImageLoad = () => {
  imageLoaded.value = true
  imageError.value = false
}

const handleImageError = () => {
  imageError.value = true
  imageLoaded.value = false
}

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

// 暴露方法
defineExpose({
  currentBreakpoint,
  shouldShowOnCurrentBreakpoint,
  shouldHideOnCurrentBreakpoint,
  imageLoaded,
  imageError
})
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss';

.yt-responsive {
  position: relative;
  display: block;
  width: 100%;

  // 隐藏状态
  &--hidden {
    display: none !important;
  }

  &__content {
    width: 100%;
    height: 100%;
  }

  // 响应式断点基础样式
  &--sm {
    // 移动端样式
    .yt-responsive__content {
      font-size: $font-size-body-normal;
    }
  }

  &--md {
    // 平板端样式
    .yt-responsive__content {
      font-size: $font-size-body-large;
    }
  }

  &--lg {
    // 桌面端样式
    .yt-responsive__content {
      font-size: $font-size-body-large;
    }
  }

  &--xl {
    // 大屏幕样式
    .yt-responsive__content {
      font-size: $font-size-body-large;
    }
  }

  &--2xl {
    // 超大屏幕样式
    .yt-responsive__content {
      font-size: $font-size-h3;
    }
  }
}

// 图片响应式样式
.yt-responsive__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: $transition-opacity;

  &--lazy {
    opacity: 0;
  }

  &--loaded {
    opacity: 1;
  }

  &--error {
    opacity: 0.5;
    background: var(--color-darker);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-secondary);

    &::before {
      content: '📷';
      font-size: 48px;
      opacity: 0.5;
    }
  }
}

// 文本响应式样式
.yt-responsive--text {
  &--sm {
    font-size: $font-size-body-small;
    line-height: $line-height-body-small;
  }

  &--md {
    font-size: $font-size-body-normal;
    line-height: $line-height-body-normal;
  }

  &--lg {
    font-size: $font-size-body-large;
    line-height: $line-height-body-large;
  }

  &--xl {
    font-size: $font-size-h4;
    line-height: $line-height-h4;
  }

  &--2xl {
    font-size: $font-size-h3;
    line-height: $line-height-h3;
  }
}

// 标题响应式样式
.yt-responsive--heading {
  &--sm {
    font-size: $font-size-h3;
    line-height: $line-height-h3;
    font-weight: $font-weight-semibold;
  }

  &--md {
    font-size: $font-size-h2;
    line-height: $line-height-h2;
    font-weight: $font-weight-semibold;
  }

  &--lg {
    font-size: $font-size-h2;
    line-height: $line-height-h2;
    font-weight: $font-weight-semibold;
  }

  &--xl {
    font-size: $font-size-h1;
    line-height: $line-height-h1;
    font-weight: $font-weight-bold;
  }

  &--2xl {
    font-size: $font-size-h1;
    line-height: $line-height-h1;
    font-weight: $font-weight-bold;
  }
}

// 卡片响应式样式
.yt-responsive--card {
  background: var(--color-darker);
  border-radius: $border-radius-lg;
  padding: var(--spacing-lg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: $transition-all;

  &--sm {
    padding: var(--spacing-md);
    border-radius: $border-radius-base;
  }

  &--md {
    padding: var(--spacing-lg);
  }

  &--lg {
    padding: var(--spacing-xl);
  }

  &--xl {
    padding: var(--spacing-2xl);
  }

  &:hover {
    box-shadow: $shadow-lg;
    transform: translateY(-2px);
  }
}

// 容器响应式样式
.yt-responsive--container {
  max-width: var(--layout-max-width);
  margin: 0 auto;

  &--sm {
    padding: 0 var(--spacing-sm);
  }

  &--md {
    padding: 0 var(--spacing-md);
  }

  &--lg {
    padding: 0 var(--spacing-lg);
  }

  &--xl {
    padding: 0 var(--spacing-xl);
  }

  &--2xl {
    padding: 0 var(--spacing-2xl);
  }
}

// 间距响应式样式
.yt-responsive--spacing {
  &--sm {
    padding: var(--spacing-sm);
    margin: var(--spacing-sm);
  }

  &--md {
    padding: var(--spacing-md);
    margin: var(--spacing-md);
  }

  &--lg {
    padding: var(--spacing-lg);
    margin: var(--spacing-lg);
  }

  &--xl {
    padding: var(--spacing-xl);
    margin: var(--spacing-xl);
  }

  &--2xl {
    padding: var(--spacing-2xl);
    margin: var(--spacing-2xl);
  }
}

// 网格响应式样式
.yt-responsive--grid {
  display: grid;

  &--sm {
    grid-template-columns: repeat(1, 1fr);
    gap: var(--spacing-sm);
  }

  &--md {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }

  &--lg {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-lg);
  }

  &--xl {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-xl);
  }

  &--2xl {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-2xl);
  }
}

// 弹性布局响应式样式
.yt-responsive--flex {
  display: flex;

  &--sm {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  &--md {
    flex-direction: row;
    gap: var(--spacing-md);
  }

  &--lg {
    flex-direction: row;
    gap: var(--spacing-lg);
  }

  &--xl {
    flex-direction: row;
    gap: var(--spacing-xl);
  }

  &--2xl {
    flex-direction: row;
    gap: var(--spacing-2xl);
  }
}

// 按钮响应式样式
.yt-responsive--button {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: $font-size-body-normal;

  &--sm {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: $font-size-body-small;
  }

  &--md {
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: $font-size-body-normal;
  }

  &--lg {
    padding: var(--spacing-md) var(--spacing-xl);
    font-size: $font-size-body-large;
  }

  &--xl {
    padding: var(--spacing-md) var(--spacing-2xl);
    font-size: $font-size-body-large;
  }
}

// 输入框响应式样式
.yt-responsive--input {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: $font-size-body-normal;
  height: 40px;

  &--sm {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: $font-size-body-small;
    height: 36px;
  }

  &--md {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: $font-size-body-normal;
    height: 44px;
  }

  &--lg {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: $font-size-body-large;
    height: 48px;
  }

  &--xl {
    padding: var(--spacing-md) var(--spacing-xl);
    font-size: $font-size-body-large;
    height: 52px;
  }
}

// 响应式隐藏类
@media (max-width: 767px) {
  .yt-responsive--hide-mobile {
    display: none !important;
  }

  .yt-responsive--show-mobile {
    display: block !important;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .yt-responsive--hide-tablet {
    display: none !important;
  }

  .yt-responsive--show-tablet {
    display: block !important;
  }
}

@media (min-width: 1024px) and (max-width: 1279px) {
  .yt-responsive--hide-desktop {
    display: none !important;
  }

  .yt-responsive--show-desktop {
    display: block !important;
  }
}

@media (min-width: 1280px) {
  .yt-responsive--hide-desktop-lg {
    display: none !important;
  }

  .yt-responsive--show-desktop-lg {
    display: block !important;
  }
}

// 触摸设备优化
@media (hover: none) {
  .yt-responsive:hover {
    // 移除悬停效果
    transform: none;
    box-shadow: none;
  }
}

// 高对比度模式支持
@media (prefers-contrast: high) {
  .yt-responsive {
    border-color: var(--color-text-primary);
  }
}

// 动画性能优化
.yt-responsive {
  will-change: transform, opacity;
}

// 可访问性支持
.yt-responsive:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>