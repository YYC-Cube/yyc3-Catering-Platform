<!--
 * @fileoverview YYC³餐饮行业智能化平台 - 管理后台主应用组件
 * @description 管理后台的根组件，包含侧边栏、顶部导航和页面内容区域
 * @module App
 * @author YYC³
 * @version 1.0.0
 * @created 2024-01-01
 * @updated 2024-01-01
 -->
<template>
  <div id="app" class="admin-dashboard">
    <!-- 全局加载 -->
    <div v-if="appLoading" class="app-loading">
      <div class="loading-spinner"></div>
      <div class="loading-text">系统初始化中...</div>
    </div>

    <!-- 主应用 -->
    <div v-else class="app-container">
      <!-- 移动端遮罩层 -->
      <div
        v-if="isMobile && !sidebarCollapsed"
        class="mobile-overlay"
        @click="closeMobileSidebar"
      />

      <!-- 侧边栏 -->
      <AppSidebar
        :collapsed="sidebarCollapsed"
        :class="{ 'mobile-open': isMobile && !sidebarCollapsed }"
        @toggle="toggleSidebar"
      />

      <!-- 主内容区域 -->
      <div class="main-content">
        <!-- 顶部导航 -->
        <AppHeader
          :user="currentUser"
          :notifications="notifications"
          @toggle-sidebar="toggleSidebar"
          @logout="handleLogout"
        />

        <!-- 页面内容 -->
        <div class="page-content">
          <router-view v-slot="{ Component, route }">
            <transition name="page-transition" mode="out-in">
              <keep-alive :include="cachedViews">
                <component :is="Component" :key="route.path" />
              </keep-alive>
            </transition>
          </router-view>
        </div>
      </div>
    </div>

    <!-- 全局通知 -->
    <NotificationContainer />

    <!-- 全局确认对话框 -->
    <ConfirmDialog />

    <!-- 系统消息提示 -->
    <SystemAlert
      v-if="systemAlert"
      :alert="systemAlert"
      @close="clearSystemAlert"
    />

    <!-- 键盘快捷键提示 -->
    <KeyboardShortcutsHelp
      v-if="showKeyboardHelp"
      @close="showKeyboardHelp = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { useNotificationStore } from '@/stores/notification'
import { usePageTheme } from '@/composables/usePageTheme'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import NotificationContainer from '@/components/Notification/NotificationContainer.vue'
import ConfirmDialog from '@/components/Common/ConfirmDialog.vue'
import SystemAlert from '@/components/Common/SystemAlert.vue'
import KeyboardShortcutsHelp from '@/components/Common/KeyboardShortcutsHelp.vue'
import { keyboardShortcuts } from '@/utils/keyboardShortcuts'
import { authApi } from '@/api/auth'

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()
const notificationStore = useNotificationStore()

// 页面主题色系统
const {
  pageThemeColor,
  pageThemeName,
  currentThemeColor,
  currentThemeName,
  getThemeShadow
} = usePageTheme()

// 响应式状态
const appLoading = ref(true)
const sidebarCollapsed = ref(false)
const showKeyboardHelp = ref(false)
const cachedViews = ref(['Dashboard', 'Orders', 'Customers'])
const isMobile = ref(false)

// 计算属性
const currentUser = computed(() => authStore.user)
const notifications = computed(() => notificationStore.unreadNotifications)
const systemAlert = computed(() => appStore.systemAlert)

// 主题相关的计算属性
const currentTheme = computed(() => ({
  color: currentThemeColor.value,
  name: currentThemeName.value,
  shadow: getThemeShadow(currentThemeColor.value).shadow
}))

// 监听路由变化以更新缓存视图
watch(
  () => router.currentRoute.value,
  (route) => {
    // 如果需要缓存某个视图，可以动态添加到cachedViews中
    if (route.meta?.keepAlive && !cachedViews.value.includes(route.name as string)) {
      cachedViews.value.push(route.name as string)
    }
  },
  { immediate: true }
)

// 方法
const toggleSidebar = () => {
  if (isMobile.value) {
    // 移动端：切换侧边栏显示/隐藏
    sidebarCollapsed.value = !sidebarCollapsed.value
  } else {
    // 桌面端：切换侧边栏折叠状态
    sidebarCollapsed.value = !sidebarCollapsed.value
    appStore.setSidebarCollapsed(sidebarCollapsed.value)
  }
}

const closeMobileSidebar = () => {
  if (isMobile.value) {
    sidebarCollapsed.value = true
  }
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    ElMessage.success('退出成功')
    router.push('/login')
  } catch (error) {
    ElMessage.error('退出失败')
  }
}

const clearSystemAlert = () => {
  appStore.clearSystemAlert()
}

// 初始化应用
const initializeApp = async () => {
  try {
    // 临时简化初始化过程，避免API调用失败
    console.log('🚀 YYC³ Admin Dashboard Starting...')

    // 检查登录状态
    if (authStore.isAuthenticated) {
      console.log('User is authenticated')
    } else {
      console.log('User not authenticated')
    }

    // 初始化键盘快捷键
    initKeyboardShortcuts()

    appLoading.value = false
    console.log('✅ App initialization completed')
  } catch (error) {
    console.error('Initialize app error:', error)
    appLoading.value = false
  }
}

