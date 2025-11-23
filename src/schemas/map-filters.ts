import { z } from 'zod';
import { AnalyticsFilterSchema, AnalyticsFilterType, defaultYearRange } from '@/schemas/charts';
import { withDefaultExcludes } from '@/lib/filterUtils';

const MapViewEnum = z.enum(["map", "table", "chart"]);
const MapViewTypeEnum = z.enum(["UAT", "County"]);

export const defaultMapFilters: AnalyticsFilterType = withDefaultExcludes({
  account_category: 'ch',
  report_period: {
    type: 'YEAR',
    selection: { dates: [String(defaultYearRange.end)] },
  },
  normalization: 'total',
  is_uat: true,
  report_type: 'Executie bugetara agregata la nivel de ordonator principal',
})

export const MapStateSchema = z.object({
  filters: AnalyticsFilterSchema.default(defaultMapFilters),
  activeView: MapViewEnum.default("map"),
  mapViewType: MapViewTypeEnum.default("UAT"),
  // Persist and restore map view state via URL
  mapCenter: z.tuple([z.number(), z.number()]).optional(),
  mapZoom: z.number().optional(),
});

export type MapUrlState = z.infer<typeof MapStateSchema>;
