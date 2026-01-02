/**
 * @file 厨师仓库接口
 * @description 定义厨师数据访问接口
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 */

import { Chef as ChefModel, ChefSpecialization } from '../models/Chef';

export interface ChefEntity { // 重命名接口以避免与模型类冲突
  id: string;
  name: string;
  skillLevel: number; // 1-5星
  specialization: ChefSpecialization;
  isAvailable: boolean;
  currentOrders: number;
  maxOrders: number;
  experienceYears: number;
  restaurantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ChefRepository {
  async getAvailableChefs(restaurantId: string): Promise<ChefEntity[]> {
    // 实际实现应该从数据库获取可用厨师
    // 模拟实现
    return [
      {
        id: 'chef-1',
        name: '张三',
        skillLevel: 5,
        specialization: ChefSpecialization.ASIAN,
        isAvailable: true,
        currentOrders: 2,
        maxOrders: 5,
        experienceYears: 10,
        restaurantId: restaurantId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'chef-2',
        name: '李四',
        skillLevel: 4,
        specialization: ChefSpecialization.WESTERN,
        isAvailable: true,
        currentOrders: 1,
        maxOrders: 4,
        experienceYears: 7,
        restaurantId: restaurantId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  async findById(id: string): Promise<ChefEntity | null> {
    // 实际实现应该从数据库获取厨师信息
    // 模拟实现
    return {
      id: id,
      name: '测试厨师',
      skillLevel: 3,
      specialization: ChefSpecialization.ALL,
      isAvailable: true,
      currentOrders: 0,
      maxOrders: 3,
      experienceYears: 5,
      restaurantId: 'rest-1',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async findByRestaurant(restaurantId: string): Promise<ChefEntity[]> {
    // 实际实现应该从数据库获取餐厅的所有厨师
    // 模拟实现
    return [
      {
        id: 'chef-1',
        name: '张三',
        skillLevel: 5,
        specialization: ChefSpecialization.ASIAN,
        isAvailable: true,
        currentOrders: 2,
        maxOrders: 5,
        experienceYears: 10,
        restaurantId: restaurantId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'chef-2',
        name: '李四',
        skillLevel: 4,
        specialization: ChefSpecialization.WESTERN,
        isAvailable: true,
        currentOrders: 1,
        maxOrders: 4,
        experienceYears: 7,
        restaurantId: restaurantId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'chef-3',
        name: '王五',
        skillLevel: 3,
        specialization: ChefSpecialization.PASTRY,
        isAvailable: true,
        currentOrders: 0,
        maxOrders: 3,
        experienceYears: 3,
        restaurantId: restaurantId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  async updateChefWorkload(chefId: string, workloadChange: number): Promise<void> {
    // 实际实现应该更新数据库中的厨师工作量
    // 模拟实现
    console.log(`更新厨师 ${chefId} 的工作量: ${workloadChange}`);
  }

  async updateChefAvailability(chefId: string, isAvailable: boolean): Promise<void> {
    // 实际实现应该更新数据库中的厨师可用性
    // 模拟实现
    console.log(`更新厨师 ${chefId} 的可用性: ${isAvailable}`);
  }
}

// 不建议将仓库导出到全局对象
// 应该使用正确的导入方式在需要的地方使用这个类