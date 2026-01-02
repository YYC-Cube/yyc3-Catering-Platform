<template>
  <div class="inventory-adjustment">
    <h2>库存调整管理</h2>
    
    <!-- 调整记录列表 -->
    <div class="adjustment-records">
      <h3>调整记录</h3>
      <el-table :data="adjustmentRecords" style="width: 100%">
        <el-table-column prop="id" label="记录ID" width="100" />
        <el-table-column prop="productName" label="商品名称" />
        <el-table-column prop="type" label="调整类型" width="120">
          <template #default="scope">
            <el-tag :type="getAdjustmentTypeColor(scope.row.type)">
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="beforeQuantity" label="调整前" width="100" />
        <el-table-column prop="afterQuantity" label="调整后" width="100" />
        <el-table-column prop="adjustmentQuantity" label="调整数量" width="120">
          <template #default="scope">
            <span :class="scope.row.adjustmentQuantity > 0 ? 'increase' : 'decrease'">
              {{ scope.row.adjustmentQuantity > 0 ? '+' : '' }}{{ scope.row.adjustmentQuantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="调整原因" />
        <el-table-column prop="adjustedBy" label="调整人" width="100" />
        <el-table-column prop="adjustedAt" label="调整时间" width="180" />
      </el-table>
    </div>
    
    <!-- 库存调整表单 -->
    <div class="adjustment-form">
      <h3>新建库存调整</h3>
      <el-form :model="adjustmentForm" :rules="adjustmentRules" ref="adjustmentFormRef">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="商品" prop="productId">
              <el-select v-model="adjustmentForm.productId" placeholder="选择商品">
                <el-option
                  v-for="product in products"
                  :key="product.id"
                  :label="product.name"
                  :value="product.id"
                >
                  <span style="float: left">{{ product.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px;">
                    当前库存: {{ product.currentStock }}
                  </span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="调整类型" prop="type">
              <el-select v-model="adjustmentForm.type" placeholder="选择调整类型">
                <el-option label="盘点" value="盘点" />
                <el-option label="报损" value="报损" />
                <el-option label="报溢" value="报溢" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="调整数量" prop="adjustmentQuantity">
              <el-input-number
                v-model="adjustmentForm.adjustmentQuantity"
                :min="-999999"
                :max="999999"
                :step="1"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="调整原因" prop="reason">
              <el-input type="textarea" v-model="adjustmentForm.reason" placeholder="请输入调整原因" :rows="3" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item>
              <el-button type="primary" @click="submitAdjustment">保存调整</el-button>
              <el-button @click="resetAdjustmentForm">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';

// 类型定义
interface Product {
  id: string;
  name: string;
  currentStock: number;
}

interface AdjustmentRecord {
  id: string;
  productName: string;
  type: string;
  beforeQuantity: number;
  afterQuantity: number;
  adjustmentQuantity: number;
  reason: string;
  adjustedBy: string;
  adjustedAt: string;
}

// 响应式数据
const products = ref<Product[]>([
  { id: '1', name: '苹果', currentStock: 100 },
  { id: '2', name: '香蕉', currentStock: 150 },
  { id: '3', name: '橙子', currentStock: 200 },
  { id: '4', name: '葡萄', currentStock: 80 },
  { id: '5', name: '草莓', currentStock: 50 }
]);

const adjustmentRecords = ref<AdjustmentRecord[]>([
  { id: '1', productName: '苹果', type: '盘点', beforeQuantity: 100, afterQuantity: 95, adjustmentQuantity: -5, reason: '盘点发现损耗', adjustedBy: '张三', adjustedAt: '2024-03-15 10:30:00' },
  { id: '2', productName: '香蕉', type: '报溢', beforeQuantity: 150, afterQuantity: 160, adjustmentQuantity: 10, reason: '供应商额外赠送', adjustedBy: '李四', adjustedAt: '2024-03-14 14:20:00' },
  { id: '3', productName: '橙子', type: '报损', beforeQuantity: 200, afterQuantity: 180, adjustmentQuantity: -20, reason: '部分变质', adjustedBy: '王五', adjustedAt: '2024-03-13 09:15:00' }
]);

// 表单数据
const adjustmentForm = reactive({
  productId: '',
  type: '',
  adjustmentQuantity: 0,
  reason: ''
});

// 表单引用
const adjustmentFormRef = ref();

// 表单验证规则
const adjustmentRules = {
  productId: [
    { required: true, message: '请选择商品', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择调整类型', trigger: 'blur' }
  ],
  adjustmentQuantity: [
    { required: true, message: '请输入调整数量', trigger: 'blur' },
    { validator: (rule: any, value: number, callback: any) => {
      if (value === 0) {
        callback(new Error('调整数量不能为0'));
      } else {
        callback();
      }
    }, trigger: 'blur' }
  ],
  reason: [
    { required: true, message: '请输入调整原因', trigger: 'blur' }
  ]
};

// 获取调整类型对应的颜色
const getAdjustmentTypeColor = (type: string) => {
  switch (type) {
    case '盘点':
      return 'primary';
    case '报损':
      return 'danger';
    case '报溢':
      return 'success';
    default:
      return 'warning';
  }
};

// 提交库存调整
const submitAdjustment = async () => {
  if (!adjustmentFormRef.value) return;
  await adjustmentFormRef.value.validate((valid: boolean) => {
    if (valid) {
      // 计算调整后的数量
      const selectedProduct = products.value.find(p => p.id === adjustmentForm.productId);
      if (!selectedProduct) return;
      
      const beforeQuantity = selectedProduct.currentStock;
      const afterQuantity = beforeQuantity + adjustmentForm.adjustmentQuantity;
      
      // 创建新的调整记录
      const newRecord: AdjustmentRecord = {
        id: Date.now().toString(),
        productName: selectedProduct.name,
        type: adjustmentForm.type,
        beforeQuantity: beforeQuantity,
        afterQuantity: afterQuantity,
        adjustmentQuantity: adjustmentForm.adjustmentQuantity,
        reason: adjustmentForm.reason,
        adjustedBy: '当前用户', // 实际应该从登录信息获取
        adjustedAt: new Date().toLocaleString('zh-CN')
      };
      
      // 更新商品库存
      selectedProduct.currentStock = afterQuantity;
      
      // 添加到调整记录
      adjustmentRecords.value.unshift(newRecord);
      
      ElMessage.success('库存调整成功');
      resetAdjustmentForm();
    }
  });
};

// 重置表单
const resetAdjustmentForm = () => {
  Object.assign(adjustmentForm, {
    productId: '',
    type: '',
    adjustmentQuantity: 0,
    reason: ''
  });
  if (adjustmentFormRef.value) {
    adjustmentFormRef.value.resetFields();
  }
};
</script>

<style scoped>
.inventory-adjustment {
  padding: 20px;
}

.adjustment-records {
  margin-bottom: 30px;
}

.adjustment-form {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
}

.increase {
  color: #67c23a;
}

.decrease {
  color: #f56c6c;
}
</style>