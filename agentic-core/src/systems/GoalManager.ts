/**
 * YYC³餐饮行业智能化平台 - 目标管理器
 * 负责创建、管理、跟踪和评估智能代理的目标
 */

import { EventEmitter } from 'events';
import { AgentConfig } from '../AgenticCore';
import { AgenticCore } from '../AgenticCore';
import { Goal, GoalStatus, GoalType } from '../models/Goal';
import { Logger } from '../utils/Logger';

export interface GoalConfig {
  id: string;
  name: string;
  description: string;
  type: GoalType;
  priority: number;
  deadline?: Date;
  dependencies?: string[];
  context?: Record<string, any>;
  successCriteria?: Array<{
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    value: number;
  }>;
}

export interface GoalProgress {
  goalId: string;
  progress: number;
  status: GoalStatus;
  lastUpdated: Date;
  metrics: Record<string, number>;
  feedback?: string;
}

export interface GoalEvaluation {
  goalId: string;
  evaluation: 'achieved' | 'failed' | 'in_progress';
  score: number;
  details: {
    completedCriteria: string[];
    failedCriteria: string[];
    overallAssessment: string;
  };
  recommendations?: string[];
}

export class GoalManager extends EventEmitter {
  private activeGoals: Map<string, Goal> = new Map();
  private goalProgress: Map<string, GoalProgress> = new Map();
  private goalHistory: Array<{
    goalId: string;
    action: string;
    timestamp: Date;
    data?: any;
  }> = [];
  private logger: Logger;
  private evaluationInterval: NodeJS.Timeout | null = null;
  private autoEvaluation: boolean = true;
  private config: AgentConfig;

  constructor(private readonly agentCore: AgenticCore) {
    super();
    this.logger = new Logger('GoalManager');
    this.config = agentCore.getConfig();
  }

  /**
   * 初始化目标管理器
   */
  async initialize(config?: {
    autoEvaluation?: boolean;
    evaluationIntervalMs?: number;
  }): Promise<void> {
    this.autoEvaluation = config?.autoEvaluation ?? true;

    if (this.autoEvaluation) {
      const intervalMs = config?.evaluationIntervalMs ?? 30000; // 30秒
      this.startAutoEvaluation(intervalMs);
    }

    this.logger.info('GoalManager initialized', {
      autoEvaluation: this.autoEvaluation,
      evaluationIntervalMs: config?.evaluationIntervalMs
    });
  }

