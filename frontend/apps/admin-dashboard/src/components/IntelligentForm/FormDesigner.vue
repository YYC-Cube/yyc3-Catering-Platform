<template>
  <div class="form-designer-container">
    <!-- 设计器头部 -->
    <div class="designer-header">
      <div class="designer-title">智能表单设计器</div>
      <div class="designer-actions">
        <button class="btn btn-primary" @click="saveForm">保存表单</button>
        <button class="btn btn-secondary" @click="previewForm">预览表单</button>
        <button class="btn btn-danger" @click="deleteForm" v-if="formConfig.id">删除表单</button>
      </div>
    </div>

    <!-- 设计器主体 -->
    <div class="designer-body">
      <!-- 左侧字段库 -->
      <div class="field-library">
        <h3 class="library-title">字段库</h3>
        <div class="field-categories">
          <div class="field-category">
            <h4>基础字段</h4>
            <div class="field-items">
              <div class="field-item" @click="addField('text')">
                <span class="field-icon">📝</span>
                <span class="field-name">文本输入</span>
              </div>
              <div class="field-item" @click="addField('number')">
                <span class="field-icon">🔢</span>
                <span class="field-name">数字输入</span>
              </div>
              <div class="field-item" @click="addField('textarea')">
                <span class="field-icon">📋</span>
                <span class="field-name">多行文本</span>
              </div>
              <div class="field-item" @click="addField('select')">
                <span class="field-icon">▼</span>
                <span class="field-name">下拉选择</span>
              </div>
              <div class="field-item" @click="addField('radio')">
                <span class="field-icon">○</span>
                <span class="field-name">单选按钮</span>
              </div>
              <div class="field-item" @click="addField('checkbox')">
                <span class="field-icon">☑️</span>
                <span class="field-name">复选框</span>
              </div>
            </div>
          </div>

          <div class="field-category">
            <h4>高级字段</h4>
            <div class="field-items">
              <div class="field-item" @click="addField('date')">
                <span class="field-icon">📅</span>
                <span class="field-name">日期选择</span>
              </div>
              <div class="field-item" @click="addField('time')">
                <span class="field-icon">⏰</span>
                <span class="field-name">时间选择</span>
              </div>
              <div class="field-item" @click="addField('datetime')">
                <span class="field-icon">📅⏰</span>
                <span class="field-name">日期时间</span>
              </div>
              <div class="field-item" @click="addField('file')">
                <span class="field-icon">📁</span>
                <span class="field-name">文件上传</span>
              </div>
              <div class="field-item" @click="addField('image')">
                <span class="field-icon">🖼️</span>
                <span class="field-name">图片上传</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间设计区域 -->
      <div class="design-area">
        <h3 class="design-title">表单设计区域</h3>
        
        <!-- 表单基本信息 -->
        <div class="form-basic-info">
          <div class="form-input-group">
            <label for="form-title">表单标题</label>
            <input 
              id="form-title"
              v-model="formConfig.title" 
              type="text" 
              placeholder="请输入表单标题"
              class="form-input"
            />
          </div>
          <div class="form-input-group">
            <label for="form-name">表单名称（英文）</label>
            <input 
              id="form-name"
              v-model="formConfig.name" 
              type="text" 
              placeholder="请输入英文名称，用于API调用"
              class="form-input"
            />
          </div>
          <div class="form-input-group full-width">
            <label for="form-description">表单描述</label>
            <textarea 
              id="form-description"
              v-model="formConfig.description" 
              placeholder="请输入表单描述"
              class="form-textarea"
            ></textarea>
          </div>
        </div>

        <!-- 表单字段列表 -->
        <div class="form-fields-list">
          <div 
            v-for="(field, index) in formConfig.fields" 
            :key="field.id"
            class="field-card"
            :class="{ 'selected': selectedFieldId === field.id }"
            @click="selectField(field.id)"
          >
            <div class="field-card-header">
              <div class="field-card-title">
                <span class="field-icon">{{ getFieldIcon(field.type) }}</span>
                <span>{{ field.label || `未命名字段 ${index + 1}` }}</span>
              </div>
              <div class="field-card-actions">
                <button class="btn-icon" @click.stop="moveFieldUp(index)" :disabled="index === 0">
                  ↑
                </button>
                <button class="btn-icon" @click.stop="moveFieldDown(index)" :disabled="index === formConfig.fields.length - 1">
                  ↓
                </button>
                <button class="btn-icon btn-danger" @click.stop="removeField(index)">
                  ×
                </button>
              </div>
            </div>
            <div class="field-card-body">
              <div class="field-type-badge">{{ getFieldTypeName(field.type) }}</div>
              <div class="field-required" v-if="field.required">必填</div>
            </div>
          </div>
          
          <!-- 添加字段提示 -->
          <div class="add-field-hint" v-if="formConfig.fields.length === 0">
            <div class="hint-icon">➕</div>
            <div class="hint-text">从左侧字段库拖拽或点击添加字段</div>
          </div>
        </div>
      </div>

      <!-- 右侧属性面板 -->
      <div class="property-panel">
        <h3 class="panel-title">属性设置</h3>
        
        <div v-if="selectedField" class="field-properties">
          <div class="property-group">
            <h4 class="property-group-title">基本属性</h4>
            <div class="property-item">
              <label for="field-label">字段标签</label>
              <input 
                id="field-label"
                v-model="selectedField.label" 
                type="text" 
                placeholder="请输入字段标签"
                class="property-input"
              />
            </div>
            <div class="property-item">
              <label for="field-name">字段名称（英文）</label>
              <input 
                id="field-name"
                v-model="selectedField.name" 
                type="text" 
                placeholder="请输入英文名称"
                class="property-input"
              />
            </div>
            <div class="property-item">
              <label for="field-type">字段类型</label>
              <select 
                id="field-type"
                v-model="selectedField.type" 
                class="property-select"
              >
                <option v-for="type in fieldTypes" :key="type.value" :value="type.value">
                  {{ type.icon }} {{ type.label }}
                </option>
              </select>
            </div>
            <div class="property-item checkbox">
              <input 
                id="field-required"
                v-model="selectedField.required" 
                type="checkbox"
              />
              <label for="field-required">必填字段</label>
            </div>
          </div>

          <div class="property-group">
            <h4 class="property-group-title">高级属性</h4>
            <div class="property-item">
              <label for="field-placeholder">占位文本</label>
              <input 
                id="field-placeholder"
                v-model="selectedField.placeholder" 
                type="text" 
                placeholder="请输入占位文本"
                class="property-input"
              />
            </div>
            <div class="property-item">
              <label for="field-default-value">默认值</label>
              <input 
                id="field-default-value"
                v-model="selectedField.defaultValue" 
                type="text" 
                placeholder="请输入默认值"
                class="property-input"
              />
            </div>
            <div class="property-item" v-if="['select', 'radio', 'checkbox'].includes(selectedField.type)">
              <label for="field-options">选项配置</label>
              <div class="options-list">
                <div 
                  v-for="(option, optIndex) in selectedField.options" 
                  :key="optIndex"
                  class="option-item"
                >
                  <input 
                    v-model="option.label" 
                    type="text" 
                    placeholder="选项标签"
                    class="option-input"
                  />
                  <input 
                    v-model="option.value" 
                    type="text" 
                    placeholder="选项值"
                    class="option-input"
                  />
                  <button class="btn-icon btn-danger" @click="removeOption(selectedField, optIndex)">
                    ×
                  </button>
                </div>
                <button class="btn btn-secondary" @click="addOption(selectedField)">添加选项</button>
              </div>
            </div>
            
            <!-- 菜品选择字段的特殊配置 -->
            <div v-if="selectedField.type === 'menu-item'" class="property-item">
              <label for="field-menu-items">菜品配置</label>
              <div class="options-list">
                <div class="property-group">
                  <div v-if="loadingMenuItems" class="loading">加载菜品列表中...</div>
                  <div v-else class="menu-items-container">
                    <div v-for="menuItem in menuItems" :key="menuItem.id" class="menu-item-option">
                      <input 
                        type="checkbox" 
                        :id="`menu-item-${menuItem.id}`" 
                        :value="menuItem.id" 
                        v-model="selectedField.menuItemIds"
                      >
                      <label :for="`menu-item-${menuItem.id}`">
                        {{ menuItem.name }} ({{ menuItem.category }}) - ¥{{ menuItem.price.toFixed(2) }}
                      </label>
                    </div>
                  </div>
                </div>
                <button class="btn btn-secondary" @click="fetchMenuItems">刷新菜品列表</button>
              </div>
            </div>
            <div class="property-item">
              <label for="field-width">字段宽度（%）</label>
              <input 
                id="field-width"
                v-model.number="selectedField.width" 
                type="number" 
                min="10" 
                max="100"
                class="property-input"
              />
            </div>
          </div>

          <div class="property-group">
            <h4 class="property-group-title">智能验证</h4>
            <div class="property-item">
              <label for="field-validation">验证规则</label>
              <select 
                id="field-validation"
                v-model="currentValidationRule" 
                class="property-select"
                @change="addValidationRule"
              >
                <option value="">选择验证规则</option>
                <option value="email">邮箱格式</option>
                <option value="phone">手机号码</option>
                <option value="url">URL地址</option>
                <option value="number">数字</option>
                <option value="integer">整数</option>
                <option value="float">浮点数</option>
                <option value="minLength">最小长度</option>
                <option value="maxLength">最大长度</option>
              </select>
            </div>
            <div class="validation-rules-list">
              <div 
                v-for="(rule, ruleIndex) in selectedField.validationRules" 
                :key="ruleIndex"
                class="validation-rule-item"
              >
                <span class="rule-name">{{ getRuleName(rule) }}</span>
                <button class="btn-icon btn-danger" @click="removeValidationRule(selectedField, ruleIndex)">
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="no-field-selected">
          <div class="no-selection-icon">⚙️</div>
          <div class="no-selection-text">请选择一个字段进行属性设置</div>
        </div>
      </div>
    </div>

    <!-- 表单预览弹窗 -->
    <div class="modal" v-if="showPreview">
      <div class="modal-overlay" @click="closePreview"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>表单预览</h3>
          <button class="btn-icon btn-danger" @click="closePreview">×</button>
        </div>
        <div class="modal-body">
          <FormRenderer :form-config="formConfig" :preview-mode="true" />
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="closePreview">关闭预览</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { intelligentFormService } from '@/services/intelligentFormService'
import FormRenderer from './FormRenderer.vue'
import type { FormConfig, FormField } from '@/services/intelligentFormService'

