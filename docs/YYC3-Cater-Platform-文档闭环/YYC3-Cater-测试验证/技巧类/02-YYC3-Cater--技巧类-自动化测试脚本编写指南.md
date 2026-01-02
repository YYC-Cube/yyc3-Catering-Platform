---

**@file**：YYC³-自动化测试脚本编写指南
**@description**：YYC³餐饮行业智能化平台的自动化测试脚本编写指南
**@author**：YYC³
**@version**：v1.0.0
**@created**：2025-01-30
**@updated**：2025-01-30
**@status**：published
**@tags**：YYC³,文档

---
# 自动化测试脚本编写指南

## 文档信息
- 文档类型：技巧类
- 所属阶段：YYC3-Cater--测试验证
- 遵循规范：五高五标五化要求
- 版本号：V1.0

## 核心内容

---

## 1. 自动化测试概述

### 1.1 自动化测试定义

自动化测试是使用软件工具执行预先编写的测试脚本，自动验证软件功能是否符合预期的一种测试方法。

### 1.2 自动化测试优势

- **效率提升**：快速执行大量测试用例
- **回归测试**：快速验证代码变更
- **一致性**：消除人为误差
- **可重复性**：多次执行结果一致
- **覆盖率**：提高测试覆盖率

### 1.3 自动化测试适用场景

```typescript
/**
 * 自动化测试适用性评估
 */
enum AutomationSuitability {
  /** 高度适合 - 重复性高、稳定的功能 */
  HIGH = 'high',
  /** 中度适合 - 需要人工判断的功能 */
  MEDIUM = 'medium',
  /** 低度适合 - 频繁变化、UI复杂的功能 */
  LOW = 'low'
}

/**
 * 自动化测试适用性评估器
 */
class AutomationSuitabilityAssessor {
  /**
   * 评估功能是否适合自动化
   * @param feature 功能描述
   * @param characteristics 功能特征
   * @returns 适用性等级
   */
  static assess(
    feature: string,
    characteristics: {
      /** 重复执行频率 */
      executionFrequency: 'high' | 'medium' | 'low';
      /** 功能稳定性 */
      stability: 'high' | 'medium' | 'low';
      /** 复杂度 */
      complexity: 'high' | 'medium' | 'low';
      /** 可测试性 */
      testability: 'high' | 'medium' | 'low';
    }
  ): AutomationSuitability {
    let score = 0;
    
    // 执行频率
    if (characteristics.executionFrequency === 'high') score += 3;
    else if (characteristics.executionFrequency === 'medium') score += 2;
    else score += 1;
    
    // 功能稳定性
    if (characteristics.stability === 'high') score += 3;
    else if (characteristics.stability === 'medium') score += 2;
    else score += 1;
    
    // 复杂度
    if (characteristics.complexity === 'low') score += 3;
    else if (characteristics.complexity === 'medium') score += 2;
    else score += 1;
    
    // 可测试性
    if (characteristics.testability === 'high') score += 3;
    else if (characteristics.testability === 'medium') score += 2;
    else score += 1;
    
    // 评分判定
    if (score >= 10) return AutomationSuitability.HIGH;
    else if (score >= 7) return AutomationSuitability.MEDIUM;
    else return AutomationSuitability.LOW;
  }
}

// 使用示例
const suitability = AutomationSuitabilityAssessor.assess('用户登录', {
  executionFrequency: 'high',
  stability: 'high',
  complexity: 'low',
  testability: 'high'
});
console.log('自动化测试适用性:', suitability);
```

---

## 2. 测试框架选择与配置

### 2.1 主流测试框架对比

```typescript
/**
 * 测试框架配置
 */
interface TestFrameworkConfig {
  /** 框架名称 */
  name: string;
  /** 适用类型 */
  type: 'unit' | 'integration' | 'e2e' | 'api';
  /** 学习曲线 */
  learningCurve: 'easy' | 'medium' | 'hard';
  /** 执行速度 */
  speed: 'fast' | 'medium' | 'slow';
  /** 社区支持 */
  communitySupport: 'high' | 'medium' | 'low';
  /** 优势 */
  advantages: string[];
  /** 劣势 */
  disadvantages: string[];
}

/**
 * 测试框架推荐器
 */
class TestFrameworkRecommender {
  private static frameworks: TestFrameworkConfig[] = [
    {
      name: 'Jest',
      type: 'unit',
      learningCurve: 'easy',
      speed: 'fast',
      communitySupport: 'high',
      advantages: ['零配置', '内置断言库', '快照测试', '并行执行'],
      disadvantages: ['E2E测试需要额外工具', '浏览器测试需要配置']
    },
    {
      name: 'Cypress',
      type: 'e2e',
      learningCurve: 'medium',
      speed: 'medium',
      communitySupport: 'high',
      advantages: ['实时重载', '调试友好', '自动等待', '网络拦截'],
      disadvantages: ['不支持多标签页', '内存占用较高']
    },
    {
      name: 'Playwright',
      type: 'e2e',
      learningCurve: 'medium',
      speed: 'fast',
      communitySupport: 'high',
      advantages: ['多浏览器支持', '并行执行', 'API测试', '移动端模拟'],
      disadvantages: ['学习曲线较陡', '调试工具不如Cypress']
    },
    {
      name: 'Supertest',
      type: 'api',
      learningCurve: 'easy',
      speed: 'fast',
      communitySupport: 'high',
      advantages: ['简单易用', '链式调用', '断言丰富', '与Mocha配合好'],
      disadvantages: ['仅适用于HTTP测试', '不适用于WebSocket']
    }
  ];
  
  /**
   * 推荐测试框架
   * @param testType 测试类型
   * @param requirements 需求
   * @returns 推荐框架
   */
  static recommend(
    testType: 'unit' | 'integration' | 'e2e' | 'api',
    requirements: {
      learningCurve?: 'easy' | 'medium' | 'hard';
      speed?: 'fast' | 'medium' | 'slow';
      communitySupport?: 'high' | 'medium' | 'low';
    }
  ): TestFrameworkConfig[] {
    return this.frameworks
      .filter(fw => fw.type === testType)
      .filter(fw => {
        if (requirements.learningCurve && fw.learningCurve !== requirements.learningCurve) {
          return false;
        }
        if (requirements.speed && fw.speed !== requirements.speed) {
          return false;
        }
        if (requirements.communitySupport && fw.communitySupport !== requirements.communitySupport) {
          return false;
        }
        return true;
      });
  }
}

// 使用示例
const recommendedFrameworks = TestFrameworkRecommender.recommend('e2e', {
  learningCurve: 'medium',
  speed: 'fast',
  communitySupport: 'high'
});
console.log('推荐测试框架:', recommendedFrameworks);
```

