<template>
  <div class="marketing-management">
    <div class="page-header">
      <h1>营销活动管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          创建活动
        </el-button>
        <el-button @click="showCouponDialog = true">
          <el-icon><Ticket /></el-icon>
          创建优惠券
        </el-button>
        <el-button @click="refreshActivities">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ marketingStats.totalActivities || 0 }}</div>
          <div class="stat-label">总活动数</div>
        </div>
        <el-icon class="stat-icon"><Promotion /></el-icon>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ marketingStats.activeActivities || 0 }}</div>
          <div class="stat-label">进行中活动</div>
        </div>
        <el-icon class="stat-icon"><Lightning /></el-icon>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ marketingStats.totalParticipants || 0 }}</div>
          <div class="stat-label">总参与人数</div>
        </div>
        <el-icon class="stat-icon"><Users /></el-icon>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ (marketingStats.averageConversionRate || 0).toFixed(1) }}%</div>
          <div class="stat-label">平均转化率</div>
        </div>
        <el-icon class="stat-icon"><TrendCharts /></el-icon>
      </el-card>
    </div>

    <!-- 筛选和搜索 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="搜索">
          <el-input
            v-model="filterForm.search"
            placeholder="搜索活动名称"
            @input="handleSearch"
            clearable
          >
            <template #suffix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="活动类型">
          <el-select v-model="filterForm.type" placeholder="选择类型" clearable>
            <el-option label="优惠券" value="coupon" />
            <el-option label="折扣活动" value="discount" />
            <el-option label="积分兑换" value="points_exchange" />
            <el-option label="限时抢购" value="flash_sale" />
            <el-option label="拼团" value="group_buy" />
            <el-option label="抽奖" value="lucky_draw" />
            <el-option label="推荐奖励" value="recommend_reward" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="选择状态" clearable>
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
            <el-option label="进行中" value="active" />
            <el-option label="已暂停" value="paused" />
            <el-option label="已过期" value="expired" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadActivities">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 标签页切换 -->
    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="营销活动" name="activities">
          <!-- 活动列表 -->
          <el-table
            v-loading="loading"
            :data="activities"
            style="width: 100%"
            row-key="id"
            stripe
          >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="活动名称" min-width="200" />
            <el-table-column prop="type" label="类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getTypeTagType(row.type)">
                  {{ getTypeText(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="参与情况" width="150">
              <template #default="{ row }">
                <div class="participant-info">
                  <div>{{ row.currentParticipants || 0 }}/{{ row.maxParticipants || '无限制' }}</div>
                  <el-progress
                    v-if="row.maxParticipants"
                    :percentage="(row.currentParticipants / row.maxParticipants) * 100"
                    :stroke-width="6"
                    :show-text="false"
                  />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="活动时间" width="200">
              <template #default="{ row }">
                <div>{{ formatDateTime(row.startTime) }}</div>
                <div class="text-muted">{{ formatDateTime(row.endTime) }}</div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button-group>
                  <el-button size="small" @click="handleViewDetail(row)">
                    <el-icon><View /></el-icon>
                    详情
                  </el-button>
                  <el-dropdown @command="handleMoreAction" trigger="click">
                    <el-button size="small">
                      更多
                      <el-icon><ArrowDown /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item
                          :command="{ action: 'edit', activity: row }"
                          :disabled="row.status === 'active'"
                        >
                          编辑
                        </el-dropdown-item>
                        <el-dropdown-item
                          :command="{ action: 'publish', activity: row }"
                          :disabled="row.status !== 'draft' && row.status !== 'paused'"
                        >
                          发布
                        </el-dropdown-item>
                        <el-dropdown-item
                          :command="{ action: 'pause', activity: row }"
                          :disabled="row.status !== 'active'"
                        >
                          暂停
                        </el-dropdown-item>
                        <el-dropdown-item
                          :command="{ action: 'duplicate', activity: row }"
                        >
                          复制
                        </el-dropdown-item>
                        <el-dropdown-item
                          :command="{ action: 'notify', activity: row }"
                          :disabled="row.status !== 'active'"
                        >
                          发送通知
                        </el-dropdown-item>
                        <el-dropdown-item
                          :command="{ action: 'delete', activity: row }"
                          divided
                          :disabled="row.status === 'active'"
                        >
                          删除
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="优惠券管理" name="coupons">
          <!-- 优惠券列表 -->
          <el-table
            v-loading="loading"
            :data="coupons"
            style="width: 100%"
            row-key="id"
            stripe
          >
            <el-table-column prop="code" label="优惠券码" width="150" />
            <el-table-column prop="name" label="名称" min-width="200" />
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getCouponTypeTagType(row.type)">
                  {{ getCouponTypeText(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="value" label="面值" width="100">
              <template #default="{ row }">
                {{ formatCouponValue(row) }}
              </template>
            </el-table-column>
            <el-table-column prop="usageCount" label="使用情况" width="120">
              <template #default="{ row }">
                <div>{{ row.usageCount }}/{{ row.usageLimit || '无限制' }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="validUntil" label="有效期至" width="120">
              <template #default="{ row }">
                {{ formatDateTime(row.validUntil) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'active' ? 'success' : row.status === 'expired' ? 'danger' : 'info'">
                  {{ row.status === 'active' ? '有效' : row.status === 'expired' ? '已过期' : '已使用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button
                  size="small"
                  type="danger"
                  @click="handleDeleteCoupon(row)"
                  :disabled="row.status === 'used'"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 创建/编辑营销活动对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingActivity ? '编辑营销活动' : '创建营销活动'"
      width="800px"
      @closed="resetActivityForm"
    >
      <el-form
        ref="activityFormRef"
        :model="activityFormData"
        :rules="activityFormRules"
        label-width="120px"
      >
        <el-form-item label="活动名称" prop="name">
          <el-input v-model="activityFormData.name" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="活动描述">
          <el-input
            v-model="activityFormData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入活动描述"
          />
        </el-form-item>
        <el-form-item label="活动类型" prop="type">
          <el-select v-model="activityFormData.type" placeholder="选择活动类型">
            <el-option label="优惠券" value="coupon" />
            <el-option label="折扣活动" value="discount" />
            <el-option label="积分兑换" value="points_exchange" />
            <el-option label="限时抢购" value="flash_sale" />
            <el-option label="拼团" value="group_buy" />
            <el-option label="抽奖" value="lucky_draw" />
            <el-option label="推荐奖励" value="recommend_reward" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动时间" prop="timeRange">
          <el-date-picker
            v-model="activityFormData.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
          />
        </el-form-item>
        <el-form-item label="活动横幅">
          <el-input v-model="activityFormData.banner" placeholder="请输入横幅图片URL" />
        </el-form-item>
        <el-form-item label="最大参与人数">
          <el-input-number
            v-model="activityFormData.maxParticipants"
            :min="1"
            placeholder="不填则无限制"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="目标人群" prop="targetAudience">
          <el-checkbox-group v-model="activityFormData.targetAudience">
            <el-checkbox label="all">全部用户</el-checkbox>
            <el-checkbox label="bronze">青铜会员</el-checkbox>
            <el-checkbox label="silver">白银会员</el-checkbox>
            <el-checkbox label="gold">黄金会员</el-checkbox>
            <el-checkbox label="platinum">铂金会员</el-checkbox>
            <el-checkbox label="diamond">钻石会员</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <!-- 条件设置 -->
        <div class="form-section">
          <h3>参与条件</h3>
          <el-form-item label="最低订单金额">
            <el-input-number
              v-model="activityFormData.conditions.minOrderAmount"
              :min="0"
              :precision="2"
              placeholder="0.00"
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="最高订单金额">
            <el-input-number
              v-model="activityFormData.conditions.maxOrderAmount"
              :min="0"
              :precision="2"
              placeholder="0.00"
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="最低积分要求">
            <el-input-number
              v-model="activityFormData.conditions.minPoints"
              :min="0"
              placeholder="0"
              style="width: 200px"
            />
          </el-form-item>
        </div>

        <!-- 奖励设置 -->
        <div class="form-section">
          <h3>奖励设置</h3>
          <el-form-item label="折扣金额">
            <el-input-number
              v-model="activityFormData.rewards.discountAmount"
              :min="0"
              :precision="2"
              placeholder="0.00"
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="折扣百分比">
            <el-input-number
              v-model="activityFormData.rewards.discountPercentage"
              :min="0"
              :max="100"
              :precision="1"
              placeholder="0.0"
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="奖励积分">
            <el-input-number
              v-model="activityFormData.rewards.pointsAwarded"
              :min="0"
              placeholder="0"
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="赠品">
            <el-input v-model="activityFormData.rewards.freeItem" placeholder="请输入赠品名称" />
          </el-form-item>
        </div>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleActivitySubmit" :loading="submitting">
          {{ editingActivity ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 创建优惠券对话框 -->
    <el-dialog
      v-model="showCouponDialog"
      title="创建优惠券"
      width="600px"
      @closed="resetCouponForm"
    >
      <el-form
        ref="couponFormRef"
        :model="couponFormData"
        :rules="couponFormRules"
        label-width="120px"
      >
        <el-form-item label="优惠券名称" prop="name">
          <el-input v-model="couponFormData.name" placeholder="请输入优惠券名称" />
        </el-form-item>
        <el-form-item label="优惠券描述">
          <el-input
            v-model="couponFormData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入优惠券描述"
          />
        </el-form-item>
        <el-form-item label="优惠券类型" prop="type">
          <el-select v-model="couponFormData.type" placeholder="选择优惠券类型">
            <el-option label="固定金额" value="fixed_amount" />
            <el-option label="百分比折扣" value="percentage" />
            <el-option label="免运费" value="free_shipping" />
            <el-option label="赠品" value="gift" />
          </el-select>
        </el-form-item>
        <el-form-item label="面值" prop="value">
          <el-input-number
            v-model="couponFormData.value"
            :min="0"
            :precision="couponFormData.type === 'percentage' ? 1 : 2"
            placeholder="请输入面值"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="最低订单金额">
          <el-input-number
            v-model="couponFormData.minOrderAmount"
            :min="0"
            :precision="2"
            placeholder="0.00"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="最大折扣金额" v-if="couponFormData.type === 'percentage'">
          <el-input-number
            v-model="couponFormData.maxDiscountAmount"
            :min="0"
            :precision="2"
            placeholder="0.00"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="使用限制">
          <el-input-number
            v-model="couponFormData.usageLimit"
            :min="1"
            placeholder="不填则无限制"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="用户限制">
          <el-input-number
            v-model="couponFormData.userLimit"
            :min="1"
            placeholder="不填则无限制"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="有效天数" prop="validDays">
          <el-input-number
            v-model="couponFormData.validDays"
            :min="1"
            placeholder="30"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="批量生成数量">
          <el-input-number
            v-model="couponFormData.quantity"
            :min="1"
            :max="1000"
            placeholder="1"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="目标人群">
          <el-checkbox-group v-model="couponFormData.targetAudience">
            <el-checkbox label="all">全部用户</el-checkbox>
            <el-checkbox label="bronze">青铜会员</el-checkbox>
            <el-checkbox label="silver">白银会员</el-checkbox>
            <el-checkbox label="gold">黄金会员</el-checkbox>
            <el-checkbox label="platinum">铂金会员</el-checkbox>
            <el-checkbox label="diamond">钻石会员</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCouponDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCouponSubmit" :loading="submitting">
          创建
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Refresh,
  Search,
  View,
  ArrowDown,
  Ticket
} from '@element-plus/icons-vue'
import {
  Promotion,
  Lightning,
  UserFilled,
  TrendCharts
} from '@element-plus/icons-vue'
import {
    getMarketingActivities,
    createMarketingActivity,
  updateMarketingActivity,
  deleteMarketingActivity,
  publishMarketingActivity,
  pauseMarketingActivity,
  getCoupons,
  createCoupon,
  deleteCoupon,
  getMarketingStats,
  sendMarketingNotification,
  duplicateMarketingActivity
} from '../api/marketing'
import type {
  MarketingActivity,
  MarketingActivityType,
  MarketingActivityStatus,
  CreateMarketingActivityRequest,
  UpdateMarketingRequest,
  Coupon,
  CreateCouponRequest,
  MarketingQueryParams,
  MarketingStats
} from '../api/marketing'

// 响应式数据
const loading = ref(false)
const activeTab = ref('activities')
const showCreateDialog = ref(false)
const showCouponDialog = ref(false)
const submitting = ref(false)
const editingActivity = ref<MarketingActivity | null>(null)
const activityFormRef = ref()
const couponFormRef = ref()

// 筛选表单
const filterForm = reactive({
  search: '',
  type: '' as MarketingActivityType | '',
  status: '' as MarketingActivityStatus | '',
  dateRange: [] as string[]
})

// 营销活动表单数据
const activityFormData = reactive({
  name: '',
  description: '',
  type: 'coupon' as MarketingActivityType,
  timeRange: [] as string[],
  banner: '',
  maxParticipants: undefined as number | undefined,
  targetAudience: [] as string[],
  conditions: {
    minOrderAmount: 0,
    maxOrderAmount: 0,
    minPoints: 0
  },
  rewards: {
    discountAmount: 0,
    discountPercentage: 0,
    pointsAwarded: 0,
    freeItem: ''
  }
})

// 优惠券表单数据
const couponFormData = reactive({
  name: '',
  description: '',
  type: 'fixed_amount' as 'fixed_amount' | 'percentage' | 'free_shipping' | 'gift',
  value: 0,
  minOrderAmount: 0,
  maxDiscountAmount: 0,
  usageLimit: undefined as number | undefined,
  userLimit: undefined as number | undefined,
  validDays: 30,
  quantity: 1,
  targetAudience: [] as string[]
})

// 活动和优惠券数据
const activities = ref<MarketingActivity[]>([])
const coupons = ref<Coupon[]>([])

// 分页数据
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
})

// 营销统计数据
const marketingStats = ref<MarketingStats>({
  totalActivities: 0,
  activeActivities: 0,
  totalParticipants: 0,
  totalSavings: 0,
  totalRevenue: 0,
  averageConversionRate: 0,
  activitiesByType: {
    coupon: 0,
    discount: 0,
    points_exchange: 0,
    flash_sale: 0,
    group_buy: 0,
    lucky_draw: 0,
    recommend_reward: 0
  },
  topPerformingActivities: []
})

// 表单验证规则
const activityFormRules = {
  name: [
    { required: true, message: '请输入活动名称', trigger: 'blur' },
    { min: 2, max: 50, message: '活动名称长度在2到50个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择活动类型', trigger: 'change' }
  ],
  timeRange: [
    { required: true, message: '请选择活动时间', trigger: 'change' }
  ],
  targetAudience: [
    { type: 'array', required: true, message: '请选择目标人群', trigger: 'change' }
  ]
}

const couponFormRules = {
  name: [
    { required: true, message: '请输入优惠券名称', trigger: 'blur' },
    { min: 2, max: 50, message: '优惠券名称长度在2到50个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择优惠券类型', trigger: 'change' }
  ],
  value: [
    { required: true, message: '请输入面值', trigger: 'blur' },
    { validator: (rule: any, value: number, callback: Function) => {
      if (couponFormData.type === 'percentage' && (value < 0 || value > 100)) {
        callback(new Error('百分比折扣必须在0-100之间'))
      } else if (value < 0) {
        callback(new Error('面值不能为负数'))
      } else {
        callback()
      }
    },
    trigger: 'blur'
  }],
  validDays: [
    { required: true, message: '请输入有效天数', trigger: 'blur' }
  ],
  targetAudience: [
    { type: 'array', required: true, message: '请选择目标人群', trigger: 'change' }
  ]
}

// 加载营销活动数据
const loadActivities = async () => {
  try {
    loading.value = true

    const currentTab = activeTab.value
    if (currentTab === 'coupons') {
      await loadCoupons()
      return
    }

    const params: MarketingQueryParams = {
      page: pagination.page,
      limit: pagination.limit,
      search: filterForm.search || undefined,
      type: filterForm.type || undefined,
      status: filterForm.status || undefined,
      startDate: filterForm.dateRange?.[0],
      endDate: filterForm.dateRange?.[1],
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }

    const response = await getMarketingActivities(params)

    if (response.success) {
      activities.value = response.data.items
      pagination.total = response.data.pagination.total
      pagination.totalPages = response.data.pagination.totalPages
    } else {
      ElMessage.error(response.message || '获取营销活动失败')
    }
  } catch (error) {
    console.error('Load marketing activities failed:', error)
    ElMessage.error('获取营销活动失败')
  } finally {
    loading.value = false
  }
}

// 加载优惠券数据
const loadCoupons = async () => {
  try {
    const params: MarketingQueryParams = {
      page: pagination.page,
      limit: pagination.limit,
      search: filterForm.search || undefined
    }

    const response = await getCoupons(params)

    if (response.success) {
      coupons.value = response.data.items
      pagination.total = response.data.pagination.total
      pagination.totalPages = response.data.pagination.totalPages
    } else {
      ElMessage.error(response.message || '获取优惠券失败')
    }
  } catch (error) {
    console.error('Load coupons failed:', error)
    ElMessage.error('获取优惠券失败')
  }
}

// 加载营销统计数据
const loadMarketingStats = async () => {
  try {
    const response = await getMarketingStats()
    if (response.success && response.data) {
      marketingStats.value = response.data
    }
  } catch (error) {
    console.error('Load marketing stats failed:', error)
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.page = 1
  loadActivities()
}

// 重置筛选
const resetFilter = () => {
  filterForm.search = ''
  filterForm.type = ''
  filterForm.status = ''
  filterForm.dateRange = []
  pagination.page = 1
  loadActivities()
}

// 刷新数据
const refreshActivities = () => {
  loadActivities()
  loadMarketingStats()
  ElMessage.success('营销数据已刷新')
}

// 查看活动详情
const handleViewDetail = (activity: MarketingActivity) => {
  // TODO: 实现活动详情页面
  ElMessage.info(`查看活动详情: ${activity.name}`)
}

// 更多操作处理
const handleMoreAction = async (command: any) => {
  const { action, activity } = command

  switch (action) {
    case 'edit':
      editingActivity.value = { ...activity }
      Object.assign(activityFormData, {
        name: activity.name,
        description: activity.description || '',
        type: activity.type,
        timeRange: [activity.startTime, activity.endTime],
        banner: activity.banner || '',
        maxParticipants: activity.maxParticipants,
        targetAudience: activity.targetAudience,
        conditions: activity.conditions,
        rewards: activity.rewards
      })
      showCreateDialog.value = true
      break
    case 'publish':
      await handlePublishActivity(activity)
      break
    case 'pause':
      await handlePauseActivity(activity)
      break
    case 'duplicate':
      await handleDuplicateActivity(activity)
      break
    case 'notify':
      await handleSendNotification(activity)
      break
    case 'delete':
      await handleDeleteActivity(activity)
      break
  }
}

// 发布活动
const handlePublishActivity = async (activity: MarketingActivity) => {
  try {
    const response = await publishMarketingActivity(activity.id)
    if (response.success) {
      ElMessage.success('活动发布成功')
      loadActivities()
    } else {
      ElMessage.error(response.message || '发布失败')
    }
  } catch (error) {
    console.error('Publish activity failed:', error)
    ElMessage.error('发布失败')
  }
}

// 暂停活动
const handlePauseActivity = async (activity: MarketingActivity) => {
  try {
    const response = await pauseMarketingActivity(activity.id)
    if (response.success) {
      ElMessage.success('活动暂停成功')
      loadActivities()
    } else {
      ElMessage.error(response.message || '暂停失败')
    }
  } catch (error) {
    console.error('Pause activity failed:', error)
    ElMessage.error('暂停失败')
  }
}

// 复制活动
const handleDuplicateActivity = async (activity: MarketingActivity) => {
  try {
    const { value: newName } = await ElMessageBox.prompt(
      '请输入新活动名称',
      '复制活动',
      {
        confirmButtonText: '复制',
        cancelButtonText: '取消',
        inputValue: `${activity.name} - 副本`
      }
    )

    if (newName) {
      const response = await duplicateMarketingActivity(activity.id, newName)
      if (response.success) {
        ElMessage.success('活动复制成功')
        loadActivities()
      } else {
        ElMessage.error(response.message || '复制失败')
      }
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Duplicate activity failed:', error)
    }
  }
}

// 发送营销通知
const handleSendNotification = async (activity: MarketingActivity) => {
  try {
    const { value: channels } = await ElMessageBox.prompt(
      '请选择通知渠道（用逗号分隔）',
      '发送营销通知',
      {
        confirmButtonText: '发送',
        cancelButtonText: '取消',
        inputValue: 'email,sms,system'
      }
    )

    if (channels) {
      const channelList = channels.split(',').map(c => c.trim()).filter(c => ['email', 'sms', 'system'].includes(c))
      const response = await sendMarketingNotification(activity.id, channelList)
      if (response.success) {
        ElMessage.success(`通知已发送给${response.sent}位用户`)
      } else {
        ElMessage.error(response.message || '发送失败')
      }
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Send notification failed:', error)
    }
  }
}

// 删除活动
const handleDeleteActivity = async (activity: MarketingActivity) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除活动"${activity.name}"吗？此操作不可恢复。`,
      '确认删除',
      {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      }
    )

    const response = await deleteMarketingActivity(activity.id)
    if (response.success) {
      ElMessage.success('活动删除成功')
      loadActivities()
      loadMarketingStats()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Delete activity failed:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 删除优惠券
const handleDeleteCoupon = async (coupon: Coupon) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除优惠券"${coupon.name}"吗？`,
      '确认删除',
      {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      }
    )

    const response = await deleteCoupon(coupon.id)
    if (response.success) {
      ElMessage.success('优惠券删除成功')
      loadCoupons()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Delete coupon failed:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 提交活动表单
const handleActivitySubmit = async () => {
  if (!activityFormRef.value) return

  try {
    await activityFormRef.value.validate()
    submitting.value = true

    const activityData: CreateMarketingActivityRequest = {
      name: activityFormData.name,
      description: activityFormData.description,
      type: activityFormData.type,
      startTime: activityFormData.timeRange[0],
      endTime: activityFormData.timeRange[1],
      banner: activityFormData.banner,
      maxParticipants: activityFormData.maxParticipants,
      targetAudience: activityFormData.targetAudience,
      conditions: activityFormData.conditions,
      rewards: activityFormData.rewards
    }

    if (editingActivity.value) {
      // 更新活动
      const updateData: UpdateMarketingRequest = { ...activityData }
      const response = await updateMarketingActivity(editingActivity.value.id, updateData)
      if (response.success) {
        ElMessage.success('活动更新成功')
        showCreateDialog.value = false
        loadActivities()
      } else {
        ElMessage.error(response.message || '更新失败')
      }
    } else {
      // 创建活动
      const response = await createMarketingActivity(activityData)
      if (response.success) {
        ElMessage.success('活动创建成功')
        showCreateDialog.value = false
        loadActivities()
        loadMarketingStats()
      } else {
        ElMessage.error(response.message || '创建失败')
      }
    }
  } catch (error) {
    console.error('Submit activity failed:', error)
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

// 提交优惠券表单
const handleCouponSubmit = async () => {
  if (!couponFormRef.value) return

  try {
    await couponFormRef.value.validate()
    submitting.value = true

    const couponData: CreateCouponRequest = {
      name: couponFormData.name,
      description: couponFormData.description,
      type: couponFormData.type,
      value: couponFormData.value,
      minOrderAmount: couponFormData.minOrderAmount,
      maxDiscountAmount: couponFormData.maxDiscountAmount,
      usageLimit: couponFormData.usageLimit,
      userLimit: couponFormData.userLimit,
      validDays: couponFormData.validDays,
      targetAudience: couponFormData.targetAudience,
      quantity: couponFormData.quantity
    }

    const response = await createCoupon(couponData)
    if (response.success) {
      ElMessage.success(`成功创建${couponData.quantity}张优惠券`)
      showCouponDialog.value = false
      if (activeTab.value === 'coupons') {
        loadCoupons()
      }
    } else {
      ElMessage.error(response.message || '创建失败')
    }
  } catch (error) {
    console.error('Submit coupon failed:', error)
    ElMessage.error('创建失败')
  } finally {
    submitting.value = false
  }
}

// 重置活动表单
const resetActivityForm = () => {
  editingActivity.value = null
  Object.assign(activityFormData, {
    name: '',
    description: '',
    type: 'coupon',
    timeRange: [],
    banner: '',
    maxParticipants: undefined,
    targetAudience: [],
    conditions: {
      minOrderAmount: 0,
      maxOrderAmount: 0,
      minPoints: 0
    },
    rewards: {
      discountAmount: 0,
      discountPercentage: 0,
      pointsAwarded: 0,
      freeItem: ''
    }
  })
  activityFormRef.value?.resetFields()
}

// 重置优惠券表单
const resetCouponForm = () => {
  Object.assign(couponFormData, {
    name: '',
    description: '',
    type: 'fixed_amount',
    value: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    usageLimit: undefined,
    userLimit: undefined,
    validDays: 30,
    quantity: 1,
    targetAudience: []
  })
  couponFormRef.value?.resetFields()
}

// 分页处理
const handleSizeChange = (val: number) => {
  pagination.limit = val
  pagination.page = 1
  loadActivities()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  loadActivities()
}

// 获取活动类型标签类型
const getTypeTagType = (type: MarketingActivityType) => {
  const typeMap: Record<MarketingActivityType, string> = {
    coupon: 'primary',
    discount: 'success',
    points_exchange: 'warning',
    flash_sale: 'danger',
    group_buy: 'info',
    lucky_draw: 'warning',
    recommend_reward: 'success'
  }
  return typeMap[type] || ''
}

// 获取活动类型文本
const getTypeText = (type: MarketingActivityType) => {
  const textMap: Record<MarketingActivityType, string> = {
    coupon: '优惠券',
    discount: '折扣活动',
    points_exchange: '积分兑换',
    flash_sale: '限时抢购',
    group_buy: '拼团',
    lucky_draw: '抽奖',
    recommend_reward: '推荐奖励'
  }
  return textMap[type] || type
}

// 获取状态标签类型
const getStatusTagType = (status: MarketingActivityStatus) => {
  const statusMap: Record<MarketingActivityStatus, string> = {
    draft: 'info',
    published: 'success',
    active: 'warning',
    paused: 'danger',
    expired: '',
    cancelled: 'danger'
  }
  return statusMap[status] || ''
}

// 获取状态文本
const getStatusText = (status: MarketingActivityStatus) => {
  const textMap: Record<MarketingActivityStatus, string> = {
    draft: '草稿',
    published: '已发布',
    active: '进行中',
    paused: '已暂停',
    expired: '已过期',
    cancelled: '已取消'
  }
  return textMap[status] || status
}

// 获取优惠券类型标签类型
const getCouponTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    fixed_amount: 'primary',
    percentage: 'success',
    free_shipping: 'info',
    gift: 'warning'
  }
  return typeMap[type] || ''
}

// 获取优惠券类型文本
const getCouponTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    fixed_amount: '固定金额',
    percentage: '百分比折扣',
    free_shipping: '免运费',
    gift: '赠品'
  }
  return textMap[type] || type
}

// 格式化优惠券面值
const formatCouponValue = (coupon: Coupon) => {
  if (coupon.type === 'percentage') {
    return `${coupon.value}%`
  } else if (coupon.type === 'fixed_amount') {
      return `¥${coupon.value.toFixed(2)}`
  } else {
    return coupon.value.toString()
  }
}

// 格式化日期时间
const formatDateTime = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadActivities()
  loadMarketingStats()
})
</script>

<style lang="scss" scoped>
.marketing-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h1 {
    margin: 0;
    font-size: 24px;
    color: #333;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;

  .stat-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;

    .stat-content {
      .stat-number {
        font-size: 28px;
        font-weight: bold;
        color: #333;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 14px;
        color: #666;
      }
    }

    .stat-icon {
      font-size: 32px;
      color: #409eff;
      opacity: 0.8;
    }
  }
}

.filter-card {
  margin-bottom: 20px;

  .filter-form {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;

    .el-form-item {
      margin-bottom: 16px;
      min-width: 200px;

      @media (max-width: 768px) {
        min-width: 100%;
        margin-bottom: 12px;
      }
    }
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;

  @media (max-width: 768px) {
    .el-pagination {
      justify-content: center;

      .el-pagination__sizes,
      .el-pagination__jump {
        display: none;
      }
    }
  }
}

.form-section {
  margin: 24px 0;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background-color: #fafafa;

  h3 {
    margin-bottom: 16px;
    font-size: 16px;
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
  }
}

.participant-info {
  .text-muted {
    font-size: 12px;
    color: #999;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .marketing-management {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;

    .header-actions {
      justify-content: center;
      flex-wrap: wrap;
    }
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .filter-form {
    .el-form-item {
      min-width: 100%;
    }
  }
}
</style>