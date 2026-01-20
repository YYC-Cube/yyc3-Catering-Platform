<!--
 * @fileoverview YYC³餐饮行业智能化平台 - 快捷键帮助组件
 * @description 显示所有可用快捷键及其功能说明
 * @module ShortcutHelp
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 * @updated 2025-01-19
 -->
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isVisible" class="shortcut-help-overlay" @click.self="handleClose">
        <div class="shortcut-help-modal">
          <div class="modal-header">
            <h2 class="modal-title">快捷键帮助</h2>
            <el-button
              type="text"
              @click="handleClose"
              class="close-btn"
            >
              <el-icon size="20">
                <Close />
              </el-icon>
            </el-button>
          </div>

          <div class="modal-body">
            <div
              v-for="(shortcuts, category) in groupedShortcuts"
              :key="category"
              class="shortcut-category"
            >
              <h3 class="category-title">{{ getCategoryName(category) }}</h3>
              <div class="shortcut-list">
                <div
                  v-for="(shortcut, index) in shortcuts"
                  :key="index"
                  class="shortcut-item"
                >
                  <kbd class="shortcut-key">{{ formatShortcut(shortcut) }}</kbd>
                  <span class="shortcut-desc">{{ shortcut.description }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <p class="footer-text">
              <el-icon><InfoFilled /></el-icon>
              按 <kbd>Esc</kbd> 关闭此窗口
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Close, InfoFilled } from '@element-plus/icons-vue'
import { useShortcutHelp, ShortcutCategory } from '@/composables/useShortcuts'

interface Props {
  visible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { isHelpVisible, groupedShortcuts, formatShortcut, getCategoryName } = useShortcutHelp()

const isVisible = computed({
  get: () => props.visible || isHelpVisible.value,
  set: (value) => {
    if (!value) {
      handleClose()
    }
  }
})

function handleClose() {
  emit('close')
  isHelpVisible.value = false
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';

.shortcut-help-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  backdrop-filter: blur(4px);
}

.shortcut-help-modal {
  background: var(--color-bg-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-2xl);
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalIn 0.3s ease-out;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--color-border-primary);
  background: var(--color-bg-secondary);
}

.modal-title {
  margin: 0;
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-h3);
  color: var(--color-text-primary);
}

.close-btn {
  color: var(--color-text-secondary);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  transition: all 0.2s ease;

  &:hover {
    color: var(--color-primary);
    background: var(--color-primary-light);
  }
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-xl);
}

.shortcut-category {
  margin-bottom: var(--spacing-2xl);

  &:last-child {
    margin-bottom: 0;
  }
}

.category-title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-h4);
  color: var(--color-primary);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--color-primary);
}

.shortcut-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--border-radius-md);
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-bg-tertiary);
    transform: translateX(4px);
  }
}

.shortcut-key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-darker);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-sm);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-body-small);
  font-weight: 600;
  color: var(--color-text-primary);
  min-width: 80px;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.shortcut-desc {
  flex: 1;
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}

.modal-footer {
  padding: var(--spacing-md) var(--spacing-xl);
  border-top: 1px solid var(--color-border-primary);
  background: var(--color-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-text {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin: 0;
  font-size: var(--font-size-body-small);
  color: var(--color-text-secondary);

  kbd {
    margin: 0 var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--color-darker);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--border-radius-sm);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-body-tiny);
    font-weight: 600;
    color: var(--color-text-primary);
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-width: $breakpoint-md) {
  .shortcut-help-modal {
    width: 95%;
    max-height: 85vh;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: var(--spacing-lg);
  }

  .shortcut-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .shortcut-key {
    width: 100%;
  }
}

@media (max-width: $breakpoint-sm) {
  .shortcut-help-modal {
    width: 100%;
    height: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: var(--spacing-md);
  }

  .category-title {
    font-size: var(--font-size-body-large);
  }

  .shortcut-key {
    font-size: var(--font-size-body-tiny);
    min-width: 60px;
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  .shortcut-desc {
    font-size: var(--font-size-body-small);
  }
}

@media (prefers-reduced-motion: reduce) {
  .shortcut-help-modal {
    animation: none;
  }

  .shortcut-item {
    &:hover {
      transform: none;
    }
  }
}
</style>
