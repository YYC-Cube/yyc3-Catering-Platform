/**
 * @fileoverview YYC³ 密钥管理系统类型定义
 * @description 定义密钥管理系统的接口和类型
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-10
 */

export interface Key {
  /** 密钥ID */
  id: string;
  /** 密钥值 */
  value: string;
  /** 密钥类型 */
  type: KeyType;
  /** 密钥用途 */
  purpose: KeyPurpose;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
  /** 过期时间 */
  expiresAt?: Date;
  /** 是否激活 */
  active: boolean;
  /** 版本号 */
  version: number;
  /** 密钥算法 */
  algorithm?: string;
  /** 密钥长度 */
  length?: number;
}

export enum KeyType {
  /** 对称密钥 */
  SYMMETRIC = 'symmetric',
  /** 非对称密钥（公钥） */
  PUBLIC = 'public',
  /** 非对称密钥（私钥） */
  PRIVATE = 'private'
}

export enum KeyPurpose {
  /** JWT签名 */
  JWT_SIGNING = 'jwt_signing',
  /** JWT验证 */
  JWT_VERIFICATION = 'jwt_verification',
  /** 数据加密 */
  DATA_ENCRYPTION = 'data_encryption',
  /** 数据解密 */
  DATA_DECRYPTION = 'data_decryption',
  /** HMAC签名 */
  HMAC_SIGNING = 'hmac_signing',
  /** 其他用途 */
  OTHER = 'other'
}

export interface KeyStoreConfig {
  /** 存储类型 */
  type: 'redis' | 'local' | 'aws_kms' | 'hashicorp_vault';
  /** Redis配置 */
  redis?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
    keyPrefix?: string;
  };
  /** 本地配置 */
  local?: {
    filePath: string;
  };
  /** AWS KMS配置 */
  awsKms?: {
    region: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    keyId?: string;
  };
  /** HashiCorp Vault配置 */
  hashicorpVault?: {
    address: string;
    token: string;
    path?: string;
  };
}

export interface KeyManagerConfig {
  /** 密钥存储配置 */
  keyStore: KeyStoreConfig;
  /** 默认密钥有效期（天） */
  defaultExpirationDays: number;
  /** 是否启用自动轮换 */
  autoRotationEnabled: boolean;
  /** 轮换间隔（天） */
  rotationIntervalDays: number;
  /** 备份策略 */
  backupStrategy: {
    enabled: boolean;
    intervalDays: number;
    backupPath: string;
  };
  /** 高可用性配置 */
  highAvailability: {
    enabled: boolean;
    replicas: number;
    healthCheckInterval: number;
  };
}

export interface KeyRotationOptions {
  /** 密钥ID */
  keyId?: string;
  /** 密钥用途 */
  purpose?: KeyPurpose;
  /** 新密钥长度 */
  newKeyLength?: number;
  /** 新密钥算法 */
  newAlgorithm?: string;
  /** 是否立即激活新密钥 */
  activateImmediately?: boolean;
}

export interface EncryptionOptions {
  /** 密钥ID */
  keyId?: string;
  /** 加密算法 */
  algorithm?: string;
  /** 初始化向量 */
  iv?: Buffer;
  /** 认证标签 */
  authTag?: Buffer;
}

export interface DecryptionOptions {
  /** 密钥ID */
  keyId?: string;
  /** 解密算法 */
  algorithm?: string;
  /** 初始化向量 */
  iv: Buffer;
  /** 认证标签 */
  authTag: Buffer;
}

export interface KeyStore {
  /** 存储密钥 */
  storeKey(key: Omit<Key, 'id' | 'createdAt' | 'updatedAt'>): Promise<Key>;
  /** 获取密钥 */
  getKey(keyId: string): Promise<Key | null>;
  /** 获取当前活跃密钥 */
  getActiveKey(purpose: KeyPurpose, type?: KeyType): Promise<Key | null>;
  /** 获取密钥历史版本 */
  getKeyHistory(keyId: string): Promise<Key[]>;
  /** 更新密钥 */
  updateKey(keyId: string, updates: Partial<Key>): Promise<Key>;
  /** 删除密钥 */
  deleteKey(keyId: string): Promise<boolean>;
  /** 列出所有密钥 */
  listKeys(options?: {
    purpose?: KeyPurpose;
    type?: KeyType;
    active?: boolean;
  }): Promise<Key[]>;
  /** 备份密钥 */
  backupKeys(): Promise<string>;
  /** 恢复密钥 */
  restoreKeys(backupPath: string): Promise<void>;
  /** 健康检查 */
  healthCheck(): Promise<boolean>;
}

export interface KeyManager {
  /** 初始化密钥管理器 */
  initialize(): Promise<void>;
  /** 生成密钥 */
  generateKey(options: {
    type: KeyType;
    purpose: KeyPurpose;
    length?: number;
    algorithm?: string;
    expiresInDays?: number;
  }): Promise<Key>;
  /** 存储密钥 */
  storeKey(key: Omit<Key, 'id' | 'createdAt' | 'updatedAt'>): Promise<Key>;
  /** 获取密钥 */
  getKey(keyId: string): Promise<Key | null>;
  /** 获取当前活跃密钥 */
  getActiveKey(purpose: KeyPurpose, type?: KeyType): Promise<Key | null>;
  /** 轮换密钥 */
  rotateKey(options: KeyRotationOptions): Promise<{ oldKey: Key; newKey: Key }>;
  /** 加密数据 */
  encrypt(data: string | Buffer, options?: EncryptionOptions): Promise<{
    encryptedData: Buffer;
    iv: Buffer;
    authTag?: Buffer;
    keyId: string;
  }>;
  /** 解密数据 */
  decrypt(encryptedData: Buffer, options: DecryptionOptions): Promise<Buffer>;
  /** 签名数据 */
  sign(data: string | Buffer, options?: {
    keyId?: string;
    algorithm?: string;
  }): Promise<{
    signature: Buffer;
    keyId: string;
  }>;
  /** 验证签名 */
  verify(
    data: string | Buffer,
    signature: Buffer,
    options?: {
      keyId?: string;
      algorithm?: string;
    }
  ): Promise<boolean>;
  /** 自动轮换所有需要轮换的密钥 */
  autoRotateKeys(): Promise<void>;
  /** 备份所有密钥 */
  backupKeys(): Promise<string>;
  /** 恢复密钥 */
  restoreKeys(backupPath: string): Promise<void>;
  /** 健康检查 */
  healthCheck(): Promise<boolean>;
}
