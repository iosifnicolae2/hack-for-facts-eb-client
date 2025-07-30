import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useChartStore } from '@/components/charts/hooks/useChartStore';
import { ChartInfoCard } from '../chart-config/ChartInfoCard';
import { GlobalSettingsCard } from '../chart-config/GlobalSettingsCard';
import { DataSeriesCard } from '../chart-config/DataSeriesCard';

export function ChartConfigView() {
    const {
        chart,
        updateChart,
        addSeries,
        deleteSeries,
        duplicateSeries,
        moveSeriesUp,
        moveSeriesDown,
        goToSeriesConfig,
        goToOverview,
    } = useChartStore();


    return (
        <div className="container mx-auto py-6 space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Chart Configuration
                    </h1>
                    <p className="text-muted-foreground">
                        {chart.title || 'Untitled Chart'}
                    </p>
                </div>

                <Button onClick={goToOverview} className="gap-2">
                    <Eye className="h-4 w-4" />
                    View Chart
                </Button>
            </header>


            <div className="space-y-6">
                <ChartInfoCard chart={chart} onUpdateChart={updateChart} />
                <GlobalSettingsCard chart={chart} onUpdateChart={updateChart} />
                <DataSeriesCard
                    chart={chart}
                    onUpdateChart={updateChart}
                    onAddSeries={addSeries}
                    onEditSeries={goToSeriesConfig}
                    onDeleteSeries={deleteSeries}
                    onDuplicateSeries={duplicateSeries}
                    onMoveSeriesUp={moveSeriesUp}
                    onMoveSeriesDown={moveSeriesDown}
                />
            </div>
        </div>
    );
}
