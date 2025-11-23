import { createFileRoute } from '@tanstack/react-router';
import { ViewLoading } from '@/components/ui/ViewLoading';
import { z } from 'zod';
import { entityDetailsQueryOptions } from '@/lib/hooks/useEntityDetails';
import { queryClient } from '@/lib/queryClient';
import { entitySearchSchema } from '@/components/entities/validation';
import { AnalyticsFilterType, AnalyticsInput, defaultYearRange, Normalization } from '@/schemas/charts';
import { geoJsonQueryOptions } from '@/hooks/useGeoJson';
import { heatmapJudetQueryOptions, heatmapUATQueryOptions } from '@/hooks/useHeatmapData';
import { getTopFunctionalGroupCodes } from '@/lib/analytics-utils';
import { getChartAnalytics } from '@/lib/api/charts';
import { generateHash } from '@/lib/utils';
import { GqlReportType, toReportTypeValue } from '@/schemas/reporting';
import { getInitialFilterState, makeTrendPeriod } from '@/schemas/reporting';
import { prepareFilterForServer, withDefaultExcludes } from '@/lib/filterUtils';
import { getPersistedState } from '@/lib/hooks/usePersistedState';
import type { EntityDetailsData } from '@/lib/api/entities';
import { DEFAULT_EXPENSE_EXCLUDE_ECONOMIC_PREFIXES, DEFAULT_INCOME_EXCLUDE_FUNCTIONAL_PREFIXES } from '@/lib/analytics-defaults';

export type EntitySearchSchema = z.infer<typeof entitySearchSchema>;

export const Route = createFileRoute('/entities/$cui')({
    validateSearch: entitySearchSchema,
    beforeLoad: ({ params, search }) => {
        const START_YEAR = defaultYearRange.start;
        const END_YEAR = defaultYearRange.end;
        const year = (search?.year as number | undefined) ?? END_YEAR;
        const userCurrency = getPersistedState<'RON' | 'EUR'>('user-currency', 'RON');
        const defaultNormalization: Normalization = userCurrency === 'EUR' ? 'total_euro' : 'total';
        const normalization = (search?.normalization as Normalization | undefined) ?? defaultNormalization;
        const reportPeriod = getInitialFilterState(search.period ?? 'YEAR', year, search.month ?? '12', search.quarter ?? 'Q4');
        const trendPeriod = makeTrendPeriod(search.period ?? 'YEAR', year, START_YEAR, END_YEAR);
        const reportType = (search?.report_type as GqlReportType | undefined);
        const mainCreditorCui = (search?.main_creditor_cui as string | undefined);
        // Warm entity details in cache
        const detailsOptions = entityDetailsQueryOptions(
            params.cui,
            normalization,
            reportPeriod,
            reportType,
            trendPeriod,
            mainCreditorCui
        );
        queryClient.ensureQueryData(detailsOptions);

        const desiredView = (search?.view as string | undefined) ?? 'overview';
        const entity = queryClient.getQueryData<EntityDetailsData>(detailsOptions.queryKey);

        if (desiredView === 'map' && entity?.is_uat) {
            const mapViewType = entity.entity_type === 'admin_county_council' || entity.cui === '4267117' ? 'County' : 'UAT';
            queryClient.prefetchQuery(geoJsonQueryOptions(mapViewType));
            const filters = (search?.mapFilters as AnalyticsFilterType) || withDefaultExcludes({
                account_category: 'ch',
                normalization: 'per_capita',
                report_period: getInitialFilterState('YEAR', year, '12', 'Q4'),
            });
            if (mapViewType === 'UAT') {
                queryClient.prefetchQuery(heatmapUATQueryOptions(filters));
            } else {
                queryClient.prefetchQuery(heatmapJudetQueryOptions(filters));
            }
        }

        if (desiredView === 'income-trends' || desiredView === 'expense-trends') {
            const accountCategory: 'vn' | 'ch' = desiredView === 'income-trends' ? 'vn' : 'ch';
            const lineItems = entity?.executionLineItems?.nodes ?? [];
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
                        report_type: entity?.default_report_type ? toReportTypeValue(entity.default_report_type) : 'Executie bugetara agregata la nivel de ordonator principal',
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
                queryClient.prefetchQuery({
                    queryKey: ['chart-data', hash],
                    queryFn: () => getChartAnalytics(inputs),
                    staleTime: 1000 * 60 * 60 * 24,
                    gcTime: 1000 * 60 * 60 * 24 * 3,
                } as Parameters<typeof queryClient.prefetchQuery>[0]);
            }
        }
    },
    pendingComponent: ViewLoading,
    component: () => null,
});
