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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FilterBulkEdit } from '../chart-config/FilterBulkEdit';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';

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


export function ChartQuickConfig({ dataMap }: ChartQuickConfigProps) {
  const [showMoreOptions, setShowMoreOptions] = usePersistedState('chart-quick-config-show-more-options', false);
  const [bulkEditOpen, setBulkEditOpen] = usePersistedState('chart-quick-config-bulk-edit-open', false);
  const { chart, updateChart, deleteChart, duplicateChart, goToConfig } = useChartStore();
  const { copyChart } = useCopyPasteChart(dataMap);


  const chartTypes = [
    { value: 'line', label: t`Line Chart`, icon: <LineChart className="h-4 w-4" /> },
    { value: 'bar', label: t`Bar Chart`, icon: <BarChart3 className="h-4 w-4" /> },
    { value: 'area', label: t`Area Chart`, icon: <TrendingUp className="h-4 w-4" /> },
    { value: 'bar-aggr', label: t`Bar Chart (Aggregated)`, icon: <BarChart3 className="h-4 w-4" /> },
    { value: 'pie-aggr', label: t`Pie Chart (Aggregated)`, icon: <PieChart className="h-4 w-4" /> },
    { value: 'treemap-aggr', label: t`Treemap Chart (Aggregated)`, icon: <TreesIcon className="h-4 w-4" /> },
    { value: 'sankey-aggr', label: t`Sankey Chart (Aggregated)`, icon: <ChartNetworkIcon className="h-4 w-4" /> },
  ];

  const getChartTypeLabel = (chartType: ChartType) => {
    return chartTypes.find(t => t.value === chartType)?.label || chartType;
  };

  return (
    <div className="space-y-4">
      <ShareChart
        chartId={chart.id}
        chartTitle={chart.title || t`Untitled Chart`}
        targetElementId="chart-display-area"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle><Trans>Quick Configuration</Trans></CardTitle>
              <CardDescription>
                <Trans>Quickly adjust chart settings</Trans>
              </CardDescription>
            </div>
            <ChartQuickConfigMenu
              onDelete={deleteChart}
              onOpenConfigPanel={goToConfig}
              onDuplicate={duplicateChart}
              onCopyData={copyChart}
              onOpenBulkEdit={() => setBulkEditOpen(true)}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Dialog open={bulkEditOpen} onOpenChange={setBulkEditOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle><Trans>Bulk edit filters</Trans></DialogTitle>
              </DialogHeader>
              <FilterBulkEdit withCard={false} />
            </DialogContent>
          </Dialog>
          {/* Chart Type */}
          <div className="space-y-2">
            <Label><Trans>Chart Type</Trans></Label>
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
            <Label><Trans>Display Options</Trans></Label>
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
                    <Trans>Data Labels</Trans>
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
                    <Trans>Legend</Trans>
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
                      <Trans>Relative Values</Trans>
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
                      <Trans>Tooltip</Trans>
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
                      <Trans>Show Annotations</Trans>
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
                      <Trans>Edit Annotations</Trans>
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
                      <Trans>Show Diff</Trans>
                    </Label>
                  </div>
                </CollapsibleContent>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="p-1 h-auto text-sm flex items-center gap-1 mx-auto w-full">
                  {showMoreOptions ? <Trans>Show Less</Trans> : <Trans>Show More</Trans>}
                  <ChevronDown className={`h-4 w-4 transition-transform ${showMoreOptions ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>

          {/* Chart Stats */}
          <div className="pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                {chart.series.filter(s => s.enabled).length} <Trans>Active Series</Trans>
              </Badge>
              {chart.config.showRelativeValues && (
                <Badge variant="secondary"><Trans>Relative Mode</Trans></Badge>
              )}
              {/* quick menu item opens modal above; button removed as requested */}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
