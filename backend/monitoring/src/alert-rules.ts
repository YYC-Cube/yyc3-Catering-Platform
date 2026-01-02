/**
 * @file 告警规则配置
 * @description 定义Prometheus告警规则
 * @module monitoring
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-22
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

/**
 * 告警规则
 */
export interface AlertRule {
  /** 告警名称 */
  name: string;
  /** 告警表达式 */
  expr: string;
  /** 持续时间 */
  for: string;
  /** 告警级别 */
  severity: 'critical' | 'warning' | 'info';
  /** 告警描述 */
  summary: string;
  /** 告警详情 */
  description: string;
  /** 标签 */
  labels?: Record<string, string>;
  /** 注解 */
  annotations?: Record<string, string>;
}

/**
 * 告警规则组
 */
export interface AlertRuleGroup {
  /** 规则组名称 */
  name: string;
  /** 规则列表 */
  rules: AlertRule[];
  /** 间隔 */
  interval?: string;
}

/**
 * 告警规则配置
 */
export const alertRules: AlertRuleGroup[] = [
  {
    name: 'api_alerts',
    interval: '30s',
    rules: [
      {
        name: 'HighErrorRate',
        expr: 'rate(yyc3_catering_http_requests_total{status_code=~"5.."}[5m]) > 0.05',
        for: '5m',
        severity: 'critical',
        summary: 'API错误率过高',
        description: 'API在过去5分钟内错误率超过5%',
        labels: {
          team: 'backend',
        },
      },
      {
        name: 'HighLatency',
        expr: 'histogram_quantile(0.95, rate(yyc3_catering_http_request_duration_seconds_bucket[5m])) > 1',
        for: '5m',
        severity: 'warning',
        summary: 'API延迟过高',
        description: 'API 95分位延迟超过1秒',
        labels: {
          team: 'backend',
        },
      },
      {
        name: 'LowRequestRate',
        expr: 'rate(yyc3_catering_http_requests_total[5m]) < 0.1',
        for: '10m',
        severity: 'warning',
        summary: 'API请求率过低',
        description: 'API在过去10分钟内请求率过低',
        labels: {
          team: 'backend',
        },
      },
    ],
  },
  {
    name: 'database_alerts',
    interval: '30s',
    rules: [
      {
        name: 'DatabaseConnectionPoolExhausted',
        expr: 'yyc3_catering_database_active_connections / (yyc3_catering_database_active_connections + yyc3_catering_database_idle_connections) > 0.9',
        for: '5m',
        severity: 'critical',
        summary: '数据库连接池耗尽',
        description: '数据库连接池使用率超过90%',
        labels: {
          team: 'database',
        },
      },
      {
        name: 'DatabaseQuerySlow',
        expr: 'histogram_quantile(0.95, rate(yyc3_catering_database_query_duration_seconds_bucket[5m])) > 0.5',
        for: '5m',
        severity: 'warning',
        summary: '数据库查询缓慢',
        description: '数据库查询95分位延迟超过500ms',
        labels: {
          team: 'database',
        },
      },
      {
        name: 'DatabaseErrorRate',
        expr: 'rate(yyc3_catering_database_queries_total{status="error"}[5m]) > 0.01',
        for: '5m',
        severity: 'critical',
        summary: '数据库错误率过高',
        description: '数据库查询错误率超过1%',
        labels: {
          team: 'database',
        },
      },
    ],
  },
  {
    name: 'system_alerts',
    interval: '30s',
    rules: [
      {
        name: 'HighCPUUsage',
        expr: 'process_cpu_seconds_total > 0.8',
        for: '5m',
        severity: 'warning',
        summary: 'CPU使用率过高',
        description: '进程CPU使用率超过80%',
        labels: {
          team: 'ops',
        },
      },
      {
        name: 'HighMemoryUsage',
        expr: 'process_resident_memory_bytes / node_memory_MemTotal_bytes > 0.8',
        for: '5m',
        severity: 'critical',
        summary: '内存使用率过高',
        description: '进程内存使用率超过80%',
        labels: {
          team: 'ops',
        },
      },
      {
        name: 'DiskSpaceLow',
        expr: '(node_filesystem_avail_bytes / node_filesystem_size_bytes) < 0.1',
        for: '10m',
        severity: 'critical',
        summary: '磁盘空间不足',
        description: '磁盘可用空间低于10%',
        labels: {
          team: 'ops',
        },
      },
    ],
  },
  {
    name: 'business_alerts',
    interval: '1m',
    rules: [
      {
        name: 'OrderRateLow',
        expr: 'rate(yyc3_catering_orders_total[10m]) < 0.5',
        for: '15m',
        severity: 'warning',
        summary: '订单率过低',
        description: '订单创建率在过去15分钟内过低',
        labels: {
          team: 'business',
        },
      },
      {
        name: 'OrderErrorRate',
        expr: 'rate(yyc3_catering_orders_total{status="failed"}[10m]) / rate(yyc3_catering_orders_total[10m]) > 0.1',
        for: '5m',
        severity: 'critical',
        summary: '订单失败率过高',
        description: '订单失败率超过10%',
        labels: {
          team: 'business',
        },
      },
      {
        name: 'ActiveSessionsDrop',
        expr: 'yyc3_catering_active_sessions < 10',
        for: '10m',
        severity: 'info',
        summary: '活跃会话数下降',
        description: '活跃用户会话数低于10',
        labels: {
          team: 'business',
        },
      },
    ],
  },
];

