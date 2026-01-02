import { describe, it, expect } from 'vitest'
import {
  // 基础格式化函数
  formatCurrency,
  formatDateTime,
  formatDate,
  formatTime,
  formatNumber,
  formatPercentage,
  
  // 餐饮业务专用格式化函数
  formatLargeNumber,
  getRelativeTime,
  formatOrderStatus,
  getOrderStatusColor,
  formatInventoryStatus,
  formatBusinessDuration,
  formatPopularityScore,
  formatCustomerRating,
  formatPhoneNumber,
  formatTableId,
  formatPriceRange,
  formatWaitTime,
  formatDeliveryDistance,
  formatGrowthRate
} from '../format'

// ================================
// 基础格式化函数测试
// ================================
describe('formatCurrency', () => {
  it('should format currency correctly', () => {
    expect(formatCurrency(1234.56)).toBe('¥1,234.56')
    expect(formatCurrency(1000000)).toBe('¥1,000,000.00')
    expect(formatCurrency(0)).toBe('¥0.00')
    expect(formatCurrency(123.456)).toBe('¥123.46') // 四舍五入
  })

  it('should handle different currencies', () => {
    expect(formatCurrency(1234.56, '$')).toBe('$1,234.56')
    expect(formatCurrency(1234.56, '€')).toBe('€1,234.56')
  })

  it('should handle invalid inputs', () => {
    expect(formatCurrency(NaN)).toBe('¥0.00')
    expect(formatCurrency(null as unknown as number)).toBe('¥0.00')
  })
})

describe('formatDateTime', () => {
  it('should format date time correctly', () => {
    const date = new Date('2023-12-25T10:30:45')
    expect(formatDateTime(date)).toBe('2023-12-25 10:30:45')
    expect(formatDateTime(date, 'YYYY/MM/DD HH:mm')).toBe('2023/12/25 10:30')
  })

  it('should handle string dates', () => {
    expect(formatDateTime('2023-12-25T10:30:45')).toBe('2023-12-25 10:30:45')
  })

  it('should handle invalid dates', () => {
    expect(formatDateTime(new Date('invalid-date'))).toBe('--')
    expect(formatDateTime('invalid-date')).toBe('--')
  })
})

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2023-12-25T10:30:45')
    expect(formatDate(date)).toBe('2023-12-25')
    expect(formatDate(date, 'YYYY/MM/DD')).toBe('2023/12/25')
  })
})

describe('formatTime', () => {
  it('should format time correctly', () => {
    const date = new Date('2023-12-25T10:30:45')
    expect(formatTime(date)).toBe('10:30:45')
    expect(formatTime(date, 'HH:mm')).toBe('10:30')
  })
})

describe('formatNumber', () => {
  it('should format number correctly', () => {
    expect(formatNumber(1234567)).toBe('1,234,567')
    expect(formatNumber(1234.567, 2)).toBe('1,234.57') // 四舍五入
    expect(formatNumber(0)).toBe('0')
  })

  it('should handle invalid inputs', () => {
    expect(formatNumber(NaN)).toBe('0')
    expect(formatNumber(null as unknown as number)).toBe('0')
  })
})

describe('formatPercentage', () => {
  it('should format percentage correctly', () => {
    expect(formatPercentage(50)).toBe('50.0%')
    expect(formatPercentage(75.55)).toBe('75.5%') // toFixed(1) 四舍五入行为
    expect(formatPercentage(0)).toBe('0.0%')
    expect(formatPercentage(100)).toBe('100.0%')
  })

  it('should handle invalid inputs', () => {
    expect(formatPercentage(NaN)).toBe('0%')
    expect(formatPercentage(null as unknown as number)).toBe('0%')
  })
})

// ================================
// 餐饮业务专用格式化函数测试
// ================================
describe('formatLargeNumber', () => {
  it('should format large numbers correctly', () => {
    expect(formatLargeNumber(100000000)).toBe('1.0亿')
    expect(formatLargeNumber(150000000)).toBe('1.5亿')
    expect(formatLargeNumber(10000)).toBe('1.0万')
    expect(formatLargeNumber(15000)).toBe('1.5万')
    expect(formatLargeNumber(1000)).toBe('1,000')
    expect(formatLargeNumber(1500)).toBe('1,500')
    expect(formatLargeNumber(10)).toBe('10')
    expect(formatLargeNumber(5.5)).toBe('5.5')
    expect(formatLargeNumber(1)).toBe('1.0')
  })

  it('should handle negative numbers', () => {
    expect(formatLargeNumber(-100000000)).toBe('-1.0亿')
    expect(formatLargeNumber(-10000)).toBe('-1.0万')
  })

  it('should handle invalid inputs', () => {
    expect(formatLargeNumber(NaN)).toBe('0')
    expect(formatLargeNumber(null as unknown as number)).toBe('0')
  })
})

describe('formatOrderStatus', () => {
  it('should format order status correctly', () => {
    expect(formatOrderStatus('pending')).toBe('待确认')
    expect(formatOrderStatus('confirmed')).toBe('已确认')
    expect(formatOrderStatus('preparing')).toBe('制作中')
    expect(formatOrderStatus('ready')).toBe('待取餐')
    expect(formatOrderStatus('delivering')).toBe('配送中')
    expect(formatOrderStatus('completed')).toBe('已完成')
    expect(formatOrderStatus('cancelled')).toBe('已取消')
    expect(formatOrderStatus('refunded')).toBe('已退款')
  })

  it('should return original status for unknown status', () => {
    expect(formatOrderStatus('unknown')).toBe('unknown')
  })
})

