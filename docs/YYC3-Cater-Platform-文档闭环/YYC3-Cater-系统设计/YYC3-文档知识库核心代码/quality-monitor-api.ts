/**
 * @file 质量监控API路由
 * @description 提供文档质量监控相关的API接口
 * @module api/quality-monitor-api
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { QualityMonitorService, QualityAlert, QualityTrend, MonitoringConfig } from './quality-monitor-service';
import { Logger } from './logger';

const app = new Hono();
const qualityMonitorService = new QualityMonitorService();
const logger = new Logger('QualityMonitorAPI');

// 监控配置验证模式
const monitoringConfigSchema = z.object({
  checkInterval: z.number().min(1).max(1440).optional(),
  qualityThreshold: z.number().min(0).max(100).optional(),
  degradationThreshold: z.number().min(0).max(100).optional(),
  outlierThreshold: z.number().min(0).max(100).optional(),
  stagnationDays: z.number().min(1).max(365).optional(),
});

/**
 * 启动质量监控
 * @route POST /api/quality-monitor/start
 * @access 需要管理员权限
 * @returns {Promise<Response>} 操作结果
 */
app.post('/start', async (c) => {
  try {
    logger.info('Start quality monitoring requested');

    await qualityMonitorService.startMonitoring();

    return c.json({
      success: true,
      message: '质量监控已启动',
    });
  } catch (error) {
    logger.error('Start quality monitoring failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '启动质量监控失败',
    }, 500);
  }
});

/**
 * 停止质量监控
 * @route POST /api/quality-monitor/stop
 * @access 需要管理员权限
 * @returns {Promise<Response>} 操作结果
 */
app.post('/stop', async (c) => {
  try {
    logger.info('Stop quality monitoring requested');

    qualityMonitorService.stopMonitoring();

    return c.json({
      success: true,
      message: '质量监控已停止',
    });
  } catch (error) {
    logger.error('Stop quality monitoring failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '停止质量监控失败',
    }, 500);
  }
});

/**
 * 获取监控配置
 * @route GET /api/quality-monitor/config
 * @access 需要管理员权限
 * @returns {Promise<Response>} 监控配置
 */
app.get('/config', async (c) => {
  try {
    logger.info('Get monitoring config requested');

    const config = qualityMonitorService.getConfig();

    return c.json({
      success: true,
      data: config,
    });
  } catch (error) {
    logger.error('Get monitoring config failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取监控配置失败',
    }, 500);
  }
});

/**
 * 更新监控配置
 * @route PUT /api/quality-monitor/config
 * @access 需要管理员权限
 * @returns {Promise<Response>} 操作结果
 */
app.put('/config', zValidator('json', monitoringConfigSchema), async (c) => {
  try {
    const config = c.req.valid('json');
    logger.info('Update monitoring config requested', { config });

    await qualityMonitorService.updateConfig(config);

    return c.json({
      success: true,
      message: '监控配置已更新',
      data: config,
    });
  } catch (error) {
    logger.error('Update monitoring config failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '更新监控配置失败',
    }, 500);
  }
});

/**
 * 获取质量警报列表
 * @route GET /api/quality-monitor/alerts
 * @access 需要管理员权限
 * @returns {Promise<Response>} 质量警报列表
 */
app.get('/alerts', async (c) => {
  try {
    const acknowledged = c.req.query('acknowledged') === 'true';
    const severity = c.req.query('severity') as QualityAlert['severity'] | undefined;
    const type = c.req.query('type') as QualityAlert['type'] | undefined;
    const limit = parseInt(c.req.query('limit') || '50');

    logger.info('Get quality alerts requested', { acknowledged, severity, type, limit });

    const alerts = await qualityMonitorService.getAlerts({
      acknowledged,
      severity,
      type,
      limit,
    });

    return c.json({
      success: true,
      data: {
        alerts,
        total: alerts.length,
      },
    });
  } catch (error) {
    logger.error('Get quality alerts failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取质量警报失败',
    }, 500);
  }
});

/**
 * 确认警报
 * @route PUT /api/quality-monitor/alerts/:alertId/acknowledge
 * @access 需要管理员权限
 * @returns {Promise<Response>} 操作结果
 */
app.put('/alerts/:alertId/acknowledge', async (c) => {
  try {
    const alertId = c.req.param('alertId');
    logger.info('Acknowledge alert requested', { alertId });

    await qualityMonitorService.acknowledgeAlert(alertId);

    return c.json({
      success: true,
      message: '警报已确认',
    });
  } catch (error) {
    logger.error('Acknowledge alert failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '确认警报失败',
    }, 500);
  }
});

