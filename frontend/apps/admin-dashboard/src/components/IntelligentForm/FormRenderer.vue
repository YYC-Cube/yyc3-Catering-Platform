<template>
  <div class="form-renderer-container">
    <div v-if="formConfig" class="form-container">
      <!-- 表单头部 -->
      <div class="form-header" v-if="formConfig.title || formConfig.description">
        <h2 class="form-title" v-if="formConfig.title">{{ formConfig.title }}</h2>
        <p class="form-description" v-if="formConfig.description">{{ formConfig.description }}</p>
      </div>

      <!-- 表单内容 -->
      <form class="form-content" @submit.prevent="handleSubmit">
        <!-- 字段渲染 -->
        <div 
          v-for="field in formConfig.fields" 
          :key="field.id"
          class="form-field"
          :style="{ width: field.width ? `${field.width}%` : '100%' }"
        >
          <!-- 字段标签 -->
          <label 
            :for="field.id" 
            class="field-label"
          >
            {{ field.label }}
            <span class="required-mark" v-if="field.required">*</span>
          </label>

          <!-- 字段输入控件 -->
          <div class="field-control">
            <!-- 文本输入 -->
            <input 
              v-if="field.type === 'text'" 
              :id="field.id"
              v-model="formData[field.name]"
              type="text"
              :placeholder="field.placeholder"
              :disabled="previewMode"
              class="form-input"
              @input="handleInput(field)"
            />

            <!-- 数字输入 -->
            <input 
              v-else-if="field.type === 'number'" 
              :id="field.id"
              v-model.number="formData[field.name]"
              type="number"
              :placeholder="field.placeholder"
              :disabled="previewMode"
              class="form-input"
            />

            <!-- 多行文本 -->
            <textarea 
              v-else-if="field.type === 'textarea'" 
              :id="field.id"
              v-model="formData[field.name]"
              :placeholder="field.placeholder"
              :disabled="previewMode"
              class="form-textarea"
              rows="4"
            ></textarea>

            <!-- 下拉选择 -->
            <select 
              v-else-if="field.type === 'select'" 
              :id="field.id"
              v-model="formData[field.name]"
              :disabled="previewMode"
              class="form-select"
            >
              <option value="" v-if="!field.required">请选择</option>
              <option 
                v-for="option in field.options" 
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>

            <!-- 单选按钮 -->
            <div v-else-if="field.type === 'radio'" class="radio-group">
              <label 
                v-for="option in field.options" 
                :key="option.value"
                class="radio-label"
              >
                <input 
                  :id="`${field.id}_${option.value}`"
                  v-model="formData[field.name]"
                  type="radio"
                  :value="option.value"
                  :disabled="previewMode"
                />
                <span>{{ option.label }}</span>
              </label>
            </div>

            <!-- 复选框 -->
            <div v-else-if="field.type === 'checkbox'" class="checkbox-group">
              <label 
                v-for="option in field.options" 
                :key="option.value"
                class="checkbox-label"
              >
                <input 
                  :id="`${field.id}_${option.value}`"
                  v-model="formData[field.name]"
                  type="checkbox"
                  :value="option.value"
                  :disabled="previewMode"
                />
                <span>{{ option.label }}</span>
              </label>
            </div>

            <!-- 日期选择 -->
            <input 
              v-else-if="field.type === 'date'" 
              :id="field.id"
              v-model="formData[field.name]"
              type="date"
              :disabled="previewMode"
              class="form-input"
            />

            <!-- 时间选择 -->
            <input 
              v-else-if="field.type === 'time'" 
              :id="field.id"
              v-model="formData[field.name]"
              type="time"
              :disabled="previewMode"
              class="form-input"
            />

            <!-- 日期时间选择 -->
            <input 
              v-else-if="field.type === 'datetime'" 
              :id="field.id"
              v-model="formData[field.name]"
              type="datetime-local"
              :disabled="previewMode"
              class="form-input"
            />

            <!-- 文件上传 -->
            <input 
              v-else-if="field.type === 'file'" 
              :id="field.id"
              v-model="formData[field.name]"
              type="file"
              :disabled="previewMode"
              class="form-file"
              @change="handleFileChange(field, $event)"
            />

            <!-- 图片上传 -->
            <div v-else-if="field.type === 'image'" class="image-upload">
              <input 
                :id="field.id"
                type="file"
                accept="image/*"
                :disabled="previewMode"
                class="form-file"
                @change="handleImageChange(field, $event)"
              />
              <div 
                class="image-preview" 
                v-if="formData[field.name]"
              >
                <img :src="formData[field.name]" alt="预览" />
                <button 
                  class="btn-remove-image" 
                  @click="removeImage(field)"
                  v-if="!previewMode"
                >
                  ×
                </button>
              </div>
            </div>

            <!-- 菜品选择 -->
            <div v-else-if="field.type === 'menu-item'" class="menu-item-selector">
              <div v-if="loadingMenuItems" class="loading-menu-items">
                <div class="loading-spinner-small"></div>
                <span>加载菜品中...</span>
              </div>
              <select 
                v-else
                :id="field.id"
                v-model="formData[field.name]"
                :disabled="previewMode || field.disabled"
                class="form-select"
              >
                <option value="" v-if="!field.required">请选择菜品</option>
                <option 
                  v-for="menuItem in menuItems"
                  :key="menuItem.id"
                  :value="menuItem.id"
                  v-if="!field.menuItemIds || field.menuItemIds.includes(menuItem.id)"
                >
                  {{ menuItem.name }} ({{ menuItem.category }}) - ¥{{ menuItem.price.toFixed(2) }}
                </option>
              </select>
            </div>

            <!-- 智能建议 -->
            <div 
              v-if="field.type === 'text' && showSmartSuggestions[field.id] && smartSuggestions[field.id].length > 0"
              class="smart-suggestions"
            >
              <div 
                v-for="(suggestion, index) in smartSuggestions[field.id]" 
                :key="index"
                class="suggestion-item"
                @click="selectSuggestion(field, suggestion)"
              >
                {{ suggestion }}
              </div>
            </div>
          </div>

          <!-- 错误信息 -->
          <div 
            v-if="errors[field.name]" 
            class="field-error"
          >
            {{ errors[field.name] }}
          </div>
        </div>

        <!-- 表单按钮 -->
        <div class="form-actions" v-if="!previewMode">
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="submitting"
          >
            <span v-if="submitting" class="loading-spinner"></span>
            {{ submitting ? '提交中...' : '提交表单' }}
          </button>
          <button 
            type="button" 
            class="btn btn-secondary"
            @click="resetForm"
          >
            重置表单
          </button>
        </div>
      </form>
    </div>

    <div v-else class="form-empty">
      <div class="empty-icon">📝</div>
      <div class="empty-text">表单配置不存在或已被删除</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { intelligentFormService } from '@/services/intelligentFormService'
