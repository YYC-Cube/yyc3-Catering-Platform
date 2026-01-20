# Helm Charts 验证与部署指南

## 概述

本指南提供 YYC³ 餐饮平台 Helm Charts 的验证和部署说明。

## 目录结构

```
infra/phase1/iac/helm/
├── charts/
│   ├── yyc3-catering-platform/    # 主 Chart
│   │   ├── Chart.yaml
│   │   ├── values.yaml           # 生产环境配置
│   │   └── values-test.yaml      # 测试环境配置
│   ├── api-gateway/              # API 网关
│   ├── business-gateway/         # 业务网关
│   ├── user-service/             # 用户服务
│   ├── order-service/            # 订单服务
│   ├── menu-service/             # 菜单服务
│   └── payment-service/          # 支付服务
├── validate-charts.sh            # 验证脚本
└── deploy-test.sh                # 测试环境部署脚本
```

## 前置要求

- Helm 3.x
- kubectl
- Kubernetes 集群访问权限

## 快速开始

### 1. 安装 Helm

```bash
# macOS
brew install helm

# Linux
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

### 2. 验证 Charts

```bash
cd infra/phase1/iac/helm
./validate-charts.sh
```

### 3. 部署到测试环境

```bash
cd infra/phase1/iac/helm
./deploy-test.sh
```

## 配置说明

### 测试环境配置 (values-test.yaml)

测试环境配置特点：
- 单副本部署
- 禁用自动扩缩容
- 降低资源限制
- 使用测试域名 (test.yyc3.com)
- 仅部署核心服务

### 生产环境配置 (values.yaml)

生产环境配置特点：
- 多副本部署
- 启用自动扩缩容
- 高资源限制
- 使用生产域名 (yyc3.com)
- 部署所有服务

## 服务列表

### 已实现服务

| 服务 | 说明 | 端口 |
|------|------|------|
| api-gateway | API 网关 | 8080 |
| business-gateway | 业务网关 | 8080 |
| user-service | 用户服务 | 8080 |
| order-service | 订单服务 | 8080 |
| menu-service | 菜单服务 | 8080 |
| payment-service | 支付服务 | 8080 |

### 待实现服务

以下服务在 Chart.yaml 中已定义但尚未实现：
- delivery-service (配送服务)
- notification-service (通知服务)
- analytics-service (分析服务)
- smart-kitchen (智能厨房)
- smart-ops-service (智能运营)
- ai-assistant (AI 助手)
- food-safety (食品安全)
- o2o-system (O2O 系统)
- chain-operation (连锁运营)
- redis-cache (Redis 缓存)

## 常用命令

### Helm 操作

```bash
# 查看状态
helm status yyc3-test -n test

# 升级 Release
helm upgrade yyc3-test ./charts/yyc3-catering-platform -f ./charts/yyc3-catering-platform/values-test.yaml -n test

# 卸载 Release
helm uninstall yyc3-test -n test

# 查看历史版本
helm history yyc3-test -n test
```

### Kubernetes 操作

```bash
# 查看 Pod
kubectl get pods -n test -l app.kubernetes.io/instance=yyc3-test

# 查看 Service
kubectl get svc -n test -l app.kubernetes.io/instance=yyc3-test

# 查看日志
kubectl logs -n test -l app.kubernetes.io/instance=yyc3-test --tail=100

# 进入 Pod
kubectl exec -it <pod-name> -n test -- /bin/bash

# 端口转发
kubectl port-forward svc/api-gateway 8080:8080 -n test
```

## 故障排查

### 1. Chart 验证失败

```bash
# 详细错误信息
helm lint ./charts/yyc3-catering-platform --debug

# 检查子 Chart
helm lint ./charts/api-gateway
helm lint ./charts/user-service
```

### 2. 模板渲染失败

```bash
# 渲染模板并输出到文件
helm template yyc3-test ./charts/yyc3-catering-platform -f ./charts/yyc3-catering-platform/values-test.yaml --debug > /tmp/render.yaml

# 检查生成的 YAML
cat /tmp/render.yaml
```

### 3. 部署失败

```bash
# 查看 Pod 状态
kubectl get pods -n test

# 查看 Pod 详情
kubectl describe pod <pod-name> -n test

# 查看 Pod 日志
kubectl logs <pod-name> -n test
```

### 4. 服务无法访问

```bash
# 检查 Service
kubectl get svc -n test

# 检查 Ingress
kubectl get ingress -n test

# 检查 DNS 解析
nslookup api.test.yyc3.com
```

## 环境变量

部署脚本支持以下环境变量：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| RELEASE_NAME | Release 名称 | yyc3-test |
| NAMESPACE | 命名空间 | test |
| VALUES_FILE | Values 文件路径 | ./charts/yyc3-catering-platform/values-test.yaml |

示例：

```bash
# 使用自定义 Release 名称
RELEASE_NAME=yyc3-staging ./deploy-test.sh

# 部署到 staging 命名空间
NAMESPACE=staging ./deploy-test.sh

# 使用自定义 values 文件
VALUES_FILE=./custom-values.yaml ./deploy-test.sh
```

## 最佳实践

1. **部署前验证**: 始终先运行 `validate-charts.sh` 验证 Charts
2. **使用命名空间**: 为不同环境使用不同的命名空间
3. **资源限制**: 根据实际负载调整资源限制
4. **监控告警**: 配置 Prometheus 和 Grafana 监控
5. **日志收集**: 配置 ELK 或 Loki 收集日志
6. **备份恢复**: 定期备份 etcd 和应用数据

## 下一步

- 配置 CI/CD 流水线自动部署
- 配置监控和告警系统
- 配置日志收集和分析
- 配置自动化测试
- 配置灾难恢复方案

## 联系方式

如有问题，请联系 YYC³ 基础设施团队：
- Email: infra@yyc3.com
- Slack: #infra-team
