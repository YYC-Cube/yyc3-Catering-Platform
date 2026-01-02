<template>
  <div class="decision-templates">
    <div class="template-header">
      <h3>决策模板库</h3>
      <p>选择一个模板快速创建决策请求</p>
    </div>

    <div class="template-filters">
      <el-input
        v-model="searchQuery"
        placeholder="搜索模板..."
        clearable
        style="width: 250px"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <el-select
        v-model="categoryFilter"
        placeholder="按类别筛选"
        clearable
        style="width: 150px"
      >
        <el-option label="所有类别" value="" />
        <el-option label="运营决策" value="operational" />
        <el-option label="财务决策" value="financial" />
        <el-option label="人力资源" value="hr" />
        <el-option label="市场决策" value="marketing" />
        <el-option label="战略决策" value="strategic" />
      </el-select>
    </div>

    <div class="template-grid">
      <el-card
        v-for="template in filteredTemplates"
        :key="template.id"
        class="template-card"
        @click="selectTemplate(template)"
      >
        <div class="template-content">
          <div class="template-icon" :style="{ backgroundColor: template.color }">
            <el-icon :size="32"><component :is="getTemplateIcon()" /></el-icon>
          </div>
          <div class="template-info">
            <h4>{{ template.name }}</h4>
            <p class="template-description">{{ template.description }}</p>
            <div class="template-meta">
              <el-tag size="small">{{ template.category }}</el-tag>
              <el-tag size="small" type="info">{{ template.type }}</el-tag>
            </div>
          </div>
        </div>
        <div class="template-actions">
          <el-button type="primary" size="small" @click.stop="selectTemplate(template)">
            使用模板
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Document } from '@element-plus/icons-vue'

// 定义模板类型
interface DecisionTemplate {
  id: string
  name: string
  description: string
  category: string
  type: string
  color: string
  structure: {
    type: string
    level: string
    priority: string
    context: {
      situation: string
      background: string
      constraints: string[]
      objectives: string[]
      stakeholders: string[]
    }
    requiredParticipants: string[]
  }
}

// Emits
const emit = defineEmits<{
  select: [template: DecisionTemplate]
}>()

// 响应式数据
const searchQuery = ref('')
const categoryFilter = ref('')

