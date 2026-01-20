/**
 * YYC³餐饮行业智能化平台 - 客户管理API
 */

// API 基础URL配置
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:3006/api/v1'

// HTTP 请求工具函数
class HttpClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    // 获取认证token
    const token = this.getToken()

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`
    }

    const config: RequestInit = {
      headers: defaultHeaders,
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  private getToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  async get<T>(endpoint: string, options: { params?: any; responseType?: string } = {}): Promise<T> {
    let fullEndpoint = endpoint
    if (options.params) {
      const params = new URLSearchParams()
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
      const paramsString = params.toString()
      if (paramsString) {
        fullEndpoint += `?${paramsString}`
      }
    }

    return this.request<T>(fullEndpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any, options: { headers?: HeadersInit } = {}): Promise<T> {
    const requestOptions: RequestInit = {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers: options.headers,
    }

    // 如果是FormData，不需要JSON.stringify
    if (data instanceof FormData) {
      delete requestOptions.body
      requestOptions.body = data
      // FormData会自动设置正确的Content-Type
      if (requestOptions.headers && requestOptions.headers['Content-Type']) {
        delete requestOptions.headers['Content-Type']
      }
    }

    return this.request<T>(endpoint, requestOptions)
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, options: { data?: any } = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      body: options.data ? JSON.stringify(options.data) : undefined,
    })
  }
}

// 创建HTTP客户端实例
const httpClient = new HttpClient(API_BASE_URL)

// 客户数据类型定义
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  address?: string;
  avatar?: string;
  memberLevelId?: string;
  points?: number;
  totalSpent?: number;
  lastVisit?: string;
  createTime?: string;
  updateTime?: string;
  status: 'active' | 'inactive';
}

// 客户查询参数
export interface CustomerQueryParams {
  keyword?: string;
  status?: 'active' | 'inactive';
  memberLevelId?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 客户统计数据
export interface CustomerStatistics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  avgSpent: number;
  avgOrderCount: number;
}

// 获取客户列表
export const getCustomers = (params: CustomerQueryParams) => {
  return httpClient.get('/api/customers', { params });
};

// 获取客户详情
export const getCustomerDetail = (id: string) => {
  return httpClient.get(`/api/customers/${id}`);
};

// 创建客户
export const createCustomer = (data: Partial<Customer>) => {
  return httpClient.post('/api/customers', data);
};

// 更新客户信息
export const updateCustomer = (id: string, data: Partial<Customer>) => {
  return httpClient.put(`/api/customers/${id}`, data);
};

// 删除客户
export const deleteCustomer = (id: string) => {
  return httpClient.delete(`/api/customers/${id}`);
};

// 批量删除客户
export const batchDeleteCustomers = (ids: string[]) => {
  return httpClient.delete('/api/customers', { data: { ids } });
};

// 更新客户状态
export const updateCustomerStatus = (id: string, status: 'active' | 'inactive') => {
  return httpClient.patch(`/api/customers/${id}/status`, { status });
};

// 获取客户统计数据
export const getCustomerStatistics = () => {
  return httpClient.get('/api/customers/statistics');
};

// 获取客户消费记录
export const getCustomerOrderHistory = (id: string, params?: { page?: number; size?: number }) => {
  return httpClient.get(`/api/customers/${id}/orders`, { params });
};

// 获取客户积分记录
export const getCustomerPointsHistory = (id: string, params?: { page?: number; size?: number }) => {
  return httpClient.get(`/api/customers/${id}/points`, { params });
};

// 导出客户列表
export const exportCustomers = (params: CustomerQueryParams) => {
  return httpClient.get('/api/customers/export', { params });
};

// 导入客户列表
export const importCustomers = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return httpClient.post('/api/customers/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// 客户生命周期管理接口
export interface CustomerLifecycle {
  id: string;
  customerId: string;
  currentStage: string;
  previousStage: string;
  stageChangedAt: string;
  daysInCurrentStage: number;
  totalDaysInLifecycle: number;
  stageHistory: StageHistory[];
  metadata: Record<string, any>;
}

export interface StageHistory {
  stage: string;
  enteredAt: string;
  exitedAt: string;
  duration: number;
  transitionReason: string;
}

export interface LifecycleRule {
  id: string;
  name: string;
  description: string;
  fromStage: string[];
  toStage: string;
  conditions: RuleCondition[];
  priority: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RuleCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface CustomerEvent {
  id: string;
  customerId: string;
  eventType: string;
  eventData: Record<string, any>;
  occurredAt: string;
  processed: boolean;
}

export interface RuleResult {
  rule: LifecycleRule;
  matched: boolean;
  timestamp: string;
  details?: Record<string, any>;
}

export interface CustomerRFMData {
  customerId: string;
  lastOrderDate: string;
  orderCount: number;
  totalSpent: number;
  registeredAt: string;
  recentOrders: any[];
  recentInteractions: any[];
}

export interface RFMScore {
  recencyScore: number;
  frequencyScore: number;
  monetaryScore: number;
  totalScore: number;
  customerLevel: string;
  levelLabel: string;
  levelColor: string;
}

export interface CareReminder {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  ruleId: string;
  ruleName: string;
  careType: string;
  content: string;
  channels: string[];
  priority: number;
  scheduledAt: string;
  sentAt: string | null;
  status: 'pending' | 'sent' | 'failed';
  result: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CareReminderRule {
  id: string;
  name: string;
  description: string;
  triggerType: 'event' | 'schedule' | 'condition';
  triggerCondition: any;
  careType: string;
  contentTemplate: string;
  channels: string[];
  priority: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChurnPrediction {
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  churnProbability: number;
  riskLevel: 'high' | 'medium' | 'low';
  riskFactors: string[];
  predictedChurnDate: string;
  recommendations: string[];
  assignedTo: string | null;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface LifecycleStatistics {
  totalCustomers: number;
  stageDistribution: Record<string, number>;
  stageTransitionCount: number;
  avgDaysInStage: Record<string, number>;
  retentionRate: number;
  churnRate: number;
  avgCLV: number;
}

export interface ChurnStatistics {
  total: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  highRiskPercentage: number;
  mediumRiskPercentage: number;
  lowRiskPercentage: number;
  avgChurnProbability: number;
  topRiskFactors: Array<{
    factor: string;
    count: number;
    percentage: number;
  }>;
}

export interface TrendAnalysis {
  currentWeekCount: number;
  previousWeekCount: number;
  currentMonthCount: number;
  currentWeekHighRisk: number;
  previousWeekHighRisk: number;
  weekTrend: number;
  avgChurnProbability: {
    currentWeek: number;
    previousWeek: number;
    currentMonth: number;
  };
}

// 获取客户生命周期信息
export const getCustomerLifecycle = (customerId: string) => {
  return httpClient.get<CustomerLifecycle>(`/api/customers/${customerId}/lifecycle`);
};

// 更新客户生命周期阶段
export const updateCustomerLifecycleStage = (customerId: string, stage: string, reason: string) => {
  return httpClient.put(`/api/customers/${customerId}/lifecycle/stage`, { stage, reason });
};

// 获取生命周期规则列表
export const getLifecycleRules = () => {
  return httpClient.get<LifecycleRule[]>('/api/lifecycle/rules');
};

// 创建生命周期规则
export const createLifecycleRule = (rule: Partial<LifecycleRule>) => {
  return httpClient.post<LifecycleRule>('/api/lifecycle/rules', rule);
};

// 更新生命周期规则
export const updateLifecycleRule = (ruleId: string, rule: Partial<LifecycleRule>) => {
  return httpClient.put<LifecycleRule>(`/api/lifecycle/rules/${ruleId}`, rule);
};

// 删除生命周期规则
export const deleteLifecycleRule = (ruleId: string) => {
  return httpClient.delete(`/api/lifecycle/rules/${ruleId}`);
};

// 启用/禁用生命周期规则
export const toggleLifecycleRule = (ruleId: string, enabled: boolean) => {
  return httpClient.patch(`/api/lifecycle/rules/${ruleId}/toggle`, { enabled });
};

// 触发客户事件
export const triggerCustomerEvent = (event: Partial<CustomerEvent>) => {
  return httpClient.post<RuleResult[]>('/api/lifecycle/events', event);
};

// 获取客户RFM评分
export const getCustomerRFMScore = (customerId: string) => {
  return httpClient.get<RFMScore>(`/api/customers/${customerId}/rfm`);
};

// 批量获取客户RFM评分
export const batchGetRFMScores = (customerIds: string[]) => {
  return httpClient.post<RFMScore[]>('/api/customers/rfm/batch', { customerIds });
};

// 获取关怀提醒列表
export const getCareReminders = (params?: { status?: string; customerId?: string; page?: number; size?: number }) => {
  return httpClient.get<{ data: CareReminder[]; total: number }>('/api/care-reminders', { params });
};

// 获取待处理关怀提醒
export const getPendingCareReminders = () => {
  return httpClient.get<CareReminder[]>('/api/care-reminders/pending');
};

// 发送关怀提醒
export const sendCareReminder = (reminderId: string) => {
  return httpClient.post(`/api/care-reminders/${reminderId}/send`);
};

// 标记关怀提醒为已发送
export const markCareReminderSent = (reminderId: string, result: Record<string, any>) => {
  return httpClient.patch(`/api/care-reminders/${reminderId}/sent`, { result });
};

// 获取关怀提醒规则列表
export const getCareReminderRules = () => {
  return httpClient.get<CareReminderRule[]>('/api/care-reminders/rules');
};

// 创建关怀提醒规则
export const createCareReminderRule = (rule: Partial<CareReminderRule>) => {
  return httpClient.post<CareReminderRule>('/api/care-reminders/rules', rule);
};

// 更新关怀提醒规则
export const updateCareReminderRule = (ruleId: string, rule: Partial<CareReminderRule>) => {
  return httpClient.put<CareReminderRule>(`/api/care-reminders/rules/${ruleId}`, rule);
};

// 删除关怀提醒规则
export const deleteCareReminderRule = (ruleId: string) => {
  return httpClient.delete(`/api/care-reminders/rules/${ruleId}`);
};

// 获取流失预测列表
export const getChurnPredictions = (params?: { riskLevel?: string; status?: string; page?: number; size?: number }) => {
  return httpClient.get<{ data: ChurnPrediction[]; total: number }>('/api/churn-predictions', { params });
};

// 批量预测客户流失
export const batchPredictChurn = (customerIds: string[]) => {
  return httpClient.post<ChurnPrediction[]>('/api/churn-predictions/batch', { customerIds });
};

// 分配流失预警
export const assignChurnAlert = (alertId: string, assignedTo: string) => {
  return httpClient.patch(`/api/churn-predictions/${alertId}/assign`, { assignedTo });
};

// 解决流失预警
export const resolveChurnAlert = (alertId: string, resolutionNotes: string) => {
  return httpClient.patch(`/api/churn-predictions/${alertId}/resolve`, { resolutionNotes });
};

// 关闭流失预警
export const closeChurnAlert = (alertId: string) => {
  return httpClient.patch(`/api/churn-predictions/${alertId}/close`);
};

// 获取流失统计数据
export const getChurnStatistics = () => {
  return httpClient.get<ChurnStatistics>('/api/churn-predictions/statistics');
};

// 获取流失趋势分析
export const getChurnTrendAnalysis = () => {
  return httpClient.get<TrendAnalysis>('/api/churn-predictions/trends');
};

// 获取生命周期统计数据
export const getLifecycleStatistics = () => {
  return httpClient.get<LifecycleStatistics>('/api/lifecycle/statistics');
};

// 获取生命周期流转趋势
export const getLifecycleFlowTrend = (params?: { startDate?: string; endDate?: string }) => {
  return httpClient.get('/api/lifecycle/flow-trend', { params });
};

// 获取客户留存率趋势
export const getRetentionRateTrend = (params?: { startDate?: string; endDate?: string }) => {
  return httpClient.get('/api/lifecycle/retention-trend', { params });
};

// 获取客户生命周期价值分布
export const getCLVDistribution = (params?: { startDate?: string; endDate?: string }) => {
  return httpClient.get('/api/lifecycle/clv-distribution', { params });
};

// 导出生命周期报告
export const exportLifecycleReport = (params?: { startDate?: string; endDate?: string; format?: 'pdf' | 'excel' }) => {
  return httpClient.get('/api/lifecycle/export', { params });
};

// 导出流失预警报告
export const exportChurnReport = (params?: { startDate?: string; endDate?: string; format?: 'pdf' | 'excel' }) => {
  return httpClient.get('/api/churn-predictions/export', { params });
};

// 客户分群管理接口
export interface CustomerGroup {
  id: string;
  name: string;
  description: string;
  groupType: 'manual' | 'auto' | 'rfm' | 'lifecycle';
  conditions: any;
  color: string;
  icon: string;
  priority: number;
  memberCount: number;
  enabled: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerGroupMember {
  id: string;
  groupId: string;
  customerId: string;
  addedBy: string;
  addedAt: string;
  reason: string;
}

// 获取客户分群列表
export const getCustomerGroups = (params?: { groupType?: string; enabled?: boolean; page?: number; size?: number }) => {
  return httpClient.get<{ data: CustomerGroup[]; total: number }>('/api/customer-groups', { params });
};

// 获取客户分群详情
export const getCustomerGroupDetail = (groupId: string) => {
  return httpClient.get<CustomerGroup>(`/api/customer-groups/${groupId}`);
};

// 创建客户分群
export const createCustomerGroup = (data: Partial<CustomerGroup>) => {
  return httpClient.post<CustomerGroup>('/api/customer-groups', data);
};

// 更新客户分群
export const updateCustomerGroup = (groupId: string, data: Partial<CustomerGroup>) => {
  return httpClient.put<CustomerGroup>(`/api/customer-groups/${groupId}`, data);
};

// 删除客户分群
export const deleteCustomerGroup = (groupId: string) => {
  return httpClient.delete(`/api/customer-groups/${groupId}`);
};

// 获取分群成员列表
export const getCustomerGroupMembers = (groupId: string, params?: { page?: number; size?: number }) => {
  return httpClient.get<{ data: CustomerGroupMember[]; total: number }>(`/api/customer-groups/${groupId}/members`, { params });
};

// 添加客户到分群
export const addCustomerToGroup = (groupId: string, customerIds: string[], reason?: string) => {
  return httpClient.post(`/api/customer-groups/${groupId}/members`, { customerIds, reason });
};

// 从分群移除客户
export const removeCustomerFromGroup = (groupId: string, customerId: string) => {
  return httpClient.delete(`/api/customer-groups/${groupId}/members/${customerId}`);
};

// 批量添加客户到分群
export const batchAddCustomersToGroup = (groupId: string, customerIds: string[], reason?: string) => {
  return httpClient.post(`/api/customer-groups/${groupId}/members/batch`, { customerIds, reason });
};

// 批量从分群移除客户
export const batchRemoveCustomersFromGroup = (groupId: string, customerIds: string[]) => {
  return httpClient.delete(`/api/customer-groups/${groupId}/members/batch`, { data: { customerIds } });
};

// 客户标签管理接口
export interface CustomerTag {
  id: string;
  name: string;
  description: string;
  color: string;
  tagType: 'behavior' | 'preference' | 'custom' | 'system';
  usageCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerTagRelation {
  id: string;
  customerId: string;
  tagId: string;
  taggedBy: string;
  taggedAt: string;
  reason: string;
}

// 获取客户标签列表
export const getCustomerTags = (params?: { tagType?: string; page?: number; size?: number }) => {
  return httpClient.get<{ data: CustomerTag[]; total: number }>('/api/customer-tags', { params });
};

// 获取客户标签详情
export const getCustomerTagDetail = (tagId: string) => {
  return httpClient.get<CustomerTag>(`/api/customer-tags/${tagId}`);
};

// 创建客户标签
export const createCustomerTag = (data: Partial<CustomerTag>) => {
  return httpClient.post<CustomerTag>('/api/customer-tags', data);
};

// 更新客户标签
export const updateCustomerTag = (tagId: string, data: Partial<CustomerTag>) => {
  return httpClient.put<CustomerTag>(`/api/customer-tags/${tagId}`, data);
};

// 删除客户标签
export const deleteCustomerTag = (tagId: string) => {
  return httpClient.delete(`/api/customer-tags/${tagId}`);
};

// 获取客户的标签
export const getCustomerTagsByCustomerId = (customerId: string) => {
  return httpClient.get<CustomerTagRelation[]>(`/api/customers/${customerId}/tags`);
};

// 为客户添加标签
export const addTagToCustomer = (customerId: string, tagId: string, reason?: string) => {
  return httpClient.post(`/api/customers/${customerId}/tags`, { tagId, reason });
};

// 从客户移除标签
export const removeTagFromCustomer = (customerId: string, tagId: string) => {
  return httpClient.delete(`/api/customers/${customerId}/tags/${tagId}`);
};

// 批量为客户添加标签
export const batchAddTagsToCustomer = (customerId: string, tagIds: string[], reason?: string) => {
  return httpClient.post(`/api/customers/${customerId}/tags/batch`, { tagIds, reason });
};

// 批量从客户移除标签
export const batchRemoveTagsFromCustomer = (customerId: string, tagIds: string[]) => {
  return httpClient.delete(`/api/customers/${customerId}/tags/batch`, { data: { tagIds } });
};

// 客户地址管理接口
export interface CustomerAddress {
  id: string;
  customerId: string;
  contactName: string;
  contactPhone: string;
  province: string;
  city: string;
  district: string;
  detailedAddress: string;
  postalCode: string;
  isDefault: boolean;
  addressType: 'home' | 'work' | 'other';
  createdAt: string;
  updatedAt: string;
}

// 获取客户地址列表
export const getCustomerAddresses = (customerId: string) => {
  return httpClient.get<CustomerAddress[]>(`/api/customers/${customerId}/addresses`);
};

// 获取客户地址详情
export const getCustomerAddressDetail = (addressId: string) => {
  return httpClient.get<CustomerAddress>(`/api/customer-addresses/${addressId}`);
};

// 创建客户地址
export const createCustomerAddress = (customerId: string, data: Partial<CustomerAddress>) => {
  return httpClient.post<CustomerAddress>(`/api/customers/${customerId}/addresses`, data);
};

// 更新客户地址
export const updateCustomerAddress = (addressId: string, data: Partial<CustomerAddress>) => {
  return httpClient.put<CustomerAddress>(`/api/customer-addresses/${addressId}`, data);
};

// 删除客户地址
export const deleteCustomerAddress = (addressId: string) => {
  return httpClient.delete(`/api/customer-addresses/${addressId}`);
};

// 设置默认地址
export const setDefaultAddress = (addressId: string) => {
  return httpClient.patch(`/api/customer-addresses/${addressId}/default`);
};

// 客户偏好管理接口
export interface CustomerPreference {
  id: string;
  customerId: string;
  preferenceType: string;
  preferenceKey: string;
  preferenceValue: string;
  createdAt: string;
  updatedAt: string;
}

// 获取客户偏好
export const getCustomerPreferences = (customerId: string, preferenceType?: string) => {
  return httpClient.get<CustomerPreference[]>(`/api/customers/${customerId}/preferences`, { params: { preferenceType } });
};

// 获取客户偏好详情
export const getCustomerPreferenceDetail = (customerId: string, preferenceType: string, preferenceKey: string) => {
  return httpClient.get<CustomerPreference>(`/api/customers/${customerId}/preferences/${preferenceType}/${preferenceKey}`);
};

// 设置客户偏好
export const setCustomerPreference = (customerId: string, data: Partial<CustomerPreference>) => {
  return httpClient.post<CustomerPreference>(`/api/customers/${customerId}/preferences`, data);
};

// 更新客户偏好
export const updateCustomerPreference = (customerId: string, preferenceType: string, preferenceKey: string, value: string) => {
  return httpClient.put<CustomerPreference>(`/api/customers/${customerId}/preferences/${preferenceType}/${preferenceKey}`, { preferenceValue: value });
};

// 删除客户偏好
export const deleteCustomerPreference = (customerId: string, preferenceType: string, preferenceKey: string) => {
  return httpClient.delete(`/api/customers/${customerId}/preferences/${preferenceType}/${preferenceKey}`);
};

// 客户状态历史接口
export interface CustomerStatusHistory {
  id: string;
  customerId: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
  changedAt: string;
  reason: string;
}

// 获取客户状态历史
export const getCustomerStatusHistory = (customerId: string, params?: { page?: number; size?: number }) => {
  return httpClient.get<{ data: CustomerStatusHistory[]; total: number }>(`/api/customers/${customerId}/status-history`, { params });
};

// 客户统计接口
export interface CustomerGroupStatistics {
  totalGroups: number;
  manualGroups: number;
  autoGroups: number;
  rfmGroups: number;
  lifecycleGroups: number;
  totalMembers: number;
  avgMembersPerGroup: number;
}

export interface CustomerTagStatistics {
  totalTags: number;
  behaviorTags: number;
  preferenceTags: number;
  customTags: number;
  systemTags: number;
  totalTaggedCustomers: number;
  avgTagsPerCustomer: number;
  topUsedTags: Array<{
    tagId: string;
    tagName: string;
    usageCount: number;
  }>;
}

// 获取客户分群统计
export const getCustomerGroupStatistics = () => {
  return httpClient.get<CustomerGroupStatistics>('/api/customer-groups/statistics');
};

// 获取客户标签统计
export const getCustomerTagStatistics = () => {
  return httpClient.get<CustomerTagStatistics>('/api/customer-tags/statistics');
};

// 客户搜索接口
export interface CustomerSearchParams {
  keyword?: string;
  phone?: string;
  email?: string;
  status?: 'active' | 'inactive' | 'blacklisted';
  memberLevelId?: string;
  groupId?: string;
  tagId?: string;
  registerDateStart?: string;
  registerDateEnd?: string;
  lastVisitDateStart?: string;
  lastVisitDateEnd?: string;
  totalSpentMin?: number;
  totalSpentMax?: number;
  orderCountMin?: number;
  orderCountMax?: number;
  pointsMin?: number;
  pointsMax?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

// 高级搜索客户
export const advancedSearchCustomers = (params: CustomerSearchParams) => {
  return httpClient.get<{ data: Customer[]; total: number }>('/api/customers/search', { params });
};

// 导出客户数据
export const exportCustomersAdvanced = (params: CustomerSearchParams & { format?: 'excel' | 'csv' }) => {
  return httpClient.get('/api/customers/export', { params });
};

// 客户批量操作接口
export interface BatchOperationResult {
  success: number;
  failed: number;
  errors: Array<{
    customerId: string;
    error: string;
  }>;
}

// 批量更新客户状态
export const batchUpdateCustomerStatus = (customerIds: string[], status: 'active' | 'inactive' | 'blacklisted', reason?: string) => {
  return httpClient.patch<BatchOperationResult>('/api/customers/batch/status', { customerIds, status, reason });
};

// 批量添加标签
export const batchAddTags = (customerIds: string[], tagIds: string[], reason?: string) => {
  return httpClient.post<BatchOperationResult>('/api/customers/batch/tags', { customerIds, tagIds, reason });
};

// 批量移除标签
export const batchRemoveTags = (customerIds: string[], tagIds: string[]) => {
  return httpClient.delete<BatchOperationResult>('/api/customers/batch/tags', { data: { customerIds, tagIds } });
};

// 批量添加到分群
export const batchAddToGroups = (customerIds: string[], groupIds: string[], reason?: string) => {
  return httpClient.post<BatchOperationResult>('/api/customers/batch/groups', { customerIds, groupIds, reason });
};

// 批量从分群移除
export const batchRemoveFromGroups = (customerIds: string[], groupIds: string[]) => {
  return httpClient.delete<BatchOperationResult>('/api/customers/batch/groups', { data: { customerIds, groupIds } });
};
