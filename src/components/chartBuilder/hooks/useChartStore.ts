import { useCallback } from 'react';
import {
  Chart,
  SeriesConfiguration,
  ChartSchema,
  SeriesConfigurationSchema,
} from '@/schemas/charts';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { produce } from 'immer';
import { toast } from 'sonner';
import { getChartsStore } from '../chartsStore';

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

interface UseChartStoreReturn {
  chart: Chart;
  view: string;
  seriesId?: string;
  updateChart: (updates: Partial<Chart>) => void;
  deleteChart: () => Promise<void>;
  duplicateChart: () => Promise<void>;
  addSeries: () => void;
  updateSeries: (seriesId: string, updates: Partial<SeriesConfiguration> | ((prevSeries: SeriesConfiguration) => SeriesConfiguration)) => void;
  deleteSeries: (seriesId: string) => void;
  setSeries: (series: SeriesConfiguration[]) => void,
  duplicateSeries: (seriesId: string) => void;
  moveSeriesUp: (seriesId: string) => void;
  moveSeriesDown: (seriesId: string) => void;
  saveChart: () => Promise<void>;
  validateChart: () => ValidationResult;
  goToConfig: () => void;
  goToOverview: () => void;
  goToSeriesConfig: (seriesId: string) => void;
}

const chartsStore = getChartsStore();

