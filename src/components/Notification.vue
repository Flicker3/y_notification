<template>
  <transition name="notification">
    <div v-if="visible" class="notification" :class="[options.type, `notification-${options.type}`]">
      <div class="notification-content">
        <!-- 自定义内容插槽 -->
        <div v-if="options.content" class="notification-custom">
          <component v-if="isVueComponent(options.content)" :is="options.content" v-bind="options.props" />
          <div v-else-if="typeof options.content === 'function'" v-html="options.content()"></div>
          <div v-else v-html="options.content"></div>
        </div>
        
        <!-- 默认内容 -->
        <div v-else>
          <h4 v-if="options.title" class="notification-title">{{ options.title }}</h4>
          <p v-if="options.message" class="notification-message">{{ options.message }}</p>
        </div>
      </div>
      
      <button v-if="options.closable !== false" class="close-btn" @click="close">×</button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, defineComponent, getCurrentInstance } from 'vue';
import type { NotificationOptions } from './index';

const visible = ref(false);
const options = ref<NotificationOptions>({
  type: 'info',
  title: '',
  message: '',
  duration: 3000,
  closable: true
});

let timer: ReturnType<typeof setTimeout>;
let closeTimer: ReturnType<typeof setTimeout>;

const isVueComponent = (content: any): boolean => {
  return typeof content === 'object' && content !== null && content.__file;
};

const close = () => {
  visible.value = false;
  if (options.value.onClose) {
    options.value.onClose();
  }
};

const show = (config: NotificationOptions) => {
  options.value = { ...options.value, ...config };
  visible.value = true;
  
  // 清除之前的定时器
  if (timer) clearTimeout(timer);
  if (closeTimer) clearTimeout(closeTimer);
  
  // 如果设置了持续时间，自动关闭
  if (options.value.duration && options.value.duration > 0) {
    timer = setTimeout(close, options.value.duration);
  }
};

const update = (newOptions: Partial<NotificationOptions>) => {
  options.value = { ...options.value, ...newOptions };
  
  // 重置计时器
  if (timer) {
    clearTimeout(timer);
    if (options.value.duration && options.value.duration > 0) {
      timer = setTimeout(close, options.value.duration);
    }
  }
};

// 数据变化检测 - 重置计时器
const resetTimer = () => {
  if (timer) {
    clearTimeout(timer);
    if (options.value.duration && options.value.duration > 0) {
      timer = setTimeout(close, options.value.duration);
    }
  }
};

defineExpose({
  show,
  close,
  update,
  resetTimer
});
</script>

<style scoped>
.notification {
  position: fixed;
  right: 20px;
  top: 20px;
  min-width: 300px;
  max-width: 400px;
  padding: 16px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: #fff;
  transition: all 0.3s ease;
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  color: #333;
  border: 1px solid #e4e7ed;
}

.notification.success {
  border-left: 4px solid #67c23a;
  background-color: #f0f9ff;
}

.notification.warning {
  border-left: 4px solid #e6a23c;
  background-color: #fffbeb;
}

.notification.error {
  border-left: 4px solid #f56c6c;
  background-color: #fef2f2;
}

.notification.info {
  border-left: 4px solid #909399;
  background-color: #f4f4f5;
}

.notification-content {
  flex: 1;
  margin-right: 8px;
}

.notification-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.notification-message {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #606266;
}

.notification-custom {
  width: 100%;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.close-btn {
  margin-left: 10px;
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #909399;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #606266;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .notification {
    right: 10px;
    left: 10px;
    min-width: auto;
    max-width: none;
  }
}
</style>
