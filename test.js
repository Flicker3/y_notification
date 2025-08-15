// 直接测试通知系统
import { $notification } from './src/utils/simpleNotification.js';

console.log('测试通知系统...');

// 测试基本通知
setTimeout(() => {
    $notification.success('测试成功消息', '成功', 3000);
}, 1000);

setTimeout(() => {
    $notification.warning('测试警告消息', '警告', 4000);
}, 2000);

setTimeout(() => {
    $notification.error('测试错误消息', '错误', 5000);
}, 3000);

setTimeout(() => {
    $notification.info('测试信息消息', '信息', 3000);
}, 4000);