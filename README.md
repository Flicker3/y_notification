# Vue3 Notification 组件

一个功能强大的 Vue3 通知组件，支持方法调用、自定义内容、数据变化检测等高级功能。
数据改变时，将自动刷新通知内容。支持 Vue2、Vue3 等多个版本。
<video controls src="./QQ2025815-175747.mp4" title="Title"></video>

## 功能特性

- ✅ **方法调用**: 支持通过全局方法调用，无需组件嵌套
- ✅ **自定义内容**: 支持 HTML 字符串、Vue 组件、函数等多种内容形式
- ✅ **数据变化检测**: 当数据变化时自动重置计时器
- ✅ **类型丰富**: 内置 success、warning、error、info 四种类型
- ✅ **响应式设计**: 支持移动端适配
- ✅ **TypeScript**: 完整的 TypeScript 支持
- ✅ **可组合**: 提供 Composition API 支持

## 快速开始

### 1. 安装

```bash
npm install
npm run dev
```

### 2. 基本使用

#### 全局方法调用

```typescript
// 在任何组件中直接使用
this.$notification.success("操作成功！");
this.$notification.error("操作失败！");
this.$notification.warning("警告信息");
this.$notification.info("提示信息");

// 自定义配置
this.$notification.show({
  type: "success",
  title: "成功",
  message: "操作已完成",
  duration: 3000
});
```

#### 使用 Composition API

```typescript
import { useNotificationManager } from "@/composables/useNotification";

const notification = useNotificationManager();

notification.success("成功消息");
notification.error("错误消息");
```

### 3. 自定义内容

#### HTML 内容

```typescript
notification.show({
  type: "info",
  duration: 0, // 不自动关闭
  content: () => `
    <div>
      <h3>自定义标题</h3>
      <p>这是自定义的HTML内容</p>
    </div>
  `
});
```

#### Vue 组件内容

```typescript
const CustomComponent = {
  template: `
    <div>
      <h4>Vue组件</h4>
      <button @click="handleClick">点击我</button>
    </div>
  `,
  methods: {
    handleClick() {
      alert("组件内事件触发！");
    }
  }
};

notification.show({
  type: "success",
  content: CustomComponent
});
```

### 4. 数据变化检测

#### 使用可观察通知

```typescript
import { ref } from "vue";
import { useObservableNotification } from "@/composables/useNotification";

const counter = ref(0);

// 创建可观察通知，当counter变化时自动更新
const { notificationId, close } = useObservableNotification(counter, {
  type: "info",
  title: "计数器变化",
  duration: 5000
});

// 增加计数器会触发通知更新
const increment = () => {
  counter.value++;
};
```

#### 使用自定义 Hook

```typescript
import { reactive } from "vue";
import { useNotification } from "@/composables/useNotification";

const userData = reactive({
  name: "张三",
  age: 25
});

const { show, close, update } = useNotification(
  userData,
  {
    type: "success",
    title: "用户信息",
    duration: 4000,
    watchData: true, // 监听数据变化
    resetTimerOnChange: true // 数据变化时重置计时器
  },
  (newData, oldData) => {
    console.log("数据已更新:", newData, oldData);
  }
);
```

## API 参考

### 通知选项

```typescript
interface NotificationOptions {
  type?: "success" | "warning" | "error" | "info"; // 通知类型
  title?: string; // 标题
  message?: string; // 消息内容
  duration?: number; // 持续时间(ms)，0表示不自动关闭
  content?: any; // 自定义内容
  key?: string; // 唯一标识
  closable?: boolean; // 是否可关闭
  onClose?: () => void; // 关闭回调
}
```

### 方法列表

| 方法                                  | 参数                                   | 说明         |
| ------------------------------------- | -------------------------------------- | ------------ |
| `show(options)`                       | `NotificationOptions`                  | 显示通知     |
| `success(message, title?, duration?)` | `string, string?, number?`             | 成功通知     |
| `warning(message, title?, duration?)` | `string, string?, number?`             | 警告通知     |
| `error(message, title?, duration?)`   | `string, string?, number?`             | 错误通知     |
| `info(message, title?, duration?)`    | `string, string?, number?`             | 信息通知     |
| `close(key)`                          | `string`                               | 关闭指定通知 |
| `closeAll()`                          | -                                      | 关闭所有通知 |
| `update(key, options)`                | `string, Partial<NotificationOptions>` | 更新通知     |
| `remove(key)`                         | `string`                               | 移除通知     |

### Composables

#### useNotification

```typescript
import { useNotification } from "@/composables/useNotification";

const { show, close, update, notificationId } = useNotification(
  data,
  options,
  onDataChange
);
```

#### useObservableNotification

```typescript
import { useObservableNotification } from "@/composables/useNotification";

const { notificationId, close } = useObservableNotification(data, options);
```

#### useNotificationManager

```typescript
import { useNotificationManager } from "@/composables/useNotification";

const notification = useNotificationManager();
```

## 项目结构

```
src/
├── components/
│   ├── Notification.vue          # 单个通知组件
│   ├── NotificationManager.vue   # 通知管理器
│   └── index.ts                  # 类型定义
├── services/
│   └── notification.ts           # 通知服务
├── composables/
│   └── useNotification.ts        # Composition API
├── plugins/
│   └── notification.ts           # Vue插件
└── App.vue                       # 演示应用
```

## 开发说明

### 添加新功能

1. **组件扩展**: 在 `Notification.vue` 中添加新的样式或功能
2. **服务扩展**: 在 `notification.ts` 中添加新的方法
3. **类型扩展**: 在 `index.ts` 中更新类型定义

### 样式定制

可以通过覆盖 CSS 变量来自定义主题：

```css
.notification.success {
  border-left-color: #your-color;
  background-color: #your-bg-color;
}
```

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT
