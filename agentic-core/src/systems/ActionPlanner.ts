/**
 * YYC³餐饮行业智能化平台 - 行动规划器
 * 负责根据目标和上下文生成和优化行动计划
 */

import { EventEmitter } from 'events';
import { AgenticCore } from '../AgenticCore';
import { Goal, GoalType } from '../models/Goal';
import { ActionPlan, ActionStep, ActionType, ActionStatus } from '../models/Action';
import { Logger } from '../utils/Logger';

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

export interface PlanningOptions {
  maxSteps?: number;
  timeLimit?: number;
  includeAlternatives?: boolean;
  considerDependencies?: boolean;
}

export interface PlanningResult {
  primaryPlan: ActionPlan;
  alternativePlans?: ActionPlan[];
  estimatedSuccessProbability: number;
  planningTime: number;
  recommendations: string[];
}

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

export class ActionPlanner extends EventEmitter {
  private actionTemplates: Map<ActionType, ActionTemplate[]> = new Map();
  private planningHistory: Array<{
    context: PlanningContext;
    result: PlanningResult;
    timestamp: Date;
  }> = [];
  private logger: Logger;
  private defaultOptions: PlanningOptions = {
    maxSteps: 10,
    timeLimit: 600000, // 10分钟
    includeAlternatives: true,
    considerDependencies: true
  };
  private config: any;

  constructor(private readonly agentCore: AgenticCore) {
    super();
    this.logger = new Logger('ActionPlanner');
    this.config = agentCore.getConfig();
    this.initializeActionTemplates();
  }

  /**
   * 初始化行动模板
   */
  private initializeActionTemplates(): void {
    // 数据收集类行动模板
    this.actionTemplates.set(ActionType.DATA_COLLECTION, [
      {
        type: ActionType.DATA_COLLECTION,
        name: '收集客户反馈',
        description: '通过问卷、访谈等方式收集客户反馈数据',
        estimatedDuration: 1800, // 30分钟
        requiredResources: ['staff', 'survey_tools'],
        riskLevel: 'low',
        prerequisites: [],
        successMetrics: ['feedback_count', 'response_rate']
      },
      {
        type: ActionType.DATA_COLLECTION,
        name: '分析销售数据',
        description: '分析历史销售数据，识别趋势和模式',
        estimatedDuration: 2400, // 40分钟
        requiredResources: ['data_analyst', 'analytics_tools'],
        riskLevel: 'low',
        prerequisites: ['sales_data_available'],
        successMetrics: ['insights_generated', 'patterns_identified']
      }
    ]);

    // 分析类行动模板
    this.actionTemplates.set(ActionType.ANALYSIS, [
      {
        type: ActionType.ANALYSIS,
        name: '市场分析',
        description: '分析市场趋势、竞争对手和客户需求',
        estimatedDuration: 3600, // 1小时
        requiredResources: ['market_researcher', 'analytics_tools'],
        riskLevel: 'medium',
        prerequisites: ['market_data_available'],
        successMetrics: ['market_insights', 'trend_identified']
      },
      {
        type: ActionType.ANALYSIS,
        name: '性能分析',
        description: '分析系统性能指标，识别瓶颈',
        estimatedDuration: 1800, // 30分钟
        requiredResources: ['performance_analyst', 'monitoring_tools'],
        riskLevel: 'low',
        prerequisites: ['performance_metrics_available'],
        successMetrics: ['bottlenecks_identified', 'optimization_opportunities']
      }
    ]);

    // 执行类行动模板
    this.actionTemplates.set(ActionType.EXECUTION, [
      {
        type: ActionType.EXECUTION,
        name: '执行营销活动',
        description: '执行营销推广活动',
        estimatedDuration: 7200, // 2小时
        requiredResources: ['marketing_team', 'budget'],
        riskLevel: 'high',
        prerequisites: ['marketing_plan', 'budget_approved'],
        successMetrics: ['campaign_reach', 'conversion_rate']
      },
      {
        type: ActionType.EXECUTION,
        name: '系统部署',
        description: '部署新系统或功能',
        estimatedDuration: 5400, // 1.5小时
        requiredResources: ['dev_team', 'deployment_env'],
        riskLevel: 'medium',
        prerequisites: ['system_tested', 'deployment_plan'],
        successMetrics: ['deployment_success', 'system_stable']
      }
    ]);

    // 优化类行动模板
    this.actionTemplates.set(ActionType.OPTIMIZATION, [
      {
        type: ActionType.OPTIMIZATION,
        name: '流程优化',
        description: '优化业务流程，提高效率',
        estimatedDuration: 3600, // 1小时
        requiredResources: ['process_expert', 'stakeholders'],
        riskLevel: 'medium',
        prerequisites: ['current_process_documented'],
        successMetrics: ['efficiency_improvement', 'time_reduction']
      },
      {
        type: ActionType.OPTIMIZATION,
        name: '成本优化',
        description: '优化运营成本，提高利润率',
        estimatedDuration: 4800, // 1.3小时
        requiredResources: ['finance_analyst', 'department_heads'],
        riskLevel: 'medium',
        prerequisites: ['cost_data_available'],
        successMetrics: ['cost_reduction', 'roi_improvement']
      }
    ]);
  }

