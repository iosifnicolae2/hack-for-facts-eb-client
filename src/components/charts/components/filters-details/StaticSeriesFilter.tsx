import { StaticSeriesConfiguration } from "@/schemas/charts";
import { useDatasetStore } from "@/hooks/filters/useDatasetStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StaticSeriesFilterProps {
  series: StaticSeriesConfiguration;
}

export function StaticSeriesFilter({ series }: StaticSeriesFilterProps) {
  const { get: getDataset } = useDatasetStore(series.datasetId ? [series.datasetId] : []);
  const dataset = series.datasetId ? getDataset(series.datasetId) : null;

  if (!dataset) {
    return null;
  }

  return (
    <div className="w-full text-sm text-muted-foreground">
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
    </div>
  );
}
