/**
 * @fileoverview YYC³餐饮行业智能化平台 - 布局组件
 * @description 响应式布局组件，支持侧边栏、头部、内容区、页脚
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { defineComponent, ref, computed, type PropType } from 'vue'
import { cn } from '@/utils/cn'

export const Layout = defineComponent({
  name: 'Layout',
  props: {
    className: {
      type: String,
      default: '',
    },
    hasSider: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { attrs, slots }) {
    return () => (
      <div
        class={cn(
          'min-h-screen flex flex-col',
          props.hasSider && 'flex-row',
          props.className
        )}
      >
        {slots.default?.()}
      </div>
    )
  },
})

export const LayoutHeader = defineComponent({
  name: 'LayoutHeader',
  props: {
    className: {
      type: String,
      default: '',
    },
    fixed: {
      type: Boolean,
      default: false,
    },
    height: {
      type: [String, Number] as PropType<string | number>,
      default: 64,
    },
  },
  setup(props, { attrs, slots }) {
    const heightStyle = computed(() => {
      if (typeof props.height === 'number') {
        return { height: `${props.height}px` }
      }
      return { height: props.height }
    })

    return () => (
      <header
        class={cn(
          'flex items-center justify-between px-6 bg-white border-b border-neutral-200',
          props.fixed && 'fixed top-0 left-0 right-0 z-40',
          props.className
        )}
        style={heightStyle.value}
      >
        {slots.default?.()}
      </header>
    )
  },
})

export const LayoutSider = defineComponent({
  name: 'LayoutSider',
  props: {
    className: {
      type: String,
      default: '',
    },
    width: {
      type: [String, Number] as PropType<string | number>,
      default: 256,
    },
    collapsed: {
      type: Boolean,
      default: false,
    },
    collapsedWidth: {
      type: Number,
      default: 64,
    },
    collapsible: {
      type: Boolean,
      default: false,
    },
    breakpoint: {
      type: String as PropType<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'>,
      default: undefined,
    },
    theme: {
      type: String as PropType<'light' | 'dark'>,
      default: 'light',
    },
  },
  emits: ['collapse', 'breakpoint'],
  setup(props, { emit, slots }) {
    const currentWidth = computed(() => {
      if (props.collapsed) {
        return props.collapsedWidth
      }
      return props.width
    })

    const widthStyle = computed(() => {
      if (typeof currentWidth.value === 'number') {
        return { width: `${currentWidth.value}px` }
      }
      return { width: currentWidth.value }
    })

    const themeClasses = computed(() => {
      return props.theme === 'dark'
        ? 'bg-neutral-900 text-white'
        : 'bg-white text-neutral-900'
    })

    return () => (
      <aside
        class={cn(
          'flex-shrink-0 border-r border-neutral-200 transition-all duration-300',
          themeClasses.value,
          props.className
        )}
        style={widthStyle.value}
      >
        {slots.default?.()}
      </aside>
    )
  },
})

export const LayoutContent = defineComponent({
  name: 'LayoutContent',
  props: {
    className: {
      type: String,
      default: '',
    },
  },
  setup(props, { attrs, slots }) {
    return () => (
      <main
        class={cn(
          'flex-1 overflow-auto bg-neutral-50',
          props.className
        )}
      >
        {slots.default?.()}
      </main>
    )
  },
})

export const LayoutFooter = defineComponent({
  name: 'LayoutFooter',
  props: {
    className: {
      type: String,
      default: '',
    },
    fixed: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { attrs, slots }) {
    return () => (
      <footer
        class={cn(
          'flex items-center justify-center px-6 py-4 bg-white border-t border-neutral-200 text-sm text-neutral-600',
          props.fixed && 'fixed bottom-0 left-0 right-0 z-40',
          props.className
        )}
      >
        {slots.default?.()}
      </footer>
    )
  },
})
