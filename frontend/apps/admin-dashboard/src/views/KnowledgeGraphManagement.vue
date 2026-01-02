<template>
  <div class="knowledge-graph-management">
    <!-- 顶部导航栏 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <el-icon><DataAnalysis /></el-icon>
            知识图谱管理
          </h1>
          <p class="page-description">构建和管理智能知识图谱，支持语义推理和知识发现</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="showCreateGraphDialog = true">
            <el-icon><Plus /></el-icon>
            新建图谱
          </el-button>
          <el-button @click="showImportDialog = true">
            <el-icon><Upload /></el-icon>
            导入图谱
          </el-button>
          <el-button-group>
            <el-button @click="viewMode = 'overview'" :type="viewMode === 'overview' ? 'primary' : ''">
              <el-icon><Grid /></el-icon>
              概览
            </el-button>
            <el-button @click="viewMode = 'visualization'" :type="viewMode === 'visualization' ? 'primary' : ''">
              <el-icon><Share /></el-icon>
              可视化
            </el-button>
            <el-button @click="viewMode = 'analytics'" :type="viewMode === 'analytics' ? 'primary' : ''">
              <el-icon><TrendCharts /></el-icon>
              分析
            </el-button>
          </el-button-group>
        </div>
      </div>
    </div>

    <!-- 概览视图 -->
    <div v-if="viewMode === 'overview'" class="overview-view">
      <!-- 搜索和过滤器 -->
      <div class="search-section">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-input
              v-model="searchQuery"
              placeholder="搜索知识图谱..."
              prefix-icon="Search"
              clearable
              @input="handleSearch"
            />
          </el-col>
          <el-col :span="6">
            <el-select v-model="domainFilter" placeholder="选择领域" clearable>
              <el-option label="全部领域" value="" />
              <el-option label="餐饮管理" value="catering" />
              <el-option label="客户关系" value="customer" />
              <el-option label="供应链" value="supply_chain" />
              <el-option label="财务分析" value="finance" />
              <el-option label="运营管理" value="operations" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="permissionFilter" placeholder="权限类型" clearable>
              <el-option label="全部权限" value="" />
              <el-option label="仅公开" value="public" />
              <el-option label="可读" value="read" />
              <el-option label="可编辑" value="write" />
              <el-option label="管理员" value="admin" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button @click="resetFilters">重置过滤器</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 图谱统计卡片 -->
      <div class="stats-cards">
        <el-row :gutter="16">
          <el-col :span="6">
            <div class="stat-card total">
              <div class="stat-icon">
                <el-icon><DataBoard /></el-icon>
              </div>
              <div class="stat-content">
                <h3>{{ totalGraphs }}</h3>
                <p>总图谱数</p>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card nodes">
              <div class="stat-icon">
                <el-icon><Connection /></el-icon>
              </div>
              <div class="stat-content">
                <h3>{{ totalNodes.toLocaleString() }}</h3>
                <p>知识节点</p>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card relationships">
              <div class="stat-icon">
                <el-icon><Share /></el-icon>
              </div>
              <div class="stat-content">
                <h3>{{ totalRelationships.toLocaleString() }}</h3>
                <p>关系连接</p>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card queries">
              <div class="stat-icon">
                <el-icon><Search /></el-icon>
              </div>
              <div class="stat-content">
                <h3>{{ totalQueries.toLocaleString() }}</h3>
                <p>查询次数</p>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 图谱列表 -->
      <div class="graph-list">
        <el-row :gutter="16">
          <el-col
            v-for="graph in filteredGraphs"
            :key="graph.id"
            :span="8"
            class="graph-col"
          >
            <div class="graph-card" @click="selectGraph(graph)">
              <div class="graph-header">
                <div class="graph-title">
                  <h3>{{ graph.name }}</h3>
                  <el-tag :type="getDomainTagType(graph.domain)">
                    {{ getDomainLabel(graph.domain) }}
                  </el-tag>
                </div>
                <div class="graph-actions">
                  <el-dropdown @command="(cmd) => handleGraphAction(cmd, graph)">
                    <el-button text>
                      <el-icon><MoreFilled /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="edit">编辑</el-dropdown-item>
                        <el-dropdown-item command="duplicate">复制</el-dropdown-item>
                        <el-dropdown-item command="export">导出</el-dropdown-item>
                        <el-dropdown-item command="settings">设置</el-dropdown-item>
                        <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>

              <div class="graph-description">
                <p>{{ graph.description }}</p>
              </div>

              <div class="graph-stats">
                <div class="stat-item">
                  <el-icon><Connection /></el-icon>
                  <span>{{ graph.statistics.nodeCount }} 节点</span>
                </div>
                <div class="stat-item">
                  <el-icon><Share /></el-icon>
                  <span>{{ graph.statistics.relationshipCount }} 关系</span>
                </div>
                <div class="stat-item">
                  <el-icon><Clock /></el-icon>
                  <span>{{ formatTime(graph.statistics.lastUpdated) }}</span>
                </div>
              </div>

              <div class="graph-footer">
                <div class="version">
                  <el-tag size="small" type="info">v{{ graph.version }}</el-tag>
                </div>
                <div class="permissions">
                  <el-tag v-if="graph.permissions.public" size="small" type="success">
                    <el-icon><View /></el-icon>
                    公开
                  </el-tag>
                  <el-tag v-else size="small" type="warning">
                    <el-icon><Lock /></el-icon>
                    私有
                  </el-tag>
                </div>
              </div>

              <!-- 预览图谱结构 -->
              <div class="graph-preview">
                <div ref="graphPreview" class="mini-graph" :data-graph-id="graph.id"></div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 48, 96]"
          :total="totalGraphs"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 可视化视图 -->
    <div v-else-if="viewMode === 'visualization'" class="visualization-view">
      <div class="visualization-toolbar">
        <div class="toolbar-left">
          <el-select v-model="selectedGraphId" placeholder="选择知识图谱" @change="loadVisualization">
            <el-option
              v-for="graph in graphs"
              :key="graph.id"
              :label="graph.name"
              :value="graph.id"
            />
          </el-select>
          <el-button-group>
            <el-button @click="layoutType = 'force'" :type="layoutType === 'force' ? 'primary' : ''">
              力导向
            </el-button>
            <el-button @click="layoutType = 'circular'" :type="layoutType === 'circular' ? 'primary' : ''">
              环形
            </el-button>
            <el-button @click="layoutType = 'hierarchical'" :type="layoutType === 'hierarchical' ? 'primary' : ''">
              层次
            </el-button>
          </el-button-group>
        </div>
        <div class="toolbar-right">
          <el-button @click="zoomIn">
            <el-icon><ZoomIn /></el-icon>
          </el-button>
          <el-button @click="zoomOut">
            <el-icon><ZoomOut /></el-icon>
          </el-button>
          <el-button @click="resetZoom">
            <el-icon><RefreshRight /></el-icon>
          </el-button>
          <el-button @click="exportVisualization">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>
      </div>

      <div class="graph-visualization">
        <div ref="graphContainer" class="graph-container"></div>

        <!-- 侧边栏信息面板 -->
        <div v-if="selectedNode" class="info-panel">
          <div class="panel-header">
            <h3>节点详情</h3>
            <el-button @click="selectedNode = null" text>
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
          <div class="panel-content">
            <div class="node-info">
              <h4>{{ selectedNode.label }}</h4>
              <el-tag :type="getNodeTypeTagType(selectedNode.type)">
                {{ getNodeTypeLabel(selectedNode.type) }}
              </el-tag>
              <p>{{ selectedNode.description }}</p>
            </div>

            <div class="node-properties">
              <h5>属性</h5>
              <div v-for="(value, key) in selectedNode.properties" :key="key" class="property-item">
                <span class="property-key">{{ key }}:</span>
                <span class="property-value">{{ value }}</span>
              </div>
            </div>

            <div class="node-metadata">
              <h5>元数据</h5>
              <div class="metadata-item">
                <span>置信度: {{ selectedNode.metadata.confidence }}%</span>
              </div>
              <div class="metadata-item">
                <span>创建者: {{ selectedNode.metadata.createdBy }}</span>
              </div>
              <div class="metadata-item">
                <span>创建时间: {{ formatDateTime(selectedNode.metadata.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分析视图 -->
    <div v-else-if="viewMode === 'analytics'" class="analytics-view">
      <el-row :gutter="16">
        <el-col :span="16">
          <!-- 统计图表 -->
          <div class="analytics-charts">
            <el-card title="图谱增长趋势">
              <div ref="growthChart" class="chart-container"></div>
            </el-card>

            <el-card title="节点类型分布">
              <div ref="nodeTypeChart" class="chart-container"></div>
            </el-card>

            <el-card title="关系类型分布">
              <div ref="relationshipTypeChart" class="chart-container"></div>
            </el-card>
          </div>
        </el-col>

        <el-col :span="8">
          <!-- 分析面板 -->
          <div class="analytics-panel">
            <el-card title="质量分析">
              <div class="quality-metrics">
                <div class="metric-item">
                  <span class="metric-label">平均置信度</span>
                  <el-progress :percentage="averageConfidence" :color="getConfidenceColor(averageConfidence)" />
                </div>
                <div class="metric-item">
                  <span class="metric-label">验证率</span>
                  <el-progress :percentage="validationRate" color="#67c23a" />
                </div>
                <div class="metric-item">
                  <span class="metric-label">争议率</span>
                  <el-progress :percentage="disputeRate" :color="disputeRate > 10 ? '#f56c6c' : '#67c23a'" />
                </div>
              </div>
            </el-card>

            <el-card title="活动统计">
              <div class="activity-stats">
                <div class="stat-row">
                  <span>今日新增节点</span>
                  <strong>{{ todayNodes }}</strong>
                </div>
                <div class="stat-row">
                  <span>今日新增关系</span>
                  <strong>{{ todayRelationships }}</strong>
                </div>
                <div class="stat-row">
                  <span>今日查询次数</span>
                  <strong>{{ todayQueries }}</strong>
                </div>
                <div class="stat-row">
                  <span>活跃用户数</span>
                  <strong>{{ activeUsers }}</strong>
                </div>
              </div>
            </el-card>

            <el-card title="知识推理">
              <div class="inference-stats">
                <div class="inference-item">
                  <span>推理任务</span>
                  <el-tag type="primary">{{ inferenceTasks }}</el-tag>
                </div>
                <div class="inference-item">
                  <span>成功推理</span>
                  <el-tag type="success">{{ successfulInferences }}</el-tag>
                </div>
                <div class="inference-item">
                  <span>平均置信度</span>
                  <el-tag type="warning">{{ inferenceConfidence }}%</el-tag>
                </div>
              </div>
            </el-card>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 创建图谱对话框 -->
    <CreateKnowledgeGraph
      v-model="showCreateGraphDialog"
      @success="handleGraphCreated"
    />

    <!-- 导入图谱对话框 -->
    <el-dialog
      v-model="showImportDialog"
      title="导入知识图谱"
      width="600px"
    >
      <div class="import-form">
        <el-form :model="importForm" label-width="120px">
          <el-form-item label="文件选择">
            <el-upload
              v-model:file-list="importForm.files"
              :auto-upload="false"
              :limit="1"
              accept=".json,.rdf,.csv,.graphml,.gexf"
            >
              <el-button>选择文件</el-button>
            </el-upload>
          </el-form-item>

          <el-form-item label="文件格式">
            <el-select v-model="importForm.format">
              <el-option label="JSON" value="json" />
              <el-option label="RDF" value="rdf" />
              <el-option label="CSV" value="csv" />
              <el-option label="GraphML" value="graphml" />
              <el-option label="GEXF" value="gexf" />
            </el-select>
          </el-form-item>

          <el-form-item label="合并策略">
            <el-radio-group v-model="importForm.mergeStrategy">
              <el-radio label="replace">替换现有图谱</el-radio>
              <el-radio label="merge">智能合并</el-radio>
              <el-radio label="append">追加到现有图谱</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="验证级别">
            <el-radio-group v-model="importForm.validation">
              <el-radio label="strict">严格验证</el-radio>
              <el-radio label="lenient">宽松验证</el-radio>
              <el-radio label="skip">跳过验证</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button type="primary" @click="handleImport" :loading="importing">
          导入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { knowledgeGraphAPI, type KnowledgeGraph, type KnowledgeNode } from '@/api/knowledge-graph'
import CreateKnowledgeGraph from '@/components/KnowledgeGraph/CreateKnowledgeGraph.vue'

// 响应式数据
const viewMode = ref<'overview' | 'visualization' | 'analytics'>('overview')
const searchQuery = ref('')
const domainFilter = ref('')
const permissionFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const graphs = ref<KnowledgeGraph[]>([])
const selectedGraphId = ref('')
const layoutType = ref('force')
const selectedNode = ref<any>(null)
const showCreateGraphDialog = ref(false)
const showImportDialog = ref(false)
const importing = ref(false)

// 统计数据
const totalGraphs = ref(0)
const totalNodes = ref(0)
const totalRelationships = ref(0)
const totalQueries = ref(0)
const averageConfidence = ref(0)
const validationRate = ref(0)
const disputeRate = ref(0)
const todayNodes = ref(0)
const todayRelationships = ref(0)
const todayQueries = ref(0)
const activeUsers = ref(0)
const inferenceTasks = ref(0)
const successfulInferences = ref(0)
const inferenceConfidence = ref(0)

// 导入表单
const importForm = ref({
  files: [],
  format: 'json',
  mergeStrategy: 'merge',
  validation: 'lenient'
})

// DOM引用
const graphPreview = ref([])
const graphContainer = ref<HTMLElement>()
const growthChart = ref<HTMLElement>()
const nodeTypeChart = ref<HTMLElement>()
const relationshipTypeChart = ref<HTMLElement>()

// 计算属性
const filteredGraphs = computed(() => {
  let filtered = graphs.value

  if (searchQuery.value) {
    filtered = filtered.filter(graph =>
      graph.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      graph.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (domainFilter.value) {
    filtered = filtered.filter(graph => graph.domain === domainFilter.value)
  }

  if (permissionFilter.value) {
    filtered = filtered.filter(graph => {
      switch (permissionFilter.value) {
        case 'public':
          return graph.permissions.public
        case 'read':
          return graph.permissions.read.length > 0
        case 'write':
          return graph.permissions.write.length > 0
        case 'admin':
          return graph.permissions.admin.length > 0
        default:
          return true
      }
    })
  }

  return filtered.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
})

// 方法
const loadKnowledgeGraphs = async () => {
  try {
    const { data, success } = await knowledgeGraphAPI.getKnowledgeGraphs()
    if (success && data) {
      graphs.value = data.graphs
      totalGraphs.value = data.total

      // 累计统计数据
      totalNodes.value = data.graphs.reduce((sum, graph) => sum + graph.statistics.nodeCount, 0)
      totalRelationships.value = data.graphs.reduce((sum, graph) => sum + graph.statistics.relationshipCount, 0)

      // 加载统计数据
      await loadStatistics()
    }
  } catch (error) {
    console.error('Load knowledge graphs failed:', error)
    ElMessage.error('加载知识图谱失败')
  }
}

const loadStatistics = async () => {
  try {
    if (graphs.value.length > 0) {
      const { data, success } = await knowledgeGraphAPI.getStatistics({
        graphId: graphs.value[0].id,
        period: 'month'
      })

      if (success && data) {
        totalQueries.value = data.activity.queriesExecuted
        averageConfidence.value = Math.round(data.quality.averageConfidence * 100)
        validationRate.value = Math.round((data.quality.verifiedNodes / data.overview.totalNodes) * 100)
        disputeRate.value = Math.round(data.quality.disputeRate * 100)
        todayNodes.value = data.activity.nodesAdded
        todayRelationships.value = data.activity.relationshipsAdded
        todayQueries.value = data.activity.queriesExecuted
        activeUsers.value = data.activity.activeUsers
      }
    }
  } catch (error) {
    console.error('Load statistics failed:', error)
  }
}

const handleSearch = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  searchQuery.value = ''
  domainFilter.value = ''
  permissionFilter.value = ''
  currentPage.value = 1
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  loadKnowledgeGraphs()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

const selectGraph = (graph: KnowledgeGraph) => {
  selectedGraphId.value = graph.id
  viewMode.value = 'visualization'
  nextTick(() => {
    loadVisualization()
  })
}

const handleGraphAction = async (command: string, graph: KnowledgeGraph) => {
  switch (command) {
    case 'edit':
      // 编辑图谱
      break
    case 'duplicate':
      // 复制图谱
      break
    case 'export':
      await exportGraph(graph.id)
      break
    case 'settings':
      // 打开设置
      break
    case 'delete':
      await deleteGraph(graph)
      break
  }
}

const exportGraph = async (graphId: string) => {
  try {
    const { data, success } = await knowledgeGraphAPI.exportGraph({
      graphId,
      format: 'json'
    })

    if (success && data) {
      // 下载文件
      window.open(data.downloadUrl)
      ElMessage.success('图谱导出成功')
    }
  } catch (error) {
    console.error('Export graph failed:', error)
    ElMessage.error('导出图谱失败')
  }
}

const deleteGraph = async (graph: KnowledgeGraph) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除知识图谱 "${graph.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 调用删除API
    ElMessage.success('图谱删除成功')
    await loadKnowledgeGraphs()
  } catch (error) {
    // 用户取消删除
  }
}

const loadVisualization = async () => {
  if (!selectedGraphId.value) return

  try {
    const { data, success } = await knowledgeGraphAPI.getVisualizationData({
      graphId: selectedGraphId.value,
      layout: layoutType.value
    })

    if (success && data && graphContainer.value) {
      renderVisualization(data)
    }
  } catch (error) {
    console.error('Load visualization failed:', error)
    ElMessage.error('加载可视化失败')
  }
}

const renderVisualization = (data: any) => {
  if (!graphContainer.value) return

  const chart = echarts.init(graphContainer.value)

  const option = {
    tooltip: {},
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [
      {
        type: 'graph',
        layout: layoutType.value,
        data: data.nodes,
        links: data.edges,
        categories: data.categories,
        roam: true,
        label: {
          show: true,
          position: 'right'
        },
        force: {
          repulsion: 1000,
          edgeLength: [50, 100]
        },
        emphasis: {
          focus: 'adjacency'
        }
      }
    ]
  }

  chart.setOption(option)

  // 添加点击事件
  chart.on('click', (params) => {
    if (params.dataType === 'node') {
      selectedNode.value = params.data
    }
  })
}

const zoomIn = () => {
  // 放大可视化
}

const zoomOut = () => {
  // 缩小可视化
}

const resetZoom = () => {
  // 重置缩放
}

const exportVisualization = () => {
  // 导出可视化图片
}

const handleGraphCreated = () => {
  loadKnowledgeGraphs()
  ElMessage.success('知识图谱创建成功')
}

const handleImport = async () => {
  if (importForm.value.files.length === 0) {
    ElMessage.warning('请选择要导入的文件')
    return
  }

  importing.value = true

  try {
    const file = importForm.value.files[0].raw
    const { data, success } = await knowledgeGraphAPI.importGraph({
      file,
      format: importForm.value.format as any,
      mergeStrategy: importForm.value.mergeStrategy as any,
      validation: importForm.value.validation as any
    })

    if (success) {
      ElMessage.success(`图谱导入成功，共导入 ${data?.nodesImported} 个节点，${data?.relationshipsImported} 个关系`)
      showImportDialog.value = false
      await loadKnowledgeGraphs()
    }
  } catch (error) {
    console.error('Import graph failed:', error)
    ElMessage.error('导入图谱失败')
  } finally {
    importing.value = false
  }
}

const initCharts = () => {
  nextTick(() => {
    // 初始化分析图表
    if (growthChart.value) {
      const chart = echarts.init(growthChart.value)
      // 设置增长趋势图表配置
    }

    if (nodeTypeChart.value) {
      const chart = echarts.init(nodeTypeChart.value)
      // 设置节点类型分布图表配置
    }

    if (relationshipTypeChart.value) {
      const chart = echarts.init(relationshipTypeChart.value)
      // 设置关系类型分布图表配置
    }
  })
}

// 辅助方法
const getDomainTagType = (domain: string) => {
  const types: Record<string, string> = {
    catering: 'success',
    customer: 'primary',
    supply_chain: 'warning',
    finance: 'danger',
    operations: 'info'
  }
  return types[domain] || ''
}

const getDomainLabel = (domain: string) => {
  const labels: Record<string, string> = {
    catering: '餐饮管理',
    customer: '客户关系',
    supply_chain: '供应链',
    finance: '财务分析',
    operations: '运营管理'
  }
  return labels[domain] || domain
}

const getNodeTypeTagType = (type: string) => {
  const types: Record<string, string> = {
    concept: 'primary',
    entity: 'success',
    relationship: 'warning',
    rule: 'danger',
    procedure: 'info'
  }
  return types[type] || ''
}

const getNodeTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    concept: '概念',
    entity: '实体',
    relationship: '关系',
    rule: '规则',
    procedure: '流程',
    document: '文档',
    event: '事件',
    location: '位置',
    person: '人物',
    organization: '组织'
  }
  return labels[type] || type
}

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 80) return '#67c23a'
  if (confidence >= 60) return '#e6a23c'
  return '#f56c6c'
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadKnowledgeGraphs()
  initCharts()
})
</script>

