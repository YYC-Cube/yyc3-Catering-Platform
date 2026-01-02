<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="(value) => emit('update:visible', value)"
    :title="title"
    width="800px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div class="robot-selection">
      <!-- 搜索和筛选 -->
      <div class="selection-header">
        <el-input
          v-model="searchQuery"
          placeholder="搜索机器人名称或ID"
          clearable
          style="width: 280px; margin-right: 16px;"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select
          v-model="statusFilter"
          placeholder="筛选状态"
          clearable
          style="width: 150px; margin-right: 16px;"
        >
          <el-option label="全部" value="" />
          <el-option label="在线" value="online" />
          <el-option label="离线" value="offline" />
          <el-option label="忙碌" value="busy" />
          <el-option label="错误" value="error" />
        </el-select>
        
        <el-select
          v-model="typeFilter"
          placeholder="筛选类型"
          clearable
          style="width: 150px;"
        >
          <el-option label="全部" value="" />
          <el-option label="通用型" value="general" />
          <el-option label="任务型" value="task" />
          <el-option label="监控型" value="monitor" />
          <el-option label="分析型" value="analysis" />
        </el-select>
      </div>
      
      <!-- 机器人列表 -->
      <div class="robot-list">
        <el-table
          :data="filteredRobots"
          v-loading="loading"
          border
          stripe
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            type="selection"
            :reserve-selection="!singleSelect"
            width="55"
          />
          <el-table-column prop="id" label="机器人ID" width="180" />
          <el-table-column prop="name" label="机器人名称" min-width="150">
            <template #default="scope">
              <div class="robot-name">
                <el-tag size="small" :type="getStatusType(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
                {{ scope.row.name }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="120" />
          <el-table-column prop="ipAddress" label="IP地址" width="150" />
          <el-table-column prop="version" label="版本" width="100" />
          <el-table-column prop="lastOnline" label="最后在线" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.lastOnline) }}
            </template>
          </el-table-column>
          <el-table-column prop="taskCount" label="任务数" width="80" align="center" />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button
                size="small"
                type="primary"
                @click="handleQuickSelect(scope.row)"
                :disabled="isSelected(scope.row)"
              >
                选择
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div v-if="filteredRobots.length === 0 && !loading" class="no-data">
          <el-empty description="没有找到匹配的机器人" />
        </div>
      </div>
      
      <!-- 分页 -->
      <div class="selection-footer">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredRobots.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :disabled="selectedRobots.length === 0">
          确定 ({{ selectedRobots.length }})
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits, watch } from 'vue';
import { Search } from '@element-plus/icons-vue';

// 定义组件属性
interface Robot {
  id: string;
  name: string;
  type: string;
  status: string;
  ipAddress: string;
  version: string;
  lastOnline: string;
  taskCount: number;
}

interface Props {
  visible: boolean;
  robots: Robot[];
  selectedRobotIds?: string[];
  title?: string;
  singleSelect?: boolean;
  loading?: boolean;
}

// 定义组件事件
interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'confirm', selectedRobots: Robot[]): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
  title: '选择机器人',
  singleSelect: false,
  loading: false,
  selectedRobotIds: () => []
});

const emit = defineEmits<Emits>();

// 组件状态
const searchQuery = ref('');
const statusFilter = ref('');
const typeFilter = ref('');
const selectedRobots = ref<Robot[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);

// 计算筛选后的机器人列表
const filteredRobots = computed(() => {
  let filtered = [...props.robots];
  
  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(robot => 
      robot.name.toLowerCase().includes(query) || 
      robot.id.toLowerCase().includes(query)
    );
  }
  
  // 状态筛选
  if (statusFilter.value) {
    filtered = filtered.filter(robot => robot.status === statusFilter.value);
  }
  
  // 类型筛选
  if (typeFilter.value) {
    filtered = filtered.filter(robot => robot.type === typeFilter.value);
  }
  
  return filtered;
});

// 分页后的机器人列表
const paginatedRobots = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredRobots.value.slice(start, end);
});

// 监听选中的机器人ID变化
watch(() => props.selectedRobotIds, (newIds) => {
  if (newIds) {
    selectedRobots.value = props.robots.filter(robot => newIds.includes(robot.id));
  }
}, { deep: true, immediate: true });

// 监听机器人列表变化
watch(() => props.robots, (newRobots) => {
  // 保持选中状态
  selectedRobots.value = selectedRobots.value.filter(selected => 
    newRobots.some(robot => robot.id === selected.id)
  );
}, { deep: true });

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

// 检查机器人是否已选中
const isSelected = (robot: Robot): boolean => {
  return selectedRobots.value.some(selected => selected.id === robot.id);
};

// 处理选择变化
const handleSelectionChange = (selection: Robot[]) => {
  selectedRobots.value = selection;
};

// 快速选择机器人
const handleQuickSelect = (robot: Robot) => {
  if (props.singleSelect) {
    selectedRobots.value = [robot];
    handleConfirm();
  } else {
    const index = selectedRobots.value.findIndex(r => r.id === robot.id);
    if (index === -1) {
      selectedRobots.value.push(robot);
    } else {
      selectedRobots.value.splice(index, 1);
    }
  }
};

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
};

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
};

// 确认选择
const handleConfirm = () => {
  emit('confirm', selectedRobots.value);
  emit('update:visible', false);
};

// 取消选择
const handleCancel = () => {
  emit('cancel');
  emit('update:visible', false);
  // 重置选择
  selectedRobots.value = [];
  searchQuery.value = '';
  statusFilter.value = '';
  typeFilter.value = '';
  currentPage.value = 1;
};
</script>

<style scoped>
.robot-selection {
  padding: 10px 0;
}

.selection-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.robot-list {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.robot-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.selection-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.no-data {
  padding: 40px 0;
  text-align: center;
}
</style>