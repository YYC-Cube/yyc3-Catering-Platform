<template>
  <div class="session-management">
    <!-- 会话概览 -->
    <div class="session-overview">
      <el-card class="overview-card">
        <div class="overview-grid">
          <div class="overview-item">
            <div class="item-icon total">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-value">{{ sessionStats.total }}</div>
              <div class="item-label">总会话数</div>
            </div>
          </div>

          <div class="overview-item">
            <div class="item-icon active">
              <el-icon><VideoPlay /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-value">{{ sessionStats.active }}</div>
              <div class="item-label">活跃会话</div>
            </div>
          </div>

          <div class="overview-item">
            <div class="item-icon participants">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-value">{{ sessionStats.totalParticipants }}</div>
              <div class="item-label">参与智能体</div>
            </div>
          </div>

          <div class="overview-item">
            <div class="item-icon effectiveness">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-value">{{ sessionStats.avgEffectiveness }}%</div>
              <div class="item-label">平均有效性</div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 会话列表 -->
    <el-card class="session-list-card">
      <div class="list-header">
        <div class="header-left">
          <h3>协作会话</h3>
          <span class="total-count">共 {{ totalSessions }} 个会话</span>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            创建会话
          </el-button>
          <el-button @click="loadSessions">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>

      <!-- 过滤器 -->
      <div class="filter-section">
        <el-row :gutter="16">
          <el-col :span="6">
            <el-select
              v-model="filters.type"
              placeholder="会话类型"
              clearable
              @change="loadSessions"
            >
              <el-option label="全部" value="" />
              <el-option label="任务协调" value="task_coordination" />
              <el-option label="问题解决" value="problem_solving" />
              <el-option label="信息共享" value="information_sharing" />
              <el-option label="决策制定" value="decision_making" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="filters.status"
              placeholder="会话状态"
              clearable
              @change="loadSessions"
            >
              <el-option label="全部" value="" />
              <el-option label="活跃" value="active" />
              <el-option label="暂停" value="paused" />
              <el-option label="已完成" value="completed" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-input
              v-model="filters.search"
              placeholder="搜索会话标题"
              clearable
              @input="debounceSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="6">
            <el-date-picker
              v-model="filters.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="loadSessions"
            />
          </el-col>
        </el-row>
      </div>

      <!-- 会话时间线 -->
      <div class="session-timeline">
        <div
          v-for="session in sessions"
          :key="session.id"
          class="session-timeline-item"
          :class="{ 'active-session': session.status === 'active' }"
        >
          <div class="timeline-marker">
            <div class="marker-dot" :class="session.status"></div>
            <div class="marker-line"></div>
          </div>

          <div class="session-content">
            <div class="session-header">
              <div class="session-info">
                <h4 class="session-title">{{ session.title }}</h4>
                <div class="session-meta">
                  <el-tag :type="getStatusType(session.status)" size="small">
                    {{ getStatusText(session.status) }}
                  </el-tag>
                  <el-tag :type="getTypeType(session.type)" size="small" effect="plain">
                    {{ getTypeText(session.type) }}
                  </el-tag>
                  <span class="session-duration">
                    持续: {{ formatDuration(session.metrics.duration) }}
                  </span>
                </div>
              </div>
              <div class="session-actions">
                <el-dropdown @command="(command) => handleSessionAction(command, session)">
                  <el-button type="text" :icon="MoreFilled" />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="view">查看详情</el-dropdown-item>
                      <el-dropdown-item command="join">加入会话</el-dropdown-item>
                      <el-dropdown-item command="monitor">实时监控</el-dropdown-item>
                      <el-dropdown-item command="export">导出记录</el-dropdown-item>
                      <el-dropdown-item command="pause" divided>暂停会话</el-dropdown-item>
                      <el-dropdown-item command="end">结束会话</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>

            <div class="session-context">
              <div class="context-objective">
                <strong>目标:</strong> {{ session.context.objective }}
              </div>
              <div class="context-scope">
                <strong>范围:</strong> {{ session.context.scope }}
              </div>
            </div>

            <!-- 参与者 -->
            <div class="session-participants">
              <div class="participants-label">参与者 ({{ session.participants.length }}):</div>
              <div class="participants-list">
                <el-tooltip
                  v-for="participantId in session.participants"
                  :key="participantId"
                  :content="getParticipantName(participantId)"
                  placement="top"
                >
                  <el-avatar :size="32" class="participant-avatar">
                    <el-icon><User /></el-icon>
                  </el-avatar>
                </el-tooltip>
                <el-button
                  v-if="session.status === 'active'"
                  size="small"
                  type="primary"
                  plain
                  @click="addParticipant(session)"
                >
                  添加参与者
                </el-button>
              </div>
            </div>

            <!-- 会话指标 -->
            <div class="session-metrics">
              <div class="metrics-grid">
                <div class="metric-item">
                  <div class="metric-value">{{ session.metrics.messagesExchanged }}</div>
                  <div class="metric-label">消息交换</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value">{{ session.metrics.participantsEngaged }}%</div>
                  <div class="metric-label">参与度</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value">{{ session.metrics.effectiveness }}%</div>
                  <div class="metric-label">有效性</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value">{{ session.metrics.satisfaction }}/5</div>
                  <div class="metric-label">满意度</div>
                </div>
              </div>
            </div>

            <!-- 决策和解决方案 -->
            <div v-if="session.outcomes" class="session-outcomes">
              <div class="outcomes-header">
                <span>成果产出</span>
              </div>
              <div class="outcomes-content">
                <div v-if="session.outcomes.decisions && session.outcomes.decisions.length > 0" class="outcome-section">
                  <div class="outcome-title">
                    <el-icon><Document /></el-icon>
                    决策 ({{ session.outcomes.decisions.length }})
                  </div>
                  <div class="outcome-list">
                    <div
                      v-for="decision in session.outcomes.decisions.slice(0, 2)"
                      :key="decision.id"
                      class="outcome-item"
                    >
                      <span class="outcome-content">{{ decision.content }}</span>
                      <span class="outcome-consensus">{{ decision.consensus }}% 共识</span>
                    </div>
                    <div
                      v-if="session.outcomes.decisions.length > 2"
                      class="outcome-more"
                    >
                      +{{ session.outcomes.decisions.length - 2 }} 个决策
                    </div>
                  </div>
                </div>

                <div v-if="session.outcomes.solutions && session.outcomes.solutions.length > 0" class="outcome-section">
                  <div class="outcome-title">
                    <el-icon><Tools /></el-icon>
                    解决方案 ({{ session.outcomes.solutions.length }})
                  </div>
                  <div class="outcome-list">
                    <div
                      v-for="solution in session.outcomes.solutions.slice(0, 2)"
                      :key="solution.id"
                      class="outcome-item"
                    >
                      <span class="outcome-content">{{ solution.description }}</span>
                      <el-tag :type="getStatusType(solution.status)" size="small">
                        {{ solution.status }}
                      </el-tag>
                    </div>
                    <div
                      v-if="session.outcomes.solutions.length > 2"
                      class="outcome-more"
                    >
                      +{{ session.outcomes.solutions.length - 2 }} 个解决方案
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 时间信息 -->
            <div class="session-time">
              <div class="time-item">
                <el-icon><Clock /></el-icon>
                <span>开始: {{ formatTime(session.startedAt) }}</span>
              </div>
              <div v-if="session.endedAt" class="time-item">
                <el-icon><Clock /></el-icon>
                <span>结束: {{ formatTime(session.endedAt) }}</span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="session-footer">
              <el-button
                v-if="session.status === 'active'"
                type="success"
                size="small"
                @click="joinSession(session)"
              >
                加入会话
              </el-button>
              <el-button
                v-if="session.status === 'completed'"
                type="primary"
                size="small"
                @click="viewDetails(session)"
              >
                查看报告
              </el-button>
              <el-button
                type="info"
                size="small"
                @click="exportSession(session)"
              >
                导出记录
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="totalSessions"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadSessions"
          @current-change="loadSessions"
        />
      </div>
    </el-card>

    <!-- 创建会话对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建协作会话"
      width="70%"
      destroy-on-close
    >
      <CreateCollaborationSession
        v-if="showCreateDialog"
        @success="handleSessionCreated"
        @cancel="showCreateDialog = false"
      />
    </el-dialog>

    <!-- 会话详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      :title="`会话详情 - ${currentSession?.title}`"
      width="90%"
      destroy-on-close
    >
      <SessionDetail
        v-if="showDetailDialog"
        :session="currentSession"
        @refresh="loadSessions"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Refresh, Connection, VideoPlay, UserFilled, TrendCharts,
  Search, MoreFilled, User, Clock, Document, Tools
} from '@element-plus/icons-vue'
import { multiAgentAPI } from '@/api/multi-agent'
import type { CollaborationSession } from '@/api/multi-agent'
import CreateCollaborationSession from './CreateCollaborationSession.vue'
import SessionDetail from './SessionDetail.vue'

