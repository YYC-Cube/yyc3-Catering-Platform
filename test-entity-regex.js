#!/usr/bin/env bun

import { NLPService } from './backend/services/ai-assistant/src/services/NLPService.js';

// 直接访问NLPService实例的实体模式（通过反射或继承）
class NLPServiceWithDebug extends NLPService {
  // 获取所有实体模式
  getEntityPatterns() {
    return this.entityPatterns;
  }
  
  // 测试单个实体类型的正则表达式
  testEntityRegex(entityType, text) {
    const pattern = this.entityPatterns[entityType];
    if (!pattern) {
      throw new Error(`实体类型 ${entityType} 不存在`);
    }
    
    const regex = pattern.regex;
    console.log(`\n测试实体类型: ${entityType}`);
    console.log(`正则表达式: ${regex}`);
    console.log(`正则表达式是否全局: ${regex.global}`);
    console.log(`测试文本: ${text}`);
    
    try {
      const startTime = Date.now();
      
      // 重置lastIndex
      regex.lastIndex = 0;
      
      // 使用matchAll测试，因为它会返回所有匹配项
      const matches = [...text.matchAll(regex)];
      console.log(`匹配结果数量: ${matches.length}`);
      
      matches.forEach((match, index) => {
        console.log(`匹配项 ${index + 1}: ${match[0]}, 索引: ${match.index}`);
      });
      
      const endTime = Date.now();
      console.log(`测试耗时: ${endTime - startTime}ms`);
      
      return matches;
    } catch (error) {
      console.error(`正则表达式测试失败: ${error}`);
      return null;
    }
  }
}

// 创建带调试功能的NLPService实例
const nlpService = new NLPServiceWithDebug();

// 获取所有实体类型
const entityPatterns = nlpService.getEntityPatterns();
const entityTypes = Object.keys(entityPatterns);

console.log("=== 开始实体正则表达式逐个测试 ===");
console.log(`可用实体类型: ${entityTypes.join(', ')}`);

// 测试每个实体类型的正则表达式
const testText = "明天中午12点送到办公室";

for (const entityType of entityTypes) {
  console.log(`\n--- 测试实体类型: ${entityType} ---`);
  
  try {
    const startTime = Date.now();
    
    // 重置lastIndex以确保每次测试都是独立的
    const regex = entityPatterns[entityType].regex;
    regex.lastIndex = 0;
    
    console.log(`正则表达式: ${regex}`);
    console.log(`正则表达式是否全局: ${regex.global}`);
    
    // 使用Promise.all和timeout来防止无限循环
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`实体类型 ${entityType} 测试超时（3秒）`)), 3000);
    });
    
    const matchesPromise = new Promise((resolve) => {
      try {
        const matches = [...testText.matchAll(regex)];
        resolve(matches);
      } catch (error) {
        resolve([error]);
      }
    });
    
    const matches = await Promise.race([matchesPromise, timeoutPromise]);
    
    if (matches[0] instanceof Error) {
      console.error(`测试失败: ${matches[0].message}`);
      continue;
    }
    
    console.log(`匹配结果数量: ${matches.length}`);
    
    matches.forEach((match, index) => {
      console.log(`匹配项 ${index + 1}: ${match[0]}, 索引: ${match.index}`);
    });
    
    const endTime = Date.now();
    console.log(`测试耗时: ${endTime - startTime}ms`);
    
  } catch (error) {
    console.error(`测试失败: ${error}`);
    console.error(`错误堆栈: ${error.stack}`);
  }
}

console.log("\n=== 测试完成 ===");
