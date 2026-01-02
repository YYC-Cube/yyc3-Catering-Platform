/**
 * YYC³餐饮行业智能化平台 - 员工端路由配置
 */

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 路由懒加载
const Login = () => import('@/views/Login.vue')
const Dashboard = () => import('@/views/Dashboard.vue')
const OrderManagement = () => import('@/views/OrderManagement.vue')
const KitchenDisplay = () => import('@/views/KitchenDisplay.vue')
const ReservationManagement = () => import('@/views/ReservationManagement.vue')
const CustomerService = () => import('@/views/CustomerService.vue')
const Profile = () => import('@/views/Profile.vue')
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
      title: '员工登录',
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
  {
    path: '/orders',
    name: 'OrderManagement',
    component: OrderManagement,
    meta: {
      title: '订单管理',
      requiresAuth: true,
      keepAlive: true,
      icon: 'List'
    }
  },
  {
    path: '/kitchen',
    name: 'KitchenDisplay',
    component: KitchenDisplay,
    meta: {
      title: '厨房显示',
      requiresAuth: true,
      keepAlive: true,
      icon: 'KnifeAndSpoon'
    }
  },
  {
    path: '/reservations',
    name: 'ReservationManagement',
    component: ReservationManagement,
    meta: {
      title: '预约管理',
      requiresAuth: true,
      keepAlive: true,
      icon: 'Calendar'
    }
  },
  {
    path: '/customer-service',
    name: 'CustomerService',
    component: CustomerService,
    meta: {
      title: '客户服务',
      requiresAuth: true,
      keepAlive: true,
      icon: 'Service'
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: {
      title: '个人中心',
      requiresAuth: true,
      keepAlive: false,
      icon: 'User'
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
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - YYC³员工端`
  }

  // 检查登录状态
  const token = localStorage.getItem('staff_token')
  const isAuthenticated = !!token

  if (to.meta?.requiresAuth && !isAuthenticated) {
    // 需要登录但未登录，跳转到登录页
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
  } else if (to.name === 'Login' && isAuthenticated) {
    // 已登录用户访问登录页，跳转到首页
    next({ name: 'Dashboard' })
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