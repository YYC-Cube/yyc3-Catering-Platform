/**
 * @fileoverview YYC³餐饮平台 - 厨房管理Composable
 * @description 厨房管理模块状态管理和业务逻辑
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { kitchenAPI } from '@/api/kitchen';
import type {
  KitchenEquipment,
  KitchenEmployee,
  KitchenTask,
  KitchenInventory,
  HygieneRecord,
  SafetyRecord,
  KitchenStats,
  KitchenAnalytics,
  KitchenDisplay,
  EquipmentQueryParams,
  EmployeeQueryParams,
  TaskQueryParams,
  InventoryQueryParams,
  TaskStatus,
  EmployeeStatus
} from '@/types/kitchen';

export function useKitchen() {
  const loading = ref(false);
  const stats = ref<KitchenStats>({
    activeTasks: 0,
    completedToday: 0,
    efficiencyRate: 0,
    averagePreparationTime: 0,
    totalEmployees: 0,
    onlineEmployees: 0,
    totalEquipment: 0,
    normalEquipment: 0,
    maintenanceEquipment: 0,
    lowStockItems: 0,
    expiredItems: 0
  });
  const analytics = ref<KitchenAnalytics | null>(null);
  const equipment = ref<KitchenEquipment[]>([]);
  const employees = ref<KitchenEmployee[]>([]);
  const tasks = ref<KitchenTask[]>([]);
  const inventory = ref<KitchenInventory[]>([]);
  const hygieneRecords = ref<HygieneRecord[]>([]);
  const safetyRecords = ref<SafetyRecord[]>([]);
  const displays = ref<KitchenDisplay[]>([]);

  const equipmentPagination = ref({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const employeePagination = ref({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const taskPagination = ref({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const inventoryPagination = ref({ page: 1, limit: 20, total: 0, totalPages: 0 });

  let refreshInterval: number | null = null;

  const isLoading = computed(() => loading.value);
  const equipmentUtilization = computed(() => {
    const total = stats.value.totalEquipment;
    return total > 0 ? Math.round((stats.value.normalEquipment / total) * 100) : 0;
  });
  const employeeOnlineRate = computed(() => {
    const total = stats.value.totalEmployees;
    return total > 0 ? Math.round((stats.value.onlineEmployees / total) * 100) : 0;
  });

  const loadStats = async () => {
    try {
      const response = await kitchenAPI.getStats();
      if (response.success) {
        stats.value = response.data;
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  const loadAnalytics = async (params: { startDate: string; endDate: string }) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.getAnalytics(params);
      if (response.success) {
        analytics.value = response.data;
      }
    } catch (error) {
      console.error('加载分析数据失败:', error);
    } finally {
      loading.value = false;
    }
  };

  const loadEquipment = async (params?: EquipmentQueryParams) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.getEquipment(params);
      if (response.success) {
        equipment.value = response.data.items;
        equipmentPagination.value = response.data.pagination;
      }
    } catch (error) {
      console.error('加载设备列表失败:', error);
    } finally {
      loading.value = false;
    }
  };

  const createEquipment = async (data: Partial<KitchenEquipment>) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.createEquipment(data);
      if (response.success) {
        ElMessage.success('设备创建成功');
        await loadEquipment();
        return response.data;
      }
    } catch (error) {
      ElMessage.error('设备创建失败');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updateEquipment = async (id: string, data: Partial<KitchenEquipment>) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.updateEquipment(id, data);
      if (response.success) {
        ElMessage.success('设备更新成功');
        await loadEquipment();
        return response.data;
      }
    } catch (error) {
      ElMessage.error('设备更新失败');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const deleteEquipment = async (id: string) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.deleteEquipment(id);
      if (response.success) {
        ElMessage.success('设备删除成功');
        await loadEquipment();
      }
    } catch (error) {
      ElMessage.error('设备删除失败');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const loadEmployees = async (params?: EmployeeQueryParams) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.getEmployees(params);
      if (response.success) {
        employees.value = response.data.items;
        employeePagination.value = response.data.pagination;
      }
    } catch (error) {
      console.error('加载员工列表失败:', error);
    } finally {
      loading.value = false;
    }
  };

  const createEmployee = async (data: Partial<KitchenEmployee>) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.createEmployee(data);
      if (response.success) {
        ElMessage.success('员工创建成功');
        await loadEmployees();
        return response.data;
      }
    } catch (error) {
      ElMessage.error('员工创建失败');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updateEmployee = async (id: string, data: Partial<KitchenEmployee>) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.updateEmployee(id, data);
      if (response.success) {
        ElMessage.success('员工更新成功');
        await loadEmployees();
        return response.data;
      }
    } catch (error) {
      ElMessage.error('员工更新失败');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.deleteEmployee(id);
      if (response.success) {
        ElMessage.success('员工删除成功');
        await loadEmployees();
      }
    } catch (error) {
      ElMessage.error('员工删除失败');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updateEmployeeStatus = async (id: string, status: EmployeeStatus) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.updateEmployeeStatus(id, status);
      if (response.success) {
        ElMessage.success('员工状态更新成功');
        await loadEmployees();
        return response.data;
      }
    } catch (error) {
      ElMessage.error('员工状态更新失败');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const loadTasks = async (params?: TaskQueryParams) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.getTasks(params);
      if (response.success) {
        tasks.value = response.data.items;
        taskPagination.value = response.data.pagination;
      }
    } catch (error) {
      console.error('加载任务列表失败:', error);
    } finally {
      loading.value = false;
    }
  };

  const createTask = async (data: Partial<KitchenTask>) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.createTask(data);
      if (response.success) {
        ElMessage.success('任务创建成功');
        await loadTasks();
        return response.data;
      }
    } catch (error) {
      ElMessage.error('任务创建失败');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updateTask = async (id: string, data: Partial<KitchenTask>) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.updateTask(id, data);
      if (response.success) {
        ElMessage.success('任务更新成功');
        await loadTasks();
        return response.data;
      }
    } catch (error) {
      ElMessage.error('任务更新失败');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.deleteTask(id);
      if (response.success) {
        ElMessage.success('任务删除成功');
        await loadTasks();
      }
    } catch (error) {
      ElMessage.error('任务删除失败');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.updateTaskStatus(id, status);
      if (response.success) {
        ElMessage.success('任务状态更新成功');
        await loadTasks();
        return response.data;
      }
    } catch (error) {
      ElMessage.error('任务状态更新失败');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const assignTask = async (taskId: string, employeeId: string) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.assignTask(taskId, employeeId);
      if (response.success) {
        ElMessage.success('任务分配成功');
        await loadTasks();
        return response.data;
      }
    } catch (error) {
      ElMessage.error('任务分配失败');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const loadInventory = async (params?: InventoryQueryParams) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.getInventory(params);
      if (response.success) {
        inventory.value = response.data.items;
        inventoryPagination.value = response.data.pagination;
      }
    } catch (error) {
      console.error('加载库存列表失败:', error);
    } finally {
      loading.value = false;
    }
  };

  const createInventoryItem = async (data: Partial<KitchenInventory>) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.createInventoryItem(data);
      if (response.success) {
        ElMessage.success('库存项创建成功');
        await loadInventory();
        return response.data;
      }
    } catch (error) {
      ElMessage.error('库存项创建失败');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updateInventoryItem = async (id: string, data: Partial<KitchenInventory>) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.updateInventoryItem(id, data);
      if (response.success) {
        ElMessage.success('库存项更新成功');
        await loadInventory();
        return response.data;
      }
    } catch (error) {
      ElMessage.error('库存项更新失败');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const deleteInventoryItem = async (id: string) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.deleteInventoryItem(id);
      if (response.success) {
        ElMessage.success('库存项删除成功');
        await loadInventory();
      }
    } catch (error) {
      ElMessage.error('库存项删除失败');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const restockInventory = async (id: string, quantity: number) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.restockInventory(id, quantity);
      if (response.success) {
        ElMessage.success('补货成功');
        await loadInventory();
        return response.data;
      }
    } catch (error) {
      ElMessage.error('补货失败');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const loadHygieneRecords = async (params?: any) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.getHygieneRecords(params);
      if (response.success) {
        hygieneRecords.value = response.data.items;
      }
    } catch (error) {
      console.error('加载卫生记录失败:', error);
    } finally {
      loading.value = false;
    }
  };

  const createHygieneRecord = async (data: Partial<HygieneRecord>) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.createHygieneRecord(data);
      if (response.success) {
        ElMessage.success('卫生记录创建成功');
        await loadHygieneRecords();
        return response.data;
      }
    } catch (error) {
      ElMessage.error('卫生记录创建失败');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updateHygieneRecord = async (id: string, data: Partial<HygieneRecord>) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.updateHygieneRecord(id, data);
      if (response.success) {
        ElMessage.success('卫生记录更新成功');
        await loadHygieneRecords();
        return response.data;
      }
    } catch (error) {
      ElMessage.error('卫生记录更新失败');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const loadSafetyRecords = async (params?: any) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.getSafetyRecords(params);
      if (response.success) {
        safetyRecords.value = response.data.items;
      }
    } catch (error) {
      console.error('加载安全记录失败:', error);
    } finally {
      loading.value = false;
    }
  };

  const createSafetyRecord = async (data: Partial<SafetyRecord>) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.createSafetyRecord(data);
      if (response.success) {
        ElMessage.success('安全记录创建成功');
        await loadSafetyRecords();
        return response.data;
      }
    } catch (error) {
      ElMessage.error('安全记录创建失败');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updateSafetyRecord = async (id: string, data: Partial<SafetyRecord>) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.updateSafetyRecord(id, data);
      if (response.success) {
        ElMessage.success('安全记录更新成功');
        await loadSafetyRecords();
        return response.data;
      }
    } catch (error) {
      ElMessage.error('安全记录更新失败');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const loadDisplays = async () => {
    try {
      loading.value = true;
      const response = await kitchenAPI.getDisplays();
      if (response.success) {
        displays.value = response.data;
      }
    } catch (error) {
      console.error('加载显示配置失败:', error);
    } finally {
      loading.value = false;
    }
  };

  const createDisplay = async (data: Partial<KitchenDisplay>) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.createDisplay(data);
      if (response.success) {
        ElMessage.success('显示配置创建成功');
        await loadDisplays();
        return response.data;
      }
    } catch (error) {
      ElMessage.error('显示配置创建失败');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updateDisplay = async (id: string, data: Partial<KitchenDisplay>) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.updateDisplay(id, data);
      if (response.success) {
        ElMessage.success('显示配置更新成功');
        await loadDisplays();
        return response.data;
      }
    } catch (error) {
      ElMessage.error('显示配置更新失败');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const deleteDisplay = async (id: string) => {
    try {
      loading.value = true;
      const response = await kitchenAPI.deleteDisplay(id);
      if (response.success) {
        ElMessage.success('显示配置删除成功');
        await loadDisplays();
      }
    } catch (error) {
      ElMessage.error('显示配置删除失败');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const refreshData = async () => {
    await Promise.all([
      loadStats(),
      loadTasks(),
      loadEmployees()
    ]);
  };

  const startAutoRefresh = (interval: number = 30000) => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    refreshInterval = window.setInterval(() => {
      refreshData();
    }, interval);
  };

  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  };

  onMounted(() => {
    refreshData();
    startAutoRefresh();
  });

  onUnmounted(() => {
    stopAutoRefresh();
  });

  return {
    loading,
    stats,
    analytics,
    equipment,
    employees,
    tasks,
    inventory,
    hygieneRecords,
    safetyRecords,
    displays,
    equipmentPagination,
    employeePagination,
    taskPagination,
    inventoryPagination,
    isLoading,
    equipmentUtilization,
    employeeOnlineRate,
    loadStats,
    loadAnalytics,
    loadEquipment,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    loadEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    updateEmployeeStatus,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    assignTask,
    loadInventory,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    restockInventory,
    loadHygieneRecords,
    createHygieneRecord,
    updateHygieneRecord,
    loadSafetyRecords,
    createSafetyRecord,
    updateSafetyRecord,
    loadDisplays,
    createDisplay,
    updateDisplay,
    deleteDisplay,
    refreshData,
    startAutoRefresh,
    stopAutoRefresh
  };
}
