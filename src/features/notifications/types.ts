export type NotificationType =
  | 'newsletter_entity_monthly'
  | 'newsletter_entity_quarterly'
  | 'newsletter_entity_annual'
  | 'alert_data_series';

export interface Notification {
  id: number;
  userId: string;
  entityCui: string | null;
  notificationType: NotificationType;
  isActive: boolean;
  config: Record<string, any> | null;
  hash: string;
  createdAt: string;
  updatedAt: string;
  // Joined data (if available)
  entity?: {
    name: string;
    cui: string;
  };
}


export interface NotificationTypeConfig {
  type: NotificationType;
  label: string;
  description: string;
}

export const NOTIFICATION_TYPE_CONFIGS: Record<NotificationType, NotificationTypeConfig> = {
  newsletter_entity_monthly: {
    type: 'newsletter_entity_monthly',
    label: 'Monthly Report',
    description: 'Receive a monthly report with budget execution',
  },
  newsletter_entity_quarterly: {
    type: 'newsletter_entity_quarterly',
    label: 'Quarterly Report',
    description: 'Receive a quarterly report with budget execution',
  },
  newsletter_entity_annual: {
    type: 'newsletter_entity_annual',
    label: 'Annual Report',
    description: 'Receive an annual report with budget execution',
  },
  alert_data_series: {
    type: 'alert_data_series',
    label: 'Data Series Alert',
    description: 'Receive an alert when a data series exceeds a set value',
  },
};
