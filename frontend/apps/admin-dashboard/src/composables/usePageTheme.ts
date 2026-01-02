/**
 * YYC³餐饮管理系统 - 页面主题色系统
 * 根据当前路由动态应用对应的主题色
 */

import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

// 菜单主题色映射
const MENU_THEME_MAP = {
  '/dashboard': 'var(--color-theme-dashboard)',
  '/orders': 'var(--color-theme-orders)',
  '/orders/list': 'var(--color-theme-orders)',
  '/orders/analysis': 'var(--color-theme-orders)',
  '/menu': 'var(--color-theme-menu)',
  '/menu/items': 'var(--color-theme-menu)',
  '/menu/categories': 'var(--color-theme-menu)',
  '/menu/recommendations': 'var(--color-theme-menu)',
  '/kitchen': 'var(--color-theme-kitchen)',
  '/kitchen/display': 'var(--color-theme-kitchen)',
  '/kitchen/efficiency': 'var(--color-theme-kitchen)',
  '/analytics': 'var(--color-theme-analytics)',
  '/customers': 'var(--color-theme-customer)',
  '/customers/list': 'var(--color-theme-customer)',
  '/customers/analysis': 'var(--color-theme-customer)',
  '/chain': 'var(--color-theme-chain)',
  '/chain/stores': 'var(--color-theme-chain)',
  '/chain/operations': 'var(--color-theme-chain)',
  '/chain/performance': 'var(--color-theme-chain)',
  '/safety': 'var(--color-theme-safety)',
  '/safety/traceability': 'var(--color-theme-safety)',
  '/safety/checks': 'var(--color-theme-safety)',
  '/reports': 'var(--color-theme-reports)',
  '/reports/sales': 'var(--color-theme-reports)',
  '/reports/finance': 'var(--color-theme-reports)',
  '/reports/operations': 'var(--color-theme-reports)',
  '/payment': 'var(--color-theme-payment)',
  '/payment/config': 'var(--color-theme-payment)',
  '/payment/transactions': 'var(--color-theme-payment)',
  '/payment/refunds': 'var(--color-theme-payment)',
  '/system': 'var(--color-theme-system)',
  '/system/users': 'var(--color-theme-system)',
  '/system/roles': 'var(--color-theme-system)',
  '/system/settings': 'var(--color-theme-system)',

  // AI功能路由 - 使用特殊颜色
  '/ai/dashboard': 'var(--color-secondary)',
  '/ai/assistant': 'var(--color-secondary)',
  '/ai/decision': 'var(--color-secondary)',
  '/ai/knowledge': 'var(--color-secondary)',
  '/ai/learning': 'var(--color-secondary)',
  '/ai/collaboration': 'var(--color-secondary)',
  '/ai/robot': 'var(--color-secondary)',

  // 其他功能路由
  '/inventory': 'var(--color-warning)',
  '/members': 'var(--color-success)',
  '/marketing': 'var(--color-secondary)',
  '/subscription': 'var(--color-primary)',
  '/billing': 'var(--color-danger)'
}

// 菜单名称映射
const MENU_NAME_MAP = {
  '/dashboard': '工作台',
  '/orders': '订单管理',
  '/menu': '菜单管理',
  '/kitchen': '厨房管理',
  '/analytics': '数据分析',
  '/customers': '客户管理',
  '/chain': '连锁管理',
  '/safety': '食品安全',
  '/reports': '报表分析',
  '/payment': '支付管理',
  '/system': '系统管理',

  // AI功能菜单
  '/ai/dashboard': 'AI工作台',
  '/ai/assistant': 'AI助手',
  '/ai/decision': '决策管理',
  '/ai/knowledge': '知识图谱',
  '/ai/learning': '学习进化',
  '/ai/collaboration': '多智能体协作',
  '/ai/robot': '机器人代理',

  // 其他功能菜单
  '/inventory': '库存管理',
  '/members': '会员管理',
  '/marketing': '营销管理',
  '/subscription': '订阅管理',
  '/billing': '使用计费'
}

