# YYC³餐饮平台 - 基础设施即代码（IaC）目录

本目录包含YYC³餐饮平台第一阶段（多云基础设施搭建）的基础设施即代码（IaC）配置。

---

## 目录结构

```
iac/
├── terraform/              # Terraform配置
│   ├── aws/               # AWS基础设施
│   │   ├── main.tf        # 主配置文件
│   │   ├── variables.tf   # 变量定义
│   │   ├── outputs.tf     # 输出定义
│   │   ├── vpc.tf         # VPC配置
│   │   ├── vpn.tf         # VPN配置
│   │   ├── eks.tf         # EKS配置
│   │   └── s3.tf          # S3配置
│   ├── aliyun/            # 阿里云基础设施
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── vpc.tf
│   │   ├── vpn.tf
│   │   ├── ack.tf
│   │   └── oss.tf
│   └── tencent/           # 腾讯云基础设施
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       ├── vpc.tf
│       ├── tke.tf
│       └── cos.tf
├── kubernetes/            # Kubernetes配置
│   ├── eks/               # AWS EKS配置
│   │   ├── namespace.yaml
│   │   ├── cilium.yaml
│   │   ├── ingress-controller.yaml
│   │   └── cert-manager.yaml
│   ├── ack/               # 阿里云ACK配置
│   │   ├── namespace.yaml
│   │   ├── cilium.yaml
│   │   ├── ingress-controller.yaml
│   │   └── cert-manager.yaml
│   └── tke/               # 腾讯云TKE配置
│       ├── namespace.yaml
│       ├── cilium.yaml
│       ├── ingress-controller.yaml
│       └── cert-manager.yaml
└── helm/                  # Helm Charts
    ├── charts/            # 服务Charts
    │   ├── yyc3-catering-platform/  # Parent Chart
    │   ├── api-gateway/
    │   ├── user-service/
    │   ├── order-service/
    │   └── ...
    └── values/             # 多环境配置
        ├── values-dev.yaml
        ├── values-staging.yaml
        └── values-prod.yaml
```

---

## 使用说明

### Terraform部署

#### AWS

```bash
cd terraform/aws

# 初始化Terraform
terraform init

# 规划变更
terraform plan

# 应用变更
terraform apply

# 查看输出
terraform output

# 销毁资源
terraform destroy
```

#### 阿里云

```bash
cd terraform/aliyun

# 初始化Terraform
terraform init

# 规划变更
terraform plan

# 应用变更
terraform apply

# 查看输出
terraform output

# 销毁资源
terraform destroy
```

#### 腾讯云

```bash
cd terraform/tencent

# 初始化Terraform
terraform init

# 规划变更
terraform plan

# 应用变更
terraform apply

# 查看输出
terraform output

# 销毁资源
terraform destroy
```

---

### Kubernetes部署

#### AWS EKS

```bash
# 配置kubectl
aws eks update-kubeconfig --region us-east-1 --name yyc3-production

# 部署命名空间
kubectl apply -f kubernetes/eks/namespace.yaml

# 部署Cilium
kubectl apply -f kubernetes/eks/cilium.yaml

# 部署Ingress Controller
kubectl apply -f kubernetes/eks/ingress-controller.yaml

# 部署Cert Manager
kubectl apply -f kubernetes/eks/cert-manager.yaml
```

#### 阿里云ACK

```bash
# 配置kubectl
aliyun cs GET /k8s/<cluster-id>/user_config | kubectl config use-context <cluster-id>

# 部署命名空间
kubectl apply -f kubernetes/ack/namespace.yaml

# 部署Cilium
kubectl apply -f kubernetes/ack/cilium.yaml

# 部署Ingress Controller
kubectl apply -f kubernetes/ack/ingress-controller.yaml

# 部署Cert Manager
kubectl apply -f kubernetes/ack/cert-manager.yaml
```

#### 腾讯云TKE

```bash
# 配置kubectl
tke config --cluster-id <cluster-id>

# 部署命名空间
kubectl apply -f kubernetes/tke/namespace.yaml

# 部署Cilium
kubectl apply -f kubernetes/tke/cilium.yaml

# 部署Ingress Controller
kubectl apply -f kubernetes/tke/ingress-controller.yaml

# 部署Cert Manager
kubectl apply -f kubernetes/tke/cert-manager.yaml
```

---

### Helm部署

#### Parent Chart

```bash
cd helm/charts/yyc3-catering-platform

# 添加依赖
helm dependency update

# 部署到开发环境
helm install yyc3-dev . -f ../../values/values-dev.yaml

# 部署到测试环境
helm install yyc3-staging . -f ../../values/values-staging.yaml

# 部署到生产环境
helm install yyc3-prod . -f ../../values/values-prod.yaml

# 升级
helm upgrade yyc3-prod . -f ../../values/values-prod.yaml

# 卸载
helm uninstall yyc3-prod
```

