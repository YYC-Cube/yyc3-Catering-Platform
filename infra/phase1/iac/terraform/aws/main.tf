# AWS Terraform配置

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

# 配置AWS Provider
provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# 配置AWS Backend（Remote State）
terraform {
  backend "s3" {
    bucket         = "${var.project_name}-terraform-state"
    key            = "aws/${var.environment}/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "${var.project_name}-terraform-locks"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  required_version = ">= 1.6.0"
}

# 创建S3 Bucket（Terraform State）
resource "aws_s3_bucket" "terraform_state" {
  bucket = "${var.project_name}-terraform-state"

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name = "${var.project_name}-terraform-state"
  }
}

# 启用S3 Bucket版本控制
resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

# 启用S3 Bucket加密
resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# 创建DynamoDB Table（State Lock）
resource "aws_dynamodb_table" "terraform_locks" {
  name           = "${var.project_name}-terraform-locks"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Name = "${var.project_name}-terraform-locks"
  }
}

# 输出
output "s3_bucket_arn" {
  value       = aws_s3_bucket.terraform_state.arn
  description = "The ARN of the S3 bucket"
}

output "dynamodb_table_name" {
  value       = aws_dynamodb_table.terraform_locks.name
  description = "The name of the DynamoDB table"
}
```

---

## 变量定义文件

```hcl
# variables.tf

# AWS配置
variable "region" {
  description = "AWS Region"
  type        = string
  default     = "us-east-1"
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
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "Public Subnet CIDR Block"
  type        = string
  default     = "10.0.1.0/24"
}

variable "private_subnet_cidr" {
  description = "Private Subnet CIDR Block"
  type        = string
  default     = "10.0.2.0/24"
}

# EKS配置
variable "eks_version" {
  description = "EKS Cluster Version"
  type        = string
  default     = "1.28"
}

variable "eks_cluster_name" {
  description = "EKS Cluster Name"
  type        = string
  default     = "yyc3-production"
}

variable "node_instance_type" {
  description = "EC2 Instance Type for EKS Nodes"
  type        = string
  default     = "t3.large"
}

variable "node_count" {
  description = "Number of EKS Nodes"
  type        = number
  default     = 2
}

# VPN配置
variable "vpn_gateway_ip" {
  description = "VPN Gateway IP Address (阿里云端）"
  type        = string
  sensitive   = true
}

variable "pre_shared_key" {
  description = "VPN Pre-Shared Key"
  type        = string
  sensitive   = true
}

# S3配置
variable "s3_bucket_name" {
  description = "S3 Bucket Name for Static Assets"
  type        = string
  default     = "yyc3-static-assets"
}

variable "s3_bucket_acl" {
  description = "S3 Bucket ACL"
  type        = string
  default     = "public-read"
}
```

---

## 输出定义文件

```hcl
# outputs.tf

# VPC输出
output "vpc_id" {
  value       = aws_vpc.main.id
  description = "VPC ID"
}

output "public_subnet_id" {
  value       = aws_subnet.public.id
  description = "Public Subnet ID"
}

output "private_subnet_id" {
  value       = aws_subnet.private.id
  description = "Private Subnet ID"
}

# EKS输出
output "eks_cluster_id" {
  value       = aws_eks_cluster.main.id
  description = "EKS Cluster ID"
}

output "eks_cluster_endpoint" {
  value       = aws_eks_cluster.main.endpoint
  description = "EKS Cluster Endpoint"
}

output "eks_cluster_arn" {
  value       = aws_eks_cluster.main.arn
  description = "EKS Cluster ARN"
}

# S3输出
output "s3_bucket_id" {
  value       = aws_s3_bucket.static_assets.id
  description = "S3 Bucket ID"
}

output "s3_bucket_arn" {
  value       = aws_s3_bucket.static_assets.arn
  description = "S3 Bucket ARN"
}
```

---

## VPC配置文件

```hcl
# vpc.tf

# 创建VPC
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-${var.environment}-vpc"
  }
}

# 创建Public Subnet
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidr
  map_public_ip_on_launch = true
  availability_zone       = "${var.region}a"

  tags = {
    Name = "${var.project_name}-${var.environment}-public-subnet"
  }
}

# 创建Private Subnet
resource "aws_subnet" "private" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidr
  availability_zone = "${var.region}b"

  tags = {
    Name = "${var.project_name}-${var.environment}-private-subnet"
  }
}

