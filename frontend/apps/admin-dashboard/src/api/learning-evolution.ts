import type { AxiosResponse } from 'axios'

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// 基于fetch的HTTP客户端实现
class HttpClient {
  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const fullUrl = this.buildUrl(url, params)
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: this.getHeaders()
    })
    return this.handleResponse(response)
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    })
    return this.handleResponse(response)
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    })
    return this.handleResponse(response)
  }

  async delete<T>(url: string, params?: Record<string, any>): Promise<T> {
    const fullUrl = this.buildUrl(url, params)
    const response = await fetch(fullUrl, {
      method: 'DELETE',
      headers: this.getHeaders()
    })
    return this.handleResponse(response)
  }

  private buildUrl(url: string, params?: Record<string, any>): string {
    const fullUrl = `${API_BASE_URL}${url}`
    if (!params) return fullUrl

    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    }
    return `${fullUrl}?${searchParams.toString()}`
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // 添加认证token
    const token = this.getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  private getToken(): string | null {
    return localStorage.getItem('token') || null
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    return response.json() as Promise<T>
  }
}

// 创建HttpClient实例
const httpClient = new HttpClient()

// 学习类型
export enum LearningType {
  SUPERVISED = 'supervised',       // 监督学习
  UNSUPERVISED = 'unsupervised',   // 无监督学习
  REINFORCEMENT = 'reinforcement', // 强化学习
  TRANSFER = 'transfer',           // 迁移学习
  FEDERATED = 'federated',         // 联邦学习
  SELF_SUPERVISED = 'self_supervised', // 自监督学习
  ACTIVE = 'active',               // 主动学习
  CONTINUAL = 'continual',         // 持续学习
  META = 'meta'                   // 元学习
}

// 进化策略
export enum EvolutionStrategy {
  GENETIC_ALGORITHM = 'genetic_algorithm',    // 遗传算法
  PARTICLE_SWARM = 'particle_swarm',          // 粒子群算法
  DIFFERENTIAL_EVOLUTION = 'differential_evolution', // 差分进化
  NEUROEVOLUTION = 'neuroevolution',          // 神经进化
  EVOLUTIONARY_STRATEGY = 'evolutionary_strategy', // 进化策略
  COEVOLUTION = 'coevolution',                // 协同进化
  MULTI_OBJECTIVE = 'multi_objective'         // 多目标进化
}

// 学习状态
export enum LearningStatus {
  IDLE = 'idle',             // 空闲
  TRAINING = 'training',     // 训练中
  EVALUATING = 'evaluating', // 评估中
  COMPLETED = 'completed',   // 已完成
  FAILED = 'failed',         // 失败
  PAUSED = 'paused',         // 暂停
  DEPLOYED = 'deployed'      // 已部署
}

// 学习模式
export interface LearningMode {
  id: string
  name: string
  type: LearningType
  description: string
  algorithm: string
  parameters: Record<string, any>
  hyperparameters: Record<string, any>
  dataRequirements: {
    trainingSize: number
    validationSize: number
    testSize: number
    features: string[]
    labels?: string[]
  }
  performance: {
    accuracy?: number
    precision?: number
    recall?: number
    f1Score?: number
    auc?: number
    loss?: number
    convergenceEpoch?: number
  }
  capabilities: string[]
  limitations: string[]
  useCases: string[]
}

// 学习模型
export interface LearningModel {
  id: string
  name: string
  version: string
  type: LearningType
  architecture: string
  framework: string
  parameters: {
    total: number
    trainable: number
    frozen: number
  }
  training: {
    datasetId: string
    startTime: string
    endTime?: string
    epochs: number
    batchSize: number
    learningRate: number
    optimizer: string
    lossFunction: string
    metrics: string[]
  }
  evaluation: {
    accuracy: number
    precision: number
    recall: number
    f1Score: number
    confusionMatrix?: number[][]
    classificationReport?: Record<string, any>
    rocAuc?: number
    prAuc?: number
  }
  deployment: {
    status: 'draft' | 'testing' | 'staging' | 'production' | 'deprecated'
    endpoint?: string
    version: string
    deployedAt?: string
    metrics: {
      requestsPerSecond: number
      averageLatency: number
      errorRate: number
      cpuUsage: number
      memoryUsage: number
    }
  }
  metadata: {
    description: string
    tags: string[]
    category: string
    domain: string
    owner: string
    createdAt: string
    updatedAt: string
  }
}