// 定义props
const props = defineProps<{
  formId?: string
}>()

// 定义表单配置
const formConfig = reactive<FormConfig>({
  id: '',
  name: '',
  title: '',
  description: '',
  fields: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'current_user'
})

// 选中的字段ID
const selectedFieldId = ref<string>('')
const currentValidationRule = ref<string>('')

// 计算属性：选中的字段
const selectedField = computed(() => {
  return formConfig.fields.find(field => field.id === selectedFieldId.value)
})

// 预览相关
const showPreview = ref(false)

// 字段类型列表
const fieldTypes = [
  { value: 'text', label: '文本输入', icon: '📝' },
  { value: 'number', label: '数字输入', icon: '🔢' },
  { value: 'select', label: '下拉选择', icon: '▼' },
  { value: 'radio', label: '单选按钮', icon: '◉' },
  { value: 'checkbox', label: '复选框', icon: '☑️' },
  { value: 'textarea', label: '多行文本', icon: '📋' },
  { value: 'date', label: '日期选择', icon: '📅' },
  { value: 'time', label: '时间选择', icon: '⏰' },
  { value: 'datetime', label: '日期时间', icon: '📅⏰' },
  { value: 'file', label: '文件上传', icon: '📎' },
  { value: 'image', label: '图片上传', icon: '🖼️' },
  { value: 'menu-item', label: '菜品选择', icon: '🍽️' } // 新增菜品选择字段类型
];

