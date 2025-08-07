import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type AccountCategoryOptionItem = {
    id: "ch" | "vn";
    label: string;
};

const accountCategories: AccountCategoryOptionItem[] = [
    { id: "ch", label: "Cheltuieli" },
    { id: "vn", label: "Venituri" },
];

interface AccountCategoryRadioGroupProps {
    value: "ch" | "vn";
    onChange: (value: "ch" | "vn") => void;
}

export function AccountCategoryRadioGroup({ value, onChange }: AccountCategoryRadioGroupProps) {
    const handleValueChange = (value: string) => {
        const selected = accountCategories.find(cat => cat.id === value);
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
            {accountCategories.map((category) => {
                const isSelected = value === category.id;
                return (
                    <Label
                        key={category.id}
                        htmlFor={`map-ac-${category.id}`}
                        className={cn(
                            "flex-1 text-center px-3 py-2 border rounded-md cursor-pointer text-sm font-medium transition-colors",
                            isSelected
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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