// 基于 fetch API 的 HTTP 客户端实现
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

class HttpClient {
  /**
   * 构建完整的请求 URL
   */
  private buildUrl(url: string): string {
    // 如果是绝对 URL，直接返回
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    // 否则，拼接基础 URL
    return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
  }

  /**
   * 构建请求头
   */
  private buildHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }

    // 添加认证令牌
    const token = localStorage.getItem('authToken')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  /**
   * 处理响应
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      // 尝试解析错误响应
      let errorData
      try {
        errorData = await response.json()
      } catch (error) {
        // 如果无法解析为 JSON，则使用状态文本
        errorData = { message: response.statusText }
      }

      // 抛出包含错误信息的异常
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    // 如果响应状态为 204 No Content，则返回空对象
    if (response.status === 204) {
      return {} as T
    }

    // 解析响应数据
    return response.json()
  }

  /**
   * GET 请求
   */
  async get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
    // 构建完整 URL
    let fullUrl = this.buildUrl(url)

    // 添加查询参数
    if (params) {
      const queryString = new URLSearchParams(
        Object.entries(params)
          .filter(([_, value]) => value !== undefined && value !== null)
          .map(([key, value]) => [key, String(value)])
      ).toString()

      if (queryString) {
        fullUrl += `?${queryString}`
      }
    }

    // 发送请求
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: this.buildHeaders()
    })

    // 处理响应
    return this.handleResponse<T>(response)
  }

  /**
   * POST 请求
   */
  async post<T = any>(url: string, data?: any): Promise<T> {
    // 发送请求
    const response = await fetch(this.buildUrl(url), {
      method: 'POST',
      headers: this.buildHeaders(),
      body: data ? JSON.stringify(data) : undefined
    })

    // 处理响应
    return this.handleResponse<T>(response)
  }

  /**
   * PUT 请求
   */
  async put<T = any>(url: string, data?: any): Promise<T> {
    // 发送请求
    const response = await fetch(this.buildUrl(url), {
      method: 'PUT',
      headers: this.buildHeaders(),
      body: data ? JSON.stringify(data) : undefined
    })

    // 处理响应
    return this.handleResponse<T>(response)
  }

  /**
   * DELETE 请求
   */
  async delete<T = any>(url: string, params?: Record<string, any>): Promise<T> {
    // 构建完整 URL
    let fullUrl = this.buildUrl(url)

    // 添加查询参数
    if (params) {
      const queryString = new URLSearchParams(
        Object.entries(params)
          .filter(([_, value]) => value !== undefined && value !== null)
          .map(([key, value]) => [key, String(value)])
      ).toString()

      if (queryString) {
        fullUrl += `?${queryString}`
      }
    }

    // 发送请求
    const response = await fetch(fullUrl, {
      method: 'DELETE',
      headers: this.buildHeaders()
    })

    // 处理响应
    return this.handleResponse<T>(response)
  }
}

// 创建 HTTP 客户端实例
const httpClient = new HttpClient()

// 机器人类型
export enum RobotType {
  SERVICE_ROBOT = 'service_robot',     // 服务机器人
  INDUSTRIAL_ROBOT = 'industrial_robot', // 工业机器人
  DELIVERY_ROBOT = 'delivery_robot',   // 配送机器人
  CLEANING_ROBOT = 'cleaning_robot',   // 清洁机器人
  SECURITY_ROBOT = 'security_robot',   // 安保机器人
  MEDICAL_ROBOT = 'medical_robot',     // 医疗机器人
  EDUCATIONAL_ROBOT = 'educational_robot', // 教育机器人
  AGRICULTURAL_ROBOT = 'agricultural_robot', // 农业机器人
  CONSTRUCTION_ROBOT = 'construction_robot', // 建筑机器人
  DOMESTIC_ROBOT = 'domestic_robot'    // 家用机器人
}

// 机器人状态
export enum RobotStatus {
  IDLE = 'idle',             // 空闲
  ACTIVE = 'active',         // 活跃
  BUSY = 'busy',             // 忙碌
  CHARGING = 'charging',     // 充电中
  MAINTENANCE = 'maintenance', // 维护中
  ERROR = 'error',           // 故障
  OFFLINE = 'offline',       // 离线
  UPDATING = 'updating',     // 更新中
  CALIBRATING = 'calibrating' // 校准中
}

