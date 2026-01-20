/**
 * @fileoverview 待办事项API接口
 * @description 提供待办事项相关的API接口
 * @module todo
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { request } from '@/utils/request'

export enum TodoStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed'
}

export enum TodoPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export interface Todo {
  id: string
  title: string
  description?: string
  status: TodoStatus
  priority: TodoPriority
  category?: string
  dueDate?: string
  reminder: boolean
  createdAt: string
  updatedAt: string
}

export interface TodoFilter {
  status?: TodoStatus
  priority?: TodoPriority
  category?: string
  startDate?: string
  endDate?: string
  keyword?: string
}

/**
 * 获取待办事项列表
 */
export const getTodos = async (filter?: TodoFilter) => {
  return request.get<Todo[]>('/api/v1/todos', { params: filter })
}

/**
 * 获取待办事项详情
 */
export const getTodo = async (todoId: string) => {
  return request.get<Todo>(`/api/v1/todos/${todoId}`)
}

/**
 * 创建待办事项
 */
export const createTodo = async (todo: Partial<Todo>) => {
  return request.post<Todo>('/api/v1/todos', todo)
}

/**
 * 更新待办事项
 */
export const updateTodo = async (todoId: string, updates: Partial<Todo>) => {
  return request.put<Todo>(`/api/v1/todos/${todoId}`, updates)
}

/**
 * 删除待办事项
 */
export const deleteTodo = async (todoId: string) => {
  return request.delete(`/api/v1/todos/${todoId}`)
}

/**
 * 批量删除待办事项
 */
export const batchDeleteTodos = async (todoIds: string[]) => {
  return request.post('/api/v1/todos/batch-delete', { todoIds })
}

/**
 * 重新排序待办事项
 */
export const reorderTodos = async (todoIds: string[]) => {
  return request.post('/api/v1/todos/reorder', { todoIds })
}

/**
 * 标记待办为已完成
 */
export const markAsCompleted = async (todoId: string) => {
  return request.patch(`/api/v1/todos/${todoId}/complete`)
}

/**
 * 批量标记待办为已完成
 */
export const batchMarkAsCompleted = async (todoIds: string[]) => {
  return request.post('/api/v1/todos/batch-complete', { todoIds })
}

/**
 * 清除已完成的待办
 */
export const clearCompleted = async () => {
  return request.delete('/api/v1/todos/completed')
}

/**
 * 导出待办事项
 */
export const exportTodos = async () => {
  return request.get('/api/v1/todos/export', {
    responseType: 'blob'
  })
}

/**
 * 获取待办统计
 */
export const getTodoStats = async () => {
  return request.get<{
    total: number
    pending: number
    inProgress: number
    completed: number
    overdue: number
  }>('/api/v1/todos/stats')
}

export const todoApi = {
  getTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
  batchDeleteTodos,
  reorderTodos,
  markAsCompleted,
  batchMarkAsCompleted,
  clearCompleted,
  exportTodos,
  getTodoStats
}
