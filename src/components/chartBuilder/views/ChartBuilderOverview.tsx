import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Plus, 
  Settings, 
  Trash2, 
  Copy,
  ChevronUp,
  ChevronDown,
  BarChart3, 
  LineChart, 
  PieChart, 
  AreaChart 
} from 'lucide-react';
import { Chart, SeriesConfiguration, ChartType } from '@/schemas/chartBuilder';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { useMemo } from 'react';

interface ChartBuilderOverviewProps {
  chart: Chart;
  onUpdateChart: (updates: Partial<Chart>) => void;
  onAddSeries: () => void;
  onEditSeries: (seriesId: string) => void;
  onDeleteSeries: (seriesId: string) => void;
  onDuplicateSeries: (seriesId: string) => void;
  onMoveSeriesUp: (seriesId: string) => void;
  onMoveSeriesDown: (seriesId: string) => void;
  validationErrors: Record<string, string[]>;
}

export function ChartBuilderOverview({
  chart,
  onUpdateChart,
  onAddSeries,
  onEditSeries,
  onDeleteSeries,
  onDuplicateSeries,
  onMoveSeriesUp,
  onMoveSeriesDown,
  validationErrors
}: ChartBuilderOverviewProps) {
  
  const getChartTypeIcon = (chartType: string) => {
    switch (chartType) {
      case 'line': return <LineChart className="h-4 w-4" />;
      case 'bar': return <BarChart3 className="h-4 w-4" />;
      case 'pie': return <PieChart className="h-4 w-4" />;
      case 'area': return <AreaChart className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getSeriesColor = (series: SeriesConfiguration) => {
    return series.config.color || chart.config.color || '#8884d8';
  };

  const hasErrors = (field: string) => {
    return validationErrors[field] && validationErrors[field].length > 0;
  };

  const getErrorMessage = (field: string) => {
    return hasErrors(field) ? validationErrors[field][0] : '';
  };

  const handleToggleSeriesEnabled = (seriesId: string, enabled: boolean) => {
    const updatedSeries = chart.series.map(series =>
      series.id === seriesId
        ? { ...series, enabled, updatedAt: new Date() }
        : series
    );
    onUpdateChart({ series: updatedSeries });
  };

  // Calculate available year range from all series data
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    chart.series.forEach(series => {
      if (series.filter.years) {
        series.filter.years.forEach(year => years.add(year));
      }
    });
    const sortedYears = Array.from(years).sort();
    return {
      min: sortedYears[0] || 2010,
      max: sortedYears[sortedYears.length - 1] || new Date().getFullYear(),
      available: sortedYears
    };
  }, [chart.series]);

  const currentYearRange = [
    chart.config.yearRangeStart || availableYears.min,
    chart.config.yearRangeEnd || availableYears.max
  ];

  return (
    <div className="space-y-6 p-1">
      {/* Chart Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Chart Information
          </CardTitle>
          <CardDescription>
            Set the basic properties for your chart
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chart-title">Chart Title *</Label>
            <Input
              id="chart-title"
              value={chart.title}
              onChange={(e) => onUpdateChart({ title: e.target.value })}
              placeholder="Enter chart title..."
              className={hasErrors('title') ? 'border-destructive' : ''}
            />
            {hasErrors('title') && (
              <p className="text-sm text-destructive">{getErrorMessage('title')}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="chart-description">Description</Label>
            <Textarea
              id="chart-description"
              value={chart.description || ''}
              onChange={(e) => onUpdateChart({ description: e.target.value })}
              placeholder="Optional description for your chart..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Global Chart Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getChartTypeIcon(chart.config.chartType)}
            Global Chart Settings
          </CardTitle>
          <CardDescription>
            Default settings that apply to all series (can be overridden per series)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Chart Type</Label>
              <Select
                value={chart.config.chartType}
                                 onValueChange={(value) => 
                   onUpdateChart({ 
                     config: { ...chart.config, chartType: value as ChartType } 
                   })
                 }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">
                    <div className="flex items-center gap-2">
                      <LineChart className="h-4 w-4" />
                      Line Chart
                    </div>
                  </SelectItem>
                  <SelectItem value="bar">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Bar Chart
                    </div>
                  </SelectItem>
                  <SelectItem value="area">
                    <div className="flex items-center gap-2">
                      <AreaChart className="h-4 w-4" />
                      Area Chart
                    </div>
                  </SelectItem>
                  <SelectItem value="pie">
                    <div className="flex items-center gap-2">
                      <PieChart className="h-4 w-4" />
                      Pie Chart
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-color">Default Color</Label>
              <div className="flex gap-2">
                <Input
                  id="default-color"
                  type="color"
                  value={chart.config.color}
                  onChange={(e) => 
                    onUpdateChart({ 
                      config: { ...chart.config, color: e.target.value } 
                    })
                  }
                  className="w-20 h-10 p-1 border rounded"
                />
                <Input
                  value={chart.config.color}
                  onChange={(e) => 
                    onUpdateChart({ 
                      config: { ...chart.config, color: e.target.value } 
                    })
                  }
                  placeholder="#8884d8"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="show-grid-lines">
                Show Grid Lines
              </Label>
              <Switch
                id="show-grid-lines"
                checked={chart.config.showGridLines}
                onCheckedChange={(checked) => 
                  onUpdateChart({ 
                    config: { ...chart.config, showGridLines: checked } 
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="show-legend">
                Show Legend
              </Label>
              <Switch
                id="show-legend"
                checked={chart.config.showLegend}
                onCheckedChange={(checked) => 
                  onUpdateChart({ 
                    config: { ...chart.config, showLegend: checked } 
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="show-data-labels">
                Show Data Labels
              </Label>
              <Switch
                id="show-data-labels"
                checked={chart.config.showDataLabels}
                onCheckedChange={(checked) => 
                  onUpdateChart({ 
                    config: { ...chart.config, showDataLabels: checked } 
                  })
                }
              />
            </div>
            <div className="space-y-2">  
              <Label htmlFor="show-relative-values">
                Show Relative Values (%)
              </Label>
              <Switch
                id="show-relative-values"
                checked={chart.config.showRelativeValues}
                onCheckedChange={(checked) => 
                  onUpdateChart({ 
                    config: { ...chart.config, showRelativeValues: checked } 
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Year Range Selector */}
      {availableYears.available.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Data Range</CardTitle>
            <CardDescription>
              Select the year range to display in your chart
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>From: {currentYearRange[0]}</span>
                <span>To: {currentYearRange[1]}</span>
              </div>
              <Slider
                value={currentYearRange}
                onValueChange={(value) => {
                  onUpdateChart({
                    config: {
                      ...chart.config,
                      yearRangeStart: value[0],
                      yearRangeEnd: value[1]
                    }
                  });
                }}
                min={availableYears.min}
                max={availableYears.max}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{availableYears.min}</span>
                <span>{availableYears.max}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Series */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Data Series</CardTitle>
              <CardDescription>
                Add and manage data series for your chart
              </CardDescription>
            </div>
            <Button onClick={onAddSeries} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Series
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {chart.series.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No series added yet</p>
              <p className="text-sm">Click "Add Series" to start building your chart</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chart.series.map((series, index) => (
                <div
                  key={series.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: getSeriesColor(series) }}
                    />
                    <div>
                      <div className="font-medium">{series.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {series.config.chartType || chart.config.chartType} chart
                        {series.filter.entity_cuis?.length && ` • ${series.filter.entity_cuis.length} entities`}
                        {series.filter.years?.length && ` • ${series.filter.years.length} years`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`series-${series.id}-enabled`} className="text-xs text-muted-foreground">
                        Enabled
                      </Label>
                      <Switch
                        id={`series-${series.id}-enabled`}
                        checked={series.enabled}
                        onCheckedChange={(enabled) => handleToggleSeriesEnabled(series.id, enabled)}
                      />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Series {index + 1}
                    </Badge>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMoveSeriesUp(series.id)}
                        disabled={index === 0}
                        title="Move up"
                        className="h-8 w-8 p-1"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMoveSeriesDown(series.id)}
                        disabled={index === chart.series.length - 1}
                        title="Move down"
                        className="h-8 w-8 p-1"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDuplicateSeries(series.id)}
                      title="Duplicate series"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditSeries(series.id)}
                      title="Edit series"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" title="Delete series">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Series</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{series.label}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteSeries(series.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Button */}
      {chart.series.length > 0 && (
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">
            Changes are automatically saved. View your chart on the main chart page.
          </p>
        </div>
      )}
    </div>
  );
} 