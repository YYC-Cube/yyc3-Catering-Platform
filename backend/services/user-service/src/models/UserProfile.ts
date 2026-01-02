/**
 * @fileoverview 用户资料模型
 * @description 定义用户扩展资料数据结构和数据库映射
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-15
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

/**
 * 用户性别枚举
 */
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

/**
 * 用户资料模型
 */
@Table({
  tableName: 'user_profiles',
  indexes: [
    { name: 'idx_user_profiles_user_id', fields: ['user_id'], unique: true },
    { name: 'idx_user_profiles_gender', fields: ['gender'] },
    { name: 'idx_user_profiles_birthdate', fields: ['birthdate'] },
  ],
})
export class UserProfile extends Model<UserProfile> {
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
    unique: true,
  })
  user_id: string;

  // 用户真实姓名
  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  real_name: string;

  // 用户昵称
  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  nickname: string;

  // 性别
  @Column({
    type: DataType.ENUM(...Object.values(Gender)),
    allowNull: true,
  })
  gender: Gender;

  // 生日
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  birthdate: Date;

  // 头像URL
  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  avatar_url: string;

  // 个人简介
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  bio: string;

  // 所在地区
  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  location: string;

  // 语言偏好
  @Column({
    type: DataType.STRING(20),
    allowNull: true,
    defaultValue: 'zh-CN',
  })
  language: string;

  // 时区
  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    defaultValue: 'Asia/Shanghai',
  })
  timezone: string;

  // 关联关系
  @BelongsTo(() => User)
  user: User;
}
