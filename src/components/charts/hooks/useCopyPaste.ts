import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { CopiedSeriesSchema, Series } from "@/schemas/charts";
import { useChartStore } from "./useChartStore";
import { getAllDependencies } from "@/lib/chart-calculation-utils";
import { DataSeriesMap } from "./useChartData";

export function useCopyPasteChart(dataMap?: DataSeriesMap) {
    const { chart, setSeries } = useChartStore();

    const copyChart = useCallback(async () => {
        const clipboardData = {
            type: 'chart-copy',
            payload: {
                data: dataMap,
                chart: chart,
            },
        };
        await navigator.clipboard.writeText(JSON.stringify(clipboardData));
        toast.success("Chart Copied", {
            description: "The chart data has been copied to the clipboard.",
        });

    }, [chart, dataMap]);

    const duplicateSeries = useCallback((seriesId: string) => {
        const seriesToDuplicate = chart.series.find(s => s.id === seriesId);
        if (!seriesToDuplicate) return;

        const duplicatedSeries = {
            ...seriesToDuplicate,
            id: crypto.randomUUID(),
            label: `${seriesToDuplicate.label} (copy)`,
        };

        const seriesIndex = chart.series.findIndex(s => s.id === seriesId);
        const newSeries = [...chart.series];
        newSeries.splice(seriesIndex + 1, 0, duplicatedSeries);
        setSeries(newSeries);
    }, [chart.series, setSeries]);

    const copySeries = useCallback(async (seriesId: string) => {
        const seriesToCopy = chart.series.find(s => s.id === seriesId);
        if (!seriesToCopy) return;

        let newSeries: Series[] = [seriesToCopy as Series];

        const dependencies = getAllDependencies(seriesToCopy, chart);
        newSeries = [...newSeries, ...dependencies];

        const clipboardData = {
            type: 'chart-series-copy',
            payload: newSeries,
        };

        try {
            await navigator.clipboard.writeText(JSON.stringify(clipboardData));
            toast.success("Series Copied", {
                description: `The series "${seriesToCopy.label}" has been copied to the clipboard. You can paste it into another chart.`,
            });
        } catch {
            toast.error("Copy Failed", {
                description: "Could not copy the series to the clipboard.",
            });
        }
    }, [chart]);

    useEffect(() => {
        const handlePaste = async () => {
            const text = await navigator.clipboard.readText();
            if (!text) return;

            try {
                const parsed = JSON.parse(text);
                const validated = CopiedSeriesSchema.safeParse(parsed);
                if (validated.success) {
                    const newSeriesData: Series[] = validated.data.payload;

                    const newSeriesIds = newSeriesData.map(s => s.id);
                    const prevSeries = chart.series.filter(s => !newSeriesIds.includes(s.id));

                    // Remove duplicates
                    const series = [...prevSeries, ...newSeriesData].filter((s, index, self) =>
                        index === self.findIndex((t) => t.id === s.id)
                    );
                    setSeries(series);

                    toast.success("Series Pasted", {
                        description: `The copied series ${newSeriesData.map(s => s.label).join(', ')} has been added to the chart.`,
                    });
                }
            } catch {
                // Ignore paste events that are not valid JSON or do not match our schema
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => {
            document.removeEventListener('paste', handlePaste);
        };
    }, [chart.series, setSeries]);

    return {
        duplicateSeries,
        copySeries,
        copyChart,
    };
}