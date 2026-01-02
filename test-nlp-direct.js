#!/usr/bin/env bun

import { NLPService } from './backend/services/ai-assistant/src/services/NLPService.js';

// 创建NLPService实例
const nlpService = new NLPService();

// 测试文本数组
const testTexts = [
  "我要一份宫保鸡丁和米饭",
  "来两瓶啤酒和一份烤肉",
  "我想点一份烤鱼，再加一份蔬菜沙拉",
  "给我来三杯可乐和两个汉堡"
];

// 测试函数
async function runTests() {
  console.log("=== 开始NLPService测试 ===");
  
  for (let i = 0; i < testTexts.length; i++) {
    const testText = testTexts[i];
    console.log(`\n测试 ${i + 1}: ${testText}`);
    
    try {
      const startTime = Date.now();
      
      // 测试实体提取
      const entities = nlpService.extractEntities(testText);
      console.log("实体提取结果:", entities);
      
      // 测试意图识别
      const intent = nlpService.recognizeIntent(testText);
      console.log("意图识别结果:", intent);
      
      const endTime = Date.now();
      console.log(`测试耗时: ${endTime - startTime}ms`);
      
    } catch (error) {
      console.error("测试失败:", error);
      process.exit(1);
    }
  }
  
  console.log("\n=== 所有测试完成 ===");
}

// 运行测试
runTests().catch(error => {
  console.error("测试执行失败:", error);
  process.exit(1);
});
