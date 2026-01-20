<!--
 * @fileoverview YYC³餐饮行业智能化平台 - 导航加载指示器组件
 * @description 显示导航过程中的加载状态和进度反馈
 * @module NavigationLoader
 * @author YYC³
 * @version 1.0.0
 * @created 2024-01-19
 * @updated 2024-01-19
 -->
<template>
  <Transition name="fade">
    <div v-if="isLoading" class="navigation-loader">
      <div class="loader-content">
        <div class="spinner">
          <svg class="spinner-svg" viewBox="0 0 50 50">
            <circle
              class="spinner-circle"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="currentColor"
              stroke-width="4"
            />
          </svg>
        </div>
        <p class="loader-text">{{ loadingText }}</p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNavigationState } from '@/composables/useNavigationState'

interface Props {
  customText?: string
}

const props = withDefaults(defineProps<Props>(), {
  customText: ''
})

const navState = useNavigationState()

const isLoading = computed(() => navState.isNavigating())

const loadingText = computed(() => {
  if (props.customText) {
    return props.customText
  }
  
  const currentPath = navState.getCurrentPath()
  if (currentPath) {
    return `正在跳转到 ${currentPath}...`
  }
  
  return '加载中...'
})
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';

.navigation-loader {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-loader);
  backdrop-filter: blur(4px);
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  background-color: var(--color-surface);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  min-width: 200px;
}

.spinner {
  width: 50px;
  height: 50px;
  color: var(--color-primary);
}

.spinner-svg {
  width: 100%;
  height: 100%;
  animation: rotate 2s linear infinite;
}

.spinner-circle {
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

.loader-text {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-body);
  font-weight: 500;
  text-align: center;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: $breakpoint-md) {
  .loader-content {
    padding: var(--spacing-lg);
    min-width: 160px;
  }

  .spinner {
    width: 40px;
    height: 40px;
  }

  .loader-text {
    font-size: var(--font-size-body-small);
  }
}
</style>
