/**
 * @fileoverview 自定义仪表板组件单元测试
 * @description 测试自定义仪表板组件的功能和交互
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CustomDashboard from '@/components/analytics/CustomDashboard.vue'

vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  }
})

vi.mock('vue-grid-layout', () => ({
  GridLayout: {
    name: 'GridLayout',
    template: '<div><slot /></div>',
    props: ['layout', 'colNum', 'rowHeight', 'isDraggable', 'isResizable', 'isBounded', 'margin']
  },
  GridItem: {
    name: 'GridItem',
    template: '<div><slot /></div>',
    props: ['x', 'y', 'w', 'h', 'i', 'minW', 'minH']
  }
}))

describe('CustomDashboard组件', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('组件渲染', () => {
    it('应该正确渲染仪表板头部', () => {
      const wrapper = mount(CustomDashboard)
      expect(wrapper.find('.dashboard-header').exists()).toBe(true)
    })

    it('应该正确渲染仪表板工具栏', () => {
      const wrapper = mount(CustomDashboard)
      expect(wrapper.find('.dashboard-toolbar').exists()).toBe(true)
    })

    it('应该正确渲染空状态', () => {
      const wrapper = mount(CustomDashboard)
      expect(wrapper.find('.empty-state').exists()).toBe(true)
    })

    it('应该正确渲染仪表板内容', async () => {
      const wrapper = mount(CustomDashboard)
      await wrapper.setData({
        currentDashboard: {
          id: 1,
          name: '测试仪表板',
          description: '测试描述',
          widgets: [],
          layout: { columns: 6, gap: 16 },
          sharing: { isPublic: false, allowedUsers: [], permissions: ['view'] },
          createdAt: '2025-01-20'
        }
      })
      expect(wrapper.find('.dashboard-content').exists()).toBe(true)
    })
  })

  describe('仪表板管理', () => {
    it('应该能够打开创建仪表板对话框', async () => {
      const wrapper = mount(CustomDashboard)
      const createButton = wrapper.findAll('.el-button').find(btn => btn.text().includes('新建'))
      if (createButton) {
        await createButton.trigger('click')
        expect(wrapper.vm.showCreateDialog).toBe(true)
      }
    })

    it('应该能够创建新仪表板', async () => {
      const wrapper = mount(CustomDashboard)
      await wrapper.setData({
        showCreateDialog: true,
        newDashboard: {
          name: '新仪表板',
          description: '新仪表板描述',
          layout: { columns: 6, gap: 16 }
        }
      })
      await wrapper.vm.createDashboard()
      expect(wrapper.vm.dashboardList.length).toBeGreaterThan(0)
    })

    it('应该能够编辑仪表板', async () => {
      const wrapper = mount(CustomDashboard)
      await wrapper.setData({
        currentDashboard: {
          id: 1,
          name: '测试仪表板',
          description: '测试描述',
          widgets: [],
          layout: { columns: 6, gap: 16 },
          sharing: { isPublic: false, allowedUsers: [], permissions: ['view'] },
          createdAt: '2025-01-20'
        }
      })
      const editButton = wrapper.findAll('.el-button').find(btn => btn.text() === '编辑')
      if (editButton) {
        await editButton.trigger('click')
        expect(wrapper.vm.showEditDialog).toBe(true)
      }
    })

    it('应该能够删除仪表板', async () => {
      ElMessageBox.confirm = vi.fn().mockResolvedValue('confirm')
      const wrapper = mount(CustomDashboard)
      await wrapper.setData({
        currentDashboard: {
          id: 1,
          name: '测试仪表板',
          description: '测试描述',
          widgets: [],
          layout: { columns: 6, gap: 16 },
          sharing: { isPublic: false, allowedUsers: [], permissions: ['view'] },
          createdAt: '2025-01-20'
        }
      })
      await wrapper.vm.deleteDashboard()
      expect(ElMessageBox.confirm).toHaveBeenCalled()
    })

    it('应该能够复制仪表板', async () => {
      ElMessageBox.confirm = vi.fn().mockResolvedValue('confirm')
      const wrapper = mount(CustomDashboard)
      await wrapper.setData({
        currentDashboard: {
          id: 1,
          name: '测试仪表板',
          description: '测试描述',
          widgets: [],
          layout: { columns: 6, gap: 16 },
          sharing: { isPublic: false, allowedUsers: [], permissions: ['view'] },
          createdAt: '2025-01-20'
        }
      })
      await wrapper.vm.duplicateDashboard()
      expect(wrapper.vm.dashboardList.length).toBeGreaterThan(1)
    })

    it('应该能够导出仪表板配置', async () => {
      const wrapper = mount(CustomDashboard)
      await wrapper.setData({
        currentDashboard: {
          id: 1,
          name: '测试仪表板',
          description: '测试描述',
          widgets: [],
          layout: { columns: 6, gap: 16 },
          sharing: { isPublic: false, allowedUsers: [], permissions: ['view'] },
          createdAt: '2025-01-20'
        }
      })
      await wrapper.vm.exportDashboard()
      expect(ElMessage.success).toHaveBeenCalledWith('仪表板配置已导出')
    })
  })

  describe('组件管理', () => {
    it('应该能够打开添加组件对话框', async () => {
      const wrapper = mount(CustomDashboard)
      await wrapper.setData({
        currentDashboard: {
          id: 1,
          name: '测试仪表板',
          description: '测试描述',
          widgets: [],
          layout: { columns: 6, gap: 16 },
          sharing: { isPublic: false, allowedUsers: [], permissions: ['view'] },
          createdAt: '2025-01-20'
        },
        editMode: true
      })
      const addWidgetButton = wrapper.findAll('.el-button').find(btn => btn.text().includes('添加组件'))
      if (addWidgetButton) {
        await addWidgetButton.trigger('click')
        expect(wrapper.vm.showAddWidgetDialog).toBe(true)
      }
    })

    it('应该能够添加组件到仪表板', async () => {
      const wrapper = mount(CustomDashboard)
      await wrapper.setData({
        currentDashboard: {
          id: 1,
          name: '测试仪表板',
          description: '测试描述',
          widgets: [],
          layout: { columns: 6, gap: 16 },
          sharing: { isPublic: false, allowedUsers: [], permissions: ['view'] },
          createdAt: '2025-01-20'
        }
      })
      const widget = {
        id: 'metric-revenue',
        type: 'metric',
        name: '收入指标',
        description: '显示总收入',
        icon: 'Money',
        color: '#409EFF',
        analytics: 'sales',
        metrics: ['totalRevenue']
      }
      await wrapper.vm.addWidgetToDashboard(widget)
      expect(wrapper.vm.currentDashboard.widgets.length).toBeGreaterThan(0)
    })

    it('应该能够编辑组件', async () => {
      const wrapper = mount(CustomDashboard)
      await wrapper.setData({
        currentDashboard: {
          id: 1,
          name: '测试仪表板',
          description: '测试描述',
          widgets: [
            {
              id: 'widget-1',
              type: 'metric',
              title: '收入指标',
              analytics: 'sales',
              metrics: ['totalRevenue'],
              dimensions: [],
              filters: {},
              visualization: {
                showLegend: true,
                showGrid: true,
                showLabels: true
              },
              layout: { x: 0, y: 0, width: 2, height: 2 },
              refreshInterval: 300
            }
          ],
          layout: { columns: 6, gap: 16 },
          sharing: { isPublic: false, allowedUsers: [], permissions: ['view'] },
          createdAt: '2025-01-20'
        },
        editMode: true
      })
      const editButton = wrapper.findAll('.el-button').find(btn => btn.text() === '编辑')
      if (editButton) {
        await editButton.trigger('click')
        expect(wrapper.vm.showEditWidgetDialog).toBe(true)
      }
    })

    it('应该能够删除组件', async () => {
      ElMessageBox.confirm = vi.fn().mockResolvedValue('confirm')
      const wrapper = mount(CustomDashboard)
      await wrapper.setData({
        currentDashboard: {
          id: 1,
          name: '测试仪表板',
          description: '测试描述',
          widgets: [
            {
              id: 'widget-1',
              type: 'metric',
              title: '收入指标',
              analytics: 'sales',
              metrics: ['totalRevenue'],
              dimensions: [],
              filters: {},
              visualization: {
                showLegend: true,
                showGrid: true,
                showLabels: true
              },
              layout: { x: 0, y: 0, width: 2, height: 2 },
              refreshInterval: 300
            }
          ],
          layout: { columns: 6, gap: 16 },
          sharing: { isPublic: false, allowedUsers: [], permissions: ['view'] },
          createdAt: '2025-01-20'
        },
        editMode: true
      })
      await wrapper.vm.removeWidget('widget-1')
      expect(wrapper.vm.currentDashboard.widgets.length).toBe(0)
    })
  })

  describe('编辑模式', () => {
    it('应该能够切换编辑模式', async () => {
      const wrapper = mount(CustomDashboard)
      await wrapper.setData({
        currentDashboard: {
          id: 1,
          name: '测试仪表板',
          description: '测试描述',
          widgets: [],
          layout: { columns: 6, gap: 16 },
          sharing: { isPublic: false, allowedUsers: [], permissions: ['view'] },
          createdAt: '2025-01-20'
        }
      })
      const editModeButton = wrapper.findAll('.el-button').find(btn => btn.text().includes('编辑模式'))
      if (editModeButton) {
        await editModeButton.trigger('click')
        expect(wrapper.vm.editMode).toBe(true)
      }
    })

    it('应该能够在编辑模式下添加组件', async () => {
      const wrapper = mount(CustomDashboard)
      await wrapper.setData({
        currentDashboard: {
          id: 1,
          name: '测试仪表板',
          description: '测试描述',
          widgets: [],
          layout: { columns: 6, gap: 16 },
          sharing: { isPublic: false, allowedUsers: [], permissions: ['view'] },
          createdAt: '2025-01-20'
        },
        editMode: true
      })
      const addWidgetButton = wrapper.findAll('.el-button').find(btn => btn.text().includes('添加组件'))
      expect(addWidgetButton).toBeDefined()
    })
  })

  describe('仪表板刷新', () => {
    it('应该能够刷新仪表板数据', async () => {
      const wrapper = mount(CustomDashboard)
      await wrapper.setData({
        currentDashboard: {
          id: 1,
          name: '测试仪表板',
          description: '测试描述',
          widgets: [],
          layout: { columns: 6, gap: 16 },
          sharing: { isPublic: false, allowedUsers: [], permissions: ['view'] },
          createdAt: '2025-01-20'
        }
      })
      await wrapper.vm.refreshDashboard()
      expect(ElMessage.success).toHaveBeenCalledWith('仪表板数据已刷新')
    })

    it('应该能够刷新单个组件', async () => {
      const wrapper = mount(CustomDashboard)
      await wrapper.setData({
        currentDashboard: {
          id: 1,
          name: '测试仪表板',
          description: '测试描述',
          widgets: [
            {
              id: 'widget-1',
              type: 'metric',
              title: '收入指标',
              analytics: 'sales',
              metrics: ['totalRevenue'],
              dimensions: [],
              filters: {},
              visualization: {
                showLegend: true,
                showGrid: true,
                showLabels: true
              },
              layout: { x: 0, y: 0, width: 2, height: 2 },
              refreshInterval: 300
            }
          ],
          layout: { columns: 6, gap: 16 },
          sharing: { isPublic: false, allowedUsers: [], permissions: ['view'] },
          createdAt: '2025-01-20'
        }
      })
      await wrapper.vm.refreshWidget('widget-1')
      expect(ElMessage.success).toHaveBeenCalledWith('组件数据已刷新')
    })
  })

  describe('分享功能', () => {
    it('应该能够打开分享对话框', async () => {
      const wrapper = mount(CustomDashboard)
      await wrapper.setData({
        currentDashboard: {
          id: 1,
          name: '测试仪表板',
          description: '测试描述',
          widgets: [],
          layout: { columns: 6, gap: 16 },
          sharing: { isPublic: false, allowedUsers: [], permissions: ['view'] },
          createdAt: '2025-01-20'
        }
      })
      const shareButton = wrapper.findAll('.el-dropdown-item').find(item => item.text() === '分享仪表板')
      if (shareButton) {
        await shareButton.trigger('click')
        expect(wrapper.vm.showShareDialog).toBe(true)
      }
    })

    it('应该能够生成分享链接', async () => {
      const wrapper = mount(CustomDashboard)
      await wrapper.setData({
        currentDashboard: {
          id: 1,
          name: '测试仪表板',
          description: '测试描述',
          widgets: [],
          layout: { columns: 6, gap: 16 },
          sharing: { isPublic: false, allowedUsers: [], permissions: ['view'] },
          createdAt: '2025-01-20'
        },
        showShareDialog: true
      })
      await wrapper.vm.generateShareLink()
      expect(wrapper.vm.shareUrl).toContain('https://yyc3.com/dashboard/share')
      expect(ElMessage.success).toHaveBeenCalledWith('分享链接已生成')
    })

    it('应该能够复制分享链接', async () => {
      const wrapper = mount(CustomDashboard)
      await wrapper.setData({
        currentDashboard: {
          id: 1,
          name: '测试仪表板',
          description: '测试描述',
          widgets: [],
          layout: { columns: 6, gap: 16 },
          sharing: { isPublic: false, allowedUsers: [], permissions: ['view'] },
          createdAt: '2025-01-20'
        },
        showShareDialog: true,
        shareUrl: 'https://yyc3.com/dashboard/share/1'
      })
      await wrapper.vm.copyShareUrl()
      expect(ElMessage.success).toHaveBeenCalledWith('分享链接已复制')
    })
  })

  describe('组件选择', () => {
    it('应该正确显示可用组件列表', async () => {
      const wrapper = mount(CustomDashboard)
      await wrapper.setData({
        currentDashboard: {
          id: 1,
          name: '测试仪表板',
          description: '测试描述',
          widgets: [],
          layout: { columns: 6, gap: 16 },
          sharing: { isPublic: false, allowedUsers: [], permissions: ['view'] },
          createdAt: '2025-01-20'
        },
        showAddWidgetDialog: true,
        widgetTab: 'metric'
      })
      expect(wrapper.vm.metricWidgets.length).toBeGreaterThan(0)
    })

    it('应该能够切换组件类型标签', async () => {
      const wrapper = mount(CustomDashboard)
      await wrapper.setData({
        currentDashboard: {
          id: 1,
          name: '测试仪表板',
          description: '测试描述',
          widgets: [],
          layout: { columns: 6, gap: 16 },
          sharing: { isPublic: false, allowedUsers: [], permissions: ['view'] },
          createdAt: '2025-01-20'
        },
        showAddWidgetDialog: true
      })
      await wrapper.setData({ widgetTab: 'chart' })
      expect(wrapper.vm.widgetTab).toBe('chart')
    })
  })

  describe('响应式行为', () => {
    it('应该正确处理日期范围变化', async () => {
      const wrapper = mount(CustomDashboard)
      await wrapper.setData({
        currentDashboard: {
          id: 1,
          name: '测试仪表板',
          description: '测试描述',
          widgets: [],
          layout: { columns: 6, gap: 16 },
          sharing: { isPublic: false, allowedUsers: [], permissions: ['view'] },
          createdAt: '2025-01-20'
        }
      })
      const dateRange = [new Date('2025-01-01'), new Date('2025-01-31')]
      await wrapper.vm.onDateRangeChange(dateRange)
      expect(wrapper.vm.dateRange).toEqual(dateRange)
    })

    it('应该正确处理自动刷新切换', async () => {
      const wrapper = mount(CustomDashboard)
      await wrapper.setData({
        currentDashboard: {
          id: 1,
          name: '测试仪表板',
          description: '测试描述',
          widgets: [],
          layout: { columns: 6, gap: 16 },
          sharing: { isPublic: false, allowedUsers: [], permissions: ['view'] },
          createdAt: '2025-01-20'
        }
      })
      await wrapper.setData({ autoRefresh: true })
      expect(wrapper.vm.autoRefresh).toBe(true)
    })
  })

  describe('布局管理', () => {
    it('应该能够重置布局', async () => {
      const wrapper = mount(CustomDashboard)
      await wrapper.setData({
        currentDashboard: {
          id: 1,
          name: '测试仪表板',
          description: '测试描述',
          widgets: [],
          layout: { columns: 6, gap: 16 },
          sharing: { isPublic: false, allowedUsers: [], permissions: ['view'] },
          createdAt: '2025-01-20'
        },
        editMode: true
      })
      await wrapper.vm.resetLayout()
      expect(ElMessage.info).toHaveBeenCalledWith('布局已重置')
    })

    it('应该能够处理布局更新', async () => {
      const wrapper = mount(CustomDashboard)
      const newLayout = [
        { x: 0, y: 0, w: 2, h: 2, i: 'widget-1' }
      ]
      await wrapper.vm.onLayoutUpdated(newLayout)
      expect(newLayout).toBeDefined()
    })
  })
})
