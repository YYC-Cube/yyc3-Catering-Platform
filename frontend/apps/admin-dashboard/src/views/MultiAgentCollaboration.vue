<template>
  <div class="multi-agent-collaboration">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>多智能体协作中心</h1>
        <p>人机协同的分布式智能体协作与管理</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showTaskDialog = true">
          <el-icon><Plus /></el-icon>
          创建协作任务
        </el-button>
        <el-button @click="showSessionDialog = true">
          <el-icon><Connection /></el-icon>
          启动协作会话
        </el-button>
      </div>
    </div>

    <!-- 协作概览 -->
    <div class="collaboration-overview">
      <el-card class="overview-card">
        <div class="overview-grid">
          <div class="overview-item">
            <div class="item-icon agents">
              <el-icon><User /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-value">{{ collaborationStats.totalAgents }}</div>
              <div class="item-label">智能体总数</div>
              <div class="item-detail">
                {{ collaborationStats.activeAgents }} 活跃
              </div>
            </div>
          </div>

          <div class="overview-item">
            <div class="item-icon tasks">
              <el-icon><List /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-value">{{ collaborationStats.totalTasks }}</div>
              <div class="item-label">协作任务</div>
              <div class="item-progress">
                成功率 {{ collaborationStats.successRate }}%
              </div>
            </div>
          </div>

          <div class="overview-item">
            <div class="item-icon efficiency">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-value">{{ collaborationStats.collaborationEfficiency }}%</div>
              <div class="item-label">协作效率</div>
              <div class="item-trend positive">
                <el-icon><CaretTop /></el-icon>
                +{{ collaborationStats.efficiencyTrend }}%
              </div>
            </div>
          </div>

          <div class="overview-item">
            <div class="item-icon cross">
              <el-icon><Share /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-value">{{ collaborationStats.crossAgentCollaboration }}</div>
              <div class="item-label">跨智能体协作</div>
              <div class="item-status" :class="getCollaborationStatus(collaborationStats.crossAgentCollaboration)">
                {{ getCollaborationText(collaborationStats.crossAgentCollaboration) }}
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 智能体地图 -->
    <el-card class="map-card">
      <div class="map-header">
        <h3>智能体分布地图</h3>
        <div class="map-controls">
          <el-select
            v-model="mapFilter.type"
            placeholder="智能体类型"
            clearable
            style="width: 120px"
            @change="loadAgentMap"
          >
            <el-option label="全部" value="" />
            <el-option label="人类" value="human" />
            <el-option label="AI" value="ai" />
            <el-option label="机器人" value="robot" />
            <el-option label="环境" value="environment" />
          </el-select>

          <el-select
            v-model="mapFilter.status"
            placeholder="状态"
            clearable
            style="width: 100px"
            @change="loadAgentMap"
          >
            <el-option label="全部" value="" />
            <el-option label="活跃" value="active" />
            <el-option label="空闲" value="idle" />
            <el-option label="忙碌" value="busy" />
            <el-option label="离线" value="offline" />
          </el-select>

          <el-button @click="loadAgentMap" :loading="mapLoading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>

      <div ref="mapContainer" class="agent-map"></div>
    </el-card>

    <!-- 选项卡内容 -->
    <el-tabs v-model="activeTab" class="collaboration-tabs">
      <!-- 智能体管理 -->
      <el-tab-pane label="智能体管理" name="agents">
        <AgentManagement @refresh="loadAgents" />
      </el-tab-pane>

      <!-- 协作任务 -->
      <el-tab-pane label="协作任务" name="tasks">
        <TaskManagement @refresh="loadTasks" />
      </el-tab-pane>

      <!-- 协作会话 -->
      <el-tab-pane label="协作会话" name="sessions">
        <SessionManagement @refresh="loadSessions" />
      </el-tab-pane>

      <!-- 集群管理 -->
      <el-tab-pane label="集群管理" name="clusters">
        <ClusterManagement @refresh="loadClusters" />
      </el-tab-pane>

      <!-- 性能监控 -->
      <el-tab-pane label="性能监控" name="performance">
        <PerformanceMonitoring />
      </el-tab-pane>
    </el-tabs>

    <!-- 创建协作任务对话框 -->
    <el-dialog
      v-model="showTaskDialog"
      title="创建协作任务"
      width="80%"
      :destroy-on-close="true"
    >
      <CreateCollaborationTask @success="handleTaskCreated" @cancel="showTaskDialog = false" />
    </el-dialog>

    <!-- 创建协作会话对话框 -->
    <el-dialog
      v-model="showSessionDialog"
      title="创建协作会话"
      width="70%"
      :destroy-on-close="true"
    >
      <CreateCollaborationSession @success="handleSessionCreated" @cancel="showSessionDialog = false" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Plus, Connection, User, List, TrendCharts, Share, CaretTop, Refresh
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { multiAgentAPI } from '@/api/multi-agent'
import type { AgentType, AgentStatus } from '@/api/multi-agent'
import AgentManagement from '@/components/MultiAgent/AgentManagement.vue'
import TaskManagement from '@/components/MultiAgent/TaskManagement.vue'
import SessionManagement from '@/components/MultiAgent/SessionManagement.vue'
import ClusterManagement from '@/components/MultiAgent/ClusterManagement.vue'
import PerformanceMonitoring from '@/components/MultiAgent/PerformanceMonitoring.vue'
import CreateCollaborationTask from '@/components/MultiAgent/CreateCollaborationTask.vue'
import CreateCollaborationSession from '@/components/MultiAgent/CreateCollaborationSession.vue'

