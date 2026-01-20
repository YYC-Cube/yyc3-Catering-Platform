/**
 * @fileoverview 数据可视化准确性验证脚本
 * @description 验证数据分析模块中所有图表的准确性和配置正确性
 * @module validate-charts
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 */

import { DataVisualizationValidator, ChartConfig } from '../utils/DataVisualizationValidator'

interface ChartValidationSummary {
  totalCharts: number
  validCharts: number
  invalidCharts: number
  totalErrors: number
  totalWarnings: number
  passRate: number
  chartResults: Array<{
    componentName: string
    chartName: string
    isValid: boolean
    errors: string[]
    warnings: string[]
  }>
}

export function validateAnalyticsCharts(): ChartValidationSummary {
  const summary: ChartValidationSummary = {
    totalCharts: 0,
    validCharts: 0,
    invalidCharts: 0,
    totalErrors: 0,
    totalWarnings: 0,
    passRate: 0,
    chartResults: []
  }

  const chartConfigs = getAnalyticsChartConfigs()

  chartConfigs.forEach(config => {
    const result = DataVisualizationValidator.validateChartConfig(config)
    
    summary.totalCharts++
    summary.totalErrors += result.errors.length
    summary.totalWarnings += result.warnings.length

    if (result.isValid) {
      summary.validCharts++
    } else {
      summary.invalidCharts++
    }

    summary.chartResults.push({
      componentName: config.componentName,
      chartName: config.chartName,
      isValid: result.isValid,
      errors: result.errors,
      warnings: result.warnings
    })
  })

  summary.passRate = (summary.validCharts / summary.totalCharts) * 100

  return summary
}

function getAnalyticsChartConfigs(): Array<ChartConfig & { componentName: string; chartName: string }> {
  return [
    {
      componentName: 'CustomerAnalytics',
      chartName: '客户增长趋势图',
      title: '客户增长趋势',
      type: 'line',
      xAxis: [
        {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '客户数量'
        }
      ],
      series: [
        {
          name: '新增客户',
          type: 'line',
          data: [120, 132, 101, 134, 90, 230, 210, 180, 200, 190, 230, 250],
          itemStyle: {
            color: '#409EFF'
          }
        }
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line'
        }
      },
      legend: {
        data: ['新增客户']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      }
    },
    {
      componentName: 'CustomerAnalytics',
      chartName: '客户分段饼图',
      title: '客户分段',
      type: 'pie',
      series: [
        {
          name: '客户分段',
          type: 'pie',
          radius: ['40%', '70%'],
          data: [
            { value: 1048, name: '高价值客户' },
            { value: 735, name: '中价值客户' },
            { value: 580, name: '低价值客户' },
            { value: 484, name: '新客户' }
          ],
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            formatter: '{b}: {d}人'
          }
        }
      ],
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c}人 ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      }
    },
    {
      componentName: 'MenuAnalytics',
      chartName: '菜单销售柱状图',
      title: '菜单销售分析',
      type: 'bar',
      xAxis: [
        {
          type: 'category',
          data: ['宫保鸡丁', '鱼香肉丝', '麻婆豆腐', '水煮鱼', '回锅肉']
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '销售量'
        }
      ],
      series: [
        {
          name: '销售量',
          type: 'bar',
          data: [450, 380, 320, 280, 250],
          itemStyle: {
            color: new (echarts as any).graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          }
        }
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['销售量']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      }
    },
    {
      componentName: 'MenuAnalytics',
      chartName: 'BCG矩阵散点图',
      title: 'BCG矩阵分析',
      type: 'scatter',
      xAxis: [
        {
          type: 'value',
          name: '市场增长率',
          min: -20,
          max: 20
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '相对市场份额',
          min: 0,
          max: 100
        }
      ],
      series: [
        {
          name: '菜品',
          type: 'scatter',
          data: [
            [15, 25, '宫保鸡丁'],
            [12, 30, '鱼香肉丝'],
            [8, 20, '麻婆豆腐'],
            [5, 15, '水煮鱼'],
            [3, 10, '回锅肉']
          ],
          symbolSize: 20,
          itemStyle: {
            color: '#5470C6'
          },
          label: {
            show: true,
            formatter: function(param: any) {
              return param.data[2]
            }
          }
        }
      ],
      tooltip: {
        trigger: 'item',
        formatter: function(param: any) {
          return `${param.data[2]}<br/>增长率: ${param.data[0]}%<br/>市场份额: ${param.data[1]}%`
        }
      },
      grid: {
        left: '3%',
        right: '7%',
        bottom: '3%',
        containLabel: true
      }
    },
    {
      componentName: 'OperationalAnalytics',
      chartName: '运营效率雷达图',
      title: '运营效率分析',
      type: 'radar',
      series: [
        {
          name: '运营效率',
          type: 'radar',
          data: [
            { value: [90, 85, 88, 92, 87, 89], name: '本周' },
            { value: [88, 82, 85, 90, 85, 87], name: '上周' }
          ],
          indicator: [
            { name: '订单完成率', max: 100 },
            { name: '客户满意度', max: 100 },
            { name: '出餐准确率', max: 100 },
            { name: '食材利用率', max: 100 },
            { name: '员工效率', max: 100 },
            { name: '设备运行率', max: 100 }
          ],
          areaStyle: {
            color: 'rgba(64, 158, 255, 0.2)'
          },
          lineStyle: {
            color: 'rgba(64, 158, 255, 1)'
          }
        }
      ],
      tooltip: {
        trigger: 'item'
      },
      legend: {
        data: ['本周', '上周']
      }
    },
    {
      componentName: 'SalesAnalytics',
      chartName: '销售收入折线图',
      title: '销售收入趋势',
      type: 'line',
      xAxis: [
        {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '收入（元）'
        }
      ],
      series: [
        {
          name: '本月收入',
          type: 'line',
          data: [45000, 52000, 48000, 56000, 61000, 58000, 63000, 67000, 71000, 69000, 73000, 76000],
          smooth: true,
          itemStyle: {
            color: '#409EFF'
          },
          areaStyle: {
            color: new (echarts as any).graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
            ])
          }
        }
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line'
        }
      },
      legend: {
        data: ['本月收入']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      }
    },
    {
      componentName: 'SalesAnalytics',
      chartName: '销售预测折线图',
      title: '销售预测',
      type: 'line',
      xAxis: [
        {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月']
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '预测收入（元）'
        }
      ],
      series: [
        {
          name: '实际收入',
          type: 'line',
          data: [45000, 52000, 48000, 56000, 61000, 58000],
          itemStyle: {
            color: '#409EFF'
          }
        },
        {
          name: '预测收入',
          type: 'line',
          data: [46000, 53000, 49000, 57000, 62000, 59000],
          itemStyle: {
            color: '#67C23A'
          },
          lineStyle: {
            type: 'dashed'
          }
        }
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line'
        }
      },
      legend: {
        data: ['实际收入', '预测收入']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      }
    }
  ]
}