// 菜品列表（用于与菜单系统集成）
const menuItems = ref<any[]>([]);
const loadingMenuItems = ref(false);

// 获取菜品列表
const fetchMenuItems = async () => {
  loadingMenuItems.value = true;
  try {
    menuItems.value = await intelligentFormService.getMenuItems();
  } catch (error) {
    console.error('获取菜品列表失败:', error);
  } finally {
    loadingMenuItems.value = false;
  }
};

// 生命周期钩子
onMounted(async () => {
  if (props.formId) {
    await loadForm(props.formId)
  }
  await fetchMenuItems();
})

// 加载表单配置
async function loadForm(formId: string) {
  const loadedForm = intelligentFormService.getFormConfig(formId)
  if (loadedForm) {
    Object.assign(formConfig, loadedForm)
  }
}

// 添加字段
function addField(type: string) {
  const newField: FormField = {
    id: `field_${Date.now()}`,
    name: `${type}_${Date.now()}`,
    label: `${getFieldTypeName(type)} ${formConfig.fields.length + 1}`,
    type: type as any,
    required: false,
    order: formConfig.fields.length,
    options: type === 'select' || type === 'radio' || type === 'checkbox' ? [{ value: '', label: '' }] : undefined,
    validationRules: []
  }
  formConfig.fields.push(newField)
  selectField(newField.id)
}

