<template>
  <div class="alert-settings">
    <el-form :model="alertSettings" label-width="150px">
      <el-form-item label="CPU使用率告警阈值">
        <el-input-number
          v-model="alertSettings.cpuThreshold"
          :min="0"
          :max="100"
          :precision="1"
          :step="0.1"
          style="width: 200px"
        />
        <span class="unit">%</span>
      </el-form-item>

      <el-form-item label="内存使用率告警阈值">
        <el-input-number
          v-model="alertSettings.memoryThreshold"
          :min="0"
          :max="100"
          :precision="1"
          :step="0.1"
          style="width: 200px"
        />
        <span class="unit">%</span>
      </el-form-item>

      <el-form-item label="响应时间告警阈值">
        <el-input-number
          v-model="alertSettings.responseTimeThreshold"
          :min="0"
          :max="10000"
          :precision="0"
          :step="10"
          style="width: 200px"
        />
        <span class="unit">ms</span>
      </el-form-item>

      <el-form-item label="请求错误率告警阈值">
        <el-input-number
          v-model="alertSettings.errorRateThreshold"
          :min="0"
          :max="100"
          :precision="2"
          :step="0.01"
          style="width: 200px"
        />
        <span class="unit">%</span>
      </el-form-item>

      <el-form-item label="告警通知方式">
        <el-checkbox-group v-model="alertSettings.notificationMethods">
          <el-checkbox label="邮件">邮件</el-checkbox>
          <el-checkbox label="短信">短信</el-checkbox>
          <el-checkbox label="系统通知">系统通知</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="告警接收人">
        <el-input
          v-model="alertSettings.alertRecipients"
          type="textarea"
          :rows="3"
          placeholder="请输入接收人邮箱或手机号，多个用逗号分隔"
        />
      </el-form-item>

      <el-form-item label="告警频率限制">
        <el-select v-model="alertSettings.alertFrequency" style="width: 200px">
          <el-option label="无限制" value="none">无限制</el-option>
          <el-option label="每小时一次" value="hourly">每小时一次</el-option>
          <el-option label="每小时两次" value="twice_hourly">每小时两次</el-option>
          <el-option label="每天一次" value="daily">每天一次</el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="告警级别">
        <el-radio-group v-model="alertSettings.alertLevel">
          <el-radio label="info">信息</el-radio>
          <el-radio label="warning">警告</el-radio>
          <el-radio label="error">错误</el-radio>
          <el-radio label="critical">严重</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item>
        <div class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSave">保存设置</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const emit = defineEmits<{
  save: []
  cancel: []
}>()

// 告警设置数据
const alertSettings = reactive({
  cpuThreshold: 80.0,
  memoryThreshold: 75.0,
  responseTimeThreshold: 2000,
  errorRateThreshold: 1.0,
  notificationMethods: ['邮件', '系统通知'],
  alertRecipients: '',
  alertFrequency: 'hourly',
  alertLevel: 'warning'
})

// 保存设置
const handleSave = () => {
  // 这里可以添加表单验证逻辑
  
  // 模拟保存操作
  ElMessage.success('告警设置已保存')
  emit('save')
}

// 取消设置
const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.alert-settings {
  padding: 20px 0;
}

.unit {
  margin-left: 10px;
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
  gap: 10px;
}
</style>