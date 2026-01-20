/**
 * YYC³餐饮行业智能化平台 - 厨房状态管理
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { KitchenStats, KitchenStatus } from '@/types/dashboard';
import { kitchenApi } from '@/api/kitchen';

export const useKitchenStore = defineStore('kitchen', () => {
  // 状态
  const kitchenStats = ref<KitchenStats>({
    inProgress: 0,
    pending: 0,
    completed: 0,
    avgPrepTime: 0
  });
  const kitchenItems = ref<KitchenStatus[]>([]);
  const loading = ref(false);

  // 计算属性
  const isLoading = computed(() => loading.value);
  const kitchenUtilization = computed(() => {
    const total = kitchenStats.value.inProgress + kitchenStats.value.pending + kitchenStats.value.completed;
    return total > 0 ? Math.round((kitchenStats.value.inProgress / total) * 100) : 0;
  });

  const busyCount = computed(() => kitchenStats.value.inProgress + kitchenStats.value.pending);

  // 方法
  const loadKitchenStats = async () => {
    loading.value = true;
    try {
      const response = await kitchenApi.getKitchenStats();
      if (response.success) {
        kitchenStats.value = response.data;
      }
    } catch (error) {
      console.error('Failed to load kitchen stats:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const loadKitchenStatus = async () => {
    loading.value = true;
    try {
      const response = await kitchenApi.getKitchenStatus();
      if (response.success) {
        kitchenItems.value = response.data;
      }
    } catch (error) {
      console.error('Failed to load kitchen status:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updateItemStatus = async (itemId: string, status: KitchenStatus['status']) => {
    try {
      const response = await kitchenApi.updateKitchenItemStatus(itemId, status);
      if (response.success) {
        const item = kitchenItems.value.find(i => i.id === itemId);
        if (item) {
          item.status = status;
          item.updatedAt = new Date().toISOString();
        }
      }
    } catch (error) {
      console.error('Failed to update kitchen item status:', error);
      throw error;
    }
  };

  const refreshKitchenData = async () => {
    await Promise.all([
      loadKitchenStats(),
      loadKitchenStatus()
    ]);
  };

  return {
    // 状态
    kitchenStats,
    kitchenItems,
    loading,

    // 计算属性
    isLoading,
    kitchenUtilization,
    busyCount,

    // 方法
    loadKitchenStats,
    loadKitchenStatus,
    updateItemStatus,
    refreshKitchenData
  };
});
