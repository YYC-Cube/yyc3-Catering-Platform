<template>
  <div class="ai-dashboard">
    <!-- AI服务概览 -->
    <div class="ai-overview">
      <el-row :gutter="20">
        <el-col :span="6" v-for="stat in aiStats" :key="stat.key">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" :class="stat.type">
                <el-icon :size="24">
                  <component :is="stat.icon" />
                </el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
                <div class="stat-trend" :class="stat.trend">
                  <el-icon :size="12">
                    <ArrowUp v-if="stat.trend === 'up'" />
                    <ArrowDown v-if="stat.trend === 'down'" />
                    <Minus v-if="stat.trend === 'stable'" />
                  </el-icon>
                  {{ stat.change }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- AI功能选项卡 -->
    <el-tabs v-model="activeTab" class="ai-tabs">
      <!-- AI助手聊天 -->
      <el-tab-pane label="AI助手" name="chat">
        <div class="ai-chat">
          <div class="chat-container">
            <div class="chat-messages" ref="chatMessagesRef">
              <div
                v-for="message in currentSession?.messages || []"
                :key="message.id"
                class="message"
                :class="message.role"
              >
                <div class="message-avatar">
                  <el-avatar v-if="message.role === 'user'" :size="32">
                    {{ userInitial }}
                  </el-avatar>
                  <el-avatar v-else :size="32" :style="{ background: '#6366f1' }">
                    <el-icon><Robot /></el-icon>
                  </el-avatar>
                </div>
                <div class="message-content">
                  <div class="message-text">{{ message.content }}</div>
                  <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                </div>
              </div>
            </div>
            <div class="chat-input">
              <el-input
                v-model="chatInput"
                type="textarea"
                :rows="3"
                placeholder="向AI助手提问..."
                @keydown.ctrl.enter="sendMessage"
                :loading="chatLoading"
              />
              <div class="chat-actions">
                <el-button type="primary" @click="sendMessage" :loading="chatLoading">
                  <el-icon><Position /></el-icon>
                  发送 (Ctrl+Enter)
                </el-button>
                <el-button @click="clearChat">
                  <el-icon><Delete /></el-icon>
                  清空
                </el-button>
              </div>
            </div>
          </div>
          <div class="chat-sidebar">
            <div class="sidebar-section">
              <h4>快捷问题</h4>
              <div class="quick-questions">
                <el-button
                  v-for="question in quickQuestions"
                  :key="question"
                  size="small"
                  @click="askQuickQuestion(question)"
                >
                  {{ question }}
                </el-button>
              </div>
            </div>
            <div class="sidebar-section">
              <h4>聊天历史</h4>
              <div class="chat-history">
                <div
                  v-for="session in chatSessions"
                  :key="session.id"
                  class="history-item"
                  :class="{ active: currentSession?.id === session.id }"
                  @click="switchChatSession(session.id)"
                >
                  <div class="history-title">{{ session.title }}</div>
                  <div class="history-time">{{ formatTime(session.last_activity) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 智能推荐 -->
      <el-tab-pane label="智能推荐" name="recommendations">
        <div class="recommendations">
          <div class="recommendation-filters">
            <el-select
              v-model="recommendationFilters.type"
              placeholder="推荐类型"
              style="width: 150px;"
              @change="loadRecommendations"
            >
              <el-option label="菜品推荐" value="menu" />
              <el-option label="库存推荐" value="inventory" />
              <el-option label="定价推荐" value="pricing" />
              <el-option label="营销推荐" value="marketing" />
            </el-select>
            <el-select
              v-model="recommendationFilters.priority"
              placeholder="优先级"
              style="width: 120px; margin-left: 10px;"
              @change="loadRecommendations"
            >
              <el-option label="全部" value="" />
              <el-option label="紧急" value="urgent" />
              <el-option label="高" value="high" />
              <el-option label="中" value="medium" />
              <el-option label="低" value="low" />
            </el-select>
            <el-button type="primary" style="margin-left: 10px;" @click="loadRecommendations">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
          <div class="recommendation-list">
            <el-card
              v-for="recommendation in recommendations"
              :key="recommendation.id"
              class="recommendation-card"
              :class="recommendation.priority"
            >
              <div class="recommendation-header">
                <div class="recommendation-title">{{ recommendation.title }}</div>
                <div class="recommendation-meta">
                  <el-tag :type="getPriorityTagType(recommendation.priority)" size="small">
                    {{ recommendation.priority }}
                  </el-tag>
                  <el-tag type="info" size="small">
                    置信度: {{ Math.round(recommendation.confidence * 100) }}%
                  </el-tag>
                </div>
              </div>
              <div class="recommendation-content">
                <p>{{ recommendation.description }}</p>
                <div v-if="recommendation.impact" class="impact-info">
                  <div class="impact-item" v-if="recommendation.impact.revenue">
                    <span class="label">预期收入:</span>
                    <span class="value">+¥{{ recommendation.impact.revenue.toLocaleString() }}</span>
                  </div>
                  <div class="impact-item" v-if="recommendation.impact.cost_savings">
                    <span class="label">成本节约:</span>
                    <span class="value">¥{{ recommendation.impact.cost_savings.toLocaleString() }}</span>
                  </div>
                </div>
              </div>
              <div class="recommendation-actions">
                <el-button-group size="small">
                  <el-button type="success" @click="implementRecommendation(recommendation)">
                    实施
                  </el-button>
                  <el-button @click="viewRecommendationDetail(recommendation)">
                    详情
                  </el-button>
                  <el-button type="danger" @click="rejectRecommendation(recommendation)">
                    忽略
                  </el-button>
                </el-button-group>
              </div>
            </el-card>
          </div>
        </div>
      </el-tab-pane>

      <!-- 预测分析 -->
      <el-tab-pane label="预测分析" name="predictions">
        <div class="predictions">
          <div class="prediction-controls">
            <el-select
              v-model="predictionConfig.type"
              placeholder="预测类型"
              style="width: 150px;"
            >
              <el-option label="销售预测" value="sales" />
              <el-option label="客流量预测" value="traffic" />
              <el-option label="库存预测" value="inventory" />
              <el-option label="收入预测" value="revenue" />
            </el-select>
            <el-select
              v-model="predictionConfig.timeHorizon"
              placeholder="时间范围"
              style="width: 120px; margin-left: 10px;"
            >
              <el-option label="7天" value="7d" />
              <el-option label="30天" value="30d" />
              <el-option label="90天" value="90d" />
            </el-select>
            <el-button type="primary" style="margin-left: 10px;" @click="generatePrediction">
              <el-icon><TrendCharts /></el-icon>
              生成预测
            </el-button>
          </div>
          <div v-if="currentPrediction" class="prediction-result">
            <div class="prediction-header">
              <h3>{{ currentPrediction.title }}</h3>
              <div class="prediction-meta">
                <el-tag type="info">模型: {{ currentPrediction.model }}</el-tag>
                <el-tag type="success">准确率: {{ Math.round(currentPrediction.accuracy * 100) }}%</el-tag>
              </div>
            </div>
            <div class="prediction-chart">
              <PredictionChart :data="currentPrediction" />
            </div>
            <div class="prediction-insights">
              <h4>关键因素</h4>
              <div class="factors-list">
                <div
                  v-for="factor in currentPrediction.key_factors"
                  :key="factor.factor"
                  class="factor-item"
                >
                  <div class="factor-name">{{ factor.factor }}</div>
                  <div class="factor-importance">重要性: {{ Math.round(factor.importance * 100) }}%</div>
                  <el-tag :type="factor.trend === 'increasing' ? 'success' : factor.trend === 'decreasing' ? 'danger' : 'info'" size="small">
                    {{ factor.trend === 'increasing' ? '上升' : factor.trend === 'decreasing' ? '下降' : '稳定' }}
                  </el-tag>
                </div>
              </div>
              <h4>建议措施</h4>
              <ul class="recommendations-list">
                <li v-for="rec in currentPrediction.recommendations" :key="rec">{{ rec }}</li>
              </ul>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- AI洞察 -->
      <el-tab-pane label="AI洞察" name="insights">
        <div class="insights">
          <div class="insight-filters">
            <el-select
              v-model="insightFilters.category"
              placeholder="洞察类别"
              style="width: 150px;"
              @change="loadInsights"
            >
              <el-option label="运营洞察" value="operational" />
              <el-option label="财务洞察" value="financial" />
              <el-option label="客户洞察" value="customer" />
              <el-option label="市场洞察" value="market" />
              <el-option label="战略洞察" value="strategic" />
            </el-select>
            <el-button type="primary" style="margin-left: 10px;" @click="loadInsights">
              <el-icon><Refresh /></el-icon>
              刷新洞察
            </el-button>
          </div>
          <div class="insights-grid">
            <div
              v-for="insight in insights"
              :key="insight.id"
              class="insight-card"
              :class="insight.urgency > 0.7 ? 'urgent' : ''"
            >
              <div class="insight-header">
                <div class="insight-category">
                  <el-tag :type="getCategoryTagType(insight.category)">
                    {{ getCategoryLabel(insight.category) }}
                  </el-tag>
                </div>
                <div class="insight-significance">
                  重要性: {{ Math.round(insight.significance * 100) }}%
                </div>
              </div>
              <div class="insight-content">
                <h4>{{ insight.title }}</h4>
                <p>{{ insight.description }}</p>
                <div class="insight-data">
                  <div
                    v-for="dataPoint in insight.data_points"
                    :key="dataPoint.label"
                    class="data-point"
                  >
                    <span class="label">{{ dataPoint.label }}:</span>
                    <span class="value">{{ dataPoint.value }}</span>
                    <span
                      class="change"
                      :class="dataPoint.change > 0 ? 'positive' : dataPoint.change < 0 ? 'negative' : 'neutral'"
                    >
                      {{ dataPoint.change > 0 ? '+' : '' }}{{ dataPoint.change }}%
                    </span>
                  </div>
                </div>
              </div>
              <div class="insight-actions">
                <el-button size="small" @click="exploreInsight(insight)">
                  深入分析
                </el-button>
                <el-button size="small" type="primary" @click="createActionPlan(insight)">
                  制定计划
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 模型状态 -->
      <el-tab-pane label="模型状态" name="models">
        <div class="models">
          <div class="model-status-cards">
            <div
              v-for="model in modelStatus"
              :key="model.model"
              class="model-status-card"
              :class="model.status"
            >
              <div class="model-header">
                <h4>{{ model.model }}</h4>
                <el-tag :type="getModelStatusTagType(model.status)">
                  {{ model.status }}
                </el-tag>
              </div>
              <div class="model-metrics">
                <div class="metric">
                  <span class="label">响应时间:</span>
                  <span class="value">{{ model.response_time }}ms</span>
                </div>
                <div class="metric">
                  <span class="label">准确率:</span>
                  <span class="value">{{ Math.round(model.accuracy * 100) }}%</span>
                </div>
                <div class="metric">
                  <span class="label">今日请求数:</span>
                  <span class="value">{{ model.usage.requests.toLocaleString() }}</span>
                </div>
                <div class="metric">
                  <span class="label">今日消耗:</span>
                  <span class="value">${{ model.usage.cost.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  ArrowUp,
  ArrowDown,
  Minus,
  Position,
  Delete,
  Refresh
} from '@element-plus/icons-vue'
import aiServiceAPI, {
  RecommendationType,
  PredictionType,
  type AIRecommendation,
  type AIPrediction,
  type AIChatSession,
  type AIInsight
} from '@/api/ai-service'
import PredictionChart from '@/components/AI/PredictionChart.vue'

// 响应式数据
const activeTab = ref('chat')
const chatInput = ref('')
const chatLoading = ref(false)
const currentSession = ref<AIChatSession | null>(null)
const chatSessions = ref<AIChatSession[]>([])
const recommendations = ref<AIRecommendation[]>([])
const currentPrediction = ref<AIPrediction | null>(null)
const insights = ref<AIInsight[]>([])
const modelStatus = ref<any[]>([])
const chatMessagesRef = ref<HTMLElement | null>(null)

const recommendationFilters = reactive({
  type: '',
  priority: ''
})

const predictionConfig = reactive({
  type: 'sales',
  timeHorizon: '30d'
})

const insightFilters = reactive({
  category: ''
})

// 用户信息
const userInitial = computed(() => 'A') // 实际项目中从用户信息获取

// AI统计
const aiStats = computed(() => [
  {
    key: 'requests',
    label: '今日请求',
    value: '1,234',
    icon: 'ChatLineSquare',
    type: 'primary',
    trend: 'up',
    change: '+15.3%'
  },
  {
    key: 'accuracy',
    label: '平均准确率',
    value: '94.2%',
    icon: 'Target',
    type: 'success',
    trend: 'up',
    change: '+2.1%'
  },
  {
    key: 'responseTime',
    label: '平均响应时间',
    value: '1.2s',
    icon: 'Timer',
    type: 'warning',
    trend: 'down',
    change: '-0.3s'
  },
  {
    key: 'cost',
    label: '今日成本',
    value: '$12.45',
    icon: 'Money',
    type: 'info',
    trend: 'up',
    change: '+$2.30'
  }
])

// 快捷问题
const quickQuestions = [
  '今日客流预测如何？',
  '哪些菜品需要补货？',
  '如何优化菜单定价？',
  '客户满意度分析',
  '下周营销活动建议'
]

// 方法
const sendMessage = async () => {
  if (!chatInput.value.trim()) return

  chatLoading.value = true
  const userMessage = chatInput.value
  chatInput.value = ''

  try {
    // 添加用户消息到当前会话
    if (!currentSession.value) {
      // 创建新会话
      const response = await aiServiceAPI.chat({
        message: userMessage
      })
      if (response.success && response.data) {
        currentSession.value = {
          id: response.data.session_id,
          title: userMessage.slice(0, 20) + '...',
          messages: [
            {
              id: '1',
              role: 'user',
              content: userMessage,
              timestamp: new Date().toISOString()
            },
            {
              id: '2',
              role: 'assistant',
              content: response.data.response,
              timestamp: new Date().toISOString()
            }
          ],
          context: {
            session_type: 'general'
          },
          created_at: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          status: 'active'
        }
      }
    } else {
      // 添加到现有会话
      const response = await aiServiceAPI.chat({
        message: userMessage,
        session_id: currentSession.value.id
      })
      if (response.success && response.data) {
        currentSession.value.messages.push({
          id: Date.now().toString(),
          role: 'user',
          content: userMessage,
          timestamp: new Date().toISOString()
        })
        currentSession.value.messages.push({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date().toISOString()
        })
        currentSession.value.last_activity = new Date().toISOString()
      }
    }

    await nextTick()
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  } catch (error) {
    ElMessage.error('发送消息失败')
  } finally {
    chatLoading.value = false
  }
}

const askQuickQuestion = (question: string) => {
  chatInput.value = question
  sendMessage()
}

const clearChat = () => {
  currentSession.value = null
}

const switchChatSession = async (sessionId: string) => {
  try {
    const response = await aiServiceAPI.getChatSession(sessionId)
    if (response.success && response.data) {
      currentSession.value = response.data
    }
  } catch (error) {
    ElMessage.error('加载聊天会话失败')
  }
}

const loadChatSessions = async () => {
  try {
    const response = await aiServiceAPI.getChatSessions()
    if (response.success && response.data) {
      chatSessions.value = response.data
    }
  } catch (error) {
    console.error('Load chat sessions failed:', error)
  }
}

const loadRecommendations = async () => {
  try {
    const params: any = {}
    if (recommendationFilters.type) {
      params.type = recommendationFilters.type as RecommendationType
    }
    if (recommendationFilters.priority) {
      params.filters = { priority: recommendationFilters.priority }
    }

    const response = await aiServiceAPI.generateRecommendation(params)
    if (response.success && response.data) {
      recommendations.value = response.data
    }
  } catch (error) {
    console.error('Load recommendations failed:', error)
  }
}

const implementRecommendation = (recommendation: AIRecommendation) => {
  // 实施推荐逻辑
  ElMessage.success(`正在实施推荐: ${recommendation.title}`)
  // 更新推荐状态
  recommendation.status = 'implemented'
}

const viewRecommendationDetail = (recommendation: AIRecommendation) => {
  // 查看推荐详情
  ElMessage.info(`查看详情: ${recommendation.title}`)
}

const rejectRecommendation = (recommendation: AIRecommendation) => {
  // 拒绝推荐
  recommendation.status = 'rejected'
  ElMessage.info(`已忽略推荐: ${recommendation.title}`)
}

const generatePrediction = async () => {
  try {
    const response = await aiServiceAPI.generatePrediction({
      type: predictionConfig.type as PredictionType,
      target: 'business',
      time_horizon: predictionConfig.timeHorizon
    })
    if (response.success && response.data) {
      currentPrediction.value = response.data
      ElMessage.success('预测生成成功')
    }
  } catch (error) {
    ElMessage.error('预测生成失败')
  }
}

const loadInsights = async () => {
  try {
    const params: any = {}
    if (insightFilters.category) {
      params.category = insightFilters.category
    }

    const response = await aiServiceAPI.getInsights(params)
    if (response.success && response.data) {
      insights.value = response.data
    }
  } catch (error) {
    console.error('Load insights failed:', error)
  }
}

const exploreInsight = (insight: AIInsight) => {
  // 深入分析洞察
  ElMessage.info(`深入分析: ${insight.title}`)
}

const createActionPlan = (insight: AIInsight) => {
  // 制定行动计划
  ElMessage.info(`制定计划: ${insight.title}`)
}

const loadModelStatus = async () => {
  try {
    const response = await aiServiceAPI.getModelStatus()
    if (response.success && response.data) {
      modelStatus.value = response.data
    }
  } catch (error) {
    console.error('Load model status failed:', error)
  }
}

// 工具函数
const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getPriorityTagType = (priority: string) => {
  const typeMap = {
    urgent: 'danger',
    high: 'warning',
    medium: 'info',
    low: 'success'
  }
  return typeMap[priority as keyof typeof typeMap] || 'info'
}

const getCategoryTagType = (category: string) => {
  const typeMap = {
    operational: 'primary',
    financial: 'success',
    customer: 'warning',
    market: 'info',
    strategic: 'danger'
  }
  return typeMap[category as keyof typeof typeMap] || 'info'
}

const getCategoryLabel = (category: string) => {
  const labelMap = {
    operational: '运营',
    financial: '财务',
    customer: '客户',
    market: '市场',
    strategic: '战略'
  }
  return labelMap[category as keyof typeof labelMap] || category
}

const getModelStatusTagType = (status: string) => {
  const typeMap = {
    available: 'success',
    unavailable: 'danger',
    degraded: 'warning'
  }
  return typeMap[status as keyof typeof typeMap] || 'info'
}

// 生命周期
onMounted(() => {
  loadChatSessions()
  loadRecommendations()
  loadInsights()
  loadModelStatus()
})
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.ai-dashboard {
  .ai-overview {
    margin-bottom: $spacing-6;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: $spacing-4;

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          border-radius: $border-radius-lg;

          &.primary {
            background: $primary-light;
            color: $primary-color;
          }

          &.success {
            background: $success-light;
            color: $success-color;
          }

          &.warning {
            background: $warning-light;
            color: $warning-color;
          }

          &.info {
            background: $info-light;
            color: $info-color;
          }
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: $font-size-xl;
            font-weight: $font-weight-bold;
            color: $text-primary;
            margin-bottom: $spacing-1;
          }

          .stat-label {
            font-size: $font-size-sm;
            color: $text-secondary;
            margin-bottom: $spacing-1;
          }

          .stat-trend {
            display: flex;
            align-items: center;
            gap: $spacing-1;
            font-size: $font-size-xs;

            &.up {
              color: $success-color;
            }

            &.down {
              color: $danger-color;
            }

            &.stable {
              color: $text-secondary;
            }
          }
        }
      }
    }
  }

  .ai-tabs {
    background: $white;
    border-radius: $border-radius-base;
    box-shadow: $shadow-sm;
    overflow: hidden;

    :deep(.el-tabs__content) {
      padding: $spacing-6;
    }
  }

  .ai-chat {
    display: flex;
    gap: $spacing-6;
    height: 600px;

    .chat-container {
      flex: 1;
      display: flex;
      flex-direction: column;

      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: $spacing-4;
        background: $gray-50;
        border-radius: $border-radius-base;

        .message {
          display: flex;
          gap: $spacing-3;
          margin-bottom: $spacing-4;

          &.user {
            flex-direction: row-reverse;

            .message-content {
              background: $primary-color;
              color: $white;
              border-radius: $border-radius-lg $border-radius-lg 0 $border-radius-lg;
            }
          }

          &.assistant {
            .message-content {
              background: $white;
              border: 1px solid $border-primary;
              border-radius: $border-radius-lg $border-radius-lg $border-radius-lg 0;
            }
          }

          .message-content {
            max-width: 70%;
            padding: $spacing-3;

            .message-text {
              margin-bottom: $spacing-2;
              line-height: 1.5;
            }

            .message-time {
              font-size: $font-size-xs;
              opacity: 0.7;
            }
          }
        }
      }

      .chat-input {
        border-top: 1px solid $border-primary;
        padding: $spacing-4;
        background: $white;

        .chat-actions {
          display: flex;
          gap: $spacing-2;
          margin-top: $spacing-3;
          justify-content: flex-end;
        }
      }
    }

    .chat-sidebar {
      width: 300px;
      background: $white;
      border-radius: $border-radius-base;
      padding: $spacing-4;
      border: 1px solid $border-primary;

      .sidebar-section {
        margin-bottom: $spacing-6;

        h4 {
          margin-bottom: $spacing-3;
          color: $text-primary;
        }

        .quick-questions {
          display: flex;
          flex-direction: column;
          gap: $spacing-2;

          .el-button {
            text-align: left;
            white-space: normal;
            height: auto;
            padding: $spacing-2;
          }
        }

        .chat-history {
          .history-item {
            padding: $spacing-2;
            border-radius: $border-radius-sm;
            cursor: pointer;
            transition: background-color 0.2s ease;

            &:hover {
              background: $gray-50;
            }

            &.active {
              background: $primary-light;
              color: $primary-color;
            }

            .history-title {
              font-weight: $font-weight-medium;
              margin-bottom: $spacing-1;
            }

            .history-time {
              font-size: $font-size-xs;
              color: $text-secondary;
            }
          }
        }
      }
    }
  }

  .recommendations {
    .recommendation-filters {
      margin-bottom: $spacing-6;
      padding: $spacing-4;
      background: $white;
      border-radius: $border-radius-base;
      box-shadow: $shadow-sm;
    }

    .recommendation-list {
      .recommendation-card {
        margin-bottom: $spacing-4;
        border-left: 4px solid $info-color;

        &.urgent {
          border-left-color: $danger-color;
        }

        .recommendation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: $spacing-3;

          .recommendation-title {
            font-weight: $font-weight-bold;
            color: $text-primary;
          }

          .recommendation-meta {
            display: flex;
            gap: $spacing-2;
          }
        }

        .recommendation-content {
          margin-bottom: $spacing-4;

          .impact-info {
            margin-top: $spacing-3;
            padding: $spacing-3;
            background: $gray-50;
            border-radius: $border-radius-sm;

            .impact-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: $spacing-1;

              .label {
                font-weight: $font-weight-medium;
              }

              .value {
                color: $success-color;
                font-weight: $font-weight-bold;
              }
            }
          }
        }

        .recommendation-actions {
          text-align: right;
        }
      }
    }
  }

  .predictions {
    .prediction-controls {
      margin-bottom: $spacing-6;
      padding: $spacing-4;
      background: $white;
      border-radius: $border-radius-base;
      box-shadow: $shadow-sm;
    }

    .prediction-result {
      .prediction-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: $spacing-4;

        h3 {
          margin: 0;
          color: $text-primary;
        }

        .prediction-meta {
          display: flex;
          gap: $spacing-2;
        }
      }

      .prediction-chart {
        margin-bottom: $spacing-6;
        height: 400px;
      }

      .prediction-insights {
        h4 {
          margin-bottom: $spacing-3;
          color: $text-primary;
        }

        .factors-list {
          margin-bottom: $spacing-4;

          .factor-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: $spacing-2;
            background: $gray-50;
            border-radius: $border-radius-sm;
            margin-bottom: $spacing-2;

            .factor-name {
              font-weight: $font-weight-medium;
            }

            .factor-importance {
              font-size: $font-size-sm;
              color: $text-secondary;
            }
          }
        }

        .recommendations-list {
          padding-left: $spacing-4;

          li {
            margin-bottom: $spacing-1;
            color: $text-secondary;
          }
        }
      }
    }
  }

  .insights {
    .insight-filters {
      margin-bottom: $spacing-6;
      padding: $spacing-4;
      background: $white;
      border-radius: $border-radius-base;
      box-shadow: $shadow-sm;
    }

    .insights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: $spacing-4;

      .insight-card {
        background: $white;
        border-radius: $border-radius-base;
        padding: $spacing-4;
        box-shadow: $shadow-sm;
        border-left: 4px solid $info-color;

        &.urgent {
          border-left-color: $danger-color;
        }

        .insight-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: $spacing-3;

          .insight-significance {
            font-size: $font-size-sm;
            color: $text-secondary;
          }
        }

        .insight-content {
          margin-bottom: $spacing-4;

          h4 {
            margin-bottom: $spacing-2;
            color: $text-primary;
          }

          .insight-data {
            margin: $spacing-3 0;

            .data-point {
              display: flex;
              gap: $spacing-2;
              margin-bottom: $spacing-1;
              font-size: $font-size-sm;

              .label {
                color: $text-secondary;
              }

              .value {
                font-weight: $font-weight-medium;
                color: $text-primary;
              }

              .change {
                font-weight: $font-weight-bold;

                &.positive {
                  color: $success-color;
                }

                &.negative {
                  color: $danger-color;
                }

                &.neutral {
                  color: $text-secondary;
                }
              }
            }
          }
        }

        .insight-actions {
          display: flex;
          gap: $spacing-2;
        }
      }
    }
  }

  .models {
    .model-status-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: $spacing-4;

      .model-status-card {
        background: $white;
        border-radius: $border-radius-base;
        padding: $spacing-4;
        box-shadow: $shadow-sm;

        &.available {
          border-left: 4px solid $success-color;
        }

        &.unavailable {
          border-left: 4px solid $danger-color;
        }

        &.degraded {
          border-left: 4px solid $warning-color;
        }

        .model-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: $spacing-3;

          h4 {
            margin: 0;
            color: $text-primary;
          }
        }

        .model-metrics {
          .metric {
            display: flex;
            justify-content: space-between;
            margin-bottom: $spacing-2;

            .label {
              color: $text-secondary;
              font-size: $font-size-sm;
            }

            .value {
              font-weight: $font-weight-medium;
              color: $text-primary;
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: $breakpoint-md) {
  .ai-dashboard {
    .ai-chat {
      flex-direction: column;
      height: auto;

      .chat-sidebar {
        width: 100%;
        margin-top: $spacing-4;
      }
    }

    .insights-grid {
      grid-template-columns: 1fr;
    }

    .model-status-cards {
      grid-template-columns: 1fr;
    }
  }
}

// 深色主题支持
@media (prefers-color-scheme: dark) {
  .ai-dashboard {
    .ai-tabs {
      background: $dark-bg-secondary;
    }

    .chat-messages {
      background: $dark-bg-tertiary;
    }

    .recommendation-card,
    .insight-card,
    .model-status-card {
      background: $dark-bg-secondary;
      border-color: $dark-border-primary;
    }
  }
}
</style>