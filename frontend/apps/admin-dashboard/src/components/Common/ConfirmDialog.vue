<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :before-close="handleClose"
    append-to-body
  >
    <div class="confirm-content">
      <div v-if="type" class="confirm-icon">
        <el-icon :size="32" :class="iconClass">
          <Warning v-if="type === 'warning'" />
          <SuccessFilled v-else-if="type === 'success'" />
          <CircleCloseFilled v-else-if="type === 'error'" />
          <InfoFilled v-else />
        </el-icon>
      </div>

      <div class="confirm-message">
        <p v-if="isStringMessage">{{ message }}</p>
        <div v-else v-html="message"></div>
      </div>
    </div>

    <template #footer>
      <div class="confirm-footer">
        <el-button @click="handleCancel">
          {{ cancelText }}
        </el-button>
        <el-button
          :type="confirmType"
          :loading="loading"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Warning, SuccessFilled, CircleCloseFilled, InfoFilled } from '@element-plus/icons-vue'

interface Props {
  modelValue: boolean
  title?: string
  message?: string
  type?: 'warning' | 'success' | 'error' | 'info'
  confirmText?: string
  cancelText?: string
  width?: string | number
  confirmType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  loading?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '确认操作',
  message: '确定要执行此操作吗？',
  type: 'warning',
  confirmText: '确定',
  cancelText: '取消',
  width: 420,
  confirmType: 'primary',
  loading: false
})

const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})



const iconClass = computed(() => {
  return `confirm-icon-${props.type}`
})

const isStringMessage = computed(() => {
  return typeof props.message === 'string'
})

const handleClose = () => {
  if (!props.loading) {
    visible.value = false
    emit('cancel')
  }
}

const handleCancel = () => {
  if (!props.loading) {
    visible.value = false
    emit('cancel')
  }
}

const handleConfirm = () => {
  if (!props.loading) {
    emit('confirm')
  }
}
</script>

<style lang="scss" scoped>
.confirm-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 0;
}

.confirm-icon {
  flex-shrink: 0;
  margin-top: 2px;

  &.confirm-icon-warning {
    color: var(--el-color-warning);
  }

  &.confirm-icon-success {
    color: var(--el-color-success);
  }

  &.confirm-icon-error {
    color: var(--el-color-danger);
  }

  &.confirm-icon-info {
    color: var(--el-color-info);
  }
}

.confirm-message {
  flex: 1;
  line-height: 1.5;
  color: var(--el-text-color-primary);
  font-size: 14px;

  p {
    margin: 0;
  }
}

.confirm-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-dialog) {
  border-radius: 8px;
}

:deep(.el-dialog__header) {
  padding: 20px 24px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: 0;
}

:deep(.el-dialog__body) {
  padding: 0 24px;
}

:deep(.el-dialog__footer) {
  padding: 0 24px 20px;
  border-top: 1px solid var(--el-border-color-lighter);
  margin-top: 0;
}
</style>