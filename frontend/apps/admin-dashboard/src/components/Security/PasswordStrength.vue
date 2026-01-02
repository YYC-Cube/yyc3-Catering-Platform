<template>
  <div class="password-strength">
    <div class="strength-bar">
      <div
        class="strength-fill"
        :class="strengthClass"
        :style="{ width: strengthPercentage + '%' }"
      ></div>
    </div>
    <div class="strength-info">
      <span class="strength-text" :class="strengthClass">
        {{ strengthText }}
      </span>
      <span class="strength-score">{{ passwordData.score }}/5</span>
    </div>
    <div v-if="passwordData.suggestions.length > 0" class="suggestions">
      <div class="suggestions-title">建议：</div>
      <ul class="suggestions-list">
        <li
          v-for="(suggestion, index) in passwordData.suggestions"
          :key="index"
          class="suggestion-item"
        >
          <el-icon :size="14" class="suggestion-icon">
            <InfoFilled />
          </el-icon>
          {{ suggestion }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'
import { InputValidator } from '@/utils/security'

interface Props {
  password: string
  showSuggestions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showSuggestions: true
})

// 计算密码强度
const passwordData = computed(() => {
  return InputValidator.validatePassword(props.password)
})

// 计算强度百分比
const strengthPercentage = computed(() => {
  return (passwordData.value.score / 5) * 100
})

// 计算强度样式类
const strengthClass = computed(() => {
  switch (passwordData.value.level) {
    case 'weak':
      return 'weak'
    case 'medium':
      return 'medium'
    case 'strong':
      return 'strong'
    default:
      return 'weak'
  }
})

// 计算强度文本
const strengthText = computed(() => {
  switch (passwordData.value.level) {
    case 'weak':
      return '弱'
    case 'medium':
      return '中等'
    case 'strong':
      return '强'
    default:
      return '弱'
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/theme.scss';

.password-strength {
  margin-top: $spacing-3;

  .strength-bar {
    height: 4px;
    background: $gray-200;
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: $spacing-2;

    .strength-fill {
      height: 100%;
      transition: width 0.3s ease, background-color 0.3s ease;

      &.weak {
        background: linear-gradient(90deg, #f56c6c, #ff7875);
      }

      &.medium {
        background: linear-gradient(90deg, #e6a23c, #f7ba2a);
      }

      &.strong {
        background: linear-gradient(90deg, #67c23a, #95d475);
      }
    }
  }

  .strength-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-3;

    .strength-text {
      font-weight: $font-weight-medium;

      &.weak {
        color: $danger-color;
      }

      &.medium {
        color: $warning-color;
      }

      &.strong {
        color: $success-color;
      }
    }

    .strength-score {
      font-size: $font-size-sm;
      color: $text-secondary;
    }
  }

  .suggestions {
    .suggestions-title {
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
      color: $text-primary;
      margin-bottom: $spacing-2;
    }

    .suggestions-list {
      list-style: none;
      padding: 0;
      margin: 0;

      .suggestion-item {
        display: flex;
        align-items: flex-start;
        gap: $spacing-1;
        font-size: $font-size-sm;
        color: $text-secondary;
        margin-bottom: $spacing-1;

        .suggestion-icon {
          color: $info-color;
          margin-top: 2px;
          flex-shrink: 0;
        }
      }
    }
  }
}

// 深色主题支持
@media (prefers-color-scheme: dark) {
  .password-strength {
    .strength-bar {
      background: $dark-border-primary;
    }

    .suggestions-title {
      color: $dark-text-primary;
    }

    .suggestion-item {
      color: $dark-text-secondary;
    }
  }
}
</style>