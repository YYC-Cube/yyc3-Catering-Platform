<template>
  <div class="collaboration-enhancement">
    <el-tabs v-model="activeTab" class="enhancement-tabs">
      <!-- 实时协作 -->
      <el-tab-pane label="实时协作" name="realtime">
        <div class="enhancement-section">
          <el-card class="feature-card">
            <template #header>
              <div class="feature-header">
                <div class="feature-info">
                  <h4>实时多语言翻译</h4>
                  <p>智能识别并实时翻译不同语言的消息内容</p>
                </div>
                <el-switch v-model="realtimeFeatures.translation" @change="toggleFeature('translation')" />
              </div>
            </template>

            <div class="feature-config">
              <el-form :model="translationConfig" label-width="120px">
                <el-form-item label="支持语言">
                  <el-select
                    v-model="translationConfig.supportedLanguages"
                    multiple
                    placeholder="选择支持的语言"
                    style="width: 100%"
                  >
                    <el-option label="中文" value="zh-CN" />
                    <el-option label="英语" value="en" />
                    <el-option label="日语" value="ja" />
                    <el-option label="韩语" value="ko" />
                    <el-option label="法语" value="fr" />
                    <el-option label="德语" value="de" />
                    <el-option label="西班牙语" value="es" />
                  </el-select>
                </el-form-item>

                <el-form-item label="自动检测">
                  <el-switch v-model="translationConfig.autoDetect" />
                </el-form-item>

                <el-form-item label="显示原文">
                  <el-switch v-model="translationConfig.showOriginal" />
                </el-form-item>
              </el-form>
            </div>

            <div class="feature-preview">
              <h5>翻译效果预览</h5>
              <div class="preview-container">
                <div class="message-preview">
                  <div class="original-message">Hello, how can I help you today?</div>
                  <div class="translated-message" v-if="translationConfig.showOriginal">
                    <el-tag size="small" type="info">翻译</el-tag>
                    您好，今天我该如何帮助您？
                  </div>
                </div>
              </div>
            </div>
          </el-card>

          <el-card class="feature-card">
            <template #header>
              <div class="feature-header">
                <div class="feature-info">
                  <h4>上下文共享</h4>
                  <p>智能共享相关上下文信息，提高协作效率</p>
                </div>
                <el-switch v-model="realtimeFeatures.contextSharing" @change="toggleFeature('contextSharing')" />
              </div>
            </template>

            <div class="feature-config">
              <el-form :model="contextConfig" label-width="120px">
                <el-form-item label="共享范围">
                  <el-radio-group v-model="contextConfig.sharingScope">
                    <el-radio label="session">当前会话</el-radio>
                    <el-radio label="user">用户级别</el-radio>
                    <el-radio label="team">团队级别</el-radio>
                    <el-radio label="global">全局级别</el-radio>
                  </el-radio-group>
                </el-form-item>

                <el-form-item label="敏感信息">
                  <el-checkbox-group v-model="contextConfig.sensitiveData">
                    <el-checkbox label="personal">个人信息</el-checkbox>
                    <el-checkbox label="financial">财务数据</el-checkbox>
                    <el-checkbox label="medical">医疗信息</el-checkbox>
                    <el-checkbox label="business">商业机密</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-form>
            </div>
          </el-card>
        </div>
      </el-tab-pane>

      <!-- 联合决策 -->
      <el-tab-pane label="联合决策" name="decision">
        <div class="enhancement-section">
          <el-card class="feature-card">
            <template #header>
              <div class="feature-header">
                <div class="feature-info">
                  <h4>多智能体投票</h4>
                  <p>多个AI智能体共同参与决策，提高决策质量</p>
                </div>
                <el-switch v-model="decisionFeatures.multiAgentVoting" @change="toggleFeature('multiAgentVoting')" />
              </div>
            </template>

            <div class="feature-config">
              <el-form :model="votingConfig" label-width="120px">
                <el-form-item label="投票算法">
                  <el-select v-model="votingConfig.algorithm" style="width: 100%">
                    <el-option label="简单多数" value="simple_majority" />
                    <el-option label="加权多数" value="weighted_majority" />
                    <el-option label="共识制" value="consensus" />
                    <el-option label="专家优先" value="expert_priority" />
                  </el-select>
                </el-form-item>

                <el-form-item label="参与智能体">
                  <el-select
                    v-model="votingConfig.participants"
                    multiple
                    placeholder="选择参与的智能体"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="agent in availableAgents"
                      :key="agent.id"
                      :label="agent.name"
                      :value="agent.id"
                    />
                  </el-select>
                </el-form-item>

                <el-form-item label="权重设置">
                  <div class="weight-settings">
                    <div
                      v-for="participant in votingConfig.participants"
                      :key="participant"
                      class="weight-item"
                    >
                      <span class="participant-name">{{ getAgentName(participant) }}</span>
                      <el-slider
                        v-model="votingConfig.weights[participant]"
                        :min="0"
                        :max="100"
                        :step="5"
                        show-input
                        style="width: 200px"
                      />
                    </div>
                  </div>
                </el-form-item>
              </el-form>
            </div>

            <div class="feature-demo">
              <h5>决策流程演示</h5>
              <div class="decision-workflow">
                <el-steps :active="decisionStep" finish-status="success">
                  <el-step title="问题提出" description="用户提出决策问题" />
                  <el-step title="智能体分析" description="各智能体独立分析" />
                  <el-step title="投票表决" description="基于权重进行投票" />
                  <el-step title="结果汇总" description="汇总并生成最终决策" />
                </el-steps>
              </div>
            </div>
          </el-card>
        </div>
      </el-tab-pane>

      <!-- 工作流自动化 -->
      <el-tab-pane label="工作流自动化" name="workflow">
        <div class="enhancement-section">
          <el-card class="feature-card">
            <template #header>
              <div class="feature-header">
                <div class="feature-info">
                  <h4>智能工作流</h4>
                  <p>自动化处理常见任务和流程</p>
                </div>
                <el-switch v-model="workflowFeatures.intelligentWorkflow" @change="toggleFeature('intelligentWorkflow')" />
              </div>
            </template>

            <div class="feature-config">
              <el-form :model="workflowConfig" label-width="120px">
                <el-form-item label="触发条件">
                  <el-checkbox-group v-model="workflowConfig.triggers">
                    <el-checkbox label="keyword">关键词触发</el-checkbox>
                    <el-checkbox label="time">时间触发</el-checkbox>
                    <el-checkbox label="event">事件触发</el-checkbox>
                    <el-checkbox label="context">上下文触发</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>

                <el-form-item label="执行动作">
                  <el-checkbox-group v-model="workflowConfig.actions">
                    <el-checkbox label="research">信息查询</el-checkbox>
                    <el-checkbox label="analysis">数据分析</el-checkbox>
                    <el-checkbox label="report">生成报告</el-checkbox>
                    <el-checkbox label="notification">发送通知</el-checkbox>
                    <el-checkbox label="integration">系统集成</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-form>
            </div>

            <div class="workflow-builder">
              <h5>工作流构建器</h5>
              <div class="workflow-canvas">
                <div class="workflow-nodes">
                  <div
                    v-for="(node, index) in workflowNodes"
                    :key="node.id"
                    class="workflow-node"
                    :class="{ 'active-node': node.active }"
                    @click="selectWorkflowNode(node)"
                  >
                    <div class="node-icon">
                      <el-icon v-if="node.type === 'trigger'"><Play /></el-icon>
                      <el-icon v-else-if="node.type === 'process'"><Setting /></el-icon>
                      <el-icon v-else-if="node.type === 'decision'"><Share /></el-icon>
                      <el-icon v-else-if="node.type === 'action'"><Check /></el-icon>
                      <el-icon v-else><More /></el-icon>
                    </div>
                    <div class="node-content">
                      <div class="node-title">{{ node.title }}</div>
                      <div class="node-desc">{{ node.description }}</div>
                    </div>
                  </div>
                </div>

                <div class="workflow-actions">
                  <el-button size="small" @click="addWorkflowNode">
                    <el-icon><Plus /></el-icon>
                    添加节点
                  </el-button>
                  <el-button size="small" @click="testWorkflow">
                    <el-icon><VideoPlay /></el-icon>
                    测试流程
                  </el-button>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </el-tab-pane>

      <!-- 集成管理 -->
      <el-tab-pane label="集成管理" name="integration">
        <div class="enhancement-section">
          <el-card class="feature-card">
            <template #header>
              <div class="feature-header">
                <div class="feature-info">
                  <h4>系统集成</h4>
                  <p>连接外部系统和API扩展功能</p>
                </div>
                <el-switch v-model="integrationFeatures.systemIntegration" @change="toggleFeature('systemIntegration')" />
              </div>
            </template>

            <div class="integration-list">
              <div
                v-for="integration in availableIntegrations"
                :key="integration.id"
                class="integration-item"
                :class="{ 'connected-integration': integration.connected }"
              >
                <div class="integration-info">
                  <div class="integration-header">
                    <h5>{{ integration.name }}</h5>
                    <el-tag :type="integration.connected ? 'success' : 'info'" size="small">
                      {{ integration.connected ? '已连接' : '未连接' }}
                    </el-tag>
                  </div>
                  <p class="integration-description">{{ integration.description }}</p>
                  <div class="integration-capabilities">
                    <el-tag
                      v-for="capability in integration.capabilities"
                      :key="capability"
                      size="small"
                      type="info"
                      effect="plain"
                    >
                      {{ capability }}
                    </el-tag>
                  </div>
                </div>
                <div class="integration-actions">
                  <el-button
                    v-if="!integration.connected"
                    type="primary"
                    size="small"
                    @click="connectIntegration(integration)"
                  >
                    连接
                  </el-button>
                  <el-button
                    v-else
                    type="danger"
                    size="small"
                    @click="disconnectIntegration(integration)"
                  >
                    断开
                  </el-button>
                  <el-button size="small" @click="configureIntegration(integration)">
                    配置
                  </el-button>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 性能监控 -->
    <el-card class="performance-card">
      <template #header>
        <h3>协作性能监控</h3>
      </template>

      <el-row :gutter="20">
        <el-col :span="8">
          <div class="metric-item">
            <div class="metric-header">
              <span class="metric-title">协作效率提升</span>
              <el-icon class="metric-icon"><TrendCharts /></el-icon>
            </div>
            <div class="metric-value">{{ performanceMetrics.efficiency }}%</div>
            <el-progress :percentage="performanceMetrics.efficiency" :show-text="false" />
          </div>
        </el-col>
        <el-col :span="8">
          <div class="metric-item">
            <div class="metric-header">
              <span class="metric-title">决策准确性</span>
              <el-icon class="metric-icon"><SuccessFilled /></el-icon>
            </div>
            <div class="metric-value">{{ performanceMetrics.accuracy }}%</div>
            <el-progress :percentage="performanceMetrics.accuracy" :show-text="false" />
          </div>
        </el-col>
        <el-col :span="8">
          <div class="metric-item">
            <div class="metric-header">
              <span class="metric-title">响应时间</span>
              <el-icon class="metric-icon"><Timer /></el-icon>
            </div>
            <div class="metric-value">{{ performanceMetrics.responseTime }}ms</div>
            <div class="metric-trend" :class="getResponseTrend()">
              <el-icon><CaretTop v-if="getResponseTrend() === 'positive'" /><CaretBottom v-else /></el-icon>
              {{ getResponseStatus() }}
            </div>
          </div>
        </el-col>
      </el-row>

      <div class="performance-chart" ref="performanceChart" style="height: 300px; margin-top: 20px;"></div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Setting, Share, Check, More, Plus, Timer, CaretTop, CaretBottom
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { aiAssistantAPI } from '@/api/ai-assistant'

