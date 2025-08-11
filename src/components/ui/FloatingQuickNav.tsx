import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Map, BarChart2, Table } from 'lucide-react';
import { AnalyticsFilterType, ChartSchema } from '@/schemas/charts';
import { useNavigate } from '@tanstack/react-router';
import { ChartUrlState } from '@/routes/charts/$chartId/_schema';

type View = 'map' | 'table' | 'chart';

type Action = {
    key: View;
    label: string;
    onClick: () => void;
    icon: React.ReactNode;
    active?: boolean;
}

interface FloatingQuickNavProps {
    className?: string;
    mapActive?: boolean;
    tableActive?: boolean;
    chartActive?: boolean;
    filterInput: AnalyticsFilterType;
}

export function FloatingQuickNav({ className, mapActive, tableActive, chartActive, filterInput }: FloatingQuickNavProps) {

    const navigate = useNavigate();

    const handleMapNavigate = () => {
        navigate({ to: '/map', search: (prev) => ({ ...prev, activeView: 'map' }) });
    }

    const handleTableNavigate = () => {
        navigate({ to: '/entity-analytics', search: (prev) => ({ ...prev, activeView: 'table' }) });
    }

    const handleChartNavigate = () => {
        navigate({ to: '/charts/$chartId', params: { chartId: crypto.randomUUID() }, search: { ...convertFilterInputToChartState(filterInput) } });
    }

    const actions: Action[] = [
        { key: 'map', label: 'Go to Map', onClick: handleMapNavigate, icon: <Map className="h-5 w-5" />, active: mapActive },
        { key: 'table', label: 'Go to Entity Table', onClick: handleTableNavigate, icon: <Table className="h-5 w-5" />, active: tableActive },
        { key: 'chart', label: 'Go to Chart View', onClick: handleChartNavigate, icon: <BarChart2 className="h-5 w-5" />, active: chartActive },
    ]

    const visibleActions = actions.filter(a => a.active);

    return (
        <div
            className={cn(
                'hidden md:flex fixed top-8 right-18 z-40 flex-row gap-2',
                className,
            )}
        >
            {visibleActions.map(action => (
                <Button
                    key={action.key}
                    aria-label={action.label}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full shadow-lg border border-slate-200 dark:border-slate-700"
                    onClick={action.onClick}
                >
                    {action.icon}
                </Button>
            ))}
        </div>
    );
}

function convertFilterInputToChartState(filterInput: AnalyticsFilterType): ChartUrlState {
    const series = []
    if (!filterInput.entity_cuis || filterInput.entity_cuis.length === 0) {
        series.push({
            id: crypto.randomUUID(),
            type: 'line-items-aggregated-yearly',
            enabled: true,
            label: 'Total Spending',
            filter: {
                ...filterInput,
                // Doar ordonatoarele principale sunt folosite pentru agregarea totala la nivel national
                report_type: 'Executie bugetara agregata la nivel de ordonator principal',
            },
            config: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })
    }
    const chartState: ChartUrlState = {
        // TODO: convert filterInput to chartState.
        // If entity selected, create one series per entity.
        // If no entity selected, create one series with the filters.
        chart: ChartSchema.parse({
            id: crypto.randomUUID(),
            title: 'Total Spending', // TODO: auto-generate title with better logic
            config: {
                chartType: 'bar',
            },
            series: series,
            annotations: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            description: '* suma totala poate include dubla contabilizarea cheltuielilor datorita transferurilor intre ordonatoare.',
        }),
        view: 'overview',
    }

    return chartState;
}


