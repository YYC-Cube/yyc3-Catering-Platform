<template>
  <div class="staff-dashboard">
    <div class="dashboard-header">
      <h1>工作台</h1>
      <div class="header-info">
        <span class="welcome-text">欢迎回来，{{ currentUser?.name }}</span>
        <span class="current-time">{{ currentTime }}</span>
      </div>
    </div>

    <!-- 快捷操作卡片 -->
    <div class="quick-actions">
      <el-row :gutter="20">
        <el-col :xs="12" :sm="8" :md="6" :lg="4" v-for="action in quickActions" :key="action.name">
          <el-card
            class="action-card"
            :body-style="{ padding: '20px' }"
            @click="handleQuickAction(action)"
            shadow="hover"
          >
            <div class="action-content">
              <el-icon :size="32" :color="action.color">
                <component :is="action.icon" />
              </el-icon>
              <div class="action-name">{{ action.name }}</div>
              <div class="action-count" v-if="action.count">{{ action.count }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 工作状态统计 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8">
          <el-card title="今日订单">
            <div class="stat-item">
              <div class="stat-number">{{ todayStats.orders }}</div>
              <div class="stat-label">总订单数</div>
            </div>
            <div class="stat-progress">
              <el-progress
                :percentage="orderProgress"
                :color="getProgressColor(orderProgress)"
              />
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8">
          <el-card title="完成情况">
            <div class="stat-item">
              <div class="stat-number">{{ todayStats.completed }}</div>
              <div class="stat-label">已完成</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ todayStats.pending }}</div>
              <div class="stat-label">处理中</div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8">
          <el-card title="客户评价">
            <div class="stat-item">
              <div class="stat-number">{{ todayStats.rating }}⭐</div>
              <div class="stat-label">平均评分</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ todayStats.reviews }}</div>
              <div class="stat-label">评价数量</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 最新动态 -->
    <div class="recent-activities">
      <el-card title="最新动态">
        <el-timeline>
          <el-timeline-item
            v-for="activity in recentActivities"
            :key="activity.id"
            :timestamp="activity.timestamp"
            :type="activity.type"
          >
            {{ activity.description }}
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>

    <!-- 今日任务 -->
    <div class="today-tasks">
      <el-card title="今日任务">
        <div class="task-list">
          <div
            v-for="task in todayTasks"
            :key="task.id"
            class="task-item"
            :class="{ 'completed': task.completed }"
          >
            <el-checkbox
              v-model="task.completed"
              @change="updateTaskStatus(task)"
            >
              {{ task.title }}
            </el-checkbox>
            <el-tag :type="task.priority === 'high' ? 'danger' : 'info'" size="small">
              {{ task.priority === 'high' ? '高优先级' : '普通' }}
            </el-tag>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

interface QuickAction {
  name: string
  icon: string
  color: string
  route: string
  count?: number
}

interface TodayStats {
  orders: number
  completed: number
  pending: number
  rating: number
  reviews: number
}

interface Activity {
  id: string
  description: string
  timestamp: string
  type: 'primary' | 'success' | 'warning' | 'danger'
}

interface Task {
  id: string
  title: string
  completed: boolean
  priority: 'high' | 'normal'
}

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const currentTime = ref(new Date().toLocaleString())
const quickActions = ref<QuickAction[]>([
  {
    name: '接单',
    icon: 'Plus',
    color: '#67c23a',
    route: '/orders',
    count: 3
  },
  {
    name: '厨房',
    icon: 'KnifeAndSpoon',
    color: '#e6a23c',
    route: '/kitchen'
  },
  {
    name: '预约',
    icon: 'Calendar',
    color: '#409eff',
    route: '/reservations',
    count: 2
  },
  {
    name: '客服',
    icon: 'Service',
    color: '#f56c6c',
    route: '/customer-service'
  },
  {
    name: '库存',
    icon: 'Box',
    color: '#909399',
    route: '/inventory'
  },
  {
    name: '报表',
    icon: 'DataAnalysis',
    color: '#67c23a',
    route: '/reports'
  }
])

