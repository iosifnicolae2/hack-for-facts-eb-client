import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, ChartNetworkIcon, ChevronDown, LineChart, PieChart, TreesIcon, TrendingUp } from 'lucide-react';
import { ChartType } from '@/schemas/constants';
import { ShareChart } from './components/ShareChart';
import { ChartQuickConfigMenu } from './components/ChartQuickConfigMenu';
import { useChartStore } from '../../hooks/useChartStore';
import { useCopyPasteChart } from '../../hooks/useCopyPaste';
import { DataSeriesMap } from '../../hooks/useChartData';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { usePersistedState } from '@/lib/hooks/usePersistedState';

interface ChartQuickConfigProps {
  dataMap?: DataSeriesMap;
}


const getChartTypeIcon = (chartType: ChartType) => {
  switch (chartType) {
    case 'line': return <LineChart className="h-4 w-4" />;
    case 'bar': return <BarChart3 className="h-4 w-4" />;
    case 'area': return <TrendingUp className="h-4 w-4" />;
    case 'pie-aggr': return <PieChart className="h-4 w-4" />;
    case 'treemap-aggr': return <TreesIcon className="h-4 w-4" />;
    case 'sankey-aggr': return <ChartNetworkIcon className="h-4 w-4" />;
    case 'bar-aggr': return <BarChart3 className="h-4 w-4" />;
    default: return <BarChart3 className="h-4 w-4" />;
  }
};

const chartTypes = [
  { value: 'line', label: 'Line Chart', icon: <LineChart className="h-4 w-4" /> },
  { value: 'bar', label: 'Bar Chart', icon: <BarChart3 className="h-4 w-4" /> },
  { value: 'area', label: 'Area Chart', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'bar-aggr', label: 'Bar Chart (Aggregated)', icon: <BarChart3 className="h-4 w-4" /> },
  { value: 'pie-aggr', label: 'Pie Chart (Aggregated)', icon: <PieChart className="h-4 w-4" /> },
  { value: 'treemap-aggr', label: 'Treemap Chart (Aggregated)', icon: <TreesIcon className="h-4 w-4" /> },
  { value: 'sankey-aggr', label: 'Sankey Chart (Aggregated)', icon: <ChartNetworkIcon className="h-4 w-4" /> },
];

const getChartTypeLabel = (chartType: ChartType) => {
  return chartTypes.find(t => t.value === chartType)?.label || chartType;
};

export function ChartQuickConfig({ dataMap }: ChartQuickConfigProps) {
  const [showMoreOptions, setShowMoreOptions] = usePersistedState('chart-quick-config-show-more-options', false);
  const { chart, updateChart, deleteChart, duplicateChart, goToConfig } = useChartStore();
  const { copyChart } = useCopyPasteChart(dataMap);


  return (
    <div className="space-y-4">
      <ShareChart
        chartId={chart.id}
        chartTitle={chart.title || 'Untitled Chart'}
        targetElementId="chart-display-area"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quick Configuration</CardTitle>
              <CardDescription>
                Quickly adjust chart settings
              </CardDescription>
            </div>
            <ChartQuickConfigMenu
              onDelete={deleteChart}
              onOpenConfigPanel={goToConfig}
              onDuplicate={duplicateChart}
              onCopyData={copyChart}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Chart Type */}
          <div className="space-y-2">
            <Label>Chart Type</Label>
            <Select
              value={chart.config.chartType}
              onValueChange={(value: ChartType) =>
                updateChart({
                  config: { ...chart.config, chartType: value }
                })
              }
            >
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {getChartTypeIcon(chart.config.chartType)}
                    <span className="capitalize">{getChartTypeLabel(chart.config.chartType)}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {chartTypes.map(({ value, label, icon }) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      {icon}
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Display Options */}
          <div className="space-y-2">
            <Label>Display Options</Label>
            <Collapsible open={showMoreOptions} onOpenChange={setShowMoreOptions} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-data-labels"
                    checked={chart.config.showDataLabels}
                    onCheckedChange={(checked) =>
                      updateChart({
                        config: { ...chart.config, showDataLabels: checked },
                      })
                    }
                  />
                  <Label htmlFor="show-data-labels" className="text-sm">
                    Data Labels
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-legend"
                    checked={chart.config.showLegend}
                    onCheckedChange={(checked) =>
                      updateChart({
                        config: { ...chart.config, showLegend: checked },
                      })
                    }
                  />
                  <Label htmlFor="show-legend" className="text-sm">
                    Legend
                  </Label>
                </div>
                <CollapsibleContent className="contents">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-relative-values"
                      checked={chart.config.showRelativeValues}
                      onCheckedChange={(checked) =>
                        updateChart({
                          config: { ...chart.config, showRelativeValues: checked },
                        })
                      }
                    />
                    <Label htmlFor="show-relative-values" className="text-sm">
                      Relative Values
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-tooltip"
                      checked={chart.config.showTooltip}
                      onCheckedChange={(checked) =>
                        updateChart({ config: { ...chart.config, showTooltip: checked } })
                      }
                    />
                    <Label htmlFor="show-tooltip" className="text-sm">
                      Tooltip
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-annotations"
                      checked={chart.config.showAnnotations}
                      onCheckedChange={(checked) =>
                        updateChart({ config: { ...chart.config, showAnnotations: checked } })
                      }
                    />
                    <Label htmlFor="show-annotations" className="text-sm">
                      Show Annotations
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-annotations"
                      checked={chart.config.editAnnotations}
                      onCheckedChange={(checked) =>
                        updateChart({ config: { ...chart.config, editAnnotations: checked } })
                      }
                    />
                    <Label htmlFor="edit-annotations" className="text-sm">
                      Edit Annotations
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable-diff-control"
                      checked={chart.config.showDiffControl}
                      onCheckedChange={(checked) =>
                        updateChart({ config: { ...chart.config, showDiffControl: checked } })
                      }
                    />
                    <Label htmlFor="enable-diff-control" className="text-sm">
                      Show Diff
                    </Label>
                  </div>
                </CollapsibleContent>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="p-1 h-auto text-sm flex items-center gap-1 mx-auto w-full">
                  {showMoreOptions ? 'Show Less' : 'Show More'}
                  <ChevronDown className={`h-4 w-4 transition-transform ${showMoreOptions ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>

          {/* Chart Stats */}
          <div className="pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                {chart.series.filter(s => s.enabled).length} Active Series
              </Badge>
              {chart.config.showRelativeValues && (
                <Badge variant="secondary">Relative Mode</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
