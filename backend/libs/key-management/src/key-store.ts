/**
 * @fileoverview YYC³ 密钥存储实现
 * @description 实现密钥的持久化存储，支持多种存储类型
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-10
 */

import { Key, KeyStore, KeyStoreConfig, KeyType, KeyPurpose } from './types';
import Redis from 'ioredis';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

/**
 * Redis密钥存储实现
 */
export class RedisKeyStore implements KeyStore {
  private redisClient: Redis;
  private keyPrefix: string;

  constructor(config: KeyStoreConfig['redis']) {
    if (!config || !config.host) {
      throw new Error('Redis configuration is required');
    }

    this.keyPrefix = config.keyPrefix || 'yyc3-key-management:';
    this.redisClient = new Redis({
      host: config.host,
      port: config.port || 6379,
      password: config.password,
      db: config.db || 0,
    });
  }

  private getRedisKey(keyId: string): string {
    return `${this.keyPrefix}key:${keyId}`;
  }

  private getRedisKeyListKey(): string {
    return `${this.keyPrefix}keys`;
  }

  private getRedisActiveKeyKey(purpose: KeyPurpose, type?: KeyType): string {
    const typePart = type ? `:${type}` : '';
    return `${this.keyPrefix}active:${purpose}${typePart}`;
  }

  async storeKey(key: Omit<Key, 'id' | 'createdAt' | 'updatedAt'>): Promise<Key> {
    const keyId = crypto.randomUUID();
    const now = new Date();
    const newKey: Key = {
      ...key,
      id: keyId,
      createdAt: now,
      updatedAt: now,
    };

    // 保存密钥到Redis
    await this.redisClient.set(this.getRedisKey(keyId), JSON.stringify(newKey));
    // 添加到密钥列表
    await this.redisClient.sadd(this.getRedisKeyListKey(), keyId);
    // 如果是活跃密钥，更新活跃密钥索引
    if (newKey.active) {
      await this.redisClient.set(
        this.getRedisActiveKeyKey(newKey.purpose, newKey.type),
        keyId
      );
    }

    return newKey;
  }

  async getKey(keyId: string): Promise<Key | null> {
    const keyData = await this.redisClient.get(this.getRedisKey(keyId));
    if (!keyData) {
      return null;
    }

    const key = JSON.parse(keyData);
    // 转换日期字符串为Date对象
    return {
      ...key,
      createdAt: new Date(key.createdAt),
      updatedAt: new Date(key.updatedAt),
      expiresAt: key.expiresAt ? new Date(key.expiresAt) : undefined,
    };
  }

  async getActiveKey(purpose: KeyPurpose, type?: KeyType): Promise<Key | null> {
    const keyId = await this.redisClient.get(this.getRedisActiveKeyKey(purpose, type));
    if (!keyId) {
      return null;
    }

    return this.getKey(keyId);
  }

  async getKeyHistory(keyId: string): Promise<Key[]> {
    // Redis实现中，历史版本存储在keyId:history集合中
    const historyIds = await this.redisClient.smembers(`${this.getRedisKey(keyId)}:history`);
    const keys: Key[] = [];

    for (const historyId of historyIds) {
      const keyData = await this.redisClient.get(`${this.getRedisKey(keyId)}:${historyId}`);
      if (keyData) {
        const key = JSON.parse(keyData);
        keys.push({
          ...key,
          createdAt: new Date(key.createdAt),
          updatedAt: new Date(key.updatedAt),
          expiresAt: key.expiresAt ? new Date(key.expiresAt) : undefined,
        });
      }
    }

    return keys;
  }

  async updateKey(keyId: string, updates: Partial<Key>): Promise<Key> {
    const existingKey = await this.getKey(keyId);
    if (!existingKey) {
      throw new Error(`Key with id ${keyId} not found`);
    }

    // 创建历史版本
    await this.redisClient.sadd(
      `${this.getRedisKey(keyId)}:history`,
      existingKey.version.toString()
    );
    await this.redisClient.set(
      `${this.getRedisKey(keyId)}:${existingKey.version}`,
      JSON.stringify(existingKey)
    );

    // 更新密钥
    const updatedKey: Key = {
      ...existingKey,
      ...updates,
      updatedAt: new Date(),
      version: existingKey.version + 1,
    };

    await this.redisClient.set(this.getRedisKey(keyId), JSON.stringify(updatedKey));

    // 如果密钥被激活，更新活跃密钥索引
    if (updatedKey.active) {
      await this.redisClient.set(
        this.getRedisActiveKeyKey(updatedKey.purpose, updatedKey.type),
        keyId
      );
    }

    return updatedKey;
  }

