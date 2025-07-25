import { createLazyFileRoute, useParams, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react';
import { Chart } from '@/schemas/chartBuilder';
import { loadSavedCharts, saveChart } from '@/lib/api/chartBuilder';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useChartBuilder } from '@/components/chartBuilder/hooks/useChartBuilder';
import { ChartBuilderOverview } from '@/components/chartBuilder/views/ChartBuilderOverview';
import { SeriesDetailView } from '@/components/chartBuilder/views/SeriesDetailView';
import { ChartPreview } from '@/components/chartBuilder/views/ChartPreview';
import { Badge } from '@/components/ui/badge';

export const Route = createLazyFileRoute("/charts/$chartId/config")({
  component: ChartConfigPage,
});

function ChartConfigPage() {
  const { chartId } = useParams({ from: "/charts/$chartId/config" });
  const navigate = useNavigate();
  const [existingChart, setExistingChart] = useState<Chart | null>(null);
  const [isLoadingChart, setIsLoadingChart] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [saveError, setSaveError] = useState<string>('');

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


  // Initialize chart builder with existing chart
  const {
    chart,
    builderState,
    updateChart,
    updateBuilderState,
    addSeries,
    updateSeries,
    deleteSeries,
  } = useChartBuilder(existingChart || undefined);

  const handleSave = async () => {
    // const validation = validateChart();
    // TODO: fix date validation errors
    // if (!validation.isValid) {
    //   setSaveError('Please fix validation errors before saving');
    //   return;
    // }

    try {
      setIsSaving(true);
      setSaveError('');

      // Update timestamps
      const chartToSave = {
        ...chart,
        updatedAt: new Date()
      };

      await saveChart(chartToSave);

      // Navigate back to chart detail page
      navigate({ to: `/charts/${chartId}` });
    } catch (error) {
      console.error('Failed to save chart:', error);
      setSaveError('Failed to save chart. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    navigate({ to: `/charts/${chartId}` });
  };

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
      case 'preview':
        return 'Chart Preview';
      default:
        return 'Chart Configuration';
    }
  };

  const showBackButton = builderState.currentView !== 'overview';
  const showSaveButton = builderState.currentView === 'overview';
  const showPreviewButton = builderState.currentView === 'preview';

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
          {showBackButton ? (
            <Button variant="ghost" onClick={handleBackToOverview} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Chart
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
          {showPreviewButton && (
            <Button onClick={() => updateBuilderState({ currentView: 'overview' })} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Edit
            </Button>
          )}
          {showSaveButton && (
            <>
              <Button
                onClick={() => updateBuilderState({ currentView: 'preview' })}
                variant="outline"
                className="gap-2"
                disabled={chart.series.length === 0}
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Error Display */}
      {saveError && (
        <Alert variant="destructive">
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      {/* Content */}
      <div className="bg-card rounded-lg border">
        <div className="p-6">
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
              onPreview={() => updateBuilderState({ currentView: 'preview' })}
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

          {builderState.currentView === 'preview' && (
            <ChartPreview
              chart={chart}
              onBack={handleBackToOverview}
              onEdit={() => updateBuilderState({ currentView: 'overview' })}
            />
          )}
        </div>
      </div>
    </div>
  );
}
