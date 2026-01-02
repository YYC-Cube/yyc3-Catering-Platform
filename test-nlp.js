#!/usr/bin/env node

/**
 * @file NLP分析功能测试脚本
 * @description 测试AI助手服务的NLP分析功能是否正常工作
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-20
 */

import { createReadStream } from 'fs';
import { Readable } from 'stream';

// 配置
const baseUrl = 'http://localhost:3201';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItMTIzIiwicm9sZSI6InVzZXIiLCJyZXN0YXVyYW50SWQiOiJ0ZXN0LXJlc3RhdXJhbnQtNDU2IiwiaWF0IjoxNzY2Mjg0OTU4LCJleHAiOjE3NjYyODg1NTh9.s-JyupMDJdH4ymXtmOhyB0daQXJAsRt42X2i29aB2sk'; // 生成的测试令牌

// 测试健康检查API
async function testHealthCheck() {
  console.log('=== 测试健康检查API ===');
  
  try {
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP错误! 状态: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('健康检查结果:', JSON.stringify(result, null, 2));
    console.log('健康检查API测试成功!');
    
    return result;
  } catch (error) {
    console.error('健康检查API测试失败:', error);
    return null;
  }
}

// 测试AI助手消息发送
async function testAIMessage() {
  console.log('\n=== 测试AI助手消息发送 ===');
  
  try {
    const response = await fetch(`${baseUrl}/api/v1/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: '我想预订明天晚上6点的一个四人餐桌',
        sessionId: 'test-session-123'
      })
    });
    
    const result = await response.json();
    console.log('AI助手消息响应:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('AI助手消息发送功能测试成功!');
    } else {
      console.log('AI助手消息发送功能测试失败:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('AI助手消息发送功能测试失败:', error);
    return null;
  }
}

// 运行测试
async function runTests() {
  await testHealthCheck();
  await testAIMessage();
}

runTests();