// 数据集
export interface Dataset {
  id: string
  name: string
  description: string
  type: 'training' | 'validation' | 'test' | 'production'
  format: 'csv' | 'json' | 'parquet' | 'tfrecord' | 'hdf5'
  size: {
    samples: number
    features: number
    classes?: number
    storage: number // bytes
  }
  schema: {
    features: Array<{
      name: string
      type: 'numeric' | 'categorical' | 'text' | 'image' | 'audio' | 'video'
      description: string
      nullable: boolean
    }>
    target?: {
      name: string
      type: 'numeric' | 'categorical'
      description: string
      classes?: string[]
    }
  }
  statistics: {
    missingValues: number
    duplicates: number
    outliers: number
    correlation?: number[][]
    distribution?: Record<string, any>
  }
  quality: {
    completeness: number // 0-1
    consistency: number // 0-1
    validity: number // 0-1
    uniqueness: number // 0-1
    timeliness: number // 0-1
  }
  preprocessing: {
    steps: Array<{
      type: string
      parameters: Record<string, any>
      appliedAt: string
    }>
    augmented: boolean
    balanced: boolean
  }
  source: {
    origin: string
    collectionMethod: string
    timestamp: string
    version: string
  }
  access: {
    permissions: string[]
    restrictions: string[]
    lastAccessed?: string
    downloadCount: number
  }
  createdAt: string
  updatedAt: string
}

// 进化种群
export interface EvolutionPopulation {
  id: string
  name: string
  description: string
  strategy: EvolutionStrategy
  generation: number
  individuals: Array<{
    id: string
    genome: number[]
    fitness: number
    age: number
    parents: string[]
    mutations: Array<{
      gene: number
      oldValue: number
      newValue: number
      timestamp: string
    }>
    performance: {
      accuracy?: number
      efficiency?: number
      robustness?: number
      adaptability?: number
    }
  }>
  statistics: {
    bestFitness: number
    averageFitness: number
    worstFitness: number
    standardDeviation: number
    diversity: number
    convergenceRate: number
  }
  parameters: {
    populationSize: number
    mutationRate: number
    crossoverRate: number
    selectionMethod: string
    elitismCount: number
    tournamentSize: number
  }
  history: Array<{
    generation: number
    bestFitness: number
    averageFitness: number
    diversity: number
    timestamp: string
  }>
  createdAt: string
  updatedAt: string
}

// 学习实验
export interface LearningExperiment {
  id: string
  name: string
  description: string
  objective: string
  type: LearningType
  status: LearningStatus
  config: {
    modelArchitecture: string
    trainingParameters: Record<string, any>
    evaluationMetrics: string[]
    dataSplit: {
      training: number
      validation: number
      test: number
    }
  }
  datasets: {
    training: string[]
    validation: string[]
    test: string[]
  }
  results: {
    trainingLoss: Array<{
      epoch: number
      loss: number
      timestamp: string
    }>
    validationMetrics: Array<{
      epoch: number
      metrics: Record<string, number>
      timestamp: string
    }>
    bestModel?: string
    finalMetrics: Record<string, number>
    confusionMatrix?: number[][]
    featureImportance?: Record<string, number>
    learningCurve?: Array<{
      samples: number
      trainingScore: number
      validationScore: number
    }>
  }
  artifacts: Array<{
    name: string
    type: 'model' | 'logs' | 'checkpoints' | 'visualizations' | 'metrics'
    path: string
    size: number
    createdAt: string
  }>
  environment: {
    framework: string
    version: string
    hardware: string
    runtime: string
    dependencies: Record<string, string>
  }
  metadata: {
    creator: string
    tags: string[]
    category: string
    priority: 'low' | 'medium' | 'high'
    estimatedDuration: number // minutes
    actualDuration?: number // minutes
    cost?: number
  }
  createdAt: string
  startedAt?: string
  completedAt?: string
}

