<!--
 * @fileoverview YYC³餐饮行业智能化平台 - 待办事项管理组件
 * @description 管理用户的待办事项，提醒重要任务
 * @module TodoList
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 * @updated 2025-01-19
 -->
<template>
  <div class="todo-list">
    <div class="todo-header">
      <div class="header-left">
        <h3>待办事项</h3>
        <el-badge :value="pendingCount" :max="99" type="primary" />
      </div>
      <div class="header-actions">
        <el-button text @click="showFilter = !showFilter">
          <el-icon><Filter /></el-icon>
        </el-button>
        <el-button text @click="showAddDialog = true">
          <el-icon><Plus /></el-icon>
        </el-button>
        <el-dropdown @command="handleMoreCommand">
          <el-button text>
            <el-icon><MoreFilled /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="clear-completed">清除已完成</el-dropdown-item>
              <el-dropdown-item command="export">导出待办</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <transition name="slide-down">
      <div v-if="showFilter" class="filter-section">
        <el-form :inline="true" size="small">
          <el-form-item label="状态">
            <el-select v-model="filter.status" placeholder="全部" clearable @change="applyFilter">
              <el-option label="待完成" value="pending" />
              <el-option label="进行中" value="in-progress" />
              <el-option label="已完成" value="completed" />
            </el-select>
          </el-form-item>
          <el-form-item label="优先级">
            <el-select v-model="filter.priority" placeholder="全部" clearable @change="applyFilter">
              <el-option label="高" value="high" />
              <el-option label="中" value="medium" />
              <el-option label="低" value="low" />
            </el-select>
          </el-form-item>
          <el-form-item label="分类">
            <el-select v-model="filter.category" placeholder="全部" clearable @change="applyFilter">
              <el-option
                v-for="category in categories"
                :key="category.value"
                :label="category.label"
                :value="category.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </transition>

    <div class="todo-list-container" ref="listContainer">
      <transition-group name="todo-item" tag="div" class="todo-items">
        <div
          v-for="todo in filteredTodos"
          :key="todo.id"
          class="todo-item"
          :class="{
            'completed': todo.status === 'completed',
            'in-progress': todo.status === 'in-progress',
            [`priority-${todo.priority}`]: true,
            'overdue': isOverdue(todo)
          }"
          draggable="true"
          @dragstart="handleDragStart($event, todo)"
          @dragover="handleDragOver($event)"
          @drop="handleDrop($event, todo)"
        >
          <div class="todo-checkbox" @click="toggleTodoStatus(todo)">
            <el-icon :size="20">
              <component :is="todo.status === 'completed' ? 'CircleCheckFilled' : 'Circle'" />
            </el-icon>
          </div>

          <div class="todo-content" @click="editTodo(todo)">
            <div class="todo-title">{{ todo.title }}</div>
            <div v-if="todo.description" class="todo-description">
              {{ todo.description }}
            </div>
            <div class="todo-meta">
              <el-tag
                v-if="todo.category"
                :type="getCategoryType(todo.category)"
                size="small"
              >
                {{ getCategoryLabel(todo.category) }}
              </el-tag>
              <el-tag
                :type="getPriorityType(todo.priority)"
                size="small"
              >
                {{ getPriorityLabel(todo.priority) }}
              </el-tag>
              <span v-if="todo.dueDate" class="todo-due-date">
                <el-icon><Calendar /></el-icon>
                {{ formatDueDate(todo.dueDate) }}
              </span>
              <span v-if="isOverdue(todo)" class="todo-overdue">
                已逾期
              </span>
            </div>
          </div>

          <div class="todo-actions">
            <el-button
              v-if="todo.status !== 'in-progress'"
              text
              size="small"
              @click.stop="startTodo(todo)"
              title="开始"
            >
              <el-icon><VideoPlay /></el-icon>
            </el-button>
            <el-button
              text
              size="small"
              @click.stop="editTodo(todo)"
              title="编辑"
            >
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button
              text
              type="danger"
              size="small"
              @click.stop="deleteTodo(todo)"
              title="删除"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </transition-group>

      <div v-if="filteredTodos.length === 0" class="empty-state">
        <el-icon :size="48" color="#C0C4CC">
          <Document />
        </el-icon>
        <p>暂无待办事项</p>
      </div>
    </div>

    <div class="todo-footer">
      <div class="footer-stats">
        <span>总计: {{ todos.length }}</span>
        <span>待完成: {{ pendingCount }}</span>
        <span>已完成: {{ completedCount }}</span>
        <span>逾期: {{ overdueCount }}</span>
      </div>
    </div>

    <el-dialog v-model="showAddDialog" :title="editingTodo ? '编辑待办' : '添加待办'" width="500px">
      <el-form :model="todoForm" :rules="todoRules" ref="todoFormRef" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="todoForm.title" placeholder="请输入待办标题" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="todoForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入待办描述"
          />
        </el-form-item>
        <el-form-item label="优先级">
          <el-radio-group v-model="todoForm.priority">
            <el-radio label="high">高</el-radio>
            <el-radio label="medium">中</el-radio>
            <el-radio label="low">低</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="todoForm.category" placeholder="选择分类">
            <el-option
              v-for="category in categories"
              :key="category.value"
              :label="category.label"
              :value="category.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker
            v-model="todoForm.dueDate"
            type="datetime"
            placeholder="选择截止日期"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="提醒">
          <el-switch v-model="todoForm.reminder" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveTodo">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Filter,
  MoreFilled,
  CircleCheckFilled,
  Circle,
  Calendar,
  VideoPlay,
  Edit,
  Delete,
  Document
} from '@element-plus/icons-vue'
import { todoApi, Todo, TodoStatus, TodoPriority } from '@/api/todo'

