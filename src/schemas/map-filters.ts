import { z } from 'zod';
import { AnalyticsFilterSchema, defaultYearRange } from '@/schemas/charts';

const MapViewEnum = z.enum(["map", "table", "chart"]);
const MapViewTypeEnum = z.enum(["UAT", "Judet"]);


export const MapStateSchema = z.object({
  filters: AnalyticsFilterSchema.default({
    account_category: 'ch',
    years: [defaultYearRange.end],
    normalization: 'total',
    is_uat: true,
    report_type: 'Executie bugetara agregata la nivel de ordonator principal',
  }),
  activeView: MapViewEnum.default("map"),
  mapViewType: MapViewTypeEnum.default("UAT"),
});

export type MapUrlState = z.infer<typeof MapStateSchema>;

