import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ListOptionProps {
    onClick: () => void;
    label: string;
    uniqueIdPart: string | number;
    selected: boolean;
    optionHeight: number;
    optionStart: number;
    className?: string;
}

export function ListOption({
    onClick,
    label,
    uniqueIdPart,
    selected,
    optionHeight,
    optionStart,
    className
}: ListOptionProps) {
    const checkboxId = `filter-option-${uniqueIdPart}`;
    const optionRowId = `${checkboxId}-row`;

    return (
        <div
            className={cn(
                "flex items-center absolute top-0 left-0 w-full transition-colors duration-150 ease-in-out",
                "hover:bg-secondary hover:text-secondary-foreground cursor-pointer",
                "data-[active=true]:bg-zinc-200 data-[active=true]:text-accent-foreground",
                "data-[active=true]:ring-1 data-[active=true]:ring-ring data-[active=true]:ring-offset-1",
                selected && "bg-muted",
                className
            )}
            style={{
                height: `${optionHeight - 2}px`,
                transform: `translateY(${optionStart}px)`,
            }}
            id={optionRowId}
            data-list-option
            onClick={onClick}
            role="option"
            aria-selected={selected}
            tabIndex={-1}
        >
            <div className="flex items-center w-full px-3 py-2 cursor-pointer">
                <Checkbox
                    id={checkboxId}
                    checked={selected}
                    onCheckedChange={() => {
                        onClick();
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    className="mr-3 shrink-0 cursor-pointer"
                    aria-labelledby={`${checkboxId}-label`}
                    tabIndex={-1}
                />
                <Label
                    htmlFor={checkboxId}
                    id={`${checkboxId}-label`}
                    title={label}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onClick();
                    }}
                    className="text-xs leading-snug cursor-pointer select-none line-clamp-3"
                >
                    {label}
                </Label>
            </div>
        </div>
    );
}
