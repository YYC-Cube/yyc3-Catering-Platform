<template>
  <div class="customer-loyalty">
    <h2>客户忠诚度管理</h2>
    <div class="loyalty-content">
      <!-- 忠诚度概览 -->
      <div class="loyalty-overview">
        <div class="overview-card">
          <h3>忠诚度等级</h3>
          <div class="level-list">
            <div v-for="level in loyaltyLevels" :key="level.id" class="level-item">
              <div class="level-info">
                <span class="level-name">{{ level.name }}</span>
                <span class="level-points">{{ level.minPoints }}-{{ level.maxPoints }} 积分</span>
              </div>
              <div class="level-benefits">
                <span v-for="(benefit, index) in level.benefits" :key="index">{{ benefit }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 忠诚度统计 -->
        <div class="stats-card">
          <h3>忠诚度统计</h3>
          <div class="stats-list">
            <div class="stat-item">
              <span class="stat-label">总积分</span>
              <span class="stat-value">{{ totalPoints }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">活跃会员数</span>
              <span class="stat-value">{{ activeMembers }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">积分兑换次数</span>
              <span class="stat-value">{{ redemptionCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均会员等级</span>
              <span class="stat-value">{{ averageLevel }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 积分记录 -->
      <div class="points-history">
        <h3>积分记录</h3>
        <el-table :data="pointsRecords" style="width: 100%">
          <el-table-column prop="customerName" label="客户名称" />
          <el-table-column prop="type" label="类型">
            <template #default="scope">
              <el-tag :type="scope.row.type === 'earn' ? 'success' : 'danger'">
                {{ scope.row.type === 'earn' ? '获得' : '消耗' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="points" label="积分">
            <template #default="scope">
              <span :class="scope.row.type === 'earn' ? 'points-earn' : 'points-spend'">
                {{ scope.row.type === 'earn' ? '+' : '-' }}{{ scope.row.points }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="原因" />
          <el-table-column prop="date" label="日期" />
        </el-table>
      </div>
    </div>
    
    <!-- 管理操作 -->
    <div class="loyalty-actions">
      <el-button type="primary" @click="showAddLevelDialog = true">添加等级</el-button>
      <el-button type="success" @click="showPointsDialog = true">批量调整积分</el-button>
    </div>
    
    <!-- 添加等级对话框 -->
    <el-dialog
      :model-value="showAddLevelDialog"
      @update:model-value="showAddLevelDialog = $event"
      title="添加忠诚度等级"
      width="500px"
    >
      <el-form :model="levelForm" :rules="levelRules" ref="levelFormRef">
        <el-form-item label="等级名称" prop="name">
          <el-input v-model="levelForm.name" placeholder="请输入等级名称" />
        </el-form-item>
        <el-form-item label="最小积分" prop="minPoints">
          <el-input-number v-model="levelForm.minPoints" :min="0" />
        </el-form-item>
        <el-form-item label="最大积分" prop="maxPoints">
          <el-input-number v-model="levelForm.maxPoints" :min="0" />
        </el-form-item>
        <el-form-item label="等级权益" prop="benefits">
          <el-tag
            v-for="(benefit, index) in levelForm.benefits"
            :key="index"
            closable
            @close="levelForm.benefits.splice(index, 1)"
          >
            {{ benefit }}
          </el-tag>
          <el-input
            v-model="newBenefit"
            placeholder="添加权益"
            @keyup.enter="addBenefit"
            style="margin-top: 10px;"
          />
          <el-button type="primary" size="small" @click="addBenefit" style="margin-top: 10px;">
            添加
          </el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddLevelDialog = false">取消</el-button>
          <el-button type="primary" @click="submitLevelForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 批量调整积分对话框 -->
    <el-dialog
      :model-value="showPointsDialog"
      @update:model-value="showPointsDialog = $event"
      title="批量调整积分"
      width="500px"
    >
      <el-form :model="pointsForm" :rules="pointsRules" ref="pointsFormRef">
        <el-form-item label="客户范围">
          <el-select v-model="pointsForm.customerScope" placeholder="选择客户范围">
            <el-option label="所有客户" value="all" />
            <el-option label="特定等级" value="level" />
            <el-option label="特定分段" value="segment" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="pointsForm.customerScope === 'level'" label="选择等级">
          <el-select v-model="pointsForm.selectedLevel" placeholder="选择等级">
            <el-option v-for="level in loyaltyLevels" :key="level.id" :label="level.name" :value="level.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="积分调整" prop="pointsChange">
          <el-input-number v-model="pointsForm.pointsChange" :min="-9999" :max="9999" />
        </el-form-item>
        <el-form-item label="调整原因" prop="reason">
          <el-input type="textarea" v-model="pointsForm.reason" placeholder="请输入调整原因" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPointsDialog = false">取消</el-button>
          <el-button type="primary" @click="submitPointsForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';

// 类型定义
interface LoyaltyLevel {
  id: string;
  name: string;
  minPoints: number;
  maxPoints: number;
  benefits: string[];
}

interface PointsRecord {
  id: string;
  customerName: string;
  type: 'earn' | 'spend';
  points: number;
  reason: string;
  date: string;
}

// 响应式数据
const loyaltyLevels = ref<LoyaltyLevel[]>([
  { id: '1', name: '普通会员', minPoints: 0, maxPoints: 999, benefits: ['积分累积', '生日礼品'] },
  { id: '2', name: '银卡会员', minPoints: 1000, maxPoints: 4999, benefits: ['积分累积', '生日礼品', '专属折扣'] },
  { id: '3', name: '金卡会员', minPoints: 5000, maxPoints: 9999, benefits: ['积分累积', '生日礼品', '专属折扣', '优先服务'] },
  { id: '4', name: '钻石会员', minPoints: 10000, maxPoints: 99999, benefits: ['积分累积', '生日礼品', '专属折扣', '优先服务', '免费配送'] }
]);

const pointsRecords = ref<PointsRecord[]>([
  { id: '1', customerName: '张三', type: 'earn', points: 100, reason: '购买商品', date: '2024-03-15' },
  { id: '2', customerName: '李四', type: 'spend', points: 50, reason: '兑换优惠券', date: '2024-03-14' },
  { id: '3', customerName: '王五', type: 'earn', points: 200, reason: '购买商品', date: '2024-03-13' }
]);

const totalPoints = ref(15000);
const activeMembers = ref(2500);
const redemptionCount = ref(850);
const averageLevel = ref('银卡会员');

// 对话框状态
const showAddLevelDialog = ref(false);
const showPointsDialog = ref(false);

// 表单数据
const levelForm = reactive({
  name: '',
  minPoints: 0,
  maxPoints: 0,
  benefits: [] as string[]
});

const newBenefit = ref('');

const pointsForm = reactive({
  customerScope: 'all',
  selectedLevel: '',
  pointsChange: 0,
  reason: ''
});

// 表单引用
const levelFormRef = ref();
const pointsFormRef = ref();

// 表单验证规则
const levelRules = {
  name: [
    { required: true, message: '请输入等级名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  minPoints: [
    { required: true, message: '请输入最小积分', trigger: 'blur' }
  ],
  maxPoints: [
    { required: true, message: '请输入最大积分', trigger: 'blur' }
  ]
};

const pointsRules = {
  pointsChange: [
    { required: true, message: '请输入积分调整值', trigger: 'blur' }
  ],
  reason: [
    { required: true, message: '请输入调整原因', trigger: 'blur' }
  ]
};

// 添加权益
const addBenefit = () => {
  if (newBenefit.value && !levelForm.benefits.includes(newBenefit.value)) {
    levelForm.benefits.push(newBenefit.value);
    newBenefit.value = '';
  }
};

// 提交等级表单
const submitLevelForm = async () => {
  if (!levelFormRef.value) return;
  await levelFormRef.value.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success('添加成功');
      showAddLevelDialog.value = false;
      resetLevelForm();
    }
  });
};

// 提交积分表单
const submitPointsForm = async () => {
  if (!pointsFormRef.value) return;
  await pointsFormRef.value.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success('积分调整成功');
      showPointsDialog.value = false;
      resetPointsForm();
    }
  });
};

// 重置表单
const resetLevelForm = () => {
  Object.assign(levelForm, {
    name: '',
    minPoints: 0,
    maxPoints: 0,
    benefits: []
  });
  if (levelFormRef.value) {
    levelFormRef.value.resetFields();
  }
};

const resetPointsForm = () => {
  Object.assign(pointsForm, {
    customerScope: 'all',
    selectedLevel: '',
    pointsChange: 0,
    reason: ''
  });
  if (pointsFormRef.value) {
    pointsFormRef.value.resetFields();
  }
};
</script>

<style scoped>
.customer-loyalty {
  padding: 20px;
}

.loyalty-content {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.loyalty-overview {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.overview-card, .stats-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
}

.level-list {
  margin-top: 16px;
}

.level-item {
  margin-bottom: 12px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.level-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.level-name {
  font-weight: bold;
}

.level-benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.level-benefits span {
  background-color: #e6f7ff;
  color: #1890ff;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.stats-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.stat-label {
  display: block;
  color: #606266;
  margin-bottom: 8px;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.points-history {
  flex: 2;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
}

.points-earn {
  color: #67c23a;
}

.points-spend {
  color: #f56c6c;
}

.loyalty-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
</style>