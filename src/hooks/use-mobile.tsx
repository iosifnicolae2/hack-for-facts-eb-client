import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;
const MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

/**
 * Subscribes to the matchMedia query and calls the callback on change.
 * @param callback The function to call when the media query state changes.
 * @returns A function to unsubscribe from the event listener.
 */
function subscribe(callback: () => void): () => void {
  const mql = window.matchMedia(MEDIA_QUERY);
  mql.addEventListener("change", callback);
  return () => {
    mql.removeEventListener("change", callback);
  };
}

/**
 * A React hook that returns true if the viewport width is below the mobile breakpoint.
 * This implementation uses `useSyncExternalStore` to provide the correct value
 * from the very first render, avoiding UI flicker and SSR mismatches.
 *
 * @returns {boolean} True if the current screen width is mobile, otherwise false.
 */
export function useIsMobile(): boolean {
  const isMobile = useSyncExternalStore(
    subscribe,
    // Function to get the current value on the client
    () => window.matchMedia(MEDIA_QUERY).matches,
    // Function to get the value on the server
    () => false
  );

  return isMobile;
}