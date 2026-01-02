<!--
 YYC³餐饮管理系统 - 响应式布局组件
 基于节点2的响应式设计框架
 依托: YYC³系统色设计令牌
-->
<template>
  <div
    class="yt-layout"
    :class="layoutClasses"
    :style="layoutStyles"
  >
    <!-- 移动端遮罩层 -->
    <div
      v-if="isMobile && showSidebar && sidebarOpen"
      class="yt-layout__overlay"
      @click="closeSidebar"
    />

    <!-- 顶部导航栏 -->
    <header
      v-if="showHeader"
      class="yt-layout__header"
      :class="{ 'yt-layout__header--fixed': fixedHeader }"
    >
      <slot name="header">
        <div class="default-header">
          <div class="header-content">
            <div class="header-left">
              <button
                v-if="showSidebar && isMobile"
                class="menu-toggle"
                @click="toggleSidebar"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>
              <div class="logo">
                <slot name="logo">YYC³</slot>
              </div>
            </div>

            <div class="header-center">
              <slot name="header-center" />
            </div>

            <div class="header-right">
              <slot name="header-actions" />
            </div>
          </div>
        </div>
      </slot>
    </header>

    <!-- 主要内容区域 -->
    <main class="yt-layout__main">
      <!-- 侧边栏 -->
      <aside
        v-if="showSidebar"
        class="yt-layout__sidebar"
        :class="sidebarClasses"
      >
        <slot name="sidebar">
          <div class="default-sidebar">
            <div class="sidebar-header">
              <slot name="sidebar-header" />
              <button
                v-if="isMobile"
                class="sidebar-close"
                @click="closeSidebar"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="sidebar-content">
              <slot name="sidebar-content" />
            </div>
          </div>
        </slot>
      </aside>

      <!-- 内容区域 -->
      <div class="yt-layout__content" :class="contentClasses">
        <div class="content-wrapper">
          <slot />
        </div>
      </div>
    </main>

    <!-- 底部信息栏 -->
    <footer
      v-if="showFooter"
      class="yt-layout__footer"
      :class="{ 'yt-layout__footer--fixed': fixedFooter }"
    >
      <slot name="footer">
        <div class="default-footer">
          <div class="footer-content">
            <div class="footer-left">
              © 2025 YYC³餐饮管理系统
            </div>
            <div class="footer-right">
              <slot name="footer-actions" />
            </div>
          </div>
        </div>
      </slot>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

interface Props {
  // 布局配置
  showHeader?: boolean
  showFooter?: boolean
  showSidebar?: boolean
  fixedHeader?: boolean
  fixedFooter?: boolean

  // 响应式配置
  collapseSidebar?: boolean
  sidebarBreakpoint?: 'sm' | 'md' | 'lg' | 'xl'

  // 样式配置
  maxWidth?: string
  contentPadding?: string
  layoutGap?: string
}

const props = withDefaults(defineProps<Props>(), {
  showHeader: true,
  showFooter: false,
  showSidebar: true,
  fixedHeader: false,
  fixedFooter: false,
  collapseSidebar: true,
  sidebarBreakpoint: 'md',
  maxWidth: '1400px',
  contentPadding: 'var(--spacing-lg)',
  layoutGap: 'var(--spacing-lg)'
})

// 响应式状态
const windowWidth = ref(0)
const sidebarOpen = ref(true)

// 响应式断点计算
const currentBreakpoint = computed(() => {
  if (windowWidth.value < 640) return 'sm'
  if (windowWidth.value < 768) return 'md'
  if (windowWidth.value < 1024) return 'lg'
  if (windowWidth.value < 1280) return 'xl'
  return '2xl'
})

const isMobile = computed(() => currentBreakpoint.value === 'sm')
const isTablet = computed(() => currentBreakpoint.value === 'md')
const isDesktop = computed(() => ['lg', 'xl', '2xl'].includes(currentBreakpoint.value))

