/**
 * YYC³餐饮行业智能化平台 - 管理后台路由配置
 */

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 路由懒加载
const Dashboard = () => import('@/views/Dashboard.vue')
const Login = () => import('@/views/Login.vue')
const MenuManagement = () => import('@/views/MenuManagement.vue')
const OrderManagement = () => import('@/views/OrderManagement.vue')
const KitchenManagement = () => import('@/views/KitchenManagement.vue')
const DataAnalytics = () => import('@/views/DataAnalytics.vue')
const CustomerManagement = () => import('@/views/CustomerManagement.vue')
const PaymentManagement = () => import('@/views/PaymentManagement.vue')
const SystemMonitoring = () => import('@/views/SystemMonitoring.vue')
const InventoryManagement = () => import('@/views/InventoryManagement.vue')
const MemberManagement = () => import('@/views/MemberManagement.vue')
const MarketingManagement = () => import('@/views/MarketingManagement.vue')
const SubscriptionManagement = () => import('@/views/SubscriptionManagement.vue')
const UsageBilling = () => import('@/views/UsageBilling.vue')
const AIAssistantManagement = () => import('@/views/AIAssistantManagement.vue')
const AIDashboard = () => import('@/views/AIDashboard.vue')
const DecisionManagement = () => import('@/views/DecisionManagement.vue')
const KnowledgeGraphManagement = () => import('@/views/KnowledgeGraphManagement.vue')
const LearningEvolutionManagement = () => import('@/views/LearningEvolutionManagement.vue')
const MultiAgentCollaboration = () => import('@/views/MultiAgentCollaboration.vue')
const RobotAgentManagement = () => import('@/views/RobotAgentManagement.vue')
const UIComponentsTest = () => import('@/views/UIComponentsTest.vue')
const NotFound = () => import('@/views/NotFound.vue')

