import { useSyncExternalStore } from "react";

/**
 * A React hook that returns true if the viewport matches the given media query.
 * This implementation uses `useSyncExternalStore` to provide the correct value
 * from the very first render, avoiding UI flicker and SSR mismatches.
 *
 * @param query The media query string to match (e.g., "(max-width: 768px)")
 * @returns {boolean} True if the current viewport matches the media query.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = (callback: () => void): (() => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", callback);
    return () => {
      mql.removeEventListener("change", callback);
    };
  };

  const getSnapshot = (): boolean => {
    return window.matchMedia(query).matches;
  };

  const getServerSnapshot = (): boolean => {
    // Return false on the server - client will hydrate with correct value
    return false;
  };

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