// 计算属性
const layoutClasses = computed(() => [
  `yt-layout--${currentBreakpoint.value}`,
  {
    'yt-layout--mobile': isMobile.value,
    'yt-layout--tablet': isTablet.value,
    'yt-layout--desktop': isDesktop.value,
    'yt-layout--sidebar-open': sidebarOpen.value,
    'yt-layout--fixed-header': props.fixedHeader,
    'yt-layout--fixed-footer': props.fixedFooter
  }
])

const sidebarClasses = computed(() => [
  'yt-layout__sidebar',
  {
    'yt-layout__sidebar--open': sidebarOpen.value,
    'yt-layout__sidebar--collapsed': !sidebarOpen.value && !isMobile.value,
    'yt-layout__sidebar--mobile': isMobile.value
  }
])

const contentClasses = computed(() => [
  'yt-layout__content',
  {
    'yt-layout__content--with-sidebar': props.showSidebar,
    'yt-layout__content--sidebar-open': sidebarOpen.value,
    'yt-layout__content--sidebar-collapsed': !sidebarOpen.value && !isMobile.value
  }
])

const layoutStyles = computed(() => ({
  '--layout-max-width': props.maxWidth,
  '--layout-content-padding': props.contentPadding,
  '--layout-gap': props.layoutGap,
  '--layout-sidebar-width': sidebarOpen.value ? '280px' : '0px'
}))

// 侧边栏控制
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

const openSidebar = () => {
  sidebarOpen.value = true
}

// 响应式处理
const handleResize = () => {
  windowWidth.value = window.innerWidth

  // 自动折叠侧边栏
  if (props.collapseSidebar && props.sidebarBreakpoint) {
    const breakpointValues = {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280
    }

    const threshold = breakpointValues[props.sidebarBreakpoint]

    if (windowWidth.value < threshold) {
      // 移动端自动收起侧边栏
      if (sidebarOpen.value) {
        sidebarOpen.value = false
      }
    } else {
      // 桌面端自动展开侧边栏
      if (!sidebarOpen.value) {
        sidebarOpen.value = true
      }
    }
  }
}

// 生命周期
onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 暴露方法给父组件
defineExpose({
  toggleSidebar,
  closeSidebar,
  openSidebar,
  handleResize,
  isMobile,
  isTablet,
  isDesktop,
  currentBreakpoint
})
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss';

