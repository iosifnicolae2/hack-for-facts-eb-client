import { RadioGroupButtons } from "@/components/ui/radio-group-buttons";
import { OptionItem } from "../base-filter/interfaces";
import { t } from "@lingui/core/macro";

interface NormalizationFilterProps {
    normalization?: "total" | "per_capita" | "total_euro" | "per_capita_euro";
    setNormalization: (value: string | undefined) => void;
}

export function NormalizationFilter({ normalization, setNormalization }: NormalizationFilterProps) {

    const normalizationOptions: OptionItem<string>[] = [
        { id: 'total', label: t`Total` },
        { id: 'per_capita', label: t`Per Capita` },
        { id: 'total_euro', label: t`Total (EUR)` },
        { id: 'per_capita_euro', label: t`Per Capita (EUR)` },
    ];


    const handleChange = (value?: string | boolean | number | undefined) => {
        setNormalization(value as string || normalization);
    };

    return (
        <RadioGroupButtons
            value={normalization}
            onChange={handleChange}
            options={normalizationOptions.map(category => ({ value: category.id, label: category.label }))}
        />
    );
} 