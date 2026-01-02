/**
 * @file 菜品模型
 * @description 定义菜品的数据结构和关系
 * @module models/MenuItem
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo, HasMany, Index } from 'sequelize-typescript';
import { Category } from './Category';
import { MenuItemOption } from './MenuItemOption';
import { MenuItemImage } from './MenuItemImage';
import { MenuItemTag } from './MenuItemTag';
import { Tag } from './Tag';
import { DishEntity } from './DishEntity';

@Table({
  tableName: 'menu_items',
  timestamps: true,
  paranoid: true
})
export class MenuItem extends Model<MenuItem> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Index({ unique: true })
  @Column(DataType.STRING(100))
  name!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Column(DataType.DECIMAL(10, 2))
  price!: number;

  @Column(DataType.DECIMAL(10, 2))
  original_price?: number;

  @Column(DataType.INTEGER)
  stock!: number;

  @Column(DataType.INTEGER)
  sales!: number;

  @Column(DataType.BOOLEAN)
  is_popular!: boolean;

  @Column(DataType.BOOLEAN)
  is_recommend!: boolean;

  @Column(DataType.BOOLEAN)
  is_new!: boolean;

  @Column(DataType.BOOLEAN)
  is_active!: boolean;

  @Column(DataType.STRING(255))
  cover_image_url?: string;

  @Column(DataType.JSON)
  nutrients?: {
    calories: number;
    protein: number;
    fat: number;
    carbohydrate: number;
  };

  @Column(DataType.STRING(255))
  taste_tags?: string;

  @Column(DataType.INTEGER)
  preparation_time!: number;

  @Column(DataType.STRING(100))
  origin?: string;

  @Column(DataType.JSON)
  metadata?: Record<string, any>;

  @Column(DataType.STRING(255))
  knowledge_graph_entity_id?: string;

  @BelongsTo(() => DishEntity, 'knowledge_graph_entity_id')
  knowledge_graph_entity?: DishEntity;

  @ForeignKey(() => Category)
  @Column(DataType.INTEGER)
  category_id!: number;

  @BelongsTo(() => Category, 'category_id')
  category!: Category;

  @HasMany(() => MenuItemOption, 'menu_item_id')
  options!: MenuItemOption[];

  @HasMany(() => MenuItemImage, 'menu_item_id')
  images!: MenuItemImage[];

  @HasMany(() => MenuItemTag, 'menu_item_id')
  menu_item_tags!: MenuItemTag[];
}
