<template>
  <div id="app" class="staff-app">
    <!-- 顶部导航栏 -->
    <header class="app-header">
      <nav class="navbar">
        <div class="navbar-brand">
          <router-link to="/" class="logo">
            <img src="/logo.svg" alt="YYC³餐饮" class="logo-image">
            <span class="brand-text">员工端</span>
          </router-link>
        </div>

        <div class="navbar-center">
          <!-- 工作状态指示器 -->
          <div class="work-status">
            <div class="status-indicator" :class="workStatus"></div>
            <span class="status-text">{{ workStatusText }}</span>
          </div>

          <!-- 快速操作按钮 -->
          <div class="quick-actions">
            <button @click="showQuickOrder" class="action-btn primary">
              <i class="icon-plus"></i>
              <span>快速下单</span>
            </button>
            <button @click="showTableStatus" class="action-btn secondary">
              <i class="icon-table"></i>
              <span>桌台状态</span>
            </button>
          </div>
        </div>

        <div class="navbar-actions">
          <!-- 通知中心 -->
          <div class="notification-center" @click="toggleNotifications">
            <i class="icon-notification"></i>
            <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
          </div>

          <!-- 用户信息 -->
          <div class="user-profile" @click="toggleUserMenu">
            <img :src="staffInfo.avatar" :alt="staffInfo.name" class="user-avatar">
            <div class="user-details">
              <span class="user-name">{{ staffInfo.name }}</span>
              <span class="user-role">{{ staffInfo.role }}</span>
            </div>
          </div>

          <!-- 用户下拉菜单 -->
          <div v-if="showUserMenu" class="user-menu">
            <router-link to="/profile" class="menu-item">
              <i class="icon-user"></i>
              个人信息
            </router-link>
            <router-link to="/schedule" class="menu-item">
              <i class="icon-calendar"></i>
              班表管理
            </router-link>
            <router-link to="/performance" class="menu-item">
              <i class="icon-chart"></i>
              业绩统计
            </router-link>
            <div class="menu-divider"></div>
            <button @click="toggleWorkStatus" class="menu-item">
              <i class="icon-toggle"></i>
              {{ workStatus === 'working' ? '下班打卡' : '上班打卡' }}
            </button>
            <button @click="logout" class="menu-item logout">
              <i class="icon-logout"></i>
              退出登录
            </button>
          </div>
        </div>
      </nav>
    </header>

    <!-- 主要内容区域 -->
    <main class="app-main">
      <div class="app-layout">
        <!-- 侧边栏导航 -->
        <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
          <div class="sidebar-toggle" @click="toggleSidebar">
            <i class="icon-menu"></i>
          </div>

          <nav class="sidebar-nav">
            <router-link to="/dashboard" class="nav-item">
              <i class="icon-dashboard"></i>
              <span class="nav-text">工作台</span>
            </router-link>

            <router-link to="/orders" class="nav-item">
              <i class="icon-orders"></i>
              <span class="nav-text">订单管理</span>
              <span v-if="pendingOrdersCount > 0" class="nav-badge">{{ pendingOrdersCount }}</span>
            </router-link>

            <router-link to="/tables" class="nav-item">
              <i class="icon-tables"></i>
              <span class="nav-text">桌台管理</span>
            </router-link>

            <router-link to="/kitchen" class="nav-item">
              <i class="icon-kitchen"></i>
              <span class="nav-text">厨房显示</span>
              <span v-if="kitchenOrdersCount > 0" class="nav-badge cooking">{{ kitchenOrdersCount }}</span>
            </router-link>

            <router-link to="/reservations" class="nav-item">
              <i class="icon-reservations"></i>
              <span class="nav-text">预约管理</span>
            </router-link>

            <router-link to="/customers" class="nav-item">
              <i class="icon-customers"></i>
              <span class="nav-text">客户服务</span>
            </router-link>

            <router-link to="/inventory" class="nav-item">
              <i class="icon-inventory"></i>
              <span class="nav-text">库存管理</span>
            </router-link>

            <div class="nav-divider"></div>

            <router-link to="/reports" class="nav-item">
              <i class="icon-reports"></i>
              <span class="nav-text">报表分析</span>
            </router-link>

            <router-link to="/settings" class="nav-item">
              <i class="icon-settings"></i>
              <span class="nav-text">系统设置</span>
            </router-link>
          </nav>
        </aside>

        <!-- 内容区域 -->
        <div class="content-area">
          <router-view v-slot="{ Component }">
            <transition name="page-transition" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </div>
    </main>

    <!-- 快速下单模态框 -->
    <QuickOrderModal
      v-if="showQuickOrderModal"
      @close="hideQuickOrder"
      @order-created="onOrderCreated"
    />

    <!-- 桌台状态面板 -->
    <TableStatusPanel
      v-if="showTableStatusPanel"
      @close="hideTableStatus"
      @table-selected="onTableSelected"
    />

    <!-- 通知面板 -->
    <NotificationPanel
      v-if="showNotificationPanel"
      :notifications="notifications"
      @close="hideNotifications"
      @mark-read="markNotificationRead"
    />

    <!-- 实时订单提醒 -->
    <div v-if="newOrderAlert" class="new-order-alert">
      <div class="alert-content">
        <i class="icon-bell animate-ring"></i>
        <div class="alert-info">
          <h4>新订单通知</h4>
          <p>{{ newOrderAlert.customerName }} - 桌号{{ newOrderAlert.tableNumber }}</p>
          <p>金额：¥{{ newOrderAlert.totalAmount }}</p>
        </div>
        <div class="alert-actions">
          <button @click="acceptNewOrder" class="btn-accept">接单</button>
          <button @click="dismissNewOrder" class="btn-dismiss">忽略</button>
        </div>
      </div>
    </div>

    <!-- 全局加载指示器 -->
    <div v-if="isLoading" class="global-loading">
      <div class="loading-spinner"></div>
      <span class="loading-text">{{ loadingText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useOrderStore } from '@/stores/order'
import { useNotificationStore } from '@/stores/notification'
import { useStaffStore } from '@/stores/staff'
import QuickOrderModal from '@/components/QuickOrderModal.vue'
import TableStatusPanel from '@/components/TableStatusPanel.vue'
import NotificationPanel from '@/components/NotificationPanel.vue'

const router = useRouter()
const authStore = useAuthStore()
const orderStore = useOrderStore()
const notificationStore = useNotificationStore()
const staffStore = useStaffStore()

// 响应式状态
const showUserMenu = ref(false)
const sidebarCollapsed = ref(false)
const showQuickOrderModal = ref(false)
const showTableStatusPanel = ref(false)
const showNotificationPanel = ref(false)
const isLoading = ref(false)
const loadingText = ref('')
const newOrderAlert = ref(null)

// 计算属性
const staffInfo = computed(() => staffStore.currentStaff)
const workStatus = computed(() => staffStore.workStatus)
const workStatusText = computed(() => {
  const statusMap = {
    'working': '工作中',
    'break': '休息中',
    'offline': '离线'
  }
  return statusMap[workStatus.value] || '未知'
})
const unreadCount = computed(() => notificationStore.unreadCount)
const pendingOrdersCount = computed(() => orderStore.pendingOrders.length)
const kitchenOrdersCount = computed(() => orderStore.kitchenOrders.length)
const notifications = computed(() => notificationStore.notifications)

// 方法
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const toggleNotifications = () => {
  showNotificationPanel.value = !showNotificationPanel.value
  if (showNotificationPanel.value) {
    notificationStore.markAllAsRead()
  }
}

const showQuickOrder = () => {
  showQuickOrderModal.value = true
}

const hideQuickOrder = () => {
  showQuickOrderModal.value = false
}

const showTableStatus = () => {
  showTableStatusPanel.value = true
}

const hideTableStatus = () => {
  showTableStatusPanel.value = false
}

const hideNotifications = () => {
  showNotificationPanel.value = false
}

const markNotificationRead = (notificationId: string) => {
  notificationStore.markAsRead(notificationId)
}

const toggleWorkStatus = async () => {
  try {
    if (workStatus.value === 'working') {
      await staffStore.clockOut()
    } else {
      await staffStore.clockIn()
    }
  } catch (error) {
    console.error('Toggle work status failed:', error)
  }
}

const logout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const onOrderCreated = (order: any) => {
  hideQuickOrder()
  // 可以添加订单创建后的处理逻辑
  console.log('New order created:', order)
}

const onTableSelected = (table: any) => {
  hideTableStatus()
  router.push(`/tables/${table.id}`)
}

const acceptNewOrder = () => {
  // 接受新订单的逻辑
  orderStore.acceptOrder(newOrderAlert.value.id)
  newOrderAlert.value = null
}

const dismissNewOrder = () => {
  // 忽略新订单的逻辑
  newOrderAlert.value = null
}

// WebSocket 连接和实时数据更新
let wsConnection: WebSocket | null = null

const connectWebSocket = () => {
  try {
    wsConnection = new WebSocket(`${import.meta.env.VITE_WS_URL}/staff`)

    wsConnection.onmessage = (event) => {
      const data = JSON.parse(event.data)
      handleWebSocketMessage(data)
    }

    wsConnection.onclose = () => {
      // 断线重连逻辑
      setTimeout(connectWebSocket, 5000)
    }

    wsConnection.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  } catch (error) {
    console.error('Failed to connect WebSocket:', error)
  }
}

const handleWebSocketMessage = (data: any) => {
  switch (data.type) {
    case 'new_order':
      newOrderAlert.value = data.payload
      setTimeout(() => {
        if (newOrderAlert.value?.id === data.payload.id) {
          newOrderAlert.value = null
        }
      }, 10000) // 10秒后自动消失
      break
    case 'order_updated':
      orderStore.updateOrder(data.payload)
      break
    case 'notification':
      notificationStore.addNotification(data.payload)
      break
    case 'kitchen_update':
      orderStore.updateKitchenOrder(data.payload)
      break
  }
}

// 全局加载方法
const showLoading = (text: string = '加载中...') => {
  isLoading.value = true
  loadingText.value = text
}

const hideLoading = () => {
  isLoading.value = false
  loadingText.value = ''
}

// 点击外部关闭菜单
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.navbar-actions')) {
    showUserMenu.value = false
  }
  if (!target.closest('.notification-center')) {
    showNotificationPanel.value = false
  }
}

