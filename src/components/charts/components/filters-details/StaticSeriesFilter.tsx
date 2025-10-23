import { StaticSeriesConfiguration } from "@/schemas/charts";
import { useDatasetStore } from "@/hooks/filters/useDatasetStore";
import { Chart } from "@/schemas/charts";
import { AxisInfo } from "../series-config/AxisInfo";
import { Trans } from "@lingui/react/macro";

interface StaticSeriesFilterProps {
  series: StaticSeriesConfiguration;
  chart: Chart;
}

export function StaticSeriesFilter({ series, chart }: StaticSeriesFilterProps) {
  // Series ids used to load the initial data
  const staticSeriesIds = chart.series
    .filter(s => s.type === "static-series")
    .map(s => s.seriesId)
    .filter(id => id !== undefined);

  const { get: getDataset } = useDatasetStore(staticSeriesIds);
  const dataset = series.seriesId ? getDataset(series.seriesId) : null;

  if (!dataset) {
    return null;
  }

  return (
    <div className="w-full space-y-3">
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

      <AxisInfo
        xAxis={dataset.xAxis}
        yAxis={dataset.yAxis}
        variant="compact"
      />
    </div>
  );
}
