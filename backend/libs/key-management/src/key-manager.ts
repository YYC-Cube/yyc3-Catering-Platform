/**
 * @fileoverview YYC³ 密钥管理器实现
 * @description 提供密钥生成、轮换、加密解密等核心功能
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-10
 */

import { KeyManager, KeyManagerConfig, Key, KeyType, KeyPurpose, KeyRotationOptions, EncryptionOptions, DecryptionOptions } from './types';
import { KeyStore, KeyStoreFactory } from './key-store';
import crypto from 'crypto';
import { scheduleJob } from 'node-schedule';

/**
 * 密钥管理器实现
 */
export class KeyManagerImpl implements KeyManager {
  private config: KeyManagerConfig;
  private keyStore: KeyStore;
  private rotationSchedule?: any;
  private backupSchedule?: any;
  private healthCheckSchedule?: any;

  constructor(config: KeyManagerConfig) {
    this.config = config;
    this.keyStore = KeyStoreFactory.createKeyStore(config.keyStore);
  }

  /**
   * 初始化密钥管理器
   */
  async initialize(): Promise<void> {
    // 检查密钥存储是否健康
    const isHealthy = await this.keyStore.healthCheck();
    if (!isHealthy) {
      throw new Error('Key store is not healthy');
    }

    // 生成默认JWT密钥（如果不存在）
    await this.ensureDefaultKeys();

    // 启动自动轮换任务
    if (this.config.autoRotationEnabled) {
      this.startAutoRotation();
    }

    // 启动自动备份任务
    if (this.config.backupStrategy.enabled) {
      this.startAutoBackup();
    }

    // 启动健康检查任务
    if (this.config.highAvailability.enabled) {
      this.startHealthCheck();
    }
  }

  /**
   * 确保默认密钥存在
   */
  private async ensureDefaultKeys(): Promise<void> {
    // 检查JWT签名密钥是否存在
    const jwtSigningKey = await this.keyStore.getActiveKey(KeyPurpose.JWT_SIGNING, KeyType.SYMMETRIC);
    if (!jwtSigningKey) {
      console.log('Generating default JWT signing key...');
      await this.generateKey({
        type: KeyType.SYMMETRIC,
        purpose: KeyPurpose.JWT_SIGNING,
        length: 256,
        algorithm: 'HS256',
        expiresInDays: this.config.defaultExpirationDays,
      });
    }

    // 检查数据加密密钥是否存在
    const dataEncryptionKey = await this.keyStore.getActiveKey(KeyPurpose.DATA_ENCRYPTION, KeyType.SYMMETRIC);
    if (!dataEncryptionKey) {
      console.log('Generating default data encryption key...');
      await this.generateKey({
        type: KeyType.SYMMETRIC,
        purpose: KeyPurpose.DATA_ENCRYPTION,
        length: 256,
        algorithm: 'aes-256-gcm',
        expiresInDays: this.config.defaultExpirationDays,
      });
    }
  }

