<template>
  <div class="conversation-interface">
    <!-- 对话头部 -->
    <div class="conversation-header">
      <div class="header-left">
        <div class="assistant-info">
          <el-avatar :size="40" :src="assistant?.avatar">
            <el-icon><Avatar /></el-icon>
          </el-avatar>
          <div class="assistant-details">
            <h3>{{ assistant?.name }}</h3>
            <p>{{ assistant?.type }} 助手</p>
          </div>
        </div>
        <div class="conversation-status">
          <el-tag :type="getStatusColor()" size="small">
            {{ getStatusText() }}
          </el-tag>
          <span class="response-time">响应时间: {{ assistant?.performance.responseTime }}ms</span>
        </div>
      </div>
      <div class="header-right">
        <el-button @click="showSettings = !showSettings">
          <el-icon><Setting /></el-icon>
          设置
        </el-button>
        <el-button type="primary" @click="endConversation">
          结束对话
        </el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="conversation-main">
      <!-- 设置面板 -->
      <div v-if="showSettings" class="settings-panel">
        <el-card>
          <template #header>
            <div class="settings-header">
              <h4>对话设置</h4>
              <el-button type="text" @click="showSettings = false">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </template>

          <el-form :model="conversationSettings" label-width="100px">
            <el-form-item label="响应风格">
              <el-select v-model="conversationSettings.responseStyle" style="width: 100%">
                <el-option label="简洁" value="concise" />
                <el-option label="详细" value="detailed" />
                <el-option label="结构化" value="structured" />
                <el-option label="对话式" value="conversational" />
              </el-select>
            </el-form-item>

            <el-form-item label="响应长度">
              <el-radio-group v-model="conversationSettings.responseLength">
                <el-radio label="short">简短</el-radio>
                <el-radio label="medium">中等</el-radio>
                <el-radio label="long">详细</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="包含示例">
              <el-switch v-model="conversationSettings.includeExamples" />
            </el-form-item>

            <el-form-item label="主动协助">
              <el-switch v-model="conversationSettings.proactiveAssistance" />
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <!-- 消息区域 -->
      <div class="messages-container" ref="messagesContainer">
        <div
          v-for="message in messages"
          :key="message.id"
          class="message-item"
          :class="{ 'user-message': message.sender === 'user', 'assistant-message': message.sender === 'assistant' }"
        >
          <div class="message-avatar">
            <el-avatar v-if="message.sender === 'user'" :size="32">
              <el-icon><User /></el-icon>
            </el-avatar>
            <el-avatar v-else :size="32" :src="assistant?.avatar">
              <el-icon><Avatar /></el-icon>
            </el-avatar>
          </div>

          <div class="message-content">
            <div class="message-header">
              <span class="message-sender">
                {{ message.sender === 'user' ? '我' : assistant?.name }}
              </span>
              <span class="message-time">{{ formatTime(message.metadata.timestamp) }}</span>
            </div>

            <div class="message-body">
              <!-- 文本消息 -->
              <div v-if="message.type === 'text'" class="text-content">
                {{ message.content }}
              </div>

              <!-- 代码消息 -->
              <div v-else-if="message.type === 'code'" class="code-content">
                <pre><code>{{ message.content }}</code></pre>
                <el-button size="small" type="primary" plain @click="copyCode(message.content)">
                  复制代码
                </el-button>
              </div>

              <!-- 表格消息 -->
              <div v-else-if="message.type === 'table'" class="table-content">
                <el-table :data="parseTableData(message.content)" size="small" stripe>
                  <el-table-column
                    v-for="column in getTableColumns(message.content)"
                    :key="column.prop"
                    :prop="column.prop"
                    :label="column.label"
                  />
                </el-table>
              </div>

              <!-- 附件消息 -->
              <div v-else-if="message.metadata.attachments" class="attachments-content">
                <div
                  v-for="attachment in message.metadata.attachments"
                  :key="attachment.url"
                  class="attachment-item"
                >
                  <el-icon><Document /></el-icon>
                  <span>{{ attachment.name }}</span>
                  <el-button size="small" type="text">下载</el-button>
                </div>
              </div>
            </div>

            <!-- 消息操作 -->
            <div class="message-actions">
              <el-button-group size="small">
                <el-button type="text" @click="reactToMessage(message, 'like')">
                  <el-icon><Thumb /></el-icon>
                  {{ getMessageReactions(message, 'like') }}
                </el-button>
                <el-button type="text" @click="reactToMessage(message, 'dislike')">
                  <el-icon><Close /></el-icon>
                </el-button>
                <el-button type="text" @click="copyMessage(message.content)">
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
                <el-button type="text" @click="regenerateResponse(message)">
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </el-button-group>
            </div>
          </div>
        </div>

        <!-- 正在输入指示器 -->
        <div v-if="isTyping" class="typing-indicator">
          <div class="typing-avatar">
            <el-avatar :size="32" :src="assistant?.avatar">
              <el-icon><Avatar /></el-icon>
            </el-avatar>
          </div>
          <div class="typing-content">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span class="typing-text">{{ assistant?.name }} 正在输入...</span>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-container">
        <div class="input-toolbar">
          <el-upload
            :auto-upload="false"
            :show-file-list="false"
            accept="image/*,document/*"
            multiple
            @change="handleFileUpload"
          >
            <el-button size="small" type="text">
              <el-icon><Paperclip /></el-icon>
              附件
            </el-button>
          </el-upload>

          <el-button size="small" type="text" @click="insertCodeBlock">
            <el-icon><Code /></el-icon>
            代码
          </el-button>

          <el-button size="small" type="text" @click="insertTable">
            <el-icon><Grid /></el-icon>
            表格
          </el-button>

          <el-button size="small" type="text" @click="clearConversation">
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
        </div>

        <div class="input-area">
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="inputRows"
            placeholder="输入消息... (Shift+Enter 换行, Enter 发送)"
            @keydown="handleInputKeydown"
            @input="handleInputChange"
          />
          <div class="input-actions">
            <el-button @click="clearInput">清空</el-button>
            <el-button
              type="primary"
              :loading="sending"
              :disabled="!inputMessage.trim()"
              @click="sendMessage"
            >
              发送
            </el-button>
          </div>
        </div>

        <!-- 输入建议 -->
        <div v-if="suggestions.length > 0" class="suggestions-bar">
          <div class="suggestions-title">建议回复:</div>
          <div class="suggestions-list">
            <el-button
              v-for="(suggestion, index) in suggestions"
              :key="index"
              size="small"
              type="text"
              @click="useSuggestion(suggestion)"
            >
              {{ suggestion }}
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 对话信息侧边栏 -->
    <div class="conversation-sidebar" v-if="showSidebar">
      <el-card>
        <template #header>
          <div class="sidebar-header">
            <h4>对话信息</h4>
            <el-button type="text" @click="showSidebar = false">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </template>

        <div class="sidebar-content">
          <div class="info-section">
            <h5>基本信息</h5>
            <div class="info-item">
              <span class="info-label">对话ID:</span>
              <span class="info-value">{{ conversationId }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">开始时间:</span>
              <span class="info-value">{{ formatTime(conversationStartTime) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">消息数量:</span>
              <span class="info-value">{{ messages.length }}</span>
            </div>
          </div>

          <div class="info-section">
            <h5>性能统计</h5>
            <div class="info-item">
              <span class="info-label">平均响应时间:</span>
              <span class="info-value">{{ avgResponseTime }}ms</span>
            </div>
            <div class="info-item">
              <span class="info-label">满意度:</span>
              <el-rate v-model="satisfaction" size="small" @change="rateConversation" />
            </div>
          </div>

          <div class="info-section">
            <h5>快捷操作</h5>
            <div class="action-buttons">
              <el-button size="small" @click="exportConversation">导出对话</el-button>
              <el-button size="small" @click="shareConversation">分享对话</el-button>
              <el-button size="small" @click="saveTemplate">保存模板</el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 侧边栏切换按钮 -->
    <div class="sidebar-toggle" @click="showSidebar = !showSidebar">
      <el-icon>
        <ArrowRight v-if="!showSidebar" />
        <ArrowLeft v-else />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Avatar, User, Setting, Close, DocumentCopy, Refresh,
  Paperclip, Grid, Delete, ArrowRight, ArrowLeft, Document
} from '@element-plus/icons-vue'
import { aiAssistantAPI } from '@/api/ai-assistant'
import type { AIAssistant, ConversationMessage, Conversation } from '@/api/ai-assistant'

// Props
interface Props {
  assistant: AIAssistant | null
}
const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
}>()

// 响应式数据
const showSettings = ref(false)
const showSidebar = ref(false)
const isTyping = ref(false)
const sending = ref(false)
const inputMessage = ref('')
const inputRows = ref(1)
const messages = ref<ConversationMessage[]>([])
const suggestions = ref<string[]>([])
const conversationId = ref('')
const conversationStartTime = ref(new Date())
const satisfaction = ref(0)
const avgResponseTime = ref(0)

const messagesContainer = ref<HTMLElement>()

const conversationSettings = reactive({
  responseStyle: props.assistant?.personality.responseStyle || 'conversational',
  responseLength: props.assistant?.preferences.responseLength || 'medium',
  includeExamples: props.assistant?.preferences.includeExamples || false,
  proactiveAssistance: props.assistant?.preferences.proactiveAssistance || false
})

// 生命周期
onMounted(() => {
  initializeConversation()
  scrollToBottom()
})

// 监听消息变化
watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })

