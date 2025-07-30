// src/components/charts/ChartFiltersOverview.tsx

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Chart } from "@/schemas/charts";
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
  getFilterDisplayName,
  isEntityCui,
  isInteractiveFilter,
} from "@/lib/chart-filter-utils";
import { Button } from "../../../ui/button";

export function ChartFiltersOverview({
  chart,
  onFilterClick,
}: {
  chart: Chart;
  onFilterClick: (seriesId: string) => void;
}) {
  const activeSeriesWithFilters = chart.series.filter(
    (s) => s.enabled && s.filter && Object.keys(s.filter).length > 0
  );

  const totalFilters = activeSeriesWithFilters.reduce(
    (acc, series) => acc + Object.keys(series.filter).length,
    0
  );

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
      <Accordion type="single" collapsible className="w-full px-4">
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
                      .filter(
                        ([, value]) =>
                          value !== undefined &&
                          value !== null &&
                          (Array.isArray(value)
                            ? value.length > 0
                            : String(value) !== "")
                      )
                      .map(([key, value]) => {
                        if (isEntityCui(key) && Array.isArray(value)) {
                          return value.map((cui) => (
                            <FilterPill
                              key={String(cui)}
                              label={getFilterDisplayName(key)}
                              value={String(cui)}
                              href={createEntityUrl(String(cui))}
                            />
                          ));
                        }

                        return (
                          <FilterPill
                            key={key}
                            label={getFilterDisplayName(key)}
                            value={<FilterValueDisplay value={value} />}
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