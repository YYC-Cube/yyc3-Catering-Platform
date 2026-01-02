/**
 * 检查项目中所有package.json文件的版本号
 * @author YYC
 * @created 2024-10-15
 */
import fs from 'fs';
import path from 'path';
import process from 'process';

// 项目根目录
const rootDir = process.cwd();

/**
 * 遍历目录，查找所有package.json文件
 */
function findAllPackageJson(directory) {
  const packageJsonFiles = [];
  
  function traverse(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        // 跳过node_modules目录
        if (file !== 'node_modules') {
          traverse(filePath);
        }
      } else if (file === 'package.json') {
        packageJsonFiles.push(filePath);
      }
    }
  }
  
  traverse(directory);
  return packageJsonFiles;
}

/**
 * 检查版本号是否有效
 */
function isValidVersion(version) {
  if (!version || typeof version !== 'string') {
    return false;
  }
  
  // 支持带有前缀的版本号格式检查
  const versionRegex = /^\s*([\^~><=]*)\s*(?:(\d+)\.)?(?:(\d+)\.)?(\d+)(?:-([\da-zA-Z.-]+))?(?:\+([\da-zA-Z.-]+))?\s*$/;
  return versionRegex.test(version);
}

/**
 * 检查package.json文件中的版本号
 */
function checkPackageJsonVersions(filePath) {
  console.log(`\n检查文件: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const pkg = JSON.parse(content);
    
    let hasError = false;
    
    // 检查package.json自身的version字段
    if (!isValidVersion(pkg.version)) {
      console.error(`❌ 无效的package.version: ${pkg.version}`);
      hasError = true;
    } else {
      console.log(`✅ package.version: ${pkg.version}`);
    }
    
    // 检查dependencies中的版本号
    if (pkg.dependencies) {
      for (const [dep, version] of Object.entries(pkg.dependencies)) {
        if (!isValidVersion(version)) {
          console.error(`❌ 无效的dependency版本: ${dep}@${version}`);
          hasError = true;
        }
      }
    }
    
    // 检查devDependencies中的版本号
    if (pkg.devDependencies) {
      for (const [dep, version] of Object.entries(pkg.devDependencies)) {
        if (!isValidVersion(version)) {
          console.error(`❌ 无效的devDependency版本: ${dep}@${version}`);
          hasError = true;
        }
      }
    }
    
    return hasError;
  } catch (error) {
    console.error(`❌ 读取或解析文件失败: ${error.message}`);
    return true;
  }
}

/**
 * 主函数
 */
function main() {
  console.log('开始检查项目中所有package.json文件的版本号...');
  console.log('=' .repeat(60));
  
  const packageJsonFiles = findAllPackageJson(rootDir);
  console.log(`找到 ${packageJsonFiles.length} 个package.json文件`);
  
  let totalErrors = 0;
  
  for (const file of packageJsonFiles) {
    const hasError = checkPackageJsonVersions(file);
    if (hasError) {
      totalErrors++;
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log(`检查完成，共发现 ${totalErrors} 个文件存在版本号问题`);
  
  process.exit(totalErrors > 0 ? 1 : 0);
}

// 运行主函数
main();