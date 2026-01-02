/**
 * @fileoverview YYC³ 密钥管理工具模块
 * @description 提供密钥管理系统的辅助功能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-10
 */

import crypto from 'crypto';

/**
 * 生成唯一的密钥ID
 * @returns {string} 唯一密钥ID
 */
export function generateKeyId(): string {
  return `key_${crypto.randomUUID().replace(/-/g, '')}`;
}

/**
 * 验证密钥算法是否支持
 * @param algorithm 算法名称
 * @param keyType 密钥类型
 * @returns {boolean} 是否支持
 */
export function isValidAlgorithm(algorithm: string, keyType: 'symmetric' | 'asymmetric'): boolean {
  const supportedAlgorithms = {
    symmetric: [
      'aes-128-cbc',
      'aes-192-cbc',
      'aes-256-cbc',
      'aes-128-gcm',
      'aes-192-gcm',
      'aes-256-gcm',
      'sha256',
      'sha384',
      'sha512',
      'HS256',
      'HS384',
      'HS512',
    ],
    asymmetric: [
      'rsa',
      'rsa-sha256',
      'rsa-sha384',
      'rsa-sha512',
      'ES256',
      'ES384',
      'ES512',
      'RS256',
      'RS384',
      'RS512',
      'PS256',
      'PS384',
      'PS512',
    ],
  };

  return supportedAlgorithms[keyType].includes(algorithm);
}

/**
 * 验证密钥长度是否有效
 * @param length 密钥长度
 * @param keyType 密钥类型
 * @returns {boolean} 是否有效
 */
export function isValidKeyLength(length: number, keyType: 'symmetric' | 'asymmetric'): boolean {
  if (keyType === 'symmetric') {
    // 对称密钥长度应该是8的倍数，且在128-256位之间
    return length % 8 === 0 && length >= 128 && length <= 256;
  } else {
    // 非对称密钥长度应该在2048-4096位之间，且是512的倍数
    return length % 512 === 0 && length >= 2048 && length <= 4096;
  }
}

/**
 * 验证密钥用途是否有效
 * @param purpose 密钥用途
 * @returns {boolean} 是否有效
 */
export function isValidKeyPurpose(purpose: string): boolean {
  const validPurposes = [
    'jwt_signing',
    'data_encryption',
    'data_signing',
    'ssl_tls',
    'api_auth',
  ];

  return validPurposes.includes(purpose.toLowerCase());
}

/**
 * 格式化密钥数据以便存储
 * @param key 密钥数据
 * @returns {object} 格式化后的密钥数据
 */
export function formatKeyForStorage(key: any): any {
  const formatted = {
    ...key,
    createdAt: key.createdAt?.toISOString ? key.createdAt.toISOString() : key.createdAt,
    updatedAt: key.updatedAt?.toISOString ? key.updatedAt.toISOString() : key.updatedAt,
    expiresAt: key.expiresAt?.toISOString ? key.expiresAt.toISOString() : key.expiresAt,
  };

  // 移除undefined值
  Object.keys(formatted).forEach(key => {
    if (formatted[key] === undefined) {
      delete formatted[key];
    }
  });

  return formatted;
}

/**
 * 解析密钥数据（从存储中恢复）
 * @param keyData 存储的密钥数据
 * @returns {object} 解析后的密钥数据
 */
export function parseKeyFromStorage(keyData: any): any {
  return {
    ...keyData,
    createdAt: keyData.createdAt ? new Date(keyData.createdAt) : undefined,
    updatedAt: keyData.updatedAt ? new Date(keyData.updatedAt) : undefined,
    expiresAt: keyData.expiresAt ? new Date(keyData.expiresAt) : undefined,
    active: keyData.active === true,
    length: Number(keyData.length) || 0,
    version: Number(keyData.version) || 1,
  };
}

/**
 * 验证JWT令牌（兼容现有系统）
 * @param token JWT令牌
 * @param secret 密钥
 * @param algorithm 算法
 * @returns {object} 解码后的令牌
 */
