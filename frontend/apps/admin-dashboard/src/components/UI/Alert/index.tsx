/**
 * @fileoverview YYC³餐饮行业智能化平台 - 警告提示组件
 * @description 统一的警告提示组件，支持多种样式和操作
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { defineComponent, computed, ref, type PropType } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-vue-next'

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm flex items-start gap-3',
  {
    variants: {
      variant: {
        default:
          'bg-white border-neutral-200 text-neutral-900',
        info:
          'bg-blue-50 border-blue-200 text-blue-900',
        success:
          'bg-green-50 border-green-200 text-green-900',
        warning:
          'bg-yellow-50 border-yellow-200 text-yellow-900',
        danger:
          'bg-red-50 border-red-200 text-red-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

type AlertVariants = VariantProps<typeof alertVariants>

export const Alert = defineComponent({
  name: 'Alert',
  props: {
    variant: {
      type: String as PropType<AlertVariants['variant']>,
      default: 'default',
      validator: (value: string) => {
        return ['default', 'info', 'success', 'warning', 'danger'].includes(value)
      },
    },
    showIcon: {
      type: Boolean,
      default: true,
    },
    closable: {
      type: Boolean,
      default: false,
    },
    banner: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close'],
  setup(props, { emit, attrs, slots }) {
    const visible = ref(true)

    const iconComponent = computed(() => {
      switch (props.variant) {
        case 'success':
          return CheckCircle
        case 'warning':
          return AlertTriangle
        case 'danger':
          return AlertCircle
        case 'info':
        default:
          return Info
      }
    })

    const iconColor = computed(() => {
      switch (props.variant) {
        case 'success':
          return 'text-green-600'
        case 'warning':
          return 'text-yellow-600'
        case 'danger':
          return 'text-red-600'
        case 'info':
        default:
          return 'text-blue-600'
      }
    })

    const handleClose = () => {
      visible.value = false
      emit('close')
    }

    return () => {
      if (!visible.value) {
        return null
      }

      const { variant, showIcon, closable, banner } = props
      const classes = cn(
        alertVariants({ variant }),
        banner && 'rounded-none border-x-0 border-t-0',
        attrs.class as string
      )

      return (
        <div class={classes} role="alert">
          {showIcon && (
            <div class="flex-shrink-0 mt-0.5">
              <iconComponent.value size={16} class={iconColor.value} />
            </div>
          )}
          <div class="flex-1 min-w-0">
            {slots.default?.()}
          </div>
          {closable && (
            <button
              type="button"
              class="flex-shrink-0 ml-2 text-neutral-400 hover:text-neutral-600 transition-colors"
              onClick={handleClose}
            >
              <X size={16} />
            </button>
          )}
        </div>
      )
    }
  },
})

export const AlertTitle = defineComponent({
  name: 'AlertTitle',
  setup(props, { attrs, slots }) {
    return () => (
      <div
        class={cn(
          'font-semibold mb-1',
          attrs.class as string
        )}
      >
        {slots.default?.()}
      </div>
    )
  },
})

export const AlertDescription = defineComponent({
  name: 'AlertDescription',
  setup(props, { attrs, slots }) {
    return () => (
      <div
        class={cn(
          'text-neutral-600',
          attrs.class as string
        )}
      >
        {slots.default?.()}
      </div>
    )
  },
})