// 响应式数据
const loading = ref(false)
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const sessions = ref<CollaborationSession[]>([])
const currentSession = ref<CollaborationSession>()
const agents = ref<any[]>([])

// 过滤器
const filters = reactive({
  type: '',
  status: '',
  search: '',
  dateRange: null as [string, string] | null
})

// 分页
const pagination = reactive({
  page: 1,
  size: 20
})

// 会话统计
const sessionStats = ref({
  total: 0,
  active: 0,
  paused: 0,
  completed: 0,
  cancelled: 0,
  totalParticipants: 0,
  avgEffectiveness: 0
})

// 计算属性
const totalSessions = computed(() => sessions.value.length)

// 生命周期
onMounted(() => {
  loadSessions()
  loadAgents()
})

// 方法
const loadSessions = async () => {
  try {
    loading.value = true
    const response = await multiAgentAPI.getSessions({
      type: filters.type || undefined,
      status: filters.status || undefined,
      participant: filters.participant || undefined,
      limit: pagination.size,
      offset: (pagination.page - 1) * pagination.size
    })

    if (response.success && response.data) {
      sessions.value = response.data.sessions
      calculateSessionStats()
    }
  } catch (error) {
    console.error('Load sessions failed:', error)
    ElMessage.error('加载会话列表失败')
  } finally {
    loading.value = false
  }
}

