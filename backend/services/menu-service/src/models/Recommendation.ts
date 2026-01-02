/**
 * @file 个性化推荐模型
 * @description 定义菜品个性化推荐的数据结构和关系
 * @module models/Recommendation
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
  tableName: 'recommendations',
  timestamps: true,
  paranoid: true
})
export class Recommendation extends Model<Recommendation> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.INTEGER)
  user_id!: number;

  @ForeignKey(() => MenuItem)
  @Column(DataType.INTEGER)
  menu_item_id!: number;

  @Column(DataType.ENUM('personalized', 'popular', 'new_arrival', 'similar', 'complementary'))
  recommendation_type!: 'personalized' | 'popular' | 'new_arrival' | 'similar' | 'complementary';

  @Column(DataType.FLOAT)
  score!: number;

  @Column(DataType.INTEGER)
  rank!: number;

  @Column(DataType.JSON)
  context?: {
    session_id?: string;
    location?: string;
    time_of_day?: string;
    day_of_week?: string;
    previous_order_items?: number[];
    user_preferences?: string[];
    browsing_history?: number[];
    current_cart?: number[];
    search_query?: string;
    device_type?: string;
    weather?: string;
  };

  @Column(DataType.BOOLEAN)
  is_interacted!: boolean;

  @Column(DataType.BOOLEAN)
  is_active!: boolean;

  @Column(DataType.JSON)
  metadata?: {
    model_version?: string;
    feature_importance?: Record<string, number>;
    confidence_score?: number;
    explainability?: string;
    cold_start?: boolean;
    diversity_score?: number;
  };

  @Column(DataType.INTEGER)
  click_count!: number;

  @Column(DataType.INTEGER)
  order_count!: number;

  @Column(DataType.DATE)
  last_viewed_at?: Date;

  @Column(DataType.FLOAT)
  relevance_score?: number;

  @Column(DataType.ENUM('positive', 'negative', 'neutral'))
  user_feedback?: 'positive' | 'negative' | 'neutral';

  @BelongsTo(() => MenuItem, 'menu_item_id')
  menu_item!: MenuItem;
}