// 响应式数据
const activeTab = ref('agents')
const showTaskDialog = ref(false)
const showSessionDialog = ref(false)
const mapContainer = ref<HTMLElement>()
const mapLoading = ref(false)

// 地图过滤器
const mapFilter = ref({
  type: '',
  status: ''
})

// 协作统计数据
const collaborationStats = ref({
  totalAgents: 42,
  activeAgents: 38,
  totalTasks: 156,
  completedTasks: 142,
  successRate: 91,
  collaborationEfficiency: 78,
  efficiencyTrend: 12.5,
  crossAgentCollaboration: 24
})

// 图表实例
let mapChart: echarts.ECharts | null = null

// 生命周期
onMounted(() => {
  loadCollaborationStats()
  loadAgentMap()
  initMapChart()
})

// 方法
const loadCollaborationStats = async () => {
  try {
    const response = await multiAgentAPI.getCollaborationStats('day')
    if (response.success && response.data) {
      collaborationStats.value = response.data
    }
  } catch (error) {
    console.error('Load collaboration stats failed:', error)
  }
}

const loadAgentMap = async () => {
  try {
    mapLoading.value = true
    const response = await multiAgentAPI.getAgentMap()

    if (response.success && response.data) {
      updateAgentMap(response.data)
    }
  } catch (error) {
    console.error('Load agent map failed:', error)
    ElMessage.error('加载智能体地图失败')
  } finally {
    mapLoading.value = false
  }
}

const initMapChart = () => {
  nextTick(() => {
    if (mapContainer.value) {
      mapChart = echarts.init(mapContainer.value)
      updateAgentMap()
    }
  })
}

const updateAgentMap = (mapData?: any) => {
  if (!mapChart) return

  // Simplified implementation for now
  const mockAgents = generateMockAgents()
  const nodes = mockAgents.map((agent: any) => ({
    name: agent.name,
    value: 20,
    category: agent.type,
    status: agent.status
  }))

  const links = [] as any[]
  mockAgents.forEach((agent: any) => {
    if (agent.connections) {
      agent.connections.forEach((connection: any) => {
        links.push({
          source: agent.id,
          target: connection.to,
          value: connection.strength
        })
      })
    }
  })

  const chartOption = {
    title: {
      text: '智能体协作网络',
      left: 'center'
    },
    tooltip: {},
    series: [{
      type: 'graph',
      layout: 'force',
      data: nodes,
      links: links,
      categories: [
        { name: '人类智能体', itemStyle: { color: '#5470c6' } },
        { name: 'AI智能体', itemStyle: { color: '#91cc75' } },
        { name: '机器人智能体', itemStyle: { color: '#fac858' } },
        { name: '环境智能体', itemStyle: { color: '#ee6666' } }
      ],
      roam: true,
      label: {
        show: true,
        position: 'right'
      },
      force: {
        repulsion: 100,
        edgeLength: 100
      }
    }]
  }

  mapChart.setOption(chartOption)
}

const generateMockAgents = () => {
  return [
    {
      id: 'human-1',
      name: '厨师长张',
      type: 'human',
      status: 'active',
      location: { x: 100, y: 100, zone: 'kitchen' },
      connections: [{ to: 'ai-1', strength: 0.8 }],
      currentLoad: 75
    },
    {
      id: 'ai-1',
      name: '厨房助手AI',
      type: 'ai',
      status: 'active',
      location: { x: 200, y: 150, zone: 'kitchen' },
      connections: [{ to: 'robot-1', strength: 0.9 }],
      currentLoad: 60
    },
    {
      id: 'robot-1',
      name: '烹饪机器人A',
      type: 'robot',
      status: 'active',
      location: { x: 150, y: 50, zone: 'kitchen' },
      currentLoad: 80
    },
    {
      id: 'env-1',
      name: '温度传感器A',
      type: 'environment',
      status: 'active',
      location: { x: 50, y: 200, zone: 'kitchen' },
      currentLoad: 30
    },
    {
      id: 'virtual-1',
      name: '调度虚拟体',
      type: 'virtual',
      status: 'active',
      location: { x: 300, y: 100, zone: 'dining' },
      connections: [{ to: 'human-2', strength: 0.7 }],
      currentLoad: 45
    }
  ]
}

