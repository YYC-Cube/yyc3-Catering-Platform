<template>
  <div class="ai-widget-system">
    <!-- Logo触发按钮 -->
    <div 
      ref="triggerRef"
      class="ai-logo-trigger"
      @click="toggleWidget"
      title="AI助手 (Ctrl+K)"
    >
      <div class="ai-logo-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      </div>
      
      <!-- 通知徽章 -->
      <div class="ai-notification-badge">
        <span>3</span>
      </div>
    </div>

    <!-- AI浮窗主体 -->
    <transition name="ai-widget-transition" mode="out-in">
      <div 
        v-if="isOpen"
        ref="widgetRef"
        class="ai-widget-main"
        :class="mode"
        :style="{
          left: `${position.x}px`,
          top: `${position.y}px`
        }"
      >
        <!-- 标题栏 - 可拖拽区域 -->
        <div 
          class="ai-widget-header"
          @mousedown="startDrag"
        >
          <div class="ai-widget-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <span>YYC³ AI助手</span>
          </div>
          
          <div class="ai-widget-controls">
            <button 
              class="control-btn minimize"
              @click="mode = 'minimized'"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="4" y1="12" x2="20" y2="12"></line>
              </svg>
            </button>
            
            <button 
              class="control-btn expand"
              @click="mode = mode === 'expanded' ? 'fullscreen' : 'expanded'"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              </svg>
            </button>
            
            <button 
              class="control-btn close"
              @click="toggleWidget"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="ai-widget-content">
          <AIChatInterface 
            :currentTab="currentTab"
            @tab-change="(tab) => currentTab = tab"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import AIChatInterface from './AIChatInterface.vue'

// 组件状态
const isOpen = ref(false)
const position = reactive({ x: window.innerWidth - 400, y: 100 })
const mode = ref<'minimized' | 'expanded' | 'fullscreen'>('expanded')
const currentTab = ref<'chat' | 'tools' | 'insights' | 'workflows'>('chat')
const isDragging = ref(false)

// 引用
const widgetRef = ref<HTMLDivElement | null>(null)
const triggerRef = ref<HTMLDivElement | null>(null)

// 全局键盘快捷键
const handleKeyPress = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    toggleWidget()
  }
}

// 点击外部关闭
const handleClickOutside = (e: MouseEvent) => {
  if (
    widgetRef.value && 
    !widgetRef.value.contains(e.target as Node) &&
    triggerRef.value &&
    !triggerRef.value.contains(e.target as Node) &&
    isOpen.value
  ) {
    toggleWidget()
  }
}

// 切换浮窗状态
const toggleWidget = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    mode.value = 'expanded'
  } else {
    mode.value = 'minimized'
  }
}

// 拖拽功能
const startDrag = (e: MouseEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value || !widgetRef.value) return
  
  position.x = e.clientX - (widgetRef.value.offsetWidth / 2)
  position.y = e.clientY - 20
}

const stopDrag = () => {
  isDragging.value = false
}

// 生命周期钩子
onMounted(() => {
  document.addEventListener('keydown', handleKeyPress)
  document.addEventListener('mousedown', handleClickOutside)
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyPress)
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<style lang="scss" scoped>
/* 智能AI浮窗样式系统 */
:root {
  --ai-widget-primary: #6366F1;
  --ai-widget-secondary: #8B5CF6;
  --ai-widget-accent: #10B981;
  --ai-widget-bg: rgba(255, 255, 255, 0.95);
  --ai-widget-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.ai-widget-system {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Logo触发容器 */
.ai-logo-trigger {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--ai-widget-primary), var(--ai-widget-secondary));
  box-shadow: var(--ai-widget-shadow);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1001;
  color: white;
  
  /* 呼吸动画效果 */
  animation: ai-logo-breathe 3s ease-in-out infinite;
}

.ai-logo-trigger:hover {
  transform: scale(1.1);
  box-shadow: 0 25px 50px -12px rgba(99, 102, 241, 0.25);
}

.ai-logo-trigger::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: inherit;
  animation: ai-logo-pulse 2s ease-out infinite;
}

@keyframes ai-logo-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes ai-logo-pulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}

/* 浮窗主体 */
.ai-widget-main {
  position: fixed;
  width: 380px;
  height: 600px;
  background: var(--ai-widget-bg);
  border-radius: 16px;
  box-shadow: var(--ai-widget-shadow);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
}

.ai-widget-main.minimized {
  height: 60px;
  width: 300px;
}

.ai-widget-main.fullscreen {
  width: 90vw;
  height: 90vh;
  top: 5vh !important;
  left: 5vw !important;
}

/* 过渡动画 */
.ai-widget-transition-enter-active,
.ai-widget-transition-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.ai-widget-transition-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.ai-widget-transition-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

/* 标题栏 */
.ai-widget-header {
  padding: 12px 16px;
  background: linear-gradient(135deg, var(--ai-widget-primary), var(--ai-widget-secondary));
  color: white;
  cursor: move;
  user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ai-widget-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
}

.ai-widget-controls {
  display: flex;
  gap: 4px;
}

.control-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 内容区域 */
.ai-widget-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