  /**
   * 创建新目标
   */
  async createGoal(config: GoalConfig): Promise<Goal> {
    const goalBase = {
      id: config.id,
      name: config.name,
      description: config.description,
      type: config.type,
      priority: config.priority,
      status: GoalStatus.PENDING,
      progress: {
        progress: 0,
        completedSteps: 0,
        totalSteps: 1,
        lastUpdated: new Date()
      },
      successCriteria: config.successCriteria || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 构建goal对象，只添加存在的可选属性
    const goal: Goal = {
      ...goalBase,
      ...(config.dependencies ? { dependencies: config.dependencies } : {}),
      ...(config.context ? { context: config.context } : {})
    };

    // 仅当config.deadline存在时才设置deadline属性
    if (config.deadline) {
      goal.deadline = config.deadline;
    }

    // 验证目标配置
    this.validateGoalConfig(goal);

    // 检查依赖关系
    if (goal.dependencies && goal.dependencies.length > 0) {
      await this.validateDependencies(goal);
    }

    // 保存目标
    this.activeGoals.set(goal.id, goal);

    // 初始化进度跟踪
    this.goalProgress.set(goal.id, {
      goalId: goal.id,
      progress: 0,
      status: GoalStatus.PENDING,
      lastUpdated: new Date(),
      metrics: {}
    });

    // 记录操作历史
    this.recordHistory(goal.id, 'created', { goal });

    // 发送事件
    this.emit('goalCreated', goal);

    this.logger.info('Goal created', { goalId: goal.id, name: goal.name });

    return goal;
  }

  /**
   * 更新目标状态
   */
  async updateGoalStatus(
    goalId: string,
    status: GoalStatus,
    feedback?: string,
    metrics?: Record<string, number>
  ): Promise<void> {
    const goal = this.activeGoals.get(goalId);
    if (!goal) {
      throw new Error(`Goal not found: ${goalId}`);
    }

    const previousStatus = goal.status;
    goal.status = status;
    goal.updatedAt = new Date();

    // 更新进度
    const progress = this.goalProgress.get(goalId)!;
    progress.status = status;
    progress.lastUpdated = new Date();

    if (feedback) {
      progress.feedback = feedback;
    }

    if (metrics) {
      progress.metrics = { ...progress.metrics, ...metrics };
    }

    // 计算进度百分比
    progress.progress = this.calculateProgress(goal, progress);

    // 记录操作历史
    this.recordHistory(goalId, 'status_updated', {
      previousStatus,
      newStatus: status,
      feedback,
      metrics
    });

    // 发送事件
    this.emit('goalStatusChanged', {
      goal,
      previousStatus,
      newStatus: status
    });

    this.logger.info('Goal status updated', {
      goalId,
      previousStatus,
      newStatus: status,
      progress: goal.progress
    });

    // 如果目标完成，自动评估
    if (status === GoalStatus.COMPLETED) {
      await this.evaluateGoal(goalId);
    }
  }

  /**
   * 更新目标进度
   */
  async updateGoalProgress(
    goalId: string,
    metrics: Record<string, number>
  ): Promise<void> {
    const goal = this.activeGoals.get(goalId);
    if (!goal) {
      throw new Error(`Goal not found: ${goalId}`);
    }

    const progress = this.goalProgress.get(goalId)!;
    progress.metrics = { ...progress.metrics, ...metrics };
    progress.lastUpdated = new Date();

    // 重新计算进度
    const newProgressValue = this.calculateProgress(goal, progress);

    if (newProgressValue !== progress.progress) {
      progress.progress = newProgressValue;
      goal.updatedAt = new Date();

      // 记录操作历史
    this.recordHistory(goalId, 'progress_updated', {
      previousProgress: goal.progress,
      newProgress: newProgressValue,
      metrics
    });

    // 发送进度更新事件
    this.emit('goalProgressUpdated', {
      goalId,
      previousProgress: goal.progress,
      newProgress: newProgressValue,
      metrics
    });

    this.logger.debug('Goal progress updated', {
      goalId,
      newProgress: newProgressValue,
      metrics
    });
    }
  }

  /**
   * 获取所有活跃目标
   */
  getActiveGoals(): Goal[] {
    return Array.from(this.activeGoals.values()).filter(
      goal => goal.status !== GoalStatus.COMPLETED && goal.status !== GoalStatus.FAILED
    );
  }

  /**
   * 获取特定目标
   */
  getGoal(goalId: string): Goal | undefined {
    return this.activeGoals.get(goalId);
  }

  /**
   * 获取目标进度
   */
  getGoalProgress(goalId: string): GoalProgress | undefined {
    return this.goalProgress.get(goalId);
  }

  /**
   * 获取目标历史
   */
  getGoalHistory(goalId?: string): any[] {
    if (goalId) {
      return this.goalHistory.filter(entry => entry.goalId === goalId);
    }
    return this.goalHistory;
  }

  /**
   * 评估目标
   */
  async evaluateGoal(goalId: string): Promise<GoalEvaluation> {
    const goal = this.activeGoals.get(goalId);
    if (!goal) {
      throw new Error(`Goal not found: ${goalId}`);
    }

    const progress = this.goalProgress.get(goalId)!;
    const evaluation = await this.performGoalEvaluation(goal, progress);

    // 更新目标状态
    if (evaluation.evaluation === 'achieved') {
      await this.updateGoalStatus(goalId, GoalStatus.COMPLETED);
    } else if (evaluation.evaluation === 'failed') {
      await this.updateGoalStatus(goalId, GoalStatus.FAILED);
    }

    // 记录评估结果
    this.recordHistory(goalId, 'evaluated', { evaluation });

    // 发送评估事件
    this.emit('goalEvaluated', { goalId, evaluation });

    this.logger.info('Goal evaluated', {
      goalId,
      evaluation: evaluation.evaluation,
      score: evaluation.score
    });

    return evaluation;
  }

  /**
   * 批量评估所有目标
   */
  async evaluateAllGoals(): Promise<GoalEvaluation[]> {
    const evaluations: GoalEvaluation[] = [];

    for (const goal of this.activeGoals.values()) {
      try {
        const evaluation = await this.evaluateGoal(goal.id);
        evaluations.push(evaluation);
      } catch (error) {
        this.logger.error('Failed to evaluate goal', {
          goalId: goal.id,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return evaluations;
  }

  /**
   * 暂停目标
   */
  async pauseGoal(goalId: string, reason?: string): Promise<void> {
    await this.updateGoalStatus(goalId, GoalStatus.PAUSED, reason);
    this.logger.info('Goal paused', { goalId, reason });
  }

  /**
   * 恢复目标
   */
  async resumeGoal(goalId: string): Promise<void> {
    await this.updateGoalStatus(goalId, GoalStatus.IN_PROGRESS);
    this.logger.info('Goal resumed', { goalId });
  }

  /**
   * 取消目标
   */
  async cancelGoal(goalId: string, reason?: string): Promise<void> {
    const goal = this.activeGoals.get(goalId);
    if (!goal) {
      throw new Error(`Goal not found: ${goalId}`);
    }

    // 只能取消未开始的目标
    if ([GoalStatus.IN_PROGRESS, GoalStatus.COMPLETED].includes(goal.status)) {
      throw new Error(`Cannot cancel goal in status: ${goal.status}`);
    }

    await this.updateGoalStatus(goalId, GoalStatus.CANCELLED, reason);
    this.logger.info('Goal cancelled', { goalId, reason });
  }

  /**
   * 获取目标统计信息
   */
  getGoalStats(): {
    total: number;
    byStatus: Record<GoalStatus, number>;
    byType: Record<GoalType, number>;
    averageProgress: number;
    overdueCount: number;
  } {
    const goals = Array.from(this.activeGoals.values());

    const byStatus: Record<GoalStatus, number> = {
      [GoalStatus.PENDING]: 0,
      [GoalStatus.IN_PROGRESS]: 0,
      [GoalStatus.PAUSED]: 0,
      [GoalStatus.COMPLETED]: 0,
      [GoalStatus.FAILED]: 0,
      [GoalStatus.CANCELLED]: 0
    };

    const byType: Record<GoalType, number> = {
      [GoalType.PRIMARY]: 0,
      [GoalType.SECONDARY]: 0,
      [GoalType.TERTIARY]: 0,
      [GoalType.URGENT]: 0
    };

    let totalProgress = 0;
    let overdueCount = 0;
    const now = new Date();

    for (const goal of goals) {
      byStatus[goal.status]++;
      byType[goal.type]++;

      totalProgress += goal.progress.progress;

      if (goal.deadline && goal.deadline < now &&
          ![GoalStatus.COMPLETED, GoalStatus.FAILED, GoalStatus.CANCELLED].includes(goal.status)) {
        overdueCount++;
      }
    }

    return {
      total: goals.length,
      byStatus,
      byType,
      averageProgress: goals.length > 0 ? totalProgress / goals.length : 0,
      overdueCount
    };
  }

  /**
   * 清理已完成或失败的目标
   */
  async cleanupCompletedGoals(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<number> {
    const now = new Date();
    let cleanedCount = 0;

    for (const [goalId, goal] of this.activeGoals.entries()) {
      const isCompletedOrFailed =
        [GoalStatus.COMPLETED, GoalStatus.FAILED, GoalStatus.CANCELLED].includes(goal.status);

      const isOldEnough = goal.updatedAt &&
        (now.getTime() - goal.updatedAt.getTime()) > maxAge;

      if (isCompletedOrFailed && isOldEnough) {
        this.activeGoals.delete(goalId);
        this.goalProgress.delete(goalId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.info('Goals cleaned up', { cleanedCount, maxAge });
    }

    return cleanedCount;
  }

  /**
   * 关闭目标管理器
   */
  async shutdown(): Promise<void> {
    if (this.evaluationInterval) {
      clearInterval(this.evaluationInterval);
      this.evaluationInterval = null;
    }

    this.activeGoals.clear();
    this.goalProgress.clear();
    this.goalHistory = [];

    this.logger.info('GoalManager shutdown');
  }

  /**
   * 私有方法
   */
  private validateGoalConfig(goal: Goal): void {
    if (!goal.name || goal.name.trim().length === 0) {
      throw new Error('Goal name is required');
    }

    if (goal.priority < 1 || goal.priority > 10) {
      throw new Error('Goal priority must be between 1 and 10');
    }

    if (goal.deadline && goal.deadline <= new Date()) {
      throw new Error('Goal deadline must be in the future');
    }
  }

  private async validateDependencies(goal: Goal): Promise<void> {
    for (const depId of goal.dependencies!) {
      const depGoal = this.activeGoals.get(depId);
      if (!depGoal) {
        throw new Error(`Dependency goal not found: ${depId}`);
      }

      if (depGoal.status === GoalStatus.FAILED || depGoal.status === GoalStatus.CANCELLED) {
        throw new Error(`Dependency goal failed or cancelled: ${depId}`);
      }
    }
  }

  private calculateProgress(goal: Goal, progress: GoalProgress): number {
    if (goal.successCriteria.length === 0) {
      // 如果没有成功标准，使用基础进度逻辑
      return progress.progress;
    }

    let completedCriteria = 0;
    const totalCriteria = goal.successCriteria.length;

    for (const criterion of goal.successCriteria) {
      const metricValue = progress.metrics[criterion.metric];
      if (metricValue === undefined) continue;

      let isMet = false;
      switch (criterion.operator) {
        case 'gt':
          isMet = metricValue > criterion.value;
          break;
        case 'lt':
          isMet = metricValue < criterion.value;
          break;
        case 'eq':
          isMet = Math.abs(metricValue - criterion.value) < 0.001;
          break;
        case 'gte':
          isMet = metricValue >= criterion.value;
          break;
        case 'lte':
          isMet = metricValue <= criterion.value;
          break;
      }

      if (isMet) {
        completedCriteria++;
      }
    }

    return totalCriteria > 0 ? (completedCriteria / totalCriteria) * 100 : 0;
  }

  private async performGoalEvaluation(
    goal: Goal,
    progress: GoalProgress
  ): Promise<GoalEvaluation> {
    const completedCriteria: string[] = [];
    const failedCriteria: string[] = [];

    // 评估成功标准
    for (const criterion of goal.successCriteria) {
      const metricValue = progress.metrics[criterion.metric];
      if (metricValue === undefined) {
        failedCriteria.push(`Missing metric: ${criterion.metric}`);
        continue;
      }

      let isMet = false;
      switch (criterion.operator) {
        case 'gt':
          isMet = metricValue > criterion.value;
          break;
        case 'lt':
          isMet = metricValue < criterion.value;
          break;
        case 'eq':
          isMet = Math.abs(metricValue - criterion.value) < 0.001;
          break;
        case 'gte':
          isMet = metricValue >= criterion.value;
          break;
        case 'lte':
          isMet = metricValue <= criterion.value;
          break;
      }

      if (isMet) {
        completedCriteria.push(criterion.metric);
      } else {
        failedCriteria.push(`${criterion.metric}: ${metricValue} ${criterion.operator} ${criterion.value}`);
      }
    }

    // 计算评估结果
    const totalCriteria = goal.successCriteria.length;
    const successRate = totalCriteria > 0 ? completedCriteria.length / totalCriteria : 0;

    let evaluation: 'achieved' | 'failed' | 'in_progress';
    let score = 0;

    if (successRate >= 1.0) {
      evaluation = 'achieved';
      score = 100;
    } else if (successRate >= 0.7) {
      evaluation = 'in_progress';
      score = successRate * 100;
    } else if (goal.deadline && goal.deadline < new Date()) {
      evaluation = 'failed';
      score = successRate * 100;
    } else {
      evaluation = 'in_progress';
      score = successRate * 100;
    }

    // 生成评估详情
    const overallAssessment = this.generateAssessment(evaluation, score, goal, progress);

    return {
      goalId: goal.id,
      evaluation,
      score,
      details: {
        completedCriteria,
        failedCriteria,
        overallAssessment
      },
      recommendations: this.generateRecommendations(evaluation, failedCriteria, goal)
    };
  }

  private generateAssessment(
    evaluation: string,
    score: number,
    goal: Goal,
    progress: GoalProgress
  ): string {
    if (evaluation === 'achieved') {
      return `目标 ${goal.name} 已成功完成，得分: ${score.toFixed(2)}`;
    } else if (evaluation === 'failed') {
      return `目标 ${goal.name} 未能完成，得分: ${score.toFixed(2)}，需要重新评估策略`;
    } else {
      return `目标 ${goal.name} 进行中，当前得分: ${score.toFixed(2)}`;
    }
  }

  private generateRecommendations(
    evaluation: string,
    failedCriteria: string[],
    goal: Goal
  ): string[] {
    const recommendations: string[] = [];

    if (failedCriteria.length > 0) {
      recommendations.push(`需要关注失败的指标: ${failedCriteria.join(', ')}`);
    }

    if (evaluation === 'failed') {
      recommendations.push('建议重新评估目标可行性或调整成功标准');
      recommendations.push('考虑分解目标为更小的子目标');
    }

    if (evaluation === 'in_progress') {
      recommendations.push('持续监控关键指标进展');
      if (goal.deadline) {
        recommendations.push(`注意截止日期: ${goal.deadline.toLocaleDateString()}`);
      }
    }

    return recommendations;
  }

  private recordHistory(goalId: string, action: string, data?: any): void {
    this.goalHistory.push({
      goalId,
      action,
      timestamp: new Date(),
      data
    });
  }

  private startAutoEvaluation(intervalMs: number): void {
    this.evaluationInterval = setInterval(async () => {
      try {
        await this.evaluateAllGoals();
      } catch (error) {
        this.logger.error('Auto evaluation error:', error);
      }
    }, intervalMs);
  }
}