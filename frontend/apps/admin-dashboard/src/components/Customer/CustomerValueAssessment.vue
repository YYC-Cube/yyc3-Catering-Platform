<template>
  <div class="customer-value-assessment">
    <el-card class="assessment-card">
      <template #header>
        <div class="card-header">
          <span>客户价值评估（RFM模型）</span>
          <el-button-group>
            <el-button size="small" @click="refreshAssessment">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button type="primary" size="small" @click="showConfigDialog = true">
              <el-icon><Setting /></el-icon>
              配置参数
            </el-button>
            <el-button size="small" @click="exportAssessment">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </el-button-group>
        </div>
      </template>

      <div class="assessment-content">
        <div class="rfm-overview">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="rfm-metric">
                <div class="metric-header">
                  <div class="metric-icon recency">
                    <el-icon :size="32"><Clock /></el-icon>
                  </div>
                  <div class="metric-info">
                    <div class="metric-title">最近消费（R）</div>
                    <div class="metric-value">{{ rfmData.recency.avgDays }}天</div>
                  </div>
                </div>
                <div class="metric-details">
                  <div class="detail-item">
                    <span class="label">最高:</span>
                    <span class="value">{{ rfmData.recency.maxDays }}天</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">最低:</span>
                    <span class="value">{{ rfmData.recency.minDays }}天</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">中位数:</span>
                    <span class="value">{{ rfmData.recency.medianDays }}天</span>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="rfm-metric">
                <div class="metric-header">
                  <div class="metric-icon frequency">
                    <el-icon :size="32"><ShoppingCart /></el-icon>
                  </div>
                  <div class="metric-info">
                    <div class="metric-title">消费频率（F）</div>
                    <div class="metric-value">{{ rfmData.frequency.avgOrders }}次</div>
                  </div>
                </div>
                <div class="metric-details">
                  <div class="detail-item">
                    <span class="label">最高:</span>
                    <span class="value">{{ rfmData.frequency.maxOrders }}次</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">最低:</span>
                    <span class="value">{{ rfmData.frequency.minOrders }}次</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">中位数:</span>
                    <span class="value">{{ rfmData.frequency.medianOrders }}次</span>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="rfm-metric">
                <div class="metric-header">
                  <div class="metric-icon monetary">
                    <el-icon :size="32"><Money /></el-icon>
                  </div>
                  <div class="metric-info">
                    <div class="metric-title">消费金额（M）</div>
                    <div class="metric-value">¥{{ rfmData.monetary.avgSpent.toFixed(0) }}</div>
                  </div>
                </div>
                <div class="metric-details">
                  <div class="detail-item">
                    <span class="label">最高:</span>
                    <span class="value">¥{{ rfmData.monetary.maxSpent.toFixed(0) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">最低:</span>
                    <span class="value">¥{{ rfmData.monetary.minSpent.toFixed(0) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">中位数:</span>
                    <span class="value">¥{{ rfmData.monetary.medianSpent.toFixed(0) }}</span>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="rfm-segments">
          <h3>客户价值分群</h3>
          <el-row :gutter="16">
            <el-col :span="6" v-for="segment in rfmSegments" :key="segment.code">
              <div class="segment-card" :class="segment.code">
                <div class="segment-header">
                  <div class="segment-name">{{ segment.name }}</div>
                  <el-tag :type="segment.tagType" size="small">
                    {{ segment.code }}
                  </el-tag>
                </div>
                <div class="segment-metrics">
                  <div class="metric-row">
                    <span class="label">客户数:</span>
                    <span class="value">{{ segment.count }}</span>
                  </div>
                  <div class="metric-row">
                    <span class="label">占比:</span>
                    <span class="value">{{ segment.percentage }}%</span>
                  </div>
                  <div class="metric-row">
                    <span class="label">平均价值:</span>
                    <span class="value">¥{{ segment.avgValue.toFixed(0) }}</span>
                  </div>
                  <div class="metric-row">
                    <span class="label">价值贡献:</span>
                    <span class="value">{{ segment.valueContribution }}%</span>
                  </div>
                </div>
                <div class="segment-description">
                  {{ segment.description }}
                </div>
                <el-button size="small" type="primary" @click="viewSegment(segment)">
                  查看客户
                </el-button>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="rfm-analysis">
          <h3>RFM分析</h3>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="analysis-chart">
                <div class="chart-title">客户价值分布</div>
                <div class="chart-placeholder">
                  <el-empty description="图表加载中..." />
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="analysis-chart">
                <div class="chart-title">RFM得分分布</div>
                <div class="chart-placeholder">
                  <el-empty description="图表加载中..." />
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="rfm-customers">
          <h3>客户价值排名</h3>
          <div class="filter-bar">
            <el-form :inline="true" :model="filters" class="filter-form">
              <el-form-item label="分群">
                <el-select v-model="filters.segment" placeholder="全部分群" clearable>
                  <el-option
                    v-for="segment in rfmSegments"
                    :key="segment.code"
                    :label="segment.name"
                    :value="segment.code"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="价值区间">
                <el-select v-model="filters.valueRange" placeholder="全部" clearable>
                  <el-option label="高价值（>5000）" value="high" />
                  <el-option label="中价值（1000-5000）" value="medium" />
                  <el-option label="低价值（<1000）" value="low" />
                </el-select>
              </el-form-item>
              <el-form-item label="排序">
                <el-select v-model="filters.sortBy" placeholder="默认排序">
                  <el-option label="价值从高到低" value="value_desc" />
                  <el-option label="价值从低到高" value="value_asc" />
                  <el-option label="最近消费时间" value="recency" />
                  <el-option label="消费频率" value="frequency" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="loadCustomers">
                  <el-icon><Search /></el-icon>
                  查询
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <el-table :data="customerList" stripe>
            <el-table-column type="index" label="排名" width="80" />
            <el-table-column prop="name" label="客户姓名" width="120" />
            <el-table-column prop="phone" label="手机号" width="130" />
            <el-table-column label="RFM得分" width="120">
              <template #default="{ row }">
                <el-tag :type="getScoreTagType(row.rfmScore)" size="small">
                  {{ row.rfmScore }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="R值" width="100">
              <template #default="{ row }">
                <span class="score-value">{{ row.recencyScore }}</span>
              </template>
            </el-table-column>
            <el-table-column label="F值" width="100">
              <template #default="{ row }">
                <span class="score-value">{{ row.frequencyScore }}</span>
              </template>
            </el-table-column>
            <el-table-column label="M值" width="100">
              <template #default="{ row }">
                <span class="score-value">{{ row.monetaryScore }}</span>
              </template>
            </el-table-column>
            <el-table-column label="分群" width="120">
              <template #default="{ row }">
                <el-tag :type="getSegmentTagType(row.segment)" size="small">
                  {{ getSegmentName(row.segment) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="最近消费" width="120">
              <template #default="{ row }">
                {{ row.lastOrderDays }}天前
              </template>
            </el-table-column>
            <el-table-column label="消费次数" width="100">
              <template #default="{ row }">
                {{ row.orderCount }}次
              </template>
            </el-table-column>
            <el-table-column label="总消费" width="120">
              <template #default="{ row }">
                <span class="amount">¥{{ row.totalSpent.toFixed(0) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button size="small" text type="primary" @click="viewDetail(row)">
                  详情
                </el-button>
                <el-button size="small" text type="primary" @click="analyzeCustomer(row)">
                  分析
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
      </div>
    </el-card>

    <el-dialog
      v-model="showConfigDialog"
      title="RFM参数配置"
      width="700px"
      @closed="resetConfigForm"
    >
      <el-form
        ref="configFormRef"
        :model="configForm"
        :rules="configRules"
        label-width="150px"
      >
        <el-form-item label="R值计算周期" prop="recencyPeriod">
          <el-input-number
            v-model="configForm.recencyPeriod"
            :min="1"
            :max="365"
            :step="1"
          />
          <span class="unit">天</span>
        </el-form-item>
        <el-form-item label="R值分段数" prop="recencySegments">
          <el-input-number
            v-model="configForm.recencySegments"
            :min="2"
            :max="10"
            :step="1"
          />
        </el-form-item>
        <el-form-item label="F值计算周期" prop="frequencyPeriod">
          <el-input-number
            v-model="configForm.frequencyPeriod"
            :min="1"
            :max="365"
            :step="1"
          />
          <span class="unit">天</span>
        </el-form-item>
        <el-form-item label="F值分段数" prop="frequencySegments">
          <el-input-number
            v-model="configForm.frequencySegments"
            :min="2"
            :max="10"
            :step="1"
          />
        </el-form-item>
        <el-form-item label="M值计算周期" prop="monetaryPeriod">
          <el-input-number
            v-model="configForm.monetaryPeriod"
            :min="1"
            :max="365"
            :step="1"
          />
          <span class="unit">天</span>
        </el-form-item>
        <el-form-item label="M值分段数" prop="monetarySegments">
          <el-input-number
            v-model="configForm.monetarySegments"
            :min="2"
            :max="10"
            :step="1"
          />
        </el-form-item>
        <el-form-item label="权重设置">
          <el-row :gutter="10">
            <el-col :span="8">
              <el-input-number
                v-model="configForm.recencyWeight"
                :min="0"
                :max="1"
                :step="0.1"
                :precision="1"
              />
              <span class="unit">R</span>
            </el-col>
            <el-col :span="8">
              <el-input-number
                v-model="configForm.frequencyWeight"
                :min="0"
                :max="1"
                :step="0.1"
                :precision="1"
              />
              <span class="unit">F</span>
            </el-col>
            <el-col :span="8">
              <el-input-number
                v-model="configForm.monetaryWeight"
                :min="0"
                :max="1"
                :step="0.1"
                :precision="1"
              />
              <span class="unit">M</span>
            </el-col>
          </el-row>
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
import { ElMessage } from 'element-plus'
import {
  Refresh,
  Setting,
  Download,
  Clock,
  ShoppingCart,
  Money,
  Search
} from '@element-plus/icons-vue'

interface RFMMetric {
  avgDays: number
  maxDays: number
  minDays: number
  medianDays: number
}

interface RFMData {
  recency: RFMMetric
  frequency: {
    avgOrders: number
    maxOrders: number
    minOrders: number
    medianOrders: number
  }
  monetary: {
    avgSpent: number
    maxSpent: number
    minSpent: number
    medianSpent: number
  }
}

interface RFMSegment {
  code: string
  name: string
  tagType: string
  count: number
  percentage: number
  avgValue: number
  valueContribution: number
  description: string
}

interface RFMCustomer {
  id: string
  name: string
  phone: string
  rfmScore: number
  recencyScore: number
  frequencyScore: number
  monetaryScore: number
  segment: string
  lastOrderDays: number
  orderCount: number
  totalSpent: number
}

const showConfigDialog = ref(false)
const saving = ref(false)
const configFormRef = ref()

const rfmData = ref<RFMData>({
  recency: {
    avgDays: 25,
    maxDays: 180,
    minDays: 1,
    medianDays: 18
  },
  frequency: {
    avgOrders: 8.5,
    maxOrders: 45,
    minOrders: 1,
    medianOrders: 6
  },
  monetary: {
    avgSpent: 1250,
    maxSpent: 8500,
    minSpent: 50,
    medianSpent: 780
  }
})

const rfmSegments = ref<RFMSegment[]>([
  {
    code: '111',
    name: '重要价值客户',
    tagType: 'danger',
    count: 156,
    percentage: 15.6,
    avgValue: 5200,
    valueContribution: 65.2,
    description: '最近消费、高频、高消费，核心客户群体'
  },
  {
    code: '311',
    name: '重要发展客户',
    tagType: 'warning',
    count: 98,
    percentage: 9.8,
    avgValue: 3800,
    valueContribution: 29.8,
    description: '最近未消费、高频、高消费，需重点挽回'
  },
  {
    code: '131',
    name: '重要保持客户',
    tagType: 'warning',
    count: 124,
    percentage: 12.4,
    avgValue: 3200,
    valueContribution: 31.7,
    description: '最近消费、低频、高消费，需提升消费频率'
  },
  {
    code: '133',
    name: '重要挽留客户',
    tagType: 'warning',
    count: 87,
    percentage: 8.7,
    avgValue: 2800,
    valueContribution: 19.5,
    description: '最近未消费、低频、高消费，需重点挽留'
  },
  {
    code: '112',
    name: '一般价值客户',
    tagType: 'success',
    count: 245,
    percentage: 24.5,
    avgValue: 950,
    valueContribution: 18.6,
    description: '最近消费、高频、低消费，可提升消费金额'
  },
  {
    code: '312',
    name: '一般发展客户',
    tagType: 'info',
    count: 186,
    percentage: 18.6,
    avgValue: 680,
    valueContribution: 10.1,
    description: '最近未消费、高频、低消费，需激活消费'
  },
  {
    code: '132',
    name: '一般保持客户',
    tagType: 'info',
    count: 68,
    percentage: 6.8,
    avgValue: 520,
    valueContribution: 2.8,
    description: '最近消费、低频、低消费，需提升消费频率和金额'
  },
  {
    code: '332',
    name: '一般挽留客户',
    tagType: 'info',
    count: 36,
    percentage: 3.6,
    avgValue: 320,
    valueContribution: 0.9,
    description: '最近未消费、低频、低消费，需综合提升'
  }
])

const customerList = ref<RFMCustomer[]>([
  {
    id: '1',
    name: '张三',
    phone: '13800138000',
    rfmScore: 444,
    recencyScore: 4,
    frequencyScore: 4,
    monetaryScore: 4,
    segment: '111',
    lastOrderDays: 2,
    orderCount: 28,
    totalSpent: 8500
  },
  {
    id: '2',
    name: '李四',
    phone: '13900139000',
    rfmScore: 433,
    recencyScore: 4,
    frequencyScore: 3,
    monetaryScore: 3,
    segment: '112',
    lastOrderDays: 5,
    orderCount: 18,
    totalSpent: 3200
  },
  {
    id: '3',
    name: '王五',
    phone: '13700137000',
    rfmScore: 322,
    recencyScore: 3,
    frequencyScore: 2,
    monetaryScore: 2,
    segment: '132',
    lastOrderDays: 15,
    orderCount: 8,
    totalSpent: 950
  }
])

const filters = reactive({
  segment: '',
  valueRange: '',
  sortBy: 'value_desc'
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 100
})

const configForm = reactive({
  recencyPeriod: 90,
  recencySegments: 5,
  frequencyPeriod: 180,
  frequencySegments: 5,
  monetaryPeriod: 365,
  monetarySegments: 5,
  recencyWeight: 0.3,
  frequencyWeight: 0.3,
  monetaryWeight: 0.4
})

const configRules = {
  recencyPeriod: [
    { required: true, message: '请输入R值计算周期', trigger: 'blur' }
  ],
  recencySegments: [
    { required: true, message: '请输入R值分段数', trigger: 'blur' }
  ],
  frequencyPeriod: [
    { required: true, message: '请输入F值计算周期', trigger: 'blur' }
  ],
  frequencySegments: [
    { required: true, message: '请输入F值分段数', trigger: 'blur' }
  ],
  monetaryPeriod: [
    { required: true, message: '请输入M值计算周期', trigger: 'blur' }
  ],
  monetarySegments: [
    { required: true, message: '请输入M值分段数', trigger: 'blur' }
  ]
}

const getScoreTagType = (score: number) => {
  if (score >= 400) return 'danger'
  if (score >= 300) return 'warning'
  if (score >= 200) return 'success'
  return 'info'
}

const getSegmentTagType = (segment: string) => {
  const segmentObj = rfmSegments.value.find(s => s.code === segment)
  return segmentObj?.tagType || 'info'
}

const getSegmentName = (segment: string) => {
  const segmentObj = rfmSegments.value.find(s => s.code === segment)
  return segmentObj?.name || segment
}

const refreshAssessment = async () => {
  try {
    ElMessage.loading('刷新RFM数据...')
    const response = await fetch('/api/customers/rfm').then(res => res.json())
    if (response.success) {
      rfmData.value = response.data.rfmData
      rfmSegments.value = response.data.segments
      customerList.value = response.data.customers
      ElMessage.success('刷新成功')
    }
  } catch (error) {
    console.error('Refresh assessment failed:', error)
    ElMessage.error('刷新失败')
  }
}

const loadCustomers = async () => {
  try {
    const response = await fetch('/api/customers/rfm/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...filters,
        page: pagination.page,
        pageSize: pagination.pageSize
      })
    }).then(res => res.json())
    if (response.success) {
      customerList.value = response.data.items
      pagination.total = response.data.total
    }
  } catch (error) {
    console.error('Load customers failed:', error)
    ElMessage.error('加载客户列表失败')
  }
}

const viewSegment = (segment: RFMSegment) => {
  filters.segment = segment.code
  loadCustomers()
}

const viewDetail = (customer: RFMCustomer) => {
  ElMessage.info(`查看客户 ${customer.name} 的详情`)
}

const analyzeCustomer = (customer: RFMCustomer) => {
  ElMessage.info(`分析客户 ${customer.name} 的价值`)
}

const exportAssessment = async () => {
  try {
    const response = await fetch('/api/customers/rfm/export').then(res => res.blob())
    const url = window.URL.createObjectURL(response)
    const a = document.createElement('a')
    a.href = url
    a.download = `RFM分析报告_${new Date().getTime()}.xlsx`
    a.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('Export assessment failed:', error)
    ElMessage.error('导出失败')
  }
}

const saveConfig = async () => {
  if (!configFormRef.value) return

  try {
    await configFormRef.value.validate()
    saving.value = true

    ElMessage.success('保存成功')
    showConfigDialog.value = false
    await refreshAssessment()
  } catch (error) {
    console.error('Save config failed:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const resetConfigForm = () => {
  configForm.recencyPeriod = 90
  configForm.recencySegments = 5
  configForm.frequencyPeriod = 180
  configForm.frequencySegments = 5
  configForm.monetaryPeriod = 365
  configForm.monetarySegments = 5
  configForm.recencyWeight = 0.3
  configForm.frequencyWeight = 0.3
  configForm.monetaryWeight = 0.4
  configFormRef.value?.resetFields()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadCustomers()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadCustomers()
}

onMounted(() => {
  refreshAssessment()
})
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.customer-value-assessment {
  .assessment-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .assessment-content {
      .rfm-overview {
        margin-bottom: $spacing-6;

        .rfm-metric {
          padding: $spacing-4;
          background: $white;
          border: 1px solid $border-color;
          border-radius: $border-radius-md;

          .metric-header {
            display: flex;
            align-items: center;
            gap: $spacing-3;
            margin-bottom: $spacing-3;

            .metric-icon {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 60px;
              height: 60px;
              border-radius: $border-radius-lg;
              color: white;

              &.recency {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }

              &.frequency {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              }

              &.monetary {
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
              }
            }

            .metric-info {
              flex: 1;

              .metric-title {
                font-size: $font-size-sm;
                color: $text-secondary;
                margin-bottom: $spacing-1;
              }

              .metric-value {
                font-size: $font-size-xl;
                font-weight: $font-weight-bold;
                color: $text-primary;
              }
            }
          }

          .metric-details {
            display: flex;
            justify-content: space-between;
            padding: $spacing-2;
            background: $background-light;
            border-radius: $border-radius-sm;

            .detail-item {
              text-align: center;

              .label {
                display: block;
                font-size: $font-size-xs;
                color: $text-secondary;
                margin-bottom: $spacing-1;
              }

              .value {
                display: block;
                font-size: $font-size-sm;
                font-weight: 600;
                color: $text-primary;
              }
            }
          }
        }
      }

      .rfm-segments {
        margin-bottom: $spacing-6;

        h3 {
          margin: 0 0 $spacing-4 0;
          font-size: $font-size-lg;
          font-weight: 600;
          color: $text-primary;
        }

        .segment-card {
          padding: $spacing-4;
          background: $white;
          border: 1px solid $border-color;
          border-radius: $border-radius-md;
          margin-bottom: $spacing-4;
          transition: all 0.3s;

          &:hover {
            box-shadow: $shadow-md;
            transform: translateY(-2px);
          }

          .segment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: $spacing-3;

            .segment-name {
              font-size: $font-size-base;
              font-weight: 600;
              color: $text-primary;
            }
          }

          .segment-metrics {
            margin-bottom: $spacing-3;

            .metric-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: $spacing-2;

              .label {
                font-size: $font-size-sm;
                color: $text-secondary;
              }

              .value {
                font-size: $font-size-sm;
                font-weight: 600;
                color: $text-primary;
              }
            }
          }

          .segment-description {
            font-size: $font-size-sm;
            color: $text-secondary;
            margin-bottom: $spacing-3;
            line-height: 1.5;
          }
        }
      }

      .rfm-analysis {
        margin-bottom: $spacing-6;

        h3 {
          margin: 0 0 $spacing-4 0;
          font-size: $font-size-lg;
          font-weight: 600;
          color: $text-primary;
        }

        .analysis-chart {
          padding: $spacing-4;
          background: $white;
          border: 1px solid $border-color;
          border-radius: $border-radius-md;

          .chart-title {
            font-size: $font-size-base;
            font-weight: 600;
            color: $text-primary;
            margin-bottom: $spacing-3;
          }

          .chart-placeholder {
            height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }

      .rfm-customers {
        h3 {
          margin: 0 0 $spacing-4 0;
          font-size: $font-size-lg;
          font-weight: 600;
          color: $text-primary;
        }

        .filter-bar {
          margin-bottom: $spacing-4;
          padding: $spacing-3;
          background: $background-light;
          border-radius: $border-radius-sm;

          .filter-form {
            margin: 0;
          }
        }

        .score-value {
          font-weight: 600;
          color: $primary-color;
        }

        .amount {
          font-weight: 600;
          color: $success-color;
        }

        .pagination {
          display: flex;
          justify-content: flex-end;
          margin-top: $spacing-4;
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
