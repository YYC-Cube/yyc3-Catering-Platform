/**
 * @fileoverview YYC³餐饮行业智能化平台 - 输入框组件
 * @description 统一的输入框组件，支持多种类型和样式
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { defineComponent, type PropType, computed } from 'vue'
import { cn } from '@/utils/cn'

export const Input = defineComponent({
  name: 'Input',
  props: {
    modelValue: {
      type: [String, Number] as PropType<string | number>,
      default: '',
    },
    type: {
      type: String as PropType<'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'>,
      default: 'text',
    },
    placeholder: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String as PropType<'sm' | 'md' | 'lg'>,
      default: 'md',
      validator: (value: string) => ['sm', 'md', 'lg'].includes(value),
    },
    error: {
      type: Boolean,
      default: false,
    },
    errorMessage: {
      type: String,
      default: '',
    },
    prefix: {
      type: String,
      default: '',
    },
    suffix: {
      type: String,
      default: '',
    },
    maxLength: {
      type: Number,
      default: undefined,
    },
    minLength: {
      type: Number,
      default: undefined,
    },
    pattern: {
      type: String,
      default: undefined,
    },
    min: {
      type: Number,
      default: undefined,
    },
    max: {
      type: Number,
      default: undefined,
    },
    step: {
      type: Number,
      default: undefined,
    },
    autocomplete: {
      type: String,
      default: 'off',
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'focus', 'blur', 'change', 'keydown', 'keyup', 'keypress', 'enter'],
  setup(props, { emit, attrs, slots }) {
    const sizeClasses = computed(() => {
      switch (props.size) {
        case 'sm':
          return 'h-8 px-2 py-1 text-sm'
        case 'lg':
          return 'h-12 px-4 py-3 text-lg'
        default:
          return 'h-10 px-3 py-2 text-base'
      }
    })

    const errorClasses = computed(() => {
      if (props.error) {
        return 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/50'
      }
      return 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/50'
    })

    const disabledClasses = computed(() => {
      if (props.disabled) {
        return 'opacity-50 cursor-not-allowed pointer-events-none'
      }
      return ''
    })

    const handleInput = (event: Event) => {
      const target = event.target as HTMLInputElement
      emit('update:modelValue', target.value)
    }

    const handleFocus = (event: FocusEvent) => {
      emit('focus', event)
    }

    const handleBlur = (event: FocusEvent) => {
      emit('blur', event)
    }

    const handleChange = (event: Event) => {
      emit('change', event)
    }

    const handleKeydown = (event: KeyboardEvent) => {
      emit('keydown', event)
      if (event.key === 'Enter') {
        emit('enter', event)
      }
    }

    const handleKeyup = (event: KeyboardEvent) => {
      emit('keyup', event)
    }

    const handleKeypress = (event: KeyboardEvent) => {
      emit('keypress', event)
    }

    return () => (
      <div class="w-full">
        <div class="relative flex items-center">
          {props.prefix && (
            <span class="absolute left-3 text-neutral-500 pointer-events-none">
              {props.prefix}
            </span>
          )}
          <input
            type={props.type}
            value={props.modelValue}
            placeholder={props.placeholder}
            disabled={props.disabled}
            readonly={props.readonly}
            required={props.required}
            maxlength={props.maxLength}
            minlength={props.minLength}
            pattern={props.pattern}
            min={props.min}
            max={props.max}
            step={props.step}
            autocomplete={props.autocomplete}
            autofocus={props.autofocus}
            class={cn(
              'w-full rounded-lg border bg-white text-neutral-900 transition-all duration-200 outline-none focus:outline-none focus:ring-2 focus:ring-offset-2',
              sizeClasses.value,
              errorClasses.value,
              disabledClasses.value,
              props.prefix ? 'pl-10' : '',
              props.suffix ? 'pr-10' : '',
              attrs.class as string
            )}
            onInput={handleInput}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            onKeydown={handleKeydown}
            onKeyup={handleKeyup}
            onKeypress={handleKeypress}
            {...attrs}
          />
          {props.suffix && (
            <span class="absolute right-3 text-neutral-500 pointer-events-none">
              {props.suffix}
            </span>
          )}
          {slots.suffix?.()}
        </div>
        {props.error && props.errorMessage && (
          <p class="mt-1 text-sm text-danger-600">
            {props.errorMessage}
          </p>
        )}
      </div>
    )
  },
})
