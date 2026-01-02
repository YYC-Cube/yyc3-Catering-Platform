<template>
  <div
    ref="containerRef"
    class="lazy-image"
    :class="{ 'loading': isLoading, 'error': hasError, 'loaded': isLoaded }"
    :style="{ width: width + 'px', height: height + 'px' }"
  >
    <!-- 加载占位符 -->
    <div v-if="isLoading" class="placeholder">
      <el-icon :size="iconSize" class="loading-icon">
        <Loading />
      </el-icon>
      <div v-if="showPlaceholder" class="placeholder-text">{{ placeholderText }}</div>
    </div>

    <!-- 错误占位符 -->
    <div v-else-if="hasError" class="error-placeholder">
      <el-icon :size="iconSize" class="error-icon">
        <PictureFilled />
      </el-icon>
      <div class="error-text">{{ errorText }}</div>
      <el-button
        v-if="retryable"
        type="text"
        size="small"
        @click="retry"
      >
        重试
      </el-button>
    </div>

    <!-- 实际图片 -->
    <img
      v-show="isLoaded"
      ref="imageRef"
      :src="actualSrc"
      :alt="alt"
      :class="imageClass"
      :style="imageStyle"
      @load="handleImageLoad"
      @error="handleImageError"
    />

    <!-- 低质量占位符（LQIP） -->
    <img
      v-if="placeholderSrc && !isLoaded"
      :src="placeholderSrc"
      :alt="alt"
      class="placeholder-image"
      :style="{ filter: 'blur(10px)', transform: 'scale(1.1)' }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Loading, PictureFilled } from '@element-plus/icons-vue'

interface Props {
  src: string
  alt?: string
  width?: number
  height?: number
  placeholderSrc?: string
  placeholderText?: string
  errorText?: string
  showPlaceholder?: boolean
  retryable?: boolean
  threshold?: number
  rootMargin?: string
  imageClass?: string
  lazy?: boolean
  fadeIn?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  width: 200,
  height: 200,
  placeholderText: '加载中...',
  errorText: '加载失败',
  showPlaceholder: true,
  retryable: true,
  threshold: 0.1,
  rootMargin: '50px',
  imageClass: '',
  lazy: true,
  fadeIn: true
})

const emit = defineEmits<{
  load: [event: Event]
  error: [event: Event]
  intersect: [entries: IntersectionObserverEntry[]]
}>()

const containerRef = ref<HTMLElement>()
const imageRef = ref<HTMLImageElement>()

const isLoading = ref(false)
const isLoaded = ref(false)
const hasError = ref(false)
const actualSrc = ref('')
const retryCount = ref(0)
const maxRetries = 3

const observer = ref<IntersectionObserver | null>(null)

// 计算图标大小
const iconSize = computed(() => Math.min(props.width, props.height) * 0.3)

// 计算图片样式
const imageStyle = computed(() => {
  const style: Record<string, any> = {
    width: props.width + 'px',
    height: props.height + 'px',
    objectFit: 'cover'
  }

  if (props.fadeIn && isLoaded.value) {
    style.opacity = '1'
    style.transition = 'opacity 0.3s ease-in-out'
  } else if (props.fadeIn && !isLoaded.value) {
    style.opacity = '0'
  }

  return style
})

// 处理图片加载
const loadImage = () => {
  if (actualSrc.value === props.src) return

  isLoading.value = true
  hasError.value = false
  actualSrc.value = props.src
}

// 处理图片加载成功
const handleImageLoad = (event: Event) => {
  isLoading.value = false
  isLoaded.value = true
  hasError.value = false
  retryCount.value = 0
  emit('load', event)
}

// 处理图片加载失败
const handleImageError = (event: Event) => {
  isLoading.value = false
  hasError.value = true

  if (props.retryable && retryCount.value < maxRetries) {
    retryCount.value++
    setTimeout(() => {
      loadImage()
    }, 1000 * retryCount.value) // 递增延迟重试
  }

  emit('error', event)
}

// 重试加载
const retry = () => {
  retryCount.value = 0
  loadImage()
}

// 创建交叉观察器
const createObserver = () => {
  if (!props.lazy || !('IntersectionObserver' in window)) {
    loadImage()
    return
  }

  observer.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadImage()
          observer.value?.unobserve(entry.target)
        }
      })
      emit('intersect', entries)
    },
    {
      threshold: props.threshold,
      rootMargin: props.rootMargin
    }
  )

  if (containerRef.value) {
    observer.value.observe(containerRef.value)
  }
}

// 销毁观察器
const destroyObserver = () => {
  if (observer.value) {
    observer.value.disconnect()
    observer.value = null
  }
}

// 强制加载图片
const forceLoad = () => {
  destroyObserver()
  loadImage()
}

// 重置状态
const reset = () => {
  isLoading.value = false
  isLoaded.value = false
  hasError.value = false
  actualSrc.value = ''
  retryCount.value = 0
  destroyObserver()
  createObserver()
}

// 监听src变化
watch(() => props.src, (newSrc, oldSrc) => {
  if (newSrc !== oldSrc) {
    reset()
  }
})

// 监听lazy属性变化
watch(() => props.lazy, (newLazy) => {
  if (newLazy !== props.lazy) {
    destroyObserver()
    createObserver()
  }
})

onMounted(() => {
  createObserver()
})

onUnmounted(() => {
  destroyObserver()
})

// 暴露方法
defineExpose({
  forceLoad,
  reset,
  retry
})
</script>

<style scoped lang="scss">
@use '@/styles/theme.scss';

.lazy-image {
  position: relative;
  overflow: hidden;
  background: $gray-100;
  border-radius: $border-radius-base;

  &.loading,
  &.error {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }

  .placeholder,
  .error-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: $text-placeholder;

    .loading-icon {
      animation: spin 1s linear infinite;
      color: $primary-color;
    }

    .error-icon {
      color: $danger-color;
    }

    .placeholder-text,
    .error-text {
      margin-top: $spacing-2;
      font-size: $font-size-sm;
      text-align: center;
    }
  }

  .placeholder-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 0.3s ease-in-out;
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 深色主题支持
@media (prefers-color-scheme: dark) {
  .lazy-image {
    background: $dark-bg-tertiary;

    .placeholder,
    .error-placeholder {
      color: $dark-text-placeholder;
    }
  }
}
</style>