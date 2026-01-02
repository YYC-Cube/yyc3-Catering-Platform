#!/usr/bin/env bash

# 演示如何使用ts-checker.js脚本

echo "=== TypeScript检查脚本演示 ==="
echo ""

# 检查当前目录下的ts-checker.js是否存在
if [ -f "ts-checker.js" ]; then
    echo "✓ ts-checker.js脚本存在"
else
    echo "✗ ts-checker.js脚本不存在，请先创建该脚本"
    exit 1
fi

echo ""
echo "=== 1. 显示帮助信息 ==="
./ts-checker.js --help

echo ""
echo "=== 2. 检查单个文件 (menu.test.ts) ==="
./ts-checker.js tests/api/menu.test.ts

echo ""
echo "=== 3. 检查整个目录 (tests/api) ==="
./ts-checker.js tests/api

echo ""
echo "=== 4. 修复tsconfig.json配置 ==="
./ts-checker.js --fix-tsconfig

echo ""
echo "=== 演示完成 ==="