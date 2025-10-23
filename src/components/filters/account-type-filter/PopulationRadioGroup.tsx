import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type NormalizationOptionItem = {
    id: "total" | "per_capita";
    label: string;
};

const normalizationFilter: NormalizationOptionItem[] = [
    { id: "total", label: "Total" },
    { id: "per_capita", label: "Per Capita" },
];

interface PopulationRadioGroupProps {
    value: "total" | "per_capita";
    onChange: (value: "total" | "per_capita") => void;
}

export function PopulationRadioGroup({ value, onChange }: PopulationRadioGroupProps) {

    const handleValueChange = (value: string) => {
        const selected = normalizationFilter.find(cat => cat.id === value);
        if (selected) {
            onChange(selected.id);
        }
    };

    return (
        <RadioGroup
            value={value}
            onValueChange={handleValueChange}
            className="flex space-x-2"
        >
            {normalizationFilter.map((category) => {
                const isSelected = value === category.id;
                return (
                    <Label
                        key={category.id}
                        htmlFor={`map-ac-${category.id}`}
                        className={cn(
                            "flex-1 text-center px-3 py-2 border rounded-md cursor-pointer text-sm font-medium transition-colors",
                            isSelected
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "bg-muted text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                        )}
                    >
                        <RadioGroupItem
                            value={category.id}
                            id={`map-ac-${category.id}`}
                            className="sr-only"
                        />
                        {category.label}
                    </Label>
                );
            })}
        </RadioGroup>
    );
}
