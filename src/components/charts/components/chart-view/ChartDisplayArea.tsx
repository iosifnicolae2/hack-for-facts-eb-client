import * as React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Chart } from "@/schemas/charts";
import { getChartTypeIcon } from "../../utils";
import { ChartRenderer } from "../chart-renderer/components/ChartRenderer";
import { AnnotationPositionChange } from "../chart-renderer/components/interfaces";
import { ChartTitle } from "../chart-renderer/components/ChartTitle";
import { getYearRangeText } from "../chart-renderer/utils";
import { DataPointPayload, DataSeriesMap, TimeSeriesDataPoint, UnitMap } from "../../hooks/useChartData";

// --- Type Definitions ---

interface ChartDisplayAreaProps {
  chart: Chart;
  timeSeriesData: TimeSeriesDataPoint[];
  aggregatedData: DataPointPayload[];
  dataMap?: DataSeriesMap;
  unitMap: UnitMap;
  isLoading: boolean;
  error: Error | null | undefined;
  onAddSeries: () => void;
  onAnnotationPositionChange: (pos: AnnotationPositionChange) => void;
  isPreview?: boolean;
}

/**
 * Renders a placeholder when no data series have been added to the chart.
 * Memoized to prevent re-renders if parent component updates but props remain the same.
 */
const NoDataSeries = React.memo(
  ({ onAddSeries, chart }: { onAddSeries: () => void; chart: Chart }) => (
    <div className="text-center space-y-4">
      <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
        {getChartTypeIcon(chart.config.chartType, "h-8 w-8 text-muted-foreground")}
      </div>
      <p className="font-medium text-lg">No Data Series</p>
      <p className="text-sm text-muted-foreground">Add a series to visualize your data.</p>
      <Button onClick={onAddSeries}>Add Data Series</Button>
    </div>
  )
);

/**
 * Renders an error message if chart data fails to load.
 * Memoized for performance.
 */
const ErrorDisplay = React.memo(({ error }: { error: Error }) => (
  <div className="text-center text-destructive space-y-2">
    <AlertCircle className="h-8 w-8 mx-auto" />
    <p className="font-medium">Error Loading Chart Data</p>
    <p className="text-sm">{error.message}</p>
  </div>
));

/**
 * Renders a message when filters result in no available data.
 * Memoized for performance.
 */
const NoDataAvailable = React.memo(({ chart }: { chart: Chart }) => (
  <div className="text-center text-muted-foreground space-y-2">
    <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
      {getChartTypeIcon(chart.config.chartType, "h-8 w-8")}
    </div>
    <p className="font-medium">No Data Available</p>
    <p className="text-sm">Check your series filters and try again.</p>
  </div>
));

/**
 * Renders the chart itself, including title and renderer.
 * Memoized to avoid re-rendering the potentially complex ChartRenderer.
 */
const ChartContent = React.memo(
  ({
    chart,
    timeSeriesData,
    aggregatedData,
    dataMap,
    unitMap,
    isPreview,
    onAnnotationPositionChange,
  }: Omit<ChartDisplayAreaProps, "isLoading" | "error" | "onAddSeries">) => {
    // useMemo ensures this string is only re-calculated when the chart object changes.
    const aggregatedSubtitle = React.useMemo(
      () =>
        chart.config.chartType.endsWith("-aggr")
          ? `Date consolidate ${getYearRangeText(chart)}`
          : undefined,
      [chart]
    );

    if (!dataMap) return <LoadingSpinner text="Loading chart data..." />;

    return (
      <div className="w-full">
        <ChartTitle title={chart.title} subtitle={aggregatedSubtitle} />
        <ChartRenderer
          isPreview={isPreview}
          chart={chart}
          timeSeriesData={timeSeriesData}
          aggregatedData={aggregatedData}
          dataMap={dataMap}
          unitMap={unitMap}
          onAnnotationPositionChange={onAnnotationPositionChange}
        />
        {!isPreview && chart.description && (
          <p className="px-4 text-center text-sm text-muted-foreground">{chart.description}</p>
        )}
      </div>
    );
  }
);

/**
 * A static footer component. Memoized as it never changes.
 * Note: `window.location.href` is dynamic but acceptable here as it's for generating a link.
 */
const ChartFooter = React.memo(() => (
  <p className="flex items-center justify-between text-sm text-muted-foreground bg-muted/20 w-full p-4">
    <a href={window.location.href} target="_blank" rel="noopener noreferrer">
      <span className="font-bold">Transparenta.eu</span>
    </a>
    <a href="https://mfinante.gov.ro/transparenta-bugetara" target="_blank" rel="noopener noreferrer">
      Sursă date: <span className="font-bold">Ministerul Finanțelor</span>
    </a>
  </p>
));

/**
 * Orchestrates the display of the chart area, handling all possible states:
 * no series, loading, error, no data, and success.
 */
export const ChartDisplayArea = React.memo(
  ({
    chart,
    timeSeriesData,
    aggregatedData,
    dataMap,
    unitMap,
    isLoading,
    error,
    onAddSeries,
    onAnnotationPositionChange,
    isPreview = false,
  }: ChartDisplayAreaProps) => {

    const ChartContentWrapper = React.memo(() => {
      if (chart.series.length === 0) return <NoDataSeries onAddSeries={onAddSeries} chart={chart} />;
      if (isLoading) return <LoadingSpinner text="Loading chart data..." />;
      if (error) return <ErrorDisplay error={error} />;
      if (!dataMap || dataMap.size === 0) return <NoDataAvailable chart={chart} />;

      return (
        <ChartContent
          chart={chart}
          timeSeriesData={timeSeriesData}
          aggregatedData={aggregatedData}
          dataMap={dataMap}
          unitMap={unitMap}
          isPreview={isPreview}
          onAnnotationPositionChange={onAnnotationPositionChange}
        />
      );
    });

    if (isPreview) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <ChartContentWrapper />
        </div>
      );
    }

    return (
      <Card className="flex flex-col w-full h-full" id="chart-display-area">
        <div className="p-4 flex-grow min-h-[500px] flex items-center justify-center bg-muted/20">
          <ChartContentWrapper />
        </div>
        <ChartFooter />
      </Card>
    );
  }
);