import type { NotificationOptions, NotificationInstance } from '../components/index';

interface NotificationService {
  show(options: NotificationOptions): string;
  success(message: string, title?: string, duration?: number): string;
  warning(message: string, title?: string, duration?: number): string;
  error(message: string, title?: string, duration?: number): string;
  info(message: string, title?: string, duration?: number): string;
  close(key: string): void;
  closeAll(): void;
  update(key: string, options: Partial<NotificationOptions>): void;
  remove(key: string): void;
}

class NotificationServiceImpl implements NotificationService {
  private manager: any = null;
  private notifications: Map<string, any> = new Map();

  setManager(manager: any) {
    this.manager = manager;
  }

  show(options: NotificationOptions): string {
    if (!this.manager) {
      console.warn('Notification manager not initialized');
      return '';
    }
    
    const key = this.manager.show(options);
    this.notifications.set(key, options);
    return key;
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

  close(key: string): void {
    if (this.manager) {
      this.manager.close(key);
      this.notifications.delete(key);
    }
  }

  closeAll(): void {
    if (this.manager) {
      this.manager.closeAll();
      this.notifications.clear();
    }
  }

  update(key: string, options: Partial<NotificationOptions>): void {
    if (this.manager) {
      this.manager.update(key, options);
      const existing = this.notifications.get(key);
      if (existing) {
        this.notifications.set(key, { ...existing, ...options });
      }
    }
  }

  remove(key: string): void {
    if (this.manager) {
      this.manager.remove(key);
      this.notifications.delete(key);
    }
  }

  // 数据变化检测 - 重置通知计时器
  resetTimer(key: string): void {
    const notificationRef = this.getNotificationRef(key);
    if (notificationRef && notificationRef.resetTimer) {
      notificationRef.resetTimer();
    }
  }

  private getNotificationRef(key: string): any {
    // 这里需要从NotificationManager获取对应的通知实例
    // 实际实现中可能需要通过ref或者其他方式获取
    return null;
  }

  // 创建可观察的通知 - 当数据变化时重置计时器
  createObservableNotification<T>(
    key: string,
    data: T,
    options: NotificationOptions,
    onDataChange?: (newData: T) => void
  ): { key: string; updateData: (newData: T) => void } {
    let currentData = data;
    
    const showNotification = () => {
      this.show({
        ...options,
        key,
        onClose: () => {
          if (options.onClose) options.onClose();
        }
      });
    };

    const updateData = (newData: T) => {
      currentData = newData;
      
      // 重置计时器
      this.resetTimer(key);
      
      // 调用数据变化回调
      if (onDataChange) {
        onDataChange(newData);
      }
    };

    showNotification();
    
    return {
      key,
      updateData
    };
  }
}

// 创建单例服务
const notificationService = new NotificationServiceImpl();

// 全局方法
export const $notification = {
  show: (options: NotificationOptions) => notificationService.show(options),
  success: (message: string, title?: string, duration?: number) => 
    notificationService.success(message, title, duration),
  warning: (message: string, title?: string, duration?: number) => 
    notificationService.warning(message, title, duration),
  error: (message: string, title?: string, duration?: number) => 
    notificationService.error(message, title, duration),
  info: (message: string, title?: string, duration?: number) => 
    notificationService.info(message, title, duration),
  close: (key: string) => notificationService.close(key),
  closeAll: () => notificationService.closeAll(),
  update: (key: string, options: Partial<NotificationOptions>) => 
    notificationService.update(key, options),
  remove: (key: string) => notificationService.remove(key),
  
  // 数据变化检测功能
  createObservable: notificationService.createObservableNotification.bind(notificationService)
};

export default notificationService;