// src/components/charts/ChartFiltersOverview.tsx

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Chart } from "@/schemas/charts";
import { Edit, FilterIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SeriesFilterDisplay } from "./SeriesFilterDisplay";
import { Button } from "../../../ui/button";
import { usePersistedState } from "@/lib/hooks/usePersistedState";
import { Trans } from "@lingui/react/macro";

export function ChartFiltersOverview({
  chart,
  onFilterClick,
}: {
  chart: Chart;
  onFilterClick: (seriesId: string) => void;
}) {
  const activeSeries = chart.series.filter(
    (s) => s.enabled
  );

  const totalFilters = activeSeries.length;

  const [isFiltersOpen, setIsFiltersOpen] = usePersistedState("chart-filters-summary-open", false);

  const handleAccordionChange = (value: string) => {
    const isFiltersOpen = value === "filters";
    setIsFiltersOpen(isFiltersOpen);
  };

  if (activeSeries.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto bg-muted rounded-full p-3 w-fit mb-2">
            <FilterIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-base font-normal text-muted-foreground">
            <Trans>No Filters Applied</Trans>
          </CardTitle>
          <CardDescription>
            <Trans>Filters applied to data series will appear here.</Trans>
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
                <Trans>Filters info</Trans>{" "}
                <span className="text-muted-foreground font-normal text-sm">
                  ({totalFilters})
                </span>
              </CardTitle>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pb-6">
              {activeSeries.map((series) => (
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
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                  <SeriesFilterDisplay series={series} chart={chart} />
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
