/**
 * @fileoverview 数据可视化准确性验证测试
 * @description 测试数据可视化验证工具的功能
 * @module DataVisualizationValidator.test
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 */

import { describe, it, expect } from 'vitest'
import { DataVisualizationValidator, ChartConfig } from '@/utils/DataVisualizationValidator'

describe('DataVisualizationValidator', () => {
  describe('基础验证', () => {
    it('应该验证有效的图表配置', () => {
      const config: ChartConfig = {
        title: '测试图表',
        type: 'line',
        series: [
          {
            name: '系列1',
            type: 'line',
            data: [1, 2, 3, 4, 5]
          }
        ]
      }

      const result = DataVisualizationValidator.validateChartConfig(config)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.dataPoints).toBe(5)
    })

    it('应该检测缺少标题的图表', () => {
      const config: ChartConfig = {
        title: '',
        type: 'line',
        series: [
          {
            name: '系列1',
            type: 'line',
            data: [1, 2, 3, 4, 5]
          }
        ]
      }

      const result = DataVisualizationValidator.validateChartConfig(config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('图表标题不能为空')
    })

    it('应该检测缺少类型的图表', () => {
      const config: ChartConfig = {
        title: '测试图表',
        type: '',
        series: [
          {
            name: '系列1',
            type: 'line',
            data: [1, 2, 3, 4, 5]
          }
        ]
      }

      const result = DataVisualizationValidator.validateChartConfig(config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('图表类型不能为空')
    })

    it('应该检测空数据系列的图表', () => {
      const config: ChartConfig = {
        title: '测试图表',
        type: 'line',
        series: []
      }

      const result = DataVisualizationValidator.validateChartConfig(config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('图表数据系列不能为空')
    })
  })

  describe('数据一致性验证', () => {
    it('应该验证图表数据与原始数据一致', () => {
      const rawData = [1, 2, 3, 4, 5]
      const chartInstance = {
        getOption: () => ({
          series: [
            {
              data: rawData
            }
          ]
        })
      }

      const result = DataVisualizationValidator.validateChartDataConsistency(
        chartInstance,
        rawData
      )

      expect(result.isValid).toBe(true)
      expect(result.dataPoints).toBe(5)
      expect(result.warnings).toHaveLength(0)
    })

    it('应该检测数据点数量不一致', () => {
      const rawData = [1, 2, 3, 4, 5]
      const chartInstance = {
        getOption: () => ({
          series: [
            {
              data: [1, 2, 3]
            }
          ]
        })
      }

      const result = DataVisualizationValidator.validateChartDataConsistency(
        chartInstance,
        rawData
      )

      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings.some(w => w.includes('不一致'))).toBe(true)
    })

    it('应该处理空图表实例', () => {
      const result = DataVisualizationValidator.validateChartDataConsistency(
        null as any,
        [1, 2, 3]
      )

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('图表实例不能为空')
    })
  })

  describe('颜色验证', () => {
    it('应该验证有效的十六进制颜色', () => {
      const config: ChartConfig = {
        title: '测试图表',
        type: 'line',
        series: [
          {
            name: '系列1',
            type: 'line',
            data: [1, 2, 3],
            itemStyle: {
              color: '#FF5733'
            }
          }
        ]
      }

      const result = DataVisualizationValidator.validateChartColors(config)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该验证有效的RGB颜色', () => {
      const config: ChartConfig = {
        title: '测试图表',
        type: 'line',
        series: [
          {
            name: '系列1',
            type: 'line',
            data: [1, 2, 3],
            lineStyle: {
              color: 'rgb(255, 87, 51)'
            }
          }
        ]
      }

      const result = DataVisualizationValidator.validateChartColors(config)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该检测无效的颜色格式', () => {
      const config: ChartConfig = {
        title: '测试图表',
        type: 'line',
        series: [
          {
            name: '系列1',
            type: 'line',
            data: [1, 2, 3],
            itemStyle: {
              color: 'invalid-color'
            }
          }
        ]
      }

      const result = DataVisualizationValidator.validateChartColors(config)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('颜色格式不正确'))).toBe(true)
    })
  })

  describe('坐标轴验证', () => {
    it('应该验证有效的X轴配置', () => {
      const config: ChartConfig = {
        title: '测试图表',
        type: 'line',
        xAxis: [
          {
            type: 'category',
            data: ['周一', '周二', '周三', '周四', '周五']
          }
        ],
        series: [
          {
            name: '系列1',
            type: 'line',
            data: [1, 2, 3, 4, 5]
          }
        ]
      }

      const result = DataVisualizationValidator.validateChartAxes(config)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该检测缺少类型的X轴', () => {
      const config: ChartConfig = {
        title: '测试图表',
        type: 'line',
        xAxis: [
          {
            data: ['周一', '周二', '周三', '周四', '周五']
          }
        ],
        series: [
          {
            name: '系列1',
            type: 'line',
            data: [1, 2, 3, 4, 5]
          }
        ]
      }

      const result = DataVisualizationValidator.validateChartAxes(config)
      expect(result.warnings.some(w => w.includes('没有指定类型'))).toBe(true)
    })

    it('应该检测格式错误的X轴数据', () => {
      const config: ChartConfig = {
        title: '测试图表',
        type: 'line',
        xAxis: [
          {
            type: 'category',
            data: 'invalid-data' as any
          }
        ],
        series: [
          {
            name: '系列1',
            type: 'line',
            data: [1, 2, 3, 4, 5]
          }
        ]
      }

      const result = DataVisualizationValidator.validateChartAxes(config)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('数据格式不正确'))).toBe(true)
    })
  })

  describe('提示框验证', () => {
    it('应该验证有效的提示框配置', () => {
      const config: ChartConfig = {
        title: '测试图表',
        type: 'line',
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line'
          }
        },
        series: [
          {
            name: '系列1',
            type: 'line',
            data: [1, 2, 3, 4, 5]
          }
        ]
      }

      const result = DataVisualizationValidator.validateChartTooltip(config)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该检测无效的触发类型', () => {
      const config: ChartConfig = {
        title: '测试图表',
        type: 'line',
        tooltip: {
          trigger: 'invalid' as any
        },
        series: [
          {
            name: '系列1',
            type: 'line',
            data: [1, 2, 3, 4, 5]
          }
        ]
      }

      const result = DataVisualizationValidator.validateChartTooltip(config)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('不支持'))).toBe(true)
    })

    it('应该警告缺少提示框', () => {
      const config: ChartConfig = {
        title: '测试图表',
        type: 'line',
        series: [
          {
            name: '系列1',
            type: 'line',
            data: [1, 2, 3, 4, 5]
          }
        ]
      }

      const result = DataVisualizationValidator.validateChartTooltip(config)
      expect(result.isValid).toBe(true)
      expect(result.warnings.some(w => w.includes('没有配置提示框'))).toBe(true)
    })
  })

  describe('图例验证', () => {
    it('应该验证有效的图例配置', () => {
      const config: ChartConfig = {
        title: '测试图表',
        type: 'line',
        legend: {
          data: ['系列1', '系列2']
        },
        series: [
          {
            name: '系列1',
            type: 'line',
            data: [1, 2, 3, 4, 5]
          },
          {
            name: '系列2',
            type: 'line',
            data: [2, 3, 4, 5, 6]
          }
        ]
      }

      const result = DataVisualizationValidator.validateChartLegend(config)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该检测图例与系列数量不一致', () => {
      const config: ChartConfig = {
        title: '测试图表',
        type: 'line',
        legend: {
          data: ['系列1']
        },
        series: [
          {
            name: '系列1',
            type: 'line',
            data: [1, 2, 3, 4, 5]
          },
          {
            name: '系列2',
            type: 'line',
            data: [2, 3, 4, 5, 6]
          }
        ]
      }

      const result = DataVisualizationValidator.validateChartLegend(config)
      expect(result.warnings.some(w => w.includes('不一致'))).toBe(true)
    })

    it('应该警告缺少图例', () => {
      const config: ChartConfig = {
        title: '测试图表',
        type: 'line',
        series: [
          {
            name: '系列1',
            type: 'line',
            data: [1, 2, 3, 4, 5]
          }
        ]
      }

      const result = DataVisualizationValidator.validateChartLegend(config)
      expect(result.warnings.some(w => w.includes('没有配置图例'))).toBe(true)
    })
  })

  describe('网格验证', () => {
    it('应该验证有效的网格配置', () => {
      const config: ChartConfig = {
        title: '测试图表',
        type: 'line',
        grid: {
          left: '10%',
          right: '10%',
          top: '10%',
          bottom: '10%',
          containLabel: true
        },
        series: [
          {
            name: '系列1',
            type: 'line',
            data: [1, 2, 3, 4, 5]
          }
        ]
      }

      const result = DataVisualizationValidator.validateChartGrid(config)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该检测无效的网格位置', () => {
      const config: ChartConfig = {
        title: '测试图表',
        type: 'line',
        grid: {
          left: 'invalid' as any
        },
        series: [
          {
            name: '系列1',
            type: 'line',
            data: [1, 2, 3, 4, 5]
          }
        ]
      }

      const result = DataVisualizationValidator.validateChartGrid(config)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('格式不正确'))).toBe(true)
    })

    it('应该警告缺少网格配置', () => {
      const config: ChartConfig = {
        title: '测试图表',
        type: 'line',
        series: [
          {
            name: '系列1',
            type: 'line',
            data: [1, 2, 3, 4, 5]
          }
        ]
      }

      const result = DataVisualizationValidator.validateChartGrid(config)
      expect(result.warnings.some(w => w.includes('没有配置网格'))).toBe(true)
    })
  })

  describe('动画验证', () => {
    it('应该验证有效的动画配置', () => {
      const config: ChartConfig = {
        title: '测试图表',
        type: 'line',
        series: [
          {
            name: '系列1',
            type: 'line',
            data: [1, 2, 3, 4, 5],
            animation: true,
            animationDuration: 1000,
            animationEasing: 'cubicOut'
          }
        ]
      }

      const result = DataVisualizationValidator.validateChartAnimation(config)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该警告过长的动画时长', () => {
      const config: ChartConfig = {
        title: '测试图表',
        type: 'line',
        series: [
          {
            name: '系列1',
            type: 'line',
            data: [1, 2, 3, 4, 5],
            animationDuration: 3000
          }
        ]
      }

      const result = DataVisualizationValidator.validateChartAnimation(config)
      expect(result.warnings.some(w => w.includes('动画时长过长'))).toBe(true)
    })

    it('应该检测无效的缓动函数', () => {
      const config: ChartConfig = {
        title: '测试图表',
        type: 'line',
        series: [
          {
            name: '系列1',
            type: 'line',
            data: [1, 2, 3, 4, 5],
            animationEasing: 'invalid' as any
          }
        ]
      }

      const result = DataVisualizationValidator.validateChartAnimation(config)
      expect(result.warnings.some(w => w.includes('不支持'))).toBe(true)
    })
  })

  describe('可访问性验证', () => {
    it('应该验证具有良好可访问性的图表', () => {
      const config: ChartConfig = {
        title: '测试图表',
        type: 'line',
        legend: {
          data: ['系列1'],
          aria: {
            enabled: true
          }
        },
        series: [
          {
            name: '系列1',
            type: 'line',
            data: [1, 2, 3, 4, 5]
          }
        ]
      }

      const result = DataVisualizationValidator.validateChartAccessibility(config)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该检测缺少标题的图表', () => {
      const config: ChartConfig = {
        title: '',
        type: 'line',
        series: [
          {
            name: '系列1',
            type: 'line',
            data: [1, 2, 3, 4, 5]
          }
        ]
      }

      const result = DataVisualizationValidator.validateChartAccessibility(config)
      expect(result.errors.some(e => e.includes('缺少标题'))).toBe(true)
    })

    it('应该警告缺少系列名称', () => {
      const config: ChartConfig = {
        title: '测试图表',
        type: 'line',
        series: [
          {
            type: 'line',
            data: [1, 2, 3, 4, 5]
          }
        ]
      }

      const result = DataVisualizationValidator.validateChartAccessibility(config)
      expect(result.warnings.some(w => w.includes('缺少名称'))).toBe(true)
    })
  })

  describe('报告生成', () => {
    it('应该生成完整的验证报告', () => {
      const results = [
        {
          isValid: true,
          errors: [],
          warnings: [],
          chartType: 'line',
          dataPoints: 5,
          expectedDataPoints: 5
        },
        {
          isValid: false,
          errors: ['图表标题不能为空'],
          warnings: ['缺少系列名称'],
          chartType: 'bar',
          dataPoints: 0,
          expectedDataPoints: 1
        }
      ]

      const report = DataVisualizationValidator.generateValidationReport(results)

      expect(report).toContain('=== 数据可视化准确性验证报告 ===')
      expect(report).toContain('总图表数: 2')
      expect(report).toContain('有效图表: 1')
      expect(report).toContain('无效图表: 1')
      expect(report).toContain('通过率: 50.00%')
    })
  })

  describe('响应式验证', () => {
    it('应该验证响应式图表配置', () => {
      const config: ChartConfig = {
        title: '测试图表',
        type: 'line',
        grid: {
          containLabel: true,
          left: '5%',
          right: '5%',
          top: '10%',
          bottom: '10%'
        },
        series: [
          {
            name: '系列1',
            type: 'line',
            data: [1, 2, 3, 4, 5]
          }
        ]
      }

      const result = DataVisualizationValidator.validateChartResponsiveness(config)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该警告未配置为包含标签的网格', () => {
      const config: ChartConfig = {
        title: '测试图表',
        type: 'line',
        grid: {
          containLabel: false
        },
        series: [
          {
            name: '系列1',
            type: 'line',
            data: [1, 2, 3, 4, 5]
          }
        ]
      }

      const result = DataVisualizationValidator.validateChartResponsiveness(config)
      expect(result.warnings.some(w => w.includes('未配置为包含标签'))).toBe(true)
    })
  })
})
