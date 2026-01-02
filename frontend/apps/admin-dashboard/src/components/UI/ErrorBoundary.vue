<template>
  <div class="error-boundary">
    <template v-if="hasError">
      <div class="error-container">
        <div class="error-content">
          <div class="error-icon">
            <el-icon :size="64" color="#F56C6C">
              <WarningFilled />
            </el-icon>
          </div>

          <div class="error-info">
            <h2 class="error-title">出现了一些问题</h2>
            <p class="error-message">{{ errorMessage }}</p>

            <div class="error-details" v-if="showDetails && errorDetails">
              <el-collapse v-model="activeCollapse">
                <el-collapse-item title="错误详情" name="details">
                  <pre class="error-stack">{{ errorDetails }}</pre>
                </el-collapse-item>
              </el-collapse>
            </div>

            <div class="error-actions">
              <el-button type="primary" @click="handleRetry" :loading="retrying">
                <el-icon><Refresh /></el-icon>
                重新尝试
              </el-button>

              <el-button @click="handleRefresh">
                <el-icon><RefreshRight /></el-icon>
                刷新页面
              </el-button>

              <el-button @click="handleGoHome">
                <el-icon><House /></el-icon>
                返回首页
              </el-button>

              <el-button
                v-if="!showDetails"
                type="info"
                plain
                @click="showDetails = true"
              >
                <el-icon><View /></el-icon>
                查看详情
              </el-button>
            </div>

            <div class="error-help" v-if="errorType === 'network'">
              <el-alert
                title="网络连接问题"
                type="warning"
                :closable="false"
                show-icon
              >
                <template #default>
                  <p>请检查您的网络连接，然后重试。</p>
                  <ul style="margin: 8px 0 0 0; padding-left: 20px;">
                    <li>确认网络连接正常</li>
                    <li>检查服务器是否可访问</li>
                    <li>尝试刷新页面</li>
                  </ul>
                </template>
              </el-alert>
            </div>

            <div class="error-help" v-else-if="errorType === 'permission'">
              <el-alert
                title="权限不足"
                type="error"
                :closable="false"
                show-icon
              >
                <template #default>
                  <p>您没有权限访问此页面，请联系管理员。</p>
                </template>
              </el-alert>
            </div>
          </div>
        </div>

        <!-- 错误报告 -->
        <div class="error-report" v-if="enableReporting">
          <el-divider>帮助改进系统</el-divider>
          <div class="report-content">
            <p>遇到错误？您可以向我们报告这个问题。</p>
            <el-button type="text" @click="showReportDialog = true">
              <el-icon><Message /></el-icon>
              报告错误
            </el-button>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <slot></slot>
    </template>

    <!-- 错误报告对话框 -->
    <el-dialog
      v-model="showReportDialog"
      title="报告错误"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="reportForm" :rules="reportRules" ref="reportFormRef" label-width="80px">
        <el-form-item label="问题描述" prop="description">
          <el-input
            v-model="reportForm.description"
            type="textarea"
            :rows="4"
            placeholder="请描述您遇到的问题..."
          />
        </el-form-item>

        <el-form-item label="联系方式" prop="contact">
          <el-input
            v-model="reportForm.contact"
            placeholder="邮箱或电话（可选）"
          />
        </el-form-item>

        <el-form-item label="附加信息">
          <el-checkbox v-model="reportForm.includeUserAgent">包含浏览器信息</el-checkbox>
          <el-checkbox v-model="reportForm.includeUserInfo">包含用户信息</el-checkbox>
          <el-checkbox v-model="reportForm.includeSystemInfo">包含系统信息</el-checkbox>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showReportDialog = false">取消</el-button>
          <el-button type="primary" @click="submitReport" :loading="reporting">
            发送报告
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  WarningFilled,
  Refresh,
  RefreshRight,
  House,
  View,
  Message
} from '@element-plus/icons-vue'

interface ErrorInfo {
  message: string
  stack?: string
  componentStack?: string
  timestamp: number
  url: string
  userAgent: string
  userId?: string
}

