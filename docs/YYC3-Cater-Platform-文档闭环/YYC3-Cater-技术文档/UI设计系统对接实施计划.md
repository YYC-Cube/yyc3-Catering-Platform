# YYC³ 餐饮平台 - UI设计系统对接实施计划

## 📊 执行摘要

**创建日期**: 2026-01-20  
**对接方案**: 方案A - 完全迁移（推荐）  
**预计工期**: 6-10周  
**技术栈**: Vue 3 + Radix UI + Tailwind CSS 4.1.12 + AI Widget + Closed Loop

---

## 🎯 对接目标

1. **统一技术栈**: 从Element Plus迁移到Radix UI
2. **升级依赖**: Tailwind CSS 3.3.0 → 4.1.12，Vite 5.4.0 → 6.3.5
3. **集成AI系统**: 集成自治AI引擎和智能助手
4. **集成闭环系统**: 集成闭环优化引擎和价值验证框架
5. **提升可访问性**: 达到WCAG 2.1 AA标准
6. **优化性能**: 提升渲染性能和用户体验

---

## 📋 技术栈对比

### 当前技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.x | 前端框架 |
| Element Plus | 最新 | UI组件库 |
| Tailwind CSS | 3.3.0 | CSS框架 |
| Vite | 5.4.0 | 构建工具 |
| TypeScript | 5.3.3 | 类型系统 |
| ECharts | 最新 | 图表库 |

### 目标技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.x | 前端框架（保持） |
| Radix UI | 最新 | UI组件库（迁移） |
| Tailwind CSS | 4.1.12 | CSS框架（升级） |
| Vite | 6.3.5 | 构建工具（升级） |
| TypeScript | 5.9.3 | 类型系统（升级） |
| Recharts | 最新 | 图表库（迁移） |
| AI Widget | 最新 | AI组件（新增） |
| Closed Loop | 最新 | 闭环系统（新增） |

---

## 🚀 实施阶段

### 阶段1：准备工作（1-2周）

#### 1.1 升级依赖

```bash
# 升级Vite
pnpm update vite@latest @vitejs/plugin-vue@latest

# 升级Tailwind CSS
pnpm remove tailwindcss postcss autoprefixer
pnpm add -D tailwindcss@latest postcss@latest autoprefixer@latest

# 升级TypeScript
pnpm update typescript@latest

# 安装Radix UI
pnpm add radix-vue
pnpm add -D @radix-ui/colors

# 安装Recharts
pnpm add recharts

# 安装AI相关依赖
pnpm add @anthropic-ai/sdk openai

# 安装其他工具
pnpm add lucide-vue-next clsx tailwind-merge
```

#### 1.2 配置Tailwind CSS 4.1.12

**tailwind.config.ts**:
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // 更多颜色...
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

#### 1.3 配置Vite 6.3.5

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@composables': resolve(__dirname, './src/composables'),
      '@utils': resolve(__dirname, './src/utils'),
      '@stores': resolve(__dirname, './src/stores'),
      '@types': resolve(__dirname, './src/types'),
    },
  },
  server: {
    port: 3100,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['radix-vue'],
          'charts-vendor': ['recharts'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'radix-vue'],
  },
})
```

#### 1.4 创建组件基础架构

**src/components/ui/base/index.ts**:
```typescript
// 导出所有基础组件
export { default as Button } from './Button.vue'
export { default as Input } from './Input.vue'
export { default as Select } from './Select.vue'
export { default as Dialog } from './Dialog.vue'
export { default as Table } from './Table.vue'
export { default as Card } from './Card.vue'
export { default as Badge } from './Badge.vue'
export { default as Avatar } from './Avatar.vue'
export { default as Form } from './Form.vue'
export { default as FormItem } from './FormItem.vue'
```

**src/utils/cn.ts**:
```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

### 阶段2：组件迁移（2-3周）

#### 2.1 创建Radix UI组件映射

| Element Plus | Radix Vue | 优先级 |
|-------------|------------|--------|
| el-button | Button | 高 |
| el-input | Input | 高 |
| el-select | Select | 高 |
| el-dialog | Dialog | 高 |
| el-table | Table | 高 |
| el-card | Card | 高 |
| el-form | Form | 高 |
| el-form-item | FormItem | 高 |
| el-badge | Badge | 中 |
| el-avatar | Avatar | 中 |
| el-dropdown | DropdownMenu | 中 |
| el-menu | NavigationMenu | 中 |
| el-tabs | Tabs | 中 |
| el-tooltip | Tooltip | 低 |
| el-popover | Popover | 低 |
| el-switch | Switch | 低 |
| el-checkbox | Checkbox | 低 |
| el-radio | Radio | 低 |

