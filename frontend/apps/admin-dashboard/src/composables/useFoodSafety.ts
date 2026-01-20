/**
 * @fileoverview 食品安全管理Composable
 * @description 管理食品安全功能的状态和逻辑
 * @module useFoodSafety
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 */

import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { foodSafetyApi, type Ingredient, type Storage, type Inspection, type Alert, type SafetySummary } from '@/api/food-safety'

export function useFoodSafety() {
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
  const summary = ref<SafetySummary | null>(null)
  const loading = ref(false)

  const ingredientForm = ref({
    id: '',
    name: '',
    category: 'vegetable' as const,
    quantity: 0,
    unit: '',
    expiryDate: new Date(),
    storageCondition: 'room' as const,
    supplier: '',
    batchNumber: '',
    remarks: ''
  })

  const inspectionForm = ref({
    id: '',
    inspectionDate: new Date(),
    inspector: '',
    inspectorId: '',
    inspectionType: 'daily' as const,
    result: 'pass' as const,
    issues: 0,
    remarks: '',
    checkedItems: [] as string[]
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

  const loadIngredients = async () => {
    try {
      loading.value = true
      const response = await foodSafetyApi.getIngredients()
      ingredients.value = response.data
    } catch (error) {
      ElMessage.error('加载食材信息失败')
      console.error('加载食材信息失败:', error)
    } finally {
      loading.value = false
    }
  }

  const loadStorages = async () => {
    try {
      loading.value = true
      const response = await foodSafetyApi.getStorages()
      storages.value = response.data
    } catch (error) {
      ElMessage.error('加载储存信息失败')
      console.error('加载储存信息失败:', error)
    } finally {
      loading.value = false
    }
  }

  const loadInspections = async () => {
    try {
      loading.value = true
      const response = await foodSafetyApi.getInspections()
      inspections.value = response.data
    } catch (error) {
      ElMessage.error('加载检查记录失败')
      console.error('加载检查记录失败:', error)
    } finally {
      loading.value = false
    }
  }

  const loadAlerts = async () => {
    try {
      loading.value = true
      const response = await foodSafetyApi.getAlerts()
      alerts.value = response.data
    } catch (error) {
      ElMessage.error('加载告警信息失败')
      console.error('加载告警信息失败:', error)
    } finally {
      loading.value = false
    }
  }

  const loadSummary = async () => {
    try {
      loading.value = true
      const response = await foodSafetyApi.getSafetySummary()
      summary.value = response.data
    } catch (error) {
      ElMessage.error('加载汇总信息失败')
      console.error('加载汇总信息失败:', error)
    } finally {
      loading.value = false
    }
  }

  const refreshData = async () => {
    await Promise.all([
      loadIngredients(),
      loadStorages(),
      loadInspections(),
      loadAlerts(),
      loadSummary()
    ])
    ElMessage.success('数据已刷新')
  }

  const initCharts = () => {
    initTrendChart()
    initCategoryChart()
    initStorageChart()
  }

  const initTrendChart = () => {
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

  const initCategoryChart = () => {
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

  const initStorageChart = () => {
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

  const getCategoryType = (category: string): string => {
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

  const getExpiryStatus = (date: string): string => {
    const now = new Date()
    const daysUntilExpiry = Math.floor((new Date(date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry < 0) return 'danger'
    if (daysUntilExpiry <= 3) return 'warning'
    return 'success'
  }

  const getStorageType = (condition: string): string => {
    const types: Record<string, string> = {
      room: 'info',
      refrigerated: 'primary',
      frozen: 'warning'
    }
    return types[condition] || ''
  }

  const getStatusType = (status: string): string => {
    const types: Record<string, string> = {
      safe: 'success',
      expiring: 'warning',
      expired: 'danger'
    }
    return types[status] || ''
  }

  const getStorageCardClass = (storage: Storage): string => {
    const classes = ['storage-card']
    if (storage.status === 'warning') {
      classes.push('storage-warning')
    } else if (storage.status === 'error') {
      classes.push('storage-error')
    }
    return classes.join(' ')
  }

  const getStorageStatusType = (status: string): string => {
    const types: Record<string, string> = {
      normal: 'success',
      warning: 'warning',
      error: 'danger'
    }
    return types[status] || ''
  }

  const getInspectionType = (type: string): string => {
    const types: Record<string, string> = {
      daily: 'info',
      periodic: 'warning',
      special: 'danger'
    }
    return types[type] || ''
  }

  const getInspectionResultType = (result: string): string => {
    const types: Record<string, string> = {
      pass: 'success',
      fail: 'danger',
      improve: 'warning'
    }
    return types[result] || ''
  }

  const getAlertType = (type: string): string => {
    const types: Record<string, string> = {
      expiry: 'danger',
      temperature: 'warning',
      quality: 'primary',
      other: 'info'
    }
    return types[type] || ''
  }

  const getAlertLevelType = (level: string): string => {
    const types: Record<string, string> = {
      low: 'info',
      medium: 'warning',
      high: 'danger'
    }
    return types[level] || ''
  }

  const getAlertStatusType = (status: string): string => {
    const types: Record<string, string> = {
      pending: 'danger',
      handled: 'success'
    }
    return types[status] || ''
  }

  const formatDate = (date: string): string => {
    return dayjs(date).format('YYYY-MM-DD')
  }

  const formatDateTime = (date: string): string => {
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
  }

  const handleAddRecord = () => {
    showIngredientDialog.value = true
    ingredientDialogTitle.value = '新增食材'
    ingredientForm.value = {
      id: '',
      name: '',
      category: 'vegetable',
      quantity: 0,
      unit: '',
      expiryDate: new Date(),
      storageCondition: 'room',
      supplier: '',
      batchNumber: '',
      remarks: ''
    }
  }

  const handleAddIngredient = () => {
    showIngredientDialog.value = true
    ingredientDialogTitle.value = '新增食材'
    ingredientForm.value = {
      id: '',
      name: '',
      category: 'vegetable',
      quantity: 0,
      unit: '',
      expiryDate: new Date(),
      storageCondition: 'room',
      supplier: '',
      batchNumber: '',
      remarks: ''
    }
  }

  const handleEditIngredient = (ingredient: Ingredient) => {
    showIngredientDialog.value = true
    ingredientDialogTitle.value = '编辑食材'
    ingredientForm.value = {
      id: ingredient.id,
      name: ingredient.name,
      category: ingredient.category,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      expiryDate: new Date(ingredient.expiryDate),
      storageCondition: ingredient.storageCondition,
      supplier: ingredient.supplier || '',
      batchNumber: ingredient.batchNumber || '',
      remarks: ingredient.remarks || ''
    }
  }

  const handleDeleteIngredient = async (ingredient: Ingredient) => {
    try {
      await ElMessageBox.confirm('确定要删除该食材吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      await foodSafetyApi.deleteIngredient(ingredient.id)
      const index = ingredients.value.findIndex(i => i.id === ingredient.id)
      if (index > -1) {
        ingredients.value.splice(index, 1)
      }
      ElMessage.success('删除成功')
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
        console.error('删除失败:', error)
      }
    }
  }

  const confirmIngredient = async () => {
    if (!ingredientForm.value.name) {
      ElMessage.warning('请输入食材名称')
      return
    }
    
    try {
      if (ingredientForm.value.id) {
        await foodSafetyApi.updateIngredient({
          id: ingredientForm.value.id,
          name: ingredientForm.value.name,
          category: ingredientForm.value.category,
          quantity: ingredientForm.value.quantity,
          unit: ingredientForm.value.unit,
          expiryDate: dayjs(ingredientForm.value.expiryDate).format('YYYY-MM-DD'),
          storageCondition: ingredientForm.value.storageCondition,
          supplier: ingredientForm.value.supplier,
          batchNumber: ingredientForm.value.batchNumber,
          remarks: ingredientForm.value.remarks
        })
        
        const index = ingredients.value.findIndex(i => i.id === ingredientForm.value.id)
        if (index > -1) {
          ingredients.value[index] = {
            ...ingredientForm.value,
            expiryDate: dayjs(ingredientForm.value.expiryDate).format('YYYY-MM-DD'),
            status: calculateStatus(ingredientForm.value.expiryDate)
          } as Ingredient
        }
        ElMessage.success('更新成功')
      } else {
        const response = await foodSafetyApi.createIngredient({
          name: ingredientForm.value.name,
          category: ingredientForm.value.category,
          quantity: ingredientForm.value.quantity,
          unit: ingredientForm.value.unit,
          expiryDate: dayjs(ingredientForm.value.expiryDate).format('YYYY-MM-DD'),
          storageCondition: ingredientForm.value.storageCondition,
          supplier: ingredientForm.value.supplier,
          batchNumber: ingredientForm.value.batchNumber,
          remarks: ingredientForm.value.remarks
        })
        
        ingredients.value.push({
          ...response.data,
          status: calculateStatus(ingredientForm.value.expiryDate)
        })
        ElMessage.success('添加成功')
      }
      
      showIngredientDialog.value = false
    } catch (error) {
      ElMessage.error('操作失败')
      console.error('操作失败:', error)
    }
  }

  const calculateStatus = (expiryDate: Date): 'safe' | 'expiring' | 'expired' => {
    const now = new Date()
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry < 0) return 'expired'
    if (daysUntilExpiry <= 3) return 'expiring'
    return 'safe'
  }

  const handleViewStorageDetails = (storage: Storage) => {
    ElMessage.info(`查看 ${storage.name} 详情`)
  }

  const handleEditStorage = (storage: Storage) => {
    ElMessage.info(`编辑 ${storage.name}`)
  }

  const handleAddInspection = () => {
    showInspectionDialog.value = true
    inspectionForm.value = {
      id: '',
      inspectionDate: new Date(),
      inspector: '',
      inspectorId: '',
      inspectionType: 'daily',
      result: 'pass',
      issues: 0,
      remarks: '',
      checkedItems: []
    }
  }

  const confirmInspection = async () => {
    if (!inspectionForm.value.inspector) {
      ElMessage.warning('请输入检查人')
      return
    }
    
    try {
      await foodSafetyApi.createInspection({
        inspectionDate: dayjs(inspectionForm.value.inspectionDate).format('YYYY-MM-DD'),
        inspector: inspectionForm.value.inspector,
        inspectorId: inspectionForm.value.inspectorId,
        inspectionType: inspectionForm.value.inspectionType,
        result: inspectionForm.value.result,
        issues: inspectionForm.value.issues,
        remarks: inspectionForm.value.remarks,
        checkedItems: inspectionForm.value.checkedItems
      })
      
      inspections.value.unshift({
        ...inspectionForm.value,
        id: Date.now().toString(),
        inspectionDate: dayjs(inspectionForm.value.inspectionDate).format('YYYY-MM-DD')
      } as Inspection)
      
      ElMessage.success('添加成功')
      showInspectionDialog.value = false
    } catch (error) {
      ElMessage.error('添加失败')
      console.error('添加失败:', error)
    }
  }

  const handleViewInspection = (inspection: Inspection) => {
    ElMessage.info(`查看检查记录: ${inspection.inspector}`)
  }

  const handleDeleteInspection = async (inspection: Inspection) => {
    try {
      await ElMessageBox.confirm('确定要删除该检查记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      await foodSafetyApi.deleteInspection(inspection.id)
      const index = inspections.value.findIndex(i => i.id === inspection.id)
      if (index > -1) {
        inspections.value.splice(index, 1)
      }
      ElMessage.success('删除成功')
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
        console.error('删除失败:', error)
      }
    }
  }

  const handleHandleAlert = async (alert: Alert) => {
    try {
      await ElMessageBox.confirm('确定要处理该告警吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      await foodSafetyApi.handleAlert(alert.id)
      alert.status = 'handled'
      ElMessage.success('告警已处理')
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('处理失败')
        console.error('处理失败:', error)
      }
    }
  }

  const handleViewAlert = (alert: Alert) => {
    ElMessage.info(`查看告警详情: ${alert.description}`)
  }

  const handleClearAlerts = async () => {
    try {
      await ElMessageBox.confirm('确定要清除所有已处理的告警吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      await foodSafetyApi.clearHandledAlerts()
      alerts.value = alerts.value.filter(a => a.status === 'pending')
      ElMessage.success('清除成功')
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('清除失败')
        console.error('清除失败:', error)
      }
    }
  }

  const exportIngredients = async () => {
    try {
      const response = await foodSafetyApi.exportIngredients()
      const blob = new Blob([response.data], { type: 'application/vnd.ms-excel' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `食材列表_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`
      link.click()
      ElMessage.success('导出成功')
    } catch (error) {
      ElMessage.error('导出失败')
      console.error('导出失败:', error)
    }
  }

  const exportInspections = async () => {
    try {
      const response = await foodSafetyApi.exportInspections()
      const blob = new Blob([response.data], { type: 'application/vnd.ms-excel' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `检查记录_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`
      link.click()
      ElMessage.success('导出成功')
    } catch (error) {
      ElMessage.error('导出失败')
      console.error('导出失败:', error)
    }
  }

  onMounted(() => {
    loadIngredients()
    loadStorages()
    loadInspections()
    loadAlerts()
    loadSummary()
    nextTick(() => {
      initCharts()
    })
  })

  onUnmounted(() => {
    if (trendChart) trendChart.dispose()
    if (categoryChart) categoryChart.dispose()
    if (storageChart) storageChart.dispose()
  })

  return {
    viewMode,
    trendChartRef,
    categoryChartRef,
    storageChartRef,
    showIngredientDialog,
    showInspectionDialog,
    ingredientDialogTitle,
    ingredients,
    storages,
    inspections,
    alerts,
    summary,
    loading,
    ingredientForm,
    inspectionForm,
    safetyLevel,
    totalRecords,
    alertCount,
    safeIngredients,
    expiringSoon,
    expiredCount,
    inspectionRate,
    loadIngredients,
    loadStorages,
    loadInspections,
    loadAlerts,
    loadSummary,
    refreshData,
    initCharts,
    getCategoryType,
    getExpiryStatus,
    getStorageType,
    getStatusType,
    getStorageCardClass,
    getStorageStatusType,
    getInspectionType,
    getInspectionResultType,
    getAlertType,
    getAlertLevelType,
    getAlertStatusType,
    formatDate,
    formatDateTime,
    handleAddRecord,
    handleAddIngredient,
    handleEditIngredient,
    handleDeleteIngredient,
    confirmIngredient,
    handleViewStorageDetails,
    handleEditStorage,
    handleAddInspection,
    confirmInspection,
    handleViewInspection,
    handleDeleteInspection,
    handleHandleAlert,
    handleViewAlert,
    handleClearAlerts,
    exportIngredients,
    exportInspections
  }
}
