import { useCallback, useEffect, useRef } from "react";

/**
 * Guards closing a popover/dropdown on blur, accounting for iOS blur-before-click behavior.
 * It tracks whether the last pointer/touch interaction started inside the container and, if so,
 * suppresses the blur-driven close so click/selection handlers can run first.
 */
export function useGuardedBlur<T extends HTMLElement>(onRequestClose: () => void) {
    const containerRef = useRef<T | null>(null);
    const isInteractingWithinRef = useRef<boolean>(false);

    useEffect(() => {
        const handlePointerDown = (event: Event) => {
            const target = event.target as Node | null;
            const container = containerRef.current;
            isInteractingWithinRef.current = !!(container && target && container.contains(target));
        };

        window.addEventListener("pointerdown", handlePointerDown, true);
        window.addEventListener("mousedown", handlePointerDown, true);
        window.addEventListener("touchstart", handlePointerDown, true);

        return () => {
            window.removeEventListener("pointerdown", handlePointerDown, true);
            window.removeEventListener("mousedown", handlePointerDown, true);
            window.removeEventListener("touchstart", handlePointerDown, true);
        };
    }, []);

    const handleBlur = useCallback((e: React.FocusEvent<HTMLElement>) => {
        const nextTarget = e.relatedTarget as Node | null;
        const movedFocusInside = !!(nextTarget && containerRef.current?.contains(nextTarget));
        if (!movedFocusInside && !isInteractingWithinRef.current) {
            onRequestClose();
        }
        // Reset the interaction flag after handling the blur.
        isInteractingWithinRef.current = false;
    }, [onRequestClose]);

    return {
        containerRef,
        onBlur: handleBlur,
    } as const;
}


