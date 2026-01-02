/**
 * YYC³餐饮行业智能化平台 - 工具编排器
 * 负责管理和调度各种工具和API，实现任务的具体执行
 *
 * 功能特性:
 * - 工具注册和发现
 * - 工具执行和监控
 * - 参数验证和转换
 * - 结果处理和格式化
 */

import { EventEmitter } from 'events';
import { AgentConfig } from '../AgenticCore';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (params: Record<string, any>, context: any) => Promise<any>;
  category: string;
  enabled: boolean;
  version: string;
  dependencies?: string[];
  metadata?: Record<string, any>;
  author?: string;
  license?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface ToolExecutionResult {
  success: boolean;
  data: any;
  error?: string;
  executionTime: number;
  toolName: string;
}

export class ToolOrchestrator extends EventEmitter {
  private tools: Map<string, ToolDefinition> = new Map();
  private toolsByCategory: Map<string, Set<string>> = new Map();
  private config!: AgentConfig;
  private executionHistory: ToolExecutionResult[] = [];

  constructor() {
    super();
  }

  /**
   * 初始化工具编排器
   */
  public async initialize(config: AgentConfig): Promise<void> {
    this.config = config;
    this.tools.clear();
    this.executionHistory = [];

    // 注册默认工具
    await this.registerDefaultTools();

    console.log(`ToolOrchestrator initialized with ${this.tools.size} tools`);
  }

  /**
   * 关闭工具编排器
   */
  public async shutdown(): Promise<void> {
    // 清理资源
    this.tools.clear();
    this.executionHistory = [];
    console.log('ToolOrchestrator shutdown');
  }

  /**
   * 注册新工具
   */
  public registerTool(tool: ToolDefinition): void {
    // 确保工具定义包含必要的默认值
    const normalizedTool: ToolDefinition = {
      ...tool,
      version: tool.version || '1.0.0',
      metadata: tool.metadata || {},
      createdAt: tool.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    if (this.tools.has(normalizedTool.name)) {
      console.warn(`Tool ${normalizedTool.name} already registered, overwriting`);
    }

    // 检查依赖
    if (normalizedTool.dependencies) {
      for (const dep of normalizedTool.dependencies) {
        if (!this.tools.has(dep)) {
          console.warn(`Tool ${normalizedTool.name} has missing dependency: ${dep}`);
        }
      }
    }

    // 注册工具
    this.tools.set(normalizedTool.name, normalizedTool);

    // 添加到分类映射
    if (!this.toolsByCategory.has(normalizedTool.category)) {
      this.toolsByCategory.set(normalizedTool.category, new Set());
    }
    this.toolsByCategory.get(normalizedTool.category)?.add(normalizedTool.name);

    this.emit('toolRegistered', normalizedTool);
  }

  /**
   * 卸载工具
   */
  public unregisterTool(name: string): boolean {
    const tool = this.tools.get(name);
    if (!tool) {
      console.warn(`Tool ${name} not found for unregistration`);
      return false;
    }

    // 移除工具
    this.tools.delete(name);

    // 从分类映射中移除
    if (this.toolsByCategory.has(tool.category)) {
      this.toolsByCategory.get(tool.category)?.delete(name);
      // 如果分类为空，移除分类
      if (this.toolsByCategory.get(tool.category)?.size === 0) {
        this.toolsByCategory.delete(tool.category);
      }
    }

    this.emit('toolUnregistered', name);
    return true;
  }

  /**
   * 获取所有工具分类
   */
  public getToolCategories(): string[] {
    return Array.from(this.toolsByCategory.keys());
  }

  /**
   * 根据分类获取工具
   */
  public getToolsByCategory(category: string): ToolDefinition[] {
    const toolNames = this.toolsByCategory.get(category);
    if (!toolNames) {
      return [];
    }
    return Array.from(toolNames)
      .map(name => this.tools.get(name))
      .filter((tool): tool is ToolDefinition => tool !== undefined);
  }

  /**
   * 搜索工具
   */
  public searchTools(query: string): ToolDefinition[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.tools.values())
      .filter(tool => 
        tool.name.toLowerCase().includes(lowerQuery) ||
        tool.description.toLowerCase().includes(lowerQuery) ||
        (tool.metadata && tool.metadata["tags"] && Array.isArray(tool.metadata["tags"]) && 
         tool.metadata["tags"].some((tag: string) => tag.toLowerCase().includes(lowerQuery)))
      );
  }

