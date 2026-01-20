/**
 * @fileoverview 数据可视化准确性验证工具
 * @description 验证ECharts图表配置和数据准确性
 * @module DataVisualizationValidator
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 */

import * as echarts from 'echarts'

export interface ChartValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  chartType: string
  dataPoints: number
  expectedDataPoints: number
}

export interface ChartConfig {
  title: string
  type: string
  xAxis?: any[]
  yAxis?: any[]
  series: any[]
  legend?: any
  tooltip?: any
  grid?: any
}

export class DataVisualizationValidator {
  private static readonly ERROR_THRESHOLD = 0.01
  private static readonly WARNING_THRESHOLD = 0.05

  static validateChartConfig(config: ChartConfig): ChartValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!config.title) {
      errors.push('图表标题不能为空')
    }

    if (!config.type) {
      errors.push('图表类型不能为空')
    }

    if (!config.series || config.series.length === 0) {
      errors.push('图表数据系列不能为空')
    }

    let totalDataPoints = 0
    config.series.forEach((series, index) => {
      if (!series.data || !Array.isArray(series.data)) {
        errors.push(`系列 ${index + 1} 的数据格式不正确`)
        return
      }

      totalDataPoints += series.data.length

      if (series.type && !this.isValidChartType(series.type)) {
        errors.push(`系列 ${index + 1} 的图表类型 ${series.type} 不支持`)
      }

      if (series.data.length === 0) {
        warnings.push(`系列 ${index + 1} 没有数据点`)
      }

      if (series.name && typeof series.name !== 'string') {
        warnings.push(`系列 ${index + 1} 的名称格式不正确`)
      }
    })

    if (totalDataPoints === 0) {
      errors.push('图表没有数据点')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      chartType: config.type,
      dataPoints: totalDataPoints,
      expectedDataPoints: this.getExpectedDataPoints(config.type)
    }
  }

  static validateChartDataConsistency(
    chartInstance: any,
    rawData: any[]
  ): ChartValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!chartInstance) {
      errors.push('图表实例不能为空')
      return {
        isValid: false,
        errors,
        warnings,
        chartType: 'unknown',
        dataPoints: 0,
        expectedDataPoints: 0
      }
    }

    const option = chartInstance.getOption()
    if (!option || !option.series) {
      errors.push('无法获取图表配置')
      return {
        isValid: false,
        errors,
        warnings,
        chartType: 'unknown',
        dataPoints: 0,
        expectedDataPoints: 0
      }
    }

    const seriesData = option.series
    let totalChartPoints = 0
    seriesData.forEach((series: any) => {
      if (series.data) {
        totalChartPoints += series.data.length
      }
    })

    if (totalChartPoints !== rawData.length) {
      warnings.push(
        `图表数据点数量 (${totalChartPoints}) 与原始数据点数量 (${rawData.length}) 不一致`
      )
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      chartType: option.series[0]?.type || 'unknown',
      dataPoints: totalChartPoints,
      expectedDataPoints: rawData.length
    }
  }

  static validateChartColors(config: ChartConfig): ChartValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    const validColorFormats = [
      /^#[0-9A-Fa-f]{6}$/,
      /^#[0-9A-Fa-f]{3}$/,
      /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/,
      /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/
    ]

    config.series.forEach((series, index) => {
      if (series.itemStyle && series.itemStyle.color) {
        const color = series.itemStyle.color
        const isValidColor = validColorFormats.some(regex => regex.test(color))
        if (!isValidColor) {
          errors.push(`系列 ${index + 1} 的颜色格式不正确: ${color}`)
        }
      }

      if (series.lineStyle && series.lineStyle.color) {
        const color = series.lineStyle.color
        const isValidColor = validColorFormats.some(regex => regex.test(color))
        if (!isValidColor) {
          errors.push(`系列 ${index + 1} 的线条颜色格式不正确: ${color}`)
        }
      }

      if (series.areaStyle && series.areaStyle.color) {
        const color = series.areaStyle.color
        const isValidColor = validColorFormats.some(regex => regex.test(color))
        if (!isValidColor) {
          errors.push(`系列 ${index + 1} 的区域颜色格式不正确: ${color}`)
        }
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      chartType: config.type,
      dataPoints: config.series.reduce((sum, s) => sum + (s.data?.length || 0), 0),
      expectedDataPoints: 0
    }
  }

  static validateChartAxes(config: ChartConfig): ChartValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (config.xAxis) {
      if (Array.isArray(config.xAxis)) {
        config.xAxis.forEach((axis, index) => {
          if (!axis.type) {
            warnings.push(`X轴 ${index + 1} 没有指定类型`)
          }
          if (axis.data && !Array.isArray(axis.data)) {
            errors.push(`X轴 ${index + 1} 的数据格式不正确`)
          }
        })
      }
    }

    if (config.yAxis) {
      if (Array.isArray(config.yAxis)) {
        config.yAxis.forEach((axis, index) => {
          if (!axis.type) {
            warnings.push(`Y轴 ${index + 1} 没有指定类型`)
          }
        })
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      chartType: config.type,
      dataPoints: config.series.reduce((sum, s) => sum + (s.data?.length || 0), 0),
      expectedDataPoints: 0
    }
  }

  static validateChartTooltip(config: ChartConfig): ChartValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!config.tooltip) {
      warnings.push('图表没有配置提示框')
      return {
        isValid: true,
        errors,
        warnings,
        chartType: config.type,
        dataPoints: config.series.reduce((sum, s) => sum + (s.data?.length || 0), 0),
        expectedDataPoints: 0
      }
    }

    if (config.tooltip.trigger && 
        !['item', 'axis', 'none'].includes(config.tooltip.trigger)) {
      errors.push(`提示框触发类型 ${config.tooltip.trigger} 不支持`)
    }

    if (config.tooltip.axisPointer && 
        config.tooltip.axisPointer.type && 
        !['line', 'shadow', 'cross', 'none'].includes(config.tooltip.axisPointer.type)) {
      errors.push(`指示器类型 ${config.tooltip.axisPointer.type} 不支持`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      chartType: config.type,
      dataPoints: config.series.reduce((sum, s) => sum + (s.data?.length || 0), 0),
      expectedDataPoints: 0
    }
  }

  static validateChartLegend(config: ChartConfig): ChartValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!config.legend) {
      warnings.push('图表没有配置图例')
      return {
        isValid: true,
        errors,
        warnings,
        chartType: config.type,
        dataPoints: config.series.reduce((sum, s) => sum + (s.data?.length || 0), 0),
        expectedDataPoints: 0
      }
    }

    if (config.legend.data && config.series) {
      const legendCount = config.legend.data.length
      const seriesCount = config.series.length
      if (legendCount !== seriesCount) {
        warnings.push(
          `图例项数量 (${legendCount}) 与系列数量 (${seriesCount}) 不一致`
        )
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      chartType: config.type,
      dataPoints: config.series.reduce((sum, s) => sum + (s.data?.length || 0), 0),
      expectedDataPoints: 0
    }
  }

  static validateChartGrid(config: ChartConfig): ChartValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!config.grid) {
      warnings.push('图表没有配置网格')
      return {
        isValid: true,
        errors,
        warnings,
        chartType: config.type,
        dataPoints: config.series.reduce((sum, s) => sum + (s.data?.length || 0), 0),
        expectedDataPoints: 0
      }
    }

    if (typeof config.grid.left !== 'undefined' && 
        typeof config.grid.left !== 'number' && 
        typeof config.grid.left !== 'string') {
      errors.push('网格左侧位置格式不正确')
    }

    if (typeof config.grid.right !== 'undefined' && 
        typeof config.grid.right !== 'number' && 
        typeof config.grid.right !== 'string') {
      errors.push('网格右侧位置格式不正确')
    }

    if (typeof config.grid.top !== 'undefined' && 
        typeof config.grid.top !== 'number' && 
        typeof config.grid.top !== 'string') {
      errors.push('网格顶部位置格式不正确')
    }

    if (typeof config.grid.bottom !== 'undefined' && 
        typeof config.grid.bottom !== 'number' && 
        typeof config.grid.bottom !== 'string') {
      errors.push('网格底部位置格式不正确')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      chartType: config.type,
      dataPoints: config.series.reduce((sum, s) => sum + (s.data?.length || 0), 0),
      expectedDataPoints: 0
    }
  }

  static validateChartResponsiveness(config: ChartConfig): ChartValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!config.grid) {
      warnings.push('图表没有配置网格，可能影响响应式布局')
      return {
        isValid: true,
        errors,
        warnings,
        chartType: config.type,
        dataPoints: config.series.reduce((sum, s) => sum + (s.data?.length || 0), 0),
        expectedDataPoints: 0
      }
    }

    if (config.grid.containLabel !== true) {
      warnings.push('网格未配置为包含标签，可能导致标签被裁剪')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      chartType: config.type,
      dataPoints: config.series.reduce((sum, s) => sum + (s.data?.length || 0), 0),
      expectedDataPoints: 0
    }
  }

  static validateChartAnimation(config: ChartConfig): ChartValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    config.series.forEach((series, index) => {
      if (series.animation === false) {
        warnings.push(`系列 ${index + 1} 禁用了动画`)
      }

      if (series.animationDuration && series.animationDuration > 2000) {
        warnings.push(`系列 ${index + 1} 的动画时长过长 (${series.animationDuration}ms)`)
      }

      if (series.animationEasing && 
          !['linear', 'quadraticIn', 'quadraticOut', 'cubicIn', 'cubicOut', 
            'quarticIn', 'quarticOut', 'quinticIn', 'quinticOut', 
            'sinusoidalIn', 'sinusoidalOut', 'exponentialIn', 'exponentialOut',
            'circularIn', 'circularOut', 'elasticIn', 'elasticOut',
            'backIn', 'backOut', 'bounceIn', 'bounceOut'].includes(series.animationEasing)) {
        warnings.push(`系列 ${index + 1} 的动画缓动函数 ${series.animationEasing} 不支持`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      chartType: config.type,
      dataPoints: config.series.reduce((sum, s) => sum + (s.data?.length || 0), 0),
      expectedDataPoints: 0
    }
  }

  static validateChartAccessibility(config: ChartConfig): ChartValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!config.title) {
      errors.push('图表缺少标题，影响可访问性')
    }

    config.series.forEach((series, index) => {
      if (!series.name) {
        warnings.push(`系列 ${index + 1} 缺少名称，影响屏幕阅读器`)
      }
    })

    if (config.legend && !config.legend.aria) {
      warnings.push('图例缺少ARIA属性')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      chartType: config.type,
      dataPoints: config.series.reduce((sum, s) => sum + (s.data?.length || 0), 0),
      expectedDataPoints: 0
    }
  }

  static generateValidationReport(
    results: ChartValidationResult[]
  ): string {
    let report = '=== 数据可视化准确性验证报告 ===\n\n'
    
    let totalErrors = 0
    let totalWarnings = 0
    let validCharts = 0
    let invalidCharts = 0

    results.forEach((result, index) => {
      report += `图表 ${index + 1}: ${result.chartType}\n`
      report += `状态: ${result.isValid ? '✓ 有效' : '✗ 无效'}\n`
      report += `数据点: ${result.dataPoints}\n`
      
      if (result.errors.length > 0) {
        report += `错误:\n`
        result.errors.forEach(error => {
          report += `  - ${error}\n`
          totalErrors++
        })
      }
      
      if (result.warnings.length > 0) {
        report += `警告:\n`
        result.warnings.forEach(warning => {
          report += `  - ${warning}\n`
          totalWarnings++
        })
      }
      
      report += '\n'
      
      if (result.isValid) {
        validCharts++
      } else {
        invalidCharts++
      }
    })

    report += '=== 总结 ===\n'
    report += `总图表数: ${results.length}\n`
    report += `有效图表: ${validCharts}\n`
    report += `无效图表: ${invalidCharts}\n`
    report += `总错误数: ${totalErrors}\n`
    report += `总警告数: ${totalWarnings}\n`
    report += `通过率: ${((validCharts / results.length) * 100).toFixed(2)}%\n`

    return report
  }

  private static isValidChartType(type: string): boolean {
    const validTypes = [
      'line', 'bar', 'pie', 'scatter', 'effectScatter',
      'radar', 'tree', 'treemap', 'graph', 'gauge',
      'funnel', 'parallel', 'sankey', 'boxplot', 'candlestick',
      'heatmap', 'lines', 'map', 'themeRiver', 'sunburst',
      'custom', 'pictorialBar', 'wordCloud'
    ]
    return validTypes.includes(type)
  }

  private static getExpectedDataPoints(chartType: string): number {
    const minDataPoints: Record<string, number> = {
      line: 2,
      bar: 1,
      pie: 1,
      scatter: 2,
      radar: 3,
      gauge: 1,
      funnel: 1,
      heatmap: 4,
      treemap: 1
    }
    return minDataPoints[chartType] || 1
  }
}