interface TodoItem extends Todo {
  id: string
  title: string
  description?: string
  status: TodoStatus
  priority: TodoPriority
  category?: string
  dueDate?: string
  reminder: boolean
}

const showFilter = ref(false)
const showAddDialog = ref(false)
const editingTodo = ref<TodoItem | null>(null)
const listContainer = ref<HTMLElement>()
const todoFormRef = ref()

const filter = ref({
  status: '' as TodoStatus | '',
  priority: '' as TodoPriority | '',
  category: ''
})

const todoForm = ref<Partial<TodoItem>>({
  title: '',
  description: '',
  priority: 'medium',
  category: '',
  dueDate: '',
  reminder: false
})

const todoRules = {
  title: [
    { required: true, message: '请输入待办标题', trigger: 'blur' }
  ]
}

const categories = [
  { label: '工作', value: 'work' },
  { label: '订单', value: 'order' },
  { label: '客户', value: 'customer' },
  { label: '财务', value: 'finance' },
  { label: '系统', value: 'system' },
  { label: '其他', value: 'other' }
]

const todos = ref<TodoItem[]>([])

const filteredTodos = computed(() => {
  return todos.value.filter(todo => {
    if (filter.value.status && todo.status !== filter.value.status) return false
    if (filter.value.priority && todo.priority !== filter.value.priority) return false
    if (filter.value.category && todo.category !== filter.value.category) return false
    return true
  })
})

const pendingCount = computed(() =>
  todos.value.filter(t => t.status === 'pending').length
)

const completedCount = computed(() =>
  todos.value.filter(t => t.status === 'completed').length
)

const overdueCount = computed(() =>
  todos.value.filter(t => isOverdue(t)).length
)

const isOverdue = (todo: TodoItem) => {
  if (!todo.dueDate || todo.status === 'completed') return false
  return new Date(todo.dueDate) < new Date()
}

const toggleTodoStatus = async (todo: TodoItem) => {
  const newStatus = todo.status === 'completed' ? 'pending' : 'completed'
  try {
    await todoApi.updateTodo(todo.id, { status: newStatus })
    todo.status = newStatus
    ElMessage.success(newStatus === 'completed' ? '已完成' : '已恢复')
  } catch (error) {
    console.error('Toggle todo status failed:', error)
    ElMessage.error('操作失败')
  }
}

const startTodo = async (todo: TodoItem) => {
  try {
    await todoApi.updateTodo(todo.id, { status: 'in-progress' })
    todo.status = 'in-progress'
    ElMessage.success('已开始')
  } catch (error) {
    console.error('Start todo failed:', error)
    ElMessage.error('操作失败')
  }
}

const editTodo = (todo: TodoItem) => {
  editingTodo.value = todo
  todoForm.value = {
    title: todo.title,
    description: todo.description,
    priority: todo.priority,
    category: todo.category,
    dueDate: todo.dueDate,
    reminder: todo.reminder
  }
  showAddDialog.value = true
}

const saveTodo = async () => {
  if (!todoFormRef.value) return

  await todoFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      if (editingTodo.value) {
        await todoApi.updateTodo(editingTodo.value.id, todoForm.value)
        Object.assign(editingTodo.value, todoForm.value)
        ElMessage.success('更新成功')
      } else {
        const response = await todoApi.createTodo(todoForm.value)
        if (response.success && response.data) {
          todos.value.unshift(response.data)
          ElMessage.success('添加成功')
        }
      }

      showAddDialog.value = false
      editingTodo.value = null
      resetForm()
    } catch (error) {
      console.error('Save todo failed:', error)
      ElMessage.error('保存失败')
    }
  })
}

const deleteTodo = async (todo: TodoItem) => {
  try {
    await ElMessageBox.confirm('确定要删除这个待办吗？', '确认删除', {
      type: 'warning'
    })

    await todoApi.deleteTodo(todo.id)
    todos.value = todos.value.filter(t => t.id !== todo.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete todo failed:', error)
      ElMessage.error('删除失败')
    }
  }
}

const applyFilter = () => {
  nextTick(() => {
    if (listContainer.value) {
      listContainer.value.scrollTop = 0
    }
  })
}

const handleMoreCommand = async (command: string) => {
  switch (command) {
    case 'clear-completed':
      await clearCompleted()
      break
    case 'export':
      await exportTodos()
      break
  }
}

