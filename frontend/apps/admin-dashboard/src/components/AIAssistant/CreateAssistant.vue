<template>
  <div class="create-assistant">
    <el-form
      ref="assistantFormRef"
      :model="assistantForm"
      :rules="assistantRules"
      label-width="140px"
      label-position="top"
    >
      <!-- 基本信息 -->
      <el-card class="form-section">
        <template #header>
          <div class="section-header">
            <h3>基本信息</h3>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="助手名称" prop="name">
              <el-input
                v-model="assistantForm.name"
                placeholder="请输入AI助手名称"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="助手类型" prop="type">
              <el-select
                v-model="assistantForm.type"
                placeholder="请选择助手类型"
                style="width: 100%"
                @change="updatePersonalityDefaults"
              >
                <el-option label="通用助手" :value="AssistantType.GENERAL" />
                <el-option label="专业助手" :value="AssistantType.SPECIALIZED" />
                <el-option label="上下文助手" :value="AssistantType.CONTEXTUAL" />
                <el-option label="协作助手" :value="AssistantType.COLLABORATIVE" />
                <el-option label="分析助手" :value="AssistantType.ANALYTICAL" />
                <el-option label="创意助手" :value="AssistantType.CREATIVE" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="头像">
          <el-upload
            v-model="assistantForm.avatar"
            class="avatar-uploader"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            accept="image/*"
          >
            <img v-if="assistantForm.avatar" :src="assistantForm.avatar" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="assistantForm.description"
            type="textarea"
            :rows="3"
            placeholder="请描述AI助手的主要功能和应用场景"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-card>

      <!-- 个性化设置 -->
      <el-card class="form-section">
        <template #header>
          <div class="section-header">
            <h3>个性化设置</h3>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="语调风格">
              <el-select v-model="assistantForm.personality.tone" style="width: 100%">
                <el-option label="专业" value="professional" />
                <el-option label="友好" value="friendly" />
                <el-option label="休闲" value="casual" />
                <el-option label="正式" value="formal" />
                <el-option label="热情" value="enthusiastic" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="响应风格">
              <el-select v-model="assistantForm.personality.responseStyle" style="width: 100%">
                <el-option label="简洁" value="concise" />
                <el-option label="详细" value="detailed" />
                <el-option label="结构化" value="structured" />
                <el-option label="对话式" value="conversational" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="语言">
              <el-select v-model="assistantForm.personality.language" style="width: 100%">
                <el-option label="中文" value="zh-CN" />
                <el-option label="英语" value="en-US" />
                <el-option label="日语" value="ja" />
                <el-option label="韩语" value="ko" />
                <el-option label="法语" value="fr" />
                <el-option label="德语" value="de" />
                <el-option label="西班牙语" value="es" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="文化背景">
          <el-select v-model="assistantForm.personality.cultural" style="width: 100%">
            <el-option label="中国文化" value="chinese" />
            <el-option label="西方文化" value="western" />
            <el-option label="国际化" value="international" />
          </el-select>
        </el-form-item>
      </el-card>

      <!-- 能力配置 -->
      <el-card class="form-section">
        <template #header>
          <div class="section-header">
            <h3>能力配置</h3>
            <el-button type="primary" plain size="small" @click="addCapability">
              <el-icon><Plus /></el-icon>
              添加能力
            </el-button>
          </div>
        </template>

        <div class="capabilities-list">
          <div
            v-for="(capability, index) in assistantForm.capabilities"
            :key="index"
            class="capability-item"
          >
            <el-row :gutter="16">
              <el-col :span="6">
                <el-form-item :label="`能力 ${index + 1}`">
                  <el-select
                    v-model="capability.name"
                    placeholder="选择能力"
                    style="width: 100%"
                  >
                    <el-option label="自然语言处理" value="nlp" />
                    <el-option label="计算机视觉" value="computer_vision" />
                    <el-option label="数据分析" value="data_analysis" />
                    <el-option label="逻辑推理" value="reasoning" />
                    <el-option label="创意生成" value="creativity" />
                    <el-option label="领域知识" value="domain" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="熟练度">
                  <el-slider
                    v-model="capability.proficiency"
                    :min="0"
                    :max="100"
                    show-input
                  />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="启用">
                  <el-switch v-model="capability.enabled" />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="操作">
                  <el-button
                    type="danger"
                    plain
                    size="small"
                    @click="removeCapability(index)"
                  >
                    删除
                  </el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-card>

      <!-- 专业领域 -->
      <el-card class="form-section">
        <template #header>
          <div class="section-header">
            <h3>专业领域</h3>
          </div>
        </template>

        <el-form-item label="专业特长">
          <el-select
            v-model="assistantForm.specializations"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请输入或选择专业领域"
            style="width: 100%"
          >
            <el-option label="餐饮管理" value="餐饮管理" />
            <el-option label="客户服务" value="客户服务" />
            <el-option label="数据分析" value="数据分析" />
            <el-option label="决策支持" value="决策支持" />
            <el-option label="项目协调" value="项目协调" />
            <el-option label="质量管控" value="质量管控" />
            <el-option label="财务管理" value="财务管理" />
            <el-option label="人力资源" value="人力资源" />
          </el-select>
        </el-form-item>

        <el-form-item label="知识领域">
          <el-checkbox-group v-model="assistantForm.knowledgeDomains">
            <el-checkbox label="餐饮业务">餐饮业务</el-checkbox>
            <el-checkbox label="客户关系">客户关系</el-checkbox>
            <el-checkbox label="供应链管理">供应链管理</el-checkbox>
            <el-checkbox label="财务分析">财务分析</el-checkbox>
            <el-checkbox label="运营管理">运营管理</el-checkbox>
            <el-checkbox label="市场营销">市场营销</el-checkbox>
            <el-checkbox label="产品开发">产品开发</el-checkbox>
            <el-checkbox label="技术支持">技术支持</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-card>

      <!-- 偏好设置 -->
      <el-card class="form-section">
        <template #header>
          <div class="section-header">
            <h3>偏好设置</h3>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="响应长度">
              <el-radio-group v-model="assistantForm.preferences.responseLength">
                <el-radio label="short">简短</el-radio>
                <el-radio label="medium">中等</el-radio>
                <el-radio label="long">详细</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="包含示例">
              <el-switch v-model="assistantForm.preferences.includeExamples" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="提供来源">
              <el-switch v-model="assistantForm.preferences.provideSources" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="主动协助">
              <el-switch v-model="assistantForm.preferences.proactiveAssistance" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 系统集成 -->
      <el-card class="form-section">
        <template #header>
          <div class="section-header">
            <h3>系统集成</h3>
          </div>
        </template>

        <el-form-item label="连接系统">
          <el-checkbox-group v-model="assistantForm.integrations.connectedSystems">
            <el-checkbox label="多智能体系统">多智能体系统</el-checkbox>
            <el-checkbox label="决策引擎">决策引擎</el-checkbox>
            <el-checkbox label="知识图谱">知识图谱</el-checkbox>
            <el-checkbox label="数据库">数据库</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="API接口">
          <el-checkbox-group v-model="assistantForm.integrations.apis">
            <el-checkbox label="用户管理API">用户管理API</el-checkbox>
            <el-checkbox label="订单API">订单API</el-checkbox>
            <el-checkbox label="菜单API">菜单API</el-checkbox>
            <el-checkbox label="库存API">库存API</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="工具服务">
          <el-checkbox-group v-model="assistantForm.integrations.tools">
            <el-checkbox label="数据分析工具">数据分析工具</el-checkbox>
            <el-checkbox label="报告生成">报告生成</el-checkbox>
            <el-checkbox label="实时监控">实时监控</el-checkbox>
            <el-checkbox label="预测分析">预测分析</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-card>

      <!-- 高级设置 -->
      <el-card class="form-section">
        <template #header>
          <div class="section-header">
            <h3>高级设置</h3>
          </div>
        </template>

        <el-form-item label="模型配置">
          <el-select v-model="assistantForm.learning.modelVersion" style="width: 200px; margin-right: 12px">
            <el-option label="GPT-4" value="gpt-4" />
            <el-option label="Claude-3" value="claude-3" />
            <el-option label="Gemini-Pro" value="gemini-pro" />
          </el-select>
          <el-button size="small" @click="showModelConfig = !showModelConfig">
            配置
          </el-button>
        </el-form-item>

        <el-form-item label="自适应率">
          <el-slider
            v-model="assistantForm.learning.adaptationRate"
            :min="0"
            :max="100"
            :step="5"
            show-input
            style="width: 300px"
          />
          <span class="form-tip">数值越高，助手适应能力越强</span>
        </el-form-item>

        <el-form-item label="错误处理">
          <el-radio-group v-model="assistantForm.errorHandling">
            <el-radio label="retry">重试机制</el-radio>
            <el-radio label="fallback">降级处理</el-radio>
            <el-radio label="escalate">升级处理</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="安全限制">
          <div class="security-settings">
            <div class="setting-item">
              <span class="setting-label">最大令牌数:</span>
              <el-input-number
                v-model="assistantForm.security.maxTokens"
                :min="1000"
                :max="32000"
                style="width: 120px"
              />
            </div>
            <div class="setting-item">
              <span class="setting-label">并发连接:</span>
              <el-input-number
                v-model="assistantForm.security.maxConcurrent"
                :min="1"
                :max="100"
                style="width: 120px"
              />
            </div>
            <div class="setting-item">
              <span class="setting-label">请求频率:</span>
              <el-input-number
                v-model="assistantForm.security.requestRate"
                :min="1"
                :max="1000"
                style="width: 120px"
              />
              <span class="form-tip">次/分钟</span>
            </div>
          </div>
        </el-form-item>
      </el-card>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <el-button size="large" @click="handleCancel">取消</el-button>
        <el-button
          type="primary"
          size="large"
          :loading="submitting"
          @click="handleSubmit"
        >
          创建助手
        </el-button>
      </div>
    </el-form>

    <!-- 模型配置对话框 -->
    <el-dialog
      v-model="showModelConfig"
      title="模型配置"
      width="60%"
      destroy-on-close
    >
      <div class="model-config">
        <el-form label-width="120px">
          <el-form-item label="温度参数">
            <el-slider
              v-model="modelConfig.temperature"
              :min="0"
              :max="2"
              :step="0.1"
              show-input
            />
            <div class="form-tip">控制输出的随机性，越高越有创造性</div>
          </el-form-item>

          <el-form-item label="最大长度">
            <el-input-number
              v-model="modelConfig.maxLength"
              :min="100"
              :max="4000"
              show-input
            />
            <div class="form-tip">生成文本的最大长度</div>
          </el-form-item>

          <el-form-item label="停止序列">
            <el-input
              v-model="modelConfig.stopSequences"
              placeholder="输入停止序列，多个用逗号分隔"
            />
            <div class="form-tip">遇到这些序列时停止生成</div>
          </el-form-item>

          <el-form-item label="系统提示">
            <el-input
              v-model="modelConfig.systemPrompt"
              type="textarea"
              :rows="4"
              placeholder="输入系统提示词"
            />
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { aiAssistantAPI } from '@/api/ai-assistant'
import type { AssistantType, AIAssistant } from '@/api/ai-assistant'

