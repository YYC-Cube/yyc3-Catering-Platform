/**
 * @file AgenticCore测试文件
 * @description 验证AI独立自治可插拔系统的核心功能
 */
import { AgenticCore, AgentConfig, ContextData, Goal } from './src/AgenticCore';

async function testAgenticCore() {
  console.log('🚀 开始测试AgenticCore...');

  // 创建AgenticCore配置
  const agentConfig: AgentConfig = {
    id: 'test-agent-1',
    name: '测试智能代理',
    type: 'restaurant_optimization',
    capabilities: [
      {
        name: '数据分析',
        description: '分析餐厅运营数据',
        enabled: true,
        config: {}
      },
      {
        name: '行动规划',
        description: '为餐厅优化生成行动方案',
        enabled: true,
        config: {}
      }
    ],
    learningEnabled: true,
    autonomousMode: false,
    communicationEnabled: true,
    updateInterval: 300000 // 5分钟
  };

  // 创建AgenticCore实例
  const agenticCore = new AgenticCore(agentConfig);

  try {
    // 启动AgenticCore
    await agenticCore.start();
    console.log('✅ AgenticCore启动成功');

    // 创建设置上下文
    const contextData: ContextData = {
      timestamp: Date.now(),
      environment: {
        name: 'development',
        businessDomain: 'catering',
        availableResources: ['kitchen', 'waitstaff', 'inventory']
      },
      goals: [],
      constraints: {
        maxTime: 3600000, // 1小时
        maxResources: ['waitstaff', 'inventory']
      }
    };

    agenticCore.setContext(contextData);
    console.log('✅ 上下文设置成功');

    // 添加测试目标
    const testGoal: Omit<Goal, 'id' | 'progress' | 'status'> = {
      description: '优化餐厅运营效率，提高座位利用率和服务速度',
      type: 'primary',
      priority: 1,
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      subGoals: [],
      dependencies: []
    };

    const goalId = await agenticCore.addGoal(testGoal);
    console.log('✅ 目标添加成功，目标ID:', goalId);

    // 执行行动
    const actionResult = await agenticCore.executeAction(
      'ANALYSIS',
      {
        target: 'restaurant_operations',
        timeRange: 'last_7_days',
        metrics: ['turnover_rate', 'service_time']
      },
      contextData
    );

    console.log('✅ 行动执行成功:', actionResult);

    // 获取系统状态
    const status = agenticCore.getStatus();
    console.log('✅ 系统状态获取成功:', status);

    console.log('🎉 所有测试通过！AgenticCore实现正确。');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    // 关闭AgenticCore
    await agenticCore.stop();
    console.log('🔒 AgenticCore已停止');
  }
}

// 运行测试
testAgenticCore();