const todayStats = ref<TodayStats>({
  orders: 0,
  completed: 0,
  pending: 0,
  rating: 0,
  reviews: 0
})

const recentActivities = ref<Activity[]>([
  {
    id: '1',
    description: '新订单 #12345 需要处理',
    timestamp: '5分钟前',
    type: 'warning'
  },
  {
    id: '2',
    description: '桌号 A12 客户已入座',
    timestamp: '10分钟前',
    type: 'success'
  },
  {
    id: '3',
    description: '厨房完成订单 #12343',
    timestamp: '15分钟前',
    type: 'primary'
  },
  {
    id: '4',
    description: '客户投诉需要处理',
    timestamp: '30分钟前',
    type: 'danger'
  }
])

const todayTasks = ref<Task[]>([
  {
    id: '1',
    title: '检查今日预订情况',
    completed: false,
    priority: 'high'
  },
  {
    id: '2',
    title: '更新菜单价格',
    completed: false,
    priority: 'normal'
  },
  {
    id: '3',
    title: '盘点厨房库存',
    completed: false,
    priority: 'high'
  },
  {
    id: '4',
    title: '准备明日采购清单',
    completed: false,
    priority: 'normal'
  }
])

// 计算属性
const currentUser = computed(() => authStore.user)

const orderProgress = computed(() => {
  const total = todayStats.value.orders
  const completed = todayStats.value.completed
  return total > 0 ? Math.round((completed / total) * 100) : 0
})

// 方法
const handleQuickAction = (action: QuickAction) => {
  router.push(action.route)
}

const getProgressColor = (percentage: number): string => {
  if (percentage >= 80) return '#67c23a'
  if (percentage >= 60) return '#e6a23c'
  return '#f56c6c'
}

const updateTaskStatus = (task: Task) => {
  ElMessage.success(`任务"${task.title}"状态已更新`)
}

const updateCurrentTime = () => {
  currentTime.value = new Date().toLocaleString()
}

const loadTodayStats = async () => {
  try {
    // 模拟API调用
    setTimeout(() => {
      todayStats.value = {
        orders: 45,
        completed: 38,
        pending: 7,
        rating: 4.6,
        reviews: 23
      }
    }, 1000)
  } catch (error) {
    console.error('Failed to load today stats:', error)
  }
}

// 生命周期
let timeInterval: NodeJS.Timeout

onMounted(() => {
  updateCurrentTime()
  timeInterval = setInterval(updateCurrentTime, 1000)
  loadTodayStats()
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style lang="scss" scoped>
.staff-dashboard {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 60px);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;

  h1 {
    margin: 0;
    color: var(--el-text-color-primary);
  }

  .header-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 5px;

    .welcome-text {
      font-size: 16px;
      color: var(--el-text-color-primary);
    }

    .current-time {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }
}

.quick-actions {
  margin-bottom: 30px;

  .action-card {
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      transform: translateY(-2px);
    }

    .action-content {
      text-align: center;

      .action-name {
        margin-top: 10px;
        font-size: 14px;
        color: var(--el-text-color-primary);
      }

      .action-count {
        position: absolute;
        top: 10px;
        right: 10px;
        background: var(--el-color-danger);
        color: white;
        border-radius: 10px;
        padding: 2px 8px;
        font-size: 12px;
        min-width: 20px;
        text-align: center;
      }
    }
  }
}

.stats-section {
  margin-bottom: 30px;

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;

    .stat-number {
      font-size: 24px;
      font-weight: bold;
      color: var(--el-color-primary);
    }

    .stat-label {
      color: var(--el-text-color-secondary);
    }
  }

  .stat-progress {
    margin-top: 10px;
  }
}

.recent-activities {
  margin-bottom: 30px;
}

.today-tasks {
  .task-list {
    .task-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:last-child {
        border-bottom: none;
      }

      &.completed {
        opacity: 0.6;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .staff-dashboard {
    padding: 16px 12px;
  }
}
</style>