/**
 * 批量确认警报
 * @route PUT /api/quality-monitor/alerts/bulk-acknowledge
 * @access 需要管理员权限
 * @returns {Promise<Response>} 操作结果
 */
app.put('/alerts/bulk-acknowledge', async (c) => {
  try {
    const body = await c.req.json();
    const { alertIds } = body;

    if (!Array.isArray(alertIds) || alertIds.length === 0) {
      return c.json({
        success: false,
        error: '警报ID列表不能为空',
      }, 400);
    }

    logger.info('Bulk acknowledge alerts requested', { alertIds });

    await qualityMonitorService.bulkAcknowledgeAlerts(alertIds);

    return c.json({
      success: true,
      message: `已确认 ${alertIds.length} 个警报`,
    });
  } catch (error) {
    logger.error('Bulk acknowledge alerts failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '批量确认警报失败',
    }, 500);
  }
});

/**
 * 获取质量趋势
 * @route GET /api/quality-monitor/trends
 * @access 需要管理员权限
 * @returns {Promise<Response>} 质量趋势
 */
app.get('/trends', async (c) => {
  try {
    const days = parseInt(c.req.query('days') || '30');
    const category = c.req.query('category');

    logger.info('Get quality trends requested', { days, category });

    const trends = await qualityMonitorService.getQualityTrends(days, category);

    return c.json({
      success: true,
      data: {
        trends,
        period: `${days} days`,
      },
    });
  } catch (error) {
    logger.error('Get quality trends failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取质量趋势失败',
    }, 500);
  }
});

/**
 * 获取质量统计信息
 * @route GET /api/quality-monitor/statistics
 * @access 需要管理员权限
 * @returns {Promise<Response>} 质量统计
 */
app.get('/statistics', async (c) => {
  try {
    logger.info('Get quality statistics requested');

    const statistics = await qualityMonitorService.getStatistics();

    return c.json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    logger.error('Get quality statistics failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取质量统计失败',
    }, 500);
  }
});

/**
 * 手动触发质量检查
 * @route POST /api/quality-monitor/check
 * @access 需要管理员权限
 * @returns {Promise<Response>} 操作结果
 */
app.post('/check', async (c) => {
  try {
    const body = await c.req.json();
    const { documentId } = body;

    logger.info('Manual quality check requested', { documentId });

    if (documentId) {
      // 检查单个文档
      const report = await qualityMonitorService.assessDocument(documentId);
      return c.json({
        success: true,
        data: report,
      });
    } else {
      // 检查所有文档 - 生成质量报告
      const report = await qualityMonitorService.generateQualityReport();
      return c.json({
        success: true,
        data: report,
        message: '质量检查已完成',
      });
    }
  } catch (error) {
    logger.error('Manual quality check failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '执行质量检查失败',
    }, 500);
  }
});

/**
 * 获取文档质量报告
 * @route GET /api/quality-monitor/reports/:documentId
 * @access 需要管理员权限
 * @returns {Promise<Response>} 质量报告
 */
app.get('/reports/:documentId', async (c) => {
  try {
    const documentId = c.req.param('documentId');
    const limit = parseInt(c.req.query('limit') || '10');

    logger.info('Get document quality reports requested', { documentId, limit });

    const reports = await qualityMonitorService.getDocumentReports(documentId, limit);

    return c.json({
      success: true,
      data: {
        reports,
        total: reports.length,
      },
    });
  } catch (error) {
    logger.error('Get document quality reports failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取质量报告失败',
    }, 500);
  }
});

/**
 * 获取监控状态
 * @route GET /api/quality-monitor/status
 * @access 需要管理员权限
 * @returns {Promise<Response>} 监控状态
 */
app.get('/status', async (c) => {
  try {
    logger.info('Get monitoring status requested');

    const status = qualityMonitorService.getStatus();

    return c.json({
      success: true,
      data: status,
    });
  } catch (error) {
    logger.error('Get monitoring status failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '获取监控状态失败',
    }, 500);
  }
});

/**
 * 导出质量报告
 * @route GET /api/quality-monitor/export
 * @access 需要管理员权限
 * @returns {Promise<Response>} 导出文件
 */
app.get('/export', async (c) => {
  try {
    const format = c.req.query('format') || 'json';
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');

    logger.info('Export quality report requested', { format, startDate, endDate });

    const exportData = await qualityMonitorService.exportQualityReport({
      format: format as 'json' | 'csv' | 'excel',
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    if (format === 'json') {
      return c.json({
        success: true,
        data: exportData,
      });
    } else {
      return c.text(exportData, 200, {
        'Content-Type': format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="quality-report-${Date.now()}.${format}"`,
      });
    }
  } catch (error) {
    logger.error('Export quality report failed', { error });
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '导出质量报告失败',
    }, 500);
  }
});

export default app;
