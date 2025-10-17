import { LoadingSpinner } from "./LoadingSpinner";
import { cn } from "@/lib/utils";
import React from "react";
import { NoResults } from "./NoResults";
import { EmptyList } from "./EmptyList";
import { useListKeyboardNavigation } from "@/hooks/useListKeyboardNavigation";

interface ListContainerProps {
    children: React.ReactNode;
    height: number;
    isFetchingNextPage: boolean;
    isLoading: boolean;
    isSearchResultsEmpty: boolean;
    isEmpty: boolean;
    className?: string;
    listClassName?: string;
    ariaLabel?: string;
}

export const ListContainer = React.forwardRef<HTMLDivElement, ListContainerProps>(
    ({ children, height, isFetchingNextPage, isLoading, isSearchResultsEmpty, isEmpty, className, listClassName, ariaLabel = "Filter options" }, ref) => {
        const { activeDescendant, handleKeyDown, handleMouseDown } = useListKeyboardNavigation();

        return (
            <div
                className={cn("h-64 overflow-auto border rounded-md", className)}
                ref={ref}
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
                {isFetchingNextPage && (
                    <div className="flex items-center justify-center p-2">
                        <LoadingSpinner size="sm" text="Loading more..." />
                    </div>
                )}
                {isLoading && (
                    <div className="flex items-center h-full justify-center p-2">
                        <LoadingSpinner size="sm" text="Loading..." />
                    </div>
                )}
                {isSearchResultsEmpty && (
                    <div className="flex items-center h-full justify-center p-2">
                        <NoResults message={"No results found."} />
                    </div>
                )}
                {isEmpty && (
                    <div className="flex items-center h-full justify-center p-2">
                        <EmptyList message={"List is empty."} />
                    </div>
                )}
            </div>
        );
    });

ListContainer.displayName = "ListContainer";
