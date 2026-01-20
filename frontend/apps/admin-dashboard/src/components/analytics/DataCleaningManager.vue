<template>
  <div class="data-cleaning-manager">
    <el-card class="cleaning-card">
      <template #header>
        <div class="card-header">
          <span>数据清洗规则管理</span>
          <el-button-group>
            <el-button size="small" @click="refreshRules">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button type="primary" size="small" @click="showAddDialog = true">
              <el-icon><Plus /></el-icon>
              新建规则
            </el-button>
            <el-button size="small" @click="executeCleaning">
              <el-icon><PlayArrow /></el-icon>
              执行清洗
            </el-button>
          </el-button-group>
        </div>
      </template>

      <div class="cleaning-overview">
        <el-row :gutter="20">
          <el-col :span="6" v-for="metric in cleaningMetrics" :key="metric.key">
            <div class="metric-item">
              <div class="metric-icon" :style="{ backgroundColor: metric.color }">
                <el-icon :size="24">
                  <component :is="metric.icon" />
                </el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ metric.value }}</div>
                <div class="metric-label">{{ metric.label }}</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <div class="cleaning-filters">
        <el-form :inline="true" :model="filters" class="filter-form">
          <el-form-item label="规则类型">
            <el-select v-model="filters.ruleType" placeholder="全部" clearable>
              <el-option label="格式校验" value="format" />
              <el-option label="重复数据" value="duplicate" />
              <el-option label="异常值检测" value="outlier" />
              <el-option label="完整性检查" value="completeness" />
              <el-option label="一致性检查" value="consistency" />
            </el-select>
          </el-form-item>
          <el-form-item label="启用状态">
            <el-select v-model="filters.enabled" placeholder="全部" clearable>
              <el-option label="启用" :value="true" />
              <el-option label="禁用" :value="false" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadRules">
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

      <el-table :data="cleaningRules" stripe v-loading="loading">
        <el-table-column type="index" label="序号" width="80" />
        <el-table-column prop="ruleName" label="规则名称" min-width="150" />
        <el-table-column label="规则类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getRuleTypeTagType(row.ruleType)" size="small">
              {{ getRuleTypeText(row.ruleType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="规则配置" min-width="200">
          <template #default="{ row }">
            <el-tooltip :content="formatRuleConfig(row.ruleConfig)" placement="top">
              <span class="rule-config">{{ formatRuleConfig(row.ruleConfig) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100" sortable />
        <el-table-column label="启用状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.enabled"
              @change="handleToggleEnabled(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="执行次数" width="100">
          <template #default="{ row }">
            {{ row.executionCount || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="最后执行" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.lastExecutedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" text type="primary" @click="handleTestRule(row)">
              测试
            </el-button>
            <el-button size="small" text type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button size="small" text type="primary" @click="handleViewResults(row)">
              结果
            </el-button>
            <el-button size="small" text type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="showAddDialog" :title="editingRule ? '编辑规则' : '新建规则'" width="70%">
      <el-form :model="ruleForm" :rules="ruleFormRules" ref="ruleFormRef" label-width="120px">
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="ruleForm.ruleName" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="规则类型" prop="ruleType">
          <el-select v-model="ruleForm.ruleType" placeholder="请选择规则类型" @change="handleRuleTypeChange">
            <el-option label="格式校验" value="format" />
            <el-option label="重复数据" value="duplicate" />
            <el-option label="异常值检测" value="outlier" />
            <el-option label="完整性检查" value="completeness" />
            <el-option label="一致性检查" value="consistency" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="规则配置" prop="ruleConfig">
          <div class="rule-config-editor">
            <div v-if="ruleForm.ruleType === 'format'" class="config-section">
              <el-form-item label="数据表">
                <el-input v-model="ruleForm.ruleConfig.table" placeholder="请输入数据表名" />
              </el-form-item>
              <el-form-item label="字段">
                <el-select v-model="ruleForm.ruleConfig.field" multiple placeholder="请选择字段">
                  <el-option label="订单号" value="order_number" />
                  <el-option label="手机号" value="phone" />
                  <el-option label="邮箱" value="email" />
                  <el-option label="日期" value="date" />
                  <el-option label="金额" value="amount" />
                </el-select>
              </el-form-item>
              <el-form-item label="格式规则">
                <el-select v-model="ruleForm.ruleConfig.format" placeholder="请选择格式规则">
                  <el-option label="手机号格式" value="phone" />
                  <el-option label="邮箱格式" value="email" />
                  <el-option label="日期格式" value="date" />
                  <el-option label="数字格式" value="number" />
                </el-select>
              </el-form-item>
            </div>

            <div v-else-if="ruleForm.ruleType === 'duplicate'" class="config-section">
              <el-form-item label="数据表">
                <el-input v-model="ruleForm.ruleConfig.table" placeholder="请输入数据表名" />
              </el-form-item>
              <el-form-item label="去重字段">
                <el-select v-model="ruleForm.ruleConfig.fields" multiple placeholder="请选择去重字段">
                  <el-option label="订单号" value="order_number" />
                  <el-option label="客户ID" value="customer_id" />
                  <el-option label="菜品ID" value="dish_id" />
                </el-select>
              </el-form-item>
              <el-form-item label="保留策略">
                <el-radio-group v-model="ruleForm.ruleConfig.strategy">
                  <el-radio label="first">保留第一条</el-radio>
                  <el-radio label="last">保留最后一条</el-radio>
                  <el-radio label="latest">保留最新的一条</el-radio>
                </el-radio-group>
              </el-form-item>
            </div>

            <div v-else-if="ruleForm.ruleType === 'outlier'" class="config-section">
              <el-form-item label="数据表">
                <el-input v-model="ruleForm.ruleConfig.table" placeholder="请输入数据表名" />
              </el-form-item>
              <el-form-item label="检测字段">
                <el-select v-model="ruleForm.ruleConfig.field" placeholder="请选择检测字段">
                  <el-option label="订单金额" value="order_amount" />
                  <el-option label="菜品价格" value="dish_price" />
                  <el-option label="客户消费" value="customer_spent" />
                </el-select>
              </el-form-item>
              <el-form-item label="检测方法">
                <el-select v-model="ruleForm.ruleConfig.method" placeholder="请选择检测方法">
                  <el-option label="标准差法" value="std" />
                  <el-option label="四分位距法" value="iqr" />
                  <el-option label="Z-Score法" value="zscore" />
                </el-select>
              </el-form-item>
              <el-form-item label="阈值倍数">
                <el-input-number v-model="ruleForm.ruleConfig.threshold" :min="1" :max="5" :step="0.5" />
              </el-form-item>
            </div>

            <div v-else-if="ruleForm.ruleType === 'completeness'" class="config-section">
              <el-form-item label="数据表">
                <el-input v-model="ruleForm.ruleConfig.table" placeholder="请输入数据表名" />
              </el-form-item>
              <el-form-item label="必填字段">
                <el-select v-model="ruleForm.ruleConfig.fields" multiple placeholder="请选择必填字段">
                  <el-option label="订单号" value="order_number" />
                  <el-option label="客户ID" value="customer_id" />
                  <el-option label="菜品ID" value="dish_id" />
                  <el-option label="金额" value="amount" />
                </el-select>
              </el-form-item>
              <el-form-item label="缺失处理">
                <el-radio-group v-model="ruleForm.ruleConfig.action">
                  <el-radio label="delete">删除记录</el-radio>
                  <el-radio label="fill">填充默认值</el-radio>
                  <el-radio label="mark">标记异常</el-radio>
                </el-radio-group>
              </el-form-item>
            </div>

            <div v-else-if="ruleForm.ruleType === 'consistency'" class="config-section">
              <el-form-item label="数据表">
                <el-input v-model="ruleForm.ruleConfig.table" placeholder="请输入数据表名" />
              </el-form-item>
              <el-form-item label="检查规则">
                <el-input
                  v-model="ruleForm.ruleConfig.sql"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入SQL检查规则，例如：SELECT * FROM orders WHERE order_amount < 0"
                />
              </el-form-item>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="优先级" prop="priority">
          <el-input-number v-model="ruleForm.priority" :min="0" :max="100" />
        </el-form-item>

        <el-form-item label="启用状态">
          <el-switch v-model="ruleForm.enabled" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="handleSaveRule">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="showExecuteDialog" title="执行数据清洗" width="60%">
      <el-form :model="executeForm" label-width="120px">
        <el-form-item label="执行范围">
          <el-radio-group v-model="executeForm.scope">
            <el-radio label="all">全部数据</el-radio>
            <el-radio label="date">指定日期范围</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="日期范围" v-if="executeForm.scope === 'date'">
          <el-date-picker
            v-model="executeForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item label="选择规则">
          <el-select v-model="executeForm.ruleIds" multiple placeholder="选择要执行的规则（默认全部）">
            <el-option
              v-for="rule in cleaningRules"
              :key="rule.id"
              :label="rule.ruleName"
              :value="rule.id"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showExecuteDialog = false">取消</el-button>
          <el-button type="primary" @click="handleExecuteCleaning" :loading="executing">
            执行清洗
          </el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="showResultsDialog" title="清洗结果" width="80%">
      <el-alert
        :title="`清洗完成，共处理 ${cleaningResult.totalRecords} 条记录`"
        type="success"
        :closable="false"
        style="margin-bottom: 20px;"
      />

      <el-table :data="cleaningResult.issues" stripe max-height="500">
        <el-table-column prop="ruleName" label="规则名称" width="150" />
        <el-table-column prop="issueType" label="问题类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getIssueTypeTagType(row.issueType)" size="small">
              {{ getIssueTypeText(row.issueType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="recordCount" label="问题记录数" width="120" />
        <el-table-column prop="description" label="问题描述" min-width="200" />
        <el-table-column prop="action" label="处理动作" width="120" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" text type="primary" @click="handleViewDetail(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  Plus,
  Search,
  RefreshLeft,
  PlayArrow,
  Document,
  Brush,
  SuccessFilled,
  WarningFilled,
  CircleCloseFilled
} from '@element-plus/icons-vue'

interface CleaningRule {
  id: string
  ruleName: string
  ruleType: string
  ruleConfig: object
  priority: number
  enabled: boolean
  executionCount?: number
  lastExecutedAt?: string
  tenantId: string
  createdAt: string
  updatedAt: string
}

interface CleaningResult {
  totalRecords: number
  cleanedRecords: number
  invalidRecords: number
  issues: CleaningIssue[]
}

interface CleaningIssue {
  ruleName: string
  issueType: string
  recordCount: number
  description: string
  action: string
  details?: object
}

const loading = ref(false)
const executing = ref(false)
const showAddDialog = ref(false)
const showExecuteDialog = ref(false)
const showResultsDialog = ref(false)
const editingRule = ref<CleaningRule | null>(null)
const ruleFormRef = ref()

const filters = reactive({
  ruleType: '',
  enabled: ''
})

const ruleForm = reactive({
  id: '',
  ruleName: '',
  ruleType: '',
  ruleConfig: {} as any,
  priority: 0,
  enabled: true
})

const ruleFormRules = {
  ruleName: [
    { required: true, message: '请输入规则名称', trigger: 'blur' }
  ],
  ruleType: [
    { required: true, message: '请选择规则类型', trigger: 'change' }
  ]
}

const executeForm = reactive({
  scope: 'all',
  dateRange: null as [Date, Date] | null,
  ruleIds: [] as string[]
})

const cleaningResult = reactive<CleaningResult>({
  totalRecords: 0,
  cleanedRecords: 0,
  invalidRecords: 0,
  issues: []
})

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const cleaningMetrics = ref([
  {
    key: 'total',
    label: '规则总数',
    value: 12,
    icon: 'Document',
    color: '#409EFF'
  },
  {
    key: 'active',
    label: '启用规则',
    value: 8,
    icon: 'SuccessFilled',
    color: '#67C23A'
  },
  {
    key: 'executed',
    label: '今日执行',
    value: 45,
    icon: 'Brush',
    color: '#67C23A'
  },
  {
    key: 'issues',
    label: '发现问题',
    value: 156,
    icon: 'WarningFilled',
    color: '#E6A23C'
  }
])

const cleaningRules = ref<CleaningRule[]>([])

const getRuleTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    format: '格式校验',
    duplicate: '重复数据',
    outlier: '异常值检测',
    completeness: '完整性检查',
    consistency: '一致性检查'
  }
  return typeMap[type] || type
}

const getRuleTypeTagType = (type: string) => {
  const typeMap: Record<string, any> = {
    format: 'primary',
    duplicate: 'success',
    outlier: 'warning',
    completeness: 'danger',
    consistency: 'info'
  }
  return typeMap[type] || ''
}

const getIssueTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    format_error: '格式错误',
    duplicate: '重复数据',
    outlier: '异常值',
    missing: '数据缺失',
    inconsistency: '数据不一致'
  }
  return typeMap[type] || type
}

const getIssueTypeTagType = (type: string) => {
  const typeMap: Record<string, any> = {
    format_error: 'danger',
    duplicate: 'warning',
    outlier: 'warning',
    missing: 'danger',
    inconsistency: 'info'
  }
  return typeMap[type] || ''
}

const formatRuleConfig = (config: object) => {
  return JSON.stringify(config, null, 2)
}

const formatDateTime = (dateTime?: string) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}

const loadRules = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/analytics/cleaning-rules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...filters,
        page: pagination.page,
        size: pagination.size
      })
    })
    const data = await response.json()
    if (data.success) {
      cleaningRules.value = data.data.items
      pagination.total = data.data.total
    }
  } catch (error) {
    ElMessage.error('加载规则失败')
  } finally {
    loading.value = false
  }
}

