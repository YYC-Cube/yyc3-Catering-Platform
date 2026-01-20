/**
 * @fileoverview YYC³餐饮行业智能化平台 - 主题提供者组件
 * @description 主题系统的核心组件，提供主题上下文
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { defineComponent, provide, inject, ref, computed, watch, onMounted, type PropType } from 'vue'
import { themeConfig } from '@/config/theme'
import type { Theme, ThemeMode } from '@/types/theme'

const THEME_KEY = Symbol('theme')

export const useTheme = () => {
  const theme = inject(THEME_KEY)
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return theme
}

export const ThemeProvider = defineComponent({
  name: 'ThemeProvider',
  props: {
    defaultTheme: {
      type: String as PropType<string>,
      default: themeConfig.defaultTheme,
    },
    enableDarkMode: {
      type: Boolean,
      default: themeConfig.enableDarkMode,
    },
    enableSystemTheme: {
      type: Boolean,
      default: themeConfig.enableSystemTheme,
    },
    persistTheme: {
      type: Boolean,
      default: themeConfig.persistTheme,
    },
  },
  setup(props, { slots }) {
    const currentThemeId = ref(props.defaultTheme)
    const themeMode = ref<ThemeMode>('light')
    const themes = ref<Theme[]>(themeConfig.themes)

    const currentTheme = computed(() => {
      return themes.value.find(theme => theme.id === currentThemeId.value) || themes.value[0]
    })

    const isDark = computed(() => {
      return themeMode.value === 'dark' || (themeMode.value === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    })

    const setTheme = (themeId: string) => {
      currentThemeId.value = themeId
      const theme = themes.value.find(t => t.id === themeId)
      if (theme) {
        themeMode.value = theme.mode
      }
    }

    const setThemeMode = (mode: ThemeMode) => {
      themeMode.value = mode
    }

    const toggleDarkMode = () => {
      if (themeMode.value === 'dark') {
        themeMode.value = 'light'
      } else {
        themeMode.value = 'dark'
      }
    }

    const applyTheme = () => {
      const root = document.documentElement
      
      if (isDark.value) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }

      if (props.persistTheme) {
        localStorage.setItem(themeConfig.themeStorageKey, JSON.stringify({
          themeId: currentThemeId.value,
          mode: themeMode.value,
        }))
      }
    }

    const loadTheme = () => {
      if (props.persistTheme) {
        const saved = localStorage.getItem(themeConfig.themeStorageKey)
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            currentThemeId.value = parsed.themeId || props.defaultTheme
            themeMode.value = parsed.mode || 'light'
          } catch (error) {
            console.error('Failed to load theme:', error)
          }
        }
      }
    }

    watch([currentThemeId, themeMode], applyTheme, { immediate: true })

    onMounted(() => {
      loadTheme()
      
      if (props.enableSystemTheme) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = () => {
          if (themeMode.value === 'auto') {
            applyTheme()
          }
        }
        mediaQuery.addEventListener('change', handleChange)
      }
    })

    provide(THEME_KEY, {
      currentTheme,
      currentThemeId,
      themeMode,
      themes,
      isDark,
      setTheme,
      setThemeMode,
      toggleDarkMode,
    })

    return () => slots.default?.()
  },
})
