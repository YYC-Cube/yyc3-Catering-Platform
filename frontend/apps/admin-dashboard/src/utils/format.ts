/**
 * YYC³餐饮行业智能化平台 - 格式化工具函数
 * 专为餐饮业务场景设计的数据格式化
 */

// ================================
// 基础格式化函数
// ================================

/**
 * 格式化货币
 * @param amount 金额
 * @param currency 货币符号
 * @returns 格式化后的货币字符串
 */
export const formatCurrency = (amount: number, currency: string = '¥'): string => {
  if (isNaN(amount) || amount === null) return `${currency}0.00`
  return `${currency}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

/**
 * 格式化日期时间
 * @param date 日期对象或日期字符串
 * @param format 格式化模板
 * @returns 格式化后的日期时间字符串
 */
export const formatDateTime = (date: Date | string, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  const d = typeof date === 'string' ? new Date(date) : date

  if (isNaN(d.getTime())) return '--'

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化日期
 * @param date 日期对象或日期字符串
 * @param format 格式化模板
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: Date | string, format: string = 'YYYY-MM-DD'): string => {
  return formatDateTime(date, format)
}

/**
 * 格式化时间
 * @param date 日期对象或日期字符串
 * @param format 格式化模板
 * @returns 格式化后的时间字符串
 */
export const formatTime = (date: Date | string, format: string = 'HH:mm:ss'): string => {
  return formatDateTime(date, format)
}

/**
 * 格式化数字
 * @param num 数字
 * @param decimalPlaces 小数位数
 * @returns 格式化后的数字字符串
 */
export const formatNumber = (num: number, decimalPlaces: number = 0): string => {
  if (isNaN(num) || num === null) return '0'
  return num.toFixed(decimalPlaces).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 格式化百分比
 * @param value 百分比值（0-100）
 * @param decimalPlaces 小数位数
 * @returns 格式化后的百分比字符串
 */
export const formatPercentage = (value: number, decimalPlaces: number = 1): string => {
  if (isNaN(value) || value === null) return '0%'
  return `${value.toFixed(decimalPlaces)}%`
}

// ================================
// 餐饮业务专用格式化函数
// ================================

/**
 * 智能格式化大数字
 * @param value 数值
 */
export const formatLargeNumber = (value: number): string => {
  if (isNaN(value) || value === null) return '0'

  const abs = Math.abs(value)

  if (abs >= 100000000) {
    return `${(value / 100000000).toFixed(1)}亿`
  } else if (abs >= 10000) {
    return `${(value / 10000).toFixed(1)}万`
  } else if (abs >= 1000) {
    return formatNumber(value, 0)
  } else {
    return formatNumber(value, abs < 10 ? 1 : 0)
  }
}

/**
 * 获取相对时间显示
 * @param date 日期对象
 */
export const getRelativeTime = (date: Date | number | string): string => {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}天前`
  } else if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else {
    return '刚刚'
  }
}

/**
 * 格式化订单状态
 * @param status 订单状态码
 */
export const formatOrderStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': '待确认',
    'confirmed': '已确认',
    'preparing': '制作中',
    'ready': '待取餐',
    'delivering': '配送中',
    'completed': '已完成',
    'cancelled': '已取消',
    'refunded': '已退款'
  }
  return statusMap[status] || status
}

/**
 * 获取订单状态颜色
 * @param status 订单状态码
 */
export const getOrderStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'pending': 'var(--color-warning)',
    'confirmed': 'var(--color-primary)',
    'preparing': 'var(--color-secondary)',
    'ready': 'var(--color-success)',
    'delivering': 'var(--color-primary)',
    'completed': 'var(--color-success)',
    'cancelled': 'var(--color-danger)',
    'refunded': 'var(--color-neutral)'
  }
  return colorMap[status] || 'var(--color-neutral)'
}

/**
 * 格式化库存状态
 * @param current 当前库存
 * @param min 最小库存阈值
 * @param max 最大库存
 */
export const formatInventoryStatus = (
  current: number,
  min: number = 10,
  max: number = 1000
): {
  status: 'sufficient' | 'warning' | 'danger' | 'overstock'
  text: string
  color: string
  percentage: number
} => {
  const percentage = (current / max) * 100

  if (current === 0) {
    return {
      status: 'danger',
      text: '缺货',
      color: 'var(--color-danger)',
      percentage: 0
    }
  } else if (current <= min) {
    return {
      status: 'warning',
      text: `库存不足 (${current})`,
      color: 'var(--color-warning)',
      percentage
    }
  } else if (current >= max * 0.9) {
    return {
      status: 'overstock',
      text: `库存充足 (${current})`,
      color: 'var(--color-secondary)',
      percentage
    }
  } else {
    return {
      status: 'sufficient',
      text: `库存正常 (${current})`,
      color: 'var(--color-success)',
      percentage
    }
  }
}

