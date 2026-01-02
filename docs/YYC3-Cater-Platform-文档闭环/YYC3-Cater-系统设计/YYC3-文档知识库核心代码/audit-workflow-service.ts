/**
 * @file 审核工作流服务
 * @description 管理文档自动化审核流程，包括审核规则引擎、审核任务调度和审核结果处理
 * @module audit-workflow
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { DocumentRepository } from './document.repository';
import { QualityAssessmentService } from './quality-assessment.service';
import { Logger } from './logger';

/**
 * 审核规则定义
 */
export interface AuditRule {
  /** 规则ID */
  id: string;
  /** 规则名称 */
  name: string;
  /** 规则描述 */
  description: string;
  /** 规则类型 */
  type: 'quality' | 'content' | 'security' | 'compliance' | 'style';
  /** 严重级别 */
  severity: 'critical' | 'high' | 'medium' | 'low';
  /** 规则条件 */
  condition: (document: any) => boolean;
  /** 规则执行函数 */
  execute: (document: any) => Promise<AuditResult>;
  /** 是否启用 */
  enabled: boolean;
}

/**
 * 审核结果
 */
export interface AuditResult {
  /** 规则ID */
  ruleId: string;
  /** 是否通过 */
  passed: boolean;
  /** 错误消息 */
  message?: string;
  /** 错误位置 */
  location?: {
    /** 行号 */
    line: number;
    /** 列号 */
    column: number;
  };
  /** 建议修复 */
  suggestion?: string;
}

/**
 * 审核报告
 */
export interface AuditReport {
  /** 报告ID */
  id: string;
  /** 文档ID */
  documentId: string;
  /** 审核时间 */
  auditTime: Date;
  /** 审核人 */
  auditor: string;
  /** 审核结果列表 */
  results: AuditResult[];
  /** 总体评分 */
  score: number;
  /** 是否通过 */
  passed: boolean;
  /** 审核状态 */
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

/**
 * 审核任务
 */
export interface AuditTask {
  /** 任务ID */
  id: string;
  /** 文档ID */
  documentId: string;
  /** 任务类型 */
  type: 'auto' | 'manual' | 'scheduled';
  /** 任务状态 */
  status: 'pending' | 'running' | 'completed' | 'failed';
  /** 创建时间 */
  createdAt: Date;
  /** 开始时间 */
  startedAt?: Date;
  /** 完成时间 */
  completedAt?: Date;
  /** 优先级 */
  priority: 'low' | 'medium' | 'high' | 'critical';
  /** 审核报告ID */
  reportId?: string;
  /** 错误信息 */
  error?: string;
}

/**
 * 审核配置
 */
export interface AuditConfig {
  /** 是否启用自动审核 */
  autoAuditEnabled: boolean;
  /** 审核间隔（小时） */
  auditInterval: number;
  /** 审核超时（分钟） */
  auditTimeout: number;
  /** 最大并发审核任务数 */
  maxConcurrentAudits: number;
  /** 通知配置 */
  notifications: {
    /** 审核失败是否通知 */
    onAuditFailure: boolean;
    /** 审核通过是否通知 */
    onAuditSuccess: boolean;
    /** 通知邮箱列表 */
    emailRecipients: string[];
  };
}

/**
 * 审核工作流服务
 */
export class AuditWorkflowService {
  private documentRepository: DocumentRepository;
  private qualityAssessmentService: QualityAssessmentService;
  private logger: Logger;
  private rules: Map<string, AuditRule> = new Map();
  private tasks: Map<string, AuditTask> = new Map();
  private reports: Map<string, AuditReport> = new Map();
  private config: AuditConfig;
  private auditTimer?: NodeJS.Timeout;

  constructor(
    documentRepository: DocumentRepository,
    qualityAssessmentService: QualityAssessmentService,
    logger: Logger,
    config?: Partial<AuditConfig>
  ) {
    this.documentRepository = documentRepository;
    this.qualityAssessmentService = qualityAssessmentService;
    this.logger = logger;
    
    this.config = {
      autoAuditEnabled: true,
      auditInterval: 24,
      auditTimeout: 30,
      maxConcurrentAudits: 5,
      notifications: {
        onAuditFailure: true,
        onAuditSuccess: false,
        emailRecipients: [],
      },
      ...config,
    };

    this.initializeDefaultRules();
    this.loadTasks();
    this.loadReports();
    
    if (this.config.autoAuditEnabled) {
      this.startScheduledAudits();
    }
  }

