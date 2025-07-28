import { useCallback } from 'react';
import { Chart } from '@/schemas/charts';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useChartStore } from "@/components/chartBuilder/hooks/useChartStore";
import { ChartFiltersOverview } from "@/components/chartBuilder/components/filters-details/ChartFiltersOverview";
import { ChartViewHeader } from "@/components/chartBuilder/components/chart-view/ChartViewHeader";
import { ChartDisplayArea } from "@/components/chartBuilder/components/chart-view/ChartDisplayArea";
import { ChartQuickConfig } from "@/components/chartBuilder/components/chart-quick-config/ChartQuickConfig";
import { SeriesList } from "@/components/chartBuilder/components/chart-view/SeriesList";
import { useCopyPaste } from "../../hooks/useCopyPaste";
import { useChartData } from '../../hooks/useChartData';

export function ChartView() {
  const { chart, updateChart, updateSeries, moveSeriesUp, moveSeriesDown, addSeries, goToConfig, goToSeriesConfig, setSeries, deleteSeries, deleteChart, duplicateChart } = useChartStore();
  const { chartData, isLoadingData, dataError } = useChartData({ chart });
  const { duplicateSeries, copySeries, copyChart } = useCopyPaste(chartData);

  const handleToggleSeriesEnabled = useCallback(async (seriesId: string, enabled: boolean) => {
    updateSeries(seriesId, (prevSeries) => ({ ...prevSeries, enabled }));
  }, [updateSeries]);

  const handleUpdateChart = useCallback(async (updates: Partial<Chart>) => {
    updateChart(updates);
  }, [updateChart]);

  if (!chart) {
    return <LoadingSpinner text="Loading chart configuration..." />;
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 space-y-6">
      <ChartViewHeader chart={chart} onConfigure={goToConfig} />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex flex-col flex-grow space-y-6">
          <div>
            <ChartDisplayArea
              chart={chart}
              chartData={chartData}
              isLoading={isLoadingData}
              error={dataError}
              onAddSeries={addSeries}
            />
          </div>
          <ChartFiltersOverview chart={chart} onFilterClick={goToSeriesConfig} />
        </div>

        <div className="lg:w-96 flex-shrink-0 space-y-6">
          <ChartQuickConfig
            chart={chart}
            onUpdateChart={handleUpdateChart}
            onDeleteChart={deleteChart}
            onDuplicateChart={duplicateChart}
            onOpenConfigPanel={goToConfig}
            onCopyData={copyChart}
          />
          <SeriesList
            chart={chart}
            onAddSeries={addSeries}
            onSeriesClick={goToSeriesConfig}
            onToggleSeries={handleToggleSeriesEnabled}
            onMoveSeriesUp={moveSeriesUp}
            onMoveSeriesDown={moveSeriesDown}
            updateSeries={updateSeries}
            setSeries={setSeries}
            deleteSeries={deleteSeries}
            onDuplicateSeries={duplicateSeries}
            onCopySeries={copySeries}
          />
        </div>
      </div>
    </div>
  );
}