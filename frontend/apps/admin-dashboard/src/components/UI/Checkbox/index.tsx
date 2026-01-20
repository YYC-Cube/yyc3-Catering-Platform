/**
 * @fileoverview YYC³餐饮行业智能化平台 - 复选框组件
 * @description 统一的复选框组件，支持单选、多选和分组
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { defineComponent, computed, type PropType } from 'vue'
import { cn } from '@/utils/cn'
import { Check, Minus } from 'lucide-vue-next'

export const Checkbox = defineComponent({
  name: 'Checkbox',
  props: {
    modelValue: {
      type: [Boolean, String, Array] as PropType<boolean | string | string[]>,
      default: false,
    },
    value: {
      type: [String, Number] as PropType<string | number>,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    indeterminate: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String as PropType<'sm' | 'md' | 'lg'>,
      default: 'md',
      validator: (value: string) => ['sm', 'md', 'lg'].includes(value),
    },
    trueValue: {
      type: [Boolean, String, Number] as PropType<boolean | string | number>,
      default: true,
    },
    falseValue: {
      type: [Boolean, String, Number] as PropType<boolean | string | number>,
      default: false,
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const isChecked = computed(() => {
      if (Array.isArray(props.modelValue)) {
        return props.modelValue.includes(props.value as string)
      }
      return props.modelValue === props.trueValue
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

    const iconSize = computed(() => {
      switch (props.size) {
        case 'sm':
          return 12
        case 'lg':
          return 20
        default:
          return 16
      }
    })

    const handleChange = (event: Event) => {
      if (props.disabled) {
        return
      }

      let newValue: any
      if (Array.isArray(props.modelValue)) {
        const currentValue = [...props.modelValue]
        const index = currentValue.indexOf(props.value as string)
        if (index > -1) {
          currentValue.splice(index, 1)
        } else {
          currentValue.push(props.value as string)
        }
        newValue = currentValue
      } else {
        newValue = isChecked.value ? props.falseValue : props.trueValue
      }

      emit('update:modelValue', newValue)
      emit('change', newValue)
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
            type="checkbox"
            checked={isChecked.value}
            disabled={props.disabled}
            class={cn(
              'appearance-none border border-neutral-300 rounded bg-white transition-all duration-200 outline-none focus:outline-none focus:ring-2 focus:ring-offset-2',
              sizeClasses.value,
              isChecked.value && 'bg-primary-600 border-primary-600',
              !isChecked.value && 'hover:border-primary-400',
              props.disabled && 'opacity-50 cursor-not-allowed',
              'focus:ring-primary-500/50'
            )}
            onChange={handleChange}
          />
          {isChecked.value && (
            <div class={cn('absolute inset-0 flex items-center justify-center text-white pointer-events-none')}>
              {props.indeterminate ? (
                <Minus size={iconSize.value} />
              ) : (
                <Check size={iconSize.value} />
              )}
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

export const CheckboxGroup = defineComponent({
  name: 'CheckboxGroup',
  props: {
    modelValue: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    options: {
      type: Array as PropType<Array<{ label: string; value: string; disabled?: boolean }>>,
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
    const handleChange = (value: string) => {
      const currentValue = [...props.modelValue]
      const index = currentValue.indexOf(value)
      if (index > -1) {
        currentValue.splice(index, 1)
      } else {
        currentValue.push(value)
      }
      emit('update:modelValue', currentValue)
      emit('change', currentValue)
    }

    return () => (
      <div
        class={cn(
          'flex gap-4',
          props.direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
        )}
      >
        {props.options.map(option => (
          <Checkbox
            key={option.value}
            modelValue={props.modelValue.includes(option.value)}
            value={option.value}
            label={option.label}
            disabled={props.disabled || option.disabled}
            size={props.size}
            onChange={() => handleChange(option.value)}
          />
        ))}
      </div>
    )
  },
})
