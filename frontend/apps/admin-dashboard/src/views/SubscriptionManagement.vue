<template>
  <div class="subscription-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>订阅管理</h1>
        <p>管理您的订阅计划、使用情况和账单信息</p>
      </div>
      <div class="header-actions">
        <el-button
          type="primary"
          @click="showUpgradeDialog = true"
          v-if="currentSubscription && currentSubscription.status !== 'cancelled'"
        >
          升级套餐
        </el-button>
      </div>
    </div>

    <!-- 当前订阅状态 -->
    <div v-if="currentSubscription" class="subscription-status">
      <el-card>
        <div class="status-header">
          <div class="plan-info">
            <h2>{{ currentSubscription.plan.name }}</h2>
            <el-tag
              :type="getStatusType(currentSubscription.status)"
              size="large"
            >
              {{ getStatusText(currentSubscription.status) }}
            </el-tag>
          </div>
          <div class="billing-info">
            <p><strong>计费周期:</strong> {{ getBillingCycleText(currentSubscription.billingCycle) }}</p>
            <p><strong>下次扣费:</strong> {{ formatDate(currentSubscription.nextBillingDate) }}</p>
            <p><strong>月费:</strong> ¥{{ currentSubscription.price.toLocaleString() }}</p>
          </div>
        </div>

        <!-- 使用情况 -->
        <div class="usage-overview">
          <h3>使用情况</h3>
          <div class="usage-grid">
            <div
              v-for="(usage, key) in currentUsage"
              :key="key"
              class="usage-item"
            >
              <div class="usage-label">{{ getUsageLabel(key) }}</div>
              <div class="usage-value">
                {{ usage.current.toLocaleString() }} / {{ usage.limit.toLocaleString() }}
              </div>
              <el-progress
                :percentage="usage.percentage"
                :color="getProgressColor(usage.percentage)"
                :show-text="false"
                :stroke-width="8"
              />
              <div class="usage-percentage">{{ usage.percentage }}%</div>
            </div>
          </div>
        </div>

        <!-- 警告信息 -->
        <div v-if="usageAlerts.length > 0" class="usage-alerts">
          <el-alert
            v-for="alert in usageAlerts"
            :key="alert.metric"
            :type="alert.type"
            :title="alert.message"
            show-icon
            :closable="false"
          >
            <template #default>
              {{ getUsageLabel(alert.metric) }}: {{ alert.current }} / {{ alert.limit }}
            </template>
          </el-alert>
        </div>
      </el-card>
    </div>

    <!-- 无订阅时的提示 -->
    <div v-else class="no-subscription">
      <el-empty description="您还没有订阅计划">
        <template #image>
          <el-icon size="100"><Document /></el-icon>
        </template>
        <el-button type="primary" @click="showPlansDialog = true">
          选择订阅计划
        </el-button>
      </el-empty>
    </div>

    <!-- 功能选项卡 -->
    <el-tabs v-model="activeTab" class="subscription-tabs">
      <!-- 套餐对比 -->
      <el-tab-pane label="套餐对比" name="plans">
        <SubscriptionPlans
          :current-plan="currentSubscription?.plan"
          @select="handlePlanSelect"
        />
      </el-tab-pane>

      <!-- 使用记录 -->
      <el-tab-pane label="使用记录" name="usage">
        <UsageRecords />
      </el-tab-pane>

      <!-- 账单管理 -->
      <el-tab-pane label="账单管理" name="billing">
        <BillingManagement />
      </el-tab-pane>

      <!-- 支付方式 -->
      <el-tab-pane label="支付方式" name="payment">
        <PaymentMethods @updated="loadPaymentMethods" />
      </el-tab-pane>
    </el-tabs>

    <!-- 升级套餐对话框 -->
    <el-dialog
      v-model="showUpgradeDialog"
      title="升级套餐"
      width="80%"
      :destroy-on-close="true"
    >
      <SubscriptionPlans
        :current-plan="currentSubscription?.plan"
        :mode="'upgrade'"
        @select="handlePlanUpgrade"
      />
    </el-dialog>

    <!-- 选择套餐对话框 -->
    <el-dialog
      v-model="showPlansDialog"
      title="选择订阅计划"
      width="80%"
      :destroy-on-close="true"
    >
      <SubscriptionPlans
        :mode="'select'"
        @select="handlePlanSelect"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import { subscriptionAPI } from '@/api/subscription'
import type {
  UserSubscription,
  SubscriptionPlan,
  SubscriptionStatus,
  BillingCycle,
  UsageAlert
} from '@/api/subscription'
import SubscriptionPlans from '@/components/Subscription/SubscriptionPlans.vue'
import UsageRecords from '@/components/Subscription/UsageRecords.vue'
import BillingManagement from '@/components/Subscription/BillingManagement.vue'
import PaymentMethods from '@/components/Subscription/PaymentMethods.vue'

// 响应式数据
const activeTab = ref('plans')
const currentSubscription = ref<UserSubscription | null>(null)
const currentUsage = ref<any>({})
const usageAlerts = ref<UsageAlert[]>([])
const showUpgradeDialog = ref(false)
const showPlansDialog = ref(false)
const loading = ref(false)

// 计算属性
const subscriptionStatus = computed(() => {
  if (!currentSubscription.value) return 'none'
  return currentSubscription.value.status
})

