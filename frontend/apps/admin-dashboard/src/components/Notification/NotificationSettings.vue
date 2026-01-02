<template>
  <div class="notification-settings">
    <el-form :model="settingsForm" :rules="rules" ref="settingsFormRef" label-width="120px">
      <!-- 通知方式 -->
      <el-form-item label="通知方式">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-switch
              v-model="settingsForm.emailEnabled"
              active-text="邮件通知"
              :active-value="true"
              :inactive-value="false"
            />
          </el-col>
          <el-col :span="6">
            <el-switch
              v-model="settingsForm.smsEnabled"
              active-text="短信通知"
              :active-value="true"
              :inactive-value="false"
            />
          </el-col>
          <el-col :span="6">
            <el-switch
              v-model="settingsForm.pushEnabled"
              active-text="推送通知"
              :active-value="true"
              :inactive-value="false"
            />
          </el-col>
          <el-col :span="6">
            <el-switch
              v-model="settingsForm.soundEnabled"
              active-text="声音提醒"
              :active-value="true"
              :inactive-value="false"
            />
          </el-col>
        </el-row>
      </el-form-item>

      <!-- 免打扰时间 -->
      <el-form-item label="免打扰时间">
        <el-switch
          v-model="settingsForm.quietHours.enabled"
          active-text="启用免打扰"
          :active-value="true"
          :inactive-value="false"
        />
        <el-time-picker
          v-if="settingsForm.quietHours.enabled"
          v-model="quietTimeRange"
          is-range
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          format="HH:mm"
          @change="handleQuietTimeChange"
          style="margin-left: 20px;"
        />
      </el-form-item>

      <!-- 通知类型偏好 -->
      <el-form-item label="通知类型">
        <el-checkbox-group v-model="enabledNotificationTypes">
          <el-row :gutter="10">
            <el-col :span="8" v-for="type in notificationTypes" :key="type.value">
              <el-checkbox :value="type.value" :label="type.value">
                <div class="notification-type-item">
                  <el-icon :color="type.color">
                    <component :is="type.icon" />
                  </el-icon>
                  <span>{{ type.label }}</span>
                </div>
              </el-checkbox>
            </el-col>
          </el-row>
        </el-checkbox-group>
      </el-form-item>

      <!-- 频率限制 -->
      <el-form-item label="频率限制">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="每小时最多">
              <el-input-number
                v-model="settingsForm.frequencyLimits.maxPerHour"
                :min="1"
                :max="100"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="每天最多">
              <el-input-number
                v-model="settingsForm.frequencyLimits.maxPerDay"
                :min="1"
                :max="1000"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="每周最多">
              <el-input-number
                v-model="settingsForm.frequencyLimits.maxPerWeek"
                :min="1"
                :max="5000"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form-item>

      <!-- 通知模板设置 -->
      <el-form-item label="通知模板">
        <el-button @click="showTemplates = true">管理模板</el-button>
      </el-form-item>

      <!-- 桌面通知设置 -->
      <el-form-item label="桌面通知" v-if="isDesktopSupported">
        <el-switch
          v-model="desktopNotificationEnabled"
          active-text="启用桌面通知"
          :active-value="true"
          :inactive-value="false"
          @change="handleDesktopNotificationChange"
        />
        <el-button
          v-if="desktopNotificationEnabled"
          @click="testDesktopNotification"
          style="margin-left: 20px;"
        >
          测试桌面通知
        </el-button>
      </el-form-item>

      <!-- 测试通知 -->
      <el-form-item>
        <el-button type="primary" @click="saveSettings" :loading="saving">
          保存设置
        </el-button>
        <el-button @click="resetSettings">
          重置
        </el-button>
        <el-button @click="testNotification">
          发送测试通知
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 通知模板对话框 -->
    <el-dialog v-model="showTemplates" title="通知模板管理" width="80%">
      <NotificationTemplates v-if="showTemplates" @close="showTemplates = false" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  InfoFilled,
  SuccessFilled,
  WarningFilled,
  CircleCloseFilled,
  ShoppingCart,
  Kitchen,
  CreditCard,
  Monitor,
  Promotion
} from '@element-plus/icons-vue'
import {
  updateNotificationSettings,
  getNotificationSettings,
  createNotification,
  NotificationType,
  NotificationPriority
} from '@/api/notification'
import NotificationTemplates from './NotificationTemplates.vue'

