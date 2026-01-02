<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="(value) => emit('update:visible', value)"
    title="创建种群"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-form :model="formData" :rules="rules" ref="formRef">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="种群名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入种群名称" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="种群描述" prop="description">
            <el-input type="textarea" v-model="formData.description" placeholder="请输入种群描述" :rows="3" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="所属系统" prop="systemId">
            <el-select v-model="formData.systemId" placeholder="选择所属学习系统">
              <el-option
                v-for="system in systems"
                :key="system.id"
                :label="system.name"
                :value="system.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="关联实验" prop="experimentId">
            <el-select v-model="formData.experimentId" placeholder="选择关联实验">
              <el-option
                v-for="experiment in experiments"
                :key="experiment.id"
                :label="experiment.name"
                :value="experiment.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="初始个体数量" prop="initialSize">
            <el-input-number v-model="formData.initialSize" :min="1" :max="1000" />
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="种群类型" prop="type">
            <el-select v-model="formData.type" placeholder="选择种群类型">
              <el-option label="遗传算法" value="genetic" />
              <el-option label="强化学习" value="reinforcement" />
              <el-option label="混合算法" value="hybrid" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="交叉率" prop="crossoverRate">
            <el-slider v-model="formData.crossoverRate" :min="0" :max="1" :step="0.01" />
            <span class="slider-value">{{ formData.crossoverRate.toFixed(2) }}</span>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="变异率" prop="mutationRate">
            <el-slider v-model="formData.mutationRate" :min="0" :max="1" :step="0.01" />
            <span class="slider-value">{{ formData.mutationRate.toFixed(2) }}</span>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="选择策略" prop="selectionStrategy">
            <el-select v-model="formData.selectionStrategy" placeholder="选择选择策略">
              <el-option label="轮盘赌选择" value="roulette" />
              <el-option label="锦标赛选择" value="tournament" />
              <el-option label="精英选择" value="elite" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="种群参数" prop="parameters">
            <el-input type="textarea" v-model="formData.parameters" placeholder="请输入JSON格式的种群参数" :rows="4" />
            <div class="parameter-tip">参数格式示例: {"key1": "value1", "key2": "value2"}</div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">创建</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits } from 'vue';

// 定义组件属性
interface System {
  id: string;
  name: string;
}

interface Experiment {
  id: string;
  name: string;
}

interface Props {
  visible: boolean;
  systems: System[];
  experiments: Experiment[];
}

// 定义组件事件
interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'create', populationData: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 表单引用
const formRef = ref();

// 表单数据
const formData = reactive({
  name: '',
  description: '',
  systemId: '',
  experimentId: '',
  initialSize: 100,
  type: 'genetic',
  crossoverRate: 0.8,
  mutationRate: 0.1,
  selectionStrategy: 'tournament',
  parameters: '{}'
});

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入种群名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入种群描述', trigger: 'blur' },
    { min: 5, max: 200, message: '长度在 5 到 200 个字符', trigger: 'blur' }
  ],
  systemId: [
    { required: true, message: '请选择所属系统', trigger: 'change' }
  ],
  initialSize: [
    { required: true, message: '请输入初始个体数量', trigger: 'blur' },
    { type: 'number', min: 1, max: 1000, message: '数量必须在 1 到 1000 之间', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择种群类型', trigger: 'change' }
  ],
  selectionStrategy: [
    { required: true, message: '请选择选择策略', trigger: 'change' }
  ],
  parameters: [
    { required: true, message: '请输入种群参数', trigger: 'blur' },
    { validator: validateJson, message: '参数格式不正确', trigger: 'blur' }
  ]
};

// 验证JSON格式
const validateJson = (rule: any, value: string, callback: any) => {
  try {
    JSON.parse(value);
    callback();
  } catch (error) {
    callback(new Error('请输入有效的JSON格式'));
  }
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
        
        // 构建种群数据
        const populationData = {
          ...formData,
          parameters
        };
        
        // 触发创建事件
        emit('create', populationData);
        
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

.parameter-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>