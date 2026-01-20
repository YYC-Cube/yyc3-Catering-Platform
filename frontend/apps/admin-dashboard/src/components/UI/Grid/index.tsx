/**
 * @fileoverview YYC³餐饮行业智能化平台 - 网格布局组件
 * @description 响应式网格布局组件，支持多种列数和间距配置
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { defineComponent, computed, type PropType } from 'vue'
import { cn } from '@/utils/cn'

export const Grid = defineComponent({
  name: 'Grid',
  props: {
    className: {
      type: String,
      default: '',
    },
    cols: {
      type: [Number, Object] as PropType<number | Record<string, number>>,
      default: 1,
    },
    gap: {
      type: [Number, String] as PropType<number | string>,
      default: 4,
    },
    align: {
      type: String as PropType<'start' | 'center' | 'end' | 'stretch'>,
      default: 'start',
    },
    justify: {
      type: String as PropType<'start' | 'center' | 'end' | 'stretch'>,
      default: 'start',
    },
  },
  setup(props, { attrs, slots }) {
    const gridClasses = computed(() => {
      const classes = ['grid']

      const gapValue = typeof props.gap === 'number' ? `gap-${props.gap}` : props.gap
      classes.push(gapValue)

      const alignClasses = {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch',
      }
      classes.push(alignClasses[props.align])

      const justifyClasses = {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        stretch: 'justify-stretch',
      }
      classes.push(justifyClasses[props.justify])

      if (typeof props.cols === 'number') {
        classes.push(`grid-cols-${props.cols}`)
      } else {
        Object.entries(props.cols).forEach(([breakpoint, cols]) => {
          classes.push(`${breakpoint}:grid-cols-${cols}`)
        })
      }

      return classes.join(' ')
    })

    return () => (
      <div class={cn(gridClasses.value, props.className)}>
        {slots.default?.()}
      </div>
    )
  },
})

export const GridItem = defineComponent({
  name: 'GridItem',
  props: {
    className: {
      type: String,
      default: '',
    },
    colSpan: {
      type: [Number, Object] as PropType<number | Record<string, number>>,
      default: 1,
    },
    rowSpan: {
      type: [Number, Object] as PropType<number | Record<string, number>>,
      default: 1,
    },
    colStart: {
      type: [Number, Object] as PropType<number | Record<string, number>>,
      default: undefined,
    },
    colEnd: {
      type: [Number, Object] as PropType<number | Record<string, number>>,
      default: undefined,
    },
    rowStart: {
      type: [Number, Object] as PropType<number | Record<string, number>>,
      default: undefined,
    },
    rowEnd: {
      type: [Number, Object] as PropType<number | Record<string, number>>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    const itemClasses = computed(() => {
      const classes = []

      const addSpanClass = (prop: number | Record<string, number>, prefix: string) => {
        if (typeof prop === 'number') {
          classes.push(`${prefix}-${prop}`)
        } else {
          Object.entries(prop).forEach(([breakpoint, value]) => {
            classes.push(`${breakpoint}:${prefix}-${value}`)
          })
        }
      }

      const addPositionClass = (prop: number | Record<string, number> | undefined, prefix: string) => {
        if (prop === undefined) return
        if (typeof prop === 'number') {
          classes.push(`${prefix}-${prop}`)
        } else {
          Object.entries(prop).forEach(([breakpoint, value]) => {
            classes.push(`${breakpoint}:${prefix}-${value}`)
          })
        }
      }

      addSpanClass(props.colSpan, 'col-span')
      addSpanClass(props.rowSpan, 'row-span')
      addPositionClass(props.colStart, 'col-start')
      addPositionClass(props.colEnd, 'col-end')
      addPositionClass(props.rowStart, 'row-start')
      addPositionClass(props.rowEnd, 'row-end')

      return classes.join(' ')
    })

    return () => (
      <div class={cn(itemClasses.value, props.className)}>
        {slots.default?.()}
      </div>
    )
  },
})
