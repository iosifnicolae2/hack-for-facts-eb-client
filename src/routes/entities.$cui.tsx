import { createFileRoute } from '@tanstack/react-router';
import { ViewLoading } from '@/components/ui/ViewLoading';
import { z } from 'zod';
import { entityDetailsQueryOptions } from '@/lib/hooks/useEntityDetails';
import { entitySearchSchema } from '@/components/entities/validation';
import { AnalyticsFilterType, AnalyticsInput, Currency, defaultYearRange, Normalization } from '@/schemas/charts';
import { geoJsonQueryOptions } from '@/hooks/useGeoJson';
import { heatmapJudetQueryOptions, heatmapUATQueryOptions } from '@/hooks/useHeatmapData';
import { getTopFunctionalGroupCodes } from '@/lib/analytics-utils';
import { getChartAnalytics } from '@/lib/api/charts';
import { generateHash } from '@/lib/utils';
import { GqlReportType, toReportTypeValue } from '@/schemas/reporting';
import { getInitialFilterState, makeTrendPeriod } from '@/schemas/reporting';
import { prepareFilterForServer, withDefaultExcludes } from '@/lib/filterUtils';
import { readUserCurrencyPreference, readUserInflationAdjustedPreference } from '@/lib/user-preferences';
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
    loader: async ({ context, params, location, preload }) => {
        const { queryClient } = context;
        const shouldPrefetchData = !preload || !import.meta.env.DEV;

        if (!shouldPrefetchData) {
            return { ssrParams: undefined };
        }

        const search = entitySearchSchema.parse(location.search);
        const START_YEAR = defaultYearRange.start;
        const END_YEAR = defaultYearRange.end;
        const year = (search?.year as number | undefined) ?? END_YEAR;
        // Read user preferences from cookies for SSR to match client-side values
        const userCurrencyPreference = await readUserCurrencyPreference();
        const userInflationPreference = await readUserInflationAdjustedPreference();
        const currencyParam = (search?.currency as Currency | undefined);
        const inflationAdjustedParam = (search as any)?.inflation_adjusted as boolean | undefined;
        const normalizationRaw = (search?.normalization as Normalization | undefined) ?? 'total';
        const showPeriodGrowth = Boolean((search as any).show_period_growth);

        const normalization: Normalization = (() => {
            if (normalizationRaw === 'total_euro') return 'total';
            if (normalizationRaw === 'per_capita_euro') return 'per_capita';
            return normalizationRaw;
        })();
        const currency: Currency =
            normalizationRaw === 'total_euro' || normalizationRaw === 'per_capita_euro'
                ? 'EUR'
                : (currencyParam ?? userCurrencyPreference);
        const inflationAdjusted =
            normalization === 'percent_gdp'
                ? false
                : (inflationAdjustedParam ?? userInflationPreference);

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

        const detailsOptions = entityDetailsQueryOptions(ssrParams);

        await queryClient.ensureQueryData(detailsOptions);

        const desiredView = (search?.view as string | undefined) ?? 'overview';
        const entity = queryClient.getQueryData<EntityDetailsData>(detailsOptions.queryKey);

        if (!entity) {
            return { ssrParams };
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

        return { ssrParams };
    },
    pendingComponent: ViewLoading,
    component: () => null,
});
