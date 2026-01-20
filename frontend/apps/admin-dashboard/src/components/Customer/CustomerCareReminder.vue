<template>
  <div class="customer-care-reminder">
    <el-card class="care-card">
      <template #header>
        <div class="card-header">
          <span>智能客户关怀提醒</span>
          <el-button-group>
            <el-button size="small" @click="refreshReminders">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button type="primary" size="small" @click="showCreateDialog = true">
              <el-icon><Plus /></el-icon>
              新建关怀
            </el-button>
            <el-button size="small" @click="showConfigDialog = true">
              <el-icon><Setting /></el-icon>
              配置规则
            </el-button>
          </el-button-group>
        </div>
      </template>

      <div class="care-content">
        <div class="care-overview">
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="overview-card pending">
                <div class="card-icon">
                  <el-icon :size="40"><Clock /></el-icon>
                </div>
                <div class="card-info">
                  <div class="card-label">待处理</div>
                  <div class="card-value">{{ careStats.pending }}</div>
                  <div class="card-trend">今日新增 {{ careStats.todayNew }}</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="overview-card processing">
                <div class="card-icon">
                  <el-icon :size="40"><Loading /></el-icon>
                </div>
                <div class="card-info">
                  <div class="card-label">处理中</div>
                  <div class="card-value">{{ careStats.processing }}</div>
                  <div class="card-trend">进行中 {{ careStats.inProgress }}</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="overview-card completed">
                <div class="card-icon">
                  <el-icon :size="40"><SuccessFilled /></el-icon>
                </div>
                <div class="card-info">
                  <div class="card-label">已完成</div>
                  <div class="card-value">{{ careStats.completed }}</div>
                  <div class="card-trend">完成率 {{ careStats.completionRate }}%</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="overview-card overdue">
                <div class="card-icon">
                  <el-icon :size="40"><WarningFilled /></el-icon>
                </div>
                <div class="card-info">
                  <div class="card-label">已逾期</div>
                  <div class="card-value">{{ careStats.overdue }}</div>
                  <div class="card-trend">需紧急处理</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="care-filters">
          <el-form :inline="true" :model="filters" class="filter-form">
            <el-form-item label="关怀类型">
              <el-select v-model="filters.type" placeholder="全部类型" clearable>
                <el-option
                  v-for="type in careTypes"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="优先级">
              <el-select v-model="filters.priority" placeholder="全部优先级" clearable>
                <el-option label="高" value="high" />
                <el-option label="中" value="medium" />
                <el-option label="低" value="low" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="filters.status" placeholder="全部状态" clearable>
                <el-option label="待处理" value="pending" />
                <el-option label="处理中" value="processing" />
                <el-option label="已完成" value="completed" />
                <el-option label="已逾期" value="overdue" />
              </el-select>
            </el-form-item>
            <el-form-item label="触发方式">
              <el-select v-model="filters.triggerType" placeholder="全部方式" clearable>
                <el-option label="自动触发" value="auto" />
                <el-option label="手动创建" value="manual" />
              </el-select>
            </el-form-item>
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @change="handleDateChange"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="loadReminders">
                <el-icon><Search /></el-icon>
                查询
              </el-button>
              <el-button @click="resetFilters">
                <el-icon><RefreshLeft /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="care-reminders">
          <el-table :data="reminderList" stripe>
            <el-table-column type="index" label="序号" width="80" />
            <el-table-column label="客户信息" width="180">
              <template #default="{ row }">
                <div class="customer-info">
                  <div class="customer-name">{{ row.customerName }}</div>
                  <div class="customer-phone">{{ row.customerPhone }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="关怀类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getCareTypeTagType(row.type)" size="small">
                  {{ getCareTypeLabel(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="关怀内容" min-width="200">
              <template #default="{ row }">
                <div class="care-content">{{ row.content }}</div>
              </template>
            </el-table-column>
            <el-table-column label="优先级" width="100">
              <template #default="{ row }">
                <el-tag :type="getPriorityTagType(row.priority)" size="small">
                  {{ getPriorityLabel(row.priority) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)" size="small">
                  {{ getStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="触发方式" width="100">
              <template #default="{ row }">
                <el-tag :type="row.triggerType === 'auto' ? 'success' : 'info'" size="small">
                  {{ row.triggerType === 'auto' ? '自动' : '手动' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="截止时间" width="160">
              <template #default="{ row }">
                <div :class="{ 'overdue': isOverdue(row.deadline) }">
                  {{ formatDateTime(row.deadline) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="负责人" width="100">
              <template #default="{ row }">
                {{ row.assignee || '未分配' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button size="small" text type="primary" @click="viewDetail(row)">
                  详情
                </el-button>
                <el-button
                  v-if="row.status === 'pending' || row.status === 'processing'"
                  size="small"
                  text type="primary"
                  @click="handleCare(row)"
                >
                  处理
                </el-button>
                <el-button size="small" text type="primary" @click="editCare(row)">
                  编辑
                </el-button>
                <el-button size="small" text type="danger" @click="deleteCare(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :total="pagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </div>

        <div class="care-rules">
          <h3>自动关怀规则</h3>
          <el-table :data="careRules" stripe>
            <el-table-column prop="ruleName" label="规则名称" width="200" />
            <el-table-column label="触发条件" min-width="250">
              <template #default="{ row }">
                <div class="trigger-condition">{{ row.triggerCondition }}</div>
              </template>
            </el-table-column>
            <el-table-column label="关怀动作" min-width="200">
              <template #default="{ row }">
                <div class="care-action">{{ row.careAction }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="priority" label="优先级" width="100">
              <template #default="{ row }">
                <el-tag :type="getPriorityTagType(row.priority)" size="small">
                  {{ getPriorityLabel(row.priority) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.enabled ? 'success' : 'info'" size="small">
                  {{ row.enabled ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button size="small" text type="primary" @click="editRule(row)">
                  编辑
                </el-button>
                <el-button size="small" text type="primary" @click="toggleRule(row)">
                  {{ row.enabled ? '禁用' : '启用' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-card>

    <el-dialog
      v-model="showCreateDialog"
      title="新建关怀提醒"
      width="700px"
      @closed="resetCreateForm"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="120px"
      >
        <el-form-item label="客户" prop="customerId">
          <el-select
            v-model="createForm.customerId"
            placeholder="请选择客户"
            filterable
            remote
            :remote-method="searchCustomers"
            :loading="customerSearchLoading"
          >
            <el-option
              v-for="customer in customerOptions"
              :key="customer.id"
              :label="`${customer.name} (${customer.phone})`"
              :value="customer.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关怀类型" prop="type">
          <el-select v-model="createForm.type" placeholder="请选择关怀类型">
            <el-option
              v-for="type in careTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关怀内容" prop="content">
          <el-input
            v-model="createForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入关怀内容"
          />
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-radio-group v-model="createForm.priority">
            <el-radio label="high">高</el-radio>
            <el-radio label="medium">中</el-radio>
            <el-radio label="low">低</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="截止时间" prop="deadline">
          <el-date-picker
            v-model="createForm.deadline"
            type="datetime"
            placeholder="请选择截止时间"
            :disabled-date="disabledDate"
          />
        </el-form-item>
        <el-form-item label="负责人" prop="assignee">
          <el-input v-model="createForm.assignee" placeholder="请输入负责人姓名" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="createForm.note"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createCare" :loading="creating">
          创建
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showConfigDialog"
      title="自动关怀规则配置"
      width="900px"
      @closed="resetConfigForm"
    >
      <el-form
        ref="configFormRef"
        :model="configForm"
        :rules="configRules"
        label-width="120px"
      >
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="configForm.ruleName" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="触发条件" prop="triggerCondition">
          <el-input
            v-model="configForm.triggerCondition"
            type="textarea"
            :rows="3"
            placeholder="请输入触发条件，如：客户生日前7天"
          />
        </el-form-item>
        <el-form-item label="关怀动作" prop="careAction">
          <el-input
            v-model="configForm.careAction"
            type="textarea"
            :rows="3"
            placeholder="请输入关怀动作，如：发送生日祝福短信"
          />
        </el-form-item>
        <el-form-item label="关怀类型" prop="type">
          <el-select v-model="configForm.type" placeholder="请选择关怀类型">
            <el-option
              v-for="type in careTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-radio-group v-model="configForm.priority">
            <el-radio label="high">高</el-radio>
            <el-radio label="medium">中</el-radio>
            <el-radio label="low">低</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="截止时间">
          <el-input-number
            v-model="configForm.deadlineHours"
            :min="1"
            :max="168"
            :step="1"
          />
          <span class="unit">小时后</span>
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="configForm.enabled" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showConfigDialog = false">取消</el-button>
        <el-button type="primary" @click="saveConfig" :loading="saving">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  Plus,
  Setting,
  Clock,
  Loading,
  SuccessFilled,
  WarningFilled,
  Search,
  RefreshLeft
} from '@element-plus/icons-vue'

interface CareStats {
  pending: number
  todayNew: number
  processing: number
  inProgress: number
  completed: number
  completionRate: number
  overdue: number
}

interface CareReminder {
  id: string
  customerName: string
  customerPhone: string
  type: string
  content: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'processing' | 'completed' | 'overdue'
  triggerType: 'auto' | 'manual'
  deadline: string
  assignee: string
  note?: string
}

interface CareRule {
  id: string
  ruleName: string
  triggerCondition: string
  careAction: string
  type: string
  priority: 'high' | 'medium' | 'low'
  deadlineHours: number
  enabled: boolean
}

const showCreateDialog = ref(false)
const showConfigDialog = ref(false)
const creating = ref(false)
const saving = ref(false)
const customerSearchLoading = ref(false)
const createFormRef = ref()
const configFormRef = ref()
const dateRange = ref<[Date, Date] | null>(null)

const careStats = ref<CareStats>({
  pending: 45,
  todayNew: 12,
  processing: 28,
  inProgress: 15,
  completed: 156,
  completionRate: 78.5,
  overdue: 8
})

const careTypes = [
  { label: '生日关怀', value: 'birthday' },
  { label: '节日关怀', value: 'holiday' },
  { label: '新客户关怀', value: 'new_customer' },
  { label: '流失预警关怀', value: 'churn_warning' },
  { label: '消费提醒', value: 'purchase_reminder' },
  { label: '会员升级关怀', value: 'member_upgrade' },
  { label: '投诉跟进', value: 'complaint_followup' },
  { label: '其他', value: 'other' }
]

const reminderList = ref<CareReminder[]>([
  {
    id: '1',
    customerName: '张三',
    customerPhone: '13800138000',
    type: 'birthday',
    content: '客户生日在3天后，发送生日祝福短信和优惠券',
    priority: 'high',
    status: 'pending',
    triggerType: 'auto',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    assignee: '李四'
  },
  {
    id: '2',
    customerName: '李四',
    customerPhone: '13900139000',
    type: 'churn_warning',
    content: '客户30天未消费，流失风险高，进行电话回访',
    priority: 'high',
    status: 'processing',
    triggerType: 'auto',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    assignee: '王五'
  },
  {
    id: '3',
    customerName: '王五',
    customerPhone: '13700137000',
    type: 'new_customer',
    content: '新客户首次消费后，发送欢迎短信和新人礼包',
    priority: 'medium',
    status: 'completed',
    triggerType: 'auto',
    deadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    assignee: '赵六'
  }
])

const careRules = ref<CareRule[]>([
  {
    id: '1',
    ruleName: '生日关怀',
    triggerCondition: '客户生日前7天',
    careAction: '发送生日祝福短信和专属优惠券',
    type: 'birthday',
    priority: 'high',
    deadlineHours: 24,
    enabled: true
  },
  {
    id: '2',
    ruleName: '流失预警关怀',
    triggerCondition: '客户30天未消费',
    careAction: '发送关怀短信，提供专属优惠',
    type: 'churn_warning',
    priority: 'high',
    deadlineHours: 48,
    enabled: true
  },
  {
    id: '3',
    ruleName: '新客户关怀',
    triggerCondition: '客户完成首次订单',
    careAction: '发送欢迎短信和新人礼包',
    type: 'new_customer',
    priority: 'medium',
    deadlineHours: 24,
    enabled: true
  }
])

const customerOptions = ref<any[]>([])

const filters = reactive({
  type: '',
  priority: '',
  status: '',
  triggerType: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 100
})

const createForm = reactive({
  customerId: '',
  type: '',
  content: '',
  priority: 'medium' as 'high' | 'medium' | 'low',
  deadline: '',
  assignee: '',
  note: ''
})

const configForm = reactive({
  ruleName: '',
  triggerCondition: '',
  careAction: '',
  type: '',
  priority: 'medium' as 'high' | 'medium' | 'low',
  deadlineHours: 24,
  enabled: true
})

const createRules = {
  customerId: [
    { required: true, message: '请选择客户', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择关怀类型', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入关怀内容', trigger: 'blur' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  deadline: [
    { required: true, message: '请选择截止时间', trigger: 'change' }
  ],
  assignee: [
    { required: true, message: '请输入负责人', trigger: 'blur' }
  ]
}

const configRules = {
  ruleName: [
    { required: true, message: '请输入规则名称', trigger: 'blur' }
  ],
  triggerCondition: [
    { required: true, message: '请输入触发条件', trigger: 'blur' }
  ],
  careAction: [
    { required: true, message: '请输入关怀动作', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择关怀类型', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ]
}

const getCareTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    birthday: 'danger',
    holiday: 'danger',
    new_customer: 'success',
    churn_warning: 'warning',
    purchase_reminder: 'info',
    member_upgrade: 'success',
    complaint_followup: 'warning',
    other: 'info'
  }
  return typeMap[type] || 'info'
}

const getCareTypeLabel = (type: string) => {
  const typeObj = careTypes.find(t => t.value === type)
  return typeObj?.label || type
}

const getPriorityTagType = (priority: string) => {
  const typeMap: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return typeMap[priority] || 'info'
}

const getPriorityLabel = (priority: string) => {
  const labelMap: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return labelMap[priority] || priority
}

const getStatusTagType = (status: string) => {
  const typeMap: Record<string, string> = {
    pending: 'info',
    processing: 'warning',
    completed: 'success',
    overdue: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    overdue: '已逾期'
  }
  return labelMap[status] || status
}

const isOverdue = (deadline: string) => {
  return new Date(deadline).getTime() < Date.now()
}

const formatDateTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7
}

const searchCustomers = async (query: string) => {
  if (!query) {
    customerOptions.value = []
    return
  }

  customerSearchLoading.value = true
  try {
    const response = await fetch(`/api/customers/search?q=${query}`).then(res => res.json())
    if (response.success) {
      customerOptions.value = response.data
    }
  } catch (error) {
    console.error('Search customers failed:', error)
  } finally {
    customerSearchLoading.value = false
  }
}

const refreshReminders = async () => {
  try {
    ElMessage.loading('刷新关怀提醒数据...')
    const response = await fetch('/api/customers/care').then(res => res.json())
    if (response.success) {
      careStats.value = response.data.stats
      reminderList.value = response.data.reminders
      careRules.value = response.data.rules
      ElMessage.success('刷新成功')
    }
  } catch (error) {
    console.error('Refresh reminders failed:', error)
    ElMessage.error('刷新失败')
  }
}

const loadReminders = async () => {
  try {
    const response = await fetch('/api/customers/care/reminders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...filters,
        startTime: dateRange.value?.[0]?.toISOString(),
        endTime: dateRange.value?.[1]?.toISOString(),
        page: pagination.page,
        pageSize: pagination.pageSize
      })
    }).then(res => res.json())
    if (response.success) {
      reminderList.value = response.data.items
      pagination.total = response.data.total
    }
  } catch (error) {
    console.error('Load reminders failed:', error)
    ElMessage.error('加载关怀提醒失败')
  }
}

const createCare = async () => {
  if (!createFormRef.value) return

  try {
    await createFormRef.value.validate()
    creating.value = true

    ElMessage.success('创建成功')
    showCreateDialog.value = false
    await refreshReminders()
  } catch (error) {
    console.error('Create care failed:', error)
    ElMessage.error('创建失败')
  } finally {
    creating.value = false
  }
}

const viewDetail = (reminder: CareReminder) => {
  ElMessage.info(`查看关怀提醒 ${reminder.id} 的详情`)
}

const handleCare = async (reminder: CareReminder) => {
  try {
    await ElMessageBox.confirm(
      `确定要处理客户 ${reminder.customerName} 的关怀提醒吗？`,
      '处理确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    ElMessage.success('已标记为处理中')
    await refreshReminders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Handle care failed:', error)
      ElMessage.error('处理失败')
    }
  }
}

const editCare = (reminder: CareReminder) => {
  ElMessage.info(`编辑关怀提醒 ${reminder.id}`)
}

const deleteCare = async (reminder: CareReminder) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除客户 ${reminder.customerName} 的关怀提醒吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success('删除成功')
    await refreshReminders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete care failed:', error)
      ElMessage.error('删除失败')
    }
  }
}

const editRule = (rule: CareRule) => {
  configForm.ruleName = rule.ruleName
  configForm.triggerCondition = rule.triggerCondition
  configForm.careAction = rule.careAction
  configForm.type = rule.type
  configForm.priority = rule.priority
  configForm.deadlineHours = rule.deadlineHours
  configForm.enabled = rule.enabled
  showConfigDialog.value = true
}

const toggleRule = async (rule: CareRule) => {
  try {
    const action = rule.enabled ? '禁用' : '启用'
    await ElMessageBox.confirm(
      `确定要${action}规则"${rule.ruleName}"吗？`,
      `${action}确认`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    rule.enabled = !rule.enabled
    ElMessage.success(`${action}成功`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Toggle rule failed:', error)
      ElMessage.error('操作失败')
    }
  }
}

const saveConfig = async () => {
  if (!configFormRef.value) return

  try {
    await configFormRef.value.validate()
    saving.value = true

    ElMessage.success('保存成功')
    showConfigDialog.value = false
    await refreshReminders()
  } catch (error) {
    console.error('Save config failed:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const resetCreateForm = () => {
  createForm.customerId = ''
  createForm.type = ''
  createForm.content = ''
  createForm.priority = 'medium'
  createForm.deadline = ''
  createForm.assignee = ''
  createForm.note = ''
  createFormRef.value?.resetFields()
}

const resetConfigForm = () => {
  configForm.ruleName = ''
  configForm.triggerCondition = ''
  configForm.careAction = ''
  configForm.type = ''
  configForm.priority = 'medium'
  configForm.deadlineHours = 24
  configForm.enabled = true
  configFormRef.value?.resetFields()
}

const resetFilters = () => {
  filters.type = ''
  filters.priority = ''
  filters.status = ''
  filters.triggerType = ''
  dateRange.value = null
  loadReminders()
}

const handleDateChange = () => {
  loadReminders()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadReminders()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadReminders()
}

onMounted(() => {
  refreshReminders()
})
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.customer-care-reminder {
  .care-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .care-content {
      .care-overview {
        margin-bottom: $spacing-6;

        .overview-card {
          display: flex;
          align-items: center;
          gap: $spacing-4;
          padding: $spacing-4;
          background: $white;
          border: 1px solid $border-color;
          border-radius: $border-radius-md;
          transition: all 0.3s;

          &:hover {
            box-shadow: $shadow-md;
            transform: translateY(-2px);
          }

          &.pending {
            border-left: 4px solid $info-color;
          }

          &.processing {
            border-left: 4px solid $warning-color;
          }

          &.completed {
            border-left: 4px solid $success-color;
          }

          &.overdue {
            border-left: 4px solid $danger-color;
          }

          .card-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 60px;
            border-radius: $border-radius-lg;
            background: $background-light;
            color: $primary-color;
          }

          .card-info {
            flex: 1;

            .card-label {
              font-size: $font-size-sm;
              color: $text-secondary;
              margin-bottom: $spacing-1;
            }

            .card-value {
              font-size: $font-size-xl;
              font-weight: $font-weight-bold;
              color: $text-primary;
              margin-bottom: $spacing-1;
            }

            .card-trend {
              font-size: $font-size-xs;
              color: $text-secondary;
            }
          }
        }
      }

      .care-filters {
        margin-bottom: $spacing-4;
        padding: $spacing-3;
        background: $background-light;
        border-radius: $border-radius-sm;

        .filter-form {
          margin: 0;
        }
      }

      .care-reminders {
        margin-bottom: $spacing-6;

        .customer-info {
          .customer-name {
            font-weight: 600;
            color: $text-primary;
            margin-bottom: $spacing-1;
          }

          .customer-phone {
            font-size: $font-size-sm;
            color: $text-secondary;
          }
        }

        .care-content {
          font-size: $font-size-sm;
          color: $text-primary;
          line-height: 1.5;
        }

        .overdue {
          color: $danger-color;
          font-weight: 600;
        }

        .pagination {
          display: flex;
          justify-content: flex-end;
          margin-top: $spacing-4;
        }
      }

      .care-rules {
        h3 {
          margin: 0 0 $spacing-4 0;
          font-size: $font-size-lg;
          font-weight: 600;
          color: $text-primary;
        }

        .trigger-condition,
        .care-action {
          font-size: $font-size-sm;
          color: $text-primary;
          line-height: 1.5;
        }
      }
    }
  }

  .unit {
    margin-left: $spacing-2;
    color: $text-secondary;
  }
}
</style>
