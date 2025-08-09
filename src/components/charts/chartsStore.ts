import { Chart, ChartSchema } from "@/schemas/charts";
import { z } from "zod";

const chartsKey = 'saved-charts';
const categoriesKey = 'chart-categories';

const storedChartSchema = ChartSchema.and(z.object({
    favorite: z.boolean().optional().default(false),
    deleted: z.boolean().optional().default(false),
    // List of category IDs the chart belongs to
    categories: z.array(z.string()).optional().default([]),
}));

export type StoredChart = z.infer<typeof storedChartSchema>;

// Categories
const categorySchema = z.object({
    id: z.string().default(() => crypto.randomUUID()),
    name: z.string(),
    createdAt: z.string().default(() => new Date().toISOString()),
    updatedAt: z.string().default(() => new Date().toISOString()),
});
export type ChartCategory = z.infer<typeof categorySchema>;


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

    const loadCategories = (): ChartCategory[] => {
        const raw = localStorage.getItem(categoriesKey);
        if (!raw) return [];
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed
                    .map((c) => {
                        const r = categorySchema.safeParse(c);
                        return r.success ? r.data : null;
                    })
                    .filter((c): c is ChartCategory => c !== null)
                    .sort((a, b) => a.name.localeCompare(b.name));
            }
        } catch (err) {
            console.error('Failed to parse chart categories from localStorage', err);
        }
        return [];
    };

    const saveCategories = (categories: readonly ChartCategory[]) => {
        localStorage.setItem(categoriesKey, JSON.stringify(categories));
    };

    const createCategory = (name: string): ChartCategory => {
        const trimmed = name.trim();
        if (trimmed.length === 0) {
            throw new Error('Category name cannot be empty');
        }
        const categories = loadCategories();
        // Avoid duplicates by name (case-insensitive)
        const exists = categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
        if (exists) {
            throw new Error('A category with this name already exists');
        }
        const newCategory: ChartCategory = {
            id: crypto.randomUUID(),
            name: trimmed,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        saveCategories([newCategory, ...categories]);
        return newCategory;
    };

    const renameCategory = (id: string, newName: string) => {
        const categories = loadCategories();
        const index = categories.findIndex((c) => c.id === id);
        if (index === -1) return;
        categories[index] = { ...categories[index], name: newName.trim(), updatedAt: new Date().toISOString() };
        saveCategories(categories);
    };

    const deleteCategory = (id: string) => {
        const categories = loadCategories();
        const filtered = categories.filter((c) => c.id !== id);
        saveCategories(filtered);
        // Remove the category from all charts
        const savedCharts = loadSavedCharts();
        const updatedCharts = savedCharts.map((c) => ({
            ...c,
            categories: (c.categories ?? []).filter((catId) => catId !== id),
        }));
        localStorage.setItem(chartsKey, JSON.stringify(updatedCharts));
    };

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

    const toggleChartCategory = (chartId: string, categoryId: string) => {
        const savedCharts = loadSavedCharts();
        const chart = savedCharts.find((c) => c.id === chartId);
        if (!chart) return;
        const current = chart.categories ?? [];
        const has = current.includes(categoryId);
        const updated: StoredChart = {
            ...chart,
            categories: has ? current.filter((c) => c !== categoryId) : [...current, categoryId],
            updatedAt: new Date().toISOString(),
        };
        updateChartInLocalStorage(updated);
    };

    return {
        loadSavedCharts,
        loadCategories,
        createCategory,
        renameCategory,
        deleteCategory,
        deleteChart,
        saveChartToLocalStorage,
        updateChartInLocalStorage,
        toggleChartFavorite,
        toggleChartCategory,
    }
}