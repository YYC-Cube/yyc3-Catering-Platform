/**
 * @file 生成JWT令牌脚本
 * @description 用于测试决策支持API的临时脚本
 * @author YYC³
 */

import { createSecretKey } from 'crypto';
import { SignJWT } from 'jose';

// JWT配置
// SECURITY: Read JWT_SECRET from environment variable
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('ERROR: JWT_SECRET environment variable must be set with at least 32 characters');
  console.error('Usage: JWT_SECRET=your-secret-key node generate-token.js');
  process.exit(1);
}
const JWT_EXPIRATION = '1h';
const JWT_ALGORITHM = 'HS256';

/**
 * 生成JWT令牌
 */
async function generateToken() {
  const secretKey = createSecretKey(JWT_SECRET, 'utf-8');
  const now = Math.floor(Date.now() / 1000);
  let expiresIn = 3600; // 默认1小时

  // 解析过期时间
  const timeUnit = JWT_EXPIRATION.slice(-1);
  const timeValue = parseInt(JWT_EXPIRATION.slice(0, -1), 10);

  switch (timeUnit) {
    case 's':
      expiresIn = timeValue;
      break;
    case 'm':
      expiresIn = timeValue * 60;
      break;
    case 'h':
      expiresIn = timeValue * 3600;
      break;
    case 'd':
      expiresIn = timeValue * 86400;
      break;
  }

  // 测试用的payload
  const payload = {
    userId: 'test-user-123',
    role: 'admin', // 使用管理员角色以确保权限
    restaurantId: 'test-restaurant-123'
  };

  const token = await new SignJWT({
    ...payload,
    iat: now,
    exp: now + expiresIn
  })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .sign(secretKey);

  console.log('Generated JWT Token:');
  console.log(token);
  console.log('\nUse this token in the Authorization header as:');
  console.log(`Bearer ${token}`);
  
  return token;
}

// 执行脚本
generateToken().catch(console.error);