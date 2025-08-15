<template>
  <div id="app">
    <div class="demo-container">
      <h1>Vue3 Notification 测试</h1>
      
      <div class="demo-section">
        <h2>基础通知</h2>
        <div class="button-group">
          <button @click="showSuccess" class="btn btn-success">成功通知</button>
          <button @click="showWarning" class="btn btn-warning">警告通知</button>
          <button @click="showError" class="btn btn-error">错误通知</button>
          <button @click="showInfo" class="btn btn-info">信息通知</button>
        </div>
      </div>

      <div class="demo-section">
        <h2>数据变化监控</h2>
        
        <div class="data-demo">
          <h3>计数器: {{ counter }}</h3>
          <button @click="incrementCounter" class="btn">增加计数</button>
          <button @click="decrementCounter" class="btn">减少计数</button>
          <button @click="resetCounter" class="btn">重置</button>
        </div>

        <div class="data-demo">
          <h3>用户信息</h3>
          <p>姓名: {{ user.name }}</p>
          <p>年龄: {{ user.age }}</p>
          <button @click="updateUser" class="btn">更新用户信息</button>
        </div>

        <div class="data-demo">
          <h3>实时数据</h3>
          <p>温度: {{ sensorData.temperature.toFixed(1) }}°C</p>
          <p>湿度: {{ sensorData.humidity.toFixed(1) }}%</p>
          <button @click="toggleSensor" class="btn">{{ sensorActive ? '停止' : '启动' }}传感器</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue';

// ===== 简化通知系统 =====
class SimpleNotification {
  private container: HTMLElement | null = null;

  constructor() {
    this.init();
  }

  private init() {
    if (document.querySelector('.notification-container')) return;

    const style = document.createElement('style');
    style.textContent = `
      .notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        pointer-events: none;
      }
      .notification {
        background: white;
        border-left: 4px solid #409eff;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        margin-bottom: 10px;
        padding: 16px;
        min-width: 300px;
        max-width: 400px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        pointer-events: auto;
        position: relative;
      }
      .notification.show {
        opacity: 1;
        transform: translateX(0);
      }
      .notification.success { border-left-color: #67c23a; background-color: #f0f9ff; }
      .notification.warning { border-left-color: #e6a23c; background-color: #fffbeb; }
      .notification.error { border-left-color: #f56c6c; background-color: #fef2f2; }
      .notification.info { border-left-color: #909399; background-color: #f4f4f5; }
      .notification-title { margin: 0 0 8px 0; font-size: 16px; font-weight: 500; color: #303133; }
      .notification-message { margin: 0; font-size: 14px; color: #606266; white-space: pre-line; }
      .notification-close { position: absolute; top: 10px; right: 15px; cursor: pointer; font-size: 18px; color: #999; }
    `;
    document.head.appendChild(style);

    this.container = document.createElement('div');
    this.container.className = 'notification-container';
    document.body.appendChild(this.container);
  }