// 任务类型
export enum TaskType {
  DELIVERY = 'delivery',         // 配送任务
  CLEANING = 'cleaning',         // 清洁任务
  INSPECTION = 'inspection',     // 巡检任务
  SECURITY = 'security',         // 安保任务
  MAINTENANCE = 'maintenance',   // 维护任务
  DATA_COLLECTION = 'data_collection', // 数据收集
  ASSISTANCE = 'assistance',     // 辅助任务
  TRANSPORT = 'transport',       // 运输任务
  ASSEMBLY = 'assembly',         // 装配任务
  MONITORING = 'monitoring'      // 监控任务
}

// 任务状态
export enum TaskStatus {
  PENDING = 'pending',       // 待执行
  ASSIGNED = 'assigned',     // 已分配
  IN_PROGRESS = 'in_progress', // 进行中
  COMPLETED = 'completed',   // 已完成
  FAILED = 'failed',         // 失败
  CANCELLED = 'cancelled',   // 已取消
  PAUSED = 'paused'          // 已暂停
}

// 传感器类型
export enum SensorType {
  CAMERA = 'camera',           // 摄像头
  LIDAR = 'lidar',             // 激光雷达
  ULTRASONIC = 'ultrasonic',   // 超声波
  INFRARED = 'infrared',       // 红外
  TEMPERATURE = 'temperature', // 温度
  HUMIDITY = 'humidity',       // 湿度
  PRESSURE = 'pressure',       // 压力
  ACCELEROMETER = 'accelerometer', // 加速度计
  GYROSCOPE = 'gyroscope',     // 陀螺仪
  GPS = 'gps',                 // GPS
  MICROPHONE = 'microphone',   // 麦克风
  PROXIMITY = 'proximity'      // 接近传感器
}

// 执行器类型
export enum ActuatorType {
  WHEEL = 'wheel',             // 轮子
  ARM = 'arm',                 // 机械臂
  GRIPPER = 'gripper',         // 夹爪
  CONVEYOR = 'conveyor',       // 传送带
  PUMP = 'pump',               // 泵
  VALVE = 'valve',             // 阀门
  MOTOR = 'motor',             // 电机
  SERVO = 'servo',             // 舵机
  LINEAR_ACTUATOR = 'linear_actuator', // 线性执行器
  ROTARY_ACTUATOR = 'rotary_actuator'  // 旋转执行器
}

// 机器人能力
export interface RobotCapability {
  id: string
  name: string
  description: string
  category: 'navigation' | 'manipulation' | 'perception' | 'communication' | 'processing'
  level: number // 1-5 能力等级
  enabled: boolean
  parameters: Record<string, any>
}

// 传感器数据
export interface SensorData {
  id: string
  sensorId: string
  sensorType: SensorType
  value: any
  unit: string
  timestamp: string
  quality: number // 数据质量 0-1
  metadata: Record<string, any>
}

// 执行器状态
export interface ActuatorStatus {
  id: string
  actuatorId: string
  actuatorType: ActuatorType
  state: 'active' | 'inactive' | 'error'
  position?: number
  speed?: number
  force?: number
  temperature?: number
  power?: number
  timestamp: string
}

