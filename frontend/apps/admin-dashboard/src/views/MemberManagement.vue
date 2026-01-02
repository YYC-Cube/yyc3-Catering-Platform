<template>
  <div class="member-management">
    <div class="page-header">
      <h1>会员管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          添加会员
        </el-button>
        <el-button @click="showBatchImportDialog = true">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
        <el-button type="success" @click="refreshMembers">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ memberStats.totalMembers || 0 }}</div>
          <div class="stat-label">总会员数</div>
        </div>
        <el-icon class="stat-icon"><User /></el-icon>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ memberStats.activeMembers || 0 }}</div>
          <div class="stat-label">活跃会员</div>
        </div>
        <el-icon class="stat-icon"><UserFilled /></el-icon>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ memberStats.newMembersThisMonth || 0 }}</div>
          <div class="stat-label">本月新增</div>
        </div>
        <el-icon class="stat-icon"><TrendCharts /></el-icon>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ memberStats.averageSpent || 0 }}</div>
          <div class="stat-label">平均消费</div>
        </div>
        <el-icon class="stat-icon"><Money /></el-icon>
      </el-card>
    </div>

    <!-- 筛选和搜索 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="搜索">
          <el-input
            v-model="filterForm.search"
            placeholder="搜索会员姓名、手机号"
            @input="handleSearch"
            clearable
          >
            <template #suffix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="会员等级">
          <el-select v-model="filterForm.level" placeholder="选择等级" clearable>
            <el-option label="青铜会员" value="bronze" />
            <el-option label="白银会员" value="silver" />
            <el-option label="黄金会员" value="gold" />
            <el-option label="铂金会员" value="platinum" />
            <el-option label="钻石会员" value="diamond" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="选择状态" clearable>
            <el-option label="活跃" value="active" />
            <el-option label="非活跃" value="inactive" />
            <el-option label="暂停" value="suspended" />
            <el-option label="黑名单" value="blacklisted" />
          </el-select>
        </el-form-item>
        <el-form-item label="积分范围">
          <el-input-number
            v-model="filterForm.minPoints"
            :min="0"
            placeholder="最小积分"
            style="width: 120px"
          />
          <span style="margin: 0 8px;">-</span>
          <el-input-number
            v-model="filterForm.maxPoints"
            :min="0"
            placeholder="最大积分"
            style="width: 120px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadMembers">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 会员列表 -->
    <el-card class="member-list-card">
      <el-table
        v-loading="loading"
        :data="members"
        style="width: 100%"
        row-key="id"
        stripe
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="memberId" label="会员号" min-width="120" />
        <el-table-column label="会员信息" min-width="200">
          <template #default="{ row }">
            <div class="member-info">
              <el-avatar v-if="row.avatar" :src="row.avatar" :size="40" />
              <el-avatar v-else :size="40">{{ row.name.charAt(0) }}</el-avatar>
              <div class="member-details">
                <div class="name">{{ row.name }}</div>
                <div class="phone">{{ row.phone }}</div>
                <div v-if="row.email" class="email">{{ row.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="等级" width="120">
          <template #default="{ row }">
            <el-tag :type="getLevelTagType(row.level)">
              {{ getLevelText(row.level) }}
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
        <el-table-column prop="points" label="积分" width="100">
          <template #default="{ row }">
            <span class="points">{{ row.points.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalSpent" label="总消费" width="120">
          <template #default="{ row }">
            <span class="amount">¥{{ row.totalSpent.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderCount" label="订单数" width="100" />
        <el-table-column prop="registeredAt" label="注册时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.registeredAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="lastOrderAt" label="最近消费" width="160">
          <template #default="{ row }">
            {{ row.lastOrderAt ? formatDateTime(row.lastOrderAt) : '暂无' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button size="small" @click="handleViewDetail(row)">
                <el-icon><View /></el-icon>
                详情
              </el-button>
              <el-button size="small" @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-dropdown @command="handleMoreAction" trigger="click">
                <el-button size="small">
                  更多
                  <el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      :command="{ action: 'adjustPoints', member: row }"
                    >
                      调整积分
                    </el-dropdown-item>
                    <el-dropdown-item
                      :command="{ action: 'upgradeLevel', member: row }"
                    >
                      升级等级
                    </el-dropdown-item>
                    <el-dropdown-item
                      :command="{ action: 'sendNotification', member: row }"
                    >
                      发送通知
                    </el-dropdown-item>
                    <el-dropdown-item
                      :command="{ action: 'pointsHistory', member: row }"
                    >
                      积分记录
                    </el-dropdown-item>
                    <el-dropdown-item
                      :command="{ action: 'delete', member: row }"
                      divided
                      :disabled="row.status === 'blacklisted'"
                    >
                      删除会员
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

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

    <!-- 创建/编辑会员对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingMember ? '编辑会员' : '添加会员'"
      width="600px"
      @closed="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入会员姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱地址" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="formData.gender">
            <el-radio value="male">男</el-radio>
            <el-radio value="female">女</el-radio>
            <el-radio value="other">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="生日">
          <el-date-picker
            v-model="formData.birthday"
            type="date"
            placeholder="选择生日"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="头像">
          <el-input v-model="formData.avatar" placeholder="请输入头像URL" />
        </el-form-item>
        <el-form-item label="初始等级" v-if="!editingMember">
          <el-select v-model="formData.initialLevel" placeholder="选择会员等级">
            <el-option label="青铜会员" value="bronze" />
            <el-option label="白银会员" value="silver" />
            <el-option label="黄金会员" value="gold" />
            <el-option label="铂金会员" value="platinum" />
            <el-option label="钻石会员" value="diamond" />
          </el-select>
        </el-form-item>
        <el-form-item label="初始积分" v-if="!editingMember">
          <el-input-number
            v-model="formData.initialPoints"
            :min="0"
            placeholder="初始积分"
          />
        </el-form-item>
        <el-form-item label="状态" v-if="editingMember">
          <el-select v-model="formData.status" placeholder="选择状态">
            <el-option label="活跃" value="active" />
            <el-option label="非活跃" value="inactive" />
            <el-option label="暂停" value="suspended" />
            <el-option label="黑名单" value="blacklisted" />
          </el-select>
        </el-form-item>
        <el-form-item label="会员等级" v-if="editingMember">
          <el-select v-model="formData.level" placeholder="选择会员等级">
            <el-option label="青铜会员" value="bronze" />
            <el-option label="白银会员" value="silver" />
            <el-option label="黄金会员" value="gold" />
            <el-option label="铂金会员" value="platinum" />
            <el-option label="钻石会员" value="diamond" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ editingMember ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 积分调整对话框 -->
    <el-dialog
      v-model="showPointsDialog"
      title="调整积分"
      width="400px"
    >
      <el-form :model="pointsForm" label-width="100px">
        <el-form-item label="会员信息">
          <div v-if="selectedMember" class="member-summary">
            <el-avatar :src="selectedMember.avatar" :size="40">
              {{ selectedMember.name.charAt(0) }}
            </el-avatar>
            <div class="member-summary-info">
              <div class="name">{{ selectedMember.name }}</div>
              <div class="level">{{ getLevelText(selectedMember.level) }}</div>
              <div class="current-points">当前积分: {{ selectedMember.points }}</div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="调整类型">
          <el-select v-model="pointsForm.type" placeholder="选择调整类型">
            <el-option label="增加积分" value="earn" />
            <el-option label="消费积分" value="spend" />
            <el-option label="手动调整" value="adjust" />
          </el-select>
        </el-form-item>
        <el-form-item label="积分数量">
          <el-input-number
            v-model="pointsForm.points"
            :min="pointsForm.type === 'spend' ? -selectedMember?.points || 0 : -999999"
            :max="999999"
            placeholder="请输入积分数量"
          />
        </el-form-item>
        <el-form-item label="调整原因">
          <el-input
            v-model="pointsForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入调整原因"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showPointsDialog = false">取消</el-button>
        <el-button type="primary" @click="handlePointsAdjustment" :loading="adjustingPoints">
          确认调整
        </el-button>
      </template>
    </el-dialog>

    <!-- 积分记录对话框 -->
    <el-dialog
      v-model="showPointsHistoryDialog"
      title="积分记录"
      width="800px"
    >
      <el-table
        v-loading="pointsHistoryLoading"
        :data="pointsHistory"
        style="width: 100%"
      >
        <el-table-column prop="points" label="积分变动" width="120">
          <template #default="{ row }">
            <span :class="getPointsClass(row.type)">
              {{ row.type === 'earn' ? '+' : row.type === 'spend' ? '-' : '' }}{{ row.points }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getPointsTypeTagType(row.type)">
              {{ getPointsTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="原因" min-width="200" />
        <el-table-column prop="balance" label="余额" width="100" />
        <el-table-column prop="createdAt" label="时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>

      <div class="points-pagination">
        <el-pagination
          v-model:current-page="pointsHistoryPage.page"
          :page-size="pointsHistoryPage.limit"
          :total="pointsHistoryPage.total"
          layout="prev, pager, next"
          @current-change="loadPointsHistory"
        />
      </div>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog
      v-model="showBatchImportDialog"
      title="批量导入会员"
      width="600px"
    >
      <div class="batch-import-content">
        <el-alert
          title="导入说明"
          type="info"
          description="请按照模板格式准备CSV文件，包含姓名、手机号等必填信息"
          show-icon
          style="margin-bottom: 20px;"
        />

        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :limit="1"
          accept=".csv,.xlsx,.xls"
          @change="handleFileChange"
        >
          <template #trigger>
            <el-button type="primary">选择文件</el-button>
          </template>
        </el-upload>

        <div v-if="selectedFile" class="file-info">
          <el-icon><Document /></el-icon>
          <span>{{ selectedFile.name }}</span>
        </div>
      </div>

      <template #footer>
        <el-button @click="showBatchImportDialog = false">取消</el-button>
        <el-button type="primary" @click="handleBatchImport" :loading="importing">
          开始导入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, ElUpload } from 'element-plus'
import {
  Plus,
  Upload,
  Download,
  Refresh,
  Search,
  User,
  UserFilled,
  TrendCharts,
  Money,
  View,
  Edit,
  ArrowDown,
  Document
} from '@element-plus/icons-vue'
import {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
  adjustPoints,
  getPointsHistory,
  getMemberStats,
  upgradeMemberLevel,
  batchImportMembers,
  exportMembers,
  sendNotification
} from '../api/member'
import type {
  Member,
  MemberLevel,
  MemberStatus,
  CreateMemberRequest,
  UpdateMemberRequest,
  PointsAdjustmentRequest,
  PointsRecord,
  MemberQueryParams,
  MemberStats
} from '../api/member'

// 响应式数据
const loading = ref(false)
const showCreateDialog = ref(false)
const showPointsDialog = ref(false)
const showPointsHistoryDialog = ref(false)
const showBatchImportDialog = ref(false)
const submitting = ref(false)
const adjustingPoints = ref(false)
const importing = ref(false)
const editingMember = ref<Member | null>(null)
const selectedMember = ref<Member | null>(null)
const formRef = ref()
const uploadRef = ref()
const selectedFile = ref<File | null>(null)

// 筛选表单
const filterForm = reactive({
  search: '',
  level: '' as MemberLevel | '',
  status: '' as MemberStatus | '',
  minPoints: undefined as number | undefined,
  maxPoints: undefined as number | undefined
})

// 表单数据
const formData = reactive({
  name: '',
  phone: '',
  email: '',
  gender: 'male' as 'male' | 'female' | 'other',
  birthday: '',
  avatar: '',
  initialLevel: 'bronze' as MemberLevel,
  initialPoints: 0,
  level: 'bronze' as MemberLevel,
  status: 'active' as MemberStatus
})

// 积分调整表单
const pointsForm = reactive({
  type: 'adjust' as 'earn' | 'spend' | 'adjust',
  points: 0,
  reason: ''
})

// 会员数据
const members = ref<Member[]>([])

// 分页数据
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
})

// 会员统计数据
const memberStats = ref<MemberStats>({
  totalMembers: 0,
  activeMembers: 0,
  newMembersThisMonth: 0,
  totalPointsIssued: 0,
  totalPointsRedeemed: 0,
  memberLevels: {
    bronze: 0,
    silver: 0,
    gold: 0,
    platinum: 0,
    diamond: 0
  },
  averageSpent: 0,
  averageOrderValue: 0
})

// 积分记录数据
const pointsHistory = ref<PointsRecord[]>([])
const pointsHistoryLoading = ref(false)
const pointsHistoryPage = reactive({
  page: 1,
  limit: 20,
  total: 0
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入会员姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在2到20个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 加载会员数据
const loadMembers = async () => {
  try {
    loading.value = true
    const params: MemberQueryParams = {
      page: pagination.page,
      limit: pagination.limit,
      search: filterForm.search || undefined,
      level: filterForm.level || undefined,
      status: filterForm.status || undefined,
      minPoints: filterForm.minPoints,
      maxPoints: filterForm.maxPoints,
      sortBy: 'registeredAt',
      sortOrder: 'desc'
    }

    const response = await getMembers(params)

    if (response.success) {
      members.value = response.data.members
      pagination.total = response.data.pagination.total
      pagination.totalPages = response.data.pagination.totalPages
    } else {
      ElMessage.error(response.message || '获取会员数据失败')
    }
  } catch (error) {
    console.error('Load members failed:', error)
    ElMessage.error('获取会员数据失败')
  } finally {
    loading.value = false
  }
}

// 加载会员统计数据
const loadMemberStats = async () => {
  try {
    const response = await getMemberStats()
    if (response.success && response.data) {
      memberStats.value = response.data
    }
  } catch (error) {
    console.error('Load member stats failed:', error)
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.page = 1
  loadMembers()
}

// 重置筛选
const resetFilter = () => {
  filterForm.search = ''
  filterForm.level = ''
  filterForm.status = ''
  filterForm.minPoints = undefined
  filterForm.maxPoints = undefined
  pagination.page = 1
  loadMembers()
}

// 刷新会员数据
const refreshMembers = () => {
  loadMembers()
  loadMemberStats()
  ElMessage.success('会员数据已刷新')
}

// 查看会员详情
const handleViewDetail = (member: Member) => {
  // TODO: 实现会员详情页面
  ElMessage.info(`查看会员详情: ${member.name}`)
}

// 编辑会员
const handleEdit = (member: Member) => {
  editingMember.value = { ...member }
  Object.assign(formData, {
    name: member.name,
    phone: member.phone,
    email: member.email || '',
    gender: member.gender || 'male',
    birthday: member.birthday || '',
    avatar: member.avatar || '',
    level: member.level,
    status: member.status
  })
  showCreateDialog.value = true
}

// 更多操作处理
const handleMoreAction = async (command: any) => {
  const { action, member } = command
  selectedMember.value = member

  switch (action) {
    case 'adjustPoints':
      Object.assign(pointsForm, {
        type: 'adjust',
        points: 0,
        reason: ''
      })
      showPointsDialog.value = true
      break
    case 'upgradeLevel':
      await handleUpgradeLevel(member)
      break
    case 'sendNotification':
      await handleSendNotification(member)
      break
    case 'pointsHistory':
      await loadPointsHistory(member.id)
      showPointsHistoryDialog.value = true
      break
    case 'delete':
      await handleDeleteMember(member)
      break
  }
}

// 升级会员等级
const handleUpgradeLevel = async (member: Member) => {
  try {
    const levels: MemberLevel[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond']
    const currentIndex = levels.indexOf(member.level)
    const nextLevel = currentIndex < levels.length - 1 ? levels[currentIndex + 1] : member.level

    if (nextLevel === member.level) {
      ElMessage.warning('该会员已是最高等级')
      return
    }

    await ElMessageBox.confirm(
      `确定要将会员"${member.name}"升级为${getLevelText(nextLevel)}吗？`,
      '确认升级',
      {
        type: 'warning'
      }
    )

    const response = await upgradeMemberLevel(member.id, nextLevel)
    if (response.success) {
      ElMessage.success('会员等级升级成功')
      loadMembers()
    } else {
      ElMessage.error(response.message || '升级失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Upgrade member level failed:', error)
      ElMessage.error('升级失败')
    }
  }
}

// 发送通知
const handleSendNotification = async (member: Member) => {
  try {
    const { value: message } = await ElMessageBox.prompt(
      '请输入通知内容',
      '发送通知',
      {
        confirmButtonText: '发送',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPlaceholder: '请输入通知内容...'
      }
    )

    if (message) {
      const response = await sendNotification([member.id], message, 'system')
      if (response.success) {
        ElMessage.success('通知发送成功')
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

// 删除会员
const handleDeleteMember = async (member: Member) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除会员"${member.name}"吗？此操作不可恢复。`,
      '确认删除',
      {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      }
    )

    const response = await deleteMember(member.id)
    if (response.success) {
      ElMessage.success('会员删除成功')
      loadMembers()
      loadMemberStats()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Delete member failed:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 积分调整
const handlePointsAdjustment = async () => {
  if (!selectedMember.value) return

  try {
    adjustingPoints.value = true
    const adjustmentData: PointsAdjustmentRequest = {
      memberId: selectedMember.value.id,
      points: pointsForm.points,
      type: pointsForm.type,
      reason: pointsForm.reason
    }

    const response = await adjustPoints(adjustmentData)
    if (response.success) {
      ElMessage.success('积分调整成功')
      showPointsDialog.value = false
      loadMembers()
    } else {
      ElMessage.error(response.message || '积分调整失败')
    }
  } catch (error) {
    console.error('Adjust points failed:', error)
    ElMessage.error('积分调整失败')
  } finally {
    adjustingPoints.value = false
  }
}

// 加载积分记录
const loadPointsHistory = async (memberId: number, page: number = 1) => {
  try {
    pointsHistoryLoading.value = true
    const response = await getPointsHistory(memberId, page, pointsHistoryPage.limit)
    if (response.success) {
      pointsHistory.value = response.data || []
      if (response.pagination) {
        pointsHistoryPage.total = response.pagination.total
      }
    } else {
      ElMessage.error(response.message || '获取积分记录失败')
    }
  } catch (error) {
    console.error('Load points history failed:', error)
    ElMessage.error('获取积分记录失败')
  } finally {
    pointsHistoryLoading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    if (editingMember.value) {
      // 更新会员
      const updateData: UpdateMemberRequest = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        gender: formData.gender,
        birthday: formData.birthday,
        avatar: formData.avatar,
        level: formData.level,
        status: formData.status
      }

      const response = await updateMember(editingMember.value.id, updateData)
      if (response.success) {
        ElMessage.success('会员信息更新成功')
        showCreateDialog.value = false
        loadMembers()
      } else {
        ElMessage.error(response.message || '更新失败')
      }
    } else {
      // 创建会员
      const createData: CreateMemberRequest = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        gender: formData.gender,
        birthday: formData.birthday,
        avatar: formData.avatar,
        initialLevel: formData.initialLevel,
        initialPoints: formData.initialPoints
      }

      const response = await createMember(createData)
      if (response.success) {
        ElMessage.success('会员创建成功')
        showCreateDialog.value = false
        loadMembers()
        loadMemberStats()
      } else {
        ElMessage.error(response.message || '创建失败')
      }
    }
  } catch (error) {
    console.error('Submit failed:', error)
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  editingMember.value = null
  Object.assign(formData, {
    name: '',
    phone: '',
    email: '',
    gender: 'male',
    birthday: '',
    avatar: '',
    initialLevel: 'bronze',
    initialPoints: 0,
    level: 'bronze',
    status: 'active'
  })
  formRef.value?.resetFields()
}

// 分页处理
const handleSizeChange = (val: number) => {
  pagination.limit = val
  pagination.page = 1
  loadMembers()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  loadMembers()
}

// 文件选择处理
const handleFileChange = (file: any) => {
  selectedFile.value = file.raw
}

// 批量导入
const handleBatchImport = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请选择要导入的文件')
    return
  }

  try {
    importing.value = true

    // 这里应该解析文件内容，暂时模拟
    const mockMembers: CreateMemberRequest[] = [
      {
        name: '张三',
        phone: '13800138001',
        email: 'zhangsan@example.com',
        initialLevel: 'bronze'
      }
    ]

    const response = await batchImportMembers(mockMembers)
    if (response.success) {
      ElMessage.success(`成功导入${response.imported}个会员`)
      showBatchImportDialog.value = false
      loadMembers()
      loadMemberStats()
    } else {
      ElMessage.error(response.message || '导入失败')
    }
  } catch (error) {
    console.error('Batch import failed:', error)
    ElMessage.error('导入失败')
  } finally {
    importing.value = false
  }
}

// 导出数据
const handleExport = async () => {
  try {
    const filters: MemberQueryParams = {
      search: filterForm.search || undefined,
      level: filterForm.level || undefined,
      status: filterForm.status || undefined,
      minPoints: filterForm.minPoints,
      maxPoints: filterForm.maxPoints
    }

    const response = await exportMembers('excel', filters)
    if (response.success) {
      ElMessage.success('导出成功')
      // 这里可以下载文件
      if (response.downloadUrl) {
        window.open(response.downloadUrl, '_blank')
      }
    } else {
      ElMessage.error(response.message || '导出失败')
    }
  } catch (error) {
    console.error('Export failed:', error)
    ElMessage.error('导出失败')
  }
}

// 获取等级标签类型
const getLevelTagType = (level: MemberLevel) => {
  const typeMap: Record<MemberLevel, string> = {
    bronze: '',
    silver: 'info',
    gold: 'warning',
    platinum: 'success',
    diamond: 'danger'
  }
  return typeMap[level] || ''
}

// 获取等级文本
const getLevelText = (level: MemberLevel) => {
  const textMap: Record<MemberLevel, string> = {
    bronze: '青铜会员',
    silver: '白银会员',
    gold: '黄金会员',
    platinum: '铂金会员',
    diamond: '钻石会员'
  }
  return textMap[level] || level
}

// 获取状态标签类型
const getStatusTagType = (status: MemberStatus) => {
  const typeMap: Record<MemberStatus, string> = {
    active: 'success',
    inactive: 'info',
    suspended: 'warning',
    blacklisted: 'danger'
  }
  return typeMap[status] || ''
}

// 获取状态文本
const getStatusText = (status: MemberStatus) => {
  const textMap: Record<MemberStatus, string> = {
    active: '活跃',
    inactive: '非活跃',
    suspended: '暂停',
    blacklisted: '黑名单'
  }
  return textMap[status] || status
}

// 获取积分样式类
const getPointsClass = (type: string) => {
  return type === 'earn' ? 'points-earn' : type === 'spend' ? 'points-spend' : 'points-adjust'
}

// 获取积分类型标签类型
const getPointsTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    earn: 'success',
    spend: 'danger',
    adjust: 'warning'
  }
  return typeMap[type] || ''
}

// 获取积分类型文本
const getPointsTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    earn: '获得',
    spend: '消费',
    adjust: '调整'
  }
  return textMap[type] || type
}

// 格式化日期时间
const formatDateTime = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadMembers()
  loadMemberStats()
})
</script>

<style lang="scss" scoped>
.member-management {
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

.member-list-card {
  min-height: 400px;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .member-details {
    .name {
      font-weight: bold;
      margin-bottom: 2px;
    }

    .phone {
      font-size: 12px;
      color: #666;
    }

    .email {
      font-size: 12px;
      color: #999;
    }
  }
}

.points {
  font-weight: bold;
  color: #e6a23c;
}

.amount {
  font-weight: bold;
  color: #67c23a;
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

.member-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;

  .member-summary-info {
    .name {
      font-weight: bold;
      margin-bottom: 4px;
    }

    .level {
      color: #666;
      margin-bottom: 2px;
    }

    .current-points {
      font-weight: bold;
      color: #e6a23c;
    }
  }
}

.points-earn {
  color: #67c23a;
}

.points-spend {
  color: #f56c6c;
}

.points-adjust {
  color: #e6a23c;
}

.points-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.batch-import-content {
  .file-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
    padding: 12px;
    background-color: #f5f7fa;
    border-radius: 6px;

    span {
      color: #333;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .member-management {
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