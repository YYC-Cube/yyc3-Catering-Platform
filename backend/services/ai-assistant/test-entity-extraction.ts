/**
 * @file 测试实体提取功能
 * @description 单独测试NLPService的extractEntities方法
 * @author YYC³团队
 * @version 1.0.0
 * @created 2025-01-30
 */

import { NLPService } from './src/services/NLPService';

async function testEntityExtraction() {
  console.log('=== 测试实体提取功能 ===\n');
  
  // 创建NLPService实例
  const nlpService = new NLPService();
  
  // 测试文本
  const testText = '我要一份宫保鸡丁和米饭';
  console.log(`测试文本：${testText}\n`);
  
  // 测试实体提取
  console.log('开始提取实体...');
  try {
    const entities = await nlpService.extractEntities(testText);
    console.log('提取到的实体：');
    console.log(JSON.stringify(entities, null, 2));
    
    // 测试完整的NLP处理
    console.log('\n开始完整NLP处理...');
    const nlpResult = await nlpService.processText(testText);
    console.log('NLP处理结果：');
    console.log(JSON.stringify(nlpResult, null, 2));
    
    console.log('\n=== 测试完成 ===');
  } catch (error) {
    console.error('测试失败：', error);
  }
}

testEntityExtraction();