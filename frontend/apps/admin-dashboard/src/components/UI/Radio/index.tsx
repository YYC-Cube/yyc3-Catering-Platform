/**
 * @fileoverview YYC³餐饮行业智能化平台 - 单选框组件
 * @description 统一的单选框组件，支持单选和分组
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { defineComponent, computed, type PropType } from 'vue'
import { cn } from '@/utils/cn'
import { Circle } from 'lucide-vue-next'

export const Radio = defineComponent({
  name: 'Radio',
  props: {
    modelValue: {
      type: [String, Number, Boolean] as PropType<string | number | boolean>,
      default: '',
    },
    value: {
      type: [String, Number, Boolean] as PropType<string | number | boolean>,
      required: true,
    },
    label: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String as PropType<'sm' | 'md' | 'lg'>,
      default: 'md',
      validator: (value: string) => ['sm', 'md', 'lg'].includes(value),
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const isChecked = computed(() => {
      return props.modelValue === props.value
    })

    const sizeClasses = computed(() => {
      switch (props.size) {
        case 'sm':
          return 'w-4 h-4'
        case 'lg':
          return 'w-6 h-6'
        default:
          return 'w-5 h-5'
      }
    })

    const innerSize = computed(() => {
      switch (props.size) {
        case 'sm':
          return 'w-2 h-2'
        case 'lg':
          return 'w-3 h-3'
        default:
          return 'w-2.5 h-2.5'
      }
    })

    const handleChange = (event: Event) => {
      if (props.disabled) {
        return
      }

      emit('update:modelValue', props.value)
      emit('change', props.value)
    }

    return () => (
      <label
        class={cn(
          'inline-flex items-center gap-2 cursor-pointer',
          props.disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div class="relative">
          <input
            type="radio"
            checked={isChecked.value}
            disabled={props.disabled}
            class={cn(
              'appearance-none border border-neutral-300 rounded-full bg-white transition-all duration-200 outline-none focus:outline-none focus:ring-2 focus:ring-offset-2',
              sizeClasses.value,
              isChecked.value && 'border-primary-600',
              !isChecked.value && 'hover:border-primary-400',
              props.disabled && 'opacity-50 cursor-not-allowed',
              'focus:ring-primary-500/50'
            )}
            onChange={handleChange}
          />
          {isChecked.value && (
            <div class={cn('absolute inset-0 flex items-center justify-center pointer-events-none')}>
              <div class={cn('rounded-full bg-primary-600', innerSize.value)} />
            </div>
          )}
        </div>
        {props.label && (
          <span class={cn('text-sm', props.disabled && 'text-neutral-400')}>
            {props.label}
          </span>
        )}
      </label>
    )
  },
})

export const RadioGroup = defineComponent({
  name: 'RadioGroup',
  props: {
    modelValue: {
      type: [String, Number, Boolean] as PropType<string | number | boolean>,
      default: '',
    },
    options: {
      type: Array as PropType<Array<{ label: string; value: string | number | boolean; disabled?: boolean }>>,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String as PropType<'sm' | 'md' | 'lg'>,
      default: 'md',
      validator: (value: string) => ['sm', 'md', 'lg'].includes(value),
    },
    direction: {
      type: String as PropType<'horizontal' | 'vertical'>,
      default: 'vertical',
      validator: (value: string) => ['horizontal', 'vertical'].includes(value),
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const handleChange = (value: string | number | boolean) => {
      emit('update:modelValue', value)
      emit('change', value)
    }

    return () => (
      <div
        class={cn(
          'flex gap-4',
          props.direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
        )}
      >
        {props.options.map(option => (
          <Radio
            key={String(option.value)}
            modelValue={props.modelValue}
            value={option.value}
            label={option.label}
            disabled={props.disabled || option.disabled}
            size={props.size}
            onChange={handleChange}
          />
        ))}
      </div>
    )
  },
})
