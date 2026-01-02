/**
 * YYC³餐饮行业智能化平台 - 数据仪表板状态管理
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CoreMetrics, RevenueData, Order, OrderDistribution, TopDish, CustomerFlow } from '@/types/dashboard';

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
    // 模拟计算，实际项目中应根据订单数据计算
    return [];
  });

  // 方法
  const loadDashboardData = async () => {
    loading.value = true;
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));

      // 模拟数据 - 实际项目中应替换为真实API调用
      coreMetrics.value = {
        totalRevenue: 28500,
        totalOrders: 125,
        averageOrderValue: 228,
        customerCount: 89,
        orderChange: 12.5,
        revenueChange: 8.3
      };

      // 模拟收入数据
      revenueData.value = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - 6 + i);
        const revenue = Math.floor(Math.random() * 5000) + 2000;
        return {
          date: date.toISOString().split('T')[0],
          amount: revenue, // amount字段替换原来的revenue
          orders: Math.floor(Math.random() * 20) + 10,
          customers: Math.floor(Math.random() * 30) + 20
        };
      });

      // 模拟最近订单数据
      const orderStatuses: Array<'pending' | 'in-progress' | 'completed' | 'cancelled'> = ['completed', 'in-progress', 'pending'];
      recentOrders.value = Array.from({ length: 5 }, (_, i) => ({
        id: `order-${Date.now() + i}`,
        tableNumber: `Table ${Math.floor(Math.random() * 15) + 1}`,
        items: Math.floor(Math.random() * 8) + 1,
        total: Math.floor(Math.random() * 1000) + 200,
        status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
        createdAt: new Date(Date.now() - i * 1000 * 60 * 30).toISOString(), // 过去30分钟内的订单
        updatedAt: new Date(Date.now() - i * 1000 * 60 * 30).toISOString()
      }));

      // 模拟订单分布数据
      const totalOrders = 128;
      orderDistribution.value = [
        { status: 'pending', count: 12, percentage: Math.round((12 / totalOrders) * 100) },
        { status: 'in-progress', count: 8, percentage: Math.round((8 / totalOrders) * 100) },
        { status: 'completed', count: 105, percentage: Math.round((105 / totalOrders) * 100) },
        { status: 'cancelled', count: 3, percentage: Math.round((3 / totalOrders) * 100) }
      ];

      // 模拟热门菜品数据
      topDishes.value = [
        { id: 'dish-1', name: '招牌红烧肉', sales: 45, revenue: 2700, percentage: 35 },
        { id: 'dish-2', name: '清蒸鲈鱼', sales: 38, revenue: 3040, percentage: 30 },
        { id: 'dish-3', name: '宫保鸡丁', sales: 52, revenue: 2080, percentage: 35 }
      ];

      // 模拟客户流量数据
      customerFlow.value = Array.from({ length: 12 }, (_, i) => ({
        hour: i + 10, // 10点到21点
        count: Math.floor(Math.random() * 25) + 5
      }));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      loading.value = false;
    }
  };

  const exportReport = async (format: 'pdf' | 'excel' | 'csv' = 'pdf') => {
    loading.value = true;
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟导出逻辑
      console.log(`Exporting report in ${format} format...`);
      
      // 模拟下载URL
      const mockDownloadUrl = URL.createObjectURL(new Blob(['Mock report data'], { type: 'application/octet-stream' }));
      const a = document.createElement('a');
      a.href = mockDownloadUrl;
      a.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(mockDownloadUrl);
    } catch (error) {
      console.error('Failed to export report:', error);
    } finally {
      loading.value = false;
    }
  };

  const addOrder = async (order: Partial<Order>) => {
    loading.value = true;
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 模拟创建新订单
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
      
      // 添加到最近订单列表
      recentOrders.value.unshift(newOrder);
      
      // 更新核心指标
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
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // 更新本地订单状态
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
