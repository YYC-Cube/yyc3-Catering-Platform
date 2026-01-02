<template>
  <div class="customer-segment">
    <h2>客户分段管理</h2>
    <div class="segment-list">
      <!-- 客户分段列表 -->
      <div v-for="segment in segments" :key="segment.id" class="segment-item">
        <div class="segment-info">
          <h3>{{ segment.name }}</h3>
          <p>{{ segment.description }}</p>
          <div class="segment-stats">
            <span>客户数量: {{ segment.customerCount }}</span>
            <span>创建时间: {{ segment.createdAt }}</span>
          </div>
        </div>
        <div class="segment-actions">
          <el-button type="primary" @click="editSegment(segment)">编辑</el-button>
          <el-button type="danger" @click="deleteSegment(segment.id)">删除</el-button>
        </div>
      </div>
    </div>
    
    <!-- 添加分段按钮 -->
    <el-button type="success" @click="showAddDialog = true">添加分段</el-button>
    
    <!-- 添加/编辑分段对话框 -->
    <el-dialog
      :model-value="showAddDialog"
      @update:model-value="showAddDialog = $event"
      title="{{ editingSegment ? '编辑分段' : '添加分段' }}"
      width="500px"
    >
      <el-form :model="formData" :rules="rules" ref="formRef">
        <el-form-item label="分段名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分段名称" />
        </el-form-item>
        <el-form-item label="分段描述" prop="description">
          <el-input type="textarea" v-model="formData.description" placeholder="请输入分段描述" :rows="3" />
        </el-form-item>
        <el-form-item label="条件设置">
          <el-select v-model="formData.conditionType" placeholder="选择条件类型">
            <el-option label="消费金额" value="spending" />
            <el-option label="订单数量" value="orders" />
            <el-option label="注册时间" value="registration" />
            <el-option label="客户类型" value="type" />
          </el-select>
          <el-input v-model="formData.conditionValue" placeholder="请输入条件值" style="margin-top: 10px;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';

// 类型定义
interface Segment {
  id: string;
  name: string;
  description: string;
  conditionType: string;
  conditionValue: string;
  customerCount: number;
  createdAt: string;
}

// 响应式数据
const segments = ref<Segment[]>([
  // 示例数据
  {
    id: '1',
    name: '高价值客户',
    description: '消费金额超过10000元的客户',
    conditionType: 'spending',
    conditionValue: '10000',
    customerCount: 150,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: '活跃客户',
    description: '最近30天内有消费的客户',
    conditionType: 'orders',
    conditionValue: '30',
    customerCount: 850,
    createdAt: '2024-02-20'
  }
]);

const showAddDialog = ref(false);
const editingSegment = ref<Segment | null>(null);
const formRef = ref();

const formData = reactive({
  name: '',
  description: '',
  conditionType: '',
  conditionValue: ''
});

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入分段名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入分段描述', trigger: 'blur' }
  ]
};

// 编辑分段
const editSegment = (segment: Segment) => {
  editingSegment.value = segment;
  Object.assign(formData, segment);
  showAddDialog.value = true;
};

// 删除分段
const deleteSegment = (id: string) => {
  ElMessage.success('删除成功');
  // 实际删除逻辑
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      if (editingSegment.value) {
        // 编辑逻辑
        ElMessage.success('编辑成功');
      } else {
        // 添加逻辑
        ElMessage.success('添加成功');
      }
      showAddDialog.value = false;
      resetForm();
    }
  });
};

// 重置表单
const resetForm = () => {
  editingSegment.value = null;
  Object.assign(formData, {
    name: '',
    description: '',
    conditionType: '',
    conditionValue: ''
  });
  if (formRef.value) {
    formRef.value.resetFields();
  }
};
</script>

<style scoped>
.customer-segment {
  padding: 20px;
}

.segment-list {
  margin-bottom: 20px;
}

.segment-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.segment-info h3 {
  margin: 0 0 8px 0;
  color: #303133;
}

.segment-info p {
  margin: 0 0 12px 0;
  color: #606266;
}

.segment-stats {
  display: flex;
  gap: 20px;
  color: #909399;
  font-size: 14px;
}

.segment-actions {
  display: flex;
  gap: 10px;
}
</style>