<!--
 * @fileoverview YYC³餐饮行业智能化平台 - 快捷操作入口组件
 * @description 提供常用功能的快捷入口，提高操作效率
 * @module QuickActions
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 * @updated 2025-01-19
 -->
<template>
  <div class="quick-actions">
    <div class="actions-header">
      <h3>快捷操作</h3>
      <el-button text @click="showSettings = true">
        <el-icon><Setting /></el-icon>
      </el-button>
    </div>

    <div class="actions-grid">
      <div
        v-for="action in displayedActions"
        :key="action.id"
        class="action-item"
        :class="`action-${action.id}`"
        @click="handleActionClick(action)"
        @contextmenu.prevent="showContextMenu($event, action)"
      >
        <div class="action-icon" :style="{ background: action.color }">
          <el-icon :size="24">
            <component :is="action.icon" />
          </el-icon>
        </div>
        <div class="action-content">
          <div class="action-title">{{ action.title }}</div>
          <div class="action-desc">{{ action.description }}</div>
        </div>
        <div v-if="action.badge" class="action-badge">
          {{ action.badge }}
        </div>
      </div>

      <div class="action-item action-add" @click="showAddDialog = true">
        <div class="action-icon" style="background: var(--color-border-secondary)">
          <el-icon :size="24"><Plus /></el-icon>
        </div>
        <div class="action-content">
          <div class="action-title">添加快捷操作</div>
          <div class="action-desc">自定义常用功能</div>
        </div>
      </div>
    </div>

    <el-dialog v-model="showAddDialog" title="添加快捷操作" width="500px">
      <el-form :model="newAction" label-width="100px">
        <el-form-item label="操作名称">
          <el-input v-model="newAction.title" placeholder="请输入操作名称" />
        </el-form-item>
        <el-form-item label="操作描述">
          <el-input v-model="newAction.description" placeholder="请输入操作描述" />
        </el-form-item>
        <el-form-item label="图标">
          <el-select v-model="newAction.icon" placeholder="选择图标">
            <el-option
              v-for="icon in availableIcons"
              :key="icon.name"
              :label="icon.label"
              :value="icon.name"
            >
              <el-icon><component :is="icon.name" /></el-icon>
              <span style="margin-left: 8px">{{ icon.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="newAction.color" />
        </el-form-item>
        <el-form-item label="跳转路径">
          <el-input v-model="newAction.path" placeholder="请输入路由路径" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addCustomAction">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showSettings" title="快捷操作设置" width="600px">
      <div class="settings-content">
        <div class="settings-section">
          <h4>显示设置</h4>
          <el-checkbox v-model="settings.showBadge">显示徽章</el-checkbox>
          <el-checkbox v-model="settings.showDescription">显示描述</el-checkbox>
        </div>
        <div class="settings-section">
          <h4>布局设置</h4>
          <el-radio-group v-model="settings.layout">
            <el-radio label="grid">网格布局</el-radio>
            <el-radio label="list">列表布局</el-radio>
          </el-radio-group>
        </div>
        <div class="settings-section">
          <h4>自定义操作</h4>
          <div class="custom-actions-list">
            <div
              v-for="action in customActions"
              :key="action.id"
              class="custom-action-item"
            >
              <el-icon :size="20"><component :is="action.icon" /></el-icon>
              <span>{{ action.title }}</span>
              <el-button text type="danger" @click="removeCustomAction(action.id)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showSettings = false">取消</el-button>
        <el-button type="primary" @click="saveSettings">保存设置</el-button>
      </template>
    </el-dialog>

    <el-dropdown
      ref="contextMenu"
      :teleported="false"
      trigger="contextmenu"
      @command="handleContextMenuCommand"
    >
      <span></span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="edit" v-if="selectedAction?.isCustom">
            编辑
          </el-dropdown-item>
          <el-dropdown-item command="pin">
            {{ selectedAction?.pinned ? '取消固定' : '固定' }}
          </el-dropdown-item>
          <el-dropdown-item command="hide" v-if="!selectedAction?.pinned">
            隐藏
          </el-dropdown-item>
          <el-dropdown-item command="reset" v-if="!selectedAction?.isCustom">
            重置位置
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Plus,
  Setting,
  Delete,
  ShoppingCart,
  Food,
  User,
  Document,
  DataAnalysis,
  CreditCard,
  Monitor,
  Tools,
  Calendar,
  Message,
  Bell,
  Star,
  TrendCharts,
  Printer
} from '@element-plus/icons-vue'
import { quickActionsApi, QuickAction, QuickActionSettings } from '@/api/quickActions'

const router = useRouter()

interface QuickActionItem extends QuickAction {
  icon: any
  pinned?: boolean
  isCustom?: boolean
}

const showAddDialog = ref(false)
const showSettings = ref(false)
const selectedAction = ref<QuickActionItem | null>(null)
const contextMenu = ref()

const newAction = ref<Partial<QuickAction>>({
  title: '',
  description: '',
  icon: 'Star',
  color: '#409EFF',
  path: ''
})

const settings = ref<QuickActionSettings>({
  showBadge: true,
  showDescription: true,
  layout: 'grid'
})

const defaultActions: QuickActionItem[] = [
  {
    id: 'new-order',
    title: '新建订单',
    description: '创建新订单',
    icon: ShoppingCart,
    color: '#67C23A',
    path: '/orders/new',
    pinned: true,
    isCustom: false
  },
  {
    id: 'menu-management',
    title: '菜品管理',
    description: '管理菜品信息',
    icon: Food,
    color: '#E6A23C',
    path: '/menu/items',
    pinned: true,
    isCustom: false
  },
  {
    id: 'customer-query',
    title: '客户查询',
    description: '查询客户信息',
    icon: User,
    color: '#409EFF',
    path: '/customers/list',
    pinned: true,
    isCustom: false
  },
  {
    id: 'report-view',
    title: '查看报表',
    description: '查看数据报表',
    icon: DataAnalysis,
    color: '#909399',
    path: '/reports/sales',
    pinned: true,
    isCustom: false
  },
  {
    id: 'payment-management',
    title: '支付管理',
    description: '管理支付交易',
    icon: CreditCard,
    color: '#F56C6C',
    path: '/payment/transactions',
    pinned: false,
    isCustom: false
  },
  {
    id: 'system-monitor',
    title: '系统监控',
    description: '监控系统状态',
    icon: Monitor,
    color: '#606266',
    path: '/system/monitoring',
    pinned: false,
    isCustom: false
  },
  {
    id: 'reservation',
    title: '预约管理',
    description: '管理客户预约',
    icon: Calendar,
    color: '#E91E63',
    path: '/reservations',
    badge: 3,
    pinned: false,
    isCustom: false
  },
  {
    id: 'message-center',
    title: '消息中心',
    description: '查看系统消息',
    icon: Message,
    color: '#9C27B0',
    path: '/messages',
    badge: 5,
    pinned: false,
    isCustom: false
  }
]

const customActions = ref<QuickActionItem[]>([])

const availableIcons = [
  { name: 'Star', label: '星标' },
  { name: 'TrendCharts', label: '趋势' },
  { name: 'Printer', label: '打印' },
  { name: 'Tools', label: '工具' },
  { name: 'Bell', label: '通知' },
  { name: 'Document', label: '文档' }
]

const displayedActions = computed(() => {
  let actions = [...defaultActions, ...customActions.value]

  if (settings.value.layout === 'grid') {
    actions = actions.filter(a => a.pinned !== false)
  }

  return actions
})

const handleActionClick = (action: QuickActionItem) => {
  if (action.path) {
    router.push(action.path)
  } else {
    ElMessage.info('该功能正在开发中')
  }
}

const showContextMenu = (event: MouseEvent, action: QuickActionItem) => {
  selectedAction.value = action
  contextMenu.value?.handleOpen(event)
}

const handleContextMenuCommand = async (command: string) => {
  if (!selectedAction.value) return

  switch (command) {
    case 'edit':
      newAction.value = { ...selectedAction.value }
      showAddDialog.value = true
      break
    case 'pin':
      selectedAction.value.pinned = !selectedAction.value.pinned
      await saveCustomActions()
      break
    case 'hide':
      if (selectedAction.value.isCustom) {
        customActions.value = customActions.value.filter(a => a.id !== selectedAction.value?.id)
        await saveCustomActions()
      }
      break
    case 'reset':
      ElMessage.success('已重置为默认位置')
      break
  }
}

const addCustomAction = async () => {
  if (!newAction.value.title || !newAction.value.path) {
    ElMessage.warning('请填写完整信息')
    return
  }

  const action: QuickActionItem = {
    id: `custom-${Date.now()}`,
    title: newAction.value.title!,
    description: newAction.value.description || '',
    icon: newAction.value.icon || 'Star',
    color: newAction.value.color || '#409EFF',
    path: newAction.value.path!,
    pinned: true,
    isCustom: true
  }

  customActions.value.push(action)
  await saveCustomActions()

  showAddDialog.value = false
  newAction.value = {
    title: '',
    description: '',
    icon: 'Star',
    color: '#409EFF',
    path: ''
  }

  ElMessage.success('添加成功')
}

const removeCustomAction = async (actionId: string) => {
  customActions.value = customActions.value.filter(a => a.id !== actionId)
  await saveCustomActions()
  ElMessage.success('删除成功')
}

const saveCustomActions = async () => {
  try {
    await quickActionsApi.saveCustomActions(customActions.value)
  } catch (error) {
    console.error('Save custom actions failed:', error)
    ElMessage.error('保存失败')
  }
}

const saveSettings = async () => {
  try {
    await quickActionsApi.saveSettings(settings.value)
    showSettings.value = false
    ElMessage.success('设置保存成功')
  } catch (error) {
    console.error('Save settings failed:', error)
    ElMessage.error('保存失败')
  }
}

const loadCustomActions = async () => {
  try {
    const response = await quickActionsApi.getCustomActions()
    if (response.success && response.data) {
      customActions.value = response.data.map(action => ({
        ...action,
        icon: action.icon || 'Star',
        pinned: action.pinned !== false,
        isCustom: true
      }))
    }
  } catch (error) {
    console.error('Load custom actions failed:', error)
  }
}

const loadSettings = async () => {
  try {
    const response = await quickActionsApi.getSettings()
    if (response.success && response.data) {
      settings.value = response.data
    }
  } catch (error) {
    console.error('Load settings failed:', error)
  }
}

onMounted(async () => {
  await Promise.all([
    loadCustomActions(),
    loadSettings()
  ])
})
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';

.quick-actions {
  background: var(--color-bg-primary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.actions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);

  h3 {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.action-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: var(--transition-all);
  position: relative;

  &:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}

.action-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-md);
  color: var(--color-surface);
  flex-shrink: 0;
}

.action-content {
  flex: 1;
  min-width: 0;
}

.action-title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-desc {
  font-size: var(--font-size-body-small);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: var(--color-danger);
  color: var(--color-surface);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-body-tiny);
  font-weight: var(--font-weight-semibold);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.settings-section {
  h4 {
    margin: 0 0 var(--spacing-md) 0;
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  .el-checkbox,
  .el-radio {
    display: block;
    margin-bottom: var(--spacing-sm);
  }
}

.custom-actions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  max-height: 300px;
  overflow-y: auto;
}

.custom-action-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--border-radius-sm);
}

@media (max-width: $breakpoint-md) {
  .actions-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--spacing-sm);
  }

  .action-icon {
    width: 40px;
    height: 40px;
  }

  .action-title {
    font-size: var(--font-size-body-small);
  }

  .action-desc {
    display: none;
  }
}

@media (max-width: $breakpoint-sm) {
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
