import { useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { produce } from "immer";
import { Chart } from "@/schemas/charts";
import { useChartData } from "../../hooks/useChartData";
import { ChartDisplayArea } from "../chart-view/ChartDisplayArea";
import { ChartPreviewSkeleton } from "@/components/charts/components/chart-list/ChartPreviewSkeleton";
import { cn } from "@/lib/utils";

interface ChartPreviewProps {
    chart: Chart;
    className?: string;
    onClick?: () => void;
}

export function ChartPreview({ chart, className, onClick }: ChartPreviewProps) {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
        rootMargin: '50px 0px',
    });

    const previewChart: Chart = useMemo(() => {
        // Using produce is great here for an immutable update.
        return produce(chart, (draft: Chart) => {
            draft.config.showLegend = false;
            draft.config.showDataLabels = false;
            draft.config.showGridLines = false;
            draft.series.forEach(series => {
                series.config.showDataLabels = false;
            });
        });
    }, [chart]);

    const { chartData, isLoadingData, dataError } = useChartData({
        chart: previewChart,
        enabled: inView,
    });

    const showSkeleton = !inView || isLoadingData;

    return (
        <div ref={ref} className={cn("w-full", className)} onClick={onClick}>
            {showSkeleton ? (
                <ChartPreviewSkeleton />
            ) : (
                <ChartDisplayArea
                    isPreview={true}
                    chart={previewChart}
                    chartData={chartData}
                    isLoading={isLoadingData}
                    error={dataError}
                    onAddSeries={() => { }}
                />
            )}
        </div>
    );
}