  show(message: string, title: string = '', type: 'success' | 'warning' | 'error' | 'info' = 'info', duration: number = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      ${title ? `<div class="notification-title">${title}</div>` : ''}
      <div class="notification-message">${message}</div>
      <span class="notification-close" onclick="this.parentElement.remove()">×</span>
    `;

    this.container!.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);

    if (duration > 0) {
      setTimeout(() => {
        if (notification.parentElement) {
          notification.classList.remove('show');
          setTimeout(() => notification.remove(), 300);
        }
      }, duration);
    }

    return notification;
  }

  success(message: string, title: string = '成功', duration: number = 3000) {
    return this.show(message, title, 'success', duration);
  }

  warning(message: string, title: string = '警告', duration: number = 3000) {
    return this.show(message, title, 'warning', duration);
  }

  error(message: string, title: string = '错误', duration: number = 3000) {
    return this.show(message, title, 'error', duration);
  }

  info(message: string, title: string = '信息', duration: number = 3000) {
    return this.show(message, title, 'info', duration);
  }
}

const notification = new SimpleNotification();

// ===== 数据通知管理器 =====
class DataNotificationManager {
  private notifications = new Map();

  watch(dataRef: any, options: any = {}) {
    const {
      title = '数据更新',
      duration = 3000,
      debounceTime = 1000,
      formatMessage = (newVal: any, oldVal: any) => `数据从 ${oldVal} 更新为 ${newVal}`
    } = options;

    let oldValue = dataRef.value;
    let activeNotification: any = null;
    let closeTimer: any = null;

    const stopWatching = watch(dataRef, (newVal) => {
      // 清除数据停止变化的定时器
      if (closeTimer) {
        clearTimeout(closeTimer);
      }

      const message = formatMessage(newVal, oldValue);
      
      if (activeNotification && activeNotification.parentElement) {
        // 更新现有通知内容（数据持续变化时保持显示）
        const messageEl = activeNotification.querySelector('.notification-message');
        if (messageEl) {
          messageEl.textContent = message;
          // 添加更新动画
          activeNotification.style.transform = 'translateX(0) scale(1.02)';
          setTimeout(() => {
            activeNotification.style.transform = 'translateX(0) scale(1)';
          }, 150);
        }
      } else {
        // 创建新通知（不设置自动关闭）
        activeNotification = notification.show(message, title, 'info', 0);
      }
      
      oldValue = newVal;

      // 只有在数据停止变化后才设置关闭定时器
      closeTimer = setTimeout(() => {
        if (activeNotification && activeNotification.parentElement) {
          activeNotification.classList.remove('show');
          setTimeout(() => {
            if (activeNotification && activeNotification.parentElement) {
              activeNotification.remove();
              activeNotification = null;
            }
          }, 300);
        }
      }, duration);
    }, { deep: true });

    return {
      update: (newData: any) => {
        dataRef.value = newData;
      },
      close: () => {
        if (activeNotification && activeNotification.parentElement) {
          activeNotification.remove();
        }
      },
      stop: stopWatching
    };
  }
}

const dataNotification = new DataNotificationManager();

// ===== 应用逻辑 =====
const counter = ref(0);
const user = reactive({ name: '张三', age: 25 });
const sensorData = reactive({ temperature: 25, humidity: 60 });
const sensorActive = ref(false);
let sensorInterval: any = null;

// 设置数据监控
const counterWatcher = dataNotification.watch(counter, {
  title: '计数器变化',
  formatMessage: (newVal: number, oldVal: number) => {
    const change = newVal - oldVal;
    return `计数器 ${change > 0 ? '+' : ''}${change}，当前值: ${newVal}`;
  }
});

const userWatcher = dataNotification.watch(user, {
  title: '用户信息变化',
  formatMessage: (newVal: any, oldVal: any) => {
    const changes: string[] = [];
    Object.keys(newVal).forEach(key => {
      if (newVal[key] !== oldVal[key]) {
        changes.push(`${key}: ${oldVal[key]} → ${newVal[key]}`);
      }
    });
    return changes.length > 0 
      ? `用户数据更新:\n${changes.join('\n')}`
      : '用户信息已更新';
  }
});

const sensorWatcher = dataNotification.watch(sensorData, {
  title: '传感器数据',
  debounceTime: 1500,
  formatMessage: (newVal: any, oldVal: any) => 
    `数据更新:\n温度: ${newVal.temperature.toFixed(1)}°C\n湿度: ${newVal.humidity.toFixed(1)}%`
});

// 方法
const showSuccess = () => notification.success('操作成功完成！', '成功');
const showWarning = () => notification.warning('请注意这个警告信息', '警告');
const showError = () => notification.error('操作失败，请重试', '错误');
const showInfo = () => notification.info('这是一条信息通知', '信息');

const incrementCounter = () => counter.value += Math.floor(Math.random() * 5) + 1;
const decrementCounter = () => counter.value -= Math.floor(Math.random() * 3) + 1;
const resetCounter = () => counter.value = 0;

const updateUser = () => {
  user.name = ['张三', '李四', '王五', '赵六'][Math.floor(Math.random() * 4)];
  user.age = Math.floor(Math.random() * 30) + 18;
};

const toggleSensor = () => {
  sensorActive.value = !sensorActive.value;
  if (sensorActive.value) {
    sensorInterval = setInterval(() => {
      sensorData.temperature = 20 + Math.random() * 15;
      sensorData.humidity = 40 + Math.random() * 40;
    }, 1000);
  } else {
    if (sensorInterval) {
      clearInterval(sensorInterval);
      sensorInterval = null;
    }
  }
};

onMounted(() => {
  // 启动时显示欢迎信息
  notification.info('数据监控系统已启动', '欢迎', 2000);
});

onUnmounted(() => {
  if (sensorInterval) clearInterval(sensorInterval);
  counterWatcher.stop();
  userWatcher.stop();
  sensorWatcher.stop();
});
</script>

<style scoped>
.demo-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.demo-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #f9fafc;
}

.demo-section h2 {
  margin-top: 0;
  color: #303133;
  border-bottom: 2px solid #409eff;
  padding-bottom: 5px;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn:hover { opacity: 0.8; }
.btn-success { background: #67c23a; color: white; }
.btn-warning { background: #e6a23c; color: white; }
.btn-error { background: #f56c6c; color: white; }
.btn-info { background: #909399; color: white; }

.data-demo {
  margin: 10px 0;
  padding: 15px;
  background: white;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.data-demo h3 { margin-top: 0; color: #303133; }
.data-demo p { margin: 5px 0; color: #606266; }

h1 {
  text-align: center;
  color: #303133;
  margin-bottom: 30px;
}
</style>