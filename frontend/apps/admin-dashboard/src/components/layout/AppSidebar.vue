<!--
 * @fileoverview YYC³餐饮行业智能化平台 - 管理后台侧边栏组件
 * @description 管理后台的侧边栏导航菜单，包含系统功能的快速访问入口
 * @module AppSidebar
 * @author YYC³
 * @version 1.0.0
 * @created 2024-01-01
 * @updated 2024-01-01
 -->
<template>
  <div class="app-sidebar" :class="{
    collapsed: collapsed,
    'mobile-open': mobileOpen
  }">
    <!-- Logo区域 -->
    <div class="sidebar-logo">
      <img v-if="!collapsed" src="/assets/logo.png" alt="YYC³" class="logo-img" />
      <img v-else src="/assets/logo-mini.png" alt="YYC³" class="logo-mini" />
      <h1 v-if="!collapsed" class="logo-title">YYC³管理后台</h1>
    </div>

    <!-- 菜单列表 -->
    <el-scrollbar class="sidebar-menu">
      <el-menu
        :default-active="$route.path"
        :collapse="collapsed"
        :unique-opened="true"
        router
        background-color="var(--color-bg-primary)"
        text-color="var(--color-text-secondary)"
        active-text-color="var(--color-text-primary)"
      >
        <el-menu-item index="/dashboard" class="menu-item-dashboard">
          <el-icon><House /></el-icon>
          <template #title>工作台</template>
        </el-menu-item>

        <el-sub-menu index="order" class="menu-item-orders">
          <template #title>
            <el-icon><List /></el-icon>
            <span>订单管理</span>
          </template>
          <el-menu-item index="/orders/list" class="menu-item-orders">
            <el-icon><Document /></el-icon>
            <template #title>订单列表</template>
          </el-menu-item>
          <el-menu-item index="/orders/analysis" class="menu-item-orders">
            <el-icon><TrendCharts /></el-icon>
            <template #title>订单分析</template>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="menu" class="menu-item-menu">
          <template #title>
            <el-icon><Menu /></el-icon>
            <span>菜单管理</span>
          </template>
          <el-menu-item index="/menu/items" class="menu-item-menu">
            <el-icon><Food /></el-icon>
            <template #title>菜品管理</template>
          </el-menu-item>
          <el-menu-item index="/menu/categories" class="menu-item-menu">
            <el-icon><Collection /></el-icon>
            <template #title>菜品分类</template>
          </el-menu-item>
          <el-menu-item index="/menu/recommendations" class="menu-item-menu">
            <el-icon><Star /></el-icon>
            <template #title>推荐管理</template>
          </el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/kitchen" class="menu-item-kitchen">
          <el-icon><Kitchen /></el-icon>
          <template #title>厨房管理</template>
        </el-menu-item>

        <el-menu-item index="/analytics" class="menu-item-analytics">
          <el-icon><TrendCharts /></el-icon>
          <template #title>数据分析</template>
        </el-menu-item>

        <el-sub-menu index="customer" class="menu-item-customer">
          <template #title>
            <el-icon><User /></el-icon>
            <span>客户管理</span>
          </template>
          <el-menu-item index="/customers/list" class="menu-item-customer">
            <el-icon><UserFilled /></el-icon>
            <template #title>会员管理</template>
          </el-menu-item>
          <el-menu-item index="/customers/analysis" class="menu-item-customer">
            <el-icon><DataAnalysis /></el-icon>
            <template #title>客户分析</template>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="kitchen-display" class="menu-item-kitchen">
          <template #title>
            <el-icon><KnifeAndSpoon /></el-icon>
            <span>厨房显示</span>
          </template>
          <el-menu-item index="/kitchen/display" class="menu-item-kitchen">
            <el-icon><Monitor /></el-icon>
            <template #title>厨房监控</template>
          </el-menu-item>
          <el-menu-item index="/kitchen/efficiency" class="menu-item-kitchen">
            <el-icon><Odometer /></el-icon>
            <template #title>效率分析</template>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="chain" class="menu-item-chain">
          <template #title>
            <el-icon><Shop /></el-icon>
            <span>连锁管理</span>
          </template>
          <el-menu-item index="/chain/stores" class="menu-item-chain">
            <el-icon><Store /></el-icon>
            <template #title>门店管理</template>
          </el-menu-item>
          <el-menu-item index="/chain/operations" class="menu-item-chain">
            <el-icon><Operation /></el-icon>
            <template #title>运营分析</template>
          </el-menu-item>
          <el-menu-item index="/chain/performance" class="menu-item-chain">
            <el-icon><Trophy /></el-icon>
            <template #title>业绩排名</template>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="safety" class="menu-item-safety">
          <template #title>
            <el-icon><Shield /></el-icon>
            <span>食品安全</span>
          </template>
          <el-menu-item index="/safety/traceability" class="menu-item-safety">
            <el-icon><Search /></el-icon>
            <template #title>溯源管理</template>
          </el-menu-item>
          <el-menu-item index="/safety/checks" class="menu-item-safety">
            <el-icon><CircleCheck /></el-icon>
            <template #title>安全检查</template>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="reports" class="menu-item-reports">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>报表分析</span>
          </template>
          <el-menu-item index="/reports/sales" class="menu-item-reports">
            <el-icon><Money /></el-icon>
            <template #title>销售报表</template>
          </el-menu-item>
          <el-menu-item index="/reports/finance" class="menu-item-reports">
            <el-icon><Wallet /></el-icon>
            <template #title>财务报表</template>
          </el-menu-item>
          <el-menu-item index="/reports/operations" class="menu-item-reports">
            <el-icon><DataLine /></el-icon>
            <template #title>运营报表</template>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="payment" class="menu-item-payment">
          <template #title>
            <el-icon><CreditCard /></el-icon>
            <span>支付管理</span>
          </template>
          <el-menu-item index="/payment/config" class="menu-item-payment">
            <el-icon><Setting /></el-icon>
            <template #title>支付配置</template>
          </el-menu-item>
          <el-menu-item index="/payment/transactions" class="menu-item-payment">
            <el-icon><Document /></el-icon>
            <template #title>交易记录</template>
          </el-menu-item>
          <el-menu-item index="/payment/refunds" class="menu-item-payment">
            <el-icon><RefreshLeft /></el-icon>
            <template #title>退款管理</template>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="system" class="menu-item-system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/system/users" class="menu-item-system">
            <el-icon><UserFilled /></el-icon>
            <template #title>用户管理</template>
          </el-menu-item>
          <el-menu-item index="/system/roles" class="menu-item-system">
            <el-icon><Key /></el-icon>
            <template #title>角色权限</template>
          </el-menu-item>
          <el-menu-item index="/system/settings" class="menu-item-system">
            <el-icon><Tools /></el-icon>
            <template #title>系统设置</template>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-scrollbar>

    <!-- 折叠按钮 -->
    <div class="sidebar-toggle" @click="handleToggle">
      <el-icon>
        <Expand v-if="collapsed" />
        <Fold v-else />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  collapsed?: boolean
  mobileOpen?: boolean
}

