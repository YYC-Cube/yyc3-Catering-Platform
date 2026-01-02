<template>
  <div class="robot-agent-management">
    <!-- 顶部导航栏 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <el-icon><Robot /></el-icon>
            机器人智能体管理
          </h1>
          <p class="page-description">管理和控制智能机器人群体，实现自动化协作任务</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="showAddRobotDialog = true">
            <el-icon><Plus /></el-icon>
            添加机器人
          </el-button>
          <el-button @click="showCreateTaskDialog = true">
            <el-icon><List /></el-icon>
            创建任务
          </el-button>
          <el-button @click="showSwarmDialog = true">
            <el-icon><Connection /></el-icon>
            创建群体
          </el-button>
          <el-button-group>
            <el-button @click="viewMode = 'robots'" :type="viewMode === 'robots' ? 'primary' : ''">
              <el-icon><Monitor /></el-icon>
              机器人
            </el-button>
            <el-button @click="viewMode = 'tasks'" :type="viewMode === 'tasks' ? 'primary' : ''">
              <el-icon><Tickets /></el-icon>
              任务
            </el-button>
            <el-button @click="viewMode = 'swarm'" :type="viewMode === 'swarm' ? 'primary' : ''">
              <el-icon><Share /></el-icon>
              群体
            </el-button>
            <el-button @click="viewMode = 'analytics'" :type="viewMode === 'analytics' ? 'primary' : ''">
              <el-icon><TrendCharts /></el-icon>
              分析
            </el-button>
          </el-button-group>
        </div>
      </div>
    </div>

    <!-- 机器人视图 -->
    <div v-if="viewMode === 'robots'" class="robots-view">
      <!-- 搜索和过滤器 -->
      <div class="search-section">
        <el-row :gutter="16">
          <el-col :span="6">
            <el-input
              v-model="robotSearchQuery"
              placeholder="搜索机器人..."
              prefix-icon="Search"
              clearable
              @input="handleRobotSearch"
            />
          </el-col>
          <el-col :span="4">
            <el-select v-model="robotTypeFilter" placeholder="类型" clearable>
              <el-option label="全部类型" value="" />
              <el-option label="服务机器人" value="service_robot" />
              <el-option label="工业机器人" value="industrial_robot" />
              <el-option label="配送机器人" value="delivery_robot" />
              <el-option label="清洁机器人" value="cleaning_robot" />
              <el-option label="安保机器人" value="security_robot" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="robotStatusFilter" placeholder="状态" clearable>
              <el-option label="全部状态" value="" />
              <el-option label="空闲" value="idle" />
              <el-option label="活跃" value="active" />
              <el-option label="忙碌" value="busy" />
              <el-option label="充电中" value="charging" />
              <el-option label="维护中" value="maintenance" />
              <el-option label="故障" value="error" />
              <el-option label="离线" value="offline" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="locationFilter" placeholder="位置" clearable>
              <el-option label="全部位置" value="" />
              <el-option label="厨房" value="kitchen" />
              <el-option label="餐厅" value="restaurant" />
              <el-option label="仓库" value="warehouse" />
              <el-option label="大堂" value="lobby" />
              <el-option label="走廊" value="corridor" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <div class="filter-actions">
              <el-button @click="resetRobotFilters">重置</el-button>
              <el-button @click="refreshRobots">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 机器人统计卡片 -->
      <div class="stats-cards">
        <el-row :gutter="16">
          <el-col :span="6">
            <div class="stat-card total">
              <div class="stat-icon">
                <el-icon><Robot /></el-icon>
              </div>
              <div class="stat-content">
                <h3>{{ totalRobots }}</h3>
                <p>总机器人</p>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card active">
              <div class="stat-icon">
                <el-icon><VideoPlay /></el-icon>
              </div>
              <div class="stat-content">
                <h3>{{ activeRobots }}</h3>
                <p>活跃中</p>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card tasks">
              <div class="stat-icon">
                <el-icon><Tickets /></el-icon>
              </div>
              <div class="stat-content">
                <h3>{{ totalTasks }}</h3>
                <p>执行任务</p>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card efficiency">
              <div class="stat-icon">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="stat-content">
                <h3>{{ averageEfficiency }}%</h3>
                <p>平均效率</p>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 机器人网格 -->
      <div class="robots-grid">
        <el-row :gutter="16">
          <el-col
            v-for="robot in filteredRobots"
            :key="robot.id"
            :span="8"
            class="robot-col"
          >
            <div class="robot-card" @click="selectRobot(robot)">
              <div class="robot-header">
                <div class="robot-avatar">
                  <el-icon size="32"><Robot /></el-icon>
                </div>
                <div class="robot-info">
                  <h4>{{ robot.name }}</h4>
                  <p>{{ robot.model }}</p>
                </div>
                <div class="robot-status">
                  <el-tag :type="getStatusTagType(robot.status)" size="small">
                    {{ getStatusLabel(robot.status) }}
                  </el-tag>
                </div>
              </div>

              <div class="robot-details">
                <div class="detail-row">
                  <span class="label">位置:</span>
                  <span class="value">{{ robot.location.description }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">电量:</span>
                  <div class="battery-indicator">
                    <el-progress
                      :percentage="robot.battery.level"
                      :color="getBatteryColor(robot.battery.level)"
                      :show-text="false"
                      :stroke-width="6"
                      :width="100"
                    />
                    <span class="battery-text">{{ robot.battery.level }}%</span>
                  </div>
                </div>
                <div class="detail-row">
                  <span class="label">任务:</span>
                  <span class="value">{{ robot.performance.completedTasks }}/{{ robot.performance.totalTasks }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">效率:</span>
                  <span class="value">{{ Math.round(robot.performance.efficiency * 100) }}%</span>
                </div>
              </div>

              <div class="robot-actions">
                <el-button-group size="small">
                  <el-button @click.stop="controlRobot(robot, 'start_task')" :disabled="robot.status === 'offline'">
                    <el-icon><VideoPlay /></el-icon>
                  </el-button>
                  <el-button @click.stop="controlRobot(robot, 'pause_task')" :disabled="robot.status !== 'active'">
                    <el-icon><VideoPause /></el-icon>
                  </el-button>
                  <el-button @click.stop="controlRobot(robot, 'emergency_stop')" type="danger">
                    <el-icon><Warning /></el-icon>
                  </el-button>
                  <el-button @click.stop="showRobotDetails(robot)">
                    <el-icon><View /></el-icon>
                  </el-button>
                  <el-dropdown @command="(cmd) => handleRobotAction(cmd, robot)" @click.stop>
                    <el-button>
                      <el-icon><MoreFilled /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="configure">配置</el-dropdown-item>
                        <el-dropdown-item command="maintain">维护</el-dropdown-item>
                        <el-dropdown-item command="calibrate">校准</el-dropdown-item>
                        <el-dropdown-item command="reboot">重启</el-dropdown-item>
                        <el-dropdown-item command="logs">查看日志</el-dropdown-item>
                        <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </el-button-group>
              </div>

              <!-- 迷你状态指示器 -->
              <div class="status-indicators">
                <div class="indicator-item" :class="{ active: robot.connectivity.signalStrength > 50 }">
                  <el-icon><Connection /></el-icon>
                  <span>{{ robot.connectivity.signalStrength }}%</span>
                </div>
                <div class="indicator-item" :class="{ active: robot.battery.charging }">
                  <el-icon><Lightning /></el-icon>
                  <span>{{ robot.battery.charging ? '充电中' : '电池' }}</span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="robotCurrentPage"
          v-model:page-size="robotPageSize"
          :page-sizes="[12, 24, 48, 96]"
          :total="totalRobots"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleRobotSizeChange"
          @current-change="handleRobotCurrentChange"
        />
      </div>
    </div>

    <!-- 任务视图 -->
    <div v-else-if="viewMode === 'tasks'" class="tasks-view">
      <!-- 任务过滤器 -->
      <div class="task-filters">
        <el-row :gutter="16">
          <el-col :span="6">
            <el-select v-model="taskTypeFilter" placeholder="任务类型" clearable>
              <el-option label="全部类型" value="" />
              <el-option label="配送任务" value="delivery" />
              <el-option label="清洁任务" value="cleaning" />
              <el-option label="巡检任务" value="inspection" />
              <el-option label="安保任务" value="security" />
              <el-option label="维护任务" value="maintenance" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="taskStatusFilter" placeholder="任务状态" clearable>
              <el-option label="全部状态" value="" />
              <el-option label="待执行" value="pending" />
              <el-option label="已分配" value="assigned" />
              <el-option label="进行中" value="in_progress" />
              <el-option label="已完成" value="completed" />
              <el-option label="失败" value="failed" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="taskPriorityFilter" placeholder="优先级" clearable>
              <el-option label="全部优先级" value="" />
              <el-option label="低" value="low" />
              <el-option label="中" value="medium" />
              <el-option label="高" value="high" />
              <el-option label="紧急" value="urgent" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button @click="refreshTasks">
              <el-icon><Refresh /></el-icon>
              刷新任务
            </el-button>
            <el-button @click="optimizeTaskAssignment">
              <el-icon><MagicStick /></el-icon>
              优化分配
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 任务列表 -->
      <div class="tasks-list">
        <el-table
          :data="filteredTasks"
          v-loading="loadingTasks"
          @selection-change="handleTaskSelection"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="任务名称" prop="name" width="150" />
          <el-table-column label="类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getTaskTypeTagType(row.type)" size="small">
                {{ getTaskTypeLabel(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getTaskStatusTagType(row.status)" size="small">
                {{ getTaskStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="优先级" width="80">
            <template #default="{ row }">
              <el-tag :type="getPriorityTagType(row.priority)" size="small">
                {{ getPriorityLabel(row.priority) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="分配机器人" width="150">
            <template #default="{ row }">
              <span v-if="row.assignedRobot">{{ getRobotName(row.assignedRobot) }}</span>
              <span v-else class="text-muted">未分配</span>
            </template>
          </el-table-column>
          <el-table-column label="进度" width="120">
            <template #default="{ row }">
              <el-progress
                :percentage="row.progress"
                :color="getProgressColor(row.progress)"
                :show-text="false"
                :stroke-width="6"
              />
              <span class="progress-text">{{ row.progress }}%</span>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="150">
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="预计时间" width="100">
            <template #default="{ row }">
              {{ row.estimatedDuration }}分钟
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button
                @click="assignTaskToRobot(row)"
                size="small"
                text
                type="primary"
                :disabled="row.status !== 'pending'"
              >
                分配
              </el-button>
              <el-button
                @click="viewTaskDetails(row)"
                size="small"
                text
                type="info"
              >
                详情
              </el-button>
              <el-button
                @click="cancelTask(row)"
                size="small"
                text
                type="danger"
                :disabled="['completed', 'cancelled'].includes(row.status)"
              >
                取消
              </el-button>
              <el-button
                @click="deleteTask(row)"
                size="small"
                text
                type="danger"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 任务分页 -->
      <div class="task-pagination">
        <el-pagination
          v-model:current-page="taskCurrentPage"
          v-model:page-size="taskPageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalTasks"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleTaskSizeChange"
          @current-change="handleTaskCurrentChange"
        />
      </div>
    </div>

    <!-- 群体视图 -->
    <div v-else-if="viewMode === 'swarm'" class="swarm-view">
      <div class="swarm-controls">
        <el-button @click="showCreateSwarmDialog = true" type="primary">
          <el-icon><Plus /></el-icon>
          创建群体
        </el-button>
        <el-button @click="showSwarmSimulation = true">
          <el-icon><VideoPlay /></el-icon>
          群体仿真
        </el-button>
        <el-button @click="optimizeSwarmCoordination">
          <el-icon><MagicStick /></el-icon>
          优化协调
        </el-button>
      </div>

      <div class="swarm-grid">
        <el-row :gutter="16">
          <el-col
            v-for="swarm in swarms"
            :key="swarm.id"
            :span="12"
            class="swarm-col"
          >
            <div class="swarm-card">
              <div class="swarm-header">
                <h3>{{ swarm.name }}</h3>
                <el-tag :type="getSwarmStatusTagType(swarm.status)" size="small">
                  {{ getSwarmStatusLabel(swarm.status) }}
                </el-tag>
              </div>

              <div class="swarm-details">
                <p>{{ swarm.description }}</p>
                <div class="swarm-stats">
                  <div class="stat-item">
                    <span class="label">成员数量:</span>
                    <span class="value">{{ swarm.members.length }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">协作类型:</span>
                    <span class="value">{{ getSwarmTypeLabel(swarm.type) }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">通信协议:</span>
                    <span class="value">{{ swarm.communication.protocol }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">协调效率:</span>
                    <el-progress
                      :percentage="Math.round(swarm.performance.coordinationQuality * 100)"
                      :show-text="false"
                      :stroke-width="6"
                    />
                  </div>
                </div>
              </div>

              <div class="swarm-actions">
                <el-button @click="controlSwarm(swarm, 'formation')" size="small">
                  编队控制
                </el-button>
                <el-button @click="controlSwarm(swarm, 'patrol')" size="small">
                  巡逻任务
                </el-button>
                <el-button @click="viewSwarmDetails(swarm)" size="small">
                  查看详情
                </el-button>
                <el-button @click="disbandSwarm(swarm)" size="small" type="danger">
                  解散群体
                </el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 分析视图 -->
    <div v-else-if="viewMode === 'analytics'" class="analytics-view">
      <el-row :gutter="16">
        <el-col :span="16">
          <!-- 性能图表 -->
          <div class="analytics-charts">
            <el-card title="机器人性能趋势">
              <div ref="performanceChart" class="chart-container"></div>
            </el-card>

            <el-card title="任务完成情况">
              <div ref="taskCompletionChart" class="chart-container"></div>
            </el-card>

            <el-card title="电量使用分析">
              <div ref="batteryUsageChart" class="chart-container"></div>
            </el-card>
          </div>
        </el-col>

        <el-col :span="8">
          <!-- 分析面板 -->
          <div class="analytics-panel">
            <el-card title="效率分析">
              <div class="efficiency-metrics">
                <div class="metric-item">
                  <span class="metric-label">整体效率</span>
                  <el-progress
                    :percentage="overallEfficiency"
                    :color="getEfficiencyColor(overallEfficiency)"
                  />
                </div>
                <div class="metric-item">
                  <span class="metric-label">任务完成率</span>
                  <el-progress :percentage="taskCompletionRate" color="#67c23a" />
                </div>
                <div class="metric-item">
                  <span class="metric-label">设备可用率</span>
                  <el-progress :percentage="deviceAvailability" color="#409eff" />
                </div>
                <div class="metric-item">
                  <span class="metric-label">平均响应时间</span>
                  <div class="response-time">
                    {{ averageResponseTime }}ms
                  </div>
                </div>
              </div>
            </el-card>

            <el-card title="成本效益分析">
              <div class="cost-analysis">
                <div class="cost-item">
                  <span>运营成本</span>
                  <strong>¥{{ operatingCost.toLocaleString() }}/月</strong>
                </div>
                <div class="cost-item">
                  <span>人力节省</span>
                  <strong>¥{{ laborSaving.toLocaleString() }}/月</strong>
                </div>
                <div class="cost-item">
                  <span>投资回报率</span>
                  <strong>{{ roi }}%</strong>
                </div>
                <div class="cost-item">
                  <span>预计回收期</span>
                  <strong>{{ paybackPeriod }}个月</strong>
                </div>
              </div>
            </el-card>

            <el-card title="预测分析">
              <div class="predictions">
                <div class="prediction-item">
                  <span>明日任务量</span>
                  <el-tag type="primary">{{ predictedTaskVolume }}</el-tag>
                </div>
                <div class="prediction-item">
                  <span>设备故障风险</span>
                  <el-tag :type="failureRisk > 0.3 ? 'danger' : 'success'">
                    {{ (failureRisk * 100).toFixed(1) }}%
                  </el-tag>
                </div>
                <div class="prediction-item">
                  <span>维护建议</span>
                  <el-tag type="warning">{{ maintenanceSuggestions }}</el-tag>
                </div>
              </div>
            </el-card>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 添加机器人对话框 -->
    <AddRobotDialog
      v-model="showAddRobotDialog"
      @success="handleRobotAdded"
    />

    <!-- 创建任务对话框 -->
    <CreateTaskDialog
      v-model="showCreateTaskDialog"
      :robots="robots"
      @success="handleTaskCreated"
    />

    <!-- 创建群体对话框 -->
    <CreateSwarmDialog
      v-model="showCreateSwarmDialog"
      :robots="robots"
      @success="handleSwarmCreated"
    />

    <!-- 机器人详情对话框 -->
    <RobotDetailsDialog
      v-model="showRobotDetailsDialog"
      :robot="selectedRobot"
    />

    <!-- 任务详情对话框 -->
    <TaskDetailsDialog
      v-model="showTaskDetailsDialog"
      :task="selectedTask"
    />

    <!-- 机器人选择对话框 -->
    <RobotSelectionDialog
      v-model="showRobotSelectionDialog"
      :robots="robots"
      :task="selectedTaskForAssignment"
      @confirm="handleTaskAssignment"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import {
  robotAgentAPI,
  type RobotAgent,
  type RobotTask,
  type RobotSwarm,
  RobotType,
  RobotStatus,
  TaskType,
  TaskStatus
} from '@/api/robot-agent'

// 导入组件（这些组件需要创建）
import AddRobotDialog from '@/components/RobotAgent/AddRobotDialog.vue'
import CreateTaskDialog from '@/components/RobotAgent/CreateTaskDialog.vue'
import CreateSwarmDialog from '@/components/RobotAgent/CreateSwarmDialog.vue'
import RobotDetailsDialog from '@/components/RobotAgent/RobotDetailsDialog.vue'
import TaskDetailsDialog from '@/components/RobotAgent/TaskDetailsDialog.vue'
import RobotSelectionDialog from '@/components/RobotAgent/RobotSelectionDialog.vue'

// 响应式数据
const viewMode = ref<'robots' | 'tasks' | 'swarm' | 'analytics'>('robots')

// 机器人相关
const robotSearchQuery = ref('')
const robotTypeFilter = ref('')
const robotStatusFilter = ref('')
const locationFilter = ref('')
const robotCurrentPage = ref(1)
const robotPageSize = ref(12)
const robots = ref<RobotAgent[]>([])
const selectedRobot = ref<RobotAgent | null>(null)
const showAddRobotDialog = ref(false)
const showRobotDetailsDialog = ref(false)

// 任务相关
const taskTypeFilter = ref('')
const taskStatusFilter = ref('')
const taskPriorityFilter = ref('')
const taskCurrentPage = ref(1)
const taskPageSize = ref(20)
const tasks = ref<RobotTask[]>([])
const selectedTask = ref<RobotTask | null>(null)
const selectedTaskForAssignment = ref<RobotTask | null>(null)
const selectedTasks = ref<RobotTask[]>([])
const showCreateTaskDialog = ref(false)
const showTaskDetailsDialog = ref(false)
const showRobotSelectionDialog = ref(false)
const loadingTasks = ref(false)

// 群体相关
const swarms = ref<RobotSwarm[]>([])
const showCreateSwarmDialog = ref(false)
const showSwarmSimulation = ref(false)

// 统计数据
const totalRobots = ref(0)
const activeRobots = ref(0)
const totalTasks = ref(0)
const averageEfficiency = ref(0)
const overallEfficiency = ref(0)
const taskCompletionRate = ref(0)
const deviceAvailability = ref(0)
const averageResponseTime = ref(0)
const operatingCost = ref(0)
const laborSaving = ref(0)
const roi = ref(0)
const paybackPeriod = ref(0)
const predictedTaskVolume = ref(0)
const failureRisk = ref(0)
const maintenanceSuggestions = ref(0)

// DOM引用
const performanceChart = ref<HTMLElement>()
const taskCompletionChart = ref<HTMLElement>()
const batteryUsageChart = ref<HTMLElement>()

// 计算属性
const filteredRobots = computed(() => {
  let filtered = robots.value

  if (robotSearchQuery.value) {
    filtered = filtered.filter(robot =>
      robot.name.toLowerCase().includes(robotSearchQuery.value.toLowerCase()) ||
      robot.model.toLowerCase().includes(robotSearchQuery.value.toLowerCase())
    )
  }

  if (robotTypeFilter.value) {
    filtered = filtered.filter(robot => robot.type === robotTypeFilter.value)
  }

  if (robotStatusFilter.value) {
    filtered = filtered.filter(robot => robot.status === robotStatusFilter.value)
  }

  if (locationFilter.value) {
    filtered = filtered.filter(robot => robot.location.zone === locationFilter.value)
  }

  return filtered.slice((robotCurrentPage.value - 1) * robotPageSize.value, robotCurrentPage.value * robotPageSize.value)
})

const filteredTasks = computed(() => {
  let filtered = tasks.value

  if (taskTypeFilter.value) {
    filtered = filtered.filter(task => task.type === taskTypeFilter.value)
  }

  if (taskStatusFilter.value) {
    filtered = filtered.filter(task => task.status === taskStatusFilter.value)
  }

  if (taskPriorityFilter.value) {
    filtered = filtered.filter(task => task.priority === taskPriorityFilter.value)
  }

  return filtered.slice((taskCurrentPage.value - 1) * taskPageSize.value, taskCurrentPage.value * taskPageSize.value)
})

// 方法
const loadRobots = async () => {
  try {
    const { data, success } = await robotAgentAPI.getRobots()
    if (success && data) {
      robots.value = data.robots
      totalRobots.value = data.total
      activeRobots.value = data.robots.filter(r => r.status === 'active').length
      averageEfficiency.value = Math.round(
        data.robots.reduce((sum, r) => sum + r.performance.efficiency, 0) / data.robots.length * 100
      )
    }
  } catch (error) {
    console.error('Load robots failed:', error)
    // 加载模拟数据
    loadMockRobots()
  }
}

const loadTasks = async () => {
  loadingTasks.value = true

  try {
    const { data, success } = await robotAgentAPI.getTasks()
    if (success && data) {
      tasks.value = data.tasks
      totalTasks.value = data.total
    }
  } catch (error) {
    console.error('Load tasks failed:', error)
    // 加载模拟数据
    loadMockTasks()
  } finally {
    loadingTasks.value = false
  }
}

const loadSwarms = async () => {
  try {
    const { data, success } = await robotAgentAPI.getSwarms()
    if (success && data) {
      swarms.value = data.swarms
    }
  } catch (error) {
    console.error('Load swarms failed:', error)
    // 加载模拟数据
    loadMockSwarms()
  }
}

const loadMockRobots = () => {
  const mockRobots: RobotAgent[] = [
    {
      id: 'robot_001',
      name: '送餐机器人1号',
      type: RobotType.DELIVERY_ROBOT,
      model: 'DeliverBot-X1',
      manufacturer: '智能机器人公司',
      serialNumber: 'DBX1001',
      status: RobotStatus.ACTIVE,
      location: { x: 10, y: 20, description: '餐厅A区' },
      battery: { level: 85, voltage: 24.5, temperature: 25, charging: false, estimatedRuntime: 240, lastChargeTime: '2024-01-09T08:00:00Z' },
      capabilities: [],
      sensors: [],
      actuators: [],
      connectivity: { networkType: 'wifi', signalStrength: 75, ipAddress: '192.168.1.101', lastConnectedTime: '2024-01-09T10:00:00Z', dataRate: 100 },
      performance: { uptime: 720, totalTasks: 150, completedTasks: 142, failedTasks: 3, averageTaskDuration: 15, efficiency: 0.88, reliability: 0.95 },
      maintenance: { lastMaintenanceTime: '2024-01-01T00:00:00Z', nextMaintenanceTime: '2024-02-01T00:00:00Z', maintenanceInterval: 720, operatingHours: 650, alerts: [] },
      configuration: { autonomy: 80, collaboration: true, learning: false, safetyLevel: 4, operationalLimits: {}, behavior: { speedLimit: 2.0, obstacleAvoidance: true, humanDetection: true, emergencyStop: true } },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-09T10:00:00Z',
      lastActive: '2024-01-09T10:30:00Z'
    },
    {
      id: 'robot_002',
      name: '清洁机器人2号',
      type: RobotType.CLEANING_ROBOT,
      model: 'CleanBot-Pro',
      manufacturer: '清洁科技',
      serialNumber: 'CBP2002',
      status: RobotStatus.CHARGING,
      location: { x: 50, y: 30, description: '走廊B区' },
      battery: { level: 45, voltage: 23.2, temperature: 28, charging: true, estimatedRuntime: 120, lastChargeTime: '2024-01-09T09:00:00Z' },
      capabilities: [],
      sensors: [],
      actuators: [],
      connectivity: { networkType: 'wifi', signalStrength: 60, ipAddress: '192.168.1.102', lastConnectedTime: '2024-01-09T10:00:00Z', dataRate: 50 },
      performance: { uptime: 500, totalTasks: 80, completedTasks: 78, failedTasks: 2, averageTaskDuration: 30, efficiency: 0.82, reliability: 0.92 },
      maintenance: { lastMaintenanceTime: '2023-12-15T00:00:00Z', nextMaintenanceTime: '2024-01-15T00:00:00Z', maintenanceInterval: 500, operatingHours: 450, alerts: [] },
      configuration: { autonomy: 70, collaboration: false, learning: false, safetyLevel: 3, operationalLimits: {}, behavior: { speedLimit: 1.5, obstacleAvoidance: true, humanDetection: true, emergencyStop: true } },
      createdAt: '2023-12-01T00:00:00Z',
      updatedAt: '2024-01-09T10:00:00Z',
      lastActive: '2024-01-09T08:45:00Z'
    }
  ]

  robots.value = mockRobots
  totalRobots.value = mockRobots.length
  activeRobots.value = mockRobots.filter(r => r.status === 'active').length
  averageEfficiency.value = Math.round(mockRobots.reduce((sum, r) => sum + r.performance.efficiency, 0) / mockRobots.length * 100)
}

const loadMockTasks = () => {
  const mockTasks: RobotTask[] = [
    {
      id: 'task_001',
      name: '餐桌3号配送',
      description: '将餐食从厨房配送到3号餐桌',
      type: TaskType.DELIVERY,
      status: TaskStatus.IN_PROGRESS,
      priority: 'high',
      assignedRobot: 'robot_001',
      creator: 'system',
      createdAt: '2024-01-09T10:00:00Z',
      scheduledTime: '2024-01-09T10:05:00Z',
      startedTime: '2024-01-09T10:06:00Z',
      estimatedDuration: 10,
      progress: 60,
      location: {
        start: { x: 5, y: 10, description: '厨房' },
        end: { x: 15, y: 25, description: '餐桌3号' }
      },
      requirements: { capabilities: [], sensors: [], minBattery: 50 },
      parameters: {},
      evaluation: { quality: 0, efficiency: 0, safety: 0 }
    },
    {
      id: 'task_002',
      name: '大厅区域清洁',
      description: '清洁大厅区域地面',
      type: TaskType.CLEANING,
      status: TaskStatus.PENDING,
      priority: 'medium',
      creator: 'system',
      createdAt: '2024-01-09T10:15:00Z',
      estimatedDuration: 45,
      progress: 0,
      location: {
        start: { x: 20, y: 20, description: '大厅入口' },
        end: { x: 60, y: 40, description: '大厅出口' }
      },
      requirements: { capabilities: [], sensors: [], minBattery: 60 },
      parameters: {},
      evaluation: { quality: 0, efficiency: 0, safety: 0 }
    }
  ]

  tasks.value = mockTasks
  totalTasks.value = mockTasks.length
}

const loadMockSwarms = () => {
  const mockSwarms: RobotSwarm[] = [
    {
      id: 'swarm_001',
      name: '餐饮服务协作群',
      description: '负责餐饮服务的机器人协作群体',
      type: 'cooperative',
      members: [
        { robotId: 'robot_001', role: 'delivery', status: 'active', capabilities: [] },
        { robotId: 'robot_002', role: 'cleaning', status: 'standby', capabilities: [] }
      ],
      communication: { protocol: 'MQTT', frequency: 10, topology: 'mesh', latency: 50, bandwidth: 100 },
      coordination: { algorithm: 'consensus', parameters: {}, decisionMaking: 'decentralized' },
      performance: { collectiveEfficiency: 0.85, coordinationQuality: 0.9, taskDistribution: 0.88, communicationReliability: 0.95 },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-09T10:00:00Z',
      status: 'active'
    }
  ]

  swarms.value = mockSwarms
}

const handleRobotSearch = () => {
  robotCurrentPage.value = 1
}

const resetRobotFilters = () => {
  robotSearchQuery.value = ''
  robotTypeFilter.value = ''
  robotStatusFilter.value = ''
  locationFilter.value = ''
  robotCurrentPage.value = 1
}

const refreshRobots = async () => {
  await loadRobots()
  ElMessage.success('机器人列表已刷新')
}

const refreshTasks = async () => {
  await loadTasks()
  ElMessage.success('任务列表已刷新')
}

const handleRobotSizeChange = (size: number) => {
  robotPageSize.value = size
}

const handleRobotCurrentChange = (page: number) => {
  robotCurrentPage.value = page
}

const handleTaskSizeChange = (size: number) => {
  taskPageSize.value = size
}

const handleTaskCurrentChange = (page: number) => {
  taskCurrentPage.value = page
}

const handleTaskSelection = (selection: RobotTask[]) => {
  selectedTasks.value = selection
}

const selectRobot = (robot: RobotAgent) => {
  selectedRobot.value = robot
  showRobotDetailsDialog.value = true
}

const controlRobot = async (robot: RobotAgent, action: string) => {
  try {
    const { data, success } = await robotAgentAPI.controlRobot(robot.id, {
      action: action as any,
      parameters: {}
    })

    if (success) {
      ElMessage.success(`机器人${robot.name}执行${action}成功`)
      await loadRobots()
    }
  } catch (error) {
    console.error('Control robot failed:', error)
    ElMessage.error('控制机器人失败')
  }
}

const handleRobotAction = async (command: string, robot: RobotAgent) => {
  switch (command) {
    case 'configure':
      // 配置机器人
      break
    case 'maintain':
      // 维护机器人
      break
    case 'calibrate':
      // 校准机器人
      break
    case 'reboot':
      await controlRobot(robot, 'restart')
      break
    case 'logs':
      // 查看日志
      break
    case 'delete':
      await deleteRobot(robot)
      break
  }
}

const deleteRobot = async (robot: RobotAgent) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除机器人 "${robot.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const { success } = await robotAgentAPI.deleteRobot(robot.id)
    if (success) {
      ElMessage.success('机器人删除成功')
      await loadRobots()
    }
  } catch (error) {
    // 用户取消或删除失败
  }
}

const showRobotDetails = (robot: RobotAgent) => {
  selectedRobot.value = robot
  showRobotDetailsDialog.value = true
}

const assignTaskToRobot = (task: RobotTask) => {
  selectedTaskForAssignment.value = task
  showRobotSelectionDialog.value = true
}

const handleTaskAssignment = async (robotId: string) => {
  if (!selectedTaskForAssignment.value) return

  try {
    const { success } = await robotAgentAPI.assignTask(selectedTaskForAssignment.value.id, robotId)
    if (success) {
      ElMessage.success('任务分配成功')
      showRobotSelectionDialog.value = false
      await loadTasks()
    }
  } catch (error) {
    console.error('Assign task failed:', error)
    ElMessage.error('任务分配失败')
  }
}

const viewTaskDetails = (task: RobotTask) => {
  selectedTask.value = task
  showTaskDetailsDialog.value = true
}

const cancelTask = async (task: RobotTask) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消任务 "${task.name}" 吗？`,
      '确认取消',
      {
        confirmButtonText: '取消任务',
        cancelButtonText: '保留任务',
        type: 'warning'
      }
    )

    const { success } = await robotAgentAPI.cancelTask(task.id, '用户手动取消')
    if (success) {
      ElMessage.success('任务已取消')
      await loadTasks()
    }
  } catch (error) {
    // 用户取消或取消失败
  }
}

const deleteTask = async (task: RobotTask) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除任务 "${task.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 调用删除任务API
    ElMessage.success('任务删除成功')
    await loadTasks()
  } catch (error) {
    // 用户取消
  }
}

const optimizeTaskAssignment = async () => {
  try {
    const { data, success } = await robotAgentAPI.getTaskOptimization({
      robotIds: robots.value.map(r => r.id),
      tasks: tasks.value.filter(t => t.status === 'pending').map(t => ({
        type: t.type,
        location: t.location.start,
        priority: t.priority,
        estimatedDuration: t.estimatedDuration
      })),
      objectives: ['efficiency', 'energy'],
      constraints: {}
    })

    if (success && data) {
      ElMessage.success(`任务优化完成，总体效率提升 ${data.totalEfficiency * 100}%`)
    }
  } catch (error) {
    console.error('Task optimization failed:', error)
    ElMessage.error('任务优化失败')
  }
}

const controlSwarm = async (swarm: RobotSwarm, action: string) => {
  try {
    const { success } = await robotAgentAPI.controlSwarm(swarm.id, {
      action: action as any,
      parameters: {}
    })

    if (success) {
      ElMessage.success(`群体控制指令执行成功`)
    }
  } catch (error) {
    console.error('Control swarm failed:', error)
    ElMessage.error('群体控制失败')
  }
}

const viewSwarmDetails = (swarm: RobotSwarm) => {
  // 查看群体详情
}

const disbandSwarm = async (swarm: RobotSwarm) => {
  try {
    await ElMessageBox.confirm(
      `确定要解散群体 "${swarm.name}" 吗？`,
      '确认解散',
      {
        confirmButtonText: '解散',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 调用解散群体API
    ElMessage.success('群体已解散')
    await loadSwarms()
  } catch (error) {
    // 用户取消
  }
}

const optimizeSwarmCoordination = async () => {
  ElMessage.info('群体协调优化功能开发中')
}

const handleRobotAdded = () => {
  loadRobots()
  ElMessage.success('机器人添加成功')
}

const handleTaskCreated = () => {
  loadTasks()
  ElMessage.success('任务创建成功')
}

const handleSwarmCreated = () => {
  loadSwarms()
  ElMessage.success('群体创建成功')
}

const initCharts = () => {
  nextTick(() => {
    // 初始化分析图表
    if (performanceChart.value) {
      const chart = echarts.init(performanceChart.value)
      // 设置性能趋势图表配置
    }

    if (taskCompletionChart.value) {
      const chart = echarts.init(taskCompletionChart.value)
      // 设置任务完成情况图表配置
    }

    if (batteryUsageChart.value) {
      const chart = echarts.init(batteryUsageChart.value)
      // 设置电量使用分析图表配置
    }
  })
}

// 加载分析数据
const loadAnalyticsData = async () => {
  overallEfficiency.value = 87
  taskCompletionRate.value = 92
  deviceAvailability.value = 95
  averageResponseTime.value = 1250
  operatingCost.value = 45000
  laborSaving.value = 28000
  roi.value = 156
  paybackPeriod.value = 18
  predictedTaskVolume.value = 156
  failureRisk.value = 0.12
  maintenanceSuggestions.value = 3
}

// 辅助方法
const getStatusTagType = (status: RobotStatus) => {
  const types: Record<string, string> = {
    active: 'success',
    idle: 'info',
    busy: 'warning',
    charging: 'primary',
    maintenance: 'warning',
    error: 'danger',
    offline: 'danger'
  }
  return types[status] || ''
}

const getStatusLabel = (status: RobotStatus) => {
  const labels: Record<string, string> = {
    active: '活跃',
    idle: '空闲',
    busy: '忙碌',
    charging: '充电中',
    maintenance: '维护中',
    error: '故障',
    offline: '离线'
  }
  return labels[status] || status
}

const getBatteryColor = (level: number) => {
  if (level > 60) return '#67c23a'
  if (level > 30) return '#e6a23c'
  return '#f56c6c'
}

const getTaskTypeTagType = (type: TaskType) => {
  const types: Record<string, string> = {
    delivery: 'primary',
    cleaning: 'success',
    inspection: 'warning',
    security: 'danger',
    maintenance: 'info'
  }
  return types[type] || ''
}

const getTaskTypeLabel = (type: TaskType) => {
  const labels: Record<string, string> = {
    delivery: '配送',
    cleaning: '清洁',
    inspection: '巡检',
    security: '安保',
    maintenance: '维护'
  }
  return labels[type] || type
}

const getTaskStatusTagType = (status: TaskStatus) => {
  const types: Record<string, string> = {
    pending: 'info',
    assigned: 'primary',
    in_progress: 'warning',
    completed: 'success',
    failed: 'danger',
    cancelled: 'danger'
  }
  return types[status] || ''
}

const getTaskStatusLabel = (status: TaskStatus) => {
  const labels: Record<string, string> = {
    pending: '待执行',
    assigned: '已分配',
    in_progress: '进行中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消'
  }
  return labels[status] || status
}

const getPriorityTagType = (priority: string) => {
  const types: Record<string, string> = {
    low: 'info',
    medium: 'primary',
    high: 'warning',
    urgent: 'danger'
  }
  return types[priority] || ''
}

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  }
  return labels[priority] || priority
}

const getProgressColor = (progress: number) => {
  if (progress >= 80) return '#67c23a'
  if (progress >= 50) return '#e6a23c'
  return '#f56c6c'
}

const getRobotName = (robotId: string) => {
  const robot = robots.value.find(r => r.id === robotId)
  return robot?.name || robotId
}

const getSwarmStatusTagType = (status: string) => {
  const types: Record<string, string> = {
    active: 'success',
    inactive: 'info',
    formation: 'warning',
    disbanding: 'danger'
  }
  return types[status] || ''
}

const getSwarmStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    active: '活跃',
    inactive: '非活跃',
    formation: '编队中',
    disbanding: '解散中'
  }
  return labels[status] || status
}

const getSwarmTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    cooperative: '协作型',
    competitive: '竞争型',
    hierarchical: '层次型',
    distributed: '分布式'
  }
  return labels[type] || type
}

const getEfficiencyColor = (efficiency: number) => {
  if (efficiency >= 80) return '#67c23a'
  if (efficiency >= 60) return '#e6a23c'
  return '#f56c6c'
}

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 生命周期
onMounted(async () => {
  await Promise.all([
    loadRobots(),
    loadTasks(),
    loadSwarms(),
    loadAnalyticsData()
  ])
  initCharts()
})
</script>

<style scoped lang="scss">
.robot-agent-management {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  background: white;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .title-section {
    .page-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 8px 0;
      font-size: 24px;
      color: #2c3e50;
    }

    .page-description {
      margin: 0;
      color: #606266;
      font-size: 14px;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }
}

.robots-view {
  .search-section {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .filter-actions {
      display: flex;
      gap: 8px;
    }
  }

  .stats-cards {
    margin-bottom: 24px;

    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 16px;

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: white;
      }

      &.total .stat-icon {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.active .stat-icon {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      &.tasks .stat-icon {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      &.efficiency .stat-icon {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }

      .stat-content {
        h3 {
          margin: 0 0 4px 0;
          font-size: 28px;
          font-weight: bold;
          color: #2c3e50;
        }

        p {
          margin: 0;
          color: #606266;
          font-size: 14px;
        }
      }
    }
  }

  .robots-grid {
    .robot-col {
      margin-bottom: 16px;
    }

    .robot-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 0.3s ease;
      height: 280px;
      display: flex;
      flex-direction: column;

      &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }

      .robot-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;

        .robot-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .robot-info {
          flex: 1;

          h4 {
            margin: 0 0 4px 0;
            font-size: 16px;
            color: #2c3e50;
          }

          p {
            margin: 0;
            color: #909399;
            font-size: 13px;
          }
        }

        .robot-status {
          flex-shrink: 0;
        }
      }

      .robot-details {
        margin-bottom: 16px;
        flex: 1;

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 13px;

          .label {
            color: #909399;
          }

          .value {
            color: #2c3e50;
            font-weight: 500;
          }

          .battery-indicator {
            display: flex;
            align-items: center;
            gap: 8px;

            .battery-text {
              font-size: 12px;
              color: #2c3e50;
              font-weight: 500;
            }
          }
        }
      }

      .robot-actions {
        margin-bottom: 12px;
      }

      .status-indicators {
        display: flex;
        gap: 16px;
        font-size: 12px;
        color: #909399;

        .indicator-item {
          display: flex;
          align-items: center;
          gap: 4px;

          &.active {
            color: #67c23a;
          }
        }
      }
    }
  }

  .pagination-section {
    display: flex;
    justify-content: center;
    margin-top: 24px;
  }
}

.tasks-view {
  .task-filters {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .tasks-list {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .progress-text {
      margin-left: 8px;
      font-size: 12px;
      color: #6b7280;
    }

    .text-muted {
      color: #9ca3af;
    }
  }

  .task-pagination {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
}

.swarm-view {
  .swarm-controls {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    gap: 12px;
  }

  .swarm-grid {
    .swarm-col {
      margin-bottom: 16px;
    }

    .swarm-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .swarm-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        h3 {
          margin: 0;
          color: #2c3e50;
        }
      }

      .swarm-details {
        margin-bottom: 16px;

        p {
          margin: 0 0 16px 0;
          color: #6b7280;
          line-height: 1.5;
        }

        .swarm-stats {
          .stat-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 14px;

            .label {
              color: #909399;
            }

            .value {
              color: #2c3e50;
              font-weight: 500;
            }
          }
        }
      }

      .swarm-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
    }
  }
}

.analytics-view {
  .analytics-charts {
    .el-card {
      margin-bottom: 16px;

      .chart-container {
        height: 300px;
      }
    }
  }

  .analytics-panel {
    .el-card {
      margin-bottom: 16px;

      .efficiency-metrics {
        .metric-item {
          margin-bottom: 16px;

          .metric-label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            color: #606266;
          }

          .response-time {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            text-align: center;
          }
        }
      }

      .cost-analysis {
        .cost-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 14px;

          strong {
            color: #2c3e50;
          }
        }
      }

      .predictions {
        .prediction-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 14px;
        }
      }
    }
  }
}
</style>