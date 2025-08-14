import { RadioGroupButtons } from "@/components/ui/radio-group-buttons";
import { OptionItem } from "../base-filter/interfaces";

const accountCategories: OptionItem<string>[] = [
    { id: 'ch', label: "Expenses" },
    { id: 'vn', label: "Income" },
];

interface AccountCategoryRadioProps {
    accountCategory: 'ch' | 'vn';
    setAccountCategory: (value: string | undefined) => void;
}

export function AccountCategoryRadio({ accountCategory, setAccountCategory }: AccountCategoryRadioProps) {
    const handleChange = (value?: string | boolean | number | undefined) => {
        setAccountCategory(value as string || accountCategory);
    };

    return (
        <RadioGroupButtons
            value={accountCategory}
            onChange={handleChange}
            options={accountCategories.map(category => ({ value: category.id, label: category.label }))}
        />
    );
} 