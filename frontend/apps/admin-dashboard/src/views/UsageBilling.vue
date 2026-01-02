<template>
  <div class="usage-billing">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>使用量计费</h1>
        <p>精细化的使用量计费和成本管理</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showPricingDialog = true">
          <el-icon><Setting /></el-icon>
          计费配置
        </el-button>
      </div>
    </div>

    <!-- 成本概览 -->
    <div class="cost-overview">
      <el-card class="overview-card">
        <div class="cost-summary">
          <div class="summary-item">
            <div class="summary-icon current">
              <el-icon><Money /></el-icon>
            </div>
            <div class="summary-info">
              <div class="summary-value">¥{{ currentMonthCost.toLocaleString() }}</div>
              <div class="summary-label">本月费用</div>
              <div class="summary-trend positive">
                <el-icon><TrendCharts /></el-icon>
                {{ monthlyTrend }}% vs 上月
              </div>
            </div>
          </div>

          <div class="summary-item">
            <div class="summary-icon forecast">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="summary-info">
              <div class="summary-value">¥{{ forecastCost.toLocaleString() }}</div>
              <div class="summary-label">下月预测</div>
              <div class="summary-confidence">
                置信度 {{ forecastConfidence }}%
              </div>
            </div>
          </div>

          <div class="summary-item">
            <div class="summary-icon savings">
              <el-icon><Coin /></el-icon>
            </div>
            <div class="summary-info">
              <div class="summary-value">¥{{ potentialSavings.toLocaleString() }}</div>
              <div class="summary-label">潜在节省</div>
              <div class="summary-count">
                {{ optimizationCount }} 条建议
              </div>
            </div>
          </div>

          <div class="summary-item">
            <div class="summary-icon efficiency">
              <el-icon><Odometer /></el-icon>
            </div>
            <div class="summary-info">
              <div class="summary-value">{{ costEfficiency }}%</div>
              <div class="summary-label">成本效率</div>
              <div class="summary-status" :class="getEfficiencyStatus(costEfficiency)">
                {{ getEfficiencyText(costEfficiency) }}
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 选项卡 -->
    <el-tabs v-model="activeTab" class="billing-tabs">
      <!-- 使用量分析 -->
      <el-tab-pane label="使用量分析" name="analytics">
        <UsageAnalytics />
      </el-tab-pane>

      <!-- 计费配置 -->
      <el-tab-pane label="计费配置" name="pricing">
        <PricingConfiguration @refresh="loadPricingConfigs" />
      </el-tab-pane>

      <!-- 使用量账单 -->
      <el-tab-pane label="使用量账单" name="bills">
        <UsageBills />
      </el-tab-pane>

      <!-- 预算管理 -->
      <el-tab-pane label="预算管理" name="budgets">
        <BudgetManagement />
      </el-tab-pane>

      <!-- 成本优化 -->
      <el-tab-pane label="成本优化" name="optimization">
        <CostOptimization />
      </el-tab-pane>
    </el-tabs>

    <!-- 计费配置对话框 -->
    <el-dialog
      v-model="showPricingDialog"
      title="计费配置"
      width="80%"
      :destroy-on-close="true"
    >
      <PricingConfiguration :mode="'dialog'" @refresh="loadPricingConfigs" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Setting, Money, DataAnalysis, Coin, Odometer, TrendCharts
} from '@element-plus/icons-vue'
import { usageBillingAPI } from '@/api/usage-billing'
import UsageAnalytics from '@/components/UsageBilling/UsageAnalytics.vue'
import PricingConfiguration from '@/components/UsageBilling/PricingConfiguration.vue'
import UsageBills from '@/components/UsageBilling/UsageBills.vue'
import BudgetManagement from '@/components/UsageBilling/BudgetManagement.vue'
import CostOptimization from '@/components/UsageBilling/CostOptimization.vue'

// 响应式数据
const activeTab = ref('analytics')
const showPricingDialog = ref(false)

