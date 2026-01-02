<template>
  <div class="create-system-dialog">
    <el-dialog
      v-model="dialogVisible"
      title="创建学习系统"
      width="800px"
      :before-close="handleClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        size="large"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="系统名称" prop="name">
              <el-input
                v-model="formData.name"
                placeholder="请输入系统名称"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="系统类型" prop="type">
              <el-select
                v-model="formData.type"
                placeholder="请选择系统类型"
                style="width: 100%"
              >
                <el-option label="决策系统" value="decision" />
                <el-option label="推荐系统" value="recommendation" />
                <el-option label="预测系统" value="prediction" />
                <el-option label="分类系统" value="classification" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="系统描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="请输入系统描述"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="核心算法" prop="algorithm">
              <el-input
                v-model="formData.algorithm"
                placeholder="请输入核心算法"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数据源" prop="dataSource">
              <el-input
                v-model="formData.dataSource"
                placeholder="请输入数据源"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="系统配置" prop="config">
          <el-input
            v-model="formData.config"
            type="textarea"
            placeholder="请输入系统配置（JSON格式）"
            :rows="4"
          />
        </el-form-item>

        <el-form-item label="预期目标" prop="target">
          <el-input
            v-model="formData.target"
            type="textarea"
            placeholder="请输入系统预期目标"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定创建
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, onMounted } from 'vue'
import { ElForm, ElMessage } from 'element-plus'

// 定义属性
const props = defineProps<{
  visible: boolean
}>()

// 定义事件
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: any): void
  (e: 'close'): void
}>()

// 表单引用
const formRef = ref<InstanceType<typeof ElForm>>()

// 对话框可见性
const dialogVisible = ref(props.visible)

// 提交状态
const submitting = ref(false)

// 表单数据
const formData = reactive({
  name: '',
  type: '',
  description: '',
  algorithm: '',
  dataSource: '',
  config: '',
  target: ''
})

// 表单验证规则
const formRules = reactive({
  name: [
    { required: true, message: '请输入系统名称', trigger: 'blur' },
    { min: 2, max: 50, message: '系统名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择系统类型', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入系统描述', trigger: 'blur' },
    { min: 10, max: 200, message: '系统描述长度在 10 到 200 个字符', trigger: 'blur' }
  ],
  algorithm: [
    { required: true, message: '请输入核心算法', trigger: 'blur' }
  ],
  dataSource: [
    { required: true, message: '请输入数据源', trigger: 'blur' }
  ]
})

// 监听对话框可见性变化
const updateVisible = () => {
  emit('update:visible', dialogVisible.value)
}

// 处理关闭
const handleClose = () => {
  dialogVisible.value = false
  updateVisible()
  resetForm()
  emit('close')
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    name: '',
    type: '',
    description: '',
    algorithm: '',
    dataSource: '',
    config: '',
    target: ''
  })
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    // 验证配置是否为有效的JSON格式
    if (formData.config) {
      try {
        JSON.parse(formData.config)
      } catch (error) {
        ElMessage.error('系统配置必须是有效的JSON格式')
        submitting.value = false
        return
      }
    }

    // 提交表单数据
    emit('submit', { ...formData })
    
    // 显示成功消息
    ElMessage.success('系统创建成功')
    
    // 关闭对话框
    handleClose()
  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.error('表单验证失败，请检查输入内容')
  } finally {
    submitting.value = false
  }
}

// 监听外部visible属性变化
onMounted(() => {
  dialogVisible.value = props.visible
})

// 监听对话框可见性变化，同步到外部
const unwatchVisible = () => {
  if (dialogVisible.value !== props.visible) {
    dialogVisible.value = props.visible
  }
}

// 清理
const cleanup = () => {
  unwatchVisible()
}

// 暴露方法
defineExpose({
  resetForm,
  cleanup
})
</script>

<style scoped>
.create-system-dialog {
  /* 组件样式 */
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .el-dialog {
    width: 90% !important;
    margin: 20px auto;
  }
}
</style>