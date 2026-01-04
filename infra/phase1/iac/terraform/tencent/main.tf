# 腾讯云Terraform配置

## 使用说明

```bash
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

## 主配置文件

```hcl
# main.tf

# 配置腾讯云Provider
provider "tencentcloud" {
  region = var.region
  secret_id  = var.secret_id
  secret_key = var.secret_key

  alias = "primary"
}

# 配置腾讯云Backend（Remote State）
terraform {
  backend "cos" {
    bucket = "${var.project_name}-terraform-state"
    prefix = "tencent/${var.environment}/terraform.tfstate"
    region = "ap-guangzhou"
    key    = "terraform.tfstate"
  }

  required_providers {
    tencentcloud = {
      source  = "tencentcloudstack/tencentcloud"
      version = "~> 1.78.0"
    }
  }

  required_version = ">= 1.6.0"
}

# 创建COS Bucket（Terraform State）
resource "tencentcloud_cos_bucket" "terraform_state" {
  bucket = "${var.project_name}-terraform-state"

  lifecycle {
    prevent_destroy = true
  }

  versioning {
    status = "Enabled"
  }

  # 加密
  server_side_encryption = "AES256"

  # 标签
  tags = {
    Name = "${var.project_name}-terraform-state"
  }
}

# 输出
output "cos_bucket_arn" {
  value       = "qcs::cos:${var.region}:uid/${var.user_id}:${var.project_name}-terraform-state"
  description = "The ARN of COS bucket"
}

# 获取当前账号信息
data "tencentcloud_user_info" "current" {}

# 输出当前账号ID
output "account_id" {
  value       = data.tencentcloud_user_info.current.app_id
  description = "The current TencentCloud Account ID"
}
```

---

## 变量定义文件

```hcl
# variables.tf

# 腾讯云配置
variable "region" {
  description = "TencentCloud Region"
  type        = string
  default     = "ap-guangzhou"
}

variable "secret_id" {
  description = "TencentCloud SecretId"
  type        = string
  sensitive   = true
}

variable "secret_key" {
  description = "TencentCloud SecretKey"
  type        = string
  sensitive   = true
}

variable "user_id" {
  description = "TencentCloud Account ID (AppID)"
  type        = string
  default     = "1234567890"
}

# 项目配置
variable "project_name" {
  description = "Project Name"
  type        = string
  default     = "yyc3"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "production"
}

# VPC配置
variable "vpc_cidr" {
  description = "VPC CIDR Block"
  type        = string
  default     = "192.168.0.0/16"
}

variable "subnet_cidr" {
  description = "Subnet CIDR Block"
  type        = string
  default     = "192.168.1.0/24"
}

# TKE配置
variable "tke_version" {
  description = "TKE Cluster Version"
  type        = string
  default     = "1.28"
}

variable "tke_cluster_name" {
  description = "TKE Cluster Name"
  type        = string
  default     = "yyc3-production"
}

variable "worker_instance_type" {
  description = "CVM Instance Type for TKE Workers"
  type        = string
  default     = "S5.MEDIUM4"
}

variable "worker_count" {
  description = "Number of TKE Workers"
  type        = number
  default     = 2
}

# COS配置
variable "cos_bucket_name" {
  description = "COS Bucket Name for Backup"
  type        = string
  default     = "yyc3-backup"
}
```

---

## 输出定义文件

```hcl
# outputs.tf

# VPC输出
output "vpc_id" {
  value       = tencentcloud_vpc.main.id
  description = "VPC ID"
}

output "subnet_id" {
  value       = tencentcloud_subnet.main.id
  description = "Subnet ID"
}

# TKE输出
output "tke_cluster_id" {
  value       = tencentcloud_kubernetes_cluster.main.id
  description = "TKE Cluster ID"
}

output "tke_cluster_endpoint" {
  value       = tencentcloud_kubernetes_cluster.main.cluster_external_endpoint
  description = "TKE Cluster Endpoint"
}

# COS输出
output "cos_bucket_id" {
  value       = tencentcloud_cos_bucket.backup.id
  description = "COS Bucket ID"
}
```

---

## VPC配置文件

```hcl
# vpc.tf

# 创建VPC
resource "tencentcloud_vpc" "main" {
  name       = "${var.project_name}-${var.environment}-vpc"
  cidr_block = var.vpc_cidr
  is_multicast = false

  tags = {
    Name = "${var.project_name}-${var.environment}-vpc"
  }
}

# 创建Subnet
resource "tencentcloud_subnet" "main" {
  name             = "${var.project_name}-${var.environment}-subnet"
  vpc_id           = tencentcloud_vpc.main.id
  cidr_block       = var.subnet_cidr
  availability_zone = "${var.region}a"

  tags = {
    Name = "${var.project_name}-${var.environment}-subnet"
  }
}

# 创建NAT Gateway
resource "tencentcloud_nat_gateway" "main" {
  vpc_id      = tencentcloud_vpc.main.id
  name        = "${var.project_name}-${var.environment}-nat"
  bandwidth  = 5
  max_concurrent = 1000000

  tags = {
    Name = "${var.project_name}-${var.environment}-nat"
  }
}