// Emits
const emit = defineEmits<{
  close: []
}>()

// 响应式数据
const activeTab = ref('realtime')
const decisionStep = ref(2)
const performanceChart = ref<HTMLElement>()

// 功能开关
const realtimeFeatures = reactive({
  translation: false,
  contextSharing: false
})

const decisionFeatures = reactive({
  multiAgentVoting: false
})

const workflowFeatures = reactive({
  intelligentWorkflow: false
})

const integrationFeatures = reactive({
  systemIntegration: false
})

// 配置数据
const translationConfig = reactive({
  supportedLanguages: ['zh-CN', 'en', 'ja'],
  autoDetect: true,
  showOriginal: true
})

const contextConfig = reactive({
  sharingScope: 'session',
  sensitiveData: ['personal', 'financial']
})

const votingConfig = reactive({
  algorithm: 'weighted_majority',
  participants: [],
  weights: {} as Record<string, number>
})

const workflowConfig = reactive({
  triggers: ['keyword', 'context'],
  actions: ['research', 'analysis']
})

// 性能指标
const performanceMetrics = ref({
  efficiency: 75,
  accuracy: 88,
  responseTime: 850
})

// 模拟数据
const availableAgents = ref([
  { id: 'agent-1', name: '分析助手AI', type: 'analytical' },
  { id: 'agent-2', name: '决策助手AI', type: 'decision' },
  { id: 'agent-3', name: '创意助手AI', type: 'creative' },
  { id: 'agent-4', name: '协作助手AI', type: 'collaborative' }
])

