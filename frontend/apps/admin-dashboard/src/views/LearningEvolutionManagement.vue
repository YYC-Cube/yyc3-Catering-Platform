<template>
  <div class="learning-evolution-management">
    <!-- 顶部导航栏 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <el-icon><TrendCharts /></el-icon>
            学习进化管理
          </h1>
          <p class="page-description">构建智能学习系统，实现持续进化和自适应优化</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="showCreateExperimentDialog = true">
            <el-icon><Plus /></el-icon>
            创建实验
          </el-button>
          <el-button @click="showCreateSystemDialog = true">
            <el-icon><Setting /></el-icon>
            创建系统
          </el-button>
          <el-button @click="showKnowledgeTransferDialog = true">
            <el-icon><Share /></el-icon>
            知识迁移
          </el-button>
          <el-button-group>
            <el-button @click="viewMode = 'models'" :type="viewMode === 'models' ? 'primary' : ''">
              <el-icon><Document /></el-icon>
              模型
            </el-button>
            <el-button @click="viewMode = 'experiments'" :type="viewMode === 'experiments' ? 'primary' : ''">
              <el-icon><Operation /></el-icon>
              实验
            </el-button>
            <el-button @click="viewMode = 'evolution'" :type="viewMode === 'evolution' ? 'primary' : ''">
              <el-icon><Connection /></el-icon>
              进化
            </el-button>
            <el-button @click="viewMode = 'adaptive'" :type="viewMode === 'adaptive' ? 'primary' : ''">
              <el-icon><Refresh /></el-icon>
              自适应
            </el-button>
            <el-button @click="viewMode = 'analytics'" :type="viewMode === 'analytics' ? 'primary' : ''">
              <el-icon><DataAnalysis /></el-icon>
              分析
            </el-button>
          </el-button-group>
        </div>
      </div>
    </div>

    <!-- 模型视图 -->
    <div v-if="viewMode === 'models'" class="models-view">
      <!-- 模型过滤器 -->
      <div class="model-filters">
        <el-row :gutter="16">
          <el-col :span="6">
            <el-select v-model="modelTypeFilter" placeholder="学习类型" clearable>
              <el-option label="全部类型" value="" />
              <el-option label="监督学习" value="supervised" />
              <el-option label="无监督学习" value="unsupervised" />
              <el-option label="强化学习" value="reinforcement" />
              <el-option label="迁移学习" value="transfer" />
              <el-option label="联邦学习" value="federated" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="modelStatusFilter" placeholder="部署状态" clearable>
              <el-option label="全部状态" value="" />
              <el-option label="草稿" value="draft" />
              <el-option label="测试中" value="testing" />
              <el-option label="预发布" value="staging" />
              <el-option label="生产中" value="production" />
              <el-option label="已废弃" value="deprecated" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="modelCategoryFilter" placeholder="类别" clearable>
              <el-option label="全部类别" value="" />
              <el-option label="分类" value="classification" />
              <el-option label="回归" value="regression" />
              <el-option label="聚类" value="clustering" />
              <el-option label="降维" value="dimensionality_reduction" />
              <el-option label="生成" value="generation" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button @click="refreshModels">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button @click="showCreateModelDialog = true">
              <el-icon><Plus /></el-icon>
              新建模型
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 模型统计卡片 -->
      <div class="model-stats-cards">
        <el-row :gutter="16">
          <el-col :span="6">
            <div class="stat-card total">
              <div class="stat-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stat-content">
                <h3>{{ totalModels }}</h3>
                <p>总模型数</p>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card production">
              <div class="stat-icon">
                <el-icon><VideoPlay /></el-icon>
              </div>
              <div class="stat-content">
                <h3>{{ productionModels }}</h3>
                <p>生产模型</p>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card training">
              <div class="stat-icon">
                <el-icon><Loading /></el-icon>
              </div>
              <div class="stat-content">
                <h3>{{ trainingModels }}</h3>
                <p>训练中</p>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card performance">
              <div class="stat-icon">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="stat-content">
                <h3>{{ averageAccuracy }}%</h3>
                <p>平均精度</p>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 模型列表 -->
      <div class="models-list">
        <el-table
          :data="filteredModels"
          v-loading="loadingModels"
          @selection-change="handleModelSelection"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="模型名称" prop="name" width="150" />
          <el-table-column label="版本" prop="version" width="100" />
          <el-table-column label="类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getModelTypeTagType(row.type)" size="small">
                {{ getModelTypeLabel(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="架构" prop="architecture" width="150" />
          <el-table-column label="部署状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getDeploymentTagType(row.deployment.status)" size="small">
                {{ getDeploymentLabel(row.deployment.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="精度" width="100">
            <template #default="{ row }">
              <span>{{ (row.evaluation.accuracy * 100).toFixed(2) }}%</span>
            </template>
          </el-table-column>
          <el-table-column label="请求/秒" width="100">
            <template #default="{ row }">
              {{ row.deployment.metrics?.requestsPerSecond || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="延迟(ms)" width="100">
            <template #default="{ row }">
              {{ row.deployment.metrics?.averageLatency || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="150">
            <template #default="{ row }">
              {{ formatDateTime(row.metadata.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250">
            <template #default="{ row }">
              <el-button @click="trainModel(row)" size="small" text type="primary">
                训练
              </el-button>
              <el-button @click="deployModel(row)" size="small" text type="success">
                部署
              </el-button>
              <el-button @click="evaluateModel(row)" size="small" text type="info">
                评估
              </el-button>
              <el-button @click="viewModelDetails(row)" size="small" text>
                详情
              </el-button>
              <el-dropdown @command="(cmd) => handleModelAction(cmd, row)">
                <el-button size="small" text>
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="duplicate">复制模型</el-dropdown-item>
                    <el-dropdown-item command="export">导出模型</el-dropdown-item>
                    <el-dropdown-item command="version">版本管理</el-dropdown-item>
                    <el-dropdown-item command="logs">查看日志</el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除模型</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 模型分页 -->
      <div class="model-pagination">
        <el-pagination
          v-model:current-page="modelCurrentPage"
          v-model:page-size="modelPageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalModels"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleModelSizeChange"
          @current-change="handleModelCurrentChange"
        />
      </div>
    </div>

    <!-- 实验视图 -->
    <div v-else-if="viewMode === 'experiments'" class="experiments-view">
      <div class="experiments-header">
        <div class="experiments-filters">
          <el-row :gutter="16">
            <el-col :span="6">
              <el-select v-model="experimentTypeFilter" placeholder="实验类型" clearable>
                <el-option label="全部类型" value="" />
                <el-option label="监督学习" value="supervised" />
                <el-option label="无监督学习" value="unsupervised" />
                <el-option label="强化学习" value="reinforcement" />
                <el-option label="迁移学习" value="transfer" />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-select v-model="experimentStatusFilter" placeholder="实验状态" clearable>
                <el-option label="全部状态" value="" />
                <el-option label="空闲" value="idle" />
                <el-option label="训练中" value="training" />
                <el-option label="评估中" value="evaluating" />
                <el-option label="已完成" value="completed" />
                <el-option label="失败" value="failed" />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-select v-model="experimentPriorityFilter" placeholder="优先级" clearable>
                <el-option label="全部优先级" value="" />
                <el-option label="低" value="low" />
                <el-option label="中" value="medium" />
                <el-option label="高" value="high" />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-button @click="refreshExperiments">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </el-col>
          </el-row>
        </div>
      </div>

      <div class="experiments-grid">
        <el-row :gutter="16">
          <el-col
            v-for="experiment in filteredExperiments"
            :key="experiment.id"
            :span="8"
            class="experiment-col"
          >
            <div class="experiment-card">
              <div class="experiment-header">
                <h4>{{ experiment.name }}</h4>
                <el-tag :type="getStatusTagType(experiment.status)" size="small">
                  {{ getStatusLabel(experiment.status) }}
                </el-tag>
              </div>

              <div class="experiment-description">
                <p>{{ experiment.description }}</p>
              </div>

              <div class="experiment-details">
                <div class="detail-row">
                  <span class="label">目标:</span>
                  <span class="value">{{ experiment.objective }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">类型:</span>
                  <el-tag :type="getTypeTagType(experiment.type)" size="small">
                    {{ getTypeLabel(experiment.type) }}
                  </el-tag>
                </div>
                <div class="detail-row">
                  <span class="label">进度:</span>
                  <div class="progress-indicator">
                    <el-progress
                      :percentage="getExperimentProgress(experiment)"
                      :show-text="false"
                      :stroke-width="6"
                    />
                    <span class="progress-text">{{ getExperimentProgress(experiment) }}%</span>
                  </div>
                </div>
              </div>

              <div class="experiment-metrics" v-if="experiment.results.finalMetrics">
                <h5>性能指标</h5>
                <div class="metrics-grid">
                  <div
                    v-for="(value, key) in experiment.results.finalMetrics"
                    :key="key"
                    class="metric-item"
                  >
                    <span class="metric-name">{{ key }}</span>
                    <span class="metric-value">{{ value.toFixed(4) }}</span>
                  </div>
                </div>
              </div>

              <div class="experiment-actions">
                <el-button @click="viewExperimentDetails(experiment)" size="small">
                  查看详情
                </el-button>
                <el-button
                  @click="pauseExperiment(experiment)"
                  size="small"
                  type="warning"
                  :disabled="!['training', 'evaluating'].includes(experiment.status)"
                >
                  暂停
                </el-button>
                <el-button
                  @click="stopExperiment(experiment)"
                  size="small"
                  type="danger"
                  :disabled="experiment.status === 'completed'"
                >
                  停止
                </el-button>
              </div>

              <!-- 实时状态指示器 -->
              <div class="experiment-status-indicators">
                <div v-if="experiment.status === 'training'" class="status-indicator training">
                  <el-icon class="animate-spin"><Loading /></el-icon>
                  <span>训练中</span>
                </div>
                <div v-if="experiment.status === 'completed'" class="status-indicator completed">
                  <el-icon><Check /></el-icon>
                  <span>已完成</span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 进化视图 -->
    <div v-else-if="viewMode === 'evolution'" class="evolution-view">
      <div class="evolution-controls">
        <el-button @click="showCreatePopulationDialog = true" type="primary">
          <el-icon><Plus /></el-icon>
          创建种群
        </el-button>
        <el-button @click="runEvolution" :disabled="!selectedPopulation">
          <el-icon><VideoPlay /></el-icon>
          运行进化
        </el-button>
        <el-button @click="analyzeEvolution" :disabled="!selectedPopulation">
          <el-icon><DataAnalysis /></el-icon>
          分析进化
        </el-button>
      </div>

      <div class="evolution-grid">
        <el-row :gutter="16">
          <el-col :span="12">
            <div class="evolution-panel">
              <h3>种群列表</h3>
              <div class="population-list">
                <div
                  v-for="population in evolutionPopulations"
                  :key="population.id"
                  class="population-item"
                  :class="{ active: selectedPopulation?.id === population.id }"
                  @click="selectPopulation(population)"
                >
                  <div class="population-header">
                    <h4>{{ population.name }}</h4>
                    <el-tag :type="getStrategyTagType(population.strategy)" size="small">
                      {{ getStrategyLabel(population.strategy) }}
                    </el-tag>
                  </div>
                  <div class="population-stats">
                    <div class="stat-row">
                      <span>代数: {{ population.generation }}</span>
                    </div>
                    <div class="stat-row">
                      <span>个体数: {{ population.individuals.length }}</span>
                    </div>
                    <div class="stat-row">
                      <span>最佳适应度: {{ population.statistics.bestFitness.toFixed(4) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-col>

          <el-col :span="12">
            <div class="evolution-panel">
              <h3>进化可视化</h3>
              <div ref="evolutionChart" class="evolution-chart"></div>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="16" style="margin-top: 16px;">
          <el-col :span="24">
            <div class="evolution-panel">
              <h3>种群详情</h3>
              <div v-if="selectedPopulation" class="population-details">
                <div class="individuals-grid">
                  <div
                    v-for="individual in selectedPopulation.individuals.slice(0, 20)"
                    :key="individual.id"
                    class="individual-card"
                  >
                    <div class="individual-header">
                      <span>ID: {{ individual.id }}</span>
                      <span>适应度: {{ individual.fitness.toFixed(4) }}</span>
                    </div>
                    <div class="individual-genome">
                      <div class="genome-preview">
                        {{ individual.genome.slice(0, 10).join(', ') }}
                        <span v-if="individual.genome.length > 10">...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="no-selection">
                <p>请选择一个种群查看详情</p>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 自适应系统视图 -->
    <div v-else-if="viewMode === 'adaptive'" class="adaptive-view">
      <div class="adaptive-header">
        <div class="adaptive-controls">
          <el-button @click="showCreateSystemDialog = true" type="primary">
            <el-icon><Plus /></el-icon>
            创建系统
          </el-button>
          <el-button @click="triggerAdaptation" :disabled="!selectedSystem">
            <el-icon><Refresh /></el-icon>
            触发适应
          </el-button>
          <el-button @click="monitorSystem" :disabled="!selectedSystem">
            <el-icon><Monitor /></el-icon>
            监控系统
          </el-button>
        </div>
      </div>

      <div class="adaptive-systems-grid">
        <el-row :gutter="16">
          <el-col
            v-for="system in adaptiveSystems"
            :key="system.id"
            :span="8"
            class="system-col"
          >
            <div class="system-card" @click="selectSystem(system)">
              <div class="system-header">
                <h4>{{ system.name }}</h4>
                <div class="system-status">
                  <div class="status-dot" :class="{ active: true }"></div>
                  <span>运行中</span>
                </div>
              </div>

              <div class="system-description">
                <p>{{ system.description }}</p>
              </div>

              <div class="system-performance">
                <div class="performance-metric">
                  <span class="metric-label">整体精度:</span>
                  <el-progress
                    :percentage="system.performance.overallAccuracy * 100"
                    :show-text="false"
                    :stroke-width="6"
                  />
                </div>
                <div class="performance-metric">
                  <span class="metric-label">适应率:</span>
                  <el-progress
                    :percentage="system.performance.adaptationRate * 100"
                    :show-text="false"
                    :stroke-width="6"
                  />
                </div>
                <div class="performance-metric">
                  <span class="metric-label">稳定性:</span>
                  <el-progress
                    :percentage="system.performance.stability * 100"
                    :show-text="false"
                    :stroke-width="6"
                  />
                </div>
              </div>

              <div class="system-last-adaptation">
                <span>最后适应: {{ formatDateTime(system.lastAdaptation) }}</span>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 系统监控面板 -->
      <div v-if="selectedSystem" class="system-monitoring">
        <div class="monitoring-header">
          <h3>{{ selectedSystem.name }} - 监控面板</h3>
        </div>

        <el-row :gutter="16">
          <el-col :span="12">
            <div class="monitoring-panel">
              <h4>性能指标</h4>
              <div ref="performanceChart" class="chart-container"></div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="monitoring-panel">
              <h4>适应历史</h4>
              <div ref="adaptationChart" class="chart-container"></div>
            </div>
          </el-col>
        </el-row>

        <div class="alerts-panel">
          <h4>系统告警</h4>
          <div class="alerts-list">
            <div
              v-for="alert in selectedSystem.monitoring.alerts"
              :key="alert.id"
              class="alert-item"
              :class="alert.type"
            >
              <div class="alert-content">
                <span class="alert-message">{{ alert.message }}</span>
                <span class="alert-time">{{ formatDateTime(alert.timestamp) }}</span>
              </div>
              <el-button
                v-if="!alert.acknowledged"
                @click="acknowledgeAlert(alert)"
                size="small"
                type="primary"
              >
                确认
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分析视图 -->
    <div v-else-if="viewMode === 'analytics'" class="analytics-view">
      <div class="analytics-controls">
        <el-row :gutter="16">
          <el-col :span="6">
            <el-select v-model="analyticsTarget" placeholder="分析目标" @change="loadAnalytics">
              <el-option label="全部系统" value="" />
              <el-option label="模型性能" value="models" />
              <el-option label="实验趋势" value="experiments" />
              <el-option label="进化效果" value="evolution" />
              <el-option label="自适应系统" value="adaptive" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="analyticsPeriod" placeholder="时间周期" @change="loadAnalytics">
              <el-option label="最近1小时" value="hour" />
              <el-option label="最近24小时" value="day" />
              <el-option label="最近7天" value="week" />
              <el-option label="最近30天" value="month" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button @click="generateReport">
              <el-icon><Document /></el-icon>
              生成报告
            </el-button>
            <el-button @click="exportAnalytics">
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
          </el-col>
          <el-col :span="6">
            <el-button @click="runPredictions">
              <el-icon><MagicStick /></el-icon>
              预测分析
            </el-button>
          </el-col>
        </el-row>
      </div>

      <div class="analytics-content">
        <el-row :gutter="16">
          <el-col :span="16">
            <div class="analytics-charts">
              <el-card title="性能趋势">
                <div ref="performanceTrendChart" class="chart-container"></div>
              </el-card>

              <el-card title="学习效率">
                <div ref="learningEfficiencyChart" class="chart-container"></div>
              </el-card>

              <el-card title="资源使用">
                <div ref="resourceUsageChart" class="chart-container"></div>
              </el-card>
            </div>
          </el-col>

          <el-col :span="8">
            <div class="analytics-summary">
              <el-card title="关键指标">
                <div class="summary-metrics">
                  <div class="summary-item">
                    <span class="summary-label">平均性能</span>
                    <span class="summary-value">{{ averagePerformance }}%</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">学习速率</span>
                    <span class="summary-value">{{ learningRate }}/天</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">系统稳定性</span>
                    <span class="summary-value">{{ systemStability }}%</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">资源效率</span>
                    <span class="summary-value">{{ resourceEfficiency }}%</span>
                  </div>
                </div>
              </el-card>

              <el-card title="改进建议">
                <div class="recommendations">
                  <div
                    v-for="recommendation in recommendations"
                    :key="recommendation.id"
                    class="recommendation-item"
                    :class="recommendation.priority"
                  >
                    <div class="recommendation-content">
                      <h5>{{ recommendation.title }}</h5>
                      <p>{{ recommendation.description }}</p>
                    </div>
                    <div class="recommendation-impact">
                      <span>预期提升: {{ recommendation.expectedImpact }}</span>
                    </div>
                  </div>
                </div>
              </el-card>

              <el-card title="预测结果">
                <div class="predictions">
                  <div
                    v-for="prediction in predictions"
                    :key="prediction.target"
                    class="prediction-item"
                  >
                    <span class="prediction-target">{{ prediction.target }}</span>
                    <div class="prediction-value">
                      <strong>{{ prediction.prediction }}</strong>
                      <small>(置信度: {{ (prediction.confidence * 100).toFixed(1) }}%)</small>
                    </div>
                  </div>
                </div>
              </el-card>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 对话框组件 -->
    <CreateExperimentDialog
      v-model="showCreateExperimentDialog"
      @success="handleExperimentCreated"
    />

    <CreateSystemDialog
      v-model="showCreateSystemDialog"
      @success="handleSystemCreated"
    />

    <CreatePopulationDialog
      v-model="showCreatePopulationDialog"
      @success="handlePopulationCreated"
    />

    <KnowledgeTransferDialog
      v-model="showKnowledgeTransferDialog"
      @success="handleKnowledgeTransferCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import {
  learningEvolutionAPI,
  type LearningModel,
  type LearningExperiment,
  type EvolutionPopulation,
  type AdaptiveLearningSystem,
  LearningType,
  LearningStatus,
  EvolutionStrategy
} from '@/api/learning-evolution'

// 导入组件（这些组件需要创建）
import CreateExperimentDialog from '@/components/LearningEvolution/CreateExperimentDialog.vue'
import CreateSystemDialog from '@/components/LearningEvolution/CreateSystemDialog.vue'
import CreatePopulationDialog from '@/components/LearningEvolution/CreatePopulationDialog.vue'
import KnowledgeTransferDialog from '@/components/LearningEvolution/KnowledgeTransferDialog.vue'

// 响应式数据
const viewMode = ref<'models' | 'experiments' | 'evolution' | 'adaptive' | 'analytics'>('models')

// 模型相关
const modelTypeFilter = ref('')
const modelStatusFilter = ref('')
const modelCategoryFilter = ref('')
const modelCurrentPage = ref(1)
const modelPageSize = ref(20)
const models = ref<LearningModel[]>([])
const selectedModels = ref<LearningModel[]>([])
const loadingModels = ref(false)
const showCreateModelDialog = ref(false)
const totalModels = ref(0)
const productionModels = ref(0)
const trainingModels = ref(0)
const averageAccuracy = ref(0)

// 实验相关
const experimentTypeFilter = ref('')
const experimentStatusFilter = ref('')
const experimentPriorityFilter = ref('')
const experiments = ref<LearningExperiment[]>([])
const showCreateExperimentDialog = ref(false)

// 进化相关
const evolutionPopulations = ref<EvolutionPopulation[]>([])
const selectedPopulation = ref<EvolutionPopulation | null>(null)
const showCreatePopulationDialog = ref(false)

// 自适应系统相关
const adaptiveSystems = ref<AdaptiveLearningSystem[]>([])
const selectedSystem = ref<AdaptiveLearningSystem | null>(null)
const showCreateSystemDialog = ref(false)

// 分析相关
const analyticsTarget = ref('')
const analyticsPeriod = ref('day')
const averagePerformance = ref(0)
const learningRate = ref(0)
const systemStability = ref(0)
const resourceEfficiency = ref(0)

// 知识迁移相关
const showKnowledgeTransferDialog = ref(false)

// 预测和建议
const predictions = ref<any[]>([])
const recommendations = ref<any[]>([])

// DOM引用
const evolutionChart = ref<HTMLElement>()
const performanceChart = ref<HTMLElement>()
const adaptationChart = ref<HTMLElement>()
const performanceTrendChart = ref<HTMLElement>()
const learningEfficiencyChart = ref<HTMLElement>()
const resourceUsageChart = ref<HTMLElement>()

// 计算属性
const filteredModels = computed(() => {
  let filtered = models.value

  if (modelTypeFilter.value) {
    filtered = filtered.filter(model => model.type === modelTypeFilter.value)
  }

  if (modelStatusFilter.value) {
    filtered = filtered.filter(model => model.deployment.status === modelStatusFilter.value)
  }

  if (modelCategoryFilter.value) {
    filtered = filtered.filter(model => model.metadata.category === modelCategoryFilter.value)
  }

  return filtered.slice((modelCurrentPage.value - 1) * modelPageSize.value, modelCurrentPage.value * modelPageSize.value)
})

const filteredExperiments = computed(() => {
  let filtered = experiments.value

  if (experimentTypeFilter.value) {
    filtered = filtered.filter(exp => exp.type === experimentTypeFilter.value)
  }

  if (experimentStatusFilter.value) {
    filtered = filtered.filter(exp => exp.status === experimentStatusFilter.value)
  }

  if (experimentPriorityFilter.value) {
    filtered = filtered.filter(exp => exp.metadata.priority === experimentPriorityFilter.value)
  }

  return filtered
})

// 方法
const loadModels = async () => {
  loadingModels.value = true

  try {
    const { data, success } = await learningEvolutionAPI.getLearningModels()
    if (success && data) {
      models.value = data.models
      totalModels.value = data.total
      productionModels.value = data.models.filter(m => m.deployment.status === 'production').length
      trainingModels.value = data.models.filter(m => m.deployment.status === 'testing').length
      averageAccuracy.value = Math.round(
        data.models.reduce((sum, m) => sum + m.evaluation.accuracy, 0) / data.models.length * 100
      )
    }
  } catch (error) {
    console.error('Load models failed:', error)
    // 加载模拟数据
    loadMockModels()
  } finally {
    loadingModels.value = false
  }
}

const loadExperiments = async () => {
  try {
    const { data, success } = await learningEvolutionAPI.getLearningExperiments()
    if (success && data) {
      experiments.value = data.experiments
    }
  } catch (error) {
    console.error('Load experiments failed:', error)
    // 加载模拟数据
    loadMockExperiments()
  }
}

const loadEvolutionPopulations = async () => {
  try {
    const { data, success } = await learningEvolutionAPI.getEvolutionPopulations()
    if (success && data) {
      evolutionPopulations.value = data.populations
    }
  } catch (error) {
    console.error('Load evolution populations failed:', error)
    // 加载模拟数据
    loadMockPopulations()
  }
}

const loadAdaptiveSystems = async () => {
  try {
    const { data, success } = await learningEvolutionAPI.getAdaptiveLearningSystems()
    if (success && data) {
      adaptiveSystems.value = data.systems
    }
  } catch (error) {
    console.error('Load adaptive systems failed:', error)
    // 加载模拟数据
    loadMockSystems()
  }
}

const loadMockModels = () => {
  const mockModels: LearningModel[] = [
    {
      id: 'model_001',
      name: '餐饮推荐模型',
      version: '1.2.0',
      type: LearningType.SUPERVISED,
      architecture: 'Transformer',
      framework: 'PyTorch',
      parameters: { total: 125000000, trainable: 124000000, frozen: 1000000 },
      training: {
        datasetId: 'dataset_001',
        startTime: '2024-01-01T00:00:00Z',
        epochs: 100,
        batchSize: 32,
        learningRate: 0.001,
        optimizer: 'Adam',
        lossFunction: 'CrossEntropy',
        metrics: ['accuracy', 'precision', 'recall', 'f1']
      },
      evaluation: {
        accuracy: 0.92,
        precision: 0.89,
        recall: 0.94,
        f1Score: 0.91
      },
      deployment: {
        status: 'production',
        endpoint: 'https://api.example.com/models/model_001',
        version: '1.2.0',
        deployedAt: '2024-01-10T00:00:00Z',
        metrics: {
          requestsPerSecond: 150,
          averageLatency: 45,
          errorRate: 0.01,
          cpuUsage: 0.65,
          memoryUsage: 0.78
        }
      },
      metadata: {
        description: '基于用户行为的餐饮推荐模型',
        tags: ['recommendation', 'food', 'behavior'],
        category: 'classification',
        domain: 'catering',
        owner: 'AI团队',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-10T00:00:00Z'
      }
    },
    {
      id: 'model_002',
      name: '库存预测模型',
      version: '2.0.1',
      type: LearningType.SUPERVISED,
      architecture: 'LSTM',
      framework: 'TensorFlow',
      parameters: { total: 45000000, trainable: 44000000, frozen: 1000000 },
      training: {
        datasetId: 'dataset_002',
        startTime: '2024-01-02T00:00:00Z',
        epochs: 200,
        batchSize: 64,
        learningRate: 0.0005,
        optimizer: 'Adam',
        lossFunction: 'MSE',
        metrics: ['mse', 'mae', 'r2']
      },
      evaluation: {
        accuracy: 0.87,
        precision: 0.85,
        recall: 0.89,
        f1Score: 0.87
      },
      deployment: {
        status: 'staging',
        version: '2.0.1',
        deployedAt: '2024-01-08T00:00:00Z',
        metrics: {
          requestsPerSecond: 80,
          averageLatency: 120,
          errorRate: 0.02,
          cpuUsage: 0.45,
          memoryUsage: 0.62
        }
      },
      metadata: {
        description: '基于时间序列的库存需求预测模型',
        tags: ['forecasting', 'inventory', 'time-series'],
        category: 'regression',
        domain: 'supply_chain',
        owner: '数据科学团队',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-08T00:00:00Z'
      }
    }
  ]

  models.value = mockModels
  totalModels.value = mockModels.length
  productionModels.value = mockModels.filter(m => m.deployment.status === 'production').length
  trainingModels.value = mockModels.filter(m => m.deployment.status === 'testing').length
  averageAccuracy.value = Math.round(mockModels.reduce((sum, m) => sum + m.evaluation.accuracy, 0) / mockModels.length * 100)
}

const loadMockExperiments = () => {
  const mockExperiments: LearningExperiment[] = [
    {
      id: 'exp_001',
      name: '深度学习模型优化实验',
      description: '测试不同超参数组合对模型性能的影响',
      objective: '提升推荐系统准确率至95%以上',
      type: LearningType.SUPERVISED,
      status: LearningStatus.COMPLETED,
      config: {
        modelArchitecture: 'Transformer',
        trainingParameters: { learning_rate: 0.001, batch_size: 32 },
        evaluationMetrics: ['accuracy', 'precision', 'recall', 'f1'],
        dataSplit: { training: 0.8, validation: 0.1, test: 0.1 }
      },
      datasets: {
        training: ['dataset_001'],
        validation: ['dataset_001_val'],
        test: ['dataset_001_test']
      },
      results: {
        trainingLoss: [],
        validationMetrics: [],
        finalMetrics: {
          accuracy: 0.9456,
          precision: 0.9321,
          recall: 0.9589,
          f1Score: 0.9452
        }
      },
      artifacts: [],
      environment: {
        framework: 'PyTorch',
        version: '2.1.0',
        hardware: 'NVIDIA A100',
        runtime: 'Python 3.9',
        dependencies: {}
      },
      metadata: {
        creator: 'AI工程师',
        tags: ['optimization', 'hyperparameter', 'transformer'],
        category: 'model_tuning',
        priority: 'high',
        estimatedDuration: 120,
        actualDuration: 115,
        cost: 250
      },
      createdAt: '2024-01-05T00:00:00Z',
      startedAt: '2024-01-05T01:00:00Z',
      completedAt: '2024-01-05T03:00:00Z'
    },
    {
      id: 'exp_002',
      name: '强化学习配送路径优化',
      description: '使用强化学习优化机器人配送路径',
      objective: '减少平均配送时间20%',
      type: LearningType.REINFORCEMENT,
      status: LearningStatus.TRAINING,
      config: {
        modelArchitecture: 'DQN',
        trainingParameters: { learning_rate: 0.0001, epsilon: 0.1 },
        evaluationMetrics: ['reward', 'success_rate', 'efficiency'],
        dataSplit: { training: 0.9, validation: 0.05, test: 0.05 }
      },
      datasets: {
        training: ['dataset_003'],
        validation: ['dataset_003_val'],
        test: ['dataset_003_test']
      },
      results: {
        trainingLoss: [],
        validationMetrics: []
      },
      artifacts: [],
      environment: {
        framework: 'Stable Baselines3',
        version: '2.0.0',
        hardware: 'NVIDIA RTX 4090',
        runtime: 'Python 3.10',
        dependencies: {}
      },
      metadata: {
        creator: '机器人团队',
        tags: ['reinforcement', 'robotics', 'path_optimization'],
        category: 'robotics',
        priority: 'medium',
        estimatedDuration: 480,
        cost: 800
      },
      createdAt: '2024-01-08T00:00:00Z',
      startedAt: '2024-01-08T02:00:00Z'
    }
  ]

  experiments.value = mockExperiments
}

const loadMockPopulations = () => {
  const mockPopulations: EvolutionPopulation[] = [
    {
      id: 'pop_001',
      name: '神经网络架构进化',
      description: '进化最优神经网络架构',
      strategy: EvolutionStrategy.NEUROEVOLUTION,
      generation: 25,
      individuals: [
        {
          id: 'ind_001',
          genome: [64, 128, 256, 128, 64, 10],
          fitness: 0.9234,
          age: 15,
          parents: [],
          mutations: [],
          performance: { accuracy: 0.92, efficiency: 0.88 }
        }
      ],
      statistics: {
        bestFitness: 0.9234,
        averageFitness: 0.8756,
        worstFitness: 0.7234,
        standardDeviation: 0.0567,
        diversity: 0.789,
        convergenceRate: 0.0234
      },
      parameters: {
        populationSize: 50,
        mutationRate: 0.1,
        crossoverRate: 0.8,
        selectionMethod: 'tournament',
        elitismCount: 5,
        tournamentSize: 3
      },
      history: [],
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-09T00:00:00Z'
    }
  ]

  evolutionPopulations.value = mockPopulations
}

const loadMockSystems = () => {
  const mockSystems: AdaptiveLearningSystem[] = [
    {
      id: 'sys_001',
      name: '智能推荐自适应系统',
      description: '能够根据用户反馈自动调整的推荐系统',
      components: {
        models: [
          { modelId: 'model_001', role: 'primary', weight: 0.8, lastUpdated: '2024-01-09T00:00:00Z' }
        ],
        dataPipelines: [
          { id: 'pipe_001', source: 'user_feedback', processing: ['cleaning', 'feature_extraction'], destination: 'model_001', status: 'active' }
        ],
        feedbackLoops: [
          { id: 'loop_001', trigger: 'performance_drop', action: 'retrain', conditions: { threshold: 0.85 } }
        ]
      },
      adaptation: {
        strategy: 'incremental',
        triggers: [
          { type: 'performance', threshold: 0.85, action: 'retrain' },
          { type: 'data_drift', threshold: 0.1, action: 'update_features' }
        ],
        schedule: { frequency: 'daily', window: '24h', retention: '30d' }
      },
      performance: {
        overallAccuracy: 0.91,
        adaptationRate: 0.03,
        stability: 0.94,
        responsiveness: 0.87,
        resourceEfficiency: 0.82
      },
      monitoring: {
        metrics: [
          { name: 'accuracy', currentValue: 0.91, targetValue: 0.95, trend: 'stable', lastChecked: '2024-01-09T10:00:00Z' }
        ],
        alerts: [
          {
            id: 'alert_001',
            type: 'warning',
            message: '模型性能略有下降，建议重新训练',
            timestamp: '2024-01-09T09:30:00Z',
            acknowledged: false
          }
        ]
      },
      governance: {
        policies: [],
        explainability: { enabled: true, methods: ['SHAP', 'LIME'], detail: 'medium' },
        fairness: { metrics: ['demographic_parity', 'equal_opportunity'], thresholds: { demographic_parity: 0.8 }, reports: [] }
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-09T00:00:00Z',
      lastAdaptation: '2024-01-08T02:00:00Z'
    }
  ]

  adaptiveSystems.value = mockSystems
}

const refreshModels = async () => {
  await loadModels()
  ElMessage.success('模型列表已刷新')
}

const refreshExperiments = async () => {
  await loadExperiments()
  ElMessage.success('实验列表已刷新')
}

const handleModelSelection = (selection: LearningModel[]) => {
  selectedModels.value = selection
}

const handleModelSizeChange = (size: number) => {
  modelPageSize.value = size
}

const handleModelCurrentChange = (page: number) => {
  modelCurrentPage.value = page
}

const trainModel = async (model: LearningModel) => {
  try {
    const { data, success } = await learningEvolutionAPI.trainModel(model.id, {
      datasetId: 'dataset_001',
      epochs: 100,
      batchSize: 32
    })

    if (success) {
      ElMessage.success(`模型 ${model.name} 训练任务已启动`)
    }
  } catch (error) {
    console.error('Train model failed:', error)
    ElMessage.error('训练模型失败')
  }
}

const deployModel = async (model: LearningModel) => {
  try {
    const { data, success } = await learningEvolutionAPI.deployModel(model.id, {
      environment: 'production',
      scaling: { minInstances: 1, maxInstances: 5, targetCpuUtilization: 70 }
    })

    if (success) {
      ElMessage.success(`模型 ${model.name} 部署成功`)
    }
  } catch (error) {
    console.error('Deploy model failed:', error)
    ElMessage.error('部署模型失败')
  }
}

const evaluateModel = (model: LearningModel) => {
  ElMessage.info(`评估模型 ${model.name} 功能开发中`)
}

const viewModelDetails = (model: LearningModel) => {
  ElMessage.info(`查看模型 ${model.name} 详情功能开发中`)
}

const handleModelAction = (command: string, model: LearningModel) => {
  switch (command) {
    case 'duplicate':
      ElMessage.info('复制模型功能开发中')
      break
    case 'export':
      ElMessage.info('导出模型功能开发中')
      break
    case 'version':
      ElMessage.info('版本管理功能开发中')
      break
    case 'logs':
      ElMessage.info('查看日志功能开发中')
      break
    case 'delete':
      ElMessage.info('删除模型功能开发中')
      break
  }
}

const getExperimentProgress = (experiment: LearningExperiment) => {
  if (experiment.status === 'completed') return 100
  if (experiment.status === 'failed') return 0
  if (experiment.actualDuration && experiment.metadata.estimatedDuration) {
    return Math.round((experiment.actualDuration / experiment.metadata.estimatedDuration) * 100)
  }
  return Math.random() * 80 // 模拟进度
}

const viewExperimentDetails = (experiment: LearningExperiment) => {
  ElMessage.info(`查看实验 ${experiment.name} 详情功能开发中`)
}

const pauseExperiment = (experiment: LearningExperiment) => {
  ElMessage.info(`暂停实验 ${experiment.name} 功能开发中`)
}

const stopExperiment = (experiment: LearningExperiment) => {
  ElMessage.info(`停止实验 ${experiment.name} 功能开发中`)
}

const selectPopulation = (population: EvolutionPopulation) => {
  selectedPopulation.value = population
  nextTick(() => {
    renderEvolutionChart()
  })
}

const runEvolution = () => {
  if (!selectedPopulation.value) {
    ElMessage.warning('请先选择一个种群')
    return
  }

  ElMessage.info('运行进化算法功能开发中')
}

const analyzeEvolution = () => {
  if (!selectedPopulation.value) {
    ElMessage.warning('请先选择一个种群')
    return
  }

  ElMessage.info('分析进化结果功能开发中')
}

const selectSystem = (system: AdaptiveLearningSystem) => {
  selectedSystem.value = system
  nextTick(() => {
    renderSystemCharts()
  })
}

const triggerAdaptation = () => {
  if (!selectedSystem.value) {
    ElMessage.warning('请先选择一个系统')
    return
  }

  ElMessage.info('触发系统适应功能开发中')
}

const monitorSystem = () => {
  if (!selectedSystem.value) {
    ElMessage.warning('请先选择一个系统')
    return
  }

  ElMessage.info('系统监控功能开发中')
}

const acknowledgeAlert = (alert: any) => {
  alert.acknowledged = true
  ElMessage.success('告警已确认')
}

const loadAnalytics = async () => {
  // 加载分析数据
  averagePerformance.value = 89.5
  learningRate.value = 2.3
  systemStability.value = 94.2
  resourceEfficiency.value = 87.8

  predictions.value = [
    { target: '模型性能', prediction: '92.3%', confidence: 0.87 },
    { target: '训练成本', prediction: '¥12,500', confidence: 0.92 },
    { target: '系统负载', prediction: '78%', confidence: 0.84 }
  ]

  recommendations.value = [
    {
      id: 1,
      title: '优化模型架构',
      description: '建议将Transformer模型替换为更轻量级的架构',
      expectedImpact: '性能提升15%，成本降低20%',
      priority: 'high'
    },
    {
      id: 2,
      title: '增加数据增强',
      description: '通过数据增强技术提升模型泛化能力',
      expectedImpact: '准确率提升3-5%',
      priority: 'medium'
    }
  ]

  nextTick(() => {
    renderAnalyticsCharts()
  })
}

const generateReport = () => {
  ElMessage.info('生成报告功能开发中')
}

const exportAnalytics = () => {
  ElMessage.info('导出分析数据功能开发中')
}

const runPredictions = async () => {
  try {
    const { data, success } = await learningEvolutionAPI.getLearningPredictions({
      type: 'performance',
      horizon: 'short',
      confidence: 0.8
    })

    if (success && data) {
      predictions.value = data.predictions
      ElMessage.success('预测分析完成')
    }
  } catch (error) {
    console.error('Run predictions failed:', error)
    ElMessage.error('预测分析失败')
  }
}

const handleExperimentCreated = () => {
  loadExperiments()
  ElMessage.success('实验创建成功')
}

const handleSystemCreated = () => {
  loadAdaptiveSystems()
  ElMessage.success('自适应系统创建成功')
}

const handlePopulationCreated = () => {
  loadEvolutionPopulations()
  ElMessage.success('进化种群创建成功')
}

const handleKnowledgeTransferCreated = () => {
  ElMessage.success('知识迁移任务创建成功')
}

const renderEvolutionChart = () => {
  if (!evolutionChart.value || !selectedPopulation.value) return

  const chart = echarts.init(evolutionChart.value)

  const option = {
    title: {
      text: '进化适应度趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['最佳适应度', '平均适应度'],
      bottom: 0
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 25 }, (_, i) => `第${i + 1}代`)
    },
    yAxis: {
      type: 'value',
      name: '适应度'
    },
    series: [
      {
        name: '最佳适应度',
        type: 'line',
        data: Array.from({ length: 25 }, () => Math.random() * 0.3 + 0.7),
        smooth: true,
        lineStyle: { color: '#5470c6' }
      },
      {
        name: '平均适应度',
        type: 'line',
        data: Array.from({ length: 25 }, () => Math.random() * 0.25 + 0.65),
        smooth: true,
        lineStyle: { color: '#91cc75' }
      }
    ]
  }

  chart.setOption(option)
}

const renderSystemCharts = () => {
  if (!performanceChart.value || !adaptationChart.value || !selectedSystem.value) return

  // 性能图表
  const perfChart = echarts.init(performanceChart.value)
  const perfOption = {
    title: { text: '系统性能监控', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['1小时前', '50分钟前', '40分钟前', '30分钟前', '20分钟前', '10分钟前', '现在'] },
    yAxis: { type: 'value', name: '性能分数' },
    series: [{
      name: '整体精度',
      type: 'line',
      data: [0.88, 0.89, 0.87, 0.90, 0.91, 0.90, 0.91],
      smooth: true,
      lineStyle: { color: '#5470c6' }
    }]
  }
  perfChart.setOption(perfOption)

  // 适应历史图表
  const adaptChart = echarts.init(adaptationChart.value)
  const adaptOption = {
    title: { text: '适应历史', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['1月1日', '1月3日', '1月5日', '1月7日', '1月8日'] },
    yAxis: { type: 'value', name: '适应次数' },
    series: [{
      name: '适应触发',
      type: 'bar',
      data: [2, 3, 1, 4, 2],
      itemStyle: { color: '#91cc75' }
    }]
  }
  adaptChart.setOption(adaptOption)
}

const renderAnalyticsCharts = () => {
  if (!performanceTrendChart.value || !learningEfficiencyChart.value || !resourceUsageChart.value) return

  // 性能趋势图表
  const trendChart = echarts.init(performanceTrendChart.value)
  const trendOption = {
    title: { text: '性能趋势', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
    yAxis: { type: 'value', name: '性能 (%)' },
    series: [{
      name: '平均性能',
      type: 'line',
      data: [85, 87, 86, 89, 88, 90, 89.5],
      smooth: true,
      lineStyle: { color: '#5470c6' }
    }]
  }
  trendChart.setOption(trendOption)

  // 学习效率图表
  const efficiencyChart = echarts.init(learningEfficiencyChart.value)
  const efficiencyOption = {
    title: { text: '学习效率', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['第1周', '第2周', '第3周', '第4周'] },
    yAxis: { type: 'value', name: '效率 (%)' },
    series: [{
      name: '学习效率',
      type: 'line',
      data: [65, 72, 78, 85],
      smooth: true,
      lineStyle: { color: '#91cc75' }
    }]
  }
  efficiencyChart.setOption(efficiencyOption)

  // 资源使用图表
  const resourceChart = echarts.init(resourceUsageChart.value)
  const resourceOption = {
    title: { text: '资源使用', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['CPU', '内存', 'GPU', '存储', '网络'] },
    yAxis: { type: 'value', name: '使用率 (%)' },
    series: [{
      name: '使用率',
      type: 'bar',
      data: [65, 78, 45, 82, 35],
      itemStyle: { color: '#fac858' }
    }]
  }
  resourceChart.setOption(resourceOption)
}

// 辅助方法
const getModelTypeTagType = (type: LearningType) => {
  const types: Record<string, string> = {
    supervised: 'primary',
    unsupervised: 'success',
    reinforcement: 'warning',
    transfer: 'info',
    federated: 'danger'
  }
  return types[type] || ''
}

const getModelTypeLabel = (type: LearningType) => {
  const labels: Record<string, string> = {
    supervised: '监督学习',
    unsupervised: '无监督学习',
    reinforcement: '强化学习',
    transfer: '迁移学习',
    federated: '联邦学习'
  }
  return labels[type] || type
}

const getDeploymentTagType = (status: string) => {
  const types: Record<string, string> = {
    draft: 'info',
    testing: 'warning',
    staging: 'primary',
    production: 'success',
    deprecated: 'danger'
  }
  return types[status] || ''
}

const getDeploymentLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: '草稿',
    testing: '测试中',
    staging: '预发布',
    production: '生产中',
    deprecated: '已废弃'
  }
  return labels[status] || status
}

const getStatusTagType = (status: LearningStatus) => {
  const types: Record<string, string> = {
    idle: 'info',
    training: 'warning',
    evaluating: 'primary',
    completed: 'success',
    failed: 'danger',
    paused: 'warning'
  }
  return types[status] || ''
}

const getStatusLabel = (status: LearningStatus) => {
  const labels: Record<string, string> = {
    idle: '空闲',
    training: '训练中',
    evaluating: '评估中',
    completed: '已完成',
    failed: '失败',
    paused: '已暂停'
  }
  return labels[status] || status
}

const getTypeTagType = (type: LearningType) => {
  const types: Record<string, string> = {
    supervised: 'primary',
    unsupervised: 'success',
    reinforcement: 'warning',
    transfer: 'info'
  }
  return types[type] || ''
}

const getTypeLabel = (type: LearningType) => {
  const labels: Record<string, string> = {
    supervised: '监督学习',
    unsupervised: '无监督学习',
    reinforcement: '强化学习',
    transfer: '迁移学习'
  }
  return labels[type] || type
}

const getStrategyTagType = (strategy: EvolutionStrategy) => {
  const types: Record<string, string> = {
    genetic_algorithm: 'primary',
    particle_swarm: 'success',
    differential_evolution: 'warning',
    neuroevolution: 'info',
    evolutionary_strategy: 'danger',
    coevolution: 'primary',
    multi_objective: 'success'
  }
  return types[strategy] || ''
}

const getStrategyLabel = (strategy: EvolutionStrategy) => {
  const labels: Record<string, string> = {
    genetic_algorithm: '遗传算法',
    particle_swarm: '粒子群',
    differential_evolution: '差分进化',
    neuroevolution: '神经进化',
    evolutionary_strategy: '进化策略',
    coevolution: '协同进化',
    multi_objective: '多目标'
  }
  return labels[strategy] || strategy
}

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 生命周期
onMounted(async () => {
  await Promise.all([
    loadModels(),
    loadExperiments(),
    loadEvolutionPopulations(),
    loadAdaptiveSystems(),
    loadAnalytics()
  ])
})
</script>

<style scoped lang="scss">
.learning-evolution-management {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  background: white;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .title-section {
    .page-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 8px 0;
      font-size: 24px;
      color: #2c3e50;
    }

    .page-description {
      margin: 0;
      color: #606266;
      font-size: 14px;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }
}

.models-view {
  .model-filters {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .model-stats-cards {
    margin-bottom: 24px;

    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 16px;

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: white;
      }

      &.total .stat-icon {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.production .stat-icon {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      &.training .stat-icon {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      &.performance .stat-icon {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }

      .stat-content {
        h3 {
          margin: 0 0 4px 0;
          font-size: 28px;
          font-weight: bold;
          color: #2c3e50;
        }

        p {
          margin: 0;
          color: #606266;
          font-size: 14px;
        }
      }
    }
  }

  .models-list {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .model-pagination {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
}

.experiments-view {
  .experiments-header {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .experiments-filters {
      .el-row {
        align-items: center;
      }
    }
  }

  .experiments-grid {
    .experiment-col {
      margin-bottom: 16px;
    }

    .experiment-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }

      .experiment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        h4 {
          margin: 0;
          color: #2c3e50;
        }
      }

      .experiment-description {
        margin-bottom: 16px;

        p {
          margin: 0;
          color: #6b7280;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }

      .experiment-details {
        margin-bottom: 16px;

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 13px;

          .label {
            color: #909399;
          }

          .value {
            color: #2c3e50;
            font-weight: 500;
          }

          .progress-indicator {
            display: flex;
            align-items: center;
            gap: 8px;

            .progress-text {
              font-size: 12px;
              color: #6b7280;
            }
          }
        }
      }

      .experiment-metrics {
        margin-bottom: 16px;

        h5 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #374151;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;

          .metric-item {
            display: flex;
            justify-content: space-between;
            font-size: 12px;

            .metric-name {
              color: #6b7280;
            }

            .metric-value {
              color: #2c3e50;
              font-weight: 500;
            }
          }
        }
      }

      .experiment-actions {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
      }

      .experiment-status-indicators {
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #909399;

          &.training {
            color: #e6a23c;
          }

          &.completed {
            color: #67c23a;
          }

          .animate-spin {
            animation: spin 1s linear infinite;
          }
        }
      }
    }
  }
}

.evolution-view {
  .evolution-controls {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    gap: 12px;
  }

  .evolution-grid {
    .evolution-panel {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 16px;

      h3 {
        margin: 0 0 16px 0;
        color: #2c3e50;
      }

      .population-list {
        .population-item {
          padding: 12px;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            background: #f8f9fa;
          }

          &.active {
            border-color: #409eff;
            background: #ecf5ff;
          }

          .population-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            h4 {
              margin: 0;
              font-size: 14px;
              color: #2c3e50;
            }
          }

          .population-stats {
            .stat-row {
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 2px;
            }
          }
        }
      }

      .evolution-chart {
        height: 300px;
      }
    }

    .population-details {
      .individuals-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;

        .individual-card {
          padding: 12px;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 6px;

          .individual-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 12px;
          }

          .individual-genome {
            .genome-preview {
              font-size: 10px;
              color: #6b7280;
              word-break: break-all;
            }
          }
        }
      }

      .no-selection {
        text-align: center;
        padding: 40px;
        color: #909399;
      }
    }
  }
}

.adaptive-view {
  .adaptive-header {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .adaptive-controls {
      display: flex;
      gap: 12px;
    }
  }

  .adaptive-systems-grid {
    .system-col {
      margin-bottom: 16px;
    }

    .system-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }

      .system-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        h4 {
          margin: 0;
          color: #2c3e50;
        }

        .system-status {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #909399;

          .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #909399;

            &.active {
              background: #67c23a;
              animation: pulse 2s infinite;
            }
          }
        }
      }

      .system-description {
        margin-bottom: 16px;

        p {
          margin: 0;
          color: #6b7280;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }

      .system-performance {
        margin-bottom: 16px;

        .performance-metric {
          margin-bottom: 8px;

          .metric-label {
            display: block;
            margin-bottom: 4px;
            font-size: 13px;
            color: #6b7280;
          }
        }
      }

      .system-last-adaptation {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .system-monitoring {
    background: white;
    padding: 24px;
    border-radius: 8px;
    margin-top: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .monitoring-header {
      margin-bottom: 20px;

      h3 {
        margin: 0;
        color: #2c3e50;
      }
    }

    .monitoring-panel {
      margin-bottom: 20px;

      h4 {
        margin: 0 0 16px 0;
        color: #374151;
      }

      .chart-container {
        height: 250px;
      }
    }

    .alerts-panel {
      h4 {
        margin: 0 0 16px 0;
        color: #374151;
      }

      .alerts-list {
        .alert-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 8px;

          &.warning {
            background: #fdf6ec;
            border: 1px solid #faecd8;
          }

          &.error {
            background: #fef0f0;
            border: 1px solid #fde2e2;
          }

          .alert-content {
            flex: 1;

            .alert-message {
              display: block;
              margin-bottom: 4px;
              font-size: 14px;
              color: #374151;
            }

            .alert-time {
              font-size: 12px;
              color: #909399;
            }
          }
        }
      }
    }
  }
}

.analytics-view {
  .analytics-controls {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .el-row {
      align-items: center;
    }
  }

  .analytics-content {
    .analytics-charts {
      .el-card {
        margin-bottom: 16px;

        .chart-container {
          height: 300px;
        }
      }
    }

    .analytics-summary {
      .el-card {
        margin-bottom: 16px;

        .summary-metrics {
          .summary-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 14px;

            .summary-label {
              color: #6b7280;
            }

            .summary-value {
              color: #2c3e50;
              font-weight: 600;
            }
          }
        }

        .recommendations {
          .recommendation-item {
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 12px;

            &.high {
              background: #fef0f0;
              border: 1px solid #fde2e2;
            }

            &.medium {
              background: #fdf6ec;
              border: 1px solid #faecd8;
            }

            .recommendation-content {
              margin-bottom: 8px;

              h5 {
                margin: 0 0 4px 0;
                font-size: 14px;
                color: #374151;
              }

              p {
                margin: 0;
                font-size: 13px;
                color: #6b7280;
              }
            }

            .recommendation-impact {
              font-size: 12px;
              color: #909399;
            }
          }
        }

        .predictions {
          .prediction-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            font-size: 14px;

            .prediction-target {
              color: #6b7280;
            }

            .prediction-value {
              text-align: right;

              strong {
                display: block;
                color: #2c3e50;
                font-size: 16px;
              }

              small {
                color: #909399;
              }
            }
          }
        }
      }
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(103, 194, 58, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(103, 194, 58, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(103, 194, 58, 0);
  }
}
</style>