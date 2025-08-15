import type { App } from 'vue';
import NotificationManager from '../components/NotificationManager.vue';
import notificationService, { $notification } from '../services/notification';

export interface NotificationPluginOptions {
  globalProperty?: string;
  componentName?: string;
}

export default {
  install(app: App, options: NotificationPluginOptions = {}) {
    const {
      globalProperty = '$notification',
      componentName = 'NotificationManager'
    } = options;

    // 注册全局组件
    app.component(componentName, NotificationManager);

    // 挂载全局属性
    app.config.globalProperties[globalProperty] = $notification;

    // 提供全局API
    app.provide('notification', $notification);

    // 等待组件挂载后设置manager
    app.mixin({
      mounted() {
        if (this.$options.name === 'NotificationManager') {
          notificationService.setManager(this);
        }
      }
    });
  }
};