# 创建EIP (Elastic IP)
resource "tencentcloud_eip" "nat" {
  name            = "${var.project_name}-${var.environment}-nat-eip"
  internet_charge_type = "TRAFFIC_POSTPAID_BY_HOUR"
  bandwidth       = 5
  type            = "EIP"

  tags = {
    Name = "${var.project_name}-${var.environment}-nat-eip"
  }
}

# 创建路由表
resource "tencentcloud_route_table" "main" {
  vpc_id = tencentcloud_vpc.main.id
  name   = "${var.project_name}-${var.environment}-rt"

  tags = {
    Name = "${var.project_name}-${var.environment}-rt"
  }
}

# 创建路由条目（访问公网）
resource "tencentcloud_route_table_entry" "internet" {
  route_table_id         = tencentcloud_route_table.main.id
  destination_cidr_block = "0.0.0.0/0"
  next_type              = "NAT"
  next_hub               = tencentcloud_nat_gateway.main.id
}

# 关联Subnet到路由表
resource "tencentcloud_route_table_association" "main" {
  vpc_id         = tencentcloud_vpc.main.id
  subnet_id      = tencentcloud_subnet.main.id
  route_table_id = tencentcloud_route_table.main.id
}
```

---

## TKE配置文件

```hcl
# tke.tf

# 创建CAM角色（TKE Worker）
resource "tencentcloud_cam_role" "worker" {
  name        = "${var.project_name}-tke-worker-role"
  description = "CAM Role for TKE Workers"
  document    = jsonencode({
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "cvm.qcloud.com"
        }
      }
    ]
    Version = "1"
  })
}

# 附加TKE Worker策略到CAM角色
resource "tencentcloud_cam_role_policy_attachment" "worker_policy" {
  role_id   = tencentcloud_cam_role.worker.id
  policy_id = "QcloudAccessForCCERole" # TKE完整权限
}

# 创建TKE集群
resource "tencentcloud_kubernetes_cluster" "main" {
  name             = var.tke_cluster_name
  version          = var.tke_version
  cluster_cidr     = "10.3.0.0/16"
  cluster_type     = "MANAGED_CLUSTER" # 托管集群
  max_nodes        = 10
  max_pod_per_node = 256

  # VPC配置
  vpc_id = tencentcloud_vpc.main.id

  # Subnet配置
  subnet_id = tencentcloud_subnet.main.id

  # 节点池配置
  worker_config {
    count           = var.worker_count
    subnet_id       = tencentcloud_subnet.main.id
    retry_policy    = 0
    cpu             = "2" # S5.MEDIUM4 = 2核
    memory          = "4" # S5.MEDIUM4 = 4GB
    instance_type   = var.worker_instance_type

    # CAM角色
    cam_role_name   = tencentcloud_cam_role.worker.name

    # 标签
    labels = {
      node = "worker"
    }
  }

  # 集群配置
  cluster_auth_options {
    authentication_mode = "RBAC"
  }

  # DNS服务器
  cluster_dns_domain = "cluster.local"
  cluster_dns_ip     = "183.60.81.254" # 腾讯云私有DNS

  # 网络插件
  container_runtime = "containerd"

  # 标签
  tags = {
    Name = "${var.project_name}-${var.environment}-tke-cluster"
  }
}
```

---

## COS配置文件

```hcl
# cos.tf

# 创建COS Bucket（备份）
resource "tencentcloud_cos_bucket" "backup" {
  bucket = var.cos_bucket_name
  acl    = "private"

  lifecycle {
    prevent_destroy = true
  }

  versioning {
    status = "Enabled"
  }

  # 生命周期规则
  lifecycle_rule {
    id      = "delete-old-versions"
    enabled = true

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }

  # 标签
  tags = {
    Name = "${var.project_name}-${var.environment}-backup"
  }
}
```

---

## terraform.tfvars示例

```hcl
# terraform.tfvars

# 腾讯云配置
region = "ap-guangzhou"
secret_id = "AKID..." # 替换为你的SecretId
secret_key = "..." # 替换为你的SecretKey
user_id = "1234567890" # 替换为你的AppID

# 项目配置
project_name = "yyc3"
environment = "production"

# VPC配置
vpc_cidr = "192.168.0.0/16"
subnet_cidr = "192.168.1.0/24"

# TKE配置
tke_version = "1.28"
tke_cluster_name = "yyc3-production"
worker_instance_type = "S5.MEDIUM4"
worker_count = 2

# COS配置
cos_bucket_name = "yyc3-backup"
```

---

## 注意事项

1. **SecretId和SecretKey**：
   - 不要将SecretId和SecretKey提交到代码仓库
   - 使用环境变量或密钥管理工具

2. **AppID**：
   - AppID是16位数字，可以从腾讯云控制台右上角获取
   - 请替换`user_id`的默认值

3. **区域（Region）**：
   - 腾讯云使用不同的区域代码（如`ap-guangzhou`）
   - 请确认区域代码正确

4. **网络配置**：
   - TKE集群的Pod CIDR默认为`10.3.0.0/16`
   - Service CIDR默认为`10.0.0.0/16`
   - 请确保VPC CIDR不与Pod CIDR和Service CIDR冲突

---

**文档版本**: v1.0.0
**最后更新**: 2026-01-03
**维护人**: YYC³ Infrastructure Team