/**
 * 生成Prometheus告警规则文件内容
 */
export function generateAlertRulesYaml(): string {
  let yaml = 'groups:\n';

  for (const group of alertRules) {
    yaml += `  - name: ${group.name}\n`;
    if (group.interval) {
      yaml += `    interval: ${group.interval}\n`;
    }
    yaml += '    rules:\n';

    for (const rule of group.rules) {
      yaml += `      - alert: ${rule.name}\n`;
      yaml += `        expr: ${rule.expr}\n`;
      yaml += `        for: ${rule.for}\n`;
      yaml += `        labels:\n`;
      yaml += `          severity: ${rule.severity}\n`;
      
      if (rule.labels) {
        for (const [key, value] of Object.entries(rule.labels)) {
          yaml += `          ${key}: ${value}\n`;
        }
      }

      yaml += `        annotations:\n`;
      yaml += `          summary: "${rule.summary}"\n`;
      yaml += `          description: "${rule.description}"\n`;

      if (rule.annotations) {
        for (const [key, value] of Object.entries(rule.annotations)) {
          yaml += `          ${key}: "${value}"\n`;
        }
      }
    }
  }

  return yaml;
}

/**
 * 导出告警规则到文件
 */
export async function exportAlertRulesToFile(filePath: string): Promise<void> {
  const fs = await import('fs/promises');
  const yaml = generateAlertRulesYaml();
  await fs.writeFile(filePath, yaml, 'utf-8');
}

/**
 * 根据名称查找告警规则
 */
export function findAlertRule(name: string): AlertRule | undefined {
  for (const group of alertRules) {
    const rule = group.rules.find((r) => r.name === name);
    if (rule) {
      return rule;
    }
  }
  return undefined;
}

/**
 * 根据严重级别筛选告警规则
 */
export function filterAlertRulesBySeverity(severity: string): AlertRule[] {
  const rules: AlertRule[] = [];
  for (const group of alertRules) {
    for (const rule of group.rules) {
      if (rule.severity === severity) {
        rules.push(rule);
      }
    }
  }
  return rules;
}

/**
 * 获取所有告警规则
 */
export function getAllAlertRules(): AlertRule[] {
  const rules: AlertRule[] = [];
  for (const group of alertRules) {
    rules.push(...group.rules);
  }
  return rules;
}
