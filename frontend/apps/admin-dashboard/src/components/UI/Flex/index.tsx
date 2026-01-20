/**
 * @fileoverview YYC³餐饮行业智能化平台 - 弹性布局组件
 * @description 弹性盒子布局组件，提供灵活的布局方式
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { defineComponent, computed, type PropType } from 'vue'
import { cn } from '@/utils/cn'

export const Flex = defineComponent({
  name: 'Flex',
  props: {
    className: {
      type: String,
      default: '',
    },
    direction: {
      type: String as PropType<'row' | 'row-reverse' | 'column' | 'column-reverse'>,
      default: 'row',
    },
    wrap: {
      type: String as PropType<'nowrap' | 'wrap' | 'wrap-reverse'>,
      default: 'nowrap',
    },
    justify: {
      type: String as PropType<'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'>,
      default: 'start',
    },
    align: {
      type: String as PropType<'start' | 'center' | 'end' | 'stretch' | 'baseline'>,
      default: 'start',
    },
    gap: {
      type: [Number, String] as PropType<number | string>,
      default: 0,
    },
    inline: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { attrs, slots }) {
    const flexClasses = computed(() => {
      const classes = []

      classes.push(props.inline ? 'inline-flex' : 'flex')

      const directionClasses = {
        row: 'flex-row',
        'row-reverse': 'flex-row-reverse',
        column: 'flex-col',
        'column-reverse': 'flex-col-reverse',
      }
      classes.push(directionClasses[props.direction])

      const wrapClasses = {
        nowrap: 'flex-nowrap',
        wrap: 'flex-wrap',
        'wrap-reverse': 'flex-wrap-reverse',
      }
      classes.push(wrapClasses[props.wrap])

      const justifyClasses = {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        'space-between': 'justify-between',
        'space-around': 'justify-around',
        'space-evenly': 'justify-evenly',
      }
      classes.push(justifyClasses[props.justify])

      const alignClasses = {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch',
        baseline: 'items-baseline',
      }
      classes.push(alignClasses[props.align])

      return classes.join(' ')
    })

    const gapStyle = computed(() => {
      const gapValue = typeof props.gap === 'number' ? `${props.gap}px` : props.gap
      return { gap: gapValue }
    })

    return () => (
      <div
        class={cn(flexClasses.value, props.className)}
        style={gapStyle.value}
      >
        {slots.default?.()}
      </div>
    )
  },
})

export const FlexItem = defineComponent({
  name: 'FlexItem',
  props: {
    className: {
      type: String,
      default: '',
    },
    flex: {
      type: [Number, String] as PropType<number | string>,
      default: undefined,
    },
    grow: {
      type: Number,
      default: undefined,
    },
    shrink: {
      type: Number,
      default: undefined,
    },
    basis: {
      type: [Number, String] as PropType<number | string>,
      default: undefined,
    },
    alignSelf: {
      type: String as PropType<'start' | 'center' | 'end' | 'stretch' | 'baseline'>,
      default: undefined,
    },
    order: {
      type: Number,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    const itemStyle = computed(() => {
      const style: Record<string, string> = {}

      if (props.flex !== undefined) {
        style.flex = typeof props.flex === 'number' ? `${props.flex}` : props.flex
      }

      if (props.grow !== undefined) {
        style.flexGrow = `${props.grow}`
      }

      if (props.shrink !== undefined) {
        style.flexShrink = `${props.shrink}`
      }

      if (props.basis !== undefined) {
        style.flexBasis = typeof props.basis === 'number' ? `${props.basis}px` : props.basis
      }

      if (props.alignSelf !== undefined) {
        const alignSelfClasses = {
          start: 'flex-start',
          center: 'center',
          end: 'flex-end',
          stretch: 'stretch',
          baseline: 'baseline',
        }
        style.alignSelf = alignSelfClasses[props.alignSelf]
      }

      if (props.order !== undefined) {
        style.order = `${props.order}`
      }

      return style
    })

    return () => (
      <div
        class={cn(props.className)}
        style={itemStyle.value}
      >
        {slots.default?.()}
      </div>
    )
  },
})
