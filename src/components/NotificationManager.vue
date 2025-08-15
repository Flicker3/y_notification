<template>
  <div class="notification-container">
    <Notification
      v-for="notification in notifications"
      :key="notification.id"
      :ref="(el) => setNotificationRef(notification.id, el)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Notification from './Notification.vue';
import type { NotificationOptions } from './index';

interface NotificationItem {
  id: string;
  options: NotificationOptions;
}

const notifications = ref<NotificationItem[]>([]);
const notificationRefs = ref<Map<string, any>>(new Map());

const setNotificationRef = (id: string, el: any) => {
  if (el) {
    notificationRefs.value.set(id, el);
  } else {
    notificationRefs.value.delete(id);
  }
};

const addNotification = (options: NotificationOptions): string => {
  const id = options.key || `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const existingIndex = notifications.value.findIndex(item => item.id === id);
  
  if (existingIndex >= 0) {
    // 如果已存在，更新现有通知
    const notificationRef = notificationRefs.value.get(id);
    if (notificationRef) {
      notificationRef.update(options);
    }
    return id;
  }
  
  // 添加新通知
  notifications.value.push({ id, options });
  
  // 等待DOM更新后显示通知
  setTimeout(() => {
    const notificationRef = notificationRefs.value.get(id);
    if (notificationRef) {
      notificationRef.show(options);
    } else {
      // 如果找不到引用，尝试通过其他方式
      console.warn('Notification ref not found:', id);
    }
  }, 10);
  
  return id;
};

const removeNotification = (id: string) => {
  const index = notifications.value.findIndex(item => item.id === id);
  if (index >= 0) {
    notifications.value.splice(index, 1);
    notificationRefs.value.delete(id);
  }
};

const updateNotification = (id: string, options: Partial<NotificationOptions>) => {
  const notificationRef = notificationRefs.value.get(id);
  if (notificationRef) {
    notificationRef.update(options);
  }
};

const closeNotification = (id: string) => {
  const notificationRef = notificationRefs.value.get(id);
  if (notificationRef) {
    notificationRef.close();
    setTimeout(() => {
      removeNotification(id);
    }, 300); // 等待动画完成
  }
};

const closeAll = () => {
  notifications.value.forEach(item => {
    closeNotification(item.id);
  });
};

// 监听通知关闭事件
const handleNotificationClose = (id: string) => {
  const index = notifications.value.findIndex(item => item.id === id);
  if (index >= 0) {
    notifications.value.splice(index, 1);
    notificationRefs.value.delete(id);
  }
};

// 暴露方法给外部使用
const notificationApi = {
  show: addNotification,
  close: closeNotification,
  closeAll,
  update: updateNotification,
  remove: removeNotification
};

// 将API挂载到window对象，使得可以通过window.$notification访问
onMounted(() => {
  if (typeof window !== 'undefined') {
    (window as any).$notification = notificationApi;
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    delete (window as any).$notification;
  }
});

defineExpose(notificationApi);
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  pointer-events: none;
}

.notification-container > * {
  pointer-events: auto;
  margin-bottom: 10px;
}

@media (max-width: 480px) {
  .notification-container {
    top: 10px;
    right: 10px;
    left: 10px;
  }
}
</style>