// Emits
const emit = defineEmits<{
  success: []
  cancel: []
}>()

// 响应式数据
const assistantFormRef = ref<InstanceType<typeof ElForm>>()
const submitting = ref(false)
const showModelConfig = ref(false)

const assistantForm = reactive({
  name: '',
  type: AssistantType.GENERAL,
  avatar: '',
  description: '',
  personality: {
    tone: 'professional',
    responseStyle: 'conversational',
    language: 'zh-CN',
    cultural: 'chinese'
  },
  capabilities: [] as Array<{
    name: string
    proficiency: number
    enabled: boolean
    configuration: Record<string, any>
  }>,
  specializations: [] as string[],
  knowledgeDomains: [] as string[],
  preferences: {
    responseLength: 'medium',
    includeExamples: true,
    provideSources: false,
    proactiveAssistance: false,
    askClarifications: true
  },
  integrations: {
    connectedSystems: [] as string[],
    apis: [] as string[],
    databases: [] as string[],
    tools: [] as string[]
  },
  learning: {
    adaptationRate: 50,
    modelVersion: 'gpt-4'
  },
  errorHandling: 'retry',
  security: {
    maxTokens: 8000,
    maxConcurrent: 10,
    requestRate: 60
  }
})

const modelConfig = reactive({
  temperature: 0.7,
  maxLength: 2000,
  stopSequences: '',
  systemPrompt: ''
})

