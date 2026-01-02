/**
 * @file 监控告警模块入口
 * @description 导出监控告警相关的所有功能
 * @module monitoring
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-22
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

// 导出Prometheus指标管理器
export {
  PrometheusMetricsManager,
  PrometheusMetricsManagerFactory,
  prometheusMiddleware,
  PrometheusConfig,
} from './prometheus-metrics';

// 导出告警规则
export {
  alertRules,
  AlertRule,
  AlertRuleGroup,
  generateAlertRulesYaml,
  exportAlertRulesToFile,
  findAlertRule,
  filterAlertRulesBySeverity,
  getAllAlertRules,
} from './alert-rules';

/**
 * 快速初始化监控
 */
export const initMonitoring = (config?: {
  prometheus?: {
    defaultLabels?: Record<string, string>;
    prefix?: string;
    port?: number;
  };
}) => {
  const metricsManager = PrometheusMetricsManagerFactory.getInstance(
    config?.prometheus
  );

  return {
    metricsManager,
  };
};

/**
 * 快速记录HTTP请求
 */
export const recordHttpRequest = (
  method: string,
  path: string,
  statusCode: number,
  duration: number
) => {
  const metricsManager = PrometheusMetricsManagerFactory.getInstance();
  metricsManager.recordHttpRequest(method, path, statusCode, duration);
};

/**
 * 快速记录数据库查询
 */
export const recordDatabaseQuery = (
  operation: string,
  table: string,
  duration: number,
  status: 'success' | 'error'
) => {
  const metricsManager = PrometheusMetricsManagerFactory.getInstance();
  metricsManager.recordDatabaseQuery(operation, table, duration, status);
};

/**
 * 快速记录订单
 */
export const recordOrder = (
  status: string,
  paymentMethod: string,
  amount: number
) => {
  const metricsManager = PrometheusMetricsManagerFactory.getInstance();
  metricsManager.recordOrder(status, paymentMethod, amount);
};

/**
 * 快速记录用户操作
 */
export const recordUserAction = (action: 'register' | 'login' | 'logout') => {
  const metricsManager = PrometheusMetricsManagerFactory.getInstance();
  metricsManager.recordUserAction(action);
};
