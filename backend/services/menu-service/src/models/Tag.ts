/**
 * @file 标签模型
 * @description 定义菜品标签的数据结构和关系
 * @module models/Tag
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, HasMany, Index } from 'sequelize-typescript';
import { MenuItemTag } from './MenuItemTag';

@Table({
  tableName: 'tags',
  timestamps: true,
  paranoid: true
})
export class Tag extends Model<Tag> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Index({ unique: true })
  @Column(DataType.STRING(50))
  name!: string;

  @Column(DataType.STRING(255))
  description?: string;

  @Column(DataType.STRING(100))
  tag_type!: string;

  @Column(DataType.BOOLEAN)
  is_active!: boolean;

  @Column(DataType.INTEGER)
  sort_order!: number;

  @Column(DataType.JSON)
  metadata?: Record<string, any>;

  @HasMany(() => MenuItemTag, 'tag_id')
  menu_item_tags!: MenuItemTag[];
}
