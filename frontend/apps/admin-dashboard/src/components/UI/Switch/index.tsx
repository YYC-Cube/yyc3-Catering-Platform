/**
 * @fileoverview YYC³餐饮行业智能化平台 - 开关组件
 * @description 统一的开关组件，支持多种样式和尺寸
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { defineComponent, ref, computed, type PropType } from 'vue'
import { cn } from '@/utils/cn'

export const Switch = defineComponent({
  name: 'Switch',
  props: {
    modelValue: {
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
    size: {
      type: String as PropType<'sm' | 'md' | 'lg'>,
      default: 'md',
      validator: (value: string) => ['sm', 'md', 'lg'].includes(value),
    },
    color: {
      type: String as PropType<'primary' | 'success' | 'warning' | 'danger'>,
      default: 'primary',
      validator: (value: string) => ['primary', 'success', 'warning', 'danger'].includes(value),
    },
    checkedText: {
      type: String,
      default: '',
    },
    uncheckedText: {
      type: String,
      default: '',
    },
    beforeChange: {
      type: Function as PropType<(value: boolean) => boolean | Promise<boolean>>,
      default: undefined,
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const changing = ref(false)

    const sizeClasses = computed(() => {
      switch (props.size) {
        case 'sm':
          return 'h-5 w-9'
        case 'lg':
          return 'h-7 w-14'
        default:
          return 'h-6 w-11'
      }
    })

    const thumbSize = computed(() => {
      switch (props.size) {
        case 'sm':
          return 'w-4 h-4'
        case 'lg':
          return 'w-6 h-6'
        default:
          return 'w-5 h-5'
      }
    })

    const thumbTranslate = computed(() => {
      switch (props.size) {
        case 'sm':
          return 'translate-x-4'
        case 'lg':
          return 'translate-x-7'
        default:
          return 'translate-x-5'
      }
    })

    const colorClasses = computed(() => {
      switch (props.color) {
        case 'success':
          return props.modelValue ? 'bg-success-600' : 'bg-neutral-200'
        case 'warning':
          return props.modelValue ? 'bg-warning-600' : 'bg-neutral-200'
        case 'danger':
          return props.modelValue ? 'bg-danger-600' : 'bg-neutral-200'
        default:
          return props.modelValue ? 'bg-primary-600' : 'bg-neutral-200'
      }
    })

    const handleChange = async () => {
      if (props.disabled || props.loading || changing.value) {
        return
      }

      const newValue = !props.modelValue

      if (props.beforeChange) {
        changing.value = true
        try {
          const canChange = await props.beforeChange(newValue)
          if (canChange) {
            emit('update:modelValue', newValue)
            emit('change', newValue)
          }
        } catch (error) {
          console.error('Switch beforeChange error:', error)
        } finally {
          changing.value = false
        }
      } else {
        emit('update:modelValue', newValue)
        emit('change', newValue)
      }
    }

    return () => (
      <label
        class={cn(
          'inline-flex items-center gap-2 cursor-pointer',
          props.disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <button
          type="button"
          role="switch"
          aria-checked={props.modelValue}
          disabled={props.disabled || props.loading || changing.value}
          class={cn(
            'relative inline-flex flex-shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2',
            sizeClasses.value,
            colorClasses.value,
            props.disabled ? 'cursor-not-allowed' : 'cursor-pointer',
            'focus:ring-primary-500/50'
          )}
          onClick={handleChange}
        >
          <span
            class={cn(
              'pointer-events-none inline-block rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out',
              thumbSize.value,
              props.modelValue ? thumbTranslate.value : 'translate-x-0.5',
              (props.loading || changing.value) && 'animate-pulse'
            )}
          />
          {props.loading || changing.value ? (
            <span class="absolute inset-0 flex items-center justify-center">
              <svg class="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
          ) : null}
        </button>
        {(props.checkedText || props.uncheckedText) && (
          <span class={cn('text-sm', props.disabled && 'text-neutral-400')}>
            {props.modelValue ? props.checkedText : props.uncheckedText}
          </span>
        )}
      </label>
    )
  },
})
