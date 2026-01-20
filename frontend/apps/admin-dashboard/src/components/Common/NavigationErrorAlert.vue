<!--
 * @fileoverview YYC³餐饮行业智能化平台 - 导航错误提示组件
 * @description 显示导航错误信息，提供重试和关闭选项
 * @module NavigationErrorAlert
 * @author YYC³
 * @version 1.0.0
 * @created 2024-01-19
 * @updated 2024-01-19
 -->
<template>
  <Transition name="slide">
    <div v-if="hasError" class="navigation-error-alert">
      <div class="error-content">
        <div class="error-icon">
          <el-icon :size="24" color="#EF4444">
            <CircleClose />
          </el-icon>
        </div>
        
        <div class="error-message">
          <h4 class="error-title">导航失败</h4>
          <p class="error-text">{{ errorMessage }}</p>
        </div>
        
        <div class="error-actions">
          <el-button
            type="primary"
            size="small"
            @click="handleRetry"
            :loading="isRetrying"
          >
            重试
          </el-button>
          <el-button
            type="text"
            size="small"
            @click="handleClose"
          >
            关闭
          </el-button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { CircleClose } from '@element-plus/icons-vue'
import { useNavigationState, NavigationError } from '@/composables/useNavigationState'

interface Props {
  retryAction?: () => Promise<void>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'retry'): void
  (e: 'close'): void
}>()

const navState = useNavigationState()
const isRetrying = ref(false)

const hasError = computed(() => navState.hasError())

const errorMessage = computed(() => {
  return navState.state.error || '导航过程中发生错误'
})

const handleRetry = async () => {
  try {
    isRetrying.value = true
    
    if (props.retryAction) {
      await navState.retryNavigation(props.retryAction)
    } else {
      emit('retry')
    }
    
    navState.clearError()
    ElMessage.success('重试成功')
  } catch (error) {
    ElMessage.error(`重试失败: ${(error as Error).message}`)
  } finally {
    isRetrying.value = false
  }
}

const handleClose = () => {
  navState.clearError()
  emit('close')
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';

.navigation-error-alert {
  position: fixed;
  top: var(--header-height);
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-notification);
  padding: var(--spacing-md);
  width: 90%;
  max-width: 500px;
}

.error-content {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background-color: var(--color-surface);
  border: 1px solid var(--color-error);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
}

.error-icon {
  flex-shrink: 0;
  padding-top: 2px;
}

.error-message {
  flex: 1;
  min-width: 0;
}

.error-title {
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--color-error);
  font-size: var(--font-size-body);
  font-weight: 600;
}

.error-text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-small);
  line-height: 1.5;
  word-break: break-word;
}

.error-actions {
  display: flex;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

@media (max-width: $breakpoint-md) {
  .navigation-error-alert {
    width: 95%;
    padding: var(--spacing-sm);
  }

  .error-content {
    padding: var(--spacing-md);
    gap: var(--spacing-sm);
  }

  .error-title {
    font-size: var(--font-size-body-small);
  }

  .error-text {
    font-size: var(--font-size-body-tiny);
  }

  .error-actions {
    flex-direction: column;
    width: 100%;

    .el-button {
      width: 100%;
    }
  }
}
</style>
