import { getAuthToken } from '@/lib/auth';
import type { Notification, NotificationConfig, NotificationType } from '../types';

const getApiUrl = () => import.meta.env.VITE_API_URL;

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Fetch all user notifications
export async function getUserNotifications(): Promise<Notification[]> {
  const endpoint = `${getApiUrl()}/api/v1/notifications`;
  const token = await getAuthToken();

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: ApiResponse<never> = await response.json().catch(() => ({ ok: false, error: response.statusText }));
    throw new Error(error.error || `Failed to fetch notifications: ${response.statusText}`);
  }

  const result: ApiResponse<Notification[]> = await response.json();
  return result.data || [];
}

// Fetch notifications for specific entity
export async function getEntityNotifications(cui: string): Promise<Notification[]> {
  const endpoint = `${getApiUrl()}/api/v1/notifications/entity/${cui}`;
  const token = await getAuthToken();

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: ApiResponse<never> = await response.json().catch(() => ({ ok: false, error: response.statusText }));
    throw new Error(error.error || `Failed to fetch entity notifications: ${response.statusText}`);
  }

  const result: ApiResponse<Notification[]> = await response.json();
  return result.data || [];
}

// Subscribe to a notification (or update if already exists)
export async function upsertNotification(data: {
  entityCui: string | null;
  notificationType: NotificationType;
  isActive: boolean;
  config?: NotificationConfig;
}): Promise<Notification> {
  const token = await getAuthToken();

  // If deactivating, call unsubscribe endpoint
  if (!data.isActive) {
    // We need to find the notification ID first
    const notifications = data.entityCui
      ? await getEntityNotifications(data.entityCui)
      : await getUserNotifications();

    const existingNotification = notifications.find(
      n => n.notificationType === data.notificationType && n.entityCui === data.entityCui
    );

    if (existingNotification) {
      return deactivateNotification(existingNotification.id);
    }

    // If no existing notification to deactivate, throw error
    throw new Error('No notification found to deactivate');
  }

  // Subscribe to notification
  const endpoint = `${getApiUrl()}/api/v1/notifications/subscribe`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      notificationType: data.notificationType,
      entityCui: data.entityCui,
      config: data.config || null,
    }),
  });

  if (!response.ok) {
    const error: ApiResponse<never> = await response.json().catch(() => ({ ok: false, error: response.statusText }));
    throw new Error(error.error || `Failed to subscribe: ${response.statusText}`);
  }

  const result: ApiResponse<Notification> = await response.json();
  if (!result.data) {
    throw new Error('No data returned from subscribe');
  }

  return result.data;
}

// Deactivate notification (unsubscribe)
export async function deactivateNotification(id: number): Promise<Notification> {
  const endpoint = `${getApiUrl()}/api/v1/notifications/${id}/unsubscribe`;
  const token = await getAuthToken();

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id,
    }),
  });

  if (!response.ok) {
    const error: ApiResponse<never> = await response.json().catch(() => ({ ok: false, error: response.statusText }));
    throw new Error(error.error || `Failed to unsubscribe: ${response.statusText}`);
  }

  const result: ApiResponse<Notification> = await response.json();
  if (!result.data) {
    throw new Error('No data returned from unsubscribe');
  }

  return result.data;
}

// Unsubscribe via token (public, no auth) - used from email links
export async function unsubscribeViaToken(token: string): Promise<{
  success: boolean;
  notification: Notification;
}> {
  const endpoint = `${getApiUrl()}/api/v1/notifications/unsubscribe/${token}`;

  const response = await fetch(endpoint, {
    method: 'GET',
  });

  if (!response.ok) {
    const error: ApiResponse<never> = await response.json().catch(() => ({ ok: false, error: response.statusText }));
    throw new Error(error.error || `Failed to unsubscribe: ${response.statusText}`);
  }

  const result: ApiResponse<never> & { message?: string } = await response.json();

  // Server returns { ok: true, message: "..." } but doesn't return notification data
  // Return success with empty notification - component will show success message
  return {
    success: result.ok,
    notification: {} as Notification,
  };
}

// Delete notification completely
export async function deleteNotification(id: number): Promise<void> {
  const endpoint = `${getApiUrl()}/api/v1/notifications/${id}`;
  const token = await getAuthToken();

  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: ApiResponse<never> = await response.json().catch(() => ({ ok: false, error: response.statusText }));
    throw new Error(error.error || `Failed to delete notification: ${response.statusText}`);
  }

  const result: ApiResponse<never> = await response.json();
  if (!result.ok) {
    throw new Error('Failed to delete notification');
  }
}
