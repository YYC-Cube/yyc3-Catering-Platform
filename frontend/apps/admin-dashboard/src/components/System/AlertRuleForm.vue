<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="100px"
    label-position="top"
  >
    <el-form-item label="规则名称" prop="name">
      <el-input
        v-model="form.name"
        placeholder="请输入规则名称"
        maxlength="100"
        show-word-limit
      />
    </el-form-item>

    <el-form-item label="规则描述" prop="description">
      <el-input
        v-model="form.description"
        type="textarea"
        :rows="3"
        placeholder="请输入规则描述"
        maxlength="500"
        show-word-limit
      />
    </el-form-item>

    <el-form-item label="监控指标" prop="metric">
      <el-select
        v-model="form.metric"
        placeholder="选择监控指标"
        style="width: 100%;"
      >
        <el-option
          v-for="metric in availableMetrics"
          :key="metric.value"
          :label="metric.label"
          :value="metric.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="触发条件" prop="condition">
      <el-select
        v-model="form.condition"
        placeholder="选择触发条件"
        style="width: 100%;"
      >
        <el-option label="大于 (>)" value="gt" />
        <el-option label="大于等于 (>=)" value="gte" />
        <el-option label="小于 (<)" value="lt" />
        <el-option label="小于等于 (<=)" value="lte" />
        <el-option label="等于 (=)" value="eq" />
        <el-option label="不等于 (!=)" value="ne" />
        <el-option label="百分比增长" value="percent_increase" />
        <el-option label="百分比下降" value="percent_decrease" />
      </el-select>
    </el-form-item>

    <el-form-item label="阈值" prop="threshold">
      <el-input-number
        v-model="form.threshold"
        :min="0"
        :precision="2"
        placeholder="请输入阈值"
        style="width: 100%;"
      />
    </el-form-item>

    <el-form-item label="严重程度" prop="severity">
      <el-radio-group v-model="form.severity">
        <el-radio label="low">低</el-radio>
        <el-radio label="medium">中</el-radio>
        <el-radio label="high">高</el-radio>
        <el-radio label="critical">严重</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="通知方式" prop="notifications">
      <el-checkbox-group v-model="form.notifications">
        <el-checkbox label="email">邮件通知</el-checkbox>
        <el-checkbox label="sms">短信通知</el-checkbox>
        <el-checkbox label="webhook">Webhook通知</el-checkbox>
        <el-checkbox label="push">推送通知</el-checkbox>
        <el-checkbox label="desktop">桌面通知</el-checkbox>
      </el-checkbox-group>
    </el-form-item>

    <el-form-item label="启用状态">
      <el-switch
        v-model="form.enabled"
        active-text="启用"
        inactive-text="禁用"
      />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        创建规则
      </el-button>
      <el-button @click="handleCancel">取消</el-button>
    </el-form-item>
  </el-form>

  <!-- 预览区域 -->
  <div class="rule-preview" v-if="form.name && form.metric && form.condition">
    <h4>规则预览</h4>
    <div class="preview-content">
      <el-alert
        :title="getRulePreviewTitle()"
        :description="getRulePreviewDescription()"
        :type="getSeverityAlertType()"
        show-icon
        :closable="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { systemMonitorAPI, AlertSeverity } from '@/api/system-monitor'

const emit = defineEmits<{
  created: []
  cancel: []
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = reactive({
  name: '',
  description: '',
  metric: '',
  condition: '',
  threshold: 0,
  severity: 'medium' as AlertSeverity,
  notifications: [] as string[],
  enabled: true
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入规则名称', trigger: 'blur' },
    { min: 2, max: 100, message: '规则名称长度为 2 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '规则描述不能超过 500 个字符', trigger: 'blur' }
  ],
  metric: [
    { required: true, message: '请选择监控指标', trigger: 'change' }
  ],
  condition: [
    { required: true, message: '请选择触发条件', trigger: 'change' }
  ],
  threshold: [
    { required: true, message: '请输入阈值', trigger: 'blur' },
    { type: 'number', min: 0, message: '阈值必须大于等于 0', trigger: 'blur' }
  ],
  severity: [
    { required: true, message: '请选择严重程度', trigger: 'change' }
  ]
}

const availableMetrics = [
  { value: 'cpu.usage', label: 'CPU使用率' },
  { value: 'memory.usage', label: '内存使用率' },
  { value: 'disk.usage', label: '磁盘使用率' },
  { value: 'network.bandwidth', label: '网络带宽使用' },
  { value: 'database.connections', label: '数据库连接数' },
  { value: 'database.response_time', label: '数据库响应时间' },
  { value: 'application.response_time', label: '应用响应时间' },
  { value: 'application.error_rate', label: '应用错误率' },
  { value: 'application.request_rate', label: '应用请求率' },
  { value: 'system.load', label: '系统负载' }
]

const getRulePreviewTitle = () => {
  const conditionText = getConditionText(form.condition)
  const metricLabel = availableMetrics.find(m => m.value === form.metric)?.label || form.metric
  return `${metricLabel} ${conditionText} ${form.threshold}`
}

const getRulePreviewDescription = () => {
  if (!form.name) return ''

  const metricLabel = availableMetrics.find(m => m.value === form.metric)?.label || form.metric
  const conditionText = getConditionText(form.condition)
  const severityText = getSeverityText(form.severity)

  return `当 ${metricLabel} ${conditionText} ${form.threshold} 时，触发${severityText}告警`
}

const getConditionText = (condition: string) => {
  const conditionMap = {
    gt: '大于',
    gte: '大于等于',
    lt: '小于',
    lte: '小于等于',
    eq: '等于',
    ne: '不等于',
    percent_increase: '增长超过',
    percent_decrease: '下降超过'
  }
  return conditionMap[condition as keyof typeof conditionMap] || condition
}

const getSeverityText = (severity: AlertSeverity) => {
  const severityMap = {
    low: '低级',
    medium: '中级',
    high: '高级',
    critical: '严重'
  }
  return severityMap[severity] || '未知'
}

const getSeverityAlertType = () => {
  switch (form.severity) {
    case 'low':
      return 'info'
    case 'medium':
      return 'warning'
    case 'high':
      return 'warning'
    case 'critical':
      return 'error'
    default:
      return 'info'
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    await systemMonitorAPI.createAlertRule({
      name: form.name,
      description: form.description,
      metric: form.metric,
      condition: form.condition,
      threshold: form.threshold,
      severity: form.severity,
      enabled: form.enabled,
      notifications: form.notifications
    })

    ElMessage.success('告警规则创建成功')
    emit('created')
  } catch (error) {
    console.error('Create alert rule failed:', error)
    ElMessage.error('创建告警规则失败')
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.rule-preview {
  margin-top: $spacing-8;
  padding-top: $spacing-6;
  border-top: 1px solid $border-base;

  h4 {
    margin: 0 0 $spacing-4 0;
    color: $text-primary;
  }

  .preview-content {
    // Empty for now, using el-alert directly
  }
}

// 深色主题支持
@media (prefers-color-scheme: dark) {
  .rule-preview {
    border-top-color: $dark-border-primary;
  }
}
</style>