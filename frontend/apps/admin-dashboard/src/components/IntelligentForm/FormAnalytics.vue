<template>
  <div class="form-analytics-container">
    <!-- 分析概览 -->
    <div class="analytics-overview">
      <div class="overview-title">
        <h2>表单数据分析</h2>
        <div class="date-range-picker">
          <input 
            type="date" 
            v-model="dateRange.start" 
            class="date-input"
          />
          <span>至</span>
          <input 
            type="date" 
            v-model="dateRange.end" 
            class="date-input"
          />
          <button 
            class="btn btn-primary btn-small"
            @click="loadAnalyticsData"
            :disabled="loading"
          >
            <span v-if="loading" class="loading-spinner"></span>
            查询
          </button>
        </div>
      </div>

      <!-- 关键指标卡片 -->
      <div class="metrics-cards">
        <div class="metric-card">
          <div class="metric-icon">📋</div>
          <div class="metric-content">
            <div class="metric-value">{{ totalSubmissions }}</div>
            <div class="metric-label">总提交量</div>
            <div class="metric-change">
              <span v-if="submissionChange > 0" class="change-positive">+{{ submissionChange }}%</span>
              <span v-else-if="submissionChange < 0" class="change-negative">{{ submissionChange }}%</span>
              <span v-else class="change-neutral">0%</span>
              <span class="change-label">较上周</span>
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">✓</div>
          <div class="metric-content">
            <div class="metric-value">{{ completionRate }}%</div>
            <div class="metric-label">表单完成率</div>
            <div class="metric-change">
              <span v-if="completionRateChange > 0" class="change-positive">+{{ completionRateChange }}%</span>
              <span v-else-if="completionRateChange < 0" class="change-negative">{{ completionRateChange }}%</span>
              <span v-else class="change-neutral">0%</span>
              <span class="change-label">较上周</span>
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">⏱️</div>
          <div class="metric-content">
            <div class="metric-value">{{ averageTimeToComplete }}s</div>
            <div class="metric-label">平均填写时间</div>
            <div class="metric-change">
              <span v-if="timeToCompleteChange < 0" class="change-positive">{{ timeToCompleteChange }}%</span>
              <span v-else-if="timeToCompleteChange > 0" class="change-negative">+{{ timeToCompleteChange }}%</span>
              <span v-else class="change-neutral">0%</span>
              <span class="change-label">较上周</span>
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">📈</div>
          <div class="metric-content">
            <div class="metric-value">{{ engagementRate }}%</div>
            <div class="metric-label">用户参与度</div>
            <div class="metric-change">
              <span v-if="engagementRateChange > 0" class="change-positive">+{{ engagementRateChange }}%</span>
              <span v-else-if="engagementRateChange < 0" class="change-negative">{{ engagementRateChange }}%</span>
              <span v-else class="change-neutral">0%</span>
              <span class="change-label">较上周</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 提交趋势图 -->
    <div class="analytics-section">
      <div class="section-header">
        <h3>提交趋势</h3>
        <div class="chart-controls">
          <button 
            class="btn btn-small" 
            :class="{ active: timeRange === 'day' }"
            @click="timeRange = 'day'"
          >
            日
          </button>
          <button 
            class="btn btn-small" 
            :class="{ active: timeRange === 'week' }"
            @click="timeRange = 'week'"
          >
            周
          </button>
          <button 
            class="btn btn-small" 
            :class="{ active: timeRange === 'month' }"
            @click="timeRange = 'month'"
          >
            月
          </button>
        </div>
      </div>
      <div class="chart-container">
        <canvas id="submissionTrendChart" ref="submissionTrendChart"></canvas>
      </div>
    </div>

    <!-- 字段分析 -->
    <div class="analytics-section">
      <div class="section-header">
        <h3>字段分析</h3>
      </div>
      <div class="field-analytics">
        <div 
          v-for="(fieldAnalysis, fieldId) in fieldAnalyticsData" 
          :key="fieldId"
          class="field-analysis-card"
        >
          <div class="field-header">
            <h4>{{ fieldAnalysis.label }}</h4>
            <div class="field-type">{{ fieldAnalysis.type }}</div>
          </div>
          
          <div class="field-stats">
            <div class="field-stat">
              <span class="stat-label">填写率:</span>
              <span class="stat-value">{{ fieldAnalysis.completionRate }}%</span>
            </div>
            <div class="field-stat">
              <span class="stat-label">平均字符数:</span>
              <span class="stat-value">{{ fieldAnalysis.averageLength || '-' }}</span>
            </div>
          </div>
          
          <!-- 字段值分布 -->
          <div class="field-distribution" v-if="fieldAnalysis.distribution">
            <h5>值分布</h5>
            <div class="distribution-chart">
              <canvas :id="`distributionChart_${fieldId}`" :ref="el => distributionCharts[fieldId] = el"></canvas>
            </div>
          </div>
          
          <!-- 字段错误分布 -->
          <div class="field-errors" v-if="fieldAnalysis.errorRate > 0">
            <h5>错误分布</h5>
            <div class="error-rate">
              <div class="error-bar" :style="{ width: `${fieldAnalysis.errorRate}%` }"></div>
              <span class="error-text">{{ fieldAnalysis.errorRate }}% 提交包含错误</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 智能洞察 -->
    <div class="analytics-section">
      <div class="section-header">
        <h3>智能洞察</h3>
      </div>
      <div class="insights">
        <div 
          v-for="(insight, index) in insights" 
          :key="index"
          class="insight-card"
          :class="`insight-${insight.type}`"
        >
          <div class="insight-icon">
            {{ insight.type === 'warning' ? '⚠️' : insight.type === 'info' ? 'ℹ️' : '✅' }}
          </div>
          <div class="insight-content">
            <h4>{{ insight.title }}</h4>
            <p>{{ insight.description }}</p>
            <div v-if="insight.recommendation" class="insight-recommendation">
              <strong>建议:</strong> {{ insight.recommendation }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据导出 -->
    <div class="analytics-section">
      <div class="section-header">
        <h3>数据导出</h3>
      </div>
      <div class="export-options">
        <button 
          class="btn btn-secondary" 
          @click="exportData('csv')"
          :disabled="loading"
        >
          导出为CSV
        </button>
        <button 
          class="btn btn-secondary" 
          @click="exportData('excel')"
          :disabled="loading"
        >
          导出为Excel
        </button>
        <button 
          class="btn btn-secondary" 
          @click="exportData('pdf')"
          :disabled="loading"
        >
          导出为PDF
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { intelligentFormService } from '@/services/intelligentFormService'
import type { FormAnalyticsData, FieldAnalytics } from '@/services/intelligentFormService'

// 定义props
const props = defineProps<{
  formId: string
}>()

// 导入Chart.js
import Chart from 'chart.js/auto'

// 数据状态
const loading = ref(false)
const dateRange = reactive({
  start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  end: new Date().toISOString().split('T')[0]
})
const timeRange = ref<'day' | 'week' | 'month'>('day')

// 分析数据
const analyticsData = ref<FormAnalyticsData | null>(null)
const fieldAnalyticsData = reactive<Record<string, FieldAnalytics>>({})
const insights = ref<Insight[]>([])

// 图表引用
const submissionTrendChart = ref<HTMLCanvasElement | null>(null)
const distributionCharts = reactive<Record<string, HTMLCanvasElement | null>>({})

// 图表实例
let trendChartInstance: Chart | null = null
const distributionChartInstances = reactive<Record<string, Chart | null>>({})

// 概览指标
const totalSubmissions = computed(() => analyticsData.value?.totalSubmissions || 0)
const completionRate = computed(() => analyticsData.value?.completionRate || 0)
const averageTimeToComplete = computed(() => analyticsData.value?.averageTimeToComplete || 0)
const engagementRate = computed(() => analyticsData.value?.engagementRate || 0)

// 变化率（模拟数据）
const submissionChange = ref(15)
const completionRateChange = ref(-2)
const timeToCompleteChange = ref(5)
const engagementRateChange = ref(8)

// 定义洞察接口
interface Insight {
  type: 'warning' | 'info' | 'success'
  title: string
  description: string
  recommendation?: string
}

// 加载分析数据
async function loadAnalyticsData() {
  try {
    loading.value = true
    
    // 获取分析数据
    const data = await intelligentFormService.getFormAnalytics(
      props.formId,
      dateRange.start,
      dateRange.end,
      timeRange.value
    )
    
    analyticsData.value = data
    
    // 处理字段分析数据
    data.fieldAnalytics.forEach(field => {
      fieldAnalyticsData[field.id] = field
    })
    
    // 生成智能洞察
    generateInsights(data)
    
    // 更新图表
    updateCharts()
    
  } catch (error) {
    console.error('加载分析数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 生成智能洞察
function generateInsights(data: FormAnalyticsData) {
  const newInsights: Insight[] = []
  
  // 检查表单完成率
  if (data.completionRate < 50) {
    newInsights.push({
      type: 'warning',
      title: '表单完成率低',
      description: `当前表单完成率仅为 ${data.completionRate}%，远低于行业平均水平 (约70%)。`,
      recommendation: '考虑简化表单字段，减少必填项，或优化表单流程以提高用户体验。'
    })
  }
  
  // 检查填写时间
  if (data.averageTimeToComplete > 300) {
    newInsights.push({
      type: 'warning',
      title: '填写时间过长',
      description: `用户平均需要 ${data.averageTimeToComplete} 秒来完成表单，这可能导致用户放弃。`,
      recommendation: '尝试简化复杂字段，提供更清晰的说明，或考虑使用分步表单。'
    })
  }
  
  // 检查字段错误率
  const highErrorFields = data.fieldAnalytics.filter(f => f.errorRate > 10)
  if (highErrorFields.length > 0) {
    newInsights.push({
      type: 'warning',
      title: '字段错误率高',
      description: `${highErrorFields.length} 个字段的错误率超过 10%，可能存在验证规则过于严格或说明不清晰的问题。`,
      recommendation: '检查这些字段的验证规则，确保说明清晰，并提供合适的默认值。'
    })
  }
  
  // 检查用户参与度
  if (data.engagementRate > 80) {
    newInsights.push({
      type: 'success',
      title: '用户参与度高',
      description: `表单用户参与度达到 ${data.engagementRate}%，表现优秀。`,
      recommendation: '保持当前的表单设计和流程，继续监控参与度变化。'
    })
  }
  
  // 添加趋势洞察
  if (data.submissionTrend && data.submissionTrend.length > 1) {
    const latestValue = data.submissionTrend[data.submissionTrend.length - 1].value
    const previousValue = data.submissionTrend[data.submissionTrend.length - 2].value
    const trendChange = ((latestValue - previousValue) / previousValue) * 100
    
    if (trendChange > 20) {
      newInsights.push({
        type: 'success',
        title: '提交量显著增长',
        description: `表单提交量在过去周期内增长了 ${Math.round(trendChange)}%，趋势良好。`,
        recommendation: '考虑分析增长原因，可能是推广活动或表单优化的结果。'
      })
    } else if (trendChange < -20) {
      newInsights.push({
        type: 'warning',
        title: '提交量显著下降',
        description: `表单提交量在过去周期内下降了 ${Math.abs(Math.round(trendChange))}%，需要关注。`,
        recommendation: '检查是否有外部因素影响，或表单设计是否需要优化。'
      })
    }
  }
  
  insights.value = newInsights
}

// 更新图表
function updateCharts() {
  if (!analyticsData.value) return
  
  // 更新提交趋势图
  updateSubmissionTrendChart()
  
  // 更新字段分布图表
  updateDistributionCharts()
}

// 更新提交趋势图
function updateSubmissionTrendChart() {
  if (!analyticsData.value || !submissionTrendChart.value) return
  
  // 销毁现有图表
  if (trendChartInstance) {
    trendChartInstance.destroy()
  }
  
  // 准备数据
  const trendData = analyticsData.value.submissionTrend
  const labels = trendData.map(item => item.label)
  const values = trendData.map(item => item.value)
  
  // 创建新图表
  trendChartInstance = new Chart(submissionTrendChart.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: '提交数量',
        data: values,
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#2196f3'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  })
}

// 更新字段分布图表
function updateDistributionCharts() {
  // 销毁现有图表
  Object.values(distributionChartInstances).forEach(chart => {
    if (chart) chart.destroy()
  })
  
  // 创建新图表
  for (const [fieldId, fieldAnalysis] of Object.entries(fieldAnalyticsData)) {
    const canvas = distributionCharts[fieldId]
    if (!canvas || !fieldAnalysis.distribution) continue
    
    // 准备数据
    const labels = Object.keys(fieldAnalysis.distribution)
    const values = Object.values(fieldAnalysis.distribution)
    
    // 创建新图表
    distributionChartInstances[fieldId] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: '出现次数',
          data: values,
          backgroundColor: '#4caf50',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          }
        }
      }
    })
  }
}

