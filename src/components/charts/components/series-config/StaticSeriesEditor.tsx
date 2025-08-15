import { z } from 'zod';
import { StaticSeriesConfigurationSchema } from '@/schemas/charts';
import { useChartStore } from '../../hooks/useChartStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatasetList } from './DatasetList';
import { useDatasetStore } from '@/hooks/filters/useDatasetStore';
import { Dataset } from '@/lib/api/datasets';

interface StaticSeriesEditorProps {
  series: z.infer<typeof StaticSeriesConfigurationSchema>;
}

export function StaticSeriesEditor({ series }: StaticSeriesEditorProps) {
  const { updateSeries } = useChartStore();
  const { get: getDataset, add: addDatasets } = useDatasetStore(series.seriesId ? [series.seriesId] : []);
  const dataset = series.seriesId ? getDataset(series.seriesId) : null;

  const handleDatasetChange = (dataset: Dataset) => {
    updateSeries(series.id, { 
      seriesId: dataset.id,
      label: dataset.name,
      unit: dataset.unit,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dataset Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DatasetList
          selectedOptions={series.seriesId ? [{ id: series.seriesId, label: dataset?.name ?? '' }] : []}
          toggleSelect={handleDatasetChange}
          addDatasets={addDatasets}
        />
        {dataset && (
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-base">{dataset.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm text-muted-foreground">
              <p className="mb-2">{dataset.description}</p>
              <p>
                Source:{" "}
                <a
                  href={dataset.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {dataset.sourceName}
                </a>
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
