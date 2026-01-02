/**
 * @file 审核工作流API
 * @description 提供文档自动化审核流程的API接口
 * @module api/audit-workflow
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { AuditWorkflowService, AuditConfig } from './audit-workflow-service';
import { DocumentRepository } from './document.repository';
import { QualityAssessmentService } from './quality-assessment.service';
import { Logger } from './logger';

const app = new Hono();

// 初始化服务
const documentRepository = new DocumentRepository();
const qualityAssessmentService = new QualityAssessmentService();
const logger = new Logger('AuditWorkflowAPI');
const auditWorkflowService = new AuditWorkflowService(
  documentRepository,
  qualityAssessmentService,
  logger
);

/**
 * 创建审核任务
 * @route POST /api/audit-workflow/tasks
 * @access 私有
 */
app.post('/tasks', zValidator('json', z.object({
  documentId: z.string().min(1),
  type: z.enum(['auto', 'manual', 'scheduled']).optional().default('auto'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
})), async (c) => {
  try {
    const { documentId, type, priority } = c.req.valid('json');
    const task = await auditWorkflowService.createAuditTask(documentId, type, priority);
    return c.json({ success: true, data: task }, 201);
  } catch (error) {
    logger.error('创建审核任务失败', { error });
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return c.json({ success: false, error: errorMessage }, 400);
  }
});

/**
 * 执行审核任务
 * @route POST /api/audit-workflow/tasks/:taskId/execute
 * @access 私有
 */
app.post('/tasks/:taskId/execute', zValidator('json', z.object({
  auditor: z.string().min(1).optional().default('system'),
})), async (c) => {
  try {
    const taskId = c.req.param('taskId');
    const { auditor } = c.req.valid('json');
    const report = await auditWorkflowService.executeAuditTask(taskId, auditor);
    return c.json({ success: true, data: report });
  } catch (error) {
    logger.error('执行审核任务失败', { error });
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return c.json({ success: false, error: errorMessage }, 400);
  }
});

/**
 * 获取审核任务
 * @route GET /api/audit-workflow/tasks/:taskId
 * @access 私有
 */
app.get('/tasks/:taskId', async (c) => {
  try {
    const taskId = c.req.param('taskId');
    const task = auditWorkflowService.getTask(taskId);
    
    if (!task) {
      return c.json({ success: false, error: '审核任务不存在' }, 404);
    }
    
    return c.json({ success: true, data: task });
  } catch (error) {
    logger.error('获取审核任务失败', { error });
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

/**
 * 获取文档的所有审核任务
 * @route GET /api/audit-workflow/documents/:documentId/tasks
 * @access 私有
 */
app.get('/documents/:documentId/tasks', async (c) => {
  try {
    const documentId = c.req.param('documentId');
    const tasks = auditWorkflowService.getDocumentTasks(documentId);
    return c.json({ success: true, data: tasks });
  } catch (error) {
    logger.error('获取文档审核任务失败', { error });
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

/**
 * 获取所有待处理的审核任务
 * @route GET /api/audit-workflow/tasks/pending
 * @access 私有
 */
app.get('/tasks/pending', async (c) => {
  try {
    const tasks = auditWorkflowService.getPendingTasks();
    return c.json({ success: true, data: tasks });
  } catch (error) {
    logger.error('获取待处理审核任务失败', { error });
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

/**
 * 获取审核报告
 * @route GET /api/audit-workflow/reports/:reportId
 * @access 私有
 */
app.get('/reports/:reportId', async (c) => {
  try {
    const reportId = c.req.param('reportId');
    const report = auditWorkflowService.getReport(reportId);
    
    if (!report) {
      return c.json({ success: false, error: '审核报告不存在' }, 404);
    }
    
    return c.json({ success: true, data: report });
  } catch (error) {
    logger.error('获取审核报告失败', { error });
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

/**
 * 获取文档的所有审核报告
 * @route GET /api/audit-workflow/documents/:documentId/reports
 * @access 私有
 */
app.get('/documents/:documentId/reports', async (c) => {
  try {
    const documentId = c.req.param('documentId');
    const reports = auditWorkflowService.getDocumentReports(documentId);
    return c.json({ success: true, data: reports });
  } catch (error) {
    logger.error('获取文档审核报告失败', { error });
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

/**
 * 批量审核文档
 * @route POST /api/audit-workflow/audit-batch
 * @access 私有
 */
app.post('/audit-batch', zValidator('json', z.object({
  documentIds: z.array(z.string().min(1)).min(1),
  auditor: z.string().min(1).optional().default('system'),
})), async (c) => {
  try {
    const { documentIds, auditor } = c.req.valid('json');
    const reports = await auditWorkflowService.auditDocuments(documentIds, auditor);
    return c.json({ success: true, data: Object.fromEntries(reports) });
  } catch (error) {
    logger.error('批量审核文档失败', { error });
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return c.json({ success: false, error: errorMessage }, 400);
  }
});

/**
 * 获取所有审核规则
 * @route GET /api/audit-workflow/rules
 * @access 私有
 */
app.get('/rules', async (c) => {
  try {
    const rules = auditWorkflowService.getRules();
    return c.json({ success: true, data: rules });
  } catch (error) {
    logger.error('获取审核规则失败', { error });
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

/**
 * 启用审核规则
 * @route POST /api/audit-workflow/rules/:ruleId/enable
 * @access 私有
 */
app.post('/rules/:ruleId/enable', async (c) => {
  try {
    const ruleId = c.req.param('ruleId');
    const result = auditWorkflowService.enableRule(ruleId);
    
    if (!result) {
      return c.json({ success: false, error: '审核规则不存在' }, 404);
    }
    
    return c.json({ success: true, message: '审核规则已启用' });
  } catch (error) {
    logger.error('启用审核规则失败', { error });
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

/**
 * 禁用审核规则
 * @route POST /api/audit-workflow/rules/:ruleId/disable
 * @access 私有
 */
app.post('/rules/:ruleId/disable', async (c) => {
  try {
    const ruleId = c.req.param('ruleId');
    const result = auditWorkflowService.disableRule(ruleId);
    
    if (!result) {
      return c.json({ success: false, error: '审核规则不存在' }, 404);
    }
    
    return c.json({ success: true, message: '审核规则已禁用' });
  } catch (error) {
    logger.error('禁用审核规则失败', { error });
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

/**
 * 启动定时审核
 * @route POST /api/audit-workflow/scheduled-audits/start
 * @access 私有
 */
app.post('/scheduled-audits/start', async (c) => {
  try {
    auditWorkflowService.startScheduledAudits();
    return c.json({ success: true, message: '定时审核已启动' });
  } catch (error) {
    logger.error('启动定时审核失败', { error });
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

/**
 * 停止定时审核
 * @route POST /api/audit-workflow/scheduled-audits/stop
 * @access 私有
 */
app.post('/scheduled-audits/stop', async (c) => {
  try {
    auditWorkflowService.stopScheduledAudits();
    return c.json({ success: true, message: '定时审核已停止' });
  } catch (error) {
    logger.error('停止定时审核失败', { error });
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

/**
 * 获取审核配置
 * @route GET /api/audit-workflow/config
 * @access 私有
 */
app.get('/config', async (c) => {
  try {
    const config = auditWorkflowService.getConfig();
    return c.json({ success: true, data: config });
  } catch (error) {
    logger.error('获取审核配置失败', { error });
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

/**
 * 更新审核配置
 * @route PUT /api/audit-workflow/config
 * @access 私有
 */
app.put('/config', zValidator('json', z.object({
  autoAuditEnabled: z.boolean().optional(),
  auditInterval: z.number().min(1).optional(),
  auditTimeout: z.number().min(1).optional(),
  maxConcurrentAudits: z.number().min(1).optional(),
  notifications: z.object({
    onAuditFailure: z.boolean().optional(),
    onAuditSuccess: z.boolean().optional(),
    emailRecipients: z.array(z.string().email()).optional(),
  }).optional(),
})), async (c) => {
  try {
    const config = c.req.valid('json');
    auditWorkflowService.updateConfig(config as Partial<AuditConfig>);
    const updatedConfig = auditWorkflowService.getConfig();
    return c.json({ success: true, data: updatedConfig });
  } catch (error) {
    logger.error('更新审核配置失败', { error });
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

/**
 * 获取审核统计信息
 * @route GET /api/audit-workflow/stats
 * @access 私有
 */
app.get('/stats', async (c) => {
  try {
    const stats = auditWorkflowService.getAuditStats();
    return c.json({ success: true, data: stats });
  } catch (error) {
    logger.error('获取审核统计信息失败', { error });
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

/**
 * 导出审核报告
 * @route GET /api/audit-workflow/reports/:reportId/export
 * @access 私有
 */
app.get('/reports/:reportId/export', async (c) => {
  try {
    const reportId = c.req.param('reportId');
    const report = auditWorkflowService.getReport(reportId);
    
    if (!report) {
      return c.json({ success: false, error: '审核报告不存在' }, 404);
    }
    
    // 返回JSON格式的报告
    return c.json({
      success: true,
      data: {
        report,
        exportTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('导出审核报告失败', { error });
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

/**
 * 批量导出文档审核报告
 * @route POST /api/audit-workflow/reports/export-batch
 * @access 私有
 */
app.post('/reports/export-batch', zValidator('json', z.object({
  documentIds: z.array(z.string().min(1)).min(1),
})), async (c) => {
  try {
    const { documentIds } = c.req.valid('json');
    const reports: any[] = [];
    
    for (const documentId of documentIds) {
      const documentReports = auditWorkflowService.getDocumentReports(documentId);
      reports.push(...documentReports);
    }
    
    return c.json({
      success: true,
      data: {
        reports,
        exportTime: new Date().toISOString(),
        totalReports: reports.length,
      },
    });
  } catch (error) {
    logger.error('批量导出审核报告失败', { error });
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

/**
 * 获取审核仪表板数据
 * @route GET /api/audit-workflow/dashboard
 * @access 私有
 */
app.get('/dashboard', async (c) => {
  try {
    const stats = auditWorkflowService.getAuditStats();
    const pendingTasks = auditWorkflowService.getPendingTasks().slice(0, 10);
    const rules = auditWorkflowService.getRules();
    
    return c.json({
      success: true,
      data: {
        stats,
        pendingTasks,
        rules: {
          total: rules.length,
          enabled: rules.filter(r => r.enabled).length,
          disabled: rules.filter(r => !r.enabled).length,
        },
      },
    });
  } catch (error) {
    logger.error('获取审核仪表板数据失败', { error });
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

export default app;
