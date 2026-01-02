<template>
  <div class="responsive-layout" :class="layoutClasses">
    <!-- 移动端遮罩层 -->
    <div
      v-if="isMobile && sidebarOpen"
      class="mobile-overlay"
      @click="closeSidebar"
    ></div>

    <!-- 侧边栏 -->
    <aside
      class="layout-sidebar"
      :class="sidebarClasses"
      @mouseenter="handleSidebarHover(true)"
      @mouseleave="handleSidebarHover(false)"
    >
      <slot name="sidebar">
        <div class="sidebar-placeholder">
          <el-icon :size="32" color="#909399">
            <Menu />
          </el-icon>
          <p>侧边栏内容</p>
        </div>
      </slot>
    </aside>

    <!-- 主内容区域 -->
    <main class="layout-main" :class="mainClasses">
      <!-- 头部 -->
      <header class="layout-header" :class="headerClasses">
        <slot name="header">
          <div class="header-placeholder">
            <el-button
              v-if="isMobile"
              text
              @click="toggleSidebar"
              class="mobile-menu-toggle"
            >
              <el-icon :size="20">
                <Fold v-if="sidebarOpen" />
                <Expand v-else />
              </el-icon>
            </el-button>
            <h2>页面头部</h2>
          </div>
        </slot>
      </header>

      <!-- 内容区域 -->
      <div class="layout-content" ref="contentRef">
        <ErrorBoundary>
          <slot></slot>
        </ErrorBoundary>
      </div>

      <!-- 底部 -->
      <footer v-if="$slots.footer" class="layout-footer">
        <slot name="footer"></slot>
      </footer>
    </main>

    <!-- 移动端底部导航 -->
    <nav v-if="isMobile && showMobileNavigation" class="mobile-navigation">
      <slot name="mobile-navigation">
        <div class="mobile-nav-placeholder">
          <span>移动端导航</span>
        </div>
      </slot>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, Fold, Expand } from '@element-plus/icons-vue'
import ErrorBoundary from './ErrorBoundary.vue'

interface Props {
  sidebarCollapsed?: boolean
  sidebarWidth?: string
  sidebarCollapsedWidth?: string
  headerHeight?: string
  footerHeight?: string
  showMobileNavigation?: boolean
  fixedHeader?: boolean
  fixedSidebar?: boolean
  enableSidebarHover?: boolean
  contentPadding?: string
}

const props = withDefaults(defineProps<Props>(), {
  sidebarCollapsed: false,
  sidebarWidth: '260px',
  sidebarCollapsedWidth: '64px',
  headerHeight: '60px',
  footerHeight: 'auto',
  showMobileNavigation: true,
  fixedHeader: true,
  fixedSidebar: true,
  enableSidebarHover: true,
  contentPadding: '20px'
})

const emit = defineEmits<{
  'update:sidebar-collapsed': [collapsed: boolean]
  'sidebar-toggle': []
}>()

// 响应式数据
const route = useRoute()
const contentRef = ref<HTMLElement>()
const isMobile = ref(false)
const isTablet = ref(false)
const sidebarOpen = ref(false)
const isHovering = ref(false)

// 计算属性
const layoutClasses = computed(() => [
  `layout-${isMobile.value ? 'mobile' : isTablet.value ? 'tablet' : 'desktop'}`,
  {
    'layout-sidebar-collapsed': props.sidebarCollapsed,
    'layout-sidebar-hover': isHovering.value,
    'layout-fixed-header': props.fixedHeader,
    'layout-fixed-sidebar': props.fixedSidebar
  }
])

const sidebarClasses = computed(() => [
  'sidebar-container',
  {
    'sidebar-collapsed': props.sidebarCollapsed,
    'sidebar-open': sidebarOpen.value,
    'sidebar-hovering': isHovering.value,
    'sidebar-mobile': isMobile.value,
    'sidebar-fixed': props.fixedSidebar && !isMobile.value
  }
])

const mainClasses = computed(() => [
  'main-container',
  {
    'main-collapsed': props.sidebarCollapsed,
    'main-mobile': isMobile.value,
    'main-sidebar-open': sidebarOpen.value
  }
])

const headerClasses = computed(() => [
  'header-container',
  {
    'header-fixed': props.fixedHeader && !isMobile.value,
    'header-mobile': isMobile.value,
    'header-collapsed': props.sidebarCollapsed && !isMobile.value
  }
])

