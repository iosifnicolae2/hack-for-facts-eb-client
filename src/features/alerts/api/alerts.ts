import { Alert, AlertSchema, createEmptyAlert } from '@/schemas/alerts';

const SERVER_STORAGE_KEY = 'mock-alerts-server';
const NETWORK_DELAY_MS = 600;

const readAlertsFromStorage = (): Alert[] => {
  const raw = localStorage.getItem(SERVER_STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .map((entry) => {
          const result = AlertSchema.safeParse(entry);
          return result.success ? result.data : null;
        })
        .filter((entry): entry is Alert => entry !== null);
    }
  } catch (error) {
    console.error('[alerts api] Failed to parse alerts from storage', error);
  }
  return [];
};

const persistAlertsToStorage = (alerts: Alert[]): void => {
  localStorage.setItem(SERVER_STORAGE_KEY, JSON.stringify(alerts));
};

const delay = <T,>(value: T, ms: number = NETWORK_DELAY_MS): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export async function fetchAlerts(): Promise<Alert[]> {
  const alerts = readAlertsFromStorage();
  return delay(alerts);
}

export async function fetchAlert(alertId: string): Promise<Alert> {
  const alerts = readAlertsFromStorage();
  const existing = alerts.find((alert) => alert.id === alertId);
  if (!existing) {
    throw new Error('Alert not found');
  }
  return delay(existing);
}

export interface SaveAlertParams {
  alert: Alert;
}

export async function saveAlert({ alert }: SaveAlertParams): Promise<Alert> {
  const alerts = readAlertsFromStorage();
  const payload = AlertSchema.parse({
    ...alert,
    updatedAt: new Date().toISOString(),
  });
  const existingIndex = alerts.findIndex((entry) => entry.id === payload.id);
  if (existingIndex === -1) {
    persistAlertsToStorage([payload, ...alerts]);
  } else {
    const next = [...alerts];
    next[existingIndex] = payload;
    persistAlertsToStorage(next);
  }
  return delay(payload);
}

export async function deleteAlert(alertId: string): Promise<void> {
  const alerts = readAlertsFromStorage();
  const filtered = alerts.filter((alert) => alert.id !== alertId);
  persistAlertsToStorage(filtered);
  await delay(undefined);
}

export async function createAlertTemplate(): Promise<Alert> {
  const template = createEmptyAlert();
  return delay(template, 200);
}
