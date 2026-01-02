import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Order, OrderItem, OrderStatus, KitchenOrder } from '@/types/order'
import { orderApi } from '@/api/order'

export interface OrderFilters {
  status?: OrderStatus[]
  tableId?: string
  customerId?: string
  dateRange?: [Date, Date]
  search?: string
}

export interface KitchenOrderFilters {
  status?: string[]
  chefId?: string
  priority?: number
}

export const useOrderStore = defineStore('order', () => {
  // 状态
  const orders = ref<Order[]>([])
  const pendingOrders = ref<Order[]>([])
  const kitchenOrders = ref<KitchenOrder[]>([])
  const currentOrder = ref<Order | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<OrderFilters>({})
  const kitchenFilters = ref<KitchenOrderFilters>({})

  // 计算属性
  const orderStats = computed(() => ({
    total: orders.value.length,
    pending: orders.value.filter(o => o.status === 'pending').length,
    preparing: orders.value.filter(o => o.status === 'preparing').length,
    ready: orders.value.filter(o => o.status === 'ready').length,
    completed: orders.value.filter(o => o.status === 'completed').length,
    cancelled: orders.value.filter(o => o.status === 'cancelled').length,
    totalRevenue: orders.value
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.totalAmount, 0)
  }))

  const kitchenStats = computed(() => ({
    total: kitchenOrders.value.length,
    inProgress: kitchenOrders.value.filter(o => o.status === 'in_progress').length,
    ready: kitchenOrders.value.filter(o => o.status === 'ready').length,
    delayed: kitchenOrders.value.filter(o => {
      if (!o.estimatedReadyTime) return false
      return new Date() > new Date(o.estimatedReadyTime) && o.status !== 'completed'
    }).length,
    avgPrepTime: calculateAveragePrepTime()
  }))

  const filteredOrders = computed(() => {
    let filtered = [...orders.value]

    if (filters.value.status?.length) {
      filtered = filtered.filter(order =>
        filters.value.status!.includes(order.status)
      )
    }

    if (filters.value.tableId) {
      filtered = filtered.filter(order =>
        order.tableId === filters.value.tableId
      )
    }

    if (filters.value.customerId) {
      filtered = filtered.filter(order =>
        order.customerId === filters.value.customerId
      )
    }

    if (filters.value.dateRange) {
      const [start, end] = filters.value.dateRange
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderTime)
        return orderDate >= start && orderDate <= end
      })
    }

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(search) ||
        order.customerName?.toLowerCase().includes(search) ||
        order.tableNumber?.toLowerCase().includes(search)
      )
    }

    return filtered.sort((a, b) =>
      new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime()
    )
  })

  const filteredKitchenOrders = computed(() => {
    let filtered = [...kitchenOrders.value]

    if (kitchenFilters.value.status?.length) {
      filtered = filtered.filter(order =>
        kitchenFilters.value.status!.includes(order.status)
      )
    }

    if (kitchenFilters.value.chefId) {
      filtered = filtered.filter(order =>
        order.assignedChefId === kitchenFilters.value.chefId
      )
    }

    if (kitchenFilters.value.priority) {
      filtered = filtered.filter(order =>
        order.priority >= kitchenFilters.value.priority!
      )
    }

    return filtered.sort((a, b) => {
      // 优先级排序，然后按时间排序
      if (a.priority !== b.priority) {
        return b.priority - a.priority
      }
      return new Date(a.orderTime).getTime() - new Date(b.orderTime).getTime()
    })
  })

  // 方法
  const loadOrders = async (params?: OrderFilters) => {
    try {
      isLoading.value = true
      error.value = null

      if (params) {
        filters.value = { ...filters.value, ...params }
      }

      const response = await orderApi.getOrders({
        ...filters.value,
        limit: 100
      })

      orders.value = response.data
      updateDerivedOrders()

    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载订单失败'
      console.error('Load orders error:', err)
    } finally {
      isLoading.value = false
    }
  }

  const loadPendingOrders = async () => {
    try {
      const response = await orderApi.getOrders({
        status: ['pending', 'confirmed'],
        limit: 50
      })
      pendingOrders.value = response.data
    } catch (err) {
      console.error('Load pending orders error:', err)
    }
  }

  const loadKitchenOrders = async () => {
    try {
      const response = await orderApi.getKitchenOrders({
        status: ['pending', 'in_progress'],
        limit: 100
      })
      kitchenOrders.value = response.data
    } catch (err) {
      console.error('Load kitchen orders error:', err)
    }
  }

  const getOrderById = async (orderId: string): Promise<Order | null> => {
    try {
      isLoading.value = true
      const response = await orderApi.getOrderById(orderId)
      currentOrder.value = response.data
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取订单详情失败'
      console.error('Get order by ID error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const createOrder = async (orderData: Partial<Order>): Promise<Order> => {
    try {
      isLoading.value = true
      const response = await orderApi.createOrder(orderData)
      const newOrder = response.data

      // 更新本地状态
      orders.value.unshift(newOrder)
      updateDerivedOrders()

      return newOrder
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建订单失败'
      console.error('Create order error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateOrder = async (orderId: string, updates: Partial<Order>): Promise<Order> => {
    try {
      isLoading.value = true
      const response = await orderApi.updateOrder(orderId, updates)
      const updatedOrder = response.data

      // 更新本地状态
      const index = orders.value.findIndex(o => o.id === orderId)
      if (index !== -1) {
        orders.value[index] = updatedOrder
      }

      if (currentOrder.value?.id === orderId) {
        currentOrder.value = updatedOrder
      }

      updateDerivedOrders()

      return updatedOrder
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新订单失败'
      console.error('Update order error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    notes?: string
  ): Promise<Order> => {
    return updateOrder(orderId, { status, notes })
  }

  const updateOrderItem = async (
    orderId: string,
    itemId: string,
    updates: Partial<OrderItem>
  ): Promise<Order> => {
    try {
      const response = await orderApi.updateOrderItem(orderId, itemId, updates)
      const updatedOrder = response.data

      // 更新本地状态
      const index = orders.value.findIndex(o => o.id === orderId)
      if (index !== -1) {
        orders.value[index] = updatedOrder
      }

      updateDerivedOrders()

      return updatedOrder
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新订单项失败'
      console.error('Update order item error:', err)
      throw err
    }
  }

  const acceptOrder = async (orderId: string): Promise<Order> => {
    try {
      const response = await orderApi.acceptOrder(orderId)
      const updatedOrder = response.data

      // 更新本地状态
      const index = orders.value.findIndex(o => o.id === orderId)
      if (index !== -1) {
        orders.value[index] = updatedOrder
      }

      updateDerivedOrders()

      return updatedOrder
    } catch (err) {
      error.value = err instanceof Error ? err.message : '接单失败'
      console.error('Accept order error:', err)
      throw err
    }
  }

  const rejectOrder = async (orderId: string, reason: string): Promise<Order> => {
    try {
      const response = await orderApi.rejectOrder(orderId, reason)
      const updatedOrder = response.data

      // 更新本地状态
      const index = orders.value.findIndex(o => o.id === orderId)
      if (index !== -1) {
        orders.value[index] = updatedOrder
      }

      updateDerivedOrders()

      return updatedOrder
    } catch (err) {
      error.value = err instanceof Error ? err.message : '拒单失败'
      console.error('Reject order error:', err)
      throw err
    }
  }

  const cancelOrder = async (orderId: string, reason: string): Promise<Order> => {
    try {
      const response = await orderApi.cancelOrder(orderId, reason)
      const updatedOrder = response.data

      // 更新本地状态
      const index = orders.value.findIndex(o => o.id === orderId)
      if (index !== -1) {
        orders.value[index] = updatedOrder
      }

      updateDerivedOrders()

      return updatedOrder
    } catch (err) {
      error.value = err instanceof Error ? err.message : '取消订单失败'
      console.error('Cancel order error:', err)
      throw err
    }
  }

  const assignChef = async (orderId: string, chefId: string): Promise<Order> => {
    return updateOrder(orderId, { assignedChefId: chefId })
  }

  const updateKitchenOrder = async (kitchenOrder: KitchenOrder): Promise<void> => {
    try {
      await orderApi.updateKitchenOrder(kitchenOrder.id, kitchenOrder)

      // 更新本地状态
      const index = kitchenOrders.value.findIndex(k => k.id === kitchenOrder.id)
      if (index !== -1) {
        kitchenOrders.value[index] = kitchenOrder
      }
    } catch (err) {
      console.error('Update kitchen order error:', err)
    }
  }

  const setFilters = (newFilters: OrderFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const setKitchenFilters = (newFilters: KitchenOrderFilters) => {
    kitchenFilters.value = { ...kitchenFilters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {}
    kitchenFilters.value = {}
  }

  const refreshOrders = async () => {
    await Promise.all([
      loadOrders(),
      loadPendingOrders(),
      loadKitchenOrders()
    ])
  }

  // 私有方法
  const updateDerivedOrders = () => {
    // 更新待处理订单
    pendingOrders.value = orders.value.filter(order =>
      ['pending', 'confirmed'].includes(order.status)
    )

    // 更新厨房订单
    kitchenOrders.value = orders.value
      .filter(order => ['confirmed', 'preparing'].includes(order.status))
      .map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        tableNumber: order.tableNumber,
        customerName: order.customerName,
        items: order.items.map(item => ({
          id: item.id,
          dishName: item.dishName,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions,
          status: item.kitchenStatus || 'pending',
          preparationTime: item.preparationTime || 0
        })),
        priority: order.priority,
        status: order.status === 'preparing' ? 'in_progress' : 'pending',
        orderTime: order.orderTime,
        estimatedReadyTime: order.estimatedReadyTime,
        assignedChefId: order.assignedChefId,
        notes: order.kitchenNotes
      }))
  }

  const calculateAveragePrepTime = (): number => {
    const completedOrders = kitchenOrders.value.filter(o =>
      o.status === 'completed' && o.preparationTime
    )

    if (completedOrders.length === 0) return 0

    const totalTime = completedOrders.reduce((sum, order) =>
      sum + order.preparationTime!, 0
    )

    return Math.round(totalTime / completedOrders.length)
  }

  return {
    // 状态
    orders,
    pendingOrders,
    kitchenOrders,
    currentOrder,
    isLoading,
    error,
    filters,
    kitchenFilters,

    // 计算属性
    orderStats,
    kitchenStats,
    filteredOrders,
    filteredKitchenOrders,

    // 方法
    loadOrders,
    loadPendingOrders,
    loadKitchenOrders,
    getOrderById,
    createOrder,
    updateOrder,
    updateOrderStatus,
    updateOrderItem,
    acceptOrder,
    rejectOrder,
    cancelOrder,
    assignChef,
    updateKitchenOrder,
    setFilters,
    setKitchenFilters,
    clearFilters,
    refreshOrders
  }
})