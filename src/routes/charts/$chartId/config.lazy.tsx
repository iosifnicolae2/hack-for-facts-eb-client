import { createLazyFileRoute, useParams, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye } from 'lucide-react';
import { Chart } from '@/schemas/chartBuilder';
import { loadSavedCharts, saveChart } from '@/lib/api/chartBuilder';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useChartBuilder } from '@/components/chartBuilder/hooks/useChartBuilder';
import { ChartBuilderOverview } from '@/components/chartBuilder/views/ChartBuilderOverview';
import { SeriesDetailView } from '@/components/chartBuilder/views/SeriesDetailView';
import { Badge } from '@/components/ui/badge';

export const Route = createLazyFileRoute("/charts/$chartId/config")({
  component: ChartConfigPage,
});

function ChartConfigPage() {
  const { chartId } = useParams({ from: "/charts/$chartId/config" });
  const navigate = useNavigate();
  const search = useSearch({ from: "/charts/$chartId/config" });
  const [existingChart, setExistingChart] = useState<Chart | null>(null);
  const [isLoadingChart, setIsLoadingChart] = useState(true);
  const [error, setError] = useState<string>('');

  // Initialize chart builder with existing chart
  const {
    chart,
    builderState,
    updateChart,
    updateBuilderState,
    addSeries,
    updateSeries,
    deleteSeries,
    duplicateSeries,
    moveSeriesUp,
    moveSeriesDown,
  } = useChartBuilder(existingChart || undefined);

  // Load chart data
  useEffect(() => {
    const loadChart = async () => {
      try {
        setIsLoadingChart(true);
        setError('');
        const savedCharts = await loadSavedCharts();
        const foundChart = savedCharts.find((c: Chart) => c.id === chartId);

        if (!foundChart) {
          setError('Chart not found');
          return;
        }

        setExistingChart(foundChart);
      } catch (loadError) {
        console.error('Failed to load chart:', loadError);
        setError('Failed to load chart');
      } finally {
        setIsLoadingChart(false);
      }
    };

    loadChart();
  }, [chartId]);

  // Handle automatic navigation to series detail if seriesId is provided
  useEffect(() => {
    if (search && typeof search === 'object' && 'seriesId' in search && search.seriesId && existingChart && builderState.currentView === 'overview') {
      // Check if the series exists
      const seriesExists = existingChart.series.find(s => s.id === search.seriesId);
      if (seriesExists) {
        updateBuilderState({
          currentView: 'series-detail',
          selectedSeriesId: search.seriesId as string
        });
        // Clear the search parameter to avoid navigation loops
        navigate({
          to: '/charts/$chartId/config',
          params: { chartId },
          search: {},
          replace: true
        });
      }
    }
  }, [search, existingChart, builderState.currentView, updateBuilderState, navigate, chartId]);

  // Autosave functionality - save chart whenever it changes
  useEffect(() => {
    if (!existingChart || !chart || JSON.stringify(chart) === JSON.stringify(existingChart)) {
      return; // Don't save if no changes or still loading
    }

    const timeoutId = setTimeout(async () => {
      try {
        await saveChart(chart);
        console.log('Chart autosaved');
      } catch (error) {
        console.error('Failed to autosave chart:', error);
      }
    }, 1000); // Debounce saves by 1 second

    return () => clearTimeout(timeoutId);
  }, [chart, existingChart]);

  const handleBackToOverview = () => {
    updateBuilderState({
      currentView: 'overview',
      selectedSeriesId: undefined,
      selectedAnnotationId: undefined
    });
  };

  const getViewTitle = () => {
    switch (builderState.currentView) {
      case 'overview':
        return 'Chart Configuration';
      case 'series-detail': {
        const selectedSeries = chart.series.find(s => s.id === builderState.selectedSeriesId);
        return selectedSeries ? `Edit Series: ${selectedSeries.label}` : 'Add New Series';
      }
      default:
        return 'Chart Configuration';
    }
  };

  const showBackButton = builderState.currentView !== 'overview';

  if (isLoadingChart) {
    return (
      <div className="container mx-auto py-6">
        <LoadingSpinner text="Loading chart configuration..." />
      </div>
    );
  }

  if (error || !existingChart) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate({ to: '/charts' })} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Charts
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertDescription>
            {error || 'Chart not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button onClick={handleBackToOverview} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {getViewTitle()}
              </h1>
              {builderState.isDirty && (
                <Badge variant="secondary" className="text-xs">
                  Unsaved Changes
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {chart.title || 'Untitled Chart'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showBackButton && (
            <Button onClick={handleBackToOverview} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <Button onClick={() => navigate({ to: `/charts/${chartId}` })} className="gap-2">
            <Eye className="h-4 w-4" />
            View Chart
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Content */}
      <div className="space-y-6">
        {builderState.currentView === 'overview' && (
          <ChartBuilderOverview
            chart={chart}
            onUpdateChart={updateChart}
            onAddSeries={addSeries}
            onEditSeries={(seriesId) =>
              updateBuilderState({
                currentView: 'series-detail',
                selectedSeriesId: seriesId
              })
            }
            onDeleteSeries={deleteSeries}
            onDuplicateSeries={duplicateSeries}
            onMoveSeriesUp={moveSeriesUp}
            onMoveSeriesDown={moveSeriesDown}
            validationErrors={builderState.validationErrors}
          />
        )}

        {builderState.currentView === 'series-detail' && (
          <SeriesDetailView
            chart={chart}
            selectedSeriesId={builderState.selectedSeriesId}
            onUpdateSeries={updateSeries}
            onDeleteSeries={deleteSeries}
            onBack={handleBackToOverview}
            validationErrors={builderState.validationErrors}
          />
        )}
      </div>
    </div>
  );
}
