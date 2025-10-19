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
import { getPeriodTags } from "@/lib/period-utils";
import { useChartStore } from "../../hooks/useChartStore";
import { ReportPeriodInput } from "@/schemas/reporting";


interface LineItemsAggregatedYearlySeriesFilterProps {
  series: SeriesConfiguration;
}

export function LineItemsAggregatedYearlySeriesFilter({ series }: LineItemsAggregatedYearlySeriesFilterProps) {
  const { updateSeries } = useChartStore();
  const filters: FiltersWithLabels = {
    entity_cuis: series.filter.entity_cuis ?? [],
    main_creditor_cui: series.filter.main_creditor_cui,
    economic_codes: series.filter.economic_codes ?? [],
    functional_codes: series.filter.functional_codes ?? [],
    functional_prefixes: (series.filter as any).functional_prefixes ?? [],
    economic_prefixes: (series.filter as any).economic_prefixes ?? [],
    budget_sector_ids: series.filter.budget_sector_ids ?? [],
    funding_source_ids: series.filter.funding_source_ids ?? [],
    uat_ids: series.filter.uat_ids ?? [],
  };
  const { mapValueToLabel } = useMapFilterValue(filters);
  const filterKeyMap = useFilterKeyLabel();

  const handleRemovePeriodTag = (tagToRemove: string) => {
    if (!series.filter.report_period) return;

    if (series.filter.report_period.selection.dates) {
        const newDates = series.filter.report_period.selection.dates.filter(d => d !== tagToRemove);
        updateSeries(series.id, (prev) => {
            if (prev.type === 'line-items-aggregated-yearly' && prev.filter.report_period) {
                prev.filter.report_period = {
                    ...prev.filter.report_period,
                    selection: { dates: newDates }
                };
            }
            return prev;
        });
    } else if (series.filter.report_period.selection.interval) {
        updateSeries(series.id, (prev) => {
            if (prev.type === 'line-items-aggregated-yearly') {
                prev.filter.report_period = undefined;
            }
            return prev;
        });
    }
  }

  const periodTags = getPeriodTags(series.filter.report_period as ReportPeriodInput);

  return (
    <div className="flex flex-wrap gap-2">
      {periodTags.map(tag => (
        <FilterPill
            key={tag.key}
            label={filterKeyMap('report_period')}
            value={String(tag.value)}
            onRemove={() => handleRemovePeriodTag(String(tag.value))}
        />
      ))}
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
          if (key === 'report_period') return null;
          if (key === 'report_type') {
            return (
              <FilterPill
                key={key}
                label={filterKeyMap(key)}
                value={String(value)}
              />
            )
          }
          if (key === 'main_creditor_cui' && typeof value === 'string') {
            return (
              <FilterPill
                key={key}
                label={filterKeyMap(key)}
                value={mapValueToLabel(key, value)}
                href={createEntityUrl(String(value))}
              />
            );
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