export function verifyJWT(token: string, secret: string, algorithm: string = 'HS256'): any {
  try {
    const decoded = crypto.createVerify(algorithm)
      .update(token.split('.')[0] + '.' + token.split('.')[1])
      .verify(secret, token.split('.')[2], 'base64');

    return decoded;
  } catch (error) {
    throw new Error('Invalid JWT token');
  }
}

/**
 * 生成JWT签名（兼容现有系统）
 * @param payload JWT负载
 * @param secret 密钥
 * @param algorithm 算法
 * @param expiresIn 过期时间
 * @returns {string} 生成的JWT令牌
 */
export function generateJWT(
  payload: Record<string, any>,
  secret: string,
  algorithm: string = 'HS256',
  expiresIn: string = '1h'
): string {
  // 计算过期时间
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + parseExpiresIn(expiresIn);

  const header = {
    alg: algorithm,
    typ: 'JWT',
  };

  const jwtPayload = {
    ...payload,
    exp: expiresAt,
    iat: now,
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Payload = Buffer.from(JSON.stringify(jwtPayload)).toString('base64url');

  const signature = crypto.createHmac(algorithm.replace('HS', 'sha'), secret)
    .update(`${base64Header}.${base64Payload}`)
    .digest('base64url');

  return `${base64Header}.${base64Payload}.${signature}`;
}

/**
 * 解析过期时间字符串
 * @param expiresIn 过期时间字符串（如 '1h', '2d', '30m'）
 * @returns {number} 过期时间（秒）
 */
export function parseExpiresIn(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error('Invalid expiresIn format');
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 60 * 60 * 24;
    default:
      throw new Error('Invalid expiresIn unit');
  }
}

/**
 * 加密字符串数据
 * @param data 要加密的数据
 * @param key 密钥
 * @param algorithm 算法
 * @returns {object} 加密结果
 */
export function encryptString(
  data: string,
  key: string,
  algorithm: string = 'aes-256-gcm'
): {
  encryptedData: string;
  iv: string;
  authTag?: string;
} {
  const iv = crypto.randomBytes(16);
  const keyBuffer = Buffer.from(key, 'hex');
  const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);

  let encryptedData = cipher.update(data, 'utf8');
  encryptedData = Buffer.concat([encryptedData, cipher.final()]);

  const result = {
    encryptedData: encryptedData.toString('hex'),
    iv: iv.toString('hex'),
  };

  if (algorithm.includes('gcm')) {
    result.authTag = cipher.getAuthTag().toString('hex');
  }

  return result;
}

/**
 * 解密字符串数据
 * @param encryptedData 加密的数据
 * @param key 密钥
 * @param iv 初始化向量
 * @param authTag 认证标签（GCM模式需要）
 * @param algorithm 算法
 * @returns {string} 解密后的字符串
 */
export function decryptString(
  encryptedData: string,
  key: string,
  iv: string,
  authTag?: string,
  algorithm: string = 'aes-256-gcm'
): string {
  const keyBuffer = Buffer.from(key, 'hex');
  const ivBuffer = Buffer.from(iv, 'hex');
  const encryptedBuffer = Buffer.from(encryptedData, 'hex');

  const decipher = crypto.createDecipheriv(algorithm, keyBuffer, ivBuffer);

  if (algorithm.includes('gcm') && authTag) {
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  }

  let decryptedData = decipher.update(encryptedBuffer);
  decryptedData = Buffer.concat([decryptedData, decipher.final()]);

  return decryptedData.toString('utf8');
}

/**
 * 生成随机字符串
 * @param length 字符串长度
 * @returns {string} 随机字符串
 */
export function generateRandomString(length: number = 32): string {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

/**
 * 计算数据的哈希值
 * @param data 要计算哈希的数据
 * @param algorithm 哈希算法
 * @returns {string} 哈希值
 */
export function hashData(data: string | Buffer, algorithm: string = 'sha256'): string {
  const hash = crypto.createHash(algorithm);
  hash.update(data);
  return hash.digest('hex');
}
