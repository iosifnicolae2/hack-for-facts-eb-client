import { useState, useEffect, useRef } from 'react';

type UseHeaderVisibilityOptions = {
    /** The scroll distance (in px) from the top of the page after which the header can hide. */
    hideThreshold?: number;
};

const DEFAULT_HIDE_THRESHOLD = 200;

/**
 * A hook to control header visibility based on scroll direction.
 * The header hides on scroll down (past a threshold) and reappears on scroll up.
 *
 * @param {UseHeaderVisibilityOptions} options - Configuration options for the hook.
 * @returns {boolean} - Returns 'true' if the header should be expanded/visible.
 */
export const useEntityHeaderExpanded = ({
    hideThreshold = DEFAULT_HIDE_THRESHOLD,
}: UseHeaderVisibilityOptions = {}) => {
    const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);
    // Refs to store values between renders without causing re-renders
    const lastScrollY = useRef(0);
    const ticking = useRef(false);

    useEffect(() => {
        lastScrollY.current = window.scrollY;

        const handleScroll = () => {
            // Use requestAnimationFrame to avoid performance issues
            if (ticking.current) return;

            ticking.current = true;
            window.requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;

                // Use a functional update to get the latest state without adding it to dependencies
                setIsHeaderExpanded(prevExpanded => {
                    // 1. Always show the header when near the top of the page
                    if (currentScrollY < hideThreshold) {
                        return true;
                    }

                    const isScrollingDown = currentScrollY > lastScrollY.current;
                    // 2. Add a small buffer to prevent toggling on minor scrolls
                    const hasScrolledEnough = Math.abs(currentScrollY - lastScrollY.current) > 5;

                    if (hasScrolledEnough) {
                        // 3. Hide header when scrolling down
                        if (isScrollingDown && prevExpanded) {
                            return false;
                            // 4. Show header when scrolling up
                        } else if (!isScrollingDown && !prevExpanded) {
                            return true;
                        }
                    }

                    return prevExpanded;
                });

                lastScrollY.current = currentScrollY;
                ticking.current = false;
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        // Cleanup listener on unmount
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [hideThreshold]); // Only re-run the effect if the threshold prop changes

    return isHeaderExpanded;
};