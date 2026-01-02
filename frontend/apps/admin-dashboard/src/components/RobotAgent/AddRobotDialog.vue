<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="(value) => emit('update:visible', value)"
    title="创建机器人代理"
    width="900px"
    :before-close="handleClose"
    destroy-on-close
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
          <el-form-item label="机器人名称" prop="name">
            <el-input
              v-model="formData.name"
              placeholder="请输入机器人名称"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="机器人类型" prop="type">
            <el-select
              v-model="formData.type"
              placeholder="请选择机器人类型"
              style="width: 100%"
            >
              <el-option label="客服机器人" value="customer_service" />
              <el-option label="销售机器人" value="sales" />
              <el-option label="调度机器人" value="scheduling" />
              <el-option label="监控机器人" value="monitoring" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="所属部门" prop="department">
            <el-select
              v-model="formData.department"
              placeholder="请选择所属部门"
              style="width: 100%"
            >
              <el-option label="餐饮部" value="catering" />
              <el-option label="财务部" value="finance" />
              <el-option label="人力资源部" value="hr" />
              <el-option label="技术部" value="technology" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-switch
              v-model="formData.status"
              active-value="active"
              inactive-value="inactive"
              active-text="启用"
              inactive-text="禁用"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="机器人描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          placeholder="请输入机器人描述"
          :rows="3"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="配置参数" prop="config">
        <el-input
          v-model="formData.config"
          type="textarea"
          placeholder="请输入配置参数（JSON格式）"
          :rows="5"
          maxlength="1000"
          show-word-limit
        />
      </el-form-item>

      <el-divider />

      <el-form-item label="高级设置">
        <el-collapse v-model="activeNames">
          <el-collapse-item title="API设置" name="1">
            <el-form-item label="API密钥" prop="apiKey">
              <el-input
                v-model="formData.apiKey"
                type="password"
                placeholder="请输入API密钥"
                show-password
                maxlength="100"
              />
            </el-form-item>
            <el-form-item label="API端点" prop="apiEndpoint">
              <el-input
                v-model="formData.apiEndpoint"
                placeholder="请输入API端点"
                maxlength="200"
              />
            </el-form-item>
          </el-collapse-item>

          <el-collapse-item title="权限设置" name="2">
            <el-form-item label="权限级别">
              <el-radio-group v-model="formData.permissionLevel">
                <el-radio label="basic">基础权限</el-radio>
                <el-radio label="advanced">高级权限</el-radio>
                <el-radio label="admin">管理员权限</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          创建设置
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch } from 'vue'
import { ElForm, ElMessage } from 'element-plus'

// 定义属性
const props = defineProps<{
  visible: boolean
  robotData?: any
}>()

// 定义事件
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: any): void
}>()

// 状态管理
const formRef = ref<InstanceType<typeof ElForm>>()
const submitting = ref(false)
const activeNames = ref(['1'])

// 表单数据
const formData = reactive({
  name: '',
  type: 'customer_service',
  department: '',
  status: 'active',
  description: '',
  config: '{}',
  apiKey: '',
  apiEndpoint: '',
  permissionLevel: 'basic'
})

// 表单验证规则
const formRules = reactive({
  name: [
    { required: true, message: '请输入机器人名称', trigger: 'blur' },
    { min: 2, max: 50, message: '机器人名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择机器人类型', trigger: 'change' }
  ],
  department: [
    { required: true, message: '请选择所属部门', trigger: 'change' }
  ],
  description: [
    { max: 200, message: '机器人描述不能超过 200 个字符', trigger: 'blur' }
  ],
  config: [
    { required: true, message: '请输入配置参数', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        try {
          JSON.parse(value)
          callback()
        } catch (error) {
          callback(new Error('配置参数必须是有效的JSON格式'))
        }
      },
      trigger: 'blur'
    }
  ]
})

// 监听visible变化，初始化表单数据
watch(
  () => props.visible,
  (newValue) => {
    if (newValue) {
      // 如果有机器人数据，则加载数据
      if (props.robotData) {
        Object.assign(formData, props.robotData)
      } else {
        // 重置表单
        resetForm()
      }
    }
  },
  { immediate: true }
)

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    name: '',
    type: 'customer_service',
    department: '',
    status: 'active',
    description: '',
    config: '{}',
    apiKey: '',
    apiEndpoint: '',
    permissionLevel: 'basic'
  })
  activeNames.value = ['1']
}

// 处理关闭
const handleClose = () => {
  emit('update:visible', false)
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    // 验证配置参数是否为有效的JSON
    try {
      JSON.parse(formData.config)
    } catch (error) {
      throw new Error('配置参数必须是有效的JSON格式')
    }
    
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 触发提交事件
    emit('submit', { ...formData })
    
    // 关闭弹窗
    handleClose()
    
    // 显示成功消息
    ElMessage.success('机器人代理创建成功')
  } catch (error: any) {
    console.error('创建机器人代理失败:', error)
    ElMessage.error(error.message || '创建机器人代理失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.el-collapse {
  border: none;
}

.el-collapse-item__header {
  background-color: #f5f7fa;
  border-radius: 4px;
}

.el-collapse-item__content {
  padding-top: 20px;
}
</style>