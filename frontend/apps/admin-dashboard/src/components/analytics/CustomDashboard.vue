/**
 * @fileoverview 自定义仪表板组件
 * @description 提供自定义数据可视化仪表板功能，支持拖拽布局、组件配置、实时数据更新等
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

<template>
  <div class="custom-dashboard">
    <!-- 仪表板头部 -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="title-section">
          <h1>{{ currentDashboard?.name || '自定义仪表板' }}</h1>
          <p>{{ currentDashboard?.description || '创建和管理您的自定义数据仪表板' }}</p>
        </div>
        <div class="header-actions">
          <el-select v-model="selectedDashboardId" @change="loadDashboard" placeholder="选择仪表板">
            <el-option
              v-for="dashboard in dashboardList"
              :key="dashboard.id"
              :label="dashboard.name"
              :value="dashboard.id"
            />
          </el-select>
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            新建仪表板
          </el-button>
          <el-button @click="showEditDialog = true" :disabled="!currentDashboard">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button @click="refreshDashboard" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-dropdown @command="handleMoreCommand">
            <el-button>
              更多
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="duplicate" :disabled="!currentDashboard">
                  复制仪表板
                </el-dropdown-item>
                <el-dropdown-item command="share" :disabled="!currentDashboard">
                  分享仪表板
                </el-dropdown-item>
                <el-dropdown-item command="export" :disabled="!currentDashboard">
                  导出配置
                </el-dropdown-item>
                <el-dropdown-item command="import">
                  导入配置
                </el-dropdown-item>
                <el-dropdown-item command="delete" :disabled="!currentDashboard" divided>
                  删除仪表板
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 仪表板工具栏 -->
    <div class="dashboard-toolbar" v-if="currentDashboard">
      <div class="toolbar-left">
        <el-button-group>
          <el-button
            :type="editMode ? 'primary' : 'default'"
            @click="toggleEditMode"
          >
            <el-icon><Edit /></el-icon>
            {{ editMode ? '退出编辑' : '编辑模式' }}
          </el-button>
          <el-button @click="addWidget" :disabled="!editMode">
            <el-icon><Plus /></el-icon>
            添加组件
          </el-button>
          <el-button @click="resetLayout" :disabled="!editMode">
            <el-icon><RefreshLeft /></el-icon>
            重置布局
          </el-button>
        </el-button-group>
      </div>
      <div class="toolbar-right">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="onDateRangeChange"
          style="margin-right: 10px;"
        />
        <el-button @click="autoRefresh = !autoRefresh">
          <el-icon><Timer /></el-icon>
          {{ autoRefresh ? '停止自动刷新' : '开启自动刷新' }}
        </el-button>
      </div>
    </div>

    <!-- 仪表板内容 -->
    <div class="dashboard-content" v-if="currentDashboard">
      <div class="widgets-grid" :style="{ gridTemplateColumns: `repeat(${currentDashboard.layout.columns}, 1fr)`, gap: `${currentDashboard.layout.gap}px` }">
        <div
          v-for="widget in currentDashboard.widgets"
          :key="widget.id"
          class="widget-container"
          :class="{ 'editing': editMode, 'dragging': draggingWidget === widget.id }"
          :style="{
            gridColumn: `span ${widget.layout.width}`,
            gridRow: `span ${widget.layout.height}`
          }"
          draggable="true"
          @dragstart="onDragStart(widget.id, $event)"
          @dragover="onDragOver($event)"
          @drop="onDrop(widget.id, $event)"
          @dragend="onDragEnd"
        >
          <!-- 组件头部 -->
          <div class="widget-header" v-if="editMode">
            <div class="widget-title">{{ widget.title }}</div>
            <div class="widget-actions">
              <el-button size="small" text @click="editWidget(widget)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button size="small" text @click="removeWidget(widget.id)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>

          <!-- 组件内容 -->
          <div class="widget-content">
            <div v-if="getWidgetComponent(widget.type) === 'div'" class="placeholder-content">
              <el-empty description="组件开发中" :image-size="60" />
            </div>
            <div v-else class="widget-placeholder">
              <el-icon :size="32"><TrendCharts /></el-icon>
              <p>{{ widget.title }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <el-empty description="请选择或创建一个仪表板">
        <el-button type="primary" @click="showCreateDialog = true">
          创建仪表板
        </el-button>
      </el-empty>
    </div>

    <!-- 创建仪表板对话框 -->
    <el-dialog v-model="showCreateDialog" title="创建仪表板" width="50%">
      <el-form :model="newDashboard" :rules="dashboardRules" ref="createFormRef" label-width="100px">
        <el-form-item label="仪表板名称" prop="name">
          <el-input v-model="newDashboard.name" placeholder="输入仪表板名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="newDashboard.description"
            type="textarea"
            :rows="3"
            placeholder="输入仪表板描述"
          />
        </el-form-item>
        <el-form-item label="列数" prop="columns">
          <el-input-number v-model="newDashboard.layout.columns" :min="2" :max="12" />
        </el-form-item>
        <el-form-item label="间距" prop="gap">
          <el-input-number v-model="newDashboard.layout.gap" :min="0" :max="50" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="createDashboard">创建</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑仪表板对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑仪表板" width="50%">
      <el-form :model="editDashboard" :rules="dashboardRules" ref="editFormRef" label-width="100px">
        <el-form-item label="仪表板名称" prop="name">
          <el-input v-model="editDashboard.name" placeholder="输入仪表板名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="editDashboard.description"
            type="textarea"
            :rows="3"
            placeholder="输入仪表板描述"
          />
        </el-form-item>
        <el-form-item label="列数" prop="columns">
          <el-input-number v-model="editDashboard.layout.columns" :min="2" :max="12" />
        </el-form-item>
        <el-form-item label="间距" prop="gap">
          <el-input-number v-model="editDashboard.layout.gap" :min="0" :max="50" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="updateDashboard">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加组件对话框 -->
    <el-dialog v-model="showAddWidgetDialog" title="添加组件" width="60%">
      <el-tabs v-model="widgetTab">
        <el-tab-pane label="指标卡片" name="metric">
          <div class="widget-gallery">
            <div
              v-for="widget in metricWidgets"
              :key="widget.id"
              class="widget-item"
              @click="addWidgetToDashboard(widget)"
            >
              <div class="widget-icon" :style="{ backgroundColor: widget.color }">
                <el-icon :size="24">
                  <component :is="widget.icon" />
                </el-icon>
              </div>
              <div class="widget-info">
                <div class="widget-name">{{ widget.name }}</div>
                <div class="widget-desc">{{ widget.description }}</div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="图表" name="chart">
          <div class="widget-gallery">
            <div
              v-for="widget in chartWidgets"
              :key="widget.id"
              class="widget-item"
              @click="addWidgetToDashboard(widget)"
            >
              <div class="widget-icon" :style="{ backgroundColor: widget.color }">
                <el-icon :size="24">
                  <component :is="widget.icon" />
                </el-icon>
              </div>
              <div class="widget-info">
                <div class="widget-name">{{ widget.name }}</div>
                <div class="widget-desc">{{ widget.description }}</div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="表格" name="table">
          <div class="widget-gallery">
            <div
              v-for="widget in tableWidgets"
              :key="widget.id"
              class="widget-item"
              @click="addWidgetToDashboard(widget)"
            >
              <div class="widget-icon" :style="{ backgroundColor: widget.color }">
                <el-icon :size="24">
                  <component :is="widget.icon" />
                </el-icon>
              </div>
              <div class="widget-info">
                <div class="widget-name">{{ widget.name }}</div>
                <div class="widget-desc">{{ widget.description }}</div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 编辑组件对话框 -->
    <el-dialog v-model="showEditWidgetDialog" title="编辑组件" width="50%">
      <el-form :model="editingWidget" label-width="100px">
        <el-form-item label="组件标题">
          <el-input v-model="editingWidget.title" />
        </el-form-item>
        <el-form-item label="刷新间隔">
          <el-input-number v-model="editingWidget.refreshInterval" :min="0" :max="3600" />
          <span style="margin-left: 10px;">秒</span>
        </el-form-item>
        <el-form-item label="显示图例">
          <el-switch v-model="editingWidget.visualization.showLegend" />
        </el-form-item>
        <el-form-item label="显示网格">
          <el-switch v-model="editingWidget.visualization.showGrid" />
        </el-form-item>
        <el-form-item label="显示标签">
          <el-switch v-model="editingWidget.visualization.showLabels" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditWidgetDialog = false">取消</el-button>
          <el-button type="primary" @click="saveWidget">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分享对话框 -->
    <el-dialog v-model="showShareDialog" title="分享仪表板" width="50%">
      <el-form label-width="100px">
        <el-form-item label="分享链接">
          <el-input v-model="shareUrl" readonly>
            <template #append>
              <el-button @click="copyShareUrl">复制</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="权限设置">
          <el-radio-group v-model="sharePermission">
            <el-radio label="view">只读</el-radio>
            <el-radio label="edit">可编辑</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="有效期">
          <el-select v-model="shareExpiry">
            <el-option label="永久" value="never" />
            <el-option label="1天" value="1d" />
            <el-option label="7天" value="7d" />
            <el-option label="30天" value="30d" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showShareDialog = false">关闭</el-button>
          <el-button type="primary" @click="generateShareLink">生成链接</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Edit,
  Delete,
  Refresh,
  ArrowDown,
  Timer,
  RefreshLeft,
  Money,
  ShoppingCart,
  User,
  TrendCharts,
  DataLine,
  PieChart,
  List,
  Calendar,
  Warning
} from '@element-plus/icons-vue'

// 组件类型
enum WidgetType {
  METRIC = 'metric',
  CHART = 'chart',
  TABLE = 'table',
  GAUGE = 'gauge',
  PROGRESS = 'progress'
}

// 图表类型
enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
  AREA = 'area',
  SCATTER = 'scatter',
  HEATMAP = 'heatmap'
}

// 仪表板接口
interface Dashboard {
  id: number
  name: string
  description: string
  widgets: Widget[]
  layout: {
    columns: number
    gap: number
  }
  sharing: {
    isPublic: boolean
    allowedUsers: number[]
    permissions: ('view' | 'edit')[]
  }
  createdAt: string
  updatedAt?: string
}

// 组件接口
interface Widget {
  id: string
  type: WidgetType
  title: string
  analytics: string
  metrics: string[]
  dimensions: string[]
  filters: Record<string, any>
  visualization: {
    chartType?: ChartType
    colorScheme: string[]
    showLegend: boolean
    showGrid: boolean
    showLabels: boolean
  }
  layout: {
    x: number
    y: number
    width: number
    height: number
  }
  refreshInterval: number
}

// 响应式数据
const loading = ref(false)
const editMode = ref(false)
const autoRefresh = ref(false)
const selectedDashboardId = ref<number | null>(null)
const dateRange = ref<[Date, Date] | null>(null)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showAddWidgetDialog = ref(false)
const showEditWidgetDialog = ref(false)
const showShareDialog = ref(false)
const widgetTab = ref('metric')
const widgetLoading = ref<Record<string, boolean>>({})
const draggingWidget = ref('')
const shareUrl = ref('')
const sharePermission = ref('view')
const shareExpiry = ref('never')

// 表单引用
const createFormRef = ref()
const editFormRef = ref()

// 仪表板列表
const dashboardList = ref<Dashboard[]>([
  {
    id: 1,
    name: '销售仪表板',
    description: '销售数据总览',
    widgets: [],
    layout: {
      columns: 6,
      gap: 16
    },
    sharing: {
      isPublic: false,
      allowedUsers: [],
      permissions: ['view']
    },
    createdAt: '2025-01-20'
  },
  {
    id: 2,
    name: '运营仪表板',
    description: '运营效率监控',
    widgets: [],
    layout: {
      columns: 6,
      gap: 16
    },
    sharing: {
      isPublic: false,
      allowedUsers: [],
      permissions: ['view']
    },
    createdAt: '2025-01-20'
  }
])

// 当前仪表板
const currentDashboard = ref<Dashboard | null>(null)

// 新建仪表板表单
const newDashboard = reactive({
  name: '',
  description: '',
  layout: {
    columns: 6,
    gap: 16
  }
})

// 编辑仪表板表单
const editDashboard = reactive({
  name: '',
  description: '',
  layout: {
    columns: 6,
    gap: 16
  }
})

// 编辑组件
const editingWidget = ref<Widget | null>(null)

// 表单验证规则
const dashboardRules = {
  name: [
    { required: true, message: '请输入仪表板名称', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入仪表板描述', trigger: 'blur' }
  ]
}

// 可用组件列表
const metricWidgets = [
  {
    id: 'metric-revenue',
    type: WidgetType.METRIC,
    name: '收入指标',
    description: '显示总收入、订单数等核心指标',
    icon: 'Money',
    color: '#409EFF',
    analytics: 'sales',
    metrics: ['totalRevenue', 'totalOrders']
  },
  {
    id: 'metric-orders',
    type: WidgetType.METRIC,
    name: '订单指标',
    description: '显示订单相关指标',
    icon: 'ShoppingCart',
    color: '#67C23A',
    analytics: 'orders',
    metrics: ['totalOrders', 'averageOrderValue']
  },
  {
    id: 'metric-customers',
    type: WidgetType.METRIC,
    name: '客户指标',
    description: '显示客户相关指标',
    icon: 'User',
    color: '#E6A23C',
    analytics: 'customer',
    metrics: ['totalCustomers', 'newCustomers']
  }
]

const chartWidgets = [
  {
    id: 'chart-trend',
    type: WidgetType.CHART,
    name: '趋势图',
    description: '显示数据随时间的变化趋势',
    icon: 'DataLine',
    color: '#409EFF',
    analytics: 'sales',
    chartType: ChartType.LINE
  },
  {
    id: 'chart-bar',
    type: WidgetType.CHART,
    name: '柱状图',
    description: '显示数据的对比分析',
    icon: 'TrendCharts',
    color: '#67C23A',
    analytics: 'sales',
    chartType: ChartType.BAR
  },
  {
    id: 'chart-pie',
    type: WidgetType.CHART,
    name: '饼图',
    description: '显示数据的占比分布',
    icon: 'PieChart',
    color: '#E6A23C',
    analytics: 'sales',
    chartType: ChartType.PIE
  }
]

const tableWidgets = [
  {
    id: 'table-orders',
    type: WidgetType.TABLE,
    name: '订单列表',
    description: '显示订单数据表格',
    icon: 'List',
    color: '#409EFF',
    analytics: 'orders'
  },
  {
    id: 'table-alerts',
    type: WidgetType.TABLE,
    name: '预警列表',
    description: '显示预警数据表格',
    icon: 'Warning',
    color: '#F56C6C',
    analytics: 'alerts'
  }
]

// 计算属性
const currentDashboardId = computed(() => currentDashboard.value?.id || null)

// 方法
const loadDashboard = async (id: number) => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    currentDashboard.value = dashboardList.value.find(d => d.id === id) || null
    if (currentDashboard.value) {
      await refreshDashboard()
    }
  } catch (error) {
    console.error('加载仪表板失败:', error)
    ElMessage.error('加载仪表板失败')
  } finally {
    loading.value = false
  }
}

const refreshDashboard = async () => {
  if (!currentDashboard.value) return

  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('仪表板数据已刷新')
  } catch (error) {
    console.error('刷新仪表板失败:', error)
    ElMessage.error('刷新仪表板失败')
  } finally {
    loading.value = false
  }
}

const refreshWidget = async (widgetId: string) => {
  widgetLoading.value[widgetId] = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('组件数据已刷新')
  } catch (error) {
    console.error('刷新组件失败:', error)
    ElMessage.error('刷新组件失败')
  } finally {
    widgetLoading.value[widgetId] = false
  }
}

const toggleEditMode = () => {
  editMode.value = !editMode.value
  ElMessage.info(editMode.value ? '进入编辑模式' : '退出编辑模式')
}

const addWidget = () => {
  showAddWidgetDialog.value = true
}

const addWidgetToDashboard = (widget: any) => {
  if (!currentDashboard.value) return

  const newWidget: Widget = {
    id: `widget-${Date.now()}`,
    type: widget.type,
    title: widget.name,
    analytics: widget.analytics,
    metrics: widget.metrics || [],
    dimensions: [],
    filters: {},
    visualization: {
      chartType: widget.chartType,
      colorScheme: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'],
      showLegend: true,
      showGrid: true,
      showLabels: true
    },
    layout: {
      x: 0,
      y: 0,
      width: 2,
      height: 2
    },
    refreshInterval: 300
  }

  currentDashboard.value.widgets.push(newWidget)
  showAddWidgetDialog.value = false
  ElMessage.success('组件已添加')
}

const editWidget = (widget: Widget) => {
  editingWidget.value = JSON.parse(JSON.stringify(widget))
  showEditWidgetDialog.value = true
}

const saveWidget = () => {
  if (!currentDashboard.value || !editingWidget.value) return

  const index = currentDashboard.value.widgets.findIndex(w => w.id === editingWidget.value!.id)
  if (index !== -1) {
    currentDashboard.value.widgets[index] = editingWidget.value
  }

  showEditWidgetDialog.value = false
  ElMessage.success('组件已保存')
}

const removeWidget = async (widgetId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除此组件吗？', '确认删除', {
      type: 'warning'
    })

    if (!currentDashboard.value) return

    currentDashboard.value.widgets = currentDashboard.value.widgets.filter(w => w.id !== widgetId)
    ElMessage.success('组件已删除')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除组件失败:', error)
      ElMessage.error('删除组件失败')
    }
  }
}

const resetLayout = () => {
  ElMessage.info('布局已重置')
}

const onLayoutUpdated = (newLayout: any[]) => {
  if (currentDashboard.value) {
    currentDashboard.value.widgets = newLayout.map((item, index) => ({
      ...currentDashboard.value!.widgets[index],
      layout: {
        x: item.x,
        y: item.y,
        width: item.w,
        height: item.h
      }
    }))
    saveDashboardChanges()
  }
}

const onDragStart = (widgetId: string, event: DragEvent) => {
  draggingWidget.value = widgetId
  event.dataTransfer!.effectAllowed = 'move'
  event.dataTransfer!.setData('text/plain', widgetId)
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  event.dataTransfer!.dropEffect = 'move'
}

const onDrop = (targetWidgetId: string, event: DragEvent) => {
  event.preventDefault()
  const draggedWidgetId = event.dataTransfer!.getData('text/plain')
  
  if (draggedWidgetId && draggedWidgetId !== targetWidgetId && currentDashboard.value) {
    const widgets = [...currentDashboard.value.widgets]
    const draggedIndex = widgets.findIndex(w => w.id === draggedWidgetId)
    const targetIndex = widgets.findIndex(w => w.id === targetWidgetId)
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [removed] = widgets.splice(draggedIndex, 1)
      widgets.splice(targetIndex, 0, removed)
      currentDashboard.value.widgets = widgets
      saveDashboardChanges()
    }
  }
  draggingWidget.value = ''
}

const onDragEnd = () => {
  draggingWidget.value = ''
}

const onDateRangeChange = (value: [Date, Date] | null) => {
  console.log('Date range changed:', value)
  refreshDashboard()
}

const createDashboard = async () => {
  try {
    await createFormRef.value.validate()

    const dashboard: Dashboard = {
      id: Date.now(),
      name: newDashboard.name,
      description: newDashboard.description,
      widgets: [],
      layout: {
        columns: newDashboard.layout.columns,
        gap: newDashboard.layout.gap
      },
      sharing: {
        isPublic: false,
        allowedUsers: [],
        permissions: ['view']
      },
      createdAt: new Date().toISOString()
    }

    dashboardList.value.push(dashboard)
    selectedDashboardId.value = dashboard.id
    showCreateDialog.value = false

    ElMessage.success('仪表板创建成功')
  } catch (error) {
    console.error('创建仪表板失败:', error)
  }
}

const updateDashboard = async () => {
  try {
    await editFormRef.value.validate()

    if (!currentDashboard.value) return

    currentDashboard.value.name = editDashboard.name
    currentDashboard.value.description = editDashboard.description
    currentDashboard.value.layout = {
      columns: editDashboard.layout.columns,
      gap: editDashboard.layout.gap
    }

    showEditDialog.value = false
    ElMessage.success('仪表板已更新')
  } catch (error) {
    console.error('更新仪表板失败:', error)
  }
}

const handleMoreCommand = async (command: string) => {
  switch (command) {
    case 'duplicate':
      await duplicateDashboard()
      break
    case 'share':
      showShareDialog.value = true
      break
    case 'export':
      await exportDashboard()
      break
    case 'import':
      await importDashboard()
      break
    case 'delete':
      await deleteDashboard()
      break
  }
}

const duplicateDashboard = async () => {
  if (!currentDashboard.value) return

  try {
    await ElMessageBox.confirm('确定要复制此仪表板吗？', '确认复制', {
      type: 'warning'
    })

    const duplicated: Dashboard = {
      ...JSON.parse(JSON.stringify(currentDashboard.value)),
      id: Date.now(),
      name: `${currentDashboard.value.name} (副本)`,
      createdAt: new Date().toISOString()
    }

    dashboardList.value.push(duplicated)
    ElMessage.success('仪表板已复制')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('复制仪表板失败:', error)
      ElMessage.error('复制仪表板失败')
    }
  }
}

const exportDashboard = async () => {
  if (!currentDashboard.value) return

  try {
    const data = JSON.stringify(currentDashboard.value, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dashboard-${currentDashboard.value.name}.json`
    a.click()
    URL.revokeObjectURL(url)

    ElMessage.success('仪表板配置已导出')
  } catch (error) {
    console.error('导出仪表板失败:', error)
    ElMessage.error('导出仪表板失败')
  }
}

const importDashboard = async () => {
  try {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'

    input.onchange = async (e: any) => {
      const file = e.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event: any) => {
        try {
          const dashboard: Dashboard = JSON.parse(event.target.result)
          dashboard.id = Date.now()
          dashboard.createdAt = new Date().toISOString()

          dashboardList.value.push(dashboard)
          selectedDashboardId.value = dashboard.id

          ElMessage.success('仪表板配置已导入')
        } catch (error) {
          console.error('解析仪表板配置失败:', error)
          ElMessage.error('解析仪表板配置失败')
        }
      }
      reader.readAsText(file)
    }

    input.click()
  } catch (error) {
    console.error('导入仪表板失败:', error)
    ElMessage.error('导入仪表板失败')
  }
}

const deleteDashboard = async () => {
  if (!currentDashboard.value) return

  try {
    await ElMessageBox.confirm('确定要删除此仪表板吗？此操作不可恢复。', '确认删除', {
      type: 'warning'
    })

    dashboardList.value = dashboardList.value.filter(d => d.id !== currentDashboard.value!.id)
    currentDashboard.value = null
    selectedDashboardId.value = null

    ElMessage.success('仪表板已删除')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除仪表板失败:', error)
      ElMessage.error('删除仪表板失败')
    }
  }
}

const generateShareLink = () => {
  shareUrl.value = `https://yyc3.com/dashboard/share/${currentDashboard.value?.id}?permission=${sharePermission.value}&expiry=${shareExpiry.value}`
  ElMessage.success('分享链接已生成')
}

const copyShareUrl = () => {
  navigator.clipboard.writeText(shareUrl.value)
  ElMessage.success('分享链接已复制')
}

const getWidgetComponent = (type: WidgetType) => {
  const components: Record<string, any> = {
    [WidgetType.METRIC]: 'MetricWidget',
    [WidgetType.CHART]: 'ChartWidget',
    [WidgetType.TABLE]: 'TableWidget',
    [WidgetType.GAUGE]: 'GaugeWidget',
    [WidgetType.PROGRESS]: 'ProgressWidget'
  }
  return components[type] || 'div'
}

const getWidgetProps = (widget: Widget) => {
  return {
    title: widget.title,
    analytics: widget.analytics,
    metrics: widget.metrics,
    filters: widget.filters,
    visualization: widget.visualization
  }
}

// 生命周期
onMounted(() => {
  if (dashboardList.value.length > 0) {
    selectedDashboardId.value = dashboardList.value[0].id
    loadDashboard(selectedDashboardId.value)
  }
})
</script>

<style lang="scss" scoped>
.custom-dashboard {
  padding: 20px;

  .dashboard-header {
    margin-bottom: 20px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title-section {
        h1 {
          margin: 0 0 5px 0;
          font-size: 24px;
          font-weight: 600;
        }

        p {
          margin: 0;
          color: #909399;
          font-size: 14px;
        }
      }

      .header-actions {
        display: flex;
        gap: 10px;
      }
    }
  }

  .dashboard-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px;
    background: #f5f7fa;
    border-radius: 8px;

    .toolbar-left {
      display: flex;
      gap: 10px;
    }

    .toolbar-right {
      display: flex;
      gap: 10px;
    }
  }

  .dashboard-content {
    .widget-container {
      height: 100%;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      overflow: hidden;
      display: flex;
      flex-direction: column;

      &.editing {
        border: 2px dashed #409EFF;
      }

      .widget-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 15px;
        background: #f5f7fa;
        border-bottom: 1px solid #ebeef5;

        .widget-title {
          font-weight: 600;
          font-size: 14px;
        }

        .widget-actions {
          display: flex;
          gap: 5px;
        }
      }

      .widget-content {
        flex: 1;
        padding: 15px;
        overflow: auto;
      }
    }
  }

  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
  }

  .widget-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;

    .widget-item {
      display: flex;
      align-items: center;
      padding: 20px;
      border: 1px solid #ebeef5;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: #409EFF;
        box-shadow: 0 2px 12px 0 rgba(64, 158, 255, 0.2);
        transform: translateY(-2px);
      }

      .widget-icon {
        width: 50px;
        height: 50px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        margin-right: 15px;
      }

      .widget-info {
        flex: 1;

        .widget-name {
          font-weight: 600;
          margin-bottom: 5px;
        }

        .widget-desc {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}
</style>