#### 2.2 示例：Button组件迁移

**Element Plus Button**:
```vue
<template>
  <el-button type="primary" size="large" @click="handleClick">
    点击我
  </el-button>
</template>

<script setup lang="ts">
function handleClick() {
  console.log('Button clicked')
}
</script>
```

**Radix Vue Button**:
```vue
<template>
  <button
    :class="cn(
      'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      variantClasses,
      sizeClasses
    )"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils/cn'

interface Props {
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
  disabled: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const variantClasses = computed(() => {
  const variants = {
    default: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'hover:bg-gray-100',
    link: 'text-blue-600 underline-offset-4 hover:underline',
  }
  return variants[props.variant]
})

const sizeClasses = computed(() => {
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  }
  return sizes[props.size]
})

function handleClick(event: MouseEvent) {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>
```

#### 2.3 示例：Dialog组件迁移

**Element Plus Dialog**:
```vue
<template>
  <el-dialog
    v-model="visible"
    title="对话框标题"
    width="500px"
    @close="handleClose"
  >
    <p>对话框内容</p>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)

function handleClose() {
  console.log('Dialog closed')
}

function handleConfirm() {
  console.log('Dialog confirmed')
  visible.value = false
}
</script>
```

**Radix Vue Dialog**:
```vue
<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger as-child>
      <Button>打开对话框</Button>
    </DialogTrigger>
    
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 bg-black/50 z-50" />
      
      <DialogContent
        :class="cn(
          'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
          'bg-white rounded-lg shadow-lg p-6',
          'animate-in fade-in zoom-in-95 duration-200'
        )"
      >
        <DialogHeader>
          <DialogTitle class="text-lg font-semibold">
            对话框标题
          </DialogTitle>
          <DialogDescription class="text-sm text-gray-600">
            对话框描述
          </DialogDescription>
        </DialogHeader>
        
        <div class="py-4">
          <p>对话框内容</p>
        </div>
        
        <DialogFooter class="flex justify-end gap-2">
          <Button variant="secondary" @click="open = false">
            取消
          </Button>
          <Button variant="primary" @click="handleConfirm">
            确定
          </Button>
        </DialogFooter>
        
        <DialogClose
          class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          @click="open = false"
        >
          <X class="h-4 w-4" />
          <span class="sr-only">关闭</span>
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from 'radix-vue'
import { cn } from '@/utils/cn'
import Button from './Button.vue'

const open = ref(false)

function handleConfirm() {
  console.log('Dialog confirmed')
  open.value = false
}
</script>
```

---

### 阶段3：系统集成（2-3周）

#### 3.1 集成AI Widget系统

**src/composables/useAIWidget.ts**:
```typescript
import { ref, computed } from 'vue'
import { AutonomousAIEngine } from '@/lib/ai/AutonomousAIEngine'

export function useAIWidget() {
  const aiEngine = ref<AutonomousAIEngine | null>(null)
  const isInitialized = ref(false)
  const isProcessing = ref(false)
  const conversationHistory = ref<Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }>>([])

  const canInteract = computed(() => 
    isInitialized.value && !isProcessing.value
  )

  async function initialize(config: {
    apiKey: string
    model: string
    temperature?: number
  }) {
    try {
      aiEngine.value = new AutonomousAIEngine({
        modelAdapter: {
          type: 'openai',
          apiKey: config.apiKey,
          model: config.model,
          temperature: config.temperature || 0.7,
        },
        memorySystem: {
          enabled: true,
          maxMemorySize: 1000,
        },
        learningSystem: {
          enabled: true,
          learningRate: 0.01,
        },
      })
      
      await aiEngine.value.initialize()
      isInitialized.value = true
    } catch (error) {
      console.error('Failed to initialize AI engine:', error)
      throw error
    }
  }

  async function sendMessage(message: string) {
    if (!canInteract.value || !aiEngine.value) {
      throw new Error('AI engine not ready')
    }

    isProcessing.value = true
    
    try {
      conversationHistory.value.push({
        role: 'user',
        content: message,
        timestamp: new Date(),
      })

      const response = await aiEngine.value.processMessage(message)
      
      conversationHistory.value.push({
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      })

      return response
    } finally {
      isProcessing.value = false
    }
  }

  async function getContext(): Promise<any> {
    if (!aiEngine.value) {
      throw new Error('AI engine not initialized')
    }
    return aiEngine.value.getContext()
  }

  function clearHistory() {
    conversationHistory.value = []
  }

  return {
    aiEngine,
    isInitialized,
    isProcessing,
    conversationHistory,
    canInteract,
    initialize,
    sendMessage,
    getContext,
    clearHistory,
  }
}
```

