import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye } from 'lucide-react';
import { useChartBuilder } from '@/components/chartBuilder/hooks/useChartBuilder';
import { ChartBuilderOverview } from '@/components/chartBuilder/views/ChartBuilderOverview';

export function ChartConfig() {
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
    } = useChartBuilder();


    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => goToOverview()}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">
                                Chart Configuration
                            </h1>
                        </div>
                        <p className="text-muted-foreground">
                            {chart.title || 'Untitled Chart'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button onClick={() => goToOverview()} className="gap-2">
                        <Eye className="h-4 w-4" />
                        View Chart
                    </Button>
                </div>
            </div>


            {/* Content */}
            <div className="space-y-6">
                <ChartBuilderOverview
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
