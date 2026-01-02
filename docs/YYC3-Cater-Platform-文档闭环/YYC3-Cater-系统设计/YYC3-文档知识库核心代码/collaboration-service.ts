/**
 * @file 协作编辑服务
 * @description 提供文档协作编辑功能，支持实时协作、版本控制、冲突解决等
 * @module services/collaboration-service
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { DocumentRepository } from './document.repository';
import { Logger } from './logger';

/**
 * 协作会话
 */
export interface CollaborationSession {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  joinedAt: Date;
  lastActiveAt: Date;
  cursor?: {
    position: number;
    selectionStart: number;
    selectionEnd: number;
  };
  isEditing: boolean;
}

/**
 * 文档编辑操作
 */
export interface DocumentEditOperation {
  id: string;
  documentId: string;
  userId: string;
  type: 'insert' | 'delete' | 'replace' | 'format';
  position: number;
  length?: number;
  content?: string;
  format?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    color?: string;
  };
  timestamp: Date;
  applied: boolean;
}

/**
 * 文档评论
 */
export interface DocumentComment {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  position: number;
  content: string;
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
  replies: DocumentCommentReply[];
}

/**
 * 评论回复
 */
export interface DocumentCommentReply {
  id: string;
  commentId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

/**
 * 协作编辑服务
 */
export class CollaborationService {
  private documentRepository: DocumentRepository;
  private logger: Logger;
  private sessions: Map<string, CollaborationSession[]> = new Map();
  private operations: Map<string, DocumentEditOperation[]> = new Map();
  private comments: Map<string, DocumentComment[]> = new Map();

  constructor() {
    this.documentRepository = new DocumentRepository();
    this.logger = new Logger('CollaborationService');
  }

  /**
   * 初始化服务
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing collaboration service');

      // 加载历史数据
      await this.loadHistoricalData();

      this.logger.info('Collaboration service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize collaboration service', { error });
      throw error;
    }
  }

  /**
   * 加入协作会话
   */
  async joinSession(documentId: string, userId: string, userName: string): Promise<CollaborationSession> {
    try {
      this.logger.info('User joining collaboration session', { documentId, userId, userName });

      // 检查文档是否存在
      const document = await this.documentRepository.findById(documentId);
      if (!document) {
        throw new Error('文档不存在');
      }

      // 创建会话
      const session: CollaborationSession = {
        id: this.generateId(),
        documentId,
        userId,
        userName,
        joinedAt: new Date(),
        lastActiveAt: new Date(),
        isEditing: false,
      };

      // 存储会话
      const sessions = this.sessions.get(documentId) || [];
      sessions.push(session);
      this.sessions.set(documentId, sessions);

      this.logger.info('User joined collaboration session successfully', {
        sessionId: session.id,
        documentId,
        userId,
      });

      return session;
    } catch (error) {
      this.logger.error('Failed to join collaboration session', { error, documentId, userId });
      throw error;
    }
  }

  /**
   * 离开协作会话
   */
  async leaveSession(documentId: string, userId: string): Promise<void> {
    try {
      this.logger.info('User leaving collaboration session', { documentId, userId });

      const sessions = this.sessions.get(documentId) || [];
      const filteredSessions = sessions.filter((s) => s.userId !== userId);

      if (filteredSessions.length !== sessions.length) {
        this.sessions.set(documentId, filteredSessions);
        this.logger.info('User left collaboration session successfully', { documentId, userId });
      } else {
        this.logger.warn('User session not found', { documentId, userId });
      }
    } catch (error) {
      this.logger.error('Failed to leave collaboration session', { error, documentId, userId });
      throw error;
    }
  }

  /**
   * 获取文档的活跃会话
   */
  async getActiveSessions(documentId: string): Promise<CollaborationSession[]> {
    try {
      const sessions = this.sessions.get(documentId) || [];
      return sessions.filter((s) => s.lastActiveAt > new Date(Date.now() - 5 * 60 * 1000)); // 5分钟内活跃
    } catch (error) {
      this.logger.error('Failed to get active sessions', { error, documentId });
      throw error;
    }
  }

  /**
   * 更新光标位置
   */
  async updateCursor(
    documentId: string,
    userId: string,
    cursor: CollaborationSession['cursor']
  ): Promise<void> {
    try {
      const sessions = this.sessions.get(documentId) || [];
      const session = sessions.find((s) => s.userId === userId);

      if (session) {
        session.cursor = cursor;
        session.lastActiveAt = new Date();
        this.logger.debug('Cursor updated', { documentId, userId, cursor });
      }
    } catch (error) {
      this.logger.error('Failed to update cursor', { error, documentId, userId });
      throw error;
    }
  }