// 生命周期
onMounted(() => {
  loadSubscriptionData()
})

// 方法
const loadSubscriptionData = async () => {
  try {
    loading.value = true

    // 并行加载订阅信息和使用情况
    const [subscriptionRes, usageRes] = await Promise.all([
      subscriptionAPI.getCurrentSubscription(),
      subscriptionAPI.getCurrentUsage()
    ])

    if (subscriptionRes.success && subscriptionRes.data) {
      currentSubscription.value = subscriptionRes.data
    }

    if (usageRes.success && usageRes.data) {
      currentUsage.value = usageRes.data.usage
      usageAlerts.value = usageRes.data.alerts || []
    }
  } catch (error) {
    console.error('Load subscription data failed:', error)
    ElMessage.error('加载订阅信息失败')
  } finally {
    loading.value = false
  }
}

const getStatusType = (status: SubscriptionStatus) => {
  const types = {
    active: 'success',
    trial: 'warning',
    past_due: 'danger',
    cancelled: 'info',
    paused: 'warning'
  }
  return types[status] || 'info'
}

const getStatusText = (status: SubscriptionStatus) => {
  const texts = {
    active: '正常',
    trial: '试用中',
    past_due: '逾期',
    cancelled: '已取消',
    paused: '已暂停'
  }
  return texts[status] || status
}

const getBillingCycleText = (cycle: BillingCycle) => {
  const texts = {
    monthly: '月付',
    quarterly: '季付',
    yearly: '年付'
  }
  return texts[cycle] || cycle
}

const getUsageLabel = (key: string) => {
  const labels = {
    orders: '订单数量',
    users: '用户数量',
    products: '商品数量',
    storage: '存储空间(GB)',
    apiCalls: 'API调用次数'
  }
  return labels[key] || key
}

const getProgressColor = (percentage: number) => {
  if (percentage >= 90) return '#f56c6c'
  if (percentage >= 75) return '#e6a23c'
  return '#67c23a'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handlePlanSelect = async (plan: SubscriptionPlan) => {
  try {
    const result = await ElMessageBox.confirm(
      `确定要订阅 ${plan.name} 计划吗？`,
      '确认订阅',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    if (result) {
      const response = await subscriptionAPI.createSubscription({
        planId: plan.id,
        billingCycle: 'monthly'
      })

      if (response.success) {
        ElMessage.success('订阅创建成功')
        showPlansDialog.value = false
        await loadSubscriptionData()

        // 如果需要支付确认
        if (response.data?.clientSecret) {
          // 这里可以集成支付确认流程
          ElMessage.info('请完成支付确认')
        }
      } else {
        ElMessage.error(response.message || '创建订阅失败')
      }
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Create subscription failed:', error)
      ElMessage.error('创建订阅失败')
    }
  }
}

const handlePlanUpgrade = async (plan: SubscriptionPlan) => {
  if (!currentSubscription.value) return

  try {
    const result = await ElMessageBox.confirm(
      `确定要将套餐升级到 ${plan.name} 吗？变更将在下个计费周期生效。`,
      '确认升级',
      {
        confirmButtonText: '确定升级',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (result) {
      const response = await subscriptionAPI.updateSubscription({
        planId: plan.id
      })

      if (response.success) {
        ElMessage.success('套餐升级成功')
        showUpgradeDialog.value = false
        await loadSubscriptionData()
      } else {
        ElMessage.error(response.message || '升级失败')
      }
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Update subscription failed:', error)
      ElMessage.error('升级失败')
    }
  }
}

const loadPaymentMethods = async () => {
  // 支付方式更新后可能需要重新加载订阅信息
  await loadSubscriptionData()
}
</script>

<style lang="scss" scoped>
.subscription-management {
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

  .subscription-status {
    margin-bottom: 24px;

    .el-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .status-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;

      .plan-info {
        h2 {
          margin: 0 0 12px 0;
          font-size: 24px;
          font-weight: 600;
          color: #303133;
        }

        .el-tag {
          font-size: 14px;
          padding: 8px 16px;
        }
      }

      .billing-info {
        text-align: right;
        color: #606266;

        p {
          margin: 4px 0;
          font-size: 14px;

          strong {
            color: #303133;
          }
        }
      }
    }

    .usage-overview {
      margin-bottom: 24px;

      h3 {
        margin: 0 0 16px 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }

      .usage-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;

        .usage-item {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 16px;

          .usage-label {
            font-size: 14px;
            color: #606266;
            margin-bottom: 8px;
          }

          .usage-value {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 12px;
          }

          .usage-percentage {
            font-size: 12px;
            color: #909399;
            text-align: center;
            margin-top: 8px;
          }
        }
      }
    }

    .usage-alerts {
      .el-alert {
        margin-bottom: 8px;
      }
    }
  }

  .no-subscription {
    text-align: center;
    padding: 60px 0;

    .el-empty {
      padding: 40px 0;
    }
  }

  .subscription-tabs {
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
  .subscription-management {
    padding: 16px;

    .page-header {
      flex-direction: column;
      gap: 16px;
    }

    .status-header {
      flex-direction: column;
      gap: 16px;

      .billing-info {
        text-align: left;
      }
    }

    .usage-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>