import { useCallback } from 'react';
import {
  Chart,
  SeriesConfiguration,
  ChartSchema,
  SeriesConfigurationSchema,
} from '@/schemas/chartBuilder';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { updateChartInLocalStorage } from '@/lib/api/chartBuilder';

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

interface UseChartBuilderReturn {
  chart: Chart;
  view: string;
  seriesId?: string;
  updateChart: (updates: Partial<Chart>) => void;
  addSeries: () => void;
  updateSeries: (seriesId: string, updates: Partial<SeriesConfiguration>) => void;
  deleteSeries: (seriesId: string) => void;
  duplicateSeries: (seriesId: string) => void;
  moveSeriesUp: (seriesId: string) => void;
  moveSeriesDown: (seriesId: string) => void;
  saveChart: () => Promise<void>;
  validateChart: () => ValidationResult;
  goToConfig: () => void;
  goToOverview: () => void;
  goToSeriesConfig: (seriesId: string) => void;
}

export function useChartBuilder(): UseChartBuilderReturn {
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

  const updateChart = useCallback((updates: Partial<Chart>) => {
    navigate({
      search: (prev) => {
        const newChart = { ...prev.chart, ...updates } as Chart;
        updateChartInLocalStorage(newChart);
        return { ...prev, chart: newChart } as unknown as never; // TODO: fix this
      },
      replace: true,
    });
  }, [navigate]);


  const addSeries = useCallback(() => {
    const newSeries: SeriesConfiguration = {
      id: crypto.randomUUID(),
      enabled: true,
      label: `New Series ${chart.series.length + 1}`,
      filter: {
        account_categories: ['ch'],
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

  const updateSeries = useCallback((seriesId: string, updates: Partial<SeriesConfiguration>) => {
    updateChart({
      series: chart.series.map(s => s.id === seriesId ? { ...s, ...updates } : s),
    });
  }, [chart, updateChart]);

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
    addSeries,
    updateSeries,
    deleteSeries,
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