const generateMockEnvironment = () => {
  return {
    zones: [
      {
        id: 'kitchen-1',
        name: '厨房区域A',
        type: 'kitchen',
        bounds: { x: 0, y: 0, width: 300, height: 300 }
      },
      {
        id: 'dining-1',
        name: '用餐区域A',
        type: 'dining',
        bounds: { x: 320, y: 0, width: 280, height: 300 }
      }
    ]
  }
}

const getCollaborationStatus = (count: number) => {
  if (count >= 30) return 'excellent'
  if (count >= 20) return 'good'
  return 'normal'
}

const getCollaborationText = (count: number) => {
  if (count >= 30) return '优秀'
  if (count >= 20) return '良好'
  return '正常'
}

const handleTaskCreated = () => {
  showTaskDialog.value = false
  ElMessage.success('协作任务创建成功')
  loadCollaborationStats()
}

const handleSessionCreated = () => {
  showSessionDialog.value = false
  ElMessage.success('协作会话创建成功')
  loadCollaborationStats()
}

const loadAgents = () => {
  // 刷新智能体列表
  loadCollaborationStats()
}

const loadTasks = () => {
  // 刷新任务列表
  loadCollaborationStats()
}

const loadSessions = () => {
  // 刷新会话列表
  loadCollaborationStats()
}

const loadClusters = () => {
  // 刷新集群列表
  loadCollaborationStats()
}
</script>

<style lang="scss" scoped>
.multi-agent-collaboration {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;

    .header-content {
      h1 {
        margin: 0 0 8px 0;
        font-size: 28px;
        font-weight: 600;
        color: #303133;
      }

      p {
        margin: 0;
        color: #909399;
        font-size: 14px;
      }
    }
  }

  .collaboration-overview {
    margin-bottom: 24px;

    .overview-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;

      .overview-item {
        display: flex;
        align-items: center;
        gap: 16px;

        .item-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;

          &.agents {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          &.tasks {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
          }

          &.efficiency {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
          }

          &.cross {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            color: white;
          }
        }

        .item-info {
          flex: 1;

          .item-value {
            font-size: 28px;
            font-weight: 700;
            color: #303133;
            line-height: 1.2;
          }

          .item-label {
            font-size: 14px;
            color: #909399;
            margin: 4px 0;
          }

          .item-detail {
            font-size: 13px;
            color: #606266;
          }

          .item-progress {
            font-size: 13px;
            color: #67c23a;
            font-weight: 500;
          }

          .item-trend {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 13px;
            font-weight: 500;

            &.positive {
              color: #67c23a;
            }

            &.negative {
              color: #f56c6c;
            }
          }

          .item-status {
            font-size: 13px;
            font-weight: 500;

            &.excellent {
              color: #67c23a;
            }

            &.good {
              color: #e6a23c;
            }

            &.normal {
              color: #909399;
            }
          }
        }
      }
    }
  }

  .map-card {
    margin-bottom: 24px;

    .map-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }

      .map-controls {
        display: flex;
        gap: 12px;
        align-items: center;
      }
    }

    .agent-map {
      height: 400px;
      width: 100%;
      background: #fff;
      border-radius: 8px;
    }
  }

  .collaboration-tabs {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    :deep(.el-tabs__header) {
      margin: 0;
      background: #f8f9fa;
    }

    :deep(.el-tabs__nav-wrap) {
      padding: 0 24px;
    }

    :deep(.el-tabs__content) {
      padding: 24px;
    }
  }

  .el-dialog {
    .el-dialog__body {
      padding: 0;
    }
  }
}

@media (max-width: 768px) {
  .multi-agent-collaboration {
    padding: 16px;

    .page-header {
      flex-direction: column;
      gap: 16px;
    }

    .overview-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .map-header {
      flex-direction: column;
      gap: 12px;
      align-items: stretch !important;

      .map-controls {
        flex-wrap: wrap;
        justify-content: center;
      }
    }

    .agent-map {
      height: 300px;
    }
  }
}
</style>