### 2.2 Jest框架配置

```typescript
/**
 * Jest配置示例
 */
const jestConfig = {
  /** 测试环境 */
  testEnvironment: 'node',
  /** 测试文件匹配模式 */
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  /** 覆盖率收集配置 */
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.type.ts'
  ],
  /** 覆盖率阈值 */
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  /** 模块路径别名 */
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  /** 测试超时时间 */
  testTimeout: 10000,
  /** 并行执行 */
  maxWorkers: '50%',
  /** 详细输出 */
  verbose: true
};

/**
 * Jest测试基类
 */
abstract class JestTestBase {
  /**
   * 设置测试环境
   */
  protected static setup(): void {
    beforeAll(async () => {
      // 初始化测试环境
    });
    
    afterAll(async () => {
      // 清理测试环境
    });
  }
  
  /**
   * 设置每个测试用例
   */
  protected static setupEach(): void {
    beforeEach(() => {
      // 每个测试用例前的准备
    });
    
    afterEach(() => {
      // 每个测试用例后的清理
    });
  }
}

/**
 * 用户服务测试示例
 */
class UserServiceTest extends JestTestBase {
  private static userService: any;
  
  static {
    this.setup();
    this.setupEach();
  }
  
  static {
    beforeAll(() => {
      // 初始化用户服务
      this.userService = {
        createUser: async (data: any) => ({ id: '1', ...data }),
        getUserById: async (id: string) => ({ id, name: 'Test User' })
      };
    });
  }
  
  static testCreateUser() {
    it('应该成功创建用户', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      };
      
      const result = await this.userService.createUser(userData);
      
      expect(result).toHaveProperty('id');
      expect(result.email).toBe(userData.email);
      expect(result.name).toBe(userData.name);
    });
    
    it('当邮箱为空时应该抛出错误', async () => {
      const userData = {
        email: '',
        name: 'Test User',
        password: 'password123'
      };
      
      await expect(
        this.userService.createUser(userData)
      ).rejects.toThrow('邮箱不能为空');
    });
  }
}
```

### 2.3 Cypress框架配置

```typescript
/**
 * Cypress配置示例
 */
const cypressConfig = {
  /** 基础URL */
  baseUrl: 'http://localhost:3000',
  /** 视口大小 */
  viewportWidth: 1280,
  viewportHeight: 720,
  /** 默认命令超时 */
  defaultCommandTimeout: 10000,
  /** 页面加载超时 */
  pageLoadTimeout: 60000,
  /** 请求超时 */
  requestTimeout: 10000,
  /** 响应超时 */
  responseTimeout: 30000,
  /** 视频录制 */
  video: true,
  /** 截图 */
  screenshotOnRunFailure: true,
  /** 测试文件位置 */
  specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  /** 支持的浏览器 */
  browser: 'chrome',
  /** 环境变量 */
  env: {
    apiUrl: 'http://localhost:3000/api',
    username: 'test@example.com',
    password: 'password123'
  }
};

/**
 * Cypress自定义命令
 */
declare global {
  namespace Cypress {
    interface Chainable {
      /** 登录命令 */
      login(username: string, password: string): Chainable<void>;
      /** 登出命令 */
      logout(): Chainable<void>;
      /** 等待API响应 */
      waitForApi(method: string, url: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name="username"]').type(username);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-cy="logout-button"]').click();
  cy.url().should('include', '/login');
});

Cypress.Commands.add('waitForApi', (method: string, url: string) => {
  cy.intercept(method, url).as('apiRequest');
  cy.wait('@apiRequest');
});

/**
 * Cypress测试基类
 */
abstract class CypressTestBase {
  /**
   * 设置测试环境
   */
  protected static setup(): void {
    before(() => {
      // 清空cookies和localStorage
      cy.clearCookies();
      cy.clearLocalStorage();
    });
    
    beforeEach(() => {
      // 每个测试用例前的准备
      cy.visit('/');
    });
  }
}

/**
 * 登录功能测试示例
 */
class LoginTest extends CypressTestBase {
  static testLogin() {
    describe('用户登录', () => {
      it('应该成功登录', () => {
        cy.login('test@example.com', 'password123');
        cy.contains('欢迎回来').should('be.visible');
      });
      
      it('当密码错误时应该显示错误提示', () => {
        cy.visit('/login');
        cy.get('input[name="username"]').type('test@example.com');
        cy.get('input[name="password"]').type('wrongpassword');
        cy.get('button[type="submit"]').click();
        cy.contains('用户名或密码错误').should('be.visible');
      });
    });
  }
}
```

---

## 3. 单元测试脚本编写

### 3.1 单元测试最佳实践

