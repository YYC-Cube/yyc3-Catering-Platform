<!--
 * @fileoverview YYC³餐饮行业智能化平台 - 导航历史记录组件
 * @description 显示最近访问的页面，支持快速跳转和搜索
 * @module NavigationHistoryPanel
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 * @updated 2025-01-19
 -->
<template>
  <div class="navigation-history-panel" :class="panelClasses">
    <div class="panel-header">
      <h3 class="panel-title">最近访问</h3>
      <div class="panel-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索历史..."
          prefix-icon="Search"
          size="small"
          clearable
          class="search-input"
        />
        <el-button
          type="text"
          size="small"
          @click="handleClear"
          class="clear-btn"
        >
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>

    <div class="panel-body">
      <div
        v-for="(item, index) in filteredHistory"
        :key="index"
        class="history-item"
        :class="{ 'is-current': item.path === currentPath }"
        @click="handleItemClick(item)"
      >
        <div class="item-icon">
          <el-icon>
            <component :is="getIconForPath(item.path)" />
          </el-icon>
        </div>
        <div class="item-content">
          <div class="item-title">{{ item.title }}</div>
          <div class="item-path">{{ item.path }}</div>
          <div class="item-time">{{ formatTime(item.timestamp) }}</div>
        </div>
      </div>

      <div v-if="filteredHistory.length === 0" class="empty-state">
        <el-empty description="暂无历史记录" />
      </div>
    </div>

    <div class="panel-footer">
      <el-button
        type="primary"
        size="small"
        @click="handleGoBack"
        :disabled="!canGoBack"
        class="nav-btn"
      >
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <el-button
        type="primary"
        size="small"
        @click="handleGoForward"
        :disabled="!canGoForward"
        class="nav-btn"
      >
        前进
        <el-icon><ArrowRight /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Delete, ArrowLeft, ArrowRight, Search } from '@element-plus/icons-vue'
import { useNavigationHistory, NavigationHistoryItem } from '@/composables/useNavigationHistory'

interface Props {
  visible?: boolean
  maxItems?: number
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  maxItems: 10
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const route = useRoute()
const router = useRouter()

const {
  history,
  searchHistory,
  getRecentPages,
  goBack,
  goForward,
  clearHistory,
  canGoBack,
  canGoForward,
  formatTime
} = useNavigationHistory()

const searchKeyword = ref('')
const currentPath = computed(() => route.path)

const filteredHistory = computed<NavigationHistoryItem[]>(() => {
  if (searchKeyword.value.trim()) {
    return searchHistory(searchKeyword.value).slice(0, props.maxItems)
  }
  return getRecentPages(props.maxItems)
})

const panelClasses = computed(() => ({
  'is-visible': props.visible
}))

function handleItemClick(item: NavigationHistoryItem) {
  router.push({ path: item.path, query: item.query })
  emit('close')
}

function handleGoBack() {
  goBack()
}

function handleGoForward() {
  goForward()
}

function handleClear() {
  clearHistory()
  searchKeyword.value = ''
}

function getIconForPath(path: string): any {
  const iconMap: Record<string, any> = {
    '/dashboard': 'House',
    '/orders': 'List',
    '/orders/list': 'List',
    '/menu': 'Food',
    '/menu/items': 'Food',
    '/kitchen': 'Kitchen',
    '/kitchen/display': 'Monitor',
    '/analytics': 'TrendCharts',
    '/customers/list': 'User',
    '/ai/dashboard': 'MagicStick',
    '/ai/assistant': 'ChatDotRound'
  }
  
  return iconMap[path] || 'Document'
}

watch(() => route.path, () => {
  console.log('Route changed:', route.path)
})
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';

.navigation-history-panel {
  position: fixed;
  top: var(--header-height);
  right: 0;
  width: 320px;
  height: calc(100vh - var(--header-height));
  background: var(--color-bg-primary);
  border-left: 1px solid var(--color-border-primary);
  box-shadow: var(--shadow-xl);
  z-index: var(--z-sidebar);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s ease;

  &.is-visible {
    transform: translateX(0);
  }
}

.panel-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-primary);
  background: var(--color-bg-secondary);
}

.panel-title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-h4);
  color: var(--color-text-primary);
}

.panel-actions {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.search-input {
  flex: 1;
  max-width: 200px;
}

.clear-btn {
  color: var(--color-text-secondary);
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-sm);
  transition: all 0.2s ease;

  &:hover {
    color: var(--color-danger);
    background: var(--color-danger-light);
  }
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
}

.history-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: var(--spacing-sm);

  &:hover {
    background: var(--color-bg-tertiary);
    transform: translateX(-4px);
  }

  &.is-current {
    background: var(--color-primary-light);
    border-left: 3px solid var(--color-primary);
  }
}

.item-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-tertiary);
  border-radius: var(--border-radius-sm);
  color: var(--color-primary);
}

.item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.item-title {
  font-size: var(--font-size-body);
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-path {
  font-size: var(--font-size-body-small);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-time {
  font-size: var(--font-size-body-tiny);
  color: var(--color-text-placeholder);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.panel-footer {
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--color-border-primary);
  background: var(--color-bg-secondary);
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.nav-btn {
  flex: 1;
}

@media (max-width: $breakpoint-md) {
  .navigation-history-panel {
    width: 280px;
  }

  .search-input {
    max-width: 150px;
  }

  .item-title {
    font-size: var(--font-size-body-small);
  }

  .item-path,
  .item-time {
    font-size: var(--font-size-body-tiny);
  }
}

@media (max-width: $breakpoint-sm) {
  .navigation-history-panel {
    width: 100%;
    height: calc(100vh - var(--header-height-mobile));
  }

  .panel-header,
  .panel-body,
  .panel-footer {
    padding: var(--spacing-md);
  }

  .search-input {
    max-width: 120px;
  }

  .item-icon {
    width: 28px;
    height: 28px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .history-item {
    &:hover {
      transform: none;
    }
  }
}
</style>
