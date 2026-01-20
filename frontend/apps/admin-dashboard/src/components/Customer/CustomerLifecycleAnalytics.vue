<template>
  <div class="lifecycle-analytics">
    <el-card class="analytics-card">
      <template #header>
        <div class="card-header">
          <span>生命周期数据分析</span>
          <el-button-group>
            <el-button size="small" @click="refreshAnalytics">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button type="primary" size="small" @click="showFilterDialog = true">
              <el-icon><Filter /></el-icon>
              筛选
            </el-button>
            <el-button size="small" @click="exportReport">
              <el-icon><Download /></el-icon>
              导出报告
            </el-button>
          </el-button-group>
        </div>
      </template>

      <div class="analytics-content">
        <div class="time-filter">
          <el-radio-group v-model="timeRange" @change="handleTimeRangeChange">
            <el-radio-button label="7d">近7天</el-radio-button>
            <el-radio-button label="30d">近30天</el-radio-button>
            <el-radio-button label="90d">近90天</el-radio-button>
            <el-radio-button label="180d">近180天</el-radio-button>
            <el-radio-button label="365d">近1年</el-radio-button>
          </el-radio-group>
        </div>

        <div class="key-metrics">
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="metric-card">
                <div class="metric-header">
                  <div class="metric-title">总客户数</div>
                  <el-icon class="metric-icon" :size="24"><User /></el-icon>
                </div>
                <div class="metric-value">{{ keyMetrics.totalCustomers }}</div>
                <div class="metric-trend">
                  <el-icon :size="14" :color="keyMetrics.totalCustomersTrend > 0 ? '#67c23a' : '#f56c6c'">
                    <component :is="keyMetrics.totalCustomersTrend > 0 ? 'Top' : 'Bottom'" />
                  </el-icon>
                  <span :class="{ 'positive': keyMetrics.totalCustomersTrend > 0, 'negative': keyMetrics.totalCustomersTrend < 0 }">
                    {{ keyMetrics.totalCustomersTrend > 0 ? '+' : '' }}{{ keyMetrics.totalCustomersTrend }}%
                  </span>
                  <span class="trend-label">较上期</span>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="metric-card">
                <div class="metric-header">
                  <div class="metric-title">转化率</div>
                  <el-icon class="metric-icon" :size="24"><TrendCharts /></el-icon>
                </div>
                <div class="metric-value">{{ keyMetrics.conversionRate }}%</div>
                <div class="metric-trend">
                  <el-icon :size="14" :color="keyMetrics.conversionRateTrend > 0 ? '#67c23a' : '#f56c6c'">
                    <component :is="keyMetrics.conversionRateTrend > 0 ? 'Top' : 'Bottom'" />
                  </el-icon>
                  <span :class="{ 'positive': keyMetrics.conversionRateTrend > 0, 'negative': keyMetrics.conversionRateTrend < 0 }">
                    {{ keyMetrics.conversionRateTrend > 0 ? '+' : '' }}{{ keyMetrics.conversionRateTrend }}%
                  </span>
                  <span class="trend-label">较上期</span>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="metric-card">
                <div class="metric-header">
                  <div class="metric-title">平均生命周期价值</div>
                  <el-icon class="metric-icon" :size="24"><Money /></el-icon>
                </div>
                <div class="metric-value">¥{{ keyMetrics.avgLTV.toFixed(0) }}</div>
                <div class="metric-trend">
                  <el-icon :size="14" :color="keyMetrics.avgLTVTrend > 0 ? '#67c23a' : '#f56c6c'">
                    <component :is="keyMetrics.avgLTVTrend > 0 ? 'Top' : 'Bottom'" />
                  </el-icon>
                  <span :class="{ 'positive': keyMetrics.avgLTVTrend > 0, 'negative': keyMetrics.avgLTVTrend < 0 }">
                    {{ keyMetrics.avgLTVTrend > 0 ? '+' : '' }}{{ keyMetrics.avgLTVTrend }}%
                  </span>
                  <span class="trend-label">较上期</span>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="metric-card">
                <div class="metric-header">
                  <div class="metric-title">流失率</div>
                  <el-icon class="metric-icon" :size="24"><WarningFilled /></el-icon>
                </div>
                <div class="metric-value">{{ keyMetrics.churnRate }}%</div>
                <div class="metric-trend">
                  <el-icon :size="14" :color="keyMetrics.churnRateTrend < 0 ? '#67c23a' : '#f56c6c'">
                    <component :is="keyMetrics.churnRateTrend < 0 ? 'Top' : 'Bottom'" />
                  </el-icon>
                  <span :class="{ 'positive': keyMetrics.churnRateTrend < 0, 'negative': keyMetrics.churnRateTrend > 0 }">
                    {{ keyMetrics.churnRateTrend > 0 ? '+' : '' }}{{ keyMetrics.churnRateTrend }}%
                  </span>
                  <span class="trend-label">较上期</span>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="lifecycle-stage-distribution">
          <h3>生命周期阶段分布</h3>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="chart-container">
                <div class="chart-title">客户数量分布</div>
                <div class="chart-placeholder">
                  <el-empty description="图表加载中..." />
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="chart-container">
                <div class="chart-title">客户价值分布</div>
                <div class="chart-placeholder">
                  <el-empty description="图表加载中..." />
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="lifecycle-flow-analysis">
          <h3>生命周期流转分析</h3>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="flow-chart">
                <div class="flow-title">流转路径</div>
                <div class="flow-diagram">
                  <div
                    v-for="(stage, index) in lifecycleStages"
                    :key="stage.key"
                    class="flow-stage"
                    :style="{ borderColor: stage.color }"
                  >
                    <div class="stage-header" :style="{ backgroundColor: stage.color }">
                      {{ stage.name }}
                    </div>
                    <div class="stage-stats">
                      <div class="stat-item">
                        <span class="label">客户数:</span>
                        <span class="value">{{ stage.count }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="label">占比:</span>
                        <span class="value">{{ stage.percentage }}%</span>
                      </div>
                      <div class="stat-item">
                        <span class="label">平均停留:</span>
                        <span class="value">{{ stage.avgDuration }}天</span>
                      </div>
                    </div>
                    <div v-if="index < lifecycleStages.length - 1" class="flow-arrow">
                      <div class="arrow-label">
                        <div class="label">流入: {{ stage.inflow }}</div>
                        <div class="label">流出: {{ stage.outflow }}</div>
                      </div>
                      <el-icon :size="24"><ArrowRight /></el-icon>
                    </div>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="chart-container">
                <div class="chart-title">转化漏斗</div>
                <div class="chart-placeholder">
                  <el-empty description="图表加载中..." />
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="conversion-analysis">
          <h3>转化分析</h3>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="conversion-metrics">
                <div class="metric-item">
                  <div class="metric-header">
                    <span class="metric-label">潜在客户 → 意向客户</span>
                    <span class="metric-rate">{{ conversionRates.potentialToIntention }}%</span>
                  </div>
                  <el-progress
                    :percentage="conversionRates.potentialToIntention"
                    :color="getConversionColor(conversionRates.potentialToIntention)"
                  />
                </div>
                <div class="metric-item">
                  <div class="metric-header">
                    <span class="metric-label">意向客户 → 成交客户</span>
                    <span class="metric-rate">{{ conversionRates.intentionToConverted }}%</span>
                  </div>
                  <el-progress
                    :percentage="conversionRates.intentionToConverted"
                    :color="getConversionColor(conversionRates.intentionToConverted)"
                  />
                </div>
                <div class="metric-item">
                  <div class="metric-header">
                    <span class="metric-label">成交客户 → 活跃客户</span>
                    <span class="metric-rate">{{ conversionRates.convertedToActive }}%</span>
                  </div>
                  <el-progress
                    :percentage="conversionRates.convertedToActive"
                    :color="getConversionColor(conversionRates.convertedToActive)"
                  />
                </div>
                <div class="metric-item">
                  <div class="metric-header">
                    <span class="metric-label">活跃客户 → 休眠客户</span>
                    <span class="metric-rate">{{ conversionRates.activeToDormant }}%</span>
                  </div>
                  <el-progress
                    :percentage="conversionRates.activeToDormant"
                    :color="getConversionColor(conversionRates.activeToDormant, true)"
                  />
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="chart-container">
                <div class="chart-title">转化趋势</div>
                <div class="chart-placeholder">
                  <el-empty description="图表加载中..." />
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="cohort-analysis">
          <h3>同期群分析</h3>
          <el-table :data="cohortData" stripe border>
            <el-table-column prop="cohort" label="同期群" width="120" />
            <el-table-column
              v-for="month in 12"
              :key="month"
              :label="`第${month}月`"
              width="80"
            >
              <template #default="{ row }">
                <div class="cohort-cell">
                  <div class="percentage">{{ row[`month${month}`] }}%</div>
                  <div class="bar" :style="{ width: row[`month${month}`] + '%' }"></div>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="value-distribution">
          <h3>客户价值分布</h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="value-segment">
                <div class="segment-header high-value">
                  <div class="segment-title">高价值客户</div>
                  <div class="segment-count">{{ valueDistribution.highValue.count }}</div>
                </div>
                <div class="segment-stats">
                  <div class="stat-item">
                    <span class="label">占比:</span>
                    <span class="value">{{ valueDistribution.highValue.percentage }}%</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">价值贡献:</span>
                    <span class="value">{{ valueDistribution.highValue.valueContribution }}%</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">平均价值:</span>
                    <span class="value">¥{{ valueDistribution.highValue.avgValue.toFixed(0) }}</span>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="value-segment">
                <div class="segment-header medium-value">
                  <div class="segment-title">中价值客户</div>
                  <div class="segment-count">{{ valueDistribution.mediumValue.count }}</div>
                </div>
                <div class="segment-stats">
                  <div class="stat-item">
                    <span class="label">占比:</span>
                    <span class="value">{{ valueDistribution.mediumValue.percentage }}%</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">价值贡献:</span>
                    <span class="value">{{ valueDistribution.mediumValue.valueContribution }}%</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">平均价值:</span>
                    <span class="value">¥{{ valueDistribution.mediumValue.avgValue.toFixed(0) }}</span>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="value-segment">
                <div class="segment-header low-value">
                  <div class="segment-title">低价值客户</div>
                  <div class="segment-count">{{ valueDistribution.lowValue.count }}</div>
                </div>
                <div class="segment-stats">
                  <div class="stat-item">
                    <span class="label">占比:</span>
                    <span class="value">{{ valueDistribution.lowValue.percentage }}%</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">价值贡献:</span>
                    <span class="value">{{ valueDistribution.lowValue.valueContribution }}%</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">平均价值:</span>
                    <span class="value">¥{{ valueDistribution.lowValue.avgValue.toFixed(0) }}</span>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-card>

    <el-dialog
      v-model="showFilterDialog"
      title="数据筛选"
      width="600px"
      @closed="resetFilterForm"
    >
      <el-form
        ref="filterFormRef"
        :model="filterForm"
        label-width="120px"
      >
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item label="客户分群">
          <el-select v-model="filterForm.segments" multiple placeholder="全部分群">
            <el-option
              v-for="segment in lifecycleStages"
              :key="segment.key"
              :label="segment.name"
              :value="segment.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="客户等级">
          <el-select v-model="filterForm.memberLevels" multiple placeholder="全部等级">
            <el-option label="普通会员" value="regular" />
            <el-option label="银卡会员" value="silver" />
            <el-option label="金卡会员" value="gold" />
            <el-option label="白金会员" value="platinum" />
          </el-select>
        </el-form-item>
        <el-form-item label="客户来源">
          <el-select v-model="filterForm.sources" multiple placeholder="全部来源">
            <el-option label="线上注册" value="online" />
            <el-option label="线下门店" value="offline" />
            <el-option label="推荐" value="referral" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showFilterDialog = false">取消</el-button>
        <el-button type="primary" @click="applyFilter">
          应用
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
  Filter,
  Download,
  User,
  TrendCharts,
  Money,
  WarningFilled,
  Top,
  Bottom,
  ArrowRight
} from '@element-plus/icons-vue'