const clearCompleted = async () => {
  try {
    await ElMessageBox.confirm('确定要清除所有已完成的待办吗？', '确认清除', {
      type: 'warning'
    })

    const completedIds = todos.value
      .filter(t => t.status === 'completed')
      .map(t => t.id)

    await Promise.all(completedIds.map(id => todoApi.deleteTodo(id)))
    todos.value = todos.value.filter(t => t.status !== 'completed')
    ElMessage.success('清除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Clear completed failed:', error)
      ElMessage.error('清除失败')
    }
  }
}

const exportTodos = async () => {
  try {
    const response = await todoApi.exportTodos()
    if (response.success && response.data) {
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `todos_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      ElMessage.success('导出成功')
    }
  } catch (error) {
    console.error('Export todos failed:', error)
    ElMessage.error('导出失败')
  }
}

const resetForm = () => {
  todoForm.value = {
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    dueDate: '',
    reminder: false
  }
  todoFormRef.value?.clearValidate()
}

const getCategoryLabel = (category: string) => {
  const cat = categories.find(c => c.value === category)
  return cat?.label || category
}

const getCategoryType = (category: string) => {
  const typeMap: Record<string, string> = {
    work: '',
    order: 'warning',
    customer: 'success',
    finance: 'danger',
    system: 'info',
    other: 'info'
  }
  return typeMap[category] || ''
}

const getPriorityLabel = (priority: string) => {
  const labelMap: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return labelMap[priority] || priority
}

const getPriorityType = (priority: string) => {
  const typeMap: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return typeMap[priority] || ''
}

const formatDueDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days < 0) return '已逾期'
  if (days === 0) return '今天'
  if (days === 1) return '明天'
  if (days < 7) return `${days}天后`

  return date.toLocaleDateString()
}

const handleDragStart = (event: DragEvent, todo: TodoItem) => {
  event.dataTransfer?.setData('text/plain', todo.id)
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const handleDrop = async (event: DragEvent, targetTodo: TodoItem) => {
  event.preventDefault()
  const draggedId = event.dataTransfer?.getData('text/plain')
  if (!draggedId || draggedId === targetTodo.id) return

  const draggedIndex = todos.value.findIndex(t => t.id === draggedId)
  const targetIndex = todos.value.findIndex(t => t.id === targetTodo.id)

  if (draggedIndex === -1 || targetIndex === -1) return

  const [draggedTodo] = todos.value.splice(draggedIndex, 1)
  todos.value.splice(targetIndex, 0, draggedTodo)

  try {
    await todoApi.reorderTodos(todos.value.map(t => t.id))
  } catch (error) {
    console.error('Reorder todos failed:', error)
  }
}

const loadTodos = async () => {
  try {
    const response = await todoApi.getTodos()
    if (response.success && response.data) {
      todos.value = response.data
    }
  } catch (error) {
    console.error('Load todos failed:', error)
    ElMessage.error('加载待办失败')
  }
}

onMounted(() => {
  loadTodos()
})
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';

.todo-list {
  background: var(--color-bg-primary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.todo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    h3 {
      margin: 0;
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }
}

.filter-section {
  padding: var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-md);
}

.todo-list-container {
  max-height: 500px;
  overflow-y: auto;
  padding: var(--spacing-sm);
}

.todo-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.todo-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-md);
  cursor: move;
  transition: var(--transition-all);

  &:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-sm);
  }

  &.completed {
    opacity: 0.6;

    .todo-title {
      text-decoration: line-through;
      color: var(--color-text-placeholder);
    }
  }

  &.in-progress {
    border-left: 3px solid var(--color-primary);
  }

  &.priority-high {
    border-left: 3px solid var(--color-danger);
  }

  &.priority-medium {
    border-left: 3px solid var(--color-warning);
  }

  &.priority-low {
    border-left: 3px solid var(--color-info);
  }

  &.overdue {
    background: rgba(var(--color-danger-rgb), 0.05);
  }
}

.todo-checkbox {
  flex-shrink: 0;
  cursor: pointer;
  color: var(--color-border-secondary);

  &:hover {
    color: var(--color-primary);
  }
}

.todo-content {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.todo-title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.todo-description {
  font-size: var(--font-size-body-small);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
  line-height: var(--line-height-normal);
}

.todo-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.todo-due-date {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-body-small);
  color: var(--color-text-secondary);
}

.todo-overdue {
  color: var(--color-danger);
  font-size: var(--font-size-body-small);
  font-weight: var(--font-weight-medium);
}

.todo-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-placeholder);

  p {
    margin-top: var(--spacing-md);
    font-size: var(--font-size-body);
  }
}

.todo-footer {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border-primary);
}

.footer-stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  font-size: var(--font-size-body-small);
  color: var(--color-text-secondary);

  span {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.todo-item-enter-active,
.todo-item-leave-active {
  transition: all 0.3s ease;
}

.todo-item-enter-from,
.todo-item-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

@media (max-width: $breakpoint-md) {
  .todo-item {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .todo-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .footer-stats {
    flex-wrap: wrap;
    gap: var(--spacing-md);
  }
}
</style>
