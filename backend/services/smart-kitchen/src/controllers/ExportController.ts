/**
 * @file ExportController.ts
 * @description 导出控制器类 - 处理Dashboard数据导出API请求
 * @module controllers
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 * @updated 2025-01-19
 */
import { Request, Response, Router } from 'express';
import { OrderService } from '../services/OrderService';
import { DishRepository } from '../repositories/DishRepository';

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: number;
}

export interface ExportRequest {
  format: 'excel' | 'pdf' | 'csv';
  filters?: {
    startDate?: string;
    endDate?: string;
    period?: 'today' | 'week' | 'month' | 'year';
  };
}

export class ExportController {
  public router: Router;

  constructor(
    private orderService: OrderService,
    private dishRepository: DishRepository
  ) {
    this.router = Router();
  }

  async exportDashboardData(req: Request, res: Response) {
    try {
      const { format, filters }: ExportRequest = req.body;
      
      // SECURITY FIX: Validate format parameter
      const allowedFormats = ['excel', 'pdf', 'csv'];
      if (!format || !allowedFormats.includes(format)) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'Invalid export format. Allowed formats: excel, pdf, csv',
          timestamp: Date.now()
        });
      }
      
      // 获取订单数据
      const orderQueue = await this.orderService.getOrderQueue('', 'all', 10000, 0);
      
      // 获取菜品数据
      const dishes = await this.dishRepository.findAll();
      
      // 根据格式处理导出数据
      let exportData: any;
      let contentType: string;
      let filename: string;
      
      // SECURITY FIX: Generate safe filename with timestamp
      const timestamp = Date.now();
      
      switch (format) {
        case 'excel':
          exportData = this.generateExcelData(orderQueue.orders, dishes);
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          filename = `dashboard-export-${timestamp}.xlsx`;
          break;
          
        case 'pdf':
          exportData = this.generatePdfData(orderQueue.orders, dishes);
          contentType = 'application/pdf';
          filename = `dashboard-export-${timestamp}.pdf`;
          break;
          
        case 'csv':
          exportData = this.generateCsvData(orderQueue.orders, dishes);
          contentType = 'text/csv';
          filename = `dashboard-export-${timestamp}.csv`;
          break;
          
        default:
          throw new Error('不支持的导出格式');
      }
      
      // SECURITY FIX: Properly escape filename in Content-Disposition header
      const escapedFilename = filename.replace(/["\\]/g, '\\$&');
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${escapedFilename}"`);
      
      // 返回导出数据
      res.send(exportData);
      
    } catch (error) {
      console.error('Export dashboard data error:', error);
      res.status(500).json({
        success: false,
        data: null,
        message: 'Failed to export dashboard data',
        timestamp: Date.now()
      });
    }
  }

  private generateExcelData(orders: any[], dishes: any[]) {
    // 简化的Excel数据生成（实际项目中应使用如exceljs等库）
    const workbook = {
      sheets: [
        {
          name: '订单数据',
          data: orders.map(order => ({
            订单ID: order.id,
            状态: order.status,
            创建时间: order.createdAt,
            更新时间: order.updatedAt,
            菜品数量: order.dishes?.length || 0,
            优先级: order.priority || 'medium'
          }))
        },
        {
          name: '菜品数据',
          data: dishes.map(dish => ({
            菜品ID: dish.id,
            名称: dish.name,
            类别: dish.category,
            价格: dish.price,
            描述: dish.description
          }))
        }
      ]
    };
    
    return JSON.stringify(workbook);
  }

  private generatePdfData(orders: any[], dishes: any[]) {
    // 简化的PDF数据生成（实际项目中应使用如puppeteer等库）
    const pdfContent = {
      title: 'Dashboard数据导出',
      generatedAt: new Date().toISOString(),
      sections: [
        {
          title: '订单统计',
          content: {
            总订单数: orders.length,
            进行中订单: orders.filter(o => o.status === 'in_progress').length,
            待处理订单: orders.filter(o => o.status === 'pending').length,
            已完成订单: orders.filter(o => o.status === 'completed').length
          }
        },
        {
          title: '菜品统计',
          content: {
            总菜品数: dishes.length,
            平均价格: dishes.reduce((sum, d) => sum + d.price, 0) / dishes.length
          }
        }
      ]
    };
    
    return JSON.stringify(pdfContent);
  }

  private generateCsvData(orders: any[], dishes: any[]) {
    // 生成CSV格式数据
    const csvHeaders = ['订单ID', '状态', '创建时间', '更新时间', '菜品数量', '优先级'];
    const csvRows = orders.map(order => [
      order.id,
      order.status,
      order.createdAt,
      order.updatedAt,
      order.dishes?.length || 0,
      order.priority || 'medium'
    ]);
    
    // 转换为CSV字符串
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
  }
}
