<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="(value) => emit('update:visible', value)"
    title="任务详情"
    width="800px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div v-if="task" class="task-details">
      <el-tabs v-model="activeTab">
        <!-- 基本信息标签页 -->
        <el-tab-pane label="基本信息" name="basic">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="任务ID">{{ task.id }}</el-descriptions-item>
            <el-descriptions-item label="任务名称">{{ task.name }}</el-descriptions-item>
            <el-descriptions-item label="任务类型">{{ task.type }}</el-descriptions-item>
            <el-descriptions-item label="任务状态">
              <el-tag :type="getStatusType(task.status)">{{ getStatusText(task.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="优先级">
              <el-tag :type="getPriorityType(task.priority)">{{ getPriorityText(task.priority) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDate(task.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="开始时间">{{ task.startTime ? formatDate(task.startTime) : '-' }}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{ task.endTime ? formatDate(task.endTime) : '-' }}</el-descriptions-item>
            <el-descriptions-item label="执行时长">{{ getDuration(task) }}</el-descriptions-item>
            <el-descriptions-item label="进度">{{ task.progress }}%</el-descriptions-item>
            <el-descriptions-item label="所属机器人" prop="robotId">
              {{ getRobotName(task.robotId) }}
            </el-descriptions-item>
            <el-descriptions-item label="所属集群" prop="swarmId">
              {{ task.swarmId ? getSwarmName(task.swarmId) : '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="创建者">{{ task.createdBy }}</el-descriptions-item>
            <el-descriptions-item label="最后更新者">{{ task.updatedBy }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
        
        <!-- 任务配置标签页 -->
        <el-tab-pane label="任务配置" name="config">
          <div class="task-config">
            <div class="config-section">
              <h3>任务描述</h3>
              <p>{{ task.description || '无描述信息' }}</p>
            </div>
            
            <div class="config-section">
              <h3>执行参数</h3>
              <el-divider />
              <pre>{{ formatJson(task.parameters) }}</pre>
            </div>
            
            <div class="config-section">
              <h3>执行条件</h3>
              <el-divider />
              <pre>{{ formatJson(task.conditions) }}</pre>
            </div>
            
            <div class="config-section">
              <h3>执行策略</h3>
              <el-divider />
              <el-descriptions :column="1">
                <el-descriptions-item label="重试次数">{{ task.retryCount }}</el-descriptions-item>
                <el-descriptions-item label="超时时间">{{ task.timeout }} 秒</el-descriptions-item>
                <el-descriptions-item label="错误处理">{{ task.errorHandling }}</el-descriptions-item>
                <el-descriptions-item label="回调URL">{{ task.callbackUrl || '-' }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 执行日志标签页 -->
        <el-tab-pane label="执行日志" name="logs">
          <div class="task-logs">
            <el-timeline>
              <el-timeline-item
                v-for="log in task.logs"
                :key="log.id"
                :timestamp="formatDate(log.timestamp)"
                :type="getLogType(log.level)"
              >
                <div class="log-item">
                  <div class="log-level">{{ log.level }}</div>
                  <div class="log-message">{{ log.message }}</div>
                  <div v-if="log.details" class="log-details">
                    <pre>{{ formatJson(log.details) }}</pre>
                  </div>
                </div>
              </el-timeline-item>
              
              <el-timeline-item v-if="task.logs.length === 0" timestamp="无日志信息" />
            </el-timeline>
          </div>
        </el-tab-pane>
        
        <!-- 执行结果标签页 -->
        <el-tab-pane label="执行结果" name="result">
          <div class="task-result">
            <div v-if="task.result" class="result-content">
              <h3>任务结果</h3>
              <el-divider />
              <pre>{{ formatJson(task.result) }}</pre>
            </div>
            <div v-else class="no-result">
              <el-empty description="任务尚未完成或无结果" />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <div v-else class="loading">
      <el-empty description="加载中..." />
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button v-if="task?.status === 'running'" type="warning" @click="handlePause">暂停</el-button>
        <el-button v-if="task?.status === 'paused'" type="success" @click="handleResume">恢复</el-button>
        <el-button v-if="task?.status === 'running'" type="danger" @click="handleCancel">取消</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';

// 定义组件属性
interface Log {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  details?: any;
}

interface Task {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  createdAt: string;
  startTime?: string;
  endTime?: string;
  progress: number;
  robotId: string;
  swarmId?: string;
  parameters: any;
  conditions: any;
  retryCount: number;
  timeout: number;
  errorHandling: string;
  callbackUrl?: string;
  logs: Log[];
  result?: any;
  createdBy: string;
  updatedBy: string;
}

interface Robot {
  id: string;
  name: string;
}

interface Swarm {
  id: string;
  name: string;
}

interface Props {
  visible: boolean;
  task: Task | null;
  robots: Robot[];
  swarms: Swarm[];
}

// 定义组件事件
interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'pause', taskId: string): void;
  (e: 'resume', taskId: string): void;
  (e: 'cancel', taskId: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 当前激活的标签页
const activeTab = ref('basic');

// 获取状态类型
const getStatusType = (status: string): string => {
  switch (status) {
    case 'pending': return 'info';
    case 'running': return 'warning';
    case 'completed': return 'success';
    case 'failed': return 'danger';
    case 'cancelled': return 'danger';
    case 'paused': return 'info';
    default: return '';
  }
};

// 获取状态文本
const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': '待执行',
    'running': '执行中',
    'completed': '已完成',
    'failed': '执行失败',
    'cancelled': '已取消',
    'paused': '已暂停'
  };
  return statusMap[status] || status;
};

// 获取优先级类型
const getPriorityType = (priority: string): string => {
  switch (priority) {
    case 'low': return 'info';
    case 'medium': return 'warning';
    case 'high': return 'danger';
    case 'urgent': return 'danger';
    default: return '';
  }
};

// 获取优先级文本
const getPriorityText = (priority: string): string => {
  const priorityMap: Record<string, string> = {
    'low': '低',
    'medium': '中',
    'high': '高',
    'urgent': '紧急'
  };
  return priorityMap[priority] || priority;
};

// 获取日志类型
const getLogType = (level: string): string => {
  switch (level) {
    case 'error': return 'danger';
    case 'warn': return 'warning';
    case 'info': return 'info';
    case 'debug': return 'success';
    default: return '';
  }
};

// 获取机器人名称
const getRobotName = (robotId: string): string => {
  const robot = props.robots.find(r => r.id === robotId);
  return robot ? robot.name : robotId;
};

// 获取集群名称
const getSwarmName = (swarmId: string): string => {
  const swarm = props.swarms.find(s => s.id === swarmId);
  return swarm ? swarm.name : swarmId;
};

// 格式化日期
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// 格式化JSON
const formatJson = (data: any): string => {
  try {
    if (typeof data === 'string') {
      return JSON.stringify(JSON.parse(data), null, 2);
    }
    return JSON.stringify(data, null, 2);
  } catch (error) {
    return String(data);
  }
};

// 计算任务时长
const getDuration = (task: Task): string => {
  if (!task.startTime) return '-';
  
  const endTime = task.endTime ? new Date(task.endTime) : new Date();
  const startTime = new Date(task.startTime);
  const duration = endTime.getTime() - startTime.getTime();
  
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((duration % (1000 * 60)) / 1000);
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟${seconds}秒`;
  } else if (minutes > 0) {
    return `${minutes}分钟${seconds}秒`;
  } else {
    return `${seconds}秒`;
  }
};

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false);
};

// 暂停任务
const handlePause = () => {
  if (props.task) {
    emit('pause', props.task.id);
  }
};

// 恢复任务
const handleResume = () => {
  if (props.task) {
    emit('resume', props.task.id);
  }
};

// 取消任务
const handleCancel = () => {
  if (props.task) {
    emit('cancel', props.task.id);
  }
};
</script>

<style scoped>
.task-details {
  padding: 10px 0;
}

.task-config {
  padding: 10px 0;
}

.config-section {
  margin-bottom: 20px;
}

.config-section h3 {
  margin-bottom: 10px;
  font-size: 16px;
  color: #303133;
}

.task-logs {
  max-height: 400px;
  overflow-y: auto;
}

.log-item {
  padding: 10px;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.log-level {
  font-weight: bold;
  margin-bottom: 5px;
}

.log-message {
  margin-bottom: 5px;
}

.log-details {
  margin-top: 10px;
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.task-result {
  padding: 10px 0;
}

.result-content h3 {
  margin-bottom: 10px;
  font-size: 16px;
  color: #303133;
}

.no-result {
  padding: 40px 0;
  text-align: center;
}

.loading {
  padding: 40px 0;
  text-align: center;
}

pre {
  background-color: #f6f8fa;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  line-height: 1.5;
}
</style>