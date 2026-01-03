/**
 * SSR-safe storage utilities.
 * These functions safely handle localStorage operations during SSR
 * by returning safe defaults when running on the server.
 */

const isBrowser = typeof window !== 'undefined';

/**
 * Safely get an item from localStorage.
 * Returns null during SSR or if localStorage is unavailable.
 */
export function safeLocalStorageGetItem(key: string): string | null {
  if (!isBrowser) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    // Handle cases like private browsing mode or quota exceeded
    return null;
  }
}

/**
 * Safely set an item in localStorage.
 * No-op during SSR or if localStorage is unavailable.
 */
export function safeLocalStorageSetItem(key: string, value: string): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Silently fail (quota exceeded, private mode, etc.)
  }
}

/**
 * Safely remove an item from localStorage.
 * No-op during SSR or if localStorage is unavailable.
 */
export function safeLocalStorageRemoveItem(key: string): void {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Silently fail
  }
}

/**
 * Check if code is running in a browser environment.
 */
export function isServerSide(): boolean {
  return !isBrowser;
}

/**
 * Check if code is running in a browser environment.
 */
export function isClientSide(): boolean {
  return isBrowser;
}
