import { createFileRoute } from '@tanstack/react-router';
import { ViewLoading } from '@/components/ui/ViewLoading';
import { z } from 'zod';
import { entityDetailsQueryOptions } from '@/lib/hooks/useEntityDetails';
import { entitySearchSchema } from '@/components/entities/validation';
import { AnalyticsFilterType, AnalyticsInput, Currency, defaultYearRange } from '@/schemas/charts';
import { geoJsonQueryOptions } from '@/hooks/useGeoJson';
import { heatmapJudetQueryOptions, heatmapUATQueryOptions } from '@/hooks/useHeatmapData';
import { getTopFunctionalGroupCodes } from '@/lib/analytics-utils';
import { getChartAnalytics } from '@/lib/api/charts';
import { generateHash } from '@/lib/utils';
import { GqlReportType, toReportTypeValue } from '@/schemas/reporting';
import { getInitialFilterState, makeTrendPeriod } from '@/schemas/reporting';
import { prepareFilterForServer, withDefaultExcludes } from '@/lib/filterUtils';
// NOTE: We intentionally do NOT read cookies during SSR for data fetching.
// CDN caches based on URL only - reading cookies would cause cache pollution
// (same URL with different cookies = same cache entry = wrong data).
// However, during client-side navigation/prefetch, we CAN read cookies since
// there's no CDN concern - this ensures prefetch uses correct user preference.
import { parseCurrencyParam, parseBooleanParam, DEFAULT_CURRENCY, DEFAULT_INFLATION_ADJUSTED, resolveNormalizationSettings, type NormalizationInput } from '@/lib/globalSettings/params';
import { readClientCurrencyPreference, readClientInflationAdjustedPreference } from '@/lib/user-preferences';
import type { EntityDetailsData } from '@/lib/api/entities';
import { DEFAULT_EXPENSE_EXCLUDE_ECONOMIC_PREFIXES, DEFAULT_INCOME_EXCLUDE_FUNCTIONAL_PREFIXES } from '@/lib/analytics-defaults';

export type EntitySearchSchema = z.infer<typeof entitySearchSchema>;

