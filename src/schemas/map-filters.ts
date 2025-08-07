import { z } from 'zod';
import { defaultYearRange } from '@/schemas/charts';

const AccountCategoryEnum = z.enum(["ch", "vn"]);
const NormalizationEnum = z.enum(["total", "per_capita"]);
const MapViewEnum = z.enum(["map", "table", "chart"]);
const MapViewTypeEnum = z.enum(["UAT", "Judet"]);


export const mapFiltersSchema = z.object({
  functional_codes: z.array(z.string()).optional(),
  account_categories: z.array(AccountCategoryEnum).default(["ch"]),
  normalization: NormalizationEnum.default("per_capita"),
  years: z.array(z.number()).default([defaultYearRange.end]),
  economic_codes: z.array(z.string()).optional(),
  min_amount: z.string().optional(),
  max_amount: z.string().optional(),
  min_population: z.string().optional(),
  max_population: z.string().optional(),
  county_codes: z.array(z.string()).optional(),
  regions: z.array(z.string()).optional(),
});

export const mapStateSchema = z.object({
  filters: mapFiltersSchema.default({}),
  activeView: MapViewEnum.default("map"),
  mapViewType: MapViewTypeEnum.default("UAT"),
});

export type MapFilters = z.infer<typeof mapFiltersSchema>;
export type MapState = z.infer<typeof mapStateSchema>;