  async deleteKey(keyId: string): Promise<boolean> {
    const key = await this.getKey(keyId);
    if (!key) {
      return false;
    }

    // 从Redis中删除密钥
    await this.redisClient.del(this.getRedisKey(keyId));
    // 从密钥列表中移除
    await this.redisClient.srem(this.getRedisKeyListKey(), keyId);
    // 如果是活跃密钥，更新活跃密钥索引
    const activeKeyId = await this.redisClient.get(
      this.getRedisActiveKeyKey(key.purpose, key.type)
    );
    if (activeKeyId === keyId) {
      await this.redisClient.del(this.getRedisActiveKeyKey(key.purpose, key.type));
    }

    return true;
  }

  async listKeys(options?: {
    purpose?: KeyPurpose;
    type?: KeyType;
    active?: boolean;
  }): Promise<Key[]> {
    const keyIds = await this.redisClient.smembers(this.getRedisKeyListKey());
    const keys: Key[] = [];

    for (const keyId of keyIds) {
      const key = await this.getKey(keyId);
      if (key) {
        // 应用过滤条件
        if (options) {
          if (options.purpose && key.purpose !== options.purpose) {
            continue;
          }
          if (options.type && key.type !== options.type) {
            continue;
          }
          if (options.active !== undefined && key.active !== options.active) {
            continue;
          }
        }
        keys.push(key);
      }
    }

    return keys;
  }

  async backupKeys(): Promise<string> {
    const keys = await this.listKeys();
    const backupData = {
      timestamp: new Date().toISOString(),
      keys,
    };
    const backupString = JSON.stringify(backupData);
    const backupKey = `${this.keyPrefix}backup:${Date.now()}`;

    await this.redisClient.set(backupKey, backupString);
    return backupKey;
  }

