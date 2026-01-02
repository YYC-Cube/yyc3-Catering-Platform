<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="(value) => emit('update:visible', value)"
    title="批量调整库存"
    width="800px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div class="batch-adjustment">
      <div class="selection-section">
        <h3>选择库存项目</h3>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索商品名称或编码"
          prefix-icon="el-icon-search"
          clearable
        />
        <el-table
          ref="multipleTableRef"
          :data="filteredItems"
          @selection-change="handleSelectionChange"
          style="width: 100%"
          max-height="300"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="code" label="商品编码" width="120" />
          <el-table-column prop="name" label="商品名称" />
          <el-table-column prop="category" label="分类" width="100" />
          <el-table-column prop="unit" label="单位" width="80" />
          <el-table-column prop="currentStock" label="当前库存" width="120" align="right" />
          <el-table-column prop="safetyStock" label="安全库存" width="120" align="right" />
        </el-table>
        <div class="selection-info">已选择 {{ selectedItems.length }} 项</div>
      </div>
      
      <div class="adjustment-section">
        <h3>调整设置</h3>
        <el-form :model="formData" :rules="rules" ref="formRef">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="调整类型" prop="adjustmentType">
                <el-select v-model="formData.adjustmentType" placeholder="选择调整类型">
                  <el-option label="增加" value="increase" />
                  <el-option label="减少" value="decrease" />
                </el-select>
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="数量类型" prop="quantityType">
                <el-select v-model="formData.quantityType" placeholder="选择数量类型">
                  <el-option label="固定数量" value="fixed" />
                  <el-option label="百分比" value="percentage" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="调整数量" prop="adjustmentQuantity">
                <el-input-number
                  v-model="formData.adjustmentQuantity"
                  :min="formData.quantityType === 'percentage' ? 0.1 : 1"
                  :precision="formData.quantityType === 'percentage' ? 2 : 0"
                  :step="formData.quantityType === 'percentage' ? 0.1 : 1"
                  :max="formData.quantityType === 'percentage' ? 1000 : null"
                  placeholder="请输入调整数量"
                />
                <span class="unit">{{ formData.quantityType === 'percentage' ? '%' : '件' }}</span>
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="调整原因" prop="reason">
                <el-select v-model="formData.reason" placeholder="选择调整原因">
                  <el-option label="采购入库" value="purchase" />
                  <el-option label="销售出库" value="sale" />
                  <el-option label="库存盘点" value="inventory_check" />
                  <el-option label="报损" value="loss" />
                  <el-option label="报溢" value="surplus" />
                  <el-option label="其他" value="other" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="备注" prop="remark">
                <el-input type="textarea" v-model="formData.remark" placeholder="请输入调整备注" :rows="3" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :disabled="selectedItems.length === 0">确认调整</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, defineProps, defineEmits } from 'vue';

// 定义组件属性
interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  safetyStock: number;
}

interface Props {
  visible: boolean;
  items: InventoryItem[];
}

// 定义组件事件
interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'adjust', data: {
    items: InventoryItem[];
    adjustmentType: string;
    quantityType: string;
    adjustmentQuantity: number;
    reason: string;
    remark: string;
  }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 表格引用
const multipleTableRef = ref();

// 表单引用
const formRef = ref();

// 搜索关键词
const searchKeyword = ref('');

// 选中的项目
const selectedItems = ref<InventoryItem[]>([]);

// 表单数据
const formData = reactive({
  adjustmentType: 'increase',
  quantityType: 'fixed',
  adjustmentQuantity: 0,
  reason: '',
  remark: ''
});

// 表单验证规则
const rules = {
  adjustmentType: [
    { required: true, message: '请选择调整类型', trigger: 'change' }
  ],
  quantityType: [
    { required: true, message: '请选择数量类型', trigger: 'change' }
  ],
  adjustmentQuantity: [
    { required: true, message: '请输入调整数量', trigger: 'blur' },
    { 
      validator: (rule: any, value: number, callback: any) => {
        if (value <= 0) {
          callback(new Error('调整数量必须大于0'));
        } else if (formData.quantityType === 'percentage' && value > 1000) {
          callback(new Error('百分比不能超过1000%'));
        } else {
          callback();
        }
      }, 
      trigger: 'blur'
    }
  ],
  reason: [
    { required: true, message: '请选择调整原因', trigger: 'change' }
  ]
};

// 过滤后的项目
const filteredItems = computed(() => {
  if (!searchKeyword.value) {
    return props.items;
  }
  return props.items.filter(item => 
    item.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    item.code.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});

// 处理选择变化
const handleSelectionChange = (val: InventoryItem[]) => {
  selectedItems.value = val;
};

// 取消操作
const handleCancel = () => {
  emit('update:visible', false);
  resetForm();
};

// 提交操作
const handleSubmit = () => {
  if (!formRef.value || selectedItems.value.length === 0) return;
  
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      // 构建调整数据
      const adjustmentData = {
        items: selectedItems.value,
        adjustmentType: formData.adjustmentType,
        quantityType: formData.quantityType,
        adjustmentQuantity: formData.adjustmentQuantity,
        reason: formData.reason,
        remark: formData.remark
      };
      
      // 触发调整事件
      emit('adjust', adjustmentData);
      
      // 重置表单
      resetForm();
      
      // 关闭对话框
      emit('update:visible', false);
    }
  });
};

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  
  // 清空选择
  if (multipleTableRef.value) {
    multipleTableRef.value.clearSelection();
  }
  
  selectedItems.value = [];
  searchKeyword.value = '';
};
</script>

<style scoped>
.batch-adjustment {
  padding: 10px 0;
}

.selection-section {
  margin-bottom: 20px;
}

.selection-section h3,
.adjustment-section h3 {
  margin: 10px 0 20px 0;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.selection-info {
  margin-top: 10px;
  font-size: 14px;
  color: #909399;
  text-align: right;
}

.adjustment-section {
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
}

.unit {
  margin-left: 10px;
  color: #909399;
}
</style>