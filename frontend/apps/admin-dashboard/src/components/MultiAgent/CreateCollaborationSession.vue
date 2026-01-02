<template>
  <div class="create-session">
    <el-form
      ref="sessionFormRef"
      :model="sessionForm"
      :rules="sessionRules"
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
            <el-form-item label="会话标题" prop="title">
              <el-input
                v-model="sessionForm.title"
                placeholder="请输入会话标题"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="会话类型" prop="type">
              <el-select
                v-model="sessionForm.type"
                placeholder="请选择会话类型"
                style="width: 100%"
              >
                <el-option label="任务协调" value="task_coordination" />
                <el-option label="问题解决" value="problem_solving" />
                <el-option label="信息共享" value="information_sharing" />
                <el-option label="决策制定" value="decision_making" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="会话描述">
          <el-input
            v-model="sessionForm.description"
            type="textarea"
            :rows="3"
            placeholder="请描述会话的主要内容和目的"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-card>

      <!-- 参与者设置 -->
      <el-card class="form-section">
        <template #header>
          <div class="section-header">
            <h3>参与者设置</h3>
          </div>
        </template>

        <el-form-item label="发起者" prop="initiator">
          <el-select
            v-model="sessionForm.initiator"
            placeholder="选择会话发起者"
            style="width: 100%"
          >
            <el-option
              v-for="agent in availableAgents"
              :key="agent.id"
              :label="`${agent.name} (${agent.type})`"
              :value="agent.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="参与者" prop="participants">
          <el-transfer
            v-model="sessionForm.participants"
            :data="agentTransferData"
            :titles="['可选智能体', '已选参与者']"
            :button-texts="['移除', '添加']"
            :format="{
              noChecked: '${total}',
              hasChecked: '${checked}/${total}'
            }"
            style="text-align: left; display: inline-block"
          />
        </el-form-item>

        <el-form-item label="参与者类型">
          <el-checkbox-group v-model="sessionForm.requiredParticipants">
            <el-checkbox label="human_expert">人类专家</el-checkbox>
            <el-checkbox label="ai_agent">AI智能体</el-checkbox>
            <el-checkbox label="collective">集体智慧</el-checkbox>
            <el-checkbox label="automated">自动决策</el-checkbox>
            <el-checkbox label="hybrid">人机协同</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-card>

      <!-- 会话上下文 -->
      <el-card class="form-section">
        <template #header>
          <div class="section-header">
            <h3>会话上下文</h3>
          </div>
        </template>

        <el-form-item label="主要目标" prop="objective">
          <el-input
            v-model="sessionForm.context.objective"
            type="textarea"
            :rows="3"
            placeholder="请描述会话要达成的具体目标"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="范围界定" prop="scope">
          <el-input
            v-model="sessionForm.context.scope"
            placeholder="请描述会话讨论的范围和边界"
            maxlength="300"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="约束条件">
          <div class="constraints-list">
            <div
              v-for="(constraint, index) in sessionForm.context.constraints"
              :key="index"
              class="constraint-item"
            >
              <el-input
                v-model="sessionForm.context.constraints[index]"
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
      </el-card>

      <!-- 协作配置 -->
      <el-card class="form-section">
        <template #header>
          <div class="section-header">
            <h3>协作配置</h3>
          </div>
        </template>

        <el-form-item label="协作模式" prop="collaborationMode">
          <el-radio-group v-model="sessionForm.collaborationMode">
            <el-radio label="sequential">
              <div class="radio-option">
                <div class="option-title">顺序模式</div>
                <div class="option-desc">参与者按顺序发言和决策</div>
              </div>
            </el-radio>
            <el-radio label="parallel">
              <div class="radio-option">
                <div class="option-title">并行模式</div>
                <div class="option-desc">参与者同时进行讨论和决策</div>
              </div>
            </el-radio>
            <el-radio label="consensus">
              <div class="radio-option">
                <div class="option-title">共识模式</div>
                <div class="option-desc">需要达成一致共识</div>
              </div>
            </el-radio>
            <el-radio label="majority">
              <div class="radio-option">
                <div class="option-title">多数模式</div>
                <div class="option-desc">按多数意见决策</div>
              </div>
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最大时长">
              <el-input-number
                v-model="sessionForm.maxDuration"
                :min="5"
                :max="1440"
                placeholder="分钟"
                style="width: 100%"
              />
              <div class="form-tip">建议时长：15-60分钟</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最少参与者">
              <el-input-number
                v-model="sessionForm.minParticipants"
                :min="2"
                :max="20"
                style="width: 100%"
              />
              <div class="form-tip">确保有足够参与者进行有效讨论</div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="会话规则">
          <el-checkbox-group v-model="sessionForm.rules">
            <el-checkbox label="moderated">需要主持人</el-checkbox>
            <el-checkbox label="time_limited">严格时间控制</el-checkbox>
            <el-checkbox label="recorded">记录发言</el-checkbox>
            <el-checkbox label="anonymous">匿名发言</el-checkbox>
            <el-checkbox label="structured">结构化讨论</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-card>

      <!-- 高级设置 -->
      <el-card class="form-section">
        <template #header>
          <div class="section-header">
            <h3>高级设置</h3>
            <el-button
              type="text"
              @click="showAdvancedSettings = !showAdvancedSettings"
            >
              {{ showAdvancedSettings ? '收起' : '展开' }}
              <el-icon>
                <ArrowUp v-if="showAdvancedSettings" />
                <ArrowDown v-else />
              </el-icon>
            </el-button>
          </div>
        </template>

        <div v-show="showAdvancedSettings">
          <el-form-item label="决策阈值">
            <el-slider
              v-model="sessionForm.decisionThreshold"
              :min="50"
              :max="100"
              :step="5"
              show-input
              show-stops
            />
            <div class="form-tip">达成决策需要的最低支持率</div>
          </el-form-item>

          <el-form-item label="发言时长限制">
            <el-input-number
              v-model="sessionForm.speakTimeLimit"
              :min="30"
              :max="600"
              placeholder="秒"
              style="width: 200px; margin-right: 12px"
            />
            <span>秒</span>
          </el-form-item>

          <el-form-item label="投票权重">
            <el-radio-group v-model="sessionForm.votingWeight">
              <el-radio label="equal">等权重</el-radio>
              <el-radio label="expert">专家优先</el-radio>
              <el-radio label="role_based">角色权重</el-radio>
              <el-radio label="dynamic">动态权重</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="质量评估">
            <el-checkbox-group v-model="sessionForm.qualityMetrics">
              <el-checkbox label="participation">参与度</el-checkbox>
              <el-checkbox label="diversity">意见多样性</el-checkbox>
              <el-checkbox label="efficiency">决策效率</el-checkbox>
              <el-checkbox label="satisfaction">参与者满意度</el-checkbox>
              <el-checkbox label="outcome_quality">决策质量</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </div>
      </el-card>

      <!-- 预览 -->
      <el-card v-if="showPreview" class="form-section preview-section">
        <template #header>
          <div class="section-header">
            <h3>会话预览</h3>
          </div>
        </template>

        <div class="preview-content">
          <div class="preview-item">
            <strong>会话标题:</strong> {{ sessionForm.title }}
          </div>
          <div class="preview-item">
            <strong>会话类型:</strong> {{ getSessionTypeText(sessionForm.type) }}
          </div>
          <div class="preview-item">
            <strong>参与者:</strong> {{ sessionForm.participants.length }} 人
          </div>
          <div class="preview-item">
            <strong>协作模式:</strong> {{ getCollaborationModeText(sessionForm.collaborationMode) }}
          </div>
          <div class="preview-item">
            <strong>预计时长:</strong> {{ sessionForm.maxDuration }} 分钟
          </div>
        </div>
      </el-card>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <el-button size="large" @click="handleCancel">取消</el-button>
        <el-button size="large" @click="showPreview = !showPreview">
          {{ showPreview ? '隐藏预览' : '预览' }}
        </el-button>
        <el-button
          type="primary"
          size="large"
          :loading="submitting"
          @click="handleSubmit"
        >
          创建会话
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import { Plus, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { multiAgentAPI } from '@/api/multi-agent'

// Emits
const emit = defineEmits<{
  success: []
  cancel: []
}>()

// 响应式数据
const sessionFormRef = ref<InstanceType<typeof ElForm>>()
const submitting = ref(false)
const showAdvancedSettings = ref(false)
const showPreview = ref(false)
const availableAgents = ref<any[]>([])

const sessionForm = reactive({
  title: '',
  description: '',
  type: '',
  initiator: '',
  participants: [] as string[],
  requiredParticipants: [] as string[],
  collaborationMode: 'consensus',
  maxDuration: 30,
  minParticipants: 3,
  context: {
    objective: '',
    scope: '',
    constraints: [] as string[]
  },
  rules: [] as string[],
  decisionThreshold: 75,
  speakTimeLimit: 120,
  votingWeight: 'equal',
  qualityMetrics: [] as string[]
})

// 计算属性
const agentTransferData = computed(() => {
  return availableAgents.value.map(agent => ({
    key: agent.id,
    label: `${agent.name} (${agent.type})`,
    disabled: agent.status !== 'active'
  }))
})

// 表单验证规则
const sessionRules = {
  title: [
    { required: true, message: '请输入会话标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择会话类型', trigger: 'change' }
  ],
  initiator: [
    { required: true, message: '请选择会话发起者', trigger: 'change' }
  ],
  participants: [
    { required: true, message: '请选择参与者', trigger: 'change' },
    { type: 'array', min: 2, message: '至少需要2个参与者', trigger: 'change' }
  ],
  collaborationMode: [
    { required: true, message: '请选择协作模式', trigger: 'change' }
  ],
  'context.objective': [
    { required: true, message: '请输入主要目标', trigger: 'blur' },
    { min: 10, max: 500, message: '目标长度在 10 到 500 个字符', trigger: 'blur' }
  ]
}

// 生命周期
onMounted(() => {
  loadAvailableAgents()
})

// 方法
const loadAvailableAgents = async () => {
  try {
    const response = await multiAgentAPI.getAgents()
    if (response.success && response.data) {
      availableAgents.value = response.data.agents
    }
  } catch (error) {
    console.error('Load agents failed:', error)
    ElMessage.error('加载智能体列表失败')
  }
}

const addConstraint = () => {
  sessionForm.context.constraints.push('')
}

const removeConstraint = (index: number) => {
  sessionForm.context.constraints.splice(index, 1)
}

const validateForm = (): boolean => {
  if (!sessionFormRef.value) return false

  return sessionFormRef.value.validate().catch(() => false)
}

const handleSubmit = async () => {
  const isValid = await validateForm()
  if (!isValid) return

  try {
    submitting.value = true

    // 构建会话数据
    const sessionData = {
      title: sessionForm.title,
      description: sessionForm.description,
      type: sessionForm.type,
      participants: [...sessionForm.participants, sessionForm.initiator],
      initiator: sessionForm.initiator,
      context: {
        objective: sessionForm.context.objective,
        scope: sessionForm.context.scope,
        constraints: sessionForm.context.constraints.filter(c => c.trim())
      },
      collaborationMode: sessionForm.collaborationMode,
      requiredParticipants: sessionForm.requiredParticipants
    }

    const response = await multiAgentAPI.createSession(sessionData)
    if (response.success) {
      ElMessage.success('协作会话创建成功')
      emit('success')
    } else {
      ElMessage.error(response.message || '创建会话失败')
    }
  } catch (error) {
    console.error('Create session failed:', error)
    ElMessage.error('创建会话失败')
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}

// 辅助方法
const getSessionTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    'task_coordination': '任务协调',
    'problem_solving': '问题解决',
    'information_sharing': '信息共享',
    'decision_making': '决策制定'
  }
  return typeMap[type] || type
}

