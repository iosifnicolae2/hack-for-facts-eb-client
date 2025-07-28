import { useChartData } from "../../hooks/useChartData";
import { Chart } from "@/schemas/charts";
import { ChartDisplayArea } from "../chart-view/ChartDisplayArea";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { produce } from "immer";

interface ChartPreviewProps {
    chart: Chart;
    className?: string;
    onClick?: () => void;
}

export function ChartPreview({ chart, className, onClick }: ChartPreviewProps) {
    const previewChart: Chart = useMemo(() => {
        return produce(chart, (draft: Chart) => {
            draft.config.showLegend = false;
            draft.config.showDataLabels = false;
            draft.series.forEach(series => {
                series.config.showDataLabels = false;
            });
            return draft;
        });
    }, [chart]);

    const { chartData, isLoadingData, dataError } = useChartData({ chart: previewChart });

    return (
        <div className={cn(className)} onClick={onClick}>
            <ChartDisplayArea
                isPreview={true}
                chart={previewChart}
                chartData={chartData}
                isLoading={isLoadingData}
                error={dataError}
                onAddSeries={() => { }}
            />
        </div>
    );
}