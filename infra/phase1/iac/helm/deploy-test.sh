#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHART_DIR="${SCRIPT_DIR}/charts/yyc3-catering-platform"
RELEASE_NAME="${RELEASE_NAME:-yyc3-test}"
NAMESPACE="${NAMESPACE:-test}"
VALUES_FILE="${VALUES_FILE:-${CHART_DIR}/values-test.yaml}"

echo "=== YYC³ 餐饮平台 Helm 部署脚本 ==="
echo ""
echo "配置信息:"
echo "  Release 名称: ${RELEASE_NAME}"
echo "  命名空间: ${NAMESPACE}"
echo "  Values 文件: ${VALUES_FILE}"
echo ""

echo "1. 检查 Helm 是否安装..."
if ! command -v helm &> /dev/null; then
    echo "❌ Helm 未安装，请先安装 Helm"
    echo "   安装命令: brew install helm"
    exit 1
fi
echo "✅ Helm 已安装: $(helm version --short)"
echo ""

echo "2. 检查 Kubernetes 连接..."
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ 无法连接到 Kubernetes 集群"
    echo "   请确保 kubectl 配置正确"
    exit 1
fi
echo "✅ Kubernetes 连接正常"
echo ""

echo "3. 创建命名空间 (如果不存在)..."
if ! kubectl get namespace "${NAMESPACE}" &> /dev/null; then
    echo "   创建命名空间: ${NAMESPACE}"
    kubectl create namespace "${NAMESPACE}"
else
    echo "   命名空间已存在: ${NAMESPACE}"
fi
echo ""

echo "4. 更新 Chart 依赖..."
helm dependency update "${CHART_DIR}"
echo "✅ 依赖更新完成"
echo ""

echo "5. 检查 Release 是否已存在..."
if helm status "${RELEASE_NAME}" -n "${NAMESPACE}" &> /dev/null; then
    echo "⚠️  Release 已存在，准备升级..."
    helm upgrade "${RELEASE_NAME}" "${CHART_DIR}" \
        -f "${VALUES_FILE}" \
        -n "${NAMESPACE}" \
        --wait \
        --timeout 10m
    echo "✅ Release 升级成功"
else
    echo "📦 准备安装新 Release..."
    helm install "${RELEASE_NAME}" "${CHART_DIR}" \
        -f "${VALUES_FILE}" \
        -n "${NAMESPACE}" \
        --wait \
        --timeout 10m
    echo "✅ Release 安装成功"
fi
echo ""

echo "6. 查看部署状态..."
helm status "${RELEASE_NAME}" -n "${NAMESPACE}"
echo ""

echo "7. 查看 Pod 状态..."
kubectl get pods -n "${NAMESPACE}" -l "app.kubernetes.io/instance=${RELEASE_NAME}"
echo ""

echo "8. 查看 Service 状态..."
kubectl get svc -n "${NAMESPACE}" -l "app.kubernetes.io/instance=${RELEASE_NAME}"
echo ""

echo "=== ✅ 部署完成 ==="
echo ""
echo "📋 部署摘要:"
echo "   - Release 名称: ${RELEASE_NAME}"
echo "   - 命名空间: ${NAMESPACE}"
echo "   - 状态: 已部署"
echo ""
echo "🔍 常用命令:"
echo "   查看状态: helm status ${RELEASE_NAME} -n ${NAMESPACE}"
echo "   查看 Pod: kubectl get pods -n ${NAMESPACE}"
echo "   查看日志: kubectl logs -n ${NAMESPACE} -l app.kubernetes.io/instance=${RELEASE_NAME} --tail=100"
echo "   卸载: helm uninstall ${RELEASE_NAME} -n ${NAMESPACE}"
