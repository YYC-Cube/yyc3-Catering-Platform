/**
 * @file 菜单分类模型
 * @description 定义菜品分类的数据结构和关系
 * @module models/Category
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, HasMany, Index } from 'sequelize-typescript';
import { MenuItem } from './MenuItem';

@Table({
  tableName: 'categories',
  timestamps: true,
  paranoid: true
})
export class Category extends Model<Category> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Index({ unique: true })
  @Column(DataType.STRING(50))
  name!: string;

  @Column(DataType.STRING(255))
  description?: string;

  @Column(DataType.INTEGER)
  parent_id?: number;

  @Column(DataType.INTEGER)
  sort_order!: number;

  @Column(DataType.BOOLEAN)
  is_active!: boolean;

  @Column(DataType.STRING(255))
  image_url?: string;

  @Column(DataType.STRING(50))
  icon?: string;

  @Column(DataType.JSON)
  metadata?: Record<string, any>;

  @HasMany(() => MenuItem, 'category_id')
  menu_items!: MenuItem[];

  @HasMany(() => Category, 'parent_id')
  subcategories!: Category[];
}
