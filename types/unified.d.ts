/**
 * @file 统一类型定义文件
 * @description 整合项目所有核心类型定义，提供统一的类型接口
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 */

// 全局命名空间
declare namespace YYC3CateringPlatform {
  // ========================== 基础响应类型 ==========================
  
  /**
   * 基础响应接口
   */
  interface BaseResponse<T = any> {
    code: number;
    message: string;
    data: T;
    timestamp: number;
    requestId: string;
    success: boolean;
  }

  /**
   * 分页响应接口
   */
  interface PaginatedResponse<T = any> extends BaseResponse<PageResult<T>> {}

  /**
   * 分页结果接口
   */
  interface PageResult<T = any> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }

  /**
   * 错误响应接口
   */
  interface ErrorResponse {
    code: number;
    message: string;
    details?: string;
    path: string;
    timestamp: number;
    requestId: string;
    errors?: ValidationError[];
  }

  // ========================== 验证相关类型 ==========================
  
  /**
   * 验证错误接口
   */
  interface ValidationError {
    field: string;
    message: string;
    code: string;
    rejectedValue?: any;
  }

  /**
   * 基础验证规则
   */
  interface BaseValidation {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    customValidator?: (value: any) => boolean;
  }

  /**
   * 数字验证
   */
  interface NumberValidation extends BaseValidation {
    min?: number;
    max?: number;
    integer?: boolean;
    positive?: boolean;
  }

  /**
   * 日期验证
   */
  interface DateValidation extends BaseValidation {
    minDate?: Date;
    maxDate?: Date;
    futureOnly?: boolean;
    pastOnly?: boolean;
  }

  /**
   * 文件验证
   */
  interface FileValidation extends BaseValidation {
    maxSize?: number; // bytes
    allowedTypes?: string[];
    allowedExtensions?: string[];
  }

  /**
   * 业务验证规则
   */
  interface BusinessValidation {
    unique?: {
      table: string;
      column: string;
      excludeId?: string;
    };
    exists?: {
      table: string;
      column: string;
    };
    complexRule?: string;
  }

  // ========================== API版本控制 ==========================
  
  /**
   * API版本信息
   */
  interface APIVersion {
    version: string;
    status: 'stable' | 'beta' | 'deprecated' | 'sunset';
    releaseDate: Date;
    sunsetDate?: Date;
    changelog: string[];
  }

  /**
   * 版本化API响应
   */
  interface VersionedResponse<T = any> extends BaseResponse<T> {
    apiVersion: string;
    deprecated?: boolean;
    sunsetDate?: Date;
    migrationGuide?: string;
  }

  /**
   * API兼容性配置
   */
  interface APIConfig {
    currentVersion: string;
    supportedVersions: string[];
    defaultVersion: string;
    versioningStrategy: 'url' | 'header' | 'parameter';
    deprecationPolicy: {
      noticePeriod: number; // days
      sunsetPeriod: number; // days
    };
  }

  // ========================== 行动相关类型 ==========================
  
  /**
   * 行动类型枚举
   */
  enum ActionType {
    ANALYSIS = 'analysis',
    EXECUTION = 'execution',
    DATA_COLLECTION = 'data_collection',
    OPTIMIZATION = 'optimization',
    MONITORING = 'monitoring',
    COMMUNICATION = 'communication'
  }

  /**
   * 行动步骤状态枚举
   */
  enum ActionStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled'
  }

  /**
   * 行动规划接口
   */
  interface ActionPlan {
    id: string;
    goalId: string;
    steps: ActionStep[];
    estimatedDuration: number;
    resources: string[];
    riskLevel: 'low' | 'medium' | 'high';
    successProbability: number;
  }

  /**
   * 行动步骤接口
   */
  interface ActionStep {
    id: string;
    description: string;
    type: ActionType;
    tool: string;
    parameters: Record<string, any>;
    dependencies: string[];
    status: ActionStatus;
    result?: any;
    error?: string;
    estimatedDuration: number;
    requiredResources: string[];
  }

  /**
   * 行动模板接口
   */
  interface ActionTemplate {
    type: ActionType;
    name: string;
    description: string;
    estimatedDuration: number;
    requiredResources: string[];
    cost?: number;
    riskLevel: 'low' | 'medium' | 'high';
    prerequisites: string[];
    successMetrics: string[];
  }

  /**
   * 规划上下文接口
   */
  interface PlanningContext {
    goals: Goal[];
    environment: Record<string, any>;
    constraints: {
      time?: number;
      resources?: string[];
      budget?: number;
      priority?: string[];
    };
    preferences?: {
      riskLevel?: 'low' | 'medium' | 'high';
      optimizationTarget?: 'speed' | 'quality' | 'cost';
    };
  }

  /**
   * 规划选项接口
   */
  interface PlanningOptions {
    maxSteps?: number;
    timeLimit?: number;
    includeAlternatives?: boolean;
    considerDependencies?: boolean;
  }

  /**
   * 规划结果接口
   */
  interface PlanningResult {
    primaryPlan: ActionPlan;
    alternativePlans?: ActionPlan[];
    estimatedSuccessProbability: number;
    planningTime: number;
    recommendations: string[];
  }

  /**
   * 执行结果接口
   */
  interface ExecutionResult {
    success: boolean;
    actionId: string;
    result?: any;
    error?: string;
    metrics: Record<string, number>;
    timestamp: number;
  }

  // ========================== 目标相关类型 ==========================
  
  /**
   * 目标类型枚举
   */
  enum GoalType {
    PRIMARY = 'primary',
    SECONDARY = 'secondary',
    TERTIARY = 'tertiary',
    URGENT = 'urgent'
  }

  /**
   * 目标状态枚举
   */
  enum GoalStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
    PAUSED = 'paused'
  }

  /**
   * 目标配置接口
   */
  interface GoalConfig {
    priority: number;
    deadline?: Date;
    dependencies?: string[];
    resources?: string[];
    id?: string;
    name?: string;
    description?: string;
    type?: GoalType;
    context?: Record<string, any>;
    successCriteria?: Array<{
      metric: string;
      operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
      value: number;
    }>;
  }

  /**
   * 目标进度接口
   */
  interface GoalProgress {
    progress: number;
    completedSteps: number;
    totalSteps: number;
    lastUpdated: Date;
    goalId?: string;
    status?: GoalStatus;
    metrics?: Record<string, number>;
    feedback?: string;
  }

  /**
   * 目标评估接口
   */
  interface GoalEvaluation {
    score: number;
    feedback: string;
    metrics: Record<string, number>;
    recommendations: string[];
    goalId?: string;
    evaluation?: 'achieved' | 'failed' | 'in_progress';
    details?: {
      completedCriteria: string[];
      failedCriteria: string[];
      overallAssessment: string;
    };
  }

  /**
   * 目标接口
   */
  interface Goal {
    id: string;
    name: string;
    description: string;
    type: GoalType;
    status: GoalStatus;
    progress: GoalProgress;
    priority: number;
    deadline?: Date;
    evaluation?: GoalEvaluation;
    subGoals?: Goal[];
    dependencies?: string[];
    successCriteria: Array<{
      metric: string;
      operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
      value: number;
    }>;
    context?: Record<string, any>;
    metrics?: string[];
    updatedAt: Date;
    createdAt: Date;
  }

  // ========================== 通用工具类型 ==========================
  
  /**
   * 排序参数
   */
  interface SortOrder {
    field: string;
    direction: 'ASC' | 'DESC';
  }

  /**
   * 分页查询参数
   */
  interface PageQuery {
    page?: number;
    pageSize?: number;
    sort?: SortOrder[];
    keyword?: string;
  }

  /**
   * 时间范围查询
   */
  interface TimeRangeQuery {
    startTime?: Date | string;
    endTime?: Date | string;
  }

  /**
   * 批量操作响应
   */
  interface BatchResponse<T = any> {
    success: number;
    failed: number;
    total: number;
    results: Array<{
      id: string;
      success: boolean;
      message?: string;
      data?: T;
    }>;
  }
}

// 导出类型以便在TypeScript中直接使用
export as namespace YYC3CateringPlatform;
export {
  YYC3CateringPlatform
};
