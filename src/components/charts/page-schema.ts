import { z } from "zod";
import { ChartSchema } from "@/schemas/charts";

export const chartUrlStateSchema = z.object({
  chart: ChartSchema,
  view: z.enum(["overview", "config", "series-config", "annotation-config"]).default("overview"),
  seriesId: z.string().optional(),
  annotationId: z.string().optional(),
});

export type ChartUrlState = z.infer<typeof chartUrlStateSchema>;