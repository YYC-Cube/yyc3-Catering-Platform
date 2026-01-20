/**
 * @fileoverview YYC³餐饮行业智能化平台 - 间距组件
 * @description 统一的间距组件，用于控制子元素之间的间距
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { defineComponent, computed, type PropType } from 'vue'
import { cn } from '@/utils/cn'

export const Space = defineComponent({
  name: 'Space',
  props: {
    className: {
      type: String,
      default: '',
    },
    size: {
      type: [Number, String, Array] as PropType<number | string | [number | string, number | string]>,
      default: 8,
    },
    direction: {
      type: String as PropType<'horizontal' | 'vertical'>,
      default: 'horizontal',
    },
    align: {
      type: String as PropType<'start' | 'center' | 'end' | 'baseline' | 'stretch'>,
      default: 'center',
    },
    justify: {
      type: String as PropType<'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'>,
      default: 'start',
    },
    wrap: {
      type: Boolean,
      default: false,
    },
    split: {
      type: [String, Boolean] as PropType<string | boolean>,
      default: false,
    },
  },
  setup(props, { attrs, slots }) {
    const spaceClasses = computed(() => {
      const classes = ['flex']

      const directionClasses = {
        horizontal: 'flex-row',
        vertical: 'flex-col',
      }
      classes.push(directionClasses[props.direction])

      const alignClasses = {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        baseline: 'items-baseline',
        stretch: 'items-stretch',
      }
      classes.push(alignClasses[props.align])

      const justifyClasses = {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        'space-between': 'justify-between',
        'space-around': 'justify-around',
        'space-evenly': 'justify-evenly',
      }
      classes.push(justifyClasses[props.justify])

      if (props.wrap) {
        classes.push('flex-wrap')
      }

      return classes.join(' ')
    })

    const gapStyle = computed(() => {
      if (Array.isArray(props.size)) {
        const [rowGap, colGap] = props.size
        const rowGapValue = typeof rowGap === 'number' ? `${rowGap}px` : rowGap
        const colGapValue = typeof colGap === 'number' ? `${colGap}px` : colGap
        return {
          gap: props.direction === 'horizontal' 
            ? `0 ${colGapValue}` 
            : `${rowGapValue} 0`,
        }
      }
      const gapValue = typeof props.size === 'number' ? `${props.size}px` : props.size
      return {
        gap: props.direction === 'horizontal' ? `0 ${gapValue}` : `${gapValue} 0`,
      }
    })

    const renderChildren = () => {
      const children = slots.default?.() || []
      const result: any[] = []

      children.forEach((child, index) => {
        result.push(child)

        if (props.split && index < children.length - 1) {
          const splitContent = typeof props.split === 'string' ? props.split : '|'
          result.push(
            <span class="text-neutral-300 mx-2">{splitContent}</span>
          )
        }
      })

      return result
    }

    return () => (
      <div
        class={cn(spaceClasses.value, props.className)}
        style={gapStyle.value}
      >
        {renderChildren()}
      </div>
    )
  },
})
