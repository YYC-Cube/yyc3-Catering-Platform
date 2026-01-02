/**
 * @file 菜品标签关联模型
 * @description 定义菜品与标签的多对多关联关系
 * @module models/MenuItemTag
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, ForeignKey } from 'sequelize-typescript';
import { MenuItem } from './MenuItem';
import { Tag } from './Tag';

@Table({
  tableName: 'menu_item_tags',
  timestamps: true,
  paranoid: true
})
export class MenuItemTag extends Model<MenuItemTag> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => MenuItem)
  @Column(DataType.INTEGER)
  menu_item_id!: number;

  @ForeignKey(() => Tag)
  @Column(DataType.INTEGER)
  tag_id!: number;
}
