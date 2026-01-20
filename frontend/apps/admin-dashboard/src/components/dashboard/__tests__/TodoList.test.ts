/**
 * @fileoverview TodoList组件单元测试
 * @description 测试待办事项组件的功能
 * @module TodoList.test
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TodoList from '@/components/dashboard/TodoList.vue'
import { todoApi } from '@/api/todo'

describe('TodoList组件', () => {
  beforeEach(() => {
    vi.mock('@/api/todo')
  })

  it('应该正确渲染待办事项列表', () => {
    const wrapper = mount(TodoList)

    expect(wrapper.find('.todo-list').exists()).toBe(true)
    expect(wrapper.find('.todo-header').exists()).toBe(true)
  })

  it('应该显示待办数量徽章', () => {
    const wrapper = mount(TodoList, {
      data() {
        return {
          todos: [
            { id: '1', title: '测试', status: 'pending', priority: 'medium', reminder: false }
          ]
        }
      }
    })

    const badge = wrapper.find('.todo-header .el-badge')
    expect(badge.exists()).toBe(true)
  })

  it('应该能够添加待办事项', async () => {
    const mockCreate = vi.fn().mockResolvedValue({
      success: true,
      data: { id: '1', title: '新待办', status: 'pending', priority: 'medium', reminder: false }
    })
    vi.mocked(todoApi).createTodo = mockCreate

    const wrapper = mount(TodoList)

    wrapper.vm.todoForm = {
      title: '新待办',
      description: '测试描述',
      priority: 'medium',
      category: 'work',
      dueDate: '',
      reminder: false
    }

    await wrapper.vm.saveTodo()

    expect(mockCreate).toHaveBeenCalled()
    expect(wrapper.vm.todos.length).toBeGreaterThan(0)
  })

  it('应该能够切换待办状态', async () => {
    const mockUpdate = vi.fn().mockResolvedValue({ success: true })
    vi.mocked(todoApi).updateTodo = mockUpdate

    const wrapper = mount(TodoList, {
      data() {
        return {
          todos: [
            { id: '1', title: '测试', status: 'pending', priority: 'medium', reminder: false }
          ]
        }
      }
    })

    const todo = wrapper.vm.todos[0]
    await wrapper.vm.toggleTodoStatus(todo)

    expect(mockUpdate).toHaveBeenCalledWith('1', { status: 'completed' })
    expect(todo.status).toBe('completed')
  })

  it('应该能够删除待办事项', async () => {
    const mockDelete = vi.fn().mockResolvedValue({ success: true })
    vi.mocked(todoApi).deleteTodo = mockDelete

    const wrapper = mount(TodoList, {
      data() {
        return {
          todos: [
            { id: '1', title: '测试', status: 'pending', priority: 'medium', reminder: false }
          ]
        }
      }
    })

    const todo = wrapper.vm.todos[0]
    await wrapper.vm.deleteTodo(todo)

    expect(mockDelete).toHaveBeenCalledWith('1')
    expect(wrapper.vm.todos.length).toBe(0)
  })

  it('应该能够编辑待办事项', async () => {
    const wrapper = mount(TodoList, {
      data() {
        return {
          todos: [
            { id: '1', title: '测试', status: 'pending', priority: 'medium', reminder: false }
          ]
        }
      }
    })

    const todo = wrapper.vm.todos[0]
    await wrapper.vm.editTodo(todo)

    expect(wrapper.vm.editingTodo).toBe(todo)
    expect(wrapper.vm.showAddDialog).toBe(true)
  })

  it('应该能够筛选待办事项', () => {
    const wrapper = mount(TodoList, {
      data() {
        return {
          todos: [
            { id: '1', title: '待完成', status: 'pending', priority: 'medium', reminder: false },
            { id: '2', title: '已完成', status: 'completed', priority: 'medium', reminder: false }
          ]
        }
      }
    })

    wrapper.vm.filter.status = 'pending'

    expect(wrapper.vm.filteredTodos.length).toBe(1)
    expect(wrapper.vm.filteredTodos[0].status).toBe('pending')
  })

  it('应该能够按优先级筛选', () => {
    const wrapper = mount(TodoList, {
      data() {
        return {
          todos: [
            { id: '1', title: '高优先级', status: 'pending', priority: 'high', reminder: false },
            { id: '2', title: '中优先级', status: 'pending', priority: 'medium', reminder: false }
          ]
        }
      }
    })

    wrapper.vm.filter.priority = 'high'

    expect(wrapper.vm.filteredTodos.length).toBe(1)
    expect(wrapper.vm.filteredTodos[0].priority).toBe('high')
  })

  it('应该能够识别逾期待办', () => {
    const wrapper = mount(TodoList, {
      data() {
        return {
          todos: [
            {
              id: '1',
              title: '逾期待办',
              status: 'pending',
              priority: 'high',
              dueDate: '2024-01-01',
              reminder: false
            }
          ]
        }
      }
    })

    const todo = wrapper.vm.todos[0]
    expect(wrapper.vm.isOverdue(todo)).toBe(true)
  })

  it('应该能够清除已完成的待办', async () => {
    const mockClear = vi.fn().mockResolvedValue({ success: true })
    vi.mocked(todoApi).deleteTodo = mockClear

    const wrapper = mount(TodoList, {
      data() {
        return {
          todos: [
            { id: '1', title: '已完成', status: 'completed', priority: 'medium', reminder: false }
          ]
        }
      }
    })

    await wrapper.vm.clearCompleted()

    expect(wrapper.vm.todos.length).toBe(0)
  })

  it('应该能够导出待办事项', async () => {
    const mockExport = vi.fn().mockResolvedValue({
      success: true,
      data: new Blob(['test'], { type: 'text/csv' })
    })
    vi.mocked(todoApi).exportTodos = mockExport

    const wrapper = mount(TodoList)

    await wrapper.vm.exportTodos()

    expect(mockExport).toHaveBeenCalled()
  })

  it('应该支持拖拽排序', () => {
    const wrapper = mount(TodoList, {
      data() {
        return {
          todos: [
            { id: '1', title: '第一个', status: 'pending', priority: 'medium', reminder: false },
            { id: '2', title: '第二个', status: 'pending', priority: 'medium', reminder: false }
          ]
        }
      }
    })

    const todoItems = wrapper.findAll('.todo-item')
    expect(todoItems.length).toBe(2)
    expect(todoItems[0].attributes('draggable')).toBe('true')
  })
})
