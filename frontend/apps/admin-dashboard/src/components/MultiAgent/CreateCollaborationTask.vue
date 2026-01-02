<template>
  <div class="create-task">
    <el-form
      ref="taskFormRef"
      :model="taskForm"
      :rules="taskRules"
      label-width="120px"
      label-position="top"
    >
      <!-- 基本信息 -->
      <el-card class="form-section">
        <template #header>
          <div class="section-header">
            <h3>基本信息</h3>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="任务标题" prop="title">
              <el-input
                v-model="taskForm.title"
                placeholder="请输入任务标题"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务类型" prop="type">
              <el-select
                v-model="taskForm.type"
                placeholder="请选择任务类型"
                style="width: 100%"
              >
                <el-option label="数据收集" value="data_collection" />
                <el-option label="分析处理" value="analysis" />
                <el-option label="决策制定" value="decision_making" />
                <el-option label="执行操作" value="execution" />
                <el-option label="协调管理" value="coordination" />
                <el-option label="监控评估" value="monitoring" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="任务描述" prop="description">
          <el-input
            v-model="taskForm.description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述任务内容、目标和要求"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="优先级" prop="priority">
              <el-select
                v-model="taskForm.priority"
                placeholder="请选择优先级"
                style="width: 100%"
              >
                <el-option label="低" :value="TaskPriority.LOW" />
                <el-option label="中" :value="TaskPriority.MEDIUM" />
                <el-option label="高" :value="TaskPriority.HIGH" />
                <el-option label="紧急" :value="TaskPriority.URGENT" />
                <el-option label="关键" :value="TaskPriority.CRITICAL" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="预计时长" prop="estimatedDuration">
              <el-input-number
                v-model="taskForm.estimatedDuration"
                :min="1"
                :max="9999"
                placeholder="分钟"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="截止时间">
              <el-date-picker
                v-model="taskForm.deadline"
                type="datetime"
                placeholder="选择截止时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 技能要求 -->
      <el-card class="form-section">
        <template #header>
          <div class="section-header">
            <h3>技能要求</h3>
            <el-button type="primary" plain size="small" @click="addRequiredSkill">
              <el-icon><Plus /></el-icon>
              添加技能
            </el-button>
          </div>
        </template>

        <div class="skills-list">
          <div
            v-for="(skill, index) in taskForm.requiredSkills"
            :key="index"
            class="skill-item"
          >
            <el-select
              v-model="skill.name"
              placeholder="选择技能"
              style="width: 200px; margin-right: 12px"
            >
              <el-option label="自然语言处理" value="nlp" />
              <el-option label="计算机视觉" value="computer_vision" />
              <el-option label="数据分析" value="data_analysis" />
              <el-option label="机器学习" value="machine_learning" />
              <el-option label="决策支持" value="decision_support" />
              <el-option label="任务执行" value="task_execution" />
              <el-option label="协调管理" value="coordination" />
              <el-option label="监控评估" value="monitoring" />
            </el-select>
            <el-select
              v-model="skill.level"
              placeholder="熟练度"
              style="width: 120px; margin-right: 12px"
            >
              <el-option label="基础" value="basic" />
              <el-option label="熟练" value="proficient" />
              <el-option label="精通" value="expert" />
            </el-select>
            <el-button
              type="danger"
              plain
              size="small"
              @click="removeRequiredSkill(index)"
            >
              删除
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 智能体分配 -->
      <el-card class="form-section">
        <template #header>
          <div class="section-header">
            <h3>智能体分配</h3>
          </div>
        </template>

        <el-form-item label="分配方式">
          <el-radio-group v-model="taskForm.assignmentMode">
            <el-radio label="manual">手动分配</el-radio>
            <el-radio label="auto">自动分配</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="taskForm.assignmentMode === 'manual'" label="选择智能体">
          <el-select
            v-model="taskForm.assignedAgents"
            multiple
            placeholder="请选择要分配的智能体"
            style="width: 100%"
          >
            <el-option
              v-for="agent in availableAgents"
              :key="agent.id"
              :label="`${agent.name} (${agent.type})`"
              :value="agent.id"
            >
              <div class="agent-option">
                <div class="agent-info">
                  <span class="agent-name">{{ agent.name }}</span>
                  <el-tag size="small" type="info">{{ agent.type }}</el-tag>
                </div>
                <div class="agent-status">
                  <el-tag
                    :type="getAgentStatusType(agent.status)"
                    size="small"
                  >
                    {{ agent.status }}
                  </el-tag>
                  <span class="agent-load">负载: {{ agent.currentLoad }}%</span>
                </div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <div v-if="taskForm.assignmentMode === 'auto'" class="auto-assignment">
          <el-alert
            title="自动分配"
            description="系统将根据任务要求和智能体当前状态自动选择最适合的智能体执行任务"
            type="info"
            :closable="false"
          />
          <div class="assignment-criteria">
            <el-checkbox-group v-model="taskForm.autoCriteria">
              <el-checkbox label="skills">技能匹配</el-checkbox>
              <el-checkbox label="workload">负载均衡</el-checkbox>
              <el-checkbox label="performance">性能优先</el-checkbox>
              <el-checkbox label="availability">可用性</el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
      </el-card>

      <!-- 协作配置 -->
      <el-card class="form-section">
        <template #header>
          <div class="section-header">
            <h3>协作配置</h3>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="协作模式">
              <el-select v-model="taskForm.collaboration.mode" style="width: 100%">
                <el-option label="顺序执行" value="sequential" />
                <el-option label="并行执行" value="parallel" />
                <el-option label="层次协作" value="hierarchical" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="协调方式">
              <el-select v-model="taskForm.collaboration.coordination" style="width: 100%">
                <el-option label="集中式" value="centralized" />
                <el-option label="分布式" value="decentralized" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="通信方式">
              <el-select v-model="taskForm.collaboration.communication" style="width: 100%">
                <el-option label="同步通信" value="synchronous" />
                <el-option label="异步通信" value="asynchronous" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 任务上下文 -->
      <el-card class="form-section">
        <template #header>
          <div class="section-header">
            <h3>任务上下文</h3>
          </div>
        </template>

        <el-form-item label="背景说明">
          <el-input
            v-model="taskForm.context.background"
            type="textarea"
            :rows="3"
            placeholder="请描述任务产生的背景和相关情况"
          />
        </el-form-item>

        <el-form-item label="约束条件">
          <div class="constraints-list">
            <div
              v-for="(constraint, index) in taskForm.context.constraints"
              :key="index"
              class="constraint-item"
            >
              <el-input
                v-model="taskForm.context.constraints[index]"
                placeholder="请输入约束条件"
                style="width: calc(100% - 80px); margin-right: 12px"
              />
              <el-button
                type="danger"
                plain
                size="small"
                @click="removeConstraint(index)"
              >
                删除
              </el-button>
            </div>
            <el-button type="primary" plain size="small" @click="addConstraint">
              <el-icon><Plus /></el-icon>
              添加约束
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="目标要求">
          <div class="objectives-list">
            <div
              v-for="(objective, index) in taskForm.context.objectives"
              :key="index"
              class="objective-item"
            >
              <el-input
                v-model="taskForm.context.objectives[index]"
                placeholder="请输入目标要求"
                style="width: calc(100% - 80px); margin-right: 12px"
              />
              <el-button
                type="danger"
                plain
                size="small"
                @click="removeObjective(index)"
              >
                删除
              </el-button>
            </div>
            <el-button type="primary" plain size="small" @click="addObjective">
              <el-icon><Plus /></el-icon>
              添加目标
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="相关方">
          <el-select
            v-model="taskForm.context.stakeholders"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请输入或选择相关方"
            style="width: 100%"
          >
            <el-option label="厨师团队" value="厨师团队" />
            <el-option label="服务团队" value="服务团队" />
            <el-option label="管理层" value="管理层" />
            <el-option label="客户" value="客户" />
            <el-option label="供应商" value="供应商" />
          </el-select>
        </el-form-item>
      </el-card>

      <!-- 子任务分解 -->
      <el-card class="form-section">
        <template #header>
          <div class="section-header">
            <h3>子任务分解</h3>
            <el-button type="primary" plain size="small" @click="addSubtask">
              <el-icon><Plus /></el-icon>
              添加子任务
            </el-button>
          </div>
        </template>

        <div class="subtasks-list">
          <div
            v-for="(subtask, index) in taskForm.subtasks"
            :key="index"
            class="subtask-item"
          >
            <el-card class="subtask-card">
              <div class="subtask-header">
                <h4>子任务 {{ index + 1 }}</h4>
                <el-button
                  type="danger"
                  plain
                  size="small"
                  @click="removeSubtask(index)"
                >
                  删除
                </el-button>
              </div>
              <el-row :gutter="16">
                <el-col :span="16">
                  <el-form-item :label="`子任务标题 ${index + 1}`">
                    <el-input
                      v-model="subtask.title"
                      placeholder="请输入子任务标题"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="`负责智能体 ${index + 1}`">
                    <el-select
                      v-model="subtask.assignedAgent"
                      placeholder="选择智能体"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="agent in availableAgents"
                        :key="agent.id"
                        :label="agent.name"
                        :value="agent.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-card>
          </div>
        </div>
      </el-card>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <el-button size="large" @click="handleCancel">取消</el-button>
        <el-button size="large" @click="saveAsDraft">保存草稿</el-button>
        <el-button
          type="primary"
          size="large"
          :loading="submitting"
          @click="handleSubmit"
        >
          创建任务
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { multiAgentAPI } from '@/api/multi-agent'
import type { TaskPriority } from '@/api/multi-agent'

