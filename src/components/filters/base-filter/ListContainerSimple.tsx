import { cn } from "@/lib/utils";
import React, { useState } from "react";

interface ListContainerProps {
    children: React.ReactNode;
    height: number;
    className?: string;
    listClassName?: string;
}

export function ListContainerSimple({ children, height, className, listClassName }: ListContainerProps) {
    const [activeDescendant, setActiveDescendant] = useState<string | undefined>(undefined);
    const [activeIndex, setActiveIndex] = useState<number>(-1);

    const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
        const container = e.currentTarget as HTMLDivElement;
        const optionNodes = container.querySelectorAll<HTMLElement>('[data-list-option]');
        if (!optionNodes || optionNodes.length === 0) return;

        const currentIndex = activeIndex;
        const setActiveByIndex = (index: number) => {
            const clamped = Math.max(0, Math.min(index, optionNodes.length - 1));
            const el = optionNodes[clamped] as HTMLElement | undefined;
            if (!el) return;
            setActiveIndex(clamped);
            setActiveDescendant(el.id || undefined);
            el.scrollIntoView({ block: 'nearest' });
        };

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveByIndex((currentIndex === -1 ? 0 : currentIndex + 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveByIndex(currentIndex === -1 ? optionNodes.length - 1 : currentIndex - 1);
                break;
            case 'Home':
                e.preventDefault();
                setActiveByIndex(0);
                break;
            case 'End':
                e.preventDefault();
                setActiveByIndex(optionNodes.length - 1);
                break;
            case ' ': // Space
            case 'Enter':
                e.preventDefault();
                {
                    const idx = currentIndex === -1 ? 0 : currentIndex;
                    const el = optionNodes[idx];
                    if (el) {
                        setActiveByIndex(idx);
                        (el as HTMLElement).click();
                    }
                }
                break;
        }
    };

    return (
        <div
            className={cn("h-64 overflow-auto border rounded-md", className)}
            role="listbox"
            aria-multiselectable="true"
            aria-activedescendant={activeDescendant}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onMouseDown={(e) => {
                if (e.currentTarget !== document.activeElement) {
                    e.currentTarget.focus();
                }
            }}
        >
            <div
                style={{
                    height: `${height}px`,
                    width: '100%',
                    position: 'relative',
                }}
                className={cn(listClassName)}
            >
                {children}
            </div>
        </div>
    );
};