/**
 * 格式化营业时长
 * @param minutes 分钟数
 */
export const formatBusinessDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}分钟`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours}小时`
  } else {
    return `${hours}小时${remainingMinutes}分钟`
  }
}

/**
 * 格式化菜品热度
 * @param score 热度分数 (0-100)
 */
export const formatPopularityScore = (score: number): {
  text: string
  level: 'low' | 'medium' | 'high'
  color: string
} => {
  if (score >= 80) {
    return {
      text: `${score}分 - 爆款`,
      level: 'high',
      color: 'var(--color-danger)'
    }
  } else if (score >= 60) {
    return {
      text: `${score}分 - 热销`,
      level: 'medium',
      color: 'var(--color-warning)'
    }
  } else if (score >= 40) {
    return {
      text: `${score}分 - 常规`,
      level: 'low',
      color: 'var(--color-neutral)'
    }
  } else {
    return {
      text: `${score}分 - 冷门`,
      level: 'low',
      color: 'var(--color-text-secondary)'
    }
  }
}

/**
 * 格式化客户评分
 * @param rating 评分 (0-5)
 */
export const formatCustomerRating = (rating: number): {
  stars: string
  text: string
  color: string
  level: 'excellent' | 'good' | 'average' | 'poor'
} => {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  let stars = '★'.repeat(fullStars)
  if (hasHalfStar) stars += '☆'
  stars += '☆'.repeat(emptyStars)

  let color = 'var(--color-neutral)'
  let level: 'excellent' | 'good' | 'average' | 'poor' = 'average'

  if (rating >= 4.5) {
    color = 'var(--color-success)'
    level = 'excellent'
  } else if (rating >= 3.5) {
    color = 'var(--color-warning)'
    level = 'good'
  } else if (rating >= 2.5) {
    color = 'var(--color-neutral)'
    level = 'average'
  } else {
    color = 'var(--color-danger)'
    level = 'poor'
  }

  return {
    stars,
    text: `${rating.toFixed(1)}分`,
    color,
    level
  }
}

/**
 * 格式化手机号显示
 * @param phone 手机号
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '--'

  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`
  }

  return phone
}

/**
 * 格式化桌号显示
 * @param tableId 桌号ID
 */
export const formatTableId = (tableId: string): string => {
  if (!tableId) return '--'

  // 提取数字部分
  const tableNumber = tableId.replace(/[^\d]/g, '')

  if (tableNumber) {
    return `${tableNumber}号桌`
  }

  return tableId
}

/**
 * 格式化菜品价格区间
 * @param minPrice 最低价格
 * @param maxPrice 最高价格
 */
export const formatPriceRange = (minPrice: number, maxPrice: number): string => {
  if (minPrice === maxPrice) {
    return formatCurrency(minPrice)
  }
  return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`
}

/**
 * 格式化等待时间
 * @param minutes 等待分钟数
 */
export const formatWaitTime = (minutes: number): string => {
  if (minutes <= 5) {
    return `${minutes}分钟内`
  } else if (minutes <= 30) {
    return `约${minutes}分钟`
  } else if (minutes <= 60) {
    return `约${Math.round(minutes / 10) * 10}分钟`
  } else {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) {
      return `约${hours}小时`
    } else {
      return `约${hours}小时${remainingMinutes}分钟`
    }
  }
}

/**
 * 格式化配送距离
 * @param meters 距离（米）
 */
export const formatDeliveryDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  } else {
    return `${(meters / 1000).toFixed(1)}km`
  }
}

/**
 * 格式化收益增长率
 * @param current 当前值
 * @param previous 之前值
 */
export const formatGrowthRate = (current: number, previous: number): {
  rate: number
  text: string
  color: string
  trend: 'up' | 'down' | 'stable'
} => {
  if (previous === 0) {
    return {
      rate: 0,
      text: 'N/A',
      color: 'var(--color-neutral)',
      trend: 'stable'
    }
  }

  const rate = ((current - previous) / previous) * 100
  const trend = rate > 0 ? 'up' : rate < 0 ? 'down' : 'stable'

  let color = 'var(--color-neutral)'
  if (trend === 'up') {
    color = 'var(--color-success)'
  } else if (trend === 'down') {
    color = 'var(--color-danger)'
  }

  return {
    rate,
    text: `${rate > 0 ? '+' : ''}${rate.toFixed(1)}%`,
    color,
    trend
  }
}