  /**
   * 生成行动计划
   */
  async generateRecommendations(
    goals: Goal[],
    context: Record<string, any>,
    options?: PlanningOptions
  ): Promise<ActionPlan[]> {
    const planningContext: PlanningContext = {
      goals: this.prioritizeGoals(goals),
      environment: context,
      constraints: {
        time: 3600, // 默认1小时
      },
      preferences: {
        riskLevel: 'medium',
        optimizationTarget: 'quality'
      },
      ...options
    };

    const result = await this.createActionPlans(planningContext);

    return result.primaryPlan ? [result.primaryPlan] : [];
  }

  /**
   * 创建行动计划
   */
  private async createActionPlans(context: PlanningContext): Promise<PlanningResult> {
    const startTime = Date.now();

    try {
      // 分析目标并生成主要计划
      const primaryPlan = await this.createPrimaryPlan(context);

      let alternativePlans: ActionPlan[] = [];

      // 生成备选方案
      if (context.preferences?.riskLevel !== 'high' && this.defaultOptions.includeAlternatives) {
        alternativePlans = await this.createAlternativePlans(context, primaryPlan);
      }

      // 评估成功概率
      const successProbability = await this.evaluateSuccessProbability(primaryPlan, context);

      // 生成推荐
      const recommendations = this.generatePlanningRecommendations(primaryPlan, context);

      const planningTime = Date.now() - startTime;

      const result: PlanningResult = {
        primaryPlan,
        alternativePlans: alternativePlans.length > 0 ? alternativePlans : [],
        estimatedSuccessProbability: successProbability,
        planningTime,
        recommendations
      };

      // 记录规划历史
      this.planningHistory.push({
        context,
        result,
        timestamp: new Date()
      });

      // 发送事件
      this.emit('plansGenerated', result);

      this.logger.info('Action plans created', {
        goalCount: context.goals.length,
        primaryPlanSteps: primaryPlan.steps.length,
        alternativePlansCount: alternativePlans.length,
        successProbability,
        planningTime
      });

      return result;

    } catch (error) {
      this.logger.error('Failed to create action plans:', error);
      throw error;
    }
  }

  /**
   * 创建主要行动计划
   */
  private async createPrimaryPlan(context: PlanningContext): Promise<ActionPlan> {
    const plan: ActionPlan = {
      id: this.generateId(),
      goalId: context.goals[0]?.id || 'default',
      steps: [],
      estimatedDuration: 0,
      resources: [],
      riskLevel: 'medium',
      successProbability: 0.5
    };

    // 为每个目标生成行动步骤
    for (const goal of context.goals) {
      const steps = await this.generateStepsForGoal(goal, context);
      plan.steps.push(...steps);
    }

    // 优化行动序列
    plan.steps = await this.optimizeActionSequence(plan.steps, context);

    // 计算总体指标
    plan.estimatedDuration = plan.steps.reduce((sum, step) => sum + step.estimatedDuration, 0);
    plan.resources = Array.from(new Set(plan.steps.flatMap(step => step.requiredResources)));
    plan.riskLevel = this.calculatePlanRiskLevel(plan.steps);
    plan.successProbability = this.calculatePlanSuccessProbability(plan, context);

    return plan;
  }

  /**
   * 为特定目标生成行动步骤
   */
  private async generateStepsForGoal(goal: Goal, context: PlanningContext): Promise<ActionStep[]> {
    const steps: ActionStep[] = [];

    // 根据目标类型选择合适的行动模板
    const relevantTemplates = this.selectRelevantTemplates(goal.type, context);

    // 为每个模板创建具体的行动步骤
    for (const template of relevantTemplates) {
      const step: ActionStep = {
        id: this.generateId(),
        description: `${template.name} (目标: ${goal.name})`,
        type: template.type,
        tool: this.selectOptimalTool(template.type, context),
        parameters: this.generateStepParameters(template, goal, context),
        dependencies: this.calculateDependencies(template, steps),
        status: ActionStatus.PENDING,
        estimatedDuration: template.estimatedDuration,
        requiredResources: template.requiredResources
      };

      steps.push(step);
    }

    return steps;
  }

