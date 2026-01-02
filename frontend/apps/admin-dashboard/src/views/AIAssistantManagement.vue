<template>
  <div class="ai-assistant-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>AI助手管理中心</h1>
        <p>智能协作助手管理与对话系统</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateAssistantDialog = true">
          <el-icon><Plus /></el-icon>
          创建助手
        </el-button>
        <el-button @click="showCollaborationDialog = true">
          <el-icon><Connection /></el-icon>
          协作增强
        </el-button>
      </div>
    </div>

    <!-- 助手概览 -->
    <div class="assistant-overview">
      <el-card class="overview-card">
        <div class="overview-grid">
          <div class="overview-item">
            <div class="item-icon total">
              <el-icon><Avatar /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-value">{{ assistantStats.total }}</div>
              <div class="item-label">AI助手总数</div>
            </div>
          </div>

          <div class="overview-item">
            <div class="item-icon active">
              <el-icon><SuccessFilled /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-value">{{ assistantStats.active }}</div>
              <div class="item-label">活跃助手</div>
            </div>
          </div>

          <div class="overview-item">
            <div class="item-icon conversations">
              <el-icon><ChatDotRound /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-value">{{ assistantStats.totalConversations }}</div>
              <div class="item-label">总对话数</div>
            </div>
          </div>

          <div class="overview-item">
            <div class="item-icon satisfaction">
              <el-icon><Star /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-value">{{ assistantStats.avgSatisfaction }}%</div>
              <div class="item-label">平均满意度</div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 主要内容区域 -->
    <el-row :gutter="20">
      <!-- 助手列表 -->
      <el-col :span="16">
        <el-card class="assistants-card">
          <div class="card-header">
            <h3>AI助手列表</h3>
            <div class="header-controls">
              <el-select
                v-model="filters.type"
                placeholder="助手类型"
                clearable
                @change="loadAssistants"
              >
                <el-option label="全部" value="" />
                <el-option label="通用助手" :value="AssistantType.GENERAL" />
                <el-option label="专业助手" :value="AssistantType.SPECIALIZED" />
                <el-option label="上下文助手" :value="AssistantType.CONTEXTUAL" />
                <el-option label="协作助手" :value="AssistantType.COLLABORATIVE" />
                <el-option label="分析助手" :value="AssistantType.ANALYTICAL" />
                <el-option label="创意助手" :value="AssistantType.CREATIVE" />
              </el-select>
              <el-button @click="loadAssistants">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </div>

          <div class="assistants-grid">
            <div
              v-for="assistant in assistants"
              :key="assistant.id"
              class="assistant-card"
              :class="{ 'active-assistant': assistant.status === AssistantStatus.ACTIVE }"
              @click="selectAssistant(assistant)"
            >
              <div class="assistant-header">
                <div class="assistant-avatar">
                  <el-avatar :size="50" :src="assistant.avatar">
                    <el-icon><Avatar /></el-icon>
                  </el-avatar>
                  <div class="status-indicator" :class="assistant.status"></div>
                </div>
                <div class="assistant-info">
                  <h4>{{ assistant.name }}</h4>
                  <el-tag :type="getAssistantTypeColor(assistant.type)" size="small">
                    {{ getAssistantTypeText(assistant.type) }}
                  </el-tag>
                </div>
              </div>

              <div class="assistant-capabilities">
                <div class="capabilities-title">核心能力</div>
                <div class="capabilities-list">
                  <el-tooltip
                    v-for="capability in assistant.capabilities.slice(0, 3)"
                    :key="capability.id"
                    :content="`${capability.name} (${capability.proficiency}%)`"
                    placement="top"
                  >
                    <div class="capability-item">
                      <div class="capability-name">{{ capability.name }}</div>
                      <div class="capability-bar">
                        <div
                          class="capability-progress"
                          :style="{ width: `${capability.proficiency}%` }"
                        ></div>
                      </div>
                    </div>
                  </el-tooltip>
                </div>
              </div>

              <div class="assistant-performance">
                <div class="performance-item">
                  <span class="performance-label">准确率:</span>
                  <span class="performance-value">{{ assistant.performance.accuracy }}%</span>
                </div>
                <div class="performance-item">
                  <span class="performance-label">响应时间:</span>
                  <span class="performance-value">{{ assistant.performance.responseTime }}ms</span>
                </div>
                <div class="performance-item">
                  <span class="performance-label">满意度:</span>
                  <span class="performance-value">{{ assistant.performance.satisfaction }}%</span>
                </div>
              </div>

              <div class="assistant-actions">
                <el-button size="small" type="primary" @click.stop="startConversation(assistant)">
                  开始对话
                </el-button>
                <el-button size="small" @click.stop="editAssistant(assistant)">
                  配置
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 对话历史 -->
      <el-col :span="8">
        <el-card class="conversations-card">
          <div class="card-header">
            <h3>最近对话</h3>
            <el-button size="small" @click="viewAllConversations">
              查看全部
            </el-button>
          </div>

          <div class="conversations-list">
            <div
              v-for="conversation in recentConversations"
              :key="conversation.id"
              class="conversation-item"
              @click="openConversation(conversation)"
            >
              <div class="conversation-header">
                <div class="conversation-title">{{ conversation.title }}</div>
                <el-tag :type="getConversationTypeColor(conversation.type)" size="small">
                  {{ getConversationTypeText(conversation.type) }}
                </el-tag>
              </div>
              <div class="conversation-meta">
                <span class="conversation-participant">{{ conversation.participant.assistantName }}</span>
                <span class="conversation-time">{{ formatTime(conversation.updatedAt) }}</span>
              </div>
              <div class="conversation-preview">
                {{ getLastMessage(conversation) }}
              </div>
            </div>
          </div>
        </el-card>

        <!-- 智能建议 -->
        <el-card class="suggestions-card" style="margin-top: 20px;">
          <div class="card-header">
            <h3>智能建议</h3>
            <el-badge :value="suggestionsCount" class="suggestion-badge">
              <el-button size="small" @click="viewAllSuggestions">
                查看
              </el-button>
            </el-badge>
          </div>

          <div class="suggestions-list">
            <div
              v-for="suggestion in intelligentSuggestions"
              :key="suggestion.id"
              class="suggestion-item"
              :class="suggestion.priority"
            >
              <div class="suggestion-header">
                <div class="suggestion-title">{{ suggestion.title }}</div>
                <el-tag :type="getSuggestionPriorityColor(suggestion.priority)" size="small">
                  {{ getSuggestionPriorityText(suggestion.priority) }}
                </el-tag>
              </div>
              <div class="suggestion-description">{{ suggestion.description }}</div>
              <div class="suggestion-actions">
                <el-button size="small" type="primary" @click="applySuggestion(suggestion)">
                  应用
                </el-button>
                <el-button size="small" @click="dismissSuggestion(suggestion)">
                  忽略
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 创建助手对话框 -->
    <el-dialog
      v-model="showCreateAssistantDialog"
      title="创建AI助手"
      width="70%"
      destroy-on-close
    >
      <CreateAssistant
        v-if="showCreateAssistantDialog"
        @success="handleAssistantCreated"
        @cancel="showCreateAssistantDialog = false"
      />
    </el-dialog>

    <!-- 对话界面 -->
    <el-dialog
      v-model="showConversationDialog"
      :title="`与 ${currentAssistant?.name} 对话`"
      width="90%"
      destroy-on-close
      fullscreen
    >
      <ConversationInterface
        v-if="showConversationDialog"
        :assistant="currentAssistant"
        @close="showConversationDialog = false"
      />
    </el-dialog>

    <!-- 协作增强对话框 -->
    <el-dialog
      v-model="showCollaborationDialog"
      title="协作增强配置"
      width="80%"
      destroy-on-close
    >
      <CollaborationEnhancement
        v-if="showCollaborationDialog"
        @close="showCollaborationDialog = false"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Plus, Connection, Avatar, SuccessFilled, ChatDotRound, Star, Refresh
} from '@element-plus/icons-vue'
import { aiAssistantAPI } from '@/api/ai-assistant'
import type { AIAssistant, AssistantType, AssistantStatus, Conversation, IntelligentSuggestion } from '@/api/ai-assistant'
import CreateAssistant from '@/components/AIAssistant/CreateAssistant.vue'
import ConversationInterface from '@/components/AIAssistant/ConversationInterface.vue'
import CollaborationEnhancement from '@/components/AIAssistant/CollaborationEnhancement.vue'

