#!/usr/bin/env node

/**
 * @file TypeScript检查脚本
 * @description 用于绕过项目引用、composite设置和emit禁用造成的判错问题
 * @module ts-checker
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// 获取命令行参数
const args = process.argv.slice(2);

// 帮助信息
const showHelp = () => {
  console.log('TypeScript检查脚本 - 绕过项目引用、composite和emit设置问题');
  console.log('');
  console.log('用法:');
  console.log('  ts-checker <文件或目录路径>    # 检查指定文件或目录');
  console.log('  ts-checker --fix-tsconfig      # 修复tsconfig.json中的composite和noEmit设置');
  console.log('  ts-checker --help              # 显示帮助信息');
  console.log('');
  console.log('示例:');
  console.log('  ts-checker tests/api/menu.test.ts');
  console.log('  ts-checker frontend/src/components');
};

// 检查指定文件或目录
const checkFiles = (targetPath) => {
  try {
    const fullPath = path.resolve(targetPath);
    
    // 检查路径是否存在
    if (!fs.existsSync(fullPath)) {
      console.error(`错误: 路径 "${fullPath}" 不存在`);
      process.exit(1);
    }
    
    console.log(`正在检查: ${fullPath}`);
    console.log('');
    
    // 执行TypeScript检查，忽略项目引用和composite设置
    // 不指定--project选项，让tsc直接检查文件，不加载项目配置
    const command = `npx tsc --noEmit --skipLibCheck "${fullPath}"`;
    
    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
    
    if (output) {
      console.log(output);
      console.log('');
      console.log('检查完成，发现错误');
      process.exit(1);
    } else {
      console.log('✓ 检查完成，没有发现错误');
      process.exit(0);
    }
  } catch (error) {
    console.error(error.stdout?.toString() || error.stderr?.toString() || error.message);
    process.exit(1);
  }
};

// 修复tsconfig.json文件
const fixTsconfig = () => {
  try {
    // 根目录tsconfig.json
    const rootTsconfigPath = path.resolve('./tsconfig.json');
    if (fs.existsSync(rootTsconfigPath)) {
      const rootTsconfig = JSON.parse(fs.readFileSync(rootTsconfigPath, 'utf-8'));
      console.log('正在检查根目录tsconfig.json...');
      
      // 确保有references数组
      if (!rootTsconfig.references) {
        rootTsconfig.references = [];
      }
      
      fs.writeFileSync(rootTsconfigPath, JSON.stringify(rootTsconfig, null, 2));
      console.log('✓ 根目录tsconfig.json已更新');
    }
    
    // frontend/tsconfig.json
    const frontendTsconfigPath = path.resolve('./frontend/tsconfig.json');
    if (fs.existsSync(frontendTsconfigPath)) {
      const frontendTsconfig = JSON.parse(fs.readFileSync(frontendTsconfigPath, 'utf-8'));
      console.log('正在修复frontend/tsconfig.json...');
      
      // 添加composite: true
      frontendTsconfig.compilerOptions = frontendTsconfig.compilerOptions || {};
      frontendTsconfig.compilerOptions.composite = true;
      
      // 移除noEmit或设置为false
      if (frontendTsconfig.compilerOptions.noEmit === true) {
        delete frontendTsconfig.compilerOptions.noEmit;
        // 或者设置emitDeclarationOnly: true，如果只需要声明文件
        // frontendTsconfig.compilerOptions.emitDeclarationOnly = true;
      }
      
      fs.writeFileSync(frontendTsconfigPath, JSON.stringify(frontendTsconfig, null, 2));
      console.log('✓ frontend/tsconfig.json已修复');
    }
    
    // backend/tsconfig.json
    const backendTsconfigPath = path.resolve('./backend/tsconfig.json');
    if (fs.existsSync(backendTsconfigPath)) {
      const backendTsconfig = JSON.parse(fs.readFileSync(backendTsconfigPath, 'utf-8'));
      console.log('正在修复backend/tsconfig.json...');
      
      // 添加composite: true
      backendTsconfig.compilerOptions = backendTsconfig.compilerOptions || {};
      backendTsconfig.compilerOptions.composite = true;
      
      fs.writeFileSync(backendTsconfigPath, JSON.stringify(backendTsconfig, null, 2));
      console.log('✓ backend/tsconfig.json已修复');
    }
    
    // tsconfig.node.json
    const nodeTsconfigPath = path.resolve('./tsconfig.node.json');
    if (fs.existsSync(nodeTsconfigPath)) {
      const nodeTsconfig = JSON.parse(fs.readFileSync(nodeTsconfigPath, 'utf-8'));
      console.log('正在修复tsconfig.node.json...');
      
      // 移除noEmit或设置为false
      if (nodeTsconfig.compilerOptions?.noEmit === true) {
        delete nodeTsconfig.compilerOptions.noEmit;
        // 或者设置emitDeclarationOnly: true，如果只需要声明文件
        // nodeTsconfig.compilerOptions.emitDeclarationOnly = true;
      }
      
      fs.writeFileSync(nodeTsconfigPath, JSON.stringify(nodeTsconfig, null, 2));
      console.log('✓ tsconfig.node.json已修复');
    }
    
    console.log('');
    console.log('所有tsconfig.json文件已修复完成!');
    process.exit(0);
  } catch (error) {
    console.error('修复失败:', error.message);
    process.exit(1);
  }
};

// 主函数
const main = () => {
  if (args.length === 0 || args[0] === '--help') {
    showHelp();
    process.exit(0);
  } else if (args[0] === '--fix-tsconfig') {
    fixTsconfig();
  } else {
    checkFiles(args[0]);
  }
};

main();