interface KeyMetrics {
  totalCustomers: number
  totalCustomersTrend: number
  conversionRate: number
  conversionRateTrend: number
  avgLTV: number
  avgLTVTrend: number
  churnRate: number
  churnRateTrend: number
}

interface LifecycleStage {
  key: string
  name: string
  color: string
  count: number
  percentage: number
  avgDuration: number
  inflow: number
  outflow: number
}

const timeRange = ref('30d')
const showFilterDialog = ref(false)
const filterFormRef = ref()

const keyMetrics = ref<KeyMetrics>({
  totalCustomers: 1000,
  totalCustomersTrend: 5.2,
  conversionRate: 68.7,
  conversionRateTrend: 3.5,
  avgLTV: 3250,
  avgLTVTrend: 8.3,
  churnRate: 12.5,
  churnRateTrend: -2.1
})

const lifecycleStages = ref<LifecycleStage[]>([
  {
    key: 'potential',
    name: '潜在客户',
    color: '#909399',
    count: 245,
    percentage: 24.5,
    avgDuration: 15,
    inflow: 50,
    outflow: 85
  },
  {
    key: 'intention',
    name: '意向客户',
    color: '#409eff',
    count: 186,
    percentage: 18.6,
    avgDuration: 22,
    inflow: 85,
    outflow: 95
  },
  {
    key: 'converted',
    name: '成交客户',
    color: '#67c23a',
    count: 312,
    percentage: 31.2,
    avgDuration: 45,
    inflow: 95,
    outflow: 68
  },
  {
    key: 'active',
    name: '活跃客户',
    color: '#e6a23c',
    count: 189,
    percentage: 18.9,
    avgDuration: 90,
    inflow: 68,
    outflow: 25
  },
  {
    key: 'dormant',
    name: '休眠客户',
    color: '#f56c6c',
    count: 68,
    percentage: 6.8,
    avgDuration: 120,
    inflow: 25,
    outflow: 10
  }
])