// 机器人信息
export interface RobotAgent {
  id: string
  name: string
  type: RobotType
  model: string
  manufacturer: string
  serialNumber: string
  status: RobotStatus
  location: {
    x: number
    y: number
    z?: number
    floor?: string
    zone?: string
    description: string
  }
  battery: {
    level: number // 0-100
    voltage: number
    temperature: number
    charging: boolean
    estimatedRuntime: number // 分钟
    lastChargeTime: string
  }
  capabilities: RobotCapability[]
  sensors: Array<{
    id: string
    type: SensorType
    name: string
    model: string
    status: 'active' | 'inactive' | 'error'
    lastDataTime: string
    dataFrequency: number // Hz
  }>
  actuators: Array<{
    id: string
    type: ActuatorType
    name: string
    model: string
    status: 'active' | 'inactive' | 'error'
    currentPosition?: number
    maxSpeed?: number
    maxForce?: number
  }>
  connectivity: {
    networkType: 'wifi' | 'cellular' | 'ethernet' | 'bluetooth' | 'none'
    signalStrength: number // 0-100
    ipAddress: string
    lastConnectedTime: string
    dataRate: number // Mbps
  }
  performance: {
    uptime: number // 总运行时间（小时）
    totalTasks: number
    completedTasks: number
    failedTasks: number
    averageTaskDuration: number // 分钟
    efficiency: number // 0-1
    reliability: number // 0-1
  }
  maintenance: {
    lastMaintenanceTime: string
    nextMaintenanceTime: string
    maintenanceInterval: number // 小时
    operatingHours: number
    alerts: Array<{
      id: string
      type: 'warning' | 'error' | 'info'
      message: string
      timestamp: string
      acknowledged: boolean
    }>
  }
  configuration: {
    autonomy: number // 0-100 自主性
    collaboration: boolean // 是否支持协作
    learning: boolean // 是否支持学习
    safetyLevel: number // 1-5 安全等级
    operationalLimits: Record<string, any>
    behavior: {
      speedLimit: number
      obstacleAvoidance: boolean
      humanDetection: boolean
      emergencyStop: boolean
    }
  }
  createdAt: string
  updatedAt: string
  lastActive: string
}

// 任务信息
export interface RobotTask {
  id: string
  name: string
  description: string
  type: TaskType
  status: TaskStatus
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedRobot?: string
  creator: string
  createdAt: string
  scheduledTime?: string
  startedTime?: string
  completedTime?: string
  estimatedDuration: number // 分钟
  actualDuration?: number // 分钟
  progress: number // 0-100
  location: {
    start: {
      x: number
      y: number
      z?: number
      description: string
    }
    end: {
      x: number
      y: number
      z?: number
      description: string
    }
  }
  requirements: {
    capabilities: string[]
    sensors: SensorType[]
    minBattery: number
    maxWeight?: number
    specialConditions?: string[]
  }
  parameters: Record<string, any>
  result?: {
    success: boolean
    message: string
    data: Record<string, any>
    sensorData: SensorData[]
    actuatorData: ActuatorStatus[]
    errors?: string[]
    warnings?: string[]
  }
  collaboration?: {
    collaborators: Array<{
      robotId: string
      role: string
      status: 'pending' | 'active' | 'completed'
    }>
    coordination: {
      method: string
      parameters: Record<string, any>
    }
  }
  evaluation: {
    quality: number // 0-1
    efficiency: number // 0-1
    safety: number // 0-1
    userSatisfaction?: number // 0-5
  }
}

// 机器人群体
export interface RobotSwarm {
  id: string
  name: string
  description: string
  type: 'cooperative' | 'competitive' | 'hierarchical' | 'distributed'
  leader?: string
  members: Array<{
    robotId: string
    role: string
    status: 'active' | 'inactive' | 'standby'
    capabilities: string[]
  }>
  communication: {
    protocol: string
    frequency: number // Hz
    topology: 'mesh' | 'star' | 'ring' | 'tree'
    latency: number // ms
    bandwidth: number // Mbps
  }
  coordination: {
    algorithm: string
    parameters: Record<string, any>
    decisionMaking: 'centralized' | 'decentralized' | 'hybrid'
  }
  performance: {
    collectiveEfficiency: number // 0-1
    coordinationQuality: number // 0-1
    taskDistribution: number // 0-1
    communicationReliability: number // 0-1
  }
  createdAt: string
  updatedAt: string
  status: 'active' | 'inactive' | 'formation' | 'disbanding'
}

