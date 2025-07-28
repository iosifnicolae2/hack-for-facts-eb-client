import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { CopiedSeriesSchema, SeriesConfiguration } from "@/schemas/charts";
import { useChartStore } from "./useChartStore";
import { ChartData } from "recharts/types/state/chartDataSlice";

export function useCopyPaste(chartData?: ChartData) {
    const { chart, setSeries } = useChartStore();


    const copyChart = useCallback(async () => {
        const clipboardData = {
            type: 'chart-copy',
            payload: {
                data: chartData,
                chart: chart,
            },
        };
        await navigator.clipboard.writeText(JSON.stringify(clipboardData));
        toast.success("Chart Copied", {
            description: "The chart data has been copied to the clipboard.",
        });

    }, [chart, chartData]);

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

        const newSeries = {
            ...seriesToCopy,
            id: crypto.randomUUID(),
        };

        const clipboardData = {
            type: 'chart-series-copy',
            payload: [newSeries],
        };

        try {
            await navigator.clipboard.writeText(JSON.stringify(clipboardData));
            toast.success("Series Copied", {
                description: "The series has been copied to the clipboard. You can paste it into another chart.",
            });
        } catch {
            toast.error("Copy Failed", {
                description: "Could not copy the series to the clipboard.",
            });
        }
    }, [chart.series]);

    useEffect(() => {
        const handlePaste = async () => {
            const text = await navigator.clipboard.readText();
            if (!text) return;

            try {
                const parsed = JSON.parse(text);
                const validated = CopiedSeriesSchema.safeParse(parsed);

                if (validated.success) {
                    const newSeriesData: SeriesConfiguration[] = validated.data.payload.map(s => ({
                        ...s,
                        id: crypto.randomUUID(),
                    }));

                    setSeries([...chart.series, ...newSeriesData]);

                    toast.success("Series Pasted", {
                        description: "The copied series has been added to the chart.",
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