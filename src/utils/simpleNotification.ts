// 简化版本的通知系统
import { createApp, h } from 'vue';

interface NotificationOptions {
  type?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message?: string;
  duration?: number;
  position?: string;
}

class SimpleNotification {
  private container: HTMLElement | null = null;
  private notifications: HTMLElement[] = [];

  constructor() {
    this.init();
  }

  private init() {
    // 创建容器样式
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
        box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        margin-bottom: 10px;
        padding: 15px;
        min-width: 300px;
        max-width: 400px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        pointer-events: auto;
      }
      .notification.show {
        opacity: 1;
        transform: translateX(0);
      }
      .notification.success {
        border-left-color: #67c23a;
        background-color: #f0f9ff;
      }
      .notification.warning {
        border-left-color: #e6a23c;
        background-color: #fffbeb;
      }
      .notification.error {
        border-left-color: #f56c6c;
        background-color: #fef2f2;
      }
      .notification.info {
        border-left-color: #909399;
        background-color: #f4f4f5;
      }
      .notification-title {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: bold;
      }
      .notification-message {
        margin: 0;
        font-size: 14px;
      }
      .notification-close {
        position: absolute;
        top: 10px;
        right: 10px;
        cursor: pointer;
        font-size: 18px;
        color: #999;
      }
    `;
    document.head.appendChild(style);

    // 创建容器
    this.container = document.createElement('div');
    this.container.className = 'notification-container';
    document.body.appendChild(this.container);
  }

  show(options: NotificationOptions): string {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${options.type || 'info'}`;
    notification.innerHTML = `
      ${options.title ? `<div class="notification-title">${options.title}</div>` : ''}
      ${options.message ? `<div class="notification-message">${options.message}</div>` : ''}
      <span class="notification-close" onclick="this.parentElement.remove()">×</span>
    `;

    this.container!.appendChild(notification);

    // 显示动画
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    // 自动关闭
    if (options.duration !== 0) {
      const duration = options.duration || 3000;
      setTimeout(() => {
        this.close(id);
      }, duration);
    }

    this.notifications.push(notification);
    return id;
  }

  success(message: string, title?: string, duration?: number): string {
    return this.show({ type: 'success', title, message, duration });
  }

  warning(message: string, title?: string, duration?: number): string {
    return this.show({ type: 'warning', title, message, duration });
  }

  error(message: string, title?: string, duration?: number): string {
    return this.show({ type: 'error', title, message, duration });
  }

  info(message: string, title?: string, duration?: number): string {
    return this.show({ type: 'info', title, message, duration });
  }

  close(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.remove();
    }
  }

  closeAll() {
    this.notifications.forEach(n => n.remove());
    this.notifications = [];
  }
}

const simpleNotification = new SimpleNotification();

export default simpleNotification;
export const $notification = simpleNotification;