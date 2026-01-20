/**
 * @fileoverview 厨房显示Composable
 * @description 管理厨房显示功能的状态和逻辑
 * @module useKitchenDisplay
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { kitchenDisplayApi, type Order, type KitchenStation, type KitchenSummary } from '@/api/kitchen-display'

export function useKitchenDisplay() {
  const viewMode = ref<'orders' | 'stations' | 'summary'>('orders')
  const currentTime = ref('')
  const showOrderDetail = ref(false)
  const showStationDialog = ref(false)
  const selectedOrder = ref<Order | null>(null)
  const stationForm = ref({
    stationId: ''
  })

  const orders = ref<Order[]>([])
  const kitchenStations = ref<KitchenStation[]>([])
  const summary = ref<KitchenSummary | null>(null)
  const loading = ref(false)

  const pendingOrders = computed(() => orders.value.filter(o => o.status === 'pending'))
  const inProgressOrders = computed(() => orders.value.filter(o => o.status === 'in_progress'))
  const sortedOrders = computed(() => {
    return [...orders.value].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  })

  const totalOrders = computed(() => orders.value.length)
  const completedOrders = computed(() => orders.value.filter(o => o.status === 'completed').length)
  const avgOrderTime = computed(() => {
    const completed = orders.value.filter(o => o.status === 'completed')
    if (completed.length === 0) return 0
    const totalTime = completed.reduce((sum, o) => {
      const duration = dayjs().diff(dayjs(o.orderTime), 'minute')
      return sum + duration
    }, 0)
    return Math.round(totalTime / completed.length)
  })

  const timeoutOrders = computed(() => {
    const threshold = 30
    return orders.value.filter(o => {
      const duration = dayjs().diff(dayjs(o.orderTime), 'minute')
      return o.status !== 'completed' && duration > threshold
    }).length
  })

  const completionRate = computed(() => {
    if (totalOrders.value === 0) return 0
    return ((completedOrders.value / totalOrders.value) * 100).toFixed(1)
  })

  const activeStations = computed(() => kitchenStations.value.filter(s => s.status === 'busy').length)
  const totalStations = computed(() => kitchenStations.value.length)

  const availableStations = computed(() => {
    return kitchenStations.value.filter(s => s.status === 'idle')
  })

  let timer: number | null = null

  const updateCurrentTime = () => {
    currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
  }

  const loadOrders = async () => {
    try {
      loading.value = true
      const response = await kitchenDisplayApi.getOrders()
      orders.value = response.data
    } catch (error) {
      ElMessage.error('加载订单失败')
      console.error('加载订单失败:', error)
    } finally {
      loading.value = false
    }
  }

  const loadKitchenStations = async () => {
    try {
      loading.value = true
      const response = await kitchenDisplayApi.getKitchenStations()
      kitchenStations.value = response.data
    } catch (error) {
      ElMessage.error('加载工位信息失败')
      console.error('加载工位信息失败:', error)
    } finally {
      loading.value = false
    }
  }

  const loadSummary = async () => {
    try {
      loading.value = true
      const response = await kitchenDisplayApi.getKitchenSummary()
      summary.value = response.data
    } catch (error) {
      ElMessage.error('加载汇总信息失败')
      console.error('加载汇总信息失败:', error)
    } finally {
      loading.value = false
    }
  }

  const refreshOrders = async () => {
    try {
      loading.value = true
      await kitchenDisplayApi.refreshOrders()
      await Promise.all([loadOrders(), loadKitchenStations(), loadSummary()])
      ElMessage.success('数据已刷新')
    } catch (error) {
      ElMessage.error('刷新数据失败')
      console.error('刷新数据失败:', error)
    } finally {
      loading.value = false
    }
  }

  const startOrder = async (order: Order) => {
    try {
      await kitchenDisplayApi.startOrder(order.id)
      order.status = 'in_progress'
      order.items.forEach(item => {
        if (item.status === 'pending') {
          item.status = 'in_progress'
        }
      })
      ElMessage.success(`订单 #${order.orderNumber} 开始制作`)
    } catch (error) {
      ElMessage.error('开始制作失败')
      console.error('开始制作失败:', error)
    }
  }

  const completeOrder = async (order: Order) => {
    try {
      await kitchenDisplayApi.completeOrder(order.id)
      order.status = 'completed'
      order.items.forEach(item => {
        item.status = 'completed'
      })
      ElMessage.success(`订单 #${order.orderNumber} 已完成`)
    } catch (error) {
      ElMessage.error('完成订单失败')
      console.error('完成订单失败:', error)
    }
  }

  const pauseOrder = async (order: Order) => {
    try {
      await kitchenDisplayApi.pauseOrder(order.id)
      order.status = 'paused'
      ElMessage.info(`订单 #${order.orderNumber} 已暂停`)
    } catch (error) {
      ElMessage.error('暂停订单失败')
      console.error('暂停订单失败:', error)
    }
  }

  const completeStationOrder = async (station: KitchenStation) => {
    if (station.currentOrder) {
      try {
        await kitchenDisplayApi.completeStationOrder(station.id)
        station.currentOrder.status = 'completed'
        station.currentOrder.items.forEach(item => {
          item.status = 'completed'
        })
        station.currentOrder = undefined
        station.status = 'idle'
        station.todayCompleted++
        ElMessage.success(`工位 ${station.name} 订单已完成`)
      } catch (error) {
        ElMessage.error('完成工位订单失败')
        console.error('完成工位订单失败:', error)
      }
    }
  }

  const assignOrder = async (station: KitchenStation) => {
    showStationDialog.value = true
    stationForm.value.stationId = station.id
  }

  const confirmStationAssignment = async () => {
    try {
      const station = kitchenStations.value.find(s => s.id === stationForm.value.stationId)
      if (station) {
        const pendingOrder = pendingOrders.value[0]
        if (pendingOrder) {
          await kitchenDisplayApi.assignOrderToStation({
            stationId: station.id,
            orderId: pendingOrder.id
          })
          station.currentOrder = pendingOrder
          station.status = 'busy'
          pendingOrder.status = 'in_progress'
          pendingOrder.items.forEach(item => {
            item.status = 'in_progress'
          })
          ElMessage.success(`订单 #${pendingOrder.orderNumber} 已分配到 ${station.name}`)
        }
      }
      showStationDialog.value = false
    } catch (error) {
      ElMessage.error('分配订单失败')
      console.error('分配订单失败:', error)
    }
  }

  const viewOrderDetail = (order: Order) => {
    selectedOrder.value = order
    showOrderDetail.value = true
  }

  const getOrderCardClass = (order: Order): string => {
    const classes = ['order-card']
    if (order.status === 'pending') {
      classes.push('order-pending')
    } else if (order.status === 'in_progress') {
      classes.push('order-in-progress')
    } else if (order.status === 'completed') {
      classes.push('order-completed')
    }
    return classes.join(' ')
  }

  const getPriorityType = (priority: string): string => {
    const types: Record<string, string> = {
      high: 'danger',
      medium: 'warning',
      low: 'info'
    }
    return types[priority] || 'info'
  }

  const getOrderStatusType = (status: string): string => {
    const types: Record<string, string> = {
      pending: 'info',
      in_progress: 'warning',
      completed: 'success',
      paused: 'info'
    }
    return types[status] || 'info'
  }

  const getItemStatusType = (status: string): string => {
    const types: Record<string, string> = {
      pending: 'info',
      in_progress: 'warning',
      completed: 'success'
    }
    return types[status] || 'info'
  }

  const getStationStatusType = (status: string): string => {
    const types: Record<string, string> = {
      idle: 'success',
      busy: 'warning',
      maintenance: 'danger'
    }
    return types[status] || 'info'
  }

  const formatTime = (time: string): string => {
    return dayjs(time).format('HH:mm')
  }

  const formatDateTime = (time: string): string => {
    return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
  }

  const getDuration = (time: string): string => {
    const duration = dayjs().diff(dayjs(time), 'minute')
    if (duration < 60) {
      return `${duration}分钟`
    } else {
      const hours = Math.floor(duration / 60)
      const minutes = duration % 60
      return `${hours}小时${minutes}分钟`
    }
  }

  const isTimeout = (time: string, threshold: number = 30): boolean => {
    const duration = dayjs().diff(dayjs(time), 'minute')
    return duration > threshold
  }

  const getTimeoutOrdersCount = (threshold: number = 30): number => {
    return orders.value.filter(o => {
      return o.status !== 'completed' && isTimeout(o.orderTime, threshold)
    }).length
  }

  const getStationEfficiency = (station: KitchenStation): number => {
    if (station.todayCompleted === 0) return 0
    const efficiency = (station.todayCompleted / station.avgTime) * 100
    return Math.round(efficiency)
  }

  const getKitchenEfficiency = (): number => {
    if (completedOrders.value === 0) return 0
    const efficiency = (completedOrders.value / avgOrderTime.value) * 100
    return Math.round(efficiency)
  }

  const getPeakHours = (): string[] => {
    const hourCounts = new Map<number, number>()
    orders.value.forEach(order => {
      const hour = dayjs(order.orderTime).hour()
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1)
    })
    
    const sortedHours = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => `${hour}:00-${hour + 1}:00`)
    
    return sortedHours
  }

  const getTopDishes = (): Array<{ name: string; count: number }> => {
    const dishCounts = new Map<string, number>()
    orders.value.forEach(order => {
      order.items.forEach(item => {
        dishCounts.set(item.name, (dishCounts.get(item.name) || 0) + item.quantity)
      })
    })
    
    const sortedDishes = Array.from(dishCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))
    
    return sortedDishes
  }

  const exportOrders = async () => {
    try {
      const data = orders.value.map(order => ({
        订单号: order.orderNumber,
        客户姓名: order.customerName,
        联系电话: order.phone,
        订单时间: formatDateTime(order.orderTime),
        优先级: order.priority,
        状态: order.status,
        菜品: order.items.map(item => `${item.name}×${item.quantity}`).join(', '),
        特殊要求: order.specialRequests || '无'
      }))
      
      const headers = Object.keys(data[0]).join(',')
      const rows = data.map(row => Object.values(row).join(','))
      const csv = [headers, ...rows].join('\n')
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `厨房订单_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.csv`
      link.click()
      
      ElMessage.success('导出成功')
    } catch (error) {
      ElMessage.error('导出失败')
      console.error('导出失败:', error)
    }
  }

  onMounted(() => {
    updateCurrentTime()
    timer = window.setInterval(updateCurrentTime, 1000)
    loadOrders()
    loadKitchenStations()
    loadSummary()
  })

  onUnmounted(() => {
    if (timer) {
      clearInterval(timer)
    }
  })

  return {
    viewMode,
    currentTime,
    showOrderDetail,
    showStationDialog,
    selectedOrder,
    stationForm,
    orders,
    kitchenStations,
    summary,
    loading,
    pendingOrders,
    inProgressOrders,
    sortedOrders,
    totalOrders,
    completedOrders,
    avgOrderTime,
    timeoutOrders,
    completionRate,
    activeStations,
    totalStations,
    availableStations,
    loadOrders,
    loadKitchenStations,
    loadSummary,
    refreshOrders,
    startOrder,
    completeOrder,
    pauseOrder,
    completeStationOrder,
    assignOrder,
    confirmStationAssignment,
    viewOrderDetail,
    getOrderCardClass,
    getPriorityType,
    getOrderStatusType,
    getItemStatusType,
    getStationStatusType,
    formatTime,
    formatDateTime,
    getDuration,
    isTimeout,
    getTimeoutOrdersCount,
    getStationEfficiency,
    getKitchenEfficiency,
    getPeakHours,
    getTopDishes,
    exportOrders
  }
}
