/**
 * @file 配送服务业务逻辑层
 * @description 实现配送相关的核心业务逻辑
 * @module services/DeliveryService
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { Delivery } from '../models/Delivery.model';
import { DeliveryAssignment } from '../models/DeliveryAssignment.model';
import { DeliveryStatusHistory } from '../models/DeliveryStatusHistory.model';
import { DeliveryRating } from '../models/DeliveryRating.model';
import { DeliveryStatus } from '../enums/deliveryStatus';
import { AssignmentStatus } from '../enums/assignmentStatus';
import logger from '../config/logger';

// 接口定义
interface CreateDeliveryParams {
  order_id: string;
  delivery_address: string;
  delivery_longitude: number;
  delivery_latitude: number;
  restaurant_longitude: number;
  restaurant_latitude: number;
  estimated_delivery_time: number;
  delivery_fee: number;
  notes?: string;
}

interface UpdateDeliveryStatusParams {
  delivery_id: string;
  status: DeliveryStatus;
  reason?: string;
  operator_id?: string;
  operator_type?: 'system' | 'rider' | 'admin' | 'customer';
}

interface AssignDeliveryParams {
  delivery_id: string;
  rider_id: string;
}

interface CreateDeliveryRatingParams {
  delivery_id: string;
  user_id: string;
  rider_id: string;
  speed_rating: number;
  service_rating: number;
  rider_attitude_rating: number;
  comment?: string;
  is_anonymous?: boolean;
}

class DeliveryService {
  /**
   * 创建配送
   * @param params 创建配送的参数
   * @returns 创建的配送信息
   */
  async createDelivery(params: CreateDeliveryParams): Promise<Delivery> {
    try {
      // 计算配送距离
      const distance = this.calculateDistance(
        params.restaurant_latitude,
        params.restaurant_longitude,
        params.delivery_latitude,
        params.delivery_longitude
      );

      // 创建配送记录
      const delivery = await Delivery.create({
        id: uuidv4(),
        ...params,
        status: DeliveryStatus.PENDING,
      });

      // 创建初始状态历史记录
      await DeliveryStatusHistory.create({
        id: uuidv4(),
        delivery_id: delivery.id,
        status_time: new Date(),
        old_status: null,
        new_status: DeliveryStatus.PENDING,
        reason: '配送创建',
        operator_id: null,
        operator_type: 'system',
      });

      logger.info('创建配送成功', { delivery_id: delivery.id, order_id: params.order_id });
      return delivery;
    } catch (error) {
      logger.error('创建配送失败', { error: (error as Error).message, params });
      throw error;
    }
  }

  /**
   * 获取配送详情
   * @param delivery_id 配送ID
   * @returns 配送详情
   */
  async getDeliveryById(delivery_id: string): Promise<Delivery | null> {
    try {
      const delivery = await Delivery.findOne({
        where: { id: delivery_id },
        include: [
          { model: DeliveryAssignment },
          { model: DeliveryStatusHistory },
          { model: DeliveryRating },
        ],
      });

      if (!delivery) {
        logger.warn('配送不存在', { delivery_id });
        return null;
      }

      logger.info('获取配送详情成功', { delivery_id });
      return delivery;
    } catch (error) {
      logger.error('获取配送详情失败', { error: (error as Error).message, delivery_id });
      throw error;
    }
  }

  /**
   * 获取订单的配送信息
   * @param order_id 订单ID
   * @returns 配送信息
   */
  async getDeliveryByOrderId(order_id: string): Promise<Delivery | null> {
    try {
      const delivery = await Delivery.findOne({
        where: { order_id },
        include: [
          { model: DeliveryAssignment },
          { model: DeliveryStatusHistory },
          { model: DeliveryRating },
        ],
      });

      if (!delivery) {
        logger.warn('订单的配送不存在', { order_id });
        return null;
      }

      logger.info('获取订单配送信息成功', { order_id });
      return delivery;
    } catch (error) {
      logger.error('获取订单配送信息失败', { error: (error as Error).message, order_id });
      throw error;
    }
  }

  /**
   * 更新配送状态
   * @param params 更新配送状态的参数
   * @returns 更新后的配送信息
   */
  async updateDeliveryStatus(params: UpdateDeliveryStatusParams): Promise<Delivery> {
    try {
      const { delivery_id, status, reason, operator_id, operator_type } = params;

      // 获取当前配送信息
      const delivery = await Delivery.findByPk(delivery_id);
      if (!delivery) {
        throw new Error('配送不存在');
      }

      // 记录旧状态
      const oldStatus = delivery.status;

      // 更新配送状态
      delivery.status = status;
      await delivery.save();

      // 创建状态历史记录
      await DeliveryStatusHistory.create({
        id: uuidv4(),
        delivery_id,
        status_time: new Date(),
        old_status: oldStatus,
        new_status: status,
        reason: reason || '状态更新',
        operator_id,
        operator_type,
      });

      // 根据新状态执行相应的业务逻辑
      await this.handleStatusChange(delivery_id, status, oldStatus);

      logger.info('更新配送状态成功', { delivery_id, old_status: oldStatus, new_status: status });
      return delivery;
    } catch (error) {
      logger.error('更新配送状态失败', { error: (error as Error).message, params });
      throw error;
    }
  }

  /**
   * 分配配送任务给骑手
   * @param params 分配配送的参数
   * @returns 分配信息
   */
  async assignDelivery(params: AssignDeliveryParams): Promise<DeliveryAssignment> {
    try {
      const { delivery_id, rider_id } = params;

      // 检查配送是否存在
      const delivery = await Delivery.findByPk(delivery_id);
      if (!delivery) {
        throw new Error('配送不存在');
      }

      // 创建配送分配记录
      const assignment = await DeliveryAssignment.create({
        id: uuidv4(),
        delivery_id,
        rider_id,
        assignment_time: new Date(),
        status: AssignmentStatus.PENDING,
      });

      // 更新配送状态为已分配
      await this.updateDeliveryStatus({
        delivery_id,
        status: DeliveryStatus.ASSIGNED,
        reason: '分配给骑手',
        operator_id: null,
        operator_type: 'system',
      });

      logger.info('分配配送任务成功', { delivery_id, rider_id });
      return assignment;
    } catch (error) {
      logger.error('分配配送任务失败', { error: (error as Error).message, params });
      throw error;
    }
  }

  /**
   * 骑手接受配送任务
   * @param assignment_id 分配ID
   * @returns 更新后的分配信息
   */
  async acceptDelivery(assignment_id: string): Promise<DeliveryAssignment> {
    try {
      // 获取分配信息
      const assignment = await DeliveryAssignment.findByPk(assignment_id);
      if (!assignment) {
        throw new Error('配送分配不存在');
      }

      // 更新分配状态为已接受
      assignment.status = AssignmentStatus.ACCEPTED;
      assignment.accept_time = new Date();
      await assignment.save();

      // 更新配送状态为已接受
      await this.updateDeliveryStatus({
        delivery_id: assignment.delivery_id,
        status: DeliveryStatus.ACCEPTED,
        reason: '骑手接受配送',
        operator_id: assignment.rider_id,
        operator_type: 'rider',
      });

      logger.info('骑手接受配送任务成功', { assignment_id, rider_id: assignment.rider_id });
      return assignment;
    } catch (error) {
      logger.error('骑手接受配送任务失败', { error: (error as Error).message, assignment_id });
      throw error;
    }
  }

  /**
   * 骑手拒绝配送任务
   * @param assignment_id 分配ID
   * @param reason 拒绝原因
   * @returns 更新后的分配信息
   */
  async rejectDelivery(assignment_id: string, reason: string): Promise<DeliveryAssignment> {
    try {
      // 获取分配信息
      const assignment = await DeliveryAssignment.findByPk(assignment_id);
      if (!assignment) {
        throw new Error('配送分配不存在');
      }

      // 更新分配状态为已拒绝
      assignment.status = AssignmentStatus.REJECTED;
      assignment.reject_time = new Date();
      assignment.reject_reason = reason;
      await assignment.save();

      // 更新配送状态为待处理，以便重新分配
      await this.updateDeliveryStatus({
        delivery_id: assignment.delivery_id,
        status: DeliveryStatus.PENDING,
        reason: '骑手拒绝配送，重新分配',
        operator_id: assignment.rider_id,
        operator_type: 'rider',
      });

      logger.info('骑手拒绝配送任务成功', { assignment_id, rider_id: assignment.rider_id });
      return assignment;
    } catch (error) {
      logger.error('骑手拒绝配送任务失败', { error: (error as Error).message, assignment_id });
      throw error;
    }
  }

  /**
   * 创建配送评分
   * @param params 创建配送评分的参数
   * @returns 创建的评分信息
   */
  async createDeliveryRating(params: CreateDeliveryRatingParams): Promise<DeliveryRating> {
    try {
      // 计算平均评分
      const average_rating = (
        params.speed_rating + params.service_rating + params.rider_attitude_rating
      ) / 3;

      // 创建评分记录
      const rating = await DeliveryRating.create({
        id: uuidv4(),
        ...params,
        average_rating,
        is_anonymous: params.is_anonymous || false,
      });

      logger.info('创建配送评分成功', { delivery_id: params.delivery_id, user_id: params.user_id });
      return rating;
    } catch (error) {
      logger.error('创建配送评分失败', { error: (error as Error).message, params });
      throw error;
    }
  }

  /**
   * 计算两点之间的距离（单位：公里）
   * @param lat1 第一个点的纬度
   * @param lon1 第一个点的经度
   * @param lat2 第二个点的纬度
   * @param lon2 第二个点的经度
   * @returns 两点之间的距离（公里）
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // 地球半径（公里）
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 100) / 100; // 保留两位小数
  }

  /**
   * 将角度转换为弧度
   * @param deg 角度
   * @returns 弧度
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * 处理配送状态变更
   * @param delivery_id 配送ID
   * @param newStatus 新状态
   * @param oldStatus 旧状态
   */
  private async handleStatusChange(delivery_id: string, newStatus: DeliveryStatus, oldStatus: DeliveryStatus): Promise<void> {
    try {
      // 根据不同的状态执行不同的业务逻辑
      switch (newStatus) {
        case DeliveryStatus.DELIVERED:
          // 配送完成，更新实际配送时间
          const delivery = await Delivery.findByPk(delivery_id);
          if (delivery) {
            // 计算实际配送时间（从创建到完成）
            const createdAt = delivery.createdAt;
            const deliveredAt = new Date();
            const actualTime = Math.round((deliveredAt.getTime() - createdAt.getTime()) / (1000 * 60)); // 转换为分钟
            
            delivery.actual_delivery_time = actualTime;
            await delivery.save();
          }
          break;
        
        case DeliveryStatus.CANCELLED:
          // 配送取消，处理相关逻辑
          await this.handleDeliveryCancellation(delivery_id);
          break;
        
        case DeliveryStatus.FAILED:
          // 配送失败，处理相关逻辑
          await this.handleDeliveryFailure(delivery_id);
          break;
        
        default:
          // 其他状态无需特殊处理
          break;
      }

      // 发送配送状态变更通知
      await this.sendStatusNotification(delivery_id, newStatus, oldStatus);
    } catch (error) {
      logger.error('处理配送状态变更失败', { error: (error as Error).message, delivery_id, new_status: newStatus });
    }
  }

  /**
   * 处理配送取消
   * @param delivery_id 配送ID
   */
  private async handleDeliveryCancellation(delivery_id: string): Promise<void> {
    // 实现配送取消的业务逻辑
    // 例如：通知餐厅、通知用户、处理退款等
    logger.info('处理配送取消', { delivery_id });
  }

  /**
   * 处理配送失败
   * @param delivery_id 配送ID
   */
  private async handleDeliveryFailure(delivery_id: string): Promise<void> {
    // 实现配送失败的业务逻辑
    // 例如：通知餐厅、通知用户、安排重新配送等
    logger.info('处理配送失败', { delivery_id });
  }

  /**
   * 发送配送状态变更通知
   * @param delivery_id 配送ID
   * @param newStatus 新状态
   * @param oldStatus 旧状态
   */
  private async sendStatusNotification(delivery_id: string, newStatus: DeliveryStatus, oldStatus: DeliveryStatus): Promise<void> {
    try {
      // 调用通知服务发送通知
      const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL;
      if (notificationServiceUrl) {
        await axios.post(`${notificationServiceUrl}/api/notifications/delivery-status`, {
          delivery_id,
          new_status: newStatus,
          old_status: oldStatus,
        });
      }
    } catch (error) {
      logger.error('发送配送状态变更通知失败', { error: (error as Error).message, delivery_id });
      // 通知失败不影响主流程，记录日志即可
    }
  }
}

export const deliveryService = new DeliveryService();
export { DeliveryService };
export type { CreateDeliveryParams, UpdateDeliveryStatusParams, AssignDeliveryParams, CreateDeliveryRatingParams };