const loadAgents = async () => {
  try {
    const response = await multiAgentAPI.getAgents()
    if (response.success && response.data) {
      agents.value = response.data.agents
    }
  } catch (error) {
    console.error('Load agents failed:', error)
  }
}

const calculateSessionStats = () => {
  const stats = {
    total: sessions.value.length,
    active: 0,
    paused: 0,
    completed: 0,
    cancelled: 0,
    totalParticipants: 0,
    avgEffectiveness: 0
  }

  let totalEffectiveness = 0

  sessions.value.forEach(session => {
    switch (session.status) {
      case 'active':
        stats.active++
        break
      case 'paused':
        stats.paused++
        break
      case 'completed':
        stats.completed++
        break
      case 'cancelled':
        stats.cancelled++
        break
    }

    stats.totalParticipants += session.participants.length
    totalEffectiveness += session.metrics.effectiveness
  })

  stats.avgEffectiveness = sessions.value.length > 0
    ? Math.round(totalEffectiveness / sessions.value.length)
    : 0

  sessionStats.value = stats
}

const debounceSearch = (() => {
  let timeoutId: number
  return () => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      loadSessions()
    }, 300)
  }
})()

const handleSessionAction = async (command: string, session: CollaborationSession) => {
  switch (command) {
    case 'view':
      viewDetails(session)
      break
    case 'join':
      joinSession(session)
      break
    case 'monitor':
      monitorSession(session)
      break
    case 'export':
      exportSession(session)
      break
    case 'pause':
      await pauseSession(session)
      break
    case 'end':
      await endSession(session)
      break
  }
}

