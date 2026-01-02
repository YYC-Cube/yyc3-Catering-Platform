<!--
  YYC³餐饮行业智能化平台 - 性能优化表格组件
  支持虚拟滚动、懒加载、智能分页和内存优化
-->
<template>
  <div class="optimized-table" :class="tableClasses">
    <!-- 表格工具栏 -->
    <div class="table-toolbar" v-if="showToolbar">
      <div class="toolbar-left">
        <slot name="toolbar-left">
          <el-input
            v-if="searchable"
            v-model="searchQuery"
            :placeholder="searchPlaceholder"
            class="search-input"
            clearable
            @input="onSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </slot>
      </div>

      <div class="toolbar-right">
        <slot name="toolbar-right">
          <el-button-group v-if="showDensity">
            <el-button
              v-for="density in densityOptions"
              :key="density.value"
              :type="currentDensity === density.value ? 'primary' : 'default'"
              size="small"
              @click="setDensity(density.value)"
            >
              {{ density.label }}
            </el-button>
          </el-button-group>

          <el-button v-if="refreshable" size="small" @click="refresh">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </slot>
      </div>
    </div>

    <!-- 虚拟滚动表格容器 -->
    <div class="table-container" ref="tableContainerRef">
      <!-- 固定表头 -->
      <div class="table-header" v-if="showHeader">
        <table class="table-table">
          <colgroup>
            <col
              v-for="column in visibleColumns"
              :key="column.prop"
              :style="{ width: getColumnWidth(column) }"
            />
          </colgroup>
          <thead>
            <tr class="header-row">
              <th
                v-for="column in visibleColumns"
                :key="column.prop"
                class="header-cell"
                :class="{
                  'sortable': column.sortable,
                  'sorted': sortBy === column.prop,
                  'asc': sortBy === column.prop && sortOrder === 'asc',
                  'desc': sortBy === column.prop && sortOrder === 'desc'
                }"
                @click="onSort(column)"
              >
                <div class="cell-content">
                  <span class="cell-label">{{ column.label }}</span>
                  <div class="sort-icons" v-if="column.sortable">
                    <el-icon class="sort-icon sort-up"><ArrowUp /></el-icon>
                    <el-icon class="sort-icon sort-down"><ArrowDown /></el-icon>
                  </div>
                </div>
              </th>
            </tr>
          </thead>
        </table>
      </div>

      <!-- 虚拟滚动表格内容 -->
      <div class="table-body" @scroll="onScroll">
        <VirtualList
          ref="virtualListRef"
          :items="displayData"
          :item-height="rowHeight"
          :container-height="containerHeight"
          :buffer-size="bufferSize"
          :key-field="rowKey"
          @scroll="onVirtualScroll"
          @load-more="onLoadMore"
        >
          <template #default="{ item, index }">
            <table class="table-table">
              <colgroup>
                <col
                  v-for="column in visibleColumns"
                  :key="column.prop"
                  :style="{ width: getColumnWidth(column) }"
                />
              </colgroup>
              <tbody>
                <tr
                  class="body-row"
                  :class="{
                    'selected': isRowSelected(item),
                    'striped': striped && index % 2 === 1,
                    'hover': hoverable
                  }"
                  @click="onRowClick(item, index)"
                  @dblclick="onRowDblClick(item, index)"
                >
                  <td
                    v-for="column in visibleColumns"
                    :key="column.prop"
                    class="body-cell"
                    :class="column.className"
                  >
                    <OptimizedImage
                      v-if="column.type === 'image' && item[column.prop]"
                      :src="item[column.prop]"
                      :width="column.imageWidth || 40"
                      :height="column.imageHeight || 40"
                      :lazy="true"
                      class="cell-image"
                    />
                    <span v-else class="cell-text">
                      {{ formatCell(item[column.prop], column) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </template>
        </VirtualList>
      </div>

      <!-- 加载更多指示器 -->
      <div v-if="loading" class="table-loading">
        <div class="loading-content">
          <el-icon class="loading-spinner"><Loading /></el-icon>
          <span>{{ loadingText }}</span>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && displayData.length === 0" class="table-empty">
        <slot name="empty">
          <div class="empty-content">
            <el-icon class="empty-icon"><DocumentRemove /></el-icon>
            <p class="empty-text">{{ emptyText }}</p>
          </div>
        </slot>
      </div>
    </div>

    <!-- 分页器 -->
    <div class="table-pagination" v-if="showPagination && total > pageSize">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="pageSizes"
        :layout="paginationLayout"
        @size-change="onSizeChange"
        @current-change="onCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { debounce, throttle } from '@/utils/lazyLoad'
import { performanceMonitor } from '@/utils/performanceConfig'
import VirtualList from './VirtualList.vue'
import OptimizedImage from './OptimizedImage.vue'

// 类型定义
interface TableColumn {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  sortable?: boolean
  className?: string
  type?: 'text' | 'image' | 'number' | 'date'
  formatter?: (value: any, row: any, column: TableColumn) => string
  imageWidth?: number
  imageHeight?: number
  showOverflowTooltip?: boolean
}

interface TableProps {
  data: any[]
  columns: TableColumn[]
  height?: number | string
  maxHeight?: number | string
  rowKey?: string | ((row: any) => string)
  defaultSort?: { prop: string; order: 'asc' | 'desc' }
  stripe?: boolean
  border?: boolean
  size?: 'large' | 'default' | 'small'
  fit?: boolean
  showHeader?: boolean
  highlightCurrentRow?: boolean
  showOverflowTooltip?: boolean
  align?: 'left' | 'center' | 'right'
  headerAlign?: 'left' | 'center' | 'right'
  selectable?: (row: any, index: number) => boolean
  reserveSelection?: boolean
  lazy?: boolean
  load?: (treeItem: any, treeNode: any) => Promise<any[]>
  treeProps?: { children: string; hasChildren: string }
  defaultExpandAll?: boolean
  expandRowKeys?: any[]
  indent?: number
  icon?: string
  showSummary?: boolean
  sumText?: string
  summaryMethod?: (param: { columns: TableColumn[]; data: any[] }) => string[]
  spanMethod?: (param: { row: any; column: TableColumn; rowIndex: number; columnIndex: number }) => number[] | { rowspan: number; colspan: number }
  selectOnIndeterminate?: boolean
  showToolbar?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  showDensity?: boolean
  refreshable?: boolean
  showPagination?: boolean
  paginationLayout?: string
  pageSizes?: number[]
  currentPage?: number
  pageSize?: number
  total?: number
  loading?: boolean
  loadingText?: string
  emptyText?: string
  striped?: boolean
  hoverable?: boolean
  rowHeight?: number
  bufferSize?: number
  virtualScroll?: boolean
  virtualScrollThreshold?: number
}

// Props with defaults
const props = withDefaults(defineProps<TableProps>(), {
  rowKey: 'id',
  stripe: false,
  border: true,
  size: 'default',
  fit: true,
  showHeader: true,
  highlightCurrentRow: false,
  showOverflowTooltip: false,
  align: 'left',
  headerAlign: 'left',
  lazy: false,
  defaultExpandAll: false,
  indent: 16,
  showSummary: false,
  sumText: '合计',
  selectOnIndeterminate: true,
  showToolbar: true,
  searchable: true,
  searchPlaceholder: '请输入搜索内容',
  showDensity: true,
  refreshable: true,
  showPagination: true,
  paginationLayout: 'total, sizes, prev, pager, next, jumper',
  pageSizes: () => [10, 20, 50, 100],
  currentPage: 1,
  pageSize: 20,
  total: 0,
  loading: false,
  loadingText: '加载中...',
  emptyText: '暂无数据',
  striped: true,
  hoverable: true,
  rowHeight: 50,
  bufferSize: 10,
  virtualScroll: true,
  virtualScrollThreshold: 1000
})

// Emits
const emit = defineEmits<{
  'selection-change': [selection: any[]]
  'select': [selection: any[], row: any]
  'select-all': [selection: any[]]
  'sort-change': [{ column: TableColumn; prop: string; order: string | null }]
  'filter-change': [filters: Record<string, any[]>]
  'current-change': [currentPage: number]
  'size-change': [pageSize: number]
  'expand-change': [row: any, expandedRows: any[]]
  'row-click': [row: any, column: TableColumn, event: Event]
  'row-contextmenu': [row: any, column: TableColumn, event: Event]
  'row-dblclick': [row: any, column: TableColumn, event: Event]
  'cell-click': [row: any, column: TableColumn, cell: HTMLTableCellElement, event: Event]
  'cell-dblclick': [row: any, column: TableColumn, cell: HTMLTableCellElement, event: Event]
  'header-click': [column: TableColumn, event: Event]
  'header-contextmenu': [column: TableColumn, event: Event]
  'refresh': []
}>()

// 响应式数据
const tableContainerRef = ref<HTMLElement>()
const virtualListRef = ref()
const searchQuery = ref('')
const sortBy = ref('')
const sortOrder = ref<'asc' | 'desc' | null>(null)
const currentPage = ref(props.currentPage)
const pageSize = ref(props.pageSize)
const selectedRows = ref<any[]>([])
const currentDensity = ref<'comfortable' | 'default' | 'compact'>('default')
const containerHeight = ref(400)

// 密度选项
const densityOptions = [
  { label: '紧凑', value: 'compact' },
  { label: '默认', value: 'default' },
  { label: '舒适', value: 'comfortable' }
]

// 计算属性
const tableClasses = computed(() => ({
  [`table-${props.size}`]: true,
  'table-bordered': props.border,
  'table-striped': props.striped,
  'table-hoverable': props.hoverable
}))

const visibleColumns = computed(() => {
  return props.columns.filter(column => !column.hidden)
})

const displayData = computed(() => {
  performanceMonitor.startMeasure('table-data-processing')

  let filteredData = props.data

  // 搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filteredData = filteredData.filter(row => {
      return visibleColumns.value.some(column => {
        const value = row[column.prop]
        return String(value).toLowerCase().includes(query)
      })
    })
  }

  // 排序
  if (sortBy.value) {
    filteredData = [...filteredData].sort((a, b) => {
      const valueA = a[sortBy.value]
      const valueB = b[sortBy.value]

      let result = 0
      if (valueA < valueB) result = -1
      if (valueA > valueB) result = 1

      return sortOrder.value === 'desc' ? -result : result
    })
  }

  // 分页
  if (props.showPagination) {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    filteredData = filteredData.slice(start, end)
  }

  performanceMonitor.endMeasure('table-data-processing')
  return filteredData
})

