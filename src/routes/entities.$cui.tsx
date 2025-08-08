import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { entityDetailsQueryOptions } from '@/lib/hooks/useEntityDetails';
import { queryClient } from '@/lib/queryClient';
import { entitySearchSchema } from '@/components/entities/validation';
import { defaultYearRange } from '@/schemas/charts';
import { geoJsonQueryOptions } from '@/hooks/useGeoJson';
import { heatmapJudetQueryOptions, heatmapUATQueryOptions } from '@/hooks/useHeatmapData';
import { getTopFunctionalGroupCodes } from '@/lib/analytics-utils';
import { getChartAnalytics } from '@/lib/api/charts';
import { generateHash } from '@/lib/utils';

export type EntitySearchSchema = z.infer<typeof entitySearchSchema>;

export const Route = createFileRoute('/entities/$cui')({
    validateSearch: entitySearchSchema,
    beforeLoad: async ({ params, search }) => {
        const START_YEAR = defaultYearRange.start;
        const END_YEAR = defaultYearRange.end;
        const year = (search?.year as number | undefined) ?? END_YEAR;
        await queryClient.prefetchQuery(
            entityDetailsQueryOptions(params.cui, year, START_YEAR, END_YEAR)
        );

        const desiredView = (search?.view as string | undefined) ?? 'overview';
        const entity = queryClient.getQueryData<{
            is_uat?: boolean | null;
            entity_type?: string | null;
            cui: string;
            is_main_creditor?: boolean | null;
            executionLineItems?: { nodes?: { account_category: 'vn' | 'ch' }[] } | null;
        }>(['entityDetails', params.cui, year, START_YEAR, END_YEAR]);

        if (desiredView === 'map' && entity?.is_uat) {
            const mapViewType = entity.entity_type === 'admin_county_council' || entity.cui === '4267117' ? 'Judet' : 'UAT';
            await queryClient.prefetchQuery(geoJsonQueryOptions(mapViewType));
            const filters = (search?.mapFilters as { years: number[]; account_categories: ('ch' | 'vn')[]; normalization: 'per_capita' | 'total' }) || { years: [year], account_categories: ['ch'] as ('ch' | 'vn')[], normalization: 'per_capita' as const };
            if (mapViewType === 'UAT') {
                await queryClient.prefetchQuery(heatmapUATQueryOptions(filters));
            } else {
                await queryClient.prefetchQuery(heatmapJudetQueryOptions(filters));
            }
        }

        if (desiredView === 'income-trends' || desiredView === 'expense-trends') {
            const accountCategory: 'vn' | 'ch' = desiredView === 'income-trends' ? 'vn' : 'ch';
            const lineItems = entity?.executionLineItems?.nodes ?? [];
            type MinimalLineItem = { account_category: 'vn' | 'ch'; amount: number; functionalClassification?: { functional_code?: string | null } };
            const filtered = (lineItems as MinimalLineItem[]).filter((li) => li.account_category === accountCategory);
            const topGroups: string[] = getTopFunctionalGroupCodes(filtered as unknown as import('@/lib/api/entities').ExecutionLineItem[], 10);
            if (topGroups.length > 0) {
                const inputs: import('@/schemas/charts').AnalyticsInput[] = topGroups.map((prefix: string) => ({
                    seriesId: `${prefix}${params.cui}-${desiredView === 'income-trends' ? 'income' : 'expense'}`,
                    filter: {
                        entity_cuis: [params.cui],
                        functional_prefixes: [prefix],
                        account_category: accountCategory,
                        report_type: (entity?.is_main_creditor ? 'Executie bugetara agregata la nivel de ordonator principal' : 'Executie bugetara detaliata') as 'Executie bugetara agregata la nivel de ordonator principal' | 'Executie bugetara detaliata',
                    },
                }));
                const payloadHash = inputs
                    .slice()
                    .sort((a, b) => a.seriesId.localeCompare(b.seriesId))
                    .reduce((acc, input) => acc + input.seriesId + '::' + JSON.stringify(input.filter), '');
                const hash = generateHash(payloadHash);
                await queryClient.prefetchQuery({
                    queryKey: ['chart-data', hash],
                    queryFn: () => getChartAnalytics(inputs),
                    staleTime: 1000 * 60 * 60 * 24,
                    gcTime: 1000 * 60 * 60 * 24 * 3,
                } as Parameters<typeof queryClient.prefetchQuery>[0]);
            }
        }
    },
    component: () => null,
});