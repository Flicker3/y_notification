import { createApp, h, ref } from 'vue';
import NotificationManager from '../components/NotificationManager.vue';

// 创建全局通知服务
class GlobalNotification {
  private container: HTMLElement | null = null;
  private manager: any = null;

  constructor() {
    this.init();
  }

  private init() {
    // 创建全局容器
    this.container = document.createElement('div');
    this.container.id = 'global-notification-container';
    document.body.appendChild(this.container);

    // 创建通知管理器实例
    const app = createApp(NotificationManager);
    this.manager = app.mount(this.container);

    // 将方法绑定到全局
    (window as any).$notification = this;
  }

  show(options: any): string {
    if (this.manager) {
      return this.manager.show(options);
    }
    return '';
  }

  success(message: string, title?: string, duration: number = 3000): string {
    return this.show({
      type: 'success',
      title,
      message,
      duration
    });
  }

  warning(message: string, title?: string, duration: number = 3000): string {
    return this.show({
      type: 'warning',
      title,
      message,
      duration
    });
  }

  error(message: string, title?: string, duration: number = 3000): string {
    return this.show({
      type: 'error',
      title,
      message,
      duration
    });
  }

  info(message: string, title?: string, duration: number = 3000): string {
    return this.show({
      type: 'info',
      title,
      message,
      duration
    });
  }

  close(key: string) {
    if (this.manager) {
      this.manager.close(key);
    }
  }

  closeAll() {
    if (this.manager) {
      this.manager.closeAll();
    }
  }

  update(key: string, options: any) {
    if (this.manager) {
      this.manager.update(key, options);
    }
  }

  remove(key: string) {
    if (this.manager) {
      this.manager.remove(key);
    }
  }
}

// 创建单例
const globalNotification = new GlobalNotification();

export default globalNotification;

// 导出全局方法
export const $notification = globalNotification;