const workflowNodes = ref([
  { id: 'node-1', type: 'trigger', title: '问题识别', description: '识别用户问题类型', active: true },
  { id: 'node-2', type: 'process', title: '数据处理', description: '处理和分析数据', active: false },
  { id: 'node-3', type: 'decision', title: '智能决策', description: 'AI辅助决策', active: false },
  { id: 'node-4', type: 'action', title: '执行操作', description: '执行相应操作', active: false }
])

const availableIntegrations = ref([
  {
    id: 'slack',
    name: 'Slack',
    description: '团队协作平台集成',
    capabilities: ['消息发送', '频道管理', '用户管理'],
    connected: true
  },
  {
    id: 'github',
    name: 'GitHub',
    description: '代码托管平台集成',
    capabilities: ['代码同步', 'Issue管理', 'PR审核'],
    connected: false
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    description: '日历和日程管理',
    capabilities: ['日程同步', '事件提醒', '会议安排'],
    connected: true
  },
  {
    id: 'drive',
    name: 'Google Drive',
    description: '文件存储和共享',
    capabilities: ['文件上传', '文档协作', '版本管理'],
    connected: false
  }
])

// 图表实例
let performanceChartInstance: echarts.ECharts | null = null

// 生命周期
onMounted(() => {
  nextTick(() => {
    initPerformanceChart()
  })
})

