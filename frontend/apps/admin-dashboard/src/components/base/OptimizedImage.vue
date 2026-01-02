<!--
 YYC³餐饮行业智能化平台 - 优化图片组件
 支持懒加载、占位符、错误处理和性能优化
-->
<template>
  <div
    class="optimized-image"
    :class="{
      'loading': isLoading,
      'error': hasError,
      'loaded': isLoaded
    }"
    :style="containerStyle"
  >
    <!-- 占位符 -->
    <div v-if="showPlaceholder" class="image-placeholder" :style="placeholderStyle">
      <div class="placeholder-content">
        <slot name="placeholder">
          <div class="default-placeholder">
            <svg class="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span class="placeholder-text">加载中...</span>
          </div>
        </slot>
      </div>
    </div>

    <!-- 实际图片 -->
    <img
      ref="imageRef"
      :src="currentSrc"
      :alt="alt"
      :loading="lazy ? 'lazy' : 'eager'"
      :sizes="responsiveSizes"
      :srcset="srcset"
      :style="imageStyle"
      @load="onLoad"
      @error="onError"
      @loadstart="onLoadStart"
      @progress="onProgress"
    />

    <!-- 错误状态 -->
    <div v-if="hasError" class="image-error">
      <slot name="error">
        <div class="error-content">
          <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <line x="15" y="9" x2="9" y2="15"/>
            <line x="9" y="9" x2="15" y2="15"/>
          </svg>
          <span class="error-text">图片加载失败</span>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ImageLazyLoader, MemoryLeakGuard } from '@/utils/lazyLoad'

interface Props {
  src?: string
  alt?: string
  width?: number | string
  height?: number | string
  lazy?: boolean
  placeholder?: string
  placeholderColor?: string
  fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  quality?: number
  formats?: ('webp' | 'avif' | 'jpg' | 'png')[]
  srcset?: string
  sizes?: string
  loadingStrategy?: 'progressive' | 'lazy' | 'eager'
  cache?: boolean
  preload?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  lazy: true,
  placeholderColor: '#f5f5f5',
  fit: 'cover',
  quality: 80,
  formats: () => ['webp', 'jpg'],
  loadingStrategy: 'lazy',
  cache: true,
  preload: false
})

const emit = defineEmits<{
  load: []
  error: [Event]
  progress: [{ loaded: number; total: number }]
  loadstart: []
}>()

// 响应式数据
const imageRef = ref<HTMLImageElement>()
const isLoading = ref(false)
const isLoaded = ref(false)
const hasError = ref(false)
const loadProgress = ref(0)

// 懒加载器实例
let lazyLoader: ImageLazyLoader | null = null
const memoryGuard = new MemoryLeakGuard()

// 计算属性
const showPlaceholder = computed(() => {
  return !isLoaded.value && !hasError.value && (props.placeholder || isLoading.value)
})

const containerStyle = computed(() => {
  const style: Record<string, any> = {}

  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }

  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }

  return style
})

const imageStyle = computed(() => {
  const style: Record<string, any> = {
    objectFit: props.fit,
    opacity: isLoaded.value ? 1 : 0,
    transition: 'opacity 0.3s ease'
  }

  if (props.width && props.height) {
    style.width = '100%'
    style.height = '100%'
  }

  return style
})

const placeholderStyle = computed(() => {
  const style: Record<string, any> = {
    backgroundColor: props.placeholderColor,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }

  return style
})

const responsiveSizes = computed(() => {
  if (props.sizes) return props.sizes

  // 自动生成响应式尺寸
  if (typeof props.width === 'number') {
    return `${props.width}px`
  }

  return '100vw'
})

// 图片处理
const generateSrcset = (): string => {
  if (props.srcset) return props.srcset

  if (!props.src) return ''

  const src = props.src
  const formats = props.formats
  const quality = props.quality

  // 生成多尺寸srcset
  const sizes = [320, 640, 768, 1024, 1280, 1536]
  const srcsetItems: string[] = []

  sizes.forEach(width => {
    formats.forEach(format => {
      if (format === 'webp') {
        srcsetItems.push(`${src}?w=${width}&q=${quality}&format=webp ${width}w`)
      } else if (format === 'jpg') {
        srcsetItems.push(`${src}?w=${width}&q=${quality}&format=jpg ${width}w`)
      }
    })
  })

  return srcsetItems.join(', ')
}

