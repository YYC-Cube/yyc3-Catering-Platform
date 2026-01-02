/**
 * YYC³餐饮行业智能化平台 - 国际化配置
 */

import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'
import jaJP from './ja-JP'

// 获取浏览器语言
const getBrowserLanguage = (): string => {
  if (typeof navigator === 'undefined') return 'zh-CN'

  const browserLang = navigator.language || navigator.languages?.[0]

  if (browserLang) {
    // 映射浏览器语言到支持的语言
    const langMap: Record<string, string> = {
      'zh': 'zh-CN',
      'zh-cn': 'zh-CN',
      'zh-CN': 'zh-CN',
      'zh-tw': 'zh-CN',
      'zh-hk': 'zh-CN',
      'en': 'en-US',
      'en-us': 'en-US',
      'en-US': 'en-US',
      'en-gb': 'en-US',
      'ja': 'ja-JP',
      'ja-jp': 'ja-JP',
      'ja-JP': 'ja-JP'
    }

    return langMap[browserLang.toLowerCase()] || 'zh-CN'
  }

  return 'zh-CN'
}

// 获取存储的语言偏好
const getStoredLanguage = (): string => {
  if (typeof localStorage === 'undefined') return 'zh-CN'
  return localStorage.getItem('language') || 'zh-CN'
}

// 创建i18n实例
const i18n = createI18n({
  legacy: false,
  locale: getStoredLanguage(),
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
    'ja-JP': jaJP
  },
  globalInjection: true,
  silentTranslationWarn: true,
  silentFallbackWarn: true,
  silentWarn: process.env.NODE_ENV === 'production'
})

// 支持的语言列表
export const supportedLanguages = [
  {
    code: 'zh-CN',
    name: '简体中文',
    englishName: 'Chinese (Simplified)',
    flag: '🇨🇳',
    rtl: false
  },
  {
    code: 'en-US',
    name: 'English',
    englishName: 'English (US)',
    flag: '🇺🇸',
    rtl: false
  },
  {
    code: 'ja-JP',
    name: '日本語',
    englishName: 'Japanese',
    flag: '🇯🇵',
    rtl: false
  }
]

// 设置语言
export const setLanguage = (lang: string): void => {
  if (!supportedLanguages.find(l => l.code === lang)) {
    console.warn(`Unsupported language: ${lang}`)
    return
  }

  // 设置i18n语言
  i18n.global.locale.value = lang

  // 存储语言偏好
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('language', lang)
  }

  // 设置HTML语言属性
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang
    document.documentElement.dir =
      supportedLanguages.find(l => l.code === lang)?.rtl ? 'rtl' : 'ltr'
  }

  // 更新Element Plus的语言
  import('element-plus/dist/locale/index').then(({ default: elementLocale }) => {
    const localeMap: Record<string, any> = {
      'zh-CN': elementLocale.zhCn,
      'en-US': elementLocale.en,
      'ja-JP': elementLocale.ja
    }

    if (localeMap[lang]) {
      // 这里可以设置Element Plus的语言
      console.log(`Element Plus locale set to: ${lang}`)
    }
  })
}

// 获取当前语言
export const getCurrentLanguage = (): string => {
  return i18n.global.locale.value
}

// 自动检测并设置语言
export const autoDetectLanguage = (): void => {
  const storedLang = getStoredLanguage()
  const browserLang = getBrowserLanguage()

  // 优先使用存储的语言，其次是浏览器语言
  const finalLang = storedLang || browserLang

  if (finalLang !== getCurrentLanguage()) {
    setLanguage(finalLang)
  }
}

// 获取语言显示名称
export const getLanguageDisplayName = (code: string, useEnglish = false): string => {
  const language = supportedLanguages.find(l => l.code === code)
  if (!language) return code

  return useEnglish ? language.englishName : language.name
}

// 格式化数字
export const formatNumber = (
  value: number,
  options: Intl.NumberFormatOptions = {}
): string => {
  try {
    return new Intl.NumberFormat(getCurrentLanguage().replace('-', '-'), options).format(value)
  } catch {
    return value.toString()
  }
}

// 格式化货币
export const formatCurrency = (
  value: number,
  currency = 'CNY',
  options: Intl.NumberFormatOptions = {}
): string => {
  return formatNumber(value, {
    style: 'currency',
    currency,
    ...options
  })
}

// 格式化百分比
export const formatPercentage = (
  value: number,
  options: Intl.NumberFormatOptions = {}
): string => {
  return formatNumber(value, {
    style: 'percent',
    ...options
  })
}

// 格式化日期
export const formatDate = (
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date

  try {
    return new Intl.DateTimeFormat(getCurrentLanguage().replace('-', '-'), {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      ...options
    }).format(dateObj)
  } catch {
    return dateObj.toLocaleDateString()
  }
}

// 格式化时间
export const formatTime = (
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date

  try {
    return new Intl.DateTimeFormat(getCurrentLanguage().replace('-', '-'), {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      ...options
    }).format(dateObj)
  } catch {
    return dateObj.toLocaleTimeString()
  }
}

// 格式化日期时间
export const formatDateTime = (
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  return formatDate(date, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    ...options
  })
}

// 相对时间格式化
export const formatRelativeTime = (date: Date | string | number): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date

  const now = new Date()
  const diff = now.getTime() - dateObj.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(months / 12)

  const rtf = new Intl.RelativeTimeFormat(getCurrentLanguage().replace('-', '-'))

  if (years > 0) return rtf.format(-years, 'year')
  if (months > 0) return rtf.format(-months, 'month')
  if (days > 0) return rtf.format(-days, 'day')
  if (hours > 0) return rtf.format(-hours, 'hour')
  if (minutes > 0) return rtf.format(-minutes, 'minute')
  if (seconds > 0) return rtf.format(-seconds, 'second')

  return i18n.global.t('common.justNow')
}

// 文件大小格式化
export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

// 复数形式处理
export const pluralize = (
  count: number,
  singular: string,
  plural?: string
): string => {
  if (count === 1) return singular
  return plural || singular + 's'
}

// 导出i18n实例
export { i18n }

export default i18n