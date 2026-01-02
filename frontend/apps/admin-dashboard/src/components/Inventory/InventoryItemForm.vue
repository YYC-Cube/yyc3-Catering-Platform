<template>
  <div class="inventory-item-form">
    <el-form :model="formData" :rules="rules" ref="formRef">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="商品名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入商品名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="商品编码" prop="code">
            <el-input v-model="formData.code" placeholder="请输入商品编码" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="分类" prop="category">
            <el-select v-model="formData.category" placeholder="选择商品分类">
              <el-option label="水果" value="fruit" />
              <el-option label="蔬菜" value="vegetable" />
              <el-option label="肉类" value="meat" />
              <el-option label="水产" value="seafood" />
              <el-option label="干货" value="dry" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="单位" prop="unit">
            <el-select v-model="formData.unit" placeholder="选择计量单位">
              <el-option label="个" value="个" />
              <el-option label="千克" value="kg" />
              <el-option label="克" value="g" />
              <el-option label="箱" value="箱" />
              <el-option label="包" value="包" />
              <el-option label="瓶" value="瓶" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="当前库存" prop="currentStock">
            <el-input-number v-model="formData.currentStock" :min="0" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="安全库存" prop="safetyStock">
            <el-input-number v-model="formData.safetyStock" :min="0" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="成本价" prop="costPrice">
            <el-input-number v-model="formData.costPrice" :min="0" :precision="2" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="售价" prop="sellPrice">
            <el-input-number v-model="formData.sellPrice" :min="0" :precision="2" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="商品描述" prop="description">
            <el-input type="textarea" v-model="formData.description" placeholder="请输入商品描述" :rows="3" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio label="active">启用</el-radio>
              <el-radio label="inactive">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits } from 'vue';

// 定义组件属性
interface Props {
  modelValue?: {
    id?: string;
    name: string;
    code: string;
    category: string;
    unit: string;
    currentStock: number;
    safetyStock: number;
    costPrice: number;
    sellPrice: number;
    description: string;
    status: 'active' | 'inactive';
  };
}

// 定义组件事件
interface Emits {
  (e: 'update:modelValue', value: Props['modelValue']): void;
  (e: 'validate', callback: (valid: boolean) => void): void;
  (e: 'reset'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 表单引用
const formRef = ref();

// 表单数据
const formData = reactive({
  id: '',
  name: '',
  code: '',
  category: '',
  unit: '',
  currentStock: 0,
  safetyStock: 0,
  costPrice: 0,
  sellPrice: 0,
  description: '',
  status: 'active'
});

// 监听modelValue变化，更新表单数据
if (props.modelValue) {
  Object.assign(formData, props.modelValue);
}

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入商品编码', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择商品分类', trigger: 'blur' }
  ],
  unit: [
    { required: true, message: '请选择计量单位', trigger: 'blur' }
  ],
  currentStock: [
    { required: true, message: '请输入当前库存', trigger: 'blur' },
    { type: 'number', min: 0, message: '库存数量不能小于0', trigger: 'blur' }
  ],
  safetyStock: [
    { required: true, message: '请输入安全库存', trigger: 'blur' },
    { type: 'number', min: 0, message: '安全库存不能小于0', trigger: 'blur' }
  ],
  costPrice: [
    { required: true, message: '请输入成本价', trigger: 'blur' },
    { type: 'number', min: 0, message: '成本价不能小于0', trigger: 'blur' }
  ],
  sellPrice: [
    { required: true, message: '请输入售价', trigger: 'blur' },
    { type: 'number', min: 0, message: '售价不能小于0', trigger: 'blur' }
  ]
};

// 定义暴露的方法
defineExpose({
  // 验证表单
  validate: async (callback: (valid: boolean) => void) => {
    if (!formRef.value) {
      callback(false);
      return;
    }
    await formRef.value.validate((valid: boolean) => {
      callback(valid);
    });
  },
  
  // 重置表单
  resetFields: () => {
    if (formRef.value) {
      formRef.value.resetFields();
    }
  },
  
  // 获取表单数据
  getFormData: () => {
    return formData;
  }
});
</script>

<style scoped>
.inventory-item-form {
  padding: 20px;
}
</style>