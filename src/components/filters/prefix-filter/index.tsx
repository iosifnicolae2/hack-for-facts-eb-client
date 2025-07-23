import { FunctionComponent, useMemo, useState } from "react";
import { SelectedOptionsDisplay } from "../base-filter/SelectedOptionsDisplay";
import { OptionItem } from "../base-filter/interfaces";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface PrefixFilterProps {
    value?: string;
    onValueChange: (value: string | undefined) => void;
    placeholder?: string;
}

export function PrefixFilter({ value, onValueChange, placeholder = "Prefix..." }: PrefixFilterProps) {
    return (
        <Input
            placeholder={placeholder}
            value={value ?? ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onValueChange(e.target.value)}
        />
    );
}

interface FilterContainerProps {
    title: string;
    prefixComponent: FunctionComponent<PrefixFilterProps>;
    value?: string;
    onValueChange: (value: string | undefined) => void;
    icon: React.ReactNode;
}


export function FilterPrefixContainer({ prefixComponent: PrefixComponent, title, icon, value, onValueChange }: FilterContainerProps) {
    const [showAllSelected, setShowAllSelected] = useState(false);

    const activeOptions = useMemo(() => {
        const options: OptionItem[] = [];

        if (value) {
            options.push({ id: "prefix", label: `${value}` });
        }

        return options;
    }, [value]);

    const handleClear = () => {
        onValueChange(undefined);
    };

    const clearSelection = () => {
        onValueChange(undefined);
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
                            {activeOptions.length > 0 && (
                                <Badge variant="secondary" className="rounded-full px-2 text-xs">
                                    {activeOptions.length}
                                </Badge>
                            )}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-2">
                        <PrefixComponent
                            value={value}
                            onValueChange={onValueChange}
                        />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <div className="px-4">
                <SelectedOptionsDisplay
                    selectedOptions={activeOptions}
                    toggleSelect={handleClear}
                    clearSelection={clearSelection}
                    showAllSelected={showAllSelected}
                    setShowAllSelected={setShowAllSelected}
                />
            </div>
        </div>
    );
} 