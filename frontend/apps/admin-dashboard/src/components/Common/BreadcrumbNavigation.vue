<!--
 * @fileoverview YYC³餐饮行业智能化平台 - 面包屑导航组件
 * @description 显示当前页面路径，支持点击导航和自定义样式
 * @module BreadcrumbNavigation
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 * @updated 2025-01-19
 -->
<template>
  <div class="breadcrumb-navigation" :class="breadcrumbClasses">
    <el-breadcrumb :separator="separator">
      <el-breadcrumb-item
        v-for="(item, index) in breadcrumbItems"
        :key="item.path || index"
        :to="item.to"
        :class="{ 'is-home': item.isHome }"
        @click="handleBreadcrumbClick(item, index)"
      >
        <el-icon v-if="item.icon" class="breadcrumb-icon">
          <component :is="item.icon" />
        </el-icon>
        <span class="breadcrumb-text">{{ item.title }}</span>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

interface BreadcrumbItem {
  title: string
  path?: string
  to?: string | object
  icon?: any
  isHome?: boolean
}

interface Props {
  separator?: string
  showIcon?: boolean
  maxItems?: number
  homeTitle?: string
  homePath?: string
}

const props = withDefaults(defineProps<Props>(), {
  separator: '/',
  showIcon: true,
  maxItems: 5,
  homeTitle: '首页',
  homePath: '/dashboard'
})

const route = useRoute()
const router = useRouter()

const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
  const items: BreadcrumbItem[] = []
  
  items.push({
    title: props.homeTitle,
    path: props.homePath,
    to: props.homePath,
    isHome: true
  })
  
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  
  matched.forEach((match, index) => {
    if (match.path === props.homePath) return
    
    const isLast = index === matched.length - 1
    items.push({
      title: match.meta?.title as string,
      path: match.path,
      to: isLast ? undefined : match.path,
      icon: match.meta?.icon ? getIconComponent(match.meta.icon as string) : undefined
    })
  })
  
  if (items.length > props.maxItems) {
    const homeItem = items[0]
    const lastItem = items[items.length - 1]
    
    return [
      homeItem,
      {
        title: '...',
        path: undefined,
        to: undefined
      },
      lastItem
    ]
  }
  
  return items
})

const breadcrumbClasses = computed(() => ({
  'show-icon': props.showIcon,
  'has-separator': !!props.separator
}))

function getIconComponent(iconName: string) {
  const icons: Record<string, any> = {
    House: 'House',
    List: 'List',
    Food: 'Food',
    Kitchen: 'Kitchen',
    TrendCharts: 'TrendCharts',
    User: 'User',
    Shop: 'Shop',
    Shield: 'Shield',
    Document: 'Document',
    Setting: 'Setting',
    MagicStick: 'MagicStick',
    ChatDotRound: 'ChatDotRound',
    Promotion: 'Promotion',
    Connection: 'Connection',
    Robot: 'Robot',
    Box: 'Box',
    Avatar: 'Avatar',
    Bullhorn: 'Bullhorn',
    CreditCard: 'CreditCard',
    Wallet: 'Wallet',
    View: 'View'
  }
  
  return icons[iconName] || 'House'
}

function handleBreadcrumbClick(item: BreadcrumbItem, index: number) {
  if (!item.to) return
  
  try {
    router.push(item.to)
  } catch (error) {
    ElMessage.error(`导航失败: ${(error as Error).message}`)
  }
}

watch(() => route.path, (newPath) => {
  console.log('Breadcrumb path changed:', newPath)
})
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';

.breadcrumb-navigation {
  display: flex;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border-primary);
  transition: all 0.3s ease;

  &:hover {
    background: var(--color-bg-tertiary);
  }
}

:deep(.el-breadcrumb) {
  display: flex;
  align-items: center;
  font-size: var(--font-size-body);
  
  .el-breadcrumb__item {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--color-text-secondary);
    transition: all 0.2s ease;
    cursor: pointer;
    
    &:hover {
      color: var(--color-primary);
      
      .breadcrumb-icon {
        color: var(--color-primary);
      }
    }
    
    &:last-child {
      color: var(--color-text-primary);
      font-weight: 600;
      cursor: default;
      
      &:hover {
        color: var(--color-text-primary);
      }
    }
    
    &.is-home {
      color: var(--color-primary);
      font-weight: 500;
    }
  }
  
  .el-breadcrumb__separator {
    color: var(--color-text-placeholder);
    margin: 0 var(--spacing-sm);
  }
}

.breadcrumb-icon {
  font-size: var(--icon-size-md);
  color: var(--color-text-secondary);
  transition: color 0.2s ease;
}

.breadcrumb-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.show-icon {
  :deep(.el-breadcrumb__item) {
    .breadcrumb-icon {
      display: inline-flex;
    }
  }
}

@media (max-width: $breakpoint-md) {
  .breadcrumb-navigation {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  :deep(.el-breadcrumb) {
    font-size: var(--font-size-body-small);
  }
  
  .breadcrumb-text {
    max-width: 120px;
  }
}

@media (max-width: $breakpoint-sm) {
  .breadcrumb-navigation {
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  
  :deep(.el-breadcrumb) {
    font-size: var(--font-size-body-tiny);
  }
  
  .breadcrumb-icon {
    font-size: var(--icon-size-sm);
  }
  
  .breadcrumb-text {
    max-width: 80px;
  }
}
</style>
