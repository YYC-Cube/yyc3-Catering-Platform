<!--
  YYC³餐饮行业智能化平台 - 性能优化模态框组件
  支持懒加载、动画优化和内存管理
-->
<template>
  <teleport to="body">
    <transition
      name="modal"
      appear
      @before-enter="onBeforeEnter"
      @after-enter="onAfterEnter"
      @before-leave="onBeforeLeave"
      @after-leave="onAfterLeave"
    >
      <div
        v-show="visible"
        class="optimized-modal"
        :class="modalClasses"
        @click="onOverlayClick"
        @keydown.esc="onEscPress"
      >
        <!-- 遮罩层 -->
        <div
          class="modal-overlay"
          :class="{ 'blur-backdrop': blurBackdrop }"
          @click.stop
        ></div>

        <!-- 模态框容器 -->
        <div
          ref="modalRef"
          class="modal-container"
          :style="containerStyle"
          role="dialog"
          :aria-labelledby="titleId"
          :aria-describedby="contentId"
          aria-modal="true"
          @click.stop
        >
          <!-- 懒加载内容 -->
          <div class="modal-content">
            <!-- 头部 -->
            <div class="modal-header" v-if="showHeader">
              <div class="modal-title">
                <slot name="title">
                  <h3 :id="titleId">{{ title }}</h3>
                </slot>
              </div>
              <div class="modal-actions">
                <slot name="header-actions">
                  <button
                    v-if="closable"
                    class="close-button"
                    :aria-label="closeAriaLabel"
                    @click="onClose"
                  >
                    <el-icon><Close /></el-icon>
                  </button>
                </slot>
              </div>
            </div>

            <!-- 主体内容 - 支持懒加载 -->
            <div class="modal-body" :id="contentId" ref="bodyRef">
              <div v-if="!contentLoaded && lazyLoad" class="content-loading">
                <el-icon class="loading-spinner"><Loading /></el-icon>
                <span>加载中...</span>
              </div>
              <slot v-else></slot>
            </div>

            <!-- 底部 -->
            <div class="modal-footer" v-if="showFooter">
              <slot name="footer">
                <div class="default-footer">
                  <el-button @click="onCancel" v-if="showCancel">
                    {{ cancelText }}
                  </el-button>
                  <el-button
                    type="primary"
                    @click="onConfirm"
                    :loading="confirmLoading"
                    :disabled="confirmDisabled"
                    v-if="showConfirm"
                  >
                    {{ confirmText }}
                  </el-button>
                </div>
              </slot>
            </div>
          </div>

          <!-- 性能监控指示器（开发模式） -->
          <div
            v-if="showPerformanceIndicator && isDevelopment"
            class="performance-indicator"
          >
            <div class="perf-item">
              <span class="perf-label">渲染时间</span>
              <span class="perf-value">{{ renderTime }}ms</span>
            </div>
            <div class="perf-item">
              <span class="perf-label">内存使用</span>
              <span class="perf-value">{{ memoryUsage }}MB</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { debounce, throttle, MemoryLeakGuard } from '@/utils/lazyLoad'
import { performanceMonitor } from '@/utils/performanceConfig'

// 类型定义
interface ModalSize {
  width: string | number
  maxWidth?: string | number
  height?: string | number
  maxHeight?: string | number
}

// Props
const props = withDefaults(defineProps<{
  visible: boolean
  title?: string
  size?: 'small' | 'medium' | 'large' | 'full' | 'auto'
  width?: string | number
  height?: string | number
  maxWidth?: string | number
  maxHeight?: string | number
  centered?: boolean
  closable?: boolean
  maskClosable?: boolean
  keyboard?: boolean
  mask?: boolean
  maskStyle?: Record<string, any>
  zIndex?: number
  destroyOnClose?: boolean
  forceRender?: boolean
  getContainer?: () => HTMLElement
  autoFocus?: boolean
  wrapClassName?: string
  transitionName?: string
  footer?: boolean
  okText?: string
  cancelText?: string
  okButtonProps?: Record<string, any>
  cancelButtonProps?: Record<string, any>
  confirmLoading?: boolean
  confirmDisabled?: boolean
  showCancel?: boolean
  showConfirm?: boolean
  showHeader?: boolean
  showFooter?: boolean
  closeAriaLabel?: string
  lazyLoad?: boolean
  blurBackdrop?: boolean
  showPerformanceIndicator?: boolean
  customSize?: ModalSize
}>(), {
  size: 'medium',
  centered: true,
  closable: true,
  maskClosable: true,
  keyboard: true,
  mask: true,
  zIndex: 1000,
  destroyOnClose: false,
  forceRender: false,
  autoFocus: true,
  footer: true,
  okText: '确定',
  cancelText: '取消',
  confirmLoading: false,
  confirmDisabled: false,
  showCancel: true,
  showConfirm: true,
  showHeader: true,
  showFooter: true,
  closeAriaLabel: '关闭对话框',
  lazyLoad: false,
  blurBackdrop: false,
  showPerformanceIndicator: false
})

