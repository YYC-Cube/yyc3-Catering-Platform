<template>
  <div class="customer-form">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      size="large"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="客户姓名" prop="name">
            <el-input
              v-model="formData.name"
              placeholder="请输入客户姓名"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客户类型" prop="type">
            <el-select
              v-model="formData.type"
              placeholder="请选择客户类型"
              style="width: 100%"
            >
              <el-option label="个人客户" value="individual" />
              <el-option label="企业客户" value="enterprise" />
              <el-option label="政府客户" value="government" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="联系电话" prop="phone">
            <el-input
              v-model="formData.phone"
              placeholder="请输入联系电话"
              maxlength="20"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="电子邮箱" prop="email">
            <el-input
              v-model="formData.email"
              type="email"
              placeholder="请输入电子邮箱"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="身份证号" prop="idCard">
            <el-input
              v-model="formData.idCard"
              placeholder="请输入身份证号"
              maxlength="18"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别" prop="gender">
            <el-select
              v-model="formData.gender"
              placeholder="请选择性别"
              style="width: 100%"
            >
              <el-option label="男" value="male" />
              <el-option label="女" value="female" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="生日" prop="birthday">
            <el-date-picker
              v-model="formData.birthday"
              type="date"
              placeholder="请选择生日"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客户等级" prop="level">
            <el-select
              v-model="formData.level"
              placeholder="请选择客户等级"
              style="width: 100%"
            >
              <el-option label="普通客户" value="normal" />
              <el-option label="银卡客户" value="silver" />
              <el-option label="金卡客户" value="gold" />
              <el-option label="钻石客户" value="diamond" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="客户地址" prop="address">
        <el-input
          v-model="formData.address"
          type="textarea"
          placeholder="请输入客户地址"
          :rows="2"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="客户备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          placeholder="请输入客户备注"
          :rows="3"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-divider />

      <el-form-item label="企业信息" v-if="formData.type === 'enterprise'">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="企业名称" prop="companyName">
              <el-input
                v-model="formData.companyName"
                placeholder="请输入企业名称"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="企业税号" prop="taxNumber">
              <el-input
                v-model="formData.taxNumber"
                placeholder="请输入企业税号"
                maxlength="20"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="企业地址" prop="companyAddress">
              <el-input
                v-model="formData.companyAddress"
                type="textarea"
                placeholder="请输入企业地址"
                :rows="2"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="企业电话" prop="companyPhone">
              <el-input
                v-model="formData.companyPhone"
                placeholder="请输入企业电话"
                maxlength="20"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch } from 'vue'
import { ElForm, ElMessage } from 'element-plus'

// 定义属性
const props = defineProps<{
  modelValue?: any
  isEdit?: boolean
}>()

// 定义事件
const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
  (e: 'validate'): Promise<boolean>
}>()

// 状态管理
const formRef = ref<InstanceType<typeof ElForm>>()

// 表单数据
const formData = reactive({
  // 基本信息
  name: '',
  type: 'individual',
  phone: '',
  email: '',
  idCard: '',
  gender: 'male',
  birthday: '',
  level: 'normal',
  address: '',
  remark: '',
  // 企业信息
  companyName: '',
  taxNumber: '',
  companyAddress: '',
  companyPhone: ''
})

// 表单验证规则
const formRules = reactive({
  name: [
    { required: true, message: '请输入客户姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '客户姓名长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择客户类型', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号码',
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入电子邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的电子邮箱', trigger: 'blur' }
  ],
  idCard: [
    {
      required: true,
      message: '请输入身份证号',
      trigger: 'blur'
    },
    {
      pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
      message: '请输入正确的身份证号',
      trigger: 'blur'
    }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  address: [
    { required: true, message: '请输入客户地址', trigger: 'blur' },
    { min: 5, max: 200, message: '客户地址长度在 5 到 200 个字符', trigger: 'blur' }
  ],
  // 企业信息验证规则
  companyName: [
    {
      required: formData.type === 'enterprise',
      message: '请输入企业名称',
      trigger: 'blur'
    }
  ],
  taxNumber: [
    {
      required: formData.type === 'enterprise',
      message: '请输入企业税号',
      trigger: 'blur'
    }
  ],
  companyAddress: [
    {
      required: formData.type === 'enterprise',
      message: '请输入企业地址',
      trigger: 'blur'
    }
  ],
  companyPhone: [
    {
      required: formData.type === 'enterprise',
      message: '请输入企业电话',
      trigger: 'blur'
    },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的企业电话',
      trigger: 'blur'
    }
  ]
})

// 监听modelValue变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      Object.assign(formData, newValue)
    } else {
      resetForm()
    }
  },
  { immediate: true, deep: true }
)

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    name: '',
    type: 'individual',
    phone: '',
    email: '',
    idCard: '',
    gender: 'male',
    birthday: '',
    level: 'normal',
    address: '',
    remark: '',
    companyName: '',
    taxNumber: '',
    companyAddress: '',
    companyPhone: ''
  })
}

// 验证表单
const validateForm = async () => {
  if (!formRef.value) return false
  return formRef.value.validate()
}

// 导出方法
defineExpose({
  validate: validateForm,
  resetForm
})
</script>

<style scoped>
.customer-form {
  padding: 20px 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .customer-form {
    padding: 10px 0;
  }
  
  .el-form {
    label-width: 100px;
  }
}
</style>