/**
 * @file 菜品选项模型
 * @description 定义菜品选项（如规格、配料）的数据结构和关系
 * @module models/MenuItemOption
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
  tableName: 'menu_item_options',
  timestamps: true,
  paranoid: true
})
export class MenuItemOption extends Model<MenuItemOption> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => MenuItem)
  @Column(DataType.INTEGER)
  menu_item_id!: number;

  @Column(DataType.STRING(100))
  option_type!: string;

  @Column(DataType.STRING(100))
  name!: string;

  @Column(DataType.DECIMAL(10, 2))
  price_difference!: number;

  @Column(DataType.INTEGER)
  sort_order!: number;

  @Column(DataType.BOOLEAN)
  is_default!: boolean;

  @Column(DataType.BOOLEAN)
  is_required!: boolean;

  @Column(DataType.JSON)
  metadata?: Record<string, any>;

  @BelongsTo(() => MenuItem, 'menu_item_id')
  menu_item!: MenuItem;
}