// 移除字段
function removeField(index: number) {
  formConfig.fields.splice(index, 1)
  // 重新排序
  formConfig.fields.forEach((field, idx) => {
    field.order = idx
  })
  if (selectedFieldId.value === formConfig.fields[index]?.id) {
    selectedFieldId.value = ''
  }
}

// 选择字段
function selectField(fieldId: string) {
  selectedFieldId.value = fieldId
}

// 移动字段
function moveFieldUp(index: number) {
  if (index > 0) {
    const temp = formConfig.fields[index]
    formConfig.fields[index] = formConfig.fields[index - 1]
    formConfig.fields[index - 1] = temp
    // 重新排序
    formConfig.fields.forEach((field, idx) => {
      field.order = idx
    })
  }
}

function moveFieldDown(index: number) {
  if (index < formConfig.fields.length - 1) {
    const temp = formConfig.fields[index]
    formConfig.fields[index] = formConfig.fields[index + 1]
    formConfig.fields[index + 1] = temp
    // 重新排序
    formConfig.fields.forEach((field, idx) => {
      field.order = idx
    })
  }
}

// 添加选项
function addOption(field: FormField) {
  if (!field.options) {
    field.options = []
  }
  field.options.push({ value: '', label: '' })
}

// 移除选项
function removeOption(field: FormField, index: number) {
  if (field.options && field.options.length > 1) {
    field.options.splice(index, 1)
  }
}

// 添加验证规则
function addValidationRule() {
  if (!selectedField.value || !currentValidationRule.value) return
  
  const rule = getValidationRuleFunction(currentValidationRule.value)
  if (rule) {
    selectedField.value.validationRules = selectedField.value.validationRules || []
    selectedField.value.validationRules.push(rule)
    currentValidationRule.value = ''
  }
}

// 移除验证规则
function removeValidationRule(field: FormField, index: number) {
  if (field.validationRules && field.validationRules.length > 0) {
    field.validationRules.splice(index, 1)
  }
}

// 获取验证规则函数
function getValidationRuleFunction(ruleType: string) {
  switch (ruleType) {
    case 'email':
      return (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    case 'phone':
      return (value: string) => /^1[3-9]\d{9}$/.test(value)
    case 'url':
      return (value: string) => /^https?:\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?$/.test(value)
    case 'number':
      return (value: any) => !isNaN(Number(value))
    case 'integer':
      return (value: any) => Number.isInteger(Number(value))
    case 'float':
      return (value: any) => !isNaN(Number(value)) && Number(value) % 1 !== 0
    default:
      return null
  }
}

// 获取规则名称
function getRuleName(rule: Function) {
  const ruleString = rule.toString()
  if (ruleString.includes('email')) return '邮箱格式'
  if (ruleString.includes('phone')) return '手机号码'
  if (ruleString.includes('url')) return 'URL地址'
  if (ruleString.includes('Number.isInteger')) return '整数'
  if (ruleString.includes('float')) return '浮点数'
  return '自定义规则'
}

// 获取字段类型名称
function getFieldTypeName(type: string) {
  const fieldType = fieldTypes.find(ft => ft.value === type);
  return fieldType ? fieldType.label : type;
}

// 获取字段图标
function getFieldIcon(type: string) {
  const fieldType = fieldTypes.find(ft => ft.value === type);
  return fieldType ? fieldType.icon : '📝';
}

// 保存表单
async function saveForm() {
  try {
    let savedForm
    if (formConfig.id) {
      savedForm = await intelligentFormService.updateFormConfig(formConfig.id, formConfig)
    } else {
      savedForm = await intelligentFormService.createFormConfig(formConfig)
    }
    
    if (savedForm) {
      alert('表单保存成功！')
      // 更新表单ID
      if (!formConfig.id) {
        formConfig.id = savedForm.id
      }
    } else {
      alert('表单保存失败！')
    }
  } catch (error) {
    console.error('保存表单失败:', error)
    alert('表单保存失败！')
  }
}

// 删除表单
async function deleteForm() {
  if (confirm('确定要删除这个表单吗？此操作不可恢复。')) {
    try {
      const success = await intelligentFormService.deleteFormConfig(formConfig.id)
      if (success) {
        alert('表单删除成功！')
        // 重置表单
        resetForm()
      } else {
        alert('表单删除失败！')
      }
    } catch (error) {
      console.error('删除表单失败:', error)
      alert('表单删除失败！')
    }
  }
}

// 重置表单
function resetForm() {
  Object.assign(formConfig, {
    id: '',
    name: '',
    title: '',
    description: '',
    fields: [],
    createdAt: new Date(),
    updatedAt: new Date()
  })
  selectedFieldId.value = ''
}

// 预览表单
function previewForm() {
  showPreview.value = true
}

// 关闭预览
function closePreview() {
  showPreview.value = false
}
</script>

<style scoped>
.form-designer-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.designer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.designer-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.designer-actions {
  display: flex;
  gap: 1rem;
}

.designer-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 字段库 */
.field-library {
  width: 280px;
  background-color: #fff;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
  padding: 1rem;
}

.library-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
}

