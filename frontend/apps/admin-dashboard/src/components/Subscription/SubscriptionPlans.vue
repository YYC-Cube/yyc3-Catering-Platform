<template>
  <div class="subscription-plans">
    <!-- 套餐卡片 -->
    <div class="plans-grid">
      <div
        v-for="plan in displayPlans"
        :key="plan.id"
        class="plan-card"
        :class="{
          'popular': plan.popular,
          'recommended': plan.recommended,
          'current': isCurrentPlan(plan),
          'selected': selectedPlan?.id === plan.id
        }"
      >
        <!-- 套餐标签 -->
        <div class="plan-badges">
          <el-tag v-if="plan.popular" type="success" size="small">热门</el-tag>
          <el-tag v-if="plan.recommended" type="warning" size="small">推荐</el-tag>
          <el-tag v-if="isCurrentPlan(plan)" type="info" size="small">当前</el-tag>
        </div>

        <!-- 套餐名称 -->
        <div class="plan-header">
          <h3>{{ plan.name }}</h3>
          <p>{{ plan.description }}</p>
        </div>

        <!-- 价格 -->
        <div class="plan-pricing">
          <div class="price-main">
            <span class="currency">¥</span>
            <span class="amount">{{ formatPrice(plan.price[billingCycle]) }}</span>
            <span class="period">/{{ getPeriodText(billingCycle) }}</span>
          </div>
          <div class="price-savings" v-if="billingCycle === 'yearly'">
            节省 {{ calculateSavings(plan) }}%
          </div>
        </div>

        <!-- 功能列表 -->
        <div class="plan-features">
          <div class="feature-section">
            <h4>基础功能</h4>
            <ul>
              <li :class="{ 'limited': plan.features.maxUsers < 100 }">
                <el-icon><User /></el-icon>
                <span>用户数量: {{ formatLimit(plan.features.maxUsers) }}</span>
              </li>
              <li :class="{ 'limited': plan.features.maxOrders < 1000 }">
                <el-icon><Document /></el-icon>
                <span>订单数量: {{ formatLimit(plan.features.maxOrders) }}</span>
              </li>
              <li :class="{ 'limited': plan.features.maxProducts < 500 }">
                <el-icon><Box /></el-icon>
                <span>商品数量: {{ formatLimit(plan.features.maxProducts) }}</span>
              </li>
              <li :class="{ 'limited': plan.features.maxStorage < 50 }">
                <el-icon><Folder /></el-icon>
                <span>存储空间: {{ plan.features.maxStorage }}GB</span>
              </li>
            </ul>
          </div>

          <div class="feature-section">
            <h4>高级功能</h4>
            <ul>
              <li :class="{ 'disabled': !plan.features.aiAnalysis }">
                <el-icon><TrendCharts /></el-icon>
                <span>AI智能分析</span>
                <el-icon v-if="plan.features.aiAnalysis" class="check-icon"><Check /></el-icon>
              </li>
              <li :class="{ 'disabled': !plan.features.advancedReporting }">
                <el-icon><DataAnalysis /></el-icon>
                <span>高级报表</span>
                <el-icon v-if="plan.features.advancedReporting" class="check-icon"><Check /></el-icon>
              </li>
              <li :class="{ 'disabled': !plan.features.apiAccess }">
                <el-icon><Connection /></el-icon>
                <span>API访问</span>
                <el-icon v-if="plan.features.apiAccess" class="check-icon"><Check /></el-icon>
              </li>
              <li :class="{ 'disabled': !plan.features.prioritySupport }">
                <el-icon><Service /></el-icon>
                <span>优先支持</span>
                <el-icon v-if="plan.features.prioritySupport" class="check-icon"><Check /></el-icon>
              </li>
              <li :class="{ 'disabled': !plan.features.customBranding }">
                <el-icon><Brush /></el-icon>
                <span>自定义品牌</span>
                <el-icon v-if="plan.features.customBranding" class="check-icon"><Check /></el-icon>
              </li>
              <li :class="{ 'disabled': !plan.features.dataExport }">
                <el-icon><Download /></el-icon>
                <span>数据导出</span>
                <el-icon v-if="plan.features.dataExport" class="check-icon"><Check /></el-icon>
              </li>
            </ul>
          </div>

          <div class="feature-section" v-if="hasEnterpriseFeatures(plan)">
            <h4>企业功能</h4>
            <ul>
              <li :class="{ 'disabled': !plan.features.ssoIntegration }">
                <el-icon><Lock /></el-icon>
                <span>SSO集成</span>
                <el-icon v-if="plan.features.ssoIntegration" class="check-icon"><Check /></el-icon>
              </li>
              <li :class="{ 'disabled': !plan.features.auditLog }">
                <el-icon><Document /></el-icon>
                <span>审计日志</span>
                <el-icon v-if="plan.features.auditLog" class="check-icon"><Check /></el-icon>
              </li>
              <li :class="{ 'disabled': !plan.features.customTraining }">
                <el-icon><GraduationCap /></el-icon>
                <span>定制培训</span>
                <el-icon v-if="plan.features.customTraining" class="check-icon"><Check /></el-icon>
              </li>
              <li :class="{ 'disabled': !plan.features.dedicatedSupport }">
                <el-icon><UserFilled /></el-icon>
                <span>专属支持</span>
                <el-icon v-if="plan.features.dedicatedSupport" class="check-icon"><Check /></el-icon>
              </li>
              <li :class="{ 'disabled': !plan.features.slaGuarantee }">
                <el-icon><Shield /></el-icon>
                <span>SLA保证</span>
                <el-icon v-if="plan.features.slaGuarantee" class="check-icon"><Check /></el-icon>
              </li>
            </ul>
          </div>
        </div>

        <!-- 使用限制 -->
        <div class="plan-limits">
          <div class="limit-item">
            <span class="label">API调用/月</span>
            <span class="value">{{ formatLimit(plan.limits.apiCallsPerMonth) }}</span>
          </div>
          <div class="limit-item">
            <span class="label">数据保留</span>
            <span class="value">{{ plan.limits.dataRetentionDays }}天</span>
          </div>
          <div class="limit-item">
            <span class="label">并发连接</span>
            <span class="value">{{ plan.limits.concurrentConnections }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="plan-actions">
          <el-button
            v-if="mode === 'select'"
            type="primary"
            size="large"
            :disabled="selectedPlan?.id === plan.id"
            @click="handleSelect(plan)"
            :loading="loading"
          >
            {{ selectedPlan?.id === plan.id ? '已选择' : '选择此套餐' }}
          </el-button>

          <el-button
            v-else-if="mode === 'upgrade'"
            type="primary"
            size="large"
            :disabled="isCurrentPlan(plan) || isDowngrade(plan)"
            @click="handleUpgrade(plan)"
            :loading="loading"
          >
            <span v-if="isCurrentPlan(plan)">当前套餐</span>
            <span v-else-if="isDowngrade(plan)">不可降级</span>
            <span v-else>升级到此套餐</span>
          </el-button>

          <el-button
            v-else
            type="primary"
            size="large"
            @click="handleSelect(plan)"
            :loading="loading"
          >
            选择此套餐
          </el-button>
        </div>
      </div>
    </div>

    <!-- 计费周期选择 -->
    <div class="billing-cycle-selector">
      <el-radio-group v-model="billingCycle" @change="onBillingCycleChange">
        <el-radio-button label="monthly">月付</el-radio-button>
        <el-radio-button label="quarterly">季付</el-radio-button>
        <el-radio-button label="yearly">年付</el-radio-button>
      </el-radio-group>
      <div class="savings-hint" v-if="billingCycle === 'yearly'">
        年付可享受额外折扣
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  User, Document, Box, Folder, TrendCharts, DataAnalysis,
  Connection, Service, Download, Lock,
  UserFilled, Check
} from '@element-plus/icons-vue'
import { subscriptionAPI } from '@/api/subscription'
import type { SubscriptionPlan, BillingCycle } from '@/api/subscription'