#### 单个服务Chart

```bash
# 部署API Gateway
cd helm/charts/api-gateway
helm install api-gateway . -n production

# 升级API Gateway
helm upgrade api-gateway . -n production

# 卸载API Gateway
helm uninstall api-gateway -n production
```

---

## 配置说明

### Terraform变量

创建 `terraform/aws/terraform.tfvars` 文件：

```hcl
# AWS配置
region = "us-east-1"

# 项目配置
project_name = "yyc3"
environment = "production"

# VPC配置
vpc_cidr = "10.0.0.0/16"
public_subnet_cidr = "10.0.1.0/24"
private_subnet_cidr = "10.0.2.0/24"

# EKS配置
eks_version = "1.28"
eks_cluster_name = "yyc3-production"
node_instance_type = "t3.large"
node_count = 2

# VPN配置
vpn_gateway_ip = "123.45.67.89"
pre_shared_key = "your-secret-key"

# S3配置
s3_bucket_name = "yyc3-static-assets"
s3_bucket_acl = "public-read"
```

### Kubernetes配置

创建 `kubernetes/eks/namespace.yaml` 文件：

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    name: production
```

### Helm配置

创建 `helm/values/values-prod.yaml` 文件：

```yaml
global:
  environment: production
  cloudProvider: aws
  region: us-east-1

apiGateway:
  enabled: true
  replicaCount: 3
  autoScaling:
    enabled: true
    minReplicas: 2
    maxReplicas: 10
```

---

## 最佳实践

### Terraform

1. **使用Remote State**
   ```hcl
   terraform {
     backend "s3" {
       bucket = "yyc3-terraform-state"
       key    = "aws/production/terraform.tfstate"
       region = "us-east-1"
     }
   }
   ```

2. **使用Modules**
   ```hcl
   module "vpc" {
     source = "terraform-aws-modules/vpc/aws"
     version = "3.0.0"

     cidr = "10.0.0.0/16"
     ...
   }
   ```

3. **使用Workspaces**
   ```bash
   terraform workspace new dev
   terraform workspace new staging
   terraform workspace new prod
   ```

### Kubernetes

1. **使用Namespaces**
   ```yaml
   apiVersion: v1
   kind: Namespace
   metadata:
     name: production
   ```

2. **使用Resource Limits**
   ```yaml
   resources:
     limits:
       cpu: 500m
       memory: 512Mi
     requests:
       cpu: 250m
       memory: 256Mi
   ```

3. **使用Health Checks**
   ```yaml
   livenessProbe:
     httpGet:
       path: /health
       port: 3200
     initialDelaySeconds: 30
     periodSeconds: 10
   ```

### Helm

1. **使用Values Files**
   ```bash
   helm install yyc3 . -f values-prod.yaml
   ```

2. **使用Hooks**
   ```yaml
   postInstall:
     - helm: upgrade --reuse-values ...
   preDelete:
     - helm: uninstall ...
   ```

3. **使用Dependencies**
   ```yaml
   dependencies:
     - name: postgresql
       version: 12.x.x
       repository: https://charts.bitnami.com/bitnami
   ```

---

## 故障排查

### Terraform

#### 问题：资源已存在

```bash
# 解决方案：导入资源
terraform import aws_vpc.main vpc-xxxxxxxx
```

#### 问题：状态锁

```bash
# 解决方案：解除锁
terraform force-unlock ./
```

---

### Kubernetes

#### 问题：Pod无法启动

```bash
# 查看Pod状态
kubectl describe pod <pod-name>

# 查看Pod日志
kubectl logs <pod-name>
```

#### 问题：Service无法访问

```bash
# 查看Service状态
kubectl describe svc <service-name>

# 查看Endpoints
kubectl get endpoints <service-name>
```

---

### Helm

#### 问题：Release已存在

```bash
# 解决方案：升级或卸载
helm upgrade <release-name> <chart>
helm uninstall <release-name>
```

#### 问题：Chart依赖问题

```bash
# 解决方案：更新依赖
helm dependency update
```

---

## 参考文档

- [Terraform文档](https://www.terraform.io/docs)
- [Kubernetes文档](https://kubernetes.io/docs)
- [Helm文档](https://helm.sh/docs)
- [AWS文档](https://docs.aws.amazon.com)
- [阿里云文档](https://help.aliyun.com)
- [腾讯云文档](https://cloud.tencent.com/document)

---

**文档版本**: v1.0.0
**最后更新**: 2026-01-03
**维护人**: YYC³ Infrastructure Team
