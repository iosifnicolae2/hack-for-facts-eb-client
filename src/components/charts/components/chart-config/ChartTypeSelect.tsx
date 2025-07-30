import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartType } from '@/schemas/constants';
import { getChartTypeIcon } from '../../utils';

const CHART_TYPE_ICONS: Record<ChartType, React.ReactNode> = {
    line: getChartTypeIcon('line'),
    bar: getChartTypeIcon('bar'),
    area: getChartTypeIcon('area'),
};

interface ChartTypeSelectProps {
    value: ChartType;
    onValueChange: (value: ChartType) => void;
}

export const ChartTypeSelect = React.memo(({ value, onValueChange }: ChartTypeSelectProps) => (
    <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
            <SelectValue />
        </SelectTrigger>
        <SelectContent>
            {Object.entries(CHART_TYPE_ICONS).map(([type, icon]) => (
                <SelectItem key={type} value={type}>
                    <div className="flex items-center gap-2">
                        {icon}
                        {`${type.charAt(0).toUpperCase() + type.slice(1)} Chart`}
                    </div>
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
)); 