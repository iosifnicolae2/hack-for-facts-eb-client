import { z } from 'zod';
import { StaticSeriesConfigurationSchema } from '@/schemas/charts';
import { useChartStore } from '../../hooks/useChartStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatasetList } from './DatasetList';
import { OptionItem } from '@/components/filters/base-filter/interfaces';
import { useDatasetStore } from '@/hooks/filters/useDatasetStore';

interface StaticSeriesEditorProps {
  series: z.infer<typeof StaticSeriesConfigurationSchema>;
}

export function StaticSeriesEditor({ series }: StaticSeriesEditorProps) {
  const { updateSeries } = useChartStore();
  const { get: getDataset } = useDatasetStore(series.datasetId ? [series.datasetId] : []);
  const dataset = series.datasetId ? getDataset(series.datasetId) : null;

  const handleDatasetChange = (dataset: OptionItem) => {
    updateSeries(series.id, { 
      datasetId: dataset.id as string,
      label: dataset.label,
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
          selectedOptions={series.datasetId ? [{ id: series.datasetId, label: dataset?.name ?? '' }] : []}
          toggleSelect={handleDatasetChange}
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
