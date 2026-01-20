<template>
  <div class="customer-segment-manager">
    <el-card class="segment-card">
      <template #header>
        <div class="card-header">
          <span>客户分群管理</span>
          <el-button-group>
            <el-button size="small" @click="refreshSegments">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button type="primary" size="small" @click="showCreateDialog = true">
              <el-icon><Plus /></el-icon>
              新建分群
            </el-button>
          </el-button-group>
        </div>
      </template>

      <div class="segment-content">
        <div class="segment-list">
          <div
            v-for="segment in segments"
            :key="segment.id"
            class="segment-item"
            :class="{ active: selectedSegment?.id === segment.id }"
            @click="selectSegment(segment)"
          >
            <div class="segment-header">
              <div class="segment-info">
                <div class="segment-name">{{ segment.name }}</div>
                <el-tag :type="getSegmentTypeColor(segment.type)" size="small">
                  {{ getSegmentTypeLabel(segment.type) }}
                </el-tag>
              </div>
              <div class="segment-actions">
                <el-button
                  size="small"
                  link
                  type="primary"
                  @click.stop="handleEdit(segment)"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button
                  size="small"
                  link
                  type="danger"
                  @click.stop="handleDelete(segment)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <div class="segment-stats">
              <div class="stat-item">
                <span class="label">客户数:</span>
                <span class="value">{{ segment.customerCount }}</span>
              </div>
              <div class="stat-item">
                <span class="label">占比:</span>
                <span class="value">{{ segment.percentage }}%</span>
              </div>
              <div class="stat-item">
                <span class="label">平均消费:</span>
                <span class="value">¥{{ segment.avgSpent.toFixed(2) }}</span>
              </div>
            </div>
            <div class="segment-description">
              {{ segment.description }}
            </div>
          </div>
        </div>

        <div class="segment-detail">
          <div v-if="selectedSegment" class="detail-content">
            <h3>{{ selectedSegment.name }}</h3>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="分群ID">
                {{ selectedSegment.id }}
              </el-descriptions-item>
              <el-descriptions-item label="分群类型">
                <el-tag :type="getSegmentTypeColor(selectedSegment.type)">
                  {{ getSegmentTypeLabel(selectedSegment.type) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="客户数量">
                {{ selectedSegment.customerCount }}
              </el-descriptions-item>
              <el-descriptions-item label="占比">
                {{ selectedSegment.percentage }}%
              </el-descriptions-item>
              <el-descriptions-item label="平均消费">
                ¥{{ selectedSegment.avgSpent.toFixed(2) }}
              </el-descriptions-item>
              <el-descriptions-item label="平均订单">
                {{ selectedSegment.avgOrders.toFixed(1) }}
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">
                {{ formatDateTime(selectedSegment.createdAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="更新时间">
                {{ formatDateTime(selectedSegment.updatedAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="描述" :span="2">
                {{ selectedSegment.description }}
              </el-descriptions-item>
            </el-descriptions>

            <div class="segment-rules">
              <h4>分群规则</h4>
              <div class="rules-list">
                <div
                  v-for="(rule, index) in selectedSegment.rules"
                  :key="index"
                  class="rule-item"
                >
                  <el-tag :type="getRuleTypeColor(rule.type)" size="small">
                    {{ getRuleTypeLabel(rule.type) }}
                  </el-tag>
                  <span class="rule-operator">{{ getOperatorLabel(rule.operator) }}</span>
                  <span class="rule-value">{{ rule.value }}</span>
                </div>
              </div>
            </div>

            <div class="segment-actions">
              <el-button type="primary" @click="handleEdit(selectedSegment)">
                <el-icon><Edit /></el-icon>
                编辑分群
              </el-button>
              <el-button @click="exportSegment">
                <el-icon><Download /></el-icon>
                导出客户
              </el-button>
              <el-button @click="analyzeSegment">
                <el-icon><TrendCharts /></el-icon>
                分析报告
              </el-button>
            </div>
          </div>
          <div v-else class="empty-detail">
            <el-empty description="请选择分群查看详情" />
          </div>
        </div>
      </div>
    </el-card>

    <el-dialog
      v-model="showCreateDialog"
      :title="editingSegment ? '编辑分群' : '新建分群'"
      width="700px"
      @closed="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="分群名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分群名称" />
        </el-form-item>
        <el-form-item label="分群类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择分群类型">
            <el-option label="手动分群" value="manual" />
            <el-option label="自动分群" value="automatic" />
            <el-option label="AI智能分群" value="ai" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分群描述"
          />
        </el-form-item>
        <el-form-item label="分群规则">
          <div class="rules-form">
            <div
              v-for="(rule, index) in formData.rules"
              :key="index"
              class="rule-form-item"
            >
              <el-select v-model="rule.type" placeholder="规则类型" style="width: 150px">
                <el-option label="消费金额" value="spent" />
                <el-option label="订单数量" value="orders" />
                <el-option label="最后访问" value="lastVisit" />
                <el-option label="会员等级" value="level" />
                <el-option label="注册时间" value="registerTime" />
              </el-select>
              <el-select v-model="rule.operator" placeholder="操作符" style="width: 100px">
                <el-option label="大于" value="gt" />
                <el-option label="小于" value="lt" />
                <el-option label="等于" value="eq" />
                <el-option label="包含" value="contains" />
              </el-select>
              <el-input v-model="rule.value" placeholder="值" style="flex: 1" />
              <el-button
                size="small"
                type="danger"
                link
                @click="removeRule(index)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-button size="small" @click="addRule">
              <el-icon><Plus /></el-icon>
              添加规则
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="逻辑关系">
          <el-radio-group v-model="formData.logic">
            <el-radio label="and">满足所有规则</el-radio>
            <el-radio label="or">满足任一规则</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ editingSegment ? '更新' : '创建' }}
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
  Edit,
  Delete,
  Download,
  TrendCharts
} from '@element-plus/icons-vue'

interface SegmentRule {
  type: string
  operator: string
  value: string
}

interface CustomerSegment {
  id: string
  name: string
  type: 'manual' | 'automatic' | 'ai'
  description: string
  customerCount: number
  percentage: number
  avgSpent: number
  avgOrders: number
  rules: SegmentRule[]
  logic: 'and' | 'or'
  createdAt: string
  updatedAt: string
}

const formRef = ref()
const showCreateDialog = ref(false)
const submitting = ref(false)
const editingSegment = ref<CustomerSegment | null>(null)
const selectedSegment = ref<CustomerSegment | null>(null)

const segments = ref<CustomerSegment[]>([
  {
    id: '1',
    name: '高价值客户',
    type: 'automatic',
    description: '消费金额高、订单频次高的优质客户',
    customerCount: 156,
    percentage: 15.6,
    avgSpent: 580.50,
    avgOrders: 12.3,
    rules: [
      { type: 'spent', operator: 'gt', value: '500' },
      { type: 'orders', operator: 'gt', value: '10' }
    ],
    logic: 'and',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: '高频客户',
    type: 'automatic',
    description: '订单频次高，但单次消费金额适中的客户',
    customerCount: 234,
    percentage: 23.4,
    avgSpent: 280.30,
    avgOrders: 18.7,
    rules: [
      { type: 'orders', operator: 'gt', value: '15' },
      { type: 'spent', operator: 'lt', value: '400' }
    ],
    logic: 'and',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z'
  },
  {
    id: '3',
    name: '新客户',
    type: 'automatic',
    description: '最近30天内注册的新客户',
    customerCount: 312,
    percentage: 31.2,
    avgSpent: 150.20,
    avgOrders: 2.5,
    rules: [
      { type: 'registerTime', operator: 'gt', value: '30天前' }
    ],
    logic: 'and',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z'
  },
  {
    id: '4',
    name: '流失风险客户',
    type: 'ai',
    description: 'AI识别出的有流失风险的客户',
    customerCount: 89,
    percentage: 8.9,
    avgSpent: 320.40,
    avgOrders: 6.2,
    rules: [
      { type: 'lastVisit', operator: 'lt', value: '30天前' }
    ],
    logic: 'and',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z'
  },
  {
    id: '5',
    name: '休眠客户',
    type: 'automatic',
    description: '超过90天未访问的客户',
    customerCount: 156,
    percentage: 15.6,
    avgSpent: 210.80,
    avgOrders: 3.8,
    rules: [
      { type: 'lastVisit', operator: 'lt', value: '90天前' }
    ],
    logic: 'and',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z'
  }
])

const formData = reactive({
  name: '',
  type: 'manual',
  description: '',
  rules: [] as SegmentRule[],
  logic: 'and'
})

const formRules = {
  name: [
    { required: true, message: '请输入分群名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择分群类型', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入分群描述', trigger: 'blur' }
  ]
}

const getSegmentTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    manual: 'info',
    automatic: 'primary',
    ai: 'success'
  }
  return colorMap[type] || 'info'
}

const getSegmentTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    manual: '手动分群',
    automatic: '自动分群',
    ai: 'AI智能分群'
  }
  return labelMap[type] || '未知'
}

const getRuleTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    spent: 'warning',
    orders: 'primary',
    lastVisit: 'danger',
    level: 'success',
    registerTime: 'info'
  }
  return colorMap[type] || 'info'
}

const getRuleTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    spent: '消费金额',
    orders: '订单数量',
    lastVisit: '最后访问',
    level: '会员等级',
    registerTime: '注册时间'
  }
  return labelMap[type] || '未知'
}

const getOperatorLabel = (operator: string) => {
  const labelMap: Record<string, string> = {
    gt: '>',
    lt: '<',
    eq: '=',
    contains: '包含'
  }
  return labelMap[operator] || operator
}

const formatDateTime = (timestamp: string) => {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString('zh-CN')
}

const selectSegment = (segment: CustomerSegment) => {
  selectedSegment.value = segment
}

const handleEdit = (segment: CustomerSegment) => {
  editingSegment.value = segment
  formData.name = segment.name
  formData.type = segment.type
  formData.description = segment.description
  formData.rules = [...segment.rules]
  formData.logic = segment.logic
  showCreateDialog.value = true
}

const handleDelete = async (segment: CustomerSegment) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除分群"${segment.name}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success('删除成功')
    await refreshSegments()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete segment failed:', error)
      ElMessage.error('删除失败')
    }
  }
}

const addRule = () => {
  formData.rules.push({
    type: '',
    operator: 'eq',
    value: ''
  })
}

const removeRule = (index: number) => {
  formData.rules.splice(index, 1)
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    if (editingSegment.value) {
      ElMessage.success('更新成功')
    } else {
      ElMessage.success('创建成功')
    }

    showCreateDialog.value = false
    await refreshSegments()
  } catch (error) {
    console.error('Submit failed:', error)
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  editingSegment.value = null
  formData.name = ''
  formData.type = 'manual'
  formData.description = ''
  formData.rules = []
  formData.logic = 'and'
  formRef.value?.resetFields()
}