**src/components/AIWidget.vue**:
```vue
<template>
  <div class="ai-widget">
    <Button
      v-if="!isOpen"
      variant="primary"
      @click="isOpen = true"
    >
      <Bot class="mr-2 h-4 w-4" />
      AI助手
    </Button>
    
    <DialogRoot v-model:open="isOpen">
      <DialogPortal>
        <DialogOverlay class="fixed inset-0 bg-black/50 z-50" />
        
        <DialogContent
          class="fixed right-4 top-4 bottom-4 w-96 z-50 bg-white rounded-lg shadow-lg flex flex-col"
        >
          <DialogHeader class="border-b p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Bot class="h-5 w-5 text-blue-600" />
                <DialogTitle class="text-lg font-semibold">
                  AI智能助手
                </DialogTitle>
              </div>
              <DialogClose @click="isOpen = false">
                <X class="h-4 w-4" />
              </DialogClose>
            </div>
          </DialogHeader>
          
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <div
              v-for="(msg, index) in conversationHistory"
              :key="index"
              :class="[
                'flex gap-3',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              ]"
            >
              <div
                :class="[
                  'max-w-[80%] rounded-lg p-3',
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                ]"
              >
                {{ msg.content }}
              </div>
            </div>
            
            <div v-if="isProcessing" class="flex justify-start">
              <div class="bg-gray-100 rounded-lg p-3">
                <div class="flex space-x-1">
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          </div>
          
          <div class="border-t p-4">
            <div class="flex gap-2">
              <Input
                v-model="message"
                placeholder="输入您的问题..."
                :disabled="!canInteract"
                @keyup.enter="handleSend"
              />
              <Button
                variant="primary"
                :disabled="!canInteract || !message.trim()"
                @click="handleSend"
              >
                <Send class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Bot, X, Send } from 'lucide-vue-next'
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from 'radix-vue'
import Button from './ui/base/Button.vue'
import Input from './ui/base/Input.vue'
import { useAIWidget } from '@/composables/useAIWidget'

const isOpen = ref(false)
const message = ref('')

const {
  isInitialized,
  isProcessing,
  conversationHistory,
  canInteract,
  initialize,
  sendMessage,
} = useAIWidget()

onMounted(async () => {
  try {
    await initialize({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      model: 'gpt-4',
      temperature: 0.7,
    })
  } catch (error) {
    console.error('Failed to initialize AI widget:', error)
  }
})

async function handleSend() {
  if (!message.value.trim() || !canInteract.value) return
  
  const userMessage = message.value
  message.value = ''
  
  try {
    await sendMessage(userMessage)
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}
</script>
```

#### 3.2 集成Closed Loop系统

