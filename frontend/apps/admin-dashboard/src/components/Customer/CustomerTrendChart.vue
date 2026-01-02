<template>
  <div class="customer-trend-chart">
    <div class="chart-placeholder">
      <div class="chart-title">消费趋势图表</div>
      <div class="chart-info">客户ID: {{ customerId }}</div>
      <div class="chart-loading" v-if="loading">加载中...</div>
      <div class="chart-sample" v-else>
        <!-- 示例图表展示 -->
        <div class="chart-bar" style="height: 30%;"></div>
        <div class="chart-bar" style="height: 50%;"></div>
        <div class="chart-bar" style="height: 70%;"></div>
        <div class="chart-bar" style="height: 45%;"></div>
        <div class="chart-bar" style="height: 60%;"></div>
        <div class="chart-bar" style="height: 80%;"></div>
        <div class="chart-bar" style="height: 55%;"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  customerId: number
}>()

const loading = ref(false)

onMounted(() => {
  // 模拟加载数据
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
})
</script>

<style scoped>
.customer-trend-chart {
  width: 100%;
  height: 200px;
}

.chart-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.chart-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #303133;
}

.chart-info {
  font-size: 14px;
  color: #606266;
  margin-bottom: 20px;
}

.chart-loading {
  font-size: 14px;
  color: #909399;
}

.chart-sample {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  width: 80%;
  height: 100px;
}

.chart-bar {
  width: 20px;
  background-color: #409eff;
  border-radius: 2px 2px 0 0;
  margin: 0 5px;
  animation: barGrow 0.5s ease-out;
}

@keyframes barGrow {
  from {
    height: 0;
  }
  to {
    height: var(--height);
  }
}
</style>