const refreshRules = () => {
  loadRules()
}

const resetFilters = () => {
  filters.ruleType = ''
  filters.enabled = ''
  pagination.page = 1
  loadRules()
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  loadRules()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadRules()
}

const handleToggleEnabled = async (row: CleaningRule) => {
  try {
    const response = await fetch(`/api/analytics/cleaning-rules/${row.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ enabled: row.enabled })
    })
    const data = await response.json()
    if (data.success) {
      ElMessage.success(row.enabled ? '规则已启用' : '规则已禁用')
    } else {
      row.enabled = !row.enabled
      ElMessage.error('操作失败')
    }
  } catch (error) {
    row.enabled = !row.enabled
    ElMessage.error('操作失败')
  }
}

const handleRuleTypeChange = () => {
  ruleForm.ruleConfig = {}
}

const handleTestRule = async (row: CleaningRule) => {
  try {
    ElMessage.info('正在测试规则...')
    const response = await fetch(`/api/analytics/cleaning-rules/${row.id}/test`, {
      method: 'POST'
    })
    const data = await response.json()
    if (data.success) {
      ElMessage.success(`规则测试成功，发现问题记录数：${data.data.issueCount}`)
    } else {
      ElMessage.error('规则测试失败')
    }
  } catch (error) {
    ElMessage.error('规则测试失败')
  }
}

const handleEdit = (row: CleaningRule) => {
  editingRule.value = row
  ruleForm.id = row.id
  ruleForm.ruleName = row.ruleName
  ruleForm.ruleType = row.ruleType
  ruleForm.ruleConfig = { ...row.ruleConfig }
  ruleForm.priority = row.priority
  ruleForm.enabled = row.enabled
  showAddDialog.value = true
}

const handleSaveRule = async () => {
  try {
    await ruleFormRef.value.validate()
    
    const payload = {
      ruleName: ruleForm.ruleName,
      ruleType: ruleForm.ruleType,
      ruleConfig: ruleForm.ruleConfig,
      priority: ruleForm.priority,
      enabled: ruleForm.enabled
    }

    const url = editingRule.value 
      ? `/api/analytics/cleaning-rules/${editingRule.value.id}`
      : '/api/analytics/cleaning-rules'
    
    const method = editingRule.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    
    const data = await response.json()
    if (data.success) {
      ElMessage.success(editingRule.value ? '规则更新成功' : '规则创建成功')
      showAddDialog.value = false
      editingRule.value = null
      loadRules()
    } else {
      ElMessage.error(data.message || '操作失败')
    }
  } catch (error) {
    if (error !== false) {
      ElMessage.error('操作失败')
    }
  }
}

const handleViewResults = async (row: CleaningRule) => {
  try {
    const response = await fetch(`/api/analytics/cleaning-rules/${row.id}/results`)
    const data = await response.json()
    if (data.success) {
      cleaningResult.totalRecords = data.data.totalRecords
      cleaningResult.cleanedRecords = data.data.cleanedRecords
      cleaningResult.invalidRecords = data.data.invalidRecords
      cleaningResult.issues = data.data.issues
      showResultsDialog.value = true
    }
  } catch (error) {
    ElMessage.error('加载结果失败')
  }
}

const handleViewDetail = (issue: CleaningIssue) => {
  ElMessageBox.alert(
    JSON.stringify(issue.details, null, 2),
    '问题详情',
    {
      confirmButtonText: '确定',
      customClass: 'detail-dialog'
    }
  )
}

const handleDelete = async (row: CleaningRule) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除规则"${row.ruleName}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await fetch(`/api/analytics/cleaning-rules/${row.id}`, {
      method: 'DELETE'
    })
    const data = await response.json()
    if (data.success) {
      ElMessage.success('规则删除成功')
      loadRules()
    } else {
      ElMessage.error('删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const executeCleaning = () => {
  showExecuteDialog.value = true
}

const handleExecuteCleaning = async () => {
  executing.value = true
  try {
    const payload: any = {
      scope: executeForm.scope
    }
    
    if (executeForm.scope === 'date' && executeForm.dateRange) {
      payload.startDate = executeForm.dateRange[0].toISOString()
      payload.endDate = executeForm.dateRange[1].toISOString()
    }
    
    if (executeForm.ruleIds.length > 0) {
      payload.ruleIds = executeForm.ruleIds
    }
    
    const response = await fetch('/api/analytics/cleaning/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    
    const data = await response.json()
    if (data.success) {
      ElMessage.success('数据清洗执行成功')
      cleaningResult.totalRecords = data.data.totalRecords
      cleaningResult.cleanedRecords = data.data.cleanedRecords
      cleaningResult.invalidRecords = data.data.invalidRecords
      cleaningResult.issues = data.data.issues
      showExecuteDialog.value = false
      showResultsDialog.value = true
    } else {
      ElMessage.error(data.message || '执行失败')
    }
  } catch (error) {
    ElMessage.error('执行失败')
  } finally {
    executing.value = false
  }
}

onMounted(() => {
  loadRules()
})
</script>

<style scoped lang="scss">
.data-cleaning-manager {
  .cleaning-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .cleaning-overview {
    margin-bottom: 20px;
    
    .metric-item {
      display: flex;
      align-items: center;
      padding: 15px;
      background: #f5f7fa;
      border-radius: 8px;
      
      .metric-icon {
        width: 50px;
        height: 50px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        margin-right: 15px;
      }
      
      .metric-info {
        flex: 1;
        
        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 5px;
        }
        
        .metric-label {
          font-size: 14px;
          color: #606266;
        }
      }
    }
  }

  .cleaning-filters {
    margin-bottom: 20px;
    
    .filter-form {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
  }

  .rule-config {
    max-width: 400px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
  }

  .rule-config-editor {
    .config-section {
      padding: 15px;
      background: #f5f7fa;
      border-radius: 8px;
      margin-bottom: 15px;
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
