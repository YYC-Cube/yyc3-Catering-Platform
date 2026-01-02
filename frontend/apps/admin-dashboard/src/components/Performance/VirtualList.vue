<template>
  <div
    ref="containerRef"
    class="virtual-list"
    :style="{ height: containerHeight + 'px' }"
    @scroll="handleScroll"
  >
    <div
      class="virtual-list-phantom"
      :style="{ height: totalHeight + 'px' }"
    ></div>

    <div
      class="virtual-list-content"
      :style="{ transform: `translateY(${offsetY}px)` }"
    >
      <div
        v-for="(item, index) in visibleItems"
        :key="getItemKey(item, startIndex + index)"
        class="virtual-list-item"
        :style="{ height: itemHeight + 'px' }"
        @click="handleItemClick(item, startIndex + index)"
      >
        <slot
          :item="item"
          :index="startIndex + index"
          :visible="true"
        >
          <div class="default-item">{{ item }}</div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  items: any[]
  itemHeight: number
  containerHeight: number
  keyField?: string
  bufferSize?: number
  threshold?: number
}

const props = withDefaults(defineProps<Props>(), {
  keyField: 'id',
  bufferSize: 5,
  threshold: 100
})

const emit = defineEmits<{
  scroll: [{ scrollTop: number; scrollLeft: number }]
  itemClick: [item: any, index: number]
  visibleRangeChange: [{ start: number; end: number }]
}>()

const containerRef = ref<HTMLElement>()
const scrollTop = ref(0)

// 计算总高度
const totalHeight = computed(() => props.items.length * props.itemHeight)

// 计算可见范围
const visibleRange = computed(() => {
  const startIndex = Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.bufferSize)
  const endIndex = Math.min(
    props.items.length - 1,
    Math.ceil((scrollTop.value + props.containerHeight) / props.itemHeight) + props.bufferSize
  )
  return { startIndex, endIndex }
})

// 计算偏移量
const offsetY = computed(() => visibleRange.value.startIndex * props.itemHeight)

// 获取可见项目
const visibleItems = computed(() => {
  const { startIndex, endIndex } = visibleRange.value
  return props.items.slice(startIndex, endIndex + 1)
})

const startIndex = computed(() => visibleRange.value.startIndex)

// 处理滚动事件
const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  scrollTop.value = target.scrollTop

  emit('scroll', {
    scrollTop: target.scrollTop,
    scrollLeft: target.scrollLeft
  })

  emit('visibleRangeChange', {
    start: visibleRange.value.startIndex,
    end: visibleRange.value.endIndex
  })
}

// 处理项目点击
const handleItemClick = (item: any, index: number) => {
  emit('itemClick', item, index)
}

// 获取项目键值
const getItemKey = (item: any, index: number): string | number => {
  if (item && typeof item === 'object' && props.keyField in item) {
    return item[props.keyField]
  }
  return index
}

// 滚动到指定项目
const scrollToItem = (index: number, alignment: 'start' | 'center' | 'end' = 'start') => {
  if (!containerRef.value || index < 0 || index >= props.items.length) return

  let scrollTop: number
  const itemTop = index * props.itemHeight

  switch (alignment) {
    case 'start':
      scrollTop = itemTop
      break
    case 'center':
      scrollTop = itemTop - (props.containerHeight - props.itemHeight) / 2
      break
    case 'end':
      scrollTop = itemTop - props.containerHeight + props.itemHeight
      break
  }

  containerRef.value.scrollTop = Math.max(0, Math.min(scrollTop, totalHeight.value - props.containerHeight))
}

// 滚动到顶部
const scrollToTop = () => {
  if (containerRef.value) {
    containerRef.value.scrollTop = 0
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (containerRef.value) {
    containerRef.value.scrollTop = totalHeight.value
  }
}

// 获取滚动信息
const getScrollInfo = () => {
  return {
    scrollTop: scrollTop.value,
    scrollHeight: totalHeight.value,
    clientHeight: props.containerHeight,
    scrollPercentage: totalHeight.value > 0
      ? (scrollTop.value / (totalHeight.value - props.containerHeight)) * 100
      : 0
  }
}

// 监听滚动位置变化，进行预加载
let scrollTimer: NodeJS.Timeout | null = null
watch(scrollTop, (newScrollTop, oldScrollTop) => {
  if (scrollTimer) {
    clearTimeout(scrollTimer)
  }

  scrollTimer = setTimeout(() => {
    // 检查是否接近底部
    const scrollInfo = getScrollInfo()
    if (scrollInfo.scrollPercentage > 80) {
      // 触发加载更多事件（如果需要）
      console.log('Near bottom, consider loading more items')
    }

    // 检查是否接近顶部
    if (scrollInfo.scrollPercentage < 20) {
      // 可以在这里处理向上滚动时的预加载
      console.log('Near top, consider preload previous items')
    }
  }, props.threshold)
})

// 暴露方法给父组件
defineExpose({
  scrollToItem,
  scrollToTop,
  scrollToBottom,
  getScrollInfo
})

onMounted(() => {
  // 初始化可见范围
  emit('visibleRangeChange', {
    start: visibleRange.value.startIndex,
    end: visibleRange.value.endIndex
  })
})

onUnmounted(() => {
  if (scrollTimer) {
    clearTimeout(scrollTimer)
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/theme.scss';

.virtual-list {
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;

  .virtual-list-phantom {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: -1;
  }

  .virtual-list-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;

    .virtual-list-item {
      box-sizing: border-box;
      border-bottom: 1px solid $border-light;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: $gray-50;
      }

      .default-item {
        padding: $spacing-3;
        display: flex;
        align-items: center;
      }
    }
  }
}

// 滚动条样式
.virtual-list::-webkit-scrollbar {
  width: 6px;
}

.virtual-list::-webkit-scrollbar-track {
  background: $gray-100;
}

.virtual-list::-webkit-scrollbar-thumb {
  background: $gray-300;
  border-radius: 3px;

  &:hover {
    background: $gray-400;
  }
}

// 深色主题支持
@media (prefers-color-scheme: dark) {
  .virtual-list {
    .virtual-list-item {
      border-bottom-color: $dark-border-primary;

      &:hover {
        background: $dark-bg-tertiary;
      }
    }

    &::-webkit-scrollbar-track {
      background: $dark-bg-tertiary;
    }

    &::-webkit-scrollbar-thumb {
      background: $dark-border-primary;

      &:hover {
        background: $gray-600;
      }
    }
  }
}
</style>