<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="(value) => emit('update:visible', value)"
    title="机器人详情"
    width="800px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div v-if="robot" class="robot-details">
      <el-tabs v-model="activeTab">
        <!-- 基本信息标签页 -->
        <el-tab-pane label="基本信息" name="basic">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="机器人ID">{{ robot.id }}</el-descriptions-item>
            <el-descriptions-item label="机器人名称">{{ robot.name }}</el-descriptions-item>
            <el-descriptions-item label="机器人类型">{{ robot.type }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(robot.status)">{{ getStatusText(robot.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="所属集群">{{ robot.swarmId ? getSwarmName(robot.swarmId) : '-' }}</el-descriptions-item>
            <el-descriptions-item label="IP地址">{{ robot.ipAddress }}</el-descriptions-item>
            <el-descriptions-item label="端口">{{ robot.port }}</el-descriptions-item>
            <el-descriptions-item label="版本">{{ robot.version }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDate(robot.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="最后在线">{{ formatDate(robot.lastOnline) }}</el-descriptions-item>
            <el-descriptions-item label="运行时长">{{ getUptime(robot) }}</el-descriptions-item>
            <el-descriptions-item label="任务总数">{{ robot.taskCount }}</el-descriptions-item>
            <el-descriptions-item label="成功任务数">{{ robot.successCount }}</el-descriptions-item>
            <el-descriptions-item label="失败任务数">{{ robot.failureCount }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
        
        <!-- 系统配置标签页 -->
        <el-tab-pane label="系统配置" name="config">
          <div class="robot-config">
            <div class="config-section">
              <h3>系统信息</h3>
              <el-divider />
              <pre>{{ formatJson(robot.systemInfo) }}</pre>
            </div>
            
            <div class="config-section">
              <h3>硬件配置</h3>
              <el-divider />
              <el-descriptions :column="1">
                <el-descriptions-item label="CPU">{{ robot.hardware.cpu }}</el-descriptions-item>
                <el-descriptions-item label="内存">{{ robot.hardware.memory }}</el-descriptions-item>
                <el-descriptions-item label="磁盘">{{ robot.hardware.disk }}</el-descriptions-item>
                <el-descriptions-item label="GPU">{{ robot.hardware.gpu || '无' }}</el-descriptions-item>
              </el-descriptions>
            </div>
            
            <div class="config-section">
              <h3>运行参数</h3>
              <el-divider />
              <pre>{{ formatJson(robot.parameters) }}</pre>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 系统状态标签页 -->
        <el-tab-pane label="系统状态" name="status">
          <div class="system-status">
            <div class="status-section">
              <h3>资源使用情况</h3>
              <el-divider />
              <el-descriptions :column="1">
                <el-descriptions-item label="CPU使用率">
                  <el-progress :percentage="robot.resources.cpuUsage" :color="getProgressColor(robot.resources.cpuUsage)"></el-progress>
                  {{ robot.resources.cpuUsage }}%
                </el-descriptions-item>
                <el-descriptions-item label="内存使用率">
                  <el-progress :percentage="robot.resources.memoryUsage" :color="getProgressColor(robot.resources.memoryUsage)"></el-progress>
                  {{ robot.resources.memoryUsage }}%
                </el-descriptions-item>
                <el-descriptions-item label="磁盘使用率">
                  <el-progress :percentage="robot.resources.diskUsage" :color="getProgressColor(robot.resources.diskUsage)"></el-progress>
                  {{ robot.resources.diskUsage }}%
                </el-descriptions-item>
                <el-descriptions-item label="网络流量">
                  <div>上传: {{ formatBytes(robot.resources.networkUpload) }}/s</div>
                  <div>下载: {{ formatBytes(robot.resources.networkDownload) }}/s</div>
                </el-descriptions-item>
              </el-descriptions>
            </div>
            
            <div class="status-section">
              <h3>系统负载</h3>
              <el-divider />
              <el-descriptions :column="1">
                <el-descriptions-item label="负载平均值">{{ robot.loadAverage }}</el-descriptions-item>
                <el-descriptions-item label="进程数">{{ robot.processCount }}</el-descriptions-item>
                <el-descriptions-item label="线程数">{{ robot.threadCount }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 任务历史标签页 -->
        <el-tab-pane label="任务历史" name="tasks">
          <div class="task-history">
            <el-table :data="robot.recentTasks" stripe border style="width: 100%">
              <el-table-column prop="id" label="任务ID" width="180" />
              <el-table-column prop="name" label="任务名称" />
              <el-table-column prop="type" label="任务类型" width="120" />
              <el-table-column prop="status" label="状态" width="120">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="创建时间" width="180" />
              <el-table-column prop="duration" label="执行时长" width="120" />
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="scope">
                  <el-button size="small" @click="handleViewTask(scope.row.id)">查看</el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div v-if="robot.recentTasks.length === 0" class="no-tasks">
              <el-empty description="无任务历史" />
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 日志标签页 -->
        <el-tab-pane label="系统日志" name="logs">
          <div class="system-logs">
            <el-timeline>
              <el-timeline-item
                v-for="log in robot.logs"
                :key="log.id"
                :timestamp="formatDate(log.timestamp)"
                :type="getLogType(log.level)"
              >
                <div class="log-item">
                  <div class="log-level">{{ log.level }}</div>
                  <div class="log-message">{{ log.message }}</div>
                </div>
              </el-timeline-item>
              
              <el-timeline-item v-if="robot.logs.length === 0" timestamp="无日志信息" />
            </el-timeline>
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
        <el-button v-if="robot?.status === 'online'" type="warning" @click="handleRestart">重启</el-button>
        <el-button v-if="robot?.status === 'online'" type="danger" @click="handleStop">停止</el-button>
        <el-button v-if="robot?.status === 'offline'" type="success" @click="handleStart">启动</el-button>
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
}

interface Task {
  id: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
  duration: string;
}

interface SystemInfo {
  os: string;
  osVersion: string;
  arch: string;
  hostname: string;
  nodeVersion: string;
}

interface Hardware {
  cpu: string;
  memory: string;
  disk: string;
  gpu?: string;
}

interface Resources {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkUpload: number;
  networkDownload: number;
}

interface Robot {
  id: string;
  name: string;
  type: string;
  status: string;
  swarmId?: string;
  ipAddress: string;
  port: number;
  version: string;
  createdAt: string;
  lastOnline: string;
  uptime: number;
  taskCount: number;
  successCount: number;
  failureCount: number;
  systemInfo: SystemInfo;
  hardware: Hardware;
  resources: Resources;
  loadAverage: string;
  processCount: number;
  threadCount: number;
  parameters: any;
  recentTasks: Task[];
  logs: Log[];
}

interface Swarm {
  id: string;
  name: string;
}

interface Props {
  visible: boolean;
  robot: Robot | null;
  swarms: Swarm[];
}

// 定义组件事件
interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'view-task', taskId: string): void;
  (e: 'start', robotId: string): void;
  (e: 'stop', robotId: string): void;
  (e: 'restart', robotId: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 当前激活的标签页
const activeTab = ref('basic');

// 获取状态类型
const getStatusType = (status: string): string => {
  switch (status) {
    case 'online': return 'success';
    case 'offline': return 'danger';
    case 'busy': return 'warning';
    case 'error': return 'danger';
    default: return '';
  }
};

// 获取状态文本
const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'online': '在线',
    'offline': '离线',
    'busy': '忙碌',
    'error': '错误'
  };
  return statusMap[status] || status;
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

// 计算运行时长
const getUptime = (robot: Robot): string => {
  if (robot.status !== 'online') return '-';
  
  const uptime = robot.uptime;
  const days = Math.floor(uptime / (24 * 60 * 60));
  const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((uptime % (60 * 60)) / 60);
  const seconds = Math.floor(uptime % 60);
  
  if (days > 0) {
    return `${days}天${hours}小时${minutes}分钟${seconds}秒`;
  } else if (hours > 0) {
    return `${hours}小时${minutes}分钟${seconds}秒`;
  } else if (minutes > 0) {
    return `${minutes}分钟${seconds}秒`;
  } else {
    return `${seconds}秒`;
  }
};

// 格式化字节数
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 获取进度条颜色
const getProgressColor = (percentage: number): string => {
  if (percentage < 50) return '#67c23a';
  if (percentage < 80) return '#e6a23c';
  return '#f56c6c';
};

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false);
};

// 启动机器人
const handleStart = () => {
  if (props.robot) {
    emit('start', props.robot.id);
  }
};

// 停止机器人
const handleStop = () => {
  if (props.robot) {
    emit('stop', props.robot.id);
  }
};

// 重启机器人
const handleRestart = () => {
  if (props.robot) {
    emit('restart', props.robot.id);
  }
};

// 查看任务详情
const handleViewTask = (taskId: string) => {
  emit('view-task', taskId);
};
</script>

<style scoped>
.robot-details {
  padding: 10px 0;
}

.robot-config {
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

.status-section {
  margin-bottom: 20px;
}

.status-section h3 {
  margin-bottom: 10px;
  font-size: 16px;
  color: #303133;
}

.task-history {
  max-height: 400px;
  overflow-y: auto;
}

.no-tasks {
  padding: 40px 0;
  text-align: center;
}

.system-logs {
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