  /**
   * 选择相关的行动模板
   */
  private selectRelevantTemplates(goalType: GoalType, context: PlanningContext): ActionTemplate[] {
    const templates: ActionTemplate[] = [];

    // 基于目标类型选择模板
    switch (goalType) {
      case GoalType.PRIMARY:
        templates.push(...( this.actionTemplates.get(ActionType.DATA_COLLECTION) || [] ));
        templates.push(...( this.actionTemplates.get(ActionType.ANALYSIS) || [] ));
        templates.push(...( this.actionTemplates.get(ActionType.EXECUTION) || [] ));
        break;

      case GoalType.SECONDARY:
        templates.push(...( this.actionTemplates.get(ActionType.OPTIMIZATION) || [] ));
        templates.push(...( this.actionTemplates.get(ActionType.ANALYSIS) || [] ));
        break;

      case GoalType.URGENT:
        templates.push(...( this.actionTemplates.get(ActionType.EXECUTION) || [] ));
        templates.push(...( this.actionTemplates.get(ActionType.DATA_COLLECTION) || [] ));
        break;
    }

    // 根据约束条件筛选模板
    return templates.filter(template => {
      // 检查资源约束
      if (context.constraints.resources) {
        const hasRequiredResource = template.requiredResources.some(
          resource => context.constraints.resources!.includes(resource)
        );
        if (!hasRequiredResource) return false;
      }

      // 检查风险约束
      if (context.preferences?.riskLevel) {
        const riskLevelOrder = { 'low': 1, 'medium': 2, 'high': 3 };
        const maxAllowedRisk = riskLevelOrder[context.preferences.riskLevel];
        const templateRisk = riskLevelOrder[template.riskLevel];
        if (templateRisk > maxAllowedRisk) return false;
      }

      // 检查时间约束
      if (context.constraints.time) {
        if (template.estimatedDuration > context.constraints.time) return false;
      }

      return true;
    });
  }

  /**
   * 选择最优工具
   */
  private selectOptimalTool(actionType: ActionType, context: PlanningContext): string {
    const toolMap = {
      [ActionType.DATA_COLLECTION]: ['survey_system', 'analytics_platform', 'crm'],
      [ActionType.ANALYSIS]: ['python_analytics', 'bi_dashboard', 'statistical_tools'],
      [ActionType.EXECUTION]: ['automation_platform', 'project_management', 'deployment_system'],
      [ActionType.OPTIMIZATION]: ['optimization_engine', 'ai_advisor', 'performance_monitor'],
      [ActionType.MONITORING]: ['monitoring_system', 'alert_service', 'performance_tracker'],
      [ActionType.COMMUNICATION]: ['email_service', 'notification_system', 'message_broker']
    };

    const availableTools = toolMap[actionType] || [];

    // 根据环境选择最合适的工具
    if (context.environment && context.environment["available_tools"] && Array.isArray(context.environment["available_tools"])) {
      const matchingTools = availableTools.filter(tool =>
        context.environment["available_tools"].includes(tool)
      );
      if (matchingTools.length > 0) {
        return matchingTools[0];
      }
    }

    return availableTools[0] || 'default_tool';
  }

  /**
   * 生成步骤参数
   */
  private generateStepParameters(
    template: ActionTemplate,
    goal: Goal,
    context: PlanningContext
  ): Record<string, any> {
    return {
      goal_id: goal.id,
      goal_name: goal.name,
      goal_type: goal.type,
      priority: goal.priority,
      context_data: context.environment,
      template_config: template,
      estimated_cost: template.cost || 0
    };
  }

  /**
   * 计算步骤依赖关系
   */
  private calculateDependencies(template: ActionTemplate, existingSteps: ActionStep[]): string[] {
    const dependencies: string[] = [];

    // 基于先决条件计算依赖
    for (const prerequisite of template.prerequisites) {
      const dependentStep = existingSteps.find(step =>
        (step.description && step.description.includes(prerequisite)) ||
        (step.parameters && step.parameters["template_config"] && step.parameters["template_config"].name === prerequisite)
      );

      if (dependentStep) {
        dependencies.push(dependentStep.id);
      }
    }

    return dependencies;
  }

  /**
   * 优化行动序列
   */
  private async optimizeActionSequence(
    steps: ActionStep[],
    context: PlanningContext
  ): Promise<ActionStep[]> {
    // 基于依赖关系排序
    const sortedSteps = this.topologicalSort(steps);

    // 应用优化策略
    const optimizedSteps = await this.applyOptimizationStrategies(sortedSteps, context);

    return optimizedSteps;
  }

