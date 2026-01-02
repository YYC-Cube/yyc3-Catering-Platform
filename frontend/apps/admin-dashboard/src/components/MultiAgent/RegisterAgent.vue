<template>
  <div class="register-agent">
    <el-form
      ref="agentFormRef"
      :model="agentForm"
      :rules="agentFormRules"
      label-width="120px"
      class="agent-form"
    >
      <el-form-item label="智能体名称" prop="name">
        <el-input
          v-model="agentForm.name"
          placeholder="请输入智能体名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="智能体类型" prop="type">
        <el-select
          v-model="agentForm.type"
          placeholder="请选择智能体类型"
          style="width: 100%"
        >
          <el-option label="客户服务" value="customer_service" />
          <el-option label="营销推广" value="marketing" />
          <el-option label="运营管理" value="operation" />
          <el-option label="技术支持" value="technical" />
          <el-option label="决策分析" value="decision" />
        </el-select>
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input
          v-model="agentForm.description"
          type="textarea"
          placeholder="请输入智能体描述"
          :rows="4"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="版本" prop="version">
        <el-input
          v-model="agentForm.version"
          placeholder="请输入版本号，默认1.0.0"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="负责人" prop="owner">
        <el-input
          v-model="agentForm.owner"
          placeholder="请输入负责人名称"
          maxlength="30"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="所属集群" prop="cluster">
        <el-input
          v-model="agentForm.cluster"
          placeholder="请输入所属集群名称"
          maxlength="30"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="内存限制">
        <el-input-number
          v-model="agentForm.memoryLimit"
          :min="256"
          :max="8192"
          :step="128"
          placeholder="内存限制（MB）"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="CPU限制">
        <el-input-number
          v-model="agentForm.cpuLimit"
          :min="0.1"
          :max="8"
          :step="0.1"
          :precision="1"
          placeholder="CPU限制（核数）"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="配置参数" prop="config">
        <el-input
          v-model="configStr"
          type="textarea"
          placeholder="请输入JSON格式的配置参数"
          :rows="6"
          maxlength="1000"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="" class="form-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleRegister" :loading="loading">
          注册智能体
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { multiAgentAPI } from '@/api/multi-agent'
import type { Agent } from '@/api/multi-agent'

const emit = defineEmits<{
  success: [agent: Agent]
  cancel: []
}>()

// 响应式数据
const loading = ref(false)
const agentFormRef = ref()
const configStr = ref('{\n  "model": "default",\n  "maxTokens": 1000\n}')

// 表单数据
const agentForm = reactive({
  name: '',
  type: '',
  description: '',
  version: '1.0.0',
  owner: '系统',
  cluster: 'default',
  memoryLimit: null,
  cpuLimit: null,
  config: {}
})

// 表单验证规则
const agentFormRules = {
  name: [
    { required: true, message: '请输入智能体名称', trigger: 'blur' },
    { min: 2, max: 50, message: '名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择智能体类型', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入智能体描述', trigger: 'blur' },
    { min: 5, max: 200, message: '描述长度在 5 到 200 个字符', trigger: 'blur' }
  ],
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' },
    { pattern: /^\d+(\.\d+)*$/, message: '版本号格式不正确', trigger: 'blur' }
  ]
}

// 取消注册
const handleCancel = () => {
  emit('cancel')
}

// 验证配置参数JSON格式
const validateConfig = () => {
  try {
    agentForm.config = JSON.parse(configStr.value)
    return true
  } catch (error) {
    ElMessage.error('配置参数格式错误，请检查JSON格式')
    return false
  }
}

// 注册智能体
const handleRegister = async () => {
  if (!agentFormRef.value) return
  
  // 验证表单
  await agentFormRef.value.validate((valid: boolean) => {
    if (!valid) return
    
    // 验证JSON格式
    if (!validateConfig()) return
    
    // 提交注册
    doRegister()
  })
}

// 执行注册操作
const doRegister = async () => {
  loading.value = true
  try {
    const newAgent = await multiAgentAPI.registerAgent(agentForm)
    ElMessage.success('智能体注册成功')
    emit('success', newAgent)
  } catch (error) {
    ElMessage.error('智能体注册失败，请重试')
    console.error('Register agent failed:', error)
  } finally {
    loading.value = false
  }
}

// 组件挂载时初始化
onMounted(() => {
  // 可以在这里添加初始化逻辑
})
</script>

<style scoped>
.register-agent {
  padding: 20px 0;
}

.agent-form {
  max-width: 600px;
}

.form-actions {
  text-align: right;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>