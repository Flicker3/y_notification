import type { Ref } from 'vue';

interface DataNotificationOptions {
  title?: string;
  duration?: number;
  debounceTime?: number;
  formatMessage?: (newData: any, oldData: any) => string;
  showTitle?: boolean;
}

interface DataNotificationInstance {
  update: (newData: any) => void;
  close: () => void;
  isActive: () => boolean;
}

class DataNotificationManager {
  private container: HTMLElement | null = null;
  private activeNotifications = new Map<string, {
    element: HTMLElement;
    timer: number;
    lastUpdate: number;
    options: DataNotificationOptions;
  }>();

  constructor() {
    this.init();
  }

  private init() {
    const style = document.createElement('style');
    style.textContent = `
      .data-notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        pointer-events: none;
      }
      .data-notification {
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
      .data-notification.show {
        opacity: 1;
        transform: translateX(0);
      }
      .data-notification.success {
        border-left-color: #67c23a;
        background-color: #f0f9ff;
      }
      .data-notification.warning {
        border-left-color: #e6a23c;
        background-color: #fffbeb;
      }
      .data-notification.error {
        border-left-color: #f56c6c;
        background-color: #fef2f2;
      }
      .data-notification.info {
        border-left-color: #909399;
        background-color: #f4f4f5;
      }
      .data-notification-title {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 500;
        color: #303133;
      }
      .data-notification-message {
        margin: 0;
        font-size: 14px;
        color: #606266;
        white-space: pre-line;
      }
      .data-notification-updated {
        font-size: 12px;
        color: #909399;
        margin-top: 8px;
      }
      .data-notification-close {
        position: absolute;
        top: 10px;
        right: 15px;
        cursor: pointer;
        font-size: 18px;
        color: #999;
        line-height: 1;
      }
    `;
    document.head.appendChild(style);

    this.container = document.createElement('div');
    this.container.className = 'data-notification-container';
    document.body.appendChild(this.container);
  }

  watchData<T>(
    data: Ref<T>,
    options: DataNotificationOptions = {}
  ): DataNotificationInstance {
    const id = `data-notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const debounceTime = options.debounceTime || 1000;
    const duration = options.duration || 3000;

    let previousData = data.value;
    let debounceTimer: number;
    let closeTimer: number;
    let notificationElement: HTMLElement | null = null;

    const createNotification = (currentData: T, oldData: T) => {
      if (notificationElement) {
        // 更新现有通知
        //@ts-ignore
        this.updateNotification(notificationElement, currentData, oldData, options);
      } else {
        // 创建新通知
        notificationElement = this.createNotificationElement(currentData, oldData, options);
        this.container!.appendChild(notificationElement);
        setTimeout(() => notificationElement!.classList.add('show'), 10);
      }

      // 清除之前的关闭定时器
      if (closeTimer) {
        clearTimeout(closeTimer);
      }

      // 设置新的关闭定时器
      closeTimer = setTimeout(() => {
        if (notificationElement && notificationElement.parentElement) {
          notificationElement.classList.remove('show');
          setTimeout(() => {
            if (notificationElement && notificationElement.parentElement) {
              notificationElement.remove();
              notificationElement = null;
            }
          }, 300);
        }
      }, duration);
    };

    const updateData = (newData: T) => {
      // 清除防抖定时器
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // 设置新的防抖定时器
      debounceTimer = setTimeout(() => {
        createNotification(newData, previousData);
        previousData = newData;
      }, debounceTime);
    };

    const close = () => {
      if (notificationElement && notificationElement.parentElement) {
        notificationElement.classList.remove('show');
        setTimeout(() => {
          if (notificationElement && notificationElement.parentElement) {
            notificationElement.remove();
            notificationElement = null;
          }
        }, 300);
      }
      if (closeTimer) {
        clearTimeout(closeTimer);
      }
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };

    const isActive = () => notificationElement !== null;

    // 返回实例
    return {
      update: updateData,
      close,
      isActive
    };
  }

  private createNotificationElement(
    data: any,
    oldData: any,
    options: DataNotificationOptions
  ): HTMLElement {
    const element = document.createElement('div');
    element.className = 'data-notification info';
    
    const message = options.formatMessage 
      ? options.formatMessage(data, oldData)
      : `数据已更新: ${JSON.stringify(data)}`;

    element.innerHTML = `
      ${options.showTitle !== false && options.title 
        ? `<div class="data-notification-title">${options.title}</div>` 
        : ''}
      <div class="data-notification-message">${message}</div>
      <div class="data-notification-updated">刚刚更新</div>
      <span class="data-notification-close" onclick="this.parentElement.remove()">×</span>
    `;

    return element;
  }

  private updateNotificationElement(
    element: HTMLElement,
    data: any,
    oldData: any,
    options: DataNotificationOptions
  ) {
    const message = options.formatMessage 
      ? options.formatMessage(data, oldData)
      : `数据已更新: ${JSON.stringify(data)}`;

    const messageEl = element.querySelector('.data-notification-message');
    if (messageEl) {
      messageEl.textContent = message;
    }

    const updatedEl = element.querySelector('.data-notification-updated');
    if (updatedEl) {
      updatedEl.textContent = '刚刚更新';
    }

    // 添加更新动画
    element.style.transform = 'translateX(0) scale(1.02)';
    setTimeout(() => {
      element.style.transform = 'translateX(0) scale(1)';
    }, 150);
  }
}

// 创建单例
const dataNotification = new DataNotificationManager();

// 导出全局方法
export const $dataNotification = {
  watch: dataNotification.watchData.bind(dataNotification),
  //@ts-ignore
  closeAll: dataNotification.closeAll.bind(dataNotification)
};

export default dataNotification;