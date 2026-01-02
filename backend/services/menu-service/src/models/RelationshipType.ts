/**
 * @file 关系类型模型
 * @description 定义知识图谱中实体关系的类型数据结构
 * @module models/RelationshipType
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Table, Column, Model, DataType, PrimaryKey, HasMany } from 'sequelize-typescript';
import { EntityRelationship } from './EntityRelationship';

@Table({
  tableName: 'relationship_types',
  timestamps: true,
  paranoid: true
})
export class RelationshipType extends Model<RelationshipType> {
  @PrimaryKey
  @Column(DataType.UUID)
  id!: string;

  @Column(DataType.STRING(50))
  name!: string;

  @Column(DataType.TEXT)
  description!: string;

  @HasMany(() => EntityRelationship, 'relationshipTypeId')
  relationships!: EntityRelationship[];
}
