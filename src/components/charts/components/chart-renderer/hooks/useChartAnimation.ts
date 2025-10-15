import { useState, useEffect } from 'react';

interface UseChartAnimationOptions {
  duration?: number;
  enabled?: boolean;
}

/**
 * Custom hook to manage chart animation state.
 * Enables animation on initial render and disables it after the specified duration
 * to prevent flickering on subsequent re-renders (e.g., tooltip interactions).
 *
 * @param options - Configuration options
 * @param options.duration - Animation duration in milliseconds (default: 300)
 * @param options.enabled - Whether animation is enabled (default: true)
 * @returns Object containing animation state and duration
 */
export function useChartAnimation(options: UseChartAnimationOptions = {}) {
  const { duration = 300, enabled = true } = options;
  const [hasAnimated, setHasAnimated] = useState(!enabled);

  useEffect(() => {
    if (!hasAnimated && enabled) {
      const timer = setTimeout(() => setHasAnimated(true), duration);
      return () => clearTimeout(timer);
    }
  }, [hasAnimated, duration, enabled]);

  return {
    isAnimationActive: !hasAnimated,
    animationDuration: duration,
  };
}
