import { FunctionComponent, useState } from "react";
import { SelectedOptionsDisplay } from "./SelectedOptionsDisplay";
import { OptionItem } from "./interfaces";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const VISIBLE_BADGES_COUNT_IN_DISPLAY = 1;
const MIN_ITEMS_FOR_COMPACT_VIEW_IN_DISPLAY = VISIBLE_BADGES_COUNT_IN_DISPLAY + 1;

interface FilterContainerProps {
    listComponent: FunctionComponent<{
        selectedOptions: OptionItem[],
        toggleSelect: (option: OptionItem) => void,
        pageSize: number
    }>;
    selected: OptionItem[];
    setSelected: React.Dispatch<React.SetStateAction<OptionItem<string | number>[]>>;
    title: string;
    icon: React.ReactNode;
}


export function FilterListContainer({ listComponent: ListComponent, title, icon, selected, setSelected }: FilterContainerProps) {
    const [showAllSelected, setShowAllSelected] = useState(false);

    const toggleSelect = (option: OptionItem) => {
        setSelected((prev: OptionItem[]) => {
            const isAlreadySelected = prev.some(o => o.id === option.id);
            let newSelectedArray;

            if (isAlreadySelected) {
                newSelectedArray = prev.filter(o => o.id !== option.id);
                if (newSelectedArray.length <= MIN_ITEMS_FOR_COMPACT_VIEW_IN_DISPLAY) {
                    setShowAllSelected(false);
                }
            } else {
                newSelectedArray = [...prev, option];
            }
            return newSelectedArray;
        });
    };

    const clearSelection = () => {
        setSelected(() => []);
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
                            {selected.length > 0 && (
                                <Badge variant="secondary" className="rounded-full px-2 text-xs">
                                    {selected.length}
                                </Badge>
                            )}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-2">
                        <ListComponent
                            selectedOptions={selected}
                            toggleSelect={toggleSelect}
                            pageSize={100}
                        />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <div className="px-4">
                <SelectedOptionsDisplay
                    selectedOptions={selected}
                    toggleSelect={toggleSelect}
                    clearSelection={clearSelection}
                    showAllSelected={showAllSelected}
                    setShowAllSelected={setShowAllSelected}
                />
            </div>
        </div>
    );
}
