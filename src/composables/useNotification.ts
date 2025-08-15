import { ref, watch, onUnmounted, type Ref } from 'vue';
import { $notification } from '../utils/notification';
import type { NotificationOptions } from '../components';

interface UseNotificationOptions extends NotificationOptions {
  watchData?: boolean;
  resetTimerOnChange?: boolean;
}

interface UseNotificationReturn {
  show: (data?: any) => void;
  close: () => void;
  update: (options: Partial<NotificationOptions>) => void;
  notificationId: Ref<string | null>;
}

/**
 * 使用通知的Hook，支持数据变化检测
 */
export function useNotification<T>(
  initialData: Ref<T> | T,
  options: UseNotificationOptions = {},
  onDataChange?: (newData: T, oldData: T) => void
): UseNotificationReturn {
  const notificationId = ref<string | null>(null);
  const isRef = typeof initialData === 'object' && 'value' in (initialData as any);

  const show = (data?: T) => {
    const currentData = data !== undefined ? data : (isRef ? (initialData as Ref<T>).value : initialData);
    
    let message = '';
    let title = options.title || '';
    
    if (typeof currentData === 'string') {
      message = currentData;
    } else if (typeof currentData === 'object' && currentData !== null) {
      message = (currentData as any).message || JSON.stringify(currentData);
      title = (currentData as any).title || title;
    }

    const notificationOptions: NotificationOptions = {
      ...options,
      message,
      title,
      key: options.key || `notification-${Date.now()}`
    };

    const id = $notification.show(notificationOptions);
    notificationId.value = id;
    return id;
  };

  const close = () => {
    if (notificationId.value) {
      $notification.close(notificationId.value);
      notificationId.value = null;
    }
  };

  const update = (newOptions: Partial<NotificationOptions>) => {
    if (notificationId.value) {
      $notification.update(notificationId.value, newOptions);
    }
  };

  // 监听数据变化
  if (isRef && options.watchData !== false) {
    watch(initialData as Ref<T>, (newData, oldData) => {
      if (notificationId.value) {
        // 更新通知内容
        let message = '';
        if (typeof newData === 'string') {
          message = newData;
        } else if (typeof newData === 'object' && newData !== null) {
          message = (newData as any).message || JSON.stringify(newData);
        }

        $notification.update(notificationId.value, { message });

        if (onDataChange) {
          onDataChange(newData, oldData);
        }
      }
    }, { deep: true });
  }

  onUnmounted(() => {
    close();
  });

  return {
    show,
    close,
    update,
    notificationId
  };
}

/**
 * 创建可观察的通知，当数据变化时自动更新
 */
export function useObservableNotification<T>(
  data: Ref<T>,
  options: Omit<UseNotificationOptions, 'watchData' | 'resetTimerOnChange'> = {}
): {
  notificationId: Ref<string | null>;
  close: () => void;
} {
  return useNotification(data, { ...options, watchData: true }, (newData, oldData) => {
    console.log('Notification data changed:', newData, oldData);
  });
}

/**
 * 使用通知管理器
 */
export function useNotificationManager() {
  return $notification;
}