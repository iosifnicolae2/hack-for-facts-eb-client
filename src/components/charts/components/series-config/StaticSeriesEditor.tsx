import { z } from 'zod';
import { StaticSeriesConfigurationSchema } from '@/schemas/charts';
import { useChartStore } from '../../hooks/useChartStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DatasetList } from './DatasetList';
import { AxisInfo } from './AxisInfo';
import { useDatasetStore } from '@/hooks/filters/useDatasetStore';
import { Dataset } from '@/lib/api/datasets';
import { Trans } from '@lingui/react/macro';

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
      unit: dataset.yAxis.unit,
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
            <CardContent className="p-4 space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">{dataset.description}</p>
                <p>
                  <Trans>Source</Trans>:{" "}
                  <a
                    href={dataset.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground transition-colors"
                  >
                    {dataset.sourceName}
                  </a>
                </p>
              </div>

              <Separator />

              <AxisInfo
                xAxis={dataset.xAxis}
                yAxis={dataset.yAxis}
                variant="full"
              />
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