// 表单验证规则
const assistantRules = {
  name: [
    { required: true, message: '请输入助手名称', trigger: 'blur' },
    { min: 2, max: 50, message: '名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择助手类型', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入助手描述', trigger: 'blur' },
    { min: 10, max: 200, message: '描述长度在 10 到 200 个字符', trigger: 'blur' }
  ]
}

// 生命周期
onMounted(() => {
  addDefaultCapabilities()
})

// 方法
const addDefaultCapabilities = () => {
  assistantForm.capabilities = [
    { name: 'nlp', proficiency: 85, enabled: true, configuration: {} },
    { name: 'reasoning', proficiency: 80, enabled: true, configuration: {} },
    { name: 'creativity', proficiency: 75, enabled: true, configuration: {} }
  ]
}

const addCapability = () => {
  assistantForm.capabilities.push({
    name: '',
    proficiency: 70,
    enabled: true,
    configuration: {}
  })
}

const removeCapability = (index: number) => {
  assistantForm.capabilities.splice(index, 1)
}

const updatePersonalityDefaults = () => {
  // 根据助手类型调整默认人格设置
  switch (assistantForm.type) {
    case AssistantType.PROFESSIONAL:
      assistantForm.personality.tone = 'professional'
      assistantForm.personality.responseStyle = 'structured'
      break
    case AssistantType.CREATIVE:
      assistantForm.personality.tone = 'enthusiastic'
      assistantForm.personality.responseStyle = 'detailed'
      break
    case AssistantType.ANALYTICAL:
      assistantForm.personality.tone = 'formal'
      assistantForm.personality.responseStyle = 'structured'
      break
    case AssistantType.COLLABORATIVE:
      assistantForm.personality.tone = 'friendly'
      assistantForm.personality.responseStyle = 'conversational'
      break
  }
}

const handleAvatarSuccess = (response: any) => {
  assistantForm.avatar = response.url
}

const beforeAvatarUpload = (file: any) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('上传头像只能是图片格式!')
  }
  if (!isLt2M) {
    ElMessage.error('上传头像大小不能超过 2MB!')
  }
  return isImage && isLt2M
}

