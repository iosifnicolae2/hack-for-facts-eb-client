import { Normalization } from '@/schemas/charts';
import { Trans } from '@lingui/react/macro';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Props = {
    value: Normalization;
    onChange: (value: Normalization) => void;
};

export function NormalizationSelector({ value, onChange }: Props) {
    return (
        <div className="flex items-center gap-2 font-bold">
            <Select value={value} onValueChange={(val) => onChange(val as Normalization)}>
                <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="total"><Trans>Total (RON)</Trans></SelectItem>
                    <SelectItem value="total_euro"><Trans>Total (EUR)</Trans></SelectItem>
                    <SelectItem value="per_capita"><Trans>Per Capita (RON)</Trans></SelectItem>
                    <SelectItem value="per_capita_euro"><Trans>Per Capita (EUR)</Trans></SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}