export function useChartStore(): UseChartStoreReturn {
  const navigate = useNavigate();
  const { chart, view, seriesId } = useSearch({ from: "/charts/$chartId" });


  const goToConfig = useCallback(() => {
    navigate({ to: "/charts/$chartId", search: (prev) => ({ ...prev, view: "config" }), params: { chartId: chart.id }, replace: true });
  }, [chart.id, navigate]);

  const goToOverview = useCallback(() => {
    navigate({ to: "/charts/$chartId", search: (prev) => ({ ...prev, view: "overview" }), params: { chartId: chart.id }, replace: true });
  }, [chart.id, navigate]);

  const goToSeriesConfig = useCallback((seriesId: string) => {
    navigate({ to: "/charts/$chartId", search: (prev) => ({ ...prev, view: "series-config", seriesId }), params: { chartId: chart.id }, replace: true });
  }, [chart.id, navigate]);

  const updateChart = useCallback((updates: Partial<Chart> | ((prevChart?: Chart) => Partial<Chart>)) => {
    navigate({
      search: (prev) => {
        const newChart = { ...prev.chart, ...(typeof updates === 'function' ? updates(prev.chart) : updates) } as Chart;
        chartsStore.updateChartInLocalStorage(newChart);
        return { ...prev, chart: newChart } as unknown as never; // TODO: fix this
      },
      replace: true,
    });
  }, [navigate]);

  const deleteChart = useCallback(async () => {
    await chartsStore.deleteChart(chart.id);
    navigate({ to: "/charts" });
    toast.success("Chart Deleted", {
      description: "The chart has been deleted.",
    });
  }, [chart.id, navigate]);

  const duplicateChart = useCallback(async () => {
    const newChartId = crypto.randomUUID();
    navigate({ to: "/charts/$chartId", params: { chartId: newChartId }, replace: false, search: (prev) => ({ ...prev, chart: { ...prev.chart, id: newChartId, title: `${prev.chart?.title} (Copy)` } as Chart }) });
    toast.success("Chart Duplicated", {
      description: "The chart has been duplicated.",
    });
  }, [navigate]);



  const addSeries = useCallback(() => {
    const newSeries: SeriesConfiguration = {
      id: crypto.randomUUID(),
      type: 'line-items-aggregated-yearly',
      enabled: true,
      label: `New Series ${chart.series.length + 1}`,
      filter: {
        account_category: 'ch',
        report_type: 'Executie bugetara agregata la nivel de ordonator principal',
      },
      filterMetadata: {},
      config: {
        visible: true,
        yAxisId: 'left',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateChart({
      series: [...chart.series, newSeries],
    });
    goToSeriesConfig(newSeries.id);
  }, [chart, updateChart, goToSeriesConfig]);

  const updateSeries = useCallback((seriesId: string, updates: Partial<SeriesConfiguration> | ((prevSeries: SeriesConfiguration) => SeriesConfiguration)) => {
    updateChart((prev) => ({
      ...prev,
      series: prev?.series.map(s => s.id === seriesId ? { ...s, ...(typeof updates === 'function' ? produce(s, (draft) => updates(draft)) : updates) } : s),
    }));
  }, [updateChart]);

  const duplicateSeries = useCallback((seriesId: string) => {
    const originalSeries = chart.series.find(s => s.id === seriesId);
    if (!originalSeries) return;

    const duplicatedSeries: SeriesConfiguration = {
      ...originalSeries,
      id: crypto.randomUUID(),
      label: `${originalSeries.label} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateChart({
      series: [...chart.series, duplicatedSeries],
    });
  }, [chart.series, updateChart]);

  const moveSeriesUp = useCallback((seriesId: string) => {
    const currentIndex = chart.series.findIndex(s => s.id === seriesId);
    if (currentIndex <= 0) return; // Already at top or not found

    const newSeries = [...chart.series];
    [newSeries[currentIndex - 1], newSeries[currentIndex]] = [newSeries[currentIndex], newSeries[currentIndex - 1]];

    updateChart({
      series: newSeries,
    });
  }, [chart.series, updateChart]);

  const moveSeriesDown = useCallback((seriesId: string) => {
    const currentIndex = chart.series.findIndex(s => s.id === seriesId);
    if (currentIndex === -1 || currentIndex >= chart.series.length - 1) return; // Already at bottom or not found

    const newSeries = [...chart.series];
    [newSeries[currentIndex], newSeries[currentIndex + 1]] = [newSeries[currentIndex + 1], newSeries[currentIndex]];

    updateChart({
      series: newSeries,
    });
  }, [chart.series, updateChart]);

  const deleteSeries = useCallback((seriesId: string) => {
    updateChart({
      series: chart.series.filter(s => s.id !== seriesId),
    });

  }, [updateChart, chart]);

  const setSeries = useCallback((series: SeriesConfiguration[]) => {
    updateChart({ series });
  }, [updateChart]);

  const validateChart = useCallback((): ValidationResult => {
    const errors: Record<string, string[]> = {};

    try {
      ChartSchema.parse(chart);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errors' in error) {
        interface ZodError {
          path: (string | number)[];
          message: string;
        }
        const zodError = error as { errors: ZodError[] };
        zodError.errors.forEach((err: ZodError) => {
          const path = err.path.join('.');
          if (!errors[path]) errors[path] = [];
          errors[path].push(err.message);
        });
      }
    }

    // Validate each series
    chart.series.forEach((series, index) => {
      try {
        SeriesConfigurationSchema.parse(series);
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'errors' in error) {
          interface ZodError {
            path: (string | number)[];
            message: string;
          }
          const zodError = error as { errors: ZodError[] };
          zodError.errors.forEach((err: ZodError) => {
            const path = `series.${index}.${err.path.join('.')}`;
            if (!errors[path]) errors[path] = [];
            errors[path].push(err.message);
          });
        }
      }
    });

    const isValid = Object.keys(errors).length === 0;
    return { isValid, errors };
  }, [chart]);

  const saveChart = useCallback(async () => {
    const validation = validateChart();
    if (!validation.isValid) {
      throw new Error('Chart validation failed');
    }

    // Here you would typically save to your backend
    // For now, we'll save to localStorage as an example
    const savedCharts = JSON.parse(localStorage.getItem('savedCharts') || '[]');
    const chartIndex = savedCharts.findIndex((c: Chart) => c.id === chart.id);

    if (chartIndex >= 0) {
      savedCharts[chartIndex] = chart;
    } else {
      savedCharts.push(chart);
    }

    localStorage.setItem('savedCharts', JSON.stringify(savedCharts));

  }, [chart, validateChart]);

  return {
    chart,
    view,
    seriesId,
    updateChart,
    deleteChart,
    duplicateChart,
    addSeries,
    updateSeries,
    deleteSeries,
    setSeries,
    duplicateSeries,
    moveSeriesUp,
    moveSeriesDown,
    saveChart,
    validateChart,
    goToConfig,
    goToOverview,
    goToSeriesConfig,
  };
} 