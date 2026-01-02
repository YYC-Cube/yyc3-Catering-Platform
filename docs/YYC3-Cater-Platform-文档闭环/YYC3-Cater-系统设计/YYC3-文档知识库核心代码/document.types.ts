/**
 * @file 文档相关类型定义
 * @description 定义文档、版本、质量报告等核心数据类型
 * @module types/document.types
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

/**
 * 文档状态枚举
 */
export enum DocumentStatus {
  DRAFT = 'draft', // 草稿
  REVIEW = 'review', // 审核中
  APPROVED = 'approved', // 已审核
  PUBLISHED = 'published', // 已发布
  DEPRECATED = 'deprecated', // 已废弃
  ARCHIVED = 'archived', // 已归档
}

/**
 * 文档接口
 */
export interface Document {
  // 基本信息
  id: string; // 文档唯一标识
  number: string; // 文档编号
  title: string; // 文档标题
  description: string; // 文档描述
  content: string; // 文档内容（Markdown）

  // 分类信息
  category: string; // 文档分类
  subcategory: string; // 子分类
  tags: string[]; // 标签列表
  keywords: string[]; // 关键词列表

  // 质量信息
  qualityScore: number; // 质量评分（0-100）
  qualityMetrics: QualityMetrics; // 质量指标

  // 版本信息
  version: string; // 当前版本
  versions: DocumentVersion[]; // 版本历史
  status: DocumentStatus; // 文档状态

  // 统计信息
  viewCount: number; // 浏览次数
  likeCount: number; // 点赞次数
  shareCount: number; // 分享次数
  commentCount: number; // 评论次数

  // 关系信息
  references: string[]; // 引用的文档ID
  referencedBy: string[]; // 被引用的文档ID
  relatedDocuments: string[]; // 相关文档ID

  // 元数据
  author: string; // 作者
  createdAt: Date; // 创建时间
  updatedAt: Date; // 更新时间
  publishedAt?: Date; // 发布时间
  metadata?: {
    // 扩展元数据
    classification?: {
      // 分类信息
      confidence?: number; // 置信度
      method?: string; // 分类方法
      classifiedAt?: Date; // 分类时间
    };
    [key: string]: any; // 其他自定义元数据
  };

  // 知识图谱
  graphNodeId?: string; // 知识图谱节点ID
  concepts: string[]; // 包含的概念
  centrality?: number; // 中心性
  importance?: number; // 重要性
  cluster?: number; // 所属聚类
}

/**
 * 质量指标
 */
export interface QualityMetrics {
  contentCompleteness: number; // 内容完整性（0-100）
  structureNormalization: number; // 结构规范化（0-100）
  technicalAccuracy: number; // 技术准确性（0-100）
  readability: number; // 可读性（0-100）
  practicality: number; // 实用性（0-100）
}

/**
 * 文档版本
 */
export interface DocumentVersion {
  id: string; // 版本ID
  documentId: string; // 文档ID
  version: string; // 版本号（如1.0.0）
  status: DocumentStatus; // 版本状态
  content: string; // 版本内容
  changes: string; // 变更说明
  author: string; // 作者
  createdAt: Date; // 创建时间
  gitCommit?: string; // Git提交哈希
}

/**
 * 质量报告
 */
export interface QualityReport {
  id: string; // 报告ID
  documentId: string; // 文档ID
  version: string; // 文档版本

  // 评分
  overallScore: number; // 综合评分（0-100）
  metrics: QualityMetrics; // 各维度评分

  // 问题
  issues: QualityIssue[]; // 问题列表

  // 建议
  suggestions: string[]; // 改进建议

  // 元数据
  generatedAt: Date; // 生成时间
  generatedBy: string; // 生成者（系统/用户）
}

/**
 * 质量监控报告（扩展版本）
 */