export function usePageTheme() {
  const route = useRoute()
  const currentThemeColor = ref('var(--color-primary)')
  const currentThemeName = ref('')

  // 根据路由获取主题色
  const getThemeColor = (path: string): string => {
    // 精确匹配
    if (MENU_THEME_MAP[path as keyof typeof MENU_THEME_MAP]) {
      return MENU_THEME_MAP[path as keyof typeof MENU_THEME_MAP]
    }

    // 模糊匹配 - 查找最匹配的路径
    for (const [key, value] of Object.entries(MENU_THEME_MAP)) {
      if (path.startsWith(key)) {
        return value
      }
    }

    return 'var(--color-primary)' // 默认主题色
  }

  // 根据路由获取菜单名称
  const getThemeName = (path: string): string => {
    // 精确匹配
    if (MENU_NAME_MAP[path as keyof typeof MENU_NAME_MAP]) {
      return MENU_NAME_MAP[path as keyof typeof MENU_NAME_MAP]
    }

    // 模糊匹配 - 查找最匹配的路径
    for (const [key, value] of Object.entries(MENU_NAME_MAP)) {
      if (path.startsWith(key)) {
        return value
      }
    }

    return 'YYC³管理后台' // 默认名称
  }

  // 应用主题色到页面
  const applyThemeToPage = (color: string) => {
    // 设置CSS变量
    document.documentElement.style.setProperty('--page-theme-color', color)

    // 设置meta标签颜色（移动端地址栏）
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      // 将CSS颜色值转换为十六进制
      const hexColor = color.includes('var(--') ? '#4F46E5' : color
      metaThemeColor.setAttribute('content', hexColor)
    }
  }

  // 计算属性
  const pageThemeColor = computed(() => currentThemeColor.value)
  const pageThemeName = computed(() => currentThemeName.value)

  // 监听路由变化
  watch(
    () => route.path,
    (newPath) => {
      const themeColor = getThemeColor(newPath)
      const themeName = getThemeName(newPath)

      currentThemeColor.value = themeColor
      currentThemeName.value = themeName

      applyThemeToPage(themeColor)
    },
    { immediate: true }
  )

  // 获取当前主题色的RGB值（用于阴影等效果）
  const getThemeColorRgb = (color: string): { r: number; g: number; b: number } => {
    // 如果是CSS变量，返回默认值
    if (color.includes('var(--')) {
      return { r: 79, g: 70, b: 229 } // --color-primary的RGB值
    }

    // 移除#号
    const hex = color.replace('#', '')

    // 解析RGB值
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)

    return { r, g, b }
  }

  // 生成主题色的阴影
  const getThemeShadow = (color: string, intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    const rgb = getThemeColorRgb(color)
    const { r, g, b } = rgb

    const shadows = {
      light: `rgba(${r}, ${g}, ${b}, 0.15)`,
      medium: `rgba(${r}, ${g}, ${b}, 0.25)`,
      heavy: `rgba(${r}, ${g}, ${b}, 0.35)`
    }

    return {
      color: `rgba(${r}, ${g}, ${b}, 1)`,
      shadow: shadows[intensity]
    }
  }

  return {
    pageThemeColor,
    pageThemeName,
    currentThemeColor,
    currentThemeName,
    getThemeColor,
    getThemeName,
    getThemeColorRgb,
    getThemeShadow,
    applyThemeToPage
  }
}

// CSS工具类生成器
export function generateThemeClasses() {
  return `
    .page-theme-bg { background-color: var(--page-theme-color) !important; }
    .page-theme-text { color: var(--page-theme-color) !important; }
    .page-theme-border { border-color: var(--page-theme-color) !important; }

    .page-theme-btn {
      background-color: var(--page-theme-color) !important;
      border-color: var(--page-theme-color) !important;
      color: #FFFFFF !important;

      &:hover {
        filter: brightness(1.1);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px var(--page-theme-shadow);
      }
    }

    .page-theme-card {
      border-left: 4px solid var(--page-theme-color) !important;
      box-shadow: 0 2px 8px var(--page-theme-shadow);
    }

    .page-theme-outline {
      border: 2px solid var(--page-theme-color) !important;
      color: var(--page-theme-color) !important;
      background-color: transparent !important;

      &:hover {
        background-color: var(--page-theme-color) !important;
        color: #FFFFFF !important;
      }
    }

    .page-theme-input:focus {
      border-color: var(--page-theme-color) !important;
      box-shadow: 0 0 0 2px var(--page-theme-shadow) !important;
    }
  `
}