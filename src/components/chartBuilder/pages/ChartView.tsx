import { Link } from "@tanstack/react-router";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Settings, BarChart3, LineChart, TrendingUp, ScatterChart, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { AnalyticsInput, Chart } from '@/schemas/chartBuilder';
import { getChartAnalytics } from '@/lib/api/chartBuilder';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useQuery } from '@tanstack/react-query';
import { ChartRenderer } from '@/components/chartBuilder/chart-renderer/ChartRenderer';
import { ChartQuickConfig } from '@/components/chartBuilder/ChartQuickConfig';
import { useChartBuilder } from "@/components/chartBuilder/hooks/useChartBuilder";


export function ChartView() {
  const { chart, updateChart, moveSeriesUp, moveSeriesDown, addSeries, goToConfig, goToSeriesConfig } = useChartBuilder();

  const handleToggleSeriesEnabled = async (seriesId: string, enabled: boolean) => {
    // TODO: fix this. Use updateSeries instead
    updateChart({
      series: chart.series.map(series => series.id === seriesId ? { ...series, enabled } : series),
    });
  };

  const handleSeriesClick = (seriesId: string) => {
    goToSeriesConfig(seriesId);
  };

  const handleMoveSeriesUp = async (seriesId: string) => {
    moveSeriesUp(seriesId);
  };

  const handleMoveSeriesDown = async (seriesId: string) => {
    moveSeriesDown(seriesId);
  };

  const handleUpdateChart = async (updates: Partial<Chart>) => {
    updateChart(updates);
  };

  // Filter analytics inputs to only include enabled series
  const analyticsInputs: AnalyticsInput[] = chart?.series
    .filter(series => series.enabled) // Only include enabled series
    .map(series => ({
      seriesId: series.id,
      filter: series.filter
    })) || [];

  // Fetch chart data
  const { data: chartData, isLoading: isLoadingData, error: dataError } = useQuery({
    queryKey: ['chartData', analyticsInputs], // TODO: fix this. improve cache based on filters
    queryFn: () => getChartAnalytics(analyticsInputs),
    enabled: chart !== null && analyticsInputs.length > 0,
  });

  const getChartTypeIcon = (chartType: string, className: string = "h-4 w-4") => {
    switch (chartType) {
      case 'line': return <LineChart className={className} />;
      case 'bar': return <BarChart3 className={className} />;
      case 'area': return <TrendingUp className={className} />;
      case 'scatter': return <ScatterChart className={className} />;
      default: return <BarChart3 className={className} />;
    }
  };


  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/charts">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Charts
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              {getChartTypeIcon(chart.config.chartType, "h-8 w-8")}
              <h1 className="text-3xl font-bold tracking-tight">
                {chart.title}
              </h1>
              <Badge variant="outline">
                {chart.config.chartType}
              </Badge>
            </div>
          </div>
        </div>

        <Button className="gap-2" onClick={() => goToConfig()}>
          <Settings className="h-4 w-4" />
          Configure
        </Button>
      </div>

      {/* Chart Display */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <div className="p-4 min-h-[500px] flex items-center justify-center bg-muted/20">
              {chart.series.length === 0 ? (
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                    {getChartTypeIcon(chart.config.chartType, "h-8 w-8")}
                  </div>
                  <div>
                    <p className="font-medium text-lg">No Data Series</p>
                    <p className="text-sm text-muted-foreground">
                      Add data series to see your chart visualization
                    </p>
                  </div>
                  <Button onClick={() => addSeries()}>Add Data Series</Button>
                </div>
              ) : isLoadingData ? (
                <LoadingSpinner text="Loading chart data..." />
              ) : dataError ? (
                <div className="text-center text-destructive space-y-2">
                  <AlertCircle className="h-8 w-8 mx-auto" />
                  <p className="font-medium">Error loading chart data</p>
                  <p className="text-sm">{dataError.message}</p>
                </div>
              ) : !chartData || chartData.length === 0 ? (
                <div className="text-center text-muted-foreground space-y-2">
                  <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                    {getChartTypeIcon(chart.config.chartType, "h-8 w-8")}
                  </div>
                  <p className="font-medium">No Data Available</p>
                  <p className="text-sm">Check your series filters and try again</p>
                </div>
              ) : (
                <div className="w-full text-center space-y-4">
                  <h2 className="text-lg font-medium">
                    {chart.title}
                  </h2>
                  <ChartRenderer
                    chart={chart}
                    data={chartData}
                    height={400}
                    className="w-full"
                  />
                  {chart.description && (
                    <p className="text-sm text-muted-foreground">
                      {chart.description}
                    </p>
                  )}
                </div>
              )}
            </div>
            <p className="flex items-center justify-between text-sm text-muted-foreground bg-muted/20 w-full p-4">
              <a href="https://transparenta.eu/" target="_blank">
                <span className="hidden">transparenta.eu</span>
              </a>
              <a href="https://mfinante.gov.ro/transparenta-bugetara" target="_blank">
                Sursă date: <span className="font-bold">Ministerul Finanțelor</span>
              </a>
            </p>
          </Card>
        </div>

        {/* Chart Information */}
        <div className="space-y-6">
          <ChartQuickConfig
            chart={chart}
            onUpdateChart={handleUpdateChart}
          />

          <Card>
            <CardHeader>
              <CardTitle>Data Series</CardTitle>
              <CardDescription>
                {chart.series.length} series configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chart.series.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    No data series configured yet
                  </p>
                  <Button size="sm" onClick={() => addSeries()}>Add Series</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {chart.series.map((series, index) => (
                    <div
                      key={series.id}
                      className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 transition-colors"
                    >
                      <div
                        className="flex items-center gap-2 text-sm flex-1 cursor-pointer"
                        onClick={() => handleSeriesClick(series.id)}
                      >
                        <div
                          className="w-3 h-3 rounded-full border flex-shrink-0"
                          style={{ backgroundColor: series.config.color || chart.config.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{series.label}</p>
                          <p className="text-xs text-muted-foreground">
                            Series {index + 1}
                            {!series.enabled && ' • Disabled'}
                            {series.enabled && Object.keys(series.filter).length === 0 && ' • No filters'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveSeriesUp(series.id);
                            }}
                            disabled={index === 0}
                            title="Move up"
                            className="h-8 w-8 p-1"
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveSeriesDown(series.id);
                            }}
                            disabled={index === chart.series.length - 1}
                            title="Move down"
                            className="h-8 w-8 p-1"
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </div>
                        <Label htmlFor={`series-${series.id}-enabled`} className="text-xs text-muted-foreground">
                          Enable
                        </Label>
                        <Switch
                          id={`series-${series.id}-enabled`}
                          checked={series.enabled}
                          onCheckedChange={(enabled) => handleToggleSeriesEnabled(series.id, enabled)}
                          onClick={(e) => e.stopPropagation()} // Prevent triggering series click
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
