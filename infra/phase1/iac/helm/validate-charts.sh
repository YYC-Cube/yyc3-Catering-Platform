#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHART_DIR="${SCRIPT_DIR}/charts/yyc3-catering-platform"

echo "=== YYC³ 餐饮平台 Helm Charts 验证脚本 ==="
echo ""

echo "1. 检查 Helm 是否安装..."
if ! command -v helm &> /dev/null; then
    echo "❌ Helm 未安装，请先安装 Helm"
    echo "   安装命令: brew install helm"
    exit 1
fi
echo "✅ Helm 已安装: $(helm version --short)"
echo ""

echo "2. 检查 Chart 目录结构..."
if [ ! -d "${CHART_DIR}" ]; then
    echo "❌ Chart 目录不存在: ${CHART_DIR}"
    exit 1
fi
echo "✅ Chart 目录存在"
echo ""

echo "3. 验证主 Chart..."
if ! helm lint "${CHART_DIR}"; then
    echo "❌ 主 Chart 验证失败"
    exit 1
fi
echo "✅ 主 Chart 验证通过"
echo ""

echo "4. 验证测试环境配置..."
if [ ! -f "${CHART_DIR}/values-test.yaml" ]; then
    echo "❌ 测试环境配置文件不存在"
    exit 1
fi
echo "✅ 测试环境配置文件存在"
echo ""

echo "5. 模拟部署测试环境..."
if ! helm template yyc3-test "${CHART_DIR}" -f "${CHART_DIR}/values-test.yaml" --debug > /tmp/helm-test-render.yaml 2>&1; then
    echo "❌ 测试环境模板渲染失败"
    cat /tmp/helm-test-render.yaml
    exit 1
fi
echo "✅ 测试环境模板渲染成功"
echo ""

echo "6. 检查生成的 Kubernetes 资源..."
echo "   生成的资源数量: $(grep -c '^kind:' /tmp/helm-test-render.yaml)"
echo "   生成的资源类型:"
grep '^kind:' /tmp/helm-test-render.yaml | sort | uniq -c
echo ""

echo "7. 验证子 Charts..."
SUBCHARTS=("api-gateway" "business-gateway" "user-service" "order-service" "menu-service" "payment-service")
for subchart in "${SUBCHARTS[@]}"; do
    SUBCHART_DIR="${CHART_DIR}/../${subchart}"
    if [ -d "${SUBCHART_DIR}" ]; then
        echo "   验证 ${subchart}..."
        if ! helm lint "${SUBCHART_DIR}" > /dev/null 2>&1; then
            echo "   ❌ ${subchart} 验证失败"
            exit 1
        fi
        echo "   ✅ ${subchart} 验证通过"
    else
        echo "   ⚠️  ${subchart} 目录不存在"
    fi
done
echo ""

echo "8. 检查依赖关系..."
if ! helm dependency update "${CHART_DIR}" > /dev/null 2>&1; then
    echo "❌ 依赖更新失败"
    exit 1
fi
echo "✅ 依赖关系正常"
echo ""

echo "=== ✅ 所有验证通过 ==="
echo ""
echo "📋 验证摘要:"
echo "   - Helm 工具已安装"
echo "   - Chart 目录结构正确"
echo "   - 主 Chart 验证通过"
echo "   - 测试环境配置有效"
echo "   - 模板渲染成功"
echo "   - 子 Charts 验证通过"
echo "   - 依赖关系正常"
echo ""
echo "🚀 可以执行以下命令部署到测试环境:"
echo "   helm install yyc3-test ${CHART_DIR} -f ${CHART_DIR}/values-test.yaml --namespace test --create-namespace"
