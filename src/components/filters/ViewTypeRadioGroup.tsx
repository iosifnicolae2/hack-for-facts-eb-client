import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { BarChart2Icon, MapIcon, TableIcon } from "lucide-react";
import { ElementType } from "react";
import { Trans } from "@lingui/react/macro";

type ViewOption<T extends string> = { id: T, label: string, icon: ElementType }

const defaultViewOptions: ViewOption<string>[] = [
    { id: "map", label: "Map", icon: MapIcon },
    {
        id: "table", label: "Table", icon: TableIcon
    },
    { id: "chart", label: "Chart", icon: BarChart2Icon },
];

interface ViewTypeRadioGroupProps<T extends string> {
    value: T;
    onChange: (value: T) => void;
    viewOptions?: ViewOption<T>[];
}

export function ViewTypeRadioGroup<T extends string>({ value, onChange, viewOptions = defaultViewOptions as ViewOption<T>[] }: ViewTypeRadioGroupProps<T>) {

    const handleValueChange = (value: T) => {
        onChange(value);
    };

    return (
        <RadioGroup
            defaultValue={value}
            className="flex space-x-2"
            onValueChange={handleValueChange}
        >
            {viewOptions.map(option => {
                const isSelected = value === option.id;
                const Icon = option.icon;
                return (
                    <Label
                        key={option.id}
                        htmlFor={`view-type-${option.id}`}
                        className={cn(
                            "flex-1 text-center px-3 py-2 border rounded-md cursor-pointer text-sm font-medium transition-colors flex items-center justify-center",
                            isSelected
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                    >
                        <RadioGroupItem
                            value={option.id}
                            id={`view-type-${option.id}`}
                            className="sr-only"
                        />
                        <Icon className="h-4 w-4 mr-2" />
                        <Trans>{option.label}</Trans>
                    </Label>
                );
            })}
        </RadioGroup>
    );
}