// 响应式数据
const showCreateAssistantDialog = ref(false)
const showConversationDialog = ref(false)
const showCollaborationDialog = ref(false)
const assistants = ref<AIAssistant[]>([])
const recentConversations = ref<Conversation[]>([])
const intelligentSuggestions = ref<IntelligentSuggestion[]>([])
const currentAssistant = ref<AIAssistant>()

// 过滤器
const filters = reactive({
  type: '' as AssistantType | ''
})

// 统计数据
const assistantStats = ref({
  total: 0,
  active: 0,
  totalConversations: 0,
  avgSatisfaction: 0
})

// 计算属性
const suggestionsCount = computed(() =>
  intelligentSuggestions.value.filter(s => !s.dismissed && !s.applied).length
)

// 生命周期
onMounted(() => {
  loadAssistants()
  loadRecentConversations()
  loadIntelligentSuggestions()
})

// 方法
const loadAssistants = async () => {
  try {
    const response = await aiAssistantAPI.getAssistants({
      type: filters.type || undefined
    })
    if (response.success && response.data) {
      assistants.value = response.data.assistants
      calculateStats()
    }
  } catch (error) {
    console.error('Load assistants failed:', error)
    ElMessage.error('加载AI助手列表失败')
  }
}

const loadRecentConversations = async () => {
  try {
    const response = await aiAssistantAPI.getConversations({
      limit: 10,
      offset: 0
    })
    if (response.success && response.data) {
      recentConversations.value = response.data.conversations
    }
  } catch (error) {
    console.error('Load conversations failed:', error)
  }
}