// 路由配置
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录',
      requiresAuth: false,
      keepAlive: false
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      title: '工作台',
      requiresAuth: true,
      keepAlive: true,
      icon: 'House'
    }
  },
  // 订单管理路由
  {
    path: '/orders',
    name: 'OrderManagement',
    component: OrderManagement,
    meta: {
      title: '订单管理',
      requiresAuth: true,
      keepAlive: true,
      icon: 'List',
      permissions: ['order:read']
    }
  },
  {
    path: '/orders/list',
    name: 'OrderList',
    component: OrderManagement,
    meta: {
      title: '订单列表',
      requiresAuth: true,
      keepAlive: true,
      icon: 'List'
    }
  },
  {
    path: '/orders/analysis',
    name: 'OrderAnalysis',
    component: DataAnalytics,
    meta: {
      title: '订单分析',
      requiresAuth: true,
      keepAlive: true,
      icon: 'TrendCharts'
    }
  },
  // 菜单管理路由
  {
    path: '/menu',
    name: 'MenuManagement',
    component: MenuManagement,
    meta: {
      title: '菜单管理',
      requiresAuth: true,
      keepAlive: true,
      icon: 'Food',
      permissions: ['menu:read']
    }
  },
  {
    path: '/menu/items',
    name: 'MenuItems',
    component: MenuManagement,
    meta: {
      title: '菜品管理',
      requiresAuth: true,
      keepAlive: true,
      icon: 'Food'
    }
  },
  {
    path: '/menu/categories',
    name: 'MenuCategories',
    component: MenuManagement,
    meta: {
      title: '分类管理',
      requiresAuth: true,
      keepAlive: true,
      icon: 'Collection'
    }
  },
  {
    path: '/menu/recommendations',
    name: 'MenuRecommendations',
    component: MarketingManagement,
    meta: {
      title: '推荐管理',
      requiresAuth: true,
      keepAlive: true,
      icon: 'Star'
    }
  },
  // 厨房管理路由
  {
    path: '/kitchen',
    name: 'KitchenManagement',
    component: KitchenManagement,
    meta: {
      title: '厨房管理',
      requiresAuth: true,
      keepAlive: true,
      icon: 'Kitchen',
      permissions: ['kitchen:read']
    }
  },
  {
    path: '/kitchen/display',
    name: 'KitchenDisplay',
    component: KitchenManagement,
    meta: {
      title: '厨房显示',
      requiresAuth: true,
      keepAlive: true,
      icon: 'Monitor'
    }
  },
  {
    path: '/kitchen/efficiency',
    name: 'KitchenEfficiency',
    component: SystemMonitoring,
    meta: {
      title: '效率分析',
      requiresAuth: true,
      keepAlive: true,
      icon: 'TrendCharts'
    }
  },
  // 数据分析路由
  {
    path: '/analytics',
    name: 'DataAnalytics',
    component: DataAnalytics,
    meta: {
      title: '数据分析',
      requiresAuth: true,
      keepAlive: true,
      icon: 'TrendCharts',
      permissions: ['analytics:read']
    }
  },
  // 客户管理路由
  {
    path: '/customers/list',
    name: 'CustomerList',
    component: CustomerManagement,
    meta: {
      title: '客户列表',
      requiresAuth: true,
      keepAlive: true,
      icon: 'User'
    }
  },
  {
    path: '/customers/analysis',
    name: 'CustomerAnalysis',
    component: CustomerManagement,
    meta: {
      title: '客户分析',
      requiresAuth: true,
      keepAlive: true,
      icon: 'DataAnalysis'
    }
  },
  // 连锁管理路由
  {
    path: '/chain/stores',
    name: 'ChainStores',
    component: SystemMonitoring,
    meta: {
      title: '门店管理',
      requiresAuth: true,
      keepAlive: true,
      icon: 'Shop'
    }
  },
  {
    path: '/chain/operations',
    name: 'ChainOperations',
    component: SystemMonitoring,
    meta: {
      title: '运营管理',
      requiresAuth: true,
      keepAlive: true,
      icon: 'Operation'
    }
  },
  {
    path: '/chain/performance',
    name: 'ChainPerformance',
    component: DataAnalytics,
    meta: {
      title: '绩效分析',
      requiresAuth: true,
      keepAlive: true,
      icon: 'TrendCharts'
    }
  },
  // 食品安全管理路由
  {
    path: '/safety/traceability',
    name: 'SafetyTraceability',
    component: SystemMonitoring,
    meta: {
      title: '食品溯源',
      requiresAuth: true,
      keepAlive: true,
      icon: 'Shield'
    }
  },
  {
    path: '/safety/checks',
    name: 'SafetyChecks',
    component: SystemMonitoring,
    meta: {
      title: '安全检查',
      requiresAuth: true,
      keepAlive: true,
      icon: 'Check'
    }
  },
  // 报表管理路由
  {
    path: '/reports/sales',
    name: 'ReportsSales',
    component: DataAnalytics,
    meta: {
      title: '销售报表',
      requiresAuth: true,
      keepAlive: true,
      icon: 'Document'
    }
  },
  {
    path: '/reports/finance',
    name: 'ReportsFinance',
    component: UsageBilling,
    meta: {
      title: '财务报表',
      requiresAuth: true,
      keepAlive: true,
      icon: 'Coin'
    }
  },
  {
    path: '/reports/operations',
    name: 'ReportsOperations',
    component: DataAnalytics,
    meta: {
      title: '运营报表',
      requiresAuth: true,
      keepAlive: true,
      icon: 'DataBoard'
    }
  },
  // 支付管理路由
  {
    path: '/payment/config',
    name: 'PaymentConfig',
    component: PaymentManagement,
    meta: {
      title: '支付配置',
      requiresAuth: true,
      keepAlive: true,
      icon: 'Setting'
    }
  },
  {
    path: '/payment/transactions',
    name: 'PaymentTransactions',
    component: PaymentManagement,
    meta: {
      title: '交易记录',
      requiresAuth: true,
      keepAlive: true,
      icon: 'List'
    }
  },
  {
    path: '/payment/refunds',
    name: 'PaymentRefunds',
    component: PaymentManagement,
    meta: {
      title: '退款管理',
      requiresAuth: true,
      keepAlive: true,
      icon: 'RefreshLeft'
    }
  },
  // 系统管理路由
  {
    path: '/system/users',
    name: 'SystemUsers',
    component: SystemMonitoring,
    meta: {
      title: '用户管理',
      requiresAuth: true,
      keepAlive: true,
      icon: 'User'
    }
  },
  {
    path: '/system/roles',
    name: 'SystemRoles',
    component: SystemMonitoring,
    meta: {
      title: '角色管理',
      requiresAuth: true,
      keepAlive: true,
      icon: 'UserFilled'
    }
  },
  {
    path: '/system/settings',
    name: 'SystemSettings',
    component: SystemMonitoring,
    meta: {
      title: '系统设置',
      requiresAuth: true,
      keepAlive: true,
      icon: 'Tools'
    }
  },
  // AI功能路由
  {
    path: '/ai/dashboard',
    name: 'AIDashboard',
    component: AIDashboard,
    meta: {
      title: 'AI工作台',
      requiresAuth: true,
      keepAlive: true,
      icon: 'MagicStick'
    }
  },
  {
    path: '/ai/assistant',
    name: 'AIAssistant',
    component: AIAssistantManagement,
    meta: {
      title: 'AI助手',
      requiresAuth: true,
      keepAlive: true,
      icon: 'ChatDotRound'
    }
  },
  {
    path: '/ai/decision',
    name: 'DecisionManagement',
    component: DecisionManagement,
    meta: {
      title: '决策管理',
      requiresAuth: true,
      keepAlive: true,
      icon: 'Promotion'
    }
  },
  {
    path: '/ai/knowledge',
    name: 'KnowledgeGraph',
    component: KnowledgeGraphManagement,
    meta: {
      title: '知识图谱',
      requiresAuth: true,
      keepAlive: true,
      icon: 'Connection'
    }
  },
  {
    path: '/ai/learning',
    name: 'LearningEvolution',
    component: LearningEvolutionManagement,
    meta: {
      title: '学习进化',
      requiresAuth: true,
      keepAlive: true,
      icon: 'TrendCharts'
    }
  },
  {
    path: '/ai/collaboration',
    name: 'MultiAgentCollaboration',
    component: MultiAgentCollaboration,
    meta: {
      title: '多智能体协作',
      requiresAuth: true,
      keepAlive: true,
      icon: 'ConnectionBoard'
    }
  },
  {
    path: '/ai/robot',
    name: 'RobotAgent',
    component: RobotAgentManagement,
    meta: {
      title: '机器人代理',
      requiresAuth: true,
      keepAlive: true,
      icon: 'Robot'
    }
  },
  // 其他功能路由
  {
    path: '/inventory',
    name: 'InventoryManagement',
    component: InventoryManagement,
    meta: {
      title: '库存管理',
      requiresAuth: true,
      keepAlive: true,
      icon: 'Box'
    }
  },
  {
    path: '/members',
    name: 'MemberManagement',
    component: MemberManagement,
    meta: {
      title: '会员管理',
      requiresAuth: true,
      keepAlive: true,
      icon: 'Avatar'
    }
  },
  {
    path: '/marketing',
    name: 'MarketingManagement',
    component: MarketingManagement,
    meta: {
      title: '营销管理',
      requiresAuth: true,
      keepAlive: true,
      icon: 'Bullhorn'
    }
  },
  {
    path: '/subscription',
    name: 'SubscriptionManagement',
    component: SubscriptionManagement,
    meta: {
      title: '订阅管理',
      requiresAuth: true,
      keepAlive: true,
      icon: 'CreditCard'
    }
  },
  {
    path: '/billing',
    name: 'UsageBilling',
    component: UsageBilling,
    meta: {
      title: '使用计费',
      requiresAuth: true,
      keepAlive: true,
      icon: 'Wallet'
    }
  },
  {
    path: '/ui-components-test',
    name: 'UIComponentsTest',
    component: UIComponentsTest,
    meta: {
      title: 'UI组件测试',
      requiresAuth: true,
      keepAlive: false,
      icon: 'View'
    }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: '页面不存在',
      requiresAuth: false,
      keepAlive: false
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory((import.meta as any).env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 全局前置守卫
router.beforeEach(async (to, _from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - YYC³管理后台`
  }

  // 临时禁用认证检查，方便开发调试
  if (to.path === '/login' && false) {
    next()
  } else {
    next()
  }
})

// 全局后置钩子
router.afterEach((to, from) => {
  // 路由切换完成后的处理
  console.log(`Route changed: ${from.path} -> ${to.path}`)
})

// 路由错误处理
router.onError((error) => {
  console.error('Router error:', error)
})

export default router