const emit = defineEmits<{
  close: []
}>()

// 响应式数据
const settingsFormRef = ref()
const saving = ref(false)
const showTemplates = ref(false)
const desktopNotificationEnabled = ref(false)
const quietTimeRange = ref<[Date, Date] | null>(null)
const enabledNotificationTypes = ref<NotificationType[]>([])

const settingsForm = reactive({
  emailEnabled: true,
  smsEnabled: false,
  pushEnabled: true,
  soundEnabled: true,
  desktopEnabled: false,
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00'
  },
  preferences: {} as Record<NotificationType, {
    enabled: boolean
    sound?: boolean
    desktop?: boolean
    email?: boolean
    sms?: boolean
  }>,
  frequencyLimits: {
    maxPerHour: 10,
    maxPerDay: 100,
    maxPerWeek: 500
  }
})

const rules = {
  'frequencyLimits.maxPerHour': [
    { required: true, message: '请输入每小时最大通知数', trigger: 'blur' },
    { type: 'number', min: 1, max: 100, message: '范围1-100', trigger: 'blur' }
  ],
  'frequencyLimits.maxPerDay': [
    { required: true, message: '请输入每天最大通知数', trigger: 'blur' },
    { type: 'number', min: 1, max: 1000, message: '范围1-1000', trigger: 'blur' }
  ],
  'frequencyLimits.maxPerWeek': [
    { required: true, message: '请输入每周最大通知数', trigger: 'blur' },
    { type: 'number', min: 1, max: 5000, message: '范围1-5000', trigger: 'blur' }
  ]
}

// 通知类型列表
const notificationTypes = [
  {
    value: NotificationType.INFO,
    label: '信息通知',
    icon: InfoFilled,
    color: '#409EFF'
  },
  {
    value: NotificationType.SUCCESS,
    label: '成功通知',
    icon: SuccessFilled,
    color: '#67C23A'
  },
  {
    value: NotificationType.WARNING,
    label: '警告通知',
    icon: WarningFilled,
    color: '#E6A23C'
  },
  {
    value: NotificationType.ERROR,
    label: '错误通知',
    icon: CircleCloseFilled,
    color: '#F56C6C'
  },
  {
    value: NotificationType.ORDER,
    label: '订单通知',
    icon: ShoppingCart,
    color: '#909399'
  },
  {
    value: NotificationType.KITCHEN,
    label: '厨房通知',
    icon: Kitchen,
    color: '#FF9800'
  },
  {
    value: NotificationType.PAYMENT,
    label: '支付通知',
    icon: CreditCard,
    color: '#4CAF50'
  },
  {
    value: NotificationType.SYSTEM,
    label: '系统通知',
    icon: Monitor,
    color: '#606266'
  },
  {
    value: NotificationType.MARKETING,
    label: '营销通知',
    icon: Promotion,
    color: '#E91E63'
  }
]

// 计算属性
const isDesktopSupported = computed(() => 'Notification' in window)

// 方法
const loadSettings = async () => {
  try {
    const response = await getNotificationSettings()
    if (response.success && response.data) {
      Object.assign(settingsForm, response.data)

      // 设置免打扰时间
      if (response.data.quietHours?.enabled) {
        const [startHour, startMin] = response.data.quietHours.startTime.split(':')
        const [endHour, endMin] = response.data.quietHours.endTime.split(':')

        const startDate = new Date()
        startDate.setHours(parseInt(startHour), parseInt(startMin), 0, 0)

        const endDate = new Date()
        endDate.setHours(parseInt(endHour), parseInt(endMin), 0, 0)

        quietTimeRange.value = [startDate, endDate]
      }

      // 设置启用的通知类型
      enabledNotificationTypes.value = Object.entries(response.data.preferences)
        .filter(([_, pref]) => pref.enabled)
        .map(([type, _]) => type as NotificationType)

      // 检查桌面通知权限
      if (isDesktopSupported.value) {
        desktopNotificationEnabled.value = Notification.permission === 'granted'
      }
    }
  } catch (error) {
    console.error('Load settings failed:', error)
    ElMessage.error('加载设置失败')
  }
}

