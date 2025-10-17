import { cn } from "@/lib/utils";
import React from "react";
import { useListKeyboardNavigation } from "@/hooks/useListKeyboardNavigation";

interface ListContainerProps {
    children: React.ReactNode;
    height: number;
    className?: string;
    listClassName?: string;
    ariaLabel?: string;
}

export function ListContainerSimple({ children, height, className, listClassName, ariaLabel = "Filter options" }: ListContainerProps) {
    const { activeDescendant, handleKeyDown, handleMouseDown } = useListKeyboardNavigation();

    return (
        <div
            className={cn("h-64 overflow-auto border rounded-md", className)}
            role="listbox"
            aria-multiselectable="true"
            aria-activedescendant={activeDescendant}
            aria-label={ariaLabel}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onMouseDown={handleMouseDown}
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
