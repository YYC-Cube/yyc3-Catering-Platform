<template>
  <div class="usage-bills">
    <h2>账单明细</h2>
    <p>这是一个占位组件，用于显示使用量账单明细。</p>
    <div class="bills-placeholder">
      <el-icon class="placeholder-icon"><Document /></el-icon>
      <span>账单明细将在此显示</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue'
import { Document } from '@element-plus/icons-vue'

// 定义属性
const props = defineProps<{
  billsData?: any[]
  currentFilter?: string
}>()

// 示例数据
const billsData = ref(props.billsData || [])
const currentFilter = ref(props.currentFilter || 'all')

// 示例方法
const filterBills = (filter: string) => {
  currentFilter.value = filter
}
</script>

<style scoped>
.usage-bills {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  font-size: 20px;
  color: #333;
}

.bills-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  background-color: #f5f5f5;
  border-radius: 8px;
  border: 2px dashed #d9d9d9;
}

.placeholder-icon {
  font-size: 48px;
  color: #909399;
  margin-bottom: 16px;
}

.bills-placeholder span {
  color: #909399;
  font-size: 16px;
}
</style>