/**
 * @fileoverview 用户模型
 * @description 定义用户数据结构和数据库映射
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-15
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Role } from './Role';
import { UserProfile } from './UserProfile';
import { UserAddress } from './UserAddress';

/**
 * 用户状态枚举
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LOCKED = 'locked',
  DELETED = 'deleted',
}

/**
 * 用户类型枚举
 */
export enum UserType {
  CUSTOMER = 'customer',
  MERCHANT = 'merchant',
  ADMIN = 'admin',
  STAFF = 'staff',
}

/**
 * 用户模型
 */
@Table({
  tableName: 'users',
  indexes: [
    { name: 'idx_users_phone', fields: ['phone'], unique: true },
    { name: 'idx_users_email', fields: ['email'], unique: true },
    { name: 'idx_users_status', fields: ['status'] },
    { name: 'idx_users_type', fields: ['type'] },
    { name: 'idx_users_role_id', fields: ['role_id'] },
  ],
})
export class User extends Model<User> {
  // 主键
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id: string;

  // 用户名
  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  username: string;

  // 手机号
  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    unique: true,
  })
  phone: string;

  // 邮箱
  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    unique: true,
  })
  email: string;

  // 密码
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  password: string;

  // 用户类型
  @Column({
    type: DataType.ENUM(...Object.values(UserType)),
    allowNull: false,
    defaultValue: UserType.CUSTOMER,
  })
  type: UserType;

  // 用户状态
  @Column({
    type: DataType.ENUM(...Object.values(UserStatus)),
    allowNull: false,
    defaultValue: UserStatus.ACTIVE,
  })
  status: UserStatus;

  // 角色ID
  @ForeignKey(() => Role)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  role_id: string;

  // 最后登录时间
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  last_login_at: Date;

  // 登录次数
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  login_count: number;

  // 密码错误次数
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  password_error_count: number;

  // 密码锁定时间
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  password_locked_at: Date;

  // 关联关系
  @BelongsTo(() => Role)
  role: Role;

  @HasMany(() => UserProfile)
  profiles: UserProfile[];

  @HasMany(() => UserAddress)
  addresses: UserAddress[];
}
