import { z } from 'zod';
import { CustomSeriesValueConfigurationSchema } from "@/schemas/charts";
import { FilterPill } from "./FilterPill";
import { FilterValueDisplay } from "./FilterValueDisplay";

interface CustomSeriesValueSeriesFilterProps {
  series: z.infer<typeof CustomSeriesValueConfigurationSchema>;
}

export function CustomSeriesValueSeriesFilter({ series }: CustomSeriesValueSeriesFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <FilterPill label="Constant Value" value={<FilterValueDisplay value={series.value.toString()} />} />
    </div>
  );
}