const validateForm = (): boolean => {
  if (!assistantFormRef.value) return false

  return assistantFormRef.value.validate().catch(() => false)
}

const handleSubmit = async () => {
  const isValid = await validateForm()
  if (!isValid) return

  try {
    submitting.value = true

    // 构建助手数据
    const assistantData = {
      name: assistantForm.name,
      type: assistantForm.type,
      avatar: assistantForm.avatar,
      personality: assistantForm.personality,
      capabilities: assistantForm.capabilities,
      specializations: assistantForm.specializations,
      knowledgeDomains: assistantForm.knowledgeDomains,
      preferences: assistantForm.preferences,
      integrations: assistantForm.integrations,
      performance: {
        accuracy: 95,
        responseTime: 800,
        satisfaction: 90,
        tasksCompleted: 0,
        errorRate: 5
      },
      learning: assistantForm.learning,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    }

    const response = await aiAssistantAPI.createAssistant(assistantData)
    if (response.success) {
      ElMessage.success('AI助手创建成功')
      emit('success')
    } else {
      ElMessage.error(response.message || '创建助手失败')
    }
  } catch (error) {
    console.error('Create assistant failed:', error)
    ElMessage.error('创建助手失败')
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style lang="scss" scoped>
.create-assistant {
  .form-section {
    margin-bottom: 24px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }
  }

  .avatar-uploader {
    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: block;
    }

    .avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 80px;
      height: 80px;
      line-height: 80px;
      text-align: center;
      border: 1px dashed #d9d9d9;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: #409eff;
        color: #409eff;
      }
    }
  }

  .capabilities-list {
    .capability-item {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
    }
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 24px;
    border-top: 1px solid #e4e7ed;
    margin-top: 24px;
  }

  .security-settings {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    .setting-item {
      display: flex;
      align-items: center;
      gap: 8px;

      .setting-label {
        font-size: 14px;
        color: #606266;
        min-width: 100px;
      }
    }
  }

  .model-config {
    .form-tip {
      font-size: 12px;
      color: #909399;
      margin-left: 4px;
      margin-top: 4px;
    }
  }
}

@media (max-width: 768px) {
  .create-assistant {
    .security-settings {
      grid-template-columns: 1fr;
    }

    .form-actions {
      flex-direction: column;
    }
  }
}
</style>