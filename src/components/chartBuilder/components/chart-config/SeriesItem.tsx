import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { SeriesConfiguration } from '@/schemas/charts';
import { Settings, Copy, ChevronUp, ChevronDown } from 'lucide-react';
import { DeleteSeriesDialog } from './DeleteSeriesDialog';

interface SeriesItemProps {
    series: SeriesConfiguration;
    isFirst: boolean;
    isLast: boolean;
    chartColor: string;
    onEdit: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onToggleEnabled: (enabled: boolean) => void;
}

export const SeriesItem = React.memo(({
    series,
    isFirst,
    isLast,
    chartColor,
    onEdit,
    onDelete,
    onDuplicate,
    onMoveUp,
    onMoveDown,
    onToggleEnabled,
}: SeriesItemProps) => {
    const seriesColor = series.config.color || chartColor || '#0000ff';

    return (
        <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-4 h-4 rounded-full border flex-shrink-0" style={{ backgroundColor: seriesColor }} />
                <div className="flex-1 min-w-0">
                    <div className="font-medium cursor-pointer truncate" onClick={onEdit} title={series.label}>{series.label}</div>
                    <div className="text-sm text-muted-foreground">
                        {series.config.chartType || 'Default'} chart
                        {/* {series.filter.entity_cuis?.length > 0 && ` • ${series.filter.entity_cuis.length} entities`} */}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
                <Switch
                    id={`series-${series.id}-enabled`}
                    checked={series.enabled}
                    onCheckedChange={onToggleEnabled}
                    aria-label={series.enabled ? 'Disable series' : 'Enable series'}
                />
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={onMoveUp} disabled={isFirst} title="Move up"><ChevronUp className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={onMoveDown} disabled={isLast} title="Move down"><ChevronDown className="h-4 w-4" /></Button>
                </div>
                <Button variant="ghost" size="icon" onClick={onDuplicate} title="Duplicate series"><Copy className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={onEdit} title="Edit series"><Settings className="h-4 w-4" /></Button>
                <DeleteSeriesDialog onDelete={onDelete} />
            </div>
        </div>
    );
}); 