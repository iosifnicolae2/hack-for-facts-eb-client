import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { searchEntities } from "@/lib/api/entities";
import { EntitySearchNode } from "@/schemas/entities";
import { EntitySearchSchema } from "@/routes/entities.$cui";

interface UseEntitySearchProps {
    debounceMs?: number;
    onSelect?: (entity: EntitySearchNode) => void;
    baseSearch?: EntitySearchSchema;
}

export function useEntitySearch({ debounceMs = 500, onSelect, baseSearch }: UseEntitySearchProps = {}) {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const debouncedSearchTerm = useDebouncedValue(searchTerm, debounceMs);

    const {
        data: results = [],
        isLoading,
        isError,
    } = useQuery<EntitySearchNode[], Error>({
        queryKey: ["entitySearch", debouncedSearchTerm],
        queryFn: () => searchEntities(debouncedSearchTerm, 8),
        enabled: !!debouncedSearchTerm && debouncedSearchTerm.trim().length > 2,
    });

    // Reset active index when results change
    useEffect(() => {
        setActiveIndex(-1);
    }, [results]);

    const openDropdown = useCallback(() => setDropdownOpen(true), []);
    const closeDropdown = useCallback(() => {
        setDropdownOpen(false);
        setActiveIndex(-1);
    }, []);

    const handleClearSearch = useCallback(() => {
        setSearchTerm("");
        closeDropdown();
    }, [closeDropdown]);

    const handleSelection = useCallback((index: number) => {
        if (results?.[index]) {
            const selectedEntity = results[index];
            // Navigate programmatically
            navigate({ to: "/entities/$cui", params: { cui: selectedEntity.cui }, search: { ...baseSearch } });
            handleClearSearch();
            onSelect?.(selectedEntity);
        }
    }, [results, navigate, handleClearSearch, onSelect, baseSearch]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!isDropdownOpen || results.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setActiveIndex((prevIndex) => (prevIndex + 1) % results.length);
                break;
            case "ArrowUp":
                e.preventDefault();
                setActiveIndex((prevIndex) => (prevIndex - 1 + results.length) % results.length);
                break;
            case "Enter":
                e.preventDefault();
                if (activeIndex !== -1) {
                    handleSelection(activeIndex);
                } else {
                    handleSelection(0);
                }
                break;
            case "Escape":
                e.preventDefault();
                handleClearSearch();
                break;
        }
    }, [isDropdownOpen, results, activeIndex, handleSelection, handleClearSearch]);

    // Generate unique IDs for ARIA attributes
    const entitySearchId = useMemo(() => `entity-search-${Math.random().toString(36).slice(2, 9)}`, []);

    return {
        searchTerm,
        setSearchTerm,
        results,
        isLoading,
        isError,
        isDropdownOpen,
        openDropdown,
        closeDropdown,
        activeIndex,
        handleClearSearch,
        handleSelection,
        handleKeyDown,
        debouncedSearchTerm,
        id: entitySearchId,
    };
}