// 方法
const initializeConversation = async () => {
  try {
    const response = await aiAssistantAPI.startConversation({
      title: `与${props.assistant?.name}的对话`,
      type: 'chat',
      participant: {
        userId: 'current-user',
        assistantId: props.assistant?.id || '',
        userName: '当前用户',
        assistantName: props.assistant?.name || ''
      },
      context: {
        domain: 'general',
        purpose: 'general_assistance',
        background: '用户寻求AI助手帮助',
        constraints: [],
        objectives: []
      }
    })

    if (response.success && response.data) {
      conversationId.value = response.data.id
      conversationStartTime.value = new Date(response.data.createdAt)

      // 添加欢迎消息
      addMessage({
        id: `welcome_${Date.now()}`,
        conversationId: conversationId.value,
        sender: 'assistant',
        content: `您好！我是${props.assistant?.name}，很高兴为您提供帮助。我可以协助您进行数据分析、问题解决、决策支持等工作。请问有什么可以帮助您的吗？`,
        type: 'text',
        metadata: {
          timestamp: new Date().toISOString(),
          confidence: 1.0,
          processingTime: 500
        },
        reactions: []
      })
    }
  } catch (error) {
    console.error('Initialize conversation failed:', error)
    ElMessage.error('初始化对话失败')
  }
}

