import { Link } from "@tanstack/react-router";
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, ArrowLeft, BarChart3, ChevronDown, ChevronUp, LineChart, Plus, ScatterChart, Settings, TrendingUp } from 'lucide-react';
import { AnalyticsInput, Chart, SeriesConfiguration } from '@/schemas/chartBuilder';
import { AnalyticsDataPoint, getChartAnalytics } from '@/lib/api/chartBuilder';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ChartRenderer } from '@/components/chartBuilder/chart-renderer/ChartRenderer';
import { ChartQuickConfig } from '@/components/chartBuilder/ChartQuickConfig';
import { useChartBuilder } from "@/components/chartBuilder/hooks/useChartBuilder";

// Helper to get the correct icon for a chart type.
const getChartTypeIcon = (chartType: string, className: string = "h-4 w-4") => {
  const icons = {
    line: <LineChart className={className} />,
    bar: <BarChart3 className={className} />,
    area: <TrendingUp className={className} />,
    scatter: <ScatterChart className={className} />,
  };
  return icons[chartType as keyof typeof icons] || <BarChart3 className={className} />;
};


/**
 * Represents a single item in the data series list.
 */
const SeriesListItem = ({ series, index, onToggle, onClick, onMoveUp, onMoveDown, isMoveUpDisabled, isMoveDownDisabled, chartColor }: {
  series: SeriesConfiguration;
  index: number;
  onToggle: (enabled: boolean) => void;
  onClick: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isMoveUpDisabled: boolean;
  isMoveDownDisabled: boolean;
  chartColor?: string;
}) => (
  <div className="flex items-center justify-between p-2.5 border rounded-lg hover:bg-muted/50 transition-colors">
    {/* By adding `min-w-0`, we allow this flex item to shrink, enabling the child `truncate` to work effectively. */}
    <div
      className="flex items-center gap-3 text-sm flex-1 cursor-pointer min-w-0"
      onClick={onClick}
    >
      <div
        className="w-3 h-3 rounded-full border flex-shrink-0"
        style={{ backgroundColor: series.config.color || chartColor }}
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate" title={series.label}>{series.label}</p>
        <p className="text-xs text-muted-foreground">Series {index + 1}</p>
      </div>
    </div>
    <div className="flex items-center gap-1 ml-2">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={onMoveUp} disabled={isMoveUpDisabled} aria-label="Move series up" className="h-7 w-7">
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onMoveDown} disabled={isMoveDownDisabled} aria-label="Move series down" className="h-7 w-7">
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      <Switch
        checked={series.enabled}
        onCheckedChange={onToggle}
        onClick={(e) => e.stopPropagation()} // Prevent card click
        aria-label={`Toggle series ${series.label}`}
      />
    </div>
  </div>
);

/**
 * Manages and displays the list of data series.
 */
const SeriesList = ({ chart, onAddSeries, onSeriesClick, onToggleSeries, onMoveSeriesUp, onMoveSeriesDown }: {
  chart: Chart;
  onAddSeries: () => void;
  onSeriesClick: (seriesId: string) => void;
  onToggleSeries: (seriesId: string, enabled: boolean) => void;
  onMoveSeriesUp: (seriesId: string) => void;
  onMoveSeriesDown: (seriesId: string) => void;
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <span>Data Series</span>
        <Button size="icon" onClick={onAddSeries} className="rounded-full w-7 h-7 cursor-pointer" aria-label="Add new series">
          <Plus className="h-4 w-4" />
        </Button>
      </CardTitle>
      <CardDescription>{chart.series.length} series configured</CardDescription>
    </CardHeader>
    <CardContent>
      {chart.series.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-3">No data series yet.</p>
          <Button size="sm" onClick={onAddSeries}>Add Series</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {chart.series.map((series, index) => (
            <SeriesListItem
              key={series.id}
              series={series}
              index={index}
              chartColor={chart.config.color}
              onClick={() => onSeriesClick(series.id)}
              onToggle={(enabled) => onToggleSeries(series.id, enabled)}
              onMoveUp={() => onMoveSeriesUp(series.id)}
              onMoveDown={() => onMoveSeriesDown(series.id)}
              isMoveUpDisabled={index === 0}
              isMoveDownDisabled={index === chart.series.length - 1}
            />
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);


/**
 * Renders the header section of the chart view.
 */
const ChartViewHeader = ({ chart, onConfigure }: { chart: Chart, onConfigure: () => void }) => {
  const chartTitle = chart.title || 'Untitled Chart';
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" className="gap-2">
          <Link to="/charts">
            <ArrowLeft className="h-4 w-4" />
            Back to Charts
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          {getChartTypeIcon(chart.config.chartType, "h-8 w-8 text-muted-foreground")}
          <h1 className="text-3xl font-bold tracking-tight">{chartTitle}</h1>
          <Badge variant="outline" className="capitalize">{chart.config.chartType}</Badge>
        </div>
      </div>
      <Button className="gap-2" onClick={onConfigure}>
        <Settings className="h-4 w-4" />
        Configure
      </Button>
    </div>
  );
};

/**
 * Renders the main chart visualization area with loading, error, and empty states.
 */
const ChartDisplayArea = ({ chart, chartData, isLoading, error, onAddSeries }: {
  chart: Chart;
  chartData: AnalyticsDataPoint[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onAddSeries: () => void;
}) => {
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
        <a href={window.location.href} target="_blank">
          <span className="font-bold">Transparenta.eu</span>
        </a>
        <a href="https://mfinante.gov.ro/transparenta-bugetara" target="_blank">
          Sursă date: <span className="font-bold">Ministerul Finanțelor</span>
        </a>
      </p>
    </Card>
  );
};


export function ChartView() {
  const { chart, updateChart, updateSeries, moveSeriesUp, moveSeriesDown, addSeries, goToConfig, goToSeriesConfig } = useChartBuilder();

  const handleToggleSeriesEnabled = useCallback(async (seriesId: string, enabled: boolean) => {
    // FIX: Using `updateSeries` is more specific and better for state management encapsulation.
    updateSeries(seriesId, { enabled });
  }, [updateSeries]);

  const handleUpdateChart = useCallback(async (updates: Partial<Chart>) => {
    updateChart(updates);
  }, [updateChart]);


  const analyticsInputs: AnalyticsInput[] = chart.series
    .filter(series => series.enabled)
    .map(series => ({ seriesId: series.id, filter: series.filter }));

  const { data: chartData, isLoading: isLoadingData, error: dataError } = useQuery({
    queryKey: ['chartData', analyticsInputs],
    queryFn: () => getChartAnalytics(analyticsInputs),
    enabled: !!chart && analyticsInputs.length > 0,
  });


  if (!chart) {
    return <LoadingSpinner text="Loading chart configuration..." />;
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 space-y-6">
      <ChartViewHeader chart={chart} onConfigure={goToConfig} />

      <div className="flex flex-col lg:flex-row gap-6">
        <ChartDisplayArea
          chart={chart}
          chartData={chartData}
          isLoading={isLoadingData}
          error={dataError}
          onAddSeries={addSeries}
        />

        <div className="space-y-6">
          <ChartQuickConfig chart={chart} onUpdateChart={handleUpdateChart} />
          <SeriesList
            chart={chart}
            onAddSeries={addSeries}
            onSeriesClick={goToSeriesConfig}
            onToggleSeries={handleToggleSeriesEnabled}
            onMoveSeriesUp={moveSeriesUp}
            onMoveSeriesDown={moveSeriesDown}
          />
        </div>
      </div>
    </div>
  );
}