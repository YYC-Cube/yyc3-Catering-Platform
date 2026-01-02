/**
 * @file 插件系统
 * @description 实现AI可插拔组件架构，支持组件的注册、加载和管理
 * @module PluginSystem
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

import { EventEmitter } from 'events';
import { AgentConfig } from '../AgenticCore';

/**
 * 插件元数据接口
 */
export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  license?: string;
  dependencies?: string[];
  tags?: string[];
  category: string;
  enabled?: boolean;
  entryPoint: string;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * 插件接口
 */
export interface Plugin {
  metadata: PluginMetadata;
  initialize(config: AgentConfig): Promise<void>;
  shutdown(): Promise<void>;
  getAPI?(): Record<string, any>;
  getEvents?(): string[];
}

/**
 * 插件系统类
 */
export class PluginSystem extends EventEmitter {
  private plugins: Map<string, Plugin> = new Map();
  private pluginsByCategory: Map<string, Set<string>> = new Map();
  private config!: AgentConfig;

  constructor() {
    super();
  }

  /**
   * 初始化插件系统
   */
  public async initialize(config: AgentConfig): Promise<void> {
    this.config = config;
    
    // 如果有配置的插件，加载它们
    if (config.plugins && Array.isArray(config.plugins)) {
      await this.loadPlugins(config.plugins);
    }

    this.emit('initialized');
  }

  /**
   * 注册插件
   */
  public async registerPlugin(plugin: Plugin): Promise<boolean> {
    const metadata = plugin.metadata;
    const pluginId = metadata.id;

    if (this.plugins.has(pluginId)) {
      console.warn(`Plugin ${pluginId} already registered, overwriting`);
      await this.unregisterPlugin(pluginId);
    }

    // 检查依赖
    if (metadata.dependencies) {
      for (const dep of metadata.dependencies) {
        if (!this.plugins.has(dep)) {
          console.warn(`Plugin ${pluginId} has missing dependency: ${dep}`);
          return false;
        }
      }
    }

    try {
      // 初始化插件
      await plugin.initialize(this.config);
      
      // 注册插件
      this.plugins.set(pluginId, plugin);

      // 添加到分类映射
      if (!this.pluginsByCategory.has(metadata.category)) {
        this.pluginsByCategory.set(metadata.category, new Set());
      }
      this.pluginsByCategory.get(metadata.category)?.add(pluginId);

      // 注册插件提供的API
      if (plugin.getAPI) {
        this.emit('pluginAPIReady', pluginId, plugin.getAPI());
      }

      // 注册插件事件
      if (plugin.getEvents) {
        const events = plugin.getEvents();
        events.forEach(event => {
          this.on(event, (data) => {
            this.emit(`${pluginId}:${event}`, data);
          });
        });
      }

      this.emit('pluginRegistered', plugin);
      return true;
    } catch (error) {
      console.error(`Failed to register plugin ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * 卸载插件
   */
  public async unregisterPlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      console.warn(`Plugin ${pluginId} not found for unregistration`);
      return false;
    }

    try {
      // 关闭插件
      await plugin.shutdown();

      // 移除插件
      this.plugins.delete(pluginId);

      // 从分类映射中移除
      if (this.pluginsByCategory.has(plugin.metadata.category)) {
        this.pluginsByCategory.get(plugin.metadata.category)?.delete(pluginId);
        // 如果分类为空，移除分类
        if (this.pluginsByCategory.get(plugin.metadata.category)?.size === 0) {
          this.pluginsByCategory.delete(plugin.metadata.category);
        }
      }

      this.emit('pluginUnregistered', pluginId);
      return true;
    } catch (error) {
      console.error(`Failed to unregister plugin ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * 加载插件
   */
  public async loadPlugins(pluginPaths: string[]): Promise<{ success: number; failed: string[] }> {
    let success = 0;
    const failed: string[] = [];

    for (const pluginPath of pluginPaths) {
      try {
        // 动态导入插件
        const pluginModule = await import(pluginPath);
        let pluginClass = pluginModule.default;
        
        if (!pluginClass) {
          const keys = Object.keys(pluginModule);
          if (keys.length > 0) {
            pluginClass = pluginModule[keys[0]];
          }
        }
        
        if (typeof pluginClass === 'function') {
          const pluginInstance = new pluginClass();
          if (await this.registerPlugin(pluginInstance)) {
            success++;
          } else {
            failed.push(pluginPath);
          }
        } else {
          console.error(`Invalid plugin format at ${pluginPath}`);
          failed.push(pluginPath);
        }
      } catch (error) {
        console.error(`Failed to load plugin at ${pluginPath}:`, error);
        failed.push(pluginPath);
      }
    }

    return { success, failed };
  }

  /**
   * 获取所有插件分类
   */
  public getPluginCategories(): string[] {
    return Array.from(this.pluginsByCategory.keys());
  }

  /**
   * 根据分类获取插件
   */
  public getPluginsByCategory(category: string): Plugin[] {
    const pluginIds = this.pluginsByCategory.get(category);
    if (!pluginIds) {
      return [];
    }
    return Array.from(pluginIds)
      .map(id => this.plugins.get(id))
      .filter((plugin): plugin is Plugin => plugin !== undefined);
  }

  /**
   * 获取插件
   */
  public getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * 获取所有插件
   */
  public getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 获取启用的插件
   */
  public getEnabledPlugins(): Plugin[] {
    return Array.from(this.plugins.values())
      .filter(plugin => plugin.metadata.enabled !== false);
  }

  /**
   * 搜索插件
   */
  public searchPlugins(query: string): Plugin[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.plugins.values())
      .filter(plugin => 
        plugin.metadata.id.toLowerCase().includes(lowerQuery) ||
        plugin.metadata.name.toLowerCase().includes(lowerQuery) ||
        plugin.metadata.description.toLowerCase().includes(lowerQuery) ||
        (plugin.metadata.tags && Array.isArray(plugin.metadata.tags) && 
         plugin.metadata.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery)))
      );
  }

  /**
   * 启用插件
   */
  public async enablePlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return false;
    }

    plugin.metadata.enabled = true;
    this.emit('pluginEnabled', pluginId);
    return true;
  }

  /**
   * 禁用插件
   */
  public async disablePlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return false;
    }

    plugin.metadata.enabled = false;
    this.emit('pluginDisabled', pluginId);
    return true;
  }

  /**
   * 检查插件依赖是否满足
   */
  public checkPluginDependencies(pluginId: string): { valid: boolean; missing: string[] } {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return { valid: false, missing: [pluginId] };
    }

    const missing: string[] = [];
    if (plugin.metadata.dependencies) {
      for (const dep of plugin.metadata.dependencies) {
        if (!this.plugins.has(dep) || this.plugins.get(dep)?.metadata.enabled === false) {
          missing.push(dep);
        }
      }
    }

    return { valid: missing.length === 0, missing };
  }

  /**
   * 关闭插件系统
   */
  public async shutdown(): Promise<void> {
    // 关闭所有插件
    for (const plugin of this.plugins.values()) {
      try {
        await plugin.shutdown();
      } catch (error) {
        console.error(`Error shutting down plugin ${plugin.metadata.id}:`, error);
      }
    }

    this.plugins.clear();
    this.pluginsByCategory.clear();

    this.emit('shutdown');
  }
}