  /**
   * 初始化默认审核规则
   */
  private initializeDefaultRules(): void {
    // 质量规则
    this.addRule({
      id: 'quality-score',
      name: '文档质量评分',
      description: '检查文档质量评分是否达到最低要求',
      type: 'quality',
      severity: 'high',
      condition: (doc) => true,
      execute: async (doc) => {
        const assessment = await this.qualityAssessmentService.assessDocument(doc.id);
        const minScore = 70;
        if (assessment.overallScore < minScore) {
          return {
            ruleId: 'quality-score',
            passed: false,
            message: `文档质量评分 ${assessment.overallScore} 低于最低要求 ${minScore}`,
            suggestion: '建议改进文档内容、结构和格式',
          };
        }
        return { ruleId: 'quality-score', passed: true };
      },
      enabled: true,
    });

    // 内容规则
    this.addRule({
      id: 'content-length',
      name: '内容长度检查',
      description: '检查文档内容长度是否合理',
      type: 'content',
      severity: 'medium',
      condition: (doc) => true,
      execute: async (doc) => {
        const minLength = 100;
        const maxLength = 100000;
        const contentLength = doc.content?.length || 0;
        
        if (contentLength < minLength) {
          return {
            ruleId: 'content-length',
            passed: false,
            message: `文档内容长度 ${contentLength} 小于最小要求 ${minLength}`,
            suggestion: '建议增加文档内容',
          };
        }
        
        if (contentLength > maxLength) {
          return {
            ruleId: 'content-length',
            passed: false,
            message: `文档内容长度 ${contentLength} 超过最大限制 ${maxLength}`,
            suggestion: '建议拆分文档或精简内容',
          };
        }
        
        return { ruleId: 'content-length', passed: true };
      },
      enabled: true,
    });

    // 安全规则
    this.addRule({
      id: 'security-sensitive-info',
      name: '敏感信息检查',
      description: '检查文档中是否包含敏感信息',
      type: 'security',
      severity: 'critical',
      condition: (doc) => true,
      execute: async (doc) => {
        const sensitivePatterns = [
          /password\s*[:=]\s*\S+/gi,
          /api[_-]?key\s*[:=]\s*\S+/gi,
          /secret\s*[:=]\s*\S+/gi,
          /token\s*[:=]\s*\S+/gi,
        ];
        
        const content = doc.content || '';
        for (const pattern of sensitivePatterns) {
          const match = content.match(pattern);
          if (match) {
            return {
              ruleId: 'security-sensitive-info',
              passed: false,
              message: '文档中检测到可能的敏感信息',
              suggestion: '请移除敏感信息或使用环境变量替代',
            };
          }
        }
        
        return { ruleId: 'security-sensitive-info', passed: true };
      },
      enabled: true,
    });

    // 合规规则
    this.addRule({
      id: 'compliance-metadata',
      name: '元数据完整性检查',
      description: '检查文档元数据是否完整',
      type: 'compliance',
      severity: 'high',
      condition: (doc) => true,
      execute: async (doc) => {
        const requiredFields = ['title', 'author', 'category', 'tags'];
        const missingFields = requiredFields.filter(field => !doc[field]);
        
        if (missingFields.length > 0) {
          return {
            ruleId: 'compliance-metadata',
            passed: false,
            message: `文档缺少必需的元数据字段: ${missingFields.join(', ')}`,
            suggestion: '请补充完整的文档元数据',
          };
        }
        
        return { ruleId: 'compliance-metadata', passed: true };
      },
      enabled: true,
    });

    // 样式规则
    this.addRule({
      id: 'style-formatting',
      name: '格式一致性检查',
      description: '检查文档格式是否符合规范',
      type: 'style',
      severity: 'low',
      condition: (doc) => true,
      execute: async (doc) => {
        const content = doc.content || '';
        const issues: string[] = [];
        
        // 检查标题层级
        const headingLevels = content.match(/^#+\s/gm);
        if (headingLevels) {
          let prevLevel = 0;
          for (const heading of headingLevels) {
            const level = heading.trim().length;
            if (level > prevLevel + 1) {
              issues.push(`标题层级跳跃: 从 h${prevLevel} 直接跳到 h${level}`);
            }
            prevLevel = level;
          }
        }
        
        if (issues.length > 0) {
          return {
            ruleId: 'style-formatting',
            passed: false,
            message: issues.join('; '),
            suggestion: '请调整文档格式，保持标题层级一致',
          };
        }
        
        return { ruleId: 'style-formatting', passed: true };
      },
      enabled: true,
    });
  }

  /**
   * 添加审核规则
   */
  addRule(rule: AuditRule): void {
    this.rules.set(rule.id, rule);
    this.logger.info(`审核规则已添加: ${rule.name} (${rule.id})`);
  }

  /**
   * 移除审核规则
   */
  removeRule(ruleId: string): boolean {
    const result = this.rules.delete(ruleId);
    if (result) {
      this.logger.info(`审核规则已移除: ${ruleId}`);
    }
    return result;
  }

  /**
   * 获取所有审核规则
   */
  getRules(): AuditRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * 启用审核规则
   */
  enableRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = true;
      this.logger.info(`审核规则已启用: ${ruleId}`);
      return true;
    }
    return false;
  }

