/**
 * @file 代理服务
 * @description 处理API请求的代理转发
 * @module services/proxyService
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import axios from 'axios';
import { Request, Response } from 'express';
import logger from '../config/logger';
import { serviceRegistry } from '../config/serviceRegistry';

/**
 * 代理服务类
 */
export class ProxyService {
  /**
   * 转发请求到指定微服务
   * @param serviceName 服务名称
   * @param path 服务路径
   * @param req 请求对象
   * @param res 响应对象
   */
  async forwardRequest(serviceName: string, path: string, req: Request, res: Response): Promise<void> {
    try {
      // 从服务注册表获取服务实例
      const instance = serviceRegistry.getInstance(serviceName);
      if (!instance) {
        logger.error('服务实例不可用: %s', serviceName);
        return res.status(503).json({
          success: false,
          error: '服务暂时不可用',
        });
      }

      const targetUrl = `${instance.url}${path}`;
      
      logger.info('转发请求: %s %s -> %s', req.method, req.path, targetUrl);
      
      // 创建axios请求配置
      const axiosConfig = {
        method: req.method,
        url: targetUrl,
        headers: {
          ...req.headers,
          'X-Forwarded-For': req.ip,
          'X-Forwarded-Proto': req.protocol,
        },
        data: req.body,
        params: req.query,
        timeout: 60000,
      };
      
      // 发送请求到目标服务
      const response = await axios(axiosConfig);
      
      // 设置响应头
      Object.keys(response.headers).forEach(key => {
        if (!['content-length', 'content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
          res.setHeader(key, response.headers[key]);
        }
      });
      
      // 设置响应状态码和响应体
      res.status(response.status).send(response.data);
      
      logger.info('转发成功: %s %s -> %s %d', req.method, req.path, targetUrl, response.status);
    } catch (error: any) {
      logger.error('转发失败: %s %s -> %s, 错误: %s', req.method, req.path, serviceName, error.message);
      
      // 处理不同类型的错误
      if (error.response) {
        // 目标服务返回错误状态码
        res.status(error.response.status).json({
          success: false,
          error: error.response.data?.error || '服务调用失败',
        });
      } else if (error.request) {
        // 请求发送但没有收到响应
        res.status(504).json({
          success: false,
          error: '服务超时，请稍后再试',
        });
      } else {
        // 请求配置错误
        res.status(500).json({
          success: false,
          error: '内部服务器错误',
        });
      }
    }
  }
}

export const proxyService = new ProxyService();