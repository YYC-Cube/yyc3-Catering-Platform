#!/usr/bin/env bun

// 直接测试食物项目正则表达式
const testText = "我要宫保鸡丁";

// 定义food_item正则表达式 - 和NLPService中的一样
const foodItemRegex = /(红烧肉|清蒸鱼|宫保鸡丁|麻婆豆腐|鱼香肉丝|水煮鱼|糖醋里脊|烤鸭|火锅|面条|米饭|饺子|包子)/gi;

console.log("=== 开始正则表达式测试 ===");
console.log(`测试文本: ${testText}`);
console.log(`正则表达式: ${foodItemRegex}`);
console.log(`正则表达式是否全局: ${foodItemRegex.global}`);

// 测试1: 使用match()方法
console.log("\n测试1: 使用match()方法");
try {
  const matches1 = testText.match(foodItemRegex);
  console.log(`match()结果: ${matches1}`);
} catch (error) {
  console.error("match()出错:", error);
}

// 测试2: 使用exec()方法 - 重置lastIndex
console.log("\n测试2: 使用exec()方法");
try {
  foodItemRegex.lastIndex = 0;
  let match2;
  let count = 0;
  const maxIterations = 10;
  
  while ((match2 = foodItemRegex.exec(testText)) !== null && count < maxIterations) {
    console.log(`exec()匹配: ${match2[0]}, 索引: ${match2.index}, lastIndex: ${foodItemRegex.lastIndex}`);
    count++;
    
    // 防止无限循环
    if (match2.index === foodItemRegex.lastIndex) {
      foodItemRegex.lastIndex++;
      console.log(`手动推进lastIndex到: ${foodItemRegex.lastIndex}`);
    }
  }
  
  if (count >= maxIterations) {
    console.log("警告: 达到最大迭代次数，可能存在无限循环");
  }
} catch (error) {
  console.error("exec()出错:", error);
}

// 测试3: 使用matchAll()方法
console.log("\n测试3: 使用matchAll()方法");
try {
  foodItemRegex.lastIndex = 0;
  const matches3 = [...testText.matchAll(foodItemRegex)];
  console.log(`matchAll()结果数量: ${matches3.length}`);
  matches3.forEach((match, index) => {
    console.log(`matchAll()第${index+1}个匹配: ${match[0]}, 索引: ${match.index}`);
  });
} catch (error) {
  console.error("matchAll()出错:", error);
}

console.log("\n=== 测试完成 ===");
