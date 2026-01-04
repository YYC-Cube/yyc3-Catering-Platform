#!/bin/bash
# 腾讯云基础设施部署脚本
# 用途：部署腾讯云VPC、TKE、COS等基础设施

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 配置变量
REGION="${TENCENT_REGION:-ap-guangzhou}"
PROJECT_NAME="${PROJECT_NAME:-yyc3}"
ENVIRONMENT="${ENVIRONMENT:-production}"

# Terraform配置
TERRAFORM_DIR="infra/phase1/iac/terraform/tencent"

# 检查依赖
check_dependencies() {
    log_info "检查依赖..."

    if ! command -v tke &> /dev/null; then
        log_error "腾讯云CLI未安装"
        exit 1
    fi

    if ! command -v terraform &> /dev/null; then
        log_error "Terraform未安装"
        exit 1
    fi

    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl未安装"
        exit 1
    fi

    log_info "依赖检查完成"
}

# 配置腾讯云CLI
configure_tencent_cli() {
    log_info "配置腾讯云CLI..."

    # 检查腾讯云凭证
    if ! tke config &> /dev/null; then
        log_error "腾讯云凭证未配置，请运行: tke configure"
        exit 1
    fi

    # 设置默认区域
    export TENCENT_REGION=$REGION

    log_info "腾讯云CLI配置完成 (Region: $REGION)"
}

# 初始化Terraform
init_terraform() {
    log_info "初始化Terraform..."

    cd $TERRAFORM_DIR

    # 初始化Terraform
    terraform init -upgrade

    log_info "Terraform初始化完成"
}

# 规划Terraform变更
plan_terraform() {
    log_info "规划Terraform变更..."

    cd $TERRAFORM_DIR

    # 规划变更
    terraform plan \
        -var="region=$REGION" \
        -var="project_name=$PROJECT_NAME" \
        -var="environment=$ENVIRONMENT" \
        -out=tfplan

    log_info "Terraform规划完成"
}

# 应用Terraform变更
apply_terraform() {
    log_info "应用Terraform变更..."

    cd $TERRAFORM_DIR

    # 应用变更
    terraform apply -auto-approve tfplan

    log_info "Terraform变更已应用"
}

# 配置kubectl
configure_kubectl() {
    log_info "配置kubectl..."

    # 获取TKE集群ID
    CLUSTER_ID=$(terraform output -raw tke_cluster_id)

    # 更新kubeconfig
    tke config --cluster-id $CLUSTER_ID

    # 验证集群访问
    kubectl cluster-info

    log_info "kubectl配置完成"
}

# 部署Kubernetes基础组件
deploy_kubernetes_components() {
    log_info "部署Kubernetes基础组件..."

    # 部署命名空间
    kubectl apply -f infra/phase1/iac/kubernetes/tke/namespace.yaml

    # 部署Cilium
    kubectl apply -f infra/phase1/iac/kubernetes/tke/cilium.yaml

    # 部署Ingress Controller
    kubectl apply -f infra/phase1/iac/kubernetes/tke/ingress-controller.yaml

    # 部署Cert Manager
    kubectl apply -f infra/phase1/iac/kubernetes/tke/cert-manager.yaml

    log_info "Kubernetes基础组件部署完成"
}

# 验证部署
verify_deployment() {
    log_info "验证部署..."

    # 验证Terraform状态
    cd $TERRAFORM_DIR
    terraform output

    # 验证Kubernetes集群
    kubectl get nodes
    kubectl get pods -n production

    # 验证Ingress Controller
    kubectl get pods -n ingress-nginx

    # 验证Cert Manager
    kubectl get pods -n cert-manager

    log_info "部署验证完成"
}

# 主函数
main() {
    log_info "开始部署腾讯云基础设施..."
    log_info "项目: $PROJECT_NAME"
    log_info "环境: $ENVIRONMENT"
    log_info "区域: $REGION"

    # 检查依赖
    check_dependencies

    # 配置腾讯云CLI
    configure_tencent_cli

    # 初始化Terraform
    init_terraform

    # 规划Terraform变更
    plan_terraform

    # 应用Terraform变更
    apply_terraform

    # 配置kubectl
    configure_kubectl

    # 部署Kubernetes基础组件
    deploy_kubernetes_components

    # 验证部署
    verify_deployment

    log_info "腾讯云基础设施部署完成！"
}

# 执行主函数
main "$@"