const viewDetails = (session: CollaborationSession) => {
  currentSession.value = session
  showDetailDialog.value = true
}

const joinSession = (session: CollaborationSession) => {
  ElMessage.info('加入会话功能开发中')
}

const monitorSession = (session: CollaborationSession) => {
  ElMessage.info('实时监控功能开发中')
}

const exportSession = (session: CollaborationSession) => {
  ElMessage.info('导出记录功能开发中')
}

const pauseSession = async (session: CollaborationSession) => {
  try {
    await ElMessageBox.confirm(
      `确定要暂停会话 "${session.title}" 吗？`,
      '确认暂停',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success('会话暂停成功')
    loadSessions()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Pause session failed:', error)
      ElMessage.error('暂停会话失败')
    }
  }
}

const endSession = async (session: CollaborationSession) => {
  try {
    await ElMessageBox.confirm(
      `确定要结束会话 "${session.title}" 吗？`,
      '确认结束',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success('会话结束成功')
    loadSessions()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('End session failed:', error)
      ElMessage.error('结束会话失败')
    }
  }
}

const addParticipant = (session: CollaborationSession) => {
  ElMessage.info('添加参与者功能开发中')
}

const handleSessionCreated = () => {
  showCreateDialog.value = false
  ElMessage.success('会话创建成功')
  loadSessions()
}

// 辅助方法
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'active': 'success',
    'paused': 'warning',
    'completed': 'info',
    'cancelled': 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'active': '活跃',
    'paused': '暂停',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return textMap[status] || status
}

const getTypeType = (type: string) => {
  const typeMap: Record<string, string> = {
    'task_coordination': 'primary',
    'problem_solving': 'warning',
    'information_sharing': 'info',
    'decision_making': 'success'
  }
  return typeMap[type] || 'info'
}

const getTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    'task_coordination': '任务协调',
    'problem_solving': '问题解决',
    'information_sharing': '信息共享',
    'decision_making': '决策制定'
  }
  return textMap[type] || type
}

const getParticipantName = (participantId: string) => {
  const agent = agents.value.find(a => a.id === participantId)
  return agent ? agent.name : `智能体 ${participantId}`
}

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

