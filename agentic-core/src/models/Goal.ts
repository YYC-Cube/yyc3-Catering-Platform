/**
 * @file 目标相关模型定义
 * @description 定义AI独立自治可插拔系统中的目标数据结构
 */

export enum GoalType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TERTIARY = 'tertiary',
  URGENT = 'urgent'
}

export enum GoalStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PAUSED = 'paused'
}

export interface GoalConfig {
  priority: number;
  deadline?: Date;
  dependencies?: string[];
  resources?: string[];
}

export interface GoalProgress {
  progress: number;
  completedSteps: number;
  totalSteps: number;
  lastUpdated: Date;
}

export interface GoalEvaluation {
  score: number;
  feedback: string;
  metrics: Record<string, number>;
  recommendations: string[];
}

export interface Goal {
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