// Props
interface Props {
  currentPlan?: SubscriptionPlan
  mode?: 'select' | 'upgrade' | 'compare'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'compare'
})

// Emits
const emit = defineEmits<{
  select: [plan: SubscriptionPlan]
}>()

// 响应式数据
const plans = ref<SubscriptionPlan[]>([])
const billingCycle = ref<BillingCycle>('monthly')
const selectedPlan = ref<SubscriptionPlan | null>(null)
const loading = ref(false)

// 计算属性
const displayPlans = computed(() => {
  let sortedPlans = [...plans.value]

  // 在升级模式下，排除当前套餐
  if (props.mode === 'upgrade' && props.currentPlan) {
    sortedPlans = sortedPlans.filter(plan => plan.id !== props.currentPlan!.id)
  }

  // 按价格排序
  sortedPlans.sort((a, b) => a.price[billingCycle.value] - b.price[billingCycle.value])

  return sortedPlans
})

// 生命周期
onMounted(() => {
  loadPlans()
})

// 方法
const loadPlans = async () => {
  try {
    loading.value = true
    const response = await subscriptionAPI.getPlans()

    if (response.success && response.data) {
      plans.value = response.data
    } else {
      ElMessage.error('加载套餐信息失败')
    }
  } catch (error) {
    console.error('Load plans failed:', error)
    ElMessage.error('加载套餐信息失败')
  } finally {
    loading.value = false
  }
}