describe('getOrderStatusColor', () => {
  it('should return correct color for each status', () => {
    expect(getOrderStatusColor('pending')).toBe('var(--color-warning)')
    expect(getOrderStatusColor('confirmed')).toBe('var(--color-primary)')
    expect(getOrderStatusColor('preparing')).toBe('var(--color-secondary)')
    expect(getOrderStatusColor('ready')).toBe('var(--color-success)')
    expect(getOrderStatusColor('delivering')).toBe('var(--color-primary)')
    expect(getOrderStatusColor('completed')).toBe('var(--color-success)')
    expect(getOrderStatusColor('cancelled')).toBe('var(--color-danger)')
    expect(getOrderStatusColor('refunded')).toBe('var(--color-neutral)')
  })

  it('should return default color for unknown status', () => {
    expect(getOrderStatusColor('unknown')).toBe('var(--color-neutral)')
  })
})

describe('formatInventoryStatus', () => {
  it('should format inventory status correctly', () => {
    // 缺货
    expect(formatInventoryStatus(0, 10, 1000)).toEqual({
      status: 'danger',
      text: '缺货',
      color: 'var(--color-danger)',
      percentage: 0
    })

    // 库存不足
    expect(formatInventoryStatus(5, 10, 1000)).toEqual({
      status: 'warning',
      text: '库存不足 (5)',
      color: 'var(--color-warning)',
      percentage: 0.5
    })

    // 库存正常
    expect(formatInventoryStatus(500, 10, 1000)).toEqual({
      status: 'sufficient',
      text: '库存正常 (500)',
      color: 'var(--color-success)',
      percentage: 50
    })

    // 库存充足
    expect(formatInventoryStatus(900, 10, 1000)).toEqual({
      status: 'overstock',
      text: '库存充足 (900)',
      color: 'var(--color-secondary)',
      percentage: 90
    })
  })
})

describe('formatBusinessDuration', () => {
  it('should format business duration correctly', () => {
    expect(formatBusinessDuration(30)).toBe('30分钟')
    expect(formatBusinessDuration(60)).toBe('1小时')
    expect(formatBusinessDuration(90)).toBe('1小时30分钟')
    expect(formatBusinessDuration(120)).toBe('2小时')
    expect(formatBusinessDuration(150)).toBe('2小时30分钟')
  })
})

describe('formatPhoneNumber', () => {
  it('should format phone number correctly', () => {
    expect(formatPhoneNumber('13812345678')).toBe('138 1234 5678')
    expect(formatPhoneNumber('138-1234-5678')).toBe('138 1234 5678')
    expect(formatPhoneNumber('138 1234 5678')).toBe('138 1234 5678')
  })

  it('should handle invalid phone numbers', () => {
    expect(formatPhoneNumber('')).toBe('--')
    expect(formatPhoneNumber('123')).toBe('123')
  })
})

describe('formatTableId', () => {
  it('should format table ID correctly', () => {
    expect(formatTableId('table1')).toBe('1号桌')
    expect(formatTableId('table10')).toBe('10号桌')
    expect(formatTableId('TABLE5')).toBe('5号桌')
  })

  it('should handle invalid table IDs', () => {
    expect(formatTableId('')).toBe('--')
    expect(formatTableId('table')).toBe('table')
  })
})

describe('formatPriceRange', () => {
  it('should format price range correctly', () => {
    expect(formatPriceRange(10, 20)).toBe('¥10.00 - ¥20.00')
    expect(formatPriceRange(15, 15)).toBe('¥15.00') // 价格相同时只显示一个价格
  })
})

describe('formatWaitTime', () => {
  it('should format wait time correctly', () => {
    expect(formatWaitTime(5)).toBe('5分钟内')
    expect(formatWaitTime(15)).toBe('约15分钟')
    expect(formatWaitTime(30)).toBe('约30分钟')
    expect(formatWaitTime(60)).toBe('约60分钟')
    expect(formatWaitTime(90)).toBe('约1小时30分钟')
    expect(formatWaitTime(120)).toBe('约2小时')
  })
})

describe('formatDeliveryDistance', () => {
  it('should format delivery distance correctly', () => {
    expect(formatDeliveryDistance(500)).toBe('500m')
    expect(formatDeliveryDistance(1000)).toBe('1.0km')
    expect(formatDeliveryDistance(1500)).toBe('1.5km')
  })
})

describe('formatGrowthRate', () => {
  it('should format growth rate correctly', () => {
    // 增长
    expect(formatGrowthRate(150, 100)).toEqual({
      rate: 50,
      text: '+50.0%',
      color: 'var(--color-success)',
      trend: 'up'
    })

    // 下降
    expect(formatGrowthRate(75, 100)).toEqual({
      rate: -25,
      text: '-25.0%',
      color: 'var(--color-danger)',
      trend: 'down'
    })

    // 稳定
    expect(formatGrowthRate(100, 100)).toEqual({
      rate: 0,
      text: '0.0%',
      color: 'var(--color-neutral)',
      trend: 'stable'
    })
  })

  it('should handle zero previous value', () => {
    expect(formatGrowthRate(100, 0)).toEqual({
      rate: 0,
      text: 'N/A',
      color: 'var(--color-neutral)',
      trend: 'stable'
    })
  })
})