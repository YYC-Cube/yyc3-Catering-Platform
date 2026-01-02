/**
 * YYC³餐饮行业智能化平台 - 食品安全溯源控制器
 */

import { Request, Response } from 'express'
import { FoodSafetyService } from '../services/FoodSafetyService'
import { CreateTraceRecordDto, UpdateTraceRecordDto, SafetyCheckDto, RecallProductDto } from '../dto/FoodSafetyDto'
import { ApiResponse } from '@/types/ApiResponse'
import { AuthenticatedRequest } from '@/types/Auth'

export class FoodSafetyController {
  private foodSafetyService: FoodSafetyService

  constructor() {
    this.foodSafetyService = new FoodSafetyService()
  }

  /**
   * 创建溯源记录
   */
  async createTraceRecord(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const createTraceDto: CreateTraceRecordDto = req.body
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

      const traceRecord = await this.foodSafetyService.createTraceRecord(
        tenantId,
        createTraceDto,
        createdBy
      )

      res.status(201).json({
        success: true,
        message: '创建溯源记录成功',
        data: traceRecord,
        code: 'SUCCESS'
      } as ApiResponse)
    } catch (error) {
      console.error('Create trace record error:', error)
      res.status(500).json({
        success: false,
        message: '创建溯源记录失败',
        code: 'INTERNAL_ERROR'
      } as ApiResponse)
    }
  }

  /**
   * 获取溯源记录列表
   */
  async getTraceRecords(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { productId, batchNumber, startDate, endDate, page = 1, pageSize = 20 } = req.query
      const tenantId = req.user?.tenantId

      if (!tenantId) {
        res.status(401).json({
          success: false,
          message: '未授权访问',
          code: 'UNAUTHORIZED'
        } as ApiResponse)
        return
      }

      const result = await this.foodSafetyService.getTraceRecords(tenantId, {
        productId: productId as string,
        batchNumber: batchNumber as string,
        startDate: startDate as string,
        endDate: endDate as string,
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string)
      })

      res.json({
        success: true,
        message: '获取溯源记录成功',
        data: result,
        code: 'SUCCESS'
      } as ApiResponse)
    } catch (error) {
      console.error('Get trace records error:', error)
      res.status(500).json({
        success: false,
        message: '获取溯源记录失败',
        code: 'INTERNAL_ERROR'
      } as ApiResponse)
    }
  }

  /**
   * 追溯产品链路
   */
  async traceProductChain(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { productId, batchNumber } = req.params
      const tenantId = req.user?.tenantId

      if (!tenantId) {
        res.status(401).json({
          success: false,
          message: '未授权访问',
          code: 'UNAUTHORIZED'
        } as ApiResponse)
        return
      }

      const traceChain = await this.foodSafetyService.traceProductChain(
        tenantId,
        productId,
        batchNumber
      )

      res.json({
        success: true,
        message: '追溯产品链路成功',
        data: traceChain,
        code: 'SUCCESS'
      } as ApiResponse)
    } catch (error) {
      console.error('Trace product chain error:', error)
      res.status(500).json({
        success: false,
        message: '追溯产品链路失败',
        code: 'INTERNAL_ERROR'
      } as ApiResponse)
    }
  }

  /**
   * 执行安全检查
   */
  async performSafetyCheck(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const safetyCheckDto: SafetyCheckDto = req.body
      const tenantId = req.user?.tenantId
      const inspectedBy = req.user?.id

      if (!tenantId || !inspectedBy) {
        res.status(401).json({
          success: false,
          message: '未授权访问',
          code: 'UNAUTHORIZED'
        } as ApiResponse)
        return
      }

      const checkResult = await this.foodSafetyService.performSafetyCheck(
        tenantId,
        safetyCheckDto,
        inspectedBy
      )

      res.json({
        success: true,
        message: '执行安全检查成功',
        data: checkResult,
        code: 'SUCCESS'
      } as ApiResponse)
    } catch (error) {
      console.error('Perform safety check error:', error)
      res.status(500).json({
        success: false,
        message: '执行安全检查失败',
        code: 'INTERNAL_ERROR'
      } as ApiResponse)
    }
  }

  /**
   * 获取安全检查记录
   */
  async getSafetyChecks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { productId, checkType, status, startDate, endDate, page = 1, pageSize = 20 } = req.query
      const tenantId = req.user?.tenantId

      if (!tenantId) {
        res.status(401).json({
          success: false,
          message: '未授权访问',
          code: 'UNAUTHORIZED'
        } as ApiResponse)
        return
      }

      const result = await this.foodSafetyService.getSafetyChecks(tenantId, {
        productId: productId as string,
        checkType: checkType as string,
        status: status as string,
        startDate: startDate as string,
        endDate: endDate as string,
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string)
      })

      res.json({
        success: true,
        message: '获取安全检查记录成功',
        data: result,
        code: 'SUCCESS'
      } as ApiResponse)
    } catch (error) {
      console.error('Get safety checks error:', error)
      res.status(500).json({
        success: false,
        message: '获取安全检查记录失败',
        code: 'INTERNAL_ERROR'
      } as ApiResponse)
    }
  }

  /**
   * 产品召回
   */
  async recallProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const recallDto: RecallProductDto = req.body
      const tenantId = req.user?.tenantId
      const initiatedBy = req.user?.id

      if (!tenantId || !initiatedBy) {
        res.status(401).json({
          success: false,
          message: '未授权访问',
          code: 'UNAUTHORIZED'
        } as ApiResponse)
        return
      }

      const recallResult = await this.foodSafetyService.recallProduct(
        tenantId,
        recallDto,
        initiatedBy
      )

      res.json({
        success: true,
        message: '产品召回成功',
        data: recallResult,
        code: 'SUCCESS'
      } as ApiResponse)
    } catch (error) {
      console.error('Recall product error:', error)
      res.status(500).json({
        success: false,
        message: '产品召回失败',
        code: 'INTERNAL_ERROR'
      } as ApiResponse)
    }
  }

  /**
   * 获取召回记录
   */
  async getRecallRecords(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { status, startDate, endDate, page = 1, pageSize = 20 } = req.query
      const tenantId = req.user?.tenantId

      if (!tenantId) {
        res.status(401).json({
          success: false,
          message: '未授权访问',
          code: 'UNAUTHORIZED'
        } as ApiResponse)
        return
      }

      const result = await this.foodSafetyService.getRecallRecords(tenantId, {
        status: status as string,
        startDate: startDate as string,
        endDate: endDate as string,
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string)
      })

      res.json({
        success: true,
        message: '获取召回记录成功',
        data: result,
        code: 'SUCCESS'
      } as ApiResponse)
    } catch (error) {
      console.error('Get recall records error:', error)
      res.status(500).json({
        success: false,
        message: '获取召回记录失败',
        code: 'INTERNAL_ERROR'
      } as ApiResponse)
    }
  }

  /**
   * 获取证书管理
   */
  async getCertificates(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { type, status, expiryDate, page = 1, pageSize = 20 } = req.query
      const tenantId = req.user?.tenantId

      if (!tenantId) {
        res.status(401).json({
          success: false,
          message: '未授权访问',
          code: 'UNAUTHORIZED'
        } as ApiResponse)
        return
      }

      const result = await this.foodSafetyService.getCertificates(tenantId, {
        type: type as string,
        status: status as string,
        expiryDate: expiryDate as string,
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string)
      })

      res.json({
        success: true,
        message: '获取证书管理成功',
        data: result,
        code: 'SUCCESS'
      } as ApiResponse)
    } catch (error) {
      console.error('Get certificates error:', error)
      res.status(500).json({
        success: false,
        message: '获取证书管理失败',
        code: 'INTERNAL_ERROR'
      } as ApiResponse)
    }
  }

  /**
   * 获取安全报告
   */
  async getSafetyReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { reportType, startDate, endDate, storeId } = req.query
      const tenantId = req.user?.tenantId

      if (!tenantId) {
        res.status(401).json({
          success: false,
          message: '未授权访问',
          code: 'UNAUTHORIZED'
        } as ApiResponse)
        return
      }

      const report = await this.foodSafetyService.getSafetyReport(
        tenantId,
        reportType as string,
        startDate as string,
        endDate as string,
        storeId as string
      )

      res.json({
        success: true,
        message: '获取安全报告成功',
        data: report,
        code: 'SUCCESS'
      } as ApiResponse)
    } catch (error) {
      console.error('Get safety report error:', error)
      res.status(500).json({
        success: false,
        message: '获取安全报告失败',
        code: 'INTERNAL_ERROR'
      } as ApiResponse)
    }
  }

  /**
   * 获取预警信息
   */
  async getSafetyAlerts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { level, status, page = 1, pageSize = 20 } = req.query
      const tenantId = req.user?.tenantId

      if (!tenantId) {
        res.status(401).json({
          success: false,
          message: '未授权访问',
          code: 'UNAUTHORIZED'
        } as ApiResponse)
        return
      }

      const result = await this.foodSafetyService.getSafetyAlerts(tenantId, {
        level: level as string,
        status: status as string,
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string)
      })

      res.json({
        success: true,
        message: '获取预警信息成功',
        data: result,
        code: 'SUCCESS'
      } as ApiResponse)
    } catch (error) {
      console.error('Get safety alerts error:', error)
      res.status(500).json({
        success: false,
        message: '获取预警信息失败',
        code: 'INTERNAL_ERROR'
      } as ApiResponse)
    }
  }

  /**
   * 生成溯源二维码
   */
  async generateTraceQRCode(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { productId, batchNumber } = req.params
      const tenantId = req.user?.tenantId

      if (!tenantId) {
        res.status(401).json({
          success: false,
          message: '未授权访问',
          code: 'UNAUTHORIZED'
        } as ApiResponse)
        return
      }

      const qrCodeData = await this.foodSafetyService.generateTraceQRCode(
        tenantId,
        productId,
        batchNumber
      )

      res.json({
        success: true,
        message: '生成溯源二维码成功',
        data: qrCodeData,
        code: 'SUCCESS'
      } as ApiResponse)
    } catch (error) {
      console.error('Generate trace QR code error:', error)
      res.status(500).json({
        success: false,
        message: '生成溯源二维码失败',
        code: 'INTERNAL_ERROR'
      } as ApiResponse)
    }
  }
}