export interface QualityMonitoringReport extends QualityReport {
  date: string; // 报告日期
  documentCount: number; // 文档数量
  averageScore: number; // 平均分数
  categoryScores: Record<string, number>; // 分类分数
  dimensionScores: Record<string, number>; // 维度分数
  scoreDistribution: Record<QualityLevel, number>; // 分数分布
  problemDocuments: Array<{
    documentId: string;
    title: string;
    qualityScore: number;
    issues: string[];
  }>; // 问题文档列表
  recommendations: string[]; // 推荐建议
  createdAt: Date; // 创建时间
}

/**
 * 质量问题
 */
export interface QualityIssue {
  type: 'error' | 'warning' | 'info'; // 问题类型
  category: string; // 问题分类
  message: string; // 问题描述
  location?: {
    // 位置信息
    line?: number;
    column?: number;
  };
  suggestion?: string; // 改进建议
}

/**
 * 质量等级
 */
export type QualityLevel = 'excellent' | 'good' | 'acceptable' | 'needsImprovement' | 'poor';

/**
 * 搜索类型枚举
 */
export enum SearchType {
  KEYWORD = 'keyword', // 关键词搜索
  SEMANTIC = 'semantic', // 语义搜索
  HYBRID = 'hybrid', // 混合搜索
}

/**
 * 搜索结果
 */
export interface SearchResult {
  document: {
    id: string;
    title: string;
    description: string;
    category: string;
    qualityScore: number;
  };
  relevance: number; // 相关度（0-1）
  matchType: 'keyword' | 'semantic' | 'hybrid'; // 匹配类型
  highlights: string[]; // 高亮片段
}

/**
 * 推荐类型枚举
 */
export enum RecommendationType {
  DOCUMENT = 'document', // 基于文档
  USER = 'user', // 基于用户
  CATEGORY = 'category', // 基于分类
  HYBRID = 'hybrid', // 混合推荐
}

/**
 * 推荐结果
 */
export interface Recommendation {
  document: {
    id: string;
    title: string;
    description: string;
    category: string;
    qualityScore: number;
  };
  score: number; // 推荐分数（0-1）
  reason: string; // 推荐理由
}

/**
 * 用户角色枚举
 */
export enum UserRole {
  ADMIN = 'admin', // 管理员
  EDITOR = 'editor', // 编辑者
  REVIEWER = 'reviewer', // 审核者
  VIEWER = 'viewer', // 查看者
}

/**
 * 用户接口
 */
export interface User {
  id: string; // 用户ID
  username: string; // 用户名
  email: string; // 邮箱
  name: string; // 姓名
  avatar?: string; // 头像

  // 权限
  role: UserRole; // 用户角色
  permissions: string[]; // 权限列表

  // 统计
  documentCount: number; // 文档数量
  viewCount: number; // 浏览次数
  likeCount: number; // 点赞次数

  // 行为数据
  searchHistory: SearchRecord[]; // 搜索历史
  viewHistory: ViewRecord[]; // 浏览历史
  preferences: UserPreferences; // 用户偏好

  // 元数据
  createdAt: Date; // 创建时间
  updatedAt: Date; // 更新时间
  lastLoginAt?: Date; // 最后登录时间
}

/**
 * 用户偏好
 */
export interface UserPreferences {
  language: string; // 语言偏好
  theme: 'light' | 'dark'; // 主题偏好
  pageSize: number; // 每页数量
  categories: string[]; // 关注的分类
  tags: string[]; // 关注的标签
}

/**
 * 搜索记录
 */
export interface SearchRecord {
  id: string; // 记录ID
  userId: string; // 用户ID
  query: string; // 搜索查询
  results: string[]; // 结果文档ID
  clicked?: string; // 点击的文档ID
  timestamp: Date; // 搜索时间
}

/**
 * 浏览记录
 */
export interface ViewRecord {
  id: string; // 记录ID
  userId: string; // 用户ID
  documentId: string; // 文档ID
  duration: number; // 浏览时长（秒）
  timestamp: Date; // 浏览时间
}

/**
 * 评论
 */
