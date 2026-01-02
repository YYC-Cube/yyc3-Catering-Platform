<template>
  <div class="create-decision-request">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      @submit.prevent="handleSubmit"
    >
      <!-- 基本信息 -->
      <div class="form-section">
        <h4>基本信息</h4>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="决策标题" prop="title">
              <el-input
                v-model="form.title"
                placeholder="请输入决策标题"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="决策类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择决策类型">
                <el-option label="战略决策" value="strategic" />
                <el-option label="战术决策" value="tactical" />
                <el-option label="操作决策" value="operational" />
                <el-option label="应急决策" value="emergency" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="决策层级" prop="level">
              <el-select v-model="form.level" placeholder="请选择决策层级">
                <el-option label="高层决策" value="executive" />
                <el-option label="管理决策" value="management" />
                <el-option label="主管决策" value="supervisor" />
                <el-option label="员工决策" value="staff" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="form.priority" placeholder="请选择优先级">
                <el-option label="低" value="low" />
                <el-option label="中" value="medium" />
                <el-option label="高" value="high" />
                <el-option label="紧急" value="urgent" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="决策描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述需要决策的问题或情况"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="截止时间" prop="deadline">
          <el-date-picker
            v-model="form.deadline"
            type="datetime"
            placeholder="请选择决策截止时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
      </div>

      <!-- 决策背景 -->
      <div class="form-section">
        <h4>决策背景</h4>
        <el-form-item label="当前情况" prop="context.situation">
          <el-input
            v-model="form.context.situation"
            type="textarea"
            :rows="3"
            placeholder="请描述当前面临的具体情况"
          />
        </el-form-item>

        <el-form-item label="背景信息" prop="context.background">
          <el-input
            v-model="form.context.background"
            type="textarea"
            :rows="3"
            placeholder="请提供相关的背景信息和上下文"
          />
        </el-form-item>

        <el-form-item label="约束条件">
          <el-tag
            v-for="(constraint, index) in form.context.constraints"
            :key="index"
            closable
            @close="removeConstraint(index)"
            class="constraint-tag"
          >
            {{ constraint }}
          </el-tag>
          <el-input
            v-if="showConstraintInput"
            v-model="newConstraint"
            size="small"
            class="constraint-input"
            @keyup.enter="addConstraint"
            @blur="addConstraint"
          />
          <el-button
            v-else
            size="small"
            type="primary"
            link
            @click="showConstraintInput = true"
          >
            + 添加约束
          </el-button>
        </el-form-item>

        <el-form-item label="决策目标">
          <el-tag
            v-for="(objective, index) in form.context.objectives"
            :key="index"
            closable
            @close="removeObjective(index)"
            class="objective-tag"
          >
            {{ objective }}
          </el-tag>
          <el-input
            v-if="showObjectiveInput"
            v-model="newObjective"
            size="small"
            class="objective-input"
            @keyup.enter="addObjective"
            @blur="addObjective"
          />
          <el-button
            v-else
            size="small"
            type="primary"
            link
            @click="showObjectiveInput = true"
          >
            + 添加目标
          </el-button>
        </el-form-item>

        <el-form-item label="利益相关者">
          <el-tag
            v-for="(stakeholder, index) in form.context.stakeholders"
            :key="index"
            closable
            @close="removeStakeholder(index)"
            class="stakeholder-tag"
          >
            {{ stakeholder }}
          </el-tag>
          <el-input
            v-if="showStakeholderInput"
            v-model="newStakeholder"
            size="small"
            class="stakeholder-input"
            @keyup.enter="addStakeholder"
            @blur="addStakeholder"
          />
          <el-button
            v-else
            size="small"
            type="primary"
            link
            @click="showStakeholderInput = true"
          >
            + 添加相关方
          </el-button>
        </el-form-item>
      </div>

      <!-- 决策因素 -->
      <div class="form-section">
        <h4>决策因素</h4>
        <div class="factors-container">
          <div
            v-for="(factor, index) in form.factors"
            :key="index"
            class="factor-item"
          >
            <el-card class="factor-card">
              <div class="factor-header">
                <el-input
                  v-model="factor.name"
                  placeholder="因素名称"
                  class="factor-name"
                />
                <el-button
                  type="danger"
                  size="small"
                  link
                  @click="removeFactor(index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>

              <el-row :gutter="10">
                <el-col :span="6">
                  <el-select v-model="factor.type" placeholder="类型">
                    <el-option label="定量" value="quantitative" />
                    <el-option label="定性" value="qualitative" />
                  </el-select>
                </el-col>
                <el-col :span="4">
                  <el-input-number
                    v-model="factor.weight"
                    :min="0"
                    :max="100"
                    :step="5"
                    placeholder="权重"
                  />
                </el-col>
                <el-col :span="6">
                  <el-select v-model="factor.category" placeholder="类别">
                    <el-option label="财务" value="financial" />
                    <el-option label="运营" value="operational" />
                    <el-option label="客户" value="customer" />
                    <el-option label="市场" value="market" />
                    <el-option label="风险" value="risk" />
                  </el-select>
                </el-col>
                <el-col :span="4">
                  <el-select v-model="factor.impact" placeholder="影响">
                    <el-option label="正面" value="positive" />
                    <el-option label="负面" value="negative" />
                    <el-option label="中性" value="neutral" />
                  </el-select>
                </el-col>
              </el-row>

              <el-form-item label="数值">
                <el-input
                  v-if="factor.type === 'quantitative'"
                  v-model="factor.value"
                  placeholder="请输入数值"
                  type="number"
                />
                <el-input
                  v-else
                  v-model="factor.value"
                  placeholder="请输入描述"
                />
              </el-form-item>
            </el-card>
          </div>

          <el-button
            type="primary"
            link
            @click="addFactor"
            class="add-factor-btn"
          >
            <el-icon><Plus /></el-icon>
            添加因素
          </el-button>
        </div>
      </div>

      <!-- 协同模式 -->
      <div class="form-section">
        <h4>协同配置</h4>
        <el-form-item label="参与者类型" prop="requiredParticipants">
          <el-checkbox-group v-model="form.requiredParticipants">
            <el-checkbox label="human_expert">人类专家</el-checkbox>
            <el-checkbox label="ai_agent">AI智能体</el-checkbox>
            <el-checkbox label="collective">集体智慧</el-checkbox>
            <el-checkbox label="automated">自动决策</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="协作模式" prop="collaborationMode">
          <el-radio-group v-model="form.collaborationMode">
            <el-radio label="sequential">顺序协作</el-radio>
            <el-radio label="parallel">并行协作</el-radio>
            <el-radio label="consensus">共识决策</el-radio>
            <el-radio label="majority">多数决策</el-radio>
          </el-radio-group>
        </el-form-item>
      </div>

      <!-- 决策选项 -->
      <div class="form-section">
        <h4>决策选项</h4>
        <div class="options-container">
          <div
            v-for="(option, index) in form.options"
            :key="index"
            class="option-item"
          >
            <el-card class="option-card">
              <div class="option-header">
                <el-input
                  v-model="option.title"
                  placeholder="选项标题"
                  class="option-title"
                />
                <el-button
                  type="danger"
                  size="small"
                  link
                  @click="removeOption(index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>

              <el-form-item label="描述">
                <el-input
                  v-model="option.description"
                  type="textarea"
                  :rows="2"
                  placeholder="请描述这个选项的主要内容"
                />
              </el-form-item>

              <el-form-item label="优点">
                <el-tag
                  v-for="(pro, proIndex) in option.pros"
                  :key="proIndex"
                  closable
                  @close="removePros(index, proIndex)"
                  class="pro-tag"
                >
                  {{ pro }}
                </el-tag>
                <el-input
                  v-if="option.showProInput"
                  v-model="option.newPro"
                  size="small"
                  class="pro-input"
                  @keyup.enter="addPros(index)"
                  @blur="addPros(index)"
                />
                <el-button
                  v-else
                  size="small"
                  type="primary"
                  link
                  @click="option.showProInput = true"
                >
                  + 添加优点
                </el-button>
              </el-form-item>

              <el-form-item label="缺点">
                <el-tag
                  v-for="(con, conIndex) in option.cons"
                  :key="conIndex"
                  closable
                  @close="removeCons(index, conIndex)"
                  class="con-tag"
                >
                  {{ con }}
                </el-tag>
                <el-input
                  v-if="option.showConInput"
                  v-model="option.newCon"
                  size="small"
                  class="con-input"
                  @keyup.enter="addCons(index)"
                  @blur="addCons(index)"
                />
                <el-button
                  v-else
                  size="small"
                  type="danger"
                  link
                  @click="option.showConInput = true"
                >
                  + 添加缺点
                </el-button>
              </el-form-item>

              <el-form-item label="资源需求">
                <el-row :gutter="10">
                  <el-col :span="8">
                    <el-input-number
                      v-model="option.resources.time"
                      :min="0"
                      placeholder="时间(小时)"
                    />
                  </el-col>
                  <el-col :span="8">
                    <el-input-number
                      v-model="option.resources.cost"
                      :min="0"
                      placeholder="成本(元)"
                    />
                  </el-col>
                  <el-col :span="8">
                    <el-input
                      v-model="option.resources.personnel"
                      placeholder="人员"
                    />
                  </el-col>
                </el-row>
              </el-form-item>
            </el-card>
          </div>

          <el-button
            type="primary"
            link
            @click="addOption"
            class="add-option-btn"
          >
            <el-icon><Plus /></el-icon>
            添加选项
          </el-button>
        </div>
      </div>

      <!-- 表单操作 -->
      <div class="form-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          创建决策请求
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { decisionEngineAPI } from '@/api/decision-engine'
import type {
  DecisionRequest, DecisionType, DecisionLevel, DecisionPriority,
  ParticipantType
} from '@/api/decision-engine'

