<template>
  <div class="knowledge-query">
    <!-- 查询输入区 -->
    <div class="query-input-section">
      <div class="input-header">
        <h3>知识查询</h3>
        <div class="query-actions">
          <el-button-group>
            <el-button
              @click="queryType = 'natural_language'"
              :type="queryType === 'natural_language' ? 'primary' : ''"
            >
              自然语言
            </el-button>
            <el-button
              @click="queryType = 'structured'"
              :type="queryType === 'structured' ? 'primary' : ''"
            >
              结构化查询
            </el-button>
            <el-button
              @click="queryType = 'visual'"
              :type="queryType === 'visual' ? 'primary' : ''"
            >
              可视化查询
            </el-button>
            <el-button
              @click="queryType = 'semantic'"
              :type="queryType === 'semantic' ? 'primary' : ''"
            >
              语义搜索
            </el-button>
          </el-button-group>
        </div>
      </div>

      <!-- 自然语言查询 -->
      <div v-if="queryType === 'natural_language'" class="natural-language-query">
        <div class="query-input-wrapper">
          <el-input
            v-model="naturalLanguageQuery"
            type="textarea"
            :rows="3"
            placeholder="请输入您的问题，例如：找出所有与餐饮管理相关的概念和它们之间的关系"
            class="query-textarea"
          />
          <div class="input-actions">
            <el-button @click="clearQuery">清空</el-button>
            <el-button type="primary" @click="executeNaturalQuery" :loading="querying">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
          </div>
        </div>

        <!-- 查询建议 -->
        <div class="query-suggestions">
          <h4>查询建议</h4>
          <div class="suggestion-chips">
            <el-tag
              v-for="suggestion in querySuggestions"
              :key="suggestion"
              @click="selectSuggestion(suggestion)"
              class="suggestion-chip"
              type="info"
            >
              {{ suggestion }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 结构化查询 -->
      <div v-else-if="queryType === 'structured'" class="structured-query">
        <div class="query-builder">
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="节点类型">
                <el-select v-model="structuredQuery.nodeType" placeholder="选择节点类型" multiple>
                  <el-option
                    v-for="(label, value) in nodeTypeLabels"
                    :key="value"
                    :label="label"
                    :value="value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="关系类型">
                <el-select v-model="structuredQuery.relationshipType" placeholder="选择关系类型" multiple>
                  <el-option
                    v-for="(label, value) in relationshipTypeLabels"
                    :key="value"
                    :label="label"
                    :value="value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="置信度范围">
                <el-slider
                  v-model="structuredQuery.confidenceRange"
                  range
                  :min="0"
                  :max="100"
                  show-input
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="关键词">
                <el-input
                  v-model="structuredQuery.keywords"
                  placeholder="输入关键词，用逗号分隔"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="标签过滤">
                <el-select
                  v-model="structuredQuery.tags"
                  placeholder="选择标签"
                  multiple
                  filterable
                  allow-create
                >
                  <el-option
                    v-for="tag in availableTags"
                    :key="tag"
                    :label="tag"
                    :value="tag"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="时间范围">
                <el-date-picker
                  v-model="structuredQuery.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="结果数量">
                <el-input-number
                  v-model="structuredQuery.limit"
                  :min="1"
                  :max="1000"
                  controls-position="right"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="排序方式">
                <el-select v-model="structuredQuery.sortBy">
                  <el-option label="相关性" value="relevance" />
                  <el-option label="置信度" value="confidence" />
                  <el-option label="创建时间" value="createdAt" />
                  <el-option label="更新时间" value="updatedAt" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <div class="query-actions">
            <el-button @click="resetStructuredQuery">重置</el-button>
            <el-button type="primary" @click="executeStructuredQuery" :loading="querying">
              <el-icon><Search /></el-icon>
              执行查询
            </el-button>
          </div>
        </div>
      </div>

      <!-- 可视化查询 -->
      <div v-else-if="queryType === 'visual'" class="visual-query">
        <div class="visual-builder">
          <div class="builder-toolbar">
            <el-button-group>
              <el-button @click="addNodeToCanvas" size="small">
                <el-icon><Plus /></el-icon>
                添加节点
              </el-button>
              <el-button @click="addRelationToCanvas" size="small">
                <el-icon><Connection /></el-icon>
                添加关系
              </el-button>
              <el-button @click="clearCanvas" size="small">
                <el-icon><Delete /></el-icon>
                清空画布
              </el-button>
            </el-button-group>

            <div class="zoom-controls">
              <el-button @click="zoomIn" size="small">
                <el-icon><ZoomIn /></el-icon>
              </el-button>
              <el-button @click="zoomOut" size="small">
                <el-icon><ZoomOut /></el-icon>
              </el-button>
              <el-button @click="resetZoom" size="small">
                <el-icon><RefreshRight /></el-icon>
              </el-button>
            </div>
          </div>

          <div ref="visualCanvas" class="visual-canvas"></div>

          <div class="query-actions">
            <el-button @click="clearCanvas">清空</el-button>
            <el-button type="primary" @click="executeVisualQuery" :loading="querying">
              <el-icon><Search /></el-icon>
              执行查询
            </el-button>
          </div>
        </div>
      </div>

      <!-- 语义搜索 -->
      <div v-else-if="queryType === 'semantic'" class="semantic-query">
        <div class="semantic-input">
          <el-input
            v-model="semanticQuery"
            placeholder="输入要搜索的概念或实体，系统将进行语义相似度匹配"
            class="semantic-input-field"
          >
            <template #append>
              <el-button @click="executeSemanticQuery" :loading="querying">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>

          <div class="semantic-options">
            <el-form-item label="相似度阈值">
              <el-slider
                v-model="similarityThreshold"
                :min="0"
                :max="1"
                :step="0.1"
                show-input
                :show-input-controls="false"
              />
            </el-form-item>

            <el-form-item label="搜索深度">
              <el-radio-group v-model="semanticDepth">
                <el-radio :label="1">直接关系</el-radio>
                <el-radio :label="2">二级关系</el-radio>
                <el-radio :label="3">三级关系</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-checkbox-group v-model="semanticOptions">
              <el-checkbox label="includeContext">包含上下文</el-checkbox>
              <el-checkbox label="expandSynonyms">扩展同义词</el-checkbox>
              <el-checkbox label="weightByType">按类型加权</el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
      </div>
    </div>

    <!-- 查询结果 -->
    <div v-if="queryResult" class="query-results">
      <div class="results-header">
        <h3>查询结果</h3>
        <div class="results-stats">
          <el-tag type="info">
            找到 {{ queryResult.result?.nodes.length || 0 }} 个节点
          </el-tag>
          <el-tag type="success">
            {{ queryResult.result?.relationships.length || 0 }} 个关系
          </el-tag>
          <el-tag type="warning">
            {{ (queryResult.execution.duration / 1000).toFixed(2) }}s
          </el-tag>
          <el-tag v-if="queryResult.execution.cacheHit" type="success">
            缓存命中
          </el-tag>
        </div>
      </div>

      <!-- 结果切换 -->
      <el-tabs v-model="resultView" class="result-tabs">
        <el-tab-pane label="概览" name="overview">
          <div class="overview-results">
            <!-- 智能回答 -->
            <div v-if="queryResult.result?.answer" class="intelligent-answer">
              <h4>智能回答</h4>
              <div class="answer-content">
                <p>{{ queryResult.result.answer }}</p>
                <div class="answer-confidence">
                  <span>置信度: </span>
                  <el-progress
                    :percentage="Math.round((queryResult.result.confidence || 0) * 100)"
                    :color="getConfidenceColor(queryResult.result.confidence || 0)"
                    :show-text="true"
                  />
                </div>
              </div>
            </div>

            <!-- 路径结果 -->
            <div v-if="queryResult.result?.paths?.length" class="path-results">
              <h4>发现路径</h4>
              <div class="path-list">
                <div
                  v-for="(path, index) in queryResult.result.paths"
                  :key="index"
                  class="path-item"
                >
                  <div class="path-score">
                    <el-tag :type="getScoreTagType(path.score)">
                      得分: {{ path.score.toFixed(2) }}
                    </el-tag>
                  </div>
                  <div class="path-nodes">
                    <el-tag
                      v-for="(nodeId, nodeIndex) in path.nodes"
                      :key="nodeId"
                      :type="nodeIndex === 0 ? 'primary' : nodeIndex === path.nodes.length - 1 ? 'success' : 'info'"
                      size="small"
                    >
                      {{ getNodeLabel(nodeId) }}
                    </el-tag>
                  </div>
                  <div class="path-actions">
                    <el-button @click="visualizePath(path)" size="small">
                      可视化路径
                    </el-button>
                    <el-button @click="exportPath(path)" size="small">
                      导出路径
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="节点详情" name="nodes">
          <div class="nodes-results">
            <div class="nodes-list">
              <div
                v-for="node in queryResult.result?.nodes"
                :key="node.id"
                class="node-card"
              >
                <div class="node-header">
                  <h4>{{ node.label }}</h4>
                  <el-tag :type="getNodeTypeTagType(node.type)">
                    {{ getNodeTypeLabel(node.type) }}
                  </el-tag>
                  <el-tag v-if="node.metadata.confidence" type="warning" size="small">
                    {{ Math.round(node.metadata.confidence * 100) }}%
                  </el-tag>
                </div>

                <div class="node-description">
                  <p>{{ node.description }}</p>
                </div>

                <div class="node-properties">
                  <h5>属性</h5>
                  <div class="properties-grid">
                    <div
                      v-for="(value, key) in node.properties"
                      :key="key"
                      class="property-item"
                    >
                      <span class="property-key">{{ key }}:</span>
                      <span class="property-value">{{ value }}</span>
                    </div>
                  </div>
                </div>

                <div class="node-metadata">
                  <div class="metadata-item">
                    <span class="metadata-label">来源:</span>
                    <span>{{ node.metadata.source }}</span>
                  </div>
                  <div class="metadata-item">
                    <span class="metadata-label">创建时间:</span>
                    <span>{{ formatDateTime(node.metadata.createdAt) }}</span>
                  </div>
                  <div class="metadata-item">
                    <span class="metadata-label">标签:</span>
                    <el-tag
                      v-for="tag in node.metadata.tags"
                      :key="tag"
                      size="small"
                      class="tag-item"
                    >
                      {{ tag }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="关系网络" name="network">
          <div class="network-results">
            <div ref="networkCanvas" class="network-canvas"></div>
            <div class="network-controls">
              <el-button-group>
                <el-button @click="centerNetwork">居中</el-button>
                <el-button @click="fitNetwork">适应屏幕</el-button>
                <el-button @click="exportNetwork">导出图片</el-button>
              </el-button-group>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="执行详情" name="execution">
          <div class="execution-details">
            <div class="execution-stats">
              <h4>执行统计</h4>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">执行时间:</span>
                  <span class="stat-value">{{ (queryResult.execution.duration / 1000).toFixed(2) }}s</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">搜索节点:</span>
                  <span class="stat-value">{{ queryResult.execution.nodesSearched }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">探索关系:</span>
                  <span class="stat-value">{{ queryResult.execution.relationshipsExplored }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">算法:</span>
                  <span class="stat-value">{{ queryResult.execution.algorithm }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">缓存命中:</span>
                  <span class="stat-value">{{ queryResult.execution.cacheHit ? '是' : '否' }}</span>
                </div>
              </div>
            </div>

            <div class="query-details">
              <h4>查询详情</h4>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="查询类型">
                  {{ getQueryTypeLabel(queryResult.type) }}
                </el-descriptions-item>
                <el-descriptions-item label="查询时间">
                  {{ formatDateTime(queryResult.createdAt) }}
                </el-descriptions-item>
                <el-descriptions-item label="置信度范围" v-if="queryResult.filters?.confidence">
                  {{ queryResult.filters.confidence.min }} - {{ queryResult.filters.confidence.max }}
                </el-descriptions-item>
                <el-descriptions-item label="结果置信度">
                  {{ queryResult.result?.confidence ? (queryResult.result.confidence * 100).toFixed(1) + '%' : 'N/A' }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 查询历史 -->
    <div class="query-history">
      <div class="history-header">
        <h4>查询历史</h4>
        <el-button @click="clearHistory" text type="danger">清空历史</el-button>
      </div>
      <div class="history-list">
        <div
          v-for="history in queryHistory"
          :key="history.id"
          class="history-item"
          @click="loadHistoryQuery(history)"
        >
          <div class="history-query">
            <span class="query-text">{{ history.query }}</span>
            <el-tag size="small" :type="getQueryTypeTagType(history.type)">
              {{ getQueryTypeLabel(history.type) }}
            </el-tag>
          </div>
          <div class="history-time">
            {{ formatDateTime(history.createdAt) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { knowledgeGraphAPI, type KnowledgeQuery, type KnowledgeNode } from '@/api/knowledge-graph'

// 响应式数据
const queryType = ref<'natural_language' | 'structured' | 'visual' | 'semantic'>('natural_language')
const queryResult = ref<KnowledgeQuery | null>(null)
const resultView = ref('overview')
const querying = ref(false)
const queryHistory = ref<KnowledgeQuery[]>([])

// 查询输入
const naturalLanguageQuery = ref('')
const semanticQuery = ref('')
const similarityThreshold = ref(0.7)
const semanticDepth = ref(2)
const semanticOptions = ref(['includeContext'])

// 结构化查询
const structuredQuery = ref({
  nodeType: [] as string[],
  relationshipType: [] as string[],
  confidenceRange: [0, 100] as [number, number],
  keywords: '',
  tags: [] as string[],
  dateRange: null as [Date, Date] | null,
  limit: 100,
  sortBy: 'relevance'
})

// DOM引用
const visualCanvas = ref<HTMLElement>()
const networkCanvas = ref<HTMLElement>()

// 数据
const querySuggestions = ref([
  '找出所有与餐饮相关的概念',
  '查找客户关系管理的核心流程',
  '分析供应链的关键节点',
  '探索财务分析的主要指标',
  '了解运营管理的最佳实践'
])

const availableTags = ref([
  '重要', '流程', '策略', '管理', '优化', '分析', '报告', '系统', '工具', '方法'
])

const nodeTypeLabels = {
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

const relationshipTypeLabels = {
  is_a: '是一种',
  part_of: '是一部分',
  related_to: '相关',
  causes: '导致',
  enables: '使能',
  requires: '需要',
  similar_to: '相似',
  opposite_of: '相反',
  instance_of: '实例',
  subclass_of: '子类',
  located_in: '位于',
  works_for: '工作于',
  knows: '认识',
  collaborates_with: '协作',
  depends_on: '依赖'
}

// 方法
const selectSuggestion = (suggestion: string) => {
  naturalLanguageQuery.value = suggestion
}

const clearQuery = () => {
  naturalLanguageQuery.value = ''
  queryResult.value = null
}

const executeNaturalQuery = async () => {
  if (!naturalLanguageQuery.value.trim()) {
    ElMessage.warning('请输入查询内容')
    return
  }

  querying.value = true

  try {
    const { data, success } = await knowledgeGraphAPI.queryKnowledgeGraph({
      query: naturalLanguageQuery.value,
      type: 'natural_language',
      filters: {
        confidence: { min: 0.5, max: 1.0 }
      },
      context: {
        previousQueries: queryHistory.value.slice(-3).map(h => h.query),
        userIntent: 'knowledge_exploration'
      }
    })

    if (success && data) {
      queryResult.value = data
      addToHistory(data)
      ElMessage.success('查询完成')
    }
  } catch (error) {
    console.error('Natural query failed:', error)
    ElMessage.error('查询失败')
  } finally {
    querying.value = false
  }
}

const executeStructuredQuery = async () => {
  querying.value = true

  try {
    const { data, success } = await knowledgeGraphAPI.queryKnowledgeGraph({
      query: JSON.stringify(structuredQuery.value),
      type: 'structured',
      parameters: structuredQuery.value,
      filters: {
        nodeTypes: structuredQuery.value.nodeType,
        relationshipTypes: structuredQuery.value.relationshipType,
        confidence: {
          min: structuredQuery.value.confidenceRange[0] / 100,
          max: structuredQuery.value.confidenceRange[1] / 100
        },
        tags: structuredQuery.value.tags,
        dateRange: structuredQuery.value.dateRange ? {
          start: structuredQuery.value.dateRange[0].toISOString(),
          end: structuredQuery.value.dateRange[1].toISOString()
        } : undefined
      }
    })

    if (success && data) {
      queryResult.value = data
      addToHistory(data)
      ElMessage.success('查询完成')
    }
  } catch (error) {
    console.error('Structured query failed:', error)
    ElMessage.error('查询失败')
  } finally {
    querying.value = false
  }
}

const executeSemanticQuery = async () => {
  if (!semanticQuery.value.trim()) {
    ElMessage.warning('请输入搜索内容')
    return
  }

  querying.value = true

  try {
    const { data, success } = await knowledgeGraphAPI.queryKnowledgeGraph({
      query: semanticQuery.value,
      type: 'semantic',
      parameters: {
        similarityThreshold: similarityThreshold.value,
        depth: semanticDepth.value,
        options: semanticOptions.value
      },
      filters: {
        confidence: { min: similarityThreshold.value, max: 1.0 }
      }
    })

    if (success && data) {
      queryResult.value = data
      addToHistory(data)
      ElMessage.success('语义搜索完成')
    }
  } catch (error) {
    console.error('Semantic query failed:', error)
    ElMessage.error('语义搜索失败')
  } finally {
    querying.value = false
  }
}

const executeVisualQuery = async () => {
  // 实现可视化查询逻辑
  ElMessage.info('可视化查询功能开发中')
}

const resetStructuredQuery = () => {
  structuredQuery.value = {
    nodeType: [],
    relationshipType: [],
    confidenceRange: [0, 100],
    keywords: '',
    tags: [],
    dateRange: null,
    limit: 100,
    sortBy: 'relevance'
  }
}

const addNodeToCanvas = () => {
  // 添加节点到画布
}

const addRelationToCanvas = () => {
  // 添加关系到画布
}

const clearCanvas = () => {
  // 清空画布
}

const zoomIn = () => {
  // 放大
}

const zoomOut = () => {
  // 缩小
}

const resetZoom = () => {
  // 重置缩放
}

const visualizePath = (path: any) => {
  // 可视化路径
  ElMessage.info('路径可视化功能开发中')
}

const exportPath = (path: any) => {
  // 导出路径
  ElMessage.info('路径导出功能开发中')
}

const centerNetwork = () => {
  // 居中网络图
}

const fitNetwork = () => {
  // 适应屏幕
}

const exportNetwork = () => {
  // 导出网络图
  ElMessage.info('网络图导出功能开发中')
}

const addToHistory = (query: KnowledgeQuery) => {
  queryHistory.value.unshift(query)
  if (queryHistory.value.length > 10) {
    queryHistory.value = queryHistory.value.slice(0, 10)
  }
  saveHistory()
}

const loadHistoryQuery = (history: KnowledgeQuery) => {
  if (history.type === 'natural_language') {
    queryType.value = 'natural_language'
    naturalLanguageQuery.value = history.query
  } else if (history.type === 'semantic') {
    queryType.value = 'semantic'
    semanticQuery.value = history.query
  }

  queryResult.value = history
  resultView.value = 'overview'
}

const saveHistory = () => {
  localStorage.setItem('knowledge-query-history', JSON.stringify(queryHistory.value))
}

const loadHistory = () => {
  const saved = localStorage.getItem('knowledge-query-history')
  if (saved) {
    try {
      queryHistory.value = JSON.parse(saved)
    } catch (error) {
      console.error('Failed to load query history:', error)
    }
  }
}

const clearHistory = () => {
  queryHistory.value = []
  localStorage.removeItem('knowledge-query-history')
  ElMessage.success('查询历史已清空')
}

// 辅助方法
const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.8) return '#67c23a'
  if (confidence >= 0.6) return '#e6a23c'
  return '#f56c6c'
}

const getScoreTagType = (score: number) => {
  if (score >= 0.8) return 'success'
  if (score >= 0.6) return 'warning'
  return 'info'
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

const getQueryTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    natural_language: '自然语言',
    structured: '结构化',
    visual: '可视化',
    semantic: '语义搜索'
  }
  return labels[type] || type
}

const getQueryTypeTagType = (type: string) => {
  const types: Record<string, string> = {
    natural_language: 'primary',
    structured: 'success',
    visual: 'warning',
    semantic: 'info'
  }
  return types[type] || ''
}

const getNodeLabel = (nodeId: string) => {
  const node = queryResult.value?.result?.nodes.find(n => n.id === nodeId)
  return node?.label || nodeId
}

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadHistory()
})
</script>

<style scoped lang="scss">
.knowledge-query {
  .query-input-section {
    background: white;
    padding: 24px;
    border-radius: 8px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .input-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h3 {
        margin: 0;
        color: #2c3e50;
      }
    }

    .natural-language-query {
      .query-input-wrapper {
        margin-bottom: 20px;

        .query-textarea {
          margin-bottom: 12px;
        }

        .input-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
      }

      .query-suggestions {
        h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #606266;
        }

        .suggestion-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .suggestion-chip {
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              background-color: #409eff;
              color: white;
            }
          }
        }
      }
    }

    .structured-query {
      .query-builder {
        .query-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #f0f0f0;
        }
      }
    }

    .visual-query {
      .visual-builder {
        .builder-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          .zoom-controls {
            display: flex;
            gap: 4px;
          }
        }

        .visual-canvas {
          height: 400px;
          background: #f8f9fa;
          border: 2px dashed #dcdfe6;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #909399;
          margin-bottom: 16px;
        }

        .query-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
      }
    }

    .semantic-query {
      .semantic-input {
        .semantic-input-field {
          margin-bottom: 20px;
        }

        .semantic-options {
          .el-form-item {
            margin-bottom: 16px;
          }

          .el-checkbox-group {
            display: flex;
            gap: 16px;
          }
        }
      }
    }
  }

  .query-results {
    background: white;
    border-radius: 8px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .results-header {
      padding: 20px 24px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        color: #2c3e50;
      }

      .results-stats {
        display: flex;
        gap: 8px;
      }
    }

    .result-tabs {
      .overview-results {
        padding: 24px;

        .intelligent-answer {
          background: #f0f9ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 24px;

          h4 {
            margin: 0 0 12px 0;
            color: #1e40af;
          }

          .answer-content {
            p {
              margin: 0 0 16px 0;
              line-height: 1.6;
              color: #374151;
            }

            .answer-confidence {
              span {
                margin-right: 8px;
                font-size: 14px;
                color: #6b7280;
              }
            }
          }
        }

        .path-results {
          h4 {
            margin: 0 0 16px 0;
            color: #2c3e50;
          }

          .path-list {
            .path-item {
              background: #f8f9fa;
              border: 1px solid #e9ecef;
              border-radius: 6px;
              padding: 16px;
              margin-bottom: 12px;

              .path-score {
                margin-bottom: 12px;
              }

              .path-nodes {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-bottom: 12px;
              }

              .path-actions {
                display: flex;
                gap: 8px;
              }
            }
          }
        }
      }

      .nodes-results {
        padding: 24px;

        .nodes-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 20px;

          .node-card {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;

            .node-header {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 12px;

              h4 {
                margin: 0;
                flex: 1;
                color: #2c3e50;
              }
            }

            .node-description {
              margin-bottom: 16px;

              p {
                margin: 0;
                color: #6b7280;
                line-height: 1.5;
              }
            }

            .node-properties {
              margin-bottom: 16px;

              h5 {
                margin: 0 0 8px 0;
                font-size: 14px;
                color: #374151;
              }

              .properties-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;

                .property-item {
                  font-size: 13px;

                  .property-key {
                    color: #6b7280;
                  }

                  .property-value {
                    color: #374151;
                    font-weight: 500;
                  }
                }
              }
            }

            .node-metadata {
              .metadata-item {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
                font-size: 13px;

                .metadata-label {
                  color: #6b7280;
                  min-width: 60px;
                }

                .tag-item {
                  margin-right: 4px;
                }
              }
            }
          }
        }
      }

      .network-results {
        padding: 24px;

        .network-canvas {
          height: 500px;
          background: #f8f9fa;
          border-radius: 6px;
          margin-bottom: 16px;
        }

        .network-controls {
          display: flex;
          justify-content: center;
        }
      }

      .execution-details {
        padding: 24px;

        .execution-stats {
          margin-bottom: 32px;

          h4 {
            margin: 0 0 16px 0;
            color: #2c3e50;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;

            .stat-item {
              background: #f8f9fa;
              padding: 16px;
              border-radius: 6px;
              border: 1px solid #e9ecef;

              .stat-label {
                display: block;
                color: #6b7280;
                font-size: 13px;
                margin-bottom: 4px;
              }

              .stat-value {
                color: #374151;
                font-weight: 600;
              }
            }
          }
        }

        .query-details {
          h4 {
            margin: 0 0 16px 0;
            color: #2c3e50;
          }
        }
      }
    }
  }

  .query-history {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h4 {
        margin: 0;
        color: #2c3e50;
      }
    }

    .history-list {
      .history-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
        transition: background-color 0.3s ease;

        &:hover {
          background-color: #f8f9fa;
        }

        &:last-child {
          border-bottom: none;
        }

        .history-query {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;

          .query-text {
            color: #374151;
            max-width: 400px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .history-time {
          color: #9ca3af;
          font-size: 13px;
        }
      }
    }
  }
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-tabs__header) {
  margin: 0;
}

:deep(.el-tabs__nav-wrap) {
  padding: 0 24px;
}
</style>