# 创建Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-${var.environment}-igw"
  }
}

# 创建Public Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-public-rt"
  }
}

# 关联Public Subnet到Public Route Table
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# 创建Elastic IP for NAT Gateway
resource "aws_eip" "nat" {
  vpc = true

  tags = {
    Name = "${var.project_name}-${var.environment}-nat-eip"
  }
}

# 创建NAT Gateway
resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public.id

  tags = {
    Name = "${var.project_name}-${var.environment}-nat-gateway"
  }

  depends_on = [aws_internet_gateway.main]
}

# 创建Private Route Table
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-private-rt"
  }
}

# 关联Private Subnet到Private Route Table
resource "aws_route_table_association" "private" {
  subnet_id      = aws_subnet.private.id
  route_table_id = aws_route_table.private.id
}
```

---

## EKS配置文件

```hcl
# eks.tf

# 创建EKS IAM角色
resource "aws_iam_role" "eks_cluster" {
  name = "${var.project_name}-eks-cluster-role"

  assume_role_policy = jsonencode({
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      }
    ]
    Version = "2012-10-17"
  })
}

# 附加EKS集群策略到IAM角色
resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster.name
}

# 创建EKS集群
resource "aws_eks_cluster" "main" {
  name     = var.eks_cluster_name
  role_arn = aws_iam_role.eks_cluster.arn
  version  = var.eks_version

  vpc_config {
    subnet_ids = [
      aws_subnet.public.id,
      aws_subnet.private.id,
    ]

    security_group_ids = [aws_security_group.eks_cluster.id]
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy,
  ]

  tags = {
    Name = "${var.project_name}-${var.environment}-eks-cluster"
  }
}

# 创建EKS集群安全组
resource "aws_security_group" "eks_cluster" {
  name        = "${var.project_name}-eks-cluster-sg"
  description = "Security Group for EKS Cluster"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-eks-cluster-sg"
  }
}

# 创建EKS Node IAM角色
resource "aws_iam_role" "eks_node" {
  name = "${var.project_name}-eks-node-role"

  assume_role_policy = jsonencode({
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
    Version = "2012-10-17"
  })
}

# 附加EKS Node策略到IAM角色
resource "aws_iam_role_policy_attachment" "eks_worker_node_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.eks_node.name
}

resource "aws_iam_role_policy_attachment" "eks_cni_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.eks_node.name
}

resource "aws_iam_role_policy_attachment" "ecr_readonly" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.eks_node.name
}

# 创建EKS Node Group
resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.project_name}-node-group"
  node_role_arn   = aws_iam_role.eks_node.arn
  subnet_ids      = [aws_subnet.private.id]

  scaling_config {
    desired_size = var.node_count
    max_size     = var.node_count + 2
    min_size     = var.node_count
  }

  instance_types = [var.node_instance_type]

  remote_access {
    ec2_ssh_key = "yyc3-production"
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.ecr_readonly,
  ]

  tags = {
    Name = "${var.project_name}-${var.environment}-eks-node-group"
  }
}
```

---

## S3配置文件

```hcl
# s3.tf

# 创建S3 Bucket（静态资产）
resource "aws_s3_bucket" "static_assets" {
  bucket = var.s3_bucket_name

  tags = {
    Name = "${var.project_name}-${var.environment}-static-assets"
  }
}

# 配置S3 Bucket ACL
resource "aws_s3_bucket_acl" "static_assets" {
  bucket = aws_s3_bucket.static_assets.id
  acl    = var.s3_bucket_acl
}

# 启用S3 Bucket版本控制
resource "aws_s3_bucket_versioning" "static_assets" {
  bucket = aws_s3_bucket.static_assets.id

  versioning_configuration {
    status = "Enabled"
  }
}

# 配置S3 Bucket生命周期
resource "aws_s3_bucket_lifecycle_configuration" "static_assets" {
  bucket = aws_s3_bucket.static_assets.id

  rule {
    id     = "delete-old-versions"
    status = "Enabled"

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}
```

---

## terraform.tfvars示例

```hcl
# terraform.tfvars

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
pre_shared_key = "your-secret-key-change-this"

# S3配置
s3_bucket_name = "yyc3-static-assets"
s3_bucket_acl = "public-read"
```

---

**文档版本**: v1.0.0
**最后更新**: 2026-01-03
**维护人**: YYC³ Infrastructure Team