const loadIntelligentSuggestions = async () => {
  try {
    // 获取第一个活跃助手的建议
    const activeAssistant = assistants.value.find(a => a.status === AssistantStatus.ACTIVE)
    if (activeAssistant) {
      const response = await aiAssistantAPI.getIntelligentSuggestions(activeAssistant.id)
      if (response.success && response.data) {
        intelligentSuggestions.value = response.data.slice(0, 5)
      }
    }
  } catch (error) {
    console.error('Load suggestions failed:', error)
  }
}

const calculateStats = () => {
  const stats = {
    total: assistants.value.length,
    active: assistants.value.filter(a => a.status === AssistantStatus.ACTIVE).length,
    totalConversations: recentConversations.value.length,
    avgSatisfaction: 0
  }

  if (assistants.value.length > 0) {
    const totalSatisfaction = assistants.value.reduce((sum, assistant) =>
      sum + assistant.performance.satisfaction, 0)
    stats.avgSatisfaction = Math.round(totalSatisfaction / assistants.value.length)
  }

  assistantStats.value = stats
}

const selectAssistant = (assistant: AIAssistant) => {
  currentAssistant.value = assistant
}

const startConversation = (assistant: AIAssistant) => {
  currentAssistant.value = assistant
  showConversationDialog.value = true
}

const editAssistant = (assistant: AIAssistant) => {
  ElMessage.info('编辑助手功能开发中')
}

const openConversation = (conversation: Conversation) => {
  ElMessage.info(`打开对话: ${conversation.title}`)
}

const viewAllConversations = () => {
  ElMessage.info('查看全部对话功能开发中')
}

const applySuggestion = async (suggestion: IntelligentSuggestion) => {
  try {
    const response = await aiAssistantAPI.applySuggestion(suggestion.id, suggestion.actions.map(a => a.type))
    if (response.success) {
      suggestion.applied = true
      ElMessage.success('建议已应用')
    }
  } catch (error) {
    console.error('Apply suggestion failed:', error)
    ElMessage.error('应用建议失败')
  }
}

const dismissSuggestion = (suggestion: IntelligentSuggestion) => {
  suggestion.dismissed = true
}

const viewAllSuggestions = () => {
  ElMessage.info('查看全部建议功能开发中')
}

const handleAssistantCreated = () => {
  showCreateAssistantDialog.value = false
  ElMessage.success('AI助手创建成功')
  loadAssistants()
}

// 辅助方法
const getAssistantTypeColor = (type: AssistantType) => {
  const colorMap = {
    [AssistantType.GENERAL]: 'primary',
    [AssistantType.SPECIALIZED]: 'success',
    [AssistantType.CONTEXTUAL]: 'info',
    [AssistantType.COLLABORATIVE]: 'warning',
    [AssistantType.ANALYTICAL]: 'danger',
    [AssistantType.CREATIVE]: 'success'
  }
  return colorMap[type] || 'info'
}

const getAssistantTypeText = (type: AssistantType) => {
  const textMap = {
    [AssistantType.GENERAL]: '通用助手',
    [AssistantType.SPECIALIZED]: '专业助手',
    [AssistantType.CONTEXTUAL]: '上下文助手',
    [AssistantType.COLLABORATIVE]: '协作助手',
    [AssistantType.ANALYTICAL]: '分析助手',
    [AssistantType.CREATIVE]: '创意助手'
  }
  return textMap[type] || type
}

const getConversationTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'chat': 'info',
    'task': 'primary',
    'analysis': 'warning',
    'decision': 'success',
    'learning': 'danger',
    'collaboration': 'success'
  }
  return colorMap[type] || 'info'
}

const getConversationTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    'chat': '日常对话',
    'task': '任务导向',
    'analysis': '分析讨论',
    'decision': '决策支持',
    'learning': '学习辅导',
    'collaboration': '协作工作'
  }
  return textMap[type] || type
}

