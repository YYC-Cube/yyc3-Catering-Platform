<template>
  <div v-if="hasAccess" class="permission-guard">
    <slot />
  </div>
  <div v-else class="permission-denied">
    <el-result
      icon="warning"
      title="权限不足"
      :sub-title="`您没有权限访问 ${resource || '此功能'}，请联系管理员获取相应权限。`"
    >
      <template #extra>
        <el-button type="primary" @click="handleBack">
          返回
        </el-button>
        <el-button v-if="showContact" @click="handleContact">
          联系管理员
        </el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { PermissionManager, AuditLogger } from '@/utils/security'

interface Props {
  permissions: string | string[]
  resource?: string
  mode?: 'any' | 'all'
  showContact?: boolean
  fallbackPath?: string
  auditOnDeny?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'any',
  showContact: true,
  fallbackPath: '/dashboard',
  auditOnDeny: true
})

const router = useRouter()

// 计算是否有权限
const hasAccess = computed(() => {
  const permissionList = Array.isArray(props.permissions) ? props.permissions : [props.permissions]

  if (props.mode === 'all') {
    return PermissionManager.hasAllPermissions(permissionList)
  } else {
    return PermissionManager.hasAnyPermission(permissionList)
  }
})

// 处理返回
const handleBack = () => {
  router.push(props.fallbackPath)
}

// 处理联系管理员
const handleContact = () => {
  // 记录审计日志
  if (props.auditOnDeny) {
    AuditLogger.log({
      action: 'permission_denied_contact',
      resource: props.resource || 'unknown',
      details: {
        requiredPermissions: props.permissions,
        userPermissions: PermissionManager.getPermissions()
      }
    })
  }

  ElMessage.info('请联系系统管理员获取相应权限')
}

// 审计拒绝访问
if (!hasAccess.value && props.auditOnDeny) {
  AuditLogger.log({
    action: 'permission_denied',
    resource: props.resource || 'unknown',
    details: {
      requiredPermissions: props.permissions,
      userPermissions: PermissionManager.getPermissions(),
      mode: props.mode
    }
  })
}
</script>

<style scoped lang="scss">
@use '@/styles/theme.scss';

.permission-guard {
  // 继承父容器样式
}

.permission-denied {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: $spacing-6;

  :deep(.el-result) {
    .el-result__icon {
      color: $warning-color;
    }

    .el-result__title {
      color: $text-primary;
    }

    .el-result__subtitle {
      color: $text-secondary;
    }
  }
}
</style>