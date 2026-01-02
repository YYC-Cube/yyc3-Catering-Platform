/**
 * @file 数据采集模型
 * @description 定义数据采集任务的数据结构和关系
 * @module models/DataCollection
 * @author YYC³团队
 * @version 1.0.0
 * @created 2025-01-30
 */

import { Table, Column, Model, DataType, PrimaryKey, Index, HasMany } from 'sequelize-typescript';
import { DataProcessing } from './DataProcessing';

@Table({
  tableName: 'data_collections',
  timestamps: true,
  paranoid: true
})
export class DataCollection extends Model<DataCollection> {
  @PrimaryKey
  @Column(DataType.UUID)
  id!: string;

  @Index
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    comment: '数据源类型（internal/external）'
  })
  source_type!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: '具体数据源名称'
  })
  source_name!: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
    comment: '数据源配置参数'
  })
  source_config!: Record<string, any>;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    comment: '采集数据类型'
  })
  data_type!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    comment: '采集频率'
  })
  collection_frequency!: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: '上次采集时间'
  })
  last_collected_at?: Date;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
    comment: '采集状态（pending/running/completed/failed）'
  })
  status!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: '错误信息'
  })
  error_message?: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    comment: '元数据'
  })
  metadata?: Record<string, any>;

  @HasMany(() => DataProcessing, 'collection_id')
  processings!: DataProcessing[];
}

export type DataCollectionAttributes = typeof DataCollection['prototype'];
export type DataCollectionCreationAttributes = Omit<DataCollectionAttributes, 'id' | 'last_collected_at' | 'error_message' | 'metadata' | 'createdAt' | 'updatedAt'>;