// 导出数据
async function exportData(format: 'csv' | 'excel' | 'pdf') {
  try {
    loading.value = true
    
    // 导出数据
    const result = await intelligentFormService.exportFormData(
      props.formId,
      dateRange.start,
      dateRange.end,
      format
    )
    
    // 处理导出结果
    if (result.downloadUrl) {
      window.open(result.downloadUrl, '_blank')
    } else if (result.fileContent) {
      // 创建下载链接
      const blob = new Blob([result.fileContent], { type: result.contentType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `form_analytics_${props.formId}_${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
    
  } catch (error) {
    console.error('导出数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 监听时间范围变化
watch(timeRange, () => {
  loadAnalyticsData()
})

// 组件挂载时加载数据
onMounted(() => {
  loadAnalyticsData()
})

// 组件卸载时销毁图表
onUnmounted(() => {
  if (trendChartInstance) {
    trendChartInstance.destroy()
  }
  
  Object.values(distributionChartInstances).forEach(chart => {
    if (chart) chart.destroy()
  })
})
</script>

<style scoped>
.form-analytics-container {
  width: 100%;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

/* 分析概览 */
.analytics-overview {
  margin-bottom: 2rem;
}

.overview-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.overview-title h2 {
  font-size: 1.8rem;
  color: #333;
  margin: 0;
}

.date-range-picker {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.date-input {
  padding: 0.6rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.9rem;
}

/* 指标卡片 */
.metrics-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.metric-card {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.metric-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f7ff;
  border-radius: 50%;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.2rem;
}

.metric-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.2rem;
}

.metric-change {
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.change-positive {
  color: #4caf50;
}

.change-negative {
  color: #f44336;
}

.change-neutral {
  color: #999;
}

.change-label {
  color: #999;
}

/* 分析部分 */
.analytics-section {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  font-size: 1.3rem;
  color: #333;
  margin: 0;
}

/* 图表控件 */
.chart-controls {
  display: flex;
  gap: 0.5rem;
}

/* 图表容器 */
.chart-container {
  height: 300px;
  position: relative;
}

/* 字段分析 */
.field-analytics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.field-analysis-card {
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.field-header h4 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.field-type {
  font-size: 0.8rem;
  color: #666;
  background-color: #e0e0e0;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.field-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.field-stat {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.stat-label {
  font-size: 0.8rem;
  color: #666;
}

.stat-value {
  font-size: 1rem;
  font-weight: bold;
  color: #333;
}

/* 字段分布 */
.field-distribution, .field-errors {
  margin-top: 1rem;
}

.field-distribution h5, .field-errors h5 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #555;
}

.distribution-chart {
  height: 200px;
  position: relative;
}

/* 错误率 */
.error-rate {
  position: relative;
  height: 20px;
  background-color: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.error-bar {
  height: 100%;
  background-color: #f44336;
  transition: width 0.3s ease;
}

.error-text {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: #333;
  font-weight: bold;
}

/* 智能洞察 */
.insights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.insight-card {
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid;
}

.insight-warning {
  background-color: #fff3e0;
  border-left-color: #ff9800;
}

.insight-info {
  background-color: #e3f2fd;
  border-left-color: #2196f3;
}

.insight-success {
  background-color: #e8f5e9;
  border-left-color: #4caf50;
}

.insight-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.insight-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #333;
}

.insight-content p {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.5;
}

.insight-recommendation {
  font-size: 0.9rem;
  color: #555;
  background-color: rgba(255, 255, 255, 0.5);
  padding: 0.5rem;
  border-radius: 4px;
}

/* 导出选项 */
.export-options {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* 按钮样式 */
.btn {
  padding: 0.8rem 1.2rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background-color: #2196f3;
  color: white;
}

.btn-primary:hover {
  background-color: #1976d2;
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #bdbdbd;
}

.btn-small {
  padding: 0.5rem 0.8rem;
  font-size: 0.8rem;
}

.btn.active {
  background-color: #2196f3;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 加载状态 */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .metrics-cards {
    grid-template-columns: 1fr;
  }
  
  .field-analytics {
    grid-template-columns: 1fr;
  }
  
  .insights {
    grid-template-columns: 1fr;
  }
  
  .overview-title {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .date-range-picker {
    width: 100%;
  }
  
  .date-input {
    flex: 1;
  }
}
</style>