interface Emits {
  (e: 'toggle'): void
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  mobileOpen: false
})

const emit = defineEmits<Emits>()

const isMobile = computed(() => {
  return window.innerWidth <= 768
})

const handleToggle = () => {
  emit('toggle')
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';

.app-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: var(--sidebar-width);
  background-color: var(--color-bg-primary);
  transition: width 0.3s ease;
  z-index: var(--z-sidebar);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);

  &.collapsed {
    width: var(--sidebar-collapsed-width);
  }
}

.sidebar-logo {
    height: var(--header-height);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 var(--spacing-md);
    background-color: var(--color-darker);
    border-bottom: 1px solid var(--color-border-primary);

    .logo-img {
      width: var(--icon-size-xl);
      height: var(--icon-size-xl);
      margin-right: var(--spacing-sm);
    }

    .logo-mini {
      width: var(--icon-size-xl);
      height: var(--icon-size-xl);
    }

    .logo-title {
      color: var(--color-text-primary);
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
    }
  }

.sidebar-menu {
  flex: 1;
  overflow-x: hidden;

  :deep(.el-menu) {
    border-right: none;
  }

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    height: 50px;
    line-height: 50px;
    font-size: 14px;
  }

  // 默认菜单项样式 (非选中状态)
  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    position: relative;
    border-right: 1px solid var(--color-border-primary);
    transition: $transition-all;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: -1px;
      width: 3px;
      height: 100%;
      background: transparent;
      transition: $transition-all;
      box-shadow: none;
    }

    &:hover {
      background-color: var(--color-bg-secondary);

      &::after {
        background: var(--color-border-secondary);
        box-shadow: 3px 0 6px rgba(0, 0, 0, 0.2);
      }
    }
  }

  // 激活状态的彩色边框
  :deep(.el-menu-item.is-active) {
    background-color: var(--color-primary) !important;
    color: var(--color-surface) !important;
    border-right-color: var(--color-primary);

    &::after {
      background: var(--color-primary);
      box-shadow: 3px 0 8px var(--color-menu-shadow);
    }
  }

  // 子菜单项样式
    :deep(.el-sub-menu .el-menu-item) {
      background-color: var(--color-bg-secondary);
      min-width: var(--sidebar-width);

      &.is-active {
        background-color: var(--color-primary) !important;
        color: var(--color-text-primary) !important;
        border-right-color: var(--color-primary);

        &::after {
          background: var(--color-primary);
          box-shadow: 3px 0 8px rgba(0, 0, 0, 0.3);
        }
      }
    }

  // 每个菜单项的主题色
  :deep(.menu-item-dashboard) {
    &.is-active {
      background-color: var(--color-theme-dashboard) !important;
      border-right-color: var(--color-theme-dashboard);

      &::after {
        background: var(--color-theme-dashboard);
        box-shadow: 3px 0 8px rgba(99, 102, 241, 0.4);
      }
    }

    &:hover::after {
      background: var(--color-theme-dashboard);
      box-shadow: 3px 0 6px rgba(99, 102, 241, 0.3);
    }
  }

  :deep(.menu-item-orders) {
    &.is-active {
      background-color: var(--color-theme-orders) !important;
      border-right-color: var(--color-theme-orders);

      &::after {
        background: var(--color-theme-orders);
        box-shadow: 3px 0 8px rgba(249, 115, 22, 0.4);
      }
    }

    &:hover::after {
      background: var(--color-theme-orders);
      box-shadow: 3px 0 6px rgba(249, 115, 22, 0.3);
    }
  }

  :deep(.menu-item-menu) {
    &.is-active {
      background-color: var(--color-theme-menu) !important;
      border-right-color: var(--color-theme-menu);

      &::after {
        background: var(--color-theme-menu);
        box-shadow: 3px 0 8px rgba(34, 197, 94, 0.4);
      }
    }

    &:hover::after {
      background: var(--color-theme-menu);
      box-shadow: 3px 0 6px rgba(34, 197, 94, 0.3);
    }
  }

  :deep(.menu-item-kitchen) {
    &.is-active {
      background-color: var(--color-theme-kitchen) !important;
      border-right-color: var(--color-theme-kitchen);

      &::after {
        background: var(--color-theme-kitchen);
        box-shadow: 3px 0 8px rgba(239, 68, 68, 0.4);
      }
    }

    &:hover::after {
      background: var(--color-theme-kitchen);
      box-shadow: 3px 0 6px rgba(239, 68, 68, 0.3);
    }
  }

  :deep(.menu-item-analytics) {
    &.is-active {
      background-color: var(--color-theme-analytics) !important;
      border-right-color: var(--color-theme-analytics);

      &::after {
        background: var(--color-theme-analytics);
        box-shadow: 3px 0 8px rgba(168, 85, 247, 0.4);
      }
    }

    &:hover::after {
      background: var(--color-theme-analytics);
      box-shadow: 3px 0 6px rgba(168, 85, 247, 0.3);
    }
  }

  :deep(.menu-item-customer) {
    &.is-active {
      background-color: var(--color-theme-customer) !important;
      border-right-color: var(--color-theme-customer);

      &::after {
        background: var(--color-theme-customer);
        box-shadow: 3px 0 8px rgba(6, 182, 212, 0.4);
      }
    }

    &:hover::after {
      background: var(--color-theme-customer);
      box-shadow: 3px 0 6px rgba(6, 182, 212, 0.3);
    }
  }

  :deep(.menu-item-chain) {
    &.is-active {
      background-color: var(--color-theme-chain) !important;
      border-right-color: var(--color-theme-chain);

      &::after {
        background: var(--color-theme-chain);
        box-shadow: 3px 0 8px rgba(234, 179, 8, 0.4);
      }
    }

    &:hover::after {
      background: var(--color-theme-chain);
      box-shadow: 3px 0 6px rgba(234, 179, 8, 0.3);
    }
  }

  :deep(.menu-item-safety) {
    &.is-active {
      background-color: var(--color-theme-safety) !important;
      border-right-color: var(--color-theme-safety);

      &::after {
        background: var(--color-theme-safety);
        box-shadow: 3px 0 8px rgba(236, 72, 153, 0.4);
      }
    }

    &:hover::after {
      background: var(--color-theme-safety);
      box-shadow: 3px 0 6px rgba(236, 72, 153, 0.3);
    }
  }

  :deep(.menu-item-reports) {
    &.is-active {
      background-color: var(--color-theme-reports) !important;
      border-right-color: var(--color-theme-reports);

      &::after {
        background: var(--color-theme-reports);
        box-shadow: 3px 0 8px rgba(30, 64, 175, 0.4);
      }
    }

    &:hover::after {
      background: var(--color-theme-reports);
      box-shadow: 3px 0 6px rgba(30, 64, 175, 0.3);
    }
  }

  :deep(.menu-item-payment) {
    &.is-active {
      background-color: var(--color-theme-payment) !important;
      border-right-color: var(--color-theme-payment);

      &::after {
        background: var(--color-theme-payment);
        box-shadow: 3px 0 8px rgba(8, 145, 178, 0.4);
      }
    }

    &:hover::after {
      background: var(--color-theme-payment);
      box-shadow: 3px 0 6px rgba(8, 145, 178, 0.3);
    }
  }

  :deep(.menu-item-system) {
    &.is-active {
      background-color: var(--color-theme-system) !important;
      border-right-color: var(--color-theme-system);

      &::after {
        background: var(--color-theme-system);
        box-shadow: 3px 0 8px rgba(71, 85, 105, 0.4);
      }
    }

    &:hover::after {
      background: var(--color-theme-system);
      box-shadow: 3px 0 6px rgba(71, 85, 105, 0.3);
    }
  }
}

.sidebar-toggle {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-bg-secondary);
    border-top: 1px solid var(--color-border-primary);
    cursor: pointer;
    color: var(--color-text-secondary);
    transition: var(--transition-all);
    border-radius: var(--border-radius-sm);

    &:hover {
      color: var(--color-primary);
      background-color: var(--color-bg-tertiary);
    }

    &:focus {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

    .el-icon {
      font-size: var(--font-size-body);
    }
  }

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .app-sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: var(--z-sidebar);

    &.mobile-open {
      transform: translateX(0);
      box-shadow: var(--shadow-lg);
    }

    &.collapsed {
      width: var(--sidebar-width);
      transform: translateX(-100%);
    }
  }

  .sidebar-toggle {
    display: none;
  }
}
</style>