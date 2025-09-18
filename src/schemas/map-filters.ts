import { z } from 'zod';
import { AnalyticsFilterSchema, AnalyticsFilterType, defaultYearRange } from '@/schemas/charts';
import { makeSingleTimePeriod, type DateInput } from '@/schemas/reporting';

const MapViewEnum = z.enum(["map", "table", "chart"]);
const MapViewTypeEnum = z.enum(["UAT", "County"]);

export const defaultMapFilters: AnalyticsFilterType = {
  account_category: 'ch',
  years: [defaultYearRange.end],
  report_period: makeSingleTimePeriod('YEAR', `${defaultYearRange.end}` as DateInput),
  normalization: 'total',
  is_uat: true,
  report_type: 'Executie bugetara agregata la nivel de ordonator principal',
}

export const MapStateSchema = z.object({
  filters: AnalyticsFilterSchema.default(defaultMapFilters),
  activeView: MapViewEnum.default("map"),
  mapViewType: MapViewTypeEnum.default("UAT"),
});

export type MapUrlState = z.infer<typeof MapStateSchema>;

