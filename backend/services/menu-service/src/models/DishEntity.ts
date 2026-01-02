/**
 * @file 菜品实体模型
 * @description 定义菜品知识图谱中的菜品实体数据结构
 * @module models/DishEntity
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
  tableName: 'dish_entities',
  timestamps: true,
  paranoid: true
})
export class DishEntity extends Model<DishEntity> {
  @PrimaryKey
  @Column(DataType.UUID)
  id!: string;

  @Column(DataType.STRING(100))
  name!: string;

  @Column(DataType.STRING(50))
  type!: string; // 菜品类型：主菜、配菜、汤品等

  @Column(DataType.TEXT)
  description!: string;

  @Column(DataType.JSON)
  nutritionInfo!: any; // 营养信息

  @Column(DataType.JSON)
  ingredients!: string[]; // 配料

  @Column(DataType.STRING(50))
  cookingMethod!: string; // 烹饪方法

  @Column(DataType.STRING(100))
  tasteProfile!: string; // 口味特征：甜、咸、辣等

  @HasMany(() => EntityRelationship, 'sourceEntityId')
  outgoingRelationships!: EntityRelationship[];

  @HasMany(() => EntityRelationship, 'targetEntityId')
  incomingRelationships!: EntityRelationship[];
}