  /**
   * 拓扑排序（基于依赖关系）
   */
  private topologicalSort(steps: ActionStep[]): ActionStep[] {
    const visited = new Set<string>();
    const result: ActionStep[] = [];
    const tempVisited = new Set<string>();

    const visit = (step: ActionStep) => {
      if (tempVisited.has(step.id)) {
        throw new Error(`Circular dependency detected: ${step.id}`);
      }

      if (visited.has(step.id)) {
        return;
      }

      tempVisited.add(step.id);

      // 访问依赖的步骤
      for (const depId of step.dependencies) {
        const depStep = steps.find(s => s.id === depId);
        if (depStep) {
          visit(depStep);
        }
      }

      tempVisited.delete(step.id);
      visited.add(step.id);
      result.push(step);
    };

    for (const step of steps) {
      if (!visited.has(step.id)) {
        visit(step);
      }
    }

    return result;
  }

  /**
   * 应用优化策略
   */
  private async applyOptimizationStrategies(
    steps: ActionStep[],
    context: PlanningContext
  ): Promise<ActionStep[]> {
    let optimizedSteps = [...steps];

    // 根据优化目标应用不同策略
    switch (context.preferences?.optimizationTarget) {
      case 'speed':
        optimizedSteps = this.optimizeForSpeed(optimizedSteps, context);
        break;
      case 'quality':
        optimizedSteps = this.optimizeForQuality(optimizedSteps, context);
        break;
      case 'cost':
        optimizedSteps = this.optimizeForCost(optimizedSteps, context);
        break;
    }

    return optimizedSteps;
  }

  /**
   * 速度优化策略
   */
  private optimizeForSpeed(steps: ActionStep[], context: PlanningContext): ActionStep[] {
    // 并行化可以同时执行的任务
    const parallelizableSteps = steps.filter(step =>
      this.canRunInParallel(step, context)
    );

    const sequentialSteps = steps.filter(step =>
      !this.canRunInParallel(step, context)
    );

    // 先执行有依赖的顺序步骤，然后执行可并行的步骤
    return [...sequentialSteps, ...parallelizableSteps];
  }

  /**
   * 质量优化策略
   */
  private optimizeForQuality(steps: ActionStep[], context: PlanningContext): ActionStep[] {
    // 为质量敏感任务添加验证步骤
    const enhancedSteps = steps.map(step => {
      if (this.isQualityCritical(step, context)) {
        return {
          ...step,
          parameters: {
            ...step.parameters,
            quality_checks: true,
            validation_level: 'strict'
          }
        };
      }
      return step;
    });

    return enhancedSteps;
  }

  /**
   * 成本优化策略
   */
  private optimizeForCost(steps: ActionStep[], context: PlanningContext): ActionStep[] {
    // 移除不必要的步骤
    const filteredSteps = steps.filter(step => !this.isOptionalStep(step, context));

    // 合并相似的步骤
    return this.mergeSimilarSteps(filteredSteps);
  }

  /**
   * 创建备选方案
   */
  private async createAlternativePlans(
    context: PlanningContext,
    primaryPlan: ActionPlan
  ): Promise<ActionPlan[]> {
    const alternatives: ActionPlan[] = [];

    // 生成不同风险级别的备选方案
    const riskLevels: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];

    for (const riskLevel of riskLevels) {
      if (riskLevel === (context.preferences?.riskLevel || 'medium')) {
        continue; // 跳过与主要方案相同的风险级别
      }

      try {
        const altContext = {
          ...context,
          preferences: {
            ...context.preferences,
            riskLevel
          }
        };

        const altPlan = await this.createPrimaryPlan(altContext);
        altPlan.id = `${primaryPlan.id}_alt_${riskLevel}`;
        alternatives.push(altPlan);

      } catch (error) {
        this.logger.warn(`Failed to create alternative plan for risk level ${riskLevel}:`, error);
      }
    }

