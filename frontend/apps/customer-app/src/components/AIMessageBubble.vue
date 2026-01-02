<template>
  <div class="ai-message-bubble" :class="message.sender">
    <!-- 消息头部 -->
    <div class="ai-message-header">
      <div class="ai-message-sender-info">
        <span class="ai-message-sender-name">
          {{ message.sender === 'user' ? '我' : 'YYC³ AI助手' }}
        </span>
        <span class="ai-message-timestamp">
          {{ formatTime(message.timestamp) }}
        </span>
      </div>
      
      <!-- 消息状态 -->
      <div class="ai-message-status" v-if="message.sender === 'user'">
        <span v-if="message.status === 'sending'" class="status-indicator sending">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="2" x2="12" y2="6"></line>
            <line x1="12" y1="18" x2="12" y2="22"></line>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
            <line x1="2" y1="12" x2="6" y2="12"></line>
            <line x1="18" y1="12" x2="22" y2="12"></line>
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
          </svg>
          发送中
        </span>
        <span v-else-if="message.status === 'sent'" class="status-indicator sent">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          已发送
        </span>
        <span v-else-if="message.status === 'error'" class="status-indicator error">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          发送失败
        </span>
      </div>
    </div>

    <!-- 消息内容 -->
    <div class="ai-message-content">
      <div class="ai-message-text">
        {{ message.content }}
      </div>
      
      <!-- 消息操作按钮 -->
      <div class="ai-message-actions">
        <button 
          class="ai-message-action-btn"
          @click="copyMessage"
          title="复制消息"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        
        <button 
          v-if="message.sender === 'user' && message.status === 'error'"
          class="ai-message-action-btn"
          @click="$emit('resend-message', message)"
          title="重新发送"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
            <line x1="16" y1="12" x2="21" y2="8"></line>
            <line x1="19" y1="15" x2="21" y2="13"></line>
          </svg>
        </button>
        
        <button 
          class="ai-message-action-btn"
          @click="deleteMessage"
          title="删除消息"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- 消息建议 -->
    <div v-if="message.suggestions && message.suggestions.length > 0" class="ai-message-suggestions">
      <button 
        v-for="(suggestion, index) in message.suggestions" 
        :key="index"
        class="ai-message-suggestion-btn"
        @click="$emit('suggestion-click', suggestion)"
      >
        {{ suggestion }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 定义Props
interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
  status: 'sending' | 'sent' | 'received' | 'error'
  suggestions?: string[]
}

interface Props {
  message: Message
  index: number
}

// 定义Emits
interface Emits {
  'resend-message': [message: Message]
  'delete-message': [messageId: string]
  'suggestion-click': [suggestion: string]
}

// Props和Emits
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 组件状态
const showActions = ref(false)

// 格式化时间
const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 复制消息
const copyMessage = async () => {
  try {
    await navigator.clipboard.writeText(props.message.content)
    // 可以添加复制成功提示
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 删除消息
const deleteMessage = () => {
  emit('delete-message', props.message.id)
}
</script>

<style lang="scss" scoped>
.ai-message-bubble {
  display: flex;
  flex-direction: column;
  max-width: 85%;
  margin-bottom: 16px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 用户消息样式 */
.ai-message-bubble.user {
  align-self: flex-end;
  margin-left: auto;
}

.ai-message-bubble.user .ai-message-content {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border-radius: 18px 18px 4px 18px;
}

/* AI消息样式 */
.ai-message-bubble.ai {
  align-self: flex-start;
  margin-right: auto;
}

.ai-message-bubble.ai .ai-message-content {
  background: #f3f4f6;
  color: #1f2937;
  border-radius: 18px 18px 18px 4px;
}

/* 消息头部 */
.ai-message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  padding: 0 8px;
}

.ai-message-sender-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-message-sender-name {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
}

.ai-message-timestamp {
  font-size: 11px;
  color: #9ca3af;
}

/* 消息状态 */
.ai-message-status {
  display: flex;
  align-items: center;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  background: #f3f4f6;
}

.status-indicator.sending {
  color: #6b7280;
}

.status-indicator.sent {
  color: #10b981;
}

.status-indicator.error {
  color: #ef4444;
  cursor: pointer;
}

/* 消息内容 */
.ai-message-content {
  padding: 12px 16px;
  position: relative;
}

.ai-message-text {
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 8px;
}

/* 消息操作按钮 */
.ai-message-actions {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
}

.ai-message-action-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.2);
  color: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0.7;
}

.ai-message-bubble.user .ai-message-action-btn {
  background: rgba(255, 255, 255, 0.2);
}

.ai-message-bubble.ai .ai-message-action-btn {
  background: rgba(0, 0, 0, 0.1);
}

.ai-message-action-btn:hover {
  opacity: 1;
  transform: translateY(-1px);
}

/* 消息建议 */
.ai-message-suggestions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  padding: 0 8px;
  flex-wrap: wrap;
}

.ai-message-suggestion-btn {
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 12px;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ai-message-suggestion-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #374151;
}
</style>
