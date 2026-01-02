<template>
  <div class="decision-details">
    <el-card class="decision-info-card">
      <template #header>
        <div class="card-header">
          <span>决策基本信息</span>
        </div>
      </template>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="决策名称">{{ decisionInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="决策ID">{{ decisionInfo.id }}</el-descriptions-item>
        <el-descriptions-item label="决策类型">{{ getDecisionTypeText(decisionInfo.type) }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ getStatusText(decisionInfo.status) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(decisionInfo.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="最后更新时间">{{ formatDate(decisionInfo.updatedAt) }}</el-descriptions-item>
        <el-descriptions-item label="创建者">{{ decisionInfo.createdBy }}</el-descriptions-item>
        <el-descriptions-item label="优先级">{{ getPriorityText(decisionInfo.priority) }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ decisionInfo.description }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
    
    <el-card class="decision-data-card" v-if="decisionInfo.data">
      <template #header>
        <div class="card-header">
          <span>决策数据</span>
        </div>
      </template>
      
      <el-table :data="decisionDataTable" style="width: 100%">
        <el-table-column prop="key" label="字段名" width="180" />
        <el-table-column prop="value" label="值" />
      </el-table>
    </el-card>
    
    <el-card class="decision-result-card" v-if="decisionInfo.result">
      <template #header>
        <div class="card-header">
          <span>决策结果</span>
        </div>
      </template>
      
      <div class="result-content">
        <el-alert :title="decisionInfo.result.result" :type="getResultType(decisionInfo.result.result)" show-icon />
        <div class="result-details">
          <h4>决策原因:</h4>
          <p>{{ decisionInfo.result.reason }}</p>
          <h4>决策规则:</h4>
          <pre>{{ JSON.stringify(decisionInfo.result.matchedRules, null, 2) }}</pre>
        </div>
      </div>
    </el-card>
    
    <el-card class="decision-history-card" v-if="decisionHistory.length > 0">
      <template #header>
        <div class="card-header">
          <span>决策历史</span>
        </div>
      </template>
      
      <el-timeline>
        <el-timeline-item 
          v-for="(item, index) in decisionHistory" 
          :key="index"
          :timestamp="formatDate(item.timestamp)"
        >
          <el-card>
            <h4>{{ item.action }}</h4>
            <p>{{ item.description }}</p>
            <p class="operator">操作人: {{ item.operator }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps } from 'vue';
import dayjs from 'dayjs';

// 定义组件属性
interface DecisionDataItem {
  key: string;
  value: string;
}

interface DecisionResult {
  result: string;
  reason: string;
  matchedRules: Array<{
    id: string;
    name: string;
    condition: string;
  }>;
}

interface DecisionHistoryItem {
  action: string;
  description: string;
  timestamp: string;
  operator: string;
}

interface Props {
  decisionId?: string;
  modelValue?: {
    id: string;
    name: string;
    type: 'automatic' | 'manual' | 'hybrid';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    description: string;
    data?: Record<string, any>;
    result?: DecisionResult;
  };
}

const props = defineProps<Props>();

// 决策信息数据
const decisionInfo = reactive({
  id: '',
  name: '',
  type: 'automatic',
  status: 'pending',
  priority: 'medium',
  createdAt: '',
  updatedAt: '',
  createdBy: '',
  description: '',
  data: {},
  result: {
    result: '',
    reason: '',
    matchedRules: []
  }
});

// 决策历史
const decisionHistory = ref<DecisionHistoryItem[]>([
  {
    action: '决策创建',
    description: '自动决策请求已创建',
    timestamp: '2024-01-01T10:00:00Z',
    operator: '系统'
  },
  {
    action: '数据收集',
    description: '决策所需数据已收集完成',
    timestamp: '2024-01-01T10:05:00Z',
    operator: '系统'
  },
  {
    action: '规则匹配',
    description: '已匹配到相关决策规则',
    timestamp: '2024-01-01T10:10:00Z',
    operator: '系统'
  },
  {
    action: '决策执行',
    description: '决策已执行完成',
    timestamp: '2024-01-01T10:15:00Z',
    operator: '系统'
  }
]);

// 格式化决策数据为表格格式
const decisionDataTable = ref<DecisionDataItem[]>([]);

// 如果传入了modelValue，则更新决策信息
if (props.modelValue) {
  Object.assign(decisionInfo, props.modelValue);
  
  // 转换数据格式为表格
  if (decisionInfo.data) {
    decisionDataTable.value = Object.entries(decisionInfo.data).map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value)
    }));
  }
}

// 获取决策类型文本
const getDecisionTypeText = (type: string) => {
  const types = {
    automatic: '自动决策',
    manual: '手动决策',
    hybrid: '混合决策'
  };
  return types[type as keyof typeof types] || type;
};

// 获取状态文本
const getStatusText = (status: string) => {
  const statuses = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    failed: '失败'
  };
  return statuses[status as keyof typeof statuses] || status;
};

// 获取优先级文本
const getPriorityText = (priority: string) => {
  const priorities = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  };
  return priorities[priority as keyof typeof priorities] || priority;
};

// 获取结果类型对应的alert类型
const getResultType = (result: string) => {
  const resultType = result.toLowerCase();
  if (resultType.includes('通过') || resultType.includes('批准') || resultType.includes('同意')) {
    return 'success';
  } else if (resultType.includes('拒绝') || resultType.includes('不通过')) {
    return 'error';
  } else if (resultType.includes('警告') || resultType.includes('注意')) {
    return 'warning';
  } else {
    return 'info';
  }
};

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss');
};
</script>

<style scoped>
.decision-details {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.decision-info-card {
  margin-bottom: 20px;
}

.decision-data-card {
  margin-bottom: 20px;
}

.decision-result-card {
  margin-bottom: 20px;
}

.result-content {
  margin: 20px 0;
}

.result-details {
  margin-top: 20px;
}

.result-details h4 {
  margin-bottom: 10px;
  font-weight: bold;
}

.result-details pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}

.decision-history-card {
  margin-bottom: 20px;
}

.operator {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>