// Props
interface Props {
  taskId?: string
}
const props = withDefaults(defineProps<Props>(), {})

// Emits
const emit = defineEmits<{
  success: []
  cancel: []
}>()

// 响应式数据
const taskFormRef = ref<InstanceType<typeof ElForm>>()
const submitting = ref(false)
const availableAgents = ref<any[]>([])

const taskForm = reactive({
  title: '',
  description: '',
  type: '',
  priority: TaskPriority.MEDIUM,
  estimatedDuration: 60,
  deadline: '',
  requiredSkills: [] as Array<{ name: string; level: string }>,
  assignedAgents: [] as string[],
  assignmentMode: 'manual',
  autoCriteria: ['skills', 'workload'],
  collaboration: {
    mode: 'parallel',
    coordination: 'decentralized',
    communication: 'asynchronous'
  },
  context: {
    background: '',
    constraints: [] as string[],
    objectives: [] as string[],
    stakeholders: [] as string[]
  },
  subtasks: [] as Array<{
    id: string
    title: string
    assignedAgent?: string
    status: string
    progress: number
  }>
})

// 表单验证规则
const taskRules = {
  title: [
    { required: true, message: '请输入任务标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入任务描述', trigger: 'blur' },
    { min: 10, max: 1000, message: '描述长度在 10 到 1000 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择任务类型', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  estimatedDuration: [
    { required: true, message: '请输入预计时长', trigger: 'blur' },
    { type: 'number', min: 1, max: 9999, message: '时长必须在 1 到 9999 分钟之间', trigger: 'blur' }
  ]
}

// 生命周期
onMounted(() => {
  loadAvailableAgents()
})

// 方法
const loadAvailableAgents = async () => {
  try {
    const response = await multiAgentAPI.getAgents({ status: 'active' })
    if (response.success && response.data) {
      availableAgents.value = response.data.agents
    }
  } catch (error) {
    console.error('Load agents failed:', error)
    ElMessage.error('加载智能体列表失败')
  }
}

const addRequiredSkill = () => {
  taskForm.requiredSkills.push({ name: '', level: 'basic' })
}

const removeRequiredSkill = (index: number) => {
  taskForm.requiredSkills.splice(index, 1)
}

const addConstraint = () => {
  taskForm.context.constraints.push('')
}

const removeConstraint = (index: number) => {
  taskForm.context.constraints.splice(index, 1)
}

const addObjective = () => {
  taskForm.context.objectives.push('')
}

const removeObjective = (index: number) => {
  taskForm.context.objectives.splice(index, 1)
}

const addSubtask = () => {
  const newSubtask = {
    id: `subtask_${Date.now()}`,
    title: '',
    assignedAgent: '',
    status: 'pending',
    progress: 0
  }
  taskForm.subtasks.push(newSubtask)
}

const removeSubtask = (index: number) => {
  taskForm.subtasks.splice(index, 1)
}

const validateForm = (): boolean => {
  if (!taskFormRef.value) return false

  return taskFormRef.value.validate().catch(() => false)
}

const handleSubmit = async () => {
  const isValid = await validateForm()
  if (!isValid) return

  try {
    submitting.value = true

    // 构建任务数据
    const taskData = {
      title: taskForm.title,
      description: taskForm.description,
      type: taskForm.type,
      priority: taskForm.priority,
      estimatedDuration: taskForm.estimatedDuration,
      deadline: taskForm.deadline || undefined,
      requiredSkills: taskForm.requiredSkills.filter(skill => skill.name),
      assignedAgents: taskForm.assignmentMode === 'manual' ? taskForm.assignedAgents : [],
      context: {
        situation: taskForm.context.background,
        background: taskForm.context.background,
        constraints: taskForm.context.constraints.filter(c => c.trim()),
        objectives: taskForm.context.objectives.filter(o => o.trim()),
        stakeholders: taskForm.context.stakeholders
      },
      collaboration: taskForm.collaboration,
      subtasks: taskForm.subtasks.map((subtask, index) => ({
        ...subtask,
        id: subtask.id || `subtask_${index + 1}`,
        status: 'pending',
        progress: 0
      }))
    }

    const response = await multiAgentAPI.createTask(taskData)
    if (response.success) {
      ElMessage.success('协作任务创建成功')
      emit('success')
    } else {
      ElMessage.error(response.message || '创建任务失败')
    }
  } catch (error) {
    console.error('Create task failed:', error)
    ElMessage.error('创建任务失败')
  } finally {
    submitting.value = false
  }
}

const saveAsDraft = () => {
  // 保存草稿逻辑
  ElMessage.info('草稿保存功能开发中')
}

const handleCancel = () => {
  emit('cancel')
}

// 辅助方法
const getAgentStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'active': 'success',
    'idle': 'info',
    'busy': 'warning',
    'offline': 'danger'
  }
  return typeMap[status] || 'info'
}
</script>

