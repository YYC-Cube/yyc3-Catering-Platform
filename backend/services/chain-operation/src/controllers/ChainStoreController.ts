/**
 * YYC³餐饮行业智能化平台 - 连锁店运营控制器
 */

import { Request, Response, NextFunction } from 'express'
import { ChainStoreService } from '../services/ChainStoreService'
import { CreateStoreDto, UpdateStoreDto, StoreQueryDto } from '../dto/ChainStoreDto'
import { ApiResponse } from '@/types/ApiResponse'
import { AuthenticatedRequest } from '@/types/Auth'

export class ChainStoreController {
  private chainStoreService: ChainStoreService

  constructor() {
    this.chainStoreService = new ChainStoreService()
  }

  /**
   * 获取所有门店列表
   */
  async getAllStores(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const query: StoreQueryDto = req.query as any
      const tenantId = req.user?.tenantId

      if (!tenantId) {
        res.status(401).json({
          success: false,
          message: '未授权访问',
          code: 'UNAUTHORIZED'
        } as ApiResponse)
        return
      }

      const result = await this.chainStoreService.getAllStores(tenantId, query)

      res.json({
        success: true,
        message: '获取门店列表成功',
        data: result,
        code: 'SUCCESS'
      } as ApiResponse)
    } catch (error) {
      console.error('Get all stores error:', error)
      res.status(500).json({
        success: false,
        message: '获取门店列表失败',
        code: 'INTERNAL_ERROR'
      } as ApiResponse)
    }
  }

  /**
   * 根据ID获取门店详情
   */
  async getStoreById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const tenantId = req.user?.tenantId

      if (!tenantId) {
        res.status(401).json({
          success: false,
          message: '未授权访问',
          code: 'UNAUTHORIZED'
        } as ApiResponse)
        return
      }

      const store = await this.chainStoreService.getStoreById(tenantId, id)

      if (!store) {
        res.status(404).json({
          success: false,
          message: '门店不存在',
          code: 'STORE_NOT_FOUND'
        } as ApiResponse)
        return
      }

      res.json({
        success: true,
        message: '获取门店详情成功',
        data: store,
        code: 'SUCCESS'
      } as ApiResponse)
    } catch (error) {
      console.error('Get store by ID error:', error)
      res.status(500).json({
        success: false,
        message: '获取门店详情失败',
        code: 'INTERNAL_ERROR'
      } as ApiResponse)
    }
  }

  /**
   * 创建新门店
   */
  async createStore(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const createStoreDto: CreateStoreDto = req.body
      const tenantId = req.user?.tenantId
      const createdBy = req.user?.id

      if (!tenantId || !createdBy) {
        res.status(401).json({
          success: false,
          message: '未授权访问',
          code: 'UNAUTHORIZED'
        } as ApiResponse)
        return
      }

      // 验证必填字段
      const validationError = this.validateCreateStoreDto(createStoreDto)
      if (validationError) {
        res.status(400).json({
          success: false,
          message: validationError,
          code: 'VALIDATION_ERROR'
        } as ApiResponse)
        return
      }

      const store = await this.chainStoreService.createStore(
        tenantId,
        createStoreDto,
        createdBy
      )

      res.status(201).json({
        success: true,
        message: '创建门店成功',
        data: store,
        code: 'SUCCESS'
      } as ApiResponse)
    } catch (error) {
      console.error('Create store error:', error)
      res.status(500).json({
        success: false,
        message: '创建门店失败',
        code: 'INTERNAL_ERROR'
      } as ApiResponse)
    }
  }

  /**
   * 更新门店信息
   */
  async updateStore(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const updateStoreDto: UpdateStoreDto = req.body
      const tenantId = req.user?.tenantId
      const updatedBy = req.user?.id

      if (!tenantId || !updatedBy) {
        res.status(401).json({
          success: false,
          message: '未授权访问',
          code: 'UNAUTHORIZED'
        } as ApiResponse)
        return
      }

      const store = await this.chainStoreService.updateStore(
        tenantId,
        id,
        updateStoreDto,
        updatedBy
      )

      if (!store) {
        res.status(404).json({
          success: false,
          message: '门店不存在',
          code: 'STORE_NOT_FOUND'
        } as ApiResponse)
        return
      }

      res.json({
        success: true,
        message: '更新门店信息成功',
        data: store,
        code: 'SUCCESS'
      } as ApiResponse)
    } catch (error) {
      console.error('Update store error:', error)
      res.status(500).json({
        success: false,
        message: '更新门店信息失败',
        code: 'INTERNAL_ERROR'
      } as ApiResponse)
    }
  }

  /**
   * 删除门店
   */
  async deleteStore(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const tenantId = req.user?.tenantId

      if (!tenantId) {
        res.status(401).json({
          success: false,
          message: '未授权访问',
          code: 'UNAUTHORIZED'
        } as ApiResponse)
        return
      }

      const success = await this.chainStoreService.deleteStore(tenantId, id)

      if (!success) {
        res.status(404).json({
          success: false,
          message: '门店不存在',
          code: 'STORE_NOT_FOUND'
        } as ApiResponse)
        return
      }

      res.json({
        success: true,
        message: '删除门店成功',
        code: 'SUCCESS'
      } as ApiResponse)
    } catch (error) {
      console.error('Delete store error:', error)
      res.status(500).json({
        success: false,
        message: '删除门店失败',
        code: 'INTERNAL_ERROR'
      } as ApiResponse)
    }
  }

  /**
   * 获取门店运营数据
   */
  async getStoreOperationData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { startDate, endDate } = req.query
      const tenantId = req.user?.tenantId

      if (!tenantId) {
        res.status(401).json({
          success: false,
          message: '未授权访问',
          code: 'UNAUTHORIZED'
        } as ApiResponse)
        return
      }

      const operationData = await this.chainStoreService.getStoreOperationData(
        tenantId,
        id,
        startDate as string,
        endDate as string
      )

      res.json({
        success: true,
        message: '获取门店运营数据成功',
        data: operationData,
        code: 'SUCCESS'
      } as ApiResponse)
    } catch (error) {
      console.error('Get store operation data error:', error)
      res.status(500).json({
        success: false,
        message: '获取门店运营数据失败',
        code: 'INTERNAL_ERROR'
      } as ApiResponse)
    }
  }

  /**
   * 获取门店业绩排名
   */
  async getStorePerformanceRanking(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { period = 'month' } = req.query
      const tenantId = req.user?.tenantId

      if (!tenantId) {
        res.status(401).json({
          success: false,
          message: '未授权访问',
          code: 'UNAUTHORIZED'
        } as ApiResponse)
        return
      }

      const ranking = await this.chainStoreService.getStorePerformanceRanking(
        tenantId,
        period as string
      )

      res.json({
        success: true,
        message: '获取门店业绩排名成功',
        data: ranking,
        code: 'SUCCESS'
      } as ApiResponse)
    } catch (error) {
      console.error('Get store performance ranking error:', error)
      res.status(500).json({
        success: false,
        message: '获取门店业绩排名失败',
        code: 'INTERNAL_ERROR'
      } as ApiResponse)
    }
  }

  /**
   * 获取门店库存预警
   */
  async getStoreInventoryAlerts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const tenantId = req.user?.tenantId

      if (!tenantId) {
        res.status(401).json({
          success: false,
          message: '未授权访问',
          code: 'UNAUTHORIZED'
        } as ApiResponse)
        return
      }

      const alerts = await this.chainStoreService.getStoreInventoryAlerts(tenantId, id)

      res.json({
        success: true,
        message: '获取门店库存预警成功',
        data: alerts,
        code: 'SUCCESS'
      } as ApiResponse)
    } catch (error) {
      console.error('Get store inventory alerts error:', error)
      res.status(500).json({
        success: false,
        message: '获取门店库存预警失败',
        code: 'INTERNAL_ERROR'
      } as ApiResponse)
    }
  }

  /**
   * 同步门店配置
   */
  async syncStoreConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { configType } = req.body
      const tenantId = req.user?.tenantId

      if (!tenantId) {
        res.status(401).json({
          success: false,
          message: '未授权访问',
          code: 'UNAUTHORIZED'
        } as ApiResponse)
        return
      }

      const result = await this.chainStoreService.syncStoreConfig(
        tenantId,
        id,
        configType
      )

      res.json({
        success: true,
        message: '同步门店配置成功',
        data: result,
        code: 'SUCCESS'
      } as ApiResponse)
    } catch (error) {
      console.error('Sync store config error:', error)
      res.status(500).json({
        success: false,
        message: '同步门店配置失败',
        code: 'INTERNAL_ERROR'
      } as ApiResponse)
    }
  }

  /**
   * 验证创建门店DTO
   */
  private validateCreateStoreDto(dto: CreateStoreDto): string | null {
    if (!dto.name || dto.name.trim().length === 0) {
      return '门店名称不能为空'
    }

    if (!dto.address || dto.address.trim().length === 0) {
      return '门店地址不能为空'
    }

    if (!dto.phone || dto.phone.trim().length === 0) {
      return '门店电话不能为空'
    }

    if (!dto.businessHours || dto.businessHours.length === 0) {
      return '营业时间不能为空'
    }

    if (!dto.managerId) {
      return '店长ID不能为空'
    }

    return null
  }
}