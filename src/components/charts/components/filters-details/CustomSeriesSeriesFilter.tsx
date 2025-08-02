import { z } from 'zod';
import { CustomSeriesConfigurationSchema } from "@/schemas/charts";
import { FilterPill } from "./FilterPill";
import { FilterValueDisplay } from "./FilterValueDisplay";

interface CustomSeriesSeriesFilterProps {
  series: z.infer<typeof CustomSeriesConfigurationSchema>;
}

export function CustomSeriesSeriesFilter({ series }: CustomSeriesSeriesFilterProps) {
  const dataPoints = series.data.map((d: { year: number; value: number }) => ({
    label: d.year.toString(),
    value: d.value.toString(),
  }));

  return (
    <div className="flex flex-wrap gap-2">
      <FilterPill label="Custom Data" value={<FilterValueDisplay value={dataPoints.map(d => `${d.label}: ${d.value}`)} />} />
    </div>
  );
}