const addMessage = (message: ConversationMessage) => {
  messages.value.push(message)
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const handleInputKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const handleInputChange = () => {
  // 自动调整输入框高度
  const lines = inputMessage.value.split('\n').length
  inputRows.value = Math.min(Math.max(lines, 1), 5)

  // 生成建议
  if (inputMessage.value.trim().length > 0) {
    generateSuggestions()
  } else {
    suggestions.value = []
  }
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || sending.value) return

  const userMessage: ConversationMessage = {
    id: `user_${Date.now()}`,
    conversationId: conversationId.value,
    sender: 'user',
    content: inputMessage.value,
    type: 'text',
    metadata: {
      timestamp: new Date().toISOString()
    },
    reactions: []
  }

  addMessage(userMessage)

  const messageContent = inputMessage.value
  inputMessage.value = ''
  inputRows.value = 1
  suggestions.value = []

  try {
    sending.value = true
    isTyping.value = true

    const response = await aiAssistantAPI.sendMessage(conversationId.value, {
      content: messageContent,
      type: 'text'
    })

    if (response.success && response.data) {
      addMessage(response.data)
      updatePerformanceMetrics(response.data.metadata)
    } else {
      ElMessage.error('发送消息失败')
    }
  } catch (error) {
    console.error('Send message failed:', error)
    ElMessage.error('发送消息失败')
  } finally {
    sending.value = false
    isTyping.value = false
  }
}