// 计算样式
const sidebarStyle = computed(() => {
  const width = isMobile.value
    ? '100%'
    : props.sidebarCollapsed && !isHovering.value
      ? props.sidebarCollapsedWidth
      : props.sidebarWidth

  return {
    width,
    transform: isMobile.value && !sidebarOpen.value ? 'translateX(-100%)' : 'translateX(0)',
    transition: isHovering.value ? 'width 0.3s ease' : 'none'
  }
})

const mainStyle = computed(() => {
  if (isMobile.value) {
    return {}
  }

  const marginLeft = props.sidebarCollapsed && !isHovering.value
    ? props.sidebarCollapsedWidth
    : props.sidebarWidth

  return {
    marginLeft: props.fixedSidebar ? marginLeft : '0'
  }
})

const headerStyle = computed(() => {
  if (isMobile.value) {
    return { height: props.headerHeight }
  }

  const paddingLeft = props.sidebarCollapsed && !isHovering.value
    ? props.sidebarCollapsedWidth
    : props.sidebarWidth

  return {
    height: props.headerHeight,
    paddingLeft: props.fixedSidebar && props.fixedHeader ? paddingLeft : '0'
  }
})

const contentStyle = computed(() => {
  return {
    paddingTop: props.fixedHeader ? props.headerHeight : '0',
    paddingBottom: props.footerHeight !== 'auto' ? props.footerHeight : '0',
    padding: props.contentPadding
  }
})

// 方法
const checkScreenSize = () => {
  const width = window.innerWidth
  isMobile.value = width < 768
  isTablet.value = width >= 768 && width < 1024

  // 在移动端自动收起侧边栏
  if (isMobile.value && sidebarOpen.value) {
    sidebarOpen.value = false
  }
}

const toggleSidebar = () => {
  if (isMobile.value) {
    sidebarOpen.value = !sidebarOpen.value
  } else {
    emit('update:sidebar-collapsed', !props.sidebarCollapsed)
    emit('sidebar-toggle')
  }
}

const closeSidebar = () => {
  if (isMobile.value) {
    sidebarOpen.value = false
  }
}

const handleSidebarHover = (hovering: boolean) => {
  if (!isMobile.value && props.enableSidebarHover && props.sidebarCollapsed) {
    isHovering.value = hovering
  }
}

// 自动调整内容高度
const adjustContentHeight = () => {
  if (contentRef.value) {
    const header = document.querySelector('.layout-header')
    const footer = document.querySelector('.layout-footer')

    let headerHeight = 0
    let footerHeight = 0

    if (header) {
      headerHeight = header.getBoundingClientRect().height
    }

    if (footer) {
      footerHeight = footer.getBoundingClientRect().height
    }

    const availableHeight = window.innerHeight - headerHeight - footerHeight
    contentRef.value.style.minHeight = `${availableHeight}px`
  }
}

// 监听路由变化
watch(
  () => route.path,
  () => {
    // 路由变化时关闭移动端侧边栏
    if (isMobile.value) {
      sidebarOpen.value = false
    }

    // 滚动到顶部
    nextTick(() => {
      window.scrollTo(0, 0)
    })
  }
)

// 监听侧边栏状态
watch(
  () => props.sidebarCollapsed,
  () => {
    nextTick(() => {
      adjustContentHeight()
    })
  }
)

// 监听移动端状态
watch(
  isMobile,
  () => {
    nextTick(() => {
      adjustContentHeight()
    })
  }
)

// 生命周期
onMounted(() => {
  checkScreenSize()
  adjustContentHeight()

  window.addEventListener('resize', checkScreenSize)
  window.addEventListener('resize', adjustContentHeight)

  // 添加触摸事件支持
  if ('ontouchstart' in window) {
    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
  window.removeEventListener('resize', adjustContentHeight)

  if ('ontouchstart' in window) {
    document.removeEventListener('touchstart', handleTouchStart)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
  }
})

// 触摸事件处理
let touchStartX = 0
let touchStartY = 0

const handleTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isMobile.value) return

  const touchX = e.touches[0].clientX
  const touchY = e.touches[0].clientY
  const diffX = touchX - touchStartX
  const diffY = touchY - touchStartY

  // 检测水平滑动
  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
    if (diffX > 0 && touchStartX < 50) {
      // 从左边缘向右滑动，打开侧边栏
      sidebarOpen.value = true
    } else if (diffX < 0 && sidebarOpen.value) {
      // 向左滑动，关闭侧边栏
      sidebarOpen.value = false
    }
  }
}

