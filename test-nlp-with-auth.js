/**
 * @file test-nlp-with-auth.js
 * @description 测试AI助手NLP功能（包含JWT认证）
 * @author YYC³团队
 * @version 1.0.0
 */

import { generateToken } from './backend/services/ai-assistant/src/middleware/auth.js';

const baseUrl = 'http://localhost:3201';

// 测试健康检查API
async function testHealthCheck() {
  console.log('🔍 测试健康检查API...');
  try {
    const response = await fetch(`${baseUrl}/health`);
    const data = await response.json();
    console.log('✅ 健康检查API响应:', data);
    return data.status === 'ok';
  } catch (error) {
    console.error('❌ 健康检查API失败:', error.message);
    return false;
  }
}

// 测试AI助手消息发送API
async function testAIAssistantMessage() {
  console.log('\n🤖 测试AI助手消息发送API...');
  try {
    // 生成JWT令牌
    const token = await generateToken({
      userId: 'test-user-123',
      role: 'admin'
    });
    console.log('🔑 生成JWT令牌成功');

    const message = '我想点一份宫保鸡丁';
    const response = await fetch(`${baseUrl}/api/v1/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: message,
        sessionId: 'test-session-123'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Unknown error',
        status: response.status
      }));
      console.error('❌ AI助手消息发送API失败:', {
        status: response.status,
        error: errorData
      });
      return false;
    }

    const data = await response.json();
    console.log('✅ AI助手消息发送API响应:', data);
    return true;
  } catch (error) {
    console.error('❌ AI助手消息发送API失败:', error.message);
    console.error('📋 错误详细信息:', error);
    return false;
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('🚀 开始运行AI助手NLP测试（包含JWT认证）...\n');

  const healthCheckResult = await testHealthCheck();
  const aiAssistantResult = await testAIAssistantMessage();

  console.log('\n📊 测试结果:');
  console.log(`健康检查API: ${healthCheckResult ? '✅ 通过' : '❌ 失败'}`);
  console.log(`AI助手消息发送API: ${aiAssistantResult ? '✅ 通过' : '❌ 失败'}`);

  if (healthCheckResult && aiAssistantResult) {
    console.log('\n🎉 所有测试通过！');
    process.exit(0);
  } else {
    console.log('\n❌ 部分测试失败！');
    process.exit(1);
  }
}

// 启动测试
runAllTests();