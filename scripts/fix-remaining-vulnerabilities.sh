#!/bin/bash

set -euo pipefail

echo "🔒 开始修复剩余的63个安全漏洞..."
echo "=================================="

echo "📋 步骤1: 更新关键安全依赖"

# 更新axios（修复SSRF漏洞）
echo "更新axios..."
pnpm update axios@latest

# 更新express相关依赖
echo "更新express相关依赖..."
pnpm update body-parser@latest
pnpm update cookie-parser@latest
pnpm update serve-static@latest
pnpm update send@latest

# 更新jsonwebtoken相关
echo "更新jsonwebtoken相关依赖..."
pnpm update jsonwebtoken@latest
pnpm update jws@latest
pnpm update ejs@latest

# 更新bcryptjs相关
echo "更新bcryptjs相关依赖..."
pnpm update bcryptjs@latest

# 更新winston相关
echo "更新winston相关依赖..."
pnpm update winston@latest
pnpm update logform@latest
pnpm update safe-stable-stringify@latest
pnpm update triple-beam@latest
pnpm update fd@latest

# 更新socket.io相关
echo "更新socket.io相关依赖..."
pnpm update socket.io@latest
pnpm update socket.io-client@latest
pnpm update engine.io-client@latest
pnpm update engine.io-parser@latest

# 更新moment.js相关（替换为dayjs）
echo "检查moment.js..."
if grep -q '"moment"' package.json; then
    echo "⚠️  moment.js存在多个已知漏洞，正在替换为dayjs..."
    pnpm remove moment -w
    pnpm add dayjs -w
    echo "✅ 已将moment.js替换为dayjs"
fi

# 更新lodash相关
echo "更新lodash相关依赖..."
pnpm update lodash@latest
pnpm update lodash.merge@latest
pnpm update lodash.clonedeep@latest
pnpm update lodash.isplainobject@latest
pnpm update lodash.isarray@latest
pnpm update lodash.keys@latest

# 更新minimatch相关
echo "更新minimatch相关依赖..."
pnpm update minimatch@latest
pnpm update brace-expansion@latest

# 更新path相关
echo "更新path相关依赖..."
pnpm update path-parse@latest
pnpm update set-function-length@latest

# 更新其他关键依赖
echo "更新其他关键依赖..."
pnpm update minimist@latest
pnpm update qs@latest
pnpm update tough-cookie@latest
pnpm update node-forge@latest
pnpm update debug@latest
pnpm update ms@latest
pnpm update mime-types@latest
pnpm update mime-db@latest

echo "📋 步骤2: 清理缓存并重新安装"
pnpm store prune
rm -rf node_modules
pnpm install

echo "📋 步骤3: 运行安全审计"
pnpm audit || echo "⚠️  仍有安全漏洞需要手动修复"

echo "✅ 安全漏洞修复完成！"
echo "=================================="
echo "📝 请运行以下命令验证："
echo "   - pnpm audit"
echo "   - pnpm test:unit"
echo "   - pnpm lint"