```typescript
/**
 * 单元测试示例：计算器类
 */
class Calculator {
  /**
   * 加法
   */
  add(a: number, b: number): number {
    return a + b;
  }
  
  /**
   * 减法
   */
  subtract(a: number, b: number): number {
    return a - b;
  }
  
  /**
   * 乘法
   */
  multiply(a: number, b: number): number {
    return a * b;
  }
  
  /**
   * 除法
   */
  divide(a: number, b: number): number {
    if (b === 0) {
      throw new Error('除数不能为零');
    }
    return a / b;
  }
}

/**
 * 计算器单元测试
 */
describe('Calculator', () => {
  let calculator: Calculator;
  
  beforeEach(() => {
    calculator = new Calculator();
  });
  
  describe('add', () => {
    it('应该正确计算两个正数的和', () => {
      const result = calculator.add(2, 3);
      expect(result).toBe(5);
    });
    
    it('应该正确计算正数和负数的和', () => {
      const result = calculator.add(5, -3);
      expect(result).toBe(2);
    });
    
    it('应该正确计算两个负数的和', () => {
      const result = calculator.add(-2, -3);
      expect(result).toBe(-5);
    });
    
    it('应该正确计算零与数的和', () => {
      expect(calculator.add(0, 5)).toBe(5);
      expect(calculator.add(5, 0)).toBe(5);
    });
  });
  
  describe('subtract', () => {
    it('应该正确计算两个正数的差', () => {
      const result = calculator.subtract(5, 3);
      expect(result).toBe(2);
    });
    
    it('应该正确计算负数减正数', () => {
      const result = calculator.subtract(-5, 3);
      expect(result).toBe(-8);
    });
  });
  
  describe('divide', () => {
    it('应该正确计算两个数的商', () => {
      const result = calculator.divide(10, 2);
      expect(result).toBe(5);
    });
    
    it('当除数为零时应该抛出错误', () => {
      expect(() => calculator.divide(10, 0)).toThrow('除数不能为零');
    });
  });
});
```

### 3.2 Mock与Stub使用

```typescript
/**
 * 用户服务类
 */
class UserService {
  constructor(private userRepository: any) {}
  
  async createUser(userData: any): Promise<any> {
    // 验证邮箱格式
    if (!this.isValidEmail(userData.email)) {
      throw new Error('邮箱格式不正确');
    }
    
    // 检查邮箱是否已存在
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('邮箱已存在');
    }
    
    // 创建用户
    return this.userRepository.create(userData);
  }
  
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

/**
 * 用户服务单元测试（使用Mock）
 */
describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: any;
  
  beforeEach(() => {
    // 创建Mock对象
    mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn()
    };
    
    userService = new UserService(mockUserRepository);
  });
  
  describe('createUser', () => {
    it('应该成功创建用户', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      };
      
      // Mock findByEmail返回null（邮箱不存在）
      mockUserRepository.findByEmail.mockResolvedValue(null);
      
      // Mock create返回创建的用户
      const createdUser = { id: '1', ...userData };
      mockUserRepository.create.mockResolvedValue(createdUser);
      
      // 执行测试
      const result = await userService.createUser(userData);
      
      // 验证结果
      expect(result).toEqual(createdUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
    });
    
    it('当邮箱格式不正确时应该抛出错误', async () => {
      const userData = {
        email: 'invalid-email',
        name: 'Test User',
        password: 'password123'
      };
      
      await expect(userService.createUser(userData)).rejects.toThrow('邮箱格式不正确');
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    });
    
    it('当邮箱已存在时应该抛出错误', async () => {
      const userData = {
        email: 'existing@example.com',
        name: 'Test User',
        password: 'password123'
      };
      
      // Mock findByEmail返回已存在的用户
      mockUserRepository.findByEmail.mockResolvedValue({ id: '1', email: userData.email });
      
      await expect(userService.createUser(userData)).rejects.toThrow('邮箱已存在');
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });
});
```

### 3.3 异步测试

```typescript
/**
 * 异步服务类
 */
class AsyncService {
  constructor(private apiClient: any) {}
  
  /**
   * 获取用户数据
   */
  async getUserData(userId: string): Promise<any> {
    const response = await this.apiClient.get(`/users/${userId}`);
    return response.data;
  }
  
  /**
   * 批量获取用户数据
   */
  async getMultipleUserData(userIds: string[]): Promise<any[]> {
    const promises = userIds.map(id => this.getUserData(id));
    return Promise.all(promises);
  }
  
  /**
   * 带重试的API调用
   */
  async fetchWithRetry(url: string, maxRetries: number = 3): Promise<any> {
    let lastError: Error | null = null;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await this.apiClient.get(url);
        return response.data;
      } catch (error) {
        lastError = error as Error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    
    throw lastError;
  }
}

/**
 * 异步服务单元测试
 */
describe('AsyncService', () => {
  let asyncService: AsyncService;
  let mockApiClient: any;
  
  beforeEach(() => {
    mockApiClient = {
      get: jest.fn()
    };
    asyncService = new AsyncService(mockApiClient);
  });
  
  describe('getUserData', () => {
    it('应该成功获取用户数据', async () => {
      const userId = '123';
      const mockUserData = { id: userId, name: 'Test User' };
      
      mockApiClient.get.mockResolvedValue({ data: mockUserData });
      
      const result = await asyncService.getUserData(userId);
      
      expect(result).toEqual(mockUserData);
      expect(mockApiClient.get).toHaveBeenCalledWith(`/users/${userId}`);
    });
    
    it('当API调用失败时应该抛出错误', async () => {
      const userId = '123';
      mockApiClient.get.mockRejectedValue(new Error('Network Error'));
      
      await expect(asyncService.getUserData(userId)).rejects.toThrow('Network Error');
    });
  });
  
  describe('getMultipleUserData', () => {
    it('应该成功获取多个用户数据', async () => {
      const userIds = ['1', '2', '3'];
      const mockUsers = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' },
        { id: '3', name: 'User 3' }
      ];
      
      mockApiClient.get
        .mockResolvedValueOnce({ data: mockUsers[0] })
        .mockResolvedValueOnce({ data: mockUsers[1] })
        .mockResolvedValueOnce({ data: mockUsers[2] });
      
      const result = await asyncService.getMultipleUserData(userIds);
      
      expect(result).toEqual(mockUsers);
      expect(mockApiClient.get).toHaveBeenCalledTimes(3);
    });
  });
  
  describe('fetchWithRetry', () => {
    it('应该在第一次尝试成功时返回数据', async () => {
      const url = '/api/data';
      const mockData = { success: true };
      
      mockApiClient.get.mockResolvedValueOnce({ data: mockData });
      
      const result = await asyncService.fetchWithRetry(url);
      
      expect(result).toEqual(mockData);
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    });
    
    it('应该在重试后成功返回数据', async () => {
      const url = '/api/data';
      const mockData = { success: true };
      
      mockApiClient.get
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValueOnce({ data: mockData });
      
      const result = await asyncService.fetchWithRetry(url, 3);
      
      expect(result).toEqual(mockData);
      expect(mockApiClient.get).toHaveBeenCalledTimes(3);
    });
    
    it('应该在重试次数用尽后抛出错误', async () => {
      const url = '/api/data';
      
      mockApiClient.get.mockRejectedValue(new Error('Network Error'));
      
      await expect(asyncService.fetchWithRetry(url, 3)).rejects.toThrow('Network Error');
      expect(mockApiClient.get).toHaveBeenCalledTimes(3);
    });
  });
});
```