import type { FormConfig, FormField } from '@/services/intelligentFormService'

// 定义props
const props = defineProps<{
  formConfig: FormConfig | null
  previewMode?: boolean
}>()

// 定义emit
const emit = defineEmits<{
  (e: 'submit', data: Record<string, any>): void
  (e: 'validate', isValid: boolean): void
}>()

// 表单数据
const formData = reactive<Record<string, any>>({})

// 表单验证错误
const errors = reactive<Record<string, string>>({})

// 提交状态
const submitting = ref(false)

// 智能建议相关
const showSmartSuggestions = reactive<Record<string, boolean>>({})
const smartSuggestions = reactive<Record<string, string[]>>({})

// 菜品列表数据
const menuItems = ref<any[]>([])
const loadingMenuItems = ref(false)

// 获取菜品列表
async function fetchMenuItems() {
  loadingMenuItems.value = true
  try {
    menuItems.value = await intelligentFormService.getMenuItems()
  } catch (error) {
    console.error('获取菜品列表失败:', error)
  } finally {
    loadingMenuItems.value = false
  }
}

// 监听表单配置变化
watch(() => props.formConfig, (newConfig) => {
  if (newConfig) {
    // 初始化表单数据
    resetForm()
    // 清空错误
    Object.keys(errors).forEach(key => delete errors[key])
  }
}, { deep: true })

// 生命周期钩子
onMounted(() => {
  if (props.formConfig) {
    resetForm()
  }
  // 获取菜品列表
  fetchMenuItems()
})

// 重置表单
function resetForm() {
  if (!props.formConfig) return
  
  // 重置表单数据
  Object.keys(formData).forEach(key => delete formData[key])
  
  // 设置默认值
  props.formConfig.fields.forEach(field => {
    if (field.defaultValue !== undefined) {
      formData[field.name] = field.defaultValue
    } else if (field.type === 'checkbox') {
      formData[field.name] = []
    } else {
      formData[field.name] = ''
    }
  })
  
  // 清空错误
  Object.keys(errors).forEach(key => delete errors[key])
}

// 处理输入
async function handleInput(field: FormField) {
  // 防抖获取智能建议
  clearTimeout(window.smartSuggestionTimer)
  window.smartSuggestionTimer = setTimeout(async () => {
    if (field.type === 'text' && formData[field.name]) {
      await getSmartSuggestions(field)
    } else {
      hideSmartSuggestions(field)
    }
  }, 300)
}

// 获取智能建议
async function getSmartSuggestions(field: FormField) {
  if (!props.formConfig) return
  
  try {
    const suggestions = await intelligentFormService.getSmartSuggestions(
      props.formConfig.id,
      field.id,
      formData[field.name]
    )
    
    if (suggestions.length > 0) {
      smartSuggestions[field.id] = suggestions
      showSmartSuggestions[field.id] = true
    } else {
      hideSmartSuggestions(field)
    }
  } catch (error) {
    console.error('获取智能建议失败:', error)
    hideSmartSuggestions(field)
  }
}

