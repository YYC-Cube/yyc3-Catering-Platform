<!--
 YYC³餐饮行业智能化平台 - 虚拟滚动组件
 高性能渲染大量数据列表
-->
<template>
  <div
    ref="containerRef"
    class="virtual-list"
    :style="containerStyle"
    @scroll="onScroll"
  >
    <!-- 虚拟内容区域 -->
    <div class="virtual-list-phantom" :style="{ height: totalHeight + 'px' }"></div>

    <!-- 可见项容器 -->
    <div class="virtual-list-content" :style="contentStyle">
      <div
        v-for="item in visibleItems"
        :key="getItemKey(item)"
        class="virtual-list-item"
        :style="{ height: itemHeight + 'px' }"
        :data-index="item.index"
      >
        <slot
          :item="item.data"
          :index="item.index"
          :style="{ height: itemHeight + 'px' }"
        >
          <!-- 默认显示 -->
          <div class="default-item">
            {{ JSON.stringify(item.data) }}
          </div>
        </slot>
      </div>
    </div>

    <!-- 加载指示器 -->
    <div v-if="showLoader" class="virtual-list-loader">
      <slot name="loader">
        <div class="default-loader">
          <div class="loader-spinner"></div>
          <span class="loader-text">加载中...</span>
        </div>
      </slot>
    </div>

    <!-- 空状态 -->
    <div v-if="showEmptyState" class="virtual-list-empty">
      <slot name="empty">
        <div class="default-empty">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20 6L9 17l-5-5"/>
            <path d="M13 6h7v2h2V6h4"/>
            <path d="M13 14h7v2h2V14h4"/>
            <circle cx="8" cy="8" r="2"/>
          </svg>
          <span class="empty-text">暂无数据</span>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { VirtualScroller, throttle, debounce } from '@/utils/lazyLoad'

interface VirtualItem {
  data: any
  index: number
}

interface Props {
  items: any[]
  itemHeight?: number
  containerHeight?: number
  bufferSize?: number
  threshold?: number
  estimatedItemHeight?: number
  getKey?: (item: any, index: number) => string | number
  loader?: boolean
  empty?: boolean
  loadMore?: boolean
  preloadDistance?: number
}

const props = withDefaults(defineProps<Props>(), {
  itemHeight: 50,
  containerHeight: 400,
  bufferSize: 10,
  threshold: 100,
  loader: false,
  empty: true,
  loadMore: true,
  preloadDistance: 5
})

const emit = defineEmits<{
  scroll: [{ scrollTop: number; isBottom: boolean }]
  loadMore: []
  itemClick: [{ item: any; index: number; event: Event }]
  itemVisible: [{ item: any; index: number; visible: boolean }]
}>()

// 响应式数据
const containerRef = ref<HTMLElement>()
const scrollTop = ref(0)
const startIndex = ref(0)
const endIndex = ref(0)
const isScrolling = ref(false)
const isLoading = ref(false)
const isAtBottom = ref(false)

// 虚拟滚动器实例
let virtualScroller: VirtualScroller | null = null
let scrollTimeout: NodeJS.Timeout | null = null
let itemHeights = new Map<string, number>()

// 计算属性
const totalHeight = computed(() => {
  return props.items.length * props.itemHeight
})

const visibleItems = computed(() => {
  const items: VirtualItem[] = []
  for (let i = startIndex.value; i <= endIndex.value; i++) {
    if (i < props.items.length) {
      items.push({
        data: props.items[i],
        index: i
      })
    }
  }
  return items
})

const contentStyle = computed(() => {
  return {
    transform: `translateY(${startIndex.value * props.itemHeight}px)`,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    willChange: 'transform'
  }
})

const containerStyle = computed(() => {
  return {
    height: props.containerHeight + 'px',
    overflow: 'auto',
    position: 'relative'
  }
})

const showLoader = computed(() => {
  return props.loader && isLoading.value
})

const showEmptyState = computed(() => {
  return props.empty && props.items.length === 0 && !isLoading.value
})

// 方法
const getItemKey = (item: VirtualItem): string | number => {
  if (props.getKey) {
    return props.getKey(item.data, item.index)
  }
  return item.index
}

