import { ref, watch, onUnmounted, type Ref } from 'vue';
import { $dataNotification } from '../utils/dataNotification';

interface UseDataNotificationOptions {
  title?: string;
  duration?: number;
  debounceTime?: number;
  formatMessage?: (newData: any, oldData: any) => string;
  showTitle?: boolean;
  immediate?: boolean;
}

interface UseDataNotificationReturn {
  notification: {
    update: (data: any) => void;
    close: () => void;
    isActive: () => boolean;
  };
  startWatching: () => void;
  stopWatching: () => void;
}

/**
 * 数据变化通知Hook
 * 
 * 特点：
 * 1. 数据持续变化时保持通知显示
 * 2. 数据停止变化后延时消失
 * 3. 通知内容实时更新，不重新创建通知
 * 4. 支持防抖机制
 */
export function useDataNotification<T>(
  data: Ref<T>,
  options: UseDataNotificationOptions = {}
): UseDataNotificationReturn {
  const instance = ref<ReturnType<typeof $dataNotification.watch> | null>(null);
  const isWatching = ref(false);

  const defaultOptions = {
    title: '数据更新',
    duration: 3000,
    debounceTime: 1000,
    formatMessage: (newData: T, oldData: T) => {
      if (typeof newData === 'object' && newData !== null) {
        return `数据已更新: ${JSON.stringify(newData, null, 2)}`;
      }
      return `数据从 ${oldData} 更新为 ${newData}`;
    },
    showTitle: true,
    immediate: false,
    ...options
  };

  const createInstance = () => {
    if (!instance.value) {
      instance.value = $dataNotification.watch(data, defaultOptions);
    }
    return instance.value;
  };

  const startWatching = () => {
    if (!isWatching.value) {
      createInstance();
      isWatching.value = true;
      
      if (defaultOptions.immediate) {
        instance.value?.update(data.value);
      }
    }
  };

  const stopWatching = () => {
    if (isWatching.value && instance.value) {
      instance.value.close();
      instance.value = null;
      isWatching.value = false;
    }
  };

  // 自动开始监听（默认行为）
  if (defaultOptions.immediate !== false) {
    startWatching();
  }

  // 监听数据变化
  watch(data, (newVal, oldVal) => {
    if (isWatching.value && instance.value) {
      instance.value.update(newVal);
    }
  }, { deep: true });

  // 组件卸载时清理
  onUnmounted(() => {
    stopWatching();
  });

  return {
    notification: {
      update: (data: T) => instance.value?.update(data),
      close: () => instance.value?.close(),
      isActive: () => instance.value?.isActive() || false
    },
    startWatching,
    stopWatching
  };
}

/**
 * 使用简单的数据变化通知
 * 
 * @param data 要监听的数据
 * @param options 配置选项
 * @returns 通知实例
 */
export function useSimpleDataNotification<T>(
  data: Ref<T>,
  options: Omit<UseDataNotificationOptions, 'immediate'> = {}
) {
  return useDataNotification(data, { ...options, immediate: true });
}

/**
 * 使用延迟数据监控
 * 
 * @param data 要监听的数据
 * @param delay 延迟时间（毫秒）
 * @returns 通知实例
 */
export function useDelayedDataNotification<T>(
  data: Ref<T>,
  delay: number = 2000
) {
  return useDataNotification(data, {
    debounceTime: delay,
    duration: delay + 1000,
    title: '数据监控'
  });
}

/**
 * 使用计数器通知
 * 
 * @param counter 计数器
 * @returns 通知实例
 */
export function useCounterNotification(
  counter: Ref<number>,
  options: Partial<UseDataNotificationOptions> = {}
) {
  return useDataNotification(counter, {
    title: '计数器更新',
    formatMessage: (newVal: number, oldVal: number) => {
      const change = newVal - oldVal;
      return `计数器 ${change > 0 ? '+' : ''}${change}，当前值: ${newVal}`;
    },
    ...options
  });
}

/**
 * 使用对象变化通知
 * 
 * @param obj 对象数据
 * @returns 通知实例
 */
export function useObjectChangeNotification<T extends Record<string, any>>(
  obj: Ref<T>,
  options: Partial<UseDataNotificationOptions> = {}
) {
  return useDataNotification(obj, {
    title: '数据变化',
    formatMessage: (newVal: T, oldVal: T) => {
      const changes: string[] = [];
      for (const key in newVal) {
        if (newVal[key] !== oldVal[key]) {
          changes.push(`${key}: ${oldVal[key]} → ${newVal[key]}`);
        }
      }
      return changes.length > 0 
        ? `数据更新:\n${changes.join('\n')}`
        : '数据已更新';
    },
    ...options
  });
}