  /**
   * 禁用审核规则
   */
  disableRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = false;
      this.logger.info(`审核规则已禁用: ${ruleId}`);
      return true;
    }
    return false;
  }

  /**
   * 创建审核任务
   */
  async createAuditTask(
    documentId: string,
    type: 'auto' | 'manual' | 'scheduled' = 'auto',
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<AuditTask> {
    const task: AuditTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      documentId,
      type,
      status: 'pending',
      createdAt: new Date(),
      priority,
    };
    
    this.tasks.set(task.id, task);
    this.saveTasks();
    this.logger.info(`审核任务已创建: ${task.id} (文档: ${documentId})`);
    
    return task;
  }

  /**
   * 执行审核任务
   */
  async executeAuditTask(taskId: string, auditor: string = 'system'): Promise<AuditReport> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`审核任务不存在: ${taskId}`);
    }

    task.status = 'running';
    task.startedAt = new Date();
    this.saveTasks();

    try {
      const document = await this.documentRepository.getById(task.documentId);
      if (!document) {
        throw new Error(`文档不存在: ${task.documentId}`);
      }

      const results: AuditResult[] = [];
      const enabledRules = Array.from(this.rules.values()).filter(rule => rule.enabled);

      for (const rule of enabledRules) {
        try {
          if (rule.condition(document)) {
            const result = await rule.execute(document);
            results.push(result);
          }
        } catch (error) {
          this.logger.error(`规则执行失败: ${rule.id}`, { error });
          const errorMessage = error instanceof Error ? error.message : '未知错误';
          results.push({
            ruleId: rule.id,
            passed: false,
            message: `规则执行异常: ${errorMessage}`,
          });
        }
      }

      // 计算总体评分
      const criticalIssues = results.filter(r => !r.passed).length;
      const score = Math.max(0, 100 - criticalIssues * 10);
      const passed = results.every(r => r.passed);

      const report: AuditReport = {
        id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        documentId: task.documentId,
        auditTime: new Date(),
        auditor,
        results,
        score,
        passed,
        status: 'completed',
      };

      this.reports.set(report.id, report);
      task.reportId = report.id;
      task.status = 'completed';
      task.completedAt = new Date();
      this.saveTasks();
      this.saveReports();

      this.logger.info(`审核任务完成: ${taskId} (评分: ${score}, 通过: ${passed})`);

      // 发送通知
      if (this.config.notifications.onAuditFailure && !passed) {
        this.sendAuditNotification(document, report);
      }

      return report;
    } catch (error) {
      task.status = 'failed';
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      task.error = errorMessage;
      task.completedAt = new Date();
      this.saveTasks();
      this.logger.error(`审核任务失败: ${taskId}`, { error });
      throw error;
    }
  }

  /**
   * 批量审核文档
   */
  async auditDocuments(
    documentIds: string[],
    auditor: string = 'system'
  ): Promise<Map<string, AuditReport>> {
    const reports = new Map<string, AuditReport>();
    const runningTasks: AuditTask[] = [];

    // 创建审核任务
    for (const documentId of documentIds) {
      const task = await this.createAuditTask(documentId, 'auto', 'medium');
      runningTasks.push(task);
    }

    // 执行审核任务（限制并发数）
    const batchSize = this.config.maxConcurrentAudits;
    for (let i = 0; i < runningTasks.length; i += batchSize) {
      const batch = runningTasks.slice(i, i + batchSize);
      await Promise.all(
        batch.map(task => this.executeAuditTask(task.id, auditor).then(report => {
          reports.set(task.documentId, report);
        }))
      );
    }

    return reports;
  }

  /**
   * 获取审核任务
   */
  getTask(taskId: string): AuditTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * 获取文档的所有审核任务
   */
  getDocumentTasks(documentId: string): AuditTask[] {
    return Array.from(this.tasks.values()).filter(task => task.documentId === documentId);
  }

  /**
   * 获取所有待处理的审核任务
   */
  getPendingTasks(): AuditTask[] {
    return Array.from(this.tasks.values())
      .filter(task => task.status === 'pending')
      .sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));
  }

  /**
   * 获取审核报告
   */
  getReport(reportId: string): AuditReport | undefined {
    return this.reports.get(reportId);
  }

  /**
   * 获取文档的所有审核报告
   */
  getDocumentReports(documentId: string): AuditReport[] {
    return Array.from(this.reports.values())
      .filter(report => report.documentId === documentId)
      .sort((a, b) => b.auditTime.getTime() - a.auditTime.getTime());
  }

  /**
   * 启动定时审核
   */
  startScheduledAudits(): void {
    if (this.auditTimer) {
      clearInterval(this.auditTimer);
    }

    this.auditTimer = setInterval(async () => {
      try {
        this.logger.info('开始定时审核任务');
        const documents = await this.documentRepository.getAll();
        const documentIds = documents.map(doc => doc.id);
        const reports = await this.auditDocuments(documentIds, 'system');
        this.logger.info(`定时审核完成，共审核 ${reports.size} 个文档`);
      } catch (error) {
        this.logger.error('定时审核失败', { error });
      }
    }, this.config.auditInterval * 60 * 60 * 1000);

    this.logger.info(`定时审核已启动，间隔: ${this.config.auditInterval} 小时`);
  }

  /**
   * 停止定时审核
   */
  stopScheduledAudits(): void {
    if (this.auditTimer) {
      clearInterval(this.auditTimer);
      this.auditTimer = undefined;
      this.logger.info('定时审核已停止');
    }
  }

  /**
   * 更新审核配置
   */
  updateConfig(config: Partial<AuditConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.info('审核配置已更新');
    
    if (this.config.autoAuditEnabled && !this.auditTimer) {
      this.startScheduledAudits();
    } else if (!this.config.autoAuditEnabled && this.auditTimer) {
      this.stopScheduledAudits();
    }
  }

  /**
   * 获取审核配置
   */
  getConfig(): AuditConfig {
    return { ...this.config };
  }

  /**
   * 获取审核统计信息
   */
  getAuditStats(): {
    totalTasks: number;
    pendingTasks: number;
    runningTasks: number;
    completedTasks: number;
    failedTasks: number;
    totalReports: number;
    passedReports: number;
    failedReports: number;
    averageScore: number;
  } {
    const tasks = Array.from(this.tasks.values());
    const reports = Array.from(this.reports.values());

    return {
      totalTasks: tasks.length,
      pendingTasks: tasks.filter(t => t.status === 'pending').length,
      runningTasks: tasks.filter(t => t.status === 'running').length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      failedTasks: tasks.filter(t => t.status === 'failed').length,
      totalReports: reports.length,
      passedReports: reports.filter(r => r.passed).length,
      failedReports: reports.filter(r => !r.passed).length,
      averageScore: reports.length > 0
        ? reports.reduce((sum, r) => sum + r.score, 0) / reports.length
        : 0,
    };
  }

  /**
   * 发送审核通知
   */
  private sendAuditNotification(document: any, report: AuditReport): void {
    // 这里可以实现邮件、Slack等通知方式
    this.logger.info(
      `审核通知: 文档 ${document.title} (ID: ${document.id}) 审核未通过，评分: ${report.score}`
    );
  }

  /**
   * 获取优先级数值
   */
  private getPriorityValue(priority: string): number {
    const values: Record<string, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };
    return values[priority] || 0;
  }

  /**
   * 保存任务数据
   */
  private saveTasks(): void {
    // 实现数据持久化
    const tasksData = Array.from(this.tasks.entries());
    // 这里可以保存到文件或数据库
  }

  /**
   * 加载任务数据
   */
  private loadTasks(): void {
    // 实现数据加载
    // 这里可以从文件或数据库加载
  }

  /**
   * 保存报告数据
   */
  private saveReports(): void {
    // 实现数据持久化
    const reportsData = Array.from(this.reports.entries());
    // 这里可以保存到文件或数据库
  }

  /**
   * 加载报告数据
   */
  private loadReports(): void {
    // 实现数据加载
    // 这里可以从文件或数据库加载
  }
}
