/**
 * YYC³餐饮行业智能化平台 - 连锁店运营服务
 */

import { Database } from '@/config/database'
import { Logger } from '@/utils/Logger'
import { CreateStoreDto, UpdateStoreDto, StoreQueryDto } from '../dto/ChainStoreDto'

interface Store {
  id: string
  tenantId: string
  name: string
  address: string
  phone: string
  email?: string
  businessHours: Array<{
    dayOfWeek: number
    openTime: string
    closeTime: string
    isClosed: boolean
  }>
  managerId: string
  managerName: string
  capacity: number
  tables: number
  status: 'active' | 'inactive' | 'maintenance'
  specialties: string[]
  features: string[]
  coordinates?: {
    latitude: number
    longitude: number
  }
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}

interface StoreOperationData {
  storeId: string
  period: {
    startDate: Date
    endDate: Date
  }
  revenue: {
    total: number
    food: number
    beverage: number
    other: number
  }
  orders: {
    total: number
    completed: number
    cancelled: number
    averageAmount: number
  }
  customers: {
    total: number
    new: number
    returning: number
  }
  performance: {
    revenueGrowth: number
    orderGrowth: number
    customerGrowth: number
    rating: number
  }
}

interface StorePerformanceRanking {
  period: string
  rankings: Array<{
    storeId: string
    storeName: string
    rank: number
    score: number
    metrics: {
      revenue: number
      orderCount: number
      customerCount: number
      rating: number
    }
  }>
}

interface InventoryAlert {
  itemId: string
  itemName: string
  currentStock: number
  minStock: number
  unit: string
  urgency: 'low' | 'medium' | 'high'
  lastRestocked: Date
}

export class ChainStoreService {
  private db: Database
  private logger: Logger

  constructor() {
    this.db = Database.getInstance()
    this.logger = new Logger('ChainStoreService')
  }

