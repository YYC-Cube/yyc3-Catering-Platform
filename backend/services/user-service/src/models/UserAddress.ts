/**
 * @fileoverview 用户地址模型
 * @description 定义用户地址数据结构和数据库映射
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-15
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

/**
 * 用户地址模型
 */
@Table({
  tableName: 'user_addresses',
  indexes: [
    { name: 'idx_user_addresses_user_id', fields: ['user_id'] },
    { name: 'idx_user_addresses_is_default', fields: ['is_default'] },
    { name: 'idx_user_addresses_province_city', fields: ['province', 'city'] },
  ],
})
export class UserAddress extends Model<UserAddress> {
  // 主键
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id: string;

  // 用户ID
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  user_id: string;

  // 收货人姓名
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  receiver_name: string;

  // 收货人手机号
  @Column({
    type: DataType.STRING(20),
    allowNull: false,
  })
  receiver_phone: string;

  // 省份
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  province: string;

  // 城市
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  city: string;

  // 区县
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  district: string;

  // 详细地址
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  detail_address: string;

  // 邮政编码
  @Column({
    type: DataType.STRING(10),
    allowNull: true,
  })
  postal_code: string;

  // 是否默认地址
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  is_default: boolean;

  // 关联关系
  @BelongsTo(() => User)
  user: User;
}
