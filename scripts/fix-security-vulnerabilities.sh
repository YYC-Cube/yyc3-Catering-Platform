#!/bin/bash

set -euo pipefail

echo "🚀 开始安全漏洞修复和依赖更新..."
echo "=================================="

echo "📋 步骤1: 备份当前的package.json和lock文件"
cp package.json package.json.backup
cp pnpm-lock.yaml pnpm-lock.yaml.backup

echo "📋 步骤2: 更新主要依赖包"
pnpm update express@latest
pnpm update helmet@latest
pnpm update express-rate-limit@latest
pnpm update cors@latest
pnpm update bcryptjs@latest
pnpm update jsonwebtoken@latest
pnpm update joi@latest
pnpm update zod@latest

echo "📋 步骤3: 更新开发依赖"
pnpm update -D @types/node@latest
pnpm update -D @types/express@latest
pnpm update -D @types/jsonwebtoken@latest
pnpm update -D typescript@latest
pnpm update -D eslint@latest
pnpm update -D vitest@latest
pnpm update -D @vitest/coverage-v8@latest
pnpm update -D @vitest/ui@latest

echo "📋 步骤4: 更新AI相关依赖"
pnpm update openai@latest
pnpm update @anthropic-ai/sdk@latest

echo "📋 步骤5: 更新工具库"
pnpm update axios@latest
pnpm update lodash@latest
pnpm update moment@latest
pnpm update uuid@latest

echo "📋 步骤6: 更新其他依赖"
pnpm update http-proxy-middleware@latest
pnpm update nodemailer@latest
pnpm update winston@latest
pnpm update socket.io@latest

echo "📋 步骤7: 更新开发工具"
pnpm update -D husky@latest
pnpm update -D lint-staged@latest
pnpm update -D prettier@latest
pnpm update -D rimraf@latest
pnpm update -D supertest@latest
pnpm update -D nodemon@latest
pnpm update -D concurrently@latest

echo "📋 步骤8: 清理缓存并重新安装"
pnpm store prune
rm -rf node_modules
pnpm install

echo "✅ 安全漏洞修复和依赖更新完成！"
echo "=================================="
echo "📝 请运行以下命令验证更新："
echo "   - pnpm test:unit"
echo "   - pnpm lint"
echo "   - pnpm type-check"
