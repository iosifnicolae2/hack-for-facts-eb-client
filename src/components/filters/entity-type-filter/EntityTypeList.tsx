import { useMemo, useState } from "react";
import { ListContainerSimple } from "../base-filter/ListContainerSimple";
import { ListOption } from "../base-filter/ListOption";
import entityCategories from "@/assets/entity-categories.json";
import { OptionItem } from "../base-filter/interfaces";
import { SearchInput } from "../base-filter/SearchInput";
import Fuse from "fuse.js";
import { cn } from "@/lib/utils";

interface EntityTypeListProps {
    selectedOptions: OptionItem[];
    toggleSelect: (option: OptionItem) => void;
    pageSize?: number;
    className?: string;
}

export function EntityTypeList({ selectedOptions, toggleSelect, className }: EntityTypeListProps) {
    const [searchFilter, setSearchFilter] = useState("");

    const entityTypeOptions = useMemo(() => Object.entries(entityCategories.categories).map(([key, value]) => ({
        id: key,
        label: value,
    })), []);

    const fuse = useMemo(
        () =>
            new Fuse(entityTypeOptions, {
                keys: ['label'],
                threshold: 0.3,
            }),
        [entityTypeOptions]
    );

    const filteredOptions = useMemo(() => {
        if (searchFilter) {
            return fuse.search(searchFilter).map(result => result.item);
        }
        return entityTypeOptions;
    }, [searchFilter, fuse, entityTypeOptions]);


    const rowHeight = 40;

    return (
        <div className={cn("w-full flex flex-col space-y-3", className)}>
            <SearchInput
                onChange={setSearchFilter}
                placeholder="Cauta tip entitate (ex: Spital)"
                initialValue={searchFilter}
            />
            <ListContainerSimple height={filteredOptions.length * rowHeight}>
                {filteredOptions.map((option, index) => (
                    <ListOption
                        key={option.id}
                        onClick={() => toggleSelect(option)}
                        label={option.label}
                        uniqueIdPart={option.id}
                        selected={selectedOptions.some(so => so.id === option.id)}
                        optionHeight={rowHeight}
                        optionStart={index * rowHeight}
                    />
                ))}
            </ListContainerSimple>
        </div>
    );
} 