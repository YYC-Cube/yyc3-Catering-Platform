/**
 * @file 实体关系模型
 * @description 定义知识图谱中实体之间的关系数据结构
 * @module models/EntityRelationship
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Table, Column, Model, DataType, PrimaryKey, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { DishEntity } from './DishEntity';
import { RelationshipType } from './RelationshipType';

@Table({
  tableName: 'entity_relationships',
  timestamps: true,
  paranoid: true
})
export class EntityRelationship extends Model<EntityRelationship> {
  @PrimaryKey
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => DishEntity)
  @Column(DataType.UUID)
  sourceEntityId!: string;

  @ForeignKey(() => DishEntity)
  @Column(DataType.UUID)
  targetEntityId!: string;

  @ForeignKey(() => RelationshipType)
  @Column(DataType.UUID)
  relationshipTypeId!: string;

  @Column(DataType.TEXT)
  description!: string;

  @BelongsTo(() => DishEntity, 'sourceEntityId')
  sourceEntity!: DishEntity;

  @BelongsTo(() => DishEntity, 'targetEntityId')
  targetEntity!: DishEntity;

  @BelongsTo(() => RelationshipType, 'relationshipTypeId')
  relationshipType!: RelationshipType;
}
