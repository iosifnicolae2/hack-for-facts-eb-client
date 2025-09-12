import { useWindowSize } from "@/hooks/useWindowSize";
import { useEffect, useRef, useState } from "react";

export function useHeaderSize(loading: boolean | undefined) {
    const headerTitleRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const headerBottomRef = useRef<HTMLDivElement>(null);
    const [stickyTop, setStickyTop] = useState<string>('-8.1rem');
    const window = useWindowSize();

    useEffect(() => {
        const headerTitle = headerTitleRef.current;
        const headerBottom = headerBottomRef.current;
        const header = headerRef.current;
        if (headerTitle && headerBottom && header) {
            const headerTitleHeight = headerTitle.getBoundingClientRect().height;
            const headerBottomHeight = headerBottom.getBoundingClientRect().height;
            const headerHeight = header.getBoundingClientRect().height;
            const marginBetweenHeaderAndTitle = headerBottomHeight * 0.15;
            const topValue = (headerBottomHeight + headerTitleHeight - headerHeight + marginBetweenHeaderAndTitle);
            setStickyTop(`${topValue}px`);
        }
    }, [loading, window.width]);

    return { headerRef, headerTitleRef, headerBottomRef, stickyTop };
}