// 成本数据
const currentMonthCost = ref(3580)
const monthlyTrend = ref(12.5)
const forecastCost = ref(3750)
const forecastConfidence = ref(85)
const potentialSavings = ref(480)
const optimizationCount = ref(6)
const costEfficiency = ref(78)

// 生命周期
onMounted(() => {
  loadCostOverview()
})

// 方法
const loadCostOverview = async () => {
  try {
    // 并行加载成本概览数据
    const [analyticsRes, forecastRes, optimizationRes] = await Promise.all([
      usageBillingAPI.getUsageStats({ period: 'month' }),
      usageBillingAPI.getCostForecast({ period: 'month', forecastPeriods: 1 }),
      usageBillingAPI.getOptimizationSuggestions({ savingsThreshold: 100 })
    ])

    if (analyticsRes.success && analyticsRes.data) {
      // 更新当前费用和效率
      currentMonthCost.value = analyticsRes.data.costs.total
      costEfficiency.value = Math.round(analyticsRes.data.efficiency.costEfficiency * 100)
    }

    if (forecastRes.success && forecastRes.data) {
      const forecast = forecastRes.data.forecast[0]
      forecastCost.value = forecast.predictedCost
      forecastConfidence.value = Math.round(forecast.confidence * 100)
    }

    if (optimizationRes.success && optimizationRes.data) {
      potentialSavings.value = optimizationRes.data.totalPotentialSavings
      optimizationCount.value = optimizationRes.data.suggestions.length
    }
  } catch (error) {
    console.error('Load cost overview failed:', error)
  }
}

const getEfficiencyStatus = (efficiency: number) => {
  if (efficiency >= 80) return 'good'
  if (efficiency >= 60) return 'medium'
  return 'poor'
}

const getEfficiencyText = (efficiency: number) => {
  if (efficiency >= 80) return '优秀'
  if (efficiency >= 60) return '良好'
  return '需改进'
}

const loadPricingConfigs = () => {
  // 计费配置更新后的处理
  ElMessage.success('计费配置已更新')
}
</script>

<style lang="scss" scoped>
.usage-billing {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;

    .header-content {
      h1 {
        margin: 0 0 8px 0;
        font-size: 28px;
        font-weight: 600;
        color: #303133;
      }

      p {
        margin: 0;
        color: #909399;
        font-size: 14px;
      }
    }
  }

  .cost-overview {
    margin-bottom: 24px;

    .overview-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .cost-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;

      .summary-item {
        display: flex;
        align-items: center;
        gap: 16px;

        .summary-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;

          &.current {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          &.forecast {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
          }

          &.savings {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            color: white;
          }

          &.efficiency {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
          }
        }

        .summary-info {
          flex: 1;

          .summary-value {
            font-size: 28px;
            font-weight: 700;
            color: #303133;
            line-height: 1.2;
          }

          .summary-label {
            font-size: 14px;
            color: #909399;
            margin: 4px 0;
          }

          .summary-trend {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 13px;
            font-weight: 500;

            &.positive {
              color: #67c23a;
            }

            &.negative {
              color: #f56c6c;
            }
          }

          .summary-confidence {
            font-size: 13px;
            color: #606266;
          }

          .summary-count {
            font-size: 13px;
            color: #606266;
          }

          .summary-status {
            font-size: 13px;
            font-weight: 500;

            &.good {
              color: #67c23a;
            }

            &.medium {
              color: #e6a23c;
            }

            &.poor {
              color: #f56c6c;
            }
          }
        }
      }
    }
  }

  .billing-tabs {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    :deep(.el-tabs__header) {
      margin: 0;
      background: #f8f9fa;
    }

    :deep(.el-tabs__nav-wrap) {
      padding: 0 24px;
    }

    :deep(.el-tabs__content) {
      padding: 24px;
    }
  }

  .el-dialog {
    .el-dialog__body {
      padding: 0;
    }
  }
}

@media (max-width: 768px) {
  .usage-billing {
    padding: 16px;

    .page-header {
      flex-direction: column;
      gap: 16px;
    }

    .cost-summary {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }
}
</style>