import { Chart, ChartSchema } from "@/schemas/charts";
import { z } from "zod";

const chartsKey = 'saved-charts';
const panelsKey = 'saved-panels';

const storedChartSchema = ChartSchema.and(z.object({
    favorite: z.boolean().optional().default(false),
    deleted: z.boolean().optional().default(false),
}));

export type StoredChart = z.infer<typeof storedChartSchema>;

const chartPanelSchema = z.object({
    id: z.string().default(crypto.randomUUID()),
    title: z.string().default(''),
    charts: z.array(z.object({
        id: z.string(),
        order: z.number().optional(),
    })),
    opened: z.boolean().optional().default(true),
    order: z.number().optional().default(0),
});

export type ChartPanel = z.infer<typeof chartPanelSchema>;


export const getChartsStore = () => {

    const loadSavedCharts = ({ filterDeleted = false }: { filterDeleted?: boolean } = {}): StoredChart[] => {
        const chartsRaw = localStorage.getItem(chartsKey);
        if (!chartsRaw) {
            return [];
        }

        let chartsRawParsed: unknown[];
        try {
            const parsed = JSON.parse(chartsRaw);
            if (Array.isArray(parsed)) {
                chartsRawParsed = parsed;
            } else {
                console.error("Stored charts are not an array:", parsed);
                return [];
            }
        } catch (error) {
            console.error("Failed to parse charts from localStorage", error);
            return [];
        }

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
        localStorage.setItem(chartsKey, JSON.stringify([
            chart,
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

    const createPanel = (title: string) => {
        const panels = loadPanels();
        const newPanel = { id: crypto.randomUUID(), title, chartIds: [], order: panels.length };
        localStorage.setItem(panelsKey, JSON.stringify([...panels, newPanel]));
    }

    const loadPanels = (): ChartPanel[] => {
        try {
            const panelsRaw = localStorage.getItem(panelsKey);
            if (!panelsRaw) {
                return [];
            }
            return chartPanelSchema.array().parse(JSON.parse(panelsRaw));
        } catch (error) {
            console.error('Error loading panels', error);
            return [];
        }
    }

    const addChartToPanel = (panelId: string, chartId: string) => {
        const panels = loadPanels();
        const panel = panels.find((p) => p.id === panelId);
        if (!panel) {
            return;
        }
        const newPanel = { ...panel, charts: [...panel.charts, { id: chartId }] };
        localStorage.setItem(panelsKey, JSON.stringify([...panels.filter((p) => p.id !== panelId), newPanel]));
    }

    const removeChartFromPanel = (panelId: string, chartId: string) => {
        const panels = loadPanels();
        const panel = panels.find((p) => p.id === panelId);
        if (!panel) {
            return;
        }
        const newPanel = { ...panel, charts: panel.charts.filter((c) => c.id !== chartId) };
        localStorage.setItem(panelsKey, JSON.stringify([...panels.filter((p) => p.id !== panelId), newPanel]));
    }

    const updatePanelTitle = (panelId: string, title: string) => {
        const panels = loadPanels();
        const panel = panels.find((p) => p.id === panelId);
        if (!panel) {
            return;
        }
        const newPanel = { ...panel, title };
        localStorage.setItem(panelsKey, JSON.stringify([...panels.filter((p) => p.id !== panelId), newPanel]));
    }

    const updatePanelOrder = (panelId: string, order: number) => {
        const panels = loadPanels();
        const panel = panels.find((p) => p.id === panelId);
        if (!panel) {
            return;
        }
        const newPanel = { ...panel, order };
        localStorage.setItem(panelsKey, JSON.stringify([...panels.filter((p) => p.id !== panelId), newPanel]));
    }

    const togglePanelOpened = (panelId: string) => {
        const panels = loadPanels();
        const panel = panels.find((p) => p.id === panelId);
        if (!panel) {
            return;
        }
    }

    const deletePanel = (panelId: string) => {
        const panels = loadPanels();
        localStorage.setItem(panelsKey, JSON.stringify(panels.filter((p) => p.id !== panelId)));
    }

    const changeChartOrder = (panelId: string, chartId: string, order: number) => {
        const panels = loadPanels();
        const panel = panels.find((p) => p.id === panelId);
        if (!panel) {
            return;
        }
        const newPanel = { ...panel, charts: panel.charts.map((c) => c.id === chartId ? { ...c, order } : c) };
        localStorage.setItem(panelsKey, JSON.stringify([...panels.filter((p) => p.id !== panelId), newPanel]));
    }

    return {
        loadSavedCharts,
        deleteChart,
        saveChartToLocalStorage,
        updateChartInLocalStorage,
        toggleChartFavorite,
        createPanel,
        loadPanels,
        addChartToPanel,
        removeChartFromPanel,
        updatePanelTitle,
        updatePanelOrder,
        togglePanelOpened,
        deletePanel,
        changeChartOrder,
    }
}