export const Route = createFileRoute('/entities/$cui')({
    headers: () => ({
        // Browser: don't cache; CDN: cache 5 min; allow serving stale while revalidating
        "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
        // Vercel-specific header for explicit CDN control
        "Vercel-CDN-Cache-Control": "max-age=300, stale-while-revalidate=86400",
    }),
    validateSearch: entitySearchSchema,
    loader: async ({ context, params, location }) => {
        const { queryClient } = context;

        const search = entitySearchSchema.parse(location.search);
        const START_YEAR = defaultYearRange.start;
        const END_YEAR = defaultYearRange.end;
        const year = (search?.year as number | undefined) ?? END_YEAR;

        // 1. Parse URL params for data fetching
        // NOTE: We use URL params only (no cookies) to ensure CDN cacheability.
        // Same URL = same cache entry. Client syncs user prefs to URL after hydration.
        const urlCurrency = parseCurrencyParam(search?.currency);
        const urlInflation = parseBooleanParam((search as { inflation_adjusted?: unknown })?.inflation_adjusted);

        // 2. Parse normalization and compute forced overrides
        const normalizationRaw = (search?.normalization as NormalizationInput | undefined) ?? 'total';
        const showPeriodGrowth = Boolean((search as { show_period_growth?: unknown }).show_period_growth);

        const { normalization, forcedOverrides: { currency: forcedCurrency, inflationAdjusted: forcedInflation } } =
            resolveNormalizationSettings(normalizationRaw);

        // 3. Effective values for data fetching: Forced > URL > Client Preference > Default
        // On client (navigation/prefetch): read user preference for correct prefetch cache hits
        // On server (SSR): use default for CDN cacheability (same URL = same cache entry)
        const isClient = typeof globalThis.window !== 'undefined';
        const clientCurrency = isClient ? readClientCurrencyPreference() : null;
        const clientInflation = isClient ? readClientInflationAdjustedPreference() : null;
        const currency: Currency = forcedCurrency ?? urlCurrency ?? clientCurrency ?? DEFAULT_CURRENCY;
        const inflationAdjusted: boolean = forcedInflation ?? urlInflation ?? clientInflation ?? DEFAULT_INFLATION_ADJUSTED;

        const reportPeriod = getInitialFilterState(search.period ?? 'YEAR', year, search.month ?? '01', search.quarter ?? 'Q1');
        const trendPeriod = makeTrendPeriod(search.period ?? 'YEAR', year, START_YEAR, END_YEAR);
        const reportType = (search?.report_type as GqlReportType | undefined);
        const mainCreditorCui = (search?.main_creditor_cui as string | undefined);

        // Build SSR params to return to client for placeholder derivation
        const ssrParams = {
            cui: params.cui,
            normalization,
            currency,
            inflation_adjusted: inflationAdjusted,
            show_period_growth: showPeriodGrowth,
            reportPeriod,
            reportType,
            trendPeriod,
            mainCreditorCui,
        };

        // SSR settings for useGlobalSettings hook
        // Must match the actual currency used for data fetching so display label matches data values
        const ssrSettings = {
            currency,
            inflationAdjusted,
        };

        // Forced overrides for useGlobalSettings hook
        const forcedOverrides = {
            currency: forcedCurrency,
            inflationAdjusted: forcedInflation,
        };

        const detailsOptions = entityDetailsQueryOptions(ssrParams);

        await queryClient.ensureQueryData(detailsOptions);

        const desiredView = (search?.view as string | undefined) ?? 'overview';
        const entity = queryClient.getQueryData<EntityDetailsData>(detailsOptions.queryKey);

        if (!entity) {
            return { ssrParams, ssrSettings, forcedOverrides };
        }

        if (desiredView === 'map' && entity.is_uat) {
            const mapViewType = entity.entity_type === 'admin_county_council' || entity.cui === '4267117' ? 'County' : 'UAT';
            // GeoJSON uses relative URLs that don't work during SSR, prefetch only on client
            if (typeof window !== 'undefined') {
                void queryClient.prefetchQuery(geoJsonQueryOptions(mapViewType));
            }
            const filters = (search?.mapFilters as AnalyticsFilterType) || withDefaultExcludes({
                account_category: 'ch',
                normalization: 'per_capita',
                currency,
                inflation_adjusted: inflationAdjusted,
                report_period: getInitialFilterState('YEAR', year, '12', 'Q4'),
            });
            if (mapViewType === 'UAT') {
                void queryClient.prefetchQuery(heatmapUATQueryOptions(filters));
            } else {
                void queryClient.prefetchQuery(heatmapJudetQueryOptions(filters));
            }
        }

        if (desiredView === 'income-trends' || desiredView === 'expense-trends') {
            const accountCategory: 'vn' | 'ch' = desiredView === 'income-trends' ? 'vn' : 'ch';
            const lineItems = entity.executionLineItems?.nodes ?? [];
            type MinimalLineItem = { account_category: 'vn' | 'ch'; amount: number; functionalClassification?: { functional_code?: string | null } };
            const filtered = (lineItems as MinimalLineItem[]).filter((li) => li.account_category === accountCategory);
            const topGroups: string[] = getTopFunctionalGroupCodes(filtered as unknown as import('@/lib/api/entities').ExecutionLineItem[], 10);
            if (topGroups.length > 0) {
                const defaultExclude = accountCategory === 'ch'
                    ? { economic_prefixes: [...DEFAULT_EXPENSE_EXCLUDE_ECONOMIC_PREFIXES] }
                    : { functional_prefixes: [...DEFAULT_INCOME_EXCLUDE_FUNCTIONAL_PREFIXES] };
                const baseInputs: AnalyticsInput[] = topGroups.map((prefix: string) => ({
                    seriesId: `${prefix}${params.cui}-${desiredView === 'income-trends' ? 'income' : 'expense'}`,
                    filter: {
                        entity_cuis: [params.cui],
                        functional_prefixes: [prefix],
                        account_category: accountCategory,
                        report_type: entity.default_report_type ? toReportTypeValue(entity.default_report_type) : 'Executie bugetara agregata la nivel de ordonator principal',
                        normalization,
                        currency,
                        inflation_adjusted: inflationAdjusted,
                        show_period_growth: showPeriodGrowth,
                        exclude: defaultExclude,
                    },
                }));
                const fallbackPeriod = makeTrendPeriod('YEAR', year, START_YEAR, END_YEAR);
                const inputs: AnalyticsInput[] = baseInputs.map((i) => ({
                    ...i,
                    filter: prepareFilterForServer(i.filter as unknown as AnalyticsFilterType, { period: fallbackPeriod }),
                }));
                const payloadHash = inputs
                    .slice()
                    .sort((a, b) => a.seriesId.localeCompare(b.seriesId))
                    .reduce((acc, input) => acc + input.seriesId + '::' + JSON.stringify(input.filter), '');
                const hash = generateHash(payloadHash);
                void queryClient.prefetchQuery({
                    queryKey: ['chart-data', hash],
                    queryFn: () => getChartAnalytics(inputs),
                    staleTime: 1000 * 60 * 60 * 24,
                    gcTime: 1000 * 60 * 60 * 24 * 3,
                } as Parameters<typeof queryClient.prefetchQuery>[0]);
            }
        }

        return { ssrParams, ssrSettings, forcedOverrides };
    },
    pendingComponent: ViewLoading,
    component: () => null,
});