const calculateVisibleRange = () => {
  const containerHeight = props.containerHeight
  const visibleCount = Math.ceil(containerHeight / props.itemHeight)

  let start = Math.floor(scrollTop.value / props.itemHeight)
  let end = start + visibleCount + props.bufferSize

  // 边界检查
  start = Math.max(0, start - props.bufferSize)
  end = Math.min(props.items.length - 1, end + props.bufferSize)

  startIndex.value = start
  endIndex.value = end

  // 检查是否接近底部
  const distanceFromBottom = totalHeight.value - (scrollTop.value + containerHeight)
  isAtBottom.value = distanceFromBottom < props.threshold

  // 触发加载更多
  if (props.loadMore && distanceFromBottom < props.preloadDistance * props.itemHeight) {
    emit('loadMore')
  }
}

const onScroll = throttle((event: Event) => {
  const target = event.target as HTMLElement
  scrollTop.value = target.scrollTop
  isScrolling.value = true

  // 清除滚动停止定时器
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }

  // 设置新的滚动停止定时器
  scrollTimeout = setTimeout(() => {
    isScrolling.value = false
  }, 150)

  calculateVisibleRange()
  emit('scroll', {
    scrollTop: scrollTop.value,
    isBottom: isAtBottom.value
  })
}, 16)

const scrollToIndex = (index: number) => {
  if (containerRef.value) {
    const targetScrollTop = index * props.itemHeight
    containerRef.value.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    })
  }
}

const scrollToTop = () => {
  if (containerRef.value) {
    containerRef.value.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

const scrollToBottom = () => {
  if (containerRef.value) {
    containerRef.value.scrollTo({
      top: totalHeight.value,
      behavior: 'smooth'
    })
  }
}

const refresh = () => {
  isLoading.value = true
  startIndex.value = 0
  endIndex.value = Math.min(props.bufferSize, props.items.length - 1)

  // 模拟加载延迟
  setTimeout(() => {
    isLoading.value = false
  }, 300)
}

// 动态项目高度支持
const updateItemHeight = (index: number, height: number) => {
  const key = getItemKey({ data: props.items[index], index })
  itemHeights.set(key, height)

  // 如果项目高度发生变化，需要重新计算可见范围
  nextTick(() => {
    calculateVisibleRange()
  })
}

const getItemHeight = (index: number): number => {
  const key = getItemKey({ data: props.items[index], index })
  return itemHeights.get(key) || props.itemHeight
}

// 预加载功能
const preloadItems = (direction: 'up' | 'down' = 'down') => {
  const preloadDistance = props.preloadDistance

  if (direction === 'up') {
    // 预加载前面的项
    const start = Math.max(0, startIndex.value - preloadDistance)
    for (let i = start; i < startIndex.value; i++) {
      if (props.items[i]) {
        // 预加载逻辑
        preloadItemData(props.items[i])
      }
    }
  } else {
    // 预加载后面的项
    const end = Math.min(props.items.length - 1, endIndex.value + preloadDistance)
    for (let i = endIndex.value + 1; i <= end; i++) {
      if (props.items[i]) {
        // 预加载逻辑
        preloadItemData(props.items[i])
      }
    }
  }
}

const preloadItemData = (item: any) => {
  // 预加载图片或其他资源
  if (item.image) {
    const img = new Image()
    img.src = item.image
  }
}

// 键盘导航支持
const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowUp':
      event.preventDefault()
      const newIndex = Math.max(0, startIndex.value - 1)
      scrollToIndex(newIndex)
      break
    case 'ArrowDown':
      event.preventDefault()
      const nextIndex = Math.min(props.items.length - 1, startIndex.value + 1)
      scrollToIndex(nextIndex)
      break
    case 'Home':
      event.preventDefault()
      scrollToIndex(0)
      break
    case 'End':
      event.preventDefault()
      scrollToIndex(props.items.length - 1)
      break
    case 'PageUp':
      event.preventDefault()
      const pageUpIndex = Math.max(0, startIndex.value - Math.floor(props.containerHeight / props.itemHeight))
      scrollToIndex(pageUpIndex)
      break
    case 'PageDown':
      event.preventDefault()
      const pageDownIndex = Math.min(
        props.items.length - 1,
        startIndex.value + Math.floor(props.containerHeight / props.itemHeight)
      )
      scrollToIndex(pageDownIndex)
      break
  }
}

