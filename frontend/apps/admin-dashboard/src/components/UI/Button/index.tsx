/**
 * @fileoverview YYC³餐饮行业智能化平台 - 按钮组件
 * @description 统一的按钮组件，支持多种样式和尺寸
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { defineComponent, type PropType, type ButtonHTMLAttributes } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
        secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
        success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500',
        warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500',
        danger: 'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500',
        ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500',
        outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
        link: 'bg-transparent text-primary-600 hover:underline focus:ring-primary-500',
      },
      size: {
        xs: 'px-2 py-1 text-xs',
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-5 py-2.5 text-lg',
        xl: 'px-6 py-3 text-xl',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
)

type ButtonVariants = VariantProps<typeof buttonVariants>

export const Button = defineComponent({
  name: 'Button',
  props: {
    variant: {
      type: String as PropType<ButtonVariants['variant']>,
      default: 'primary',
      validator: (value: string) => {
        return ['primary', 'secondary', 'success', 'warning', 'danger', 'ghost', 'outline', 'link'].includes(value)
      },
    },
    size: {
      type: String as PropType<ButtonVariants['size']>,
      default: 'md',
      validator: (value: string) => {
        return ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
      },
    },
    fullWidth: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String as PropType<ButtonHTMLAttributes['type']>,
      default: 'button',
    },
  },
  emits: ['click'],
  setup(props, { slots, emit }) {
    const handleClick = (event: MouseEvent) => {
      if (!props.disabled && !props.loading) {
        emit('click', event)
      }
    }

    return () => {
      const { variant, size, fullWidth, disabled, loading, type } = props
      const classes = cn(buttonVariants({ variant, size, fullWidth }))

      return (
        <button
          type={type}
          class={classes}
          disabled={disabled || loading}
          onClick={handleClick}
        >
          {loading && (
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {slots.default?.()}
        </button>
      )
    }
  },
})
