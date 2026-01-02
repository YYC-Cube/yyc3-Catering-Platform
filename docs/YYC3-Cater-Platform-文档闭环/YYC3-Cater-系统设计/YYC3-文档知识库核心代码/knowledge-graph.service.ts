/**
 * @file 知识图谱服务
 * @description 提供知识图谱的构建、查询和管理功能
 * @module services/knowledge-graph.service
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { v4 as uuidv4 } from 'uuid';
import {
  Document,
  KnowledgeGraph,
  DocumentNode,
  ConceptNode,
  GraphEdge,
  EdgeType,
  Concept,
} from './document.types';
import { GraphRepository } from './graph.repository';
import { ConceptRepository } from './concept.repository';
import { Logger } from './logger';

export class KnowledgeGraphService {
  private graphRepository: GraphRepository;
  private conceptRepository: ConceptRepository;
  private logger: Logger;
  private currentGraph: KnowledgeGraph | null = null;

  constructor() {
    this.graphRepository = new GraphRepository();
    this.conceptRepository = new ConceptRepository();
    this.logger = new Logger('KnowledgeGraphService');
  }

  /**
   * 初始化服务
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing knowledge graph service');
      await this.graphRepository.initialize?.();
      await this.conceptRepository.initialize?.();
      
      // 加载当前图谱
      this.currentGraph = await this.graphRepository.getLatest();
      
      this.logger.info('Knowledge graph service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize knowledge graph service', { error });
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

      // 创建文档节点
      const documentNode: DocumentNode = {
        id: uuidv4(),
        documentId: document.id,
        type: 'document',
        properties: {
          title: document.title,
          category: document.category,
          qualityScore: document.qualityScore,
          centrality: document.centrality || 0,
          importance: document.importance || 0,
          cluster: document.cluster || 0,
        },
      };

      // 添加文档节点ID到文档
      document.graphNodeId = documentNode.id;

      // 更新图谱
      await this.updateGraphWithDocument(documentNode, document);

      this.logger.info('Document added to graph successfully', { documentId: document.id });
    } catch (error) {
      this.logger.error('Failed to add document to graph', { documentId: document.id, error });
      throw error;
    }
  }

  /**
   * 更新文档在知识图谱中的信息
   * @param document 文档
   */
  async updateDocumentInGraph(document: Document): Promise<void> {
    try {
      this.logger.info('Updating document in graph', { documentId: document.id });

      if (!document.graphNodeId) {
        await this.addDocumentToGraph(document);
        return;
      }

      // 更新图谱中的文档节点
      await this.updateGraphWithDocument(null, document);

      this.logger.info('Document updated in graph successfully', { documentId: document.id });
    } catch (error) {
      this.logger.error('Failed to update document in graph', { documentId: document.id, error });
      throw error;
    }
  }

  /**
   * 从知识图谱中移除文档
   * @param documentId 文档ID
   */
  async removeDocumentFromGraph(documentId: string): Promise<void> {
    try {
      this.logger.info('Removing document from graph', { documentId });

      // 获取当前图谱
      const graph = await this.getCurrentGraph();
      if (!graph) {
        return;
      }

      // 查找并移除文档节点
      const documentNode = graph.documentNodes.find(node => node.documentId === documentId);
      if (documentNode) {
        // 移除相关边
        graph.edges = graph.edges.filter(edge => 
          edge.source !== documentNode.id && edge.target !== documentNode.id
        );
        
        // 移除文档节点
        graph.documentNodes = graph.documentNodes.filter(node => node.id !== documentNode.id);
        
        // 更新统计
        this.updateGraphStatistics(graph);
        
        // 保存图谱
        await this.graphRepository.update(graph.id, graph);
        this.currentGraph = graph;
      }

      this.logger.info('Document removed from graph successfully', { documentId });
    } catch (error) {
      this.logger.error('Failed to remove document from graph', { documentId, error });
      throw error;
    }
  }

  /**
   * 获取相关文档
   * @param documentId 文档ID
   * @param limit 限制数量
   * @returns 相关文档ID列表
   */
  async getRelatedDocuments(documentId: string, limit: number = 10): Promise<string[]> {
    try {
      this.logger.info('Getting related documents', { documentId, limit });

      const graph = await this.getCurrentGraph();
      if (!graph) {
        return [];
      }

      // 查找文档节点
      const documentNode = graph.documentNodes.find(node => node.documentId === documentId);
      if (!documentNode) {
        return [];
      }

      // 查找相邻节点
      const relatedIds: string[] = [];
      for (const edge of graph.edges) {
        if (edge.source === documentNode.id) {
          const targetNode = graph.documentNodes.find(node => node.id === edge.target);
          if (targetNode && relatedIds.length < limit) {
            relatedIds.push(targetNode.documentId);
          }
        } else if (edge.target === documentNode.id) {
          const sourceNode = graph.documentNodes.find(node => node.id === edge.source);
          if (sourceNode && relatedIds.length < limit) {
            relatedIds.push(sourceNode.documentId);
          }
        }
      }

      return relatedIds;
    } catch (error) {
      this.logger.error('Failed to get related documents', { documentId, error });
      throw error;
    }
  }

  /**
   * 构建知识图谱
   * @param documents 文档列表
   * @returns 知识图谱
   */
  async buildGraphFromDocuments(documents?: Document[]): Promise<KnowledgeGraph> {
    try {
      this.logger.info('Building knowledge graph from documents');

      // 创建新图谱
      const graph: KnowledgeGraph = {
        id: uuidv4(),
        name: 'Document Knowledge Graph',
        description: 'Knowledge graph built from documents',
        documentNodes: [],
        conceptNodes: [],
        edges: [],
        totalNodes: 0,
        totalEdges: 0,
        density: 0,
        avgDegree: 0,
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // 如果提供了文档，构建节点和边
      if (documents) {
        for (const document of documents) {
          // 创建文档节点
          const documentNode: DocumentNode = {
            id: uuidv4(),
            documentId: document.id,
            type: 'document',
            properties: {
              title: document.title,
              category: document.category,
              qualityScore: document.qualityScore,
              centrality: document.centrality || 0,
              importance: document.importance || 0,
              cluster: document.cluster || 0,
            },
          };
          graph.documentNodes.push(documentNode);

          // 创建概念节点和边
          for (const concept of document.concepts) {
            // 查找或创建概念节点
            let conceptNode = graph.conceptNodes.find(node => node.properties.name === concept);
            if (!conceptNode) {
              conceptNode = {
                id: uuidv4(),
                conceptId: concept,
                type: 'concept',
                properties: {
                  name: concept,
                  category: document.category,
                  frequency: 1,
                  importance: 0,
                },
              };
              graph.conceptNodes.push(conceptNode);
            } else {
              conceptNode.properties.frequency++;
            }

            // 创建文档-概念边
            const edge: GraphEdge = {
              id: uuidv4(),
              source: documentNode.id,
              target: conceptNode.id,
              type: EdgeType.CONTAINS,
              weight: 1,
              properties: {
                relationship: 'contains',
                strength: 1,
              },
            };
            graph.edges.push(edge);
          }
        }

        // 更新统计
        this.updateGraphStatistics(graph);
      }

      // 保存图谱
      await this.graphRepository.save(graph);
      this.currentGraph = graph;

      this.logger.info('Knowledge graph built successfully', { graphId: graph.id });
      return graph;
    } catch (error) {
      this.logger.error('Failed to build knowledge graph', { error });
      throw error;
    }
  }

  /**
   * 获取图谱
   * @param version 版本号
   * @returns 知识图谱
   */
  async getGraph(version?: string): Promise<KnowledgeGraph | null> {
    try {
      this.logger.info('Getting graph', { version });

      if (version) {
        return await this.graphRepository.getById(version);
      } else {
        return await this.getCurrentGraph();
      }
    } catch (error) {
      this.logger.error('Failed to get graph', { version, error });
      throw error;
    }
  }

  /**
   * 获取节点
   * @param nodeId 节点ID
   * @param version 版本号
   * @returns 节点
   */
  async getNode(nodeId: string, version?: string): Promise<DocumentNode | ConceptNode | null> {
    try {
      this.logger.info('Getting node', { nodeId, version });

      const graph = await this.getGraph(version);
      if (!graph) {
        return null;
      }

      // 查找节点
      const documentNode = graph.documentNodes.find(node => node.id === nodeId);
      if (documentNode) {
        return documentNode;
      }

      const conceptNode = graph.conceptNodes.find(node => node.id === nodeId);
      if (conceptNode) {
        return conceptNode;
      }

      return null;
    } catch (error) {
      this.logger.error('Failed to get node', { nodeId, version, error });
      throw error;
    }
  }

  /**
   * 获取节点的邻居
   * @param nodeId 节点ID
   * @param depth 深度
   * @param version 版本号
   * @returns 邻居节点列表
   */
  async getNodeNeighbors(nodeId: string, depth: number = 1, version?: string): Promise<(DocumentNode | ConceptNode)[]> {
    try {
      this.logger.info('Getting node neighbors', { nodeId, depth, version });

      const graph = await this.getGraph(version);
      if (!graph) {
        return [];
      }

      const neighbors: (DocumentNode | ConceptNode)[] = [];
      const visited = new Set<string>([nodeId]);
      const queue = [{ id: nodeId, currentDepth: 0 }];

      while (queue.length > 0 && neighbors.length < 100) {
        const { id, currentDepth } = queue.shift()!;

        if (currentDepth >= depth) {
          continue;
        }

        // 查找相邻节点
        for (const edge of graph.edges) {
          let neighborId: string | null = null;
          if (edge.source === id) {
            neighborId = edge.target;
          } else if (edge.target === id) {
            neighborId = edge.source;
          }

          if (neighborId && !visited.has(neighborId)) {
            visited.add(neighborId);
            
            const documentNode = graph.documentNodes.find(node => node.id === neighborId);
            if (documentNode) {
              neighbors.push(documentNode);
            }

            const conceptNode = graph.conceptNodes.find(node => node.id === neighborId);
            if (conceptNode) {
              neighbors.push(conceptNode);
            }

            queue.push({ id: neighborId, currentDepth: currentDepth + 1 });
          }
        }
      }

      return neighbors;
    } catch (error) {
      this.logger.error('Failed to get node neighbors', { nodeId, depth, version, error });
      throw error;
    }
  }

  /**
   * 查找路径
   * @param from 起始节点ID
   * @param to 目标节点ID
   * @param version 版本号
   * @returns 路径
   */
  async findPath(from: string, to: string, version?: string): Promise<(DocumentNode | ConceptNode)[] | null> {
    try {
      this.logger.info('Finding path', { from, to, version });

      const graph = await this.getGraph(version);
      if (!graph) {
        return null;
      }

      // BFS查找最短路径
      const visited = new Set<string>([from]);
      const queue: { id: string; path: (DocumentNode | ConceptNode)[] }[] = [
        { id: from, path: [] },
      ];

      while (queue.length > 0) {
        const { id, path } = queue.shift()!;

        if (id === to) {
          return path;
        }

        // 查找相邻节点
        for (const edge of graph.edges) {
          let neighborId: string | null = null;
          if (edge.source === id) {
            neighborId = edge.target;
          } else if (edge.target === id) {
            neighborId = edge.source;
          }

          if (neighborId && !visited.has(neighborId)) {
            visited.add(neighborId);

            const documentNode = graph.documentNodes.find(node => node.id === neighborId);
            const conceptNode = graph.conceptNodes.find(node => node.id === neighborId);
            const neighbor = documentNode || conceptNode;

            if (neighbor) {
              queue.push({ id: neighborId, path: [...path, neighbor] });
            }
          }
        }
      }

      return null;
    } catch (error) {
      this.logger.error('Failed to find path', { from, to, version, error });
      throw error;
    }
  }

  /**
   * 搜索概念
   * @param query 查询字符串
   * @param category 分类
   * @param limit 限制数量
   * @returns 概念列表
   */
  async searchConcepts(query: string, category?: string, limit: number = 20): Promise<Concept[]> {
    try {
      this.logger.info('Searching concepts', { query, category, limit });

      const concepts = await this.conceptRepository.search(query, category, limit);
      return concepts;
    } catch (error) {
      this.logger.error('Failed to search concepts', { query, category, limit, error });
      throw error;
    }
  }

  /**
   * 获取概念
   * @param conceptId 概念ID
   * @returns 概念
   */
  async getConcept(conceptId: string): Promise<Concept | null> {
    try {
      this.logger.info('Getting concept', { conceptId });

      const concept = await this.conceptRepository.getById(conceptId);
      return concept;
    } catch (error) {
      this.logger.error('Failed to get concept', { conceptId, error });
      throw error;
    }
  }

  /**
   * 获取相关概念
   * @param conceptId 概念ID
   * @param limit 限制数量
   * @returns 相关概念列表
   */
  async getRelatedConcepts(conceptId: string, limit: number = 10): Promise<Concept[]> {
    try {
      this.logger.info('Getting related concepts', { conceptId, limit });

      const concept = await this.conceptRepository.getById(conceptId);
      if (!concept) {
        return [];
      }

      const relatedConcepts = await this.conceptRepository.getRelated(conceptId, limit);
      return relatedConcepts;
    } catch (error) {
      this.logger.error('Failed to get related concepts', { conceptId, limit, error });
      throw error;
    }
  }

  /**
   * 获取统计信息
   * @param version 版本号
   * @returns 统计信息
   */
  async getStatistics(version?: string): Promise<{
    totalDocuments: number;
    totalConcepts: number;
    totalEdges: number;
    avgDocumentQuality: number;
    topConcepts: { name: string; frequency: number }[];
  }> {
    try {
      this.logger.info('Getting statistics', { version });

      const graph = await this.getGraph(version);
      if (!graph) {
        return {
          totalDocuments: 0,
          totalConcepts: 0,
          totalEdges: 0,
          avgDocumentQuality: 0,
          topConcepts: [],
        };
      }

      // 计算平均文档质量
      const avgDocumentQuality =
        graph.documentNodes.reduce((sum, node) => sum + node.properties.qualityScore, 0) /
        Math.max(graph.documentNodes.length, 1);

      // 获取热门概念
      const topConcepts = graph.conceptNodes
        .sort((a, b) => b.properties.frequency - a.properties.frequency)
        .slice(0, 10)
        .map(node => ({
          name: node.properties.name,
          frequency: node.properties.frequency,
        }));

      return {
        totalDocuments: graph.documentNodes.length,
        totalConcepts: graph.conceptNodes.length,
        totalEdges: graph.edges.length,
        avgDocumentQuality,
        topConcepts,
      };
    } catch (error) {
      this.logger.error('Failed to get statistics', { version, error });
      throw error;
    }
  }

  /**
   * 获取版本列表
   * @returns 版本列表
   */
  async getVersions(): Promise<KnowledgeGraph[]> {
    try {
      this.logger.info('Getting versions');

      const versions = await this.graphRepository.getAllVersions();
      return versions;
    } catch (error) {
      this.logger.error('Failed to get versions', { error });
      throw error;
    }
  }

  /**
   * 删除图谱
   * @param version 版本号
   */
  async deleteGraph(version: string): Promise<void> {
    try {
      this.logger.info('Deleting graph', { version });

      await this.graphRepository.delete(version);
      
      if (this.currentGraph?.id === version) {
        this.currentGraph = null;
      }

      this.logger.info('Graph deleted successfully', { version });
    } catch (error) {
      this.logger.error('Failed to delete graph', { version, error });
      throw error;
    }
  }

  /**
   * 导出图谱
   * @param options 导出选项
   * @returns 导出数据
   */
  async exportGraph(options: {
    format: 'json' | 'graphml' | 'gexf';
    version?: string;
  }): Promise<{ format: string; data: string; filename: string }> {
    try {
      this.logger.info('Exporting graph', { options });

      const graph = await this.getGraph(options.version);
      if (!graph) {
        throw new Error('Graph not found');
      }

      let data: string;
      let filename: string;

      switch (options.format) {
        case 'json':
          data = JSON.stringify(graph, null, 2);
          filename = `knowledge-graph-${graph.id}.json`;
          break;
        case 'graphml':
          data = this.convertToGraphML(graph);
          filename = `knowledge-graph-${graph.id}.graphml`;
          break;
        case 'gexf':
          data = this.convertToGEXF(graph);
          filename = `knowledge-graph-${graph.id}.gexf`;
          break;
        default:
          throw new Error(`Unsupported format: ${options.format}`);
      }

      return { format: options.format, data, filename };
    } catch (error) {
      this.logger.error('Failed to export graph', { options, error });
      throw error;
    }
  }

  /**
   * 获取可视化数据
   * @param options 可视化选项
   * @returns 可视化数据
   */
  async getVisualizationData(options: {
    version?: string;
    layout?: 'force' | 'circular' | 'hierarchical';
    maxNodes?: number;
    filter?: {
      minQuality?: number;
      categories?: string[];
    };
  }): Promise<{
    nodes: Array<{ id: string; label: string; type: string; [key: string]: any }>;
    edges: Array<{ id: string; source: string; target: string; [key: string]: any }>;
  }> {
    try {
      this.logger.info('Getting visualization data', { options });

      const graph = await this.getGraph(options.version);
      if (!graph) {
        return { nodes: [], edges: [] };
      }

      let nodes = [...graph.documentNodes, ...graph.conceptNodes].map(node => {
        const baseNode = {
          id: node.id,
          label: node.type === 'document' ? node.properties.title : node.properties.name,
          type: node.type,
          ...node.properties,
        };
        return baseNode;
      });

      let edges = graph.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
        ...edge.properties,
      }));

      // 应用过滤器
      if (options.filter) {
        if (options.filter.minQuality !== undefined) {
          const minQuality = options.filter.minQuality;
          nodes = nodes.filter(node => 
            node.type === 'concept' || (node.type === 'document' && (node as any).qualityScore >= minQuality)
          );
        }
        if (options.filter.categories && options.filter.categories.length > 0) {
          nodes = nodes.filter(node => 
            options.filter!.categories!.includes(node.category)
          );
        }
      }

      // 限制节点数量
      if (options.maxNodes && options.maxNodes > 0) {
        nodes = nodes.slice(0, options.maxNodes);
        
        // 只保留与这些节点相关的边
        const nodeIds = new Set(nodes.map(n => n.id));
        edges = edges.filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target));
      }

      return { nodes, edges };
    } catch (error) {
      this.logger.error('Failed to get visualization data', { options, error });
      throw error;
    }
  }

  /**
   * 获取当前图谱
   * @returns 当前图谱
   */
  async getCurrentGraph(): Promise<KnowledgeGraph | null> {
    if (!this.currentGraph) {
      this.currentGraph = await this.graphRepository.getLatest();
    }
    return this.currentGraph;
  }

  /**
   * 更新图谱中的文档
   * @param documentNode 文档节点（可选）
   * @param document 文档
   */
  private async updateGraphWithDocument(
    documentNode: DocumentNode | null,
    document: Document
  ): Promise<void> {
    const graph = await this.getCurrentGraph();
    if (!graph) {
      // 创建新图谱
      await this.buildGraphFromDocuments([document]);
      return;
    }

    if (documentNode) {
      // 添加新文档节点
      graph.documentNodes.push(documentNode);
    } else if (document.graphNodeId) {
      // 更新现有文档节点
      const existingNode = graph.documentNodes.find(node => node.id === document.graphNodeId);
      if (existingNode) {
        existingNode.properties.title = document.title;
        existingNode.properties.category = document.category;
        existingNode.properties.qualityScore = document.qualityScore;
        existingNode.properties.centrality = document.centrality || 0;
        existingNode.properties.importance = document.importance || 0;
        existingNode.properties.cluster = document.cluster || 0;
      }
    }

    // 更新概念节点和边
    for (const concept of document.concepts) {
      let conceptNode = graph.conceptNodes.find(node => node.properties.name === concept);
      if (!conceptNode) {
        conceptNode = {
          id: uuidv4(),
          conceptId: concept,
          type: 'concept',
          properties: {
            name: concept,
            category: document.category,
            frequency: 1,
            importance: 0,
          },
        };
        graph.conceptNodes.push(conceptNode);
      } else {
        conceptNode.properties.frequency++;
      }

      // 创建文档-概念边
      const documentNodeId = document.graphNodeId || documentNode?.id;
      if (documentNodeId) {
        const existingEdge = graph.edges.find(
          edge => edge.source === documentNodeId && edge.target === conceptNode.id
        );
        if (!existingEdge) {
          const edge: GraphEdge = {
            id: uuidv4(),
            source: documentNodeId,
            target: conceptNode.id,
            type: EdgeType.CONTAINS,
            weight: 1,
            properties: {
              relationship: 'contains',
              strength: 1,
            },
          };
          graph.edges.push(edge);
        }
      }
    }

    // 更新统计
    this.updateGraphStatistics(graph);

    // 保存图谱
    await this.graphRepository.update(graph.id, graph);
    this.currentGraph = graph;
  }

  /**
   * 更新图谱统计信息
   * @param graph 知识图谱
   */
  private updateGraphStatistics(graph: KnowledgeGraph): void {
    graph.totalNodes = graph.documentNodes.length + graph.conceptNodes.length;
    graph.totalEdges = graph.edges.length;
    
    // 计算图密度
    const maxEdges = (graph.totalNodes * (graph.totalNodes - 1)) / 2;
    graph.density = maxEdges > 0 ? graph.totalEdges / maxEdges : 0;
    
    // 计算平均度数
    const totalDegree = graph.edges.reduce((sum, edge) => {
      return sum + 2; // 每条边贡献2个度数
    }, 0);
    graph.avgDegree = graph.totalNodes > 0 ? totalDegree / graph.totalNodes : 0;
    
    graph.updatedAt = new Date();
  }

  /**
   * 转换为GraphML格式
   * @param graph 知识图谱
   * @returns GraphML字符串
   */
  private convertToGraphML(graph: KnowledgeGraph): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<graphml xmlns="http://graphml.graphdrawing.org/xmlns"\n';
    xml += '  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
    xml += '  xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns\n';
    xml += '  http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">\n';
    
    xml += '  <graph id="G" edgedefault="undirected">\n';
    
    // 添加节点
    for (const node of graph.documentNodes) {
      xml += `    <node id="${node.id}">\n`;
      xml += `      <data key="type">document</data>\n`;
      xml += `      <data key="title">${node.properties.title}</data>\n`;
      xml += `    </node>\n`;
    }
    
    for (const node of graph.conceptNodes) {
      xml += `    <node id="${node.id}">\n`;
      xml += `      <data key="type">concept</data>\n`;
      xml += `      <data key="name">${node.properties.name}</data>\n`;
      xml += `    </node>\n`;
    }
    
    // 添加边
    for (const edge of graph.edges) {
      xml += `    <edge id="${edge.id}" source="${edge.source}" target="${edge.target}"/>\n`;
    }
    
    xml += '  </graph>\n';
    xml += '</graphml>';
    
    return xml;
  }

  /**
   * 转换为GEXF格式
   * @param graph 知识图谱
   * @returns GEXF字符串
   */
  private convertToGEXF(graph: KnowledgeGraph): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<gexf xmlns="http://www.gexf.net/1.2draft" version="1.2">\n';
    xml += '  <graph mode="static" defaultedgetype="undirected">\n';
    
    xml += '    <nodes>\n';
    for (const node of graph.documentNodes) {
      xml += `      <node id="${node.id}" label="${node.properties.title}">\n`;
      xml += `        <attvalues>\n`;
      xml += `          <attvalue for="type" value="document"/>\n`;
      xml += `        </attvalues>\n`;
      xml += `      </node>\n`;
    }
    for (const node of graph.conceptNodes) {
      xml += `      <node id="${node.id}" label="${node.properties.name}">\n`;
      xml += `        <attvalues>\n`;
      xml += `          <attvalue for="type" value="concept"/>\n`;
      xml += `        </attvalues>\n`;
      xml += `      </node>\n`;
    }
    xml += '    </nodes>\n';
    
    xml += '    <edges>\n';
    for (const edge of graph.edges) {
      xml += `      <edge id="${edge.id}" source="${edge.source}" target="${edge.target}"/>\n`;
    }
    xml += '    </edges>\n';
    
    xml += '  </graph>\n';
    xml += '</gexf>';
    
    return xml;
  }
}