  async restoreKeys(backupPath: string): Promise<void> {
    const backupData = await this.redisClient.get(backupPath);
    if (!backupData) {
      throw new Error(`Backup not found at ${backupPath}`);
    }

    const { keys } = JSON.parse(backupData);

    for (const key of keys) {
      // 转换日期字符串为Date对象
      const restoredKey: Key = {
        ...key,
        createdAt: new Date(key.createdAt),
        updatedAt: new Date(key.updatedAt),
        expiresAt: key.expiresAt ? new Date(key.expiresAt) : undefined,
      };

      await this.redisClient.set(this.getRedisKey(key.id), JSON.stringify(restoredKey));
      await this.redisClient.sadd(this.getRedisKeyListKey(), key.id);

      if (restoredKey.active) {
        await this.redisClient.set(
          this.getRedisActiveKeyKey(restoredKey.purpose, restoredKey.type),
          key.id
        );
      }
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.redisClient.ping();
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * 本地文件密钥存储实现
 */
export class LocalFileKeyStore implements KeyStore {
  private filePath: string;
  private keys: Map<string, Key>;
  private activeKeys: Map<string, string>; // 用途 -> 密钥ID

  constructor(config: KeyStoreConfig['local']) {
    if (!config || !config.filePath) {
      throw new Error('Local file configuration is required');
    }

    this.filePath = config.filePath;
    this.keys = new Map();
    this.activeKeys = new Map();
    
    // 初始化时加载密钥
    this.loadKeys();
  }

  private getActiveKeyMapKey(purpose: KeyPurpose, type?: KeyType): string {
    return type ? `${purpose}:${type}` : purpose;
  }

  private async loadKeys(): Promise<void> {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      const parsed = JSON.parse(data);
      this.keys = new Map(Object.entries(parsed.keys || {}));
      this.activeKeys = new Map(Object.entries(parsed.activeKeys || {}));
    } catch (error) {
      // 如果文件不存在，初始化空存储
      this.keys = new Map();
      this.activeKeys = new Map();
      await this.saveKeys();
    }
  }

  private async saveKeys(): Promise<void> {
    const data = {
      keys: Object.fromEntries(this.keys),
      activeKeys: Object.fromEntries(this.activeKeys),
      lastUpdated: new Date().toISOString(),
    };
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  async storeKey(key: Omit<Key, 'id' | 'createdAt' | 'updatedAt'>): Promise<Key> {
    const keyId = crypto.randomUUID();
    const now = new Date();
    const newKey: Key = {
      ...key,
      id: keyId,
      createdAt: now,
      updatedAt: now,
    };

    // 保存密钥
    this.keys.set(keyId, newKey);
    // 如果是活跃密钥，更新活跃密钥索引
    if (newKey.active) {
      this.activeKeys.set(
        this.getActiveKeyMapKey(newKey.purpose, newKey.type),
        keyId
      );
    }

    await this.saveKeys();
    return newKey;
  }

  async getKey(keyId: string): Promise<Key | null> {
    const key = this.keys.get(keyId);
    return key || null;
  }

  async getActiveKey(purpose: KeyPurpose, type?: KeyType): Promise<Key | null> {
    const keyId = this.activeKeys.get(this.getActiveKeyMapKey(purpose, type));
    if (!keyId) {
      return null;
    }
    return this.keys.get(keyId) || null;
  }

  async getKeyHistory(keyId: string): Promise<Key[]> {
    // 本地存储不支持历史版本
    const key = this.keys.get(keyId);
    return key ? [key] : [];
  }

  async updateKey(keyId: string, updates: Partial<Key>): Promise<Key> {
    const existingKey = this.keys.get(keyId);
    if (!existingKey) {
      throw new Error(`Key with id ${keyId} not found`);
    }

    // 更新密钥
    const updatedKey: Key = {
      ...existingKey,
      ...updates,
      updatedAt: new Date(),
      version: existingKey.version + 1,
    };

    this.keys.set(keyId, updatedKey);

    // 如果密钥被激活，更新活跃密钥索引
    if (updatedKey.active) {
      this.activeKeys.set(
        this.getActiveKeyMapKey(updatedKey.purpose, updatedKey.type),
        keyId
      );
    }

    await this.saveKeys();
    return updatedKey;
  }

  async deleteKey(keyId: string): Promise<boolean> {
    const key = this.keys.get(keyId);
    if (!key) {
      return false;
    }

    // 删除密钥
    this.keys.delete(keyId);
    // 从活跃密钥索引中移除
    this.activeKeys.delete(this.getActiveKeyMapKey(key.purpose, key.type));

    await this.saveKeys();
    return true;
  }

  async listKeys(options?: {
    purpose?: KeyPurpose;
    type?: KeyType;
    active?: boolean;
  }): Promise<Key[]> {
    const keys = Array.from(this.keys.values());
    return keys.filter(key => {
      if (options) {
        if (options.purpose && key.purpose !== options.purpose) {
          return false;
        }
        if (options.type && key.type !== options.type) {
          return false;
        }
        if (options.active !== undefined && key.active !== options.active) {
          return false;
        }
      }
      return true;
    });
  }

  async backupKeys(): Promise<string> {
    const backupPath = `${this.filePath}.backup.${Date.now()}`;
    await fs.copyFile(this.filePath, backupPath);
    return backupPath;
  }

  async restoreKeys(backupPath: string): Promise<void> {
    try {
      const data = await fs.readFile(backupPath, 'utf8');
      const parsed = JSON.parse(data);
      this.keys = new Map(Object.entries(parsed.keys || {}));
      this.activeKeys = new Map(Object.entries(parsed.activeKeys || {}));
      await this.saveKeys();
    } catch (error) {
      throw new Error(`Failed to restore keys from ${backupPath}: ${error.message}`);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await fs.access(this.filePath, fs.constants.R_OK | fs.constants.W_OK);
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * 密钥存储工厂
 */
export class KeyStoreFactory {
  static createKeyStore(config: KeyStoreConfig): KeyStore {
    switch (config.type) {
      case 'redis':
        return new RedisKeyStore(config.redis);
      case 'local':
        return new LocalFileKeyStore(config.local);
      case 'aws_kms':
        throw new Error('AWS KMS key store is not implemented yet');
      case 'hashicorp_vault':
        throw new Error('HashiCorp Vault key store is not implemented yet');
      default:
        throw new Error(`Unsupported key store type: ${config.type}`);
    }
  }
}
