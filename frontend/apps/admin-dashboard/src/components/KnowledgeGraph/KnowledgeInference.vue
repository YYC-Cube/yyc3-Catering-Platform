<template>
  <div class="knowledge-inference">
    <!-- 推理引擎控制面板 -->
    <div class="inference-panel">
      <div class="panel-header">
        <h3>知识推理引擎</h3>
        <div class="panel-actions">
          <el-button @click="showInferenceDialog = true">
            <el-icon><Plus /></el-icon>
            创建推理任务
          </el-button>
          <el-button @click="batchInference" :disabled="!selectedNodes.length">
            <el-icon><Operation /></el-icon>
            批量推理
          </el-button>
          <el-button @click="showRuleEditor = true">
            <el-icon><Setting /></el-icon>
            推理规则
          </el-button>
        </div>
      </div>

      <!-- 推理引擎状态 -->
      <div class="engine-status">
        <el-row :gutter="16">
          <el-col :span="6">
            <div class="status-card active">
              <div class="status-indicator"></div>
              <div class="status-content">
                <h4>推理引擎</h4>
                <p>{{ engineStatus }}</p>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="status-card">
              <div class="status-indicator queue"></div>
              <div class="status-content">
                <h4>队列任务</h4>
                <p>{{ queueLength }}</p>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="status-card">
              <div class="status-indicator success"></div>
              <div class="status-content">
                <h4>成功率</h4>
                <p>{{ successRate }}%</p>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="status-card">
              <div class="status-indicator performance"></div>
              <div class="status-content">
                <h4>平均耗时</h4>
                <p>{{ avgDuration }}ms</p>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 推理算法选择 -->
      <div class="algorithm-selection">
        <h4>推理算法</h4>
        <el-radio-group v-model="selectedAlgorithm" @change="handleAlgorithmChange">
          <el-radio label="deductive">
            <div class="algorithm-option">
              <strong>演绎推理</strong>
              <span>从一般到特殊的逻辑推理</span>
            </div>
          </el-radio>
          <el-radio label="inductive">
            <div class="algorithm-option">
              <strong>归纳推理</strong>
              <span>从特殊到一般的模式发现</span>
            </div>
          </el-radio>
          <el-radio label="abductive">
            <div class="algorithm-option">
              <strong>溯因推理</strong>
              <span>最佳解释假设生成</span>
            </div>
          </el-radio>
          <el-radio label="analogical">
            <div class="algorithm-option">
              <strong>类比推理</strong>
              <span>基于相似性的知识迁移</span>
            </div>
          </el-radio>
          <el-radio label="causal">
            <div class="algorithm-option">
              <strong>因果推理</strong>
              <span>因果关系分析和推断</span>
            </div>
          </el-radio>
        </el-radio-group>
      </div>

      <!-- 推理参数配置 -->
      <div class="inference-params">
        <h4>推理参数</h4>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="最大深度">
              <el-input-number
                v-model="inferenceParams.maxDepth"
                :min="1"
                :max="10"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="置信度阈值">
              <el-slider
                v-model="inferenceParams.confidenceThreshold"
                :min="0"
                :max="1"
                :step="0.1"
                show-input
                :show-input-controls="false"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="并行度">
              <el-input-number
                v-model="inferenceParams.parallelism"
                :min="1"
                :max="16"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="超时时间(秒)">
              <el-input-number
                v-model="inferenceParams.timeout"
                :min="10"
                :max="300"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="启用缓存">
              <el-switch v-model="inferenceParams.enableCache" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="验证结果">
              <el-switch v-model="inferenceParams.validateResults" />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 推理任务列表 -->
    <div class="inference-tasks">
      <div class="tasks-header">
        <h3>推理任务</h3>
        <div class="tasks-filters">
          <el-select v-model="statusFilter" placeholder="状态筛选" clearable>
            <el-option label="全部" value="" />
            <el-option label="进行中" value="running" />
            <el-option label="已完成" value="completed" />
            <el-option label="失败" value="failed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
          <el-select v-model="algorithmFilter" placeholder="算法筛选" clearable>
            <el-option label="全部" value="" />
            <el-option label="演绎推理" value="deductive" />
            <el-option label="归纳推理" value="inductive" />
            <el-option label="溯因推理" value="abductive" />
            <el-option label="类比推理" value="analogical" />
            <el-option label="因果推理" value="causal" />
          </el-select>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            size="small"
          />
        </div>
      </div>

      <div class="tasks-list">
        <el-table
          :data="filteredTasks"
          v-loading="loadingTasks"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="任务ID" prop="id" width="120" />
          <el-table-column label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getAlgorithmTagType(row.type)" size="small">
                {{ getAlgorithmLabel(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="前提数量" width="100">
            <template #default="{ row }">
              {{ row.premises?.length || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="结论置信度" width="120">
            <template #default="{ row }">
              <el-progress
                :percentage="Math.round((row.conclusion?.confidence || 0) * 100)"
                :color="getConfidenceColor(row.conclusion?.confidence || 0)"
                :show-text="false"
                :stroke-width="6"
              />
              <span class="confidence-text">
                {{ Math.round((row.conclusion?.confidence || 0) * 100) }}%
              </span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)" size="small">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="执行时间" width="120">
            <template #default="{ row }">
              {{ (row.metadata?.executionTime || 0).toFixed(2) }}ms
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="150">
            <template #default="{ row }">
              {{ formatDateTime(row.metadata?.timestamp) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button
                @click="viewInferenceDetails(row)"
                size="small"
                text
                type="primary"
              >
                详情
              </el-button>
              <el-button
                v-if="row.status === 'completed'"
                @click="applyInferenceResult(row)"
                size="small"
                text
                type="success"
              >
                应用
              </el-button>
              <el-button
                v-if="['running', 'queued'].includes(row.status)"
                @click="cancelInference(row)"
                size="small"
                text
                type="danger"
              >
                取消
              </el-button>
              <el-button
                @click="deleteInference(row)"
                size="small"
                text
                type="danger"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="tasks-pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="totalTasks"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 推理结果可视化 -->
    <div v-if="selectedInference" class="inference-visualization">
      <div class="visualization-header">
        <h3>推理结果分析</h3>
        <div class="visualization-actions">
          <el-button @click="exportInferenceResult">
            <el-icon><Download /></el-icon>
            导出结果
          </el-button>
          <el-button @click="shareInferenceResult">
            <el-icon><Share /></el-icon>
            分享结果
          </el-button>
          <el-button @click="selectedInference = null" text>
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </div>

      <el-row :gutter="16">
        <el-col :span="12">
          <!-- 推理过程 -->
          <div class="inference-process">
            <h4>推理过程</h4>
            <div class="process-timeline">
              <div
                v-for="(premise, index) in selectedInference.premises"
                :key="index"
                class="timeline-item"
              >
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <div class="premise-statement">{{ premise.statement }}</div>
                  <div class="premise-confidence">
                    置信度: {{ Math.round(premise.confidence * 100) }}%
                  </div>
                  <div class="premise-source">来源: {{ premise.nodeId }}</div>
                </div>
              </div>
              <div class="timeline-item conclusion">
                <div class="timeline-dot success"></div>
                <div class="timeline-content">
                  <div class="conclusion-statement">
                    {{ selectedInference.conclusion.statement }}
                  </div>
                  <div class="conclusion-confidence">
                    置信度: {{ Math.round((selectedInference.conclusion.confidence || 0) * 100) }}%
                  </div>
                  <div class="conclusion-reasoning">
                    {{ selectedInference.reasoning }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-col>

        <el-col :span="12">
          <!-- 推理有效性分析 -->
          <div class="validity-analysis">
            <h4>有效性分析</h4>
            <div class="validity-metrics">
              <div class="metric-item">
                <span class="metric-label">合理性 (Soundness)</span>
                <div class="metric-value">
                  <el-progress
                    :percentage="Math.round((selectedInference.validity?.soundness || 0) * 100)"
                    :color="getValidityColor(selectedInference.validity?.soundness || 0)"
                  />
                </div>
              </div>
              <div class="metric-item">
                <span class="metric-label">完整性 (Completeness)</span>
                <div class="metric-value">
                  <el-progress
                    :percentage="Math.round((selectedInference.validity?.completeness || 0) * 100)"
                    :color="getValidityColor(selectedInference.validity?.completeness || 0)"
                  />
                </div>
              </div>
              <div class="metric-item">
                <span class="metric-label">一致性 (Consistency)</span>
                <div class="metric-value">
                  <el-progress
                    :percentage="Math.round((selectedInference.validity?.consistency || 0) * 100)"
                    :color="getValidityColor(selectedInference.validity?.consistency || 0)"
                  />
                </div>
              </div>
            </div>

            <!-- 支持证据 -->
            <div class="supporting-evidence">
              <h5>支持证据</h5>
              <div class="evidence-list">
                <div
                  v-for="nodeId in selectedInference.conclusion?.supportingNodes || []"
                  :key="nodeId"
                  class="evidence-item"
                >
                  <el-icon><Document /></el-icon>
                  <span>{{ getNodeLabel(nodeId) }}</span>
                </div>
                <div
                  v-for="relId in selectedInference.conclusion?.supportingRelationships || []"
                  :key="relId"
                  class="evidence-item"
                >
                  <el-icon><Connection /></el-icon>
                  <span>{{ getRelationshipLabel(relId) }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 创建推理任务对话框 -->
    <el-dialog
      v-model="showInferenceDialog"
      title="创建推理任务"
      width="700px"
    >
      <div class="inference-form">
        <el-form :model="inferenceForm" label-width="120px">
          <el-form-item label="推理类型">
            <el-select v-model="inferenceForm.type" placeholder="选择推理类型">
              <el-option label="演绎推理" value="deductive" />
              <el-option label="归纳推理" value="inductive" />
              <el-option label="溯因推理" value="abductive" />
              <el-option label="类比推理" value="analogical" />
              <el-option label="因果推理" value="causal" />
            </el-select>
          </el-form-item>

          <el-form-item label="知识图谱">
            <el-select v-model="inferenceForm.graphId" placeholder="选择知识图谱">
              <el-option
                v-for="graph in availableGraphs"
                :key="graph.id"
                :label="graph.name"
                :value="graph.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="前提条件">
            <div class="premises-editor">
              <div
                v-for="(premise, index) in inferenceForm.premises"
                :key="index"
                class="premise-item"
              >
                <el-row :gutter="12">
                  <el-col :span="12">
                    <el-input
                      v-model="premise.nodeId"
                      placeholder="节点ID"
                    />
                  </el-col>
                  <el-col :span="12">
                    <el-input
                      v-model="premise.statement"
                      placeholder="前提陈述"
                    />
                  </el-col>
                </el-row>
                <el-button
                  @click="removePremise(index)"
                  text
                  type="danger"
                  size="small"
                >
                  删除前提
                </el-button>
              </div>
              <el-button @click="addPremise" text type="primary">
                <el-icon><Plus /></el-icon>
                添加前提
              </el-button>
            </div>
          </el-form-item>

          <el-form-item label="推理深度">
            <el-input-number
              v-model="inferenceForm.maxDepth"
              :min="1"
              :max="10"
              controls-position="right"
            />
          </el-form-item>

          <el-form-item label="算法选项">
            <el-input v-model="inferenceForm.algorithm" placeholder="留空使用默认算法" />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="showInferenceDialog = false">取消</el-button>
        <el-button type="primary" @click="createInferenceTask" :loading="creatingTask">
          创建任务
        </el-button>
      </template>
    </el-dialog>

    <!-- 推理规则编辑器 -->
    <el-dialog
      v-model="showRuleEditor"
      title="推理规则管理"
      width="900px"
    >
      <div class="rule-editor">
        <div class="rule-toolbar">
          <el-button @click="addNewRule">
            <el-icon><Plus /></el-icon>
            新增规则
          </el-button>
          <el-button @click="importRules">
            <el-icon><Upload /></el-icon>
            导入规则
          </el-button>
          <el-button @click="exportRules">
            <el-icon><Download /></el-icon>
            导出规则
          </el-button>
        </div>

        <div class="rules-list">
          <div
            v-for="rule in inferenceRules"
            :key="rule.id"
            class="rule-item"
          >
            <div class="rule-header">
              <h4>{{ rule.name }}</h4>
              <div class="rule-actions">
                <el-button @click="editRule(rule)" size="small" text type="primary">
                  编辑
                </el-button>
                <el-button @click="toggleRuleStatus(rule)" size="small" text>
                  <el-tag :type="rule.enabled ? 'success' : 'info'" size="small">
                    {{ rule.enabled ? '启用' : '禁用' }}
                  </el-tag>
                </el-button>
                <el-button @click="deleteRule(rule)" size="small" text type="danger">
                  删除
                </el-button>
              </div>
            </div>
            <div class="rule-content">
              <div class="rule-description">{{ rule.description }}</div>
              <div class="rule-condition">
                <strong>条件:</strong> {{ rule.condition }}
              </div>
              <div class="rule-action">
                <strong>动作:</strong> {{ rule.action }}
              </div>
              <div class="rule-priority">
                <strong>优先级:</strong> {{ rule.priority }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { knowledgeGraphAPI, type KnowledgeInference } from '@/api/knowledge-graph'

// 响应式数据
const engineStatus = ref('运行中')
const queueLength = ref(3)
const successRate = ref(92)
const avgDuration = ref(1250)
const selectedAlgorithm = ref('deductive')
const statusFilter = ref('')
const algorithmFilter = ref('')
const dateRange = ref<[Date, Date] | null>(null)
const currentPage = ref(1)
const pageSize = ref(20)
const totalTasks = ref(0)
const selectedNodes = ref<string[]>([])
const selectedInference = ref<KnowledgeInference | null>(null)
const showInferenceDialog = ref(false)
const showRuleEditor = ref(false)
const creatingTask = ref(false)
const loadingTasks = ref(false)

// 推理参数
const inferenceParams = ref({
  maxDepth: 5,
  confidenceThreshold: 0.6,
  parallelism: 4,
  timeout: 60,
  enableCache: true,
  validateResults: true
})

// 推理任务列表
const inferenceTasks = ref<KnowledgeInference[]>([])

// 推理表单
const inferenceForm = ref({
  type: 'deductive',
  graphId: '',
  premises: [{ nodeId: '', statement: '' }],
  maxDepth: 5,
  algorithm: ''
})

// 推理规则
const inferenceRules = ref([
  {
    id: '1',
    name: '实体分类规则',
    description: '根据实体属性进行自动分类',
    condition: 'entity.type == "organization" && entity.employees > 100',
    action: 'entity.category = "大型企业"',
    priority: 1,
    enabled: true
  },
  {
    id: '2',
    name: '关系传递规则',
    description: '关系的传递性推理',
    condition: 'A.part_of B && B.part_of C',
    action: 'A.part_of C',
    priority: 2,
    enabled: true
  },
  {
    id: '3',
    name: '因果推理规则',
    description: '因果链推理',
    condition: 'A.causes B && B.causes C',
    action: 'A.causes C (confidence = min(conf(A,B), conf(B,C)))',
    priority: 3,
    enabled: true
  }
])

// 可用图谱
const availableGraphs = ref([
  { id: '1', name: '餐饮管理知识图谱' },
  { id: '2', name: '客户关系知识图谱' },
  { id: '3', name: '供应链知识图谱' },
  { id: '4', name: '财务分析知识图谱' }
])

// 计算属性
const filteredTasks = computed(() => {
  let filtered = inferenceTasks.value

  if (statusFilter.value) {
    filtered = filtered.filter(task => task.status === statusFilter.value)
  }

  if (algorithmFilter.value) {
    filtered = filtered.filter(task => task.type === algorithmFilter.value)
  }

  if (dateRange.value) {
    const [start, end] = dateRange.value
    filtered = filtered.filter(task => {
      const taskDate = new Date(task.metadata.timestamp)
      return taskDate >= start && taskDate <= end
    })
  }

  return filtered.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
})

// 方法
const loadInferenceTasks = async () => {
  loadingTasks.value = true

  try {
    // 模拟加载推理任务
    const mockTasks: KnowledgeInference[] = [
      {
        id: 'inf_001',
        type: 'deductive',
        premises: [
          {
            nodeId: 'node_1',
            statement: '餐厅是一个餐饮场所',
            confidence: 0.9
          },
          {
            nodeId: 'node_2',
            statement: '餐饮场所需要食品安全许可证',
            confidence: 0.95
          }
        ],
        conclusion: {
          statement: '餐厅需要食品安全许可证',
          confidence: 0.86,
          supportingNodes: ['node_1', 'node_2'],
          supportingRelationships: ['rel_1']
        },
        reasoning: '基于餐饮场所和食品安全许可证的关系进行演绎推理',
        validity: {
          soundness: 0.9,
          completeness: 0.8,
          consistency: 0.95
        },
        metadata: {
          algorithm: 'forward_chaining',
          model: 'rule_based_v1.0',
          executionTime: 1240,
          timestamp: new Date().toISOString()
        }
      },
      {
        id: 'inf_002',
        type: 'inductive',
        premises: [
          {
            nodeId: 'node_3',
            statement: '80%的优质客户在用餐后会进行评价',
            confidence: 0.8
          },
          {
            nodeId: 'node_4',
            statement: '客户评价与满意度正相关',
            confidence: 0.85
          }
        ],
        conclusion: {
          statement: '鼓励客户评价可以提高整体满意度',
          confidence: 0.72,
          supportingNodes: ['node_3', 'node_4'],
          supportingRelationships: ['rel_2']
        },
        reasoning: '通过客户行为数据进行归纳推理',
        validity: {
          soundness: 0.75,
          completeness: 0.7,
          consistency: 0.8
        },
        metadata: {
          algorithm: 'statistical_induction',
          model: 'ml_based_v2.1',
          executionTime: 2100,
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      }
    ]

    inferenceTasks.value = mockTasks
    totalTasks.value = mockTasks.length
  } catch (error) {
    console.error('Load inference tasks failed:', error)
    ElMessage.error('加载推理任务失败')
  } finally {
    loadingTasks.value = false
  }
}

const handleAlgorithmChange = (algorithm: string) => {
  ElMessage.info(`已切换到${getAlgorithmLabel(algorithm)}算法`)
}

const handleSelectionChange = (selection: KnowledgeInference[]) => {
  selectedNodes.value = selection.map(item => item.id)
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

const createInferenceTask = async () => {
  if (!inferenceForm.value.graphId) {
    ElMessage.warning('请选择知识图谱')
    return
  }

  if (inferenceForm.value.premises.some(p => !p.nodeId || !p.statement)) {
    ElMessage.warning('请完善所有前提条件')
    return
  }

  creatingTask.value = true

  try {
    const { data, success } = await knowledgeGraphAPI.performInference({
      graphId: inferenceForm.value.graphId,
      type: inferenceForm.value.type as any,
      premises: inferenceForm.value.premises.map(p => ({
        nodeId: p.nodeId,
        statement: p.statement
      })),
      maxDepth: inferenceForm.value.maxDepth,
      algorithm: inferenceForm.value.algorithm
    })

    if (success && data) {
      ElMessage.success('推理任务创建成功')
      showInferenceDialog.value = false
      await loadInferenceTasks()
    }
  } catch (error) {
    console.error('Create inference task failed:', error)
    ElMessage.error('创建推理任务失败')
  } finally {
    creatingTask.value = false
  }
}

const batchInference = () => {
  if (selectedNodes.value.length === 0) {
    ElMessage.warning('请选择要批量推理的任务')
    return
  }

  ElMessage.info(`将对 ${selectedNodes.value.length} 个任务进行批量推理`)
}

const viewInferenceDetails = (inference: KnowledgeInference) => {
  selectedInference.value = inference
}

const applyInferenceResult = (inference: KnowledgeInference) => {
  ElMessage.success('推理结果已应用到知识图谱')
}

const cancelInference = async (inference: KnowledgeInference) => {
  try {
    await ElMessageBox.confirm(
      '确定要取消这个推理任务吗？',
      '确认取消',
      {
        confirmButtonText: '取消任务',
        cancelButtonText: '保留任务',
        type: 'warning'
      }
    )

    // 调用取消API
    ElMessage.success('推理任务已取消')
    await loadInferenceTasks()
  } catch (error) {
    // 用户取消
  }
}

const deleteInference = async (inference: KnowledgeInference) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个推理记录吗？此操作不可恢复。',
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 从列表中移除
    const index = inferenceTasks.value.findIndex(t => t.id === inference.id)
    if (index > -1) {
      inferenceTasks.value.splice(index, 1)
      totalTasks.value--
    }

    ElMessage.success('推理记录已删除')
  } catch (error) {
    // 用户取消
  }
}

const addPremise = () => {
  inferenceForm.value.premises.push({ nodeId: '', statement: '' })
}

const removePremise = (index: number) => {
  if (inferenceForm.value.premises.length > 1) {
    inferenceForm.value.premises.splice(index, 1)
  }
}

const addNewRule = () => {
  // 添加新规则
  ElMessage.info('添加新规则功能开发中')
}

const importRules = () => {
  // 导入规则
  ElMessage.info('导入规则功能开发中')
}

const exportRules = () => {
  // 导出规则
  ElMessage.info('导出规则功能开发中')
}

const editRule = (rule: any) => {
  // 编辑规则
  ElMessage.info('编辑规则功能开发中')
}

const toggleRuleStatus = (rule: any) => {
  rule.enabled = !rule.enabled
  ElMessage.success(`规则已${rule.enabled ? '启用' : '禁用'}`)
}

const deleteRule = (rule: any) => {
  // 删除规则
  ElMessage.info('删除规则功能开发中')
}

const exportInferenceResult = () => {
  // 导出推理结果
  ElMessage.info('导出推理结果功能开发中')
}

const shareInferenceResult = () => {
  // 分享推理结果
  ElMessage.info('分享推理结果功能开发中')
}

// 辅助方法
const getAlgorithmTagType = (type: string) => {
  const types: Record<string, string> = {
    deductive: 'primary',
    inductive: 'success',
    abductive: 'warning',
    analogical: 'info',
    causal: 'danger'
  }
  return types[type] || ''
}

const getAlgorithmLabel = (type: string) => {
  const labels: Record<string, string> = {
    deductive: '演绎推理',
    inductive: '归纳推理',
    abductive: '溯因推理',
    analogical: '类比推理',
    causal: '因果推理'
  }
  return labels[type] || type
}

const getStatusTagType = (status: string) => {
  const types: Record<string, string> = {
    running: 'primary',
    completed: 'success',
    failed: 'danger',
    cancelled: 'info'
  }
  return types[status] || ''
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    running: '进行中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消'
  }
  return labels[status] || status
}

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.8) return '#67c23a'
  if (confidence >= 0.6) return '#e6a23c'
  return '#f56c6c'
}

const getValidityColor = (validity: number) => {
  if (validity >= 0.8) return '#67c23a'
  if (validity >= 0.6) return '#e6a23c'
  return '#f56c6c'
}

const getNodeLabel = (nodeId: string) => {
  return nodeId // 实际应该查询节点名称
}

const getRelationshipLabel = (relId: string) => {
  return relId // 实际应该查询关系名称
}

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadInferenceTasks()
})
</script>

<style scoped lang="scss">
.knowledge-inference {
  .inference-panel {
    background: white;
    padding: 24px;
    border-radius: 8px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      h3 {
        margin: 0;
        color: #2c3e50;
      }

      .panel-actions {
        display: flex;
        gap: 12px;
      }
    }

    .engine-status {
      margin-bottom: 32px;

      .status-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e9ecef;

        .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #e9ecef;

          &.active {
            background: #67c23a;
            animation: pulse 2s infinite;
          }

          &.queue {
            background: #e6a23c;
          }

          &.success {
            background: #67c23a;
          }

          &.performance {
            background: #409eff;
          }
        }

        .status-content {
          h4 {
            margin: 0 0 4px 0;
            font-size: 14px;
            color: #374151;
          }

          p {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #2c3e50;
          }
        }
      }
    }

    .algorithm-selection {
      margin-bottom: 32px;

      h4 {
        margin: 0 0 16px 0;
        color: #2c3e50;
      }

      .el-radio-group {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 16px;

        .el-radio {
          margin-right: 0;
          margin-bottom: 0;

          .algorithm-option {
            strong {
              display: block;
              margin-bottom: 4px;
              color: #2c3e50;
            }

            span {
              font-size: 13px;
              color: #6b7280;
            }
          }
        }
      }
    }

    .inference-params {
      h4 {
        margin: 0 0 16px 0;
        color: #2c3e50;
      }
    }
  }

  .inference-tasks {
    background: white;
    padding: 24px;
    border-radius: 8px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .tasks-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h3 {
        margin: 0;
        color: #2c3e50;
      }

      .tasks-filters {
        display: flex;
        gap: 12px;
        align-items: center;
      }
    }

    .confidence-text {
      margin-left: 8px;
      font-size: 12px;
      color: #6b7280;
    }

    .tasks-pagination {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }
  }

  .inference-visualization {
    background: white;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .visualization-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      h3 {
        margin: 0;
        color: #2c3e50;
      }

      .visualization-actions {
        display: flex;
        gap: 12px;
      }
    }

    .inference-process {
      h4 {
        margin: 0 0 16px 0;
        color: #2c3e50;
      }

      .process-timeline {
        .timeline-item {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          position: relative;

          &:not(:last-child)::after {
            content: '';
            position: absolute;
            left: 6px;
            top: 30px;
            width: 2px;
            height: calc(100% + 8px);
            background: #e9ecef;
          }

          &.conclusion {
            .timeline-dot {
              background: #67c23a;
              width: 14px;
              height: 14px;
            }
          }

          .timeline-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #409eff;
            margin-top: 4px;
            flex-shrink: 0;
          }

          .timeline-content {
            flex: 1;
            background: #f8f9fa;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid #e9ecef;

            .premise-statement,
            .conclusion-statement {
              margin-bottom: 8px;
              font-weight: 500;
              color: #2c3e50;
            }

            .premise-confidence,
            .conclusion-confidence {
              font-size: 13px;
              color: #6b7280;
              margin-bottom: 4px;
            }

            .premise-source,
            .conclusion-reasoning {
              font-size: 13px;
              color: #909399;
              font-style: italic;
            }
          }
        }
      }
    }

    .validity-analysis {
      h4 {
        margin: 0 0 16px 0;
        color: #2c3e50;
      }

      .validity-metrics {
        margin-bottom: 24px;

        .metric-item {
          margin-bottom: 16px;

          .metric-label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            color: #374151;
          }
        }
      }

      .supporting-evidence {
        h5 {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #374151;
        }

        .evidence-list {
          .evidence-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            padding: 8px 12px;
            background: #f8f9fa;
            border-radius: 4px;
            font-size: 13px;
            color: #374151;

            .el-icon {
              color: #409eff;
            }
          }
        }
      }
    }
  }

  .inference-form {
    .premises-editor {
      .premise-item {
        margin-bottom: 16px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 6px;
        border: 1px solid #e9ecef;

        .el-row {
          margin-bottom: 12px;
        }
      }
    }
  }

  .rule-editor {
    .rule-toolbar {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
    }

    .rules-list {
      .rule-item {
        margin-bottom: 16px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e9ecef;

        .rule-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;

          h4 {
            margin: 0;
            color: #2c3e50;
          }

          .rule-actions {
            display: flex;
            gap: 8px;
          }
        }

        .rule-content {
          .rule-description {
            margin-bottom: 8px;
            color: #6b7280;
          }

          .rule-condition,
          .rule-action,
          .rule-priority {
            margin-bottom: 4px;
            font-size: 14px;

            strong {
              color: #374151;
            }
          }
        }
      }
    }
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(103, 194, 58, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(103, 194, 58, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(103, 194, 58, 0);
  }
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-radio) {
  width: 100%;
  margin-right: 0;
  margin-bottom: 0;

  .el-radio__label {
    width: 100%;
  }
}
</style>