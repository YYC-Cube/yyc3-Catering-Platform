/**
 * YYC³餐饮行业智能化平台 - 智能代理核心系统
 * 基于多智能体架构的餐饮业务自动化决策引擎
 *
 * 功能特性:
 * - 多智能体协同工作
 * - 实时数据分析和决策
 * - 自适应学习和优化
 * - 跨模块任务编排
 */

import { EventEmitter } from 'events';
import { GoalManager } from './systems/GoalManager';
import { ActionPlanner } from './systems/ActionPlanner';
import { ToolOrchestrator } from './systems/ToolOrchestrator';
import { ReflectionEngine } from './systems/ReflectionEngine';
import { MemoryManager } from './systems/MemoryManager';
import { ContextManager } from './systems/ContextManager';
import { CommunicationHub } from './systems/CommunicationHub';
import { AutonomousAIEngine } from './systems/AutonomousAIEngine';
import { PluginSystem } from './systems/PluginSystem';
import { Goal, GoalStatus } from './models/Goal';
import { ActionPlan, ActionStep, ActionStatus } from './models/Action';

export interface AgentCapability {
  name: string;
  description: string;
  enabled: boolean;
  config: Record<string, any>;
}

export interface AgentConfig {
  id: string;
  name: string;
  type: string;
  capabilities: AgentCapability[];
  learningEnabled: boolean;
  autonomousMode: boolean;
  communicationEnabled: boolean;
  updateInterval: number; // 毫秒
  plugins?: string[]; // 插件路径数组
}

export interface ContextData {
  restaurantId?: string;
  customerId?: string;
  orderId?: string;
  timestamp: number;
  environment: Record<string, any>;
  goals: string[];
  constraints: Record<string, any>;
}







export interface ExecutionResult {
  success: boolean;
  actionId: string;
  result?: any;
  error?: string;
  metrics: Record<string, number>;
  timestamp: number;
}

export interface PlanningContext {
  goals: Goal[];
  environment: Record<string, any>;
  constraints: Record<string, any>;
  preferences: Record<string, any>;
}

/**
 * 智能代理核心类
 * 负责协调所有子系统，提供统一的智能决策接口
 */
export class AgenticCore extends EventEmitter {
  private config: AgentConfig;
  private isRunning: boolean = false;
  private currentContext: ContextData | null = null;
  private activeGoals: Map<string, Goal> = new Map();
  private activePlans: Map<string, ActionPlan> = new Map();
  private executionHistory: ExecutionResult[] = [];

  // 核心子系统
  private goalManager: GoalManager;
  private actionPlanner: ActionPlanner;
  private toolOrchestrator: ToolOrchestrator;
  private reflectionEngine: ReflectionEngine;
  private memoryManager: MemoryManager;
  private contextManager: ContextManager;
  private communicationHub: CommunicationHub;
  private autonomousAIEngine: AutonomousAIEngine;
  private pluginSystem: PluginSystem;

  private updateTimer: NodeJS.Timeout | null = null;

  constructor(config: AgentConfig) {
    super();
    this.config = config;

    // 初始化子系统
    this.goalManager = new GoalManager(this);
    this.actionPlanner = new ActionPlanner(this);
    this.toolOrchestrator = new ToolOrchestrator();
    this.reflectionEngine = new ReflectionEngine();
    this.memoryManager = new MemoryManager();
    this.contextManager = new ContextManager();
    this.communicationHub = new CommunicationHub(this);
    this.autonomousAIEngine = new AutonomousAIEngine();
    this.pluginSystem = new PluginSystem();

    this.setupEventHandlers();
  }

  /**
   * 获取代理配置
   */
  public getConfig(): AgentConfig {
    return this.config;
  }

  /**
   * 获取工具协调器
   */
  public getToolOrchestrator(): ToolOrchestrator {
    return this.toolOrchestrator;
  }

  /**
   * 获取插件系统
   */
  public getPluginSystem(): PluginSystem {
    return this.pluginSystem;
  }

  /**
   * 启动智能代理核心
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('AgenticCore is already running');
      return;
    }

    console.log(`Starting AgenticCore: ${this.config.name} (${this.config.id})`);

    // 初始化所有子系统
    await this.initializeSubsystems();

    // 启动定时更新循环
    if (this.config.updateInterval > 0) {
      this.updateTimer = setInterval(() => {
        this.updateCycle();
      }, this.config.updateInterval);
    }

    this.isRunning = true;
    this.emit('started', { agentId: this.config.id, timestamp: Date.now() });

    console.log('AgenticCore started successfully');
  }

  /**
   * 停止智能代理核心
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      console.warn('AgenticCore is not running');
      return;
    }

    console.log('Stopping AgenticCore...');

    // 停止定时更新
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }

    // 停止所有子系统
    await this.shutdownSubsystems();

    this.isRunning = false;
    this.emit('stopped', { agentId: this.config.id, timestamp: Date.now() });

    console.log('AgenticCore stopped successfully');
  }

  /**
   * 设置当前上下文
   */
  public setContext(context: ContextData): void {
    this.currentContext = context;
    this.contextManager.updateContext(context);
    this.emit('contextChanged', { context, timestamp: Date.now() });
  }