const getSuggestionPriorityColor = (priority: string) => {
  const colorMap: Record<string, string> = {
    'low': 'info',
    'medium': 'warning',
    'high': 'danger',
    'urgent': 'danger'
  }
  return colorMap[priority] || 'info'
}

const getSuggestionPriorityText = (priority: string) => {
  const textMap: Record<string, string> = {
    'low': '低',
    'medium': '中',
    'high': '高',
    'urgent': '紧急'
  }
  return textMap[priority] || priority
}

const getLastMessage = (conversation: Conversation) => {
  if (conversation.messages.length === 0) return ''
  const lastMessage = conversation.messages[conversation.messages.length - 1]
  return lastMessage.content.length > 50
    ? lastMessage.content.substring(0, 50) + '...'
    : lastMessage.content
}

const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return date.toLocaleDateString()
  }
}
</script>

<style lang="scss" scoped>
.ai-assistant-management {
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

  .assistant-overview {
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
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;

          &.total {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          &.active {
            background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
            color: white;
          }

          &.conversations {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
            color: white;
          }

          &.satisfaction {
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

  .assistants-card,
  .conversations-card,
  .suggestions-card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    .card-header {
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

      .header-controls {
        display: flex;
        gap: 12px;
        align-items: center;
      }
    }
  }

  .assistants-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;

    .assistant-card {
      background: white;
      border: 1px solid #e4e7ed;
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      &.active-assistant {
        border-left: 4px solid #67c23a;
        background: linear-gradient(135deg, #fff 0%, #f0f9ff 100%);
      }

      .assistant-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;

        .assistant-avatar {
          position: relative;

          .status-indicator {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 2px solid white;

            &.active {
              background-color: #67c23a;
            }

            &.idle {
              background-color: #909399;
            }

            &.busy {
              background-color: #e6a23c;
            }

            &.training {
              background-color: #409eff;
            }

            &.offline {
              background-color: #c0c4cc;
            }

            &.error {
              background-color: #f56c6c;
            }
          }
        }

        .assistant-info {
          flex: 1;

          h4 {
            margin: 0 0 4px 0;
            font-size: 16px;
            font-weight: 600;
            color: #303133;
          }
        }
      }

      .assistant-capabilities {
        margin-bottom: 16px;

        .capabilities-title {
          font-size: 12px;
          color: #606266;
          margin-bottom: 8px;
        }

        .capabilities-list {
          .capability-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;

            .capability-name {
              font-size: 11px;
              color: #303133;
              min-width: 60px;
            }

            .capability-bar {
              flex: 1;
              height: 4px;
              background: #f0f0f0;
              border-radius: 2px;
              overflow: hidden;

              .capability-progress {
                height: 100%;
                background: linear-gradient(90deg, #409eff 0%, #67c23a 100%);
                transition: width 0.3s ease;
              }
            }
          }
        }
      }

      .assistant-performance {
        display: flex;
        justify-content: space-between;
        margin-bottom: 16px;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 8px;

        .performance-item {
          text-align: center;

          .performance-label {
            font-size: 11px;
            color: #909399;
            display: block;
            margin-bottom: 4px;
          }

          .performance-value {
            font-size: 12px;
            font-weight: 600;
            color: #303133;
          }
        }
      }

      .assistant-actions {
        display: flex;
        gap: 8px;
      }
    }
  }

  .conversations-list {
    max-height: 400px;
    overflow-y: auto;

    .conversation-item {
      padding: 16px;
      background: white;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .conversation-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .conversation-title {
          font-weight: 600;
          color: #303133;
          font-size: 14px;
        }
      }

      .conversation-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        font-size: 12px;
        color: #909399;
      }

      .conversation-preview {
        font-size: 13px;
        color: #606266;
        line-height: 1.4;
      }
    }
  }

  .suggestions-list {
    max-height: 300px;
    overflow-y: auto;

    .suggestion-item {
      padding: 16px;
      background: white;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      margin-bottom: 12px;

      &.high,
      &.urgent {
        border-left: 4px solid #f56c6c;
      }

      &.medium {
        border-left: 4px solid #e6a23c;
      }

      .suggestion-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .suggestion-title {
          font-weight: 600;
          color: #303133;
          font-size: 14px;
        }
      }

      .suggestion-description {
        font-size: 13px;
        color: #606266;
        line-height: 1.4;
        margin-bottom: 12px;
      }

      .suggestion-actions {
        display: flex;
        gap: 8px;
      }
    }
  }

  .suggestion-badge {
    margin-right: 8px;
  }
}

@media (max-width: 768px) {
  .ai-assistant-management {
    padding: 16px;

    .page-header {
      flex-direction: column;
      gap: 16px;
    }

    .overview-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 16px;
    }

    .assistants-grid {
      grid-template-columns: 1fr !important;
    }
  }
}
</style>