const formatTime = (time: string) => {
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 暴露方法给父组件
defineExpose({
  loadSessions,
  refresh: loadSessions
})
</script>

<style lang="scss" scoped>
.session-management {
  .session-overview {
    margin-bottom: 24px;

    .overview-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;

      .overview-item {
        display: flex;
        align-items: center;
        gap: 16px;

        .item-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;

          &.total {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          &.active {
            background: linear-gradient(135deg, #48c774 0%, #3ec46d 100%);
            color: white;
          }

          &.participants {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
            color: white;
          }

          &.effectiveness {
            background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
            color: white;
          }
        }

        .item-info {
          .item-value {
            font-size: 24px;
            font-weight: 700;
            color: #303133;
            line-height: 1.2;
          }

          .item-label {
            font-size: 13px;
            color: #909399;
          }
        }
      }
    }
  }

  .session-list-card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .header-left {
        h3 {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 600;
          color: #303133;
        }

        .total-count {
          font-size: 14px;
          color: #909399;
        }
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }

    .filter-section {
      margin-bottom: 24px;
    }

    .session-timeline {
      position: relative;
      margin-bottom: 20px;

      .session-timeline-item {
        display: flex;
        gap: 24px;
        margin-bottom: 32px;
        position: relative;

        &:last-child {
          .timeline-marker .marker-line {
            display: none;
          }
        }

        &.active-session {
          .timeline-marker .marker-dot {
            background-color: #67c23a;
            box-shadow: 0 0 0 4px rgba(103, 194, 58, 0.2);
          }

          .session-content {
            border-left: 4px solid #67c23a;
          }
        }

        .timeline-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 2;

          .marker-dot {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background-color: #e4e7ed;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;

            &.active {
              background-color: #67c23a;
            }

            &.paused {
              background-color: #e6a23c;
            }

            &.completed {
              background-color: #409eff;
            }

            &.cancelled {
              background-color: #f56c6c;
            }
          }

          .marker-line {
            width: 2px;
            height: 100%;
            background-color: #e4e7ed;
            margin-top: 8px;
            position: absolute;
            top: 16px;
          }
        }

        .session-content {
          flex: 1;
          background: white;
          border: 1px solid #e4e7ed;
          border-radius: 12px;
          padding: 24px;
          position: relative;

          .session-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;

            .session-info {
              flex: 1;

              .session-title {
                margin: 0 0 8px 0;
                font-size: 18px;
                font-weight: 600;
                color: #303133;
                line-height: 1.4;
              }

              .session-meta {
                display: flex;
                align-items: center;
                gap: 12px;
                flex-wrap: wrap;

                .session-duration {
                  font-size: 12px;
                  color: #909399;
                  background: #f4f4f5;
                  padding: 2px 6px;
                  border-radius: 4px;
                }
              }
            }
          }

          .session-context {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;

            .context-objective,
            .context-scope {
              font-size: 14px;
              color: #606266;
              margin-bottom: 8px;
              line-height: 1.5;

              strong {
                color: #303133;
              }
            }
          }

          .session-participants {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;

            .participants-label {
              font-size: 14px;
              color: #606266;
              min-width: 100px;
            }

            .participants-list {
              display: flex;
              align-items: center;
              gap: 8px;

              .participant-avatar {
                cursor: pointer;
                border: 2px solid #fff;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
            }
          }

          .session-metrics {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;

            .metrics-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 16px;

              .metric-item {
                text-align: center;

                .metric-value {
                  font-size: 20px;
                  font-weight: 700;
                  color: #303133;
                  margin-bottom: 4px;
                }

                .metric-label {
                  font-size: 12px;
                  color: #909399;
                }
              }
            }
          }

          .session-outcomes {
            margin-bottom: 16px;

            .outcomes-header {
              font-size: 14px;
              font-weight: 600;
              color: #303133;
              margin-bottom: 12px;
            }

            .outcomes-content {
              .outcome-section {
                margin-bottom: 16px;

                .outcome-title {
                  display: flex;
                  align-items: center;
                  gap: 6px;
                  font-size: 13px;
                  font-weight: 600;
                  color: #303133;
                  margin-bottom: 8px;
                }

                .outcome-list {
                  .outcome-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 12px;
                    background: #f8f9fa;
                    border-radius: 6px;
                    margin-bottom: 6px;

                    .outcome-content {
                      font-size: 13px;
                      color: #303133;
                      flex: 1;
                      margin-right: 8px;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                    }

                    .outcome-consensus {
                      font-size: 12px;
                      color: #67c23a;
                      font-weight: 500;
                    }
                  }

                  .outcome-more {
                    font-size: 12px;
                    color: #909399;
                    text-align: center;
                    padding: 4px;
                  }
                }
              }
            }
          }

          .session-time {
            border-top: 1px solid #f0f0f0;
            padding-top: 12px;
            margin-bottom: 16px;

            .time-item {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 12px;
              color: #909399;
              margin-bottom: 4px;
            }
          }

          .session-footer {
            display: flex;
            gap: 8px;
          }
        }
      }
    }

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }
}

@media (max-width: 768px) {
  .session-management {
    .overview-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 16px;
    }

    .list-header {
      flex-direction: column !important;
      gap: 16px;
      align-items: stretch !important;
    }

    .filter-section {
      .el-row {
        .el-col {
          margin-bottom: 12px;
        }
      }
    }

    .session-timeline {
      .session-timeline-item {
        flex-direction: column;
        gap: 16px;

        .timeline-marker {
          flex-direction: row;
          width: 100%;

          .marker-line {
            width: 100%;
            height: 2px;
            top: 8px;
            left: 16px;
          }
        }
      }
    }

    .metrics-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 12px;
    }
  }
}
</style>