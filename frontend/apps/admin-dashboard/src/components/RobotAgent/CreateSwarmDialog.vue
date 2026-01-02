<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="(value) => emit('update:visible', value)"
    title="创建机器人集群"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-form :model="formData" :rules="rules" ref="formRef">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="集群名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入机器人集群名称" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="集群描述" prop="description">
            <el-input type="textarea" v-model="formData.description" placeholder="请输入机器人集群描述" :rows="3" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="集群类型" prop="type">
            <el-select v-model="formData.type" placeholder="选择机器人集群类型">
              <el-option label="任务协作型" value="task_cooperation" />
              <el-option label="知识共享型" value="knowledge_sharing" />
              <el-option label="负载均衡型" value="load_balancing" />
              <el-option label="容错冗余型" value="fault_tolerance" />
              <el-option label="混合功能型" value="hybrid" />
            </el-select>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="集群规模" prop="size">
            <el-input-number v-model="formData.size" :min="2" :max="1000" :step="1" placeholder="请输入集群规模" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="调度算法" prop="schedulingAlgorithm">
            <el-select v-model="formData.schedulingAlgorithm" placeholder="选择调度算法">
              <el-option label="轮询调度" value="round_robin" />
              <el-option label="负载均衡" value="load_balancing" />
              <el-option label="最短路径" value="shortest_path" />
              <el-option label="智能调度" value="intelligent" />
              <el-option label="自定义" value="custom" />
            </el-select>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="通信协议" prop="communicationProtocol">
            <el-select v-model="formData.communicationProtocol" placeholder="选择通信协议">
              <el-option label="MQTT" value="mqtt" />
              <el-option label="WebSocket" value="websocket" />
              <el-option label="gRPC" value="grpc" />
              <el-option label="RESTful" value="restful" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="最大任务数" prop="maxTasks">
            <el-input-number v-model="formData.maxTasks" :min="1" :max="10000" :step="1" placeholder="请输入最大任务数" />
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="优先级" prop="priority">
            <el-select v-model="formData.priority" placeholder="选择集群优先级">
              <el-option label="低" value="low" />
              <el-option label="中" value="medium" />
              <el-option label="高" value="high" />
              <el-option label="紧急" value="urgent" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="机器人选择" prop="robotIds">
            <el-select
              v-model="formData.robotIds"
              placeholder="选择要加入集群的机器人"
              multiple
              collapse-tags
              style="width: 100%"
            >
              <el-option
                v-for="robot in robots"
                :key="robot.id"
                :label="robot.name"
                :value="robot.id"
              />
            </el-select>
            <div class="robot-count">已选择 {{ formData.robotIds.length }} 个机器人</div>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="集群参数" prop="parameters">
            <el-input type="textarea" v-model="formData.parameters" placeholder="请输入JSON格式的集群参数" :rows="4" />
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
}

interface Props {
  visible: boolean;
  robots: Robot[];
}

// 定义组件事件
interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'create', swarmData: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 表单引用
const formRef = ref();

// 表单数据
const formData = reactive({
  name: '',
  description: '',
  type: 'task_cooperation',
  size: 10,
  schedulingAlgorithm: 'round_robin',
  communicationProtocol: 'mqtt',
  maxTasks: 100,
  priority: 'medium',
  robotIds: [],
  parameters: '{}'
});

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入集群名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入集群描述', trigger: 'blur' },
    { min: 5, max: 200, message: '长度在 5 到 200 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择集群类型', trigger: 'change' }
  ],
  size: [
    { required: true, message: '请输入集群规模', trigger: 'blur' },
    { type: 'number', min: 2, max: 1000, message: '集群规模必须在 2 到 1000 之间', trigger: 'blur' }
  ],
  schedulingAlgorithm: [
    { required: true, message: '请选择调度算法', trigger: 'change' }
  ],
  communicationProtocol: [
    { required: true, message: '请选择通信协议', trigger: 'change' }
  ],
  maxTasks: [
    { required: true, message: '请输入最大任务数', trigger: 'blur' },
    { type: 'number', min: 1, message: '最大任务数必须大于 0', trigger: 'blur' }
  ],
  priority: [
    { required: true, message: '请选择集群优先级', trigger: 'change' }
  ],
  robotIds: [
    { required: true, message: '请选择至少一个机器人', trigger: 'change' },
    {
      validator: (rule: any, value: string[], callback: any) => {
        if (value.length < 2) {
          callback(new Error('集群至少需要 2 个机器人'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],
  parameters: [
    { required: true, message: '请输入集群参数', trigger: 'blur' },
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
        
        // 构建集群数据
        const swarmData = {
          ...formData,
          parameters
        };
        
        // 触发创建事件
        emit('create', swarmData);
        
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
  formData.robotIds = [];
};
</script>

<style scoped>
.robot-count {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.parameter-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>