/**
 * @file 行动模型定义
 * @description 定义智能代理行动规划相关的数据结构和类型
 */

/**
 * 行动类型枚举
 */
export enum ActionType {
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
export enum ActionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * 行动规划接口
 */
export interface ActionPlan {
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
export interface ActionStep {
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
export interface ActionTemplate {
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
export interface PlanningContext {
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
export interface PlanningOptions {
  maxSteps?: number;
  timeLimit?: number;
  includeAlternatives?: boolean;
  considerDependencies?: boolean;
}

/**
 * 规划结果接口
 */
export interface PlanningResult {
  primaryPlan: ActionPlan;
  alternativePlans?: ActionPlan[];
  estimatedSuccessProbability: number;
  planningTime: number;
  recommendations: string[];
}

/**
 * 执行结果接口
 */
export interface ExecutionResult {
  success: boolean;
  actionId: string;
  result?: any;
  error?: string;
  metrics: Record<string, number>;
  timestamp: number;
}

// 导入Goal接口（来自同一目录下的Goal.ts）
import type { Goal } from './Goal';