// 机器人API
class RobotAgentAPI {
  /**
   * 获取机器人列表
   */
  async getRobots(params?: {
    type?: RobotType
    status?: RobotStatus
    location?: string
    capability?: string
    limit?: number
    offset?: number
  }): Promise<{
    success: boolean
    data?: {
      robots: RobotAgent[]
      total: number
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/robot-agent/robots', {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get robots failed:', error)
      throw error
    }
  }

  /**
   * 获取机器人详情
   */
  async getRobot(robotId: string): Promise<{
    success: boolean
    data?: RobotAgent
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get(`/robot-agent/robots/${robotId}`)
      return response.data
    } catch (error) {
      console.error('Get robot failed:', error)
      throw error
    }
  }

  /**
   * 创建机器人
   */
  async createRobot(robot: Partial<RobotAgent>): Promise<{
    success: boolean
    data?: RobotAgent
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/robot-agent/robots', robot)
      return response.data
    } catch (error) {
      console.error('Create robot failed:', error)
      throw error
    }
  }

  /**
   * 更新机器人
   */
  async updateRobot(robotId: string, updates: Partial<RobotAgent>): Promise<{
    success: boolean
    data?: RobotAgent
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.put(`/robot-agent/robots/${robotId}`, updates)
      return response.data
    } catch (error) {
      console.error('Update robot failed:', error)
      throw error
    }
  }

  /**
   * 删除机器人
   */
  async deleteRobot(robotId: string): Promise<{
    success: boolean
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.delete(`/robot-agent/robots/${robotId}`)
      return response.data
    } catch (error) {
      console.error('Delete robot failed:', error)
      throw error
    }
  }

  /**
   * 控制机器人
   */
  async controlRobot(robotId: string, command: {
    action: 'move' | 'stop' | 'start_task' | 'pause_task' | 'resume_task' | 'emergency_stop' | 'return_home' | 'calibrate'
    parameters?: Record<string, any>
  }): Promise<{
    success: boolean
    data?: {
      commandId: string
      status: 'accepted' | 'rejected' | 'executed' | 'failed'
      message: string
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post(`/robot-agent/robots/${robotId}/control`, command)
      return response.data
    } catch (error) {
      console.error('Control robot failed:', error)
      throw error
    }
  }

  /**
   * 获取传感器数据
   */
  async getSensorData(robotId: string, params?: {
    sensorType?: SensorType
    startTime?: string
    endTime?: string
    limit?: number
  }): Promise<{
    success: boolean
    data?: SensorData[]
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get(`/robot-agent/robots/${robotId}/sensors/data`, {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get sensor data failed:', error)
      throw error
    }
  }

  /**
   * 获取执行器状态
   */
  async getActuatorStatus(robotId: string): Promise<{
    success: boolean
    data?: ActuatorStatus[]
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get(`/robot-agent/robots/${robotId}/actuators/status`)
      return response.data
    } catch (error) {
      console.error('Get actuator status failed:', error)
      throw error
    }
  }

  /**
   * 创建任务
   */
  async createTask(task: Partial<RobotTask>): Promise<{
    success: boolean
    data?: RobotTask
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/robot-agent/tasks', task)
      return response.data
    } catch (error) {
      console.error('Create task failed:', error)
      throw error
    }
  }

  /**
   * 获取任务列表
   */
  async getTasks(params?: {
    type?: TaskType
    status?: TaskStatus
    assignedRobot?: string
    priority?: string
    startTime?: string
    endTime?: string
    limit?: number
    offset?: number
  }): Promise<{
    success: boolean
    data?: {
      tasks: RobotTask[]
      total: number
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/robot-agent/tasks', {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get tasks failed:', error)
      throw error
    }
  }

  /**
   * 分配任务
   */
  async assignTask(taskId: string, robotId: string): Promise<{
    success: boolean
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post(`/robot-agent/tasks/${taskId}/assign`, {
        robotId
      })
      return response.data
    } catch (error) {
      console.error('Assign task failed:', error)
      throw error
    }
  }

  /**
   * 取消任务
   */
  async cancelTask(taskId: string, reason?: string): Promise<{
    success: boolean
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post(`/robot-agent/tasks/${taskId}/cancel`, {
        reason
      })
      return response.data
    } catch (error) {
      console.error('Cancel task failed:', error)
      throw error
    }
  }

  /**
   * 获取机器人群体
   */
  async getSwarms(params?: {
    type?: string
    status?: string
    limit?: number
    offset?: number
  }): Promise<{
    success: boolean
    data?: {
      swarms: RobotSwarm[]
      total: number
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get('/robot-agent/swarms', {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get swarms failed:', error)
      throw error
    }
  }

  /**
   * 创建机器人群体
   */
  async createSwarm(swarm: Partial<RobotSwarm>): Promise<{
    success: boolean
    data?: RobotSwarm
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/robot-agent/swarms', swarm)
      return response.data
    } catch (error) {
      console.error('Create swarm failed:', error)
      throw error
    }
  }

  /**
   * 控制群体行为
   */
  async controlSwarm(swarmId: string, command: {
    action: 'formation' | 'dispersion' | 'gathering' | 'patrol' | 'search' | 'transport'
    parameters: Record<string, any>
  }): Promise<{
    success: boolean
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post(`/robot-agent/swarms/${swarmId}/control`, command)
      return response.data
    } catch (error) {
      console.error('Control swarm failed:', error)
      throw error
    }
  }

  /**
   * 获取机器人性能分析
   */
  async getRobotPerformance(robotId: string, params?: {
    period?: 'hour' | 'day' | 'week' | 'month'
    metrics?: string[]
  }): Promise<{
    success: boolean
    data?: {
      efficiency: Array<{
        timestamp: string
        value: number
      }>
      reliability: Array<{
        timestamp: string
        value: number
      }>
      taskCompletion: Array<{
        timestamp: string
        value: number
      }>
      batteryUsage: Array<{
        timestamp: string
        value: number
      }>
      errorRate: Array<{
        timestamp: string
        value: number
      }>
      summary: {
        averageEfficiency: number
        averageReliability: number
        totalTasksCompleted: number
        averageBatteryLife: number
        totalErrors: number
      }
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.get(`/robot-agent/robots/${robotId}/performance`, {
        params
      })
      return response.data
    } catch (error) {
      console.error('Get robot performance failed:', error)
      throw error
    }
  }

  /**
   * 获取任务优化建议
   */
  async getTaskOptimization(params: {
    robotIds: string[]
    tasks: Array<{
      type: TaskType
      location: { x: number; y: number }
      priority: string
      estimatedDuration: number
    }>
    objectives: Array<'efficiency' | 'energy' | 'time' | 'quality'>
    constraints?: Record<string, any>
  }): Promise<{
    success: boolean
    data?: {
      optimizedAssignments: Array<{
        taskId: string
        robotId: string
        startTime: string
        estimatedCompletionTime: string
        efficiency: number
      }>
      totalEfficiency: number
      estimatedCompletionTime: string
      energyConsumption: number
      recommendations: string[]
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/robot-agent/optimization/tasks', params)
      return response.data
    } catch (error) {
      console.error('Get task optimization failed:', error)
      throw error
    }
  }

  /**
   * 获取路径规划
   */
  async getPathPlanning(params: {
    robotId: string
    start: { x: number; y: number; z?: number }
    end: { x: number; y: number; z?: number }
    obstacles?: Array<{
      x: number
      y: number
      z?: number
      radius: number
      type: string
    }>
    algorithm?: 'astar' | 'dijkstra' | 'rrt' | 'potential_field'
    constraints?: {
      maxSpeed?: number
      avoidHumans?: boolean
      preferPaths?: string[]
    }
  }): Promise<{
    success: boolean
    data?: {
      path: Array<{
        x: number
        y: number
        z?: number
        timestamp: string
      }>
      distance: number
      estimatedTime: number
      energyConsumption: number
      safetyScore: number
      alternativePaths?: Array<{
        path: Array<{ x: number; y: number; z?: number }>
        score: number
        description: string
      }>
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/robot-agent/planning/path', params)
      return response.data
    } catch (error) {
      console.error('Get path planning failed:', error)
      throw error
    }
  }

  /**
   * 仿真机器人行为
   */
  async simulateRobotBehavior(params: {
    robotId: string
    scenario: string
    duration: number // 分钟
    environment: {
      size: { width: number; height: number }
      obstacles: Array<any>
      humans: Array<any>
    }
    tasks: Array<{
      type: TaskType
      location: { x: number; y: number }
      startTime: number
    }>
  }): Promise<{
    success: boolean
    data?: {
      simulationId: string
      results: {
        completedTasks: number
        failedTasks: number
        totalDistance: number
        energyConsumed: number
        collisions: number
        efficiency: number
        timeline: Array<{
          time: number
          robotState: any
          activeTask: string
          events: string[]
        }>
      }
      recommendations: string[]
    }
    message?: string
  }> {
    try {
      const response: AxiosResponse = await httpClient.post('/robot-agent/simulation', params)
      return response.data
    } catch (error) {
      console.error('Simulate robot behavior failed:', error)
      throw error
    }
  }
}

export const robotAgentAPI = new RobotAgentAPI()
export default robotAgentAPI