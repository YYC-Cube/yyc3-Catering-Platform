/**
 * @file 版本仓库
 * @description 提供文档版本数据的持久化存储和查询
 * @module repositories/version.repository
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { DocumentVersion } from './document.types';
import { Logger } from './logger';
import * as fs from 'fs/promises';
import * as path from 'path';

export class VersionRepository {
  private logger: Logger;
  private dataDir: string;
  private versionsFile: string;
  private versions: Map<string, DocumentVersion[]>;

  constructor(dataDir: string = '/Users/yanyu/yyc3-catering-platform/docs/YYC3-Cater-Platform-文档闭环/YYC3-Cater-数据') {
    this.logger = new Logger('VersionRepository');
    this.dataDir = dataDir;
    this.versionsFile = path.join(dataDir, 'versions.json');
    this.versions = new Map();
  }

  /**
   * 初始化仓库
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing version repository');

      // 确保数据目录存在
      await fs.mkdir(this.dataDir, { recursive: true });

      // 加载现有数据
      await this.load();

      this.logger.info('Version repository initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize version repository', { error });
      throw error;
    }
  }

  /**
   * 加载数据
   */
  private async load(): Promise<void> {
    try {
      const data = await fs.readFile(this.versionsFile, 'utf-8');
      const versionsData = JSON.parse(data);
      
      this.versions.clear();
      for (const [documentId, versions] of Object.entries(versionsData)) {
        this.versions.set(documentId, versions as DocumentVersion[]);
      }
      
      this.logger.info('Versions loaded successfully', { count: this.versions.size });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        this.logger.info('Versions file not found, starting with empty repository');
      } else {
        this.logger.error('Failed to load versions', { error });
        throw error;
      }
    }
  }

  /**
   * 持久化数据
   */
  private async persist(): Promise<void> {
    try {
      const versionsData: Record<string, DocumentVersion[]> = {};
      this.versions.forEach((versions, documentId) => {
        versionsData[documentId] = versions;
      });
      
      await fs.writeFile(this.versionsFile, JSON.stringify(versionsData, null, 2), 'utf-8');
      this.logger.info('Versions persisted successfully');
    } catch (error) {
      this.logger.error('Failed to persist versions', { error });
      throw error;
    }
  }

  /**
   * 保存版本
   * @param version 版本
   */
  async save(version: DocumentVersion): Promise<void> {
    try {
      this.logger.info('Saving version', { documentId: version.documentId, version: version.version });

      // 获取文档的所有版本
      const versions = this.versions.get(version.documentId) || [];
      versions.push(version);
      this.versions.set(version.documentId, versions);

      // 持久化
      await this.persist();

      this.logger.info('Version saved successfully', { documentId: version.documentId, version: version.version });
    } catch (error) {
      this.logger.error('Failed to save version', { documentId: version.documentId, version: version.version, error });
      throw error;
    }
  }

  /**
   * 获取文档的所有版本
   * @param documentId 文档ID
   * @returns 版本列表
   */
  async getByDocumentId(documentId: string): Promise<DocumentVersion[]> {
    try {
      this.logger.info('Getting versions by document ID', { documentId });

      const versions = this.versions.get(documentId) || [];
      return versions;
    } catch (error) {
      this.logger.error('Failed to get versions by document ID', { documentId, error });
      throw error;
    }
  }

  /**
   * 获取文档的特定版本
   * @param documentId 文档ID
   * @param version 版本号
   * @returns 版本
   */
  async getByDocumentIdAndVersion(documentId: string, version: string): Promise<DocumentVersion | null> {
    try {
      this.logger.info('Getting version by document ID and version', { documentId, version });

      const versions = this.versions.get(documentId) || [];
      const foundVersion = versions.find(v => v.version === version);
      return foundVersion || null;
    } catch (error) {
      this.logger.error('Failed to get version by document ID and version', { documentId, version, error });
      throw error;
    }
  }

  /**
   * 删除文档的所有版本
   * @param documentId 文档ID
   */
  async deleteByDocumentId(documentId: string): Promise<void> {
    try {
      this.logger.info('Deleting versions by document ID', { documentId });

      this.versions.delete(documentId);
      await this.persist();

      this.logger.info('Versions deleted successfully', { documentId });
    } catch (error) {
      this.logger.error('Failed to delete versions by document ID', { documentId, error });
      throw error;
    }
  }
}