// 初始化虚拟滚动器
const initVirtualScroller = () => {
  if (containerRef.value) {
    virtualScroller = new VirtualScroller(containerRef.value, props.itemHeight)
    virtualScroller.setItems(props.items)

    // 监听虚拟滚动事件
    containerRef.value.addEventListener('virtual-scroll', (event: any) => {
      const { startIndex: start, endIndex: end, visibleItems: items } = event.detail
      startIndex.value = start
      endIndex.value = end
    })
  }
}

// 监听可见项变化
watch(visibleItems, (newItems) => {
  newItems.forEach((item, index) => {
    // 触发项可见事件
    emit('itemVisible', {
      item: item.data,
      index: item.index,
      visible: true
    })
  })
}, { deep: true })

// 监听数据变化
watch(() => props.items, () => {
  nextTick(() => {
    calculateVisibleRange()
    if (virtualScroller) {
      virtualScroller.setItems(props.items)
    }
  })
}, { deep: true })

// 生命周期
onMounted(() => {
  nextTick(() => {
    initVirtualScroller()
    calculateVisibleRange()

    // 添加键盘事件监听
    if (containerRef.value) {
      containerRef.value.addEventListener('keydown', handleKeydown)
      containerRef.value.setAttribute('tabindex', '0')
    }
  })
})

onUnmounted(() => {
  // 清理定时器
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }

  // 清理虚拟滚动器
  if (virtualScroller) {
    virtualScroller = null
  }

  // 清理事件监听器
  if (containerRef.value) {
    containerRef.value.removeEventListener('keydown', handleKeydown)
  }

  // 清理缓存
  itemHeights.clear()
})

// 暴露方法
defineExpose({
  scrollToIndex,
  scrollToTop,
  scrollToBottom,
  refresh,
  updateItemHeight,
  getItemHeight,
  preloadItems,
  scrollToItem: (item: any) => {
    const index = props.items.indexOf(item)
    if (index !== -1) {
      scrollToIndex(index)
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as *;

.virtual-list {
  position: relative;
  overflow: auto;
  border: 1px solid var(--color-border);
  border-radius: $border-radius-lg;
  background: var(--color-surface);

  &:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  .virtual-list-phantom {
    position: relative;
    pointer-events: none;
  }

  .virtual-list-content {
    position: relative;
    will-change: transform;

    .virtual-list-item {
      position: absolute;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      border-bottom: 1px solid var(--color-border);
      background: var(--color-surface);
      transition: background-color 0.2s ease;

      &:hover {
        background-color: var(--color-surface-hover);
      }

      &:focus {
        outline: 2px solid var(--color-primary);
        outline-offset: -2px;
      }

      .default-item {
        padding: var(--spacing-3);
        width: 100%;
        font-size: $font-size-body;
        color: var(--color-text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .virtual-list-loader {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-2);

    .default-loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-2);
      color: var(--color-text-secondary);

      .loader-spinner {
        width: 24px;
        height: 24px;
        border: 2px solid var(--color-border);
        border-top: 2px solid var(--color-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .loader-text {
        font-size: $font-size-body-small;
        color: var(--color-text-secondary);
      }
    }
  }

  .virtual-list-empty {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-3);

    .default-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-3);
      color: var(--color-text-secondary);

      .empty-icon {
        width: 48px;
        height: 48px;
        stroke-width: 1.5;
        opacity: 0.5;
        margin-bottom: var(--spacing-2);
      }

      .empty-text {
        font-size: $font-size-body;
        color: var(--color-text-secondary);
        text-align: center;
      }
    }
  }
}

// 动画
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 滚动条样式
.virtual-list {
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(--color-fill-color-light);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-fill-color-dark);
    border-radius: 4px;

    &:hover {
      background: var(--color-fill-color-darker);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .virtual-list {
    border-radius: $border-radius-md;

    .virtual-list-content .virtual-list-item {
      .default-item {
        padding: var(--spacing-2);
      }
    }
  }
}

// 高对比度模式
@media (prefers-contrast: high) {
  .virtual-list {
    border-width: 2px;

    .virtual-list-content .virtual-list-item {
      border-width: 2px;
    }
  }
}

// 减少动画偏好
@media (prefers-reduced-motion: reduce) {
  .virtual-list-content {
    will-change: auto;
  }

  .virtual-list-content .virtual-list-item {
    transition: background-color 0.1s ease;
  }

  .virtual-list-loader .loader-spinner {
    animation: none;
  }
}
</style>