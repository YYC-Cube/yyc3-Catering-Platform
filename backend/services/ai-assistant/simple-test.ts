/**
 * 简单测试脚本 - 测试NLPService的实体提取功能
 */
import { NLPService } from './src/services/NLPService';

async function testEntityExtraction() {
  console.log('=== 简单实体提取测试 ===');
  
  const nlpService = new NLPService();
  const testText = '我要一份宫保鸡丁和米饭';
  
  console.log(`测试文本: ${testText}`);
  
  try {
    // 只测试food_item实体提取
    const foodItemPattern = /(红烧肉|清蒸鱼|宫保鸡丁|麻婆豆腐|鱼香肉丝|水煮鱼|糖醋里脊|烤鸭|火锅|面条|米饭|饺子|包子)/gi;
    
    console.log('直接使用正则表达式测试:');
    let match;
    const matches = [];
    
    // 重置lastIndex
    foodItemPattern.lastIndex = 0;
    
    // 使用exec()查找所有匹配项
    while ((match = foodItemPattern.exec(testText)) !== null) {
      matches.push({
        value: match[0],
        index: match.index
      });
      
      // 防止无限循环
      if (match.index === foodItemPattern.lastIndex) {
        foodItemPattern.lastIndex++;
      }
    }
    
    console.log('匹配结果:', matches);
    
    console.log('\n使用NLPService测试:');
    const entities = await nlpService.extractEntities(testText);
    console.log('实体提取结果:', entities);
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testEntityExtraction();
