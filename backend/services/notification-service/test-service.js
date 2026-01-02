/**
 * @file 通知服务测试脚本
 * @description 用于测试通知服务的基本功能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

const axios = require('axios');

// 配置
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3200';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3203';
const TEST_USER_ID = 'test-user-123';

// 测试函数
async function testHealthCheck() {
  console.log('🚀 测试健康检查...');
  try {
    const response = await axios.get(`${NOTIFICATION_SERVICE_URL}/health`);
    if (response.status === 200) {
      console.log('✅ 健康检查通过');
      return true;
    } else {
      console.error('❌ 健康检查失败:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ 健康检查错误:', error.message);
    return false;
  }
}

async function testNotificationService() {
  console.log('\n🚀 测试通知服务API...');
  try {
    // 获取用户通知列表
    console.log('📋 获取用户通知列表...');
    const response = await axios.get(`${API_BASE_URL}/api/notifications/users/${TEST_USER_ID}`, {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    if (response.status === 200) {
      console.log('✅ 获取通知列表成功');
      console.log('📦 通知数量:', response.data.data.length);
      return true;
    } else {
      console.error('❌ 获取通知列表失败:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ 通知服务API错误:', error.message);
    return false;
  }
}

async function testApiGateway() {
  console.log('\n🚀 测试API网关...');
  try {
    // 检查API网关健康状态
    console.log('🔍 检查API网关健康状态...');
    const response = await axios.get(`${API_BASE_URL}/health`);
    
    if (response.status === 200) {
      console.log('✅ API网关健康检查通过');
      return true;
    } else {
      console.error('❌ API网关健康检查失败:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ API网关错误:', error.message);
    return false;
  }
}

// 主测试函数
async function runTests() {
  console.log('🎯 开始测试YYC³通知服务...');
  console.log('======================================');
  
  const results = [];
  results.push(await testHealthCheck());
  results.push(await testApiGateway());
  results.push(await testNotificationService());
  
  console.log('\n======================================');
  console.log('🎯 测试完成!');
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`📊 测试结果: ${passed}/${total} 通过`);
  
  if (passed === total) {
    console.log('🎉 所有测试通过!');
    process.exit(0);
  } else {
    console.log('⚠️  部分测试失败!');
    process.exit(1);
  }
}

// 运行测试
runTests();