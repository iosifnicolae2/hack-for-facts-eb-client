import { RadioGroupButtons } from "@/components/ui/radio-group-buttons";
import { OptionItem } from "../base-filter/interfaces";
import { t } from "@lingui/core/macro";

interface NormalizationFilterProps {
    normalization?: "total" | "per_capita" | "percent_gdp";
    setNormalization: (value: string | undefined) => void;
}

export function NormalizationFilter({ normalization, setNormalization }: Readonly<NormalizationFilterProps>) {

    const normalizationOptions: OptionItem<string>[] = [
        { id: 'total', label: t`Total` },
        { id: 'per_capita', label: t`Per Capita` },
        { id: 'percent_gdp', label: t`% of GDP` },
    ];


    const handleChange = (value?: string | boolean | number | undefined) => {
        if (value === undefined) return;
        setNormalization(value as string);
    };

    return (
        <RadioGroupButtons
            value={normalization}
            onChange={handleChange}
            options={normalizationOptions.map(category => ({ value: category.id, label: category.label }))}
        />
    );
} 