// 自适应学习系统
export interface AdaptiveLearningSystem {
  id: string
  name: string
  description: string
  components: {
    models: Array<{
      modelId: string
      role: string
      weight: number
      lastUpdated: string
    }>
    dataPipelines: Array<{
      id: string
      source: string
      processing: string[]
      destination: string
      status: 'active' | 'inactive' | 'error'
    }>
    feedbackLoops: Array<{
      id: string
      trigger: string
      action: string
      conditions: Record<string, any>
    }>
  }
  adaptation: {
    strategy: 'incremental' | 'batch' | 'online' | 'hybrid'
    triggers: Array<{
      type: 'performance' | 'data_drift' | 'concept_drift' | 'time_based'
      threshold: number
      action: string
    }>
    schedule: {
      frequency: string
      window: string
      retention: string
    }
  }
  performance: {
    overallAccuracy: number
    adaptationRate: number
    stability: number
    responsiveness: number
    resourceEfficiency: number
  }
  monitoring: {
    metrics: Array<{
      name: string
      currentValue: number
      targetValue: number
      trend: 'improving' | 'stable' | 'degrading'
      lastChecked: string
    }>
    alerts: Array<{
      id: string
      type: 'warning' | 'error' | 'info'
      message: string
      timestamp: string
      acknowledged: boolean
    }>
  }
  governance: {
    policies: Array<{
      id: string
      name: string
      rules: string[]
      enforced: boolean
    }>
    explainability: {
      enabled: boolean
      methods: string[]
      detail: 'low' | 'medium' | 'high'
    }
    fairness: {
      metrics: string[]
      thresholds: Record<string, number>
      reports: Array<{
        timestamp: string
        scores: Record<string, number>
        passed: boolean
      }>
    }
  }
  createdAt: string
  updatedAt: string
  lastAdaptation: string
}

// 知识转移
export interface KnowledgeTransfer {
  id: string
  name: string
  description: string
  type: 'model_to_model' | 'data_to_model' | 'feature_to_feature' | 'domain_to_domain'
  source: {
    modelId?: string
    datasetId?: string
    domain: string
    performance: Record<string, number>
  }
  target: {
    modelId?: string
    datasetId?: string
    domain: string
    baseline: Record<string, number>
  }
  method: {
    algorithm: string
    parameters: Record<string, any>
    layers?: string[]
    features?: string[]
  }
  results: {
    transferEfficiency: number
    performanceGain: Record<string, number>
    adaptationTime: number
    sampleEfficiency: number
    retainedKnowledge: number
  }
  validation: {
    crossValidation: boolean
    statisticalSignificance: boolean
    ablationStudy: boolean
  }
  metadata: {
    creator: string
    tags: string[]
    category: string
    cost: number
    duration: number
  }
  createdAt: string
  completedAt?: string
}