.yt-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: var(--layout-max-width);
  margin: 0 auto;
  background: var(--color-primary-dark);
  color: var(--color-text-primary);
  position: relative;

  // 移动端遮罩层
  &__overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: var(--z-index-modal-backdrop);
    -webkit-backdrop-filter: blur(2px);
    backdrop-filter: blur(2px);
  }

  // 顶部导航栏
  &__header {
    flex-shrink: 0;
    background: var(--color-darker);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    z-index: var(--z-index-sticky);
    transition: $transition-colors;

    &--fixed {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: var(--z-index-fixed);
    }

    .default-header {
      .header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-md) var(--layout-content-padding);
        height: 64px;
        gap: var(--spacing-lg);
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);

        .menu-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: none;
          background: transparent;
          color: var(--color-text-primary);
          border-radius: $border-radius-base;
          cursor: pointer;
          transition: $transition-colors;

          &:hover {
            background: rgba(255, 255, 255, 0.1);
          }

          svg {
            width: 20px;
            height: 20px;
          }
        }

        .logo {
          font-size: $font-size-lg;
          font-weight: $font-weight-semibold;
          color: var(--color-primary);
        }
      }

      .header-center {
        flex: 1;
        text-align: center;
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
      }
    }
  }

  // 主要内容区域
  &__main {
    flex: 1;
    display: flex;
    min-height: 0;
    position: relative;
  }

  // 侧边栏
  &__sidebar {
    width: var(--layout-sidebar-width);
    background: var(--color-darker);
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    transition: width $transition-base, transform $transition-base;
    flex-shrink: 0;
    position: relative;
    z-index: var(--z-index-sidebar);

    &--collapsed {
      width: 60px;
    }

    &--mobile {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      z-index: var(--z-index-modal);
      box-shadow: $shadow-xl;
      transform: translateX(-100%);

      &.yt-layout__sidebar--open {
        transform: translateX(0);
      }
    }

    .default-sidebar {
      height: 100%;
      display: flex;
      flex-direction: column;

      .sidebar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-lg);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        min-height: 64px;

        .sidebar-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          color: var(--color-text-secondary);
          border-radius: $border-radius-base;
          cursor: pointer;
          transition: $transition-colors;

          &:hover {
            background: rgba(255, 255, 255, 0.1);
            color: var(--color-text-primary);
          }

          svg {
            width: 16px;
            height: 16px;
          }
        }
      }

      .sidebar-content {
        flex: 1;
        overflow-y: auto;
        padding: var(--spacing-md) 0;
      }
    }
  }

  // 内容区域
  &__content {
    flex: 1;
    min-width: 0;
    transition: margin-left $transition-base;
    overflow-x: hidden;

    &--with-sidebar {
      &.yt-layout__content--sidebar-open {
        margin-left: var(--layout-sidebar-width);
      }

      &.yt-layout__content--sidebar-collapsed {
        margin-left: 60px;
      }
    }

    .content-wrapper {
      padding: var(--layout-content-padding);
      min-height: 100%;
    }
  }

  // 底部信息栏
  &__footer {
    flex-shrink: 0;
    background: var(--color-darker);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    z-index: var(--z-index-sticky);

    &--fixed {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: var(--z-index-fixed);
    }

    .default-footer {
      .footer-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-md) var(--layout-content-padding);
        font-size: $font-size-body-small;
        color: var(--color-text-secondary);
      }
    }
  }

  // 响应式断点样式
  &--sm {
    padding: 0;
    gap: 0;

    .yt-layout__header .default-header .header-content {
      padding: var(--spacing-md);
    }

    .yt-layout__content .content-wrapper {
      padding: var(--spacing-md);
    }

    .yt-layout__footer .default-footer .footer-content {
      padding: var(--spacing-md);
    }
  }

  &--md {
    padding: 0;
    gap: 0;

    .yt-layout__header .default-header .header-content {
      padding: var(--spacing-md) var(--spacing-xl);
    }

    .yt-layout__content .content-wrapper {
      padding: var(--spacing-xl);
    }

    .yt-layout__footer .default-footer .footer-content {
      padding: var(--spacing-md) var(--spacing-xl);
    }
  }

  &--lg {
    .yt-layout__content .content-wrapper {
      padding: var(--spacing-2xl);
    }

    .yt-layout__header .default-header .header-content,
    .yt-layout__footer .default-footer .footer-content {
      padding-left: var(--spacing-2xl);
      padding-right: var(--spacing-2xl);
    }
  }

  &--xl {
    .yt-layout__content .content-wrapper {
      padding: var(--spacing-3xl);
    }
  }

  // 固定头部和底部时的内容区域调整
  &--fixed-header {
    .yt-layout__content {
      padding-top: 64px;
    }
  }

  &--fixed-footer {
    .yt-layout__content {
      padding-bottom: 60px;
    }
  }

  &--fixed-header.yt-layout--fixed-footer {
    .yt-layout__content {
      padding-top: 64px;
      padding-bottom: 60px;
    }
  }
}

// 滚动条样式
.yt-layout__sidebar .sidebar-content {
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-neutral);
    border-radius: 3px;

    &:hover {
      background: var(--color-text-secondary);
    }
  }
}

// 动画效果
.yt-layout__sidebar {
  animation: slideInLeft 0.3s ease-out;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// 触摸设备优化
@media (hover: none) {
  .yt-layout {
    .menu-toggle:hover,
    .sidebar-close:hover {
      background: transparent;
    }
  }
}
</style>