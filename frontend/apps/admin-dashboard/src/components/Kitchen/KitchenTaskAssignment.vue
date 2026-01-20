<template>
  <div class="kitchen-task-assignment">
    <el-card class="assignment-card">
      <template #header>
        <div class="card-header">
          <span>任务分配</span>
          <el-button size="small" @click="refreshTasks">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <div class="assignment-content">
        <div class="staff-section">
          <h3>员工列表</h3>
          <div class="staff-list">
            <div
              v-for="staff in staffList"
              :key="staff.id"
              class="staff-item"
              :class="{ active: selectedStaff?.id === staff.id }"
              @click="selectStaff(staff)"
            >
              <div class="staff-avatar">
                <el-avatar :size="40">{{ staff.name.charAt(0) }}</el-avatar>
              </div>
              <div class="staff-info">
                <div class="staff-name">{{ staff.name }}</div>
                <div class="staff-role">{{ getRoleName(staff.role) }}</div>
              </div>
              <div class="staff-stats">
                <el-badge :value="staff.activeTasks" :max="99" class="task-badge">
                  <span>进行中</span>
                </el-badge>
                <el-badge :value="staff.completedToday" :max="99" class="task-badge success">
                  <span>今日完成</span>
                </el-badge>
              </div>
            </div>
          </div>
        </div>

        <div class="tasks-section">
          <div class="section-header">
            <h3>待分配任务</h3>
            <div class="filter-controls">
              <el-select
                v-model="taskFilter.station"
                placeholder="岗位"
                clearable
                size="small"
                style="width: 120px"
                @change="filterTasks"
              >
                <el-option label="热菜" value="hot_dish" />
                <el-option label="凉菜" value="cold_dish" />
                <el-option label="汤类" value="soup" />
                <el-option label="吧台" value="bar" />
                <el-option label="点心" value="dessert" />
              </el-select>
              <el-select
                v-model="taskFilter.priority"
                placeholder="优先级"
                clearable
                size="small"
                style="width: 100px"
                @change="filterTasks"
              >
                <el-option label="紧急" value="urgent" />
                <el-option label="高" value="high" />
                <el-option label="普通" value="normal" />
                <el-option label="低" value="low" />
              </el-select>
            </div>
          </div>

          <div class="tasks-list">
            <div
              v-for="task in filteredTasks"
              :key="task.id"
              class="task-item"
              draggable="true"
              @dragstart="handleDragStart($event, task)"
            >
              <div class="task-header">
                <span class="task-name">{{ task.itemName }}</span>
                <el-tag :type="getPriorityTagType(task.priority)" size="small">
                  {{ getPriorityName(task.priority) }}
                </el-tag>
              </div>
              <div class="task-details">
                <span class="order-no">{{ task.orderNo }}</span>
                <span class="table-number">桌号: {{ task.tableNumber }}</span>
                <span class="quantity">x{{ task.quantity }}</span>
              </div>
              <div class="task-footer">
                <span class="station">{{ getStationName(task.station) }}</span>
                <span class="waiting-time">
                  等待: {{ formatWaitingTime(task.createdAt) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="assigned-section">
          <h3>已分配任务</h3>
          <div
            v-for="staff in staffList"
            :key="staff.id"
            class="staff-tasks"
            @drop="handleDrop($event, staff)"
            @dragover.prevent
            @dragenter.prevent
          >
            <div class="staff-tasks-header">
              <div class="staff-info">
                <el-avatar :size="32">{{ staff.name.charAt(0) }}</el-avatar>
                <span class="staff-name">{{ staff.name }}</span>
              </div>
              <el-badge :value="staff.assignedTasks?.length || 0" :max="99">
                <span>任务数</span>
              </el-badge>
            </div>
            <div class="staff-tasks-list">
              <div
                v-for="task in staff.assignedTasks"
                :key="task.id"
                class="assigned-task"
              >
                <div class="task-info">
                  <span class="task-name">{{ task.itemName }}</span>
                  <span class="order-no">{{ task.orderNo }}</span>
                </div>
                <div class="task-actions">
                  <el-button
                    size="small"
                    type="danger"
                    link
                    @click="unassignTask(task, staff)"
                  >
                    取消分配
                  </el-button>
                </div>
              </div>
              <div v-if="!staff.assignedTasks || staff.assignedTasks.length === 0" class="empty-tasks">
                暂无任务
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog
      v-model="showAssignDialog"
      title="分配任务"
      width="500px"
    >
      <el-form :model="assignForm" label-width="100px">
        <el-form-item label="选择员工">
          <el-select v-model="assignForm.staffId" placeholder="请选择员工">
            <el-option
              v-for="staff in availableStaff"
              :key="staff.id"
              :label="staff.name"
              :value="staff.id"
            >
              <div class="staff-option">
                <span>{{ staff.name }}</span>
                <el-badge :value="staff.activeTasks" :max="99" size="small" />
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="assignForm.priority" placeholder="请选择优先级">
            <el-option label="紧急" value="urgent" />
            <el-option label="高" value="high" />
            <el-option label="普通" value="normal" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="assignForm.note"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAssignDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAssign">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'

interface Staff {
  id: number
  name: string
  role: string
  station: string
  activeTasks: number
  completedToday: number
  assignedTasks?: Task[]
}

interface Task {
  id: number
  taskId: string
  orderNo: string
  itemName: string
  quantity: number
  station: string
  priority: string
  status: string
  tableNumber: string
  createdAt: string
}

const selectedStaff = ref<Staff | null>(null)
const showAssignDialog = ref(false)
const selectedTask = ref<Task | null>(null)

const taskFilter = reactive({
  station: '',
  priority: ''
})

const assignForm = reactive({
  staffId: '',
  priority: 'normal',
  note: ''
})

const staffList = ref<Staff[]>([
  {
    id: 1,
    name: '张三',
    role: 'chef',
    station: 'hot_dish',
    activeTasks: 3,
    completedToday: 25,
    assignedTasks: []
  },
  {
    id: 2,
    name: '李四',
    role: 'chef',
    station: 'hot_dish',
    activeTasks: 2,
    completedToday: 22,
    assignedTasks: []
  },
  {
    id: 3,
    name: '王五',
    role: 'assistant',
    station: 'cold_dish',
    activeTasks: 1,
    completedToday: 18,
    assignedTasks: []
  },
  {
    id: 4,
    name: '赵六',
    role: 'chef',
    station: 'soup',
    activeTasks: 2,
    completedToday: 20,
    assignedTasks: []
  }
])

const unassignedTasks = ref<Task[]>([
  {
    id: 1,
    taskId: 'TASK-001',
    orderNo: 'ORD-001',
    itemName: '宫保鸡丁',
    quantity: 2,
    station: 'hot_dish',
    priority: 'urgent',
    status: 'pending',
    tableNumber: 'A1',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    taskId: 'TASK-002',
    orderNo: 'ORD-002',
    itemName: '凉拌黄瓜',
    quantity: 1,
    station: 'cold_dish',
    priority: 'normal',
    status: 'pending',
    tableNumber: 'B2',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    taskId: 'TASK-003',
    orderNo: 'ORD-003',
    itemName: '番茄鸡蛋汤',
    quantity: 1,
    station: 'soup',
    priority: 'high',
    status: 'pending',
    tableNumber: 'C1',
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString()
  }
])

const filteredTasks = computed(() => {
  return unassignedTasks.value.filter(task => {
    if (taskFilter.station && task.station !== taskFilter.station) {
      return false
    }
    if (taskFilter.priority && task.priority !== taskFilter.priority) {
      return false
    }
    return true
  })
})

const availableStaff = computed(() => {
  return staffList.value.filter(staff => {
    if (!selectedTask.value) return true
    return staff.station === selectedTask.value.station
  })
})

const selectStaff = (staff: Staff) => {
  selectedStaff.value = staff
}

const refreshTasks = async () => {
  try {
    ElMessage.loading('刷新任务...')
    const response = await fetch('/api/kitchen/tasks/unassigned').then(res => res.json())
    if (response.success) {
      unassignedTasks.value = response.data
      ElMessage.success('刷新成功')
    }
  } catch (error) {
    console.error('Refresh tasks failed:', error)
    ElMessage.error('刷新失败')
  }
}

const filterTasks = () => {
}

const handleDragStart = (event: DragEvent, task: Task) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('task', JSON.stringify(task))
    selectedTask.value = task
  }
}