**src/composables/useClosedLoop.ts**:
```typescript
import { ref, computed } from 'vue'
import { ClosedLoopEngine } from '@/lib/closed-loop/ClosedLoopEngine'

export function useClosedLoop() {
  const engine = ref<ClosedLoopEngine | null>(null)
  const isInitialized = ref(false)
  const goals = ref<Array<{
    id: string
    name: string
    target: number
    current: number
    status: 'pending' | 'in_progress' | 'completed' | 'failed'
  }>>([])

  const progress = computed(() => {
    if (goals.value.length === 0) return 0
    const completed = goals.value.filter(g => g.status === 'completed').length
    return (completed / goals.value.length) * 100
  })

  async function initialize(config: {
    apiKey?: string
    environment: 'development' | 'production'
  }) {
    try {
      engine.value = new ClosedLoopEngine({
        goalManagement: {
          enabled: true,
          autoOptimization: true,
        },
        valueValidation: {
          enabled: true,
          strictMode: config.environment === 'production',
        },
        analytics: {
          enabled: true,
          realTime: true,
        },
      })
      
      await engine.value.initialize()
      isInitialized.value = true
      
      goals.value = await engine.value.getGoals()
    } catch (error) {
      console.error('Failed to initialize closed loop engine:', error)
      throw error
    }
  }

  async function addGoal(goal: {
    name: string
    target: number
    unit: string
    deadline?: Date
  }) {
    if (!engine.value) {
      throw new Error('Closed loop engine not initialized')
    }

    const newGoal = await engine.value.addGoal(goal)
    goals.value.push(newGoal)
    return newGoal
  }

  async function updateGoalProgress(goalId: string, progress: number) {
    if (!engine.value) {
      throw new Error('Closed loop engine not initialized')
    }

    await engine.value.updateGoalProgress(goalId, progress)
    
    const goal = goals.value.find(g => g.id === goalId)
    if (goal) {
      goal.current = progress
      goal.status = progress >= goal.target ? 'completed' : 'in_progress'
    }
  }

  async function getOptimizationSuggestions(): Promise<Array<{
    type: string
    description: string
    impact: 'high' | 'medium' | 'low'
    effort: 'high' | 'medium' | 'low'
  }>> {
    if (!engine.value) {
      throw new Error('Closed loop engine not initialized')
    }
    return engine.value.getOptimizationSuggestions()
  }

  return {
    engine,
    isInitialized,
    goals,
    progress,
    initialize,
    addGoal,
    updateGoalProgress,
    getOptimizationSuggestions,
  }
}
```

**src/components/ClosedLoopDashboard.vue**:
```vue
<template>
  <div class="closed-loop-dashboard">
    <Card>
      <CardHeader>
        <CardTitle>闭环优化仪表板</CardTitle>
        <CardDescription>
          实时监控目标进度和优化建议
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div class="space-y-6">
          <!-- 进度概览 -->
          <div>
            <h3 class="text-lg font-semibold mb-4">目标进度</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                v-for="goal in goals"
                :key="goal.id"
                class="bg-gray-50 rounded-lg p-4"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="font-medium">{{ goal.name }}</span>
                  <Badge :variant="goal.status === 'completed' ? 'success' : 'default'">
                    {{ goal.status }}
                  </Badge>
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between text-sm text-gray-600">
                    <span>进度</span>
                    <span>{{ goal.current }} / {{ goal.target }}</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-blue-600 h-2 rounded-full transition-all"
                      :style="{ width: `${(goal.current / goal.target) * 100}%` }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 优化建议 -->
          <div>
            <h3 class="text-lg font-semibold mb-4">优化建议</h3>
            <div class="space-y-3">
              <div
                v-for="(suggestion, index) in suggestions"
                :key="index"
                class="border rounded-lg p-4"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="font-medium mb-1">{{ suggestion.type }}</h4>
                    <p class="text-sm text-gray-600">{{ suggestion.description }}</p>
                  </div>
                  <div class="flex gap-2 ml-4">
                    <Badge :variant="suggestion.impact === 'high' ? 'destructive' : 'default'">
                      {{ suggestion.impact }}
                    </Badge>
                    <Badge variant="secondary">
                      {{ suggestion.effort }}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Card from './ui/base/Card.vue'
import CardHeader from './ui/base/CardHeader.vue'
import CardTitle from './ui/base/CardTitle.vue'
import CardDescription from './ui/base/CardDescription.vue'
import CardContent from './ui/base/CardContent.vue'
import Badge from './ui/base/Badge.vue'
import { useClosedLoop } from '@/composables/useClosedLoop'

const { isInitialized, goals, progress, initialize, getOptimizationSuggestions } = useClosedLoop()

const suggestions = ref<Array<{
  type: string
  description: string
  impact: 'high' | 'medium' | 'low'
  effort: 'high' | 'medium' | 'low'
}>>([])

onMounted(async () => {
  try {
    await initialize({
      environment: import.meta.env.MODE as 'development' | 'production',
    })
    suggestions.value = await getOptimizationSuggestions()
  } catch (error) {
    console.error('Failed to initialize closed loop dashboard:', error)
  }
})
</script>
```

---

### 阶段4：优化测试（1-2周）

#### 4.1 性能测试

