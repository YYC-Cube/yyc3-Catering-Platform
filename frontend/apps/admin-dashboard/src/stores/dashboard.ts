/**
 * YYC³餐饮行业智能化平台 - 数据仪表板状态管理
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CoreMetrics, RevenueData, Order, OrderDistribution, TopDish, CustomerFlow } from '@/types/dashboard';
import { dashboardApi, type DashboardFilters } from '@/api/dashboard';

export const useDashboardStore = defineStore('dashboard', () => {
  // 状态
  const coreMetrics = ref<CoreMetrics>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    customerCount: 0
  });
  const revenueData = ref<RevenueData[]>([]);
  const recentOrders = ref<Order[]>([]);
  const loading = ref(false);
  const orderDistribution = ref<OrderDistribution[]>([]);
  const topDishes = ref<TopDish[]>([]);
  const customerFlow = ref<CustomerFlow[]>([]);

  // 计算属性
  const isLoading = computed(() => loading.value);
  const topPerformingItems = computed(() => {
    return topDishes.value.slice(0, 5);
  });

  // 方法
  const loadDashboardData = async (filters?: DashboardFilters) => {
    loading.value = true;
    try {
      const [metricsResponse, revenueResponse, ordersResponse, distributionResponse, dishesResponse, flowResponse] = await Promise.all([
        dashboardApi.getCoreMetrics(filters),
        dashboardApi.getRevenueData(filters),
        dashboardApi.getRecentOrders(10),
        dashboardApi.getOrderDistribution(filters),
        dashboardApi.getTopDishes(filters),
        dashboardApi.getCustomerFlow(filters)
      ]);

      if (metricsResponse.success) {
        coreMetrics.value = metricsResponse.data;
      }

      if (revenueResponse.success) {
        revenueData.value = revenueResponse.data;
      }

      if (ordersResponse.success) {
        recentOrders.value = ordersResponse.data;
      }

      if (distributionResponse.success) {
        orderDistribution.value = distributionResponse.data;
      }

      if (dishesResponse.success) {
        topDishes.value = dishesResponse.data;
      }

      if (flowResponse.success) {
        customerFlow.value = flowResponse.data;
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const exportReport = async (format: 'pdf' | 'excel' | 'csv' = 'pdf', filters?: DashboardFilters) => {
    loading.value = true;
    try {
      const blob = await dashboardApi.exportReport(format, filters);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export report:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const addOrder = async (order: Partial<Order>) => {
    loading.value = true;
    try {
      const orderTotal = order.total || Math.floor(Math.random() * 500) + 100;
      const newOrder: Order = {
        id: `order-${Date.now()}`,
        tableNumber: order.tableNumber || `T-${Math.floor(Math.random() * 20) + 1}`,
        items: order.items || Math.floor(Math.random() * 5) + 1,
        total: orderTotal,
        status: order.status || 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      recentOrders.value.unshift(newOrder);
      
      coreMetrics.value.totalOrders += 1;
      coreMetrics.value.totalRevenue += orderTotal;
      coreMetrics.value.averageOrderValue = Math.round(coreMetrics.value.totalRevenue / coreMetrics.value.totalOrders);
      
      return newOrder;
    } catch (error) {
      console.error('Failed to add order:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const order = recentOrders.value.find(o => o.id === orderId);
      if (order) {
        order.status = status;
        order.updatedAt = new Date().toISOString();
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  };

  return {
    // 状态
    coreMetrics,
    revenueData,
    recentOrders,
    loading,
    orderDistribution,
    topDishes,
    customerFlow,

    // 计算属性
    isLoading,
    topPerformingItems,

    // 方法
    loadDashboardData,
    exportReport,
    addOrder,
    updateOrderStatus
  };
});