// 键盘快捷键
const handleKeydown = (event: KeyboardEvent) => {
  // Ctrl/Cmd + N: 快速下单
  if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
    event.preventDefault()
    showQuickOrder()
  }
  // Ctrl/Cmd + T: 桌台状态
  if ((event.ctrlKey || event.metaKey) && event.key === 't') {
    event.preventDefault()
    showTableStatus()
  }
  // Esc: 关闭所有模态框
  if (event.key === 'Escape') {
    hideQuickOrder()
    hideTableStatus()
    hideNotifications()
  }
}

// 生命周期
onMounted(async () => {
  // 初始化员工信息
  await staffStore.initializeStaff()

  // 加载初始数据
  await Promise.all([
    orderStore.loadPendingOrders(),
    orderStore.loadKitchenOrders(),
    notificationStore.loadNotifications()
  ])

  // 建立WebSocket连接
  connectWebSocket()

  // 添加事件监听
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)

  // 设置全局加载方法
  ;(window as any).showGlobalLoading = showLoading
  ;(window as any).hideGlobalLoading = hideLoading

  console.log('Staff app initialized')
})

onUnmounted(() => {
  // 断开WebSocket连接
  if (wsConnection) {
    wsConnection.close()
  }

  // 移除事件监听
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="scss" scoped>
.staff-app {
  min-height: 100vh;
  background-color: var(--background-color-secondary);
  font-family: var(--font-family-primary);
}

.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: var(--background-color-primary);
  border-bottom: 1px solid var(--border-color-light);
  box-shadow: var(--shadow-sm);
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-lg);
  height: 64px;

  .navbar-brand {
    .logo {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: var(--text-color-primary);
      font-weight: var(--font-weight-semibold);

      .logo-image {
        width: 32px;
        height: 32px;
        margin-right: var(--spacing-sm);
      }

      .brand-text {
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }
  }

  .navbar-center {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xl);

    .work-status {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-xs) var(--spacing-md);
      background-color: var(--background-color-secondary);
      border-radius: var(--border-radius-full);

      .status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;

        &.working {
          background-color: var(--success-color);
          animation: pulse 2s infinite;
        }

        &.break {
          background-color: var(--warning-color);
        }

        &.offline {
          background-color: var(--text-color-tertiary);
        }
      }

      .status-text {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        color: var(--text-color-secondary);
      }
    }

    .quick-actions {
      display: flex;
      gap: var(--spacing-md);

      .action-btn {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        padding: var(--spacing-sm) var(--spacing-md);
        border: none;
        border-radius: var(--border-radius-md);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        cursor: pointer;
        transition: all var(--transition-duration-fast);

        &.primary {
          background-color: var(--primary-color);
          color: var(--background-color-primary);

          &:hover {
            background-color: var(--primary-color-dark);
          }
        }

        &.secondary {
          background-color: var(--background-color-tertiary);
          color: var(--text-color-primary);

          &:hover {
            background-color: var(--background-color-quaternary);
          }
        }

        i {
          font-size: var(--font-size-md);
        }
      }
    }
  }

  .navbar-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);

    .notification-center {
      position: relative;
      padding: var(--spacing-sm);
      cursor: pointer;
      border-radius: var(--border-radius-md);
      transition: background-color var(--transition-duration-fast);

      &:hover {
        background-color: var(--background-color-secondary);
      }

      i {
        font-size: var(--font-size-lg);
        color: var(--text-color-secondary);
      }

      .notification-badge {
        position: absolute;
        top: 4px;
        right: 4px;
        background-color: var(--error-color);
        color: var(--background-color-primary);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-bold);
        padding: 2px 6px;
        border-radius: var(--border-radius-full);
        min-width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--border-radius-md);
      cursor: pointer;
      transition: background-color var(--transition-duration-fast);

      &:hover {
        background-color: var(--background-color-secondary);
      }

      .user-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--border-color-light);
      }

      .user-details {
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        .user-name {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--text-color-primary);
          line-height: 1.2;
        }

        .user-role {
          font-size: var(--font-size-xs);
          color: var(--text-color-tertiary);
          line-height: 1.2;
        }
      }
    }

    .user-menu {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: var(--spacing-xs);
      min-width: 200px;
      background-color: var(--background-color-primary);
      border: 1px solid var(--border-color-light);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-lg);
      overflow: hidden;

      .menu-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        width: 100%;
        padding: var(--spacing-md);
        border: none;
        background: none;
        text-align: left;
        text-decoration: none;
        color: var(--text-color-primary);
        cursor: pointer;
        transition: background-color var(--transition-duration-fast);

        &:hover {
          background-color: var(--background-color-secondary);
        }

        &.logout {
          color: var(--error-color);
        }

        i {
          font-size: var(--font-size-md);
          width: 16px;
          text-align: center;
        }
      }

      .menu-divider {
        height: 1px;
        background-color: var(--border-color-light);
        margin: var(--spacing-xs) 0;
      }
    }
  }
}

