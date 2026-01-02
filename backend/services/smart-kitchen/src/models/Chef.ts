/**
 * @file 厨师模型
 * @description 定义厨师数据模型
 * @module models/Chef
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */

export enum ChefSpecialization {
  ASIAN = 'asian',
  WESTERN = 'western',
  PASTRY = 'pastry',
  GRILL = 'grill',
  SOUP = 'soup',
  SALAD = 'salad',
  ALL = 'all'
}

export class Chef {
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

  constructor(init?: Partial<Chef>) {
    this.id = init?.id ?? '';
    this.name = init?.name ?? '';
    this.skillLevel = init?.skillLevel ?? 0;
    this.specialization = init?.specialization ?? ChefSpecialization.ALL;
    this.isAvailable = init?.isAvailable ?? true;
    this.currentOrders = init?.currentOrders ?? 0;
    this.maxOrders = init?.maxOrders ?? 3;
    this.experienceYears = init?.experienceYears ?? 0;
    this.restaurantId = init?.restaurantId ?? '';
    this.createdAt = init?.createdAt ?? new Date();
    this.updatedAt = init?.updatedAt ?? new Date();
  }

  static async findOne(options: any): Promise<Chef | null> {
    // 实际实现应该从数据库查询
    return null;
  }

  static async save(chef: Chef): Promise<Chef> {
    // 实际实现应该保存到数据库
    chef.updatedAt = new Date();
    return chef;
  }

  static async find(options: any): Promise<Chef[]> {
    // 实际实现应该从数据库查询
    return [];
  }
}
