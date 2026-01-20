<!--
 * @fileoverview YYC³餐饮行业智能化平台 - 管理后台顶部导航组件
 * @description 管理后台的顶部导航栏，包含面包屑、用户信息、通知等功能
 * @module AppHeader
 * @author YYC³
 * @version 1.0.0
 * @created 2024-01-01
 * @updated 2024-01-01
 -->
<template>
  <div class="app-header">
    <!-- 左侧区域 -->
    <div class="header-left">
      <el-button
        type="text"
        @click="handleToggleSidebar"
        class="sidebar-toggle-btn"
        :class="{ 'is-mobile': isMobile }"
      >
        <el-icon size="18">
          <Fold v-if="!isMobile" />
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12h18M3 6h18M3 18h18"/>
          </svg>
        </el-icon>
      </el-button>

      <!-- 面包屑导航 -->
      <BreadcrumbNavigation
        v-if="!isMobile"
        :show-icon="true"
        :max-items="5"
        home-title="工作台"
        home-path="/dashboard"
      />
    </div>

    <!-- 右侧区域 -->
    <div class="header-right">
      <!-- 全局搜索 -->
      <el-input
        v-model="searchKeyword"
        placeholder="搜索菜单、功能..."
        prefix-icon="Search"
        class="search-input"
        clearable
        @keyup.enter="handleSearch"
      />

      <!-- 通知中心 -->
      <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notification-badge">
        <el-button type="text" @click="handleNotification">
          <el-icon size="18">
            <Bell />
          </el-icon>
        </el-button>
      </el-badge>

      <!-- 全屏切换 -->
      <el-button type="text" @click="handleFullscreen" class="fullscreen-btn">
        <el-icon size="18">
          <Aim v-if="isFullscreen" />
          <FullScreen v-else />
        </el-icon>
      </el-button>

      <!-- 快捷键帮助 -->
      <el-button
        type="text"
        @click="handleShortcutHelp"
        class="shortcut-help-btn"
        title="快捷键帮助 (Alt+H)"
      >
        <el-icon size="18">
          <Key />
        </el-icon>
      </el-button>

      <!-- 用户信息 -->
      <el-dropdown @command="handleCommand" class="user-dropdown">
        <div class="user-info">
          <el-avatar :size="32" :src="user?.avatar" class="user-avatar">
            {{ user?.name?.charAt(0) }}
          </el-avatar>
          <span class="user-name">{{ user?.name }}</span>
          <el-icon class="dropdown-icon">
            <ArrowDown />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon><Setting /></el-icon>
              系统设置
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<!-- 快捷键帮助 -->
<ShortcutHelp :visible="showShortcutHelp" @close="showShortcutHelp = false" />

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { useNavigationState } from '@/composables/useNavigationState'
import { useShortcuts } from '@/composables/useShortcuts'
import BreadcrumbNavigation from '@/components/common/BreadcrumbNavigation.vue'
import ShortcutHelp from '@/components/common/ShortcutHelp.vue'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
}

const route = useRoute()
const router = useRouter()
const navState = useNavigationState()
const { shortcutManager, registerCommonShortcuts } = useShortcuts()
const showShortcutHelp = ref(false)

const searchKeyword = ref('')
const isFullscreen = ref(false)
const unreadCount = ref(3)
const isMobile = ref(false)

const user = ref<User>({
  id: '1',
  name: '管理员',
  email: 'admin@yyc3.com',
  avatar: '',
  role: 'admin'
})

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

const handleToggleSidebar = () => {
  document.dispatchEvent(new CustomEvent('toggle-sidebar'))
}

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    ElMessage.info(`搜索: ${searchKeyword.value}`)
  }
}

const handleNotification = () => {
  ElMessage.info('打开通知中心')
}

const handleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

const handleCommand = async (command: string) => {
  try {
    navState.startNavigation(command)
    
    switch (command) {
      case 'profile':
        await router.push('/profile')
        break
      case 'settings':
        await router.push('/system/settings')
        break
      case 'logout':
        await handleLogout()
        break
    }
    
    navState.completeNavigation()
  } catch (error) {
    const navError = navState.failNavigation(error as Error, command)
    showNavigationError(navError)
  }
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    localStorage.removeItem('token')
    localStorage.removeItem('user')

    ElMessage.success('退出成功')
    await router.push('/login')
  } catch {
    throw new Error('用户取消退出')
  }
}

const showNavigationError = (error: NavigationError) => {
  ElNotification({
    title: '导航错误',
    message: error.message,
    type: 'error',
    duration: 5000,
    showClose: true
  })
}

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

