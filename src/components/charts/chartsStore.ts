import { Chart, ChartSchema } from "@/schemas/charts";
import { z } from "zod";

const chartsKey = 'saved-charts';

const storedChartSchema = ChartSchema.and(z.object({
    favorite: z.boolean().optional().default(false),
    deleted: z.boolean().optional().default(false),
}));

export type StoredChart = z.infer<typeof storedChartSchema>;


export const getChartsStore = () => {

    const loadSavedCharts = ({ filterDeleted = false, sort = false }: { filterDeleted?: boolean, sort?: boolean } = {}): StoredChart[] => {
        const getRawCharts = () => {
            const chartsRaw = localStorage.getItem(chartsKey);
            if (!chartsRaw) {
                return [];
            }

            let chartsRawParsed: StoredChart[] = [];
            try {
                const parsed = JSON.parse(chartsRaw);
                if (Array.isArray(parsed)) {
                    chartsRawParsed = parsed;
                }
            } catch (error) {
                console.error("Failed to parse charts from localStorage", error);
            }
            if (sort) {
                chartsRawParsed.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
            }
            return chartsRawParsed;
        }

        const chartsRawParsed = getRawCharts();
        const validCharts = chartsRawParsed
            .map(chart => {
                const result = storedChartSchema.safeParse(chart);
                if (result.success) {
                    return result.data;
                } else {
                    console.warn('An invalid chart object was found in localStorage and has been discarded:', result.error.flatten());
                    return null;
                }
            })
            .filter((chart): chart is StoredChart => chart !== null);

        if (!filterDeleted) {
            return validCharts;
        }
        return validCharts.filter((c: StoredChart) => !c.deleted);
    }

    const deleteChart = (chartId: string) => {
        const savedCharts = loadSavedCharts();
        const newCharts = savedCharts.map((c: Chart) => {
            if (c.id === chartId) {
                return { ...c, deleted: true };
            }
            return c;
        });
        localStorage.setItem(chartsKey, JSON.stringify(newCharts));
    }

    const saveChartToLocalStorage = (chart: Chart) => {
        const savedCharts = loadSavedCharts();
        const hasChart = savedCharts.some((c) => c.id === chart.id);
        if (hasChart) {
            return;
        }

        if (!ChartSchema.safeParse(chart).success) {
            console.error('Invalid chart', chart);
            return;
        }

        localStorage.setItem(chartsKey, JSON.stringify([
            chart,
            ...savedCharts,
        ]));
    }

    const updateChartInLocalStorage = (chart: Chart) => {
        const savedCharts = loadSavedCharts();
        const chartIndex = savedCharts.findIndex((c: Chart) => c.id === chart.id);
        const oldChart = savedCharts[chartIndex];
        const newChart = { ...oldChart, ...chart };
        localStorage.setItem(chartsKey, JSON.stringify([
            newChart,
            ...savedCharts.filter((c: Chart) => c.id !== chart.id),
        ]));
    }

    const toggleChartFavorite = (chartId: string) => {
        const savedCharts = loadSavedCharts();
        const chart = savedCharts.find((c: StoredChart) => c.id === chartId);
        if (!chart) {
            return;
        }
        const newChart = { ...chart, favorite: !chart.favorite };
        updateChartInLocalStorage(newChart);
    }

    return {
        loadSavedCharts,
        deleteChart,
        saveChartToLocalStorage,
        updateChartInLocalStorage,
        toggleChartFavorite,
    }
}