export function generateValidationReport(summary: ChartValidationSummary): string {
  let report = '=== 数据分析模块可视化准确性验证报告 ===\n\n'
  report += `验证时间: ${new Date().toLocaleString('zh-CN')}\n\n`

  report += '=== 总体统计 ===\n'
  report += `总图表数: ${summary.totalCharts}\n`
  report += `有效图表: ${summary.validCharts}\n`
  report += `无效图表: ${summary.invalidCharts}\n`
  report += `总错误数: ${summary.totalErrors}\n`
  report += `总警告数: ${summary.totalWarnings}\n`
  report += `通过率: ${summary.passRate.toFixed(2)}%\n\n`

  report += '=== 详细结果 ===\n\n'

  summary.chartResults.forEach((result, index) => {
    report += `${index + 1}. ${result.componentName} - ${result.chartName}\n`
    report += `   状态: ${result.isValid ? '✓ 有效' : '✗ 无效'}\n`
    
    if (result.errors.length > 0) {
      report += `   错误:\n`
      result.errors.forEach(error => {
        report += `     - ${error}\n`
      })
    }
    
    if (result.warnings.length > 0) {
      report += `   警告:\n`
      result.warnings.forEach(warning => {
        report += `     - ${warning}\n`
      })
    }
    
    report += '\n'
  })

  if (summary.invalidCharts > 0) {
    report += '=== 建议修复 ===\n'
    report += '1. 检查所有无效图表的配置\n'
    report += '2. 确保图表类型和数据格式正确\n'
    report += '3. 验证颜色、坐标轴等配置项\n'
    report += '4. 确保所有必需字段都已填写\n'
  }

  return report
}

if (typeof window !== 'undefined') {
  window.validateAnalyticsCharts = validateAnalyticsCharts
  window.generateValidationReport = generateValidationReport
}
