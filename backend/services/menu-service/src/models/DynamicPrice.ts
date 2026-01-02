/**
 * @file 动态价格模型
 * @description 定义菜品动态价格的数据结构和关系
 * @module models/DynamicPrice
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo, Unique } from 'sequelize-typescript';
import { MenuItem } from './MenuItem';

@Table({
  tableName: 'dynamic_prices',
  timestamps: true,
  paranoid: true
})
export class DynamicPrice extends Model<DynamicPrice> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => MenuItem)
  @Column(DataType.INTEGER)
  menu_item_id!: number;

  @Column(DataType.DECIMAL(10, 2))
  dynamic_price!: number;

  @Column(DataType.ENUM('time_based', 'demand_based', 'user_segment', 'promotion', 'special_event', 'ai_predicted'))
  price_type!: 'time_based' | 'demand_based' | 'user_segment' | 'promotion' | 'special_event' | 'ai_predicted';

  @Column(DataType.STRING(100))
  rule_name!: string;

  @Column(DataType.JSON)
  rule_config!: {
    start_time?: string;
    end_time?: string;
    day_of_week?: number[];
    user_segment?: string[];
    minimum_order?: number;
    maximum_order?: number;
    demand_threshold?: number;
    discount_percentage?: number;
    markup_percentage?: number;
    prediction_model?: string;
    model_params?: Record<string, any>;
    confidence_threshold?: number;
    base_price_adjustment?: number;
    price_floor?: number;
    price_ceiling?: number;
  };

  @Column(DataType.BOOLEAN)
  is_active!: boolean;

  @Column(DataType.DATE)
  effective_from!: Date;

  @Column(DataType.DATE)
  effective_to?: Date;

  @Column(DataType.JSON)
  metadata?: Record<string, any>;

  @BelongsTo(() => MenuItem, 'menu_item_id')
  menu_item!: MenuItem;
}
