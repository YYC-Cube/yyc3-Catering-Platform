/**
 * @file 知识图谱服务
 * @description 提供知识图谱的构建、查询、分析和可视化功能
 * @module services/knowledge-graph-service
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { v4 as uuidv4 } from 'uuid';
import {
  KnowledgeGraph,
  DocumentNode,
  ConceptNode,
  GraphEdge,
  EdgeType,
  Document,
  Concept,
} from './document.types';
import { GraphRepository } from './graph.repository';
import { ConceptRepository } from './concept.repository';
import { Logger } from './logger';

export class KnowledgeGraphService {
  private graphRepository: GraphRepository;
  private conceptRepository: ConceptRepository;
  private logger: Logger;

  constructor() {
    this.graphRepository = new GraphRepository();
    this.conceptRepository = new ConceptRepository();
    this.logger = new Logger('KnowledgeGraphService');
  }

  /**
   * 构建知识图谱
   * @param documents 文档列表
   * @returns 构建的知识图谱
   */
  async buildKnowledgeGraph(documents: Document[]): Promise<KnowledgeGraph> {
    try {
      this.logger.info('Building knowledge graph', { documentCount: documents.length });

      // 创建文档节点
      const documentNodes: DocumentNode[] = documents.map((doc) => ({
        id: `node-doc-${doc.id}`,
        documentId: doc.id,
        type: 'document',
        properties: {
          title: doc.title,
          category: doc.category,
          qualityScore: doc.qualityScore,
          centrality: 0, // 后续计算
          importance: 0, // 后续计算
          cluster: 0, // 后续计算
        },
      }));

      // 提取概念并创建概念节点
      const conceptMap = new Map<string, ConceptNode>();
      documents.forEach((doc) => {
        doc.concepts.forEach((conceptName) => {
          if (!conceptMap.has(conceptName)) {
            const conceptNode: ConceptNode = {
              id: `node-concept-${uuidv4()}`,
              conceptId: conceptName,
              type: 'concept',
              properties: {
                name: conceptName,
                category: this.categorizeConcept(conceptName),
                frequency: 1,
                importance: 0, // 后续计算
              },
            };
            conceptMap.set(conceptName, conceptNode);
          } else {
            const node = conceptMap.get(conceptName)!;
            node.properties.frequency++;
          }
        });
      });

      const conceptNodes = Array.from(conceptMap.values());

      // 创建边
      const edges: GraphEdge[] = [];

      // 文档-概念边（包含关系）
      documents.forEach((doc) => {
        doc.concepts.forEach((conceptName) => {
          const docNode = documentNodes.find((n) => n.documentId === doc.id);
          const conceptNode = conceptNodes.find((n) => n.properties.name === conceptName);

          if (docNode && conceptNode) {
            edges.push({
              id: `edge-${uuidv4()}`,
              source: docNode.id,
              target: conceptNode.id,
              type: EdgeType.CONTAINS,
              weight: 1.0,
              properties: {
                relationship: '包含',
                strength: 1.0,
              },
            });
          }
        });
      });

      // 文档-文档边（引用关系）
      documents.forEach((doc) => {
        doc.references.forEach((refId) => {
          const docNode = documentNodes.find((n) => n.documentId === doc.id);
          const refNode = documentNodes.find((n) => n.documentId === refId);

          if (docNode && refNode) {
            edges.push({
              id: `edge-${uuidv4()}`,
              source: docNode.id,
              target: refNode.id,
              type: EdgeType.REFERENCES,
              weight: 0.8,
              properties: {
                relationship: '引用',
                strength: 0.8,
              },
            });
          }
        });
      });

      // 概念-概念边（相关关系）
      const conceptPairs = this.findRelatedConcepts(documents);
      conceptPairs.forEach(([concept1, concept2, strength]) => {
        const node1 = conceptNodes.find((n) => n.properties.name === concept1);
        const node2 = conceptNodes.find((n) => n.properties.name === concept2);

        if (node1 && node2) {
          edges.push({
            id: `edge-${uuidv4()}`,
            source: node1.id,
            target: node2.id,
            type: EdgeType.RELATED_TO,
            weight: strength,
            properties: {
              relationship: '相关',
              strength,
            },
          });
        }
      });

      // 计算图统计指标
      const totalNodes = documentNodes.length + conceptNodes.length;
      const totalEdges = edges.length;
      const density = (2 * totalEdges) / (totalNodes * (totalNodes - 1));
      const avgDegree = (2 * totalEdges) / totalNodes;

      // 计算节点中心性和重要性
      this.calculateNodeMetrics(documentNodes, conceptNodes, edges);

      // 聚类分析
      this.clusterNodes(documentNodes, conceptNodes, edges);

      // 创建知识图谱
      const graph: KnowledgeGraph = {
        id: `graph-${uuidv4()}`,
        name: 'YYC³文档知识图谱',
        description: 'YYC³文档闭环系统知识图谱',
        documentNodes,
        conceptNodes,
        edges,
        totalNodes,
        totalEdges,
        density,
        avgDegree,
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // 保存知识图谱
      await this.graphRepository.save(graph);

      this.logger.info('Knowledge graph built successfully', {
        totalNodes,
        totalEdges,
        density,
      });

      return graph;
    } catch (error) {
      this.logger.error('Failed to build knowledge graph', { error });
      throw error;
    }
  }

  /**
   * 添加文档到知识图谱
   * @param document 文档
   */
  async addDocumentToGraph(document: Document): Promise<void> {
    try {
      this.logger.info('Adding document to graph', { documentId: document.id });

      // 获取当前知识图谱
      const graph = await this.graphRepository.getLatest();
      if (!graph) {
        throw new Error('Knowledge graph not found');
      }

      // 创建文档节点
      const documentNode: DocumentNode = {
        id: `node-doc-${document.id}`,
        documentId: document.id,
        type: 'document',
        properties: {
          title: document.title,
          category: document.category,
          qualityScore: document.qualityScore,
          centrality: 0,
          importance: 0,
          cluster: 0,
        },
      };

      // 添加文档节点
      graph.documentNodes.push(documentNode);

      // 处理概念节点和边
      for (const conceptName of document.concepts) {
        let conceptNode = graph.conceptNodes.find(
          (n) => n.properties.name === conceptName
        );

        if (!conceptNode) {
          conceptNode = {
            id: `node-concept-${uuidv4()}`,
            conceptId: conceptName,
            type: 'concept',
            properties: {
              name: conceptName,
              category: this.categorizeConcept(conceptName),
              frequency: 1,
              importance: 0,
            },
          };
          graph.conceptNodes.push(conceptNode);
        } else {
          conceptNode.properties.frequency++;
        }

        // 添加文档-概念边
        graph.edges.push({
          id: `edge-${uuidv4()}`,
          source: documentNode.id,
          target: conceptNode.id,
          type: EdgeType.CONTAINS,
          weight: 1.0,
          properties: {
            relationship: '包含',
            strength: 1.0,
          },
        });
      }

      // 更新图统计
      graph.totalNodes = graph.documentNodes.length + graph.conceptNodes.length;
      graph.totalEdges = graph.edges.length;
      graph.density = (2 * graph.totalEdges) / (graph.totalNodes * (graph.totalNodes - 1));
      graph.avgDegree = (2 * graph.totalEdges) / graph.totalNodes;

      // 重新计算节点指标
      this.calculateNodeMetrics(graph.documentNodes, graph.conceptNodes, graph.edges);

      // 更新图谱
      graph.updatedAt = new Date();
      await this.graphRepository.update(graph.id, graph);

      this.logger.info('Document added to graph successfully', { documentId: document.id });
    } catch (error) {
      this.logger.error('Failed to add document to graph', { documentId: document.id, error });
      throw error;
    }
  }

  /**
   * 更新知识图谱中的文档
   * @param document 文档
   */
  async updateDocumentInGraph(document: Document): Promise<void> {
    try {
      this.logger.info('Updating document in graph', { documentId: document.id });

      // 先删除旧节点和边
      await this.removeDocumentFromGraph(document.id);

      // 再添加新节点和边
      await this.addDocumentToGraph(document);

      this.logger.info('Document updated in graph successfully', { documentId: document.id });
    } catch (error) {
      this.logger.error('Failed to update document in graph', { documentId: document.id, error });
      throw error;
    }
  }

  /**
   * 从知识图谱中删除文档
   * @param documentId 文档ID
   */
  async removeDocumentFromGraph(documentId: string): Promise<void> {
    try {
      this.logger.info('Removing document from graph', { documentId });

      // 获取当前知识图谱
      const graph = await this.graphRepository.getLatest();
      if (!graph) {
        throw new Error('Knowledge graph not found');
      }

      // 删除文档节点
      const docNodeId = `node-doc-${documentId}`;
      graph.documentNodes = graph.documentNodes.filter((n) => n.id !== docNodeId);

      // 删除相关边
      graph.edges = graph.edges.filter(
        (e) => e.source !== docNodeId && e.target !== docNodeId
      );

      // 更新图统计
      graph.totalNodes = graph.documentNodes.length + graph.conceptNodes.length;
      graph.totalEdges = graph.edges.length;
      graph.density = (2 * graph.totalEdges) / (graph.totalNodes * (graph.totalNodes - 1));
      graph.avgDegree = (2 * graph.totalEdges) / graph.totalNodes;

      // 更新图谱
      graph.updatedAt = new Date();
      await this.graphRepository.update(graph.id, graph);

      this.logger.info('Document removed from graph successfully', { documentId });
    } catch (error) {
      this.logger.error('Failed to remove document from graph', { documentId, error });
      throw error;
    }
  }

  /**
   * 获取知识图谱
   * @param params 查询参数
   * @returns 知识图谱
   */
  async getKnowledgeGraph(params: {
    includeDocuments?: boolean;
    includeConcepts?: boolean;
    includeEdges?: boolean;
    cluster?: number;
    minImportance?: number;
    limit?: number;
  } = {}): Promise<KnowledgeGraph> {
    try {
      const graph = await this.graphRepository.getLatest();
      if (!graph) {
        throw new Error('Knowledge graph not found');
      }

      // 过滤节点
      let filteredDocumentNodes = graph.documentNodes;
      let filteredConceptNodes = graph.conceptNodes;

      if (params.cluster !== undefined) {
        filteredDocumentNodes = filteredDocumentNodes.filter(
          (n) => n.properties.cluster === params.cluster
        );
        filteredConceptNodes = filteredConceptNodes.filter(
          (n) => n.properties.cluster !== undefined && n.properties.cluster === params.cluster
        );
      }

      if (params.minImportance !== undefined) {
        const minImportance = params.minImportance;
        filteredDocumentNodes = filteredDocumentNodes.filter(
          (n) => n.properties.importance >= minImportance
        );
        filteredConceptNodes = filteredConceptNodes.filter(
          (n) => n.properties.importance >= minImportance
        );
      }

      if (params.limit !== undefined) {
        filteredDocumentNodes = filteredDocumentNodes.slice(0, params.limit);
        filteredConceptNodes = filteredConceptNodes.slice(0, params.limit);
      }

      // 构建返回的图谱
      const result: KnowledgeGraph = {
        ...graph,
        documentNodes: params.includeDocuments !== false ? filteredDocumentNodes : [],
        conceptNodes: params.includeConcepts !== false ? filteredConceptNodes : [],
        edges: params.includeEdges !== false ? graph.edges : [],
      };

      return result;
    } catch (error) {
      this.logger.error('Failed to get knowledge graph', { params, error });
      throw error;
    }
  }

  /**
   * 获取节点详情
   * @param nodeId 节点ID
   * @returns 节点详情
   */
  async getNodeDetail(nodeId: string): Promise<DocumentNode | ConceptNode | null> {
    try {
      const graph = await this.graphRepository.getLatest();
      if (!graph) {
        return null;
      }

      const docNode = graph.documentNodes.find((n) => n.id === nodeId);
      if (docNode) {
        return docNode;
      }

      const conceptNode = graph.conceptNodes.find((n) => n.id === nodeId);
      if (conceptNode) {
        return conceptNode;
      }

      return null;
    } catch (error) {
      this.logger.error('Failed to get node detail', { nodeId, error });
      throw error;
    }
  }

  /**
   * 获取节点邻居
   * @param nodeId 节点ID
   * @param params 查询参数
   * @returns 邻居节点列表
   */
  async getNodeNeighbors(
    nodeId: string,
    params: {
      edgeType?: EdgeType;
      depth?: number;
      limit?: number;
    } = {}
  ): Promise<(DocumentNode | ConceptNode)[]> {
    try {
      const graph = await this.graphRepository.getLatest();
      if (!graph) {
        throw new Error('Knowledge graph not found');
      }

      const neighbors: (DocumentNode | ConceptNode)[] = [];
      const visited = new Set<string>([nodeId]);
      let currentLevel = [nodeId];

      for (let i = 0; i < (params.depth || 1); i++) {
        const nextLevel: string[] = [];

        for (const currentNodeId of currentLevel) {
          const relatedEdges = graph.edges.filter(
            (e) =>
              (e.source === currentNodeId || e.target === currentNodeId) &&
              (!params.edgeType || e.type === params.edgeType)
          );

          for (const edge of relatedEdges) {
            const neighborId = edge.source === currentNodeId ? edge.target : edge.source;

            if (!visited.has(neighborId)) {
              visited.add(neighborId);
              nextLevel.push(neighborId);

              const neighbor =
                graph.documentNodes.find((n) => n.id === neighborId) ||
                graph.conceptNodes.find((n) => n.id === neighborId);

              if (neighbor) {
                neighbors.push(neighbor);
              }
            }
          }
        }

        currentLevel = nextLevel;

        if (params.limit && neighbors.length >= params.limit) {
          return neighbors.slice(0, params.limit);
        }
      }

      return neighbors;
    } catch (error) {
      this.logger.error('Failed to get node neighbors', { nodeId, params, error });
      throw error;
    }
  }

  /**
   * 查找最短路径
   * @param sourceId 源节点ID
   * @param targetId 目标节点ID
   * @returns 路径节点列表
   */
  async findShortestPath(
    sourceId: string,
    targetId: string
  ): Promise<(DocumentNode | ConceptNode)[]> {
    try {
      const graph = await this.graphRepository.getLatest();
      if (!graph) {
        throw new Error('Knowledge graph not found');
      }

      // BFS算法查找最短路径
      const queue: { nodeId: string; path: string[] }[] = [
        { nodeId: sourceId, path: [sourceId] },
      ];
      const visited = new Set<string>([sourceId]);

      while (queue.length > 0) {
        const { nodeId, path } = queue.shift()!;

        if (nodeId === targetId) {
          // 将节点ID转换为节点对象
          return path.map((id) => {
            const docNode = graph.documentNodes.find((n) => n.id === id);
            const conceptNode = graph.conceptNodes.find((n) => n.id === id);
            return docNode || conceptNode!;
          });
        }

        const relatedEdges = graph.edges.filter(
          (e) => e.source === nodeId || e.target === nodeId
        );

        for (const edge of relatedEdges) {
          const neighborId = edge.source === nodeId ? edge.target : edge.source;

          if (!visited.has(neighborId)) {
            visited.add(neighborId);
            queue.push({ nodeId: neighborId, path: [...path, neighborId] });
          }
        }
      }

      return []; // 没有找到路径
    } catch (error) {
      this.logger.error('Failed to find shortest path', { sourceId, targetId, error });
      throw error;
    }
  }

  /**
   * 获取相关文档
   * @param documentId 文档ID
   * @param limit 数量限制
   * @returns 相关文档ID列表
   */
  async getRelatedDocuments(documentId: string, limit: number = 10): Promise<string[]> {
    try {
      const graph = await this.graphRepository.getLatest();
      if (!graph) {
        throw new Error('Knowledge graph not found');
      }

      const docNodeId = `node-doc-${documentId}`;
      const relatedDocIds: string[] = [];

      // 查找直接引用的文档
      const referenceEdges = graph.edges.filter(
        (e) => e.source === docNodeId && e.type === EdgeType.REFERENCES
      );

      for (const edge of referenceEdges) {
        const targetNode = graph.documentNodes.find((n) => n.id === edge.target);
        if (targetNode) {
          relatedDocIds.push(targetNode.documentId);
        }
      }

      // 查找共享概念的文档
      const conceptEdges = graph.edges.filter(
        (e) => e.source === docNodeId && e.type === EdgeType.CONTAINS
      );

      for (const edge of conceptEdges) {
        const conceptEdges2 = graph.edges.filter(
          (e) => e.target === edge.target && e.type === EdgeType.CONTAINS
        );

        for (const edge2 of conceptEdges2) {
          const sourceNode = graph.documentNodes.find((n) => n.id === edge2.source);
          if (sourceNode && sourceNode.documentId !== documentId) {
            if (!relatedDocIds.includes(sourceNode.documentId)) {
              relatedDocIds.push(sourceNode.documentId);
            }
          }
        }
      }

      return relatedDocIds.slice(0, limit);
    } catch (error) {
      this.logger.error('Failed to get related documents', { documentId, error });
      throw error;
    }
  }

  /**
   * 计算节点指标
   * @param documentNodes 文档节点
   * @param conceptNodes 概念节点
   * @param edges 边列表
   */
  private calculateNodeMetrics(
    documentNodes: DocumentNode[],
    conceptNodes: ConceptNode[],
    edges: GraphEdge[]
  ): void {
    const allNodes = [...documentNodes, ...conceptNodes];

    // 计算文档节点的度中心性
    documentNodes.forEach((node) => {
      const degree = edges.filter((e) => e.source === node.id || e.target === node.id).length;
      node.properties.centrality = degree / (allNodes.length - 1);
    });

    // 计算文档节点的重要性（基于中心性、质量）
    documentNodes.forEach((node) => {
      node.properties.importance =
        node.properties.centrality * 0.5 + node.properties.qualityScore / 100 * 0.5;
    });

    // 计算概念节点的重要性（基于频率）
    conceptNodes.forEach((node) => {
      // 计算概念节点的度中心性
      const degree = edges.filter((e) => e.source === node.id || e.target === node.id).length;
      const centrality = degree / (allNodes.length - 1);
      
      node.properties.importance =
        centrality * 0.7 + node.properties.frequency / 100 * 0.3;
    });
  }

  /**
   * 聚类节点
   * @param documentNodes 文档节点
   * @param conceptNodes 概念节点
   * @param edges 边列表
   */
  private clusterNodes(
    documentNodes: DocumentNode[],
    conceptNodes: ConceptNode[],
    edges: GraphEdge[]
  ): void {
    // 简单的基于分类的聚类
    const categoryClusters = new Map<string, number>();
    let clusterId = 0;

    documentNodes.forEach((node) => {
      const category = node.properties.category;
      if (!categoryClusters.has(category)) {
        categoryClusters.set(category, clusterId++);
      }
      node.properties.cluster = categoryClusters.get(category)!;
    });

    // 概念节点根据相关文档的聚类
    conceptNodes.forEach((node) => {
      const relatedDocNodes = documentNodes.filter((docNode) => {
        return edges.some(
          (e) =>
            e.source === docNode.id &&
            e.target === node.id &&
            e.type === EdgeType.CONTAINS
        );
      });

      if (relatedDocNodes.length > 0) {
        const clusters = relatedDocNodes.map((n) => n.properties.cluster);
        const mostCommonCluster = this.getMostCommon(clusters);
        node.properties.cluster = mostCommonCluster;
      }
    });
  }

  /**
   * 查找相关概念
   * @param documents 文档列表
   * @returns 概念对和强度
   */
  private findRelatedConcepts(
    documents: Document[]
  ): [string, string, number][] {
    const conceptPairs = new Map<string, number>();

    documents.forEach((doc) => {
      const concepts = doc.concepts;
      for (let i = 0; i < concepts.length; i++) {
        for (let j = i + 1; j < concepts.length; j++) {
          const pair = [concepts[i], concepts[j]].sort().join('-');
          conceptPairs.set(pair, (conceptPairs.get(pair) || 0) + 1);
        }
      }
    });

    // 转换为数组并归一化强度
    const maxCount = Math.max(...conceptPairs.values());
    const results: [string, string, number][] = [];

    conceptPairs.forEach((count, pair) => {
      const [concept1, concept2] = pair.split('-');
      const strength = count / maxCount;
      results.push([concept1, concept2, strength]);
    });

    // 只返回强度大于0.3的关联
    return results.filter(([_, __, strength]) => strength > 0.3);
  }

  /**
   * 分类概念
   * @param conceptName 概念名称
   * @returns 分类
   */
  private categorizeConcept(conceptName: string): string {
    // 简单的关键词匹配分类
    const categories: Record<string, string[]> = {
      架构: ['架构', '设计', '模式', '框架'],
      开发: ['开发', '编程', '代码', '实现'],
      测试: ['测试', '验证', '质量', '检查'],
      部署: ['部署', '发布', '运维', '监控'],
      数据: ['数据', '数据库', '存储', '缓存'],
      安全: ['安全', '认证', '授权', '加密'],
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => conceptName.includes(keyword))) {
        return category;
      }
    }

    return '其他';
  }

  /**
   * 获取最常见的元素
   * @param array 数组
   * @returns 最常见的元素
   */
  private getMostCommon<T>(array: T[]): T {
    const counts = new Map<T, number>();
    let maxCount = 0;
    let mostCommon = array[0];

    array.forEach((item) => {
      const count = (counts.get(item) || 0) + 1;
      counts.set(item, count);

      if (count > maxCount) {
        maxCount = count;
        mostCommon = item;
      }
    });

    return mostCommon;
  }

  /**
   * 搜索概念
   * @param query 搜索查询
   * @param category 分类过滤
   * @param limit 数量限制
   * @returns 概念节点列表
   */
  async searchConcepts(
    query: string,
    category?: string,
    limit: number = 20
  ): Promise<ConceptNode[]> {
    try {
      this.logger.info('Searching concepts', { query, category, limit });

      const graph = await this.graphRepository.getLatest();
      if (!graph) {
        throw new Error('Knowledge graph not found');
      }

      let concepts = graph.conceptNodes;

      // 按查询词过滤
      if (query) {
        const lowerQuery = query.toLowerCase();
        concepts = concepts.filter((c) =>
          c.properties.name.toLowerCase().includes(lowerQuery)
        );
      }

      // 按分类过滤
      if (category) {
        concepts = concepts.filter((c) => c.properties.category === category);
      }

      // 按重要性排序并限制数量
      concepts = concepts
        .sort((a, b) => b.properties.importance - a.properties.importance)
        .slice(0, limit);

      this.logger.info('Concepts searched successfully', {
        query,
        category,
        count: concepts.length,
      });

      return concepts;
    } catch (error) {
      this.logger.error('Failed to search concepts', { query, category, error });
      throw error;
    }
  }

  /**
   * 获取概念详情
   * @param conceptId 概念ID
   * @returns 概念节点
   */
  async getConcept(conceptId: string): Promise<ConceptNode | null> {
    try {
      this.logger.info('Getting concept details', { conceptId });

      const graph = await this.graphRepository.getLatest();
      if (!graph) {
        return null;
      }

      const concept = graph.conceptNodes.find((c) => c.id === conceptId);
      if (!concept) {
        return null;
      }

      this.logger.info('Concept details retrieved successfully', { conceptId });
      return concept;
    } catch (error) {
      this.logger.error('Failed to get concept details', { conceptId, error });
      throw error;
    }
  }

  /**
   * 获取相关概念
   * @param conceptId 概念ID
   * @param limit 数量限制
   * @returns 相关概念列表
   */
  async getRelatedConcepts(conceptId: string, limit: number = 10): Promise<ConceptNode[]> {
    try {
      this.logger.info('Getting related concepts', { conceptId, limit });

      const graph = await this.graphRepository.getLatest();
      if (!graph) {
        throw new Error('Knowledge graph not found');
      }

      const conceptNode = graph.conceptNodes.find((c) => c.id === conceptId);
      if (!conceptNode) {
        throw new Error('Concept not found');
      }

      // 查找与该概念相关的边
      const relatedEdges = graph.edges.filter(
        (e) =>
          (e.source === conceptId || e.target === conceptId) &&
          e.type === EdgeType.RELATED_TO
      );

      // 获取相关概念节点
      const relatedConceptIds = relatedEdges.map((e) =>
        e.source === conceptId ? e.target : e.source
      );

      const relatedConcepts = graph.conceptNodes.filter((c) =>
        relatedConceptIds.includes(c.id)
      );

      // 按边权重排序并限制数量
      const result = relatedConcepts
        .sort((a, b) => b.properties.importance - a.properties.importance)
        .slice(0, limit);

      this.logger.info('Related concepts retrieved successfully', {
        conceptId,
        count: result.length,
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to get related concepts', { conceptId, error });
      throw error;
    }
  }

  /**
   * 获取统计信息
   * @param version 版本号
   * @returns 统计信息
   */
  async getStatistics(version?: string): Promise<{
    totalNodes: number;
    totalEdges: number;
    density: number;
    avgDegree: number;
    documentCount: number;
    conceptCount: number;
    version: string;
    updatedAt: Date;
  }> {
    try {
      this.logger.info('Getting graph statistics', { version });

      const graph = version
        ? await this.graphRepository.getByVersion(version)
        : await this.graphRepository.getLatest();

      if (!graph) {
        throw new Error('Knowledge graph not found');
      }

      const statistics = {
        totalNodes: graph.totalNodes,
        totalEdges: graph.totalEdges,
        density: graph.density,
        avgDegree: graph.avgDegree,
        documentCount: graph.documentNodes.length,
        conceptCount: graph.conceptNodes.length,
        version: graph.version,
        updatedAt: graph.updatedAt,
      };

      this.logger.info('Graph statistics retrieved successfully', statistics);
      return statistics;
    } catch (error) {
      this.logger.error('Failed to get graph statistics', { version, error });
      throw error;
    }
  }

  /**
   * 获取版本列表
   * @returns 版本列表
   */
  async getVersions(): Promise<
    Array<{
      id: string;
      version: string;
      name: string;
      createdAt: Date;
      updatedAt: Date;
    }>
  > {
    try {
      this.logger.info('Getting graph versions');

      const graphs = await this.graphRepository.getAll();

      const versions = graphs.map((g) => ({
        id: g.id,
        version: g.version,
        name: g.name,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
      }));

      this.logger.info('Graph versions retrieved successfully', {
        count: versions.length,
      });

      return versions;
    } catch (error) {
      this.logger.error('Failed to get graph versions', { error });
      throw error;
    }
  }

  /**
   * 删除知识图谱
   * @param version 版本号
   */
  async deleteGraph(version?: string): Promise<void> {
    try {
      this.logger.info('Deleting knowledge graph', { version });

      if (version) {
        await this.graphRepository.deleteByVersion(version);
        this.logger.info('Knowledge graph version deleted successfully', { version });
      } else {
        await this.graphRepository.deleteAll();
        this.logger.info('All knowledge graphs deleted successfully');
      }
    } catch (error) {
      this.logger.error('Failed to delete knowledge graph', { version, error });
      throw error;
    }
  }

  /**
   * 导出知识图谱
   * @param options 导出选项
   * @returns 导出数据
   */
  async exportGraph(options: {
    format: 'json' | 'gexf' | 'graphml';
    version?: string;
  }): Promise<{
    format: string;
    data: string | object;
    filename: string;
  }> {
    try {
      this.logger.info('Exporting knowledge graph', options);

      const graph = options.version
        ? await this.graphRepository.getByVersion(options.version)
        : await this.graphRepository.getLatest();

      if (!graph) {
        throw new Error('Knowledge graph not found');
      }

      const filename = `knowledge-graph-${graph.version}.${options.format}`;
      let data: string | object;

      switch (options.format) {
        case 'json':
          data = JSON.stringify(graph, null, 2);
          break;
        case 'gexf':
          data = this.exportToGEXF(graph);
          break;
        case 'graphml':
          data = this.exportToGraphML(graph);
          break;
        default:
          throw new Error(`Unsupported format: ${options.format}`);
      }

      this.logger.info('Knowledge graph exported successfully', {
        format: options.format,
        filename,
      });

      return {
        format: options.format,
        data,
        filename,
      };
    } catch (error) {
      this.logger.error('Failed to export knowledge graph', { options, error });
      throw error;
    }
  }

  /**
   * 导出为GEXF格式
   * @param graph 知识图谱
   * @returns GEXF格式字符串
   */
  private exportToGEXF(graph: KnowledgeGraph): string {
    const nodes = graph.documentNodes.map((node) => ({
      id: node.id,
      label: node.properties.title,
      attributes: {
        type: 'document',
        category: node.properties.category,
        qualityScore: node.properties.qualityScore,
        importance: node.properties.importance,
      },
    }));

    const conceptNodes = graph.conceptNodes.map((node) => ({
      id: node.id,
      label: node.properties.name,
      attributes: {
        type: 'concept',
        category: node.properties.category,
        frequency: node.properties.frequency,
        importance: node.properties.importance,
      },
    }));

    const edges = graph.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      weight: edge.weight,
      label: edge.properties.relationship,
    }));

    const gexf = {
      graph: {
        mode: 'static',
        defaultedgetype: 'directed',
        nodes: [...nodes, ...conceptNodes],
        edges,
      },
    };

    return JSON.stringify(gexf, null, 2);
  }

  /**
   * 导出为GraphML格式
   * @param graph 知识图谱
   * @returns GraphML格式字符串
   */
  private exportToGraphML(graph: KnowledgeGraph): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<graphml xmlns="http://graphml.graphdrawing.org/xmlns">\n';

    // 定义键
    xml += '  <key id="d0" for="node" attr.name="type" attr.type="string"/>\n';
    xml += '  <key id="d1" for="node" attr.name="category" attr.type="string"/>\n';
    xml += '  <key id="d2" for="node" attr.name="importance" attr.type="double"/>\n';
    xml += '  <key id="d3" for="edge" attr.name="weight" attr.type="double"/>\n';
    xml += '  <key id="d4" for="edge" attr.name="relationship" attr.type="string"/>\n';

    xml += '  <graph id="G" edgedefault="directed">\n';

    // 添加文档节点
    graph.documentNodes.forEach((node) => {
      xml += `    <node id="${node.id}">\n`;
      xml += `      <data key="d0">document</data>\n`;
      xml += `      <data key="d1">${node.properties.category}</data>\n`;
      xml += `      <data key="d2">${node.properties.importance}</data>\n`;
      xml += `    </node>\n`;
    });

    // 添加概念节点
    graph.conceptNodes.forEach((node) => {
      xml += `    <node id="${node.id}">\n`;
      xml += `      <data key="d0">concept</data>\n`;
      xml += `      <data key="d1">${node.properties.category}</data>\n`;
      xml += `      <data key="d2">${node.properties.importance}</data>\n`;
      xml += `    </node>\n`;
    });

    // 添加边
    graph.edges.forEach((edge) => {
      xml += `    <edge id="${edge.id}" source="${edge.source}" target="${edge.target}">\n`;
      xml += `      <data key="d3">${edge.weight}</data>\n`;
      xml += `      <data key="d4">${edge.properties.relationship}</data>\n`;
      xml += `    </edge>\n`;
    });

    xml += '  </graph>\n';
    xml += '</graphml>';

    return xml;
  }

  /**
   * 可视化知识图谱
   * @param options 可视化选项
   * @returns 可视化数据
   */
  async visualize(options: {
    cluster?: number;
    minImportance?: number;
    layout?: 'force' | 'circular' | 'hierarchical';
  } = {}): Promise<{
    nodes: Array<{
      id: string;
      label: string;
      type: 'document' | 'concept';
      category: string;
      importance: number;
      cluster?: number;
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      weight: number;
      relationship: string;
    }>;
    layout: string;
    statistics: {
      totalNodes: number;
      totalEdges: number;
      documentCount: number;
      conceptCount: number;
    };
  }> {
    try {
      this.logger.info('Visualizing knowledge graph', options);

      const graph = await this.graphRepository.getLatest();
      if (!graph) {
        throw new Error('Knowledge graph not found');
      }

      // 过滤节点
      let filteredDocNodes = graph.documentNodes;
      let filteredConceptNodes = graph.conceptNodes;

      if (options.cluster !== undefined) {
        filteredDocNodes = filteredDocNodes.filter(
          (n) => n.properties.cluster === options.cluster
        );
      }

      if (options.minImportance !== undefined) {
        const minImportance = options.minImportance;
        filteredDocNodes = filteredDocNodes.filter(
          (n) => n.properties.importance >= minImportance
        );
        filteredConceptNodes = filteredConceptNodes.filter(
          (n) => n.properties.importance >= minImportance
        );
      }

      // 转换节点格式
      const nodes = [
        ...filteredDocNodes.map((node) => ({
          id: node.id,
          label: node.properties.title,
          type: 'document' as const,
          category: node.properties.category,
          importance: node.properties.importance,
          cluster: node.properties.cluster,
        })),
        ...filteredConceptNodes.map((node) => ({
          id: node.id,
          label: node.properties.name,
          type: 'concept' as const,
          category: node.properties.category,
          importance: node.properties.importance,
        })),
      ];

      // 转换边格式
      const edges = graph.edges
        .filter(
          (e) =>
            nodes.some((n) => n.id === e.source) &&
            nodes.some((n) => n.id === e.target)
        )
        .map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          weight: edge.weight,
          relationship: edge.properties.relationship,
        }));

      const visualizationData = {
        nodes,
        edges,
        layout: options.layout || 'force',
        statistics: {
          totalNodes: nodes.length,
          totalEdges: edges.length,
          documentCount: filteredDocNodes.length,
          conceptCount: filteredConceptNodes.length,
        },
      };

      this.logger.info('Knowledge graph visualized successfully', {
        nodeCount: nodes.length,
        edgeCount: edges.length,
      });

      return visualizationData;
    } catch (error) {
      this.logger.error('Failed to visualize knowledge graph', { options, error });
      throw error;
    }
  }
}
