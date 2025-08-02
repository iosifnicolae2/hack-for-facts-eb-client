import { Chart, Series } from "@/schemas/charts";
import { LineItemsAggregatedYearlySeriesFilter } from "./LineItemsAggregatedYearlySeriesFilter";
import { AggregatedSeriesCalculationSeriesFilter } from "./AggregatedSeriesCalculationSeriesFilter";
import { CustomSeriesSeriesFilter } from "./CustomSeriesSeriesFilter";

interface SeriesFilterDisplayProps {
  series: Series;
  chart: Chart;
}

export function SeriesFilterDisplay({ series, chart }: SeriesFilterDisplayProps) {
  switch (series.type) {
    case "line-items-aggregated-yearly":
      return <LineItemsAggregatedYearlySeriesFilter series={series} />;
    case "aggregated-series-calculation":
      return <AggregatedSeriesCalculationSeriesFilter series={series} chart={chart} />;
    case "custom-series":
      return <CustomSeriesSeriesFilter series={series} />;
    default:
      return null;
  }
}