<template>
  <el-dialog
    v-model="visible"
    title="键盘快捷键"
    :width="800"
    append-to-body
    class="keyboard-shortcuts-help"
  >
    <div class="shortcuts-content">
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="搜索快捷键..."
          prefix-icon="Search"
          clearable
        />
      </div>

      <div class="shortcuts-categories">
        <div
          v-for="category in filteredCategories"
          :key="category.name"
          class="category-section"
        >
          <h3 class="category-title">{{ category.name }}</h3>
          <div class="shortcuts-grid">
            <div
              v-for="(shortcut, index) in category.shortcuts"
              :key="index"
              class="shortcut-item"
            >
              <div class="shortcut-keys">
                <kbd v-for="(key, keyIndex) in getShortcutKeys(shortcut)" :key="keyIndex">{{ key }}</kbd>
              </div>
              <div class="shortcut-description">{{ shortcut.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredCategories.length === 0" class="no-results">
        <el-empty description="未找到匹配的快捷键" />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="close">关闭</el-button>
        <el-button type="primary" @click="printShortcuts">打印快捷键</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { keyboardShortcuts, type KeyboardShortcutCategory, type KeyboardShortcut } from '@/utils/keyboardShortcuts'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const searchQuery = ref('')
const allCategories = ref<KeyboardShortcutCategory[]>([])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loadCategories = () => {
  const categorized = keyboardShortcuts.getShortcutsByCategory()
  allCategories.value = Array.from(categorized.entries()).map(([name, shortcuts]) => ({
    name,
    shortcuts
  }))
}

const filteredCategories = computed(() => {
  if (!searchQuery.value) {
    return allCategories.value
  }

  const query = searchQuery.value.toLowerCase()
  return allCategories.value.map(category => ({
    ...category,
    shortcuts: category.shortcuts.filter(shortcut =>
      shortcut.description.toLowerCase().includes(query) ||
      shortcut.key.toLowerCase().includes(query) ||
      category.name.toLowerCase().includes(query)
    )
  })).filter(category => category.shortcuts.length > 0)
})

// 使用keyboardShortcuts工具类提供的方法获取快捷键显示文本
const getShortcutKeys = (shortcut: KeyboardShortcut): string[] => {
  const displayText = keyboardShortcuts.getShortcutDisplayText(shortcut)
  return displayText.split(' + ')
}

const close = () => {
  visible.value = false
}

const printShortcuts = () => {
  const printContent = filteredCategories.value.map(category => {
    const shortcutsText = category.shortcuts.map(shortcut => {
      const keys = getShortcutKeys(shortcut).join(' + ')
      return `  ${keys}: ${shortcut.description}`
    }).join('\n')

    return `${category.name}:\n${shortcutsText}`
  }).join('\n\n')

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>YYC³ 餐饮平台 - 键盘快捷键</title>
          <style>
            body { font-family: monospace; padding: 20px; }
            h2 { margin-bottom: 10px; }
            .category { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>YYC³ 餐饮平台 - 键盘快捷键</h1>
          <pre>${printContent}</pre>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }
}

watch(() => props.modelValue, (visible) => {
  if (visible) {
    loadCategories()
  }
})

loadCategories()
</script>

<style lang="scss" scoped>
.keyboard-shortcuts-help {
  .shortcuts-content {
    max-height: 70vh;
    overflow-y: auto;
  }

  .search-box {
    margin-bottom: 24px;
  }

  .shortcuts-categories {
    .category-section {
      margin-bottom: 32px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .category-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--el-text-color-primary);
      border-bottom: 1px solid var(--el-border-color-light);
      padding-bottom: 8px;
    }

    .shortcuts-grid {
      display: grid;
      gap: 12px;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }

    .shortcut-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;

      .shortcut-keys {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;

        kbd {
          display: inline-block;
          padding: 4px 8px;
          background: var(--el-fill-color-light);
          border: 1px solid var(--el-border-color);
          border-radius: 4px;
          font-family: monospace;
          font-size: 11px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

          &:not(:last-child)::after {
            content: '+';
            margin-left: 4px;
            color: var(--el-text-color-regular);
          }
        }
      }

      .shortcut-description {
        font-size: 14px;
        color: var(--el-text-color-regular);
        line-height: 1.4;
      }
    }
  }

  .no-results {
    text-align: center;
    padding: 40px 0;
  }

  .dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

:deep(.el-dialog__body) {
  padding: 20px 24px;
}

:deep(.el-input__wrapper) {
  border-radius: 20px;
}

@media (max-width: 768px) {
  .keyboard-shortcuts-help {
    .shortcuts-grid {
      grid-template-columns: 1fr;
    }

    .shortcut-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;

      .shortcut-keys {
        align-self: flex-start;
      }
    }
  }
}

@media print {
  .keyboard-shortcuts-help {
    .dialog-footer,
    .search-box {
      display: none;
    }
  }
}
</style>