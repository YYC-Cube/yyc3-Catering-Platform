#!/usr/bin/env bun

import { NLPService } from './backend/services/ai-assistant/src/services/NLPService.js';

// 创建NLPService实例 - 只支持食物项目实体
const nlpService = new NLPService({
  supportedEntities: ['food_item'], // 只测试食物项目实体
  enableIntentRecognition: false // 禁用意图识别，只测试实体提取
});

// 非常简单的测试文本
const testText = "我要宫保鸡丁";

console.log("=== 开始简单NLPService测试 ===");
console.log(`测试文本: ${testText}`);

try {
  const startTime = Date.now();
  
  // 直接测试extractEntities方法
  console.log("开始调用extractEntities...");
  
  // 使用Promise.all和timeout来防止无限循环
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("extractEntities调用超时（5秒）")), 5000);
  });
  
  const entitiesPromise = nlpService.extractEntities(testText);
  
  const entities = await Promise.race([entitiesPromise, timeoutPromise]);
  
  console.log("实体提取结果:", entities);
  
  const endTime = Date.now();
  console.log(`测试耗时: ${endTime - startTime}ms`);
  
  console.log("\n=== 测试完成 ===");
} catch (error) {
  console.error("测试失败:", error);
  console.error("错误堆栈:", error.stack);
  process.exit(1);
}