```typescript
// tests/performance/ui-performance.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '@/components/ui/base/Button.vue'

describe('UI组件性能测试', () => {
  it('Button组件应该快速渲染', async () => {
    const start = performance.now()
    
    const wrapper = mount(Button, {
      props: {
        variant: 'primary',
        size: 'lg',
      },
      slots: {
        default: '点击我',
      },
    })
    
    const end = performance.now()
    const renderTime = end - start
    
    expect(renderTime).toBeLessThan(10) // 渲染时间应小于10ms
    expect(wrapper.exists()).toBe(true)
  })
  
  it('应该支持大量组件渲染', async () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
    }))
    
    const start = performance.now()
    
    const wrapper = mount({
      template: `
        <div>
          <Button
            v-for="item in items"
            :key="item.id"
            variant="default"
          >
            {{ item.name }}
          </Button>
        </div>
      `,
      setup() {
        return { items }
      },
    })
    
    const end = performance.now()
    const renderTime = end - start
    
    expect(renderTime).toBeLessThan(100) // 1000个按钮渲染时间应小于100ms
    expect(wrapper.findAll('button').length).toBe(1000)
  })
})
```

#### 4.2 可访问性测试

```typescript
// tests/a11y/ui-a11y.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { axe, toHaveNoViolations } from 'jest-axe'
import Button from '@/components/ui/base/Button.vue'
import Dialog from '@/components/ui/base/Dialog.vue'

expect.extend(toHaveNoViolations)

describe('UI组件可访问性测试', () => {
  it('Button组件应该符合WCAG 2.1 AA标准', async () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'primary',
      },
      slots: {
        default: '点击我',
      },
    })
    
    const results = await axe(wrapper.element)
    expect(results).toHaveNoViolations()
  })
  
  it('Dialog组件应该符合WCAG 2.1 AA标准', async () => {
    const wrapper = mount(Dialog, {
      props: {
        open: true,
        title: '对话框标题',
      },
      slots: {
        default: '对话框内容',
      },
    })
    
    const results = await axe(wrapper.element)
    expect(results).toHaveNoViolations()
  })
})
```

---

## 📊 实施计划时间表

### 第1-2周：准备工作

| 任务 | 负责人 | 开始日期 | 结束日期 | 状态 |
|------|--------|---------|---------|------|
| 升级Vite到6.3.5 | 前端团队 | 2026-01-21 | 2026-01-22 | ⏳ 待开始 |
| 升级Tailwind CSS到4.1.12 | 前端团队 | 2026-01-22 | 2026-01-23 | ⏳ 待开始 |
| 安装Radix Vue | 前端团队 | 2026-01-23 | 2026-01-24 | ⏳ 待开始 |
| 配置Tailwind CSS | 前端团队 | 2026-01-24 | 2026-01-25 | ⏳ 待开始 |
| 配置Vite | 前端团队 | 2026-01-25 | 2026-01-26 | ⏳ 待开始 |
| 创建组件基础架构 | 前端团队 | 2026-01-26 | 2026-01-28 | ⏳ 待开始 |
| 代码分割优化 | 前端团队 | 2026-01-28 | 2026-01-30 | ⏳ 待开始 |

### 第3-5周：组件迁移

| 任务 | 负责人 | 开始日期 | 结束日期 | 状态 |
|------|--------|---------|---------|------|
| 迁移基础组件（Button, Input, Select） | 前端团队 | 2026-01-31 | 2026-02-02 | ⏳ 待开始 |
| 迁移表单组件（Form, Dialog, Table） | 前端团队 | 2026-02-03 | 2026-02-06 | ⏳ 待开始 |
| 迁移导航组件（Menu, Tabs, Breadcrumb） | 前端团队 | 2026-02-07 | 2026-02-09 | ⏳ 待开始 |
| 迁移反馈组件（Alert, Toast, Badge） | 前端团队 | 2026-02-10 | 2026-02-12 | ⏳ 待开始 |
| 迁移数据展示组件（Card, Avatar, List） | 前端团队 | 2026-02-13 | 2026-02-15 | ⏳ 待开始 |
| 迁移业务组件 | 前端团队 | 2026-02-16 | 2026-02-20 | ⏳ 待开始 |

### 第6-8周：系统集成

