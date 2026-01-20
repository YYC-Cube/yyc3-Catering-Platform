<template>
  <div class="chain-management">
    <div class="chain-header">
      <div class="header-left">
        <h2 class="chain-title">连锁管理</h2>
        <div class="chain-info">
          <el-tag type="info" size="small">
            <el-icon><Shop /></el-icon>
            门店总数: {{ stores.length }}
          </el-tag>
          <el-tag type="success" size="small">
            <el-icon><User /></el-icon>
            员工总数: {{ employees.length }}
          </el-tag>
          <el-tag type="warning" size="small">
            <el-icon><Box /></el-icon>
            库存总数: {{ inventory.length }}
          </el-tag>
          <el-tag type="primary" size="small">
            <el-icon><Money /></el-icon>
            总营业额: {{ formatNumber(totalRevenue) }}
          </el-tag>
        </div>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="Plus" @click="handleAddStore" v-if="activeTab === 'stores'">
          新增门店
        </el-button>
        <el-button type="primary" :icon="Plus" @click="handleAddEmployee" v-if="activeTab === 'employees'">
          新增员工
        </el-button>
        <el-button type="primary" :icon="Plus" @click="handleRestock({} as any)" v-if="activeTab === 'inventory'">
          补货
        </el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="chain-tabs" @tab-change="handleTabChange">
      <el-tab-pane label="门店管理" name="stores">
        <div class="stores-view">
          <div class="filter-bar">
            <el-input
              v-model="storeFilter.search"
              placeholder="搜索门店名称、编号、地址"
              :prefix-icon="Search"
              clearable
              @keyup.enter="handleStoreSearch"
            />
            <el-select v-model="storeFilter.status" placeholder="门店状态" clearable>
              <el-option label="营业中" :value="StoreStatus.OPEN" />
              <el-option label="休息中" :value="StoreStatus.CLOSED" />
              <el-option label="已关闭" :value="StoreStatus.MAINTENANCE" />
            </el-select>
            <el-select v-model="storeFilter.type" placeholder="门店类型" clearable>
              <el-option label="直营店" :value="StoreType.DIRECT" />
              <el-option label="加盟店" :value="StoreType.FRANCHISE" />
            </el-select>
            <el-button type="primary" :icon="Search" @click="handleStoreSearch">搜索</el-button>
            <el-button :icon="Refresh" @click="resetStoreFilter">重置</el-button>
          </div>

          <el-table
            :data="stores"
            v-loading="storesLoading"
            stripe
            border
            style="width: 100%"
          >
            <el-table-column prop="storeCode" label="门店编号" width="120" />
            <el-table-column prop="name" label="门店名称" width="150" />
            <el-table-column label="门店类型" width="100">
              <template #default="{ row }">
                <el-tag :type="row.type === StoreType.DIRECT ? 'primary' : 'success'" size="small">
                  {{ getStoreTypeName(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="门店状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStoreStatusType(row.status)" size="small">
                  {{ getStoreStatusName(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="address" label="地址" min-width="200" />
            <el-table-column prop="phone" label="联系电话" width="120" />
            <el-table-column label="店长" width="100">
              <template #default="{ row }">
                <div class="manager-info">
                  <el-avatar :size="32" :src="row.manager.avatar" />
                  <span>{{ row.manager.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="营业时间" width="120">
              <template #default="{ row }">
                {{ row.businessHours.monday.open }} - {{ row.businessHours.monday.close }}
              </template>
            </el-table-column>
            <el-table-column prop="employees" label="员工数" width="80" />
            <el-table-column prop="tables" label="桌位数" width="80" />
            <el-table-column prop="rating" label="评分" width="80">
              <template #default="{ row }">
                <el-rate v-model="row.rating" disabled show-score />
              </template>
            </el-table-column>
            <el-table-column prop="openingDate" label="开业日期" width="110">
              <template #default="{ row }">
                {{ formatDateTime(row.openingDate).split(' ')[0] }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" :icon="View" @click="viewStore(row)">查看</el-button>
                <el-button link type="primary" :icon="Edit" @click="handleEditStore(row)">编辑</el-button>
                <el-dropdown @command="(cmd) => handleStoreAction(cmd, row)">
                  <el-button link type="primary" :icon="MoreFilled">更多</el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="updateStatus">更新状态</el-dropdown-item>
                      <el-dropdown-item command="stats">统计数据</el-dropdown-item>
                      <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-model:current-page="storePagination.page"
            v-model:page-size="storePagination.limit"
            :total="storePagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handleStorePageChange"
            @size-change="handleStorePageSizeChange"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="员工管理" name="employees">
        <div class="employees-view">
          <div class="filter-bar">
            <el-input
              v-model="employeeFilter.search"
              placeholder="搜索员工姓名、工号、手机号"
              :prefix-icon="Search"
              clearable
              @keyup.enter="handleEmployeeSearch"
            />
            <el-select v-model="employeeFilter.storeId" placeholder="所属门店" clearable>
              <el-option v-for="store in stores" :key="store.id" :label="store.name" :value="store.id" />
            </el-select>
            <el-select v-model="employeeFilter.department" placeholder="部门" clearable>
              <el-option label="前厅" value="前厅" />
              <el-option label="后厨" value="后厨" />
              <el-option label="管理" value="管理" />
              <el-option label="财务" value="财务" />
            </el-select>
            <el-select v-model="employeeFilter.status" placeholder="员工状态" clearable>
              <el-option label="在职" :value="EmployeeStatus.ACTIVE" />
              <el-option label="离职" :value="EmployeeStatus.RESIGNED" />
              <el-option label="请假" :value="EmployeeStatus.LEAVE" />
            </el-select>
            <el-button type="primary" :icon="Search" @click="handleEmployeeSearch">搜索</el-button>
            <el-button :icon="Refresh" @click="resetEmployeeFilter">重置</el-button>
          </div>

          <el-table
            :data="employees"
            v-loading="employeesLoading"
            stripe
            border
            style="width: 100%"
          >
            <el-table-column prop="employeeCode" label="工号" width="100" />
            <el-table-column label="员工信息" width="180">
              <template #default="{ row }">
                <div class="employee-info">
                  <el-avatar :size="40" :src="row.avatar" />
                  <div class="employee-detail">
                    <div class="employee-name">{{ row.name }}</div>
                    <div class="employee-phone">{{ row.phone }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="storeName" label="所属门店" width="120" />
            <el-table-column prop="department" label="部门" width="80" />
            <el-table-column prop="position" label="职位" width="100" />
            <el-table-column label="员工状态" width="80">
              <template #default="{ row }">
                <el-tag :type="getEmployeeStatusType(row.status)" size="small">
                  {{ getEmployeeStatusName(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="hireDate" label="入职日期" width="110">
              <template #default="{ row }">
                {{ formatDateTime(row.hireDate).split(' ')[0] }}
              </template>
            </el-table-column>
            <el-table-column prop="salary" label="薪资" width="100">
              <template #default="{ row }">
                ¥{{ formatNumber(row.salary) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" :icon="View" @click="viewEmployee(row)">查看</el-button>
                <el-button link type="primary" :icon="Edit" @click="handleEditEmployee(row)">编辑</el-button>
                <el-dropdown @command="(cmd) => handleEmployeeAction(cmd, row)">
                  <el-button link type="primary" :icon="MoreFilled">更多</el-button>
                  <template #dropdown>
                    <el-dropdown-item command="transfer">调店</el-dropdown-item>
                    <el-dropdown-item command="performance">绩效</el-dropdown-item>
                    <el-dropdown-item command="permissions">权限</el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-model:current-page="employeePagination.page"
            v-model:page-size="employeePagination.limit"
            :total="employeePagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handleEmployeePageChange"
            @size-change="handleEmployeePageSizeChange"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="库存管理" name="inventory">
        <div class="inventory-view">
          <div class="filter-bar">
            <el-input
              v-model="inventoryFilter.search"
              placeholder="搜索商品名称、编码"
              :prefix-icon="Search"
              clearable
              @keyup.enter="handleInventorySearch"
            />
            <el-select v-model="inventoryFilter.storeId" placeholder="所属门店" clearable>
              <el-option v-for="store in stores" :key="store.id" :label="store.name" :value="store.id" />
            </el-select>
            <el-select v-model="inventoryFilter.category" placeholder="商品分类" clearable>
              <el-option label="食材" value="食材" />
              <el-option label="调料" value="调料" />
              <el-option label="饮品" value="饮品" />
              <el-option label="餐具" value="餐具" />
              <el-option label="其他" value="其他" />
            </el-select>
            <el-select v-model="inventoryFilter.status" placeholder="库存状态" clearable>
              <el-option label="充足" :value="InventoryStatus.NORMAL" />
              <el-option label="预警" :value="InventoryStatus.WARNING" />
              <el-option label="缺货" :value="InventoryStatus.OUT_OF_STOCK" />
            </el-select>
            <el-button type="primary" :icon="Search" @click="handleInventorySearch">搜索</el-button>
            <el-button :icon="Refresh" @click="resetInventoryFilter">重置</el-button>
          </div>

          <el-table
            :data="inventory"
            v-loading="inventoryLoading"
            stripe
            border
            style="width: 100%"
          >
            <el-table-column prop="productCode" label="商品编码" width="120" />
            <el-table-column prop="productName" label="商品名称" width="150" />
            <el-table-column prop="category" label="分类" width="80" />
            <el-table-column prop="storeName" label="所属门店" width="120" />
            <el-table-column label="库存数量" width="100">
              <template #default="{ row }">
                <span :class="getInventoryClass(row.status)">{{ row.quantity }} {{ row.unit }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="minQuantity" label="最小库存" width="100" />
            <el-table-column prop="maxQuantity" label="最大库存" width="100" />
            <el-table-column prop="costPrice" label="成本价" width="100">
              <template #default="{ row }">
                ¥{{ formatNumber(row.costPrice) }}
              </template>
            </el-table-column>
            <el-table-column label="库存状态" width="80">
              <template #default="{ row }">
                <el-tag :type="getInventoryStatusType(row.status)" size="small">
                  {{ getInventoryStatusName(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="location" label="存放位置" width="120" />
            <el-table-column prop="expiryDate" label="过期日期" width="110">
              <template #default="{ row }">
                {{ row.expiryDate ? formatDateTime(row.expiryDate).split(' ')[0] : '-' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" :icon="View" @click="viewInventory(row)">查看</el-button>
                <el-button link type="primary" :icon="Plus" @click="handleRestock(row)">补货</el-button>
                <el-dropdown @command="(cmd) => handleInventoryAction(cmd, row)">
                  <el-button link type="primary" :icon="MoreFilled">更多</el-button>
                  <template #dropdown>
                    <el-dropdown-item command="transfer">调拨</el-dropdown-item>
                    <el-dropdown-item command="check">盘点</el-dropdown-item>
                  </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-model:current-page="inventoryPagination.page"
            v-model:page-size="inventoryPagination.limit"
            :total="inventoryPagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handleInventoryPageChange"
            @size-change="handleInventoryPageSizeChange"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="数据统计" name="stats">
        <div class="stats-view">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-card class="stat-card">
                <div class="stat-content">
                  <div class="stat-icon" style="background: #409EFF">
                    <el-icon><Shop /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ stores.length }}</div>
                    <div class="stat-label">门店总数</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-card class="stat-card">
                <div class="stat-content">
                  <div class="stat-icon" style="background: #67C23A">
                    <el-icon><User /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ employees.length }}</div>
                    <div class="stat-label">员工总数</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-card class="stat-card">
                <div class="stat-content">
                  <div class="stat-icon" style="background: #E6A23C">
                    <el-icon><Box /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ inventory.length }}</div>
                    <div class="stat-label">库存总数</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-card class="stat-card">
                <div class="stat-content">
                  <div class="stat-icon" style="background: #F56C6C">
                    <el-icon><Money /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ formatNumber(totalRevenue) }}</div>
                    <div class="stat-label">总营业额</div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <el-row :gutter="20" style="margin-top: 20px">
            <el-col :xs="24" :lg="12">
              <el-card class="chart-card">
                <template #header>
                  <div class="card-header">
                    <span>门店营收对比</span>
                  </div>
                </template>
                <div ref="revenueChartRef" style="height: 400px"></div>
              </el-card>
            </el-col>
            <el-col :xs="24" :lg="12">
              <el-card class="chart-card">
                <template #header>
                  <div class="card-header">
                    <span>员工绩效排名</span>
                  </div>
                </template>
                <div ref="performanceChartRef" style="height: 400px"></div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog
      v-model="showStoreDialog"
      :title="storeDialogType === 'create' ? '新增门店' : '编辑门店'"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form :model="storeForm" label-width="120px">
        <el-form-item label="门店编号" prop="storeCode">
          <el-input v-model="storeForm.storeCode" placeholder="请输入门店编号" :disabled="storeDialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="门店名称" prop="name">
          <el-input v-model="storeForm.name" placeholder="请输入门店名称" />
        </el-form-item>
        <el-form-item label="门店类型" prop="type">
          <el-radio-group v-model="storeForm.type">
            <el-radio :label="StoreType.DIRECT">直营店</el-radio>
            <el-radio :label="StoreType.FRANCHISE">加盟店</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="门店状态" prop="status">
          <el-radio-group v-model="storeForm.status">
            <el-radio :label="StoreStatus.OPEN">营业中</el-radio>
            <el-radio :label="StoreStatus.CLOSED">休息中</el-radio>
            <el-radio :label="StoreStatus.MAINTENANCE">已关闭</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="门店地址" prop="address">
          <el-input v-model="storeForm.address" placeholder="请输入门店地址" />
        </el-form-item>
        <el-form-item label="所在城市" prop="city">
          <el-input v-model="storeForm.city" placeholder="请输入所在城市" />
        </el-form-item>
        <el-form-item label="所在区县" prop="district">
          <el-input v-model="storeForm.district" placeholder="请输入所在区县" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="storeForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="storeForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="店长" prop="managerId">
          <el-select v-model="storeForm.managerId" placeholder="请选择店长">
            <el-option v-for="employee in employees" :key="employee.id" :label="employee.name" :value="employee.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="营业时间" prop="businessHours">
          <el-row :gutter="10">
            <el-col :span="3">周一</el-col>
            <el-col :span="9">
              <el-time-picker v-model="storeForm.businessHours.monday.open" placeholder="开门时间" format="HH:mm" />
            </el-col>
            <el-col :span="9">
              <el-time-picker v-model="storeForm.businessHours.monday.close" placeholder="关门时间" format="HH:mm" />
            </el-col>
            <el-col :span="3">
              <el-switch v-model="storeForm.businessHours.monday.enabled" />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="门店面积" prop="area">
          <el-input-number v-model="storeForm.area" :min="1" :max="10000" />
          <span style="margin-left: 10px">平方米</span>
        </el-form-item>
        <el-form-item label="最大容量" prop="capacity">
          <el-input-number v-model="storeForm.capacity" :min="1" :max="1000" />
          <span style="margin-left: 10px">人</span>
        </el-form-item>
        <el-form-item label="桌位数量" prop="tables">
          <el-input-number v-model="storeForm.tables" :min="1" :max="500" />
          <span style="margin-left: 10px">个</span>
        </el-form-item>
        <el-form-item label="开业日期" prop="openingDate">
          <el-date-picker v-model="storeForm.openingDate" type="date" placeholder="请选择开业日期" />
        </el-form-item>
        <el-form-item label="门店描述" prop="description">
          <el-input v-model="storeForm.description" type="textarea" :rows="3" placeholder="请输入门店描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showStoreDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmStore">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showEmployeeDialog"
      :title="employeeDialogType === 'create' ? '新增员工' : '编辑员工'"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form :model="employeeForm" label-width="120px">
        <el-form-item label="工号" prop="employeeCode">
          <el-input v-model="employeeForm.employeeCode" placeholder="请输入工号" :disabled="employeeDialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="employeeForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="employeeForm.gender">
            <el-radio label="male">男</el-radio>
            <el-radio label="female">女</el-radio>
            <el-radio label="other">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="employeeForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="employeeForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="所属门店" prop="storeId">
          <el-select v-model="employeeForm.storeId" placeholder="请选择所属门店">
            <el-option v-for="store in stores" :key="store.id" :label="store.name" :value="store.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-select v-model="employeeForm.department" placeholder="请选择部门">
            <el-option label="前厅" value="前厅" />
            <el-option label="后厨" value="后厨" />
            <el-option label="管理" value="管理" />
            <el-option label="财务" value="财务" />
          </el-select>
        </el-form-item>
        <el-form-item label="职位" prop="position">
          <el-input v-model="employeeForm.position" placeholder="请输入职位" />
        </el-form-item>
        <el-form-item label="员工状态" prop="status">
          <el-radio-group v-model="employeeForm.status">
            <el-radio :label="EmployeeStatus.ACTIVE">在职</el-radio>
            <el-radio :label="EmployeeStatus.RESIGNED">离职</el-radio>
            <el-radio :label="EmployeeStatus.LEAVE">请假</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="入职日期" prop="hireDate">
          <el-date-picker v-model="employeeForm.hireDate" type="date" placeholder="请选择入职日期" />
        </el-form-item>
        <el-form-item label="薪资" prop="salary">
          <el-input-number v-model="employeeForm.salary" :min="0" :max="100000" :precision="2" />
          <span style="margin-left: 10px">元</span>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="employeeForm.address" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="employeeForm.idCard" placeholder="请输入身份证号" />
        </el-form-item>
        <el-form-item label="银行账号" prop="bankAccount">
          <el-input v-model="employeeForm.bankAccount" placeholder="请输入银行账号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEmployeeDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmEmployee">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showTransferDialog"
      title="员工调店"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="transferForm" label-width="120px">
        <el-form-item label="目标门店" prop="targetStoreId">
          <el-select v-model="transferForm.targetStoreId" placeholder="请选择目标门店">
            <el-option v-for="store in stores" :key="store.id" :label="store.name" :value="store.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="调动原因" prop="reason">
          <el-input v-model="transferForm.reason" type="textarea" :rows="3" placeholder="请输入调动原因" />
        </el-form-item>
        <el-form-item label="生效日期" prop="effectiveDate">
          <el-date-picker v-model="transferForm.effectiveDate" type="date" placeholder="请选择生效日期" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showTransferDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmTransfer">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showRestockDialog"
      title="库存补货"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="restockForm" label-width="120px">
        <el-form-item label="补货数量" prop="quantity">
          <el-input-number v-model="restockForm.quantity" :min="1" :max="10000" />
        </el-form-item>
        <el-form-item label="补货单价" prop="costPrice">
          <el-input-number v-model="restockForm.costPrice" :min="0" :max="100000" :precision="2" />
          <span style="margin-left: 10px">元</span>
        </el-form-item>
        <el-form-item label="供应商" prop="supplier">
          <el-input v-model="restockForm.supplier.name" placeholder="请输入供应商名称" />
        </el-form-item>
        <el-form-item label="批次号" prop="batchNumber">
          <el-input v-model="restockForm.batchNumber" placeholder="请输入批次号" />
        </el-form-item>
        <el-form-item label="过期日期" prop="expiryDate">
          <el-date-picker v-model="restockForm.expiryDate" type="date" placeholder="请选择过期日期" />
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="restockForm.remarks" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRestockDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmRestock">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useChain } from '@/composables/useChain'
import { StoreType, StoreStatus, EmployeeStatus, InventoryStatus } from '@/api/chain'
import { Shop, User, Box, Money, Plus, Search, Refresh, View, Edit, MoreFilled } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const {
  loading,
  activeTab,
  stores,
  employees,
  inventory,
  storeStats,
  employeePerformance,
  selectedStore,
  selectedEmployee,
  selectedInventory,
  showStoreDialog,
  showEmployeeDialog,
  showTransferDialog,
  showRestockDialog,
  showTransferInventoryDialog,
  showCheckDialog,
  storeDialogType,
  employeeDialogType,
  storeForm,
  employeeForm,
  transferForm,
  restockForm,
  transferInventoryForm,
  checkForm,
  storePagination,
  employeePagination,
  inventoryPagination,
  storeFilter,
  employeeFilter,
  inventoryFilter,
  storesLoading,
  employeesLoading,
  inventoryLoading,
  statsLoading,
  loadStores,
  loadEmployees,
  loadInventory,
  loadStoreStats,
  loadEmployeePerformance,
  handleAddStore,
  handleEditStore,
  handleDeleteStore,
  handleUpdateStoreStatus,
  confirmStore,
  handleAddEmployee,
  handleEditEmployee,
  handleDeleteEmployee,
  handleTransferEmployee,
  confirmTransfer,
  confirmEmployee,
  handleRestock,
  confirmRestock,
  handleTransferInventory,
  confirmTransferInventory,
  handleCheckInventory,
  confirmCheck,
  handleStoreSearch,
  resetStoreFilter,
  handleEmployeeSearch,
  resetEmployeeFilter,
  handleInventorySearch,
  resetInventoryFilter,
  handleStorePageChange,
  handleStorePageSizeChange,
  handleEmployeePageChange,
  handleEmployeePageSizeChange,
  handleInventoryPageChange,
  handleInventoryPageSizeChange,
  handleTabChange,
  formatNumber,
  formatDateTime,
  getStoreTypeName,
  getStoreStatusName,
  getStoreStatusType,
  getEmployeeStatusName,
  getEmployeeStatusType,
  getInventoryStatusName,
  getInventoryStatusType
} = useChain()

const revenueChartRef = ref<HTMLElement>()
const performanceChartRef = ref<HTMLElement>()

const totalRevenue = computed(() => {
  return storeStats.reduce((sum, stat) => sum + stat.totalRevenue, 0)
})

const viewStore = (store: any) => {
  console.log('查看门店:', store)
}

const viewEmployee = (employee: any) => {
  console.log('查看员工:', employee)
}

const viewInventory = (inventoryItem: any) => {
  console.log('查看库存:', inventoryItem)
}

const handleStoreAction = (command: string, store: any) => {
  switch (command) {
    case 'updateStatus':
      handleUpdateStoreStatus(store, store.status === StoreStatus.OPEN ? StoreStatus.CLOSED : StoreStatus.OPEN)
      break
    case 'stats':
      console.log('查看统计数据:', store)
      break
    case 'delete':
      handleDeleteStore(store)
      break
  }
}

const handleEmployeeAction = (command: string, employee: any) => {
  switch (command) {
    case 'transfer':
      handleTransferEmployee(employee)
      break
    case 'performance':
      console.log('查看绩效:', employee)
      break
    case 'permissions':
      console.log('查看权限:', employee)
      break
    case 'delete':
      handleDeleteEmployee(employee)
      break
  }
}

const handleInventoryAction = (command: string, inventoryItem: any) => {
  switch (command) {
    case 'transfer':
      handleTransferInventory(inventoryItem)
      break
    case 'check':
      handleCheckInventory(inventoryItem.storeId)
      break
  }
}

const getInventoryClass = (status: InventoryStatus) => {
  switch (status) {
    case InventoryStatus.NORMAL:
      return 'inventory-normal'
    case InventoryStatus.WARNING:
      return 'inventory-warning'
    case InventoryStatus.OUT_OF_STOCK:
      return 'inventory-out-of-stock'
    default:
      return ''
  }
}

const initCharts = () => {
  if (revenueChartRef.value) {
    const revenueChart = echarts.init(revenueChartRef.value)
    revenueChart.setOption({
      title: {
        text: '门店营收对比'
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: storeStats.map(stat => stat.storeName)
      },
      yAxis: {
        type: 'value',
        name: '营收（元）'
      },
      series: [
        {
          name: '营收',
          type: 'bar',
          data: storeStats.map(stat => stat.totalRevenue),
          itemStyle: {
            color: '#409EFF'
          }
        }
      ]
    })
  }

  if (performanceChartRef.value) {
    const performanceChart = echarts.init(performanceChartRef.value)
    performanceChart.setOption({
      title: {
        text: '员工绩效排名'
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: employeePerformance.slice(0, 10).map(emp => emp.employeeName)
      },
      yAxis: {
        type: 'value',
        name: '绩效评分'
      },
      series: [
        {
          name: '绩效评分',
          type: 'bar',
          data: employeePerformance.slice(0, 10).map(emp => emp.performanceScore),
          itemStyle: {
            color: '#67C23A'
          }
        }
      ]
    })
  }
}

onMounted(async () => {
  await loadStores()
  await loadEmployees()
  await loadInventory()
  await loadStoreStats()
  await loadEmployeePerformance()
  
  await nextTick()
  initCharts()
})
</script>

<style scoped>
.chain-management {
  padding: 20px;
}

.chain-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chain-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.chain-info {
  display: flex;
  gap: 10px;
}

.header-right {
  display: flex;
  gap: 10px;
}

.chain-tabs {
  margin-top: 20px;
}

.filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-bar .el-input,
.filter-bar .el-select {
  width: 200px;
}

.stores-view,
.employees-view,
.inventory-view,
.stats-view {
  padding: 20px 0;
}

.manager-info,
.employee-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.employee-detail {
  display: flex;
  flex-direction: column;
}

.employee-name {
  font-weight: 600;
  color: #303133;
}

.employee-phone {
  font-size: 12px;
  color: #909399;
}

.inventory-normal {
  color: #67C23A;
  font-weight: 600;
}

.inventory-warning {
  color: #E6A23C;
  font-weight: 600;
}

.inventory-out-of-stock {
  color: #F56C6C;
  font-weight: 600;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.chart-card {
  margin-bottom: 20px;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.el-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
