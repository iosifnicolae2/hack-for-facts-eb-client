import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useChartStore } from "@/components/charts/hooks/useChartStore";
import { ChartFiltersOverview } from "@/components/charts/components/filters-details/ChartFiltersOverview";
import { ChartViewHeader } from "@/components/charts/components/chart-view/ChartViewHeader";
import { ChartDisplayArea } from "@/components/charts/components/chart-view/ChartDisplayArea";
import { ChartQuickConfig } from "@/components/charts/components/chart-quick-config/ChartQuickConfig";
import { SeriesList } from "@/components/charts/components/chart-view/SeriesList";
import { useChartData } from '../../hooks/useChartData';
import { AnnotationsList } from '../chart-annotations/AnnotationsList';
import { AnnotationPositionChange } from '../chart-renderer/components/interfaces';

export function ChartView() {
  const { chart, goToConfig, goToSeriesConfig, addSeries, updateAnnotation } = useChartStore();
  const { chartData, isLoadingData, dataError } = useChartData({ chart });

  if (!chart) {
    return <LoadingSpinner text="Loading chart configuration..." />;
  }

  const handleAnnotationPositionChange = (pos: AnnotationPositionChange) => {
    updateAnnotation(pos.annotationId, (prev) => ({ ...prev, ...pos.position }));
  };

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
              onAnnotationPositionChange={handleAnnotationPositionChange}
            />
          </div>
          <ChartFiltersOverview chart={chart} onFilterClick={goToSeriesConfig} />
        </div>

        <div className="lg:w-96 flex-shrink-0 space-y-6">
          <ChartQuickConfig
            chartData={chartData}
          />
          <SeriesList
          />
          <AnnotationsList
          />
        </div>
      </div>
    </div>
  );
}