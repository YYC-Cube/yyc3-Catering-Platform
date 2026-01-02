/**
 * YYC³餐饮行业智能化平台 - 桌台状态管理
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Table } from '@/types/dashboard'

export const useTableStore = defineStore('table', () => {
  // 状态
  const tableStatus = ref<Table[]>([])
  
  // 方法
  const refreshTableStatus = async () => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300))
      await loadTableStatus()
    } catch (error) {
      console.error('Failed to refresh table status:', error)
      throw error
    }
  }

  const loadTableStatus = async () => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // 模拟数据 - 实际项目中应替换为真实API调用
      tableStatus.value = Array.from({ length: 20 }, (_, i) => {
        const statusOptions: Table['status'][] = ['available', 'occupied', 'reserved', 'maintenance'];
        return {
          id: `table-${i + 1}`,
          number: `${i + 1}`,
          status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
          capacity: Math.floor(Math.random() * 4) + 2,
          area: `区域${Math.floor(i / 5) + 1}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      })
    } catch (error) {
      console.error('Failed to load table status:', error)
      throw error
    }
  }

  const updateTableStatus = async (tableId: string, status: Table['status']) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 150))
      
      const table = tableStatus.value.find(table => table.id === tableId)
      if (table) {
        table.status = status
        table.updatedAt = new Date().toISOString()
      }
    } catch (error) {
      console.error('Failed to update table status:', error)
      throw error
    }
  }
  
  // 计算属性（通过函数实现）
  const availableTables = () => tableStatus.value.filter(table => table.status === 'available')
  const occupiedTables = () => tableStatus.value.filter(table => table.status === 'occupied')
  const reservedTables = () => tableStatus.value.filter(table => table.status === 'reserved')
  const totalTables = () => tableStatus.value.length

  return {
    // 状态
    tableStatus,
    
    // 计算属性
    availableTables,
    occupiedTables,
    reservedTables,
    totalTables,
    
    // 方法
    refreshTableStatus,
    loadTableStatus,
    updateTableStatus
  }
})