const currentSrc = computed(() => {
  if (props.placeholder && !isLoaded.value) {
    return props.placeholder
  }

  if (!props.src) return ''

  // 使用最优格式
  if (props.formats.includes('webp') && supportsWebP()) {
    return `${props.src}?q=${props.quality}&format=webp`
  }

  return props.src
})

// 工具函数
const supportsWebP = (): boolean => {
  if (typeof window === 'undefined') return false

  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
}

const loadImage = async (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))

    // 添加缓存头
    if (props.cache) {
      img.src = `${src}?t=${Date.now()}`
    } else {
      img.src = src
    }
  })
}

// 事件处理
const onLoadStart = () => {
  isLoading.value = true
  emit('loadstart')
}

const onProgress = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target.lengthComputable) {
    loadProgress.value = (target.loaded / target.total) * 100
    emit('progress', { loaded: target.loaded, total: target.total })
  }
}

const onLoad = async () => {
  isLoading.value = false
  isLoaded.value = true

  // 预加载下一张图片（如果有的话）
  if (props.preload && props.src) {
    await preloadNextImages()
  }

  emit('load')
}

const onError = (event: Event) => {
  isLoading.value = false
  hasError.value = true
  emit('error', event)
}

const preloadNextImages = async () => {
  // 预加载逻辑
  // 这里可以实现预加载同系列的图片
}

// 初始化懒加载
const initLazyLoad = () => {
  if (!props.lazy || !imageRef.value) return

  lazyLoader = new ImageLazyLoader({
    rootMargin: '50px',
    threshold: 0.1
  })

  memoryGuard.addObserver(lazyLoader)
  lazyLoader.observe(imageRef.value)
}

// 监听src变化
watch(() => props.src, async (newSrc, oldSrc) => {
  if (newSrc !== oldSrc) {
    isLoaded.value = false
    hasError.value = false
    isLoading.value = true

    if (newSrc) {
      try {
        await loadImage(newSrc)
        // 预加载新图片
        if (imageRef.value) {
          imageRef.value.src = newSrc
        }
      } catch (error) {
        hasError.value = true
      }
    }
  }
})

// 生命周期
onMounted(() => {
  nextTick(() => {
    initLazyLoad()
  })
})

onUnmounted(() => {
  memoryGuard.cleanup()
  if (lazyLoader) {
    lazyLoader.disconnect()
  }
})

// 暴露方法
defineExpose({
  reload: () => {
    if (imageRef.value && props.src) {
      imageRef.value.src = props.src
      isLoaded.value = false
      hasError.value = false
      isLoading.value = true
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as *;

.optimized-image {
  position: relative;
  overflow: hidden;
  border-radius: $border-radius-md;
  background-color: var(--color-surface);

  .image-placeholder {
    border-radius: inherit;

    .placeholder-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-2);
      color: var(--color-text-secondary);

      .default-placeholder {
        text-align: center;

        .placeholder-icon {
          width: 48px;
          height: 48px;
          stroke-width: 1.5;
          opacity: 0.5;
        }

        .placeholder-text {
          font-size: $font-size-body-small;
          color: var(--color-text-secondary);
        }
      }
    }
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background-color: var(--color-surface);
  }

  .image-error {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-surface);
    border-radius: inherit;

    .error-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-2);
      color: var(--color-danger);

      .error-icon {
        width: 48px;
        height: 48px;
        stroke-width: 2;
        opacity: 0.7;
      }

      .error-text {
        font-size: $font-size-body-small;
        color: var(--color-text-secondary);
      }
    }
  }

  // 状态样式
  &.loading {
    .image-placeholder {
      animation: pulse 1.5s ease-in-out infinite;
    }
  }

  &.loaded {
    .image-placeholder {
      display: none;
    }
  }

  &.error {
    .image-placeholder {
      display: none;
    }
  }
}

// 动画
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// 响应式优化
@media (max-width: 768px) {
  .optimized-image {
    .placeholder-icon,
    .error-icon {
      width: 36px;
      height: 36px;
    }
  }
}

// 减少动画偏好
@media (prefers-reduced-motion: reduce) {
  .optimized-image {
    .image-placeholder {
      animation: none;
    }

    img {
      transition: none;
    }
  }
}
</style>