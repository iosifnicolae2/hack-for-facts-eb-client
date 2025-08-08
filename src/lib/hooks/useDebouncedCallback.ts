import { useEffect, useRef, useCallback } from 'react';

/**
 * A custom React hook that debounces a callback function.
 *
 * @param callback The function to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns A memoized, debounced version of the callback function.
 */
export function useDebouncedCallback<TArgs extends unknown[]>(
    callback: (...args: TArgs) => void,
    delay: number
): (...args: TArgs) => void {
    // Ref to store the timeout ID
    const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Ref to store the latest callback function.
    // This ensures that the debounced function always calls the most recent
    // version of the callback, even if the callback prop changes.
    const callbackRef = useRef<typeof callback>(callback);

    // Update the stored callback if the callback prop changes
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // Effect for cleanup: clear the timeout when the component unmounts
    // or if the delay changes (though typically delay is constant for a hook instance).
    useEffect(() => {
        return () => {
            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current);
            }
        };
    }, [delay]); // Also re-run cleanup if delay changes, to cancel previous timer with old delay

    // The memoized debounced function
    const debouncedCallback = useCallback((...args: TArgs) => {
        // Clear any existing timeout
        if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
        }

        // Set a new timeout
        timeoutIdRef.current = setTimeout(() => {
            callbackRef.current(...args); // Execute the stored (latest) callback
        }, delay);
    }, [delay]); // Re-memoize if delay changes

    return debouncedCallback;
}