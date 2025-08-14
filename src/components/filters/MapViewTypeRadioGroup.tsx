import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const MAP_VIEW_TYPES = [
    { id: "UAT", label: "UAT" },
    { id: "County", label: "County" },
];

interface MapViewTypeRadioGroupProps {
    value: "UAT" | "County";
    onChange: (value: "UAT" | "County") => void;
}

export function MapViewTypeRadioGroup({ value, onChange }: MapViewTypeRadioGroupProps) {

    const handleValueChange = (value: "UAT" | "County") => {
        onChange(value);
    };

    return (
        <RadioGroup
            defaultValue={value}
            className="flex space-x-2"
            onValueChange={handleValueChange}
        >
            {MAP_VIEW_TYPES.map(option => {
                const isSelected = value === option.id;
                return (
                    <Label
                        key={option.id}
                        htmlFor={`map-view-${option.id}`}
                        className={cn(
                            "flex-1 text-center px-3 py-2 border rounded-md cursor-pointer text-sm font-medium transition-colors",
                            isSelected
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                    >
                        <RadioGroupItem
                            value={option.id}
                            id={`map-view-${option.id}`}
                            className="sr-only"
                        />
                        {option.label}
                    </Label>
                );
            })}
        </RadioGroup>
    );
}
