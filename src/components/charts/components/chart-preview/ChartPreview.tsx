import { useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { produce } from "immer";
import { Chart } from "@/schemas/charts";
import { convertToTimeSeriesData, convertToAggregatedData, useChartData, SeriesId, Unit } from "../../hooks/useChartData";
import { ChartDisplayArea } from "../chart-view/ChartDisplayArea";
import { ChartPreviewSkeleton } from "@/components/charts/components/chart-list/ChartPreviewSkeleton";
import { cn } from "@/lib/utils";

interface ChartPreviewProps {
    chart: Chart;
    className?: string;
    height?: number;
    onClick?: () => void;
    customizeChart?: (draft: Chart) => void;
}

export function ChartPreview({ chart, className, height, onClick, customizeChart }: ChartPreviewProps) {
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
            draft.config.showAnnotations = false;
            draft.config.showTooltip = false;
            draft.config.showDiffControl = false;
            draft.series.forEach(series => {
                series.config.showDataLabels = false;
            });
            customizeChart?.(draft);
        });
    }, [chart, customizeChart]);

    const { dataSeriesMap, isLoadingData, dataError } = useChartData({
        chart: previewChart,
        enabled: inView,
    });


    const data = useMemo(() => {
        if (!dataSeriesMap) {
            return { timeSeriesData: [], aggregatedData: [], unitMap: new Map<SeriesId, Unit>(), dataMap: null };
        }

        const isAggregated = chart.config.chartType.endsWith('-aggr');
        if (!isAggregated) {
            const { data: timeSeriesData, unitMap } = convertToTimeSeriesData(dataSeriesMap, chart);
            return { timeSeriesData, aggregatedData: [], unitMap, dataMap: dataSeriesMap };
        } else {
            const { data: aggregatedData, unitMap } = convertToAggregatedData(dataSeriesMap, chart);
            return { timeSeriesData: [], aggregatedData, unitMap, dataMap: dataSeriesMap };
        }
    }, [chart, dataSeriesMap]);

    const showSkeleton = !inView || isLoadingData || !data.dataMap;

    return (
        <div ref={ref} className={cn("w-full", className)} onClick={onClick}>
            {showSkeleton ? (
                <ChartPreviewSkeleton />
            ) : (
                <ChartDisplayArea
                    {...data}
                    isPreview={true}
                    chart={previewChart}
                    isLoading={isLoadingData}
                    error={dataError}
                    onAddSeries={() => { }}
                    onAnnotationPositionChange={() => { }}
                    height={height}
                />
            )}
        </div>
    );
}
