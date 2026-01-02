/**
 * @file 数据传输加密中间件
 * @description 实现API网关和服务之间的数据传输加密
 * @module middleware/encryption
 * @author YYC³团队
 * @version 1.0.0
 * @created 2025-01-30
 */

import { Request, Response, NextFunction } from 'express';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { logger } from '../utils/logger';
import { KeyManagerFactory } from '@yyc3/key-management';
import { EncryptionConfig } from '../types/gateway';

/**
 * 数据传输加密中间件类
 */
export class EncryptionMiddleware {
  private encryptionKey: Buffer | null = null;
  private ivLength = 16;
  private algorithm = 'aes-256-gcm';

  constructor(private config: EncryptionConfig) {
    this.initializeEncryption();
  }

  /**
   * 初始化加密系统
   */
  private async initializeEncryption(): Promise<void> {
    try {
      // 使用密钥管理器获取加密密钥
      const keyManager = KeyManagerFactory.createKeyManager({
        storage: {
          type: 'local',
          path: this.config.keyStorePath || './encryption-keys.json'
        },
        defaultExpiration: this.config.keyExpiration || 90 * 24 * 60 * 60 * 1000, // 90天
        autoRotation: this.config.autoRotate || true,
        rotationInterval: this.config.rotationInterval || 30 * 24 * 60 * 60 * 1000, // 30天
        backupStrategy: this.config.backupStrategy || 'keep_last_7_days'
      });

      await keyManager.initialize();
      const key = await keyManager.getKey('transport-encryption-key');
      this.encryptionKey = Buffer.from(key, 'hex');

      logger.info('Encryption middleware initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize encryption middleware:', error);
      throw new Error('Encryption middleware initialization failed');
    }
  }

  /**
   * 加密响应数据
   */
  encryptResponse = (req: Request, res: Response, next: NextFunction): void => {
    // 检查加密是否启用
    if (!this.config.enabled) {
      return next();
    }

    // 保存原始的json方法
    const originalJson = res.json.bind(res);

    res.json = (body: any): Response => {
      try {
        if (!this.encryptionKey) {
          logger.error('Encryption key not initialized');
          return originalJson(body);
        }

        // 检查是否需要加密
        if (!this.shouldEncryptResponse(req.path)) {
          return originalJson(body);
        }

        // 生成IV
        const iv = randomBytes(this.ivLength);

        // 创建加密器
        const cipher = createCipheriv(this.algorithm, this.encryptionKey, iv);

        // 加密数据
        const jsonBody = JSON.stringify(body);
        const encrypted = Buffer.concat([
          cipher.update(jsonBody, 'utf8'),
          cipher.final()
        ]);

        // 获取认证标签
        const authTag = cipher.getAuthTag();

        // 组合加密数据
        const encryptedData = Buffer.concat([iv, authTag, encrypted]);

        // 设置加密响应头
        res.set('X-Encrypted', 'true');
        res.set('Content-Type', 'application/octet-stream');

        // 返回加密数据
        return res.send(encryptedData);
      } catch (error) {
        logger.error('Failed to encrypt response:', error);
        // 加密失败时返回原始数据
        return originalJson(body);
      }
    };

    next();
  };

  /**
   * 解密请求数据
   */
  decryptRequest = (req: Request, res: Response, next: NextFunction): void => {
    // 检查加密是否启用
    if (!this.config.enabled) {
      return next();
    }

    // 检查是否是加密请求
    if (req.get('X-Encrypted') !== 'true') {
      return next();
    }

    // 读取请求数据
    let data = Buffer.from('');
    req.on('data', (chunk: Buffer) => {
      data = Buffer.concat([data, chunk]);
    });

    req.on('end', async () => {
      try {
        if (!this.encryptionKey) {
          logger.error('Encryption key not initialized');
          return this.sendDecryptionError(res);
        }

        // 解析IV、认证标签和加密数据
        const iv = data.subarray(0, this.ivLength);
        const authTag = data.subarray(this.ivLength, this.ivLength + 16);
        const encryptedData = data.subarray(this.ivLength + 16);

        // 创建解密器
        const decipher = createDecipheriv(this.algorithm, this.encryptionKey, iv);
        decipher.setAuthTag(authTag);

        // 解密数据
        const decrypted = Buffer.concat([
          decipher.update(encryptedData),
          decipher.final()
        ]);

        // 解析JSON数据
        const jsonBody = JSON.parse(decrypted.toString('utf8'));

        // 更新请求体
        req.body = jsonBody;
        req.rawBody = jsonBody;

        next();
      } catch (error) {
        logger.error('Failed to decrypt request:', error);
        this.sendDecryptionError(res);
      }
    });
  };

  /**
   * 检查响应是否需要加密
   */
  private shouldEncryptResponse(path: string): boolean {
    // 检查排除路径
    if (this.config.excludedPaths && this.config.excludedPaths.includes(path)) {
      return false;
    }

    // 检查包含路径（如果配置了）
    if (this.config.includedPaths && this.config.includedPaths.length > 0) {
      return this.config.includedPaths.some(pattern => path.startsWith(pattern));
    }

    // 默认加密所有请求
    return true;
  }

  /**
   * 发送解密错误响应
   */
  private sendDecryptionError(res: Response): void {
    res.status(400).json({
      success: false,
      error: 'Invalid encrypted data',
      code: 'DECRYPTION_FAILED',
      message: 'Failed to decrypt request data',
      timestamp: new Date().toISOString()
    });
  }
}