const getCollaborationModeText = (mode: string) => {
  const modeMap: Record<string, string> = {
    'sequential': '顺序模式',
    'parallel': '并行模式',
    'consensus': '共识模式',
    'majority': '多数模式'
  }
  return modeMap[mode] || mode
}
</script>

<style lang="scss" scoped>
.create-session {
  .form-section {
    margin-bottom: 24px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    &.preview-section {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border: 1px solid #dee2e6;

      .preview-content {
        .preview-item {
          margin-bottom: 12px;
          font-size: 14px;

          strong {
            color: #495057;
            margin-right: 8px;
          }
        }
      }
    }

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

  .radio-option {
    margin-left: 8px;

    .option-title {
      font-weight: 600;
      color: #303133;
      margin-bottom: 4px;
    }

    .option-desc {
      font-size: 12px;
      color: #909399;
    }
  }

  .constraints-list {
    .constraint-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
    }
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 24px;
    border-top: 1px solid #e4e7ed;
    margin-top: 24px;
  }

  :deep(.el-transfer) {
    .el-transfer-panel {
      width: 300px;
    }
  }
}

@media (max-width: 768px) {
  .create-session {
    .constraints-list {
      .constraint-item {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }
    }

    .form-actions {
      flex-direction: column;
    }

    :deep(.el-transfer) {
      .el-transfer-panel {
        width: 100%;
        margin-bottom: 12px;
      }

      .el-transfer__buttons {
        justify-content: center;
        margin: 12px 0;
      }
    }
  }
}
</style>