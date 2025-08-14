import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { SelectedOptionsDisplay } from "./SelectedOptionsDisplay";
import { OptionItem } from "./interfaces";

interface FilterRadioContainerProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    selectedOption: OptionItem | null;
    onClear: () => void;
    defaultOpen?: boolean;
}

export function FilterRadioContainer({
    title,
    icon,
    children,
    selectedOption,
    onClear,
    defaultOpen = false,
}: FilterRadioContainerProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [showAllSelected, setShowAllSelected] = useState(false);
    
    const selectedOptions = selectedOption ? [selectedOption] : [];
    const activeCount = selectedOptions.length;

    const handleOpenChange = (value: string) => {
        setIsOpen(!!value);
    };

    const handleClear = () => {
        onClear();
        setShowAllSelected(false);
    }

    return (
        <div className="border-b">
            <Accordion type="single" collapsible onValueChange={handleOpenChange} value={isOpen ? title : ''}>
                <AccordionItem value={title} className="border-none" disabled={true}>
                    <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:bg-muted/50">
                        <div className="flex items-center gap-2">
                            {icon}
                            <span>{title}</span>
                            {activeCount > 0 && (
                                <Badge variant="secondary" className="rounded-full px-2 text-xs">
                                    {activeCount}
                                </Badge>
                            )}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-2 pb-4">
                        {children}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <div className="px-4">
                <SelectedOptionsDisplay
                    selectedOptions={selectedOptions}
                    toggleSelect={handleClear}
                    clearSelection={handleClear}
                    showAllSelected={showAllSelected}
                    setShowAllSelected={setShowAllSelected}
                />
            </div>
        </div>
    );
} 