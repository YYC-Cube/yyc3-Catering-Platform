# 阿里云Terraform配置

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

# 配置阿里云Provider
provider "alicloud" {
  region = var.region

  alias = "primary"
}

# 配置阿里云Backend（Remote State）
terraform {
  backend "oss" {
    bucket = "${var.project_name}-terraform-state"
    prefix = "aliyun/${var.environment}/terraform.tfstate"
    region = "cn-hangzhou"
    key    = "terraform.tfstate"
  }

  required_providers {
    alicloud = {
      source  = "aliyun/alicloud"
      version = "~> 1.200.0"
    }
  }

  required_version = ">= 1.6.0"
}

# 创建OSS Bucket（Terraform State）
resource "alicloud_oss_bucket" "terraform_state" {
  bucket = "${var.project_name}-terraform-state"

  lifecycle {
    prevent_destroy = true
  }

  versioning {
    status = "Enabled"
  }

  server_side_encryption_rule {
    sse_algorithm = "AES256"
  }

  tags = {
    Name = "${var.project_name}-terraform-state"
  }
}

# 创建Logstore（State Lock）
resource "alicloud_log_store" "terraform_locks" {
  project_name          = alicloud_log_project.terraform.name
  logstore_name         = "${var.project_name}-terraform-locks"
  ttl                   = 30
  enable_tracking       = false

  shard_count           = 1
  auto_split            = true
  max_split_shard_count = 1

  append_meta           = true

  lifecycle {
    prevent_destroy = true
  }
}

resource "alicloud_log_project" "terraform" {
  project_name = "${var.project_name}-terraform"
  description  = "Terraform State Lock for ${var.project_name}"

  lifecycle {
    prevent_destroy = true
  }
}

# 输出
output "oss_bucket_arn" {
  value       = "acs:oss:::${data.alicloud_account.current.id}:bucket/${var.project_name}-terraform-state"
  description = "The ARN of the OSS bucket"
}

output "logstore_name" {
  value       = alicloud_log_store.terraform_locks.logstore_name
  description = "The name of the Logstore"
}

# 获取当前账号信息
data "alicloud_account" "current" {}

# 输出当前账号ID
output "account_id" {
  value       = data.alicloud_account.current.id
  description = "The current Aliyun Account ID"
}
```

---

## 变量定义文件

```hcl
# variables.tf

# 阿里云配置
variable "region" {
  description = "Aliyun Region"
  type        = string
  default     = "cn-hangzhou"
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
  default     = "172.16.0.0/16"
}

variable "vswitch_cidr" {
  description = "VSwitch (Subnet) CIDR Block"
  type        = string
  default     = "172.16.1.0/24"
}

# ACK配置
variable "ack_version" {
  description = "ACK Cluster Version"
  type        = string
  default     = "1.28"
}

variable "ack_cluster_name" {
  description = "ACK Cluster Name"
  type        = string
  default     = "yyc3-production"
}

variable "worker_instance_type" {
  description = "ECS Instance Type for ACK Workers"
  type        = string
  default     = "ecs.c6.large"
}

variable "worker_count" {
  description = "Number of ACK Workers"
  type        = number
  default     = 2
}

# VPN配置
variable "vpn_gateway_ip" {
  description = "VPN Gateway IP Address (AWS端）"
  type        = string
  sensitive   = true
}

variable "pre_shared_key" {
  description = "VPN Pre-Shared Key"
  type        = string
  sensitive   = true
}

# OSS配置
variable "oss_bucket_name" {
  description = "OSS Bucket Name for Static Assets"
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
  value       = alicloud_vpc.main.id
  description = "VPC ID"
}

output "vswitch_id" {
  value       = alicloud_vswitch.main.id
  description = "VSwitch ID"
}

# ACK输出
output "ack_cluster_id" {
  value       = alicloud_cs_managed_kubernetes.main.id
  description = "ACK Cluster ID"
}

output "ack_endpoint" {
  value       = alicloud_cs_managed_kubernetes.main.endpoints.0
  description = "ACK Cluster Endpoint"
}

# OSS输出
output "oss_bucket_id" {
  value       = alicloud_oss_bucket.backup.id
  description = "OSS Bucket ID"
}
```

---

## VPC配置文件

```hcl
# vpc.tf

# 创建VPC
resource "alicloud_vpc" "main" {
  vpc_name   = "${var.project_name}-${var.environment}-vpc"
  cidr_block = var.vpc_cidr

  tags = {
    Name = "${var.project_name}-${var.environment}-vpc"
  }
}