| 任务 | 负责人 | 开始日期 | 结束日期 | 状态 |
|------|--------|---------|---------|------|
| 集成AI Widget系统 | AI团队 | 2026-02-21 | 2026-02-25 | ⏳ 待开始 |
| 集成Closed Loop系统 | 系统团队 | 2026-02-26 | 2026-03-02 | ⏳ 待开始 |
| 集成Recharts图表库 | 前端团队 | 2026-03-03 | 2026-03-05 | ⏳ 待开始 |
| 优化路由和状态管理 | 前端团队 | 2026-03-06 | 2026-03-08 | ⏳ 待开始 |
| 集成测试 | 测试团队 | 2026-03-09 | 2026-03-12 | ⏳ 待开始 |

### 第9-10周：优化测试

| 任务 | 负责人 | 开始日期 | 结束日期 | 状态 |
|------|--------|---------|---------|------|
| 性能优化 | 前端团队 | 2026-03-13 | 2026-03-17 | ⏳ 待开始 |
| 可访问性测试 | 测试团队 | 2026-03-18 | 2026-03-20 | ⏳ 待开始 |
| 用户验收测试 | 测试团队 | 2026-03-21 | 2026-03-25 | ⏳ 待开始 |
| 文档更新 | 文档团队 | 2026-03-26 | 2026-03-28 | ⏳ 待开始 |
| 上线部署 | 运维团队 | 2026-03-29 | 2026-03-31 | ⏳ 待开始 |

---

## 🎯 预期效果

### 性能提升

| 指标 | 优化前 | 优化后 | 提升幅度 |
|------|--------|--------|----------|
| 首屏加载时间 | 3s | 1.8s | 40% ↓ |
| 组件渲染时间 | 50ms | 20ms | 60% ↓ |
| 页面交互响应 | 100ms | 50ms | 50% ↓ |
| 内存占用 | 200MB | 120MB | 40% ↓ |

### 可访问性提升

| 指标 | 优化前 | 优化后 | 提升幅度 |
|------|--------|--------|----------|
| WCAG 2.1 AA合规率 | 60% | 100% | 67% ↑ |
| 键盘导航支持 | 部分 | 完整 | 100% ↑ |
| 屏幕阅读器支持 | 部分 | 完整 | 100% ↑ |
| 色彩对比度 | 70% | 100% | 43% ↑ |

### 开发体验提升

| 指标 | 优化前 | 优化后 | 提升幅度 |
|------|--------|--------|----------|
| 组件开发时间 | 2小时 | 1小时 | 50% ↓ |
| 代码复用率 | 40% | 80% | 100% ↑ |
| 维护成本 | 高 | 低 | 60% ↓ |

---

## ⚠️ 风险评估

| 风险类型 | 风险等级 | 影响 | 缓解措施 |
|---------|---------|------|---------|
| 学习曲线陡峭 | 高 | 开发效率下降 | 提供培训文档和代码示例 |
| 兼容性问题 | 中 | 功能异常 | 充分测试，准备回滚方案 |
| 性能回退 | 中 | 用户体验下降 | 性能监控，及时优化 |
| 迁移时间超期 | 中 | 项目延期 | 分阶段迁移，及时调整计划 |
| 团队抵触 | 低 | 执行困难 | 沟通培训，强调长期收益 |

---

## 📝 验收标准

### 功能验收

- [ ] 所有核心功能正常工作
- [ ] AI Widget系统正常运行
- [ ] Closed Loop系统正常运行
- [ ] 所有页面正常显示

### 性能验收

- [ ] 首屏加载时间 < 2s
- [ ] 组件渲染时间 < 30ms
- [ ] 页面交互响应 < 100ms
- [ ] 内存占用 < 150MB

### 可访问性验收

- [ ] WCAG 2.1 AA合规率 100%
- [ ] 键盘导航完整支持
- [ ] 屏幕阅读器完整支持
- [ ] 色彩对比度符合标准

### 代码质量验收

- [ ] 代码覆盖率 > 80%
- [ ] Lint检查通过
- [ ] 类型检查通过
- [ ] 单元测试通过

---

## 🔗 相关文档

- [UI设计系统完整度分析与对接方案](./UI设计系统完整度分析与对接方案.md)
- [安全漏洞修复报告](./安全漏洞修复报告.md)
- [集成测试报告](./集成测试报告.md)
- [性能优化方案](./性能优化方案.md)

---

**文档创建时间**: 2026-01-20 23:45:00  
**预计开始时间**: 2026-01-21  
**预计完成时间**: 2026-03-31