const conversionRates = ref({
  potentialToIntention: 34.7,
  intentionToConverted: 51.1,
  convertedToActive: 60.6,
  activeToDormant: 13.2
})

const cohortData = ref([
  {
    cohort: '2024-01',
    month1: 100,
    month2: 75,
    month3: 60,
    month4: 50,
    month5: 45,
    month6: 40,
    month7: 38,
    month8: 35,
    month9: 33,
    month10: 31,
    month11: 30,
    month12: 28
  },
  {
    cohort: '2024-02',
    month1: 100,
    month2: 78,
    month3: 62,
    month4: 52,
    month5: 47,
    month6: 42,
    month7: 39,
    month8: 36,
    month9: 34,
    month10: 32,
    month11: 30,
    month12: 28
  },
  {
    cohort: '2024-03',
    month1: 100,
    month2: 80,
    month3: 65,
    month4: 55,
    month5: 50,
    month6: 45,
    month7: 42,
    month8: 39,
    month9: 37,
    month10: 35,
    month11: 33,
    month12: 31
  }
])

const valueDistribution = ref({
  highValue: {
    count: 156,
    percentage: 15.6,
    valueContribution: 65.2,
    avgValue: 5200
  },
  mediumValue: {
    count: 528,
    percentage: 52.8,
    valueContribution: 30.5,
    avgValue: 950
  },
  lowValue: {
    count: 316,
    percentage: 31.6,
    valueContribution: 4.3,
    avgValue: 280
  }
})