  /**
   * 应用编辑操作
   */
  async applyEditOperation(operation: Omit<DocumentEditOperation, 'id' | 'timestamp' | 'applied'>): Promise<DocumentEditOperation> {
    try {
      this.logger.info('Applying edit operation', {
        documentId: operation.documentId,
        userId: operation.userId,
        type: operation.type,
        position: operation.position,
      });

      // 获取完整文档对象
      const document = await this.documentRepository.getById(operation.documentId);
      if (!document) {
        throw new Error('文档不存在');
      }

      // 创建操作记录
      const editOperation: DocumentEditOperation = {
        id: this.generateId(),
        timestamp: new Date(),
        applied: false,
        ...operation,
      };

      // 应用操作
      let newContent = document.content || '';
      switch (operation.type) {
        case 'insert':
          newContent =
            newContent.substring(0, operation.position) +
            (operation.content || '') +
            newContent.substring(operation.position);
          break;
        case 'delete':
          if (operation.length) {
            newContent =
              newContent.substring(0, operation.position) +
              newContent.substring(operation.position + operation.length);
          }
          break;
        case 'replace':
          if (operation.length && operation.content !== undefined) {
            newContent =
              newContent.substring(0, operation.position) +
              operation.content +
              newContent.substring(operation.position + operation.length);
          }
          break;
        case 'format':
          // 格式化操作不改变内容，只改变格式
          break;
      }

      // 更新文档
      document.content = newContent;
      document.updatedAt = new Date();
      await this.documentRepository.update(operation.documentId, document);

      // 标记操作为已应用
      editOperation.applied = true;

      // 存储操作
      const operations = this.operations.get(operation.documentId) || [];
      operations.push(editOperation);
      this.operations.set(operation.documentId, operations);

      this.logger.info('Edit operation applied successfully', {
        operationId: editOperation.id,
        documentId: operation.documentId,
      });

      return editOperation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error('Failed to apply edit operation', { error: errorMessage, operation });
      throw error;
    }
  }

  /**
   * 获取文档的编辑历史
   */
  async getEditHistory(documentId: string, limit: number = 50, offset: number = 0): Promise<DocumentEditOperation[]> {
    try {
      const operations = this.operations.get(documentId) || [];
      return operations
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(offset, offset + limit);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error('Failed to get edit history', { error: errorMessage, documentId });
      throw error;
    }
  }

  /**
   * 添加评论
   */
  async addComment(
    documentId: string,
    userId: string,
    userName: string,
    position: number,
    content: string
  ): Promise<DocumentComment> {
    try {
      this.logger.info('Adding comment', { documentId, userId, position });

      const comment: DocumentComment = {
        id: this.generateId(),
        documentId,
        userId,
        userName,
        position,
        content,
        resolved: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        replies: [],
      };

      const comments = this.comments.get(documentId) || [];
      comments.push(comment);
      this.comments.set(documentId, comments);

      this.logger.info('Comment added successfully', { commentId: comment.id, documentId });

      return comment;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error('Failed to add comment', { error: errorMessage, documentId, userId });
      throw error;
    }
  }

  /**
   * 回复评论
   */
  async replyComment(
    documentId: string,
    commentId: string,
    userId: string,
    userName: string,
    content: string
  ): Promise<DocumentCommentReply> {
    try {
      this.logger.info('Replying to comment', { documentId, commentId, userId });

      const comments = this.comments.get(documentId) || [];
      const comment = comments.find((c) => c.id === commentId);

      if (!comment) {
        throw new Error('评论不存在');
      }

      const reply: DocumentCommentReply = {
        id: this.generateId(),
        commentId,
        userId,
        userName,
        content,
        createdAt: new Date(),
      };

      comment.replies.push(reply);
      comment.updatedAt = new Date();

      this.logger.info('Comment replied successfully', { replyId: reply.id, commentId });

      return reply;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error('Failed to reply comment', { error: errorMessage, documentId, commentId });
      throw error;
    }
  }

  /**
   * 解决评论
   */
  async resolveComment(documentId: string, commentId: string, resolved: boolean): Promise<void> {
    try {
      this.logger.info('Resolving comment', { documentId, commentId, resolved });

      const comments = this.comments.get(documentId) || [];
      const comment = comments.find((c) => c.id === commentId);

      if (!comment) {
        throw new Error('评论不存在');
      }

      comment.resolved = resolved;
      comment.updatedAt = new Date();

      this.logger.info('Comment resolved successfully', { commentId, resolved });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error('Failed to resolve comment', { error: errorMessage, documentId, commentId });
      throw error;
    }
  }

  /**
   * 获取文档的评论
   */
  async getComments(documentId: string, includeResolved: boolean = false): Promise<DocumentComment[]> {
    try {
      const comments = this.comments.get(documentId) || [];
      return includeResolved ? comments : comments.filter((c) => !c.resolved);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error('Failed to get comments', { error: errorMessage, documentId });
      throw error;
    }
  }

  /**
   * 删除评论
   */
  async deleteComment(documentId: string, commentId: string): Promise<void> {
    try {
      this.logger.info('Deleting comment', { documentId, commentId });

      const comments = this.comments.get(documentId) || [];
      const filteredComments = comments.filter((c) => c.id !== commentId);

      if (filteredComments.length !== comments.length) {
        this.comments.set(documentId, filteredComments);
        this.logger.info('Comment deleted successfully', { commentId });
      } else {
        this.logger.warn('Comment not found', { documentId, commentId });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error('Failed to delete comment', { error: errorMessage, documentId, commentId });
      throw error;
    }
  }

  /**
   * 清理不活跃的会话
   */
  async cleanupInactiveSessions(timeoutMinutes: number = 30): Promise<void> {
    try {
      const timeout = timeoutMinutes * 60 * 1000;
      const cutoffTime = new Date(Date.now() - timeout);

      let cleanedCount = 0;

      for (const [documentId, sessions] of this.sessions.entries()) {
        const activeSessions = sessions.filter((s) => s.lastActiveAt > cutoffTime);
        if (activeSessions.length !== sessions.length) {
          this.sessions.set(documentId, activeSessions);
          cleanedCount += sessions.length - activeSessions.length;
        }
      }

      this.logger.info('Inactive sessions cleaned up', { timeoutMinutes, cleanedCount });
    } catch (error) {
      this.logger.error('Failed to cleanup inactive sessions', { error, timeoutMinutes });
      throw error;
    }
  }

  /**
   * 加载历史数据
   */
  private async loadHistoricalData(): Promise<void> {
    // TODO: 从持久化存储加载历史数据
    this.logger.info('Historical data loaded');
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