.field-categories {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field-category h4 {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 0.8rem;
  color: #666;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 0.3rem;
}

.field-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem;
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.field-item:hover {
  background-color: #e3f2fd;
  border-color: #2196f3;
  transform: translateY(-1px);
}

.field-icon {
  font-size: 1.2rem;
}

.field-name {
  font-size: 0.9rem;
  color: #333;
}

/* 设计区域 */
.design-area {
  flex: 1;
  background-color: #f5f5f5;
  overflow-y: auto;
  padding: 1rem;
}

.design-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
}

.form-basic-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-input-group.full-width {
  grid-column: 1 / -1;
}

.form-input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #333;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-fields-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field-card {
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.field-card:hover {
  border-color: #2196f3;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.field-card.selected {
  border-color: #2196f3;
  background-color: #e3f2fd;
}

.field-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.field-card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: bold;
  color: #333;
}

.field-card-actions {
  display: flex;
  gap: 0.5rem;
}

.field-card-body {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.field-type-badge {
  background-color: #e0e0e0;
  color: #666;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.field-required {
  background-color: #ffcdd2;
  color: #c62828;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 4px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon:hover {
  background-color: #e0e0e0;
}

.btn-icon.btn-danger:hover {
  background-color: #ffcdd2;
  color: #c62828;
}

.add-field-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background-color: #f9f9f9;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  color: #999;
}

.hint-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hint-text {
  font-size: 1.1rem;
}

/* 属性面板 */
.property-panel {
  width: 320px;
  background-color: #fff;
  border-left: 1px solid #e0e0e0;
  overflow-y: auto;
  padding: 1rem;
}

.panel-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
}

.property-group {
  margin-bottom: 1.5rem;
}

.property-group-title {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 0.8rem;
  color: #666;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 0.3rem;
}

.property-item {
  margin-bottom: 1rem;
}

.property-item label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #333;
  font-size: 0.9rem;
}

.property-input, .property-select {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.9rem;
}

.property-item.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.property-item.checkbox label {
  margin-bottom: 0;
  font-weight: normal;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.option-item {
  display: flex;
  gap: 0.5rem;
}

.option-input {
  flex: 1;
  padding: 0.6rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.9rem;
}

.validation-rules-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.8rem;
}

.validation-rule-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background-color: #f3e5f5;
  border: 1px solid #e1bee7;
  border-radius: 4px;
  font-size: 0.9rem;
}

.rule-name {
  color: #7b1fa2;
}

.no-field-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #999;
}

.no-selection-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.no-selection-text {
  font-size: 1rem;
  text-align: center;
}

/* 按钮样式 */
.btn {
  padding: 0.8rem 1.2rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #2196f3;
  color: white;
}

.btn-primary:hover {
  background-color: #1976d2;
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #bdbdbd;
}

.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn-danger:hover {
  background-color: #d32f2f;
}

/* 预览模态框 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f5f5f5;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
  background-color: #f5f5f5;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .property-panel {
    width: 280px;
  }
  
  .form-basic-info {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 992px) {
  .designer-body {
    flex-direction: column;
  }
  
  .field-library {
    width: auto;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .property-panel {
    width: auto;
    border-left: none;
    border-top: 1px solid #e0e0e0;
  }
}
</style>