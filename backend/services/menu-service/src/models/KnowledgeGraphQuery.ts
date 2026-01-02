/**
 * @file 知识图谱查询模型
 * @description 定义知识图谱查询记录的数据结构
 * @module models/KnowledgeGraphQuery
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Table, Column, Model, DataType, PrimaryKey } from 'sequelize-typescript';

@Table({
  tableName: 'knowledge_graph_queries',
  timestamps: true,
  paranoid: true
})
export class KnowledgeGraphQuery extends Model<KnowledgeGraphQuery> {
  @PrimaryKey
  @Column(DataType.UUID)
  id!: string;

  @Column(DataType.TEXT)
  queryText!: string;

  @Column(DataType.STRING(50))
  queryType!: string; // 查询类型

  @Column(DataType.JSON)
  queryResults!: any; // 查询结果

  @Column(DataType.INTEGER)
  executionTime!: number; // 执行时间（毫秒）
}
