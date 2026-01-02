<template>
  <div class="ai-chat-interface">
    <!-- 选项卡导航 -->
    <div class="ai-tab-navigation">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="ai-tab-btn"
        :class="{ 'active': currentTab === tab.id }"
        @click="$emit('tab-change', tab.id)"
      >
        <tab.icon width="16" height="16" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- 聊天内容区域 -->
    <div class="ai-chat-content" ref="chatContentRef">
      <!-- 欢迎信息 -->
      <div v-if="messages.length === 0" class="ai-welcome-message">
        <div class="ai-welcome-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
        </div>
        <h3>欢迎使用YYC³ AI助手</h3>
        <p>我可以帮您解决关于餐饮平台的各种问题，比如：</p>
        <div class="ai-suggestions">
          <button 
            v-for="(suggestion, index) in suggestions" 
            :key="index"
            class="ai-suggestion-btn"
            @click="handleSuggestionClick(suggestion)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            {{ suggestion }}
          </button>
        </div>
      </div>

      <!-- 消息列表 -->
      <div v-else class="ai-messages-list">
        <AIMessageBubble 
          v-for="(message, index) in messages" 
          :key="index"
          :message="message"
          :index="index"
        />
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="ai-chat-input-container">
      <div class="ai-chat-input-wrapper">
        <textarea 
          v-model="inputMessage"
          class="ai-chat-input"
          placeholder="输入您的问题... (Shift+Enter 换行)"
          rows="1"
          @keydown="handleKeyDown"
          ref="inputRef"
        ></textarea>
        
        <div class="ai-input-actions">
          <button 
            class="ai-attach-btn"
            title="附加文件"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
          
          <button 
            class="ai-send-btn"
            @click="sendMessage"
            :disabled="!inputMessage.trim() || isLoading"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- 输入建议 -->
      <div class="ai-input-suggestions" v-if="inputSuggestions.length > 0">
        <span v-for="(suggestion, index) in inputSuggestions" :key="index" class="ai-suggestion-tag">
          {{ suggestion }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import AIMessageBubble from './AIMessageBubble.vue'
import { AIService } from '../services/AIService'

// 定义Props
interface Props {
  currentTab: 'chat' | 'tools' | 'insights' | 'workflows'
}

// 定义Emits
interface Emits {
  'tab-change': [tab: 'chat' | 'tools' | 'insights' | 'workflows']
}

// Props和Emits
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 组件状态
const messages = ref<Array<{
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
  status: 'sending' | 'sent' | 'received' | 'error'
  suggestions?: string[]
}>>([])

const inputMessage = ref('')
const isLoading = ref(false)
const inputRef = ref<HTMLTextAreaElement | null>(null)
const chatContentRef = ref<HTMLDivElement | null>(null)

// 选项卡配置
const tabs = [
  {
    id: 'chat' as const,
    label: '智能对话',
    icon: (props: any) => (
      <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    )
  },
  {
    id: 'tools' as const,
    label: '工具推荐',
    icon: (props: any) => (
      <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    )
  },
  {
    id: 'insights' as const,
    label: '洞察分析',
    icon: (props: any) => (
      <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
      </svg>
    )
  },
  {
    id: 'workflows' as const,
    label: '工作流',
    icon: (props: any) => (
      <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    )
  }
]

// 欢迎建议
const suggestions = [
  '推荐一些热门菜品',
  '如何创建一个新的菜单',
  '查看今日订单统计',
  '帮助设置菜品分类'
]

// 输入建议
const inputSuggestions = ref<string[]>([])

// 自动调整文本框高度
const adjustTextareaHeight = () => {
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
    inputRef.value.style.height = `${Math.min(inputRef.value.scrollHeight, 120)}px`
  }
}

// 键盘事件处理
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
  adjustTextareaHeight()
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  const content = inputMessage.value.trim()
  inputMessage.value = ''
  
  // 添加用户消息
  const userMessage = {
    id: `user-${Date.now()}`,
    content,
    sender: 'user' as const,
    timestamp: new Date(),
    status: 'sent' as const
  }
  messages.value.push(userMessage)
  
  // 滚动到底部
  scrollToBottom()
  
  try {
    isLoading.value = true
    
    // 调用AI服务（使用模拟的userId）
    const aiService = AIService.getInstance()
    const aiResponse = await aiService.processMessage(content, 'mock-user-id')
    
    // 添加AI回复
    const aiMessage = {
      id: `ai-${Date.now()}`,
      content: aiResponse,
      sender: 'ai' as const,
      timestamp: new Date(),
      status: 'received' as const,
      suggestions: ['继续提问', '查看详情', '分享']
    }
    messages.value.push(aiMessage)
    
    // 滚动到底部
    scrollToBottom()
  } catch (error) {
    console.error('AI服务错误:', error)
    
    // 添加错误消息
    const errorMessage = {
      id: `ai-error-${Date.now()}`,
      content: '抱歉，我暂时无法回答您的问题。请稍后重试。',
      sender: 'ai' as const,
      timestamp: new Date(),
      status: 'error' as const
    }
    messages.value.push(errorMessage)
    
    // 滚动到底部
    scrollToBottom()
  } finally {
    isLoading.value = false
  }
}

// 处理建议点击
const handleSuggestionClick = (suggestion: string) => {
  inputMessage.value = suggestion
  sendMessage()
}

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (chatContentRef.value) {
    chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight
  }
}

// 监听输入变化
watch(inputMessage, () => {
  adjustTextareaHeight()
  
  // 生成输入建议
  if (inputMessage.value.trim().length > 2) {
    inputSuggestions.value = suggestions.filter(s => 
      s.toLowerCase().includes(inputMessage.value.toLowerCase())
    )
  } else {
    inputSuggestions.value = []
  }
})

// 监听消息变化，自动滚动到底部
watch(messages, () => {
  scrollToBottom()
}, { deep: true })

// 生命周期钩子
onMounted(() => {
  // 自动聚焦到输入框
  if (inputRef.value) {
    inputRef.value.focus()
  }
})
</script>

<style lang="scss" scoped>
.ai-chat-interface {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

/* 选项卡导航 */
.ai-tab-navigation {
  display: flex;
  gap: 4px;
  padding: 8px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.ai-tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ai-tab-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.ai-tab-btn.active {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

/* 聊天内容区域 */
.ai-chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #ffffff;
}

/* 欢迎信息 */
.ai-welcome-message {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.ai-welcome-icon {
  margin-bottom: 16px;
  color: #6366f1;
}

.ai-welcome-message h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.ai-welcome-message p {
  margin-bottom: 24px;
  font-size: 14px;
}

.ai-suggestions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 300px;
  margin: 0 auto;
}

.ai-suggestion-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ai-suggestion-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

/* 消息列表 */
.ai-messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 输入区域 */
.ai-chat-input-container {
  padding: 12px 16px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.ai-chat-input-wrapper {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.ai-chat-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  resize: none;
  outline: none;
  transition: all 0.2s ease;
  max-height: 120px;
}

.ai-chat-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.ai-input-actions {
  display: flex;
  gap: 8px;
}

.ai-attach-btn,
.ai-send-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.ai-attach-btn {
  background: #e5e7eb;
  color: #374151;
}

.ai-attach-btn:hover {
  background: #d1d5db;
}

.ai-send-btn {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.ai-send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.ai-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 输入建议 */
.ai-input-suggestions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.ai-suggestion-tag {
  padding: 4px 8px;
  background: #e5e7eb;
  border-radius: 12px;
  font-size: 12px;
  color: #6b7280;
}
</style>
