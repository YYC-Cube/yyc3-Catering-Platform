/**
 * @fileoverview YYC³餐饮行业智能化平台 - 卡片组件
 * @description 统一的卡片组件，支持多种布局和样式
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { defineComponent, computed, type PropType } from 'vue'
import { cn } from '@/utils/cn'

export const Card = defineComponent({
  name: 'Card',
  props: {
    hoverable: {
      type: Boolean,
      default: false,
    },
    bordered: {
      type: Boolean,
      default: true,
    },
    shadow: {
      type: String as PropType<'none' | 'sm' | 'md' | 'lg' | 'xl'>,
      default: 'md',
      validator: (value: string) => ['none', 'sm', 'md', 'lg', 'xl'].includes(value),
    },
    padding: {
      type: String as PropType<'none' | 'sm' | 'md' | 'lg'>,
      default: 'md',
      validator: (value: string) => ['none', 'sm', 'md', 'lg'].includes(value),
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { attrs, slots }) {
    const shadowClasses = computed(() => {
      switch (props.shadow) {
        case 'none':
          return ''
        case 'sm':
          return 'shadow-sm'
        case 'lg':
          return 'shadow-lg'
        case 'xl':
          return 'shadow-xl'
        default:
          return 'shadow-md'
      }
    })

    const paddingClasses = computed(() => {
      switch (props.padding) {
        case 'none':
          return 'p-0'
        case 'sm':
          return 'p-4'
        case 'lg':
          return 'p-8'
        default:
          return 'p-6'
      }
    })

    const borderedClasses = computed(() => {
      if (props.bordered) {
        return 'border border-neutral-200'
      }
      return ''
    })

    const hoverableClasses = computed(() => {
      if (props.hoverable) {
        return 'hover:shadow-lg transition-shadow duration-200 cursor-pointer'
      }
      return ''
    })

    return () => (
      <div
        class={cn(
          'bg-white rounded-lg',
          shadowClasses.value,
          paddingClasses.value,
          borderedClasses.value,
          hoverableClasses.value,
          attrs.class as string
        )}
      >
        {props.loading ? (
          <div class="flex items-center justify-center h-32">
            <svg class="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          slots.default?.()
        )}
      </div>
    )
  },
})

export const CardHeader = defineComponent({
  name: 'CardHeader',
  props: {
    divider: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { attrs, slots }) {
    const dividerClasses = computed(() => {
      if (props.divider) {
        return 'border-b border-neutral-200 pb-4 mb-4'
      }
      return 'mb-4'
    })

    return () => (
      <div
        class={cn(
          'flex items-start justify-between',
          dividerClasses.value,
          attrs.class as string
        )}
      >
        {slots.default?.()}
      </div>
    )
  },
})

export const CardTitle = defineComponent({
  name: 'CardTitle',
  props: {
    level: {
      type: Number as PropType<1 | 2 | 3 | 4 | 5 | 6>,
      default: 3,
      validator: (value: number) => [1, 2, 3, 4, 5, 6].includes(value),
    },
  },
  setup(props, { attrs, slots }) {
    const Tag = `h${props.level}` as const

    return () => (
      <Tag
        class={cn(
          'font-semibold text-neutral-900',
          props.level === 1 && 'text-2xl',
          props.level === 2 && 'text-xl',
          props.level === 3 && 'text-lg',
          props.level === 4 && 'text-base',
          props.level === 5 && 'text-sm',
          props.level === 6 && 'text-xs',
          attrs.class as string
        )}
      >
        {slots.default?.()}
      </Tag>
    )
  },
})

export const CardDescription = defineComponent({
  name: 'CardDescription',
  setup(props, { attrs, slots }) {
    return () => (
      <p
        class={cn(
          'text-sm text-neutral-600 mt-1',
          attrs.class as string
        )}
      >
        {slots.default?.()}
      </p>
    )
  },
})

export const CardAction = defineComponent({
  name: 'CardAction',
  setup(props, { attrs, slots }) {
    return () => (
      <div
        class={cn(
          'flex items-center gap-2',
          attrs.class as string
        )}
      >
        {slots.default?.()}
      </div>
    )
  },
})

export const CardContent = defineComponent({
  name: 'CardContent',
  setup(props, { attrs, slots }) {
    return () => (
      <div
        class={cn(
          'flex-1',
          attrs.class as string
        )}
      >
        {slots.default?.()}
      </div>
    )
  },
})

export const CardFooter = defineComponent({
  name: 'CardFooter',
  props: {
    divider: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { attrs, slots }) {
    const dividerClasses = computed(() => {
      if (props.divider) {
        return 'border-t border-neutral-200 pt-4 mt-4'
      }
      return 'mt-4'
    })

    return () => (
      <div
        class={cn(
          'flex items-center justify-end gap-2',
          dividerClasses.value,
          attrs.class as string
        )}
      >
        {slots.default?.()}
      </div>
    )
  },
})
