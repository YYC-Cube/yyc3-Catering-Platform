/**
 * @fileoverview YYC³餐饮行业智能化平台 - 表单组件
 * @description 统一的表单组件，支持表单验证和状态管理
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { defineComponent, provide, inject, ref, computed, type PropType, type InjectionKey } from 'vue'
import { cn } from '@/utils/cn'

export interface FormField {
  name: string
  value: any
  error?: string
  touched?: boolean
  dirty?: boolean
  required?: boolean
  rules?: Array<(value: any) => boolean | string>
}

export interface FormContext {
  fields: Record<string, FormField>
  values: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  dirty: Record<string, boolean>
  valid: boolean
  submitting: boolean
  registerField: (field: FormField) => void
  unregisterField: (name: string) => void
  updateFieldValue: (name: string, value: any) => void
  setFieldError: (name: string, error: string) => void
  setFieldTouched: (name: string, touched: boolean) => void
  validateField: (name: string) => boolean
  validateAll: () => boolean
  reset: () => void
  submit: () => void
}

const FORM_KEY: InjectionKey<FormContext> = Symbol('form')

export const useForm = () => {
  const form = inject(FORM_KEY)
  if (!form) {
    throw new Error('useForm must be used within a Form component')
  }
  return form
}

export const Form = defineComponent({
  name: 'Form',
  props: {
    initialValues: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({}),
    },
    onSubmit: {
      type: Function as PropType<(values: Record<string, any>) => void | Promise<void>>,
      default: undefined,
    },
    layout: {
      type: String as PropType<'vertical' | 'horizontal' | 'inline'>,
      default: 'vertical',
      validator: (value: string) => ['vertical', 'horizontal', 'inline'].includes(value),
    },
    labelWidth: {
      type: [String, Number] as PropType<string | number>,
      default: 'auto',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['submit', 'submit-success', 'submit-error'],
  setup(props, { emit, slots }) {
    const fields = ref<Record<string, FormField>>({})
    const submitting = ref(false)

    const values = computed(() => {
      const result: Record<string, any> = { ...props.initialValues }
      Object.entries(fields.value).forEach(([name, field]) => {
        result[name] = field.value
      })
      return result
    })

    const errors = computed(() => {
      const result: Record<string, string> = {}
      Object.entries(fields.value).forEach(([name, field]) => {
        if (field.error) {
          result[name] = field.error
        }
      })
      return result
    })

    const touched = computed(() => {
      const result: Record<string, boolean> = {}
      Object.entries(fields.value).forEach(([name, field]) => {
        result[name] = field.touched || false
      })
      return result
    })

    const dirty = computed(() => {
      const result: Record<string, boolean> = {}
      Object.entries(fields.value).forEach(([name, field]) => {
        result[name] = field.dirty || false
      })
      return result
    })

    const valid = computed(() => {
      return Object.keys(errors.value).length === 0
    })

    const registerField = (field: FormField) => {
      fields.value[field.name] = {
        ...field,
        value: props.initialValues[field.name] !== undefined ? props.initialValues[field.name] : field.value,
      }
    }

    const unregisterField = (name: string) => {
      delete fields.value[name]
    }

    const updateFieldValue = (name: string, value: any) => {
      if (fields.value[name]) {
        fields.value[name].value = value
        fields.value[name].dirty = true
      }
    }

    const setFieldError = (name: string, error: string) => {
      if (fields.value[name]) {
        fields.value[name].error = error
      }
    }

    const setFieldTouched = (name: string, touched: boolean) => {
      if (fields.value[name]) {
        fields.value[name].touched = touched
      }
    }

    const validateField = (name: string): boolean => {
      const field = fields.value[name]
      if (!field || !field.rules) {
        return true
      }

      for (const rule of field.rules) {
        const result = rule(field.value)
        if (result !== true) {
          setFieldError(name, typeof result === 'string' ? result : '验证失败')
          return false
        }
      }

      setFieldError(name, '')
      return true
    }

    const validateAll = (): boolean => {
      let isValid = true
      Object.keys(fields.value).forEach(name => {
        if (!validateField(name)) {
          isValid = false
        }
      })
      return isValid
    }

    const reset = () => {
      Object.keys(fields.value).forEach(name => {
        fields.value[name].value = props.initialValues[name] !== undefined ? props.initialValues[name] : ''
        fields.value[name].error = ''
        fields.value[name].touched = false
        fields.value[name].dirty = false
      })
    }

    const submit = async () => {
      if (!validateAll()) {
        return
      }

      submitting.value = true
      emit('submit', values.value)

      try {
        if (props.onSubmit) {
          await props.onSubmit(values.value)
          emit('submit-success', values.value)
        }
      } catch (error) {
        emit('submit-error', error)
      } finally {
        submitting.value = false
      }
    }

    const handleSubmit = (event: Event) => {
      event.preventDefault()
      submit()
    }

    const formContext: FormContext = {
      fields,
      values,
      errors,
      touched,
      dirty,
      valid,
      submitting,
      registerField,
      unregisterField,
      updateFieldValue,
      setFieldError,
      setFieldTouched,
      validateField,
      validateAll,
      reset,
      submit,
    }

    provide(FORM_KEY, formContext)

    return () => (
      <form
        onSubmit={handleSubmit}
        class={cn(
          'space-y-4',
          props.layout === 'inline' && 'flex flex-wrap items-center gap-4 space-y-0',
          props.layout === 'horizontal' && 'space-y-6',
          attrs.class as string
        )}
      >
        {slots.default?.({
          values: values.value,
          errors: errors.value,
          touched: touched.value,
          dirty: dirty.value,
          valid: valid.value,
          submitting: submitting.value,
          validate: validateAll,
          reset,
          submit,
        })}
      </form>
    )
  },
})

export const FormItem = defineComponent({
  name: 'FormItem',
  props: {
    name: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: '',
    },
    required: {
      type: Boolean,
      default: false,
    },
    rules: {
      type: Array as PropType<Array<(value: any) => boolean | string>>,
      default: () => [],
    },
    layout: {
      type: String as PropType<'vertical' | 'horizontal' | 'inline'>,
      default: undefined,
    },
    labelWidth: {
      type: [String, Number] as PropType<string | number>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    const form = useForm()
    const id = computed(() => `form-item-${props.name}`)

    const field = computed(() => form.fields[props.name])
    const error = computed(() => form.errors[props.name])
    const touched = computed(() => form.touched[props.name])
    const dirty = computed(() => form.dirty[props.name])

    const layout = computed(() => props.layout || form.layout)
    const labelWidth = computed(() => props.labelWidth !== undefined ? props.labelWidth : form.labelWidth)

    onMounted(() => {
      form.registerField({
        name: props.name,
        value: '',
        required: props.required,
        rules: props.rules,
      })
    })

    onUnmounted(() => {
      form.unregisterField(props.name)
    })

    const handleBlur = () => {
      form.setFieldTouched(props.name, true)
      form.validateField(props.name)
    }

    return () => {
      const itemLayout = layout.value
      const itemLabelWidth = labelWidth.value

      return (
        <div
          class={cn(
            'space-y-2',
            itemLayout === 'inline' && 'flex items-center gap-2 space-y-0',
            itemLayout === 'horizontal' && 'grid grid-cols-[auto_1fr] gap-4 items-start',
            attrs.class as string
          )}
        >
          {props.label && (
            <label
              for={id.value}
              class={cn(
                'text-sm font-medium text-neutral-700',
                itemLayout === 'inline' && 'whitespace-nowrap',
                itemLayout === 'horizontal' && 'pt-2',
                itemLabelWidth !== 'auto' && 'flex-shrink-0'
              )}
              style={itemLabelWidth !== 'auto' ? { width: typeof itemLabelWidth === 'number' ? `${itemLabelWidth}px` : itemLabelWidth } : {}}
            >
              {props.label}
              {props.required && <span class="text-danger-500 ml-1">*</span>}
            </label>
          )}
          <div class={cn('flex-1', itemLayout === 'horizontal' && 'min-w-0')}>
            {slots.default?.({
              id: id.value,
              name: props.name,
              value: field.value?.value,
              error: error.value,
              touched: touched.value,
              dirty: dirty.value,
              onBlur: handleBlur,
            })}
            {error.value && touched.value && (
              <p class="mt-1 text-sm text-danger-600">
                {error.value}
              </p>
            )}
            {slots.description?.()}
          </div>
        </div>
      )
    }
  },
})

export const FormLabel = defineComponent({
  name: 'FormLabel',
  props: {
    for: {
      type: String,
      default: '',
    },
    required: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { attrs, slots }) {
    return () => (
      <label
        for={props.for}
        class={cn(
          'block text-sm font-medium text-neutral-700 mb-1',
          attrs.class as string
        )}
      >
        {slots.default?.()}
        {props.required && <span class="text-danger-500 ml-1">*</span>}
      </label>
    )
  },
})

export const FormDescription = defineComponent({
  name: 'FormDescription',
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

export const FormMessage = defineComponent({
  name: 'FormMessage',
  setup(props, { attrs, slots }) {
    return () => (
      <p
        class={cn(
          'text-sm text-danger-600 mt-1',
          attrs.class as string
        )}
      >
        {slots.default?.()}
      </p>
    )
  },
})
