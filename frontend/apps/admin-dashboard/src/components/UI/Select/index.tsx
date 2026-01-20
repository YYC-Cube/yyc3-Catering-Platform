/**
 * @fileoverview YYC³餐饮行业智能化平台 - 选择器组件
 * @description 统一的选择器组件，支持单选、多选和分组
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { defineComponent, ref, computed, watch, onMounted, onUnmounted, type PropType } from 'vue'
import { cn } from '@/utils/cn'
import { ChevronDown, ChevronUp, Check, Search } from 'lucide-vue-next'

export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
  group?: string
  children?: SelectOption[]
}

export const Select = defineComponent({
  name: 'Select',
  props: {
    modelValue: {
      type: [String, Number, Array] as PropType<string | number | (string | number)[]>,
      default: '',
    },
    options: {
      type: Array as PropType<SelectOption[]>,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: '请选择',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    searchable: {
      type: Boolean,
      default: false,
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    filterable: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String as PropType<'sm' | 'md' | 'lg'>,
      default: 'md',
      validator: (value: string) => ['sm', 'md', 'lg'].includes(value),
    },
    loading: {
      type: Boolean,
      default: false,
    },
    remote: {
      type: Boolean,
      default: false,
    },
    remoteMethod: {
      type: Function as PropType<(query: string) => void>,
      default: undefined,
    },
    maxTagCount: {
      type: Number,
      default: undefined,
    },
  },
  emits: ['update:modelValue', 'change', 'clear', 'visible-change', 'remove-tag'],
  setup(props, { emit }) {
    const visible = ref(false)
    const searchQuery = ref('')
    const highlightedIndex = ref(-1)
    const selectRef = ref<HTMLElement>()
    const dropdownRef = ref<HTMLElement>()

    const filteredOptions = computed(() => {
      if (!props.filterable && !props.searchable) {
        return props.options
      }

      const query = searchQuery.value.toLowerCase()
      return props.options.filter(option => {
        if (option.children) {
          return option.children.some(child => 
            child.label.toLowerCase().includes(query)
          )
        }
        return option.label.toLowerCase().includes(query)
      })
    })

    const selectedOptions = computed(() => {
      if (props.multiple && Array.isArray(props.modelValue)) {
        return props.options.filter(option => 
          props.modelValue.includes(option.value)
        )
      }
      const option = props.options.find(option => option.value === props.modelValue)
      return option ? [option] : []
    })

    const displayValue = computed(() => {
      if (props.multiple && Array.isArray(props.modelValue)) {
        if (props.modelValue.length === 0) {
          return props.placeholder
        }
        if (props.maxTagCount !== undefined && props.modelValue.length > props.maxTagCount) {
          return `+${props.modelValue.length - props.maxTagCount}`
        }
        return selectedOptions.value.map(opt => opt.label).join(', ')
      }
      const option = props.options.find(opt => opt.value === props.modelValue)
      return option ? option.label : props.placeholder
    })

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

    const toggleDropdown = () => {
      if (props.disabled || props.readonly) {
        return
      }
      visible.value = !visible.value
      emit('visible-change', visible.value)
    }

    const closeDropdown = () => {
      visible.value = false
      searchQuery.value = ''
      highlightedIndex.value = -1
      emit('visible-change', false)
    }

    const selectOption = (option: SelectOption) => {
      if (option.disabled) {
        return
      }

      if (props.multiple) {
        const currentValue = Array.isArray(props.modelValue) ? [...props.modelValue] : []
        const index = currentValue.indexOf(option.value)
        if (index > -1) {
          currentValue.splice(index, 1)
        } else {
          currentValue.push(option.value)
        }
        emit('update:modelValue', currentValue)
        emit('change', currentValue)
      } else {
        emit('update:modelValue', option.value)
        emit('change', option.value)
        closeDropdown()
      }
    }

    const handleClear = (event: Event) => {
      event.stopPropagation()
      if (props.multiple) {
        emit('update:modelValue', [])
        emit('change', [])
      } else {
        emit('update:modelValue', '')
        emit('change', '')
      }
      emit('clear')
    }

    const handleSearch = (value: string) => {
      searchQuery.value = value
      if (props.remote && props.remoteMethod) {
        props.remoteMethod(value)
      }
    }

    const handleRemoveTag = (value: string | number, event: Event) => {
      event.stopPropagation()
      const currentValue = Array.isArray(props.modelValue) ? [...props.modelValue] : []
      const index = currentValue.indexOf(value)
      if (index > -1) {
        currentValue.splice(index, 1)
        emit('update:modelValue', currentValue)
        emit('remove-tag', value)
      }
    }

    const isSelected = (option: SelectOption) => {
      if (props.multiple && Array.isArray(props.modelValue)) {
        return props.modelValue.includes(option.value)
      }
      return props.modelValue === option.value
    }

    const isHighlighted = (index: number) => {
      return highlightedIndex.value === index
    }

    const getOptionGroups = () => {
      const groups: Record<string, SelectOption[]> = {}
      filteredOptions.value.forEach(option => {
        if (option.group) {
          if (!groups[option.group]) {
            groups[option.group] = []
          }
          groups[option.group].push(option)
        } else if (option.children) {
          option.children.forEach(child => {
            if (!groups[option.label]) {
              groups[option.label] = []
            }
            groups[option.label].push(child)
          })
        }
      })
      return groups
    }

    const getUngroupedOptions = () => {
      return filteredOptions.value.filter(option => !option.group && !option.children)
    }

    const handleKeydown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          highlightedIndex.value = Math.min(highlightedIndex.value + 1, filteredOptions.value.length - 1)
          break
        case 'ArrowUp':
          event.preventDefault()
          highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
          break
        case 'Enter':
          event.preventDefault()
          if (highlightedIndex.value >= 0 && highlightedIndex.value < filteredOptions.value.length) {
            selectOption(filteredOptions.value[highlightedIndex.value])
          }
          break
        case 'Escape':
          closeDropdown()
          break
      }
    }

    watch(() => props.modelValue, () => {
      if (!visible.value) {
        return
      }
      if (props.multiple && Array.isArray(props.modelValue)) {
        highlightedIndex.value = -1
      }
    })

    return () => (
      <div ref={selectRef} class="relative w-full">
        <div
          class={cn(
            'flex items-center justify-between w-full rounded-lg border bg-white cursor-pointer transition-all duration-200 outline-none focus:outline-none focus:ring-2 focus:ring-offset-2',
            sizeClasses.value,
            props.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
            props.readonly ? 'cursor-default' : '',
            visible.value ? 'border-primary-500 ring-primary-500/50' : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/50'
          )}
          onClick={toggleDropdown}
          onKeydown={handleKeydown}
          tabindex={props.disabled ? -1 : 0}
        >
          <div class="flex-1 min-w-0 flex items-center gap-2">
            {props.multiple && Array.isArray(props.modelValue) && props.modelValue.length > 0 ? (
              <div class="flex items-center gap-1 flex-wrap">
                {selectedOptions.value.slice(0, props.maxTagCount).map(option => (
                  <span
                    key={option.value}
                    class="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs"
                  >
                    {option.label}
                    {!props.disabled && !props.readonly && (
                      <button
                        type="button"
                        class="hover:text-primary-900"
                        onClick={(e: Event) => handleRemoveTag(option.value, e)}
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
                {props.maxTagCount !== undefined && selectedOptions.value.length > props.maxTagCount && (
                  <span class="text-neutral-500 text-xs">
                    +{selectedOptions.value.length - props.maxTagCount}
                  </span>
                )}
              </div>
            ) : (
              <span class={cn('truncate', !props.modelValue && 'text-neutral-400')}>
                {displayValue.value}
              </span>
            )}
          </div>
          <div class="flex items-center gap-1">
            {props.clearable && props.modelValue && !props.disabled && !props.readonly && (
              <button
                type="button"
                class="text-neutral-400 hover:text-neutral-600 transition-colors"
                onClick={handleClear}
              >
                ×
              </button>
            )}
            {visible.value ? (
              <ChevronUp size={16} class="text-neutral-400" />
            ) : (
              <ChevronDown size={16} class="text-neutral-400" />
            )}
          </div>
        </div>

        {visible.value && (
          <div
            ref={dropdownRef}
            class={cn(
              'absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-auto',
              'animate-in fade-in zoom-in-95 duration-200'
            )}
          >
            {props.searchable && (
              <div class="p-2 border-b border-neutral-200">
                <div class="relative">
                  <Search size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery.value}
                    onInput={(e: Event) => handleSearch((e.target as HTMLInputElement).value)}
                    placeholder="搜索..."
                    class="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            )}

            {props.loading ? (
              <div class="flex items-center justify-center py-8">
                <svg class="animate-spin h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              <div class="py-1">
                {Object.entries(getOptionGroups()).map(([groupName, options]) => (
                  <div key={groupName}>
                    <div class="px-3 py-2 text-xs font-semibold text-neutral-500 bg-neutral-50">
                      {groupName}
                    </div>
                    {options.map((option, index) => (
                      <div
                        key={option.value}
                        class={cn(
                          'px-3 py-2 cursor-pointer transition-colors flex items-center justify-between',
                          option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-100',
                          isSelected(option) && 'bg-primary-50 text-primary-700',
                          isHighlighted(index) && 'bg-neutral-100'
                        )}
                        onClick={() => !option.disabled && selectOption(option)}
                      >
                        <span>{option.label}</span>
                        {isSelected(option) && <Check size={16} />}
                      </div>
                    ))}
                  </div>
                ))}
                {getUngroupedOptions().map((option, index) => (
                  <div
                    key={option.value}
                    class={cn(
                      'px-3 py-2 cursor-pointer transition-colors flex items-center justify-between',
                      option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-100',
                      isSelected(option) && 'bg-primary-50 text-primary-700',
                      isHighlighted(index) && 'bg-neutral-100'
                    )}
                    onClick={() => !option.disabled && selectOption(option)}
                  >
                    <span>{option.label}</span>
                    {isSelected(option) && <Check size={16} />}
                  </div>
                ))}
                {filteredOptions.value.length === 0 && (
                  <div class="px-3 py-8 text-center text-neutral-500 text-sm">
                    无数据
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    )
  },
})
