<!--
 * @fileoverview YYC³餐饮行业智能化平台 - 导航进度条组件
 * @description 显示页面加载进度，提供流畅的视觉反馈
 * @module NavigationProgressBar
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 * @updated 2025-01-19
 -->
<template>
  <div class="navigation-progress-bar" :class="progressBarClasses">
    <div
      class="progress-bar"
      :style="progressBarStyle"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  color?: string
  height?: string
  duration?: number
  showOnRouteChange?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  color: 'var(--color-primary)',
  height: '3px',
  duration: 300,
  showOnRouteChange: true
})

const router = useRouter()
const progress = ref(0)
const isVisible = ref(false)
let progressInterval: number | null = null
let timeoutId: number | null = null

const progressBarClasses = computed(() => ({
  'is-visible': isVisible.value
}))

const progressBarStyle = computed(() => ({
  width: `${progress.value}%`,
  backgroundColor: props.color,
  height: props.height,
  transition: `width ${props.duration}ms ease-out`
}))

function startProgress() {
  if (!props.showOnRouteChange) return
  
  isVisible.value = true
  progress.value = 0
  
  if (progressInterval) clearInterval(progressInterval)
  
  progressInterval = window.setInterval(() => {
    if (progress.value < 90) {
      progress.value += Math.random() * 10
    }
  }, 100)
}

function completeProgress() {
  if (!props.showOnRouteChange) return
  
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
  
  progress.value = 100
  
  if (timeoutId) clearTimeout(timeoutId)
  
  timeoutId = window.setTimeout(() => {
    isVisible.value = false
    progress.value = 0
  }, props.duration)
}

function resetProgress() {
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
  
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
  
  progress.value = 0
  isVisible.value = false
}

router.beforeEach(() => {
  startProgress()
})

router.afterEach(() => {
  completeProgress()
})

router.onError(() => {
  resetProgress()
})

onMounted(() => {
  console.log('NavigationProgressBar mounted')
})

onUnmounted(() => {
  resetProgress()
})
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';

.navigation-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-notification);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;

  &.is-visible {
    opacity: 1;
  }
}

.progress-bar {
  background: var(--color-primary);
  box-shadow: 0 0 10px rgba(44, 95, 172, 0.3);
  will-change: width;
}

@media (prefers-reduced-motion: reduce) {
  .progress-bar {
    transition: none;
  }
}

@media (max-width: $breakpoint-md) {
  .progress-bar {
    height: 2px;
  }
}

@media (max-width: $breakpoint-sm) {
  .progress-bar {
    height: 2px;
  }
}
</style>
