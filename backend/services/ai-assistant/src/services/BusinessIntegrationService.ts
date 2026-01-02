/**
 * @file BusinessIntegrationService.ts
 * @description YYC³餐饮行业智能化平台 - 业务系统集成服务
 * @module services/BusinessIntegrationService
 * @author YYC³团队
 * @version 1.0.0
 * @created 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import axios from 'axios';
import { NLPResult } from './NLPService';
import { logger } from '../config/logger';

// 菜单服务接口配置
export interface MenuServiceConfig {
  baseURL: string;
  timeout?: number;
}

// 订单服务接口配置
export interface OrderServiceConfig {
  baseURL: string;
  timeout?: number;
}

// 业务集成服务配置
export interface BusinessIntegrationConfig {
  menuService: MenuServiceConfig;
  orderService: OrderServiceConfig;
}

// 菜品信息接口
export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  stock: number;
  is_active: boolean;
  cover_image_url?: string;
}

// 订单信息接口
export interface Order {
  id: number;
  user_id: number;
  status: string;
  total_amount: number;
  created_at: Date;
  order_items: Array<{
    menu_item_id: number;
    name: string;
    quantity: number;
    price: number;
  }>;
}

// 业务集成结果接口
export interface BusinessIntegrationResult {
  success: boolean;
  data?: any;
  message: string;
  intent?: string;
  entities?: any[];
}

export class BusinessIntegrationService {
  private menuServiceClient: axios.AxiosInstance;
  private orderServiceClient: axios.AxiosInstance;
  private config: BusinessIntegrationConfig;
  private useMockData: boolean = true; // 启用模拟数据以进行测试

  constructor(config: BusinessIntegrationConfig) {
    this.config = config;
    
    // 初始化菜单服务客户端
    this.menuServiceClient = axios.create({
      baseURL: config.menuService.baseURL,
      timeout: config.menuService.timeout || 10000,
    });
    
    // 初始化订单服务客户端
    this.orderServiceClient = axios.create({
      baseURL: config.orderService.baseURL,
      timeout: config.orderService.timeout || 10000,
    });
  }

  // 模拟菜单数据
  private mockMenuItems: MenuItem[] = [
    {
      id: 1,
      name: '宫保鸡丁',
      description: '经典川菜，鸡肉丁配以花生、辣椒等炒制',
      price: 28.0,
      category_id: 1,
      stock: 100,
      is_active: true,
      cover_image_url: 'http://example.com/gongbao.jpg'
    },
    {
      id: 2,
      name: '鱼香肉丝',
      description: '川菜经典，猪肉丝配以木耳、胡萝卜等炒制',
      price: 25.0,
      category_id: 1,
      stock: 80,
      is_active: true,
      cover_image_url: 'http://example.com/yuxiang.jpg'
    },
    {
      id: 3,
      name: '米饭',
      description: '精选大米煮制',
      price: 3.0,
      category_id: 4,
      stock: 500,
      is_active: true,
      cover_image_url: 'http://example.com/rice.jpg'
    },
    {
      id: 4,
      name: '麻婆豆腐',
      description: '四川名菜，豆腐配以牛肉末、豆瓣酱等烧制',
      price: 22.0,
      category_id: 1,
      stock: 60,
      is_active: true,
      cover_image_url: 'http://example.com/mapo.jpg'
    }
  ];

  // 模拟订单数据
  private mockOrders: Order[] = [
    {
      id: 1,
      user_id: 1,
      status: 'completed',
      total_amount: 31.0,
      created_at: new Date('2025-01-28'),
      order_items: [
        {
          menu_item_id: 1,
          name: '宫保鸡丁',
          quantity: 1,
          price: 28.0
        },
        {
          menu_item_id: 3,
          name: '米饭',
          quantity: 1,
          price: 3.0
        }
      ]
    }
  ];

  /**
   * 处理NLP结果并调用相应的业务服务
   */
  async processNLPResult(nlpResult: NLPResult, userId?: number): Promise<BusinessIntegrationResult> {
    const { intent, entities } = nlpResult;
    
    logger.info(`Processing NLP result for intent: ${intent.name}`);
    
    try {
      switch (intent.name) {
        case 'order_food':
          return await this.handleOrderFood(entities, userId);
        case 'check_menu':
          return await this.handleCheckMenu(entities);
        case 'ask_opening_hours':
          return this.handleAskOpeningHours();
        case 'ask_promotions':
          return this.handleAskPromotions();
        case 'make_reservation':
          return this.handleMakeReservation(entities, userId);
        case 'ask_allergies':
          return await this.handleAskAllergies(entities);
        case 'ask_dietary':
          return await this.handleAskDietary(entities);
        case 'ask_price':
          return await this.handleAskPrice(entities);
        case 'cancel_order':
          return await this.handleCancelOrder(entities, userId);
        case 'check_order_status':
          return await this.handleCheckOrderStatus(entities, userId);
        case 'ask_recommendation':
          return await this.handleAskRecommendation(userId);
        default:
          return {
            success: false,
            message: '抱歉，我无法理解您的请求。',
            intent: intent.name,
            entities
          };
      }
    } catch (error) {
      logger.error('Error processing NLP result:', error);
      return {
        success: false,
        message: '处理请求时发生错误，请稍后再试。',
        intent: intent.name,
        entities
      };
    }
  }

  /**
   * 处理点餐意图
   */
  private async handleOrderFood(entities: any[], userId?: number): Promise<BusinessIntegrationResult> {
    // 提取食物项和数量
    const foodItems = entities.filter(entity => entity.type === 'food_item');
    const quantities = entities.filter(entity => entity.type === 'quantity');
    
    if (foodItems.length === 0) {
      return {
        success: false,
        message: '请告诉我您想要点的菜品名称。',
        intent: 'order_food',
        entities
      };
    }
    
    // 获取菜品信息
    const menuItems = await this.getMenuItemsByName(foodItems.map(item => item.value));
    
    if (menuItems.length === 0) {
      return {
        success: false,
        message: `抱歉，我们没有找到您想要的菜品：${foodItems.map(item => item.value).join('、')}。`,
        intent: 'order_food',
        entities
      };
    }
    
    // 构建订单项
    const orderItems = menuItems.map((item, index) => ({
      menu_item_id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      quantity: this.parseQuantity(quantities[index]?.value || '一份'),
      image_url: item.cover_image_url
    }));
    
    // 计算订单金额
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.06; // 假设税率为6%
    const delivery_fee = 5.00; // 假设配送费为5元
    const total_amount = subtotal + tax + delivery_fee;
    
    // 如果有用户ID，可以直接创建订单
    if (userId) {
      const order = await this.createOrder({
        user_id: userId,
        delivery_type: 'delivery',
        delivery_address: '默认地址', // 这里应该从用户信息中获取
        delivery_phone: '默认电话', // 这里应该从用户信息中获取
        order_items: orderItems,
        subtotal,
        tax,
        delivery_fee,
        discount: 0,
        total_amount
      });
      
      return {
        success: true,
        data: order,
        message: `已为您创建订单，订单号：${order.id}，总金额：${total_amount.toFixed(2)}元。`,
        intent: 'order_food',
        entities
      };
    } else {
      // 如果没有用户ID，返回订单预览信息
      return {
        success: true,
        data: {
          order_items: orderItems,
          subtotal,
          tax,
          delivery_fee,
          total_amount
        },
        message: `您想要点的菜品如下：${orderItems.map(item => `${item.name} ${item.quantity}份`).join('、')}，总金额：${total_amount.toFixed(2)}元。请登录后确认订单。`,
        intent: 'order_food',
        entities
      };
    }
  }

  /**
   * 处理查看菜单意图
   */
  private async handleCheckMenu(entities: any[]): Promise<BusinessIntegrationResult> {
    // 提取菜品类别
    const categories = entities.filter(entity => entity.type === 'food_category');
    
    let menuItems: MenuItem[];
    if (categories.length > 0) {
      // 根据类别获取菜品
      menuItems = await this.getMenuItemsByCategory(categories[0].value);
    } else {
      // 获取所有菜品
      menuItems = await this.getMenuItems();
    }
    
    if (menuItems.length === 0) {
      return {
        success: false,
        message: '当前没有可用的菜品。',
        intent: 'check_menu',
        entities
      };
    }
    
    // 构建菜单信息
    const menuInfo = menuItems.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description.substring(0, 50) + '...'
    }));
    
    return {
      success: true,
      data: menuInfo,
      message: `我们的菜单包含以下菜品：${menuItems.slice(0, 5).map(item => item.name).join('、')}等${menuItems.length}道菜。`,
      intent: 'check_menu',
      entities
    };
  }

  /**
   * 处理询问营业时间意图
   */
  private handleAskOpeningHours(): BusinessIntegrationResult {
    return {
      success: true,
      data: {
        opening_hours: '周一至周日 10:00-22:00'
      },
      message: '我们的营业时间是周一至周日 10:00-22:00。',
      intent: 'ask_opening_hours'
    };
  }

  /**
   * 处理询问优惠活动意图
   */
  private handleAskPromotions(): BusinessIntegrationResult {
    return {
      success: true,
      data: {
        promotions: [
          { name: '新用户首单立减10元', code: 'NEW10' },
          { name: '满30减5元', code: '满30减5' }
        ]
      },
      message: '我们当前的优惠活动有：新用户首单立减10元（代码：NEW10），满30减5元（代码：满30减5）。',
      intent: 'ask_promotions'
    };
  }

  /**
   * 处理预订意图
   */
  private handleMakeReservation(entities: any[], userId?: number): BusinessIntegrationResult {
    // 提取时间和人数
    const timeEntities = entities.filter(entity => entity.type === 'time');
    const dateEntities = entities.filter(entity => entity.type === 'date');
    
    if (timeEntities.length === 0) {
      return {
        success: false,
        message: '请告诉我您想要预订的时间。',
        intent: 'make_reservation',
        entities
      };
    }
    
    const reservationTime = dateEntities.length > 0 
      ? `${dateEntities[0].value} ${timeEntities[0].value}` 
      : `今天 ${timeEntities[0].value}`;
    
    return {
      success: true,
      data: {
        reservation_time: reservationTime,
        user_id: userId
      },
      message: `已为您预订${reservationTime}的座位。`,
      intent: 'make_reservation',
      entities
    };
  }

  /**
   * 处理询问过敏信息意图
   */
  private async handleAskAllergies(entities: any[]): Promise<BusinessIntegrationResult> {
    // 提取过敏原
    const allergenEntities = entities.filter(entity => entity.type === 'allergen');
    
    if (allergenEntities.length === 0) {
      return {
        success: true,
        message: '请告诉我您对什么食物过敏，我会为您提供相关信息。',
        intent: 'ask_allergies',
        entities
      };
    }
    
    return {
      success: true,
      data: {
        allergies: allergenEntities.map(entity => entity.value),
        information: `我们的菜品制作过程中可能会接触到以下过敏原：${allergenEntities.map(entity => entity.value).join('、')}。如果您有严重过敏，请在下单时备注。`
      },
      message: `我们的菜品制作过程中可能会接触到以下过敏原：${allergenEntities.map(entity => entity.value).join('、')}。如果您有严重过敏，请在下单时备注。`,
      intent: 'ask_allergies',
      entities
    };
  }

  /**
   * 处理询问饮食限制意图
   */
  private async handleAskDietary(entities: any[]): Promise<BusinessIntegrationResult> {
    // 提取饮食限制
    const dietaryEntities = entities.filter(entity => entity.type === 'dietary_restriction');
    
    if (dietaryEntities.length === 0) {
      return {
        success: false,
        message: '请告诉我您的饮食限制，我会为您推荐适合的菜品。',
        intent: 'ask_dietary',
        entities
      };
    }
    
    // 这里应该根据饮食限制获取菜品，暂时返回示例数据
    return {
      success: true,
      data: {
        dietary_restrictions: dietaryEntities.map(entity => entity.value),
        recommended_items: [
          { id: 1, name: '素食沙拉', description: '不含肉类的健康沙拉' },
          { id: 2, name: '清蒸鱼', description: '低脂肪高蛋白的健康选择' }
        ]
      },
      message: `根据您的饮食限制（${dietaryEntities.map(entity => entity.value).join('、')}），我们为您推荐以下菜品：素食沙拉、清蒸鱼等。`,
      intent: 'ask_dietary',
      entities
    };
  }

  /**
   * 处理询问价格意图
   */
  private async handleAskPrice(entities: any[]): Promise<BusinessIntegrationResult> {
    // 提取菜品名称
    const foodItems = entities.filter(entity => entity.type === 'food_item');
    
    if (foodItems.length === 0) {
      return {
        success: false,
        message: '请告诉我您想要查询价格的菜品名称。',
        intent: 'ask_price',
        entities
      };
    }
    
    // 获取菜品价格
    const menuItems = await this.getMenuItemsByName(foodItems.map(item => item.value));
    
    if (menuItems.length === 0) {
      return {
        success: false,
        message: `抱歉，我们没有找到您想要查询的菜品：${foodItems.map(item => item.value).join('、')}。`,
        intent: 'ask_price',
        entities
      };
    }
    
    return {
      success: true,
      data: menuItems.map(item => ({
        name: item.name,
        price: item.price
      })),
      message: menuItems.map(item => `${item.name}的价格是${item.price.toFixed(2)}元`).join('。'),
      intent: 'ask_price',
      entities
    };
  }

  /**
   * 处理取消订单意图
   */
  private async handleCancelOrder(entities: any[], userId?: number): Promise<BusinessIntegrationResult> {
    if (!userId) {
      return {
        success: false,
        message: '请先登录，然后再尝试取消订单。',
        intent: 'cancel_order',
        entities
      };
    }
    
    // 获取用户最近的订单
    const orders = await this.getUserOrders(userId);
    
    if (orders.length === 0) {
      return {
        success: false,
        message: '您没有未完成的订单。',
        intent: 'cancel_order',
        entities
      };
    }
    
    // 取消最近的订单
    const latestOrder = orders[0];
    await this.cancelOrder(latestOrder.id, userId, '用户取消');
    
    return {
      success: true,
      data: latestOrder,
      message: `已为您取消订单号为${latestOrder.id}的订单。`,
      intent: 'cancel_order',
      entities
    };
  }

  /**
   * 处理查看订单状态意图
   */
  private async handleCheckOrderStatus(entities: any[], userId?: number): Promise<BusinessIntegrationResult> {
    if (!userId) {
      return {
        success: false,
        message: '请先登录，然后再查看订单状态。',
        intent: 'check_order_status',
        entities
      };
    }
    
    // 获取用户最近的订单
    const orders = await this.getUserOrders(userId);
    
    if (orders.length === 0) {
      return {
        success: false,
        message: '您没有未完成的订单。',
        intent: 'check_order_status',
        entities
      };
    }
    
    const latestOrder = orders[0];
    return {
      success: true,
      data: latestOrder,
      message: `您最近的订单（订单号：${latestOrder.id}）状态为：${this.getOrderStatusText(latestOrder.status)}，总金额：${latestOrder.total_amount.toFixed(2)}元。`,
      intent: 'check_order_status',
      entities
    };
  }

  /**
   * 处理询问推荐意图
   */
  private async handleAskRecommendation(userId?: number): Promise<BusinessIntegrationResult> {
    // 获取推荐菜品
    const recommendedItems = await this.getRecommendedItems(userId);
    
    if (recommendedItems.length === 0) {
      return {
        success: false,
        message: '暂时没有推荐菜品。',
        intent: 'ask_recommendation'
      };
    }
    
    return {
      success: true,
      data: recommendedItems,
      message: `为您推荐以下菜品：${recommendedItems.map(item => item.name).join('、')}等。`,
      intent: 'ask_recommendation'
    };
  }

  /**
   * 根据名称获取菜品信息
   */
  private async getMenuItemsByName(names: string[]): Promise<MenuItem[]> {
    if (this.useMockData) {
      // 使用模拟数据
      return this.mockMenuItems.filter(item => 
        names.some(name => item.name.includes(name))
      );
    }

    try {
      const response = await this.menuServiceClient.get('/menu-items', {
        params: { names: names.join(',') }
      });
      return response.data.data || [];
    } catch (error) {
      logger.error('Error getting menu items by name:', error);
      // 如果API调用失败，回退到模拟数据
      return this.mockMenuItems.filter(item => 
        names.some(name => item.name.includes(name))
      );
    }
  }

  /**
   * 根据类别获取菜品信息
   */
  private async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    if (this.useMockData) {
      // 使用模拟数据
      return this.mockMenuItems;
    }

    try {
      const response = await this.menuServiceClient.get('/menu-items/category', {
        params: { name: category }
      });
      return response.data.data || [];
    } catch (error) {
      logger.error('Error getting menu items by category:', error);
      // 如果API调用失败，回退到模拟数据
      return this.mockMenuItems;
    }
  }

  /**
   * 获取所有菜品信息
   */
  private async getMenuItems(): Promise<MenuItem[]> {
    if (this.useMockData) {
      // 使用模拟数据
      return this.mockMenuItems;
    }

    try {
      const response = await this.menuServiceClient.get('/menu-items', {
        params: { is_active: true }
      });
      return response.data.data || [];
    } catch (error) {
      logger.error('Error getting menu items:', error);
      // 如果API调用失败，回退到模拟数据
      return this.mockMenuItems;
    }
  }

  /**
   * 获取用户订单
   */
  private async getUserOrders(userId: number): Promise<Order[]> {
    if (this.useMockData) {
      // 使用模拟数据
      return this.mockOrders.filter(order => order.user_id === userId);
    }

    try {
      const response = await this.orderServiceClient.get('/orders', {
        params: { user_id: userId }
      });
      return response.data.orders || [];
    } catch (error) {
      logger.error('Error getting user orders:', error);
      // 如果API调用失败，回退到模拟数据
      return this.mockOrders.filter(order => order.user_id === userId);
    }
  }

  /**
   * 创建订单
   */
  private async createOrder(params: any): Promise<Order> {
    if (this.useMockData) {
      // 使用模拟数据创建订单
      const newOrder: Order = {
        id: this.mockOrders.length + 1,
        user_id: params.user_id,
        status: 'pending',
        total_amount: params.total_amount,
        created_at: new Date(),
        order_items: params.order_items
      };
      this.mockOrders.push(newOrder);
      return newOrder;
    }

    try {
      const response = await this.orderServiceClient.post('/orders', params);
      return response.data.data;
    } catch (error) {
      logger.error('Error creating order:', error);
      // 如果API调用失败，回退到模拟数据
      const newOrder: Order = {
        id: this.mockOrders.length + 1,
        user_id: params.user_id,
        status: 'pending',
        total_amount: params.total_amount,
        created_at: new Date(),
        order_items: params.order_items
      };
      this.mockOrders.push(newOrder);
      return newOrder;
    }
  }

  /**
   * 取消订单
   */
  private async cancelOrder(orderId: number, userId: number, reason: string): Promise<Order> {
    if (this.useMockData) {
      // 使用模拟数据取消订单
      const order = this.mockOrders.find(o => o.id === orderId && o.user_id === userId);
      if (order) {
        order.status = 'cancelled';
        return order;
      }
      throw new Error('Order not found');
    }

    try {
      const response = await this.orderServiceClient.put(`/orders/${orderId}/cancel`, {
        user_id: userId,
        reason
      });
      return response.data.data;
    } catch (error) {
      logger.error('Error cancelling order:', error);
      // 如果API调用失败，回退到模拟数据
      const order = this.mockOrders.find(o => o.id === orderId && o.user_id === userId);
      if (order) {
        order.status = 'cancelled';
        return order;
      }
      throw new Error('Order not found');
    }
  }

  /**
   * 获取推荐菜品
   */
  private async getRecommendedItems(userId?: number): Promise<MenuItem[]> {
    if (this.useMockData) {
      // 使用模拟数据推荐
      return this.mockMenuItems.slice(0, 3); // 返回前3个菜品作为推荐
    }

    try {
      const response = await this.menuServiceClient.get('/menu-items/recommended', {
        params: userId ? { user_id: userId } : {}
      });
      return response.data.data || [];
    } catch (error) {
      logger.error('Error getting recommended items:', error);
      // 如果API调用失败，回退到模拟数据
      return this.mockMenuItems.slice(0, 3);
    }
  }

  /**
   * 解析数量
   */
  private parseQuantity(quantityText: string): number {
    // 简单的数量解析逻辑
    const chineseNumbers = {
      '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
      '六': 6, '七': 7, '八': 8, '九': 9, '十': 10
    };
    
    // 提取数字部分
    const numberMatch = quantityText.match(/\d+/);
    if (numberMatch) {
      return parseInt(numberMatch[0]);
    }
    
    // 提取中文数字
    for (const [chinese, number] of Object.entries(chineseNumbers)) {
      if (quantityText.includes(chinese)) {
        return number;
      }
    }
    
    // 默认返回1
    return 1;
  }

  /**
   * 获取订单状态文本
   */
  private getOrderStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': '待支付',
      'confirmed': '已确认',
      'preparing': '制作中',
      'delivering': '配送中',
      'delivered': '已送达',
      'cancelled': '已取消',
      'refunded': '已退款'
    };
    
    return statusMap[status] || status;
  }
}

// 导出业务集成服务实例
export const businessIntegrationService = new BusinessIntegrationService({
  menuService: {
    baseURL: 'http://localhost:3102/api/v1',
    timeout: 10000
  },
  orderService: {
    baseURL: 'http://localhost:3103/api/v1',
    timeout: 10000
  }
});
