import { AnalyticsFilterType, SeriesConfiguration } from "@/schemas/charts";
import { FilterPill } from "./FilterPill";
import { FilterValueDisplay } from "./FilterValueDisplay";
import {
  createDataDiscoveryUrl,
  createEntityUrl,
  FiltersWithLabels,
  getSortOrder,
  isInteractiveFilter,
  useFilterKeyLabel,
  useMapFilterValue,
} from "@/lib/chart-filter-utils";


interface LineItemsAggregatedYearlySeriesFilterProps {
  series: SeriesConfiguration;
}

export function LineItemsAggregatedYearlySeriesFilter({ series }: LineItemsAggregatedYearlySeriesFilterProps) {
  const filters: FiltersWithLabels = {
    entity_cuis: series.filter.entity_cuis ?? [],
    economic_codes: series.filter.economic_codes ?? [],
    functional_codes: series.filter.functional_codes ?? [],
    budget_sector_ids: series.filter.budget_sector_ids ?? [],
    funding_source_ids: series.filter.funding_source_ids ?? [],
    uat_ids: series.filter.uat_ids ?? [],
  };
  const { mapValueToLabel } = useMapFilterValue(filters);
  const filterKeyMap = useFilterKeyLabel();

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(series.filter)
        .sort(([keyA], [keyB]) => getSortOrder(keyA as keyof AnalyticsFilterType, keyB as keyof AnalyticsFilterType))
        .filter(
          ([, value]) =>
            value !== undefined &&
            value !== null &&
            (Array.isArray(value)
              ? value.length > 0
              : String(value) !== "")
        )
        .map(([key, value]) => {
          if (key === 'report_type') {
            return (
              <FilterPill
                key={key}
                label={filterKeyMap(key)}
                value={String(value)}
              />
            )
          }
          if (key === "entity_cuis" && Array.isArray(value)) {
            return value.map((cui) => (
              <FilterPill
                key={String(cui)}
                label={filterKeyMap(key)}
                value={mapValueToLabel(key, cui)}
                href={createEntityUrl(String(cui))}
              />
            ));
          }

          return (
            <FilterPill
              key={key}
              label={filterKeyMap(key)}
              value={<FilterValueDisplay value={Array.isArray(value) ? value.map(v => mapValueToLabel(key, v)).join(", ") : mapValueToLabel(key, value)} />}
              href={
                isInteractiveFilter(key)
                  ? createDataDiscoveryUrl(key, value)!
                  : undefined
              }
            />
          );
        })}
    </div>
  );
}