// Emits
const emit = defineEmits<{
  'update:visible': [visible: boolean]
  'ok': [event: MouseEvent]
  'cancel': [event: MouseEvent]
  'after-close': []
  'after-open': []
  'before-open': []
  'before-close': []
}>()

// 响应式数据
const modalRef = ref<HTMLElement>()
const bodyRef = ref<HTMLElement>()
const contentLoaded = ref(!props.lazyLoad)
const renderTime = ref(0)
const memoryUsage = ref(0)
const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`
const contentId = `modal-content-${Math.random().toString(36).substr(2, 9)}`

// 内存泄漏防护
const memoryGuard = new MemoryLeakGuard()

// 预定义尺寸
const sizeMap: Record<string, ModalSize> = {
  small: { width: 400, maxWidth: '90vw' },
  medium: { width: 520, maxWidth: '90vw' },
  large: { width: 800, maxWidth: '90vw' },
  full: { width: '100vw', height: '100vh', maxWidth: '100vw' },
  auto: { width: 'auto', maxWidth: '90vw' }
}

// 计算属性
const modalClasses = computed(() => ({
  'modal-visible': props.visible,
  'modal-centered': props.centered,
  'modal-masked': props.mask,
  [`modal-${props.size}`]: true,
  [props.wrapClassName]: !!props.wrapClassName
}))

const currentSize = computed(() => {
  return props.customSize || sizeMap[props.size] || sizeMap.medium
})

const containerStyle = computed(() => {
  const size = currentSize.value
  const style: Record<string, any> = {
    zIndex: props.zIndex
  }

  if (size.width) {
    style.width = typeof size.width === 'number' ? `${size.width}px` : size.width
  }

  if (size.height) {
    style.height = typeof size.height === 'number' ? `${size.height}px` : size.height
  }

  if (size.maxWidth) {
    style.maxWidth = typeof size.maxWidth === 'number' ? `${size.maxWidth}px` : size.maxWidth
  }

  if (size.maxHeight) {
    style.maxHeight = typeof size.maxHeight === 'number' ? `${size.maxHeight}px` : size.maxHeight
  }

  if (props.maskStyle) {
    Object.assign(style, props.maskStyle)
  }

  return style
})

const isDevelopment = computed(() => {
  return process.env.NODE_ENV === 'development'
})

// 方法
const measurePerformance = (callback: () => void) => {
  const startTime = performance.now()

  performanceMonitor.startMeasure('modal-render')

  callback()

  nextTick(() => {
    performanceMonitor.endMeasure('modal-render')
    renderTime.value = performance.now() - startTime

    // 模拟内存使用（实际应用中可以使用更精确的内存监控）
    if ('memory' in performance) {
      const memInfo = (performance as any).memory
      memoryUsage.value = Math.round(memInfo.usedJSHeapSize / 1024 / 1024 * 100) / 100
    }
  })
}

const loadContent = async () => {
  if (!props.lazyLoad || contentLoaded.value) return

  // 模拟内容加载延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  contentLoaded.value = true
}

const onClose = () => {
  emit('update:visible', false)
}

const onCancel = (event: MouseEvent) => {
  emit('cancel', event)
  onClose()
}

const onConfirm = (event: MouseEvent) => {
  emit('ok', event)
}

const onOverlayClick = () => {
  if (props.maskClosable) {
    onClose()
  }
}

const onEscPress = () => {
  if (props.keyboard) {
    onClose()
  }
}

// 动画事件处理
const onBeforeEnter = () => {
  emit('before-open')
  measurePerformance(() => {
    loadContent()
  })
}

const onAfterEnter = () => {
  emit('after-open')

  // 自动聚焦
  if (props.autoFocus && modalRef.value) {
    const focusableElement = modalRef.value.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement

    if (focusableElement) {
      focusableElement.focus()
    }
  }
}

const onBeforeLeave = () => {
  emit('before-close')
}

const onAfterLeave = () => {
  emit('after-close')

  // 销毁内容
  if (props.destroyOnClose && props.lazyLoad) {
    contentLoaded.value = false
  }
}

// 优化的滚动锁定
const enableScrollLock = () => {
  const body = document.body
  const html = document.documentElement

  if (body.style.overflow !== 'hidden') {
    const scrollBarWidth = window.innerWidth - html.clientWidth
    body.style.overflow = 'hidden'
    body.style.paddingRight = `${scrollBarWidth}px`
    body.setAttribute('data-scroll-locked', 'true')
  }
}

const disableScrollLock = () => {
  const body = document.body

  if (body.getAttribute('data-scroll-locked') === 'true') {
    body.style.overflow = ''
    body.style.paddingRight = ''
    body.removeAttribute('data-scroll-locked')
  }
}

// 防抖的窗口大小调整处理
const handleResize = debounce(() => {
  if (modalRef.value && props.visible) {
    // 模态框可见时的尺寸调整逻辑
  }
}, 100)

// 节流的滚动处理
const handleScroll = throttle(() => {
  // 滚动处理逻辑
}, 16)

// 监听器
watch(() => props.visible, (newVal) => {
  if (newVal) {
    enableScrollLock()
    nextTick(() => {
      // 添加全局事件监听
      memoryGuard.addEventListener(window, 'resize', handleResize)
      memoryGuard.addEventListener(window, 'scroll', handleScroll)
      memoryGuard.addEventListener(document, 'keydown', onEscPress)
    })
  } else {
    disableScrollLock()
  }
})

// 生命周期
onMounted(() => {
  // 初始化逻辑
})

onUnmounted(() => {
  disableScrollLock()
  memoryGuard.cleanup()
})

// 暴露方法
defineExpose({
  focus: () => {
    if (modalRef.value) {
      modalRef.value.focus()
    }
  },
  update: () => {
    // 手动更新模态框
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as *;

.optimized-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: var(--spacing-4);
  overflow: auto;

  &.modal-centered {
    align-items: center;
  }

  &.modal-masked {
    pointer-events: auto;
  }

  &:not(.modal-visible) {
    pointer-events: none;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.45);
    -webkit-backdrop-filter: blur(0px);
    backdrop-filter: blur(0px);
    transition: all 0.3s ease;

    &.blur-backdrop {
      -webkit-backdrop-filter: blur(4px);
      backdrop-filter: blur(4px);
    }
  }

  .modal-container {
    position: relative;
    background: var(--color-surface);
    border-radius: $border-radius-lg;
    box-shadow: $shadow-xl;
    max-width: 90vw;
    max-height: 90vh;
    overflow: hidden;
    pointer-events: auto;
    transform: scale(0.8) translateY(-20px);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:focus {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
  }

  .modal-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-4) var(--spacing-5);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface-elevated);

    .modal-title {
      flex: 1;

      h3 {
        margin: 0;
        font-size: $font-size-heading-3;
        font-weight: 600;
        color: var(--color-text-primary);
      }
    }

    .modal-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);

      .close-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        background: transparent;
        border-radius: $border-radius-sm;
        color: var(--color-text-secondary);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: var(--color-fill-color-light);
          color: var(--color-text-primary);
        }

        &:focus {
          background: var(--color-primary-light);
          color: var(--color-primary);
        }
      }
    }
  }

  .modal-body {
    flex: 1;
    padding: var(--spacing-5);
    overflow-y: auto;

    .content-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-2);
      padding: var(--spacing-8);
      color: var(--color-text-secondary);

      .loading-spinner {
        font-size: 24px;
        animation: spin 1s linear infinite;
      }
    }
  }

  .modal-footer {
    padding: var(--spacing-4) var(--spacing-5);
    border-top: 1px solid var(--color-border);
    background: var(--color-surface-elevated);

    .default-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-3);
    }
  }

  .performance-indicator {
    position: absolute;
    top: var(--spacing-2);
    right: var(--spacing-2);
    display: flex;
    gap: var(--spacing-2);
    padding: var(--spacing-1) var(--spacing-2);
    background: rgba(0, 0, 0, 0.8);
    border-radius: $border-radius-sm;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 10px;
    color: white;
    z-index: 10;

    .perf-item {
      display: flex;
      gap: var(--spacing-1);

      .perf-label {
        opacity: 0.8;
      }

      .perf-value {
        font-weight: 600;
        color: #4ade80;
      }
    }
  }
}

// 尺寸变体
.modal-small .modal-container {
  width: 400px;
}

.modal-medium .modal-container {
  width: 520px;
}

.modal-large .modal-container {
  width: 800px;
}

.modal-full .modal-container {
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  border-radius: 0;
}

// 动画
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  .modal-overlay {
    transition: opacity 0.3s ease;
  }

  .modal-container {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.modal-enter-from,
.modal-leave-to {
  .modal-overlay {
    opacity: 0;
  }

  .modal-container {
    transform: scale(0.8) translateY(-20px);
    opacity: 0;
  }
}

.modal-enter-to,
.modal-leave-from {
  .modal-overlay {
    opacity: 1;
  }

  .modal-container {
    transform: scale(1) translateY(0);
    opacity: 1;
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

// 响应式设计
@media (max-width: 768px) {
  .optimized-modal {
    padding: var(--spacing-2);

    .modal-container {
      width: 100vw !important;
      max-width: 100vw !important;
      height: 100vh !important;
      max-height: 100vh !important;
      border-radius: 0;
    }

    .modal-header,
    .modal-body,
    .modal-footer {
      padding-left: var(--spacing-3);
      padding-right: var(--spacing-3);
    }
  }
}

// 高对比度模式
@media (prefers-contrast: high) {
  .optimized-modal {
    .modal-container {
      border: 2px solid var(--color-text-primary);
    }

    .modal-header,
    .modal-footer {
      border-width: 2px;
    }
  }
}

// 减少动画偏好
@media (prefers-reduced-motion: reduce) {
  .optimized-modal {
    .modal-container,
    .modal-overlay {
      transition: none;
    }
  }

  .content-loading .loading-spinner {
    animation: none;
  }
}
</style>