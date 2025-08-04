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

interface ChartDisplayAreaProps {
  chart: Chart;
  timeSeriesData: TimeSeriesDataPoint[];
  aggregatedData: DataPointPayload[];
  dataMap: DataSeriesMap;
  unitMap: UnitMap;
  isPreview?: boolean;
  isLoading: boolean;
  error: Error | null | undefined;
  onAddSeries: () => void;
  onAnnotationPositionChange: (pos: AnnotationPositionChange) => void;
}

function NoDataSeries({ onAddSeries, chart }: { onAddSeries: () => void; chart: Chart }) {
  return (
    <div className="text-center space-y-4">
      <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
        {getChartTypeIcon(chart.config.chartType, "h-8 w-8 text-muted-foreground")}
      </div>
      <p className="font-medium text-lg">No Data Series</p>
      <p className="text-sm text-muted-foreground">Add a series to visualize your data.</p>
      <Button onClick={onAddSeries}>Add Data Series</Button>
    </div>
  );
}

function ErrorDisplay({ error }: { error: Error }) {
  return (
    <div className="text-center text-destructive space-y-2">
      <AlertCircle className="h-8 w-8 mx-auto" />
      <p className="font-medium">Error Loading Chart Data</p>
      <p className="text-sm">{error.message}</p>
    </div>
  );
}

function NoDataAvailable({ chart }: { chart: Chart }) {
  return (
    <div className="text-center text-muted-foreground space-y-2">
      <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
        {getChartTypeIcon(chart.config.chartType, "h-8 w-8")}
      </div>
      <p className="font-medium">No Data Available</p>
      <p className="text-sm">Check your series filters and try again.</p>
    </div>
  );
}

function ChartContent({ chart, timeSeriesData, aggregatedData, dataMap, unitMap, isPreview, onAnnotationPositionChange }: { chart: Chart; timeSeriesData: TimeSeriesDataPoint[]; aggregatedData: DataPointPayload[]; dataMap: DataSeriesMap; unitMap: UnitMap; isPreview: boolean, onAnnotationPositionChange: (pos: AnnotationPositionChange) => void }) {
  const aggregatedSubtitle = chart.config.chartType.endsWith('-aggr') ? `Date consolidate ${getYearRangeText(chart)}` : undefined;
  return (
    <div className="w-full">
      <ChartTitle title={chart.title} subtitle={aggregatedSubtitle} />
      <ChartRenderer chart={chart} timeSeriesData={timeSeriesData} aggregatedData={aggregatedData} dataMap={dataMap} unitMap={unitMap} onAnnotationPositionChange={onAnnotationPositionChange} />
      {!isPreview && chart.description && (
        <p className="px-4 text-center text-sm text-muted-foreground">{chart.description}</p>
      )}
    </div>
  );
}

export function ChartDisplayArea({ chart, timeSeriesData, aggregatedData, dataMap, unitMap, isLoading, error, onAddSeries, isPreview = false, onAnnotationPositionChange }: ChartDisplayAreaProps) {
  const renderContent = () => {
    if (chart.series.length === 0) return <NoDataSeries onAddSeries={onAddSeries} chart={chart} />;
    if (isLoading) return <LoadingSpinner text="Loading chart data..." />;
    if (error) return <ErrorDisplay error={error} />;
    if (!dataMap || dataMap.size === 0) return <NoDataAvailable chart={chart} />;
    return <ChartContent chart={chart} timeSeriesData={timeSeriesData} aggregatedData={aggregatedData} dataMap={dataMap} unitMap={unitMap} isPreview={isPreview} onAnnotationPositionChange={onAnnotationPositionChange} />;
  };

  const content = <div className="p-4 flex-grow min-h-[500px] flex items-center justify-center bg-muted/20">{renderContent()}</div>;

  if (isPreview) {
    return <div className="w-full h-full flex items-center justify-center">{renderContent()}</div>;
  }

  return (
    <Card className="flex flex-col w-full h-full" id="chart-display-area">
      {content}
      <p className="flex items-center justify-between text-sm text-muted-foreground bg-muted/20 w-full p-4">
        <a href={window.location.href} target="_blank" rel="noopener noreferrer">
          <span className="font-bold">Transparenta.eu</span>
        </a>
        <a href="https://mfinante.gov.ro/transparenta-bugetara" target="_blank" rel="noopener noreferrer">
          Sursă date: <span className="font-bold">Ministerul Finanțelor</span>
        </a>
      </p>
    </Card>
  );
}; 