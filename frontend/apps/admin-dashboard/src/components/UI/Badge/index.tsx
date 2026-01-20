/**
 * @fileoverview YYC³餐饮行业智能化平台 - 徽章组件
 * @description 统一的徽章组件，支持多种样式和尺寸
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { defineComponent, computed, type PropType } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 transition-[color,box-shadow] overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
        secondary:
          'border-transparent bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
        success:
          'border-transparent bg-success-600 text-white hover:bg-success-700 focus:ring-success-500',
        warning:
          'border-transparent bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500',
        danger:
          'border-transparent bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500',
        outline:
          'border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
        ghost:
          'bg-transparent text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      rounded: 'md',
    },
  }
)

type BadgeVariants = VariantProps<typeof badgeVariants>

export const Badge = defineComponent({
  name: 'Badge',
  props: {
    variant: {
      type: String as PropType<BadgeVariants['variant']>,
      default: 'default',
      validator: (value: string) => {
        return ['default', 'secondary', 'success', 'warning', 'danger', 'outline', 'ghost'].includes(value)
      },
    },
    size: {
      type: String as PropType<BadgeVariants['size']>,
      default: 'md',
      validator: (value: string) => {
        return ['sm', 'md', 'lg'].includes(value)
      },
    },
    rounded: {
      type: String as PropType<BadgeVariants['rounded']>,
      default: 'md',
      validator: (value: string) => {
        return ['none', 'sm', 'md', 'lg', 'full'].includes(value)
      },
    },
    dot: {
      type: Boolean,
      default: false,
    },
    count: {
      type: Number,
      default: undefined,
    },
    maxCount: {
      type: Number,
      default: 99,
    },
    showZero: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { attrs, slots }) {
    const displayCount = computed(() => {
      if (props.count === undefined) {
        return undefined
      }
      if (props.count === 0 && !props.showZero) {
        return undefined
      }
      return props.count > props.maxCount ? `${props.maxCount}+` : props.count
    })

    return () => {
      const { variant, size, rounded, dot, count, maxCount, showZero } = props
      const classes = cn(badgeVariants({ variant, size, rounded }))

      if (count !== undefined) {
        const countValue = displayCount.value
        if (countValue === undefined) {
          return slots.default?.()
        }

        return (
          <span class={cn('relative inline-flex', attrs.class as string)}>
            {slots.default?.()}
            {countValue !== undefined && (
              <span class={cn('absolute -top-2 -right-2', classes)}>
                {dot ? (
                  <span class="w-2 h-2 rounded-full bg-current" />
                ) : (
                  countValue
                )}
              </span>
            )}
          </span>
        )
      }

      return (
        <span class={cn(classes, attrs.class as string)}>
          {dot && <span class="w-2 h-2 rounded-full bg-current mr-1" />}
          {slots.default?.()}
        </span>
      )
    }
  },
})