// 模拟模板数据
const templates = ref<DecisionTemplate[]>([
  {
    id: 'tpl-001',
    name: '预算审批',
    description: '用于部门预算申请和审批的标准流程',
    category: '财务决策',
    type: 'formal',
    color: '#67C23A',
    structure: {
      type: 'financial',
      level: 'management',
      priority: 'medium',
      context: {
        situation: '部门需要申请下季度预算',
        background: '根据业务发展需要，需增加资源投入',
        constraints: ['总预算限制', 'ROI要求'],
        objectives: ['确保业务增长', '控制成本'],
        stakeholders: ['部门经理', '财务总监', 'CEO']
      },
      requiredParticipants: ['manager', 'financial', 'executive']
    }
  },
  {
    id: 'tpl-002',
    name: '新员工招聘',
    description: '标准化的新员工招聘决策流程',
    category: '人力资源',
    type: 'operational',
    color: '#409EFF',
    structure: {
      type: 'hr',
      level: 'supervisor',
      priority: 'medium',
      context: {
        situation: '部门需要补充新员工',
        background: '业务扩张导致人手不足',
        constraints: ['招聘预算', '岗位要求'],
        objectives: ['找到合适人才', '控制招聘成本'],
        stakeholders: ['部门经理', 'HR主管', '团队成员']
      },
      requiredParticipants: ['manager', 'hr', 'staff']
    }
  },
  {
    id: 'tpl-003',
    name: '营销活动策划',
    description: '市场营销活动的决策与审批流程',
    category: '市场决策',
    type: 'collaborative',
    color: '#E6A23C',
    structure: {
      type: 'marketing',
      level: 'management',
      priority: 'high',
      context: {
        situation: '需要策划新的营销活动',
        background: '提升品牌知名度和销售额',
        constraints: ['活动预算', '时间限制'],
        objectives: ['提高品牌曝光', '增加销售额'],
        stakeholders: ['营销经理', '财务部门', '运营团队']
      },
      requiredParticipants: ['manager', 'financial', 'marketing']
    }
  },
  {
    id: 'tpl-004',
    name: '流程优化',
    description: '业务流程改进的决策模板',
    category: '运营决策',
    type: 'analytical',
    color: '#F56C6C',
    structure: {
      type: 'operational',
      level: 'supervisor',
      priority: 'medium',
      context: {
        situation: '现有流程效率低下',
        background: '影响业务正常运行',
        constraints: ['资源限制', '时间限制'],
        objectives: ['提高流程效率', '降低成本'],
        stakeholders: ['部门经理', '流程负责人', '团队成员']
      },
      requiredParticipants: ['manager', 'staff', 'analyst']
    }
  },
  {
    id: 'tpl-005',
    name: '战略投资',
    description: '重大投资项目的决策流程',
    category: '战略决策',
    type: 'formal',
    color: '#909399',
    structure: {
      type: 'strategic',
      level: 'executive',
      priority: 'high',
      context: {
        situation: '考虑新的投资机会',
        background: '为公司长期发展寻找增长点',
        constraints: ['投资预算', '风险控制'],
        objectives: ['实现长期增长', '提高市场份额'],
        stakeholders: ['CEO', '董事会', '财务总监']
      },
      requiredParticipants: ['executive', 'financial', 'strategic']
    }
  },
  {
    id: 'tpl-006',
    name: '供应商选择',
    description: '供应商评估与选择的标准化流程',
    category: '运营决策',
    type: 'analytical',
    color: '#722ED1',
    structure: {
      type: 'operational',
      level: 'management',
      priority: 'medium',
      context: {
        situation: '需要选择新的供应商',
        background: '现有供应商无法满足需求',
        constraints: ['成本限制', '质量要求'],
        objectives: ['找到优质供应商', '降低采购成本'],
        stakeholders: ['采购经理', '质量部门', '财务部门']
      },
      requiredParticipants: ['manager', 'financial', 'quality']
    }
  }
])

// 计算属性
const filteredTemplates = computed(() => {
  return templates.value.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                        template.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = !categoryFilter.value || template.category.toLowerCase().includes(categoryFilter.value.toLowerCase())
    return matchesSearch && matchesCategory
  })
})

// 方法
const selectTemplate = (template: DecisionTemplate) => {
  emit('select', template)
  ElMessage.success(`已选择模板: ${template.name}`)
}

const getTemplateIcon = () => {
  // 简单实现，始终返回Document图标
  return Document
}
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.decision-templates {
  padding: 20px;
  
  .template-header {
    margin-bottom: $spacing-6;
    
    h3 {
      margin: 0 0 $spacing-2 0;
      font-size: 20px;
      font-weight: 600;
      color: $text-primary;
    }
    
    p {
      margin: 0;
      color: $text-secondary;
      font-size: 14px;
    }
  }
  
  .template-filters {
    display: flex;
    gap: $spacing-4;
    align-items: center;
    margin-bottom: $spacing-6;
  }
  
  .template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: $spacing-6;
  }
  
  .template-card {
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: $border-radius-base;
    box-shadow: $shadow-sm;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: $shadow-md;
    }
    
    .template-content {
      display: flex;
      gap: $spacing-4;
      margin-bottom: $spacing-4;
    }
    
    .template-icon {
      width: 60px;
      height: 60px;
      border-radius: $border-radius-base;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }
    
    .template-info {
      flex: 1;
      
      h4 {
        margin: 0 0 $spacing-2 0;
        font-size: 16px;
        font-weight: 600;
        color: $text-primary;
      }
      
      .template-description {
        margin: 0 0 $spacing-3 0;
        font-size: 14px;
        color: $text-secondary;
        line-height: 1.5;
      }
      
      .template-meta {
        display: flex;
        gap: $spacing-2;
      }
    }
    
    .template-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: $spacing-4;
      padding-top: $spacing-4;
      border-top: 1px solid $border-light;
    }
  }
}
</style>
