<!--
 YYC³餐饮管理系统 - 系统按钮组件
 基于4色体系设计规范
-->
<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="type"
    @click="handleClick"
  >
    <div v-if="loading" class="ytc-button__spinner">
      <div class="spinner-circle"></div>
    </div>

    <div v-if="$slots.icon" class="ytc-button__icon">
      <slot name="icon" />
    </div>

    <span v-if="$slots.default" class="ytc-button__text">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost' | 'text' | 'dashed' | 'link'
  size?: 'sm' | 'base' | 'lg'
  disabled?: boolean
  loading?: boolean
  block?: boolean
  rounded?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'base',
  disabled: false,
  loading: false,
  block: false,
  rounded: false,
  type: 'button'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => [
  'ytc-button',
  `ytc-button--${props.variant}`,
  `ytc-button--${props.size}`,
  {
    'ytc-button--disabled': props.disabled,
    'ytc-button--loading': props.loading,
    'ytc-button--block': props.block,
    'ytc-button--rounded': props.rounded
  }
])

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style lang="scss" scoped>@use '@/styles/tokens.scss' as *;

.ytc-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  border: none;
  border-radius: $border-radius-base;
  font-family: $font-family-primary;
  font-weight: $font-weight-body-normal;
  text-decoration: none;
  cursor: pointer;
  transition: $transition-colors, $transition-transform, $transition-opacity;
  -webkit-user-select: none;
  user-select: none;
  position: relative;
  overflow: hidden;

  &:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &--block {
    width: 100%;
  }

  &--rounded {
    border-radius: $border-radius-full;
  }

  // 尺寸变体
  &--sm {
    height: $button-height-sm;
    padding: 0 $button-padding-x-sm;
    font-size: $font-size-body-small;
  }

  &--base {
    height: $button-height-base;
    padding: 0 $button-padding-x-base;
    font-size: $font-size-body-normal;
  }

  &--lg {
    height: $button-height-lg;
    padding: 0 $button-padding-x-lg;
    font-size: $font-size-body-large;
  }

  // Primary 变体 - 品牌蓝
  &--primary {
    background: var(--color-primary);
    color: var(--color-text-primary);
    box-shadow: $shadow-sm;

    &:hover:not(:disabled) {
      background: var(--color-primary-dark);
      box-shadow: $shadow-md;
    }

    &:active:not(:disabled) {
      background: var(--color-primary-dark);
      box-shadow: $shadow-sm;
    }
  }

  // Secondary 变体 - 活力橙
  &--secondary {
    background: var(--color-secondary);
    color: var(--color-text-primary);
    box-shadow: $shadow-sm;

    &:hover:not(:disabled) {
      background: var(--color-secondary-dark);
      box-shadow: $shadow-md;
    }

    &:active:not(:disabled) {
      background: var(--color-secondary-dark);
      box-shadow: $shadow-sm;
    }
  }

  // Success 变体 - 绿色成功
  &--success {
    background: var(--color-success);
    color: var(--color-text-primary);
    box-shadow: $shadow-sm;

    &:hover:not(:disabled) {
      background: var(--color-success-dark);
      box-shadow: $shadow-md;
    }

    &:active:not(:disabled) {
      background: var(--color-success-dark);
      box-shadow: $shadow-sm;
    }
  }

  // Danger 变体 - 红色危险
  &--danger {
    background: var(--color-danger);
    color: var(--color-text-primary);
    box-shadow: $shadow-sm;

    &:hover:not(:disabled) {
      background: var(--color-danger-dark);
      box-shadow: $shadow-md;
    }

    &:active:not(:disabled) {
      background: var(--color-danger-dark);
      box-shadow: $shadow-sm;
    }
  }

  // Warning 变体 - 黄色警告
  &--warning {
    background: var(--color-warning);
    color: var(--color-text-primary);
    box-shadow: $shadow-sm;

    &:hover:not(:disabled) {
      background: var(--color-warning-dark);
      box-shadow: $shadow-md;
    }

    &:active:not(:disabled) {
      background: var(--color-warning-dark);
      box-shadow: $shadow-sm;
    }
  }

  // Ghost 变体 - 透明背景
  &--ghost {
    background: transparent;
    color: var(--color-text-regular);
    border: 1px solid var(--color-border-primary);

    &:hover:not(:disabled) {
      background: var(--color-bg-secondary);
    }

    &:active:not(:disabled) {
      background: var(--color-bg-tertiary);
    }
  }

  // Text 变体 - 文本按钮
  &--text {
    background: transparent;
    color: var(--color-text-regular);
    border: none;

    &:hover:not(:disabled) {
      background: var(--color-bg-secondary);
    }

    &:active:not(:disabled) {
      background: var(--color-bg-tertiary);
    }
  }

  // Dashed 变体 - 虚线按钮
  &--dashed {
    background: transparent;
    color: var(--color-text-regular);
    border: 1px dashed var(--color-border-primary);

    &:hover:not(:disabled) {
      background: var(--color-bg-secondary);
    }

    &:active:not(:disabled) {
      background: var(--color-bg-tertiary);
    }
  }

  // Link 变体 - 链接按钮
  &--link {
    background: transparent;
    color: var(--color-primary);
    border: none;
    text-decoration: underline;

    &:hover:not(:disabled) {
      color: var(--color-primary-light);
    }

    &:active:not(:disabled) {
      color: var(--color-primary-dark);
    }
  }

  // 禁用状态
  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  // 加载状态
  &--loading {
    cursor: wait;
  }

  &__spinner {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .spinner-circle {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__text {
    line-height: 1;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 响应式适配
@include respond-to(sm) {
  .ytc-button--sm {
    padding: 0 $spacing-lg;
  }

  .ytc-button--base {
    padding: 0 $spacing-xl;
  }

  .ytc-button--lg {
    padding: 0 $spacing-2xl;
  }
}
</style>