// 方法
const getColumnWidth = (column: TableColumn) => {
  if (column.width) {
    return typeof column.width === 'number' ? `${column.width}px` : column.width
  }
  return 'auto'
}

const formatCell = (value: any, column: TableColumn) => {
  if (column.formatter) {
    return column.formatter(value, {}, column)
  }

  if (value === null || value === undefined) {
    return ''
  }

  switch (column.type) {
    case 'date':
      return new Date(value).toLocaleDateString()
    case 'number':
      return Number(value).toLocaleString()
    default:
      return String(value)
  }
}

const isRowSelected = (row: any) => {
  const key = typeof props.rowKey === 'function' ? props.rowKey(row) : row[props.rowKey]
  return selectedRows.value.some(selectedRow => {
    const selectedKey = typeof props.rowKey === 'function' ? props.rowKey(selectedRow) : selectedRow[props.rowKey]
    return selectedKey === key
  })
}

const onSearch = debounce((event: Event) => {
  searchQuery.value = (event.target as HTMLInputElement).value
  currentPage.value = 1
}, 300)

const onSort = (column: TableColumn) => {
  if (!column.sortable) return

  if (sortBy.value === column.prop) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : sortOrder.value === 'desc' ? null : 'asc'
    if (!sortOrder.value) {
      sortBy.value = ''
    }
  } else {
    sortBy.value = column.prop
    sortOrder.value = 'asc'
  }

  emit('sort-change', {
    column,
    prop: column.prop,
    order: sortOrder.value
  })
}

