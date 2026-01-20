<!--
 * @fileoverview YYC³餐饮行业智能化平台 - 响应式图片组件
 * @description 支持WebP格式、懒加载、响应式尺寸的图片组件
 * @module ResponsiveImage
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 * @updated 2025-01-19
 -->
<template>
  <div class="responsive-image" :class="imageClasses">
    <img
      v-if="!isLoaded && placeholder"
      :src="placeholder"
      :alt="alt"
      class="image-placeholder"
    />
    <picture v-else>
      <source
        v-if="webPSupported"
        :srcset="webPSrcSet"
        :sizes="sizes"
        type="image/webp"
      />
      <img
        :src="fallbackSrc"
        :srcset="fallbackSrcSet"
        :sizes="sizes"
        :alt="alt"
        :loading="loading"
        :width="width"
        :height="height"
        :class="imageClass"
        @load="handleLoad"
        @error="handleError"
      />
    </picture>
    <div v-if="isLoading" class="image-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
    </div>
    <div v-if="error" class="image-error">
      <el-icon><Picture /></el-icon>
      <span>加载失败</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Loading, Picture } from '@element-plus/icons-vue'
import { useImageOptimization } from '@/utils/imageOptimizer'

interface Props {
  src: string
  alt: string
  width?: number
  height?: number
  quality?: number
  lazy?: boolean
  placeholder?: string
  sizes?: string
  loading?: 'lazy' | 'eager'
  className?: string
  fallbackFormat?: 'jpeg' | 'png'
}

const props = withDefaults(defineProps<Props>(), {
  quality: 85,
  lazy: true,
  loading: 'lazy',
  fallbackFormat: 'jpeg',
  sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
})

const emit = defineEmits<{
  (e: 'load', event: Event): void
  (e: 'error', event: Event): void
}>()

const {
  isInitialized,
  webPSupported,
  initialize,
  getOptimizedUrl,
  generateSrcSet
} = useImageOptimization()

const isLoaded = ref(false)
const isLoading = ref(true)
const error = ref(false)

const imageClasses = computed(() => ({
  'is-loading': isLoading.value,
  'is-loaded': isLoaded.value,
  'has-error': error.value,
  [props.className || '']: !!props.className
}))

const imageClass = computed(() => ({
  'responsive-img': true,
  'is-loaded': isLoaded.value
}))

const webPSrcSet = computed(() => {
  if (!isInitialized.value) return ''
  return generateSrcSet(props.src, {
    quality: props.quality
  })
})

const fallbackSrc = computed(() => {
  if (!isInitialized.value) return props.src
  return getOptimizedUrl(props.src, {
    quality: props.quality,
    format: props.fallbackFormat
  })
})

const fallbackSrcSet = computed(() => {
  if (!isInitialized.value) return ''
  return generateSrcSet(props.src, {
    quality: props.quality,
    format: props.fallbackFormat
  })
})

function handleLoad(event: Event) {
  isLoading.value = false
  isLoaded.value = true
  error.value = false
  emit('load', event)
}

function handleError(event: Event) {
  isLoading.value = false
  isLoaded.value = false
  error.value = true
  emit('error', event)
}

onMounted(async () => {
  await initialize()
})
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';

.responsive-image {
  position: relative;
  display: inline-block;
  overflow: hidden;
  background: var(--color-bg-tertiary);
  border-radius: var(--border-radius-md);
  min-width: 100px;
  min-height: 100px;

  &.is-loading {
    background: var(--color-bg-tertiary);
  }

  &.is-loaded {
    background: transparent;
  }

  &.has-error {
    background: var(--color-bg-tertiary);
  }
}

.image-placeholder,
picture {
  display: block;
  width: 100%;
  height: 100%;
}

.image-placeholder {
  object-fit: cover;
  opacity: 0.5;
  filter: blur(4px);
}

.responsive-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
  opacity: 0;

  &.is-loaded {
    opacity: 1;
  }
}

.image-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  font-size: 24px;

  .el-icon {
    animation: rotate 1s linear infinite;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.image-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  color: var(--color-text-placeholder);
  font-size: var(--font-size-body-small);

  .el-icon {
    font-size: 32px;
  }
}

@media (max-width: $breakpoint-md) {
  .responsive-image {
    min-width: 80px;
    min-height: 80px;
  }

  .image-loading {
    font-size: 20px;
  }

  .image-error {
    .el-icon {
      font-size: 24px;
    }
  }
}

@media (max-width: $breakpoint-sm) {
  .responsive-image {
    min-width: 60px;
    min-height: 60px;
  }

  .image-loading {
    font-size: 16px;
  }

  .image-error {
    font-size: var(--font-size-body-tiny);

    .el-icon {
      font-size: 20px;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .responsive-img {
    transition: none;
  }

  .image-loading {
    .el-icon {
      animation: none;
    }
  }
}
</style>