const filterForm = reactive({
  dateRange: null as [Date, Date] | null,
  segments: [] as string[],
  memberLevels: [] as string[],
  sources: [] as string[]
})

const getConversionColor = (rate: number, isNegative = false) => {
  if (isNegative) {
    if (rate > 20) return '#f56c6c'
    if (rate > 10) return '#e6a23c'
    return '#67c23a'
  }
  if (rate > 70) return '#67c23a'
  if (rate > 50) return '#409eff'
  if (rate > 30) return '#e6a23c'
  return '#f56c6c'
}

const refreshAnalytics = async () => {
  try {
    ElMessage.loading('刷新生命周期分析数据...')
    const response = await fetch(`/api/customers/lifecycle/analytics?range=${timeRange.value}`).then(res => res.json())
    if (response.success) {
      keyMetrics.value = response.data.keyMetrics
      lifecycleStages.value = response.data.stages
      conversionRates.value = response.data.conversionRates
      cohortData.value = response.data.cohortData
      valueDistribution.value = response.data.valueDistribution
      ElMessage.success('刷新成功')
    }
  } catch (error) {
    console.error('Refresh analytics failed:', error)
    ElMessage.error('刷新失败')
  }
}

const handleTimeRangeChange = () => {
  refreshAnalytics()
}

const applyFilter = () => {
  showFilterDialog.value = false
  refreshAnalytics()
}

const resetFilterForm = () => {
  filterForm.dateRange = null
  filterForm.segments = []
  filterForm.memberLevels = []
  filterForm.sources = []
}

const exportReport = async () => {
  try {
    const response = await fetch('/api/customers/lifecycle/analytics/export').then(res => res.blob())
    const url = window.URL.createObjectURL(response)
    const a = document.createElement('a')
    a.href = url
    a.download = `生命周期分析报告_${new Date().getTime()}.xlsx`
    a.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('Export report failed:', error)
    ElMessage.error('导出失败')
  }
}

