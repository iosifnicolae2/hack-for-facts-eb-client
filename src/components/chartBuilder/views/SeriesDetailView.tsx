import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Settings } from 'lucide-react';
import { SeriesConfiguration } from '@/schemas/chartBuilder';
import { useChartBuilder } from '../hooks/useChartBuilder';
import { SeriesFilter } from '../SeriesFilter';

export function SeriesDetailView() {
  const { chart, seriesId, updateSeries, deleteSeries, goToOverview } = useChartBuilder();
  const series = chart.series.find(s => s.id === seriesId)



  // Update series label with auto-save
  const updateSeriesField = (field: keyof SeriesConfiguration, value: string | object) => {
    if (!series) return;
    updateSeries(series.id, { [field]: value, updatedAt: new Date().toISOString() });
  };


  if (!series) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Series not found</p>
          <Button onClick={goToOverview} className="mt-4">
            Back to Overview
          </Button>
        </div>
      </div>
    );
  }

  const handleDeleteSeries = () => {
    // TODO: show confirmation dialog
    deleteSeries(series?.id || '');
    goToOverview();
  };

  return (
    <div className="space-y-6 p-1">

      {/* Series Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Series Configuration</CardTitle>
          <CardDescription>
            Configure the label and appearance for this data series. Changes are automatically saved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="series-label">Series Label *</Label>
            <Input
              id="series-label"
              value={series?.label || ''}
              onChange={(e) => updateSeriesField('label', e.target.value)}
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
                onChange={(e) => updateSeriesField('config', { ...series?.config, color: e.target.value })}
                className="w-12 h-8 rounded border cursor-pointer"
              />
              <span className="text-sm text-muted-foreground">
                {series?.config.color || chart.config.color}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Data Filters</CardTitle>
          <CardDescription>
            Use the filter options below to specify which data should be included in this series.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SeriesFilter seriesId={seriesId} />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button onClick={goToOverview} variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Back to Configuration
        </Button>

        <Button
          onClick={handleDeleteSeries}
          variant="destructive"
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete Series
        </Button>
      </div>
    </div>
  );
} 