/**
 * @file 密钥管理器接口类型定义
 * @description 密钥管理器相关类型
 * @author YYC
 * @version 1.0.0
 * @created 2026-01-03
 */

/**
 * 密钥存储配置
 */
export interface KeyStoreConfig {
  type: 'local' | 'aws' | 'azure' | 'gcp';
  path?: string;
  encryptionKey?: string;
  region?: string;
  bucketName?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

/**
 * 密钥策略配置
 */
export interface KeyPolicyConfig {
  defaultExpirationDays: number;
  autoRotationEnabled: boolean;
  rotationIntervalDays: number;
}

/**
 * 密钥备份配置
 */
export interface BackupConfig {
  enabled: boolean;
  path?: string;
  intervalDays?: number;
  encrypted?: boolean;
}

/**
 * 高可用性配置
 */
export interface HighAvailabilityConfig {
  enabled: boolean;
  healthCheckInterval: number;
  failoverEnabled: boolean;
}

/**
 * 密钥管理器配置
 */
export interface KeyManagerConfig {
  keyStore: KeyStoreConfig;
  defaultExpirationDays?: number;
  autoRotationEnabled?: boolean;
  rotationIntervalDays?: number;
  backupStrategy?: BackupConfig;
  highAvailability?: HighAvailabilityConfig;
}

/**
 * 密钥信息接口
 */
export interface KeyInfo {
  id: string;
  name: string;
  type: string;
  createdAt: Date | string;
  expiresAt?: Date | string;
  lastRotatedAt?: Date | string;
}

/**
 * 密钥管理器接口
 */
export interface IKeyManager {
  /**
   * 初始化密钥管理器
   */
  initialize(): Promise<void>;

  /**
   * 获取密钥
   * @param keyId 密钥ID
   */
  getKey(keyId: string): Promise<string | null>;

  /**
   * 创建密钥
   * @param name 密钥名称
   * @param type 密钥类型
   * @param options 可选配置
   */
  createKey(
    name: string,
    type: string,
    options?: {
      expiresAt?: Date | string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<KeyInfo>;

  /**
   * 更新密钥
   * @param keyId 密钥ID
   * @param options 可选配置
   */
  updateKey(
    keyId: string,
    options?: {
      expiresAt?: Date | string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<void>;

  /**
   * 删除密钥
   * @param keyId 密钥ID
   */
  deleteKey(keyId: string): Promise<void>;

  /**
   * 旋转密钥
   * @param keyId 密钥ID
   */
  rotateKey(keyId: string): Promise<KeyInfo>;

  /**
   * 列出所有密钥
   */
  listKeys(): Promise<KeyInfo[]>;

  /**
   * 备份密钥
   */
  backup(): Promise<void>;

  /**
   * 关闭密钥管理器
   */
  close(): Promise<void>;
}