const generateSuggestions = () => {
  // 模拟智能建议生成
  const suggestionsList = [
    '能详细解释一下吗？',
    '有什么相关的例子吗？',
    '这个方案有什么优缺点？',
    '可以提供更多细节吗？',
    '有没有其他替代方案？'
  ]

  suggestions.value = suggestionsList.slice(0, 3)
}

const useSuggestion = (suggestion: string) => {
  inputMessage.value = suggestion
  generateSuggestions()
}

const reactToMessage = (message: ConversationMessage, reaction: string) => {
  // 实现消息反应
  ElMessage.info('消息反应功能开发中')
}

const copyMessage = (content: string) => {
  navigator.clipboard.writeText(content)
  ElMessage.success('已复制到剪贴板')
}

const copyCode = (code: string) => {
  navigator.clipboard.writeText(code)
  ElMessage.success('代码已复制')
}

const regenerateResponse = (message: ConversationMessage) => {
  ElMessage.info('重新生成响应功能开发中')
}

const handleFileUpload = (file: any) => {
  ElMessage.info('文件上传功能开发中')
}

const insertCodeBlock = () => {
  inputMessage.value += '\n```\n// 在这里输入代码\n```\n'
}

const insertTable = () => {
  inputMessage.value += '\n| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 数据 | 数据 | 数据 |\n'
}

const clearConversation = () => {
  ElMessageBox.confirm('确定要清空对话历史吗？', '确认清空', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    messages.value = []
    ElMessage.success('对话历史已清空')
  })
}

const clearInput = () => {
  inputMessage.value = ''
  inputRows.value = 1
  suggestions.value = []
}

const getStatusColor = () => {
  return props.assistant?.status === 'active' ? 'success' : 'info'
}

const getStatusText = () => {
  return props.assistant?.status === 'active' ? '在线' : '离线'
}

const formatTime = (time: string | Date) => {
  const date = new Date(time)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const parseTableData = (content: string) => {
  // 简单的表格解析
  const lines = content.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split('|').map(h => h.trim()).filter(h => h)
  const data = lines.slice(2).map(line => {
    const values = line.split('|').map(v => v.trim()).filter(v => v)
    const row: any = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    return row
  })

  return data
}

const getTableColumns = (content: string) => {
  const lines = content.split('\n').filter(line => line.trim())
  if (lines.length === 0) return []

  const headers = lines[0].split('|').map(h => h.trim()).filter(h => h)
  return headers.map(header => ({ prop: header, label: header }))
}

const getMessageReactions = (message: ConversationMessage, type: string) => {
  return message.reactions.filter(r => r.type === type).length
}

const updatePerformanceMetrics = (metadata: any) => {
  if (metadata.responseTime) {
    avgResponseTime.value = Math.round(
      (avgResponseTime.value + metadata.responseTime) / 2
    )
  }
}

const rateConversation = (rating: number) => {
  ElMessage.success(`感谢您的评分：${rating}星`)
}

const endConversation = () => {
  ElMessageBox.confirm('确定要结束对话吗？', '确认结束', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    emit('close')
  })
}

const exportConversation = () => {
  ElMessage.info('导出对话功能开发中')
}

const shareConversation = () => {
  ElMessage.info('分享对话功能开发中')
}

const saveTemplate = () => {
  ElMessage.info('保存模板功能开发中')
}
</script>