# 创建VSwitch (Subnet)
resource "alicloud_vswitch" "main" {
  vpc_id     = alicloud_vpc.main.id
  cidr_block = var.vswitch_cidr
  zone_id    = "${var.region}b"

  vswitch_name = "${var.project_name}-${var.environment}-vswitch"

  tags = {
    Name = "${var.project_name}-${var.environment}-vswitch"
  }
}

# 创建NAT Gateway
resource "alicloud_nat_gateway" "main" {
  vpc_id           = alicloud_vpc.main.id
  vswitch_id       = alicloud_vswitch.main.id
  nat_type         = "Enhanced"
  nat_gateway_name = "${var.project_name}-${var.environment}-nat"

  tags = {
    Name = "${var.project_name}-${var.environment}-nat"
  }
}

# 创建EIP (Elastic IP)
resource "alicloud_eip" "nat" {
  address_name = "${var.project_name}-${var.environment}-nat-eip"
  bandwidth    = "5"
  payment_type = "PayAsYouGo"

  tags = {
    Name = "${var.project_name}-${var.environment}-nat-eip"
  }
}

# 绑定EIP到NAT Gateway
resource "alicloud_eip_association" "nat" {
  allocation_id = alicloud_eip.nat.id
  instance_id   = alicloud_nat_gateway.main.id
}

# 创建SnatTable Entry
resource "alicloud_snat_entry" "main" {
  snat_table_id = alicloud_nat_gateway.main.snat_table_ids
  source_cidr  = var.vswitch_cidr
  snat_ip      = alicloud_eip.nat.ip_address
}

# 创建Egress只读路由条目（用于访问公网）
resource "alicloud_route_entry" "internet" {
  route_table_id        = alicloud_vpc.main.route_table_id
  destination_cidrblock = "0.0.0.0/0"
  nexthop_type          = "NatGateway"
  nexthop_id            = alicloud_nat_gateway.main.id
}
```

---

## ACK配置文件

```hcl
# ack.tf

# 创建RAM角色（ACK Worker）
resource "alicloud_ram_role" "worker" {
  name = "${var.project_name}-ack-worker-role"
  description = "RAM Role for ACK Workers"

  assume_role_policy = jsonencode({
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs.aliyuncs.com"
        }
      }
    ]
    Version = "1"
  })
}

# 附加ACK Worker策略到RAM角色
resource "alicloud_ram_role_policy_attachment" "worker_policy" {
  policy_name = "AliyunCSManagedNetworkRolePolicy"
  policy_type = "System"
  role_name   = alicloud_ram_role.worker.name
}

# 创建Managed ACK集群
resource "alicloud_cs_managed_kubernetes" "main" {
  name               = var.ack_cluster_name
  worker_vswitch_ids = [alicloud_vswitch.main.id]
  version            = var.ack_version

  # 集群配置
  cluster_spec = "ack.pro.small" # 标准托管版
  pod_cidr      = "10.1.0.0/16"
  service_cidr  = "10.2.0.0/16"
  enable_ssh    = true

  # Worker配置
  worker_number      = var.worker_count
  worker_instance_types = [var.worker_instance_type]
  key_name           = "yyc3-production"

  # RAM角色
  worker_ram_role_name = alicloud_ram_role.worker.name

  addons {
    name = "terway-eniip"
  }

  addons {
    name = "csi-plugin"
    config = "{\"\"
  }

  addons {
    name = "csi-provisioner"
  }

  addons {
    name = "nginx-ingress-controller"
    config = "{\"IngressSlbNetworkType\":\"internet\"}"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-ack-cluster"
  }
}
```

---

## OSS配置文件

```hcl
# oss.tf

# 创建OSS Bucket（备份）
resource "alicloud_oss_bucket" "backup" {
  bucket = var.oss_bucket_name
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

  # 跨区域复制（与AWS S3同步）
  replication_rule {
    name = "replicate-to-aws"
    target_bucket_id = "yyc3-static-assets" # AWS S3 Bucket ID
    target_location = "us-east-1"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-backup"
  }
}
```

---

## terraform.tfvars示例

```hcl
# terraform.tfvars

# 阿里云配置
region = "cn-hangzhou"

# 项目配置
project_name = "yyc3"
environment = "production"

# VPC配置
vpc_cidr = "172.16.0.0/16"
vswitch_cidr = "172.16.1.0/24"

# ACK配置
ack_version = "1.28"
ack_cluster_name = "yyc3-production"
worker_instance_type = "ecs.c6.large"
worker_count = 2

# VPN配置
vpn_gateway_ip = "52.90.123.45" # AWS VPN IP
pre_shared_key = "your-secret-key-change-this"

# OSS配置
oss_bucket_name = "yyc3-backup"
```

---

**文档版本**: v1.0.0
**最后更新**: 2026-01-03
**维护人**: YYC³ Infrastructure Team