  /**
   * 添加新目标
   */
  public async addGoal(goalData: Omit<Goal, 'id' | 'status' | 'progress' | 'createdAt' | 'updatedAt'>): Promise<string> {
      const goalId = this.generateId();
      const now = new Date();
      const newGoal: Goal = {
        id: goalId,
        name: goalData.name,
        description: goalData.description,
        type: goalData.type,
        priority: goalData.priority,
        status: GoalStatus.PENDING,
        progress: {
          progress: 0,
          completedSteps: 0,
          totalSteps: 0,
          lastUpdated: now
        },
        successCriteria: goalData.successCriteria,
        metrics: goalData.metrics,
        context: goalData.context,
        subGoals: goalData.subGoals,
        dependencies: goalData.dependencies,
        createdAt: now,
        updatedAt: now
      };

      // 添加可选属性
      if (goalData.deadline) {
        newGoal.deadline = goalData.deadline;
      }

      if (goalData.evaluation) {
        newGoal.evaluation = goalData.evaluation;
      };

      this.activeGoals.set(goalId, newGoal);
      await this.goalManager.createGoal(newGoal);

      this.emit('goalAdded', { goalId, goal: newGoal, timestamp: Date.now() });

      // 如果系统正在运行，立即为新目标生成计划
      if (this.isRunning) {
        await this.planActionsForGoal(goalId);
      }

      return goalId;
    }

  /**
   * 执行特定行动
   */
  public async executeAction(
    actionType: string,
    parameters: Record<string, any>,
    context?: ContextData
  ): Promise<ExecutionResult> {
    const actionId = this.generateId();
    const startTime = Date.now();

    try {
      // 更新上下文
      if (context) {
        this.setContext(context);
      }

      // 通过工具编排器执行行动
      const result = await this.toolOrchestrator.executeTool(actionType, parameters, this.currentContext);

      const executionResult: ExecutionResult = {
        success: true,
        actionId,
        result,
        metrics: {
          executionTime: Date.now() - startTime,
          memoryUsage: process.memoryUsage().heapUsed
        },
        timestamp: Date.now()
      };

      // 记录执行历史
      this.executionHistory.push(executionResult);

      // 触发反思引擎
      if (this.config.learningEnabled) {
        await this.reflectionEngine.analyzeExecution(executionResult);
      }

      this.emit('actionExecuted', executionResult);
      return executionResult;

    } catch (error) {
      const executionResult: ExecutionResult = {
        success: false,
        actionId,
        error: error instanceof Error ? error.message : String(error),
        metrics: {
          executionTime: Date.now() - startTime,
          memoryUsage: process.memoryUsage().heapUsed
        },
        timestamp: Date.now()
      };

      this.executionHistory.push(executionResult);
      this.emit('actionFailed', executionResult);
      return executionResult;
    }
  }

  /**
   * 获取推荐行动
   */
  public async getRecommendedActions(context?: ContextData): Promise<ActionPlan[]> {
    const currentContext = context || this.currentContext;
    if (!currentContext) {
      throw new Error('No context available');
    }

    // 分析当前情况，生成推荐
    const recommendations = await this.actionPlanner.generateRecommendations(
      Array.from(this.activeGoals.values()),
      currentContext
    );

    return recommendations;
  }

  /**
   * 获取代理状态
   */
  public getStatus(): {
    isRunning: boolean;
    activeGoals: number;
    activePlans: number;
    executionHistory: number;
    lastUpdate: number;
  } {
    return {
      isRunning: this.isRunning,
      activeGoals: this.activeGoals.size,
      activePlans: this.activePlans.size,
      executionHistory: this.executionHistory.length,
      lastUpdate: Date.now()
    };
  }

  /**
   * 学习和优化
   */
  public async learn(examples: Array<{ input: any; output: any; feedback?: number }>): Promise<void> {
    if (!this.config.learningEnabled) {
      console.warn('Learning is disabled');
      return;
    }

    for (const example of examples) {
      await this.memoryManager.storeExperience(example);
      await this.reflectionEngine.learnFromExample(example);
    }

    this.emit('learningCompleted', { examplesCount: examples.length, timestamp: Date.now() });
  }

  /**
   * 私有方法：初始化子系统
   */
  private async initializeSubsystems(): Promise<void> {
    // 只传递GoalManager.initialize()需要的参数
    await this.goalManager.initialize({});
    await this.toolOrchestrator.initialize(this.config);
    await this.reflectionEngine.initialize(this.config);
    await this.memoryManager.initialize(this.config);
    await this.contextManager.initialize(this.config);
    await this.communicationHub.initialize(this.config);
    await this.autonomousAIEngine.initialize(this.config, this.toolOrchestrator, this.contextManager);
    await this.pluginSystem.initialize(this.config);
  }

