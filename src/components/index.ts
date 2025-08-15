export interface NotificationOptions {
  type?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message?: string;
  duration?: number;
  content?: any;
  key?: string;
  closable?: boolean;
  onClose?: () => void;
  props?: Record<string, any>;
}

export interface NotificationInstance {
  close: () => void;
  update: (options: Partial<NotificationOptions>) => void;
}