interface Props {
  fallback?: (error: Error, errorInfo: ErrorInfo) => void
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  enableReporting?: boolean
  maxRetries?: number
  retryDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  enableReporting: true,
  maxRetries: 3,
  retryDelay: 1000
})

const emit = defineEmits<{
  error: [error: Error, errorInfo: ErrorInfo]
  reset: []
  retry: []
}>()

const router = useRouter()

// 响应式数据
const hasError = ref(false)
const errorMessage = ref('')
const errorDetails = ref('')
const errorType = ref<'unknown' | 'network' | 'permission' | 'server' | 'client'>('unknown')
const errorInfo = ref<ErrorInfo | null>(null)
const retrying = ref(false)
const retryCount = ref(0)
const showDetails = ref(false)
const activeCollapse = ref<string[]>(['details'])
const showReportDialog = ref(false)
const reporting = ref(false)

const reportForm = reactive({
  description: '',
  contact: '',
  includeUserAgent: true,
  includeUserInfo: true,
  includeSystemInfo: true
})

const reportRules = {
  description: [
    { required: true, message: '请输入问题描述', trigger: 'blur' },
    { min: 10, message: '问题描述至少10个字符', trigger: 'blur' }
  ]
}

const reportFormRef = ref()

// 错误处理函数
const handleError = (error: Error, errorInstance: any, componentStack?: string) => {
  console.error('ErrorBoundary caught an error:', error)

  hasError.value = true
  errorMessage.value = error.message || '发生了未知错误'
  errorDetails.value = error.stack || componentStack || ''

  // 分析错误类型
  analyzeError(error)

  // 构建错误信息
  errorInfo.value = {
    message: error.message,
    stack: error.stack,
    componentStack,
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent
  }

  // 触发错误回调
  emit('error', error, errorInfo.value)

  // 调用自定义错误处理
  if (props.onError) {
    props.onError(error, errorInfo.value)
  }

  // 如果有自定义回退，使用它
  if (props.fallback) {
    props.fallback(error, errorInfo.value)
  }
}

// 分析错误类型
const analyzeError = (error: Error) => {
  const message = error.message.toLowerCase()

  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    errorType.value = 'network'
  } else if (message.includes('permission') || message.includes('unauthorized') || message.includes('403')) {
    errorType.value = 'permission'
  } else if (message.includes('500') || message.includes('server error')) {
    errorType.value = 'server'
  } else {
    errorType.value = 'client'
  }
}

// 重试函数
const handleRetry = async () => {
  if (retryCount.value >= props.maxRetries) {
    ElMessage.warning('已达到最大重试次数')
    return
  }

  retrying.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, props.retryDelay))

    hasError.value = false
    errorMessage.value = ''
    errorDetails.value = ''
    errorType.value = 'unknown'
    retryCount.value++

    emit('retry')
    emit('reset')

    ElMessage.success('重试成功')
  } catch (retryError) {
    console.error('Retry failed:', retryError)
    ElMessage.error('重试失败，请稍后再试')
  } finally {
    retrying.value = false
  }
}

// 刷新页面
const handleRefresh = () => {
  window.location.reload()
}

// 返回首页
const handleGoHome = () => {
  router.push('/')
}

// 提交错误报告
const submitReport = async () => {
  if (!reportFormRef.value) return

  try {
    await reportFormRef.value.validate()

    reporting.value = true

    // 构建报告数据
    const reportData = {
      ...errorInfo.value,
      userDescription: reportForm.description,
      userContact: reportForm.contact,
      userAgent: reportForm.includeUserAgent ? navigator.userAgent : undefined,
      timestamp: Date.now(),
      url: window.location.href,
      // 这里可以添加更多用户信息和系统信息
    }

    // 模拟发送报告
    await new Promise(resolve => setTimeout(resolve, 1000))

    console.log('Error report submitted:', reportData)

    ElMessage.success('错误报告已发送，感谢您的反馈')
    showReportDialog.value = false

    // 重置表单
    reportForm.description = ''
    reportForm.contact = ''

  } catch (error) {
    console.error('Failed to submit error report:', error)
    ElMessage.error('发送报告失败，请稍后再试')
  } finally {
    reporting.value = false
  }
}

// 重置错误状态
const reset = () => {
  hasError.value = false
  errorMessage.value = ''
  errorDetails.value = ''
  errorType.value = 'unknown'
  errorInfo.value = null
  retryCount.value = 0
  showDetails.value = false
  emit('reset')
}

// 全局错误监听
let errorHandler: ((event: ErrorEvent) => void) | null = null
let unhandledRejectionHandler: ((event: PromiseRejectionEvent) => void) | null = null

onMounted(() => {
  // 监听全局错误
  errorHandler = (event: ErrorEvent) => {
    handleError(
      new Error(event.message),
      event.error,
      'Global Error Event'
    )
    event.preventDefault()
  }

  unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
    handleError(
      new Error(event.reason?.message || 'Unhandled Promise Rejection'),
      event.reason,
      'Unhandled Promise Rejection'
    )
    event.preventDefault()
  }

  window.addEventListener('error', errorHandler)
  window.addEventListener('unhandledrejection', unhandledRejectionHandler)
})

onUnmounted(() => {
  if (errorHandler) {
    window.removeEventListener('error', errorHandler)
  }
  if (unhandledRejectionHandler) {
    window.removeEventListener('unhandledrejection', unhandledRejectionHandler)
  }
})

// 暴露方法给父组件
defineExpose({
  reset,
  handleError
})
</script>

<style scoped lang="scss">
@use '@/styles/theme.scss';

.error-boundary {
  width: 100%;
  height: 100%;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: $spacing-8;
  text-align: center;
}

.error-content {
  max-width: 600px;
  width: 100%;

  .error-icon {
    margin-bottom: $spacing-6;
  }

  .error-info {
    .error-title {
      font-size: $font-size-3xl;
      font-weight: $font-weight-bold;
      color: $text-primary;
      margin-bottom: $spacing-4;
    }

    .error-message {
      font-size: $font-size-lg;
      color: $text-secondary;
      margin-bottom: $spacing-6;
      line-height: $line-height-relaxed;
    }

    .error-details {
      margin-bottom: $spacing-6;

      .error-stack {
        background: $gray-50;
        border: 1px solid $border-primary;
        border-radius: $border-radius-base;
        padding: $spacing-4;
        font-size: $font-size-xs;
        color: $text-secondary;
        text-align: left;
        max-height: 200px;
        overflow-y: auto;
        white-space: pre-wrap;
        word-break: break-all;
      }
    }

    .error-actions {
      display: flex;
      gap: $spacing-3;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: $spacing-6;
    }

    .error-help {
      text-align: left;
      margin-top: $spacing-6;
    }
  }
}

.error-report {
  margin-top: $spacing-8;
  width: 100%;
  max-width: 400px;

  .report-content {
    text-align: center;

    p {
      color: $text-secondary;
      margin-bottom: $spacing-3;
    }
  }
}

// 响应式设计
@media (max-width: $breakpoint-md) {
  .error-container {
    padding: $spacing-6;
  }

  .error-content {
    .error-info {
      .error-title {
        font-size: $font-size-2xl;
      }

      .error-message {
        font-size: $font-size-base;
      }

      .error-actions {
        flex-direction: column;
        align-items: center;

        .el-button {
          width: 200px;
        }
      }
    }
  }
}

// 深色主题支持
@media (prefers-color-scheme: dark) {
  .error-container {
    .error-content {
      .error-info {
        .error-title {
          color: $dark-text-primary;
        }

        .error-message {
          color: $dark-text-secondary;
        }

        .error-details {
          .error-stack {
            background: $dark-bg-tertiary;
            border-color: $dark-border-primary;
            color: $dark-text-secondary;
          }
        }
      }
    }
  }
}
</style>