export interface Comment {
  id: string; // 评论ID
  documentId: string; // 文档ID
  userId: string; // 用户ID
  content: string; // 评论内容
  parentId?: string; // 父评论ID（回复）
  likes: number; // 点赞数
  createdAt: Date; // 创建时间
  updatedAt: Date; // 更新时间
}

/**
 * 知识图谱
 */
export interface KnowledgeGraph {
  id: string; // 图谱ID
  name: string; // 图谱名称
  description: string; // 图谱描述

  // 节点
  documentNodes: DocumentNode[]; // 文档节点
  conceptNodes: ConceptNode[]; // 概念节点

  // 边
  edges: GraphEdge[]; // 边列表

  // 统计
  totalNodes: number; // 总节点数
  totalEdges: number; // 总边数
  density: number; // 图密度
  avgDegree: number; // 平均度数

  // 元数据
  version: string; // 图谱版本
  createdAt: Date; // 创建时间
  updatedAt: Date; // 更新时间
}

/**
 * 文档节点
 */
export interface DocumentNode {
  id: string; // 节点ID
  documentId: string; // 文档ID
  type: 'document'; // 节点类型
  properties: {
    // 节点属性
    title: string;
    category: string;
    qualityScore: number;
    centrality: number;
    importance: number;
    cluster: number;
  };
}

/**
 * 概念节点
 */
export interface ConceptNode {
  id: string; // 节点ID
  conceptId: string; // 概念ID
  type: 'concept'; // 节点类型
  properties: {
    // 节点属性
    name: string;
    category: string;
    frequency: number;
    importance: number;
    cluster?: number; // 聚类ID
  };
}

/**
 * 边类型枚举
 */
export enum EdgeType {
  CONTAINS = 'contains', // 包含
  DEPENDS_ON = 'depends_on', // 依赖
  REFERENCES = 'references', // 参考
  RELATED_TO = 'related_to', // 相关
}

/**
 * 图边
 */
export interface GraphEdge {
  id: string; // 边ID
  source: string; // 源节点ID
  target: string; // 目标节点ID
  type: EdgeType; // 边类型
  weight: number; // 权重
  properties: {
    // 边属性
    relationship: string; // 关系描述
    strength: number; // 关系强度
  };
}

/**
 * 概念
 */
export interface Concept {
  id: string; // 概念ID
  name: string; // 概念名称
  description: string; // 概念描述
  category: string; // 概念分类
  frequency: number; // 出现频率
  documents: string[]; // 出现的文档ID
  relatedConcepts: string[]; // 相关概念ID
  importance: number; // 重要性
  createdAt: Date; // 创建时间
  updatedAt: Date; // 更新时间
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number; // 页码（从1开始）
  pageSize: number; // 每页数量（默认20，最大100）
  sortBy?: string; // 排序字段
  sortOrder?: 'asc' | 'desc'; // 排序方向
}

/**
 * 分页结果
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * API响应
 */
export interface ApiResponse<T> {
  success: boolean; // 是否成功
  data?: T; // 响应数据
  error?: {
    // 错误信息
    code: string; // 错误码
    message: string; // 错误消息
    details?: any; // 错误详情
  };
  meta?: {
    // 元数据
    total?: number; // 总数
    page?: number; // 当前页
    pageSize?: number; // 每页数量
    hasMore?: boolean; // 是否有更多
  };
}

/**
 * 文档统计
 */
export interface DocumentStatistics {
  totalDocuments: number; // 总文档数
  publishedDocuments: number; // 已发布文档数
  draftDocuments: number; // 草稿文档数
  averageQualityScore: number; // 平均质量分
  totalViews: number; // 总浏览数
  totalLikes: number; // 总点赞数
  totalShares: number; // 总分享数
  topDocuments: {
    // 热门文档
    id: string;
    title: string;
    viewCount: number;
    likeCount: number;
    shareCount: number;
  }[];
  trend: {
    // 趋势数据
    date: string;
    count: number;
    views: number;
  }[];
}