<style lang="scss" scoped>
.create-task {
  .form-section {
    margin-bottom: 24px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }
  }

  .skills-list {
    .skill-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
    }
  }

  .agent-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .agent-info {
      .agent-name {
        font-weight: 600;
        color: #303133;
        margin-right: 8px;
      }
    }

    .agent-status {
      display: flex;
      align-items: center;
      gap: 8px;

      .agent-load {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .auto-assignment {
    margin-top: 16px;

    .assignment-criteria {
      margin-top: 16px;

      .el-checkbox-group {
        display: flex;
        gap: 16px;
      }
    }
  }

  .constraints-list,
  .objectives-list {
    .constraint-item,
    .objective-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
    }
  }

  .subtasks-list {
    .subtask-item {
      margin-bottom: 16px;

      .subtask-card {
        border: 1px solid #e4e7ed;
        border-radius: 8px;

        .subtask-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          h4 {
            margin: 0;
            font-size: 14px;
            font-weight: 600;
            color: #303133;
          }
        }
      }
    }
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 24px;
    border-top: 1px solid #e4e7ed;
    margin-top: 24px;
  }
}

@media (max-width: 768px) {
  .create-task {
    .skills-list,
    .constraints-list,
    .objectives-list {
      .skill-item,
      .constraint-item,
      .objective-item {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }
    }

    .assignment-criteria {
      .el-checkbox-group {
        flex-direction: column;
        gap: 8px;
      }
    }

    .form-actions {
      flex-direction: column;
    }
  }
}
</style>