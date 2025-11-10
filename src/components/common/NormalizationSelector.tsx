import { Normalization } from '@/schemas/charts';
import { t } from '@lingui/core/macro';
import { useNormalizationSelection } from '@/hooks/useNormalizationSelection';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Props = {
    value: Normalization;
    onChange: (value: Normalization) => void;
};

export function NormalizationSelector({ value, onChange }: Props) {
    const { toDisplayNormalization: toDisplay, toEffectiveNormalization: toEffective } = useNormalizationSelection(value);

    return (
        <div className="flex items-center gap-2 font-bold">
            <Select value={toDisplay(value)} onValueChange={(val) => onChange(toEffective(val as 'total' | 'per_capita'))}>
                <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="total">{t`Total`}</SelectItem>
                    <SelectItem value="per_capita">{t`Per Capita`}</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}