const handleDrop = async (event: DragEvent, staff: Staff) => {
  event.preventDefault()
  if (!event.dataTransfer) return

  const taskData = event.dataTransfer.getData('task')
  if (!taskData) return

  const task: Task = JSON.parse(taskData)
  
  try {
    const response = await fetch('/api/kitchen/tasks/assign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        taskId: task.id,
        staffId: staff.id
      })
    }).then(res => res.json())

    if (response.success) {
      ElMessage.success('任务分配成功')
      
      const taskIndex = unassignedTasks.value.findIndex(t => t.id === task.id)
      if (taskIndex > -1) {
        const [removedTask] = unassignedTasks.value.splice(taskIndex, 1)
        if (!staff.assignedTasks) {
          staff.assignedTasks = []
        }
        staff.assignedTasks.push(removedTask)
        staff.activeTasks++
      }
    }
  } catch (error) {
    console.error('Assign task failed:', error)
    ElMessage.error('任务分配失败')
  }
}

const unassignTask = async (task: Task, staff: Staff) => {
  try {
    const response = await fetch('/api/kitchen/tasks/unassign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        taskId: task.id,
        staffId: staff.id
      })
    }).then(res => res.json())

    if (response.success) {
      ElMessage.success('取消分配成功')
      
      const taskIndex = staff.assignedTasks?.findIndex(t => t.id === task.id)
      if (taskIndex !== undefined && taskIndex > -1) {
        const [removedTask] = staff.assignedTasks!.splice(taskIndex, 1)
        unassignedTasks.value.push(removedTask)
        staff.activeTasks--
      }
    }
  } catch (error) {
    console.error('Unassign task failed:', error)
    ElMessage.error('取消分配失败')
  }
}

