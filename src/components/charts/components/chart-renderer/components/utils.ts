import { formatCurrency, formatNumberRO } from "@/lib/utils";

export const unitFormatters: Record<string, (value: number) => string> = {
    '%': (value) => `${formatNumberRO(value, 'compact')}%`,
    'RON': (value) => formatCurrency(value, 'compact'),
    'RON/pers.': (value) => formatCurrency(value, 'compact'),
};

export const yValueFormatter = (value: number, isRelative: boolean, unit: string = 'RON') => {
    if (isRelative) {
        return `${formatNumberRO(value, 'compact')}%`;
    }
    const formatter = unitFormatters[unit];
    if (formatter) {
        return formatter(value);
    }
    return `${formatNumberRO(value, 'compact')} ${unit}`;
};