const formatPrice = (price: number) => {
  return price.toLocaleString()
}

const formatLimit = (limit: number) => {
  if (limit >= 1000000) {
    return '无限'
  }
  return limit.toLocaleString()
}

const getPeriodText = (cycle: BillingCycle) => {
  const texts = {
    monthly: '月',
    quarterly: '季度',
    yearly: '年'
  }
  return texts[cycle]
}

const calculateSavings = (plan: SubscriptionPlan) => {
  const monthlyTotal = plan.price.monthly * 12
  const yearlyPrice = plan.price.yearly
  const savings = Math.round(((monthlyTotal - yearlyPrice) / monthlyTotal) * 100)
  return savings
}

const isCurrentPlan = (plan: SubscriptionPlan) => {
  return props.currentPlan?.id === plan.id
}

const isDowngrade = (plan: SubscriptionPlan) => {
  if (!props.currentPlan) return false

  const currentPrice = props.currentPlan.price[billingCycle.value]
  const planPrice = plan.price[billingCycle.value]

  return planPrice < currentPrice
}

const hasEnterpriseFeatures = (plan: SubscriptionPlan) => {
  return plan.features.ssoIntegration ||
         plan.features.auditLog ||
         plan.features.customTraining ||
         plan.features.dedicatedSupport ||
         plan.features.slaGuarantee
}

const onBillingCycleChange = () => {
  // 计费周期变化时可以做一些额外处理
  console.log('Billing cycle changed to:', billingCycle.value)
}

const handleSelect = (plan: SubscriptionPlan) => {
  selectedPlan.value = plan
  emit('select', plan)
}

const handleUpgrade = (plan: SubscriptionPlan) => {
  emit('select', plan)
}
</script>

<style lang="scss" scoped>
.subscription-plans {
  .plans-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
  }

  .plan-card {
    background: white;
    border-radius: 16px;
    border: 2px solid #e4e7ed;
    padding: 24px;
    position: relative;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    }

    &.popular {
      border-color: #67c23a;
    }

    &.recommended {
      border-color: #e6a23c;
    }

    &.current {
      border-color: #409eff;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    }

    &.selected {
      border-color: #409eff;
      box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.1);
    }

    .plan-badges {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      justify-content: center;
    }

    .plan-header {
      text-align: center;
      margin-bottom: 24px;

      h3 {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
        color: #303133;
      }

      p {
        margin: 0;
        color: #909399;
        font-size: 14px;
        line-height: 1.5;
      }
    }

    .plan-pricing {
      text-align: center;
      margin-bottom: 24px;

      .price-main {
        display: flex;
        align-items: baseline;
        justify-content: center;
        margin-bottom: 8px;

        .currency {
          font-size: 20px;
          color: #606266;
          font-weight: 500;
        }

        .amount {
          font-size: 36px;
          font-weight: 700;
          color: #303133;
          margin: 0 4px;
        }

        .period {
          font-size: 16px;
          color: #909399;
        }
      }

      .price-savings {
        color: #67c23a;
        font-size: 14px;
        font-weight: 600;
      }
    }

    .plan-features {
      margin-bottom: 24px;

      .feature-section {
        margin-bottom: 20px;

        h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #303133;
        }

        ul {
          list-style: none;
          padding: 0;
          margin: 0;

          li {
            display: flex;
            align-items: center;
            padding: 8px 0;
            font-size: 14px;
            color: #606266;
            gap: 8px;

            &:not(.disabled) {
              .el-icon {
                color: #67c23a;
              }
            }

            &.disabled {
              color: #c0c4cc;
              text-decoration: line-through;
            }

            &.limited {
              color: #e6a23c;
            }

            .check-icon {
              margin-left: auto;
              color: #67c23a;
            }
          }
        }
      }
    }

    .plan-limits {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;

      .limit-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 0;

        .label {
          font-size: 13px;
          color: #909399;
        }

        .value {
          font-size: 13px;
          font-weight: 600;
          color: #303133;
        }
      }
    }

    .plan-actions {
      .el-button {
        width: 100%;
        height: 44px;
        font-size: 16px;
        font-weight: 600;
      }
    }
  }

  .billing-cycle-selector {
    text-align: center;
    padding: 24px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    .el-radio-group {
      margin-bottom: 12px;
    }

    .savings-hint {
      color: #67c23a;
      font-size: 14px;
      font-weight: 500;
    }
  }
}

@media (max-width: 768px) {
  .subscription-plans {
    .plans-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .plan-card {
      padding: 16px;

      .plan-pricing {
        .price-main {
          .amount {
            font-size: 28px;
          }
        }
      }
    }
  }
}
</style>