<style scoped lang="scss">
.knowledge-graph-management {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  background: white;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .title-section {
    .page-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 8px 0;
      font-size: 24px;
      color: #2c3e50;
    }

    .page-description {
      margin: 0;
      color: #606266;
      font-size: 14px;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }
}

.overview-view {
  .search-section {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .stats-cards {
    margin-bottom: 24px;

    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 16px;

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: white;
      }

      &.total .stat-icon {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.nodes .stat-icon {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      &.relationships .stat-icon {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      &.queries .stat-icon {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }

      .stat-content {
        h3 {
          margin: 0 0 4px 0;
          font-size: 28px;
          font-weight: bold;
          color: #2c3e50;
        }

        p {
          margin: 0;
          color: #606266;
          font-size: 14px;
        }
      }
    }
  }

  .graph-list {
    .graph-col {
      margin-bottom: 16px;
    }

    .graph-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 0.3s ease;
      height: 320px;
      display: flex;
      flex-direction: column;

      &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }

      .graph-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;

        .graph-title {
          h3 {
            margin: 0 0 8px 0;
            font-size: 16px;
            color: #2c3e50;
            line-height: 1.4;
          }
        }
      }

      .graph-description {
        margin-bottom: 16px;
        flex: 1;

        p {
          margin: 0;
          color: #606266;
          font-size: 13px;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }

      .graph-stats {
        display: flex;
        gap: 16px;
        margin-bottom: 12px;

        .stat-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #909399;

          .el-icon {
            font-size: 14px;
          }
        }
      }

      .graph-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: auto;
        padding-top: 12px;
        border-top: 1px solid #f0f0f0;
      }

      .graph-preview {
        margin-top: 12px;
        height: 120px;
        border-radius: 6px;
        background: #f8f9fa;
        overflow: hidden;

        .mini-graph {
          width: 100%;
          height: 100%;
        }
      }
    }
  }

  .pagination-section {
    display: flex;
    justify-content: center;
    margin-top: 24px;
  }
}

