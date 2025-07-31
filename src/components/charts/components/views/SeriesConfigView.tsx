import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Settings, Eye, RotateCcw } from 'lucide-react';
import { SeriesConfiguration } from '@/schemas/charts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { SeriesFilter } from '../series-config/SeriesFilter';
import { useChartStore } from '../../hooks/useChartStore';
import { generateRandomColor } from '../chart-renderer/utils';
import { Slider } from '@/components/ui/slider';
import { DataLabelSelector } from '../series-config/DataLabelSelector';


export function SeriesConfigView() {
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const { chart, seriesId, updateSeries, deleteSeries, goToOverview, goToConfig } = useChartStore();
  const series = chart.series.find(s => s.id === seriesId);
  const seriesLabel = series?.label || '';
  const [localLabel, setLocalLabel] = useState(seriesLabel);


  useEffect(() => {
    setLocalLabel(seriesLabel);
  }, [seriesLabel]);

  const updateSeriesField = (field: keyof SeriesConfiguration, value: string | object) => {
    if (!series) return;
    updateSeries(series.id, (prev) => ({ ...prev, [field]: value, updatedAt: new Date().toISOString() }));
  };

  const updateSeriesConfig = (config: Partial<SeriesConfiguration['config']>) => {
    if (!series) return;
    updateSeries(series.id, (prev) => ({
      ...prev,
      config: { ...prev.config, ...config },
      updatedAt: new Date().toISOString(),
    }));
  };

  if (!series) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Series not found</p>
          <Button onClick={goToConfig} className="mt-4">
            Back to Configuration
          </Button>
        </div>
      </div>
    );
  }

  const handleDeleteSeries = () => {
    goToOverview();
    deleteSeries(series?.id || '');
  };

  return (
    <div className="flex flex-col space-y-6 p-2 w-full overflow-x-hidden">

      {/* Series Basic Info */}
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Series Configuration
        </h1>
        <Button onClick={goToOverview} className="gap-2">
          <Eye className="h-4 w-4" />
          View Chart
        </Button>
      </header>
      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-2 pt-4">
            <Label htmlFor="series-label">Series Label *</Label>
            <Input
              id="series-label"
              value={localLabel}
              onChange={(e) => {
                setLocalLabel(e.target.value);
                updateSeriesField('label', e.target.value);
              }}
              placeholder="Enter series label..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="series-color">Series Color</Label>
            <div className="flex items-center gap-2">
              <input
                id="series-color"
                type="color"
                value={series?.config.color || chart.config.color}
                onChange={(e) => updateSeriesConfig({ color: e.target.value })}
                className="w-12 h-8 rounded border cursor-pointer"
              />
              <Button variant="outline" size="sm" onClick={() => updateSeriesConfig({ color: generateRandomColor() })}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {series?.config.color || chart.config.color}
              </span>
            </div>
          </div>
          <Button
            variant="link"
            className="p-0 h-auto text-sm font-normal text-muted-foreground"
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          >
            {showAdvancedSettings ? 'Hide advanced settings' : 'Show advanced settings'}
          </Button>

          {showAdvancedSettings && (
            <>
              <div className="flex items-center justify-between pt-4">
                <Label htmlFor="series-show-data-labels" className="flex flex-col space-y-1">
                  <span>Show Data Labels</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Display data labels on the chart
                  </span>
                </Label>
                <Switch
                  id="series-show-data-labels"
                  checked={series?.config.showDataLabels ?? false}
                  onCheckedChange={(checked) => updateSeriesConfig({ showDataLabels: checked })}
                />
              </div>
              {series?.config.showDataLabels && (
                <DataLabelSelector
                  selectedLabels={series.config.dataLabels || []}
                  onChange={(labels) => updateSeriesConfig({ dataLabels: labels })}
                />
              )}
              <div className="space-y-3 pt-4">
                <Label htmlFor="data-label-offset">Data Label Offset</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="data-label-offset"
                    min={-100}
                    max={100}
                    step={1}
                    value={[series.config.dataLabelOffset || 0]}
                    onValueChange={(value) => updateSeriesConfig({ dataLabelOffset: value[0] })}
                    className="w-full"
                  />
                  <span className="text-sm font-medium text-muted-foreground w-16 text-right">
                    {series.config.dataLabelOffset || 0}px
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ================= Series Filter ================= */}
      <SeriesFilter seriesId={seriesId} />

      {/* ================= Series Delete ================= */}
      <footer className="flex justify-between pt-4">
        <Button onClick={goToConfig} variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Chart Configuration
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="destructive"
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Series
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Are you sure you want to delete this series?</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDeleteSeries}
              className="text-destructive focus:bg-destructive focus:text-white"
            >
              Delete
            </DropdownMenuItem>
            <DropdownMenuItem>
              Cancel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </footer>
    </div>
  );
}
