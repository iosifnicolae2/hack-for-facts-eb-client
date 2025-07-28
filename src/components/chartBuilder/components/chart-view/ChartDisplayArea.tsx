import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Chart } from "@/schemas/charts";
import { getChartTypeIcon } from "../../utils";
import { ChartRenderer } from "../../components/chart-renderer/ChartRenderer";
import { AnalyticsDataPoint } from "@/lib/api/charts";

interface ChartDisplayAreaProps {
  chart: Chart;
  chartData: AnalyticsDataPoint[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onAddSeries: () => void;
}

export function ChartDisplayArea({ chart, chartData, isLoading, error, onAddSeries }: ChartDisplayAreaProps) {
  const renderContent = () => {
    if (chart.series.length === 0) {
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
    if (isLoading) {
      return <LoadingSpinner text="Loading chart data..." />;
    }
    if (error) {
      return (
        <div className="text-center text-destructive space-y-2">
          <AlertCircle className="h-8 w-8 mx-auto" />
          <p className="font-medium">Error Loading Chart Data</p>
          <p className="text-sm">{error.message}</p>
        </div>
      );
    }
    if (!chartData || chartData.length === 0) {
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
    return (
      <div className="w-full">
        <h2 className="text-center text-lg font-bold text-muted-foreground">{chart.title}</h2>
        <ChartRenderer chart={chart} data={chartData} />
        {chart.description && (
          <p className="px-4 text-center text-sm text-muted-foreground">{chart.description}</p>
        )}
      </div>
    );
  };

  return (
    <Card className="flex flex-col w-full h-full" id="chart-display-area">
      <CardContent className="p-4 flex-grow min-h-[500px] flex items-center justify-center bg-muted/20">
        {renderContent()}
      </CardContent>
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