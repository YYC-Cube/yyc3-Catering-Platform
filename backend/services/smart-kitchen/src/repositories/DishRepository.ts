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

  async findAll(): Promise<Dish[]> {
    // 实际实现应该从数据库获取所有菜品信息
    return [
      {
        id: '1',
        name: '宫保鸡丁',
        cookingTime: 15,
        preparationTime: 10,
        complexity: 3,
        complexityScore: 7.5,
        requiredEquipment: ['炒锅', '刀具'],
        restaurantId: 'restaurant-1'
      },
      {
        id: '2',
        name: '麻婆豆腐',
        cookingTime: 12,
        preparationTime: 8,
        complexity: 2,
        complexityScore: 6.0,
        requiredEquipment: ['炒锅', '刀具'],
        restaurantId: 'restaurant-1'
      },
      {
        id: '3',
        name: '糖醋里脊',
        cookingTime: 18,
        preparationTime: 12,
        complexity: 4,
        complexityScore: 8.0,
        requiredEquipment: ['炒锅', '刀具', '油炸锅'],
        restaurantId: 'restaurant-1'
      }
    ];
  }
}

// 导出全局可用
(globalThis as any).DishRepository = DishRepository;