// 初始化键盘快捷键
const initKeyboardShortcuts = () => {
  keyboardShortcuts.register([
    {
      key: 'ctrl+shift+h',
      description: '显示键盘快捷键帮助',
      action: () => {
        showKeyboardHelp.value = true
      }
    },
    {
      key: 'ctrl+shift+s',
      description: '切换侧边栏',
      action: () => {
        toggleSidebar()
      }
    },
    {
      key: 'ctrl+shift+n',
      description: '显示通知中心',
      action: () => {
        // 这里可以添加显示通知中心的逻辑
      }
    }
  ])
}

// WebSocket 连接处理
let wsConnection: WebSocket | null = null

const connectWebSocket = () => {
  if (!authStore.isAuthenticated) return

  try {
    const wsUrl = `${import.meta.env.VITE_WS_URL}/admin`
    wsConnection = new WebSocket(wsUrl)

    wsConnection.onopen = () => {
      console.log('Admin dashboard WebSocket connected')
    }

    wsConnection.onmessage = (event) => {
      const data = JSON.parse(event.data)
      handleWebSocketMessage(data)
    }

    wsConnection.onclose = () => {
      console.log('Admin dashboard WebSocket disconnected')
      // 5秒后重连
      setTimeout(connectWebSocket, 5000)
    }

    wsConnection.onerror = (error) => {
      console.error('Admin dashboard WebSocket error:', error)
    }
  } catch (error) {
    console.error('Failed to connect WebSocket:', error)
  }
}

const handleWebSocketMessage = (data: any) => {
  switch (data.type) {
    case 'notification':
      notificationStore.addNotification(data.payload)
      break
    case 'system_alert':
      appStore.setSystemAlert(data.payload)
      break
    case 'data_update':
      // 处理数据更新
      break
    default:
      console.log('Unknown WebSocket message type:', data.type)
  }
}

const disconnectWebSocket = () => {
  if (wsConnection) {
    wsConnection.close()
    wsConnection = null
  }
}

// 网络状态监听
const handleOnline = () => {
  ElNotification.success({
    title: '网络连接',
    message: '网络已恢复',
    type: 'success'
  })
}

const handleOffline = () => {
  ElNotification.warning({
    title: '网络连接',
    message: '网络已断开，部分功能可能不可用',
    type: 'warning'
  })
}

// 页面可见性变化处理
const handleVisibilityChange = () => {
  if (document.hidden) {
    // 页面隐藏时暂停一些操作
    disconnectWebSocket()
  } else {
    // 页面显示时重新连接
    connectWebSocket()
  }
}

// 响应式检测
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768 // $breakpoint-md equivalent in JS
  if (isMobile.value) {
    // 移动端默认折叠侧边栏
    sidebarCollapsed.value = true
  }
}

const handleResize = () => {
  checkMobile()
}

// 生命周期
onMounted(async () => {
  await initializeApp()

  // 检测移动端
  checkMobile()

  // 添加事件监听
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  window.addEventListener('resize', handleResize)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  // 恢复侧边栏状态（仅在桌面端）
  if (!isMobile.value) {
    sidebarCollapsed.value = appStore.sidebarCollapsed
  }
})

onUnmounted(() => {
  // 清理事件监听
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('visibilitychange', handleVisibilityChange)

  // 断开WebSocket
  disconnectWebSocket()
})
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';

.admin-dashboard {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: var(--color-background);
  font-family: var(--font-family-primary);
  color: var(--color-text-primary);
}

.app-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-success) 100%);
  z-index: var(--z-maximum, 9999);

  .loading-spinner {
    width: 60px;
    height: 60px;
    border: 6px solid rgba(255, 255, 255, 0.3);
    border-top: 6px solid var(--color-surface);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: var(--spacing-md);
  }

  .loading-text {
    color: var(--color-surface);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
  }
}

.app-container {
  display: flex;
  width: 100%;
  height: 100vh;
  position: relative;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: var(--color-overlay);
  z-index: var(--z-modal, 999);
  backdrop-filter: blur(2px);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-left: var(--sidebar-width, 200px);
  transition: margin-left 0.3s ease;

  .sidebar-collapsed & {
    margin-left: var(--sidebar-collapsed-width, 64px);
  }
}

.page-content {
  flex: 1;
  padding: var(--spacing-xl);
  overflow-y: auto;
  background-color: var(--color-background);
  position: relative;
  border-top: 3px solid var(--page-theme-color, var(--color-primary));
  transition: $transition-all;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg,
      var(--page-theme-color, var(--color-primary)) 0%,
      var(--page-theme-color, var(--color-primary)) 100%
    );
    box-shadow: 0 2px 8px var(--page-theme-shadow, rgba(79, 70, 229, 0.3));
  }
}

// 页面转场动画
.page-transition-enter-active,
.page-transition-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-transition-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 响应式设计
@media (max-width: $breakpoint-md) {
  .page-content {
    padding: var(--spacing-md) var(--spacing-sm);
  }

  .main-content {
    margin-left: 0 !important;
  }

  .mobile-overlay {
    display: block;
  }
}

// 暗色模式支持
@media (prefers-color-scheme: dark) {
  .admin-dashboard {
    color-scheme: dark;
  }
}

// 打印样式
@media print {
  .admin-dashboard {
    .app-loading,
    .system-alert,
    .keyboard-shortcuts-help {
      display: none !important;
    }
  }
}
</style>