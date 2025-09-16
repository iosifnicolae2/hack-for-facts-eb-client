import { useEffect, useRef, useCallback } from 'react';

/**
 * Creates a debounced callback that delays invoking `callback` until after `delay`
 * milliseconds have passed since the last time the debounced function was invoked.
 *
 * The debounced function is memoized and will have a stable identity as long as
 * the `delay` does not change.
 *
 * @param callback The function to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns A memoized, debounced version of the callback function.
 */
export function useDebouncedCallback<TArgs extends unknown[]>(
    callback: (...args: TArgs) => void,
    delay: number
): (...args: TArgs) => void {
    const callbackRef = useRef(callback);
    const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Keeps the callback reference up to date.
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // Cleans up the timeout on unmount.
    useEffect(() => {
        return () => {
            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current);
            }
        };
    }, []);

    return useCallback((...args: TArgs) => {
        if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
        }

        timeoutIdRef.current = setTimeout(() => {
            callbackRef.current(...args);
        }, delay);
    }, [delay]);
}