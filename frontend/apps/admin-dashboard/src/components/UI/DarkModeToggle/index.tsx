/**
 * @fileoverview YYC³餐饮行业智能化平台 - 深色模式切换组件
 * @description 深色模式切换按钮组件
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { defineComponent, computed, type PropType } from 'vue'
import { useTheme } from './ThemeProvider'
import { Moon, Sun, Monitor } from 'lucide-vue-next'
import { cn } from '@/utils/cn'

export const DarkModeToggle = defineComponent({
  name: 'DarkModeToggle',
  props: {
    size: {
      type: String as PropType<'sm' | 'md' | 'lg'>,
      default: 'md',
    },
    showLabel: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const theme = useTheme()

    const sizeClasses = computed(() => {
      switch (props.size) {
        case 'sm':
          return 'w-8 h-8'
        case 'lg':
          return 'w-12 h-12'
        default:
          return 'w-10 h-10'
      }
    })

    const iconSize = computed(() => {
      switch (props.size) {
        case 'sm':
          return 16
        case 'lg':
          return 24
        default:
          return 20
      }
    })

    const currentIcon = computed(() => {
      if (theme.themeMode.value === 'dark') {
        return Moon
      } else if (theme.themeMode.value === 'auto') {
        return Monitor
      } else {
        return Sun
      }
    })

    const toggleTheme = () => {
      if (theme.themeMode.value === 'light') {
        theme.setThemeMode('dark')
      } else if (theme.themeMode.value === 'dark') {
        theme.setThemeMode('auto')
      } else {
        theme.setThemeMode('light')
      }
    }

    return () => (
      <button
        onClick={toggleTheme}
        class={cn(
          'inline-flex items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500',
          sizeClasses.value
        )}
        title={theme.themeMode.value === 'dark' ? '深色模式' : theme.themeMode.value === 'auto' ? '跟随系统' : '浅色模式'}
      >
        <currentIcon.value size={iconSize.value} />
        {props.showLabel && (
          <span class="ml-2 text-sm font-medium">
            {theme.themeMode.value === 'dark' ? '深色' : theme.themeMode.value === 'auto' ? '自动' : '浅色'}
          </span>
        )}
      </button>
    )
  },
})
