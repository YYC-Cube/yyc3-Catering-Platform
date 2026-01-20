<!--
 YYC³餐饮管理系统 - 食品安全管理组件
 依托: YYC³系统色设计令牌
-->
<template>
  <div class="food-safety">
    <div class="safety-header">
      <div class="header-left">
        <h2 class="safety-title">食品安全管理</h2>
        <div class="safety-info">
          <el-tag type="success" size="small">
            <el-icon><CircleCheck /></el-icon>
            安全等级: {{ safetyLevel }}
          </el-tag>
          <el-tag type="info" size="small">
            <el-icon><Document /></el-icon>
            总记录: {{ totalRecords }}
          </el-tag>
          <el-tag :type="alertCount > 0 ? 'danger' : 'success'" size="small">
            <el-icon><Warning /></el-icon>
            告警: {{ alertCount }}
          </el-tag>
        </div>
      </div>
      <div class="header-right">
        <el-button-group>
          <el-button 
            :type="viewMode === 'overview' ? 'primary' : 'default'" 
            @click="viewMode = 'overview'"
          >
            <el-icon><DataAnalysis /></el-icon>
            总览
          </el-button>
          <el-button 
            :type="viewMode === 'ingredients' ? 'primary' : 'default'" 
            @click="viewMode = 'ingredients'"
          >
            <el-icon><Box /></el-icon>
            食材管理
          </el-button>
          <el-button 
            :type="viewMode === 'storage' ? 'primary' : 'default'" 
            @click="viewMode = 'storage'"
          >
            <el-icon><Refrigerator /></el-icon>
            储存管理
          </el-button>
          <el-button 
            :type="viewMode === 'inspection' ? 'primary' : 'default'" 
            @click="viewMode = 'inspection'"
          >
            <el-icon><DocumentChecked /></el-icon>
            检查记录
          </el-button>
          <el-button 
            :type="viewMode === 'alerts' ? 'primary' : 'default'" 
            @click="viewMode = 'alerts'"
          >
            <el-icon><Bell /></el-icon>
            告警管理
          </el-button>
        </el-button-group>
        <el-button type="primary" @click="handleAddRecord">
          <el-icon><Plus /></el-icon>
          新增记录
        </el-button>
      </div>
    </div>

    <div v-if="viewMode === 'overview'" class="overview-view">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: #67C23A">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ safeIngredients }}</div>
                <div class="stat-label">安全食材</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: #E6A23C">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ expiringSoon }}</div>
                <div class="stat-label">即将过期</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: #F56C6C">
                <el-icon><CircleClose /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ expiredCount }}</div>
                <div class="stat-label">已过期</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: #409EFF">
                <el-icon><DocumentChecked /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ inspectionRate }}%</div>
                <div class="stat-label">检查率</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="24">
          <el-card class="chart-card">
            <template #header>
              <span>食品安全趋势</span>
            </template>
            <div ref="trendChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :xs="24" :md="12">
          <el-card class="chart-card">
            <template #header>
              <span>食材分类统计</span>
            </template>
            <div ref="categoryChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-card class="chart-card">
            <template #header>
              <span>储存条件分布</span>
            </template>
            <div ref="storageChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div v-if="viewMode === 'ingredients'" class="ingredients-view">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>食材管理</span>
            <el-button type="primary" size="small" @click="handleAddIngredient">
              <el-icon><Plus /></el-icon>
              新增食材
            </el-button>
          </div>
        </template>
        <el-table :data="ingredients" border>
          <el-table-column prop="name" label="食材名称" />
          <el-table-column prop="category" label="分类">
            <template #default="{ row }">
              <el-tag :type="getCategoryType(row.category)" size="small">
                {{ row.category }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" />
          <el-table-column prop="unit" label="单位" />
          <el-table-column prop="expiryDate" label="过期日期">
            <template #default="{ row }">
              <el-tag :type="getExpiryStatus(row.expiryDate)" size="small">
                {{ formatDate(row.expiryDate) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="storageCondition" label="储存条件">
            <template #default="{ row }">
              <el-tag :type="getStorageType(row.storageCondition)" size="small">
                {{ row.storageCondition }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleEditIngredient(row)">
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDeleteIngredient(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <div v-if="viewMode === 'storage'" class="storage-view">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="storage in storages" :key="storage.id">
          <el-card class="storage-card" :class="getStorageCardClass(storage)">
            <template #header>
              <div class="storage-header">
                <span class="storage-name">{{ storage.name }}</span>
                <el-tag :type="getStorageStatusType(storage.status)" size="small">
                  {{ storage.status }}
                </el-tag>
              </div>
            </template>
            <div class="storage-content">
              <div class="storage-info">
                <div class="info-item">
                  <span class="info-label">温度:</span>
                  <span class="info-value">{{ storage.temperature }}°C</span>
                </div>
                <div class="info-item">
                  <span class="info-label">湿度:</span>
                  <span class="info-value">{{ storage.humidity }}%</span>
                </div>
                <div class="info-item">
                  <span class="info-label">容量:</span>
                  <span class="info-value">{{ storage.usedCapacity }}/{{ storage.totalCapacity }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">食材数:</span>
                  <span class="info-value">{{ storage.ingredientCount }}</span>
                </div>
              </div>
              <div class="storage-actions">
                <el-button type="primary" size="small" @click="handleViewStorageDetails(storage)">
                  查看详情
                </el-button>
                <el-button type="warning" size="small" @click="handleEditStorage(storage)">
                  编辑
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div v-if="viewMode === 'inspection'" class="inspection-view">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>检查记录</span>
            <el-button type="primary" size="small" @click="handleAddInspection">
              <el-icon><Plus /></el-icon>
              新增检查
            </el-button>
          </div>
        </template>
        <el-table :data="inspections" border>
          <el-table-column prop="inspectionDate" label="检查日期">
            <template #default="{ row }">
              {{ formatDate(row.inspectionDate) }}
            </template>
          </el-table-column>
          <el-table-column prop="inspector" label="检查人" />
          <el-table-column prop="inspectionType" label="检查类型">
            <template #default="{ row }">
              <el-tag :type="getInspectionType(row.inspectionType)" size="small">
                {{ row.inspectionType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="result" label="检查结果">
            <template #default="{ row }">
              <el-tag :type="getInspectionResultType(row.result)" size="small">
                {{ row.result }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="issues" label="问题数" />
          <el-table-column prop="remarks" label="备注" />
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleViewInspection(row)">
                查看
              </el-button>
              <el-button type="danger" size="small" @click="handleDeleteInspection(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <div v-if="viewMode === 'alerts'" class="alerts-view">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>告警管理</span>
            <el-button type="primary" size="small" @click="handleClearAlerts">
              <el-icon><Delete /></el-icon>
              清除已处理
            </el-button>
          </div>
        </template>
        <el-table :data="alerts" border>
          <el-table-column prop="alertTime" label="告警时间">
            <template #default="{ row }">
              {{ formatDateTime(row.alertTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="alertType" label="告警类型">
            <template #default="{ row }">
              <el-tag :type="getAlertType(row.alertType)" size="small">
                {{ row.alertType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="level" label="告警级别">
            <template #default="{ row }">
              <el-tag :type="getAlertLevelType(row.level)" size="small">
                {{ row.level }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag :type="getAlertStatusType(row.status)" size="small">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button 
                v-if="row.status === 'pending'" 
                type="success" 
                size="small"
                @click="handleHandleAlert(row)"
              >
                处理
              </el-button>
              <el-button type="primary" size="small" @click="handleViewAlert(row)">
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <el-dialog
      v-model="showIngredientDialog"
      :title="ingredientDialogTitle"
      width="600px"
    >
      <el-form :model="ingredientForm" label-width="100px">
        <el-form-item label="食材名称">
          <el-input v-model="ingredientForm.name" placeholder="请输入食材名称" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="ingredientForm.category" placeholder="请选择分类">
            <el-option label="蔬菜" value="vegetable" />
            <el-option label="肉类" value="meat" />
            <el-option label="海鲜" value="seafood" />
            <el-option label="水果" value="fruit" />
            <el-option label="调料" value="seasoning" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number v-model="ingredientForm.quantity" :min="0" />
        </el-form-item>
        <el-form-item label="单位">
          <el-input v-model="ingredientForm.unit" placeholder="请输入单位" />
        </el-form-item>
        <el-form-item label="过期日期">
          <el-date-picker
            v-model="ingredientForm.expiryDate"
            type="date"
            placeholder="选择过期日期"
          />
        </el-form-item>
        <el-form-item label="储存条件">
          <el-select v-model="ingredientForm.storageCondition" placeholder="请选择储存条件">
            <el-option label="常温" value="room" />
            <el-option label="冷藏" value="refrigerated" />
            <el-option label="冷冻" value="frozen" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showIngredientDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmIngredient">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showInspectionDialog"
      title="新增检查记录"
      width="600px"
    >
      <el-form :model="inspectionForm" label-width="100px">
        <el-form-item label="检查日期">
          <el-date-picker
            v-model="inspectionForm.inspectionDate"
            type="date"
            placeholder="选择检查日期"
          />
        </el-form-item>
        <el-form-item label="检查人">
          <el-input v-model="inspectionForm.inspector" placeholder="请输入检查人" />
        </el-form-item>
        <el-form-item label="检查类型">
          <el-select v-model="inspectionForm.inspectionType" placeholder="请选择检查类型">
            <el-option label="日常检查" value="daily" />
            <el-option label="定期检查" value="periodic" />
            <el-option label="专项检查" value="special" />
          </el-select>
        </el-form-item>
        <el-form-item label="检查结果">
          <el-select v-model="inspectionForm.result" placeholder="请选择检查结果">
            <el-option label="合格" value="pass" />
            <el-option label="不合格" value="fail" />
            <el-option label="需改进" value="improve" />
          </el-select>
        </el-form-item>
        <el-form-item label="问题数">
          <el-input-number v-model="inspectionForm.issues" :min="0" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="inspectionForm.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showInspectionDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmInspection">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CircleCheck, Warning, Document, DataAnalysis, Box, Refrigerator, DocumentChecked, Bell, Plus, Delete, CircleClose } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'

interface Ingredient {
  id: string
  name: string
  category: 'vegetable' | 'meat' | 'seafood' | 'fruit' | 'seasoning' | 'other'
  quantity: number
  unit: string
  expiryDate: Date
  storageCondition: 'room' | 'refrigerated' | 'frozen'
  status: 'safe' | 'expiring' | 'expired'
}

interface Storage {
  id: string
  name: string
  temperature: number
  humidity: number
  usedCapacity: number
  totalCapacity: number
  ingredientCount: number
  status: 'normal' | 'warning' | 'error'
}

interface Inspection {
  id: string
  inspectionDate: Date
  inspector: string
  inspectionType: 'daily' | 'periodic' | 'special'
  result: 'pass' | 'fail' | 'improve'
  issues: number
  remarks: string
}

interface Alert {
  id: string
  alertTime: Date
  alertType: 'expiry' | 'temperature' | 'quality' | 'other'
  level: 'low' | 'medium' | 'high'
  description: string
  status: 'pending' | 'handled'
}

const viewMode = ref<'overview' | 'ingredients' | 'storage' | 'inspection' | 'alerts'>('overview')
const trendChartRef = ref<HTMLElement>()
const categoryChartRef = ref<HTMLElement>()
const storageChartRef = ref<HTMLElement>()

const showIngredientDialog = ref(false)
const showInspectionDialog = ref(false)
const ingredientDialogTitle = ref('新增食材')

const ingredients = ref<Ingredient[]>([])
const storages = ref<Storage[]>([])
const inspections = ref<Inspection[]>([])
const alerts = ref<Alert[]>([])

const ingredientForm = ref({
  id: '',
  name: '',
  category: 'vegetable' as const,
  quantity: 0,
  unit: '',
  expiryDate: new Date(),
  storageCondition: 'room' as const
})

const inspectionForm = ref({
  id: '',
  inspectionDate: new Date(),
  inspector: '',
  inspectionType: 'daily' as const,
  result: 'pass' as const,
  issues: 0,
  remarks: ''
})

let trendChart: echarts.ECharts | null = null
let categoryChart: echarts.ECharts | null = null
let storageChart: echarts.ECharts | null = null

const safetyLevel = computed(() => {
  const expired = ingredients.value.filter(i => i.status === 'expired').length
  const expiring = ingredients.value.filter(i => i.status === 'expiring').length
  const total = ingredients.value.length
  
  if (total === 0) return 'A'
  
  const riskRatio = (expired * 2 + expiring) / total
  if (riskRatio < 0.1) return 'A'
  if (riskRatio < 0.3) return 'B'
  return 'C'
})

const totalRecords = computed(() => ingredients.value.length + inspections.value.length)
const alertCount = computed(() => alerts.value.filter(a => a.status === 'pending').length)
const safeIngredients = computed(() => ingredients.value.filter(i => i.status === 'safe').length)
const expiringSoon = computed(() => ingredients.value.filter(i => i.status === 'expiring').length)
const expiredCount = computed(() => ingredients.value.filter(i => i.status === 'expired').length)
const inspectionRate = computed(() => {
  if (ingredients.value.length === 0) return 100
  const inspectedCount = inspections.value.length
  return ((inspectedCount / ingredients.value.length) * 100).toFixed(1)
})

onMounted(() => {
  loadMockData()
  nextTick(() => {
    initCharts()
  })
})

onUnmounted(() => {
  if (trendChart) trendChart.dispose()
  if (categoryChart) categoryChart.dispose()
  if (storageChart) storageChart.dispose()
})

function loadMockData() {
  ingredients.value = generateMockIngredients()
  storages.value = generateMockStorages()
  inspections.value = generateMockInspections()
  alerts.value = generateMockAlerts()
}

function generateMockIngredients(): Ingredient[] {
  const now = new Date()
  return [
    {
      id: '1',
      name: '西红柿',
      category: 'vegetable',
      quantity: 50,
      unit: 'kg',
      expiryDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      storageCondition: 'refrigerated',
      status: 'safe'
    },
    {
      id: '2',
      name: '猪肉',
      category: 'meat',
      quantity: 20,
      unit: 'kg',
      expiryDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      storageCondition: 'frozen',
      status: 'expiring'
    },
    {
      id: '3',
      name: '鲈鱼',
      category: 'seafood',
      quantity: 15,
      unit: 'kg',
      expiryDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      storageCondition: 'frozen',
      status: 'expired'
    },
    {
      id: '4',
      name: '苹果',
      category: 'fruit',
      quantity: 30,
      unit: 'kg',
      expiryDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      storageCondition: 'room',
      status: 'safe'
    },
    {
      id: '5',
      name: '生抽',
      category: 'seasoning',
      quantity: 10,
      unit: '瓶',
      expiryDate: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000),
      storageCondition: 'room',
      status: 'safe'
    }
  ]
}

function generateMockStorages(): Storage[] {
  return [
    {
      id: '1',
      name: '冷藏室1',
      temperature: 4,
      humidity: 65,
      usedCapacity: 80,
      totalCapacity: 100,
      ingredientCount: 25,
      status: 'normal'
    },
    {
      id: '2',
      name: '冷藏室2',
      temperature: 5,
      humidity: 70,
      usedCapacity: 95,
      totalCapacity: 100,
      ingredientCount: 30,
      status: 'warning'
    },
    {
      id: '3',
      name: '冷冻室1',
      temperature: -18,
      humidity: 60,
      usedCapacity: 60,
      totalCapacity: 100,
      ingredientCount: 15,
      status: 'normal'
    },
    {
      id: '4',
      name: '常温储存',
      temperature: 22,
      humidity: 55,
      usedCapacity: 40,
      totalCapacity: 100,
      ingredientCount: 10,
      status: 'normal'
    }
  ]
}

function generateMockInspections(): Inspection[] {
  const now = new Date()
  return [
    {
      id: '1',
      inspectionDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      inspector: '张三',
      inspectionType: 'daily',
      result: 'pass',
      issues: 0,
      remarks: '一切正常'
    },
    {
      id: '2',
      inspectionDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      inspector: '李四',
      inspectionType: 'periodic',
      result: 'improve',
      issues: 2,
      remarks: '部分食材需要加强管理'
    },
    {
      id: '3',
      inspectionDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      inspector: '王五',
      inspectionType: 'daily',
      result: 'pass',
      issues: 0,
      remarks: '检查通过'
    }
  ]
}

function generateMockAlerts(): Alert[] {
  const now = new Date()
  return [
    {
      id: '1',
      alertTime: new Date(now.getTime() - 30 * 60 * 1000),
      alertType: 'expiry',
      level: 'high',
      description: '鲈鱼已过期，请及时处理',
      status: 'pending'
    },
    {
      id: '2',
      alertTime: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      alertType: 'temperature',
      level: 'medium',
      description: '冷藏室2温度偏高',
      status: 'pending'
    },
    {
      id: '3',
      alertTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      alertType: 'expiry',
      level: 'medium',
      description: '猪肉即将过期',
      status: 'handled'
    }
  ]
}

function initCharts() {
  initTrendChart()
  initCategoryChart()
  initStorageChart()
}

function initTrendChart() {
  if (!trendChartRef.value) return
  
  trendChart = echarts.init(trendChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['安全食材', '过期食材', '检查次数']
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '安全食材',
        type: 'line',
        data: [120, 132, 101, 134, 90, 230, 210],
        itemStyle: {
          color: '#67C23A'
        }
      },
      {
        name: '过期食材',
        type: 'line',
        data: [5, 3, 8, 2, 6, 4, 7],
        itemStyle: {
          color: '#F56C6C'
        }
      },
      {
        name: '检查次数',
        type: 'bar',
        data: [3, 3, 3, 3, 3, 2, 2],
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  }
  
  trendChart.setOption(option)
}

function initCategoryChart() {
  if (!categoryChartRef.value) return
  
  categoryChart = echarts.init(categoryChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '食材分类',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 1048, name: '蔬菜' },
          { value: 735, name: '肉类' },
          { value: 580, name: '海鲜' },
          { value: 484, name: '水果' },
          { value: 300, name: '调料' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  categoryChart.setOption(option)
}

function initStorageChart() {
  if (!storageChartRef.value) return
  
  storageChart = echarts.init(storageChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '储存条件',
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 40, name: '常温' },
          { value: 80, name: '冷藏' },
          { value: 60, name: '冷冻' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  storageChart.setOption(option)
}

function getCategoryType(category: string): string {
  const types: Record<string, string> = {
    vegetable: 'success',
    meat: 'danger',
    seafood: 'primary',
    fruit: 'warning',
    seasoning: 'info',
    other: ''
  }
  return types[category] || ''
}

function getExpiryStatus(date: Date): string {
  const now = new Date()
  const daysUntilExpiry = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysUntilExpiry < 0) return 'danger'
  if (daysUntilExpiry <= 3) return 'warning'
  return 'success'
}

function getStorageType(condition: string): string {
  const types: Record<string, string> = {
    room: 'info',
    refrigerated: 'primary',
    frozen: 'warning'
  }
  return types[condition] || ''
}

function getStatusType(status: string): string {
  const types: Record<string, string> = {
    safe: 'success',
    expiring: 'warning',
    expired: 'danger'
  }
  return types[status] || ''
}

function getStorageCardClass(storage: Storage): string {
  const classes = ['storage-card']
  if (storage.status === 'warning') {
    classes.push('storage-warning')
  } else if (storage.status === 'error') {
    classes.push('storage-error')
  }
  return classes.join(' ')
}

function getStorageStatusType(status: string): string {
  const types: Record<string, string> = {
    normal: 'success',
    warning: 'warning',
    error: 'danger'
  }
  return types[status] || ''
}

function getInspectionType(type: string): string {
  const types: Record<string, string> = {
    daily: 'info',
    periodic: 'warning',
    special: 'danger'
  }
  return types[type] || ''
}

function getInspectionResultType(result: string): string {
  const types: Record<string, string> = {
    pass: 'success',
    fail: 'danger',
    improve: 'warning'
  }
  return types[result] || ''
}

function getAlertType(type: string): string {
  const types: Record<string, string> = {
    expiry: 'danger',
    temperature: 'warning',
    quality: 'primary',
    other: 'info'
  }
  return types[type] || ''
}

function getAlertLevelType(level: string): string {
  const types: Record<string, string> = {
    low: 'info',
    medium: 'warning',
    high: 'danger'
  }
  return types[level] || ''
}

function getAlertStatusType(status: string): string {
  const types: Record<string, string> = {
    pending: 'danger',
    handled: 'success'
  }
  return types[status] || ''
}

function formatDate(date: Date): string {
  return dayjs(date).format('YYYY-MM-DD')
}

function formatDateTime(date: Date): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

function handleAddRecord() {
  showIngredientDialog.value = true
  ingredientDialogTitle.value = '新增食材'
  ingredientForm.value = {
    id: '',
    name: '',
    category: 'vegetable',
    quantity: 0,
    unit: '',
    expiryDate: new Date(),
    storageCondition: 'room'
  }
}

function handleAddIngredient() {
  showIngredientDialog.value = true
  ingredientDialogTitle.value = '新增食材'
  ingredientForm.value = {
    id: '',
    name: '',
    category: 'vegetable',
    quantity: 0,
    unit: '',
    expiryDate: new Date(),
    storageCondition: 'room'
  }
}

function handleEditIngredient(ingredient: Ingredient) {
  showIngredientDialog.value = true
  ingredientDialogTitle.value = '编辑食材'
  ingredientForm.value = {
    id: ingredient.id,
    name: ingredient.name,
    category: ingredient.category,
    quantity: ingredient.quantity,
    unit: ingredient.unit,
    expiryDate: ingredient.expiryDate,
    storageCondition: ingredient.storageCondition
  }
}

function handleDeleteIngredient(ingredient: Ingredient) {
  ElMessageBox.confirm('确定要删除该食材吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = ingredients.value.findIndex(i => i.id === ingredient.id)
    if (index > -1) {
      ingredients.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

function confirmIngredient() {
  if (!ingredientForm.value.name) {
    ElMessage.warning('请输入食材名称')
    return
  }
  
  if (ingredientForm.value.id) {
    const index = ingredients.value.findIndex(i => i.id === ingredientForm.value.id)
    if (index > -1) {
      ingredients.value[index] = {
        ...ingredientForm.value,
        status: calculateStatus(ingredientForm.value.expiryDate)
      }
      ElMessage.success('更新成功')
    }
  } else {
    const newIngredient = {
      ...ingredientForm.value,
      id: Date.now().toString(),
      status: calculateStatus(ingredientForm.value.expiryDate)
    }
    ingredients.value.push(newIngredient)
    ElMessage.success('添加成功')
  }
  
  showIngredientDialog.value = false
}

function calculateStatus(expiryDate: Date): 'safe' | 'expiring' | 'expired' {
  const now = new Date()
  const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysUntilExpiry < 0) return 'expired'
  if (daysUntilExpiry <= 3) return 'expiring'
  return 'safe'
}

function handleViewStorageDetails(storage: Storage) {
  ElMessage.info(`查看 ${storage.name} 详情`)
}

function handleEditStorage(storage: Storage) {
  ElMessage.info(`编辑 ${storage.name}`)
}

function handleAddInspection() {
  showInspectionDialog.value = true
  inspectionForm.value = {
    id: '',
    inspectionDate: new Date(),
    inspector: '',
    inspectionType: 'daily',
    result: 'pass',
    issues: 0,
    remarks: ''
  }
}

function confirmInspection() {
  if (!inspectionForm.value.inspector) {
    ElMessage.warning('请输入检查人')
    return
  }
  
  const newInspection = {
    ...inspectionForm.value,
    id: Date.now().toString()
  }
  inspections.value.unshift(newInspection)
  ElMessage.success('添加成功')
  showInspectionDialog.value = false
}

function handleViewInspection(inspection: Inspection) {
  ElMessage.info(`查看检查记录: ${inspection.inspector}`)
}

function handleDeleteInspection(inspection: Inspection) {
  ElMessageBox.confirm('确定要删除该检查记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = inspections.value.findIndex(i => i.id === inspection.id)
    if (index > -1) {
      inspections.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

function handleHandleAlert(alert: Alert) {
  ElMessageBox.confirm('确定要处理该告警吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    alert.status = 'handled'
    ElMessage.success('告警已处理')
  }).catch(() => {})
}

function handleViewAlert(alert: Alert) {
  ElMessage.info(`查看告警详情: ${alert.description}`)
}

function handleClearAlerts() {
  ElMessageBox.confirm('确定要清除所有已处理的告警吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    alerts.value = alerts.value.filter(a => a.status === 'pending')
    ElMessage.success('清除成功')
  }).catch(() => {})
}
</script>

<style scoped lang="scss">
.food-safety {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.safety-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;

    .safety-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }

    .safety-info {
      display: flex;
      gap: 10px;
    }
  }

  .header-right {
    display: flex;
    gap: 10px;
  }
}

.overview-view,
.ingredients-view,
.storage-view,
.inspection-view,
.alerts-view {
  margin-top: 20px;
}

.stat-card {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .stat-content {
    display: flex;
    align-items: center;
    gap: 15px;

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      .el-icon {
        font-size: 28px;
        color: white;
      }
    }

    .stat-info {
      flex: 1;

      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 5px;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }
}

.chart-card {
  .chart-container {
    height: 300px;
  }
}

.storage-card {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &.storage-warning {
    border-left: 4px solid #E6A23C;
  }

  &.storage-error {
    border-left: 4px solid #F56C6C;
  }

  .storage-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .storage-name {
      font-weight: 600;
      font-size: 16px;
    }
  }

  .storage-content {
    .storage-info {
      margin-bottom: 15px;

      .info-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #ebeef5;

        &:last-child {
          border-bottom: none;
        }

        .info-label {
          color: #909399;
        }

        .info-value {
          font-weight: 500;
          color: #303133;
        }
      }
    }

    .storage-actions {
      display: flex;
      gap: 10px;
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 768px) {
  .safety-header {
    flex-direction: column;
    align-items: flex-start;

    .header-left,
    .header-right {
      width: 100%;
      justify-content: center;
    }

    .safety-info {
      flex-wrap: wrap;
    }
  }

  .stat-card,
  .storage-card {
    margin-bottom: 15px;
  }
}
</style>
