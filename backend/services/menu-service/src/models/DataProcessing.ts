/**
 * @file 数据处理模型
 * @description 定义数据处理任务的数据结构和关系
 * @module models/DataProcessing
 * @author YYC³团队
 * @version 1.0.0
 * @created 2025-01-30
 */

import { Table, Column, Model, DataType, PrimaryKey, ForeignKey, BelongsTo, Index } from 'sequelize-typescript';
import { DataCollection } from './DataCollection';

@Table({
  tableName: 'data_processings',
  timestamps: true,
  paranoid: true
})
export class DataProcessing extends Model<DataProcessing> {
  @PrimaryKey
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => DataCollection)
  @Column(DataType.UUID)
  collection_id!: string;

  @BelongsTo(() => DataCollection, 'collection_id')
  collection!: DataCollection;

  @Column(DataType.STRING(100))
  processing_name!: string;

  @Index
  @Column(DataType.STRING(50))
  processing_type!: string;

  @Column(DataType.JSON)
  processing_config!: Record<string, any>;

  @Index
  @Column(DataType.STRING(20))
  status!: string;

  @Column(DataType.INTEGER)
  processed_data_count?: number;

  @Column(DataType.TEXT)
  error_message?: string;

  @Column(DataType.JSON)
  metadata?: Record<string, any>;
}

export type DataProcessingAttributes = typeof DataProcessing['prototype'];
export type DataProcessingCreationAttributes = Omit<DataProcessingAttributes, 'id' | 'processed_data_count' | 'error_message' | 'metadata' | 'createdAt' | 'updatedAt'>;