const handleTouchEnd = () => {
  touchStartX = 0
  touchStartY = 0
}

// 暴露方法给父组件
defineExpose({
  toggleSidebar,
  closeSidebar,
  checkScreenSize,
  isMobile,
  isTablet
})
</script>

<style scoped lang="scss">
@use '@/styles/theme.scss';

.responsive-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

// 侧边栏
.layout-sidebar {
  position: relative;
  z-index: $z-index-sticky;
  background: $white;
  border-right: 1px solid $border-primary;
  transition: width 0.3s ease;
  overflow: hidden;

  &.sidebar-fixed {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: $z-index-fixed;
  }

  &.sidebar-mobile {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: $z-index-modal;
    box-shadow: $shadow-xl;
  }

  &.sidebar-collapsed {
    width: $sidebar-collapsed-width;

    &:hover.sidebar-hovering {
      width: $sidebar-width;
      z-index: $z-index-popover;
      box-shadow: $shadow-lg;
    }
  }

  .sidebar-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: $spacing-6;
    color: $text-secondary;
  }
}

// 主内容区域
.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  transition: margin-left 0.3s ease;

  &.main-mobile {
    margin-left: 0 !important;
  }
}

// 头部
.layout-header {
  position: relative;
  z-index: $z-index-sticky;
  background: $white;
  border-bottom: 1px solid $border-primary;
  display: flex;
  align-items: center;
  padding: 0 $spacing-6;
  transition: all 0.3s ease;

  &.header-fixed {
    position: sticky;
    top: 0;
  }

  &.header-mobile {
    padding: 0 $spacing-4;
    border-bottom: 1px solid $border-primary;
  }

  .header-placeholder {
    display: flex;
    align-items: center;
    gap: $spacing-4;

    .mobile-menu-toggle {
      margin-right: $spacing-2;
    }

    h2 {
      margin: 0;
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }
  }
}

// 内容区域
.layout-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: $bg-secondary;
  transition: all 0.3s ease;
}

// 底部
.layout-footer {
  background: $white;
  border-top: 1px solid $border-primary;
  padding: $spacing-4 $spacing-6;
  z-index: $z-index-sticky;
}

// 移动端遮罩层
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: $z-index-modal-backdrop;
  backdrop-filter: blur(2px);
}

// 移动端导航
.mobile-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: $white;
  border-top: 1px solid $border-primary;
  z-index: $z-index-fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);

  .mobile-nav-placeholder {
    color: $text-secondary;
    font-size: $font-size-sm;
  }
}

// 响应式设计
@media (max-width: $breakpoint-md) {
  .responsive-layout {
    .layout-main {
      .layout-content {
        padding: $spacing-4;
      }
    }

    .mobile-overlay {
      animation: fadeIn 0.3s ease;
    }
  }
}

@media (min-width: $breakpoint-md) and (max-width: $breakpoint-lg) {
  .responsive-layout {
    .layout-sidebar {
      width: 200px;

      &.sidebar-collapsed {
        width: 60px;
      }
    }
  }
}

// 动画
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

// 深色主题支持
@media (prefers-color-scheme: dark) {
  .layout-sidebar {
    background: $dark-bg-secondary;
    border-right-color: $dark-border-primary;
  }

  .layout-header {
    background: $dark-bg-secondary;
    border-bottom-color: $dark-border-primary;
  }

  .layout-content {
    background: $dark-bg-primary;
  }

  .layout-footer {
    background: $dark-bg-secondary;
    border-top-color: $dark-border-primary;
  }

  .mobile-navigation {
    background: $dark-bg-secondary;
    border-top-color: $dark-border-primary;
  }
}

// 打印样式
@media print {
  .responsive-layout {
    .layout-sidebar,
    .mobile-navigation {
      display: none !important;
    }

    .layout-main {
      margin: 0 !important;

      .layout-header {
        position: static;
        border-bottom: 1px solid #000;
      }
    }
  }
}

// 可访问性增强
@media (prefers-reduced-motion: reduce) {
  .responsive-layout * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

// 高对比度模式
@media (prefers-contrast: high) {
  .responsive-layout {
    .layout-sidebar,
    .layout-header,
    .layout-footer,
    .mobile-navigation {
      border-width: 2px;
      border-color: #000;
    }
  }
}
</style>