const confirmAssign = async () => {
  if (!selectedTask.value || !assignForm.staffId) {
    ElMessage.warning('请选择员工')
    return
  }

  try {
    const response = await fetch('/api/kitchen/tasks/assign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        taskId: selectedTask.value.id,
        staffId: assignForm.staffId,
        priority: assignForm.priority,
        note: assignForm.note
      })
    }).then(res => res.json())

    if (response.success) {
      ElMessage.success('任务分配成功')
      showAssignDialog.value = false
      
      const taskIndex = unassignedTasks.value.findIndex(t => t.id === selectedTask.value!.id)
      if (taskIndex > -1) {
        const [removedTask] = unassignedTasks.value.splice(taskIndex, 1)
        const staff = staffList.value.find(s => s.id === parseInt(assignForm.staffId))
        if (staff) {
          if (!staff.assignedTasks) {
            staff.assignedTasks = []
          }
          staff.assignedTasks.push(removedTask)
          staff.activeTasks++
        }
      }
    }
  } catch (error) {
    console.error('Assign task failed:', error)
    ElMessage.error('任务分配失败')
  }
}

const getRoleName = (role: string) => {
  const roleMap: Record<string, string> = {
    'chef': '厨师',
    'assistant': '帮厨',
    'supervisor': '主管'
  }
  return roleMap[role] || role
}

const getStationName = (station: string) => {
  const stationMap: Record<string, string> = {
    'hot_dish': '热菜',
    'cold_dish': '凉菜',
    'soup': '汤类',
    'bar': '吧台',
    'dessert': '点心',
    'general': '综合'
  }
  return stationMap[station] || station
}

const getPriorityTagType = (priority: string) => {
  const typeMap: Record<string, string> = {
    'urgent': 'danger',
    'high': 'warning',
    'normal': 'info',
    'low': ''
  }
  return typeMap[priority] || ''
}