const refreshSegments = async () => {
  try {
    ElMessage.loading('加载分群数据...')
    const response = await fetch('/api/customers/segments').then(res => res.json())
    if (response.success) {
      segments.value = response.data
      ElMessage.success('加载成功')
    }
  } catch (error) {
    console.error('Refresh segments failed:', error)
    ElMessage.error('加载失败')
  }
}

const exportSegment = async () => {
  if (!selectedSegment.value) return

  try {
    const response = await fetch(`/api/customers/segments/${selectedSegment.value.id}/export`)
    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `segment-${selectedSegment.value.name}-${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
      ElMessage.success('导出成功')
    }
  } catch (error) {
    console.error('Export failed:', error)
    ElMessage.error('导出失败')
  }
}

const analyzeSegment = () => {
  if (!selectedSegment.value) return
  ElMessage.info('分析报告功能开发中...')
}

onMounted(() => {
  refreshSegments()
})
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.customer-segment-manager {
  .segment-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .segment-content {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: $spacing-4;
      min-height: 600px;

      .segment-list {
        border-right: 1px solid $border-color;
        padding-right: $spacing-4;
        overflow-y: auto;
        max-height: 600px;

        .segment-item {
          padding: $spacing-3;
          margin-bottom: $spacing-3;
          background: $white;
          border: 1px solid $border-color;
          border-radius: $border-radius-md;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            border-color: $primary-color;
            box-shadow: $shadow-sm;
          }

          &.active {
            border-color: $primary-color;
            background: $primary-light;
          }

          .segment-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: $spacing-2;

            .segment-info {
              flex: 1;

              .segment-name {
                font-weight: 600;
                color: $text-primary;
                margin-bottom: $spacing-1;
              }
            }

            .segment-actions {
              display: flex;
              gap: $spacing-1;
              opacity: 0;
              transition: opacity 0.3s;
            }

            &:hover .segment-actions {
              opacity: 1;
            }
          }

          .segment-stats {
            display: flex;
            gap: $spacing-3;
            margin-bottom: $spacing-2;
            font-size: $font-size-sm;

            .stat-item {
              .label {
                color: $text-secondary;
                margin-right: $spacing-1;
              }

              .value {
                font-weight: 600;
                color: $text-primary;
              }
            }
          }

          .segment-description {
            font-size: $font-size-sm;
            color: $text-secondary;
            line-height: 1.5;
          }
        }
      }

      .segment-detail {
        .detail-content {
          h3 {
            margin: 0 0 $spacing-4 0;
            font-size: $font-size-lg;
            font-weight: 600;
            color: $text-primary;
          }

          .segment-rules {
            margin: $spacing-4 0;

            h4 {
              margin: 0 0 $spacing-2 0;
              font-size: $font-size-base;
              font-weight: 600;
              color: $text-primary;
            }

            .rules-list {
              display: flex;
              flex-direction: column;
              gap: $spacing-2;

              .rule-item {
                display: flex;
                align-items: center;
                gap: $spacing-2;
                padding: $spacing-2;
                background: $background-light;
                border-radius: $border-radius-sm;

                .rule-operator {
                  font-weight: 600;
                  color: $text-primary;
                }

                .rule-value {
                  color: $text-primary;
                }
              }
            }
          }

          .segment-actions {
            display: flex;
            gap: $spacing-2;
            margin-top: $spacing-4;
          }
        }

        .empty-detail {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }
      }
    }
  }

  .rules-form {
    width: 100%;

    .rule-form-item {
      display: flex;
      align-items: center;
      gap: $spacing-2;
      margin-bottom: $spacing-2;
    }
  }
}
</style>
