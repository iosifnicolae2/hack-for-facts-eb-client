import { FunctionComponent, useMemo, useState } from "react";
import { formatNumber } from "@/lib/utils";
import { SelectedOptionsDisplay } from "./SelectedOptionsDisplay";
import { BaseListFilterProps, OptionItem } from "./interfaces";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface FilterContainerProps {
    title: string;
    unit?: string;
    rangeComponent: FunctionComponent<BaseListFilterProps>;
    minValue?: string | number;
    maxValue?: string | number;
    maxValueAllowed?: number;
    onMinValueChange: (value: string | undefined) => void;
    onMaxValueChange: (value: string | undefined) => void;
    icon: React.ReactNode;
    debounceMs?: number;
}


export function FilterRangeContainer({ rangeComponent: RangeComponent, title, unit, icon, minValue, maxValue, maxValueAllowed, onMinValueChange, onMaxValueChange, debounceMs }: FilterContainerProps) {
    const [showAllSelected, setShowAllSelected] = useState(false);

    const activeRangeOptions = useMemo(() => {
        const options: OptionItem[] = [];

        if (minValue !== undefined && minValue !== '') {
            options.push({ id: "min", label: `min: ${formatNumber(Number(minValue))} ${unit}` });
        }

        if (maxValue !== undefined && maxValue !== '') {
            options.push({ id: "max", label: `max: ${formatNumber(Number(maxValue))} ${unit}` });
        }

        return options;
    }, [minValue, maxValue, unit]);

    const handleClearRange = (option: OptionItem) => {
        if (option.id === "min") {
            onMinValueChange(undefined);
        } else if (option.id === "max") {
            onMaxValueChange(undefined);
        }
    };

    const clearSelection = () => {
        onMinValueChange(undefined);
        onMaxValueChange(undefined);
        setShowAllSelected(false);
    };

    return (
        <div className="border-b">
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={title} className="border-none">
                    <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:bg-muted/50">
                        <div className="flex items-center gap-2">
                            {icon}
                            <span>{title}</span>
                            {activeRangeOptions.length > 0 && (
                                <Badge variant="secondary" className="rounded-full px-2 text-xs">
                                    {activeRangeOptions.length}
                                </Badge>
                            )}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-2">
                        <RangeComponent
                            minValue={minValue}
                            maxValue={maxValue}
                            unit={unit}
                            onMinValueChange={onMinValueChange}
                            onMaxValueChange={onMaxValueChange}
                            maxValueAllowed={maxValueAllowed}
                            debounceMs={debounceMs}
                        />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <div className="px-4">
                <SelectedOptionsDisplay
                    selectedOptions={activeRangeOptions}
                    toggleSelect={handleClearRange}
                    clearSelection={clearSelection}
                    showAllSelected={showAllSelected}
                    setShowAllSelected={setShowAllSelected}
                />
            </div>
        </div>
    );
}