.app-main {
  padding-top: 64px;
  min-height: 100vh;
}

.app-layout {
  display: flex;
  height: calc(100vh - 64px);
}

.sidebar {
  width: 260px;
  background-color: var(--background-color-primary);
  border-right: 1px solid var(--border-color-light);
  transition: width var(--transition-duration-normal);
  overflow: hidden;

  &.collapsed {
    width: 64px;
  }

  .sidebar-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 48px;
    border-bottom: 1px solid var(--border-color-light);
    cursor: pointer;
    transition: background-color var(--transition-duration-fast);

    &:hover {
      background-color: var(--background-color-secondary);
    }

    i {
      font-size: var(--font-size-lg);
      color: var(--text-color-secondary);
    }
  }

  .sidebar-nav {
    padding: var(--spacing-md) 0;

    .nav-item {
      position: relative;
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md) var(--spacing-lg);
      text-decoration: none;
      color: var(--text-color-secondary);
      transition: all var(--transition-duration-fast);

      &:hover {
        color: var(--primary-color);
        background-color: var(--primary-color-light);
      }

      &.router-link-active {
        color: var(--primary-color);
        background-color: var(--primary-color-light);
      }

      i {
        font-size: var(--font-size-lg);
        width: 20px;
        text-align: center;
      }

      .nav-text {
        flex: 1;
        font-weight: var(--font-weight-medium);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .nav-badge {
        background-color: var(--error-color);
        color: var(--background-color-primary);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-bold);
        padding: 2px 6px;
        border-radius: var(--border-radius-full);
        min-width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;

        &.cooking {
          background-color: var(--warning-color);
        }
      }
    }

    .nav-divider {
      height: 1px;
      background-color: var(--border-color-light);
      margin: var(--spacing-md) var(--spacing-lg);
    }
  }

  .collapsed & {
    .sidebar-nav {
      .nav-item {
        justify-content: center;
        padding: var(--spacing-md);

        .nav-text {
          display: none;
        }

        .nav-badge {
          position: absolute;
          top: var(--spacing-xs);
          right: var(--spacing-xs);
        }
      }
    }
  }
}