// 方法
const initPerformanceChart = () => {
  if (!performanceChart.value) return

  performanceChartInstance = echarts.init(performanceChart.value)

  const option = {
    title: {
      text: '协作性能趋势',
      textStyle: { fontSize: 14, color: '#303133' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['协作效率', '决策准确性', '响应时间'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'time',
      data: generateTimeSeries()
    },
    yAxis: [
      {
        type: 'value',
        name: '百分比',
        position: 'left',
        max: 100,
        axisLabel: { formatter: '{value}%' }
      },
      {
        type: 'value',
        name: '响应时间',
        position: 'right',
        axisLabel: { formatter: '{value}ms' }
      }
    ],
    series: [
      {
        name: '协作效率',
        type: 'line',
        data: generatePerformanceData('efficiency'),
        smooth: true,
        itemStyle: { color: '#409eff' }
      },
      {
        name: '决策准确性',
        type: 'line',
        data: generatePerformanceData('accuracy'),
        smooth: true,
        itemStyle: { color: '#67c23a' }
      },
      {
        name: '响应时间',
        type: 'line',
        yAxisIndex: 1,
        data: generatePerformanceData('responseTime'),
        smooth: true,
        itemStyle: { color: '#e6a23c' }
      }
    ]
  }

  performanceChartInstance.setOption(option)
}

const generateTimeSeries = () => {
  const now = new Date()
  const times = []
  for (let i = 24; i >= 0; i--) {
    times.push(new Date(now.getTime() - i * 3600000))
  }
  return times
}

const generatePerformanceData = (type: string) => {
  const baseValue = type === 'efficiency' ? 75 : type === 'accuracy' ? 88 : 850
  const data = []
  const now = new Date()

  for (let i = 24; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600000)
    let value

    if (type === 'responseTime') {
      value = baseValue + Math.random() * 200 - 100
    } else {
      value = baseValue + Math.random() * 15 - 7.5
    }

    data.push([time, Math.round(value)])
  }

  return data
}

const toggleFeature = (feature: string) => {
  ElMessage.success(`${feature} 功能已${realtimeFeatures[feature] || decisionFeatures[feature] || workflowFeatures[feature] || integrationFeatures[feature] ? '启用' : '禁用'}`)
}

const getAgentName = (agentId: string) => {
  const agent = availableAgents.value.find(a => a.id === agentId)
  return agent ? agent.name : agentId
}

const selectWorkflowNode = (node: any) => {
  workflowNodes.value.forEach(n => n.active = false)
  node.active = true
}

const addWorkflowNode = () => {
  const newNode = {
    id: `node-${workflowNodes.value.length + 1}`,
    type: 'process',
    title: '新节点',
    description: '节点描述',
    active: false
  }
  workflowNodes.value.push(newNode)
}

const testWorkflow = () => {
  ElMessage.info('工作流测试功能开发中')
}

const connectIntegration = (integration: any) => {
  integration.connected = true
  ElMessage.success(`已连接到 ${integration.name}`)
}

const disconnectIntegration = (integration: any) => {
  integration.connected = false
  ElMessage.success(`已断开 ${integration.name} 连接`)
}

const configureIntegration = (integration: any) => {
  ElMessage.info(`配置 ${integration.name} 功能开发中`)
}

const getResponseTrend = () => {
  return performanceMetrics.value.responseTime > 1000 ? 'negative' : 'positive'
}

const getResponseStatus = () => {
  return performanceMetrics.value.responseTime > 1000 ? '较慢' : '正常'
}
</script>

<style lang="scss" scoped>
.collaboration-enhancement {
  .enhancement-tabs {
    margin-bottom: 24px;

    :deep(.el-tabs__header) {
      margin-bottom: 0;
    }
  }

  .enhancement-section {
    .feature-card {
      margin-bottom: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

      .feature-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .feature-info {
          h4 {
            margin: 0 0 4px 0;
            font-size: 16px;
            font-weight: 600;
            color: #303133;
          }

          p {
            margin: 0;
            font-size: 13px;
            color: #909399;
          }
        }
      }

      .feature-config {
        padding: 20px 0;
        border-top: 1px solid #f0f0f0;
        margin-top: 16px;

        .weight-settings {
          .weight-item {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 12px;

            .participant-name {
              min-width: 120px;
              font-size: 14px;
              color: #303133;
            }
          }
        }
      }

      .feature-preview {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #f0f0f0;

        h5 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #303133;
        }

        .preview-container {
          .message-preview {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 12px;

            .original-message {
              font-size: 14px;
              color: #606266;
              margin-bottom: 8px;
            }

            .translated-message {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 14px;
              color: #303133;
            }
          }
        }
      }

      .feature-demo {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #f0f0f0;

        h5 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #303133;
        }

        .decision-workflow {
          :deep(.el-steps) {
            .el-step__title {
              font-size: 12px;
            }
          }
        }
      }

      .workflow-builder {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #f0f0f0;

        h5 {
          margin: 0 0 16px 0;
          font-size: 14px;
          font-weight: 600;
          color: #303133;
        }

        .workflow-canvas {
          border: 2px dashed #e4e7ed;
          border-radius: 8px;
          padding: 20px;
          min-height: 200px;

          .workflow-nodes {
            display: flex;
            flex-direction: column;
            gap: 16px;
            margin-bottom: 20px;

            .workflow-node {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 16px;
              background: white;
              border: 1px solid #e4e7ed;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.3s ease;

              &:hover,
              &.active-node {
                border-color: #409eff;
                box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
              }

              .node-icon {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
              }

              .node-content {
                .node-title {
                  font-size: 14px;
                  font-weight: 600;
                  color: #303133;
                  margin-bottom: 4px;
                }

                .node-desc {
                  font-size: 12px;
                  color: #909399;
                }
              }
            }
          }

          .workflow-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
          }
        }
      }
    }

    .integration-list {
      .integration-item {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 20px;
        background: white;
        border: 1px solid #e4e7ed;
        border-radius: 8px;
        margin-bottom: 16px;
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        &.connected-integration {
          border-left: 4px solid #67c23a;
        }

        .integration-info {
          flex: 1;

          .integration-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            h5 {
              margin: 0;
              font-size: 16px;
              font-weight: 600;
              color: #303133;
            }
          }

          .integration-description {
            margin: 0 0 12px 0;
            font-size: 14px;
            color: #606266;
            line-height: 1.5;
          }

          .integration-capabilities {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }
        }

        .integration-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
      }
    }
  }

  .performance-card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }

    .metric-item {
      text-align: center;
      padding: 20px;
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
      border-radius: 8px;

      .metric-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .metric-title {
          font-size: 14px;
          color: #606266;
        }

        .metric-icon {
          color: #909399;
        }
      }

      .metric-value {
        font-size: 28px;
        font-weight: 700;
        color: #303133;
        margin-bottom: 12px;
      }

      .metric-trend {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;

        &.positive {
          color: #67c23a;
        }

        &.negative {
          color: #f56c6c;
        }
      }
    }
  }
}
</style>