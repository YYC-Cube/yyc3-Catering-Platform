/**
 * @file 菜品图片模型
 * @description 定义菜品图片的数据结构和关系
 * @module models/MenuItemImage
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { MenuItem } from './MenuItem';

@Table({
  tableName: 'menu_item_images',
  timestamps: true,
  paranoid: true
})
export class MenuItemImage extends Model<MenuItemImage> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => MenuItem)
  @Column(DataType.INTEGER)
  menu_item_id!: number;

  @Column(DataType.STRING(255))
  image_url!: string;

  @Column(DataType.STRING(50))
  image_type!: string;

  @Column(DataType.INTEGER)
  sort_order!: number;

  @Column(DataType.BOOLEAN)
  is_cover!: boolean;

  @Column(DataType.JSON)
  metadata?: Record<string, any>;

  @BelongsTo(() => MenuItem, 'menu_item_id')
  menu_item!: MenuItem;
}