.content-area {
  flex: 1;
  overflow-y: auto;
  background-color: var(--background-color-secondary);
}

.new-order-alert {
  position: fixed;
  top: 80px;
  right: var(--spacing-lg);
  z-index: 999;
  max-width: 400px;
  background-color: var(--background-color-primary);
  border: 2px solid var(--primary-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  animation: slideInRight var(--transition-duration-normal) ease-out;

  .alert-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);

    .animate-ring {
      animation: ring 1s infinite;
      color: var(--primary-color);
      font-size: var(--font-size-xl);
    }

    .alert-info {
      flex: 1;

      h4 {
        margin: 0 0 var(--spacing-xs) 0;
        color: var(--text-color-primary);
        font-weight: var(--font-weight-semibold);
      }

      p {
        margin: 0 0 var(--spacing-xs) 0;
        color: var(--text-color-secondary);
        font-size: var(--font-size-sm);
      }
    }

    .alert-actions {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);

      button {
        padding: var(--spacing-xs) var(--spacing-md);
        border: none;
        border-radius: var(--border-radius-md);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        cursor: pointer;
        transition: all var(--transition-duration-fast);

        &.btn-accept {
          background-color: var(--success-color);
          color: var(--background-color-primary);

          &:hover {
            background-color: var(--success-color-dark);
          }
        }

        &.btn-dismiss {
          background-color: var(--background-color-tertiary);
          color: var(--text-color-secondary);

          &:hover {
            background-color: var(--background-color-quaternary);
          }
        }
      }
    }
  }
}

.global-loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  z-index: 9999;

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--border-color-light);
    border-top: 4px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    color: var(--text-color-secondary);
    font-size: var(--font-size-sm);
  }
}

// 动画
.page-transition-enter-active,
.page-transition-leave-active {
  transition: opacity var(--transition-duration-normal),
              transform var(--transition-duration-normal);
}

.page-transition-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

@keyframes ring {
  0% { transform: rotate(0deg); }
  10% { transform: rotate(-14deg); }
  20% { transform: rotate(14deg); }
  30% { transform: rotate(-8deg); }
  40% { transform: rotate(8deg); }
  50% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>