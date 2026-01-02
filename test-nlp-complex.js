#!/usr/bin/env bun

import { NLPService } from './backend/services/ai-assistant/src/services/NLPService.js';

// 创建NLPService实例 - 支持所有实体类型
const nlpService = new NLPService();

// 更复杂的测试文本，包含多种实体类型
const testTexts = [
  "我要宫保鸡丁和米饭", // 多个食物项目
  "我要两份宫保鸡丁", // 数量 + 食物项目
  "明天中午12点送到办公室", // 时间 + 地点
  "我要一份宫保鸡丁，明天中午12点送到科技园区3号楼5层", // 复杂文本
  "今天晚上6点帮我送一份水煮鱼到家里"
];

console.log("=== 开始复杂NLPService测试 ===");

for (const testText of testTexts) {
  console.log(`\n测试文本: ${testText}`);
  
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
    
    // 测试意图识别
    console.log("开始调用recognizeIntent...");
    const intent = await nlpService.recognizeIntent(testText);
    console.log("意图识别结果:", intent);
    
    const endTime = Date.now();
    console.log(`测试耗时: ${endTime - startTime}ms`);
    
  } catch (error) {
    console.error("测试失败:", error);
    console.error("错误堆栈:", error.stack);
    break;
  }
}

console.log("\n=== 测试完成 ===");