---

## 4. 集成测试脚本编写

### 4.1 API集成测试

```typescript
/**
 * API集成测试示例
 */
import request from 'supertest';
import { app } from '../app';

describe('API集成测试', () => {
  describe('用户API', () => {
    let authToken: string;
    let userId: string;
    
    beforeAll(async () => {
      // 创建测试用户并获取token
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      
      authToken = response.body.token;
    });
    
    describe('POST /api/users', () => {
      it('应该成功创建用户', async () => {
        const userData = {
          email: 'newuser@example.com',
          name: 'New User',
          password: 'password123'
        };
        
        const response = await request(app)
          .post('/api/users')
          .set('Authorization', `Bearer ${authToken}`)
          .send(userData)
          .expect(201);
        
        expect(response.body).toHaveProperty('id');
        expect(response.body.email).toBe(userData.email);
        expect(response.body.name).toBe(userData.name);
        expect(response.body).not.toHaveProperty('password');
        
        userId = response.body.id;
      });
      
      it('当邮箱已存在时应该返回400错误', async () => {
        const userData = {
          email: 'test@example.com',
          name: 'Duplicate User',
          password: 'password123'
        };
        
        const response = await request(app)
          .post('/api/users')
          .set('Authorization', `Bearer ${authToken}`)
          .send(userData)
          .expect(400);
        
        expect(response.body).toHaveProperty('error');
      });
      
      it('当未授权时应该返回401错误', async () => {
        const userData = {
          email: 'unauthorized@example.com',
          name: 'Unauthorized User',
          password: 'password123'
        };
        
        await request(app)
          .post('/api/users')
          .send(userData)
          .expect(401);
      });
    });
    
    describe('GET /api/users/:id', () => {
      it('应该成功获取用户信息', async () => {
        const response = await request(app)
          .get(`/api/users/${userId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);
        
        expect(response.body).toHaveProperty('id', userId);
        expect(response.body).toHaveProperty('email');
        expect(response.body).toHaveProperty('name');
      });
      
      it('当用户不存在时应该返回404错误', async () => {
        await request(app)
          .get('/api/users/nonexistent-id')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);
      });
    });
    
    describe('PUT /api/users/:id', () => {
      it('应该成功更新用户信息', async () => {
        const updateData = {
          name: 'Updated User'
        };
        
        const response = await request(app)
          .put(`/api/users/${userId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);
        
        expect(response.body.name).toBe(updateData.name);
      });
    });
    
    describe('DELETE /api/users/:id', () => {
      it('应该成功删除用户', async () => {
        await request(app)
          .delete(`/api/users/${userId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(204);
        
        // 验证用户已被删除
        await request(app)
          .get(`/api/users/${userId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);
      });
    });
  });
});
```

### 4.2 数据库集成测试

```typescript
/**
 * 数据库集成测试示例
 */
import { DatabaseService } from '../services/database';

describe('数据库集成测试', () => {
  let db: DatabaseService;
  
  beforeAll(async () => {
    // 初始化测试数据库
    db = new DatabaseService({
      host: 'localhost',
      port: 5432,
      database: 'test_db',
      username: 'test_user',
      password: 'test_password'
    });
    
    await db.connect();
  });
  
  afterAll(async () => {
    // 清理并关闭数据库连接
    await db.disconnect();
  });
  
  beforeEach(async () => {
    // 清空测试表
    await db.query('TRUNCATE TABLE users CASCADE');
    await db.query('TRUNCATE TABLE orders CASCADE');
  });
  
  describe('用户表操作', () => {
    it('应该成功插入用户', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password'
      };
      
      const result = await db.query(
        'INSERT INTO users (email, name, password) VALUES ($1, $2, $3) RETURNING *',
        [userData.email, userData.name, userData.password]
      );
      
      expect(result.rows[0]).toHaveProperty('id');
      expect(result.rows[0].email).toBe(userData.email);
    });
    
    it('应该成功查询用户', async () => {
      // 先插入用户
      await db.query(
        'INSERT INTO users (email, name, password) VALUES ($1, $2, $3)',
        ['test@example.com', 'Test User', 'hashed_password']
      );
      
      // 查询用户
      const result = await db.query(
        'SELECT * FROM users WHERE email = $1',
        ['test@example.com']
      );
      
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].email).toBe('test@example.com');
    });
    
    it('应该成功更新用户', async () => {
      // 先插入用户
      const insertResult = await db.query(
        'INSERT INTO users (email, name, password) VALUES ($1, $2, $3) RETURNING id',
        ['test@example.com', 'Test User', 'hashed_password']
      );
      
      const userId = insertResult.rows[0].id;
      
      // 更新用户
      await db.query(
        'UPDATE users SET name = $1 WHERE id = $2',
        ['Updated User', userId]
      );
      
      // 验证更新
      const result = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );
      
      expect(result.rows[0].name).toBe('Updated User');
    });
  });
  
  describe('事务操作', () => {
    it('应该成功执行事务', async () => {
      await db.transaction(async (client) => {
        // 插入用户
        const userResult = await client.query(
          'INSERT INTO users (email, name, password) VALUES ($1, $2, $3) RETURNING id',
          ['test@example.com', 'Test User', 'hashed_password']
        );
        
        const userId = userResult.rows[0].id;
        
        // 插入订单
        await client.query(
          'INSERT INTO orders (user_id, total_amount, status) VALUES ($1, $2, $3)',
          [userId, 100.00, 'pending']
        );
      });
      
      // 验证数据已插入
      const userResult = await db.query(
        'SELECT * FROM users WHERE email = $1',
        ['test@example.com']
      );
      
      const orderResult = await db.query(
        'SELECT * FROM orders WHERE user_id = $1',
        [userResult.rows[0].id]
      );
      
      expect(userResult.rows.length).toBe(1);
      expect(orderResult.rows.length).toBe(1);
    });
    
    it('应该在事务失败时回滚', async () => {
      try {
        await db.transaction(async (client) => {
          // 插入用户
          const userResult = await client.query(
            'INSERT INTO users (email, name, password) VALUES ($1, $2, $3) RETURNING id',
            ['test@example.com', 'Test User', 'hashed_password']
          );
          
          const userId = userResult.rows[0].id;
          
          // 尝试插入无效订单（会失败）
          await client.query(
            'INSERT INTO orders (user_id, total_amount, status) VALUES ($1, $2, $3)',
            [userId, -100.00, 'pending'] // 负数金额会触发约束
          );
        });
      } catch (error) {
        // 预期会抛出错误
      }
      
      // 验证数据已回滚
      const userResult = await db.query(
        'SELECT * FROM users WHERE email = $1',
        ['test@example.com']
      );
      
      expect(userResult.rows.length).toBe(0);
    });
  });
});
```

---

## 5. E2E测试脚本编写

### 5.1 用户流程测试

```typescript
/**
 * E2E测试示例：用户注册登录流程
 */
describe('用户注册登录流程', () => {
  beforeEach(() => {
    cy.visit('/register');
  });
  
  it('应该完成完整的注册登录流程', () => {
    // 1. 注册新用户
    cy.get('input[name="email"]').type('newuser@example.com');
    cy.get('input[name="name"]').type('New User');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // 2. 验证注册成功
    cy.url().should('include', '/login');
    cy.contains('注册成功').should('be.visible');
    
    // 3. 登录
    cy.get('input[name="email"]').type('newuser@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // 4. 验证登录成功
    cy.url().should('include', '/dashboard');
    cy.contains('欢迎, New User').should('be.visible');
  });
  
  it('当密码不匹配时应该显示错误', () => {
    cy.get('input[name="email"]').type('newuser@example.com');
    cy.get('input[name="name"]').type('New User');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password456');
    cy.get('button[type="submit"]').click();
    
    cy.contains('密码不匹配').should('be.visible');
  });
});

/**
 * E2E测试示例：购物车流程
 */
describe('购物车流程', () => {
  beforeEach(() => {
    // 登录
    cy.login('test@example.com', 'password123');
  });
  
  it('应该完成完整的购物流程', () => {
    // 1. 浏览商品
    cy.visit('/products');
    cy.get('[data-cy="product-card"]').first().click();
    
    // 2. 添加到购物车
    cy.get('[data-cy="add-to-cart"]').click();
    cy.contains('已添加到购物车').should('be.visible');
    
    // 3. 查看购物车
    cy.get('[data-cy="cart-icon"]').click();
    cy.url().should('include', '/cart');
    
    // 4. 验证购物车内容
    cy.get('[data-cy="cart-item"]').should('have.length', 1);
    cy.get('[data-cy="cart-total"]').should('contain', '¥');
    
    // 5. 结算
    cy.get('[data-cy="checkout-button"]').click();
    cy.url().should('include', '/checkout');
    
    // 6. 填写收货信息
    cy.get('input[name="address"]').type('测试地址');
    cy.get('input[name="phone"]').type('13800138000');
    cy.get('[data-cy="place-order"]').click();
    
    // 7. 验证订单创建成功
    cy.url().should('include', '/orders');
    cy.contains('订单创建成功').should('be.visible');
  });
});
```

### 5.2 表单测试

```typescript
/**
 * 表单测试示例
 */
describe('表单测试', () => {
  describe('用户注册表单', () => {
    beforeEach(() => {
      cy.visit('/register');
    });
    
    it('应该验证必填字段', () => {
      // 不填写任何字段直接提交
      cy.get('button[type="submit"]').click();
      
      // 验证错误提示
      cy.contains('邮箱不能为空').should('be.visible');
      cy.contains('姓名不能为空').should('be.visible');
      cy.contains('密码不能为空').should('be.visible');
    });
    
    it('应该验证邮箱格式', () => {
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('button[type="submit"]').click();
      
      cy.contains('邮箱格式不正确').should('be.visible');
    });
    
    it('应该验证密码长度', () => {
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="password"]').type('123');
      cy.get('input[name="confirmPassword"]').type('123');
      cy.get('button[type="submit"]').click();
      
      cy.contains('密码长度至少为8位').should('be.visible');
    });
    
    it('应该验证密码确认', () => {
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password456');
      cy.get('button[type="submit"]').click();
      
      cy.contains('两次输入的密码不一致').should('be.visible');
    });
    
    it('应该在所有验证通过后成功提交', () => {
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      cy.url().should('include', '/login');
    });
  });
  
  describe('搜索表单', () => {
    beforeEach(() => {
      cy.visit('/search');
    });
    
    it('应该支持实时搜索', () => {
      cy.get('input[name="search"]').type('test');
      
      // 等待搜索结果加载
      cy.get('[data-cy="search-results"]').should('be.visible');
      cy.get('[data-cy="search-result-item"]').should('have.length.greaterThan', 0);
    });
    
    it('应该支持高级搜索', () => {
      cy.get('[data-cy="advanced-search-toggle"]').click();
      
      cy.get('select[name="category"]').select('电子产品');
      cy.get('input[name="minPrice"]').type('100');
      cy.get('input[name="maxPrice"]').type('1000');
      
      cy.get('[data-cy="search-button"]').click();
      
      cy.get('[data-cy="search-results"]').should('be.visible');
    });
  });
});
```

---

## 6. 测试数据管理

### 6.1 测试数据生成

```typescript
/**
 * 测试数据生成器
 */
class TestDataGenerator {
  /**
   * 生成随机用户数据
   */
  static generateUserData(overrides?: Partial<any>): any {
    const id = Math.random().toString(36).substring(7);
    return {
      id,
      email: `user${id}@example.com`,
      name: `User ${id}`,
      password: 'password123',
      phone: '13800138000',
      address: `Address ${id}`,
      ...overrides
    };
  }
  
  /**
   * 生成随机订单数据
   */
  static generateOrderData(userId: string, overrides?: Partial<any>): any {
    return {
      id: Math.random().toString(36).substring(7),
      userId,
      items: [
        {
          productId: 'prod1',
          quantity: 2,
          price: 100.00
        }
      ],
      totalAmount: 200.00,
      status: 'pending',
      ...overrides
    };
  }
  
  /**
   * 生成随机产品数据
   */
  static generateProductData(overrides?: Partial<any>): any {
    const id = Math.random().toString(36).substring(7);
    return {
      id,
      name: `Product ${id}`,
      description: `Description for product ${id}`,
      price: Math.floor(Math.random() * 1000) + 100,
      stock: Math.floor(Math.random() * 100) + 1,
      category: '电子产品',
      ...overrides
    };
  }
}

// 使用示例
const userData = TestDataGenerator.generateUserData();
console.log('生成的用户数据:', userData);
```

### 6.2 测试数据清理

```typescript
/**
 * 测试数据清理器
 */
class TestDataCleaner {
  constructor(private db: any) {}
  
  /**
   * 清空所有测试数据
   */
  async cleanAll(): Promise<void> {
    const tables = [
      'orders',
      'order_items',
      'products',
      'users'
    ];
    
    for (const table of tables) {
      await this.db.query(`TRUNCATE TABLE ${table} CASCADE`);
    }
  }
  
  /**
   * 根据条件清理数据
   */
  async cleanByCondition(table: string, condition: string, params: any[]): Promise<void> {
    await this.db.query(`DELETE FROM ${table} WHERE ${condition}`, params);
  }
  
  /**
   * 清理指定用户的数据
   */
  async cleanUserData(userId: string): Promise<void> {
    // 删除用户的订单
    await this.cleanByCondition('orders', 'user_id = $1', [userId]);
    
    // 删除用户
    await this.cleanByCondition('users', 'id = $1', [userId]);
  }
}

// 使用示例
const cleaner = new TestDataCleaner(db);
await cleaner.cleanAll();
```

---

## 7. 测试报告与覆盖率

### 7.1 测试报告生成

```typescript
/**
 * 测试报告生成器
 */
class TestReportGenerator {
  /**
   * 生成HTML测试报告
   */
  static generateHTMLReport(results: any[]): string {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>测试报告</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .summary { background: #f0f0f0; padding: 20px; margin-bottom: 20px; }
          .passed { color: green; }
          .failed { color: red; }
          .test-case { border: 1px solid #ddd; padding: 10px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <h1>测试报告</h1>
        <div class="summary">
          <p>总用例数: ${results.length}</p>
          <p class="passed">通过: ${results.filter(r => r.status === 'passed').length}</p>
          <p class="failed">失败: ${results.filter(r => r.status === 'failed').length}</p>
        </div>
    `;
    
    results.forEach(result => {
      html += `
        <div class="test-case">
          <h3>${result.title}</h3>
          <p>状态: <span class="${result.status}">${result.status}</span></p>
          <p>耗时: ${result.duration}ms</p>
          ${result.error ? `<p>错误: ${result.error}</p>` : ''}
        </div>
      `;
    });
    
    html += '</body></html>';
    return html;
  }
  
  /**
   * 生成JSON测试报告
   */
  static generateJSONReport(results: any[]): string {
    const report = {
      summary: {
        total: results.length,
        passed: results.filter(r => r.status === 'passed').length,
        failed: results.filter(r => r.status === 'failed').length,
        duration: results.reduce((sum, r) => sum + r.duration, 0)
      },
      results
    };
    
    return JSON.stringify(report, null, 2);
  }
}
```

### 7.2 覆盖率分析

```typescript
/**
 * 覆盖率分析器
 */
class CoverageAnalyzer {
  /**
   * 分析覆盖率
   */
  static analyze(coverageData: any): {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  } {
    return {
      lines: coverageData.lines.pct,
      functions: coverageData.functions.pct,
      branches: coverageData.branches.pct,
      statements: coverageData.statements.pct
    };
  }
  
  /**
   * 生成覆盖率报告
   */
  static generateReport(coverageData: any): string {
    const coverage = this.analyze(coverageData);
    
    let report = '代码覆盖率报告\n';
    report += '================\n\n';
    report += `行覆盖率: ${coverage.lines}%\n`;
    report += `函数覆盖率: ${coverage.functions}%\n`;
    report += `分支覆盖率: ${coverage.branches}%\n`;
    report += `语句覆盖率: ${coverage.statements}%\n\n`;
    
    // 列出未覆盖的文件
    report += '未覆盖的文件:\n';
    Object.keys(coverageData).forEach(filename => {
      const fileCoverage = coverageData[filename];
      if (fileCoverage.lines.pct < 100) {
        report += `- ${filename}: ${fileCoverage.lines.pct}%\n`;
      }
    });
    
    return report;
  }
}
```

---

## 8. 持续集成配置

### 8.1 GitHub Actions配置

```yaml
# .github/workflows/test.yml
name: 测试

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: 使用Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: 安装依赖
      run: npm ci
    
    - name: 运行单元测试
      run: npm run test:unit
    
    - name: 运行集成测试
      run: npm run test:integration
      env:
        DATABASE_URL: ${{ secrets.DATABASE_URL }}
    
    - name: 运行E2E测试
      run: npm run test:e2e
      env:
        BASE_URL: http://localhost:3000
    
    - name: 生成覆盖率报告
      run: npm run test:coverage
    
    - name: 上传覆盖率报告
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella
```

### 8.2 测试脚本配置

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "cypress run",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

---

## 9. 最佳实践与规范

### 9.1 测试命名规范

```typescript
/**
 * 测试命名规范
 */
describe('功能模块', () => {
  describe('具体功能', () => {
    it('应该[预期行为]当[条件]', () => {
      // 测试代码
    });
    
    it('应该[预期行为]当[条件1]和[条件2]', () => {
      // 测试代码
    });
    
    it('不应该[非预期行为]当[条件]', () => {
      // 测试代码
    });
  });
});

// 示例
describe('用户服务', () => {
  describe('创建用户', () => {
    it('应该成功创建用户当提供有效的用户数据', () => {
      // 测试代码
    });
    
    it('应该抛出错误当邮箱已存在', () => {
      // 测试代码
    });
    
    it('不应该创建用户当邮箱格式不正确', () => {
      // 测试代码
    });
  });
});
```

### 9.2 测试组织结构

```
tests/
├── unit/              # 单元测试
│   ├── services/
│   │   ├── userService.test.ts
│   │   └── orderService.test.ts
│   ├── utils/
│   │   └── validator.test.ts
│   └── components/
│       └── Button.test.ts
├── integration/       # 集成测试
│   ├── api/
│   │   └── userApi.test.ts
│   └── database/
│       └── userDb.test.ts
├── e2e/              # E2E测试
│   ├── login.cy.ts
│   └── checkout.cy.ts
└── fixtures/         # 测试数据
    ├── users.json
    └── products.json
```

---

## 10. 总结与建议

### 10.1 核心要点

1. **选择合适的测试框架**：根据项目需求选择合适的测试框架
2. **编写可维护的测试**：使用清晰的命名和良好的组织结构
3. **保持测试独立性**：每个测试用例应该独立运行
4. **使用Mock和Stub**：隔离外部依赖，提高测试稳定性
5. **持续集成**：将测试集成到CI/CD流程中

### 10.2 最佳实践

1. **测试金字塔**：70%单元测试 + 20%集成测试 + 10%E2E测试
2. **快速反馈**：优先执行快速测试，延迟执行慢速测试
3. **测试覆盖率**：保持合理的测试覆盖率，不要过度追求100%
4. **定期维护**：及时更新和清理过时的测试
5. **文档化**：为复杂的测试添加注释和文档

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」




## 概述

### 概述

本文档提供了实用的技巧和方法，帮助开发者提高工作效率和代码质量。

#### 适用场景

- 日常开发工作
- 代码优化和重构
- 问题排查和调试
- 性能优化和调优

#### 预期收益

- 提高开发效率
- 减少代码错误
- 优化系统性能
- 提升代码可维护性



## 核心概念

### 核心概念

#### 关键术语

- **技巧**：经过实践验证的有效方法
- **最佳实践**：业界公认的优秀做法
- **模式**：可重复使用的解决方案
- **原则**：指导设计的基本准则

#### 核心原理

1. **DRY原则**（Don't Repeat Yourself）
   - 避免代码重复
   - 提取公共逻辑
   - 使用函数和类封装

2. **KISS原则**（Keep It Simple, Stupid）
   - 保持简单
   - 避免过度设计
   - 优先可读性

3. **YAGNI原则**（You Aren't Gonna Need It）
   - 只实现当前需要的功能
   - 避免过度工程
   - 保持代码精简



## 实施步骤

### 实施步骤

#### 步骤1：准备工作

```bash
# 安装必要工具
npm install -g typescript eslint prettier

# 初始化项目
npm init -y
npm install --save-dev typescript @types/node
```

#### 步骤2：配置环境

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

#### 步骤3：编写代码

```typescript
// 创建主文件
// src/index.ts
function main() {
  console.log('Hello, YYC³!');
}

main();
```

#### 步骤4：测试验证

```bash
# 运行代码
npm run dev

# 运行测试
npm test
```



## 代码示例

### 代码示例

#### 示例1：基础用法

```typescript
// 简单示例
function greet(name: string): string {
  return `Hello, ${name}!`;
}

const message = greet('YYC³');
console.log(message); // 输出: Hello, YYC³!
```

#### 示例2：高级用法

```typescript
// 异步操作
async function fetchData(url: string): Promise<any> {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// 使用示例
fetchData('https://api.example.com/data')
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

#### 示例3：错误处理

```typescript
// 自定义错误类
class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// 使用示例
function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('email', '邮箱格式不正确');
  }
}

try {
  validateEmail('invalid-email');
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`验证失败: ${error.field} - ${error.message}`);
  }
}
```



## 注意事项

### 注意事项

#### 常见陷阱

1. **异步操作错误**
```typescript
// ❌ 错误：没有等待异步操作
async function processData() {
  const data = fetchData(); // 忘记await
  console.log(data); // 输出Promise对象
}

// ✅ 正确：使用await
async function processData() {
  const data = await fetchData();
  console.log(data); // 输出实际数据
}
```

2. **内存泄漏**
```typescript
// ❌ 错误：没有清理事件监听器
useEffect(() => {
  window.addEventListener('resize', handleResize);
}, []); // 缺少清理函数

// ✅ 正确：清理事件监听器
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

#### 性能注意事项

1. **避免不必要的重渲染**
```typescript
// ❌ 错误：每次都创建新对象
<Component data={{ value: 1 }} />

// ✅ 正确：使用useMemo缓存
const memoizedData = useMemo(() => ({ value: 1 }), []);
<Component data={memoizedData} />
```

2. **避免大对象传递**
```typescript
// ❌ 错误：传递整个大对象
<Component user={user} />

// ✅ 正确：只传递需要的属性
<Component userName={user.name} userId={user.id} />
```



## 最佳实践

### 最佳实践

#### 代码规范

1. **命名规范**
```typescript
// 变量：camelCase
const userName = 'John';

// 常量：UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;

// 类：PascalCase
class UserService { }

// 接口：PascalCase，前缀I（可选）
interface IUserService { }
```

2. **注释规范**
```typescript
/**
 * 创建用户
 * @param email - 用户邮箱
 * @param password - 用户密码
 * @returns 创建的用户对象
 * @throws {Error} 当邮箱已存在时抛出错误
 */
async function createUser(
  email: string, 
  password: string
): Promise<User> {
  // 实现
}
```

#### 错误处理

```typescript
// 统一错误处理
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 使用错误处理中间件
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }
  
  // 记录未预期的错误
  logger.error('Unexpected error:', err);
  
  return res.status(500).json({
    success: false,
    error: '服务器内部错误'
  });
});
```

#### 日志记录

```typescript
// 结构化日志
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// 使用日志
logger.info('User created', { userId: user.id, email: user.email });
logger.error('Database connection failed', { error: error.message });
```



## 常见问题

### 常见问题

#### Q1: 如何处理异步错误？

**A**: 使用try-catch捕获异步错误：

```typescript
async function handleRequest() {
  try {
    const result = await fetchData();
    return result;
  } catch (error) {
    console.error('请求失败:', error);
    throw error;
  }
}
```

#### Q2: 如何优化React组件性能？

**A**: 使用以下优化技术：

1. **React.memo**：避免不必要的重渲染
2. **useMemo**：缓存计算结果
3. **useCallback**：缓存函数引用
4. **代码分割**：懒加载组件

```typescript
const MemoizedComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => processData(data), [data]);
  return <div>{processedData}</div>;
});
```

#### Q3: 如何管理应用状态？

**A**: 根据应用复杂度选择合适的状态管理方案：

1. **简单应用**：使用React Context API
2. **中等应用**：使用Zustand或Redux Toolkit
3. **复杂应用**：使用Redux + 中间件

```typescript
// Zustand示例
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 }))
}));
```



## 案例分析

### 案例分析

#### 案例1：性能优化

**问题**：页面加载时间过长，用户体验差。

**分析**：
- 首次内容绘制(FCP)：3.2秒
- 最大内容绘制(LCP)：5.8秒
- 累积布局偏移(CLS)：0.25

**解决方案**：
1. 实现代码分割和懒加载
2. 优化图片加载（使用WebP格式，添加loading="lazy"）
3. 启用Gzip压缩
4. 使用CDN加速静态资源

**结果**：
- FCP：1.2秒（↓62.5%）
- LCP：2.1秒（↓63.8%）
- CLS：0.08（↓68%）

#### 案例2：错误处理改进

**问题**：错误信息不清晰，难以定位问题。

**分析**：
- 错误信息过于简单
- 缺少错误上下文
- 没有错误追踪

**解决方案**：
1. 实现自定义错误类
2. 添加错误堆栈追踪
3. 集成错误监控工具（Sentry）
4. 实现错误日志记录

**结果**：
- 错误定位时间减少70%
- 错误解决率提高40%
- 用户投诉减少60%

#### 案例3：代码重构

**问题**：代码重复率高，维护困难。

**分析**：
- 代码重复率：35%
- 函数平均长度：120行
- 圈复杂度：15

**解决方案**：
1. 提取公共逻辑到工具函数
2. 使用设计模式重构
3. 拆分大函数
4. 添加单元测试

**结果**：
- 代码重复率：8%（↓77%）
- 函数平均长度：35行（↓71%）
- 圈复杂度：5（↓67%）


## 相关文档

- [AI测试数据准备与标注技巧](YYC3-Cater-测试验证/技巧类/05-YYC3-Cater--技巧类-AI测试数据准备与标注技巧.md) - YYC3-Cater-测试验证/技巧类
- [性能测试调优技巧](YYC3-Cater-测试验证/技巧类/03-YYC3-Cater--技巧类-性能测试调优技巧.md) - YYC3-Cater-测试验证/技巧类
- [测试用例设计技巧手册](YYC3-Cater-测试验证/技巧类/01-YYC3-Cater--技巧类-测试用例设计技巧手册.md) - YYC3-Cater-测试验证/技巧类
- [测试缺陷管理规范与技巧](YYC3-Cater-测试验证/技巧类/04-YYC3-Cater--技巧类-测试缺陷管理规范与技巧.md) - YYC3-Cater-测试验证/技巧类
- [测试架构设计文档](YYC3-Cater-测试验证/架构类/01-YYC3-Cater--架构类-测试架构设计文档.md) - YYC3-Cater-测试验证/架构类
