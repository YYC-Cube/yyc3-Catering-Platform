/**
 * YYC³餐饮行业智能化平台 - 食品安全溯源服务
 */

import { Database } from '@/config/database'
import { Logger } from '@/utils/Logger'
import {
  CreateTraceRecordDto,
  UpdateTraceRecordDto,
  SafetyCheckDto,
  RecallProductDto
} from '../dto/FoodSafetyDto'

interface TraceRecord {
  id: string
  tenantId: string
  productId: string
  productName: string
  batchNumber: string
  supplierId?: string
  supplierName?: string
  productionDate: Date
  expiryDate: Date
  source: {
    type: 'farm' | 'factory' | 'market' | 'warehouse'
    name: string
    address: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  transportation: Array<{
    vehicleNumber: string
    driverName: string
    driverPhone: string
    departureTime: Date
    arrivalTime: Date
    temperatureRange: {
      min: number
      max: number
    }
    humidityRange: {
      min: number
      max: number
    }
  }>
  storage: Array<{
    location: string
    temperature: number
    humidity: number
    entryTime: Date
    exitTime?: Date
  }>
  qualityChecks: Array<{
    type: 'appearance' | 'smell' | 'taste' | 'laboratory'
    result: 'pass' | 'fail' | 'conditional'
    checkedBy: string
    checkedAt: Date
    notes?: string
  }>
  certificates: Array<{
    type: 'quality' | 'safety' | 'organic' | 'halal' | 'kosher'
    certificateNumber: string
    issuedBy: string
    issuedAt: Date
    expiryAt: Date
    documentUrl?: string
  }>
  status: 'in_transit' | 'in_storage' | 'in_use' | 'expired' | 'recalled'
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}

interface SafetyCheck {
  id: string
  tenantId: string
  productId: string
  productName: string
  batchNumber?: string
  checkType: 'microbial' | 'chemical' | 'physical' | 'sensory' | 'allergen'
  standard: string
  result: {
    passed: boolean
    score: number
    details: Array<{
      parameter: string
      value: number
      unit: string
      standard: number
      result: 'pass' | 'fail'
    }>
  }
  checkedBy: string
  checkedByName: string
  checkedAt: Date
  nextCheckDate?: Date
  recommendations?: string[]
  correctiveActions?: string[]
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

interface ProductRecall {
  id: string
  tenantId: string
  productId: string
  productName: string
  batchNumber: string
  reason: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  affectedQuantity: number
  distributedTo: Array<{
    storeId: string
    storeName: string
    quantity: number
    contactPerson: string
    contactPhone: string
  }>
  initiatedBy: string
  initiatedByName: string
  initiatedAt: Date
  expectedCompletion: Date
  actualCompletion?: Date
  status: 'initiated' | 'in_progress' | 'completed' | 'cancelled'
  publicNotification: {
    sent: boolean
    sentAt?: Date
    channels: string[]
    message?: string
  }
  correctiveActions: string[]
  preventiveMeasures: string[]
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export class FoodSafetyService {
  private db: Database
  private logger: Logger

  constructor() {
    this.db = Database.getInstance()
    this.logger = new Logger('FoodSafetyService')
  }

  /**
   * 创建溯源记录
   */
  async createTraceRecord(
    tenantId: string,
    createTraceDto: CreateTraceRecordDto,
    createdBy: string
  ): Promise<TraceRecord> {
    try {
      const traceId = this.generateTraceId()

      const query = `
        INSERT INTO food_trace_records (
          id,
          tenant_id,
          product_id,
          product_name,
          batch_number,
          supplier_id,
          supplier_name,
          production_date,
          expiry_date,
          source,
          transportation,
          storage,
          quality_checks,
          certificates,
          status,
          metadata,
          created_at,
          updated_at,
          created_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
        ) RETURNING *
      `

      const values = [
        traceId,
        tenantId,
        createTraceDto.productId,
        createTraceDto.productName,
        createTraceDto.batchNumber,
        createTraceDto.supplierId || null,
        createTraceDto.supplierName || null,
        createTraceDto.productionDate,
        createTraceDto.expiryDate,
        JSON.stringify(createTraceDto.source),
        JSON.stringify(createTraceDto.transportation || []),
        JSON.stringify(createTraceDto.storage || []),
        JSON.stringify(createTraceDto.qualityChecks || []),
        JSON.stringify(createTraceDto.certificates || []),
        createTraceDto.status || 'in_transit',
        JSON.stringify(createTraceDto.metadata || {}),
        new Date(),
        new Date(),
        createdBy
      ]

      const result = await this.db.query(query, values)
      const traceRecord = this.mapRowToTraceRecord(result.rows[0])

      this.logger.info('Created trace record', {
        tenantId,
        traceId,
        productId: createTraceDto.productId,
        batchNumber: createTraceDto.batchNumber
      })

      return traceRecord
    } catch (error) {
      this.logger.error('Failed to create trace record', { tenantId, error })
      throw error
    }
  }

  /**
   * 获取溯源记录列表
   */
  async getTraceRecords(
    tenantId: string,
    filters: {
      productId?: string
      batchNumber?: string
      startDate?: string
      endDate?: string
      page: number
      pageSize: number
    }
  ): Promise<{ records: TraceRecord[], total: number, page: number, pageSize: number }> {
    try {
      const {
        productId,
        batchNumber,
        startDate,
        endDate,
        page = 1,
        pageSize = 20
      } = filters

      const offset = (page - 1) * pageSize
      let whereConditions = ['tenant_id = $1']
      let params: any[] = [tenantId]
      let paramIndex = 2

      if (productId) {
        whereConditions.push(`product_id = $${paramIndex++}`)
        params.push(productId)
      }

      if (batchNumber) {
        whereConditions.push(`batch_number = $${paramIndex++}`)
        params.push(batchNumber)
      }

      if (startDate) {
        whereConditions.push(`created_at >= $${paramIndex++}`)
        params.push(startDate)
      }

      if (endDate) {
        whereConditions.push(`created_at <= $${paramIndex++}`)
        params.push(endDate)
      }

      const whereClause = whereConditions.join(' AND ')

      // 获取总数
      const countQuery = `
        SELECT COUNT(*) as total
        FROM food_trace_records
        WHERE ${whereClause}
      `
      const countResult = await this.db.query(countQuery, params)
      const total = parseInt(countResult.rows[0].total)

      // 获取记录列表
      const recordsQuery = `
        SELECT *
        FROM food_trace_records
        WHERE ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `
      params.push(pageSize, offset)

      const result = await this.db.query(recordsQuery, params)
      const records = result.rows.map(row => this.mapRowToTraceRecord(row))

      this.logger.info('Retrieved trace records', {
        tenantId,
        total,
        page,
        pageSize
      })

      return {
        records,
        total,
        page,
        pageSize
      }
    } catch (error) {
      this.logger.error('Failed to get trace records', { tenantId, error })
      throw error
    }
  }

  /**
   * 追溯产品链路
   */
  async traceProductChain(
    tenantId: string,
    productId: string,
    batchNumber: string
  ): Promise<{
    product: {
      id: string
      name: string
      batchNumber: string
      productionDate: Date
      expiryDate: Date
    }
    chain: Array<{
      step: string
      location: string
      timestamp: Date
      details: Record<string, any>
    }>
    qualityChecks: Array<{
      type: string
      result: string
      checkedAt: Date
      details: Record<string, any>
    }>
    certificates: Array<{
      type: string
      certificateNumber: string
      issuedBy: string
      issuedAt: Date
      expiryAt: Date
    }>
  }> {
    try {
      // 获取基础溯源记录
      const query = `
        SELECT * FROM food_trace_records
        WHERE tenant_id = $1 AND product_id = $2 AND batch_number = $3
        ORDER BY created_at DESC
        LIMIT 1
      `
      const result = await this.db.query(query, [tenantId, productId, batchNumber])

      if (result.rows.length === 0) {
        throw new Error('未找到产品的溯源记录')
      }

      const traceRecord = this.mapRowToTraceRecord(result.rows[0])

      // 构建追溯链路
      const chain = []

      // 添加源头信息
      chain.push({
        step: '源头',
        location: traceRecord.source.name,
        timestamp: traceRecord.productionDate,
        details: {
          type: traceRecord.source.type,
          address: traceRecord.source.address,
          coordinates: traceRecord.source.coordinates
        }
      })

      // 添加运输信息
      traceRecord.transportation.forEach(trans => {
        chain.push({
          step: '运输',
          location: `车辆 ${trans.vehicleNumber}`,
          timestamp: trans.departureTime,
          details: {
            driverName: trans.driverName,
            driverPhone: trans.driverPhone,
            arrivalTime: trans.arrivalTime,
            temperatureRange: trans.temperatureRange,
            humidityRange: trans.humidityRange
          }
        })
      })

      // 添加存储信息
      traceRecord.storage.forEach(storage => {
        chain.push({
          step: '仓储',
          location: storage.location,
          timestamp: storage.entryTime,
          details: {
            temperature: storage.temperature,
            humidity: storage.humidity,
            exitTime: storage.exitTime
          }
        })
      })

      this.logger.info('Traced product chain', {
        tenantId,
        productId,
        batchNumber,
        chainSteps: chain.length
      })

      return {
        product: {
          id: traceRecord.productId,
          name: traceRecord.productName,
          batchNumber: traceRecord.batchNumber,
          productionDate: traceRecord.productionDate,
          expiryDate: traceRecord.expiryDate
        },
        chain,
        qualityChecks: traceRecord.qualityChecks,
        certificates: traceRecord.certificates
      }
    } catch (error) {
      this.logger.error('Failed to trace product chain', { tenantId, productId, batchNumber, error })
      throw error
    }
  }

  /**
   * 执行安全检查
   */
  async performSafetyCheck(
    tenantId: string,
    safetyCheckDto: SafetyCheckDto,
    inspectedBy: string
  ): Promise<SafetyCheck> {
    try {
      const checkId = this.generateCheckId()

      const query = `
        INSERT INTO food_safety_checks (
          id,
          tenant_id,
          product_id,
          product_name,
          batch_number,
          check_type,
          standard,
          result,
          checked_by,
          checked_by_name,
          checked_at,
          next_check_date,
          recommendations,
          corrective_actions,
          status,
          metadata,
          created_at,
          updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
        ) RETURNING *
      `

      const values = [
        checkId,
        tenantId,
        safetyCheckDto.productId,
        safetyCheckDto.productName,
        safetyCheckDto.batchNumber || null,
        safetyCheckDto.checkType,
        safetyCheckDto.standard,
        JSON.stringify(safetyCheckDto.result),
        inspectedBy,
        safetyCheckDto.inspectedByName,
        new Date(),
        safetyCheckDto.nextCheckDate || null,
        safetyCheckDto.recommendations || null,
        safetyCheckDto.correctiveActions || null,
        safetyCheckDto.status || 'completed',
        JSON.stringify(safetyCheckDto.metadata || {}),
        new Date(),
        new Date()
      ]

      const result = await this.db.query(query, values)
      const safetyCheck = this.mapRowToSafetyCheck(result.rows[0])

      this.logger.info('Performed safety check', {
        tenantId,
        checkId,
        productId: safetyCheckDto.productId,
        checkType: safetyCheckDto.checkType,
        result: safetyCheckDto.result.passed
      })

      // 如果检查不通过，创建预警
      if (!safetyCheckDto.result.passed) {
        await this.createSafetyAlert(
          tenantId,
          safetyCheckDto.productId,
          safetyCheckDto.productName,
          'check_failure',
          `安全检查不通过: ${safetyCheckDto.checkType}`
        )
      }

      return safetyCheck
    } catch (error) {
      this.logger.error('Failed to perform safety check', { tenantId, error })
      throw error
    }
  }

  /**
   * 获取安全检查记录
   */
  async getSafetyChecks(
    tenantId: string,
    filters: {
      productId?: string
      checkType?: string
      status?: string
      startDate?: string
      endDate?: string
      page: number
      pageSize: number
    }
  ): Promise<{ checks: SafetyCheck[], total: number, page: number, pageSize: number }> {
    try {
      const {
        productId,
        checkType,
        status,
        startDate,
        endDate,
        page = 1,
        pageSize = 20
      } = filters

      const offset = (page - 1) * pageSize
      let whereConditions = ['tenant_id = $1']
      let params: any[] = [tenantId]
      let paramIndex = 2

      if (productId) {
        whereConditions.push(`product_id = $${paramIndex++}`)
        params.push(productId)
      }

      if (checkType) {
        whereConditions.push(`check_type = $${paramIndex++}`)
        params.push(checkType)
      }

      if (status) {
        whereConditions.push(`status = $${paramIndex++}`)
        params.push(status)
      }

      if (startDate) {
        whereConditions.push(`checked_at >= $${paramIndex++}`)
        params.push(startDate)
      }

      if (endDate) {
        whereConditions.push(`checked_at <= $${paramIndex++}`)
        params.push(endDate)
      }

      const whereClause = whereConditions.join(' AND ')

      // 获取总数
      const countQuery = `
        SELECT COUNT(*) as total
        FROM food_safety_checks
        WHERE ${whereClause}
      `
      const countResult = await this.db.query(countQuery, params)
      const total = parseInt(countResult.rows[0].total)

      // 获取检查记录
      const checksQuery = `
        SELECT *
        FROM food_safety_checks
        WHERE ${whereClause}
        ORDER BY checked_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `
      params.push(pageSize, offset)

      const result = await this.db.query(checksQuery, params)
      const checks = result.rows.map(row => this.mapRowToSafetyCheck(row))

      this.logger.info('Retrieved safety checks', {
        tenantId,
        total,
        page,
        pageSize
      })

      return {
        checks,
        total,
        page,
        pageSize
      }
    } catch (error) {
      this.logger.error('Failed to get safety checks', { tenantId, error })
      throw error
    }
  }

  /**
   * 产品召回
   */
  async recallProduct(
    tenantId: string,
    recallDto: RecallProductDto,
    initiatedBy: string
  ): Promise<ProductRecall> {
    try {
      const recallId = this.generateRecallId()

      const query = `
        INSERT INTO food_product_recalls (
          id,
          tenant_id,
          product_id,
          product_name,
          batch_number,
          reason,
          severity,
          affected_quantity,
          distributed_to,
          initiated_by,
          initiated_by_name,
          initiated_at,
          expected_completion,
          status,
          public_notification,
          corrective_actions,
          preventive_measures,
          metadata,
          created_at,
          updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
        ) RETURNING *
      `

      const values = [
        recallId,
        tenantId,
        recallDto.productId,
        recallDto.productName,
        recallDto.batchNumber,
        recallDto.reason,
        recallDto.severity,
        recallDto.affectedQuantity,
        JSON.stringify(recallDto.distributedTo || []),
        initiatedBy,
        recallDto.initiatedByName,
        new Date(),
        recallDto.expectedCompletion,
        'initiated',
        JSON.stringify(recallDto.publicNotification || {
          sent: false,
          channels: []
        }),
        JSON.stringify(recallDto.correctiveActions || []),
        JSON.stringify(recallDto.preventiveMeasures || []),
        JSON.stringify(recallDto.metadata || {}),
        new Date(),
        new Date()
      ]

      const result = await this.db.query(query, values)
      const recall = this.mapRowToRecall(result.rows[0])

      this.logger.info('Initiated product recall', {
        tenantId,
        recallId,
        productId: recallDto.productId,
        batchNumber: recallDto.batchNumber,
        severity: recallDto.severity
      })

      // 创建高级别预警
      await this.createSafetyAlert(
        tenantId,
        recallDto.productId,
        recallDto.productName,
        'product_recall',
        `产品召回: ${recallDto.reason}`,
        recallDto.severity === 'critical' ? 'critical' : 'high'
      )

      return recall
    } catch (error) {
      this.logger.error('Failed to recall product', { tenantId, error })
      throw error
    }
  }

  /**
   * 生成溯源二维码
   */
  async generateTraceQRCode(
    tenantId: string,
    productId: string,
    batchNumber: string
  ): Promise<{
    qrCodeData: string
    qrCodeImage: string
    traceUrl: string
  }> {
    try {
      const traceUrl = `${process.env.BASE_URL}/trace/${productId}/${batchNumber}`
      const qrCodeData = JSON.stringify({
        productId,
        batchNumber,
        tenantId,
        traceUrl,
        timestamp: new Date().toISOString()
      })

      // 这里应该使用实际的二维码生成库，比如 qrcode
      const qrCodeImage = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`

      this.logger.info('Generated trace QR code', {
        tenantId,
        productId,
        batchNumber
      })

      return {
        qrCodeData,
        qrCodeImage,
        traceUrl
      }
    } catch (error) {
      this.logger.error('Failed to generate trace QR code', { tenantId, productId, batchNumber, error })
      throw error
    }
  }

  /**
   * 私有方法
   */
  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateCheckId(): string {
    return `check_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateRecallId(): string {
    return `recall_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private mapRowToTraceRecord(row: any): TraceRecord {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      productId: row.product_id,
      productName: row.product_name,
      batchNumber: row.batch_number,
      supplierId: row.supplier_id,
      supplierName: row.supplier_name,
      productionDate: new Date(row.production_date),
      expiryDate: new Date(row.expiry_date),
      source: row.source,
      transportation: row.transportation || [],
      storage: row.storage || [],
      qualityChecks: row.quality_checks || [],
      certificates: row.certificates || [],
      status: row.status,
      metadata: row.metadata || {},
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      createdBy: row.created_by,
      updatedBy: row.updated_by
    }
  }

  private mapRowToSafetyCheck(row: any): SafetyCheck {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      productId: row.product_id,
      productName: row.product_name,
      batchNumber: row.batch_number,
      checkType: row.check_type,
      standard: row.standard,
      result: row.result,
      checkedBy: row.checked_by,
      checkedByName: row.checked_by_name,
      checkedAt: new Date(row.checked_at),
      nextCheckDate: row.next_check_date ? new Date(row.next_check_date) : undefined,
      recommendations: row.recommendations,
      correctiveActions: row.corrective_actions,
      status: row.status,
      metadata: row.metadata || {},
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }
  }

  private mapRowToRecall(row: any): ProductRecall {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      productId: row.product_id,
      productName: row.product_name,
      batchNumber: row.batch_number,
      reason: row.reason,
      severity: row.severity,
      affectedQuantity: row.affected_quantity,
      distributedTo: row.distributed_to || [],
      initiatedBy: row.initiated_by,
      initiatedByName: row.initiated_by_name,
      initiatedAt: new Date(row.initiated_at),
      expectedCompletion: new Date(row.expected_completion),
      actualCompletion: row.actual_completion ? new Date(row.actual_completion) : undefined,
      status: row.status,
      publicNotification: row.public_notification,
      correctiveActions: row.corrective_actions || [],
      preventiveMeasures: row.preventive_measures || [],
      metadata: row.metadata || {},
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }
  }

  private async createSafetyAlert(
    tenantId: string,
    productId: string,
    productName: string,
    alertType: string,
    message: string,
    level: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<void> {
    try {
      const alertId = this.generateAlertId()

      const query = `
        INSERT INTO food_safety_alerts (
          id,
          tenant_id,
          product_id,
          product_name,
          alert_type,
          level,
          message,
          status,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `

      await this.db.query(query, [
        alertId,
        tenantId,
        productId,
        productName,
        alertType,
        level,
        message,
        'active',
        new Date(),
        new Date()
      ])

      this.logger.info('Created safety alert', {
        tenantId,
        alertId,
        productId,
        alertType,
        level
      })
    } catch (error) {
      this.logger.error('Failed to create safety alert', { tenantId, error })
    }
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}