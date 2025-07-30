import React, { useCallback } from 'react';
import { Chart } from '@/schemas/charts';
import { BarChart3 } from 'lucide-react';
import { SeriesItem } from './SeriesItem';

interface SeriesListProps {
    chart: Chart;
    onUpdateChart: (updates: Partial<Chart>) => void;
    onEditSeries: (seriesId: string) => void;
    onDeleteSeries: (seriesId: string) => void;
    onDuplicateSeries: (seriesId: string) => void;
    onMoveSeriesUp: (seriesId: string) => void;
    onMoveSeriesDown: (seriesId: string) => void;
}

export const SeriesList = React.memo(({ chart, onUpdateChart, ...props }: SeriesListProps) => {
    const handleToggleSeriesEnabled = useCallback((seriesId: string, enabled: boolean) => {
        const updatedSeries = chart.series.map(s =>
            s.id === seriesId ? { ...s, enabled, updatedAt: new Date().toISOString() } : s
        );
        onUpdateChart({ series: updatedSeries });
    }, [chart.series, onUpdateChart]);

    if (chart.series.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No series added yet</p>
                <p className="text-sm">Click "Add Series" to start building your chart</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {chart.series.map((series, index) => (
                <SeriesItem
                    key={series.id}
                    series={series}
                    isFirst={index === 0}
                    isLast={index === chart.series.length - 1}
                    chartColor={chart.config.color}
                    onEdit={() => props.onEditSeries(series.id)}
                    onDelete={() => props.onDeleteSeries(series.id)}
                    onDuplicate={() => props.onDuplicateSeries(series.id)}
                    onMoveUp={() => props.onMoveSeriesUp(series.id)}
                    onMoveDown={() => props.onMoveSeriesDown(series.id)}
                    onToggleEnabled={(enabled) => handleToggleSeriesEnabled(series.id, enabled)}
                />
            ))}
        </div>
    );
}); 