/**
 * @file 备份记录模型
 * @description 定义备份记录的数据结构
 * @author YYC³团队
 * @version 1.0.0
 */

export interface BackupRecord {
  /**
   * 备份ID
   */
  id: string;
  
  /**
   * 备份类型
   */
  type: 'full' | 'incremental' | 'differential';
  
  /**
   * 备份文件路径
   */
  path: string;
  
  /**
   * 备份文件大小（字节）
   */
  size: number;
  
  /**
   * 备份创建时间
   */
  createdAt: Date;
  
  /**
   * 备份状态
   */
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  
  /**
   * 备份持续时间（毫秒）
   */
  duration: number;
  
  /**
   * 备份描述（可选）
   */
  description?: string;
  
  /**
   * 备份检查点（可选）
   */
  checkpoint?: string;
}