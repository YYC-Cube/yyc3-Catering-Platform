#!/usr/bin/env bun

import { NLPService } from './backend/services/ai-assistant/src/services/NLPService.js';

// 创建NLPService实例
const nlpService = new NLPService();

// 非常简单的测试文本
const testText = "我要宫保鸡丁";

console.log("=== 开始简单NLPService测试 ===");
console.log(`测试文本: ${testText}`);

try {
  const startTime = Date.now();
  
  // 测试实体提取 - 添加详细日志
  console.log("开始提取实体...");
  
  // 获取food_item正则表达式
  const foodItemRegex = nlpService['entityPatterns']['food_item'];
  console.log(`food_item正则表达式: ${foodItemRegex}`);
  console.log(`正则表达式是否全局: ${foodItemRegex.global}`);
  
  // 直接测试正则表达式
  console.log("直接测试正则表达式...");
  const directMatches = testText.match(foodItemRegex);
  console.log(`直接匹配结果: ${directMatches}`);
  
  // 测试NLPService的实体提取方法
  console.log("测试NLPService.extractEntities...");
  const entities = nlpService.extractEntities(testText);
  console.log("实体提取结果:", entities);
  
  const endTime = Date.now();
  console.log(`测试耗时: ${endTime - startTime}ms`);
  
  console.log("\n=== 测试完成 ===");
} catch (error) {
  console.error("测试失败:", error);
  console.error("错误堆栈:", error.stack);
  process.exit(1);
}
