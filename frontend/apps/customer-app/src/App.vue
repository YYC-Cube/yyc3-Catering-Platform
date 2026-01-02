<template>
  <div id="app" class="customer-app">
    <!-- 顶部导航 -->
    <header class="app-header">
      <nav class="navbar">
        <div class="navbar-brand">
          <router-link to="/" class="logo">
            <img src="/logo.svg" alt="YYC³餐饮" class="logo-image">
            <span class="brand-text">YYC³</span>
          </router-link>
        </div>

        <div class="navbar-menu">
          <router-link to="/menu" class="nav-item">
            <i class="icon-menu"></i>
            <span>菜单</span>
          </router-link>
          <router-link to="/orders" class="nav-item">
            <i class="icon-orders"></i>
            <span>订单</span>
          </router-link>
          <router-link to="/reservations" class="nav-item">
            <i class="icon-reservations"></i>
            <span>预约</span>
          </router-link>
        </div>

        <div class="navbar-actions">
          <div class="user-profile" @click="toggleUserMenu">
            <img :src="userAvatar" :alt="userName" class="user-avatar">
            <span class="user-name">{{ userName }}</span>
          </div>

          <!-- 用户下拉菜单 -->
          <div v-if="showUserMenu" class="user-menu">
            <router-link to="/profile" class="menu-item">
              <i class="icon-user"></i>
              个人信息
            </router-link>
            <router-link to="/favorites" class="menu-item">
              <i class="icon-favorites"></i>
              我的收藏
            </router-link>
            <router-link to="/settings" class="menu-item">
              <i class="icon-settings"></i>
              设置
            </router-link>
            <div class="menu-divider"></div>
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
      <router-view v-slot="{ Component }">
        <transition name="page-transition" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 底部导航（移动端） -->
    <nav class="mobile-nav">
      <router-link to="/menu" class="nav-item">
        <i class="icon-menu"></i>
        <span>菜单</span>
      </router-link>
      <router-link to="/cart" class="nav-item cart-nav">
        <i class="icon-cart"></i>
        <span>购物车</span>
        <span v-if="cartItemCount > 0" class="cart-badge">{{ cartItemCount }}</span>
      </router-link>
      <router-link to="/orders" class="nav-item">
        <i class="icon-orders"></i>
        <span>订单</span>
      </router-link>
      <router-link to="/reservations" class="nav-item">
        <i class="icon-reservations"></i>
        <span>预约</span>
      </router-link>
      <router-link to="/profile" class="nav-item">
        <i class="icon-user"></i>
        <span>我的</span>
      </router-link>
    </nav>

    <!-- AI助手浮窗 -->
    <AIAssistant
      v-if="showAIAssistant"
      :position="aiAssistantPosition"
      @close="toggleAIAssistant"
    />

    <!-- 智能推荐提示 -->
    <SmartRecommendation
      v-if="showRecommendations"
      :recommendations="currentRecommendations"
      @dismiss="dismissRecommendations"
    />

    <!-- 全局加载指示器 -->
    <div v-if="isLoading" class="global-loading">
      <div class="loading-spinner"></div>
      <span class="loading-text">{{ loadingText }}</span>
    </div>

    <!-- 网络状态提示 -->
    <div v-if="!isOnline" class="offline-banner">
      <i class="icon-offline"></i>
      <span>网络连接已断开，部分功能可能不可用</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useRecommendationStore } from '@/stores/recommendation'
import AIAssistant from '@/components/AIAssistant.vue'
import SmartRecommendation from '@/components/SmartRecommendation.vue'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const recommendationStore = useRecommendationStore()

// 响应式状态
const showUserMenu = ref(false)
const showAIAssistant = ref(false)
const aiAssistantPosition = ref({ bottom: 80, right: 20 })
const isLoading = ref(false)
const loadingText = ref('')
const isOnline = ref(navigator.onLine)

// 计算属性
const userName = computed(() => authStore.user?.name || '游客')
const userAvatar = computed(() => authStore.user?.avatar || '/default-avatar.png')
const cartItemCount = computed(() => cartStore.totalItems)
const showRecommendations = computed(() => recommendationStore.showRecommendations)
const currentRecommendations = computed(() => recommendationStore.currentRecommendations)

// 方法
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const toggleAIAssistant = () => {
  showAIAssistant.value = !showAIAssistant.value
}

const dismissRecommendations = () => {
  recommendationStore.hideRecommendations()
}

const logout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
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

// 网络状态监听
const handleOnline = () => {
  isOnline.value = true
}

const handleOffline = () => {
  isOnline.value = false
}

// 点击外部关闭用户菜单
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.navbar-actions')) {
    showUserMenu.value = false
  }
}

// 生命周期
onMounted(async () => {
  // 添加网络状态监听
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  document.addEventListener('click', handleClickOutside)

  // 初始化用户状态
  await authStore.initializeAuth()

  // 如果用户已登录，加载个性化推荐
  if (authStore.isAuthenticated) {
    await recommendationStore.loadPersonalizedRecommendations()
  }

  // 设置全局加载方法到window对象，供其他组件使用
  ;(window as any).showGlobalLoading = showLoading
  ;(window as any).hideGlobalLoading = hideLoading
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
.customer-app {
  min-height: 100vh;
  background-color: var(--background-color-primary);
  font-family: var(--font-family-primary);
}

.app-header {
  position: sticky;
  top: 0;
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
  max-width: 1200px;
  margin: 0 auto;
}

.navbar-brand {
  .logo {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: var(--text-color-primary);
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-lg);

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

.navbar-menu {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);

  @media (max-width: 768px) {
    display: none;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--border-radius-md);
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
      font-size: var(--font-size-md);
    }
  }
}

.navbar-actions {
  position: relative;

  .user-profile {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius-lg);
    cursor: pointer;
    transition: background-color var(--transition-duration-fast);

    &:hover {
      background-color: var(--background-color-tertiary);
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--border-color-light);
    }

    .user-name {
      font-weight: var(--font-weight-medium);
      color: var(--text-color-primary);

      @media (max-width: 768px) {
        display: none;
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

.app-main {
  min-height: calc(100vh - 64px - 60px);
  padding-bottom: 60px; // 为移动端底部导航留出空间

  @media (min-width: 769px) {
    padding-bottom: var(--spacing-xl);
    min-height: calc(100vh - 64px);
  }
}

.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 60px;
  background-color: var(--background-color-primary);
  border-top: 1px solid var(--border-color-light);
  z-index: 1000;

  @media (min-width: 769px) {
    display: none;
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xs);
    flex: 1;
    text-decoration: none;
    color: var(--text-color-secondary);
    transition: color var(--transition-duration-fast);

    &:hover {
      color: var(--primary-color);
    }

    &.router-link-active {
      color: var(--primary-color);
    }

    &.cart-nav {
      position: relative;

      .cart-badge {
        position: absolute;
        top: 0;
        right: 25%;
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

    i {
      font-size: var(--font-size-lg);
    }

    span {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
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

.offline-banner {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: var(--warning-color-light);
  color: var(--warning-color-dark);
  font-size: var(--font-size-sm);
  z-index: 999;

  i {
    font-size: var(--font-size-md);
  }
}

// 页面转场动画
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>