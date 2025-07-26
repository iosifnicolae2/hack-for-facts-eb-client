import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Chart } from '@/schemas/chartBuilder';
import { BarChart3, LineChart, TrendingUp, ScatterChart, PieChart } from 'lucide-react';
import { ChartType } from '@/schemas/constants';

interface ChartQuickConfigProps {
  chart: Chart;
  onUpdateChart: (updates: Partial<Chart>) => void;
}

export function ChartQuickConfig({ chart, onUpdateChart }: ChartQuickConfigProps) {
  const getChartTypeIcon = (chartType: ChartType) => {
    switch (chartType) {
      case 'line': return <LineChart className="h-4 w-4" />;
      case 'bar': return <BarChart3 className="h-4 w-4" />;
      case 'area': return <TrendingUp className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Configuration</CardTitle>
        <CardDescription>
          Quickly adjust chart settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart Type */}
        <div className="space-y-2">
          <Label>Chart Type</Label>
          <Select
            value={chart.config.chartType}
            onValueChange={(value: ChartType) =>
              onUpdateChart({
                config: { ...chart.config, chartType: value }
              })
            }
          >
            <SelectTrigger>
              <SelectValue>
                <div className="flex items-center gap-2">
                  {getChartTypeIcon(chart.config.chartType)}
                  <span className="capitalize">{chart.config.chartType}</span>
                </div>
              </SelectValue>
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
                  <TrendingUp className="h-4 w-4" />
                  Area Chart
                </div>
              </SelectItem>
              <SelectItem value="scatter">
                <div className="flex items-center gap-2">
                  <ScatterChart className="h-4 w-4" />
                  Scatter Plot
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

        {/* Display Options */}
        <div className="space-y-4">
          <Label>Display Options</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-relative-values"
                checked={chart.config.showRelativeValues}
                onCheckedChange={(checked) =>
                  onUpdateChart({
                    config: { ...chart.config, showRelativeValues: checked }
                  })
                }
              />
              <Label htmlFor="show-relative-values" className="text-sm">
                Relative Values
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-data-labels"
                checked={chart.config.showDataLabels}
                onCheckedChange={(checked) =>
                  onUpdateChart({
                    config: { ...chart.config, showDataLabels: checked }
                  })
                }
              />
              <Label htmlFor="show-data-labels" className="text-sm">
                Data Labels
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-grid-lines"
                checked={chart.config.showGridLines}
                onCheckedChange={(checked) =>
                  onUpdateChart({
                    config: { ...chart.config, showGridLines: checked }
                  })
                }
              />
              <Label htmlFor="show-grid-lines" className="text-sm">
                Grid Lines
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-legend"
                checked={chart.config.showLegend}
                onCheckedChange={(checked) =>
                  onUpdateChart({
                    config: { ...chart.config, showLegend: checked }
                  })
                }
              />
              <Label htmlFor="show-legend" className="text-sm">
                Legend
              </Label>
            </div>
          </div>
        </div>

        {/* Chart Stats */}
        <div className="pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {chart.series.filter(s => s.enabled).length} Active Series
            </Badge>
            {/* TODO: add year range selector */}
            {/* {chart.config.yearRangeStart && chart.config.yearRangeEnd && (
              <Badge variant="outline">
                {chart.config.yearRangeStart}-{chart.config.yearRangeEnd}
              </Badge>
            )} */}
            {chart.config.showRelativeValues && (
              <Badge variant="secondary">Relative Mode</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 