    return alternatives;
  }

  /**
   * 评估成功概率
   */
  private async evaluateSuccessProbability(plan: ActionPlan, context: PlanningContext): Promise<number> {
    let probability = 0.5; // 基础概率

    // 基于风险级别调整
    const riskAdjustments = {
      'low': 0.2,
      'medium': 0,
      'high': -0.3
    };
    probability += riskAdjustments[plan.riskLevel] || 0;

    // 基于资源可用性调整
    const resourceAvailability = this.calculateResourceAvailability(plan, context);
    probability += (resourceAvailability - 0.5) * 0.3;

    // 基于时间约束调整
    if (context.constraints?.time) {
      const timeUtilization = plan.estimatedDuration / context.constraints.time;
      if (timeUtilization <= 1.0) {
        probability += (1.0 - timeUtilization) * 0.2;
      } else {
        probability -= (timeUtilization - 1.0) * 0.4;
      }
    }

    return Math.max(0, Math.min(1, probability));
  }

  /**
   * 生成规划推荐
   */
  private generatePlanningRecommendations(plan: ActionPlan, context: PlanningContext): string[] {
    const recommendations: string[] = [];

    // 基于风险水平的推荐
    if (plan.riskLevel === 'high') {
      recommendations.push('考虑分解高风险步骤为更小的子步骤');
      recommendations.push('增加风险评估和监控');
    }

    // 基于资源约束的推荐
    if (context.constraints?.resources) {
      const unavailableResources = plan.resources.filter(
        resource => context.constraints?.resources?.includes(resource) !== true
      );
      if (unavailableResources.length > 0) {
        recommendations.push(`需要获取以下资源: ${unavailableResources.join(', ')}`);
      }
    }

    // 基于时间约束的推荐
    if (context.constraints?.time && plan.estimatedDuration > context.constraints.time) {
      recommendations.push('考虑并行执行部分步骤以节省时间');
      recommendations.push('延长计划时间限制或减少步骤数量');
    }

    // 基于成功概率的推荐
    if (plan.successProbability < 0.7) {
      recommendations.push('建议重新评估计划可行性');
      recommendations.push('考虑增加更多准备步骤');
    }

    return recommendations;
  }

  /**
   * 辅助方法
   */
  private prioritizeGoals(goals: Goal[]): Goal[] {
    return goals.sort((a, b) => {
      // 优先级高的排在前面
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      // 紧急目标排在前面
      if (a.type === GoalType.URGENT && b.type !== GoalType.URGENT) {
        return -1;
      }
      if (b.type === GoalType.URGENT && a.type !== GoalType.URGENT) {
        return 1;
      }
      return 0;
    });
  }

  private canRunInParallel(step: ActionStep, context: PlanningContext): boolean {
    // 没有依赖关系的步骤可以并行执行
    return step.dependencies.length === 0;
  }

  private isQualityCritical(step: ActionStep, context: PlanningContext): boolean {
    // 分析、监控等质量敏感步骤
    return [ActionType.ANALYSIS, ActionType.MONITORING].includes(step.type);
  }

  private isOptionalStep(step: ActionStep, context: PlanningContext): boolean {
    // 某些优化步骤可以跳过
    return [ActionType.OPTIMIZATION].includes(step.type);
  }

  private mergeSimilarSteps(steps: ActionStep[]): ActionStep[] {
    // 简单的相似步骤合并逻辑
    return steps;
  }

  private calculatePlanRiskLevel(steps: ActionStep[]): 'low' | 'medium' | 'high' {
    const riskLevels = steps.map(step => {
      const template = this.findTemplateForStep(step);
      return template?.riskLevel || 'medium';
    });

    // 使用最高风险级别
    if (riskLevels.includes('high')) return 'high';
    if (riskLevels.includes('medium')) return 'medium';
    return 'low';
  }

  private calculatePlanSuccessProbability(plan: ActionPlan, context: PlanningContext): number {
    // 基于步骤成功概率计算总体概率
    const stepProbabilities = plan.steps.map(step => 0.8); // 简化处理
    const avgProbability = stepProbabilities.reduce((sum, prob) => sum + prob, 0) / stepProbabilities.length;
    return avgProbability;
  }

  private calculateResourceAvailability(plan: ActionPlan, context: PlanningContext): number {
    if (!context.constraints?.resources) return 1.0;

    const availableResources = context.constraints.resources;
    const requiredResources = plan.resources;

    if (requiredResources.length === 0) return 1.0;

    const availableCount = requiredResources.filter(resource =>
      availableResources.includes(resource)
    ).length;

    return availableCount / requiredResources.length;
  }

  private findTemplateForStep(step: ActionStep): ActionTemplate | undefined {
    const templates = this.actionTemplates.get(step.type);
    if (!templates) return undefined;
    if (!step.description) return undefined;
    const stepName = step.description.split('(')[0].trim();
    return templates.find(template =>
      template.name.includes(stepName)
    );
  }

  private generateId(): string {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取规划历史
   */
  getPlanningHistory(): Array<{
    context: PlanningContext;
    result: PlanningResult;
    timestamp: Date;
  }> {
    return this.planningHistory;
  }

  /**
   * 清理规划历史
   */
  clearPlanningHistory(): void {
    this.planningHistory = [];
  }
}