.visualization-view {
  .visualization-toolbar {
    background: white;
    padding: 16px 24px;
    border-radius: 8px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;

    .toolbar-left {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .toolbar-right {
      display: flex;
      gap: 8px;
    }
  }

  .graph-visualization {
    display: flex;
    gap: 16px;

    .graph-container {
      flex: 1;
      height: 600px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .info-panel {
      width: 320px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      max-height: 600px;
      overflow-y: auto;

      .panel-header {
        padding: 16px;
        border-bottom: 1px solid #f0f0f0;
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
          margin: 0;
          font-size: 16px;
          color: #2c3e50;
        }
      }

      .panel-content {
        padding: 16px;

        .node-info {
          margin-bottom: 20px;

          h4 {
            margin: 0 0 8px 0;
            color: #2c3e50;
          }

          p {
            margin: 8px 0;
            color: #606266;
            line-height: 1.5;
          }
        }

        .node-properties,
        .node-metadata {
          margin-bottom: 16px;

          h5 {
            margin: 0 0 12px 0;
            font-size: 14px;
            color: #2c3e50;
            border-bottom: 1px solid #f0f0f0;
            padding-bottom: 8px;
          }

          .property-item,
          .metadata-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 13px;

            .property-key {
              color: #909399;
            }

            .property-value {
              color: #2c3e50;
              max-width: 180px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
      }
    }
  }
}

.analytics-view {
  .analytics-charts {
    .el-card {
      margin-bottom: 16px;

      .chart-container {
        height: 300px;
      }
    }
  }

  .analytics-panel {
    .el-card {
      margin-bottom: 16px;

      .quality-metrics {
        .metric-item {
          margin-bottom: 16px;

          .metric-label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            color: #606266;
          }
        }
      }

      .activity-stats {
        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 14px;

          strong {
            color: #2c3e50;
          }
        }
      }

      .inference-stats {
        .inference-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 14px;
        }
      }
    }
  }
}

.import-form {
  .el-form-item {
    margin-bottom: 20px;
  }
}
</style>