const onScroll = throttle((event: Event) => {
  // 滚动处理逻辑
}, 16)

const onVirtualScroll = (data: { scrollTop: number; isBottom: boolean }) => {
  // 虚拟滚动处理逻辑
}

const onLoadMore = () => {
  // 加载更多数据逻辑
  emit('load-more')
}

const onRowClick = (row: any, index: number) => {
  emit('row-click', row, {} as TableColumn, new Event('click'))
}

const onRowDblClick = (row: any, index: number) => {
  emit('row-dblclick', row, {} as TableColumn, new Event('dblclick'))
}

const onSizeChange = (size: number) => {
  pageSize.value = size
  emit('size-change', size)
}

const onCurrentChange = (page: number) => {
  currentPage.value = page
  emit('current-change', page)
}

const setDensity = (density: 'comfortable' | 'default' | 'compact') => {
  currentDensity.value = density

  // 根据密度调整行高
  const heightMap = {
    compact: 40,
    default: 50,
    comfortable: 60
  }

  // 如果有行高调整需求，可以在这里处理
}

const refresh = () => {
  emit('refresh')
}

const getRowHeight = () => {
  const heightMap = {
    compact: 40,
    default: props.rowHeight,
    comfortable: 60
  }
  return heightMap[currentDensity.value]
}

// 监听器
watch(() => props.height, (newHeight) => {
  if (newHeight && typeof newHeight === 'number') {
    containerHeight.value = newHeight
  }
})

watch(() => props.currentPage, (newPage) => {
  currentPage.value = newPage
})

watch(() => props.pageSize, (newSize) => {
  pageSize.value = newSize
})

// 生命周期
onMounted(() => {
  nextTick(() => {
    if (tableContainerRef.value && props.height) {
      const height = typeof props.height === 'number' ? props.height : parseInt(props.height)
      containerHeight.value = height - 60 // 减去头部高度
    }
  })
})

