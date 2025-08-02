import React from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartType } from '@/schemas/constants';
import { getChartTypeIcon } from '../../utils';

const CHART_TYPE_ICONS: Record<ChartType, React.ReactNode> = {
    line: getChartTypeIcon('line'),
    bar: getChartTypeIcon('bar'),
    area: getChartTypeIcon('area'),
    'bar-aggr': getChartTypeIcon('bar'),
    'pie-aggr': getChartTypeIcon('pie'),
    'treemap-aggr': getChartTypeIcon('treemap'),
    'sankey-aggr': getChartTypeIcon('sankey'),
};

const CHART_TYPE_LABELS: Record<ChartType, string> = {
    line: 'Line Chart',
    bar: 'Bar Chart',
    area: 'Area Chart',
    'bar-aggr': 'Aggregated Bar Chart',
    'pie-aggr': 'Aggregated Pie Chart',
    'treemap-aggr': 'Aggregated Treemap',
    'sankey-aggr': 'Aggregated Sankey',
};

interface ChartTypeSelectProps {
    value: ChartType;
    onValueChange: (value: ChartType) => void;
}

export const ChartTypeSelect = React.memo(({ value, onValueChange }: ChartTypeSelectProps) => {
    const timeSeriesCharts = ['line', 'bar', 'area'];
    const aggregatedCharts = ['bar-aggr', 'pie-aggr', 'treemap-aggr', 'sankey-aggr'];
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Time-series charts</SelectLabel>
                    {timeSeriesCharts.map((type) => (
                        <SelectItem key={type} value={type}>
                            <div className="flex items-center gap-2">
                                {CHART_TYPE_ICONS[type as ChartType]}
                                {CHART_TYPE_LABELS[type as ChartType]}
                            </div>
                        </SelectItem>
                    ))}
                </SelectGroup>

                <SelectGroup>
                    <SelectLabel>Aggregated charts</SelectLabel>
                    {aggregatedCharts.map((type) => (
                        <SelectItem key={type} value={type}>
                            <div className="flex items-center gap-2">
                                {CHART_TYPE_ICONS[type as ChartType]}
                                {CHART_TYPE_LABELS[type as ChartType]}
                            </div>
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select >
    )
}); 