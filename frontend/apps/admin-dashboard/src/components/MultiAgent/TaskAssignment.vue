<template>
  <div class="task-assignment">
    <div class="assignment-header">
      <h3>任务信息</h3>
      <div class="task-info">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="任务名称">{{ task.name }}</el-descriptions-item>
          <el-descriptions-item label="任务ID">{{ task.id }}</el-descriptions-item>
          <el-descriptions-item label="任务类型">{{ task.type }}</el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag :type="task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'success'">
              {{ task.priority }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(task.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="task.status === 'pending' ? 'info' : task.status === 'running' ? 'warning' : task.status === 'completed' ? 'success' : 'danger'">
              {{ task.status }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <div class="assignment-body">
      <h3>智能体选择</h3>
      <div class="agent-selection">
        <el-form :model="assignmentForm" label-width="100px">
          <el-form-item label="智能体类型">
            <el-select
              v-model="assignmentForm.agentType"
              placeholder="请选择智能体类型"
              style="width: 100%"
              @change="onAgentTypeChange"
            >
              <el-option label="客户服务" value="customer_service" />
              <el-option label="营销推广" value="marketing" />
              <el-option label="运营管理" value="operation" />
              <el-option label="技术支持" value="technical" />
              <el-option label="决策分析" value="decision" />
            </el-select>
          </el-form-item>

          <el-form-item label="智能体列表">
            <el-table
              v-loading="loadingAgents"
              :data="filteredAgents"
              stripe
              style="width: 100%"
              @row-click="selectAgent"
            >
              <el-table-column prop="id" label="智能体ID" width="180" />
              <el-table-column prop="name" label="智能体名称" width="180" />
              <el-table-column prop="type" label="类型" width="120" />
              <el-table-column prop="status" label="状态" width="120">
                <template #default="scope">
                  <el-tag :type="scope.row.status === 'online' ? 'success' : 'danger'">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="cpuUsage" label="CPU使用率" width="120">
                <template #default="scope">
                  {{ scope.row.cpuUsage ? scope.row.cpuUsage.toFixed(1) + '%' : 'N/A' }}
                </template>
              </el-table-column>
              <el-table-column prop="memoryUsage" label="内存使用率" width="120">
                <template #default="scope">
                  {{ scope.row.memoryUsage ? scope.row.memoryUsage.toFixed(1) + '%' : 'N/A' }}
                </template>
              </el-table-column>
              <el-table-column prop="tasksRunning" label="运行任务数" width="120" />
            </el-table>
          </el-form-item>

          <el-form-item label="选择的智能体">
            <el-select
              v-model="assignmentForm.selectedAgent"
              placeholder="请选择智能体"
              style="width: 100%"
              filterable
              disabled
            >
              <el-option
                v-for="agent in filteredAgents"
                :key="agent.id"
                :label="agent.name"
                :value="agent"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="分配方式">
            <el-radio-group v-model="assignmentForm.allocationType" style="width: 100%">
              <el-radio label="自动分配">自动分配（根据负载）</el-radio>
              <el-radio label="手动分配">手动分配（选择特定智能体）</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="分配策略" v-if="assignmentForm.allocationType === 'auto'">
            <el-select
              v-model="assignmentForm.allocationStrategy"
              placeholder="请选择分配策略"
              style="width: 100%"
            >
              <el-option label="负载均衡" value="load_balancing" />
              <el-option label="就近原则" value="proximity" />
              <el-option label="随机分配" value="random" />
            </el-select>
          </el-form-item>

          <el-form-item label="分配备注">
            <el-input
              v-model="assignmentForm.notes"
              type="textarea"
              :rows="3"
              placeholder="请输入分配备注（可选）"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div class="assignment-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleAssign" :loading="loading">
        {{ assignmentForm.allocationType === 'auto' ? '自动分配' : '手动分配' }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { multiAgentAPI } from '@/api/multi-agent'
import type { Task, Agent } from '@/api/multi-agent'

const props = defineProps<{
  task: Task
}>()

const emit = defineEmits<{
  success: [task: Task]
  cancel: []
}>()

// 响应式数据
const loading = ref(false)
const loadingAgents = ref(false)
const agents = ref<Agent[]>([])

// 分配表单
const assignmentForm = reactive({
  agentType: '',
  selectedAgent: null,
  allocationType: 'auto',
  allocationStrategy: 'load_balancing',
  notes: ''
})

// 过滤后的智能体列表
const filteredAgents = computed(() => {
  return agents.value.filter(agent => {
    // 只显示在线状态的智能体
    if (agent.status !== 'online') return false
    
    // 根据智能体类型过滤
    if (assignmentForm.agentType && agent.type !== assignmentForm.agentType) return false
    
    return true
  })
})

// 选择智能体
const selectAgent = (agent: Agent) => {
  assignmentForm.selectedAgent = agent
}

// 智能体类型变化
const onAgentTypeChange = () => {
  assignmentForm.selectedAgent = null
}

// 取消分配
const handleCancel = () => {
  emit('cancel')
}

// 执行分配
const handleAssign = async () => {
  // 验证手动分配是否选择了智能体
  if (assignmentForm.allocationType === 'manual' && !assignmentForm.selectedAgent) {
    ElMessage.error('请选择要分配的智能体')
    return
  }
  
  loading.value = true
  try {
    let assignedTask
    
    if (assignmentForm.allocationType === 'auto') {
      // 自动分配
      assignedTask = await multiAgentAPI.autoAssignTask(props.task.id, {
        agentType: assignmentForm.agentType || undefined,
        strategy: assignmentForm.allocationStrategy,
        notes: assignmentForm.notes
      })
    } else {
      // 手动分配
      assignedTask = await multiAgentAPI.assignTask(props.task.id, assignmentForm.selectedAgent.id, {
        notes: assignmentForm.notes
      })
    }
    
    ElMessage.success('任务分配成功')
    emit('success', assignedTask)
  } catch (error) {
    ElMessage.error('任务分配失败，请重试')
    console.error('Assign task failed:', error)
  } finally {
    loading.value = false
  }
}

// 获取智能体列表
const loadAgents = async () => {
  loadingAgents.value = true
  try {
    const allAgents = await multiAgentAPI.getAgents()
    agents.value = allAgents
  } catch (error) {
    ElMessage.error('获取智能体列表失败')
    console.error('Load agents failed:', error)
  } finally {
    loadingAgents.value = false
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 组件挂载时获取智能体列表
onMounted(() => {
  loadAgents()
})
</script>

<style scoped>
.task-assignment {
  padding: 20px 0;
}

.assignment-header {
  margin-bottom: 20px;
}

.assignment-header h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
}

.task-info {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

.assignment-body {
  margin-bottom: 20px;
}

.assignment-body h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
}

.agent-selection {
  padding: 15px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.assignment-footer {
  text-align: right;
  padding: 20px 0;
  border-top: 1px solid #ebeef5;
}

.task-info .el-descriptions__content {
  font-weight: 500;
}

.assignment-body .el-form-item {
  margin-bottom: 15px;
}
</style>