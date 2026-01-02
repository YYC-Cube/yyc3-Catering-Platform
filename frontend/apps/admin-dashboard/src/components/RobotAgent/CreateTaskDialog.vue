<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="(value) => emit('update:visible', value)"
    title="创建机器人任务"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-form :model="formData" :rules="rules" ref="formRef">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="任务名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入任务名称" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="任务描述" prop="description">
            <el-input type="textarea" v-model="formData.description" placeholder="请输入任务描述" :rows="3" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="机器人选择" prop="robotId">
            <el-select v-model="formData.robotId" placeholder="选择要执行任务的机器人">
              <el-option
                v-for="robot in robots"
                :key="robot.id"
                :label="robot.name"
                :value="robot.id"
              >
                <div class="robot-option">
                  <span>{{ robot.name }}</span>
                  <span class="robot-status" :class="robot.status">{{ getStatusText(robot.status) }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="任务类型" prop="type">
            <el-select v-model="formData.type" placeholder="选择任务类型">
              <el-option label="数据收集" value="data_collection" />
              <el-option label="数据分析" value="data_analysis" />
              <el-option label="报告生成" value="report_generation" />
              <el-option label="客户服务" value="customer_service" />
              <el-option label="库存管理" value="inventory_management" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="优先级" prop="priority">
            <el-select v-model="formData.priority" placeholder="选择任务优先级">
              <el-option label="低" value="low" />
              <el-option label="中" value="medium" />
              <el-option label="高" value="high" />
              <el-option label="紧急" value="urgent" />
            </el-select>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="截止时间" prop="deadline">
            <el-date-picker
              v-model="formData.deadline"
              type="datetime"
              placeholder="选择截止时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="执行参数" prop="parameters">
            <el-input type="textarea" v-model="formData.parameters" placeholder="请输入JSON格式的执行参数" :rows="4" />
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
interface Robot {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'busy' | 'error';
}

interface Props {
  visible: boolean;
  robots: Robot[];
}

// 定义组件事件
interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'create', taskData: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 表单引用
const formRef = ref();

// 表单数据
const formData = reactive({
  name: '',
  description: '',
  robotId: '',
  type: '',
  priority: 'medium',
  deadline: '',
  parameters: '{}'
});

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入任务描述', trigger: 'blur' },
    { min: 5, max: 200, message: '长度在 5 到 200 个字符', trigger: 'blur' }
  ],
  robotId: [
    { required: true, message: '请选择机器人', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择任务类型', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择任务优先级', trigger: 'change' }
  ],
  parameters: [
    { required: true, message: '请输入执行参数', trigger: 'blur' },
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

// 获取机器人状态文本
const getStatusText = (status: string) => {
  const statuses = {
    online: '在线',
    offline: '离线',
    busy: '忙碌',
    error: '异常'
  };
  return statuses[status as keyof typeof statuses] || status;
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
        
        // 构建任务数据
        const taskData = {
          ...formData,
          parameters
        };
        
        // 触发创建事件
        emit('create', taskData);
        
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
.robot-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.robot-status {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
}

.robot-status.online {
  background-color: #f0f9eb;
  color: #67c23a;
}

.robot-status.offline {
  background-color: #f5f5f5;
  color: #909399;
}

.robot-status.busy {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.robot-status.error {
  background-color: #fef0f0;
  color: #f56c6c;
}

.parameter-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>