// 学习进化API
class LearningEvolutionAPI {
  /**
   * 获取学习模式列表
   */
  async getLearningModes(params?: {
    type?: LearningType
    category?: string
    limit?: number
    offset?: number
  }): Promise<{
    success: boolean
    data?: {
      modes: LearningMode[]
      total: number
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/learning-evolution/modes', {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get learning modes failed:', error)
      throw error
    }
  }

  /**
   * 获取学习模型列表
   */
  async getLearningModels(params?: {
    type?: LearningType
    status?: string
    category?: string
    domain?: string
    limit?: number
    offset?: number
  }): Promise<{
    success: boolean
    data?: {
      models: LearningModel[]
      total: number
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/learning-evolution/models', {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get learning models failed:', error)
      throw error
    }
  }

  /**
   * 获取模型详情
   */
  async getLearningModel(modelId: string): Promise<{
    success: boolean
    data?: LearningModel
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get(`/learning-evolution/models/${modelId}`)
      return response.data
    } catch (error) {
      console.error('Get learning model failed:', error)
      throw error
    }
  }

  /**
   * 创建学习模型
   */
  async createLearningModel(model: Partial<LearningModel>): Promise<{
    success: boolean
    data?: LearningModel
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/learning-evolution/models', model)
      return response.data
    } catch (error) {
      console.error('Create learning model failed:', error)
      throw error
    }
  }

  /**
   * 训练模型
   */
  async trainModel(modelId: string, config: {
    datasetId: string
    hyperparameters?: Record<string, any>
    epochs?: number
    batchSize?: number
    validationSplit?: number
  }): Promise<{
    success: boolean
    data?: {
      experimentId: string
      estimatedDuration: number
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post(`/learning-evolution/models/${modelId}/train`, config)
      return response.data
    } catch (error) {
      console.error('Train model failed:', error)
      throw error
    }
  }

  /**
   * 部署模型
   */
  async deployModel(modelId: string, config: {
    environment: 'staging' | 'production'
    scaling: {
      minInstances: number
      maxInstances: number
      targetCpuUtilization: number
    }
    monitoring?: {
      enableLogging: boolean
      enableMetrics: boolean
      alertThresholds?: Record<string, number>
    }
  }): Promise<{
    success: boolean
    data?: {
      endpoint: string
      deploymentId: string
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post(`/learning-evolution/models/${modelId}/deploy`, config)
      return response.data
    } catch (error) {
      console.error('Deploy model failed:', error)
      throw error
    }
  }

  /**
   * 获取数据集列表
   */
  async getDatasets(params?: {
    type?: string
    category?: string
    domain?: string
    format?: string
    limit?: number
    offset?: number
  }): Promise<{
    success: boolean
    data?: {
      datasets: Dataset[]
      total: number
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/learning-evolution/datasets', {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get datasets failed:', error)
      throw error
    }
  }

  /**
   * 上传数据集
   */
  async uploadDataset(file: File, metadata: {
    name: string
    description: string
    type: 'training' | 'validation' | 'test'
    category: string
    domain: string
  }): Promise<{
    success: boolean
    data?: {
      datasetId: string
      uploadUrl: string
    }
    message?: string
  }> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('metadata', JSON.stringify(metadata))

      const response: AxiosResponse = await httpClient.post('/learning-evolution/datasets/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Upload dataset failed:', error)
      throw error
    }
  }

  /**
   * 获取进化种群
   */
  async getEvolutionPopulations(params?: {
    strategy?: EvolutionStrategy
    status?: string
    limit?: number
    offset?: number
  }): Promise<{
    success: boolean
    data?: {
      populations: EvolutionPopulation[]
      total: number
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/learning-evolution/populations', {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get evolution populations failed:', error)
      throw error
    }
  }

  /**
   * 创建进化种群
   */
  async createEvolutionPopulation(population: Partial<EvolutionPopulation>): Promise<{
    success: boolean
    data?: EvolutionPopulation
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/learning-evolution/populations', population)
      return response.data
    } catch (error) {
      console.error('Create evolution population failed:', error)
      throw error
    }
  }

  /**
   * 运行进化算法
   */
  async runEvolution(populationId: string, config: {
    generations: number
    objectives: string[]
    constraints?: Record<string, any>
    parallel?: boolean
  }): Promise<{
    success: boolean
    data?: {
      runId: string
      estimatedDuration: number
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post(`/learning-evolution/populations/${populationId}/run`, config)
      return response.data
    } catch (error) {
      console.error('Run evolution failed:', error)
      throw error
    }
  }

  /**
   * 获取学习实验
   */
  async getLearningExperiments(params?: {
    type?: LearningType
    status?: LearningStatus
    creator?: string
    limit?: number
    offset?: number
  }): Promise<{
    success: boolean
    data?: {
      experiments: LearningExperiment[]
      total: number
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/learning-evolution/experiments', {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get learning experiments failed:', error)
      throw error
    }
  }

  /**
   * 创建学习实验
   */
  async createLearningExperiment(experiment: Partial<LearningExperiment>): Promise<{
    success: boolean
    data?: LearningExperiment
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/learning-evolution/experiments', experiment)
      return response.data
    } catch (error) {
      console.error('Create learning experiment failed:', error)
      throw error
    }
  }

  /**
   * 获取自适应学习系统
   */
  async getAdaptiveLearningSystems(params?: {
    category?: string
    status?: string
    limit?: number
    offset?: number
  }): Promise<{
    success: boolean
    data?: {
      systems: AdaptiveLearningSystem[]
      total: number
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/learning-evolution/adaptive-systems', {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get adaptive learning systems failed:', error)
      throw error
    }
  }

  /**
   * 创建自适应学习系统
   */
  async createAdaptiveLearningSystem(system: Partial<AdaptiveLearningSystem>): Promise<{
    success: boolean
    data?: AdaptiveLearningSystem
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/learning-evolution/adaptive-systems', system)
      return response.data
    } catch (error) {
      console.error('Create adaptive learning system failed:', error)
      throw error
    }
  }

  /**
   * 触发系统适应
   */
  async triggerAdaptation(systemId: string, config: {
    trigger: string
    scope: 'full' | 'incremental' | 'selective'
    priority: 'low' | 'medium' | 'high'
  }): Promise<{
    success: boolean
    data?: {
      adaptationId: string
      estimatedDuration: number
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post(`/learning-evolution/adaptive-systems/${systemId}/adapt`, config)
      return response.data
    } catch (error) {
      console.error('Trigger adaptation failed:', error)
      throw error
    }
  }

  /**
   * 获取知识转移
   */
  async getKnowledgeTransfers(params?: {
    type?: string
    sourceDomain?: string
    targetDomain?: string
    limit?: number
    offset?: number
  }): Promise<{
    success: boolean
    data?: {
      transfers: KnowledgeTransfer[]
      total: number
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/learning-evolution/knowledge-transfers', {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get knowledge transfers failed:', error)
      throw error
    }
  }

  /**
   * 执行知识转移
   */
  async executeKnowledgeTransfer(transfer: Partial<KnowledgeTransfer>): Promise<{
    success: boolean
    data?: {
      transferId: string
      estimatedDuration: number
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/learning-evolution/knowledge-transfers', transfer)
      return response.data
    } catch (error) {
      console.error('Execute knowledge transfer failed:', error)
      throw error
    }
  }

  /**
   * 获取学习性能分析
   */
  async getLearningPerformance(params: {
    modelId?: string
    systemId?: string
    experimentId?: string
    period?: 'hour' | 'day' | 'week' | 'month'
    metrics?: string[]
  }): Promise<{
    success: boolean
    data?: {
      performance: Array<{
        timestamp: string
        metrics: Record<string, number>
      }>
      trends: Record<string, {
        direction: 'improving' | 'stable' | 'degrading'
        rate: number
        significance: number
      }>
      recommendations: Array<{
        type: string
        priority: 'low' | 'medium' | 'high'
        description: string
        expectedImpact: string
      }>
      summary: {
        averagePerformance: number
        bestMetric: string
        worstMetric: string
        improvementRate: number
        stability: number
      }
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/learning-evolution/performance', {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get learning performance failed:', error)
      throw error
    }
  }

  /**
   * 获取学习预测
   */
  async getLearningPredictions(params: {
    type: 'performance' | 'failure' | 'resource' | 'timeline'
    horizon: 'short' | 'medium' | 'long'
    targets?: string[]
    confidence?: number
  }): Promise<{
    success: boolean
    data?: {
      predictions: Array<{
        target: string
        prediction: any
        confidence: number
        timeframe: string
        factors: Array<{
          name: string
          impact: number
          correlation: number
        }>
      }>
      model: {
        name: string
        version: string
        accuracy: number
      }
      generatedAt: string
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/learning-evolution/predictions', {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get learning predictions failed:', error)
      throw error
    }
  }
}

export const learningEvolutionAPI = new LearningEvolutionAPI()
export default learningEvolutionAPI