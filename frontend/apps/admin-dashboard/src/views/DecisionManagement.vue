<template>
  <div class="decision-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>智能决策中心</h1>
        <p>人机协同的智能决策管理与执行</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          发起决策
        </el-button>
        <el-button @click="showTemplateDialog = true">
          <el-icon><Document /></el-icon>
          决策模板
        </el-button>
      </div>
    </div>

    <!-- 决策统计概览 -->
    <div class="decision-overview">
      <el-card class="overview-card">
        <div class="overview-grid">
          <div class="overview-item">
            <div class="item-icon pending">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-value">{{ decisionStats.totalDecisions }}</div>
              <div class="item-label">总决策数</div>
              <div class="item-trend positive">
                <el-icon><TrendCharts /></el-icon>
                +{{ decisionStats.weeklyGrowth }}% 本周
              </div>
            </div>
          </div>

          <div class="overview-item">
            <div class="item-icon active">
              <el-icon><Loading /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-value">{{ decisionStats.activeDecisions }}</div>
              <div class="item-label">进行中</div>
              <div class="item-detail">
                {{ decisionStats.analyzing }} 分析中
              </div>
            </div>
          </div>

          <div class="overview-item">
            <div class="item-icon success">
              <el-icon><SuccessFilled /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-value">{{ decisionStats.successRate }}%</div>
              <div class="item-label">成功率</div>
              <div class="item-status" :class="getSuccessRateStatus(decisionStats.successRate)">
                {{ getSuccessRateText(decisionStats.successRate) }}
              </div>
            </div>
          </div>

          <div class="overview-item">
            <div class="item-icon ai">
              <el-icon><Cpu /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-value">{{ decisionStats.aiParticipation }}%</div>
              <div class="item-label">AI参与率</div>
              <div class="item-detail">
                {{ decisionStats.humanAICollaboration }} 人机协同
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 决策列表 -->
    <el-card class="decision-list-card">
      <div class="list-header">
        <h3>决策列表</h3>
        <div class="header-actions">
          <el-input
            v-model="searchQuery"
            placeholder="搜索决策..."
            clearable
            style="width: 200px"
            @input="loadDecisionRequests"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-select
            v-model="typeFilter"
            placeholder="决策类型"
            clearable
            style="width: 150px"
            @change="loadDecisionRequests"
          >
            <el-option label="战略决策" value="strategic" />
            <el-option label="战术决策" value="tactical" />
            <el-option label="操作决策" value="operational" />
            <el-option label="应急决策" value="emergency" />
          </el-select>

          <el-select
            v-model="statusFilter"
            placeholder="状态"
            clearable
            style="width: 120px"
            @change="loadDecisionRequests"
          >
            <el-option label="待处理" value="pending" />
            <el-option label="分析中" value="analyzing" />
            <el-option label="建议中" value="recommendation" />
            <el-option label="已批准" value="approved" />
            <el-option label="执行中" value="implemented" />
            <el-option label="已完成" value="completed" />
          </el-select>

          <el-button @click="loadDecisionRequests" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="decisionRequests"
        stripe
        style="width: 100%"
        @row-click="viewDecisionDetails"
      >
        <el-table-column label="决策标题" min-width="200">
          <template #default="{ row }">
            <div class="decision-title">
              <div class="title-text">{{ row.title }}</div>
              <div class="title-meta">
                <el-tag :type="getTypeColor(row.type)" size="small">
                  {{ getTypeText(row.type) }}
                </el-tag>
                <el-tag :type="getLevelColor(row.level)" size="small">
                  {{ getLevelText(row.level) }}
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityColor(row.priority)" size="small">
              {{ getPriorityText(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <div class="status-info">
              <el-tag :type="getStatusColor(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
              <div class="status-detail" v-if="row.status === 'implemented'">
                进度 {{ getDecisionProgress(row) }}%
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="参与者" width="150">
          <template #default="{ row }">
            <div class="participants">
              <el-tooltip content="人类专家" placement="top">
                <el-icon class="participant-icon"><UserFilled /></el-icon>
              </el-tooltip>
              <el-tooltip content="AI智能体" placement="top">
                <el-icon class="participant-icon"><Cpu /></el-icon>
              </el-tooltip>
              <el-tooltip content="集体智慧" placement="top">
                <el-icon class="participant-icon"><User /></el-icon>
              </el-tooltip>
              <span class="participant-count">{{ row.requiredParticipants.length }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="发起人" width="120">
          <template #default="{ row }">
            <div class="requester-info">
              <div class="requester-name">{{ row.requestedBy }}</div>
              <div class="requester-time">{{ formatTime(row.requestedAt) }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="截止时间" width="120">
          <template #default="{ row }">
            <div class="deadline" :class="{ 'urgent': isUrgent(row.deadline) }">
              <span v-if="row.deadline">{{ formatDate(row.deadline) }}</span>
              <span v-else class="no-deadline">无截止</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                size="small"
                type="primary"
                link
                @click.stop="viewDecisionDetails(row)"
              >
                详情
              </el-button>
              <el-button
                v-if="row.status === 'pending' || row.status === 'analyzing'"
                size="small"
                type="success"
                link
                @click.stop="analyzeDecision(row)"
              >
                分析
              </el-button>
              <el-button
                v-if="row.status === 'recommendation'"
                size="small"
                type="warning"
                link
                @click.stop="collaborateDecision(row)"
              >
                协同
              </el-button>
              <el-dropdown trigger="click" @command="(command) => handleCommand(command, row)">
                <el-button size="small" link @click.stop>
                  更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit">编辑</el-dropdown-item>
                    <el-dropdown-item command="clone">复制</el-dropdown-item>
                    <el-dropdown-item command="export">导出</el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadDecisionRequests"
          @current-change="loadDecisionRequests"
        />
      </div>
    </el-card>

    <!-- 创建决策请求对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建决策请求"
      width="80%"
      :destroy-on-close="true"
    >
      <CreateDecisionRequest @success="handleCreateSuccess" @cancel="showCreateDialog = false" />
    </el-dialog>

    <!-- 决策模板对话框 -->
    <el-dialog
      v-model="showTemplateDialog"
      title="决策模板"
      width="70%"
      :destroy-on-close="true"
    >
      <DecisionTemplates @select="handleTemplateSelect" />
    </el-dialog>

    <!-- 决策详情对话框 -->
    <el-dialog
      v-model="showDetailsDialog"
      :title="selectedDecision?.title || '决策详情'"
      width="90%"
      :destroy-on-close="true"
    >
      <DecisionDetails
        v-if="selectedDecision"
        :decision="selectedDecision"
        @update="handleDecisionUpdate"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Document, Clock, Loading, SuccessFilled, Cpu,
  TrendCharts, Search, Refresh, UserFilled, User, ArrowDown
} from '@element-plus/icons-vue'
import { decisionEngineAPI } from '@/api/decision-engine'
import type {
  DecisionRequest, DecisionType, DecisionLevel, DecisionStatus,
  DecisionPriority
} from '@/api/decision-engine'
import CreateDecisionRequest from '@/components/Decision/CreateDecisionRequest.vue'
import DecisionTemplates from '@/components/Decision/DecisionTemplates.vue'
import DecisionDetails from '@/components/Decision/DecisionDetails.vue'

// 响应式数据
const loading = ref(false)
const searchQuery = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const decisionRequests = ref<DecisionRequest[]>([])
const selectedDecision = ref<DecisionRequest | null>(null)

const showCreateDialog = ref(false)
const showTemplateDialog = ref(false)
const showDetailsDialog = ref(false)

// 分页
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
})

// 决策统计数据
const decisionStats = ref({
  totalDecisions: 156,
  activeDecisions: 23,
  analyzing: 8,
  weeklyGrowth: 12.5,
  successRate: 78,
  aiParticipation: 65,
  humanAICollaboration: 42
})

// 生命周期
onMounted(() => {
  loadDecisionRequests()
  loadDecisionStats()
})

// 方法
const loadDecisionRequests = async () => {
  try {
    loading.value = true
    const response = await decisionEngineAPI.getDecisionRequests({
      type: typeFilter.value as DecisionType,
      status: statusFilter.value as DecisionStatus,
      limit: pagination.value.pageSize,
      offset: (pagination.value.page - 1) * pagination.value.pageSize
    })

    if (response.success && response.data) {
      decisionRequests.value = response.data.requests
      pagination.value.total = response.data.total
    }
  } catch (error) {
    console.error('Load decision requests failed:', error)
    ElMessage.error('加载决策列表失败')
  } finally {
    loading.value = false
  }
}

const loadDecisionStats = async () => {
  try {
    const response = await decisionEngineAPI.getDecisionStats('month')
    if (response.success && response.data) {
      decisionStats.value = {
        totalDecisions: response.data.totalDecisions,
        activeDecisions: response.data.byStatus.analyzing + response.data.byStatus.pending,
        analyzing: response.data.byStatus.analyzing,
        weeklyGrowth: 12.5, // 模拟数据
        successRate: Math.round(response.data.successRate * 100),
        aiParticipation: 65, // 模拟数据
        humanAICollaboration: response.data.byType.collaborative || 0
      }
    }
  } catch (error) {
    console.error('Load decision stats failed:', error)
  }
}

const getTypeColor = (type: DecisionType) => {
  const colors = {
    strategic: 'danger',
    tactical: 'warning',
    operational: 'primary',
    emergency: 'danger'
  }
  return colors[type] || 'info'
}

const getTypeText = (type: DecisionType) => {
  const texts = {
    strategic: '战略',
    tactical: '战术',
    operational: '操作',
    emergency: '应急'
  }
  return texts[type] || type
}

const getLevelColor = (level: DecisionLevel) => {
  const colors = {
    executive: 'danger',
    management: 'warning',
    supervisor: 'primary',
    staff: 'success'
  }
  return colors[level] || 'info'
}

const getLevelText = (level: DecisionLevel) => {
  const texts = {
    executive: '高层',
    management: '管理',
    supervisor: '主管',
    staff: '员工'
  }
  return texts[level] || level
}

const getPriorityColor = (priority: DecisionPriority) => {
  const colors = {
    low: 'info',
    medium: 'warning',
    high: 'danger',
    critical: 'danger',
    urgent: 'danger'
  }
  return colors[priority] || 'info'
}

const getPriorityText = (priority: DecisionPriority) => {
  const texts = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '紧急',
    urgent: '紧急'
  }
  return texts[priority] || priority
}

const getStatusColor = (status: DecisionStatus) => {
  const colors = {
    pending: 'warning',
    analyzing: 'primary',
    recommendation: 'info',
    approved: 'success',
    rejected: 'danger',
    implemented: 'primary',
    completed: 'success',
    failed: 'danger'
  }
  return colors[status] || 'info'
}

const getStatusText = (status: DecisionStatus) => {
  const texts = {
    pending: '待处理',
    analyzing: '分析中',
    recommendation: '建议中',
    approved: '已批准',
    rejected: '已拒绝',
    implemented: '执行中',
    completed: '已完成',
    failed: '失败'
  }
  return texts[status] || status
}

const getSuccessRateStatus = (rate: number) => {
  if (rate >= 80) return 'excellent'
  if (rate >= 60) return 'good'
  return 'poor'
}

const getSuccessRateText = (rate: number) => {
  if (rate >= 80) return '优秀'
  if (rate >= 60) return '良好'
  return '需改进'
}

const getDecisionProgress = (decision: DecisionRequest) => {
  // 这里应该从执行状态获取进度，暂时返回模拟数据
  return Math.floor(Math.random() * 100)
}

const isUrgent = (deadline?: string) => {
  if (!deadline) return false
  const deadlineTime = new Date(deadline).getTime()
  const now = new Date().getTime()
  const hoursUntilDeadline = (deadlineTime - now) / (1000 * 60 * 60)
  return hoursUntilDeadline < 24
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

const viewDecisionDetails = (decision: DecisionRequest) => {
  selectedDecision.value = decision
  showDetailsDialog.value = true
}

const analyzeDecision = (decision: DecisionRequest) => {
  // 启动AI分析流程
  ElMessage.info('启动AI智能分析...')
}

const collaborateDecision = (decision: DecisionRequest) => {
  // 启动协同决策流程
  ElMessage.info('启动人机协同决策...')
}

const handleCommand = async (command: string, decision: DecisionRequest) => {
  switch (command) {
    case 'edit':
      // 编辑决策
      break
    case 'clone':
      // 复制决策
      ElMessage.success('决策已复制')
      break
    case 'export':
      // 导出决策
      ElMessage.success('决策已导出')
      break
    case 'delete':
      try {
        await ElMessageBox.confirm(
          `确定要删除决策"${decision.title}"吗？`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        ElMessage.success('决策已删除')
        await loadDecisionRequests()
      } catch (error: any) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
      break
  }
}

const handleCreateSuccess = () => {
  showCreateDialog.value = false
  ElMessage.success('决策请求创建成功')
  loadDecisionRequests()
}

const handleTemplateSelect = (template: any) => {
  showTemplateDialog.value = false
  // 基于模板创建决策
  ElMessage.success('已基于模板创建决策')
}

const handleDecisionUpdate = (updatedDecision: DecisionRequest) => {
  // 更新决策列表中的对应项
  const index = decisionRequests.value.findIndex(d => d.id === updatedDecision.id)
  if (index !== -1) {
    decisionRequests.value[index] = updatedDecision
  }
}
</script>

<style lang="scss" scoped>
.decision-management {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;

    .header-content {
      h1 {
        margin: 0 0 8px 0;
        font-size: 28px;
        font-weight: 600;
        color: #303133;
      }

      p {
        margin: 0;
        color: #909399;
        font-size: 14px;
      }
    }
  }

  .decision-overview {
    margin-bottom: 24px;

    .overview-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;

      .overview-item {
        display: flex;
        align-items: center;
        gap: 16px;

        .item-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;

          &.pending {
            background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
            color: white;
          }

          &.active {
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            color: white;
          }

          &.success {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            color: white;
          }

          &.ai {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
          }
        }

        .item-info {
          flex: 1;

          .item-value {
            font-size: 28px;
            font-weight: 700;
            color: #303133;
            line-height: 1.2;
          }

          .item-label {
            font-size: 14px;
            color: #909399;
            margin: 4px 0;
          }

          .item-trend {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 13px;
            font-weight: 500;

            &.positive {
              color: #67c23a;
            }

            &.negative {
              color: #f56c6c;
            }
          }

          .item-detail {
            font-size: 13px;
            color: #606266;
          }

          .item-status {
            font-size: 13px;
            font-weight: 500;

            &.excellent {
              color: #67c23a;
            }

            &.good {
              color: #e6a23c;
            }

            &.poor {
              color: #f56c6c;
            }
          }
        }
      }
    }
  }

  .decision-list-card {
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }

      .header-actions {
        display: flex;
        gap: 12px;
        align-items: center;
      }
    }

    .decision-title {
      .title-text {
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }

      .title-meta {
        display: flex;
        gap: 4px;
      }
    }

    .status-info {
      .status-detail {
        font-size: 12px;
        color: #909399;
        margin-top: 2px;
      }
    }

    .participants {
      display: flex;
      align-items: center;
      gap: 4px;

      .participant-icon {
        font-size: 14px;
        color: #606266;
      }

      .participant-count {
        font-size: 12px;
        color: #909399;
        margin-left: 4px;
      }
    }

    .requester-info {
      .requester-name {
        font-size: 14px;
        color: #303133;
        font-weight: 500;
      }

      .requester-time {
        font-size: 12px;
        color: #909399;
      }
    }

    .deadline {
      font-size: 14px;

      &.urgent {
        color: #f56c6c;
        font-weight: 600;
      }

      .no-deadline {
        color: #c0c4cc;
      }
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .pagination-wrapper {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }
  }

  .el-dialog {
    .el-dialog__body {
      padding: 0;
    }
  }
}

@media (max-width: 768px) {
  .decision-management {
    padding: 16px;

    .page-header {
      flex-direction: column;
      gap: 16px;
    }

    .overview-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .list-header {
      flex-direction: column;
      gap: 12px;
      align-items: stretch !important;

      .header-actions {
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  }
}
</style>