  /**
   * 获取所有门店列表
   */
  async getAllStores(
    tenantId: string,
    query: StoreQueryDto
  ): Promise<{ stores: Store[], total: number, page: number, pageSize: number }> {
    try {
      const {
        page = 1,
        pageSize = 20,
        status,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = query

      const offset = (page - 1) * pageSize
      let whereConditions = ['tenant_id = $1']
      let params: any[] = [tenantId]
      let paramIndex = 2

      if (status) {
        whereConditions.push(`status = $${paramIndex++}`)
        params.push(status)
      }

      if (search) {
        whereConditions.push(`(name ILIKE $${paramIndex++} OR address ILIKE $${paramIndex++})`)
        params.push(`%${search}%`, `%${search}%`)
      }

      const whereClause = whereConditions.join(' AND ')

      // 获取总数
      const countQuery = `
        SELECT COUNT(*) as total
        FROM stores
        WHERE ${whereClause}
      `
      const countResult = await this.db.query(countQuery, params)
      const total = parseInt(countResult.rows[0].total)

      // 获取门店列表
      const storesQuery = `
        SELECT
          id,
          tenant_id as "tenantId",
          name,
          address,
          phone,
          email,
          business_hours as "businessHours",
          manager_id as "managerId",
          manager_name as "managerName",
          capacity,
          tables,
          status,
          specialties,
          features,
          coordinates,
          metadata,
          created_at as "createdAt",
          updated_at as "updatedAt",
          created_by as "createdBy",
          updated_by as "updatedBy"
        FROM stores
        WHERE ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `
      params.push(pageSize, offset)

      const result = await this.db.query(storesQuery, params)
      const stores = result.rows.map(row => ({
        ...row,
        businessHours: row.businessHours || [],
        specialties: row.specialties || [],
        features: row.features || [],
        coordinates: row.coordinates,
        metadata: row.metadata || {}
      }))

      this.logger.info('Retrieved stores list', {
        tenantId,
        total,
        page,
        pageSize
      })

      return {
        stores,
        total,
        page,
        pageSize
      }
    } catch (error) {
      this.logger.error('Failed to get all stores', { tenantId, error })
      throw error
    }
  }

  /**
   * 根据ID获取门店详情
   */
  async getStoreById(tenantId: string, storeId: string): Promise<Store | null> {
    try {
      const query = `
        SELECT
          id,
          tenant_id as "tenantId",
          name,
          address,
          phone,
          email,
          business_hours as "businessHours",
          manager_id as "managerId",
          manager_name as "managerName",
          capacity,
          tables,
          status,
          specialties,
          features,
          coordinates,
          metadata,
          created_at as "createdAt",
          updated_at as "updatedAt",
          created_by as "createdBy",
          updated_by as "updatedBy"
        FROM stores
        WHERE id = $1 AND tenant_id = $2
      `

      const result = await this.db.query(query, [storeId, tenantId])

      if (result.rows.length === 0) {
        return null
      }

      const store = {
        ...result.rows[0],
        businessHours: result.rows[0].businessHours || [],
        specialties: result.rows[0].specialties || [],
        features: result.rows[0].features || [],
        coordinates: result.rows[0].coordinates,
        metadata: result.rows[0].metadata || {}
      }

      this.logger.info('Retrieved store by ID', { tenantId, storeId })
      return store
    } catch (error) {
      this.logger.error('Failed to get store by ID', { tenantId, storeId, error })
      throw error
    }
  }

  /**
   * 创建新门店
   */
  async createStore(
    tenantId: string,
    createStoreDto: CreateStoreDto,
    createdBy: string
  ): Promise<Store> {
    try {
      const storeId = this.generateStoreId()

      const query = `
        INSERT INTO stores (
          id,
          tenant_id,
          name,
          address,
          phone,
          email,
          business_hours,
          manager_id,
          manager_name,
          capacity,
          tables,
          status,
          specialties,
          features,
          coordinates,
          metadata,
          created_at,
          updated_at,
          created_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
        ) RETURNING *
      `

      const values = [
        storeId,
        tenantId,
        createStoreDto.name,
        createStoreDto.address,
        createStoreDto.phone,
        createStoreDto.email || null,
        JSON.stringify(createStoreDto.businessHours),
        createStoreDto.managerId,
        createStoreDto.managerName,
        createStoreDto.capacity || 0,
        createStoreDto.tables || 0,
        createStoreDto.status || 'active',
        JSON.stringify(createStoreDto.specialties || []),
        JSON.stringify(createStoreDto.features || []),
        createStoreDto.coordinates ? JSON.stringify(createStoreDto.coordinates) : null,
        JSON.stringify(createStoreDto.metadata || {}),
        new Date(),
        new Date(),
        createdBy
      ]

      const result = await this.db.query(query, values)
      const store = {
        ...result.rows[0],
        businessHours: result.rows[0].business_hours || [],
        specialties: result.rows[0].specialties || [],
        features: result.rows[0].features || [],
        coordinates: result.rows[0].coordinates,
        metadata: result.rows[0].metadata || {}
      }

      this.logger.info('Created new store', {
        tenantId,
        storeId,
        name: store.name
      })

      return store
    } catch (error) {
      this.logger.error('Failed to create store', { tenantId, error })
      throw error
    }
  }

  /**
   * 更新门店信息
   */
  async updateStore(
    tenantId: string,
    storeId: string,
    updateStoreDto: UpdateStoreDto,
    updatedBy: string
  ): Promise<Store | null> {
    try {
      const updateFields = []
      const values = []
      let paramIndex = 1

      if (updateStoreDto.name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`)
        values.push(updateStoreDto.name)
      }

      if (updateStoreDto.address !== undefined) {
        updateFields.push(`address = $${paramIndex++}`)
        values.push(updateStoreDto.address)
      }

      if (updateStoreDto.phone !== undefined) {
        updateFields.push(`phone = $${paramIndex++}`)
        values.push(updateStoreDto.phone)
      }

      if (updateStoreDto.email !== undefined) {
        updateFields.push(`email = $${paramIndex++}`)
        values.push(updateStoreDto.email)
      }

      if (updateStoreDto.businessHours !== undefined) {
        updateFields.push(`business_hours = $${paramIndex++}`)
        values.push(JSON.stringify(updateStoreDto.businessHours))
      }

      if (updateStoreDto.managerId !== undefined) {
        updateFields.push(`manager_id = $${paramIndex++}`)
        values.push(updateStoreDto.managerId)
      }

      if (updateStoreDto.managerName !== undefined) {
        updateFields.push(`manager_name = $${paramIndex++}`)
        values.push(updateStoreDto.managerName)
      }

      if (updateStoreDto.capacity !== undefined) {
        updateFields.push(`capacity = $${paramIndex++}`)
        values.push(updateStoreDto.capacity)
      }

      if (updateStoreDto.tables !== undefined) {
        updateFields.push(`tables = $${paramIndex++}`)
        values.push(updateStoreDto.tables)
      }

      if (updateStoreDto.status !== undefined) {
        updateFields.push(`status = $${paramIndex++}`)
        values.push(updateStoreDto.status)
      }

      if (updateStoreDto.specialties !== undefined) {
        updateFields.push(`specialties = $${paramIndex++}`)
        values.push(JSON.stringify(updateStoreDto.specialties))
      }

      if (updateStoreDto.features !== undefined) {
        updateFields.push(`features = $${paramIndex++}`)
        values.push(JSON.stringify(updateStoreDto.features))
      }

      if (updateStoreDto.coordinates !== undefined) {
        updateFields.push(`coordinates = $${paramIndex++}`)
        values.push(updateStoreDto.coordinates ? JSON.stringify(updateStoreDto.coordinates) : null)
      }

      if (updateStoreDto.metadata !== undefined) {
        updateFields.push(`metadata = $${paramIndex++}`)
        values.push(JSON.stringify(updateStoreDto.metadata))
      }

      if (updateFields.length === 0) {
        return await this.getStoreById(tenantId, storeId)
      }

      updateFields.push(`updated_at = $${paramIndex++}`)
      updateFields.push(`updated_by = $${paramIndex++}`)
      values.push(new Date(), updatedBy, storeId, tenantId)

      const query = `
        UPDATE stores
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}
        RETURNING *
      `

      const result = await this.db.query(query, values)

      if (result.rows.length === 0) {
        return null
      }

      const store = {
        ...result.rows[0],
        businessHours: result.rows[0].business_hours || [],
        specialties: result.rows[0].specialties || [],
        features: result.rows[0].features || [],
        coordinates: result.rows[0].coordinates,
        metadata: result.rows[0].metadata || {}
      }

      this.logger.info('Updated store', {
        tenantId,
        storeId,
        updatedFields: updateFields.length
      })

      return store
    } catch (error) {
      this.logger.error('Failed to update store', { tenantId, storeId, error })
      throw error
    }
  }

  /**
   * 删除门店
   */
  async deleteStore(tenantId: string, storeId: string): Promise<boolean> {
    try {
      const query = `
        DELETE FROM stores
        WHERE id = $1 AND tenant_id = $2
      `

      const result = await this.db.query(query, [storeId, tenantId])
      const success = result.rowCount > 0

      if (success) {
        this.logger.info('Deleted store', { tenantId, storeId })
      } else {
        this.logger.warn('Store not found for deletion', { tenantId, storeId })
      }

      return success
    } catch (error) {
      this.logger.error('Failed to delete store', { tenantId, storeId, error })
      throw error
    }
  }

  /**
   * 获取门店运营数据
   */
  async getStoreOperationData(
    tenantId: string,
    storeId: string,
    startDate?: string,
    endDate?: string
  ): Promise<StoreOperationData> {
    try {
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const end = endDate ? new Date(endDate) : new Date()

      // 获取营收数据
      const revenueQuery = `
        SELECT
          COALESCE(SUM(CASE WHEN category = 'food' THEN amount ELSE 0 END), 0) as food,
          COALESCE(SUM(CASE WHEN category = 'beverage' THEN amount ELSE 0 END), 0) as beverage,
          COALESCE(SUM(CASE WHEN category NOT IN ('food', 'beverage') THEN amount ELSE 0 END), 0) as other
        FROM orders
        WHERE store_id = $1 AND tenant_id = $2
          AND created_at BETWEEN $3 AND $4
          AND status = 'completed'
      `
      const revenueResult = await this.db.query(revenueQuery, [storeId, tenantId, start, end])
      const revenue = revenueResult.rows[0]

      // 获取订单数据
      const ordersQuery = `
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'completed') as completed,
          COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
          COALESCE(AVG(amount), 0) as average_amount
        FROM orders
        WHERE store_id = $1 AND tenant_id = $2
          AND created_at BETWEEN $3 AND $4
      `
      const ordersResult = await this.db.query(ordersQuery, [storeId, tenantId, start, end])
      const orders = ordersResult.rows[0]

      // 获取客户数据
      const customersQuery = `
        SELECT
          COUNT(DISTINCT customer_id) as total,
          COUNT(DISTINCT customer_id) FILTER (WHERE first_order_at >= $3) as new,
          COUNT(DISTINCT customer_id) FILTER (WHERE first_order_at < $3) as returning
        FROM orders
        WHERE store_id = $1 AND tenant_id = $2
          AND created_at BETWEEN $3 AND $4
      `
      const customersResult = await this.db.query(customersQuery, [storeId, tenantId, start, end])
      const customers = customersResult.rows[0]

      // 获取评价数据
      const ratingQuery = `
        SELECT COALESCE(AVG(rating), 0) as rating
        FROM reviews
        WHERE store_id = $1 AND tenant_id = $2
          AND created_at BETWEEN $3 AND $4
      `
      const ratingResult = await this.db.query(ratingQuery, [storeId, tenantId, start, end])
      const rating = parseFloat(ratingResult.rows[0].rating)

      const operationData: StoreOperationData = {
        storeId,
        period: {
          startDate: start,
          endDate: end
        },
        revenue: {
          total: parseFloat(revenue.food) + parseFloat(revenue.beverage) + parseFloat(revenue.other),
          food: parseFloat(revenue.food),
          beverage: parseFloat(revenue.beverage),
          other: parseFloat(revenue.other)
        },
        orders: {
          total: parseInt(orders.total),
          completed: parseInt(orders.completed),
          cancelled: parseInt(orders.cancelled),
          averageAmount: parseFloat(orders.average_amount)
        },
        customers: {
          total: parseInt(customers.total),
          new: parseInt(customers.new),
          returning: parseInt(customers.returning)
        },
        performance: {
          revenueGrowth: 0, // 需要与历史数据对比
          orderGrowth: 0,   // 需要与历史数据对比
          customerGrowth: 0, // 需要与历史数据对比
          rating
        }
      }

      this.logger.info('Retrieved store operation data', {
        tenantId,
        storeId,
        period: { start, end }
      })

      return operationData
    } catch (error) {
      this.logger.error('Failed to get store operation data', { tenantId, storeId, error })
      throw error
    }
  }

  /**
   * 获取门店业绩排名
   */
  async getStorePerformanceRanking(
    tenantId: string,
    period: string
  ): Promise<StorePerformanceRanking> {
    try {
      const { startDate, endDate } = this.getDateRangeByPeriod(period)

      const query = `
        SELECT
          s.id as "storeId",
          s.name as "storeName",
          COALESCE(SUM(o.amount), 0) as revenue,
          COUNT(o.id) as "orderCount",
          COUNT(DISTINCT o.customer_id) as "customerCount",
          COALESCE(AVG(r.rating), 0) as rating
        FROM stores s
        LEFT JOIN orders o ON s.id = o.store_id
          AND o.status = 'completed'
          AND o.created_at BETWEEN $1 AND $2
        LEFT JOIN reviews r ON s.id = r.store_id
          AND r.created_at BETWEEN $1 AND $2
        WHERE s.tenant_id = $3
        GROUP BY s.id, s.name
        ORDER BY revenue DESC
      `

      const result = await this.db.query(query, [startDate, endDate, tenantId])
      const rankings = result.rows.map((row, index) => ({
        storeId: row.storeId,
        storeName: row.storeName,
        rank: index + 1,
        score: this.calculatePerformanceScore(row),
        metrics: {
          revenue: parseFloat(row.revenue),
          orderCount: parseInt(row.orderCount),
          customerCount: parseInt(row.customerCount),
          rating: parseFloat(row.rating)
        }
      }))

      const performanceRanking: StorePerformanceRanking = {
        period,
        rankings
      }

      this.logger.info('Retrieved store performance ranking', {
        tenantId,
        period,
        storeCount: rankings.length
      })

      return performanceRanking
    } catch (error) {
      this.logger.error('Failed to get store performance ranking', { tenantId, period, error })
      throw error
    }
  }

  /**
   * 获取门店库存预警
   */
  async getStoreInventoryAlerts(tenantId: string, storeId: string): Promise<InventoryAlert[]> {
    try {
      const query = `
        SELECT
          i.id as "itemId",
          i.name as "itemName",
          i.current_stock as "currentStock",
          i.min_stock as "minStock",
          i.unit as "unit",
          i.last_restocked as "lastRestocked",
          CASE
            WHEN i.current_stock <= i.min_stock * 0.5 THEN 'high'
            WHEN i.current_stock <= i.min_stock * 0.8 THEN 'medium'
            ELSE 'low'
          END as urgency
        FROM inventory i
        WHERE i.store_id = $1 AND i.tenant_id = $2
          AND i.current_stock <= i.min_stock
        ORDER BY urgency DESC, (i.current_stock / i.min_stock) ASC
      `

      const result = await this.db.query(query, [storeId, tenantId])
      const alerts = result.rows.map(row => ({
        itemId: row.itemId,
        itemName: row.itemName,
        currentStock: row.currentStock,
        minStock: row.minStock,
        unit: row.unit,
        urgency: row.urgency,
        lastRestocked: new Date(row.lastRestocked)
      }))

      this.logger.info('Retrieved store inventory alerts', {
        tenantId,
        storeId,
        alertCount: alerts.length
      })

      return alerts
    } catch (error) {
      this.logger.error('Failed to get store inventory alerts', { tenantId, storeId, error })
      throw error
    }
  }

  /**
   * 同步门店配置
   */
  async syncStoreConfig(
    tenantId: string,
    storeId: string,
    configType: string
  ): Promise<{ success: boolean, syncedItems: string[] }> {
    try {
      const syncedItems: string[] = []

      switch (configType) {
        case 'menu':
          await this.syncMenuConfig(tenantId, storeId)
          syncedItems.push('menu')
          break
        case 'pricing':
          await this.syncPricingConfig(tenantId, storeId)
          syncedItems.push('pricing')
          break
        case 'promotions':
          await this.syncPromotionsConfig(tenantId, storeId)
          syncedItems.push('promotions')
          break
        case 'all':
          await this.syncMenuConfig(tenantId, storeId)
          await this.syncPricingConfig(tenantId, storeId)
          await this.syncPromotionsConfig(tenantId, storeId)
          syncedItems.push('menu', 'pricing', 'promotions')
          break
        default:
          throw new Error(`Unknown config type: ${configType}`)
      }

      this.logger.info('Synced store config', {
        tenantId,
        storeId,
        configType,
        syncedItems
      })

      return {
        success: true,
        syncedItems
      }
    } catch (error) {
      this.logger.error('Failed to sync store config', { tenantId, storeId, configType, error })
      throw error
    }
  }

  /**
   * 私有方法
   */
  private generateStoreId(): string {
    return `store_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getDateRangeByPeriod(period: string): { startDate: Date, endDate: Date } {
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    return { startDate, endDate: now }
  }

  private calculatePerformanceScore(row: any): number {
    // 简单的评分算法，可以根据实际需求调整
    const revenueScore = Math.min(row.revenue / 10000, 10) // 营收得分，最高10分
    const orderScore = Math.min(row.orderCount / 100, 10) // 订单数得分，最高10分
    const customerScore = Math.min(row.customerCount / 50, 10) // 客户数得分，最高10分
    const ratingScore = row.rating * 2 // 评分得分，最高10分

    return Math.round((revenueScore + orderScore + customerScore + ratingScore) * 2.5)
  }

  private async syncMenuConfig(tenantId: string, storeId: string): Promise<void> {
    // 实现菜单配置同步逻辑
  }

  private async syncPricingConfig(tenantId: string, storeId: string): Promise<void> {
    // 实现价格配置同步逻辑
  }

  private async syncPromotionsConfig(tenantId: string, storeId: string): Promise<void> {
    // 实现促销配置同步逻辑
  }
}