/**
 * @fileoverview 角色模型
 * @description 定义角色数据结构和数据库映射
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-15
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { User } from './User';

/**
 * 角色权限类型
 */
interface RolePermission {
  resource: string;
  actions: string[];
}

/**
 * 角色模型
 */
@Table({
  tableName: 'roles',
  indexes: [
    { name: 'idx_roles_name', fields: ['name'], unique: true },
    { name: 'idx_roles_status', fields: ['status'] },
  ],
})
export class Role extends Model<Role> {
  // 主键
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id: string;

  // 角色名称
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
  })
  name: string;

  // 角色描述
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  // 角色权限
  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: [],
  })
  permissions: RolePermission[];

  // 角色状态
  @Column({
    type: DataType.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active',
  })
  status: string;

  // 关联关系
  @HasMany(() => User)
  users: User[];
}