  /**
   * 更新工具
   */
  public updateTool(name: string, updates: Partial<ToolDefinition>): boolean {
    const tool = this.tools.get(name);
    if (!tool) {
      console.warn(`Tool ${name} not found for update`);
      return false;
    }

    const updatedTool: ToolDefinition = {
      ...tool,
      ...updates,
      updatedAt: Date.now()
    };

    this.tools.set(name, updatedTool);
    this.emit('toolUpdated', updatedTool);
    return true;
  }

  /**
   * 注册默认工具
   */
  private async registerDefaultTools(): Promise<void> {
    // 系统信息工具
    this.registerTool({
      name: 'system_info',
      description: '获取系统信息',
      parameters: {},
      execute: async () => {
        return {
          platform: process.platform,
          version: process.version,
          memory: process.memoryUsage(),
          uptime: process.uptime()
        };
      },
      category: 'system',
      enabled: true,
      version: '1.0.0',
      author: 'YYC³ Platform',
      license: 'MIT',
      metadata: {
        tags: ['system', 'info', 'platform'],
        compatibility: ['all']
      }
    });

    // 时间工具
    this.registerTool({
      name: 'current_time',
      description: '获取当前时间',
      parameters: {},
      execute: async () => {
        return {
          timestamp: Date.now(),
          date: new Date().toISOString(),
          localDate: new Date().toLocaleString()
        };
      },
      category: 'system',
      enabled: true,
      version: '1.0.0',
      author: 'YYC³ Platform',
      license: 'MIT',
      metadata: {
        tags: ['time', 'date', 'datetime'],
        compatibility: ['all']
      }
    });

    // 餐饮平台相关工具可以在这里注册
    // 例如：获取菜单、处理订单、分析销售数据等
  }

  /**
   * 执行工具
   */
  public async executeTool(
    toolName: string,
    parameters: Record<string, any>,
    context: any
  ): Promise<any> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }

    if (!tool.enabled) {
      throw new Error(`Tool ${toolName} is disabled`);
    }

    const startTime = Date.now();

    try {
      // 参数验证
      this.validateParameters(tool, parameters);

      // 执行工具
      const result = await tool.execute(parameters, context);

      const executionResult: ToolExecutionResult = {
        success: true,
        data: result,
        executionTime: Date.now() - startTime,
        toolName
      };

      this.executionHistory.push(executionResult);
      this.emit('toolExecuted', executionResult);

      return result;
    } catch (error) {
      const executionResult: ToolExecutionResult = {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime,
        toolName
      };

      this.executionHistory.push(executionResult);
      this.emit('toolFailed', executionResult);
      throw error;
    }
  }

  /**
   * 参数验证
   */
  private validateParameters(tool: ToolDefinition, parameters: Record<string, any>): void {
    // 简单的参数验证实现
    // 可以根据需要扩展为更复杂的验证
    for (const [paramName, paramConfig] of Object.entries(tool.parameters)) {
      if (paramConfig.required && !(paramName in parameters)) {
        throw new Error(`Missing required parameter: ${paramName}`);
      }
    }
  }

  /**
   * 获取可用工具列表
   */
  public getAvailableTools(): ToolDefinition[] {
    return Array.from(this.tools.values())
      .filter(tool => tool.enabled);
  }

  /**
   * 获取所有工具
   */
  public getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * 检查工具依赖是否满足
   */
  public checkToolDependencies(toolName: string): { valid: boolean; missing: string[] } {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return { valid: false, missing: [toolName] };
    }

    const missing: string[] = [];
    if (tool.dependencies) {
      for (const dep of tool.dependencies) {
        if (!this.tools.has(dep) || !this.tools.get(dep)?.enabled) {
          missing.push(dep);
        }
      }
    }

    return { valid: missing.length === 0, missing };
  }

  /**
   * 批量注册工具
   */
  public registerTools(tools: ToolDefinition[]): { success: number; failed: string[] } {
    let success = 0;
    const failed: string[] = [];

    for (const tool of tools) {
      try {
        this.registerTool(tool);
        success++;
      } catch (error) {
        failed.push(tool.name);
        console.error(`Failed to register tool ${tool.name}:`, error);
      }
    }

    return { success, failed };
  }

  /**
   * 获取工具定义
   */
  public getToolDefinition(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * 启用工具
   */
  public enableTool(name: string): void {
    const tool = this.tools.get(name);
    if (tool) {
      tool.enabled = true;
      this.emit('toolEnabled', tool);
    }
  }

  /**
   * 禁用工具
   */
  public disableTool(name: string): void {
    const tool = this.tools.get(name);
    if (tool) {
      tool.enabled = false;
      this.emit('toolDisabled', tool);
    }
  }

  /**
   * 获取执行历史
   */
  public getExecutionHistory(limit: number = 100): ToolExecutionResult[] {
    return this.executionHistory.slice(-limit);
  }
}