onMounted(() => {
  refreshAnalytics()
})
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.lifecycle-analytics {
  .analytics-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .analytics-content {
      .time-filter {
        margin-bottom: $spacing-6;
        text-align: center;
      }

      .key-metrics {
        margin-bottom: $spacing-6;

        .metric-card {
          padding: $spacing-4;
          background: $white;
          border: 1px solid $border-color;
          border-radius: $border-radius-md;
          transition: all 0.3s;

          &:hover {
            box-shadow: $shadow-md;
            transform: translateY(-2px);
          }

          .metric-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: $spacing-3;

            .metric-title {
              font-size: $font-size-sm;
              color: $text-secondary;
            }

            .metric-icon {
              color: $primary-color;
            }
          }

          .metric-value {
            font-size: $font-size-2xl;
            font-weight: $font-weight-bold;
            color: $text-primary;
            margin-bottom: $spacing-2;
          }

          .metric-trend {
            display: flex;
            align-items: center;
            gap: $spacing-1;
            font-size: $font-size-sm;

            .positive {
              color: $success-color;
            }

            .negative {
              color: $danger-color;
            }

            .trend-label {
              color: $text-secondary;
            }
          }
        }
      }

      .lifecycle-stage-distribution,
      .lifecycle-flow-analysis,
      .conversion-analysis,
      .cohort-analysis,
      .value-distribution {
        margin-bottom: $spacing-6;

        h3 {
          margin: 0 0 $spacing-4 0;
          font-size: $font-size-lg;
          font-weight: 600;
          color: $text-primary;
        }

        .chart-container {
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

      .lifecycle-flow-analysis {
        .flow-chart {
          padding: $spacing-4;
          background: $white;
          border: 1px solid $border-color;
          border-radius: $border-radius-md;

          .flow-title {
            font-size: $font-size-base;
            font-weight: 600;
            color: $text-primary;
            margin-bottom: $spacing-3;
          }

          .flow-diagram {
            display: flex;
            align-items: center;
            gap: $spacing-3;
            overflow-x: auto;

            .flow-stage {
              flex-shrink: 0;
              padding: $spacing-3;
              border: 2px solid;
              border-radius: $border-radius-md;
              min-width: 180px;

              .stage-header {
                padding: $spacing-2;
                color: white;
                font-weight: 600;
                text-align: center;
                border-radius: $border-radius-sm;
                margin-bottom: $spacing-2;
              }

              .stage-stats {
                .stat-item {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: $spacing-1;
                  font-size: $font-size-sm;

                  .label {
                    color: $text-secondary;
                  }

                  .value {
                    font-weight: 600;
                    color: $text-primary;
                  }
                }
              }
            }

            .flow-arrow {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: $spacing-1;
              flex-shrink: 0;
              color: $text-secondary;

              .arrow-label {
                font-size: $font-size-xs;
                text-align: center;

                .label {
                  display: block;
                  margin-bottom: $spacing-1;
                }
              }
            }
          }
        }
      }

      .conversion-analysis {
        .conversion-metrics {
          padding: $spacing-4;
          background: $white;
          border: 1px solid $border-color;
          border-radius: $border-radius-md;

          .metric-item {
            margin-bottom: $spacing-4;

            &:last-child {
              margin-bottom: 0;
            }

            .metric-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: $spacing-2;

              .metric-label {
                font-size: $font-size-sm;
                color: $text-primary;
              }

              .metric-rate {
                font-size: $font-size-base;
                font-weight: 600;
                color: $primary-color;
              }
            }
          }
        }
      }

      .cohort-analysis {
        :deep(.el-table) {
          .cohort-cell {
            position: relative;

            .percentage {
              font-size: $font-size-sm;
              font-weight: 600;
              color: $text-primary;
            }

            .bar {
              position: absolute;
              top: 0;
              left: 0;
              height: 100%;
              background: linear-gradient(90deg, #409eff 0%, #67c23a 100%);
              opacity: 0.2;
              z-index: -1;
            }
          }
        }
      }

      .value-distribution {
        .value-segment {
          padding: $spacing-4;
          background: $white;
          border: 1px solid $border-color;
          border-radius: $border-radius-md;

          .segment-header {
            padding: $spacing-3;
            border-radius: $border-radius-sm;
            margin-bottom: $spacing-3;
            display: flex;
            justify-content: space-between;
            align-items: center;

            &.high-value {
              background: linear-gradient(135deg, #f56c6c 0%, #e6a23c 100%);
              color: white;
            }

            &.medium-value {
              background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
              color: white;
            }

            &.low-value {
              background: linear-gradient(135deg, #909399 0%, #606266 100%);
              color: white;
            }

            .segment-title {
              font-size: $font-size-base;
              font-weight: 600;
            }

            .segment-count {
              font-size: $font-size-xl;
              font-weight: $font-weight-bold;
            }
          }

          .segment-stats {
            .stat-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: $spacing-2;
              font-size: $font-size-sm;

              .label {
                color: $text-secondary;
              }

              .value {
                font-weight: 600;
                color: $text-primary;
              }
            }
          }
        }
      }
    }
  }
}
</style>
