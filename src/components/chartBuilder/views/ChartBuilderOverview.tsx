import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  Settings,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  BarChart3,
  LineChart,
  AreaChart
} from 'lucide-react';
import { Chart, SeriesConfiguration } from '@/schemas/chartBuilder';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ChartType } from '@/schemas/constants';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ChartBuilderOverviewProps {
  chart: Chart;
  onUpdateChart: (updates: Partial<Chart>) => void;
  onAddSeries: () => void;
  onEditSeries: (seriesId: string) => void;
  onDeleteSeries: (seriesId: string) => void;
  onDuplicateSeries: (seriesId: string) => void;
  onMoveSeriesUp: (seriesId: string) => void;
  onMoveSeriesDown: (seriesId: string) => void;
}

const CHART_TYPE_ICONS: Record<ChartType, React.ReactNode> = {
  line: <LineChart className="h-4 w-4" />,
  bar: <BarChart3 className="h-4 w-4" />,
  area: <AreaChart className="h-4 w-4" />,
};

const getChartTypeIcon = (chartType: ChartType) => {
  return CHART_TYPE_ICONS[chartType] || <BarChart3 className="h-4 w-4" />;
};

const SettingsCard = React.memo(({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        {icon}
        {title}
      </CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
));

const ChartTypeSelect = React.memo(({ value, onValueChange }: { value: ChartType, onValueChange: (value: ChartType) => void }) => (
  <Select value={value} onValueChange={onValueChange}>
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {Object.entries(CHART_TYPE_ICONS).map(([type, icon]) => (
        <SelectItem key={type} value={type}>
          <div className="flex items-center gap-2">
            {icon}
            {`${type.charAt(0).toUpperCase() + type.slice(1)} Chart`}
          </div>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
));

const ColorPicker = React.memo(({ value, onChange }: { value: string, onChange: (value: string) => void }) => (
  <div className="flex gap-2">
    <Input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-20 h-10 p-1 border rounded"
      aria-label="Color Picker"
    />
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="#0000ff"
      className="flex-1"
    />
  </div>
));

const ToggleSwitch = React.memo(({ id, label, checked, onCheckedChange }: { id: string, label: string, checked: boolean, onCheckedChange: (checked: boolean) => void }) => (
  <div className="flex items-center justify-between space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
  </div>
));


// ========== CHART INFORMATION COMPONENT ==========

const ChartInfoCard = React.memo(({ chart, onUpdateChart }: Pick<ChartBuilderOverviewProps, 'chart' | 'onUpdateChart'>) => (
  <SettingsCard
    icon={<Settings className="h-5 w-5" />}
    title="Chart Information"
    description="Set the basic properties for your chart"
  >
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="chart-title">Chart Title *</Label>
        <Input
          id="chart-title"
          value={chart.title}
          onChange={(e) => onUpdateChart({ title: e.target.value })}
          placeholder="Enter chart title..."
        />
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
    </div>
  </SettingsCard>
));

const GlobalSettingsCard = React.memo(({ chart, onUpdateChart }: Pick<ChartBuilderOverviewProps, 'chart' | 'onUpdateChart'>) => {
  const handleConfigChange = useCallback((updates: Partial<Chart['config']>) => {
    onUpdateChart({ config: { ...chart.config, ...updates } });
  }, [chart.config, onUpdateChart]);

  return (
    <SettingsCard
      icon={getChartTypeIcon(chart.config.chartType)}
      title="Global Chart Settings"
      description="Default settings that apply to all series (can be overridden per series)"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Chart Type</Label>
            <ChartTypeSelect
              value={chart.config.chartType}
              onValueChange={(value) => handleConfigChange({ chartType: value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="default-color">Default Color</Label>
            <ColorPicker
              value={chart.config.color}
              onChange={(value) => handleConfigChange({ color: value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <ToggleSwitch id="show-grid-lines" label="Show Grid Lines" checked={chart.config.showGridLines} onCheckedChange={(checked) => handleConfigChange({ showGridLines: checked })} />
          <ToggleSwitch id="show-legend" label="Show Legend" checked={chart.config.showLegend} onCheckedChange={(checked) => handleConfigChange({ showLegend: checked })} />
          <ToggleSwitch id="show-data-labels" label="Show Data Labels" checked={chart.config.showDataLabels} onCheckedChange={(checked) => handleConfigChange({ showDataLabels: checked })} />
          <ToggleSwitch id="show-relative-values" label="Show Relative Values (%)" checked={chart.config.showRelativeValues} onCheckedChange={(checked) => handleConfigChange({ showRelativeValues: checked })} />
        </div>
      </div>
    </SettingsCard>
  );
});

const DeleteSeriesDialog = React.memo(({ onDelete }: { onDelete: () => void }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm" title="Delete series">
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-56" align="end">
      <DropdownMenuLabel>Are you sure you want to delete this series?</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={onDelete}
        className="text-destructive focus:bg-destructive focus:text-white"
      >
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
));

const SeriesItem = React.memo(({
  series,
  isFirst,
  isLast,
  chartColor,
  onEdit,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onToggleEnabled,
}: {
  series: SeriesConfiguration;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  chartColor: string;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleEnabled: (enabled: boolean) => void;
}) => {
  const seriesColor = series.config.color || chartColor || '#0000ff';

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-4 h-4 rounded-full border flex-shrink-0" style={{ backgroundColor: seriesColor }} />
        <div className="flex-1 min-w-0">
          <div className="font-medium cursor-pointer truncate" onClick={onEdit} title={series.label}>{series.label}</div>
          <div className="text-sm text-muted-foreground">
            {series.config.chartType || 'Default'} chart
            {/* {series.filter.entity_cuis?.length > 0 && ` • ${series.filter.entity_cuis.length} entities`} */}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Switch
          id={`series-${series.id}-enabled`}
          checked={series.enabled}
          onCheckedChange={onToggleEnabled}
          aria-label={series.enabled ? 'Disable series' : 'Enable series'}
        />
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onMoveUp} disabled={isFirst} title="Move up"><ChevronUp className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={onMoveDown} disabled={isLast} title="Move down"><ChevronDown className="h-4 w-4" /></Button>
        </div>
        <Button variant="ghost" size="icon" onClick={onDuplicate} title="Duplicate series"><Copy className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={onEdit} title="Edit series"><Settings className="h-4 w-4" /></Button>
        <DeleteSeriesDialog onDelete={onDelete} />
      </div>
    </div>
  );
});

const SeriesList = React.memo(({ chart, onUpdateChart, ...props }: Pick<ChartBuilderOverviewProps, 'chart' | 'onUpdateChart' | 'onEditSeries' | 'onDeleteSeries' | 'onDuplicateSeries' | 'onMoveSeriesUp' | 'onMoveSeriesDown'>) => {
  const handleToggleSeriesEnabled = useCallback((seriesId: string, enabled: boolean) => {
    const updatedSeries = chart.series.map(s =>
      s.id === seriesId ? { ...s, enabled, updatedAt: new Date().toISOString() } : s
    );
    onUpdateChart({ series: updatedSeries });
  }, [chart.series, onUpdateChart]);

  if (chart.series.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">No series added yet</p>
        <p className="text-sm">Click "Add Series" to start building your chart</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {chart.series.map((series, index) => (
        <SeriesItem
          key={series.id}
          series={series}
          index={index}
          isFirst={index === 0}
          isLast={index === chart.series.length - 1}
          chartColor={chart.config.color}
          onEdit={() => props.onEditSeries(series.id)}
          onDelete={() => props.onDeleteSeries(series.id)}
          onDuplicate={() => props.onDuplicateSeries(series.id)}
          onMoveUp={() => props.onMoveSeriesUp(series.id)}
          onMoveDown={() => props.onMoveSeriesDown(series.id)}
          onToggleEnabled={(enabled) => handleToggleSeriesEnabled(series.id, enabled)}
        />
      ))}
    </div>
  );
});

const DataSeriesCard = React.memo((props: ChartBuilderOverviewProps) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle>Data Series</CardTitle>
          <CardDescription>Add and manage data series for your chart</CardDescription>
        </div>
        <Button onClick={props.onAddSeries} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Series
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <SeriesList {...props} />
    </CardContent>
  </Card>
));


export default function ChartBuilderOverview({
  chart,
  onUpdateChart,
  onAddSeries,
  onEditSeries,
  onDeleteSeries,
  onDuplicateSeries,
  onMoveSeriesUp,
  onMoveSeriesDown,
}: ChartBuilderOverviewProps) {

  return (
    <div className="space-y-6 p-1">
      <ChartInfoCard chart={chart} onUpdateChart={onUpdateChart} />
      <GlobalSettingsCard chart={chart} onUpdateChart={onUpdateChart} />
      {/* TODO: Add Year Range Selector Card here */}
      <DataSeriesCard
        chart={chart}
        onUpdateChart={onUpdateChart}
        onAddSeries={onAddSeries}
        onEditSeries={onEditSeries}
        onDeleteSeries={onDeleteSeries}
        onDuplicateSeries={onDuplicateSeries}
        onMoveSeriesUp={onMoveSeriesUp}
        onMoveSeriesDown={onMoveSeriesDown}
      />
    </div>
  );
}