// 隐藏智能建议
function hideSmartSuggestions(field: FormField) {
  showSmartSuggestions[field.id] = false
  smartSuggestions[field.id] = []
}

// 选择智能建议
function selectSuggestion(field: FormField, suggestion: string) {
  formData[field.name] = suggestion
  hideSmartSuggestions(field)
}

// 处理文件上传
function handleFileChange(field: FormField, event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    formData[field.name] = input.files[0]
  }
}

// 处理图片上传
function handleImageChange(field: FormField, event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      formData[field.name] = e.target?.result
    }
    reader.readAsDataURL(input.files[0])
  }
}

// 移除图片
function removeImage(field: FormField) {
  delete formData[field.name]
  // 重置文件输入
  const input = document.getElementById(field.id) as HTMLInputElement
  if (input) {
    input.value = ''
  }
}

// 验证表单
async function validateForm(): Promise<boolean> {
  if (!props.formConfig || props.previewMode) return true
  
  // 清空之前的错误
  Object.keys(errors).forEach(key => delete errors[key])
  
  // 使用表单服务进行验证
  const isValid = await intelligentFormService.validateFormData(props.formConfig.id, formData)
  
  if (!isValid) {
    // 简单的错误提示（实际应用中应该更详细）
    errors.general = '表单验证失败，请检查填写内容'
    return false
  }
  
  // 检查必填字段
  for (const field of props.formConfig.fields) {
    if (field.required) {
      const value = formData[field.name]
      if (value === undefined || value === null || value === '') {
        errors[field.name] = `${field.label}是必填字段`
      } else if (Array.isArray(value) && value.length === 0) {
        errors[field.name] = `${field.label}是必填字段`
      }
    }
  }
  
  return Object.keys(errors).length === 0
}

// 处理表单提交
async function handleSubmit() {
  if (props.previewMode || !props.formConfig) return
  
  try {
    submitting.value = true
    
    // 验证表单
    const isValid = await validateForm()
    emit('validate', isValid)
    
    if (!isValid) {
      console.error('表单验证失败:', errors)
      return
    }
    
    // 提交表单数据
    const submission = await intelligentFormService.submitFormData(
      props.formConfig.id,
      formData
    )
    
    if (submission) {
      // 表单提交成功
      emit('submit', formData)
      // 重置表单
      resetForm()
      // 显示成功消息
      alert('表单提交成功！')
    } else {
      errors.general = '表单提交失败，请稍后重试'
    }
  } catch (error) {
    console.error('表单提交失败:', error)
    errors.general = '表单提交失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.form-renderer-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.form-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.form-header {
  padding: 1.5rem;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.form-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
}

.form-description {
  margin: 0;
  font-size: 1rem;
  color: #666;
  line-height: 1.5;
}

.form-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-size: 1rem;
  font-weight: bold;
  color: #333;
  display: block;
}

.required-mark {
  color: #f44336;
  margin-left: 0.2rem;
}

.field-control {
  position: relative;
}

.form-input, .form-textarea, .form-select {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus, .form-textarea:focus, .form-select:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

/* 单选按钮组 */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.radio-label:hover {
  background-color: #f5f5f5;
}

.radio-label input[type="radio"] {
  accent-color: #2196f3;
}

/* 复选框组 */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.checkbox-label:hover {
  background-color: #f5f5f5;
}

.checkbox-label input[type="checkbox"] {
  accent-color: #2196f3;
}

/* 文件上传 */
.form-file {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
}

/* 图片上传 */
.image-upload {
  position: relative;
}

.image-preview {
  margin-top: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  max-width: 200px;
  position: relative;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.btn-remove-image {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(244, 67, 54, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-remove-image:hover {
  background-color: rgba(244, 67, 54, 1);
  transform: scale(1.1);
}

/* 智能建议 */
.smart-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-top: none;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}

.suggestion-item {
  padding: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.9rem;
}

.suggestion-item:hover {
  background-color: #e3f2fd;
  color: #2196f3;
}

/* 错误信息 */
.field-error {
  color: #f44336;
  font-size: 0.8rem;
  margin-top: 0.2rem;
}

/* 表单操作按钮 */
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

/* 按钮样式 */
.btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 加载状态 */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空表单提示 */
.form-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  color: #999;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1.1rem;
}

/* 菜品选择器 */
.menu-item-selector {
  position: relative;
}

.loading-menu-items {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem;
  color: #666;
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(33, 150, 243, 0.3);
  border-top: 2px solid #2196f3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-content {
    padding: 1rem;
  }
  
  .form-header {
    padding: 1rem;
  }
  
  .form-title {
    font-size: 1.5rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>