// Emits
const emit = defineEmits<{
  success: []
  cancel: []
}>()

// 响应式数据
const formRef = ref<FormInstance>()
const submitting = ref(false)

// 表单数据
const form = reactive({
  title: '',
  description: '',
  type: '' as DecisionType,
  level: '' as DecisionLevel,
  priority: '' as DecisionPriority,
  deadline: '',
  context: {
    situation: '',
    background: '',
    constraints: [] as string[],
    objectives: [] as string[],
    stakeholders: [] as string[]
  },
  factors: [] as any[],
  options: [] as any[],
  requiredParticipants: [] as ParticipantType[],
  collaborationMode: 'parallel'
})

// 输入状态
const showConstraintInput = ref(false)
const showObjectiveInput = ref(false)
const showStakeholderInput = ref(false)
const newConstraint = ref('')
const newObjective = ref('')
const newStakeholder = ref('')

// 表单验证规则
const rules: FormRules = {
  title: [
    { required: true, message: '请输入决策标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度在5到100个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入决策描述', trigger: 'blur' },
    { min: 10, max: 500, message: '描述长度在10到500个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择决策类型', trigger: 'change' }
  ],
  level: [
    { required: true, message: '请选择决策层级', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  context: {
    situation: [
      { required: true, message: '请描述当前情况', trigger: 'blur' }
    ],
    background: [
      { required: true, message: '请提供背景信息', trigger: 'blur' }
    ]
  },
  requiredParticipants: [
    { type: 'array', required: true, message: '请选择至少一个参与者类型', trigger: 'change' }
  ],
  collaborationMode: [
    { required: true, message: '请选择协作模式', trigger: 'change' }
  ]
}

// 方法
const addConstraint = () => {
  if (newConstraint.value.trim()) {
    form.context.constraints.push(newConstraint.value.trim())
    newConstraint.value = ''
    showConstraintInput.value = false
  }
}

const removeConstraint = (index: number) => {
  form.context.constraints.splice(index, 1)
}

const addObjective = () => {
  if (newObjective.value.trim()) {
    form.context.objectives.push(newObjective.value.trim())
    newObjective.value = ''
    showObjectiveInput.value = false
  }
}

const removeObjective = (index: number) => {
  form.context.objectives.splice(index, 1)
}

const addStakeholder = () => {
  if (newStakeholder.value.trim()) {
    form.context.stakeholders.push(newStakeholder.value.trim())
    newStakeholder.value = ''
    showStakeholderInput.value = false
  }
}

const removeStakeholder = (index: number) => {
  form.context.stakeholders.splice(index, 1)
}

const addFactor = () => {
  form.factors.push({
    name: '',
    type: 'quantitative',
    value: '',
    weight: 50,
    source: 'expert',
    confidence: 0.8,
    impact: 'neutral',
    category: 'financial'
  })
}

const removeFactor = (index: number) => {
  form.factors.splice(index, 1)
}

const addOption = () => {
  form.options.push({
    title: '',
    description: '',
    pros: [],
    cons: [],
    estimatedOutcomes: [],
    risks: [],
    resources: {
      time: 0,
      cost: 0,
      personnel: '',
      equipment: []
    },
    feasibility: {
      technical: 0.8,
      financial: 0.8,
      operational: 0.8
    },
    showProInput: false,
    newPro: '',
    showConInput: false,
    newCon: ''
  })
}

const removeOption = (index: number) => {
  form.options.splice(index, 1)
}

const addPros = (optionIndex: number) => {
  const option = form.options[optionIndex]
  if (option.newPro.trim()) {
    option.pros.push(option.newPro.trim())
    option.newPro = ''
    option.showProInput = false
  }
}

const removePros = (optionIndex: number, proIndex: number) => {
  form.options[optionIndex].pros.splice(proIndex, 1)
}

const addCons = (optionIndex: number) => {
  const option = form.options[optionIndex]
  if (option.newCon.trim()) {
    option.cons.push(option.newCon.trim())
    option.newCon = ''
    option.showConInput = false
  }
}

const removeCons = (optionIndex: number, conIndex: number) => {
  form.options[optionIndex].cons.splice(conIndex, 1)
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    const requestData = {
      ...form,
      requestedBy: '当前用户' // 应该从用户信息中获取
    }

    const response = await decisionEngineAPI.createDecisionRequest(requestData)

    if (response.success) {
      ElMessage.success('决策请求创建成功')
      emit('success')
      resetForm()
    } else {
      ElMessage.error(response.message || '创建失败')
    }
  } catch (error: any) {
    if (error.message !== 'validation failed') {
      console.error('Create decision request failed:', error)
      ElMessage.error('创建决策请求失败')
    }
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }

  Object.assign(form, {
    title: '',
    description: '',
    type: '' as DecisionType,
    level: '' as DecisionLevel,
    priority: '' as DecisionPriority,
    deadline: '',
    context: {
      situation: '',
      background: '',
      constraints: [],
      objectives: [],
      stakeholders: []
    },
    factors: [],
    options: [],
    requiredParticipants: [],
    collaborationMode: 'parallel'
  })
}
</script>

<style lang="scss" scoped>
.create-decision-request {
  .form-section {
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid #e4e7ed;

    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    h4 {
      margin: 0 0 20px 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      display: flex;
      align-items: center;

      &::before {
        content: '';
        width: 4px;
        height: 16px;
        background: #409eff;
        border-radius: 2px;
        margin-right: 8px;
      }
    }
  }

  .constraint-tag,
  .objective-tag,
  .stakeholder-tag,
  .pro-tag,
  .con-tag {
    margin-right: 8px;
    margin-bottom: 8px;
  }

  .constraint-input,
  .objective-input,
  .stakeholder-input,
  .pro-input,
  .con-input {
    width: 200px;
    margin-right: 8px;
    margin-bottom: 8px;
  }

  .factors-container,
  .options-container {
    .factor-item,
    .option-item {
      margin-bottom: 20px;

      .factor-card,
      .option-card {
        .factor-header,
        .option-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          .factor-name,
          .option-title {
            flex: 1;
            margin-right: 12px;
          }
        }
      }
    }
  }

  .add-factor-btn,
  .add-option-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 12px 0;
    color: #409eff;
    font-size: 14px;
    cursor: pointer;

    &:hover {
      color: #66b1ff;
    }
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #e4e7ed;
  }
}

@media (max-width: 768px) {
  .create-decision-request {
    .constraint-input,
    .objective-input,
    .stakeholder-input,
    .pro-input,
    .con-input {
      width: 100%;
    }

    .form-actions {
      flex-direction: column;
      gap: 8px;
    }
  }
}
</style>