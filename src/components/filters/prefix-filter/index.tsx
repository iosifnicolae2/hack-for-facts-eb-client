import { FunctionComponent, useMemo, useState } from "react";
import { SelectedOptionsDisplay } from "../base-filter/SelectedOptionsDisplay";
import { OptionItem } from "../base-filter/interfaces";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X, CornerDownLeft } from "lucide-react";

interface PrefixFilterProps {
    value?: string[];
    onValueChange: (value: string[] | undefined) => void;
    placeholder?: string;
}

export function PrefixFilter({ value = [], onValueChange, placeholder = "Add prefix. Example: 65.04" }: PrefixFilterProps) {
    const [inputValue, setInputValue] = useState('');

    const addPrefix = () => {
        const newValue = inputValue.trim();
        if (newValue && !value.includes(newValue)) {
            onValueChange([...value, newValue]);
        }
        setInputValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addPrefix();
        }
    };

    const handleRemove = (prefixToRemove: string) => {
        onValueChange(value.filter(p => p !== prefixToRemove));
    };

    return (
        <div>
            <div className="relative">
                <Input
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pr-10"
                />
                <button
                    onClick={addPrefix}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                >
                    <CornerDownLeft className="h-4 w-4" />
                </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
                {value.map((prefix) => (
                    <Badge key={prefix} variant="secondary" className="text-sm py-1 px-3 flex items-center gap-2">
                        {prefix}
                        <button onClick={() => handleRemove(prefix)} className="rounded-full hover:bg-background/50 p-0.5">
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
            </div>
        </div>
    );
}

interface FilterContainerProps {
    title: string;
    prefixComponent: FunctionComponent<PrefixFilterProps>;
    value?: string[];
    onValueChange: (value: string[] | undefined) => void;
    icon: React.ReactNode;
}


export function FilterPrefixContainer({ prefixComponent: PrefixComponent, title, icon, value, onValueChange }: FilterContainerProps) {
    const [showAllSelected, setShowAllSelected] = useState(false);

    const activeOptions = useMemo(() => {
        const options: OptionItem[] = [];

        if (value) {
            value.forEach(v => {
                options.push({ id: v, label: v });
            });
        }

        return options;
    }, [value]);

    const handleClear = (option: OptionItem) => {
        onValueChange(value?.filter(v => v !== option.id));
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
