import { useState, useCallback, useEffect } from 'react';
import { 
  Chart, 
  ChartBuilderState, 
  SeriesConfiguration, 
  ChartSchema,
  SeriesConfigurationSchema,
  DEFAULT_CHART_CONFIG
} from '@/schemas/chartBuilder';

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

interface UseChartBuilderReturn {
  chart: Chart;
  builderState: ChartBuilderState;
  updateChart: (updates: Partial<Chart>) => void;
  updateBuilderState: (updates: Partial<ChartBuilderState>) => void;
  addSeries: () => void;
  updateSeries: (seriesId: string, updates: Partial<SeriesConfiguration>) => void;
  deleteSeries: (seriesId: string) => void;
  saveChart: () => Promise<void>;
  validateChart: () => ValidationResult;
  resetChart: () => void;
}

export function useChartBuilder(existingChart?: Chart): UseChartBuilderReturn {
  // Initialize chart with defaults or existing chart
  const createDefaultChart = (): Chart => ({
    id: crypto.randomUUID(),
    title: '',
    description: '',
    config: { ...DEFAULT_CHART_CONFIG },
    series: [],
    annotations: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isPublic: false,
    tags: [],
  });

  const [chart, setChart] = useState<Chart>(() => 
    existingChart ? { ...existingChart } : createDefaultChart()
  );

  // Update chart when existingChart changes (important for async loading)
  useEffect(() => {
    if (existingChart) {
      setChart({ ...existingChart });
      setBuilderState(prev => ({ ...prev, isDirty: false }));
    }
  }, [existingChart]);

  const [builderState, setBuilderState] = useState<ChartBuilderState>({
    currentView: 'overview',
    selectedSeriesId: undefined,
    selectedAnnotationId: undefined,
    isDirty: false,
    validationErrors: {},
  });

  // Mark as dirty when chart changes
  useEffect(() => {
    if (existingChart && JSON.stringify(chart) !== JSON.stringify(existingChart)) {
      setBuilderState(prev => ({ ...prev, isDirty: true }));
    } else if (!existingChart && (chart.title || chart.series.length > 0)) {
      setBuilderState(prev => ({ ...prev, isDirty: true }));
    }
  }, [chart, existingChart]);

  const updateChart = useCallback((updates: Partial<Chart>) => {
    setChart(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date(),
    }));
  }, []);

  const updateBuilderState = useCallback((updates: Partial<ChartBuilderState>) => {
    setBuilderState(prev => ({ ...prev, ...updates }));
  }, []);

  const addSeries = useCallback(() => {
    const newSeries: SeriesConfiguration = {
      id: crypto.randomUUID(),
      label: `Series ${chart.series.length + 1}`,
      filter: {},
      config: {
        visible: true,
        yAxisId: 'left',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    updateChart({
      series: [...chart.series, newSeries],
    });

    // Navigate to series detail view
    setBuilderState(prev => ({
      ...prev,
      currentView: 'series-detail',
      selectedSeriesId: newSeries.id,
    }));
  }, [chart.series, updateChart]);

  const updateSeries = useCallback((seriesId: string, updates: Partial<SeriesConfiguration>) => {
    setChart(prev => ({
      ...prev,
      series: prev.series.map(s => 
        s.id === seriesId 
          ? { ...s, ...updates, updatedAt: new Date() }
          : s
      ),
      updatedAt: new Date(),
    }));
  }, []);

  const deleteSeries = useCallback((seriesId: string) => {
    setChart(prev => ({
      ...prev,
      series: prev.series.filter(s => s.id !== seriesId),
      updatedAt: new Date(),
    }));

    // If we're currently editing this series, go back to overview
    if (builderState.selectedSeriesId === seriesId) {
      setBuilderState(prev => ({
        ...prev,
        currentView: 'overview',
        selectedSeriesId: undefined,
      }));
    }
  }, [builderState.selectedSeriesId]);

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
    
    setBuilderState(prev => ({
      ...prev,
      validationErrors: errors,
    }));

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
    
    setBuilderState(prev => ({ ...prev, isDirty: false }));
  }, [chart, validateChart]);

  const resetChart = useCallback(() => {
    setChart(createDefaultChart());
    setBuilderState({
      currentView: 'overview',
      selectedSeriesId: undefined,
      selectedAnnotationId: undefined,
      isDirty: false,
      validationErrors: {},
    });
  }, []);

  return {
    chart,
    builderState,
    updateChart,
    updateBuilderState,
    addSeries,
    updateSeries,
    deleteSeries,
    saveChart,
    validateChart,
    resetChart,
  };
} 