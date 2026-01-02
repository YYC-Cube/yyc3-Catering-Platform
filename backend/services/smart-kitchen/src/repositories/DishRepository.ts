/**
 * @file 菜品仓库接口
 * @description 定义菜品数据访问接口
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 */

export interface Dish {
  id: string;
  name: string;
  cookingTime: number;
  preparationTime: number;
  complexity: number;
  complexityScore: number;
  requiredEquipment: string[];
  restaurantId: string;
}

export class DishRepository {
  async findById(id: string): Promise<Dish | null> {
    // 实际实现应该从数据库获取菜品信息
    return null;
  }

  async findByIds(ids: string[]): Promise<Dish[]> {
    // 实际实现应该从数据库获取多个菜品信息
    return [];
  }
}

// 导出全局可用
(globalThis as any).DishRepository = DishRepository;