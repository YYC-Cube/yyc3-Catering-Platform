// HTTP Client Configuration
const API_BASE_URL = '/api/knowledge-graph'

// Simple fetch-based HTTP Client
class HttpClient {
  private buildUrl(path: string, params?: Record<string, any>): string {
    const url = new URL(`${API_BASE_URL}${path}`)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }
    
    return url.toString()
  }

  private async getHeaders(includeAuth: boolean = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }
    
    if (includeAuth) {
      const token = localStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }
    
    return headers
  }

  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    const response = await fetch(this.buildUrl(path, params), {
      method: 'GET',
      headers: await this.getHeaders()
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async post<T>(path: string, data?: any): Promise<T> {
    const response = await fetch(this.buildUrl(path), {
      method: 'POST',
      headers: await this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async put<T>(path: string, data?: any): Promise<T> {
    const response = await fetch(this.buildUrl(path), {
      method: 'PUT',
      headers: await this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async delete<T>(path: string): Promise<T> {
    const response = await fetch(this.buildUrl(path), {
      method: 'DELETE',
      headers: await this.getHeaders()
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }
}

// Create HTTP client instance
const httpClient = new HttpClient()

// 知识节点类型
export enum KnowledgeNodeType {
  CONCEPT = 'concept',           // 概念
  ENTITY = 'entity',             // 实体
  RELATIONSHIP = 'relationship', // 关系
  RULE = 'rule',                 // 规则
  PROCEDURE = 'procedure',       // 流程
  DOCUMENT = 'document',         // 文档
  EVENT = 'event',               // 事件
  LOCATION = 'location',         // 位置
  PERSON = 'person',             // 人物
  ORGANIZATION = 'organization'  // 组织
}

// 关系类型
export enum RelationshipType {
  IS_A = 'is_a',                 // 是一种
  PART_OF = 'part_of',           // 是一部分
  RELATED_TO = 'related_to',     // 相关
  CAUSES = 'causes',             // 导致
  ENABLES = 'enables',           // 使能
  REQUIRES = 'requires',         // 需要
  SIMILAR_TO = 'similar_to',     // 相似
  OPPOSITE_OF = 'opposite_of',   // 相反
  INSTANCE_OF = 'instance_of',   // 实例
  SUBCLASS_OF = 'subclass_of',   // 子类
  LOCATED_IN = 'located_in',     // 位于
  WORKS_FOR = 'works_for',       // 工作于
  KNOWS = 'knows',               // 认识
  COLLABORATES_WITH = 'collaborates_with', // 协作
  DEPENDS_ON = 'depends_on'      // 依赖
}

// 知识节点
export interface KnowledgeNode {
  id: string
  type: KnowledgeNodeType
  label: string
  description: string
  properties: Record<string, any>
  metadata: {
    source: string
    confidence: number
    createdBy: string
    createdAt: string
    updatedAt: string
    version: number
    tags: string[]
    category: string
  }
  embeddings?: {
    vector: number[]
    model: string
    dimensions: number
  }
  validation: {
    verified: boolean
    verifiedBy?: string
    verifiedAt?: string
    disputes: Array<{
      id: string
      reason: string
      reportedBy: string
      reportedAt: string
      resolved: boolean
    }>
  }
}

// 知识关系
export interface KnowledgeRelationship {
  id: string
  sourceId: string
  targetId: string
  type: RelationshipType
  label: string
  description: string
  properties: Record<string, any>
  metadata: {
    source: string
    confidence: number
    createdBy: string
    createdAt: string
    updatedAt: string
    version: number
    tags: string[]
  }
  validation: {
    verified: boolean
    verifiedBy?: string
    verifiedAt?: string
    disputes: Array<{
      id: string
      reason: string
      reportedBy: string
      reportedAt: string
      resolved: boolean
    }>
  }
}

// 知识图谱
export interface KnowledgeGraph {
  id: string
  name: string
  description: string
  domain: string
  version: string
  statistics: {
    nodeCount: number
    relationshipCount: number
    categoryDistribution: Record<string, number>
    lastUpdated: string
  }
  configuration: {
    nodeTypes: KnowledgeNodeType[]
    relationshipTypes: RelationshipType[]
    customProperties: Record<string, {
      type: 'string' | 'number' | 'boolean' | 'date' | 'array'
      required: boolean
      default?: any
    }>
    validationRules: Array<{
      condition: string
      action: 'warn' | 'prevent' | 'require_approval'
    }>
  }
  permissions: {
    read: string[]
    write: string[]
    admin: string[]
    public: boolean
  }
  createdAt: string
  updatedAt: string
}

// 知识查询
export interface KnowledgeQuery {
  id: string
  query: string
  type: 'natural_language' | 'structured' | 'visual' | 'semantic'
  parameters: Record<string, any>
  filters: {
    nodeTypes?: KnowledgeNodeType[]
    relationshipTypes?: RelationshipType[]
    dateRange?: {
      start: string
      end: string
    }
    confidence?: {
      min: number
      max: number
    }
    tags?: string[]
  }
  context?: {
    domain?: string
    previousQueries?: string[]
    userIntent?: string
  }
  result?: {
    nodes: KnowledgeNode[]
    relationships: KnowledgeRelationship[]
    paths: Array<{
      nodes: string[]
      relationships: string[]
      score: number
    }>
    answer: string
    confidence: number
    sources: string[]
  }
  execution: {
    duration: number
    nodesSearched: number
    relationshipsExplored: number
    algorithm: string
    cacheHit: boolean
  }
  createdBy: string
  createdAt: string
}

// 知识推理
export interface KnowledgeInference {
  id: string
  type: 'deductive' | 'inductive' | 'abductive' | 'analogical' | 'causal'
  premises: Array<{
    nodeId: string
    statement: string
    confidence: number
  }>
  conclusion: {
    statement: string
    confidence: number
    supportingNodes: string[]
    supportingRelationships: string[]
  }
  reasoning: string
  validity: {
    soundness: number
    completeness: number
    consistency: number
  }
  metadata: {
    algorithm: string
    model: string
    executionTime: number
    timestamp: string
  }
}

// 知识学习
export interface KnowledgeLearning {
  id: string
  type: 'supervised' | 'unsupervised' | 'reinforcement' | 'transfer'
  source: {
    type: 'document' | 'database' | 'api' | 'user_input' | 'conversation'
    identifier: string
    description: string
  }
  extraction: {
    nodes: KnowledgeNode[]
    relationships: KnowledgeRelationship[]
    confidence: number
    method: string
  }
  validation: {
    autoValidated: number
    manualValidation: number
    disputes: number
    accuracy: number
  }
  integration: {
    acceptedNodes: number
    acceptedRelationships: number
    modifications: Array<{
      type: 'add' | 'update' | 'delete'
      target: string
      reason: string
    }>
  }
  metadata: {
    model: string
    version: string
    timestamp: string
    processingTime: number
  }
}

// 知识图谱API
class KnowledgeGraphAPI {
  /**
   * 获取知识图谱列表
   */
  async getKnowledgeGraphs(params?: {
    domain?: string
    public?: boolean
    permission?: 'read' | 'write' | 'admin'
    limit?: number
    offset?: number
  }): Promise<{
    success: boolean
    data?: {
      graphs: KnowledgeGraph[]
      total: number
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/knowledge-graph/graphs', {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get knowledge graphs failed:', error)
      throw error
    }
  }

  /**
   * 获取知识图谱详情
   */
  async getKnowledgeGraph(graphId: string): Promise<{
    success: boolean
    data?: KnowledgeGraph
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get(`/knowledge-graph/graphs/${graphId}`)
      return response.data
    } catch (error) {
      console.error('Get knowledge graph failed:', error)
      throw error
    }
  }

  /**
   * 创建知识图谱
   */
  async createKnowledgeGraph(graph: Partial<KnowledgeGraph>): Promise<{
    success: boolean
    data?: KnowledgeGraph
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/knowledge-graph/graphs', graph)
      return response.data
    } catch (error) {
      console.error('Create knowledge graph failed:', error)
      throw error
    }
  }

  /**
   * 搜索知识节点
   */
  async searchNodes(params: {
    graphId: string
    query: string
    type?: KnowledgeNodeType
    filters?: Record<string, any>
    searchType?: 'text' | 'semantic' | 'hybrid'
    limit?: number
    offset?: number
  }): Promise<{
    success: boolean
    data?: {
      nodes: KnowledgeNode[]
      total: number
      suggestions: string[]
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get(`/knowledge-graph/nodes/search`, {
        params
      })
      return response.data
    } catch (error) {
      console.error('Search nodes failed:', error)
      throw error
    }
  }

  /**
   * 获取节点详情
   */
  async getNode(nodeId: string): Promise<{
    success: boolean
    data?: KnowledgeNode
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get(`/knowledge-graph/nodes/${nodeId}`)
      return response.data
    } catch (error) {
      console.error('Get node failed:', error)
      throw error
    }
  }

  /**
   * 创建知识节点
   */
  async createNode(node: Partial<KnowledgeNode>): Promise<{
    success: boolean
    data?: KnowledgeNode
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/knowledge-graph/nodes', node)
      return response.data
    } catch (error) {
      console.error('Create node failed:', error)
      throw error
    }
  }

  /**
   * 更新知识节点
   */
  async updateNode(nodeId: string, updates: Partial<KnowledgeNode>): Promise<{
    success: boolean
    data?: KnowledgeNode
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.put(`/knowledge-graph/nodes/${nodeId}`, updates)
      return response.data
    } catch (error) {
      console.error('Update node failed:', error)
      throw error
    }
  }

  /**
   * 删除知识节点
   */
  async deleteNode(nodeId: string): Promise<{
    success: boolean
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.delete(`/knowledge-graph/nodes/${nodeId}`)
      return response.data
    } catch (error) {
      console.error('Delete node failed:', error)
      throw error
    }
  }

  /**
   * 获取节点关系
   */
  async getNodeRelationships(nodeId: string, params?: {
    type?: RelationshipType
    direction?: 'incoming' | 'outgoing' | 'both'
    limit?: number
    offset?: number
  }): Promise<{
    success: boolean
    data?: {
      relationships: KnowledgeRelationship[]
      total: number
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get(`/knowledge-graph/nodes/${nodeId}/relationships`, {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get node relationships failed:', error)
      throw error
    }
  }

  /**
   * 创建关系
   */
  async createRelationship(relationship: Partial<KnowledgeRelationship>): Promise<{
    success: boolean
    data?: KnowledgeRelationship
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/knowledge-graph/relationships', relationship)
      return response.data
    } catch (error) {
      console.error('Create relationship failed:', error)
      throw error
    }
  }

  /**
   * 查询知识图谱
   */
  async queryKnowledgeGraph(query: Partial<KnowledgeQuery>): Promise<{
    success: boolean
    data?: KnowledgeQuery
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/knowledge-graph/query', query)
      return response.data
    } catch (error) {
      console.error('Query knowledge graph failed:', error)
      throw error
    }
  }

  /**
   * 知识推理
   */
  async performInference(params: {
    graphId: string
    type: KnowledgeInference['type']
    premises: Array<{
      nodeId: string
      statement: string
    }>
    maxDepth?: number
    algorithm?: string
  }): Promise<{
    success: boolean
    data?: KnowledgeInference[]
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/knowledge-graph/inference', params)
      return response.data
    } catch (error) {
      console.error('Perform inference failed:', error)
      throw error
    }
  }

  /**
   * 知识学习
   */
  async learnFromSource(params: {
    graphId: string
    source: KnowledgeLearning['source']
    extraction: {
      method: string
      confidence: number
    }
    validation: {
      autoValidate: boolean
      requireApproval: boolean
    }
  }): Promise<{
    success: boolean
    data?: KnowledgeLearning
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/knowledge-graph/learn', params)
      return response.data
    } catch (error) {
      console.error('Knowledge learning failed:', error)
      throw error
    }
  }

  /**
   * 获取图谱可视化数据
   */
  async getVisualizationData(params: {
    graphId: string
    nodeIds?: string[]
    depth?: number
    layout?: 'force' | 'circular' | 'hierarchical' | 'grid'
    filters?: Record<string, any>
  }): Promise<{
    success: boolean
    data?: {
      nodes: Array<{
        id: string
        label: string
        type: string
        properties: Record<string, any>
        position?: { x: number; y: number }
        color?: string
        size?: number
      }>
      edges: Array<{
        id: string
        source: string
        target: string
        type: string
        label: string
        properties: Record<string, any>
        color?: string
        width?: number
      }>
      layout: {
        type: string
        dimensions: { width: number; height: number }
        physics: boolean
      }
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/knowledge-graph/visualization', {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get visualization data failed:', error)
      throw error
    }
  }

  /**
   * 导出知识图谱
   */
  async exportGraph(params: {
    graphId: string
    format: 'json' | 'rdf' | 'csv' | 'graphml' | 'gexf'
    includeMetadata?: boolean
    filters?: Record<string, any>
  }): Promise<{
    success: boolean
    data?: {
      downloadUrl: string
      filename: string
      size: number
      format: string
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/knowledge-graph/export', params)
      return response.data
    } catch (error) {
      console.error('Export graph failed:', error)
      throw error
    }
  }

  /**
   * 导入知识图谱
   */
  async importGraph(params: {
    file: File
    format: 'json' | 'rdf' | 'csv' | 'graphml' | 'gexf'
    graphId?: string
    mergeStrategy?: 'replace' | 'merge' | 'append'
    validation?: 'strict' | 'lenient' | 'skip'
  }): Promise<{
    success: boolean
    data?: {
      graphId: string
      nodesImported: number
      relationshipsImported: number
      errors: string[]
    }
    message?: string
  }> {
    try {
      const formData = new FormData()
      formData.append('file', params.file)
      formData.append('format', params.format)
      if (params.graphId) formData.append('graphId', params.graphId)
      if (params.mergeStrategy) formData.append('mergeStrategy', params.mergeStrategy)
      if (params.validation) formData.append('validation', params.validation)

      const response: AxiosResponse = await httpClient.post('/knowledge-graph/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Import graph failed:', error)
      throw error
    }
  }

  /**
   * 获取知识统计
   */
  async getStatistics(params: {
    graphId: string
    period?: 'day' | 'week' | 'month' | 'year'
    metrics?: string[]
  }): Promise<{
    success: boolean
    data?: {
      overview: {
        totalNodes: number
        totalRelationships: number
        nodeTypes: Record<string, number>
        relationshipTypes: Record<string, number>
        growthRate: number
      }
      quality: {
        averageConfidence: number
        verifiedNodes: number
        verifiedRelationships: number
        disputeRate: number
      }
      activity: {
        nodesAdded: number
        relationshipsAdded: number
        updatesMade: number
        queriesExecuted: number
        activeUsers: number
      }
      trends: Array<{
        date: string
        nodes: number
        relationships: number
        queries: number
      }>
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/knowledge-graph/statistics', {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get statistics failed:', error)
      throw error
    }
  }

  /**
   * 知识验证
   */
  async validateKnowledge(params: {
    graphId: string
    scope?: 'all' | 'unverified' | 'disputed' | 'recent'
    rules?: string[]
    autoApprove?: boolean
    threshold?: number
  }): Promise<{
    success: boolean
    data?: {
      validated: number
      approved: number
      rejected: number
      pending: number
      issues: Array<{
        id: string
        type: 'inconsistency' | 'contradiction' | 'missing_info' | 'low_confidence'
        severity: 'low' | 'medium' | 'high' | 'critical'
        description: string
        suggestions: string[]
      }>
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/knowledge-graph/validate', params)
      return response.data
    } catch (error) {
      console.error('Validate knowledge failed:', error)
      throw error
    }
  }
}

export const knowledgeGraphAPI = new KnowledgeGraphAPI()
export default knowledgeGraphAPI