<template>
  <button
    :class="buttonClasses"
    :type="type"
    :disabled="disabled"
    :loading="loading"
    @click="handleClick"
  >
    <span v-if="loading" class="button-loading">
      <!-- 加载指示器可以根据需要替换为SVG -->
      <svg class="loading-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
    </span>
    <slot v-else></slot>
  </button>
</template>

<script setup>
import { computed } from 'vue';

// Props
const props = defineProps({
  // 按钮类型
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value)
  },
  
  // 按钮变体
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'accent', 'neutral', 'outline', 'text'].includes(value)
  },
  
  // 按钮尺寸
  size: {
    type: String,
    default: 'base',
    validator: (value) => ['sm', 'base', 'lg'].includes(value)
  },
  
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  
  // 是否加载中
  loading: {
    type: Boolean,
    default: false
  },
  
  // 是否为块级元素
  block: {
    type: Boolean,
    default: false
  },
  
  // 自定义类名
  className: {
    type: String,
    default: ''
  }
});

// Emits
const emit = defineEmits(['click']);

// Handle click event
const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};

// 计算按钮类名
const buttonClasses = computed(() => {
  const classes = [
    'yyc3-button',
    `yyc3-button--${props.variant}`,
    `yyc3-button--${props.size}`,
    props.className
  ];
  
  if (props.disabled) classes.push('yyc3-button--disabled');
  if (props.loading) classes.push('yyc3-button--loading');
  if (props.block) classes.push('yyc3-button--block');
  
  return classes;
});
</script>

<style scoped>
.yyc3-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  border-radius: var(--button-border-radius);
  transition: var(--transition-all);
  cursor: pointer;
  -webkit-user-select: none;
  user-select: none;
  outline: none;
}

/* 尺寸变体 */
.yyc3-button--sm {
  height: var(--button-height-sm);
  padding: 0 var(--button-padding-horizontal-sm);
  font-size: var(--button-font-size-sm);
}

.yyc3-button--base {
  height: var(--button-height-base);
  padding: 0 var(--button-padding-horizontal-base);
  font-size: var(--button-font-size-base);
}

.yyc3-button--lg {
  height: var(--button-height-lg);
  padding: 0 var(--button-padding-horizontal-lg);
  font-size: var(--button-font-size-lg);
}

/* 样式变体 */
.yyc3-button--primary {
  color: var(--button-primary-color);
  background-color: var(--button-primary-bg-color);
  border: 1px solid var(--button-primary-border-color);
}

.yyc3-button--primary:hover:not(:disabled):not(:active) {
  background-color: var(--button-primary-hover-bg-color);
  border-color: var(--button-primary-hover-border-color);
  box-shadow: var(--shadow-md);
}

.yyc3-button--primary:active:not(:disabled) {
  background-color: var(--button-primary-active-bg-color);
  border-color: var(--button-primary-active-border-color);
}

.yyc3-button--secondary {
  color: var(--color-text-primary);
  background-color: var(--color-secondary);
  border: 1px solid var(--color-secondary);
}

.yyc3-button--secondary:hover:not(:disabled):not(:active) {
  background-color: var(--color-secondary-light);
  border-color: var(--color-secondary-light);
  box-shadow: var(--shadow-md);
}

.yyc3-button--secondary:active:not(:disabled) {
  background-color: var(--color-secondary-dark);
  border-color: var(--color-secondary-dark);
}

.yyc3-button--accent {
  color: var(--color-text-primary);
  background-color: var(--color-accent);
  border: 1px solid var(--color-accent);
}

.yyc3-button--accent:hover:not(:disabled):not(:active) {
  background-color: var(--color-accent-light);
  border-color: var(--color-accent-light);
  box-shadow: var(--shadow-md);
}

.yyc3-button--accent:active:not(:disabled) {
  background-color: var(--color-accent-dark);
  border-color: var(--color-accent-dark);
}

.yyc3-button--neutral {
  color: var(--color-text-primary);
  background-color: var(--color-neutral);
  border: 1px solid var(--color-neutral);
}

.yyc3-button--neutral:hover:not(:disabled):not(:active) {
  background-color: var(--color-neutral-light);
  border-color: var(--color-neutral-light);
  box-shadow: var(--shadow-md);
}

.yyc3-button--neutral:active:not(:disabled) {
  background-color: var(--color-neutral-dark);
  border-color: var(--color-neutral-dark);
}

.yyc3-button--outline {
  color: var(--color-text-primary);
  background-color: transparent;
  border: 1px solid var(--color-border-secondary);
}

.yyc3-button--outline:hover:not(:disabled):not(:active) {
  background-color: var(--color-bg-tertiary);
  border-color: var(--color-text-primary);
}

.yyc3-button--outline:active:not(:disabled) {
  background-color: var(--color-bg-secondary);
}

.yyc3-button--text {
  color: var(--color-primary);
  background-color: transparent;
  border: 1px solid transparent;
}

.yyc3-button--text:hover:not(:disabled):not(:active) {
  background-color: rgba(44, 95, 172, 0.1);
}

.yyc3-button--text:active:not(:disabled) {
  background-color: rgba(44, 95, 172, 0.2);
}

/* 状态样式 */
.yyc3-button--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.yyc3-button--loading {
  opacity: 0.8;
  pointer-events: none;
}

.button-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 块级按钮 */
.yyc3-button--block {
  display: flex;
  width: 100%;
}
</style>
