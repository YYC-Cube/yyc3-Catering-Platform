/**
 * @file 生成测试JWT令牌
 * @description 用于生成测试用的JWT令牌
 * @author YYC
 * @version 1.0.0
 * @created 2024-12-20
 */

import { createHmac } from 'crypto';

// 使用与auth.ts相同的密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-me-in-production';
const JWT_ALGORITHM = 'HS256';

/**
 * 生成测试JWT令牌
 * @param payload 令牌有效载荷
 * @param expiresIn 过期时间 (默认1小时)
 * @returns JWT令牌字符串
 */
function generateTestToken(payload, expiresIn = '1h') {
  const now = Math.floor(Date.now() / 1000);
  let expiresInSeconds;

  // 解析过期时间
  const timeUnit = expiresIn.slice(-1);
  const timeValue = parseInt(expiresIn.slice(0, -1), 10);

  switch (timeUnit) {
    case 's':
      expiresInSeconds = timeValue;
      break;
    case 'm':
      expiresInSeconds = timeValue * 60;
      break;
    case 'h':
      expiresInSeconds = timeValue * 3600;
      break;
    case 'd':
      expiresInSeconds = timeValue * 86400;
      break;
    default:
      expiresInSeconds = 3600; // 默认1小时
  }

  const jwtPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds
  };

  // 生成JWT
  const header = Buffer.from(JSON.stringify({ alg: JWT_ALGORITHM, typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(jwtPayload)).toString('base64url');
  const signature = createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

// 生成测试令牌
const testPayload = {
  userId: 'test-user-123',
  role: 'user',
  restaurantId: 'test-restaurant-456'
};

const token = generateTestToken(testPayload);
console.log('=== 测试JWT令牌生成 ===');
console.log('测试有效载荷:', JSON.stringify(testPayload, null, 2));
console.log('生成的令牌:', token);
console.log('\n使用此令牌作为Authorization头的值 (Bearer <token>)');