const handleShortcutHelp = () => {
  showShortcutHelp.value = !showShortcutHelp.value
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  document.addEventListener('keydown', (event) => shortcutManager.handleKeyDown(event))
  
  registerCommonShortcuts()
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  window.removeEventListener('resize', checkMobile)
  document.removeEventListener('keydown', (event) => shortcutManager.handleKeyDown(event))
})
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';

.app-header {
  height: var(--header-height, 60px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-xl);
  background: var(--color-primary-dark);
  border-bottom: 1px solid var(--color-neutral);
  box-shadow: var(--shadow-base);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: var(--shadow-md);
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.sidebar-toggle-btn {
  padding: var(--spacing-sm);
  color: var(--color-text-secondary);
  border-radius: var(--border-radius-sm);
  transition: all 0.2s ease;

  &:hover {
    color: var(--color-primary);
    background: var(--color-primary-light);
  }

  &:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

.breadcrumb {
  :deep(.el-breadcrumb__item) {
    .el-breadcrumb__inner {
      color: var(--color-text-secondary);
      font-size: var(--font-size-body);
      font-weight: 500;

      &:hover {
        color: var(--color-primary);
      }
    }

    &:last-child .el-breadcrumb__inner {
      color: var(--color-text-primary);
      font-weight: 600;
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.search-input {
  width: var(--search-width, 240px);

  :deep(.el-input__wrapper) {
    border-radius: var(--border-radius-full);
    background-color: var(--color-surface-elevated);
    box-shadow: none;
    border: 1px solid var(--color-border);
    transition: all 0.2s ease;

    &:hover {
      background-color: var(--color-surface);
      border-color: var(--color-primary);
    }

    &:focus-within {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px var(--color-primary-light);
    }
  }

  :deep(.el-input__inner) {
    color: var(--color-text-primary);
    &::placeholder {
      color: var(--color-text-placeholder);
    }
  }
}

.notification-badge {
  .el-button {
    padding: var(--spacing-sm);
    color: var(--color-text-secondary);
    border-radius: var(--border-radius-sm);
    transition: all 0.2s ease;

    &:hover {
      color: var(--color-primary);
      background: var(--color-primary-light);
    }

    &:focus {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
  }
}

.fullscreen-btn {
  padding: var(--spacing-sm);
  color: var(--color-text-secondary);
  border-radius: var(--border-radius-sm);
  transition: all 0.2s ease;

  &:hover {
    color: var(--color-primary);
    background: var(--color-primary-light);
  }

  &:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-full);
  transition: all 0.3s ease;
  background: transparent;

  &:hover {
    background: var(--color-surface-elevated);
    box-shadow: var(--shadow-sm);
  }
}

.user-avatar {
  background-color: var(--color-primary);
  color: var(--color-surface);
  font-weight: 600;
}

.user-name {
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
  font-weight: 600;
  line-height: 1.2;
}

.dropdown-icon {
  font-size: var(--font-size-body-small);
  color: var(--color-text-secondary);
  transition: transform 0.3s ease;
}

.user-dropdown:hover .dropdown-icon {
  transform: rotate(180deg);
}

// 响应式设计
@media (max-width: $breakpoint-md) {
  .app-header {
    padding: 0 var(--spacing-md);
  }

  .header-left {
    gap: var(--spacing-sm);
  }

  .header-right {
    gap: var(--spacing-sm);
  }

  .search-input {
    width: 200px;

    :deep(.el-input__wrapper) {
      padding: var(--spacing-xs) var(--spacing-sm);
    }
  }

  .user-info {
    padding: var(--spacing-xs) var(--spacing-sm);
    min-width: 0;
  }

  .breadcrumb {
    :deep(.el-breadcrumb__item .el-breadcrumb__inner) {
      font-size: var(--font-size-body-small);
    }
  }
}

@media (max-width: $breakpoint-sm) {
  .app-header {
    padding: 0 var(--spacing-sm);
    height: var(--header-height-mobile, 56px);
  }

  .header-left {
    gap: var(--spacing-xs);
  }

  .header-right {
    gap: var(--spacing-xs);
  }

  .search-input {
    width: 160px;

    :deep(.el-input__wrapper) {
      padding: var(--spacing-xs);
    }
  }

  .breadcrumb {
    display: none; // 移动端隐藏面包屑
  }

  .sidebar-toggle-btn,
  .notification-badge,
  .fullscreen-btn {
    padding: var(--spacing-xs);
  }

  .sidebar-toggle-btn {
    &.is-mobile {
      svg {
        width: 24px;
        height: 24px;
      }
    }
  }

  .user-info {
    padding: var(--spacing-xs);

    .user-name {
      display: none; // 移动端隐藏用户名
    }
  }
}
</style>