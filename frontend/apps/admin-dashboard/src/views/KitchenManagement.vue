<!--
 * @fileoverview YYC³餐饮行业智能化平台 - 厨房管理页面
 * @description 厨房任务管理、员工分配、效率监控等功能
 * @module KitchenManagement
 * @author YYC³
 * @version 1.0.0
 * @created 2024-01-01
 * @updated 2024-01-01
-->
<template>
  <div class="kitchen-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">厨房管理</h1>
        <p class="page-description">管理厨房任务、员工分配和效率监控</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateTaskDialog">
          <el-icon><Plus /></el-icon>
          新建任务
        </el-button>
        <el-button @click="showBulkOperationDialog">
          <el-icon><Operation /></el-icon>
          批量操作
        </el-button>
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-container">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon active-tasks">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ kitchenStats.activeTasks }}</div>
                <div class="stat-label">进行中任务</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon completed">
                <el-icon><Check /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ kitchenStats.completedToday }}</div>
                <div class="stat-label">今日完成</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon efficiency">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ kitchenStats.efficiencyRate.toFixed(1) }}%</div>
                <div class="stat-label">效率率</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon average-time">
                <el-icon><Timer /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ (kitchenStats.averagePreparationTime / 60).toFixed(1) }}min</div>
                <div class="stat-label">平均时间</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 功能标签页 -->
    <el-card class="main-content">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 任务管理 -->
        <el-tab-pane label="任务管理" name="tasks">
          <div class="tab-header">
            <div class="tab-left">
              <div class="tab-title">厨房任务</div>
              <div class="filter-controls">
                <el-select
                  v-model="taskFilter.station"
                  placeholder="工作岗位"
                  clearable
                  style="width: 150px"
                  @change="handleTaskSearch"
                >
                  <el-option label="热菜" value="hot_dish" />
                  <el-option label="凉菜" value="cold_dish" />
                  <el-option label="汤类" value="soup" />
                  <el-option label="吧台" value="bar" />
                  <el-option label="点心" value="dessert" />
                  <el-option label="综合" value="general" />
                </el-select>
                <el-select
                  v-model="taskFilter.status"
                  placeholder="任务状态"
                  clearable
                  style="width: 120px"
                  @change="handleTaskSearch"
                >
                  <el-option label="待处理" value="pending" />
                  <el-option label="制作中" value="preparing" />
                  <el-option label="已完成" value="ready" />
                  <el-option label="已上菜" value="served" />
                  <el-option label="已取消" value="cancelled" />
                </el-select>
                <el-select
                  v-model="taskFilter.priority"
                  placeholder="优先级"
                  clearable
                  style="width: 120px"
                  @change="handleTaskSearch"
                >
                  <el-option label="低" value="low" />
                  <el-option label="普通" value="normal" />
                  <el-option label="高" value="high" />
                  <el-option label="紧急" value="urgent" />
                </el-select>
                <el-input
                  v-model="taskFilter.search"
                  placeholder="搜索菜品或订单号"
                  clearable
                  style="width: 200px"
                  @change="handleTaskSearch"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </div>
            </div>
            <div class="tab-right">
              <el-button-group>
                <el-button
                  :type="taskViewMode === 'list' ? 'primary' : 'default'"
                  @click="taskViewMode = 'list'"
                >
                  <el-icon><List /></el-icon>
                </el-button>
                <el-button
                  :type="taskViewMode === 'kanban' ? 'primary' : 'default'"
                  @click="taskViewMode = 'kanban'"
                >
                  <el-icon><Grid /></el-icon>
                </el-button>
              </el-button-group>
            </div>
          </div>

          <!-- 列表视图 -->
          <div v-if="taskViewMode === 'list'" class="task-table">
            <el-table :data="tasks" v-loading="tasksLoading" row-key="id">
              <el-table-column prop="taskId" label="任务编号" width="120" />
              <el-table-column prop="orderNo" label="订单号" width="140" />
              <el-table-column prop="itemName" label="菜品名称" min-width="150" />
              <el-table-column prop="quantity" label="数量" width="80" />
              <el-table-column label="岗位" width="100">
                <template #default="{ row }">
                  <el-tag :type="getStationTagType(row.station)">
                    {{ getStationName(row.station) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="优先级" width="80">
                <template #default="{ row }">
                  <el-tag :type="getPriorityTagType(row.priority)" size="small">
                    {{ getPriorityName(row.priority) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getStatusTagType(row.status)">
                    {{ getStatusName(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="tableNumber" label="桌号" width="80" />
              <el-table-column label="预计时间" width="100">
                <template #default="{ row }">
                  <span v-if="row.estimatedTime">
                    {{ formatTime(row.estimatedTime) }}
                  </span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="分配给" width="100">
                <template #default="{ row }">
                  <span v-if="row.assignedTo">
                    {{ getStaffName(row.assignedTo) }}
                  </span>
                  <span v-else class="text-muted">未分配</span>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="创建时间" width="180">
                <template #default="{ row }">
                  {{ formatDateTime(row.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                  <el-button size="small" @click="viewTask(row)">
                    详情
                  </el-button>
                  <el-button
                    v-if="row.status === 'pending'"
                    size="small"
                    type="primary"
                    @click="startTask(row)"
                  >
                    开始
                  </el-button>
                  <el-button
                    v-if="row.status === 'preparing'"
                    size="small"
                    type="success"
                    @click="completeTask(row)"
                  >
                    完成
                  </el-button>
                  <el-button
                    size="small"
                    type="warning"
                    @click="openAssignDialog(row)"
                  >
                    分配
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="taskPagination.page"
                v-model:page-size="taskPagination.limit"
                :total="taskPagination.total"
                :page-sizes="[20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleTaskPageSizeChange"
                @current-change="handleTaskPageChange"
              />
            </div>
          </div>

          <!-- 看板视图 -->
          <div v-else class="kanban-board">
            <div class="kanban-columns">
              <div
                v-for="status in kanbanColumns"
                :key="status.value"
                class="kanban-column"
              >
                <div class="kanban-header">
                  <h3>{{ status.label }}</h3>
                  <el-badge :value="getTaskCountByStatus(status.value)" class="status-badge" />
                </div>
                <div class="kanban-content" @drop="handleDrop($event, status.value)">
                  <div
                    v-for="task in getTasksByStatus(status.value)"
                    :key="task.id"
                    class="kanban-card"
                    draggable="true"
                    @dragstart="handleDragStart($event, task)"
                    @click="viewTask(task)"
                  >
                    <div class="card-header">
                      <div class="task-info">
                        <span class="task-name">{{ task.itemName }}</span>
                        <el-tag :type="getPriorityTagType(task.priority)" size="small">
                          {{ getPriorityName(task.priority) }}
                        </el-tag>
                      </div>
                      <div class="task-meta">
                        <span class="order-no">{{ task.orderNo }}</span>
                        <span class="table-number">{{ task.tableNumber }}</span>
                      </div>
                    </div>
                    <div class="card-content">
                      <div class="task-details">
                        <div class="detail-item">
                          <span class="label">数量:</span>
                          <span class="value">{{ task.quantity }}</span>
                        </div>
                        <div class="detail-item">
                          <span class="label">岗位:</span>
                          <el-tag :type="getStationTagType(task.station)" size="small">
                            {{ getStationName(task.station) }}
                          </el-tag>
                        </div>
                        <div v-if="task.specialRequests" class="detail-item">
                          <span class="label">要求:</span>
                          <span class="value text-ellipsis">{{ task.specialRequests }}</span>
                        </div>
                        <div v-if="task.assignedTo" class="detail-item">
                          <span class="label">分配:</span>
                          <span class="value">{{ getStaffName(task.assignedTo) }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="card-footer">
                      <div class="task-actions">
                        <el-button
                          v-if="task.status === 'pending'"
                          size="small"
                          type="primary"
                          @click.stop="startTask(task)"
                        >
                          开始
                        </el-button>
                        <el-button
                          v-if="task.status === 'preparing'"
                          size="small"
                          type="success"
                          @click.stop="completeTask(task)"
                        >
                          完成
                        </el-button>
                        <el-button
                          size="small"
                          @click.stop="openAssignDialog(task)"
                        >
                          分配
                        </el-button>
                      </div>
                      <div class="task-time">
                        <span v-if="task.estimatedTime">
                          <el-icon><Clock /></el-icon>
                          {{ formatTime(task.estimatedTime) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 员工管理 -->
        <el-tab-pane label="员工管理" name="staff">
          <div class="tab-header">
            <div class="tab-title">厨房员工</div>
            <div class="tab-actions">
              <el-button @click="refreshStaffData">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </div>

          <el-row :gutter="20">
            <el-col
              v-for="staff in kitchenStaff"
              :key="staff.id"
              :span="6"
            >
              <el-card class="staff-card" :class="{ 'status-break': staff.status === 'break', 'status-offline': staff.status === 'offline', 'status-busy': staff.status === 'busy' }">
                <div class="staff-header">
                  <el-avatar :src="staff.avatar" :size="40">
                    {{ staff.name.charAt(0) }}
                  </el-avatar>
                  <div class="staff-info">
                    <h4>{{ staff.name }}</h4>
                    <div class="staff-status">
                      <el-tag
                        :type="getStaffStatusType(staff.status)"
                        size="small"
                      >
                        {{ getStaffStatusName(staff.status) }}
                      </el-tag>
                    </div>
                  </div>
                </div>
                <div class="staff-stats">
                  <div class="stat-item">
                    <span class="stat-value">{{ staff.currentTasks }}</span>
                    <span class="stat-label">当前任务</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ staff.totalTasksCompleted }}</span>
                    <span class="stat-label">完成总数</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ staff.efficiency.toFixed(1) }}%</span>
                    <span class="stat-label">效率</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ formatTime(staff.averageTime) }}</span>
                    <span class="stat-label">平均时间</span>
                  </div>
                </div>
                <div class="staff-actions">
                  <el-button size="small" @click="updateStaffStatus(staff)">
                    状态
                  </el-button>
                  <el-button size="small" @click="viewStaffTasks(staff)">
                    任务
                  </el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>

        <!-- 数据分析 -->
        <el-tab-pane label="数据分析" name="analytics">
          <div class="tab-header">
            <div class="tab-title">厨房数据统计</div>
            <div class="tab-actions">
              <el-date-picker
                v-model="analyticsDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="refreshAnalytics"
              />
              <el-button @click="refreshAnalytics">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </div>

          <div class="analytics-content">
            <!-- 任务分布图 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-card title="任务状态分布">
                  <div class="chart-container">
                    <div
                      ref="taskStatusChart"
                      style="height: 300px;"
                    ></div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card title="岗位任务分布">
                  <div class="chart-container">
                    <div
                      ref="stationChart"
                      style="height: 300px;"
                    ></div>
                  </div>
                </el-card>
              </el-col>
            </el-row>

            <!-- 员工效率分析 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-card title="员工效率排名">
                  <div class="chart-container">
                    <div
                      ref="staffEfficiencyChart"
                      style="height: 400px;"
                    ></div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card title="高峰时段分析">
                  <div class="chart-container">
                    <div
                      ref="peakHoursChart"
                      style="height: 400px;"
                    ></div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 显示配置 -->
        <el-tab-pane label="显示配置" name="displays">
          <div class="tab-header">
            <div class="tab-title">厨房显示配置</div>
            <div class="tab-actions">
              <el-button type="primary" @click="showCreateDisplayDialog">
                <el-icon><Plus /></el-icon>
                新增显示
              </el-button>
            </div>
          </div>

          <el-table :data="kitchenDisplays" v-loading="displaysLoading">
            <el-table-column prop="displayName" label="显示名称" />
            <el-table-column label="岗位" width="120">
              <template #default="{ row }">
                <el-tag v-if="row.station">
                  {{ getStationName(row.station) }}
                </el-tag>
                <span v-else>全部</span>
              </template>
            </el-table-column>
            <el-table-column label="布局" width="100">
              <template #default="{ row }">
                <el-tag>{{ row.layout === 'grid' ? '网格' : row.layout === 'list' ? '列表' : '看板' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="刷新间隔" width="100">
              <template #default="{ row }">
                {{ row.refreshInterval }}秒
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.isActive ? 'success' : 'info'">
                  {{ row.isActive ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="editDisplay(row)">
                  编辑
                </el-button>
                <el-button
                  size="small"
                  :type="row.isActive ? 'warning' : 'success'"
                  @click="toggleDisplay(row)"
                >
                  {{ row.isActive ? '禁用' : '启用' }}
                </el-button>
                <el-button size="small" type="danger" @click="deleteDisplay(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 创建任务对话框 -->
    <el-dialog
      v-model="taskDialogVisible"
      :title="isEditingTask ? '编辑任务' : '创建任务'"
      width="800px"
    >
      <el-form :model="taskForm" :rules="taskRules" ref="taskFormRef" label-width="100px">
        <el-form-item label="菜品名称" prop="itemName">
          <el-input v-model="taskForm.itemName" placeholder="输入菜品名称" />
        </el-form-item>
        <el-form-item label="订单号" prop="orderNo">
          <el-input v-model="taskForm.orderNo" placeholder="输入订单号" />
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="taskForm.quantity" :min="1" style="width: 200px" />
        </el-form-item>
        <el-form-item label="工作岗位" prop="station">
          <el-select v-model="taskForm.station" placeholder="选择工作岗位" style="width: 200px">
            <el-option label="热菜" value="hot_dish" />
            <el-option label="凉菜" value="cold_dish" />
            <el-option label="汤类" value="soup" />
            <el-option label="吧台" value="bar" />
            <el-option label="点心" value="dessert" />
            <el-option label="综合" value="general" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="taskForm.priority" placeholder="选择优先级" style="width: 200px">
            <el-option label="低" value="low" />
            <el-option label="普通" value="normal" />
            <el-option label="高" value="high" />
            <el-option label="紧急" value="urgent" />
          </el-select>
        </el-form-item>
        <el-form-item label="预计时间" prop="estimatedTime">
          <el-input-number
            v-model="taskForm.estimatedTime"
            :min="1"
            placeholder="分钟"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="分配给" prop="assignedTo">
          <el-select v-model="taskForm.assignedTo" placeholder="选择员工" clearable style="width: 200px">
            <el-option
              v-for="staff in activeKitchenStaff"
              :key="staff.id"
              :label="staff.name"
              :value="staff.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="特殊要求">
          <el-input
            v-model="taskForm.specialInstructions"
            type="textarea"
            :rows="3"
            placeholder="输入特殊制作要求"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="taskDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTaskForm" :loading="taskFormLoading">
          {{ isEditingTask ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量操作对话框 -->
    <el-dialog
      v-model="bulkOperationDialogVisible"
      title="批量操作"
      width="600px"
    >
      <el-form :model="bulkOperationForm" label-width="100px">
        <el-form-item label="操作类型">
          <el-radio-group v-model="bulkOperationForm.operation">
            <el-radio label="assign">分配员工</el-radio>
            <el-radio label="update_status">更新状态</el-radio>
            <el-radio label="priority">设置优先级</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="bulkOperationForm.operation === 'assign'" label="分配给">
          <el-select v-model="bulkOperationForm.assignedTo" placeholder="选择员工" style="width: 200px">
            <el-option
              v-for="staff in activeKitchenStaff"
              :key="staff.id"
              :label="staff.name"
              :value="staff.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="bulkOperationForm.operation === 'update_status'" label="状态">
          <el-select v-model="bulkOperationForm.status" placeholder="选择状态" style="width: 200px">
            <el-option label="待处理" value="pending" />
            <el-option label="制作中" value="preparing" />
            <el-option label="已完成" value="ready" />
            <el-option label="已上菜" value="served" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="bulkOperationForm.operation === 'priority'" label="优先级">
          <el-select v-model="bulkOperationForm.priority" placeholder="选择优先级" style="width: 200px">
            <el-option label="低" value="low" />
            <el-option label="普通" value="normal" />
            <el-option label="高" value="high" />
            <el-option label="紧急" value="urgent" />
          </el-select>
        </el-form-item>

        <el-form-item label="任务ID">
          <el-input
            v-model="bulkOperationForm.taskIds"
            type="textarea"
            :rows="4"
            placeholder="输入任务ID，用逗号分隔"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="bulkOperationDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="executeBulkOperation" :loading="bulkOperationLoading">
          执行
        </el-button>
      </template>
    </el-dialog>

    <!-- 任务详情对话框 -->
    <el-dialog v-model="taskDetailVisible" title="任务详情" width="800px">
      <div v-if="selectedTask" class="task-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="任务编号">
            {{ selectedTask.taskId }}
          </el-descriptions-item>
          <el-descriptions-item label="订单号">
            {{ selectedTask.orderNo }}
          </el-descriptions-item>
          <el-descriptions-item label="菜品名称">
            {{ selectedTask.itemName }}
          </el-descriptions-item>
          <el-descriptions-item label="数量">
            {{ selectedTask.quantity }}
          </el-descriptions-item>
          <el-descriptions-item label="岗位">
            <el-tag :type="getStationTagType(selectedTask.station)">
              {{ getStationName(selectedTask.station) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag :type="getPriorityTagType(selectedTask.priority)">
              {{ getPriorityName(selectedTask.priority) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(selectedTask.status)">
              {{ getStatusName(selectedTask.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="桌号" v-if="selectedTask.tableNumber">
            {{ selectedTask.tableNumber }}
          </el-descriptions-item>
          <el-descriptions-item label="订单类型">
            {{ selectedTask.orderType }}
          </el-descriptions-item>
          <el-descriptions-item label="预计时间" v-if="selectedTask.estimatedTime">
            {{ formatTime(selectedTask.estimatedTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="实际时间" v-if="selectedTask.actualTime">
            {{ formatTime(selectedTask.actualTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="分配给" v-if="selectedTask.assignedTo">
            {{ getStaffName(selectedTask.assignedTo) }}
          </el-descriptions-item>
          <el-descriptions-item label="开始时间" v-if="selectedTask.startedAt">
            {{ formatDateTime(selectedTask.startedAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="完成时间" v-if="selectedTask.completedAt">
            {{ formatDateTime(selectedTask.completedAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="特殊要求" v-if="selectedTask.specialRequests">
            {{ selectedTask.specialRequests }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDateTime(selectedTask.createdAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 员工分配对话框 -->
    <el-dialog v-model="assignDialogVisible" title="分配任务" width="500px">
      <el-form :model="assignForm" label-width="80px">
        <el-form-item label="员工">
          <el-select v-model="assignForm.staffId" placeholder="选择员工">
            <el-option
              v-for="staff in activeKitchenStaff"
              :key="staff.id"
              :label="staff.name"
              :value="staff.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="assignForm.note"
            type="textarea"
            :rows="3"
            placeholder="分配备注（可选）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAssignment" :loading="assignFormLoading">
          确认分配
        </el-button>
      </template>
    </el-dialog>

    <!-- 员工状态对话框 -->
    <el-dialog v-model="staffStatusDialogVisible" title="更新员工状态" width="400px">
      <el-form :model="staffStatusForm" label-width="80px">
        <el-form-item label="员工">
          <span>{{ staffStatusForm.name }}</span>
        </el-form-item>
        <el-form-item label="新状态">
          <el-radio-group v-model="staffStatusForm.status">
            <el-radio label="online">工作</el-radio>
            <el-radio label="busy">忙碌</el-radio>
            <el-radio label="break">休息</el-radio>
            <el-radio label="offline">离线</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="staffStatusDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmStaffStatusUpdate" :loading="staffStatusFormLoading">
          确认更新
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { useKitchen } from '@/composables/useKitchen'
import type {
  KitchenTask,
  KitchenEmployee,
  TaskStation,
  TaskPriority,
  TaskStatus,
  EmployeeStatus
} from '@/types/kitchen'

const {
  loading,
  stats,
  tasks,
  employees,
  taskPagination,
  loadStats,
  loadTasks,
  loadEmployees,
  updateTaskStatus,
  assignTask: assignTaskAPI,
  updateEmployeeStatus,
  deleteTask: deleteTaskAPI,
  createTask,
  updateTask,
  createDisplay,
  updateDisplay,
  deleteDisplay: deleteDisplayAPI,
  loadDisplays,
  refreshData
} = useKitchen()

// 响应式数据
const activeTab = ref('tasks')
const taskViewMode = ref('list')
const kitchenStaff = ref<KitchenEmployee[]>([])
const kitchenStats = reactive({
  activeTasks: 0,
  completedToday: 0,
  efficiencyRate: 0,
  averagePreparationTime: 0,
  tasksByStation: {} as any,
  tasksByStatus: {} as any,
  staffPerformance: [],
  peakHours: []
})
const kitchenDisplays = ref<any[]>([])
const analyticsDateRange = ref<[string, string]>(['', ''])

const kanbanColumns = ref([
  { value: 'pending', label: '待处理' },
  { value: 'preparing', label: '制作中' },
  { value: 'ready', label: '已完成' },
  { value: 'served', label: '已上菜' }
])

const taskFilter = reactive({
  station: '',
  status: '',
  priority: '',
  search: ''
})

// 对话框状态
const taskDialogVisible = ref(false)
const bulkOperationDialogVisible = ref(false)
const taskDetailVisible = ref(false)
const assignDialogVisible = ref(false)
const staffStatusDialogVisible = ref(false)
const displayDialogVisible = ref(false)

// 表单数据
const taskFormRef = ref()
const displayForm = ref<Partial<KitchenDisplay>>({
  displayName: '',
  displayType: 'task_board',
  position: 'kitchen_main',
  content: {},
  isActive: true
})
const assignForm = reactive({
  taskId: '',
  staffId: '',
  note: ''
})

const staffStatusForm = reactive({
  staffId: '',
  name: '',
  status: 'online' as EmployeeStatus
})

const bulkOperationForm = reactive({
  operation: 'assign',
  taskIds: '',
  assignedTo: null,
  status: '',
  priority: ''
})

const taskForm = reactive<Partial<KitchenTask>>({
  itemName: '',
  orderNo: '',
  quantity: 1,
  station: 'general' as TaskStation,
  priority: 'normal' as TaskPriority,
  estimatedTime: null,
  assignedTo: undefined,
  specialRequests: ''
})

const selectedTask = ref<KitchenTask | null>(null)
const selectedTasks = ref<string[]>([])
const isEditingTask = ref(false)

const taskFormLoading = ref(false)
const bulkOperationLoading = ref(false)
const assignFormLoading = ref(false)
const staffStatusFormLoading = ref(false)

const taskStatusChart = ref<echarts.EChartsType>()
const stationChart = ref<echarts.EChartsType>()
const staffEfficiencyChart = ref<echarts.EChartsType>()
const peakHoursChart = ref<echarts.EChartsType>()

const activeKitchenStaff = computed(() =>
  kitchenStaff.value.filter(staff => staff.status === 'online')
)

const loadStaff = async () => {
  const response = await loadEmployees()
  if (response) {
    kitchenStaff.value = response
  }
}

const refreshStaffData = () => {
  loadStaff()
}

const refreshAnalytics = () => {
  loadStats()
  nextTick(() => {
    initCharts()
  })
}

const showCreateTaskDialog = () => {
  isEditingTask.value = false
  Object.assign(taskForm, {
    itemName: '',
    orderNo: '',
    quantity: 1,
    station: 'general' as TaskStation,
    priority: 'normal' as TaskPriority,
    estimatedTime: null,
    assignedTo: undefined,
    specialRequests: ''
  })
  taskDialogVisible.value = true
}

const editTask = (task: KitchenTask) => {
  isEditingTask.value = true
  Object.assign(taskForm, task)
  taskDialogVisible.value = true
}

const viewTask = (task: KitchenTask) => {
  selectedTask.value = task
  taskDetailVisible.value = true
}

const startTask = async (task: KitchenTask) => {
  try {
    await updateTaskStatus(task.id, 'preparing')
    ElMessage.success('任务已开始')
    loadTasks()
    loadStats()
  } catch (error) {
    console.error('Start task failed:', error)
    ElMessage.error('开始任务失败')
  }
}

const completeTask = async (task: KitchenTask) => {
  try {
    await updateTaskStatus(task.id, 'ready')
    ElMessage.success('任务已完成')
    loadTasks()
    loadStats()
  } catch (error) {
    console.error('Complete task failed:', error)
    ElMessage.error('完成任务失败')
  }
}

const openAssignDialog = (task: KitchenTask) => {
  selectedTask.value = task
  assignForm.taskId = task.id
  assignForm.staffId = task.assignedTo || ''
  assignForm.note = ''
  assignDialogVisible.value = true
}

const confirmAssignment = async () => {
  if (!assignForm.staffId) {
    ElMessage.warning('请选择员工')
    return
  }

  try {
    await assignTaskAPI(assignForm.taskId, assignForm.staffId)
    ElMessage.success('任务已分配')
    assignDialogVisible.value = false
    loadTasks()
    if (selectedTask.value) {
      selectedTask.value.assignedTo = assignForm.staffId
    }
  } catch (error) {
    console.error('Assign task failed:', error)
    ElMessage.error('分配任务失败')
  }
}

const deleteTaskLocal = async (task: KitchenTask) => {
  try {
    await ElMessageBox.confirm(`确定要删除任务"${task.itemName}"吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteTaskAPI(task.id)
    ElMessage.success('任务删除成功')
    loadTasks()
    loadStats()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete task failed:', error)
      ElMessage.error('删除任务失败')
    }
  }
}

const showBulkOperationDialog = () => {
  selectedTasks.value = []
  bulkOperationDialogVisible.value = true
}

const executeBulkOperation = async () => {
  try {
    if (selectedTasks.value.length === 0) {
      ElMessage.warning('请选择要操作的任务')
      return
    }

    await ElMessageBox.confirm(`确定要对选中的 ${selectedTasks.value.length} 个任务执行批量操作吗？`, '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const taskIds = selectedTasks.value.map(task => task.id)
    await updateTaskStatus(taskIds[0], 'ready')
    ElMessage.success('批量操作成功')
    loadTasks()
    loadStats()
    bulkOperationDialogVisible.value = false
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Bulk operation failed:', error)
      ElMessage.error('批量操作失败')
    }
  }
}

const updateStaffStatus = (staff: KitchenEmployee) => {
  staffStatusForm.staffId = staff.id
  staffStatusForm.name = staff.name
  staffStatusForm.status = staff.status
  staffStatusDialogVisible.value = true
}

const confirmStaffStatusUpdate = async () => {
  try {
    await updateEmployeeStatus(staffStatusForm.staffId, staffStatusForm.status)
    const staff = kitchenStaff.value.find(s => s.id === staffStatusForm.staffId)
    if (staff) {
      staff.status = staffStatusForm.status
    }
    ElMessage.success('状态已更新')
    staffStatusDialogVisible.value = false
  } catch (error) {
    console.error('Update staff status failed:', error)
    ElMessage.error('更新状态失败')
  }
}

const viewStaffTasks = (staff: KitchenEmployee) => {
  taskFilter.search = staff.name
  taskPagination.value.page = 1
  loadTasks()
}

const showCreateDisplayDialog = () => {
  displayForm.value = {
    displayName: '',
    displayType: 'task_board',
    position: 'kitchen_main',
    content: {},
    isActive: true
  }
  displayDialogVisible.value = true
}

const editDisplay = (display: any) => {
  displayForm.value = { ...display }
  displayDialogVisible.value = true
}

const toggleDisplay = async (display: any) => {
  try {
    await updateDisplay(display.id, { isActive: !display.isActive })
    display.isActive = !display.isActive
    ElMessage.success('显示状态已更新')
  } catch (error) {
    console.error('Toggle display failed:', error)
    ElMessage.error('更新显示状态失败')
  }
}

const deleteDisplayLocal = async (display: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除显示"${display.displayName}"吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteDisplay(display.id)
    ElMessage.success('显示删除成功')
    loadDisplays()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete display failed:', error)
      ElMessage.error('删除显示失败')
    }
  }
}

const saveTaskForm = async () => {
  try {
    taskFormLoading.value = true
    if (isEditingTask.value) {
      await updateTask(selectedTask.value!.id, taskForm)
      ElMessage.success('任务更新成功')
    } else {
      await createTask(taskForm)
      ElMessage.success('任务创建成功')
    }
    taskDialogVisible.value = false
    loadTasks()
    loadStats()
  } catch (error) {
    console.error('Save task failed:', error)
    ElMessage.error('保存任务失败')
  } finally {
    taskFormLoading.value = false
  }
}

const handleTaskSearch = () => {
  taskPagination.page = 1
  loadTasks()
}

const handleTaskPageSizeChange = (size: number) => {
  taskPagination.value.limit = size
  taskPagination.value.page = 1
  loadTasks()
}

const handleTaskPageChange = (page: number) => {
  taskPagination.value.page = page
  loadTasks()
}

const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
  if (tabName === 'tasks') {
    loadTasks()
  } else if (tabName === 'staff') {
    loadStaff()
  } else if (tabName === 'analytics') {
    loadStats()
    nextTick(() => {
      initCharts()
    })
  }
}

// 拖拽排序方法
const handleDragStart = (event: DragEvent, task: KitchenTask) => {
  event.dataTransfer?.setData('text/plain', JSON.stringify(task))
}

const handleDrop = (event: DragEvent, status: TaskStatus) => {
  event.preventDefault()
  const taskData = event.dataTransfer?.getData('text/plain')
  if (taskData) {
    try {
      const task = JSON.parse(taskData)
      updateTaskStatus(task, status)
    } catch (error) {
      console.error('Parse task data failed:', error)
    }
  }
}

const handleTaskStatusChange = async (task: KitchenTask, status: TaskStatus) => {
  try {
    await updateTaskStatus(task.id, status)
    task.status = status
  } catch (error) {
    console.error('Update task status failed:', error)
  }
}

const getStationName = (station: TaskStation): string => {
  const names: Record<TaskStation, string> = {
    'hot_dish': '热菜',
    'cold_dish': '凉菜',
    'soup': '汤类',
    'bar': '吧台',
    'dessert': '点心',
    'general': '综合'
  }
  return names[station] || station
}

const getStationTagType = (station: TaskStation): string => {
  const types: Record<TaskStation, string> = {
    'hot_dish': 'danger',
    'cold_dish': 'info',
    'soup': 'warning',
    'bar': 'success',
    'dessert': 'warning',
    'general': ''
  }
  return types[station] || ''
}

const getPriorityName = (priority: TaskPriority): string => {
  const names: Record<TaskPriority, string> = {
    'low': '低',
    'normal': '普通',
    'high': '高',
    'urgent': '紧急'
  }
  return names[priority] || priority
}

const getPriorityTagType = (priority: TaskPriority): string => {
  const types: Record<TaskPriority, string> = {
    'low': 'info',
    'normal': '',
    'high': 'warning',
    'urgent': 'danger'
  }
  return types[priority] || ''
}

const getStatusName = (status: TaskStatus): string => {
  const names: Record<TaskStatus, string> = {
    'pending': '待处理',
    'preparing': '制作中',
    'ready': '已完成',
    'served': '已上菜',
    'cancelled': '已取消'
  }
  return names[status] || status
}

const getStatusTagType = (status: TaskStatus): string => {
  const types: Record<TaskStatus, string> = {
    'pending': 'info',
    'preparing': 'primary',
    'ready': 'success',
    'served': 'success',
    'cancelled': 'info'
  }
  return types[status] || ''
}

const getStaffName = (staffId: string): string => {
  const staff = kitchenStaff.value.find(s => s.id === staffId)
  return staff ? staff.name : `员工${staffId}`
}

const getStaffStatusType = (status: EmployeeStatus): string => {
  const types: Record<EmployeeStatus, string> = {
    'online': 'success',
    'busy': 'warning',
    'break': 'warning',
    'offline': 'danger'
  }
  return types[status] || ''
}

const getStaffStatusName = (status: EmployeeStatus): string => {
  const names: Record<EmployeeStatus, string> = {
    'online': '工作中',
    'busy': '忙碌中',
    'break': '休息中',
    'offline': '离线'
  }
  return names[status] || status
}

const getTaskCountByStatus = (status: TaskStatus): number => {
  return tasks.value.filter(task => task.status === status).length
}

const getTasksByStatus = (status: TaskStatus): KitchenTask[] => {
  return tasks.value.filter(task => task.status === status)
}

const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}分钟`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}小时${remainingMinutes > 0 ? remainingMinutes + '分钟' : ''}`
}

const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    // 任务状态分布图
    if (taskStatusChart.value) {
      const statusChart = echarts.init(taskStatus.value)
      const statusData = Object.entries(kitchenStats.tasksByStatus).map(([status, count]) => ({
        name: getStatusName(status as KitchenTaskStatus),
        value: count
      }))

      statusChart.setOption({
        title: {
          text: '任务状态分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        series: [{
          type: 'pie',
          radius: '50%',
          data: statusData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              borderWidth: 0
            }
          }
        }]
      })
    }

    // 岗位任务分布图
    if (stationChart.value) {
      const stationChart = echarts.init(stationChart.value)
      const stationData = Object.entries(kitchenStats.tasksByStation).map(([station, data]) => ({
        name: getStationName(station as KitchenStation),
        value: data.pending + data.preparing + data.ready
      }))

      stationChart.setOption({
        title: {
          text: '岗位任务分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        series: [{
          type: 'bar',
          data: stationData
        }]
      })
    }

    // 员工效率分析图
    if (staffEfficiencyChart.value) {
      const efficiencyChart = echarts.init(staffEfficiencyChart.value)
      const staffData = kitchenStats.staffPerformance.slice(0, 10).map(staff => ({
        name: staff.name,
        value: staff.efficiency
      }))

      efficiencyChart.setOption({
        title: {
          text: '员工效率排名',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: (params: any) => {
            const staff = kitchenStats.staffPerformance.find(s => s.name === params.name)
            return `${params.name}: ${params.value}% (${staff?.tasksCompleted}个任务)`
          }
        },
        series: [{
          type: 'bar',
          data: staffData,
          itemStyle: {
            color: params => {
              const color = params.value > 80 ? '#67c23a' : params.value > 60 ? '#e6a23c' : '#f56c6c'
            }
          }
        }]
      })
    }

    // 高峰时段分析图
    if (peakHoursChart.value) {
      const peakChart = echarts.init(peakHoursChart.value)
      const peakData = kitchenStats.peakHours.map(item => ({
        name: `${item.hour}:00`,
        value: item.taskCount
      }))

      peakChart.setOption({
        title: {
          text: '高峰时段分析',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: (params: any) => {
            return `${params.name}: ${params.value}个任务`
          }
        },
        series: [{
          type: 'line',
          data: peakData,
          smooth: true,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#409eff', opacity: 0.3 },
                { offset: 1, color: '#409eff', opacity: 0.1 }
              ]
            }
          }
        }]
      })
    }
  })
}

// 生命周期
onMounted(() => {
  loadTasks()
  loadStaff()
  loadStats()
  nextTick(() => {
    initCharts()
  })
})

defineExpose({
  tasks,
  kitchenStaff,
  loadTasks,
  loadStaff,
  loadStats,
  refreshData,
  refreshAnalytics,
  handleTaskStatusChange,
  taskStatusChart,
  stationChart,
  staffEfficiencyChart,
  peakHoursChart
})
</script>

<style lang="scss" scoped>
.kitchen-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .header-left {
    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 8px 0;
    }

    .page-description {
      color: #909399;
      margin: 0;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.stats-container {
  margin-bottom: 20px;

  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;

      .stat-icon {
        width: 50px;
        height: 50px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;

        .el-icon {
          font-size: 24px;
          color: #fff;
        }

        &.active-tasks {
          background: linear-gradient(135deg, #409eff, #66b1ff);
        }

        &.completed {
          background: linear-gradient(135deg, #67c23a, #85ce61);
        }

        &.efficiency {
          background: linear-gradient(135deg, #e6a23c, #eebe77);
        }

        &.average-time {
          background: linear-gradient(135deg, #f56c6c, #f78989);
        }
      }

      .stat-info {
        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
          line-height: 1;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }
}

.main-content {
  .tab-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .tab-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .tab-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .tab-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .filter-controls {
      display: flex;
      gap: 8px;
    }
  }

  .task-table {
    .pagination-container {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }
  }

  .kanban-board {
    .kanban-columns {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px;
      min-height: 600px;

      .kanban-column {
        background: #f5f7fa;
        border-radius: 8px;
        padding: 16px;
        border: 1px solid #e4e7ed;

        .kanban-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e4e7ed;

          h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #303133;
          }

          .status-badge {
            background: #409eff;
            color: white;
            font-weight: bold;
            padding: 2px 8px;
            border-radius: 12px;
          }
        }

        .kanban-content {
          min-height: 500px;
          padding: 8px;

          .kanban-card {
            background: white;
            border: 1px solid #e4e7ed;
            border-radius: 6px;
            padding: 16px;
            margin-bottom: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

            &:hover {
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
              transform: translateY(-2px);
            }

            .card-header {
              .task-info {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 8px;

                .task-name {
                  font-weight: 600;
                  color: #303133;
                  flex: 1;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                }

                .task-meta {
                  display: flex;
                  gap: 8px;
                  font-size: 12px;
                  color: #909399;

                  .order-no,
                  .table-number {
                    padding: 2px 6px;
                    background: #f0f0f0;
                    border-radius: 4px;
                    font-size: 11px;
                  }
                }
              }
            }

            .card-content {
              .task-details {
                .detail-item {
                  display: flex;
                  margin-bottom: 4px;
                  font-size: 12px;

                  .label {
                    color: #909399;
                    margin-right: 4px;
                    min-width: 50px;
                  }

                  .value {
                    flex: 1;
                  }
                }
              }
            }

            .card-footer {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;

              .task-actions {
                display: flex;
                gap: 4px;
              }

              .task-time {
                display: flex;
                align-items: center;
                font-size: 12px;
                color: #666;
                margin-left: auto;
              }
            }
          }
        }
      }
    }
  }
}

.staff-card {
  transition: all 0.3s ease;

  &.status-break {
    border-left: 4px solid #ffc107;
  }

  &.status-offline {
    border-left: 4px solid #f56c6c;
    opacity: 0.6;
  }

  &.status-busy {
    border-left: 4px solid #e6a23c;
  }

  .staff-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    .staff-info {
      flex: 1;
      margin-left: 12px;

      h4 {
        margin: 0 0 4px 0;
        font-size: 16px;
        color: #303133;
      }

      .staff-status {
        margin-top: 4px;
      }
    }
  }

  .staff-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-bottom: 16px;

    .stat-item {
      text-align: center;

      .stat-value {
        display: block;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        line-height: 1.2;
      }

      .stat-label {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .staff-actions {
    display: flex;
    gap: 8px;
  }
}

.analytics-content {
  .chart-container {
    padding: 20px 0;
    min-height: 300px;
  }
}

.text-muted {
  color: #909399;
}

.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// 响应式设计
@media (max-width: 768px) {
  .kitchen-management {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;

    .header-actions {
      margin-top: 16px;
    }
  }

  .stats-container {
    :deep(.el-col) {
      margin-bottom: 16px;
    }
  }

  .filter-controls {
    flex-wrap: wrap;
  }

  .kanban-board {
    grid-template-columns: 1fr;
  }

  .staff-container {
    :deep(.el-col) {
      margin-bottom: 16px;
    }
  }
}
</style>