  /**
   * 生成密钥
   */
  async generateKey(options: {
    type: KeyType;
    purpose: KeyPurpose;
    length?: number;
    algorithm?: string;
    expiresInDays?: number;
  }): Promise<Key> {
    const { type, purpose, length = 256, algorithm, expiresInDays } = options;
    let keyValue: string;

    switch (type) {
      case KeyType.SYMMETRIC:
        // 生成对称密钥
        keyValue = crypto.randomBytes(length / 8).toString('hex');
        break;
      case KeyType.PUBLIC:
      case KeyType.PRIVATE:
        // 生成非对称密钥对
        const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
          modulusLength: length,
          publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
          },
          privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
          },
        });

        // 存储私钥
        if (type === KeyType.PRIVATE) {
          keyValue = privateKey;
        } else {
          keyValue = publicKey;
        }
        break;
      default:
        throw new Error(`Unsupported key type: ${type}`);
    }

    // 设置过期时间
    let expiresAt: Date | undefined;
    if (expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }

    // 存储密钥
    return this.keyStore.storeKey({
      value: keyValue,
      type,
      purpose,
      expiresAt,
      active: true,
      version: 1,
      algorithm,
      length,
    });
  }

  /**
   * 存储密钥
   */
  async storeKey(key: Omit<Key, 'id' | 'createdAt' | 'updatedAt'>): Promise<Key> {
    return this.keyStore.storeKey(key);
  }

  /**
   * 获取密钥
   */
  async getKey(keyId: string): Promise<Key | null> {
    return this.keyStore.getKey(keyId);
  }

  /**
   * 获取当前活跃密钥
   */
  async getActiveKey(purpose: KeyPurpose, type?: KeyType): Promise<Key | null> {
    return this.keyStore.getActiveKey(purpose, type);
  }

  /**
   * 轮换密钥
   */
  async rotateKey(options: KeyRotationOptions): Promise<{ oldKey: Key; newKey: Key }> {
    const { keyId, purpose, newKeyLength = 256, newAlgorithm, activateImmediately = true } = options;

    let oldKey: Key;

    if (keyId) {
      // 按密钥ID轮换
      oldKey = await this.keyStore.getKey(keyId);
      if (!oldKey) {
        throw new Error(`Key with id ${keyId} not found`);
      }
    } else if (purpose) {
      // 按用途轮换活跃密钥
      oldKey = await this.keyStore.getActiveKey(purpose);
      if (!oldKey) {
        throw new Error(`Active key for purpose ${purpose} not found`);
      }
    } else {
      throw new Error('Either keyId or purpose must be provided');
    }

    // 生成新密钥
    const newKey = await this.generateKey({
      type: oldKey.type,
      purpose: oldKey.purpose,
      length: newKeyLength,
      algorithm: newAlgorithm || oldKey.algorithm,
      expiresInDays: this.config.defaultExpirationDays,
    });

    // 停用旧密钥
    await this.keyStore.updateKey(oldKey.id, { active: false });

    // 如果需要立即激活新密钥
    if (activateImmediately) {
      await this.keyStore.updateKey(newKey.id, { active: true });
    }

    return { oldKey, newKey };
  }

  /**
   * 加密数据
   */
  async encrypt(data: string | Buffer, options?: EncryptionOptions): Promise<{
    encryptedData: Buffer;
    iv: Buffer;
    authTag?: Buffer;
    keyId: string;
  }> {
    // 获取加密密钥
    const key = options?.keyId 
      ? await this.keyStore.getKey(options.keyId)
      : await this.keyStore.getActiveKey(KeyPurpose.DATA_ENCRYPTION, KeyType.SYMMETRIC);

    if (!key) {
      throw new Error('Encryption key not found');
    }

    const algorithm = options?.algorithm || key.algorithm || 'aes-256-gcm';
    const iv = options?.iv || crypto.randomBytes(16);

    let encryptedData: Buffer;
    let authTag: Buffer | undefined;

    if (algorithm.includes('gcm')) {
      // 使用GCM模式（带认证标签）
      const cipher = crypto.createCipheriv(algorithm, Buffer.from(key.value, 'hex'), iv);
      encryptedData = Buffer.concat([cipher.update(data), cipher.final()]);
      authTag = cipher.getAuthTag();
    } else {
      // 使用其他模式
      const cipher = crypto.createCipheriv(algorithm, Buffer.from(key.value, 'hex'), iv);
      encryptedData = Buffer.concat([cipher.update(data), cipher.final()]);
    }

    return {
      encryptedData,
      iv,
      authTag,
      keyId: key.id,
    };
  }

  /**
   * 解密数据
   */
  async decrypt(encryptedData: Buffer, options: DecryptionOptions): Promise<Buffer> {
    // 获取解密密钥
    const key = options?.keyId 
      ? await this.keyStore.getKey(options.keyId)
      : await this.keyStore.getActiveKey(KeyPurpose.DATA_ENCRYPTION, KeyType.SYMMETRIC);

    if (!key) {
      throw new Error('Decryption key not found');
    }

    const algorithm = options?.algorithm || key.algorithm || 'aes-256-gcm';

    let decryptedData: Buffer;

    if (algorithm.includes('gcm')) {
      // 使用GCM模式（带认证标签）
      if (!options.authTag) {
        throw new Error('Auth tag is required for GCM mode');
      }

      const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key.value, 'hex'), options.iv);
      decipher.setAuthTag(options.authTag);
      decryptedData = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    } else {
      // 使用其他模式
      const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key.value, 'hex'), options.iv);
      decryptedData = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    }

    return decryptedData;
  }

  /**
   * 签名数据
   */
  async sign(data: string | Buffer, options?: {
    keyId?: string;
    algorithm?: string;
  }): Promise<{
    signature: Buffer;
    keyId: string;
  }> {
    // 获取签名密钥
    const key = options?.keyId 
      ? await this.keyStore.getKey(options.keyId)
      : await this.keyStore.getActiveKey(KeyPurpose.JWT_SIGNING, KeyType.SYMMETRIC);

    if (!key) {
      throw new Error('Signing key not found');
    }

    const algorithm = options?.algorithm || key.algorithm || 'sha256';
    const hmac = crypto.createHmac(algorithm, key.value);
    hmac.update(data);
    const signature = hmac.digest();

    return {
      signature,
      keyId: key.id,
    };
  }

  /**
   * 验证签名
   */
  async verify(
    data: string | Buffer,
    signature: Buffer,
    options?: {
      keyId?: string;
      algorithm?: string;
    }
  ): Promise<boolean> {
    // 获取验证密钥
    const key = options?.keyId 
      ? await this.keyStore.getKey(options.keyId)
      : await this.keyStore.getActiveKey(KeyPurpose.JWT_SIGNING, KeyType.SYMMETRIC);

    if (!key) {
      throw new Error('Verification key not found');
    }

    const algorithm = options?.algorithm || key.algorithm || 'sha256';
    const hmac = crypto.createHmac(algorithm, key.value);
    hmac.update(data);
    const expectedSignature = hmac.digest();

    return crypto.timingSafeEqual(signature, expectedSignature);
  }

  /**
   * 自动轮换所有需要轮换的密钥
   */
  async autoRotateKeys(): Promise<void> {
    console.log('Starting auto rotation of keys...');

    // 获取所有活跃密钥
    const activeKeys = await this.keyStore.listKeys({ active: true });

    for (const key of activeKeys) {
      // 检查密钥是否需要轮换（接近过期）
      if (key.expiresAt) {
        const daysUntilExpiration = Math.ceil((key.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        // 如果密钥将在7天内过期，进行轮换
        if (daysUntilExpiration <= 7) {
          console.log(`Rotating key ${key.id} (${key.purpose}) - expires in ${daysUntilExpiration} days`);
          try {
            await this.rotateKey({ keyId: key.id });
            console.log(`Successfully rotated key ${key.id}`);
          } catch (error) {
            console.error(`Failed to rotate key ${key.id}:`, error);
          }
        }
      }
    }

    console.log('Auto rotation of keys completed');
  }

  /**
   * 自动备份密钥
   */
  async autoBackupKeys(): Promise<void> {
    console.log('Starting auto backup of keys...');

    try {
      const backupKey = await this.keyStore.backupKeys();
      console.log(`Successfully backed up keys to ${backupKey}`);
    } catch (error) {
      console.error('Failed to backup keys:', error);
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    return this.keyStore.healthCheck();
  }

  /**
   * 备份所有密钥
   */
  async backupKeys(): Promise<string> {
    return this.keyStore.backupKeys();
  }

  /**
   * 恢复密钥
   */
  async restoreKeys(backupPath: string): Promise<void> {
    return this.keyStore.restoreKeys(backupPath);
  }

  /**
   * 启动自动轮换任务
   */
  private startAutoRotation(): void {
    console.log(`Starting auto rotation job - runs every ${this.config.rotationIntervalDays} days`);
    
    // 每天检查一次，是否有需要轮换的密钥
    this.rotationSchedule = scheduleJob('0 0 * * *', async () => {
      await this.autoRotateKeys();
    });
  }

  /**
   * 启动自动备份任务
   */
  private startAutoBackup(): void {
    console.log(`Starting auto backup job - runs every ${this.config.backupStrategy.intervalDays} days`);
    
    // 每天备份一次
    this.backupSchedule = scheduleJob('0 1 * * *', async () => {
      await this.autoBackupKeys();
    });
  }

  /**
   * 启动健康检查任务
   */
  private startHealthCheck(): void {
    console.log(`Starting health check job - runs every ${this.config.highAvailability.healthCheckInterval}ms`);
    
    // 定期检查密钥存储健康状态
    this.healthCheckSchedule = setInterval(async () => {
      const isHealthy = await this.keyStore.healthCheck();
      if (!isHealthy) {
        console.error('Key store health check failed!');
        // TODO: 添加告警机制
      }
    }, this.config.highAvailability.healthCheckInterval);
  }

  /**
   * 关闭密钥管理器
   */
  shutdown(): void {
    // 取消所有调度任务
    if (this.rotationSchedule) {
      this.rotationSchedule.cancel();
    }
    if (this.backupSchedule) {
      this.backupSchedule.cancel();
    }
    if (this.healthCheckSchedule) {
      clearInterval(this.healthCheckSchedule);
    }
  }
}

/**
 * 密钥管理器工厂
 */
export class KeyManagerFactory {
  static createKeyManager(config: KeyManagerConfig): KeyManager {
    return new KeyManagerImpl(config);
  }
}