const getPriorityName = (priority: string) => {
  const nameMap: Record<string, string> = {
    'urgent': '紧急',
    'high': '高',
    'normal': '普通',
    'low': '低'
  }
  return nameMap[priority] || priority
}

const formatWaitingTime = (createdAt: string) => {
  const diff = Date.now() - new Date(createdAt).getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  if (minutes < 60) {
    return `${minutes}分钟`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}小时${mins}分钟`
}

onMounted(() => {
  refreshTasks()
})
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.kitchen-task-assignment {
  .assignment-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .assignment-content {
      display: grid;
      grid-template-columns: 300px 1fr 300px;
      gap: $spacing-4;
      height: 600px;

      .staff-section,
      .tasks-section,
      .assigned-section {
        display: flex;
        flex-direction: column;
        gap: $spacing-3;

        h3 {
          margin: 0;
          font-size: $font-size-base;
          font-weight: 600;
          color: $text-primary;
        }

        .staff-list {
          flex: 1;
          overflow-y: auto;

          .staff-item {
            display: flex;
            align-items: center;
            gap: $spacing-3;
            padding: $spacing-3;
            border-radius: $border-radius-md;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              background: $background-light;
            }

            &.active {
              background: $primary-light;
              border: 1px solid $primary-color;
            }

            .staff-avatar {
              flex-shrink: 0;
            }

            .staff-info {
              flex: 1;

              .staff-name {
                font-weight: 600;
                color: $text-primary;
              }

              .staff-role {
                font-size: $font-size-sm;
                color: $text-secondary;
              }
            }

            .staff-stats {
              display: flex;
              flex-direction: column;
              gap: $spacing-1;

              .task-badge {
                font-size: $font-size-xs;

                &.success {
                  :deep(.el-badge__content) {
                    background: $success-color;
                  }
                }
              }
            }
          }
        }
      }

      .tasks-section {
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .filter-controls {
            display: flex;
            gap: $spacing-2;
          }
        }

        .tasks-list {
          flex: 1;
          overflow-y: auto;

          .task-item {
            padding: $spacing-3;
            background: $background-light;
            border-radius: $border-radius-md;
            margin-bottom: $spacing-2;
            cursor: move;
            transition: all 0.3s;

            &:hover {
              box-shadow: $shadow-sm;
            }

            .task-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: $spacing-2;

              .task-name {
                font-weight: 600;
                color: $text-primary;
              }
            }

            .task-details {
              display: flex;
              gap: $spacing-2;
              font-size: $font-size-sm;
              color: $text-secondary;
              margin-bottom: $spacing-2;
            }

            .task-footer {
              display: flex;
              justify-content: space-between;
              font-size: $font-size-xs;
              color: $text-tertiary;

              .waiting-time {
                color: $warning-color;
              }
            }
          }
        }
      }

      .assigned-section {
        .staff-tasks {
          border: 1px solid $border-color;
          border-radius: $border-radius-md;
          padding: $spacing-2;
          margin-bottom: $spacing-2;
          min-height: 150px;
          transition: all 0.3s;

          &:hover {
            border-color: $primary-color;
          }

          .staff-tasks-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: $spacing-2;
            border-bottom: 1px solid $border-color;
            margin-bottom: $spacing-2;

            .staff-info {
              display: flex;
              align-items: center;
              gap: $spacing-2;

              .staff-name {
                font-weight: 600;
                color: $text-primary;
              }
            }
          }

          .staff-tasks-list {
            .assigned-task {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: $spacing-2;
              background: $background-light;
              border-radius: $border-radius-sm;
              margin-bottom: $spacing-2;

              .task-info {
                display: flex;
                flex-direction: column;
                gap: $spacing-1;

                .task-name {
                  font-weight: 600;
                  color: $text-primary;
                }

                .order-no {
                  font-size: $font-size-xs;
                  color: $text-secondary;
                }
              }
            }

            .empty-tasks {
              text-align: center;
              color: $text-tertiary;
              font-size: $font-size-sm;
              padding: $spacing-4;
            }
          }
        }
      }
    }
  }

  .staff-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
}
</style>
