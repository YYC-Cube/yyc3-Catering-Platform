/**
 * @fileoverview 示例模型
 * @description 定义示例数据模型和数据库表结构
 * @module models/sample
 * @author YYC³ Development Team <dev@yyc3.red>
 * @version 1.0.0
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * 示例类型枚举
 */
export enum SampleType {
  TYPE_1 = 'TYPE_1',
  TYPE_2 = 'TYPE_2',
  TYPE_3 = 'TYPE_3',
}

/**
 * 示例模型属性接口
 */
export interface SampleAttributes {
  id: string;
  name: string;
  description?: string;
  status: boolean;
  type: SampleType;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * 示例模型创建属性接口（不包含自动生成的属性）
 */
export interface SampleCreationAttributes extends Optional<SampleAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * 示例模型类
 */
export class Sample extends Model<SampleAttributes, SampleCreationAttributes> implements SampleAttributes {
  public id!: string;
  public name!: string;
  public description?: string;
  public status!: boolean;
  public type!: SampleType;
  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt?: Date;
}

// 定义示例模型
Sample.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: '名称不能为空' },
        len: { args: [1, 100], msg: '名称长度必须在1-100个字符之间' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(SampleType)),
      allowNull: false,
      defaultValue: SampleType.TYPE_1,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'samples',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_samples_status',
        fields: ['status'],
      },
      {
        name: 'idx_samples_type',
        fields: ['type'],
      },
      {
        name: 'idx_samples_name',
        fields: ['name'],
        using: 'BTREE',
      },
      {
        name: 'idx_samples_created_at',
        fields: ['created_at'],
      },
    ],
  },
);

export default Sample;