// 暴露方法
defineExpose({
  refresh,
  setDensity,
  scrollTo: (index: number) => {
    virtualListRef.value?.scrollToIndex(index)
  },
  getSelection: () => selectedRows.value,
  clearSelection: () => {
    selectedRows.value = []
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as *;

.optimized-table {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-surface);
  border-radius: $border-radius-lg;
  border: 1px solid var(--color-border);
  overflow: hidden;

  .table-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-3) var(--spacing-4);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface-elevated);

    .toolbar-left {
      flex: 1;
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    .search-input {
      width: 300px;
    }
  }

  .table-container {
    flex: 1;
    position: relative;
    overflow: hidden;

    .table-header {
      position: sticky;
      top: 0;
      z-index: 10;
      background: var(--color-surface-elevated);
      border-bottom: 2px solid var(--color-border);

      .table-table {
        width: 100%;
        table-layout: fixed;
        border-collapse: collapse;

        .header-row {
          .header-cell {
            padding: var(--spacing-3) var(--spacing-4);
            font-weight: 600;
            color: var(--color-text-primary);
            background: var(--color-surface-elevated);
            border-bottom: 1px solid var(--color-border);
            user-select: none;

            &.sortable {
              cursor: pointer;
              transition: background-color 0.2s ease;

              &:hover {
                background: var(--color-surface-hover);
              }

              .cell-content {
                display: flex;
                align-items: center;
                justify-content: space-between;

                .sort-icons {
                  display: flex;
                  flex-direction: column;
                  margin-left: var(--spacing-1);

                  .sort-icon {
                    font-size: 12px;
                    color: var(--color-text-placeholder);
                    transition: color 0.2s ease;

                    &.sort-up {
                      margin-bottom: -2px;
                    }

                    &.sort-down {
                      margin-top: -2px;
                    }
                  }
                }

                &.sorted .sort-icon {
                  color: var(--color-primary);

                  &.asc .sort-up,
                  &.desc .sort-down {
                    color: var(--color-primary);
                  }
                }
              }
            }
          }
        }
      }
    }

    .table-body {
      height: 100%;
      overflow: auto;

      .table-table {
        width: 100%;
        table-layout: fixed;
        border-collapse: collapse;

        .body-row {
          transition: background-color 0.2s ease;

          &:hover,
          &.hover {
            background: var(--color-surface-hover);
          }

          &.selected {
            background: var(--color-primary-light);
          }

          &.striped:nth-child(even) {
            background: var(--color-surface-variant);
          }

          .body-cell {
            padding: var(--spacing-3) var(--spacing-4);
            color: var(--color-text-primary);
            border-bottom: 1px solid var(--color-border);

            .cell-image {
              border-radius: $border-radius-sm;
            }

            .cell-text {
              display: block;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
      }
    }

    .table-loading {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(2px);
      z-index: 100;

      .loading-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-2);
        color: var(--color-primary);

        .loading-spinner {
          font-size: 24px;
          animation: spin 1s linear infinite;
        }
      }
    }

    .table-empty {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;

      .empty-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-3);
        color: var(--color-text-secondary);

        .empty-icon {
          font-size: 48px;
          opacity: 0.5;
        }

        .empty-text {
          font-size: $font-size-body;
          margin: 0;
        }
      }
    }
  }

  .table-pagination {
    display: flex;
    justify-content: flex-end;
    padding: var(--spacing-3) var(--spacing-4);
    border-top: 1px solid var(--color-border);
    background: var(--color-surface-elevated);
  }
}

// 尺寸变体
.table-large {
  .header-cell,
  .body-cell {
    padding: var(--spacing-4) var(--spacing-5);
  }
}

.table-small {
  .header-cell,
  .body-cell {
    padding: var(--spacing-2) var(--spacing-3);
  }
}

// 边框变体
.table-bordered {
  .table-header .table-table,
  .table-body .table-table {
    border: 1px solid var(--color-border);

    th,
    td {
      border-right: 1px solid var(--color-border);

      &:last-child {
        border-right: none;
      }
    }
  }
}

// 动画
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .optimized-table {
    .table-toolbar {
      flex-direction: column;
      gap: var(--spacing-2);
      align-items: stretch;

      .toolbar-left,
      .toolbar-right {
        justify-content: center;
      }

      .search-input {
        width: 100%;
      }
    }

    .table-container {
      .table-header .header-cell,
      .table-body .body-cell {
        padding: var(--spacing-2) var(--spacing-3);
        font-size: $font-size-body-small;
      }
    }
  }
}

// 高对比度模式
@media (prefers-contrast: high) {
  .optimized-table {
    border-width: 2px;

    .table-container {
      .table-header {
        border-bottom-width: 2px;
      }

      .table-body .table-table .body-row {
        border-bottom-width: 2px;
      }
    }
  }
}

// 减少动画偏好
@media (prefers-reduced-motion: reduce) {
  .optimized-table {
    .table-container {
      .table-header .header-cell,
      .table-body .table-table .body-row {
        transition: none;
      }
    }

    .loading-spinner {
      animation: none;
    }
  }
}
</style>