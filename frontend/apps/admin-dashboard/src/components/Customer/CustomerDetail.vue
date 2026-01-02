<template>
  <div class="customer-detail">
    <div class="customer-header">
      <div class="customer-avatar">
        <el-avatar :size="80" :src="customer.avatar">
          {{ customer.name.charAt(0) }}
        </el-avatar>
        <el-tag
          v-if="customer.level"
          :type="getLevelTagType(customer.level)"
          size="large"
          class="level-tag"
        >
          {{ getLevelLabel(customer.level) }}
        </el-tag>
      </div>
      <div class="customer-info">
        <h2>{{ customer.name }}</h2>
        <div class="contact-info">
          <div v-if="customer.phone" class="contact-item">
            <el-icon><Phone /></el-icon>
            {{ customer.phone }}
          </div>
          <div v-if="customer.email" class="contact-item">
            <el-icon><Message /></el-icon>
            {{ customer.email }}
          </div>
          <div v-if="customer.address" class="contact-item">
            <el-icon><Location /></el-icon>
            {{ customer.address }}
          </div>
        </div>
      </div>
      <div class="customer-actions">
        <el-button type="primary" @click="handleEdit">
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
        <el-button @click="handleSendMessage">
          <el-icon><ChatDotRound /></el-icon>
          发送消息
        </el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="detail-tabs">
      <!-- 基本信息 -->
      <el-tab-pane label="基本信息" name="basic">
        <div class="basic-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="客户ID">
              {{ customer.id }}
            </el-descriptions-item>
            <el-descriptions-item label="注册时间">
              {{ formatDateTime(customer.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="最后访问">
              {{ formatDateTime(customer.lastVisit) }}
            </el-descriptions-item>
            <el-descriptions-item label="客户状态">
              <el-tag :type="getStatusTagType(customer.status)">
                {{ getStatusLabel(customer.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="生日" v-if="customer.birthday">
              {{ formatDateTime(customer.birthday) }}
            </el-descriptions-item>
            <el-descriptions-item label="性别" v-if="customer.gender">
              {{ customer.gender === 'male' ? '男' : '女' }}
            </el-descriptions-item>
            <el-descriptions-item label="备注" v-if="customer.notes">
              {{ customer.notes }}
            </el-descriptions-item>
          </el-descriptions>

          <div v-if="customer.allergies" class="allergies-section">
            <h4>过敏信息</h4>
            <div class="allergies-list">
              <el-tag
                v-for="allergy in customer.allergies"
                :key="allergy"
                type="danger"
                size="small"
              >
                {{ allergy }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 消费统计 -->
      <el-tab-pane label="消费统计" name="statistics">
        <div class="statistics-section">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card>
                <template #header>
                  <span>消费概览</span>
                </template>
                <div class="stat-grid">
                  <div class="stat-item">
                    <div class="stat-value">{{ customer.totalOrders || 0 }}</div>
                    <div class="stat-label">总订单数</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">¥{{ (customer.totalSpent || 0).toFixed(2) }}</div>
                    <div class="stat-label">总消费额</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">¥{{ (customer.averageOrderValue || 0).toFixed(2) }}</div>
                    <div class="stat-label">平均客单价</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ customer.visits || 0 }}</div>
                    <div class="stat-label">访问次数</div>
                  </div>
                </div>
              </el-card>
            </el-col>

            <el-col :span="12">
              <el-card>
                <template #header>
                  <span>消费趋势</span>
                </template>
                <div class="trend-chart">
                  <CustomerTrendChart :customer-id="customer.id" />
                </div>
              </el-card>
            </el-col>
          </el-row>

          <el-card style="margin-top: 20px;">
            <template #header>
              <span>热销商品</span>
            </template>
            <div class="favorite-items">
              <el-table :data="customer.favoriteItems || []" stripe>
                <el-table-column label="商品名称" prop="name" />
                <el-table-column label="分类" prop="category" width="120" />
                <el-table-column label="购买次数" prop="purchaseCount" width="120" align="center" />
                <el-table-column label="总金额" width="120" align="right">
                  <template #default="{ row }">
                    ¥{{ (row.totalAmount || 0).toFixed(2) }}
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </div>
      </el-tab-pane>

      <!-- 偏好设置 -->
      <el-tab-pane label="偏好设置" name="preferences">
        <div class="preferences-section">
          <el-form :model="preferences" label-width="100px">
            <el-form-item label="口味偏好">
              <el-checkbox-group v-model="preferences.tastes">
                <el-checkbox label="清淡">清淡</el-checkbox>
                <el-checkbox label="微辣">微辣</el-checkbox>
                <el-checkbox label="中辣">中辣</el-checkbox>
                <el-checkbox label="重辣">重辣</el-checkbox>
                <el-checkbox label="无辣">无辣</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="菜品偏好">
              <el-checkbox-group v-model="preferences.dishes">
                <el-checkbox label="素食">素食</el-checkbox>
                <el-checkbox label="荤菜">荤菜</el-checkbox>
                <el-checkbox label="海鲜">海鲜</el-checkbox>
                <el-checkbox label="川菜">川菜</el-checkbox>
                <el-checkbox label="粤菜">粤菜</el-checkbox>
                <el-checkbox label="湘菜">湘菜</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="用餐场景">
              <el-checkbox-group v-model="preferences.scenarios">
                <el-checkbox label="商务宴请">商务宴请</el-checkbox>
                <el-checkbox label="家庭聚餐">家庭聚餐</el-checkbox>
                <el-checkbox label="朋友聚会">朋友聚会</el-checkbox>
                <el-checkbox label="情侣约会">情侣约会</el-checkbox>
                <el-checkbox label="单人用餐">单人用餐</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="禁忌事项">
              <el-input
                v-model="preferences.restrictions"
                type="textarea"
                :rows="3"
                placeholder="请输入饮食禁忌..."
              />
            </el-form-item>

            <el-form-item label="特殊要求">
              <el-input
                v-model="preferences.specialRequirements"
                type="textarea"
                :rows="3"
                placeholder="请输入特殊要求..."
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="savePreferences">
                保存偏好
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 会员管理 -->
      <el-tab-pane label="会员管理" name="loyalty">
        <div class="loyalty-section">
          <CustomerLoyalty
            :customer="customer"
            @updated="handleLoyaltyUpdated"
          />
        </div>
      </el-tab-pane>

      <!-- 消费历史 -->
      <el-tab-pane label="消费历史" name="history">
        <div class="history-section">
          <CustomerOrderHistory :customer-id="customer.id" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Phone,
  Message,
  Location,
  Edit,
  ChatDotRound
} from '@element-plus/icons-vue'
import type { Customer } from '@/api/customer'
import CustomerTrendChart from './CustomerTrendChart.vue'
import CustomerLoyalty from './CustomerLoyalty.vue'
import CustomerOrderHistory from './CustomerOrderHistory.vue'

interface Props {
  customer: Customer
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: []
}>()

// 响应式数据
const activeTab = ref('basic')

const preferences = reactive({
  tastes: [],
  dishes: [],
  scenarios: [],
  restrictions: '',
  specialRequirements: ''
})

// 方法
const handleEdit = () => {
  emit('updated')
}

const handleSendMessage = () => {
  ElMessage.info('消息发送功能开发中...')
}

const savePreferences = async () => {
  try {
    // 这里应该调用保存偏好的API
    ElMessage.success('偏好设置保存成功')
  } catch (error) {
    ElMessage.error('保存偏好设置失败')
  }
}

const handleLoyaltyUpdated = () => {
  emit('updated')
}

// 工具函数
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const getLevelTagType = (level: string) => {
  const typeMap = {
    vip: 'danger',
    member: 'warning',
    regular: 'info',
    new: 'success'
  }
  return typeMap[level as keyof typeof typeMap] || 'info'
}

const getLevelLabel = (level: string) => {
  const labelMap = {
    vip: 'VIP',
    member: '会员',
    regular: '普通',
    new: '新客户'
  }
  return labelMap[level as keyof typeof labelMap] || '未知'
}

const getStatusTagType = (status: string) => {
  const typeMap = {
    active: 'success',
    inactive: 'info',
    blacklisted: 'danger'
  }
  return typeMap[status as keyof typeof typeMap] || 'info'
}

const getStatusLabel = (status: string) => {
  const labelMap = {
    active: '活跃',
    inactive: '休眠',
    blacklisted: '黑名单'
  }
  return labelMap[status as keyof typeof labelMap] || '未知'
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.customer-detail {
  .customer-header {
    display: flex;
    align-items: flex-start;
    gap: $spacing-6;
    margin-bottom: $spacing-6;
    padding: $spacing-6;
    background: $white;
    border-radius: $border-radius-base;
    box-shadow: $shadow-sm;

    .customer-avatar {
      position: relative;

      .level-tag {
        position: absolute;
        bottom: 0;
        right: 0;
      }
    }

    .customer-info {
      flex: 1;

      h2 {
        margin: 0 0 $spacing-3 0;
        color: $text-primary;
      }

      .contact-info {
        display: flex;
        flex-wrap: wrap;
        gap: $spacing-4;

        .contact-item {
          display: flex;
          align-items: center;
          gap: $spacing-2;
          font-size: $font-size-sm;
          color: $text-secondary;
        }
      }
    }

    .customer-actions {
      display: flex;
      gap: $spacing-2;
    }
  }

  .detail-tabs {
    background: $white;
    border-radius: $border-radius-base;
    box-shadow: $shadow-sm;
    overflow: hidden;

    :deep(.el-tabs__header) {
      margin: 0;
      background: $gray-50;
    }

    :deep(.el-tabs__content) {
      padding: $spacing-6;
    }

    .basic-info {
      .allergies-section {
        margin-top: $spacing-6;

        h4 {
          margin-bottom: $spacing-3;
          color: $text-primary;
        }

        .allergies-list {
          display: flex;
          flex-wrap: wrap;
          gap: $spacing-2;
        }
      }
    }

    .statistics-section {
      .stat-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: $spacing-4;

        .stat-item {
          text-align: center;

          .stat-value {
            font-size: $font-size-large;
            font-weight: $font-weight-bold;
            color: $text-primary;
            margin-bottom: $spacing-1;
          }

          .stat-label {
            font-size: $font-size-sm;
            color: $text-secondary;
          }
        }
      }
    }

    .preferences-section {
      .el-form {
        max-width: 600px;
      }
    }

    .favorite-items {
      // Empty for now
    }
  }
}

// 深色主题支持
@media (prefers-color-scheme: dark) {
  .customer-detail {
    .customer-header,
    .detail-tabs {
      background: $dark-bg-secondary;
      border-color: $dark-border-primary;
    }

    .detail-tabs {
      :deep(.el-tabs__header) {
        background: $dark-bg-tertiary;
      }
    }
  }
}
</style>