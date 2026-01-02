/**
 * @file 配送分配状态枚举
 * @description 定义配送任务分配的各种状态
 * @module enums/assignmentStatus
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

export enum AssignmentStatus {
  // 待接受
  PENDING = 'pending',
  // 已接受
  ACCEPTED = 'accepted',
  // 已拒绝
  REJECTED = 'rejected',
  // 已完成
  COMPLETED = 'completed',
  // 已取消
  CANCELLED = 'cancelled'
}