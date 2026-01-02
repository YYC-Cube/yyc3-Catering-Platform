/**
 * @file API路由定义
 * @description 定义智能运维服务的RESTful API路由
 * @author YYC³团队
 * @version 1.0.0
 */

import express from 'express';
import { ResourcePredictionService } from '../services/resource-prediction';
import { FaultRecoveryService } from '../services/fault-recovery';
import { PerformanceOptimizationService } from '../services/performance-optimization';
import { BackupRecoveryService } from '../services/backup-recovery';

/**
 * 创建API路由
 */
export function createApiRoutes(
  resourcePredictionService: ResourcePredictionService,
  faultRecoveryService: FaultRecoveryService,
  performanceOptimizationService: PerformanceOptimizationService,
  backupRecoveryService: BackupRecoveryService
): express.Router {
  const router = express.Router();

  // ======================================== 
  // 资源预测相关API
  // ======================================== 
  router.get('/resource-prediction', async (req, res) => {
    try {
      const serviceId = req.query.serviceId as string;
      const timeRange = req.query.timeRange as string;
      
      const predictions = await resourcePredictionService.getResourcePredictions(
        serviceId,
        timeRange ? parseInt(timeRange) : undefined
      );
      
      res.json(predictions);
    } catch (error) {
      res.status(500).json({ error: '获取资源预测失败', details: error.message });
    }
  });

  router.get('/resource-prediction/forecast', async (req, res) => {
    try {
      const serviceId = req.query.serviceId as string;
      
      const forecast = await resourcePredictionService.generateResourceForecast(serviceId);
      
      res.json(forecast);
    } catch (error) {
      res.status(500).json({ error: '生成资源预测失败', details: error.message });
    }
  });

  router.post('/resource-prediction', async (req, res) => {
    try {
      const serviceId = req.body.serviceId;
      const resourceType = req.body.resourceType;
      
      const prediction = await resourcePredictionService.predictResourceUsage(serviceId, resourceType);
      
      res.json(prediction);
    } catch (error) {
      res.status(500).json({ error: '创建资源预测失败', details: error.message });
    }
  });

  // ======================================== 
  // 故障恢复相关API
  // ======================================== 
  router.get('/fault-recovery/services', async (req, res) => {
    try {
      const healthStatus = await faultRecoveryService.getServicesHealthStatus();
      
      res.json(healthStatus);
    } catch (error) {
      res.status(500).json({ error: '获取服务健康状态失败', details: error.message });
    }
  });

  router.get('/fault-recovery/records', async (req, res) => {
    try {
      const serviceId = req.query.serviceId as string;
      
      const records = await faultRecoveryService.getFaultRecords(serviceId);
      
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: '获取故障记录失败', details: error.message });
    }
  });

  router.post('/fault-recovery/recover', async (req, res) => {
    try {
      const serviceId = req.body.serviceId;
      
      const result = await faultRecoveryService.recoverService(serviceId);
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: '恢复服务失败', details: error.message });
    }
  });

  router.post('/fault-recovery/check', async (req, res) => {
    try {
      const serviceId = req.body.serviceId;
      
      const healthStatus = await faultRecoveryService.checkServiceHealth(serviceId);
      
      res.json(healthStatus);
    } catch (error) {
      res.status(500).json({ error: '检查服务健康状态失败', details: error.message });
    }
  });

  // ======================================== 
  // 性能优化相关API
  // ======================================== 
  router.get('/performance/metrics', async (req, res) => {
    try {
      const serviceId = req.query.serviceId as string;
      const timeRange = req.query.timeRange as string;
      
      const metrics = await performanceOptimizationService.getPerformanceMetrics(
        serviceId,
        timeRange ? parseInt(timeRange) : undefined
      );
      
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: '获取性能指标失败', details: error.message });
    }
  });

  router.get('/performance/suggestions', async (req, res) => {
    try {
      const serviceId = req.query.serviceId as string;
      
      const suggestions = await performanceOptimizationService.getOptimizationSuggestions(serviceId);
      
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ error: '获取优化建议失败', details: error.message });
    }
  });

  router.post('/performance/analyze', async (req, res) => {
    try {
      const serviceId = req.body.serviceId;
      
      const analysis = await performanceOptimizationService.analyzePerformance(serviceId);
      
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: '分析性能失败', details: error.message });
    }
  });

  // ======================================== 
  // 备份恢复相关API
  // ======================================== 
  router.get('/backup', async (req, res) => {
    try {
      const backupType = req.query.type as 'full' | 'incremental' | 'differential';
      
      const backups = await backupRecoveryService.listBackups(backupType);
      
      res.json(backups);
    } catch (error) {
      res.status(500).json({ error: '获取备份列表失败', details: error.message });
    }
  });

  router.post('/backup', async (req, res) => {
    try {
      const backupType = req.body.type as 'full' | 'incremental' | 'differential';
      const description = req.body.description;
      
      const backup = await backupRecoveryService.createBackup(backupType, description);
      
      res.json(backup);
    } catch (error) {
      res.status(500).json({ error: '创建备份失败', details: error.message });
    }
  });

  router.post('/backup/:id/recover', async (req, res) => {
    try {
      const backupId = req.params.id;
      
      const result = await backupRecoveryService.recoverFromBackup(backupId);
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: '恢复备份失败', details: error.message });
    }
  });

  router.delete('/backup/:id', async (req, res) => {
    try {
      const backupId = req.params.id;
      
      await backupRecoveryService.deleteBackup(backupId);
      
      res.json({ message: '备份删除成功' });
    } catch (error) {
      res.status(500).json({ error: '删除备份失败', details: error.message });
    }
  });

  router.get('/backup/:id/verify', async (req, res) => {
    try {
      const backupId = req.params.id;
      
      const result = await backupRecoveryService.verifyBackup(backupId);
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: '验证备份失败', details: error.message });
    }
  });

  return router;
}
