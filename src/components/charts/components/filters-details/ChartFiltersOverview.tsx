// src/components/charts/ChartFiltersOverview.tsx

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AnalyticsFilterType, Chart } from "@/schemas/charts";
import { FilterIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FilterPill } from "./FilterPill";
import { FilterValueDisplay } from "./FilterValueDisplay";
import {
  createDataDiscoveryUrl,
  createEntityUrl,
  FiltersWithLabels,
  getFilterDisplayName,
  isInteractiveFilter,
  useMapFilterValue,
} from "@/lib/chart-filter-utils";
import { Button } from "../../../ui/button";
import { usePersistedState } from "@/lib/hooks/usePersistedState";

export function ChartFiltersOverview({
  chart,
  onFilterClick,
}: {
  chart: Chart;
  onFilterClick: (seriesId: string) => void;
}) {
  const filters: FiltersWithLabels = {
    entity_cuis: chart.series.flatMap(s => s.filter.entity_cuis ?? []),
    economic_codes: chart.series.flatMap(s => s.filter.economic_codes ?? []),
    functional_codes: chart.series.flatMap(s => s.filter.functional_codes ?? []),
    budget_sector_ids: chart.series.flatMap(s => s.filter.budget_sector_ids ?? []),
    funding_source_ids: chart.series.flatMap(s => s.filter.funding_source_ids ?? []),
    uat_ids: chart.series.flatMap(s => s.filter.uat_ids ?? []),
  }
  const [isFiltersOpen, setIsFiltersOpen] = usePersistedState("chart-filters-summary-open", false);
  const { mapValueToLabel } = useMapFilterValue(filters);
  const activeSeriesWithFilters = chart.series.filter(
    (s) => s.enabled && s.filter && Object.keys(s.filter).length > 0
  );

  const totalFilters = activeSeriesWithFilters.reduce(
    (acc, series) => acc + Object.keys(series.filter).length,
    0
  );

  const handleAccordionChange = (value: string) => {
    const isFiltersOpen = value === "filters";
    setIsFiltersOpen(isFiltersOpen);
  };

  if (activeSeriesWithFilters.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto bg-muted rounded-full p-3 w-fit mb-2">
            <FilterIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-base font-normal text-muted-foreground">
            No Filters Applied
          </CardTitle>
          <CardDescription>
            Filters applied to data series will appear here.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <Accordion type="single" collapsible className="w-full px-4" onValueChange={handleAccordionChange} defaultValue={isFiltersOpen ? "filters" : undefined}>
        <AccordionItem value="filters" className="border-none">
          <AccordionTrigger>
            <div className="flex items-center gap-3 w-full">
              <CardTitle>
                Filters info{" "}
                <span className="text-muted-foreground font-normal text-sm">
                  ({totalFilters})
                </span>
              </CardTitle>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pb-6">
              {activeSeriesWithFilters.map((series) => (
                <div
                  key={series.id}
                  className="pb-4 border-b border-border/60 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full border flex-shrink-0"
                        style={{
                          backgroundColor:
                            series.config.color || chart.config.color,
                        }}
                      />
                      <h4 className="font-semibold text-card-foreground">
                        {series.label}
                      </h4>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFilterClick(series.id)}
                    >
                      Edit
                    </Button>
                  </div>
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
                        if (key === "entity_cuis" && Array.isArray(value)) {
                          return value.map((cui) => (
                            <FilterPill
                              key={String(cui)}
                              label={getFilterDisplayName(key)}
                              value={mapValueToLabel(key, cui)}
                              href={createEntityUrl(String(cui))}
                            />
                          ));
                        }

                        return (
                          <FilterPill
                            key={key}
                            label={getFilterDisplayName(key)}
                            value={<FilterValueDisplay value={Array.isArray(value) ? value.map(v => mapValueToLabel(key, v)).join(", ") : mapValueToLabel(key, value)} />}
                            href={
                              isInteractiveFilter(key)
                                ? createDataDiscoveryUrl(key, value)
                                : undefined
                            }
                          />
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

function getSortOrder(keyA: keyof AnalyticsFilterType, keyB: keyof AnalyticsFilterType) {
  const order = ["account_category", "entity_cuis", "entity_types", "uat_ids", "functional_prefixes", "economic_prefixes", "functional_codes", "economic_codes", "budget_sector_ids", "funding_source_ids", "is_uat", "min_amount", "max_amount", "report_type", "years"] as Array<keyof AnalyticsFilterType>;
  const indexA = order.indexOf(keyA);
  const indexB = order.indexOf(keyB);


  if (indexA === -1 && indexB === -1) {
    console.log(keyA, keyB, "are no order");
    return 0;
  }
  if (indexA === -1) {
    console.log(keyA, "is not in order");
    return 1;
  }
  if (indexB === -1) {
    console.log(keyB, "is not in order");
    return -1;
  }
  return indexA - indexB;
}