  /**
   * 私有方法：关闭子系统
   */
  private async shutdownSubsystems(): Promise<void> {
    await this.goalManager.shutdown();
    // ActionPlanner does not have shutdown method
    await this.pluginSystem.shutdown();
    await this.autonomousAIEngine.shutdown();
    await this.toolOrchestrator.shutdown();
    await this.reflectionEngine.shutdown();
    await this.memoryManager.shutdown();
    await this.contextManager.shutdown();
    await this.communicationHub.shutdown();
  }

  /**
   * 私有方法：更新周期
   */
  private async updateCycle(): Promise<void> {
    if (!this.isRunning || !this.currentContext) {
      return;
    }

    try {
      // 1. 更新上下文信息
      await this.contextManager.refreshContext();

      // 2. 检查目标状态
      // Goal更新由goalManager内部处理，无需在此处调用

      // 3. 生成新的行动计划
      if (this.config.autonomousMode) {
        await this.generateAutonomousPlans();
      }

      // 4. 执行待处理的行动
      await this.executePendingActions();

      // 5. 反思和优化
      if (this.config.learningEnabled) {
        await this.reflectionEngine.performReflection();
      }

      // 6. 通信协调
      if (this.config.communicationEnabled) {
        await this.communicationHub.processMessages();
      }

      this.emit('updateCycleCompleted', { timestamp: Date.now() });

    } catch (error) {
      console.error('Error in update cycle:', error);
      this.emit('updateCycleError', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * 为指定目标规划行动
   */
  public async planActionsForGoal(goalId: string): Promise<void> {
     const goal = this.activeGoals.get(goalId);
     if (!goal) return;

     const context: ContextData = this.currentContext || { 
       timestamp: Date.now(), 
       environment: {}, 
       goals: [], 
       constraints: {} 
     };
     const planningContext: PlanningContext = {
       goals: Array.from(this.activeGoals.values()),
       environment: context.environment,
       constraints: context.constraints,
       preferences: {}
     };
     // 使用generateRecommendations方法替代不存在的createPlan方法
     const plans = await this.actionPlanner.generateRecommendations(
       [goal], 
       context, 
       { considerDependencies: true }
     );
     if (plans && plans.length > 0) {
       const plan = plans[0];
       if (plan) {
         this.activePlans.set(plan.id, plan);
         await this.executePendingActions(plan.id);
       }
     }
   }

  /**
   * 私有方法：生成自主计划
   */
  private async generateAutonomousPlans(): Promise<void> {
    const pendingGoals = Array.from(this.activeGoals.values())
      .filter(goal => goal.status === GoalStatus.PENDING);

    for (const goal of pendingGoals) {
      if (!this.activePlans.has(goal.id)) {
        await this.planActionsForGoal(goal.id);
      }
    }
  }

  /**
   * 私有方法：执行待处理行动
   */
  private async executePendingActions(planId?: string): Promise<void> {
    const plansToExecute = planId 
      ? [this.activePlans.get(planId)].filter((p): p is ActionPlan => p !== undefined) 
      : Array.from(this.activePlans.values());

    for (const plan of plansToExecute) {
      for (const step of plan.steps) {
        if (step.status === ActionStatus.PENDING && this.areDependenciesMet(step, plan)) {
          await this.executeStep(step, plan);
        }
      }
    }
  }

  /**
   * 私有方法：执行行动步骤
   */
  private async executeStep(step: ActionStep, plan: ActionPlan): Promise<void> {
    try {
      step.status = ActionStatus.IN_PROGRESS;
      const result = await this.toolOrchestrator.executeTool(
        step.tool,
        step.parameters,
        this.currentContext
      );

      step.result = result;
      step.status = ActionStatus.COMPLETED;

      this.emit('stepCompleted', { stepId: step.id, planId: plan.id, result });

    } catch (error) {
      step.error = error instanceof Error ? error.message : String(error);
      step.status = ActionStatus.FAILED;

      this.emit('stepFailed', { stepId: step.id, planId: plan.id, error });
    }
  }

  /**
   * 私有方法：检查依赖是否满足
   */
  private areDependenciesMet(step: ActionStep, plan: ActionPlan): boolean {
    return step.dependencies.every(depId => {
      const depStep = plan.steps.find(s => s.id === depId);
      return depStep?.status === ActionStatus.COMPLETED;
    });
  }

  /**
   * 私有方法：设置事件处理器
   */
  private setupEventHandlers(): void {
    // 子系统事件监听
    this.goalManager.on('goalCompleted', (goal) => {
      this.activeGoals.delete(goal.id);
      this.activePlans.delete(goal.id);
      this.emit('goalCompleted', goal);
    });

    this.actionPlanner.on('planUpdated', (plan) => {
      this.activePlans.set(plan.id, plan);
      this.emit('planUpdated', plan);
    });

    this.reflectionEngine.on('newInsight', (insight) => {
      this.emit('newInsight', insight);
    });

    this.communicationHub.on('messageReceived', (message) => {
      this.emit('messageReceived', message);
    });
  }

  /**
   * 私有方法：生成唯一ID
   */
  private generateId(): string {
    return `${this.config.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 接口已在定义时直接导出，无需重复导出