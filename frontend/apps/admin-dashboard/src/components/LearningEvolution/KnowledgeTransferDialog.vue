<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="(value) => emit('update:visible', value)"
    title="知识迁移"
    width="700px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-form :model="formData" :rules="rules" ref="formRef">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="源种群" prop="sourcePopulationId">
            <el-select v-model="formData.sourcePopulationId" placeholder="选择知识源种群">
              <el-option
                v-for="population in populations"
                :key="population.id"
                :label="population.name"
                :value="population.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="目标种群" prop="targetPopulationId">
            <el-select v-model="formData.targetPopulationId" placeholder="选择知识目标种群">
              <el-option
                v-for="population in populations"
                :key="population.id"
                :label="population.name"
                :value="population.id"
                :disabled="population.id === formData.sourcePopulationId"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="迁移类型" prop="transferType">
            <el-select v-model="formData.transferType" placeholder="选择知识迁移类型">
              <el-option label="个体迁移" value="individual" />
              <el-option label="知识提取" value="knowledge_extraction" />
              <el-option label="模型参数" value="model_parameters" />
              <el-option label="规则迁移" value="rule_transfer" />
              <el-option label="经验迁移" value="experience_transfer" />
            </el-select>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="迁移比例" prop="transferRatio">
            <el-slider v-model="formData.transferRatio" :min="0.1" :max="1" :step="0.1" />
            <span class="slider-value">{{ (formData.transferRatio * 100).toFixed(0) }}%</span>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="迁移策略" prop="transferStrategy">
            <el-select v-model="formData.transferStrategy" placeholder="选择迁移策略">
              <el-option label="直接迁移" value="direct" />
              <el-option label="过滤迁移" value="filtered" />
              <el-option label="自适应迁移" value="adaptive" />
              <el-option label="渐进式迁移" value="progressive" />
              <el-option label="选择性迁移" value="selective" />
            </el-select>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="迁移时机" prop="transferTiming">
            <el-select v-model="formData.transferTiming" placeholder="选择迁移时机">
              <el-option label="立即执行" value="immediate" />
              <el-option label="在下一代开始前" value="before_generation" />
              <el-option label="在特定代数" value="at_generation" />
              <el-option label="手动触发" value="manual" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="特定代数" prop="targetGeneration" v-if="formData.transferTiming === 'at_generation'">
            <el-input-number v-model="formData.targetGeneration" :min="1" :step="1" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="迁移条件" prop="transferConditions">
            <el-input type="textarea" v-model="formData.transferConditions" placeholder="请输入迁移条件表达式" :rows="2" />
            <div class="condition-tip">条件示例: fitness > 0.8 && age < 10</div>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="迁移描述" prop="description">
            <el-input type="textarea" v-model="formData.description" placeholder="请输入知识迁移描述" :rows="3" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="迁移参数" prop="parameters">
            <el-input type="textarea" v-model="formData.parameters" placeholder="请输入JSON格式的迁移参数" :rows="4" />
            <div class="parameter-tip">参数格式示例: {"crossoverRate": 0.8, "mutationRate": 0.1}</div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">执行迁移</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits } from 'vue';

// 定义组件属性
interface Population {
  id: string;
  name: string;
}

interface Props {
  visible: boolean;
  populations: Population[];
}

// 定义组件事件
interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'transfer', transferData: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 表单引用
const formRef = ref();

// 表单数据
const formData = reactive({
  sourcePopulationId: '',
  targetPopulationId: '',
  transferType: 'individual',
  transferRatio: 0.3,
  transferStrategy: 'direct',
  transferTiming: 'immediate',
  targetGeneration: 1,
  transferConditions: '',
  description: '',
  parameters: '{}'
});

// 表单验证规则
const rules = {
  sourcePopulationId: [
    { required: true, message: '请选择源种群', trigger: 'change' }
  ],
  targetPopulationId: [
    { required: true, message: '请选择目标种群', trigger: 'change' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value && value === formData.sourcePopulationId) {
          callback(new Error('源种群和目标种群不能相同'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],
  transferType: [
    { required: true, message: '请选择迁移类型', trigger: 'change' }
  ],
  transferRatio: [
    { required: true, message: '请设置迁移比例', trigger: 'blur' },
    { type: 'number', min: 0.1, max: 1, message: '迁移比例必须在0.1到1之间', trigger: 'blur' }
  ],
  transferStrategy: [
    { required: true, message: '请选择迁移策略', trigger: 'change' }
  ],
  transferTiming: [
    { required: true, message: '请选择迁移时机', trigger: 'change' }
  ],
  targetGeneration: [
    {
      validator: (rule: any, value: number, callback: any) => {
        if (formData.transferTiming === 'at_generation' && !value) {
          callback(new Error('请设置特定代数'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 取消操作
const handleCancel = () => {
  emit('update:visible', false);
  resetForm();
};

// 提交操作
const handleSubmit = () => {
  if (!formRef.value) return;
  
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      // 验证参数JSON格式
      try {
        const parameters = JSON.parse(formData.parameters);
        
        // 构建迁移数据
        const transferData = {
          ...formData,
          parameters
        };
        
        // 触发迁移事件
        emit('transfer', transferData);
        
        // 重置表单
        resetForm();
        
        // 关闭对话框
        emit('update:visible', false);
      } catch (error) {
        ElMessage.error('参数格式不正确，请输入有效的JSON');
      }
    }
  });
};

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  
  // 重置参数默认值
  formData.parameters = '{}';
};
</script>

<style scoped>
.slider-value {
  margin-left: 10px;
  font-size: 14px;
  color: #606266;
}

.condition-tip,
.parameter-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>