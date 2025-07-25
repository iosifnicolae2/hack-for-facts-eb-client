import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Settings, BarChart3, LineChart, TrendingUp, ScatterChart, Loader2, AlertCircle } from 'lucide-react';
import { Chart, AnalyticsInput } from '@/schemas/chartBuilder';
import { useQuery } from '@tanstack/react-query';
import { getChartAnalytics } from '@/lib/api/chartBuilder';
import { Badge } from '@/components/ui/badge';
import { ChartRenderer } from '../ChartRenderer';

interface ChartPreviewProps {
  chart: Chart;
  onBack: () => void;
  onEdit: () => void;
}

export function ChartPreview({ chart, onBack, onEdit }: ChartPreviewProps) {
  // Prepare analytics inputs for data fetching
  const analyticsInputs: AnalyticsInput[] = chart.series
    .filter(series => Object.keys(series.filter).length > 0) // Only include series with filters
    .map(series => ({
      label: series.label,
      filter: series.filter
    }));

  // Fetch chart data
  const { data: chartData, isLoading, error, refetch } = useQuery({
    queryKey: ['chartPreview', chart.id, analyticsInputs],
    queryFn: () => getChartAnalytics(analyticsInputs),
    enabled: analyticsInputs.length > 0,
    retry: 2,
  });

  const getChartTypeIcon = (chartType: string, className: string = "h-6 w-6") => {
    switch (chartType) {
      case 'line': return <LineChart className={className} />;
      case 'bar': return <BarChart3 className={className} />;
      case 'area': return <TrendingUp className={className} />;
      case 'scatter': return <ScatterChart className={className} />;
      default: return <BarChart3 className={className} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getChartTypeIcon(chart.config.chartType)}
          <div>
            <h2 className="text-2xl font-bold">{chart.title || 'Untitled Chart'}</h2>
            {chart.description && (
              <p className="text-muted-foreground">{chart.description}</p>
            )}
          </div>
          <Badge variant="outline">
            {chart.config.chartType}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button onClick={onBack} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button onClick={onEdit} className="gap-2">
            <Settings className="h-4 w-4" />
            Edit Configuration
          </Button>
        </div>
      </div>

      {/* Chart Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Chart Preview</CardTitle>
          <CardDescription>
            {chart.series.length === 0 
              ? 'No data series configured' 
              : analyticsInputs.length === 0
                ? `${chart.series.length} series configured, but no filters set`
                : `${analyticsInputs.length} of ${chart.series.length} series ready for display`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-8 min-h-[400px] flex items-center justify-center bg-muted/20">
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
                <Button onClick={onEdit}>Add Data Series</Button>
              </div>
            ) : analyticsInputs.length === 0 ? (
              <div className="text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-lg">Series Need Filters</p>
                  <p className="text-sm text-muted-foreground">
                    Configure filters for your data series to see the chart visualization
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {chart.series.map((series, idx) => (
                      <div key={series.id} className="mb-1">
                        Series {idx + 1}: "{series.label}" - {Object.keys(series.filter).length > 0 ? 'Has filters' : 'No filters'}
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={onEdit}>Configure Filters</Button>
              </div>
            ) : isLoading ? (
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                <div>
                  <p className="font-medium">Loading Chart Data...</p>
                  <p className="text-sm text-muted-foreground">
                    Fetching data for {analyticsInputs.length} series
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-lg">Error Loading Data</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    {error.message || 'Failed to fetch chart data'}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => refetch()} variant="outline" size="sm">
                      Retry
                    </Button>
                    <Button onClick={onEdit} size="sm">
                      Edit Configuration
                    </Button>
                  </div>
                </div>
              </div>
            ) : !chartData || chartData.length === 0 ? (
              <div className="text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-yellow-100 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-lg">No Data Found</p>
                  <p className="text-sm text-muted-foreground">
                    Your filters returned no results. Try adjusting your series filters.
                  </p>
                </div>
                <Button onClick={onEdit} variant="outline">Adjust Filters</Button>
              </div>
            ) : (
              <div className="w-full text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                  {getChartTypeIcon(chart.config.chartType, "h-8 w-8 text-green-600")}
                </div>
                <div>
                  <p className="font-medium text-lg">Chart Ready</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Chart visualization component would render here
                  </p>
                                     <ChartRenderer 
                     chart={chart} 
                     data={chartData} 
                     height={400}
                     className="w-full"
                   />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Series Configuration Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Series Summary</CardTitle>
            <CardDescription>
              Overview of configured data series
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chart.series.length === 0 ? (
              <p className="text-sm text-muted-foreground">No series configured</p>
            ) : (
              <div className="space-y-3">
                {chart.series.map((series) => (
                  <div key={series.id} className="flex items-center gap-3 p-2 border rounded">
                    <div
                      className="w-3 h-3 rounded-full border flex-shrink-0"
                      style={{ backgroundColor: series.config.color || chart.config.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{series.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {Object.keys(series.filter).length > 0 
                          ? `${Object.keys(series.filter).length} filters applied`
                          : 'No filters configured'
                        }
                      </p>
                    </div>
                    <Badge 
                      variant={Object.keys(series.filter).length > 0 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {Object.keys(series.filter).length > 0 ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Chart Configuration</CardTitle>
            <CardDescription>
              Current chart settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="capitalize">{chart.config.chartType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Default Color:</span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: chart.config.color }}
                />
                <span className="text-xs">{chart.config.color}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Series:</span>
              <span>{chart.series.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data Ready:</span>
              <span>{analyticsInputs.length > 0 && chartData && chartData.length > 0 ? 'Yes' : 'No'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 