<style lang="scss" scoped>
.conversation-interface {
  display: flex;
  flex-direction: column;
  height: 80vh;
  background: white;
  border-radius: 12px;
  overflow: hidden;

  .conversation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e4e7ed;
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);

    .header-left {
      display: flex;
      align-items: center;
      gap: 24px;

      .assistant-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .assistant-details {
          h3 {
            margin: 0 0 4px 0;
            font-size: 18px;
            font-weight: 600;
            color: #303133;
          }

          p {
            margin: 0;
            font-size: 14px;
            color: #909399;
          }
        }
      }

      .conversation-status {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;

        .response-time {
          font-size: 12px;
          color: #606266;
        }
      }
    }

    .header-right {
      display: flex;
      gap: 12px;
    }
  }

  .conversation-main {
    display: flex;
    flex: 1;
    position: relative;
    overflow: hidden;

    .settings-panel {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 10;
      background: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

      .settings-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
      }
    }

    .messages-container {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background: #fafbfc;

      .message-item {
        display: flex;
        margin-bottom: 20px;
        max-width: 80%;

        &.user-message {
          margin-left: auto;
          flex-direction: row-reverse;

          .message-content {
            background: #409eff;
            color: white;
            border-radius: 18px 4px 18px 18px;
          }
        }

        &.assistant-message {
          .message-content {
            background: white;
            color: #303133;
            border-radius: 4px 18px 18px 18px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
        }

        .message-avatar {
          margin: 0 12px;
          flex-shrink: 0;
        }

        .message-content {
          flex: 1;
          padding: 12px 16px;

          .message-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            font-size: 12px;
            opacity: 0.8;

            .message-sender {
              font-weight: 600;
            }
          }

          .message-body {
            line-height: 1.6;

            .text-content {
              white-space: pre-wrap;
              word-wrap: break-word;
            }

            .code-content {
              background: #f5f7fa;
              border-radius: 8px;
              padding: 12px;
              margin-bottom: 8px;

              pre {
                margin: 0;
                white-space: pre-wrap;
                font-family: 'Courier New', monospace;
                font-size: 13px;
                line-height: 1.4;
              }
            }

            .table-content {
              margin-top: 8px;
            }

            .attachments-content {
              .attachment-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px;
                background: #f8f9fa;
                border-radius: 6px;
                margin-bottom: 6px;

                span {
                  flex: 1;
                  font-size: 13px;
                }
              }
            }
          }

          .message-actions {
            margin-top: 12px;
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          &:hover .message-actions {
            opacity: 1;
          }
        }
      }

      .typing-indicator {
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 80%;

        .typing-content {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: white;
          border-radius: 4px 18px 18px 18px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

          .typing-dots {
            display: flex;
            gap: 4px;

            span {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: #909399;
              animation: typing 1.4s infinite ease-in-out;

              &:nth-child(1) { animation-delay: -0.32s; }
              &:nth-child(2) { animation-delay: -0.16s; }
            }
          }

          .typing-text {
            font-size: 14px;
            color: #606266;
          }
        }
      }
    }

    .input-container {
      border-top: 1px solid #e4e7ed;
      background: white;

      .input-toolbar {
        display: flex;
        gap: 8px;
        padding: 12px 20px;
        border-bottom: 1px solid #f0f0f0;
      }

      .input-area {
        display: flex;
        flex-direction: column;
        padding: 16px 20px;

        .el-textarea {
          margin-bottom: 12px;
        }

        .input-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
      }

      .suggestions-bar {
        padding: 12px 20px;
        border-top: 1px solid #f0f0f0;
        background: #f8f9fa;

        .suggestions-title {
          font-size: 12px;
          color: #606266;
          margin-bottom: 8px;
        }

        .suggestions-list {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
      }
    }
  }

  .conversation-sidebar {
    width: 300px;
    border-left: 1px solid #e4e7ed;
    background: #fafbfc;
    overflow-y: auto;

    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }

    .sidebar-content {
      .info-section {
        margin-bottom: 24px;

        h5 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #303133;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 13px;

          .info-label {
            color: #606266;
          }

          .info-value {
            color: #303133;
            font-weight: 500;
          }
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;

          .el-button {
            width: 100%;
          }
        }
      }
    }
  }

  .sidebar-toggle {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 32px;
    height: 64px;
    background: white;
    border: 1px solid #e4e7ed;
    border-left: none;
    border-radius: 8px 0 0 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
    z-index: 5;

    &:hover {
      background: #f8f9fa;
    }
  }
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>