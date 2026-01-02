<template>
  <div class="create-cluster">
    <el-form
      ref="clusterFormRef"
      :model="clusterForm"
      :rules="clusterFormRules"
      label-width="120px"
      class="cluster-form"
    >
      <el-form-item label="集群名称" prop="name">
        <el-input
          v-model="clusterForm.name"
          placeholder="请输入集群名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="集群描述" prop="description">
        <el-input
          v-model="clusterForm.description"
          type="textarea"
          placeholder="请输入集群描述"
          :rows="4"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="集群类型" prop="type">
        <el-select
          v-model="clusterForm.type"
          placeholder="请选择集群类型"
          style="width: 100%"
        >
          <el-option label="CPU集群" value="cpu" />
          <el-option label="GPU集群" value="gpu" />
          <el-option label="混合集群" value="hybrid" />
        </el-select>
      </el-form-item>

      <el-form-item label="节点数量">
        <el-input-number
          v-model="clusterForm.nodeCount"
          :min="1"
          :max="100"
          :step="1"
          placeholder="节点数量"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="最大智能体数">
        <el-input-number
          v-model="clusterForm.maxAgents"
          :min="1"
          :max="1000"
          :step="1"
          placeholder="最大智能体数"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="内存总容量">
        <el-input-number
          v-model="clusterForm.totalMemory"
          :min="2048"
          :max="131072"
          :step="512"
          placeholder="总内存容量（MB）"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="CPU总核心数">
        <el-input-number
          v-model="clusterForm.totalCpuCores"
          :min="1"
          :max="256"
          :step="1"
          placeholder="总CPU核心数"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="GPU总数量">
        <el-input-number
          v-model="clusterForm.totalGpus"
          :min="0"
          :max="64"
          :step="1"
          placeholder="总GPU数量"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="存储容量">
        <el-input-number
          v-model="clusterForm.storageCapacity"
          :min="10240"
          :max="1048576"
          :step="1024"
          placeholder="存储容量（GB）"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="网络带宽">
        <el-input-number
          v-model="clusterForm.networkBandwidth"
          :min="1"
          :max="100"
          :step="1"
          placeholder="网络带宽（Gbps）"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="集群状态">
        <el-switch v-model="clusterForm.status" active-text="启用" inactive-text="禁用" />
      </el-form-item>

      <el-form-item label="" class="form-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleCreate" :loading="loading">
          创建集群
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { multiAgentAPI } from '@/api/multi-agent'
import type { Cluster } from '@/api/multi-agent'

const emit = defineEmits<{
  success: [cluster: Cluster]
  cancel: []
}>()

// 响应式数据
const loading = ref(false)
const clusterFormRef = ref()

// 表单数据
const clusterForm = reactive({
  name: '',
  description: '',
  type: 'cpu',
  nodeCount: 1,
  maxAgents: 10,
  totalMemory: 4096,
  totalCpuCores: 4,
  totalGpus: 0,
  storageCapacity: 100,
  networkBandwidth: 1,
  status: true
})

// 表单验证规则
const clusterFormRules = {
  name: [
    { required: true, message: '请输入集群名称', trigger: 'blur' },
    { min: 2, max: 50, message: '名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入集群描述', trigger: 'blur' },
    { min: 5, max: 200, message: '描述长度在 5 到 200 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择集群类型', trigger: 'change' }
  ]
}

// 取消创建
const handleCancel = () => {
  emit('cancel')
}

// 创建集群
const handleCreate = async () => {
  if (!clusterFormRef.value) return
  
  // 验证表单
  await clusterFormRef.value.validate((valid: boolean) => {
    if (!valid) return
    
    // 提交创建
    doCreate()
  })
}

// 执行创建操作
const doCreate = async () => {
  loading.value = true
  try {
    const newCluster = await multiAgentAPI.createCluster(clusterForm)
    ElMessage.success('集群创建成功')
    emit('success', newCluster)
  } catch (error) {
    ElMessage.error('集群创建失败，请重试')
    console.error('Create cluster failed:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.create-cluster {
  padding: 20px 0;
}

.cluster-form {
  max-width: 600px;
}

.form-actions {
  text-align: right;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>