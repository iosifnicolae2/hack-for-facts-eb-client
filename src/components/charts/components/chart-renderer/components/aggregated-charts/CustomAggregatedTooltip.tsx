import { formatCurrency, formatNumberRO } from '@/lib/utils';
import { AggregatedDataPoint } from '@/components/charts/hooks/useAggregatedData';

interface CustomTooltipProps {
    active?: boolean;
    payload?: { payload: AggregatedDataPoint }[];
}

export const CustomAggregatedTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const { value, unit, label, color } = data;

        const formattedValue = (val: number, u: string) => {
            if (u === 'RON') return formatCurrency(val);
            if (u === '%') return `${formatNumberRO(val)}%`;
            return `${formatNumberRO(val)} ${u}`;
        };

        return (
            <div className="bg-background border rounded-md p-3 shadow-lg">
                <div className="flex items-center">
                    <div style={{ width: 12, height: 12, backgroundColor: color, marginRight: 8, borderRadius: '50%' }} />
                    <p className="font-semibold">{label}</p>
                </div>
                <p className="text-sm text-muted-foreground">{formattedValue(value, unit)}</p>
            </div>
        );
    }
    return null;
};