const saveSettings = async () => {
  if (!settingsFormRef.value) return

  try {
    await settingsFormRef.value.validate()
    saving.value = true

    // 更新偏好设置
    Object.keys(NotificationType).forEach(type => {
      if (!settingsForm.preferences[type as NotificationType]) {
        settingsForm.preferences[type as NotificationType] = {
          enabled: enabledNotificationTypes.value.includes(type as NotificationType)
        }
      }
    })

    const response = await updateNotificationSettings(settingsForm)
    if (response.success) {
      ElMessage.success('设置保存成功')
      emit('close')
    } else {
      ElMessage.error(response.message || '保存设置失败')
    }
  } catch (error) {
    console.error('Save settings failed:', error)
    ElMessage.error('保存设置失败')
  } finally {
    saving.value = false
  }
}

const resetSettings = () => {
  // 重置为默认值
  settingsForm.emailEnabled = true
  settingsForm.smsEnabled = false
  settingsForm.pushEnabled = true
  settingsForm.soundEnabled = true
  settingsForm.desktopEnabled = false
  settingsForm.quietHours.enabled = false
  settingsForm.quietHours.startTime = '22:00'
  settingsForm.quietHours.endTime = '08:00'
  settingsForm.frequencyLimits.maxPerHour = 10
  settingsForm.frequencyLimits.maxPerDay = 100
  settingsForm.frequencyLimits.maxPerWeek = 500

  enabledNotificationTypes.value = [
    NotificationType.INFO,
    NotificationType.SUCCESS,
    NotificationType.WARNING,
    NotificationType.ERROR,
    NotificationType.ORDER,
    NotificationType.KITCHEN,
    NotificationType.PAYMENT
  ]
}

const handleQuietTimeChange = (timeRange: [Date, Date] | null) => {
  if (timeRange) {
    const formatTime = (date: Date) => {
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    }

    settingsForm.quietHours.startTime = formatTime(timeRange[0])
    settingsForm.quietHours.endTime = formatTime(timeRange[1])
  }
}

const handleDesktopNotificationChange = async (enabled: boolean) => {
  if (!enabled) {
    desktopNotificationEnabled.value = false
    return
  }

  if (isDesktopSupported.value) {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      desktopNotificationEnabled.value = permission === 'granted'

      if (permission === 'granted') {
        ElMessage.success('桌面通知已启用')
      } else {
        ElMessage.warning('桌面通知权限被拒绝')
      }
    } else {
      desktopNotificationEnabled.value = Notification.permission === 'granted'
    }
  }
}

const testDesktopNotification = () => {
  if (isDesktopSupported.value && Notification.permission === 'granted') {
    new Notification('测试通知', {
      body: '这是一条测试桌面通知',
      icon: '/favicon.ico',
      tag: 'test'
    })
  }
}

const testNotification = async () => {
  try {
    const response = await createNotification({
      type: NotificationType.INFO,
      priority: NotificationPriority.NORMAL,
      title: '测试通知',
      message: '这是一条测试通知，用于验证您的通知设置是否正常工作。',
      isSilent: false,
      recipients: [parseInt(localStorage.getItem('user_id') || '1', 10)]
    })

    if (response.success) {
      ElMessage.success('测试通知已发送')
    } else {
      ElMessage.error('发送测试通知失败')
    }
  } catch (error) {
    console.error('Test notification failed:', error)
    ElMessage.error('发送测试通知失败')
  }
}

// 监听通知类型变化
watch(enabledNotificationTypes, (newTypes) => {
  Object.keys(NotificationType).forEach(type => {
    if (settingsForm.preferences[type as NotificationType]) {
      settingsForm.preferences[type as NotificationType].enabled =
        newTypes.includes(type as NotificationType)
    }
  })
}, { deep: true })

// 生命周期
onMounted(() => {
  loadSettings()
})
</script>

<style scoped lang="scss">
@use '@/styles/theme.scss';

.notification-settings {
  .notification-type-item {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    font-size: $font-size-sm;
  }

  .el-form-item {
    margin-bottom: $spacing-6;
  }

  .el-row {
    margin-bottom: $spacing-2;
  }
}

// 响应式设计
@media (max-width: $breakpoint-md) {
  .notification-settings {
    .el-row {
      .el-col {
        margin-bottom: $spacing-3;
      }
    }
  }
}
</style>